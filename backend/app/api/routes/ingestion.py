from fastapi import APIRouter, Depends, HTTPException
from app.services.news_api import fetch_news_data
from app.db.mongodb import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import IndexModel, ASCENDING

router = APIRouter()

@router.post("/ingest", status_code=201)
async def ingest_news_data(db: AsyncIOMotorDatabase = Depends(get_database)):
    """
    Ingest data from News API and store it in MongoDB.
    """
    articles = await fetch_news_data()
    
    if not articles:
        raise HTTPException(status_code=404, detail="No articles found.")
        
    articles_dict = [article.model_dump(mode='json') for article in articles]
    
    collection = db["articles"]
    
    # Ensure URL is unique to avoid duplicates
    await collection.create_indexes([
        IndexModel([("url", ASCENDING)], unique=True)
    ])
    
    inserted_count = 0
    try:
        # ordered=False allows inserting the rest even if some throw duplicate key errors
        result = await collection.insert_many(articles_dict, ordered=False)
        inserted_count = len(result.inserted_ids)
    except Exception as e:
        # Ignore BulkWriteError for duplicates, count what was inserted
        if hasattr(e, "details") and "nInserted" in e.details:
            inserted_count = e.details["nInserted"]
            
    return {"message": f"Successfully ingested {inserted_count} new articles"}
