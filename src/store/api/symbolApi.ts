// Symbol API Slice using RTK Query

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Declare FormData for React Native compatibility
declare global {
  interface FormData {
    append(name: string, value: string | Blob, fileName?: string): void;
  }
}
import { Symbol, ApiResponse, PaginatedResponse } from '../../types';

export const symbolApi = createApi({
  reducerPath: 'symbolApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/symbols',
    prepareHeaders: headers => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Symbol'],
  endpoints: builder => ({
    // Symbols
    getSymbols: builder.query<
      PaginatedResponse<Symbol>,
      {
        category?: string;
        search?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: ({ category, search, page = 1, limit = 50 }) => {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (search) params.append('search', search);
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        return `?${params.toString()}`;
      },
      providesTags: ['Symbol'],
    }),
    getSymbol: builder.query<Symbol, string>({
      query: symbolId => symbolId,
      providesTags: (result, error, symbolId) => [
        { type: 'Symbol', id: symbolId },
      ],
    }),
    getSymbolsByCategory: builder.query<Symbol[], string>({
      query: category => `category/${category}`,
      providesTags: ['Symbol'],
    }),
    searchSymbols: builder.query<Symbol[], string>({
      query: searchTerm => `search?q=${encodeURIComponent(searchTerm)}`,
      providesTags: ['Symbol'],
    }),

    // Custom Symbols
    createCustomSymbol: builder.mutation<Symbol, Partial<Symbol>>({
      query: symbol => ({
        url: 'custom',
        method: 'POST',
        body: symbol,
      }),
      invalidatesTags: ['Symbol'],
    }),
    updateCustomSymbol: builder.mutation<Symbol, Symbol>({
      query: symbol => ({
        url: `custom/${symbol.id}`,
        method: 'PUT',
        body: symbol,
      }),
      invalidatesTags: (result, error, symbol) => [
        { type: 'Symbol', id: symbol.id },
      ],
    }),
    deleteCustomSymbol: builder.mutation<void, string>({
      query: symbolId => ({
        url: `custom/${symbolId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Symbol'],
    }),

    // Symbol Categories
    getCategories: builder.query<string[], void>({
      query: () => 'categories',
      providesTags: ['Symbol'],
    }),

    // Symbol Upload
    uploadSymbolImage: builder.mutation<string, FormData>({
      query: formData => ({
        url: 'upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Symbol'],
    }),

    // Symbol Usage
    getSymbolUsage: builder.query<
      Array<{ symbolId: string; usageCount: number; lastUsed: string }>,
      string
    >({
      query: userId => `${userId}/usage`,
      providesTags: ['Symbol'],
    }),
    updateSymbolUsage: builder.mutation<
      void,
      { symbolId: string; userId: string }
    >({
      query: ({ symbolId, userId }) => ({
        url: `${userId}/usage/${symbolId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Symbol'],
    }),

    // Symbol Favorites
    getFavoriteSymbols: builder.query<Symbol[], string>({
      query: userId => `${userId}/favorites`,
      providesTags: ['Symbol'],
    }),
    addFavoriteSymbol: builder.mutation<
      void,
      { symbolId: string; userId: string }
    >({
      query: ({ symbolId, userId }) => ({
        url: `${userId}/favorites/${symbolId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Symbol'],
    }),
    removeFavoriteSymbol: builder.mutation<
      void,
      { symbolId: string; userId: string }
    >({
      query: ({ symbolId, userId }) => ({
        url: `${userId}/favorites/${symbolId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Symbol'],
    }),

    // Symbol Import/Export
    exportSymbols: builder.mutation<
      Blob,
      { userId: string; category?: string }
    >({
      query: ({ userId, category }) => ({
        url: `${userId}/export`,
        method: 'GET',
        params: category ? { category } : {},
        responseHandler: response => response.blob(),
      }),
    }),
    importSymbols: builder.mutation<
      Symbol[],
      { userId: string; symbols: Partial<Symbol>[] }
    >({
      query: ({ userId, symbols }) => ({
        url: `${userId}/import`,
        method: 'POST',
        body: { symbols },
      }),
      invalidatesTags: ['Symbol'],
    }),

    // Symbol Suggestions
    getSymbolSuggestions: builder.query<
      Symbol[],
      { userId: string; context?: string }
    >({
      query: ({ userId, context }) => {
        const params = new URLSearchParams();
        if (context) params.append('context', context);
        return `${userId}/suggestions?${params.toString()}`;
      },
      providesTags: ['Symbol'],
    }),

    // Symbol Validation
    validateSymbol: builder.mutation<
      { valid: boolean; suggestions?: string[] },
      { name: string; category: string }
    >({
      query: ({ name, category }) => ({
        url: 'validate',
        method: 'POST',
        body: { name, category },
      }),
    }),
  }),
});

export const {
  useGetSymbolsQuery,
  useGetSymbolQuery,
  useGetSymbolsByCategoryQuery,
  useSearchSymbolsQuery,
  useCreateCustomSymbolMutation,
  useUpdateCustomSymbolMutation,
  useDeleteCustomSymbolMutation,
  useGetCategoriesQuery,
  useUploadSymbolImageMutation,
  useGetSymbolUsageQuery,
  useUpdateSymbolUsageMutation,
  useGetFavoriteSymbolsQuery,
  useAddFavoriteSymbolMutation,
  useRemoveFavoriteSymbolMutation,
  useExportSymbolsMutation,
  useImportSymbolsMutation,
  useGetSymbolSuggestionsQuery,
  useValidateSymbolMutation,
} = symbolApi;
