import React from 'react';
import { RecordingState } from '../src/state/recordingState';
import { useVoiceToText } from '../src/hooks/useVoiceToText';
import { useKeyboardShortcut } from '../src/hooks/useKeyboardShortcut';

import RecordButton from '../src/components/RecordButton';
import TranscriptDisplay from '../src/components/TranscriptDisplay';
import StatusIndicator from '../src/components/StatusIndicator';
import ErrorBoundary from '../src/components/ErrorBoundary';

const App: React.FC = () => {
  const {
    state,
    transcript,
    error,
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
    onKeyDown: startRecording,
    onKeyUp: stopRecording,
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
