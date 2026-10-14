"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEmovertStore } from "@/hooks/useStore";
import {
  Target,
  Brain,
  Flame,
  Trophy,
  Clock,
  Heart,
  Calendar,
  Sparkles,
} from "lucide-react";
import { sessionAPI, emotionAPI, achievementAPI } from "@/lib/api";
import { formatDuration, parseServerDate } from "@/lib/utils";

export default function ProfilePage() {
  const { user, streak, eqScore, focusScore, totalSessions } = useEmovertStore();
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [emotionHistory, setEmotionHistory] = useState<any[]>([]);
  const [totalEmotions, setTotalEmotions] = useState(0);
  const [achievementCounts, setAchievementCounts] = useState({ unlocked: 0, total: 6 });

  useEffect(() => {
    // 1. Fetch real session history
    sessionAPI.getHistory()
      .then((res) => {
        const list = res.data || [];
        const formatted = list.slice(0, 5).map((s: any) => {
          const date = parseServerDate(s.start_time);
          return {
            date: date.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
            duration: formatDuration(s.duration || 0),
            focus: Math.round(s.focus_score || 0),
            emotion: s.dominant_emotion || "neutral",
          };
        });
        setRecentSessions(formatted);
      })
      .catch((err) => console.error("Failed to load session history for profile:", err));

    // 2. Fetch real emotion logs
    emotionAPI.getHistory()
      .then((res) => {
        const logs = res.data || [];
        setTotalEmotions(logs.length);
        if (logs.length > 0) {
          const counts: Record<string, number> = {};
          logs.forEach((l: any) => {
            counts[l.emotion] = (counts[l.emotion] || 0) + 1;
          });
          const total = logs.length;
          const mapped = Object.keys(counts).map((emotion) => ({
            emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
            count: counts[emotion],
            percentage: Math.round((counts[emotion] / total) * 100),
          }));
          setEmotionHistory(mapped);
        }
      })
      .catch((err) => console.error("Failed to load emotion history for profile:", err));

    // 3. Fetch achievements
    achievementAPI.getAll()
      .then((res) => {
        const all = res.data || [];
        const unlocked = all.filter((a: any) => a.unlocked).length;
        setAchievementCounts({ unlocked, total: all.length || 6 });
      })
      .catch(() => {});
  }, []);

  const stats = [
    { label: "Total Sessions", value: totalSessions || recentSessions.length || 0, icon: Target, color: "#00f0ff" },
    { label: "Emotions Logged", value: totalEmotions, icon: Heart, color: "#ec4899" },
    { label: "Focus Score", value: `${Math.round(focusScore)}/100`, icon: Target, color: "#22c55e" },
    { label: "EQ Score", value: `${Math.round(eqScore)}/100`, icon: Brain, color: "#a855f7" },
    { label: "Current Streak", value: `${streak} days`, icon: Flame, color: "#f97316" },
    { label: "Achievements", value: `${achievementCounts.unlocked}/${achievementCounts.total}`, icon: Trophy, color: "#eab308" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Your <span className="gradient-text">Profile</span>
        </h1>
      </motion.div>

      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24 ring-4 ring-emovert-cyan/30">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-2xl">{user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emovert-cyan flex items-center justify-center">
                  <Flame className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-2xl font-bold text-white">{user?.name || "User"}</h2>
                <p className="text-white/40">{user?.email || "No email"}</p>
                <div className="flex items-center gap-2 mt-3 justify-center sm:justify-start">
                  <Badge variant="glow">Live Account</Badge>
                  <Badge variant="success">Active</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
          >
            <Card>
              <CardContent className="p-4">
                <stat.icon className="w-5 h-5 mb-2" style={{ color: stat.color }} />
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/40">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* EQ Progress */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-emovert-purple" />
                Emotional Intelligence Growth
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/50">Current EQ Score</span>
                  <span className="text-lg font-bold text-emovert-purple">{Math.round(eqScore)}/100</span>
                </div>
                <Progress value={eqScore} indicatorColor="bg-emovert-purple" className="h-3" />
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                <p className="text-xs text-white/60">
                  {eqScore > 0
                    ? "Your emotional quotient is continuously calibrated against your focus consistency and mood stability."
                    : "Complete focus sessions to start building your Emotional Intelligence rating."}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Emotion Distribution */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-emovert-pink" />
                Emotion Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {emotionHistory.length > 0 ? (
                emotionHistory.map((item) => (
                  <div key={item.emotion}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white/60">{item.emotion}</span>
                      <span className="text-sm text-white">{item.count} ({item.percentage}%)</span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))
              ) : (
                <div className="h-44 flex flex-col items-center justify-center text-center p-4 rounded-xl bg-white/5 border border-white/5">
                  <Heart className="w-7 h-7 text-emovert-pink/40 mb-2" />
                  <p className="text-sm text-white/60 font-medium">No emotions logged</p>
                  <p className="text-xs text-white/30 mt-1">Recorded emotions will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Sessions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emovert-cyan" />
              Recent Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentSessions.length > 0 ? (
              <div className="space-y-3">
                {recentSessions.map((session, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emovert-cyan/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-emovert-cyan" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{session.date}</p>
                        <p className="text-xs text-white/40">{session.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="capitalize">{session.emotion}</Badge>
                      <div className="text-right">
                        <p className="text-sm font-medium text-emovert-green">{session.focus}%</p>
                        <p className="text-[10px] text-white/40">Focus</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 flex flex-col items-center justify-center text-center rounded-xl bg-white/5 border border-white/5">
                <Clock className="w-8 h-8 text-emovert-cyan/40 mb-2" />
                <p className="text-sm text-white/60 font-medium">No sessions recorded yet</p>
                <p className="text-xs text-white/30 mt-1">Start your first live session to record focus and emotion history</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
