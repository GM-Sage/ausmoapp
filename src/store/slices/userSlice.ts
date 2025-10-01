// User Slice for Redux Store

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, UserSettings } from '../../types';
import { getDefaultSettings } from '../../constants';
import { setSentryUser } from '../../config/sentry';

// Serialized user type for Redux storage (dates as strings)
interface SerializedUser extends Omit<User, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

interface UserState {
  currentUser: SerializedUser | null;
  users: SerializedUser[];
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  users: [],
  isLoading: false,
  error: null,
};

// Helper function to convert Date objects to strings for Redux serialization
const serializeUser = (user: User): SerializedUser => ({
  ...user,
  createdAt:
    typeof user.createdAt === 'string'
      ? user.createdAt
      : user.createdAt instanceof Date
        ? user.createdAt.toISOString()
        : new Date().toISOString(),
  updatedAt:
    typeof user.updatedAt === 'string'
      ? user.updatedAt
      : user.updatedAt instanceof Date
        ? user.updatedAt.toISOString()
        : new Date().toISOString(),
});

// Helper function to convert string dates back to Date objects
const deserializeUser = (user: SerializedUser): User => ({
  ...user,
  createdAt: new Date(user.createdAt),
  updatedAt: new Date(user.updatedAt),
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (
      state,
      action: PayloadAction<User | SerializedUser | null>
    ) => {
      if (action.payload === null) {
        state.currentUser = null;
        setSentryUser(null);
      } else {
        // Check if it's already serialized (has string dates) or needs serialization
        const isSerialized = typeof action.payload.createdAt === 'string';
        state.currentUser = isSerialized
          ? (action.payload as SerializedUser)
          : serializeUser(action.payload as User);

        // Update Sentry user context
        setSentryUser(deserializeUser(state.currentUser));
      }
    },
    setUsers: (state, action: PayloadAction<SerializedUser[]>) => {
      state.users = action.payload;
    },
    addUser: (state, action: PayloadAction<User | SerializedUser>) => {
      // Check if it's already serialized (has string dates) or needs serialization
      const isSerialized = typeof action.payload.createdAt === 'string';
      const serializedUser = isSerialized
        ? (action.payload as SerializedUser)
        : serializeUser(action.payload as User);
      state.users.push(serializedUser);
    },
    updateUser: (state, action: PayloadAction<User | SerializedUser>) => {
      // Check if it's already serialized (has string dates) or needs serialization
      const isSerialized = typeof action.payload.createdAt === 'string';
      const serializedUser = isSerialized
        ? (action.payload as SerializedUser)
        : serializeUser(action.payload as User);

      const index = state.users.findIndex(
        user => user.id === serializedUser.id
      );
      if (index !== -1) {
        state.users[index] = serializedUser;
      }
      if (state.currentUser?.id === serializedUser.id) {
        state.currentUser = serializedUser;
      }
    },
    deleteUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter(user => user.id !== action.payload);
      if (state.currentUser?.id === action.payload) {
        state.currentUser = null;
      }
    },
    updateUserSettings: (
      state,
      action: PayloadAction<Partial<UserSettings>>
    ) => {
      if (state.currentUser) {
        // Use system theme as default for Redux updates
        const defaultSettings = getDefaultSettings('system');
        state.currentUser.settings = {
          voiceSettings:
            state.currentUser.settings?.voiceSettings ||
            defaultSettings.voiceSettings,
          visualSettings:
            state.currentUser.settings?.visualSettings ||
            defaultSettings.visualSettings,
          accessibilitySettings:
            state.currentUser.settings?.accessibilitySettings ||
            defaultSettings.accessibilitySettings,
          scanningSettings:
            state.currentUser.settings?.scanningSettings ||
            defaultSettings.scanningSettings,
          audioSettings:
            state.currentUser.settings?.audioSettings ||
            defaultSettings.audioSettings,
          expressSettings:
            state.currentUser.settings?.expressSettings ||
            defaultSettings.expressSettings,
          advancedSettings:
            state.currentUser.settings?.advancedSettings ||
            defaultSettings.advancedSettings,
          ...action.payload,
        };
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: state => {
      state.error = null;
    },
    resetUserState: () => initialState,
  },
});

export const {
  setCurrentUser,
  setUsers,
  addUser,
  updateUser,
  deleteUser,
  updateUserSettings,
  setLoading,
  setError,
  clearError,
  resetUserState,
} = userSlice.actions;

export { serializeUser };
export type { SerializedUser };

// Helper function to convert SerializedUser back to User for services that need it
export const deserializeUserForService = (
  serializedUser: SerializedUser
): User => ({
  ...serializedUser,
  createdAt: new Date(serializedUser.createdAt),
  updatedAt: new Date(serializedUser.updatedAt),
});

export default userSlice.reducer;
