import ReactOnRails from 'react-on-rails';

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { toCamelCase } from '../../utils';
import { getCsrfTokenHeader } from '../../shared/headers';
import {
  ITranscriptionDetailsResponse,
  ITranscriptionsResponse,
  // MutationResponse,
  CreateTranscriptionResponse, DeleteTranscriptionResponse,
} from './types';
const token = ReactOnRails.authenticityToken();

export const transcriptionsSlice = createApi({
  reducerPath: 'transcriptionsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000/ajax/',
  }),
  endpoints: (builder) => ({
    getTranscription: builder.query<ITranscriptionDetailsResponse, number>({
      query: (id: number) => `transcriptions/${id}`,
      transformResponse: (response: ITranscriptionDetailsResponse) => toCamelCase(response),
    }),
    getTranscriptions: builder.query<ITranscriptionsResponse, number | null>({
      query: (page: number) => `transcriptions?page=${page}`,
      transformResponse: (response: ITranscriptionsResponse) => toCamelCase(response),
    }),
    createTranscription: builder.mutation<void, FormData>({
      query: (formData) => ({
        url: 'transcriptions',
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRF-Token': token,
        },
      }),
      transformResponse: (response: CreateTranscriptionResponse) => {
        if (response.error || response.errorMessage) {
          return { errorMessage: response.errorMessage || 'An unknown error occurred' };
        }
        const camelCaseResponse = toCamelCase(response);
        return { transcriptionId: camelCaseResponse.transcriptionId };
      },
    }),
    deleteTranscription: builder.mutation<void, number>({
      query: (id) => ({
        url: `transcriptions/${id}`,
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': token,
        },
      }),
      transformResponse: (response: DeleteTranscriptionResponse) => {
        if (response.error || response.errorMessage) {
          return { errorMessage: response.errorMessage || 'An unknown error occurred' };
        }
        const camelCaseResponse = toCamelCase(response);
        return { transcriptions: camelCaseResponse.transcriptions };
      },
    }),
  }),
});

// Export auto-generated hooks for the endpoints
export const {
  useGetTranscriptionQuery,
  useGetTranscriptionsQuery,
  useCreateTranscriptionMutation,
  useDeleteTranscriptionMutation,
} = transcriptionsSlice;
