import React from 'react';
import { RecordingState } from './state/recordingState';
import { useVoiceToText } from './hooks/useVoiceToText';
import { useKeyboardShortcut } from './hooks/useKeyboardShortcut';

import RecordButton from './components/RecordButton';
import TranscriptDisplay from './components/TranscriptDisplay';
import StatusIndicator from './components/StatusIndicator';
import ErrorBoundary from './components/ErrorBoundary';
import AudioVisualizer from './components/AudioVisualizer'

const App: React.FC = () => {
  const {
    state,
    transcript,
    error,
    audioLevel,
    startRecording,
    stopRecording,
    copyToClipboard,
    copySuccess,
    isInitializing,
  } = useVoiceToText();

  // Push-to-talk keyboard shortcut (Ctrl+Shift+V)
  useKeyboardShortcut({
    key: 'V',
    ctrlKey: true,
    shiftKey: true,
    onKeyDown: () => {
      if (state === RecordingState.Idle || state === RecordingState.Ready) {
        startRecording();
      }
    },
    onKeyUp: () => {
      if (state === RecordingState.Recording) {
        stopRecording();
      }
    },
  });

  return (
    <ErrorBoundary>
      <main className="app-container">
        <h1 className="app-title">Voice to Text</h1>

        <RecordButton
          state={state}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          disabled={isInitializing}
        />
        <AudioVisualizer
          isRecording={state === RecordingState.Recording}
          audioLevel={audioLevel}
        />

        <StatusIndicator state={state} error={error} />

        <TranscriptDisplay
          transcript={transcript}
          isProcessing={state === RecordingState.Processing}
          onCopy={copyToClipboard}
          copySuccess={copySuccess}
        />
      </main>
    </ErrorBoundary>
  );
};

export default App;
