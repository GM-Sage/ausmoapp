// Collaboration Service for Ausmo AAC App
// Provides multi-user editing, therapist dashboard, and remote support capabilities

import {
  User,
  CommunicationBook,
  CommunicationPage,
  CommunicationButton,
} from '../types';

export interface CollaborationSession {
  id: string;
  name: string;
  description: string;
  hostUserId: string;
  participants: CollaborationParticipant[];
  bookId: string;
  pageId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  settings: CollaborationSettings;
}

export interface CollaborationParticipant {
  userId: string;
  name: string;
  email: string;
  role: 'therapist' | 'parent' | 'teacher' | 'student' | 'observer';
  permissions: CollaborationPermissions;
  isOnline: boolean;
  lastSeen: Date;
  cursorPosition?: { row: number; column: number };
  currentAction?: string;
}

export interface CollaborationPermissions {
  canEdit: boolean;
  canAddPages: boolean;
  canDeletePages: boolean;
  canAddButtons: boolean;
  canDeleteButtons: boolean;
  canModifySettings: boolean;
  canInviteUsers: boolean;
  canKickUsers: boolean;
  canViewAnalytics: boolean;
}

export interface CollaborationSettings {
  allowSimultaneousEditing: boolean;
  showCursors: boolean;
  showUserActions: boolean;
  requireApproval: boolean;
  autoSave: boolean;
  saveInterval: number; // seconds
  maxParticipants: number;
  sessionTimeout: number; // minutes
}

export interface CollaborationEvent {
  type: 'join' | 'leave' | 'edit' | 'cursor' | 'message' | 'approval' | 'error';
  userId: string;
  timestamp: Date;
  data: any;
}

export interface TherapistDashboard {
  userId: string;
  patients: TherapistPatient[];
  sessions: CollaborationSession[];
  analytics: TherapistAnalytics;
  notifications: TherapistNotification[];
}

export interface TherapistPatient {
  userId: string;
  name: string;
  age: number;
  diagnosis: string;
  goals: string[];
  progress: PatientProgress;
  lastSession: Date;
  nextSession?: Date;
  communicationLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredSymbols: string[];
  customPages: string[];
}

export interface PatientProgress {
  vocabularyGrowth: number;
  communicationEfficiency: number;
  sessionFrequency: number;
  goalAchievements: number;
  lastAssessment: Date;
  improvementAreas: string[];
  strengths: string[];
}

export interface TherapistAnalytics {
  totalPatients: number;
  activeSessions: number;
  averageSessionDuration: number;
  patientProgress: Array<{
    patientId: string;
    progress: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  popularSymbols: Array<{ symbol: string; usage: number }>;
  commonGoals: string[];
}

export interface TherapistNotification {
  id: string;
  type:
    | 'session_request'
    | 'progress_update'
    | 'goal_achievement'
    | 'system_alert';
  title: string;
  message: string;
  patientId?: string;
  sessionId?: string;
  isRead: boolean;
  createdAt: Date;
  priority: 'low' | 'medium' | 'high';
}

export interface RemoteSupportSession {
  id: string;
  therapistId: string;
  patientId: string;
  sessionType: 'assessment' | 'training' | 'support' | 'consultation';
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  scheduledAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  duration?: number; // minutes
  notes: string;
  goals: string[];
  outcomes: string[];
  recommendations: string[];
}

class CollaborationService {
  private static instance: CollaborationService;
  private currentUser: User | null = null;
  private activeSessions: Map<string, CollaborationSession> = new Map();
  private eventListeners: Map<string, (event: CollaborationEvent) => void> =
    new Map();
  private isInitialized = false;

  public static getInstance(): CollaborationService {
    if (!CollaborationService.instance) {
      CollaborationService.instance = new CollaborationService();
    }
    return CollaborationService.instance;
  }

  // Initialize collaboration service
  async initialize(user: User): Promise<void> {
    try {
      this.currentUser = user;
      await this.loadActiveSessions();
      this.isInitialized = true;
      console.log('Collaboration service initialized for user:', user.id);
    } catch (error) {
      console.error('Error initializing collaboration service:', error);
    }
  }

