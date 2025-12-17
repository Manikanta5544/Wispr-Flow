/**
 * RecordingState
 *
 * Finite states representing the voice-to-text lifecycle.
 * Used consistently across UI, hooks, and orchestration layer.
 *
 * This enum intentionally stays small and explicit.
 */
export const RecordingState = {
  Idle: 'IDLE',
  RequestingPermission: 'REQUESTING_PERMISSION',
  Ready: 'READY',
  Recording: 'RECORDING',
  Processing: 'PROCESSING',
  Error: 'ERROR',
} as const;

export type RecordingState =
  typeof RecordingState[keyof typeof RecordingState];