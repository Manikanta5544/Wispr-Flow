import React from 'react';
import { RecordingState } from '../state/recordingState';
import type { RecordButtonProps } from '../types';

export const RecordButton: React.FC<RecordButtonProps> = ({
  state,
  onStartRecording,
  onStopRecording,
  disabled = false
}) => {
    // Interaction state determines if button is clickable (delay)
  const isInteractive =
    state !== RecordingState.Processing &&
    state !== RecordingState.RequestingPermission &&
    !disabled;

  const handleClick = () => {
  if (!isInteractive) return;

  if (state === RecordingState.Recording) {
    onStopRecording();
  } else {
    onStartRecording();
  }
};

  // Maping FSM state to visual variant
  const variant = getVariant(state);

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleClick}
        disabled={!isInteractive}
        className={`${variantStyles[variant]} shadow-sm`}
        aria-label={ariaLabels[state] ?? 'Recording control'}
        type="button"
      >
        {state === RecordingState.Processing ? (
          <Spinner />
        ) : (
          <span className="text-sm font-medium">
            {buttonLabels[state] ?? '...'}
          </span>
        )}
      </button>

      <StateText state={state} />
    </div>
  );
};

// Button variant based on recording state
const getVariant = (state: RecordingState): ButtonVariant => {
  if (state === RecordingState.Error) return 'error';
  if (state === RecordingState.Recording) return 'recording';
  if (
    state === RecordingState.Processing ||
    state === RecordingState.RequestingPermission
  ) {
    return 'processing';
  }
  return 'idle';
};

type ButtonVariant = 'idle' | 'recording' | 'processing' | 'error';

// Button Variant styles
const variantStyles: Record<ButtonVariant, string> = {
  idle:
    'w-20 h-20 text-base rounded-full transition-all duration-200 font-semibold focus:outline-none focus:ring-4 bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-300',
  recording:
    'w-20 h-20 text-base rounded-full transition-all duration-200 font-semibold focus:outline-none focus:ring-4 bg-red-600 hover:bg-red-700 text-white animate-pulse focus:ring-red-300',
  processing:
    'w-20 h-20 text-base rounded-full transition-all duration-200 font-semibold focus:outline-none focus:ring-4 bg-gray-400 text-white cursor-not-allowed',
  error:
    'w-20 h-20 text-base rounded-full transition-all duration-200 font-semibold focus:outline-none focus:ring-4 bg-red-500 hover:bg-red-600 text-white focus:ring-red-300',
};

// Button labels based on recording state
const buttonLabels: Partial<Record<RecordingState, string>> = {
  [RecordingState.Idle]: 'Record',
  [RecordingState.Ready]: 'Record',
  [RecordingState.Recording]: 'Stop',
  [RecordingState.Error]: 'Retry',
};

const ariaLabels: Partial<Record<RecordingState, string>> = {
  [RecordingState.Idle]: 'Start recording',
  [RecordingState.Ready]: 'Start recording',
  [RecordingState.Recording]: 'Stop recording',
  [RecordingState.RequestingPermission]: 'Requesting microphone permission',
  [RecordingState.Processing]: 'Processing transcription',
  [RecordingState.Error]: 'Retry recording',
};

// State feedback messages
const stateMessages: Partial<
  Record<RecordingState, { text: string; style: string }>
> = {
  [RecordingState.Idle]: {
    text: 'Click to start or press Ctrl+Shift+V',
    style: 'text-gray-600',
  },
  [RecordingState.RequestingPermission]: {
    text: 'Requesting microphone access...',
    style: 'text-blue-600',
  },
  [RecordingState.Ready]: {
    text: 'Ready to record',
    style: 'text-green-600',
  },
  [RecordingState.Recording]: {
    text: 'Listening... Click or release to stop',
    style: 'text-red-600 font-semibold',
  },
  [RecordingState.Processing]: {
    text: 'Processing your speech...',
    style: 'text-blue-600',
  },
  [RecordingState.Error]: {
    text: 'Error occured, click to retry',
    style: 'text-red-600',
  },
};

// Spinner component (animation for processing state)
const Spinner: React.FC = () => (
  <svg
    className="animate-spin h-6 w-6 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// Feedback text component
const StateText: React.FC<{ state: RecordingState }> = ({ state }) => {
  const message = stateMessages[state];

  return (
    <p className={`text-sm ${message?.style ?? ''} min-h-[20px] text-center`}>
      {message?.text ?? ''}
    </p>
  );
};

export default RecordButton;
