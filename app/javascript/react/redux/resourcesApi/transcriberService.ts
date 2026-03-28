import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export const transcriberApi = createApi({
  reducerPath: 'transcriberApi',
  baseQuery: baseQuery,
  tagTypes: ['Transcription', 'Plan', 'Usage'],
  // keepUnusedDataFor: Number(process.env.DEFAULT_REDUX_CACHE_TIME || '10'),
  endpoints: () => ({}),
});
