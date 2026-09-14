import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";

interface HighContrastButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  accessibilityLabel?: string;
}

export default function HighContrastButton({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  accessibilityLabel,
}: HighContrastButtonProps) {
  const getButtonStyle = () => {
    switch (variant) {
      case "primary":
        return { backgroundColor: disabled ? "#93b4f5" : "#2563eb" };
      case "secondary":
        return { backgroundColor: disabled ? "#cccccc" : "#333333" };
      case "danger":
        return { backgroundColor: disabled ? "#f5a5a5" : "#dc2626" };
    }
  };

  return (
    <Pressable
      style={[styles.button, getButtonStyle()]}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    minWidth: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  text: {
    fontSize: 17,
    fontWeight: "700",
    color: "#ffffff",
  },
});
