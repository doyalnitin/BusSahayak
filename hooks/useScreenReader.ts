import { useState, useEffect, useCallback } from "react";
import { AccessibilityInfo } from "react-native";

export function useScreenReader() {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(setIsEnabled);
    const sub = AccessibilityInfo.addEventListener(
      "screenReaderChanged",
      setIsEnabled
    );
    return () => sub.remove();
  }, []);

  return isEnabled;
}
