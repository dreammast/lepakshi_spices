import React from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '../../hooks/grand-opening/useReducedMotion';

const CRAFT_STEPS = [
  {
    icon: '✦',
    title: 'Selection',
    desc: 'Hand-picked whole spices',
  },
  {
    icon: '❖',
    title: 'Slow Grinding',
    desc: 'Low-temperature aroma retention',
  },
  {
    icon: '◈',
    title: 'Master Blending',
    desc: 'Generational recipes perfected',
  },
  {
    icon: '✧',
    title: 'Aroma-Lock',
    desc: 'Sealed for lasting freshness',
  },
];

export const SceneMaking: React.FC = () => {
  const prefersReduced = useReducedMotion();

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center px-6 md:px-16 select-none overflow-hidden text-center">
      {/* Warm artisan light background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 2.0 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(214, 177, 91, 0.12) 0%, rgba(6, 23, 14, 0.95) 75%)',
        }}
      />

      {/* Centerpiece Statement */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mb-8"
      >
        <span className="text-[11px] sm:text-xs tracking-[0.35em] text-[#D6B15B] uppercase font-semibold">
          THE ARTISAN PROCESS
        </span>
        <h2
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-[#F7F1E3] tracking-wide mt-2"
          style={{
            textShadow: '0 4px 30px rgba(0,0,0,0.8), 0 0 20px rgba(214, 177, 91, 0.25)',
          }}
        >
          CRAFTED WITH CARE.
        </h2>
      </motion.div>

      {/* Craftsmanship Pillars */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 max-w-4xl w-full mb-8">
        {CRAFT_STEPS.map((step, idx) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: prefersReduced ? 0 : 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + idx * 0.15, duration: 1.2 }}
            className="p-4 sm:p-5 rounded-xl border border-[#D6B15B]/20 bg-[#0B2E1A]/50 backdrop-blur-md flex flex-col items-center justify-center text-center shadow-lg"
          >
            <span className="text-[#F6D88B] text-xl sm:text-2xl mb-2">{step.icon}</span>
            <h4 className="text-xs sm:text-sm font-semibold text-[#F7F1E3] tracking-wider uppercase mb-1">
              {step.title}
            </h4>
            <p className="text-[10px] sm:text-xs text-[#F7F1E3]/70 font-light">
              {step.desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Secondary Statement */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 1.2 }}
        className="relative z-10"
      >
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-[#D6B15B]/30 bg-[#06170E]/70 backdrop-blur-md">
          <span className="text-xs sm:text-sm tracking-[0.3em] font-medium text-[#F6D88B] uppercase">
            PURE • AUTHENTIC • TRUSTED
          </span>
        </div>
      </motion.div>
    </div>
  );
};
