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
  ScrollView 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import { User, UserSettings } from '../../types';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, DEFAULT_SETTINGS } from '../../constants';
import { addUser, setCurrentUser } from '../../store/slices/userSlice';
import DatabaseService from '../../services/databaseService';

export default function CreateUserScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to access photos');
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

  const handleCreateUser = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    try {
      setIsLoading(true);
      
      // Generate a proper UUID for the user
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };
      
      const userSettings: UserSettings = {
        voiceSettings: DEFAULT_SETTINGS.VOICE,
        visualSettings: DEFAULT_SETTINGS.VISUAL,
        accessibilitySettings: DEFAULT_SETTINGS.ACCESSIBILITY,
        scanningSettings: {
          enabled: false,
          speed: DEFAULT_SETTINGS.ACCESSIBILITY.scanSpeed,
          mode: DEFAULT_SETTINGS.ACCESSIBILITY.scanMode,
          direction: DEFAULT_SETTINGS.ACCESSIBILITY.scanDirection,
          visualIndicator: true,
          audioIndicator: true,
          externalSwitch: false,
        },
        audioSettings: DEFAULT_SETTINGS.AUDIO,
      };

      const newUser: User = {
        id: generateUUID(),
        name: name.trim(),
        email: '', // Add empty email field
        photo: photo || undefined,
        settings: userSettings,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await DatabaseService.createUser(newUser);
      dispatch(addUser(newUser));
      dispatch(setCurrentUser(newUser));
      
      Alert.alert('Success', 'User created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error creating user:', error);
      Alert.alert('Error', 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Create New User</Text>
        <Text style={styles.subtitle}>
          Set up a new user profile for Ausmo
        </Text>
      </View>

      {/* Photo Section */}
      <View style={styles.photoSection}>
        <TouchableOpacity 
          style={styles.photoButton}
          onPress={handleSelectPhoto}
          accessible={true}
          accessibilityLabel="Select user photo"
          accessibilityRole="button"
        >
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="camera" size={32} color={COLORS.TEXT_SECONDARY} />
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.photoLabel}>Tap to add photo</Text>
      </View>

      {/* Name Input */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Name *</Text>
        <TextInput
          style={styles.textInput}
          value={name}
          onChangeText={setName}
          placeholder="Enter user name"
          placeholderTextColor={COLORS.TEXT_SECONDARY}
          accessible={true}
          accessibilityLabel="User name input"
        />
      </View>

      {/* Create Button */}
      <TouchableOpacity 
        style={[
          styles.createButton,
          (!name.trim() || isLoading) && styles.createButtonDisabled
        ]}
        onPress={handleCreateUser}
        disabled={!name.trim() || isLoading}
        accessible={true}
        accessibilityLabel="Create user"
        accessibilityRole="button"
      >
        <Text style={styles.createButtonText}>
          {isLoading ? 'Creating...' : 'Create User'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
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
    color: COLORS.PRIMARY,
    marginBottom: SPACING.SM,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
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
    backgroundColor: COLORS.SURFACE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.SM,
    shadowColor: COLORS.TEXT_PRIMARY,
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
    backgroundColor: COLORS.BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    borderStyle: 'dashed',
  },
  photoLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  inputSection: {
    paddingHorizontal: SPACING.LG,
    marginBottom: SPACING.XL,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  textInput: {
    backgroundColor: COLORS.SURFACE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: BORDER_RADIUS.MEDIUM,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.MD,
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
  },
  createButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.XL,
    marginHorizontal: SPACING.LG,
    marginBottom: SPACING.XL,
    borderRadius: BORDER_RADIUS.LARGE,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: COLORS.TEXT_DISABLED,
  },
  createButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: COLORS.SURFACE,
  },
});
