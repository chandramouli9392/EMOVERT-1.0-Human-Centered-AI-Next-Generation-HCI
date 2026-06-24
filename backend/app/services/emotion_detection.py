"""EMOVERT Emotion Detection Service

Uses FER as primary detector with DeepFace fallback.
Processes OpenCV frames for real-time emotion analysis.
"""

import base64
import io
import logging
from typing import Dict, List, Optional, Tuple
import numpy as np
from PIL import Image

try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False

try:
    from fer import FER
    FER_AVAILABLE = True
except ImportError:
    FER_AVAILABLE = False

try:
    from deepface import DeepFace
    DEEPFACE_AVAILABLE = True
except ImportError:
    DEEPFACE_AVAILABLE = False

try:
    import mediapipe as mp
    MEDIAPIPE_AVAILABLE = True
except ImportError:
    MEDIAPIPE_AVAILABLE = False

logger = logging.getLogger(__name__)

# Extended emotion list supported by EMOVERT
SUPPORTED_EMOTIONS = [
    "happy", "sad", "angry", "neutral", "surprise",
    "fear", "disgust", "stress", "anxiety", "boredom", "confusion"
]

# Mapping from detector emotions to EMOVERT emotions
EMOTION_MAPPINGS = {
    "happy": "happy",
    "sad": "sad",
    "angry": "angry",
    "neutral": "neutral",
    "surprise": "surprise",
    "fear": "fear",
    "disgust": "disgust",
    "contempt": "disgust",
    "stress": "stress",
    "anxiety": "anxiety",
    "boredom": "boredom",
    "confusion": "confusion",
}


