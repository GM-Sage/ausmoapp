// Express Communication Screen - Main Talk screen with sentence building

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import AudioService from '../../services/audioService';
import AnalyticsService from '../../services/analyticsService';
import AccessibilityService from '../../services/accessibilityService';
import { CommunicationSafeArea } from '../../components/common/SafeAreaWrapper';
import { useCommunicationSafeArea } from '../../hooks/useSafeArea';

const { width } = Dimensions.get('window');

interface Word {
  id: string;
  text: string;
  emoji: string;
  category: string;
  isFavorite?: boolean;
  ttsText?: string;
}

export default function ExpressCommunicationScreen() {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const safeArea = useCommunicationSafeArea();

  const [sentenceWords, setSentenceWords] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [favoriteWords, setFavoriteWords] = useState<string[]>([]);
  const [analyticsService] = useState(() => AnalyticsService.getInstance());
  const [accessibilityService] = useState(() => AccessibilityService.getInstance());

  // Word categories with common pictograms
  const wordCategories = {
    'Favorites': [], // Will be populated with favorite words
    'Basic Words': [
      { id: 'i', text: 'I', emoji: '👤', category: 'Basic Words', ttsText: 'eye' },
      { id: 'want', text: 'want', emoji: '💭', category: 'Basic Words', ttsText: 'want' },
      { id: 'more', text: 'more', emoji: '➕', category: 'Basic Words', ttsText: 'more' },
      { id: 'yes', text: 'yes', emoji: '✅', category: 'Basic Words', ttsText: 'yes' },
      { id: 'no', text: 'no', emoji: '❌', category: 'Basic Words', ttsText: 'no' },
      { id: 'please', text: 'please', emoji: '🙏', category: 'Basic Words', ttsText: 'please' },
      { id: 'thank-you', text: 'thank you', emoji: '🙏', category: 'Basic Words', ttsText: 'thank you' },
      { id: 'help', text: 'help', emoji: '🆘', category: 'Basic Words', ttsText: 'help' },
    ],
    'Feelings': [
      { id: 'happy', text: 'happy', emoji: '😊', category: 'Feelings' },
      { id: 'sad', text: 'sad', emoji: '😢', category: 'Feelings' },
      { id: 'angry', text: 'angry', emoji: '😠', category: 'Feelings' },
      { id: 'tired', text: 'tired', emoji: '😴', category: 'Feelings' },
      { id: 'hungry', text: 'hungry', emoji: '🍽️', category: 'Feelings' },
      { id: 'thirsty', text: 'thirsty', emoji: '💧', category: 'Feelings' },
      { id: 'scared', text: 'scared', emoji: '😨', category: 'Feelings' },
      { id: 'excited', text: 'excited', emoji: '🤩', category: 'Feelings' },
    ],
    'Actions': [
      { id: 'go', text: 'go', emoji: '🚶', category: 'Actions' },
      { id: 'stop', text: 'stop', emoji: '🛑', category: 'Actions' },
      { id: 'come', text: 'come', emoji: '👋', category: 'Actions' },
      { id: 'eat', text: 'eat', emoji: '🍎', category: 'Actions' },
      { id: 'drink', text: 'drink', emoji: '🥤', category: 'Actions' },
      { id: 'play', text: 'play', emoji: '🎮', category: 'Actions' },
      { id: 'sleep', text: 'sleep', emoji: '😴', category: 'Actions' },
      { id: 'read', text: 'read', emoji: '📖', category: 'Actions' },
    ],
    'Objects': [
      { id: 'food', text: 'food', emoji: '🍕', category: 'Objects' },
      { id: 'water', text: 'water', emoji: '💧', category: 'Objects' },
      { id: 'toy', text: 'toy', emoji: '🧸', category: 'Objects' },
      { id: 'book', text: 'book', emoji: '📚', category: 'Objects' },
      { id: 'ball', text: 'ball', emoji: '⚽', category: 'Objects' },
      { id: 'car', text: 'car', emoji: '🚗', category: 'Objects' },
      { id: 'house', text: 'house', emoji: '🏠', category: 'Objects' },
      { id: 'phone', text: 'phone', emoji: '📱', category: 'Objects' },
    ],
    'People': [
      { id: 'mom', text: 'mom', emoji: '👩', category: 'People' },
      { id: 'dad', text: 'dad', emoji: '👨', category: 'People' },
      { id: 'friend', text: 'friend', emoji: '👫', category: 'People' },
      { id: 'teacher', text: 'teacher', emoji: '👩‍🏫', category: 'People' },
      { id: 'doctor', text: 'doctor', emoji: '👩‍⚕️', category: 'People' },
      { id: 'baby', text: 'baby', emoji: '👶', category: 'People' },
      { id: 'brother', text: 'brother', emoji: '👦', category: 'People' },
      { id: 'sister', text: 'sister', emoji: '👧', category: 'People' },
    ],
    'Places': [
      { id: 'home', text: 'home', emoji: '🏠', category: 'Places' },
      { id: 'school', text: 'school', emoji: '🏫', category: 'Places' },
      { id: 'park', text: 'park', emoji: '🌳', category: 'Places' },
      { id: 'store', text: 'store', emoji: '🏪', category: 'Places' },
      { id: 'hospital', text: 'hospital', emoji: '🏥', category: 'Places' },
      { id: 'restaurant', text: 'restaurant', emoji: '🍽️', category: 'Places' },
      { id: 'beach', text: 'beach', emoji: '🏖️', category: 'Places' },
      { id: 'zoo', text: 'zoo', emoji: '🦁', category: 'Places' },
    ]
  };

  useEffect(() => {
    // Initialize services
    const initializeServices = async () => {
      try {
        if (currentUser) {
          await analyticsService.initialize(currentUser.id);
          await accessibilityService.initialize(currentUser);
        }
      } catch (error) {
        console.error('Error initializing services:', error);
      }
    };

    initializeServices();
  }, [currentUser, analyticsService, accessibilityService]);

  // Update favorites category
  useEffect(() => {
    const favoriteWordsList = Object.values(wordCategories)
      .flat()
      .filter(word => favoriteWords.includes(word.id));
    
    wordCategories['Favorites'] = favoriteWordsList;
  }, [favoriteWords]);

  const handleWordPress = async (word: Word) => {
    try {
      // Use ttsText if available, otherwise use text
      const wordToSpeak = word.ttsText || word.text;
      
      // Add word to sentence (use the display text, not ttsText)
      setSentenceWords(prev => [...prev, word.text]);
      
      // Track word usage
      analyticsService.trackButtonPress(word.id, 'express-screen', word.text);
      
      // Announce word for accessibility
      accessibilityService.announceButtonPress(word.text, 'Express Communication');
      
      // Speak the word using ttsText if available
      const voiceSettings = currentUser?.settings?.voiceSettings || {
        ttsVoice: undefined,
        ttsSpeed: 1.0,
        ttsPitch: 1.0,
        volume: 0.8,
        autoRepeat: false,
        repeatDelay: 2000,
      };
      
      await AudioService.speak(wordToSpeak, voiceSettings);
      
    } catch (error) {
      console.error('Error handling word press:', error);
    }
  };

  const handlePlaySentence = async () => {
    if (sentenceWords.length === 0) return;
    
    try {
      setIsPlaying(true);
      const sentence = sentenceWords.join(' ');
      
      const voiceSettings = currentUser?.settings?.voiceSettings || {
        ttsVoice: undefined,
        ttsSpeed: 1.0,
        ttsPitch: 1.0,
        volume: 0.8,
        autoRepeat: false,
        repeatDelay: 2000,
      };
      
      await AudioService.speak(sentence, voiceSettings);
      
      // Track sentence completion
      analyticsService.trackSpeech('sentence', sentence, 'tts');
      
    } catch (error) {
      console.error('Error playing sentence:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleClear = () => {
    setSentenceWords([]);
    accessibilityService.announceButtonPress('Sentence cleared', 'Express Communication');
  };

  const handleBack = () => {
    if (sentenceWords.length > 0) {
      setSentenceWords(prev => prev.slice(0, -1));
      accessibilityService.announceButtonPress('Word removed', 'Express Communication');
    }
  };

  const toggleFavorite = (wordId: string) => {
    setFavoriteWords(prev => {
      if (prev.includes(wordId)) {
        return prev.filter(id => id !== wordId);
      } else {
        return [...prev, wordId];
      }
    });
  };

  const renderSpeechBar = () => (
    <View style={styles.speechBar}>
      <View style={styles.sentenceContainer}>
        {sentenceWords.length > 0 ? (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.sentenceScroll}
          >
            <View style={styles.sentenceWords}>
              {sentenceWords.map((word, index) => (
                <View key={index} style={styles.sentenceWord}>
                  <Text style={styles.sentenceWordText}>{word}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        ) : (
          <Text style={styles.emptySentence}>Tap words to build your sentence</Text>
        )}
      </View>
      
      <View style={styles.speechControls}>
        <TouchableOpacity
          style={[styles.controlButton, styles.playButton]}
          onPress={handlePlaySentence}
          disabled={sentenceWords.length === 0 || isPlaying}
          accessible={true}
          accessibilityLabel="Play sentence"
          accessibilityRole="button"
        >
          <Ionicons 
            name={isPlaying ? "stop" : "play"} 
            size={24} 
            color={COLORS.SURFACE} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.controlButton, styles.clearButton]}
          onPress={handleClear}
          disabled={sentenceWords.length === 0}
          accessible={true}
          accessibilityLabel="Clear sentence"
          accessibilityRole="button"
        >
          <Ionicons name="trash" size={20} color={COLORS.SURFACE} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.controlButton, styles.backButton]}
          onPress={handleBack}
          disabled={sentenceWords.length === 0}
          accessible={true}
          accessibilityLabel="Remove last word"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.SURFACE} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderWordCategory = (category: string, words: Word[]) => (
    <View key={category} style={styles.categoryContainer}>
      <Text style={styles.categoryTitle}>{category}</Text>
      <View style={styles.wordsGrid}>
        {words.map((word) => (
          <TouchableOpacity
            key={word.id}
            style={styles.wordButton}
            onPress={() => handleWordPress(word)}
            onLongPress={() => toggleFavorite(word.id)}
            accessible={true}
            accessibilityLabel={`${word.text}. Long press to add to favorites`}
            accessibilityRole="button"
          >
            <View style={styles.wordContent}>
              <Text style={styles.wordEmoji}>{word.emoji}</Text>
              <Text style={styles.wordText}>{word.text}</Text>
              {favoriteWords.includes(word.id) && (
                <View style={styles.favoriteIndicator}>
                  <Ionicons name="star" size={12} color={COLORS.PRIMARY} />
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <CommunicationSafeArea style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Talk</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => Alert.alert('Help', 'Tap words to build sentences. Long press words to add them to favorites.')}
            accessible={true}
            accessibilityLabel="Help"
            accessibilityRole="button"
          >
            <Ionicons name="help-circle" size={24} color={COLORS.SURFACE} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Speech Bar */}
      {renderSpeechBar()}

      {/* Word Categories */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {Object.entries(wordCategories).map(([category, words]) =>
          renderWordCategory(category, words)
        )}
      </ScrollView>
    </CommunicationSafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.TITLE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.SURFACE,
    textAlign: 'center',
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speechBar: {
    backgroundColor: COLORS.SURFACE,
    padding: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  sentenceContainer: {
    minHeight: 60,
    justifyContent: 'center',
    marginBottom: SPACING.SM,
  },
  sentenceScroll: {
    flex: 1,
  },
  sentenceWords: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
  },
  sentenceWord: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.MEDIUM,
  },
  sentenceWordText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.SURFACE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  emptySentence: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  speechControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.SM,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  clearButton: {
    backgroundColor: COLORS.ERROR,
  },
  backButton: {
    backgroundColor: COLORS.TEXT_SECONDARY,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.LG,
  },
  categoryContainer: {
    marginBottom: SPACING.LG,
  },
  categoryTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  wordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM,
  },
  wordButton: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.SM,
    minWidth: 80,
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    position: 'relative',
  },
  wordContent: {
    alignItems: 'center',
  },
  wordEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  wordText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  favoriteIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.SURFACE,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
  },
});
