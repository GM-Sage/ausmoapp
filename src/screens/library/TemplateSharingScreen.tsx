// Template Sharing Screen
// Comprehensive sharing interface for communication books

import React, { useState, useEffect } from 'react';
import { getThemeColors } from '../../utils/themeUtils';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Switch,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { Platform } from 'react-native';

import { RootState } from '../../store';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import TemplateSharingService, {
  ShareOptions,
  ShareResult,
  TemplatePackage,
  SharingSession,
} from '../../services/templateSharingService';
import { CommunicationBook } from '../../types';

interface TemplateSharingScreenProps {
  navigation: any;
  route: {
    params: {
      book: CommunicationBook;
    };
  };
}

export default function TemplateSharingScreen({
  navigation,
  route,
}: TemplateSharingScreenProps) {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const { book } = route.params;

  const [shareOptions, setShareOptions] = useState<ShareOptions>({
    method: 'email',
    includeImages: true,
    includeAudio: true,
    compressImages: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [showWiFiModal, setShowWiFiModal] = useState(false);
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [activeSessions, setActiveSessions] = useState<SharingSession[]>([]);
  const [communityTemplates, setCommunityTemplates] = useState<
    TemplatePackage[]
  >([]);

  // Form states
  const [emailRecipients, setEmailRecipients] = useState('');
  const [emailSubject, setEmailSubject] = useState(
    `${book.title} - Communication Book`
  );
  const [emailMessage, setEmailMessage] = useState(
    `Please find attached the communication book "${book.title}" shared from Ausmo.`
  );
  const [sessionName, setSessionName] = useState('');
  const [sessionPassword, setSessionPassword] = useState('');
  const [templateTitle, setTemplateTitle] = useState(book.title);
  const [templateDescription, setTemplateDescription] = useState(
    book.description
  );
  const [templateCategory, setTemplateCategory] = useState(
    'Basic Communication'
  );
  const [templateTags, setTemplateTags] = useState('beginner,essential,daily');
  const [templateDifficulty, setTemplateDifficulty] = useState<
    'beginner' | 'intermediate' | 'advanced'
  >('beginner');
  const [templateAgeRange, setTemplateAgeRange] = useState('3-8');
  const [isPublic, setIsPublic] = useState(true);

  const sharingService = TemplateSharingService.getInstance();

  useEffect(() => {
    loadActiveSessions();
    loadCommunityTemplates();
  }, []);

  const loadActiveSessions = async () => {
    try {
      const sessions = sharingService.getActiveWiFiSessions();
      setActiveSessions(sessions);
    } catch (error) {
      console.error('Error loading active sessions:', error);
    }
  };

  const loadCommunityTemplates = async () => {
    try {
      const templates = await sharingService.getCommunityTemplates();
      setCommunityTemplates(templates);
    } catch (error) {
      console.error('Error loading community templates:', error);
    }
  };

  const handleShare = async () => {
    setIsLoading(true);
    try {
      let result: ShareResult;

      switch (shareOptions.method) {
        case 'email':
          result = await sharingService.shareViaEmail(book, {
            ...shareOptions,
            recipients: emailRecipients.split(',').map(email => email.trim()),
            subject: emailSubject,
            message: emailMessage,
          });
          break;

        case 'airdrop':
          result = await sharingService.shareViaAirDrop(book, shareOptions);
          break;

        case 'wifi':
          result = await sharingService.shareViaAirDrop(book, shareOptions); // Fallback for now
          break;

        case 'pdf':
          result = await sharingService.exportToPDF(book, shareOptions);
          break;

        case 'community':
          const template = await sharingService.createTemplatePackage(book, {
            title: templateTitle,
            description: templateDescription,
            version: '1.0',
            author: currentUser?.name || 'Unknown',
            authorId: currentUser?.id || 'unknown',
            category: templateCategory,
            tags: templateTags.split(',').map(tag => tag.trim()),
            difficulty: templateDifficulty,
            ageRange: templateAgeRange,
            language: 'English',
            isPublic,
          });
          result = await sharingService.shareToCommunity(template);
          break;

        default:
          throw new Error('Invalid sharing method');
      }

      if (result.success) {
        Alert.alert('Success', result.message || 'Shared successfully!');
        setShowMethodModal(false);
        setShowWiFiModal(false);
        setShowCommunityModal(false);
      } else {
        Alert.alert('Error', result.error || 'Failed to share');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSharingMethod = (
    method: string,
    title: string,
    description: string,
    icon: string,
    available: boolean = true
  ) => (
    <TouchableOpacity
      style={[styles.methodButton, !available && styles.methodButtonDisabled]}
      onPress={() => {
        if (available) {
          setShareOptions(prev => ({ ...prev, method: method as any }));
          if (method === 'wifi') {
            setShowWiFiModal(true);
          } else if (method === 'community') {
            setShowCommunityModal(true);
          } else {
            setShowMethodModal(true);
          }
        }
      }}
      disabled={!available}
    >
      <View style={styles.methodIcon}>
        <Ionicons
          name={icon as any}
          size={32}
          color={available ? themeColors.primary : themeColors.text_DISABLED}
        />
      </View>
      <View style={styles.methodInfo}>
        <Text
          style={[styles.methodTitle, !available && styles.methodTitleDisabled]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.methodDescription,
            !available && styles.methodDescriptionDisabled,
          ]}
        >
          {description}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={
          available ? themeColors.textSecondary : themeColors.text_DISABLED
        }
      />
    </TouchableOpacity>
  );

  const renderSharingOptions = () => (
    <View style={styles.optionsContainer}>
      <Text style={styles.optionsTitle}>Sharing Options</Text>

      <View style={styles.optionRow}>
        <Text style={styles.optionLabel}>Include Images</Text>
        <Switch
          value={shareOptions.includeImages}
          onValueChange={value =>
            setShareOptions(prev => ({ ...prev, includeImages: value }))
          }
          trackColor={{ false: themeColors.border, true: themeColors.primary }}
          thumbColor={
            shareOptions.includeImages
              ? themeColors.surface
              : themeColors.textSecondary
          }
        />
      </View>

      <View style={styles.optionRow}>
        <Text style={styles.optionLabel}>Include Audio</Text>
        <Switch
          value={shareOptions.includeAudio}
          onValueChange={value =>
            setShareOptions(prev => ({ ...prev, includeAudio: value }))
          }
          trackColor={{ false: themeColors.border, true: themeColors.primary }}
          thumbColor={
            shareOptions.includeAudio
              ? themeColors.surface
              : themeColors.textSecondary
          }
        />
      </View>

      <View style={styles.optionRow}>
        <Text style={styles.optionLabel}>Compress Images</Text>
        <Switch
          value={shareOptions.compressImages}
          onValueChange={value =>
            setShareOptions(prev => ({ ...prev, compressImages: value }))
          }
          trackColor={{ false: themeColors.border, true: themeColors.primary }}
          thumbColor={
            shareOptions.compressImages
              ? themeColors.surface
              : themeColors.textSecondary
          }
        />
      </View>
    </View>
  );

  const renderEmailForm = () => (
    <ScrollView style={styles.formContainer}>
      <Text style={styles.formTitle}>Email Sharing</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Recipients (comma-separated)</Text>
        <TextInput
          style={styles.textInput}
          value={emailRecipients}
          onChangeText={setEmailRecipients}
          placeholder="email1@example.com, email2@example.com"
          placeholderTextColor={themeColors.textSecondary}
          multiline
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Subject</Text>
        <TextInput
          style={styles.textInput}
          value={emailSubject}
          onChangeText={setEmailSubject}
          placeholder="Email subject"
          placeholderTextColor={themeColors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Message</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={emailMessage}
          onChangeText={setEmailMessage}
          placeholder="Email message"
          placeholderTextColor={themeColors.textSecondary}
          multiline
          numberOfLines={4}
        />
      </View>

      {renderSharingOptions()}

      <TouchableOpacity
        style={[styles.shareButton, isLoading && styles.shareButtonDisabled]}
        onPress={handleShare}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={themeColors.surface} />
        ) : (
          <>
            <Ionicons name="mail" size={20} color={themeColors.surface} />
            <Text style={styles.shareButtonText}>Send Email</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  const renderCommunityForm = () => (
    <ScrollView style={styles.formContainer}>
      <Text style={styles.formTitle}>Share to Community</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Template Title</Text>
        <TextInput
          style={styles.textInput}
          value={templateTitle}
          onChangeText={setTemplateTitle}
          placeholder="Template title"
          placeholderTextColor={themeColors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={templateDescription}
          onChangeText={setTemplateDescription}
          placeholder="Template description"
          placeholderTextColor={themeColors.textSecondary}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Category</Text>
        <TextInput
          style={styles.textInput}
          value={templateCategory}
          onChangeText={setTemplateCategory}
          placeholder="Template category"
          placeholderTextColor={themeColors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Tags (comma-separated)</Text>
        <TextInput
          style={styles.textInput}
          value={templateTags}
          onChangeText={setTemplateTags}
          placeholder="beginner, essential, daily"
          placeholderTextColor={themeColors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Age Range</Text>
        <TextInput
          style={styles.textInput}
          value={templateAgeRange}
          onChangeText={setTemplateAgeRange}
          placeholder="3-8"
          placeholderTextColor={themeColors.textSecondary}
        />
      </View>

      <View style={styles.optionRow}>
        <Text style={styles.optionLabel}>Make Public</Text>
        <Switch
          value={isPublic}
          onValueChange={setIsPublic}
          trackColor={{ false: themeColors.border, true: themeColors.primary }}
          thumbColor={
            isPublic ? themeColors.surface : themeColors.textSecondary
          }
        />
      </View>

      <TouchableOpacity
        style={[styles.shareButton, isLoading && styles.shareButtonDisabled]}
        onPress={handleShare}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={themeColors.surface} />
        ) : (
          <>
            <Ionicons name="people" size={20} color={themeColors.surface} />
            <Text style={styles.shareButtonText}>Share to Community</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

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
        <Text style={styles.title}>Share "{book.title}"</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Sharing Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Sharing Method</Text>

          {renderSharingMethod(
            'email',
            'Email',
            'Send via email attachment',
            'mail',
            true
          )}

          {renderSharingMethod(
            'airdrop',
            'AirDrop',
            'Share wirelessly with nearby devices',
            'share',
            Platform.OS === 'ios'
          )}

          {renderSharingMethod(
            'wifi',
            'WiFi Session',
            'Create a local sharing session',
            'wifi',
            true
          )}

          {renderSharingMethod(
            'pdf',
            'PDF Export',
            'Export as PDF document',
            'document-text',
            true
          )}

          {renderSharingMethod(
            'community',
            'Community Gallery',
            'Share with the Ausmo community',
            'people',
            true
          )}
        </View>

        {/* Active WiFi Sessions */}
        {activeSessions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active WiFi Sessions</Text>
            {activeSessions.map(session => (
              <TouchableOpacity key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionName}>{session.sessionName}</Text>
                  <Text style={styles.sessionHost}>
                    Host: {session.hostName}
                  </Text>
                  <Text style={styles.sessionParticipants}>
                    {session.participants.length} participants
                  </Text>
                </View>
                <TouchableOpacity style={styles.joinButton}>
                  <Text style={styles.joinButtonText}>Join</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Community Templates Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Templates</Text>
          <Text style={styles.sectionDescription}>
            Browse templates shared by the community
          </Text>

          <FlatList
            data={communityTemplates.slice(0, 3)}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.templateCard}>
                <View style={styles.templateInfo}>
                  <Text style={styles.templateTitle}>{item.title}</Text>
                  <Text style={styles.templateDescription}>
                    {item.description}
                  </Text>
                  <Text style={styles.templateMeta}>
                    {item.category} • {item.difficulty} • {item.downloadCount}{' '}
                    downloads
                  </Text>
                </View>
                <View style={styles.templateRating}>
                  <Ionicons name="star" size={16} color={themeColors.warning} />
                  <Text style={styles.ratingText}>
                    {item.rating.toFixed(1)}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />

          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('TemplateGallery')}
          >
            <Text style={styles.viewAllButtonText}>View All Templates</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={themeColors.primary}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Email Modal */}
      <Modal
        visible={showMethodModal && shareOptions.method === 'email'}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowMethodModal(false)}
            >
              <Ionicons
                name="close"
                size={24}
                color={themeColors.text_PRIMARY}
              />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Email Sharing</Text>
          </View>
          {renderEmailForm()}
        </View>
      </Modal>

      {/* Community Modal */}
      <Modal
        visible={showCommunityModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCommunityModal(false)}
            >
              <Ionicons
                name="close"
                size={24}
                color={themeColors.text_PRIMARY}
              />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Community Sharing</Text>
          </View>
          {renderCommunityForm()}
        </View>
      </Modal>
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
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: SPACING.LG,
  },
  section: {
    marginBottom: SPACING.XL,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.MD,
  },
  sectionDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginBottom: SPACING.LG,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.surface,
    padding: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
    marginBottom: SPACING.MD,
    shadowColor: themeColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  methodButtonDisabled: {
    opacity: 0.5,
  },
  methodIcon: {
    marginRight: SPACING.MD,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  methodTitleDisabled: {
    color: themeColors.text_DISABLED,
  },
  methodDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  methodDescriptionDisabled: {
    color: themeColors.text_DISABLED,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.surface,
    padding: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
    marginBottom: SPACING.MD,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  sessionHost: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginBottom: SPACING.XS,
  },
  sessionParticipants: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  joinButton: {
    backgroundColor: themeColors.primary,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.SM,
  },
  joinButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.surface,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.surface,
    padding: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
    marginBottom: SPACING.MD,
  },
  templateInfo: {
    flex: 1,
  },
  templateTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  templateDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginBottom: SPACING.XS,
  },
  templateMeta: {
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
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColors.primary_LIGHT,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    marginTop: SPACING.MD,
  },
  viewAllButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.primary,
    marginRight: SPACING.SM,
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
  formContainer: {
    flex: 1,
    padding: SPACING.LG,
  },
  formTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.LG,
  },
  inputGroup: {
    marginBottom: SPACING.LG,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.SM,
  },
  textInput: {
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.text_PRIMARY,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.LG,
    marginBottom: SPACING.LG,
  },
  optionsTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.MD,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  optionLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.text_PRIMARY,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColors.primary,
    paddingVertical: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
    marginTop: SPACING.LG,
  },
  shareButtonDisabled: {
    backgroundColor: themeColors.text_DISABLED,
  },
  shareButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.surface,
    marginLeft: SPACING.SM,
  },
});
