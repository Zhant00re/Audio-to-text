export interface Transcription {
  id: string;
  text: string;
  language: string;
  timestamp: string;
  fileName?: string;
  duration?: number;
  source: 'voice' | 'file';
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export interface AppTheme {
  isDark: boolean;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
}

export interface VoiceRecognitionState {
  isListening: boolean;
  isProcessing: boolean;
  currentText: string;
  error: string | null;
  supportedLanguages: Language[];
}

export interface AppState {
  transcriptions: Transcription[];
  selectedLanguage: Language;
  theme: AppTheme;
  voiceState: VoiceRecognitionState;
}