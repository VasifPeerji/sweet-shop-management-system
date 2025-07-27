from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from models import Category, User, MessageResponse
from auth import create_admin_dependency
from database import get_category_counts

def create_categories_router(db: AsyncIOMotorDatabase):
    router = APIRouter(prefix="/categories", tags=["categories"])
    get_admin_user = create_admin_dependency(db)
    
    @router.get("/", response_model=List[Category])
    async def get_categories():
        # Update counts first
        await get_category_counts(db)
        
        # Get categories
        categories = await db.categories.find().to_list(100)
        return [Category(**category) for category in categories]
    
    @router.post("/refresh-counts", response_model=MessageResponse)
    async def refresh_category_counts(current_user: User = Depends(get_admin_user)):
        await get_category_counts(db)
        return MessageResponse(message="Category counts refreshed successfully")
    
    return router