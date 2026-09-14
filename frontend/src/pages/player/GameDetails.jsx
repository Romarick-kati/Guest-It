import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import ErrorState from "../../components/ui/ErrorState";
import GameCountdown from "../../components/game/GameCountdown";
import LoadingState from "../../components/ui/LoadingState";
import bottleImage from "../../assets/guess-it-bottles.jfif";
import { icons } from "../../components/ui/icons";
import { getSession, isSignedIn } from "../../lib/auth";
import { fetchGame } from "../../lib/api";
import { participants } from "../../lib/mockData";
import { GAME_STATUS, formatCurrency } from "../../lib/gameStatus";

const leaders = [
  { rank: 1, name: "Lila Anderson", score: 11868, avatar: "lila" },
  { rank: 2, name: "Nate Brown", score: 11742, avatar: "nate" },
  { rank: 3, name: "Olivia Carter", score: 10392, avatar: "olivia" },
];

const bottleFacts = [
  { label: "Size", value: "1.5 L" },
  { label: "Height", value: "31 cm" },
  { label: "Width", value: "8 cm" },
];

const liveJoiners = [
  { id: "live-ademi", name: "Ademi", joined: "Just now", payment: "CONFIRMED", status: "SUBMITTED", answer: 338 },
  { id: "live-nora", name: "Nora B.", joined: "Just now", payment: "CONFIRMED", status: "SUBMITTED", answer: 351 },
  { id: "live-sam", name: "Sam K.", joined: "Just now", payment: "CONFIRMED", status: "SUBMITTED", answer: 329 },
];

const ChevronLeftIcon = icons.chevronLeft;
const CrownIcon = icons.crown;

export default function GameDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [game, setGame] = useState(null);
  const [liveGuessers, setLiveGuessers] = useState([]);
  const [joinEvent, setJoinEvent] = useState(null);

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

  useEffect(() => {
    if (!game || game.status !== GAME_STATUS.LIVE) return undefined;
    const timer = window.setInterval(() => {
      setLiveGuessers((current) => {
        if (current.length >= liveJoiners.length) return current;
        const next = liveJoiners[current.length];
        setJoinEvent(next);
        window.setTimeout(() => setJoinEvent(null), 2600);
        return [...current, next];
      });
    }, 6500);
    return () => window.clearInterval(timer);
  }, [game]);

  const durationMinutes = useMemo(() => {
    if (!game) return 0;
    return Math.round((game.endsAt - game.startsAt) / 60000);
  }, [game]);

  if (status === "loading") return <LoadingState fullPage label="Loading game details..." />;
  if (status === "error") return <ErrorState onRetry={load} className="min-h-[50vh]" />;

  const now = Date.now();
  const secondsToStart = Math.max(0, Math.round((game.startsAt - now) / 1000));
  const secondsToEnd = Math.max(0, Math.round((game.endsAt - now) / 1000));
  const countdownSeconds = game.status === GAME_STATUS.LIVE ? secondsToEnd : secondsToStart;
  const countdownLabel = game.status === GAME_STATUS.LIVE ? "Ends in" : "Starts in";
  const session = getSession();
  const currentUserGuesser = session?.user
    ? {
        id: "current-user",
        name: session.user.username ? `@${session.user.username}` : session.user.fullName,
        joined: "You",
        payment: "CONFIRMED",
        answer: null,
        isCurrentUser: true
      }
    : null;
  const donationGuessers = [
    ...(currentUserGuesser ? [currentUserGuesser] : []),
    ...(participants[game.id] || []),
    ...liveGuessers
  ];
  const confirmedGuessers = donationGuessers.filter((guesser) => guesser.payment === "CONFIRMED").length;
  const winnerPool = confirmedGuessers * 80;

  const handleEnter = () => {
    if (!isSignedIn()) {
      navigate("/signin", { state: { returnTo: `/games/${game.id}/payment` } });
      return;
    }
    if (game.requiresPayment) navigate(`/games/${game.id}/payment`);
    else if (game.requiresVerification) navigate(`/games/${game.id}/verify`);
    else navigate(`/games/${game.id}/entry`);
  };

  const renderCta = () => {
    if (game.status === GAME_STATUS.UPCOMING) return <Button size="lg" fullWidth disabled>Coming soon</Button>;
    if (game.status === GAME_STATUS.COMPLETED || game.status === GAME_STATUS.CLOSED) {
      return <Button size="lg" fullWidth onClick={() => navigate(`/games/${game.id}/result`)}>View result</Button>;
    }
    return <Button size="lg" fullWidth onClick={handleEnter}>Join and donate</Button>;
  };

  return (
    <div className="h-[calc(100vh-3rem)] overflow-hidden bg-[#111820] text-white">
      <main className="live-stream-shell">
        <section className="live-video-stage">
          <img
            src={game.media?.type === "image" && game.media.url ? game.media.url : bottleImage}
            alt={`${game.title} bottle challenge`}
            className="live-video-object"
          />
          <div className="live-video-shade" />
          <header className="live-stream-topbar">
            <IconButton label="Go back" onClick={() => navigate(-1)}>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </IconButton>
            <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-red-500 px-2 py-1 text-[10px] font-black uppercase leading-none">Live</span>
            </div>
              <h1 className="mt-1 truncate font-display text-2xl font-black">{game.title}</h1>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[10px] font-bold text-white/65">{countdownLabel}</p>
              <GameCountdown seconds={countdownSeconds} size="sm" />
            </div>
          </header>

          <div className="live-video-bottom">
            <div className="min-w-0">
              <p className="text-sm font-black">Count the balls inside the bottle</p>
            </div>
          </div>
        </section>

        <section className="live-meta-strip">
          <MiniStat label="Winner pool" value={formatCurrency(winnerPool, game.currency)} pulseKey={confirmedGuessers} />
          <MiniStat label="Guessers" value={`${confirmedGuessers}`} pulseKey={confirmedGuessers} />
          <MiniStat label="Time" value={`${durationMinutes} min`} />
          <MiniStat label="Bottle" value={bottleFacts.map((fact) => fact.value).join(" / ")} />
        </section>

        {game.status !== GAME_STATUS.LIVE && (
          <section className="live-rank-strip" aria-label="Leaderboard">
            {leaders.map((leader) => (
              <div key={leader.name} className="live-rank-pill">
                <span className="text-xs font-black">{leader.rank}</span>
                {leader.rank === 1 && <CrownIcon className="h-3.5 w-3.5 text-[#f7d85c]" aria-hidden="true" />}
                <Avatar label={leader.avatar} small />
                <span className="min-w-0 truncate text-xs font-bold">{leader.name}</span>
              </div>
            ))}
          </section>
        )}

        <DonationFeed
          guessers={donationGuessers}
          currency={game.currency}
          donation={game.entryFee}
          pool={winnerPool}
          isLive={game.status === GAME_STATUS.LIVE}
        />

        {joinEvent && <div className="live-join-toast">+1 | {joinEvent.name} added their guess</div>}

        <footer className="live-action-bar">
          <div className="min-w-0 rounded-full bg-white/8 px-4 py-3 text-xs font-semibold text-white/72">
            80 FCFA from each donation goes to the winner pool.
          </div>
          {renderCta()}
        </footer>
      </main>
    </div>
  );
}

