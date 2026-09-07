/**
 * Solarpunk Procedural Audio Synthesizer (Web Audio API)
 * Zero external audio assets required.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    try {
      const saved = localStorage.getItem('solar_grove_audio_enabled');
      if (saved !== null) {
        this.muted = saved === 'false';
      }
    } catch {
      // localStorage may fail in private mode
    }
  }

  private initCtx(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    try {
      localStorage.setItem('solar_grove_audio_enabled', String(!muted));
    } catch {
      // ignore
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  /**
   * Planting sound: Soft organic droplet pop
   */
  public playPlant(): void {
    if (this.muted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.08);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * Harvest sound: Bright golden pentatonic chime
   */
  public playHarvest(): void {
    if (this.muted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const now = ctx.currentTime + idx * 0.045;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    });
  }

  /**
   * Construction sound: Solid mechanical/brass tone
   */
  public playConstruct(): void {
    if (this.muted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(95, now + 0.15);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.23);
  }

  /**
   * Service start sound: Digital rising harmonic sweep
   */
  public playServiceStart(): void {
    if (this.muted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(261.63, now); // C4
    osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.18); // C5

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  /**
   * Incident alarm: Muted urgent pulse
   */
  public playIncidentAlarm(): void {
    if (this.muted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    [0, 0.16].forEach((delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      const now = ctx.currentTime + delay;
      osc.frequency.setValueAtTime(220, now); // A3

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    });
  }

  /**
   * Recovery sound: Satisfying two-tone resolution chord
   */
  public playRecovery(): void {
    if (this.muted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const freqs = [440, 554.37, 659.25]; // A major triad
    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.42);
    });
  }

  /**
   * Objective Complete: Triumphant solarpunk arpeggio
   */
  public playObjectiveComplete(): void {
    if (this.muted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const chord = [392, 523.25, 659.25, 783.99, 1046.5]; // G4, C5, E5, G5, C6
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const now = ctx.currentTime + idx * 0.05;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.46);
    });
  }

  /**
   * Victory Fanfare: Grand celebratory chord sequence
   */
  public playVictoryFanfare(): void {
    if (this.muted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const chords = [
      { notes: [261.63, 329.63, 392], time: 0 },       // C
      { notes: [349.23, 440, 523.25], time: 0.28 },    // F
      { notes: [392, 493.88, 587.33], time: 0.56 },    // G
      { notes: [523.25, 659.25, 783.99, 1046.5], time: 0.9 }, // High C
    ];

    chords.forEach(({ notes, time }) => {
      notes.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        const now = ctx.currentTime + time;
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (time >= 0.9 ? 1.2 : 0.4));

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + (time >= 0.9 ? 1.25 : 0.42));
      });
    });
  }
}

export const soundEngine = new SoundEngine();
