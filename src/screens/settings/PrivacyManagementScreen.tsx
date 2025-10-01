// Privacy Management Screen
// GDPR compliance, data export, and privacy controls

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
  Modal,
  Switch,
  ActivityIndicator,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { RootState } from '../../store';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import EncryptionService, {
  DataRetentionPolicy,
} from '../../services/encryptionService';

interface PrivacyManagementScreenProps {
  navigation: any;
}

export default function PrivacyManagementScreen({
  navigation,
}: PrivacyManagementScreenProps) {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [privacySettings, setPrivacySettings] = useState({
    dataCollection: true,
    analytics: false,
    crashReporting: true,
    personalizedContent: true,
    dataSharing: false,
  });
  const [retentionPolicies, setRetentionPolicies] = useState<
    Record<string, DataRetentionPolicy>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeletionModal, setShowDeletionModal] = useState(false);
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([]);

  const encryptionService = EncryptionService.getInstance();

  useEffect(() => {
    loadPrivacySettings();
    loadRetentionPolicies();
  }, []);

  const loadPrivacySettings = async () => {
    try {
      // Load user's privacy preferences from storage
      // This would integrate with your user settings
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    }
  };

  const loadRetentionPolicies = () => {
    const policies = {
      therapy_goals: encryptionService.getRetentionPolicy('therapy_goals'),
      therapy_sessions:
        encryptionService.getRetentionPolicy('therapy_sessions'),
      patient_profiles:
        encryptionService.getRetentionPolicy('patient_profiles'),
      communication_data:
        encryptionService.getRetentionPolicy('communication_data'),
      usage_analytics: encryptionService.getRetentionPolicy('usage_analytics'),
    };
    setRetentionPolicies(policies);
  };

  const updatePrivacySetting = (setting: string, value: boolean) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value,
    }));

    // Save to storage
    // This would integrate with your user settings service
  };

  const handleDataExport = async () => {
    if (selectedDataTypes.length === 0) {
      Alert.alert(
        'No Data Selected',
        'Please select at least one data type to export.'
      );
      return;
    }

    setIsLoading(true);
    try {
      const exportData = await encryptionService.generateDataExport(
        currentUser?.id || '',
        selectedDataTypes
      );

      // Create export file
      const fileName = `ausmo_data_export_${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(exportData, null, 2)
      );

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Your Ausmo Data',
        });
      } else {
        Alert.alert(
          'Export Complete',
          `Your data has been exported to: ${fileName}`
        );
      }

      setShowExportModal(false);
      setSelectedDataTypes([]);
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Export Failed', 'Failed to export data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataDeletion = async () => {
    if (selectedDataTypes.length === 0) {
      Alert.alert(
        'No Data Selected',
        'Please select at least one data type to delete.'
      );
      return;
    }

    Alert.alert(
      'Confirm Data Deletion',
      `Are you sure you want to permanently delete the selected data? This action cannot be undone.\n\nSelected: ${selectedDataTypes.join(', ')}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await encryptionService.secureDataDeletion(
                currentUser?.id || '',
                selectedDataTypes
              );

              Alert.alert(
                'Deletion Complete',
                'Selected data has been securely deleted.'
              );
              setShowDeletionModal(false);
              setSelectedDataTypes([]);
            } catch (error) {
              console.error('Error deleting data:', error);
              Alert.alert(
                'Deletion Failed',
                'Failed to delete data. Please try again.'
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const generatePrivacyReport = async () => {
    setIsLoading(true);
    try {
      const report = await encryptionService.generatePrivacyReport(
        currentUser?.id || ''
      );

      const fileName = `privacy_report_${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(report, null, 2)
      );

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Your Privacy Report',
        });
      } else {
        Alert.alert(
          'Report Generated',
          `Your privacy report has been saved to: ${fileName}`
        );
      }
    } catch (error) {
      console.error('Error generating privacy report:', error);
      Alert.alert(
        'Report Failed',
        'Failed to generate privacy report. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderPrivacySetting = (
    title: string,
    description: string,
    setting: string,
    value: boolean
  ) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={newValue => updatePrivacySetting(setting, newValue)}
        trackColor={{ false: themeColors.border, true: themeColors.primary }}
        thumbColor={value ? themeColors.surface : themeColors.textSecondary}
      />
    </View>
  );

  const renderDataTypeOption = (
    dataType: string,
    policy: DataRetentionPolicy,
    isSelected: boolean,
    onToggle: () => void
  ) => (
    <TouchableOpacity
      key={dataType}
      style={[
        styles.dataTypeOption,
        isSelected && styles.dataTypeOptionSelected,
      ]}
      onPress={onToggle}
    >
      <View style={styles.dataTypeInfo}>
        <Text style={styles.dataTypeTitle}>
          {dataType.replace(/_/g, ' ').toUpperCase()}
        </Text>
        <Text style={styles.dataTypeDescription}>
          Retention: {policy.maxRetentionDays} days
        </Text>
        <Text style={styles.dataTypeDescription}>
          Export: {policy.allowDataExport ? 'Allowed' : 'Not Allowed'}
        </Text>
        <Text style={styles.dataTypeDescription}>
          Deletion: {policy.allowDataDeletion ? 'Allowed' : 'Not Allowed'}
        </Text>
      </View>
      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
        {isSelected && (
          <Ionicons name="checkmark" size={16} color={themeColors.surface} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={themeColors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy & Data</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Privacy Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>

          {renderPrivacySetting(
            'Data Collection',
            'Allow collection of usage data to improve the app',
            'dataCollection',
            privacySettings.dataCollection
          )}

          {renderPrivacySetting(
            'Analytics',
            'Share anonymous usage analytics with developers',
            'analytics',
            privacySettings.analytics
          )}

          {renderPrivacySetting(
            'Crash Reporting',
            'Automatically report crashes to help fix issues',
            'crashReporting',
            privacySettings.crashReporting
          )}

          {renderPrivacySetting(
            'Personalized Content',
            'Use your data to provide personalized recommendations',
            'personalizedContent',
            privacySettings.personalizedContent
          )}

          {renderPrivacySetting(
            'Data Sharing',
            'Allow sharing of anonymized data for research',
            'dataSharing',
            privacySettings.dataSharing
          )}
        </View>

        {/* Data Rights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Data Rights</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowExportModal(true)}
          >
            <Ionicons name="download" size={24} color={themeColors.primary} />
            <Text style={styles.actionButtonText}>Export My Data</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={themeColors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowDeletionModal(true)}
          >
            <Ionicons name="trash" size={24} color={themeColors.error} />
            <Text style={styles.actionButtonText}>Delete My Data</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={themeColors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={generatePrivacyReport}
            disabled={isLoading}
          >
            <Ionicons
              name="document-text"
              size={24}
              color={themeColors.primary}
            />
            <Text style={styles.actionButtonText}>Generate Privacy Report</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={themeColors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Compliance Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compliance Standards</Text>

          <View style={styles.complianceCard}>
            <Text style={styles.complianceTitle}>HIPAA Compliant</Text>
            <Text style={styles.complianceDescription}>
              Healthcare data is encrypted and protected according to HIPAA
              standards.
            </Text>
          </View>

          <View style={styles.complianceCard}>
            <Text style={styles.complianceTitle}>GDPR Compliant</Text>
            <Text style={styles.complianceDescription}>
              You have full control over your personal data with rights to
              access, export, and delete.
            </Text>
          </View>

          <View style={styles.complianceCard}>
            <Text style={styles.complianceTitle}>COPPA Compliant</Text>
            <Text style={styles.complianceDescription}>
              Children's data is protected with additional safeguards and
              parental controls.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Export Modal */}
      <Modal
        visible={showExportModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowExportModal(false)}
            >
              <Ionicons
                name="close"
                size={24}
                color={themeColors.text_PRIMARY}
              />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Export Your Data</Text>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              Select the types of data you want to export. This will create a
              downloadable file with your information.
            </Text>

            {Object.entries(retentionPolicies).map(([dataType, policy]) =>
              renderDataTypeOption(
                dataType,
                policy,
                selectedDataTypes.includes(dataType),
                () => {
                  if (selectedDataTypes.includes(dataType)) {
                    setSelectedDataTypes(prev =>
                      prev.filter(type => type !== dataType)
                    );
                  } else {
                    setSelectedDataTypes(prev => [...prev, dataType]);
                  }
                }
              )
            )}

            <TouchableOpacity
              style={[
                styles.exportButton,
                isLoading && styles.exportButtonDisabled,
              ]}
              onPress={handleDataExport}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={themeColors.surface} />
              ) : (
                <>
                  <Ionicons
                    name="download"
                    size={20}
                    color={themeColors.surface}
                  />
                  <Text style={styles.exportButtonText}>
                    Export Selected Data
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Deletion Modal */}
      <Modal
        visible={showDeletionModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDeletionModal(false)}
            >
              <Ionicons
                name="close"
                size={24}
                color={themeColors.text_PRIMARY}
              />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Delete Your Data</Text>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              ⚠️ WARNING: This action cannot be undone. Select the types of data
              you want to permanently delete.
            </Text>

            {Object.entries(retentionPolicies).map(([dataType, policy]) =>
              policy.allowDataDeletion
                ? renderDataTypeOption(
                    dataType,
                    policy,
                    selectedDataTypes.includes(dataType),
                    () => {
                      if (selectedDataTypes.includes(dataType)) {
                        setSelectedDataTypes(prev =>
                          prev.filter(type => type !== dataType)
                        );
                      } else {
                        setSelectedDataTypes(prev => [...prev, dataType]);
                      }
                    }
                  )
                : null
            )}

            <TouchableOpacity
              style={[
                styles.deleteButton,
                isLoading && styles.deleteButtonDisabled,
              ]}
              onPress={handleDataDeletion}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={themeColors.surface} />
              ) : (
                <>
                  <Ionicons
                    name="trash"
                    size={20}
                    color={themeColors.surface}
                  />
                  <Text style={styles.deleteButtonText}>
                    Delete Selected Data
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
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
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    backgroundColor: themeColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  backButton: {
    marginRight: SPACING.MD,
  },
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
  },
  content: {
    flex: 1,
    padding: SPACING.LG,
  },
  section: {
    marginBottom: SPACING.XL,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.LG,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.surface,
    padding: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
    marginBottom: SPACING.MD,
    shadowColor: themeColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.text_PRIMARY,
    marginLeft: SPACING.MD,
    flex: 1,
  },
  complianceCard: {
    backgroundColor: themeColors.surface,
    padding: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
    marginBottom: SPACING.MD,
    borderLeftWidth: 4,
    borderLeftColor: themeColors.success,
  },
  complianceTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.SM,
  },
  complianceDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    lineHeight: 18,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    backgroundColor: themeColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  modalCloseButton: {
    marginRight: SPACING.MD,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.LG,
  },
  modalDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.textSecondary,
    marginBottom: SPACING.LG,
    lineHeight: 22,
  },
  dataTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.surface,
    padding: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
    marginBottom: SPACING.MD,
    borderWidth: 2,
    borderColor: themeColors.border,
  },
  dataTypeOptionSelected: {
    borderColor: themeColors.primary,
    backgroundColor: themeColors.primary_LIGHT,
  },
  dataTypeInfo: {
    flex: 1,
  },
  dataTypeTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  dataTypeDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginBottom: SPACING.XS,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: themeColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.MD,
  },
  checkboxSelected: {
    backgroundColor: themeColors.primary,
    borderColor: themeColors.primary,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColors.primary,
    paddingVertical: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
    marginTop: SPACING.LG,
  },
  exportButtonDisabled: {
    backgroundColor: themeColors.text_DISABLED,
  },
  exportButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.surface,
    marginLeft: SPACING.SM,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColors.error,
    paddingVertical: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
    marginTop: SPACING.LG,
  },
  deleteButtonDisabled: {
    backgroundColor: themeColors.text_DISABLED,
  },
  deleteButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.surface,
    marginLeft: SPACING.SM,
  },
});
