"use client";

import { useEffect, useState } from "react";

const AUTOPLAY_STORAGE_KEY = "video-autoplay-enabled";

export function useAutoplaySettings() {
  const [autoplayEnabled, setAutoplayEnabled] = useState<boolean>(() => {
    // Initialize from localStorage on client side
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(AUTOPLAY_STORAGE_KEY);
      return stored !== null ? stored === "true" : true; // Default to true
    }
    return true;
  });

  useEffect(() => {
    // Persist to localStorage whenever it changes
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTOPLAY_STORAGE_KEY, String(autoplayEnabled));
    }
  }, [autoplayEnabled]);

  const toggleAutoplay = () => {
    setAutoplayEnabled((prev) => !prev);
  };

  return {
    autoplayEnabled,
    setAutoplayEnabled,
    toggleAutoplay,
  };
}
