import { API_BASE_URL } from "../config";

const ADMIN_SESSION_KEY = "career_admin_session";
const LATEST_RESULT_KEY = "career_quiz_latest_result";
const QUIZ_PROGRESS_KEY = "career_quiz_progress";

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    }
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const error = new Error(data?.message || "Something went wrong.");
    error.status = response.status;
    throw error;
  }

  return data;
}

export function getQuestions() {
  return apiRequest("/api/questions");
}

export function submitQuizResult(payload) {
  return apiRequest("/api/results", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function loginAdmin(payload) {
  return apiRequest("/api/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function addQuestion(payload, token) {
  return apiRequest("/api/questions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
}

export function getResultAnalysis(token) {
  return apiRequest("/api/results/analysis", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export function saveAdminSession(session) {
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
}

export function getAdminSession() {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_SESSION_KEY) || "null");
  } catch (_error) {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    return null;
  }
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

export function saveLatestResult(result) {
  localStorage.setItem(LATEST_RESULT_KEY, JSON.stringify(result));
}

export function getLatestResult() {
  try {
    return JSON.parse(localStorage.getItem(LATEST_RESULT_KEY) || "null");
  } catch (_error) {
    localStorage.removeItem(LATEST_RESULT_KEY);
    return null;
  }
}

export function saveQuizProgress(progress) {
  localStorage.setItem(QUIZ_PROGRESS_KEY, JSON.stringify(progress));
}

export function getQuizProgress() {
  try {
    return JSON.parse(localStorage.getItem(QUIZ_PROGRESS_KEY) || "{}");
  } catch (_error) {
    localStorage.removeItem(QUIZ_PROGRESS_KEY);
    return {};
  }
}

export function clearQuizProgress() {
  localStorage.removeItem(QUIZ_PROGRESS_KEY);
}
