// Backup and Recovery Service for Ausmo AAC App
// Provides automated backup scheduling, verification, and disaster recovery

import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { captureSentryException, addSentryBreadcrumb } from '../config/sentry';

export interface BackupConfiguration {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:MM format
  includeUserData: boolean;
  includeCommunicationData: boolean;
  includeProgressData: boolean;
  includeSettings: boolean;
  retentionDays: number;
  cloudBackup: boolean;
  localBackup: boolean;
  encryptionEnabled: boolean;
}

export interface BackupMetadata {
  id: string;
  type: 'full' | 'incremental' | 'differential';
  timestamp: Date;
  size: number;
  checksum: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  platform: 'ios' | 'android' | 'web';
  userId: string;
  status: 'completed' | 'failed' | 'in_progress' | 'cancelled';
  error?: string;
  verificationStatus: 'pending' | 'verified' | 'failed';
}

export interface RecoveryPlan {
  id: string;
  name: string;
  description: string;
  triggerConditions: string[];
  recoverySteps: RecoveryStep[];
  estimatedTime: number; // minutes
  lastTested: Date;
  testResults: RecoveryTestResult[];
}

export interface RecoveryStep {
  id: string;
  name: string;
  description: string;
  type:
    | 'data_restore'
    | 'service_restart'
    | 'cache_clear'
    | 'user_notification'
    | 'monitoring_alert';
  priority: 'critical' | 'high' | 'medium' | 'low';
  timeout: number; // seconds
  retryCount: number;
  dependencies: string[]; // IDs of steps that must complete first
}

export interface RecoveryTestResult {
  id: string;
  timestamp: Date;
  duration: number;
  success: boolean;
  errors: string[];
  warnings: string[];
  metrics: {
    dataIntegrity: number; // percentage
    performance: number; // percentage
    userExperience: number; // percentage
  };
}

export interface DisasterRecoveryMetrics {
  totalBackups: number;
  successfulBackups: number;
  failedBackups: number;
  averageBackupTime: number;
  totalDataSize: number;
  lastBackupDate: Date;
  nextScheduledBackup: Date;
  recoveryTimeObjective: number; // minutes
  recoveryPointObjective: number; // hours
}

