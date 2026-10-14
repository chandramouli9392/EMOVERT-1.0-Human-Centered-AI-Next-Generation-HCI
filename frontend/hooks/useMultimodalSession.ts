import { useState, useRef, useEffect, useCallback } from "react";
import {
  InteractionState,
  ModalitySource,
  AffectState,
  CoordinatedPrompt,
  EnvironmentalAdaptationStatus,
} from "@/types/multimodal";
import { PromptManager } from "@/lib/promptManager";
import { SpeechRecognitionManager, SpeechSynthesisManager } from "@/lib/speech";
import { getOfflineRecommendation, OfflineWellnessGuide } from "@/lib/offlineRecommendations";
import { coachAPI, environmentAPI, interactionAPI } from "@/lib/api";

interface UseMultimodalSessionOptions {
  sessionId?: string | number | null;
  onEmotionConfirmed?: (state: AffectState) => void;
  onEnvironmentAdapted?: (status: EnvironmentalAdaptationStatus) => void;
}

export function useMultimodalSession({
  sessionId,
  onEmotionConfirmed,
  onEnvironmentAdapted,
}: UseMultimodalSessionOptions = {}) {
  // State Machine State
  const [state, setState] = useState<InteractionState>("IDLE");
  const [activePrompt, setActivePrompt] = useState<CoordinatedPrompt | null>(null);
  const [currentAffectState, setCurrentAffectState] = useState<AffectState | null>(null);
  const [confirmedAffectState, setConfirmedAffectState] = useState<AffectState | null>(null);
  const [recommendation, setRecommendation] = useState<any | null>(null);
  const [offlineGuide, setOfflineGuide] = useState<OfflineWellnessGuide | null>(null);
  const [environmentStatus, setEnvironmentStatus] = useState<EnvironmentalAdaptationStatus | null>(null);

  // Status flags
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [sttSupported, setSttSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Managers
  const sttManagerRef = useRef<SpeechRecognitionManager | null>(null);
  const ttsManagerRef = useRef<SpeechSynthesisManager | null>(null);
  const interactionIdRef = useRef<string>(`int_${Date.now()}`);
  const startTimeRef = useRef<number>(Date.now());
  const isMountedRef = useRef(true);

  // Initialize Speech Managers on Client
  useEffect(() => {
    isMountedRef.current = true;
    sttManagerRef.current = new SpeechRecognitionManager(2, 7000);
    ttsManagerRef.current = new SpeechSynthesisManager();

    setSttSupported(SpeechRecognitionManager.isSupported());
    setTtsSupported(SpeechSynthesisManager.isSupported());

    return () => {
      isMountedRef.current = false;
      sttManagerRef.current?.stopListening();
      ttsManagerRef.current?.cancel();
    };
  }, []);

  // Telemetry Logger
  const logEvent = useCallback(
    async (
      eventType: any,
      modality: any,
      source?: ModalitySource,
      isFallback = false,
      recoveryOutcome?: any,
      confirmedEmotion?: string
    ) => {
      const latencyMs = Date.now() - startTimeRef.current;
      try {
        await interactionAPI.recordEvent({
          session_id: sessionId ? Number(sessionId) : null,
          interaction_id: interactionIdRef.current,
          event_type: eventType,
          modality,
          source,
          latency_ms: latencyMs,
          is_fallback: isFallback,
          recovery_outcome: recoveryOutcome,
          confirmed_emotion: confirmedEmotion,
        });
      } catch {
        // Logging is best-effort and must never disrupt the user
      }
    },
    [sessionId]
  );

  // Coordinated Speech and Screen Text output
  const presentPrompt = useCallback(
    (prompt: CoordinatedPrompt, speak = true) => {
      if (!isMountedRef.current) return;
      setActivePrompt(prompt);

      if (speak && ttsManagerRef.current && prompt.spokenText && !isMuted) {
        ttsManagerRef.current.speak(prompt.spokenText, {
          onStart: () => {
            if (isMountedRef.current) setIsSpeaking(true);
          },
          onEnd: () => {
            if (isMountedRef.current) setIsSpeaking(false);
          },
          onError: () => {
            if (isMountedRef.current) setIsSpeaking(false);
          },
        });
      }
    },
    [isMuted]
  );

  // Reset Interaction Cycle
  const resetInteraction = useCallback(() => {
    sttManagerRef.current?.stopListening();
    ttsManagerRef.current?.cancel();
    interactionIdRef.current = `int_${Date.now()}`;
    startTimeRef.current = Date.now();
    setState("IDLE");
    setActivePrompt(null);
    setCurrentAffectState(null);
    setConfirmedAffectState(null);
    setRecommendation(null);
    setOfflineGuide(null);
    setErrorMessage(null);
    setSpeechError(null);
  }, []);

  // Step 1: Trigger Presence Detected
  const handlePresenceDetected = useCallback(() => {
    interactionIdRef.current = `int_${Date.now()}`;
    startTimeRef.current = Date.now();
    setState("PRESENCE_DETECTED");
    logEvent("INTERACTION_STARTED", "system");
  }, [logEvent]);

  // Step 2: Handle Visual Estimation Outcome
  const handleVisualInputAvailable = useCallback(
    (estimatedEmotion: string, confidence = 0.85) => {
      setState("VISUAL_ESTIMATION");
      const affect: AffectState = {
        emotion: estimatedEmotion,
        confidence,
        source: "visual_estimation",
        isConfirmed: false,
        rawEstimate: estimatedEmotion,
        timestamp: new Date().toISOString(),
      };
      setCurrentAffectState(affect);

      // Transition to Confirmation step
      setState("CONFIRMING_STATE");
      const prompt = PromptManager.getConfirmationPrompt(
        estimatedEmotion,
        "visual_estimation",
        confidence
      );
      presentPrompt(prompt, true);
    },
    [presentPrompt]
  );

  // Transition to Voice Fallback (when camera is unavailable, denied, or face missing)
  const triggerVoiceFallback = useCallback(
    (reason = "Visual estimation unavailable") => {
      logEvent("VOICE_FALLBACK_ACTIVATED", "voice", "unknown", true);
      setState("VOICE_PROMPT");
      const retryCount = sttManagerRef.current?.getRetryCount() || 0;
      const prompt = PromptManager.getMoodInquiryPrompt(retryCount);
      presentPrompt(prompt, true);

      // If STT is supported, start listening
      if (SpeechRecognitionManager.isSupported()) {
        setState("VOICE_LISTENING");
        setSpeechError(null);
        sttManagerRef.current?.startListening({
          onListeningStart: () => {
            if (isMountedRef.current) setIsListening(true);
          },
          onListeningEnd: () => {
            if (isMountedRef.current) setIsListening(false);
          },
          onResult: (transcript, conf) => {
            if (!isMountedRef.current) return;
            setState("PROCESSING_SPEECH");
            setIsListening(false);

            // Parse emotional keyword from spoken transcript
            const lower = transcript.toLowerCase();
            let parsedEmotion = "neutral";
            if (lower.includes("happy") || lower.includes("great") || lower.includes("good") || lower.includes("excited")) {
              parsedEmotion = "happy";
            } else if (lower.includes("calm") || lower.includes("peace") || lower.includes("relaxed")) {
              parsedEmotion = "calm";
            } else if (lower.includes("focus") || lower.includes("working") || lower.includes("productive")) {
              parsedEmotion = "focused";
            } else if (lower.includes("stress") || lower.includes("anxious") || lower.includes("overwhelm")) {
              parsedEmotion = "stressed";
            } else if (lower.includes("sad") || lower.includes("down") || lower.includes("depress")) {
              parsedEmotion = "sad";
            } else if (lower.includes("angry") || lower.includes("mad") || lower.includes("annoy")) {
              parsedEmotion = "angry";
            } else if (lower.includes("neutral") || lower.includes("okay") || lower.includes("fine")) {
              parsedEmotion = "neutral";
            } else {
              parsedEmotion = transcript.slice(0, 30);
            }

            const affect: AffectState = {
              emotion: parsedEmotion,
              confidence: conf,
              source: "voice_input",
              isConfirmed: false,
              notes: transcript,
              timestamp: new Date().toISOString(),
            };
            setCurrentAffectState(affect);

            // Move to confirmation
            setState("CONFIRMING_STATE");
            const confirmPrompt = PromptManager.getConfirmationPrompt(
              parsedEmotion,
              "voice_input",
              conf
            );
            presentPrompt(confirmPrompt, true);
          },
          onError: (errType, msg) => {
            if (!isMountedRef.current) return;
            setIsListening(false);
            setSpeechError(msg);
            logEvent("SPEECH_INPUT_FAILED", "voice", "unknown", true, "recovered");

            if (errType === "retry_limit_reached" || errType === "not-allowed" || errType === "unsupported") {
              // Automatically switch to manual input after retry policy reached or permission denied
              triggerManualInput(msg);
            } else {
              // Present error and keep manual options visible
              const errPrompt = PromptManager.getModalityErrorPrompt("stt", msg);
              presentPrompt(errPrompt, false);
            }
          },
        });
      } else {
        // STT is unsupported in this browser: immediately present manual screen input
        triggerManualInput("Speech recognition is not supported in this browser.");
      }
    },
    [logEvent, presentPrompt]
  );

  // Transition to Manual Screen Input
  const triggerManualInput = useCallback(
    (reason?: string) => {
      sttManagerRef.current?.stopListening();
      ttsManagerRef.current?.cancel();
      logEvent("MANUAL_INPUT_ACTIVATED", "manual", "manual_input", true);
      setState("MANUAL_INPUT");
      const errPrompt = PromptManager.getModalityErrorPrompt("stt", reason || "Manual selection mode");
      presentPrompt(errPrompt, false);
    },
    [logEvent, presentPrompt]
  );

  // Handle Manual Selection or Text Description
  const handleManualMoodSubmit = useCallback(
    (selectedEmotion: string, description?: string) => {
      const affect: AffectState = {
        emotion: selectedEmotion,
        confidence: 1.0,
        source: "manual_input",
        isConfirmed: true, // Explicitly selected by user
        notes: description,
        timestamp: new Date().toISOString(),
      };
      setCurrentAffectState(affect);
      setConfirmedAffectState(affect);
      onEmotionConfirmed?.(affect);
      logEvent("STATE_CONFIRMED", "manual", "manual_input", false, "completed", selectedEmotion);

      // Move directly to generating recommendation & environment action
      proceedToRecommendations(affect);
    },
    [logEvent, onEmotionConfirmed]
  );

  // User Confirms the Active State
  const confirmActiveState = useCallback(
    (confirmedEmotion?: string) => {
      if (!currentAffectState && !confirmedEmotion) return;
      const finalEmotion = confirmedEmotion || currentAffectState?.emotion || "neutral";
      const confirmedState: AffectState = {
        emotion: finalEmotion,
        confidence: 1.0,
        source: currentAffectState?.source || "manual_input",
        isConfirmed: true,
        userCorrection: confirmedEmotion !== currentAffectState?.emotion ? confirmedEmotion : undefined,
        timestamp: new Date().toISOString(),
      };

      setConfirmedAffectState(confirmedState);
      onEmotionConfirmed?.(confirmedState);

      if (confirmedEmotion && confirmedEmotion !== currentAffectState?.emotion) {
        logEvent("STATE_CORRECTED", "manual", confirmedState.source, false, "recovered", finalEmotion);
      } else {
        logEvent("STATE_CONFIRMED", "manual", confirmedState.source, false, "completed", finalEmotion);
      }

      proceedToRecommendations(confirmedState);
    },
    [currentAffectState, logEvent, onEmotionConfirmed]
  );

  // User Rejects the Estimate -> Ask for Correction
  const rejectActiveState = useCallback(() => {
    sttManagerRef.current?.stopListening();
    ttsManagerRef.current?.cancel();
    setCurrentAffectState(null);
    logEvent("STATE_CORRECTED", "manual", "unknown", true, "recovered");
    // Switch to manual input for accurate user choice
    triggerManualInput("Facial estimate rejected by user. Please select your actual mood below.");
  }, [logEvent, triggerManualInput]);

  // User Skips Mood Specification -> Safe non-personalized continuation
  const skipMoodSpecification = useCallback(() => {
    sttManagerRef.current?.stopListening();
    ttsManagerRef.current?.cancel();
    const neutralState: AffectState = {
      emotion: "neutral",
      confidence: 1.0,
      source: "unknown",
      isConfirmed: false,
      notes: "User skipped emotional inquiry",
      timestamp: new Date().toISOString(),
    };
    setConfirmedAffectState(neutralState);
    proceedToRecommendations(neutralState, true);
  }, []);

  // Step 3: Generate Recommendations & Apply Environment
  const proceedToRecommendations = useCallback(
    async (affect: AffectState, isNonPersonalized = false) => {
      setState("GENERATING_RECOMMENDATION");
      const emotion = affect.emotion.toLowerCase();

      let recData: any = null;
      let isFallback = false;

      try {
        // Try live backend AI recommendation API
        const res = await coachAPI.getRecommendations(emotion);
        recData = res.data;
        setRecommendation(recData);
        setIsOfflineMode(false);
      } catch {
        // Network or AI service failure -> Deterministic Offline Fallback
        isFallback = true;
        setIsOfflineMode(true);
        const guide = getOfflineRecommendation(emotion);
        setOfflineGuide(guide);
        recData = {
          food: [{ name: guide.nutritionTip }],
          wellness: [{ name: guide.primaryRecommendation }],
          exercise: [{ name: guide.breathingExercise }],
        };
        setRecommendation(recData);
      }

      // Transition to Environment Adaptation
      setState("APPLYING_ENVIRONMENT_ACTION");
      try {
        const envRes = await environmentAPI.apply(emotion);
        const data = envRes.data;
        const statusObj: EnvironmentalAdaptationStatus = {
          activeEmotion: emotion,
          lighting: {
            mode: data.applied_preset?.lighting?.mode || "Balanced",
            colorHex: data.applied_preset?.lighting?.color_hex || "#E2E8F0",
            colorName: data.applied_preset?.lighting?.color_name || "Daylight",
            brightnessPct: data.applied_preset?.lighting?.brightness_pct || 70,
            colorTempK: data.applied_preset?.lighting?.color_temp_k || 5000,
          },
          audio: {
            ambience: data.applied_preset?.audio?.ambience || "Gentle",
            volumePct: data.applied_preset?.audio?.volume_pct || 30,
            soundscape: data.applied_preset?.audio?.soundscape || "Air",
          },
          display: {
            glowColor: data.applied_preset?.display?.glow_color || "rgba(255,255,255,0.1)",
            pulseRate: data.applied_preset?.display?.pulse_rate || "steady",
          },
          controllerType: data.controller_type || "software_emulation",
          hardwareConfirmed: Boolean(data.hardware_confirmed),
          appliedAt: new Date().toISOString(),
        };
        setEnvironmentStatus(statusObj);
        onEnvironmentAdapted?.(statusObj);
        logEvent("ENVIRONMENT_ACTION_SUCCEEDED", "environmental", undefined, false, "completed", emotion);
      } catch {
        // Fallback local ambient status
        const guide = getOfflineRecommendation(emotion);
        const fallbackStatus: EnvironmentalAdaptationStatus = {
          activeEmotion: emotion,
          lighting: {
            mode: guide.environmentPreset.mode,
            colorHex: guide.environmentPreset.lightingColor,
            colorName: guide.environmentPreset.lightingName,
            brightnessPct: 60,
            colorTempK: 4000,
          },
          audio: {
            ambience: guide.environmentPreset.soundscape,
            volumePct: 30,
            soundscape: guide.environmentPreset.soundscape,
          },
          display: {
            glowColor: "rgba(6, 182, 212, 0.2)",
            pulseRate: "slow",
          },
          controllerType: "software_emulation",
          hardwareConfirmed: false,
          appliedAt: new Date().toISOString(),
        };
        setEnvironmentStatus(fallbackStatus);
        onEnvironmentAdapted?.(fallbackStatus);
        logEvent("ENVIRONMENT_ACTION_FAILED", "environmental", undefined, true, "recovered", emotion);
      }

      // Complete Interaction Cycle
      setState("COMPLETED");
      logEvent("INTERACTION_COMPLETED", "system", affect.source, isFallback, "completed", emotion);

      const guide = getOfflineRecommendation(emotion);
      const tipText = isNonPersonalized
        ? "General wellness baseline activated."
        : guide.primaryRecommendation;
      const recPrompt = PromptManager.getRecommendationPrompt(
        emotion,
        tipText,
        guide.environmentPreset.mode,
        isFallback
      );
      presentPrompt(recPrompt, true);
    },
    [logEvent, onEnvironmentAdapted, onEmotionConfirmed, presentPrompt]
  );

  // Audio Controls
  const toggleMute = useCallback(() => {
    if (ttsManagerRef.current) {
      const muted = ttsManagerRef.current.toggleMute();
      setIsMuted(muted);
    }
  }, []);

  const replayVoice = useCallback(() => {
    if (ttsManagerRef.current && activePrompt) {
      ttsManagerRef.current.replayLast({
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      });
    }
  }, [activePrompt]);

  const cancelSpeech = useCallback(() => {
    ttsManagerRef.current?.cancel();
    sttManagerRef.current?.stopListening();
    setIsSpeaking(false);
    setIsListening(false);
  }, []);

  return {
    state,
    setState,
    activePrompt,
    currentAffectState,
    confirmedAffectState,
    recommendation,
    offlineGuide,
    environmentStatus,
    isSpeaking,
    isListening,
    isMuted,
    sttSupported,
    ttsSupported,
    speechError,
    isOfflineMode,
    errorMessage,
    // Actions
    handlePresenceDetected,
    handleVisualInputAvailable,
    triggerVoiceFallback,
    triggerManualInput,
    handleManualMoodSubmit,
    confirmActiveState,
    rejectActiveState,
    skipMoodSpecification,
    toggleMute,
    replayVoice,
    cancelSpeech,
    resetInteraction,
  };
}
