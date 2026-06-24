import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const emotionColors: Record<string, string> = {
  happy: "#22c55e",
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
  sleepy: "#1e3a5f",
};

export const emotionIcons: Record<string, string> = {
  happy: "😊",
  sad: "😢",
  angry: "😠",
  neutral: "😐",
  surprise: "😲",
  fear: "😨",
  stress: "😫",
  anxiety: "😰",
  disgust: "🤢",
  boredom: "😴",
  confusion: "😕",
  contempt: "😒",
  focused: "🎯",
  sleepy: "💤",
};

export const emotionDescriptions: Record<string, string> = {
  happy: "You're feeling positive and joyful",
  sad: "You might need some uplifting activities",
  angry: "Take a moment to breathe and calm down",
  neutral: "You're in a balanced state",
  surprise: "Something unexpected caught your attention",
  fear: "You're feeling apprehensive or worried",
  stress: "Your body is signaling high tension",
  anxiety: "You're experiencing nervous energy",
  disgust: "Something is bothering you",
  boredom: "You might need stimulation",
  confusion: "You're processing complex information",
  contempt: "You're feeling dismissive",
  focused: "You're in deep concentration",
  sleepy: "Your energy is low",
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
