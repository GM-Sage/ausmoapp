// Main Communication Screen

import React, { useState, useEffect } from 'react';
import { getThemeColors } from '../../utils/themeUtils';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import CommunicationButton from '../../components/communication/CommunicationButton';
import ExpressPage from '../../components/communication/ExpressPage';
import KeyboardPage from '../../components/communication/KeyboardPage';
import VisualScenePage from '../../components/communication/VisualScenePage';
import SwitchScanningOverlay from '../../components/communication/SwitchScanningOverlay';
import {
  CommunicationPage,
  CommunicationButton as CommunicationButtonType,
} from '../../types';
import { TYPOGRAPHY, SPACING } from '../../constants';
import AudioService from '../../services/audioService';
import { SupabaseDatabaseService } from '../../services/supabaseDatabaseService';
import SwitchScanningService, {
  SwitchEvent,
} from '../../services/switchScanningService';
import AnalyticsService from '../../services/analyticsService';
import AIService, { SmartSuggestion } from '../../services/aiService';
import AccessibilityService from '../../services/accessibilityService';
import SmartSuggestionsBar from '../../components/communication/SmartSuggestionsBar';
import { CommunicationSafeArea } from '../../components/common/SafeAreaWrapper';
import { useCommunicationSafeArea } from '../../hooks/useSafeArea';
import {
  navigateToPage,
  navigateBack,
  navigateToHome,
} from '../../store/slices/navigationSlice';

const { width, height } = Dimensions.get('window');

