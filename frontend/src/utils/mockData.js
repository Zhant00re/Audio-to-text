import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Real API functions for Vosk transcription
export const transcribeAudio = async (file, language) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);

  try {
    const response = await axios.post(`${API}/transcribe`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000, // 5 minutes timeout for large files
    });

    return {
      success: response.data.success,
      text: response.data.text,
      language: response.data.language,
      id: response.data.id,
      filename: response.data.filename,
      fileSize: response.data.fileSize,
      createdAt: response.data.createdAt,
      error: response.data.error
    };
  } catch (error) {
    console.error('Transcription error:', error);
    
    if (error.response) {
      return {
        success: false,
        error: error.response.data.detail || 'Transcription failed',
        text: ""
      };
    } else if (error.request) {
      return {
        success: false,
        error: 'Network error - please check your connection',
        text: ""
      };
    } else {
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
        text: ""
      };
    }
  }
};

export const getTranscriptions = async () => {
  try {
    const response = await axios.get(`${API}/transcriptions`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transcriptions:', error);
    throw error;
  }
};

export const getTranscription = async (id) => {
  try {
    const response = await axios.get(`${API}/transcriptions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transcription:', error);
    throw error;
  }
};

export const deleteTranscription = async (id) => {
  try {
    const response = await axios.delete(`${API}/transcriptions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting transcription:', error);
    throw error;
  }
};

export const checkHealth = async () => {
  try {
    const response = await axios.get(`${API}/health`);
    return response.data;
  } catch (error) {
    console.error('Error checking health:', error);
    throw error;
  }
};

export const getLanguageLabel = (code) => {
  const languages = {
    "en": "English",
    "ru": "Russian",
    "kz": "Kazakh",
    "auto": "Auto-detect"
  };
  return languages[code] || code;
};

export const formatDuration = (seconds) => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};