"""EMOVERT Emotional Support Chat Service

Maintains user chat histories and generates context-aware, empathetic
replies based on the user's inputs and detected emotional states.
"""

import logging
from typing import Dict, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

# Emotion-specific coaching/empathy responses
EMOTION_RESPONSES = {
    "happy": [
        "That's wonderful to hear! I'm glad you're feeling positive. How can we channel this great energy today?",
        "I love this positive energy! It is a great time to tackle challenging tasks or learn something new.",
        "Savoring happy moments is key to wellness. What's contributing to your good mood today?"
    ],
    "sad": [
        "I hear you, and it's completely okay to feel down. I'm here to support you. What is on your mind?",
        "I'm sorry you're going through a tough time. Remember to be gentle with yourself. Would you like to try a calming exercise?",
        "It's normal to feel sad sometimes. Processing these feelings takes time. Let's take it one step at a time."
    ],
    "angry": [
        "I understand you're feeling frustrated or angry. It's completely valid. Let's take a deep breath together.",
        "Anger is a powerful signal. Let's try to cool down first so we can address what triggered this. Would you like to try a breathing exercise?",
        "I'm listening. Take your time to express what's bothering you. Let's release some of that pressure."
    ],
    "stress": [
        "Sounds like you're carrying a heavy load right now. Let's try to break things down. What is the single most pressing thing?",
        "Stress can feel overwhelming. Let's pause, roll your shoulders back, and take a deep breath. You don't have to do it all at once.",
        "Your well-being comes first. Let's take a 2-minute break from screens. I can guide you through a quick relaxation technique."
    ],
    "anxiety": [
        "Anxiety can make your mind race. Let's ground ourselves: feel your feet on the floor. I'm here with you.",
        "You are safe, and this feeling is temporary. Focus on slow, deep exhales. Let's get through this together.",
        "Let's focus on what you can control right now. We can take small, easy steps."
    ],
    "neutral": [
        "I'm here to help. How are your focus sessions going? We can review your stats or talk about what's next.",
        "It's good to have a balanced, calm day. What would you like to focus on or chat about?",
        "A peaceful, neutral state is perfect for getting things done or taking a mindful pause."
    ]
}

DEFAULT_RESPONSES = [
    "I appreciate you sharing that. Tell me more about what you're feeling right now.",
    "I'm here for you. How can I best support your focus and well-being today?",
    "Thank you for sharing. Let's take a step back and breathe. What would help you feel most balanced?"
]


class ChatService:
    """Provides emotional support chatbot services, keeping histories in-memory."""

    def __init__(self):
        # In-memory history keyed by user_id
        # In production, this would reside in a database or Redis cache
        self._history: Dict[int, List[Dict]] = {}

    def get_history(self, user_id: int) -> List[Dict]:
        """Fetch chat history for a specific user."""
        if user_id not in self._history:
            # Initialize with a warm greeting
            self._history[user_id] = [
                {
                    "sender": "coach",
                    "message": "Hello! I am your EMOVERT emotional support coach. How are you feeling today?",
                    "timestamp": datetime.utcnow().isoformat()
                }
            ]
        return self._history[user_id]

    def send_message(self, user_id: int, message: str, emotion: Optional[str] = None) -> Dict:
        """Process user message, append to history, and return AI response."""
        history = self.get_history(user_id)

        # Append user message
        user_msg = {
            "sender": "user",
            "message": message,
            "timestamp": datetime.utcnow().isoformat()
        }
        history.append(user_msg)

        # Generate response based on emotion and message contents
        reply_text = self._generate_reply(message, emotion)

        coach_msg = {
            "sender": "coach",
            "message": reply_text,
            "timestamp": datetime.utcnow().isoformat()
        }
        history.append(coach_msg)

        # Keep history length under control
        if len(history) > 100:
            history.pop(1)  # keep greeting at index 0

        return coach_msg

    def _generate_reply(self, message: str, emotion: Optional[str]) -> str:
        """Generate AI response based on message sentiment and context."""
        msg_lower = message.lower()

        # Keyword matching
        if "hello" in msg_lower or "hi" in msg_lower or "hey" in msg_lower:
            return "Hello! I'm glad you reached out. How are you doing, and what's on your mind today?"
        
        if "help" in msg_lower or "what can you do" in msg_lower:
            return "I can help you process your emotions, recommend quick yoga or breathing breaks, check your focus statistics, or just listen. What do you need right now?"

        if "breathe" in msg_lower or "meditate" in msg_lower or "relax" in msg_lower:
            return "Let's do a simple 4-7-8 breathing exercise. Inhale for 4 seconds, hold for 7, and exhale slowly for 8. Repeat this 3 times."

        if "focus" in msg_lower or "work" in msg_lower or "study" in msg_lower:
            return "For optimal focus, I recommend the Pomodoro technique: 25 minutes of work followed by a 5-minute break. Make sure to close distracting tabs!"

        # Emotion-specific matching
        if emotion:
            norm_emotion = emotion.lower().strip()
            # Map similar emotions
            if norm_emotion in ["surprise", "confusion"]:
                norm_emotion = "neutral"
            elif norm_emotion in ["fear", "disgust"]:
                norm_emotion = "anxiety"
            elif norm_emotion in ["boredom"]:
                norm_emotion = "sad"

            responses = EMOTION_RESPONSES.get(norm_emotion)
            if responses:
                # Select a random response from the matching list
                import random
                return random.choice(responses)

        # General default fallback
        import random
        return random.choice(DEFAULT_RESPONSES)

    def reset_chat(self, user_id: int):
        """Clear chat history for a user."""
        if user_id in self._history:
            del self._history[user_id]
