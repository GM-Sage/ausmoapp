// Template Gallery Screen
// Community template browsing and management

import React, { useState, useEffect } from 'react';
import { getThemeColors } from '../../utils/themeUtils';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

import { RootState } from '../../store';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import TemplateSharingService, {
  TemplatePackage,
  TemplateReview,
} from '../../services/templateSharingService';

interface TemplateGalleryScreenProps {
  navigation: any;
}

export default function TemplateGalleryScreen({
  navigation,
}: TemplateGalleryScreenProps) {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const { currentUser } = useSelector((state: RootState) => state.user);

  const [templates, setTemplates] = useState<TemplatePackage[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<TemplatePackage[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplatePackage | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const sharingService = TemplateSharingService.getInstance();

  const categories = [
    'All Categories',
    'Basic Communication',
    'Daily Activities',
    'Education',
    'Social Skills',
    'Therapy Goals',
    'Custom',
  ];

  const difficulties = ['All Levels', 'beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchQuery, selectedCategory, selectedDifficulty]);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const communityTemplates = await sharingService.getCommunityTemplates();
      setTemplates(communityTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      Alert.alert('Error', 'Failed to load templates. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = [...templates];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        template =>
          template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          template.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          template.tags.some(tag =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'All Categories') {
      filtered = filtered.filter(
        template => template.category === selectedCategory
      );
    }

    // Difficulty filter
    if (selectedDifficulty && selectedDifficulty !== 'All Levels') {
      filtered = filtered.filter(
        template => template.difficulty === selectedDifficulty
      );
    }

    setFilteredTemplates(filtered);
  };

  const handleDownloadTemplate = async (template: TemplatePackage) => {
    if (!currentUser) {
      Alert.alert('Login Required', 'Please log in to download templates.');
      return;
    }

    try {
      const book = await sharingService.downloadTemplate(
        template.id,
        currentUser.id
      );
      if (book) {
        Alert.alert(
          'Download Complete',
          `"${template.title}" has been downloaded to your library.`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(
          'Download Failed',
          'Failed to download template. Please try again.'
        );
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      Alert.alert(
        'Download Failed',
        'Failed to download template. Please try again.'
      );
    }
  };

  const handleRateTemplate = async () => {
    if (!selectedTemplate || !currentUser) return;

    try {
      const success = await sharingService.rateTemplate(
        selectedTemplate.id,
        currentUser.id,
        currentUser.name,
        reviewRating,
        reviewComment
      );

      if (success) {
        Alert.alert('Thank You', 'Your review has been submitted.');
        setShowReviewModal(false);
        setReviewComment('');
        setReviewRating(5);
        loadTemplates(); // Refresh to show updated rating
      } else {
        Alert.alert('Error', 'Failed to submit review. Please try again.');
      }
    } catch (error) {
      console.error('Error rating template:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    }
  };

  const renderTemplateCard = ({ item }: { item: TemplatePackage }) => (
    <TouchableOpacity
      style={styles.templateCard}
      onPress={() => {
        setSelectedTemplate(item);
        setShowTemplateModal(true);
      }}
    >
      <View style={styles.templateHeader}>
        <View style={styles.templateInfo}>
          <Text style={styles.templateTitle}>{item.title}</Text>
          <Text style={styles.templateAuthor}>by {item.author}</Text>
        </View>
        <View style={styles.templateRating}>
          <Ionicons name="star" size={16} color={themeColors.warning} />
          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
        </View>
      </View>

      <Text style={styles.templateDescription}>{item.description}</Text>

      <View style={styles.templateMeta}>
        <View style={styles.metaItem}>
          <Ionicons
            name="folder"
            size={14}
            color={themeColors.textSecondary}
          />
          <Text style={styles.metaText}>{item.category}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons
            name="trending-up"
            size={14}
            color={themeColors.textSecondary}
          />
          <Text style={styles.metaText}>{item.difficulty}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons
            name="download"
            size={14}
            color={themeColors.textSecondary}
          />
          <Text style={styles.metaText}>{item.downloadCount}</Text>
        </View>
      </View>

      <View style={styles.templateTags}>
        {item.tags.slice(0, 3).map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
        {item.tags.length > 3 && (
          <Text style={styles.moreTagsText}>+{item.tags.length - 3} more</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFilterButton = (
    title: string,
    isSelected: boolean,
    onPress: () => void
  ) => (
    <TouchableOpacity
      style={[styles.filterButton, isSelected && styles.filterButtonSelected]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterButtonText,
          isSelected && styles.filterButtonTextSelected,
        ]}
      >
        {title}
      </Text>
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
              <Ionicons
                name="close"
                size={24}
                color={themeColors.text_PRIMARY}
              />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Template Details</Text>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.templateDetails}>
              <Text style={styles.detailTitle}>{selectedTemplate.title}</Text>
              <Text style={styles.detailAuthor}>
                by {selectedTemplate.author}
              </Text>

              <View style={styles.detailRating}>
                <Ionicons name="star" size={20} color={themeColors.warning} />
                <Text style={styles.detailRatingText}>
                  {selectedTemplate.rating.toFixed(1)}
                </Text>
                <Text style={styles.detailRatingCount}>
                  ({selectedTemplate.reviews.length} reviews)
                </Text>
              </View>

              <Text style={styles.detailDescription}>
                {selectedTemplate.description}
              </Text>

              <View style={styles.detailMeta}>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Category:</Text>
                  <Text style={styles.metaValue}>
                    {selectedTemplate.category}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Difficulty:</Text>
                  <Text style={styles.metaValue}>
                    {selectedTemplate.difficulty}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Age Range:</Text>
                  <Text style={styles.metaValue}>
                    {selectedTemplate.ageRange}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Language:</Text>
                  <Text style={styles.metaValue}>
                    {selectedTemplate.language}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Downloads:</Text>
                  <Text style={styles.metaValue}>
                    {selectedTemplate.downloadCount}
                  </Text>
                </View>
              </View>

              <View style={styles.detailTags}>
                <Text style={styles.tagsTitle}>Tags:</Text>
                <View style={styles.tagsContainer}>
                  {selectedTemplate.tags.map((tag, index) => (
                    <View key={index} style={styles.detailTag}>
                      <Text style={styles.detailTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {selectedTemplate.reviews.length > 0 && (
                <View style={styles.reviewsSection}>
                  <Text style={styles.reviewsTitle}>Reviews</Text>
                  {selectedTemplate.reviews.slice(0, 3).map(review => (
                    <View key={review.id} style={styles.reviewItem}>
                      <View style={styles.reviewHeader}>
                        <Text style={styles.reviewAuthor}>
                          {review.userName}
                        </Text>
                        <View style={styles.reviewRating}>
                          {[...Array(5)].map((_, i) => (
                            <Ionicons
                              key={i}
                              name={i < review.rating ? 'star' : 'star-outline'}
                              size={14}
                              color={themeColors.warning}
                            />
                          ))}
                        </View>
                      </View>
                      <Text style={styles.reviewComment}>{review.comment}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => handleDownloadTemplate(selectedTemplate)}
              >
                <Ionicons
                  name="download"
                  size={20}
                  color={themeColors.surface}
                />
                <Text style={styles.downloadButtonText}>Download Template</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.reviewButton}
                onPress={() => {
                  setShowTemplateModal(false);
                  setShowReviewModal(true);
                }}
              >
                <Ionicons name="star" size={20} color={themeColors.primary} />
                <Text style={styles.reviewButtonText}>Rate & Review</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  const renderReviewModal = () => (
    <Modal
      visible={showReviewModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowReviewModal(false)}
          >
            <Ionicons name="close" size={24} color={themeColors.text_PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Rate Template</Text>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.reviewForm}>
            <Text style={styles.reviewFormTitle}>
              Rate "{selectedTemplate?.title}"
            </Text>

            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>Rating:</Text>
              <View style={styles.starRating}>
                {[...Array(5)].map((_, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setReviewRating(i + 1)}
                  >
                    <Ionicons
                      name={i < reviewRating ? 'star' : 'star-outline'}
                      size={32}
                      color={themeColors.warning}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.commentSection}>
              <Text style={styles.commentLabel}>Comment (optional):</Text>
              <TextInput
                style={styles.commentInput}
                value={reviewComment}
                onChangeText={setReviewComment}
                placeholder="Share your experience with this template..."
                placeholderTextColor={themeColors.textSecondary}
                multiline
                numberOfLines={4}
              />
            </View>

            <TouchableOpacity
              style={styles.submitReviewButton}
              onPress={handleRateTemplate}
            >
              <Ionicons
                name="checkmark"
                size={20}
                color={themeColors.surface}
              />
              <Text style={styles.submitReviewButtonText}>Submit Review</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={styles.loadingText}>Loading templates...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={themeColors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Template Gallery</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadTemplates}>
          <Ionicons name="refresh" size={24} color={themeColors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
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
            placeholder="Search templates..."
            placeholderTextColor={themeColors.textSecondary}
          />
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filtersRow}>
            {categories.map((category, index) => (
              <View key={`category-${index}`}>
                {renderFilterButton(
                  category,
                  selectedCategory === category,
                  () =>
                    setSelectedCategory(
                      selectedCategory === category ? '' : category
                    )
                )}
              </View>
            ))}
          </View>
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filtersRow}>
            {difficulties.map((difficulty, index) => (
              <View key={`difficulty-${index}`}>
                {renderFilterButton(
                  difficulty,
                  selectedDifficulty === difficulty,
                  () =>
                    setSelectedDifficulty(
                      selectedDifficulty === difficulty ? '' : difficulty
                    )
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Templates List */}
      <FlatList
        data={filteredTemplates}
        renderItem={renderTemplateCard}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.templatesList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="library"
              size={64}
              color={themeColors.textSecondary}
            />
            <Text style={styles.emptyTitle}>No Templates Found</Text>
            <Text style={styles.emptyMessage}>
              Try adjusting your search or filters to find more templates.
            </Text>
          </View>
        }
      />

      {renderTemplateModal()}
      {renderReviewModal()}
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
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    backgroundColor: themeColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  backButton: {
    marginRight: SPACING.MD,
  },
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    flex: 1,
  },
  refreshButton: {
    padding: SPACING.SM,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.textSecondary,
    marginTop: SPACING.MD,
  },
  searchContainer: {
    padding: SPACING.LG,
    backgroundColor: themeColors.surface,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.background,
    borderRadius: BORDER_RADIUS.MD,
    paddingHorizontal: SPACING.MD,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.text_PRIMARY,
    paddingVertical: SPACING.MD,
    marginLeft: SPACING.SM,
  },
  filtersContainer: {
    backgroundColor: themeColors.surface,
    paddingBottom: SPACING.MD,
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.LG,
  },
  filterButton: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    backgroundColor: themeColors.background,
    borderRadius: BORDER_RADIUS.LARGE,
    marginRight: SPACING.SM,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  filterButtonSelected: {
    backgroundColor: themeColors.primary,
    borderColor: themeColors.primary,
  },
  filterButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.text_PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  filterButtonTextSelected: {
    color: themeColors.surface,
  },
  templatesList: {
    padding: SPACING.LG,
  },
  templateCard: {
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.LG,
    marginBottom: SPACING.MD,
    shadowColor: themeColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.SM,
  },
  templateInfo: {
    flex: 1,
  },
  templateTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  templateAuthor: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  templateRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.text_PRIMARY,
    marginLeft: SPACING.XS,
  },
  templateDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.MD,
  },
  templateMeta: {
    flexDirection: 'row',
    marginBottom: SPACING.MD,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.LG,
  },
  metaText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginLeft: SPACING.XS,
  },
  templateTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  tag: {
    backgroundColor: themeColors.primary_LIGHT,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
    marginRight: SPACING.SM,
    marginBottom: SPACING.XS,
  },
  tagText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.primary,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  moreTagsText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.XL,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginTop: SPACING.LG,
    marginBottom: SPACING.SM,
  },
  emptyMessage: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    backgroundColor: themeColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  modalCloseButton: {
    marginRight: SPACING.MD,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.LG,
  },
  templateDetails: {
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.LG,
    marginBottom: SPACING.LG,
  },
  detailTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XLARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  detailAuthor: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.textSecondary,
    marginBottom: SPACING.MD,
  },
  detailRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  detailRatingText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginLeft: SPACING.SM,
  },
  detailRatingCount: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginLeft: SPACING.SM,
  },
  detailDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.textSecondary,
    lineHeight: 24,
    marginBottom: SPACING.LG,
  },
  detailMeta: {
    marginBottom: SPACING.LG,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.SM,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  metaLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.text_PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  metaValue: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.textSecondary,
  },
  detailTags: {
    marginBottom: SPACING.LG,
  },
  tagsTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.SM,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailTag: {
    backgroundColor: themeColors.primary_LIGHT,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
    marginRight: SPACING.SM,
    marginBottom: SPACING.XS,
  },
  detailTagText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.primary,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  reviewsSection: {
    marginTop: SPACING.LG,
  },
  reviewsTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.MD,
  },
  reviewItem: {
    backgroundColor: themeColors.background,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    marginBottom: SPACING.MD,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  reviewAuthor: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  downloadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColors.primary,
    paddingVertical: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
    marginRight: SPACING.SM,
  },
  downloadButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.surface,
    marginLeft: SPACING.SM,
  },
  reviewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColors.secondary,
    paddingVertical: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
    marginLeft: SPACING.SM,
  },
  reviewButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.surface,
    marginLeft: SPACING.SM,
  },
  reviewForm: {
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.LG,
  },
  reviewFormTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.LG,
  },
  ratingSection: {
    marginBottom: SPACING.LG,
  },
  ratingLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.MD,
  },
  starRating: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  commentSection: {
    marginBottom: SPACING.LG,
  },
  commentLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.SM,
  },
  commentInput: {
    backgroundColor: themeColors.background,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.text_PRIMARY,
    borderWidth: 1,
    borderColor: themeColors.border,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColors.primary,
    paddingVertical: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
  },
  submitReviewButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.surface,
    marginLeft: SPACING.SM,
  },
});
