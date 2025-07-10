import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transcription } from '../types';

const STORAGE_KEYS = {
  TRANSCRIPTIONS: 'transcriptions',
  SELECTED_LANGUAGE: 'selectedLanguage',
  THEME: 'theme',
  APP_SETTINGS: 'appSettings',
};

export class StorageService {
  static async saveTranscription(transcription: Transcription): Promise<void> {
    try {
      const existingTranscriptions = await this.getTranscriptions();
      const updatedTranscriptions = [transcription, ...existingTranscriptions];
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.TRANSCRIPTIONS,
        JSON.stringify(updatedTranscriptions)
      );
    } catch (error) {
      console.error('Error saving transcription:', error);
      throw error;
    }
  }

  static async getTranscriptions(): Promise<Transcription[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TRANSCRIPTIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading transcriptions:', error);
      return [];
    }
  }

  static async deleteTranscription(id: string): Promise<void> {
    try {
      const transcriptions = await this.getTranscriptions();
      const filtered = transcriptions.filter(t => t.id !== id);
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.TRANSCRIPTIONS,
        JSON.stringify(filtered)
      );
    } catch (error) {
      console.error('Error deleting transcription:', error);
      throw error;
    }
  }

  static async updateTranscription(id: string, updates: Partial<Transcription>): Promise<void> {
    try {
      const transcriptions = await this.getTranscriptions();
      const index = transcriptions.findIndex(t => t.id === id);
      
      if (index !== -1) {
        transcriptions[index] = { ...transcriptions[index], ...updates };
        await AsyncStorage.setItem(
          STORAGE_KEYS.TRANSCRIPTIONS,
          JSON.stringify(transcriptions)
        );
      }
    } catch (error) {
      console.error('Error updating transcription:', error);
      throw error;
    }
  }

  static async clearAllTranscriptions(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.TRANSCRIPTIONS);
    } catch (error) {
      console.error('Error clearing transcriptions:', error);
      throw error;
    }
  }

  static async saveSelectedLanguage(language: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_LANGUAGE, language);
    } catch (error) {
      console.error('Error saving selected language:', error);
      throw error;
    }
  }

  static async getSelectedLanguage(): Promise<string> {
    try {
      const language = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_LANGUAGE);
      return language || 'en';
    } catch (error) {
      console.error('Error loading selected language:', error);
      return 'en';
    }
  }

  static async saveTheme(isDark: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(isDark));
    } catch (error) {
      console.error('Error saving theme:', error);
      throw error;
    }
  }

  static async getTheme(): Promise<boolean> {
    try {
      const theme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
      return theme ? JSON.parse(theme) : false;
    } catch (error) {
      console.error('Error loading theme:', error);
      return false;
    }
  }

  static async exportTranscriptions(): Promise<string> {
    try {
      const transcriptions = await this.getTranscriptions();
      
      const exportData = {
        exportDate: new Date().toISOString(),
        totalTranscriptions: transcriptions.length,
        transcriptions: transcriptions.map(t => ({
          id: t.id,
          text: t.text,
          language: t.language,
          timestamp: t.timestamp,
          fileName: t.fileName,
          duration: t.duration,
          source: t.source,
        })),
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting transcriptions:', error);
      throw error;
    }
  }

  static async importTranscriptions(data: string): Promise<void> {
    try {
      const parsed = JSON.parse(data);
      const transcriptions = parsed.transcriptions || [];
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.TRANSCRIPTIONS,
        JSON.stringify(transcriptions)
      );
    } catch (error) {
      console.error('Error importing transcriptions:', error);
      throw error;
    }
  }
}