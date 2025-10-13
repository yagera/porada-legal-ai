import os
from typing import Dict, Optional, List
import hydra
from omegaconf import DictConfig, OmegaConf
import mlflow
import torch
from transformers import Trainer, TrainingArguments, TrainerCallback
from sklearn.metrics import confusion_matrix, classification_report
import numpy as np
from seqeval.metrics import f1_score as ner_f1_score
from seqeval.metrics import precision_score, recall_score
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from io import BytesIO

from dataset import LegalDatasetLoader, get_label_names
from models import MultiTaskLegalModel, get_model_info

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

        metrics = {
            "ner_precision": ner_precision,
            "ner_recall": ner_recall,
            "ner_f1": ner_f1,
            "risk_accuracy": risk_acc,
            "risk_f1": risk_report["weighted avg"]["f1-score"],
            "risk_precision": risk_report["weighted avg"]["precision"],
            "risk_recall": risk_report["weighted avg"]["recall"],
            "f1": combined_f1
        }

        for i, class_name in enumerate(self.risk_labels):
            if class_name in risk_report:
                metrics[f"risk_{class_name.lower()}_f1"] = risk_report[class_name].get("f1-score", 0.0)
                metrics[f"risk_{class_name.lower()}_precision"] = risk_report[class_name].get("precision", 0.0)
                metrics[f"risk_{class_name.lower()}_recall"] = risk_report[class_name].get("recall", 0.0)

        total_entities = sum(len([label for label in seq if label != "O"]) for seq in ner_true_labels)
        predicted_entities = sum(len([label for label in seq if label != "O"]) for seq in ner_pred_labels)
        metrics["total_true_entities"] = total_entities
        metrics["total_pred_entities"] = predicted_entities

        for i, class_name in enumerate(self.risk_labels):
            count = np.sum(risk_labels == i)
            pred_count = np.sum(risk_preds == i)
            metrics[f"risk_{class_name.lower()}_true_count"] = count
            metrics[f"risk_{class_name.lower()}_pred_count"] = pred_count

        return metrics


class MLflowTrainerCallback(TrainerCallback):
    def __init__(self, config: DictConfig, label_names: Dict[str, List[str]]):
        self.config = config
        self.label_names = label_names
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
            "weight_decay": self.config.training.weight_decay,
            "warmup_ratio": self.config.training.warmup_ratio,
            "gradient_accumulation_steps": self.config.training.gradient_accumulation_steps,
            "max_grad_norm": self.config.training.max_grad_norm,
        })

        if self.config.mlflow.tags:
            mlflow.set_tags(dict(self.config.mlflow.tags))

    def on_log(self, args, state, control, model=None, logs=None, **kwargs):
        if logs:
            filtered_logs = {}
            for key, value in logs.items():
                if any(metric in key for metric in ['loss', 'f1', 'accuracy', 'precision', 'recall', 'learning_rate', 'grad_norm']):
                    filtered_logs[key] = value

            if filtered_logs:
                mlflow.log_metrics(filtered_logs, step=state.global_step)

    def on_evaluate(self, args, state, control, model=None, logs=None, **kwargs):
        if logs:
            eval_metrics = {k: v for k, v in logs.items() if k.startswith('eval_')}
            if eval_metrics:
                step = state.global_step if hasattr(state, 'global_step') else None
                mlflow.log_metrics(eval_metrics, step=step)

    def log_model_info(self, model_info: Dict):
        mlflow.log_params(model_info)

    def log_dataset_stats(self, dataset_stats: Dict):
        mlflow.log_params(dataset_stats)

    def end_run(self):
        mlflow.end_run()


