import React from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '../../hooks/grand-opening/useReducedMotion';

export const SceneFounder: React.FC = () => {
  const prefersReduced = useReducedMotion();

  return (
    <div className="relative w-full h-full flex items-center justify-center px-6 md:px-16 lg:px-24 select-none overflow-hidden">
      {/* Warm directional rim glow behind portrait */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.45, scale: 1.1 }}
        transition={{ duration: 2.8, ease: 'easeOut' }}
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(214, 177, 91, 0.22) 0%, rgba(18, 61, 40, 0.1) 60%, transparent 80%)',
          filter: 'blur(50px)',
        }}
      />

      <div className="relative z-10 max-w-6xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
        {/* Left / Top: Exact Founder Photograph with Cinematic Light Sweep */}
        <motion.div
          initial={{
            opacity: 0,
            scale: prefersReduced ? 1 : 0.94,
            filter: 'brightness(0.2) contrast(1.2)',
          }}
          animate={{
            opacity: 1,
            scale: 1,
            filter: 'brightness(1.0) contrast(1.05)',
          }}
          transition={{
            duration: 2.4,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="md:col-span-5 lg:col-span-5 flex justify-center"
        >
          <div className="relative group max-w-[280px] sm:max-w-[340px] md:max-w-[380px] w-full">
            {/* Metallic Gold Framing & Rim Shadow */}
            <div
              className="absolute -inset-[2px] rounded-3xl bg-gradient-to-b from-[#F6D88B] via-[#D6B15B]/40 to-[#0B2E1A] opacity-90 shadow-2xl pointer-events-none"
              style={{
                boxShadow: '0 20px 50px -10px rgba(214, 177, 91, 0.3), 0 0 30px rgba(11, 46, 26, 0.8)',
              }}
            />

            {/* Inner Portrait Container */}
            <div className="relative rounded-[22px] overflow-hidden bg-[#06170E] aspect-[3/4] flex items-center justify-center">
              <img
                src="/founder.jpeg"
                alt="Bhavana Netha - Founder, Lepakshi Spices"
                className="w-full h-full object-cover object-center transform transition-transform duration-1000"
                style={{
                  filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))',
                }}
              />

              {/* Light Sweep Mask Across the Portrait */}
              <motion.div
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ x: '160%', opacity: [0, 0.5, 0] }}
                transition={{ delay: 0.6, duration: 1.8, ease: 'easeInOut' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F6D88B]/25 to-transparent pointer-events-none transform -skew-x-12"
              />

              {/* Subtle vignette over portrait */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#06170E]/80 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {/* Right / Bottom: Typography & Founder Story */}
        <motion.div
          initial={{ opacity: 0, x: prefersReduced ? 0 : 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 2.0, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-7 lg:col-span-7 flex flex-col items-center md:items-start text-center md:text-left space-y-4"
        >
          {/* Tagline */}
          <div className="inline-flex items-center gap-2">
            <span className="w-6 h-[1px] bg-[#D6B15B]" />
            <span className="text-xs sm:text-sm font-semibold tracking-[0.35em] text-[#D6B15B] uppercase">
              THE VISION BEHIND THE BRAND
            </span>
          </div>

          {/* Founder Name */}
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-[#F7F1E3] tracking-tight leading-tight"
            style={{
              textShadow: '0 4px 30px rgba(0,0,0,0.9), 0 0 25px rgba(214, 177, 91, 0.25)',
            }}
          >
            Bhavana Netha
          </h1>

          {/* Title */}
          <p className="text-sm sm:text-base md:text-lg font-light text-[#F6D88B] tracking-widest uppercase">
            Founder, Lepakshi Spices
          </p>

          {/* Gold separator */}
          <div className="w-16 h-[2px] bg-gradient-to-r from-[#D6B15B] to-transparent my-2" />

          {/* Emotional Statement */}
          <blockquote
            className="text-base sm:text-lg md:text-xl font-serif italic text-[#F7F1E3]/90 max-w-lg leading-relaxed"
            style={{
              textShadow: '0 2px 10px rgba(0,0,0,0.7)',
            }}
          >
            “Built on purity, authenticity and trust.”
          </blockquote>

          <p className="text-xs sm:text-sm text-[#F7F1E3]/70 font-light max-w-md pt-2">
            Dedicated to bringing uncompromised traditional spice purity to every kitchen and home.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
