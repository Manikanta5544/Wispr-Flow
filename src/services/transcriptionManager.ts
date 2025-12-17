import { RecordingState } from '../state/recordingState';
import type {
  TranscriptionManagerCallbacks,
  DeepgramTranscript,
  AppError,
} from '../types';
import { createAudioCapture } from './audioCapture';
import { createDeepgramClient } from './deepgramClient';

export class TranscriptionManager {
  private state: RecordingState = RecordingState.Idle;
  private transcriptBuffer = '';

  private readonly callbacks: TranscriptionManagerCallbacks;

  private audioCapture: ReturnType<typeof createAudioCapture> | null = null;
  private deepgramClient: ReturnType<typeof createDeepgramClient> | null = null;

  constructor(callbacks: TranscriptionManagerCallbacks) {
    this.callbacks = callbacks;
  }

  // Starting a new transcription session (PUBLIC API)
  async start(): Promise<void> {
    if (!this.canStart()) return;

    this.setState(RecordingState.RequestingPermission);

    try {
      this.audioCapture = createAudioCapture({
        onAudioData: (chunk) => {
          this.deepgramClient?.sendAudio(chunk.data);
        },
        onPermissionDenied: () => {
          this.handleError({
            type: 'MICROPHONE_PERMISSION_DENIED',
            message: 'Microphone access denied',
            timestamp: Date.now(),
          });
        },
        onError: (error) => {
          this.handleError({
            type: 'AUDIO_CAPTURE_ERROR',
            message: error.message,
            originalError: error,
            timestamp: Date.now(),
          });
        },
      });

      this.deepgramClient = createDeepgramClient({
        onTranscript: this.handleTranscript,
        onError: (error) => {
          this.handleError({
            type: 'DEEPGRAM_TRANSCRIPTION_ERROR',
            message: error.message,
            originalError: error,
            timestamp: Date.now(),
          });
        },
        onClose: () => {
          if (this.state === RecordingState.Recording) {
            this.stop();
          }
        },
      });

      await this.audioCapture.start();
      await this.deepgramClient.connect();

      this.transcriptBuffer = '';
      this.setState(RecordingState.Recording);
    } catch (error) {
      this.handleError({
        type: 'UNKNOWN_ERROR',
        message: 'Failed to start transcription',
        originalError: error as Error,
        timestamp: Date.now(),
      });
    }
  }

  // Stop current transcription session
  stop(): void {
    if (!this.canStop()) return;

    this.setState(RecordingState.Processing);

    try {
      this.audioCapture?.stop();
      this.deepgramClient?.finish();
    } finally {
        // Preventing Zombie Websockets, memory leaks and dangling audio contexts
      this.cleanup();
      this.setState(RecordingState.Idle);
    }
  }

  // Get recording state (current)
  getState(): RecordingState {
    return this.state;
  }
  
  private handleTranscript = (transcript: DeepgramTranscript): void => {
    if (!transcript.text) return;

    // text for responsiveness and accuracy buffering
    if (transcript.isFinal) {
      this.transcriptBuffer += transcript.text + ' ';
    }

    this.callbacks.onTranscriptUpdate(
      transcript.isFinal ? this.transcriptBuffer.trim() : transcript.text
    );
  };

 

  private handleError(error: AppError): void {
    this.cleanup();
    this.setState(RecordingState.Error);
    this.callbacks.onError(error);
  }
 
  private setState(nextState: RecordingState): void {
    if (this.state === nextState) return;
    if (!this.isValidTransition(this.state, nextState)) {
    console.error(`Invalid transition: ${this.state} -> ${nextState}`);
    return;
  }
    this.state = nextState;
    this.callbacks.onStateChange(nextState);
  }

  private isValidTransition(from: RecordingState, to: RecordingState): boolean {
  const validTransitions: Record<RecordingState, RecordingState[]> = {
    [RecordingState.Idle]: [RecordingState.RequestingPermission],
    [RecordingState.RequestingPermission]: [RecordingState.Recording, RecordingState.Error],
    [RecordingState.Ready]: [RecordingState.Recording],
    [RecordingState.Recording]: [RecordingState.Processing, RecordingState.Error],
    [RecordingState.Processing]: [RecordingState.Idle, RecordingState.Error],
    [RecordingState.Error]: [RecordingState.Idle, RecordingState.RequestingPermission]
  };
  
  return validTransitions[from]?.includes(to) ?? false;
}

  private canStart(): boolean {
    return (
      this.state === RecordingState.Idle ||
      this.state === RecordingState.Ready ||
      this.state === RecordingState.Error
    );
  }

  private canStop(): boolean {
    return this.state === RecordingState.Recording;
  }
  
  private cleanup(): void {
    this.audioCapture?.destroy();
    this.deepgramClient?.disconnect();

    this.audioCapture = null;
    this.deepgramClient = null;
  }
}
