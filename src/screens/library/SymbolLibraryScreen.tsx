// Symbol Library Screen

import React, { useState, useEffect } from 'react';
import { getThemeColors } from '../../utils/themeUtils';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { RootState } from '../../store';
import { Symbol } from '../../types';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import DatabaseService from '../../services/databaseService';
import SymbolDataService from '../../services/symbolDataService';
import AudioService from '../../services/audioService';

interface SymbolLibraryScreenProps {
  route?: {
    params?: {
      onSymbolSelect?: (symbol: Symbol) => void;
    };
  };
  navigation?: any;
}

export default function SymbolLibraryScreen({
  route,
  navigation,
}: SymbolLibraryScreenProps) {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [symbols, setSymbols] = useState<Symbol[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [playingSymbolId, setPlayingSymbolId] = useState<string | null>(null);

  useEffect(() => {
    loadSymbols();
  }, []);

  // Reload symbols when screen comes into focus (e.g., returning from AddCustomSymbol)
  useFocusEffect(
    React.useCallback(() => {
      loadSymbols();
    }, [])
  );

  const loadSymbols = async () => {
    try {
      setIsLoading(true);
      // Load symbols from our comprehensive symbol data service
      const allSymbols = SymbolDataService.getAllSymbols();
      setSymbols(allSymbols);
    } catch (error) {
      console.error('Error loading symbols:', error);
      Alert.alert('Error', 'Failed to load symbols');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      try {
        const searchResults = SymbolDataService.searchSymbols(term);
        setSymbols(searchResults);
      } catch (error) {
        console.error('Error searching symbols:', error);
        // Fallback to local filtering
        const filtered = symbols.filter(
          symbol =>
            symbol.name.toLowerCase().includes(term.toLowerCase()) ||
            symbol.keywords.some(keyword =>
              keyword.toLowerCase().includes(term.toLowerCase())
            )
        );
        setSymbols(filtered);
      }
    } else {
      loadSymbols();
    }
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    if (category === 'All') {
      loadSymbols();
    } else {
      try {
        const filteredSymbols =
          SymbolDataService.getSymbolsByCategory(category);
        setSymbols(filteredSymbols);
      } catch (error) {
        console.error('Error filtering symbols:', error);
        // Fallback to local filtering
        const filtered = symbols.filter(symbol => symbol.category === category);
        setSymbols(filtered);
      }
    }
  };

  const handleSymbolPress = async (symbol: Symbol) => {
    const onSymbolSelect = route?.params?.onSymbolSelect;

    try {
      // Set playing state for visual feedback
      setPlayingSymbolId(symbol.id);

      // Always play audio when symbol is pressed (best practice for AAC apps)
      const textToSpeak = symbol.ttsText || symbol.name;
      console.log('Playing audio for symbol:', textToSpeak);
      await AudioService.speak(textToSpeak, {
        ttsVoice: undefined, // Use undefined for better compatibility
        ttsSpeed: 1.0,
        ttsPitch: 1.0,
        volume: 0.8,
        autoRepeat: false,
        repeatDelay: 2000,
      });
    } catch (error) {
      console.error('Error playing symbol audio:', error);
    } finally {
      // Clear playing state
      setPlayingSymbolId(null);
    }

    if (onSymbolSelect) {
      // If we're in selection mode, call the callback and go back
      onSymbolSelect(symbol);
      navigation?.goBack();
    } else {
      // Otherwise show symbol details
      Alert.alert(
        symbol.name,
        `Category: ${symbol.category}\nKeywords: ${symbol.keywords.join(', ')}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Use Symbol',
            onPress: () => console.log('Using symbol:', symbol.name),
          },
        ]
      );
    }
  };

  const handleAddSymbol = () => {
    navigation.navigate('AddCustomSymbol');
  };

  const handleDeleteSymbol = async (symbol: Symbol) => {
    if (symbol.isBuiltIn) {
      Alert.alert('Cannot Delete', 'Built-in symbols cannot be deleted');
      return;
    }

    Alert.alert(
      'Delete Symbol',
      `Are you sure you want to delete "${symbol.name}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Remove from SymbolDataService
              SymbolDataService.removeCustomSymbol(symbol.id);

              // Remove from database
              await DatabaseService.deleteSymbol(symbol.id);

              // Reload symbols
              await loadSymbols();

              Alert.alert('Success', 'Symbol deleted successfully');
            } catch (error) {
              console.error('Error deleting symbol:', error);
              Alert.alert('Error', 'Failed to delete symbol');
            }
          },
        },
      ]
    );
  };

  const categories = ['All', ...SymbolDataService.getCategories()];

  const renderSymbol = ({ item }: { item: Symbol }) => {
    const isPlaying = playingSymbolId === item.id;

    return (
      <TouchableOpacity
        style={[styles.symbolItem, isPlaying && styles.symbolItemPlaying]}
        onPress={() => handleSymbolPress(item)}
        disabled={isPlaying}
      >
        <View style={styles.symbolImageContainer}>
          <Image
            source={{ uri: item.image }}
            style={styles.symbolImage}
            resizeMode="contain"
          />
          {isPlaying && (
            <View style={styles.playingOverlay}>
              <Ionicons
                name="volume-high"
                size={24}
                color={themeColors.primary}
              />
            </View>
          )}
        </View>
        <View style={styles.symbolInfo}>
          <Text style={styles.symbolName}>{item.name}</Text>
          <Text style={styles.symbolCategory}>{item.category}</Text>
          <Text style={styles.symbolKeywords}>
            {item.keywords.slice(0, 2).join(', ')}
            {item.keywords.length > 2 && '...'}
          </Text>
        </View>
        <View style={styles.symbolActions}>
          {!item.isBuiltIn && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteSymbol(item)}
            >
              <Ionicons name="trash" size={20} color={themeColors.error} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategoryFilter = () => (
    <View style={styles.categoryFilter}>
      <FlatList
        data={categories}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === item && styles.categoryButtonActive,
            ]}
            onPress={() => handleCategoryFilter(item)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === item && styles.categoryButtonTextActive,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      />
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading symbols...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {route?.params?.onSymbolSelect ? 'Select Symbol' : 'Symbol Library'}
        </Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddSymbol}>
          <Ionicons name="add" size={24} color={themeColors.surface} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search"
            size={20}
            color={themeColors.textSecondary}
          />
          <TextInput
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={handleSearch}
            placeholder="Search symbols..."
            placeholderTextColor={themeColors.textSecondary}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons
                name="close-circle"
                size={20}
                color={themeColors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {renderCategoryFilter()}

      <FlatList
        data={symbols}
        renderItem={renderSymbol}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.symbolsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="images-outline"
              size={64}
              color={themeColors.textSecondary}
            />
            <Text style={styles.emptyTitle}>No symbols found</Text>
            <Text style={styles.emptySubtitle}>
              {searchTerm
                ? 'Try a different search term'
                : 'No symbols available'}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: themeColors.background,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.text_PRIMARY,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: themeColors.primary,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    paddingTop: 50,
  },
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZES.TITLE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.surface,
    flex: 1,
  },
  addButton: {
    padding: SPACING.SM,
  },
  searchContainer: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.surface,
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: BORDER_RADIUS.MEDIUM,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.text_PRIMARY,
    marginLeft: SPACING.SM,
  },
  categoryFilter: {
    paddingHorizontal: SPACING.LG,
    marginBottom: SPACING.MD,
  },
  categoryList: {
    paddingRight: SPACING.LG,
  },
  categoryButton: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    backgroundColor: themeColors.surface,
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: BORDER_RADIUS.MEDIUM,
    marginRight: SPACING.SM,
  },
  categoryButtonActive: {
    backgroundColor: themeColors.primary,
    borderColor: themeColors.primary,
  },
  categoryButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.text_PRIMARY,
  },
  categoryButtonTextActive: {
    color: themeColors.surface,
  },
  symbolsList: {
    paddingHorizontal: SPACING.LG,
    paddingBottom: SPACING.LG,
  },
  symbolItem: {
    flex: 1,
    backgroundColor: themeColors.surface,
    marginHorizontal: SPACING.XS,
    marginBottom: SPACING.MD,
    borderRadius: BORDER_RADIUS.MEDIUM,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: SPACING.MD,
    alignItems: 'center',
  },
  symbolItemPlaying: {
    backgroundColor: '#E3F2FD', // Light blue background
    borderColor: themeColors.primary,
    borderWidth: 2,
    opacity: 0.8,
  },
  symbolImageContainer: {
    width: 60,
    height: 60,
    marginBottom: SPACING.SM,
    position: 'relative',
  },
  playingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: BORDER_RADIUS.SMALL,
    justifyContent: 'center',
    alignItems: 'center',
  },
  symbolImage: {
    width: '100%',
    height: '100%',
  },
  symbolInfo: {
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  symbolName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.text_PRIMARY,
    textAlign: 'center',
  },
  symbolCategory: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    textAlign: 'center',
  },
  symbolKeywords: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  symbolActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: SPACING.SM,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.XL * 2,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.text_PRIMARY,
    marginTop: SPACING.MD,
    marginBottom: SPACING.SM,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.textSecondary,
    textAlign: 'center',
  },
});
