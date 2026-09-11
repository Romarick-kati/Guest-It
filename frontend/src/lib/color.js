// Minimal color math so a single accent hex can generate consistent
// hover/soft variants across the app, in both light and dark mode,
// without hand-picking those shades for every custom color an admin might choose.

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex({ r, g, b }) {
  const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Mix `hex` toward `target` by `weight` (0 = hex, 1 = target). */
function mix(hex, target, weight) {
  const a = hexToRgb(hex);
  const b = hexToRgb(target);
  return rgbToHex({
    r: a.r + (b.r - a.r) * weight,
    g: a.g + (b.g - a.g) * weight,
    b: a.b + (b.b - a.b) * weight,
  });
}

export function darkenHex(hex, amount = 0.15) {
  return mix(hex, "#000000", amount);
}

/** Soft background tint — mixes toward white in light mode, toward near-black in dark mode. */
export function softTint(hex, isDark) {
  return isDark ? mix(hex, "#0b0b0d", 0.78) : mix(hex, "#ffffff", 0.86);
}

export function isValidHex(hex) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex);
}
