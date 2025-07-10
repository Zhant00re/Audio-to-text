import { Language } from '../types';

export const SUPPORTED_LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
  },
  {
    code: 'kk',
    name: 'Kazakh',
    nativeName: 'Қазақ',
  },
];

export const SUPPORTED_AUDIO_FORMATS = [
  'audio/mp3',
  'audio/mpeg',
  'audio/wav',
  'audio/x-wav',
  'audio/m4a',
  'audio/x-m4a',
  'audio/aac',
  'audio/ogg',
  'audio/flac',
];

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const THEME_COLORS = {
  light: {
    primary: '#007AFF',
    secondary: '#5856D6',
    background: '#FFFFFF',
    surface: '#F2F2F7',
    text: '#000000',
    textSecondary: '#8E8E93',
    border: '#D1D1D6',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
  },
  dark: {
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    background: '#000000',
    surface: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    border: '#38383A',
    error: '#FF453A',
    success: '#30D158',
    warning: '#FF9F0A',
  },
};

export const VOICE_RECOGNITION_CONFIG = {
  recognitionTimeout: 10000,
  partialResultsTimeout: 2000,
  maxSilenceTime: 3000,
  maxRecordingTime: 300000, // 5 minutes
};

export const EXPORT_FORMATS = [
  {
    label: 'Plain Text (.txt)',
    value: 'txt',
    extension: 'txt',
    mimeType: 'text/plain',
  },
  {
    label: 'JSON (.json)',
    value: 'json',
    extension: 'json',
    mimeType: 'application/json',
  },
  {
    label: 'Word Document (.docx)',
    value: 'docx',
    extension: 'docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
];

export const DEFAULT_SETTINGS = {
  autoSave: true,
  showPartialResults: true,
  enableNotifications: true,
  maxTranscriptions: 1000,
  autoDeleteOldTranscriptions: false,
  deleteAfterDays: 30,
};

export const ERRORS = {
  VOICE_NOT_SUPPORTED: 'Voice recognition is not supported on this device',
  MICROPHONE_PERMISSION: 'Microphone permission is required',
  NETWORK_ERROR: 'Network error occurred',
  FILE_TOO_LARGE: 'File size exceeds maximum limit',
  UNSUPPORTED_FORMAT: 'Unsupported audio format',
  TRANSCRIPTION_FAILED: 'Transcription failed',
  STORAGE_ERROR: 'Storage error occurred',
  LANGUAGE_NOT_SUPPORTED: 'Language not supported',
  RECORDING_TIMEOUT: 'Recording timeout',
  UNKNOWN_ERROR: 'Unknown error occurred',
};

export const SUCCESS_MESSAGES = {
  TRANSCRIPTION_SAVED: 'Transcription saved successfully',
  TRANSCRIPTION_DELETED: 'Transcription deleted successfully',
  TRANSCRIPTION_EXPORTED: 'Transcription exported successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
  FILE_IMPORTED: 'File imported successfully',
};

export const APP_INFO = {
  name: 'VoiceScribe',
  version: '1.0.0',
  description: 'Lightweight offline speech-to-text transcription app',
  author: 'VoiceScribe Team',
  supportEmail: 'support@voicescribe.app',
  website: 'https://voicescribe.app',
};