"use client";

import { useState, useEffect, useCallback } from "react";

function parseJSON<T>(value: string | null): T | undefined {
  try {
    return value === "undefined" ? undefined : JSON.parse(value ?? "");
  } catch {
    console.log("parsing error on", { value });
    return undefined;
  }
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          const parsedItem = parseJSON<T>(item);
          if (parsedItem !== undefined) {
            setStoredValue(parsedItem);
          }
        } else {
           window.localStorage.setItem(key, JSON.stringify(initialValue));
        }
      } catch (error) {
        console.warn(`Error reading localStorage key “${key}”:`, error);
      }
    }
  }, [key, initialValue]);


  const setValue = useCallback((value: T | ((val: T) => T)) => {
    if (typeof window === "undefined") {
        console.warn(`Tried setting localStorage key “${key}” even though environment is not a client`);
    }

    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}
