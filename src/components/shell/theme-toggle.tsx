"use client";

import { LaptopIcon, MoonIcon, SunIcon } from "@nuvui/icons";
import { Button } from "@nuvui/react";
import { useEffect, useState } from "react";
import { THEME_STORAGE_KEY } from "./theme-script";

type Theme = "system" | "light" | "dark";

const order: Theme[] = ["system", "light", "dark"];
const names: Record<Theme, string> = {
  system: "System theme",
  light: "Light theme",
  dark: "Dark theme",
};

function readTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // Storage can be blocked. The system theme is the fallback.
  }
  return "system";
}

/**
 * Cycles system → light → dark by setting data-theme on <html>, which is
 * all nuvui needs. The choice is remembered in this browser only.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const stored = readTheme();
    setTheme(stored);
    document.documentElement.dataset.theme = stored;
  }, []);

  const next = order[(order.indexOf(theme) + 1) % order.length] ?? "system";
  const Icon =
    theme === "dark" ? MoonIcon : theme === "light" ? SunIcon : LaptopIcon;

  return (
    <Button
      intent="ghost"
      size="sm"
      aria-label={`${names[theme]}. Switch to ${names[next].toLowerCase()}`}
      title={names[theme]}
      onClick={() => {
        setTheme(next);
        document.documentElement.dataset.theme = next;
        try {
          localStorage.setItem(THEME_STORAGE_KEY, next);
        } catch {
          // Not remembered, but still applied.
        }
      }}
    >
      <Icon size={16} aria-hidden="true" />
    </Button>
  );
}
