// Enhanced Therapist Dashboard Screen
// Comprehensive therapy management for ABA, Speech, and OT therapists

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
  TextInput,
  Alert,
  FlatList,
  Switch,
  Picker,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import {
  TherapyGoal,
  TherapyTask,
  TherapySession,
  PatientProfile,
  TherapistProfile,
  ProgressReport,
} from '../../types';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import TherapistService from '../../services/therapistService';

export default function EnhancedTherapistDashboardScreen() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [activeTab, setActiveTab] = useState<
    'patients' | 'goals' | 'tasks' | 'sessions' | 'reports'
  >('patients');
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(
    null
  );
  const [selectedGoal, setSelectedGoal] = useState<TherapyGoal | null>(null);

  // Data states
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [goals, setGoals] = useState<TherapyGoal[]>([]);
  const [tasks, setTasks] = useState<TherapyTask[]>([]);
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [reports, setReports] = useState<ProgressReport[]>([]);

  // Modal states
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Form states
  const [newPatient, setNewPatient] = useState<Partial<PatientProfile>>({});
  const [newGoal, setNewGoal] = useState<Partial<TherapyGoal>>({});
  const [newTask, setNewTask] = useState<Partial<TherapyTask>>({});
  const [newSession, setNewSession] = useState<Partial<TherapySession>>({});

  const therapistService = TherapistService.getInstance();

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;

    try {
      // Load patients
      const patientData = await therapistService.getPatientsByTherapist(
        currentUser.id
      );
      setPatients(patientData);

      // Load goals for selected patient
      if (selectedPatient) {
        const goalData = await therapistService.getGoalsByPatient(
          selectedPatient.id
        );
        setGoals(goalData);
      }

      // Load tasks for selected goal
      if (selectedGoal) {
        const taskData = await therapistService.getTasksByGoal(selectedGoal.id);
        setTasks(taskData);
      }

      // Load sessions for selected patient
      if (selectedPatient) {
        const sessionData = await therapistService.getSessionsByPatient(
          selectedPatient.id
        );
        setSessions(sessionData);
      }
    } catch (error) {
      console.error('Error loading therapist data:', error);
      Alert.alert('Error', 'Failed to load data');
    }
  };

  const handleCreatePatient = async () => {
    try {
      if (!currentUser) return;

      const patientData = {
        ...newPatient,
        therapists: [currentUser.id],
        goals: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Omit<PatientProfile, 'id'>;

      const patient = await therapistService.createPatient(patientData);
      setPatients(prev => [...prev, patient]);
      setShowPatientModal(false);
      setNewPatient({});

      Alert.alert('Success', 'Patient created successfully');
    } catch (error) {
      console.error('Error creating patient:', error);
      Alert.alert('Error', 'Failed to create patient');
    }
  };

  const handleCreateGoal = async () => {
    try {
      if (!selectedPatient || !currentUser) return;

      const goalData = {
        ...newGoal,
        patientId: selectedPatient.id,
        therapistId: currentUser.id,
        currentProgress: {
          frequency: 0,
          accuracy: 0,
          independence: 0,
          lastUpdated: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Omit<TherapyGoal, 'id'>;

      const goal = await therapistService.createGoal(goalData);
      setGoals(prev => [...prev, goal]);
      setShowGoalModal(false);
      setNewGoal({});

      Alert.alert('Success', 'Goal created successfully');
    } catch (error) {
      console.error('Error creating goal:', error);
      Alert.alert('Error', 'Failed to create goal');
    }
  };

  const handleCreateTask = async () => {
    try {
      if (!selectedGoal) return;

      const taskData = {
        ...newTask,
        goalId: selectedGoal.id,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Omit<TherapyTask, 'id'>;

      const task = await therapistService.createTask(taskData);
      setTasks(prev => [...prev, task]);
      setShowTaskModal(false);
      setNewTask({});

      Alert.alert('Success', 'Task created successfully');
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', 'Failed to create task');
    }
  };

  const handleCreateSession = async () => {
    try {
      if (!selectedPatient || !currentUser) return;

      const sessionData = {
        ...newSession,
        patientId: selectedPatient.id,
        therapistId: currentUser.id,
        sessionDate: new Date(),
        activities: [],
        data: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Omit<TherapySession, 'id'>;

      const session = await therapistService.createSession(sessionData);
      setSessions(prev => [session, ...prev]);
      setShowSessionModal(false);
      setNewSession({});

      Alert.alert('Success', 'Session created successfully');
    } catch (error) {
      console.error('Error creating session:', error);
      Alert.alert('Error', 'Failed to create session');
    }
  };

  const handleGenerateReport = async () => {
    try {
      if (!selectedPatient || !currentUser) return;

      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

      const report = await therapistService.generateProgressReport(
        selectedPatient.id,
        currentUser.id,
        startDate,
        endDate
      );

      setReports(prev => [report, ...prev]);
      setShowReportModal(false);

      Alert.alert('Success', 'Progress report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      Alert.alert('Error', 'Failed to generate report');
    }
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {[
        { key: 'patients', label: 'Patients', icon: 'people' },
        { key: 'goals', label: 'Goals', icon: 'flag' },
        { key: 'tasks', label: 'Tasks', icon: 'list' },
        { key: 'sessions', label: 'Sessions', icon: 'calendar' },
        { key: 'reports', label: 'Reports', icon: 'analytics' },
      ].map(tab => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tabButton,
            activeTab === tab.key && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab(tab.key as any)}
        >
          <Ionicons
            name={tab.icon as any}
            size={20}
            color={
              activeTab === tab.key
                ? themeColors.surface
                : themeColors.textSecondary
            }
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === tab.key && styles.activeTabButtonText,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPatientsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Patient Management</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.requestsButton}
            onPress={() => navigation?.navigate('TherapistRequests')}
          >
            <Ionicons name="people" size={20} color={themeColors.surface} />
            <Text style={styles.requestsButtonText}>Requests</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowPatientModal(true)}
          >
            <Ionicons name="add" size={24} color={themeColors.surface} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={patients}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.patientCard,
              selectedPatient?.id === item.id && styles.selectedCard,
            ]}
            onPress={() => {
              setSelectedPatient(item);
              loadData();
            }}
          >
            <View style={styles.patientHeader}>
              <Text style={styles.patientName}>{item.name}</Text>
              <View style={styles.patientBadges}>
                {item.therapyTypes.map(type => (
                  <View key={type} style={styles.therapyBadge}>
                    <Text style={styles.therapyBadgeText}>{type}</Text>
                  </View>
                ))}
              </View>
            </View>
            <Text style={styles.patientInfo}>
              Communication: {item.communicationLevel} | Cognitive:{' '}
              {item.cognitiveLevel} | Motor: {item.motorLevel}
            </Text>
            <Text style={styles.patientGoals}>
              Active Goals: {item.goals.length}
            </Text>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  const renderGoalsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Therapy Goals</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowGoalModal(true)}
          disabled={!selectedPatient}
        >
          <Ionicons name="add" size={24} color={themeColors.surface} />
        </TouchableOpacity>
      </View>

      {!selectedPatient ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="person"
            size={48}
            color={themeColors.textSecondary}
          />
          <Text style={styles.emptyStateText}>
            Select a patient to view goals
          </Text>
        </View>
      ) : (
        <FlatList
          data={goals}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.goalCard,
                selectedGoal?.id === item.id && styles.selectedCard,
              ]}
              onPress={() => {
                setSelectedGoal(item);
                loadData();
              }}
            >
              <View style={styles.goalHeader}>
                <Text style={styles.goalTitle}>{item.title}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(item.status) },
                  ]}
                >
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.goalDescription}>{item.description}</Text>
              <View style={styles.goalProgress}>
                <Text style={styles.progressLabel}>Progress:</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${item.currentProgress.accuracy}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {item.currentProgress.accuracy}%
                </Text>
              </View>
              <Text style={styles.goalTarget}>
                Target: {item.targetData.frequency} per session | Accuracy:{' '}
                {item.targetData.accuracy}%
              </Text>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );

  const renderTasksTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Therapy Tasks</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.taskLibraryButton}
            onPress={() => navigation?.navigate('TaskLibrary')}
          >
            <Ionicons name="library" size={20} color={themeColors.surface} />
            <Text style={styles.taskLibraryButtonText}>Library</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowTaskModal(true)}
            disabled={!selectedGoal}
          >
            <Ionicons name="add" size={24} color={themeColors.surface} />
          </TouchableOpacity>
        </View>
      </View>

      {!selectedGoal ? (
        <View style={styles.emptyState}>
          <Ionicons name="flag" size={48} color={themeColors.textSecondary} />
          <Text style={styles.emptyStateText}>Select a goal to view tasks</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.taskCard}>
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
              <Text style={styles.taskDuration}>
                Duration: {item.estimatedDuration} minutes
              </Text>
              <View style={styles.taskSkills}>
                {item.skills.map(skill => (
                  <View key={skill} style={styles.skillTag}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );

  const renderSessionsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Therapy Sessions</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowSessionModal(true)}
          disabled={!selectedPatient}
        >
          <Ionicons name="add" size={24} color={themeColors.surface} />
        </TouchableOpacity>
      </View>

      {!selectedPatient ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="calendar"
            size={48}
            color={themeColors.textSecondary}
          />
          <Text style={styles.emptyStateText}>
            Select a patient to view sessions
          </Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionDate}>
                  {item.sessionDate.toLocaleDateString()}
                </Text>
                <Text style={styles.sessionDuration}>
                  {item.duration} minutes
                </Text>
              </View>
              <Text style={styles.sessionGoals}>
                Goals: {item.goals.length} | Tasks: {item.tasks.length}
              </Text>
              {item.notes && (
                <Text style={styles.sessionNotes}>{item.notes}</Text>
              )}
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );

  const renderReportsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Progress Reports</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowReportModal(true)}
          disabled={!selectedPatient}
        >
          <Ionicons name="add" size={24} color={themeColors.surface} />
        </TouchableOpacity>
      </View>

      {!selectedPatient ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="analytics"
            size={48}
            color={themeColors.textSecondary}
          />
          <Text style={styles.emptyStateText}>
            Select a patient to view reports
          </Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.reportCard}>
              <Text style={styles.reportPeriod}>
                {item.reportPeriod.startDate.toLocaleDateString()} -
                {item.reportPeriod.endDate.toLocaleDateString()}
              </Text>
              <Text style={styles.reportSummary}>{item.summary}</Text>
              <View style={styles.reportGoals}>
                {item.goals.map(goal => (
                  <View key={goal.goalId} style={styles.reportGoalItem}>
                    <Text style={styles.reportGoalProgress}>
                      {goal.progress.toFixed(1)}% - {goal.masteryStatus}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return themeColors.primary;
      case 'mastered':
        return themeColors.success;
      case 'paused':
        return themeColors.warning;
      case 'discontinued':
        return themeColors.error;
      default:
        return themeColors.textSecondary;
    }
  };

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
      {renderTabBar()}

      {activeTab === 'patients' && renderPatientsTab()}
      {activeTab === 'goals' && renderGoalsTab()}
      {activeTab === 'tasks' && renderTasksTab()}
      {activeTab === 'sessions' && renderSessionsTab()}
      {activeTab === 'reports' && renderReportsTab()}

      {/* Patient Modal */}
      <Modal
        visible={showPatientModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Patient</Text>
            <TouchableOpacity onPress={() => setShowPatientModal(false)}>
              <Ionicons
                name="close"
                size={24}
                color={themeColors.text_PRIMARY}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Patient Name"
              value={newPatient.name || ''}
              onChangeText={text =>
                setNewPatient(prev => ({ ...prev, name: text }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Diagnosis"
              value={newPatient.diagnosis?.join(', ') || ''}
              onChangeText={text =>
                setNewPatient(prev => ({
                  ...prev,
                  diagnosis: text.split(',').map(d => d.trim()),
                }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Communication Level"
              value={newPatient.communicationLevel || ''}
              onChangeText={text =>
                setNewPatient(prev => ({
                  ...prev,
                  communicationLevel: text as any,
                }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Interests (comma separated)"
              value={newPatient.interests?.join(', ') || ''}
              onChangeText={text =>
                setNewPatient(prev => ({
                  ...prev,
                  interests: text.split(',').map(i => i.trim()),
                }))
              }
            />
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowPatientModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleCreatePatient}
            >
              <Text style={styles.saveButtonText}>Save Patient</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Goal Modal */}
      <Modal
        visible={showGoalModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Goal</Text>
            <TouchableOpacity onPress={() => setShowGoalModal(false)}>
              <Ionicons
                name="close"
                size={24}
                color={themeColors.text_PRIMARY}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Goal Title"
              value={newGoal.title || ''}
              onChangeText={text =>
                setNewGoal(prev => ({ ...prev, title: text }))
              }
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Goal Description"
              value={newGoal.description || ''}
              onChangeText={text =>
                setNewGoal(prev => ({ ...prev, description: text }))
              }
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Target Behavior"
              value={newGoal.targetBehavior || ''}
              onChangeText={text =>
                setNewGoal(prev => ({ ...prev, targetBehavior: text }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Measurement Criteria"
              value={newGoal.measurementCriteria || ''}
              onChangeText={text =>
                setNewGoal(prev => ({ ...prev, measurementCriteria: text }))
              }
            />
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowGoalModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleCreateGoal}
            >
              <Text style={styles.saveButtonText}>Save Goal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Task Modal */}
      <Modal
        visible={showTaskModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Task</Text>
            <TouchableOpacity onPress={() => setShowTaskModal(false)}>
              <Ionicons
                name="close"
                size={24}
                color={themeColors.text_PRIMARY}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Task Title"
              value={newTask.title || ''}
              onChangeText={text =>
                setNewTask(prev => ({ ...prev, title: text }))
              }
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Task Description"
              value={newTask.description || ''}
              onChangeText={text =>
                setNewTask(prev => ({ ...prev, description: text }))
              }
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Estimated Duration (minutes)"
              value={newTask.estimatedDuration?.toString() || ''}
              onChangeText={text =>
                setNewTask(prev => ({
                  ...prev,
                  estimatedDuration: parseInt(text) || 0,
                }))
              }
              keyboardType="numeric"
            />
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowTaskModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleCreateTask}
            >
              <Text style={styles.saveButtonText}>Save Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Session Modal */}
      <Modal
        visible={showSessionModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Session</Text>
            <TouchableOpacity onPress={() => setShowSessionModal(false)}>
              <Ionicons
                name="close"
                size={24}
                color={themeColors.text_PRIMARY}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Session Duration (minutes)"
              value={newSession.duration?.toString() || ''}
              onChangeText={text =>
                setNewSession(prev => ({
                  ...prev,
                  duration: parseInt(text) || 0,
                }))
              }
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Session Notes"
              value={newSession.notes || ''}
              onChangeText={text =>
                setNewSession(prev => ({ ...prev, notes: text }))
              }
              multiline
            />
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowSessionModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleCreateSession}
            >
              <Text style={styles.saveButtonText}>Save Session</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Report Modal */}
      <Modal
        visible={showReportModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Generate Progress Report</Text>
            <TouchableOpacity onPress={() => setShowReportModal(false)}>
              <Ionicons
                name="close"
                size={24}
                color={themeColors.text_PRIMARY}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.reportInfo}>
              Generate a 30-day progress report for {selectedPatient?.name}
            </Text>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowReportModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleGenerateReport}
            >
              <Text style={styles.saveButtonText}>Generate Report</Text>
            </TouchableOpacity>
          </View>
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
  tabBar: {
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
  },
  activeTabButton: {
    backgroundColor: themeColors.primary,
  },
  tabButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginLeft: SPACING.XS,
  },
  activeTabButtonText: {
    color: themeColors.surface,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
  tabContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskLibraryButton: {
    backgroundColor: themeColors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.MD,
    marginRight: SPACING.SM,
  },
  taskLibraryButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.surface,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    marginLeft: SPACING.XS,
  },
  requestsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.secondary,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.SM,
    marginRight: SPACING.SM,
  },
  requestsButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.surface,
    marginLeft: SPACING.XS,
  },
  addButton: {
    backgroundColor: themeColors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.XL,
  },
  emptyStateText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.MD,
  },
  patientCard: {
    backgroundColor: themeColors.surface,
    marginHorizontal: SPACING.LG,
    marginVertical: SPACING.SM,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  selectedCard: {
    borderColor: themeColors.primary,
    borderWidth: 2,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.SM,
  },
  patientName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
  },
  patientBadges: {
    flexDirection: 'row',
  },
  therapyBadge: {
    backgroundColor: themeColors.primary,
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
    marginLeft: SPACING.XS,
  },
  therapyBadgeText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.surface,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
  patientInfo: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginBottom: SPACING.XS,
  },
  patientGoals: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  goalCard: {
    backgroundColor: themeColors.surface,
    marginHorizontal: SPACING.LG,
    marginVertical: SPACING.SM,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.SM,
  },
  goalTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
  },
  statusText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.surface,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
  goalDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginBottom: SPACING.SM,
  },
  goalProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  progressLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginRight: SPACING.SM,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: themeColors.border,
    borderRadius: 4,
    marginRight: SPACING.SM,
  },
  progressFill: {
    height: '100%',
    backgroundColor: themeColors.success,
    borderRadius: 4,
  },
  progressText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.text_PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
  goalTarget: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  taskCard: {
    backgroundColor: themeColors.surface,
    marginHorizontal: SPACING.LG,
    marginVertical: SPACING.SM,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: themeColors.border,
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
  taskDuration: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginBottom: SPACING.SM,
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
  sessionCard: {
    backgroundColor: themeColors.surface,
    marginHorizontal: SPACING.LG,
    marginVertical: SPACING.SM,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.SM,
  },
  sessionDate: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
  },
  sessionDuration: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
  },
  sessionGoals: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginBottom: SPACING.SM,
  },
  sessionNotes: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    fontStyle: 'italic',
  },
  reportCard: {
    backgroundColor: themeColors.surface,
    marginHorizontal: SPACING.LG,
    marginVertical: SPACING.SM,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  reportPeriod: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.SM,
  },
  reportSummary: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginBottom: SPACING.SM,
  },
  reportGoals: {
    marginTop: SPACING.SM,
  },
  reportGoalItem: {
    marginBottom: SPACING.XS,
  },
  reportGoalProgress: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
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
  input: {
    backgroundColor: themeColors.surface,
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: BORDER_RADIUS.MD,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.MD,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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
  saveButton: {
    flex: 1,
    backgroundColor: themeColors.primary,
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
    marginLeft: SPACING.SM,
  },
  saveButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.surface,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
  reportInfo: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.textSecondary,
    textAlign: 'center',
    paddingVertical: SPACING.XL,
  },
});
