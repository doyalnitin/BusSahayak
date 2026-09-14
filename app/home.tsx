import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useVoiceOutput } from "../hooks/useVoiceOutput";
import { useAnnounce } from "../hooks/useAnnounce";
import { useGestures } from "../hooks/useGestures";

interface Message {
  role: "user" | "ai";
  text: string;
}

interface Context {
  from: string;
  to: string;
  date: string;
  time: string;
  busType: string;
  step: string;
}

function extractCity(text: string): string | null {
  const cities: Record<string, string> = {
    mumbai: "Mumbai", pune: "Pune", delhi: "Delhi", jaipur: "Jaipur",
    bangalore: "Bangalore", bengaluru: "Bangalore", hyderabad: "Hyderabad",
    chennai: "Chennai", kolkata: "Kolkata", ahmedabad: "Ahmedabad",
    goa: "Goa", nagpur: "Nagpur", indore: "Indore", lucknow: "Lucknow",
    chandigarh: "Chandigarh", bhopal: "Bhopal", patna: "Patna",
    varanasi: "Varanasi", surat: "Surat", coimbatore: "Coimbatore",
    kochi: "Kochi", mysore: "Mysore",
  };
  const lower = text.toLowerCase();
  for (const [key, value] of Object.entries(cities)) {
    if (lower.includes(key)) return value;
  }
  return null;
}

function extractDate(text: string): string | null {
  const lower = text.toLowerCase();
  if (lower.includes("aaj") || lower.includes("today")) return "today";
  if (lower.includes("kal") || lower.includes("tomorrow")) return "tomorrow";
  if (lower.includes("parson") || lower.includes("day after")) return "day_after";
  return null;
}

function extractTime(text: string): string | null {
  const lower = text.toLowerCase();
  if (lower.includes("subah") || lower.includes("morning")) return "morning";
  if (lower.includes("dopahar") || lower.includes("afternoon")) return "afternoon";
  if (lower.includes("sham") || lower.includes("evening")) return "evening";
  if (lower.includes("raat") || lower.includes("night")) return "night";
  return null;
}

function extractBusType(text: string): string | null {
  const lower = text.toLowerCase();
  if (lower.includes("ac sleeper")) return "AC Sleeper";
  if (lower.includes("ac seater")) return "AC Seater";
  if (lower.includes("sleeper")) return "Sleeper";
  if (lower.includes("ac")) return "AC";
  if (lower.includes("non ac")) return "Non-AC";
  if (lower.includes("volvo")) return "Volvo";
  return null;
}

