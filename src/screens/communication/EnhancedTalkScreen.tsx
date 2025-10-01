// Enhanced Talk Screen with Categories, Favorites, and Sentence Building
// Comprehensive AAC communication interface

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
  FlatList,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { RootState } from '../../store';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import AudioService from '../../services/audioService';
import SymbolDataService, {
  SymbolWithSound,
} from '../../services/symbolDataService';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { getThemeColors } from '../../utils/themeUtils';

const { width, height } = Dimensions.get('window');

interface FavoriteSymbol {
  id: string;
  symbol: SymbolWithSound;
  addedAt: Date;
}

interface SentenceWord {
  id: string;
  symbol: SymbolWithSound;
  order: number;
}

interface EnhancedTalkScreenProps {
  navigation?: any;
}

export default function EnhancedTalkScreen({
  navigation,
}: EnhancedTalkScreenProps) {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [symbols, setSymbols] = useState<SymbolWithSound[]>([]);
  const [favorites, setFavorites] = useState<FavoriteSymbol[]>([]);
  const [sentence, setSentence] = useState<SentenceWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showSentenceBuilder, setShowSentenceBuilder] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);

  const categories = ['All', ...SymbolDataService.getCategories()];

  useEffect(() => {
    loadSymbols();
    loadFavorites();
  }, []);

  useEffect(() => {
    filterSymbols();
  }, [selectedCategory, searchQuery]);

  // Reload symbols and favorites when screen comes into focus (e.g., returning from AddCustomSymbol)
  useFocusEffect(
    React.useCallback(() => {
      // Only reload if we're coming back from another screen (not initial load)
      const hasLoadedBefore = symbols.length > 0;
      if (hasLoadedBefore) {
        loadSymbols();
        loadFavorites();
      }
    }, [symbols.length])
  );

  const loadSymbols = async () => {
    try {
      setIsLoading(true);
      const allSymbols = SymbolDataService.getAllSymbols();
      console.log('Loaded symbols:', allSymbols.length);
      setSymbols(allSymbols);
      // Apply current filters after loading
      filterSymbols();
    } catch (error) {
      console.error('Error loading symbols:', error);
      Alert.alert('Error', 'Failed to load symbols');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      if (!currentUser) {
        console.log('No current user, skipping favorites load');
        return;
      }

      console.log('Loading favorites for user:', currentUser.id);

      // Load favorites from database
      const DatabaseService = (await import('../../services/databaseService'))
        .default;
      const favoriteSymbolIds = await DatabaseService.getUserFavorites(
        currentUser.id
      );

      console.log('Found favorite symbol IDs:', favoriteSymbolIds);

      // Convert symbol IDs to FavoriteSymbol objects
      const savedFavorites = favoriteSymbolIds
        .map(symbolId => {
          const symbol = SymbolDataService.getSymbolById(symbolId);
          console.log(
            `Looking up symbol ${symbolId}:`,
            symbol ? symbol.name : 'NOT FOUND'
          );
          if (symbol) {
            return {
              id: symbolId,
              symbol,
              addedAt: new Date(), // We could store this in DB too if needed
            };
          }
          return null;
        })
        .filter((fav): fav is FavoriteSymbol => fav !== null);

      setFavorites(savedFavorites);
      console.log(
        'Loaded favorites:',
        savedFavorites.length,
        savedFavorites.map(f => f.symbol.name)
      );

      // Auto-show favorites if we have any
      if (savedFavorites.length > 0) {
        setShowFavorites(true);
      } else {
        // If no favorites found, show some default ones for demonstration
        console.log('No favorites found, showing default favorites');
        const defaultFavorites = [
          {
            id: 'hello',
            symbol: SymbolDataService.getSymbolById('hello')!,
            addedAt: new Date(),
          },
          {
            id: 'help',
            symbol: SymbolDataService.getSymbolById('help')!,
            addedAt: new Date(),
          },
          {
            id: 'yes',
            symbol: SymbolDataService.getSymbolById('yes')!,
            addedAt: new Date(),
          },
          {
            id: 'no',
            symbol: SymbolDataService.getSymbolById('no')!,
            addedAt: new Date(),
          },
        ].filter(fav => fav.symbol);

        setFavorites(defaultFavorites);
        if (defaultFavorites.length > 0) {
          setShowFavorites(true);
        }
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      // Fallback to default favorites if database fails
      const defaultFavorites = [
        {
          id: 'hello',
          symbol: SymbolDataService.getSymbolById('hello')!,
          addedAt: new Date(),
        },
        {
          id: 'help',
          symbol: SymbolDataService.getSymbolById('help')!,
          addedAt: new Date(),
        },
        {
          id: 'yes',
          symbol: SymbolDataService.getSymbolById('yes')!,
          addedAt: new Date(),
        },
        {
          id: 'no',
          symbol: SymbolDataService.getSymbolById('no')!,
          addedAt: new Date(),
        },
      ].filter(fav => fav.symbol);

      setFavorites(defaultFavorites);
      if (defaultFavorites.length > 0) {
        setShowFavorites(true);
      }
    }
  };

  const filterSymbols = () => {
    let filteredSymbols = SymbolDataService.getAllSymbols();
    console.log(
      'Filtering symbols. Total:',
      filteredSymbols.length,
      'Category:',
      selectedCategory,
      'Search:',
      searchQuery
    );

    if (selectedCategory !== 'All') {
      filteredSymbols = filteredSymbols.filter(
        symbol => symbol.category === selectedCategory
      );
      console.log('After category filter:', filteredSymbols.length);
    }

    if (searchQuery.trim()) {
      filteredSymbols = SymbolDataService.searchSymbols(searchQuery);
      if (selectedCategory !== 'All') {
        filteredSymbols = filteredSymbols.filter(
          symbol => symbol.category === selectedCategory
        );
      }
      console.log('After search filter:', filteredSymbols.length);
    }

    setSymbols(filteredSymbols);
  };

  const handleSymbolPress = async (symbol: SymbolWithSound) => {
    try {
      // Use ttsText if available, otherwise use symbol name
      const textToSpeak = symbol.ttsText || symbol.name;

      // Speak the symbol
      const voiceSettings = currentUser?.settings?.voiceSettings || {
        ttsVoice: undefined,
        ttsSpeed: 1.0,
        ttsPitch: 1.0,
        volume: 0.8,
        autoRepeat: false,
        repeatDelay: 2000,
      };

      await AudioService.speak(textToSpeak, voiceSettings);

      // Add to sentence builder if it's open
      if (showSentenceBuilder) {
        addToSentence(symbol);
      }
    } catch (error) {
      console.error('Error speaking symbol:', error);
      Alert.alert('Error', 'Failed to speak symbol');
    }
  };

  const addToSentence = (symbol: SymbolWithSound) => {
    const newWord: SentenceWord = {
      id: `${symbol.id}-${Date.now()}`,
      symbol,
      order: sentence.length,
    };

    setSentence(prev => [...prev, newWord]);
  };

  const removeFromSentence = (wordId: string) => {
    setSentence(prev => prev.filter(word => word.id !== wordId));
  };

  const clearSentence = () => {
    setSentence([]);
  };

  const speakSentence = async () => {
    if (sentence.length === 0) return;

    try {
      const sentenceText = sentence.map(word => word.symbol.name).join(' ');
      const voiceSettings = currentUser?.settings?.voiceSettings || {
        ttsVoice: undefined,
        ttsSpeed: 1.0,
        ttsPitch: 1.0,
        volume: 0.8,
        autoRepeat: false,
        repeatDelay: 2000,
      };

      await AudioService.speak(sentenceText, voiceSettings);
    } catch (error) {
      console.error('Error speaking sentence:', error);
      Alert.alert('Error', 'Failed to speak sentence');
    }
  };

  const toggleFavorite = async (symbol: SymbolWithSound) => {
    if (!currentUser) return;

    const isFavorite = favorites.some(fav => fav.symbol.id === symbol.id);

    try {
      const DatabaseService = (await import('../../services/databaseService'))
        .default;

      if (isFavorite) {
        // Remove from favorites
        await DatabaseService.removeFavorite(currentUser.id, symbol.id);
        setFavorites(prev => prev.filter(fav => fav.symbol.id !== symbol.id));
        console.log('Removed from favorites:', symbol.name);
      } else {
        // Add to favorites
        await DatabaseService.addFavorite(currentUser.id, symbol.id);
        const newFavorite: FavoriteSymbol = {
          id: `${symbol.id}-${Date.now()}`,
          symbol,
          addedAt: new Date(),
        };
        setFavorites(prev => [...prev, newFavorite]);
        console.log('Added to favorites:', symbol.name);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const deleteCustomSymbol = async (symbol: SymbolWithSound) => {
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
              SymbolDataService.getInstance().removeCustomSymbol(symbol.id);

              // Remove from database
              const DatabaseService = (
                await import('../../services/databaseService')
              ).default;
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

  const renderSymbolItem = ({ item }: { item: SymbolWithSound }) => {
    const isFavorite = favorites.some(fav => fav.symbol.id === item.id);
    console.log('Rendering symbol:', item.name, item.image);

    // Check if image is a file path (custom symbol) or emoji (built-in symbol)
    const isCustomImage =
      item.image.startsWith('file://') || item.image.startsWith('http');

    return (
      <TouchableOpacity
        style={styles.symbolItem}
        onPress={() => handleSymbolPress(item)}
        onLongPress={() => {
          if (!item.isBuiltIn) {
            // Show delete option for custom symbols
            Alert.alert(
              'Symbol Options',
              `What would you like to do with "${item.name}"?`,
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Add to Favorites',
                  onPress: () => toggleFavorite(item),
                },
                {
                  text: 'Delete Symbol',
                  style: 'destructive',
                  onPress: () => deleteCustomSymbol(item),
                },
              ]
            );
          } else {
            // Just toggle favorite for built-in symbols
            toggleFavorite(item);
          }
        }}
        accessible={true}
        accessibilityLabel={`${item.name} symbol`}
        accessibilityRole="button"
      >
        <View style={styles.symbolContent}>
          {isCustomImage ? (
            <Image
              source={{ uri: item.image }}
              style={styles.symbolImage}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.symbolEmoji}>{item.image}</Text>
          )}
          <Text style={styles.symbolText} numberOfLines={2}>
            {item.name}
          </Text>
        </View>
        {isFavorite && (
          <View style={styles.favoriteIndicator}>
            <Ionicons name="heart" size={16} color={themeColors.error} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderFavoriteItem = ({ item }: { item: FavoriteSymbol }) => {
    const isCustomImage =
      item.symbol.image.startsWith('file://') ||
      item.symbol.image.startsWith('http');

    return (
      <TouchableOpacity
        style={styles.favoriteItem}
        onPress={() => handleSymbolPress(item.symbol)}
        accessible={true}
        accessibilityLabel={`${item.symbol.name} favorite`}
        accessibilityRole="button"
      >
        {isCustomImage ? (
          <Image
            source={{ uri: item.symbol.image }}
            style={styles.favoriteImage}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.favoriteEmoji}>{item.symbol.image}</Text>
        )}
        <Text style={styles.favoriteText} numberOfLines={1}>
          {item.symbol.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSentenceWord = ({ item }: { item: SentenceWord }) => {
    // Check if image is a file path (custom symbol) or emoji (built-in symbol)
    const isCustomImage =
      item.symbol.image.startsWith('file://') ||
      item.symbol.image.startsWith('http');

    return (
      <TouchableOpacity
        style={styles.sentenceWord}
        onPress={() => removeFromSentence(item.id)}
        accessible={true}
        accessibilityLabel={`Remove ${item.symbol.name} from sentence`}
        accessibilityRole="button"
      >
        {isCustomImage ? (
          <Image
            source={{ uri: item.symbol.image }}
            style={styles.sentenceWordImage}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.sentenceWordEmoji}>{item.symbol.image}</Text>
        )}
        <Text style={styles.sentenceWordText}>{item.symbol.name}</Text>
        <Ionicons name="close-circle" size={16} color={themeColors.error} />
      </TouchableOpacity>
    );
  };

  const renderCategoryTab = (category: string) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryTab,
        selectedCategory === category && styles.categoryTabActive,
      ]}
      onPress={() => setSelectedCategory(category)}
      accessible={true}
      accessibilityLabel={`${category} category`}
      accessibilityRole="button"
    >
      <Text
        style={[
          styles.categoryTabText,
          selectedCategory === category && styles.categoryTabTextActive,
        ]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {category}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Talk</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[
              styles.headerButton,
              showFavorites && styles.headerButtonActive,
            ]}
            onPress={() => setShowFavorites(!showFavorites)}
            accessible={true}
            accessibilityLabel={
              showFavorites ? 'Hide favorites' : 'Show favorites'
            }
            accessibilityRole="button"
          >
            <Ionicons
              name="heart"
              size={24}
              color={showFavorites ? themeColors.error : themeColors.surface}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.headerButton,
              showSentenceBuilder && styles.headerButtonActive,
            ]}
            onPress={() => setShowSentenceBuilder(!showSentenceBuilder)}
            accessible={true}
            accessibilityLabel={
              showSentenceBuilder
                ? 'Hide sentence builder'
                : 'Show sentence builder'
            }
            accessibilityRole="button"
          >
            <Ionicons
              name="text"
              size={24}
              color={
                showSentenceBuilder ? themeColors.primary : themeColors.surface
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowSearchModal(true)}
            accessible={true}
            accessibilityLabel="Search symbols"
            accessibilityRole="button"
          >
            <Ionicons name="search" size={24} color={themeColors.surface} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() =>
              navigation?.navigate('Library', { screen: 'AddCustomSymbol' })
            }
            accessible={true}
            accessibilityLabel="Add custom symbol"
            accessibilityRole="button"
          >
            <Ionicons name="add" size={24} color={themeColors.surface} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sentence Builder */}
      {showSentenceBuilder && (
        <View style={styles.sentenceBuilder}>
          <View style={styles.sentenceBuilderHeader}>
            <Text style={styles.sentenceBuilderTitle}>Build Sentence</Text>
            <View style={styles.sentenceBuilderButtons}>
              <TouchableOpacity
                style={styles.sentenceButton}
                onPress={speakSentence}
                disabled={sentence.length === 0}
                accessible={true}
                accessibilityLabel="Speak sentence"
                accessibilityRole="button"
              >
                <Ionicons
                  name="volume-high"
                  size={20}
                  color={themeColors.surface}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sentenceButton}
                onPress={clearSentence}
                disabled={sentence.length === 0}
                accessible={true}
                accessibilityLabel="Clear sentence"
                accessibilityRole="button"
              >
                <Ionicons name="trash" size={20} color={themeColors.surface} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            horizontal
            style={styles.sentenceContainer}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sentenceWordsContainer}
          >
            {sentence.length === 0 ? (
              <Text style={styles.emptySentenceText}>
                Tap symbols below to build your sentence
              </Text>
            ) : (
              sentence.map(word => (
                <View key={word.id} style={styles.sentenceWordWrapper}>
                  {renderSentenceWord({ item: word })}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      )}

      {/* Favorites Bar */}
      {showFavorites && (
        <View style={styles.favoritesBar}>
          <Text style={styles.favoritesTitle}>Favorites</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.favoritesScrollView}
            contentContainerStyle={styles.favoritesContainer}
          >
            {favorites.map(favorite => (
              <View key={favorite.id} style={styles.favoriteItemWrapper}>
                {renderFavoriteItem({ item: favorite })}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Combined Category Tabs and Symbols Grid */}
      <View style={styles.combinedContainer}>
        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryTabsContainer}
          contentContainerStyle={styles.categoryTabsContent}
        >
          {categories.map(renderCategoryTab)}
        </ScrollView>

        {/* Symbols Grid */}
        <View style={styles.symbolsContainer}>
          <FlatList
            data={symbols}
            renderItem={renderSymbolItem}
            keyExtractor={item => item.id}
            numColumns={3}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.symbolsGrid}
            refreshing={isLoading}
            onRefresh={loadSymbols}
          />
        </View>
      </View>

      {/* Search Modal */}
      <Modal
        visible={showSearchModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.searchModal}>
          <View style={styles.searchModalHeader}>
            <Text style={styles.searchModalTitle}>Search Symbols</Text>
            <TouchableOpacity
              onPress={() => setShowSearchModal(false)}
              accessible={true}
              accessibilityLabel="Close search"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={24} color={themeColors.text} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Search for symbols..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
            accessible={true}
            accessibilityLabel="Search input"
          />

          <FlatList
            data={SymbolDataService.searchSymbols(searchQuery)}
            renderItem={renderSymbolItem}
            keyExtractor={item => item.id}
            numColumns={3}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.searchResultsGrid}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: themeColors.primary,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.TITLE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.surface,
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
  headerButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  sentenceBuilder: {
    backgroundColor: themeColors.surface,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  sentenceBuilderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  sentenceBuilderTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
  },
  sentenceBuilderButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  sentenceButton: {
    backgroundColor: themeColors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sentenceContainer: {
    maxHeight: 80,
  },
  sentenceWordsContainer: {
    paddingVertical: SPACING.SM,
  },
  sentenceWordWrapper: {
    marginRight: SPACING.SM,
  },
  sentenceWord: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.background,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    marginRight: SPACING.SM,
    borderRadius: BORDER_RADIUS.SM,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  sentenceWordEmoji: {
    fontSize: 20,
    marginRight: SPACING.XS,
  },
  sentenceWordImage: {
    width: 20,
    height: 20,
    marginRight: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
  },
  sentenceWordText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.text_PRIMARY,
    marginRight: SPACING.XS,
  },
  emptySentenceText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    textAlign: 'center',
    paddingVertical: SPACING.MD,
  },
  favoritesBar: {
    backgroundColor: themeColors.surface,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.SM,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  favoritesTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.textSecondary,
    marginBottom: SPACING.SM,
  },
  favoritesScrollView: {
    maxHeight: 60,
  },
  favoritesContainer: {
    paddingVertical: SPACING.XS,
  },
  favoriteItemWrapper: {
    marginRight: SPACING.MD,
  },
  favoriteItem: {
    alignItems: 'center',
    minWidth: 50,
  },
  favoriteEmoji: {
    fontSize: 24,
    marginBottom: SPACING.XS,
  },
  favoriteImage: {
    width: 24,
    height: 24,
    marginBottom: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
  },
  favoriteText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.text_PRIMARY,
    textAlign: 'center',
  },
  combinedContainer: {
    flex: 1,
  },
  categoryTabsContainer: {
    backgroundColor: themeColors.surface,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    paddingBottom: SPACING.SM,
  },
  categoryTabsContent: {
    paddingHorizontal: SPACING.LG,
    paddingTop: SPACING.XS,
    paddingBottom: 0,
  },
  categoryTab: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    marginRight: SPACING.SM,
    borderRadius: BORDER_RADIUS.SM,
    backgroundColor: themeColors.background,
    minWidth: 80,
    maxWidth: 120,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTabActive: {
    backgroundColor: themeColors.primary,
  },
  categoryTabText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.text_PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    textAlign: 'center',
  },
  categoryTabTextActive: {
    color: themeColors.surface,
  },
  symbolsContainer: {
    flex: 1,
    paddingTop: 70, // Increased space for category tabs with padding
  },
  symbolsGrid: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  symbolItem: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: themeColors.surface,
    margin: SPACING.XS,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: themeColors.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: themeColors.text_PRIMARY,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  symbolContent: {
    alignItems: 'center',
    padding: SPACING.SM,
  },
  symbolEmoji: {
    fontSize: 32,
    marginBottom: SPACING.XS,
  },
  symbolImage: {
    width: 40,
    height: 40,
    marginBottom: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
  },
  symbolText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.text_PRIMARY,
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  favoriteIndicator: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: themeColors.surface,
    borderRadius: 10,
    padding: 2,
  },
  searchModal: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  searchModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    backgroundColor: themeColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  searchModalTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
  },
  searchInput: {
    backgroundColor: themeColors.surface,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    marginHorizontal: SPACING.LG,
    marginVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: themeColors.border,
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.text_PRIMARY,
  },
  searchResultsGrid: {
    padding: SPACING.LG,
  },
});
