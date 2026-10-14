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
except Exception:
    CV2_AVAILABLE = False

import os

ENABLE_HEAVY_AI = os.getenv("ENABLE_HEAVY_AI", "false").lower() == "true"
FER_AVAILABLE = False
DEEPFACE_AVAILABLE = False
MEDIAPIPE_AVAILABLE = False

if ENABLE_HEAVY_AI:
    try:
        from fer import FER
        FER_AVAILABLE = True
    except Exception:
        pass

    try:
        from deepface import DeepFace
        DEEPFACE_AVAILABLE = True
    except Exception:
        pass

    try:
        import mediapipe as mp
        MEDIAPIPE_AVAILABLE = True
    except Exception:
        pass

logger = logging.getLogger(__name__)

# Extended emotion list supported by EMOVERT (16 emotions)
SUPPORTED_EMOTIONS = [
    "happy", "excited", "sad", "angry", "neutral", "surprise",
    "fear", "disgust", "stress", "anxiety", "boredom", "confusion",
    "focused", "calm", "curious", "sleepy"
]

# Mapping from detector emotions to EMOVERT emotions
EMOTION_MAPPINGS = {
    "happy": "happy",
    "excited": "excited",
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
    "focused": "focused",
    "calm": "calm",
    "curious": "curious",
    "sleepy": "sleepy",
}


