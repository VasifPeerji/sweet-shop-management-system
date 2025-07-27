from motor.motor_asyncio import AsyncIOMotorDatabase
from models import Sweet, Category, User, UserRole
from datetime import datetime
import uuid

async def init_database(db: AsyncIOMotorDatabase):
    """Initialize database with sample data"""
    
    # Check if data already exists
    existing_sweets = await db.sweets.count_documents({})
    if existing_sweets > 0:
        print("Database already initialized")
        return
    
    # Create admin user
    admin_user = {
        "id": str(uuid.uuid4()),
        "name": "Admin User",
        "email": "admin@sweetshop.com",
        "password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",  # password: admin123
        "role": "admin",
        "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        "provider": "email",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    await db.users.insert_one(admin_user)
    
    # Create categories
    categories = [
        {
            "id": str(uuid.uuid4()),
            "name": "Indian Sweets",
            "icon": "🍮",
            "description": "Traditional Indian sweets and desserts",
            "count": 0,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Chocolates",
            "icon": "🍫",
            "description": "Premium chocolates and cocoa treats",
            "count": 0,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Cupcakes",
            "icon": "🧁",
            "description": "Freshly baked cupcakes and muffins",
            "count": 0,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Gummies",
            "icon": "🍬",
            "description": "Soft and chewy gummy candies",
            "count": 0,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Candies",
            "icon": "🍭",
            "description": "Hard candies and lollipops",
            "count": 0,
            "created_at": datetime.utcnow()
        }
    ]
    await db.categories.insert_many(categories)
    
    # Create sample sweets
    sweets = [
        {
            "id": str(uuid.uuid4()),
            "name": "Gulab Jamun",
            "category": "Indian Sweets",
            "price": 25.0,
            "original_price": 30.0,
            "description": "Soft, spongy balls soaked in rose-flavored sugar syrup",
            "image": "https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwxfHxndWxhYiUyMGphbXVufGVufDB8fHx8MTc1MzQ2MzAxMnww&ixlib=rb-4.1.0&q=85",
            "stock": 50,
            "weight": "250g",
            "ingredients": ["Milk solids", "Sugar", "Rose water", "Cardamom"],
            "featured": True,
            "rating": 4.8,
            "reviews": 125,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Kaju Katli",
            "category": "Indian Sweets",
            "price": 45.0,
            "original_price": 50.0,
            "description": "Diamond-shaped cashew fudge with silver leaf",
            "image": "https://images.unsplash.com/photo-1699708263762-00ca477760bd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwyfHxJbmRpYW4lMjBzd2VldHN8ZW58MHx8fHwxNzUzNDYzMDAzfDA&ixlib=rb-4.1.0&q=85",
            "stock": 30,
            "weight": "500g",
            "ingredients": ["Cashews", "Sugar", "Ghee", "Silver leaf"],
            "featured": True,
            "rating": 4.9,
            "reviews": 89,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Boondi Laddu",
            "category": "Indian Sweets",
            "price": 20.0,
            "original_price": 25.0,
            "description": "Traditional gram flour pearls shaped into perfect spheres",
            "image": "https://images.unsplash.com/photo-1635952346904-95f2ccfcd029?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBzd2VldHN8ZW58MHx8fHwxNzUzNDYzMDAzfDA&ixlib=rb-4.1.0&q=85",
            "stock": 40,
            "weight": "400g",
            "ingredients": ["Gram flour", "Sugar", "Ghee", "Cardamom", "Almonds"],
            "featured": True,
            "rating": 4.7,
            "reviews": 156,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Rasmalai",
            "category": "Indian Sweets",
            "price": 35.0,
            "original_price": 40.0,
            "description": "Soft cottage cheese dumplings in flavored milk",
            "image": "https://images.unsplash.com/photo-1694402594431-23c594be1745?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwxfHxyYXNtYWxhaXxlbnwwfHx8fDE3NTM0NjMwNDl8MA&ixlib=rb-4.1.0&q=85",
            "stock": 25,
            "weight": "300g",
            "ingredients": ["Cottage cheese", "Milk", "Sugar", "Cardamom", "Pistachios"],
            "featured": False,
            "rating": 4.6,
            "reviews": 78,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Til Ladoo",
            "category": "Indian Sweets",
            "price": 18.0,
            "original_price": 22.0,
            "description": "Sesame seed balls with jaggery, perfect for winter",
            "image": "https://images.unsplash.com/photo-1610508500445-a4592435e27e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHw0fHxsYWRkdXxlbnwwfHx8fDE3NTM0NjMwMjJ8MA&ixlib=rb-4.1.0&q=85",
            "stock": 35,
            "weight": "200g",
            "ingredients": ["Sesame seeds", "Jaggery", "Cardamom"],
            "featured": False,
            "rating": 4.5,
            "reviews": 92,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Mixed Sweets Platter",
            "category": "Indian Sweets",
            "price": 80.0,
            "original_price": 100.0,
            "description": "Assorted traditional Indian sweets platter",
            "image": "https://images.unsplash.com/photo-1695568181747-f54dff1d4654?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwzfHxJbmRpYW4lMjBzd2VldHN8ZW58MHx8fHwxNzUzNDYzMDAzfDA&ixlib=rb-4.1.0&q=85",
            "stock": 15,
            "weight": "1kg",
            "ingredients": ["Assorted sweets", "Dry fruits", "Silver leaf"],
            "featured": True,
            "rating": 4.8,
            "reviews": 134,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Chocolate Truffles",
            "category": "Chocolates",
            "price": 40.0,
            "original_price": 45.0,
            "description": "Rich dark chocolate truffles with cocoa coating",
            "image": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=500&fit=crop",
            "stock": 60,
            "weight": "250g",
            "ingredients": ["Dark chocolate", "Cream", "Cocoa powder", "Butter"],
            "featured": False,
            "rating": 4.7,
            "reviews": 201,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Milk Chocolate Cupcakes",
            "category": "Cupcakes",
            "price": 15.0,
            "original_price": 18.0,
            "description": "Fluffy vanilla cupcakes with chocolate frosting",
            "image": "https://images.unsplash.com/photo-1587668178277-295251f900ce?w=500&h=500&fit=crop",
            "stock": 45,
            "weight": "100g",
            "ingredients": ["Flour", "Sugar", "Eggs", "Butter", "Chocolate"],
            "featured": False,
            "rating": 4.6,
            "reviews": 167,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Gummy Bears",
            "category": "Gummies",
            "price": 12.0,
            "original_price": 15.0,
            "description": "Colorful fruit-flavored gummy bears",
            "image": "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=500&h=500&fit=crop",
            "stock": 100,
            "weight": "200g",
            "ingredients": ["Gelatin", "Sugar", "Fruit flavors", "Colors"],
            "featured": False,
            "rating": 4.4,
            "reviews": 89,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Assorted Candies",
            "category": "Candies",
            "price": 8.0,
            "original_price": 10.0,
            "description": "Mixed hard candies in various flavors",
            "image": "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&h=500&fit=crop",
            "stock": 80,
            "weight": "300g",
            "ingredients": ["Sugar", "Corn syrup", "Natural flavors", "Colors"],
            "featured": False,
            "rating": 4.3,
            "reviews": 156,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    await db.sweets.insert_many(sweets)
    
    # Update category counts
    for category in categories:
        count = await db.sweets.count_documents({"category": category["name"]})
        await db.categories.update_one(
            {"name": category["name"]},
            {"$set": {"count": count}}
        )
    
    print("Database initialized successfully with sample data")

async def get_category_counts(db: AsyncIOMotorDatabase):
    """Update category counts based on current sweets"""
    categories = await db.categories.find().to_list(100)
    for category in categories:
        count = await db.sweets.count_documents({"category": category["name"]})
        await db.categories.update_one(
            {"id": category["id"]},
            {"$set": {"count": count}}
        )