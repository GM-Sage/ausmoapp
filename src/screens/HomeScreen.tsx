// Home Screen - Main dashboard for Ausmo AAC App

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  Image
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../store';
import { Symbol } from '../types';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants';
import SymbolDataService from '../services/symbolDataService';
import AudioService from '../services/audioService';
import { ScreenSafeArea } from '../components/common/SafeAreaWrapper';
import { useSafeArea } from '../hooks/useSafeArea';

interface HomeScreenProps {
  navigation?: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
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
          isPlaying && styles.symbolItemPlaying
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
              <Ionicons name="volume-high" size={20} color={COLORS.PRIMARY} />
            </View>
          )}
        </View>
        <Text style={styles.symbolName} numberOfLines={1}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <TouchableOpacity 
        style={styles.quickActionButton}
        onPress={() => navigation.navigate('Communication')}
        accessible={true}
        accessibilityLabel="Open communication"
        accessibilityRole="button"
      >
        <Ionicons name="chatbubbles" size={32} color={COLORS.SURFACE} />
        <Text style={styles.quickActionText}>Talk</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.quickActionButton}
        onPress={() => navigation.navigate('Library')}
        accessible={true}
        accessibilityLabel="Open library"
        accessibilityRole="button"
      >
        <Ionicons name="library" size={32} color={COLORS.SURFACE} />
        <Text style={styles.quickActionText}>Books</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.quickActionButton}
        onPress={() => navigation.navigate('Settings')}
        accessible={true}
        accessibilityLabel="Open settings"
        accessibilityRole="button"
      >
        <Ionicons name="settings" size={32} color={COLORS.SURFACE} />
        <Text style={styles.quickActionText}>Settings</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenSafeArea style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
      {/* Welcome Header */}
      <View style={styles.header}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Welcome{currentUser ? `, ${currentUser.name}` : ''}!
          </Text>
          <Text style={styles.subtitleText}>
            Tap any symbol to hear it spoken
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      {renderQuickActions()}

      {/* Popular Symbols */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Symbols</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Library', { screen: 'SymbolLibrary' })}
            style={styles.viewAllButton}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.PRIMARY} />
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={popularSymbols}
          renderItem={renderSymbolItem}
          keyExtractor={(item) => item.id}
          numColumns={4}
          scrollEnabled={false}
          contentContainerStyle={styles.symbolsGrid}
        />
      </View>

      {/* Recent Symbols */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>More Symbols</Text>
        </View>
        
        <FlatList
          data={recentSymbols}
          renderItem={renderSymbolItem}
          keyExtractor={(item) => item.id}
          numColumns={4}
          scrollEnabled={false}
          contentContainerStyle={styles.symbolsGrid}
        />
      </View>

      {/* Tips Section */}
      <View style={styles.tipsSection}>
        <View style={styles.tipCard}>
          <Ionicons name="bulb" size={24} color={COLORS.PRIMARY} />
          <Text style={styles.tipText}>
            Tip: Use the Books tab to create custom communication pages
          </Text>
        </View>
        
        <View style={styles.tipCard}>
          <Ionicons name="volume-high" size={24} color={COLORS.PRIMARY} />
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
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    backgroundColor: COLORS.PRIMARY,
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
    color: COLORS.SURFACE,
    marginBottom: SPACING.SM,
  },
  subtitleText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.SURFACE,
    opacity: 0.9,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.XL,
    backgroundColor: COLORS.SURFACE,
    marginHorizontal: SPACING.MD,
    marginTop: -SPACING.LG,
    borderRadius: BORDER_RADIUS.LARGE,
    shadowColor: COLORS.TEXT_PRIMARY,
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
    color: COLORS.TEXT_PRIMARY,
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
    color: COLORS.TEXT_PRIMARY,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.XS,
  },
  viewAllText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.PRIMARY,
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
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.MEDIUM,
    shadowColor: COLORS.TEXT_PRIMARY,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  symbolItemPlaying: {
    backgroundColor: '#E3F2FD',
    borderColor: COLORS.PRIMARY,
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
    backgroundColor: COLORS.SURFACE,
    borderRadius: 10,
    padding: 2,
    shadowColor: COLORS.TEXT_PRIMARY,
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
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  tipsSection: {
    paddingHorizontal: SPACING.LG,
    paddingBottom: SPACING.XL,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE,
    padding: SPACING.MD,
    marginBottom: SPACING.SM,
    borderRadius: BORDER_RADIUS.MEDIUM,
    shadowColor: COLORS.TEXT_PRIMARY,
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
    color: COLORS.TEXT_PRIMARY,
    marginLeft: SPACING.SM,
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.NORMAL * TYPOGRAPHY.FONT_SIZES.MEDIUM,
  },
});
