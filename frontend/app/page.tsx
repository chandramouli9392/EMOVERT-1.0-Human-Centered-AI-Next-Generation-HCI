"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { EmotionBrain } from "@/components/background/EmotionBrain";
import { useRouter } from "next/navigation";
import { useEmovertStore } from "@/hooks/useStore";
import {
  Brain,
  Heart,
  Target,
  Zap,
  Shield,
  Sparkles,
  TrendingUp,
  Music,
  MessageSquare,
  Award,
  ChevronDown,
  Github,
  Linkedin,
  Globe,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useEmovertStore();
  const features = [
    {
      icon: Brain,
      title: "Emotion Detection",
      description:
        "AI-powered real-time emotion analysis using computer vision. Detect 50+ emotional states with high accuracy.",
      color: "from-emovert-cyan to-emovert-blue",
    },
    {
      icon: Target,
      title: "Focus Tracking",
      description:
        "Monitor your attention span, detect distractions, and receive real-time focus coaching to maximize productivity.",
      color: "from-emovert-purple to-emovert-pink",
    },
    {
      icon: Heart,
      title: "Wellness Coaching",
      description:
        "Personalized AI coach that analyzes your emotional patterns and provides actionable wellness recommendations.",
      color: "from-emovert-pink to-emovert-red",
    },
    {
      icon: Zap,
      title: "Drowsiness Detection",
      description:
        "Advanced eye aspect ratio monitoring to detect fatigue and suggest breaks when you need them most.",
      color: "from-emovert-yellow to-emovert-orange",
    },
    {
      icon: Music,
      title: "Music for Peace",
      description:
        "Curated music center with categories for calm, focus, meditation, sleep, and nature sounds.",
      color: "from-emovert-green to-emovert-cyan",
    },
    {
      icon: MessageSquare,
      title: "AI Mood Chat",
      description:
        "Chat with EMI, your emotional intelligence companion. Get motivation, coaching, and emotional support 24/7.",
      color: "from-emovert-blue to-emovert-purple",
    },
  ];

  const stats = [
    { value: "50+", label: "Emotions Detected" },
    { value: "99%", label: "Detection Accuracy" },
    { value: "24/7", label: "AI Coaching" },
    { value: "100%", label: "Privacy First" },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emovert-cyan to-emovert-purple flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">EMOVERT</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <a
                href="#features"
                className="text-sm text-white/60 hover:text-white transition-colors hidden sm:block"
              >
                Features
              </a>
              <a
                href="#about"
                className="text-sm text-white/60 hover:text-white transition-colors hidden sm:block"
              >
                About
              </a>
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex"
                onClick={() => router.push(isAuthenticated ? "/dashboard" : "/login")}
              >
                {isAuthenticated ? "Dashboard" : "Sign In"}
              </Button>
              <Button
                size="sm"
                className="glow-cyan"
                onClick={() => router.push(isAuthenticated ? "/dashboard" : "/register")}
              >
                {isAuthenticated ? "Enter App" : "Get Started"}
              </Button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <Sparkles className="w-4 h-4 text-emovert-cyan" />
              <span className="text-sm text-white/70">
                Artificial Emotional Intelligence
              </span>
            </div>
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-7xl lg:text-8xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="gradient-text">EMOVERT</span>
          </motion.h1>

          <motion.p
            className="text-xl sm:text-2xl text-white/60 mb-4 font-light"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Where Emotions Meet Intelligence
          </motion.p>

          <motion.p
            className="text-base sm:text-lg text-white/40 max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Understand your emotions. Improve your focus. Transform your life
            through Artificial Emotional Intelligence.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Button
              size="xl"
              className="glow-cyan group"
              onClick={() => router.push(isAuthenticated ? "/session" : "/login")}
            >
              <Zap className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              Start Session
            </Button>
            <Button
              size="xl"
              variant="outline"
              onClick={() => router.push(isAuthenticated ? "/dashboard" : "/login")}
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              Explore Dashboard
            </Button>
          </motion.div>

          {/* AI Brain Visualization */}
          <motion.div
            className="flex justify-center mb-16"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <EmotionBrain />
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="glass rounded-xl p-4"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-2xl sm:text-3xl font-bold gradient-text">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-white/50 mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-6 h-6 text-white/30" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="gradient-text">Powerful Features</span>
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              Advanced AI capabilities designed to understand, analyze, and
              improve your emotional wellbeing
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="glass rounded-xl p-6 h-full hover:border-white/10 transition-all duration-300 group">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="glass rounded-2xl p-8 md:p-12 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Shield className="w-12 h-12 text-emovert-cyan mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">
              Privacy-First Design
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto mb-8">
              Your privacy is our priority. We never store face images, webcam
              frames, or videos. Only emotion labels, analytics, and timestamps
              are stored securely.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {["No Face Storage", "GDPR Compliant", "Encrypted Data", "Local Processing"].map(
                (item) => (
                  <span
                    key={item}
                    className="px-4 py-2 rounded-full glass text-sm text-emovert-cyan"
                  >
                    {item}
                  </span>
                )
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Award className="w-12 h-12 text-emovert-purple mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Transform Your Emotional Intelligence?
            </h2>
            <p className="text-white/50 mb-8 max-w-xl mx-auto">
              Join thousands of users who have improved their focus, reduced
              stress, and gained emotional awareness with EMOVERT.
            </p>
            <Button
              size="xl"
              className="glow-cyan"
              onClick={() => router.push(isAuthenticated ? "/dashboard" : "/register")}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Your Journey
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <Brain className="w-5 h-5 text-emovert-cyan" />
                <span className="text-lg font-bold gradient-text">EMOVERT</span>
              </div>
              <p className="text-sm text-white/40">
                Where Emotions Meet Intelligence
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Linkedin className="w-4 h-4 text-white/60" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Github className="w-4 h-4 text-white/60" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Globe className="w-4 h-4 text-white/60" />
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-sm text-white/30">
              Invented by <span className="text-emovert-cyan">Chandramouli Boppana</span>
            </p>
            <p className="text-xs text-white/20 mt-2">
              Copyright © EMOVERT. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
