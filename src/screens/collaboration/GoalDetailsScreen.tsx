// Goal Details Screen
// Shows detailed information about a specific goal and allows editing

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
} from '../../constants';
import TherapistService from '../../services/therapistService';
import {
  StandardInput,
  StandardPicker,
} from '../../components/common/StandardInput';
import StandardButton from '../../components/common/StandardButton';
import StandardDropdown from '../../components/common/StandardDropdown';

interface GoalDetailsScreenProps {
  route: {
    params: {
      goalId: string;
      patientId: string;
      patientName?: string;
    };
  };
}

export default function GoalDetailsScreen() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const navigation = useNavigation();
  const route = useRoute();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [goal, setGoal] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: 'Communication',
    priority: 'medium',
    targetDate: '',
  });
  const [newMilestoneText, setNewMilestoneText] = useState('');
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);
  const [milestoneEditText, setMilestoneEditText] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { goalId, patientId, patientName } = route.params as {
    goalId: string;
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

    // Set selectedDate to current editForm.targetDate if it exists, otherwise use current date
    if (editForm.targetDate) {
      setSelectedDate(new Date(editForm.targetDate));
    } else {
      setSelectedDate(new Date());
    }

    setShowDatePicker(true);
  };

  useEffect(() => {
    loadGoalDetails();
  }, [goalId]);

  const loadGoalDetails = async () => {
    try {
      setIsLoading(true);
      const therapistService = TherapistService.getInstance();
      const goalDetails = await therapistService.getGoalDetails(goalId);

      if (goalDetails) {
        setGoal(goalDetails);

        // Initialize edit form with goal data
        setEditForm({
          title: goalDetails.title || '',
          description: goalDetails.description || '',
          category: goalDetails.category || 'Communication',
          priority: goalDetails.priority || 'medium',
          targetDate: goalDetails.targetDate || '',
        });
      } else {
        Alert.alert('Error', 'Goal not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading goal details:', error);
      Alert.alert('Error', 'Failed to load goal details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!goal) return;

    try {
      const therapistService = TherapistService.getInstance();
      const updatedGoal = { ...goal, ...editForm };
      await therapistService.editGoal(goalId, editForm);

      setGoal(updatedGoal);
      setIsEditing(false);

      Alert.alert('Success', 'Goal updated successfully!');
    } catch (error) {
      console.error('Error saving goal:', error);
      Alert.alert('Error', 'Failed to save goal changes');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to original goal data
    if (goal) {
      setEditForm({
        title: goal.title || '',
        description: goal.description || '',
        category: goal.category || 'Communication',
        priority: goal.priority || 'medium',
        targetDate: goal.targetDate || '',
      });
    }
  };

  const handleUpdateProgress = async () => {
    if (!goal) return;

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
              await therapistService.updateGoalProgress(goalId, progress);

              setGoal({ ...goal, progress });
              Alert.alert('Success', 'Progress updated successfully!');
            } catch (error) {
              console.error('Error updating progress:', error);
              Alert.alert('Error', 'Failed to update progress');
            }
          },
        },
      ],
      'plain-text',
      goal.progress.toString()
    );
  };

  const handleUpdateStatus = async () => {
    if (!goal) return;

    const statusOptions = [
      { label: 'Active', value: 'active' },
      { label: 'Paused', value: 'paused' },
      { label: 'Completed', value: 'completed' },
      { label: 'Cancelled', value: 'cancelled' },
    ];

    Alert.alert('Update Status', 'Select new status for this goal:', [
      { text: 'Cancel', style: 'cancel' },
      ...statusOptions.map(option => ({
        text: option.label,
        onPress: async () => {
          try {
            const therapistService = TherapistService.getInstance();
            await therapistService.updateGoalProgress(
              goalId,
              goal.progress,
              option.value
            );

            setGoal({ ...goal, status: option.value });
            Alert.alert('Success', `Status updated to ${option.label}!`);
          } catch (error) {
            console.error('Error updating status:', error);
            Alert.alert('Error', 'Failed to update status');
          }
        },
      })),
    ]);
  };

  const handleAddMilestone = async () => {
    Alert.prompt(
      'Add Milestone',
      'Enter milestone description:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async description => {
            if (!description || description.trim() === '') {
              Alert.alert('Error', 'Please enter a milestone description');
              return;
            }

            try {
              const therapistService = TherapistService.getInstance();
              const newMilestone = {
                id: 'milestone-' + Date.now(),
                description: description.trim(),
                completed: false,
                date: new Date().toISOString().split('T')[0],
              };

              await therapistService.addGoalMilestone(goalId, newMilestone);

              const updatedMilestones = [
                ...(goal.milestones || []),
                newMilestone,
              ];
              setGoal({ ...goal, milestones: updatedMilestones });

              Alert.alert('Success', 'Milestone added successfully!');
            } catch (error) {
              console.error('Error adding milestone:', error);
              Alert.alert('Error', 'Failed to add milestone');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleEditMilestone = (
    milestoneId: string,
    currentDescription: string
  ) => {
    setEditingMilestone(milestoneId);
    setMilestoneEditText(currentDescription);
  };

  const handleSaveMilestoneEdit = async (milestoneId: string) => {
    if (!milestoneEditText.trim()) {
      Alert.alert('Error', 'Please enter a milestone description');
      return;
    }

    try {
      const therapistService = TherapistService.getInstance();
      // In a real app, you'd call a service method to update the milestone
      console.log(
        `Updating milestone ${milestoneId} with description: ${milestoneEditText}`
      );

      setGoal((prev: any) => {
        const updatedMilestones = prev.milestones.map((m: any) =>
          m.id === milestoneId
            ? { ...m, description: milestoneEditText.trim() }
            : m
        );
        return { ...prev, milestones: updatedMilestones };
      });

      setEditingMilestone(null);
      setMilestoneEditText('');
      Alert.alert('Success', 'Milestone updated successfully!');
    } catch (error) {
      console.error('Error updating milestone:', error);
      Alert.alert('Error', 'Failed to update milestone');
    }
  };

  const handleCancelMilestoneEdit = () => {
    setEditingMilestone(null);
    setMilestoneEditText('');
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    Alert.alert(
      'Delete Milestone',
      'Are you sure you want to delete this milestone?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const therapistService = TherapistService.getInstance();
              // In a real app, you'd call a service method to delete the milestone
              console.log(`Deleting milestone ${milestoneId}`);

              setGoal((prev: any) => {
                const updatedMilestones = prev.milestones.filter(
                  (m: any) => m.id !== milestoneId
                );
                return { ...prev, milestones: updatedMilestones };
              });

              Alert.alert('Success', 'Milestone deleted successfully!');
            } catch (error) {
              console.error('Error deleting milestone:', error);
              Alert.alert('Error', 'Failed to delete milestone');
            }
          },
        },
      ]
    );
  };

  const handleToggleMilestone = (milestoneId: string) => {
    setGoal((prev: any) => {
      const updatedMilestones = prev.milestones.map((m: any) =>
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      );
      // In a real app, you'd call a service method to update the backend
      console.log(
        `Toggling milestone ${milestoneId}. New state:`,
        updatedMilestones.find((m: any) => m.id === milestoneId)?.completed
      );
      return { ...prev, milestones: updatedMilestones };
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return themeColors.primary;
      case 'completed':
        return themeColors.success;
      case 'paused':
        return themeColors.warning;
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={styles.loadingText}>Loading goal details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!goal) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons
            name="flag-outline"
            size={64}
            color={themeColors.textSecondary}
          />
          <Text style={styles.errorText}>Goal not found</Text>
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={themeColors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Goal Details</Text>
        <TouchableOpacity
          style={styles.editIconButton}
          onPress={() => setIsEditing(!isEditing)}
          accessible={true}
          accessibilityLabel={isEditing ? 'Cancel editing' : 'Edit goal'}
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

        {/* Goal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Goal Information</Text>
          <View style={styles.goalCard}>
            {isEditing ? (
              <View style={styles.editForm}>
                <StandardInput
                  label="Goal Title"
                  value={editForm.title}
                  onChangeText={text =>
                    setEditForm({ ...editForm, title: text })
                  }
                  placeholder="Enter goal title"
                  required
                />

                <StandardInput
                  label="Description"
                  value={editForm.description}
                  onChangeText={text =>
                    setEditForm({ ...editForm, description: text })
                  }
                  placeholder="Enter goal description"
                  multiline
                  numberOfLines={4}
                />

                <View style={styles.formRow}>
                  <View style={styles.formGroup}>
                    <StandardDropdown
                      label="Category"
                      selectedValue={editForm.category}
                      onValueChange={value =>
                        setEditForm({ ...editForm, category: value })
                      }
                      items={[
                        { label: 'Communication', value: 'Communication' },
                        { label: 'Social Skills', value: 'Social Skills' },
                        { label: 'Behavior', value: 'Behavior' },
                        { label: 'Academic', value: 'Academic' },
                        { label: 'Motor Skills', value: 'Motor Skills' },
                        { label: 'Self-Care', value: 'Self-Care' },
                      ]}
                      placeholder="Select category"
                    />
                  </View>

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
                </View>

                <View style={styles.formRow}>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Target Date</Text>
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
                          {editForm.targetDate
                            ? editForm.targetDate
                            : 'Select target date'}
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
                        value={editForm.targetDate}
                        onChangeText={text =>
                          setEditForm({ ...editForm, targetDate: text })
                        }
                        placeholder="YYYY-MM-DD (e.g., 2024-12-31)"
                        placeholderTextColor={themeColors.textSecondary}
                      />
                    </View>
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
                <View style={styles.goalHeader}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(goal.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {goal.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.goalDescription}>{goal.description}</Text>

                <View style={styles.goalMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons
                      name="flag"
                      size={16}
                      color={getPriorityColor(goal.priority)}
                    />
                    <Text
                      style={[
                        styles.metaText,
                        { color: getPriorityColor(goal.priority) },
                      ]}
                    >
                      {goal.priority} Priority
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons
                      name="folder"
                      size={16}
                      color={themeColors.textSecondary}
                    />
                    <Text style={styles.metaText}>{goal.category}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons
                      name="calendar"
                      size={16}
                      color={themeColors.textSecondary}
                    />
                    <Text style={styles.metaText}>{goal.targetDate}</Text>
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
                Progress: {goal.progress}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${goal.progress}%` }]}
              />
            </View>
            <Text style={styles.lastUpdated}>
              Last Updated:{' '}
              {goal.lastUpdated
                ? new Date(goal.lastUpdated).toLocaleDateString()
                : 'Never'}
            </Text>
          </View>
        </View>

        {/* Milestones */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Milestones</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddMilestone}
            >
              <Ionicons name="add" size={20} color={themeColors.surface} />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.milestonesCard}>
            {goal.milestones && goal.milestones.length > 0 ? (
              goal.milestones.map((milestone: any, index: number) => (
                <View key={milestone.id || index} style={styles.milestoneItem}>
                  <TouchableOpacity
                    onPress={() => handleToggleMilestone(milestone.id)}
                    style={styles.milestoneToggle}
                  >
                    <Ionicons
                      name={
                        milestone.completed
                          ? 'checkmark-circle'
                          : 'ellipse-outline'
                      }
                      size={20}
                      color={
                        milestone.completed
                          ? themeColors.success
                          : themeColors.textSecondary
                      }
                    />
                  </TouchableOpacity>

                  <View style={styles.milestoneContent}>
                    {editingMilestone === milestone.id ? (
                      <View style={styles.milestoneEditContainer}>
                        <TextInput
                          style={styles.milestoneEditInput}
                          value={milestoneEditText}
                          onChangeText={setMilestoneEditText}
                          placeholder="Enter milestone description"
                          multiline
                        />
                        <View style={styles.milestoneEditButtons}>
                          <TouchableOpacity
                            style={[
                              styles.milestoneEditButton,
                              styles.milestoneSaveButton,
                            ]}
                            onPress={() =>
                              handleSaveMilestoneEdit(milestone.id)
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
                              styles.milestoneEditButton,
                              styles.milestoneCancelButton,
                            ]}
                            onPress={handleCancelMilestoneEdit}
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
                        <Text
                          style={[
                            styles.milestoneText,
                            milestone.completed && styles.milestoneCompleted,
                          ]}
                        >
                          {milestone.description}
                        </Text>
                        <Text style={styles.milestoneDate}>
                          {milestone.completed
                            ? `Completed: ${milestone.date}`
                            : `Target: ${milestone.date}`}
                        </Text>
                      </>
                    )}
                  </View>

                  <View style={styles.milestoneActions}>
                    <TouchableOpacity
                      style={styles.milestoneActionButton}
                      onPress={() =>
                        handleEditMilestone(milestone.id, milestone.description)
                      }
                    >
                      <Ionicons
                        name="pencil"
                        size={16}
                        color={themeColors.primary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.milestoneActionButton}
                      onPress={() => handleDeleteMilestone(milestone.id)}
                    >
                      <Ionicons
                        name="trash"
                        size={16}
                        color={themeColors.error}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyMilestones}>
                <Ionicons
                  name="flag-outline"
                  size={32}
                  color={themeColors.textSecondary}
                />
                <Text style={styles.emptyMilestonesText}>
                  No milestones yet
                </Text>
              </View>
            )}
          </View>
        </View>

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
                  setEditForm({
                    ...editForm,
                    targetDate: formatDate(selectedDate),
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
    backgroundColor: themeColors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.MD,
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    color: themeColors.textSecondary,
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
    color: themeColors.textSecondary,
    textAlign: 'center',
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
  editIconButton: {
    padding: RESPONSIVE.getSpacing(SPACING.SM),
    borderRadius: BORDER_RADIUS.SM,
    backgroundColor: themeColors.background,
    borderWidth: 1,
    borderColor: themeColors.border,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  sectionTitle: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.LARGE),
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
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
  goalCard: {
    backgroundColor: themeColors.surface,
    padding: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.MD,
  },
  goalTitle: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.LARGE),
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
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
    color: themeColors.surface,
  },
  goalDescription: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    color: themeColors.textSecondary,
    marginBottom: SPACING.MD,
    lineHeight: 20,
  },
  goalMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.SM,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.background,
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
    backgroundColor: themeColors.surface,
    padding: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: themeColors.border,
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
    color: themeColors.text_PRIMARY,
  },
  progressBar: {
    height: 12,
    backgroundColor: themeColors.background,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: SPACING.SM,
  },
  progressFill: {
    height: '100%',
    backgroundColor: themeColors.primary,
    borderRadius: 6,
  },
  lastUpdated: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.SMALL),
    color: themeColors.textSecondary,
  },
  milestonesCard: {
    backgroundColor: themeColors.surface,
    padding: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.MD,
    padding: SPACING.SM,
    backgroundColor: themeColors.background_LIGHT,
    borderRadius: BORDER_RADIUS.SM,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  milestoneToggle: {
    padding: SPACING.XS,
  },
  milestoneContent: {
    flex: 1,
    marginLeft: SPACING.SM,
  },
  milestoneText: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  milestoneCompleted: {
    textDecorationLine: 'line-through',
    color: themeColors.success,
  },
  milestoneDate: {
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.SMALL),
    color: themeColors.textSecondary,
  },
  milestoneActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.XS,
  },
  milestoneActionButton: {
    padding: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
    backgroundColor: themeColors.surface,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  milestoneEditContainer: {
    flex: 1,
  },
  milestoneEditInput: {
    backgroundColor: themeColors.surface,
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: BORDER_RADIUS.SM,
    padding: SPACING.SM,
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.SM,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  milestoneEditButtons: {
    flexDirection: 'row',
    gap: SPACING.SM,
  },
  milestoneEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.SM,
    borderRadius: BORDER_RADIUS.SM,
    minWidth: 50,
    minHeight: 36,
  },
  milestoneSaveButton: {
    backgroundColor: themeColors.success,
    shadowColor: themeColors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  milestoneCancelButton: {
    backgroundColor: themeColors.error,
    shadowColor: themeColors.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyMilestones: {
    alignItems: 'center',
    padding: SPACING.XL,
  },
  emptyMilestonesText: {
    marginTop: SPACING.SM,
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    color: themeColors.textSecondary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.primary,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
  },
  addButtonText: {
    color: themeColors.surface,
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.SMALL),
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    marginLeft: SPACING.XS,
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
    backgroundColor: themeColors.primary,
  },
  statusButton: {
    backgroundColor: themeColors.success,
  },
  actionButtonText: {
    color: themeColors.surface,
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
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.SM,
    marginTop: SPACING.MD,
  },
  textInput: {
    backgroundColor: themeColors.background,
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: BORDER_RADIUS.SM,
    padding: SPACING.SM,
    fontSize: RESPONSIVE.getFontSize(TYPOGRAPHY.FONT_SIZES.MEDIUM),
    color: themeColors.text_PRIMARY,
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
    backgroundColor: themeColors.background,
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: BORDER_RADIUS.SM,
    marginBottom: SPACING.SM,
  },
  picker: {
    height: 50,
    color: themeColors.text_PRIMARY,
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
});