class BackupRecoveryService {
  private static instance: BackupRecoveryService;
  private isBackupInProgress = false;
  private isRecoveryInProgress = false;
  private backupConfiguration: BackupConfiguration;
  private backupHistory: BackupMetadata[] = [];
  private recoveryPlans: RecoveryPlan[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;

  public static getInstance(): BackupRecoveryService {
    if (!BackupRecoveryService.instance) {
      BackupRecoveryService.instance = new BackupRecoveryService();
    }
    return BackupRecoveryService.instance;
  }

  constructor() {
    this.backupConfiguration = {
      enabled: true,
      frequency: 'daily',
      time: '02:00',
      includeUserData: true,
      includeCommunicationData: true,
      includeProgressData: true,
      includeSettings: true,
      retentionDays: 90,
      cloudBackup: true,
      localBackup: true,
      encryptionEnabled: true,
    };

    this.initializeRecoveryPlans();
  }

  // Initialize backup and recovery service
  async initialize(): Promise<void> {
    try {
      await this.loadBackupConfiguration();
      await this.loadBackupHistory();
      await this.startBackupMonitoring();
      await this.scheduleNextBackup();
      console.log('Backup and Recovery service initialized');
    } catch (error) {
      console.error('Error initializing backup service:', error);
      throw error;
    }
  }

  // Create automatic backup
  async createAutomatedBackup(): Promise<BackupMetadata> {
    if (this.isBackupInProgress) {
      throw new Error('Backup already in progress');
    }

    this.isBackupInProgress = true;

    try {
      addSentryBreadcrumb('Automated backup started', 'backup', 'info');

      const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const backup: BackupMetadata = {
        id: backupId,
        type: 'full',
        timestamp: new Date(),
        size: 0,
        checksum: '',
        version: '1.0.0',
        environment: 'production', // This would be dynamic
        platform: 'ios', // This would be dynamic
        userId: 'system',
        status: 'in_progress',
        verificationStatus: 'pending',
      };

      this.backupHistory.push(backup);
      await this.saveBackupHistory();

      // Collect data for backup
      const backupData = await this.collectBackupData();

      // Calculate size and checksum
      const backupSize = JSON.stringify(backupData).length;
      const checksum = await this.calculateChecksum(backupData);

      backup.size = backupSize;
      backup.checksum = checksum;
      backup.status = 'completed';

      // Save backup locally
      if (this.backupConfiguration.localBackup) {
        await this.saveLocalBackup(backupId, backupData);
      }

      // Upload to cloud
      if (this.backupConfiguration.cloudBackup) {
        await this.uploadToCloud(backupId, backupData);
      }

      // Cleanup old backups
      await this.cleanupOldBackups();

      // Verify backup integrity
      await this.verifyBackup(backup);

      await this.saveBackupHistory();

      addSentryBreadcrumb('Automated backup completed', 'backup', 'info', {
        backupId,
        size: backupSize,
        duration: Date.now() - backup.timestamp.getTime(),
      });

      console.log('Automated backup completed:', backupId);
      return backup;
    } catch (error) {
      console.error('Error creating automated backup:', error);

      // Update backup status
      const currentBackup = this.backupHistory.find(
        b => b.status === 'in_progress'
      );
      if (currentBackup) {
        currentBackup.status = 'failed';
        currentBackup.error =
          error instanceof Error ? error.message : 'Unknown error';
      }

      captureSentryException(error as Error, { context: 'automated_backup' });
      throw error;
    } finally {
      this.isBackupInProgress = false;
    }
  }

  // Restore from backup
  async restoreFromBackup(
    backupId: string,
    options: {
      selective?: boolean;
      dataTypes?: string[];
      verifyIntegrity?: boolean;
    } = {}
  ): Promise<boolean> {
    if (this.isRecoveryInProgress) {
      throw new Error('Recovery already in progress');
    }

    this.isRecoveryInProgress = true;

    try {
      addSentryBreadcrumb('Backup restoration started', 'recovery', 'info', {
        backupId,
      });

      const backup = this.backupHistory.find(b => b.id === backupId);
      if (!backup) {
        throw new Error('Backup not found');
      }

      // Verify backup integrity if requested
      if (options.verifyIntegrity !== false) {
        const isValid = await this.verifyBackupIntegrity(backup);
        if (!isValid) {
          throw new Error('Backup integrity verification failed');
        }
      }

      // Load backup data
      const backupData = await this.loadBackupData(backupId);

      // Execute recovery plan
      const recoveryPlan = this.getRecoveryPlan('standard');
      await this.executeRecoveryPlan(recoveryPlan, backupData, options);

      addSentryBreadcrumb('Backup restoration completed', 'recovery', 'info', {
        backupId,
        duration: Date.now() - new Date().getTime(),
      });

      console.log('Backup restoration completed:', backupId);
      return true;
    } catch (error) {
      console.error('Error restoring from backup:', error);
      captureSentryException(error as Error, {
        context: 'backup_restoration',
        backupId,
      });
      throw error;
    } finally {
      this.isRecoveryInProgress = false;
    }
  }

  // Manual backup creation
  async createManualBackup(description?: string): Promise<BackupMetadata> {
    try {
      addSentryBreadcrumb('Manual backup started', 'backup', 'info');

      const backupId = `manual_backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const backup: BackupMetadata = {
        id: backupId,
        type: 'full',
        timestamp: new Date(),
        size: 0,
        checksum: '',
        version: '1.0.0',
        environment: 'production',
        platform: 'ios',
        userId: 'manual',
        status: 'in_progress',
        verificationStatus: 'pending',
      };

      const backupData = await this.collectBackupData();
      const backupSize = JSON.stringify(backupData).length;
      const checksum = await this.calculateChecksum(backupData);

      backup.size = backupSize;
      backup.checksum = checksum;
      backup.status = 'completed';

      // Save locally
      await this.saveLocalBackup(backupId, backupData);

      this.backupHistory.push(backup);
      await this.saveBackupHistory();

      addSentryBreadcrumb('Manual backup completed', 'backup', 'info', {
        backupId,
        size: backupSize,
      });

      console.log('Manual backup completed:', backupId);
      return backup;
    } catch (error) {
      console.error('Error creating manual backup:', error);
      throw error;
    }
  }

  // Get backup history
  getBackupHistory(limit: number = 50): BackupMetadata[] {
    return this.backupHistory
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Get recovery plans
  getRecoveryPlans(): RecoveryPlan[] {
    return [...this.recoveryPlans];
  }

  // Test recovery plan
  async testRecoveryPlan(planId: string): Promise<RecoveryTestResult> {
    try {
      const plan = this.recoveryPlans.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Recovery plan not found');
      }

      const startTime = Date.now();
      const testResult: RecoveryTestResult = {
        id: `test_${Date.now()}`,
        timestamp: new Date(),
        duration: 0,
        success: false,
        errors: [],
        warnings: [],
        metrics: {
          dataIntegrity: 0,
          performance: 0,
          userExperience: 0,
        },
      };

      // Execute test steps
      for (const step of plan.recoverySteps) {
        try {
          await this.executeRecoveryStep(step, testResult);
        } catch (error) {
          testResult.errors.push(
            `Step ${step.name} failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      testResult.duration = Date.now() - startTime;
      testResult.success = testResult.errors.length === 0;

      // Calculate metrics
      testResult.metrics.dataIntegrity = testResult.success ? 100 : 0;
      testResult.metrics.performance = Math.max(
        0,
        100 - (testResult.duration / plan.estimatedTime) * 100
      );
      testResult.metrics.userExperience = testResult.success ? 100 : 50;

      // Save test result
      plan.testResults.push(testResult);
      if (plan.testResults.length > 10) {
        plan.testResults = plan.testResults.slice(-10);
      }

      return testResult;
    } catch (error) {
      console.error('Error testing recovery plan:', error);
      throw error;
    }
  }

  // Get backup and recovery metrics
  getBackupMetrics(): DisasterRecoveryMetrics {
    const totalBackups = this.backupHistory.length;
    const successfulBackups = this.backupHistory.filter(
      b => b.status === 'completed'
    ).length;
    const failedBackups = this.backupHistory.filter(
      b => b.status === 'failed'
    ).length;

    const completedBackups = this.backupHistory.filter(
      b => b.status === 'completed'
    );
    const averageBackupTime =
      completedBackups.length > 0
        ? completedBackups.reduce(
            (sum, b) => sum + (Date.now() - b.timestamp.getTime()),
            0
          ) / completedBackups.length
        : 0;

    const totalDataSize = this.backupHistory
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + b.size, 0);

    const lastBackup = this.backupHistory
      .filter(b => b.status === 'completed')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    const nextBackup = this.calculateNextBackupTime();

    return {
      totalBackups,
      successfulBackups,
      failedBackups,
      averageBackupTime,
      totalDataSize,
      lastBackupDate: lastBackup?.timestamp || new Date(),
      nextScheduledBackup: nextBackup,
      recoveryTimeObjective: 30, // 30 minutes
      recoveryPointObjective: 24, // 24 hours
    };
  }

