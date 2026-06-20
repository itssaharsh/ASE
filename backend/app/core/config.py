from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Global Crisis Monitoring and Risk Analysis System"
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "crisis_monitoring"
    NEWS_API_KEY: str = "YOUR_NEWS_API_KEY"
    NEWS_API_URL: str = "https://newsapi.org/v2/everything"

    class Config:
        env_file = ".env"

settings = Settings()
