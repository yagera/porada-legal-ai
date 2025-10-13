import torch
from transformers import AutoTokenizer
from typing import Dict, List, Tuple, Optional
from models import MultiTaskLegalModel, get_model_info
from dataset import get_label_names
import numpy as np

class LegalDocumentAnalyzer:
    def __init__(self, model_path: str, model_name: str = "DeepPavlov/rubert-base-cased"):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = MultiTaskLegalModel.from_pretrained(model_path, model_name)
        self.model.to(self.device)
        self.model.eval()

        self.label_names = get_label_names()

    def analyze_document(self, text: str, max_length: int = 512) -> Dict:
        encoding = self.tokenizer(
            text,
            padding="max_length",
            truncation=True,
            max_length=max_length,
            return_tensors="pt"
        )

        input_ids = encoding["input_ids"].to(self.device)
        attention_mask = encoding["attention_mask"].to(self.device)

        with torch.no_grad():
            outputs = self.model(
                input_ids=input_ids,
                attention_mask=attention_mask
            )

        ner_logits = outputs["ner_logits"]
        ner_predictions = torch.argmax(ner_logits, dim=-1)

        risk_logits = outputs["risk_logits"]
        risk_prediction = torch.argmax(risk_logits, dim=-1)
        risk_probs = torch.softmax(risk_logits, dim=-1)

        tokens = self.tokenizer.convert_ids_to_tokens(input_ids[0])
        entities = self._extract_entities(tokens, ner_predictions[0], attention_mask[0])

        risk_label = self.label_names["risk_labels"][risk_prediction.item()]
        risk_confidence = risk_probs[0][risk_prediction].item()

        return {
            "text": text,
            "entities": entities,
            "risk_level": risk_label,
            "risk_confidence": risk_confidence,
            "risk_probabilities": {
                label: prob.item()
                for label, prob in zip(self.label_names["risk_labels"], risk_probs[0])
            }
        }

    def _extract_entities(self, tokens: List[str], predictions: torch.Tensor, attention_mask: torch.Tensor) -> List[Dict]:
        entities = []
        current_entity = None

        for i, (token, pred, mask) in enumerate(zip(tokens, predictions, attention_mask)):
            if mask == 0:
                break

            if token in ["[CLS]", "[SEP]", "[PAD]"]:
                continue

            pred_label = self.label_names["ner_labels"][pred.item()] if pred.item() < len(self.label_names["ner_labels"]) else "O"

            if pred_label.startswith("B-"):
                if current_entity:
                    entities.append(current_entity)
                current_entity = {
                    "label": pred_label[2:],
                    "text": self._clean_token(token),
                    "start": i,
                    "end": i
                }
            elif pred_label.startswith("I-") and current_entity:
                if pred_label[2:] == current_entity["label"]:
                    current_entity["text"] += self._clean_token(token)
                    current_entity["end"] = i
                else:
                    entities.append(current_entity)
                    current_entity = None
            else:
                if current_entity:
                    entities.append(current_entity)
                    current_entity = None

        if current_entity:
            entities.append(current_entity)

        return entities

    def _clean_token(self, token: str) -> str:
        if token.startswith("##"):
            return token[2:]
        return f" {token}"

    def analyze_batch(self, texts: List[str], max_length: int = 512) -> List[Dict]:
        results = []
        for text in texts:
            result = self.analyze_document(text, max_length)
            results.append(result)
        return results

    def get_model_info(self) -> Dict:
        return get_model_info(self.model)


def load_analyzer(model_path: str, model_name: str = "DeepPavlov/rubert-base-cased") -> LegalDocumentAnalyzer:
    return LegalDocumentAnalyzer(model_path, model_name)


if __name__ == "__main__":
    analyzer = LegalDocumentAnalyzer("./outputs", "DeepPavlov/rubert-base-cased")

    test_text = """
    Договор поставки заключен между ООО Альфа и ИП Иванов на сумму 100000 рублей.
    За нарушение сроков поставки взимается штраф в размере 5000 рублей.
    Срок действия договора до 31.12.2024.
    """

    result = analyzer.analyze_document(test_text)

    print(f"Текст: {result['text']}")
    print(f"Уровень риска: {result['risk_level']} (уверенность: {result['risk_confidence']:.2f})")
    print("Найденные сущности:")
    for entity in result['entities']:
        print(f"  {entity['label']}: '{entity['text'].strip()}'")

    print("\nВероятности по классам риска:")
    for label, prob in result['risk_probabilities'].items():
        print(f"  {label}: {prob:.3f}")
