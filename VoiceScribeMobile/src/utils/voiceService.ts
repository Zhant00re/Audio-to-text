import Voice from '@react-native-voice/voice';
import { PermissionsAndroid, Platform } from 'react-native';
import { SUPPORTED_LANGUAGES, VOICE_RECOGNITION_CONFIG, ERRORS } from './constants';
import { TextProcessor } from './textProcessor';

export interface VoiceResult {
  text: string;
  confidence?: number;
  isFinal: boolean;
}

export interface VoiceError {
  code: string;
  message: string;
}

export class VoiceService {
  private static instance: VoiceService;
  private isInitialized = false;
  private currentLanguage = 'en';
  private onResultCallback?: (result: VoiceResult) => void;
  private onErrorCallback?: (error: VoiceError) => void;
  private onStartCallback?: () => void;
  private onEndCallback?: () => void;
  private recognitionTimer?: NodeJS.Timeout;

  private constructor() {
    this.initializeVoice();
  }

  static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  private initializeVoice() {
    if (this.isInitialized) return;

    Voice.onSpeechStart = this.onSpeechStart;
    Voice.onSpeechEnd = this.onSpeechEnd;
    Voice.onSpeechError = this.onSpeechError;
    Voice.onSpeechResults = this.onSpeechResults;
    Voice.onSpeechPartialResults = this.onSpeechPartialResults;
    Voice.onSpeechVolumeChanged = this.onSpeechVolumeChanged;

    this.isInitialized = true;
  }

  private onSpeechStart = () => {
    console.log('Voice recognition started');
    this.onStartCallback?.();
  };

  private onSpeechEnd = () => {
    console.log('Voice recognition ended');
    this.onEndCallback?.();
    this.clearRecognitionTimer();
  };

  private onSpeechError = (error: any) => {
    console.log('Voice recognition error:', error);
    this.clearRecognitionTimer();
    
    const voiceError: VoiceError = {
      code: error.error?.code || 'UNKNOWN_ERROR',
      message: this.getErrorMessage(error.error?.code) || error.error?.message || ERRORS.UNKNOWN_ERROR,
    };
    
    this.onErrorCallback?.(voiceError);
  };

  private onSpeechResults = (event: any) => {
    console.log('Voice recognition results:', event);
    this.clearRecognitionTimer();
    
    if (event.value && event.value.length > 0) {
      const rawText = event.value[0];
      const processedText = TextProcessor.formatTranscription(rawText, this.currentLanguage);
      
      const result: VoiceResult = {
        text: processedText,
        confidence: 0.8, // Voice API doesn't provide confidence scores
        isFinal: true,
      };
      
      this.onResultCallback?.(result);
    }
  };

  private onSpeechPartialResults = (event: any) => {
    console.log('Voice recognition partial results:', event);
    
    if (event.value && event.value.length > 0) {
      const rawText = event.value[0];
      const processedText = TextProcessor.formatTranscription(rawText, this.currentLanguage);
      
      const result: VoiceResult = {
        text: processedText,
        confidence: 0.6,
        isFinal: false,
      };
      
      this.onResultCallback?.(result);
    }
  };

  private onSpeechVolumeChanged = (event: any) => {
    // Can be used for volume visualization
    console.log('Voice volume changed:', event.value);
  };

  private clearRecognitionTimer() {
    if (this.recognitionTimer) {
      clearTimeout(this.recognitionTimer);
      this.recognitionTimer = undefined;
    }
  }

