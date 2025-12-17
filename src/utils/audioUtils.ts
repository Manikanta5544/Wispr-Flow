// Type aliases for semantic clarity
export type PCM32Data = Float32Array;
export type PCM16Data = Int16Array;

// Float32 PCM to Int16 PCM 
export const float32ToInt16 = (buffer: PCM32Data): PCM16Data => {
  const pcm16 = new Int16Array(buffer.length);

  for (let i = 0; i < buffer.length; i++) {
    const sample = Math.max(-1, Math.min(1, buffer[i]));
    pcm16[i] = sample * 0x7fff;
  }

  return pcm16;
};

// RMS value
export const calculateRMS = (buffer: PCM32Data): number => {
  let sum = 0;

  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }

  return Math.sqrt(sum / buffer.length);
};
