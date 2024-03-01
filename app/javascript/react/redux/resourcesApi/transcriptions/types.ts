export interface ITranscription {
  id: number;
  audioFilename: string | null;
  createdAtFormatted: string;
  status: string;
  duration: string;
}

export interface ITranscriptionsResponse {
  page: number;
  total_pages: number;
  total_count: number;
  transcriptions: ITranscription[];
}

export interface ITranscriptionSegment {
  id: number;
  timestamp: string;
  text: string;
  start: number;
  end: number;
}

export interface ITranscriptionDetails extends ITranscription {
  transcriptionSegments: ITranscriptionSegment[]; // Clearer and corrected spelling
  audioTranscriptionPath: string; // CamelCase for consistency
}

export interface ITranscriptionDetailsResponse {
  transcriptions: ITranscriptionDetails[];
}

export interface ITranscriptionCreateSuccess {
  transcriptionId: number;
}

export interface ITranscriptionCreateError {
  error: boolean;
  errorMessage: string;
}

export type CreateTranscriptionResponse = ITranscriptionCreateSuccess | ITranscriptionCreateError;

export type IsError = (
  response: CreateTranscriptionResponse
) => response is ITranscriptionCreateError;

export const isError: IsError = (response): response is ITranscriptionCreateError => {
  return (response as ITranscriptionCreateError).errorMessage !== undefined;
};
