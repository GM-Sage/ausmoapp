// Communication API Slice using RTK Query

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Declare FormData for React Native compatibility
declare global {
  interface FormData {
    append(name: string, value: string | Blob, fileName?: string): void;
  }
}
import {
  CommunicationBook,
  CommunicationPage,
  CommunicationButton,
  Message,
  ApiResponse,
  PaginatedResponse,
} from '../../types';

export const communicationApi = createApi({
  reducerPath: 'communicationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/communication',
    prepareHeaders: headers => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Book', 'Page', 'Button', 'Message'],
  endpoints: builder => ({
    // Books
    getBooks: builder.query<CommunicationBook[], string>({
      query: userId => `books?userId=${userId}`,
      providesTags: ['Book'],
    }),
    getBook: builder.query<CommunicationBook, string>({
      query: bookId => `books/${bookId}`,
      providesTags: (result, error, bookId) => [{ type: 'Book', id: bookId }],
    }),
    createBook: builder.mutation<CommunicationBook, Partial<CommunicationBook>>(
      {
        query: book => ({
          url: 'books',
          method: 'POST',
          body: book,
        }),
        invalidatesTags: ['Book'],
      }
    ),
    updateBook: builder.mutation<CommunicationBook, CommunicationBook>({
      query: book => ({
        url: `books/${book.id}`,
        method: 'PUT',
        body: book,
      }),
      invalidatesTags: (result, error, book) => [{ type: 'Book', id: book.id }],
    }),
    deleteBook: builder.mutation<void, string>({
      query: bookId => ({
        url: `books/${bookId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Book'],
    }),

    // Pages
    getPages: builder.query<CommunicationPage[], string>({
      query: bookId => `books/${bookId}/pages`,
      providesTags: (result, error, bookId) => [
        { type: 'Page', id: 'LIST' },
        ...(result?.map(({ id }) => ({ type: 'Page' as const, id })) || []),
      ],
    }),
    getPage: builder.query<CommunicationPage, string>({
      query: pageId => `pages/${pageId}`,
      providesTags: (result, error, pageId) => [{ type: 'Page', id: pageId }],
    }),
    createPage: builder.mutation<CommunicationPage, Partial<CommunicationPage>>(
      {
        query: page => ({
          url: 'pages',
          method: 'POST',
          body: page,
        }),
        invalidatesTags: ['Page'],
      }
    ),
    updatePage: builder.mutation<CommunicationPage, CommunicationPage>({
      query: page => ({
        url: `pages/${page.id}`,
        method: 'PUT',
        body: page,
      }),
      invalidatesTags: (result, error, page) => [{ type: 'Page', id: page.id }],
    }),
    deletePage: builder.mutation<void, string>({
      query: pageId => ({
        url: `pages/${pageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Page'],
    }),

    // Buttons
    getButtons: builder.query<CommunicationButton[], string>({
      query: pageId => `pages/${pageId}/buttons`,
      providesTags: (result, error, pageId) => [
        { type: 'Button', id: 'LIST' },
        ...(result?.map(({ id }) => ({ type: 'Button' as const, id })) || []),
      ],
    }),
    createButton: builder.mutation<
      CommunicationButton,
      Partial<CommunicationButton>
    >({
      query: button => ({
        url: 'buttons',
        method: 'POST',
        body: button,
      }),
      invalidatesTags: ['Button'],
    }),
    updateButton: builder.mutation<CommunicationButton, CommunicationButton>({
      query: button => ({
        url: `buttons/${button.id}`,
        method: 'PUT',
        body: button,
      }),
      invalidatesTags: (result, error, button) => [
        { type: 'Button', id: button.id },
      ],
    }),
    deleteButton: builder.mutation<void, string>({
      query: buttonId => ({
        url: `buttons/${buttonId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Button'],
    }),

    // Messages
    getMessages: builder.query<
      PaginatedResponse<Message>,
      { userId: string; page?: number; limit?: number }
    >({
      query: ({ userId, page = 1, limit = 50 }) =>
        `messages?userId=${userId}&page=${page}&limit=${limit}`,
      providesTags: ['Message'],
    }),
    createMessage: builder.mutation<Message, Partial<Message>>({
      query: message => ({
        url: 'messages',
        method: 'POST',
        body: message,
      }),
      invalidatesTags: ['Message'],
    }),
    updateMessage: builder.mutation<Message, Message>({
      query: message => ({
        url: `messages/${message.id}`,
        method: 'PUT',
        body: message,
      }),
      invalidatesTags: (result, error, message) => [
        { type: 'Message', id: message.id },
      ],
    }),
    deleteMessage: builder.mutation<void, string>({
      query: messageId => ({
        url: `messages/${messageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Message'],
    }),

    // Templates
    getTemplates: builder.query<CommunicationBook[], void>({
      query: () => 'templates',
      providesTags: ['Book'],
    }),

    // Import/Export
    exportBook: builder.mutation<Blob, string>({
      query: bookId => ({
        url: `books/${bookId}/export`,
        method: 'GET',
        responseHandler: response => response.blob(),
      }),
    }),
    importBook: builder.mutation<CommunicationBook, FormData>({
      query: formData => ({
        url: 'books/import',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Book'],
    }),
  }),
});

export const {
  useGetBooksQuery,
  useGetBookQuery,
  useCreateBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
  useGetPagesQuery,
  useGetPageQuery,
  useCreatePageMutation,
  useUpdatePageMutation,
  useDeletePageMutation,
  useGetButtonsQuery,
  useCreateButtonMutation,
  useUpdateButtonMutation,
  useDeleteButtonMutation,
  useGetMessagesQuery,
  useCreateMessageMutation,
  useUpdateMessageMutation,
  useDeleteMessageMutation,
  useGetTemplatesQuery,
  useExportBookMutation,
  useImportBookMutation,
} = communicationApi;
