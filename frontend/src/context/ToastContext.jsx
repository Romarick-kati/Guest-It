import { createContext, useCallback, useContext, useRef, useState } from "react";
import { createPortal } from "react-dom";

const ToastContext = createContext(null);

const ICONS = {
  success: (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 010 1.4l-7 7a1 1 0 01-1.4 0l-3-3a1 1 0 111.4-1.4l2.3 2.29 6.3-6.29a1 1 0 011.4 0z"
        clipRule="evenodd"
      />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 112 0v3a1 1 0 11-2 0V9zm1-4a1.1 1.1 0 100 2.2A1.1 1.1 0 0010 5z"
        clipRule="evenodd"
      />
    </svg>
  ),
  info: (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0 1 1 0 002 0zm-1 3a1 1 0 011 1v4a1 1 0 11-2 0v-4a1 1 0 011-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

const TONE_CLASSES = {
  success: "border-[var(--color-success)]/30 text-[var(--color-success)]",
  error: "border-[var(--color-danger)]/30 text-[var(--color-danger)]",
  info: "border-[var(--color-info)]/30 text-[var(--color-info)]",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (message, { type = "info", duration = 4000 } = {}) => {
      const id = ++idRef.current;
      setToasts((t) => [...t, { id, message, type }]);
      if (duration) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ notify, dismiss }}>
      {children}
      {createPortal(
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] sm:w-auto">
          {toasts.map((t) => (
            <div
              key={t.id}
              role="status"
              className={`flex items-start gap-3 bg-[var(--color-surface)] border rounded-xl shadow-lg px-4 py-3 sm:min-w-[320px] ${TONE_CLASSES[t.type] || TONE_CLASSES.info}`}
            >
              <span className="shrink-0 mt-0.5">{ICONS[t.type] || ICONS.info}</span>
              <p className="text-sm text-[var(--color-ink)] flex-1">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]"
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
