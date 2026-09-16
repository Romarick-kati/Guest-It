import { useState } from "react";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import { CardHeader } from "../ui/Card";
import Card from "../ui/Card";
import MediaUploadField from "./MediaUploadField";
import { GAME_TYPES } from "../../lib/mockData";
import { formatCurrency } from "../../lib/gameStatus";

const defaultValues = {
  title: "",
  gameType: "GUESSING",
  instructions: "",
  media: null,
  question: "How many are inside?",
  answerType: "NUMBER",
  correctAnswer: "",
  startAt: "",
  endAt: "",
  participantLimit: "",
  entryFee: "",
  rewardDescription: "",
  status: "DRAFT",
};

const ANSWER_TYPES = [
  { value: "NUMBER", label: "Numeric estimate" },
  { value: "TEXT", label: "Text answer" },
  { value: "CHOICE", label: "Multiple choice" },
];

// Passed only when editing a real game, so the Reward card can show the
// pool it actually has right now (see EditGame.jsx).
export default function GameForm({ initialValues = {}, liveStats = null, onSubmit, submitting = false }) {
  const [values, setValues] = useState({ ...defaultValues, ...initialValues });

  const update = (key) => (e) =>
    setValues((v) => ({ ...v, [key]: e?.target ? e.target.value : e }));

  const handleSubmit = (status) => (e) => {
    e.preventDefault();
    onSubmit?.({ ...values, status });
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(values.status)}>
      <Card>
        <CardHeader title="General information" subtitle="What players will see about this game" />
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <Input
            label="Game name"
            placeholder="Guess it"
            value={values.title}
            onChange={update("title")}
            required
          />
          <Select
            label="Game type"
            options={GAME_TYPES}
            value={values.gameType}
            onChange={update("gameType")}
            hint="ON Point supports multiple game types — this just runs as a guessing game"
          />
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">
              Instructions / how to play
            </label>
            <textarea
              rows={3}
              value={values.instructions}
              onChange={update("instructions")}
              placeholder="Explain exactly what the player needs to do"
              className="w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)]"
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Game content" subtitle="The real photo or video players will estimate, plus the question" />
        <div className="flex flex-col gap-4 mt-4">
          <MediaUploadField
            value={values.media}
            onChange={(media) => setValues((v) => ({ ...v, media }))}
            hint="Shown on the game card and details page. Upload one photo, or a short video for a more realistic feel."
            required
          />
          <Input
            label="Question shown to players"
            hint="This is what players see - it already says what they're counting, so there's no separate description or unit to fill in."
            value={values.question}
            onChange={update("question")}
          />
        </div>
      </Card>

      <Card>
        <CardHeader title="Game configuration" subtitle="Timing and answer settings" />
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <Select
            label="Answer type"
            options={ANSWER_TYPES}
            value={values.answerType}
            onChange={update("answerType")}
          />
          <Input
            label="Correct answer"
            type="number"
            hint="Kept private from players until results are published"
            value={values.correctAnswer}
            onChange={update("correctAnswer")}
          />
          <Input
            label="Start date & time"
            type="datetime-local"
            value={values.startAt}
            onChange={update("startAt")}
          />
          <Input
            label="End date & time"
            type="datetime-local"
            value={values.endAt}
            onChange={update("endAt")}
          />
          <Input
            label="Participant limit (optional)"
            type="number"
            placeholder="Leave blank for unlimited"
            value={values.participantLimit}
            onChange={update("participantLimit")}
          />
        </div>
      </Card>

      <Card>
        <CardHeader title="Reward" subtitle="How the entry fee is split" />
        <div className="flex flex-col gap-4 mt-4">
          <Input
            label="Entry fee (FCFA)"
            type="number"
            placeholder="0 for free entry"
            value={values.entryFee}
            onChange={update("entryFee")}
          />
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm text-[var(--color-ink-muted)]">
            <p>
              The winner pool isn&apos;t set manually — 80% of every entry fee collected goes to it, 20% goes to the
              platform. It grows automatically as players join, and is 0 until anyone does.
            </p>
            {liveStats && (
              <p className="mt-2 font-medium text-[var(--color-ink)]">
                Current pool: {formatCurrency(liveStats.prize, "FCFA")} · {liveStats.participants} joined
              </p>
            )}
          </div>
          <Input
            label="Reward description (optional)"
            placeholder="e.g. Cash prize + platform badge"
            value={values.rewardDescription}
            onChange={update("rewardDescription")}
          />
        </div>
      </Card>

      <Card>
        <CardHeader title="Visibility" subtitle="Controls whether players can see or join this game" />
        <div className="flex flex-wrap gap-2 mt-4">
          {["DRAFT", "UPCOMING", "LIVE"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setValues((v) => ({ ...v, status: s }))}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors ${
                values.status === s
                  ? "bg-[var(--color-ink)] text-[var(--color-bg)] border-[var(--color-ink)]"
                  : "border-[var(--color-border-strong)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)]"
              }`}
            >
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </Card>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          loading={submitting && values.status === "DRAFT"}
          onClick={handleSubmit("DRAFT")}
        >
          Save draft
        </Button>
        <Button
          type="button"
          variant="primary"
          size="lg"
          loading={submitting && values.status !== "DRAFT"}
          // Honor whichever Visibility button the admin picked (including
          // Live) - only fall back to Upcoming if they never touched it
          // (status still at its DRAFT default), so this button still means
          // "publish" rather than silently re-saving as a draft.
          onClick={handleSubmit(values.status === "DRAFT" ? "UPCOMING" : values.status)}
        >
          {initialValues?.title ? "Save changes" : "Create game"}
        </Button>
      </div>
    </form>
  );
}
