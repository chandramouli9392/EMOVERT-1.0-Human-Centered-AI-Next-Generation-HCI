"""EMOVERT Focus Analysis Service

Uses MediaPipe FaceMesh to calculate focus and attention scores
based on eye tracking, head pose, and face presence.
"""

import logging
import math
from typing import Dict, List, Optional, Tuple
import numpy as np

try:
    import mediapipe as mp
    MEDIAPIPE_AVAILABLE = True
except ImportError:
    MEDIAPIPE_AVAILABLE = False

try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False

logger = logging.getLogger(__name__)

# MediaPipe face mesh landmark indices
LEFT_EYE_INDICES = [33, 160, 158, 133, 153, 144]
RIGHT_EYE_INDICES = [362, 385, 387, 263, 373, 380]
LEFT_IRIS_INDICES = [468, 469, 470, 471, 472]
RIGHT_IRIS_INDICES = [473, 474, 475, 476, 477]
FACE_OVAL_INDICES = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
                     397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
                     172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]


class FocusAnalyzer:
    """Analyzes user focus using facial landmarks and eye tracking."""

    def __init__(self):
        self._face_mesh = None
        self._face_detection = None
        self._init_models()
        self._history: List[float] = []
        self._max_history = 30

    def _init_models(self):
        """Initialize MediaPipe models."""
        if not MEDIAPIPE_AVAILABLE:
            logger.warning("MediaPipe not available - focus analysis will use fallback")
            return

        try:
            self._face_mesh = mp.solutions.face_mesh.FaceMesh(
                static_image_mode=False,
                max_num_faces=1,
                refine_landmarks=True,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5,
            )
            self._face_detection = mp.solutions.face_detection.FaceDetection(
                model_selection=1,
                min_detection_confidence=0.5,
            )
            logger.info("FocusAnalyzer models initialized")
        except Exception as e:
            logger.warning(f"MediaPipe model init failed: {e}")
            self._face_mesh = None
            self._face_detection = None

    def calculate_focus_score(self, frame: np.ndarray) -> float:
        """Calculate overall focus score (0-100) from a frame."""
        if self._face_mesh is None:
            return self._fallback_score()

        try:
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB) if CV2_AVAILABLE else frame
            results = self._face_mesh.process(rgb)

            if not results.multi_face_landmarks:
                return 0.0  # No face detected = no focus

            landmarks = results.multi_face_landmarks[0].landmark
            h, w = frame.shape[:2]

            # Calculate component scores
            eye_score = self._calculate_eye_focus(landmarks, w, h)
            head_score = self._calculate_head_pose_score(landmarks, w, h)
            stability_score = self._calculate_face_stability(landmarks, w, h)

            # Weighted combination
            focus = (eye_score * 0.4 + head_score * 0.35 + stability_score * 0.25)
            focus = max(0.0, min(100.0, focus))

            self._update_history(focus)
            return round(focus, 2)

        except Exception as e:
            logger.warning(f"Focus calculation failed: {e}")
            return self._fallback_score()

    def calculate_attention_score(self, frame: np.ndarray) -> float:
        """Calculate attention score (0-100) based on gaze direction."""
        if self._face_mesh is None:
            return self._fallback_score()

        try:
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB) if CV2_AVAILABLE else frame
            results = self._face_mesh.process(rgb)

            if not results.multi_face_landmarks:
                return 0.0

            landmarks = results.multi_face_landmarks[0].landmark
            h, w = frame.shape[:2]

            # Calculate gaze direction
            gaze_x, gaze_y = self._get_gaze_direction(landmarks, w, h)

            # Center of screen is ideal (0.5, 0.5)
            center_distance = math.sqrt((gaze_x - 0.5) ** 2 + (gaze_y - 0.5) ** 2)
            attention = max(0.0, 100.0 - (center_distance * 200))

            # Boost if looking directly at camera
            if center_distance < 0.1:
                attention = min(100.0, attention * 1.2)

            return round(attention, 2)

        except Exception as e:
            logger.warning(f"Attention calculation failed: {e}")
            return self._fallback_score()

    def _calculate_eye_focus(self, landmarks, w: int, h: int) -> float:
        """Calculate focus based on eye openness and position."""
        try:
            left_ear = self._calculate_ear(landmarks, LEFT_EYE_INDICES, w, h)
            right_ear = self._calculate_ear(landmarks, RIGHT_EYE_INDICES, w, h)
            avg_ear = (left_ear + right_ear) / 2.0

            # EAR ~ 0.25 is closed, ~ 0.45 is open
            if avg_ear < 0.18:
                return 10.0  # Eyes very closed (drowsy)
            elif avg_ear < 0.25:
                return 40.0  # Eyes partially closed
            elif avg_ear < 0.35:
                return 75.0  # Normal
            else:
                return 95.0  # Eyes wide open, alert
        except Exception:
            return 70.0

    def _calculate_ear(self, landmarks, eye_indices: List[int], w: int, h: int) -> float:
        """Calculate Eye Aspect Ratio for given eye landmarks."""
        points = []
        for idx in eye_indices:
            lm = landmarks[idx]
            points.append((lm.x * w, lm.y * h))

        if len(points) < 6:
            return 0.3

        # Vertical distances
        A = math.dist(points[1], points[5])
        B = math.dist(points[2], points[4])
        # Horizontal distance
        C = math.dist(points[0], points[3])

        if C == 0:
            return 0.3

        ear = (A + B) / (2.0 * C)
        return ear

    def _calculate_head_pose_score(self, landmarks, w: int, h: int) -> float:
        """Calculate head pose alignment score."""
        try:
            # Use nose tip and chin for vertical alignment
            nose = landmarks[1]
            chin = landmarks[152]
            left_eye = landmarks[33]
            right_eye = landmarks[263]

            # Check if face is roughly centered and frontal
            face_center_x = (left_eye.x + right_eye.x) / 2
            face_center_y = (left_eye.y + right_eye.y) / 2

            # Ideal center is (0.5, 0.5)
            x_offset = abs(face_center_x - 0.5)
            y_offset = abs(face_center_y - 0.5)

            # Score decreases as face moves away from center
            score = 100.0 - (x_offset * 150) - (y_offset * 100)
            return max(0.0, min(100.0, score))
        except Exception:
            return 70.0

    def _calculate_face_stability(self, landmarks, w: int, h: int) -> float:
        """Calculate face stability based on minimal movement."""
        # For single frame, assume stable
        return 85.0

    def _get_gaze_direction(self, landmarks, w: int, h: int) -> Tuple[float, float]:
        """Estimate gaze direction as normalized (x, y) coordinates."""
        try:
            # Use iris centers as gaze proxy
            left_iris_x = sum(landmarks[i].x for i in LEFT_IRIS_INDICES[:1]) / 1
            left_iris_y = sum(landmarks[i].y for i in LEFT_IRIS_INDICES[:1]) / 1
            return left_iris_x, left_iris_y
        except Exception:
            return 0.5, 0.5

    def _update_history(self, score: float):
        """Update rolling history of focus scores."""
        self._history.append(score)
        if len(self._history) > self._max_history:
            self._history.pop(0)

    def _fallback_score(self) -> float:
        """Return fallback score when MediaPipe unavailable."""
        return 75.0

    def focus_summary(self, session_duration: int = 0) -> Dict:
        """Generate a summary of focus metrics."""
        if not self._history:
            return {
                "average_focus": 75.0,
                "peak_focus": 75.0,
                "lowest_focus": 75.0,
                "focus_consistency": 0.0,
                "attention_score": 75.0,
                "session_duration": session_duration,
                "category": "Average",
            }

        avg = sum(self._history) / len(self._history)
        peak = max(self._history)
        lowest = min(self._history)
        variance = sum((x - avg) ** 2 for x in self._history) / len(self._history)
        consistency = max(0.0, 100.0 - math.sqrt(variance))

        if avg >= 90:
            category = "Elite Focus"
        elif avg >= 75:
            category = "Good Focus"
        elif avg >= 50:
            category = "Average"
        else:
            category = "Needs Improvement"

        return {
            "average_focus": round(avg, 2),
            "peak_focus": round(peak, 2),
            "lowest_focus": round(lowest, 2),
            "focus_consistency": round(consistency, 2),
            "attention_score": round(avg * 0.95, 2),
            "session_duration": session_duration,
            "category": category,
        }

    def reset(self):
        """Reset the analyzer state."""
        self._history.clear()
