// Procedural Web Audio API sound effects engine for GSM Simulator
// Zero external audio files needed; unlocks automatically on first user gesture.

class PasajSoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(val: boolean): void {
    this.muted = val;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (!this.muted) {
      this.playClick();
    }
    return this.muted;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.08,
    delay = 0,
    endFreq?: number
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(40, endFreq),
        now + duration
      );
    }
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playClick(): void {
    this.playTone(540, 0.045, 'triangle', 0.045, 0, 380);
  }

  public playDoorBell(): void {
    // Classic Turkish shop brass door chime (ding-dong)
    this.playTone(1318.5, 0.16, 'sine', 0.05, 0);
    this.playTone(1046.5, 0.24, 'sine', 0.055, 0.13);
  }

  public playDeskThud(): void {
    // Soft weighted phone landing on ESD desk mat
    this.playTone(135, 0.09, 'sine', 0.085, 0, 58);
    this.playTone(260, 0.04, 'triangle', 0.035, 0.01, 140);
  }

  public playScrewTurn(): void {
    // Crisp micro screwdriver click + spin
    this.playTone(920, 0.035, 'square', 0.028, 0, 620);
    this.playTone(1240, 0.04, 'triangle', 0.035, 0.035, 1480);
  }

  public playHeatTick(): void {
    // Gentle hot air station pulse
    this.playTone(190, 0.06, 'sawtooth', 0.018, 0, 215);
  }

  public playConnectorSnap(): void {
    // Tactile FPC flex connector snap
    this.playTone(1480, 0.035, 'triangle', 0.055, 0, 1980);
    this.playTone(880, 0.05, 'sine', 0.045, 0.03, 1180);
  }

  public playScanOk(): void {
    this.playTone(680, 0.07, 'sine', 0.06, 0);
    this.playTone(980, 0.11, 'sine', 0.06, 0.065);
  }

  public playScanDefect(): void {
    this.playTone(310, 0.11, 'sawtooth', 0.055, 0, 220);
    this.playTone(215, 0.16, 'sawtooth', 0.055, 0.1, 165);
  }

  public playTea(): void {
    // Porcelain clink + warm comforting chime
    this.playTone(1760, 0.06, 'sine', 0.045, 0, 1620);
    this.playTone(523.25, 0.14, 'triangle', 0.06, 0.05);
    this.playTone(659.25, 0.18, 'triangle', 0.06, 0.13);
  }

  public playLeverage(): void {
    // Punchy desk tap + sharp reveal
    this.playTone(150, 0.09, 'square', 0.07, 0, 72);
    this.playTone(620, 0.12, 'triangle', 0.065, 0.05, 780);
  }

  public playCounterOffer(): void {
    this.playTone(420, 0.07, 'triangle', 0.05, 0);
    this.playTone(490, 0.09, 'triangle', 0.05, 0.07);
  }

  public playCashRegister(): void {
    // Classic crisp cash register bell + coin shimmer
    this.playTone(1046.5, 0.09, 'triangle', 0.07, 0);
    this.playTone(1318.5, 0.12, 'triangle', 0.075, 0.065);
    this.playTone(2093, 0.28, 'sine', 0.06, 0.13);
  }

  public playQuestClaim(): void {
    const notes = [659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.15, 'triangle', 0.065, idx * 0.065);
    });
  }

  public playLevelUp(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1567.98];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.22, 'triangle', 0.07, idx * 0.08);
    });
  }

  public playRepair(): void {
    // Precision driver whir + sparkling completion
    this.playTone(240, 0.09, 'sawtooth', 0.04, 0, 390);
    this.playTone(587.33, 0.1, 'triangle', 0.06, 0.09);
    this.playTone(880, 0.18, 'sine', 0.065, 0.16);
  }

  public playAngryLeave(): void {
    this.playTone(290, 0.12, 'sawtooth', 0.06, 0, 190);
    this.playTone(165, 0.22, 'sawtooth', 0.065, 0.11, 95);
  }

  public playDayComplete(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.2, 'triangle', 0.065, idx * 0.085);
    });
  }
}

export const soundFX = new PasajSoundEngine();
