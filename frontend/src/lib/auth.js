import { API_BASE_URL, httpError } from "./httpBase";

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

export function signOut() {
  localStorage.removeItem(SESSION_KEY);
}

export async function fetchProfile() {
  const session = getSession();
  if (!session?.token) throw httpError("Sign in required.", 401);

  const response = await fetch(`${API_BASE_URL}/api/profile/me`, {
    headers: { Authorization: `Bearer ${session.token}` }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw httpError(data.message || "Could not load profile.", response.status);
  return data;
}

export async function updateProfile(payload) {
  const session = getSession();
  if (!session?.token) throw httpError("Sign in required.", 401);

  const response = await fetch(`${API_BASE_URL}/api/profile/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.token}` },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw httpError(data.message || "Could not update profile.", response.status);
  saveSession({ ...session, user: data });
  return data;
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