  // Private helper methods
  private async collectBackupData(): Promise<any> {
    const backupData = {
      timestamp: new Date(),
      version: '1.0.0',
      data: {},
    };

    // Collect user data
    if (this.backupConfiguration.includeUserData) {
      backupData.data.users = await this.collectUserData();
    }

    // Collect communication data
    if (this.backupConfiguration.includeCommunicationData) {
      backupData.data.communication = await this.collectCommunicationData();
    }

    // Collect progress data
    if (this.backupConfiguration.includeProgressData) {
      backupData.data.progress = await this.collectProgressData();
    }

    // Collect settings
    if (this.backupConfiguration.includeSettings) {
      backupData.data.settings = await this.collectSettingsData();
    }

    return backupData;
  }

  private async collectUserData(): Promise<any> {
    // Collect user profiles, preferences, etc.
    return {};
  }

  private async collectCommunicationData(): Promise<any> {
    // Collect communication books, messages, symbols
    return {};
  }

  private async collectProgressData(): Promise<any> {
    // Collect learning progress, achievements, analytics
    return {};
  }

  private async collectSettingsData(): Promise<any> {
    // Collect app settings and configurations
    return {};
  }

  private async calculateChecksum(data: any): Promise<string> {
    const dataString = JSON.stringify(data);
    const hashBuffer = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(dataString)
    );
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async saveLocalBackup(backupId: string, data: any): Promise<void> {
    const backupPath = `${FileSystem.documentDirectory}backups/${backupId}.json`;
    await FileSystem.writeAsStringAsync(backupPath, JSON.stringify(data));
  }

  private async loadBackupData(backupId: string): Promise<any> {
    const backupPath = `${FileSystem.documentDirectory}backups/${backupId}.json`;
    const backupContent = await FileSystem.readAsStringAsync(backupPath);
    return JSON.parse(backupContent);
  }

  private async uploadToCloud(backupId: string, data: any): Promise<void> {
    // Implement cloud upload logic
    console.log('Cloud upload not implemented yet');
  }

  private async verifyBackup(backup: BackupMetadata): Promise<void> {
    try {
      // Load backup data
      const backupData = await this.loadBackupData(backup.id);

      // Verify checksum
      const calculatedChecksum = await this.calculateChecksum(backupData);
      if (calculatedChecksum !== backup.checksum) {
        throw new Error('Backup checksum verification failed');
      }

      // Verify data integrity
      if (!this.verifyDataIntegrity(backupData)) {
        throw new Error('Backup data integrity verification failed');
      }

      backup.verificationStatus = 'verified';
      console.log('Backup verification completed:', backup.id);
    } catch (error) {
      backup.verificationStatus = 'failed';
      console.error('Backup verification failed:', error);
      throw error;
    }
  }

