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
  const [phone, setPhone] = useState("");
  const [agreedToDonation, setAgreedToDonation] = useState(false);

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
    const donation = game?.entryFee || 100;
    const charge = Math.round(donation * 0.04);
    return { donation, charge, total: donation + charge };
  }, [game]);

  if (status === "loading") return <LoadingState fullPage />;
  if (status === "error") return <ErrorState onRetry={load} className="min-h-[50vh]" />;

  const handlePay = (event) => {
    event.preventDefault();
    navigate(`/games/${id}/payment/processing`, {
      state: {
        method: "mobile_money",
        phone,
        username,
        amount: totals.total
      }
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#20384e] px-3 py-3 text-white sm:px-6 lg:py-8">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[1.5rem] bg-[#082a48] shadow-[0_24px_55px_rgba(2,10,30,0.45)] sm:rounded-[2rem] lg:min-h-[620px] lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative order-2 overflow-hidden bg-[#062f52] p-5 sm:p-7 lg:order-1">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_20%,rgba(120,190,224,0.45),transparent_34%),radial-gradient(circle_at_70%_75%,rgba(230,227,75,0.22),transparent_36%)]" />
          <div className="relative z-10 mt-2 lg:mt-16">
            <p className="text-sm font-bold text-white/70">MoMo Donation</p>
            <h1 className="mt-3 font-display text-2xl font-black leading-tight sm:text-4xl">Confirm your entry</h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/72">
              You are donating {formatCurrency(totals.donation, game.currency)} to enter {game.title}. A 4% processing charge is added by the payment provider, so your total is {formatCurrency(totals.total, game.currency)}.
            </p>
          </div>

          <div className="relative z-10 mt-6 space-y-3 rounded-2xl bg-white/10 p-4 backdrop-blur lg:mt-12 lg:rounded-3xl">
            <AmountRow label="Donation" value={formatCurrency(totals.donation, game.currency)} />
            <AmountRow label="Processing charge" value={formatCurrency(totals.charge, game.currency)} />
            <div className="h-px bg-white/15" />
            <AmountRow label="Total" value={formatCurrency(totals.total, game.currency)} strong />
          </div>
        </section>

        <section className="relative order-1 flex items-center justify-center overflow-hidden p-4 sm:p-6 lg:order-2 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_5%,rgba(188,238,241,0.6),rgba(34,93,107,0.55)_33%,rgba(4,24,45,1)_100%)]" />
          <form onSubmit={handlePay} className="relative z-10 w-full max-w-md rounded-2xl bg-[#041d33]/88 p-5 shadow-2xl backdrop-blur sm:rounded-3xl sm:p-7">
            <div className="mb-5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/18"
                aria-label="Go back"
                title="Go back"
              >
                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
              </button>
              <p className="text-sm font-bold text-[#a8d1df]">Step 2 of 2</p>
            </div>
            <h2 className="mt-2 font-display text-2xl font-black leading-tight">Enter MoMo number</h2>
            <p className="mt-2 text-sm text-white/60">
              {username ? `Playing as @${username}` : "Your username will be attached to this entry."}
            </p>

            <label className="mt-5 block text-sm font-bold text-white/80 sm:mt-6" htmlFor="momo">
              Mobile Money number
            </label>
            <input
              id="momo"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+237 6XX XXX XXX"
              className="mt-2 min-h-14 w-full rounded-2xl border border-white/15 bg-white/10 px-4 text-white outline-none placeholder:text-white/35 focus:border-[#a8d1df]"
              autoComplete="tel"
              required
            />

            <div className="mt-4 rounded-2xl border border-[#e6e34b]/30 bg-[#e6e34b]/10 p-4 text-sm leading-6 text-yellow-50 sm:mt-5">
              You will receive a Mobile Money prompt for {formatCurrency(totals.total, game.currency)}: {formatCurrency(totals.donation, game.currency)} donation plus a 4% processing charge.
            </div>

            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 text-sm leading-6 text-white/78 transition hover:bg-white/14 sm:mt-5">
              <input
                type="checkbox"
                checked={agreedToDonation}
                onChange={(event) => setAgreedToDonation(event.target.checked)}
                className="mt-1 h-5 w-5 shrink-0 accent-[#e6e34b]"
                required
              />
              <span>I agree that this is a donation, not a payment.</span>
            </label>

            <Button type="submit" size="lg" fullWidth className="mt-5 sm:mt-7" disabled={!agreedToDonation}>
              Donate and join
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}

function AmountRow({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-white/60">{label}</span>
      <strong className={strong ? "text-lg text-white" : "text-white"}>{value}</strong>
    </div>
  );
}
