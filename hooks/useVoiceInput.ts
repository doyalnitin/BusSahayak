import { useState, useEffect, useCallback, useRef } from "react";
import { Platform } from "react-native";

interface VoiceInputResult {
  transcript: string;
  isFinal: boolean;
}

interface UseVoiceInputOptions {
  language?: string;
  onResult?: (result: VoiceInputResult) => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export function useVoiceInput(options: UseVoiceInputOptions = {}) {
  const { language = "en-IN", onResult, onEnd, onError } = options;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS === "web") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      setIsAvailable(!!SpeechRecognition);
    }
  }, []);

  const startListening = useCallback(async () => {
    try {
      setTranscript("");
      setIsListening(true);

      if (Platform.OS === "web") {
        const SpeechRecognition =
          (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
          throw new Error("Speech recognition not supported");
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = language;

        recognition.onresult = (event: any) => {
          let finalTranscript = "";
          let interimTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript;
            } else {
              interimTranscript += result[0].transcript;
            }
          }

          const currentTranscript = finalTranscript || interimTranscript;
          setTranscript(currentTranscript);

          if (finalTranscript) {
            onResult?.({ transcript: finalTranscript, isFinal: true });
          } else if (interimTranscript) {
            onResult?.({ transcript: interimTranscript, isFinal: false });
          }
        };

        recognition.onerror = (event: any) => {
          onError?.(event.error || "Speech recognition error");
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
          onEnd?.();
        };

        recognitionRef.current = recognition;
        recognition.start();
      } else {
        // For native, we use a simulated voice input
        // In production, use expo-speech-recognition
        setTimeout(() => {
          setIsListening(false);
          onEnd?.();
        }, 3000);
      }
    } catch (error) {
      onError?.("Failed to start voice input");
      setIsListening(false);
    }
  }, [language, onResult, onEnd, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const simulateInput = useCallback(
    (text: string) => {
      setTranscript(text);
      onResult?.({ transcript: text, isFinal: true });
    },
    [onResult]
  );

  return {
    isListening,
    transcript,
    isAvailable,
    startListening,
    stopListening,
    simulateInput,
  };
}
