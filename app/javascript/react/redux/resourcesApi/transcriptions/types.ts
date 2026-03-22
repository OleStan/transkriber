export interface ErrorResponse {
  error: boolean;
  errorMessage: string;
}

export interface SummaryData {
  overview: string;
  keyPoints: string[];
  actionItems: string[];
}

export interface Transcription {
  id: number;
  audioFilename: string | null;
  createdAtFormatted: string;
  status: string;
  duration: string;
}

export interface Segment {
  id: number;
  text: string;
  start: number;
  end: number;
}

export interface TranscriptionSegment extends Segment {
  timestamp: string;
  timestampOfChunk: string;
  startOfChunk: number;
  segments: Segment[];
}

export interface TranscriptionDetails extends Transcription {
  transcriptionSegments: TranscriptionSegment[];
  audioTranscriptionPath: string;
  summary?: SummaryData | null;
}

export interface TranscriptionsResponse {
  page: number;
  totalPages: number;
  totalCount: number;
  transcriptions: Transcription[];
}

export interface TranscriptionDetailsResponse {
  transcriptions: TranscriptionDetails[];
}

export interface TranscriptionCreateSuccess {
  transcriptionId: number;
}
