// Accessibility Settings Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import AccessibilityService, { AccessibilityFeatures } from '../../services/accessibilityService';

export default function AccessibilitySettingsScreen() {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [accessibilityService] = useState(() => AccessibilityService.getInstance());
  const [features, setFeatures] = useState<AccessibilityFeatures | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadAccessibilitySettings();
    }
  }, [currentUser]);

  const loadAccessibilitySettings = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      await accessibilityService.initialize(currentUser);
      const currentFeatures = accessibilityService.getFeatures();
      setFeatures(currentFeatures);
    } catch (error) {
      console.error('Error loading accessibility settings:', error);
      Alert.alert('Error', 'Failed to load accessibility settings');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFeature = (feature: keyof AccessibilityFeatures, value: any) => {
    if (!features) return;

    const updatedFeatures = { ...features };
    if (typeof value === 'boolean') {
      (updatedFeatures[feature] as boolean) = value;
    } else {
      (updatedFeatures[feature] as any) = value;
    }

    setFeatures(updatedFeatures);
    accessibilityService.updateSettings(updatedFeatures);
  };

  const updateScreenReaderSetting = (setting: keyof NonNullable<typeof features>['screenReader'], value: any) => {
    if (!features?.screenReader) return;

    const updatedFeatures = { ...features };
    (updatedFeatures.screenReader as any)[setting] = value;
    setFeatures(updatedFeatures);
    accessibilityService.updateSettings(updatedFeatures);
  };

  const updateGestureSetting = (setting: keyof NonNullable<typeof features>['gestures'], value: any) => {
    if (!features?.gestures) return;

    const updatedFeatures = { ...features };
    (updatedFeatures.gestures as any)[setting] = value;
    setFeatures(updatedFeatures);
    accessibilityService.updateSettings(updatedFeatures);
  };

  const updateOneHandedSetting = (setting: keyof NonNullable<typeof features>['oneHanded'], value: any) => {
    if (!features?.oneHanded) return;

    const updatedFeatures = { ...features };
    (updatedFeatures.oneHanded as any)[setting] = value;
    setFeatures(updatedFeatures);
    accessibilityService.updateSettings(updatedFeatures);
  };

  const handleTestAccessibility = async () => {
    try {
      setIsTesting(true);
      const results = await accessibilityService.testAccessibility();
      
      const enabledFeatures = Object.entries(results)
        .filter(([_, enabled]) => enabled)
        .map(([feature, _]) => feature)
        .join(', ');

      Alert.alert(
        'Accessibility Test Results',
        enabledFeatures ? `Enabled features: ${enabledFeatures}` : 'No accessibility features are currently enabled',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error testing accessibility:', error);
      Alert.alert('Error', 'Failed to test accessibility features');
    } finally {
      setIsTesting(false);
    }
  };

  const handleGetRecommendations = () => {
    const recommendations = accessibilityService.getRecommendations();
    
    if (recommendations.length === 0) {
      Alert.alert('Recommendations', 'Your accessibility settings look good!');
    } else {
      Alert.alert(
        'Accessibility Recommendations',
        recommendations.join('\n\n'),
        [{ text: 'OK' }]
      );
    }
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const renderSwitch = (
    label: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    description?: string
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: COLORS.BORDER, true: COLORS.PRIMARY }}
        thumbColor={value ? COLORS.SURFACE : COLORS.TEXT_SECONDARY}
      />
    </View>
  );

  const renderSlider = (
    label: string,
    value: number,
    onValueChange: (value: number) => void,
    min: number,
    max: number,
    step: number = 0.1
  ) => (
    <View style={styles.settingItem}>
      <Text style={styles.settingLabel}>{label}</Text>
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderValue}>{value.toFixed(1)}</Text>
        <TouchableOpacity
          style={styles.sliderButton}
          onPress={() => onValueChange(Math.max(min, value - step))}
        >
          <Ionicons name="remove" size={16} color={COLORS.PRIMARY} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sliderButton}
          onPress={() => onValueChange(Math.min(max, value + step))}
        >
          <Ionicons name="add" size={16} color={COLORS.PRIMARY} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPicker = (
    label: string,
    value: string,
    onValueChange: (value: string) => void,
    options: Array<{ label: string; value: string }>
  ) => (
    <View style={styles.settingItem}>
      <Text style={styles.settingLabel}>{label}</Text>
      <View style={styles.pickerContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={`${option.value}-${index}`}
            style={[
              styles.pickerOption,
              value === option.value && styles.pickerOptionSelected
            ]}
            onPress={() => onValueChange(option.value)}
          >
            <Text style={[
              styles.pickerOptionText,
              value === option.value && styles.pickerOptionTextSelected
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading accessibility settings...</Text>
      </View>
    );
  }

  if (!features) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load accessibility settings</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Screen Reader Section */}
        {renderSection('Screen Reader', (
          <>
            {renderSwitch(
              'Enable Screen Reader',
              features.screenReader.enabled,
              (value) => updateScreenReaderSetting('enabled', value),
              'Announce button presses and page changes'
            )}
            {renderSwitch(
              'Announce Button Presses',
              features.screenReader.announceButtonPress,
              (value) => updateScreenReaderSetting('announceButtonPress', value)
            )}
            {renderSwitch(
              'Announce Page Changes',
              features.screenReader.announcePageChanges,
              (value) => updateScreenReaderSetting('announcePageChanges', value)
            )}
            {renderSwitch(
              'Announce Scanning',
              features.screenReader.announceScanning,
              (value) => updateScreenReaderSetting('announceScanning', value)
            )}
            {renderSwitch(
              'Announce Context',
              features.screenReader.announceContext,
              (value) => updateScreenReaderSetting('announceContext', value)
            )}
            {renderSwitch(
              'Announce Suggestions',
              features.screenReader.announceSuggestions,
              (value) => updateScreenReaderSetting('announceSuggestions', value)
            )}
            {renderSlider(
              'Speech Rate',
              features.screenReader.speechRate,
              (value) => updateScreenReaderSetting('speechRate', value),
              0.1, 2.0
            )}
            {renderSlider(
              'Speech Pitch',
              features.screenReader.speechPitch,
              (value) => updateScreenReaderSetting('speechPitch', value),
              0.1, 2.0
            )}
            {renderSlider(
              'Speech Volume',
              features.screenReader.speechVolume,
              (value) => updateScreenReaderSetting('speechVolume', value),
              0.0, 1.0
            )}
          </>
        ))}

        {/* Gestures Section */}
        {renderSection('Gestures', (
          <>
            {renderSwitch(
              'Enable Gestures',
              features.gestures.enabled,
              (value) => updateGestureSetting('enabled', value),
              'Use swipe and tap gestures for navigation'
            )}
            {renderPicker(
              'Swipe Up',
              features.gestures.swipeUp,
              (value) => updateGestureSetting('swipeUp', value),
              [
                { label: 'None', value: 'none' },
                { label: 'Home', value: 'home' },
                { label: 'Back', value: 'back' },
                { label: 'Menu', value: 'menu' },
                { label: 'Speak', value: 'speak' },
              ]
            )}
            {renderPicker(
              'Swipe Down',
              features.gestures.swipeDown,
              (value) => updateGestureSetting('swipeDown', value),
              [
                { label: 'None', value: 'none' },
                { label: 'Home', value: 'home' },
                { label: 'Back', value: 'back' },
                { label: 'Menu', value: 'menu' },
                { label: 'Speak', value: 'speak' },
              ]
            )}
            {renderPicker(
              'Double Tap',
              features.gestures.doubleTap,
              (value) => updateGestureSetting('doubleTap', value),
              [
                { label: 'None', value: 'none' },
                { label: 'Speak', value: 'speak' },
                { label: 'Menu', value: 'menu' },
                { label: 'Help', value: 'help' },
              ]
            )}
            {renderPicker(
              'Long Press',
              features.gestures.longPress,
              (value) => updateGestureSetting('longPress', value),
              [
                { label: 'None', value: 'none' },
                { label: 'Menu', value: 'menu' },
                { label: 'Help', value: 'help' },
                { label: 'Settings', value: 'settings' },
              ]
            )}
          </>
        ))}

        {/* One-Handed Mode Section */}
        {renderSection('One-Handed Mode', (
          <>
            {renderSwitch(
              'Enable One-Handed Mode',
              features.oneHanded.enabled,
              (value) => updateOneHandedSetting('enabled', value),
              'Optimize layout for single-hand use'
            )}
            {renderPicker(
              'Hand Preference',
              features.oneHanded.mode,
              (value) => updateOneHandedSetting('mode', value),
              [
                { label: 'Auto', value: 'auto' },
                { label: 'Left', value: 'left' },
                { label: 'Right', value: 'right' },
              ]
            )}
            {renderPicker(
              'Button Size',
              features.oneHanded.buttonSize,
              (value) => updateOneHandedSetting('buttonSize', value),
              [
                { label: 'Small', value: 'small' },
                { label: 'Medium', value: 'medium' },
                { label: 'Large', value: 'large' },
                { label: 'Extra Large', value: 'extra-large' },
              ]
            )}
            {renderPicker(
              'Spacing',
              features.oneHanded.spacing,
              (value) => updateOneHandedSetting('spacing', value),
              [
                { label: 'Compact', value: 'compact' },
                { label: 'Normal', value: 'normal' },
                { label: 'Spacious', value: 'spacious' },
              ]
            )}
            {renderSwitch(
              'Reach Assist',
              features.oneHanded.reachAssist,
              (value) => updateOneHandedSetting('reachAssist', value),
              'Help reach buttons at the top of the screen'
            )}
            {renderSwitch(
              'Thumb Zone',
              features.oneHanded.thumbZone,
              (value) => updateOneHandedSetting('thumbZone', value),
              'Optimize button placement for thumb reach'
            )}
          </>
        ))}

        {/* Visual Accessibility Section */}
        {renderSection('Visual Accessibility', (
          <>
            {renderSwitch(
              'High Contrast',
              features.highContrast,
              (value) => updateFeature('highContrast', value),
              'Increase contrast for better visibility'
            )}
            {renderSwitch(
              'Large Text',
              features.largeText,
              (value) => updateFeature('largeText', value),
              'Use larger text throughout the app'
            )}
            {renderSwitch(
              'Color Blind Support',
              features.colorBlindSupport,
              (value) => updateFeature('colorBlindSupport', value),
              'Use colorblind-friendly color schemes'
            )}
            {renderSwitch(
              'Reduce Motion',
              features.reduceMotion,
              (value) => updateFeature('reduceMotion', value),
              'Minimize animations and transitions'
            )}
          </>
        ))}

        {/* Motor Accessibility Section */}
        {renderSection('Motor Accessibility', (
          <>
            {renderSwitch(
              'Voice Control',
              features.voiceControl,
              (value) => updateFeature('voiceControl', value),
              'Control the app using voice commands'
            )}
            {renderSwitch(
              'Switch Control',
              features.switchControl,
              (value) => updateFeature('switchControl', value),
              'Use external switches for navigation'
            )}
            {renderSwitch(
              'Assistive Touch',
              features.assistiveTouch,
              (value) => updateFeature('assistiveTouch', value),
              'Use assistive touch for easier interaction'
            )}
          </>
        ))}

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.actionButton, styles.testButton]}
            onPress={handleTestAccessibility}
            disabled={isTesting}
          >
            {isTesting ? (
              <ActivityIndicator size="small" color={COLORS.SURFACE} />
            ) : (
              <Ionicons name="checkmark-circle" size={20} color={COLORS.SURFACE} />
            )}
            <Text style={styles.actionButtonText}>
              {isTesting ? 'Testing...' : 'Test Accessibility'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.recommendationsButton]}
            onPress={handleGetRecommendations}
          >
            <Ionicons name="bulb" size={20} color={COLORS.SURFACE} />
            <Text style={styles.actionButtonText}>Get Recommendations</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
  errorText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.ERROR,
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
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.SM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  settingContent: {
    flex: 1,
    marginRight: SPACING.MD,
  },
  settingLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
  },
  settingDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.XS,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
  },
  sliderValue: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_PRIMARY,
    minWidth: 30,
    textAlign: 'center',
  },
  sliderButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.SURFACE,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.XS,
  },
  pickerOption: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.SURFACE,
  },
  pickerOptionSelected: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  pickerOptionText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_PRIMARY,
  },
  pickerOptionTextSelected: {
    color: COLORS.SURFACE,
  },
  actionSection: {
    marginTop: SPACING.LG,
    gap: SPACING.MD,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
    gap: SPACING.SM,
  },
  testButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  recommendationsButton: {
    backgroundColor: COLORS.WARNING,
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.SURFACE,
  },
});