"""EMOVERT Recommendation Engine Service

Provides emotion-based personalized recommendations for:
- Food & Nutrition
- Yoga & Stretching
- Exercise & Fitness
- Wellness Activities
"""

import logging
import random
from typing import Dict, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

# Emotion-based recommendation database
RECOMMENDATION_DB = {
    "happy": {
        "foods": [
            {"name": "Dark Chocolate", "benefit": "Boosts endorphins and maintains positive mood", "time": "Afternoon snack", "emoji": "🍫"},
            {"name": "Berries", "benefit": "Antioxidants support brain health", "time": "Breakfast", "emoji": "🫐"},
            {"name": "Green Tea", "benefit": "L-theanine promotes calm alertness", "time": "Morning", "emoji": "🍵"},
            {"name": "Salmon", "benefit": "Omega-3 supports sustained happiness", "time": "Lunch/Dinner", "emoji": "🐟"},
        ],
        "yoga": [
            {"name": "Sun Salutation", "duration": "10-15 min", "steps": ["Stand tall", "Reach arms up", "Fold forward", "Step back to plank", "Upward dog", "Downward dog"], "emoji": "☀️"},
            {"name": "Warrior Sequence", "duration": "10 min", "steps": ["Warrior I", "Warrior II", "Warrior III", "Return to center"], "emoji": "⚔️"},
        ],
        "exercises": [
            {"name": "Brisk Walking", "reps": "30 min", "duration": "30 min", "emoji": "🚶"},
            {"name": "Dancing", "reps": "3 songs", "duration": "15 min", "emoji": "💃"},
            {"name": "Cycling", "reps": "5 miles", "duration": "25 min", "emoji": "🚴"},
        ],
        "activities": [
            "Practice gratitude journaling",
            "Share your happiness with a friend",
            "Tackle a challenging task while motivated",
            "Listen to upbeat music",
            "Plan something exciting for tomorrow",
        ],
        "tips": [
            "Channel your positive energy into productive tasks",
            "Practice mindfulness to sustain this mood",
            "Express gratitude to someone you care about",
            "Set a new goal while feeling motivated",
        ],
    },
    "sad": {
        "foods": [
            {"name": "Bananas", "benefit": "Vitamin B6 boosts serotonin production", "time": "Breakfast", "emoji": "🍌"},
            {"name": "Oatmeal", "benefit": "Complex carbs stabilize mood", "time": "Breakfast", "emoji": "🥣"},
            {"name": "Turkey", "benefit": "Tryptophan helps produce melatonin", "time": "Lunch", "emoji": "🦃"},
            {"name": "Dark Chocolate", "benefit": "Phenylethylamine lifts mood", "time": "Anytime", "emoji": "🍫"},
        ],
        "yoga": [
            {"name": "Child's Pose", "duration": "5 min", "steps": ["Kneel on floor", "Sit back on heels", "Stretch arms forward", "Rest forehead", "Breathe deeply"], "emoji": "🧘"},
            {"name": "Heart Opener", "duration": "10 min", "steps": ["Lie on back", "Place pillow under upper back", "Open arms wide", "Breathe into chest"], "emoji": "❤️"},
        ],
        "exercises": [
            {"name": "Gentle Swimming", "reps": "10 laps", "duration": "20 min", "emoji": "🏊"},
            {"name": "Nature Walk", "reps": "20 min", "duration": "20 min", "emoji": "🌳"},
            {"name": "Stretching", "reps": "Full body", "duration": "15 min", "emoji": "🤸"},
        ],
        "activities": [
            "Call a trusted friend or family member",
            "Write down your feelings in a journal",
            "Listen to comforting music",
            "Take a warm bath with essential oils",
            "Watch a favorite comforting movie",
        ],
        "tips": [
            "It's okay to feel sad - allow yourself to process",
            "Reach out to someone you trust",
            "Focus on small, achievable tasks",
            "Practice self-compassion and kindness",
        ],
    },
    "angry": {
        "foods": [
            {"name": "Celery", "benefit": "Cooling effect calms the nervous system", "time": "Snack", "emoji": "🥬"},
            {"name": "Walnuts", "benefit": "Omega-3 supports emotional regulation", "time": "Morning", "emoji": "🌰"},
            {"name": "Chamomile Tea", "benefit": "Natural calming and soothing effect", "time": "Evening", "emoji": "🍵"},
            {"name": "Avocado", "benefit": "B vitamins support stress response", "time": "Lunch", "emoji": "🥑"},
        ],
        "yoga": [
            {"name": "Legs Up Wall", "duration": "10 min", "steps": ["Sit near wall", "Swing legs up", "Relax arms", "Close eyes", "Breathe slowly"], "emoji": "🧘‍♀️"},
            {"name": "Cooling Breath", "duration": "5 min", "steps": ["Roll tongue", "Inhale through tongue", "Close mouth", "Exhale through nose"], "emoji": "❄️"},
        ],
        "exercises": [
            {"name": "Boxing", "reps": "3 rounds", "duration": "20 min", "emoji": "🥊"},
            {"name": "Running", "reps": "3 miles", "duration": "25 min", "emoji": "🏃"},
            {"name": "Kickboxing", "reps": "Full routine", "duration": "30 min", "emoji": "🥋"},
        ],
        "activities": [
            "Count to 10 before reacting",
            "Write an angry letter (don't send it)",
            "Take a cold shower",
            "Practice progressive muscle relaxation",
            "Punch a pillow or stress ball",
        ],
        "tips": [
            "Step away from the triggering situation",
            "Use the 4-7-8 breathing technique",
            "Physical activity helps release tension",
            "Practice mindfulness to observe anger without acting",
        ],
    },
    "stress": {
        "foods": [
            {"name": "Dark Chocolate", "benefit": "Reduces cortisol levels", "time": "Afternoon", "emoji": "🍫"},
            {"name": "Green Tea", "benefit": "L-theanine promotes alpha waves", "time": "Anytime", "emoji": "🍵"},
            {"name": "Almonds", "benefit": "Magnesium supports relaxation", "time": "Snack", "emoji": "🥜"},
            {"name": "Salmon", "benefit": "Omega-3 reduces inflammation", "time": "Dinner", "emoji": "🐟"},
        ],
        "yoga": [
            {"name": "Corpse Pose", "duration": "15 min", "steps": ["Lie flat", "Arms by sides", "Close eyes", "Focus on breath", "Release tension"], "emoji": "😌"},
            {"name": "Alternate Nostril", "duration": "10 min", "steps": ["Sit comfortably", "Close right nostril", "Inhale left", "Switch", "Exhale right"], "emoji": "🫁"},
        ],
        "exercises": [
            {"name": "Tai Chi", "reps": "Full form", "duration": "20 min", "emoji": "☯️"},
            {"name": "Yoga Flow", "reps": "Gentle sequence", "duration": "30 min", "emoji": "🧘"},
            {"name": "Walking Meditation", "reps": "20 min", "duration": "20 min", "emoji": "🚶"},
        ],
        "activities": [
            "Practice 4-7-8 breathing",
            "Take a warm bath with Epsom salts",
            "Listen to binaural beats",
            "Try aromatherapy with lavender",
            "Do a body scan meditation",
        ],
        "tips": [
            "Identify and name your stress triggers",
            "Break large tasks into smaller steps",
            "Set boundaries and say no when needed",
            "Prioritize sleep - aim for 7-8 hours",
        ],
    },
    "anxiety": {
        "foods": [
            {"name": "Oatmeal", "benefit": "Complex carbs boost serotonin", "time": "Breakfast", "emoji": "🥣"},
            {"name": "Yogurt", "benefit": "Probiotics support gut-brain axis", "time": "Anytime", "emoji": "🥛"},
            {"name": "Turkey", "benefit": "Tryptophan promotes calm", "time": "Lunch", "emoji": "🦃"},
            {"name": "Blueberries", "benefit": "Antioxidants reduce oxidative stress", "time": "Snack", "emoji": "🫐"},
        ],
        "yoga": [
            {"name": "Cat-Cow", "duration": "5 min", "steps": ["Hands and knees", "Arch back up (cat)", "Dip down (cow)", "Sync with breath"], "emoji": "🐱"},
            {"name": "Child's Pose", "duration": "10 min", "steps": ["Kneel and sit on heels", "Extend torso forward", "Rest forehead on mat", "Breathe slowly"], "emoji": "🧘"},
        ],
        "exercises": [
            {"name": "Slow Jogging", "reps": "20 min", "duration": "20 min", "emoji": "🏃"},
            {"name": "Pilates", "reps": "15 reps/move", "duration": "20 min", "emoji": "🤸"},
        ],
        "activities": [
            "Try 5-4-3-2-1 grounding technique",
            "Inhale lavender essential oil",
            "Write worries in a list and set them aside",
            "Listen to nature sounds",
        ],
        "tips": [
            "Ground yourself in the present moment",
            "Limit caffeine and sugar intake",
            "Remember that anxiety is temporary and will pass",
            "Focus on exhaling longer than you inhale",
        ],
    },
    "neutral": {
        "foods": [
            {"name": "Mixed Nuts", "benefit": "Healthy fats and minerals for stable energy", "time": "Snack", "emoji": "🥜"},
            {"name": "Apple with Peanut Butter", "benefit": "Fiber and protein combo maintains focus", "time": "Afternoon", "emoji": "🍎"},
            {"name": "Water", "benefit": "Hydration keeps mind clear", "time": "All day", "emoji": "💧"},
        ],
        "yoga": [
            {"name": "Mountain Pose", "duration": "3 min", "steps": ["Stand tall", "Arms at sides", "Ground feet", "Breathe evenly"], "emoji": "⛰️"},
            {"name": "Tree Pose", "duration": "5 min", "steps": ["Balance on one leg", "Place other foot on inner thigh", "Bring hands to chest", "Focus gaze"], "emoji": "🌳"},
        ],
        "exercises": [
            {"name": "Full Body Stretch", "reps": "10 stretches", "duration": "10 min", "emoji": "🤸"},
            {"name": "Plank Hold", "reps": "3 sets of 45s", "duration": "5 min", "emoji": "🧘"},
        ],
        "activities": [
            "Review your weekly goals",
            "Organize your workspace",
            "Take a short walk around the room",
            "Read a book chapter",
        ],
        "tips": [
            "Use this balanced emotional state to plan ahead",
            "Ensure you are maintaining proper posture at your desk",
            "Hydrate regularly throughout the day",
        ],
    },
    "default": {
        "foods": [
            {"name": "Fresh Fruit", "benefit": "Natural vitamins and quick hydration", "time": "Snack", "emoji": "🍎"},
            {"name": "Herbal Tea", "benefit": "Calms the mind and hydrates", "time": "Evening", "emoji": "🍵"},
        ],
        "yoga": [
            {"name": "Easy Seated Pose", "duration": "5 min", "steps": ["Sit cross-legged", "Keep spine tall", "Hands on knees", "Close eyes and breathe"], "emoji": "🧘"},
        ],
        "exercises": [
            {"name": "Light Stretching", "reps": "5 min", "duration": "5 min", "emoji": "🤸"},
        ],
        "activities": [
            "Take three deep breaths",
            "Stretch your neck and shoulders",
            "Drink a glass of water",
        ],
        "tips": [
            "Check in with your breathing - is it shallow or deep?",
            "Take a 5-minute screen break if working",
            "Stay hydrated and active",
        ],
    }
}


