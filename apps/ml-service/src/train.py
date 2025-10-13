import os
from typing import Dict, Optional
import hydra
from omegaconf import DictConfig, OmegaConf
import mlflow
import torch
from transformers import Trainer, TrainingArguments
from sklearn.metrics import confusion_matrix, classification_report
import numpy as np
from seqeval.metrics import f1_score as ner_f1_score
from seqeval.metrics import precision_score, recall_score

from .dataset import LegalDatasetLoader, get_label_names
from .models import MultiTaskLegalModel, get_model_info

os.environ["TOKENIZERS_PARALLELISM"] = "false"


class MultiTaskMetrics:
    def __init__(self, label_names: Dict[str, list]):
        self.ner_labels = label_names["ner_labels"]
        self.risk_labels = label_names["risk_labels"]
    
    def compute_metrics(self, eval_pred):
        predictions, labels = eval_pred
        ner_logits, risk_logits = predictions
        ner_labels, risk_labels = labels
        
        ner_preds = np.argmax(ner_logits, axis=2)
        
        ner_true_labels = []
        ner_pred_labels = []
        
        for i in range(len(ner_labels)):
            true_seq = []
            pred_seq = []
            for j in range(len(ner_labels[i])):
                if ner_labels[i][j] != -100:
                    true_label = self.ner_labels[ner_labels[i][j]] if ner_labels[i][j] < len(self.ner_labels) else "O"
                    pred_label = self.ner_labels[ner_preds[i][j]] if ner_preds[i][j] < len(self.ner_labels) else "O"
                    true_seq.append(true_label)
                    pred_seq.append(pred_label)
            
            if true_seq:
                ner_true_labels.append(true_seq)
                ner_pred_labels.append(pred_seq)
        
        ner_precision = precision_score(ner_true_labels, ner_pred_labels) if ner_true_labels else 0.0
        ner_recall = recall_score(ner_true_labels, ner_pred_labels) if ner_true_labels else 0.0
        ner_f1 = ner_f1_score(ner_true_labels, ner_pred_labels) if ner_true_labels else 0.0
        
        risk_preds = np.argmax(risk_logits, axis=1)
        risk_acc = (risk_preds == risk_labels).mean()
        
        risk_report = classification_report(
            risk_labels,
            risk_preds,
            target_names=self.risk_labels,
            output_dict=True,
            zero_division=0
        )
        
        combined_f1 = (ner_f1 + risk_report["weighted avg"]["f1-score"]) / 2
        
        return {
            "ner_precision": ner_precision,
            "ner_recall": ner_recall,
            "ner_f1": ner_f1,
            "risk_accuracy": risk_acc,
            "risk_f1": risk_report["weighted avg"]["f1-score"],
            "risk_low_f1": risk_report.get("Low", {}).get("f1-score", 0.0),
            "risk_medium_f1": risk_report.get("Medium", {}).get("f1-score", 0.0),
            "risk_high_f1": risk_report.get("High", {}).get("f1-score", 0.0),
            "f1": combined_f1
        }


class MLflowCallback:
    def __init__(self, config: DictConfig):
        self.config = config
        self.setup_mlflow()
    
    def setup_mlflow(self):
        mlflow.set_tracking_uri(self.config.mlflow.tracking_uri)
        mlflow.set_experiment(self.config.mlflow.experiment_name)
        
        run_name = self.config.mlflow.run_name or f"{self.config.data.dataset_name}_{self.config.model.name.split('/')[-1]}"
        self.run = mlflow.start_run(run_name=run_name)
        
        mlflow.log_params({
            "model_name": self.config.model.name,
            "dataset": self.config.data.dataset_name,
            "learning_rate": self.config.training.learning_rate,
            "batch_size": self.config.data.batch_size,
            "num_epochs": self.config.training.num_epochs,
            "max_length": self.config.data.max_length,
            "alpha": self.config.training.alpha,
            "beta": self.config.training.beta,
            "mixed_precision": self.config.training.mixed_precision,
        })
        
        if self.config.mlflow.tags:
            mlflow.set_tags(dict(self.config.mlflow.tags))
    
    def log_model_info(self, model_info: Dict):
        mlflow.log_params(model_info)
    
    def log_metrics(self, metrics: Dict, step: Optional[int] = None):
        mlflow.log_metrics(metrics, step=step)
    
    def end_run(self):
        mlflow.end_run()