function DonationFeed({ guessers, currency, donation, pool, isLive }) {
  const currentUser = guessers.find((guesser) => guesser.isCurrentUser);
  const list = guessers.filter((guesser) => !guesser.isCurrentUser).slice().reverse();

  return (
    <section className="live-chat-feed">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-black">Donation Guessers</h2>
          <p className="text-[11px] text-white/55">Pool {formatCurrency(pool, currency)}</p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">{guessers.length}</span>
      </div>
      {currentUser && (
        <div className="live-current-guess">
          <GuesserMessage guesser={currentUser} avatar="lila" currency={currency} donation={donation} pinned isLive={isLive} />
        </div>
      )}
      <div className="live-chat-scroll scroll-thin">
        {list.map((guesser, index) => (
          <GuesserMessage
            key={guesser.id}
            guesser={guesser}
            avatar={leaders[index % leaders.length].avatar}
            currency={currency}
            donation={donation}
            isLive={isLive}
            fresh={guesser.id?.startsWith("live-")}
          />
        ))}
      </div>
    </section>
  );
}

function GuesserMessage({ guesser, avatar, pinned = false, fresh = false, isLive = false }) {
  const answerText = guesser.answer == null ? "Guess pending" : `Guessed ${guesser.answer}`;
  const joinedAt = guesser.joined || (fresh ? "Just now" : "Recently");

  return (
    <article className={`live-chat-row ${pinned ? "is-current" : ""} ${fresh ? "guess-row-new" : ""}`}>
      <Avatar label={avatar} small />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-black">
          {guesser.name}
          {pinned && <span className="ml-2 text-[10px] text-[#f7d85c]">You</span>}
        </p>
        <p className="truncate text-[11px] text-white/62">
          <span className={isLive && guesser.answer != null ? "live-blurred-answer" : ""}>{answerText}</span> | {joinedAt}
        </p>
      </div>
    </article>
  );
}

function IconButton({ label, onClick, children }) {
  return (
    <button type="button" onClick={onClick} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/35 text-white shadow-lg backdrop-blur transition hover:bg-black/55" aria-label={label} title={label}>
      {children}
    </button>
  );
}

function Avatar({ label, small = false }) {
  return <div className={`${small ? "h-7 w-7" : "h-14 w-14"} profile-avatar profile-avatar-${label} shadow-lg`}><span className="profile-avatar-face" /><span className="profile-avatar-hair" /><span className="profile-avatar-smile" /></div>;
}

function MiniStat({ label, value, pulseKey }) {
  return (
    <div key={pulseKey ?? label} className="stat-pop min-w-0 rounded-2xl bg-white/8 px-3 py-2 backdrop-blur">
      <p className="truncate text-[10px] font-bold text-white/50">{label}</p>
      <p className="truncate text-xs font-black text-white">{value}</p>
    </div>
  );
}
