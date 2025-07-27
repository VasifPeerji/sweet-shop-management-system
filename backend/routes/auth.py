from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import (
    User, UserCreate, UserLogin, UserResponse, TokenResponse, 
    SocialLoginData, MessageResponse, UserRole
)
from auth import (
    verify_password, get_password_hash, create_access_token,
    create_user_dependency
)
from datetime import timedelta, datetime
import uuid

def create_auth_router(db: AsyncIOMotorDatabase):
    router = APIRouter(prefix="/auth", tags=["authentication"])
    get_current_user = create_user_dependency(db)
    
    @router.post("/register", response_model=TokenResponse)
    async def register(user_data: UserCreate):
        # Check if user already exists
        existing_user = await db.users.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        user = User(
            id=str(uuid.uuid4()),
            name=user_data.name,
            email=user_data.email,
            role=user_data.role,
            avatar=user_data.avatar,
            provider="email"
        )
        
        # Hash password and store user
        user_dict = user.dict()
        user_dict["password"] = get_password_hash(user_data.password)
        
        await db.users.insert_one(user_dict)
        
        # Create access token
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": user.id}, expires_delta=access_token_expires
        )
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse(
                id=user.id,
                name=user.name,
                email=user.email,
                role=user.role,
                avatar=user.avatar,
                provider=user.provider
            )
        )
    
    @router.post("/login", response_model=TokenResponse)
    async def login(user_data: UserLogin):
        # Find user
        user_doc = await db.users.find_one({"email": user_data.email})
        if not user_doc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verify password
        if not verify_password(user_data.password, user_doc["password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": user_doc["id"]}, expires_delta=access_token_expires
        )
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse(
                id=user_doc["id"],
                name=user_doc["name"],
                email=user_doc["email"],
                role=user_doc["role"],
                avatar=user_doc.get("avatar"),
                provider=user_doc.get("provider")
            )
        )
    
    @router.post("/social-login", response_model=TokenResponse)
    async def social_login(social_data: SocialLoginData):
        # Check if user exists
        existing_user = await db.users.find_one({"email": social_data.email})
        
        if existing_user:
            # Update user info if needed
            await db.users.update_one(
                {"id": existing_user["id"]},
                {"$set": {
                    "name": social_data.name,
                    "avatar": social_data.avatar,
                    "updated_at": datetime.utcnow()
                }}
            )
            user_id = existing_user["id"]
        else:
            # Create new user
            user = User(
                id=str(uuid.uuid4()),
                name=social_data.name,
                email=social_data.email,
                role=UserRole.USER,
                avatar=social_data.avatar,
                provider=social_data.provider
            )
            
            user_dict = user.dict()
            user_dict["password"] = ""  # No password for social login
            
            await db.users.insert_one(user_dict)
            user_id = user.id
        
        # Get updated user
        user_doc = await db.users.find_one({"id": user_id})
        
        # Create access token
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": user_id}, expires_delta=access_token_expires
        )
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse(
                id=user_doc["id"],
                name=user_doc["name"],
                email=user_doc["email"],
                role=user_doc["role"],
                avatar=user_doc.get("avatar"),
                provider=user_doc.get("provider")
            )
        )
    
    @router.get("/me", response_model=UserResponse)
    async def get_current_user_info(current_user: User = Depends(get_current_user)):
        return UserResponse(
            id=current_user.id,
            name=current_user.name,
            email=current_user.email,
            role=current_user.role,
            avatar=current_user.avatar,
            provider=current_user.provider
        )
    
    @router.post("/logout", response_model=MessageResponse)
    async def logout():
        return MessageResponse(message="Logged out successfully")
    
    return router