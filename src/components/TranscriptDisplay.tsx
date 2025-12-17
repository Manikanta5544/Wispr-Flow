import React from 'react';
import type { TranscriptDisplayProps } from '../types';

export const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({
  transcript,
  isProcessing,
  onCopy,
  copySuccess,
}) => {
  const hasTranscript = Boolean(transcript.trim());

  return (
    <div className="w-full max-w-xl flex flex-col gap-2">
      <div className="border rounded-md p-3 min-h-[120px] bg-white text-gray-900 text-sm whitespace-pre-wrap">
        {hasTranscript ? (
          transcript
        ) : (
          <span className="text-gray-400">
            Your transcription will appear here…
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">
          {isProcessing ? 'Finalizing transcription…' : ''}
        </span>

        <button
          type="button"
          onClick={onCopy}
          disabled={!hasTranscript}
          className="text-blue-600 hover:underline disabled:text-gray-400"
        >
          {copySuccess ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
};

export default TranscriptDisplay;
