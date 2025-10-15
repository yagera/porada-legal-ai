import hashlib
import secrets
import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import logging
from jose import JWTError, jwt
from passlib.context import CryptContext

from ..models.user import User, UserCreate, UserLogin
from ..config import settings

logger = logging.getLogger(__name__)

class AuthService:
    def __init__(self):
        self.users: Dict[str, User] = {}
        self.user_passwords: Dict[str, str] = {}
        self.pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
        self.SECRET_KEY = "your-secret-key-change-in-production"
        self.ALGORITHM = "HS256"
        self.ACCESS_TOKEN_EXPIRE_MINUTES = 30
        
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return self.pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        return self.pwd_context.hash(password)
    
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.SECRET_KEY, algorithm=self.ALGORITHM)
        return encoded_jwt
    
    def verify_token(self, token: str) -> Optional[str]:
        try:
            payload = jwt.decode(token, self.SECRET_KEY, algorithms=[self.ALGORITHM])
            user_id: str = payload.get("sub")
            if user_id is None:
                return None
            return user_id
        except JWTError:
            return None
    
    def create_user(self, user_data: UserCreate) -> User:
        user_id = str(uuid.uuid4())
        
        existing_user = self.get_user_by_email(user_data.email)
        if existing_user:
            raise ValueError("Email already registered")
        
        user = User(
            id=user_id,
            name=user_data.name,
            email=user_data.email,
            created_at=datetime.utcnow(),
            is_active=True
        )
        
        hashed_password = self.get_password_hash(user_data.password)
        
        self.users[user_id] = user
        self.user_passwords[user_id] = hashed_password
        logger.info(f"User created: {user.email}")
        
        return user
    
    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        user = self.get_user_by_email(email)
        if not user:
            return None
        if not user.is_active:
            return None
        
        stored_password = self.user_passwords.get(user.id)
        if not stored_password:
            return None
        
        if not self.verify_password(password, stored_password):
            return None
        
        return user
    
    def get_user_by_id(self, user_id: str) -> Optional[User]:
        return self.users.get(user_id)
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        for user in self.users.values():
            if user.email == email:
                return user
        return None
    
    def create_demo_user(self):
        demo_user = User(
            id="demo-user-id",
            name="Demo User",
            email="demo@example.com",
            created_at=datetime.utcnow(),
            is_active=True
        )
        hashed_password = self.get_password_hash("demo123")
        
        self.users["demo-user-id"] = demo_user
        self.user_passwords["demo-user-id"] = hashed_password
        logger.info("Demo user created")
        return demo_user