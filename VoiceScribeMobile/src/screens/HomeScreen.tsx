import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import VoiceService, { VoiceResult, VoiceError } from '../utils/voiceService';
import { FileService } from '../utils/fileService';
import { TextProcessor } from '../utils/textProcessor';
import { SUPPORTED_LANGUAGES } from '../utils/constants';

const { width, height } = Dimensions.get('window');

export const HomeScreen: React.FC = () => {
  const { state, addTranscription, setLanguage } = useApp();
  const { theme, selectedLanguage, voiceState } = state;
  
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const voiceService = VoiceService.getInstance();

  useEffect(() => {
    return () => {
      if (timer) {
        clearInterval(timer);
      }
      voiceService.cleanup();
    };
  }, [timer]);

  const startRecording = async () => {
    try {
      setIsRecording(true);
      setCurrentText('');
      setRecordingTime(0);
      
      // Start timer
      const intervalId = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setTimer(intervalId);

      await voiceService.startRecognition(
        selectedLanguage.code,
        handleVoiceResult,
        handleVoiceError,
        handleVoiceStart,
        handleVoiceEnd
      );
    } catch (error) {
      console.error('Error starting recording:', error);
      stopRecording();
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      if (timer) {
        clearInterval(timer);
        setTimer(null);
      }
      
      await voiceService.stopRecognition();
      
      // Save transcription if we have text
      if (currentText.trim().length > 0) {
        await saveTranscription(currentText);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const handleVoiceResult = (result: VoiceResult) => {
    if (result.isFinal) {
      setCurrentText(result.text);
      setIsProcessing(false);
    } else {
      setCurrentText(result.text);
      setIsProcessing(true);
    }
  };

  const handleVoiceError = (error: VoiceError) => {
    console.error('Voice recognition error:', error);
    setIsRecording(false);
    setIsProcessing(false);
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    
    Alert.alert('Recognition Error', error.message);
  };

  const handleVoiceStart = () => {
    console.log('Voice recognition started');
  };

  const handleVoiceEnd = () => {
    console.log('Voice recognition ended');
    setIsRecording(false);
    setIsProcessing(false);
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
  };

  const saveTranscription = async (text: string) => {
    try {
      const transcription = {
        text: text,
        language: selectedLanguage.code,
        timestamp: new Date().toISOString(),
        source: 'voice' as const,
        duration: recordingTime,
      };

      await addTranscription(transcription);
      setCurrentText('');
      Alert.alert('Success', 'Transcription saved successfully!');
    } catch (error) {
      console.error('Error saving transcription:', error);
      Alert.alert('Error', 'Failed to save transcription.');
    }
  };

  const handleFileUpload = async () => {
    try {
      const fileInfo = await FileService.pickAudioFile();
      if (!fileInfo) return;

      setIsProcessing(true);
      
      // For now, show that file was selected
      // In a real implementation, you'd process the audio file here
      Alert.alert(
        'File Selected',
        `Selected: ${fileInfo.name}\nSize: ${(fileInfo.size / 1024 / 1024).toFixed(2)} MB\n\nNote: Audio file processing requires additional setup for offline processing.`,
        [
          {
            text: 'OK',
            onPress: () => setIsProcessing(false),
          },
        ]
      );
    } catch (error) {
      console.error('Error handling file upload:', error);
      setIsProcessing(false);
      Alert.alert('Error', 'Failed to process audio file.');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const screenStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 20,
      paddingTop: 60,
      alignItems: 'center',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    content: {
      flex: 1,
      padding: 20,
    },
    languageSection: {
      marginBottom: 30,
    },
    languageTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
    },
    languageButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    languageButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    languageButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    languageButtonText: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: '500',
    },
    languageButtonTextActive: {
      color: '#FFFFFF',
    },
    recordingSection: {
      alignItems: 'center',
      marginBottom: 30,
    },
    recordButton: {
      width: 120,
      height: 120,
      borderRadius: 60,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    recordButtonActive: {
      backgroundColor: theme.colors.error,
    },
    recordButtonInactive: {
      backgroundColor: theme.colors.primary,
    },
    recordButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      marginTop: 8,
    },
    recordingInfo: {
      alignItems: 'center',
      marginBottom: 20,
    },
    recordingTime: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
    },
    recordingStatus: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    transcriptionSection: {
      marginBottom: 30,
    },
    transcriptionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
    },
    transcriptionText: {
      fontSize: 16,
      color: theme.colors.text,
      lineHeight: 24,
      minHeight: 100,
      textAlignVertical: 'top',
    },
    transcriptionPlaceholder: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      fontStyle: 'italic',
    },
    buttonSection: {
      gap: 12,
    },
    processingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  if (isProcessing) {
    return (
      <View style={screenStyles.container}>
        <LoadingSpinner text="Processing audio..." />
      </View>
    );
  }

  return (
    <View style={screenStyles.container}>
      <View style={screenStyles.header}>
        <Text style={screenStyles.title}>VoiceScribe</Text>
        <Text style={screenStyles.subtitle}>
          Offline speech-to-text transcription
        </Text>
      </View>

      <ScrollView style={screenStyles.content} showsVerticalScrollIndicator={false}>
        {/* Language Selection */}
        <View style={screenStyles.languageSection}>
          <Text style={screenStyles.languageTitle}>Select Language</Text>
          <View style={screenStyles.languageButtons}>
            {SUPPORTED_LANGUAGES.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  screenStyles.languageButton,
                  selectedLanguage.code === language.code && screenStyles.languageButtonActive,
                ]}
                onPress={() => setLanguage(language)}
                disabled={isRecording}
              >
                <Text
                  style={[
                    screenStyles.languageButtonText,
                    selectedLanguage.code === language.code && screenStyles.languageButtonTextActive,
                  ]}
                >
                  {language.nativeName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recording Section */}
        <View style={screenStyles.recordingSection}>
          <TouchableOpacity
            style={[
              screenStyles.recordButton,
              isRecording ? screenStyles.recordButtonActive : screenStyles.recordButtonInactive,
            ]}
            onPress={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
          >
            <Text style={screenStyles.recordButtonText}>
              {isRecording ? 'STOP' : 'START'}
            </Text>
          </TouchableOpacity>

          {isRecording && (
            <View style={screenStyles.recordingInfo}>
              <Text style={screenStyles.recordingTime}>
                {formatTime(recordingTime)}
              </Text>
              <Text style={screenStyles.recordingStatus}>
                Recording in {selectedLanguage.name}...
              </Text>
            </View>
          )}
        </View>

        {/* Current Transcription */}
        <Card>
          <Text style={screenStyles.transcriptionTitle}>Current Transcription</Text>
          <Text
            style={
              currentText.trim().length > 0
                ? screenStyles.transcriptionText
                : screenStyles.transcriptionPlaceholder
            }
          >
            {currentText.trim().length > 0
              ? currentText
              : 'Your transcription will appear here...'}
          </Text>
        </Card>

        {/* Action Buttons */}
        <View style={screenStyles.buttonSection}>
          <Button
            title="Upload Audio File"
            onPress={handleFileUpload}
            variant="outline"
            disabled={isRecording || isProcessing}
          />
          
          {currentText.trim().length > 0 && (
            <Button
              title="Save Transcription"
              onPress={() => saveTranscription(currentText)}
              disabled={isRecording || isProcessing}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};