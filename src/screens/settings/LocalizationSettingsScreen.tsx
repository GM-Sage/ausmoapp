// Localization Settings Screen

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
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import { deserializeUserForService } from '../../store/slices/userSlice';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import LocalizationService, {
  Language,
  LocalizationSettings,
  VoiceSettings,
} from '../../services/localizationService';

export default function LocalizationSettingsScreen() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [localizationService] = useState(() =>
    LocalizationService.getInstance()
  );
  const [settings, setSettings] = useState<LocalizationSettings | null>(null);
  const [supportedLanguages, setSupportedLanguages] = useState<Language[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    'language' | 'voice' | 'format' | 'cultural'
  >('language');

  useEffect(() => {
    if (currentUser) {
      loadLocalizationData();
    }
  }, [currentUser]);

  const loadLocalizationData = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      await localizationService.initialize(
        deserializeUserForService(currentUser)
      );

      const [localizationSettings, languages] = await Promise.all([
        localizationService.getLocalizationSettings(),
        localizationService.getSupportedLanguages(),
      ]);

      setSettings(localizationSettings);
      setSupportedLanguages(languages);
      setCurrentLanguage(localizationService.getCurrentLanguage());
    } catch (error) {
      console.error('Error loading localization data:', error);
      Alert.alert('Error', 'Failed to load localization data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await localizationService.updateLocalizationSettings({
        currentLanguage: languageCode,
      });

      setCurrentLanguage(languageCode);
      setSettings(prev =>
        prev ? { ...prev, currentLanguage: languageCode } : null
      );

      Alert.alert('Success', 'Language changed successfully');
    } catch (error) {
      console.error('Error changing language:', error);
      Alert.alert('Error', 'Failed to change language');
    }
  };

  const handleSettingChange = async (
    key: keyof LocalizationSettings,
    value: boolean | string
  ) => {
    if (!settings) return;

    try {
      const updatedSettings = { ...settings, [key]: value };
      await localizationService.updateLocalizationSettings(updatedSettings);
      setSettings(updatedSettings);

      Alert.alert('Success', 'Setting updated successfully');
    } catch (error) {
      console.error('Error updating setting:', error);
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const handleVoiceTest = async (languageCode: string) => {
    try {
      const voiceSettings = localizationService.getVoiceSettings(languageCode);
      const testText = localizationService.getString(
        'comm.hello',
        languageCode
      );

      Alert.alert(
        'Voice Test',
        `Language: ${voiceSettings.language}\nVoice: ${voiceSettings.voice}\nGender: ${voiceSettings.gender}\nAccent: ${voiceSettings.accent}\n\nTest Text: "${testText}"`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error testing voice:', error);
      Alert.alert('Error', 'Failed to test voice');
    }
  };

  const renderLanguageTab = () => {
    return (
      <View style={styles.languageContainer}>
        <Text style={styles.sectionTitle}>Language Settings</Text>

        {/* Current Language */}
        <View style={styles.currentLanguageCard}>
          <View style={styles.currentLanguageInfo}>
            <Ionicons name="globe" size={24} color={themeColors.primary} />
            <View style={styles.currentLanguageDetails}>
              <Text style={styles.currentLanguageName}>
                {supportedLanguages.find(lang => lang.code === currentLanguage)
                  ?.name || 'English'}
              </Text>
              <Text style={styles.currentLanguageCode}>
                {currentLanguage.toUpperCase()}
              </Text>
            </View>
          </View>
          <View style={styles.currentLanguageStatus}>
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={themeColors.success}
            />
          </View>
        </View>

        {/* Supported Languages */}
        <Text style={styles.subsectionTitle}>Available Languages</Text>

        {supportedLanguages.map(language => (
          <TouchableOpacity
            key={language.code}
            style={[
              styles.languageCard,
              currentLanguage === language.code && styles.languageCardSelected,
            ]}
            onPress={() => handleLanguageChange(language.code)}
          >
            <View style={styles.languageInfo}>
              <View style={styles.languageDetails}>
                <Text style={styles.languageName}>{language.name}</Text>
                <Text style={styles.languageNativeName}>
                  {language.nativeName}
                </Text>
                <Text style={styles.languageRegion}>{language.region}</Text>
              </View>
              <View style={styles.languageMeta}>
                {language.isRTL && (
                  <View style={styles.rtlBadge}>
                    <Text style={styles.rtlBadgeText}>RTL</Text>
                  </View>
                )}
                <View style={styles.symbolSetBadge}>
                  <Text style={styles.symbolSetBadgeText}>
                    {language.symbolSet.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>

            {currentLanguage === language.code && (
              <View style={styles.selectedIndicator}>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={themeColors.primary}
                />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderVoiceTab = () => {
    if (!settings) return null;

    const voiceSettings = localizationService.getVoiceSettings(currentLanguage);
    const currentLanguageInfo = supportedLanguages.find(
      lang => lang.code === currentLanguage
    );

    return (
      <View style={styles.voiceContainer}>
        <Text style={styles.sectionTitle}>Voice Settings</Text>

        {/* Current Voice */}
        <View style={styles.voiceCard}>
          <View style={styles.voiceHeader}>
            <Ionicons
              name="volume-high"
              size={24}
              color={themeColors.primary}
            />
            <View style={styles.voiceInfo}>
              <Text style={styles.voiceName}>
                {currentLanguageInfo?.name || 'English'}
              </Text>
              <Text style={styles.voiceDetails}>
                {voiceSettings.voice} • {voiceSettings.gender} •{' '}
                {voiceSettings.accent}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.testButton}
              onPress={() => handleVoiceTest(currentLanguage)}
            >
              <Ionicons name="play" size={16} color={themeColors.primary} />
              <Text style={styles.testButtonText}>Test</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Voice Settings */}
        <View style={styles.voiceSettingsCard}>
          <Text style={styles.subsectionTitle}>Voice Preferences</Text>

          <View style={styles.voiceSettingItem}>
            <View style={styles.voiceSettingInfo}>
              <Ionicons
                name="speedometer"
                size={20}
                color={themeColors.textSecondary}
              />
              <Text style={styles.voiceSettingLabel}>Speed</Text>
            </View>
            <Text style={styles.voiceSettingValue}>{voiceSettings.speed}x</Text>
          </View>

          <View style={styles.voiceSettingItem}>
            <View style={styles.voiceSettingInfo}>
              <Ionicons
                name="trending-up"
                size={20}
                color={themeColors.textSecondary}
              />
              <Text style={styles.voiceSettingLabel}>Pitch</Text>
            </View>
            <Text style={styles.voiceSettingValue}>{voiceSettings.pitch}x</Text>
          </View>

          <View style={styles.voiceSettingItem}>
            <View style={styles.voiceSettingInfo}>
              <Ionicons
                name="volume-high"
                size={20}
                color={themeColors.textSecondary}
              />
              <Text style={styles.voiceSettingLabel}>Volume</Text>
            </View>
            <Text style={styles.voiceSettingValue}>
              {Math.round(voiceSettings.volume * 100)}%
            </Text>
          </View>
        </View>

        {/* Voice Localization */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="globe" size={24} color={themeColors.primary} />
            <View style={styles.settingDetails}>
              <Text style={styles.settingName}>Voice Localization</Text>
              <Text style={styles.settingDescription}>
                Use language-specific voices and accents
              </Text>
            </View>
          </View>
          <Switch
            value={settings.voiceLocalization}
            onValueChange={value =>
              handleSettingChange('voiceLocalization', value)
            }
            trackColor={{
              false: themeColors.border,
              true: themeColors.primary,
            }}
            thumbColor={
              settings.voiceLocalization
                ? themeColors.surface
                : themeColors.textSecondary
            }
          />
        </View>
      </View>
    );
  };

  const renderFormatTab = () => {
    if (!settings) return null;

    return (
      <View style={styles.formatContainer}>
        <Text style={styles.sectionTitle}>Format Settings</Text>

        {/* Date Format */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="calendar" size={24} color={themeColors.primary} />
            <View style={styles.settingDetails}>
              <Text style={styles.settingName}>Date Format</Text>
              <Text style={styles.settingDescription}>
                How dates are displayed
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.settingButton}
            onPress={() => {
              Alert.alert('Date Format', 'Select date format', [
                {
                  text: 'MM/DD/YYYY',
                  onPress: () =>
                    handleSettingChange('dateFormat', 'MM/DD/YYYY'),
                },
                {
                  text: 'DD/MM/YYYY',
                  onPress: () =>
                    handleSettingChange('dateFormat', 'DD/MM/YYYY'),
                },
                {
                  text: 'YYYY-MM-DD',
                  onPress: () =>
                    handleSettingChange('dateFormat', 'YYYY-MM-DD'),
                },
                { text: 'Cancel', style: 'cancel' },
              ]);
            }}
          >
            <Text style={styles.settingButtonText}>{settings.dateFormat}</Text>
          </TouchableOpacity>
        </View>

        {/* Time Format */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="time" size={24} color={themeColors.primary} />
            <View style={styles.settingDetails}>
              <Text style={styles.settingName}>Time Format</Text>
              <Text style={styles.settingDescription}>
                How times are displayed
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.settingButton}
            onPress={() => {
              Alert.alert('Time Format', 'Select time format', [
                {
                  text: '12 Hour',
                  onPress: () => handleSettingChange('timeFormat', '12h'),
                },
                {
                  text: '24 Hour',
                  onPress: () => handleSettingChange('timeFormat', '24h'),
                },
                { text: 'Cancel', style: 'cancel' },
              ]);
            }}
          >
            <Text style={styles.settingButtonText}>{settings.timeFormat}</Text>
          </TouchableOpacity>
        </View>

        {/* Number Format */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="calculator" size={24} color={themeColors.primary} />
            <View style={styles.settingDetails}>
              <Text style={styles.settingName}>Number Format</Text>
              <Text style={styles.settingDescription}>
                How numbers are displayed
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.settingButton}
            onPress={() => {
              Alert.alert('Number Format', 'Select number format', [
                {
                  text: 'US (1,234.56)',
                  onPress: () => handleSettingChange('numberFormat', 'US'),
                },
                {
                  text: 'EU (1.234,56)',
                  onPress: () => handleSettingChange('numberFormat', 'EU'),
                },
                { text: 'Cancel', style: 'cancel' },
              ]);
            }}
          >
            <Text style={styles.settingButtonText}>
              {settings.numberFormat}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Currency Format */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="card" size={24} color={themeColors.primary} />
            <View style={styles.settingDetails}>
              <Text style={styles.settingName}>Currency Format</Text>
              <Text style={styles.settingDescription}>
                How currency is displayed
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.settingButton}
            onPress={() => {
              Alert.alert('Currency Format', 'Select currency format', [
                {
                  text: 'USD ($)',
                  onPress: () => handleSettingChange('currencyFormat', 'USD'),
                },
                {
                  text: 'EUR (€)',
                  onPress: () => handleSettingChange('currencyFormat', 'EUR'),
                },
                {
                  text: 'GBP (£)',
                  onPress: () => handleSettingChange('currencyFormat', 'GBP'),
                },
                { text: 'Cancel', style: 'cancel' },
              ]);
            }}
          >
            <Text style={styles.settingButtonText}>
              {settings.currencyFormat}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCulturalTab = () => {
    if (!settings) return null;

    return (
      <View style={styles.culturalContainer}>
        <Text style={styles.sectionTitle}>Cultural Settings</Text>

        {/* Cultural Sensitivity */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="heart" size={24} color={themeColors.primary} />
            <View style={styles.settingDetails}>
              <Text style={styles.settingName}>Cultural Sensitivity</Text>
              <Text style={styles.settingDescription}>
                Adapt symbols and content for cultural appropriateness
              </Text>
            </View>
          </View>
          <Switch
            value={settings.culturalSensitivity}
            onValueChange={value =>
              handleSettingChange('culturalSensitivity', value)
            }
            trackColor={{
              false: themeColors.border,
              true: themeColors.primary,
            }}
            thumbColor={
              settings.culturalSensitivity
                ? themeColors.surface
                : themeColors.textSecondary
            }
          />
        </View>

        {/* Symbol Localization */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="images" size={24} color={themeColors.primary} />
            <View style={styles.settingDetails}>
              <Text style={styles.settingName}>Symbol Localization</Text>
              <Text style={styles.settingDescription}>
                Use culturally appropriate symbols and images
              </Text>
            </View>
          </View>
          <Switch
            value={settings.symbolLocalization}
            onValueChange={value =>
              handleSettingChange('symbolLocalization', value)
            }
            trackColor={{
              false: themeColors.border,
              true: themeColors.primary,
            }}
            thumbColor={
              settings.symbolLocalization
                ? themeColors.surface
                : themeColors.textSecondary
            }
          />
        </View>

        {/* Cultural Examples */}
        <View style={styles.culturalExamplesCard}>
          <Text style={styles.subsectionTitle}>Cultural Examples</Text>

          <View style={styles.culturalExample}>
            <Text style={styles.culturalExampleTitle}>Greeting</Text>
            <Text style={styles.culturalExampleText}>Western: 👋 Wave</Text>
            <Text style={styles.culturalExampleText}>Eastern: 🙏 Bow</Text>
            <Text style={styles.culturalExampleText}>
              Arabic: 🤲 Open hands
            </Text>
          </View>

          <View style={styles.culturalExample}>
            <Text style={styles.culturalExampleTitle}>Food</Text>
            <Text style={styles.culturalExampleText}>Rice: 🍚 (Universal)</Text>
            <Text style={styles.culturalExampleText}>
              Bread: 🍞 (Western) / 🥖 (French)
            </Text>
          </View>

          <View style={styles.culturalExample}>
            <Text style={styles.culturalExampleTitle}>Family</Text>
            <Text style={styles.culturalExampleText}>
              Mother: 👩 (Universal)
            </Text>
            <Text style={styles.culturalExampleText}>
              Grandmother: 👵 (Universal)
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'language':
        return renderLanguageTab();
      case 'voice':
        return renderVoiceTab();
      case 'format':
        return renderFormatTab();
      case 'cultural':
        return renderCulturalTab();
      default:
        return renderLanguageTab();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={styles.loadingText}>Loading localization data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          { key: 'language', label: 'Language', icon: 'globe' },
          { key: 'voice', label: 'Voice', icon: 'volume-high' },
          { key: 'format', label: 'Format', icon: 'calendar' },
          { key: 'cultural', label: 'Cultural', icon: 'heart' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              selectedTab === tab.key && styles.tabButtonSelected,
            ]}
            onPress={() => setSelectedTab(tab.key as any)}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={
                selectedTab === tab.key
                  ? themeColors.surface
                  : themeColors.textSecondary
              }
            />
            <Text
              style={[
                styles.tabButtonText,
                selectedTab === tab.key && styles.tabButtonTextSelected,
              ]}
            >
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

const styles = StyleSheet.create({
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
    backgroundColor: themeColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
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
    color: themeColors.surface,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.MD,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.MD,
  },
  subsectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.SM,
    marginTop: SPACING.MD,
  },
  languageContainer: {
    gap: SPACING.MD,
  },
  currentLanguageCard: {
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: themeColors.text_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentLanguageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
  },
  currentLanguageDetails: {
    flex: 1,
  },
  currentLanguageName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
  },
  currentLanguageCode: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  currentLanguageStatus: {
    alignItems: 'center',
  },
  languageCard: {
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    shadowColor: themeColors.text_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  languageCardSelected: {
    borderWidth: 2,
    borderColor: themeColors.primary,
  },
  languageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageDetails: {
    flex: 1,
  },
  languageName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  languageNativeName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginBottom: SPACING.XS,
  },
  languageRegion: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  languageMeta: {
    flexDirection: 'row',
    gap: SPACING.XS,
  },
  rtlBadge: {
    backgroundColor: themeColors.warning,
    paddingHorizontal: SPACING.XS,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.SM,
  },
  rtlBadgeText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.surface,
  },
  symbolSetBadge: {
    backgroundColor: themeColors.info,
    paddingHorizontal: SPACING.XS,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.SM,
  },
  symbolSetBadgeText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.surface,
  },
  selectedIndicator: {
    alignItems: 'center',
  },
  voiceContainer: {
    gap: SPACING.MD,
  },
  voiceCard: {
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    shadowColor: themeColors.text_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  voiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
  },
  voiceInfo: {
    flex: 1,
  },
  voiceName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  voiceDetails: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    backgroundColor: themeColors.background,
    borderRadius: BORDER_RADIUS.SM,
    borderWidth: 1,
    borderColor: themeColors.primary,
    gap: SPACING.XS,
  },
  testButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.primary,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  voiceSettingsCard: {
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    shadowColor: themeColors.text_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  voiceSettingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.SM,
  },
  voiceSettingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
  },
  voiceSettingLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.text_PRIMARY,
  },
  voiceSettingValue: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.primary,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: themeColors.surface,
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
  formatContainer: {
    gap: SPACING.MD,
  },
  culturalContainer: {
    gap: SPACING.MD,
  },
  culturalExamplesCard: {
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    shadowColor: themeColors.text_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  culturalExample: {
    marginBottom: SPACING.MD,
  },
  culturalExampleTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  culturalExampleText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginBottom: SPACING.XS,
  },
});
