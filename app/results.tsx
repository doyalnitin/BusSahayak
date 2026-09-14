import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useVoiceInput } from "../hooks/useVoiceInput";
import { useVoiceOutput } from "../hooks/useVoiceOutput";
import { useAnnounce } from "../hooks/useAnnounce";
import { useGestures } from "../hooks/useGestures";
import { useBookingStore } from "../store/useBookingStore";
import { mockSearchResults } from "../services/mockData";
import { classifyIntent } from "../services/intentClassifier";
import { generateResponse } from "../services/responseGenerator";
import StepIndicator from "../components/StepIndicator";

export default function ResultsScreen() {
  const router = useRouter();
  const { from, to, selectBus } = useBookingStore();
  const { speak, isSpeaking } = useVoiceOutput();
  const { announce } = useAnnounce();
  const { startListening, stopListening, transcript, isListening } =
    useVoiceInput();
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showListening, setShowListening] = useState(false);

  const { handlePressIn, handlePressOut } = useGestures({
    onTripleTap: () => router.push("/home" as any),
    onDoubleTap: () => {
      if (!isListening) {
        setShowListening(true);
        startListening();
      }
    },
    onHoldStart: () => {
      speak(readBusList());
    },
    onHoldEnd: () => {
      if (isListening) {
        stopListening();
        setShowListening(false);
      }
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      const results = mockSearchResults(from || "Mumbai", to || "Pune");
      setBuses(results);
      setLoading(false);
      speak(`Found ${results.length} buses from ${from || "Mumbai"} to ${to || "Pune"}. Say a number to select.`);
    }, 1500);
    return () => clearTimeout(timer);
  }, [from, to]);

  useEffect(() => {
    if (transcript && !isListening) {
      setShowListening(false);
      processVoiceInput(transcript);
    }
  }, [transcript, isListening]);

  const processVoiceInput = useCallback(
    (text: string) => {
      const { intent, entities } = classifyIntent(text);

      if (intent === "select_number" || intent === "select_bus") {
        const idx = (entities.number || 1) - 1;
        if (idx >= 0 && idx < buses.length) {
          handleSelectBus(idx);
        } else {
          speak(`Invalid selection. Say a number between 1 and ${buses.length}.`);
        }
      } else if (intent === "read_results") {
        speak(readBusList());
      } else if (intent === "go_home") {
        router.push("/home" as any);
      } else if (intent === "go_back") {
        router.back();
      } else {
        const response = generateResponse(intent, { buses });
        speak(response);
      }
    },
    [buses, speak, router]
  );

  const readBusList = (): string => {
    if (buses.length === 0) return "No buses found.";
    let text = `Found ${buses.length} buses. `;
    buses.slice(0, 5).forEach((bus, i) => {
      text += `Bus ${i + 1}: ${bus.operatorName}, ${bus.busType}, ${bus.fare} rupees. `;
    });
    text += "Say a number to select.";
    return text;
  };

  const handleSelectBus = (index: number) => {
    const bus = buses[index];
    selectBus(bus);
    speak(`Selected ${bus.operatorName}. ${bus.busType}. ${bus.fare} rupees.`);
    announce(`Selected ${bus.operatorName}`);
    setTimeout(() => router.push("/seat-selection" as any), 1000);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "AC": return "#2563eb";
      case "SLEEPER": return "#7c3aed";
      case "SEATER": return "#16a34a";
      case "VOLVO": return "#d97706";
      default: return "#888888";
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingPulse} />
        <Text style={styles.loadingText}>Searching buses...</Text>
        <Text style={styles.loadingSub}>
          {from || "Mumbai"} → {to || "Pune"}
        </Text>
      </View>
    );
  }

  return (
    <Pressable
      style={styles.container}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityLabel="Results screen"
      accessibilityHint="Say a number to select a bus. Hold to hear results."
    >
      <View style={styles.gestureBar}>
        <Text style={styles.gestureBarText}>
          Say number to select • Hold to hear results
        </Text>
      </View>

      <View style={styles.navBar}>
        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.navTitle}>
          {from || "Mumbai"} → {to || "Pune"}
        </Text>
      </View>

      <StepIndicator currentStep={2} totalSteps={4} label="Results" />

      <View style={styles.resultCount}>
        <Text style={styles.resultCountText}>
          {buses.length} buses found
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {buses.map((bus, index) => (
          <Pressable
            key={bus.id}
            style={styles.resultCard}
            onPress={() => handleSelectBus(index)}
            accessibilityLabel={`Bus ${index + 1}. ${bus.operatorName}. ${bus.busType}. ${bus.fare} rupees. ${bus.availableSeats} seats available.`}
            accessibilityHint="Double tap to select this bus"
          >
            <View style={styles.resultNum}>
              <Text style={styles.resultNumText}>{index + 1}</Text>
            </View>
            <View style={styles.resultInfo}>
              <Text style={styles.resultName}>{bus.operatorName}</Text>
              <Text style={styles.resultType}>{bus.busType}</Text>
              <View style={styles.resultMeta}>
                <Text style={styles.resultTime}>🕐 {bus.departureTime}</Text>
                <Text style={styles.resultDuration}>{bus.duration}</Text>
              </View>
            </View>
            <View style={styles.resultRight}>
              <Text style={styles.resultFare}>₹{bus.fare}</Text>
              <Text style={styles.resultSeats}>{bus.availableSeats} seats</Text>
            </View>
          </Pressable>
        ))}

        {showListening && (
          <View style={styles.listeningCard}>
            <View style={styles.listeningIndicator}>
              <View style={styles.pulseRing} />
              <Text style={styles.listeningIcon}>🎤</Text>
            </View>
            <Text style={styles.listeningText}>Listening...</Text>
            <Text style={styles.listeningSub}>Say a number to select</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerHint}>
          🎤 Say "1", "2" or "3" to select a bus
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingPulse: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#eff6ff",
    marginBottom: 20,
  },
  loadingText: { fontSize: 20, fontWeight: "700", color: "#000000" },
  loadingSub: { fontSize: 14, color: "#888888", marginTop: 4 },
  gestureBar: { padding: 10, backgroundColor: "#f0f4ff", alignItems: "center" },
  gestureBarText: { fontSize: 12, fontWeight: "600", color: "#2563eb" },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: { fontSize: 18, color: "#000000" },
  navTitle: { fontSize: 20, fontWeight: "700", color: "#000000" },
  resultCount: { paddingHorizontal: 20, marginBottom: 8 },
  resultCountText: { fontSize: 13, color: "#888888" },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  resultCard: {
    flexDirection: "row",
    gap: 14,
    padding: 16,
    backgroundColor: "#f9fafb",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    marginBottom: 10,
    alignItems: "center",
  },
  resultNum: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  resultNumText: { fontSize: 18, fontWeight: "800", color: "#ffffff" },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 16, fontWeight: "700", color: "#000000" },
  resultType: { fontSize: 12, color: "#888888", marginTop: 2 },
  resultMeta: { flexDirection: "row", gap: 12, marginTop: 6 },
  resultTime: { fontSize: 13, color: "#555555", fontWeight: "600" },
  resultDuration: { fontSize: 13, color: "#555555" },
  resultRight: { alignItems: "flex-end" },
  resultFare: { fontSize: 16, fontWeight: "800", color: "#000000" },
  resultSeats: { fontSize: 11, color: "#16a34a", fontWeight: "600" },
  listeningCard: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    marginTop: 10,
  },
  listeningIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  pulseRing: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#2563eb",
    opacity: 0.2,
  },
  listeningIcon: { fontSize: 24 },
  listeningText: { fontSize: 16, fontWeight: "700", color: "#000000" },
  listeningSub: { fontSize: 13, color: "#888888" },
  footer: {
    padding: 14,
    backgroundColor: "#eff6ff",
    alignItems: "center",
  },
  footerHint: { fontSize: 14, color: "#2563eb", fontWeight: "600" },
});
