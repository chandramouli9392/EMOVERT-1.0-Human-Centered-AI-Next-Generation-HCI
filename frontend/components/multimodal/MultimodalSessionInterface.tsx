"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Check,
  X,
  Sparkles,
  AlertCircle,
  Brain,
  Camera,
  CameraOff,
  Sliders,
  Lamp,
  Music,
  Eye,
  Send,
  HelpCircle,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STANDARD_MOODS } from "@/lib/promptManager";
import {
  InteractionState,
  AffectState,
  CoordinatedPrompt,
  EnvironmentalAdaptationStatus,
} from "@/types/multimodal";

interface MultimodalSessionInterfaceProps {
  state: InteractionState;
  activePrompt: CoordinatedPrompt | null;
  currentAffectState: AffectState | null;
  confirmedAffectState: AffectState | null;
  environmentStatus: EnvironmentalAdaptationStatus | null;
  isSpeaking: boolean;
  isListening: boolean;
  isMuted: boolean;
  sttSupported: boolean;
  ttsSupported: boolean;
  speechError: string | null;
  isOfflineMode: boolean;
  onConfirmState: (mood?: string) => void;
  onRejectState: () => void;
  onManualMoodSubmit: (mood: string, description?: string) => void;
  onSkipMood: () => void;
  onTriggerVoiceFallback: () => void;
  onTriggerManualInput: () => void;
  onToggleMute: () => void;
  onReplayVoice: () => void;
  onCancelSpeech: () => void;
  onReset: () => void;
}

