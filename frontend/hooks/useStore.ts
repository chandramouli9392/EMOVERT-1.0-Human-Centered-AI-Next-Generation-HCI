import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  User,
  SessionData,
  EmotionData,
  PrivacySettings,
  ChatMessage,
  MusicTrack,
  Notification,
} from "@/types";

interface EmovertState {
  // User
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;

  // Session
  currentSession: SessionData | null;
  setCurrentSession: (session: SessionData | null) => void;
  isSessionActive: boolean;
  setIsSessionActive: (value: boolean) => void;
  isPaused: boolean;
  setIsPaused: (value: boolean) => void;
  sessionDuration: number;
  setSessionDuration: (duration: number) => void;
  incrementSessionDuration: () => void;

  // Emotion
  currentEmotion: EmotionData | null;
  setCurrentEmotion: (emotion: EmotionData | null) => void;
  emotionHistory: EmotionData[];
  setEmotionHistory: (history: EmotionData[]) => void;
  addEmotion: (emotion: EmotionData) => void;

  // Focus
  focusScore: number;
  setFocusScore: (score: number) => void;
  attentionScore: number;
  setAttentionScore: (score: number) => void;
  distractionCount: number;
  setDistractionCount: (count: number) => void;
  incrementDistractionCount: () => void;

  // Drowsiness
  drowsinessScore: number;
  setDrowsinessScore: (score: number) => void;
  drowsinessEvents: number;
  setDrowsinessEvents: (count: number) => void;
  incrementDrowsinessEvents: () => void;

  // Privacy
  privacySettings: PrivacySettings;
  setPrivacySettings: (settings: Partial<PrivacySettings>) => void;
  privacyMode: boolean;
  setPrivacyMode: (value: boolean) => void;

  // Chat
  chatMessages: ChatMessage[];
  setChatMessages: (messages: ChatMessage[]) => void;
  addChatMessage: (message: ChatMessage) => void;

  // Music
  currentTrack: MusicTrack | null;
  setCurrentTrack: (track: MusicTrack | null) => void;
  isPlaying: boolean;
  setIsPlaying: (value: boolean) => void;

  // Notifications
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;

  // UI
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Stats
  totalSessions: number;
  setTotalSessions: (count: number) => void;
  totalEmotionsLogged: number;
  setTotalEmotionsLogged: (count: number) => void;
  streak: number;
  setStreak: (count: number) => void;
  eqScore: number;
  setEqScore: (score: number) => void;
}

export const useEmovertStore = create<EmovertState>()(
  persist(
    (set) => ({
      // User
      user: null,
      setUser: (user) => set({ user }),
      isAuthenticated: false,
      setIsAuthenticated: (value) => set({ isAuthenticated: value }),

      // Session
      currentSession: null,
      setCurrentSession: (session) => set({ currentSession: session }),
      isSessionActive: false,
      setIsSessionActive: (value) => set({ isSessionActive: value }),
      isPaused: false,
      setIsPaused: (value) => set({ isPaused: value }),
      sessionDuration: 0,
      setSessionDuration: (duration) => set({ sessionDuration: duration }),
      incrementSessionDuration: () =>
        set((state) => ({ sessionDuration: state.sessionDuration + 1 })),

      // Emotion
      currentEmotion: null,
      setCurrentEmotion: (emotion) => set({ currentEmotion: emotion }),
      emotionHistory: [],
      setEmotionHistory: (history) => set({ emotionHistory: history }),
      addEmotion: (emotion) =>
        set((state) => ({
          emotionHistory: [...state.emotionHistory, emotion],
        })),

      // Focus
      focusScore: 0,
      setFocusScore: (score) => set({ focusScore: score }),
      attentionScore: 0,
      setAttentionScore: (score) => set({ attentionScore: score }),
      distractionCount: 0,
      setDistractionCount: (count) => set({ distractionCount: count }),
      incrementDistractionCount: () =>
        set((state) => ({
          distractionCount: state.distractionCount + 1,
        })),

      // Drowsiness
      drowsinessScore: 0,
      setDrowsinessScore: (score) => set({ drowsinessScore: score }),
      drowsinessEvents: 0,
      setDrowsinessEvents: (count) => set({ drowsinessEvents: count }),
      incrementDrowsinessEvents: () =>
        set((state) => ({
          drowsinessEvents: state.drowsinessEvents + 1,
        })),

      // Privacy
      privacySettings: {
        privacyMode: false,
        storeAnalytics: true,
        allowNotifications: true,
        shareData: false,
      },
      setPrivacySettings: (settings) =>
        set((state) => ({
          privacySettings: { ...state.privacySettings, ...settings },
        })),
      privacyMode: false,
      setPrivacyMode: (value) => set({ privacyMode: value }),

      // Chat
      chatMessages: [],
      setChatMessages: (messages) => set({ chatMessages: messages }),
      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [...state.chatMessages, message],
        })),

      // Music
      currentTrack: null,
      setCurrentTrack: (track) => set({ currentTrack: track }),
      isPlaying: false,
      setIsPlaying: (value) => set({ isPlaying: value }),

      // Notifications
      notifications: [],
      setNotifications: (notifications) => set({ notifications }),
      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
        })),
      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      // UI
      sidebarOpen: true,
      setSidebarOpen: (value) => set({ sidebarOpen: value }),
      activeTab: "dashboard",
      setActiveTab: (tab) => set({ activeTab: tab }),

      // Stats
      totalSessions: 0,
      setTotalSessions: (count) => set({ totalSessions: count }),
      totalEmotionsLogged: 0,
      setTotalEmotionsLogged: (count) => set({ totalEmotionsLogged: count }),
      streak: 0,
      setStreak: (count) => set({ streak: count }),
      eqScore: 0,
      setEqScore: (score) => set({ eqScore: score }),
    }),
    {
      name: "emovert-store",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        privacySettings: state.privacySettings,
        totalSessions: state.totalSessions,
        totalEmotionsLogged: state.totalEmotionsLogged,
        streak: state.streak,
        eqScore: state.eqScore,
      }),
    }
  )
);
