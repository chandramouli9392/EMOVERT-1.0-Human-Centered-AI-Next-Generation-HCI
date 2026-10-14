"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Flame,
  ChevronLeft,
  ChevronRight,
  Activity,
  Clock,
  Eye,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { analyticsAPI, emotionAPI, focusAPI } from "@/lib/api";
import { parseServerDate, getEmotionColor } from "@/lib/utils";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<"week" | "month" | "year">("week");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [emotionDistribution, setEmotionDistribution] = useState<any[]>([]);
  const [focusTrend, setFocusTrend] = useState<any[]>([]);
  const [timeAnalysis, setTimeAnalysis] = useState<any[]>([]);

  useEffect(() => {
    // 1. Load weekly stats from DB
    analyticsAPI.getWeekly()
      .then((res) => {
        const weekly = res.data;
        if (weekly && weekly.labels) {
          const formatted = weekly.labels.map((label: string, i: number) => {
            const eb = weekly.emotions_breakdown[i] || {};
            return {
              day: label,
              happy: eb.happy || 0,
              neutral: eb.neutral || 0,
              sad: eb.sad || 0,
              stress: eb.stress || 0,
              focused: eb.focused || 0,
              focus: weekly.focus_scores[i] || 0,
            };
          });
          setWeeklyData(formatted);
        }
      })
      .catch((err) => console.error("Failed to load weekly analytics:", err));

    // 2. Load monthly stats from DB
    analyticsAPI.getMonthly()
      .then((res) => {
        const monthly = res.data;
        if (monthly && monthly.labels) {
          const formatted = monthly.labels.map((label: string, i: number) => {
            const eb = monthly.emotions_breakdown ? (monthly.emotions_breakdown[i] || {}) : {};
            return {
              week: label,
              focus: monthly.focus_scores[i] || 0,
              happy: eb.happy || 0,
              stress: eb.stress || 0,
              neutral: eb.neutral || 0,
            };
          });
          setMonthlyData(formatted);
        }
      })
      .catch((err) => console.error("Failed to load monthly analytics:", err));

    // 3. Load dashboard statistics
    analyticsAPI.getDashboard()
      .then((res) => setDashboardStats(res.data))
      .catch((err) => console.error("Failed to load dashboard stats:", err));

    // 4. Load 30-day focus trends
    focusAPI.getTrends()
      .then((res) => {
        const trends = res.data?.trends || [];
        if (trends.length > 0) {
          const formatted = trends.map((t: any) => ({
            day: t.date,
            score: t.focus_score,
          }));
          setFocusTrend(formatted);
        }
      })
      .catch((err) => console.error("Failed to load focus trends:", err));

    // 5. Load dynamic emotion history for distribution and time-of-day analysis
    emotionAPI.getHistory()
      .then((res) => {
        const history = res.data || [];
        if (history.length > 0) {
          // Emotion distribution calculation
          const counts: Record<string, number> = {};
          const hourBuckets: Record<string, { happy: number; focus: number; count: number }> = {};

          history.forEach((log: any) => {
            counts[log.emotion] = (counts[log.emotion] || 0) + 1;

            const date = parseServerDate(log.timestamp);
            const hour = date.getHours();
            const hourLabel = `${hour % 12 === 0 ? 12 : hour % 12}${hour >= 12 ? "PM" : "AM"}`;

            if (!hourBuckets[hourLabel]) {
              hourBuckets[hourLabel] = { happy: 0, focus: 0, count: 0 };
            }
            if (log.emotion === "happy") hourBuckets[hourLabel].happy += 1;
            hourBuckets[hourLabel].count += 1;
          });

          const total = history.length;
          const dist = Object.keys(counts).map((emotion) => {
            return {
              name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
              value: Math.round((counts[emotion] / total) * 100),
              color: getEmotionColor(emotion),
            };
          });
          setEmotionDistribution(dist);

          // Time analysis calculation
          const timeList = Object.keys(hourBuckets).map((hour) => ({
            hour,
            happy: hourBuckets[hour].happy,
            focus: hourBuckets[hour].count,
          }));
          setTimeAnalysis(timeList);
        }
      })
      .catch((err) => console.error("Failed to load emotion history:", err));
  }, []);

  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    analyticsAPI.getCalendar(year, month)
      .then((res) => {
        setCalendarData(res.data || []);
      })
      .catch((err) => console.error("Failed to load calendar data:", err));
  }, [currentMonth]);

  const getHeatmapColor = (emotion: string) => {
    const colors: Record<string, string> = {
      happy: "#22c55e",
      neutral: "#6b7280",
      sad: "#3b82f6",
      stress: "#ef4444",
      focused: "#00f0ff",
    };
    return colors[emotion] || "#6b7280";
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayData = calendarData.find((d: any) => d.date === dateStr);

      const hasData = dayData?.has_data || false;
      const emotion = dayData?.dominant_emotion || "none";
      const focus = dayData?.focus_score || 0;

      const intensity = hasData ? (focus / 100) : 0.1;
      const color = emotion !== "none" ? getHeatmapColor(emotion) : "#ffffff";
      const alpha = Math.floor((hasData ? Math.max(0.2, intensity) : 0.1) * 255).toString(16).padStart(2, "0");

      days.push(
        <motion.div
          key={day}
          className="w-8 h-8 rounded-md flex items-center justify-center text-xs cursor-pointer hover:scale-110 transition-transform"
          style={{
            backgroundColor: hasData ? `${color}${alpha}` : "rgba(255,255,255,0.02)",
            border: `1px solid ${hasData ? color : "rgba(255,255,255,0.05)"}30`,
          }}
          whileHover={{ scale: 1.2 }}
          title={hasData ? `${emotion} - Focus: ${focus}%` : "No session data"}
        >
          {day}
        </motion.div>
      );
    }

    return days;
  };

  const activePeriodData = period === "week" ? weeklyData : monthlyData;
  const hasPeriodData = activePeriodData.length > 0 && activePeriodData.some((d) => d.happy || d.stress || d.neutral || d.focus);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            <span className="gradient-text">Analytics</span> Dashboard
          </h1>
          <p className="text-white/50 mt-1">
            Real-time performance and emotional intelligence metrics
          </p>
        </div>
        <div className="flex gap-2">
          {(["week", "month"] as const).map((p) => (
            <Button
              key={p}
              variant={period === p ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(p)}
              className="capitalize"
            >
              {p}
            </Button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Sessions", value: String(dashboardStats?.total_sessions ?? 0), icon: BarChart3, color: "#00f0ff" },
          { label: "Streak (Days)", value: String(dashboardStats?.streak ?? 0), icon: Flame, color: "#a855f7" },
          { label: "Avg Focus", value: `${Math.round(dashboardStats?.average_focus ?? 0)}%`, icon: Eye, color: "#f97316" },
          { label: "EQ Score", value: String(Math.round(dashboardStats?.eq_score ?? 0)), icon: TrendingUp, color: "#22c55e" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <stat.icon className="w-5 h-5 mb-2" style={{ color: stat.color }} />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/40">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emovert-cyan" />
              Emotion Timeline ({period === "week" ? "Last 7 Days" : "Last 30 Days"})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasPeriodData ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activePeriodData}>
                    <defs>
                      <linearGradient id="happy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="stress" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey={period === "week" ? "day" : "week"} stroke="rgba(255,255,255,0.2)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} />
                    <Tooltip contentStyle={{ background: "rgba(10,10,15,0.95)", border: "1px solid rgba(0,240,255,0.2)", borderRadius: "8px", color: "#fff" }} />
                    <Area type="monotone" dataKey="happy" stroke="#22c55e" fill="url(#happy)" strokeWidth={2} />
                    <Area type="monotone" dataKey="stress" stroke="#ef4444" fill="url(#stress)" strokeWidth={2} />
                    <Area type="monotone" dataKey="neutral" stroke="#6b7280" fill="transparent" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex flex-col items-center justify-center text-center p-6 rounded-xl bg-white/5 border border-white/5">
                <TrendingUp className="w-8 h-8 text-emovert-cyan/40 mb-2" />
                <p className="text-sm text-white/60 font-medium">No timeline records for this period</p>
                <p className="text-xs text-white/30 mt-1">Start sessions to track your emotional journey over time</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle>Emotion Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {emotionDistribution.length > 0 ? (
                <>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={emotionDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                          {emotionDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: "rgba(10,10,15,0.95)", border: "1px solid rgba(0,240,255,0.2)", borderRadius: "8px", color: "#fff" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {emotionDistribution.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-white/60">{item.name}</span>
                        <span className="text-xs text-white font-medium">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-72 flex flex-col items-center justify-center text-center p-6 rounded-xl bg-white/5 border border-white/5">
                  <Activity className="w-8 h-8 text-emovert-pink/40 mb-2" />
                  <p className="text-sm text-white/60 font-medium">No emotion logs recorded</p>
                  <p className="text-xs text-white/30 mt-1">Camera emotion sensing data will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle>Focus Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {focusTrend.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={focusTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="day" stroke="rgba(255,255,255,0.2)" fontSize={10} />
                      <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} domain={[0, 100]} />
                      <Tooltip contentStyle={{ background: "rgba(10,10,15,0.95)", border: "1px solid rgba(0,240,255,0.2)", borderRadius: "8px", color: "#fff" }} />
                      <Line type="monotone" dataKey="score" stroke="#a855f7" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#a855f7" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 flex flex-col items-center justify-center text-center p-6 rounded-xl bg-white/5 border border-white/5">
                  <Eye className="w-8 h-8 text-emovert-purple/40 mb-2" />
                  <p className="text-sm text-white/60 font-medium">No focus trends recorded</p>
                  <p className="text-xs text-white/30 mt-1">Complete focus sessions to build your historical trendline</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emovert-pink" />
              Emotion Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium text-white">
                {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
              <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-xs text-white/40 py-1">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>
            <div className="flex items-center gap-4 mt-4 justify-center flex-wrap">
              {[
                { label: "Happy", color: "#22c55e" },
                { label: "Neutral", color: "#6b7280" },
                { label: "Sad", color: "#3b82f6" },
                { label: "Stress", color: "#ef4444" },
                { label: "Focused", color: "#00f0ff" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-white/50">{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emovert-cyan" />
              Time-of-Day Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timeAnalysis.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="hour" stroke="rgba(255,255,255,0.2)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} />
                    <Tooltip contentStyle={{ background: "rgba(10,10,15,0.95)", border: "1px solid rgba(0,240,255,0.2)", borderRadius: "8px", color: "#fff" }} />
                    <Bar dataKey="happy" fill="#22c55e" radius={[4, 4, 0, 0]} name="Happy Logs" />
                    <Bar dataKey="focus" fill="#00f0ff" radius={[4, 4, 0, 0]} name="Total Logs" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 rounded-xl bg-white/5 border border-white/5">
                <Clock className="w-8 h-8 text-emovert-cyan/40 mb-2" />
                <p className="text-sm text-white/60 font-medium">No hourly patterns recorded</p>
                <p className="text-xs text-white/30 mt-1">Sessions throughout the day will illuminate your peak performance hours</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
