// Tactile procedural Foley & optional warm shop ambience via Web Audio API.
// Zero external audio assets needed — works offline in PWA, Android APK, and iOS WebView.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private muted = false;
  private ambientEnabled = false;
  private ambientNodes: {
    source: AudioBufferSourceNode;
    masterGain: GainNode;
    lfo: OscillatorNode;
  } | null = null;

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private getNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.noiseBuffer && this.noiseBuffer.sampleRate === ctx.sampleRate) {
      return this.noiseBuffer;
    }
    const length = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    // Warm pink-tinted noise for realistic organic Foley
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + white * 0.029;
      b1 = 0.985 * b1 + white * 0.032;
      b2 = 0.950 * b2 + white * 0.048;
      data[i] = Math.max(-1, Math.min(1, (b0 + b1 + b2 + white * 0.18) * 1.4));
    }
    this.noiseBuffer = buffer;
    return buffer;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) {
      this.stopAmbientNodes();
    } else if (this.ambientEnabled) {
      this.startAmbientNodes();
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setAmbientEnabled(enabled: boolean): void {
    this.ambientEnabled = enabled;
    if (enabled && !this.muted) {
      this.startAmbientNodes();
    } else {
      this.stopAmbientNodes();
    }
  }

  public isAmbientEnabled(): boolean {
    return this.ambientEnabled;
  }

  private startAmbientNodes(): void {
    if (this.ambientNodes || this.muted || !this.ambientEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const source = ctx.createBufferSource();
      source.buffer = this.getNoiseBuffer(ctx);
      source.loop = true;

      // Soft warm indoor pasaj room tone (low-passed cozy hum)
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(340, ctx.currentTime);
      lowpass.Q.setValueAtTime(0.7, ctx.currentTime);

      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(65, ctx.currentTime);

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.024, ctx.currentTime + 1.2);

      // Gentle breathing modulation so ambience feels alive, never static
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.14, ctx.currentTime);
      lfoGain.gain.setValueAtTime(55, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(lowpass.frequency);

      source.connect(highpass);
      highpass.connect(lowpass);
      lowpass.connect(masterGain);
      masterGain.connect(ctx.destination);

      source.start();
      lfo.start();
      this.ambientNodes = { source, masterGain, lfo };
    } catch {
      // Ignore autoplay blocks until next user interaction
    }
  }

  private stopAmbientNodes(): void {
    if (!this.ambientNodes) return;
    try {
      const { source, masterGain, lfo } = this.ambientNodes;
      const now = this.ctx?.currentTime ?? 0;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setTargetAtTime(0.0001, now, 0.08);
      window.setTimeout(() => {
        try {
          source.stop();
          lfo.stop();
          source.disconnect();
          masterGain.disconnect();
        } catch {
          // Ignore already-stopped nodes
        }
      }, 240);
    } catch {
      // Ignore
    }
    this.ambientNodes = null;
  }

  private playNoiseBurst(
    duration: number,
    filterType: BiquadFilterType,
    freqStart: number,
    freqEnd: number,
    gainPeak: number,
    delay = 0,
    q = 1.2
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = this.getNoiseBuffer(ctx);

    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.Q.setValueAtTime(q, now);
    filter.frequency.setValueAtTime(freqStart, now);
    filter.frequency.exponentialRampToValueAtTime(Math.max(40, freqEnd), now + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(gainPeak, now + Math.min(0.014, duration * 0.25));
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    src.start(now, Math.random() * 0.8, duration + 0.04);
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainPeak = 0.08,
    delay = 0,
    freqEnd?: number
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (freqEnd !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(30, freqEnd), now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playClick(): void {
    this.playNoiseBurst(0.025, 'bandpass', 2400, 1400, 0.035, 0, 2.0);
    this.playTone(620, 0.038, 'triangle', 0.035, 0, 440);
  }

  public playDeskThud(): void {
    this.playTone(135, 0.095, 'sine', 0.11, 0, 52);
    this.playNoiseBurst(0.07, 'lowpass', 580, 140, 0.07, 0, 0.8);
  }

  public playDoorBell(): void {
    if (this.ambientEnabled && !this.ambientNodes && !this.muted) {
      this.startAmbientNodes();
    }
    this.playTone(987.77, 0.32, 'sine', 0.065, 0);
    this.playTone(1975.5, 0.18, 'sine', 0.02, 0);
    this.playTone(783.99, 0.44, 'sine', 0.075, 0.14);
    this.playTone(1567.98, 0.25, 'sine', 0.022, 0.14);
  }

  public playScanOk(): void {
    this.playTone(587.33, 0.08, 'sine', 0.055, 0);
    this.playTone(880, 0.14, 'sine', 0.065, 0.07);
  }

  public playScanDefect(): void {
    this.playTone(392, 0.11, 'sawtooth', 0.045, 0, 290);
    this.playTone(233.08, 0.19, 'sawtooth', 0.05, 0.09, 175);
  }

  public playLeverage(): void {
    this.playNoiseBurst(0.04, 'lowpass', 600, 180, 0.07, 0, 1.0);
    this.playTone(330, 0.09, 'triangle', 0.075, 0);
    this.playTone(493.88, 0.16, 'triangle', 0.08, 0.07);
  }

  public playLieCaught(): void {
    this.playTone(440, 0.09, 'triangle', 0.085, 0);
    this.playTone(554.37, 0.11, 'triangle', 0.09, 0.07);
    this.playTone(880, 0.26, 'sawtooth', 0.055, 0.14);
    this.playTone(1108.73, 0.32, 'sine', 0.065, 0.17);
  }

  public playCounterOffer(): void {
    this.playNoiseBurst(0.03, 'bandpass', 1800, 1100, 0.032, 0, 1.5);
    this.playTone(460, 0.06, 'triangle', 0.045, 0, 560);
  }

  public playCashRegister(): void {
    this.playNoiseBurst(0.09, 'bandpass', 1400, 900, 0.065, 0, 1.4);
    this.playTone(1318.5, 0.12, 'triangle', 0.075, 0.04);
    this.playTone(1760, 0.15, 'sine', 0.085, 0.095);
    this.playTone(2637.02, 0.34, 'sine', 0.07, 0.14);
    this.playTone(3951.07, 0.22, 'sine', 0.025, 0.145);
  }

  public playMoneyBurst(): void {
    this.playNoiseBurst(0.045, 'highpass', 2800, 1600, 0.045, 0);
    this.playNoiseBurst(0.045, 'highpass', 3000, 1700, 0.045, 0.055);
    this.playNoiseBurst(0.05, 'highpass', 3200, 1800, 0.04, 0.11);
    this.playCashRegister();
  }

  public playAngryLeave(): void {
    this.playNoiseBurst(0.08, 'lowpass', 420, 90, 0.08, 0.04, 0.8);
    this.playTone(320, 0.15, 'sawtooth', 0.04, 0, 210);
    this.playTone(205, 0.24, 'sawtooth', 0.04, 0.13, 130);
  }

  public playTea(): void {
    this.playTone(2680, 0.075, 'sine', 0.055, 0);
    this.playTone(3420, 0.06, 'sine', 0.032, 0.015);
    this.playTone(2950, 0.11, 'sine', 0.045, 0.09);
  }

  public playRepair(): void {
    this.playNoiseBurst(0.04, 'bandpass', 3200, 2200, 0.045, 0, 3.0);
    this.playNoiseBurst(0.09, 'bandpass', 2400, 1500, 0.035, 0.07, 1.5);
    this.playTone(523.25, 0.09, 'triangle', 0.06, 0.12);
    this.playTone(659.25, 0.1, 'triangle', 0.065, 0.19);
    this.playTone(1046.5, 0.22, 'sine', 0.075, 0.27);
  }

  public playScrewTurn(): void {
    this.playNoiseBurst(0.018, 'highpass', 3600, 2200, 0.04, 0, 2.2);
    this.playTone(1520, 0.025, 'square', 0.025, 0, 960);
  }

  public playHeatTick(): void {
    this.playNoiseBurst(0.14, 'bandpass', 950, 1300, 0.04, 0, 1.8);
    this.playTone(160, 0.12, 'sawtooth', 0.022, 0, 210);
  }

  public playConnectorSnap(): void {
    this.playNoiseBurst(0.02, 'highpass', 3000, 1800, 0.05, 0, 2.5);
    this.playTone(1180, 0.05, 'triangle', 0.06, 0, 1680);
  }

  public playQuestClaim(): void {
    this.playTone(659.25, 0.09, 'triangle', 0.07, 0);
    this.playTone(880, 0.11, 'triangle', 0.075, 0.07);
    this.playTone(1318.5, 0.24, 'sine', 0.08, 0.14);
  }

  public playDayComplete(): void {
    this.playNoiseBurst(0.09, 'bandpass', 2200, 1000, 0.045, 0, 1.1);
    this.playTone(440, 0.11, 'triangle', 0.065, 0.04);
    this.playTone(554.37, 0.12, 'triangle', 0.07, 0.13);
    this.playTone(659.25, 0.15, 'triangle', 0.075, 0.22);
    this.playTone(880, 0.32, 'sine', 0.08, 0.32);
  }

  public playLevelUp(): void {
    this.playTone(523.25, 0.12, 'triangle', 0.075, 0);
    this.playTone(659.25, 0.12, 'triangle', 0.075, 0.085);
    this.playTone(783.99, 0.14, 'triangle', 0.08, 0.17);
    this.playTone(1046.5, 0.34, 'sine', 0.095, 0.26);
    this.playTone(1318.51, 0.3, 'sine', 0.045, 0.28);
  }
}

export const soundFX = new SoundEngine();
