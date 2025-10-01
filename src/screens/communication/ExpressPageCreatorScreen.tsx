// Express Page Creator Screen - Simple sentence building

import React, { useState, useEffect } from 'react';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { RootState } from '../../store';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import DatabaseService from '../../services/databaseService';
import { CommunicationPage, CommunicationButton } from '../../types';

interface ExpressPageCreatorScreenProps {
  route?: {
    params?: {
      bookId?: string;
    };
  };
}

export default function ExpressPageCreatorScreen({
  route,
}: ExpressPageCreatorScreenProps) {
  const { theme, themeColors } = useVisualSettings();
  const safeThemeColors = themeColors || getThemeColors(theme || 'light');
  const styles = getStyles(safeThemeColors);
  const navigation = useNavigation();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const bookId = route?.params?.bookId;

  const [pageName, setPageName] = useState('My Express Page');
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Simple word categories with common pictograms
  const wordCategories = {
    'Basic Words': [
      'I',
      'want',
      'more',
      'yes',
      'no',
      'please',
      'thank you',
      'help',
    ],
    Feelings: [
      'happy',
      'sad',
      'angry',
      'tired',
      'hungry',
      'thirsty',
      'scared',
      'excited',
    ],
    Actions: ['go', 'stop', 'come', 'eat', 'drink', 'play', 'sleep', 'read'],
    Objects: ['food', 'water', 'toy', 'book', 'ball', 'car', 'house', 'phone'],
    People: [
      'mom',
      'dad',
      'friend',
      'teacher',
      'doctor',
      'baby',
      'brother',
      'sister',
    ],
    Places: [
      'home',
      'school',
      'park',
      'store',
      'hospital',
      'restaurant',
      'beach',
      'zoo',
    ],
  };

  const handleWordSelect = (word: string) => {
    if (selectedWords.includes(word)) {
      // Remove word if already selected
      setSelectedWords(selectedWords.filter(w => w !== word));
    } else {
      // Add word if not selected
      setSelectedWords([...selectedWords, word]);
    }
  };

  const handleCreatePage = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'No user logged in');
      return;
    }

    if (!bookId) {
      Alert.alert('Error', 'No book selected');
      return;
    }

    if (selectedWords.length === 0) {
      Alert.alert('Error', 'Please select at least one word');
      return;
    }

    try {
      setIsLoading(true);

      // Create buttons for selected words
      const buttons: CommunicationButton[] = selectedWords.map(
        (word, index) => ({
          id: `btn-${word.toLowerCase().replace(/\s+/g, '-')}`,
          pageId: '', // Will be set when page is created
          text: word,
          image: getWordEmoji(word),
          action: {
            type: 'speak',
            message: word,
          },
          position: {
            x: (index % 3) * 33.33, // 3 columns
            y: Math.floor(index / 3) * 25, // Rows
          },
          size: 'medium',
          backgroundColor: safeThemeColors.surface,
          textColor: safeThemeColors.text_PRIMARY,
          borderColor: safeThemeColors.primary,
          borderWidth: 2,
          borderRadius: BORDER_RADIUS.MEDIUM,
          isVisible: true,
          order: index,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      );

      // Add control buttons
      const controlButtons: CommunicationButton[] = [
        {
          id: 'btn-clear',
          pageId: '',
          text: 'Clear',
          image: '🗑️',
          action: { type: 'clear' },
          position: { x: 0, y: 75 },
          size: 'medium',
          backgroundColor: safeThemeColors.error,
          textColor: safeThemeColors.surface,
          borderColor: safeThemeColors.error,
          borderWidth: 2,
          borderRadius: BORDER_RADIUS.MEDIUM,
          isVisible: true,
          order: selectedWords.length,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'btn-back',
          pageId: '',
          text: 'Back',
          image: '⬅️',
          action: { type: 'back' },
          position: { x: 33.33, y: 75 },
          size: 'medium',
          backgroundColor: safeThemeColors.surface,
          textColor: safeThemeColors.text_PRIMARY,
          borderColor: safeThemeColors.primary,
          borderWidth: 2,
          borderRadius: BORDER_RADIUS.MEDIUM,
          isVisible: true,
          order: selectedWords.length + 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const allButtons = [...buttons, ...controlButtons];

      // Create the Express page
      const expressPage: CommunicationPage = {
        id: `page-${Date.now()}-${Math.random()}`,
        bookId,
        name: pageName.trim(),
        type: 'express',
        layout: {
          gridSize: 9,
          buttonSize: 'medium',
          spacing: 8,
          padding: 16,
          orientation: 'portrait',
        },
        buttons: allButtons.map(btn => ({
          ...btn,
          pageId: `page-${Date.now()}-${Math.random()}`,
        })),
        backgroundColor: safeThemeColors.background,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save the page
      await DatabaseService.createPage(expressPage);

      Alert.alert(
        'Success!',
        'Your Express page has been created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating Express page:', error);
      Alert.alert('Error', 'Failed to create Express page');
    } finally {
      setIsLoading(false);
    }
  };

  const getWordEmoji = (word: string): string => {
    const emojiMap: { [key: string]: string } = {
      I: '👤',
      want: '💭',
      more: '➕',
      yes: '✅',
      no: '❌',
      please: '🙏',
      'thank you': '🙏',
      help: '🆘',
      happy: '😊',
      sad: '😢',
      angry: '😠',
      tired: '😴',
      hungry: '🍽️',
      thirsty: '💧',
      scared: '😨',
      excited: '🤩',
      go: '🚶',
      stop: '🛑',
      come: '👋',
      eat: '🍎',
      drink: '🥤',
      play: '🎮',
      sleep: '😴',
      read: '📖',
      food: '🍕',
      water: '💧',
      toy: '🧸',
      book: '📚',
      ball: '⚽',
      car: '🚗',
      house: '🏠',
      phone: '📱',
      mom: '👩',
      dad: '👨',
      friend: '👫',
      teacher: '👩‍🏫',
      doctor: '👩‍⚕️',
      baby: '👶',
      brother: '👦',
      sister: '👧',
      home: '🏠',
      school: '🏫',
      park: '🌳',
      store: '🏪',
      hospital: '🏥',
      restaurant: '🍽️',
      beach: '🏖️',
      zoo: '🦁',
    };
    return emojiMap[word.toLowerCase()] || '📝';
  };

  const renderWordCategory = (category: string, words: string[]) => (
    <View key={category} style={styles.categoryContainer}>
      <Text style={styles.categoryTitle}>{category}</Text>
      <View style={styles.wordsGrid}>
        {words.map(word => (
          <TouchableOpacity
            key={word}
            style={[
              styles.wordButton,
              selectedWords.includes(word) && styles.wordButtonSelected,
            ]}
            onPress={() => handleWordSelect(word)}
            accessible={true}
            accessibilityLabel={`Select ${word}`}
            accessibilityRole="button"
          >
            <Text style={styles.wordEmoji}>{getWordEmoji(word)}</Text>
            <Text
              style={[
                styles.wordText,
                selectedWords.includes(word) && styles.wordTextSelected,
              ]}
            >
              {word}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={safeThemeColors.surface} />
        </TouchableOpacity>
        <Text style={styles.title}>Create Express Page</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Page Name</Text>
          <TextInput
            style={styles.nameInput}
            value={pageName}
            onChangeText={setPageName}
            placeholder="Enter page name"
            placeholderTextColor={safeThemeColors.textSecondary}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Select Words ({selectedWords.length} selected)
          </Text>
          <Text style={styles.sectionSubtitle}>
            Tap words to add them to your Express page
          </Text>
        </View>

        {Object.entries(wordCategories).map(([category, words]) =>
          renderWordCategory(category, words)
        )}

        <View style={styles.selectedWordsSection}>
          <Text style={styles.sectionTitle}>Selected Words</Text>
          {selectedWords.length > 0 ? (
            <View style={styles.selectedWordsContainer}>
              {selectedWords.map((word, index) => (
                <View key={word} style={styles.selectedWordChip}>
                  <Text style={styles.selectedWordEmoji}>
                    {getWordEmoji(word)}
                  </Text>
                  <Text style={styles.selectedWordText}>{word}</Text>
                  <TouchableOpacity
                    onPress={() => handleWordSelect(word)}
                    style={styles.removeButton}
                  >
                    <Ionicons
                      name="close"
                      size={16}
                      color={safeThemeColors.surface}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noWordsText}>No words selected yet</Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.createButton,
            (selectedWords.length === 0 || isLoading) &&
              styles.createButtonDisabled,
          ]}
          onPress={handleCreatePage}
          disabled={selectedWords.length === 0 || isLoading}
        >
          <Ionicons name="checkmark" size={20} color={safeThemeColors.surface} />
          <Text style={styles.createButtonText}>
            {isLoading ? 'Creating...' : 'Create Express Page'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const getStyles = (safeThemeColors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: safeThemeColors.background,
  },
  header: {
    backgroundColor: safeThemeColors.primary,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.MD,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZES.TITLE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: safeThemeColors.surface,
  },
  backButton: {
    padding: SPACING.SM,
  },
  content: {
    flex: 1,
  },
  formSection: {
    backgroundColor: safeThemeColors.surface,
    margin: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
  },
  formLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: safeThemeColors.text,
    marginBottom: SPACING.SM,
  },
  formInput: {
    backgroundColor: safeThemeColors.background,
    borderWidth: 1,
    borderColor: safeThemeColors.border,
    borderRadius: BORDER_RADIUS.SM,
    padding: SPACING.SM,
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: safeThemeColors.text,
  },
  wordSection: {
    backgroundColor: safeThemeColors.surface,
    margin: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: safeThemeColors.text,
    marginBottom: SPACING.MD,
  },
  wordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM,
  },
  wordChip: {
    backgroundColor: safeThemeColors.primary,
    borderRadius: BORDER_RADIUS.SM,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
  },
  wordChipSelected: {
    backgroundColor: safeThemeColors.secondary,
  },
  wordChipText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: safeThemeColors.surface,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  wordChipTextSelected: {
    color: safeThemeColors.text,
  },
  selectedWordsSection: {
    backgroundColor: safeThemeColors.surface,
    margin: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
  },
  selectedWordsTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: safeThemeColors.text,
    marginBottom: SPACING.SM,
  },
  selectedWordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.XS,
  },
  selectedWordChip: {
    backgroundColor: safeThemeColors.secondary,
    borderRadius: BORDER_RADIUS.SM,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.XS,
  },
  selectedWordText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: safeThemeColors.text,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  removeButton: {
    padding: 2,
  },
  actionSection: {
    backgroundColor: safeThemeColors.surface,
    margin: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
  },
  actionButton: {
    backgroundColor: safeThemeColors.primary,
    borderRadius: BORDER_RADIUS.MD,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: safeThemeColors.surface,
  },
  secondaryButton: {
    backgroundColor: safeThemeColors.secondary,
  },
  disabledButton: {
    backgroundColor: safeThemeColors.textSecondary,
  },
  categoryContainer: {
    backgroundColor: safeThemeColors.surface,
    marginBottom: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
  },
  categoryTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: safeThemeColors.text,
    marginBottom: SPACING.SM,
  },
  wordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM,
  },
  wordButton: {
    backgroundColor: safeThemeColors.primary,
    borderRadius: BORDER_RADIUS.SM,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    margin: SPACING.XS,
  },
  wordButtonSelected: {
    backgroundColor: safeThemeColors.secondary,
  },
  wordEmoji: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    marginBottom: SPACING.XS,
  },
  wordText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: safeThemeColors.surface,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  wordTextSelected: {
    color: safeThemeColors.text,
  },
  placeholder: {
    backgroundColor: safeThemeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.LG,
    alignItems: 'center',
    margin: SPACING.MD,
  },
  section: {
    backgroundColor: safeThemeColors.surface,
    margin: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: safeThemeColors.textSecondary,
    marginBottom: SPACING.SM,
  },
  selectedWordsContainer: {
    backgroundColor: safeThemeColors.surface,
    margin: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
  },
  selectedWordEmoji: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
  },
  noWordsText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: safeThemeColors.textSecondary,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: safeThemeColors.primary,
    borderRadius: BORDER_RADIUS.MD,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    alignItems: 'center',
    margin: SPACING.MD,
  },
  createButtonDisabled: {
    backgroundColor: safeThemeColors.textSecondary,
  },
  createButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: safeThemeColors.surface,
  },
  nameInput: {
    backgroundColor: safeThemeColors.background,
    borderWidth: 1,
    borderColor: safeThemeColors.border,
    borderRadius: BORDER_RADIUS.SM,
    padding: SPACING.SM,
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: safeThemeColors.text,
  },
});

