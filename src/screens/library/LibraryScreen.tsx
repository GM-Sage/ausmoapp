// Library Screen

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
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import { CommunicationBook } from '../../types';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import DatabaseService from '../../services/databaseService';
import { navigateToPage } from '../../store/slices/navigationSlice';

interface LibraryScreenProps {
  navigation?: any;
}

export default function LibraryScreen({ navigation }: LibraryScreenProps) {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [books, setBooks] = useState<CommunicationBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBooks();
  }, [currentUser]);

  // Refresh books when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation?.addListener('focus', () => {
      loadBooks();
    });

    return unsubscribe;
  }, [navigation]);

  const loadBooks = async () => {
    if (!currentUser) {
      console.log('No current user, skipping book load');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Loading books for user:', currentUser.id);
      const userBooks = await DatabaseService.getBooksByUser(currentUser.id);
      console.log('Loaded books:', userBooks.length, userBooks);
      setBooks(userBooks);
    } catch (error) {
      console.error('Error loading books:', error);
      Alert.alert('Error', 'Failed to load communication books');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartCommunication = (book: CommunicationBook) => {
    if (!book.pages || book.pages.length === 0) {
      Alert.alert('No Pages', 'This book has no pages. Add some pages first.');
      return;
    }

    // Navigate to the first page of the book
    const firstPage = book.pages[0];
    dispatch(
      navigateToPage({
        bookId: book.id,
        pageId: firstPage.id,
        pageName: firstPage.name,
      })
    );

    // Navigate to communication screen
    navigation.navigate('Communication');
  };

  const renderBookItem = ({ item }: { item: CommunicationBook }) => (
    <View style={styles.bookItem}>
      <TouchableOpacity
        style={styles.bookContent}
        onPress={() => {
          navigation.navigate('BookEditor', { bookId: item.id });
        }}
        accessible={true}
        accessibilityLabel={`Open book ${item.name}`}
        accessibilityRole="button"
      >
        <View style={styles.bookIcon}>
          <Ionicons name="book" size={32} color={themeColors.primary} />
        </View>
        <View style={styles.bookInfo}>
          <Text style={styles.bookName}>{item.name}</Text>
          <Text style={styles.bookDescription}>
            {item.description || 'No description'}
          </Text>
          <Text style={styles.bookDetails}>
            {item.pages.length} pages • {item.category}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={24}
          color={themeColors.textSecondary}
        />
      </TouchableOpacity>

      {/* Start Communication Button */}
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => handleStartCommunication(item)}
        accessible={true}
        accessibilityLabel={`Start communication with ${item.name}`}
        accessibilityRole="button"
      >
        <Ionicons name="play" size={20} color={themeColors.surface} />
        <Text style={styles.startButtonText}>Start</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="library" size={64} color={themeColors.textSecondary} />
      <Text style={styles.emptyTitle}>No Books Yet</Text>
      <Text style={styles.emptyDescription}>
        Create your first communication book to get started
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading books...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Books</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              navigation.navigate('TemplateGallery');
            }}
            accessible={true}
            accessibilityLabel="Open template gallery"
            accessibilityRole="button"
          >
            <Ionicons name="library" size={20} color={themeColors.surface} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              navigation.navigate('SyncedButtonLibrary');
            }}
            accessible={true}
            accessibilityLabel="Open synced button library"
            accessibilityRole="button"
          >
            <Ionicons name="sync" size={20} color={themeColors.surface} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              navigation.navigate('SymbolLibrary');
            }}
            accessible={true}
            accessibilityLabel="Open symbol library"
            accessibilityRole="button"
          >
            <Ionicons name="images" size={20} color={themeColors.surface} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              navigation.navigate('BookEditor');
            }}
            accessible={true}
            accessibilityLabel="Create new book"
            accessibilityRole="button"
          >
            <Ionicons name="add" size={24} color={themeColors.surface} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Books List */}
      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    paddingTop: 50, // Account for status bar
  },
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZES.TITLE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.surface,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
  },
  headerButton: {
    backgroundColor: themeColors.secondary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: themeColors.secondary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: SPACING.LG,
    paddingTop: SPACING.MD,
  },
  bookItem: {
    backgroundColor: themeColors.surface,
    marginBottom: SPACING.SM,
    borderRadius: BORDER_RADIUS.MEDIUM,
    shadowColor: themeColors.text_PRIMARY,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  bookContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.MD,
  },
  bookIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: themeColors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.MD,
  },
  bookInfo: {
    flex: 1,
  },
  bookName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.text_PRIMARY,
    marginBottom: 2,
  },
  bookDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.textSecondary,
    marginBottom: 2,
  },
  bookDetails: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.XL,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.text_PRIMARY,
    marginTop: SPACING.MD,
    marginBottom: SPACING.SM,
  },
  emptyDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.textSecondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.NORMAL * TYPOGRAPHY.FONT_SIZES.MEDIUM,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    color: themeColors.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.XL,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColors.primary,
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
    gap: SPACING.XS,
  },
  startButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.surface,
  },
});
