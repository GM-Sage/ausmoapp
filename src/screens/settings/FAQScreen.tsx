// FAQ Screen - Frequently Asked Questions

import React, { useState } from 'react';
import { getThemeColors } from '../../utils/themeUtils';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import { ScreenSafeArea } from '../../components/common/SafeAreaWrapper';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function FAQScreen({ navigation }: { navigation?: any }) {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const faqData: FAQItem[] = [
    {
      id: 'getting-started-1',
      question: 'How do I get started with Ausmo AAC?',
      answer:
        '1. Download the app from the App Store or Google Play\n2. Create your account by selecting your role (parent, child, or therapist)\n3. Set up your communication preferences\n4. Start exploring symbols and building messages\n5. Customize accessibility settings as needed',
      category: 'Getting Started',
    },
    {
      id: 'getting-started-2',
      question: 'Is the app free to use?',
      answer:
        'Yes! Ausmo AAC offers a free basic version with essential communication features. Premium features are available through subscription for advanced functionality like unlimited symbol libraries, detailed analytics, and priority support.',
      category: 'Pricing',
    },
    {
      id: 'communication-1',
      question: 'How do I create messages using symbols?',
      answer:
        '1. Tap symbols on the main screen to add them to your message\n2. Watch the express bar at the top to see your message building\n3. Tap the speaker button to hear your message spoken\n4. Use the clear button to start a new message',
      category: 'Communication',
    },
    {
      id: 'communication-2',
      question: 'Can I use my own photos as symbols?',
      answer:
        'Yes! Go to Library > Symbol Library > Add Custom Symbol. You can take photos or choose from your gallery to create personalized symbols for family members, favorite items, and familiar places.',
      category: 'Communication',
    },
    {
      id: 'accessibility-1',
      question: 'How do I enable switch scanning?',
      answer:
        'Go to Settings > Accessibility > Motor > Switch Scanning. Enable switch scanning and choose between single or dual switch mode. Adjust scanning speed and direction for your preferences.',
      category: 'Accessibility',
    },
    {
      id: 'accessibility-2',
      question: 'What voice control commands are available?',
      answer:
        'Voice commands include: "Select" (choose highlighted item), "Next" (move to next option), "Previous" (go back), "Speak" (speak current message), "Clear" (clear message), and "Home" (return to main screen).',
      category: 'Accessibility',
    },
    {
      id: 'privacy-1',
      question: 'How is my data protected?',
      answer:
        'All communication data is encrypted end-to-end. We follow HIPAA compliance standards for healthcare data and COPPA for child privacy. Your data is never sold or shared without explicit consent.',
      category: 'Privacy',
    },
    {
      id: 'privacy-2',
      question: "Who can see my child's communication data?",
      answer:
        'Only you (as parent) and healthcare professionals you explicitly authorize. Data is encrypted and stored securely. You control all data sharing permissions and can revoke access at any time.',
      category: 'Privacy',
    },
    {
      id: 'technical-1',
      question: "Why won't the app start?",
      answer:
        'Common solutions:\n• Check your internet connection\n• Update to the latest app version\n• Restart your device\n• Clear app cache in device settings\n• Ensure sufficient storage space',
      category: 'Technical',
    },
    {
      id: 'technical-2',
      question: "Symbols aren't loading properly",
      answer:
        'Try:\n• Checking your internet connection\n• Restarting the app\n• Clearing app cache\n• Re-downloading symbol libraries\n• Checking available storage space',
      category: 'Technical',
    },
    {
      id: 'collaboration-1',
      question: "How do I connect with my child's therapist?",
      answer:
        'Parents can search for therapists by specialty and location, then send connection requests. Therapists receive requests and can accept to begin collaboration. You control what data is shared.',
      category: 'Collaboration',
    },
    {
      id: 'collaboration-2',
      question: "Can therapists see all my child's data?",
      answer:
        'No. You control data sharing permissions. Therapists only see data you explicitly choose to share, such as progress reports, specific communication examples, or therapy session notes.',
      category: 'Collaboration',
    },
  ];

  const filteredFAQ = faqData.filter(
    item =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleExpanded = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  const renderFAQItem = ({ item }: { item: FAQItem }) => (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={() => toggleExpanded(item.id)}
      accessible={true}
      accessibilityLabel={`Question: ${item.question}`}
      accessibilityRole="button"
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{item.question}</Text>
        <Ionicons
          name={expandedItem === item.id ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={themeColors.textSecondary}
        />
      </View>
      <Text style={styles.faqCategory}>{item.category}</Text>

      {expandedItem === item.id && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{item.answer}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const categories = [
    'All',
    ...Array.from(new Set(faqData.map(item => item.category))),
  ];

  return (
    <ScreenSafeArea style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
          accessible={true}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={themeColors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Frequently Asked Questions</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={themeColors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search questions and answers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessible={true}
          accessibilityLabel="Search FAQ"
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

      {/* FAQ List */}
      <FlatList
        data={filteredFAQ}
        renderItem={renderFAQItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.faqContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="search"
              size={48}
              color={themeColors.textSecondary}
            />
            <Text style={styles.emptyStateText}>No questions found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your search terms
            </Text>
          </View>
        }
      />

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation?.navigate('Help')}
          accessible={true}
          accessibilityLabel="Go to help center"
        >
          <Ionicons name="help-circle" size={20} color={themeColors.surface} />
          <Text style={styles.actionButtonText}>Help Center</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation?.navigate('ContactSupport')}
          accessible={true}
          accessibilityLabel="Contact support"
        >
          <Ionicons name="mail" size={20} color={themeColors.surface} />
          <Text style={styles.actionButtonText}>Contact Support</Text>
        </TouchableOpacity>
      </View>
    </ScreenSafeArea>
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
    backgroundColor: themeColors.primary,
  },
  backButton: {
    marginRight: SPACING.MD,
  },
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.surface,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.surface,
    marginHorizontal: SPACING.LG,
    marginVertical: SPACING.MD,
    paddingHorizontal: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  searchIcon: {
    marginRight: SPACING.SM,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.MD,
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.text_PRIMARY,
  },
  clearButton: {
    padding: SPACING.XS,
  },
  faqContainer: {
    padding: SPACING.LG,
    gap: SPACING.MD,
  },
  faqItem: {
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    shadowColor: themeColors.text_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.SM,
  },
  faqQuestion: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    flex: 1,
    marginRight: SPACING.SM,
  },
  faqCategory: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.primary,
    backgroundColor: themeColors.primary + '20',
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
    marginBottom: SPACING.SM,
  },
  faqAnswer: {
    backgroundColor: themeColors.background,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.SM,
    borderLeftWidth: 4,
    borderLeftColor: themeColors.primary,
  },
  faqAnswerText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.textSecondary,
    lineHeight: 22,
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
    backgroundColor: themeColors.primary,
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    gap: SPACING.XS,
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.surface,
  },
});
