/**
 * Deterministic evidence-based offline wellness recommendations.
 * Used when network connectivity, backend server, or external AI models are unreachable.
 */

export interface OfflineWellnessGuide {
  primaryRecommendation: string;
  nutritionTip: string;
  breathingExercise: string;
  environmentPreset: {
    mode: string;
    lightingColor: string;
    lightingName: string;
    soundscape: string;
  };
  disclaimer: string;
}

export const DETERMINISTIC_FALLBACKS: Record<string, OfflineWellnessGuide> = {
  happy: {
    primaryRecommendation: "Maintain your positive cognitive state by engaging in creative expression or sharing warmth with someone nearby.",
    nutritionTip: "Hydrate and enjoy dark chocolate or fresh berries to sustain steady endorphin levels.",
    breathingExercise: "Energizing 4-4-4 Box Breathing: Inhale 4s, Hold 4s, Exhale 4s, Hold 4s.",
    environmentPreset: {
      mode: "Warm Vitality",
      lightingColor: "#FBBF24",
      lightingName: "Warm Golden Sunlight",
      soundscape: "Uplifting Acoustic Melodies",
    },
    disclaimer: "Deterministic local wellness guide (Offline mode active).",
  },
  calm: {
    primaryRecommendation: "Deepen your tranquil baseline with mindful observation or light tactile stretching.",
    nutritionTip: "Sip warm chamomile or green tea (rich in L-theanine) for sustained composure.",
    breathingExercise: "Coherent Breathing: Gentle 5s inhale followed by gentle 5s exhale.",
    environmentPreset: {
      mode: "Tranquil Azure",
      lightingColor: "#38BDF8",
      lightingName: "Sky Azure",
      soundscape: "Gentle Ocean Waves",
    },
    disclaimer: "Deterministic local wellness guide (Offline mode active).",
  },
  focused: {
    primaryRecommendation: "Protect your attentional flow: keep water nearby and eliminate non-essential desktop notifications.",
    nutritionTip: "A handful of walnuts or almonds provides omega-3s for sustained mental clarity.",
    breathingExercise: "Focus Breath: Inhale through nose for 4s, exhale with gentle purse for 6s.",
    environmentPreset: {
      mode: "Clarity Cyan",
      lightingColor: "#06B6D4",
      lightingName: "Clarity Cyan",
      soundscape: "Brown Noise & Alpha Frequencies",
    },
    disclaimer: "Deterministic local wellness guide (Offline mode active).",
  },
  stressed: {
    primaryRecommendation: "Acknowledge the tension without judgment. Take a micro-break from screens and drop your shoulders.",
    nutritionTip: "Avoid excess caffeine; opt for magnesium-rich pumpkin seeds or pure water.",
    breathingExercise: "4-7-8 Parasympathetic Reset: Inhale 4s, Hold 7s, Slow exhale 8s (repeat 4 cycles).",
    environmentPreset: {
      mode: "Soothing Sage",
      lightingColor: "#34D399",
      lightingName: "Respiratory Sage Green",
      soundscape: "Forest Rain & Gentle Stream",
    },
    disclaimer: "Deterministic local wellness guide (Offline mode active).",
  },
  sad: {
    primaryRecommendation: "Be gentle with your emotional pacing. Wrap up in comfort and step into natural daylight if available.",
    nutritionTip: "Bananas or warm oatmeal support serotonin synthesis naturally.",
    breathingExercise: "Heart-Centered Sigh: Deep inhale filling chest, followed by an audible relaxed sigh.",
    environmentPreset: {
      mode: "Cozy Amber",
      lightingColor: "#F97316",
      lightingName: "Comforting Amber",
      soundscape: "Soft Piano & Hearth Ambience",
    },
    disclaimer: "Deterministic local wellness guide (Offline mode active).",
  },
  angry: {
    primaryRecommendation: "Step away from immediate stimuli. Direct physical energy into a brief walk or cool water on wrists.",
    nutritionTip: "Drink chilled water to help regulate core autonomic temperature.",
    breathingExercise: "Cooling Breath: Inhale through slightly parted lips, exhale slowly through nose.",
    environmentPreset: {
      mode: "Cooling Lavender",
      lightingColor: "#818CF8",
      lightingName: "Indigo Lavender",
      soundscape: "Mountain Stream Waterflow",
    },
    disclaimer: "Deterministic local wellness guide (Offline mode active).",
  },
  neutral: {
    primaryRecommendation: "Check in with your posture and hydration. Take 60 seconds to set a conscious intention for your next task.",
    nutritionTip: "A balanced glass of water with lemon refreshes cognitive alertness.",
    breathingExercise: "Natural Awareness: Three deep diaphragm breaths at your own natural pace.",
    environmentPreset: {
      mode: "Balanced Daylight",
      lightingColor: "#E2E8F0",
      lightingName: "Neutral Soft Daylight",
      soundscape: "Subtle Air Flow",
    },
    disclaimer: "Deterministic local wellness guide (Offline mode active).",
  },
};

export function getOfflineRecommendation(emotion: string): OfflineWellnessGuide {
  const key = (emotion || "neutral").toLowerCase();
  if (DETERMINISTIC_FALLBACKS[key]) {
    return DETERMINISTIC_FALLBACKS[key];
  }
  return DETERMINISTIC_FALLBACKS["neutral"];
}
