import React from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '../../hooks/grand-opening/useReducedMotion';

export const SceneLogo: React.FC = () => {
  const prefersReduced = useReducedMotion();

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center px-6 select-none overflow-hidden text-center">
      {/* Dark Emerald & Gold radial bloom */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0, 0.6, 0.45], scale: [0.8, 1.15, 1.0] }}
        transition={{ duration: 3.0, ease: 'easeOut' }}
        className="absolute w-[650px] h-[650px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(214, 177, 91, 0.28) 0%, rgba(18, 61, 40, 0.15) 50%, transparent 75%)',
          filter: 'blur(50px)',
        }}
      />

      {/* Official Lepakshi Spices Logo Reveal Container */}
      <motion.div
        initial={{
          opacity: 0,
          scale: prefersReduced ? 1 : 0.88,
          filter: prefersReduced ? 'none' : 'blur(6px)',
        }}
        animate={{
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
        }}
        transition={{
          duration: 2.2,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="relative max-w-[260px] sm:max-w-[340px] md:max-w-[400px] w-full flex items-center justify-center p-4">
          {/* Logo Image */}
          <img
            src="/spices_logo.png"
            alt="Lepakshi Spices Official Logo"
            className="w-full h-auto object-contain filter drop-shadow-[0_15px_35px_rgba(0,0,0,0.85)] select-none"
          />

          {/* Controlled Metallic Light Sweep Mask */}
          <motion.div
            initial={{ x: '-120%', opacity: 0 }}
            animate={{ x: '180%', opacity: [0, 0.7, 0] }}
            transition={{ delay: 0.8, duration: 1.6, ease: 'easeInOut' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F6D88B]/35 to-transparent pointer-events-none transform -skew-x-20"
          />
        </div>

        {/* Elegant Heritage Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 1.2 }}
          className="mt-6"
        >
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-[#D6B15B]/30 bg-[#06170E]/80 backdrop-blur-md shadow-xl">
            <span className="text-[11px] sm:text-xs font-semibold tracking-[0.4em] text-[#F6D88B] uppercase">
              PURE HERITAGE • SINCE 2012
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
