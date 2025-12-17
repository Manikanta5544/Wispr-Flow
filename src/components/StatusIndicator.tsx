import React from 'react';
import { RecordingState } from '../state/recordingState';

interface StatusIndicatorProps {
  state: RecordingState;
  error: string | null;
}
 
export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  state,
  error,
}) => {
  if (error) {
    return (
      <p className="text-sm text-red-600 text-center">
        {error}
      </p>
    );
  }

  const message = getStatusMessage(state);

  if (!message) return null;

  return (
    <p className="text-sm text-gray-600 text-center">
      {message}
    </p>
  );
};

const getStatusMessage = (state: RecordingState): string | null => {
  switch (state) {
    case RecordingState.RequestingPermission:
      return 'Requesting microphone permission…';
    case RecordingState.Processing:
      return 'Processing speech…';
    default:
      return null;
  }
};

export default StatusIndicator;
