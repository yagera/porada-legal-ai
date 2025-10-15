import torch
import asyncio
import time
from typing import Dict, Any, List
import logging
from pathlib import Path
import sys

sys.path.append('/app/ml-service/src')

from transformers import AutoTokenizer

try:
    from models import MultiTaskLegalModel
    from legal_dataset import get_label_names
except ImportError:
    import sys
    import os
    ml_service_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'ml-service', 'src')
    sys.path.insert(0, ml_service_path)
    from models import MultiTaskLegalModel
    from legal_dataset import get_label_names

from ..models.analysis import AnalysisResult, Entity, RiskAnalysis
from ..config import settings

logger = logging.getLogger(__name__)

class ModelService:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.label_names = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.is_model_loaded = False
        
    async def initialize(self):
        try:
            logger.info("Loading model...")
            
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self._load_model)
            
            self.is_model_loaded = True
            logger.info("Model loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            raise
    
    def _load_model(self):
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(settings.model_name)
            
            model_path = Path(settings.model_path)
            if not model_path.exists():
                raise FileNotFoundError(f"Model path not found: {model_path}")
            
            self.model = MultiTaskLegalModel.from_pretrained(
                str(model_path), 
                settings.model_name
            )
            
            self.model.to(self.device)
            self.model.eval()
            
            self.label_names = get_label_names()
            
            logger.info(f"Model loaded from {model_path}")
            logger.info(f"Device: {self.device}")
            logger.info(f"Model parameters: {sum(p.numel() for p in self.model.parameters())}")
            
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise
    
    async def analyze_document(self, text: str) -> AnalysisResult:
        if not self.is_model_loaded:
            raise RuntimeError("Model not loaded")
        
        start_time = time.time()
        
        try:
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(None, self._analyze_text, text)
            
            processing_time = time.time() - start_time
            result.processing_time = processing_time
            
            return result
            
        except Exception as e:
            logger.error(f"Error analyzing document: {str(e)}")
            raise
    
    def _analyze_text(self, text: str) -> AnalysisResult:
        encoding = self.tokenizer(
            text,
            padding="max_length",
            truncation=True,
            max_length=512,
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
        
        entities = self._extract_entities(
            self.tokenizer.convert_ids_to_tokens(input_ids[0]),
            ner_predictions[0],
            attention_mask[0]
        )
        
        risk_label = self.label_names["risk_labels"][risk_prediction.item()]
        risk_confidence = risk_probs[0][risk_prediction].item()
        risk_probabilities = {
            label: prob.item()
            for label, prob in zip(self.label_names["risk_labels"], risk_probs[0])
        }
        
        return AnalysisResult(
            entities=entities,
            risk_analysis=RiskAnalysis(
                level=risk_label,
                confidence=risk_confidence,
                probabilities=risk_probabilities
            ),
            text=text,
            processing_time=0.0
        )
    
    def _extract_entities(self, tokens: List[str], predictions: torch.Tensor, attention_mask: torch.Tensor) -> List[Entity]:
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
                current_entity = Entity(
                    label=pred_label[2:],
                    text=self._clean_token(token),
                    start=i,
                    end=i,
                    confidence=0.9
                )
            elif pred_label.startswith("I-") and current_entity:
                if pred_label[2:] == current_entity.label:
                    current_entity.text += self._clean_token(token)
                    current_entity.end = i
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
    
    def is_loaded(self) -> bool:
        return self.is_model_loaded
