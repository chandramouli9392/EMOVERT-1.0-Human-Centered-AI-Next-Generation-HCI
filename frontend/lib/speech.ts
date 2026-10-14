/**
 * EMOVERT Speech Input (STT) and Voice Output (TTS) Engine
 *
 * Implements fault-tolerant browser-native speech handling with:
 * - Permission and capability detection
 * - Silence timeouts and controlled retry limits
 * - Independent lifecycles for STT and TTS
 * - Immediate fallback without blocking visual interaction
 */

export interface STTCallbacks {
  onResult: (transcript: string, confidence: number) => void;
  onError: (errorType: string, message: string) => void;
  onListeningStart?: () => void;
  onListeningEnd?: () => void;
}

export class SpeechRecognitionManager {
  private recognition: any = null;
  private isListening = false;
  private retryCount = 0;
  private maxRetries = 2;
  private silenceTimer: any = null;
  private silenceTimeoutMs = 7000;
  private hasReceivedResult = false;

  constructor(maxRetries = 2, silenceTimeoutMs = 7000) {
    this.maxRetries = maxRetries;
    this.silenceTimeoutMs = silenceTimeoutMs;
  }

  static isSupported(): boolean {
    if (typeof window === "undefined") return false;
    return Boolean(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  }

  async checkMicrophonePermission(): Promise<"granted" | "denied" | "prompt" | "unsupported"> {
    if (typeof navigator === "undefined" || !navigator.permissions) {
      return "unsupported";
    }
    try {
      const status = await (navigator.permissions as any).query({ name: "microphone" });
      return status.state;
    } catch {
      return "unsupported";
    }
  }

  startListening(callbacks: STTCallbacks): boolean {
    if (!SpeechRecognitionManager.isSupported()) {
      callbacks.onError("unsupported", "Speech recognition is not supported in this browser.");
      return false;
    }

    if (this.isListening) {
      this.stopListening();
    }

    try {
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionClass();

      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = "en-US";
      this.recognition.maxAlternatives = 1;
      this.hasReceivedResult = false;

      this.recognition.onstart = () => {
        this.isListening = true;
        callbacks.onListeningStart?.();

        // Start silence timeout
        this.clearSilenceTimer();
        this.silenceTimer = setTimeout(() => {
          if (this.isListening && !this.hasReceivedResult) {
            this.stopListening();
            this.handleTimeoutOrEmpty(callbacks);
          }
        }, this.silenceTimeoutMs);
      };

      this.recognition.onresult = (event: any) => {
        this.hasReceivedResult = true;
        this.clearSilenceTimer();
        const result = event.results?.[0]?.[0];
        if (result && result.transcript && result.transcript.trim().length > 0) {
          const transcript = result.transcript.trim();
          const confidence = result.confidence || 0.85;
          this.retryCount = 0; // Reset retries on successful input
          callbacks.onResult(transcript, confidence);
        } else {
          this.handleTimeoutOrEmpty(callbacks);
        }
      };

      this.recognition.onerror = (event: any) => {
        this.clearSilenceTimer();
        const err = event.error || "unknown";
        let userMessage = "Speech recognition error.";

        switch (err) {
          case "not-allowed":
            userMessage = "Microphone access was denied. Please check your browser permission settings.";
            break;
          case "no-speech":
            this.handleTimeoutOrEmpty(callbacks);
            return;
          case "audio-capture":
            userMessage = "No microphone was found or microphone is muted.";
            break;
          case "network":
            userMessage = "Network error during speech processing.";
            break;
          case "aborted":
            return; // Normal cancellation
          default:
            userMessage = `Speech recognition error: ${err}`;
        }

        callbacks.onError(err, userMessage);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.clearSilenceTimer();
        callbacks.onListeningEnd?.();
      };

      this.recognition.start();
      return true;
    } catch (err: any) {
      this.isListening = false;
      this.clearSilenceTimer();
      callbacks.onError("initialization_failed", err?.message || "Failed to initialize microphone.");
      return false;
    }
  }

  private handleTimeoutOrEmpty(callbacks: STTCallbacks) {
    if (this.retryCount < this.maxRetries) {
      this.retryCount += 1;
      callbacks.onError(
        "no_speech_retry",
        `No speech detected. Retry attempt ${this.retryCount} of ${this.maxRetries}.`
      );
    } else {
      callbacks.onError(
        "retry_limit_reached",
        "Speech recognition timed out. Screen input is ready below."
      );
    }
  }

  stopListening() {
    this.clearSilenceTimer();
    if (this.recognition && this.isListening) {
      try {
        this.recognition.abort();
      } catch {
        // Safe ignore
      }
    }
    this.isListening = false;
  }

  resetRetryCount() {
    this.retryCount = 0;
  }

  getRetryCount(): number {
    return this.retryCount;
  }

  getMaxRetries(): number {
    return this.maxRetries;
  }

  private clearSilenceTimer() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }
}

export class SpeechSynthesisManager {
  private isMuted = false;
  private lastSpokenText = "";
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  static isSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  speak(
    text: string,
    callbacks?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: string) => void;
    }
  ): boolean {
    if (!SpeechSynthesisManager.isSupported()) {
      callbacks?.onError?.("Speech synthesis not supported in this browser.");
      callbacks?.onEnd?.(); // Immediate continuation
      return false;
    }

    if (this.isMuted || !text || text.trim().length === 0) {
      callbacks?.onEnd?.();
      return false;
    }

    this.cancel(); // Stop any overlapping previous speech
    this.lastSpokenText = text;

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = "en-US";

      // Select gentle natural voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Natural") ||
            v.name.includes("Google") ||
            v.name.includes("Samantha") ||
            v.name.includes("Alex"))
      );
      if (preferred) {
        utterance.voice = preferred;
      }

      utterance.onstart = () => {
        callbacks?.onStart?.();
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        callbacks?.onEnd?.();
      };

      utterance.onerror = (event) => {
        this.currentUtterance = null;
        callbacks?.onError?.(`Voice output error: ${event.error}`);
        callbacks?.onEnd?.(); // Never block the workflow on voice error
      };

      window.speechSynthesis.speak(utterance);
      return true;
    } catch (err: any) {
      this.currentUtterance = null;
      callbacks?.onError?.(err?.message || "Failed to synthesize speech.");
      callbacks?.onEnd?.();
      return false;
    }
  }

  cancel() {
    if (SpeechSynthesisManager.isSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Safe ignore
      }
    }
    this.currentUtterance = null;
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.cancel();
    }
    return this.isMuted;
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.isMuted) {
      this.cancel();
    }
  }

  getIsMuted(): boolean {
    return this.isMuted;
  }

  replayLast(callbacks?: { onStart?: () => void; onEnd?: () => void }): boolean {
    if (!this.lastSpokenText) return false;
    return this.speak(this.lastSpokenText, callbacks);
  }
}
