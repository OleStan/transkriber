import { toCamelCase } from '../../utils';
import { transcriberApi } from '../transcriberService';
import {
  TranscriptionDetailsResponse,
  TranscriptionsResponse,
  TranscriptionCreateSuccess,
} from './types';

export const transcriptionsSlice = transcriberApi.injectEndpoints({
  endpoints: (builder) => ({
    getTranscription: builder.query<TranscriptionDetailsResponse, number>({
      query: (id: number) => `transcriptions/${id}`,
      transformResponse: (response: TranscriptionDetailsResponse) => toCamelCase(response),
    }),
    getTranscriptions: builder.query<TranscriptionsResponse, number | null>({
      query: (page: number | null) => `transcriptions${page ? `?page=${page}` : ''}`,
      transformResponse: (response: TranscriptionsResponse) => toCamelCase(response),
      providesTags: (result) =>
        result?.transcriptions
          ? [
              ...result.transcriptions.map((t) => ({ type: 'Transcription' as const, id: t.id })),
              { type: 'Transcription' as const, id: 'LIST' },
            ]
          : [{ type: 'Transcription' as const, id: 'LIST' }],
    }),
    createTranscription: builder.mutation<TranscriptionCreateSuccess, FormData>({
      query: (formData) => {
        return {
          url: 'transcriptions',
          method: 'POST',
          body: formData,
        };
      },
      transformResponse: (response: TranscriptionCreateSuccess) => toCamelCase(response),
      invalidatesTags: (result) =>
        result
          ? [
              { type: 'Transcription' as const, id: result.transcriptionId },
              { type: 'Transcription' as const, id: 'LIST' },
            ]
          : [{ type: 'Transcription' as const, id: 'LIST' }],
    }),
    deleteTranscription: builder.mutation<TranscriptionsResponse, number>({
      query: (id) => {
        return {
          url: `transcriptions/${id}`,
          method: 'DELETE',
        };
      },
      transformResponse: (response: TranscriptionsResponse) => toCamelCase(response),
      invalidatesTags: (result, error, id) => [
        { type: 'Transcription' as const, id },
        { type: 'Transcription' as const, id: 'LIST' },
      ],
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
