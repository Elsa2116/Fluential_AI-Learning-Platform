import axios from "axios";
import { API_BASE_URL, API_TIMEOUT_MS } from "./constants";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

function normalizeError(error) {
  if (error?.response?.data?.detail) {
    return new Error(error.response.data.detail);
  }

  return new Error(error?.message || "Request failed");
}

export async function registerUser(payload) {
  try {
    const response = await api.post("/register", payload);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function loginUser(payload) {
  try {
    const response = await api.post("/login", payload);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function fetchCourses() {
  try {
    const response = await api.get("/courses");
    return response.data;
  } catch {
    const fallback = await api.get("/lessons");
    return fallback.data;
  }
}

export async function fetchLessons() {
  return fetchCourses();
}

export async function requestHint(topic, question) {
  try {
    const response = await api.post("/chat", { topic, question });
    return response.data;
  } catch {
    const fallback = await api.post("/ai/hint", { topic, question });
    return fallback.data;
  }
}

export async function fetchRecommendations(userId) {
  try {
    const response = await api.get("/recommend", {
      params: userId ? { user_id: userId } : {},
    });
    return response.data;
  } catch {
    return [
      "Revise Python basics and complete one exercise.",
      "Practice API design with one mini project.",
      "Take a short quiz to validate understanding.",
    ];
  }
}

export async function summarizeLesson(content) {
  try {
    const response = await api.post("/summary", { content });
    return response.data;
  } catch {
    return {
      summary:
        "Summary preview: break the lesson into key ideas, examples, and one practical task.",
    };
  }
}

export async function generateQuiz(content) {
  try {
    const response = await api.post("/quiz/generate", { content });
    return response.data;
  } catch {
    return {
      questions: [
        {
          id: 1,
          prompt: "What is the main concept of this lesson?",
          choices: ["Concept A", "Concept B", "Concept C", "Concept D"],
          answer: "Concept A",
        },
      ],
    };
  }
}
