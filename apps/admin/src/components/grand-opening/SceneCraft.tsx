import React from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '../../hooks/grand-opening/useReducedMotion';

const SPICES = [
  { name: 'Pure Turmeric', img: '/images/turmeric.png', label: 'Single-Origin Turmeric' },
  { name: 'Guntur Chilli', img: '/images/chilli.png', label: 'Sun-Dried Chilli' },
  { name: 'Coriander Seeds', img: '/images/coriander.jpg', label: 'Aromatic Coriander' },
  { name: 'Ginger Garlic', img: '/images/ginger_garlic.png', label: 'Fresh Root Essence' },
  { name: 'Royal Garam Masala', img: '/images/garam_masala.png', label: 'Heritage Spice Blend' },
];

export const SceneCraft: React.FC = () => {
  const prefersReduced = useReducedMotion();

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center px-4 md:px-12 select-none overflow-hidden">
      {/* Background macro glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(18, 61, 40, 0.4) 0%, rgba(6, 23, 14, 0.95) 80%)',
        }}
      />

      {/* Floating Macro Spice Cards in Shallow Depth of Field */}
      <div className="relative z-10 w-full max-w-5xl flex items-center justify-center gap-3 sm:gap-6 md:gap-8 flex-wrap mb-10">
        {SPICES.map((spice, idx) => {
          const isCenter = idx === 2;
          return (
            <motion.div
              key={spice.name}
              initial={{
                opacity: 0,
                y: prefersReduced ? 0 : 30 + idx * 8,
                scale: prefersReduced ? 1 : 0.88,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: isCenter ? 1.05 : 0.96,
              }}
              transition={{
                duration: 1.6,
                delay: idx * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`relative group rounded-2xl overflow-hidden backdrop-blur-md border border-[#D6B15B]/20 bg-[#0B2E1A]/40 shadow-2xl p-3 sm:p-4 flex flex-col items-center ${
                isCenter ? 'ring-1 ring-[#D6B15B]/50' : 'opacity-85'
              }`}
              style={{
                boxShadow: isCenter
                  ? '0 20px 50px -10px rgba(214, 177, 91, 0.25)'
                  : '0 10px 30px -10px rgba(0,0,0,0.6)',
              }}
            >
              {/* Soft gold rim light on card */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#D6B15B]/10 to-transparent pointer-events-none" />

              <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl overflow-hidden mb-2 bg-[#06170E]/60 flex items-center justify-center relative">
                <img
                  src={spice.img}
                  alt={spice.name}
                  className="w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-700 filter drop-shadow-md"
                  onError={(e) => {
                    // Failsafe fallback
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-[#F7F1E3]/90 text-center tracking-wide">
                {spice.name}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Narrative Typography */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1.4 }}
        className="relative z-20 text-center"
      >
        <p
          className="text-sm sm:text-lg md:text-xl font-medium tracking-[0.25em] text-[#F7F1E3] uppercase"
          style={{
            fontFamily: 'serif',
            textShadow: '0 2px 25px rgba(214, 177, 91, 0.3)',
          }}
        >
          ROOTED IN AUTHENTICITY.
        </p>
        <p className="text-[11px] sm:text-xs tracking-widest text-[#D6B15B]/80 uppercase mt-1">
          Uncompromised purity from Indian soil
        </p>
      </motion.div>
    </div>
  );
};
