import { useEffect, useRef, useState } from "react";
import { icons } from "../ui/icons";

const PlayIcon = icons.play;

export default function RotateObjectViewer({ media, title }) {
  const videoRef = useRef(null);
  const holdTimerRef = useRef(null);
  const dragRef = useRef({ active: false, x: 0, time: 0 });
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const hasVideo = media?.type === "video" && media.url;

  useEffect(() => {
    return () => window.clearInterval(holdTimerRef.current);
  }, []);

  const setVideoTime = (nextTime) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const wrapped = ((nextTime % duration) + duration) % duration;
    video.currentTime = wrapped;
    setProgress(wrapped / duration);
  };

  const startHoldRotate = () => {
    if (!hasVideo) return;
    window.clearInterval(holdTimerRef.current);
    holdTimerRef.current = window.setInterval(() => {
      const video = videoRef.current;
      setVideoTime((video?.currentTime || 0) + 0.07);
    }, 35);
  };

  const stopHoldRotate = () => {
    window.clearInterval(holdTimerRef.current);
  };

  const handlePointerDown = (event) => {
    if (!hasVideo) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      active: true,
      x: event.clientX,
      time: videoRef.current?.currentTime || 0
    };
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current.active || !duration) return;
    const delta = event.clientX - dragRef.current.x;
    setVideoTime(dragRef.current.time + delta * 0.015);
  };

  const handlePointerUp = () => {
    dragRef.current.active = false;
  };

  return (
    <div className="rotate-viewer">
      <div
        className="rotate-media"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {hasVideo ? (
          <video
            ref={videoRef}
            src={media.url}
            muted
            playsInline
            preload="metadata"
            aria-label={`${title} rotating object video`}
            onLoadedMetadata={(event) => {
              setDuration(event.currentTarget.duration || 0);
              event.currentTarget.currentTime = 0.01;
            }}
          />
        ) : (
          <div className="guess-bottle" aria-label={`${title} bottle preview`}>
            <span className="bottle-neck" />
            <span className="bottle-cap" />
            <span className="bottle-shine" />
            <span className="bottle-items" />
          </div>
        )}
      </div>

      <div className="rotate-controls">
        <button
          type="button"
          className="rotate-hold-button"
          onPointerDown={startHoldRotate}
          onPointerUp={stopHoldRotate}
          onPointerLeave={stopHoldRotate}
          disabled={!hasVideo}
          aria-label={hasVideo ? "Hold to rotate object" : "Upload a 360 object video to enable rotation"}
        >
          <PlayIcon className="h-5 w-5" aria-hidden="true" />
          <span>{hasVideo ? "Hold to rotate" : "Video needed"}</span>
        </button>

        <input
          type="range"
          min="0"
          max="100"
          value={Math.round(progress * 100)}
          onChange={(event) => setVideoTime((Number(event.target.value) / 100) * duration)}
          disabled={!hasVideo || !duration}
          aria-label="Rotate object angle"
        />
      </div>
    </div>
  );
}
