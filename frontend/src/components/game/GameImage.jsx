// Renders the game's real photo/video when one has been uploaded; falls
// back to an on-brand placeholder otherwise (e.g. for older demo games, or
// while an admin hasn't attached media yet). Swap in real hosted URLs once
// the backend wires up the upload endpoint - this component already
// accepts a `media` object shaped like `{ type: "image"|"video", url }`.
//
// `controls`: pass true on full-size/detail views (game details, play,
// entry) so players get play/pause, stop, and a speed menu on the video.
// Small grid thumbnails (GameCard) leave this off and just get a quiet,
// looping, muted background clip - a control bar would feel cluttered
// at that size.
import VideoPlayer from "../ui/VideoPlayer";

const PALETTES = {
  "candy-jar": ["#0f7a4d", "#123b2a"],
  coins: ["#8a6d1f", "#3a2f0f"],
  marbles: ["#2563eb", "#0f1f3d"],
  popcorn: ["#d97706", "#4a2e07"],
  buttons: ["#7c3aed", "#241a3d"],
  jellybeans: ["#dc2626", "#3d1212"],
};

export default function GameImage({ image, media, title, className = "", compact = false, controls = false }) {
  if (media?.url) {
    return (
      <div
        className={`relative w-full overflow-hidden bg-[var(--color-surface-sunken)] animate-fade-in ${className}`}
        role="img"
        aria-label={`${title} game media`}
      >
        {media.type === "video" ? (
          controls ? (
            <VideoPlayer src={media.url} className="h-full w-full" autoPlay loop alwaysShowControls />
          ) : (
            <video
              src={media.url}
              className="h-full w-full object-cover"
              muted
              loop
              autoPlay
              playsInline
            />
          )
        ) : (
          <img src={media.url} alt={`${title} game media`} className="h-full w-full object-cover" />
        )}
      </div>
    );
  }

  const [from, to] = PALETTES[image] || ["#121214", "#3a3a3f"];
  return (
    <div
      className={`relative w-full overflow-hidden flex items-center justify-center ${className}`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      role="img"
      aria-label={`${title} game image`}
    >
      <svg
        className={compact ? "h-8 w-8 text-white/70" : "h-14 w-14 text-white/70"}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      >
        <circle cx="8" cy="8" r="2.2" />
        <circle cx="15" cy="6.5" r="1.6" />
        <circle cx="16.5" cy="12.5" r="2" />
        <circle cx="9.5" cy="14.5" r="1.4" />
        <circle cx="6" cy="17" r="1.8" />
        <circle cx="13.5" cy="18" r="1.5" />
      </svg>
    </div>
  );
}
