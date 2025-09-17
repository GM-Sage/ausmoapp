// Scan Slice for Switch Scanning Functionality

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ScanState } from '../../types';
import { SCANNING_SPEEDS } from '../../constants';

const initialState: ScanState = {
  isScanning: false,
  currentRow: 0,
  currentColumn: 0,
  currentItem: 0,
  scanMode: 'row-column',
  scanSpeed: SCANNING_SPEEDS.NORMAL,
  highlightedButton: undefined,
};

const scanSlice = createSlice({
  name: 'scan',
  initialState,
  reducers: {
    startScanning: (state) => {
      state.isScanning = true;
      state.currentRow = 0;
      state.currentColumn = 0;
      state.currentItem = 0;
      state.highlightedButton = undefined;
    },
    stopScanning: (state) => {
      state.isScanning = false;
      state.highlightedButton = undefined;
    },
    pauseScanning: (state) => {
      state.isScanning = false;
    },
    resumeScanning: (state) => {
      state.isScanning = true;
    },
    setScanMode: (state, action: PayloadAction<'row-column' | 'item'>) => {
      state.scanMode = action.payload;
      state.currentRow = 0;
      state.currentColumn = 0;
      state.currentItem = 0;
    },
    setScanSpeed: (state, action: PayloadAction<number>) => {
      state.scanSpeed = action.payload;
    },
    setCurrentRow: (state, action: PayloadAction<number>) => {
      state.currentRow = action.payload;
      state.currentColumn = 0;
    },
    setCurrentColumn: (state, action: PayloadAction<number>) => {
      state.currentColumn = action.payload;
    },
    setCurrentItem: (state, action: PayloadAction<number>) => {
      state.currentItem = action.payload;
    },
    setHighlightedButton: (state, action: PayloadAction<string | undefined>) => {
      state.highlightedButton = action.payload;
    },
    nextRow: (state) => {
      state.currentRow += 1;
      state.currentColumn = 0;
    },
    nextColumn: (state) => {
      state.currentColumn += 1;
    },
    nextItem: (state) => {
      state.currentItem += 1;
    },
    previousRow: (state) => {
      if (state.currentRow > 0) {
        state.currentRow -= 1;
        state.currentColumn = 0;
      }
    },
    previousColumn: (state) => {
      if (state.currentColumn > 0) {
        state.currentColumn -= 1;
      }
    },
    previousItem: (state) => {
      if (state.currentItem > 0) {
        state.currentItem -= 1;
      }
    },
    resetScanPosition: (state) => {
      state.currentRow = 0;
      state.currentColumn = 0;
      state.currentItem = 0;
      state.highlightedButton = undefined;
    },
    resetScanState: () => initialState,
  },
});

export const {
  startScanning,
  stopScanning,
  pauseScanning,
  resumeScanning,
  setScanMode,
  setScanSpeed,
  setCurrentRow,
  setCurrentColumn,
  setCurrentItem,
  setHighlightedButton,
  nextRow,
  nextColumn,
  nextItem,
  previousRow,
  previousColumn,
  previousItem,
  resetScanPosition,
  resetScanState,
} = scanSlice.actions;

export default scanSlice.reducer;