export default function HomeScreen() {
  const router = useRouter();
  const { speak, isSpeaking } = useVoiceOutput();
  const { announce } = useAnnounce();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [context, setContext] = useState<Context>({
    from: "",
    to: "",
    date: "tomorrow",
    time: "any",
    busType: "any",
    step: "start",
  });
  const [recognition, setRecognition] = useState<any>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const welcomeMsg = "Namaste. Main Bus Sahayak hoon. Kahan jaana hai? Departure city bolo.";
    setMessages([{ role: "ai", text: welcomeMsg }]);
    setTimeout(() => speak(welcomeMsg), 500);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const processInput = useCallback((text: string) => {
    setMessages((prev) => [...prev, { role: "user", text }]);

    const fromCity = extractCity(text);
    const toCity = extractCity(text);
    const date = extractDate(text);
    const time = extractTime(text);
    const busType = extractBusType(text);

    setContext((prev) => {
      const newCtx = { ...prev };
      if (fromCity && !prev.from) newCtx.from = fromCity;
      if (toCity && prev.from && !prev.to) newCtx.to = toCity;
      if (date) newCtx.date = date;
      if (time) newCtx.time = time;
      if (busType) newCtx.busType = busType;

      let aiResponse = "";
      let newStep = prev.step;

      if (prev.step === "start") {
        if (fromCity && toCity) {
          newCtx.from = fromCity;
          newCtx.to = toCity;
          aiResponse = `${fromCity} se ${toDateLabel(date || "tomorrow")} ke liye kis time ki bus chahiye? Subah, dopahar, sham, ya raat?`;
          newStep = "ask_time";
        } else if (fromCity) {
          newCtx.from = fromCity;
          aiResponse = `${fromCity} se kahan jaana hai?`;
          newStep = "ask_to";
        } else if (toCity) {
          newCtx.to = toCity;
          aiResponse = `${toCity} tak jaana hai. Kahan se jaoge?`;
          newStep = "ask_from";
        } else {
          aiResponse = "Main samajh nahi paya. Dobara bolo. Jaise, Mumbai se Pune jaana hai.";
          newStep = "start";
        }
      } else if (prev.step === "ask_from") {
        if (fromCity) {
          newCtx.from = fromCity;
          aiResponse = `${fromCity} se ${prev.to} ke liye kal ki buses dhundun?`;
          newStep = "ask_time";
        } else {
          aiResponse = "Departure city ka naam bolo.";
        }
      } else if (prev.step === "ask_to") {
        if (toCity) {
          newCtx.to = toCity;
          aiResponse = `${prev.from} se ${toCity} ke liye kal ki buses dhundun?`;
          newStep = "ask_time";
        } else {
          aiResponse = "Destination city ka naam bolo.";
        }
      } else if (prev.step === "ask_time") {
        if (time || text.toLowerCase().includes("kal") || text.toLowerCase().includes("any")) {
          aiResponse = `Kaisi bus chahiye? AC, sleeper, seater, ya koi bhi?`;
          newStep = "ask_bus_type";
        } else {
          aiResponse = "Subah, dopahar, sham, ya raat?";
        }
      } else if (prev.step === "ask_bus_type") {
        aiResponse = `${newCtx.from} se ${newCtx.to} ki kal ${newCtx.time === "any" ? "koi bhi" : newCtx.time} mein ${busType || "koi bhi"} buses dhundh rahe hain.`;
        newStep = "searching";
        setTimeout(() => router.push("/results" as any), 2000);
      }

      const newMsg = { role: "ai" as const, text: aiResponse };
      setTimeout(() => {
        setMessages((p) => [...p, newMsg]);
        speak(aiResponse);
      }, 300);

      return { ...newCtx, step: newStep };
    });
  }, [router, speak]);

  const startListening = useCallback(() => {
    if (Platform.OS !== "web") return;

    const SpeechRecognition = (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recog = new SpeechRecognition();
    recog.continuous = false;
    recog.interimResults = false;
    recog.lang = "hi-IN";

    recog.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setIsListening(false);
      processInput(text);
    };

    recog.onerror = () => setIsListening(false);
    recog.onend = () => setIsListening(false);

    setRecognition(recog);
    setIsListening(true);
    recog.start();
  }, [processInput]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
  }, [recognition]);

  const handleHold = useCallback(() => {
    if (isSpeaking) {
      if (Platform.OS === "web") window.speechSynthesis?.cancel();
      return;
    }
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, isSpeaking, startListening, stopListening]);

  const { handlePressIn, handlePressOut } = useGestures({
    onTripleTap: () => {
      const homeMsg = "Home screen par aa gaye. Kya karna hai?";
      setMessages((prev) => [...prev, { role: "ai", text: homeMsg }]);
      speak(homeMsg);
      setContext({ from: "", to: "", date: "tomorrow", time: "any", busType: "any", step: "start" });
    },
    onHoldStart: handleHold,
  });

  return (
    <Pressable
      style={styles.container}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessible
      accessibilityLabel="Home screen. Hold to speak."
    >
      <View style={styles.header}>
        <Text style={styles.title}>Bus Sahayak</Text>
        <Text style={styles.subtitle}>Hold bolna shuru karo</Text>
      </View>

      {isListening && (
        <View style={styles.listeningBanner}>
          <View style={styles.listeningDot} />
          <Text style={styles.listeningText}>Sun rahe hain...</Text>
        </View>
      )}

      <ScrollView
        ref={scrollRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
      >
        {messages.map((msg, i) => (
          <View
            key={i}
            style={[
              styles.bubble,
              msg.role === "user" ? styles.userBubble : styles.aiBubble,
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                msg.role === "user" ? styles.userText : styles.aiText,
              ]}
            >
              {msg.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.hints}>
        <View style={styles.hint}>
          <Text style={styles.hintIcon}>🎤</Text>
          <Text style={styles.hintText}>Hold to speak</Text>
        </View>
        <View style={styles.hint}>
          <Text style={styles.hintIcon}>👆</Text>
          <Text style={styles.hintText}>Double tap to select</Text>
        </View>
        <View style={styles.hint}>
          <Text style={styles.hintIcon}>🏠</Text>
          <Text style={styles.hintText}>Triple tap to go home</Text>
        </View>
      </View>
    </Pressable>
  );
}

function toDateLabel(date: string): string {
  if (date === "today") return "aaj";
  if (date === "tomorrow") return "kal";
  if (date === "day_after") return "parson";
  return date;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  header: { padding: 20, paddingTop: 50, alignItems: "center" },
  title: { fontSize: 28, fontWeight: "800", color: "#000000" },
  subtitle: { fontSize: 14, color: "#888888", marginTop: 4 },
  listeningBanner: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    padding: 8, backgroundColor: "#eff6ff", marginHorizontal: 16, borderRadius: 8,
  },
  listeningDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: "#2563eb",
    marginRight: 8,
  },
  listeningText: { fontSize: 14, color: "#2563eb", fontWeight: "600" },
  chatArea: { flex: 1, marginTop: 12 },
  chatContent: { padding: 16, gap: 8 },
  bubble: {
    maxWidth: "85%", padding: 14, borderRadius: 16, marginBottom: 4,
  },
  userBubble: {
    alignSelf: "flex-end", backgroundColor: "#2563eb",
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: "flex-start", backgroundColor: "#f3f4f6",
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontSize: 16, lineHeight: 22 },
  userText: { color: "#ffffff" },
  aiText: { color: "#000000" },
  hints: {
    padding: 12, backgroundColor: "#f9fafb", borderTopWidth: 1,
    borderTopColor: "#e5e7eb", flexDirection: "row", justifyContent: "space-around",
  },
  hint: { alignItems: "center" },
  hintIcon: { fontSize: 16 },
  hintText: { fontSize: 11, color: "#666666", marginTop: 4 },
});
