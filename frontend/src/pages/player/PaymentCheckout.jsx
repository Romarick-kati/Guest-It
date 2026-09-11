import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchGame } from "../../lib/api";
import { formatCurrency } from "../../lib/gameStatus";
import PaymentSummary from "../../components/payment/PaymentSummary";
import PaymentCard from "../../components/payment/PaymentCard";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";

const METHODS = [
  {
    id: "mobile_money",
    label: "Mobile Money",
    description: "Pay with MTN, Orange or other mobile money",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 18h6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "card",
    label: "Card",
    description: "Visa, Mastercard",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function PaymentCheckout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [game, setGame] = useState(null);
  const [method, setMethod] = useState("mobile_money");
  const [phone, setPhone] = useState("");

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

  const handlePay = (e) => {
    e.preventDefault();
    // The actual payment/gateway integration belongs to Developer 3.
    // This navigates into a "processing" screen for the UI flow only.
    navigate(`/games/${id}/payment/processing`, { state: { phone, method } });
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-xl font-semibold text-[var(--color-ink)] text-center">
        Payment
      </h1>

      <div className="mt-6 space-y-1 text-center">
        <p className="text-sm text-[var(--color-ink-muted)]">{game.title}</p>
        <p className="font-display text-2xl font-semibold text-[var(--color-ink)]">
          {formatCurrency(game.entryFee, game.currency)}
        </p>
      </div>

      <form onSubmit={handlePay} className="mt-6 flex flex-col gap-3">
        <p className="text-sm font-medium text-[var(--color-ink)]">Payment method</p>
        {METHODS.map((m) => (
          <PaymentCard
            key={m.id}
            label={m.label}
            description={m.description}
            icon={m.icon}
            selected={method === m.id}
            onSelect={() => setMethod(m.id)}
          />
        ))}

        {method === "mobile_money" && (
          <Input
            label="Phone number"
            placeholder="+237 6XX XXX XXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            containerClassName="mt-2"
            required
          />
        )}

        <PaymentSummary
          className="mt-4"
          lines={[{ label: "Game", value: game.title }, { label: "Entry fee", value: formatCurrency(game.entryFee, game.currency) }]}
          total={game.entryFee}
          currency={game.currency}
        />

        <Button type="submit" size="lg" fullWidth className="mt-2">
          Pay now
        </Button>
      </form>
    </div>
  );
}
