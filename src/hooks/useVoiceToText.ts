import { useCallback, useEffect, useRef, useState } from 'react';
import { RecordingState } from '../state/recordingState';
import { TranscriptionManager } from '../services/transcriptionManager';
import type { UseVoiceToTextReturn, AppError } from '../types';
import { copyToClipboard } from '../utils/clipboardUtils';

export const useVoiceToText = (): UseVoiceToTextReturn => {
  const managerRef = useRef<TranscriptionManager | null>(null);
  const transcriptRef = useRef(''); 

  const [state, setState] = useState<RecordingState>(RecordingState.Idle);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  // Initialize TranscriptionManager once
  useEffect(() => {
    managerRef.current = new TranscriptionManager({
      onStateChange: (nextState) => {
        setState(nextState);
      },
      onTranscriptUpdate: (text) => {
        transcriptRef.current = text; 
        setTranscript(text);
      },
      onAudioLevel: (level: number) => {
        setAudioLevel(level);
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

  const copyTranscript = useCallback(async (): Promise<boolean> => {
    const text = transcriptRef.current;
    if (!text.trim()) return false;

    const success = await copyToClipboard(text);
    setCopySuccess(success);
    return success;
  }, []);

  const stopRecording = useCallback((): void => {
    managerRef.current?.stop();

    // Auto-copy final transcript after Deepgram flush
    setTimeout(() => {
      if (transcriptRef.current.trim()) {
        copyTranscript();
      }
    }, 500);
  }, [copyTranscript]);

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
    audioLevel,
    startRecording,
    stopRecording,
    copyToClipboard: copyTranscript,
    copySuccess,
    isInitializing,
  };
};
