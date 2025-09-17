// Audio Slice for Audio State Management

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AudioState } from '../../types';

const initialState: AudioState = {
  isPlaying: false,
  currentSound: undefined,
  volume: 0.8,
  isRecording: false,
  recordingDuration: 0,
};

const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    startPlaying: (state, action: PayloadAction<string>) => {
      state.isPlaying = true;
      state.currentSound = action.payload;
    },
    stopPlaying: (state) => {
      state.isPlaying = false;
      state.currentSound = undefined;
    },
    pausePlaying: (state) => {
      state.isPlaying = false;
    },
    resumePlaying: (state) => {
      state.isPlaying = true;
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = Math.max(0, Math.min(1, action.payload));
    },
    startRecording: (state) => {
      state.isRecording = true;
      state.recordingDuration = 0;
    },
    stopRecording: (state) => {
      state.isRecording = false;
    },
    pauseRecording: (state) => {
      state.isRecording = false;
    },
    resumeRecording: (state) => {
      state.isRecording = true;
    },
    updateRecordingDuration: (state, action: PayloadAction<number>) => {
      state.recordingDuration = action.payload;
    },
    resetAudioState: () => initialState,
  },
});

export const {
  startPlaying,
  stopPlaying,
  pausePlaying,
  resumePlaying,
  setVolume,
  startRecording,
  stopRecording,
  pauseRecording,
  resumeRecording,
  updateRecordingDuration,
  resetAudioState,
} = audioSlice.actions;

export default audioSlice.reducer;
