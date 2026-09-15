import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CameraCapture from "../profile/CameraCapture";
import Button from "../ui/Button";
import { icons } from "../ui/icons";
import { signOut, updateProfile } from "../../lib/auth";

const ChevronLeftIcon = icons.chevronLeft;

function initialsFor(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function EditProfile({ profile, profileImage, onImageChange, onSaved, onBack }) {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(profile.fullName || "");
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    setSaving(true);
    try {
      const updated = await updateProfile({ fullName, phoneNumber });
      onSaved(updated);
    } catch (err) {
      if (err.status === 401) {
        signOut();
        navigate("/signin", { replace: true, state: { returnTo: "/profile" } });
        return;
      }
      setError(err.message || "Could not save your changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)] mb-5"
      >
        <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
        Back to profile
      </button>

      <span className="block text-[11px] font-bold tracking-[0.2em] text-[var(--color-accent)] uppercase mb-1">
        Account settings
      </span>
      <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">Edit profile</h1>
      <p className="text-sm text-[var(--color-ink-muted)] mt-1 mb-6">
        Update your personal information and profile picture.
      </p>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col items-center text-center mb-4">
        <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--color-accent)] uppercase mb-4">
          Profile picture
        </span>
        <CameraCapture image={profileImage} initials={initialsFor(fullName)} size={130} onChange={onImageChange} />
        <p className="text-xs text-[var(--color-ink-faint)] mt-3">Choose a picture from your gallery or camera.</p>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
        <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--color-accent)] uppercase">
          Personal information
        </span>

        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <Field label="Full name" value={fullName} onChange={setFullName} />
          <Field label="Username" value={`@${profile.username}`} readOnly />
          <Field label="Phone number" value={phoneNumber} onChange={setPhoneNumber} />
          <Field label="Account type" value="Player" readOnly />
        </div>

        {error && <p className="text-sm text-[var(--color-danger)] mt-4">{error}</p>}
      </div>

      <div className="flex justify-end gap-2 mt-5">
        <Button variant="outline" onClick={onBack} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} loading={saving}>
          Save changes
        </Button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, readOnly = false }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-[var(--color-ink)]">{label}</span>
      <input
        type="text"
        value={value}
        readOnly={readOnly}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className={`w-full px-3.5 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-sm text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-accent)] focus:bg-[var(--color-surface)] ${
          readOnly ? "text-[var(--color-ink-muted)] cursor-not-allowed" : ""
        }`}
      />
    </label>
  );
}
