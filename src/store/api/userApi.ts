// User API Slice using RTK Query

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { User, UserSettings, UsageAnalytics, BackupData, ApiResponse } from '../../types';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/users',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['User', 'Analytics', 'Backup'],
  endpoints: (builder) => ({
    // Users
    getUsers: builder.query<User[], void>({
      query: () => '',
      providesTags: ['User'],
    }),
    getUser: builder.query<User, string>({
      query: (userId) => userId,
      providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
    }),
    createUser: builder.mutation<User, Partial<User>>({
      query: (user) => ({
        url: '',
        method: 'POST',
        body: user,
      }),
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation<User, User>({
      query: (user) => ({
        url: user.id,
        method: 'PUT',
        body: user,
      }),
      invalidatesTags: (result, error, user) => [{ type: 'User', id: user.id }],
    }),
    deleteUser: builder.mutation<void, string>({
      query: (userId) => ({
        url: userId,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
    
    // User Settings
    getUserSettings: builder.query<UserSettings, string>({
      query: (userId) => `${userId}/settings`,
      providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
    }),
    updateUserSettings: builder.mutation<UserSettings, { userId: string; settings: Partial<UserSettings> }>({
      query: ({ userId, settings }) => ({
        url: `${userId}/settings`,
        method: 'PUT',
        body: settings,
      }),
      invalidatesTags: (result, error, { userId }) => [{ type: 'User', id: userId }],
    }),
    
    // Analytics
    getAnalytics: builder.query<UsageAnalytics[], { userId: string; startDate?: string; endDate?: string }>({
      query: ({ userId, startDate, endDate }) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return `${userId}/analytics?${params.toString()}`;
      },
      providesTags: ['Analytics'],
    }),
    createAnalyticsEntry: builder.mutation<UsageAnalytics, UsageAnalytics>({
      query: (analytics) => ({
        url: `${analytics.userId}/analytics`,
        method: 'POST',
        body: analytics,
      }),
      invalidatesTags: ['Analytics'],
    }),
    
    // Backup
    createBackup: builder.mutation<BackupData, string>({
      query: (userId) => ({
        url: `${userId}/backup`,
        method: 'POST',
      }),
      // providesTags: ['Backup'], // Commented out as it's not needed for mutations
    }),
    restoreBackup: builder.mutation<User, { userId: string; backupData: BackupData }>({
      query: ({ userId, backupData }) => ({
        url: `${userId}/restore`,
        method: 'POST',
        body: backupData,
      }),
      invalidatesTags: ['User', 'Backup'],
    }),
    
    // User Photos
    uploadUserPhoto: builder.mutation<string, { userId: string; photo: FormData }>({
      query: ({ userId, photo }) => ({
        url: `${userId}/photo`,
        method: 'POST',
        body: photo,
      }),
      invalidatesTags: (result, error, { userId }) => [{ type: 'User', id: userId }],
    }),
    deleteUserPhoto: builder.mutation<void, string>({
      query: (userId) => ({
        url: `${userId}/photo`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, userId) => [{ type: 'User', id: userId }],
    }),
    
    // User Switching
    switchUser: builder.mutation<User, string>({
      query: (userId) => ({
        url: `${userId}/switch`,
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetUserSettingsQuery,
  useUpdateUserSettingsMutation,
  useGetAnalyticsQuery,
  useCreateAnalyticsEntryMutation,
  useCreateBackupMutation,
  useRestoreBackupMutation,
  useUploadUserPhotoMutation,
  useDeleteUserPhotoMutation,
  useSwitchUserMutation,
} = userApi;