class EmotionDetector:
    """Primary emotion detection engine using FER with DeepFace fallback."""

    def __init__(self):
        self._fer_detector = None
        self._face_mesh = None
        self._mp_drawing = None
        self._init_detectors()

    def _init_detectors(self):
        """Initialize detection models lazily."""
        if FER_AVAILABLE and self._fer_detector is None:
            try:
                self._fer_detector = FER(mtcnn=True)
                logger.info("FER detector initialized successfully")
            except Exception as e:
                logger.warning(f"FER initialization failed: {e}")
                self._fer_detector = None

        if MEDIAPIPE_AVAILABLE and self._face_mesh is None:
            try:
                self._face_mesh = mp.solutions.face_mesh.FaceMesh(
                    static_image_mode=False,
                    max_num_faces=1,
                    refine_landmarks=True,
                    min_detection_confidence=0.5,
                    min_tracking_confidence=0.5,
                )
                self._mp_drawing = mp.solutions.drawing_utils
                logger.info("MediaPipe FaceMesh initialized")
            except Exception as e:
                logger.warning(f"MediaPipe initialization failed: {e}")
                self._face_mesh = None

    def _decode_image(self, image_data: str) -> np.ndarray:
        """Decode base64 image string to OpenCV format numpy array."""
        if "," in image_data:
            image_data = image_data.split(",")[1]
        img_bytes = base64.b64decode(image_data)
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR) if CV2_AVAILABLE else np.array(img)

    def detect_emotion(self, image_data: str) -> Dict:
        """Detect emotion from base64-encoded image.
        
        Returns dict with keys: emotion, confidence, all_emotions
        """
        try:
            frame = self._decode_image(image_data)
        except Exception as e:
            logger.error(f"Image decode failed: {e}")
            return self._fallback_response()

        # Try FER first
        result = self._detect_with_fer(frame)
        if result["confidence"] > 0.5:
            return result

        # Fallback to DeepFace
        if DEEPFACE_AVAILABLE:
            result = self._detect_with_deepface(frame)
            if result["confidence"] > 0.5:
                return result

        # If both fail, return best effort or neutral
        if result["emotion"] != "neutral":
            return result

        return self._fallback_response()

    def _detect_with_fer(self, frame: np.ndarray) -> Dict:
        """Detect emotion using FER library."""
        if self._fer_detector is None or not FER_AVAILABLE:
            return self._fallback_response()

        try:
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB) if CV2_AVAILABLE else frame
            results = self._fer_detector.detect_emotions(rgb_frame)

            if not results:
                return self._fallback_response()

            # Get the dominant emotion from first face
            emotions = results[0]["emotions"]
            dominant_emotion = max(emotions, key=emotions.get)
            confidence = emotions[dominant_emotion]

            # Map to EMOVERT emotion names
            mapped_emotion = EMOTION_MAPPINGS.get(dominant_emotion.lower(), dominant_emotion.lower())

            # Normalize all emotions
            all_emotions = {EMOTION_MAPPINGS.get(k.lower(), k.lower()): round(float(v), 4)
                           for k, v in emotions.items()}

            # Add extended emotions with heuristic estimates
            all_emotions = self._add_extended_emotions(all_emotions, mapped_emotion)

            return {
                "emotion": mapped_emotion,
                "confidence": round(float(confidence), 4),
                "all_emotions": all_emotions,
                "detector": "fer",
            }
        except Exception as e:
            logger.warning(f"FER detection failed: {e}")
            return self._fallback_response()

    def _detect_with_deepface(self, frame: np.ndarray) -> Dict:
        """Detect emotion using DeepFace as fallback."""
        if not DEEPFACE_AVAILABLE:
            return self._fallback_response()

        try:
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB) if CV2_AVAILABLE else frame
            result = DeepFace.analyze(
                img_path=rgb_frame,
                actions=["emotion"],
                enforce_detection=False,
                silent=True,
            )

            if isinstance(result, list):
                result = result[0]

            emotions = result.get("emotion", {})
            dominant = result.get("dominant_emotion", "neutral")
            confidence = emotions.get(dominant, 0.0) / 100.0

            mapped_emotion = EMOTION_MAPPINGS.get(dominant.lower(), dominant.lower())

            all_emotions = {EMOTION_MAPPINGS.get(k.lower(), k.lower()): round(float(v) / 100.0, 4)
                           for k, v in emotions.items()}
            all_emotions = self._add_extended_emotions(all_emotions, mapped_emotion)

            return {
                "emotion": mapped_emotion,
                "confidence": round(float(confidence), 4),
                "all_emotions": all_emotions,
                "detector": "deepface",
            }
        except Exception as e:
            logger.warning(f"DeepFace detection failed: {e}")
            return self._fallback_response()

    def _add_extended_emotions(self, emotions: Dict[str, float], dominant: str) -> Dict[str, float]:
        """Add extended emotion estimates (stress, anxiety, boredom, confusion)
        based on detected base emotions."""
        extended = dict(emotions)

        # Heuristic mappings for extended emotions
        if "stress" not in extended:
            extended["stress"] = round((extended.get("angry", 0) * 0.4 +
                                         extended.get("fear", 0) * 0.3 +
                                         extended.get("sad", 0) * 0.2), 4)
        if "anxiety" not in extended:
            extended["anxiety"] = round((extended.get("fear", 0) * 0.5 +
                                          extended.get("surprise", 0) * 0.3), 4)
        if "boredom" not in extended:
            extended["boredom"] = round((extended.get("neutral", 0) * 0.3 +
                                          (1 - extended.get("happy", 0)) * 0.1), 4)
        if "confusion" not in extended:
            extended["confusion"] = round((extended.get("surprise", 0) * 0.3 +
                                            extended.get("fear", 0) * 0.2), 4)

        # Ensure all supported emotions have a value
        for emotion in SUPPORTED_EMOTIONS:
            if emotion not in extended:
                extended[emotion] = 0.0

        return extended

    def _fallback_response(self) -> Dict:
        """Return neutral fallback when detection fails."""
        all_emotions = {e: 0.0 for e in SUPPORTED_EMOTIONS}
        all_emotions["neutral"] = 1.0
        return {
            "emotion": "neutral",
            "confidence": 1.0,
            "all_emotions": all_emotions,
            "detector": "fallback",
        }

    def analyze_frame(self, frame: np.ndarray) -> Dict:
        """Analyze a raw OpenCV frame directly."""
        # Convert to base64 for unified processing
        if CV2_AVAILABLE:
            _, buffer = cv2.imencode(".jpg", frame)
            b64 = base64.b64encode(buffer).decode("utf-8")
        else:
            img = Image.fromarray(frame)
            buf = io.BytesIO()
            img.save(buf, format="JPEG")
            b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
        return self.detect_emotion(b64)

    def get_dominant_emotion(self, emotions: Dict[str, float]) -> Tuple[str, float]:
        """Get the dominant emotion and its confidence from a distribution."""
        if not emotions:
            return "neutral", 0.0
        dominant = max(emotions, key=emotions.get)
        return dominant, emotions[dominant]

    def get_emotion_confidence(self, emotion: str, emotions: Dict[str, float]) -> float:
        """Get confidence for a specific emotion."""
        return emotions.get(emotion.lower(), 0.0)

    def get_face_landmarks(self, frame: np.ndarray) -> Optional[List[Dict]]:
        """Extract MediaPipe face landmarks for advanced analysis."""
        if self._face_mesh is None or not MEDIAPIPE_AVAILABLE:
            return None

        try:
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB) if CV2_AVAILABLE else frame
            results = self._face_mesh.process(rgb)
            if results.multi_face_landmarks:
                landmarks = []
                for face_landmarks in results.multi_face_landmarks:
                    face_points = []
                    for idx, lm in enumerate(face_landmarks.landmark):
                        face_points.append({
                            "idx": idx,
                            "x": lm.x,
                            "y": lm.y,
                            "z": lm.z,
                        })
                    landmarks.append(face_points)
                return landmarks
            return None
        except Exception as e:
            logger.warning(f"Face landmark extraction failed: {e}")
            return None

    def get_history(self, user_id: int, db_session) -> List[Dict]:
        """Retrieve emotion detection history for a user."""
        from app.models.emotion import EmotionLog
        logs = db_session.query(EmotionLog).filter(
            EmotionLog.user_id == user_id
        ).order_by(EmotionLog.timestamp.desc()).limit(100).all()

        return [{
            "id": log.id,
            "emotion": log.emotion,
            "confidence": log.confidence,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None,
            "session_id": log.session_id,
        } for log in logs]
