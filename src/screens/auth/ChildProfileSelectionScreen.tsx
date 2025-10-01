// Child Profile Selection Screen
// Allows parents to switch between their child profiles

import React, { useState, useEffect } from 'react';
import { getThemeColors } from '../../utils/themeUtils';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import { RootState } from '../../store';
import { setCurrentUser } from '../../store/slices/userSlice';
import { SupabaseDatabaseService } from '../../services/supabaseDatabaseService';

export default function ChildProfileSelectionScreen() {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const users = useSelector((state: RootState) => state.user.users);
  const [childProfiles, setChildProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChildProfiles();
  }, []);

  const loadChildProfiles = async () => {
    try {
      setIsLoading(true);
      // Get all child profiles from the database
      const allUsers =
        await SupabaseDatabaseService.getInstance().getAllUsers();
      const children = allUsers.filter(user => user.role === 'child');
      setChildProfiles(children);
    } catch (error) {
      console.error('Error loading child profiles:', error);
      Alert.alert('Error', 'Failed to load child profiles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChild = (child: any) => {
    Alert.alert(
      'Switch to Child Profile',
      `Switch to ${child.name}'s profile?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch',
          onPress: () => {
            dispatch(setCurrentUser(child));
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleCreateNewChild = () => {
    navigation.navigate('CreateChildProfile' as never);
  };

  const renderChildItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.childItem}
      onPress={() => handleSelectChild(item)}
      accessible={true}
      accessibilityLabel={`Select ${item.name}'s profile`}
      accessibilityRole="button"
    >
      <View style={styles.childInfo}>
        <View style={styles.childAvatar}>
          <Ionicons name="person" size={24} color={themeColors.primary} />
        </View>
        <View style={styles.childDetails}>
          <Text style={styles.childName}>{item.name}</Text>
          <Text style={styles.childRole}>Child Profile</Text>
        </View>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={themeColors.textSecondary}
      />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="person-add"
        size={64}
        color={themeColors.textSecondary}
      />
      <Text style={styles.emptyTitle}>No Child Profiles</Text>
      <Text style={styles.emptyDescription}>
        Create your first child profile to get started
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreateNewChild}
        accessible={true}
        accessibilityLabel="Create child profile"
        accessibilityRole="button"
      >
        <Ionicons name="add" size={20} color={themeColors.surface} />
        <Text style={styles.createButtonText}>Create Child Profile</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Select Child Profile</Text>
          <Text style={styles.subtitle}>
            Choose which child's profile to use
          </Text>
        </View>

        {/* Child Profiles List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading child profiles...</Text>
          </View>
        ) : (
          <FlatList
            data={childProfiles}
            renderItem={renderChildItem}
            keyExtractor={item => item.id}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        )}

        {/* Create New Child Button */}
        {childProfiles.length > 0 && (
          <TouchableOpacity
            style={styles.createNewButton}
            onPress={handleCreateNewChild}
            accessible={true}
            accessibilityLabel="Create another child profile"
            accessibilityRole="button"
          >
            <Ionicons name="add" size={20} color={themeColors.primary} />
            <Text style={styles.createNewButtonText}>
              Create Another Child Profile
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.LG,
  },
  header: {
    alignItems: 'center',
    paddingVertical: SPACING.XL,
  },
  title: {
    ...TYPOGRAPHY.HEADING_LARGE,
    color: themeColors.text_PRIMARY,
    textAlign: 'center',
    marginBottom: SPACING.SM,
  },
  subtitle: {
    ...TYPOGRAPHY.BODY_MEDIUM,
    color: themeColors.textSecondary,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.XL,
  },
  loadingText: {
    ...TYPOGRAPHY.BODY_MEDIUM,
    color: themeColors.textSecondary,
  },
  childItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: themeColors.surface,
    padding: SPACING.MD,
    marginBottom: SPACING.SM,
    borderRadius: BORDER_RADIUS.MEDIUM,
    shadowColor: themeColors.text_PRIMARY,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  childAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: themeColors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.MD,
  },
  childDetails: {
    flex: 1,
  },
  childName: {
    ...TYPOGRAPHY.BODY_LARGE,
    color: themeColors.text_PRIMARY,
    fontWeight: '600',
    marginBottom: SPACING.XS,
  },
  childRole: {
    ...TYPOGRAPHY.BODY_SMALL,
    color: themeColors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.XL,
    paddingHorizontal: SPACING.LG,
  },
  emptyTitle: {
    ...TYPOGRAPHY.HEADING_MEDIUM,
    color: themeColors.text_PRIMARY,
    marginTop: SPACING.MD,
    marginBottom: SPACING.SM,
  },
  emptyDescription: {
    ...TYPOGRAPHY.BODY_MEDIUM,
    color: themeColors.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.XL,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.primary,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    borderRadius: BORDER_RADIUS.MEDIUM,
  },
  createButtonText: {
    ...TYPOGRAPHY.BODY_LARGE,
    color: themeColors.surface,
    fontWeight: '600',
    marginLeft: SPACING.SM,
  },
  createNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColors.surface,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    marginTop: SPACING.LG,
    marginBottom: SPACING.XL,
    borderRadius: BORDER_RADIUS.MEDIUM,
    borderWidth: 1,
    borderColor: themeColors.primary,
  },
  createNewButtonText: {
    ...TYPOGRAPHY.BODY_MEDIUM,
    color: themeColors.primary,
    fontWeight: '600',
    marginLeft: SPACING.SM,
  },
});
