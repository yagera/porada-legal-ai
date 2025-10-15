from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from typing import List, Dict, Any
import logging

from .services.model_service import ModelService
from .services.storage_service import StorageService
from .services.auth_service import AuthService
from .models.analysis import AnalysisRequest, AnalysisResponse, DocumentInfo
from .models.user import UserCreate, UserLogin, UserResponse, User
from .middleware.auth import get_current_user, get_current_user_optional
from .config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Porada Legal AI API",
    description="API for legal document analysis using AI",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model_service = ModelService()
storage_service = StorageService()
auth_service = AuthService()

@app.on_event("startup")
async def startup_event():
    logger.info("Starting Porada Legal AI API...")
    
    await model_service.initialize()
    logger.info("Model initialized successfully")
    
    await storage_service.initialize()
    logger.info("Storage service initialized successfully")
    
    auth_service.create_demo_user()
    logger.info("Demo user created")

@app.get("/")
async def root():
    return {"message": "Porada Legal AI API is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": model_service.is_loaded(),
        "storage_connected": await storage_service.is_connected()
    }

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    analysis_type: str = "full"
):
    try:
        if not file.filename.lower().endswith(('.pdf', '.doc', '.docx', '.txt')):
            raise HTTPException(status_code=400, detail="Unsupported file type")
        
        file_id = await storage_service.save_file(file)
        text = await storage_service.extract_text(file_id)
        analysis_result = await model_service.analyze_document(text)
        analysis_id = await storage_service.save_analysis(file_id, analysis_result)
        
        return AnalysisResponse(
            analysis_id=analysis_id,
            file_id=file_id,
            filename=file.filename,
            analysis_result=analysis_result,
            status="completed"
        )
        
    except Exception as e:
        logger.error(f"Error analyzing document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/api/analysis/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(
    analysis_id: str,
    current_user: User = Depends(get_current_user)
):
    try:
        result = await storage_service.get_analysis(analysis_id)
        if not result:
            raise HTTPException(status_code=404, detail="Analysis not found")
        return result
    except Exception as e:
        logger.error(f"Error retrieving analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve analysis: {str(e)}")

@app.get("/api/analyses", response_model=List[DocumentInfo])
async def list_analyses(
    limit: int = 20, 
    offset: int = 0,
    current_user: User = Depends(get_current_user)
):
    try:
        analyses = await storage_service.list_analyses(limit, offset)
        return analyses
    except Exception as e:
        logger.error(f"Error listing analyses: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list analyses: {str(e)}")

@app.delete("/api/analysis/{analysis_id}")
async def delete_analysis(
    analysis_id: str,
    current_user: User = Depends(get_current_user)
):
    try:
        success = await storage_service.delete_analysis(analysis_id)
        if not success:
            raise HTTPException(status_code=404, detail="Analysis not found")
        return {"message": "Analysis deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete analysis: {str(e)}")

@app.post("/api/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    try:
        user = auth_service.create_user(user_data)
        access_token = auth_service.create_access_token(data={"sub": user.id})
        
        return UserResponse(user=user, token=access_token)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(status_code=500, detail="Registration failed")

@app.post("/api/auth/login", response_model=UserResponse)
async def login(login_data: UserLogin):
    try:
        user = auth_service.authenticate_user(login_data.email, login_data.password)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        access_token = auth_service.create_access_token(data={"sub": user.id})
        
        return UserResponse(user=user, token=access_token)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid email or password")

@app.get("/api/auth/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@app.post("/api/auth/logout")
async def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Logged out successfully"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
