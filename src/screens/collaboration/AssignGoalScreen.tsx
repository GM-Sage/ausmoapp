// Assign Goal Screen
// Allows therapists to assign goals to patients

import React, { useState, useEffect } from 'react';
import { getThemeColors } from '../../utils/themeUtils';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { RootState } from '../../store';
import {
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  RESPONSIVE,
} from '../../constants';
import TherapistService from '../../services/therapistService';

interface AssignGoalScreenProps {
  route: {
    params: {
      patientId: string;
      patientName?: string;
    };
  };
}

export default function AssignGoalScreen() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const navigation = useNavigation();
  const route = useRoute();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [isLoading, setIsLoading] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalCategory, setGoalCategory] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { patientId, patientName } = route.params as {
    patientId: string;
    patientName?: string;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    console.log('Date picker event:', event.type, selectedDate);

    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  const showDatePickerModal = () => {
    console.log('Opening date picker...');
    console.log('Platform:', Platform.OS);
    console.log('DateTimePicker available:', !!DateTimePicker);
    setShowDatePicker(true);
  };

  const handleAssignGoal = async () => {
    if (!goalTitle.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    if (!goalDescription.trim()) {
      Alert.alert('Error', 'Please enter a goal description');
      return;
    }

    try {
      setIsLoading(true);
      const therapistService = TherapistService.getInstance();

      const goalData = {
        title: goalTitle.trim(),
        description: goalDescription.trim(),
        category: goalCategory.trim() || 'General',
        targetDate: targetDate.trim() || null,
        priority,
        status: 'assigned',
        assignedBy: currentUser?.id || '',
        assignedTo: patientId,
        createdAt: new Date(),
      };

      await therapistService.assignGoal(goalData);

      Alert.alert('Success', 'Goal assigned successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error assigning goal:', error);
      Alert.alert('Error', 'Failed to assign goal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const priorityOptions = [
    { value: 'low', label: 'Low Priority', color: themeColors.success },
    { value: 'medium', label: 'Medium Priority', color: themeColors.warning },
    { value: 'high', label: 'High Priority', color: themeColors.error },
  ];

  const categoryOptions = [
    'Communication',
    'Social Skills',
    'Behavior',
    'Academic',
    'Daily Living',
    'Motor Skills',
    'Emotional Regulation',
    'Other',
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={themeColors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Assign Goal</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Patient Info */}
        {patientName && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Patient</Text>
            <View style={styles.patientCard}>
              <Ionicons name="person" size={24} color={themeColors.primary} />
              <Text style={styles.patientName}>{patientName}</Text>
            </View>
          </View>
        )}

        {/* Goal Title */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Goal Title *</Text>
          <TextInput
            style={styles.input}
            value={goalTitle}
            onChangeText={setGoalTitle}
            placeholder="Enter goal title..."
            placeholderTextColor={themeColors.textSecondary}
            maxLength={100}
          />
        </View>

        {/* Goal Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={goalDescription}
            onChangeText={setGoalDescription}
            placeholder="Describe the goal in detail..."
            placeholderTextColor={themeColors.textSecondary}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {categoryOptions.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  goalCategory === category && styles.categoryButtonSelected,
                ]}
                onPress={() => setGoalCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    goalCategory === category &&
                      styles.categoryButtonTextSelected,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Priority */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Priority</Text>
          <View style={styles.priorityContainer}>
            {priorityOptions.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.priorityButton,
                  priority === option.value && styles.priorityButtonSelected,
                  { borderColor: option.color },
                ]}
                onPress={() => setPriority(option.value)}
              >
                <View
                  style={[
                    styles.priorityIndicator,
                    { backgroundColor: option.color },
                  ]}
                />
                <Text
                  style={[
                    styles.priorityButtonText,
                    priority === option.value &&
                      styles.priorityButtonTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {priority === option.value && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={option.color}
                    style={styles.priorityCheckmark}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Target Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Target Date (Optional)</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={showDatePickerModal}
          >
            <View style={styles.datePickerContent}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={themeColors.primary}
              />
              <Text style={styles.datePickerText}>
                {targetDate ? targetDate : 'Select target date'}
              </Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={themeColors.textSecondary}
              />
            </View>
          </TouchableOpacity>

          {/* Fallback text input */}
          <View style={styles.fallbackInputContainer}>
            <Text style={styles.fallbackLabel}>Or enter manually:</Text>
            <TextInput
              style={styles.fallbackInput}
              value={targetDate}
              onChangeText={setTargetDate}
              placeholder="YYYY-MM-DD (e.g., 2024-12-31)"
              placeholderTextColor={themeColors.textSecondary}
            />
          </View>
        </View>

        {/* Date Picker Modal */}
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Target Date</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={themeColors.text_PRIMARY}
                  />
                </TouchableOpacity>
              </View>

              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
                style={styles.modalDatePicker}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmButton}
                  onPress={() => {
                    setTargetDate(formatDate(selectedDate));
                    setShowDatePicker(false);
                  }}
                >
                  <Text style={styles.modalConfirmText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Assign Button */}
        <TouchableOpacity
          style={[
            styles.assignButton,
            isLoading && styles.assignButtonDisabled,
          ]}
          onPress={handleAssignGoal}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={themeColors.surface} />
          ) : (
            <>
              <Ionicons name="flag" size={20} color={themeColors.surface} />
              <Text style={styles.assignButtonText}>Assign Goal</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  backButton: {
    padding: SPACING.SM,
  },
  title: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.TITLE),
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: SPACING.LG,
  },
  section: {
    marginBottom: SPACING.XL,
  },
  sectionTitle: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.LARGE),
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.MD,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.surface,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  patientName: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    color: themeColors.text_PRIMARY,
    marginLeft: SPACING.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  input: {
    backgroundColor: themeColors.surface,
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    color: themeColors.text_PRIMARY,
  },
  textArea: {
    height: RESPONSIVE.getButtonHeight(100),
    textAlignVertical: 'top',
  },
  categoryScroll: {
    marginTop: SPACING.SM,
  },
  categoryButton: {
    backgroundColor: themeColors.surface,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: themeColors.border,
    marginRight: SPACING.SM,
  },
  categoryButtonSelected: {
    backgroundColor: themeColors.primary,
    borderColor: themeColors.primary,
  },
  categoryButtonText: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.SMALL),
    color: themeColors.text_PRIMARY,
  },
  categoryButtonTextSelected: {
    color: themeColors.surface,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
  priorityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM,
  },
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.surface,
    padding: RESPONSIVE.getSpacing(SPACING.MD),
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 2,
    flex: 1,
    minWidth: RESPONSIVE.isPhone ? '100%' : '30%',
    shadowColor: themeColors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  priorityButtonSelected: {
    backgroundColor: themeColors.background_LIGHT,
    borderWidth: 3,
    shadowColor: themeColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    transform: [{ scale: 1.02 }],
  },
  priorityIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: RESPONSIVE.getSpacing(SPACING.SM),
    borderWidth: 2,
    borderColor: themeColors.surface,
  },
  priorityButtonText: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.SMALL),
    color: themeColors.text_PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  priorityButtonTextSelected: {
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
  },
  priorityCheckmark: {
    marginLeft: 'auto',
  },
  datePickerButton: {
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: themeColors.border,
    marginTop: RESPONSIVE.getSpacing(SPACING.SM),
    shadowColor: themeColors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  datePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: RESPONSIVE.getSpacing(SPACING.MD),
    justifyContent: 'space-between',
  },
  datePickerText: {
    flex: 1,
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    color: themeColors.text_PRIMARY,
    marginLeft: RESPONSIVE.getSpacing(SPACING.SM),
  },
  datePickerContainer: {
    marginTop: RESPONSIVE.getSpacing(SPACING.SM),
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.MD,
    padding: RESPONSIVE.getSpacing(SPACING.MD),
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  datePicker: {
    width: '100%',
  },
  datePickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: RESPONSIVE.getSpacing(SPACING.MD),
    paddingTop: RESPONSIVE.getSpacing(SPACING.MD),
    borderTopWidth: 1,
    borderTopColor: themeColors.border,
  },
  datePickerCancelButton: {
    paddingHorizontal: RESPONSIVE.getSpacing(SPACING.LG),
    paddingVertical: RESPONSIVE.getSpacing(SPACING.SM),
  },
  datePickerCancelText: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    color: themeColors.textSecondary,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  datePickerDoneButton: {
    backgroundColor: themeColors.primary,
    paddingHorizontal: RESPONSIVE.getSpacing(SPACING.LG),
    paddingVertical: RESPONSIVE.getSpacing(SPACING.SM),
    borderRadius: BORDER_RADIUS.SM,
  },
  datePickerDoneText: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    color: themeColors.surface,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
  fallbackInputContainer: {
    marginTop: RESPONSIVE.getSpacing(SPACING.SM),
  },
  fallbackLabel: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.SMALL),
    color: themeColors.textSecondary,
    marginBottom: RESPONSIVE.getSpacing(SPACING.XS),
  },
  fallbackInput: {
    backgroundColor: themeColors.surface,
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: BORDER_RADIUS.MD,
    padding: RESPONSIVE.getSpacing(SPACING.MD),
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    color: themeColors.text_PRIMARY,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: themeColors.surface,
    borderRadius: BORDER_RADIUS.LG,
    padding: RESPONSIVE.getSpacing(SPACING.LG),
    width: '90%',
    maxWidth: 400,
    shadowColor: themeColors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: RESPONSIVE.getSpacing(SPACING.LG),
  },
  modalTitle: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.LARGE),
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
  },
  modalCloseButton: {
    padding: RESPONSIVE.getSpacing(SPACING.SM),
  },
  modalDatePicker: {
    width: '100%',
    height: 200,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: RESPONSIVE.getSpacing(SPACING.LG),
    gap: RESPONSIVE.getSpacing(SPACING.MD),
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: themeColors.surface,
    paddingVertical: RESPONSIVE.getSpacing(SPACING.MD),
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  modalCancelText: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    color: themeColors.textSecondary,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: themeColors.primary,
    paddingVertical: RESPONSIVE.getSpacing(SPACING.MD),
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    color: themeColors.surface,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
  assignButton: {
    backgroundColor: themeColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
    marginTop: SPACING.XL,
  },
  assignButtonDisabled: {
    backgroundColor: themeColors.text_DISABLED,
  },
  assignButtonText: {
    color: themeColors.surface,
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.LARGE),
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    marginLeft: SPACING.SM,
  },
});
