"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useEmovertStore } from "@/hooks/useStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Target,
  Zap,
  TrendingUp,
  Flame,
  Clock,
  Smile,
  AlertTriangle,
  Eye,
  Activity,
  ArrowRight,
  Play,
  Pause,
  Shield,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { getEmotionColor, getEmotionIcon, getFocusCategory, formatDuration } from "@/lib/utils";
import { analyticsAPI, emotionAPI, focusAPI } from "@/lib/api";

const defaultEmotionDistribution = [
  { name: "Happy", value: 36, color: "#22c55e" },
  { name: "Neutral", value: 25, color: "#6b7280" },
  { name: "Sad", value: 15, color: "#3b82f6" },
  { name: "Angry", value: 12, color: "#ef4444" },
  { name: "Others", value: 12, color: "#a855f7" },
];

const defaultFocusTrend = [
  { time: "8AM", score: 85 },
  { time: "10AM", score: 92 },
  { time: "12PM", score: 78 },
  { time: "2PM", score: 65 },
  { time: "4PM", score: 72 },
  { time: "6PM", score: 88 },
  { time: "8PM", score: 75 },
];

const defaultRecentEmotions = [
  { emotion: "happy", confidence: 0.94, time: "2 min ago" },
  { emotion: "focused", confidence: 0.87, time: "5 min ago" },
  { emotion: "neutral", confidence: 0.91, time: "8 min ago" },
  { emotion: "stress", confidence: 0.72, time: "12 min ago" },
];

const defaultInsights = [
  "You are happiest between 8 AM and 11 AM",
  "You focus best during morning study sessions",
  "Exercise days correlate with happier emotions",
  "Your stress is lowest after meditation",
];

const defaultEmotionData = [
  { name: "Mon", happy: 4, neutral: 3, sad: 1, stress: 0 },
  { name: "Tue", happy: 3, neutral: 4, sad: 0, stress: 1 },
  { name: "Wed", happy: 5, neutral: 2, sad: 0, stress: 0 },
  { name: "Thu", happy: 2, neutral: 3, sad: 2, stress: 1 },
  { name: "Fri", happy: 4, neutral: 2, sad: 1, stress: 0 },
  { name: "Sat", happy: 6, neutral: 1, sad: 0, stress: 0 },
  { name: "Sun", happy: 5, neutral: 2, sad: 0, stress: 0 },
];

