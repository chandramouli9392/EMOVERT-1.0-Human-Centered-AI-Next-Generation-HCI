"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEmovertStore } from "@/hooks/useStore";
import {
  User,
  Target,
  Brain,
  Flame,
  Trophy,
  Clock,
  Heart,
  TrendingUp,
  Calendar,
  Edit3,
} from "lucide-react";

export default function ProfilePage() {
  const { user, streak, eqScore, focusScore, totalSessions, totalEmotionsLogged } = useEmovertStore();

  const stats = [
    { label: "Total Sessions", value: totalSessions || 47, icon: Target, color: "#00f0ff" },
    { label: "Emotions Logged", value: totalEmotionsLogged || 1234, icon: Heart, color: "#ec4899" },
    { label: "Focus Score", value: `${focusScore || 82}/100`, icon: Target, color: "#22c55e" },
    { label: "EQ Score", value: `${eqScore || 72}/100`, icon: Brain, color: "#a855f7" },
    { label: "Current Streak", value: `${streak || 12} days`, icon: Flame, color: "#f97316" },
    { label: "Achievements", value: "8/15", icon: Trophy, color: "#eab308" },
  ];

  const recentSessions = [
    { date: "Today", duration: "45 min", focus: 85, emotion: "Happy" },
    { date: "Yesterday", duration: "30 min", focus: 78, emotion: "Focused" },
    { date: "2 days ago", duration: "60 min", focus: 92, emotion: "Happy" },
    { date: "3 days ago", duration: "20 min", focus: 65, emotion: "Neutral" },
  ];

  const emotionHistory = [
    { emotion: "Happy", count: 36, percentage: 36 },
    { emotion: "Neutral", count: 25, percentage: 25 },
    { emotion: "Sad", count: 15, percentage: 15 },
    { emotion: "Angry", count: 12, percentage: 12 },
    { emotion: "Stress", count: 12, percentage: 12 },
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
                <h2 className="text-2xl font-bold text-white">{user?.name || "Chandramouli Boppana"}</h2>
                <p className="text-white/40">{user?.email || "chandramouli@emovert.ai"}</p>
                <div className="flex items-center gap-2 mt-3 justify-center sm:justify-start">
                  <Badge variant="glow">Premium Member</Badge>
                  <Badge variant="success">Active</Badge>
                </div>
              </div>
              <Button variant="outline" className="gap-2">
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </Button>
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
                  <span className="text-lg font-bold text-emovert-purple">{eqScore || 72}/100</span>
                </div>
                <Progress value={eqScore || 72} indicatorColor="bg-emovert-purple" className="h-3" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <div className="text-sm font-bold text-white">+8%</div>
                  <div className="text-[10px] text-white/40">This Week</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <div className="text-sm font-bold text-white">+15%</div>
                  <div className="text-[10px] text-white/40">This Month</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <div className="text-sm font-bold text-white">+32%</div>
                  <div className="text-[10px] text-white/40">This Year</div>
                </div>
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
              {emotionHistory.map((item) => (
                <div key={item.emotion}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white/60">{item.emotion}</span>
                    <span className="text-sm text-white">{item.count} ({item.percentage}%)</span>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              ))}
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
                    <Badge variant="secondary">{session.emotion}</Badge>
                    <div className="text-right">
                      <p className="text-sm font-medium text-emovert-green">{session.focus}%</p>
                      <p className="text-[10px] text-white/40">Focus</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
