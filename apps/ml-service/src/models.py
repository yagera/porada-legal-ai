import torch
import torch.nn as nn
from transformers import AutoModel, AutoConfig
from typing import Dict, Optional

class MultiTaskLegalModel(nn.Module):
    def __init__(self, model_name: str, num_ner_labels: int, num_risk_labels: int, dropout: float = 0.1):
        super().__init__()
        self.config = AutoConfig.from_pretrained(model_name)
        try:
            self.bert = AutoModel.from_pretrained(model_name, use_safetensors=False)
        except Exception as e:
            print(f"Failed to load model with safetensors=False, trying with use_safetensors=None: {e}")
            self.bert = AutoModel.from_pretrained(model_name, use_safetensors=None)

        hidden_size = self.config.hidden_size

        self.ner_dropout = nn.Dropout(dropout)
        self.ner_classifier = nn.Linear(hidden_size, num_ner_labels)

        self.risk_dropout = nn.Dropout(dropout)
        self.risk_classifier = nn.Linear(hidden_size, num_risk_labels)

        self.num_ner_labels = num_ner_labels
        self.num_risk_labels = num_risk_labels

        self._init_classification_heads()

    def _init_classification_heads(self):
        nn.init.normal_(self.ner_classifier.weight, mean=0.0, std=0.02)
        nn.init.zeros_(self.ner_classifier.bias)

        nn.init.normal_(self.risk_classifier.weight, mean=0.0, std=0.02)
        nn.init.zeros_(self.risk_classifier.bias)

    def forward(
        self,
        input_ids: torch.Tensor,
        attention_mask: torch.Tensor,
        ner_labels: Optional[torch.Tensor] = None,
        risk_labels: Optional[torch.Tensor] = None,
        alpha: float = 0.5,
        beta: float = 0.5
    ) -> Dict[str, torch.Tensor]:

        if input_ids is None or attention_mask is None:
            raise ValueError("input_ids and attention_mask cannot be None")

        outputs = self.bert(
            input_ids=input_ids,
            attention_mask=attention_mask,
            return_dict=True
        )

        sequence_output = outputs.last_hidden_state
        pooled_output = outputs.pooler_output

        ner_features = self.ner_dropout(sequence_output)
        ner_logits = self.ner_classifier(ner_features)

        risk_features = self.risk_dropout(pooled_output)
        risk_logits = self.risk_classifier(risk_features)

        result = {
            "ner_logits": ner_logits,
            "risk_logits": risk_logits
        }

        total_loss = None

        if ner_labels is not None or risk_labels is not None:
            total_loss = 0.0

            if ner_labels is not None:
                ner_loss_fct = nn.CrossEntropyLoss(ignore_index=-100)
                ner_loss = ner_loss_fct(
                    ner_logits.view(-1, self.num_ner_labels),
                    ner_labels.view(-1)
                )
                result["ner_loss"] = ner_loss
                total_loss += alpha * ner_loss

            if risk_labels is not None:
                risk_loss_fct = nn.CrossEntropyLoss()
                risk_loss = risk_loss_fct(
                    risk_logits.view(-1, self.num_risk_labels),
                    risk_labels.view(-1)
                )
                result["risk_loss"] = risk_loss
                total_loss += beta * risk_loss

            if total_loss is not None:
                if torch.isnan(total_loss) or torch.isinf(total_loss):
                    print(f"WARNING: Invalid loss detected. NER loss: {result.get('ner_loss', 'None')}, Risk loss: {result.get('risk_loss', 'None')}")
                    total_loss = torch.tensor(0.0, device=input_ids.device, requires_grad=True)
                result["loss"] = total_loss

        return result

    def save_pretrained(self, save_directory: str):
        import os
        os.makedirs(save_directory, exist_ok=True)

        self.bert.save_pretrained(save_directory)

        torch.save({
            'ner_classifier': self.ner_classifier.state_dict(),
            'risk_classifier': self.risk_classifier.state_dict(),
            'num_ner_labels': self.num_ner_labels,
            'num_risk_labels': self.num_risk_labels,
        }, f"{save_directory}/task_heads.pt")

    @classmethod
    def from_pretrained(cls, load_directory: str, model_name: str):
        checkpoint = torch.load(
            f"{load_directory}/task_heads.pt", 
            map_location=torch.device('cpu'),
            weights_only=False
        )

        model = cls(
            model_name=model_name,
            num_ner_labels=checkpoint['num_ner_labels'],
            num_risk_labels=checkpoint['num_risk_labels']
        )

        try:
            model.bert = AutoModel.from_pretrained(
                load_directory, 
                use_safetensors=False,
                torch_dtype=torch.float32
            )
        except Exception as e:
            print(f"Failed to load BERT model with safetensors=False, trying with use_safetensors=None: {e}")
            model.bert = AutoModel.from_pretrained(
                load_directory, 
                use_safetensors=None,
                torch_dtype=torch.float32
            )
        model.ner_classifier.load_state_dict(checkpoint['ner_classifier'])
        model.risk_classifier.load_state_dict(checkpoint['risk_classifier'])

        return model


def get_model_info(model: MultiTaskLegalModel) -> Dict[str, int]:
    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)

    ner_head_params = sum(p.numel() for p in model.ner_classifier.parameters())
    risk_head_params = sum(p.numel() for p in model.risk_classifier.parameters())

    return {
        "total_parameters": total_params,
        "trainable_parameters": trainable_params,
        "ner_head_parameters": ner_head_params,
        "risk_head_parameters": risk_head_params,
        "num_ner_labels": model.num_ner_labels,
        "num_risk_labels": model.num_risk_labels,
        "hidden_size": model.config.hidden_size
    }
