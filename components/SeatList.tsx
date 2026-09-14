import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { SeatInfo } from "../store/useBookingStore";

interface SeatListProps {
  seats: SeatInfo[];
  selectedSeats: SeatInfo[];
  onSeatPress: (seat: SeatInfo) => void;
}

export default function SeatList({
  seats,
  selectedSeats,
  onSeatPress,
}: SeatListProps) {
  const upperDeck = seats.filter((s) => s.deck === "upper");
  const lowerDeck = seats.filter((s) => s.deck === "lower");

  const getSeatStyle = (seat: SeatInfo) => {
    if (selectedSeats.some((s) => s.number === seat.number)) {
      return styles.seatSelected;
    }
    if (seat.status === "booked") return styles.seatBooked;
    if (seat.status === "ladies") return styles.seatLadies;
    return styles.seatAvailable;
  };

  const renderSeat = (seat: SeatInfo) => (
    <Pressable
      key={seat.number}
      style={[styles.seatCell, getSeatStyle(seat)]}
      onPress={() => onSeatPress(seat)}
      disabled={seat.status === "booked"}
      accessibilityLabel={`Seat ${seat.number}. ${seat.position}. ${seat.status === "booked" ? "Booked" : seat.status === "ladies" ? "Ladies seat" : "Available"}. ${seat.fare} rupees.`}
      accessibilityHint={
        seat.status === "available" || seat.status === "ladies"
          ? "Double tap to select"
          : "Not available"
      }
      accessibilityState={{
        disabled: seat.status === "booked",
        selected: selectedSeats.some((s) => s.number === seat.number),
      }}
    >
      <Text
        style={[
          styles.seatNum,
          selectedSeats.some((s) => s.number === seat.number) &&
            styles.seatNumSelected,
          seat.status === "booked" && styles.seatNumBooked,
        ]}
      >
        {seat.number}
      </Text>
      <Text style={styles.seatPos}>{seat.position}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
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
          <View style={[styles.legendDot, { backgroundColor: "#ec4899" }]} />
          <Text style={styles.legendText}>Ladies</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#2563eb" }]} />
          <Text style={styles.legendText}>Selected</Text>
        </View>
      </View>

      {upperDeck.length > 0 && (
        <>
          <Text style={styles.deckLabel}>Upper Deck</Text>
          <View style={styles.seatGrid}>{upperDeck.map(renderSeat)}</View>
        </>
      )}

      {lowerDeck.length > 0 && (
        <>
          <Text style={styles.deckLabel}>Lower Deck</Text>
          <View style={styles.seatGrid}>{lowerDeck.map(renderSeat)}</View>
        </>
      )}

      {selectedSeats.length > 0 && (
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            Seats: {selectedSeats.map((s) => s.number).join(", ")} • Total: ₹
            {selectedSeats.reduce((sum, s) => sum + s.fare, 0)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: "#888888" },
  deckLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000000",
  },
  seatGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
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
  seatNumBooked: { color: "#dc2626" },
  seatPos: { fontSize: 9, color: "#888888", marginTop: 2 },
  summary: {
    padding: 12,
    backgroundColor: "#f0f4ff",
    borderRadius: 10,
    alignItems: "center",
  },
  summaryText: { fontSize: 14, fontWeight: "600", color: "#2563eb" },
});
