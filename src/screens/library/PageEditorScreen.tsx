// Page Editor Screen

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
  Modal
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import { CommunicationPage, CommunicationButton, ButtonAction, ButtonPosition } from '../../types';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import DatabaseService from '../../services/databaseService';
import SymbolDataService from '../../services/symbolDataService';
import ExpressPageWizard from '../../components/communication/ExpressPageWizard';

interface PageEditorScreenProps {
  route?: {
    params?: {
      pageId?: string;
      bookId?: string;
      pageType?: 'standard' | 'express' | 'visual-scene' | 'keyboard';
      quickCreate?: boolean;
    };
  };
  navigation?: any;
}

export default function PageEditorScreen({ route, navigation }: PageEditorScreenProps) {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [page, setPage] = useState<CommunicationPage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showExpressWizard, setShowExpressWizard] = useState(false);
  const [showBookSelection, setShowBookSelection] = useState(false);
  const [availableBooks, setAvailableBooks] = useState<any[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string | undefined>(bookId);
  
  // Form fields
  const [name, setName] = useState('');
  const [pageType, setPageType] = useState<'standard' | 'express' | 'visual-scene' | 'keyboard'>('standard');
  const [gridSize, setGridSize] = useState<1 | 2 | 4 | 9 | 16 | 25 | 36>(9);
  const [buttonSize, setButtonSize] = useState<'small' | 'medium' | 'large' | 'extra-large'>('medium');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [buttons, setButtons] = useState<CommunicationButton[]>([]);

  const pageId = route?.params?.pageId;
  const bookId = route?.params?.bookId;
  const routePageType = route?.params?.pageType;
  const quickCreate = route?.params?.quickCreate;

  useEffect(() => {
    if (pageId) {
      loadPage();
    } else {
      setIsEditing(true);
      // Set page type if provided
      if (routePageType) {
        setPageType(routePageType);
        // Set default name for Express pages
        if (routePageType === 'express') {
          setName('Express Sentence Builder');
          // Show wizard for Express pages if it's a quick create
          if (quickCreate) {
            setShowExpressWizard(true);
            return;
          }
        }
      }
      // Create a default page with sample buttons
      createDefaultPage();
    }
    
    // Load available books for selection
    loadAvailableBooks();
  }, [pageId, routePageType]);

  const loadAvailableBooks = async () => {
    if (!currentUser) return;
    
    try {
      const books = await DatabaseService.getBooksByUser(currentUser.id);
      setAvailableBooks(books);
    } catch (error) {
      console.error('Error loading books:', error);
    }
  };

  const createDefaultPage = () => {
    let defaultButtons: CommunicationButton[];
    
    if (pageType === 'express') {
      // Create Express-specific buttons for sentence building
      defaultButtons = [
        {
          id: 'btn-i',
          pageId: '',
          text: 'I',
          image: '👤',
          ttsMessage: 'I',
          action: { type: 'speak' },
          position: { row: 0, column: 0, width: 1, height: 1 },
          size: 'medium',
          backgroundColor: '#E3F2FD',
          textColor: '#1976D2',
          borderColor: '#2196F3',
          borderWidth: 2,
          borderRadius: 8,
          order: 1,
          isVisible: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'btn-want',
          pageId: '',
          text: 'want',
          image: '💭',
          ttsMessage: 'want',
          action: { type: 'speak' },
          position: { row: 0, column: 1, width: 1, height: 1 },
          size: 'medium',
          backgroundColor: '#E8F5E8',
          textColor: '#2E7D32',
          borderColor: '#4CAF50',
          borderWidth: 2,
          borderRadius: 8,
          order: 2,
          isVisible: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'btn-more',
          pageId: '',
          text: 'more',
          image: '➕',
          ttsMessage: 'more',
          action: { type: 'speak' },
          position: { row: 0, column: 2, width: 1, height: 1 },
          size: 'medium',
          backgroundColor: '#FFF3E0',
          textColor: '#F57C00',
          borderColor: '#FF9800',
          borderWidth: 2,
          borderRadius: 8,
          order: 3,
          isVisible: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'btn-please',
          pageId: '',
          text: 'please',
          image: '🙏',
          ttsMessage: 'please',
          action: { type: 'speak' },
          position: { row: 1, column: 0, width: 1, height: 1 },
          size: 'medium',
          backgroundColor: '#F3E5F5',
          textColor: '#7B1FA2',
          borderColor: '#9C27B0',
          borderWidth: 2,
          borderRadius: 8,
          order: 4,
          isVisible: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'btn-thank-you',
          pageId: '',
          text: 'thank you',
          image: '🙏',
          ttsMessage: 'thank you',
          action: { type: 'speak' },
          position: { row: 1, column: 1, width: 1, height: 1 },
          size: 'medium',
          backgroundColor: '#E0F2F1',
          textColor: '#00695C',
          borderColor: '#009688',
          borderWidth: 2,
          borderRadius: 8,
          order: 5,
          isVisible: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'btn-help',
          pageId: '',
          text: 'help',
          image: '🆘',
          ttsMessage: 'help',
          action: { type: 'speak' },
          position: { row: 1, column: 2, width: 1, height: 1 },
          size: 'medium',
          backgroundColor: '#FFEBEE',
          textColor: '#C62828',
          borderColor: '#F44336',
          borderWidth: 2,
          borderRadius: 8,
          order: 6,
          isVisible: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'btn-clear',
          pageId: '',
          text: 'Clear',
          image: '🗑️',
          ttsMessage: '',
          action: { type: 'clear' },
          position: { row: 2, column: 0, width: 1, height: 1 },
          size: 'medium',
          backgroundColor: '#F5F5F5',
          textColor: '#616161',
          borderColor: '#9E9E9E',
          borderWidth: 2,
          borderRadius: 8,
          order: 7,
          isVisible: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'btn-back',
          pageId: '',
          text: 'Back',
          image: '⬅️',
          ttsMessage: '',
          action: { type: 'back' },
          position: { row: 2, column: 1, width: 1, height: 1 },
          size: 'medium',
          backgroundColor: '#F5F5F5',
          textColor: '#616161',
          borderColor: '#9E9E9E',
          borderWidth: 2,
          borderRadius: 8,
          order: 8,
          isVisible: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'btn-done',
          pageId: '',
          text: 'done',
          image: '✅',
          ttsMessage: 'done',
          action: { type: 'speak' },
          position: { row: 2, column: 2, width: 1, height: 1 },
          size: 'medium',
          backgroundColor: '#E8F5E8',
          textColor: '#2E7D32',
          borderColor: '#4CAF50',
          borderWidth: 2,
          borderRadius: 8,
          order: 9,
          isVisible: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];
    } else {
      // Create standard buttons
      const popularSymbols = SymbolDataService.getPopularSymbols();
      defaultButtons = popularSymbols.slice(0, 9).map((symbol, index) => ({
        id: `btn-${symbol.id}`,
        pageId: '',
        text: symbol.name,
        image: symbol.image,
        ttsMessage: symbol.name,
        action: { type: 'speak' },
        position: { 
          row: Math.floor(index / 3), 
          column: index % 3, 
          width: 1, 
          height: 1 
        },
        size: 'medium',
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
        borderColor: getCategoryColor(symbol.category),
        borderWidth: 3,
        borderRadius: 12,
        order: index + 1,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
    }
    
    setButtons(defaultButtons);
  };

  const getCategoryColor = (category: string): string => {
    const colorMap: { [key: string]: string } = {
      'Greetings': '#FFD700',        // Yellow for prompts/questions
      'Communication': '#32CD32',    // Green for positive actions
      'Actions': '#FFD700',          // Yellow for prompts
      'Food & Drink': '#FFD700',     // Yellow for prompts
      'Feelings': '#FF6B6B',         // Red for negative/feelings
      'Places': '#32CD32',           // Green for positive
      'People': '#32CD32',           // Green for positive
      'Objects': '#FFD700',          // Yellow for prompts
      'Body': '#FFD700',             // Yellow for prompts
      'Clothing': '#FFD700',         // Yellow for prompts
      'Animals': '#FFD700',          // Yellow for prompts
      'Colors': '#FFD700',           // Yellow for prompts
      'Time': '#FFD700',             // Yellow for prompts
      'Weather': '#FFD700',          // Yellow for prompts
      'Transportation': '#FFD700',   // Yellow for prompts
      'Shapes': '#FFD700',           // Yellow for prompts
      'School': '#FFD700',           // Yellow for prompts
      'Home': '#FFD700',             // Yellow for prompts
    };
    return colorMap[category] || '#FFD700';
  };

  const loadPage = async () => {
    if (!pageId) return;
    
    try {
      setIsLoading(true);
      // For now, we'll create a sample page since we don't have a getPage method yet
      const samplePage: CommunicationPage = {
        id: pageId,
        bookId: bookId || '',
        name: 'Sample Page',
        type: 'standard',
        layout: {
          gridSize: 9,
          buttonSize: 'medium',
          spacing: 10,
          padding: 20,
          orientation: 'portrait',
        },
        buttons: [],
        backgroundColor: '#FFFFFF',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setPage(samplePage);
      setName(samplePage.name);
      setPageType(samplePage.type);
      setGridSize(samplePage.layout.gridSize as 1 | 2 | 4 | 9 | 16 | 25 | 36);
      setButtonSize(samplePage.layout.buttonSize);
      setBackgroundColor(samplePage.backgroundColor);
    } catch (error) {
      console.error('Error loading page:', error);
      Alert.alert('Error', 'Failed to load page');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a page name');
      return;
    }

    if (!selectedBookId) {
      // Show book selection if no book is selected
      setShowBookSelection(true);
      return;
    }

    try {
      setIsLoading(true);
      
      const pageData: CommunicationPage = {
        id: page?.id || '',
        bookId: selectedBookId,
        name: name.trim(),
        type: pageType,
        layout: {
          gridSize,
          buttonSize,
          spacing: 10,
          padding: 20,
          orientation: 'portrait',
        },
        buttons: buttons.map(btn => ({ ...btn, pageId: page?.id || '' })),
        backgroundColor,
        order: page?.order || 1,
        createdAt: page?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      // For now, just show success since we don't have updatePage method yet
      Alert.alert('Success', 'Page saved successfully');
      navigation?.goBack();
    } catch (error) {
      console.error('Error saving page:', error);
      Alert.alert('Error', 'Failed to save page');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddButton = () => {
    // Navigate to symbol library to add a symbol
    navigation?.navigate('SymbolLibrary', { 
      onSymbolSelect: (symbol: any) => {
        const newButton: CommunicationButton = {
          id: `btn-${symbol.id}-${Date.now()}`,
          pageId: page?.id || '',
          text: symbol.name,
          image: symbol.image,
          ttsMessage: symbol.name,
          action: { type: 'speak' },
          position: { row: 0, column: 0, width: 1, height: 1 },
          size: buttonSize,
          backgroundColor: '#FFFFFF',
          textColor: '#000000',
          borderColor: getCategoryColor(symbol.category),
          borderWidth: 3,
          borderRadius: 12,
          order: buttons.length + 1,
          isVisible: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setButtons([...buttons, newButton]);
      }
    });
  };

  const handleEditButton = (buttonId: string) => {
    Alert.alert('Edit Button', 'Button editing functionality coming soon');
  };

  const handleDeleteButton = (buttonId: string) => {
    Alert.alert(
      'Delete Button',
      'Are you sure you want to delete this button?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setButtons(buttons.filter(btn => btn.id !== buttonId));
          },
        },
      ]
    );
  };

  const handleExpressWizardComplete = (wizardButtons: CommunicationButton[]) => {
    setButtons(wizardButtons);
    setShowExpressWizard(false);
  };

  const handleExpressWizardCancel = () => {
    setShowExpressWizard(false);
    // Create default Express page
    createDefaultPage();
  };

  const handleBookSelect = (bookId: string) => {
    setSelectedBookId(bookId);
    setShowBookSelection(false);
    // Retry save with the selected book
    handleSave();
  };

  const renderBookSelectionModal = () => (
    <Modal
      visible={showBookSelection}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowBookSelection(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Book</Text>
          <Text style={styles.modalSubtitle}>Choose which book to add this page to:</Text>
          
          <ScrollView style={styles.bookList}>
            {availableBooks.map((book) => (
              <TouchableOpacity
                key={book.id}
                style={styles.bookOption}
                onPress={() => handleBookSelect(book.id)}
              >
                <View style={styles.bookIcon}>
                  <Ionicons name="book" size={24} color={COLORS.PRIMARY} />
                </View>
                <View style={styles.bookInfo}>
                  <Text style={styles.bookName}>{book.name}</Text>
                  <Text style={styles.bookDescription}>
                    {book.pages?.length || 0} pages • {book.category}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_SECONDARY} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowBookSelection(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const pageTypes = [
    { value: 'standard', label: 'Standard' },
    { value: 'express', label: 'Express' },
    { value: 'visual-scene', label: 'Visual Scene' },
    { value: 'keyboard', label: 'Keyboard' },
  ];

  const gridSizes = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 4, label: '4' },
    { value: 9, label: '9' },
    { value: 16, label: '16' },
    { value: 25, label: '25' },
    { value: 36, label: '36' },
  ];

  const buttonSizes = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'extra-large', label: 'Extra Large' },
  ];

  const renderButton = ({ item }: { item: CommunicationButton }) => (
    <View style={styles.buttonItem}>
      <View style={styles.buttonPreview}>
        <View style={[
          styles.buttonPreviewBox,
          { backgroundColor: item.backgroundColor }
        ]}>
          <Text style={[styles.buttonPreviewText, { color: item.textColor }]}>
            {item.text}
          </Text>
        </View>
      </View>
      <View style={styles.buttonInfo}>
        <Text style={styles.buttonText}>{item.text}</Text>
        <Text style={styles.buttonAction}>{item.action.type}</Text>
      </View>
      <View style={styles.buttonActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditButton(item.id)}
        >
          <Ionicons name="pencil" size={16} color={COLORS.PRIMARY} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteButton(item.id)}
        >
          <Ionicons name="trash" size={16} color={COLORS.ERROR} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (showExpressWizard) {
    return (
      <ExpressPageWizard
        onComplete={handleExpressWizardComplete}
        onCancel={handleExpressWizardCancel}
      />
    );
  }

  return (
    <View style={styles.container}>
      {renderBookSelectionModal()}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.SURFACE} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {pageId ? 'Edit Page' : 'Create New Page'}
        </Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Ionicons name="checkmark" size={24} color={COLORS.SURFACE} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Page Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter page name"
              editable={isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Page Type</Text>
            <View style={styles.optionContainer}>
              {pageTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.optionButton,
                    pageType === type.value && styles.optionButtonActive
                  ]}
                  onPress={() => isEditing && setPageType(type.value as any)}
                >
                  <Text style={[
                    styles.optionButtonText,
                    pageType === type.value && styles.optionButtonTextActive
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Grid Size</Text>
            <View style={styles.optionContainer}>
              {gridSizes.map((size) => (
                <TouchableOpacity
                  key={size.value}
                  style={[
                    styles.optionButton,
                    gridSize === size.value && styles.optionButtonActive
                  ]}
                  onPress={() => isEditing && setGridSize(size.value as 1 | 2 | 4 | 9 | 16 | 25 | 36)}
                >
                  <Text style={[
                    styles.optionButtonText,
                    gridSize === size.value && styles.optionButtonTextActive
                  ]}>
                    {size.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Button Size</Text>
            <View style={styles.optionContainer}>
              {buttonSizes.map((size) => (
                <TouchableOpacity
                  key={size.value}
                  style={[
                    styles.optionButton,
                    buttonSize === size.value && styles.optionButtonActive
                  ]}
                  onPress={() => isEditing && setButtonSize(size.value as any)}
                >
                  <Text style={[
                    styles.optionButtonText,
                    buttonSize === size.value && styles.optionButtonTextActive
                  ]}>
                    {size.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Background Color</Text>
            <TextInput
              style={styles.input}
              value={backgroundColor}
              onChangeText={setBackgroundColor}
              placeholder="#FFFFFF"
              editable={isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Buttons ({buttons.length})</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddButton}
              >
                <Ionicons name="add" size={20} color={COLORS.SURFACE} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={buttons}
              renderItem={renderButton}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
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
  backButton: {
    padding: SPACING.SM,
  },
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZES.TITLE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.SURFACE,
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
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  input: {
    backgroundColor: COLORS.SURFACE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: BORDER_RADIUS.MEDIUM,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
  },
  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM,
  },
  optionButton: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    backgroundColor: COLORS.SURFACE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: BORDER_RADIUS.MEDIUM,
  },
  optionButtonActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  optionButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_PRIMARY,
  },
  optionButtonTextActive: {
    color: COLORS.SURFACE,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.SM,
  },
  addButton: {
    backgroundColor: COLORS.PRIMARY,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE,
    padding: SPACING.MD,
    marginBottom: SPACING.SM,
    borderRadius: BORDER_RADIUS.MEDIUM,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  buttonPreview: {
    marginRight: SPACING.MD,
  },
  buttonPreviewBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPreviewText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  buttonInfo: {
    flex: 1,
  },
  buttonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
  },
  buttonAction: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  buttonActions: {
    flexDirection: 'row',
    gap: SPACING.SM,
  },
  editButton: {
    padding: SPACING.SM,
  },
  deleteButton: {
    padding: SPACING.SM,
  },
  // Book Selection Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.LARGE,
    padding: SPACING.LG,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  modalSubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.LG,
  },
  bookList: {
    maxHeight: 300,
  },
  bookOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.MD,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.MEDIUM,
    marginBottom: SPACING.SM,
  },
  bookIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.SURFACE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.MD,
  },
  bookInfo: {
    flex: 1,
  },
  bookName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  bookDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.LG,
  },
  cancelButton: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.SM,
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
  },
});