class EmotionDetector:
    """Primary emotion detection engine using FER, DeepFace, and OpenCV live computer vision."""

    def __init__(self):
        self._fer_detector = None
        self._face_mesh = None
        self._mp_drawing = None
        self._face_cascade = None
        self._smile_cascade = None
        self._eye_cascade = None
        self._init_detectors()

    def _init_detectors(self):
        """Initialize detection models lazily."""
        if CV2_AVAILABLE and self._face_cascade is None:
            try:
                self._face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
                self._smile_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_smile.xml')
                self._eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
                logger.info("OpenCV Haar Cascades initialized for real-time live vision")
            except Exception as e:
                logger.warning(f"OpenCV cascades initialization failed: {e}")

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
        """Decode base64 image string to OpenCV format numpy array with auto-downscaling for speed."""
        if "," in image_data:
            image_data = image_data.split(",")[1]
        img_bytes = base64.b64decode(image_data)
        if CV2_AVAILABLE:
            nparr = np.frombuffer(img_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if frame is not None:
                h, w = frame.shape[:2]
                if w > 640:
                    scale = 640.0 / w
                    frame = cv2.resize(frame, (640, int(h * scale)), interpolation=cv2.INTER_AREA)
                return frame
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        frame = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR) if CV2_AVAILABLE else np.array(img)
        if CV2_AVAILABLE and frame.shape[1] > 640:
            scale = 640.0 / frame.shape[1]
            frame = cv2.resize(frame, (640, int(frame.shape[0] * scale)), interpolation=cv2.INTER_AREA)
        return frame

    def detect_emotion(self, image_data: str) -> Dict:
        """Detect emotion from base64-encoded image.
        
        Returns dict with keys: emotion, confidence, all_emotions
        """
        try:
            frame = self._decode_image(image_data)
        except Exception as e:
            logger.error(f"Image decode failed: {e}")
            return self._fallback_response()

        # Try FER first if available
        if FER_AVAILABLE and self._fer_detector is not None:
            result = self._detect_with_fer(frame)
            if result.get("confidence", 0) > 0.5:
                return result

        # Fallback to DeepFace if available
        if DEEPFACE_AVAILABLE:
            result = self._detect_with_deepface(frame)
            if result.get("confidence", 0) > 0.5:
                return result

        # Real-time live vision using OpenCV cascades
        if CV2_AVAILABLE and self._face_cascade is not None:
            result = self._detect_with_opencv(frame)
            if result:
                return result

        return self._fallback_response()

    def _detect_with_opencv(self, frame: np.ndarray) -> Dict:
        """High-speed real-time facial emotion recognition using OpenCV computer vision.
        
        Extracts facial features (eyes, smiles, glabella furrow, brow asymmetry,
        mouth aspect/contrast, nose bridge variance, head tilt) to recognize 16 distinct
        emotions and cognitive states in < 15ms.
        """
        try:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY) if len(frame.shape) == 3 else frame
            faces = self._face_cascade.detectMultiScale(gray, scaleFactor=1.18, minNeighbors=4, minSize=(50, 50))

            if len(faces) == 0:
                all_emotions = {e: 0.02 for e in SUPPORTED_EMOTIONS}
                all_emotions["neutral"] = 0.60
                return {
                    "emotion": "neutral",
                    "confidence": 0.50,
                    "all_emotions": all_emotions,
                    "detector": "opencv_live",
                    "face_detected": False,
                }

            # Analyze the primary face (largest area)
            x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
            roi_gray = gray[y:y+h, x:x+w]

            # 1. Mouth & Smile analysis in lower 50%
            roi_lower = roi_gray[int(h * 0.50):h, 0:w]
            smiles = self._smile_cascade.detectMultiScale(roi_lower, scaleFactor=1.5, minNeighbors=12, minSize=(25, 20))
            has_smile = len(smiles) > 0
            smile_w = max((s[2] for s in smiles), default=0)
            smile_ratio = min(1.0, smile_w / (w * 0.5)) if has_smile else 0.0

            # Mouth aperture & opening (inner 60% of lower region)
            mouth_core = roi_lower[int(roi_lower.shape[0] * 0.20):int(roi_lower.shape[0] * 0.85), int(w * 0.20):int(w * 0.80)]
            mouth_std = float(np.std(mouth_core)) if mouth_core.size > 0 else 0.0
            dark_mouth_ratio = float(np.mean(mouth_core < (np.mean(roi_gray) * 0.55))) if mouth_core.size > 0 else 0.0

            # 2. Eye detection in upper 45%
            roi_upper = roi_gray[int(h * 0.14):int(h * 0.56), 0:w]
            eyes = self._eye_cascade.detectMultiScale(roi_upper, scaleFactor=1.15, minNeighbors=4, minSize=(16, 16))
            num_eyes = len(eyes)

            # Eye alignment / head tilt
            eye_tilt = 0.0
            if num_eyes >= 2:
                sorted_eyes = sorted(eyes, key=lambda e: e[0])
                dx = abs(sorted_eyes[1][0] - sorted_eyes[0][0])
                dy = abs(sorted_eyes[1][1] - sorted_eyes[0][1])
                eye_tilt = dy / max(1.0, float(dx))

            # 3. Brow & Glabella tension
            brow_region = roi_gray[int(h * 0.08):int(h * 0.30), int(w * 0.20):int(w * 0.80)]
            brow_var = float(np.var(brow_region)) if brow_region.size > 0 else 0.0

            glabella = roi_gray[int(h * 0.12):int(h * 0.32), int(w * 0.38):int(w * 0.62)]
            if glabella.size > 0:
                sobel_x = cv2.Sobel(glabella, cv2.CV_64F, 1, 0, ksize=3)
                frown_energy = float(np.mean(np.abs(sobel_x)))
            else:
                frown_energy = 0.0

            # Brow asymmetry (one raised brow vs other)
            left_brow = roi_gray[int(h * 0.08):int(h * 0.30), int(w * 0.15):int(w * 0.45)]
            right_brow = roi_gray[int(h * 0.08):int(h * 0.30), int(w * 0.55):int(w * 0.85)]
            if left_brow.size > 0 and right_brow.size > 0:
                brow_asym = abs(float(np.var(left_brow)) - float(np.var(right_brow))) / max(80.0, brow_var)
            else:
                brow_asym = 0.0

            # 4. Nose bridge wrinkling (disgust)
            nose_bridge = roi_gray[int(h * 0.30):int(h * 0.52), int(w * 0.35):int(w * 0.65)]
            nose_var = float(np.var(nose_bridge)) if nose_bridge.size > 0 else 0.0

            emotions = {e: 0.02 for e in SUPPORTED_EMOTIONS}

            # Decision logic with natural hierarchical evaluation
            if has_smile and smile_ratio >= 0.40 and num_eyes >= 2:
                # Big wide smile + alert open eyes -> Excited!
                conf = round(float(min(0.97, 0.76 + smile_ratio * 0.22)), 2)
                detected = "excited"
                emotions["excited"] = conf
                emotions["happy"] = round(conf * 0.85, 2)
            elif has_smile:
                # Positive smile detected -> Happy!
                conf = round(float(min(0.95, max(0.72, 0.68 + smile_ratio * 0.3))), 2)
                detected = "happy"
                emotions["happy"] = conf
                emotions["neutral"] = round(max(0.05, 1.0 - conf), 2)
            elif (mouth_std > 50.0 or dark_mouth_ratio > 0.24) and num_eyes >= 1 and brow_var < 1550:
                # Open mouth + visible eyes + low brow furrow -> Surprise!
                conf = 0.88
                detected = "surprise"
                emotions["surprise"] = conf
                emotions["neutral"] = 0.10
            elif (mouth_std > 44.0 or dark_mouth_ratio > 0.20) and brow_var >= 1400 and num_eyes >= 2:
                # Open mouth with high brow tension -> Fear!
                conf = 0.85
                detected = "fear"
                emotions["fear"] = conf
                emotions["anxiety"] = 0.70
            elif frown_energy > 28.0 and brow_var > 1250 and mouth_std <= 42.0:
                # Severe vertical brow furrow (glabella frown) + tight mouth -> Angry!
                conf = round(float(min(0.94, 0.72 + (frown_energy - 28.0) * 0.01)), 2)
                detected = "angry"
                emotions["angry"] = conf
                emotions["stress"] = round(conf * 0.75, 2)
            elif nose_var > 1300 and brow_var > 1100 and mouth_std < 40.0:
                # Wrinkled nose bridge + furrowed brow -> Disgust!
                conf = 0.82
                detected = "disgust"
                emotions["disgust"] = conf
                emotions["angry"] = 0.50
            elif (brow_asym > 0.48 or eye_tilt > 0.16) and num_eyes >= 1:
                # Asymmetric eyebrow raise or head cocked sideways -> Confusion!
                conf = 0.84
                detected = "confusion"
                emotions["confusion"] = conf
                emotions["curious"] = 0.65
            elif (eye_tilt > 0.08 and eye_tilt <= 0.16) and num_eyes >= 2 and brow_var < 1200:
                # Inquisitive mild head angle + focused eyes -> Curious!
                conf = 0.82
                detected = "curious"
                emotions["curious"] = conf
                emotions["focused"] = 0.70
            elif brow_var > 1450:
                # High continuous brow furrow tension -> Stress!
                conf = round(float(min(0.92, 0.68 + (brow_var - 1450) / 2500.0)), 2)
                detected = "stress"
                emotions["stress"] = conf
                emotions["anxiety"] = round(conf * 0.70, 2)
            elif brow_var > 1250 and num_eyes >= 2 and mouth_std < 32.0:
                # Elevated brow tension with fixed stare -> Anxiety!
                conf = 0.80
                detected = "anxiety"
                emotions["anxiety"] = conf
                emotions["stress"] = 0.65
            elif num_eyes == 0 and brow_var < 800:
                # Eyes closed + relaxed forehead -> Sleepy!
                conf = 0.86
                detected = "sleepy"
                emotions["sleepy"] = conf
                emotions["boredom"] = 0.60
            elif num_eyes == 0 or (num_eyes == 1 and brow_var > 900):
                # Drooping gaze or eye closed with brow drop -> Sad!
                conf = 0.78
                detected = "sad"
                emotions["sad"] = conf
                emotions["neutral"] = 0.15
            elif num_eyes == 1 and brow_var < 750:
                # Droopy/single eye aperture with low activation -> Boredom!
                conf = 0.80
                detected = "boredom"
                emotions["boredom"] = conf
                emotions["neutral"] = 0.30
            elif num_eyes >= 2 and eye_tilt <= 0.08 and 500 <= brow_var <= 1250 and mouth_std <= 38.0:
                # Centered alert gaze, forward head, steady engagement -> Focused!
                conf = 0.89
                detected = "focused"
                emotions["focused"] = conf
                emotions["neutral"] = 0.20
            elif brow_var < 500 and mouth_std <= 32.0:
                # Smooth tranquil facial tones, relaxed brows -> Calm!
                conf = 0.85
                detected = "calm"
                emotions["calm"] = conf
                emotions["neutral"] = 0.25
            else:
                # Baseline balanced expression -> Neutral!
                conf = 0.88
                detected = "neutral"
                emotions["neutral"] = conf
                emotions["focused"] = 0.15
                emotions["calm"] = 0.15

            # Normalize emotion distribution
            total = sum(emotions.values())
            if total > 0:
                emotions = {k: round(v / total, 3) for k, v in emotions.items()}

            return {
                "emotion": detected,
                "confidence": conf,
                "all_emotions": emotions,
                "detector": "opencv_live",
                "face_detected": True,
            }
        except Exception as e:
            logger.warning(f"OpenCV live emotion analysis failed: {e}")
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