class RecommendationEngine:
    """Provides wellness recommendations tailored to the user's emotional state."""

    def __init__(self):
        pass

    def get_recommendations(self, emotion: str) -> Dict:
        """Get recommended items for a given emotion."""
        normalized_emotion = emotion.lower().strip()
        
        # Match specific or category default
        rec_data = RECOMMENDATION_DB.get(normalized_emotion)
        if not rec_data:
            # Try to map similar emotions
            if normalized_emotion in ["surprise", "confusion"]:
                rec_data = RECOMMENDATION_DB.get("neutral")
            elif normalized_emotion in ["fear", "disgust"]:
                rec_data = RECOMMENDATION_DB.get("anxiety")
            elif normalized_emotion in ["boredom"]:
                rec_data = RECOMMENDATION_DB.get("sad")
            else:
                rec_data = RECOMMENDATION_DB.get("default")

        # Compile lists
        return {
            "emotion": emotion,
            "timestamp": datetime.utcnow().isoformat(),
            "foods": rec_data.get("foods", []),
            "yoga": rec_data.get("yoga", []),
            "exercises": rec_data.get("exercises", []),
            "activities": rec_data.get("activities", []),
            "tips": rec_data.get("tips", []),
        }

    def get_quick_tip(self, emotion: str) -> str:
        """Get a single quick tip for an emotional state."""
        recs = self.get_recommendations(emotion)
        tips = recs.get("tips", [])
        if tips:
            return random.choice(tips)
        return "Take a deep breath and stay present."
