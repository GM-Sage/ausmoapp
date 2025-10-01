// User Management Screen
// Admin interface for managing users, roles, and permissions

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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import { User, UserRole } from '../../types';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import {
  setUsers,
  updateUser,
  deleteUser,
  serializeUser,
} from '../../store/slices/userSlice';
import { SupabaseDatabaseService } from '../../services/supabaseDatabaseService';

export default function UserManagementScreen() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const dispatch = useDispatch();
  const users = useSelector((state: RootState) => state.user.users);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const allUsers =
        await SupabaseDatabaseService.getInstance().getAllUsers();
      dispatch(setUsers(allUsers.map(serializeUser)));
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = (user: User) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await SupabaseDatabaseService.getInstance().deleteUser(user.id);
              dispatch(deleteUser(user.id));
              Alert.alert('Success', 'User deleted successfully');
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  const handleUpdateUserRole = async (user: User, newRole: UserRole) => {
    try {
      const updatedUser = { ...user, role: newRole, updatedAt: new Date() };
      await SupabaseDatabaseService.getInstance().updateUser(updatedUser);
      dispatch(updateUser(updatedUser));
      Alert.alert('Success', `User role updated to ${newRole}`);
    } catch (error) {
      console.error('Error updating user role:', error);
      Alert.alert('Error', 'Failed to update user role');
    }
  };

  const renderUserCard = (user: User) => (
    <View key={user.id} style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>
            {user.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.roleContainer}>
            <Text style={styles.roleLabel}>Role:</Text>
            <TouchableOpacity
              style={[
                styles.roleBadge,
                { backgroundColor: getRoleColor(user.role) },
              ]}
              onPress={() => {
                Alert.alert('Change Role', 'Select new role for this user:', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Child',
                    onPress: () => handleUpdateUserRole(user, 'child'),
                  },
                  {
                    text: 'Parent',
                    onPress: () => handleUpdateUserRole(user, 'parent'),
                  },
                  {
                    text: 'Therapist',
                    onPress: () => handleUpdateUserRole(user, 'therapist'),
                  },
                  {
                    text: 'Admin',
                    onPress: () => handleUpdateUserRole(user, 'admin'),
                  },
                ]);
              }}
            >
              <Text style={styles.roleText}>{user.role}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditUser(user)}
        >
          <Ionicons name="create" size={20} color={themeColors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteUser(user)}
        >
          <Ionicons name="trash" size={20} color={themeColors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const getRoleColor = (role: UserRole) => {
    const colors = {
      child: themeColors.success,
      parent: themeColors.primary,
      therapist: themeColors.secondary,
      admin: themeColors.warning,
    };
    return colors[role];
  };

  const getRoleStats = () => {
    const stats = {
      child: 0,
      parent: 0,
      therapist: 0,
      admin: 0,
    };

    users.forEach(user => {
      stats[user.role]++;
    });

    return stats;
  };

  const roleStats = getRoleStats();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>User Management</Text>
          <Text style={styles.subtitle}>
            Manage users, roles, and permissions
          </Text>
        </View>

        {/* Role Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Statistics</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{roleStats.child}</Text>
              <Text style={styles.statLabel}>Children</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{roleStats.parent}</Text>
              <Text style={styles.statLabel}>Parents</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{roleStats.therapist}</Text>
              <Text style={styles.statLabel}>Therapists</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{roleStats.admin}</Text>
              <Text style={styles.statLabel}>Admins</Text>
            </View>
          </View>
        </View>

        {/* Users List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Users ({users.length})</Text>
          {isLoading ? (
            <Text style={styles.loadingText}>Loading users...</Text>
          ) : users.length === 0 ? (
            <Text style={styles.emptyText}>No users found</Text>
          ) : (
            users.map(renderUserCard)
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
    color: themeColors.text,
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
    color: themeColors.text,
    marginBottom: SPACING.MD,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: themeColors.surface,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
    marginHorizontal: SPACING.XS,
  },
  statNumber: {
    ...TYPOGRAPHY.HEADING_LARGE,
    color: themeColors.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TYPOGRAPHY.BODY_SMALL,
    color: themeColors.textSecondary,
    marginTop: SPACING.XS,
  },
  userCard: {
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: themeColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.MD,
  },
  userAvatarText: {
    ...TYPOGRAPHY.HEADING_MEDIUM,
    color: themeColors.surface,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    ...TYPOGRAPHY.BODY_LARGE,
    color: themeColors.text,
    fontWeight: '600',
  },
  userEmail: {
    ...TYPOGRAPHY.BODY_SMALL,
    color: themeColors.textSecondary,
    marginTop: SPACING.XS,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.XS,
  },
  roleLabel: {
    ...TYPOGRAPHY.BODY_SMALL,
    color: themeColors.textSecondary,
    marginRight: SPACING.XS,
  },
  roleBadge: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
  },
  roleText: {
    ...TYPOGRAPHY.BODY_SMALL,
    color: themeColors.surface,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  userActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: SPACING.SM,
    marginLeft: SPACING.SM,
  },
  loadingText: {
    ...TYPOGRAPHY.BODY_MEDIUM,
    color: themeColors.textSecondary,
    textAlign: 'center',
    padding: SPACING.LG,
  },
  emptyText: {
    ...TYPOGRAPHY.BODY_MEDIUM,
    color: themeColors.textSecondary,
    textAlign: 'center',
    padding: SPACING.LG,
  },
});