class MultiTaskTrainerWrapper(Trainer):
    def __init__(self, alpha: float = 0.5, beta: float = 0.5, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.alpha = alpha
        self.beta = beta

    def compute_loss(self, model, inputs, return_outputs=False, **kwargs):
        ner_labels = inputs.get("ner_labels")
        risk_labels = inputs.get("risk_labels")

        if ner_labels is None and risk_labels is None:
            raise ValueError("Both ner_labels and risk_labels are None")

        outputs = model(
            input_ids=inputs["input_ids"],
            attention_mask=inputs["attention_mask"],
            ner_labels=ner_labels,
            risk_labels=risk_labels,
            alpha=self.alpha,
            beta=self.beta
        )

        loss = outputs.get("loss")
        if loss is None or torch.isnan(loss):
            print(f"WARNING: Loss is None or NaN. Outputs keys: {outputs.keys()}")
            loss = torch.tensor(0.0, requires_grad=True, device=inputs["input_ids"].device)

        return (loss, outputs) if return_outputs else loss

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

        loss = outputs.get("loss")
        if loss is not None and torch.isnan(loss):
            loss = torch.tensor(0.0)

        ner_logits = outputs["ner_logits"].detach().cpu().numpy()
        risk_logits = outputs["risk_logits"].detach().cpu().numpy()

        ner_labels = inputs["ner_labels"].detach().cpu().numpy()
        risk_labels = inputs["risk_labels"].detach().cpu().numpy()

        if prediction_loss_only:
            return (loss, None, None)

        return (loss, (ner_logits, risk_logits), (ner_labels, risk_labels))


@hydra.main(version_base=None, config_path=".", config_name="config")
def main(cfg: DictConfig):
    print(f"Training with config: {cfg.data.dataset_name}")
    print(f"Model: {cfg.model.name}")

    dataset_loader = LegalDatasetLoader(cfg)
    dataset, label_info = dataset_loader.load_and_prepare()

    print(f"Dataset sizes - Train: {len(dataset['train'])}, Val: {len(dataset['validation'])}, Test: {len(dataset['test'])}")
    print(f"Label info: {label_info}")

    model = MultiTaskLegalModel(
        model_name=cfg.model.name,
        num_ner_labels=label_info["num_ner_labels"],
        num_risk_labels=label_info["num_risk_labels"],
        dropout=cfg.model.dropout
    )

    label_names = get_label_names()
    metrics_calculator = MultiTaskMetrics(label_names)

    mlflow_callback = MLflowTrainerCallback(cfg, label_names)

    model_info = get_model_info(model)
    mlflow_callback.log_model_info(model_info)
    print(f"Model info: {model_info}")

    dataset_stats = {
        "train_size": len(dataset["train"]),
        "val_size": len(dataset["validation"]),
        "test_size": len(dataset["test"]),
        "num_ner_labels": label_info["num_ner_labels"],
        "num_risk_labels": label_info["num_risk_labels"]
    }
    mlflow_callback.log_dataset_stats(dataset_stats)

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
        eval_steps=cfg.training.get("eval_steps", 100),
        save_strategy=cfg.training.save_strategy,
        save_steps=cfg.training.get("save_steps", 100),
        load_best_model_at_end=cfg.training.load_best_model_at_end,
        metric_for_best_model=cfg.training.metric_for_best_model,
        greater_is_better=cfg.training.greater_is_better,
        logging_steps=cfg.training.logging_steps,
        report_to=[],  # Отключаем встроенные логгеры
        save_total_limit=cfg.training.save_total_limit,
        dataloader_num_workers=cfg.data.num_workers,
        seed=42,
        remove_unused_columns=False,  # Важно для мультитаск обучения
    )

    trainer = MultiTaskTrainerWrapper(
        model=model,
        args=training_args,
        train_dataset=dataset["train"],
        eval_dataset=dataset["validation"],
        compute_metrics=metrics_calculator.compute_metrics,
        alpha=cfg.training.alpha,
        beta=cfg.training.beta,
        callbacks=[mlflow_callback]
    )

    print("Starting training...")
    train_result = trainer.train()

    train_metrics = train_result.metrics
    train_metrics_filtered = {k: v for k, v in train_metrics.items() if isinstance(v, (int, float))}
    mlflow.log_metrics(train_metrics_filtered)

    print(f"Training completed. Final train loss: {train_metrics.get('train_loss', 'N/A')}")

    print("Evaluating on validation set...")
    eval_metrics = trainer.evaluate()
    eval_metrics_filtered = {f"final_val_{k.replace('eval_', '')}": v
                           for k, v in eval_metrics.items()
                           if k.startswith('eval_') and isinstance(v, (int, float))}
    mlflow.log_metrics(eval_metrics_filtered)

    print("Evaluating on test set...")
    test_metrics = trainer.evaluate(dataset["test"])
    test_metrics_filtered = {f"final_test_{k.replace('eval_', '')}": v
                           for k, v in test_metrics.items()
                           if k.startswith('eval_') and isinstance(v, (int, float))}
    mlflow.log_metrics(test_metrics_filtered)

    model.save_pretrained(cfg.training.output_dir)
    print(f"Model saved to {cfg.training.output_dir}")

    try:
        mlflow.pytorch.log_model(model, "model")
        print("Model logged to MLflow")
    except Exception as e:
        print(f"Warning: Could not log model to MLflow: {e}")

    mlflow_callback.end_run()

    final_f1 = test_metrics.get('eval_f1', 'N/A')
    print(f"Training complete! Final test F1: {final_f1}")

    return {
        "train_metrics": train_metrics,
        "eval_metrics": eval_metrics,
        "test_metrics": test_metrics
    }


if __name__ == "__main__":
    main()
