import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import ErrorState from "../../components/ui/ErrorState";
import LoadingState from "../../components/ui/LoadingState";
import { icons } from "../../components/ui/icons";
import { fetchGame } from "../../lib/api";
import { formatCurrency } from "../../lib/gameStatus";
import { getSession } from "../../lib/auth";

const ChevronLeftIcon = icons.chevronLeft;

export default function PaymentCheckout() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [game, setGame] = useState(null);
  const [countryCode, setCountryCode] = useState("+237");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [agreed, setAgreed] = useState(false);

  const username = location.state?.username || getSession()?.user?.username || "";

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

  const totals = useMemo(() => {
    const fee = game?.entryFee || 100;
    const charge = Math.round(fee * 0.04);
    return { fee, charge, total: fee + charge };
  }, [game]);

  if (status === "loading") return <LoadingState fullPage />;
  if (status === "error") return <ErrorState onRetry={load} className="min-h-[50vh]" />;

  const handlePay = (event) => {
    event.preventDefault();
    navigate(`/games/${id}/payment/processing`, {
      state: {
        method: "mobile_money",
        phone: `${countryCode}${phoneNumber}`,
        username,
        amount: totals.total
      }
    });
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)] mb-5"
      >
        <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
        Back
      </button>

      <span className="block text-[11px] font-bold tracking-[0.2em] text-[var(--color-accent)] uppercase mb-1">
        Answer fee
      </span>
      <h1 className="font-display text-2xl font-bold text-[var(--color-ink)]">{game.title}</h1>
      <p className="text-sm text-[var(--color-ink-muted)] mt-1">
        Pay the answer fee to submit your guess and enter the winner pool.
      </p>

      <form onSubmit={handlePay} className="mt-6 space-y-4">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
          <label className="block text-sm font-semibold text-[var(--color-ink)]" htmlFor="momo">
            Mobile Money number
          </label>
          <div className="mt-2 flex w-full min-h-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] overflow-hidden transition-colors focus-within:border-[var(--color-accent)] focus-within:bg-[var(--color-surface)]">
            <select
              value={countryCode}
              onChange={(event) => setCountryCode(event.target.value)}
              className="shrink-0 bg-transparent pl-4 pr-2 text-sm text-[var(--color-ink)] outline-none border-r border-[var(--color-border)]"
            >
              <option value="+237">CM +237</option>
              <option value="+33">FR +33</option>
              <option value="+1">US +1</option>
              <option value="+44">UK +44</option>
              <option value="+234">NG +234</option>
              <option value="+225">CI +225</option>
              <option value="+221">SN +221</option>
              <option value="+49">DE +49</option>
            </select>
            <input
              id="momo"
              type="number"
              inputMode="numeric"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="6XX XXX XXX"
              className="min-w-0 flex-1 bg-transparent px-4 text-sm text-[var(--color-ink)] outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              autoComplete="tel"
              required
            />
          </div>
          {username && <p className="mt-2 text-xs text-[var(--color-ink-faint)]">Playing as @{username}</p>}

          <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-1.5">
            <AmountRow label="Answer fee" value={formatCurrency(totals.fee, game.currency)} />
            <AmountRow label="Processing charge" value={formatCurrency(totals.charge, game.currency)} />
            <AmountRow label="Total" value={formatCurrency(totals.total, game.currency)} strong />
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-surface-muted)]">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
            className="h-5 w-5 shrink-0 accent-[var(--color-accent)]"
            required
          />
          <span>I agree to pay the answer fee.</span>
        </label>

        <Button type="submit" size="lg" fullWidth disabled={!agreed}>
          Pay answer fee
        </Button>
      </form>
    </div>
  );
}

function AmountRow({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-[var(--color-ink-muted)]">{label}</span>
      <strong className={strong ? "text-[var(--color-ink)]" : "font-medium text-[var(--color-ink)]"}>{value}</strong>
    </div>
  );
}
