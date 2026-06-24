"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Target,
  Brain,
  Flame,
  Zap,
  Star,
  Sunrise,
  Moon,
  Crown,
  Medal,
  Lock,
  Sparkles,
} from "lucide-react";
import { achievementAPI } from "@/lib/api";

const categories = ["All", "Session", "Focus", "Emotion", "Productivity", "Mindfulness", "Streak"];

export default function AchievementsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [achievements, setAchievements] = useState<any[]>([]);

  useEffect(() => {
    achievementAPI.getAll()
      .then((res) => {
        const data = res.data || [];
        const mapped = data.map((ach: any) => {
          let icon = Trophy;
          let category = "General";
          let color = "#a855f7";
          let maxProgress = 1;
          let progress = ach.unlocked ? 1 : 0;

          if (ach.id === "first_steps") {
            icon = Target;
            category = "Session";
            color = "#00f0ff";
          } else if (ach.id === "streak_3") {
            icon = Flame;
            category = "Streak";
            color = "#ef4444";
            maxProgress = 3;
          } else if (ach.id === "streak_7") {
            icon = Flame;
            category = "Streak";
            color = "#ef4444";
            maxProgress = 7;
          } else if (ach.id === "flow_state") {
            icon = Trophy;
            category = "Focus";
            color = "#22c55e";
          } else if (ach.id === "hour_lock") {
            icon = Zap;
            category = "Productivity";
            color = "#f59e0b";
          } else if (ach.id === "serene_focus") {
            icon = Sparkles;
            category = "Mindfulness";
            color = "#ec4899";
          }

          return {
            id: ach.id,
            name: ach.title,
            description: ach.description,
            icon,
            unlocked: ach.unlocked,
            unlockedAt: ach.unlocked_at ? new Date(ach.unlocked_at).toLocaleDateString() : undefined,
            category,
            color,
            progress,
            maxProgress,
          };
        });
        setAchievements(mapped);
      })
      .catch((err) => console.error("Failed to load achievements:", err));
  }, []);

  const filteredAchievements = activeCategory === "All"
    ? achievements
    : achievements.filter((a) => a.category === activeCategory);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length || 1;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          <span className="gradient-text">Achievements</span>
        </h1>
        <p className="text-white/50 mt-1">Track your milestones and unlock rewards</p>
      </motion.div>

      {/* Progress Overview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="45" fill="none"
                    stroke="url(#achievement-gradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(unlockedCount / totalCount) * 283} 283`}
                  />
                  <defs>
                    <linearGradient id="achievement-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00f0ff" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-emovert-cyan" />
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl font-bold text-white">{unlockedCount} of {totalCount} Unlocked</h3>
                <p className="text-sm text-white/40 mt-1">Keep going! You're doing great.</p>
                <Progress value={(unlockedCount / totalCount) * 100} className="mt-3 h-2" indicatorColor="bg-gradient-to-r from-emovert-cyan to-emovert-purple" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
              activeCategory === cat
                ? "bg-emovert-cyan/20 text-emovert-cyan border border-emovert-cyan/30"
                : "bg-white/5 text-white/50 hover:text-white hover:bg-white/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={`h-full ${achievement.unlocked ? "" : "opacity-60"}`}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: achievement.unlocked ? `${achievement.color}20` : "rgba(255,255,255,0.05)" }}
                  >
                    {achievement.unlocked ? (
                      <achievement.icon className="w-6 h-6" style={{ color: achievement.color }} />
                    ) : (
                      <Lock className="w-5 h-5 text-white/30" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">{achievement.name}</h3>
                      {achievement.unlocked && (
                        <Badge variant="success" className="text-[10px] h-4">Unlocked</Badge>
                      )}
                    </div>
                    <p className="text-xs text-white/40 mt-1">{achievement.description}</p>
                    {achievement.unlocked && achievement.unlockedAt && (
                      <p className="text-[10px] text-white/30 mt-1">Unlocked on {achievement.unlockedAt}</p>
                    )}
                    {!achievement.unlocked && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-white/40">Progress</span>
                          <span className="text-[10px] text-white/60">{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-1.5" />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
