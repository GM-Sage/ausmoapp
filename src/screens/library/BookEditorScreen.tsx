// Book Editor Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
  FlatList,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import { CommunicationBook } from '../../types';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import DatabaseService from '../../services/databaseService';
import SymbolDataService from '../../services/symbolDataService';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { getThemeColors } from '../../utils/themeUtils';

interface BookEditorScreenProps {
  route?: {
    params?: {
      bookId?: string;
    };
  };
  navigation?: any;
}

export default function BookEditorScreen({
  route,
  navigation,
}: BookEditorScreenProps) {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const [book, setBook] = useState<CommunicationBook | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [isTemplate, setIsTemplate] = useState(false);
  const [isShared, setIsShared] = useState(false);

  const bookId = route?.params?.bookId;

  useEffect(() => {
    if (bookId) {
      loadBook();
    } else {
      setIsEditing(true);
    }
  }, [bookId]);

  const loadBook = async () => {
    if (!bookId) return;

    try {
      setIsLoading(true);
      const loadedBook = await DatabaseService.getBook(bookId);
      if (loadedBook) {
        setBook(loadedBook);
        setName(loadedBook.name);
        setDescription(loadedBook.description || '');
        setCategory(loadedBook.category);
        setIsTemplate(loadedBook.isTemplate);
        setIsShared(loadedBook.isShared);
      }
    } catch (error) {
      console.error('Error loading book:', error);
      Alert.alert('Error', 'Failed to load book');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a book name');
      return;
    }

    if (!currentUser) {
      Alert.alert('Error', 'No user selected');
      return;
    }

    try {
      setIsLoading(true);

      // Create default pages for new books
      let pages = book?.pages || [];
      if (!bookId) {
        pages = createDefaultPages();
      }

      const bookData: CommunicationBook = {
        id:
          book?.id ||
          `book-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: name.trim(),
        title: name.trim(),
        description: description.trim() || undefined,
        category,
        userId: currentUser.id,
        pages,
        createdAt: book?.createdAt || new Date(),
        updatedAt: new Date(),
        isTemplate,
        isShared,
      };

      if (bookId) {
        console.log('Updating book:', bookData);
        await DatabaseService.updateBook(bookData);
        Alert.alert('Success', 'Book updated successfully');
      } else {
        console.log('Creating new book:', bookData);
        await DatabaseService.createBook(bookData);
        console.log('Book created successfully with ID:', bookData.id);
        Alert.alert('Success', 'Book created successfully');
      }

      navigation?.goBack();
    } catch (error) {
      console.error('Error saving book:', error);
      Alert.alert('Error', 'Failed to save book');
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultPages = () => {
    const popularSymbols = SymbolDataService.getPopularSymbols();

    // Create main communication page
    const mainPage = {
      id: 'main-page',
      bookId: '',
      name: 'Main Communication',
      type: 'standard' as const,
      layout: {
        gridSize: 9 as const,
        buttonSize: 'medium' as const,
        spacing: 8,
        padding: 16,
        orientation: 'portrait' as const,
      },
      buttons: popularSymbols.slice(0, 9).map((symbol, index) => ({
        id: `btn-${symbol.id}`,
        pageId: 'main-page',
        text: symbol.name,
        image: symbol.image,
        ttsMessage: symbol.name,
        action: { type: 'speak' as const },
        position: {
          row: Math.floor(index / 3),
          column: index % 3,
          width: 1,
          height: 1,
        },
        size: 'medium' as const,
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
        borderColor: getCategoryColor(symbol.category),
        borderWidth: 3,
        borderRadius: 12,
        order: index,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      backgroundColor: '#FFFFFF',
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create category pages
    const categories = ['Food & Drink', 'Feelings', 'Actions', 'Places'];
    const categoryPages = categories.map((cat, catIndex) => {
      const categorySymbols = SymbolDataService.getSymbolsByCategory(cat).slice(
        0,
        9
      );
      return {
        id: `page-${cat.toLowerCase().replace(/\s+/g, '-')}`,
        bookId: '',
        name: cat,
        type: 'standard' as const,
        layout: {
          gridSize: 9 as const,
          buttonSize: 'medium' as const,
          spacing: 8,
          padding: 16,
          orientation: 'portrait' as const,
        },
        buttons: categorySymbols.map((symbol, index) => ({
          id: `btn-${symbol.id}-${catIndex}`,
          pageId: `page-${cat.toLowerCase().replace(/\s+/g, '-')}`,
          text: symbol.name,
          image: symbol.image,
          ttsMessage: symbol.name,
          action: { type: 'speak' as const },
          position: {
            row: Math.floor(index / 3),
            column: index % 3,
            width: 1,
            height: 1,
          },
          size: 'medium' as const,
          backgroundColor: '#FFFFFF',
          textColor: '#000000',
          borderColor: getCategoryColor(symbol.category),
          borderWidth: 3,
          borderRadius: 12,
          order: index,
          isVisible: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        backgroundColor: '#FFFFFF',
        order: catIndex + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    return [mainPage, ...categoryPages];
  };

  const getCategoryColor = (category: string): string => {
    const colorMap: { [key: string]: string } = {
      Greetings: '#FFD700', // Yellow for prompts/questions
      Communication: '#32CD32', // Green for positive actions
      Actions: '#FFD700', // Yellow for prompts
      'Food & Drink': '#FFD700', // Yellow for prompts
      Feelings: '#FF6B6B', // Red for negative/feelings
      Places: '#32CD32', // Green for positive
      People: '#32CD32', // Green for positive
      Objects: '#FFD700', // Yellow for prompts
      Body: '#FFD700', // Yellow for prompts
      Clothing: '#FFD700', // Yellow for prompts
      Animals: '#FFD700', // Yellow for prompts
      Colors: '#FFD700', // Yellow for prompts
      Time: '#FFD700', // Yellow for prompts
      Weather: '#FFD700', // Yellow for prompts
      Transportation: '#FFD700', // Yellow for prompts
      Shapes: '#FFD700', // Yellow for prompts
      School: '#FFD700', // Yellow for prompts
      Home: '#FFD700', // Yellow for prompts
    };
    return colorMap[category] || '#FFD700';
  };

  const handleDelete = async () => {
    if (!bookId) return;

    Alert.alert(
      'Delete Book',
      'Are you sure you want to delete this book? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await DatabaseService.deleteBook(bookId);
              Alert.alert('Success', 'Book deleted successfully');
              navigation?.goBack();
            } catch (error) {
              console.error('Error deleting book:', error);
              Alert.alert('Error', 'Failed to delete book');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const categories = [
    'General',
    'Daily Activities',
    'Food & Drink',
    'Feelings',
    'Places',
    'People',
    'Actions',
    'Custom',
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={themeColors.surface} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {bookId ? 'Edit Book' : 'Create New Book'}
        </Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Ionicons name="checkmark" size={24} color={themeColors.surface} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Book Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter book name"
              editable={isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter book description"
              multiline
              numberOfLines={3}
              editable={isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryContainer}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    category === cat && styles.categoryButtonActive,
                  ]}
                  onPress={() => isEditing && setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      category === cat && styles.categoryButtonTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.switchGroup}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Template Book</Text>
              <Switch
                value={isTemplate}
                onValueChange={setIsTemplate}
                disabled={!isEditing}
                trackColor={{
                  false: themeColors.border,
                  true: themeColors.primary,
                }}
                thumbColor={
                  isTemplate ? themeColors.surface : themeColors.textSecondary
                }
              />
            </View>
            <Text style={styles.switchDescription}>
              Template books can be used as starting points for new books
            </Text>
          </View>

          <View style={styles.switchGroup}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Shared Book</Text>
              <Switch
                value={isShared}
                onValueChange={setIsShared}
                disabled={!isEditing}
                trackColor={{
                  false: themeColors.border,
                  true: themeColors.primary,
                }}
                thumbColor={
                  isShared ? themeColors.surface : themeColors.textSecondary
                }
              />
            </View>
            <Text style={styles.switchDescription}>
              Shared books can be accessed by other users
            </Text>
          </View>

          {/* Pages Section */}
          <View style={styles.inputGroup}>
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>
                Pages ({book?.pages?.length || 0})
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() =>
                  navigation?.navigate('PageEditor', {
                    bookId: bookId || 'new',
                  })
                }
              >
                <Ionicons name="add" size={20} color={themeColors.surface} />
              </TouchableOpacity>
            </View>

            {book?.pages && book.pages.length > 0 ? (
              <FlatList
                data={book.pages}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.pageItem}
                    onPress={() =>
                      navigation?.navigate('PageEditor', {
                        pageId: item.id,
                        bookId: bookId || 'new',
                      })
                    }
                  >
                    <View style={styles.pageIcon}>
                      <Ionicons
                        name="document-text"
                        size={24}
                        color={themeColors.primary}
                      />
                    </View>
                    <View style={styles.pageInfo}>
                      <Text style={styles.pageName}>{item.name}</Text>
                      <Text style={styles.pageDetails}>
                        {item.buttons?.length || 0} symbols • {item.type}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={themeColors.textSecondary}
                    />
                  </TouchableOpacity>
                )}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyPages}>
                <Ionicons
                  name="document-outline"
                  size={48}
                  color={themeColors.textSecondary}
                />
                <Text style={styles.emptyPagesText}>No pages yet</Text>
                <Text style={styles.emptyPagesSubtext}>
                  Tap + to add your first page
                </Text>
              </View>
            )}
          </View>

          {bookId && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Ionicons name="trash" size={20} color={themeColors.error} />
              <Text style={styles.deleteButtonText}>Delete Book</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
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
  backButton: {
    padding: SPACING.SM,
  },
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZES.TITLE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.surface,
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    padding: SPACING.SM,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.LG,
  },
  form: {
    paddingTop: SPACING.MD,
  },
  inputGroup: {
    marginBottom: SPACING.LG,
  },
  label: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.SM,
  },
  input: {
    backgroundColor: themeColors.surface,
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: BORDER_RADIUS.MEDIUM,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.text_PRIMARY,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM,
  },
  categoryButton: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    backgroundColor: themeColors.surface,
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: BORDER_RADIUS.MEDIUM,
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
  switchGroup: {
    marginBottom: SPACING.LG,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.XS,
  },
  switchLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.text_PRIMARY,
  },
  switchDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    lineHeight: 18,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColors.surface,
    borderWidth: 1,
    borderColor: themeColors.error,
    borderRadius: BORDER_RADIUS.MEDIUM,
    paddingVertical: SPACING.MD,
    marginTop: SPACING.LG,
  },
  deleteButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.error,
    marginLeft: SPACING.SM,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  addButton: {
    backgroundColor: themeColors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MD,
    marginBottom: SPACING.SM,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  pageIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: themeColors.background_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.MD,
  },
  pageInfo: {
    flex: 1,
  },
  pageName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  pageDetails: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  emptyPages: {
    alignItems: 'center',
    paddingVertical: SPACING.XL,
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MEDIUM,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  emptyPagesText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.text_PRIMARY,
    marginTop: SPACING.SM,
  },
  emptyPagesSubtext: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginTop: SPACING.XS,
  },
});
