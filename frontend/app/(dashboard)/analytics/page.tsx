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
import { analyticsAPI } from "@/lib/api";

const defaultWeeklyData = [
  { day: "Mon", happy: 4, neutral: 3, sad: 1, stress: 0, focus: 82 },
  { day: "Tue", happy: 3, neutral: 4, sad: 0, stress: 1, focus: 78 },
  { day: "Wed", happy: 5, neutral: 2, sad: 0, stress: 0, focus: 91 },
  { day: "Thu", happy: 2, neutral: 3, sad: 2, stress: 1, focus: 65 },
  { day: "Fri", happy: 4, neutral: 2, sad: 1, stroke: 0, focus: 85 },
  { day: "Sat", happy: 6, neutral: 1, sad: 0, stress: 0, focus: 88 },
  { day: "Sun", happy: 5, neutral: 2, sad: 0, stress: 0, focus: 90 },
];

const defaultMonthlyData = [
  { week: "W1", happy: 25, neutral: 15, sad: 5, stress: 3, focus: 82 },
  { week: "W2", happy: 28, neutral: 12, sad: 4, stress: 2, focus: 85 },
  { week: "W3", happy: 22, neutral: 18, sad: 6, stress: 5, focus: 76 },
  { week: "W4", happy: 30, neutral: 10, sad: 3, stress: 1, focus: 89 },
];

const emotionDistribution = [
  { name: "Happy", value: 36, color: "#22c55e" },
  { name: "Neutral", value: 25, color: "#6b7280" },
  { name: "Sad", value: 15, color: "#3b82f6" },
  { name: "Angry", value: 8, color: "#ef4444" },
  { name: "Stress", value: 7, color: "#dc2626" },
  { name: "Anxiety", value: 5, color: "#f59e0b" },
  { name: "Others", value: 4, color: "#a855f7" },
];

const focusTrend = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  score: 60 + Math.floor(Math.random() * 35),
}));

const timeAnalysis = [
  { hour: "6AM", happy: 3, focus: 75 },
  { hour: "8AM", happy: 5, focus: 88 },
  { hour: "10AM", happy: 6, focus: 92 },
  { hour: "12PM", happy: 4, focus: 78 },
  { hour: "2PM", happy: 3, focus: 70 },
  { hour: "4PM", happy: 4, focus: 82 },
  { hour: "6PM", happy: 5, focus: 85 },
  { hour: "8PM", happy: 3, focus: 72 },
  { hour: "10PM", happy: 2, focus: 60 },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<"week" | "month" | "year">("week");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [weeklyData, setWeeklyData] = useState<any[]>(defaultWeeklyData);
  const [monthlyData, setMonthlyData] = useState<any[]>(defaultMonthlyData);
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);

  useEffect(() => {
    // Load weekly & monthly stats
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
              focus: weekly.focus_scores[i] || 0
            };
          });
          setWeeklyData(formatted);
        }
      })
      .catch((err) => console.error("Failed to load weekly analytics:", err));

    analyticsAPI.getMonthly()
      .then((res) => {
        const monthly = res.data;
        if (monthly && monthly.labels) {
          const formatted = monthly.labels.map((label: string, i: number) => {
            return {
              week: label,
              focus: monthly.focus_scores[i] || 0,
              happy: 20 + Math.floor(Math.random() * 10), // mock breakdown for area chart
              stress: 5 + Math.floor(Math.random() * 5),
              neutral: 10 + Math.floor(Math.random() * 5)
            };
          });
          setMonthlyData(formatted);
        }
      })
      .catch((err) => console.error("Failed to load monthly analytics:", err));

    analyticsAPI.getDashboard()
      .then((res) => setDashboardStats(res.data))
      .catch((err) => console.error("Failed to load dashboard stats:", err));
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
            Deep insights into your emotional patterns
          </p>
        </div>
        <div className="flex gap-2">
          {(["week", "month", "year"] as const).map((p) => (
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
          { label: "Avg Focus", value: `${Math.round(dashboardStats?.average_focus ?? 78)}%`, icon: Flame, color: "#f97316" },
          { label: "EQ Score", value: String(Math.round(dashboardStats?.eq_score ?? 72)), icon: TrendingUp, color: "#22c55e" },
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
              Emotion Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={period === "week" ? weeklyData : monthlyData}>
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
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle>Focus Trend (30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
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
            <CardTitle>Time-of-Day Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="hour" stroke="rgba(255,255,255,0.2)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "rgba(10,10,15,0.95)", border: "1px solid rgba(0,240,255,0.2)", borderRadius: "8px", color: "#fff" }} />
                  <Bar dataKey="happy" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="focus" fill="#00f0ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
