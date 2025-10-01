// Therapist Acceptance Screen
// Allows therapists to view and accept/reject patient requests

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import {
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  RESPONSIVE,
} from '../../constants';
import TherapistService from '../../services/therapistService';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { getThemeColors } from '../../utils/themeUtils';

interface PatientRequest {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  therapistId: string;
}

export default function TherapistAcceptanceScreen() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [requests, setRequests] = useState<PatientRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState<string | null>(
    null
  );

  useEffect(() => {
    loadPatientRequests();
  }, []);

  const loadPatientRequests = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      const therapistService = TherapistService.getInstance();
      const patientRequests = await therapistService.getPatientRequests(
        currentUser.id
      );
      setRequests(patientRequests);
    } catch (error) {
      console.error('Error loading patient requests:', error);
      Alert.alert('Error', 'Failed to load patient requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (request: PatientRequest) => {
    Alert.alert(
      'Accept Patient Request',
      `Accept collaboration request from ${request.patientName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              setProcessingRequest(request.id);
              const therapistService = TherapistService.getInstance();

              await therapistService.acceptPatientRequest(request.id);

              // Update local state
              setRequests(prev =>
                prev.map(req =>
                  req.id === request.id
                    ? { ...req, status: 'accepted' as const }
                    : req
                )
              );

              Alert.alert('Success', 'Patient request accepted successfully!');
            } catch (error) {
              console.error('Error accepting request:', error);
              Alert.alert(
                'Error',
                'Failed to accept request. Please try again.'
              );
            } finally {
              setProcessingRequest(null);
            }
          },
        },
      ]
    );
  };

  const handleRejectRequest = async (request: PatientRequest) => {
    Alert.alert(
      'Reject Patient Request',
      `Reject collaboration request from ${request.patientName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessingRequest(request.id);
              const therapistService = TherapistService.getInstance();

              await therapistService.rejectPatientRequest(request.id);

              // Update local state
              setRequests(prev =>
                prev.map(req =>
                  req.id === request.id
                    ? { ...req, status: 'rejected' as const }
                    : req
                )
              );

              Alert.alert('Success', 'Patient request rejected.');
            } catch (error) {
              console.error('Error rejecting request:', error);
              Alert.alert(
                'Error',
                'Failed to reject request. Please try again.'
              );
            } finally {
              setProcessingRequest(null);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return themeColors.warning;
      case 'accepted':
        return themeColors.success;
      case 'rejected':
        return themeColors.error;
      default:
        return themeColors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'accepted':
        return 'checkmark-circle-outline';
      case 'rejected':
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const renderRequestCard = (request: PatientRequest) => (
    <View
      key={request.id}
      style={[
        styles.requestCard,
        {
          backgroundColor: themeColors.surface,
          borderColor: themeColors.border,
        },
      ]}
    >
      <View style={styles.requestHeader}>
        <View style={styles.patientInfo}>
          <Ionicons name="person" size={24} color={themeColors.primary} />
          <View style={styles.patientDetails}>
            <Text style={[styles.patientName, { color: themeColors.text }]}>
              {request.patientName}
            </Text>
            <Text
              style={[
                styles.patientEmail,
                { color: themeColors.textSecondary },
              ]}
            >
              {request.patientEmail}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(request.status) },
          ]}
        >
          <Ionicons
            name={getStatusIcon(request.status)}
            size={16}
            color={themeColors.surface}
          />
          <Text style={[styles.statusText, { color: themeColors.text }]}>
            {request.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {request.message && (
        <View style={styles.messageSection}>
          <Text
            style={[styles.messageLabel, { color: themeColors.textSecondary }]}
          >
            Message:
          </Text>
          <Text style={[styles.messageText, { color: themeColors.text }]}>
            {request.message}
          </Text>
        </View>
      )}

      <View style={styles.dateSection}>
        <Text style={[styles.dateText, { color: themeColors.textSecondary }]}>
          Requested: {request.createdAt.toLocaleDateString()}
        </Text>
      </View>

      {request.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.acceptButton,
              { backgroundColor: themeColors.success },
            ]}
            onPress={() => handleAcceptRequest(request)}
            disabled={processingRequest === request.id}
          >
            {processingRequest === request.id ? (
              <ActivityIndicator size="small" color={themeColors.surface} />
            ) : (
              <>
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={themeColors.surface}
                />
                <Text
                  style={[styles.actionButtonText, { color: themeColors.text }]}
                >
                  Accept
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.rejectButton,
              { backgroundColor: themeColors.error },
            ]}
            onPress={() => handleRejectRequest(request)}
            disabled={processingRequest === request.id}
          >
            <Ionicons name="close" size={20} color={themeColors.surface} />
            <Text
              style={[styles.actionButtonText, { color: themeColors.text }]}
            >
              Reject
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: themeColors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={[styles.loadingText, { color: themeColors.text }]}>
            Loading patient requests...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <Text style={[styles.title, { color: themeColors.text }]}>
          Patient Requests
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadPatientRequests}
        >
          <Ionicons name="refresh" size={24} color={themeColors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {requests.length > 0 ? (
          <>
            <View
              style={[
                styles.summarySection,
                {
                  backgroundColor: themeColors.surface,
                  borderColor: themeColors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.summaryText,
                  { color: themeColors.textSecondary },
                ]}
              >
                {requests.filter(r => r.status === 'pending').length} pending
                requests
              </Text>
              <Text
                style={[
                  styles.summaryText,
                  { color: themeColors.textSecondary },
                ]}
              >
                {requests.filter(r => r.status === 'accepted').length} accepted
              </Text>
              <Text
                style={[
                  styles.summaryText,
                  { color: themeColors.textSecondary },
                ]}
              >
                {requests.filter(r => r.status === 'rejected').length} rejected
              </Text>
            </View>

            {requests.map(renderRequestCard)}
          </>
        ) : (
          <View
            style={[
              styles.emptyContainer,
              { backgroundColor: themeColors.background },
            ]}
          >
            <Ionicons
              name="people-outline"
              size={64}
              color={themeColors.textSecondary}
            />
            <Text style={[styles.emptyTitle, { color: themeColors.text }]}>
              No Patient Requests
            </Text>
            <Text
              style={[styles.emptyText, { color: themeColors.textSecondary }]}
            >
              You don't have any patient collaboration requests yet.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor will be set dynamically based on theme
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.MD,
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    // color will be set dynamically based on theme
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderBottomWidth: 1,
    // borderBottomColor will be set dynamically based on theme
  },
  title: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.TITLE),
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    // color will be set dynamically based on theme
  },
  refreshButton: {
    padding: SPACING.SM,
  },
  content: {
    flex: 1,
    padding: SPACING.LG,
  },
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    // backgroundColor, borderColor will be set dynamically based on theme
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    marginBottom: SPACING.LG,
  },
  summaryText: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.SMALL),
    // color will be set dynamically based on theme
    textAlign: 'center',
  },
  requestCard: {
    // backgroundColor, borderColor will be set dynamically based on theme
    padding: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    marginBottom: SPACING.MD,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.MD,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  patientDetails: {
    marginLeft: SPACING.SM,
    flex: 1,
  },
  patientName: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.LARGE),
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    // color will be set dynamically based on theme
  },
  patientEmail: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.SMALL),
    // color will be set dynamically based on theme
    marginTop: SPACING.XS,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
  },
  statusText: {
    // color will be set dynamically based on theme
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.XS),
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    marginLeft: SPACING.XS,
  },
  messageSection: {
    marginBottom: SPACING.MD,
  },
  messageLabel: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.SMALL),
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    // color will be set dynamically based on theme
    marginBottom: SPACING.XS,
  },
  messageText: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    // color will be set dynamically based on theme
    lineHeight: 20,
  },
  dateSection: {
    marginBottom: SPACING.MD,
  },
  dateText: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.SMALL),
    // color will be set dynamically based on theme
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.SM,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
  },
  acceptButton: {
    // backgroundColor will be set dynamically based on theme
  },
  rejectButton: {
    // backgroundColor will be set dynamically based on theme
  },
  actionButtonText: {
    // color will be set dynamically based on theme
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    marginLeft: SPACING.SM,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.XL,
    // backgroundColor will be set dynamically based on theme
  },
  emptyTitle: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.LARGE),
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    // color will be set dynamically based on theme
    marginTop: SPACING.MD,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    // color will be set dynamically based on theme
    marginTop: SPACING.SM,
    textAlign: 'center',
    lineHeight: 20,
  },
});
