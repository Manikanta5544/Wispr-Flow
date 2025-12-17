import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isRecording: boolean;
  audioLevel?: number; // RMS 0.0 → ~0.3
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isRecording,
  audioLevel = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const smoothedLevelRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRecording || !canvasRef.current) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const barCount = 24;
    const barWidth = canvas.width / barCount;
    const maxBarHeight = canvas.height * 0.85;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Exponential smoothing (fast rise, slow decay)
      const target = Math.min(audioLevel * 3, 1);
      smoothedLevelRef.current =
        smoothedLevelRef.current * 0.85 + target * 0.15;

      const level = smoothedLevelRef.current;

      for (let i = 0; i < barCount; i++) {
        const barHeight =
          Math.max(2, level * maxBarHeight * (0.6 + i / barCount * 0.4));

        const x = i * barWidth;
        const y = (canvas.height - barHeight) / 2;

        ctx.fillStyle = '#2563EB';
        ctx.fillRect(x, y, barWidth - 2, barHeight);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecording, audioLevel]);

  if (!isRecording) return null;

  return (
    <div className="w-full max-w-md">
      <div className="bg-gray-50 rounded-lg overflow-hidden shadow-inner p-2">
        <canvas
          ref={canvasRef}
          width={600}
          height={80}
          className="w-full h-20"
          aria-label="Audio visualization"
        />
      </div>
    </div>
  );
};

export default AudioVisualizer;