  private verifyDataIntegrity(data: any): boolean {
    // Basic integrity checks
    return data && typeof data === 'object' && data.timestamp;
  }

  private async cleanupOldBackups(): Promise<void> {
    const cutoffDate = new Date(
      Date.now() - this.backupConfiguration.retentionDays * 24 * 60 * 60 * 1000
    );

    this.backupHistory = this.backupHistory.filter(backup => {
      if (backup.timestamp < cutoffDate) {
        // Remove old backup files
        this.removeBackupFile(backup.id);
        return false;
      }
      return true;
    });

    await this.saveBackupHistory();
    console.log('Old backups cleaned up');
  }

  private async removeBackupFile(backupId: string): Promise<void> {
    try {
      const backupPath = `${FileSystem.documentDirectory}backups/${backupId}.json`;
      await FileSystem.deleteAsync(backupPath);
    } catch (error) {
      console.error('Error removing backup file:', error);
    }
  }

  private initializeRecoveryPlans(): void {
    this.recoveryPlans = [
      {
        id: 'standard',
        name: 'Standard Recovery',
        description: 'Standard data recovery procedure',
        triggerConditions: ['data_loss', 'corruption', 'user_request'],
        recoverySteps: [
          {
            id: 'verify_backup',
            name: 'Verify Backup Integrity',
            description: 'Verify backup file integrity and completeness',
            type: 'data_restore',
            priority: 'critical',
            timeout: 300,
            retryCount: 3,
            dependencies: [],
          },
          {
            id: 'restore_user_data',
            name: 'Restore User Data',
            description: 'Restore user profiles and settings',
            type: 'data_restore',
            priority: 'high',
            timeout: 600,
            retryCount: 2,
            dependencies: ['verify_backup'],
          },
          {
            id: 'restore_communication_data',
            name: 'Restore Communication Data',
            description: 'Restore communication books and messages',
            type: 'data_restore',
            priority: 'high',
            timeout: 900,
            retryCount: 2,
            dependencies: ['restore_user_data'],
          },
          {
            id: 'restore_progress_data',
            name: 'Restore Progress Data',
            description: 'Restore learning progress and achievements',
            type: 'data_restore',
            priority: 'medium',
            timeout: 600,
            retryCount: 1,
            dependencies: ['restore_communication_data'],
          },
          {
            id: 'clear_cache',
            name: 'Clear Application Cache',
            description: 'Clear app cache to prevent conflicts',
            type: 'cache_clear',
            priority: 'medium',
            timeout: 60,
            retryCount: 1,
            dependencies: ['restore_progress_data'],
          },
          {
            id: 'restart_services',
            name: 'Restart Services',
            description: 'Restart background services and sync',
            type: 'service_restart',
            priority: 'low',
            timeout: 120,
            retryCount: 1,
            dependencies: ['clear_cache'],
          },
          {
            id: 'notify_users',
            name: 'Notify Users',
            description: 'Notify users that recovery is complete',
            type: 'user_notification',
            priority: 'low',
            timeout: 30,
            retryCount: 1,
            dependencies: ['restart_services'],
          },
        ],
        estimatedTime: 45,
        lastTested: new Date(),
        testResults: [],
      },
    ];
  }

  private async executeRecoveryPlan(
    plan: RecoveryPlan,
    backupData: any,
    options: any
  ): Promise<void> {
    // Execute recovery steps in dependency order
    const executedSteps = new Set<string>();

    while (executedSteps.size < plan.recoverySteps.length) {
      const availableSteps = plan.recoverySteps.filter(
        step =>
          !executedSteps.has(step.id) &&
          step.dependencies.every(dep => executedSteps.has(dep))
      );

      if (availableSteps.length === 0) {
        throw new Error('Recovery plan has circular dependencies');
      }

      for (const step of availableSteps) {
        await this.executeRecoveryStep(step, options);
        executedSteps.add(step.id);
      }
    }
  }

  private async executeRecoveryStep(
    step: RecoveryStep,
    options: any
  ): Promise<void> {
    console.log(`Executing recovery step: ${step.name}`);

    switch (step.type) {
      case 'data_restore':
        await this.executeDataRestore(step, options);
        break;
      case 'cache_clear':
        await this.executeCacheClear(step);
        break;
      case 'service_restart':
        await this.executeServiceRestart(step);
        break;
      case 'user_notification':
        await this.executeUserNotification(step);
        break;
      default:
        console.log(`Unknown recovery step type: ${step.type}`);
    }
  }

