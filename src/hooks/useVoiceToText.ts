import { useCallback, useEffect, useRef, useState } from 'react';
import { RecordingState } from '../state/recordingState';
import { TranscriptionManager } from '../services/transcriptionManager';
import type { UseVoiceToTextReturn, AppError } from '../types';
import { copyToClipboard } from '../utils/clipboardUtils';

export const useVoiceToText = (): UseVoiceToTextReturn => {
  const managerRef = useRef<TranscriptionManager | null>(null);

  const [state, setState] = useState<RecordingState>(RecordingState.Idle);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  // Initialize TranscriptionManager once
  useEffect(() => {
    managerRef.current = new TranscriptionManager({
      onStateChange: (nextState) => {
        setState(nextState);
      },
      onTranscriptUpdate: (text) => {
        setTranscript(text);
      },
      onError: (err: AppError) => {
        setError(err.message);
      },
    });

    return () => {
      managerRef.current = null;
    };
  }, []);

  const startRecording = useCallback(async (): Promise<void> => {
    setError(null);
    setCopySuccess(false);
    setIsInitializing(true);

    try {
      await managerRef.current?.start();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  // Clipboard functionality
  const copyTranscript = useCallback(async (): Promise<boolean> => {
    if (!transcript) return false;

    const success = await copyToClipboard(transcript);
    setCopySuccess(success);
    return success;
  }, [transcript]);

  const stopRecording = useCallback((): void => {
    managerRef.current?.stop();

    // Auto-copy final transcript after a short delay.
    setTimeout(() => {
      if (transcript.trim()) {
        copyTranscript();
      }
    }, 500);
  }, [transcript, copyTranscript]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (managerRef.current?.getState() === RecordingState.Recording) {
        managerRef.current.stop();
      }
    };
  }, []);

  return {
    state,
    transcript,
    error,
    startRecording,
    stopRecording,
    copyToClipboard: copyTranscript,
    copySuccess,
    isInitializing,
  };
};
