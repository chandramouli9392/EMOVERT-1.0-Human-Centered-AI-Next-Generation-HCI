"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEmovertStore } from "@/hooks/useStore";
import {
  MessageSquare,
  Send,
  Brain,
  Sparkles,
  TrendingUp,
  Calendar,
  Clock,
  Zap,
  Heart,
  Target,
  User,
  Loader2,
  AlertTriangle,
  Info,
} from "lucide-react";
import { chatAPI, coachAPI } from "@/lib/api";
import { toast } from "react-hot-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  emotion?: string;
}

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "insights" | "report">("chat");
  const [coachingInsights, setCoachingInsights] = useState<any[]>([]);
  const [dailyReport, setDailyReport] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentEmotion, focusScore, eqScore } = useEmovertStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // 1. Fetch chat history
    chatAPI.getHistory()
      .then((res) => {
        const history = res.data || [];
        const mapped = history.map((h: any, idx: number) => ({
          id: String(idx),
          role: h.sender === "coach" ? "assistant" : "user",
          content: h.message,
          timestamp: new Date(h.timestamp)
        }));
        setMessages(mapped);
      })
      .catch((err) => {
        console.error("Failed to load chat history:", err);
      });

    // 2. Fetch coaching insights
    coachAPI.getInsights()
      .then((res) => {
        const insights = res.data || [];
        const mapped = insights.map((insight: any) => {
          let icon = Info;
          let color = "#00f0ff";
          if (insight.type === "positive") {
            icon = Target;
            color = "#22c55e";
          } else if (insight.type === "warning") {
            icon = AlertTriangle;
            color = "#f59e0b";
          }
          return {
            title: insight.title,
            description: insight.message,
            icon,
            color
          };
        });
        setCoachingInsights(mapped);
      })
      .catch((err) => console.error("Failed to load insights:", err));

    // 3. Fetch daily report
    coachAPI.getDailyReport()
      .then((res) => {
        setDailyReport(res.data);
      })
      .catch((err) => console.error("Failed to load daily report:", err));
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userText,
      timestamp: new Date(),
      emotion: currentEmotion?.emotion,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await chatAPI.send(userText, currentEmotion?.emotion);
      const reply = response.data;
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: reply.message,
        timestamp: new Date(reply.timestamp)
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to get response from AI Coach");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 h-[calc(100vh-4rem)]">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            AI <span className="gradient-text">Coach</span>
          </h1>
          <p className="text-white/50 mt-1">
            Meet EMI - Your Emotional Intelligence companion
          </p>
        </div>
        <div className="flex gap-2">
          {(["chat", "insights", "report"] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(tab)}
              className="capitalize gap-1.5"
            >
              {tab === "chat" && <MessageSquare className="w-3.5 h-3.5" />}
              {tab === "insights" && <Sparkles className="w-3.5 h-3.5" />}
              {tab === "report" && <Calendar className="w-3.5 h-3.5" />}
              {tab}
            </Button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === "chat" && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full"
          >
            {/* Chat Area */}
            <div className="lg:col-span-2 flex flex-col h-full">
              <Card className="flex-1 flex flex-col overflow-hidden">
                <CardHeader className="pb-3 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emovert-cyan to-emovert-purple flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">EMI</CardTitle>
                      <p className="text-xs text-white/40">Emovert Intelligence</p>
                    </div>
                    <Badge variant="success" className="ml-auto gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emovert-green animate-pulse" />
                      Online
                    </Badge>
                  </div>
                </CardHeader>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${
                          message.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            message.role === "user"
                              ? "bg-emovert-cyan/20 border border-emovert-cyan/30 text-white"
                              : "bg-white/5 border border-white/10 text-white/90"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] text-white/30">
                              {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            {message.emotion && (
                              <Badge variant="secondary" className="text-[10px] h-4">
                                {message.emotion}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 text-white/40"
                      >
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">EMI is thinking...</span>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                <div className="p-4 border-t border-white/5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Ask EMI anything about your emotions, focus, or wellness..."
                      className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-emovert-cyan/50 transition-colors text-sm"
                    />
                    <Button onClick={sendMessage} className="glow-cyan px-4">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Suggestions */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emovert-cyan" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    "How is my focus today?",
                    "Help me reduce stress",
                    "Suggest a meditation",
                    "What does my emotion data say?",
                    "Give me productivity tips",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInput(suggestion);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Brain className="w-4 h-4 text-emovert-purple" />
                    Current Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/50">Emotion</span>
                    <Badge variant="glow">{currentEmotion?.emotion || "Happy"}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/50">Confidence</span>
                    <span className="text-sm text-white">
                      {Math.round((currentEmotion?.confidence || 0.94) * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/50">Focus Score</span>
                    <span className="text-sm text-emovert-cyan">82/100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/50">EQ Score</span>
                    <span className="text-sm text-emovert-purple">72/100</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === "insights" && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {coachingInsights.map((insight, index) => (
              <motion.div
                key={insight.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${insight.color}20` }}
                      >
                        <insight.icon className="w-6 h-6" style={{ color: insight.color }} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {insight.title}
                        </h3>
                        <p className="text-sm text-white/50">{insight.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="md:col-span-2"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emovert-green" />
                    Weekly Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Focus Score", value: "82", change: "+12%", color: "#00f0ff" },
                      { label: "EQ Score", value: "72", change: "+5%", color: "#a855f7" },
                      { label: "Positive Ratio", value: "68%", change: "+8%", color: "#22c55e" },
                      { label: "Session Time", value: "12.5h", change: "+2h", color: "#f97316" },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center p-4 rounded-xl bg-white/5">
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                        <div className="text-xs text-white/40 mt-1">{stat.label}</div>
                        <div className="text-xs mt-1" style={{ color: stat.color }}>
                          {stat.change}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {activeTab === "report" && (
          <motion.div
            key="report"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl mx-auto"
          >
            <Card>
              {!dailyReport ? (
                <div className="flex flex-col items-center justify-center p-12 text-white/40">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <p>Loading daily report...</p>
                </div>
              ) : (
                <>
                  <CardHeader className="text-center border-b border-white/5 pb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emovert-cyan to-emovert-purple flex items-center justify-center mx-auto mb-4">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl">Daily Coaching Report</CardTitle>
                    <p className="text-white/40 text-sm mt-1">
                      {new Date(dailyReport.date).toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 rounded-xl bg-white/5">
                        <Heart className="w-6 h-6 text-emovert-pink mx-auto mb-2" />
                        <div className="text-lg font-bold text-white capitalize">
                          {dailyReport.metrics?.dominant_emotion || "None"}
                        </div>
                        <div className="text-xs text-white/40">Dominant Emotion</div>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-white/5">
                        <Target className="w-6 h-6 text-emovert-cyan mx-auto mb-2" />
                        <div className="text-lg font-bold text-white">
                          {Math.round(dailyReport.metrics?.focus_score || 0)}
                        </div>
                        <div className="text-xs text-white/40">Focus Score</div>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-white/5">
                        <Clock className="w-6 h-6 text-emovert-green mx-auto mb-2" />
                        <div className="text-lg font-bold text-white">
                          {Math.round((dailyReport.metrics?.active_duration || 0) / 60)}m
                        </div>
                        <div className="text-xs text-white/40">Active Time</div>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-white/5">
                        <Zap className="w-6 h-6 text-emovert-orange mx-auto mb-2" />
                        <div className="text-lg font-bold text-white">
                          {dailyReport.metrics?.drowsiness_alerts || 0}
                        </div>
                        <div className="text-xs text-white/40">Drowsiness Alerts</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Daily Summary</h3>
                      <p className="text-sm text-white/70 bg-white/5 p-4 rounded-xl leading-relaxed">
                        {dailyReport.summary}
                      </p>
                    </div>

                    {dailyReport.insights && dailyReport.insights.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Insights</h3>
                        <div className="space-y-2">
                          {dailyReport.insights.map((insight: string, i: number) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 * i }}
                              className="flex items-start gap-3 p-3 rounded-lg bg-white/5"
                            >
                              <Info className="w-4 h-4 text-emovert-purple shrink-0 mt-0.5" />
                              <p className="text-sm text-white/70">{insight}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {dailyReport.recommendations && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Recommendations</h3>
                        <div className="space-y-2">
                          {Object.entries(dailyReport.recommendations).map(([category, items]: [string, any]) =>
                            items.map((item: any, i: number) => (
                              <motion.div
                                key={`${category}-${i}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-start gap-3 p-3 rounded-lg bg-white/5"
                              >
                                <Sparkles className="w-4 h-4 text-emovert-cyan shrink-0 mt-0.5" />
                                <div>
                                  <Badge className="text-[9px] mb-1 capitalize" variant="outline">
                                    {category}
                                  </Badge>
                                  <p className="text-sm text-white/80 font-medium">{item.title}</p>
                                  <p className="text-xs text-white/40">{item.description}</p>
                                </div>
                              </motion.div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    <Link href="/reports">
                      <Button className="w-full glow-cyan gap-2">
                        <Calendar className="w-4 h-4" />
                        View Full Reports
                      </Button>
                    </Link>
                  </CardContent>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