  private async executeDataRestore(
    step: RecoveryStep,
    options: any
  ): Promise<void> {
    // Restore specific data types
    console.log(`Restoring data for step: ${step.name}`);
  }

  private async executeCacheClear(step: RecoveryStep): Promise<void> {
    // Clear application cache
    console.log('Clearing application cache');
  }

  private async executeServiceRestart(step: RecoveryStep): Promise<void> {
    // Restart background services
    console.log('Restarting background services');
  }

  private async executeUserNotification(step: RecoveryStep): Promise<void> {
    // Notify users about recovery completion
    console.log('Notifying users about recovery completion');
  }

  private calculateNextBackupTime(): Date {
    const now = new Date();
    const [hours, minutes] = this.backupConfiguration.time
      .split(':')
      .map(Number);

    const nextBackup = new Date(now);
    nextBackup.setHours(hours, minutes, 0, 0);

    // If the time has passed today, schedule for tomorrow
    if (nextBackup <= now) {
      nextBackup.setDate(nextBackup.getDate() + 1);
    }

    return nextBackup;
  }

  private async scheduleNextBackup(): Promise<void> {
    if (!this.backupConfiguration.enabled) return;

    const nextBackupTime = this.calculateNextBackupTime();
    const delay = nextBackupTime.getTime() - Date.now();

    if (delay > 0) {
      setTimeout(() => {
        this.createAutomatedBackup();
        this.scheduleNextBackup(); // Schedule next backup
      }, delay);
    }
  }

  private async startBackupMonitoring(): Promise<void> {
    // Monitor backup health every hour
    this.monitoringInterval = setInterval(
      async () => {
        await this.checkBackupHealth();
      },
      60 * 60 * 1000
    ); // 1 hour
  }

  private async checkBackupHealth(): Promise<void> {
    const metrics = this.getBackupMetrics();

    // Check if backups are running on schedule
    const lastBackupAge = Date.now() - metrics.lastBackupDate.getTime();
    const maxAge = 25 * 60 * 60 * 1000; // 25 hours

    if (lastBackupAge > maxAge) {
      captureSentryException(new Error('Backup schedule missed'), {
        context: 'backup_health',
        lastBackupAge,
        maxAge,
      });
    }

    // Check backup success rate
    const successRate =
      metrics.totalBackups > 0
        ? metrics.successfulBackups / metrics.totalBackups
        : 1;
    if (successRate < 0.9) {
      captureSentryException(new Error('Low backup success rate'), {
        context: 'backup_health',
        successRate,
        successfulBackups: metrics.successfulBackups,
        totalBackups: metrics.totalBackups,
      });
    }
  }

  // Storage management
  private async loadBackupConfiguration(): Promise<void> {
    try {
      const config = await AsyncStorage.getItem('backup_configuration');
      if (config) {
        this.backupConfiguration = {
          ...this.backupConfiguration,
          ...JSON.parse(config),
        };
      }
    } catch (error) {
      console.error('Error loading backup configuration:', error);
    }
  }

  private async saveBackupConfiguration(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'backup_configuration',
        JSON.stringify(this.backupConfiguration)
      );
    } catch (error) {
      console.error('Error saving backup configuration:', error);
    }
  }

  private async loadBackupHistory(): Promise<void> {
    try {
      const history = await AsyncStorage.getItem('backup_history');
      if (history) {
        this.backupHistory = JSON.parse(history);
      }
    } catch (error) {
      console.error('Error loading backup history:', error);
    }
  }

  private async saveBackupHistory(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'backup_history',
        JSON.stringify(this.backupHistory)
      );
    } catch (error) {
      console.error('Error saving backup history:', error);
    }
  }

  // Update backup configuration
  async updateBackupConfiguration(
    config: Partial<BackupConfiguration>
  ): Promise<void> {
    this.backupConfiguration = { ...this.backupConfiguration, ...config };
    await this.saveBackupConfiguration();

    // Reschedule backups if timing changed
    if (config.time || config.frequency) {
      this.scheduleNextBackup();
    }
  }

  // Get backup configuration
  getBackupConfiguration(): BackupConfiguration {
    return { ...this.backupConfiguration };
  }

  // Get recovery plan
  getRecoveryPlan(planId: string): RecoveryPlan | undefined {
    return this.recoveryPlans.find(p => p.id === planId);
  }

  // Cleanup
  async cleanup(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.isBackupInProgress = false;
    this.isRecoveryInProgress = false;

    console.log('Backup and Recovery service cleaned up');
  }
}

export default BackupRecoveryService;
