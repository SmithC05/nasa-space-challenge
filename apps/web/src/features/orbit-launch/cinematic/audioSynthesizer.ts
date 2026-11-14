/**
 * Synthesizes cinematic audio effects using the Web Audio API.
 * Zero external audio files required — 100% self-contained, legal, offline-capable.
 */
class LaunchAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private rocketRoarNode: AudioBufferSourceNode | null = null;
  private rocketRoarGain: GainNode | null = null;

  constructor() {
    // Lazy initialize upon first user gesture
  }

  private initContext(): boolean {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return true;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return false;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.4, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      return true;
    } catch {
      return false;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.4, this.ctx.currentTime);
    }
  }

  public playCountdownBeep(isFinal: boolean = false) {
    if (this.isMuted || !this.initContext() || !this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = isFinal ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(isFinal ? 1760 : 880, now);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isFinal ? 0.35 : 0.15));

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + (isFinal ? 0.4 : 0.2));
    } catch {
      // Audio fallback silent
    }
  }

  public startRocketRoar(intensity: number = 0.5) {
    if (this.isMuted || !this.initContext() || !this.ctx || !this.masterGain) return;
    if (this.rocketRoarNode) return; // Already running

    try {
      // Create 2-second looped noise buffer
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Pink/Brown noise generation for deep acoustic engine rumble
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11;
        b6 = white * 0.115926;
      }

      this.rocketRoarNode = this.ctx.createBufferSource();
      this.rocketRoarNode.buffer = noiseBuffer;
      this.rocketRoarNode.loop = true;

      // Lowpass filter for deep low-end rumble
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);

      this.rocketRoarGain = this.ctx.createGain();
      this.rocketRoarGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.rocketRoarGain.gain.linearRampToValueAtTime(Math.min(0.6, intensity), this.ctx.currentTime + 1.2);

      this.rocketRoarNode.connect(filter);
      filter.connect(this.rocketRoarGain);
      this.rocketRoarGain.connect(this.masterGain);

      this.rocketRoarNode.start();
    } catch {
      // Audio fallback silent
    }
  }

  public setRoarIntensity(intensity: number) {
    if (this.ctx && this.rocketRoarGain) {
      this.rocketRoarGain.gain.setValueAtTime(
        Math.min(0.7, Math.max(0.01, intensity)),
        this.ctx.currentTime
      );
    }
  }

  public stopRocketRoar(fadeSec: number = 0.8) {
    if (this.rocketRoarGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.rocketRoarGain.gain.linearRampToValueAtTime(0.001, now + fadeSec);
        setTimeout(() => {
          if (this.rocketRoarNode) {
            try {
              this.rocketRoarNode.stop();
              this.rocketRoarNode.disconnect();
            } catch {}
            this.rocketRoarNode = null;
          }
          this.rocketRoarGain = null;
        }, fadeSec * 1000 + 50);
      } catch {
        this.rocketRoarNode = null;
        this.rocketRoarGain = null;
      }
    }
  }

  public playStageSeparationThud() {
    if (this.isMuted || !this.initContext() || !this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.35);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {}
  }

  public playDeploymentChime() {
    if (this.isMuted || !this.initContext() || !this.ctx || !this.masterGain) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, i) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const time = this.ctx.currentTime + i * 0.12;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(time);
        osc.stop(time + 0.55);
      });
    } catch {}
  }

  public cleanup() {
    this.stopRocketRoar(0.1);
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        this.ctx.close();
      } catch {}
    }
    this.ctx = null;
  }
}

export const launchAudio = new LaunchAudioSynthesizer();
