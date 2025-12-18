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
      <p className="text-xs font-medium text-gray-500">
        Transcription
      </p>

      <div className="rounded-lg border bg-white p-4 min-h-[140px] max-h-[240px] overflow-y-auto">

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
          className="px-3 py-1 rounded-md text-blue-600 hover:bg-blue-50 disabled:text-gray-400 disabled:hover:bg-transparent transition"
        >
          {copySuccess ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
};

export default TranscriptDisplay;
