// Express Page Component - Sentence Building Mode
// Accumulates selected messages in a speech bar that play in sequence when tapped

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  Alert 
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import CommunicationButton from './CommunicationButton';
import { CommunicationPage, CommunicationButton as CommunicationButtonType, ExpressSentence } from '../../types';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants';
import AudioService from '../../services/audioService';

const { width, height } = Dimensions.get('window');

interface ExpressPageProps {
  page: CommunicationPage;
  onButtonPress: (button: CommunicationButtonType) => void;
  onNavigateToPage?: (pageId: string) => void;
}

export default function ExpressPage({ page, onButtonPress, onNavigateToPage }: ExpressPageProps) {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [sentenceWords, setSentenceWords] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleButtonPress = async (button: CommunicationButtonType) => {
    try {
      console.log('Express button pressed:', button.text, button.action);
      
      if (button.action.type === 'speak') {
        // Add word to sentence
        const word = button.ttsMessage || button.text;
        setSentenceWords(prev => [...prev, word]);
        
        // Optional: Play individual word immediately
        if (currentUser?.settings?.voiceSettings?.autoRepeat) {
          const voiceSettings = currentUser.settings.voiceSettings;
          await AudioService.speak(word, voiceSettings);
        }
      } else if (button.action.type === 'navigate') {
        if (button.action.targetPageId && onNavigateToPage) {
          onNavigateToPage(button.action.targetPageId);
        }
      } else if (button.action.type === 'clear') {
        // Clear sentence
        setSentenceWords([]);
      } else if (button.action.type === 'back') {
        // Remove last word
        setSentenceWords(prev => prev.slice(0, -1));
      }
      
      // Call parent handler
      onButtonPress(button);
    } catch (error) {
      console.error('Error handling express button press:', error);
      Alert.alert('Error', 'Failed to process button action');
    }
  };

  const handlePlaySentence = async () => {
    if (sentenceWords.length === 0) {
      Alert.alert('No Words', 'Add some words to your sentence first');
      return;
    }

    try {
      setIsPlaying(true);
      const fullSentence = sentenceWords.join(' ');
      
      const voiceSettings = currentUser?.settings?.voiceSettings || {
        ttsVoice: undefined,
        ttsSpeed: 1.0,
        ttsPitch: 1.0,
        volume: 0.8,
        autoRepeat: false,
        repeatDelay: 2000,
      };

      console.log('Playing express sentence:', fullSentence);
      await AudioService.speak(fullSentence, voiceSettings);
      
      // Save sentence for future use
      await saveExpressSentence(fullSentence);
      
    } catch (error) {
      console.error('Error playing express sentence:', error);
      Alert.alert('Error', 'Failed to play sentence');
    } finally {
      setIsPlaying(false);
    }
  };

  const handleClearSentence = () => {
    setSentenceWords([]);
  };

  const handleRemoveLastWord = () => {
    setSentenceWords(prev => prev.slice(0, -1));
  };

  const saveExpressSentence = async (sentence: string) => {
    try {
      // This would save to database for future use
      console.log('Saving express sentence:', sentence);
      // TODO: Implement database save
    } catch (error) {
      console.error('Error saving express sentence:', error);
    }
  };

  const renderButtons = () => {
    if (!page) return null;

    const buttonsPerRow = Math.sqrt(page.layout.gridSize);
    const buttonWidth = (width - page.layout.padding * 2 - page.layout.spacing * (buttonsPerRow - 1)) / buttonsPerRow;

    return page.buttons
      .filter(button => button.isVisible)
      .sort((a, b) => a.order - b.order)
      .map((button, index) => (
        <CommunicationButton
          key={`${button.id}-${index}`}
          button={button}
          onPress={handleButtonPress}
          size={page.layout.buttonSize}
        />
      ));
  };

  const renderSpeechBar = () => {
    return (
      <View style={styles.speechBar}>
        <View style={styles.speechBarHeader}>
          <Text style={styles.speechBarTitle}>Express Sentence</Text>
          <View style={styles.speechBarActions}>
            <TouchableOpacity
              style={[styles.speechBarButton, sentenceWords.length === 0 && styles.speechBarButtonDisabled]}
              onPress={handleRemoveLastWord}
              disabled={sentenceWords.length === 0}
            >
              <Ionicons name="backspace" size={20} color={sentenceWords.length === 0 ? COLORS.TEXT_DISABLED : COLORS.PRIMARY} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.speechBarButton, sentenceWords.length === 0 && styles.speechBarButtonDisabled]}
              onPress={handleClearSentence}
              disabled={sentenceWords.length === 0}
            >
              <Ionicons name="trash" size={20} color={sentenceWords.length === 0 ? COLORS.TEXT_DISABLED : COLORS.ERROR} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.sentenceContainer}>
          {sentenceWords.length === 0 ? (
            <Text style={styles.emptySentence}>Tap words to build your sentence</Text>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.sentenceScrollView}
            >
              <View style={styles.sentenceWords}>
                {sentenceWords.map((word, index) => (
                  <View key={index} style={styles.sentenceWord}>
                    <Text style={styles.sentenceWordText}>{word}</Text>
                    {index < sentenceWords.length - 1 && (
                      <Text style={styles.sentenceWordSeparator}> </Text>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.playButton,
            (sentenceWords.length === 0 || isPlaying) && styles.playButtonDisabled
          ]}
          onPress={handlePlaySentence}
          disabled={sentenceWords.length === 0 || isPlaying}
        >
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={24} 
            color={sentenceWords.length === 0 || isPlaying ? COLORS.TEXT_DISABLED : COLORS.SURFACE} 
          />
          <Text style={[
            styles.playButtonText,
            (sentenceWords.length === 0 || isPlaying) && styles.playButtonTextDisabled
          ]}>
            {isPlaying ? 'Playing...' : 'Play Sentence'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: page.backgroundColor }]}>
      {/* Speech Bar */}
      {renderSpeechBar()}

      {/* Communication Grid */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.gridContainer,
          {
            padding: page.layout.padding,
            gap: page.layout.spacing,
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {renderButtons()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  speechBar: {
    backgroundColor: COLORS.SURFACE,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    shadowColor: COLORS.TEXT_PRIMARY,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  speechBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  speechBarTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  speechBarActions: {
    flexDirection: 'row',
    gap: SPACING.SM,
  },
  speechBarButton: {
    padding: SPACING.SM,
    borderRadius: 4,
    backgroundColor: COLORS.BACKGROUND,
  },
  speechBarButtonDisabled: {
    backgroundColor: COLORS.DIVIDER,
  },
  sentenceContainer: {
    minHeight: 40,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 8,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.SM,
    marginBottom: SPACING.SM,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  sentenceScrollView: {
    flexGrow: 0,
  },
  sentenceWords: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  sentenceWord: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sentenceWordText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: COLORS.SURFACE,
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: 4,
    marginRight: SPACING.XS,
  },
  sentenceWordSeparator: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
  },
  emptySentence: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: SPACING.SM,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    borderRadius: 8,
    gap: SPACING.SM,
  },
  playButtonDisabled: {
    backgroundColor: COLORS.DIVIDER,
  },
  playButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.SURFACE,
  },
  playButtonTextDisabled: {
    color: COLORS.TEXT_DISABLED,
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
});
