// Backup Settings Screen - Configure backup and recovery settings

import React, { useState, useEffect } from 'react';
import { getThemeColors } from '../../utils/themeUtils';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import BackupRecoveryService, {
  BackupConfiguration,
  BackupMetadata,
} from '../../services/backupRecoveryService';
import { ScreenSafeArea } from '../../components/common/SafeAreaWrapper';

export default function BackupSettingsScreen({
  navigation,
}: {
  navigation?: any;
}) {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const [backupService] = useState(() => BackupRecoveryService.getInstance());
  const [backupConfig, setBackupConfig] = useState<BackupConfiguration | null>(
    null
  );
  const [backupHistory, setBackupHistory] = useState<BackupMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadBackupData();
  }, []);

  const loadBackupData = async () => {
    try {
      setIsLoading(true);
      const config = backupService.getBackupConfiguration();
      const history = backupService.getBackupHistory(10);

      setBackupConfig(config);
      setBackupHistory(history);
    } catch (error) {
      console.error('Error loading backup data:', error);
      Alert.alert('Error', 'Failed to load backup settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadBackupData();
    setIsRefreshing(false);
  };

  const updateBackupConfig = async (updates: Partial<BackupConfiguration>) => {
    if (!backupConfig) return;

    try {
      await backupService.updateBackupConfiguration(updates);
      setBackupConfig({ ...backupConfig, ...updates });
    } catch (error) {
      console.error('Error updating backup config:', error);
      Alert.alert('Error', 'Failed to update backup settings');
    }
  };

  const createManualBackup = async () => {
    try {
      setIsLoading(true);
      await backupService.createManualBackup();
      await loadBackupData();
      Alert.alert('Success', 'Manual backup created successfully');
    } catch (error) {
      console.error('Error creating manual backup:', error);
      Alert.alert('Error', 'Failed to create manual backup');
    } finally {
      setIsLoading(false);
    }
  };

  const restoreFromBackup = async (backupId: string) => {
    Alert.alert(
      'Restore Backup',
      'Are you sure you want to restore from this backup? This will overwrite current data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await backupService.restoreFromBackup(backupId);
              Alert.alert('Success', 'Backup restored successfully');
              await loadBackupData();
            } catch (error) {
              console.error('Error restoring backup:', error);
              Alert.alert('Error', 'Failed to restore backup');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatDate = (date: Date): string => {
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  };

  const getStatusColor = (status: BackupMetadata['status']): string => {
    switch (status) {
      case 'completed':
        return themeColors.success;
      case 'failed':
        return themeColors.error;
      case 'in_progress':
        return themeColors.warning;
      case 'cancelled':
        return themeColors.textSecondary;
      default:
        return themeColors.textSecondary;
    }
  };

  const getStatusIcon = (status: BackupMetadata['status']): string => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'failed':
        return 'close-circle';
      case 'in_progress':
        return 'time';
      case 'cancelled':
        return 'close';
      default:
        return 'help-circle';
    }
  };

  const renderBackupItem = ({ item }: { item: BackupMetadata }) => (
    <TouchableOpacity
      style={styles.backupItem}
      onPress={() => restoreFromBackup(item.id)}
      accessible={true}
      accessibilityLabel={`Backup from ${formatDate(item.timestamp)}, ${formatFileSize(item.size)}`}
    >
      <View style={styles.backupHeader}>
        <View style={styles.backupInfo}>
          <Text style={styles.backupDate}>{formatDate(item.timestamp)}</Text>
          <Text style={styles.backupSize}>{formatFileSize(item.size)}</Text>
        </View>
        <View style={styles.backupStatus}>
          <Ionicons
            name={getStatusIcon(item.status) as any}
            size={20}
            color={getStatusColor(item.status)}
          />
          <Text
            style={[
              styles.backupStatusText,
              { color: getStatusColor(item.status) },
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>
      <Text style={styles.backupType}>
        {item.type} backup • {item.platform}
      </Text>
      {item.error && <Text style={styles.backupError}>{item.error}</Text>}
    </TouchableOpacity>
  );

  if (!backupConfig) {
    return (
      <ScreenSafeArea style={styles.container}>
        <Text>Loading backup settings...</Text>
      </ScreenSafeArea>
    );
  }

  return (
    <ScreenSafeArea style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Backup & Recovery</Text>
        <TouchableOpacity
          style={styles.createBackupButton}
          onPress={createManualBackup}
          disabled={isLoading}
          accessible={true}
          accessibilityLabel="Create manual backup"
        >
          <Ionicons name="add" size={20} color={themeColors.surface} />
          <Text style={styles.createBackupText}>Create Backup</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Backup Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backup Settings</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Enable Automatic Backups</Text>
              <Text style={styles.settingDescription}>
                Automatically create backups on a schedule
              </Text>
            </View>
            <Switch
              value={backupConfig.enabled}
              onValueChange={value => updateBackupConfig({ enabled: value })}
              trackColor={{
                false: themeColors.border,
                true: themeColors.primary,
              }}
              thumbColor={
                backupConfig.enabled
                  ? themeColors.surface
                  : themeColors.textSecondary
              }
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Backup Frequency</Text>
              <Text style={styles.settingDescription}>
                How often to create automatic backups
              </Text>
            </View>
            <TouchableOpacity
              style={styles.frequencySelector}
              onPress={() => {
                Alert.alert(
                  'Backup Frequency',
                  'Choose how often to create automatic backups',
                  [
                    {
                      text: 'Daily',
                      onPress: () => updateBackupConfig({ frequency: 'daily' }),
                    },
                    {
                      text: 'Weekly',
                      onPress: () =>
                        updateBackupConfig({ frequency: 'weekly' }),
                    },
                    {
                      text: 'Monthly',
                      onPress: () =>
                        updateBackupConfig({ frequency: 'monthly' }),
                    },
                    { text: 'Cancel', style: 'cancel' },
                  ]
                );
              }}
            >
              <Text style={styles.frequencyText}>
                {backupConfig.frequency.charAt(0).toUpperCase() +
                  backupConfig.frequency.slice(1)}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={themeColors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Backup Time</Text>
              <Text style={styles.settingDescription}>
                When to create daily backups
              </Text>
            </View>
            <TouchableOpacity
              style={styles.timeSelector}
              onPress={() => {
                // In a real app, you'd show a time picker
                Alert.alert('Backup Time', 'Time picker would be shown here');
              }}
            >
              <Text style={styles.timeText}>{backupConfig.time}</Text>
              <Ionicons name="time" size={16} color={themeColors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Data Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data to Backup</Text>

          {[
            {
              key: 'includeUserData',
              title: 'User Profiles',
              description: 'Account and profile information',
            },
            {
              key: 'includeCommunicationData',
              title: 'Communication Data',
              description: 'Messages and symbol libraries',
            },
            {
              key: 'includeProgressData',
              title: 'Progress Data',
              description: 'Learning achievements and analytics',
            },
            {
              key: 'includeSettings',
              title: 'App Settings',
              description: 'Preferences and configurations',
            },
          ].map(setting => (
            <View key={setting.key} style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{setting.title}</Text>
                <Text style={styles.settingDescription}>
                  {setting.description}
                </Text>
              </View>
              <Switch
                value={
                  backupConfig[
                    setting.key as keyof BackupConfiguration
                  ] as boolean
                }
                onValueChange={value =>
                  updateBackupConfig({ [setting.key]: value })
                }
                trackColor={{
                  false: themeColors.border,
                  true: themeColors.primary,
                }}
                thumbColor={
                  (backupConfig[
                    setting.key as keyof BackupConfiguration
                  ] as boolean)
                    ? themeColors.surface
                    : themeColors.textSecondary
                }
              />
            </View>
          ))}
        </View>

        {/* Backup Locations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backup Locations</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Local Storage</Text>
              <Text style={styles.settingDescription}>
                Store backups on device storage
              </Text>
            </View>
            <Switch
              value={backupConfig.localBackup}
              onValueChange={value =>
                updateBackupConfig({ localBackup: value })
              }
              trackColor={{
                false: themeColors.border,
                true: themeColors.primary,
              }}
              thumbColor={
                backupConfig.localBackup
                  ? themeColors.surface
                  : themeColors.textSecondary
              }
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Cloud Storage</Text>
              <Text style={styles.settingDescription}>
                Upload backups to secure cloud storage
              </Text>
            </View>
            <Switch
              value={backupConfig.cloudBackup}
              onValueChange={value =>
                updateBackupConfig({ cloudBackup: value })
              }
              trackColor={{
                false: themeColors.border,
                true: themeColors.primary,
              }}
              thumbColor={
                backupConfig.cloudBackup
                  ? themeColors.surface
                  : themeColors.textSecondary
              }
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Encryption</Text>
              <Text style={styles.settingDescription}>
                Encrypt backup data for security
              </Text>
            </View>
            <Switch
              value={backupConfig.encryptionEnabled}
              onValueChange={value =>
                updateBackupConfig({ encryptionEnabled: value })
              }
              trackColor={{
                false: themeColors.border,
                true: themeColors.primary,
              }}
              thumbColor={
                backupConfig.encryptionEnabled
                  ? themeColors.surface
                  : themeColors.textSecondary
              }
            />
          </View>
        </View>

        {/* Backup History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backup History</Text>

          {backupHistory.length > 0 ? (
            <FlatList
              data={backupHistory}
              renderItem={renderBackupItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="archive-outline"
                size={48}
                color={themeColors.textSecondary}
              />
              <Text style={styles.emptyStateText}>No backups available</Text>
              <Text style={styles.emptyStateSubtext}>
                Create your first backup to get started
              </Text>
            </View>
          )}
        </View>

        {/* Advanced Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced Settings</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Retention Period</Text>
              <Text style={styles.settingDescription}>
                How long to keep old backups (days)
              </Text>
            </View>
            <TouchableOpacity
              style={styles.retentionSelector}
              onPress={() => {
                Alert.alert(
                  'Retention Period',
                  'Choose how long to keep backup files',
                  [
                    {
                      text: '30 Days',
                      onPress: () => updateBackupConfig({ retentionDays: 30 }),
                    },
                    {
                      text: '90 Days',
                      onPress: () => updateBackupConfig({ retentionDays: 90 }),
                    },
                    {
                      text: '1 Year',
                      onPress: () => updateBackupConfig({ retentionDays: 365 }),
                    },
                    { text: 'Cancel', style: 'cancel' },
                  ]
                );
              }}
            >
              <Text style={styles.retentionText}>
                {backupConfig.retentionDays} days
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={themeColors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenSafeArea>
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
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    backgroundColor: themeColors.primary,
  },
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.surface,
  },
  createBackupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.secondary,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.SM,
    gap: SPACING.XS,
  },
  createBackupText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.surface,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: themeColors.surface,
    marginHorizontal: SPACING.LG,
    marginVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.MD,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    backgroundColor: themeColors.background,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.MD,
  },
  settingTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  settingDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    lineHeight: 18,
  },
  frequencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    backgroundColor: themeColors.background,
    borderRadius: BORDER_RADIUS.SM,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  frequencyText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.text_PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    marginRight: SPACING.SM,
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    backgroundColor: themeColors.background,
    borderRadius: BORDER_RADIUS.SM,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  timeText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.text_PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    marginRight: SPACING.SM,
  },
  retentionSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    backgroundColor: themeColors.background,
    borderRadius: BORDER_RADIUS.SM,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  retentionText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.text_PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    marginRight: SPACING.SM,
  },
  separator: {
    height: 1,
    backgroundColor: themeColors.border,
    marginHorizontal: SPACING.LG,
  },
  backupItem: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
  },
  backupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.XS,
  },
  backupInfo: {
    flex: 1,
  },
  backupDate: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.text_PRIMARY,
  },
  backupSize: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginTop: SPACING.XS,
  },
  backupStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.XS,
  },
  backupStatusText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  backupType: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginBottom: SPACING.XS,
  },
  backupError: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.error,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.XL,
  },
  emptyStateText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    color: themeColors.textSecondary,
    marginTop: SPACING.MD,
    marginBottom: SPACING.SM,
  },
  emptyStateSubtext: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.textSecondary,
    textAlign: 'center',
  },
});
