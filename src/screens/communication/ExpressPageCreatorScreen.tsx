// Express Page Creator Screen - Simple sentence building

import React, { useState, useEffect } from 'react';
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
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import DatabaseService from '../../services/databaseService';
import { CommunicationPage, CommunicationButton } from '../../types';

interface ExpressPageCreatorScreenProps {
  route?: {
    params?: {
      bookId?: string;
    };
  };
}

export default function ExpressPageCreatorScreen({ route }: ExpressPageCreatorScreenProps) {
  const navigation = useNavigation();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const bookId = route?.params?.bookId;

  const [pageName, setPageName] = useState('My Express Page');
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Simple word categories with common pictograms
  const wordCategories = {
    'Basic Words': ['I', 'want', 'more', 'yes', 'no', 'please', 'thank you', 'help'],
    'Feelings': ['happy', 'sad', 'angry', 'tired', 'hungry', 'thirsty', 'scared', 'excited'],
    'Actions': ['go', 'stop', 'come', 'eat', 'drink', 'play', 'sleep', 'read'],
    'Objects': ['food', 'water', 'toy', 'book', 'ball', 'car', 'house', 'phone'],
    'People': ['mom', 'dad', 'friend', 'teacher', 'doctor', 'baby', 'brother', 'sister'],
    'Places': ['home', 'school', 'park', 'store', 'hospital', 'restaurant', 'beach', 'zoo']
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
      const buttons: CommunicationButton[] = selectedWords.map((word, index) => ({
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
        backgroundColor: COLORS.SURFACE,
        textColor: COLORS.TEXT_PRIMARY,
        borderColor: COLORS.PRIMARY,
        borderWidth: 2,
        borderRadius: BORDER_RADIUS.MEDIUM,
        isVisible: true,
        order: index,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

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
          backgroundColor: COLORS.ERROR,
          textColor: COLORS.SURFACE,
          borderColor: COLORS.ERROR,
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
          backgroundColor: COLORS.SURFACE,
          textColor: COLORS.TEXT_PRIMARY,
          borderColor: COLORS.PRIMARY,
          borderWidth: 2,
          borderRadius: BORDER_RADIUS.MEDIUM,
          isVisible: true,
          order: selectedWords.length + 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
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
        buttons: allButtons.map(btn => ({ ...btn, pageId: `page-${Date.now()}-${Math.random()}` })),
        backgroundColor: COLORS.BACKGROUND,
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
            onPress: () => navigation.goBack()
          }
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
      'I': '👤',
      'want': '💭',
      'more': '➕',
      'yes': '✅',
      'no': '❌',
      'please': '🙏',
      'thank you': '🙏',
      'help': '🆘',
      'happy': '😊',
      'sad': '😢',
      'angry': '😠',
      'tired': '😴',
      'hungry': '🍽️',
      'thirsty': '💧',
      'scared': '😨',
      'excited': '🤩',
      'go': '🚶',
      'stop': '🛑',
      'come': '👋',
      'eat': '🍎',
      'drink': '🥤',
      'play': '🎮',
      'sleep': '😴',
      'read': '📖',
      'food': '🍕',
      'water': '💧',
      'toy': '🧸',
      'book': '📚',
      'ball': '⚽',
      'car': '🚗',
      'house': '🏠',
      'phone': '📱',
      'mom': '👩',
      'dad': '👨',
      'friend': '👫',
      'teacher': '👩‍🏫',
      'doctor': '👩‍⚕️',
      'baby': '👶',
      'brother': '👦',
      'sister': '👧',
      'home': '🏠',
      'school': '🏫',
      'park': '🌳',
      'store': '🏪',
      'hospital': '🏥',
      'restaurant': '🍽️',
      'beach': '🏖️',
      'zoo': '🦁'
    };
    return emojiMap[word.toLowerCase()] || '📝';
  };

  const renderWordCategory = (category: string, words: string[]) => (
    <View key={category} style={styles.categoryContainer}>
      <Text style={styles.categoryTitle}>{category}</Text>
      <View style={styles.wordsGrid}>
        {words.map((word) => (
          <TouchableOpacity
            key={word}
            style={[
              styles.wordButton,
              selectedWords.includes(word) && styles.wordButtonSelected
            ]}
            onPress={() => handleWordSelect(word)}
            accessible={true}
            accessibilityLabel={`Select ${word}`}
            accessibilityRole="button"
          >
            <Text style={styles.wordEmoji}>{getWordEmoji(word)}</Text>
            <Text style={[
              styles.wordText,
              selectedWords.includes(word) && styles.wordTextSelected
            ]}>
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
          <Ionicons name="arrow-back" size={24} color={COLORS.SURFACE} />
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
            placeholderTextColor={COLORS.TEXT_SECONDARY}
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
                  <Text style={styles.selectedWordEmoji}>{getWordEmoji(word)}</Text>
                  <Text style={styles.selectedWordText}>{word}</Text>
                  <TouchableOpacity
                    onPress={() => handleWordSelect(word)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close" size={16} color={COLORS.SURFACE} />
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
            (selectedWords.length === 0 || isLoading) && styles.createButtonDisabled
          ]}
          onPress={handleCreatePage}
          disabled={selectedWords.length === 0 || isLoading}
        >
          <Ionicons name="checkmark" size={20} color={COLORS.SURFACE} />
          <Text style={styles.createButtonText}>
            {isLoading ? 'Creating...' : 'Create Express Page'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
    paddingHorizontal: SPACING.LG,
    paddingTop: SPACING.XL,
    paddingBottom: SPACING.MD,
    backgroundColor: COLORS.PRIMARY,
  },
  backButton: {
    padding: SPACING.SM,
  },
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.SURFACE,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: SPACING.LG,
  },
  section: {
    marginBottom: SPACING.LG,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.MD,
  },
  nameInput: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MD,
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
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
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 2,
    borderColor: COLORS.BORDER,
  },
  wordButtonSelected: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
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
  wordTextSelected: {
    color: COLORS.SURFACE,
  },
  selectedWordsSection: {
    marginBottom: SPACING.XL,
  },
  selectedWordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM,
  },
  selectedWordChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS.LARGE,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    gap: SPACING.XS,
  },
  selectedWordEmoji: {
    fontSize: 16,
  },
  selectedWordText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.SURFACE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  removeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noWordsText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    fontStyle: 'italic',
  },
  createButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS.LARGE,
    padding: SPACING.LG,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.SM,
    marginBottom: SPACING.XL,
  },
  createButtonDisabled: {
    backgroundColor: COLORS.TEXT_SECONDARY,
  },
  createButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.SURFACE,
  },
});
