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
    getTranscriptions: builder.query<TranscriptionsResponse, {
      page?: number | null;
      status?: string | null;
      q?: string | null;
      start_date?: string | null;
      end_date?: string | null;
      type?: string | null;
    }>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.status) queryParams.append('status', params.status);
        if (params.q) queryParams.append('q', params.q);
        if (params.start_date) queryParams.append('start_date', params.start_date);
        if (params.end_date) queryParams.append('end_date', params.end_date);
        if (params.type) queryParams.append('type', params.type);
        
        const queryString = queryParams.toString();
        return `transcriptions${queryString ? `?${queryString}` : ''}`;
      },
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
    updateTranscription: builder.mutation<{ id: number }, { id: number; transcription: string; transcriptionJson: any }>({
      query: ({ id, transcription, transcriptionJson }) => ({
        url: `transcriptions/${id}`,
        method: 'PATCH',
        body: {
          transcription: { transcription, transcription_json: transcriptionJson },
        },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Transcription' as const, id }],
    }),
    summarizeTranscription: builder.mutation<{ status: string }, number>({
      query: (id) => ({
        url: `transcriptions/${id}/summarize`,
        method: 'POST',
      }),
    }),
  }),
});

// Export auto-generated hooks for the endpoints
export const {
  useGetTranscriptionQuery,
  useGetTranscriptionsQuery,
  useCreateTranscriptionMutation,
  useDeleteTranscriptionMutation,
  useUpdateTranscriptionMutation,
  useSummarizeTranscriptionMutation,
} = transcriptionsSlice;
