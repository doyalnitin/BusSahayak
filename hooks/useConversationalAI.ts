import { useState, useCallback, useRef } from "react";
import {
  processVoiceInput,
  createContext,
  readBusResults,
  readSeatOptions,
  readBookingConfirmation,
} from "../services/conversationalAI";
import { useVoiceInput } from "./useVoiceInput";
import { useVoiceOutput } from "./useVoiceOutput";
import { useBookingStore } from "../store/useBookingStore";

export function useConversationalAI() {
  const [context, setContext] = useState<ReturnType<typeof createContext>>(createContext());
  const [conversationLog, setConversationLog] = useState<
    Array<{ role: "user" | "ai"; text: string }>
  >([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { startListening, stopListening, transcript, isListening } =
    useVoiceInput();
  const { speak } = useVoiceOutput();
  const {
    setFrom,
    setTo,
    setDate,
    selectBus,
    toggleSeat,
    setPassengers,
    setMobileNumber,
  } = useBookingStore();

  const processInput = useCallback(
    (text: string) => {
      setIsProcessing(true);

      // Add user message to log
      setConversationLog((prev) => [...prev, { role: "user", text }]);

      // Process with AI
      const response = processVoiceInput(text, context);

      // Update context
      setContext((prev: any) => ({
        ...prev,
        ...response.data,
        step: response.action,
      }));

      // Add AI response to log
      setConversationLog((prev) => [...prev, { role: "ai", text: response.message }]);

      // Speak the response
      speak(response.message);

      // Execute action
      executeAction(response);

      setIsProcessing(false);
    },
    [context, speak]
  );

  const executeAction = useCallback(
    (response: { action: string; data: any }) => {
      switch (response.action) {
        case "search_buses":
          if (response.data.from) setFrom(response.data.from);
          if (response.data.to) setTo(response.data.to);
          if (response.data.date) setDate(response.data.date);
          break;

        case "go_home":
          // Router push handled by screen
          break;

        case "go_back":
          // Router back handled by screen
          break;

        case "submit_booking":
          // Submit booking
          break;
      }
    },
    [setFrom, setTo, setDate]
  );

  const startConversation = useCallback(() => {
    const welcomeMsg = "Namaste. Main Bus Sahayak hoon. Kahan jaana hai? Cities bolo.";
    setConversationLog([{ role: "ai", text: welcomeMsg }]);
    speak(welcomeMsg);
  }, [speak]);

  const handleVoiceInput = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Process transcript when listening stops
  const lastProcessed = useRef("");
  if (transcript && transcript !== lastProcessed.current && !isListening) {
    lastProcessed.current = transcript;
    processInput(transcript);
  }

  return {
    context,
    conversationLog,
    isProcessing,
    isListening,
    transcript,
    startConversation,
    handleVoiceInput,
    processInput,
    speak,
  };
}
