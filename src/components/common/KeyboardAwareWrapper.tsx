// Keyboard Aware Wrapper Component for Ausmo AAC App
// Handles keyboard avoidance and safe areas for keyboard-based screens

import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { KeyboardSafeArea } from './SafeAreaWrapper';

interface KeyboardAwareWrapperProps {
  children: React.ReactNode;
  style?: any;
  backgroundColor?: string;
  behavior?: 'height' | 'position' | 'padding';
  keyboardVerticalOffset?: number;
  enableOnAndroid?: boolean;
  extraScrollHeight?: number;
  extraHeight?: number;
  enableResetScrollToCoords?: boolean;
  resetScrollToCoords?: { x: number; y: number };
  scrollEnabled?: boolean;
}

export const KeyboardAwareWrapper: React.FC<KeyboardAwareWrapperProps> = ({
  children,
  style,
  backgroundColor,
  behavior = Platform.OS === 'ios' ? 'padding' : 'height',
  keyboardVerticalOffset = 0,
  enableOnAndroid = true,
  extraScrollHeight = 20,
  extraHeight = 20,
  enableResetScrollToCoords = true,
  resetScrollToCoords = { x: 0, y: 0 },
  scrollEnabled = true,
}) => {
  if (Platform.OS === 'ios') {
    return (
      <KeyboardSafeArea style={[styles.container, { backgroundColor }, style]}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={behavior}
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
          <KeyboardAwareScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            enableOnAndroid={enableOnAndroid}
            extraScrollHeight={extraScrollHeight}
            extraHeight={extraHeight}
            enableResetScrollToCoords={enableResetScrollToCoords}
            resetScrollToCoords={resetScrollToCoords}
            scrollEnabled={scrollEnabled}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </KeyboardAwareScrollView>
        </KeyboardAvoidingView>
      </KeyboardSafeArea>
    );
  }

  // Android implementation
  return (
    <KeyboardSafeArea style={[styles.container, { backgroundColor }, style]}>
      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={enableOnAndroid}
        extraScrollHeight={extraScrollHeight}
        extraHeight={extraHeight}
        enableResetScrollToCoords={enableResetScrollToCoords}
        resetScrollToCoords={resetScrollToCoords}
        scrollEnabled={scrollEnabled}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </KeyboardAwareScrollView>
    </KeyboardSafeArea>
  );
};

// Specialized wrapper for keyboard page
export const KeyboardPageWrapper: React.FC<
  Omit<KeyboardAwareWrapperProps, 'behavior' | 'keyboardVerticalOffset'>
> = props => (
  <KeyboardAwareWrapper
    {...props}
    behavior="padding"
    keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    extraScrollHeight={50}
    extraHeight={50}
  />
);

// Specialized wrapper for input forms
export const FormWrapper: React.FC<
  Omit<KeyboardAwareWrapperProps, 'behavior' | 'keyboardVerticalOffset'>
> = props => (
  <KeyboardAwareWrapper
    {...props}
    behavior="padding"
    keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    extraScrollHeight={30}
    extraHeight={30}
  />
);

// Specialized wrapper for chat/messaging
export const ChatWrapper: React.FC<
  Omit<KeyboardAwareWrapperProps, 'behavior' | 'keyboardVerticalOffset'>
> = props => (
  <KeyboardAwareWrapper
    {...props}
    behavior="padding"
    keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    extraScrollHeight={20}
    extraHeight={20}
    enableResetScrollToCoords={false}
  />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
});

export default KeyboardAwareWrapper;
