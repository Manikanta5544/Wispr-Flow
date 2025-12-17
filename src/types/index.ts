import { RecordingState } from '../state/recordingState';

// Component Props
export interface RecordButtonProps {
  state: RecordingState;
  onStartRecording: () => void;
  onStopRecording: () => void;
  disabled?: boolean;
}

export interface TranscriptDisplayProps {
  transcript: string;
  isProcessing: boolean;
  onCopy: () => void;
  copySuccess: boolean;
}

export interface StatusIndicatorProps {
  state: RecordingState;
  error: string | null;
}

// Audio Types
export interface AudioChunk {
  data: Int16Array;
  timestamp: number;
}

export interface AudioCaptureCallbacks {
  onAudioData: (chunk: AudioChunk) => void;
  onPermissionDenied: () => void;
  onError: (error: Error) => void;
}

// Deepgram Types
export interface DeepgramTranscript {
  text: string;
  isFinal: boolean;
  confidence: number;
}

export interface DeepgramCallbacks {
  onTranscript: (transcript: DeepgramTranscript) => void;
  onError: (error: Error) => void;
  onClose: () => void;
}

export interface DeepgramMessage {
  type: 'Results' | 'Metadata' | 'Error';
  channel?: {
    alternatives?: Array<{
      transcript: string;
      confidence?: number;
    }>;
  };
  is_final?: boolean;
  error?: string;
}

// Transcription Manager Types
export interface TranscriptionManagerCallbacks {
  onStateChange: (state: RecordingState) => void;
  onTranscriptUpdate: (text: string) => void;
  onAudioLevel?: (level: number) => void;
  onError: (error: AppError) => void;
}

// Hook Return Types
export interface UseVoiceToTextReturn {
  state: RecordingState;
  transcript: string;
  error: string | null;
  audioLevel: number;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  copyToClipboard: () => Promise<boolean>;
  copySuccess: boolean;
  isInitializing: boolean;
}

// Error Types
export const ErrorType = {
  MicrophonePermissionDenied: 'MICROPHONE_PERMISSION_DENIED',
  AudioCaptureError: 'AUDIO_CAPTURE_ERROR',
  DeepgramConnectionError: 'DEEPGRAM_CONNECTION_ERROR',
  DeepgramTranscriptionError: 'DEEPGRAM_TRANSCRIPTION_ERROR',
  NetworkError: 'NETWORK_ERROR',
  UnknownError: 'UNKNOWN_ERROR',
} as const;

export type ErrorType =
  typeof ErrorType[keyof typeof ErrorType];

export interface AppError {
  type: ErrorType | string;
  message: string;
  originalError?: Error;
  timestamp: number;
}
