// Therapist Service for Ausmo AAC App
// Comprehensive therapy management for ABA, Speech, and OT therapists

import { DatabaseService } from './databaseService';
import { SupabaseDatabaseService } from './supabaseDatabaseService';

export interface TherapyGoal {
  id: string;
  patientId: string;
  therapistId: string;
  therapyType: 'ABA' | 'Speech' | 'OT';
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  targetBehavior: string;
  measurementCriteria: string;
  baselineData: {
    frequency: number;
    duration?: number;
    accuracy?: number;
    independence?: number;
    date: Date;
  };
  targetData: {
    frequency: number;
    duration?: number;
    accuracy?: number;
    independence?: number;
    timeframe: number; // days
  };
  currentProgress: {
    frequency: number;
    duration?: number;
    accuracy?: number;
    independence?: number;
    lastUpdated: Date;
  };
  masteryCriteria: {
    consecutiveDays: number;
    accuracyThreshold: number;
    independenceThreshold: number;
  };
  status: 'active' | 'mastered' | 'paused' | 'discontinued';
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
  updatedAt: Date;
  masteredAt?: Date;
}

export interface TherapyTask {
  id: string;
  goalId: string;
  title: string;
  description: string;
  instructions: string[];
  materials: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // minutes
  skills: string[];
  prerequisites: string[];
  adaptations: {
    visual: string[];
    auditory: string[];
    motor: string[];
    cognitive: string[];
  };
  dataCollection: {
    frequency: boolean;
    duration: boolean;
    accuracy: boolean;
    independence: boolean;
    prompts: boolean;
    behavior: boolean;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TherapySession {
  id: string;
  patientId: string;
  therapistId: string;
  sessionDate: Date;
  duration: number; // minutes
  goals: string[]; // goal IDs
  tasks: string[]; // task IDs
  activities: SessionActivity[];
  notes: string;
  data: SessionData[];
  recommendations: string[];
  nextSessionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionActivity {
  id: string;
  taskId: string;
  goalId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  attempts: number;
  successes: number;
  prompts: number;
  independence: number; // 0-100%
  accuracy: number; // 0-100%
  behavior: {
    positive: string[];
    challenging: string[];
    strategies: string[];
  };
  notes: string;
}

export interface SessionData {
  goalId: string;
  measurement: 'frequency' | 'duration' | 'accuracy' | 'independence';
  value: number;
  context: string;
  timestamp: Date;
}

export interface PatientProfile {
  id: string;
  name: string;
  dateOfBirth: Date;
  diagnosis: string[];
  therapyTypes: ('ABA' | 'Speech' | 'OT')[];
  communicationLevel:
    | 'pre-verbal'
    | 'single-words'
    | 'phrases'
    | 'sentences'
    | 'conversational';
  cognitiveLevel: 'severe' | 'moderate' | 'mild' | 'typical';
  motorLevel: 'severe' | 'moderate' | 'mild' | 'typical';
  sensoryProfile: {
    visual: 'hypersensitive' | 'typical' | 'hyposensitive';
    auditory: 'hypersensitive' | 'typical' | 'hyposensitive';
    tactile: 'hypersensitive' | 'typical' | 'hyposensitive';
    vestibular: 'hypersensitive' | 'typical' | 'hyposensitive';
  };
  interests: string[];
  strengths: string[];
  challenges: string[];
  goals: string[]; // goal IDs
  therapists: string[]; // therapist IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface TherapistProfile {
  id: string;
  name: string;
  credentials: string;
  specialties: ('ABA' | 'Speech' | 'OT')[];
  licenseNumber?: string;
  email: string;
  phone?: string;
  patients: string[]; // patient IDs
  caseload: number;
  experience: number; // years
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgressReport {
  id: string;
  patientId: string;
  therapistId: string;
  reportPeriod: {
    startDate: Date;
    endDate: Date;
  };
  goals: {
    goalId: string;
    progress: number; // percentage
    masteryStatus: 'not_started' | 'in_progress' | 'mastered' | 'regressed';
    dataPoints: number;
    trend: 'improving' | 'stable' | 'declining';
  }[];
  summary: string;
  recommendations: string[];
  nextSteps: string[];
  createdAt: Date;
}

class TherapistService {
  private static instance: TherapistService;
  private databaseService: DatabaseService;
  private supabaseService: SupabaseDatabaseService;

  // Persistent mock data storage
  private mockGoals: any[] = [];
  private mockTasks: any[] = [];

  private constructor() {
    this.databaseService = DatabaseService.getInstance();
    this.supabaseService = SupabaseDatabaseService.getInstance();
    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize mock goals
    this.mockGoals = [
      {
        id: 'goal-1',
        title: 'Communication Goals',
        description: 'Improve verbal communication skills',
        status: 'active',
        progress: 75,
        targetDate: '2024-12-31',
        category: 'Communication',
        priority: 'high',
        milestones: [
          {
            id: 'm1',
            description: 'Say 10 words clearly',
            completed: true,
            date: '2024-01-15',
          },
          {
            id: 'm2',
            description: 'Use 2-word phrases',
            completed: true,
            date: '2024-02-20',
          },
          {
            id: 'm3',
            description: 'Ask for help using words',
            completed: false,
            date: '2024-03-30',
          },
        ],
        lastUpdated: new Date(),
      },
      {
        id: 'goal-2',
        title: 'Social Skills',
        description: 'Develop peer interaction skills',
        status: 'active',
        progress: 60,
        targetDate: '2024-11-30',
        category: 'Social',
        priority: 'medium',
        milestones: [
          {
            id: 'm4',
            description: 'Make eye contact during conversation',
            completed: true,
            date: '2024-01-20',
          },
          {
            id: 'm5',
            description: 'Take turns in play',
            completed: true,
            date: '2024-02-25',
          },
          {
            id: 'm6',
            description: 'Initiate play with peers',
            completed: false,
            date: '2024-04-15',
          },
        ],
        lastUpdated: new Date(),
      },
    ];

    // Initialize mock tasks
    this.mockTasks = [
      {
        id: 'task-1',
        title: 'Daily Communication Practice',
        description:
          'Practice using communication device for 15 minutes daily. Focus on requesting preferred items and expressing needs.',
        status: 'assigned',
        priority: 'high',
        category: 'Communication Practice',
        difficulty: 'medium',
        dueDate: new Date('2024-12-31'), // Fixed date
        estimatedDuration: '15 minutes',
        assignedBy: 'Dr. Sarah Johnson',
        assignedDate: new Date('2024-12-20'), // Fixed date
        instructions: [
          'Use the communication device to request 3 different items',
          'Practice saying "I want" before each request',
          'Complete the activity in a quiet environment',
          'Record any challenges or successes',
        ],
        progress: 40,
        completedSessions: 2,
        totalSessions: 5,
        notes:
          'Emma is showing good progress with basic requests. She needs more practice with complex phrases.',
      },
      {
        id: 'task-2',
        title: 'Social Interaction Task',
        description:
          'Engage in peer play for 10 minutes with structured activities. Focus on turn-taking and sharing.',
        status: 'in-progress',
        priority: 'medium',
        category: 'Social Interaction',
        difficulty: 'easy',
        dueDate: new Date('2024-12-28'), // Fixed date
        estimatedDuration: '10 minutes',
        assignedBy: 'Dr. Sarah Johnson',
        assignedDate: new Date('2024-12-21'), // Fixed date
        instructions: [
          'Find a peer to play with',
          'Use turn-taking during play',
          'Practice sharing toys',
          'Maintain eye contact during interaction',
        ],
        progress: 70,
        completedSessions: 3,
        totalSessions: 4,
        notes:
          'Emma is doing well with turn-taking but needs encouragement to initiate play.',
      },
    ];
  }

  public static getInstance(): TherapistService {
    if (!TherapistService.instance) {
      TherapistService.instance = new TherapistService();
    }
    return TherapistService.instance;
  }

  // Patient Management
  async createPatient(
    patientData: Omit<PatientProfile, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PatientProfile> {
    try {
      const patient: PatientProfile = {
        id: `patient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...patientData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.databaseService.createPatient(patient);
      await this.supabaseService.createPatient(patient);

      return patient;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }

  async getPatient(patientId: string): Promise<PatientProfile | null> {
    try {
      return await this.databaseService.getPatient(patientId);
    } catch (error) {
      console.error('Error getting patient:', error);
      return null;
    }
  }

  async getPatientsByTherapist(therapistId: string): Promise<PatientProfile[]> {
    try {
      const patients = await this.databaseService.getPatients();
      return patients.filter(patient =>
        patient.therapists.includes(therapistId)
      );
    } catch (error) {
      console.error('Error getting patients by therapist:', error);
      return [];
    }
  }

  // Goal Management
  async createGoal(
    goalData: Omit<TherapyGoal, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<TherapyGoal> {
    try {
      const goal: TherapyGoal = {
        id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...goalData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.databaseService.createTherapyGoal(goal);
      await this.supabaseService.createTherapyGoal(goal);

      return goal;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  }

  async getGoalsByPatient(patientId: string): Promise<TherapyGoal[]> {
    try {
      const goals = await this.databaseService.getTherapyGoals();
      return goals.filter(goal => goal.patientId === patientId);
    } catch (error) {
      console.error('Error getting goals by patient:', error);
      return [];
    }
  }

  async updateGoalProgress(
    goalId: string,
    progressData: Partial<TherapyGoal['currentProgress']>
  ): Promise<void> {
    try {
      const goal = await this.databaseService.getTherapyGoal(goalId);
      if (!goal) throw new Error('Goal not found');

      const updatedGoal = {
        ...goal,
        currentProgress: {
          ...goal.currentProgress,
          ...progressData,
          lastUpdated: new Date(),
        },
        updatedAt: new Date(),
      };

      // Check for mastery
      if (this.checkGoalMastery(updatedGoal)) {
        updatedGoal.status = 'mastered';
        updatedGoal.masteredAt = new Date();
      }

      await this.databaseService.updateTherapyGoal(goalId, updatedGoal);
      await this.supabaseService.updateTherapyGoal(goalId, updatedGoal);
    } catch (error) {
      console.error('Error updating goal progress:', error);
      throw error;
    }
  }

  private checkGoalMastery(goal: TherapyGoal): boolean {
    const { currentProgress, targetData, masteryCriteria } = goal;

    return (
      currentProgress.accuracy >= masteryCriteria.accuracyThreshold &&
      currentProgress.independence >= masteryCriteria.independenceThreshold &&
      currentProgress.frequency >= targetData.frequency
    );
  }

  // Task Management
  async createTask(
    taskData: Omit<TherapyTask, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<TherapyTask> {
    try {
      const task: TherapyTask = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...taskData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.databaseService.createTherapyTask(task);
      await this.supabaseService.createTherapyTask(task);

      return task;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async getTasksByGoal(goalId: string): Promise<TherapyTask[]> {
    try {
      const tasks = await this.databaseService.getTherapyTasks();
      return tasks.filter(task => task.goalId === goalId && task.isActive);
    } catch (error) {
      console.error('Error getting tasks by goal:', error);
      return [];
    }
  }

  async getRecommendedTasks(
    patientId: string,
    therapyType: 'ABA' | 'Speech' | 'OT'
  ): Promise<TherapyTask[]> {
    try {
      const patient = await this.getPatient(patientId);
      if (!patient) return [];

      const allTasks = await this.databaseService.getTherapyTasks();

      // Filter by therapy type and patient level
      return allTasks.filter(task => {
        const goal = this.getGoalById(task.goalId);
        return (
          goal &&
          goal.therapyType === therapyType &&
          goal.patientId === patientId &&
          task.isActive &&
          this.isTaskAppropriate(task, patient)
        );
      });
    } catch (error) {
      console.error('Error getting recommended tasks:', error);
      return [];
    }
  }

  private getGoalById(goalId: string): TherapyGoal | null {
    // This would typically query the database
    return null; // Placeholder
  }

  private isTaskAppropriate(
    task: TherapyTask,
    patient: PatientProfile
  ): boolean {
    // Check if task matches patient's communication and cognitive level
    const communicationMatch = this.checkCommunicationLevel(
      task,
      patient.communicationLevel
    );
    const cognitiveMatch = this.checkCognitiveLevel(
      task,
      patient.cognitiveLevel
    );
    const motorMatch = this.checkMotorLevel(task, patient.motorLevel);

    return communicationMatch && cognitiveMatch && motorMatch;
  }

  private checkCommunicationLevel(
    task: TherapyTask,
    level: PatientProfile['communicationLevel']
  ): boolean {
    // Logic to match task difficulty to communication level
    return true; // Placeholder
  }

  private checkCognitiveLevel(
    task: TherapyTask,
    level: PatientProfile['cognitiveLevel']
  ): boolean {
    // Logic to match task difficulty to cognitive level
    return true; // Placeholder
  }

  private checkMotorLevel(
    task: TherapyTask,
    level: PatientProfile['motorLevel']
  ): boolean {
    // Logic to match task difficulty to motor level
    return true; // Placeholder
  }

  // Session Management
  async createSession(
    sessionData: Omit<TherapySession, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<TherapySession> {
    try {
      const session: TherapySession = {
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...sessionData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.databaseService.createTherapySession(session);
      await this.supabaseService.createTherapySession(session);

      return session;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  async getSessionsByPatient(
    patientId: string,
    limit: number = 10
  ): Promise<TherapySession[]> {
    try {
      const sessions = await this.databaseService.getTherapySessions();
      return sessions
        .filter(session => session.patientId === patientId)
        .sort((a, b) => b.sessionDate.getTime() - a.sessionDate.getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting sessions by patient:', error);
      return [];
    }
  }

  // Progress Reporting
  async generateProgressReport(
    patientId: string,
    therapistId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ProgressReport> {
    try {
      const goals = await this.getGoalsByPatient(patientId);
      const sessions = await this.getSessionsByPatient(patientId, 50);

      const reportGoals = goals.map(goal => {
        const sessionData = sessions.filter(
          session =>
            session.goals.includes(goal.id) &&
            session.sessionDate >= startDate &&
            session.sessionDate <= endDate
        );

        const progress = this.calculateGoalProgress(goal, sessionData);

        return {
          goalId: goal.id,
          progress: progress.percentage,
          masteryStatus: this.determineMasteryStatus(goal, progress),
          dataPoints: sessionData.length,
          trend: this.calculateTrend(sessionData),
        };
      });

      const report: ProgressReport = {
        id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        patientId,
        therapistId,
        reportPeriod: { startDate, endDate },
        goals: reportGoals,
        summary: this.generateSummary(reportGoals),
        recommendations: this.generateRecommendations(reportGoals),
        nextSteps: this.generateNextSteps(reportGoals),
        createdAt: new Date(),
      };

      await this.databaseService.createProgressReport(report);
      await this.supabaseService.createProgressReport(report);

      return report;
    } catch (error) {
      console.error('Error generating progress report:', error);
      throw error;
    }
  }

  private calculateGoalProgress(
    goal: TherapyGoal,
    sessions: TherapySession[]
  ): { percentage: number; trend: string } {
    // Calculate progress based on session data
    const baseline = goal.baselineData;
    const target = goal.targetData;
    const current = goal.currentProgress;

    const progressPercentage = Math.min(
      100,
      ((current.frequency - baseline.frequency) /
        (target.frequency - baseline.frequency)) *
        100
    );

    return {
      percentage: Math.max(0, progressPercentage),
      trend: 'improving', // Placeholder
    };
  }

  private determineMasteryStatus(
    goal: TherapyGoal,
    progress: any
  ): 'not_started' | 'in_progress' | 'mastered' | 'regressed' {
    if (goal.status === 'mastered') return 'mastered';
    if (progress.percentage < 10) return 'not_started';
    if (progress.percentage >= 80) return 'in_progress';
    return 'in_progress';
  }

  private calculateTrend(
    sessions: TherapySession[]
  ): 'improving' | 'stable' | 'declining' {
    // Analyze session data to determine trend
    return 'improving'; // Placeholder
  }

  private generateSummary(goals: any[]): string {
    const masteredGoals = goals.filter(
      g => g.masteryStatus === 'mastered'
    ).length;
    const totalGoals = goals.length;
    const averageProgress =
      goals.reduce((sum, g) => sum + g.progress, 0) / totalGoals;

    return `Patient has mastered ${masteredGoals} out of ${totalGoals} goals with an average progress of ${averageProgress.toFixed(1)}%.`;
  }

  private generateRecommendations(goals: any[]): string[] {
    return [
      'Continue current intervention strategies for goals showing progress',
      'Consider adjusting approach for goals with limited progress',
      'Increase practice frequency for mastered skills to maintain proficiency',
    ];
  }

  private generateNextSteps(goals: any[]): string[] {
    return [
      'Schedule follow-up session within 2 weeks',
      'Review and update goals based on current progress',
      'Consider introducing new goals for mastered skills',
    ];
  }

  // Predefined Task Library
  getPredefinedTasks(): TherapyTask[] {
    return [
      // ABA Tasks
      {
        id: 'aba_request_item',
        goalId: '',
        title: 'Request Preferred Item',
        description: 'Student will request a preferred item using AAC',
        instructions: [
          'Present preferred item within sight but out of reach',
          'Wait for student to use AAC to request',
          'Provide item immediately upon correct request',
          'Record data on independence and accuracy',
        ],
        materials: ['Preferred items', 'AAC device', 'Data sheet'],
        difficulty: 'beginner',
        estimatedDuration: 15,
        skills: ['Requesting', 'AAC use', 'Communication'],
        prerequisites: ['Basic AAC familiarity'],
        adaptations: {
          visual: ['Use clear symbols', 'High contrast display'],
          auditory: ['Provide verbal model', 'Use consistent language'],
          motor: ['Adjust device positioning', 'Use switch if needed'],
          cognitive: [
            'Start with highly preferred items',
            'Use errorless teaching',
          ],
        },
        dataCollection: {
          frequency: true,
          duration: false,
          accuracy: true,
          independence: true,
          prompts: true,
          behavior: true,
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'aba_follow_directions',
        goalId: '',
        title: 'Follow One-Step Directions',
        description: 'Student will follow simple one-step directions',
        instructions: [
          'Give clear, simple direction',
          'Wait appropriate response time',
          'Provide reinforcement for compliance',
          'Record accuracy and response time',
        ],
        materials: ['Common objects', 'Reinforcement items'],
        difficulty: 'beginner',
        estimatedDuration: 20,
        skills: ['Following directions', 'Compliance', 'Attention'],
        prerequisites: ['Basic understanding of common objects'],
        adaptations: {
          visual: ['Use visual supports', 'Point to objects'],
          auditory: ['Speak clearly', 'Use simple language'],
          motor: ['Adapt physical requirements'],
          cognitive: ['Start with highly motivating directions'],
        },
        dataCollection: {
          frequency: true,
          duration: true,
          accuracy: true,
          independence: true,
          prompts: true,
          behavior: true,
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Speech Tasks
      {
        id: 'speech_vowel_imitation',
        goalId: '',
        title: 'Vowel Imitation',
        description: 'Student will imitate vowel sounds',
        instructions: [
          'Model clear vowel sound',
          'Encourage imitation',
          'Provide visual cues if needed',
          'Record accuracy and attempts',
        ],
        materials: ['Mirror', 'Visual cues', 'Reinforcement'],
        difficulty: 'beginner',
        estimatedDuration: 15,
        skills: ['Vocal imitation', 'Articulation', 'Attention'],
        prerequisites: ['Basic vocalization'],
        adaptations: {
          visual: ['Use mirror', 'Visual sound cues'],
          auditory: ['Clear models', 'Consistent volume'],
          motor: ['Positioning support', 'Oral motor exercises'],
          cognitive: ['Start with easiest sounds', 'Use motivating contexts'],
        },
        dataCollection: {
          frequency: true,
          duration: false,
          accuracy: true,
          independence: true,
          prompts: true,
          behavior: false,
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // OT Tasks
      {
        id: 'ot_pincer_grasp',
        goalId: '',
        title: 'Pincer Grasp Development',
        description: 'Student will use pincer grasp to pick up small objects',
        instructions: [
          'Present small objects for picking up',
          'Encourage thumb and finger opposition',
          'Provide hand-over-hand assistance if needed',
          'Record accuracy and independence',
        ],
        materials: ['Small objects', 'Tweezers', 'Play-doh'],
        difficulty: 'beginner',
        estimatedDuration: 20,
        skills: ['Fine motor', 'Pincer grasp', 'Hand strength'],
        prerequisites: ['Basic hand function'],
        adaptations: {
          visual: ['Clear targets', 'Colorful objects'],
          auditory: ['Verbal encouragement', 'Success sounds'],
          motor: ['Adaptive tools', 'Positioning support'],
          cognitive: ['Motivating activities', 'Clear instructions'],
        },
        dataCollection: {
          frequency: true,
          duration: false,
          accuracy: true,
          independence: true,
          prompts: true,
          behavior: false,
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  // Goal Templates
  getGoalTemplates(): Partial<TherapyGoal>[] {
    return [
      {
        therapyType: 'ABA',
        title: 'Request Preferred Items',
        description: 'Student will request preferred items using AAC device',
        category: 'Communication',
        subcategory: 'Requesting',
        targetBehavior:
          'Student will independently request preferred items using AAC',
        measurementCriteria: 'Frequency of independent requests per session',
        baselineData: {
          frequency: 0,
          accuracy: 0,
          independence: 0,
          date: new Date(),
        },
        targetData: {
          frequency: 10,
          accuracy: 80,
          independence: 70,
          timeframe: 30,
        },
        masteryCriteria: {
          consecutiveDays: 3,
          accuracyThreshold: 80,
          independenceThreshold: 70,
        },
        status: 'active',
        priority: 'high',
      },
      {
        therapyType: 'Speech',
        title: 'Vowel Production',
        description: 'Student will produce clear vowel sounds',
        category: 'Articulation',
        subcategory: 'Vowels',
        targetBehavior:
          'Student will produce /a/, /e/, /i/, /o/, /u/ with 80% accuracy',
        measurementCriteria: 'Accuracy of vowel production in structured tasks',
        baselineData: {
          frequency: 0,
          accuracy: 0,
          independence: 0,
          date: new Date(),
        },
        targetData: {
          frequency: 20,
          accuracy: 80,
          independence: 60,
          timeframe: 45,
        },
        masteryCriteria: {
          consecutiveDays: 5,
          accuracyThreshold: 80,
          independenceThreshold: 60,
        },
        status: 'active',
        priority: 'high',
      },
      {
        therapyType: 'OT',
        title: 'Fine Motor Skills',
        description: 'Student will demonstrate improved fine motor control',
        category: 'Fine Motor',
        subcategory: 'Grasp',
        targetBehavior:
          'Student will use pincer grasp to manipulate small objects',
        measurementCriteria: 'Accuracy and independence of pincer grasp tasks',
        baselineData: {
          frequency: 0,
          accuracy: 0,
          independence: 0,
          date: new Date(),
        },
        targetData: {
          frequency: 15,
          accuracy: 75,
          independence: 65,
          timeframe: 60,
        },
        masteryCriteria: {
          consecutiveDays: 7,
          accuracyThreshold: 75,
          independenceThreshold: 65,
        },
        status: 'active',
        priority: 'medium',
      },
    ];
  }

  // Patient Management Methods
  async getPatientDetails(patientId: string): Promise<any> {
    try {
      // For now, return mock data - in production this would fetch from database
      return {
        id: patientId,
        name: 'Emma Smith', // You can change this
        age: '8 years old',
        diagnosis: 'Autism Spectrum Disorder',
        communicationLevel: 'Emerging',
        therapyGoals: [
          'Improve verbal communication',
          'Develop social skills',
          'Increase independence',
        ],
        currentTherapist: 'Dr. Sarah Johnson',
        sessionFrequency: '2x per week',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error getting patient details:', error);
      throw error;
    }
  }

  async getPatientGoals(patientId: string): Promise<any[]> {
    try {
      // Return persistent mock data
      return [...this.mockGoals];
    } catch (error) {
      console.error('Error getting patient goals:', error);
      throw error;
    }
  }

  async getPatientTasks(patientId: string): Promise<any[]> {
    try {
      // Return persistent mock data
      return [...this.mockTasks];
    } catch (error) {
      console.error('Error getting patient tasks:', error);
      throw error;
    }
  }

  async assignGoal(goalData: any): Promise<void> {
    try {
      console.log('Assigning goal:', goalData);
      // For now, just log - in production this would save to database
      // In a real implementation, you would:
      // 1. Validate the goal data
      // 2. Save to database
      // 3. Notify the patient/parent
      // 4. Update progress tracking
    } catch (error) {
      console.error('Error assigning goal:', error);
      throw error;
    }
  }

  async assignTask(taskData: any): Promise<void> {
    try {
      console.log('Assigning task:', taskData);
      // For now, just log - in production this would save to database
      // In a real implementation, you would:
      // 1. Validate the task data
      // 2. Save to database
      // 3. Notify the patient/parent
      // 4. Update task tracking
    } catch (error) {
      console.error('Error assigning task:', error);
      throw error;
    }
  }

  async getPatientRequests(therapistId: string): Promise<any[]> {
    try {
      // For now, return mock data - in production this would fetch from database
      return [
        {
          id: 'request-1',
          patientId: 'patient-1',
          patientName: 'Emma Smith',
          patientEmail: 'emma@example.com',
          message: 'I would like to request therapy services for my child.',
          status: 'pending',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          therapistId,
        },
        {
          id: 'request-2',
          patientId: 'patient-2',
          patientName: 'John Doe',
          patientEmail: 'john@example.com',
          message: 'Looking for ABA therapy services.',
          status: 'accepted',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          therapistId,
        },
      ];
    } catch (error) {
      console.error('Error getting patient requests:', error);
      throw error;
    }
  }

  async acceptPatientRequest(requestId: string): Promise<void> {
    try {
      console.log('Accepting patient request:', requestId);
      // For now, just log - in production this would:
      // 1. Update request status in database
      // 2. Create patient-therapist relationship
      // 3. Notify the patient/parent
      // 4. Set up initial assessment
    } catch (error) {
      console.error('Error accepting patient request:', error);
      throw error;
    }
  }

  async rejectPatientRequest(requestId: string): Promise<void> {
    try {
      console.log('Rejecting patient request:', requestId);
      // For now, just log - in production this would:
      // 1. Update request status in database
      // 2. Notify the patient/parent
      // 3. Provide feedback if needed
    } catch (error) {
      console.error('Error rejecting patient request:', error);
      throw error;
    }
  }

  // Progress and Goal Management Methods
  async updateGoalProgress(
    goalId: string,
    progress: number,
    notes?: string
  ): Promise<void> {
    try {
      console.log(
        `Updating goal ${goalId} progress to ${progress}%`,
        notes ? `with notes: ${notes}` : ''
      );
      // For now, just log - in production this would:
      // 1. Update goal progress in database
      // 2. Log progress entry with timestamp
      // 3. Notify parent/therapist of progress
      // 4. Check if goal is completed
    } catch (error) {
      console.error('Error updating goal progress:', error);
      throw error;
    }
  }

  async addGoalMilestone(goalId: string, milestone: any): Promise<void> {
    try {
      console.log(`Adding milestone to goal ${goalId}:`, milestone);
      // For now, just log - in production this would:
      // 1. Add milestone to goal in database
      // 2. Update goal progress if milestone is completed
      // 3. Notify relevant parties
    } catch (error) {
      console.error('Error adding goal milestone:', error);
      throw error;
    }
  }

  async updatePatientInfo(patientId: string, updates: any): Promise<void> {
    try {
      console.log(`Updating patient ${patientId} info:`, updates);
      // For now, just log - in production this would:
      // 1. Update patient information in database
      // 2. Log changes for audit trail
      // 3. Notify relevant parties of updates
    } catch (error) {
      console.error('Error updating patient info:', error);
      throw error;
    }
  }

  async getPatientProgressHistory(patientId: string): Promise<any[]> {
    try {
      // For now, return mock data - in production this would fetch from database
      return [
        {
          id: 'progress-1',
          goalId: 'goal-1',
          goalTitle: 'Communication Goals',
          progress: 75,
          notes:
            'Emma is making great progress with verbal communication. She can now say 10 words clearly and is working on 2-word phrases.',
          date: new Date('2024-01-20'),
          therapist: 'Dr. Sarah Johnson',
        },
        {
          id: 'progress-2',
          goalId: 'goal-2',
          goalTitle: 'Social Skills',
          progress: 60,
          notes:
            'Emma is showing improvement in social interactions. She makes eye contact consistently and is learning to take turns.',
          date: new Date('2024-01-18'),
          therapist: 'Dr. Sarah Johnson',
        },
        {
          id: 'progress-3',
          goalId: 'goal-1',
          goalTitle: 'Communication Goals',
          progress: 65,
          notes:
            'Emma said her first 2-word phrase today: "more juice". This is a significant milestone!',
          date: new Date('2024-01-15'),
          therapist: 'Dr. Sarah Johnson',
        },
      ];
    } catch (error) {
      console.error('Error getting patient progress history:', error);
      throw error;
    }
  }

  // Task Management Methods
  async updateTaskProgress(
    taskId: string,
    progress: number,
    notes?: string
  ): Promise<void> {
    try {
      console.log(
        `Updating task ${taskId} progress to ${progress}%`,
        notes ? `with notes: ${notes}` : ''
      );
      // For now, just log - in production this would:
      // 1. Update task progress in database
      // 2. Log progress entry with timestamp
      // 3. Notify parent/therapist of progress
      // 4. Check if task is completed
    } catch (error) {
      console.error('Error updating task progress:', error);
      throw error;
    }
  }

  async editGoal(goalId: string, updates: any): Promise<void> {
    try {
      console.log(`Editing goal ${goalId}:`, updates);

      // Update the goal in our mock data
      const goalIndex = this.mockGoals.findIndex(goal => goal.id === goalId);

      if (goalIndex !== -1) {
        // Convert string dates back to Date objects for consistency
        const updatedGoal = {
          ...this.mockGoals[goalIndex],
          ...updates,
          targetDate:
            updates.targetDate || this.mockGoals[goalIndex].targetDate,
          lastUpdated: new Date(),
        };

        this.mockGoals[goalIndex] = updatedGoal;
        console.log('Goal updated successfully:', updatedGoal);
      } else {
        throw new Error(`Goal with ID ${goalId} not found`);
      }

      // In production this would:
      // 1. Update goal information in database
      // 2. Log changes for audit trail
      // 3. Notify relevant parties of updates
    } catch (error) {
      console.error('Error editing goal:', error);
      throw error;
    }
  }

  async editTask(taskId: string, updates: any): Promise<void> {
    try {
      console.log(`Editing task ${taskId}:`, updates);

      // Update the task in our mock data
      const taskIndex = this.mockTasks.findIndex(task => task.id === taskId);

      if (taskIndex !== -1) {
        // Convert string dates back to Date objects for consistency
        const updatedTask = {
          ...this.mockTasks[taskIndex],
          ...updates,
          dueDate: updates.dueDate
            ? new Date(updates.dueDate)
            : this.mockTasks[taskIndex].dueDate,
          updatedAt: new Date(),
        };

        this.mockTasks[taskIndex] = updatedTask;
        console.log('Task updated successfully:', updatedTask);
      } else {
        throw new Error(`Task with ID ${taskId} not found`);
      }

      // In production this would:
      // 1. Update task information in database
      // 2. Log changes for audit trail
      // 3. Notify relevant parties of updates
    } catch (error) {
      console.error('Error editing task:', error);
      throw error;
    }
  }

  async completeTask(taskId: string, completionNotes?: string): Promise<void> {
    try {
      console.log(
        `Completing task ${taskId}`,
        completionNotes ? `with notes: ${completionNotes}` : ''
      );
      // For now, just log - in production this would:
      // 1. Mark task as completed in database
      // 2. Log completion with timestamp and notes
      // 3. Update related goal progress if applicable
      // 4. Notify relevant parties
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  }

  async getGoalDetails(goalId: string): Promise<any> {
    try {
      // Return goal from persistent mock data
      return this.mockGoals.find(goal => goal.id === goalId) || null;
    } catch (error) {
      console.error('Error getting goal details:', error);
      throw error;
    }
  }

  async getTaskDetails(taskId: string): Promise<any> {
    try {
      // Return task from persistent mock data
      return this.mockTasks.find(task => task.id === taskId) || null;
    } catch (error) {
      console.error('Error getting task details:', error);
      throw error;
    }
  }

  async updateGoalProgress(
    goalId: string,
    progress: number,
    status?: string
  ): Promise<void> {
    try {
      console.log(
        `Updating goal ${goalId} progress to ${progress}%${status ? ` and status to ${status}` : ''}`
      );
      const goalIndex = this.mockGoals.findIndex(goal => goal.id === goalId);
      if (goalIndex !== -1) {
        const updatedGoal = {
          ...this.mockGoals[goalIndex],
          progress: Math.max(0, Math.min(100, progress)), // Ensure progress is between 0-100
          status: status || this.mockGoals[goalIndex].status,
          lastUpdated: new Date(),
        };
        this.mockGoals[goalIndex] = updatedGoal;
        console.log('Goal progress updated successfully:', updatedGoal);
      } else {
        throw new Error(`Goal with ID ${goalId} not found`);
      }
    } catch (error) {
      console.error('Error updating goal progress:', error);
      throw error;
    }
  }

  async updateTaskProgress(
    taskId: string,
    progress: number,
    status?: string
  ): Promise<void> {
    try {
      console.log(
        `Updating task ${taskId} progress to ${progress}%${status ? ` and status to ${status}` : ''}`
      );
      const taskIndex = this.mockTasks.findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        const updatedTask = {
          ...this.mockTasks[taskIndex],
          progress: Math.max(0, Math.min(100, progress)), // Ensure progress is between 0-100
          status: status || this.mockTasks[taskIndex].status,
          updatedAt: new Date(),
        };
        this.mockTasks[taskIndex] = updatedTask;
        console.log('Task progress updated successfully:', updatedTask);
      } else {
        throw new Error(`Task with ID ${taskId} not found`);
      }
    } catch (error) {
      console.error('Error updating task progress:', error);
      throw error;
    }
  }
}

export default TherapistService;
