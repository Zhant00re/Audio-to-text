import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, Transcription, Language } from '../types';
import { StorageService } from '../utils/storage';
import { SUPPORTED_LANGUAGES, THEME_COLORS } from '../utils/constants';

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addTranscription: (transcription: Omit<Transcription, 'id'>) => void;
  deleteTranscription: (id: string) => void;
  updateTranscription: (id: string, updates: Partial<Transcription>) => void;
  setLanguage: (language: Language) => void;
  toggleTheme: () => void;
  clearAllTranscriptions: () => void;
  exportTranscriptions: () => Promise<string>;
}

type AppAction =
  | { type: 'SET_TRANSCRIPTIONS'; payload: Transcription[] }
  | { type: 'ADD_TRANSCRIPTION'; payload: Transcription }
  | { type: 'DELETE_TRANSCRIPTION'; payload: string }
  | { type: 'UPDATE_TRANSCRIPTION'; payload: { id: string; updates: Partial<Transcription> } }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_THEME'; payload: boolean }
  | { type: 'SET_VOICE_STATE'; payload: Partial<AppState['voiceState']> }
  | { type: 'CLEAR_ALL_TRANSCRIPTIONS' }
  | { type: 'INIT_APP'; payload: { transcriptions: Transcription[]; language: Language; isDark: boolean } };

const initialState: AppState = {
  transcriptions: [],
  selectedLanguage: SUPPORTED_LANGUAGES[0],
  theme: {
    isDark: false,
    colors: THEME_COLORS.light,
  },
  voiceState: {
    isListening: false,
    isProcessing: false,
    currentText: '',
    error: null,
    supportedLanguages: SUPPORTED_LANGUAGES,
  },
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'INIT_APP':
      return {
        ...state,
        transcriptions: action.payload.transcriptions,
        selectedLanguage: action.payload.language,
        theme: {
          isDark: action.payload.isDark,
          colors: action.payload.isDark ? THEME_COLORS.dark : THEME_COLORS.light,
        },
      };

    case 'SET_TRANSCRIPTIONS':
      return {
        ...state,
        transcriptions: action.payload,
      };

    case 'ADD_TRANSCRIPTION':
      return {
        ...state,
        transcriptions: [action.payload, ...state.transcriptions],
      };

    case 'DELETE_TRANSCRIPTION':
      return {
        ...state,
        transcriptions: state.transcriptions.filter(t => t.id !== action.payload),
      };

    case 'UPDATE_TRANSCRIPTION':
      return {
        ...state,
        transcriptions: state.transcriptions.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload.updates } : t
        ),
      };

    case 'SET_LANGUAGE':
      return {
        ...state,
        selectedLanguage: action.payload,
      };

    case 'TOGGLE_THEME':
      return {
        ...state,
        theme: {
          isDark: !state.theme.isDark,
          colors: !state.theme.isDark ? THEME_COLORS.dark : THEME_COLORS.light,
        },
      };

    case 'SET_THEME':
      return {
        ...state,
        theme: {
          isDark: action.payload,
          colors: action.payload ? THEME_COLORS.dark : THEME_COLORS.light,
        },
      };

    case 'SET_VOICE_STATE':
      return {
        ...state,
        voiceState: {
          ...state.voiceState,
          ...action.payload,
        },
      };

    case 'CLEAR_ALL_TRANSCRIPTIONS':
      return {
        ...state,
        transcriptions: [],
      };

    default:
      return state;
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    // Initialize app data on startup
    const initializeApp = async () => {
      try {
        const [transcriptions, languageCode, isDark] = await Promise.all([
          StorageService.getTranscriptions(),
          StorageService.getSelectedLanguage(),
          StorageService.getTheme(),
        ]);

        const language = SUPPORTED_LANGUAGES.find(l => l.code === languageCode) || SUPPORTED_LANGUAGES[0];

        dispatch({
          type: 'INIT_APP',
          payload: {
            transcriptions,
            language,
            isDark,
          },
        });
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };

    initializeApp();
  }, []);

  const addTranscription = async (transcriptionData: Omit<Transcription, 'id'>) => {
    try {
      const transcription: Transcription = {
        ...transcriptionData,
        id: Date.now().toString() + Math.random().toString(36),
      };

      await StorageService.saveTranscription(transcription);
      dispatch({ type: 'ADD_TRANSCRIPTION', payload: transcription });
    } catch (error) {
      console.error('Error adding transcription:', error);
    }
  };

  const deleteTranscription = async (id: string) => {
    try {
      await StorageService.deleteTranscription(id);
      dispatch({ type: 'DELETE_TRANSCRIPTION', payload: id });
    } catch (error) {
      console.error('Error deleting transcription:', error);
    }
  };

  const updateTranscription = async (id: string, updates: Partial<Transcription>) => {
    try {
      await StorageService.updateTranscription(id, updates);
      dispatch({ type: 'UPDATE_TRANSCRIPTION', payload: { id, updates } });
    } catch (error) {
      console.error('Error updating transcription:', error);
    }
  };

  const setLanguage = async (language: Language) => {
    try {
      await StorageService.saveSelectedLanguage(language.code);
      dispatch({ type: 'SET_LANGUAGE', payload: language });
    } catch (error) {
      console.error('Error setting language:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !state.theme.isDark;
      await StorageService.saveTheme(newTheme);
      dispatch({ type: 'TOGGLE_THEME' });
    } catch (error) {
      console.error('Error toggling theme:', error);
    }
  };

  const clearAllTranscriptions = async () => {
    try {
      await StorageService.clearAllTranscriptions();
      dispatch({ type: 'CLEAR_ALL_TRANSCRIPTIONS' });
    } catch (error) {
      console.error('Error clearing transcriptions:', error);
    }
  };

  const exportTranscriptions = async (): Promise<string> => {
    try {
      return await StorageService.exportTranscriptions();
    } catch (error) {
      console.error('Error exporting transcriptions:', error);
      throw error;
    }
  };

  const value: AppContextType = {
    state,
    dispatch,
    addTranscription,
    deleteTranscription,
    updateTranscription,
    setLanguage,
    toggleTheme,
    clearAllTranscriptions,
    exportTranscriptions,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};