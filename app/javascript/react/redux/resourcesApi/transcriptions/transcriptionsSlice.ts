import ReactOnRails from 'react-on-rails';

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { toCamelCase } from '../../utils';
import { getCsrfTokenHeader } from '../../shared/headers';
import {
  ITranscriptionDetailsResponse,
  ITranscriptionsResponse,
  CreateTranscriptionResponse,
} from './types';
const token = ReactOnRails.authenticityToken();

export const transcriptionsSlice = createApi({
  reducerPath: 'transcriptionsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000/ajax/', // ToDo: to update with actual API URL
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
        // headers: getCsrfTokenHeader(), // TODO: to update with actual headers
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
  }),
});

// Export auto-generated hooks for the endpoints
export const {
  useGetTranscriptionQuery,
  useGetTranscriptionsQuery,
  useCreateTranscriptionMutation,
} = transcriptionsSlice;
