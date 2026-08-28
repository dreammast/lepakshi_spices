import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { useReducedMotion } from '../../hooks/grand-opening/useReducedMotion';

export const SceneGrandOpening: React.FC = () => {
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) return;
    try {
      // Subtle, restrained luxury gold & emerald confetti
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#D6B15B', '#F6D88B', '#123D28', '#F7F1E3'],
        disableForReducedMotion: true,
        scalar: 0.9,
      });
    } catch {}
  }, [prefersReduced]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center px-6 select-none overflow-hidden text-center">
      {/* Warm Ambient Bloom */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 0.55, scale: 1.2 }}
        transition={{ duration: 2.8, ease: 'easeOut' }}
        className="absolute w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(214, 177, 91, 0.35) 0%, rgba(18, 61, 40, 0.2) 55%, transparent 75%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="relative z-10 max-w-4xl flex flex-col items-center space-y-5">
        {/* Subtle Brand Crest Icon */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0 }}
          className="text-[#D6B15B] text-2xl tracking-widest"
        >
          ✦ ✦ ✦
        </motion.div>

        {/* Climax Display Typography: GRAND OPENING */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9, letterSpacing: '0.25em' }}
          animate={{ opacity: 1, scale: 1, letterSpacing: '0.35em' }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#FFF5D6] via-[#F6D88B] to-[#D6B15B] uppercase tracking-[0.35em] leading-tight"
          style={{
            filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.9)) drop-shadow(0 0 35px rgba(214, 177, 91, 0.45))',
          }}
        >
          GRAND OPENING
        </motion.h1>

        {/* Dedication */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1.4 }}
          className="space-y-3"
        >
          <p className="text-lg sm:text-2xl md:text-3xl font-serif text-[#F7F1E3] font-light">
            Congratulations, <span className="font-semibold text-[#F6D88B]">Bhavana Netha</span>
          </p>

          <p
            className="text-xs sm:text-base md:text-lg text-[#F7F1E3]/85 max-w-xl mx-auto font-light leading-relaxed tracking-wide"
            style={{
              textShadow: '0 2px 15px rgba(0,0,0,0.8)',
            }}
          >
            Today begins a journey built on purity, authenticity and trust.
          </p>
        </motion.div>

        {/* Decorative Gold Bar */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: prefersReduced ? '80px' : '140px', opacity: 0.8 }}
          transition={{ delay: 0.8, duration: 1.2 }}
          className="h-[2px] bg-gradient-to-r from-transparent via-[#F6D88B] to-transparent mt-4"
        />
      </div>
    </div>
  );
};
