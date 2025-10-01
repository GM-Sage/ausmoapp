// Error Boundary Component

import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TYPOGRAPHY } from '../../constants';
import {
  captureSentryException,
  addSentryBreadcrumb,
} from '../../config/sentry';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { getThemeColors } from '../../utils/themeUtils';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Send error to Sentry for tracking
    captureSentryException(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: 'ErrorBoundary',
      timestamp: new Date().toISOString(),
    });

    // Add breadcrumb for debugging
    addSentryBreadcrumb(
      `ErrorBoundary caught error: ${error.message}`,
      'error',
      'error',
      {
        errorName: error.name,
        errorMessage: error.message,
        componentStack: errorInfo.componentStack,
      }
    );
  }

  handleRetry = () => {
    // Add breadcrumb for retry attempt
    addSentryBreadcrumb(
      'User attempted to retry after error',
      'user_action',
      'info'
    );

    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorDisplay error={this.state.error} onRetry={this.handleRetry} />
      );
    }

    return this.props.children;
  }
}

// Theme-aware error display component
function ErrorDisplay({
  error,
  onRetry,
}: {
  error?: Error;
  onRetry: () => void;
}) {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <Text style={[styles.title, { color: themeColors.text }]}>
        Something went wrong
      </Text>
      <Text style={[styles.message, { color: themeColors.textSecondary }]}>
        {error?.message || 'An unexpected error occurred'}
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: themeColors.primary }]}
        onPress={onRetry}
      >
        <Text style={[styles.buttonText, { color: themeColors.text }]}>
          Try Again
        </Text>
      </TouchableOpacity>
    </View>
  );
}
