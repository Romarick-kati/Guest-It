import { useEffect, useRef, useState } from "react";
import { icons } from "./icons";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

/**
 * A small custom video player used anywhere a game's uploaded video is
 * shown with controls (as opposed to the silent looping background clip
 * used on grid thumbnails). Gives play/pause, stop (pause + rewind to
 * start), and a playback-speed menu, in a bar that appears on hover/focus
 * so it stays out of the way otherwise.
 */
export default function VideoPlayer({
  src,
  className = "",
  fit = "cover",
  autoPlay = false,
  loop = true,
  alwaysShowControls = false,
}) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(autoPlay);
  const [speedIndex, setSpeedIndex] = useState(2); // 1x
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = SPEEDS[speedIndex];
  }, [speedIndex]);

  const togglePlay = (e) => {
    e?.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  const stop = (e) => {
    e?.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
    setPlaying(false);
  };

  return (
    <div className={`relative group/video bg-black ${className}`}>
      <video
        ref={videoRef}
        src={src}
        className={`h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"}`}
        loop={loop}
        autoPlay={autoPlay}
        muted={autoPlay}
        playsInline
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onClick={togglePlay}
      />

      <div
        className={`absolute bottom-0 left-0 right-0 flex items-center gap-2 px-3 py-2 bg-gradient-to-t from-black/85 via-black/40 to-transparent transition-opacity duration-200 ${
          alwaysShowControls
            ? "opacity-100"
            : "opacity-0 group-hover/video:opacity-100 focus-within:opacity-100"
        }`}
      >
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? "Pause" : "Play"}
          className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 active:scale-90 transition-all duration-150"
        >
          {playing ? <icons.pause className="h-3.5 w-3.5" /> : <icons.play className="h-3.5 w-3.5 ml-0.5" />}
        </button>
        <button
          type="button"
          onClick={stop}
          aria-label="Stop"
          className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 active:scale-90 transition-all duration-150"
        >
          <icons.stop className="h-3 w-3" />
        </button>

        <div className="relative ml-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSpeedMenuOpen((o) => !o);
            }}
            aria-label="Playback speed"
            aria-expanded={speedMenuOpen}
            className="h-8 px-2.5 inline-flex items-center justify-center rounded-full bg-white/15 text-white text-xs font-semibold hover:bg-white/25 transition-colors duration-150"
          >
            {SPEEDS[speedIndex]}x
          </button>
          {speedMenuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ transformOrigin: "bottom right" }}
              className="absolute bottom-10 right-0 min-w-[68px] bg-[#151517] border border-white/10 rounded-lg py-1 shadow-lg dropdown-panel-in z-10"
            >
              {SPEEDS.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSpeedIndex(i);
                    setSpeedMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors duration-150 ${
                    i === speedIndex
                      ? "text-[var(--color-accent)] font-semibold"
                      : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  {s}x{s === 1 ? " (normal)" : ""}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
