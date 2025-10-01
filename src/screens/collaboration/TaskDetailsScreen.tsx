// Task Details Screen
// Shows detailed information about a specific task and allows editing

import React, { useState, useEffect } from 'react';
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
import { Picker } from '@react-native-picker/picker';
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
  COMPONENT_STYLES,
} from '../../constants';
import TherapistService from '../../services/therapistService';
import {
  StandardInput,
  StandardPicker,
} from '../../components/common/StandardInput';
import StandardButton from '../../components/common/StandardButton';
import StandardDropdown from '../../components/common/StandardDropdown';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { getThemeColors } from '../../utils/themeUtils';

interface TaskDetailsScreenProps {
  route: {
    params: {
      taskId: string;
      patientId: string;
      patientName?: string;
    };
  };
}

export default function TaskDetailsScreen() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const navigation = useNavigation();
  const route = useRoute();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [task, setTask] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    difficulty: 'medium',
    estimatedDuration: '',
    notes: '',
    instructions: [] as string[],
    dueDate: '',
  });
  const [editingInstructions, setEditingInstructions] = useState(false);
  const [newInstruction, setNewInstruction] = useState('');
  const [editingInstructionIndex, setEditingInstructionIndex] = useState<
    number | null
  >(null);
  const [editingInstructionText, setEditingInstructionText] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { taskId, patientId, patientName } = route.params as {
    taskId: string;
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
    }
  };

  const showDatePickerModal = () => {
    console.log('Opening date picker...');
    console.log('Platform:', Platform.OS);
    console.log('DateTimePicker available:', !!DateTimePicker);

    // Set selectedDate to current editForm.dueDate if it exists, otherwise use current date
    if (editForm.dueDate) {
      setSelectedDate(new Date(editForm.dueDate));
    } else {
      setSelectedDate(new Date());
    }

    setShowDatePicker(true);
  };

  useEffect(() => {
    loadTaskDetails();
  }, [taskId]);

  const loadTaskDetails = async () => {
    try {
      setIsLoading(true);
      const therapistService = TherapistService.getInstance();
      const taskDetails = await therapistService.getTaskDetails(taskId);
      setTask(taskDetails);
      setEditedTask(taskDetails);

      // Initialize edit form with task data
      setEditForm({
        title: taskDetails.title || '',
        description: taskDetails.description || '',
        priority: taskDetails.priority || 'medium',
        difficulty: taskDetails.difficulty || 'medium',
        estimatedDuration: taskDetails.estimatedDuration || '',
        notes: taskDetails.notes || '',
        instructions: taskDetails.instructions || [],
        dueDate: taskDetails.dueDate ? formatDate(taskDetails.dueDate) : '',
      });
    } catch (error) {
      console.error('Error loading task details:', error);
      Alert.alert('Error', 'Failed to load task details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!task) return;

    try {
      const therapistService = TherapistService.getInstance();
      const updatedTask = { ...task, ...editForm };
      await therapistService.editTask(taskId, updatedTask);

      setTask(updatedTask);
      setIsEditing(false);

      Alert.alert('Success', 'Task updated successfully!');
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert('Error', 'Failed to save task changes');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingInstructions(false);
    setEditingInstructionIndex(null);
    setEditingInstructionText('');
    setNewInstruction('');
    // Reset form to original task data
    if (task) {
      setEditForm({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        difficulty: task.difficulty || 'medium',
        estimatedDuration: task.estimatedDuration || '',
        notes: task.notes || '',
        instructions: task.instructions || [],
        dueDate: task.dueDate ? formatDate(task.dueDate) : '',
      });
    }
  };

  const handleAddInstruction = () => {
    if (!newInstruction.trim()) {
      Alert.alert('Error', 'Please enter an instruction');
      return;
    }

    setEditForm({
      ...editForm,
      instructions: [...editForm.instructions, newInstruction.trim()],
    });
    setNewInstruction('');
  };

  const handleEditInstruction = (index: number, currentText: string) => {
    setEditingInstructionIndex(index);
    setEditingInstructionText(currentText);
  };

  const handleSaveInstructionEdit = (index: number) => {
    if (!editingInstructionText.trim()) {
      Alert.alert('Error', 'Please enter an instruction');
      return;
    }

    const updatedInstructions = [...editForm.instructions];
    updatedInstructions[index] = editingInstructionText.trim();

    setEditForm({
      ...editForm,
      instructions: updatedInstructions,
    });

    setEditingInstructionIndex(null);
    setEditingInstructionText('');
  };

  const handleCancelInstructionEdit = () => {
    setEditingInstructionIndex(null);
    setEditingInstructionText('');
  };

  const handleDeleteInstruction = (index: number) => {
    Alert.alert(
      'Delete Instruction',
      'Are you sure you want to delete this instruction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedInstructions = editForm.instructions.filter(
              (_, i) => i !== index
            );
            setEditForm({
              ...editForm,
              instructions: updatedInstructions,
            });
          },
        },
      ]
    );
  };

  const handleUpdateProgress = async () => {
    if (!task) return;

    Alert.prompt(
      'Update Progress',
      'Enter new progress percentage (0-100):',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async progressText => {
            const progress = parseInt(progressText || '0');
            if (isNaN(progress) || progress < 0 || progress > 100) {
              Alert.alert(
                'Error',
                'Please enter a valid progress percentage (0-100)'
              );
              return;
            }

            try {
              const therapistService = TherapistService.getInstance();
              await therapistService.updateTaskProgress(taskId, progress);

              setTask({ ...task, progress });
              Alert.alert('Success', 'Progress updated successfully!');
            } catch (error) {
              console.error('Error updating progress:', error);
              Alert.alert('Error', 'Failed to update progress');
            }
          },
        },
      ],
      'plain-text',
      task.progress.toString()
    );
  };

  const handleUpdateStatus = async () => {
    if (!task) return;

    const statusOptions = [
      { label: 'Assigned', value: 'assigned' },
      { label: 'In Progress', value: 'in-progress' },
      { label: 'Completed', value: 'completed' },
      { label: 'On Hold', value: 'on-hold' },
      { label: 'Cancelled', value: 'cancelled' },
    ];

    Alert.alert('Update Status', 'Select new status for this task:', [
      { text: 'Cancel', style: 'cancel' },
      ...statusOptions.map(option => ({
        text: option.label,
        onPress: async () => {
          try {
            const therapistService = TherapistService.getInstance();
            await therapistService.updateTaskProgress(
              taskId,
              task.progress,
              option.value
            );

            setTask({ ...task, status: option.value });
            Alert.alert('Success', `Status updated to ${option.label}!`);
          } catch (error) {
            console.error('Error updating status:', error);
            Alert.alert('Error', 'Failed to update status');
          }
        },
      })),
    ]);
  };

  const handleCompleteTask = async () => {
    Alert.prompt(
      'Complete Task',
      'Add completion notes (optional):',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async notes => {
            try {
              const therapistService = TherapistService.getInstance();
              await therapistService.completeTask(taskId, notes);

              setTask({ ...task, status: 'completed', progress: 100 });
              Alert.alert('Success', 'Task completed successfully!');
            } catch (error) {
              console.error('Error completing task:', error);
              Alert.alert('Error', 'Failed to complete task');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return themeColors.warning;
      case 'in-progress':
        return themeColors.primary;
      case 'completed':
        return themeColors.success;
      case 'cancelled':
        return themeColors.error;
      default:
        return themeColors.textSecondary;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return themeColors.error;
      case 'medium':
        return themeColors.warning;
      case 'low':
        return themeColors.success;
      default:
        return themeColors.textSecondary;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return themeColors.success;
      case 'medium':
        return themeColors.warning;
      case 'hard':
        return themeColors.error;
      default:
        return themeColors.textSecondary;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: themeColors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text
            style={[styles.loadingText, { color: themeColors.textSecondary }]}
          >
            Loading task details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!task) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: themeColors.background }]}
      >
        <View style={styles.errorContainer}>
          <Ionicons
            name="document-outline"
            size={64}
            color={themeColors.textSecondary}
          />
          <Text
            style={[styles.errorText, { color: themeColors.textSecondary }]}
          >
            Task not found
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={themeColors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: themeColors.text }]}>
          Task Details
        </Text>
        <TouchableOpacity
          style={[
            styles.editIconButton,
            {
              backgroundColor: themeColors.background,
              borderColor: themeColors.border,
            },
          ]}
          onPress={() => setIsEditing(!isEditing)}
          accessible={true}
          accessibilityLabel={isEditing ? 'Cancel editing' : 'Edit task'}
          accessibilityRole="button"
        >
          <Ionicons
            name={isEditing ? 'close-circle' : 'pencil'}
            size={RESPONSIVE.getIconSize(24)}
            color={themeColors.primary}
          />
        </TouchableOpacity>
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

        {/* Task Title and Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Task Information</Text>
          <View style={styles.taskCard}>
            {isEditing ? (
              <View style={styles.editForm}>
                <StandardInput
                  label="Task Title"
                  value={editForm.title}
                  onChangeText={text =>
                    setEditForm({ ...editForm, title: text })
                  }
                  placeholder="Enter task title"
                  required
                />

                <StandardInput
                  label="Description"
                  value={editForm.description}
                  onChangeText={text =>
                    setEditForm({ ...editForm, description: text })
                  }
                  placeholder="Enter task description"
                  multiline
                  numberOfLines={4}
                />

                <View style={styles.formRow}>
                  <View style={styles.formGroup}>
                    <StandardDropdown
                      label="Priority"
                      selectedValue={editForm.priority}
                      onValueChange={value =>
                        setEditForm({ ...editForm, priority: value })
                      }
                      items={[
                        { label: 'Low', value: 'low' },
                        { label: 'Medium', value: 'medium' },
                        { label: 'High', value: 'high' },
                      ]}
                      placeholder="Select priority"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <StandardDropdown
                      label="Difficulty"
                      selectedValue={editForm.difficulty}
                      onValueChange={value =>
                        setEditForm({ ...editForm, difficulty: value })
                      }
                      items={[
                        { label: 'Easy', value: 'easy' },
                        { label: 'Medium', value: 'medium' },
                        { label: 'Hard', value: 'hard' },
                      ]}
                      placeholder="Select difficulty"
                    />
                  </View>
                </View>

                <StandardInput
                  label="Estimated Duration"
                  value={editForm.estimatedDuration}
                  onChangeText={text =>
                    setEditForm({ ...editForm, estimatedDuration: text })
                  }
                  placeholder="e.g., 15 minutes"
                />

                <View style={styles.formRow}>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Due Date</Text>
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
                          {editForm.dueDate
                            ? editForm.dueDate
                            : 'Select due date'}
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
                      <Text style={styles.fallbackLabel}>
                        Or enter manually:
                      </Text>
                      <TextInput
                        style={styles.fallbackInput}
                        value={editForm.dueDate}
                        onChangeText={text =>
                          setEditForm({ ...editForm, dueDate: text })
                        }
                        placeholder="YYYY-MM-DD (e.g., 2024-12-31)"
                        placeholderTextColor={themeColors.textSecondary}
                      />
                    </View>
                  </View>
                </View>

                <StandardInput
                  label="Notes"
                  value={editForm.notes}
                  onChangeText={text =>
                    setEditForm({ ...editForm, notes: text })
                  }
                  placeholder="Enter task notes"
                  multiline
                  numberOfLines={3}
                />

                {/* Instructions */}
                <View style={styles.instructionsSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.formLabel}>Instructions</Text>
                    <TouchableOpacity
                      style={styles.addInstructionButton}
                      onPress={() =>
                        setEditingInstructions(!editingInstructions)
                      }
                    >
                      <Ionicons
                        name={editingInstructions ? 'remove' : 'add'}
                        size={20}
                        color={themeColors.surface}
                      />
                      <Text style={styles.addInstructionButtonText}>
                        {editingInstructions ? 'Hide' : 'Add'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {editingInstructions && (
                    <View style={styles.addInstructionContainer}>
                      <TextInput
                        style={styles.instructionInput}
                        value={newInstruction}
                        onChangeText={setNewInstruction}
                        placeholder="Enter new instruction"
                        multiline
                      />
                      <TouchableOpacity
                        style={styles.addInstructionConfirmButton}
                        onPress={handleAddInstruction}
                      >
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={themeColors.surface}
                        />
                      </TouchableOpacity>
                    </View>
                  )}

                  <View style={styles.instructionsList}>
                    {editForm.instructions.map(
                      (instruction: string, index: number) => (
                        <View key={index} style={styles.instructionItem}>
                          {editingInstructionIndex === index ? (
                            <View style={styles.instructionEditContainer}>
                              <TextInput
                                style={styles.instructionEditInput}
                                value={editingInstructionText}
                                onChangeText={setEditingInstructionText}
                                placeholder="Enter instruction"
                                multiline
                              />
                              <View style={styles.instructionEditButtons}>
                                <TouchableOpacity
                                  style={[
                                    styles.instructionEditButton,
                                    styles.instructionSaveButton,
                                  ]}
                                  onPress={() =>
                                    handleSaveInstructionEdit(index)
                                  }
                                >
                                  <Ionicons
                                    name="checkmark"
                                    size={16}
                                    color={themeColors.surface}
                                  />
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={[
                                    styles.instructionEditButton,
                                    styles.instructionCancelButton,
                                  ]}
                                  onPress={handleCancelInstructionEdit}
                                >
                                  <Ionicons
                                    name="close"
                                    size={16}
                                    color={themeColors.surface}
                                  />
                                </TouchableOpacity>
                              </View>
                            </View>
                          ) : (
                            <>
                              <Text style={styles.instructionNumber}>
                                {index + 1}.
                              </Text>
                              <Text style={styles.instructionText}>
                                {instruction}
                              </Text>
                              <View style={styles.instructionActions}>
                                <TouchableOpacity
                                  style={styles.instructionActionButton}
                                  onPress={() =>
                                    handleEditInstruction(index, instruction)
                                  }
                                >
                                  <Ionicons
                                    name="pencil"
                                    size={16}
                                    color={themeColors.primary}
                                  />
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={styles.instructionActionButton}
                                  onPress={() => handleDeleteInstruction(index)}
                                >
                                  <Ionicons
                                    name="trash"
                                    size={16}
                                    color={themeColors.error}
                                  />
                                </TouchableOpacity>
                              </View>
                            </>
                          )}
                        </View>
                      )
                    )}
                  </View>
                </View>

                <View style={styles.editButtons}>
                  <StandardButton
                    title="Save"
                    onPress={handleSaveChanges}
                    variant="success"
                    size="medium"
                    icon="checkmark"
                    iconPosition="left"
                    style={styles.saveButton}
                  />

                  <StandardButton
                    title="Cancel"
                    onPress={handleCancelEdit}
                    variant="error"
                    size="medium"
                    icon="close"
                    iconPosition="left"
                    style={styles.cancelButton}
                  />
                </View>
              </View>
            ) : (
              <>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(task.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {task.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.taskDescription}>{task.description}</Text>

                <View style={styles.taskMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons
                      name="flag"
                      size={16}
                      color={getPriorityColor(task.priority)}
                    />
                    <Text
                      style={[
                        styles.metaText,
                        { color: getPriorityColor(task.priority) },
                      ]}
                    >
                      {task.priority} Priority
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons
                      name="trending-up"
                      size={16}
                      color={getDifficultyColor(task.difficulty)}
                    />
                    <Text
                      style={[
                        styles.metaText,
                        { color: getDifficultyColor(task.difficulty) },
                      ]}
                    >
                      {task.difficulty} Difficulty
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons
                      name="time"
                      size={16}
                      color={themeColors.textSecondary}
                    />
                    <Text style={styles.metaText}>
                      {task.estimatedDuration}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                Progress: {task.progress}%
              </Text>
              <Text style={styles.sessionsLabel}>
                Sessions: {task.completedSessions}/{task.totalSessions}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${task.progress}%` }]}
              />
            </View>
            <Text style={styles.dueDate}>
              Due:{' '}
              {task.dueDate
                ? typeof task.dueDate === 'string'
                  ? new Date(task.dueDate).toLocaleDateString()
                  : task.dueDate.toLocaleDateString()
                : 'No due date'}
            </Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <View style={styles.instructionsCard}>
            {task.instructions.map((instruction: string, index: number) => (
              <View key={index} style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>{index + 1}.</Text>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Notes */}
        {task.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{task.notes}</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.progressButton]}
            onPress={handleUpdateProgress}
          >
            <Ionicons
              name="trending-up"
              size={20}
              color={themeColors.surface}
            />
            <Text style={styles.actionButtonText}>Update Progress</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.statusButton]}
            onPress={handleUpdateStatus}
          >
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={themeColors.surface}
            />
            <Text style={styles.actionButtonText}>Update Status</Text>
          </TouchableOpacity>

          {task.status !== 'completed' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={handleCompleteTask}
            >
              <Ionicons
                name="checkmark"
                size={20}
                color={themeColors.surface}
              />
              <Text style={styles.actionButtonText}>Complete Task</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

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
              <Text style={styles.modalTitle}>Select Due Date</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Ionicons name="close" size={24} color={themeColors.text} />
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
                  setEditForm({
                    ...editForm,
                    dueDate: formatDate(selectedDate),
                  });
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.modalConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor will be set dynamically based on theme
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.MD,
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    // color will be set dynamically based on theme
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.XL,
  },
  errorText: {
    marginTop: SPACING.MD,
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.LARGE),
    // color will be set dynamically based on theme
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderBottomWidth: 1,
    // borderBottomColor will be set dynamically based on theme
  },
  backButton: {
    padding: SPACING.SM,
  },
  title: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.TITLE),
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    // color will be set dynamically based on theme
  },
  editIconButton: {
    padding: RESPONSIVE.getSpacing(SPACING.SM),
    borderRadius: BORDER_RADIUS.SM,
    // backgroundColor will be set dynamically based on theme
    borderWidth: 1,
    // borderColor will be set dynamically based on theme
    minWidth: RESPONSIVE.getSpacing(44),
    minHeight: RESPONSIVE.getSpacing(44),
    alignItems: 'center',
    justifyContent: 'center',
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
    // color will be set dynamically based on theme
    marginBottom: SPACING.MD,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor will be set dynamically based on theme
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    // borderColor will be set dynamically based on theme
  },
  patientName: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    // color will be set dynamically based on theme
    marginLeft: SPACING.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  taskCard: {
    // backgroundColor will be set dynamically based on theme
    padding: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    // borderColor will be set dynamically based on theme
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.MD,
  },
  taskTitle: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.LARGE),
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    // color will be set dynamically based on theme
    flex: 1,
    marginRight: SPACING.SM,
  },
  statusBadge: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
  },
  statusText: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.XS),
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    // color will be set dynamically based on theme
  },
  taskDescription: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    // color will be set dynamically based on theme
    marginBottom: SPACING.MD,
    lineHeight: 20,
  },
  taskMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor will be set dynamically based on theme
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
  },
  metaText: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.SMALL),
    marginLeft: SPACING.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  progressCard: {
    // backgroundColor will be set dynamically based on theme
    padding: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    // borderColor will be set dynamically based on theme
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  progressLabel: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    // color will be set dynamically based on theme
  },
  sessionsLabel: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.SMALL),
    // color will be set dynamically based on theme
  },
  progressBar: {
    height: 12,
    // backgroundColor will be set dynamically based on theme
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: SPACING.SM,
  },
  progressFill: {
    height: '100%',
    // backgroundColor will be set dynamically based on theme
    borderRadius: 6,
  },
  dueDate: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.SMALL),
    // color will be set dynamically based on theme
  },
  instructionsCard: {
    // backgroundColor will be set dynamically based on theme
    padding: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    // borderColor will be set dynamically based on theme
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: SPACING.SM,
  },
  instructionNumber: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.primary,
    marginRight: SPACING.SM,
    minWidth: 20,
  },
  instructionText: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    // color will be set dynamically based on theme
    flex: 1,
    lineHeight: 20,
  },
  instructionsSection: {
    marginBottom: RESPONSIVE.getSpacing(SPACING.LG),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: RESPONSIVE.getSpacing(SPACING.SM),
  },
  addInstructionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor will be set dynamically based on theme
    paddingHorizontal: RESPONSIVE.getSpacing(SPACING.SM),
    paddingVertical: RESPONSIVE.getSpacing(SPACING.XS),
    borderRadius: BORDER_RADIUS.SM,
  },
  addInstructionButtonText: {
    // color will be set dynamically based on theme
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.SMALL),
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    marginLeft: RESPONSIVE.getSpacing(SPACING.XS),
  },
  addInstructionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: RESPONSIVE.getSpacing(SPACING.SM),
    gap: RESPONSIVE.getSpacing(SPACING.SM),
  },
  instructionInput: {
    flex: 1,
    // backgroundColor will be set dynamically based on theme
    borderWidth: 1,
    // borderColor will be set dynamically based on theme
    borderRadius: BORDER_RADIUS.SM,
    padding: RESPONSIVE.getSpacing(SPACING.SM),
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    // color will be set dynamically based on theme
    minHeight: 60,
    textAlignVertical: 'top',
  },
  addInstructionConfirmButton: {
    backgroundColor: themeColors.success,
    padding: RESPONSIVE.getSpacing(SPACING.SM),
    borderRadius: BORDER_RADIUS.SM,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
    minHeight: 50,
  },
  instructionsList: {
    // backgroundColor will be set dynamically based on theme
    padding: RESPONSIVE.getSpacing(SPACING.MD),
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    // borderColor will be set dynamically based on theme
  },
  instructionEditContainer: {
    flex: 1,
  },
  instructionEditInput: {
    // backgroundColor will be set dynamically based on theme
    borderWidth: 1,
    // borderColor will be set dynamically based on theme
    borderRadius: BORDER_RADIUS.SM,
    padding: RESPONSIVE.getSpacing(SPACING.SM),
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    // color will be set dynamically based on theme
    marginBottom: RESPONSIVE.getSpacing(SPACING.SM),
    minHeight: 60,
    textAlignVertical: 'top',
  },
  instructionEditButtons: {
    flexDirection: 'row',
    gap: RESPONSIVE.getSpacing(SPACING.SM),
  },
  instructionEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: RESPONSIVE.getSpacing(SPACING.SM),
    borderRadius: BORDER_RADIUS.SM,
    minWidth: 50,
    minHeight: 36,
  },
  instructionSaveButton: {
    backgroundColor: themeColors.success,
    shadowColor: themeColors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionCancelButton: {
    backgroundColor: themeColors.error,
    shadowColor: themeColors.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: RESPONSIVE.getSpacing(SPACING.XS),
  },
  instructionActionButton: {
    padding: RESPONSIVE.getSpacing(SPACING.XS),
    borderRadius: BORDER_RADIUS.SM,
    // backgroundColor will be set dynamically based on theme
    borderWidth: 1,
    // borderColor will be set dynamically based on theme
  },
  notesCard: {
    // backgroundColor will be set dynamically based on theme
    padding: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    // borderColor will be set dynamically based on theme
  },
  notesText: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    // color will be set dynamically based on theme
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.SM,
    marginTop: SPACING.XL,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
  },
  progressButton: {
    // backgroundColor will be set dynamically based on theme
  },
  statusButton: {
    backgroundColor: themeColors.warning,
  },
  completeButton: {
    backgroundColor: themeColors.success,
  },
  actionButtonText: {
    // color will be set dynamically based on theme
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    marginLeft: SPACING.SM,
  },
  backButtonText: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    color: themeColors.primary,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  editForm: {
    padding: SPACING.MD,
  },
  formLabel: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    // color will be set dynamically based on theme
    marginBottom: SPACING.SM,
    marginTop: SPACING.MD,
  },
  textInput: {
    // backgroundColor will be set dynamically based on theme
    borderWidth: 1,
    // borderColor will be set dynamically based on theme
    borderRadius: BORDER_RADIUS.SM,
    padding: SPACING.SM,
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    // color will be set dynamically based on theme
    marginBottom: SPACING.SM,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  formRow: {
    flexDirection: 'row',
    gap: SPACING.SM,
  },
  formGroup: {
    flex: 1,
  },
  pickerContainer: {
    // backgroundColor will be set dynamically based on theme
    borderWidth: 1,
    // borderColor will be set dynamically based on theme
    borderRadius: BORDER_RADIUS.SM,
    marginBottom: SPACING.SM,
  },
  picker: {
    height: 50,
    // color will be set dynamically based on theme
  },
  editButtons: {
    flexDirection: 'row',
    gap: RESPONSIVE.getSpacing(SPACING.SM),
    marginTop: RESPONSIVE.getSpacing(SPACING.LG),
  },
  saveButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
  datePickerButton: {
    // backgroundColor will be set dynamically based on theme
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    // borderColor will be set dynamically based on theme
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
    // color will be set dynamically based on theme
    marginLeft: RESPONSIVE.getSpacing(SPACING.SM),
  },
  fallbackInputContainer: {
    marginTop: RESPONSIVE.getSpacing(SPACING.SM),
  },
  fallbackLabel: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.SMALL),
    // color will be set dynamically based on theme
    marginBottom: RESPONSIVE.getSpacing(SPACING.XS),
  },
  fallbackInput: {
    // backgroundColor will be set dynamically based on theme
    borderWidth: 1,
    // borderColor will be set dynamically based on theme
    borderRadius: BORDER_RADIUS.MD,
    padding: RESPONSIVE.getSpacing(SPACING.MD),
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    // color will be set dynamically based on theme
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
    // color will be set dynamically based on theme
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
    // backgroundColor will be set dynamically based on theme
    paddingVertical: RESPONSIVE.getSpacing(SPACING.MD),
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
    borderWidth: 1,
    // borderColor will be set dynamically based on theme
  },
  modalCancelText: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    // color will be set dynamically based on theme
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  modalConfirmButton: {
    flex: 1,
    // backgroundColor will be set dynamically based on theme
    paddingVertical: RESPONSIVE.getSpacing(SPACING.MD),
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    // color will be set dynamically based on theme
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
});
