import React, { useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useVoiceOutput } from "../hooks/useVoiceOutput";
import { useAnnounce } from "../hooks/useAnnounce";
import { useGestures } from "../hooks/useGestures";
import { useBookingStore } from "../store/useBookingStore";

export default function TicketsScreen() {
  const router = useRouter();
  const { selectedBus, selectedSeats, pnr, mobileNumber, reset } =
    useBookingStore();
  const { speak } = useVoiceOutput();
  const { announce } = useAnnounce();

  const { handlePressIn, handlePressOut } = useGestures({
    onTripleTap: () => router.push("/home" as any),
    onHoldStart: () => {
      if (pnr) {
        speak(
          `Ticket details. PNR ${pnr}. ${selectedBus?.operatorName || "Bus"}. Seat ${selectedSeats.map((s) => s.number).join(" and ")}. Total fare ${selectedSeats.reduce((sum, s) => sum + s.fare, 0)} rupees. You will receive a confirmation call shortly.`
        );
      } else {
        speak("No booking found. Say search buses to book a ticket.");
      }
    },
  });

  useEffect(() => {
    announce("Tickets screen");
  }, []);

  if (!pnr) {
    return (
      <View style={styles.container}>
        <View style={styles.gestureBar}>
          <Text style={styles.gestureBarText}>Triple tap to go home</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎫</Text>
          <Text style={styles.emptyTitle}>No Bookings Yet</Text>
          <Text style={styles.emptySub}>
            Search and book a bus to see your ticket here
          </Text>
          <Pressable
            style={styles.searchBtn}
            onPress={() => router.push("/search" as any)}
            accessibilityLabel="Search Buses"
          >
            <Text style={styles.searchBtnText}>Search Buses</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const totalFare = selectedSeats.reduce((sum, s) => sum + s.fare, 0);

  return (
    <Pressable
      style={styles.container}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityLabel="Ticket details screen"
      accessibilityHint="Hold to hear ticket details. Triple tap to go home."
    >
      <View style={styles.gestureBar}>
        <Text style={styles.gestureBarText}>
          Hold to hear ticket details
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.successBanner}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successText}>Booking Confirmed</Text>
        </View>

        <View style={styles.ticketCard}>
          <View style={styles.ticketHeader}>
            <Text style={styles.ticketLabel}>PNR</Text>
            <Text style={styles.ticketPnr}>{pnr}</Text>
          </View>

          <View style={styles.ticketDivider} />

          <View style={styles.ticketRow}>
            <Text style={styles.ticketKey}>Route</Text>
            <Text style={styles.ticketVal}>
              {selectedBus?.boardingPoints[0]?.name || "Mumbai"} →{" "}
              {selectedBus?.droppingPoints[0]?.name || "Pune"}
            </Text>
          </View>
          <View style={styles.ticketRow}>
            <Text style={styles.ticketKey}>Bus</Text>
            <Text style={styles.ticketVal}>
              {selectedBus?.operatorName || "Bus"}
            </Text>
          </View>
          <View style={styles.ticketRow}>
            <Text style={styles.ticketKey}>Type</Text>
            <Text style={styles.ticketVal}>
              {selectedBus?.busType || "Type"}
            </Text>
          </View>
          <View style={styles.ticketRow}>
            <Text style={styles.ticketKey}>Time</Text>
            <Text style={styles.ticketVal}>
              {selectedBus?.departureTime || "00:00"} →{" "}
              {selectedBus?.arrivalTime || "00:00"}
            </Text>
          </View>
          <View style={styles.ticketRow}>
            <Text style={styles.ticketKey}>Seats</Text>
            <Text style={styles.ticketVal}>
              {selectedSeats.map((s) => s.number).join(", ")}
            </Text>
          </View>
          <View style={styles.ticketRow}>
            <Text style={styles.ticketKey}>Passengers</Text>
            <Text style={styles.ticketVal}>
              {selectedSeats.length} passenger(s)
            </Text>
          </View>
          <View style={styles.ticketRow}>
            <Text style={styles.ticketKey}>Mobile</Text>
            <Text style={styles.ticketVal}>{mobileNumber || "Not provided"}</Text>
          </View>

          <View style={styles.ticketDivider} />

          <View style={styles.ticketTotal}>
            <Text style={styles.ticketTotalLabel}>Total Paid</Text>
            <Text style={styles.ticketTotalValue}>₹{totalFare}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>📞</Text>
          <Text style={styles.infoText}>
            A manager will call you shortly to confirm your booking and collect
            payment. Please keep your phone nearby.
          </Text>
        </View>

        <Pressable
          style={styles.readBtn}
          onPress={() => {
            speak(
              `Ticket PNR ${pnr}. ${selectedBus?.operatorName}. Seat ${selectedSeats.map((s) => s.number).join(" and ")}. Total ${totalFare} rupees.`
            );
          }}
          accessibilityLabel="Read ticket details"
        >
          <Text style={styles.readBtnText}>Read Ticket Details</Text>
        </Pressable>

        <Pressable
          style={styles.bookAgainBtn}
          onPress={() => {
            reset();
            router.push("/home" as any);
          }}
          accessibilityLabel="Book another ticket"
        >
          <Text style={styles.bookAgainBtnText}>Book Another Ticket</Text>
        </Pressable>
      </ScrollView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  gestureBar: { padding: 10, backgroundColor: "#f0f4ff", alignItems: "center" },
  gestureBarText: { fontSize: 12, fontWeight: "600", color: "#2563eb" },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: "800", color: "#000000" },
  emptySub: {
    fontSize: 14,
    color: "#888888",
    marginTop: 8,
    textAlign: "center",
  },
  searchBtn: {
    marginTop: 24,
    backgroundColor: "#2563eb",
    borderRadius: 14,
    height: 56,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBtnText: { fontSize: 17, fontWeight: "700", color: "#ffffff" },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    marginBottom: 16,
  },
  successIcon: { fontSize: 20, color: "#16a34a" },
  successText: { fontSize: 16, fontWeight: "700", color: "#16a34a" },
  ticketCard: {
    backgroundColor: "#f9fafb",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  ticketHeader: { alignItems: "center", marginBottom: 12 },
  ticketLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#888888",
    letterSpacing: 1,
  },
  ticketPnr: { fontSize: 20, fontWeight: "800", color: "#2563eb", marginTop: 4 },
  ticketDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 12,
  },
  ticketRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  ticketKey: { fontSize: 14, color: "#888888" },
  ticketVal: { fontSize: 14, fontWeight: "600", color: "#000000" },
  ticketTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ticketTotalLabel: { fontSize: 16, fontWeight: "700", color: "#000000" },
  ticketTotalValue: { fontSize: 22, fontWeight: "900", color: "#2563eb" },
  infoCard: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fde68a",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  infoIcon: { fontSize: 18 },
  infoText: { flex: 1, fontSize: 13, color: "#92400e", lineHeight: 18 },
  readBtn: {
    backgroundColor: "#f0f4ff",
    borderRadius: 14,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#2563eb",
  },
  readBtnText: { fontSize: 17, fontWeight: "700", color: "#2563eb" },
  bookAgainBtn: {
    backgroundColor: "#2563eb",
    borderRadius: 14,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  bookAgainBtnText: { fontSize: 17, fontWeight: "700", color: "#ffffff" },
});
