"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Frown,
  Angry,
  AlertTriangle,
  CloudRain,
  Moon,
  FrownIcon,
  UserX,
  BatteryWarning,
  Heart,
  Utensils,
  Dumbbell,
  Wind,
  Sun,
  Clock,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface WellnessOption {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  foods: { name: string; benefit: string; time: string; emoji: string }[];
  yoga: { name: string; duration: string; steps: string[]; emoji: string }[];
  exercises: { name: string; reps: string; duration: string; emoji: string }[];
  tips: string[];
}

const wellnessOptions: WellnessOption[] = [
  {
    id: "stress",
    title: "Stress",
    icon: AlertTriangle,
    color: "#ef4444",
    foods: [
      { name: "Dark Chocolate", benefit: "Reduces cortisol levels", time: "Afternoon snack", emoji: "🍫" },
      { name: "Green Tea", benefit: "Contains L-theanine for calm", time: "Morning or evening", emoji: "🍵" },
      { name: "Avocado", benefit: "Rich in B vitamins", time: "Lunch", emoji: "🥑" },
    ],
    yoga: [
      { name: "Child's Pose", duration: "3-5 minutes", steps: ["Kneel on floor", "Sit back on heels", "Stretch arms forward", "Breathe deeply"], emoji: "🧘" },
      { name: "Legs Up Wall", duration: "10 minutes", steps: ["Lie near wall", "Extend legs up", "Relax arms", "Close eyes"], emoji: "🧘‍♀️" },
    ],
    exercises: [
      { name: "Deep Breathing", reps: "10 breaths", duration: "5 min", emoji: "🫁" },
      { name: "Walking", reps: "20 minutes", duration: "20 min", emoji: "🚶" },
    ],
    tips: ["Practice 4-7-8 breathing technique", "Take a warm bath with Epsom salts", "Listen to calming music", "Write in a gratitude journal"],
  },
  {
    id: "sadness",
    title: "Sadness",
    icon: Frown,
    color: "#3b82f6",
    foods: [
      { name: "Salmon", benefit: "Omega-3 boosts mood", time: "Lunch or dinner", emoji: "🐟" },
      { name: "Bananas", benefit: "Vitamin B6 for serotonin", time: "Breakfast", emoji: "🍌" },
      { name: "Berries", benefit: "Antioxidants reduce inflammation", time: "Anytime", emoji: "🫐" },
    ],
    yoga: [
      { name: "Sun Salutation", duration: "10-15 minutes", steps: ["Stand tall", "Reach arms up", "Fold forward", "Step back to plank"], emoji: "☀️" },
      { name: "Bridge Pose", duration: "5 minutes", steps: ["Lie on back", "Bend knees", "Lift hips", "Hold and breathe"], emoji: "🌉" },
    ],
    exercises: [
      { name: "Dancing", reps: "3 songs", duration: "15 min", emoji: "💃" },
      { name: "Swimming", reps: "20 laps", duration: "30 min", emoji: "🏊" },
    ],
    tips: ["Connect with a friend or family member", "Spend time in nature", "Practice self-compassion", "Engage in a creative hobby"],
  },
  {
    id: "anger",
    title: "Anger",
    icon: Angry,
    color: "#dc2626",
    foods: [
      { name: "Celery", benefit: "Cooling and calming", time: "Snack", emoji: "🥬" },
      { name: "Walnuts", benefit: "Omega-3 for brain health", time: "Morning", emoji: "🌰" },
      { name: "Chamomile Tea", benefit: "Natural calming effect", time: "Evening", emoji: "🍵" },
    ],
    yoga: [
      { name: "Warrior II", duration: "5 breaths each side", steps: ["Step feet wide", "Turn right foot out", "Bend right knee", "Extend arms"], emoji: "⚔️" },
      { name: "Seated Forward Fold", duration: "3-5 minutes", steps: ["Sit with legs extended", "Reach for toes", "Relax neck", "Breathe deeply"], emoji: "🪑" },
    ],
    exercises: [
      { name: "Boxing", reps: "3 rounds", duration: "20 min", emoji: "🥊" },
      { name: "Running", reps: "3 miles", duration: "30 min", emoji: "🏃" },
    ],
    tips: ["Count to 10 before reacting", "Practice progressive muscle relaxation", "Write down your feelings", "Take a cold shower"],
  },
  {
    id: "anxiety",
    title: "Anxiety",
    icon: CloudRain,
    color: "#f59e0b",
    foods: [
      { name: "Oatmeal", benefit: "Complex carbs boost serotonin", time: "Breakfast", emoji: "🥣" },
      { name: "Turkey", benefit: "Tryptophan promotes calm", time: "Lunch or dinner", emoji: "🦃" },
      { name: "Yogurt", benefit: "Probiotics for gut-brain axis", time: "Anytime", emoji: "🥛" },
    ],
    yoga: [
      { name: "Cat-Cow Stretch", duration: "5 minutes", steps: ["Hands and knees", "Arch back up", "Dip back down", "Sync with breath"], emoji: "🐱" },
      { name: "Corpse Pose", duration: "10 minutes", steps: ["Lie flat on back", "Arms by sides", "Close eyes", "Focus on breath"], emoji: "😌" },
    ],
    exercises: [
      { name: "Tai Chi", reps: "Full routine", duration: "20 min", emoji: "☯️" },
      { name: "Stretching", reps: "Full body", duration: "15 min", emoji: "🤸" },
    ],
    tips: ["Practice grounding techniques (5-4-3-2-1)", "Limit caffeine intake", "Use aromatherapy with lavender", "Try guided meditation"],
  },
  {
    id: "sleepiness",
    title: "Sleepiness",
    icon: Moon,
    color: "#1e3a5f",
    foods: [
      { name: "Almonds", benefit: "Magnesium for sleep", time: "Evening snack", emoji: "🥜" },
      { name: "Cherries", benefit: "Natural melatonin", time: "Evening", emoji: "🍒" },
      { name: "Warm Milk", benefit: "Tryptophan and calcium", time: "Before bed", emoji: "🥛" },
    ],
    yoga: [
      { name: "Sleeping Pigeon", duration: "5 minutes each side", steps: ["From downward dog", "Bring knee forward", "Extend back leg", "Fold forward"], emoji: "🐦" },
      { name: "Reclined Butterfly", duration: "10 minutes", steps: ["Lie on back", "Feet together", "Knees fall out", "Relax completely"], emoji: "🦋" },
    ],
    exercises: [
      { name: "Power Nap", reps: "1 session", duration: "20 min", emoji: "😴" },
      { name: "Light Walk", reps: "10 minutes", duration: "10 min", emoji: "🚶" },
    ],
    tips: ["Maintain consistent sleep schedule", "Create a dark, cool bedroom", "Avoid screens 1 hour before bed", "Try the military sleep method"],
  },
  {
    id: "loneliness",
    title: "Loneliness",
    icon: UserX,
    color: "#a855f7",
    foods: [
      { name: "Dark Chocolate", benefit: "Boosts endorphins", time: "Anytime", emoji: "🍫" },
      { name: "Oranges", benefit: "Vitamin C reduces stress", time: "Morning", emoji: "🍊" },
      { name: "Eggs", benefit: "Protein for energy", time: "Breakfast", emoji: "🥚" },
    ],
    yoga: [
      { name: "Heart Opening Sequence", duration: "15 minutes", steps: ["Cobra pose", "Camel pose", "Bridge pose", "Fish pose"], emoji: "❤️" },
      { name: "Partner Yoga", duration: "20 minutes", steps: ["Find a partner", "Back-to-back breathing", "Seated twist together", "Supported forward fold"], emoji: "🤝" },
    ],
    exercises: [
      { name: "Group Class", reps: "1 session", duration: "45 min", emoji: "👥" },
      { name: "Nature Walk", reps: "30 minutes", duration: "30 min", emoji: "🌳" },
    ],
    tips: ["Join a community group or club", "Volunteer for a cause you care about", "Practice random acts of kindness", "Adopt a pet if possible"],
  },
  {
    id: "motivation",
    title: "Lack of Motivation",
    icon: BatteryWarning,
    color: "#f97316",
    foods: [
      { name: "Spinach", benefit: "Iron for energy", time: "Lunch", emoji: "🥬" },
      { name: "Coffee", benefit: "Caffeine boost", time: "Morning", emoji: "☕" },
      { name: "Dark Chocolate", benefit: "Improves focus", time: "Afternoon", emoji: "🍫" },
    ],
    yoga: [
      { name: "Power Yoga Flow", duration: "30 minutes", steps: ["Sun salutations", "Warrior series", "Balance poses", "Core work"], emoji: "💪" },
      { name: "Energizing Breath", duration: "5 minutes", steps: ["Sit tall", "Quick inhale", "Forceful exhale", "Repeat rapidly"], emoji: "⚡" },
    ],
    exercises: [
      { name: "HIIT", reps: "4 circuits", duration: "20 min", emoji: "🔥" },
      { name: "Jump Rope", reps: "500 jumps", duration: "10 min", emoji: "⚡" },
    ],
    tips: ["Set small, achievable goals", "Use the 2-minute rule", "Create a motivating playlist", "Find an accountability partner"],
  },
];

