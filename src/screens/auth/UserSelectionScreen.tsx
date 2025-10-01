// User Selection Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import { User } from '../../types';
import {
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  RESPONSIVE,
} from '../../constants';
import {
  setCurrentUser,
  setUsers,
  serializeUser,
  addUser,
} from '../../store/slices/userSlice';
import StandardButton from '../../components/common/StandardButton';
import { SupabaseDatabaseService } from '../../services/supabaseDatabaseService';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { getThemeColors } from '../../utils/themeUtils';

export default function UserSelectionScreen() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const users = useSelector((state: RootState) => state.user.users);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const allUsers =
        await SupabaseDatabaseService.getInstance().getAllUsers();
      dispatch(setUsers(allUsers.map(serializeUser)));
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelect = (user: User) => {
    dispatch(setCurrentUser(user));
    // Navigation will be handled by AppNavigator based on currentUser state
  };

  const handleCreateDemoTherapist = async () => {
    try {
      const demoTherapist: User = {
        id: 'demo-therapist-' + Date.now(),
        name: 'Dr. Sarah Johnson',
        email: 'sarah@therapy.com',
        role: 'therapist',
        settings: {
          voiceSettings: {
            ttsVoice: 'default',
            ttsSpeed: 1.0,
            ttsPitch: 1.0,
            volume: 0.8,
            autoRepeat: false,
            repeatDelay: 2000,
          },
          visualSettings: {
            highContrast: false,
            largeText: false,
            buttonSize: 'medium',
            gridSpacing: 8,
            backgroundColor: themeColors.background,
            textColor: themeColors.text,
            borderColor: themeColors.border,
            theme: 'system', // Default to system theme
            calmMode: false,
            reduceMotion: false,
            sensoryFriendly: false,
          },
          accessibilitySettings: {
            switchScanning: false,
            scanSpeed: 1000,
            scanMode: 'automatic',
            scanDirection: 'row-column',
            holdToActivate: false,
            touchSensitivity: 0.5,
            oneHandedMode: false,
            reduceMotion: false,
          },
          scanningSettings: {
            enabled: false,
            speed: 1000,
            mode: 'automatic',
            direction: 'row-column',
            visualIndicator: true,
            audioIndicator: true,
            externalSwitch: false,
          },
          audioSettings: {
            volume: 0.8,
            backgroundMusic: false,
            musicVolume: 0.5,
            audioFeedback: true,
            noiseReduction: false,
          },
          expressSettings: {
            combineTTSItems: true,
            combineAsWordFragments: false,
            rightToLeftAccumulation: false,
            playWhenAdding: false,
            scanExpressBar: false,
            expressBarLocation: 'bottom',
            disableExpressRepeat: false,
            createNewPagesAsExpress: false,
          },
          advancedSettings: {
            hideAllImages: false,
            showTouchesWhenExternalDisplay: false,
            switchamajigSupport: false,
            quizSupport: true,
            enableEightQuickButtons: false,
            tactileTalkSupport: false,
            disableInternetSearch: false,
            goToMainMenuOnNextStartup: false,
            experimentalFeatures: false,
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await SupabaseDatabaseService.getInstance().createUser(demoTherapist);
      dispatch(addUser(serializeUser(demoTherapist)));

      Alert.alert(
        'Demo Therapist Created',
        'Demo therapist "Dr. Sarah Johnson" has been created. You can now select this user to test therapist features.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error creating demo therapist:', error);
      Alert.alert('Error', 'Failed to create demo therapist');
    }
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={[
        styles.userItem,
        { backgroundColor: themeColors.surface, shadowColor: themeColors.text },
      ]}
      onPress={() => handleUserSelect(item)}
      accessible={true}
      accessibilityLabel={`Select user ${item.name}`}
      accessibilityRole="button"
    >
      <View style={styles.userAvatar}>
        {item.photo ? (
          <Image source={{ uri: item.photo }} style={styles.avatarImage} />
        ) : (
          <Ionicons name="person" size={32} color={themeColors.primary} />
        )}
      </View>
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: themeColors.text }]}>
          {item.name}
        </Text>
        <Text
          style={[styles.userDetails, { color: themeColors.textSecondary }]}
        >
          Created {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={24}
        color={themeColors.textSecondary}
      />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people" size={64} color={themeColors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: themeColors.text }]}>
        No Users Yet
      </Text>
      <Text
        style={[styles.emptyDescription, { color: themeColors.textSecondary }]}
      >
        Create your first user profile to get started with Ausmo
      </Text>
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.primary }]}>
          Select User
        </Text>
        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
          Choose a user profile to continue
        </Text>
      </View>

      {/* Users List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text
            style={[styles.loadingText, { color: themeColors.textSecondary }]}
          >
            Loading users...
          </Text>
        </View>
      ) : (
        <FlatList
          data={users as any}
          renderItem={renderUserItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Create User Options */}
      <View style={styles.createUserSection}>
        <Text style={[styles.createUserTitle, { color: themeColors.text }]}>
          Create New Profile
        </Text>

        <View style={styles.roleButtonsContainer}>
          <StandardButton
            title="Parent"
            onPress={() =>
              navigation.navigate('CreateUser' as never, { role: 'parent' })
            }
            variant="primary"
            size="medium"
            icon="people"
            iconPosition="left"
            style={styles.roleButton}
            accessibilityLabel="Create parent profile"
          />

          <StandardButton
            title="Therapist"
            onPress={() =>
              navigation.navigate('CreateUser' as never, { role: 'therapist' })
            }
            variant="secondary"
            size="medium"
            icon="medical"
            iconPosition="left"
            style={styles.roleButton}
            accessibilityLabel="Create therapist profile"
          />
        </View>

        {/* Demo Therapist Button */}
        <StandardButton
          title="Create Demo Therapist"
          onPress={handleCreateDemoTherapist}
          variant="warning"
          size="medium"
          icon="flask"
          iconPosition="left"
          style={styles.demoButton}
          accessibilityLabel="Create demo therapist for testing"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: SPACING.SM,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: SPACING.LG,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.MD,
    marginBottom: SPACING.SM,
    borderRadius: BORDER_RADIUS.MEDIUM,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.MD,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    marginBottom: 2,
  },
  userDetails: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.XL,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    marginTop: SPACING.MD,
    marginBottom: SPACING.SM,
  },
  emptyDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.LINE_HEIGHTS.NORMAL * TYPOGRAPHY.FONT_SIZES.MEDIUM,
  },
  createUserButton: {
    backgroundColor: themeColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.XL,
    marginHorizontal: SPACING.LG,
    marginBottom: SPACING.MD,
    borderRadius: BORDER_RADIUS.LARGE,
  },
  createUserText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    color: themeColors.surface,
    marginLeft: SPACING.SM,
  },
  createUserSubtext: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.surface,
    opacity: 0.8,
    marginLeft: SPACING.SM,
    marginTop: SPACING.XS,
  },
  createUserSection: {
    paddingHorizontal: SPACING.LG,
    paddingBottom: SPACING.XL,
  },
  createUserTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    textAlign: 'center',
    marginBottom: SPACING.MD,
  },
  roleButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.SM,
  },
  roleButton: {
    flex: 1,
    marginHorizontal: SPACING.XS,
  },
  demoButton: {
    marginTop: SPACING.SM,
  },
});
