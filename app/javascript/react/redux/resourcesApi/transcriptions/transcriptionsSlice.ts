import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ITranscriptionsResponse, ITranscriptionDetailsResponse } from './types';
import { toCamelCase } from '../../utils';

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
  }),
});

// Export auto-generated hooks for the endpoints
export const { useGetTranscriptionQuery, useGetTranscriptionsQuery } = transcriptionsSlice;
