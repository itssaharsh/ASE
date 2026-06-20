from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.api.routes import ingestion, risk

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

app.include_router(ingestion.router, prefix="/api/v1/data", tags=["data ingestion"])
app.include_router(risk.router, prefix="/api/v1/risk", tags=["risk analysis"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Global Crisis Monitoring API"}
