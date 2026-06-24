"""EMOVERT Distraction Detection Service

Uses head pose estimation and eye gaze tracking to detect
when the user is looking away from the screen.
"""

import logging
import math
from typing import Dict, List, Optional, Tuple
import numpy as np
from datetime import datetime

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

# Landmark reference points for head pose
FACE_REF_POINTS = [1, 33, 263, 61, 291, 199]  # Nose, eyes, mouth corners, chin
NOSE_TIP = 1
LEFT_EYE_OUTER = 33
RIGHT_EYE_OUTER = 263
LEFT_MOUTH = 61
RIGHT_MOUTH = 291
CHIN = 152
FOREHEAD = 10

# Thresholds
GAZE_CENTER_THRESHOLD = 0.15  # Normalized distance from center
HEAD_TURN_THRESHOLD = 0.25    # Normalized horizontal offset
HEAD_TILT_THRESHOLD = 0.20    # Normalized vertical offset
DISTRACTION_FRAME_THRESHOLD = 20  # Frames before counting as distraction


class DistractionDetector:
    """Detects user distraction via head pose and gaze tracking."""

    def __init__(self):
        self._face_mesh = None
        self._init_model()
        self._distraction_frames = 0
        self._focused_frames = 0
        self._event_log: List[Dict] = []
        self._distraction_count = 0
        self._distraction_score = 0.0
        self._last_gaze = (0.5, 0.5)
        self._last_head_pos = (0.5, 0.5)

    def _init_model(self):
        """Initialize MediaPipe FaceMesh."""
        if not MEDIAPIPE_AVAILABLE:
            logger.warning("MediaPipe not available - distraction detection disabled")
            return

        try:
            self._face_mesh = mp.solutions.face_mesh.FaceMesh(
                static_image_mode=False,
                max_num_faces=1,
                refine_landmarks=True,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5,
            )
            logger.info("DistractionDetector initialized")
        except Exception as e:
            logger.warning(f"FaceMesh init failed: {e}")
            self._face_mesh = None

    def detect_distraction(self, frame: np.ndarray) -> Dict:
        """Detect if user is distracted from a video frame.
        
        Returns:
            Dict with keys: is_distracted, gaze_direction, head_pose,
                          severity, score, distraction_type
        """
        if self._face_mesh is None:
            return self._fallback_result()

        try:
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB) if CV2_AVAILABLE else frame
            results = self._face_mesh.process(rgb)

            if not results.multi_face_landmarks:
                return {
                    "is_distracted": True,
                    "gaze_direction": {"x": 0.0, "y": 0.0},
                    "head_pose": {"yaw": 0.0, "pitch": 0.0, "roll": 0.0},
                    "severity": "high",
                    "score": 100.0,
                    "distraction_type": "away",
                    "face_detected": False,
                }

            landmarks = results.multi_face_landmarks[0].landmark
            h, w = frame.shape[:2]

            # Get gaze direction
            gaze = self.get_gaze_direction(landmarks, w, h)
            self._last_gaze = gaze

            # Get head pose
            head_pose = self._estimate_head_pose(landmarks, w, h)
            self._last_head_pos = (head_pose["yaw"], head_pose["pitch"])

            # Determine distraction
            gaze_dist_from_center = math.sqrt((gaze[0] - 0.5) ** 2 + (gaze[1] - 0.5) ** 2)
            is_gaze_distracted = gaze_dist_from_center > GAZE_CENTER_THRESHOLD
            is_head_turned = abs(head_pose["yaw"]) > HEAD_TURN_THRESHOLD
            is_head_tilted = abs(head_pose["pitch"]) > HEAD_TILT_THRESHOLD

            is_distracted = is_gaze_distracted or is_head_turned or is_head_tilted

            if is_distracted:
                self._distraction_frames += 1
                self._focused_frames = max(0, self._focused_frames - 1)
            else:
                self._focused_frames += 1
                self._distraction_frames = max(0, self._distraction_frames - 2)

            # Calculate severity
            if self._distraction_frames >= DISTRACTION_FRAME_THRESHOLD:
                if is_head_turned:
                    severity = "high"
                    distraction_type = "head_pose"
                elif gaze_dist_from_center > 0.3:
                    severity = "high"
                    distraction_type = "gaze"
                else:
                    severity = "medium"
                    distraction_type = "gaze" if is_gaze_distracted else "head_pose"
                score = min(100.0, 50.0 + self._distraction_frames * 1.5)
            elif self._distraction_frames >= DISTRACTION_FRAME_THRESHOLD // 2:
                severity = "low"
                distraction_type = "gaze" if is_gaze_distracted else "head_pose"
                score = min(50.0, self._distraction_frames * 2.0)
            else:
                severity = "none"
                distraction_type = "none"
                score = max(0.0, self._distraction_score - 3.0)

            self._distraction_score = score

            # Log event
            if severity in ("medium", "high") and self._distraction_frames == DISTRACTION_FRAME_THRESHOLD:
                self._distraction_count += 1
                self._log_event(severity, distraction_type, gaze, head_pose)

            return {
                "is_distracted": is_distracted and self._distraction_frames >= DISTRACTION_FRAME_THRESHOLD // 2,
                "gaze_direction": {"x": round(gaze[0], 4), "y": round(gaze[1], 4)},
                "head_pose": {
                    "yaw": round(head_pose["yaw"], 4),
                    "pitch": round(head_pose["pitch"], 4),
                    "roll": round(head_pose["roll"], 4),
                },
                "severity": severity,
                "score": round(score, 2),
                "distraction_type": distraction_type,
                "face_detected": True,
                "consecutive_distracted_frames": self._distraction_frames,
            }

        except Exception as e:
            logger.warning(f"Distraction detection failed: {e}")
            return self._fallback_result()

    def get_gaze_direction(self, landmarks, w: int, h: int) -> Tuple[float, float]:
        """Estimate gaze direction as normalized (x, y) coordinates.
        
        Uses iris centers relative to eye corners to estimate
        where the user is looking on screen.
        
        Returns:
            Tuple[float, float]: Normalized gaze position (0-1, 0-1)
        """
        try:
            # Use nose tip as face center reference
            nose = landmarks[NOSE_TIP]

            # Get eye centers
            left_eye_x = (landmarks[33].x + landmarks[133].x) / 2
            left_eye_y = (landmarks[33].y + landmarks[133].y) / 2
            right_eye_x = (landmarks[362].x + landmarks[263].x) / 2
            right_eye_y = (landmarks[362].y + landmarks[263].y) / 2

            # Average eye center
            eye_center_x = (left_eye_x + right_eye_x) / 2
            eye_center_y = (left_eye_y + right_eye_y) / 2

            # Use iris landmarks if available (refined landmarks)
            try:
                left_iris_x = landmarks[468].x
                left_iris_y = landmarks[468].y
                right_iris_x = landmarks[473].x
                right_iris_y = landmarks[473].y

                # Gaze is offset from eye center by iris position
                gaze_x = (left_iris_x + right_iris_x) / 2
                gaze_y = (left_iris_y + right_iris_y) / 2
            except (IndexError, AttributeError):
                # Fallback to eye center
                gaze_x = eye_center_x
                gaze_y = eye_center_y

            return gaze_x, gaze_y

        except Exception as e:
            logger.debug(f"Gaze estimation failed: {e}")
            return 0.5, 0.5

    def _estimate_head_pose(self, landmarks, w: int, h: int) -> Dict[str, float]:
        """Estimate head pose (yaw, pitch, roll) from facial landmarks.
        
        Returns:
            Dict with yaw, pitch, roll in normalized units (-1 to 1)
        """
        try:
            # Get key facial points
            nose = landmarks[NOSE_TIP]
            left_eye = landmarks[LEFT_EYE_OUTER]
            right_eye = landmarks[RIGHT_EYE_OUTER]
            chin = landmarks[CHIN]
            forehead = landmarks[FOREHEAD]

            # Yaw (left-right turn) based on nose position relative to eye line
            eye_center_x = (left_eye.x + right_eye.x) / 2
            yaw = (nose.x - eye_center_x) * 3.0  # Scale up

            # Pitch (up-down tilt) based on nose-chin distance
            face_height = abs(forehead.y - chin.y)
            nose_ratio = (nose.y - forehead.y) / face_height if face_height > 0 else 0.5
            pitch = (nose_ratio - 0.5) * 3.0

            # Roll (tilt) based on eye line angle
            eye_dy = right_eye.y - left_eye.y
            eye_dx = right_eye.x - left_eye.x
            roll = math.atan2(eye_dy, eye_dx) if eye_dx != 0 else 0.0

            return {
                "yaw": max(-1.0, min(1.0, yaw)),
                "pitch": max(-1.0, min(1.0, pitch)),
                "roll": max(-1.0, min(1.0, roll)),
            }

        except Exception as e:
            logger.debug(f"Head pose estimation failed: {e}")
            return {"yaw": 0.0, "pitch": 0.0, "roll": 0.0}

    def get_distraction_score(self) -> float:
        """Get current distraction score (0-100, higher = more distracted)."""
        return round(self._distraction_score, 2)

    def get_distraction_count(self) -> int:
        """Get total number of distraction events."""
        return self._distraction_count

    def _log_event(self, severity: str, distraction_type: str, gaze: Tuple[float, float], head_pose: Dict):
        """Log a distraction event."""
        self._event_log.append({
            "timestamp": datetime.utcnow().isoformat(),
            "severity": severity,
            "type": distraction_type,
            "gaze": {"x": round(gaze[0], 4), "y": round(gaze[1], 4)},
            "head_pose": {
                "yaw": round(head_pose["yaw"], 4),
                "pitch": round(head_pose["pitch"], 4),
            },
        })
        logger.info(f"Distraction event: {severity} {distraction_type}")

    def get_event_log(self) -> List[Dict]:
        """Get all logged distraction events."""
        return self._event_log.copy()

    def reset(self):
        """Reset detector state."""
        self._distraction_frames = 0
        self._focused_frames = 0
        self._event_log.clear()
        self._distraction_count = 0
        self._distraction_score = 0.0
        self._last_gaze = (0.5, 0.5)
        self._last_head_pos = (0.5, 0.5)

    def _fallback_result(self) -> Dict:
        """Fallback result when detection unavailable."""
        return {
            "is_distracted": False,
            "gaze_direction": {"x": 0.5, "y": 0.5},
            "head_pose": {"yaw": 0.0, "pitch": 0.0, "roll": 0.0},
            "severity": "none",
            "score": 0.0,
            "distraction_type": "none",
            "face_detected": False,
            "consecutive_distracted_frames": 0,
        }
