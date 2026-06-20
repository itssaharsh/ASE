import httpx
from fastapi import HTTPException
from app.core.config import settings
from app.models.article import ArticleCreate
from datetime import datetime

async def fetch_news_data(query: str = "war OR military OR conflict OR geopolitical"):
    """
    Fetches news data from the external News API with error handling and rate limit awareness.
    """
    params = {
        "q": query,
        "apiKey": settings.NEWS_API_KEY,
        "language": "en",
        "sortBy": "publishedAt",
        "pageSize": 50
    }
    
    async with httpx.AsyncClient() as client:
        try:
            if settings.NEWS_API_KEY == "YOUR_NEWS_API_KEY" or not settings.NEWS_API_KEY:
                raise HTTPException(status_code=401, detail="Please configure a valid NEWS_API_KEY in your .env file")

            response = await client.get(settings.NEWS_API_URL, params=params)
            
            if response.status_code == 429:
                raise HTTPException(status_code=429, detail="Rate limit exceeded for News API.")
                
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise HTTPException(status_code=exc.response.status_code, detail=f"Error from News API: {exc.response.text}")
        except httpx.RequestError as exc:
            raise HTTPException(status_code=500, detail=f"Failed to request News API: {str(exc)}")

    data = response.json()
    articles = []
    
    for item in data.get("articles", []):
        try:
            # Data validation using Pydantic
            article = ArticleCreate(
                title=item.get("title", ""),
                description=item.get("description"),
                content=item.get("content"),
                url=item.get("url"),
                published_at=datetime.strptime(item.get("publishedAt"), "%Y-%m-%dT%H:%M:%SZ"),
                source_name=item.get("source", {}).get("name", "Unknown")
            )
            articles.append(article)
        except Exception as e:
            # Data cleaning/validation failure
            print(f"Validation error parsing article '{item.get('title')}': {e}")
            continue

    return articles
