import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useVoiceInput } from "../hooks/useVoiceInput";
import { useVoiceOutput } from "../hooks/useVoiceOutput";
import { useAnnounce } from "../hooks/useAnnounce";
import { useGestures } from "../hooks/useGestures";
import { useBookingStore } from "../store/useBookingStore";
import { generateSeats } from "../services/mockData";
import { classifyIntent } from "../services/intentClassifier";
import StepIndicator from "../components/StepIndicator";

export default function SeatSelectionScreen() {
  const router = useRouter();
  const { selectedBus, toggleSeat, selectedSeats } = useBookingStore();
  const { speak } = useVoiceOutput();
  const { announce } = useAnnounce();
  const { startListening, stopListening, transcript, isListening } =
    useVoiceInput();
  const [seats, setSeats] = useState<any[]>([]);
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
      const available = seats.filter((s) => s.status === "available");
      const text = `${available.length} seats available. Say a seat number like 5L or 2M.`;
      speak(text);
    },
    onHoldEnd: () => {
      if (isListening) {
        stopListening();
        setShowListening(false);
      }
    },
  });

  useEffect(() => {
    if (selectedBus) {
      const generated = generateSeats(selectedBus.busCategory);
      setSeats(generated);
    }
  }, [selectedBus]);

  useEffect(() => {
    if (transcript && !isListening) {
      setShowListening(false);
      processVoiceInput(transcript);
    }
  }, [transcript, isListening]);

  const processVoiceInput = useCallback(
    (text: string) => {
      const { intent, entities } = classifyIntent(text);

      if (intent === "select_seat" && entities.seat) {
        const seatNum = entities.seat.toUpperCase();
        const seat = seats.find((s) => s.number === seatNum);
        if (seat && seat.status === "available") {
          toggleSeat(seat);
          speak(`Seat ${seatNum} selected`);
        } else if (seat) {
          speak(`Seat ${seatNum} is not available`);
        } else {
          speak(`Seat ${seatNum} not found`);
        }
      } else if (intent === "confirm") {
        if (selectedSeats.length > 0) {
          router.push("/booking" as any);
        } else {
          speak("Please select at least one seat");
        }
      } else if (intent === "go_home") {
        router.push("/home" as any);
      } else {
        speak("Say a seat number like 5L or 2M");
      }
    },
    [seats, selectedSeats, toggleSeat, speak, router]
  );

  const handleSeatPress = (seat: any) => {
    if (seat.status === "booked") return;
    toggleSeat(seat);
    speak(
      seat.status === "available"
        ? `Seat ${seat.number} selected`
        : `Seat ${seat.number} deselected`
    );
  };

  const upperDeck = seats.filter((s) => s.deck === "upper");
  const lowerDeck = seats.filter((s) => s.deck === "lower");

  return (
    <Pressable
      style={styles.container}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityLabel="Seat selection screen"
      accessibilityHint="Say seat number like 5L. Double tap to select."
    >
      <View style={styles.gestureBar}>
        <Text style={styles.gestureBarText}>
          Say seat number • Double tap to confirm
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
        <Text style={styles.navTitle}>Choose Seat</Text>
      </View>

      <StepIndicator currentStep={3} totalSteps={4} label="Seat" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.busInfo}>
          <Text style={styles.busInfoText}>
            {selectedBus?.operatorName || "Bus"} •{" "}
            {selectedBus?.departureTime || "00:00"}
          </Text>
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#22c55e" }]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#dc2626" }]} />
            <Text style={styles.legendText}>Booked</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#2563eb" }]} />
            <Text style={styles.legendText}>Selected</Text>
          </View>
        </View>

        <Text style={styles.deckLabel}>Upper Deck</Text>
        <View style={styles.seatGrid}>
          {upperDeck.map((seat) => (
            <Pressable
              key={seat.number}
              style={[
                styles.seatCell,
                seat.status === "available" && styles.seatAvailable,
                seat.status === "booked" && styles.seatBooked,
                seat.status === "ladies" && styles.seatLadies,
                selectedSeats.some((s) => s.number === seat.number) &&
                  styles.seatSelected,
              ]}
              onPress={() => handleSeatPress(seat)}
              accessibilityLabel={`Seat ${seat.number}. ${seat.position}. ${seat.status}.`}
              accessibilityHint={
                seat.status === "available"
                  ? "Double tap to select"
                  : "Not available"
              }
              accessibilityState={{ disabled: seat.status === "booked" }}
            >
              <Text
                style={[
                  styles.seatNum,
                  selectedSeats.some((s) => s.number === seat.number) &&
                    styles.seatNumSelected,
                ]}
              >
                {seat.number}
              </Text>
              <Text style={styles.seatPos}>{seat.position}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.deckLabel}>Lower Deck</Text>
        <View style={styles.seatGrid}>
          {lowerDeck.map((seat) => (
            <Pressable
              key={seat.number}
              style={[
                styles.seatCell,
                seat.status === "available" && styles.seatAvailable,
                seat.status === "booked" && styles.seatBooked,
                seat.status === "ladies" && styles.seatLadies,
                selectedSeats.some((s) => s.number === seat.number) &&
                  styles.seatSelected,
              ]}
              onPress={() => handleSeatPress(seat)}
              accessibilityLabel={`Seat ${seat.number}. ${seat.position}. ${seat.status}.`}
            >
              <Text
                style={[
                  styles.seatNum,
                  selectedSeats.some((s) => s.number === seat.number) &&
                    styles.seatNumSelected,
                ]}
              >
                {seat.number}
              </Text>
              <Text style={styles.seatPos}>{seat.position}</Text>
            </Pressable>
          ))}
        </View>

        {showListening && (
          <View style={styles.listeningCard}>
            <View style={styles.listeningIndicator}>
              <View style={styles.pulseRing} />
              <Text style={styles.listeningIcon}>🎤</Text>
            </View>
            <Text style={styles.listeningText}>Listening...</Text>
            <Text style={styles.listeningSub}>Say seat number like "5L"</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {selectedSeats.length > 0 ? (
          <View style={styles.selectedInfo}>
            <Text style={styles.selectedText}>
              Seat {selectedSeats.map((s) => s.number).join(", ")} selected •
              Total ₹{selectedSeats.reduce((sum, s) => sum + s.fare, 0)}
            </Text>
          </View>
        ) : (
          <Text style={styles.footerHint}>
            🎤 Say seat number like "5L" or "2M"
          </Text>
        )}
        <Pressable
          style={[
            styles.confirmBtn,
            selectedSeats.length === 0 && styles.confirmBtnDisabled,
          ]}
          onPress={() => {
            if (selectedSeats.length > 0) {
              speak(`${selectedSeats.length} seats selected. Confirming.`);
              router.push("/booking" as any);
            }
          }}
          accessibilityLabel="Confirm seats"
        >
          <Text style={styles.confirmBtnText}>Confirm Seats</Text>
        </Pressable>
      </View>
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
  scrollContent: { padding: 20, paddingBottom: 120 },
  busInfo: { marginBottom: 12 },
  busInfoText: { fontSize: 14, color: "#888888" },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 16,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: "#888888" },
  deckLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 8,
  },
  seatGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 16,
  },
  seatCell: {
    width: 70,
    height: 52,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  seatAvailable: { backgroundColor: "#f0fdf4", borderColor: "#22c55e" },
  seatBooked: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
    opacity: 0.5,
  },
  seatLadies: { backgroundColor: "#fdf2f8", borderColor: "#ec4899" },
  seatSelected: {
    backgroundColor: "#eff6ff",
    borderColor: "#2563eb",
    borderWidth: 3,
  },
  seatNum: { fontSize: 14, fontWeight: "700", color: "#000000" },
  seatNumSelected: { color: "#2563eb" },
  seatPos: { fontSize: 9, color: "#888888", marginTop: 2 },
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
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  selectedInfo: {
    padding: 12,
    backgroundColor: "#f0f4ff",
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
  },
  selectedText: { fontSize: 14, fontWeight: "600", color: "#2563eb" },
  footerHint: {
    fontSize: 14,
    color: "#888888",
    textAlign: "center",
    marginBottom: 12,
  },
  confirmBtn: {
    backgroundColor: "#2563eb",
    borderRadius: 14,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmBtnText: { fontSize: 17, fontWeight: "700", color: "#ffffff" },
});
