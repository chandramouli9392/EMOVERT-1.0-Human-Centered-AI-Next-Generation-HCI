import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseServerDate(date: Date | string | undefined | null): Date {
  if (!date) return new Date();
  if (date instanceof Date) return date;
  let s = String(date).trim();
  // If the server string has time and lacks a timezone offset or Z, treat as UTC
  if (s.includes(":") && !s.endsWith("Z") && !/[+-]\d{2}(:\d{2})?$/.test(s)) {
    s = s.replace(" ", "T") + "Z";
  }
  const parsed = new Date(s);
  return isNaN(parsed.getTime()) ? new Date(date) : parsed;
}

export function formatTimer(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  const pad = (n: number) => String(n).padStart(2, "0");
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  }
  return `${pad(minutes)}:${pad(secs)}`;
}

export function formatTimeAgo(date: Date | string): string {
  const d = parseServerDate(date);
  const diffSec = Math.max(0, Math.round((Date.now() - d.getTime()) / 1000));
  if (diffSec < 60) return "Just now";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

export function formatDate(date: Date | string): string {
  const d = parseServerDate(date);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(date: Date | string): string {
  const d = parseServerDate(date);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const emotionColors: Record<string, string> = {
  happy: "#22c55e",
  excited: "#eab308",
  sad: "#3b82f6",
  angry: "#ef4444",
  neutral: "#6b7280",
  surprise: "#f97316",
  fear: "#8b5cf6",
  stress: "#dc2626",
  anxiety: "#f59e0b",
  disgust: "#84cc16",
  boredom: "#71717a",
  confusion: "#a855f7",
  contempt: "#52525b",
  focused: "#00f0ff",
  calm: "#06b6d4",
  curious: "#a855f7",
  sleepy: "#6366f1",
};

export const emotionIcons: Record<string, string> = {
  happy: "😊",
  excited: "🤩",
  sad: "😢",
  angry: "😠",
  neutral: "😐",
  surprise: "😲",
  fear: "😨",
  stress: "😫",
  anxiety: "😰",
  disgust: "🤢",
  boredom: "🥱",
  confusion: "😕",
  contempt: "😒",
  focused: "🎯",
  calm: "😌",
  curious: "🧐",
  sleepy: "😴",
};

export const emotionDescriptions: Record<string, string> = {
  happy: "You're feeling positive and joyful",
  excited: "High energy, optimism, and enthusiasm",
  sad: "You might need some uplifting activities",
  angry: "Take a moment to breathe and calm down",
  neutral: "You're in a balanced resting state",
  surprise: "Something unexpected caught your attention",
  fear: "You're feeling apprehensive or alert",
  stress: "Your body is signaling high tension",
  anxiety: "You're experiencing nervous energy",
  disgust: "Something is bothering or repelling you",
  boredom: "Low stimulation detected; try switching tasks",
  confusion: "You're processing complex or puzzling information",
  contempt: "You're feeling dismissive or skeptical",
  focused: "You're in deep flow and concentration",
  calm: "Tranquil, peaceful, and centered",
  curious: "Inquisitive and actively exploring ideas",
  sleepy: "Low arousal detected; consider a brief rest",
};

export function getEmotionColor(emotion: string): string {
  return emotionColors[emotion.toLowerCase()] || "#6b7280";
}

export function getEmotionIcon(emotion: string): string {
  return emotionIcons[emotion.toLowerCase()] || "😐";
}

export function getEmotionDescription(emotion: string): string {
  return emotionDescriptions[emotion.toLowerCase()] || "Emotion detected";
}

export function calculateFocusScore(
  attentionDuration: number,
  totalDuration: number,
  distractionCount: number,
  engagementLevel: number
): number {
  if (totalDuration === 0) return 0;

  const attentionRatio = attentionDuration / totalDuration;
  const distractionPenalty = Math.min(distractionCount * 0.05, 0.3);
  const engagementBonus = engagementLevel * 0.2;

  const score = Math.round(
    (attentionRatio * 100 - distractionPenalty * 100 + engagementBonus * 100)
  );

  return Math.max(0, Math.min(100, score));
}

export function getFocusCategory(score: number): { label: string; color: string } {
  if (score >= 90) return { label: "Elite Focus", color: "#22c55e" };
  if (score >= 75) return { label: "Good Focus", color: "#00f0ff" };
  if (score >= 50) return { label: "Average", color: "#f59e0b" };
  return { label: "Needs Improvement", color: "#ef4444" };
}

export function calculateEQScore(
  emotionalStability: number,
  recoverySpeed: number,
  positiveRatio: number,
  consistency: number
): number {
  const score = Math.round(
    (emotionalStability * 0.3 +
      recoverySpeed * 0.25 +
      positiveRatio * 0.25 +
      consistency * 0.2) * 100
  );
  return Math.max(0, Math.min(100, score));
}

export function getStreakBadge(streak: number): { name: string; icon: string } {
  if (streak >= 100) return { name: "Century Streak", icon: "🏆" };
  if (streak >= 50) return { name: "Half Century", icon: "🌟" };
  if (streak >= 30) return { name: "Monthly Master", icon: "🔥" };
  if (streak >= 7) return { name: "Week Warrior", icon: "⚡" };
  if (streak >= 3) return { name: "Getting Started", icon: "🚀" };
  return { name: "Newcomer", icon: "🌱" };
}
