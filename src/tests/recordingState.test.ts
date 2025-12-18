import { RecordingState } from '../state/recordingState';

describe('RecordingState enum', () => {
  it('should define all expected states', () => {
    expect(RecordingState.Idle).toBeDefined();
    expect(RecordingState.RequestingPermission).toBeDefined();
    expect(RecordingState.Ready).toBeDefined();
    expect(RecordingState.Recording).toBeDefined();
    expect(RecordingState.Processing).toBeDefined();
    expect(RecordingState.Error).toBeDefined();
  });
});
