export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}
