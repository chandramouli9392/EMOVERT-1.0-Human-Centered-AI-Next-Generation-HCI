"use client";

import { useState } from "react";
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

const weeklyData = [
  { day: "Mon", focus: 82, emotions: 12 },
  { day: "Tue", focus: 78, emotions: 8 },
  { day: "Wed", focus: 91, emotions: 15 },
  { day: "Thu", focus: 65, emotions: 6 },
  { day: "Fri", focus: 85, emotions: 10 },
  { day: "Sat", focus: 88, emotions: 14 },
  { day: "Sun", focus: 90, emotions: 11 },
];

const emotionDist = [
  { name: "Happy", value: 36, color: "#22c55e" },
  { name: "Neutral", value: 25, color: "#6b7280" },
  { name: "Sad", value: 15, color: "#3b82f6" },
  { name: "Angry", value: 12, color: "#ef4444" },
  { name: "Others", value: 12, color: "#a855f7" },
];

import { useEmovertStore } from "@/hooks/useStore";
import { reportAPI } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function ReportsPage() {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [reportBlob, setReportBlob] = useState<Blob | null>(null);

  const { focusScore, drowsinessEvents, distractionCount, currentEmotion } = useEmovertStore();

  const generateReport = async () => {
    setGenerating(true);
    try {
      const response = await reportAPI.generateWeekly();
      setReportBlob(response.data);
      setGenerated(true);
      toast.success("Report generated successfully!");
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
      toast.success("Report link shared successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to share report");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          <span className="gradient-text">Reports</span>
        </h1>
        <p className="text-white/50 mt-1">Generate and download your wellness reports</p>
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
                  <h3 className="text-lg font-semibold text-white">Weekly Emotional Report</h3>
                  <p className="text-sm text-white/40">June 14 - June 20, 2026</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2" onClick={generateReport} disabled={generating}>
                  {generating ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating...</>
                  ) : generated ? (
                    <><CheckCircle className="w-4 h-4 text-emovert-green" />Generated</>
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
              { label: "Dominant Emotion", value: currentEmotion?.emotion ? currentEmotion.emotion.charAt(0).toUpperCase() + currentEmotion.emotion.slice(1) : "Happy", icon: Heart, color: "#22c55e" },
              { label: "Focus Score", value: `${focusScore || 78}/100`, icon: Target, color: "#00f0ff" },
              { label: "Drowsiness", value: `${drowsinessEvents || 0} events`, icon: Zap, color: "#f59e0b" },
              { label: "Distractions", value: `${distractionCount || 0} events`, icon: Brain, color: "#ef4444" },
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
                  Weekly Focus & Emotions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="day" stroke="rgba(255,255,255,0.2)" fontSize={12} />
                      <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} />
                      <Tooltip contentStyle={{ background: "rgba(10,10,15,0.95)", border: "1px solid rgba(0,240,255,0.2)", borderRadius: "8px", color: "#fff" }} />
                      <Bar dataKey="focus" fill="#00f0ff" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="emotions" fill="#a855f7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
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
              <div className="space-y-3">
                {[
                  "Your focus peaks during morning sessions (8-11 AM)",
                  "Stress levels decrease by 40% after meditation",
                  "You show 25% more positive emotions on exercise days",
                  "Consider taking breaks every 45 minutes for optimal focus",
                ].map((insight, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                    <CheckCircle className="w-4 h-4 text-emovert-green shrink-0 mt-0.5" />
                    <p className="text-sm text-white/70">{insight}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
