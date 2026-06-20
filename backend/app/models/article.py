from pydantic import BaseModel, Field, HttpUrl
from typing import Optional
from datetime import datetime

class ArticleBase(BaseModel):
    title: str
    description: Optional[str] = None
    content: Optional[str] = None
    url: HttpUrl
    published_at: datetime
    source_name: str

class ArticleCreate(ArticleBase):
    pass

class ArticleInDB(ArticleBase):
    id: str = Field(alias="_id")
