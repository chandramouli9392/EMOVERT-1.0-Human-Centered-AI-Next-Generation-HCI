"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Webcam from "react-webcam";
import { useEmovertStore } from "@/hooks/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Pause,
  Square,
  Camera,
  Eye,
  Brain,
  Zap,
  AlertTriangle,
  Clock,
  Shield,
  Activity,
  PersonStanding,
  Loader2,
} from "lucide-react";
import { formatDuration, getEmotionColor, getEmotionIcon } from "@/lib/utils";
import { sessionAPI, focusAPI, emotionAPI } from "@/lib/api";

interface DetectionResult {
  emotion: string;
  confidence: number;
  focus: number;
  attention: number;
  drowsiness: number;
  personDetected: boolean;
  distracted: boolean;
}

export default function SessionPage() {
  const webcamRef = useRef<Webcam>(null);
  const sessionRef = useRef<any>(null);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [showDrowsinessAlert, setShowDrowsinessAlert] = useState(false);
  const [showDistractionAlert, setShowDistractionAlert] = useState(false);
  const [showPersonAlert, setShowPersonAlert] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    privacyMode,
    setPrivacyMode,
    setFocusScore,
    setAttentionScore,
    setDrowsinessScore,
    incrementDrowsinessEvents,
    incrementDistractionCount,
    incrementSessionDuration,
    setCurrentEmotion,
    addEmotion,
  } = useEmovertStore();

  // Run real-time detection using backend API
  const runRealDetection = useCallback(async () => {
    if (!webcamRef.current) return;
    const imageData = webcamRef.current.getScreenshot();
    if (!imageData) return;

    try {
      const [focusRes, emotionRes] = await Promise.all([
        focusAPI.analyze(imageData),
        emotionAPI.detect(imageData)
      ]);

      const fData = focusRes.data;
      const eData = emotionRes.data;

      const result: DetectionResult = {
        emotion: eData.emotion,
        confidence: eData.confidence,
        focus: fData.focus_score,
        attention: fData.attention_score,
        drowsiness: fData.drowsiness.score,
        personDetected: fData.distraction.type !== "away",
        distracted: fData.distraction.is_distracted,
      };

      setDetectionResult(result);
      setFocusScore(fData.focus_score);
      setAttentionScore(fData.attention_score);
      setDrowsinessScore(fData.drowsiness.score);

      // Set current emotion and log it
      const emotionObj = {
        id: Date.now().toString(),
        userId: "user",
        emotion: eData.emotion,
        confidence: eData.confidence,
        timestamp: new Date().toISOString(),
        sessionId: sessionRef.current?.id ? String(sessionRef.current.id) : "session",
      };
      setCurrentEmotion(emotionObj);
      addEmotion(emotionObj);

      // Check alerts
      if (fData.drowsiness.is_drowsy && !showDrowsinessAlert) {
        setShowDrowsinessAlert(true);
        incrementDrowsinessEvents();
        setTimeout(() => setShowDrowsinessAlert(false), 5000);
      }

      if (fData.distraction.is_distracted && !showDistractionAlert) {
        setShowDistractionAlert(true);
        incrementDistractionCount();
        setTimeout(() => setShowDistractionAlert(false), 5000);
      }

      if (fData.distraction.type === "away" && !showPersonAlert) {
        setShowPersonAlert(true);
        setTimeout(() => setShowPersonAlert(false), 5000);
      }
    } catch (err) {
      console.error("Error during real-time tracking:", err);
    }
  }, [
    setFocusScore,
    setAttentionScore,
    setDrowsinessScore,
    incrementDrowsinessEvents,
    incrementDistractionCount,
    setCurrentEmotion,
    addEmotion,
    showDrowsinessAlert,
    showDistractionAlert,
    showPersonAlert,
  ]);

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
        incrementSessionDuration();
      }, 1000);

      // Run detection every 5 seconds
      detectionIntervalRef.current = setInterval(() => {
        if (!privacyMode) {
          runRealDetection();
        }
      }, 5000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    };
  }, [isActive, isPaused, privacyMode, runRealDetection, incrementSessionDuration]);

  const startSession = async () => {
    try {
      const res = await sessionAPI.start();
      sessionRef.current = res.data;
      setIsActive(true);
      setIsPaused(false);
      setDuration(0);
      if (!privacyMode) {
        runRealDetection();
      }
    } catch (err) {
      console.error("Failed to start session:", err);
    }
  };

  const pauseSession = async () => {
    if (sessionRef.current) {
      try {
        await sessionAPI.pause(sessionRef.current.id);
        setIsPaused(true);
      } catch (err) {
        console.error("Failed to pause session:", err);
      }
    }
  };

  const resumeSession = async () => {
    if (sessionRef.current) {
      try {
        await sessionAPI.resume(sessionRef.current.id);
        setIsPaused(false);
      } catch (err) {
        console.error("Failed to resume session:", err);
      }
    }
  };

  const endSession = async () => {
    if (sessionRef.current) {
      try {
        await sessionAPI.end(sessionRef.current.id);
      } catch (err) {
        console.error("Failed to end session:", err);
      }
    }
    setIsActive(false);
    setIsPaused(false);
    setDuration(0);
    setDetectionResult(null);
    setShowDrowsinessAlert(false);
    setShowDistractionAlert(false);
    setShowPersonAlert(false);
    sessionRef.current = null;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Live <span className="gradient-text">Session</span>
          </h1>
          <p className="text-white/50 mt-1">
            Real-time emotion and focus analysis
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={privacyMode ? "destructive" : "outline"}
            size="sm"
            onClick={() => setPrivacyMode(!privacyMode)}
            className="gap-2"
          >
            <Shield className="w-4 h-4" />
            {privacyMode ? "Privacy On" : "Privacy Off"}
          </Button>
        </div>
      </motion.div>

      {/* Alerts */}
      <AnimatePresence>
        {showDrowsinessAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3"
          >
            <Zap className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="text-sm font-medium text-yellow-200">
                Take some rest and come back stronger buddy.
              </p>
              <p className="text-xs text-yellow-200/60">
                Drowsiness detected. Consider taking a short break.
              </p>
            </div>
          </motion.div>
        )}

        {showDistractionAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <div>
              <p className="text-sm font-medium text-orange-200">
                Stay focused. Your goals are waiting for you.
              </p>
              <p className="text-xs text-orange-200/60">
                Distraction detected. Try to maintain eye contact.
              </p>
            </div>
          </motion.div>
        )}

        {showPersonAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-center gap-3"
          >
            <PersonStanding className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-sm font-medium text-blue-200">
                Session Paused — User Not Detected
              </p>
              <p className="text-xs text-blue-200/60">
                Please return to continue your session.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Webcam Feed */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-emovert-cyan" />
                Live Feed
                {isActive && (
                  <Badge variant="default" className="gap-1 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    LIVE
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video bg-black/50 rounded-xl overflow-hidden">
                {privacyMode ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Shield className="w-16 h-16 text-white/20 mx-auto mb-4" />
                      <p className="text-lg font-medium text-white/40">
                        Privacy Mode Enabled
                      </p>
                      <p className="text-sm text-white/20 mt-2">
                        Webcam and detection are paused
                      </p>
                    </div>
                  </div>
                ) : isActive ? (
                  <>
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      screenshotFormat="image/jpeg"
                      className="w-full h-full object-cover"
                      mirrored
                    />
                    {/* Overlay metrics */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <Badge variant="glow" className="gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(duration)}
                      </Badge>
                      {detectionResult && (
                        <Badge variant="glow" className="gap-1">
                          {getEmotionIcon(detectionResult.emotion)}
                          {detectionResult.emotion}
                        </Badge>
                      )}
                    </div>
                    {/* Scan line effect */}
                    <div className="absolute inset-0 scan-line pointer-events-none" />
                    {/* Grid overlay */}
                    <div className="absolute inset-0 neural-grid opacity-30 pointer-events-none" />
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="w-16 h-16 text-white/20 mx-auto mb-4" />
                      <p className="text-lg font-medium text-white/40">
                        Ready to Start
                      </p>
                      <p className="text-sm text-white/20 mt-2">
                        Click Start Session to begin analysis
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3 mt-4">
                {!isActive ? (
                  <Button size="lg" className="glow-cyan gap-2" onClick={startSession}>
                    <Play className="w-5 h-5" />
                    Start Session
                  </Button>
                ) : (
                  <>
                    {isPaused ? (
                      <Button size="lg" className="glow-cyan gap-2" onClick={resumeSession}>
                        <Play className="w-5 h-5" />
                        Resume
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        variant="outline"
                        className="gap-2"
                        onClick={pauseSession}
                      >
                        <Pause className="w-5 h-5" />
                        Pause
                      </Button>
                    )}
                    <Button
                      size="lg"
                      variant="destructive"
                      className="gap-2"
                      onClick={endSession}
                    >
                      <Square className="w-5 h-5" />
                      End Session
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Live Metrics */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {/* Session Timer */}
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <Clock className="w-6 h-6 text-emovert-cyan mx-auto mb-2" />
                <div className="text-3xl font-bold text-white font-mono">
                  {formatDuration(duration)}
                </div>
                <div className="text-xs text-white/40 mt-1">
                  Session Duration
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Emotion */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="w-4 h-4 text-emovert-purple" />
                Current Emotion
              </CardTitle>
            </CardHeader>
            <CardContent>
              {detectionResult ? (
                <div className="text-center">
                  <motion.div
                    className="text-4xl mb-2"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {getEmotionIcon(detectionResult.emotion)}
                  </motion.div>
                  <p className="text-lg font-bold capitalize text-white">
                    {detectionResult.emotion}
                  </p>
                  <Progress
                    value={detectionResult.confidence * 100}
                    indicatorColor={`bg-[${getEmotionColor(detectionResult.emotion)}]`}
                    className="mt-2"
                  />
                  <p className="text-xs text-white/40 mt-1">
                    Confidence: {Math.round(detectionResult.confidence * 100)}%
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Loader2 className="w-8 h-8 text-white/20 mx-auto animate-spin" />
                  <p className="text-sm text-white/40 mt-2">Analyzing...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Focus Score */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-emovert-green" />
                Focus Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {detectionResult?.focus || 0}
                </div>
                <Progress
                  value={detectionResult?.focus || 0}
                  indicatorColor="bg-emovert-green"
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Attention Score */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-emovert-yellow" />
                Attention Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {detectionResult?.attention || 0}
                </div>
                <Progress
                  value={detectionResult?.attention || 0}
                  indicatorColor="bg-emovert-yellow"
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Drowsiness Score */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-emovert-orange" />
                Drowsiness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {detectionResult?.drowsiness || 0}
                </div>
                <Progress
                  value={detectionResult?.drowsiness || 0}
                  indicatorColor="bg-emovert-orange"
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
