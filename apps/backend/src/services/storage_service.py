import asyncio
import uuid
import json
from datetime import datetime
from typing import List, Optional, Dict, Any
import logging
from pathlib import Path
import aiofiles
import PyPDF2
import docx
from io import BytesIO

from minio import Minio
from minio.error import S3Error

from ..models.analysis import AnalysisResponse, DocumentInfo, AnalysisResult
from ..config import settings

logger = logging.getLogger(__name__)

class StorageService:
    def __init__(self):
        self.client = None
        self.bucket_name = settings.minio_bucket
        
    async def initialize(self):
        try:
            self.client = Minio(
                settings.minio_endpoint,
                access_key=settings.minio_access_key,
                secret_key=settings.minio_secret_key,
                secure=settings.minio_secure
            )
            
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
                logger.info(f"Created bucket: {self.bucket_name}")
            
            logger.info("Storage service initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize storage service: {str(e)}")
            raise
    
    async def save_file(self, file) -> str:
        try:
            file_id = str(uuid.uuid4())
            file_path = f"documents/{file_id}/{file.filename}"
            
            content = await file.read()
            
            self.client.put_object(
                self.bucket_name,
                file_path,
                BytesIO(content),
                length=len(content),
                content_type=file.content_type or "application/octet-stream"
            )
            
            logger.info(f"File saved: {file_path}")
            return file_id
            
        except Exception as e:
            logger.error(f"Error saving file: {str(e)}")
            raise
    
    async def extract_text(self, file_id: str) -> str:
        """Extract text from uploaded document"""
        try:
            # Get file info
            file_info = await self._get_file_info(file_id)
            if not file_info:
                raise ValueError(f"File not found: {file_id}")
            
            file_path = f"documents/{file_id}/{file_info['filename']}"
            
            # Download file
            response = self.client.get_object(self.bucket_name, file_path)
            content = response.read()
            
            # Extract text based on file type
            filename = file_info['filename'].lower()
            
            if filename.endswith('.pdf'):
                text = self._extract_pdf_text(content)
            elif filename.endswith(('.doc', '.docx')):
                text = self._extract_docx_text(content)
            elif filename.endswith('.txt'):
                text = content.decode('utf-8')
            else:
                raise ValueError(f"Unsupported file type: {filename}")
            
            return text
            
        except Exception as e:
            logger.error(f"Error extracting text: {str(e)}")
            raise
    
    def _extract_pdf_text(self, content: bytes) -> str:
        """Extract text from PDF"""
        try:
            pdf_reader = PyPDF2.PdfReader(BytesIO(content))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting PDF text: {str(e)}")
            return ""
    
    def _extract_docx_text(self, content: bytes) -> str:
        """Extract text from DOCX"""
        try:
            doc = docx.Document(BytesIO(content))
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting DOCX text: {str(e)}")
            return ""
    
    async def save_analysis(self, file_id: str, analysis_result: AnalysisResult) -> str:
        """Save analysis result"""
        try:
            analysis_id = str(uuid.uuid4())
            analysis_path = f"analyses/{analysis_id}/result.json"
            
            # Convert to dict for JSON serialization
            analysis_dict = analysis_result.dict()
            
            # Save to MinIO
            self.client.put_object(
                self.bucket_name,
                analysis_path,
                BytesIO(json.dumps(analysis_dict, indent=2).encode('utf-8')),
                length=len(json.dumps(analysis_dict, indent=2)),
                content_type="application/json"
            )
            
            # Save metadata
            metadata = {
                "analysis_id": analysis_id,
                "file_id": file_id,
                "created_at": datetime.utcnow().isoformat(),
                "status": "completed"
            }
            
            metadata_path = f"analyses/{analysis_id}/metadata.json"
            self.client.put_object(
                self.bucket_name,
                metadata_path,
                BytesIO(json.dumps(metadata, indent=2).encode('utf-8')),
                length=len(json.dumps(metadata, indent=2)),
                content_type="application/json"
            )
            
            logger.info(f"Analysis saved: {analysis_id}")
            return analysis_id
            
        except Exception as e:
            logger.error(f"Error saving analysis: {str(e)}")
            raise
    
    async def get_analysis(self, analysis_id: str) -> Optional[AnalysisResponse]:
        """Get analysis result by ID"""
        try:
            # Get metadata
            metadata_path = f"analyses/{analysis_id}/metadata.json"
            try:
                response = self.client.get_object(self.bucket_name, metadata_path)
                metadata = json.loads(response.read().decode('utf-8'))
            except S3Error:
                return None
            
            # Get analysis result
            result_path = f"analyses/{analysis_id}/result.json"
            try:
                response = self.client.get_object(self.bucket_name, result_path)
                analysis_dict = json.loads(response.read().decode('utf-8'))
            except S3Error:
                return None
            
            # Get file info
            file_info = await self._get_file_info(metadata['file_id'])
            if not file_info:
                return None
            
            return AnalysisResponse(
                analysis_id=analysis_id,
                file_id=metadata['file_id'],
                filename=file_info['filename'],
                analysis_result=AnalysisResult(**analysis_dict),
                status=metadata['status'],
                created_at=datetime.fromisoformat(metadata['created_at']),
                processing_time=analysis_dict.get('processing_time', 0.0)
            )
            
        except Exception as e:
            logger.error(f"Error getting analysis: {str(e)}")
            return None
    
    async def list_analyses(self, limit: int = 20, offset: int = 0) -> List[DocumentInfo]:
        """List all analyses with pagination"""
        try:
            analyses = []
            objects = self.client.list_objects(
                self.bucket_name,
                prefix="analyses/",
                recursive=True
            )
            
            # Filter metadata files
            metadata_files = [obj for obj in objects if obj.object_name.endswith('metadata.json')]
            
            # Sort by creation time (newest first)
            metadata_files.sort(key=lambda x: x.last_modified, reverse=True)
            
            # Apply pagination
            paginated_files = metadata_files[offset:offset + limit]
            
            for obj in paginated_files:
                try:
                    response = self.client.get_object(self.bucket_name, obj.object_name)
                    metadata = json.loads(response.read().decode('utf-8'))
                    
                    # Get file info
                    file_info = await self._get_file_info(metadata['file_id'])
                    if file_info:
                        # Get risk level from analysis result
                        result_path = f"analyses/{metadata['analysis_id']}/result.json"
                        try:
                            response = self.client.get_object(self.bucket_name, result_path)
                            analysis_dict = json.loads(response.read().decode('utf-8'))
                            risk_level = analysis_dict['risk_analysis']['level']
                        except S3Error:
                            risk_level = "Unknown"
                        
                        analyses.append(DocumentInfo(
                            analysis_id=metadata['analysis_id'],
                            filename=file_info['filename'],
                            status=metadata['status'],
                            risk_level=risk_level,
                            created_at=datetime.fromisoformat(metadata['created_at']),
                            file_size=file_info['size']
                        ))
                        
                except Exception as e:
                    logger.warning(f"Error processing analysis metadata: {str(e)}")
                    continue
            
            return analyses
            
        except Exception as e:
            logger.error(f"Error listing analyses: {str(e)}")
            raise
    
    async def delete_analysis(self, analysis_id: str) -> bool:
        """Delete analysis and associated files"""
        try:
            # Get metadata to find file_id
            metadata_path = f"analyses/{analysis_id}/metadata.json"
            try:
                response = self.client.get_object(self.bucket_name, metadata_path)
                metadata = json.loads(response.read().decode('utf-8'))
                file_id = metadata['file_id']
            except S3Error:
                return False
            
            # Delete analysis files
            analysis_objects = self.client.list_objects(
                self.bucket_name,
                prefix=f"analyses/{analysis_id}/",
                recursive=True
            )
            
            for obj in analysis_objects:
                self.client.remove_object(self.bucket_name, obj.object_name)
            
            # Delete original file
            file_info = await self._get_file_info(file_id)
            if file_info:
                file_path = f"documents/{file_id}/{file_info['filename']}"
                try:
                    self.client.remove_object(self.bucket_name, file_path)
                except S3Error:
                    pass  # File might already be deleted
            
            logger.info(f"Analysis deleted: {analysis_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting analysis: {str(e)}")
            return False
    
    async def _get_file_info(self, file_id: str) -> Optional[Dict[str, Any]]:
        """Get file information by file_id"""
        try:
            objects = self.client.list_objects(
                self.bucket_name,
                prefix=f"documents/{file_id}/",
                recursive=True
            )
            
            for obj in objects:
                if not obj.object_name.endswith('/'):  # Skip directories
                    return {
                        'filename': obj.object_name.split('/')[-1],
                        'size': obj.size,
                        'last_modified': obj.last_modified
                    }
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting file info: {str(e)}")
            return None
    
    async def is_connected(self) -> bool:
        """Check if storage service is connected"""
        try:
            return self.client.bucket_exists(self.bucket_name)
        except Exception:
            return False
