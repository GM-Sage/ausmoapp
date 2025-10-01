// Environment configuration types for Ausmo AAC App

export interface EnvironmentConfig {
  name: string;
  environment: 'development' | 'staging' | 'production';
  buildType: 'debug' | 'release';
  logLevel: 'debug' | 'info' | 'warn' | 'error';

  supabase: {
    url: string;
    anonKey: string;
  };

  sentry: {
    dsn: string;
    enabled: boolean;
    tracesSampleRate: number;
  };

  features: {
    analytics: boolean;
    errorReporting: boolean;
    performanceMonitoring: boolean;
  };

  api: {
    timeout: number;
    retries: number;
    baseUrl: string;
  };

  storage: {
    encryption: boolean;
    compression: boolean;
    retentionDays: number;
  };
}

export interface EnvironmentVariables {
  NODE_ENV: string;
  BUILD_TYPE: string;
  LOG_LEVEL: string;

  EXPO_PUBLIC_SUPABASE_URL: string;
  EXPO_PUBLIC_SUPABASE_ANON_KEY: string;

  EXPO_PUBLIC_SENTRY_DSN: string;
  EXPO_PUBLIC_SENTRY_DEBUG: string;

  ENABLE_ANALYTICS: string;
  ENABLE_ERROR_REPORTING: string;
  ENABLE_PERFORMANCE_MONITORING: string;

  REACT_NATIVE_PACKAGER_HOSTNAME: string;
  EXPO_WEB_PORT: string;
}

export interface BuildConfiguration {
  environment: EnvironmentConfig['environment'];
  buildType: EnvironmentConfig['buildType'];
  version: string;
  buildNumber: string;
  platform: 'ios' | 'android' | 'web';
  timestamp: string;
}

export interface DeploymentConfiguration {
  environment: EnvironmentConfig['environment'];
  platform: 'ios' | 'android' | 'both';
  version: string;
  buildType: 'staging' | 'production';
  features: string[];
  rollbackPlan: string;
  monitoringEnabled: boolean;
  backupEnabled: boolean;
}
