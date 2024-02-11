export interface Transcription {
  id: number;
  audioFilename: string | null;
  createdAtFormatted: string;
  audioTranscriptionPath: string;
}

export interface TranscriptionsResponse {
  transcriptions: Transcription[];
}