  // Session Management
  async createSession(
    name: string,
    description: string,
    bookId: string,
    settings?: Partial<CollaborationSettings>
  ): Promise<CollaborationSession> {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    const session: CollaborationSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      hostUserId: this.currentUser.id,
      participants: [
        {
          userId: this.currentUser.id,
          name: this.currentUser.name,
          email: this.currentUser.email,
          role: 'therapist',
          permissions: this.getDefaultPermissions('therapist'),
          isOnline: true,
          lastSeen: new Date(),
        },
      ],
      bookId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: {
        allowSimultaneousEditing: true,
        showCursors: true,
        showUserActions: true,
        requireApproval: false,
        autoSave: true,
        saveInterval: 30,
        maxParticipants: 10,
        sessionTimeout: 120,
        ...settings,
      },
    };

    this.activeSessions.set(session.id, session);
    await this.saveSession(session);

    console.log('Collaboration session created:', session.id);
    return session;
  }

  async joinSession(
    sessionId: string,
    role: CollaborationParticipant['role'] = 'observer'
  ): Promise<CollaborationSession> {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.participants.length >= session.settings.maxParticipants) {
      throw new Error('Session is full');
    }

    const participant: CollaborationParticipant = {
      userId: this.currentUser.id,
      name: this.currentUser.name,
      email: this.currentUser.email,
      role,
      permissions: this.getDefaultPermissions(role),
      isOnline: true,
      lastSeen: new Date(),
    };

    session.participants.push(participant);
    session.updatedAt = new Date();

    this.activeSessions.set(sessionId, session);
    await this.saveSession(session);

    // Emit join event
    this.emitEvent({
      type: 'join',
      userId: this.currentUser.id,
      timestamp: new Date(),
      data: { participant, sessionId },
    });

