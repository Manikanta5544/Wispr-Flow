// Audio config (85ms latency, mono audio)
export const AUDIO_CONFIG = {
  BUFFER_SIZE: 2048, // 50% buffer rate
  CHANNELS: 1,
  SAMPLE_RATE: 16000,
  SILENCE_THRESHOLD: 0.01,
} as const;

// Deepgram config
export const DEEPGRAM_CONFIG = {
  WS_URL: 'wss://api.deepgram.com/v1/listen',
  CONNECTION_TIMEOUT_MS: 10000,
  ENCODING: 'linear16',
  SAMPLE_RATE: 16000,
  CHANNELS: 1,
  PUNCTUATE: true,
  INTERIM_RESULTS: true,
  MODEL: 'nova-2',
  LANGUAGE: 'en-US',
} as const;

// Transcript config
export const TRANSCRIPT_CONFIG = {
  SEGMENT_SEPARATOR: ' ',
} as const;

// UI config
export const UI_CONFIG = {
  SHORTCUT_HINT: 'Ctrl+Shift+V',
} as const;
