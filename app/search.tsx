import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { useVoiceInput } from "../hooks/useVoiceInput";
import { useVoiceOutput } from "../hooks/useVoiceOutput";
import { useAnnounce } from "../hooks/useAnnounce";
import { useGestures } from "../hooks/useGestures";
import { useBookingStore } from "../store/useBookingStore";
import { classifyIntent } from "../services/intentClassifier";
import { generateResponse } from "../services/responseGenerator";
import { searchCities } from "../services/cityData";
import StepIndicator from "../components/StepIndicator";

export default function SearchScreen() {
  const router = useRouter();
  const { from, to, setFrom, setTo, swapCities } = useBookingStore();
  const { speak } = useVoiceOutput();
  const { announce } = useAnnounce();
  const {
    startListening,
    stopListening,
    transcript,
    isListening,
    isAvailable,
  } = useVoiceInput();
  const [showListening, setShowListening] = useState(false);
  const [localFrom, setLocalFrom] = useState(from);
  const [localTo, setLocalTo] = useState(to);
  const [fromSuggestions, setFromSuggestions] = useState<
    { name: string; code: string; state: string }[]
  >([]);
  const [toSuggestions, setToSuggestions] = useState<
    { name: string; code: string; state: string }[]
  >([]);
  const [activeInput, setActiveInput] = useState<"from" | "to" | null>(null);

  const { handlePressIn, handlePressOut } = useGestures({
    onTripleTap: () => router.push("/home" as any),
    onHoldStart: () => {
      if (!isListening) {
        setShowListening(true);
        startListening();
        speak("Listening. Say where you want to travel.");
      }
    },
    onHoldEnd: () => {
      if (isListening) {
        stopListening();
      }
    },
  });

  useEffect(() => {
    if (transcript && !isListening && showListening) {
      setShowListening(false);
      processVoiceInput(transcript);
    }
  }, [transcript, isListening, showListening]);

  const processVoiceInput = useCallback(
    (text: string) => {
      const { intent, entities } = classifyIntent(text);
      const response = generateResponse(intent, {
        buses: [],
        entities,
        from: localFrom,
        to: localTo,
      });

      if (intent === "search_buses" && entities.from && entities.to) {
        setLocalFrom(entities.from);
        setLocalTo(entities.to);
        setFrom(entities.from);
        setTo(entities.to);
        speak(`Searching buses from ${entities.from} to ${entities.to}`);
        setTimeout(() => router.push("/results" as any), 1500);
      } else if (entities.from) {
        setLocalFrom(entities.from);
        setFrom(entities.from);
        speak(`From ${entities.from}. Now say the destination.`);
      } else if (entities.to) {
        setLocalTo(entities.to);
        setTo(entities.to);
        speak(`To ${entities.to}. Say search buses to find options.`);
      } else {
        speak(response);
      }
    },
    [localFrom, localTo, setFrom, setTo, speak, router]
  );

  const handleFromChange = (text: string) => {
    setLocalFrom(text);
    if (text.length > 1) {
      setFromSuggestions(searchCities(text));
      setActiveInput("from");
    } else {
      setFromSuggestions([]);
    }
  };

  const handleToChange = (text: string) => {
    setLocalTo(text);
    if (text.length > 1) {
      setToSuggestions(searchCities(text));
      setActiveInput("to");
    } else {
      setToSuggestions([]);
    }
  };

  const selectCity = (
    city: { name: string; code: string },
    type: "from" | "to"
  ) => {
    if (type === "from") {
      setLocalFrom(city.name);
      setFrom(city.name);
      setFromSuggestions([]);
    } else {
      setLocalTo(city.name);
      setTo(city.name);
      setToSuggestions([]);
    }
    setActiveInput(null);
    speak(`${city.name} selected`);
  };

  const handleSearch = () => {
    if (!localFrom || !localTo) {
      speak("Please enter both from and to cities");
      return;
    }
    setFrom(localFrom);
    setTo(localTo);
    speak(`Searching buses from ${localFrom} to ${localTo}`);
    router.push("/results" as any);
  };

  return (
    <Pressable
      style={styles.container}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityLabel="Search screen"
      accessibilityHint="Hold to use voice. Triple tap to go home."
    >
      <View style={styles.gestureBar}>
        <Text style={styles.gestureBarText}>
          Hold to speak • Triple tap to go home
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
        <Text style={styles.navTitle}>Search Buses</Text>
      </View>

      <StepIndicator currentStep={1} totalSteps={4} label="Search" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>FROM</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>📍</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter city"
                placeholderTextColor="#cccccc"
                value={localFrom}
                onChangeText={handleFromChange}
                onFocus={() => setActiveInput("from")}
                accessibilityLabel="From city"
              />
              {localFrom ? (
                <Pressable
                  onPress={() => {
                    setLocalFrom("");
                    setFrom("");
                  }}
                  accessibilityLabel="Clear"
                >
                  <Text style={styles.clearBtn}>✕</Text>
                </Pressable>
              ) : null}
            </View>
            {activeInput === "from" && fromSuggestions.length > 0 && (
              <View style={styles.suggestions}>
                {fromSuggestions.map((city) => (
                  <Pressable
                    key={city.code}
                    style={styles.suggestionItem}
                    onPress={() => selectCity(city, "from")}
                    accessibilityLabel={`${city.name}, ${city.state}`}
                  >
                    <Text style={styles.suggestionName}>{city.name}</Text>
                    <Text style={styles.suggestionState}>{city.state}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <Pressable
            style={styles.swapBtn}
            onPress={() => {
              swapCities();
              const temp = localFrom;
              setLocalFrom(localTo);
              setLocalTo(temp);
              speak("Cities swapped");
            }}
            accessibilityLabel="Swap cities"
          >
            <Text style={styles.swapIcon}>⇅</Text>
          </Pressable>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>TO</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>📍</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter city"
                placeholderTextColor="#cccccc"
                value={localTo}
                onChangeText={handleToChange}
                onFocus={() => setActiveInput("to")}
                accessibilityLabel="To city"
              />
              {localTo ? (
                <Pressable
                  onPress={() => {
                    setLocalTo("");
                    setTo("");
                  }}
                  accessibilityLabel="Clear"
                >
                  <Text style={styles.clearBtn}>✕</Text>
                </Pressable>
              ) : null}
            </View>
            {activeInput === "to" && toSuggestions.length > 0 && (
              <View style={styles.suggestions}>
                {toSuggestions.map((city) => (
                  <Pressable
                    key={city.code}
                    style={styles.suggestionItem}
                    onPress={() => selectCity(city, "to")}
                    accessibilityLabel={`${city.name}, ${city.state}`}
                  >
                    <Text style={styles.suggestionName}>{city.name}</Text>
                    <Text style={styles.suggestionState}>{city.state}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>DATE</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>📅</Text>
              <TextInput
                style={styles.input}
                value="Tomorrow"
                editable={false}
                accessibilityLabel="Travel date: Tomorrow"
              />
            </View>
          </View>
        </View>

        <View style={styles.locationGuide}>
          <Text style={styles.locationGuideIcon}>🔍</Text>
          <Text style={styles.locationGuideTitle}>Search Your Location</Text>
          <Text style={styles.locationGuideHint}>
            Type or speak your departure and destination city above
          </Text>
          <View style={styles.popularCities}>
            <Text style={styles.popularLabel}>Popular Cities</Text>
            <View style={styles.popularRow}>
              {["Mumbai", "Delhi", "Bangalore", "Pune", "Goa"].map((city) => (
                <Pressable
                  key={city}
                  style={styles.popularChip}
                  onPress={() => {
                    if (!localFrom) {
                      setLocalFrom(city);
                      setFrom(city);
                      speak(`${city} selected as departure`);
                    } else if (!localTo) {
                      setLocalTo(city);
                      setTo(city);
                      speak(`${city} selected as destination`);
                    }
                  }}
                  accessibilityLabel={`Select ${city}`}
                >
                  <Text style={styles.popularChipText}>{city}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.voiceSection}>
          <Text style={styles.voiceLabel}>Or use voice command</Text>
          <View style={styles.voiceBox}>
            {showListening ? (
              <View style={styles.listeningIndicator}>
                <View style={styles.pulseRing} />
                <View style={styles.pulseRingOuter} />
                <Text style={styles.listeningIcon}>🎤</Text>
              </View>
            ) : (
              <Text style={styles.micIcon}>🎤</Text>
            )}
            <Text style={styles.voiceStatus}>
              {showListening
                ? "Listening... release to stop"
                : "Hold screen to speak"}
            </Text>
            {transcript ? (
              <Text style={styles.transcript}>"{transcript}"</Text>
            ) : null}
          </View>
        </View>

        <Pressable
          style={[
            styles.searchBtn,
            (!localFrom || !localTo) && styles.searchBtnDisabled,
          ]}
          onPress={handleSearch}
          accessibilityLabel="Search Buses"
          accessibilityHint="Double tap to search for buses"
        >
          <Text style={styles.searchBtnText}>Search Buses</Text>
        </Pressable>
      </ScrollView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
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
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  form: { gap: 16 },
  inputGroup: { gap: 6 },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#888888",
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: { fontSize: 18, marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  clearBtn: { fontSize: 18, color: "#cccccc", padding: 4 },
  swapBtn: {
    alignSelf: "center",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f4ff",
    alignItems: "center",
    justifyContent: "center",
  },
  swapIcon: { fontSize: 20, color: "#2563eb" },
  suggestions: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    marginTop: 4,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  suggestionName: { fontSize: 15, fontWeight: "600", color: "#000000" },
  suggestionState: { fontSize: 12, color: "#888888", marginTop: 2 },
  voiceSection: { marginTop: 24, alignItems: "center" },
  locationGuide: {
    marginTop: 20,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f0f4ff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  locationGuideIcon: { fontSize: 36, marginBottom: 8 },
  locationGuideTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: 4,
  },
  locationGuideHint: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 16,
  },
  popularCities: { width: "100%" },
  popularLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  popularRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  popularChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  popularChipText: { fontSize: 13, fontWeight: "600", color: "#374151" },
  voiceLabel: { fontSize: 13, color: "#888888", marginBottom: 12 },
  voiceBox: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    width: "100%",
  },
  micIcon: { fontSize: 32, marginBottom: 8 },
  listeningIndicator: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  pulseRing: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#2563eb",
    opacity: 0.2,
  },
  pulseRingOuter: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#2563eb",
    opacity: 0.1,
  },
  listeningIcon: { fontSize: 32 },
  voiceStatus: { fontSize: 14, color: "#888888", fontWeight: "500" },
  transcript: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "600",
    marginTop: 8,
  },
  searchBtn: {
    marginTop: 24,
    backgroundColor: "#2563eb",
    borderRadius: 14,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBtnDisabled: { opacity: 0.4 },
  searchBtnText: { fontSize: 17, fontWeight: "700", color: "#ffffff" },
});
