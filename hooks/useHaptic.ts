import { useCallback } from "react";

export function useHaptic() {
  const noop = useCallback(() => {}, []);

  return {
    light: noop,
    medium: noop,
    heavy: noop,
    success: noop,
    error: noop,
    warning: noop,
    selectionChanged: noop,
  };
}
