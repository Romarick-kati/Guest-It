import { useRef, useState } from "react";
import { icons } from "../ui/icons";
import VideoPlayer from "../ui/VideoPlayer";

// There's no separate file/object storage backend - the game document
// itself (in the `games` MongoDB collection) stores this as a base64 data
// URI, so the cap here has to leave room under the server's request body
// limit (8MB, see backend/src/server.js) once base64 inflates the file by
// roughly a third.
const MAX_FILE_BYTES = 4 * 1024 * 1024;

/**
 * Lets an admin attach a real photo or short video of the actual item
 * players will estimate (a jar of candy, a stack of coins, etc). Using a
 * real photo/video here — instead of a generic icon — is what makes a
 * game feel like a genuine estimation contest rather than a betting slip.
 *
 * `value` is `{ type: "image" | "video", url, name }` or `null`. `url` is a
 * base64 data URI - it's sent as-is to the backend and persists with the
 * game, unlike a blob: URL which only exists for this browser tab.
 */
export default function MediaUploadField({
  label = "Game media",
  hint,
  value,
  onChange,
  required = false,
}) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");

  const acceptFile = (file) => {
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
      setError("Please choose an image or video file.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("File is too large — keep it under 4MB (there's no separate media storage yet, so it's saved with the game itself).");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      onChange?.({ type: isImage ? "image" : "video", url: reader.result, name: file.name });
    };
    reader.onerror = () => setError("Couldn't read that file — please try again.");
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange?.(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="sm:col-span-2">
      <label className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">
        {label} {required && <span className="text-[var(--color-danger)]">*</span>}
      </label>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`relative overflow-hidden rounded-xl border-2 border-dashed transition-colors duration-200 ${
          dragActive
            ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
            : "border-[var(--color-border-strong)] hover:border-[var(--color-ink-faint)] bg-[var(--color-surface-muted)]"
        } ${value ? "aspect-video bg-[#0b0b0d]" : "py-10 cursor-pointer"}`}
        {...(!value && {
          role: "button",
          tabIndex: 0,
          onClick: () => inputRef.current?.click(),
          onKeyDown: (e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click(),
        })}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          className="sr-only"
          onChange={(e) => acceptFile(e.target.files?.[0])}
        />

        {value ? (
          <>
            {value.type === "video" ? (
              <VideoPlayer src={value.url} fit="contain" className="h-full w-full animate-fade-in" alwaysShowControls />
            ) : (
              <img
                src={value.url}
                alt="Selected game media preview"
                className="h-full w-full object-contain animate-fade-in"
              />
            )}
            <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-2.5 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
              <span className="inline-flex items-center gap-1 rounded-full bg-black/60 text-white text-xs font-medium px-2.5 py-1 backdrop-blur-sm truncate max-w-[60%]">
                {value.type === "video" ? <icons.play className="h-3 w-3 shrink-0" /> : <icons.image className="h-3 w-3 shrink-0" />}
                <span className="truncate">{value.name}</span>
              </span>
              <button
                type="button"
                onClick={handleRemove}
                aria-label="Remove media"
                className="pointer-events-auto h-6 w-6 inline-flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors duration-150 hover:rotate-90 shrink-0"
              >
                <icons.close className="h-3.5 w-3.5" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center px-6">
            <div className="h-11 w-11 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink-muted)] flex items-center justify-center mb-3">
              <icons.upload className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-[var(--color-ink)]">
              Click to upload, or drag a photo or video here
            </p>
            <p className="text-xs text-[var(--color-ink-muted)] mt-1">
              A real photo or short clip of the item builds more trust than a placeholder image
            </p>
          </div>
        )}
      </div>

      {value && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-2 text-sm font-medium text-[var(--color-accent)] hover:underline"
        >
          Replace {value.type}
        </button>
      )}

      {error && <p className="mt-1.5 text-sm text-[var(--color-danger)]">{error}</p>}
      {!error && hint && <p className="mt-1.5 text-sm text-[var(--color-ink-muted)]">{hint}</p>}
    </div>
  );
}