export default function GetRidPage() {
  const [selectedOption, setSelectedOption] = useState<WellnessOption | null>(null);
  const [activeSection, setActiveSection] = useState<"foods" | "yoga" | "exercises" | "tips">("foods");

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Get Rid <span className="gradient-text">Of</span>
          </h1>
          <p className="text-white/50 mt-1">
            Personalized wellness solutions for every emotional state
          </p>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {!selectedOption ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {wellnessOptions.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="cursor-pointer h-full hover:border-white/20 transition-all group"
                  onClick={() => setSelectedOption(option)}
                >
                  <CardContent className="p-6">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: `${option.color}20` }}
                    >
                      <option.icon className="w-7 h-7" style={{ color: option.color }} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {option.title}
                    </h3>
                    <p className="text-sm text-white/40">
                      {option.foods.length} foods · {option.yoga.length} yoga poses · {option.exercises.length} exercises
                    </p>
                    <div className="flex items-center gap-1 mt-4 text-sm" style={{ color: option.color }}>
                      <span>Explore solutions</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => setSelectedOption(null)}>
                ← Back
              </Button>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${selectedOption.color}20` }}
              >
                <selectedOption.icon className="w-5 h-5" style={{ color: selectedOption.color }} />
              </div>
              <h2 className="text-2xl font-bold text-white">{selectedOption.title}</h2>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {([
                { id: "foods", label: "Foods", icon: Utensils },
                { id: "yoga", label: "Yoga", icon: Wind },
                { id: "exercises", label: "Exercises", icon: Dumbbell },
                { id: "tips", label: "Tips", icon: Sparkles },
              ] as const).map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeSection === tab.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveSection(tab.id)}
                  className="gap-1.5 whitespace-nowrap"
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              {activeSection === "foods" && (
                <motion.div
                  key="foods"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {selectedOption.foods.map((food, i) => (
                    <Card key={i}>
                      <CardContent className="p-5">
                        <div className="text-4xl mb-3">{food.emoji}</div>
                        <h3 className="text-lg font-semibold text-white mb-1">{food.name}</h3>
                        <p className="text-sm text-white/50 mb-3">{food.benefit}</p>
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="w-3 h-3" />
                          {food.time}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </motion.div>
              )}

              {activeSection === "yoga" && (
                <motion.div
                  key="yoga"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {selectedOption.yoga.map((pose, i) => (
                    <Card key={i}>
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="text-4xl">{pose.emoji}</div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-1">{pose.name}</h3>
                            <Badge variant="glow" className="mb-3">{pose.duration}</Badge>
                            <div className="space-y-1">
                              {pose.steps.map((step, j) => (
                                <div key={j} className="flex items-center gap-2 text-sm text-white/60">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emovert-cyan shrink-0" />
                                  {step}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </motion.div>
              )}

              {activeSection === "exercises" && (
                <motion.div
                  key="exercises"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  {selectedOption.exercises.map((exercise, i) => (
                    <Card key={i}>
                      <CardContent className="p-5 text-center">
                        <div className="text-4xl mb-3">{exercise.emoji}</div>
                        <h3 className="text-lg font-semibold text-white mb-2">{exercise.name}</h3>
                        <div className="space-y-1">
                          <p className="text-sm text-white/50">{exercise.reps}</p>
                          <Badge variant="secondary">{exercise.duration}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </motion.div>
              )}

              {activeSection === "tips" && (
                <motion.div
                  key="tips"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-2xl"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-emovert-cyan" />
                        Wellness Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedOption.tips.map((tip, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-start gap-3 p-4 rounded-lg bg-white/5"
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${selectedOption.color}20` }}
                          >
                            <Heart className="w-4 h-4" style={{ color: selectedOption.color }} />
                          </div>
                          <p className="text-sm text-white/70">{tip}</p>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
