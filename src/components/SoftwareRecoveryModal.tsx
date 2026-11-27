import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Cpu,
  Database,
  HardDrive,
  ShieldAlert,
  Terminal,
  Usb,
  X,
  Zap,
} from 'lucide-react';
import { formatTRY } from '../game/engine';
import { useLanguage } from '../game/i18n';
import { soundFX } from '../game/sound';
import { DataRecoveryJob, PhoneDevice } from '../game/types';

interface SoftwareRecoveryModalProps {
  device: PhoneDevice;
  job: DataRecoveryJob;
  softwareCost: number;
  onComplete: (succeeded: boolean, note?: string) => void;
  onCancel?: () => void;
}

type RecoveryPhase = 'SELECT_MODE' | 'SCANNING' | 'RESULT';
type RecoveryMode = 'STANDARD' | 'DEEP_NAND';
type BlockState = 'idle' | 'ok' | 'frag' | 'bad';

const TOTAL_BLOCKS = 24;

export const SoftwareRecoveryModal: React.FC<SoftwareRecoveryModalProps> = ({
  device,
  job,
  softwareCost,
  onComplete,
  onCancel,
}) => {
  const { bi } = useLanguage();
  const [phase, setPhase] = useState<RecoveryPhase>('SELECT_MODE');
  const [mode, setMode] = useState<RecoveryMode>('STANDARD');
  const [blocks, setBlocks] = useState<BlockState[]>(() =>
    Array.from({ length: TOTAL_BLOCKS }, () => 'idle')
  );
  const [scannedCount, setScannedCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [needlePos, setNeedlePos] = useState(20);
  const [syncLocked, setSyncLocked] = useState<'none' | 'perfect' | 'good' | 'miss'>('none');
  const [finalOutcome, setFinalOutcome] = useState<{
    succeeded: boolean;
    effectiveChance: number;
    recoveredFiles: number;
    recoveredGb: string;
  } | null>(null);

  const committedRollRef = useRef<boolean | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const baseChance = Math.max(0.32, Math.min(0.92, job.softwareSuccessRate));
  const syncBonus =
    mode === 'DEEP_NAND'
      ? syncLocked === 'perfect'
        ? 0.26
        : syncLocked === 'good'
        ? 0.14
        : syncLocked === 'miss'
        ? -0.05
        : 0
      : 0;
  const effectiveChance = Math.max(0.2, Math.min(0.98, baseChance + syncBonus));

  const scanProgressPct = Math.round((scannedCount / TOTAL_BLOCKS) * 100);
  const waitingForDeepLock =
    phase === 'SCANNING' &&
    mode === 'DEEP_NAND' &&
    syncLocked === 'none' &&
    scannedCount >= 16;

  const scanMessages = useMemo(
    () => [
      bi('USB-C DFU portu algılandı...', 'USB-C DFU port detected...'),
      bi('Bootloader el sıkışması tamamlandı.', 'Bootloader handshake complete.'),
      bi('NAND bellek haritası okunuyor...', 'Reading NAND partition table...'),
      bi('Bozuk sektörler analiz ediliyor...', 'Analyzing corrupted sectors...'),
      bi('Fotoğraf & SQLite indeksleri ayrıştırılıyor...', 'Parsing photo & SQLite indexes...'),
      bi('Bütünlük doğrulaması yapılıyor...', 'Running checksum verification...'),
    ],
    [bi]
  );

  // Smooth, readable oscillating frequency needle during DEEP_NAND scanning
  useEffect(() => {
    if (phase !== 'SCANNING' || mode !== 'DEEP_NAND' || syncLocked !== 'none') return;
    startTimeRef.current = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - startTimeRef.current) / 1000;
      const pos = 50 + Math.sin(elapsed * 2.25) * 42;
      setNeedlePos(pos);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [phase, mode, syncLocked]);

  // Progressive NAND sector scan timer — blocks visually reflect the real committed roll!
  useEffect(() => {
    if (phase !== 'SCANNING') return;
    if (scannedCount >= TOTAL_BLOCKS) return;
    if (waitingForDeepLock) return;

    const timer = window.setTimeout(() => {
      soundFX.playHeatTick();
      const idx = scannedCount;
      const committed = committedRollRef.current;

      let nextState: BlockState;
      const r = Math.random();
      if (committed === true) {
        // Visually reflects clean recovery (mostly OK, some repaired FX, rare ERR)
        nextState = r < 0.78 ? 'ok' : r < 0.94 ? 'frag' : 'bad';
      } else if (committed === false) {
        // Early blocks look readable, final third reveals critical NAND corruption
        if (idx < 10) {
          nextState = r < 0.55 ? 'ok' : r < 0.8 ? 'frag' : 'bad';
        } else {
          nextState = r < 0.16 ? 'ok' : r < 0.34 ? 'frag' : 'bad';
        }
      } else {
        // Before DEEP_NAND lock, show mixed diagnostic scan
        nextState = r < 0.52 ? 'ok' : r < 0.82 ? 'frag' : 'bad';
      }

      setBlocks((prev) => {
        const copy = [...prev];
        copy[idx] = nextState;
        return copy;
      });
      setScannedCount((c) => c + 1);

      if (idx % 4 === 0) {
        const msgIdx = Math.min(scanMessages.length - 1, Math.floor(idx / 4));
        setLogs((prev) => [...prev.slice(-4), scanMessages[msgIdx]]);
      }
    }, 135);

    return () => window.clearTimeout(timer);
  }, [phase, scannedCount, waitingForDeepLock, scanMessages]);

  // Finalize result once all 24 sectors finish scanning
  useEffect(() => {
    if (phase !== 'SCANNING' || scannedCount < TOTAL_BLOCKS || finalOutcome) return;
    if (mode === 'DEEP_NAND' && syncLocked === 'none') return;

    const timer = window.setTimeout(() => {
      const rolled =
        committedRollRef.current !== null
          ? committedRollRef.current
          : Math.random() < effectiveChance;
      const recoveredFiles = rolled ? 420 + Math.floor(Math.random() * 1400) : 0;
      const recoveredGb = rolled ? (4.2 + Math.random() * 18.5).toFixed(1) : '0.0';
      if (rolled) {
        soundFX.playCashRegister();
      } else {
        soundFX.playScanDefect();
      }
      setFinalOutcome({
        succeeded: rolled,
        effectiveChance,
        recoveredFiles,
        recoveredGb,
      });
      setPhase('RESULT');
    }, 260);

    return () => window.clearTimeout(timer);
  }, [phase, scannedCount, finalOutcome, mode, syncLocked, effectiveChance]);

  const handleStartScan = () => {
    soundFX.playConnectorSnap();
    setBlocks(Array.from({ length: TOTAL_BLOCKS }, () => 'idle'));
    setScannedCount(0);
    setSyncLocked('none');
    setFinalOutcome(null);
    // In STANDARD mode, commit the RNG immediately so the 24-block scan honestly depicts the result.
    // In DEEP_NAND mode, wait until the player locks the voltage frequency!
    committedRollRef.current = mode === 'STANDARD' ? Math.random() < baseChance : null;
    setLogs([
      bi(
        `${device.brand} ${device.model} kurtarma oturumu başlatıldı (${formatTRY(softwareCost)})`,
        `${device.brand} ${device.model} recovery session started (${formatTRY(softwareCost)})`
      ),
    ]);
    setPhase('SCANNING');
  };

  const handleLockFrequency = () => {
    if (syncLocked !== 'none') return;
    const dist = Math.abs(needlePos - 50);
    let nextSync: 'perfect' | 'good' | 'miss';
    let bonus: number;

    if (dist <= 15) {
      soundFX.playScanOk();
      nextSync = 'perfect';
      bonus = 0.26;
      setLogs((prev) => [
        ...prev.slice(-4),
        bi('✓ NAND voltaj senkronu MÜKEMMEL (+%26 şans)!', '✓ NAND voltage sync PERFECT (+26% chance)!'),
      ]);
    } else if (dist <= 28) {
      soundFX.playClick();
      nextSync = 'good';
      bonus = 0.14;
      setLogs((prev) => [
        ...prev.slice(-4),
        bi('✓ Voltaj dengelendi (+%14 şans).', '✓ Voltage stabilized (+14% chance).'),
      ]);
    } else {
      soundFX.playScanDefect();
      nextSync = 'miss';
      bonus = -0.05;
      setLogs((prev) => [
        ...prev.slice(-4),
        bi('⚠ Frekans kaydı! Sektör okuması zorlaştı (-%5 şans).', '⚠ Frequency drift! Sector read unstable (-5% chance).'),
      ]);
    }

    const rolledChance = Math.max(0.2, Math.min(0.98, baseChance + bonus));
    committedRollRef.current = Math.random() < rolledChance;
    setSyncLocked(nextSync);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-1 sm:p-1.5">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-xl h-[95dvh] max-h-[450px] rounded-xl border border-sky-400/35 bg-[#0E1520] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between gap-2 border-b border-white/10 bg-[#121C2A] px-3 py-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-500/15 border border-sky-400/35 text-sky-300 shrink-0">
              <Database className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="font-display text-xs font-extrabold text-slate-50 truncate">
                {bi('Veri Kurtarma Yazılım İstasyonu', 'Software Data Recovery Station')} · {job.title}
              </div>
              <div className="text-[9.5px] text-slate-400 truncate tabular-nums">
                {device.brand} {device.model} · {bi('Lisans Ücreti', 'Tool Fee')}: {formatTRY(softwareCost)} ·{' '}
                {bi('Ödül', 'Payout')}: +{formatTRY(job.softwarePayout)}
              </div>
            </div>
          </div>
          {phase === 'SELECT_MODE' && onCancel && (
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                onCancel();
              }}
              aria-label={bi('Vazgeç', 'Cancel')}
              className="flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-[#1B2533] text-slate-300 hover:text-white cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Strict Zero-Scroll 2-Column Body */}
        <div className="flex-1 min-h-0 grid grid-cols-12 gap-2 p-2 overflow-hidden">
          {/* LEFT: Live NAND Memory Sector Matrix & Terminal Log */}
          <div className="col-span-5 flex flex-col justify-between gap-1.5 rounded-xl border border-white/10 bg-[#0A1019] p-2 min-h-0 overflow-hidden">
            <div className="flex items-center justify-between text-[10px] font-mono tabular-nums">
              <span className="inline-flex items-center gap-1 font-bold text-sky-300">
                <HardDrive className="w-3.5 h-3.5" />
                {bi('NAND Bellek Blokları', 'NAND Sector Map')}
              </span>
              <span className="text-slate-400">
                {scannedCount}/{TOTAL_BLOCKS}
              </span>
            </div>

            {/* 6x4 Sector Matrix */}
            <div className="grid grid-cols-6 gap-1.5 py-1">
              {blocks.map((st, i) => (
                <div
                  key={i}
                  className={`h-6 sm:h-7 rounded border font-mono text-[9px] font-bold flex items-center justify-center transition-colors ${
                    st === 'idle'
                      ? 'border-white/10 bg-[#131D2B] text-slate-500'
                      : st === 'ok'
                      ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-300'
                      : st === 'frag'
                      ? 'border-amber-400/50 bg-amber-500/20 text-amber-300'
                      : 'border-rose-500/55 bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {st === 'idle' ? (i + 1).toString().padStart(2, '0') : st === 'ok' ? 'OK' : st === 'frag' ? 'FX' : 'ERR'}
                </div>
              ))}
            </div>

            {/* Progress Bar + Mini Terminal */}
            <div className="space-y-1.5">
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full transition-all duration-150 ${
                    phase === 'RESULT'
                      ? finalOutcome?.succeeded
                        ? 'bg-emerald-400'
                        : 'bg-rose-500'
                      : 'bg-sky-400'
                  }`}
                  style={{ width: `${scanProgressPct}%` }}
                />
              </div>
              <div className="rounded-lg border border-white/8 bg-[#060A10] p-2 font-mono text-[9.5px] text-slate-300 space-y-0.5 min-h-[68px]">
                <div className="flex items-center gap-1 text-sky-400 font-bold mb-0.5">
                  <Terminal className="w-3 h-3" />
                  <span>PasajFlash v4.2</span>
                </div>
                {logs.length === 0 ? (
                  <div className="text-slate-500">
                    {bi('USB-C bağlantısı bekleniyor...', 'Waiting for USB-C link...')}
                  </div>
                ) : (
                  logs.slice(-3).map((line, idx) => (
                    <div key={idx} className="truncate">
                      &gt; {line}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Interactive Recovery Controls */}
          <div className="col-span-7 flex flex-col justify-between gap-1.5 min-h-0 overflow-hidden">
            {phase === 'SELECT_MODE' && (
              <>
                <div className="space-y-2">
                  <div className="text-xs font-extrabold text-sky-300">
                    {bi('1. Kurtarma Yöntemini Seç', '1. Choose Software Recovery Mode')}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    {bi(
                      'Yazılımla veri kurtarma garantili değildir — olursa yüksek kazanç bırakır, bellek çok hasarlıysa lisans ücreti yanar.',
                      'Software recovery is never guaranteed — succeed for high profit, or lose the tool fee if NAND damage is too deep.'
                    )}
                  </p>

                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setMode('STANDARD');
                      }}
                      className={`rounded-xl border p-2.5 text-left transition-colors cursor-pointer ${
                        mode === 'STANDARD'
                          ? 'border-sky-400 bg-sky-500/15'
                          : 'border-white/10 bg-[#151F2E] hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-100 inline-flex items-center gap-1.5">
                          <Usb className="w-3.5 h-3.5 text-sky-400" />
                          {bi('Standart Sektör Tarama', 'Standard Sector Scan')}
                        </span>
                        <span className="font-mono text-xs font-extrabold text-sky-300 tabular-nums">
                          %{Math.round(baseChance * 100)}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {bi(
                          'Otomatik blok okuma. Ekstra risk olmadan temel kurtarma olasılığıyla dener.',
                          'Automated sector read. Attempts recovery at the base success probability.'
                        )}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setMode('DEEP_NAND');
                      }}
                      className={`rounded-xl border p-2.5 text-left transition-colors cursor-pointer ${
                        mode === 'DEEP_NAND'
                          ? 'border-amber-400 bg-amber-500/15'
                          : 'border-white/10 bg-[#151F2E] hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-100 inline-flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-amber-400" />
                          {bi('Derin NAND Senkronizasyonu (Usta Müdahalesi)', 'Deep NAND Sync (Manual Tune)')}
                        </span>
                        <span className="font-mono text-xs font-extrabold text-amber-300 tabular-nums">
                          %{Math.round(baseChance * 100)} → %{Math.min(98, Math.round((baseChance + 0.26) * 100))}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {bi(
                          'Tarama sırasında frekansı yeşil bölgede yakalarsan +%26 şans kazanırsın (sarı +%14); kaçırırsan -%5!',
                          'Lock the frequency in the green zone during scan for +26% chance (amber +14%); miss for -5%!'
                        )}
                      </p>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {onCancel && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        onCancel();
                      }}
                      className="rounded-xl border border-white/12 bg-[#1A2433] px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
                    >
                      {bi('Vazgeç', 'Cancel')}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleStartScan}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-sky-500 py-2 px-4 text-xs font-extrabold text-slate-950 hover:bg-sky-400 cursor-pointer tabular-nums"
                  >
                    <Zap className="w-4 h-4" />
                    {bi(
                      `Yazılımı Çalıştır & Dene (${formatTRY(softwareCost)})`,
                      `Run Recovery Software (${formatTRY(softwareCost)})`
                    )}
                  </button>
                </div>
              </>
            )}

            {phase === 'SCANNING' && (
              <div className="flex-1 flex flex-col justify-center gap-3">
                <div className="rounded-xl border border-sky-400/30 bg-sky-500/8 p-3 space-y-1.5 tabular-nums">
                  <div className="flex items-center justify-between text-xs font-extrabold text-sky-200">
                    <span>
                      {waitingForDeepLock
                        ? bi('⚡ Frekans Kilidi Bekleniyor!', '⚡ Waiting for Frequency Lock!')
                        : bi('Bellek Sektörleri Taranıyor...', 'Scanning Memory Sectors...')}
                    </span>
                    <span className="font-mono text-amber-300">
                      {bi('Başarı Şansı', 'Success Odds')}: %{Math.round(effectiveChance * 100)}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-300">
                    {mode === 'DEEP_NAND' && syncLocked === 'none'
                      ? bi(
                          'İbre ortadaki geniş yeşil bölgedeyken "Frekansı Kilitle" butonuna bas!',
                          'Tap "Lock Frequency" when the needle enters the green center!'
                        )
                      : bi(
                          'Bozuk bloklar kurtarılıyor — sonuç tüm bloklar okununca netleşecek.',
                          'Reconstructing damaged blocks — result reveals when all sectors finish.'
                        )}
                  </p>
                </div>

                {mode === 'DEEP_NAND' && (
                  <div className="rounded-xl border border-white/10 bg-[#151F2E] p-3 space-y-2.5">
                    <div className="relative h-8 rounded-lg bg-[#0A1019] border border-white/10 overflow-hidden">
                      {/* Green center sweet spot (dist <= 15 -> 35% to 65%) */}
                      <div
                        className="absolute inset-y-0 bg-emerald-500/30 border-x-2 border-emerald-400"
                        style={{ left: '35%', width: '30%' }}
                      />
                      {/* Yellow good zone (dist <= 28 -> 22% to 35% and 65% to 78%) */}
                      <div
                        className="absolute inset-y-0 bg-amber-500/18"
                        style={{ left: '22%', width: '13%' }}
                      />
                      <div
                        className="absolute inset-y-0 bg-amber-500/18"
                        style={{ left: '65%', width: '13%' }}
                      />
                      {/* Moving needle */}
                      <div
                        className="absolute top-0 bottom-0 w-2 rounded bg-white shadow-[0_0_12px_#38BDF8]"
                        style={{ left: `calc(${needlePos}% - 4px)` }}
                      />
                    </div>

                    {syncLocked === 'none' ? (
                      <button
                        type="button"
                        onClick={handleLockFrequency}
                        className={`w-full rounded-xl bg-amber-500 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-amber-400 active:scale-[0.98] cursor-pointer ${
                          waitingForDeepLock ? 'animate-pulse ring-2 ring-amber-300' : ''
                        }`}
                      >
                        {bi('⚡ Frekansı Kilitle (Yeşil +%26 · Sarı +%14)', '⚡ Lock Frequency (Green +26% · Amber +14%)')}
                      </button>
                    ) : (
                      <div
                        className={`rounded-lg px-2.5 py-1.5 text-center text-xs font-extrabold ${
                          syncLocked === 'perfect'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/35'
                            : syncLocked === 'good'
                            ? 'bg-sky-500/15 text-sky-300 border border-sky-400/35'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-400/35'
                        }`}
                      >
                        {syncLocked === 'perfect'
                          ? bi('✓ Mükemmel Senkron (+%26 Başarı Şansı)', '✓ Perfect Sync (+26% Chance)')
                          : syncLocked === 'good'
                          ? bi('✓ Dengeli Senkron (+%14 Başarı Şansı)', '✓ Good Sync (+14% Chance)')
                          : bi('⚠ Senkron Kaçtı (-%5 Başarı Şansı)', '⚠ Sync Missed (-5% Chance)')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {phase === 'RESULT' && finalOutcome && (
              <div className="flex-1 flex flex-col justify-between gap-2.5">
                <div
                  className={`flex-1 rounded-xl border p-3.5 flex flex-col items-center justify-center text-center gap-2 ${
                    finalOutcome.succeeded
                      ? 'border-emerald-400/45 bg-emerald-500/10'
                      : 'border-rose-500/45 bg-rose-500/10'
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full border-2 ${
                      finalOutcome.succeeded
                        ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                        : 'border-rose-400 bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {finalOutcome.succeeded ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <ShieldAlert className="w-6 h-6" />
                    )}
                  </div>
                  <div className="font-display text-base font-extrabold text-slate-50">
                    {finalOutcome.succeeded
                      ? bi('Veriler Başarıyla Kurtarıldı!', 'Data Successfully Recovered!')
                      : bi('Yazılım Yetmedi — Kurtarma Başarısız', 'Software Failed — NAND Unreadable')}
                  </div>
                  <p className="text-[11px] text-slate-300 max-w-md leading-snug">
                    {finalOutcome.succeeded
                      ? bi(
                          `${finalOutcome.recoveredFiles} dosya (${finalOutcome.recoveredGb} GB) sorunsuz aktarıldı. Müşteri ödemeye hazır!`,
                          `${finalOutcome.recoveredFiles} files (${finalOutcome.recoveredGb} GB) extracted cleanly. Customer is ready to pay!`
                        )
                      : bi(
                          'Kritik NAND bellek blokları fiziksel hasarlı çıktı. Yazılım lisansı harcandı ama veriler alınamadı.',
                          'Critical NAND memory sectors are physically damaged. Tool license spent, data could not be recovered.'
                        )}
                  </p>
                  <div className="flex items-center gap-3 text-[10.5px] font-mono tabular-nums text-slate-300">
                    <span>
                      {bi('Hesaplanan Şans', 'Effective Odds')}: %{Math.round(finalOutcome.effectiveChance * 100)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className={finalOutcome.succeeded ? 'text-emerald-300 font-bold' : 'text-rose-300 font-bold'}>
                      {finalOutcome.succeeded
                        ? `+${formatTRY(job.softwarePayout)}`
                        : `-${formatTRY(softwareCost)}`}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    onComplete(finalOutcome.succeeded);
                  }}
                  className={`w-full rounded-xl py-2.5 text-xs font-extrabold cursor-pointer ${
                    finalOutcome.succeeded
                      ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                      : 'bg-rose-500 text-white hover:bg-rose-400'
                  }`}
                >
                  {finalOutcome.succeeded
                    ? bi(`Verileri Teslim Et (+${formatTRY(job.softwarePayout)})`, `Deliver Files (+${formatTRY(job.softwarePayout)})`)
                    : bi('Sonucu Müşteriye Bildir', 'Inform Customer')}
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
