"""EMOVERT Drowsiness Detection Service

Uses MediaPipe face landmarks to calculate Eye Aspect Ratio (EAR)
and detect drowsiness/fatigue in real-time.
"""

import logging
import math
from typing import Dict, List, Optional, Tuple
import numpy as np
from datetime import datetime

import os

ENABLE_HEAVY_AI = os.getenv("ENABLE_HEAVY_AI", "false").lower() == "true"
MEDIAPIPE_AVAILABLE = False

if ENABLE_HEAVY_AI:
    try:
        import mediapipe as mp
        MEDIAPIPE_AVAILABLE = True
    except Exception:
        pass

try:
    import cv2
    CV2_AVAILABLE = True
except Exception:
    CV2_AVAILABLE = False

logger = logging.getLogger(__name__)

# EAR threshold constants
EAR_DROWSY_THRESHOLD = 0.22
EAR_SLEEP_THRESHOLD = 0.18
CONSECUTIVE_FRAMES_THRESHOLD = 15

# Landmark indices for eyes (MediaPipe FaceMesh)
LEFT_EYE_INDICES = [33, 160, 158, 133, 153, 144]
RIGHT_EYE_INDICES = [362, 385, 387, 263, 373, 380]


class DrowsinessDetector:
    """Detects drowsiness using Eye Aspect Ratio and facial analysis."""

    def __init__(self):
        self._face_mesh = None
        self._face_cascade = None
        self._eye_cascade = None
        self._init_model()
        self._frame_counter = 0
        self._drowsy_frame_count = 0
        self._event_log: List[Dict] = []
        self._current_ear = 1.0
        self._is_drowsy = False
        self._drowsiness_score = 0.0

    def _init_model(self):
        """Initialize MediaPipe FaceMesh and OpenCV cascades."""
        if CV2_AVAILABLE and self._face_cascade is None:
            try:
                self._face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
                self._eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
                logger.info("OpenCV cascades initialized for DrowsinessDetector")
            except Exception as e:
                logger.warning(f"OpenCV cascades init failed: {e}")

        if not MEDIAPIPE_AVAILABLE:
            return

        try:
            self._face_mesh = mp.solutions.face_mesh.FaceMesh(
                static_image_mode=False,
                max_num_faces=1,
                refine_landmarks=True,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5,
            )
            logger.info("DrowsinessDetector initialized")
        except Exception as e:
            logger.warning(f"FaceMesh init failed: {e}")
            self._face_mesh = None

    def calculate_ear(self, landmarks, eye_indices: List[int], w: int, h: int) -> float:
        """Calculate Eye Aspect Ratio for a single eye.
        
        EAR = (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)
        
        Returns:
            float: EAR value (typically 0.15-0.45)
        """
        points = []
        for idx in eye_indices:
            lm = landmarks[idx]
            points.append((lm.x * w, lm.y * h))

        if len(points) < 6:
            return 0.3  # Default open eye

        # Vertical distances
        A = math.dist(points[1], points[5])
        B = math.dist(points[2], points[4])
        # Horizontal distance
        C = math.dist(points[0], points[3])

        if C == 0:
            return 0.3

        ear = (A + B) / (2.0 * C)
        return ear

    def detect_drowsiness(self, frame: np.ndarray) -> Dict:
        """Detect drowsiness from a video frame.
        
        Returns:
            Dict with keys: is_drowsy, ear, severity, score, eyes_closed
        """
        if self._face_mesh is None:
            if CV2_AVAILABLE and self._face_cascade is not None:
                return self._detect_drowsiness_with_opencv(frame)
            return self._fallback_result()

        try:
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB) if CV2_AVAILABLE else frame
            results = self._face_mesh.process(rgb)

            if not results.multi_face_landmarks:
                if CV2_AVAILABLE and self._face_cascade is not None:
                    return self._detect_drowsiness_with_opencv(frame)
                return {
                    "is_drowsy": False,
                    "ear": 1.0,
                    "severity": "none",
                    "score": 0.0,
                    "eyes_closed": False,
                    "face_detected": False,
                }

            landmarks = results.multi_face_landmarks[0].landmark
            h, w = frame.shape[:2]

            # Calculate EAR for both eyes
            left_ear = self.calculate_ear(landmarks, LEFT_EYE_INDICES, w, h)
            right_ear = self.calculate_ear(landmarks, RIGHT_EYE_INDICES, w, h)
            avg_ear = (left_ear + right_ear) / 2.0

            self._current_ear = avg_ear
            self._frame_counter += 1

            # Determine drowsiness state
            is_drowsy = avg_ear < EAR_DROWSY_THRESHOLD
            eyes_closed = avg_ear < EAR_SLEEP_THRESHOLD

            if is_drowsy:
                self._drowsy_frame_count += 1
            else:
                self._drowsy_frame_count = max(0, self._drowsy_frame_count - 2)

            # Calculate severity
            if eyes_closed and self._drowsy_frame_count >= CONSECUTIVE_FRAMES_THRESHOLD:
                severity = "high"
                score = 85.0 + min(15.0, self._drowsy_frame_count * 0.5)
            elif is_drowsy and self._drowsy_frame_count >= CONSECUTIVE_FRAMES_THRESHOLD // 2:
                severity = "medium"
                score = 50.0 + min(35.0, self._drowsy_frame_count * 1.0)
            elif is_drowsy:
                severity = "low"
                score = 20.0 + min(30.0, self._drowsy_frame_count * 2.0)
            else:
                severity = "none"
                score = max(0.0, self._drowsiness_score - 5.0)

            self._drowsiness_score = score
            self._is_drowsy = is_drowsy or eyes_closed

            # Log event if severe drowsiness detected
            if severity in ("medium", "high") and self._drowsy_frame_count == CONSECUTIVE_FRAMES_THRESHOLD:
                self._log_event(severity, avg_ear)

            return {
                "is_drowsy": self._is_drowsy,
                "ear": round(avg_ear, 4),
                "severity": severity,
                "score": round(score, 2),
                "eyes_closed": eyes_closed,
                "face_detected": True,
                "consecutive_frames": self._drowsy_frame_count,
            }

        except Exception as e:
            logger.warning(f"Drowsiness detection failed: {e}")
            return self._fallback_result()

    def get_drowsiness_score(self) -> float:
        """Get current drowsiness score (0-100, higher = more drowsy)."""
        return round(self._drowsiness_score, 2)

    def _log_event(self, severity: str, ear: float):
        """Log a drowsiness event."""
        self._event_log.append({
            "timestamp": datetime.utcnow().isoformat(),
            "severity": severity,
            "ear": round(ear, 4),
        })
        logger.info(f"Drowsiness event logged: severity={severity}, ear={ear:.3f}")

    def get_event_log(self) -> List[Dict]:
        """Get all logged drowsiness events."""
        return self._event_log.copy()

    def reset(self):
        """Reset detector state."""
        self._frame_counter = 0
        self._drowsy_frame_count = 0
        self._event_log.clear()
        self._current_ear = 1.0
        self._is_drowsy = False
    def _detect_drowsiness_with_opencv(self, frame: np.ndarray) -> Dict:
        """Detect live drowsiness based on eye closure in OpenCV."""
        try:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY) if len(frame.shape) == 3 else frame
            faces = self._face_cascade.detectMultiScale(gray, scaleFactor=1.2, minNeighbors=4, minSize=(60, 60))

            if len(faces) == 0:
                return {
                    "is_drowsy": False,
                    "ear": 0.3,
                    "severity": "none",
                    "score": 0.0,
                    "eyes_closed": False,
                    "face_detected": False,
                }

            x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
            roi_upper = gray[y + int(h * 0.15):y + int(h * 0.58), x:x + w]
            eyes = self._eye_cascade.detectMultiScale(roi_upper, scaleFactor=1.15, minNeighbors=4, minSize=(16, 16))

            if len(eyes) == 0:
                # Eyes closed / blinking
                self._drowsy_frame_count += 1
                if self._drowsy_frame_count >= 2:
                    severity = "high" if self._drowsy_frame_count >= 4 else "medium"
                    score = min(100.0, 50.0 + self._drowsy_frame_count * 12.0)
                    return {
                        "is_drowsy": True,
                        "ear": 0.14,
                        "severity": severity,
                        "score": round(score, 1),
                        "eyes_closed": True,
                        "face_detected": True,
                    }
                else:
                    return {
                        "is_drowsy": False,
                        "ear": 0.19,
                        "severity": "low",
                        "score": 25.0,
                        "eyes_closed": True,
                        "face_detected": True,
                    }
            else:
                self._drowsy_frame_count = max(0, self._drowsy_frame_count - 1)
                return {
                    "is_drowsy": False,
                    "ear": 0.35,
                    "severity": "none",
                    "score": 0.0,
                    "eyes_closed": False,
                    "face_detected": True,
                }
        except Exception as e:
            logger.warning(f"OpenCV drowsiness detection failed: {e}")
            return self._fallback_result()

    def _fallback_result(self) -> Dict:
        """Fallback result when detection unavailable."""
        return {
            "is_drowsy": False,
            "ear": 0.3,
            "severity": "none",
            "score": 0.0,
            "eyes_closed": False,
            "face_detected": False,
            "consecutive_frames": 0,
        }
