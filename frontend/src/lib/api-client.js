import { API_BASE_URL } from "./constants";

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export function fetchHealth() {
  return apiFetch("/health");
}

export function fetchLessons() {
  return apiFetch("/lessons");
}

export function requestHint(topic, question) {
  return apiFetch("/ai/hint", {
    method: "POST",
    body: JSON.stringify({ topic, question }),
  });
}
