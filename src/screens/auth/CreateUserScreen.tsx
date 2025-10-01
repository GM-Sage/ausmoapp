// Create User Screen

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import { User, UserSettings, UserRole } from '../../types';
import {
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  getDefaultSettings,
} from '../../constants';
import {
  addUser,
  setCurrentUser,
  serializeUser,
} from '../../store/slices/userSlice';
import DatabaseService from '../../services/databaseService';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { getThemeColors } from '../../utils/themeUtils';

export default function CreateUserScreen({ route }: any) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const selectedRole = route?.params?.role || 'parent'; // Default to parent if no role specified

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(selectedRole);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectPhoto = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant permission to access photos'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
      Alert.alert('Error', 'Failed to select photo');
    }
  };

  const getRoleIcon = (role: UserRole): string => {
    const icons = {
      child: 'happy',
      parent: 'people',
      therapist: 'medical',
      admin: 'shield',
    };
    return icons[role];
  };

  const getRoleDisplayName = (role: UserRole): string => {
    const names = {
      child: 'Child',
      parent: 'Parent/Caregiver',
      therapist: 'Therapist',
      admin: 'Administrator',
    };
    return names[role];
  };

  const handleCreateUser = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    // Email is optional for child profiles
    if (role !== 'child' && !email.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    try {
      setIsLoading(true);

      // Generate a proper UUID for the user
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
          /[xy]/g,
          function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          }
        );
      };

      const userSettings: UserSettings = getDefaultSettings(theme);

      const newUser: User = {
        id: generateUUID(),
        name: name.trim(),
        email: role === 'child' ? '' : email.trim(), // Empty email for child profiles
        role: role,
        photo: photo || undefined,
        settings: userSettings,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await DatabaseService.createUser(newUser);

      dispatch(addUser(serializeUser(newUser)));
      dispatch(setCurrentUser(serializeUser(newUser)));

      Alert.alert('Success', 'User created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error creating user:', error);
      Alert.alert('Error', 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.text }]}>
          Create {getRoleDisplayName(role)} Profile
        </Text>
        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
          Set up a new user profile for Ausmo
        </Text>
      </View>

      {/* Photo Section */}
      <View style={styles.photoSection}>
        <TouchableOpacity
          style={[
            styles.photoButton,
            {
              backgroundColor: themeColors.surface,
              shadowColor: themeColors.text,
            },
          ]}
          onPress={handleSelectPhoto}
          accessible={true}
          accessibilityLabel="Select user photo"
          accessibilityRole="button"
        >
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photo} />
          ) : (
            <View
              style={[
                styles.photoPlaceholder,
                {
                  backgroundColor: themeColors.background,
                  borderColor: themeColors.border,
                },
              ]}
            >
              <Ionicons
                name="camera"
                size={32}
                color={themeColors.textSecondary}
              />
            </View>
          )}
        </TouchableOpacity>
        <Text style={[styles.photoLabel, { color: themeColors.textSecondary }]}>
          Tap to add photo
        </Text>
      </View>

      {/* Name Input */}
      <View style={styles.inputSection}>
        <Text style={[styles.inputLabel, { color: themeColors.text }]}>
          Name *
        </Text>
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
              color: themeColors.text,
            },
          ]}
          value={name}
          onChangeText={setName}
          placeholder="Enter user name"
          placeholderTextColor={themeColors.textSecondary}
          accessible={true}
          accessibilityLabel="User name input"
        />
      </View>

      {/* Email Input - Hidden for child profiles */}
      {role !== 'child' && (
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { color: themeColors.text }]}>
            Email *
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
                color: themeColors.text,
              },
            ]}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email address"
            placeholderTextColor={themeColors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            accessible={true}
            accessibilityLabel="Email input"
          />
        </View>
      )}

      {/* Role Display - Only show selected role */}
      <View style={styles.inputSection}>
        <Text style={[styles.inputLabel, { color: themeColors.text }]}>
          User Role
        </Text>
        <View
          style={[
            styles.roleDisplayContainer,
            {
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
            },
          ]}
        >
          <Ionicons
            name={getRoleIcon(role) as any}
            size={24}
            color={themeColors.primary}
          />
          <Text style={[styles.roleDisplayText, { color: themeColors.text }]}>
            {getRoleDisplayName(role)}
          </Text>
        </View>
      </View>

      {/* Create Button */}
      <TouchableOpacity
        style={[
          styles.createButton,
          { backgroundColor: themeColors.primary },
          (!name.trim() || !email.trim() || isLoading) && {
            backgroundColor: themeColors.textDisabled,
          },
        ]}
        onPress={handleCreateUser}
        disabled={!name.trim() || !email.trim() || isLoading}
        accessible={true}
        accessibilityLabel="Create user"
        accessibilityRole="button"
      >
        <Text style={[styles.createButtonText, { color: themeColors.surface }]}>
          {isLoading ? 'Creating...' : 'Create User'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor will be set dynamically based on theme
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
    paddingTop: 60,
    paddingBottom: SPACING.XL,
  },
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZES.TITLE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    // color will be set dynamically based on theme
    marginBottom: SPACING.SM,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    // color will be set dynamically based on theme
    textAlign: 'center',
  },
  photoSection: {
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
    marginBottom: SPACING.XL,
  },
  photoButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    // backgroundColor, shadowColor will be set dynamically based on theme
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.SM,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    // backgroundColor, borderColor will be set dynamically based on theme
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  photoLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    // color will be set dynamically based on theme
  },
  inputSection: {
    paddingHorizontal: SPACING.LG,
    marginBottom: SPACING.XL,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    // color will be set dynamically based on theme
    marginBottom: SPACING.SM,
  },
  textInput: {
    // backgroundColor, borderColor, color will be set dynamically based on theme
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.MEDIUM,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.MD,
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
  },
  createButton: {
    // backgroundColor will be set dynamically based on theme
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.XL,
    marginHorizontal: SPACING.LG,
    marginBottom: SPACING.XL,
    borderRadius: BORDER_RADIUS.LARGE,
    alignItems: 'center',
  },
  createButtonDisabled: {
    // backgroundColor will be set dynamically based on theme
  },
  createButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    // color will be set dynamically based on theme
  },
  roleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: SPACING.SM,
  },
  roleButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.SM,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 2,
    // borderColor, backgroundColor will be set dynamically based on theme
    marginBottom: SPACING.SM,
  },
  roleButtonSelected: {
    // borderColor, backgroundColor will be set dynamically based on theme
  },
  roleButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    // color will be set dynamically based on theme
    marginLeft: SPACING.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  roleButtonTextSelected: {
    // color will be set dynamically based on theme
  },
  roleDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor, borderColor will be set dynamically based on theme
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    marginTop: SPACING.SM,
  },
  roleDisplayText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    // color will be set dynamically based on theme
    marginLeft: SPACING.SM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
});
