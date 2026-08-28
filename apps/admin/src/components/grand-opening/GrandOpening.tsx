import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGrandOpening } from '../../hooks/grand-opening/useGrandOpening';
import { SCENE_KEYS } from '../../lib/grand-opening/transitions';
import { CinematicCanvas } from './CinematicCanvas';
import { SceneOrigin } from './SceneOrigin';
import { SceneCraft } from './SceneCraft';
import { SceneMaking } from './SceneMaking';
import { SceneFounder } from './SceneFounder';
import { SceneLogo } from './SceneLogo';
import { SceneGrandOpening } from './SceneGrandOpening';
import { SceneJourney } from './SceneJourney';
import { SoundController } from './SoundController';
import { X } from 'lucide-react';

interface GrandOpeningProps {
  onComplete: () => void;
  isPreview?: boolean;
}

export const GrandOpening: React.FC<GrandOpeningProps> = ({ onComplete, isPreview = false }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousOverscrollBehavior = document.body.style.overscrollBehavior;
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscrollBehavior;
    };
  }, []);

  const handleFinish = () => {
    setIsClosing(true);
    setTimeout(() => {
      onComplete();
    }, 1400);
  };

  const {
    sceneIndex,
    currentScene,
    isMuted,
    toggleAudio,
    goToScene,
    skip,
    beginJourney,
    restart,
  } = useGrandOpening({
    onComplete: handleFinish,
    autoPlay: true,
  });

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isClosing ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.4, ease: 'easeInOut' }}
      className="fixed inset-0 z-[2147483000] flex h-[100vh] w-[100vw] flex-col justify-between overflow-hidden isolate bg-[#06170E] text-[#F7F1E3] select-none font-sans pointer-events-auto"
      style={{
        backgroundColor: '#06170E',
      }}
      role="dialog"
      aria-label="Lepakshi Spices Grand Opening Film"
    >
      {/* Opaque foundation: the application below must never show through. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 42%, #123D28 0%, #0B2E1A 38%, #06170E 76%)',
        }}
      />

      {/* 1. GPU Spice Dust Particle & Directional Beam Canvas */}
      <CinematicCanvas intensity={currentScene === 'ORIGIN' ? 0.7 : 1.1} />

      {/* Subtle Film Grain Texture Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay z-1"
        style={{
          backgroundImage: `radial-gradient(circle, #D6B15B 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* 2. Top Bar Navigation */}
      <header className="relative z-30 flex items-center justify-between px-4 sm:px-8 py-5 w-full">
        {/* Left: Sound Controller */}
        <SoundController isMuted={isMuted} onToggle={toggleAudio} />

        {/* Center: Subtle Scene Progression Dots */}
        <nav
          aria-label="Scene Progress"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B2E1A]/40 border border-[#D6B15B]/20 backdrop-blur-md"
        >
          {SCENE_KEYS.map((key, idx) => {
            const isActive = idx === sceneIndex;
            const isPassed = idx < sceneIndex;
            return (
              <button
                key={key}
                onClick={() => goToScene(idx)}
                className={`transition-all duration-500 rounded-full cursor-pointer ${
                  isActive
                    ? 'w-6 h-1.5 bg-gradient-to-r from-[#D6B15B] to-[#F6D88B]'
                    : isPassed
                    ? 'w-1.5 h-1.5 bg-[#D6B15B]/60'
                    : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
                }`}
                title={`Jump to Scene: ${key}`}
                aria-label={`Scene ${idx + 1}: ${key}`}
                aria-current={isActive ? 'step' : undefined}
              />
            );
          })}
        </nav>

        {/* Right: Skip Button with ESC hint */}
        <button
          onClick={skip}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#D6B15B]/45 bg-[#06170E]/95 hover:bg-[#0B2E1A] text-[#F7F1E3] hover:text-[#F6D88B] text-[11px] font-medium tracking-widest uppercase transition-all duration-300 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.45)] cursor-pointer group"
          title="Skip Grand Opening Film (ESC)"
        >
          <span>Skip Intro</span>
          <span className="hidden md:inline text-[9px] px-1 py-0.2 rounded bg-white/10 text-white/50 group-hover:text-[#F6D88B]">
            ESC
          </span>
          <X className="w-3.5 h-3.5 ml-0.5 opacity-60 group-hover:opacity-100" />
        </button>
      </header>

      {/* 3. Main Stage: Dynamic Scene Presentation */}
      <main className="relative z-20 flex-1 flex items-center justify-center w-full max-w-7xl mx-auto h-full">
        <AnimatePresence mode="wait">
          {currentScene === 'ORIGIN' && (
            <motion.div
              key="origin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9 }}
              className="w-full h-full flex items-center justify-center"
            >
              <SceneOrigin />
            </motion.div>
          )}

          {currentScene === 'CRAFT' && (
            <motion.div
              key="craft"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9 }}
              className="w-full h-full flex items-center justify-center"
            >
              <SceneCraft />
            </motion.div>
          )}

          {currentScene === 'MAKING' && (
            <motion.div
              key="making"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9 }}
              className="w-full h-full flex items-center justify-center"
            >
              <SceneMaking />
            </motion.div>
          )}

          {currentScene === 'FOUNDER' && (
            <motion.div
              key="founder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9 }}
              className="w-full h-full flex items-center justify-center"
            >
              <SceneFounder />
            </motion.div>
          )}

          {currentScene === 'LOGO' && (
            <motion.div
              key="logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9 }}
              className="w-full h-full flex items-center justify-center"
            >
              <SceneLogo />
            </motion.div>
          )}

          {currentScene === 'GRAND_OPENING' && (
            <motion.div
              key="grand_opening"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9 }}
              className="w-full h-full flex items-center justify-center"
            >
              <SceneGrandOpening />
            </motion.div>
          )}

          {currentScene === 'JOURNEY' && (
            <motion.div
              key="journey"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9 }}
              className="w-full h-full flex items-center justify-center"
            >
              <SceneJourney onBegin={beginJourney} onReplay={restart} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 4. Subtle Footer Brand Signature */}
      <footer className="relative z-30 flex items-center justify-between px-6 sm:px-8 py-4 w-full text-[10px] text-[#F7F1E3]/70 tracking-widest uppercase">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D6B15B]/60" />
          <span>Lepakshi Spices • Official Launch Reveal</span>
          {isPreview && (
            <span className="px-1.5 py-0.5 rounded bg-[#D6B15B]/20 text-[#F6D88B] border border-[#D6B15B]/40 font-mono text-[9px]">
              PREVIEW MODE
            </span>
          )}
        </div>
        <div className="hidden sm:block">
          <span>Purity • Authenticity • Trust</span>
        </div>
      </footer>
    </motion.div>
  );
};
