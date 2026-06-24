"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useEmovertStore } from "@/hooks/useStore";
import {
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Volume2,
  Headphones,
  Clock,
  Search,
} from "lucide-react";

interface Track {
  id: string;
  title: string;
  artist: string;
  category: string;
  duration: string;
  cover: string;
  isFavorite: boolean;
}

const categories = [
  { id: "all", label: "All", icon: Music },
  { id: "calm", label: "Calm", icon: Headphones },
  { id: "focus", label: "Focus", icon: Clock },
  { id: "meditation", label: "Meditation", icon: Headphones },
  { id: "sleep", label: "Sleep", icon: Headphones },
  { id: "nature", label: "Nature", icon: Headphones },
  { id: "instrumental", label: "Instrumental", icon: Music },
  { id: "lofi", label: "LoFi", icon: Music },
];

import { toast } from "react-hot-toast";
import { musicAPI } from "@/lib/api";

export default function MusicPage() {
  const { user, currentEmotion } = useEmovertStore();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [recommendedTracks, setRecommendedTracks] = useState<Track[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync isPlaying with audio element
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio();
      
      const timeUpdateListener = () => {
        if (audioRef.current && audioRef.current.duration) {
          const progressPercent = (audioRef.current.currentTime / audioRef.current.duration) * 100;
          setProgress(progressPercent || 0);
        }
      };

      const endedListener = () => {
        setIsPlaying(false);
        setProgress(0);
      };

      audioRef.current.addEventListener("timeupdate", timeUpdateListener);
      audioRef.current.addEventListener("ended", endedListener);

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.removeEventListener("timeupdate", timeUpdateListener);
          audioRef.current.removeEventListener("ended", endedListener);
          audioRef.current = null;
        }
      };
    }
  }, []);

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      if (audioRef.current.src !== currentTrack.url) {
        audioRef.current.src = currentTrack.url;
      }
      if (isPlaying) {
        audioRef.current.play().catch((err) => console.error("Audio playback failed:", err));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    // 1. Fetch tracks
    musicAPI.getTracks()
      .then((res) => {
        const list = res.data || [];
        const mapped = list.map((t: any) => ({
          id: t.id,
          title: t.title,
          artist: t.artist,
          category: t.category,
          duration: `${Math.floor(t.duration / 60)}:${String(t.duration % 60).padStart(2, "0")}`,
          cover: t.id === "track_1" ? "🌊" : t.id === "track_2" ? "🧠" : t.id === "track_3" ? "🌅" : "🎹",
          url: t.url,
          isFavorite: false
        }));
        setTracks(mapped);
      })
      .catch((err) => console.error("Failed to load tracks:", err));

    // 2. Fetch favorites
    musicAPI.getFavorites()
      .then((res) => {
        const favList = res.data || [];
        const favIds = new Set<string>(favList.map((f: any) => f.id));
        setFavorites(favIds);
      })
      .catch((err) => console.error("Failed to load favorite tracks:", err));

    // 3. Fetch recommendations
    const domEmotion = user?.dominantEmotion || currentEmotion?.emotion || "neutral";
    musicAPI.getRecommendations(domEmotion)
      .then((res) => {
        const recList = res.data || [];
        const mapped = recList.map((t: any) => ({
          id: t.id,
          title: t.title,
          artist: t.artist,
          category: t.category,
          duration: `${Math.floor(t.duration / 60)}:${String(t.duration % 60).padStart(2, "0")}`,
          cover: "🧘",
          url: t.url,
          isFavorite: false
        }));
        setRecommendedTracks(mapped);
      })
      .catch((err) => console.error("Failed to fetch recommendations:", err));
  }, [user, currentEmotion]);

  const filteredTracks = tracks.filter((track) => {
    const matchesCategory = activeCategory === "all" || track.category === activeCategory;
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleToggleFavorite = async (trackId: string) => {
    try {
      const res = await musicAPI.toggleFavorite(trackId);
      const isFav = res.data.is_favorite;
      setFavorites((prev) => {
        const next = new Set(prev);
        if (isFav) {
          next.add(trackId);
        } else {
          next.delete(trackId);
        }
        return next;
      });
      toast.success(isFav ? "Added to favorites" : "Removed from favorites");
    } catch (err) {
      console.error(err);
      toast.error("Failed to toggle favorite");
    }
  };

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setProgress(0);
    setRecentlyPlayed((prev) => [track, ...prev.filter((t) => t.id !== track.id)].slice(0, 5));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 pb-32">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Music for <span className="gradient-text">Peace</span>
          </h1>
          <p className="text-white/50 mt-1">
            Curated sounds for every emotional state
          </p>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search tracks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-emovert-cyan/50 transition-colors"
          />
        </div>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
      >
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(cat.id)}
            className="whitespace-nowrap gap-1.5"
          >
            <cat.icon className="w-3.5 h-3.5" />
            {cat.label}
          </Button>
        ))}
      </motion.div>

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h2 className="text-lg font-semibold text-white mb-3">Recently Played</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {recentlyPlayed.map((track) => (
              <motion.div
                key={track.id}
                whileHover={{ scale: 1.05 }}
                className="shrink-0 w-40 cursor-pointer"
                onClick={() => playTrack(track)}
              >
                <div className="aspect-square rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl mb-2 hover:border-emovert-cyan/30 transition-colors">
                  {track.cover}
                </div>
                <p className="text-sm font-medium text-white truncate">{track.title}</p>
                <p className="text-xs text-white/40 truncate">{track.artist}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tracks Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-white mb-3">
          {activeCategory === "all" ? "All Tracks" : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Tracks`}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredTracks.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`cursor-pointer group transition-all ${
                    currentTrack?.id === track.id ? "border-emovert-cyan/50 bg-emovert-cyan/5" : ""
                  }`}
                  onClick={() => playTrack(track)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                        {track.cover}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{track.title}</p>
                        <p className="text-xs text-white/40 truncate">{track.artist}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-[10px]">
                            {track.category}
                          </Badge>
                          <span className="text-xs text-white/30">{track.duration}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(track.id);
                        }}
                        className="shrink-0 p-1.5 rounded-full hover:bg-white/10 transition-colors"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            favorites.has(track.id)
                              ? "text-red-400 fill-red-400"
                              : "text-white/30"
                          }`}
                        />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Player Bar */}
      <AnimatePresence>
        {currentTrack && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 lg:left-[260px] glass border-t border-white/10 p-4 z-50"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-xl shrink-0">
                {currentTrack.cover}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{currentTrack.title}</p>
                <p className="text-xs text-white/40">{currentTrack.artist}</p>
                <Progress value={progress} className="h-1 mt-2" indicatorColor="bg-emovert-cyan" />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button
                  variant="default"
                  size="icon"
                  className="w-10 h-10 glow-cyan"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-white/40" />
                <div className="w-20 h-1 bg-white/10 rounded-full">
                  <div className="w-3/4 h-full bg-white/40 rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
