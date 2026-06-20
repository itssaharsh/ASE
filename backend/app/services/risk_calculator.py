import re
import random
from datetime import datetime
from typing import Dict
from app.models.article import ArticleInDB
from app.models.risk import RiskScore

# Mock impact matrix for cascading effects (Impact Modeling)
IMPACT_MATRIX = {
    "economy": {"social_unrest": 0.4, "political_instability": 0.3},
    "pandemic": {"economy": 0.6, "healthcare_collapse": 0.8},
    "conflict": {"economy": 0.5, "displacement": 0.7, "social_unrest": 0.5},
    "social_unrest": {"political_instability": 0.6}
}

KEYWORD_WEIGHTS = {
    "war": 80, "conflict": 70, "strike": 40, "protest": 30,
    "recession": 60, "inflation": 50, "crash": 70,
    "pandemic": 90, "virus": 50, "outbreak": 60,
    "casualty": 80, "death": 70
}

def determine_domain(text: str) -> str:
    text = text.lower()
    if any(w in text for w in ["war", "conflict", "military", "casualty"]):
        return "conflict"
    if any(w in text for w in ["recession", "inflation", "economy", "crash"]):
        return "economy"
    if any(w in text for w in ["virus", "pandemic", "outbreak", "health"]):
        return "pandemic"
    if any(w in text for w in ["protest", "strike", "riot"]):
        return "social_unrest"
    return "general"

def calculate_base_risk(text: str) -> float:
    text = text.lower()
    score = 0.0
    for keyword, weight in KEYWORD_WEIGHTS.items():
        # count occurrences of the keyword
        count = len(re.findall(r'\b' + keyword + r'\b', text))
        score += count * weight
        
    return min(score, 100.0)

def compute_crisis_risk_index(article: ArticleInDB) -> RiskScore:
    content_to_analyze = f"{article.title} {article.description or ''} {article.content or ''}"
    
    # 1. Calculate base risk score based on keyword weights
    base_score = calculate_base_risk(content_to_analyze)
    
    # 2. Determine primary domain for the article
    domain = determine_domain(content_to_analyze)
    
    # 3. Impact Modeling (Cascading effects tracing causal relationships)
    cascading_risks = {}
    if domain in IMPACT_MATRIX:
        for cascaded_domain, multiplier in IMPACT_MATRIX[domain].items():
            cascading_risks[cascaded_domain] = base_score * multiplier
            
    # 4. Total Crisis Index (weighted sum)
    # Formula: 60% base score + 40% sum of cascading risks
    cascade_sum = sum(cascading_risks.values()) if cascading_risks else 0.0
    total_score = (base_score * 0.6) + (cascade_sum * 0.4)
    total_score = min(total_score, 100.0) # Cap at 100
    
    # Mock advanced metrics
    regions = ["Southeast Asia", "Eastern Europe", "Middle East", "North America", "Sub-Saharan Africa", "East Asia", "South America", "Western Europe"]
    base_region = random.choice(regions)
    spread = {}
    if random.random() > 0.4:
        spread[random.choice(regions)] = round(random.uniform(40, 95), 1)
        if random.random() > 0.7:
            spread[random.choice(regions)] = round(random.uniform(20, 60), 1)
    
    return RiskScore(
        article_id=str(article.id),
        title=article.title,
        description=article.description,
        base_score=round(base_score, 2),
        domain=domain,
        cascading_risks={k: round(v, 2) for k, v in cascading_risks.items()},
        total_crisis_index=round(total_score, 2),
        confidence_score=round(random.uniform(70, 99), 1),
        region=base_region,
        predicted_spread=spread,
        timestamp=datetime.utcnow().isoformat() + "Z",
        source_count=random.randint(1, 45)
    )
