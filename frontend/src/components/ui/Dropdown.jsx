import { useEffect, useRef, useState } from "react";

/**
 * Lightweight popover: renders `trigger` and, when open, a floating panel
 * anchored to it. Closes on outside click or Escape.
 */
export default function Dropdown({ trigger, children, align = "right", panelClassName = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center transition-transform duration-150 active:scale-95"
      >
        {trigger}
      </button>
      {open && (
        <div
          style={{ transformOrigin: align === "right" ? "top right" : "top left" }}
          className={`absolute top-full mt-2 ${align === "right" ? "right-0" : "left-0"} min-w-[220px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg z-50 py-1 dropdown-panel-in ${panelClassName}`}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ children, onClick, className = "", icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 text-left px-3.5 py-2.5 text-sm text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)] transition-colors duration-150 ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}
