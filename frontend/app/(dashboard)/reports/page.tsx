"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  Share2,
  Brain,
  Target,
  Zap,
  Heart,
  BarChart3,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useEmovertStore } from "@/hooks/useStore";
import { reportAPI, analyticsAPI, emotionAPI, coachAPI } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function ReportsPage() {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [reportBlob, setReportBlob] = useState<Blob | null>(null);

  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [emotionDist, setEmotionDist] = useState<any[]>([]);
  const [coachInsights, setCoachInsights] = useState<string[]>([]);
  const [dominantEmotion, setDominantEmotion] = useState("None");

  const { focusScore, drowsinessEvents, distractionCount, currentEmotion } = useEmovertStore();

  const startDate = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
  const endDate = new Date();
  const dateRangeStr = `${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  useEffect(() => {
    // 1. Fetch real weekly breakdown
    analyticsAPI.getWeekly()
      .then((res) => {
        const weekly = res.data;
        if (weekly && weekly.labels) {
          const formatted = weekly.labels.map((label: string, i: number) => {
            const eb = weekly.emotions_breakdown[i] || {};
            const emotionTotal = Object.values(eb).reduce((acc: number, val: any) => acc + (typeof val === "number" ? val : 0), 0);
            return {
              day: label,
              focus: weekly.focus_scores[i] || 0,
              emotions: emotionTotal,
            };
          });
          setWeeklyData(formatted);
        }
      })
      .catch((err) => console.error("Failed to fetch weekly stats for report:", err));

    // 2. Fetch real emotion distribution
    emotionAPI.getHistory()
      .then((res) => {
        const history = res.data || [];
        if (history.length > 0) {
          const counts: Record<string, number> = {};
          history.forEach((log: any) => {
            counts[log.emotion] = (counts[log.emotion] || 0) + 1;
          });
          const total = history.length;
          const dist = Object.keys(counts).map((emotion) => {
            let color = "#a855f7";
            if (emotion === "happy") color = "#22c55e";
            else if (emotion === "neutral") color = "#6b7280";
            else if (emotion === "sad") color = "#3b82f6";
            else if (emotion === "angry" || emotion === "stress") color = "#ef4444";
            else if (emotion === "focused") color = "#00f0ff";

            return {
              name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
              value: Math.round((counts[emotion] / total) * 100),
              color,
            };
          });
          setEmotionDist(dist);

          const maxEmotion = Object.entries(counts).reduce((a, b) => (b[1] > a[1] ? b : a), ["None", 0])[0];
          setDominantEmotion(maxEmotion.charAt(0).toUpperCase() + maxEmotion.slice(1));
        }
      })
      .catch((err) => console.error("Failed to fetch emotion history for report:", err));

    // 3. Fetch real coach insights
    coachAPI.getInsights()
      .then((res) => {
        const list = (res.data || []).map((ins: any) => ins.message || ins.title);
        if (list.length > 0) {
          setCoachInsights(list);
        } else {
          coachAPI.getDailyReport()
            .then((dRes) => {
              if (dRes.data?.insights && dRes.data.insights.length > 0) {
                setCoachInsights(dRes.data.insights);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  const generateReport = async () => {
    setGenerating(true);
    try {
      const response = await reportAPI.generateWeekly();
      setReportBlob(response.data);
      setGenerated(true);
      toast.success("Live report generated from database!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!reportBlob) return;
    const url = window.URL.createObjectURL(reportBlob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "emovert_weekly_report.html");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    try {
      await reportAPI.share("weekly");
      toast.success("Report link generated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to share report");
    }
  };

  const currentDom = currentEmotion?.emotion
    ? currentEmotion.emotion.charAt(0).toUpperCase() + currentEmotion.emotion.slice(1)
    : dominantEmotion;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          <span className="gradient-text">Reports</span>
        </h1>
        <p className="text-white/50 mt-1">Generate and download official wellness reports from your session history</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-emovert-cyan/10 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-emovert-cyan" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Weekly Wellness & Focus Report</h3>
                  <p className="text-sm text-white/40">{dateRangeStr}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2" onClick={generateReport} disabled={generating}>
                  {generating ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating...</>
                  ) : generated ? (
                    <><CheckCircle className="w-4 h-4 text-emovert-green" />Regenerate</>
                  ) : (
                    <><FileText className="w-4 h-4" />Generate Report</>
                  )}
                </Button>
                {generated && (
                  <>
                    <Button onClick={handleDownload} className="glow-cyan gap-2"><Download className="w-4 h-4" />Download</Button>
                    <Button onClick={handleShare} variant="outline" className="gap-2"><Share2 className="w-4 h-4" />Share</Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {generated && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Dominant Emotion", value: currentDom, icon: Heart, color: "#22c55e" },
              { label: "Focus Score", value: `${Math.round(focusScore)}/100`, icon: Target, color: "#00f0ff" },
              { label: "Drowsiness", value: `${drowsinessEvents} events`, icon: Zap, color: "#f59e0b" },
              { label: "Distractions", value: `${distractionCount} events`, icon: Brain, color: "#ef4444" },
            ].map((stat, index) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emovert-cyan" />
                  Weekly Focus & Emotion Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weeklyData.length > 0 && weeklyData.some((d) => d.focus > 0 || d.emotions > 0) ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="day" stroke="rgba(255,255,255,0.2)" fontSize={12} />
                        <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} />
                        <Tooltip contentStyle={{ background: "rgba(10,10,15,0.95)", border: "1px solid rgba(0,240,255,0.2)", borderRadius: "8px", color: "#fff" }} />
                        <Bar dataKey="focus" fill="#00f0ff" radius={[4, 4, 0, 0]} name="Focus Score" />
                        <Bar dataKey="emotions" fill="#a855f7" radius={[4, 4, 0, 0]} name="Emotion Logs" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center p-6 rounded-xl bg-white/5 border border-white/5">
                    <BarChart3 className="w-8 h-8 text-emovert-cyan/40 mb-2" />
                    <p className="text-sm text-white/60 font-medium">No sessions logged this week</p>
                    <p className="text-xs text-white/30 mt-1">Start sessions to track your weekly progress</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-emovert-pink" />
                  Emotion Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {emotionDist.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={emotionDist} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                          {emotionDist.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: "rgba(10,10,15,0.95)", border: "1px solid rgba(0,240,255,0.2)", borderRadius: "8px", color: "#fff" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center p-6 rounded-xl bg-white/5 border border-white/5">
                    <Heart className="w-8 h-8 text-emovert-pink/40 mb-2" />
                    <p className="text-sm text-white/60 font-medium">No emotion logs in database</p>
                    <p className="text-xs text-white/30 mt-1">Logs recorded by webcam analysis will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-emovert-purple" />
                AI Coach Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {coachInsights.length > 0 ? (
                <div className="space-y-3">
                  {coachInsights.map((insight, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                      <CheckCircle className="w-4 h-4 text-emovert-green shrink-0 mt-0.5" />
                      <p className="text-sm text-white/70">{insight}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center rounded-xl bg-white/5 border border-white/5">
                  <Sparkles className="w-8 h-8 text-emovert-purple/40 mx-auto mb-2" />
                  <p className="text-sm text-white/60 font-medium">No coaching insights yet</p>
                  <p className="text-xs text-white/30 mt-1">Insights are generated by analyzing your facial focus and emotion sessions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
