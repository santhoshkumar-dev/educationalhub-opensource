"use client";

import { useEffect } from "react";

export default function ThemeInit() {
  useEffect(() => {
    const html = document.documentElement;

    // Check system preference first
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    const stored = localStorage.getItem("theme");

    if (stored === "dark") {
      html.classList.add("dark");
    } else if (stored === "light") {
      html.classList.remove("dark");
    } else {
      // No stored preference, apply system theme
      if (prefersDark) {
        html.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        html.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    }
  }, []);

  return null;
}
