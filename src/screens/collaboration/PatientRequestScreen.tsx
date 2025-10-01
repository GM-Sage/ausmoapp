// Patient Request Screen
// Allows patients to request therapist collaboration

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
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import { SupabaseDatabaseService } from '../../services/supabaseDatabaseService';

interface Therapist {
  id: string;
  name: string;
  email: string;
  specialization?: string;
  experience?: string;
  rating?: number;
}

export default function PatientRequestScreen() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(
    null
  );
  const [requestMessage, setRequestMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadTherapists();
  }, []);

  const loadTherapists = async () => {
    try {
      setIsLoading(true);
      const allUsers =
        await SupabaseDatabaseService.getInstance().getAllUsers();
      const therapistUsers = allUsers.filter(user => user.role === 'therapist');
      setTherapists(therapistUsers);
    } catch (error) {
      console.error('Error loading therapists:', error);
      Alert.alert('Error', 'Failed to load therapists');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestTherapist = async (therapist: Therapist) => {
    if (!currentUser) return;

    Alert.alert(
      'Request Therapist',
      `Send a collaboration request to ${therapist.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Request',
          onPress: async () => {
            try {
              setIsSubmitting(true);

              // Create therapist request in database
              const request = {
                id: `request-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                patientId: currentUser.id,
                therapistId: therapist.id,
                patientName: currentUser.name,
                therapistName: therapist.name,
                message:
                  requestMessage ||
                  `Hi ${therapist.name}, I would like to work with you for my AAC therapy.`,
                status: 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };

              await SupabaseDatabaseService.getInstance().createTherapistRequest(
                request
              );

              Alert.alert(
                'Request Sent!',
                `Your request has been sent to ${therapist.name}. They will be notified and can accept or decline your request.`,
                [{ text: 'OK' }]
              );

              setRequestMessage('');
            } catch (error) {
              console.error('Error sending request:', error);
              Alert.alert('Error', 'Failed to send request. Please try again.');
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const renderTherapistCard = (therapist: Therapist) => (
    <View key={therapist.id} style={styles.therapistCard}>
      <View style={styles.therapistInfo}>
        <View style={styles.therapistAvatar}>
          <Text style={styles.therapistAvatarText}>
            {therapist.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.therapistDetails}>
          <Text style={styles.therapistName}>{therapist.name}</Text>
          <Text style={styles.therapistEmail}>{therapist.email}</Text>
          {therapist.specialization && (
            <Text style={styles.therapistSpecialization}>
              Specialization: {therapist.specialization}
            </Text>
          )}
          {therapist.experience && (
            <Text style={styles.therapistExperience}>
              Experience: {therapist.experience}
            </Text>
          )}
          {therapist.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color={themeColors.warning} />
              <Text style={styles.ratingText}>{therapist.rating}/5</Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity
        style={styles.requestButton}
        onPress={() => handleRequestTherapist(therapist)}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color={themeColors.surface} />
        ) : (
          <>
            <Ionicons name="person-add" size={20} color={themeColors.surface} />
            <Text style={styles.requestButtonText}>Request</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Request Therapist</Text>
          <Text style={styles.subtitle}>
            Find and request collaboration with a therapist
          </Text>
        </View>

        {/* Request Message */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Request Message</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Optional: Add a personal message to your request..."
            value={requestMessage}
            onChangeText={setRequestMessage}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Available Therapists */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Available Therapists ({therapists.length})
          </Text>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={themeColors.primary} />
              <Text style={styles.loadingText}>Loading therapists...</Text>
            </View>
          ) : therapists.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="people"
                size={48}
                color={themeColors.textSecondary}
              />
              <Text style={styles.emptyText}>No therapists available</Text>
              <Text style={styles.emptySubtext}>
                Check back later or contact support
              </Text>
            </View>
          ) : (
            therapists.map(renderTherapistCard)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.LG,
  },
  header: {
    paddingVertical: SPACING.LG,
  },
  title: {
    ...TYPOGRAPHY.HEADING_LARGE,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  subtitle: {
    ...TYPOGRAPHY.BODY_MEDIUM,
    color: themeColors.textSecondary,
  },
  section: {
    marginBottom: SPACING.XL,
  },
  sectionTitle: {
    ...TYPOGRAPHY.HEADING_MEDIUM,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.MD,
  },
  messageInput: {
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    ...TYPOGRAPHY.BODY_MEDIUM,
    color: themeColors.text_PRIMARY,
    borderWidth: 1,
    borderColor: themeColors.border,
    minHeight: 80,
  },
  therapistCard: {
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  therapistInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  therapistAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: themeColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.MD,
  },
  therapistAvatarText: {
    ...TYPOGRAPHY.HEADING_MEDIUM,
    color: themeColors.surface,
    fontWeight: 'bold',
  },
  therapistDetails: {
    flex: 1,
  },
  therapistName: {
    ...TYPOGRAPHY.BODY_LARGE,
    color: themeColors.text_PRIMARY,
    fontWeight: '600',
  },
  therapistEmail: {
    ...TYPOGRAPHY.BODY_SMALL,
    color: themeColors.textSecondary,
    marginTop: SPACING.XS,
  },
  therapistSpecialization: {
    ...TYPOGRAPHY.BODY_SMALL,
    color: themeColors.primary,
    marginTop: SPACING.XS,
  },
  therapistExperience: {
    ...TYPOGRAPHY.BODY_SMALL,
    color: themeColors.textSecondary,
    marginTop: SPACING.XS,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.XS,
  },
  ratingText: {
    ...TYPOGRAPHY.BODY_SMALL,
    color: themeColors.textSecondary,
    marginLeft: SPACING.XS,
  },
  requestButton: {
    backgroundColor: themeColors.primary,
    borderRadius: BORDER_RADIUS.MD,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestButtonText: {
    ...TYPOGRAPHY.BODY_MEDIUM,
    color: themeColors.surface,
    fontWeight: '600',
    marginLeft: SPACING.XS,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: SPACING.XL,
  },
  loadingText: {
    ...TYPOGRAPHY.BODY_MEDIUM,
    color: themeColors.textSecondary,
    marginTop: SPACING.MD,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: SPACING.XL,
  },
  emptyText: {
    ...TYPOGRAPHY.BODY_LARGE,
    color: themeColors.textSecondary,
    marginTop: SPACING.MD,
  },
  emptySubtext: {
    ...TYPOGRAPHY.BODY_MEDIUM,
    color: themeColors.textSecondary,
    marginTop: SPACING.XS,
    textAlign: 'center',
  },
});
