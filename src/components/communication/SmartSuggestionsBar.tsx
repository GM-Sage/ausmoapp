// Smart Suggestions Bar Component
// Displays AI-powered symbol suggestions based on context and usage patterns

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { getThemeColors } from '../../utils/themeUtils';
import AIService, { SmartSuggestion } from '../../services/aiService';
import { CommunicationButton } from '../../types';

interface SmartSuggestionsBarProps {
  onSuggestionPress: (suggestion: SmartSuggestion) => void;
  currentContext?: string;
  recentSymbols?: string[];
  isVisible?: boolean;
}

export default function SmartSuggestionsBar({
  onSuggestionPress,
  currentContext = '',
  recentSymbols = [],
  isVisible = true,
}: SmartSuggestionsBarProps) {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const [aiService] = useState(() => AIService.getInstance());
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: themeColors.surface,
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
      paddingVertical: SPACING.SM,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: SPACING.MD,
      marginBottom: SPACING.SM,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.XS,
    },
    headerTitle: {
      fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
      fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
      color: themeColors.text,
    },
    toggleButton: {
      padding: SPACING.XS,
      borderRadius: 4,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: SPACING.SM,
      gap: SPACING.SM,
    },
    loadingText: {
      fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
      color: themeColors.textSecondary,
    },
    suggestionsContainer: {
      paddingHorizontal: SPACING.MD,
    },
    suggestionItem: {
      backgroundColor: themeColors.background,
      borderRadius: BORDER_RADIUS.MD,
      padding: SPACING.SM,
      marginRight: SPACING.SM,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: themeColors.border,
      shadowColor: themeColors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
      minWidth: 80,
    },
    suggestionSymbol: {
      fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
      marginBottom: SPACING.XS,
    },
    suggestionText: {
      fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
      fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
      color: themeColors.text,
      textAlign: 'center',
      marginBottom: SPACING.XS,
    },
    confidenceBadge: {
      backgroundColor: themeColors.primary,
      paddingHorizontal: SPACING.XS,
      paddingVertical: 2,
      borderRadius: BORDER_RADIUS.SM,
      marginBottom: SPACING.XS,
    },
    confidenceText: {
      fontSize: TYPOGRAPHY.FONT_SIZES.XS,
      fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
      color: themeColors.surface,
    },
    suggestionReason: {
      fontSize: TYPOGRAPHY.FONT_SIZES.XS,
      color: themeColors.textSecondary,
      textAlign: 'center',
    },
    suggestionContent: {
      alignItems: 'center',
    },
    suggestionName: {
      fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
      fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
      color: themeColors.text,
      textAlign: 'center',
      marginBottom: SPACING.XS,
    },
    suggestionDetails: {
      alignItems: 'center',
    },
  });

  useEffect(() => {
    if (currentUser && isVisible) {
      loadSuggestions();
    }
  }, [currentUser, currentContext, recentSymbols, isVisible]);

  const loadSuggestions = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      const smartSuggestions = await aiService.getSmartSuggestions(
        currentUser.id,
        currentContext,
        recentSymbols
      );
      setSuggestions(smartSuggestions);
    } catch (error) {
      console.error('Error loading smart suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionPress = async (suggestion: SmartSuggestion) => {
    try {
      // Learn from this interaction
      if (currentUser) {
        await aiService.learnFromInteraction(
          currentUser.id,
          suggestion.symbol.id,
          currentContext,
          new Date()
        );
      }

      // Call the parent handler
      onSuggestionPress(suggestion);
    } catch (error) {
      console.error('Error handling suggestion press:', error);
    }
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return themeColors.success;
    if (confidence >= 0.6) return themeColors.warning;
    return themeColors.info;
  };

  const getConfidenceText = (confidence: number): string => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="bulb" size={20} color={themeColors.warning} />
          <Text style={styles.headerTitle}>Smart Suggestions</Text>
        </View>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowDetails(!showDetails)}
        >
          <Ionicons
            name={showDetails ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={themeColors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={themeColors.primary} />
          <Text style={styles.loadingText}>Finding suggestions...</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestionsContainer}
        >
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={suggestion.symbol.id}
              style={styles.suggestionItem}
              onPress={() => handleSuggestionPress(suggestion)}
            >
              <View style={styles.suggestionContent}>
                <Text style={styles.suggestionSymbol}>
                  {suggestion.symbol.image}
                </Text>
                <Text style={styles.suggestionName} numberOfLines={1}>
                  {suggestion.symbol.name}
                </Text>

                {showDetails && (
                  <View style={styles.suggestionDetails}>
                    <View
                      style={[
                        styles.confidenceBadge,
                        {
                          backgroundColor: getConfidenceColor(
                            suggestion.confidence
                          ),
                        },
                      ]}
                    >
                      <Text style={styles.confidenceText}>
                        {getConfidenceText(suggestion.confidence)}
                      </Text>
                    </View>
                    <Text style={styles.suggestionReason} numberOfLines={1}>
                      {suggestion.reason}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: themeColors.surface,
    borderTopWidth: 1,
    borderTopColor: themeColors.border,
    paddingVertical: SPACING.SM,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    marginBottom: SPACING.SM,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.XS,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text,
  },
  toggleButton: {
    padding: SPACING.XS,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.MD,
    gap: SPACING.SM,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  suggestionsContainer: {
    paddingHorizontal: SPACING.MD,
  },
});
