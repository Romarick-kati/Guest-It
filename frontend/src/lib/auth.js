const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const SESSION_KEY = "onpoint_session";

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

export function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function isSignedIn() {
  return Boolean(getSession()?.token);
}

async function authRequest(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Authentication failed.");
  saveSession(data);
  return data;
}

export function signIn(payload) {
  return authRequest("/api/auth/signin", payload);
}

export function signUp(payload) {
  return authRequest("/api/auth/signup", payload);
}

export async function checkUsername(username) {
  const response = await fetch(`${API_BASE_URL}/api/auth/check-username`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Could not check username.");
  return data;
}
