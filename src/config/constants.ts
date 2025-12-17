// Audio config (85ms latency, mono audio)
export const AUDIO_CONFIG = {
  BUFFER_SIZE: 4096,
  CHANNELS: 1,
} as const;

// Deepgram config
export const DEEPGRAM_CONFIG = {
  WS_URL: 'wss://api.deepgram.com/v1/listen',
  CONNECTION_TIMEOUT_MS: 10000,
  ENCODING: 'linear16',
  SAMPLE_RATE: 48000,
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
