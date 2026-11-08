"use client";

import { ShuffleIcon } from "@nuvui/icons";
import {
  Button,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  ToggleGroup,
  ToggleGroupItem,
  useSidebar,
} from "@nuvui/react";
import { type CSSProperties, useEffect, useState } from "react";
import { ACCENT_STORAGE_KEY } from "./theme-script";

// Hues on the oklch wheel. The lightness and chroma are fixed in
// globals.css, so every hue keeps the same contrast with its text.
const swatches = [
  { value: "default", label: "Blue (default)", hue: 262 },
  { value: "293", label: "Violet", hue: 293 },
  { value: "354", label: "Pink", hue: 354 },
  { value: "27", label: "Red", hue: 27 },
  { value: "50", label: "Orange", hue: 50 },
  { value: "150", label: "Green", hue: 150 },
  { value: "190", label: "Teal", hue: 190 },
] as const;

function applyAccent(hue: number | null) {
  const root = document.documentElement;
  if (hue === null) {
    delete root.dataset.accent;
    root.style.removeProperty("--accent-h");
  } else {
    root.dataset.accent = "";
    root.style.setProperty("--accent-h", String(hue));
  }
  try {
    if (hue === null) localStorage.removeItem(ACCENT_STORAGE_KEY);
    else localStorage.setItem(ACCENT_STORAGE_KEY, String(hue));
  } catch {
    // Not remembered, but still applied.
  }
}

function readAccent(): number | null {
  const value = document.documentElement.style.getPropertyValue("--accent-h");
  const hue = Number.parseFloat(value);
  return Number.isFinite(hue) ? hue : null;
}

const swatchStyle = (hue: number) => ({ "--swatch-h": hue }) as CSSProperties;

/**
 * Accent swatches in the sidebar. Picking one recolors the primary color,
 * the focus ring and the first chart series; Random picks any hue.
 */
export function AccentPicker() {
  const { state, isMobile } = useSidebar();
  // null is the theme's own blue. The script in the root layout has already
  // applied a saved accent before this renders; this only mirrors it.
  const [hue, setHue] = useState<number | null>(null);

  useEffect(() => {
    setHue(readAccent());
  }, []);

  function choose(next: number | null) {
    setHue(next);
    applyAccent(next);
  }

  function randomise() {
    // At least 30° away from the current hue, so the change is visible.
    const from = hue ?? 262;
    const next = Math.round((from + 30 + Math.random() * 300) % 360);
    choose(next);
  }

  if (state === "collapsed" && !isMobile) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Random accent color" onClick={randomise}>
            <ShuffleIcon size={16} aria-hidden="true" />
            <span>Random accent</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const preset = swatches.find((s) =>
    hue === null ? s.value === "default" : s.hue === hue,
  );
  // A random hue presses no preset; it's shown beside the label instead.
  const custom = preset === undefined && hue !== null ? hue : null;

  return (
    <SidebarGroup className="accent">
      <div className="accent__header">
        <SidebarGroupLabel id="accent-label">
          Accent
          {custom !== null ? (
            <span className="accent__custom">
              <span
                className="accent__swatch accent__swatch--small"
                style={swatchStyle(custom)}
                aria-hidden="true"
              />
              {custom}°
            </span>
          ) : null}
        </SidebarGroupLabel>
        <Button
          intent="ghost"
          size="sm"
          onClick={randomise}
          aria-label="Random accent color"
          title="Random accent color"
        >
          <ShuffleIcon size={16} aria-hidden="true" />
        </Button>
      </div>
      <ToggleGroup
        type="single"
        variant="ghost"
        size="sm"
        aria-labelledby="accent-label"
        value={preset?.value ?? ""}
        onValueChange={(next) => {
          // Pressing the pressed swatch again gives "": keep it.
          if (!next) return;
          choose(next === "default" ? null : Number(next));
        }}
        className="accent__swatches"
      >
        {swatches.map((swatch) => (
          <ToggleGroupItem
            key={swatch.value}
            value={swatch.value}
            aria-label={swatch.label}
            title={swatch.label}
            className="accent__item"
          >
            <span
              className="accent__swatch"
              style={swatchStyle(swatch.hue)}
              aria-hidden="true"
            />
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </SidebarGroup>
  );
}
