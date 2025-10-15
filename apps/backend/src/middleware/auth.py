from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import logging

from ..services.auth_service import AuthService

logger = logging.getLogger(__name__)

security = HTTPBearer()

def get_auth_service() -> AuthService:
    from ..main import auth_service
    return auth_service

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthService = Depends(get_auth_service)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        user_id = auth_service.verify_token(token)
        if user_id is None:
            raise credentials_exception
        
        user = auth_service.get_user_by_id(user_id)
        if user is None:
            raise credentials_exception
        
        return user
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise credentials_exception

async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    auth_service: AuthService = Depends(get_auth_service)
):
    if credentials is None:
        return None
    
    try:
        token = credentials.credentials
        user_id = auth_service.verify_token(token)
        if user_id is None:
            return None
        
        user = auth_service.get_user_by_id(user_id)
        return user
    except Exception:
        return None
