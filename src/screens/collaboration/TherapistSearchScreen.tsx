// Parent Therapist Search Screen
// Allows parents to find and request connections with therapists

import React, { useState, useEffect } from 'react';
import { getThemeColors } from '../../utils/themeUtils';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

import { RootState } from '../../store';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import PatientAssignmentService, {
  TherapistProfile,
  PatientAssignmentRequest,
} from '../../services/patientAssignmentService';

interface TherapistSearchScreenProps {
  navigation: any;
}

export default function TherapistSearchScreen({
  navigation,
}: TherapistSearchScreenProps) {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('');
  const [therapists, setTherapists] = useState<TherapistProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTherapist, setSelectedTherapist] =
    useState<TherapistProfile | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<
    PatientAssignmentRequest[]
  >([]);

  const assignmentService = PatientAssignmentService.getInstance();

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    try {
      if (currentUser?.role === 'parent') {
        const requests = await assignmentService.getParentRequests(
          currentUser.id
        );
        setPendingRequests(requests);
      }
    } catch (error) {
      console.error('Error loading pending requests:', error);
    }
  };

  const searchTherapists = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Search Required', 'Please enter a search term');
      return;
    }

    setIsLoading(true);
    try {
      const results = await assignmentService.searchTherapists(
        searchQuery,
        specialtyFilter
      );
      setTherapists(results);
    } catch (error) {
      console.error('Error searching therapists:', error);
      Alert.alert(
        'Search Error',
        'Failed to search therapists. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestConnection = (therapist: TherapistProfile) => {
    setSelectedTherapist(therapist);
    setShowRequestModal(true);
  };

  const submitConnectionRequest = async () => {
    if (!selectedTherapist || !currentUser) return;

    setIsSubmitting(true);
    try {
      // For now, we'll use the first child - in a real app, you'd let the parent select
      const parentProfile = await assignmentService.getParentProfile(
        currentUser.id
      );
      const childId = parentProfile.children[0]; // First child

      if (!childId) {
        Alert.alert('No Children', 'Please add a child profile first');
        return;
      }

      await assignmentService.createAssignmentRequest(
        currentUser.id,
        selectedTherapist.id,
        childId,
        requestMessage
      );

      Alert.alert(
        'Request Sent',
        `Your request has been sent to ${selectedTherapist.practiceName || 'the therapist'}. They will review and respond within 7 days.`,
        [{ text: 'OK', onPress: () => setShowRequestModal(false) }]
      );

      setRequestMessage('');
      loadPendingRequests();
    } catch (error: any) {
      console.error('Error submitting request:', error);
      Alert.alert(
        'Request Failed',
        error.message || 'Failed to send request. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTherapistCard = ({ item }: { item: TherapistProfile }) => (
    <View style={styles.therapistCard}>
      <View style={styles.therapistHeader}>
        <View style={styles.therapistInfo}>
          <Text style={styles.therapistName}>
            {item.practiceName || 'Private Practice'}
          </Text>
          <Text style={styles.therapistCredentials}>
            {item.credentials.join(', ')}
          </Text>
        </View>
        <View style={styles.verificationBadge}>
          <Ionicons
            name={item.isVerified ? 'checkmark-circle' : 'help-circle'}
            size={20}
            color={item.isVerified ? themeColors.success : themeColors.warning}
          />
          <Text style={styles.verificationText}>
            {item.isVerified ? 'Verified' : 'Unverified'}
          </Text>
        </View>
      </View>

      <View style={styles.specialtiesContainer}>
        {item.specialties.map((specialty, index) => (
          <View key={index} style={styles.specialtyTag}>
            <Text style={styles.specialtyText}>{specialty}</Text>
          </View>
        ))}
      </View>

      <View style={styles.therapistDetails}>
        <View style={styles.detailRow}>
          <Ionicons
            name="location"
            size={16}
            color={themeColors.textSecondary}
          />
          <Text style={styles.detailText}>
            {item.practiceAddress || 'Address not provided'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons
            name="people"
            size={16}
            color={themeColors.textSecondary}
          />
          <Text style={styles.detailText}>
            {item.currentPatientCount}/{item.maxPatients} patients
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="mail" size={16} color={themeColors.textSecondary} />
          <Text style={styles.detailText}>{item.email}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.requestButton,
          !item.isAcceptingPatients && styles.requestButtonDisabled,
        ]}
        onPress={() => handleRequestConnection(item)}
        disabled={!item.isAcceptingPatients}
      >
        <Ionicons
          name="person-add"
          size={20}
          color={
            item.isAcceptingPatients
              ? themeColors.surface
              : themeColors.text_DISABLED
          }
        />
        <Text
          style={[
            styles.requestButtonText,
            !item.isAcceptingPatients && styles.requestButtonTextDisabled,
          ]}
        >
          {item.isAcceptingPatients
            ? 'Request Connection'
            : 'Not Accepting Patients'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPendingRequest = ({
    item,
  }: {
    item: PatientAssignmentRequest;
  }) => (
    <View style={styles.pendingRequestCard}>
      <View style={styles.requestHeader}>
        <Text style={styles.requestStatus}>{item.status.toUpperCase()}</Text>
        <Text style={styles.requestDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.requestMessage}>Request sent to therapist</Text>
      <Text style={styles.requestExpiry}>
        Expires: {new Date(item.expiresAt).toLocaleDateString()}
      </Text>
    </View>
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
        <Text style={styles.title}>Find Therapists</Text>
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name, practice, or specialty..."
            placeholderTextColor={themeColors.textSecondary}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={searchTherapists}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={themeColors.surface} />
            ) : (
              <Ionicons name="search" size={20} color={themeColors.surface} />
            )}
          </TouchableOpacity>
        </View>

        {/* Specialty Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.specialtyFilter}
        >
          {[
            'ABA',
            'Speech Therapy',
            'Occupational Therapy',
            'Physical Therapy',
            'Behavioral Therapy',
          ].map(specialty => (
            <TouchableOpacity
              key={specialty}
              style={[
                styles.filterButton,
                specialtyFilter === specialty && styles.filterButtonActive,
              ]}
              onPress={() =>
                setSpecialtyFilter(
                  specialtyFilter === specialty ? '' : specialty
                )
              }
            >
              <Text
                style={[
                  styles.filterButtonText,
                  specialtyFilter === specialty &&
                    styles.filterButtonTextActive,
                ]}
              >
                {specialty}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <View style={styles.pendingSection}>
          <Text style={styles.sectionTitle}>Pending Requests</Text>
          <FlatList
            data={pendingRequests}
            renderItem={renderPendingRequest}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      {/* Results */}
      <View style={styles.resultsSection}>
        <Text style={styles.sectionTitle}>
          {therapists.length > 0
            ? `${therapists.length} Therapists Found`
            : 'Search for therapists'}
        </Text>
        <FlatList
          data={therapists}
          renderItem={renderTherapistCard}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.resultsList}
        />
      </View>

      {/* Request Modal */}
      <Modal
        visible={showRequestModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowRequestModal(false)}
            >
              <Ionicons
                name="close"
                size={24}
                color={themeColors.text_PRIMARY}
              />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Request Connection</Text>
          </View>

          {selectedTherapist && (
            <View style={styles.modalContent}>
              <View style={styles.selectedTherapistInfo}>
                <Text style={styles.selectedTherapistName}>
                  {selectedTherapist.practiceName || 'Private Practice'}
                </Text>
                <Text style={styles.selectedTherapistCredentials}>
                  {selectedTherapist.credentials.join(', ')}
                </Text>
              </View>

              <View style={styles.messageSection}>
                <Text style={styles.messageLabel}>Message (Optional)</Text>
                <TextInput
                  style={styles.messageInput}
                  value={requestMessage}
                  onChangeText={setRequestMessage}
                  placeholder="Tell the therapist about your child's needs..."
                  placeholderTextColor={themeColors.textSecondary}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  isSubmitting && styles.submitButtonDisabled,
                ]}
                onPress={submitConnectionRequest}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={themeColors.surface} />
                ) : (
                  <>
                    <Ionicons
                      name="send"
                      size={20}
                      color={themeColors.surface}
                    />
                    <Text style={styles.submitButtonText}>Send Request</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
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
  },
  searchSection: {
    padding: SPACING.LG,
    backgroundColor: themeColors.surface,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.background,
    borderRadius: BORDER_RADIUS.MD,
    paddingHorizontal: SPACING.MD,
    marginBottom: SPACING.MD,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.text_PRIMARY,
    paddingVertical: SPACING.MD,
  },
  searchButton: {
    backgroundColor: themeColors.primary,
    padding: SPACING.SM,
    borderRadius: BORDER_RADIUS.SM,
  },
  specialtyFilter: {
    marginTop: SPACING.SM,
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
  filterButtonActive: {
    backgroundColor: themeColors.primary,
    borderColor: themeColors.primary,
  },
  filterButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.text_PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  filterButtonTextActive: {
    color: themeColors.surface,
  },
  pendingSection: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.SM,
  },
  pendingRequestCard: {
    backgroundColor: themeColors.surface,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    marginRight: SPACING.SM,
    minWidth: 200,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.XS,
  },
  requestStatus: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.warning,
  },
  requestDate: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  requestMessage: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  requestExpiry: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  resultsSection: {
    flex: 1,
    paddingHorizontal: SPACING.LG,
  },
  resultsList: {
    paddingBottom: SPACING.XL,
  },
  therapistCard: {
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
  therapistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.MD,
  },
  therapistInfo: {
    flex: 1,
  },
  therapistName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  therapistCredentials: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.background,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
  },
  verificationText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.text_PRIMARY,
    marginLeft: SPACING.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.MD,
  },
  specialtyTag: {
    backgroundColor: themeColors.primary_LIGHT,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
    marginRight: SPACING.SM,
    marginBottom: SPACING.XS,
  },
  specialtyText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.primary,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  therapistDetails: {
    marginBottom: SPACING.MD,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.XS,
  },
  detailText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginLeft: SPACING.SM,
    flex: 1,
  },
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColors.primary,
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
  },
  requestButtonDisabled: {
    backgroundColor: themeColors.text_DISABLED,
  },
  requestButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.surface,
    marginLeft: SPACING.SM,
  },
  requestButtonTextDisabled: {
    color: themeColors.text_DISABLED,
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
  selectedTherapistInfo: {
    backgroundColor: themeColors.surface,
    padding: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
    marginBottom: SPACING.LG,
  },
  selectedTherapistName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  selectedTherapistCredentials: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.textSecondary,
  },
  messageSection: {
    marginBottom: SPACING.LG,
  },
  messageLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.SM,
  },
  messageInput: {
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.text_PRIMARY,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColors.primary,
    paddingVertical: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
  },
  submitButtonDisabled: {
    backgroundColor: themeColors.text_DISABLED,
  },
  submitButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.surface,
    marginLeft: SPACING.SM,
  },
});
