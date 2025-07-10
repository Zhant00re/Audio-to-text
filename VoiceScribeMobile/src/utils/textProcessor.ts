/**
 * Text processing utilities for better transcription formatting
 */

export class TextProcessor {
  /**
   * Process and format raw transcription text
   */
  static formatTranscription(text: string, language: string): string {
    if (!text || text.trim().length === 0) {
      return '';
    }

    let processed = text.trim();

    // Basic punctuation and formatting
    processed = this.addPunctuation(processed, language);
    processed = this.capitalizeFirstLetter(processed);
    processed = this.formatSentences(processed);
    processed = this.removeExtraSpaces(processed);

    return processed;
  }

  /**
   * Add basic punctuation based on pauses and sentence patterns
   */
  private static addPunctuation(text: string, language: string): string {
    // Split by natural pauses (longer spaces or specific patterns)
    let sentences = text.split(/\s{2,}|\n+/);
    
    sentences = sentences.map(sentence => {
      sentence = sentence.trim();
      
      if (sentence.length === 0) return '';
      
      // Add period if sentence doesn't end with punctuation
      if (!sentence.match(/[.!?]$/)) {
        // Check if it's a question (basic heuristic)
        if (this.isQuestion(sentence, language)) {
          sentence += '?';
        } else {
          sentence += '.';
        }
      }
      
      return sentence;
    });

    return sentences.filter(s => s.length > 0).join(' ');
  }

  /**
   * Detect if sentence is likely a question
   */
  private static isQuestion(sentence: string, language: string): boolean {
    const lowerSentence = sentence.toLowerCase();
    
    // English question words
    const englishQuestionWords = [
      'what', 'where', 'when', 'why', 'how', 'who', 'which', 'whose', 'whom',
      'is', 'are', 'was', 'were', 'do', 'does', 'did', 'can', 'could', 'would', 'should'
    ];
    
    // Russian question words
    const russianQuestionWords = [
      'что', 'где', 'когда', 'почему', 'как', 'кто', 'который', 'чей', 'кому',
      'является', 'являются', 'был', 'были', 'делать', 'может', 'мог', 'бы', 'должен'
    ];
    
    // Kazakh question words
    const kazakhQuestionWords = [
      'не', 'қайда', 'қашан', 'неге', 'қалай', 'кім', 'қайсы', 'кімнің', 'кімге',
      'болып табылады', 'болды', 'жасау', 'мүмкін', 'қажет'
    ];

    let questionWords: string[] = [];
    
    switch (language) {
      case 'ru':
        questionWords = russianQuestionWords;
        break;
      case 'kk':
        questionWords = kazakhQuestionWords;
        break;
      default:
        questionWords = englishQuestionWords;
    }

    // Check if sentence starts with a question word
    const firstWord = lowerSentence.split(' ')[0];
    return questionWords.includes(firstWord);
  }

  /**
   * Capitalize first letter of each sentence
   */
  private static capitalizeFirstLetter(text: string): string {
    return text.replace(/^([a-z])|([.!?]\s*)([a-z])/g, (match, first, punct, letter) => {
      if (first) {
        return first.toUpperCase();
      }
      return punct + letter.toUpperCase();
    });
  }

  /**
   * Format sentences with proper spacing
   */
  private static formatSentences(text: string): string {
    // Ensure single space after punctuation
    text = text.replace(/([.!?])\s*([A-Z])/g, '$1 $2');
    
    // Add space after commas if missing
    text = text.replace(/,([A-Za-z])/g, ', $1');
    
    return text;
  }

  /**
   * Remove extra spaces
   */
  private static removeExtraSpaces(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }

  /**
   * Extract keywords from text for search functionality
   */
  static extractKeywords(text: string): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);
    
    // Remove duplicates
    return [...new Set(words)];
  }

  /**
   * Get text summary (first few words)
   */
  static getSummary(text: string, maxWords: number = 10): string {
    const words = text.split(/\s+/);
    if (words.length <= maxWords) {
      return text;
    }
    
    return words.slice(0, maxWords).join(' ') + '...';
  }

  /**
   * Count words in text
   */
  static countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Estimate reading time in minutes
   */
  static estimateReadingTime(text: string): number {
    const wordsPerMinute = 200; // Average reading speed
    const wordCount = this.countWords(text);
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Convert to different file formats
   */
  static formatForExport(text: string, format: 'txt' | 'json' | 'csv'): string {
    switch (format) {
      case 'txt':
        return text;
      case 'json':
        return JSON.stringify({ text: text, timestamp: new Date().toISOString() }, null, 2);
      case 'csv':
        return `"${text.replace(/"/g, '""')}"`;
      default:
        return text;
    }
  }
}