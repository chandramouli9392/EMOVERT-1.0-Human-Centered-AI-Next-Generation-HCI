import { CoordinatedPrompt, ModalitySource } from "@/types/multimodal";

/**
 * Single source of truth for all multimodal interaction prompts.
 * Guarantees that spoken audio and screen text are generated from the exact same content.
 */

export const STANDARD_MOODS = [
  { id: "happy", label: "Happy", emoji: "😊", color: "#10B981" },
  { id: "calm", label: "Calm", emoji: "😌", color: "#06B6D4" },
  { id: "focused", label: "Focused", emoji: "🎯", color: "#3B82F6" },
  { id: "stressed", label: "Stressed", emoji: "😰", color: "#F59E0B" },
  { id: "sad", label: "Sad", emoji: "😔", color: "#8B5CF6" },
  { id: "angry", label: "Angry", emoji: "😠", color: "#EF4444" },
  { id: "neutral", label: "Neutral", emoji: "😐", color: "#94A3B8" },
  { id: "other", label: "Other", emoji: "✨", color: "#EC4899" },
];

export class PromptManager {
  /**
   * Generates initial question prompt when visual input is unavailable or disabled.
   */
  static getMoodInquiryPrompt(retryCount = 0): CoordinatedPrompt {
    if (retryCount > 0) {
      return {
        id: `prompt_inquiry_retry_${retryCount}_${Date.now()}`,
        displayText: "I couldn't clearly catch that. How are you feeling right now? You can speak your answer or tap any mood option below.",
        spokenText: "I couldn't clearly catch that. How are you feeling right now? You can speak or tap an option below.",
        category: "question",
        suggestedMoods: STANDARD_MOODS.map((m) => m.id),
        allowVoice: true,
        allowManual: true,
        retryCount,
        timestamp: Date.now(),
      };
    }

    return {
      id: `prompt_inquiry_initial_${Date.now()}`,
      displayText: "Camera analysis is unavailable. How are you feeling right now? Speak your answer or select an option below.",
      spokenText: "Camera analysis is unavailable. How are you feeling right now? You can speak your answer or select an option below.",
      category: "question",
      suggestedMoods: STANDARD_MOODS.map((m) => m.id),
      allowVoice: true,
      allowManual: true,
      retryCount: 0,
      timestamp: Date.now(),
    };
  }

  /**
   * Generates confirmation prompt before applying personalized recommendations or IoT changes.
   * Clearly presents whether this was an AI estimate or user reported.
   */
  static getConfirmationPrompt(
    detectedEmotion: string,
    source: ModalitySource,
    confidence = 0.85
  ): CoordinatedPrompt {
    const formattedEmotion = detectedEmotion.charAt(0).toUpperCase() + detectedEmotion.slice(1);
    const confPct = Math.round(confidence * 100);

    if (source === "visual_estimation") {
      return {
        id: `prompt_confirm_visual_${Date.now()}`,
        displayText: `Facial affect estimate: ${formattedEmotion} (${confPct}% confidence). Does this match how you feel, or would you like to correct it?`,
        spokenText: `It looks like you might be feeling ${formattedEmotion}. Does this match how you feel, or would you like to correct it?`,
        category: "confirmation",
        allowVoice: true,
        allowManual: true,
        timestamp: Date.now(),
      };
    }

    if (source === "voice_input") {
      return {
        id: `prompt_confirm_voice_${Date.now()}`,
        displayText: `You mentioned feeling ${formattedEmotion}. Please confirm to proceed with personalized adaptation, or choose another state.`,
        spokenText: `You mentioned feeling ${formattedEmotion}. Please confirm to proceed, or select another state.`,
        category: "confirmation",
        allowVoice: true,
        allowManual: true,
        timestamp: Date.now(),
      };
    }

    return {
      id: `prompt_confirm_manual_${Date.now()}`,
      displayText: `Selected state: ${formattedEmotion}. Ready to personalize your environment and wellness recommendations.`,
      spokenText: `Selected state: ${formattedEmotion}. Ready to personalize your environment and recommendations.`,
      category: "confirmation",
      allowVoice: false,
      allowManual: true,
      timestamp: Date.now(),
    };
  }

  /**
   * Generates recommendation prompt with matching text and audio summaries.
   */
  static getRecommendationPrompt(
    emotion: string,
    primaryTip: string,
    environmentMode: string,
    isLocalFallback = false
  ): CoordinatedPrompt {
    const prefix = isLocalFallback ? "[Offline Wellness Guide] " : "";
    const spokenPrefix = isLocalFallback ? "Using local wellness guide. " : "";

    return {
      id: `prompt_rec_${Date.now()}`,
      displayText: `${prefix}For ${emotion} state: ${primaryTip} Ambient lighting and soundscape set to "${environmentMode}".`,
      spokenText: `${spokenPrefix}For your ${emotion} state, here is a recommendation: ${primaryTip}. Environmental lighting set to ${environmentMode}.`,
      category: "recommendation",
      allowVoice: false,
      allowManual: true,
      timestamp: Date.now(),
    };
  }

  /**
   * Generates accessible recovery prompt when a modality encounters an error.
   */
  static getModalityErrorPrompt(
    failedModality: "camera" | "mic" | "stt" | "tts" | "ai" | "network",
    reason: string
  ): CoordinatedPrompt {
    let displayText = "";
    let spokenText = "";

    switch (failedModality) {
      case "camera":
        displayText = `Camera feed stopped or permission denied (${reason}). Voice prompt and manual mood selection are active below.`;
        spokenText = "Camera is unavailable. You can speak your answer or tap an option on screen.";
        break;
      case "mic":
      case "stt":
        displayText = `Voice recognition ended or permission denied (${reason}). You can select your mood or type your response below.`;
        spokenText = ""; // Voice failed, do not attempt to speak failure
        break;
      case "tts":
        displayText = "Voice output is muted or unavailable on this browser. Full visual text is displayed on screen.";
        spokenText = "";
        break;
      case "ai":
      case "network":
        displayText = `AI service/network unavailable (${reason}). Active interaction state preserved using deterministic offline wellness presets.`;
        spokenText = "Network connection is offline. Using local wellness recommendations.";
        break;
    }

    return {
      id: `prompt_error_${failedModality}_${Date.now()}`,
      displayText,
      spokenText,
      category: "error",
      allowVoice: failedModality !== "mic" && failedModality !== "stt",
      allowManual: true,
      timestamp: Date.now(),
    };
  }
}
