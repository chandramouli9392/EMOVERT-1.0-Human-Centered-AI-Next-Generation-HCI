export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  totalSessions: number;
  totalEmotionsLogged: number;
  dominantEmotion: string;
  focusScore: number;
  eqScore: number;
  streak: number;
  achievements: string[];
}

export interface EmotionData {
  id: string;
  userId: string;
  emotion: string;
  confidence: number;
  timestamp: string;
  sessionId: string;
}

export interface SessionData {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  duration: number;
  focusScore: number;
  attentionScore: number;
  drowsinessScore: number;
  emotionChanges: EmotionData[];
  drowsinessEvents: number;
  distractionEvents: number;
  status: "active" | "paused" | "completed";
}

export interface FocusMetrics {
  attentionDuration: number;
  totalDuration: number;
  distractionCount: number;
  engagementLevel: number;
  score: number;
  category: string;
}

export interface DrowsinessEvent {
  id: string;
  sessionId: string;
  timestamp: string;
  severity: "low" | "medium" | "high";
}

export interface DistractionEvent {
  id: string;
  sessionId: string;
  timestamp: string;
  type: "gaze" | "head_pose" | "away";
  duration: number;
}

export interface EmotionSummary {
  date: string;
  dominantEmotion: string;
  emotionCounts: Record<string, number>;
  totalEmotions: number;
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  dominantEmotion: string;
  focusScore: number;
  drowsinessScore: number;
  distractionScore: number;
  emotionData: EmotionData[];
  recommendations: string[];
  coachInsights: string[];
}

export interface Recommendation {
  id: string;
  type: "food" | "exercise" | "yoga" | "breathing" | "sleep" | "wellness" | "productivity" | "activity";
  title: string;
  description: string;
  forEmotion: string;
  duration?: string;
  difficulty?: string;
  image?: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  category: "calm" | "focus" | "meditation" | "sleep" | "nature" | "instrumental" | "lofi";
  duration: number;
  url: string;
  cover?: string;
  isFavorite: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  emotion?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  category: "session" | "focus" | "emotion" | "productivity" | "mindfulness" | "consistency" | "streak";
}

export interface Notification {
  id: string;
  type: "focus" | "drowsiness" | "distraction" | "streak" | "achievement" | "recommendation";
  message: string;
  timestamp: string;
  read: boolean;
}

export interface PrivacySettings {
  privacyMode: boolean;
  storeAnalytics: boolean;
  allowNotifications: boolean;
  shareData: boolean;
}

export interface AIInsight {
  id: string;
  type: "pattern" | "correlation" | "suggestion" | "alert";
  message: string;
  confidence: number;
  timestamp: string;
}
