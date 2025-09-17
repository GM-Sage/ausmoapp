# Ausmo - Complete AAC Communication App

A comprehensive cross-platform mobile application (React Native with Expo) that replicates all functionality of GoTalk NOW for children with autism and communication needs.

## Features

### Core Communication Features
- **Standard Pages**: Grid layouts with 1, 2, 4, 9, 16, 25, or 36 message locations
- **Express Pages**: Sentence building mode with speech bar
- **Visual Scene Pages**: Custom background images with invisible hotspots
- **Keyboard Pages**: Full QWERTY keyboard with word prediction

### Audio System
- Text-to-Speech with multiple voice options
- Audio recording up to 30 seconds
- Volume and speed controls
- Background music support

### Accessibility Features
- Switch scanning (single and dual switch support)
- High contrast mode
- Large text options
- Adjustable button sizes
- Screen reader compatibility

### User Management
- Multiple user profiles
- Individual settings per user
- Usage analytics
- Backup and restore functionality

### Content Management
- Built-in symbol library (2000+ symbols)
- Custom photo integration
- Import/export functionality
- Template gallery

## Technology Stack

- **Framework**: React Native with Expo SDK 50+
- **Navigation**: React Navigation 6
- **State Management**: Redux Toolkit with RTK Query
- **Database**: SQLite with AsyncStorage
- **Audio**: expo-av, expo-speech
- **Camera**: expo-camera, expo-image-picker
- **File System**: expo-file-system, expo-sharing

## Getting Started

### Prerequisites
- Node.js 20.19.4+
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ausmo
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
```bash
npm run ios     # iOS
npm run android # Android
npm run web     # Web
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components
│   ├── communication/  # Communication-specific components
│   ├── navigation/     # Navigation components
│   └── settings/       # Settings components
├── screens/            # Screen components
│   ├── auth/          # Authentication screens
│   ├── communication/ # Communication screens
│   ├── library/       # Library management screens
│   └── settings/      # Settings screens
├── services/           # Business logic services
├── store/             # Redux store and slices
├── types/             # TypeScript type definitions
├── constants/         # App constants
├── utils/             # Utility functions
└── assets/            # Static assets
```

## Development

### Code Style
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety

### Testing
- Jest for unit testing
- React Native Testing Library for component testing

### Building for Production

1. Configure EAS Build:
```bash
npx eas build:configure
```

2. Build for production:
```bash
npx eas build --platform all
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact support@ausmo.app

## Acknowledgments

- Inspired by GoTalk NOW
- Built for the autism and communication needs community
- Designed with accessibility in mind
