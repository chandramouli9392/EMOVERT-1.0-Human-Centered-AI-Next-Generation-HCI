import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = Cookies.get("emovert_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("emovert_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post("/auth/login", { email, password }),
  register: (email: string, password: string, name: string) =>
    apiClient.post("/auth/register", { email, password, name }),
  googleLogin: (token: string) =>
    apiClient.post("/auth/google", { token }),
  me: () => apiClient.get("/auth/me"),
  logout: () => apiClient.post("/auth/logout"),
};

// Session APIs
export const sessionAPI = {
  start: () => apiClient.post("/sessions/start"),
  end: (sessionId: string | number, duration?: number) =>
    apiClient.post(`/sessions/${sessionId}/end`, duration !== undefined ? { duration } : {}),
  pause: (sessionId: string) => apiClient.post(`/sessions/${sessionId}/pause`),
  resume: (sessionId: string) => apiClient.post(`/sessions/${sessionId}/resume`),
  getHistory: () => apiClient.get("/sessions/history"),
  getById: (sessionId: string) => apiClient.get(`/sessions/${sessionId}`),
};

// Emotion APIs
export const emotionAPI = {
  detect: (imageData: string, sessionId?: number | string) =>
    apiClient.post("/emotions/detect", { image_data: imageData, session_id: sessionId ? Number(sessionId) : undefined }),
  getHistory: (period?: string) =>
    apiClient.get(`/emotions/history${period ? `?period=${period}` : ""}`),
  getSummary: (date: string) => apiClient.get(`/emotions/summary?date=${date}`),
  getTrends: () => apiClient.get("/emotions/trends"),
};

// Focus APIs
export const focusAPI = {
  analyze: (imageData: string) =>
    apiClient.post("/focus/analyze", { image_data: imageData }),
  getScore: (sessionId: string) => apiClient.get(`/focus/score/${sessionId}`),
  getTrends: () => apiClient.get("/focus/trends"),
};

// Analytics APIs
export const analyticsAPI = {
  getDashboard: () => apiClient.get("/analytics/dashboard"),
  getWeekly: () => apiClient.get("/analytics/weekly"),
  getMonthly: () => apiClient.get("/analytics/monthly"),
  getCalendar: (year: number, month: number) =>
    apiClient.get(`/analytics/calendar?year=${year}&month=${month}`),
};

// Coach APIs
export const coachAPI = {
  getDailyReport: () => apiClient.get("/coach/daily"),
  getWeeklyReport: () => apiClient.get("/coach/weekly"),
  getInsights: () => apiClient.get("/coach/insights"),
  getRecommendations: (emotion: string) =>
    apiClient.get(`/coach/recommendations?emotion=${emotion}`),
};

// Chat APIs
export const chatAPI = {
  send: (message: string, emotion?: string) =>
    apiClient.post("/chat/send", { message, emotion }),
  getHistory: () => apiClient.get("/chat/history"),
};

// Music APIs
export const musicAPI = {
  getTracks: (category?: string) =>
    apiClient.get(`/music/tracks${category ? `?category=${category}` : ""}`),
  getFavorites: () => apiClient.get("/music/favorites"),
  toggleFavorite: (trackId: string) =>
    apiClient.post(`/music/favorites/${trackId}`),
  getRecommendations: (emotion: string) =>
    apiClient.get(`/music/recommendations?emotion=${emotion}`),
};

// Report APIs
export const reportAPI = {
  generateWeekly: () => apiClient.get("/reports/weekly", { responseType: "blob" }),
  generateMonthly: () => apiClient.get("/reports/monthly", { responseType: "blob" }),
  share: (reportId: string) => apiClient.post(`/reports/${reportId}/share`),
};

// Achievement APIs
export const achievementAPI = {
  getAll: () => apiClient.get("/achievements"),
  getUnlocked: () => apiClient.get("/achievements/unlocked"),
};

// Environmental Adaptation APIs
export const environmentAPI = {
  apply: (emotion: string, deviceTarget?: string, simulateFailure?: boolean) =>
    apiClient.post("/environment/apply", {
      emotion,
      device_target: deviceTarget || "all",
      simulate_hardware_failure: Boolean(simulateFailure),
    }),
  getStatus: () => apiClient.get("/environment/status"),
  getPreset: (emotion: string) => apiClient.get(`/environment/presets/${emotion}`),
};

// Multimodal Interaction Telemetry APIs
export const interactionAPI = {
  recordEvent: (event: {
    session_id?: number | null;
    interaction_id: string;
    event_type: string;
    modality?: string;
    source?: string;
    latency_ms?: number;
    is_fallback?: boolean;
    recovery_outcome?: string;
    confirmed_emotion?: string;
  }) => apiClient.post("/interactions/events", event),
  getMetrics: () => apiClient.get("/interactions/metrics"),
};
