import { TranscriptionManager } from '../services/transcriptionManager';
import { RecordingState } from '../state/recordingState';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/services/audioCapture', () => ({
  createAudioCapture: vi.fn(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    destroy: vi.fn(),
  })),
}));

vi.mock('../src/services/deepgramClient', () => ({
  createDeepgramClient: vi.fn(() => ({
    connect: vi.fn(),
    sendAudio: vi.fn(),
    finish: vi.fn(),
    disconnect: vi.fn(),
  })),
}));

describe('TranscriptionManager', () => {
  const callbacks = {
    onStateChange: vi.fn(),
    onTranscriptUpdate: vi.fn(),
    onError: vi.fn(),
    onAudioLevel: vi.fn(),
  };

  let manager: TranscriptionManager;

  beforeEach(() => {
    manager = new TranscriptionManager(callbacks);
  });

  it('starts in Idle state', () => {
    expect(manager.getState()).toBe(RecordingState.Idle);
  });

  it('transitions to Recording on start()', async () => {
    await manager.start();

    expect(callbacks.onStateChange).toHaveBeenCalledWith(
      RecordingState.RequestingPermission
    );

    expect(callbacks.onStateChange).toHaveBeenCalledWith(
      RecordingState.Recording
    );
  });

  it('does not start again if already recording', async () => {
    await manager.start();
    const currentState = manager.getState();

    await manager.start();

    expect(manager.getState()).toBe(currentState);
  });

  it('stops recording and returns to Idle state', async () => {
    await manager.start();
    manager.stop();

    expect(callbacks.onStateChange).toHaveBeenCalledWith(
      RecordingState.Processing
    );
    expect(callbacks.onStateChange).toHaveBeenCalledWith(
      RecordingState.Idle
    );
  });

  it('buffers final transcripts correctly', async () => {
    await manager.start();

    // @ts-expect-error – accessing internal handler for testing behavior
    manager['handleTranscript']({
      text: 'Hello',
      isFinal: true,
    });

    expect(callbacks.onTranscriptUpdate).toHaveBeenCalledWith('Hello');

    // @ts-expect-error –  private method access for test validation
    manager['handleTranscript']({
      text: 'world',
      isFinal: true,
    });

    expect(callbacks.onTranscriptUpdate).toHaveBeenCalledWith('Hello world');
  });

  it('handles errors and transitions to Error state', async () => {
    await manager.start();

    // @ts-ign testing private error handler behavior
    manager['handleError']({
      type: 'TEST_ERROR',
      message: 'Test error',
      timestamp: Date.now(),
    });
    expect(manager.getState()).toBe(RecordingState.Error);
    expect(callbacks.onError).toHaveBeenCalled();
  });

  it('cleans up resources on stop()', async () => {
    await manager.start();
    manager.stop();

    expect(manager.getState()).toBe(RecordingState.Idle);
  });
});
