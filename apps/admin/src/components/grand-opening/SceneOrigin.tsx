import React from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '../../hooks/grand-opening/useReducedMotion';

export const SceneOrigin: React.FC = () => {
  const prefersReduced = useReducedMotion();

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center text-center px-6 select-none overflow-hidden">
      {/* Directional beam & low-key atmospheric light */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0, 0.45, 0.35], scale: [0.85, 1.05, 1.0] }}
        transition={{ duration: 3.0, ease: 'easeOut' }}
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(214, 177, 91, 0.15) 0%, rgba(11, 46, 26, 0.05) 50%, transparent 75%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Cinematic Film Title */}
      <motion.div
        initial={{ opacity: 0, y: 15, letterSpacing: '0.45em' }}
        animate={{ opacity: 1, y: 0, letterSpacing: '0.55em' }}
        exit={{ opacity: 0, y: -10, transition: { duration: 0.6 } }}
        transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center"
      >
        <span
          className="text-xs sm:text-sm md:text-base font-semibold uppercase tracking-[0.55em] text-[#D6B15B]"
          style={{
            textShadow: '0 2px 20px rgba(214, 177, 91, 0.4)',
            fontFamily: 'serif',
          }}
        >
          PRESENTING
        </span>
        
        {/* Subtle decorative gold line */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: prefersReduced ? '40px' : '60px', opacity: 0.7 }}
          transition={{ delay: 0.8, duration: 1.4 }}
          className="h-[1px] bg-gradient-to-r from-transparent via-[#D6B15B] to-transparent mt-4"
        />
      </motion.div>
    </div>
  );
};