export default function CommunicationScreen() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const currentPage = useSelector(
    (state: RootState) => state.navigation.currentPageId
  );
  const currentBook = useSelector(
    (state: RootState) => state.navigation.currentBookId
  );
  const scanState = useSelector((state: RootState) => state.scan);

  const [page, setPage] = useState<CommunicationPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scanService] = useState(() => SwitchScanningService.getInstance());
  const [analyticsService] = useState(() => AnalyticsService.getInstance());
  const [aiService] = useState(() => AIService.getInstance());
  const [accessibilityService] = useState(() =>
    AccessibilityService.getInstance()
  );
  const [isSwitchScanning, setIsSwitchScanning] = useState(false);
  const [recentSymbols, setRecentSymbols] = useState<string[]>([]);
  const [currentContext, setCurrentContext] = useState<string>('');
  const safeArea = useCommunicationSafeArea();

  useEffect(() => {
    loadCurrentPage();
  }, [currentPage]);

  useEffect(() => {
    // Initialize services
    const initializeServices = async () => {
      try {
        await scanService.initialize();

        // Initialize analytics, AI, and accessibility for current user
        if (currentUser) {
          await analyticsService.initialize(currentUser.id);
          await aiService.initialize(currentUser.id);
          await accessibilityService.initialize(currentUser);
        }

        // Set up event listeners
        const handleSwitchEvent = (event: SwitchEvent) => {
          console.log('Switch event in CommunicationScreen:', event);
          handleSwitchScanningEvent(event);
        };

        scanService.addEventListener(handleSwitchEvent);

        return () => {
          scanService.removeEventListener(handleSwitchEvent);
          analyticsService.endSession();
        };
      } catch (error) {
        console.error('Error initializing services:', error);
      }
    };

    initializeServices();
  }, [scanService, analyticsService, currentUser]);

  const loadCurrentPage = async () => {
    try {
      setIsLoading(true);

      if (!currentPage || !currentBook || !currentUser) {
        console.log('Missing required data:', {
          currentPage,
          currentBook,
          currentUser: !!currentUser,
        });

        // If no page is selected, try to load the first page from the first book
        if (currentUser && !currentPage && !currentBook) {
          await loadFirstAvailablePage();
          return;
        }

        Alert.alert('Error', 'Missing page or book information');
        return;
      }

      console.log('Loading page:', currentPage, 'from book:', currentBook);

      // Load the actual page from the database
      const pageData =
        await SupabaseDatabaseService.getInstance().getPage(currentPage);

      if (!pageData) {
        console.error('Page not found:', currentPage);
        console.log('Falling back to first available page...');

        // Clear the invalid navigation state
        dispatch(navigateToHome());

        await loadFirstAvailablePage();
        return;
      }

      console.log('Loaded page data:', pageData);
      setPage(pageData);
    } catch (error) {
      console.error('Error loading page:', error);
      Alert.alert('Error', 'Failed to load communication page');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFirstAvailablePage = async () => {
    try {
      if (!currentUser) return;

      console.log('Loading first available page for user:', currentUser.id);

      // Get all books for the user
      const books = await SupabaseDatabaseService.getInstance().getBooksByUser(
        currentUser.id
      );

      if (books.length === 0) {
        Alert.alert(
          'No Books Available',
          'You need to create a communication book first. Go to the Books tab to create one.',
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }

      // Get the first book
      const firstBook = books[0];

      if (!firstBook.pages || firstBook.pages.length === 0) {
        Alert.alert(
          'No Pages Available',
          'This book has no pages. Go to the Books tab to add pages.',
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }

      // Get the first page
      const firstPage = firstBook.pages[0];

      // Navigate to the first page
      dispatch(
        navigateToPage({
          bookId: firstBook.id,
          pageId: firstPage.id,
          pageName: firstPage.name,
        })
      );
    } catch (error) {
      console.error('Error loading first available page:', error);
      Alert.alert('Error', 'Failed to load first page');
    }
  };

  const getCategoryColor = (category: string): string => {
    const colorMap: { [key: string]: string } = {
      Greetings: '#FFD700', // Yellow for prompts/questions
      Communication: '#32CD32', // Green for positive actions
      Actions: '#FFD700', // Yellow for prompts
      'Food & Drink': '#FFD700', // Yellow for prompts
      Feelings: '#FF6B6B', // Red for negative/feelings
      Places: '#32CD32', // Green for positive
      People: '#32CD32', // Green for positive
      Objects: '#FFD700', // Yellow for prompts
      Body: '#FFD700', // Yellow for prompts
      Clothing: '#FFD700', // Yellow for prompts
      Animals: '#FFD700', // Yellow for prompts
      Colors: '#FFD700', // Yellow for prompts
      Time: '#FFD700', // Yellow for prompts
      Weather: '#FFD700', // Yellow for prompts
      Transportation: '#FFD700', // Yellow for prompts
      Shapes: '#FFD700', // Yellow for prompts
      School: '#FFD700', // Yellow for prompts
      Home: '#FFD700', // Yellow for prompts
    };
    return colorMap[category] || '#FFD700';
  };

  // Handle switch scanning events
  const handleSwitchScanningEvent = (event: SwitchEvent) => {
    console.log('Handling switch scanning event:', event);

    if (event.type === 'start') {
      setIsSwitchScanning(true);
    } else if (event.type === 'stop') {
      setIsSwitchScanning(false);
    }
  };

  // Toggle switch scanning
  const toggleSwitchScanning = () => {
    if (!page) return;

    if (isSwitchScanning) {
      scanService.stopScanning();
      setIsSwitchScanning(false);
    } else {
      // Calculate grid dimensions based on page layout
      const gridSize = page.layout.gridSize;
      const totalRows = Math.ceil(Math.sqrt(gridSize));
      const totalColumns = Math.ceil(gridSize / totalRows);

      scanService.startScanning(
        totalRows,
        totalColumns,
        gridSize,
        'row-column'
      );
      setIsSwitchScanning(true);
    }
  };

  const diagnosticAudio = async () => {
    try {
      console.log('Running audio diagnostics...');

      // Test 1: Check if we can get available voices
      const voices = await AudioService.getAvailableVoices();
      console.log('Available voices count:', voices.length);

      // Test 2: Try different volume levels
      Alert.alert(
        'Audio Diagnostic',
        `Found ${voices.length} voices. Testing different volume levels...`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Test Volume 0.5',
            onPress: async () => {
              await AudioService.speak('Volume test point five', {
                ttsVoice: undefined,
                ttsSpeed: 1.0,
                ttsPitch: 1.0,
                volume: 0.5,
                autoRepeat: false,
                repeatDelay: 2000,
              });
            },
          },
          {
            text: 'Test Volume 1.0',
            onPress: async () => {
              await AudioService.speak('Volume test one point zero', {
                ttsVoice: undefined,
                ttsSpeed: 1.0,
                ttsPitch: 1.0,
                volume: 1.0,
                autoRepeat: false,
                repeatDelay: 2000,
              });
            },
          },
          {
            text: 'Test Different Voice',
            onPress: async () => {
              await AudioService.speak('Testing different voice', {
                ttsVoice: 'com.apple.voice.compact.en-US.Samantha',
                ttsSpeed: 1.0,
                ttsPitch: 1.0,
                volume: 1.0,
                autoRepeat: false,
                repeatDelay: 2000,
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error('Audio diagnostic error:', error);
      Alert.alert('Audio Diagnostic', `Error: ${(error as Error).message}`);
    }
  };

  const handleButtonPress = async (button: CommunicationButtonType) => {
    try {
      console.log('Button pressed:', button.text, button.action);

      // Track button press in analytics
      analyticsService.trackButtonPress(button.id, page?.id || '', button.text);

      // Announce button press for accessibility
      accessibilityService.announceButtonPress(button.text, page?.name);

      // Update recent symbols for AI suggestions
      setRecentSymbols(prev => {
        const updated = [...prev, button.id];
        return updated.slice(-5); // Keep only last 5 symbols
      });

      // Update context based on button action
      if (button.action.type === 'speak') {
        setCurrentContext(button.text);
      }

      if (button.action.type === 'speak') {
        const message = button.ttsMessage || button.text;
        console.log('Speaking message:', message);

        if (message) {
          // Use default voice settings if user settings are not available
          const voiceSettings = currentUser?.settings?.voiceSettings || {
            ttsVoice: undefined, // Use undefined for better compatibility
            ttsSpeed: 1.0,
            ttsPitch: 1.0,
            volume: 0.8,
            autoRepeat: false,
            repeatDelay: 2000,
          };

          console.log('Calling AudioService.speak with:', {
            message,
            voiceSettings,
          });
          await AudioService.speak(message, voiceSettings);
          console.log('AudioService.speak completed');

          // Track speech event
          analyticsService.trackSpeech(button.id, message, 'tts');
        }
      } else if (button.action.type === 'navigate') {
        if (button.action.targetPageId) {
          // Track navigation
          analyticsService.trackNavigation(
            page?.id,
            button.action.targetPageId,
            currentBook || ''
          );

          dispatch(
            navigateToPage({
              bookId: button.action.targetBookId || currentBook || '',
              pageId: button.action.targetPageId,
              pageName: 'Target Page',
            })
          );
        }
      }
    } catch (error) {
      console.error('Error handling button press:', error);
      Alert.alert('Error', 'Failed to process button action');
    }
  };

  const renderButtons = () => {
    if (!page) return null;

    const buttonsPerRow = Math.sqrt(page.layout.gridSize);
    const buttonWidth =
      (width -
        page.layout.padding * 2 -
        page.layout.spacing * (buttonsPerRow - 1)) /
      buttonsPerRow;

    return page.buttons
      .filter(button => button.isVisible)
      .sort((a, b) => a.order - b.order)
      .map((button, index) => (
        <CommunicationButton
          key={`${button.id}-${index}`}
          button={button}
          onPress={handleButtonPress}
          isHighlighted={scanState.highlightedButton === button.id}
          isScanning={scanState.isScanning}
          size={page.layout.buttonSize}
        />
      ));
  };

  const renderPageByType = () => {
    if (!page) return null;

    switch (page.type) {
      case 'express':
        return (
          <ExpressPage
            page={page}
            onButtonPress={handleButtonPress}
            onNavigateToPage={pageId => {
              dispatch(
                navigateToPage({
                  bookId: currentBook || '',
                  pageId,
                  pageName: 'Target Page',
                })
              );
            }}
          />
        );

      case 'keyboard':
        return (
          <KeyboardPage
            page={page}
            onButtonPress={handleButtonPress}
            onNavigateToPage={pageId => {
              dispatch(
                navigateToPage({
                  bookId: currentBook || '',
                  pageId,
                  pageName: 'Target Page',
                })
              );
            }}
          />
        );

      case 'visual-scene':
        return (
          <VisualScenePage
            page={page}
            onButtonPress={handleButtonPress}
            onNavigateToPage={pageId => {
              dispatch(
                navigateToPage({
                  bookId: currentBook || '',
                  pageId,
                  pageName: 'Target Page',
                })
              );
            }}
          />
        );

      case 'standard':
      default:
        return (
          <View
            style={[
              styles.container,
              { backgroundColor: page.backgroundColor },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Talk</Text>
              <View style={styles.headerButtons}>
                <TouchableOpacity
                  style={[
                    styles.headerButton,
                    isSwitchScanning && styles.headerButtonActive,
                  ]}
                  onPress={toggleSwitchScanning}
                  accessible={true}
                  accessibilityLabel={
                    isSwitchScanning
                      ? 'Stop switch scanning'
                      : 'Start switch scanning'
                  }
                  accessibilityRole="button"
                >
                  <Ionicons
                    name={isSwitchScanning ? 'stop-circle' : 'play-circle'}
                    size={24}
                    color={
                      isSwitchScanning ? themeColors.error : themeColors.surface
                    }
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={diagnosticAudio}
                  accessible={true}
                  accessibilityLabel="Audio diagnostic"
                  accessibilityRole="button"
                >
                  <Ionicons
                    name="volume-high"
                    size={24}
                    color={themeColors.surface}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Communication Grid */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={[
                styles.gridContainer,
                {
                  padding: page.layout.padding,
                  gap: page.layout.spacing,
                },
              ]}
              showsVerticalScrollIndicator={false}
            >
              {renderButtons()}
            </ScrollView>
          </View>
        );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!page) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No page loaded</Text>
      </View>
    );
  }

  const handleSmartSuggestionPress = (suggestion: SmartSuggestion) => {
    // Convert suggestion to button and handle it
    const suggestionButton: CommunicationButtonType = {
      id: suggestion.symbol.id,
      pageId: page?.id || '',
      text: suggestion.symbol.name,
      image: suggestion.symbol.image,
      ttsMessage: suggestion.symbol.name,
      action: { type: 'speak' },
      position: { row: 0, column: 0, width: 1, height: 1 },
      size: 'medium',
      backgroundColor: themeColors.primary,
      textColor: themeColors.surface,
      borderColor: themeColors.border,
      borderWidth: 1,
      borderRadius: 8,
      order: 0,
      isVisible: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    handleButtonPress(suggestionButton);
  };

  return (
    <CommunicationSafeArea style={styles.container}>
      {renderPageByType()}
      <SmartSuggestionsBar
        onSuggestionPress={handleSmartSuggestionPress}
        currentContext={currentContext}
        recentSymbols={recentSymbols}
        isVisible={!isSwitchScanning}
      />
      <SwitchScanningOverlay
        isVisible={isSwitchScanning}
        onSwitchPress={handleSwitchScanningEvent}
      />
    </CommunicationSafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: themeColors.primary,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    paddingTop: Platform.OS === 'ios' ? 60 : 20, // Account for status bar and notch
  },
  headerButton: {
    backgroundColor: themeColors.surface,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.TITLE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.surface,
    textAlign: 'center',
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    color: themeColors.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.XL,
  },
  errorText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    color: themeColors.error,
    textAlign: 'center',
    marginTop: SPACING.XL,
  },
});
