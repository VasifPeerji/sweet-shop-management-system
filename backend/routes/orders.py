from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from models import Order, OrderCreate, OrderItem, User, MessageResponse
from auth import create_user_dependency
from datetime import datetime
import uuid

def create_orders_router(db: AsyncIOMotorDatabase):
    router = APIRouter(prefix="/orders", tags=["orders"])
    get_current_user = create_user_dependency(db)
    
    @router.get("/", response_model=List[Order])
    async def get_user_orders(current_user: User = Depends(get_current_user)):
        orders = await db.orders.find({"user_id": current_user.id}).sort("created_at", -1).to_list(100)
        return [Order(**order) for order in orders]
    
    @router.post("/", response_model=Order)
    async def create_order(
        order_data: OrderCreate,
        current_user: User = Depends(get_current_user)
    ):
        # Get user's cart
        cart = await db.carts.find_one({"user_id": current_user.id})
        if not cart or not cart.get("items"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cart is empty"
            )
        
        # Validate stock for all items
        for cart_item in cart["items"]:
            sweet = await db.sweets.find_one({"id": cart_item["sweet_id"]})
            if not sweet:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Sweet {cart_item['name']} not found"
                )
            
            if sweet["stock"] < cart_item["quantity"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Not enough stock for {cart_item['name']}"
                )
        
        # Create order items
        order_items = []
        for cart_item in cart["items"]:
            order_item = OrderItem(
                sweet_id=cart_item["sweet_id"],
                name=cart_item["name"],
                quantity=cart_item["quantity"],
                price=cart_item["price"],
                image=cart_item["image"]
            )
            order_items.append(order_item)
        
        # Create order
        order = Order(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            items=order_items,
            total=cart["total"],
            address=order_data.address,
            phone=order_data.phone,
            notes=order_data.notes,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # Save order
        await db.orders.insert_one(order.dict())
        
        # Update stock for all items
        for cart_item in cart["items"]:
            await db.sweets.update_one(
                {"id": cart_item["sweet_id"]},
                {"$inc": {"stock": -cart_item["quantity"]}}
            )
        
        # Clear cart
        await db.carts.update_one(
            {"user_id": current_user.id},
            {"$set": {"items": [], "total": 0, "updated_at": datetime.utcnow()}}
        )
        
        return order
    
    @router.get("/{order_id}", response_model=Order)
    async def get_order(
        order_id: str,
        current_user: User = Depends(get_current_user)
    ):
        order = await db.orders.find_one({"id": order_id, "user_id": current_user.id})
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        return Order(**order)
    
    @router.patch("/{order_id}/cancel", response_model=MessageResponse)
    async def cancel_order(
        order_id: str,
        current_user: User = Depends(get_current_user)
    ):
        # Find order
        order = await db.orders.find_one({"id": order_id, "user_id": current_user.id})
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        # Check if order can be cancelled
        if order["status"] in ["delivered", "cancelled"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Order cannot be cancelled"
            )
        
        # Update order status
        await db.orders.update_one(
            {"id": order_id},
            {"$set": {"status": "cancelled", "updated_at": datetime.utcnow()}}
        )
        
        # Restore stock
        for item in order["items"]:
            await db.sweets.update_one(
                {"id": item["sweet_id"]},
                {"$inc": {"stock": item["quantity"]}}
            )
        
        return MessageResponse(message="Order cancelled successfully")
    
    return router