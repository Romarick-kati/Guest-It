import { useState } from "react";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import { CardHeader } from "../ui/Card";
import Card from "../ui/Card";
import MediaUploadField from "./MediaUploadField";
import { GAME_TYPES } from "../../lib/mockData";

const defaultValues = {
  title: "",
  gameType: "GUESSING",
  description: "",
  instructions: "",
  media: null,
  question: "How many are inside?",
  unit: "",
  answerType: "NUMBER",
  correctAnswer: "",
  countdownMinutes: "5",
  startAt: "",
  endAt: "",
  participantLimit: "",
  prize: "",
  entryFee: "",
  rewardDescription: "",
  status: "DRAFT",
};

const ANSWER_TYPES = [
  { value: "NUMBER", label: "Numeric estimate" },
  { value: "TEXT", label: "Text answer" },
  { value: "CHOICE", label: "Multiple choice" },
];

export default function GameForm({ initialValues = {}, onSubmit, submitting = false }) {
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
            placeholder="Guess It"
            value={values.title}
            onChange={update("title")}
            required
          />
          <Select
            label="Game type"
            options={GAME_TYPES}
            value={values.gameType}
            onChange={update("gameType")}
            hint="ON POINT supports multiple game types — this just runs as a Guessing Game"
          />
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={values.description}
              onChange={update("description")}
              placeholder="A short summary shown on the game card"
              className="w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)]"
            />
          </div>
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
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <MediaUploadField
            value={values.media}
            onChange={(media) => setValues((v) => ({ ...v, media }))}
            hint="Shown on the game card and details page. Upload one photo, or a short video for a more realistic feel."
            required
          />
          <Input
            label="Question shown to players"
            value={values.question}
            onChange={update("question")}
          />
          <Input
            label="Answer unit"
            placeholder="e.g. objects, coins"
            value={values.unit}
            onChange={update("unit")}
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
            label="Countdown duration (minutes)"
            type="number"
            value={values.countdownMinutes}
            onChange={update("countdownMinutes")}
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
        <CardHeader title="Reward" subtitle="Prize and entry cost" />
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <Input
            label="Prize amount (FCFA)"
            type="number"
            value={values.prize}
            onChange={update("prize")}
          />
          <Input
            label="Entry fee (FCFA)"
            type="number"
            placeholder="0 for free entry"
            value={values.entryFee}
            onChange={update("entryFee")}
          />
          <Input
            label="Reward description (optional)"
            placeholder="e.g. Cash prize + platform badge"
            value={values.rewardDescription}
            onChange={update("rewardDescription")}
            containerClassName="sm:col-span-2"
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
          onClick={handleSubmit("UPCOMING")}
        >
          {initialValues?.title ? "Save changes" : "Create game"}
        </Button>
      </div>
    </form>
  );
}
