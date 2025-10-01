// Role-Based Navigation Service
// Manages navigation and UI based on user roles

import { UserRole, User } from '../types';

export interface NavigationItem {
  key: string;
  title: string;
  icon: string;
  screen: string;
  roles: UserRole[];
  requiresAuth?: boolean;
  badge?: number;
}

export interface RolePermissions {
  canViewTherapyDashboard: boolean;
  canManagePatients: boolean;
  canCreateGoals: boolean;
  canViewReports: boolean;
  canAccessSettings: boolean;
  canManageUsers: boolean;
  canViewProgress: boolean;
  canCreateSessions: boolean;
  canAccessLibrary: boolean;
  canAccessEducation: boolean;
  canViewGoals: boolean;
  canWorkOnGoals: boolean;
}

class RoleBasedNavigationService {
  private static instance: RoleBasedNavigationService;

  private constructor() {}

  public static getInstance(): RoleBasedNavigationService {
    if (!RoleBasedNavigationService.instance) {
      RoleBasedNavigationService.instance = new RoleBasedNavigationService();
    }
    return RoleBasedNavigationService.instance;
  }

  // Get navigation items based on user role
  getNavigationItems(userRole: UserRole): NavigationItem[] {
    const allItems: NavigationItem[] = [
      {
        key: 'home',
        title: 'Home',
        icon: 'home',
        screen: 'Home',
        roles: ['child', 'parent', 'therapist', 'admin'],
      },
      {
        key: 'communication',
        title: 'Talk',
        icon: 'chatbubbles',
        screen: 'Communication',
        roles: ['child', 'parent', 'therapist', 'admin'],
      },
      {
        key: 'library',
        title: 'Books',
        icon: 'library',
        screen: 'Library',
        roles: ['child', 'parent', 'therapist', 'admin'],
      },
      {
        key: 'therapy',
        title: 'Therapy',
        icon: 'medical',
        screen: 'TherapistDashboard',
        roles: ['therapist', 'admin'],
      },
      {
        key: 'education',
        title: 'Learn',
        icon: 'school',
        screen: 'Education',
        roles: ['child', 'parent', 'therapist', 'admin'],
      },
      {
        key: 'progress',
        title: 'Progress',
        icon: 'trending-up',
        screen: 'ProgressDashboard',
        roles: ['parent', 'therapist', 'admin'],
      },
      {
        key: 'settings',
        title: 'Settings',
        icon: 'settings',
        screen: 'Settings',
        roles: ['parent', 'therapist', 'admin'],
      },
      {
        key: 'admin',
        title: 'Admin',
        icon: 'shield',
        screen: 'AdminDashboard',
        roles: ['admin'],
      },
    ];

    return allItems.filter(item => item.roles.includes(userRole));
  }

  // Get permissions for a specific role
  getRolePermissions(userRole: UserRole): RolePermissions {
    const permissions: Record<UserRole, RolePermissions> = {
      child: {
        canViewTherapyDashboard: false,
        canManagePatients: false,
        canCreateGoals: false,
        canViewReports: false,
        canAccessSettings: false,
        canManageUsers: false,
        canViewProgress: false,
        canCreateSessions: false,
        canAccessLibrary: true,
        canAccessEducation: true,
        canViewGoals: true,
        canWorkOnGoals: true,
      },
      parent: {
        canViewTherapyDashboard: false,
        canManagePatients: false,
        canCreateGoals: false,
        canViewReports: true,
        canAccessSettings: true,
        canManageUsers: false,
        canViewProgress: true,
        canCreateSessions: false,
        canAccessLibrary: true,
        canAccessEducation: true,
        canViewGoals: true,
        canWorkOnGoals: false,
      },
      therapist: {
        canViewTherapyDashboard: true,
        canManagePatients: true,
        canCreateGoals: true,
        canViewReports: true,
        canAccessSettings: true,
        canManageUsers: false,
        canViewProgress: true,
        canCreateSessions: true,
        canAccessLibrary: true,
        canAccessEducation: true,
        canViewGoals: true,
        canWorkOnGoals: false,
      },
      admin: {
        canViewTherapyDashboard: true,
        canManagePatients: true,
        canCreateGoals: true,
        canViewReports: true,
        canAccessSettings: true,
        canManageUsers: true,
        canViewProgress: true,
        canCreateSessions: true,
        canAccessLibrary: true,
        canAccessEducation: true,
        canViewGoals: true,
        canWorkOnGoals: false,
      },
    };

    return permissions[userRole];
  }

  // Check if user can access a specific screen
  canAccessScreen(userRole: UserRole, screenName: string): boolean {
    const items = this.getNavigationItems(userRole);
    return items.some(item => item.screen === screenName);
  }

  // Get child-specific navigation (simplified for children)
  getChildNavigation(): NavigationItem[] {
    return [
      {
        key: 'home',
        title: 'Home',
        icon: 'home',
        screen: 'Home',
        roles: ['child'],
      },
      {
        key: 'communication',
        title: 'Talk',
        icon: 'chatbubbles',
        screen: 'Communication',
        roles: ['child'],
      },
      {
        key: 'library',
        title: 'Books',
        icon: 'library',
        screen: 'Library',
        roles: ['child'],
      },
    ];
  }

  // Get therapist-specific navigation
  getTherapistNavigation(): NavigationItem[] {
    return [
      {
        key: 'home',
        title: 'Home',
        icon: 'home',
        screen: 'Home',
        roles: ['therapist'],
      },
      {
        key: 'therapy',
        title: 'Therapy',
        icon: 'medical',
        screen: 'TherapistDashboard',
        roles: ['therapist'],
      },
      {
        key: 'library',
        title: 'Books',
        icon: 'library',
        screen: 'Library',
        roles: ['therapist'],
      },
      {
        key: 'education',
        title: 'Learn',
        icon: 'school',
        screen: 'Education',
        roles: ['therapist'],
      },
      {
        key: 'settings',
        title: 'Settings',
        icon: 'settings',
        screen: 'Settings',
        roles: ['therapist'],
      },
    ];
  }

