import os
import wave
import json
import asyncio
import tempfile
from pathlib import Path
from typing import Dict, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    import vosk
    from vosk import Model, KaldiRecognizer
    VOSK_AVAILABLE = True
except ImportError:
    logger.warning("Vosk not available, using fallback")
    VOSK_AVAILABLE = False

try:
    from pydub import AudioSegment
    PYDUB_AVAILABLE = True
except ImportError:
    logger.warning("PyDub not available")
    PYDUB_AVAILABLE = False

# Model paths
BASE_DIR = Path(__file__).parent
MODEL_PATHS = {
    "en": BASE_DIR / "models" / "vosk-model-small-en-us-0.15",
    "ru": BASE_DIR / "models" / "vosk-model-small-ru-0.22", 
    "kz": BASE_DIR / "models" / "vosk-model-small-kz-0.15"
}

# Cache for loaded models
_model_cache: Dict[str, Model] = {}

def get_model(lang: str) -> Optional[Model]:
    """Get or load a Vosk model for the specified language."""
    if not VOSK_AVAILABLE:
        logger.error("Vosk is not available")
        return None
        
    if lang in _model_cache:
        return _model_cache[lang]
    
    model_path = MODEL_PATHS.get(lang)
    if not model_path or not model_path.exists():
        logger.error(f"Model not found for language: {lang} at {model_path}")
        return None
    
    try:
        logger.info(f"Loading model for language: {lang}")
        model = Model(str(model_path))
        _model_cache[lang] = model
        return model
    except Exception as e:
        logger.error(f"Failed to load model for {lang}: {e}")
        return None

def get_recognizer(lang: str, sample_rate: int = 16000) -> Optional[KaldiRecognizer]:
    """Get a Vosk recognizer for the specified language."""
    model = get_model(lang)
    if not model:
        return None
    
    try:
        return KaldiRecognizer(model, sample_rate)
    except Exception as e:
        logger.error(f"Failed to create recognizer for {lang}: {e}")
        return None

def convert_audio_to_wav(file_path: str, sample_rate: int = 16000) -> Optional[str]:
    """Convert audio file to WAV format suitable for Vosk."""
    if not PYDUB_AVAILABLE:
        logger.error("PyDub not available for audio conversion")
        return None
    
    try:
        # Load audio file
        audio = AudioSegment.from_file(file_path)
        
        # Convert to 16kHz mono
        audio = audio.set_frame_rate(sample_rate).set_channels(1)
        
        # Create temporary WAV file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_file:
            wav_path = tmp_file.name
            audio.export(wav_path, format="wav")
            return wav_path
            
    except Exception as e:
        logger.error(f"Failed to convert audio: {e}")
        return None

async def transcribe_audio(file_path: str, language: str) -> Dict:
    """Transcribe audio file using Vosk."""
    if not VOSK_AVAILABLE:
        return {
            "success": False,
            "error": "Vosk speech recognition is not available",
            "text": ""
        }
    
    # Map language codes
    lang_map = {
        "en": "en",
        "ru": "ru", 
        "kz": "kz",
        "auto": "en"  # Default to English for auto-detect
    }
    
    vosk_lang = lang_map.get(language, "en")
    
    try:
        logger.info(f"Starting transcription for {file_path} in language {vosk_lang}")
        
        # Convert audio to WAV
        wav_path = convert_audio_to_wav(file_path)
        if not wav_path:
            return {
                "success": False,
                "error": "Failed to convert audio to WAV format",
                "text": ""
            }
        
        # Get recognizer
        recognizer = get_recognizer(vosk_lang, 16000)
        if not recognizer:
            return {
                "success": False,
                "error": f"Failed to load speech recognition model for {vosk_lang}",
                "text": ""
            }
        
        # Process audio file
        result_text = []
        
        try:
            with wave.open(wav_path, 'rb') as wf:
                # Process audio in chunks
                chunk_size = 4000
                while True:
                    data = wf.readframes(chunk_size)
                    if len(data) == 0:
                        break
                    
                    if recognizer.AcceptWaveform(data):
                        result = json.loads(recognizer.Result())
                        if result.get('text', '').strip():
                            result_text.append(result['text'])
                
                # Get final result
                final_result = json.loads(recognizer.FinalResult())
                if final_result.get('text', '').strip():
                    result_text.append(final_result['text'])
        
        except Exception as e:
            logger.error(f"Error processing audio: {e}")
            return {
                "success": False,
                "error": f"Audio processing failed: {str(e)}",
                "text": ""
            }
        
        finally:
            # Clean up temporary WAV file
            if os.path.exists(wav_path):
                os.unlink(wav_path)
        
        # Join results
        final_text = " ".join(result_text).strip()
        
        # Basic post-processing for better formatting
        if final_text:
            # Capitalize first letter of sentences
            sentences = final_text.split('. ')
            sentences = [s.capitalize() for s in sentences]
            final_text = '. '.join(sentences)
            
            # Add final period if missing
            if not final_text.endswith('.'):
                final_text += '.'
        
        logger.info(f"Transcription completed successfully. Text length: {len(final_text)}")
        
        return {
            "success": True,
            "text": final_text,
            "language": vosk_lang,
            "confidence": 0.8  # Vosk doesn't provide confidence scores easily
        }
        
    except Exception as e:
        logger.error(f"Transcription failed: {e}")
        return {
            "success": False,
            "error": f"Transcription failed: {str(e)}",
            "text": ""
        }

def get_available_languages() -> Dict[str, str]:
    """Get list of available languages for transcription."""
    available = {}
    
    for lang, path in MODEL_PATHS.items():
        if path.exists():
            lang_names = {
                "en": "English",
                "ru": "Russian", 
                "kz": "Kazakh"
            }
            available[lang] = lang_names.get(lang, lang)
    
    return available

def health_check() -> Dict:
    """Check if Vosk and required dependencies are available."""
    status = {
        "vosk_available": VOSK_AVAILABLE,
        "pydub_available": PYDUB_AVAILABLE,
        "models_available": {},
        "ready": False
    }
    
    if VOSK_AVAILABLE:
        for lang, path in MODEL_PATHS.items():
            status["models_available"][lang] = path.exists()
    
    status["ready"] = (
        VOSK_AVAILABLE and 
        PYDUB_AVAILABLE and 
        any(status["models_available"].values())
    )
    
    return status