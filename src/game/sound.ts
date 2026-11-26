// Tactile procedural Foley, warm shop ambience, & Vintage Pasaj Radio via Web Audio API.
// Zero external audio assets needed — works offline in PWA, Android APK, and iOS WebView.
import { RadioStationId } from './types';

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
  private radioStation: RadioStationId = 'OFF';
  private radioStep = 0;
  private radioTimer: number | null = null;
  private radioBedNodes: {
    source: AudioBufferSourceNode;
    gain: GainNode;
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
      this.stopRadioEngine();
    } else {
      if (this.ambientEnabled) {
        this.startAmbientNodes();
      }
      if (this.radioStation !== 'OFF') {
        this.startRadioEngine();
      }
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

  public getRadioStation(): RadioStationId {
    return this.radioStation;
  }

  public playRadioStaticBurst(): void {
    this.playNoiseBurst(0.18, 'bandpass', 1650, 880, 0.055, 0, 1.4);
    this.playTone(980, 0.05, 'sine', 0.025, 0.04, 1420);
  }

  public setRadioStation(station: RadioStationId): void {
    const changed = this.radioStation !== station;
    this.radioStation = station;
    this.stopRadioEngine();
    if (changed && !this.muted) {
      this.playRadioStaticBurst();
    }
    if (station !== 'OFF' && !this.muted) {
      this.radioStep = 0;
      this.startRadioEngine();
    }
  }

  private startRadioEngine(): void {
    if (this.muted || this.radioStation === 'OFF') return;
    if (this.radioTimer !== null) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    // 1. Subtle warm AM/cassette Pasaj radio static bed (changes overall shop acoustics!)
    try {
      const src = ctx.createBufferSource();
      src.buffer = this.getNoiseBuffer(ctx);
      src.loop = true;

      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(
        this.radioStation === 'ARABESK' ? 1050 : 1450,
        ctx.currentTime
      );
      bp.Q.setValueAtTime(1.1, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.011, ctx.currentTime + 0.6);

      src.connect(bp);
      bp.connect(gain);
      gain.connect(ctx.destination);
      src.start();
      this.radioBedNodes = { source: src, gain };
    } catch {
      // Ignore autoplay blocks until next tap
    }

    // 2. Procedural FM melody & chord loop tailored to station mood
    // Arabesk: soulful slow Hicaz scale (D4, Eb4, F#4, G4, A4, Bb4, C5, D5)
    const arabeskLead = [
      293.66, 369.99, 392.0, 440.0, 466.16, 440.0, 392.0, 369.99,
      311.13, 369.99, 392.0, 369.99, 311.13, 293.66, 0, 293.66,
    ];
    const arabeskBass = [146.83, 146.83, 155.56, 146.83, 196.0, 155.56, 146.83, 146.83];

    // 90s Turkish Pop: catchy upbeat nostalgic Am - F - C - G synth groove
    const pop90Lead = [
      440.0, 523.25, 659.25, 587.33, 523.25, 440.0, 392.0, 440.0,
      349.23, 440.0, 523.25, 659.25, 587.33, 493.88, 440.0, 392.0,
    ];
    const pop90Bass = [220.0, 220.0, 174.61, 174.61, 261.63, 261.63, 196.0, 196.0];

    const stepMs = this.radioStation === 'ARABESK' ? 540 : 310;

    const playRadioNote = (
      freq: number,
      dur: number,
      wave: OscillatorType,
      peak: number,
      filterFreq: number
    ) => {
      const c = this.ensureContext();
      if (!c || freq <= 0) return;
      const now = c.currentTime;
      const osc = c.createOscillator();
      const flt = c.createBiquadFilter();
      const g = c.createGain();

      osc.type = wave;
      osc.frequency.setValueAtTime(freq, now);

      // Warm vintage speaker bandpass feel
      flt.type = 'lowpass';
      flt.frequency.setValueAtTime(filterFreq, now);
      flt.Q.setValueAtTime(0.9, now);

      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(peak, now + 0.035);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      osc.connect(flt);
      flt.connect(g);
      g.connect(c.destination);
      osc.start(now);
      osc.stop(now + dur + 0.04);
    };

    const tick = () => {
      if (this.muted || this.radioStation === 'OFF') {
        this.stopRadioEngine();
        return;
      }
      const idx = this.radioStep;
      this.radioStep += 1;

      if (this.radioStation === 'ARABESK') {
        const note = arabeskLead[idx % arabeskLead.length];
        if (note > 0) {
          playRadioNote(note, 0.48, 'sawtooth', 0.017, 1350);
          playRadioNote(note * 0.5, 0.52, 'triangle', 0.012, 900);
        }
        if (idx % 2 === 0) {
          const bass = arabeskBass[Math.floor(idx / 2) % arabeskBass.length];
          playRadioNote(bass, 0.9, 'sine', 0.022, 420);
        }
      } else {
        const note = pop90Lead[idx % pop90Lead.length];
        if (note > 0) {
          playRadioNote(note, 0.24, 'triangle', 0.022, 2100);
        }
        if (idx % 2 === 0) {
          const bass = pop90Bass[Math.floor(idx / 2) % pop90Bass.length];
          playRadioNote(bass, 0.45, 'sine', 0.024, 520);
        }
        if (idx % 4 === 2) {
          // Soft retro snare/hi-hat brush
          this.playNoiseBurst(0.04, 'highpass', 3200, 1800, 0.012, 0, 1.2);
        }
      }
    };

    tick();
    this.radioTimer = window.setInterval(tick, stepMs);
  }

  private stopRadioEngine(): void {
    if (this.radioTimer !== null) {
      window.clearInterval(this.radioTimer);
      this.radioTimer = null;
    }
    if (this.radioBedNodes) {
      try {
        const { source, gain } = this.radioBedNodes;
        const now = this.ctx?.currentTime ?? 0;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setTargetAtTime(0.0001, now, 0.05);
        window.setTimeout(() => {
          try {
            source.stop();
            source.disconnect();
            gain.disconnect();
          } catch {
            // Ignore already stopped
          }
        }, 160);
      } catch {
        // Ignore
      }
      this.radioBedNodes = null;
    }
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
    if (this.radioStation !== 'OFF' && this.radioTimer === null && !this.muted) {
      this.startRadioEngine();
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
    this.playNoiseBurst(0.032, 'bandpass', 1950, 1150, 0.038, 0, 1.6);
    this.playTone(440, 0.055, 'triangle', 0.05, 0, 587.33);
    this.playTone(659.25, 0.055, 'sine', 0.032, 0.045, 620);
  }

  public playCashRegister(): void {
    this.playNoiseBurst(0.09, 'bandpass', 1400, 900, 0.065, 0, 1.4);
    this.playTone(1318.5, 0.12, 'triangle', 0.075, 0.04);
    this.playTone(1760, 0.15, 'sine', 0.085, 0.095);
    this.playTone(2637.02, 0.34, 'sine', 0.07, 0.14);
    this.playTone(3951.07, 0.22, 'sine', 0.025, 0.145);
  }

  public playBargainSuccess(): void {
    // Crisp celebratory handshake slap + triumphant ascending brass/bell arpeggio + register chime
    this.playNoiseBurst(0.045, 'lowpass', 720, 220, 0.085, 0, 1.0);
    this.playTone(523.25, 0.09, 'triangle', 0.075, 0.03);
    this.playTone(659.25, 0.1, 'triangle', 0.08, 0.095);
    this.playTone(783.99, 0.12, 'triangle', 0.085, 0.16);
    this.playTone(1046.5, 0.28, 'sine', 0.09, 0.22);
    this.playTone(2093.0, 0.22, 'sine', 0.035, 0.24);
  }

  public playMoneyBurst(): void {
    this.playNoiseBurst(0.045, 'highpass', 2800, 1600, 0.045, 0);
    this.playNoiseBurst(0.045, 'highpass', 3000, 1700, 0.045, 0.055);
    this.playNoiseBurst(0.05, 'highpass', 3200, 1800, 0.04, 0.11);
    this.playCashRegister();
  }

  public playCustomerAngry(): void {
    // Impatient desk knock + tense minor-second brassy grumble
    this.playTone(150, 0.08, 'sine', 0.1, 0, 75);
    this.playNoiseBurst(0.06, 'lowpass', 540, 160, 0.075, 0, 1.0);
    this.playTone(311.13, 0.13, 'sawtooth', 0.048, 0.05, 277.18);
    this.playTone(261.63, 0.19, 'sawtooth', 0.046, 0.14, 196.0);
  }

  public playAngryLeave(): void {
    // Heavy impatient huff + angry descending drop + shop door slam & rattling bell
    this.playNoiseBurst(0.11, 'bandpass', 950, 320, 0.065, 0, 1.2);
    this.playTone(330, 0.14, 'sawtooth', 0.05, 0.02, 220);
    this.playTone(215, 0.22, 'sawtooth', 0.05, 0.13, 125);
    this.playTone(110, 0.16, 'sine', 0.12, 0.24, 48);
    this.playNoiseBurst(0.09, 'lowpass', 460, 85, 0.095, 0.24, 0.8);
    this.playTone(1480, 0.11, 'sine', 0.025, 0.29, 1390);
  }

  public playTea(): void {
    // Warm Turkish tea pouring into ince belli glass + iconic triple spoon clink (ting-ting-ting!)
    this.playNoiseBurst(0.24, 'bandpass', 1100, 2650, 0.036, 0, 2.2);
    this.playTone(1650, 0.045, 'sine', 0.02, 0.08, 2200);
    // Crisp glass spoon clinks with bright harmonic shimmer
    this.playTone(2720, 0.08, 'sine', 0.06, 0.18);
    this.playTone(4120, 0.055, 'sine', 0.026, 0.185);
    this.playTone(2860, 0.08, 'sine', 0.058, 0.28);
    this.playTone(4320, 0.055, 'sine', 0.024, 0.285);
    this.playTone(2980, 0.13, 'sine', 0.055, 0.38);
    // Gentle saucer set-down tap
    this.playTone(220, 0.05, 'triangle', 0.04, 0.45, 140);
  }

  public playKeypadTone(key: string): void {
    // Authentic ITU-T DTMF dual-tone keypad phone beeps
    const dtmf: Record<string, [number, number]> = {
      '1': [697, 1209],
      '2': [697, 1336],
      '3': [697, 1477],
      '4': [770, 1209],
      '5': [770, 1336],
      '6': [770, 1477],
      '7': [852, 1209],
      '8': [852, 1336],
      '9': [852, 1477],
      '*': [941, 1209],
      '0': [941, 1336],
      '#': [941, 1477],
    };
    const pair = dtmf[key] ?? [770, 1336];
    this.playTone(pair[0], 0.075, 'sine', 0.048, 0);
    this.playTone(pair[1], 0.075, 'sine', 0.042, 0);
  }

  public playDramaStinger(): void {
    // Dramatic warm pasaj cinema chord swell for Esnaf Draması story arcs
    this.playNoiseBurst(0.14, 'lowpass', 620, 200, 0.045, 0, 0.9);
    this.playTone(220, 0.42, 'triangle', 0.065, 0);
    this.playTone(261.63, 0.4, 'triangle', 0.055, 0.06);
    this.playTone(329.63, 0.45, 'sine', 0.06, 0.13);
    this.playTone(440, 0.52, 'sine', 0.055, 0.21);
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
