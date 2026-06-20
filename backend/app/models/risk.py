from pydantic import BaseModel
from typing import Dict, Optional

class RiskScore(BaseModel):
    article_id: str
    title: str
    description: Optional[str] = None
    base_score: float
    domain: str
    cascading_risks: Dict[str, float]
    total_crisis_index: float
    confidence_score: float
    region: str
    predicted_spread: Dict[str, float]
    timestamp: str
    source_count: int
