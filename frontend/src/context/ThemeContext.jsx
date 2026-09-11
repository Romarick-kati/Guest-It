import { createContext, useContext, useEffect, useState } from "react";
import { darkenHex, softTint } from "../lib/color";

const ThemeContext = createContext(null);

const THEME_KEY = "onpoint:theme"; // "light" | "dark" | "system"
const ACCENT_KEY = "onpoint:accent"; // preset key, or "custom"
const CUSTOM_COLOR_KEY = "onpoint:accentColor"; // hex, used when accent === "custom"

function getSystemPrefersDark() {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

function isDarkActive(theme) {
  return theme === "dark" || (theme === "system" && getSystemPrefersDark());
}

function applyTheme(theme) {
  document.documentElement.classList.toggle("dark", isDarkActive(theme));
}

/**
 * Applies the accent color to the whole app. Presets are handled purely by
 * CSS (`[data-accent="..."]` rules in index.css) so they instantly adapt to
 * light/dark. A custom color can't rely on pre-written CSS, so its
 * hover/soft variants are derived on the fly and written as inline
 * custom-property overrides on <html>, which win over the CSS presets.
 */
function applyAccent(accent, customColor, theme) {
  const root = document.documentElement;
  root.setAttribute("data-accent", accent);

  if (accent === "custom" && customColor) {
    root.style.setProperty("--color-accent", customColor);
    root.style.setProperty("--color-accent-hover", darkenHex(customColor, 0.16));
    root.style.setProperty("--color-accent-soft", softTint(customColor, isDarkActive(theme)));
  } else {
    root.style.removeProperty("--color-accent");
    root.style.removeProperty("--color-accent-hover");
    root.style.removeProperty("--color-accent-soft");
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => localStorage.getItem(THEME_KEY) || "light");
  const [accent, setAccentState] = useState(() => localStorage.getItem(ACCENT_KEY) || "green");
  const [customColor, setCustomColorState] = useState(
    () => localStorage.getItem(CUSTOM_COLOR_KEY) || "#0f7a4d"
  );

  useEffect(() => {
    applyTheme(theme);
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => {
      applyTheme("system");
      applyAccent(accent, customColor, "system");
    };
    mq.addEventListener?.("change", listener);
    return () => mq.removeEventListener?.("change", listener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  useEffect(() => {
    applyAccent(accent, customColor, theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accent, customColor, theme]);

  const setTheme = (t) => {
    localStorage.setItem(THEME_KEY, t);
    setThemeState(t);
  };

  const setAccent = (a) => {
    localStorage.setItem(ACCENT_KEY, a);
    setAccentState(a);
  };

  const setCustomColor = (hex) => {
    localStorage.setItem(CUSTOM_COLOR_KEY, hex);
    localStorage.setItem(ACCENT_KEY, "custom");
    setCustomColorState(hex);
    setAccentState("custom");
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accent, setAccent, customColor, setCustomColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
