// Monitoring Service for Ausmo AAC App
// Provides comprehensive monitoring for API health, database performance, and user metrics

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Optional Sentry integration - only use if available
let captureSentryException: ((error: Error, context?: any) => void) | null =
  null;
let addSentryBreadcrumb:
  | ((message: string, category: string, level?: string, data?: any) => void)
  | null = null;

// Try to import Sentry functions, but don't fail if not available
try {
  const sentryModule = require('../config/sentry');
  captureSentryException = sentryModule.captureSentryException;
  addSentryBreadcrumb = sentryModule.addSentryBreadcrumb;
} catch (error) {
  // Sentry not available - continue without it
  console.log('Sentry not available in monitoring service');
}

export interface HealthCheck {
  component: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  timestamp: Date;
  error?: string;
}

export interface PerformanceMetrics {
  apiResponseTime: number;
  databaseQueryTime: number;
  memoryUsage: number;
  batteryLevel: number;
  networkLatency: number;
  frameRate: number;
  timestamp: Date;
}

export interface UserMetrics {
  userId: string;
  sessionDuration: number;
  actionsPerformed: number;
  errorsEncountered: number;
  featuresUsed: string[];
  lastActive: Date;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: (metrics: PerformanceMetrics) => boolean;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  enabled: boolean;
}

class MonitoringService {
  private static instance: MonitoringService;
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private healthChecks: HealthCheck[] = [];
  private performanceHistory: PerformanceMetrics[] = [];
  private userMetrics: Map<string, UserMetrics> = new Map();
  private alertRules: AlertRule[] = [];

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  // Initialize monitoring service
  async initialize(): Promise<void> {
    try {
      await this.loadMonitoringData();
      await this.setupAlertRules();
      await this.startMonitoring();
      console.log('Monitoring service initialized');
    } catch (error) {
      console.error('Error initializing monitoring service:', error);
      throw error;
    }
  }

  // Start monitoring
  private async startMonitoring(): Promise<void> {
    if (this.isMonitoring) return;

    this.isMonitoring = true;

    // Monitor every 30 seconds
    this.monitoringInterval = setInterval(async () => {
      await this.performHealthChecks();
      await this.collectPerformanceMetrics();
      await this.checkAlertRules();
    }, 30000);

    console.log('Monitoring started');
  }

  // Stop monitoring
  async stopMonitoring(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('Monitoring stopped');
  }

