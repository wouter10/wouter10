"use client";

import { useState } from "react";

export type Theme = "light" | "dark" | "system";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  if (theme === "light") root.classList.add("light");
  else if (theme === "dark") root.classList.add("dark");
  // "system": geen class → CSS media query bepaalt het
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  return (localStorage.getItem("theme") as Theme | null) ?? "system";
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);

  function setTheme(next: Theme) {
    setThemeState(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
    // Update de browser theme-color via meta (statusbalk)
    const dark =
      next === "dark" ||
      (next === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", dark ? "#09090b" : "#ffffff");
  }

  return { theme, setTheme };
}
