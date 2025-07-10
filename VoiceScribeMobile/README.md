# VoiceScribe Mobile

A lightweight and secure mobile application for offline speech-to-text transcription supporting Russian, Kazakh, and English languages.

## Features

- ✅ **Fully Offline Processing**: All transcription happens locally on your device
- ✅ **Multi-Language Support**: Russian, Kazakh, and English
- ✅ **No Internet Required**: Complete offline functionality
- ✅ **Local Storage**: All data stored securely on your device
- ✅ **Real-time Transcription**: Live speech recognition
- ✅ **Audio File Support**: Upload and transcribe audio files
- ✅ **Export Options**: Export transcriptions in TXT, JSON, or RTF formats
- ✅ **Dark/Light Theme**: Customizable appearance
- ✅ **Privacy First**: No data sent to external servers

## Screenshots

*[Screenshots would go here in a real application]*

## Installation

### Prerequisites

- Node.js (>= 18)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd VoiceScribeMobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **iOS Setup:**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Android Setup:**
   - Ensure Android Studio is installed
   - Set up Android SDK and emulator

## Running the App

### Android

```bash
npm run android
```

### iOS

```bash
npm run ios
```

### Metro Bundler

```bash
npm start
```

## Usage

### Recording Audio

1. **Select Language**: Choose from English, Russian, or Kazakh
2. **Start Recording**: Tap the record button to start speech recognition
3. **Stop Recording**: Tap again to stop and save the transcription
4. **Review**: The transcription will appear in real-time and be saved automatically

### Uploading Audio Files

1. **Tap "Upload Audio File"** button on the home screen
2. **Select an audio file** from your device (MP3, WAV, M4A, etc.)
3. **Choose language** for transcription
4. **Process**: The file will be transcribed and saved

### Managing Transcriptions

1. **View History**: Navigate to the "History" tab to see all transcriptions
2. **Search**: Use the search bar to find specific transcriptions
3. **Edit**: Tap "Edit" to modify transcription text
4. **Share**: Share transcriptions via system share dialog
5. **Export**: Export individual transcriptions or all at once
6. **Delete**: Remove unwanted transcriptions

### Settings

- **Toggle Theme**: Switch between light and dark modes
- **Export All**: Export all transcriptions in various formats
- **Clear Data**: Remove all stored transcriptions
- **Privacy Info**: Learn about data handling

## Supported File Formats

### Audio Input
- MP3 (.mp3)
- WAV (.wav)
- M4A (.m4a)
- OGG (.ogg)
- FLAC (.flac)
- AAC (.aac)

### Export Formats
- Plain Text (.txt)
- JSON (.json)
- Rich Text Format (.rtf)

## Language Support

| Language | Code | Status |
|----------|------|--------|
| English  | en   | ✅ Full Support |
| Russian  | ru   | ✅ Full Support |
| Kazakh   | kk   | ✅ Full Support |

## Privacy & Security

VoiceScribe is designed with privacy as a priority:

- ✅ **No Internet Connection Required**: All processing happens locally
- ✅ **No Data Collection**: No analytics or tracking
- ✅ **No Account Required**: No sign-up or login needed
- ✅ **Local Storage Only**: Data never leaves your device
- ✅ **No External APIs**: No communication with external servers

## Architecture

### Key Components

- **React Native**: Cross-platform mobile framework
- **@react-native-voice/voice**: Native speech recognition
- **AsyncStorage**: Local data persistence
- **React Context**: State management
- **TypeScript**: Type safety

### File Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components
│   └── Navigation.tsx  # Bottom navigation
├── screens/            # Main application screens
│   ├── HomeScreen.tsx  # Recording and upload
│   ├── TranscriptionsScreen.tsx  # History management
│   └── SettingsScreen.tsx        # App settings
├── contexts/           # React Context providers
│   └── AppContext.tsx  # Global state management
├── utils/              # Utility functions
│   ├── voiceService.ts # Speech recognition logic
│   ├── fileService.ts  # File handling
│   ├── storage.ts      # Local storage
│   ├── textProcessor.ts # Text formatting
│   └── constants.ts    # App constants
└── types/              # TypeScript definitions
    └── index.ts        # Type definitions
```

## Configuration

### Android Permissions

The app requires these permissions on Android:
- `RECORD_AUDIO`: For voice recording
- `WRITE_EXTERNAL_STORAGE`: For file exports
- `READ_EXTERNAL_STORAGE`: For file imports

### iOS Permissions

The app requires these permissions on iOS:
- `NSMicrophoneUsageDescription`: For voice recording
- `NSSpeechRecognitionUsageDescription`: For speech recognition

## Development

### Available Scripts

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run tests
npm test

# Lint code
npm run lint
```

### Build for Production

#### Android APK
```bash
cd android
./gradlew assembleRelease
```

#### iOS Archive
```bash
cd ios
xcodebuild -workspace VoiceScribeMobile.xcworkspace -scheme VoiceScribeMobile -configuration Release
```

## Troubleshooting

### Common Issues

1. **Voice Recognition Not Working**
   - Check microphone permissions
   - Ensure device supports speech recognition
   - Try restarting the app

2. **Audio File Not Processing**
   - Verify file format is supported
   - Check file size (max 100MB)
   - Ensure storage permissions are granted

3. **App Crashes on Startup**
   - Clear app data and cache
   - Reinstall the application
   - Check device compatibility

### Error Messages

- **"Voice recognition not supported"**: Device doesn't support speech recognition
- **"Microphone permission required"**: Grant microphone access in settings
- **"File too large"**: Use smaller audio files (< 100MB)
- **"Unsupported format"**: Use supported audio formats

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please contact:
- Email: support@voicescribe.app
- Website: https://voicescribe.app

## Acknowledgments

- React Native team for the excellent framework
- Voice recognition library contributors
- Open source community for various libraries used

## Changelog

### Version 1.0.0
- Initial release
- Multi-language speech recognition
- Offline processing
- File upload support
- Export functionality
- Dark/light theme support

## Roadmap

- [ ] Additional language support
- [ ] Improved accuracy with custom models
- [ ] Batch processing for multiple files
- [ ] Cloud backup option (optional)
- [ ] Advanced text formatting
- [ ] Voice commands for navigation
