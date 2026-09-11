import { useEffect, useState } from "react";
import Logo from "./Logo";

export default function SplashScreen({ onDone, minDuration = 1100 }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), minDuration);
    const doneTimer = setTimeout(() => onDone?.(), minDuration + 500);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [minDuration, onDone]);

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-[#0b0b0d] ${fading ? "onpoint-splash-fade" : ""}`}
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute h-40 w-40 rounded-full bg-[#2563eb] blur-3xl onpoint-logo-glow" />
        <Logo variant="full" size={200} className="relative" />
      </div>
    </div>
  );
}
