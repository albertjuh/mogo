"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "kb-sidebar-collapsed";

/** Persists the desktop sidebar's collapsed/expanded state across reloads. */
export function useSidebarCollapsed() {
  const [collapsed, setCollapsedState] = useState(false);

  useEffect(() => {
    try {
      setCollapsedState(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      // ignore
    }
  }, []);

  const setCollapsed = useCallback((value: boolean) => {
    setCollapsedState(value);
    try {
      localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    } catch {
      // ignore
    }
  }, []);

  const toggleCollapsed = useCallback(() => setCollapsed(!collapsed), [collapsed, setCollapsed]);

  return { collapsed, setCollapsed, toggleCollapsed };
}
