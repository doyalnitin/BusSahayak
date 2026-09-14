import { useState, useCallback, useRef } from "react";
import { Platform } from "react-native";

interface UseVoiceOutputOptions {
  language?: string;
  rate?: number;
  pitch?: number;
}

export function useVoiceOutput(options: UseVoiceOutputOptions = {}) {
  const { language = "en-IN", rate = 0.45, pitch = 1.0 } = options;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const utteranceRef = useRef<any>(null);

  const speak = useCallback(
    (text: string, onDone?: () => void) => {
      if (!text) return;

      setCurrentText(text);
      setIsSpeaking(true);

      if (Platform.OS === "web" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        utterance.rate = rate;
        utterance.pitch = pitch;

        utterance.onend = () => {
          setIsSpeaking(false);
          onDone?.();
        };

        utterance.onerror = () => {
          setIsSpeaking(false);
          onDone?.();
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      } else {
        // Native: use expo-speech in production
        setTimeout(() => {
          setIsSpeaking(false);
          onDone?.();
        }, text.length * 80);
      }
    },
    [language, rate, pitch]
  );

  const speakWithDelay = useCallback(
    (text: string, delayMs: number = 500, onDone?: () => void) => {
      setTimeout(() => speak(text, onDone), delayMs);
    },
    [speak]
  );

  const readBusResults = useCallback(
    (buses: any[], onDone?: () => void) => {
      if (buses.length === 0) {
        speak("No buses found for this route.", onDone);
        return;
      }

      const count = Math.min(buses.length, 3);
      let text = `Found ${buses.length} buses. Here are the first ${count}. `;

      buses.slice(0, count).forEach((bus, i) => {
        text += `Bus ${i + 1}: ${bus.operatorName}, ${bus.busType}. `;
        text += `Departs ${bus.departureTime}, arrives ${bus.arrivalTime}. `;
        text += `${bus.availableSeats} seats available. `;
        text += `Fare ${bus.fare} rupees. `;
      });

      text += `Say book to select a bus, or next for more options.`;

      speak(text, onDone);
    },
    [speak]
  );

  const readSeatOptions = useCallback(
    (seats: any[], onDone?: () => void) => {
      const available = seats.filter((s) => s.status === "available");
      if (available.length === 0) {
        speak("No seats available.", onDone);
        return;
      }

      let text = `${available.length} seats available. `;
      available.slice(0, 6).forEach((seat) => {
        text += `Seat ${seat.number}, ${seat.position}, ${seat.deck}. `;
      });

      if (available.length > 6) {
        text += `And ${available.length - 6} more seats.`;
      }

      speak(text, onDone);
    },
    [speak]
  );

  const stop = useCallback(() => {
    if (Platform.OS === "web" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return {
    isSpeaking,
    currentText,
    speak,
    speakWithDelay,
    readBusResults,
    readSeatOptions,
    stop,
  };
}
