import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useVoiceOutput } from "../hooks/useVoiceOutput";
import { useAnnounce } from "../hooks/useAnnounce";
import { useGestures } from "../hooks/useGestures";

const steps = [
  {
    title: "Welcome to BusSahayak",
    subtitle: "Voice-first bus booking for everyone",
    description:
      "BusSahayak helps blind and visually impaired users book bus tickets using voice commands. No complicated screens, just your voice.",
    icon: "🚌",
  },
  {
    title: "Voice Commands",
    subtitle: "Speak to search and book",
    description:
      "Hold the screen to activate voice. Say where you want to go. Say a number to select a bus. It is that simple.",
    icon: "🎤",
  },
  {
    title: "Getting Started",
    subtitle: "Simple gestures to navigate",
    description:
      "Hold screen to use voice. Double tap to select. Triple tap to go home. Say a number to choose options.",
    icon: "👆",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { speak } = useVoiceOutput();
  const { announce } = useAnnounce();
  const [step, setStep] = useState(0);

  const { handlePressIn, handlePressOut } = useGestures({
    onTripleTap: () => {
      router.push("/home" as any);
    },
    onHoldStart: () => {
      speak(steps[step].description);
    },
  });

  useEffect(() => {
    announce(steps[step].title);
    const timer = setTimeout(() => {
      speak(steps[step].description);
    }, 500);
    return () => clearTimeout(timer);
  }, [step]);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      router.push("/home" as any);
    }
  };

  const handleSkip = () => {
    router.push("/home" as any);
  };

  return (
    <Pressable
      style={styles.container}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityLabel={`Onboarding step ${step + 1} of ${steps.length}`}
      accessibilityHint="Triple tap to skip. Hold to hear instructions."
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{steps[step].icon}</Text>
        </View>

        <Text style={styles.title}>{steps[step].title}</Text>
        <Text style={styles.subtitle}>{steps[step].subtitle}</Text>
        <Text style={styles.description}>{steps[step].description}</Text>

        <View style={styles.dots}>
          {steps.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === step && styles.dotActive]}
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={styles.skipBtn}
          onPress={handleSkip}
          accessibilityLabel="Skip onboarding"
        >
          <Text style={styles.skipBtnText}>Skip</Text>
        </Pressable>

        <Pressable
          style={styles.nextBtn}
          onPress={handleNext}
          accessibilityLabel={
            step < steps.length - 1 ? "Next step" : "Get started"
          }
        >
          <Text style={styles.nextBtnText}>
            {step < steps.length - 1 ? "Next" : "Get Started"}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f4ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  icon: { fontSize: 48 },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#000000",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563eb",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: "#888888",
    textAlign: "center",
    lineHeight: 22,
  },
  dots: {
    flexDirection: "row",
    gap: 8,
    marginTop: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e5e7eb",
  },
  dotActive: { backgroundColor: "#2563eb", width: 24 },
  footer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  skipBtn: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  skipBtnText: { fontSize: 16, fontWeight: "700", color: "#888888" },
  nextBtn: {
    flex: 2,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  nextBtnText: { fontSize: 17, fontWeight: "700", color: "#ffffff" },
});
