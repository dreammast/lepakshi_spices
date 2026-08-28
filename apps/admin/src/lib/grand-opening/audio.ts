// Procedural Web Audio API Cinematic Sound Engine for Lepakshi Spices Grand Opening
// High-fidelity, restrained luxury soundscape without external audio file dependencies

class CinematicAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private masterGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn('[GrandOpeningAudio] Web Audio initialization skipped:', e);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (!this.ctx || !this.masterGain) {
      if (!muted) this.init();
      return;
    }
    if (this.ctx.state === 'suspended' && !muted) {
      this.ctx.resume().catch(() => {});
    }
    const t = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(t);
    this.masterGain.gain.linearRampToValueAtTime(muted ? 0 : 0.85, t + 0.3);
  }

  public getMuted() {
    return this.isMuted;
  }

  public startAtmosphericDrone() {
    if (!this.ctx || !this.masterGain) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      if (this.droneOsc1) return; // already playing

      const t = this.ctx.currentTime;
      // Sub-bass warm drone (55Hz + 110Hz harmonic)
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const droneGain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(55, t); // A1

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(110, t); // A2

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, t);

      droneGain.gain.setValueAtTime(0.001, t);
      droneGain.gain.exponentialRampToValueAtTime(0.35, t + 3.0);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(droneGain);
      droneGain.connect(this.masterGain);

      osc1.start(t);
      osc2.start(t);

      this.droneOsc1 = osc1;
      this.droneOsc2 = osc2;
      this.droneGain = droneGain;
    } catch (e) {
      console.warn('[GrandOpeningAudio] Drone start error:', e);
    }
  }

  public playSpiceTexture() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;
      // High-register organic wind shimmer
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, t); // D5
      osc.frequency.exponentialRampToValueAtTime(880, t + 1.2); // A5

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(750, t);
      filter.Q.setValueAtTime(4.0, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.0);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 2.2);
    } catch {}
  }

  public playFounderRise() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;
      // Warm triad harmonic riser (D4 - F#4 - A4)
      const freqs = [293.66, 369.99, 440.0];
      freqs.forEach((freq) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.15, t + 1.5);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 3.8);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 4.0);
      });
    } catch {}
  }

  public playLogoReveal() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;
      // Resonant metallic chime (temple bell harmonic 432Hz with soft high ping)
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      const gain2 = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(432, t); // Pure A4

      gain1.gain.setValueAtTime(0.001, t);
      gain1.gain.linearRampToValueAtTime(0.28, t + 0.08);
      gain1.gain.exponentialRampToValueAtTime(0.0001, t + 3.5);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1296, t); // 3rd harmonic overtone

      gain2.gain.setValueAtTime(0.001, t);
      gain2.gain.linearRampToValueAtTime(0.1, t + 0.04);
      gain2.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);

      osc1.connect(gain1);
      gain1.connect(this.masterGain);

      osc2.connect(gain2);
      gain2.connect(this.masterGain);

      osc1.start(t);
      osc1.stop(t + 3.6);
      osc2.start(t);
      osc2.stop(t + 2.0);
    } catch {}
  }

  public playGrandOpeningImpact() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;
      // Sub-impact + warm shimmer
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.8);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.35, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 2.6);
    } catch {}
  }

  public fadeOutAll(duration = 1.5) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const t = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(t);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, t + duration);
      setTimeout(() => {
        if (this.droneOsc1) {
          try {
            this.droneOsc1.stop();
            this.droneOsc1.disconnect();
          } catch {}
          this.droneOsc1 = null;
        }
        if (this.droneOsc2) {
          try {
            this.droneOsc2.stop();
            this.droneOsc2.disconnect();
          } catch {}
          this.droneOsc2 = null;
        }
      }, duration * 1000 + 100);
    } catch {}
  }
}

export const cinematicAudio = new CinematicAudioEngine();
