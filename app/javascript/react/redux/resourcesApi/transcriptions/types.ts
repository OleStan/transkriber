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
  transcriptionSegments: ITranscriptionSegment[];
  audioTranscriptionPath: string;
}

export interface ITranscriptionDetailsResponse {
  transcriptions: ITranscriptionDetails[];
}

export interface ITranscriptionCreateSuccess {
  transcriptionId: number;
}

export interface ITranscriptionMutationError {
  error: boolean;
  errorMessage: string;
}

export type CreateTranscriptionResponse = ITranscriptionCreateSuccess | ITranscriptionMutationError;

export type DeleteTranscriptionResponse = ITranscriptionsResponse | ITranscriptionMutationError;

export type IsError = (
  response: CreateTranscriptionResponse
) => response is ITranscriptionMutationError;

export const isError: IsError = (response): response is ITranscriptionMutationError => {
  return (response as ITranscriptionMutationError).errorMessage !== undefined;
};
