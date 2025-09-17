// Express Page Creation Wizard
// Makes it easy for parents and children to create Express pages

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommunicationButton } from '../../types';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants';

interface ExpressPageWizardProps {
  onComplete: (buttons: CommunicationButton[]) => void;
  onCancel: () => void;
}

interface WordCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  words: string[];
}

const EXPRESS_CATEGORIES: WordCategory[] = [
  {
    id: 'basic',
    name: 'Basic Words',
    icon: '💬',
    color: '#2196F3',
    words: ['I', 'want', 'need', 'like', 'more', 'please', 'thank you', 'help'],
  },
  {
    id: 'feelings',
    name: 'Feelings',
    icon: '😊',
    color: '#FF6B6B',
    words: ['happy', 'sad', 'tired', 'excited', 'angry', 'scared', 'proud', 'worried'],
  },
  {
    id: 'actions',
    name: 'Actions',
    icon: '🏃',
    color: '#4CAF50',
    words: ['go', 'stop', 'come', 'eat', 'drink', 'play', 'sleep', 'read'],
  },
  {
    id: 'objects',
    name: 'Objects',
    icon: '📦',
    color: '#FF9800',
    words: ['food', 'water', 'toy', 'book', 'ball', 'car', 'house', 'school'],
  },
  {
    id: 'people',
    name: 'People',
    icon: '👥',
    color: '#9C27B0',
    words: ['mom', 'dad', 'teacher', 'friend', 'brother', 'sister', 'baby', 'doctor'],
  },
  {
    id: 'places',
    name: 'Places',
    icon: '🏠',
    color: '#607D8B',
    words: ['home', 'school', 'park', 'store', 'hospital', 'library', 'playground', 'restaurant'],
  },
];

