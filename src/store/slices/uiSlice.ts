// UI Slice for UI State Management

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  isLoading: boolean;
  error: string | null;
  theme: 'light' | 'dark' | 'high-contrast';
  orientation: 'portrait' | 'landscape';
  keyboardVisible: boolean;
  modalVisible: boolean;
  modalType: string | null;
  toastMessage: string | null;
  toastType: 'success' | 'error' | 'warning' | 'info';
  tutorialStep: number;
  tutorialCompleted: boolean;
}

const initialState: UIState = {
  isLoading: false,
  error: null,
  theme: 'light',
  orientation: 'portrait',
  keyboardVisible: false,
  modalVisible: false,
  modalType: null,
  toastMessage: null,
  toastType: 'info',
  tutorialStep: 0,
  tutorialCompleted: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'high-contrast'>) => {
      state.theme = action.payload;
    },
    setOrientation: (state, action: PayloadAction<'portrait' | 'landscape'>) => {
      state.orientation = action.payload;
    },
    setKeyboardVisible: (state, action: PayloadAction<boolean>) => {
      state.keyboardVisible = action.payload;
    },
    showModal: (state, action: PayloadAction<string>) => {
      state.modalVisible = true;
      state.modalType = action.payload;
    },
    hideModal: (state) => {
      state.modalVisible = false;
      state.modalType = null;
    },
    showToast: (state, action: PayloadAction<{ message: string; type?: 'success' | 'error' | 'warning' | 'info' }>) => {
      state.toastMessage = action.payload.message;
      state.toastType = action.payload.type || 'info';
    },
    hideToast: (state) => {
      state.toastMessage = null;
    },
    setTutorialStep: (state, action: PayloadAction<number>) => {
      state.tutorialStep = action.payload;
    },
    completeTutorial: (state) => {
      state.tutorialCompleted = true;
      state.tutorialStep = 0;
    },
    resetTutorial: (state) => {
      state.tutorialCompleted = false;
      state.tutorialStep = 0;
    },
    resetUIState: () => initialState,
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setTheme,
  setOrientation,
  setKeyboardVisible,
  showModal,
  hideModal,
  showToast,
  hideToast,
  setTutorialStep,
  completeTutorial,
  resetTutorial,
  resetUIState,
} = uiSlice.actions;

export default uiSlice.reducer;
