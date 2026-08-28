import { useState, useEffect, useCallback, useRef } from 'react';
import { SCENE_KEYS, SCENE_DURATIONS, SceneKey } from '../../lib/grand-opening/transitions';
import { cinematicAudio } from '../../lib/grand-opening/audio';

interface UseGrandOpeningOptions {
  onComplete?: () => void;
  autoPlay?: boolean;
}

export function useGrandOpening(options: UseGrandOpeningOptions = {}) {
  const { onComplete, autoPlay = true } = options;
  const [sceneIndex, setSceneIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [audioStarted, setAudioStarted] = useState<boolean>(false);
  const [hasEnded, setHasEnded] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentScene: SceneKey = SCENE_KEYS[sceneIndex] || 'JOURNEY';

  // Sound triggering per scene
  const triggerSceneAudio = useCallback((idx: number) => {
    const key = SCENE_KEYS[idx];
    if (key === 'ORIGIN') {
      cinematicAudio.startAtmosphericDrone();
    } else if (key === 'CRAFT') {
      cinematicAudio.playSpiceTexture();
    } else if (key === 'FOUNDER') {
      cinematicAudio.playFounderRise();
    } else if (key === 'LOGO') {
      cinematicAudio.playLogoReveal();
    } else if (key === 'GRAND_OPENING') {
      cinematicAudio.playGrandOpeningImpact();
    }
  }, []);

  const goToScene = useCallback((targetIndex: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const clamped = Math.max(0, Math.min(targetIndex, SCENE_KEYS.length - 1));
    setSceneIndex(clamped);
    triggerSceneAudio(clamped);
    if (clamped === SCENE_KEYS.length - 1) {
      setHasEnded(true);
    }
  }, [triggerSceneAudio]);

  const nextScene = useCallback(() => {
    if (sceneIndex < SCENE_KEYS.length - 1) {
      goToScene(sceneIndex + 1);
    } else {
      setHasEnded(true);
    }
  }, [sceneIndex, goToScene]);

  const prevScene = useCallback(() => {
    if (sceneIndex > 0) {
      goToScene(sceneIndex - 1);
    }
  }, [sceneIndex, goToScene]);

  // Audio Toggle
  const toggleAudio = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    cinematicAudio.setMuted(nextMuted);
    if (!nextMuted) {
      setAudioStarted(true);
      cinematicAudio.startAtmosphericDrone();
      triggerSceneAudio(sceneIndex);
    }
  }, [isMuted, sceneIndex, triggerSceneAudio]);

  // Unmute and start
  const enableAudio = useCallback(() => {
    setIsMuted(false);
    setAudioStarted(true);
    cinematicAudio.setMuted(false);
    cinematicAudio.startAtmosphericDrone();
    triggerSceneAudio(sceneIndex);
  }, [sceneIndex, triggerSceneAudio]);

  // Scene auto progression
  useEffect(() => {
    if (!isPlaying) return;

    const duration = SCENE_DURATIONS[currentScene];
    if (duration !== Infinity && sceneIndex < SCENE_KEYS.length - 1) {
      timerRef.current = setTimeout(() => {
        nextScene();
      }, duration);
    } else if (sceneIndex >= SCENE_KEYS.length - 1) {
      setHasEnded(true);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [sceneIndex, isPlaying, currentScene, nextScene]);

  // Handle ESC key to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        skip();
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        nextScene();
      } else if (e.key === 'ArrowLeft') {
        prevScene();
      } else if (e.key.toLowerCase() === 'm') {
        toggleAudio();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextScene, prevScene, toggleAudio]);

  const skip = useCallback(() => {
    cinematicAudio.fadeOutAll(0.8);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (onComplete) onComplete();
  }, [onComplete]);

  const beginJourney = useCallback(() => {
    cinematicAudio.fadeOutAll(1.2);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (onComplete) onComplete();
  }, [onComplete]);

  const restart = useCallback(() => {
    goToScene(0);
    setIsPlaying(true);
    setHasEnded(false);
  }, [goToScene]);

  return {
    sceneIndex,
    currentScene,
    isPlaying,
    isMuted,
    audioStarted,
    hasEnded,
    totalScenes: SCENE_KEYS.length,
    progress: (sceneIndex + 1) / SCENE_KEYS.length,
    toggleAudio,
    enableAudio,
    goToScene,
    nextScene,
    prevScene,
    skip,
    beginJourney,
    restart,
    setIsPlaying,
  };
}
