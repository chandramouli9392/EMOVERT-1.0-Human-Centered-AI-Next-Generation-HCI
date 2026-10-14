export type InteractionState =
  | "IDLE"
  | "PRESENCE_DETECTED"
  | "CHECKING_VISUAL_INPUT"
  | "VISUAL_ESTIMATION"
  | "VOICE_PROMPT"
  | "VOICE_LISTENING"
  | "PROCESSING_SPEECH"
  | "MANUAL_INPUT"
  | "CONFIRMING_STATE"
  | "GENERATING_RECOMMENDATION"
  | "APPLYING_ENVIRONMENT_ACTION"
  | "COMPLETED"
  | "RECOVERABLE_ERROR";

export type ModalitySource =
  | "visual_estimation"
  | "voice_input"
  | "manual_input"
  | "unconfirmed"
  | "unknown";

export type InputModality = "visual" | "voice" | "manual" | "environmental" | "system";

export interface AffectState {
  emotion: string;
  confidence: number;
  source: ModalitySource;
  isConfirmed: boolean;
  rawEstimate?: string;
  userCorrection?: string;
  notes?: string;
  timestamp: string;
}

export interface CoordinatedPrompt {
  id: string;
  displayText: string;
  spokenText: string;
  category: "question" | "confirmation" | "recommendation" | "error" | "status";
  suggestedMoods?: string[];
  allowVoice: boolean;
  allowManual: boolean;
  retryCount?: number;
  timestamp: number;
}

export interface EnvironmentalAdaptationStatus {
  activeEmotion: string;
  lighting: {
    mode: string;
    colorHex: string;
    colorName: string;
    brightnessPct: number;
    colorTempK: number;
  };
  audio: {
    ambience: string;
    volumePct: number;
    soundscape: string;
  };
  display: {
    glowColor: string;
    pulseRate: string;
  };
  controllerType: "physical_iot" | "software_emulation";
  hardwareConfirmed: boolean;
  appliedAt: string;
}

export interface MultimodalTelemetryEvent {
  interactionId: string;
  sessionId?: string | number | null;
  eventType:
    | "INTERACTION_STARTED"
    | "VISUAL_INPUT_UNAVAILABLE"
    | "VOICE_FALLBACK_ACTIVATED"
    | "SPEECH_INPUT_FAILED"
    | "MANUAL_INPUT_ACTIVATED"
    | "STATE_CONFIRMED"
    | "STATE_CORRECTED"
    | "RECOMMENDATION_ACCEPTED"
    | "RECOMMENDATION_REJECTED"
    | "ENVIRONMENT_ACTION_SUCCEEDED"
    | "ENVIRONMENT_ACTION_FAILED"
    | "INTERACTION_COMPLETED"
    | "INTERACTION_CANCELLED";
  modality: InputModality;
  source?: ModalitySource;
  latencyMs?: number;
  isFallback: boolean;
  recoveryOutcome?: "recovered" | "failed" | "cancelled" | "completed";
  confirmedEmotion?: string;
  timestamp: string;
}

export interface SpeechRecognitionResultPayload {
  transcript: string;
  confidence: number;
  detectedEmotion?: string;
}
