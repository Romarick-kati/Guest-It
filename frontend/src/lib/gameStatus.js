// Central place that maps a game status to its label + badge tone.
// Keeping this in one file means every component (cards, tables, badges)
// stays visually consistent if statuses change later.

export const GAME_STATUS = {
  DRAFT: "DRAFT",
  UPCOMING: "UPCOMING",
  LIVE: "LIVE",
  PAUSED: "PAUSED",
  CLOSED: "CLOSED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

export const GAME_STATUS_META = {
  [GAME_STATUS.DRAFT]: { label: "Draft", tone: "neutral" },
  [GAME_STATUS.UPCOMING]: { label: "Upcoming", tone: "info" },
  [GAME_STATUS.LIVE]: { label: "Live", tone: "live" },
  [GAME_STATUS.PAUSED]: { label: "Paused", tone: "warning" },
  [GAME_STATUS.CLOSED]: { label: "Closed", tone: "warning" },
  [GAME_STATUS.COMPLETED]: { label: "Completed", tone: "neutral" },
  [GAME_STATUS.CANCELLED]: { label: "Cancelled", tone: "danger" },
};

export function getGameStatusMeta(status) {
  return GAME_STATUS_META[status] || { label: status, tone: "neutral" };
}

export function formatCountdown(totalSeconds) {
  if (totalSeconds == null || totalSeconds < 0) totalSeconds = 0;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  const pad = (n) => String(n).padStart(2, "0");
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

export function formatCurrency(amount, currency = "FCFA") {
  if (amount == null) return "--";
  return `${Number(amount).toLocaleString()} ${currency}`;
}
