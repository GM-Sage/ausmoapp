// Synced Button Library Screen
// Manages reusable buttons that can be used across multiple pages

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
  Modal,
  TextInput,
  ScrollView,
  Switch,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import { SyncedButton } from '../../types';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import SyncedButtonService from '../../services/syncedButtonService';

interface SyncedButtonLibraryScreenProps {
  navigation?: any;
  onSelectButton?: (button: SyncedButton) => void;
  onClose?: () => void;
}

export default function SyncedButtonLibraryScreen({
  navigation,
  onSelectButton,
  onClose,
}: SyncedButtonLibraryScreenProps) {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [syncedButtons, setSyncedButtons] = useState<SyncedButton[]>([]);
  const [filteredButtons, setFilteredButtons] = useState<SyncedButton[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingButton, setEditingButton] = useState<SyncedButton | null>(null);

  // Form fields for creating/editing buttons
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [image, setImage] = useState('');
  const [ttsMessage, setTtsMessage] = useState('');
  const [category, setCategory] = useState('communication');
  const [tags, setTags] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#E3F2FD');
  const [textColor, setTextColor] = useState('#1976D2');
  const [borderColor, setBorderColor] = useState('#2196F3');

  const syncedButtonService = SyncedButtonService.getInstance();
  const categories = syncedButtonService.getButtonCategories();

  useEffect(() => {
    if (currentUser) {
      loadSyncedButtons();
    }
  }, [currentUser]);

  useEffect(() => {
    filterButtons();
  }, [syncedButtons, searchQuery, selectedCategory]);

  const loadSyncedButtons = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      const buttons = await syncedButtonService.getSyncedButtons(
        currentUser.id
      );
      setSyncedButtons(buttons);
    } catch (error) {
      console.error('Error loading synced buttons:', error);
      Alert.alert('Error', 'Failed to load synced buttons');
    } finally {
      setIsLoading(false);
    }
  };

  const filterButtons = () => {
    let filtered = syncedButtons;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        button => button.category === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        button =>
          button.name.toLowerCase().includes(query) ||
          button.text.toLowerCase().includes(query) ||
          button.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredButtons(filtered);
  };

  const handleCreateButton = async () => {
    if (!currentUser || !name.trim() || !text.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const buttonData = {
        name: name.trim(),
        text: text.trim(),
        image: image.trim() || undefined,
        ttsMessage: ttsMessage.trim() || text.trim(),
        action: { type: 'speak' as const },
        backgroundColor,
        textColor,
        borderColor,
        borderWidth: 2,
        borderRadius: 8,
        size: 'medium' as const,
        category,
        tags: tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag),
        isVisible: true,
        userId: currentUser.id,
      };

      await syncedButtonService.createSyncedButton(currentUser.id, buttonData);
      await loadSyncedButtons();
      resetForm();
      setShowCreateModal(false);
      Alert.alert('Success', 'Synced button created successfully');
    } catch (error) {
      console.error('Error creating synced button:', error);
      Alert.alert('Error', 'Failed to create synced button');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditButton = async () => {
    if (!editingButton || !name.trim() || !text.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const updates = {
        name: name.trim(),
        text: text.trim(),
        image: image.trim() || undefined,
        ttsMessage: ttsMessage.trim() || text.trim(),
        backgroundColor,
        textColor,
        borderColor,
        category,
        tags: tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag),
      };

      await syncedButtonService.updateSyncedButton(editingButton.id, updates);
      await loadSyncedButtons();
      resetForm();
      setShowEditModal(false);
      setEditingButton(null);
      Alert.alert('Success', 'Synced button updated successfully');
    } catch (error) {
      console.error('Error updating synced button:', error);
      Alert.alert('Error', 'Failed to update synced button');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteButton = (button: SyncedButton) => {
    Alert.alert(
      'Delete Synced Button',
      `Are you sure you want to delete "${button.name}"? This will remove it from all pages where it's used.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await syncedButtonService.deleteSyncedButton(button.id);
              await loadSyncedButtons();
              Alert.alert('Success', 'Synced button deleted successfully');
            } catch (error) {
              console.error('Error deleting synced button:', error);
              Alert.alert('Error', 'Failed to delete synced button');
            }
          },
        },
      ]
    );
  };

  const handleSelectButton = (button: SyncedButton) => {
    if (onSelectButton) {
      onSelectButton(button);
    }
    if (onClose) {
      onClose();
    }
  };

  const openEditModal = (button: SyncedButton) => {
    setEditingButton(button);
    setName(button.name);
    setText(button.text);
    setImage(button.image || '');
    setTtsMessage(button.ttsMessage || '');
    setCategory(button.category);
    setTags(button.tags.join(', '));
    setBackgroundColor(button.backgroundColor);
    setTextColor(button.textColor);
    setBorderColor(button.borderColor);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setName('');
    setText('');
    setImage('');
    setTtsMessage('');
    setCategory('communication');
    setTags('');
    setBackgroundColor('#E3F2FD');
    setTextColor('#1976D2');
    setBorderColor('#2196F3');
  };

  const renderButton = ({ item }: { item: SyncedButton }) => (
    <TouchableOpacity
      style={[styles.buttonCard, { backgroundColor: item.backgroundColor }]}
      onPress={() => handleSelectButton(item)}
      onLongPress={() => openEditModal(item)}
    >
      <View style={styles.buttonHeader}>
        <View style={styles.buttonInfo}>
          <Text style={[styles.buttonName, { color: item.textColor }]}>
            {item.name}
          </Text>
          <Text style={[styles.buttonText, { color: item.textColor }]}>
            {item.text}
          </Text>
        </View>
        <View style={styles.buttonActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openEditModal(item)}
          >
            <Ionicons name="create" size={20} color={themeColors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteButton(item)}
          >
            <Ionicons name="trash" size={20} color={themeColors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {item.image && (
        <View style={styles.buttonImageContainer}>
          <Text style={styles.buttonImage}>{item.image}</Text>
        </View>
      )}

      <View style={styles.buttonFooter}>
        <Text style={styles.categoryText}>{item.category}</Text>
        <Text style={styles.usageText}>Used {item.usageCount} times</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Create Synced Button</Text>
          <TouchableOpacity
            onPress={() => {
              setShowCreateModal(false);
              resetForm();
            }}
          >
            <Ionicons name="close" size={24} color={themeColors.text_PRIMARY} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Button name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Text *</Text>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Button text"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>TTS Message</Text>
            <TextInput
              style={styles.input}
              value={ttsMessage}
              onChangeText={setTtsMessage}
              placeholder="Text to speak (defaults to button text)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Image/Emoji</Text>
            <TextInput
              style={styles.input}
              value={image}
              onChangeText={setImage}
              placeholder="Emoji or image URL"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryContainer}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      category === cat && styles.categoryChipSelected,
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        category === cat && styles.categoryChipTextSelected,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tags (comma-separated)</Text>
            <TextInput
              style={styles.input}
              value={tags}
              onChangeText={setTags}
              placeholder="tag1, tag2, tag3"
            />
          </View>

          <View style={styles.colorGroup}>
            <View style={styles.colorInput}>
              <Text style={styles.label}>Background Color</Text>
              <TextInput
                style={styles.colorInputField}
                value={backgroundColor}
                onChangeText={setBackgroundColor}
                placeholder="#E3F2FD"
              />
            </View>
            <View style={styles.colorInput}>
              <Text style={styles.label}>Text Color</Text>
              <TextInput
                style={styles.colorInputField}
                value={textColor}
                onChangeText={setTextColor}
                placeholder="#1976D2"
              />
            </View>
            <View style={styles.colorInput}>
              <Text style={styles.label}>Border Color</Text>
              <TextInput
                style={styles.colorInputField}
                value={borderColor}
                onChangeText={setBorderColor}
                placeholder="#2196F3"
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={() => {
              setShowCreateModal(false);
              resetForm();
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.createButton]}
            onPress={handleCreateButton}
            disabled={isLoading}
          >
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderEditModal = () => (
    <Modal
      visible={showEditModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Edit Synced Button</Text>
          <TouchableOpacity
            onPress={() => {
              setShowEditModal(false);
              setEditingButton(null);
              resetForm();
            }}
          >
            <Ionicons name="close" size={24} color={themeColors.text_PRIMARY} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Same form fields as create modal */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Button name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Text *</Text>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Button text"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>TTS Message</Text>
            <TextInput
              style={styles.input}
              value={ttsMessage}
              onChangeText={setTtsMessage}
              placeholder="Text to speak (defaults to button text)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Image/Emoji</Text>
            <TextInput
              style={styles.input}
              value={image}
              onChangeText={setImage}
              placeholder="Emoji or image URL"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryContainer}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      category === cat && styles.categoryChipSelected,
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        category === cat && styles.categoryChipTextSelected,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tags (comma-separated)</Text>
            <TextInput
              style={styles.input}
              value={tags}
              onChangeText={setTags}
              placeholder="tag1, tag2, tag3"
            />
          </View>

          <View style={styles.colorGroup}>
            <View style={styles.colorInput}>
              <Text style={styles.label}>Background Color</Text>
              <TextInput
                style={styles.colorInputField}
                value={backgroundColor}
                onChangeText={setBackgroundColor}
                placeholder="#E3F2FD"
              />
            </View>
            <View style={styles.colorInput}>
              <Text style={styles.label}>Text Color</Text>
              <TextInput
                style={styles.colorInputField}
                value={textColor}
                onChangeText={setTextColor}
                placeholder="#1976D2"
              />
            </View>
            <View style={styles.colorInput}>
              <Text style={styles.label}>Border Color</Text>
              <TextInput
                style={styles.colorInputField}
                value={borderColor}
                onChangeText={setBorderColor}
                placeholder="#2196F3"
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={() => {
              setShowEditModal(false);
              setEditingButton(null);
              resetForm();
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.createButton]}
            onPress={handleEditButton}
            disabled={isLoading}
          >
            <Text style={styles.createButtonText}>Update</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons
                name="close"
                size={24}
                color={themeColors.text_PRIMARY}
              />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>Synced Button Library</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color={themeColors.surface} />
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search"
            size={20}
            color={themeColors.textSecondary}
          />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search buttons..."
            placeholderTextColor={themeColors.textSecondary}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedCategory === 'all' && styles.filterChipSelected,
              ]}
              onPress={() => setSelectedCategory('all')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedCategory === 'all' && styles.filterChipTextSelected,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.filterChip,
                  selectedCategory === cat && styles.filterChipSelected,
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedCategory === cat && styles.filterChipTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Button List */}
      <FlatList
        data={filteredButtons}
        renderItem={renderButton}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="library"
              size={64}
              color={themeColors.textSecondary}
            />
            <Text style={styles.emptyText}>No synced buttons found</Text>
            <Text style={styles.emptySubtext}>
              Create your first synced button to get started
            </Text>
          </View>
        }
      />

      {renderCreateModal()}
      {renderEditModal()}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    backgroundColor: themeColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    marginRight: SPACING.SM,
  },
  headerTitle: {
    ...TYPOGRAPHY.HEADING_2,
    color: themeColors.text_PRIMARY,
  },
  addButton: {
    backgroundColor: themeColors.primary,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.SM,
  },
  searchContainer: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    backgroundColor: themeColors.surface,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.background,
    borderRadius: BORDER_RADIUS.MD,
    paddingHorizontal: SPACING.SM,
    marginBottom: SPACING.SM,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.SM,
    ...TYPOGRAPHY.BODY,
    color: themeColors.text_PRIMARY,
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterChip: {
    backgroundColor: themeColors.background,
    borderRadius: BORDER_RADIUS.LG,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.XS,
    marginRight: SPACING.SM,
  },
  filterChipSelected: {
    backgroundColor: themeColors.primary,
  },
  filterChipText: {
    ...TYPOGRAPHY.CAPTION,
    color: themeColors.textSecondary,
  },
  filterChipTextSelected: {
    color: themeColors.surface,
  },
  listContainer: {
    padding: SPACING.MD,
  },
  buttonCard: {
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    marginBottom: SPACING.SM,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  buttonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  buttonInfo: {
    flex: 1,
  },
  buttonName: {
    ...TYPOGRAPHY.SUBHEADING,
    fontWeight: '600',
  },
  buttonText: {
    ...TYPOGRAPHY.BODY,
    marginTop: SPACING.XS,
  },
  buttonActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: SPACING.XS,
    marginLeft: SPACING.XS,
  },
  buttonImageContainer: {
    alignItems: 'center',
    marginVertical: SPACING.SM,
  },
  buttonImage: {
    fontSize: 32,
  },
  buttonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.SM,
  },
  categoryText: {
    ...TYPOGRAPHY.CAPTION,
    color: themeColors.textSecondary,
    textTransform: 'capitalize',
  },
  usageText: {
    ...TYPOGRAPHY.CAPTION,
    color: themeColors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.XL * 2,
  },
  emptyText: {
    ...TYPOGRAPHY.HEADING_3,
    color: themeColors.textSecondary,
    marginTop: SPACING.MD,
  },
  emptySubtext: {
    ...TYPOGRAPHY.BODY,
    color: themeColors.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.SM,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    backgroundColor: themeColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  modalTitle: {
    ...TYPOGRAPHY.HEADING_2,
    color: themeColors.text_PRIMARY,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.MD,
  },
  inputGroup: {
    marginBottom: SPACING.MD,
  },
  label: {
    ...TYPOGRAPHY.SUBHEADING,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  input: {
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    ...TYPOGRAPHY.BODY,
    color: themeColors.text_PRIMARY,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  categoryContainer: {
    flexDirection: 'row',
  },
  categoryChip: {
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    marginRight: SPACING.SM,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  categoryChipSelected: {
    backgroundColor: themeColors.primary,
    borderColor: themeColors.primary,
  },
  categoryChipText: {
    ...TYPOGRAPHY.CAPTION,
    color: themeColors.textSecondary,
    textTransform: 'capitalize',
  },
  categoryChipTextSelected: {
    color: themeColors.surface,
  },
  colorGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  colorInput: {
    flex: 1,
    marginRight: SPACING.SM,
  },
  colorInputField: {
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    ...TYPOGRAPHY.CAPTION,
    color: themeColors.text_PRIMARY,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: SPACING.MD,
    backgroundColor: themeColors.surface,
    borderTopWidth: 1,
    borderTopColor: themeColors.border,
  },
  modalButton: {
    flex: 1,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: themeColors.background,
    borderWidth: 1,
    borderColor: themeColors.border,
    marginRight: SPACING.SM,
  },
  createButton: {
    backgroundColor: themeColors.primary,
  },
  cancelButtonText: {
    ...TYPOGRAPHY.SUBHEADING,
    color: themeColors.textSecondary,
  },
  createButtonText: {
    ...TYPOGRAPHY.SUBHEADING,
    color: themeColors.surface,
    fontWeight: '600',
  },
});
