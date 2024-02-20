export interface ITranscription {
  id: number;
  audioFilename: string | null; // CamelCase for consistency
  createdAtFormatted: string; // CamelCase for consistency
}

export interface ITranscriptionsResponse {
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