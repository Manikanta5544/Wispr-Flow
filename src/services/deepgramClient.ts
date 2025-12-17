import type { DeepgramCallbacks, DeepgramMessage } from '../types';
import { DEEPGRAM_CONFIG } from '../config/constants';

export const createDeepgramClient = (callbacks: DeepgramCallbacks) => {
  let socket: WebSocket | null = null;

  const connect = async (): Promise<void> => {
    const apiKey = import.meta.env.VITE_DEEPGRAM_API_KEY;

    if (!apiKey) {
      throw new Error(
        'Deepgram API key is missing, please add API key'
      );
    }

    const url =
      `${DEEPGRAM_CONFIG.WS_URL}?` +
      `encoding=${DEEPGRAM_CONFIG.ENCODING}&` +
      `sample_rate=${DEEPGRAM_CONFIG.SAMPLE_RATE}&` +
      `channels=${DEEPGRAM_CONFIG.CHANNELS}&` +
      `punctuate=${DEEPGRAM_CONFIG.PUNCTUATE}&` +
      `interim_results=${DEEPGRAM_CONFIG.INTERIM_RESULTS}`;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        socket?.close();
        reject(new Error('Deepgram connection timeout (10s)'));
      }, 10000);

      socket = new WebSocket(url, ['token', apiKey]);

      socket.onopen = () => {
        clearTimeout(timeout);
        resolve();
      };

      socket.onmessage = (event) => {
        try {
          const message: DeepgramMessage = JSON.parse(event.data);

          if (message.type === 'Results' && message.channel?.alternatives?.[0]) {
            const alt = message.channel.alternatives[0];

            callbacks.onTranscript({
              text: alt.transcript,
              isFinal: Boolean(message.is_final),
              confidence: alt.confidence ?? 0,
            });
          } else if (message.type === 'Error') {
            callbacks.onError(
              new Error(message.error || 'Unknown Deepgram error')
            );
          }
        } catch (error) {
          callbacks.onError(error as Error);
        }
      };

      socket.onerror = () => {
        clearTimeout(timeout);
        const err = new Error('Deepgram WebSocket error');
        callbacks.onError(err);
        reject(err);
      };

      socket.onclose = () => {
        clearTimeout(timeout);
        callbacks.onClose();
      };
    });
  };

  const sendAudio = (chunk: Int16Array): void => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not open. Cannot send audio chunk.');
      return;
    }
    socket.send(chunk.buffer);
  };

  const finish = (): void => {
    if (!socket) return;
    socket.send(JSON.stringify({ type: 'CloseStream' }));
  };

  const disconnect = (): void => {
    socket?.close();
    socket = null;
  };

  return { connect, sendAudio, finish, disconnect };
};
