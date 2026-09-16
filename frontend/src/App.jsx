import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import SplashScreen from "./components/ui/SplashScreen";

import PlayerLayout from "./layouts/PlayerLayout";
import AdminLayout from "./layouts/AdminLayout";
import Landing from "./pages/Landing";
import { getSession } from "./lib/auth";

// Player pages
import Games from "./pages/player/Games";
import GameDetails from "./pages/player/GameDetails";
import Payment from "./pages/player/Payment";
import PaymentCheckout from "./pages/player/PaymentCheckout";
import PaymentProcessing from "./pages/player/PaymentProcessing";
import PaymentSuccess from "./pages/player/PaymentSuccess";
import PaymentFailed from "./pages/player/PaymentFailed";
import PaymentCancelled from "./pages/player/PaymentCancelled";
import Verification from "./pages/player/Verification";
import GameEntry from "./pages/player/GameEntry";
import GamePlay from "./pages/player/GamePlay";
import Submission from "./pages/player/Submission";
import GameWaiting from "./pages/player/GameWaiting";
import GameResult from "./pages/player/GameResult";
import Profile from "./components/profile/Profile";
import SignIn from "./components/auth/SignIn";
import SignUp from "./components/auth/SignUp";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminGames from "./pages/admin/AdminGames";
import CreateGame from "./pages/admin/CreateGame";
import EditGame from "./pages/admin/EditGame";
import AdminGameDetails from "./pages/admin/AdminGameDetails";
import LiveGame from "./pages/admin/LiveGame";
import Participants from "./pages/admin/Participants";
import AdminParticipants from "./pages/admin/AdminParticipants";
import Winners from "./pages/admin/Winners";
import AdminResult from "./pages/admin/AdminResult";
import AdminResults from "./pages/admin/AdminResults";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUserDetails from "./pages/admin/AdminUserDetails";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminSettings from "./pages/admin/AdminSettings";

function AuthPage({ initialMode = "signin" }) {
  const [mode, setMode] = useState(initialMode);
  const location = useLocation();
  const navigate = useNavigate();
  const returnTo = location.state?.returnTo || "/games/g1";

  const handleAuthenticated = () => {
    // An admin account always lands on their own dashboard, never the
    // player one - even if returnTo points into the player app (e.g. they
    // got bounced here from a player page before signing in as admin).
    const isAdmin = Boolean(getSession()?.user?.isAdmin);
    navigate(isAdmin ? "/admin" : returnTo, { replace: true });
  };

  const handleBack = () => {
    navigate(-1);
  };

  return mode === "signup" ? (
    <SignUp onBack={handleBack} onSignIn={() => setMode("signin")} onAuthenticated={handleAuthenticated} />
  ) : (
    <SignIn onBack={handleBack} onSignUp={() => setMode("signup")} onAuthenticated={handleAuthenticated} />
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <ThemeProvider>
      <ToastProvider>
        {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
        <BrowserRouter>
          <Routes>
            {/* No account-aware landing page yet, so this just sends
                everyone straight to the participant dashboard after the
                splash. Signing in still routes an admin account to /admin
                (see AuthPage's handleAuthenticated) and AdminLayout/
                PlayerLayout each redirect the other role away, so this only
                matters for the very first, not-yet-signed-in load. */}
            <Route path="/" element={<Landing />} />

            {/* Player experience */}
            <Route element={<PlayerLayout />}>
              <Route path="/games" element={<Games />} />
              <Route path="/games/:id" element={<GameDetails />} />
              <Route path="/games/:id/payment" element={<Payment />} />
              <Route path="/games/:id/checkout" element={<PaymentCheckout />} />
              <Route path="/games/:id/payment/processing" element={<PaymentProcessing />} />
              <Route path="/games/:id/payment/success" element={<PaymentSuccess />} />
              <Route path="/games/:id/payment/failed" element={<PaymentFailed />} />
              <Route path="/games/:id/payment/cancelled" element={<PaymentCancelled />} />
              <Route path="/games/:id/verify" element={<Verification />} />
              <Route path="/games/:id/entry" element={<GameEntry />} />
              <Route path="/games/:id/play" element={<GamePlay />} />
              <Route path="/games/:id/submitted" element={<Submission />} />
              <Route path="/games/:id/closed" element={<GameWaiting />} />
              <Route path="/games/:id/result" element={<GameResult />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route path="/signin" element={<AuthPage initialMode="signin" />} />
            <Route path="/signup" element={<AuthPage initialMode="signup" />} />

            {/* Admin experience - ON Point platform administration */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="games" element={<AdminGames />} />
              <Route path="games/create" element={<CreateGame />} />
              <Route path="games/:id" element={<AdminGameDetails />} />
              <Route path="games/:id/edit" element={<EditGame />} />
              <Route path="games/:id/live" element={<LiveGame />} />
              <Route path="games/:id/participants" element={<Participants />} />
              <Route path="games/:id/result" element={<AdminResult />} />
              <Route path="participants" element={<AdminParticipants />} />
              <Route path="winners" element={<Winners />} />
              <Route path="results" element={<AdminResults />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="users/:id" element={<AdminUserDetails />} />
              <Route path="transactions" element={<AdminTransactions />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}
