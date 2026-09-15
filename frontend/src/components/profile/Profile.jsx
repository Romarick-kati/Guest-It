import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CameraCapture from "./CameraCapture";
import EditProfile from "../editProfile/EditProfile";
import Button from "../ui/Button";
import LoadingState from "../ui/LoadingState";
import ErrorState from "../ui/ErrorState";
import { icons } from "../ui/icons";
import { fetchProfile, isSignedIn, signOut } from "../../lib/auth";
import { useToast } from "../../context/ToastContext";

const TrophyIcon = icons.trophy;
const LogoutIcon = icons.logout;

function initialsFor(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Profile() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [status, setStatus] = useState("loading");
  const [profile, setProfile] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const load = async () => {
    if (!isSignedIn()) {
      // replace, not push: this runs on mount, so a plain push would leave
      // /profile in history right behind /signin - hitting the browser
      // back button would land back here and immediately redirect again,
      // making back look broken.
      navigate("/signin", { replace: true, state: { returnTo: "/profile" } });
      return;
    }
    setStatus("loading");
    try {
      setProfile(await fetchProfile());
      setStatus("success");
    } catch (err) {
      if (err.status === 401) {
        // Session token no longer matches any account server-side (e.g. the
        // backend restarted and lost its in-memory users) - retrying with
        // the same stale token would just fail forever, so start over.
        signOut();
        navigate("/signin", { replace: true, state: { returnTo: "/profile" } });
        return;
      }
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = () => {
    signOut();
    navigate("/signin");
  };

  if (status === "loading") return <LoadingState fullPage label="Loading your profile..." />;
  if (status === "error") return <ErrorState onRetry={load} className="min-h-[50vh]" />;
  if (!profile) return null;

  if (showEditProfile) {
    return (
      <EditProfile
        profile={profile}
        profileImage={profileImage}
        onImageChange={setProfileImage}
        onSaved={(updated) => {
          setProfile(updated);
          setShowEditProfile(false);
          notify("Profile updated.", { type: "success" });
        }}
        onBack={() => setShowEditProfile(false)}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center mb-6">
        <span className="text-[11px] font-bold tracking-[0.2em] text-[var(--color-accent)] uppercase mb-5">
          Player profile
        </span>

        <CameraCapture
          image={profileImage}
          initials={initialsFor(profile.fullName)}
          size={140}
          onChange={setProfileImage}
        />

        <h1 className="font-display text-2xl font-bold text-[var(--color-ink)] mt-4">{profile.fullName}</h1>
        <p className="text-sm text-[var(--color-ink-muted)] mt-0.5">@{profile.username}</p>
        <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-[var(--color-accent)]">
          <TrophyIcon className="h-3.5 w-3.5" aria-hidden="true" />
          ON Point Player
        </span>

        <div className="flex items-center gap-2 mt-5">
          <Button size="sm" onClick={() => setShowEditProfile(true)}>
            Edit profile
          </Button>
          <Button size="sm" variant="outline" leftIcon={<LogoutIcon className="h-4 w-4" />} onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </div>

      <Section label="Account" title="Personal information">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl px-5">
          <InfoRow label="Full name" value={profile.fullName} />
          <InfoRow label="Username" value={`@${profile.username}`} />
          <InfoRow label="Phone number" value={profile.phoneNumber} />
          <InfoRow label="Account type" value="Player" last />
        </div>
      </Section>

      <Section label="Performance" title="Guess it statistics">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Games played" value="48" />
          <StatCard label="Games won" value="31" />
          <StatCard label="Points" value="2,450" />
          <StatCard label="Win rate" value="65%" />
        </div>

        <div className="mt-3 bg-[var(--color-ink)] text-[var(--color-bg)] rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-0">
          <PerformanceItem label="Accuracy" value="82%" />
          <PerformanceItem label="Best score" value="950" />
          <PerformanceItem label="Winning streak" value="7 games" last />
        </div>
      </Section>

      <Section label="Progress" title="Achievements">
        <div className="grid sm:grid-cols-2 gap-3">
          <AchievementCard badge="10W" title="First victory" description="Won your first 10 games." />
          <AchievementCard badge="1K" title="Point master" description="Earned more than 1,000 points." />
          <AchievementCard badge="7S" title="Hot streak" description="Won 7 games consecutively." />
          <AchievementCard badge="50" title="Legend" description="Win 50 Guess it games." locked />
        </div>
      </Section>

      <Section label="Leaderboard" title="Rank & leaderboard">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
            <span className="text-sm text-[var(--color-ink-muted)]">Your current rank</span>
            <strong className="font-display text-3xl text-[var(--color-ink)]">#24</strong>
          </div>

          <div className="grid grid-cols-3 gap-4 py-4">
            <RankStat label="Qualified games" value="42" />
            <RankStat label="Total points" value="2,450" />
            <RankStat label="Next rank" value="#20" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="text-[var(--color-ink-muted)]">Progress to next rank</span>
              <strong className="text-[var(--color-ink)]">85%</strong>
            </div>
            <div className="h-2 rounded-full bg-[var(--color-surface-sunken)] overflow-hidden">
              <div className="h-full rounded-full bg-[var(--color-accent)]" style={{ width: "85%" }} />
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({ label, title, children }) {
  return (
    <section className="mb-6">
      <div className="mb-3">
        <span className="block text-[10px] font-bold tracking-[0.2em] text-[var(--color-accent)] uppercase mb-1">
          {label}
        </span>
        <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function InfoRow({ label, value, last = false }) {
  return (
    <div className={`flex items-center justify-between gap-3 py-3.5 ${last ? "" : "border-b border-[var(--color-border)]"}`}>
      <span className="text-sm text-[var(--color-ink-muted)]">{label}</span>
      <strong className="text-sm text-[var(--color-ink)]">{value}</strong>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl px-4 py-4">
      <p className="text-xs text-[var(--color-ink-muted)] mb-1.5">{label}</p>
      <p className="font-display text-2xl font-bold text-[var(--color-ink)]">{value}</p>
    </div>
  );
}

function PerformanceItem({ label, value, last = false }) {
  return (
    <div
      className={`pb-4 sm:pb-0 sm:px-5 first:sm:pl-0 border-b sm:border-b-0 sm:border-r border-[var(--color-bg)]/15 ${
        last ? "border-b-0 sm:border-r-0 pb-0" : ""
      }`}
    >
      <p className="text-[11px] text-[var(--color-bg)]/65 mb-1">{label}</p>
      <p className="font-display text-lg font-bold text-[var(--color-accent)]">{value}</p>
    </div>
  );
}

function RankStat({ label, value }) {
  return (
    <div>
      <p className="text-[11px] text-[var(--color-ink-muted)] mb-1">{label}</p>
      <strong className="text-base text-[var(--color-ink)]">{value}</strong>
    </div>
  );
}

function AchievementCard({ badge, title, description, locked = false }) {
  return (
    <div
      className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 flex items-center gap-3.5 ${
        locked ? "opacity-50" : ""
      }`}
    >
      <div
        className={`h-12 w-12 shrink-0 rounded-xl flex items-center justify-center font-display font-bold text-sm ${
          locked
            ? "bg-[var(--color-surface-sunken)] text-[var(--color-ink-muted)]"
            : "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
        }`}
      >
        {badge}
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-[var(--color-ink)]">{title}</h3>
        <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">{description}</p>
      </div>
    </div>
  );
}
