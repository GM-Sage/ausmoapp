// Admin Dashboard Screen
// System administration and user management

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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { RootState } from '../../store';
import { UserRole } from '../../types';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';

export default function AdminDashboardScreen() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const navigation = useNavigation();
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeTherapists: 0,
    activePatients: 0,
    totalSessions: 0,
  });

  useEffect(() => {
    loadSystemStats();
  }, []);

  const loadSystemStats = async () => {
    try {
      // This would typically load from the database
      setSystemStats({
        totalUsers: 156,
        activeTherapists: 23,
        activePatients: 89,
        totalSessions: 1247,
      });
    } catch (error) {
      console.error('Error loading system stats:', error);
      Alert.alert('Error', 'Failed to load system statistics');
    }
  };

  const handleUserManagement = () => {
    // Navigate to user management screen
    navigation.navigate('UserManagement' as never);
  };

  const handleSystemSettings = () => {
    // Navigate to system settings screen
    navigation.navigate('SystemSettings' as never);
  };

  const handleAnalytics = () => {
    // Navigate to analytics screen
    navigation.navigate('Analytics' as never);
  };

  const handleBackupRestore = () => {
    // Navigate to backup/restore screen
    navigation.navigate('BackupRestore' as never);
  };

  const renderSystemStats = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>System Overview</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="people" size={32} color={themeColors.primary} />
          <Text style={styles.statNumber}>{systemStats.totalUsers}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="medical" size={32} color={themeColors.secondary} />
          <Text style={styles.statNumber}>{systemStats.activeTherapists}</Text>
          <Text style={styles.statLabel}>Active Therapists</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="happy" size={32} color={themeColors.success} />
          <Text style={styles.statNumber}>{systemStats.activePatients}</Text>
          <Text style={styles.statLabel}>Active Patients</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="calendar" size={32} color={themeColors.warning} />
          <Text style={styles.statNumber}>{systemStats.totalSessions}</Text>
          <Text style={styles.statLabel}>Total Sessions</Text>
        </View>
      </View>
    </View>
  );

  const renderAdminActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Administration</Text>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={handleUserManagement}
      >
        <Ionicons name="people" size={24} color={themeColors.primary} />
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>User Management</Text>
          <Text style={styles.actionDescription}>
            Manage users, roles, and permissions
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={themeColors.textSecondary}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={handleSystemSettings}
      >
        <Ionicons name="shield" size={24} color={themeColors.secondary} />
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>System Settings</Text>
          <Text style={styles.actionDescription}>
            Configure system-wide settings
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={themeColors.textSecondary}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionCard} onPress={handleAnalytics}>
        <Ionicons name="analytics" size={24} color={themeColors.success} />
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Analytics & Reports</Text>
          <Text style={styles.actionDescription}>
            View system usage and performance
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={themeColors.textSecondary}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionCard} onPress={handleBackupRestore}>
        <Ionicons name="cloud-upload" size={24} color={themeColors.warning} />
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Backup & Restore</Text>
          <Text style={styles.actionDescription}>
            Manage data backups and restoration
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={themeColors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );

  const renderRecentActivity = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recent System Activity</Text>

      <View style={styles.activityCard}>
        <Ionicons name="person-add" size={24} color={themeColors.success} />
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>New User Registered</Text>
          <Text style={styles.activityDescription}>
            Dr. Sarah Johnson registered as Speech Therapist
          </Text>
          <Text style={styles.activityTime}>2 hours ago</Text>
        </View>
      </View>

      <View style={styles.activityCard}>
        <Ionicons name="medical" size={24} color={themeColors.primary} />
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>Therapy Session Completed</Text>
          <Text style={styles.activityDescription}>
            Emma Johnson completed Speech Therapy session
          </Text>
          <Text style={styles.activityTime}>4 hours ago</Text>
        </View>
      </View>

      <View style={styles.activityCard}>
        <Ionicons name="trophy" size={24} color={themeColors.warning} />
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>Goal Mastered</Text>
          <Text style={styles.activityDescription}>
            Alex Chen mastered "Request Preferred Items" goal
          </Text>
          <Text style={styles.activityTime}>1 day ago</Text>
        </View>
      </View>
    </View>
  );

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Access denied. Admin privileges required.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderSystemStats()}
        {renderAdminActions()}
        {renderRecentActivity()}
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
  section: {
    marginBottom: SPACING.XL,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.MD,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: themeColors.surface,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
    marginBottom: SPACING.MD,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  statNumber: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XLARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginTop: SPACING.SM,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.XS,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.surface,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: themeColors.border,
    marginBottom: SPACING.SM,
  },
  actionContent: {
    flex: 1,
    marginLeft: SPACING.SM,
  },
  actionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  actionDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: themeColors.surface,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: themeColors.border,
    marginBottom: SPACING.SM,
  },
  activityContent: {
    flex: 1,
    marginLeft: SPACING.SM,
  },
  activityTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  activityDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginBottom: SPACING.XS,
  },
  activityTime: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  errorText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.error,
    textAlign: 'center',
    marginTop: SPACING.XL,
  },
});
