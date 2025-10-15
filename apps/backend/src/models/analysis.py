from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class Entity(BaseModel):
    label: str
    text: str
    start: int
    end: int
    confidence: float

class RiskAnalysis(BaseModel):
    level: str  # Low, Medium, High
    confidence: float
    probabilities: Dict[str, float]

class AnalysisResult(BaseModel):
    entities: List[Entity]
    risk_analysis: RiskAnalysis
    text: str
    processing_time: float

class AnalysisRequest(BaseModel):
    text: Optional[str] = None
    analysis_type: str = "full"

class AnalysisResponse(BaseModel):
    analysis_id: str
    file_id: str
    filename: str
    analysis_result: AnalysisResult
    status: str
    created_at: datetime
    processing_time: float

class DocumentInfo(BaseModel):
    analysis_id: str
    filename: str
    status: str
    risk_level: str
    created_at: datetime
    file_size: int
