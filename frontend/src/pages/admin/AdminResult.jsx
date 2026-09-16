import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchGame, fetchParticipants, fetchResolution, runSystemDraw, offerChoiceToPlayers } from "../../lib/api";
import { formatCurrency } from "../../lib/gameStatus";
import { getExactMatches, summariseOutcome } from "../../lib/resolution";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Toggle from "../../components/ui/Toggle";
import { icons } from "../../components/ui/icons";

export default function AdminResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [game, setGame] = useState(null);
  const [exactMatches, setExactMatches] = useState([]);
  const [outcome, setOutcome] = useState(null);
  const [resolution, setResolution] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null); // "RANDOM" | "OFFER" | null
  const [sending, setSending] = useState(false);

  const load = async () => {
    setStatus("loading");
    try {
      const [g, list] = await Promise.all([fetchGame(id), fetchParticipants(id)]);
      setGame(g);
      if (g.result) {
        const matches = getExactMatches(list, g.result.correctAnswer);
        setExactMatches(matches);
        const summary = summariseOutcome(list, g.result.correctAnswer);
        setOutcome(summary);
        if (summary.case === "TIE") {
          setResolution(await fetchResolution(id));
        }
      }
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSend = async () => {
    if (!selectedMethod) return;
    setSending(true);
    try {
      const names = outcome.eligible.map((p) => p.name);
      const record =
        selectedMethod === "RANDOM"
          ? await runSystemDraw(id, names)
          : await offerChoiceToPlayers(id, names);
      setResolution(record);
    } finally {
      setSending(false);
    }
  };

  if (status === "loading") return <LoadingState fullPage />;
  if (status === "error") return <ErrorState onRetry={load} />;

  return (
    <div className="flex flex-col gap-5 max-w-2xl animate-fade-in-up">
      <button
        onClick={() => navigate(`/admin/games/${id}`)}
        className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] w-fit"
      >
        ← Back to game
      </button>
      <div>
        <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">Result</h2>
        <p className="text-sm text-[var(--color-ink-muted)]">{game.title}</p>
      </div>

      {!game.result ? (
        <EmptyState
          title="Result not published"
          description="This game hasn't received an official result from the backend yet."
        />
      ) : (
        <>
          <Card hoverable>
            <div className="flex items-center justify-between mb-4">
              <Badge tone="info">Correct answer</Badge>
              <span className="text-xs text-[var(--color-ink-faint)]">{game.title}</span>
            </div>
            <p className="font-display text-3xl font-semibold text-[var(--color-ink)]">
              {game.result.correctAnswer}
              {game.unit && <span className="text-base font-normal text-[var(--color-ink-muted)]"> {game.unit}</span>}
            </p>
            <p className="text-sm text-[var(--color-ink-muted)] mt-2">
              Determined by the system from submitted entries — nobody on the team picks the winner.
            </p>
          </Card>

          {exactMatches.length > 0 && (
            <Card padded={false} className="overflow-hidden">
              <div className="px-5 pt-5 pb-1">
                <h3 className="font-display font-semibold text-[var(--color-ink)]">
                  Exact matches ({exactMatches.length})
                </h3>
                <p className="text-sm text-[var(--color-ink-muted)] mt-0.5">
                  Everyone who submitted the exact correct number
                </p>
              </div>
              <div className="divide-y divide-[var(--color-border)] mt-3">
                {exactMatches.map((p, i) => (
                  <div key={p.id} style={{ "--i": i }} className="stagger-item flex items-center gap-3 px-5 py-3">
                    <span className="h-7 w-7 shrink-0 rounded-full bg-[var(--color-surface-sunken)] text-[var(--color-ink-muted)] flex items-center justify-center text-xs font-semibold">
                      {p.name.slice(0, 1)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-[var(--color-ink)] truncate block">{p.name}</span>
                      {p.eligibility === "INELIGIBLE" && (
                        <span className="text-xs text-[var(--color-ink-faint)]">
                          Not counted — {p.eligibilityReason?.toLowerCase() || "not eligible to win"}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[var(--color-ink-faint)]">{p.submittedAt}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {outcome?.case === "NO_WINNER" && (
            <EmptyState
              title="No winner this round"
              description="Nobody matched the exact number — that's a valid outcome. No prize is awarded for this game."
            />
          )}

          {outcome?.case === "SINGLE_WINNER" && (
            <Card className="animate-scale-in">
              <div className="flex items-center gap-2 mb-3">
                <Badge tone="success" dot>Resolved automatically</Badge>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-10 w-10 rounded-full bg-[var(--color-success)] text-white flex items-center justify-center">
                  <icons.trophy className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="font-display font-semibold text-[var(--color-ink)]">{outcome.eligible[0].name}</p>
                  <p className="text-sm text-[var(--color-ink-muted)]">
                    {formatCurrency(game.prize, game.currency)} · identity verified
                  </p>
                </div>
              </div>
            </Card>
          )}

          {outcome?.case === "TIE" && (
            <Card className="animate-scale-in">
              <div className="flex items-center gap-2 mb-3">
                <Badge tone="warning" dot>Tie — needs resolution</Badge>
              </div>
              <p className="text-sm text-[var(--color-ink-muted)] mb-4">
                {outcome.eligible.length} players matched the exact number and are eligible to win. Choose
                how this tie should be resolved, then send it.
              </p>

              {!resolution && (
                <div className="animate-fade-in">
                  <div className="divide-y divide-[var(--color-border)]">
                    <Toggle
                      label="Draw a winner at random"
                      description="The system picks one winner at random from the tied, eligible players."
                      checked={selectedMethod === "RANDOM"}
                      onChange={(v) => setSelectedMethod(v ? "RANDOM" : null)}
                    />
                    <Toggle
                      label="Let the players decide"
                      description="Tied players choose to split the prize evenly or settle it with a tiebreaker game."
                      checked={selectedMethod === "OFFER"}
                      onChange={(v) => setSelectedMethod(v ? "OFFER" : null)}
                    />
                  </div>
                  <Button
                    fullWidth
                    className="mt-3"
                    onClick={handleSend}
                    loading={sending}
                    disabled={!selectedMethod || sending}
                  >
                    Send
                  </Button>
                </div>
              )}

              {resolution?.status === "AWAITING_PLAYERS" && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--color-ink-faint)] mb-2">
                    Waiting on tied players
                  </p>
                  <div className="flex flex-col gap-2">
                    {Object.entries(resolution.playerChoices).map(([name, choice]) => (
                      <div key={name} className="flex items-center justify-between bg-[var(--color-surface-muted)] rounded-lg px-3.5 py-2.5">
                        <span className="text-sm font-medium text-[var(--color-ink)]">{name}</span>
                        {choice ? (
                          <Badge tone="success">{choice === "SPLIT" ? "Chose split" : "Chose tiebreaker"}</Badge>
                        ) : (
                          <Badge tone="neutral">Waiting…</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {resolution?.status === "RESOLVED" && resolution.method === "RANDOM" && (
                <div className="flex items-center gap-3 animate-scale-in">
                  <span className="h-10 w-10 rounded-full bg-[var(--color-success)] text-white flex items-center justify-center">
                    <icons.trophy className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="font-display font-semibold text-[var(--color-ink)]">{resolution.winners[0].name}</p>
                    <p className="text-sm text-[var(--color-ink-muted)]">
                      {formatCurrency(game.prize, game.currency)} · selected by random draw · identity verified
                    </p>
                  </div>
                </div>
              )}

              {resolution?.status === "RESOLVED" && resolution.method === "SPLIT" && (
                <div className="flex flex-col gap-2 animate-scale-in">
                  {resolution.winners.map((w) => (
                    <div key={w.name} className="flex items-center justify-between bg-[var(--color-success-soft)] rounded-lg px-3.5 py-2.5">
                      <span className="text-sm font-medium text-[var(--color-ink)]">{w.name}</span>
                      <span className="text-sm text-[var(--color-success)] font-medium">
                        {formatCurrency(Math.round((game.prize * w.share) / 100), game.currency)} ({w.share}%) · verified
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {resolution?.status === "RESOLVED" && resolution.method === "TIEBREAKER" && (
                <p className="text-sm text-[var(--color-ink-muted)] animate-fade-in">
                  All tied players agreed to a tiebreaker. A follow-up game will decide the final winner.
                </p>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
}
