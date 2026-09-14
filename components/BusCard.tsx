import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

interface BusCardProps {
  bus: {
    id: string;
    operatorName: string;
    busType: string;
    busCategory: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    availableSeats: number;
    fare: number;
    rating: number;
    boardingPoints: string[];
    droppingPoints: string[];
  };
  onPress: () => void;
}

export default function BusCard({ bus, onPress }: BusCardProps) {
  const getCategoryColor = () => {
    switch (bus.busCategory) {
      case "AC": return "#2563eb";
      case "SLEEPER": return "#7c3aed";
      case "SEATER": return "#16a34a";
      case "VOLVO": return "#d97706";
      default: return "#888888";
    }
  };

  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      accessibilityLabel={`${bus.operatorName}. ${bus.busType}. ${bus.busCategory}. Departs ${bus.departureTime}. Arrives ${bus.arrivalTime}. ${bus.duration}. ${bus.availableSeats} seats available. ${bus.fare} rupees.`}
      accessibilityHint="Double tap to select this bus"
    >
      <View style={styles.header}>
        <Text style={styles.operator}>{bus.operatorName}</Text>
        <View
          style={[styles.badge, { backgroundColor: getCategoryColor() + "15" }]}
        >
          <Text style={[styles.badgeText, { color: getCategoryColor() }]}>
            {bus.busCategory}
          </Text>
        </View>
      </View>

      <Text style={styles.busType}>{bus.busType}</Text>

      <View style={styles.timeRow}>
        <View>
          <Text style={styles.time}>{bus.departureTime}</Text>
          <Text style={styles.point}>{bus.boardingPoints[0]}</Text>
        </View>
        <View style={styles.durationContainer}>
          <Text style={styles.duration}>{bus.duration}</Text>
          <View style={styles.durationLine} />
        </View>
        <View>
          <Text style={styles.time}>{bus.arrivalTime}</Text>
          <Text style={styles.point}>{bus.droppingPoints[0]}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.seats}>{bus.availableSeats} seats left</Text>
        <Text style={styles.fare}>₹{bus.fare}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f9fafb",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  operator: { fontSize: 17, fontWeight: "700", color: "#000000" },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: { fontSize: 11, fontWeight: "700" },
  busType: { fontSize: 13, color: "#888888", marginTop: 4 },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
  },
  time: { fontSize: 18, fontWeight: "800", color: "#000000" },
  point: { fontSize: 11, color: "#888888", marginTop: 2 },
  durationContainer: { alignItems: "center", flex: 1, paddingHorizontal: 12 },
  duration: { fontSize: 12, color: "#888888", fontWeight: "600" },
  durationLine: {
    height: 1,
    backgroundColor: "#e5e7eb",
    width: "100%",
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 12,
  },
  seats: { fontSize: 13, color: "#16a34a", fontWeight: "600" },
  fare: { fontSize: 20, fontWeight: "900", color: "#000000" },
});
