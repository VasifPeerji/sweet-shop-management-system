from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from models import Cart, CartItem, CartAddRequest, CartUpdateRequest, User, MessageResponse
from auth import create_user_dependency
from datetime import datetime

def create_cart_router(db: AsyncIOMotorDatabase):
    router = APIRouter(prefix="/cart", tags=["cart"])
    get_current_user = create_user_dependency(db)
    
    @router.get("/", response_model=Cart)
    async def get_cart(current_user: User = Depends(get_current_user)):
        cart = await db.carts.find_one({"user_id": current_user.id})
        if not cart:
            # Create empty cart
            cart = Cart(user_id=current_user.id)
            await db.carts.insert_one(cart.dict())
        else:
            cart = Cart(**cart)
        return cart
    
    @router.post("/add", response_model=Cart)
    async def add_to_cart(
        request: CartAddRequest,
        current_user: User = Depends(get_current_user)
    ):
        # Find the sweet
        sweet = await db.sweets.find_one({"id": request.sweet_id})
        if not sweet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sweet not found"
            )
        
        # Check stock
        if sweet["stock"] < request.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Not enough stock available"
            )
        
        # Find or create cart
        cart = await db.carts.find_one({"user_id": current_user.id})
        if not cart:
            cart = Cart(user_id=current_user.id)
            cart_dict = cart.dict()
        else:
            cart_dict = cart
        
        # Create cart item
        cart_item = CartItem(
            sweet_id=request.sweet_id,
            quantity=request.quantity,
            price=sweet["price"],
            name=sweet["name"],
            image=sweet["image"],
            weight=sweet["weight"]
        )
        
        # Check if item already exists in cart
        existing_item_index = None
        for i, item in enumerate(cart_dict.get("items", [])):
            if item["sweet_id"] == request.sweet_id:
                existing_item_index = i
                break
        
        if existing_item_index is not None:
            # Update quantity
            cart_dict["items"][existing_item_index]["quantity"] += request.quantity
        else:
            # Add new item
            if "items" not in cart_dict:
                cart_dict["items"] = []
            cart_dict["items"].append(cart_item.dict())
        
        # Calculate total
        total = sum(item["price"] * item["quantity"] for item in cart_dict["items"])
        cart_dict["total"] = total
        cart_dict["updated_at"] = datetime.utcnow()
        
        # Save cart
        await db.carts.replace_one(
            {"user_id": current_user.id},
            cart_dict,
            upsert=True
        )
        
        return Cart(**cart_dict)
    
    @router.put("/item/{sweet_id}", response_model=Cart)
    async def update_cart_item(
        sweet_id: str,
        request: CartUpdateRequest,
        current_user: User = Depends(get_current_user)
    ):
        # Find cart
        cart = await db.carts.find_one({"user_id": current_user.id})
        if not cart:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart not found"
            )
        
        # Find item in cart
        item_index = None
        for i, item in enumerate(cart["items"]):
            if item["sweet_id"] == sweet_id:
                item_index = i
                break
        
        if item_index is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item not found in cart"
            )
        
        # Update quantity or remove item
        if request.quantity <= 0:
            cart["items"].pop(item_index)
        else:
            # Check stock
            sweet = await db.sweets.find_one({"id": sweet_id})
            if sweet and sweet["stock"] < request.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Not enough stock available"
                )
            
            cart["items"][item_index]["quantity"] = request.quantity
        
        # Calculate total
        total = sum(item["price"] * item["quantity"] for item in cart["items"])
        cart["total"] = total
        cart["updated_at"] = datetime.utcnow()
        
        # Save cart
        await db.carts.replace_one(
            {"user_id": current_user.id},
            cart
        )
        
        return Cart(**cart)
    
    @router.delete("/item/{sweet_id}", response_model=Cart)
    async def remove_from_cart(
        sweet_id: str,
        current_user: User = Depends(get_current_user)
    ):
        # Find cart
        cart = await db.carts.find_one({"user_id": current_user.id})
        if not cart:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart not found"
            )
        
        # Remove item
        cart["items"] = [item for item in cart["items"] if item["sweet_id"] != sweet_id]
        
        # Calculate total
        total = sum(item["price"] * item["quantity"] for item in cart["items"])
        cart["total"] = total
        cart["updated_at"] = datetime.utcnow()
        
        # Save cart
        await db.carts.replace_one(
            {"user_id": current_user.id},
            cart
        )
        
        return Cart(**cart)
    
    @router.delete("/clear", response_model=MessageResponse)
    async def clear_cart(current_user: User = Depends(get_current_user)):
        await db.carts.update_one(
            {"user_id": current_user.id},
            {"$set": {"items": [], "total": 0, "updated_at": datetime.utcnow()}}
        )
        return MessageResponse(message="Cart cleared successfully")
    
    return router