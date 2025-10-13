from typing import Dict, List, Tuple, Optional
import random
from datasets import load_dataset, Dataset, DatasetDict
from transformers import AutoTokenizer
import numpy as np
import re

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
        try:
            dataset = load_dataset("blinoff/ruleganner", cache_dir=self.config.data.cache_dir)
        except:
            print("Warning: ruleganner dataset not available, creating synthetic NER dataset")
            return self._create_synthetic_ner_dataset()

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
        try:
            dataset = load_dataset("irlspbru/RusLawOD", cache_dir=self.config.data.cache_dir)
        except Exception as e:
            print(f"Warning: Could not load RusLawOD: {e}")
            print("Creating synthetic legal dataset instead")
            return self._create_synthetic_legal_dataset()

        dataset = dataset.map(self._convert_ruslaw_format, remove_columns=dataset["train"].column_names)
        dataset = dataset.filter(lambda x: x is not None and x.get("text") is not None)

        if len(dataset["train"]) == 0:
            print("Warning: No valid data in RusLawOD, creating synthetic dataset")
            return self._create_synthetic_legal_dataset()

        train_test = dataset["train"].train_test_split(test_size=0.2, seed=42)
        val_test = train_test["test"].train_test_split(test_size=0.5, seed=42)

        return DatasetDict({
            "train": train_test["train"],
            "validation": val_test["train"],
            "test": val_test["test"]
        })

    def _create_synthetic_legal_dataset(self) -> DatasetDict:
        templates = [
            "Статья {num}. {subject}. {content}",
            "Согласно пункту {num} {doc}, {action}.",
            "В соответствии с Федеральным законом №{num}-ФЗ от {date}, {requirement}.",
            "Договор между {org1} и {org2} предусматривает {obligation}.",
            "За нарушение условий договора {penalty}.",
            "Сторона обязуется {action} в срок до {date}.",
            "При несоблюдении требований {consequence}.",
            "Ответственность за {action} несет {party}.",
        ]

        subjects = ["Общие положения", "Права и обязанности сторон", "Ответственность", "Порядок расчетов"]
        contents = [
            "устанавливает порядок исполнения обязательств",
            "определяет права и обязанности сторон",
            "регулирует вопросы ответственности",
            "устанавливает порядок разрешения споров"
        ]
        actions = [
            "выполнить работы в полном объеме",
            "произвести оплату в размере 100000 рублей",
            "предоставить отчетную документацию",
            "обеспечить соблюдение требований безопасности"
        ]
        penalties = [
            "взыскивается штраф в размере 10000 рублей",
            "применяются санкции согласно действующему законодательству",
            "договор может быть расторгнут в одностороннем порядке"
        ]

        examples = []
        for i in range(500):  # Больше примеров для лучшего обучения
            template = random.choice(templates)
            text = template.format(
                num=random.randint(1, 500),
                subject=random.choice(subjects),
                content=random.choice(contents),
                action=random.choice(actions),
                doc=random.choice(["ГК РФ", "ТК РФ", "КоАП РФ"]),
                date=f"{random.randint(1, 28)}.{random.randint(1, 12)}.{random.randint(2015, 2023)}",
                requirement=random.choice(actions),
                org1=random.choice(["ООО Альфа", "АО Бета", "ИП Гамма"]),
                org2=random.choice(["ООО Дельта", "АО Эпсилон", "ИП Дзета"]),
                obligation=random.choice(actions),
                penalty=random.choice(penalties),
                consequence=random.choice(penalties),
                party=random.choice(["Заказчик", "Исполнитель", "Поставщик"])
            )

            risk_label = self._classify_risk_from_text(text)

            tokens = text.split()
            ner_labels = self._simple_ner_tagging(tokens)

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

    def _create_synthetic_risk_dataset(self) -> DatasetDict:
        examples = []

        high_risk_templates = [
            "За нарушение условий договора взыскивается штраф в размере {amount} рублей.",
            "При несвоевременном исполнении обязательств применяются санкции.",
            "Договор может быть расторгнут в одностороннем порядке без предварительного уведомления.",
            "Ответственность за ущерб несет {party} в полном объеме.",
            "Нарушение сроков влечет неустойку в размере {percent}% от суммы договора."
        ]

        medium_risk_templates = [
            "Сторона обязуется выполнить работы в срок до {date}.",
            "При изменении условий договора требуется письменное согласие сторон.",
            "Спорные вопросы решаются путем переговоров.",
            "Исполнитель должен предоставить гарантию качества на {months} месяцев.",
            "Оплата производится в течение {days} дней после подписания акта."
        ]

        low_risk_templates = [
            "Настоящий договор вступает в силу с момента подписания.",
            "Стороны имеют право на досрочное расторжение договора по взаимному согласию.",
            "Документооборот осуществляется в электронном виде.",
            "Изменения в договор вносятся дополнительными соглашениями.",
            "Договор составлен в двух экземплярах, имеющих одинаковую юридическую силу."
        ]

        all_templates = [
            (high_risk_templates, 2),
            (medium_risk_templates, 1),
            (low_risk_templates, 0)
        ]

        for templates, risk_level in all_templates:
            for _ in range(70):  # По 70 примеров каждого класса
                template = random.choice(templates)
                text = template.format(
                    amount=random.randint(10, 500) * 1000,
                    party=random.choice(["Заказчик", "Исполнитель", "Поставщик"]),
                    percent=random.randint(1, 20),
                    date=f"{random.randint(1, 28)}.{random.randint(1, 12)}.{random.randint(2024, 2025)}",
                    months=random.randint(6, 36),
                    days=random.randint(5, 30)
                )

                tokens = text.split()
                ner_labels = self._simple_ner_tagging(tokens)

                examples.append({
                    "text": text,
                    "tokens": tokens,
                    "ner_tags": ner_labels,
                    "risk_label": risk_level
                })

        dataset = Dataset.from_list(examples)
        train_test = dataset.train_test_split(test_size=0.2, seed=42)
        val_test = train_test["test"].train_test_split(test_size=0.5, seed=42)

        return DatasetDict({
            "train": train_test["train"],
            "validation": val_test["train"],
            "test": val_test["test"]
        })

    def _create_synthetic_ner_dataset(self) -> DatasetDict:
        examples = []

        entities = {
            "PER": ["Иванов", "Петров", "Сидоров", "Козлов", "Смирнов"],
            "ORG": ["ООО Рога и Копыта", "АО Альфа-Банк", "ИП Петров", "ЗАО Бета"],
            "LOC": ["Москва", "Санкт-Петербург", "Екатеринburg", "Новосибирск"],
        }

        templates = [
            "Договор заключен между {ORG} и {PER} в городе {LOC}.",
            "Директор {ORG} {PER} подписал соглашение.",
            "Поставка товара осуществляется в {LOC} силами {ORG}.",
            "Представитель {PER} от {ORG} присутствовал на переговорах в {LOC}."
        ]

        for _ in range(300):
            template = random.choice(templates)
            selected_entities = {
                key: random.choice(values) for key, values in entities.items()
            }

            text = template.format(**selected_entities)
            tokens = text.split()

            ner_labels = [0] * len(tokens)

            for entity_type, entity_value in selected_entities.items():
                entity_tokens = entity_value.split()
                for i in range(len(tokens) - len(entity_tokens) + 1):
                    if tokens[i:i+len(entity_tokens)] == entity_tokens:
                        if entity_type == "PER":
                            ner_labels[i] = 1
                            for j in range(1, len(entity_tokens)):
                                ner_labels[i+j] = 2
                        elif entity_type == "ORG":
                            ner_labels[i] = 3
                            for j in range(1, len(entity_tokens)):
                                ner_labels[i+j] = 4
                        elif entity_type == "LOC":
                            ner_labels[i] = 5
                            for j in range(1, len(entity_tokens)):
                                ner_labels[i+j] = 6
                        break

            risk_label = random.randint(0, 2)

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

    def _simple_ner_tagging(self, tokens: List[str]) -> List[int]:
        labels = [0] * len(tokens)

        for i, token in enumerate(tokens):
            if token in ["ООО", "АО", "ЗАО", "ИП", "РФ", "Росреестр", "Минюст", "Альфа", "Бета", "Гамма"]:
                labels[i] = 3
                if i + 1 < len(tokens) and not tokens[i + 1] in [".", ",", ";"]:
                    if i + 1 < len(labels):
                        labels[i + 1] = 4

            elif (token.endswith("ов") or token.endswith("ова") or token.endswith("ин") or
                  token.endswith("ев") or token.endswith("ева") or token in ["Иванов", "Петров", "Сидоров"]):
                labels[i] = 1

            elif token in ["Москве", "Москва", "СПб", "Санкт-Петербурге", "России", "РФ"]:
                labels[i] = 5

            elif re.match(r'\d{1,2}\.\d{1,2}\.\d{4}', token):
                labels[i] = 6

            elif re.match(r'\d+000', token) or "рублей" in token:
                if labels[i] == 0:
                    labels[i] = 6

        return labels

    def _add_synthetic_risk_labels(self, example: Dict) -> Dict:
        text = example.get("text", "")
        risk_label = self._classify_risk_from_text(text)
        example["risk_label"] = risk_label
        return example

    def _convert_ruslaw_format(self, example: Dict) -> Dict:
        text = example.get("text", "")
        if not text or len(text.strip()) == 0:
            return None

        if len(text) > 2000:
            text = text[:2000]

        tokens = text.split()
        if len(tokens) == 0:
            return None

        ner_labels = self._simple_ner_tagging(tokens)

        risk_label = self._classify_risk_from_text(text)

        return {
            "text": text,
            "tokens": tokens,
            "ner_tags": ner_labels,
            "risk_label": risk_label
        }

    def _classify_risk_from_text(self, text: str) -> int:
        if not text:
            return 0

        text_lower = text.lower()

        high_risk_indicators = [
            "штраф", "санкции", "наказание", "ответственность", "неустойка",
            "нарушение", "запрещ", "недопустимо", "недействительн", "расторжение",
            "взыскание", "ущерб", "возмещение", "пеня"
        ]

        medium_risk_indicators = [
            "обязан", "должен", "требуется", "необходимо", "подлежит",
            "в случае", "при условии", "согласие", "уведомление", "гарантия"
        ]

        high_risk_count = sum(1 for indicator in high_risk_indicators if indicator in text_lower)
        medium_risk_count = sum(1 for indicator in medium_risk_indicators if indicator in text_lower)

        if high_risk_count >= 2:
            return 2
        elif high_risk_count >= 1 or medium_risk_count >= 2:
            return 1
        else:
            return 0

    def _get_ner_labels(self, dataset: DatasetDict) -> Dict[str, int]:
        if "ner_tags" in dataset["train"].features:
            all_labels = set()
            for example in dataset["train"]:
                if example.get("ner_tags"):
                    all_labels.update(example["ner_tags"])
            num_ner_labels = max(all_labels) + 1 if all_labels else 7
        else:
            num_ner_labels = 7

        return {
            "num_ner_labels": num_ner_labels,
            "num_risk_labels": 3
        }

    def _tokenize_dataset(self, dataset: DatasetDict) -> DatasetDict:
        def tokenize_function(examples):
            if "text" in examples:
                texts = examples["text"]
                tokenized = self.tokenizer(
                    texts,
                    padding="max_length",
                    truncation=True,
                    max_length=self.config.data.max_length,
                    return_tensors=None
                )
            elif "tokens" in examples:
                tokens = examples["tokens"]
                tokenized = self.tokenizer(
                    tokens,
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
                for i, labels in enumerate(examples["ner_tags"]):
                    if "tokens" in examples:
                        word_ids = tokenized.word_ids(batch_index=i)
                        aligned_labels.append(self._align_labels(labels, word_ids))
                    else:
                        aligned_labels.append(self._align_labels(labels, None))
                tokenized["ner_labels"] = aligned_labels
            else:
                tokenized["ner_labels"] = [[0] * self.config.data.max_length] * len(examples)

            if "risk_label" in examples:
                tokenized["risk_labels"] = examples["risk_label"]
            else:
                tokenized["risk_labels"] = [0] * len(examples)

            return tokenized

        tokenized_dataset = dataset.map(
            tokenize_function,
            batched=True,
            remove_columns=dataset["train"].column_names,
            batch_size=32
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
                if word_idx < len(labels):
                    aligned_labels.append(labels[word_idx])
                else:
                    aligned_labels.append(-100)
            else:
                aligned_labels.append(-100)
            previous_word_idx = word_idx

        return aligned_labels


def get_label_names() -> Dict[str, List[str]]:
    return {
        "ner_labels": ["O", "B-PER", "I-PER", "B-ORG", "I-ORG", "B-LOC", "I-LOC"],
        "risk_labels": ["Low", "Medium", "High"]
    }
