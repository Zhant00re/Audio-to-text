import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FileService } from '../utils/fileService';
import { APP_INFO } from '../utils/constants';

export const SettingsScreen: React.FC = () => {
  const { state, toggleTheme, clearAllTranscriptions, exportTranscriptions } = useApp();
  const { theme, transcriptions } = state;
  
  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleExportAll = async () => {
    try {
      setIsExporting(true);
      
      const filePath = await FileService.exportTranscriptions(transcriptions, {
        format: 'json',
        includeMetadata: true,
      });

      await FileService.shareFile(filePath, 'Export All Transcriptions');
    } catch (error) {
      console.error('Error exporting all transcriptions:', error);
      Alert.alert('Error', 'Failed to export transcriptions.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all transcriptions? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            await clearAllTranscriptions();
            setIsClearing(false);
            Alert.alert('Success', 'All transcriptions have been cleared.');
          },
        },
      ]
    );
  };

  const handleContact = () => {
    Linking.openURL(`mailto:${APP_INFO.supportEmail}`);
  };

  const handleWebsite = () => {
    Linking.openURL(APP_INFO.website);
  };

  const formatStorageSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const estimateStorageUsage = (): number => {
    // Rough estimate: each transcription takes about 1KB of storage
    return transcriptions.length * 1024;
  };

  const screenStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 20,
      paddingTop: 60,
      paddingBottom: 10,
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
    },
    content: {
      flex: 1,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 16,
      marginTop: 8,
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
    },
    settingLabel: {
      fontSize: 16,
      color: theme.colors.text,
      flex: 1,
    },
    settingDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    statItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    statLabel: {
      fontSize: 16,
      color: theme.colors.text,
    },
    statValue: {
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    buttonContainer: {
      marginTop: 16,
      gap: 12,
    },
    aboutText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
    },
    linkButton: {
      paddingVertical: 8,
    },
    linkText: {
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    version: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: 20,
    },
  });

  return (
    <View style={screenStyles.container}>
      <View style={screenStyles.header}>
        <Text style={screenStyles.title}>Settings</Text>
        <Text style={screenStyles.subtitle}>
          Customize your VoiceScribe experience
        </Text>
      </View>

      <ScrollView style={screenStyles.content} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 20 }}>
          {/* Appearance */}
          <Card>
            <Text style={screenStyles.sectionTitle}>Appearance</Text>
            <View style={screenStyles.settingItem}>
              <View style={{ flex: 1 }}>
                <Text style={screenStyles.settingLabel}>Dark Theme</Text>
                <Text style={screenStyles.settingDescription}>
                  Use dark colors for better viewing in low light
                </Text>
              </View>
              <Switch
                value={theme.isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={theme.isDark ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>
          </Card>

          {/* Storage & Data */}
          <Card>
            <Text style={screenStyles.sectionTitle}>Storage & Data</Text>
            
            <View style={screenStyles.statItem}>
              <Text style={screenStyles.statLabel}>Total Transcriptions</Text>
              <Text style={screenStyles.statValue}>{transcriptions.length}</Text>
            </View>
            
            <View style={screenStyles.statItem}>
              <Text style={screenStyles.statLabel}>Storage Used</Text>
              <Text style={screenStyles.statValue}>
                {formatStorageSize(estimateStorageUsage())}
              </Text>
            </View>

            <View style={screenStyles.buttonContainer}>
              <Button
                title="Export All Transcriptions"
                onPress={handleExportAll}
                variant="outline"
                loading={isExporting}
                disabled={transcriptions.length === 0}
              />
              
              <Button
                title="Clear All Data"
                onPress={handleClearAll}
                variant="danger"
                loading={isClearing}
                disabled={transcriptions.length === 0}
              />
            </View>
          </Card>

          {/* Features */}
          <Card>
            <Text style={screenStyles.sectionTitle}>Features</Text>
            
            <View style={screenStyles.statItem}>
              <Text style={screenStyles.statLabel}>Offline Processing</Text>
              <Text style={[screenStyles.statValue, { color: theme.colors.success }]}>
                Enabled
              </Text>
            </View>
            
            <View style={screenStyles.statItem}>
              <Text style={screenStyles.statLabel}>Supported Languages</Text>
              <Text style={screenStyles.statValue}>3</Text>
            </View>
            
            <View style={screenStyles.statItem}>
              <Text style={screenStyles.statLabel}>Export Formats</Text>
              <Text style={screenStyles.statValue}>TXT, JSON, RTF</Text>
            </View>

            <Text style={screenStyles.aboutText}>
              VoiceScribe processes all audio locally on your device. No data is sent to external servers, ensuring complete privacy and offline functionality.
            </Text>
          </Card>

          {/* About */}
          <Card>
            <Text style={screenStyles.sectionTitle}>About</Text>
            
            <Text style={screenStyles.aboutText}>
              {APP_INFO.description}
            </Text>
            
            <Text style={screenStyles.aboutText}>
              Version {APP_INFO.version}
            </Text>

            <TouchableOpacity style={screenStyles.linkButton} onPress={handleContact}>
              <Text style={screenStyles.linkText}>Contact Support</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={screenStyles.linkButton} onPress={handleWebsite}>
              <Text style={screenStyles.linkText}>Visit Website</Text>
            </TouchableOpacity>
          </Card>

          {/* Privacy Notice */}
          <Card>
            <Text style={screenStyles.sectionTitle}>Privacy</Text>
            <Text style={screenStyles.aboutText}>
              VoiceScribe is designed with privacy in mind. All transcriptions are processed and stored locally on your device. No audio data or transcriptions are transmitted to external servers.
            </Text>
            <Text style={screenStyles.aboutText}>
              • Audio processing happens entirely offline
              • No account registration required
              • No data collection or tracking
              • Complete control over your data
            </Text>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
};