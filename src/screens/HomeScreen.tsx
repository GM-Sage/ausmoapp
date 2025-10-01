// Home Screen - Main dashboard for Ausmo AAC App

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../store';
import { Symbol } from '../types';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants';
import SymbolDataService from '../services/symbolDataService';
import AudioService from '../services/audioService';
import { ScreenSafeArea } from '../components/common/SafeAreaWrapper';
import { useSafeArea } from '../hooks/useSafeArea';
import { useVisualSettings } from '../contexts/VisualSettingsContext';
import { getThemeColors } from '../utils/themeUtils';

interface HomeScreenProps {
  navigation?: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const [popularSymbols, setPopularSymbols] = useState<Symbol[]>([]);
  const [recentSymbols, setRecentSymbols] = useState<Symbol[]>([]);
  const [playingSymbolId, setPlayingSymbolId] = useState<string | null>(null);
  const safeArea = useSafeArea();

  useEffect(() => {
    loadSymbols();
  }, []);

  const loadSymbols = () => {
    try {
      // Get popular symbols for quick access
      const popular = SymbolDataService.getPopularSymbols();
      setPopularSymbols(popular.slice(0, 12)); // Show first 12 popular symbols

      // For now, use some popular symbols as "recent"
      setRecentSymbols(popular.slice(12, 20));
    } catch (error) {
      console.error('Error loading symbols:', error);
    }
  };

  const handleSymbolPress = async (symbol: Symbol) => {
    try {
      setPlayingSymbolId(symbol.id);
      console.log('Playing audio for symbol:', symbol.name);
      await AudioService.speak(symbol.name, {
        ttsVoice: undefined,
        ttsSpeed: 1.0,
        ttsPitch: 1.0,
        volume: 0.8,
        autoRepeat: false,
        repeatDelay: 2000,
      });
    } catch (error) {
      console.error('Error playing symbol audio:', error);
    } finally {
      setPlayingSymbolId(null);
    }
  };

