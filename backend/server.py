from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from datetime import datetime

# Import route modules
from routes.auth import create_auth_router
from routes.sweets import create_sweets_router
from routes.categories import create_categories_router
from routes.cart import create_cart_router
from routes.wishlist import create_wishlist_router
from routes.orders import create_orders_router
from routes.admin import create_admin_router
from database import init_database

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Sweet Shop API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Health check endpoint
@api_router.get("/")
async def root():
    return {"message": "Sweet Shop API is running!", "timestamp": datetime.utcnow()}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Include all route modules
api_router.include_router(create_auth_router(db))
api_router.include_router(create_sweets_router(db))
api_router.include_router(create_categories_router(db))
api_router.include_router(create_cart_router(db))
api_router.include_router(create_wishlist_router(db))
api_router.include_router(create_orders_router(db))
api_router.include_router(create_admin_router(db))

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    logger.info("Starting Sweet Shop API...")
    await init_database(db)
    logger.info("Database initialized successfully")

@app.on_event("shutdown")
async def shutdown_db_client():
    logger.info("Shutting down Sweet Shop API...")
    client.close()
