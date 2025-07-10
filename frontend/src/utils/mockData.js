// Mock data and functions for testing the transcription app
// This will be replaced with actual Vosk implementation

const mockTranscriptions = {
  en: [
    "Hello, this is a test transcription in English. The speech recognition system is working properly and can detect various accents and speaking styles. This technology enables us to convert spoken words into written text with remarkable accuracy.",
    "Welcome to our audio transcription service. We provide high-quality speech-to-text conversion for multiple languages. Our system can handle different audio formats and file sizes up to 2GB.",
    "This is an example of English transcription. The system can recognize punctuation, pauses, and natural speech patterns. It's designed to work offline for maximum privacy and security."
  ],
  ru: [
    "Привет, это тестовая транскрипция на русском языке. Система распознавания речи работает правильно и может обнаруживать различные акценты и стили речи. Эта технология позволяет нам преобразовывать произнесенные слова в письменный текст с замечательной точностью.",
    "Добро пожаловать в наш сервис транскрипции аудио. Мы предоставляем высококачественное преобразование речи в текст для нескольких языков. Наша система может обрабатывать различные аудиоформаты и размеры файлов до 2 ГБ.",
    "Это пример русской транскрипции. Система может распознавать знаки препинания, паузы и естественные речевые паттерны. Она разработана для работы в автономном режиме для максимальной конфиденциальности и безопасности."
  ],
  kk: [
    "Сәлем, бұл қазақ тіліндегі тест транскрипциясы. Сөйлеуді тану жүйесі дұрыс жұмыс істейді және әртүрлі акцент пен сөйлеу стильдерін анықтай алады. Бұл технология айтылған сөздерді жазбаша мәтінге керемет дәлдікпен түрлендіруге мүмкіндік береді.",
    "Біздің аудио транскрипция қызметімізге қош келдіңіз. Біз бірнеше тіл үшін жоғары сапалы сөйлеуден мәтінге түрлендіру қызметін ұсынамыз. Біздің жүйе әртүрлі аудио форматтарын және 2 ГБ дейінгі файл өлшемдерін өңдей алады.",
    "Бұл қазақ транскрипциясының мысалы. Жүйе тыныс белгілерін, үзілістерді және табиғи сөйлеу үлгілерін тани алады. Ол максималды құпиялылық пен қауіпсіздік үшін дербес режимде жұмыс істеуге арналған."
  ]
};

export const mockTranscribe = async (file, language) => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
  
  // Determine language for mock data
  let selectedLanguage = language;
  if (language === "auto") {
    const languages = ["en", "ru", "kk"];
    selectedLanguage = languages[Math.floor(Math.random() * languages.length)];
  }
  
  // Get random transcription text
  const transcriptions = mockTranscriptions[selectedLanguage] || mockTranscriptions["en"];
  const randomText = transcriptions[Math.floor(Math.random() * transcriptions.length)];
  
  // Calculate mock duration based on file size (rough estimate)
  const mockDuration = Math.floor(file.size / (1024 * 100)) || 30; // Very rough estimate
  
  return {
    text: randomText,
    language: selectedLanguage,
    duration: mockDuration,
    confidence: 0.85 + Math.random() * 0.15 // Mock confidence score
  };
};

export const getLanguageLabel = (code) => {
  const languages = {
    "en": "English",
    "ru": "Russian",
    "kk": "Kazakh",
    "auto": "Auto-detect"
  };
  return languages[code] || code;
};

export const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};