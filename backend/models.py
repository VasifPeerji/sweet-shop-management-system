from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: UserRole = UserRole.USER
    avatar: Optional[str] = None
    provider: Optional[str] = None  # google, facebook, email

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class SocialLoginData(BaseModel):
    provider: str
    name: str
    email: EmailStr
    avatar: Optional[str] = None
    provider_id: Optional[str] = None

class User(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    avatar: Optional[str] = None
    provider: Optional[str] = None

# Sweet Models
class SweetBase(BaseModel):
    name: str
    category: str
    price: float
    original_price: Optional[float] = None
    description: str
    image: str
    stock: int = 0
    weight: str
    ingredients: List[str] = []
    featured: bool = False

class SweetCreate(SweetBase):
    pass

class SweetUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    description: Optional[str] = None
    image: Optional[str] = None
    stock: Optional[int] = None
    weight: Optional[str] = None
    ingredients: Optional[List[str]] = None
    featured: Optional[bool] = None

class Sweet(SweetBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    rating: float = 4.5
    reviews: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Category Models
class CategoryBase(BaseModel):
    name: str
    icon: str
    description: Optional[str] = None

class Category(CategoryBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Cart Models
class CartItem(BaseModel):
    sweet_id: str
    quantity: int
    price: float
    name: str
    image: str
    weight: str

class Cart(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[CartItem] = []
    total: float = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CartAddRequest(BaseModel):
    sweet_id: str
    quantity: int = 1

class CartUpdateRequest(BaseModel):
    quantity: int

# Wishlist Models
class WishlistItem(BaseModel):
    sweet_id: str
    name: str
    image: str
    price: float
    added_at: datetime = Field(default_factory=datetime.utcnow)

class Wishlist(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[WishlistItem] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Order Models
class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PREPARING = "preparing"
    READY = "ready"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class OrderItem(BaseModel):
    sweet_id: str
    name: str
    quantity: int
    price: float
    image: str

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[OrderItem] = []
    total: float = 0
    status: OrderStatus = OrderStatus.PENDING
    address: Optional[str] = None
    phone: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class OrderCreate(BaseModel):
    address: str
    phone: str
    notes: Optional[str] = None

# Review Models
class ReviewBase(BaseModel):
    sweet_id: str
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class Review(ReviewBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    user_avatar: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Response Models
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class MessageResponse(BaseModel):
    message: str
    success: bool = True

class AdminStatsResponse(BaseModel):
    total_sweets: int
    low_stock_count: int
    out_of_stock_count: int
    featured_count: int
    total_orders: int
    total_revenue: float
    recent_orders: List[Dict[str, Any]]