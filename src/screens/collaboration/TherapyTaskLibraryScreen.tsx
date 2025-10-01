// Therapy Task Library Screen
// Predefined therapy activities for ABA, Speech, and OT therapists

import React, { useState, useEffect } from 'react';
import { getThemeColors } from '../../utils/themeUtils';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import { TherapyTask, PatientProfile } from '../../types';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import TherapistService from '../../services/therapistService';

export default function TherapyTaskLibraryScreen() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [selectedTherapyType, setSelectedTherapyType] = useState<
    'ABA' | 'Speech' | 'OT'
  >('ABA');
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    'beginner' | 'intermediate' | 'advanced'
  >('beginner');
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(
    null
  );
  const [tasks, setTasks] = useState<TherapyTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TherapyTask[]>([]);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TherapyTask | null>(null);
  const [showPatientSelector, setShowPatientSelector] = useState(false);

  const therapistService = TherapistService.getInstance();

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, selectedTherapyType, selectedDifficulty, selectedPatient]);

  const loadTasks = () => {
    const predefinedTasks = therapistService.getPredefinedTasks();
    setTasks(predefinedTasks);
  };

  const filterTasks = () => {
    let filtered = tasks;

    // Filter by therapy type
    if (selectedTherapyType) {
      filtered = filtered.filter(task => {
        // This would need to be implemented based on how tasks are categorized
        return true; // Placeholder
      });
    }

    // Filter by difficulty
    if (selectedDifficulty) {
      filtered = filtered.filter(
        task => task.difficulty === selectedDifficulty
      );
    }

    // Filter by patient appropriateness
    if (selectedPatient) {
      filtered = filtered.filter(task => {
        return therapistService.isTaskAppropriateForPatient(
          task,
          selectedPatient
        );
      });
    }

    setFilteredTasks(filtered);
  };

  const handleAddTaskToGoal = async (task: TherapyTask) => {
    try {
      if (!selectedPatient) {
        Alert.alert('No Patient Selected', 'Please select a patient first');
        return;
      }

      // This would typically open a goal selection modal
      Alert.alert(
        'Task Added',
        `"${task.title}" has been added to the task library for ${selectedPatient.name}`
      );
    } catch (error) {
      console.error('Error adding task:', error);
      Alert.alert('Error', 'Failed to add task');
    }
  };

  const renderTaskCard = ({ item }: { item: TherapyTask }) => (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={() => {
        setSelectedTask(item);
        setShowTaskDetail(true);
      }}
    >
      <View style={styles.taskHeader}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <View
          style={[
            styles.difficultyBadge,
            { backgroundColor: getDifficultyColor(item.difficulty) },
          ]}
        >
          <Text style={styles.difficultyText}>{item.difficulty}</Text>
        </View>
      </View>

      <Text style={styles.taskDescription}>{item.description}</Text>

      <View style={styles.taskInfo}>
        <View style={styles.taskInfoItem}>
          <Ionicons name="time" size={16} color={themeColors.textSecondary} />
          <Text style={styles.taskInfoText}>{item.estimatedDuration} min</Text>
        </View>
        <View style={styles.taskInfoItem}>
          <Ionicons name="list" size={16} color={themeColors.textSecondary} />
          <Text style={styles.taskInfoText}>{item.skills.length} skills</Text>
        </View>
      </View>

      <View style={styles.taskSkills}>
        {item.skills.slice(0, 3).map(skill => (
          <View key={skill} style={styles.skillTag}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
        {item.skills.length > 3 && (
          <View style={styles.skillTag}>
            <Text style={styles.skillText}>+{item.skills.length - 3} more</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderTaskDetail = () => (
    <Modal
      visible={showTaskDetail}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{selectedTask?.title}</Text>
          <TouchableOpacity onPress={() => setShowTaskDetail(false)}>
            <Ionicons name="close" size={24} color={themeColors.text_PRIMARY} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <Text style={styles.detailDescription}>
            {selectedTask?.description}
          </Text>

          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Instructions</Text>
            {selectedTask?.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>{index + 1}.</Text>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Materials Needed</Text>
            {selectedTask?.materials.map((material, index) => (
              <View key={index} style={styles.materialItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={themeColors.success}
                />
                <Text style={styles.materialText}>{material}</Text>
              </View>
            ))}
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Skills Targeted</Text>
            <View style={styles.skillsContainer}>
              {selectedTask?.skills.map(skill => (
                <View key={skill} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Adaptations</Text>
            <View style={styles.adaptationsContainer}>
              <View style={styles.adaptationCategory}>
                <Text style={styles.adaptationTitle}>Visual</Text>
                {selectedTask?.adaptations.visual.map((adaptation, index) => (
                  <Text key={index} style={styles.adaptationText}>
                    • {adaptation}
                  </Text>
                ))}
              </View>
              <View style={styles.adaptationCategory}>
                <Text style={styles.adaptationTitle}>Auditory</Text>
                {selectedTask?.adaptations.auditory.map((adaptation, index) => (
                  <Text key={index} style={styles.adaptationText}>
                    • {adaptation}
                  </Text>
                ))}
              </View>
              <View style={styles.adaptationCategory}>
                <Text style={styles.adaptationTitle}>Motor</Text>
                {selectedTask?.adaptations.motor.map((adaptation, index) => (
                  <Text key={index} style={styles.adaptationText}>
                    • {adaptation}
                  </Text>
                ))}
              </View>
              <View style={styles.adaptationCategory}>
                <Text style={styles.adaptationTitle}>Cognitive</Text>
                {selectedTask?.adaptations.cognitive.map(
                  (adaptation, index) => (
                    <Text key={index} style={styles.adaptationText}>
                      • {adaptation}
                    </Text>
                  )
                )}
              </View>
            </View>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Data Collection</Text>
            <View style={styles.dataCollectionContainer}>
              {Object.entries(selectedTask?.dataCollection || {}).map(
                ([key, value]) => (
                  <View key={key} style={styles.dataCollectionItem}>
                    <Ionicons
                      name={value ? 'checkmark-circle' : 'close-circle'}
                      size={16}
                      color={value ? themeColors.success : themeColors.error}
                    />
                    <Text style={styles.dataCollectionText}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Text>
                  </View>
                )
              )}
            </View>
          </View>
        </ScrollView>

        <View style={styles.modalActions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowTaskDetail(false)}
          >
            <Text style={styles.cancelButtonText}>Close</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              if (selectedTask) {
                handleAddTaskToGoal(selectedTask);
                setShowTaskDetail(false);
              }
            }}
          >
            <Text style={styles.addButtonText}>Add to Goals</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderPatientSelector = () => (
    <Modal
      visible={showPatientSelector}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Select Patient</Text>
          <TouchableOpacity onPress={() => setShowPatientSelector(false)}>
            <Ionicons name="close" size={24} color={themeColors.text_PRIMARY} />
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          <Text style={styles.selectorInfo}>
            Select a patient to filter tasks appropriate for their needs
          </Text>

          {/* This would typically load actual patients from the database */}
          <TouchableOpacity
            style={styles.patientOption}
            onPress={() => {
              setSelectedPatient({
                id: 'demo-patient',
                name: 'Demo Patient',
                dateOfBirth: new Date(),
                diagnosis: ['Autism'],
                therapyTypes: ['ABA', 'Speech'],
                communicationLevel: 'single-words',
                cognitiveLevel: 'moderate',
                motorLevel: 'mild',
                sensoryProfile: {
                  visual: 'typical',
                  auditory: 'typical',
                  tactile: 'typical',
                  vestibular: 'typical',
                },
                interests: ['Music', 'Animals'],
                strengths: ['Visual learning'],
                challenges: ['Social interaction'],
                goals: [],
                therapists: [],
                createdAt: new Date(),
                updatedAt: new Date(),
              });
              setShowPatientSelector(false);
            }}
          >
            <Text style={styles.patientOptionText}>
              Demo Patient (ABA, Speech)
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return themeColors.success;
      case 'intermediate':
        return themeColors.warning;
      case 'advanced':
        return themeColors.error;
      default:
        return themeColors.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Therapy Task Library</Text>
        <Text style={styles.headerSubtitle}>
          Predefined activities for ABA, Speech, and OT therapy
        </Text>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Therapy Type:</Text>
          <View style={styles.filterButtons}>
            {(['ABA', 'Speech', 'OT'] as const).map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterButton,
                  selectedTherapyType === type && styles.activeFilterButton,
                ]}
                onPress={() => setSelectedTherapyType(type)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedTherapyType === type &&
                      styles.activeFilterButtonText,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Difficulty:</Text>
          <View style={styles.filterButtons}>
            {(['beginner', 'intermediate', 'advanced'] as const).map(
              difficulty => (
                <TouchableOpacity
                  key={difficulty}
                  style={[
                    styles.filterButton,
                    selectedDifficulty === difficulty &&
                      styles.activeFilterButton,
                  ]}
                  onPress={() => setSelectedDifficulty(difficulty)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      selectedDifficulty === difficulty &&
                        styles.activeFilterButtonText,
                    ]}
                  >
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Patient:</Text>
          <TouchableOpacity
            style={styles.patientSelector}
            onPress={() => setShowPatientSelector(true)}
          >
            <Text style={styles.patientSelectorText}>
              {selectedPatient ? selectedPatient.name : 'Select Patient'}
            </Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={themeColors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Task List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        renderItem={renderTaskCard}
        contentContainerStyle={styles.taskList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="library"
              size={48}
              color={themeColors.textSecondary}
            />
            <Text style={styles.emptyStateText}>No tasks found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your filters or select a different patient
            </Text>
          </View>
        }
      />

      {renderTaskDetail()}
      {renderPatientSelector()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  header: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    backgroundColor: themeColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginTop: SPACING.XS,
  },
  filtersContainer: {
    backgroundColor: themeColors.surface,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  filterLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    width: 100,
  },
  filterButtons: {
    flexDirection: 'row',
    flex: 1,
  },
  filterButton: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.SM,
    borderWidth: 1,
    borderColor: themeColors.border,
    marginRight: SPACING.SM,
  },
  activeFilterButton: {
    backgroundColor: themeColors.primary,
    borderColor: themeColors.primary,
  },
  filterButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  activeFilterButtonText: {
    color: themeColors.surface,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
  patientSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    backgroundColor: themeColors.background,
    borderRadius: BORDER_RADIUS.SM,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  patientSelectorText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.text_PRIMARY,
  },
  taskList: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
  },
  taskCard: {
    backgroundColor: themeColors.surface,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: themeColors.border,
    marginBottom: SPACING.MD,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.SM,
  },
  taskTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
  },
  difficultyText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.surface,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
  taskDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginBottom: SPACING.SM,
  },
  taskInfo: {
    flexDirection: 'row',
    marginBottom: SPACING.SM,
  },
  taskInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.MD,
  },
  taskInfoText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginLeft: SPACING.XS,
  },
  taskSkills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    backgroundColor: themeColors.primary + '20',
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
    marginRight: SPACING.XS,
    marginBottom: SPACING.XS,
  },
  skillText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.XL,
  },
  emptyStateText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.textSecondary,
    marginTop: SPACING.MD,
  },
  emptyStateSubtext: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.SM,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    backgroundColor: themeColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
  },
  detailDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.LG,
  },
  detailSection: {
    marginBottom: SPACING.LG,
  },
  detailSectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.SM,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: SPACING.SM,
  },
  instructionNumber: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.primary,
    width: 20,
  },
  instructionText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    flex: 1,
  },
  materialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.XS,
  },
  materialText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginLeft: SPACING.SM,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  adaptationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  adaptationCategory: {
    width: '50%',
    marginBottom: SPACING.SM,
  },
  adaptationTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.XS,
  },
  adaptationText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginBottom: SPACING.XS,
  },
  dataCollectionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dataCollectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: SPACING.SM,
  },
  dataCollectionText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginLeft: SPACING.SM,
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    backgroundColor: themeColors.surface,
    borderTopWidth: 1,
    borderTopColor: themeColors.border,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: themeColors.border,
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
    marginRight: SPACING.SM,
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.text_PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
  addButton: {
    flex: 1,
    backgroundColor: themeColors.primary,
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
    marginLeft: SPACING.SM,
  },
  addButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.surface,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
  selectorInfo: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.LG,
  },
  patientOption: {
    backgroundColor: themeColors.surface,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  patientOptionText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.text_PRIMARY,
  },
});
