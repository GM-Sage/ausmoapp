// Template Gallery Screen

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
  TextInput,
  Modal,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import TemplateService, { Template, TemplateCategory, TemplateSearchOptions } from '../../services/templateService';
import DatabaseService from '../../services/databaseService';

const { width } = Dimensions.get('window');

export default function TemplateGalleryScreen() {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [templateService] = useState(() => TemplateService.getInstance());
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  useEffect(() => {
    loadTemplates();
    loadCategories();
  }, []);

  useEffect(() => {
    searchTemplates();
  }, [selectedCategory, searchTerm]);

  const loadTemplates = () => {
    const allTemplates = templateService.getAllTemplates();
    setTemplates(allTemplates);
  };

  const loadCategories = () => {
    const allCategories = templateService.getCategories();
    setCategories(allCategories);
  };

  const searchTemplates = () => {
    const options: TemplateSearchOptions = {};
    
    if (selectedCategory !== 'all') {
      options.category = selectedCategory;
    }
    
    if (searchTerm.trim()) {
      options.searchTerm = searchTerm.trim();
    }

    const results = templateService.searchTemplates(options);
    setTemplates(results);
  };

  const handleTemplatePress = (template: Template) => {
    setSelectedTemplate(template);
    setShowTemplateModal(true);
  };

  const handleDownloadTemplate = async (template: Template) => {
    if (!currentUser) {
      Alert.alert('Error', 'Please log in to download templates');
      return;
    }

    try {
      setIsLoading(true);

      // Create a copy of the template book for the user
      const userBook = {
        ...template.book,
        id: `user-${Date.now()}-${Math.random()}`,
        userId: currentUser.id,
        name: `${template.name} (Copy)`,
        isTemplate: false,
        isShared: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Update page and button IDs
      userBook.pages = userBook.pages.map(page => ({
        ...page,
        id: `page-${Date.now()}-${Math.random()}`,
        bookId: userBook.id,
        buttons: page.buttons.map(button => ({
          ...button,
          id: `btn-${Date.now()}-${Math.random()}`,
          pageId: `page-${Date.now()}-${Math.random()}`,
        })),
      }));

      // Save to database
      await DatabaseService.createBook(userBook);

      Alert.alert(
        'Success',
        `Template "${template.name}" has been added to your library!`,
        [
          { text: 'OK', style: 'default' },
          { 
            text: 'View Library', 
            onPress: () => {
              // Navigate to library screen
              setShowTemplateModal(false);
            }
          },
        ]
      );

    } catch (error) {
      console.error('Error downloading template:', error);
      Alert.alert('Error', 'Failed to download template');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCategoryItem = ({ item }: { item: TemplateCategory }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.categoryItemSelected
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon as any} size={24} color={COLORS.SURFACE} />
      </View>
      <Text style={[
        styles.categoryName,
        selectedCategory === item.id && styles.categoryNameSelected
      ]}>
        {item.name}
      </Text>
      <Text style={styles.categoryCount}>{item.templateCount}</Text>
    </TouchableOpacity>
  );

  const renderTemplateItem = ({ item }: { item: Template }) => (
    <TouchableOpacity
      style={styles.templateItem}
      onPress={() => handleTemplatePress(item)}
    >
      <View style={styles.templateThumbnail}>
        <Text style={styles.templateThumbnailText}>{item.thumbnail}</Text>
        {item.isPremium && (
          <View style={styles.premiumBadge}>
            <Ionicons name="star" size={12} color={COLORS.WARNING} />
          </View>
        )}
      </View>
      <View style={styles.templateInfo}>
        <Text style={styles.templateName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.templateDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.templateMeta}>
          <View style={styles.templateRating}>
            <Ionicons name="star" size={12} color={COLORS.WARNING} />
            <Text style={styles.templateRatingText}>{item.rating}</Text>
          </View>
          <Text style={styles.templateDownloads}>{item.downloadCount} downloads</Text>
        </View>
        <View style={styles.templateTags}>
          {item.tags.slice(0, 2).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTemplateModal = () => {
    if (!selectedTemplate) return null;

    return (
      <Modal
        visible={showTemplateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowTemplateModal(false)}
            >
              <Ionicons name="close" size={24} color={COLORS.TEXT_PRIMARY} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedTemplate.name}</Text>
            <View style={styles.modalSpacer} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.templatePreview}>
              <Text style={styles.templatePreviewThumbnail}>
                {selectedTemplate.thumbnail}
              </Text>
              <Text style={styles.templatePreviewDescription}>
                {selectedTemplate.description}
              </Text>
            </View>

            <View style={styles.templateDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Category:</Text>
                <Text style={styles.detailValue}>{selectedTemplate.category}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Difficulty:</Text>
                <Text style={styles.detailValue}>{selectedTemplate.difficulty}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Age Range:</Text>
                <Text style={styles.detailValue}>{selectedTemplate.ageRange}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Author:</Text>
                <Text style={styles.detailValue}>{selectedTemplate.author}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Rating:</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color={COLORS.WARNING} />
                  <Text style={styles.detailValue}>{selectedTemplate.rating}/5.0</Text>
                </View>
              </View>
            </View>

            <View style={styles.templateTags}>
              <Text style={styles.tagsTitle}>Tags:</Text>
              <View style={styles.tagsContainer}>
                {selectedTemplate.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[
                styles.downloadButton,
                selectedTemplate.isPremium && styles.premiumButton
              ]}
              onPress={() => handleDownloadTemplate(selectedTemplate)}
              disabled={isLoading}
            >
              <Ionicons 
                name={selectedTemplate.isPremium ? "star" : "download"} 
                size={20} 
                color={COLORS.SURFACE} 
              />
              <Text style={styles.downloadButtonText}>
                {selectedTemplate.isPremium ? 'Download Premium' : 'Download Free'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Template Gallery</Text>
        <Text style={styles.headerSubtitle}>
          Pre-made communication boards for every need
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.TEXT_SECONDARY} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search templates..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor={COLORS.TEXT_SECONDARY}
        />
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <TouchableOpacity
          style={[
            styles.categoryItem,
            selectedCategory === 'all' && styles.categoryItemSelected
          ]}
          onPress={() => setSelectedCategory('all')}
        >
          <View style={[styles.categoryIcon, { backgroundColor: COLORS.PRIMARY }]}>
            <Ionicons name="grid" size={24} color={COLORS.SURFACE} />
          </View>
          <Text style={[
            styles.categoryName,
            selectedCategory === 'all' && styles.categoryNameSelected
          ]}>
            All
          </Text>
        </TouchableOpacity>

        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Templates */}
      <FlatList
        data={templates}
        renderItem={renderTemplateItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.templatesList}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={styles.templateRow}
      />

      {renderTemplateModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    padding: SPACING.MD,
    backgroundColor: COLORS.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.TITLE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE,
    margin: SPACING.MD,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.SM,
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.MD,
    marginBottom: SPACING.MD,
  },
  categoriesList: {
    paddingLeft: SPACING.SM,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: SPACING.MD,
    padding: SPACING.SM,
    borderRadius: BORDER_RADIUS.MD,
    minWidth: 80,
  },
  categoryItemSelected: {
    backgroundColor: COLORS.PRIMARY + '20',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.XS,
  },
  categoryName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  categoryNameSelected: {
    color: COLORS.PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
  categoryCount: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  templatesList: {
    padding: SPACING.MD,
  },
  templateRow: {
    justifyContent: 'space-between',
  },
  templateItem: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
    width: (width - SPACING.MD * 3) / 2,
    shadowColor: COLORS.TEXT_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  templateThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.SM,
    position: 'relative',
  },
  templateThumbnailText: {
    fontSize: 24,
  },
  premiumBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.SURFACE,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.WARNING,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS,
  },
  templateDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.SM,
    lineHeight: 16,
  },
  templateMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  templateRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  templateRatingText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: 2,
  },
  templateDownloads: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
  },
  templateTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: COLORS.PRIMARY + '20',
    paddingHorizontal: SPACING.XS,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.SM,
    marginRight: SPACING.XS,
    marginBottom: SPACING.XS,
  },
  tagText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  modalCloseButton: {
    padding: SPACING.SM,
  },
  modalTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  modalSpacer: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.MD,
  },
  templatePreview: {
    alignItems: 'center',
    padding: SPACING.LG,
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.MD,
    marginBottom: SPACING.MD,
  },
  templatePreviewThumbnail: {
    fontSize: 48,
    marginBottom: SPACING.MD,
  },
  templatePreviewDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    lineHeight: 22,
  },
  templateDetails: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.SM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.DIVIDER,
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagsTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalFooter: {
    padding: SPACING.MD,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
    gap: SPACING.SM,
  },
  premiumButton: {
    backgroundColor: COLORS.WARNING,
  },
  downloadButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.SURFACE,
  },
});
