import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

interface VoiceButtonProps {
  onPress: () => void;
  isListening?: boolean;
  isLoading?: boolean;
  size?: "small" | "medium" | "large";
  label?: string;
}

export default function VoiceButton({
  onPress,
  isListening = false,
  isLoading = false,
  size = "medium",
  label,
}: VoiceButtonProps) {
  const getSize = () => {
    switch (size) {
      case "small": return 56;
      case "medium": return 80;
      case "large": return 100;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "small": return 20;
      case "medium": return 28;
      case "large": return 36;
    }
  };

  return (
    <View style={styles.container}>
      {isListening && <View style={[styles.pulse, { width: getSize() + 40, height: getSize() + 40, borderRadius: (getSize() + 40) / 2 }]} />}
      <Pressable
        style={[
          styles.button,
          {
            width: getSize(),
            height: getSize(),
            borderRadius: getSize() / 2,
          },
          isListening && styles.buttonListening,
        ]}
        onPress={onPress}
        disabled={isLoading}
        accessibilityLabel={isListening ? "Stop listening" : label || "Voice input"}
        accessibilityHint="Hold to speak"
        accessibilityRole="button"
      >
        <Text style={[styles.icon, { fontSize: getIconSize() }]}>
          {isLoading ? "..." : isListening ? "⏹" : "🎤"}
        </Text>
      </Pressable>
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: 8 },
  pulse: {
    position: "absolute",
    borderWidth: 3,
    borderColor: "#2563eb",
    opacity: 0.2,
  },
  button: {
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonListening: {
    backgroundColor: "#dc2626",
  },
  icon: { color: "#ffffff" },
  label: { fontSize: 12, color: "#888888", fontWeight: "500" },
});
