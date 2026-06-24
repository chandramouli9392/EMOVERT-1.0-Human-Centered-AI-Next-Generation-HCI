"use client";

import { motion } from "framer-motion";

export function EmotionBrain() {
  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80">
      {/* Outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-emovert-cyan/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full bg-emovert-cyan/60"
            style={{
              top: "50%",
              left: "50%",
              transform: `rotate(${i * 45}deg) translateX(140px) translateY(-50%)`,
            }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, delay: i * 0.25, repeat: Infinity }}
          />
        ))}
      </motion.div>

      {/* Middle ring */}
      <motion.div
        className="absolute inset-4 rounded-full border border-emovert-purple/30"
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      >
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-emovert-purple/60"
            style={{
              top: "50%",
              left: "50%",
              transform: `rotate(${i * 60}deg) translateX(110px) translateY(-50%)`,
            }}
            animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2.5, delay: i * 0.4, repeat: Infinity }}
          />
        ))}
      </motion.div>

      {/* Inner brain */}
      <motion.div
        className="absolute inset-8 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0,240,255,0.15) 0%, rgba(168,85,247,0.1) 50%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Brain icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="url(#brain-gradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <defs>
              <linearGradient id="brain-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f0ff" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
          </motion.svg>
        </div>
      </motion.div>

      {/* Pulse rings */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border border-emovert-cyan/20"
          animate={{
            scale: [1, 1.5 + i * 0.3],
            opacity: [0.5, 0],
          }}
          transition={{
            duration: 3,
            delay: i * 1,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Emotion particles */}
      {["😊", "🧠", "💡", "✨", "🎯"].map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute text-lg"
          style={{
            top: `${20 + Math.random() * 60}%`,
            left: `${20 + Math.random() * 60}%`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, -10, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            delay: i * 0.8,
          }}
        >
          {emoji}
        </motion.div>
      ))}
    </div>
  );
}
