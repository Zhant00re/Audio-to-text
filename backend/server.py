from fastapi import FastAPI, APIRouter, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import logging
import tempfile
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime

try:
    from vosk_utils import transcribe_audio, get_available_languages, health_check
    VOSK_UTILS_AVAILABLE = True
except ImportError:
    VOSK_UTILS_AVAILABLE = False
    def transcribe_audio(*args, **kwargs):
        return {"success": False, "error": "Vosk utilities not available", "text": ""}
    def get_available_languages():
        return {}
    def health_check():
        return {"vosk_available": False, "pydub_available": False, "models_available": {}, "ready": False}

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="VoiceScribe API", description="Local Speech-to-Text with Vosk")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Define Models
class TranscriptionResponse(BaseModel):
    id: str
    filename: str
    language: str
    text: str
    duration: Optional[float] = None
    fileSize: int
    createdAt: datetime
    success: bool
    error: Optional[str] = None

class TranscriptionCreate(BaseModel):
    fileName: str
    language: str
    text: str
    duration: Optional[float] = None
    fileSize: int

class TranscriptionHistory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    fileName: str
    language: str
    text: str
    duration: Optional[float] = None
    fileSize: int
    createdAt: datetime = Field(default_factory=datetime.utcnow)

# Supported audio formats
SUPPORTED_FORMATS = {
    'audio/mpeg': ['.mp3'],
    'audio/wav': ['.wav'],
    'audio/x-wav': ['.wav'],
    'audio/ogg': ['.ogg'],
    'audio/mp4': ['.m4a'],
    'audio/x-m4a': ['.m4a'],
    'audio/flac': ['.flac']
}

# File size limit (2GB)
MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024

@api_router.get("/")
async def root():
    return {"message": "VoiceScribe API - Local Speech-to-Text Service"}

@api_router.get("/health")
async def health_check_endpoint():
    """Check API health and Vosk availability."""
    health_status = health_check()
    available_languages = get_available_languages()
    
    return {
        "status": "healthy" if health_status["ready"] else "limited",
        "vosk_available": health_status["vosk_available"],
        "models_available": health_status["models_available"],
        "available_languages": available_languages,
        "max_file_size": MAX_FILE_SIZE,
        "supported_formats": list(SUPPORTED_FORMATS.keys())
    }

@api_router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio_file(
    file: UploadFile = File(...),
    language: str = Form(...)
):
    """Transcribe an uploaded audio file."""
    
    # Validate file size
    if file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File size ({file.size} bytes) exceeds maximum allowed size ({MAX_FILE_SIZE} bytes)"
        )
    
    # Validate file format
    if file.content_type not in SUPPORTED_FORMATS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format: {file.content_type}. Supported formats: {list(SUPPORTED_FORMATS.keys())}"
        )
    
    # Validate language
    available_languages = get_available_languages()
    if language not in available_languages and language != "auto":
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported language: {language}. Available languages: {list(available_languages.keys())}"
        )
    
    # Create temporary file for processing
    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=Path(file.filename).suffix
    ) as tmp_file:
        tmp_path = tmp_file.name
        
        try:
            # Save uploaded file
            content = await file.read()
            tmp_file.write(content)
            tmp_file.flush()
            
            logger.info(f"Processing file: {file.filename} ({len(content)} bytes) in language: {language}")
            
            # Transcribe audio
            result = await transcribe_audio(tmp_path, language)
            
            # Create transcription record
            transcription_id = str(uuid.uuid4())
            
            transcription_data = {
                "_id": transcription_id,
                "fileName": file.filename,
                "language": result.get("language", language),
                "text": result.get("text", ""),
                "fileSize": len(content),
                "createdAt": datetime.utcnow(),
                "success": result.get("success", False),
                "error": result.get("error")
            }
            
            # Save to MongoDB
            if result.get("success"):
                await db.transcriptions.insert_one(transcription_data)
                logger.info(f"Transcription saved successfully: {transcription_id}")
            
            return TranscriptionResponse(
                id=transcription_id,
                filename=file.filename,
                language=result.get("language", language),
                text=result.get("text", ""),
                fileSize=len(content),
                createdAt=transcription_data["createdAt"],
                success=result.get("success", False),
                error=result.get("error")
            )
            
        except Exception as e:
            logger.error(f"Transcription failed for {file.filename}: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Transcription failed: {str(e)}"
            )
        finally:
            # Clean up temporary file
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

@api_router.get("/transcriptions", response_model=List[TranscriptionHistory])
async def get_transcriptions():
    """Get all transcription history."""
    try:
        transcriptions = await db.transcriptions.find(
            {"success": True}
        ).sort("createdAt", -1).to_list(100)
        
        return [
            TranscriptionHistory(
                id=t["_id"],
                fileName=t["fileName"],
                language=t["language"],
                text=t["text"],
                fileSize=t["fileSize"],
                createdAt=t["createdAt"]
            )
            for t in transcriptions
        ]
    except Exception as e:
        logger.error(f"Failed to fetch transcriptions: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch transcription history"
        )

@api_router.get("/transcriptions/{transcription_id}", response_model=TranscriptionHistory)
async def get_transcription(transcription_id: str):
    """Get a specific transcription by ID."""
    try:
        transcription = await db.transcriptions.find_one({"_id": transcription_id})
        
        if not transcription:
            raise HTTPException(
                status_code=404,
                detail="Transcription not found"
            )
        
        return TranscriptionHistory(
            id=transcription["_id"],
            fileName=transcription["fileName"],
            language=transcription["language"],
            text=transcription["text"],
            fileSize=transcription["fileSize"],
            createdAt=transcription["createdAt"]
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch transcription {transcription_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch transcription"
        )

@api_router.delete("/transcriptions/{transcription_id}")
async def delete_transcription(transcription_id: str):
    """Delete a transcription by ID."""
    try:
        result = await db.transcriptions.delete_one({"_id": transcription_id})
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Transcription not found"
            )
        
        return {"message": "Transcription deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete transcription {transcription_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to delete transcription"
        )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
