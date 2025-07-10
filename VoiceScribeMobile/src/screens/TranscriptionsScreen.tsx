import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Transcription } from '../types';
import { FileService } from '../utils/fileService';
import { TextProcessor } from '../utils/textProcessor';
import { SUPPORTED_LANGUAGES } from '../utils/constants';

export const TranscriptionsScreen: React.FC = () => {
  const { state, deleteTranscription, updateTranscription, clearAllTranscriptions, exportTranscriptions } = useApp();
  const { theme, transcriptions } = state;
  
  const [selectedTranscription, setSelectedTranscription] = useState<Transcription | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editText, setEditText] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTranscriptions = transcriptions.filter(transcription =>
    transcription.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transcription.language.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteTranscription = (transcription: Transcription) => {
    Alert.alert(
      'Delete Transcription',
      'Are you sure you want to delete this transcription?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteTranscription(transcription.id),
        },
      ]
    );
  };

  const handleEditTranscription = (transcription: Transcription) => {
    setSelectedTranscription(transcription);
    setEditText(transcription.text);
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (selectedTranscription && editText.trim().length > 0) {
      updateTranscription(selectedTranscription.id, { text: editText.trim() });
      setIsEditModalVisible(false);
      setSelectedTranscription(null);
      setEditText('');
    }
  };

  const handleShareTranscription = async (transcription: Transcription) => {
    try {
      const shareOptions = {
        title: 'VoiceScribe Transcription',
        message: `${transcription.text}\n\n---\nLanguage: ${transcription.language}\nDate: ${new Date(transcription.timestamp).toLocaleDateString()}`,
      };

      await Share.share(shareOptions);
    } catch (error) {
      console.error('Error sharing transcription:', error);
      Alert.alert('Error', 'Failed to share transcription.');
    }
  };

  const handleExportTranscription = async (transcription: Transcription) => {
    try {
      setIsExporting(true);
      
      const filePath = await FileService.saveTranscriptionToFile(transcription, {
        format: 'txt',
        includeMetadata: true,
      });

      await FileService.shareFile(filePath, 'Export Transcription');
    } catch (error) {
      console.error('Error exporting transcription:', error);
      Alert.alert('Error', 'Failed to export transcription.');
    } finally {
      setIsExporting(false);
    }
  };

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
      'Clear All Transcriptions',
      'Are you sure you want to delete all transcriptions? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: clearAllTranscriptions,
        },
      ]
    );
  };

  const getLanguageName = (code: string): string => {
    const language = SUPPORTED_LANGUAGES.find(lang => lang.code === code);
    return language ? language.name : code;
  };

  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderTranscriptionItem = ({ item }: { item: Transcription }) => (
    <Card style={{ marginHorizontal: 0 }}>
      <View style={screenStyles.transcriptionHeader}>
        <View style={screenStyles.transcriptionMeta}>
          <Text style={screenStyles.transcriptionDate}>
            {formatDate(item.timestamp)}
          </Text>
          <Text style={screenStyles.transcriptionLanguage}>
            {getLanguageName(item.language)}
          </Text>
        </View>
        <View style={screenStyles.transcriptionStats}>
          <Text style={screenStyles.transcriptionStat}>
            {TextProcessor.countWords(item.text)} words
          </Text>
          {item.duration && (
            <Text style={screenStyles.transcriptionStat}>
              {item.duration}s
            </Text>
          )}
        </View>
      </View>
      
      <Text style={screenStyles.transcriptionText} numberOfLines={3}>
        {item.text}
      </Text>
      
      <View style={screenStyles.transcriptionActions}>
        <TouchableOpacity
          style={screenStyles.actionButton}
          onPress={() => handleEditTranscription(item)}
        >
          <Text style={screenStyles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={screenStyles.actionButton}
          onPress={() => handleShareTranscription(item)}
        >
          <Text style={screenStyles.actionButtonText}>Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={screenStyles.actionButton}
          onPress={() => handleExportTranscription(item)}
        >
          <Text style={screenStyles.actionButtonText}>Export</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[screenStyles.actionButton, screenStyles.deleteButton]}
          onPress={() => handleDeleteTranscription(item)}
        >
          <Text style={[screenStyles.actionButtonText, { color: theme.colors.error }]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

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
    searchContainer: {
      paddingHorizontal: 20,
      paddingBottom: 10,
    },
    actionsContainer: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 20,
      paddingBottom: 10,
    },
    transcriptionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    transcriptionMeta: {
      flex: 1,
    },
    transcriptionDate: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    transcriptionLanguage: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    transcriptionStats: {
      alignItems: 'flex-end',
    },
    transcriptionStat: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    transcriptionText: {
      fontSize: 16,
      color: theme.colors.text,
      lineHeight: 24,
      marginBottom: 12,
    },
    transcriptionActions: {
      flexDirection: 'row',
      gap: 10,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    actionButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 6,
      backgroundColor: theme.colors.surface,
    },
    deleteButton: {
      backgroundColor: 'transparent',
    },
    actionButtonText: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyText: {
      fontSize: 18,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
    },
    emptySubText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 20,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 20,
    },
  });

  return (
    <View style={screenStyles.container}>
      <View style={screenStyles.header}>
        <Text style={screenStyles.title}>Transcriptions</Text>
        <Text style={screenStyles.subtitle}>
          {filteredTranscriptions.length} transcription{filteredTranscriptions.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <View style={screenStyles.searchContainer}>
        <Input
          placeholder="Search transcriptions..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={{ marginBottom: 0 }}
        />
      </View>

      {transcriptions.length > 0 && (
        <View style={screenStyles.actionsContainer}>
          <Button
            title="Export All"
            onPress={handleExportAll}
            variant="outline"
            size="small"
            loading={isExporting}
            style={{ flex: 1 }}
          />
          <Button
            title="Clear All"
            onPress={handleClearAll}
            variant="danger"
            size="small"
            style={{ flex: 1 }}
          />
        </View>
      )}

      {filteredTranscriptions.length === 0 ? (
        <View style={screenStyles.emptyContainer}>
          <Text style={screenStyles.emptyText}>
            {searchQuery ? 'No matching transcriptions found' : 'No transcriptions yet'}
          </Text>
          <Text style={screenStyles.emptySubText}>
            {searchQuery
              ? 'Try searching with different keywords'
              : 'Start recording or upload an audio file to create your first transcription'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTranscriptions}
          renderItem={renderTranscriptionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Edit Modal */}
      <Modal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
      >
        <Text style={screenStyles.modalTitle}>Edit Transcription</Text>
        <Input
          value={editText}
          onChangeText={setEditText}
          multiline
          numberOfLines={6}
          placeholder="Enter transcription text..."
          inputStyle={{ textAlignVertical: 'top' }}
        />
        <View style={screenStyles.modalButtons}>
          <Button
            title="Cancel"
            onPress={() => setIsEditModalVisible(false)}
            variant="outline"
            style={{ flex: 1 }}
          />
          <Button
            title="Save"
            onPress={handleSaveEdit}
            style={{ flex: 1 }}
          />
        </View>
      </Modal>
    </View>
  );
};