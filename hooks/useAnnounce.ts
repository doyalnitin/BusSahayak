import { useCallback } from "react";
import { AccessibilityInfo, Platform } from "react-native";
import { A11y } from "../theme/accessibility";

export function useAnnounce() {
  const announce = useCallback((message: string, priority?: "polite" | "assertive") => {
    const delay =
      Platform.OS === "ios" ? A11y.announcementDelay.ios : A11y.announcementDelay.android;

    setTimeout(() => {
      AccessibilityInfo.announceForAccessibility(message);
    }, delay);
  }, []);

  const announceAfterDelay = useCallback(
    (message: string, delayMs: number = 1000) => {
      setTimeout(() => {
        AccessibilityInfo.announceForAccessibility(message);
      }, delayMs);
    },
    []
  );

  return { announce, announceAfterDelay };
}
