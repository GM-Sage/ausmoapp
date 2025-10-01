// Settings Screen

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import {
  setCurrentUser,
  deserializeUserForService,
} from '../../store/slices/userSlice';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import { SettingsSafeArea } from '../../components/common/SafeAreaWrapper';
import { useSettingsSafeArea } from '../../hooks/useSafeArea';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { getThemeColors } from '../../utils/themeUtils';

interface SettingsScreenProps {
  navigation?: any;
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const users = useSelector((state: RootState) => state.user.users);
  const dispatch = useDispatch();
  const safeArea = useSettingsSafeArea();
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const styles = getStyles(themeColors);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          dispatch(setCurrentUser(null));
        },
      },
    ]);
  };

  const settingsItems = [
    {
      id: 'user',
      title: 'User Settings',
      description: 'Manage user profile and preferences',
      icon: 'person',
      color: themeColors.primary,
      onPress: () => navigation?.navigate('UserSettings'),
    },
    {
      id: 'accessibility',
      title: 'Accessibility',
      description:
        'Switch scanning, visual indicators, and accessibility options',
      icon: 'accessibility',
      color: themeColors.secondary,
      onPress: () => navigation?.navigate('AccessibilitySettings'),
    },
    {
      id: 'audio',
      title: 'Audio Settings',
      description: 'Voice, volume, and audio feedback settings',
      icon: 'volume-high',
      color: themeColors.warning,
      onPress: () => navigation?.navigate('AudioSettings'),
    },
    {
      id: 'visual',
      title: 'Visual Settings',
      description: 'Colors, themes, and visual customization',
      icon: 'color-palette',
      color: themeColors.success,
      onPress: () => navigation?.navigate('VisualSettings'),
    },
    {
      id: 'backup',
      title: 'Backup & Sync',
      description: 'Export and import communication books',
      icon: 'cloud-upload',
      color: themeColors.info,
      onPress: () => navigation?.navigate('BackupSettings'),
    },
    {
      id: 'analytics',
      title: 'Analytics & Progress',
      description: 'View usage statistics and progress reports',
      icon: 'analytics',
      color: themeColors.warning,
      onPress: () => navigation?.navigate('Analytics'),
    },
    {
      id: 'performance',
      title: 'Performance',
      description: 'Monitor and optimize app performance',
      icon: 'speedometer',
      color: themeColors.warning,
      onPress: () => navigation?.navigate('Performance'),
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      description: 'Data encryption, COPPA compliance, and privacy settings',
      icon: 'shield-checkmark',
      color: themeColors.error,
      onPress: () => navigation?.navigate('SecuritySettings'),
    },
    {
      id: 'privacy',
      title: 'Privacy & Data Management',
      description: 'GDPR compliance, data export, and deletion controls',
      icon: 'lock-closed',
      color: themeColors.success,
      onPress: () => navigation?.navigate('PrivacyManagement'),
    },
    {
      id: 'localization',
      title: 'Language & Localization',
      description: 'Multi-language support and cultural sensitivity',
      icon: 'globe',
      color: themeColors.info,
      onPress: () => navigation?.navigate('LocalizationSettings'),
    },
    {
      id: 'express',
      title: 'Express Page Settings',
      description: 'Advanced express page features and customization',
      icon: 'chatbubbles',
      color: themeColors.primary,
      onPress: () => navigation?.navigate('ExpressSettings'),
    },
    {
      id: 'autism',
      title: 'Autism-Optimized Settings',
      description: 'Settings specifically designed for children with autism',
      icon: 'heart',
      color: themeColors.primary,
      onPress: () => navigation?.navigate('AutismOptimizedSettings'),
    },
    // Parent-specific settings
    ...(currentUser?.role === 'parent'
      ? [
          {
            id: 'parentAccess',
            title: 'Parent Access Code',
            description:
              'Generate codes to switch back to your account from child device',
            icon: 'key',
            color: themeColors.success,
            onPress: () => navigation?.navigate('ParentAccessCodeGenerator'),
          },
        ]
      : []),
    {
      id: 'advanced',
      title: 'Advanced Settings',
      description: 'Experimental features and advanced options',
      icon: 'settings',
      color: themeColors.warning,
      onPress: () => navigation?.navigate('AdvancedSettings'),
    },
    {
      id: 'onboarding',
      title: 'Onboarding & Tutorials',
      description: 'Interactive tutorials and user guidance',
      icon: 'book',
      color: themeColors.secondary,
      onPress: () => navigation?.navigate('Onboarding'),
    },
    {
      id: 'about',
      title: 'About Ausmo',
      description: 'Version information and help',
      icon: 'information-circle',
      color: themeColors.textSecondary,
      onPress: () =>
        Alert.alert(
          'About Ausmo',
          'Version 1.0.0\nComplete AAC Communication App for Children with Autism'
        ),
    },
    // Child profile creation - only for parents
    ...(currentUser?.role === 'parent'
      ? [
          {
            id: 'createChild',
            title: 'Create Child Profile',
            description:
              'Add a new child profile (name only, no email required)',
            icon: 'person-add',
            color: themeColors.primary,
            onPress: () => navigation?.navigate('CreateChildProfile'),
          },
          {
            id: 'switchChild',
            title: 'Switch to Child Profile',
            description: "Select and switch to a child's profile",
            icon: 'people',
            color: themeColors.secondary,
            onPress: () => navigation?.navigate('ChildProfileSelection'),
          },
        ]
      : []),
    // Switch back to parent - only for children
    ...(currentUser?.role === 'child'
      ? [
          {
            id: 'switchToParent',
            title: 'Switch to Parent Profile',
            description: 'Return to parent profile',
            icon: 'arrow-back',
            color: themeColors.warning,
            onPress: () => {
              // Find the parent profile and switch to it
              const parentProfile = users.find(user => user.role === 'parent');
              if (parentProfile) {
                dispatch(
                  setCurrentUser(deserializeUserForService(parentProfile))
                );
              } else {
                Alert.alert('Error', 'Parent profile not found');
              }
            },
          },
        ]
      : []),
    {
      id: 'logout',
      title: 'Logout',
      description: 'Sign out of your account',
      icon: 'log-out',
      color: themeColors.error,
      onPress: handleLogout,
    },
  ];

  const renderSettingItem = (item: (typeof settingsItems)[0]) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.settingItem,
        {
          backgroundColor: themeColors.surface,
          borderColor: themeColors.border,
        },
      ]}
      onPress={item.onPress}
      accessible={true}
      accessibilityLabel={item.title}
      accessibilityRole="button"
      accessibilityHint={item.description}
    >
      <View style={[styles.settingIcon, { backgroundColor: item.color }]}>
        <Ionicons
          name={item.icon as any}
          size={24}
          color={themeColors.surface}
        />
      </View>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingTitle, { color: themeColors.text }]}>
          {item.title}
        </Text>
        <Text
          style={[
            styles.settingDescription,
            { color: themeColors.textSecondary },
          ]}
        >
          {item.description}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={24}
        color={themeColors.textSecondary}
      />
    </TouchableOpacity>
  );

  return (
    <SettingsSafeArea
      style={[styles.container, { backgroundColor: themeColors.background }]}
      statusBarStyle="light-content"
      statusBarBackgroundColor={themeColors.primary}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColors.primary }]}>
        <Text style={[styles.title, { color: themeColors.text }]}>
          Settings
        </Text>
        {currentUser && (
          <Text style={[styles.userInfo, { color: themeColors.textSecondary }]}>
            Hello {currentUser.name}
          </Text>
        )}
      </View>

      {/* Settings List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      >
        {settingsItems.map(renderSettingItem)}
      </ScrollView>
    </SettingsSafeArea>
  );
}

  const getStyles = (themeColors: any) => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    header: {
      backgroundColor: themeColors.primary,
      paddingHorizontal: SPACING.MD,
      paddingVertical: SPACING.MD,
    },
    title: {
      fontSize: TYPOGRAPHY.FONT_SIZES.TITLE,
      fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
      color: themeColors.surface,
    marginBottom: SPACING.XS,
  },
  userInfo: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.surface,
    opacity: 0.8,
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: SPACING.LG,
    paddingTop: SPACING.MD,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.surface,
    padding: SPACING.MD,
    marginBottom: SPACING.SM,
    borderRadius: BORDER_RADIUS.MEDIUM,
    shadowColor: themeColors.text_PRIMARY,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.MD,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.text_PRIMARY,
    marginBottom: 2,
  },
    settingDescription: {
      fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
      color: themeColors.textSecondary,
      lineHeight: TYPOGRAPHY.LINE_HEIGHTS.NORMAL * TYPOGRAPHY.FONT_SIZES.MEDIUM,
    },
  });