  // Perform health checks on all components
  private async performHealthChecks(): Promise<void> {
    const components = [
      'database',
      'supabase',
      'network',
      'storage',
      'audio',
      'analytics',
    ];

    const healthCheckPromises = components.map(component =>
      this.performComponentHealthCheck(component)
    );

    try {
      const results = await Promise.allSettled(healthCheckPromises);

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          this.healthChecks.push(result.value);
        } else {
          console.error(
            `Health check failed for ${components[index]}:`,
            result.reason
          );
        }
      });

      // Keep only last 100 health checks
      if (this.healthChecks.length > 100) {
        this.healthChecks = this.healthChecks.slice(-100);
      }

      await this.saveHealthChecks();
    } catch (error) {
      console.error('Error performing health checks:', error);
    }
  }

  // Perform health check for a specific component
  private async performComponentHealthCheck(
    component: string
  ): Promise<HealthCheck> {
    const startTime = Date.now();

    try {
      let status: HealthCheck['status'] = 'healthy';
      let error: string | undefined;

      switch (component) {
        case 'database':
          status = await this.checkDatabaseHealth();
          break;
        case 'supabase':
          status = await this.checkSupabaseHealth();
          break;
        case 'network':
          status = await this.checkNetworkHealth();
          break;
        case 'storage':
          status = await this.checkStorageHealth();
          break;
        case 'audio':
          status = await this.checkAudioHealth();
          break;
        case 'analytics':
          status = await this.checkAnalyticsHealth();
          break;
        default:
          status = 'unhealthy';
          error = `Unknown component: ${component}`;
      }

      const responseTime = Date.now() - startTime;

      return {
        component,
        status,
        responseTime,
        timestamp: new Date(),
        error,
      };
    } catch (err) {
      const responseTime = Date.now() - startTime;
      return {
        component,
        status: 'unhealthy',
        responseTime,
        timestamp: new Date(),
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }

  // Component health check implementations
  private async checkDatabaseHealth(): Promise<HealthCheck['status']> {
    try {
      // Check if we can write and read from local database
      const testKey = `health_check_${Date.now()}`;
      await AsyncStorage.setItem(testKey, 'test');
      await AsyncStorage.getItem(testKey);
      await AsyncStorage.removeItem(testKey);
      return 'healthy';
    } catch (error) {
      return 'unhealthy';
    }
  }

  private async checkSupabaseHealth(): Promise<HealthCheck['status']> {
    try {
      // Check if Supabase is accessible
      // This would typically involve a simple query or ping
      return 'healthy'; // Placeholder
    } catch (error) {
      return 'unhealthy';
    }
  }

  private async checkNetworkHealth(): Promise<HealthCheck['status']> {
    try {
      const networkState = await NetInfo.fetch();
      return networkState.isConnected ? 'healthy' : 'degraded';
    } catch (error) {
      return 'unhealthy';
    }
  }

  private async checkStorageHealth(): Promise<HealthCheck['status']> {
    try {
      // Check available storage space
      // This would require a storage API check
      return 'healthy'; // Placeholder
    } catch (error) {
      return 'unhealthy';
    }
  }

  private async checkAudioHealth(): Promise<HealthCheck['status']> {
    try {
      // Check if audio services are working
      // This would involve testing audio playback/recording
      return 'healthy'; // Placeholder
    } catch (error) {
      return 'unhealthy';
    }
  }

  private async checkAnalyticsHealth(): Promise<HealthCheck['status']> {
    try {
      // Check if analytics service is working
      return 'healthy'; // Placeholder
    } catch (error) {
      return 'unhealthy';
    }
  }

  // Collect performance metrics
  private async collectPerformanceMetrics(): Promise<void> {
    try {
      const metrics: PerformanceMetrics = {
        apiResponseTime: await this.measureApiResponseTime(),
        databaseQueryTime: await this.measureDatabaseQueryTime(),
        memoryUsage: await this.measureMemoryUsage(),
        batteryLevel: await this.measureBatteryLevel(),
        networkLatency: await this.measureNetworkLatency(),
        frameRate: await this.measureFrameRate(),
        timestamp: new Date(),
      };

      this.performanceHistory.push(metrics);

      // Keep only last 1000 metrics
      if (this.performanceHistory.length > 1000) {
        this.performanceHistory = this.performanceHistory.slice(-1000);
      }

      await this.savePerformanceMetrics();
    } catch (error) {
      console.error('Error collecting performance metrics:', error);
    }
  }

  // Performance measurement helpers
  private async measureApiResponseTime(): Promise<number> {
    const startTime = Date.now();
    try {
      // Measure API response time (placeholder)
      await new Promise(resolve => setTimeout(resolve, 10));
      return Date.now() - startTime;
    } catch (error) {
      return -1;
    }
  }

  private async measureDatabaseQueryTime(): Promise<number> {
    const startTime = Date.now();
    try {
      // Measure database query time (placeholder)
      await AsyncStorage.getItem('test_key');
      return Date.now() - startTime;
    } catch (error) {
      return -1;
    }
  }

  private async measureMemoryUsage(): Promise<number> {
    try {
      // Measure memory usage (placeholder - would need actual memory API)
      return Math.random() * 100; // Mock value
    } catch (error) {
      return -1;
    }
  }

  private async measureBatteryLevel(): Promise<number> {
    try {
      // Measure battery level (placeholder - would need battery API)
      return Math.random() * 100; // Mock value
    } catch (error) {
      return -1;
    }
  }

  private async measureNetworkLatency(): Promise<number> {
    const startTime = Date.now();
    try {
      // Measure network latency (placeholder)
      await new Promise(resolve => setTimeout(resolve, 5));
      return Date.now() - startTime;
    } catch (error) {
      return -1;
    }
  }

  private async measureFrameRate(): Promise<number> {
    try {
      // Measure frame rate (placeholder - would need performance API)
      return 60; // Mock value
    } catch (error) {
      return -1;
    }
  }

  // Track user metrics
  trackUserAction(userId: string, action: string, metadata?: any): void {
    try {
      const existing = this.userMetrics.get(userId) || {
        userId,
        sessionDuration: 0,
        actionsPerformed: 0,
        errorsEncountered: 0,
        featuresUsed: [],
        lastActive: new Date(),
      };

      existing.actionsPerformed++;
      existing.lastActive = new Date();

      if (
        metadata?.feature &&
        !existing.featuresUsed.includes(metadata.feature)
      ) {
        existing.featuresUsed.push(metadata.feature);
      }

      this.userMetrics.set(userId, existing);

      // Add breadcrumb for user action
      if (addSentryBreadcrumb) {
        addSentryBreadcrumb(`User action: ${action}`, 'user_action', 'info', {
          userId,
          action,
          metadata,
        });
      }
    } catch (error) {
      console.error('Error tracking user action:', error);
    }
  }

  trackUserError(userId: string, error: string, context?: any): void {
    try {
      const existing = this.userMetrics.get(userId);
      if (existing) {
        existing.errorsEncountered++;
        existing.lastActive = new Date();
        this.userMetrics.set(userId, existing);
      }

      // Send error to Sentry
      if (captureSentryException) {
        captureSentryException(new Error(error), { userId, context });
      }
    } catch (trackError) {
      console.error('Error tracking user error:', trackError);
    }
  }

  // Alert rule management
  private setupAlertRules(): void {
    this.alertRules = [
      {
        id: 'high-memory-usage',
        name: 'High Memory Usage',
        condition: metrics => metrics.memoryUsage > 80,
        threshold: 80,
        severity: 'high',
        message: 'Memory usage is above 80%',
        enabled: true,
      },
      {
        id: 'slow-api-response',
        name: 'Slow API Response',
        condition: metrics => metrics.apiResponseTime > 2000,
        threshold: 2000,
        severity: 'medium',
        message: 'API response time is above 2 seconds',
        enabled: true,
      },
      {
        id: 'high-battery-drain',
        name: 'High Battery Drain',
        condition: metrics => metrics.batteryLevel < 20,
        threshold: 20,
        severity: 'medium',
        message: 'Battery level is below 20%',
        enabled: true,
      },
      {
        id: 'network-issues',
        name: 'Network Issues',
        condition: metrics => metrics.networkLatency > 1000,
        threshold: 1000,
        severity: 'medium',
        message: 'Network latency is above 1 second',
        enabled: true,
      },
    ];
  }

  private async checkAlertRules(): Promise<void> {
    if (this.performanceHistory.length === 0) return;

    const latestMetrics =
      this.performanceHistory[this.performanceHistory.length - 1];

    for (const rule of this.alertRules) {
      if (!rule.enabled) continue;

      try {
        if (rule.condition(latestMetrics)) {
          await this.triggerAlert(rule, latestMetrics);
        }
      } catch (error) {
        console.error(`Error checking alert rule ${rule.id}:`, error);
      }
    }
  }

  private async triggerAlert(
    rule: AlertRule,
    metrics: PerformanceMetrics
  ): Promise<void> {
    console.warn(`ALERT: ${rule.message}`, { rule: rule.id, metrics });

    // Send alert to Sentry
    if (captureSentryException) {
      captureSentryException(new Error(rule.message), {
        alertRule: rule.id,
        severity: rule.severity,
        metrics,
      });
    }

    // Add breadcrumb for alert (if Sentry is available)
    if (addSentryBreadcrumb) {
      addSentryBreadcrumb(
        `Alert triggered: ${rule.name}`,
        'monitoring',
        rule.severity === 'critical' ? 'error' : 'warning',
        {
          ruleId: rule.id,
          message: rule.message,
          metrics,
        }
      );
    }
  }

  // Get monitoring data
  getHealthChecks(): HealthCheck[] {
    return [...this.healthChecks];
  }

  getPerformanceHistory(): PerformanceMetrics[] {
    return [...this.performanceHistory];
  }

  getUserMetrics(userId: string): UserMetrics | undefined {
    return this.userMetrics.get(userId);
  }

  getAllUserMetrics(): Map<string, UserMetrics> {
    return new Map(this.userMetrics);
  }

  getAlertRules(): AlertRule[] {
    return [...this.alertRules];
  }

  // Storage management
  private async saveHealthChecks(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'health_checks',
        JSON.stringify(this.healthChecks)
      );
    } catch (error) {
      console.error('Error saving health checks:', error);
    }
  }

  private async savePerformanceMetrics(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'performance_metrics',
        JSON.stringify(this.performanceHistory)
      );
    } catch (error) {
      console.error('Error saving performance metrics:', error);
    }
  }

  private async loadMonitoringData(): Promise<void> {
    try {
      const [healthChecksData, performanceData] = await Promise.all([
        AsyncStorage.getItem('health_checks'),
        AsyncStorage.getItem('performance_metrics'),
      ]);

      if (healthChecksData) {
        this.healthChecks = JSON.parse(healthChecksData);
      }

      if (performanceData) {
        this.performanceHistory = JSON.parse(performanceData);
      }
    } catch (error) {
      console.error('Error loading monitoring data:', error);
    }
  }

  // Cleanup
  async cleanup(): Promise<void> {
    await this.stopMonitoring();
    this.healthChecks = [];
    this.performanceHistory = [];
    this.userMetrics.clear();
    console.log('Monitoring service cleaned up');
  }
}

export default MonitoringService;
