import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { Platform } from 'react-native';
import { SUPPORTED_AUDIO_FORMATS, MAX_FILE_SIZE, ERRORS, EXPORT_FORMATS } from './constants';
import { Transcription } from '../types';
import { TextProcessor } from './textProcessor';

export interface FileInfo {
  uri: string;
  name: string;
  size: number;
  type: string;
}

export interface ExportOptions {
  format: 'txt' | 'json' | 'docx';
  includeMetadata: boolean;
  fileName?: string;
}

export class FileService {
  /**
   * Pick an audio file from device storage
   */
  static async pickAudioFile(): Promise<FileInfo | null> {
    try {
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.audio],
        copyTo: 'documentDirectory',
      });

      // Validate file size
      if (result.size && result.size > MAX_FILE_SIZE) {
        throw new Error(ERRORS.FILE_TOO_LARGE);
      }

      // Validate file type
      if (result.type && !SUPPORTED_AUDIO_FORMATS.includes(result.type)) {
        throw new Error(ERRORS.UNSUPPORTED_FORMAT);
      }

      return {
        uri: result.fileCopyUri || result.uri,
        name: result.name || 'audio_file',
        size: result.size || 0,
        type: result.type || 'audio/unknown',
      };
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        return null; // User cancelled
      }
      
      console.error('Error picking audio file:', error);
      throw error;
    }
  }

  /**
   * Read audio file as base64 string
   */
  static async readAudioFileAsBase64(uri: string): Promise<string> {
    try {
      const base64 = await RNFS.readFile(uri, 'base64');
      return base64;
    } catch (error) {
      console.error('Error reading audio file:', error);
      throw new Error(ERRORS.STORAGE_ERROR);
    }
  }

  /**
   * Save transcription to a file
   */
  static async saveTranscriptionToFile(
    transcription: Transcription,
    options: ExportOptions
  ): Promise<string> {
    try {
      const { format, includeMetadata, fileName } = options;
      
      let content: string;
      let mimeType: string;
      let fileExtension: string;

      const formatInfo = EXPORT_FORMATS.find(f => f.value === format);
      if (!formatInfo) {
        throw new Error('Unsupported export format');
      }

      mimeType = formatInfo.mimeType;
      fileExtension = formatInfo.extension;

      switch (format) {
        case 'txt':
          content = this.formatTextContent(transcription, includeMetadata);
          break;
        case 'json':
          content = this.formatJsonContent(transcription, includeMetadata);
          break;
        case 'docx':
          // For now, export as rich text format
          content = this.formatRichTextContent(transcription, includeMetadata);
          mimeType = 'application/rtf';
          fileExtension = 'rtf';
          break;
        default:
          throw new Error('Unsupported export format');
      }

      // Generate file name
      const finalFileName = fileName || this.generateFileName(transcription, fileExtension);
      
      // Create file path
      const filePath = `${RNFS.DocumentDirectoryPath}/${finalFileName}`;
      
      // Write file
      await RNFS.writeFile(filePath, content, 'utf8');

      return filePath;
    } catch (error) {
      console.error('Error saving transcription to file:', error);
      throw error;
    }
  }

  /**
   * Export multiple transcriptions to a file
   */
  static async exportTranscriptions(
    transcriptions: Transcription[],
    options: ExportOptions
  ): Promise<string> {
    try {
      const { format, includeMetadata } = options;
      
      let content: string;
      let fileExtension: string;

      const formatInfo = EXPORT_FORMATS.find(f => f.value === format);
      if (!formatInfo) {
        throw new Error('Unsupported export format');
      }

      fileExtension = formatInfo.extension;

      switch (format) {
        case 'txt':
          content = this.formatMultipleTextContent(transcriptions, includeMetadata);
          break;
        case 'json':
          content = this.formatMultipleJsonContent(transcriptions, includeMetadata);
          break;
        case 'docx':
          content = this.formatMultipleRichTextContent(transcriptions, includeMetadata);
          fileExtension = 'rtf';
          break;
        default:
          throw new Error('Unsupported export format');
      }

      // Generate file name
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `VoiceScribe_Export_${timestamp}.${fileExtension}`;
      
      // Create file path
      const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      
      // Write file
      await RNFS.writeFile(filePath, content, 'utf8');

      return filePath;
    } catch (error) {
      console.error('Error exporting transcriptions:', error);
      throw error;
    }
  }

  /**
   * Share a file using the system share dialog
   */
  static async shareFile(filePath: string, title: string = 'Share Transcription'): Promise<void> {
    try {
      const shareOptions = {
        title,
        url: Platform.OS === 'ios' ? filePath : `file://${filePath}`,
        type: 'text/plain',
      };

      await Share.open(shareOptions);
    } catch (error) {
      console.error('Error sharing file:', error);
      throw error;
    }
  }

  /**
   * Delete a file from device storage
   */
  static async deleteFile(filePath: string): Promise<void> {
    try {
      const exists = await RNFS.exists(filePath);
      if (exists) {
        await RNFS.unlink(filePath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Get file information
   */
  static async getFileInfo(filePath: string): Promise<RNFS.StatResult | null> {
    try {
      const exists = await RNFS.exists(filePath);
      if (!exists) {
        return null;
      }
      
      return await RNFS.stat(filePath);
    } catch (error) {
      console.error('Error getting file info:', error);
      return null;
    }
  }

  /**
   * Format transcription as plain text
   */
  private static formatTextContent(transcription: Transcription, includeMetadata: boolean): string {
    let content = transcription.text;

    if (includeMetadata) {
      const metadata = [
        `Transcription ID: ${transcription.id}`,
        `Language: ${transcription.language}`,
        `Created: ${new Date(transcription.timestamp).toLocaleString()}`,
        `Source: ${transcription.source}`,
        ...(transcription.fileName ? [`File: ${transcription.fileName}`] : []),
        ...(transcription.duration ? [`Duration: ${transcription.duration}s`] : []),
        `Word Count: ${TextProcessor.countWords(transcription.text)}`,
        `---`,
        '',
      ];

      content = metadata.join('\n') + content;
    }

    return content;
  }

  /**
   * Format transcription as JSON
   */
  private static formatJsonContent(transcription: Transcription, includeMetadata: boolean): string {
    const data = includeMetadata
      ? {
          ...transcription,
          wordCount: TextProcessor.countWords(transcription.text),
          keywords: TextProcessor.extractKeywords(transcription.text),
          summary: TextProcessor.getSummary(transcription.text),
          readingTime: TextProcessor.estimateReadingTime(transcription.text),
        }
      : {
          text: transcription.text,
          timestamp: transcription.timestamp,
        };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Format transcription as Rich Text Format (RTF)
   */
  private static formatRichTextContent(transcription: Transcription, includeMetadata: boolean): string {
    let content = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}`;

    if (includeMetadata) {
      content += `\\f0\\fs24 \\b VoiceScribe Transcription\\b0\\par`;
      content += `\\par`;
      content += `\\b ID:\\b0 ${transcription.id}\\par`;
      content += `\\b Language:\\b0 ${transcription.language}\\par`;
      content += `\\b Created:\\b0 ${new Date(transcription.timestamp).toLocaleString()}\\par`;
      content += `\\b Source:\\b0 ${transcription.source}\\par`;
      
      if (transcription.fileName) {
        content += `\\b File:\\b0 ${transcription.fileName}\\par`;
      }
      
      if (transcription.duration) {
        content += `\\b Duration:\\b0 ${transcription.duration}s\\par`;
      }
      
      content += `\\b Word Count:\\b0 ${TextProcessor.countWords(transcription.text)}\\par`;
      content += `\\par`;
      content += `\\b Transcription:\\b0\\par`;
      content += `\\par`;
    }

    // Escape RTF special characters
    const escapedText = transcription.text
      .replace(/\\/g, '\\\\')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/\n/g, '\\par ');

    content += escapedText;
    content += `}`;

    return content;
  }

  /**
   * Format multiple transcriptions as text
   */
  private static formatMultipleTextContent(transcriptions: Transcription[], includeMetadata: boolean): string {
    const header = [
      'VoiceScribe Transcription Export',
      `Export Date: ${new Date().toLocaleString()}`,
      `Total Transcriptions: ${transcriptions.length}`,
      '='.repeat(50),
      '',
    ].join('\n');

    const content = transcriptions.map((transcription, index) => {
      const separator = `--- Transcription ${index + 1} ---\n`;
      return separator + this.formatTextContent(transcription, includeMetadata);
    }).join('\n\n');

    return header + content;
  }

  /**
   * Format multiple transcriptions as JSON
   */
  private static formatMultipleJsonContent(transcriptions: Transcription[], includeMetadata: boolean): string {
    const data = {
      export: {
        date: new Date().toISOString(),
        totalTranscriptions: transcriptions.length,
        version: '1.0',
      },
      transcriptions: transcriptions.map(transcription => {
        return includeMetadata
          ? {
              ...transcription,
              wordCount: TextProcessor.countWords(transcription.text),
              keywords: TextProcessor.extractKeywords(transcription.text),
              summary: TextProcessor.getSummary(transcription.text),
              readingTime: TextProcessor.estimateReadingTime(transcription.text),
            }
          : {
              text: transcription.text,
              timestamp: transcription.timestamp,
              language: transcription.language,
            };
      }),
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Format multiple transcriptions as RTF
   */
  private static formatMultipleRichTextContent(transcriptions: Transcription[], includeMetadata: boolean): string {
    let content = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}`;
    
    // Header
    content += `\\f0\\fs28 \\b VoiceScribe Transcription Export\\b0\\par`;
    content += `\\fs20 Export Date: ${new Date().toLocaleString()}\\par`;
    content += `Total Transcriptions: ${transcriptions.length}\\par`;
    content += `\\par`;

    // Transcriptions
    transcriptions.forEach((transcription, index) => {
      content += `\\fs24 \\b Transcription ${index + 1}\\b0\\par`;
      content += `\\par`;
      
      if (includeMetadata) {
        content += `\\b ID:\\b0 ${transcription.id}\\par`;
        content += `\\b Language:\\b0 ${transcription.language}\\par`;
        content += `\\b Created:\\b0 ${new Date(transcription.timestamp).toLocaleString()}\\par`;
        content += `\\b Source:\\b0 ${transcription.source}\\par`;
        
        if (transcription.fileName) {
          content += `\\b File:\\b0 ${transcription.fileName}\\par`;
        }
        
        if (transcription.duration) {
          content += `\\b Duration:\\b0 ${transcription.duration}s\\par`;
        }
        
        content += `\\b Word Count:\\b0 ${TextProcessor.countWords(transcription.text)}\\par`;
        content += `\\par`;
      }

      // Escape RTF special characters
      const escapedText = transcription.text
        .replace(/\\/g, '\\\\')
        .replace(/\{/g, '\\{')
        .replace(/\}/g, '\\}')
        .replace(/\n/g, '\\par ');

      content += escapedText;
      content += `\\par\\par`;
    });

    content += `}`;
    return content;
  }

  /**
   * Generate a filename for a transcription
   */
  private static generateFileName(transcription: Transcription, extension: string): string {
    const timestamp = new Date(transcription.timestamp).toISOString().split('T')[0];
    const summary = TextProcessor.getSummary(transcription.text, 3)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 20);
    
    return `VoiceScribe_${timestamp}_${summary}.${extension}`;
  }
}