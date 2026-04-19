
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

/**
 * A hook that works like useState but persists the value to localStorage
 * and synchronizes across all components in the same window.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Load initial value
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

  // Synchronize state across different components in the same window
  useEffect(() => {
    const handleSync = (event: Event | StorageEvent) => {
      // If it's a real 'storage' event, check if the key matches
      if (event instanceof StorageEvent && event.key !== key) return;
      
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsedItem = parseJSON<T>(item);
        if (parsedItem !== undefined) {
          setStoredValue(parsedItem);
        }
      }
    };

    window.addEventListener("storage", handleSync);
    window.addEventListener(`local-storage-update-${key}`, handleSync);
    
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener(`local-storage-update-${key}`, handleSync);
    };
  }, [key]);


  const setValue = useCallback((value: T | ((val: T) => T)) => {
    if (typeof window === "undefined") {
        console.warn(`Tried setting localStorage key “${key}” even though environment is not a client`);
    }

    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      
      // Dispatch a custom event to notify other instances of useLocalStorage with the same key
      window.dispatchEvent(new CustomEvent(`local-storage-update-${key}`));
    } catch (error) {
      console.log(error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}
