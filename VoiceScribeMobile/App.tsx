import React, { useState, useEffect } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import { AppProvider, useApp } from './src/contexts/AppContext';
import { Navigation } from './src/components/Navigation';
import { HomeScreen } from './src/screens/HomeScreen';
import { TranscriptionsScreen } from './src/screens/TranscriptionsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { LoadingSpinner } from './src/components/ui/LoadingSpinner';

const AppContent: React.FC = () => {
  const { state } = useApp();
  const { theme } = state;
  
  const [activeScreen, setActiveScreen] = useState<'home' | 'transcriptions' | 'settings'>('home');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Request permissions for Android
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ]);

        const audioPermission = granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO];
        
        if (audioPermission !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Permission Required',
            'VoiceScribe needs microphone access to record audio for transcription. Please enable this permission in your device settings.',
            [
              { text: 'OK', onPress: () => setIsInitialized(true) },
            ]
          );
        } else {
          setIsInitialized(true);
        }
      } else {
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      setIsInitialized(true);
    }
  };

  const renderCurrentScreen = () => {
    switch (activeScreen) {
      case 'home':
        return <HomeScreen />;
      case 'transcriptions':
        return <TranscriptionsScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  if (!isInitialized) {
    return <LoadingSpinner text="Initializing VoiceScribe..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
        translucent={false}
      />
      
      <View style={styles.content}>
        {renderCurrentScreen()}
      </View>
      
      <Navigation
        activeScreen={activeScreen}
        onNavigate={setActiveScreen}
      />
    </View>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default App;