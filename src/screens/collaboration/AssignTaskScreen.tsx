// Assign Task Screen
// Allows therapists to assign tasks to patients

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

interface AssignTaskScreenProps {
  route: {
    params: {
      patientId: string;
      patientName?: string;
    };
  };
}

export default function AssignTaskScreen() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const navigation = useNavigation();
  const route = useRoute();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [isLoading, setIsLoading] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskCategory, setTaskCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
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

    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setSelectedDate(selectedDate);
      setDueDate(formatDate(selectedDate));
    }
  };

  const showDatePickerModal = () => {
    console.log('Opening date picker...');
    setShowDatePicker(true);
  };

  const handleAssignTask = async () => {
    if (!taskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    if (!taskDescription.trim()) {
      Alert.alert('Error', 'Please enter a task description');
      return;
    }

    try {
      setIsLoading(true);
      const therapistService = TherapistService.getInstance();

      const taskData = {
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        category: taskCategory.trim() || 'General',
        dueDate: dueDate.trim() || null,
        estimatedDuration: estimatedDuration.trim() || null,
        difficulty,
        status: 'assigned',
        assignedBy: currentUser?.id || '',
        assignedTo: patientId,
        createdAt: new Date(),
      };

      await therapistService.assignTask(taskData);

      Alert.alert('Success', 'Task assigned successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error assigning task:', error);
      Alert.alert('Error', 'Failed to assign task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const difficultyOptions = [
    { value: 'easy', label: 'Easy', color: themeColors.success },
    { value: 'medium', label: 'Medium', color: themeColors.warning },
    { value: 'hard', label: 'Hard', color: themeColors.error },
  ];

  const categoryOptions = [
    'Communication Practice',
    'Social Interaction',
    'Behavior Modification',
    'Academic Work',
    'Daily Routine',
    'Motor Skills',
    'Emotional Regulation',
    'Assessment',
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
        <Text style={styles.title}>Assign Task</Text>
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

        {/* Task Title */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Task Title *</Text>
          <TextInput
            style={styles.input}
            value={taskTitle}
            onChangeText={setTaskTitle}
            placeholder="Enter task title..."
            placeholderTextColor={themeColors.textSecondary}
            maxLength={100}
          />
        </View>

        {/* Task Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={taskDescription}
            onChangeText={setTaskDescription}
            placeholder="Describe the task in detail..."
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
                  taskCategory === category && styles.categoryButtonSelected,
                ]}
                onPress={() => setTaskCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    taskCategory === category &&
                      styles.categoryButtonTextSelected,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Difficulty */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Difficulty Level</Text>
          <View style={styles.difficultyContainer}>
            {difficultyOptions.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.difficultyButton,
                  difficulty === option.value &&
                    styles.difficultyButtonSelected,
                  { borderColor: option.color },
                ]}
                onPress={() => setDifficulty(option.value)}
              >
                <View
                  style={[
                    styles.difficultyIndicator,
                    { backgroundColor: option.color },
                  ]}
                />
                <Text
                  style={[
                    styles.difficultyButtonText,
                    difficulty === option.value &&
                      styles.difficultyButtonTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {difficulty === option.value && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={option.color}
                    style={styles.difficultyCheckmark}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Due Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Due Date (Optional)</Text>
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
                {dueDate ? dueDate : 'Select due date'}
              </Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={themeColors.textSecondary}
              />
            </View>
          </TouchableOpacity>

          {showDatePicker && (
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
                style={styles.datePicker}
              />
              {Platform.OS === 'ios' && (
                <View style={styles.datePickerActions}>
                  <TouchableOpacity
                    style={styles.datePickerCancelButton}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.datePickerCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.datePickerDoneButton}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.datePickerDoneText}>Done</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Estimated Duration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estimated Duration (Optional)</Text>
          <TextInput
            style={styles.input}
            value={estimatedDuration}
            onChangeText={setEstimatedDuration}
            placeholder="e.g., 30 minutes, 1 hour, 2 days"
            placeholderTextColor={themeColors.textSecondary}
          />
        </View>

        {/* Assign Button */}
        <TouchableOpacity
          style={[
            styles.assignButton,
            isLoading && styles.assignButtonDisabled,
          ]}
          onPress={handleAssignTask}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={themeColors.surface} />
          ) : (
            <>
              <Ionicons name="list" size={20} color={themeColors.surface} />
              <Text style={styles.assignButtonText}>Assign Task</Text>
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
    backgroundColor: themeColors.success,
    borderColor: themeColors.success,
  },
  categoryButtonText: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.SMALL),
    color: themeColors.text_PRIMARY,
  },
  categoryButtonTextSelected: {
    color: themeColors.surface,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
  difficultyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM,
  },
  difficultyButton: {
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
  difficultyButtonSelected: {
    backgroundColor: themeColors.background_LIGHT,
    borderWidth: 3,
    shadowColor: themeColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    transform: [{ scale: 1.02 }],
  },
  difficultyIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: RESPONSIVE.getSpacing(SPACING.SM),
    borderWidth: 2,
    borderColor: themeColors.surface,
  },
  difficultyButtonText: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.SMALL),
    color: themeColors.text_PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  difficultyButtonTextSelected: {
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
  },
  difficultyCheckmark: {
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
  assignButton: {
    backgroundColor: themeColors.success,
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
