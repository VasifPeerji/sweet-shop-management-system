from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import User, AdminStatsResponse, MessageResponse
from auth import create_admin_dependency
from datetime import datetime
from typing import Dict, Any

def create_admin_router(db: AsyncIOMotorDatabase):
    router = APIRouter(prefix="/admin", tags=["admin"])
    get_admin_user = create_admin_dependency(db)
    
    @router.get("/stats", response_model=AdminStatsResponse)
    async def get_admin_stats(current_user: User = Depends(get_admin_user)):
        # Get sweet statistics
        total_sweets = await db.sweets.count_documents({})
        low_stock_count = await db.sweets.count_documents({"stock": {"$lte": 5, "$gt": 0}})
        out_of_stock_count = await db.sweets.count_documents({"stock": 0})
        featured_count = await db.sweets.count_documents({"featured": True})
        
        # Get order statistics
        total_orders = await db.orders.count_documents({})
        
        # Calculate total revenue
        revenue_pipeline = [
            {"$group": {"_id": None, "total": {"$sum": "$total"}}}
        ]
        revenue_result = await db.orders.aggregate(revenue_pipeline).to_list(1)
        total_revenue = revenue_result[0]["total"] if revenue_result else 0
        
        # Get recent orders
        recent_orders = await db.orders.find().sort("created_at", -1).limit(5).to_list(5)
        
        return AdminStatsResponse(
            total_sweets=total_sweets,
            low_stock_count=low_stock_count,
            out_of_stock_count=out_of_stock_count,
            featured_count=featured_count,
            total_orders=total_orders,
            total_revenue=total_revenue,
            recent_orders=recent_orders
        )
    
    @router.get("/users")
    async def get_users(current_user: User = Depends(get_admin_user)):
        users = await db.users.find(
            {},
            {"password": 0}  # Exclude password from response
        ).to_list(100)
        return users
    
    @router.get("/orders")
    async def get_all_orders(current_user: User = Depends(get_admin_user)):
        orders = await db.orders.find().sort("created_at", -1).to_list(100)
        return orders
    
    @router.patch("/order/{order_id}/status")
    async def update_order_status(
        order_id: str,
        status: str,
        current_user: User = Depends(get_admin_user)
    ):
        # Update order status
        result = await db.orders.update_one(
            {"id": order_id},
            {"$set": {"status": status, "updated_at": datetime.utcnow()}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        return MessageResponse(message="Order status updated successfully")
    
    @router.get("/dashboard-data")
    async def get_dashboard_data(current_user: User = Depends(get_admin_user)):
        # Get comprehensive dashboard data
        
        # Sweet statistics
        sweet_stats = {
            "total": await db.sweets.count_documents({}),
            "low_stock": await db.sweets.count_documents({"stock": {"$lte": 5, "$gt": 0}}),
            "out_of_stock": await db.sweets.count_documents({"stock": 0}),
            "featured": await db.sweets.count_documents({"featured": True})
        }
        
        # Category distribution
        category_pipeline = [
            {"$group": {"_id": "$category", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        category_distribution = await db.sweets.aggregate(category_pipeline).to_list(10)
        
        # Order statistics
        order_stats = {
            "total": await db.orders.count_documents({}),
            "pending": await db.orders.count_documents({"status": "pending"}),
            "completed": await db.orders.count_documents({"status": "completed"}),
            "cancelled": await db.orders.count_documents({"status": "cancelled"})
        }
        
        # Revenue data
        revenue_pipeline = [
            {"$group": {"_id": None, "total": {"$sum": "$total"}}}
        ]
        revenue_result = await db.orders.aggregate(revenue_pipeline).to_list(1)
        total_revenue = revenue_result[0]["total"] if revenue_result else 0
        
        # Top selling sweets
        top_sweets_pipeline = [
            {"$unwind": "$items"},
            {"$group": {
                "_id": "$items.sweet_id",
                "name": {"$first": "$items.name"},
                "quantity_sold": {"$sum": "$items.quantity"},
                "revenue": {"$sum": {"$multiply": ["$items.price", "$items.quantity"]}}
            }},
            {"$sort": {"quantity_sold": -1}},
            {"$limit": 5}
        ]
        top_sweets = await db.orders.aggregate(top_sweets_pipeline).to_list(5)
        
        # Recent activity
        recent_orders = await db.orders.find().sort("created_at", -1).limit(10).to_list(10)
        
        return {
            "sweet_stats": sweet_stats,
            "category_distribution": category_distribution,
            "order_stats": order_stats,
            "total_revenue": total_revenue,
            "top_sweets": top_sweets,
            "recent_orders": recent_orders
        }
    
    return router