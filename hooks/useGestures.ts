import { useRef, useCallback } from 'react';

interface GestureConfig {
  onTripleTap?: () => void;
  onDoubleTap?: () => void;
  onHoldStart?: () => void;
  onHoldEnd?: () => void;
  holdDuration?: number;
  tapTimeout?: number;
  doubleTapGap?: number;
}

export function useGestures(config: GestureConfig) {
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHolding = useRef(false);
  const touchStart = useRef<number>(0);

  const {
    onTripleTap,
    onDoubleTap,
    onHoldStart,
    onHoldEnd,
    holdDuration = 800,
    tapTimeout = 300,
    doubleTapGap = 300,
  } = config;

  const handleTap = useCallback(() => {
    tapCount.current += 1;

    if (tapTimer.current) {
      clearTimeout(tapTimer.current);
    }

    if (tapCount.current === 3) {
      tapCount.current = 0;
      onTripleTap?.();
      return;
    }

    if (tapCount.current === 2) {
      tapCount.current = 0;
      onDoubleTap?.();
      return;
    }

    tapTimer.current = setTimeout(() => {
      tapCount.current = 0;
    }, tapTimeout);
  }, [onTripleTap, onDoubleTap, tapTimeout]);

  const handleTouchStart = useCallback(() => {
    touchStart.current = Date.now();
    isHolding.current = false;

    holdTimer.current = setTimeout(() => {
      isHolding.current = true;
      onHoldStart?.();
    }, holdDuration);
  }, [onHoldStart, holdDuration]);

  const handleTouchEnd = useCallback(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }

    const duration = Date.now() - touchStart.current;

    if (isHolding.current) {
      onHoldEnd?.();
      isHolding.current = false;
      return;
    }

    if (duration < 200) {
      handleTap();
    }
  }, [handleTap, onHoldEnd]);

  const handlePressIn = useCallback(() => {
    touchStart.current = Date.now();
    isHolding.current = false;

    holdTimer.current = setTimeout(() => {
      isHolding.current = true;
      onHoldStart?.();
    }, holdDuration);
  }, [onHoldStart, holdDuration]);

  const handlePressOut = useCallback(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }

    if (isHolding.current) {
      onHoldEnd?.();
      isHolding.current = false;
    }
  }, [onHoldEnd]);

  return {
    handleTouchStart,
    handleTouchEnd,
    handlePressIn,
    handlePressOut,
  };
}
