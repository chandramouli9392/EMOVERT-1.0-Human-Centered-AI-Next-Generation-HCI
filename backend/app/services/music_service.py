"""EMOVERT Music Service

Manages audio tracks for wellness and focus.
Provides emotion-based music recommendations and favorites.
"""

import logging
from typing import Dict, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

# Catalog of wellness tracks
TRACKS_CATALOG = [
    # Focus / study tracks
    {
        "id": "track_1",
        "title": "Deep Focus Synthwave",
        "artist": "EMOVERT Beats",
        "category": "focus",
        "duration": "180",
        "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        "cover": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150",
    },
    {
        "id": "track_2",
        "title": "Alpha Waves study",
        "artist": "Cognitive Chill",
        "category": "focus",
        "duration": "240",
        "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        "cover": "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=150",
    },
    {
        "id": "track_3",
        "title": "Rain on Windowpane LoFi",
        "artist": "Acoustic Dreams",
        "category": "focus",
        "duration": "210",
        "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        "cover": "https://images.unsplash.com/photo-1486572788966-cfd3df1f5b42?w=150",
    },
    # Relaxation / anxiety release tracks
    {
        "id": "track_4",
        "title": "Tibetan Singing Bowls",
        "artist": "Zen Master",
        "category": "relax",
        "duration": "300",
        "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        "cover": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=150",
    },
    {
        "id": "track_5",
        "title": "Ethereal Ambient Forest",
        "artist": "Nature Whispers",
        "category": "relax",
        "duration": "270",
        "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        "cover": "https://images.unsplash.com/photo-1448375240586-882707db888b?w=150",
    },
    {
        "id": "track_6",
        "title": "Cosmic Drift Space Ambient",
        "artist": "Stellar Echoes",
        "category": "relax",
        "duration": "320",
        "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
        "cover": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=150",
    },
    # Energizing / uplift tracks (for sadness, boredom)
    {
        "id": "track_7",
        "title": "Uplifting Sunrise Acoustic",
        "artist": "Sunny Meadows",
        "category": "energy",
        "duration": "165",
        "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
        "cover": "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=150",
    },
    {
        "id": "track_8",
        "title": "High Pulse Workout Beat",
        "artist": "Cardio Crew",
        "category": "energy",
        "duration": "195",
        "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
        "cover": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=150",
    },
    {
        "id": "track_9",
        "title": "Optimism Pop Dance",
        "artist": "Vibe Tribe",
        "category": "energy",
        "duration": "205",
        "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
        "cover": "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=150",
    }
]


class MusicService:
    """Provides tracks, toggles favorites, and offers recommendations based on emotions."""

    def __init__(self):
        # In-memory favorites list keyed by user_id
        self._user_favorites: Dict[int, List[str]] = {}

    def get_tracks(self, category: Optional[str] = None) -> List[Dict]:
        """Fetch catalog tracks, optionally filtered by category."""
        if not category:
            return TRACKS_CATALOG
        
        normalized_cat = category.lower().strip()
        return [t for t in TRACKS_CATALOG if t["category"] == normalized_cat]

    def get_favorites(self, user_id: int) -> List[Dict]:
        """Fetch all favorite tracks for a user."""
        fav_ids = self._user_favorites.get(user_id, [])
        return [t for t in TRACKS_CATALOG if t["id"] in fav_ids]

    def toggle_favorite(self, user_id: int, track_id: str) -> Dict:
        """Add or remove track from user favorites."""
        if user_id not in self._user_favorites:
            self._user_favorites[user_id] = []

        favs = self._user_favorites[user_id]
        
        # Verify track exists in catalog
        track_exists = any(t["id"] == track_id for t in TRACKS_CATALOG)
        if not track_exists:
            return {"status": "error", "message": "Track not found"}

        if track_id in favs:
            favs.remove(track_id)
            is_favorite = False
        else:
            favs.append(track_id)
            is_favorite = True

        return {
            "status": "success",
            "track_id": track_id,
            "is_favorite": is_favorite,
            "favorites_count": len(favs)
        }

    def get_recommendations(self, emotion: str) -> List[Dict]:
        """Provide tracks recommendation matching user emotion.
        
        - stressed/anxious/angry -> relax category
        - sad/boredom -> energy category
        - happy/neutral/other -> focus category
        """
        normalized_emotion = emotion.lower().strip()

        if normalized_emotion in ["stress", "anxiety", "angry", "fear"]:
            category = "relax"
        elif normalized_emotion in ["sad", "boredom", "disgust"]:
            category = "energy"
        else:
            category = "focus"

        return self.get_tracks(category)
