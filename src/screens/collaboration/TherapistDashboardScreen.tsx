// Therapist Dashboard Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import CollaborationService, { 
  TherapistDashboard, 
  TherapistPatient, 
  TherapistNotification,
  CollaborationSession 
} from '../../services/collaborationService';
import { ScreenSafeArea } from '../../components/common/SafeAreaWrapper';
import { useSafeArea } from '../../hooks/useSafeArea';

const { width } = Dimensions.get('window');

export default function TherapistDashboardScreen() {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [collaborationService] = useState(() => CollaborationService.getInstance());
  const safeArea = useSafeArea();
  const [dashboard, setDashboard] = useState<TherapistDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'patients' | 'sessions' | 'notifications'>('overview');

  useEffect(() => {
    if (currentUser) {
      loadDashboard();
    }
  }, [currentUser]);

  const loadDashboard = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      const dashboardData = await collaborationService.getTherapistDashboard(currentUser.id);
      setDashboard(dashboardData);
    } catch (error) {
      console.error('Error loading therapist dashboard:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSession = () => {
    Alert.alert('Create Session', 'Session creation functionality coming soon');
  };

  const handleStartRemoteSupport = () => {
    Alert.alert('Remote Support', 'Remote support functionality coming soon');
  };

  const handlePatientPress = (patient: TherapistPatient) => {
    Alert.alert('Patient Details', `View details for ${patient.name}`);
  };

  const handleSessionPress = (session: CollaborationSession) => {
    Alert.alert('Session Details', `View details for ${session.name}`);
  };

  const handleNotificationPress = (notification: TherapistNotification) => {
    Alert.alert('Notification', notification.message);
  };

  const renderOverview = () => {
    if (!dashboard) return null;

    const { analytics } = dashboard;

    return (
      <View style={styles.overviewContainer}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="people" size={24} color={COLORS.PRIMARY} />
            <Text style={styles.statValue}>{analytics.totalPatients}</Text>
            <Text style={styles.statLabel}>Total Patients</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="videocam" size={24} color={COLORS.SUCCESS} />
            <Text style={styles.statValue}>{analytics.activeSessions}</Text>
            <Text style={styles.statLabel}>Active Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time" size={24} color={COLORS.WARNING} />
            <Text style={styles.statValue}>{analytics.averageSessionDuration}m</Text>
            <Text style={styles.statLabel}>Avg Duration</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton} onPress={handleCreateSession}>
              <Ionicons name="add-circle" size={32} color={COLORS.PRIMARY} />
              <Text style={styles.quickActionText}>Create Session</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton} onPress={handleStartRemoteSupport}>
              <Ionicons name="videocam" size={32} color={COLORS.SUCCESS} />
              <Text style={styles.quickActionText}>Remote Support</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton} onPress={() => setSelectedTab('patients')}>
              <Ionicons name="person" size={32} color={COLORS.WARNING} />
              <Text style={styles.quickActionText}>View Patients</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton} onPress={() => setSelectedTab('sessions')}>
              <Ionicons name="calendar" size={32} color={COLORS.INFO} />
              <Text style={styles.quickActionText}>Sessions</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Patient Progress */}
        <View style={styles.progressContainer}>
          <Text style={styles.sectionTitle}>Patient Progress</Text>
          {analytics.patientProgress.map((progress) => (
            <View key={progress.patientId} style={styles.progressItem}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressPatientName}>
                  {dashboard.patients.find(p => p.userId === progress.patientId)?.name || 'Unknown Patient'}
                </Text>
                <Text style={styles.progressValue}>{progress.progress}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${progress.progress}%` }
                  ]} 
                />
              </View>
              <View style={styles.progressTrend}>
                <Ionicons 
                  name={progress.trend === 'up' ? 'trending-up' : progress.trend === 'down' ? 'trending-down' : 'remove'} 
                  size={16} 
                  color={progress.trend === 'up' ? COLORS.SUCCESS : progress.trend === 'down' ? COLORS.ERROR : COLORS.TEXT_SECONDARY} 
                />
                <Text style={styles.progressTrendText}>{progress.trend}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Popular Symbols */}
        <View style={styles.symbolsContainer}>
          <Text style={styles.sectionTitle}>Popular Symbols</Text>
          <View style={styles.symbolsList}>
            {analytics.popularSymbols.map((symbol, index) => (
              <View key={index} style={styles.symbolItem}>
                <Text style={styles.symbolText}>{symbol.symbol}</Text>
                <Text style={styles.symbolUsage}>{symbol.usage} uses</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderPatients = () => {
    if (!dashboard) return null;

    return (
      <View style={styles.patientsContainer}>
        {dashboard.patients.map((patient) => (
          <TouchableOpacity
            key={patient.userId}
            style={styles.patientCard}
            onPress={() => handlePatientPress(patient)}
          >
            <View style={styles.patientHeader}>
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>{patient.name}</Text>
                <Text style={styles.patientAge}>Age {patient.age}</Text>
              </View>
              <View style={styles.patientStatus}>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: patient.communicationLevel === 'advanced' ? COLORS.SUCCESS : 
                                   patient.communicationLevel === 'intermediate' ? COLORS.WARNING : COLORS.INFO }
                ]}>
                  <Text style={styles.statusText}>{patient.communicationLevel}</Text>
                </View>
              </View>
            </View>
            
            <Text style={styles.patientDiagnosis}>{patient.diagnosis}</Text>
            
            <View style={styles.patientProgress}>
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Vocabulary</Text>
                <Text style={styles.progressValue}>{patient.progress.vocabularyGrowth}%</Text>
              </View>
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Efficiency</Text>
                <Text style={styles.progressValue}>{patient.progress.communicationEfficiency.toFixed(1)}</Text>
              </View>
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Goals</Text>
                <Text style={styles.progressValue}>{patient.progress.goalAchievements}/{patient.goals.length}</Text>
              </View>
            </View>

            <View style={styles.patientFooter}>
              <Text style={styles.lastSession}>
                Last session: {patient.lastSession.toLocaleDateString()}
              </Text>
              {patient.nextSession && (
                <Text style={styles.nextSession}>
                  Next: {patient.nextSession.toLocaleDateString()}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderSessions = () => {
    if (!dashboard) return null;

    return (
      <View style={styles.sessionsContainer}>
        {dashboard.sessions.map((session) => (
          <TouchableOpacity
            key={session.id}
            style={styles.sessionCard}
            onPress={() => handleSessionPress(session)}
          >
            <View style={styles.sessionHeader}>
              <Text style={styles.sessionName}>{session.name}</Text>
              <View style={[
                styles.sessionStatus,
                { backgroundColor: session.isActive ? COLORS.SUCCESS : COLORS.TEXT_SECONDARY }
              ]}>
                <Text style={styles.sessionStatusText}>
                  {session.isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
            
            <Text style={styles.sessionDescription}>{session.description}</Text>
            
            <View style={styles.sessionParticipants}>
              <Ionicons name="people" size={16} color={COLORS.TEXT_SECONDARY} />
              <Text style={styles.participantsText}>
                {session.participants.length} participants
              </Text>
            </View>

            <View style={styles.sessionFooter}>
              <Text style={styles.sessionDate}>
                Created: {session.createdAt.toLocaleDateString()}
              </Text>
              <Text style={styles.sessionUpdated}>
                Updated: {session.updatedAt.toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderNotifications = () => {
    if (!dashboard) return null;

    return (
      <View style={styles.notificationsContainer}>
        {dashboard.notifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            style={[
              styles.notificationCard,
              !notification.isRead && styles.notificationCardUnread
            ]}
            onPress={() => handleNotificationPress(notification)}
          >
            <View style={styles.notificationHeader}>
              <View style={[
                styles.notificationIcon,
                { backgroundColor: notification.priority === 'high' ? COLORS.ERROR : 
                                 notification.priority === 'medium' ? COLORS.WARNING : COLORS.INFO }
              ]}>
                <Ionicons 
                  name={notification.type === 'session_request' ? 'videocam' :
                        notification.type === 'progress_update' ? 'trending-up' :
                        notification.type === 'goal_achievement' ? 'trophy' : 'alert'} 
                  size={16} 
                  color={COLORS.SURFACE} 
                />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
              </View>
              <Text style={styles.notificationTime}>
                {notification.createdAt.toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'overview':
        return renderOverview();
      case 'patients':
        return renderPatients();
      case 'sessions':
        return renderSessions();
      case 'notifications':
        return renderNotifications();
      default:
        return renderOverview();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScreenSafeArea style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          { key: 'overview', label: 'Overview', icon: 'home' },
          { key: 'patients', label: 'Patients', icon: 'people' },
          { key: 'sessions', label: 'Sessions', icon: 'videocam' },
          { key: 'notifications', label: 'Alerts', icon: 'notifications' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              selectedTab === tab.key && styles.tabButtonSelected
            ]}
            onPress={() => setSelectedTab(tab.key as any)}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={20} 
              color={selectedTab === tab.key ? COLORS.SURFACE : COLORS.TEXT_SECONDARY} 
            />
            <Text style={[
              styles.tabButtonText,
              selectedTab === tab.key && styles.tabButtonTextSelected
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderTabContent()}
      </ScrollView>
    </ScreenSafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.MD,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    paddingTop: 10, // Add some top padding for better spacing
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.SM,
    gap: SPACING.XS,
  },
  tabButtonSelected: {
    backgroundColor: COLORS.PRIMARY,
  },
  tabButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  tabButtonTextSelected: {
    color: COLORS.SURFACE,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.MD,
  },
  overviewContainer: {
    gap: SPACING.LG,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.SM,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    alignItems: 'center',
    shadowColor: COLORS.TEXT_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginTop: SPACING.SM,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: SPACING.XS,
  },
  quickActionsContainer: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.MD,
  },
  quickActionButton: {
    width: (width - SPACING.MD * 3) / 2,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  quickActionText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_PRIMARY,
    marginTop: SPACING.SM,
    textAlign: 'center',
  },
  progressContainer: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
  },
  progressItem: {
    marginBottom: SPACING.MD,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.XS,
  },
  progressPatientName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
  },
  progressValue: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.PRIMARY,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.BORDER,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 4,
  },
  progressTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.XS,
    gap: SPACING.XS,
  },
  progressTrendText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  symbolsContainer: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
  },
  symbolsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM,
  },
  symbolItem: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.SM,
    padding: SPACING.SM,
    alignItems: 'center',
    minWidth: 80,
  },
  symbolText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
  },
  symbolUsage: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.XS,
  },
  patientsContainer: {
    gap: SPACING.MD,
  },
  patientCard: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    shadowColor: COLORS.TEXT_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  patientAge: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  patientStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
  },
  statusText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.SURFACE,
  },
  patientDiagnosis: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.MD,
  },
  patientProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.MD,
  },
  progressLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  patientFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lastSession: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  nextSession: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.PRIMARY,
  },
  sessionsContainer: {
    gap: SPACING.MD,
  },
  sessionCard: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    shadowColor: COLORS.TEXT_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  sessionName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  sessionStatus: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
  },
  sessionStatusText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.SURFACE,
  },
  sessionDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.SM,
  },
  sessionParticipants: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.XS,
    marginBottom: SPACING.SM,
  },
  participantsText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sessionDate: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  sessionUpdated: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  notificationsContainer: {
    gap: SPACING.MD,
  },
  notificationCard: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.BORDER,
  },
  notificationCardUnread: {
    borderLeftColor: COLORS.PRIMARY,
    backgroundColor: COLORS.BACKGROUND,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.SM,
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS,
  },
  notificationMessage: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  notificationTime: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
});