export const MultimodalSessionInterface: React.FC<MultimodalSessionInterfaceProps> = ({
  state,
  activePrompt,
  currentAffectState,
  confirmedAffectState,
  environmentStatus,
  isSpeaking,
  isListening,
  isMuted,
  sttSupported,
  ttsSupported,
  speechError,
  isOfflineMode,
  onConfirmState,
  onRejectState,
  onManualMoodSubmit,
  onSkipMood,
  onTriggerVoiceFallback,
  onTriggerManualInput,
  onToggleMute,
  onReplayVoice,
  onCancelSpeech,
  onReset,
}) => {
  const [selectedMood, setSelectedMood] = useState<string>("calm");
  const [freeformText, setFreeformText] = useState<string>("");
  const [showCorrectionSelector, setShowCorrectionSelector] = useState(false);

  // Helper for human-friendly stage labels
  const getStageBadge = () => {
    switch (state) {
      case "IDLE":
        return <Badge variant="outline">Standby</Badge>;
      case "PRESENCE_DETECTED":
        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40">Presence Detected</Badge>;
      case "CHECKING_VISUAL_INPUT":
      case "VISUAL_ESTIMATION":
        return <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 animate-pulse">Visual Analysis</Badge>;
      case "VOICE_PROMPT":
        return <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40">Voice Prompting</Badge>;
      case "VOICE_LISTENING":
        return <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse">Listening for Voice...</Badge>;
      case "PROCESSING_SPEECH":
        return <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse">Processing Speech</Badge>;
      case "MANUAL_INPUT":
        return <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/40">Manual Screen Input</Badge>;
      case "CONFIRMING_STATE":
        return <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40">User Confirmation Required</Badge>;
      case "GENERATING_RECOMMENDATION":
        return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/40">Preparing Guidance</Badge>;
      case "APPLYING_ENVIRONMENT_ACTION":
        return <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse">Adapting Environment</Badge>;
      case "COMPLETED":
        return <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40">Interaction Complete</Badge>;
      case "RECOVERABLE_ERROR":
        return <Badge variant="destructive">Fallback Active</Badge>;
    }
  };

  const handleManualFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onManualMoodSubmit(selectedMood, freeformText.trim() || undefined);
    setFreeformText("");
  };

  return (
    <Card className="border border-white/10 bg-slate-900/80 backdrop-blur-md shadow-2xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-white/5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            <CardTitle className="text-lg font-semibold text-white tracking-wide">
              Multimodal Interaction Engine
            </CardTitle>
            {getStageBadge()}
          </div>

          {/* Global Voice / Speech Controls */}
          <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
            {ttsSupported && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs text-white/70 hover:text-white"
                  onClick={onToggleMute}
                  title={isMuted ? "Unmute Spoken Prompts" : "Mute Spoken Prompts"}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
                  <span className="ml-1 hidden sm:inline">{isMuted ? "Muted" : "Voice On"}</span>
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs text-white/70 hover:text-white"
                  onClick={onReplayVoice}
                  disabled={!activePrompt?.spokenText || isMuted}
                  title="Replay Spoken Response"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="ml-1 hidden sm:inline">Replay</span>
                </Button>
              </>
            )}

            {isSpeaking && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs text-amber-300 hover:text-amber-200"
                onClick={onCancelSpeech}
              >
                Stop Audio
              </Button>
            )}

            {isOfflineMode && (
              <Badge variant="outline" className="text-[10px] text-amber-300 border-amber-500/30">
                Offline Mode
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* SECTION 1: Synchronized Screen Text & Spoken Prompt */}
        <AnimatePresence mode="wait">
          {activePrompt && (
            <motion.div
              key={activePrompt.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`p-4 rounded-xl border ${
                activePrompt.category === "error"
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                  : activePrompt.category === "confirmation"
                  ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-100"
                  : activePrompt.category === "recommendation"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-100"
                  : "bg-white/5 border-white/10 text-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white/10 shrink-0 mt-0.5">
                  {isSpeaking ? (
                    <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
                  ) : activePrompt.category === "error" ? (
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                  )}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase font-medium tracking-wider text-white/50">
                      {isSpeaking ? "Speaking and Screen Text" : "Current Interaction Prompt"}
                    </p>
                    {isSpeaking && (
                      <span className="text-[11px] text-cyan-300 font-mono animate-pulse">
                        [Audio Playing...]
                      </span>
                    )}
                  </div>
                  <p className="text-sm sm:text-base font-medium leading-relaxed">
                    {activePrompt.displayText}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SECTION 2: Voice Listening Indicator with Waveform */}
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center animate-ping absolute inset-0" />
                <div className="w-10 h-10 rounded-full bg-emerald-500/30 flex items-center justify-center relative">
                  <Mic className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-200">Listening to your voice...</p>
                <p className="text-xs text-emerald-300/70">
                  Say how you feel (e.g. &ldquo;I feel happy&rdquo;, &ldquo;calm&rdquo;, &ldquo;stressed&rdquo;)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-xs border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/20"
                onClick={onTriggerManualInput}
              >
                Switch to Screen Input
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs text-white/60 hover:text-white"
                onClick={onCancelSpeech}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}

        {/* SECTION 3: State Confirmation & Correction (Human Control Guarantee) */}
        {state === "CONFIRMING_STATE" && currentAffectState && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  Human Control Verification
                </span>
                <p className="text-sm text-white/80 mt-1">
                  We distinguish between AI estimates and your confirmed state. Please confirm before we personalize your environment.
                </p>
              </div>

              <Badge
                className={
                  currentAffectState.source === "visual_estimation"
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                    : currentAffectState.source === "voice_input"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-blue-500/20 text-blue-300 border-blue-500/40"
                }
              >
                Source: {currentAffectState.source === "visual_estimation" ? "AI Vision" : currentAffectState.source === "voice_input" ? "Voice Input" : "Manual Selection"}
              </Badge>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
              <span className="text-2xl">
                {STANDARD_MOODS.find((m) => m.id === currentAffectState.emotion.toLowerCase())?.emoji || "🙂"}
              </span>
              <div className="flex-1">
                <p className="text-base font-bold text-white capitalize">
                  {currentAffectState.emotion}
                </p>
                <p className="text-xs text-white/50">
                  Confidence: {Math.round(currentAffectState.confidence * 100)}% {currentAffectState.notes ? `• "${currentAffectState.notes}"` : ""}
                </p>
              </div>
            </div>

            {/* Actions: Confirm, Correct, Skip */}
            {!showCorrectionSelector ? (
              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5"
                  onClick={() => onConfirmState()}
                >
                  <Check className="w-4 h-4" />
                  Confirm This State
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="border-indigo-400/40 text-indigo-200 hover:bg-indigo-500/20 gap-1.5"
                  onClick={() => setShowCorrectionSelector(true)}
                >
                  <Sliders className="w-4 h-4" />
                  Correct / Choose Different
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white/50 hover:text-white"
                  onClick={onSkipMood}
                >
                  Skip
                </Button>
              </div>
            ) : (
              <div className="space-y-3 pt-2 border-t border-white/10">
                <p className="text-xs text-indigo-200 font-medium">Select your actual mood state:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {STANDARD_MOODS.map((mood) => (
                    <Button
                      key={mood.id}
                      size="sm"
                      variant="outline"
                      className="justify-start gap-2 h-9 text-xs border-white/10 hover:border-cyan-400/50"
                      onClick={() => {
                        setShowCorrectionSelector(false);
                        onConfirmState(mood.id);
                      }}
                    >
                      <span>{mood.emoji}</span>
                      <span>{mood.label}</span>
                    </Button>
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-white/50"
                  onClick={() => setShowCorrectionSelector(false)}
                >
                  Cancel Correction
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* SECTION 4: Fallback Manual Screen Input Interface */}
        {(state === "MANUAL_INPUT" || state === "VOICE_PROMPT" || state === "RECOVERABLE_ERROR") && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-xl bg-slate-800/80 border border-white/10 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">Manual Mood Selection & Text Entry</h4>
                <p className="text-xs text-white/50">
                  Select how you are feeling or describe in your own words.
                </p>
              </div>

              {sttSupported && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 gap-1.5"
                  onClick={onTriggerVoiceFallback}
                >
                  <Mic className="w-3.5 h-3.5" />
                  Try Voice Instead
                </Button>
              )}
            </div>

            {/* Quick Mood Selection Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {STANDARD_MOODS.map((mood) => {
                const isSelected = selectedMood === mood.id;
                return (
                  <button
                    key={mood.id}
                    type="button"
                    onClick={() => setSelectedMood(mood.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/10"
                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className="text-xl">{mood.emoji}</span>
                    <span className="text-xs font-medium">{mood.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Optional Freeform Text Input */}
            <form onSubmit={handleManualFormSubmit} className="space-y-3 pt-2">
              <div className="relative">
                <input
                  type="text"
                  value={freeformText}
                  onChange={(e) => setFreeformText(e.target.value)}
                  placeholder="Optional: describe how you feel in your own words..."
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit Mood
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-white/50 hover:text-white"
                    onClick={onSkipMood}
                  >
                    Skip Question
                  </Button>
                </div>

                <span className="text-[11px] text-white/40">
                  Keyboard accessible • Tab to navigate
                </span>
              </div>
            </form>
          </motion.div>
        )}

        {/* SECTION 5: Environmental Adaptation & IoT Feedback */}
        {environmentStatus && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <Lamp className="w-3.5 h-3.5 text-cyan-400" />
                Active Environmental Adaptation
              </span>
              <Badge variant="outline" className="text-[10px] text-white/60 border-white/15">
                {environmentStatus.hardwareConfirmed ? "Physical IoT Connected" : "Software Emulation"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Lighting card */}
              <div className="p-3 rounded-lg bg-black/30 border border-white/5 flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full border border-white/20 shadow-md shrink-0"
                  style={{ backgroundColor: environmentStatus.lighting.colorHex }}
                />
                <div>
                  <p className="text-xs font-semibold text-white">Lighting: {environmentStatus.lighting.colorName}</p>
                  <p className="text-[11px] text-white/50">
                    Mode: {environmentStatus.lighting.mode} ({environmentStatus.lighting.brightnessPct}%)
                  </p>
                </div>
              </div>

              {/* Soundscape card */}
              <div className="p-3 rounded-lg bg-black/30 border border-white/5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0">
                  <Music className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Soundscape: {environmentStatus.audio.ambience}</p>
                  <p className="text-[11px] text-white/50">Volume: {environmentStatus.audio.volumePct}%</p>
                </div>
              </div>

              {/* Ambient Glow card */}
              <div className="p-3 rounded-lg bg-black/30 border border-white/5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                  <Eye className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Display Ambiance</p>
                  <p className="text-[11px] text-white/50">Pace: {environmentStatus.display.pulseRate}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* SECTION 6: Quick Restart / Reset Trigger */}
        {state === "COMPLETED" && (
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <span className="text-xs text-white/50">
              Interaction completed safely. Next check-in ready on demand.
            </span>
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-white/20 text-white/80 hover:text-white gap-1.5"
              onClick={onReset}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Start New Check-in
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
