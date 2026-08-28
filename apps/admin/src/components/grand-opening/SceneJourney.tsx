import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { useReducedMotion } from '../../hooks/grand-opening/useReducedMotion';

interface SceneJourneyProps {
  onBegin: () => void;
  onReplay: () => void;
}

export const SceneJourney: React.FC<SceneJourneyProps> = ({ onBegin, onReplay }) => {
  const prefersReduced = useReducedMotion();

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center px-6 select-none overflow-hidden text-center">
      {/* Deep Emerald Ambiance */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(18, 61, 40, 0.45) 0%, rgba(6, 23, 14, 0.98) 75%)',
        }}
      />

      <div className="relative z-10 max-w-2xl flex flex-col items-center space-y-6 sm:space-y-7">
        {/* Official Logo */}
        <motion.div
          initial={{ opacity: 0, scale: prefersReduced ? 1 : 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[170px] sm:max-w-[210px] md:max-w-[240px] w-full"
        >
          <img
            src="/spices_logo.png"
            alt="Lepakshi Spices"
            className="w-full h-auto object-contain filter drop-shadow-[0_12px_30px_rgba(0,0,0,0.85)]"
          />
        </motion.div>

        {/* Core Narrative */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1.2 }}
          className="space-y-2"
        >
          <h2
            className="text-lg sm:text-2xl md:text-3xl font-serif text-[#F7F1E3] tracking-[0.15em] uppercase font-medium"
            style={{
              textShadow: '0 2px 20px rgba(214, 177, 91, 0.35)',
            }}
          >
            PURELY CRAFTED.<br />AUTHENTICALLY LEPAKSHI.
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-[#D6B15B] tracking-widest uppercase font-light pt-1">
            Welcome to the journey.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1.0 }}
          className="flex flex-col sm:flex-row items-center gap-4 pt-2 w-full justify-center"
        >
          {/* Primary CTA */}
          <button
            onClick={onBegin}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#D6B15B] via-[#F6D88B] to-[#D6B15B] text-[#06170E] font-semibold text-xs sm:text-sm tracking-[0.25em] uppercase shadow-[0_10px_35px_rgba(214,177,91,0.4)] hover:shadow-[0_15px_45px_rgba(246,216,139,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer group"
          >
            <span>BEGIN THE JOURNEY</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Replay Option */}
          <button
            onClick={onReplay}
            className="px-5 py-3 rounded-full border border-[#D6B15B]/30 bg-[#0B2E1A]/40 backdrop-blur-md text-[#F7F1E3]/80 hover:text-[#F6D88B] hover:border-[#D6B15B] text-xs tracking-widest uppercase transition-all duration-300 flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay Film</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
};
