from fastapi import APIRouter, HTTPException, status, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
from models import Sweet, SweetCreate, SweetUpdate, User, MessageResponse
from auth import create_user_dependency, create_admin_dependency
from database import get_category_counts
from datetime import datetime
import uuid

def create_sweets_router(db: AsyncIOMotorDatabase):
    router = APIRouter(prefix="/sweets", tags=["sweets"])
    get_current_user = create_user_dependency(db)
    get_admin_user = create_admin_dependency(db)
    
    @router.get("/", response_model=List[Sweet])
    async def get_sweets(
        category: Optional[str] = Query(None, description="Filter by category"),
        search: Optional[str] = Query(None, description="Search in name and description"),
        featured: Optional[bool] = Query(None, description="Filter by featured status"),
        min_price: Optional[float] = Query(None, description="Minimum price filter"),
        max_price: Optional[float] = Query(None, description="Maximum price filter"),
        sort_by: Optional[str] = Query("name", description="Sort by: name, price, rating, created_at"),
        sort_order: Optional[str] = Query("asc", description="Sort order: asc, desc"),
        skip: int = Query(0, ge=0, description="Skip items for pagination"),
        limit: int = Query(100, ge=1, le=100, description="Limit items per page")
    ):
        # Build query
        query = {}
        
        if category:
            query["category"] = category
        
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}}
            ]
        
        if featured is not None:
            query["featured"] = featured
        
        if min_price is not None or max_price is not None:
            price_query = {}
            if min_price is not None:
                price_query["$gte"] = min_price
            if max_price is not None:
                price_query["$lte"] = max_price
            query["price"] = price_query
        
        # Build sort
        sort_field = sort_by
        if sort_by == "price":
            sort_field = "price"
        elif sort_by == "rating":
            sort_field = "rating"
        elif sort_by == "created_at":
            sort_field = "created_at"
        else:
            sort_field = "name"
        
        sort_direction = -1 if sort_order == "desc" else 1
        
        # Execute query
        cursor = db.sweets.find(query).sort(sort_field, sort_direction).skip(skip).limit(limit)
        sweets = await cursor.to_list(length=limit)
        
        return [Sweet(**sweet) for sweet in sweets]
    
    @router.get("/{sweet_id}", response_model=Sweet)
    async def get_sweet(sweet_id: str):
        sweet = await db.sweets.find_one({"id": sweet_id})
        if not sweet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sweet not found"
            )
        return Sweet(**sweet)
    
    @router.post("/", response_model=Sweet)
    async def create_sweet(
        sweet_data: SweetCreate,
        current_user: User = Depends(get_admin_user)
    ):
        sweet = Sweet(
            id=str(uuid.uuid4()),
            **sweet_data.dict(),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        await db.sweets.insert_one(sweet.dict())
        
        # Update category counts
        await get_category_counts(db)
        
        return sweet
    
    @router.put("/{sweet_id}", response_model=Sweet)
    async def update_sweet(
        sweet_id: str,
        sweet_data: SweetUpdate,
        current_user: User = Depends(get_admin_user)
    ):
        # Find existing sweet
        existing_sweet = await db.sweets.find_one({"id": sweet_id})
        if not existing_sweet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sweet not found"
            )
        
        # Update fields
        update_data = {k: v for k, v in sweet_data.dict().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        await db.sweets.update_one(
            {"id": sweet_id},
            {"$set": update_data}
        )
        
        # Get updated sweet
        updated_sweet = await db.sweets.find_one({"id": sweet_id})
        
        # Update category counts
        await get_category_counts(db)
        
        return Sweet(**updated_sweet)
    
    @router.delete("/{sweet_id}", response_model=MessageResponse)
    async def delete_sweet(
        sweet_id: str,
        current_user: User = Depends(get_admin_user)
    ):
        # Find sweet
        sweet = await db.sweets.find_one({"id": sweet_id})
        if not sweet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sweet not found"
            )
        
        # Delete sweet
        await db.sweets.delete_one({"id": sweet_id})
        
        # Update category counts
        await get_category_counts(db)
        
        return MessageResponse(message="Sweet deleted successfully")
    
    @router.patch("/{sweet_id}/stock", response_model=Sweet)
    async def update_stock(
        sweet_id: str,
        stock: int,
        current_user: User = Depends(get_admin_user)
    ):
        # Find sweet
        sweet = await db.sweets.find_one({"id": sweet_id})
        if not sweet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sweet not found"
            )
        
        # Update stock
        await db.sweets.update_one(
            {"id": sweet_id},
            {"$set": {"stock": stock, "updated_at": datetime.utcnow()}}
        )
        
        # Get updated sweet
        updated_sweet = await db.sweets.find_one({"id": sweet_id})
        return Sweet(**updated_sweet)
    
    @router.patch("/{sweet_id}/featured", response_model=Sweet)
    async def toggle_featured(
        sweet_id: str,
        featured: bool,
        current_user: User = Depends(get_admin_user)
    ):
        # Find sweet
        sweet = await db.sweets.find_one({"id": sweet_id})
        if not sweet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sweet not found"
            )
        
        # Update featured status
        await db.sweets.update_one(
            {"id": sweet_id},
            {"$set": {"featured": featured, "updated_at": datetime.utcnow()}}
        )
        
        # Get updated sweet
        updated_sweet = await db.sweets.find_one({"id": sweet_id})
        return Sweet(**updated_sweet)
    
    return router