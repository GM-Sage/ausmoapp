// Security Settings Screen

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
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { getThemeColors } from '../../utils/themeUtils';

import { RootState } from '../../store';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import SecurityService, { 
  SecuritySettings, 
  ParentalConsent, 
  AuditLog,
  SecurityViolation 
} from '../../services/securityService';

export default function SecuritySettingsScreen() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const styles = getStyles(themeColors);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [securityService] = useState(() => SecurityService.getInstance());
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [parentalConsent, setParentalConsent] = useState<ParentalConsent[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [violations, setViolations] = useState<SecurityViolation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'settings' | 'consent' | 'audit' | 'violations'>('settings');

  useEffect(() => {
    if (currentUser) {
      loadSecurityData();
    }
  }, [currentUser]);

  const loadSecurityData = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      await securityService.initialize(currentUser);
      
      const [securitySettings, consent, logs, securityViolations] = await Promise.all([
        securityService.getSecuritySettings(),
        securityService.getParentalConsent(currentUser.id),
        securityService.getAuditLogs(currentUser.id),
        securityService.getSecurityViolations(currentUser.id),
      ]);
      
      setSettings(securitySettings);
      setParentalConsent(consent);
      setAuditLogs(logs);
      setViolations(securityViolations);
    } catch (error) {
      console.error('Error loading security data:', error);
      Alert.alert('Error', 'Failed to load security data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = async (key: keyof SecuritySettings, value: boolean | number) => {
    if (!settings) return;

    try {
      const updatedSettings = { ...settings, [key]: value };
      await securityService.updateSecuritySettings(updatedSettings);
      setSettings(updatedSettings);
      
      Alert.alert('Success', 'Security settings updated successfully');
    } catch (error) {
      console.error('Error updating security setting:', error);
      Alert.alert('Error', 'Failed to update security setting');
    }
  };

  const handleRequestParentalConsent = async () => {
    if (!currentUser) return;

    try {
      const consent = await securityService.requestParentalConsent(
        currentUser.id,
        'parent@example.com', // In production, get from user input
        'data_collection'
      );
      
      setParentalConsent(prev => [...prev, consent]);
      Alert.alert('Success', 'Parental consent request sent');
    } catch (error) {
      console.error('Error requesting parental consent:', error);
      Alert.alert('Error', 'Failed to request parental consent');
    }
  };

  const handleAnonymizeData = () => {
    Alert.alert(
      'Anonymize Data',
      'This will permanently anonymize your personal data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Anonymize', 
          style: 'destructive',
          onPress: async () => {
            try {
              await securityService.anonymizeUserData(currentUser!.id);
              Alert.alert('Success', 'Data anonymized successfully');
            } catch (error) {
              console.error('Error anonymizing data:', error);
              Alert.alert('Error', 'Failed to anonymize data');
            }
          }
        },
      ]
    );
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await securityService.deleteUserData(currentUser!.id);
              Alert.alert('Success', 'Data deleted successfully');
            } catch (error) {
              console.error('Error deleting data:', error);
              Alert.alert('Error', 'Failed to delete data');
            }
          }
        },
      ]
    );
  };

  const renderSettingsTab = () => {
    if (!settings) return null;

    return (
      <View style={styles.settingsContainer}>
        <Text style={styles.sectionTitle}>Security Settings</Text>
        
        {/* Encryption */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="lock-closed" size={24} color={themeColors.primary} />
            <View style={styles.settingDetails}>
              <Text style={styles.settingName}>Data Encryption</Text>
              <Text style={styles.settingDescription}>
                Encrypt sensitive data stored on device
              </Text>
            </View>
          </View>
          <Switch
            value={settings.encryptionEnabled}
            onValueChange={(value) => handleSettingChange('encryptionEnabled', value)}
            trackColor={{ false: COLORS.BORDER, true: themeColors.primary }}
            thumbColor={settings.encryptionEnabled ? COLORS.SURFACE : themeColors.textSecondary}
          />
        </View>

        {/* Biometric Authentication */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="finger-print" size={24} color={themeColors.primary} />
            <View style={styles.settingDetails}>
              <Text style={styles.settingName}>Biometric Authentication</Text>
              <Text style={styles.settingDescription}>
                Use fingerprint or face recognition to unlock app
              </Text>
            </View>
          </View>
          <Switch
            value={settings.biometricAuth}
            onValueChange={(value) => handleSettingChange('biometricAuth', value)}
            trackColor={{ false: COLORS.BORDER, true: themeColors.primary }}
            thumbColor={settings.biometricAuth ? COLORS.SURFACE : themeColors.textSecondary}
          />
        </View>

        {/* Session Timeout */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="time" size={24} color={themeColors.primary} />
            <View style={styles.settingDetails}>
              <Text style={styles.settingName}>Session Timeout</Text>
              <Text style={styles.settingDescription}>
                Automatically log out after {settings.sessionTimeout} minutes of inactivity
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.settingButton}
            onPress={() => {
              Alert.alert(
                'Session Timeout',
                'Select timeout duration',
                [
                  { text: '15 minutes', onPress: () => handleSettingChange('sessionTimeout', 15) },
                  { text: '30 minutes', onPress: () => handleSettingChange('sessionTimeout', 30) },
                  { text: '60 minutes', onPress: () => handleSettingChange('sessionTimeout', 60) },
                  { text: 'Cancel', style: 'cancel' },
                ]
              );
            }}
          >
            <Text style={styles.settingButtonText}>{settings.sessionTimeout}m</Text>
          </TouchableOpacity>
        </View>

        {/* Audit Logging */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="document-text" size={24} color={themeColors.primary} />
            <View style={styles.settingDetails}>
              <Text style={styles.settingName}>Audit Logging</Text>
              <Text style={styles.settingDescription}>
                Log security events and user actions
              </Text>
            </View>
          </View>
          <Switch
            value={settings.auditLogging}
            onValueChange={(value) => handleSettingChange('auditLogging', value)}
            trackColor={{ false: COLORS.BORDER, true: themeColors.primary }}
            thumbColor={settings.auditLogging ? COLORS.SURFACE : themeColors.textSecondary}
          />
        </View>

        {/* Parental Controls */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="shield-checkmark" size={24} color={themeColors.primary} />
            <View style={styles.settingDetails}>
              <Text style={styles.settingName}>Parental Controls</Text>
              <Text style={styles.settingDescription}>
                Enable parental supervision features
              </Text>
            </View>
          </View>
          <Switch
            value={settings.parentalControls}
            onValueChange={(value) => handleSettingChange('parentalControls', value)}
            trackColor={{ false: COLORS.BORDER, true: themeColors.primary }}
            thumbColor={settings.parentalControls ? COLORS.SURFACE : themeColors.textSecondary}
          />
        </View>

        {/* Data Sharing */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="share" size={24} color={themeColors.primary} />
            <View style={styles.settingDetails}>
              <Text style={styles.settingName}>Data Sharing</Text>
              <Text style={styles.settingDescription}>
                Allow sharing data with therapists and caregivers
              </Text>
            </View>
          </View>
          <Switch
            value={settings.dataSharing}
            onValueChange={(value) => handleSettingChange('dataSharing', value)}
            trackColor={{ false: COLORS.BORDER, true: themeColors.primary }}
            thumbColor={settings.dataSharing ? COLORS.SURFACE : themeColors.textSecondary}
          />
        </View>

        {/* Analytics Opt-in */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="analytics" size={24} color={themeColors.primary} />
            <View style={styles.settingDetails}>
              <Text style={styles.settingName}>Analytics</Text>
              <Text style={styles.settingDescription}>
                Allow anonymous usage analytics to improve the app
              </Text>
            </View>
          </View>
          <Switch
            value={settings.analyticsOptIn}
            onValueChange={(value) => handleSettingChange('analyticsOptIn', value)}
            trackColor={{ false: COLORS.BORDER, true: themeColors.primary }}
            thumbColor={settings.analyticsOptIn ? COLORS.SURFACE : themeColors.textSecondary}
          />
        </View>

        {/* Data Management */}
        <View style={styles.dataManagementSection}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity
            style={[styles.dataButton, styles.anonymizeButton]}
            onPress={handleAnonymizeData}
          >
            <Ionicons name="eye-off" size={20} color={COLORS.WARNING} />
            <Text style={styles.dataButtonText}>Anonymize Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.dataButton, styles.deleteButton]}
            onPress={handleDeleteData}
          >
            <Ionicons name="trash" size={20} color={COLORS.ERROR} />
            <Text style={styles.dataButtonText}>Delete All Data</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderConsentTab = () => {
    return (
      <View style={styles.consentContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Parental Consent</Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleRequestParentalConsent}
          >
            <Ionicons name="add-circle" size={20} color={themeColors.primary} />
            <Text style={styles.headerButtonText}>Request Consent</Text>
          </TouchableOpacity>
        </View>

        {parentalConsent.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="shield-checkmark" size={48} color={themeColors.textSecondary} />
            <Text style={styles.emptyStateTitle}>No Parental Consent</Text>
            <Text style={styles.emptyStateText}>
              Request parental consent to enable data collection and sharing features.
            </Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={handleRequestParentalConsent}>
              <Text style={styles.emptyStateButtonText}>Request Consent</Text>
            </TouchableOpacity>
          </View>
        ) : (
          parentalConsent.map((consent) => (
            <View key={consent.id} style={styles.consentCard}>
              <View style={styles.consentHeader}>
                <View style={styles.consentInfo}>
                  <Text style={styles.consentType}>
                    {consent.consentType.replace('_', ' ').toUpperCase()}
                  </Text>
                  <Text style={styles.consentEmail}>{consent.parentEmail}</Text>
                </View>
                <View style={[
                  styles.consentStatus,
                  { backgroundColor: consent.granted ? COLORS.SUCCESS : COLORS.WARNING }
                ]}>
                  <Text style={styles.consentStatusText}>
                    {consent.granted ? 'Granted' : 'Pending'}
                  </Text>
                </View>
              </View>
              
              {consent.granted && consent.grantedAt && (
                <View style={styles.consentDetails}>
                  <Text style={styles.consentDetailText}>
                    Granted: {consent.grantedAt.toLocaleDateString()}
                  </Text>
                  {consent.expiresAt && (
                    <Text style={styles.consentDetailText}>
                      Expires: {consent.expiresAt.toLocaleDateString()}
                    </Text>
                  )}
                </View>
              )}
            </View>
          ))
        )}
      </View>
    );
  };

  const renderAuditTab = () => {
    return (
      <View style={styles.auditContainer}>
        <Text style={styles.sectionTitle}>Audit Logs</Text>
        
        {auditLogs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text" size={48} color={themeColors.textSecondary} />
            <Text style={styles.emptyStateTitle}>No Audit Logs</Text>
            <Text style={styles.emptyStateText}>
              Audit logs will appear here when security events occur.
            </Text>
          </View>
        ) : (
          auditLogs.slice(0, 50).map((log) => (
            <View key={log.id} style={styles.auditCard}>
              <View style={styles.auditHeader}>
                <Text style={styles.auditAction}>{log.action}</Text>
                <View style={[
                  styles.auditStatus,
                  { backgroundColor: log.success ? COLORS.SUCCESS : COLORS.ERROR }
                ]}>
                  <Text style={styles.auditStatusText}>
                    {log.success ? 'Success' : 'Failed'}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.auditResource}>Resource: {log.resource}</Text>
              <Text style={styles.auditTimestamp}>
                {log.timestamp.toLocaleDateString()} {log.timestamp.toLocaleTimeString()}
              </Text>
              
              {Object.keys(log.details).length > 0 && (
                <Text style={styles.auditDetails}>
                  Details: {JSON.stringify(log.details)}
                </Text>
              )}
            </View>
          ))
        )}
      </View>
    );
  };

  const renderViolationsTab = () => {
    return (
      <View style={styles.violationsContainer}>
        <Text style={styles.sectionTitle}>Security Violations</Text>
        
        {violations.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="shield-checkmark" size={48} color={COLORS.SUCCESS} />
            <Text style={styles.emptyStateTitle}>No Security Violations</Text>
            <Text style={styles.emptyStateText}>
              Great! No security violations have been detected.
            </Text>
          </View>
        ) : (
          violations.map((violation) => (
            <View key={violation.id} style={styles.violationCard}>
              <View style={styles.violationHeader}>
                <Text style={styles.violationType}>{violation.type}</Text>
                <View style={[
                  styles.violationSeverity,
                  { backgroundColor: 
                    violation.severity === 'critical' ? COLORS.ERROR :
                    violation.severity === 'high' ? COLORS.WARNING :
                    violation.severity === 'medium' ? COLORS.INFO : COLORS.SUCCESS
                  }
                ]}>
                  <Text style={styles.violationSeverityText}>
                    {violation.severity.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.violationDescription}>{violation.description}</Text>
              <Text style={styles.violationTimestamp}>
                {violation.timestamp.toLocaleDateString()} {violation.timestamp.toLocaleTimeString()}
              </Text>
              
              <View style={styles.violationStatus}>
                <Text style={styles.violationStatusText}>
                  Status: {violation.resolved ? 'Resolved' : 'Open'}
                </Text>
                {violation.resolution && (
                  <Text style={styles.violationResolution}>
                    Resolution: {violation.resolution}
                  </Text>
                )}
              </View>
            </View>
          ))
        )}
      </View>
    );
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'settings':
        return renderSettingsTab();
      case 'consent':
        return renderConsentTab();
      case 'audit':
        return renderAuditTab();
      case 'violations':
        return renderViolationsTab();
      default:
        return renderSettingsTab();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={styles.loadingText}>Loading security data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          { key: 'settings', label: 'Settings', icon: 'settings' },
          { key: 'consent', label: 'Consent', icon: 'shield-checkmark' },
          { key: 'audit', label: 'Audit', icon: 'document-text' },
          { key: 'violations', label: 'Violations', icon: 'warning' },
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
              color={selectedTab === tab.key ? COLORS.SURFACE : themeColors.textSecondary} 
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
    </View>
  );
}

const getStyles = (themeColors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: themeColors.background,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.textSecondary,
    marginTop: SPACING.MD,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
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
    backgroundColor: themeColors.primary,
  },
  tabButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.MD,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.SM,
    borderWidth: 1,
    borderColor: themeColors.primary,
    gap: SPACING.XS,
  },
  headerButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.primary,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  settingsContainer: {
    gap: SPACING.MD,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    shadowColor: themeColors.text_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
    flex: 1,
  },
  settingDetails: {
    flex: 1,
  },
  settingName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  settingDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  settingButton: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    backgroundColor: themeColors.background,
    borderRadius: BORDER_RADIUS.SM,
    borderWidth: 1,
    borderColor: themeColors.primary,
  },
  settingButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.primary,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  dataManagementSection: {
    marginTop: SPACING.LG,
    gap: SPACING.MD,
  },
  dataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
    gap: SPACING.SM,
  },
  anonymizeButton: {
    backgroundColor: COLORS.WARNING,
  },
  deleteButton: {
    backgroundColor: COLORS.ERROR,
  },
  dataButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.SURFACE,
  },
  consentContainer: {
    gap: SPACING.MD,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.XL,
  },
  emptyStateTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginTop: SPACING.MD,
    marginBottom: SPACING.SM,
  },
  emptyStateText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.LG,
  },
  emptyStateButton: {
    backgroundColor: themeColors.primary,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
  },
  emptyStateButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.SURFACE,
  },
  consentCard: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    shadowColor: themeColors.text_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  consentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  consentInfo: {
    flex: 1,
  },
  consentType: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  consentEmail: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  consentStatus: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
  },
  consentStatusText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.SURFACE,
  },
  consentDetails: {
    gap: SPACING.XS,
  },
  consentDetailText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  auditContainer: {
    gap: SPACING.MD,
  },
  auditCard: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    shadowColor: themeColors.text_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  auditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  auditAction: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
  },
  auditStatus: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
  },
  auditStatusText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.SURFACE,
  },
  auditResource: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginBottom: SPACING.XS,
  },
  auditTimestamp: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginBottom: SPACING.XS,
  },
  auditDetails: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  violationsContainer: {
    gap: SPACING.MD,
  },
  violationCard: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    shadowColor: themeColors.text_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  violationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  violationType: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
  },
  violationSeverity: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
  },
  violationSeverityText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.SURFACE,
  },
  violationDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginBottom: SPACING.SM,
  },
  violationTimestamp: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginBottom: SPACING.SM,
  },
  violationStatus: {
    gap: SPACING.XS,
  },
  violationStatusText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  violationResolution: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
});