export default function DashboardPage() {
  const {
    user,
    currentEmotion,
    focusScore,
    sessionDuration,
    isSessionActive,
    isPaused,
    privacyMode,
    streak,
    eqScore,
    drowsinessEvents,
    distractionCount,
    setFocusScore,
    setStreak,
    setEqScore,
    setDrowsinessEvents,
    setDistractionCount,
    setSessionDuration,
  } = useEmovertStore();

  const [recentEmotions, setRecentEmotions] = useState<any[]>([]);
  const [focusTrend, setFocusTrend] = useState<any[]>([]);
  const [emotionDistribution, setEmotionDistribution] = useState<any[]>([]);
  const [weeklyEmotionTimeline, setWeeklyEmotionTimeline] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>(defaultInsights);

  useEffect(() => {
    // 1. Fetch dashboard stats
    analyticsAPI.getDashboard()
      .then((res) => {
        const stats = res.data;
        setFocusScore(stats.average_focus || 78);
        setStreak(stats.streak || 0);
        setEqScore(stats.eq_score || 72);
        setDrowsinessEvents(stats.total_drowsiness_events || 0);
        setDistractionCount(stats.total_distraction_events || 0);
        setSessionDuration(stats.total_focus_hours * 3600); // Set total focus hours converted to seconds
      })
      .catch((err) => console.error("Failed to load dashboard statistics:", err));

    // 2. Fetch recent emotions history
    emotionAPI.getHistory()
      .then((res) => {
        const history = res.data || [];
        if (history.length > 0) {
          const formatted = history.slice(0, 5).map((log: any) => {
            const date = new Date(log.timestamp);
            const diffMin = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));
            return {
              emotion: log.emotion,
              confidence: log.confidence,
              time: `${diffMin} min ago`
            };
          });
          setRecentEmotions(formatted);

          // Compute emotion distribution dynamically from history
          const counts: Record<string, number> = {};
          history.forEach((log: any) => {
            counts[log.emotion] = (counts[log.emotion] || 0) + 1;
          });
          const total = history.length;
          const dist = Object.keys(counts).map((emotion) => {
            let color = "#a855f7"; // default
            if (emotion === "happy") color = "#22c55e";
            else if (emotion === "neutral") color = "#6b7280";
            else if (emotion === "sad") color = "#3b82f6";
            else if (emotion === "stress" || emotion === "angry") color = "#ef4444";
            else if (emotion === "focused") color = "#06b6d4";

            return {
              name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
              value: Math.round((counts[emotion] / total) * 100),
              color
            };
          });
          setEmotionDistribution(dist);
        } else {
          setRecentEmotions(defaultRecentEmotions);
          setEmotionDistribution(defaultEmotionDistribution);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch emotion history:", err);
        setRecentEmotions(defaultRecentEmotions);
        setEmotionDistribution(defaultEmotionDistribution);
      });

    // 3. Fetch focus trends
    focusAPI.getTrends()
      .then((res) => {
        const trends = res.data?.trends || [];
        if (trends.length > 0) {
          const formatted = trends.map((t: any) => ({
            time: t.date,
            score: t.focus_score
          }));
          setFocusTrend(formatted);
        } else {
          setFocusTrend(defaultFocusTrend);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch focus trends:", err);
        setFocusTrend(defaultFocusTrend);
      });

    // 4. Fetch weekly trends
    analyticsAPI.getWeekly()
      .then((res) => {
        const weekly = res.data;
        if (weekly && weekly.labels) {
          const timeline = weekly.labels.map((label: string, i: number) => {
            const eb = weekly.emotions_breakdown[i] || {};
            return {
              name: label,
              happy: eb.happy || 0,
              neutral: eb.neutral || 0,
              sad: eb.sad || 0,
              stress: eb.stress || 0,
              focused: eb.focused || 0,
            };
          });
          setWeeklyEmotionTimeline(timeline);
        } else {
          setWeeklyEmotionTimeline(defaultEmotionData);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch weekly trends:", err);
        setWeeklyEmotionTimeline(defaultEmotionData);
      });
  }, [setFocusScore, setStreak, setEqScore, setDrowsinessEvents, setDistractionCount, setSessionDuration]);

  const focusCategory = getFocusCategory(focusScore || 78);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Welcome back,{" "}
            <span className="gradient-text">{user?.name || "User"}</span>
          </h1>
          <p className="text-white/50 mt-1">
            Here&apos;s your emotional intelligence overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          {privacyMode && (
            <Badge variant="destructive" className="gap-1">
              <Shield className="w-3 h-3" />
              Privacy Mode
            </Badge>
          )}
          <Link href="/session">
            <Button className="glow-cyan gap-2">
              <Play className="w-4 h-4" />
              Start Session
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: Target,
            label: "Focus Score",
            value: `${focusScore || 78}`,
            subtext: focusCategory.label,
            color: focusCategory.color,
            trend: "+12%",
          },
          {
            icon: Brain,
            label: "EQ Score",
            value: `${eqScore || 72}`,
            subtext: "Growing",
            color: "#a855f7",
            trend: "+5%",
          },
          {
            icon: Flame,
            label: "Streak",
            value: `${streak || 12}`,
            subtext: "Days",
            color: "#f97316",
            trend: "🔥",
          },
          {
            icon: Clock,
            label: "Session Time",
            value: formatDuration(sessionDuration || 2847),
            subtext: "Today",
            color: "#00f0ff",
            trend: "",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="hover:border-white/10 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <stat.icon
                    className="w-5 h-5"
                    style={{ color: stat.color }}
                  />
                  {stat.trend && (
                    <span className="text-xs text-emovert-green">
                      {stat.trend}
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-xs text-white/40 mt-1">
                  {stat.label}
                </div>
                <div
                  className="text-xs font-medium mt-1"
                  style={{ color: stat.color }}
                >
                  {stat.subtext}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Emotion */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smile className="w-5 h-5 text-emovert-cyan" />
                Current Emotion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <motion.div
                  className="text-6xl mb-4"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {getEmotionIcon(currentEmotion?.emotion || "happy")}
                </motion.div>
                <h3 className="text-2xl font-bold capitalize text-white mb-2">
                  {currentEmotion?.emotion || "Happy"}
                </h3>
                <Badge
                  variant="glow"
                  className="mb-4"
                >
                  Confidence: {Math.round((currentEmotion?.confidence || 0.94) * 100)}%
                </Badge>
                <Progress
                  value={(currentEmotion?.confidence || 0.94) * 100}
                  indicatorColor="bg-emovert-cyan"
                  className="mt-4"
                />
              </div>
              <div className="space-y-2 mt-4">
                <h4 className="text-sm font-medium text-white/70">
                  Recent Emotions
                </h4>
                {recentEmotions.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {getEmotionIcon(item.emotion)}
                      </span>
                      <span className="text-sm capitalize text-white/70">
                        {item.emotion}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-white/40">
                        {Math.round(item.confidence * 100)}%
                      </span>
                      <span className="text-xs text-white/30">
                        {item.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Focus Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-emovert-purple" />
                Focus Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/50">Focus Score</span>
                  <span
                    className="text-lg font-bold"
                    style={{ color: focusCategory.color }}
                  >
                    {focusScore || 78}/100
                  </span>
                </div>
                <Progress
                  value={focusScore || 78}
                  indicatorColor={`bg-[${focusCategory.color}]`}
                  className="h-3"
                />
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="glass rounded-lg p-3 text-center">
                    <AlertTriangle className="w-5 h-5 text-emovert-orange mx-auto mb-1" />
                    <div className="text-xl font-bold text-white">
                      {distractionCount || 3}
                    </div>
                    <div className="text-xs text-white/40">
                      Distractions
                    </div>
                  </div>
                  <div className="glass rounded-lg p-3 text-center">
                    <Zap className="w-5 h-5 text-emovert-yellow mx-auto mb-1" />
                    <div className="text-xl font-bold text-white">
                      {drowsinessEvents || 1}
                    </div>
                    <div className="text-xs text-white/40">
                      Drowsiness
                    </div>
                  </div>
                </div>
                <div className="h-40 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={focusTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis
                        dataKey="time"
                        stroke="rgba(255,255,255,0.2)"
                        fontSize={12}
                      />
                      <YAxis
                        stroke="rgba(255,255,255,0.2)"
                        fontSize={12}
                        domain={[0, 100]}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(10,10,15,0.95)",
                          border: "1px solid rgba(0,240,255,0.2)",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#a855f7"
                        strokeWidth={2}
                        dot={{ fill: "#a855f7", r: 4 }}
                        activeDot={{ r: 6, fill: "#a855f7" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Emotion Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emovert-pink" />
                Emotion Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={emotionDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {emotionDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "rgba(10,10,15,0.95)",
                        border: "1px solid rgba(0,240,255,0.2)",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {emotionDistribution.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-white/70">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-white">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Emotion Timeline & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emovert-green" />
                Weekly Emotion Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyEmotionTimeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="name"
                      stroke="rgba(255,255,255,0.2)"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.2)"
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(10,10,15,0.95)",
                        border: "1px solid rgba(0,240,255,0.2)",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Bar dataKey="happy" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="neutral" fill="#6b7280" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="focused" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="sad" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="stress" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-emovert-cyan" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/[0.07] transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-emovert-cyan/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3 h-3 text-emovert-cyan" />
                    </div>
                    <p className="text-sm text-white/70">{insight}</p>
                  </motion.div>
                ))}
              </div>
              <Link href="/coach">
                <Button variant="outline" className="w-full mt-4 gap-2">
                  View Full Insights
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
