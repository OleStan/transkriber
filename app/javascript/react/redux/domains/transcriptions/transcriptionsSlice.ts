import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { TranscriptionsResponse } from './types';
// Define a base API slice
export const transcriptionsSlice = createApi({
  reducerPath: 'api', // Unique key for the reducer
  baseQuery: fetchBaseQuery({ baseUrl: '/ajax/' }), // Set the base URL for the API
  endpoints: (builder) => ({
    getTranscriptions: builder.query<TranscriptionsResponse, void>({
      query: () => 'transcriptions',
    }),
  }),
});

// Export auto-generated hooks for the endpoints
export const { useGetTranscriptionsQuery } = transcriptionsSlice;