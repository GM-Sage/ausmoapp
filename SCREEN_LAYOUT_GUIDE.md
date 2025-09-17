# Screen Layout Guide for Ausmo AAC App

## Overview

This guide covers the comprehensive screen layout handling implemented in the Ausmo AAC app to ensure proper display across all devices, including those with notches, front cameras, and other screen insets.

## Safe Area Components

### 1. SafeAreaWrapper (`src/components/common/SafeAreaWrapper.tsx`)

The main safe area wrapper component that handles all screen insets and provides specialized variants for different screen types.

#### Basic Usage
```tsx
import { SafeAreaWrapper } from '../components/common/SafeAreaWrapper';

<SafeAreaWrapper style={styles.container}>
  {/* Your content */}
</SafeAreaWrapper>
```

#### Specialized Variants

- **ScreenSafeArea**: Full screen with all edges
- **TopSafeArea**: Only top edge (for headers)
- **BottomSafeArea**: Only bottom edge (for footers)
- **HorizontalSafeArea**: Left and right edges only
- **HeaderSafeArea**: Optimized for navigation headers
- **FooterSafeArea**: Optimized for bottom navigation
- **CommunicationSafeArea**: Optimized for communication screens
- **SettingsSafeArea**: Optimized for settings screens
- **ModalSafeArea**: Optimized for modal dialogs
- **KeyboardSafeArea**: Optimized for keyboard-based screens

### 2. KeyboardAwareWrapper (`src/components/common/KeyboardAwareWrapper.tsx`)

Handles keyboard avoidance and safe areas for keyboard-based screens.

#### Basic Usage
```tsx
import { KeyboardAwareWrapper } from '../components/common/KeyboardAwareWrapper';

<KeyboardAwareWrapper style={styles.container}>
  {/* Your content */}
</KeyboardAwareWrapper>
```

#### Specialized Variants

- **KeyboardPageWrapper**: For keyboard pages
- **FormWrapper**: For input forms
- **ChatWrapper**: For chat/messaging interfaces

## Safe Area Hooks

### 1. useSafeArea (`src/hooks/useSafeArea.ts`)

Provides comprehensive safe area measurements and device information.

```tsx
import { useSafeArea } from '../hooks/useSafeArea';

const MyComponent = () => {
  const safeArea = useSafeArea();
  
  return (
    <View style={{
      paddingTop: safeArea.top,
      paddingBottom: safeArea.bottom,
      paddingLeft: safeArea.left,
      paddingRight: safeArea.right,
    }}>
      {/* Content */}
    </View>
  );
};
```

#### Available Properties

- `top`, `bottom`, `left`, `right`: Safe area insets
- `width`, `height`: Screen dimensions
- `availableWidth`, `availableHeight`: Available space after insets
- `hasNotch`: Boolean indicating if device has a notch
- `hasHomeIndicator`: Boolean indicating if device has home indicator
- `isLandscape`: Boolean indicating landscape orientation
- `isTablet`: Boolean indicating if device is a tablet
- `isSmallScreen`: Boolean indicating if device has a small screen

### 2. Specialized Hooks

- **useCommunicationSafeArea**: For communication screens
- **useSettingsSafeArea**: For settings screens
- **useModalSafeArea**: For modal dialogs
- **useKeyboardSafeArea**: For keyboard-based screens

## Screen-Specific Implementations

### 1. Communication Screen

```tsx
import { CommunicationSafeArea } from '../components/common/SafeAreaWrapper';
import { useCommunicationSafeArea } from '../hooks/useSafeArea';

const CommunicationScreen = () => {
  const safeArea = useCommunicationSafeArea();
  
  return (
    <CommunicationSafeArea style={styles.container}>
      {/* Communication content */}
    </CommunicationSafeArea>
  );
};
```

### 2. Settings Screen

```tsx
import { SettingsSafeArea } from '../components/common/SafeAreaWrapper';
import { useSettingsSafeArea } from '../hooks/useSafeArea';

const SettingsScreen = () => {
  const safeArea = useSettingsSafeArea();
  
  return (
    <SettingsSafeArea style={styles.container}>
      {/* Settings content */}
    </SettingsSafeArea>
  );
};
```

### 3. Keyboard Page

```tsx
import { KeyboardPageWrapper } from '../components/common/KeyboardAwareWrapper';
import { useKeyboardSafeArea } from '../hooks/useSafeArea';

const KeyboardPage = () => {
  const safeArea = useKeyboardSafeArea();
  
  return (
    <KeyboardPageWrapper style={styles.container}>
      {/* Keyboard content */}
    </KeyboardPageWrapper>
  );
};
```

## Device-Specific Considerations