  // Get parent-specific navigation
  getParentNavigation(): NavigationItem[] {
    return [
      {
        key: 'home',
        title: 'Home',
        icon: 'home',
        screen: 'Home',
        roles: ['parent'],
      },
      {
        key: 'communication',
        title: 'Talk',
        icon: 'chatbubbles',
        screen: 'Communication',
        roles: ['parent'],
      },
      {
        key: 'library',
        title: 'Books',
        icon: 'library',
        screen: 'Library',
        roles: ['parent'],
      },
      {
        key: 'progress',
        title: 'Progress',
        icon: 'trending-up',
        screen: 'ProgressDashboard',
        roles: ['parent'],
      },
      {
        key: 'findTherapists',
        title: 'Find Therapists',
        icon: 'medical',
        screen: 'TherapistSearch',
        roles: ['parent'],
      },
      {
        key: 'education',
        title: 'Learn',
        icon: 'school',
        screen: 'Education',
        roles: ['parent'],
      },
      {
        key: 'settings',
        title: 'Settings',
        icon: 'settings',
        screen: 'Settings',
        roles: ['parent'],
      },
    ];
  }

  // Get admin-specific navigation
  getAdminNavigation(): NavigationItem[] {
    return [
      {
        key: 'home',
        title: 'Home',
        icon: 'home',
        screen: 'Home',
        roles: ['admin'],
      },
      {
        key: 'therapy',
        title: 'Therapy',
        icon: 'medical',
        screen: 'TherapistDashboard',
        roles: ['admin'],
      },
      {
        key: 'library',
        title: 'Books',
        icon: 'library',
        screen: 'Library',
        roles: ['admin'],
      },
      {
        key: 'education',
        title: 'Learn',
        icon: 'school',
        screen: 'Education',
        roles: ['admin'],
      },
      {
        key: 'progress',
        title: 'Progress',
        icon: 'trending-up',
        screen: 'ProgressDashboard',
        roles: ['admin'],
      },
      {
        key: 'settings',
        title: 'Settings',
        icon: 'settings',
        screen: 'Settings',
        roles: ['admin'],
      },
      {
        key: 'admin',
        title: 'Admin',
        icon: 'shield',
        screen: 'AdminDashboard',
        roles: ['admin'],
      },
    ];
  }

  // Get role-specific welcome message
  getWelcomeMessage(userRole: UserRole, userName: string): string {
    const messages = {
      child: `Hi ${userName}! Ready to have fun?`,
      parent: `Welcome back, ${userName}!`,
      therapist: `Good to see you, ${userName}. Ready to help your patients?`,
      admin: `Welcome, ${userName}. System overview ready.`,
    };

    return messages[userRole];
  }

  // Get role-specific home screen content
  getHomeScreenContent(userRole: UserRole): {
    showGoals: boolean;
    showProgress: boolean;
    showQuickActions: boolean;
    showRecentActivity: boolean;
    showTherapyInfo: boolean;
  } {
    const content = {
      child: {
        showGoals: true,
        showProgress: false,
        showQuickActions: true,
        showRecentActivity: false,
        showTherapyInfo: false,
      },
      parent: {
        showGoals: true,
        showProgress: true,
        showQuickActions: true,
        showRecentActivity: true,
        showTherapyInfo: true,
      },
      therapist: {
        showGoals: false,
        showProgress: true,
        showQuickActions: true,
        showRecentActivity: true,
        showTherapyInfo: true,
      },
      admin: {
        showGoals: false,
        showProgress: true,
        showQuickActions: true,
        showRecentActivity: true,
        showTherapyInfo: true,
      },
    };

    return content[userRole];
  }

  // Check if user can perform specific actions
  canPerformAction(userRole: UserRole, action: string): boolean {
    const permissions = this.getRolePermissions(userRole);

    const actionMap: Record<string, keyof RolePermissions> = {
      view_therapy_dashboard: 'canViewTherapyDashboard',
      manage_patients: 'canManagePatients',
      create_goals: 'canCreateGoals',
      view_reports: 'canViewReports',
      access_settings: 'canAccessSettings',
      manage_users: 'canManageUsers',
      view_progress: 'canViewProgress',
      create_sessions: 'canCreateSessions',
      access_library: 'canAccessLibrary',
      access_education: 'canAccessEducation',
      view_goals: 'canViewGoals',
      work_on_goals: 'canWorkOnGoals',
    };

    const permissionKey = actionMap[action];
    return permissionKey ? permissions[permissionKey] : false;
  }

  // Get role display name
  getRoleDisplayName(userRole: UserRole): string {
    const names = {
      child: 'Child',
      parent: 'Parent/Caregiver',
      therapist: 'Therapist',
      admin: 'Administrator',
    };

    return names[userRole];
  }

  // Get role color for UI
  getRoleColor(userRole: UserRole): string {
    const colors = {
      child: '#FF6B6B', // Red
      parent: '#4ECDC4', // Teal
      therapist: '#45B7D1', // Blue
      admin: '#96CEB4', // Green
    };

    return colors[userRole];
  }

  // Get role icon
  getRoleIcon(userRole: UserRole): string {
    const icons = {
      child: 'happy',
      parent: 'people',
      therapist: 'medical',
      admin: 'shield',
    };

    return icons[userRole];
  }
}

export default RoleBasedNavigationService;
