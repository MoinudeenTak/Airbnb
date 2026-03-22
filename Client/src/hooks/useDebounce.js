import { useEffect, useState } from "react";

/**
 * useDebounce
 * Delays updating the value until user stops changing it
 *
 * @param value - value to debounce
 * @param delay - delay in ms
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}