### 1. iPhone with Notch (iPhone X and later)

- **Top inset**: ~44-50px for status bar + notch
- **Bottom inset**: ~34px for home indicator
- **Side insets**: ~0px (no side notches)

### 2. iPhone without Notch (iPhone 8 and earlier)

- **Top inset**: ~20px for status bar
- **Bottom inset**: ~0px
- **Side insets**: ~0px

### 3. Android Devices

- **Top inset**: Varies by device and Android version
- **Bottom inset**: Varies by device (navigation bar)
- **Side insets**: Usually 0px

### 4. Tablets

- **All insets**: Usually 0px (no notches or home indicators)
- **Larger screen dimensions**: Consider max content width for readability

## Best Practices

### 1. Always Use Safe Area Components

```tsx
// ✅ Good
<CommunicationSafeArea style={styles.container}>
  <View style={styles.content}>
    {/* Content */}
  </View>
</CommunicationSafeArea>

// ❌ Bad
<View style={styles.container}>
  <View style={styles.content}>
    {/* Content */}
  </View>
</View>
```

### 2. Use Appropriate Variants

```tsx
// ✅ Good - Use specialized variants
<HeaderSafeArea> {/* For headers */}
<FooterSafeArea> {/* For footers */}
<ModalSafeArea> {/* For modals */}

// ❌ Bad - Don't use generic wrapper everywhere
<SafeAreaWrapper edges={['top']}> {/* For headers */}
```

### 3. Handle Keyboard Properly

```tsx
// ✅ Good - Use keyboard-aware wrappers
<KeyboardPageWrapper>
  <TextInput />
  <Keyboard />
</KeyboardPageWrapper>

// ❌ Bad - Don't ignore keyboard
<View>
  <TextInput />
  <Keyboard />
</View>
```

### 4. Consider Device Differences

```tsx
// ✅ Good - Use device-specific logic
const safeArea = useSafeArea();
const headerHeight = safeArea.hasNotch ? 60 + safeArea.top : 60;

// ❌ Bad - Hardcode values
const headerHeight = 60; // Will break on devices with notches
```

## Common Issues and Solutions

### 1. Content Hidden Behind Notch

**Problem**: Content appears behind the notch or status bar.

**Solution**: Use appropriate safe area components.

```tsx
// Before (problematic)
<View style={styles.container}>
  <Text>This might be hidden behind the notch</Text>
</View>

// After (fixed)
<ScreenSafeArea style={styles.container}>
  <Text>This will always be visible</Text>
</ScreenSafeArea>
```

### 2. Keyboard Covers Content

**Problem**: Keyboard covers input fields or buttons.

**Solution**: Use keyboard-aware wrappers.

```tsx
// Before (problematic)
<View style={styles.container}>
  <TextInput />
  <Button title="Submit" />
</View>

// After (fixed)
<KeyboardAwareWrapper style={styles.container}>
  <TextInput />
  <Button title="Submit" />
</KeyboardAwareWrapper>
```

### 3. Inconsistent Spacing

**Problem**: Spacing looks different on different devices.

**Solution**: Use safe area measurements for consistent spacing.

```tsx
// Before (inconsistent)
<View style={{ paddingTop: 20 }}>

// After (consistent)
<View style={{ paddingTop: safeArea.top + 20 }}>
```

## Testing

### 1. Test on Multiple Devices

- iPhone with notch (iPhone X, 11, 12, 13, 14, 15)
- iPhone without notch (iPhone 8, SE)
- Android devices with various screen sizes
- Tablets (iPad, Android tablets)

### 2. Test Different Orientations

- Portrait mode
- Landscape mode
- Orientation changes during use

### 3. Test Keyboard Scenarios

- Text input with keyboard
- Keyboard appearing/disappearing
- Different keyboard types (QWERTY, numeric, etc.)

## Performance Considerations

### 1. Minimize Re-renders

```tsx
// ✅ Good - Memoize safe area calculations
const safeArea = useMemo(() => useSafeArea(), []);

// ❌ Bad - Recalculate on every render
const safeArea = useSafeArea();
```

### 2. Use Appropriate Components

```tsx
// ✅ Good - Use specialized components
<CommunicationSafeArea> {/* Optimized for communication screens */}

// ❌ Bad - Use generic components everywhere
<SafeAreaWrapper edges={['top', 'bottom', 'left', 'right']}> {/* Less optimized */}
```

## Conclusion

The comprehensive safe area handling system ensures that the Ausmo AAC app displays correctly on all devices, providing a consistent and accessible user experience regardless of device type or screen configuration.

For questions or issues with screen layout, refer to this guide or contact the development team.
