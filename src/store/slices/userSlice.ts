// User Slice for Redux Store

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, UserSettings, DEFAULT_SETTINGS } from '../../types';

interface UserState {
  currentUser: User | null;
  users: User[];
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
const serializeUser = (user: User): User => ({
  ...user,
  createdAt: user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt),
  updatedAt: user.updatedAt instanceof Date ? user.updatedAt : new Date(user.updatedAt),
});

// Helper function to convert string dates back to Date objects
const deserializeUser = (user: User): User => ({
  ...user,
  createdAt: new Date(user.createdAt),
  updatedAt: new Date(user.updatedAt),
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload ? serializeUser(action.payload) : null;
    },
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload.map(serializeUser);
    },
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(serializeUser(action.payload));
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const serializedUser = serializeUser(action.payload);
      const index = state.users.findIndex(user => user.id === serializedUser.id);
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
    updateUserSettings: (state, action: PayloadAction<Partial<UserSettings>>) => {
      if (state.currentUser) {
        state.currentUser.settings = {
          voiceSettings: state.currentUser.settings?.voiceSettings || DEFAULT_SETTINGS.voiceSettings,
          visualSettings: state.currentUser.settings?.visualSettings || DEFAULT_SETTINGS.visualSettings,
          accessibilitySettings: state.currentUser.settings?.accessibilitySettings || DEFAULT_SETTINGS.accessibilitySettings,
          scanningSettings: state.currentUser.settings?.scanningSettings || DEFAULT_SETTINGS.scanningSettings,
          audioSettings: state.currentUser.settings?.audioSettings || DEFAULT_SETTINGS.audioSettings,
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
    clearError: (state) => {
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

export default userSlice.reducer;
