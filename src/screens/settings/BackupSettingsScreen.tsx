// Backup Settings Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
  ProgressBarAndroid,
  Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import BackupService, { BackupOptions, ExportOptions, CloudBackupOptions } from '../../services/backupService';

export default function BackupSettingsScreen() {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [backupService] = useState(() => BackupService.getInstance());
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [backupOptions, setBackupOptions] = useState<BackupOptions>({
    includeUsers: true,
    includeBooks: true,
    includeMessages: true,
    includeSymbols: true,
    includeAnalytics: true,
    includeSettings: true,
    compressData: true,
    encryptData: false,
  });
  const [cloudOptions, setCloudOptions] = useState<CloudBackupOptions>({
    provider: 'iCloud',
    autoBackup: false,
    backupFrequency: 'weekly',
    encryptData: false,
  });

  const handleCreateBackup = async () => {
    try {
      setIsLoading(true);
      setProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 0.1, 0.9));
      }, 200);

      const result = await backupService.createBackup(backupOptions);

      clearInterval(progressInterval);
      setProgress(1);

      if (result.success) {
        Alert.alert(
          'Backup Created',
          `Backup created successfully!\nFile size: ${(result.fileSize! / 1024).toFixed(1)} KB`,
          [
            { text: 'OK', style: 'default' },
            { 
              text: 'Share', 
              onPress: () => shareBackup(result.filePath!)
            },
          ]
        );
      } else {
        Alert.alert('Backup Failed', result.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      Alert.alert('Error', 'Failed to create backup');
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const handleRestoreBackup = async () => {
    Alert.alert(
      'Restore Backup',
      'This will replace all current data with the backup data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Restore', 
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              const result = await backupService.importData();
              
              if (result.success) {
                Alert.alert(
                  'Restore Successful',
                  `Restored:\n• ${result.restoredItems.users} users\n• ${result.restoredItems.books} books\n• ${result.restoredItems.pages} pages\n• ${result.restoredItems.messages} messages\n• ${result.restoredItems.symbols} symbols\n• ${result.restoredItems.analytics} analytics`
                );
              } else {
                Alert.alert('Restore Failed', result.error || 'Unknown error occurred');
              }
            } catch (error) {
              console.error('Error restoring backup:', error);
              Alert.alert('Error', 'Failed to restore backup');
            } finally {
              setIsLoading(false);
            }
          }
        },
      ]
    );
  };

  const shareBackup = async (filePath: string) => {
    try {
      const success = await backupService.shareBackup(filePath);
      if (!success) {
        Alert.alert('Error', 'Failed to share backup');
      }
    } catch (error) {
      console.error('Error sharing backup:', error);
      Alert.alert('Error', 'Failed to share backup');
    }
  };

  const handleExportData = async (format: 'json' | 'csv' | 'xml') => {
    try {
      setIsLoading(true);
      
      const exportOptions: ExportOptions = {
        format,
        includeImages: true,
        includeAudio: true,
        includeMetadata: true,
      };

      const result = await backupService.exportData(exportOptions);
      
      if (result.success) {
        Alert.alert(
          'Export Successful',
          `Data exported to ${format.toUpperCase()} format!\nFile size: ${(result.fileSize! / 1024).toFixed(1)} KB`,
          [
            { text: 'OK', style: 'default' },
            { 
              text: 'Share', 
              onPress: () => shareBackup(result.filePath!)
            },
          ]
        );
      } else {
        Alert.alert('Export Failed', result.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloudBackup = async () => {
    try {
      setIsLoading(true);
      const result = await backupService.backupToCloud(cloudOptions);
      
      if (result.success) {
        Alert.alert('Cloud Backup Successful', 'Your data has been backed up to the cloud');
      } else {
        Alert.alert('Cloud Backup Failed', result.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error with cloud backup:', error);
      Alert.alert('Error', 'Failed to backup to cloud');
    } finally {
      setIsLoading(false);
    }
  };

  const renderBackupOptions = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Backup Options</Text>
        
        {Object.entries(backupOptions).map(([key, value]) => (
          <View key={key} style={styles.optionRow}>
            <Text style={styles.optionLabel}>
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </Text>
            <Switch
              value={value}
              onValueChange={(newValue) => 
                setBackupOptions(prev => ({ ...prev, [key]: newValue }))
              }
              trackColor={{ false: COLORS.DIVIDER, true: COLORS.PRIMARY }}
              thumbColor={value ? COLORS.SURFACE : COLORS.TEXT_DISABLED}
            />
          </View>
        ))}
      </View>
    );
  };

  const renderCloudOptions = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cloud Backup</Text>
        
        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>Auto Backup</Text>
          <Switch
            value={cloudOptions.autoBackup}
            onValueChange={(value) => 
              setCloudOptions(prev => ({ ...prev, autoBackup: value }))
            }
            trackColor={{ false: COLORS.DIVIDER, true: COLORS.PRIMARY }}
            thumbColor={cloudOptions.autoBackup ? COLORS.SURFACE : COLORS.TEXT_DISABLED}
          />
        </View>

        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>Encrypt Data</Text>
          <Switch
            value={cloudOptions.encryptData}
            onValueChange={(value) => 
              setCloudOptions(prev => ({ ...prev, encryptData: value }))
            }
            trackColor={{ false: COLORS.DIVIDER, true: COLORS.PRIMARY }}
            thumbColor={cloudOptions.encryptData ? COLORS.SURFACE : COLORS.TEXT_DISABLED}
          />
        </View>
      </View>
    );
  };

  const renderActionButtons = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={handleCreateBackup}
          disabled={isLoading}
        >
          <Ionicons name="cloud-upload" size={24} color={COLORS.SURFACE} />
          <Text style={styles.actionButtonText}>Create Backup</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={handleRestoreBackup}
          disabled={isLoading}
        >
          <Ionicons name="cloud-download" size={24} color={COLORS.PRIMARY} />
          <Text style={[styles.actionButtonText, { color: COLORS.PRIMARY }]}>Restore Backup</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.tertiaryButton]}
          onPress={handleCloudBackup}
          disabled={isLoading}
        >
          <Ionicons name="cloud" size={24} color={COLORS.SECONDARY} />
          <Text style={[styles.actionButtonText, { color: COLORS.SECONDARY }]}>Cloud Backup</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderExportButtons = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Export Data</Text>
        
        <View style={styles.exportButtons}>
          <TouchableOpacity
            style={[styles.exportButton, styles.jsonButton]}
            onPress={() => handleExportData('json')}
            disabled={isLoading}
          >
            <Text style={styles.exportButtonText}>JSON</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.exportButton, styles.csvButton]}
            onPress={() => handleExportData('csv')}
            disabled={isLoading}
          >
            <Text style={styles.exportButtonText}>CSV</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.exportButton, styles.xmlButton]}
            onPress={() => handleExportData('xml')}
            disabled={isLoading}
          >
            <Text style={styles.exportButtonText}>XML</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderProgress = () => {
    if (!isLoading) return null;

    return (
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>Processing...</Text>
        {Platform.OS === 'android' ? (
          <ProgressBarAndroid
            styleAttr="Horizontal"
            indeterminate={false}
            progress={progress}
            color={COLORS.PRIMARY}
          />
        ) : (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderBackupOptions()}
        {renderCloudOptions()}
        {renderActionButtons()}
        {renderExportButtons()}
        {renderProgress()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.MD,
  },
  section: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
    shadowColor: COLORS.TEXT_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.SM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.DIVIDER,
  },
  optionLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
    marginBottom: SPACING.SM,
    gap: SPACING.SM,
  },
  primaryButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  secondaryButton: {
    backgroundColor: COLORS.SURFACE,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
  },
  tertiaryButton: {
    backgroundColor: COLORS.SURFACE,
    borderWidth: 2,
    borderColor: COLORS.SECONDARY,
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.SURFACE,
  },
  exportButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: SPACING.SM,
  },
  exportButton: {
    flex: 1,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.SM,
    borderRadius: BORDER_RADIUS.SM,
    alignItems: 'center',
  },
  jsonButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  csvButton: {
    backgroundColor: COLORS.SECONDARY,
  },
  xmlButton: {
    backgroundColor: COLORS.WARNING,
  },
  exportButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.SURFACE,
  },
  progressContainer: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    marginTop: SPACING.MD,
  },
  progressText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: SPACING.SM,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.DIVIDER,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.PRIMARY,
  },
});
