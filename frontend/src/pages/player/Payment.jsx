import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchGame } from "../../lib/api";
import { formatCurrency } from "../../lib/gameStatus";
import PaymentSummary from "../../components/payment/PaymentSummary";
import Button from "../../components/ui/Button";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";

export default function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [game, setGame] = useState(null);

  const load = async () => {
    setStatus("loading");
    try {
      setGame(await fetchGame(id));
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (status === "loading") return <LoadingState fullPage />;
  if (status === "error") return <ErrorState onRetry={load} className="min-h-[50vh]" />;

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-xl font-semibold text-[var(--color-ink)] text-center">
        Join {game.title}
      </h1>
      <p className="text-sm text-[var(--color-ink-muted)] text-center mt-1 mb-6">
        Here's exactly what you're paying for before you continue.
      </p>

      <PaymentSummary
        lines={[
          { label: "Entry fee", value: formatCurrency(game.entryFee, game.currency) },
          { label: "Game", value: game.title },
          { label: "Prize", value: formatCurrency(game.prize, game.currency) },
        ]}
        total={game.entryFee}
        currency={game.currency}
      />

      <p className="text-xs text-[var(--color-ink-faint)] text-center mt-4">
        Your entry fee is confirmed only after payment is verified. It is non-refundable once the game starts.
      </p>

      <Button size="lg" fullWidth className="mt-6" onClick={() => navigate(`/games/${id}/checkout`)}>
        Proceed to payment
      </Button>
      <Button
        variant="ghost"
        fullWidth
        className="mt-2"
        onClick={() => navigate(`/games/${id}`)}
      >
        Back to game details
      </Button>
    </div>
  );
}
