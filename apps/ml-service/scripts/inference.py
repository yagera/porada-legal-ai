import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

import torch
from transformers import AutoTokenizer
from models import MultiTaskLegalModel
from dataset import get_label_names


def load_model(model_path: str, model_name: str = "DeepPavlov/rubert-base-cased"):
    model = MultiTaskLegalModel.from_pretrained(model_path, model_name)
    model.eval()
    return model


def predict(model, tokenizer, text: str, max_length: int = 512):
    inputs = tokenizer(
        text,
        padding="max_length",
        truncation=True,
        max_length=max_length,
        return_tensors="pt"
    )
    
    with torch.no_grad():
        outputs = model(
            input_ids=inputs["input_ids"],
            attention_mask=inputs["attention_mask"]
        )
    
    ner_logits = outputs["ner_logits"]
    ner_predictions = torch.argmax(ner_logits, dim=2)[0].tolist()
    
    risk_logits = outputs["risk_logits"]
    risk_prediction = torch.argmax(risk_logits, dim=1).item()
    risk_probs = torch.softmax(risk_logits, dim=1)[0].tolist()
    
    label_names = get_label_names()
    
    tokens = tokenizer.convert_ids_to_tokens(inputs["input_ids"][0])
    ner_labels = [label_names["ner_labels"][pred] if pred < len(label_names["ner_labels"]) else "O" 
                  for pred in ner_predictions]
    
    filtered_tokens = []
    filtered_labels = []
    for token, label in zip(tokens, ner_labels):
        if token not in ['[CLS]', '[SEP]', '[PAD]']:
            filtered_tokens.append(token)
            filtered_labels.append(label)
    
    risk_label = label_names["risk_labels"][risk_prediction]
    
    return {
        "text": text,
        "tokens": filtered_tokens,
        "ner_labels": filtered_labels,
        "risk_label": risk_label,
        "risk_probabilities": {
            label: prob 
            for label, prob in zip(label_names["risk_labels"], risk_probs)
        }
    }


def print_predictions(predictions: dict):
    print("\n" + "=" * 80)
    print("PREDICTIONS")
    print("=" * 80)
    
    print(f"\nInput Text:")
    print(f"  {predictions['text']}")
    
    print(f"\nNamed Entities:")
    entities = []
    current_entity = None
    current_type = None
    
    for token, label in zip(predictions['tokens'], predictions['ner_labels']):
        if label.startswith('B-'):
            if current_entity:
                entities.append(f"{current_entity} ({current_type})")
            current_entity = token.replace('##', '')
            current_type = label[2:]
        elif label.startswith('I-') and current_entity:
            current_entity += token.replace('##', '')
        else:
            if current_entity:
                entities.append(f"{current_entity} ({current_type})")
                current_entity = None
                current_type = None
    
    if current_entity:
        entities.append(f"{current_entity} ({current_type})")
    
    if entities:
        for entity in entities:
            print(f"  - {entity}")
    else:
        print("  No entities found")
    
    print(f"\nRisk Classification:")
    print(f"  Predicted Risk: {predictions['risk_label']}")
    print(f"  Probabilities:")
    for label, prob in predictions['risk_probabilities'].items():
        print(f"    - {label}: {prob:.2%}")
    
    print("\n" + "=" * 80)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model_path", type=str, required=True)
    parser.add_argument("--text", type=str, default="")
    parser.add_argument("--model_name", type=str, default="DeepPavlov/rubert-base-cased")
    parser.add_argument("--max_length", type=int, default=512)
    
    args = parser.parse_args()
    
    model = load_model(args.model_path, args.model_name)
    tokenizer = AutoTokenizer.from_pretrained(args.model_name)
    
    if not args.text:
        args.text = (
            "Согласно статье 395 ГК РФ, за пользование чужими денежными средствами "
            "вследствие их неправомерного удержания подлежат уплате проценты."
        )
        print(f"Using example text:")
    
    predictions = predict(
        model=model,
        tokenizer=tokenizer,
        text=args.text,
        max_length=args.max_length
    )
    
    print_predictions(predictions)


if __name__ == "__main__":
    main()
