// Redux Store Configuration for Ausmo AAC App

import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import API slices
import { communicationApi } from './api/communicationApi';
import { userApi } from './api/userApi';
import { audioApi } from './api/audioApi';
import { symbolApi } from './api/symbolApi';

// Import feature slices
import userSlice from './slices/userSlice';
import navigationSlice from './slices/navigationSlice';
import scanSlice from './slices/scanSlice';
import audioSlice from './slices/audioSlice';
import uiSlice from './slices/uiSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['user', 'navigation', 'ui'], // Only persist these slices
  blacklist: ['scan', 'audio'], // Don't persist these slices
};

// Root reducer
const rootReducer = combineReducers({
  // API slices
  [communicationApi.reducerPath]: communicationApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [audioApi.reducerPath]: audioApi.reducer,
  [symbolApi.reducerPath]: symbolApi.reducer,

  // Feature slices
  user: userSlice,
  navigation: navigationSlice,
  scan: scanSlice,
  audio: audioSlice,
  ui: uiSlice,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'navigation/navigateToPage',
          'user/setCurrentUser',
        ],
        ignoredPaths: [
          'navigation.history',
          'payload.createdAt',
          'payload.updatedAt',
          'user.currentUser.createdAt',
          'user.currentUser.updatedAt',
          'user.users.*.createdAt',
          'user.users.*.updatedAt',
        ],
      },
    })
      .concat(communicationApi.middleware)
      .concat(userApi.middleware)
      .concat(audioApi.middleware)
      .concat(symbolApi.middleware),
  devTools: __DEV__,
});

// Setup listeners for RTK Query
setupListeners(store.dispatch);

// Persistor
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Selectors
export const selectUser = (state: RootState) => state.user;
export const selectNavigation = (state: RootState) => state.navigation;
export const selectScan = (state: RootState) => state.scan;
export const selectAudio = (state: RootState) => state.audio;
export const selectUI = (state: RootState) => state.ui;
