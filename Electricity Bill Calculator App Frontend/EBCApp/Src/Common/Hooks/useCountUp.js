import { useEffect, useRef, useState } from "react";
import { Animated, Easing } from "react-native";

/**
 * Animates a number from 0 up to `target` with an ease-out curve.
 * Returns the current animated value (rounded) as a plain number,
 * ready to be formatted and rendered.
 *
 * @param {number} target — the final value to count up to
 * @param {number} duration — ms
 * @returns {number} the current (interpolated) value
 */
export const useCountUp = (target, duration = 1200) => {
  const [displayValue, setDisplayValue] = useState(0);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const listenerId = useRef(null);

  useEffect(() => {
    // Reset for the new target
    animatedValue.setValue(0);
    setDisplayValue(0);

    // Attach a listener that mirrors the animated value into React state
    listenerId.current = animatedValue.addListener(({ value }) => {
      setDisplayValue(Math.round(value));
    });

    // Run the count-up
    Animated.timing(animatedValue, {
      toValue: target ?? 0,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // ← REQUIRED: listeners need JS-driven values
    }).start();

    return () => {
      if (listenerId.current != null) {
        animatedValue.removeListener(listenerId.current);
        listenerId.current = null;
      }
      animatedValue.stopAnimation();
    };
  }, [target, duration, animatedValue]);

  return displayValue;
};

export default useCountUp;
