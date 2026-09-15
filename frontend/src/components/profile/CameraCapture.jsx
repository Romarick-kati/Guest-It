import { useEffect, useRef, useState } from "react";
import { icons } from "../ui/icons";

const CameraIcon = icons.camera;

/**
 * Self-contained avatar editor: shows the current photo (or initials),
 * a camera button that opens a Gallery/Camera menu, and the camera capture
 * modal. Used by both the profile view and the edit-profile form so the
 * getUserMedia lifecycle only lives in one place.
 */
export default function CameraCapture({ image, initials = "?", size = 140, onChange }) {
  const [showOptions, setShowOptions] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setShowCamera(false);
  };

  useEffect(() => {
    if (showCamera && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [showCamera]);

  useEffect(() => stopCamera, []);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      onChange(URL.createObjectURL(file));
      setShowOptions(false);
    }
    event.target.value = "";
  };

  const openCamera = async () => {
    setShowOptions(false);
    setCameraError("");
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Camera access is not supported by this browser.");
        setShowCamera(true);
        return;
      }
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false
      });
      setShowCamera(true);
    } catch (error) {
      if (error.name === "NotAllowedError") {
        setCameraError("Camera permission was denied. Please allow camera access in your browser.");
      } else if (error.name === "NotFoundError") {
        setCameraError("No camera was found on this device.");
      } else {
        setCameraError("Unable to access the camera. Please check your camera permissions.");
      }
      setShowCamera(true);
    }
  };

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          onChange(URL.createObjectURL(blob));
          stopCamera();
        }
      },
      "image/jpeg",
      0.9
    );
  };

  return (
    <>
      <div className="relative" style={{ width: size, height: size }}>
        {image ? (
          <img
            src={image}
            alt="Profile"
            className="h-full w-full rounded-full object-cover border-4 border-[var(--color-accent-soft)] shadow-lg"
          />
        ) : (
          <div
            className="h-full w-full rounded-full bg-[var(--color-ink)] text-[var(--color-bg)] flex items-center justify-center font-display font-bold shadow-lg"
            style={{ fontSize: size * 0.32 }}
          >
            {initials}
          </div>
        )}

        <button
          type="button"
          title="Change profile picture"
          onClick={() => setShowOptions((v) => !v)}
          className="absolute bottom-0.5 right-0.5 h-9 w-9 rounded-full bg-[var(--color-surface)] border-2 border-[var(--color-accent)] flex items-center justify-center shadow-md text-[var(--color-ink)] transition-colors hover:bg-[var(--color-accent)] hover:text-white"
        >
          <CameraIcon className="h-4 w-4" />
        </button>

        {showOptions && (
          <div className="absolute top-full mt-2 right-0 w-36 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg p-1.5 text-left z-20">
            <label
              htmlFor="profile-avatar-gallery"
              className="block px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-ink)] cursor-pointer hover:bg-[var(--color-surface-muted)]"
            >
              Gallery
            </label>
            <input
              id="profile-avatar-gallery"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              hidden
            />
            <button
              type="button"
              onClick={openCamera}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)]"
            >
              Camera
            </button>
          </div>
        )}
      </div>

      {showCamera && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-5">
          <div className="w-full max-w-md bg-[var(--color-surface)] rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-[var(--color-ink)]">Take profile picture</h2>
              <button
                type="button"
                onClick={stopCamera}
                aria-label="Close"
                className="h-8 w-8 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-ink)] flex items-center justify-center text-lg leading-none"
              >
                ×
              </button>
            </div>

            {cameraError ? (
              <div className="text-center py-6">
                <p className="text-sm text-[var(--color-ink-muted)] mb-4">{cameraError}</p>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-5 py-2 rounded-full border border-[var(--color-border-strong)] text-sm font-semibold text-[var(--color-ink)]"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="rounded-xl overflow-hidden bg-black aspect-[4/3]">
                  <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-5 py-2 rounded-full border border-[var(--color-border-strong)] text-sm font-semibold text-[var(--color-ink)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={takePhoto}
                    className="px-5 py-2 rounded-full bg-[var(--color-ink)] text-[var(--color-bg)] text-sm font-semibold"
                  >
                    Take photo
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
