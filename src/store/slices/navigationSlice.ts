// Navigation Slice for Redux Store

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NavigationState, NavigationHistoryItem, BreadcrumbItem } from '../../types';

const initialState: NavigationState = {
  currentBookId: undefined,
  currentPageId: undefined,
  history: [],
  breadcrumbs: [],
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    navigateToPage: (state, action: PayloadAction<{ bookId: string; pageId: string; pageName: string }>) => {
      const { bookId, pageId, pageName } = action.payload;
      
      // Add to history
      state.history.push({
        bookId,
        pageId,
        timestamp: Date.now(),
      });
      
      // Update current navigation
      state.currentBookId = bookId;
      state.currentPageId = pageId;
      
      // Update breadcrumbs
      const existingIndex = state.breadcrumbs.findIndex(
        crumb => crumb.bookId === bookId && crumb.pageId === pageId
      );
      
      if (existingIndex !== -1) {
        // Remove everything after this point
        state.breadcrumbs = state.breadcrumbs.slice(0, existingIndex + 1);
      } else {
        // Add new breadcrumb
        state.breadcrumbs.push({
          bookId,
          pageId,
          name: pageName,
        });
      }
    },
    navigateBack: (state) => {
      if (state.history.length > 1) {
        // Remove current from history
        state.history.pop();
        
        // Get previous navigation
        const previous = state.history[state.history.length - 1];
        state.currentBookId = previous.bookId;
        state.currentPageId = previous.pageId;
        
        // Update breadcrumbs
        state.breadcrumbs.pop();
      }
    },
    navigateToHome: (state) => {
      state.currentBookId = undefined;
      state.currentPageId = undefined;
      state.history = [];
      state.breadcrumbs = [];
    },
    setCurrentBook: (state, action: PayloadAction<string>) => {
      state.currentBookId = action.payload;
      state.currentPageId = undefined;
    },
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.currentPageId = action.payload;
    },
    clearHistory: (state) => {
      state.history = [];
      state.breadcrumbs = [];
    },
    updateBreadcrumbName: (state, action: PayloadAction<{ bookId: string; pageId: string; name: string }>) => {
      const { bookId, pageId, name } = action.payload;
      const index = state.breadcrumbs.findIndex(
        crumb => crumb.bookId === bookId && crumb.pageId === pageId
      );
      if (index !== -1) {
        state.breadcrumbs[index].name = name;
      }
    },
    resetNavigation: () => initialState,
  },
});

export const {
  navigateToPage,
  navigateBack,
  navigateToHome,
  setCurrentBook,
  setCurrentPage,
  clearHistory,
  updateBreadcrumbName,
  resetNavigation,
} = navigationSlice.actions;

export default navigationSlice.reducer;
