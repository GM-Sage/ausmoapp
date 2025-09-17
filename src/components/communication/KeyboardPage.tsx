// Keyboard Page Component - Full QWERTY keyboard with word prediction
// For advanced users to type and speak unique communications

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  TextInput
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RootState } from '../../store';
import { CommunicationPage, CommunicationButton as CommunicationButtonType } from '../../types';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants';
import AudioService from '../../services/audioService';
import { KeyboardPageWrapper } from '../common/KeyboardAwareWrapper';
import { useKeyboardSafeArea } from '../../hooks/useSafeArea';

const { width, height } = Dimensions.get('window');

interface KeyboardPageProps {
  page: CommunicationPage;
  onButtonPress: (button: CommunicationButtonType) => void;
  onNavigateToPage?: (pageId: string) => void;
}

interface WordPrediction {
  word: string;
  confidence: number;
}

interface RecentPhrase {
  id: string;
  text: string;
  timestamp: Date;
  usageCount: number;
}

interface QuickPhrase {
  id: string;
  text: string;
  category: string;
  isCustom: boolean;
}

export default function KeyboardPage({ page, onButtonPress, onNavigateToPage }: KeyboardPageProps) {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [text, setText] = useState('');
  const [predictions, setPredictions] = useState<WordPrediction[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [recentPhrases, setRecentPhrases] = useState<RecentPhrase[]>([]);
  const [quickPhrases, setQuickPhrases] = useState<QuickPhrase[]>([]);
  const [showRecentPhrases, setShowRecentPhrases] = useState(false);
  const textInputRef = useRef<TextInput>(null);
  const safeArea = useKeyboardSafeArea();

  // Common words for prediction (in a real app, this would come from a more sophisticated system)
  const commonWords = [
    'hello', 'help', 'yes', 'no', 'please', 'thank', 'you', 'want', 'need', 'like',
    'go', 'come', 'eat', 'drink', 'play', 'sleep', 'happy', 'sad', 'tired', 'hungry',
    'home', 'school', 'work', 'store', 'park', 'mom', 'dad', 'friend', 'teacher',
    'water', 'food', 'milk', 'juice', 'apple', 'bread', 'cookie', 'pizza',
    'book', 'toy', 'game', 'music', 'movie', 'phone', 'car', 'bus', 'train'
  ];

  // Default quick phrases
  const defaultQuickPhrases: QuickPhrase[] = [
    { id: '1', text: 'Hello', category: 'Greetings', isCustom: false },
    { id: '2', text: 'Thank you', category: 'Politeness', isCustom: false },
    { id: '3', text: 'Please help', category: 'Requests', isCustom: false },
    { id: '4', text: 'I want', category: 'Requests', isCustom: false },
    { id: '5', text: 'I need', category: 'Requests', isCustom: false },
    { id: '6', text: 'Yes', category: 'Responses', isCustom: false },
    { id: '7', text: 'No', category: 'Responses', isCustom: false },
    { id: '8', text: 'I like this', category: 'Preferences', isCustom: false },
  ];

  useEffect(() => {
    updatePredictions();
  }, [text]);

  useEffect(() => {
    // Load recent phrases and quick phrases from storage
    loadRecentPhrases();
    loadQuickPhrases();
  }, []);

  const loadRecentPhrases = async () => {
    try {
      // In a real app, this would load from AsyncStorage or database
      const stored = await AsyncStorage.getItem('recentPhrases');
      if (stored) {
        const phrases = JSON.parse(stored).map((p: any) => ({
          ...p,
          timestamp: new Date(p.timestamp)
        }));
        setRecentPhrases(phrases);
      }
    } catch (error) {
      console.error('Error loading recent phrases:', error);
    }
  };

  const loadQuickPhrases = async () => {
    try {
      // In a real app, this would load from AsyncStorage or database
      const stored = await AsyncStorage.getItem('quickPhrases');
      if (stored) {
        setQuickPhrases(JSON.parse(stored));
      } else {
        setQuickPhrases(defaultQuickPhrases);
      }
    } catch (error) {
      console.error('Error loading quick phrases:', error);
      setQuickPhrases(defaultQuickPhrases);
    }
  };

  const saveRecentPhrase = async (phraseText: string) => {
    try {
      const newPhrase: RecentPhrase = {
        id: Date.now().toString(),
        text: phraseText,
        timestamp: new Date(),
        usageCount: 1,
      };

      const updatedPhrases = [newPhrase, ...recentPhrases]
        .filter((phrase, index, arr) => 
          arr.findIndex(p => p.text === phrase.text) === index
        )
        .slice(0, 10); // Keep only 10 most recent

      setRecentPhrases(updatedPhrases);
      await AsyncStorage.setItem('recentPhrases', JSON.stringify(updatedPhrases));
    } catch (error) {
      console.error('Error saving recent phrase:', error);
    }
  };

  const updatePredictions = () => {
    if (text.trim().length === 0) {
      setPredictions([]);
      return;
    }

    const words = text.trim().toLowerCase();
    const filteredWords = commonWords.filter(word => 
      word.startsWith(words) && word !== words
    );

    const wordPredictions: WordPrediction[] = filteredWords
      .slice(0, 5) // Show top 5 predictions
      .map(word => ({
        word,
        confidence: calculateConfidence(words, word)
      }))
      .sort((a, b) => b.confidence - a.confidence);

    setPredictions(wordPredictions);
  };

  const calculateConfidence = (input: string, word: string): number => {
    // Simple confidence calculation based on how much of the word matches
    return input.length / word.length;
  };

  const handleKeyPress = (key: string) => {
    if (key === 'BACKSPACE') {
      setText(prev => prev.slice(0, -1));
    } else if (key === 'SPACE') {
      setText(prev => prev + ' ');
    } else if (key === 'CAPS') {
      setCapsLock(!capsLock);
    } else if (key === 'CLEAR') {
      setText('');
    } else {
      const char = capsLock ? key.toUpperCase() : key.toLowerCase();
      setText(prev => prev + char);
    }
  };

  const handlePredictionPress = (word: string) => {
    const words = text.trim().split(' ');
    words[words.length - 1] = word;
    setText(words.join(' ') + ' ');
  };

  const handleSpeak = async () => {
    if (text.trim().length === 0) {
      Alert.alert('No Text', 'Type something to speak');
      return;
    }

    try {
      setIsPlaying(true);
      
      const voiceSettings = currentUser?.settings?.voiceSettings || {
        ttsVoice: undefined,
        ttsSpeed: 1.0,
        ttsPitch: 1.0,
        volume: 0.8,
        autoRepeat: false,
        repeatDelay: 2000,
      };

      console.log('Speaking keyboard text:', text);
      await AudioService.speak(text, voiceSettings);
      
      // Save to recent phrases
      await saveRecentPhrase(text.trim());
      
    } catch (error) {
      console.error('Error speaking keyboard text:', error);
      Alert.alert('Error', 'Failed to speak text');
    } finally {
      setIsPlaying(false);
    }
  };

  const handleClear = () => {
    setText('');
    setPredictions([]);
  };

  const handleQuickPhrasePress = (phrase: QuickPhrase) => {
    setText(prev => prev + phrase.text + ' ');
  };

  const handleRecentPhrasePress = (phrase: RecentPhrase) => {
    setText(phrase.text);
  };

  const addCustomQuickPhrase = () => {
    if (text.trim().length === 0) {
      Alert.alert('No Text', 'Type something to add as a quick phrase');
      return;
    }

    const newPhrase: QuickPhrase = {
      id: Date.now().toString(),
      text: text.trim(),
      category: 'Custom',
      isCustom: true,
    };

    const updatedPhrases = [...quickPhrases, newPhrase];
    setQuickPhrases(updatedPhrases);
    
    // Save to storage
    AsyncStorage.setItem('quickPhrases', JSON.stringify(updatedPhrases));
    
    Alert.alert('Success', 'Quick phrase added!');
  };

  const renderKeyboard = () => {
    const keyboardRows = [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
    ];

    return (
      <View style={styles.keyboard}>
        {keyboardRows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keyboardRow}>
            {row.map((key) => (
              <TouchableOpacity
                key={key}
                style={styles.key}
                onPress={() => handleKeyPress(key)}
              >
                <Text style={styles.keyText}>{key}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
        
        {/* Bottom row with special keys */}
        <View style={styles.keyboardRow}>
          <TouchableOpacity
            style={[styles.key, styles.specialKey]}
            onPress={() => handleKeyPress('CAPS')}
          >
            <Ionicons 
              name={capsLock ? "lock-closed" : "lock-open"} 
              size={16} 
              color={capsLock ? COLORS.PRIMARY : COLORS.TEXT_PRIMARY} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.key, styles.specialKey]}
            onPress={() => handleKeyPress('SPACE')}
          >
            <Text style={styles.keyText}>SPACE</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.key, styles.specialKey]}
            onPress={() => handleKeyPress('BACKSPACE')}
          >
            <Ionicons name="backspace" size={16} color={COLORS.TEXT_PRIMARY} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderPredictions = () => {
    if (predictions.length === 0) return null;

    return (
      <View style={styles.predictionsContainer}>
        <Text style={styles.predictionsTitle}>Word Suggestions:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.predictions}>
            {predictions.map((prediction, index) => (
              <TouchableOpacity
                key={index}
                style={styles.predictionButton}
                onPress={() => handlePredictionPress(prediction.word)}
              >
                <Text style={styles.predictionText}>{prediction.word}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderQuickPhrases = () => {
    return (
      <View style={styles.quickPhrasesContainer}>
        <View style={styles.quickPhrasesHeader}>
          <Text style={styles.quickPhrasesTitle}>Quick Phrases</Text>
          <TouchableOpacity
            style={styles.addPhraseButton}
            onPress={addCustomQuickPhrase}
            disabled={text.trim().length === 0}
          >
            <Ionicons 
              name="add-circle" 
              size={20} 
              color={text.trim().length === 0 ? COLORS.TEXT_DISABLED : COLORS.PRIMARY} 
            />
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.quickPhrases}>
            {quickPhrases.map((phrase) => (
              <TouchableOpacity
                key={phrase.id}
                style={[
                  styles.quickPhraseButton,
                  phrase.isCustom && styles.customQuickPhraseButton
                ]}
                onPress={() => handleQuickPhrasePress(phrase)}
              >
                <Text style={styles.quickPhraseText}>{phrase.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderRecentPhrases = () => {
    if (recentPhrases.length === 0) return null;

    return (
      <View style={styles.recentPhrasesContainer}>
        <View style={styles.recentPhrasesHeader}>
          <Text style={styles.recentPhrasesTitle}>Recent Phrases</Text>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowRecentPhrases(!showRecentPhrases)}
          >
            <Ionicons 
              name={showRecentPhrases ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={COLORS.TEXT_SECONDARY} 
            />
          </TouchableOpacity>
        </View>
        {showRecentPhrases && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.recentPhrases}>
              {recentPhrases.map((phrase) => (
                <TouchableOpacity
                  key={phrase.id}
                  style={styles.recentPhraseButton}
                  onPress={() => handleRecentPhrasePress(phrase)}
                >
                  <Text style={styles.recentPhraseText}>{phrase.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    );
  };

  const renderTextArea = () => {
    return (
      <View style={styles.textAreaContainer}>
        <View style={styles.textAreaHeader}>
          <Text style={styles.textAreaTitle}>Type Your Message</Text>
          <View style={styles.textAreaActions}>
            <TouchableOpacity
              style={[styles.actionButton, text.trim().length === 0 && styles.actionButtonDisabled]}
              onPress={handleClear}
              disabled={text.trim().length === 0}
            >
              <Ionicons name="trash" size={16} color={text.trim().length === 0 ? COLORS.TEXT_DISABLED : COLORS.ERROR} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, text.trim().length === 0 && styles.actionButtonDisabled]}
              onPress={handleSpeak}
              disabled={text.trim().length === 0 || isPlaying}
            >
              <Ionicons 
                name={isPlaying ? "pause" : "volume-high"} 
                size={16} 
                color={text.trim().length === 0 || isPlaying ? COLORS.TEXT_DISABLED : COLORS.PRIMARY} 
              />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.textArea}>
          <TextInput
            ref={textInputRef}
            style={styles.textInput}
            value={text}
            onChangeText={setText}
            placeholder="Start typing..."
            multiline
            autoCorrect={false}
            autoCapitalize="none"
            editable={false} // We handle input through our custom keyboard
          />
        </View>
      </View>
    );
  };

  return (
    <KeyboardPageWrapper style={[styles.container, { backgroundColor: page.backgroundColor }]}>
      {/* Text Area */}
      {renderTextArea()}

      {/* Quick Phrases */}
      {renderQuickPhrases()}

      {/* Recent Phrases */}
      {renderRecentPhrases()}

      {/* Word Predictions */}
      {renderPredictions()}

      {/* Keyboard */}
      {renderKeyboard()}
    </KeyboardPageWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  textAreaContainer: {
    backgroundColor: COLORS.SURFACE,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
  },
  textAreaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  textAreaTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  textAreaActions: {
    flexDirection: 'row',
    gap: SPACING.SM,
  },
  actionButton: {
    padding: SPACING.SM,
    borderRadius: 4,
    backgroundColor: COLORS.BACKGROUND,
  },
  actionButtonDisabled: {
    backgroundColor: COLORS.DIVIDER,
  },
  textArea: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    minHeight: 80,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.SM,
  },
  textInput: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    color: COLORS.TEXT_PRIMARY,
    textAlignVertical: 'top',
    flex: 1,
  },
  predictionsContainer: {
    backgroundColor: COLORS.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
  },
  predictionsTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.XS,
  },
  predictions: {
    flexDirection: 'row',
    gap: SPACING.SM,
  },
  predictionButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: 16,
  },
  predictionText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.SURFACE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  keyboard: {
    flex: 1,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.SM,
    justifyContent: 'center',
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.SM,
    gap: SPACING.XS,
  },
  key: {
    backgroundColor: COLORS.SURFACE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.SM,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.TEXT_PRIMARY,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  specialKey: {
    backgroundColor: COLORS.BACKGROUND,
    minWidth: 60,
  },
  keyText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  quickPhrasesContainer: {
    backgroundColor: COLORS.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
  },
  quickPhrasesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  quickPhrasesTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
  },
  addPhraseButton: {
    padding: SPACING.XS,
  },
  quickPhrases: {
    flexDirection: 'row',
    gap: SPACING.SM,
  },
  quickPhraseButton: {
    backgroundColor: COLORS.SECONDARY,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: 16,
  },
  customQuickPhraseButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  quickPhraseText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.SURFACE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  recentPhrasesContainer: {
    backgroundColor: COLORS.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
  },
  recentPhrasesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  recentPhrasesTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
  },
  toggleButton: {
    padding: SPACING.XS,
  },
  recentPhrases: {
    flexDirection: 'row',
    gap: SPACING.SM,
  },
  recentPhraseButton: {
    backgroundColor: COLORS.WARNING,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: 16,
  },
  recentPhraseText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.SURFACE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
});