export default function ExpressPageWizard({ onComplete, onCancel }: ExpressPageWizardProps) {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string>('basic');

  const handleWordSelect = (word: string) => {
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter(w => w !== word));
    } else if (selectedWords.length < 9) {
      setSelectedWords([...selectedWords, word]);
    } else {
      Alert.alert('Limit Reached', 'You can select up to 9 words for your Express page.');
    }
  };

  const handleComplete = () => {
    if (selectedWords.length === 0) {
      Alert.alert('No Words Selected', 'Please select at least one word for your Express page.');
      return;
    }

    // Create buttons from selected words
    const buttons: CommunicationButton[] = selectedWords.map((word, index) => {
      const category = EXPRESS_CATEGORIES.find(cat => cat.words.includes(word));
      return {
        id: `btn-${word.toLowerCase().replace(/\s+/g, '-')}`,
        pageId: '',
        text: word,
        image: getWordEmoji(word),
        ttsMessage: word,
        action: { type: 'speak' },
        position: {
          row: Math.floor(index / 3),
          column: index % 3,
          width: 1,
          height: 1,
        },
        size: 'medium',
        backgroundColor: category?.color ? `${category.color}20` : '#FFFFFF',
        textColor: category?.color || '#000000',
        borderColor: category?.color || '#CCCCCC',
        borderWidth: 2,
        borderRadius: 8,
        order: index + 1,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    // Add control buttons if there's space
    const remainingSlots = 9 - selectedWords.length;
    if (remainingSlots >= 2) {
      buttons.push({
        id: 'btn-clear',
        pageId: '',
        text: 'Clear',
        image: '🗑️',
        ttsMessage: '',
        action: { type: 'clear' },
        position: {
          row: Math.floor(selectedWords.length / 3),
          column: selectedWords.length % 3,
          width: 1,
          height: 1,
        },
        size: 'medium',
        backgroundColor: '#F5F5F5',
        textColor: '#616161',
        borderColor: '#9E9E9E',
        borderWidth: 2,
        borderRadius: 8,
        order: selectedWords.length + 1,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      if (remainingSlots >= 3) {
        buttons.push({
          id: 'btn-back',
          pageId: '',
          text: 'Back',
          image: '⬅️',
          ttsMessage: '',
          action: { type: 'back' },
          position: {
            row: Math.floor((selectedWords.length + 1) / 3),
            column: (selectedWords.length + 1) % 3,
            width: 1,
            height: 1,
          },
          size: 'medium',
          backgroundColor: '#F5F5F5',
          textColor: '#616161',
          borderColor: '#9E9E9E',
          borderWidth: 2,
          borderRadius: 8,
          order: selectedWords.length + 2,
          isVisible: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    onComplete(buttons);
  };

  const getWordEmoji = (word: string): string => {
    const emojiMap: { [key: string]: string } = {
      'I': '👤',
      'want': '💭',
      'need': '🆘',
      'like': '❤️',
      'more': '➕',
      'please': '🙏',
      'thank you': '🙏',
      'help': '🆘',
      'happy': '😊',
      'sad': '😢',
      'tired': '😴',
      'excited': '🤩',
      'angry': '😠',
      'scared': '😨',
      'proud': '😌',
      'worried': '😟',
      'go': '🚶',
      'stop': '🛑',
      'come': '👋',
      'eat': '🍽️',
      'drink': '🥤',
      'play': '🎮',
      'sleep': '😴',
      'read': '📖',
      'food': '🍎',
      'water': '💧',
      'toy': '🧸',
      'book': '📚',
      'ball': '⚽',
      'car': '🚗',
      'house': '🏠',
      'school': '🏫',
      'mom': '👩',
      'dad': '👨',
      'teacher': '👩‍🏫',
      'friend': '👫',
      'brother': '👦',
      'sister': '👧',
      'baby': '👶',
      'doctor': '👩‍⚕️',
      'home': '🏠',
      'park': '🌳',
      'store': '🏪',
      'hospital': '🏥',
      'library': '📚',
      'playground': '🎠',
      'restaurant': '🍽️',
    };
    return emojiMap[word.toLowerCase()] || '💬';
  };

  const currentCategoryData = EXPRESS_CATEGORIES.find(cat => cat.id === currentCategory);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Ionicons name="close" size={24} color={COLORS.SURFACE} />
        </TouchableOpacity>
        <Text style={styles.title}>Create Express Page</Text>
        <TouchableOpacity 
          onPress={handleComplete} 
          style={[styles.doneButton, selectedWords.length === 0 && styles.doneButtonDisabled]}
          disabled={selectedWords.length === 0}
        >
          <Ionicons name="checkmark" size={24} color={COLORS.SURFACE} />
        </TouchableOpacity>
      </View>

      <View style={styles.selectedWordsContainer}>
        <Text style={styles.selectedWordsTitle}>
          Selected Words ({selectedWords.length}/9)
        </Text>
        <View style={styles.selectedWordsList}>
          {selectedWords.map((word, index) => (
            <TouchableOpacity
              key={word}
              style={styles.selectedWordChip}
              onPress={() => handleWordSelect(word)}
            >
              <Text style={styles.selectedWordText}>{word}</Text>
              <Ionicons name="close-circle" size={16} color={COLORS.TEXT_SECONDARY} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {EXPRESS_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                currentCategory === category.id && styles.categoryButtonActive,
                { borderColor: category.color }
              ]}
              onPress={() => setCurrentCategory(category.id)}
            >
              <Text style={styles.categoryEmoji}>{category.icon}</Text>
              <Text style={[
                styles.categoryText,
                currentCategory === category.id && { color: category.color }
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.wordsContainer}>
        <Text style={styles.wordsTitle}>
          {currentCategoryData?.name} Words
        </Text>
        <View style={styles.wordsGrid}>
          {currentCategoryData?.words.map((word) => (
            <TouchableOpacity
              key={word}
              style={[
                styles.wordButton,
                selectedWords.includes(word) && styles.wordButtonSelected,
                { borderColor: currentCategoryData.color }
              ]}
              onPress={() => handleWordSelect(word)}
            >
              <Text style={styles.wordEmoji}>{getWordEmoji(word)}</Text>
              <Text style={[
                styles.wordText,
                selectedWords.includes(word) && { color: currentCategoryData.color }
              ]}>
                {word}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>How Express Pages Work:</Text>
        <Text style={styles.instructionsText}>
          • Tap words to build sentences{'\n'}
          • Words appear in the speech bar at the top{'\n'}
          • Tap "Play Sentence" to speak the full sentence{'\n'}
          • Use "Clear" to start over, "Back" to remove last word
        </Text>
      </View>
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
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    paddingTop: 50,
  },
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.SURFACE,
  },
  cancelButton: {
    padding: SPACING.SM,
  },
  doneButton: {
    padding: SPACING.SM,
    backgroundColor: COLORS.SECONDARY,
    borderRadius: 20,
  },
  doneButtonDisabled: {
    backgroundColor: COLORS.TEXT_DISABLED,
  },
  selectedWordsContainer: {
    backgroundColor: COLORS.SURFACE,
    padding: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  selectedWordsTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  selectedWordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM,
  },
  selectedWordChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: 16,
    gap: SPACING.XS,
  },
  selectedWordText: {
    color: COLORS.SURFACE,
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  categoriesContainer: {
    backgroundColor: COLORS.SURFACE,
    paddingVertical: SPACING.SM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  categoryButton: {
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    marginHorizontal: SPACING.XS,
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: COLORS.BACKGROUND,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.BACKGROUND,
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: SPACING.XS,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
  },
  wordsContainer: {
    flex: 1,
    padding: SPACING.MD,
  },
  wordsTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  wordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  wordButton: {
    width: '30%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.SURFACE,
    borderWidth: 2,
    borderRadius: 12,
    marginBottom: SPACING.SM,
    padding: SPACING.SM,
  },
  wordButtonSelected: {
    backgroundColor: COLORS.BACKGROUND,
  },
  wordEmoji: {
    fontSize: 32,
    marginBottom: SPACING.XS,
  },
  wordText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  instructionsContainer: {
    backgroundColor: COLORS.SURFACE,
    padding: SPACING.MD,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  instructionsTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  instructionsText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
});