    console.log('User joined session:', sessionId);
    return session;
  }

  async leaveSession(sessionId: string): Promise<void> {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Remove participant
    session.participants = session.participants.filter(
      p => p.userId !== this.currentUser!.id
    );
    session.updatedAt = new Date();

    // If no participants left, end session
    if (session.participants.length === 0) {
      session.isActive = false;
    }

    this.activeSessions.set(sessionId, session);
    await this.saveSession(session);

    // Emit leave event
    this.emitEvent({
      type: 'leave',
      userId: this.currentUser.id,
      timestamp: new Date(),
      data: { sessionId },
    });

    console.log('User left session:', sessionId);
  }

  // Real-time Collaboration
  async updateCursor(
    sessionId: string,
    position: { row: number; column: number }
  ): Promise<void> {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const participant = session.participants.find(
      p => p.userId === this.currentUser!.id
    );
    if (participant) {
      participant.cursorPosition = position;
      participant.lastSeen = new Date();
    }

    // Emit cursor event
    this.emitEvent({
      type: 'cursor',
      userId: this.currentUser.id,
      timestamp: new Date(),
      data: { sessionId, position },
    });
  }

  async updateUserAction(sessionId: string, action: string): Promise<void> {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const participant = session.participants.find(
      p => p.userId === this.currentUser!.id
    );
    if (participant) {
      participant.currentAction = action;
      participant.lastSeen = new Date();
    }

    // Emit action event
    this.emitEvent({
      type: 'edit',
      userId: this.currentUser.id,
      timestamp: new Date(),
      data: { sessionId, action },
    });
  }

  async sendMessage(sessionId: string, message: string): Promise<void> {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    // Emit message event
    this.emitEvent({
      type: 'message',
      userId: this.currentUser.id,
      timestamp: new Date(),
      data: { sessionId, message },
    });
  }

  // Therapist Dashboard
  async getTherapistDashboard(
    therapistId: string
  ): Promise<TherapistDashboard> {
    try {
      const patients = await this.getTherapistPatients(therapistId);
      const sessions = await this.getTherapistSessions(therapistId);
      const analytics = await this.getTherapistAnalytics(therapistId);
      const notifications = await this.getTherapistNotifications(therapistId);

      return {
        userId: therapistId,
        patients,
        sessions,
        analytics,
        notifications,
      };
    } catch (error) {
      console.error('Error getting therapist dashboard:', error);
      throw error;
    }
  }

  async getTherapistPatients(therapistId: string): Promise<TherapistPatient[]> {
    // In a real app, this would fetch from a database
    return [
      {
        userId: 'patient1',
        name: 'Alex Johnson',
        age: 8,
        diagnosis: 'Autism Spectrum Disorder',
        goals: [
          'Increase vocabulary',
          'Improve sentence building',
          'Social communication',
        ],
        progress: {
          vocabularyGrowth: 45,
          communicationEfficiency: 0.8,
          sessionFrequency: 3,
          goalAchievements: 2,
          lastAssessment: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          improvementAreas: ['Sentence length', 'Social greetings'],
          strengths: ['Word recognition', 'Button navigation'],
        },
        lastSession: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        nextSession: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        communicationLevel: 'intermediate',
        preferredSymbols: ['hello', 'help', 'more', 'done', 'please'],
        customPages: ['home', 'school', 'playground'],
      },
      {
        userId: 'patient2',
        name: 'Sarah Chen',
        age: 12,
        diagnosis: 'Cerebral Palsy',
        goals: [
          'Switch scanning proficiency',
          'Independent communication',
          'Academic vocabulary',
        ],
        progress: {
          vocabularyGrowth: 78,
          communicationEfficiency: 1.2,
          sessionFrequency: 4,
          goalAchievements: 3,
          lastAssessment: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          improvementAreas: ['Speed', 'Complex sentences'],
          strengths: ['Switch control', 'Vocabulary retention'],
        },
        lastSession: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        nextSession: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        communicationLevel: 'advanced',
        preferredSymbols: [
          'I want',
          'I need',
          'thank you',
          'good morning',
          'how are you',
        ],
        customPages: ['classroom', 'lunch', 'recess', 'homework'],
      },
    ];
  }

  async getTherapistSessions(
    therapistId: string
  ): Promise<CollaborationSession[]> {
    return Array.from(this.activeSessions.values()).filter(session =>
      session.participants.some(p => p.userId === therapistId)
    );
  }

  async getTherapistAnalytics(
    therapistId: string
  ): Promise<TherapistAnalytics> {
    const patients = await this.getTherapistPatients(therapistId);
    const sessions = await this.getTherapistSessions(therapistId);

    return {
      totalPatients: patients.length,
      activeSessions: sessions.filter(s => s.isActive).length,
      averageSessionDuration: 45, // minutes
      patientProgress: patients.map(patient => ({
        patientId: patient.userId,
        progress: patient.progress.vocabularyGrowth,
        trend: patient.progress.vocabularyGrowth > 50 ? 'up' : 'stable',
      })),
      popularSymbols: [
        { symbol: 'hello', usage: 45 },
        { symbol: 'help', usage: 38 },
        { symbol: 'more', usage: 32 },
        { symbol: 'done', usage: 28 },
        { symbol: 'please', usage: 25 },
      ],
      commonGoals: [
        'Increase vocabulary',
        'Improve sentence building',
        'Social communication',
        'Independent communication',
      ],
    };
  }

  async getTherapistNotifications(
    therapistId: string
  ): Promise<TherapistNotification[]> {
    return [
      {
        id: 'notif1',
        type: 'session_request',
        title: 'New Session Request',
        message: 'Alex Johnson has requested a session for tomorrow at 2 PM',
        patientId: 'patient1',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        priority: 'medium',
      },
      {
        id: 'notif2',
        type: 'progress_update',
        title: 'Progress Update',
        message: 'Sarah Chen has achieved 3 new vocabulary words this week',
        patientId: 'patient2',
        isRead: false,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        priority: 'low',
      },
      {
        id: 'notif3',
        type: 'goal_achievement',
        title: 'Goal Achieved!',
        message: 'Alex Johnson has completed the "Increase vocabulary" goal',
        patientId: 'patient1',
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        priority: 'high',
      },
    ];
  }

  // Remote Support
  async createRemoteSupportSession(
    therapistId: string,
    patientId: string,
    sessionType: RemoteSupportSession['sessionType'],
    scheduledAt: Date,
    goals: string[] = []
  ): Promise<RemoteSupportSession> {
    const session: RemoteSupportSession = {
      id: `remote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      therapistId,
      patientId,
      sessionType,
      status: 'scheduled',
      scheduledAt,
      notes: '',
      goals,
      outcomes: [],
      recommendations: [],
    };

    // In a real app, this would save to database
    console.log('Remote support session created:', session.id);
    return session;
  }

  async startRemoteSupportSession(
    sessionId: string
  ): Promise<RemoteSupportSession> {
    // In a real app, this would update the session status
    console.log('Remote support session started:', sessionId);
    return {
      id: sessionId,
      therapistId: 'therapist1',
      patientId: 'patient1',
      sessionType: 'training',
      status: 'active',
      scheduledAt: new Date(),
      startedAt: new Date(),
      notes: '',
      goals: [],
      outcomes: [],
      recommendations: [],
    };
  }

  async endRemoteSupportSession(
    sessionId: string,
    notes: string,
    outcomes: string[],
    recommendations: string[]
  ): Promise<RemoteSupportSession> {
    // In a real app, this would update the session with end time and results
    console.log('Remote support session ended:', sessionId);
    return {
      id: sessionId,
      therapistId: 'therapist1',
      patientId: 'patient1',
      sessionType: 'training',
      status: 'completed',
      scheduledAt: new Date(),
      startedAt: new Date(Date.now() - 60 * 60 * 1000),
      endedAt: new Date(),
      duration: 60,
      notes,
      goals: [],
      outcomes,
      recommendations,
    };
  }

  // Event Management
  addEventListener(
    listenerId: string,
    callback: (event: CollaborationEvent) => void
  ): void {
    this.eventListeners.set(listenerId, callback);
  }

  removeEventListener(listenerId: string): void {
    this.eventListeners.delete(listenerId);
  }

  private emitEvent(event: CollaborationEvent): void {
    this.eventListeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
  }

  // Helper Methods
  private getDefaultPermissions(
    role: CollaborationParticipant['role']
  ): CollaborationPermissions {
    switch (role) {
      case 'therapist':
        return {
          canEdit: true,
          canAddPages: true,
          canDeletePages: true,
          canAddButtons: true,
          canDeleteButtons: true,
          canModifySettings: true,
          canInviteUsers: true,
          canKickUsers: true,
          canViewAnalytics: true,
        };
      case 'parent':
        return {
          canEdit: true,
          canAddPages: true,
          canDeletePages: false,
          canAddButtons: true,
          canDeleteButtons: false,
          canModifySettings: false,
          canInviteUsers: false,
          canKickUsers: false,
          canViewAnalytics: true,
        };
      case 'teacher':
        return {
          canEdit: true,
          canAddPages: true,
          canDeletePages: false,
          canAddButtons: true,
          canDeleteButtons: false,
          canModifySettings: false,
          canInviteUsers: false,
          canKickUsers: false,
          canViewAnalytics: true,
        };
      case 'student':
        return {
          canEdit: false,
          canAddPages: false,
          canDeletePages: false,
          canAddButtons: false,
          canDeleteButtons: false,
          canModifySettings: false,
          canInviteUsers: false,
          canKickUsers: false,
          canViewAnalytics: false,
        };
      case 'observer':
        return {
          canEdit: false,
          canAddPages: false,
          canDeletePages: false,
          canAddButtons: false,
          canDeleteButtons: false,
          canModifySettings: false,
          canInviteUsers: false,
          canKickUsers: false,
          canViewAnalytics: false,
        };
      default:
        return {
          canEdit: false,
          canAddPages: false,
          canDeletePages: false,
          canAddButtons: false,
          canDeleteButtons: false,
          canModifySettings: false,
          canInviteUsers: false,
          canKickUsers: false,
          canViewAnalytics: false,
        };
    }
  }

  private async loadActiveSessions(): Promise<void> {
    // In a real app, this would load from a database
    console.log('Loading active collaboration sessions');
  }

  private async saveSession(session: CollaborationSession): Promise<void> {
    // In a real app, this would save to a database
    console.log('Saving collaboration session:', session.id);
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Get active sessions
  getActiveSessions(): CollaborationSession[] {
    return Array.from(this.activeSessions.values());
  }

  // Get session by ID
  getSession(sessionId: string): CollaborationSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  // Cleanup
  cleanup(): void {
    this.currentUser = null;
    this.activeSessions.clear();
    this.eventListeners.clear();
    this.isInitialized = false;
    console.log('Collaboration service cleaned up');
  }
}

export default CollaborationService;
