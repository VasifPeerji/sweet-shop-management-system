from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import Wishlist, WishlistItem, User, MessageResponse
from auth import create_user_dependency
from datetime import datetime

def create_wishlist_router(db: AsyncIOMotorDatabase):
    router = APIRouter(prefix="/wishlist", tags=["wishlist"])
    get_current_user = create_user_dependency(db)
    
    @router.get("/", response_model=Wishlist)
    async def get_wishlist(current_user: User = Depends(get_current_user)):
        wishlist = await db.wishlists.find_one({"user_id": current_user.id})
        if not wishlist:
            # Create empty wishlist
            wishlist = Wishlist(user_id=current_user.id)
            await db.wishlists.insert_one(wishlist.dict())
        else:
            wishlist = Wishlist(**wishlist)
        return wishlist
    
    @router.post("/add/{sweet_id}", response_model=Wishlist)
    async def add_to_wishlist(
        sweet_id: str,
        current_user: User = Depends(get_current_user)
    ):
        # Find the sweet
        sweet = await db.sweets.find_one({"id": sweet_id})
        if not sweet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sweet not found"
            )
        
        # Find or create wishlist
        wishlist = await db.wishlists.find_one({"user_id": current_user.id})
        if not wishlist:
            wishlist = Wishlist(user_id=current_user.id)
            wishlist_dict = wishlist.dict()
        else:
            wishlist_dict = wishlist
        
        # Check if item already exists in wishlist
        existing_item = None
        for item in wishlist_dict.get("items", []):
            if item["sweet_id"] == sweet_id:
                existing_item = item
                break
        
        if existing_item:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Item already in wishlist"
            )
        
        # Create wishlist item
        wishlist_item = WishlistItem(
            sweet_id=sweet_id,
            name=sweet["name"],
            image=sweet["image"],
            price=sweet["price"],
            added_at=datetime.utcnow()
        )
        
        # Add item to wishlist
        if "items" not in wishlist_dict:
            wishlist_dict["items"] = []
        wishlist_dict["items"].append(wishlist_item.dict())
        wishlist_dict["updated_at"] = datetime.utcnow()
        
        # Save wishlist
        await db.wishlists.replace_one(
            {"user_id": current_user.id},
            wishlist_dict,
            upsert=True
        )
        
        return Wishlist(**wishlist_dict)
    
    @router.delete("/remove/{sweet_id}", response_model=Wishlist)
    async def remove_from_wishlist(
        sweet_id: str,
        current_user: User = Depends(get_current_user)
    ):
        # Find wishlist
        wishlist = await db.wishlists.find_one({"user_id": current_user.id})
        if not wishlist:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Wishlist not found"
            )
        
        # Remove item
        wishlist["items"] = [item for item in wishlist["items"] if item["sweet_id"] != sweet_id]
        wishlist["updated_at"] = datetime.utcnow()
        
        # Save wishlist
        await db.wishlists.replace_one(
            {"user_id": current_user.id},
            wishlist
        )
        
        return Wishlist(**wishlist)
    
    @router.delete("/clear", response_model=MessageResponse)
    async def clear_wishlist(current_user: User = Depends(get_current_user)):
        await db.wishlists.update_one(
            {"user_id": current_user.id},
            {"$set": {"items": [], "updated_at": datetime.utcnow()}}
        )
        return MessageResponse(message="Wishlist cleared successfully")
    
    return router