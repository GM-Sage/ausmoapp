// Audio API Slice using RTK Query

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Message, ApiResponse } from '../../types';

export const audioApi = createApi({
  reducerPath: 'audioApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/audio',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Audio', 'Message'],
  endpoints: (builder) => ({
    // Audio Recording
    uploadAudio: builder.mutation<string, FormData>({
      query: (formData) => ({
        url: 'upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Audio'],
    }),
    
    // Audio Playback
    getAudioUrl: builder.query<string, string>({
      query: (audioId) => `play/${audioId}`,
      providesTags: (result, error, audioId) => [{ type: 'Audio', id: audioId }],
    }),
    
    // Text-to-Speech
    generateTTS: builder.mutation<string, { text: string; voice?: string; speed?: number; pitch?: number }>({
      query: ({ text, voice, speed, pitch }) => ({
        url: 'tts',
        method: 'POST',
        body: { text, voice, speed, pitch },
      }),
      invalidatesTags: ['Audio'],
    }),
    
    // Audio Processing
    processAudio: builder.mutation<string, { audioId: string; operation: 'noise-reduction' | 'normalize' | 'compress' }>({
      query: ({ audioId, operation }) => ({
        url: `process/${audioId}`,
        method: 'POST',
        body: { operation },
      }),
      invalidatesTags: (result, error, { audioId }) => [{ type: 'Audio', id: audioId }],
    }),
    
    // Audio Messages
    createAudioMessage: builder.mutation<Message, { text: string; audioFile?: string; userId: string }>({
      query: (message) => ({
        url: 'messages',
        method: 'POST',
        body: message,
      }),
      invalidatesTags: ['Message'],
    }),
    
    // Voice Settings
    getAvailableVoices: builder.query<Array<{ id: string; name: string; language: string; gender: string }>, void>({
      query: () => 'voices',
      providesTags: ['Audio'],
    }),
    
    // Audio Analytics
    getAudioUsage: builder.query<Array<{ messageId: string; playCount: number; lastPlayed: string }>, string>({
      query: (userId) => `${userId}/usage`,
      providesTags: ['Audio'],
    }),
    
    // Background Music
    getBackgroundMusic: builder.query<Array<{ id: string; name: string; url: string; duration: number }>, void>({
      query: () => 'background-music',
      providesTags: ['Audio'],
    }),
    
    // Audio Compression
    compressAudio: builder.mutation<string, { audioId: string; quality: 'low' | 'medium' | 'high' }>({
      query: ({ audioId, quality }) => ({
        url: `compress/${audioId}`,
        method: 'POST',
        body: { quality },
      }),
      invalidatesTags: (result, error, { audioId }) => [{ type: 'Audio', id: audioId }],
    }),
    
    // Audio Format Conversion
    convertAudioFormat: builder.mutation<string, { audioId: string; format: 'mp3' | 'wav' | 'aac' | 'm4a' }>({
      query: ({ audioId, format }) => ({
        url: `convert/${audioId}`,
        method: 'POST',
        body: { format },
      }),
      invalidatesTags: (result, error, { audioId }) => [{ type: 'Audio', id: audioId }],
    }),
    
    // Delete Audio
    deleteAudio: builder.mutation<void, string>({
      query: (audioId) => ({
        url: audioId,
        method: 'DELETE',
      }),
      invalidatesTags: ['Audio'],
    }),
  }),
});

export const {
  useUploadAudioMutation,
  useGetAudioUrlQuery,
  useGenerateTTSMutation,
  useProcessAudioMutation,
  useCreateAudioMessageMutation,
  useGetAvailableVoicesQuery,
  useGetAudioUsageQuery,
  useGetBackgroundMusicQuery,
  useCompressAudioMutation,
  useConvertAudioFormatMutation,
  useDeleteAudioMutation,
} = audioApi;
