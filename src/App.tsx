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
      if (state !== RecordingState.Idle && state !== RecordingState.Ready) return;
      startRecording();
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
        <div className="app-card">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm px-8 py-10 flex flex-col items-center gap-6">
          <h1 className="app-title">Voice to Text</h1>

          <div className="flex flex-col items-center gap-3">
            <RecordButton
              state={state}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              disabled={isInitializing}
            />

            <div className="min-h-[100px] flex flex-col items-center gap-2">
              {state === RecordingState.Recording && (
                <p className="text-xs text-gray-500">
                  Live audio input
                </p>
              )}

              <AudioVisualizer
                isRecording={state === RecordingState.Recording}
                audioLevel={audioLevel}
              />
            </div>
          </div>


          <StatusIndicator state={state} error={error} />

          <TranscriptDisplay
            transcript={transcript}
            isProcessing={state === RecordingState.Processing}
            onCopy={copyToClipboard}
            copySuccess={copySuccess}
          />
        </div>
        </div>
      </main>

    </ErrorBoundary>
  );
};

export default App;
