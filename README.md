# Ausmo - Complete AAC Communication App

A comprehensive cross-platform mobile application (React Native with Expo) providing a complete Augmentative and Alternative Communication (AAC) solution for children with autism and other communication needs.

## 🚀 Features

### Core Communication Features

- **Standard Pages**: Grid layouts with 1, 2, 4, 9, 16, 25, or 36 message locations
- **Express Pages**: Advanced sentence building with features like:
  - Right-to-left accumulation for international languages
  - Combine TTS items (sentences vs. separate words)
  - Word fragments support
  - Play when adding messages
  - Express bar location (top/bottom)
  - Scan express bar in scanning sequence
- **Visual Scene Pages**: Custom background images with invisible hotspots
- **Keyboard Pages**: Full QWERTY keyboard with word prediction

### 🎯 Synced Button Library (NEW!)

- **Reusable Buttons**: Create buttons once, use everywhere
- **Auto-Sync**: Changes update across all instances instantly
- **Categorization**: Organize by communication categories
- **Usage Tracking**: Monitor button usage and popularity
- **Import/Export**: Share button libraries between users

### 🎓 Educational Features (NEW!)

- **Quiz Support**: Create educational assessments
- **Multiple Choice**: Generate quiz questions automatically
- **Scoring System**: Track correct/incorrect answers
- **Quiz History**: View past performance and progress
- **Export Results**: Share quiz results with educators

### 📤 Advanced Template Sharing (NEW!)

- **Multiple Sharing Methods**:
  - Email sharing with attachments
  - AirDrop support (iOS)
  - WiFi network broadcast
  - Cloud storage (iCloud, Google Drive, Dropbox, OneDrive)
  - PDF export of communication books
- **Template Gallery**: Browse and download community templates
- **Rating System**: Rate and review shared templates
- **Premium Templates**: Free and paid template options

### 🔊 Enhanced Audio System

- Text-to-Speech with multiple voice options
- Audio recording up to 30 seconds
- Volume and speed controls
- Background music support
- **Advanced TTS Settings**:
  - Voice customization
  - Speed and pitch control
  - Auto-repeat functionality
  - Audio feedback options

### ♿ Comprehensive Accessibility Features

- Switch scanning (single and dual switch support)
- High contrast mode
- Large text options
- Adjustable button sizes
- Screen reader compatibility
- **Advanced Accessibility**:
  - Switchamajig support (open-source switch control)
  - Tactile Talk support (physical objects with overlays)
  - Eight quick buttons option
  - Voice control integration
  - Assistive touch support

### 👥 Advanced User Management

- Multiple user profiles
- Individual settings per user
- Usage analytics and reporting
- **Enhanced Backup & Restore**:
  - Multiple cloud providers
  - PDF export of communication books
  - Compressed backups
  - Selective data restoration
  - Cross-device synchronization

### 📚 Enhanced Content Management

- Built-in symbol library (2000+ symbols)
- Custom photo integration
- **Advanced Import/Export**:
  - JSON, CSV, XML, PDF formats
  - Batch operations
  - Template sharing
  - Synced button libraries
- Template Gallery: Community-driven template sharing

## 🚀 Key Strengths

- **Modern Cross-Platform**: Works on iOS, Android, and Web
- **Real-Time Sync**: Cloud synchronization across devices
- **Advanced Analytics**: Detailed usage tracking and reporting
- **Modern UI/UX**: Intuitive, accessible interface design
- **Developer-Friendly**: Open source with comprehensive documentation

## 🆕 Latest Updates

### Synced Button Library
- Complete reusable button system
- Auto-sync across all pages
- Categorization and tagging
- Usage analytics
- Import/export functionality

### Enhanced Express Pages
- Right-to-left accumulation
- Combine TTS items setting
- Word fragments support
- Play when adding option
- Express bar positioning
- Scan express bar integration

### Advanced Template Sharing
- Email sharing with attachments
- AirDrop support (iOS)
- WiFi network broadcast
- Multiple cloud providers
- PDF export functionality
- Community template gallery

### Educational Quiz System
- Multiple choice questions
- Automatic scoring
- Quiz history tracking
- Results export
- Integration with button actions

### Advanced Backup & Export
- PDF export of communication books
- Multiple cloud provider support
- Data compression
- Enhanced export formats
- Cross-device synchronization

### Experimental Features
- Switchamajig support
- Tactile Talk integration
- Eight quick buttons
- Hide all images mode
- Show touches for external displays
- Disable internet search

## Technology Stack

- **Framework**: React Native with Expo SDK 50+
- **Navigation**: React Navigation 6
- **State Management**: Redux Toolkit with RTK Query
- **Database**: SQLite with AsyncStorage
- **Audio**: expo-audio, expo-speech
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

1. **Clone the repository:**
   ```bash
   git clone https://github.com/GM-Sage/ausmo.git
   cd ausmo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Run on your preferred platform:**
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

1. **Configure EAS Build:**
   ```bash
   npx eas build:configure
   ```

2. **Build for production:**
   ```bash
   npx eas build --platform all
   ```

## Contributing

We welcome contributions to Ausmo! Here's how you can help:

1. Fork the repository on GitHub
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting a PR

## Issues and Support

- Report bugs or request features on GitHub Issues
- For questions and support, please contact support@ausmo.app

## Acknowledgments

This project was born from a deep understanding of the challenges faced by individuals with autism and their families. Having witnessed firsthand the transformative power of effective communication tools, we set out to create something that would truly make a difference in people's lives.

Every feature has been carefully designed with accessibility at its core, ensuring that Ausmo works for everyone, regardless of their abilities or challenges. We believe that communication is a fundamental human right, and technology should be a bridge, not a barrier.

We're grateful to the countless families, therapists, educators, and individuals who have shared their experiences and helped shape this project. Your feedback and stories continue to inspire us to push the boundaries of what's possible in assistive technology.

---

<div align="center">

⭐ Star us on GitHub | 🐛 Report Issues | 📧 Contact Support

</div>