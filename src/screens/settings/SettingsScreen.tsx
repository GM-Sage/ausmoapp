// Settings Screen

import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import { SettingsSafeArea } from '../../components/common/SafeAreaWrapper';
import { useSettingsSafeArea } from '../../hooks/useSafeArea';

interface SettingsScreenProps {
  navigation?: any;
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const safeArea = useSettingsSafeArea();

  const settingsItems = [
    {
      id: 'user',
      title: 'User Settings',
      description: 'Manage user profile and preferences',
      icon: 'person',
      color: COLORS.PRIMARY,
      onPress: () => navigation?.navigate('UserSettings'),
    },
    {
      id: 'accessibility',
      title: 'Accessibility',
      description: 'Switch scanning, visual indicators, and accessibility options',
      icon: 'accessibility',
      color: COLORS.SECONDARY,
      onPress: () => navigation?.navigate('AccessibilitySettings'),
    },
    {
      id: 'audio',
      title: 'Audio Settings',
      description: 'Voice, volume, and audio feedback settings',
      icon: 'volume-high',
      color: COLORS.WARNING,
      onPress: () => navigation?.navigate('AudioSettings'),
    },
    {
      id: 'visual',
      title: 'Visual Settings',
      description: 'Colors, themes, and visual customization',
      icon: 'color-palette',
      color: COLORS.SUCCESS,
      onPress: () => navigation?.navigate('VisualSettings'),
    },
    {
      id: 'backup',
      title: 'Backup & Sync',
      description: 'Export and import communication books',
      icon: 'cloud-upload',
      color: COLORS.INFO,
      onPress: () => navigation?.navigate('BackupSettings'),
    },
    {
      id: 'analytics',
      title: 'Analytics & Progress',
      description: 'View usage statistics and progress reports',
      icon: 'analytics',
      color: COLORS.WARNING,
      onPress: () => navigation?.navigate('Analytics'),
    },
    {
      id: 'performance',
      title: 'Performance',
      description: 'Monitor and optimize app performance',
      icon: 'speedometer',
      color: COLORS.WARNING,
      onPress: () => navigation?.navigate('Performance'),
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      description: 'Data encryption, COPPA compliance, and privacy settings',
      icon: 'shield-checkmark',
      color: COLORS.ERROR,
      onPress: () => navigation?.navigate('SecuritySettings'),
    },
    {
      id: 'localization',
      title: 'Language & Localization',
      description: 'Multi-language support and cultural sensitivity',
      icon: 'globe',
      color: COLORS.INFO,
      onPress: () => navigation?.navigate('LocalizationSettings'),
    },
    {
      id: 'onboarding',
      title: 'Onboarding & Tutorials',
      description: 'Interactive tutorials and user guidance',
      icon: 'book',
      color: COLORS.SECONDARY,
      onPress: () => navigation?.navigate('Onboarding'),
    },
    {
      id: 'about',
      title: 'About Ausmo',
      description: 'Version information and help',
      icon: 'information-circle',
      color: COLORS.TEXT_SECONDARY,
      onPress: () => Alert.alert('About Ausmo', 'Version 1.0.0\nComplete AAC Communication App for Children with Autism'),
    },
  ];

  const renderSettingItem = (item: typeof settingsItems[0]) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={item.onPress}
      accessible={true}
      accessibilityLabel={item.title}
      accessibilityRole="button"
      accessibilityHint={item.description}
    >
      <View style={[styles.settingIcon, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon as any} size={24} color={COLORS.SURFACE} />
      </View>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{item.title}</Text>
        <Text style={styles.settingDescription}>{item.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={COLORS.TEXT_SECONDARY} />
    </TouchableOpacity>
  );

  return (
    <SettingsSafeArea 
      style={styles.container}
      statusBarStyle="light-content"
      statusBarBackgroundColor={COLORS.PRIMARY}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        {currentUser && (
          <Text style={styles.userInfo}>Hello {currentUser.name}</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.MD,
  },
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZES.TITLE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.SURFACE,
    marginBottom: SPACING.XS,
  },
  userInfo: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.SURFACE,
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
    backgroundColor: COLORS.SURFACE,
    padding: SPACING.MD,
    marginBottom: SPACING.SM,
    borderRadius: BORDER_RADIUS.MEDIUM,
    shadowColor: COLORS.TEXT_PRIMARY,
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
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.NORMAL * TYPOGRAPHY.FONT_SIZES.MEDIUM,
  },
});
