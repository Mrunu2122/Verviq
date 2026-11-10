'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// Declare Web Speech API types for TypeScript
interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

export interface UseAudioRecorderReturn {
  isRecording: boolean;
  transcript: string;
  durationSeconds: number;
  isSupported: boolean;
  hasPermission: boolean | null;
  volumeLevel: number;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetTranscript: () => void;
  setManualTranscript: (text: string) => void;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const win = window as unknown as IWindow;
      const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
      }
    }

    return () => {
      stopCleanup();
    };
  }, []);

  const stopCleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const startRecording = useCallback(async () => {
    setError(null);
    setDurationSeconds(0);

    try {
      // 1. Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setHasPermission(true);

      // 2. Setup Audio Visualizer Analyser
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateVolume = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setVolumeLevel(Math.min(100, Math.round((avg / 128) * 100)));
          animationFrameRef.current = requestAnimationFrame(updateVolume);
        };
        updateVolume();
      } catch (e) {
        console.warn('Audio visualization context unavailable', e);
      }

      // 3. Setup Web Speech Recognition
      const win = window as unknown as IWindow;
      const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        let accumulatedTranscript = transcript ? transcript + ' ' : '';

        recognition.onresult = (event: any) => {
          let currentSessionText = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const part = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              accumulatedTranscript += part + ' ';
            } else {
              currentSessionText += part;
            }
          }
          setTranscript((accumulatedTranscript + currentSessionText).trim());
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition event warning:', event.error);
          if (event.error === 'not-allowed') {
            setError('Microphone permission was denied.');
          }
        };

        recognition.onend = () => {
          // If still marked as recording, restart (speech recognition times out on quiet pauses)
          if (isRecording && recognitionRef.current) {
            try {
              recognition.start();
            } catch {}
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      }

      setIsRecording(true);

      // Duration counter
      const startTimestamp = Date.now();
      timerRef.current = setInterval(() => {
        setDurationSeconds(Math.floor((Date.now() - startTimestamp) / 1000));
      }, 500);
    } catch (err: any) {
      console.error('Failed to start microphone recording:', err);
      setHasPermission(false);
      setError('Could not access microphone. Please check browser permissions or use text response mode.');
    }
  }, [isRecording, transcript]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    stopCleanup();
    setVolumeLevel(0);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setDurationSeconds(0);
  }, []);

  const setManualTranscript = useCallback((text: string) => {
    setTranscript(text);
  }, []);

  return {
    isRecording,
    transcript,
    durationSeconds,
    isSupported,
    hasPermission,
    volumeLevel,
    error,
    startRecording,
    stopRecording,
    resetTranscript,
    setManualTranscript,
  };
}
