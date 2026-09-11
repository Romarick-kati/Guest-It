import { Navigate } from "react-router-dom";

// Temporary stand-in for real sign-in (backend team's scope — see App.jsx).
// The brand splash is already shown once by App.jsx before routes render,
// so this just hands off straight to the participant dashboard — no extra
// logo screen, no account picker. There is no admin option here on
// purpose: until real login is connected, admin access is URL-only
// (going to /admin loads the admin dashboard directly). Once sign-in is
// wired up, this route should be replaced so each user is sent to their
// own section based on their account instead of always landing on /games.
export default function Landing() {
  return <Navigate to="/games" replace />;
}
