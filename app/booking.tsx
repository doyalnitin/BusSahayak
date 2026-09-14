import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useVoiceInput } from "../hooks/useVoiceInput";
import { useVoiceOutput } from "../hooks/useVoiceOutput";
import { useAnnounce } from "../hooks/useAnnounce";
import { useGestures } from "../hooks/useGestures";
import { useBookingStore } from "../store/useBookingStore";
import { mockBookingConfirm } from "../services/mockData";
import { classifyIntent } from "../services/intentClassifier";
import { readBookingConfirmation } from "../services/responseGenerator";
import StepIndicator from "../components/StepIndicator";

export default function BookingScreen() {
  const router = useRouter();
  const {
    selectedBus,
    selectedSeats,
    passengers,
    addPassenger,
    removePassenger,
    setPassengers,
    mobileNumber,
    setMobileNumber,
    setPnr,
    pnr,
  } = useBookingStore();
  const { speak } = useVoiceOutput();
  const { announce } = useAnnounce();
  const { startListening, stopListening, transcript, isListening } =
    useVoiceInput();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"M" | "F" | "O">("M");
  const [mobile, setMobile] = useState("");
  const [bookingStatus, setBookingStatus] = useState<
    "idle" | "pending" | "confirmed"
  >("idle");
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
      if (bookingStatus === "pending") {
        speak(
          "Booking is pending. Manager will call you shortly to confirm payment."
        );
      } else {
        speak(
          `Booking details. ${selectedBus?.operatorName || "Bus"}. Seat ${selectedSeats.map((s) => s.number).join(" and ")}. Total fare ${selectedSeats.reduce((sum, s) => sum + s.fare, 0)} rupees. Say confirm to book.`
        );
      }
    },
    onHoldEnd: () => {
      if (isListening) {
        stopListening();
        setShowListening(false);
      }
    },
  });

  useEffect(() => {
    if (transcript && !isListening) {
      setShowListening(false);
      const { intent } = classifyIntent(transcript);
      if (intent === "confirm") {
        handleConfirm();
      } else if (intent === "go_home") {
        router.push("/home" as any);
      }
    }
  }, [transcript, isListening]);

  const handleAddPassenger = () => {
    if (!name.trim() || !age.trim()) {
      speak("Please enter name and age");
      return;
    }
    addPassenger({ name: name.trim(), age: parseInt(age), gender });
    speak(`${name} added as passenger`);
    setName("");
    setAge("");
  };

  const handleConfirm = () => {
    if (passengers.length === 0) {
      speak("Please add at least one passenger");
      return;
    }
    if (!mobile.trim()) {
      speak("Please enter mobile number");
      return;
    }

    setMobileNumber(mobile);
    setBookingStatus("pending");
    speak(
      "Booking submitted. A manager will call you shortly to confirm payment. Please wait."
    );

    setTimeout(() => {
      const result = mockBookingConfirm();
      setPnr(result.pnr);
      setBookingStatus("confirmed");
      speak(
        readBookingConfirmation(
          result.pnr,
          selectedBus!,
          selectedSeats.map((s) => s.number),
          selectedSeats.reduce((sum, s) => sum + s.fare, 0)
        )
      );
      setTimeout(() => router.push("/tickets" as any), 2000);
    }, 3000);
  };

  const totalFare = selectedSeats.reduce((sum, s) => sum + s.fare, 0);

  if (bookingStatus === "confirmed") {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Text style={styles.successIconText}>✓</Text>
        </View>
        <Text style={styles.successTitle}>Booking Confirmed!</Text>
        <Text style={styles.successPnr}>PNR: {pnr}</Text>
        <Text style={styles.successSub}>
          Redirecting to your ticket...
        </Text>
      </View>
    );
  }

  return (
    <Pressable
      style={styles.container}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityLabel="Booking confirmation screen"
      accessibilityHint="Double tap to confirm. Triple tap to go home."
    >
      <View style={styles.gestureBar}>
        <Text style={styles.gestureBarText}>
          Hold to hear details • Say "confirm" to book
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
        <Text style={styles.navTitle}>Confirm Booking</Text>
      </View>

      <StepIndicator currentStep={4} totalSteps={4} label="Confirm" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <Text style={styles.cardLabel}>ROUTE</Text>
          <Text style={styles.cardValue}>
            {selectedBus?.boardingPoints[0]?.name || "Mumbai"} →{" "}
            {selectedBus?.droppingPoints[0]?.name || "Pune"}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>BUS</Text>
          <Text style={styles.cardValue}>
            {selectedBus?.operatorName || "Bus"} •{" "}
            {selectedBus?.busType || "Type"}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>SEATS</Text>
          <Text style={styles.cardValue}>
            {selectedSeats.map((s) => s.number).join(", ")}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>PASSENGERS</Text>
          {passengers.length === 0 ? (
            <Text style={styles.emptyText}>No passengers added</Text>
          ) : (
            passengers.map((p, i) => (
              <View key={i} style={styles.passengerRow}>
                <Text style={styles.passengerName}>
                  {p.name}, {p.age}yr, {p.gender}
                </Text>
                <Pressable
                  onPress={() => removePassenger(i)}
                  accessibilityLabel={`Remove ${p.name}`}
                >
                  <Text style={styles.removeBtn}>✕</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>

        <View style={styles.formCard}>
          <Text style={styles.cardLabel}>ADD PASSENGER</Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#cccccc"
            value={name}
            onChangeText={setName}
            accessibilityLabel="Passenger name"
          />
          <TextInput
            style={styles.input}
            placeholder="Age"
            placeholderTextColor="#cccccc"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            accessibilityLabel="Passenger age"
          />
          <View style={styles.genderRow}>
            {(["M", "F", "O"] as const).map((g) => (
              <Pressable
                key={g}
                style={[
                  styles.genderBtn,
                  gender === g && styles.genderBtnActive,
                ]}
                onPress={() => setGender(g)}
                accessibilityLabel={g === "M" ? "Male" : g === "F" ? "Female" : "Other"}
                accessibilityState={{ selected: gender === g }}
              >
                <Text
                  style={[
                    styles.genderBtnText,
                    gender === g && styles.genderBtnTextActive,
                  ]}
                >
                  {g}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            style={styles.addBtn}
            onPress={handleAddPassenger}
            accessibilityLabel="Add passenger"
          >
            <Text style={styles.addBtnText}>Add Passenger</Text>
          </Pressable>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.cardLabel}>MOBILE NUMBER</Text>
          <TextInput
            style={styles.input}
            placeholder="+91 Enter mobile number"
            placeholderTextColor="#cccccc"
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
            accessibilityLabel="Mobile number"
          />
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Fare</Text>
          <Text style={styles.totalValue}>₹{totalFare}</Text>
        </View>

        {showListening && (
          <View style={styles.listeningCard}>
            <Text style={styles.listeningIcon}>🎤</Text>
            <Text style={styles.listeningText}>Listening... Say "confirm"</Text>
          </View>
        )}

        <Pressable
          style={styles.confirmBtn}
          onPress={handleConfirm}
          accessibilityLabel="Confirm booking"
          accessibilityHint="Double tap to confirm and submit booking"
        >
          <Text style={styles.confirmBtnText}>Confirm Booking</Text>
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
  card: {
    backgroundColor: "#f9fafb",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#888888",
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardValue: { fontSize: 16, fontWeight: "600", color: "#000000" },
  emptyText: { fontSize: 14, color: "#cccccc" },
  passengerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  passengerName: { fontSize: 14, fontWeight: "600", color: "#000000" },
  removeBtn: { fontSize: 16, color: "#dc2626", padding: 4 },
  formCard: {
    backgroundColor: "#f9fafb",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 10,
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    fontWeight: "600",
    color: "#000000",
  },
  genderRow: { flexDirection: "row", gap: 8 },
  genderBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  genderBtnActive: { borderColor: "#2563eb", backgroundColor: "#eff6ff" },
  genderBtnText: { fontSize: 15, fontWeight: "600", color: "#888888" },
  genderBtnTextActive: { color: "#2563eb" },
  addBtn: {
    backgroundColor: "#f0f4ff",
    borderRadius: 10,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: { fontSize: 14, fontWeight: "700", color: "#2563eb" },
  totalCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9fafb",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    marginBottom: 12,
  },
  totalLabel: { fontSize: 16, fontWeight: "700", color: "#000000" },
  totalValue: { fontSize: 22, fontWeight: "900", color: "#2563eb" },
  listeningCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  listeningIcon: { fontSize: 18 },
  listeningText: { fontSize: 14, fontWeight: "600", color: "#2563eb" },
  confirmBtn: {
    backgroundColor: "#2563eb",
    borderRadius: 14,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnText: { fontSize: 17, fontWeight: "700", color: "#ffffff" },
  successContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0fdf4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successIconText: { fontSize: 36, color: "#16a34a" },
  successTitle: { fontSize: 24, fontWeight: "800", color: "#000000" },
  successPnr: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563eb",
    marginTop: 8,
  },
  successSub: { fontSize: 14, color: "#888888", marginTop: 8 },
});
