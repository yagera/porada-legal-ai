from typing import Dict, List, Tuple, Optional
import random
from datasets import load_dataset, Dataset, DatasetDict
from transformers import AutoTokenizer
import numpy as np


class LegalDatasetLoader:
    def __init__(self, config):
        self.config = config
        self.tokenizer = AutoTokenizer.from_pretrained(config.model.name)
        self.dataset_name = config.data.dataset_name
        
    def load_and_prepare(self) -> Tuple[DatasetDict, Dict[str, int]]:
        if self.dataset_name == "ruleganner":
            dataset = self._load_ruleganner()
            label_info = self._get_ner_labels(dataset)
        elif self.dataset_name == "ruslaw":
            dataset = self._load_ruslaw()
            label_info = {"num_ner_labels": 7, "num_risk_labels": 3}
        elif self.dataset_name == "synthetic":
            dataset = self._create_synthetic_risk_dataset()
            label_info = {"num_ner_labels": 7, "num_risk_labels": 3}
        else:
            raise ValueError(f"Unknown dataset: {self.dataset_name}")
        
        dataset = self._tokenize_dataset(dataset)
        return dataset, label_info
    
    def _load_ruleganner(self) -> DatasetDict:
        dataset = load_dataset("blinoff/ruleganner", cache_dir=self.config.data.cache_dir)
        
        if "validation" not in dataset:
            train_val = dataset["train"].train_test_split(test_size=0.1, seed=42)
            dataset = DatasetDict({
                "train": train_val["train"],
                "validation": train_val["test"],
                "test": dataset["test"]
            })
        
        dataset = dataset.map(self._add_synthetic_risk_labels)
        return dataset
    
    def _load_ruslaw(self) -> DatasetDict:
        dataset = load_dataset("irlspbru/RusLawOD", cache_dir=self.config.data.cache_dir)
        dataset = dataset.map(self._convert_ruslaw_format)
        
        train_test = dataset["train"].train_test_split(test_size=0.2, seed=42)
        val_test = train_test["test"].train_test_split(test_size=0.5, seed=42)
        
        return DatasetDict({
            "train": train_test["train"],
            "validation": val_test["train"],
            "test": val_test["test"]
        })
    
    def _create_synthetic_risk_dataset(self) -> DatasetDict:
        templates = [
            "Согласно статье {num} ГК РФ, {action}.",
            "В соответствии с {doc} от {date}, {consequence}.",
            "Нарушение пункта {num} влечет {penalty}.",
            "Договор должен содержать {requirement}.",
            "Сторона обязуется {obligation}.",
        ]
        
        actions = [
            "сделка признается недействительной",
            "договор может быть расторгнут",
            "требуется письменное согласие",
            "применяются штрафные санкции",
            "наступает административная ответственность"
        ]
        
        examples = []
        for i in range(200):
            template = random.choice(templates)
            text = template.format(
                num=random.randint(1, 500),
                action=random.choice(actions),
                doc=random.choice(["Федеральным законом", "постановлением", "приказом"]),
                date=f"{random.randint(1, 28)}.{random.randint(1, 12)}.{random.randint(2015, 2023)}",
                consequence=random.choice(actions),
                penalty=random.choice(["штраф", "предупреждение", "приостановление деятельности"]),
                requirement=random.choice(["подписи сторон", "реквизиты", "срок действия"]),
                obligation=random.choice(["выполнить работы", "произвести оплату", "предоставить отчет"])
            )
            
            risk_label = 0
            if any(word in text for word in ["недействительной", "расторгнут", "штраф", "ответственность"]):
                risk_label = 2
            elif any(word in text for word in ["санкции", "требуется", "должен"]):
                risk_label = 1
            
            tokens = text.split()
            ner_labels = [0] * len(tokens)
            
            examples.append({
                "text": text,
                "tokens": tokens,
                "ner_tags": ner_labels,
                "risk_label": risk_label
            })
        
        dataset = Dataset.from_list(examples)
        train_test = dataset.train_test_split(test_size=0.2, seed=42)
        val_test = train_test["test"].train_test_split(test_size=0.5, seed=42)
        
        return DatasetDict({
            "train": train_test["train"],
            "validation": val_test["train"],
            "test": val_test["test"]
        })
    
    def _add_synthetic_risk_labels(self, example: Dict) -> Dict:
        text = example.get("text", "")
        if len(text) < 50:
            risk_label = 0
        elif len(text) < 150:
            risk_label = 1
        else:
            risk_label = 2
        
        example["risk_label"] = risk_label
        return example
    
    def _convert_ruslaw_format(self, example: Dict) -> Dict:
        text = example.get("text", "")
        tokens = text.split()[:self.config.data.max_length]
        ner_labels = [0] * len(tokens)
        risk_label = random.randint(0, 2)
        
        return {
            "text": text,
            "tokens": tokens,
            "ner_tags": ner_labels,
            "risk_label": risk_label
        }
    
    def _get_ner_labels(self, dataset: DatasetDict) -> Dict[str, int]:
        if "ner_tags" in dataset["train"].features:
            all_labels = set()
            for example in dataset["train"]:
                all_labels.update(example["ner_tags"])
            num_ner_labels = len(all_labels)
        else:
            num_ner_labels = 7
        
        return {
            "num_ner_labels": num_ner_labels,
            "num_risk_labels": 3
        }
    
    def _tokenize_dataset(self, dataset: DatasetDict) -> DatasetDict:
        def tokenize_function(examples):
            if "text" in examples:
                tokenized = self.tokenizer(
                    examples["text"],
                    padding="max_length",
                    truncation=True,
                    max_length=self.config.data.max_length,
                    return_tensors=None
                )
            elif "tokens" in examples:
                tokenized = self.tokenizer(
                    examples["tokens"],
                    padding="max_length",
                    truncation=True,
                    max_length=self.config.data.max_length,
                    is_split_into_words=True,
                    return_tensors=None
                )
            else:
                raise ValueError("No text or tokens found in dataset")
            
            if "ner_tags" in examples:
                aligned_labels = []
                for i in range(len(examples["ner_tags"])):
                    word_ids = tokenized.word_ids(batch_index=i) if "tokens" in examples else None
                    aligned_labels.append(self._align_labels(examples["ner_tags"][i], word_ids))
                tokenized["ner_labels"] = aligned_labels
            else:
                tokenized["ner_labels"] = [[0] * self.config.data.max_length] * len(examples["text"])
            
            if "risk_label" in examples:
                tokenized["risk_labels"] = examples["risk_label"]
            
            return tokenized
        
        tokenized_dataset = dataset.map(
            tokenize_function,
            batched=True,
            remove_columns=dataset["train"].column_names
        )
        
        return tokenized_dataset
    
    def _align_labels(self, labels: List[int], word_ids: Optional[List[int]]) -> List[int]:
        if word_ids is None:
            if len(labels) >= self.config.data.max_length:
                return labels[:self.config.data.max_length]
            else:
                return labels + [-100] * (self.config.data.max_length - len(labels))
        
        aligned_labels = []
        previous_word_idx = None
        
        for word_idx in word_ids:
            if word_idx is None:
                aligned_labels.append(-100)
            elif word_idx != previous_word_idx:
                aligned_labels.append(labels[word_idx] if word_idx < len(labels) else -100)
            else:
                aligned_labels.append(-100)
            previous_word_idx = word_idx
        
        return aligned_labels


def get_label_names() -> Dict[str, List[str]]:
    return {
        "ner_labels": ["O", "B-PER", "I-PER", "B-ORG", "I-ORG", "B-LOC", "I-LOC"],
        "risk_labels": ["Low", "Medium", "High"]
    }