  private getErrorMessage(code?: string): string {
    switch (code) {
      case '1':
      case 'network_timeout':
        return ERRORS.NETWORK_ERROR;
      case '2':
      case 'network_error':
        return ERRORS.NETWORK_ERROR;
      case '3':
      case 'audio_error':
        return ERRORS.MICROPHONE_PERMISSION;
      case '4':
      case 'server_error':
        return ERRORS.TRANSCRIPTION_FAILED;
      case '5':
      case 'client_error':
        return ERRORS.VOICE_NOT_SUPPORTED;
      case '6':
      case 'speech_timeout':
        return ERRORS.RECORDING_TIMEOUT;
      case '7':
      case 'no_match':
        return 'No speech detected. Please try again.';
      case '8':
      case 'recognizer_busy':
        return 'Recognition service is busy. Please try again.';
      case '9':
      case 'insufficient_permissions':
        return ERRORS.MICROPHONE_PERMISSION;
      default:
        return ERRORS.UNKNOWN_ERROR;
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'VoiceScribe needs access to your microphone to record audio for transcription.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      
      // For iOS, permissions are handled automatically by the Voice library
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const available = await Voice.isAvailable();
      return available;
    } catch (error) {
      console.error('Error checking voice availability:', error);
      return false;
    }
  }

  async getSupportedLanguages(): Promise<string[]> {
    try {
      const languages = await Voice.getSupportedLanguages();
      
      // Filter to only include our supported languages
      const supportedCodes = SUPPORTED_LANGUAGES.map(lang => lang.code);
      return languages.filter(lang => 
        supportedCodes.some(code => lang.toLowerCase().includes(code))
      );
    } catch (error) {
      console.error('Error getting supported languages:', error);
      return ['en'];
    }
  }

  async startRecognition(
    language: string,
    onResult: (result: VoiceResult) => void,
    onError: (error: VoiceError) => void,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    try {
      // Check permissions first
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error(ERRORS.MICROPHONE_PERMISSION);
      }

      // Check if voice recognition is available
      const available = await this.isAvailable();
      if (!available) {
        throw new Error(ERRORS.VOICE_NOT_SUPPORTED);
      }

      // Stop any existing recognition
      await this.stopRecognition();

      // Set callbacks
      this.onResultCallback = onResult;
      this.onErrorCallback = onError;
      this.onStartCallback = onStart;
      this.onEndCallback = onEnd;
      this.currentLanguage = language;

      // Set timeout for recognition
      this.recognitionTimer = setTimeout(() => {
        this.stopRecognition();
        onError({
          code: 'TIMEOUT',
          message: ERRORS.RECORDING_TIMEOUT,
        });
      }, VOICE_RECOGNITION_CONFIG.maxRecordingTime);

      // Map language codes to locale strings
      const localeMap: { [key: string]: string } = {
        'en': 'en-US',
        'ru': 'ru-RU',
        'kk': 'kk-KZ',
      };

      const locale = localeMap[language] || 'en-US';

      // Start recognition
      await Voice.start(locale, {
        EXTRA_LANGUAGE_MODEL: 'LANGUAGE_MODEL_FREE_FORM',
        EXTRA_CALLING_PACKAGE: 'com.voicescribe',
        EXTRA_PARTIAL_RESULTS: true,
        REQUEST_PERMISSIONS_AUTO: true,
      });

    } catch (error) {
      console.error('Error starting voice recognition:', error);
      onError({
        code: 'START_ERROR',
        message: error instanceof Error ? error.message : ERRORS.UNKNOWN_ERROR,
      });
    }
  }

  async stopRecognition(): Promise<void> {
    try {
      this.clearRecognitionTimer();
      await Voice.stop();
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  }

  async cancelRecognition(): Promise<void> {
    try {
      this.clearRecognitionTimer();
      await Voice.cancel();
    } catch (error) {
      console.error('Error canceling voice recognition:', error);
    }
  }

  async destroyRecognizer(): Promise<void> {
    try {
      this.clearRecognitionTimer();
      await Voice.destroy();
      this.isInitialized = false;
    } catch (error) {
      console.error('Error destroying voice recognizer:', error);
    }
  }

  isListening(): boolean {
    return Voice.isListening;
  }

  // Cleanup method to be called when the service is no longer needed
  cleanup(): void {
    this.destroyRecognizer();
    this.onResultCallback = undefined;
    this.onErrorCallback = undefined;
    this.onStartCallback = undefined;
    this.onEndCallback = undefined;
  }
}

export default VoiceService;