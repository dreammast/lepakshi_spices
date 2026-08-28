import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from '../../hooks/grand-opening/useReducedMotion';

interface Particle {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  alpha: number;
  maxAlpha: number;
  color: string;
  twinkleSpeed: number;
  angle: number;
  spin: number;
}

const SPICE_COLORS = [
  'rgba(246, 216, 139, ', // Golden Turmeric Dust
  'rgba(214, 177, 91, ',  // Luxury Gold Fleck
  'rgba(224, 107, 43, ',  // Rich Red Chilli Particle
  'rgba(180, 83, 9, ',    // Warm Garam Masala Spice
  'rgba(163, 230, 53, ',  // Coriander Seed Hue
];

export const CinematicCanvas: React.FC<{ intensity?: number }> = ({ intensity = 1.0 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const particleCount = prefersReducedMotion ? 20 : Math.min(75, Math.floor((width * height) / 18000));
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.2 + 0.6,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -Math.random() * 0.45 - 0.1, // gently floating upwards like warm aroma
        alpha: Math.random() * 0.7 + 0.1,
        maxAlpha: Math.random() * 0.65 + 0.25,
        color: SPICE_COLORS[Math.floor(Math.random() * SPICE_COLORS.length)],
        twinkleSpeed: Math.random() * 0.02 + 0.008,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.02,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      // 1. Subtle warm directional beam of light sweeping in
      const beamX = width * 0.5 + Math.sin(time * 0.4) * (width * 0.08);
      const gradient = ctx.createRadialGradient(
        beamX,
        height * 0.25,
        10,
        beamX,
        height * 0.45,
        Math.max(width, height) * 0.85
      );
      gradient.addColorStop(0, 'rgba(214, 177, 91, 0.07)'); // Subtle warm gold center
      gradient.addColorStop(0.35, 'rgba(18, 61, 40, 0.04)');  // Emerald falloff
      gradient.addColorStop(1, 'rgba(6, 23, 14, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 2. Realistic floating spice dust particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.x += p.vx * intensity;
          p.y += p.vy * intensity;
          p.angle += p.spin;
          p.alpha += Math.sin(time * 2 + i) * p.twinkleSpeed;

          // Wrap boundaries smoothly
          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
        }

        const currentAlpha = Math.max(0.05, Math.min(p.maxAlpha, p.alpha));

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${currentAlpha})`;
        ctx.shadowColor = 'rgba(246, 216, 139, 0.4)';
        ctx.shadowBlur = p.size * 3;
        ctx.fill();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity, prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10"
      style={{ opacity: 0.92 }}
    />
  );
};