  const renderSymbolItem = ({ item }: { item: Symbol }) => {
    const isPlaying = playingSymbolId === item.id;
    return (
      <TouchableOpacity
        style={[
          styles.symbolItem,
          {
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border,
          },
          isPlaying && styles.symbolItemPlaying,
        ]}
        onPress={() => handleSymbolPress(item)}
        disabled={isPlaying}
        accessible={true}
        accessibilityLabel={`Say ${item.name}`}
        accessibilityRole="button"
      >
        <View style={styles.symbolImageContainer}>
          <Text style={styles.symbolEmoji}>{item.image}</Text>
          {isPlaying && (
            <View style={styles.playingOverlay}>
              <Ionicons
                name="volume-high"
                size={20}
                color={themeColors.primary}
              />
            </View>
          )}
        </View>
        <Text
          style={[styles.symbolName, { color: themeColors.text }]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const handleQuickAction = (action: string) => {
    try {
      // Navigate based on action
      switch (action) {
        case 'Talk':
          navigation.navigate('Communication');
          break;
        case 'Books':
          navigation.navigate('Library');
          break;
        case 'Settings':
          navigation.navigate('Settings');
          break;
        case 'Learn':
          navigation.navigate('Education');
          break;
        case 'Music':
          // For now, show an alert - can be expanded later
          Alert.alert('Music', 'Music feature coming soon!');
          break;
        default:
          console.log('Unknown quick action:', action);
      }
    } catch (error) {
      console.error('Error handling quick action:', error);
    }
  };

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <TouchableOpacity
        style={[
          styles.quickActionButton,
          { backgroundColor: themeColors.primary },
        ]}
        onPress={() => handleQuickAction('Talk')}
        accessible={true}
        accessibilityLabel="Open communication"
        accessibilityRole="button"
      >
        <Ionicons name="chatbubbles" size={32} color={themeColors.text} />
        <Text style={[styles.quickActionText, { color: themeColors.text }]}>
          Talk
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.quickActionButton,
          { backgroundColor: themeColors.secondary },
        ]}
        onPress={() => handleQuickAction('Books')}
        accessible={true}
        accessibilityLabel="Open library"
        accessibilityRole="button"
      >
        <Ionicons name="library" size={32} color={themeColors.text} />
        <Text style={[styles.quickActionText, { color: themeColors.text }]}>
          Books
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.quickActionButton,
          { backgroundColor: themeColors.success },
        ]}
        onPress={() => handleQuickAction('Learn')}
        accessible={true}
        accessibilityLabel="Open education"
        accessibilityRole="button"
      >
        <Ionicons name="school" size={32} color={themeColors.text} />
        <Text style={[styles.quickActionText, { color: themeColors.text }]}>
          Learn
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.quickActionButton,
          { backgroundColor: themeColors.warning },
        ]}
        onPress={() => handleQuickAction('Settings')}
        accessible={true}
        accessibilityLabel="Open settings"
        accessibilityRole="button"
      >
        <Ionicons name="settings" size={32} color={themeColors.text} />
        <Text style={[styles.quickActionText, { color: themeColors.text }]}>
          Settings
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenSafeArea
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Welcome Header */}
        <View style={[styles.header, { backgroundColor: themeColors.primary }]}>
          <View style={styles.welcomeSection}>
            <Text style={[styles.welcomeText, { color: themeColors.text }]}>
              Welcome{currentUser ? `, ${currentUser.name}` : ''}!
            </Text>
            <Text
              style={[
                styles.subtitleText,
                { color: themeColors.textSecondary },
              ]}
            >
              Tap any symbol to hear it spoken
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        {renderQuickActions()}

        {/* Popular Symbols */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              Popular Symbols
            </Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Library', { screen: 'SymbolLibrary' })
              }
              style={styles.viewAllButton}
            >
              <Text
                style={[styles.viewAllText, { color: themeColors.primary }]}
              >
                View All
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={themeColors.primary}
              />
            </TouchableOpacity>
          </View>

          <FlatList
            data={popularSymbols}
            renderItem={renderSymbolItem}
            keyExtractor={item => item.id}
            numColumns={4}
            scrollEnabled={false}
            contentContainerStyle={styles.symbolsGrid}
          />
        </View>

        {/* Recent Symbols */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              More Symbols
            </Text>
          </View>

          <FlatList
            data={recentSymbols}
            renderItem={renderSymbolItem}
            keyExtractor={item => item.id}
            numColumns={4}
            scrollEnabled={false}
            contentContainerStyle={styles.symbolsGrid}
          />
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <View style={styles.tipCard}>
            <Ionicons name="bulb" size={24} color={themeColors.primary} />
            <Text style={styles.tipText}>
              Tip: Use the Books tab to create custom communication pages
            </Text>
          </View>

          <View style={styles.tipCard}>
            <Ionicons
              name="volume-high"
              size={24}
              color={themeColors.primary}
            />
            <Text style={styles.tipText}>
              Tip: Adjust voice settings in Settings → Audio Settings
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenSafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.XL,
    paddingTop: 60, // Account for status bar
  },
  welcomeSection: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.TITLE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    marginBottom: SPACING.SM,
  },
  subtitleText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    opacity: 0.9,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.XL,
    marginHorizontal: SPACING.MD,
    marginTop: -SPACING.LG,
    borderRadius: BORDER_RADIUS.LARGE,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionButton: {
    alignItems: 'center',
    padding: SPACING.MD,
  },
  quickActionText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    marginTop: SPACING.XS,
  },
  section: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.LG,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.XS,
  },
  viewAllText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  symbolsGrid: {
    gap: SPACING.SM,
  },
  symbolItem: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.SM,
    margin: SPACING.XS,
    borderRadius: BORDER_RADIUS.MEDIUM,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  symbolItemPlaying: {
    borderWidth: 2,
    opacity: 0.8,
  },
  symbolImageContainer: {
    position: 'relative',
    marginBottom: SPACING.XS,
  },
  symbolEmoji: {
    fontSize: 32,
  },
  playingOverlay: {
    position: 'absolute',
    top: -5,
    right: -5,
    borderRadius: 10,
    padding: 2,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  symbolName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    textAlign: 'center',
  },
  tipsSection: {
    paddingHorizontal: SPACING.LG,
    paddingBottom: SPACING.XL,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.MD,
    marginBottom: SPACING.SM,
    borderRadius: BORDER_RADIUS.MEDIUM,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tipText: {
    flex: 1,
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    marginLeft: SPACING.SM,
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.NORMAL * TYPOGRAPHY.FONT_SIZES.MEDIUM,
  },
});
