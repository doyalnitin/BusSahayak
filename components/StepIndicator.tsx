import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  label: string;
}

export default function StepIndicator({
  currentStep,
  totalSteps,
  label,
}: StepIndicatorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Step {currentStep} of {totalSteps}
      </Text>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.dots}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i < currentStep && styles.dotCompleted]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: "center",
  },
  text: { fontSize: 12, color: "#888888", fontWeight: "600" },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000000",
    marginTop: 4,
  },
  dots: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e5e7eb",
  },
  dotCompleted: { backgroundColor: "#2563eb" },
});
