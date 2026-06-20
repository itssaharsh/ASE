from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.db.mongodb import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.services.risk_calculator import compute_crisis_risk_index
from app.models.article import ArticleInDB
from app.models.risk import RiskScore

router = APIRouter()

@router.post("/calculate-batch", response_model=List[RiskScore])
async def calculate_risks_for_latest_articles(limit: int = 100, db: AsyncIOMotorDatabase = Depends(get_database)):
    """
    Fetches unanalyzed articles, calculates their Crisis Risk Index, and returns the scores.
    """
    collection = db["articles"]
    cursor = collection.find().sort("published_at", -1).limit(limit)
    articles_data = await cursor.to_list(length=limit)
    
    if not articles_data:
        raise HTTPException(status_code=404, detail="No articles found to analyze.")
        
    results = []
    scores_collection = db["risk_scores"]
    scores_to_insert = []
    
    for item in articles_data:
        article = ArticleInDB(**item)
        risk_score = compute_crisis_risk_index(article)
        results.append(risk_score)
        scores_to_insert.append(risk_score.model_dump(mode='json'))
        
    # Store scores for visualization layer
    if scores_to_insert:
        try:
            # unordered insert to ignore potential duplicates if we run multiple times
            await scores_collection.insert_many(scores_to_insert, ordered=False)
        except Exception as e:
            print(f"Error inserting risk scores: {e}")
            
    return results

@router.get("/live", response_model=List[RiskScore])
async def calculate_live_risks(limit: int = 20):
    """
    Fetches LIVE data directly, calculates risk indices, and returns the scores,
    bypassing the database for immediate visualization testing.
    """
    from app.services.news_api import fetch_news_data
    import uuid
    try:
        articles = await fetch_news_data()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    if not articles:
        raise HTTPException(status_code=404, detail="No live articles found.")
        
    results = []
    
    import random
    random.shuffle(articles)
    
    # Take a random subset of 'limit' articles to simulate a constantly changing live stream
    for article_create in articles[:limit]:
        article = ArticleInDB(**article_create.model_dump(), _id=str(uuid.uuid4()))
        risk_score = compute_crisis_risk_index(article)
        results.append(risk_score)
        
    return results