class MultiTaskTrainerWrapper(Trainer):
    def __init__(self, alpha: float = 0.5, beta: float = 0.5, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.alpha = alpha
        self.beta = beta
    
    def compute_loss(self, model, inputs, return_outputs=False, num_items_in_batch=None):
        ner_labels = inputs.get("ner_labels")
        risk_labels = inputs.get("risk_labels")
        
        outputs = model(
            input_ids=inputs["input_ids"],
            attention_mask=inputs["attention_mask"],
            ner_labels=ner_labels,
            risk_labels=risk_labels,
            alpha=self.alpha,
            beta=self.beta
        )
        
        loss = outputs["loss"]
        
        if return_outputs:
            return loss, outputs
        return loss
    
    def prediction_step(self, model, inputs, prediction_loss_only, ignore_keys=None):
        inputs = self._prepare_inputs(inputs)
        
        with torch.no_grad():
            outputs = model(
                input_ids=inputs["input_ids"],
                attention_mask=inputs["attention_mask"],
                ner_labels=inputs.get("ner_labels"),
                risk_labels=inputs.get("risk_labels"),
                alpha=self.alpha,
                beta=self.beta
            )
            
            loss = outputs["loss"] if "loss" in outputs else None
            
            ner_logits = outputs["ner_logits"].detach().cpu().numpy()
            risk_logits = outputs["risk_logits"].detach().cpu().numpy()
            
            ner_labels = inputs["ner_labels"].detach().cpu().numpy()
            risk_labels = inputs["risk_labels"].detach().cpu().numpy()
        
        if prediction_loss_only:
            return (loss, None, None)
        
        return (loss, (ner_logits, risk_logits), (ner_labels, risk_labels))


@hydra.main(version_base=None, config_path="../configs", config_name="config")
def main(cfg: DictConfig):
    print(f"Training with config: {cfg.data.dataset_name}")
    
    mlflow_callback = MLflowCallback(cfg)
    
    dataset_loader = LegalDatasetLoader(cfg)
    dataset, label_info = dataset_loader.load_and_prepare()
    
    model = MultiTaskLegalModel(
        model_name=cfg.model.name,
        num_ner_labels=label_info["num_ner_labels"],
        num_risk_labels=label_info["num_risk_labels"],
        dropout=cfg.model.dropout
    )
    
    model_info = get_model_info(model)
    mlflow_callback.log_model_info(model_info)
    
    training_args = TrainingArguments(
        output_dir=cfg.training.output_dir,
        num_train_epochs=cfg.training.num_epochs,
        per_device_train_batch_size=cfg.data.batch_size,
        per_device_eval_batch_size=cfg.data.batch_size,
        learning_rate=cfg.training.learning_rate,
        weight_decay=cfg.training.weight_decay,
        warmup_ratio=cfg.training.warmup_ratio,
        fp16=cfg.training.fp16,
        bf16=cfg.training.bf16,
        gradient_accumulation_steps=cfg.training.gradient_accumulation_steps,
        max_grad_norm=cfg.training.max_grad_norm,
        eval_strategy=cfg.training.eval_strategy,
        save_strategy=cfg.training.save_strategy,
        load_best_model_at_end=cfg.training.load_best_model_at_end,
        metric_for_best_model=cfg.training.metric_for_best_model,
        greater_is_better=cfg.training.greater_is_better,
        logging_steps=cfg.training.logging_steps,
        report_to=cfg.training.report_to if cfg.training.report_to is not None else [],
        save_total_limit=cfg.training.save_total_limit,
        dataloader_num_workers=cfg.data.num_workers,
        seed=42,
    )
    
    label_names = get_label_names()
    metrics_calculator = MultiTaskMetrics(label_names)
    
    trainer = MultiTaskTrainerWrapper(
        model=model,
        args=training_args,
        train_dataset=dataset["train"],
        eval_dataset=dataset["validation"],
        compute_metrics=metrics_calculator.compute_metrics,
        alpha=cfg.training.alpha,
        beta=cfg.training.beta,
    )
    
    train_result = trainer.train()
    
    train_metrics = train_result.metrics
    mlflow_callback.log_metrics({
        "train_loss": train_metrics["train_loss"],
        "train_runtime": train_metrics["train_runtime"],
        "train_samples_per_second": train_metrics["train_samples_per_second"],
    })
    
    eval_metrics = trainer.evaluate()
    mlflow_callback.log_metrics({
        f"val_{k.replace('eval_', '')}": v 
        for k, v in eval_metrics.items() 
        if k.startswith('eval_')
    })
    
    test_metrics = trainer.evaluate(dataset["test"])
    mlflow_callback.log_metrics({
        f"test_{k.replace('eval_', '')}": v 
        for k, v in test_metrics.items() 
        if k.startswith('eval_')
    })
    
    model.save_pretrained(cfg.training.output_dir)
    mlflow.pytorch.log_model(model, "model")
    mlflow_callback.end_run()
    
    print(f"Training complete. F1: {test_metrics['eval_f1']:.4f}")


if __name__ == "__main__":
    main()
