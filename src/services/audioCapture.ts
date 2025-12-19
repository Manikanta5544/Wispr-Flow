import type { AudioCaptureCallbacks, AudioChunk } from '../types';
import { calculateRMS, float32ToInt16 } from '../utils/audioUtils';
import { AUDIO_CONFIG } from '../config/constants';

export const createAudioCapture = (callbacks: AudioCaptureCallbacks) => {
  let audioContext: AudioContext | null = null;
  let processor: ScriptProcessorNode | null = null;
  let source: MediaStreamAudioSourceNode | null = null;
  let stream: MediaStream | null = null;

  const start = async (): Promise<void> => {
    if (audioContext && audioContext.state !== 'closed') {
      throw new Error('Audio capture already started');
    }

    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: {
        channelCount: 1,
        sampleRate: AUDIO_CONFIG.SAMPLE_RATE,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      }});
      audioContext = new AudioContext({
        sampleRate: AUDIO_CONFIG.SAMPLE_RATE,
        latencyHint: 'interactive',
      });

      // Resume if suspended
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      source = audioContext.createMediaStreamSource(stream);

      // ScriptProcessorNode is deprecated in favor of AudioWorklet
      // but AudioWorklet requires separate file loading which complicates Tauri bundling.
      // For production, migrate to AudioWorklet.
      processor = audioContext.createScriptProcessor(
        AUDIO_CONFIG.BUFFER_SIZE,
        AUDIO_CONFIG.CHANNELS,
        AUDIO_CONFIG.CHANNELS
      );

      processor.onaudioprocess = (event) => {
        const input = event.inputBuffer.getChannelData(0);
        const rms = calculateRMS(input);  // silence gating (removes background noise)
        if (rms < AUDIO_CONFIG.SILENCE_THRESHOLD) {
          return;
        }

        const pcm16 = float32ToInt16(input);

        callbacks.onAudioData({
          data: pcm16,
          timestamp: Date.now(),
        } satisfies AudioChunk);

      };

      source.connect(processor);
      processor.connect(audioContext.destination);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        callbacks.onPermissionDenied();
      } else {
        callbacks.onError(error as Error);
      }
    }
  };

  const stop = (): void => {
    processor?.disconnect();
    source?.disconnect();
    audioContext?.close();

    stream?.getTracks().forEach((track) => track.stop());

    processor = null;
    source = null;
    audioContext = null;
    stream = null;
  };

  const destroy = (): void => {
    stop();
  };

  return { start, stop, destroy };
};
