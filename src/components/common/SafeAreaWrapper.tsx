// Safe Area Wrapper Component for Ausmo AAC App
// Handles notches, front cameras, and other screen insets

import React from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  style?: any;
  backgroundColor?: string;
  statusBarStyle?: 'default' | 'light-content' | 'dark-content';
  statusBarBackgroundColor?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  forceInset?: {
    top?: 'always' | 'never';
    bottom?: 'always' | 'never';
    left?: 'always' | 'never';
    right?: 'always' | 'never';
  };
}

export const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  style,
  backgroundColor = COLORS.BACKGROUND,
  statusBarStyle = 'dark-content',
  statusBarBackgroundColor = backgroundColor,
  edges = ['top', 'bottom', 'left', 'right'],
  forceInset,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={statusBarBackgroundColor}
        translucent={Platform.OS === 'android'}
      />
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor },
          style,
        ]}
        edges={edges}
        // forceInset={forceInset} // Not supported in newer versions
      >
        {children}
      </SafeAreaView>
    </>
  );
};

// Screen-specific safe area components
export const ScreenSafeArea: React.FC<Omit<SafeAreaWrapperProps, 'edges'>> = (props) => (
  <SafeAreaWrapper
    {...props}
    edges={['top', 'bottom', 'left', 'right']}
  />
);

export const TopSafeArea: React.FC<Omit<SafeAreaWrapperProps, 'edges'>> = (props) => (
  <SafeAreaWrapper
    {...props}
    edges={['top']}
  />
);

export const BottomSafeArea: React.FC<Omit<SafeAreaWrapperProps, 'edges'>> = (props) => (
  <SafeAreaWrapper
    {...props}
    edges={['bottom']}
  />
);

export const HorizontalSafeArea: React.FC<Omit<SafeAreaWrapperProps, 'edges'>> = (props) => (
  <SafeAreaWrapper
    {...props}
    edges={['left', 'right']}
  />
);

// Header safe area for navigation headers
export const HeaderSafeArea: React.FC<Omit<SafeAreaWrapperProps, 'edges'>> = (props) => (
  <SafeAreaWrapper
    {...props}
    edges={['top']}
    forceInset={{ top: 'always' }}
  />
);

// Footer safe area for bottom navigation
export const FooterSafeArea: React.FC<Omit<SafeAreaWrapperProps, 'edges'>> = (props) => (
  <SafeAreaWrapper
    {...props}
    edges={['bottom']}
    forceInset={{ bottom: 'always' }}
  />
);

// Communication screen safe area (handles all edges)
export const CommunicationSafeArea: React.FC<Omit<SafeAreaWrapperProps, 'edges'>> = (props) => (
  <SafeAreaWrapper
    {...props}
    edges={['top', 'bottom', 'left', 'right']}
    forceInset={{
      top: 'always',
      bottom: 'always',
      left: 'always',
      right: 'always',
    }}
  />
);

// Settings screen safe area (handles top and sides)
export const SettingsSafeArea: React.FC<Omit<SafeAreaWrapperProps, 'edges'>> = (props) => (
  <SafeAreaWrapper
    {...props}
    edges={['top', 'left', 'right']}
    forceInset={{
      top: 'always',
      left: 'always',
      right: 'always',
    }}
  />
);

// Modal safe area (handles all edges with extra padding)
export const ModalSafeArea: React.FC<Omit<SafeAreaWrapperProps, 'edges'>> = (props) => (
  <SafeAreaWrapper
    {...props}
    edges={['top', 'bottom', 'left', 'right']}
    forceInset={{
      top: 'always',
      bottom: 'always',
      left: 'always',
      right: 'always',
    }}
    style={[styles.modalContainer, props.style]}
  />
);

// Keyboard safe area (handles keyboard avoidance)
export const KeyboardSafeArea: React.FC<Omit<SafeAreaWrapperProps, 'edges'>> = (props) => (
  <SafeAreaWrapper
    {...props}
    edges={['top', 'left', 'right']}
    forceInset={{
      top: 'always',
      left: 'always',
      right: 'always',
    }}
    style={[styles.keyboardContainer, props.style]}
  />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  keyboardContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

export default SafeAreaWrapper;
