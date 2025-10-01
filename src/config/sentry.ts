// Optional Sentry integration with safe no-op fallbacks when the module is missing
let SafeSentry: any;
try {
  // Prefer runtime require so bundlers do not error if the dependency is absent
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  SafeSentry = require('@sentry/react-native');
} catch (error) {
  // Provide minimal no-op surface compatible with our usage
  const noop = () => {};
  const withScope = (fn: (scope: any) => void) =>
    fn({
      setContext: noop,
      setTag: noop,
      clear: noop,
    });
  SafeSentry = {
    init: noop,
    configureScope: withScope,
    withScope,
    setUser: noop,
    setTag: noop,
    addBreadcrumb: noop,
    captureException: noop,
    captureMessage: noop,
    startTransaction: (_opts: any) => ({ finish: noop }),
    ReactNavigationInstrumentation: class {},
  };
}

// Sentry configuration for Ausmo AAC App
export const initSentry = () => {
  // If SafeSentry.init is a noop, this call is harmless
  const integrations = [] as any[];
  if (SafeSentry && SafeSentry.ReactNavigationInstrumentation) {
    integrations.push(
      new SafeSentry.ReactNavigationInstrumentation({
        routeChangeTimeoutMs: 500,
      })
    );
  }

  SafeSentry.init({
    dsn:
      process.env.EXPO_PUBLIC_SENTRY_DSN ||
      'https://your-dsn@sentry.io/project-id',
    environment: process.env.NODE_ENV || 'development',
    enableTracing: true,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    enableUserInteractionTracing: true,
    attachScreenshot: false,
    enableAutoPerformanceTracing: true,
    beforeSend: (event: any) => {
      if (
        process.env.NODE_ENV === 'development' &&
        !process.env.EXPO_PUBLIC_SENTRY_DEBUG
      ) {
        return null;
      }
      if (event.user) {
        const filteredUser = {
          id: event.user.id,
          role: event.user.role,
        };
        event.user = filteredUser;
      }
      if (event.contexts) {
        delete event.contexts.device;
        delete event.contexts.os;
      }
      if (event.tags) {
        delete event.tags.ip;
        delete event.tags.user_agent;
      }
      return event;
    },
    enableStallTracking: true,
    enableSlowFrameTracking: true,
    enableMemoryTracking: true,
    enableNetworkTracking: true,
    networkDetailAllowUrls: [
      'https://your-project-id.supabase.co',
      'https://api.your-backend.com',
    ],
    integrations,
    initialScope: {
      tags: {
        component: 'ausmo-aac-app',
      },
    },
  });
};

// Helper function to set user context for Sentry
export const setSentryUser = (user: any) => {
  if (!user) {
    SafeSentry.configureScope((scope: any) => {
      scope.clear();
      scope.setTag('user_type', 'anonymous');
    });
    return;
  }

  SafeSentry.setUser({
    id: user.id,
    role: user.role,
  });

  SafeSentry.setTag('user_role', user.role);
  SafeSentry.setTag('user_active', user.isActive ? 'true' : 'false');
};

// Helper function to add breadcrumb for debugging
export const addSentryBreadcrumb = (
  message: string,
  category: string,
  level: 'info' | 'warning' | 'error' = 'info',
  data?: any
) => {
  SafeSentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
};

// Helper function to capture exceptions
export const captureSentryException = (error: Error, context?: any) => {
  SafeSentry.withScope((scope: any) => {
    if (context) {
      scope.setContext('additional_info', context);
    }
    SafeSentry.captureException(error);
  });
};

// Helper function to capture messages
export const captureSentryMessage = (
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: any
) => {
  SafeSentry.withScope((scope: any) => {
    if (context) {
      scope.setContext('additional_info', context);
    }
    SafeSentry.captureMessage(message, level);
  });
};

// Performance monitoring helpers
export const startSentryTransaction = (name: string, description?: string) => {
  return SafeSentry.startTransaction({
    name,
    description,
  });
};

export const finishSentryTransaction = (transaction: any) => {
  if (transaction && typeof transaction.finish === 'function') {
    transaction.finish();
  }
};

// Export Sentry-like object for optional consumers
export const Sentry = SafeSentry;
