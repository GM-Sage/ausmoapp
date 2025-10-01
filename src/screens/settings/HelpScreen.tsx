// Help Screen - In-app help and support system

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Modal,
  Share,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import FeedbackService, {
  HelpArticle,
  FeedbackItem,
} from '../../services/feedbackService';
import { ScreenSafeArea } from '../../components/common/SafeAreaWrapper';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { getThemeColors } from '../../utils/themeUtils';

interface HelpScreenProps {
  navigation?: any;
}

export default function HelpScreen({ navigation }: HelpScreenProps) {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const [feedbackService] = useState(() => FeedbackService.getInstance());
  const [helpArticles, setHelpArticles] = useState<HelpArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] =
    useState<FeedbackItem['type']>('general_feedback');
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackDescription, setFeedbackDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadHelpArticles();
  }, [selectedCategory, searchQuery]);

  const loadHelpArticles = () => {
    try {
      let articles = feedbackService.getHelpArticles();

      // Filter by category
      if (selectedCategory !== 'all') {
        articles = articles.filter(
          article => article.category === selectedCategory
        );
      }

      // Filter by search query
      if (searchQuery.trim()) {
        articles = feedbackService.searchHelpArticles(searchQuery);
      }

      setHelpArticles(articles);
    } catch (error) {
      console.error('Error loading help articles:', error);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackTitle.trim() || !feedbackDescription.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      await feedbackService.submitFeedback({
        userId: currentUser?.id || 'anonymous',
        type: feedbackType,
        title: feedbackTitle,
        description: feedbackDescription,
        category: 'general',
        priority: 'medium',
        status: 'new',
        platform: 'ios', // This would be dynamic based on platform
        appVersion: '1.0.0',
        deviceInfo: {
          model: 'Unknown',
          osVersion: 'Unknown',
          appVersion: '1.0.0',
        },
        userContext: {
          role: currentUser?.role || 'parent',
          experience: 'intermediate',
          usageFrequency: 'daily',
        },
        tags: [feedbackType],
      });

      Alert.alert(
        'Thank You!',
        'Your feedback has been submitted successfully.'
      );

      // Reset form
      setFeedbackTitle('');
      setFeedbackDescription('');
      setShowFeedbackModal(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleArticlePress = async (article: HelpArticle) => {
    // Navigate to article detail or show in modal
    Alert.alert(article.title, article.content, [
      { text: 'Close', style: 'cancel' },
      {
        text: 'Helpful',
        onPress: () => feedbackService.rateHelpArticle(article.id, true),
      },
      {
        text: 'Not Helpful',
        onPress: () => feedbackService.rateHelpArticle(article.id, false),
      },
    ]);
  };

  const handleShareApp = async () => {
    try {
      const result = await Share.share({
        message:
          'Check out Ausmo AAC - the best communication app for children with autism! Download at: https://ausmo.app',
        title: 'Ausmo AAC App',
      });
    } catch (error) {
      console.error('Error sharing app:', error);
    }
  };

  const categories = [
    { id: 'all', name: 'All Articles', icon: 'list' },
    { id: 'getting-started', name: 'Getting Started', icon: 'rocket' },
    { id: 'communication', name: 'Communication', icon: 'chatbubbles' },
    { id: 'accessibility', name: 'Accessibility', icon: 'accessibility' },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: 'construct' },
    { id: 'support', name: 'Support', icon: 'help-circle' },
  ];

  const renderHelpArticle = ({ item }: { item: HelpArticle }) => (
    <TouchableOpacity
      style={[
        styles.articleCard,
        { backgroundColor: themeColors.surface, shadowColor: themeColors.text },
      ]}
      onPress={() => handleArticlePress(item)}
      accessible={true}
      accessibilityLabel={`Help article: ${item.title}`}
      accessibilityRole="button"
    >
      <View style={styles.articleHeader}>
        <View style={styles.articleInfo}>
          <Text style={[styles.articleTitle, { color: themeColors.text }]}>
            {item.title}
          </Text>
          <View style={styles.articleMeta}>
            <Text style={styles.articleCategory}>{item.category}</Text>
            <Text style={styles.articleDifficulty}>{item.difficulty}</Text>
          </View>
        </View>
        <View style={styles.articleStats}>
          <View style={styles.statItem}>
            <Ionicons name="eye" size={14} color={themeColors.textSecondary} />
            <Text
              style={[styles.statText, { color: themeColors.textSecondary }]}
            >
              {item.views}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="thumbs-up" size={14} color={themeColors.success} />
            <Text
              style={[styles.statText, { color: themeColors.textSecondary }]}
            >
              {item.helpful}
            </Text>
          </View>
        </View>
      </View>
      <Text
        style={[styles.articlePreview, { color: themeColors.textSecondary }]}
        numberOfLines={3}
      >
        {item.content.substring(0, 150)}...
      </Text>
      <View style={styles.articleFooter}>
        <Text
          style={[styles.articleDate, { color: themeColors.textSecondary }]}
        >
          Updated {item.lastUpdated.toLocaleDateString()}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={themeColors.textSecondary}
        />
      </View>
    </TouchableOpacity>
  );

  const renderCategoryFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryFilter}
      contentContainerStyle={styles.categoryFilterContent}
    >
      {categories.map(category => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryChip,
            {
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
            },
            selectedCategory === category.id && [
              styles.categoryChipActive,
              { backgroundColor: themeColors.primary },
            ],
          ]}
          onPress={() => setSelectedCategory(category.id)}
          accessible={true}
          accessibilityLabel={`Filter by ${category.name}`}
          accessibilityRole="button"
        >
          <Ionicons
            name={category.icon as any}
            size={16}
            color={
              selectedCategory === category.id
                ? themeColors.surface
                : themeColors.primary
            }
          />
          <Text
            style={[
              styles.categoryChipText,
              { color: themeColors.text },
              selectedCategory === category.id && [
                styles.categoryChipTextActive,
                { color: themeColors.surface },
              ],
            ]}
          >
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <ScreenSafeArea
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColors.primary }]}>
        <Text style={[styles.title, { color: themeColors.surface }]}>
          Help & Support
        </Text>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShareApp}
          accessible={true}
          accessibilityLabel="Share the app"
          accessibilityRole="button"
        >
          <Ionicons name="share" size={24} color={themeColors.surface} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border,
          },
        ]}
      >
        <Ionicons
          name="search"
          size={20}
          color={themeColors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: themeColors.text }]}
          placeholder="Search help articles..."
          placeholderTextColor={themeColors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessible={true}
          accessibilityLabel="Search help articles"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
            accessible={true}
            accessibilityLabel="Clear search"
          >
            <Ionicons
              name="close"
              size={20}
              color={themeColors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      {renderCategoryFilter()}

      {/* Help Articles */}
      <FlatList
        data={helpArticles}
        renderItem={renderHelpArticle}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.articlesContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="document-outline"
              size={48}
              color={themeColors.textSecondary}
            />
            <Text
              style={[
                styles.emptyStateText,
                { color: themeColors.textSecondary },
              ]}
            >
              No articles found
            </Text>
            <Text
              style={[
                styles.emptyStateSubtext,
                { color: themeColors.textSecondary },
              ]}
            >
              Try adjusting your search or category filter
            </Text>
          </View>
        }
      />

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: themeColors.primary },
          ]}
          onPress={() => setShowFeedbackModal(true)}
          accessible={true}
          accessibilityLabel="Submit feedback"
          accessibilityRole="button"
        >
          <Ionicons
            name="chatbubble-ellipses"
            size={20}
            color={themeColors.surface}
          />
          <Text
            style={[styles.actionButtonText, { color: themeColors.surface }]}
          >
            Send Feedback
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: themeColors.secondary },
          ]}
          onPress={() => navigation?.navigate('FAQ')}
          accessible={true}
          accessibilityLabel="View frequently asked questions"
          accessibilityRole="button"
        >
          <Ionicons name="help-circle" size={20} color={themeColors.surface} />
          <Text
            style={[styles.actionButtonText, { color: themeColors.surface }]}
          >
            FAQ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: themeColors.info }]}
          onPress={() => navigation?.navigate('ContactSupport')}
          accessible={true}
          accessibilityLabel="Contact support"
          accessibilityRole="button"
        >
          <Ionicons name="mail" size={20} color={themeColors.surface} />
          <Text
            style={[styles.actionButtonText, { color: themeColors.surface }]}
          >
            Contact Support
          </Text>
        </TouchableOpacity>
      </View>

      {/* Feedback Modal */}
      <Modal
        visible={showFeedbackModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Send Feedback</Text>
            <TouchableOpacity onPress={() => setShowFeedbackModal(false)}>
              <Ionicons
                name="close"
                size={24}
                color={themeColors.text_PRIMARY}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalLabel}>Feedback Type</Text>
            <View style={styles.feedbackTypeContainer}>
              {[
                { value: 'general_feedback', label: 'General Feedback' },
                { value: 'bug_report', label: 'Bug Report' },
                { value: 'feature_request', label: 'Feature Request' },
              ].map(type => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.feedbackTypeOption,
                    feedbackType === type.value &&
                      styles.feedbackTypeOptionActive,
                  ]}
                  onPress={() =>
                    setFeedbackType(type.value as FeedbackItem['type'])
                  }
                  accessible={true}
                  accessibilityLabel={`Select ${type.label}`}
                >
                  <Text
                    style={[
                      styles.feedbackTypeText,
                      feedbackType === type.value &&
                        styles.feedbackTypeTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Title</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Brief description of your feedback"
              value={feedbackTitle}
              onChangeText={setFeedbackTitle}
              maxLength={100}
              accessible={true}
              accessibilityLabel="Feedback title"
            />

            <Text style={styles.modalLabel}>Description</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Detailed description of your feedback, suggestions, or issues"
              value={feedbackDescription}
              onChangeText={setFeedbackDescription}
              multiline
              numberOfLines={6}
              maxLength={1000}
              textAlignVertical="top"
              accessible={true}
              accessibilityLabel="Feedback description"
            />

            <Text style={styles.modalHelperText}>
              Your feedback helps us improve Ausmo AAC for the autism community.
            </Text>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowFeedbackModal(false)}
              disabled={isLoading}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalSubmitButton,
                isLoading && styles.modalSubmitButtonDisabled,
              ]}
              onPress={handleFeedbackSubmit}
              disabled={isLoading}
            >
              <Text style={styles.modalSubmitButtonText}>
                {isLoading ? 'Submitting...' : 'Submit Feedback'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenSafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor will be set dynamically based on theme
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    // backgroundColor will be set dynamically based on theme
  },
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    // color will be set dynamically based on theme
  },
  shareButton: {
    padding: SPACING.SM,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor, borderColor will be set dynamically based on theme
    marginHorizontal: SPACING.LG,
    marginVertical: SPACING.MD,
    paddingHorizontal: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: SPACING.SM,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.MD,
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    // color will be set dynamically based on theme
  },
  clearButton: {
    padding: SPACING.XS,
  },
  categoryFilter: {
    marginHorizontal: SPACING.LG,
    marginBottom: SPACING.MD,
  },
  categoryFilterContent: {
    gap: SPACING.SM,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    // backgroundColor, borderColor will be set dynamically based on theme
    borderRadius: BORDER_RADIUS.LG,
    borderWidth: 1,
    gap: SPACING.XS,
  },
  categoryChipActive: {
    // backgroundColor will be set dynamically based on theme
  },
  categoryChipText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    // color will be set dynamically based on theme
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  categoryChipTextActive: {
    // color will be set dynamically based on theme
  },
  articlesContainer: {
    padding: SPACING.LG,
    gap: SPACING.MD,
  },
  articleCard: {
    // backgroundColor, shadowColor will be set dynamically based on theme
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.SM,
  },
  articleInfo: {
    flex: 1,
    marginRight: SPACING.MD,
  },
  articleTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    // color will be set dynamically based on theme
    marginBottom: SPACING.XS,
  },
  articleMeta: {
    flexDirection: 'row',
    gap: SPACING.SM,
  },
  articleCategory: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.primary,
    backgroundColor: themeColors.primary + '20',
    paddingHorizontal: SPACING.XS,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.XS,
  },
  articleDifficulty: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.success,
    backgroundColor: themeColors.success + '20',
    paddingHorizontal: SPACING.XS,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.XS,
  },
  articleStats: {
    flexDirection: 'row',
    gap: SPACING.SM,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    // color will be set dynamically based on theme
  },
  articlePreview: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    // color will be set dynamically based on theme
    lineHeight: 20,
    marginBottom: SPACING.SM,
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  articleDate: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    // color will be set dynamically based on theme
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.XL,
  },
  emptyStateText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    color: themeColors.textSecondary,
    marginTop: SPACING.MD,
    marginBottom: SPACING.SM,
  },
  emptyStateSubtext: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.textSecondary,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    gap: SPACING.MD,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor will be set dynamically based on theme
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    gap: SPACING.XS,
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    // color will be set dynamically based on theme
  },
  modalContainer: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    backgroundColor: themeColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
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
  modalLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.SM,
  },
  feedbackTypeContainer: {
    flexDirection: 'row',
    gap: SPACING.SM,
    marginBottom: SPACING.LG,
  },
  feedbackTypeOption: {
    flex: 1,
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.SM,
    borderWidth: 1,
    borderColor: themeColors.border,
    alignItems: 'center',
  },
  feedbackTypeOptionActive: {
    backgroundColor: themeColors.primary,
    borderColor: themeColors.primary,
  },
  feedbackTypeText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.text_PRIMARY,
    textAlign: 'center',
  },
  feedbackTypeTextActive: {
    color: themeColors.surface,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
  modalInput: {
    backgroundColor: themeColors.surface,
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: BORDER_RADIUS.SM,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.MD,
  },
  modalTextArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  modalHelperText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    padding: SPACING.LG,
    backgroundColor: themeColors.surface,
    borderTopWidth: 1,
    borderTopColor: themeColors.border,
    gap: SPACING.MD,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: SPACING.MD,
    alignItems: 'center',
    backgroundColor: themeColors.border,
    borderRadius: BORDER_RADIUS.SM,
  },
  modalCancelButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.text_PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
  modalSubmitButton: {
    flex: 1,
    paddingVertical: SPACING.MD,
    alignItems: 'center',
    backgroundColor: themeColors.primary,
    borderRadius: BORDER_RADIUS.SM,
  },
  modalSubmitButtonDisabled: {
    backgroundColor: themeColors.textSecondary,
  },
  modalSubmitButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.surface,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
});
