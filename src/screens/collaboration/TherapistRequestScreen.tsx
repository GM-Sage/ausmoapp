// Therapist Request Screen
// Shows pending requests from patients and allows therapists to accept/decline

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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import { SupabaseDatabaseService } from '../../services/supabaseDatabaseService';

interface TherapistRequest {
  id: string;
  patientId: string;
  therapistId: string;
  patientName: string;
  therapistName: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  updatedAt: string;
}

export default function TherapistRequestScreen() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [requests, setRequests] = useState<TherapistRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<
    'pending' | 'accepted' | 'declined'
  >('pending');

  useEffect(() => {
    if (currentUser) {
      loadRequests();
    }
  }, [currentUser]);

  const loadRequests = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      const allRequests =
        await SupabaseDatabaseService.getInstance().getTherapistRequests(
          currentUser.id
        );
      setRequests(allRequests);
    } catch (error) {
      console.error('Error loading requests:', error);
      Alert.alert('Error', 'Failed to load requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (request: TherapistRequest) => {
    Alert.alert(
      'Accept Request',
      `Accept collaboration request from ${request.patientName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              const updatedRequest = {
                ...request,
                status: 'accepted' as const,
                updatedAt: new Date().toISOString(),
              };

              await SupabaseDatabaseService.getInstance().updateTherapistRequest(
                updatedRequest
              );

              // Create therapist-patient relationship
              await SupabaseDatabaseService.getInstance().createTherapistPatientRelationship(
                {
                  id: `relationship-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  therapistId: currentUser.id,
                  patientId: request.patientId,
                  therapistName: currentUser.name,
                  patientName: request.patientName,
                  status: 'active',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              );

              Alert.alert(
                'Request Accepted!',
                `You are now collaborating with ${request.patientName}. You can start creating therapy sessions and managing their progress.`,
                [{ text: 'OK' }]
              );

              loadRequests(); // Refresh the list
            } catch (error) {
              console.error('Error accepting request:', error);
              Alert.alert(
                'Error',
                'Failed to accept request. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  const handleDeclineRequest = async (request: TherapistRequest) => {
    Alert.alert(
      'Decline Request',
      `Decline collaboration request from ${request.patientName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedRequest = {
                ...request,
                status: 'declined' as const,
                updatedAt: new Date().toISOString(),
              };

              await SupabaseDatabaseService.getInstance().updateTherapistRequest(
                updatedRequest
              );

              Alert.alert(
                'Request Declined',
                `You have declined the request from ${request.patientName}.`,
                [{ text: 'OK' }]
              );

              loadRequests(); // Refresh the list
            } catch (error) {
              console.error('Error declining request:', error);
              Alert.alert(
                'Error',
                'Failed to decline request. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  const getFilteredRequests = () => {
    return requests.filter(request => request.status === selectedTab);
  };

  const getRequestCounts = () => {
    return {
      pending: requests.filter(r => r.status === 'pending').length,
      accepted: requests.filter(r => r.status === 'accepted').length,
      declined: requests.filter(r => r.status === 'declined').length,
    };
  };

  const renderRequestCard = (request: TherapistRequest) => (
    <View key={request.id} style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.patientAvatar}>
          <Text style={styles.patientAvatarText}>
            {request.patientName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.requestInfo}>
          <Text style={styles.patientName}>{request.patientName}</Text>
          <Text style={styles.requestDate}>
            {new Date(request.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(request.status) },
          ]}
        >
          <Text style={styles.statusText}>{request.status}</Text>
        </View>
      </View>

      <Text style={styles.requestMessage}>{request.message}</Text>

      {request.status === 'pending' && (
        <View style={styles.requestActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleAcceptRequest(request)}
          >
            <Ionicons name="checkmark" size={20} color={themeColors.surface} />
            <Text style={styles.actionButtonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.declineButton]}
            onPress={() => handleDeclineRequest(request)}
          >
            <Ionicons name="close" size={20} color={themeColors.surface} />
            <Text style={styles.actionButtonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const getStatusColor = (status: string) => {
    const colors = {
      pending: themeColors.warning,
      accepted: themeColors.success,
      declined: themeColors.error,
    };
    return colors[status as keyof typeof colors];
  };

  const counts = getRequestCounts();
  const filteredRequests = getFilteredRequests();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Collaboration Requests</Text>
          <Text style={styles.subtitle}>
            Manage requests from patients seeking therapy collaboration
          </Text>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'pending' && styles.activeTab]}
            onPress={() => setSelectedTab('pending')}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'pending' && styles.activeTabText,
              ]}
            >
              Pending ({counts.pending})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'accepted' && styles.activeTab]}
            onPress={() => setSelectedTab('accepted')}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'accepted' && styles.activeTabText,
              ]}
            >
              Accepted ({counts.accepted})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'declined' && styles.activeTab]}
            onPress={() => setSelectedTab('declined')}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'declined' && styles.activeTabText,
              ]}
            >
              Declined ({counts.declined})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Requests List */}
        <View style={styles.section}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={themeColors.primary} />
              <Text style={styles.loadingText}>Loading requests...</Text>
            </View>
          ) : filteredRequests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="mail"
                size={48}
                color={themeColors.textSecondary}
              />
              <Text style={styles.emptyText}>No {selectedTab} requests</Text>
              <Text style={styles.emptySubtext}>
                {selectedTab === 'pending'
                  ? 'New requests from patients will appear here'
                  : `No ${selectedTab} requests at this time`}
              </Text>
            </View>
          ) : (
            filteredRequests.map(renderRequestCard)
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.XS,
    marginBottom: SPACING.LG,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.SM,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.SM,
  },
  activeTab: {
    backgroundColor: themeColors.primary,
  },
  tabText: {
    ...TYPOGRAPHY.BODY_MEDIUM,
    color: themeColors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: themeColors.surface,
  },
  section: {
    marginBottom: SPACING.XL,
  },
  requestCard: {
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  patientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: themeColors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.MD,
  },
  patientAvatarText: {
    ...TYPOGRAPHY.BODY_LARGE,
    color: themeColors.surface,
    fontWeight: 'bold',
  },
  requestInfo: {
    flex: 1,
  },
  patientName: {
    ...TYPOGRAPHY.BODY_LARGE,
    color: themeColors.text_PRIMARY,
    fontWeight: '600',
  },
  requestDate: {
    ...TYPOGRAPHY.BODY_SMALL,
    color: themeColors.textSecondary,
    marginTop: SPACING.XS,
  },
  statusBadge: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
  },
  statusText: {
    ...TYPOGRAPHY.BODY_SMALL,
    color: themeColors.surface,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  requestMessage: {
    ...TYPOGRAPHY.BODY_MEDIUM,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.MD,
    lineHeight: 20,
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.MD,
    marginHorizontal: SPACING.XS,
  },
  acceptButton: {
    backgroundColor: themeColors.success,
  },
  declineButton: {
    backgroundColor: themeColors.error,
  },
  actionButtonText: {
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
