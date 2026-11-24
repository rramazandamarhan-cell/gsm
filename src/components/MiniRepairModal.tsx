import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Award,
  BatteryCharging,
  Check,
  Cpu,
  Droplets,
  Flame,
  Plug,
  Sparkles,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { DEFECT_CATALOG } from '../game/catalog';
import { formatTRY } from '../game/engine';
import { getLocalizedDefect, useLanguage } from '../game/i18n';
import { soundFX } from '../game/sound';
import { DefectId, LegacyPathId, PhoneDevice } from '../game/types';

interface MiniRepairModalProps {
  phone: PhoneDevice;
  defectId?: DefectId;
  defectIds?: DefectId[];
  cost: number;
  legacyPath?: LegacyPathId;
  isExpressJob?: boolean;
  onSuccess: (masterCrafted: boolean) => void;
  onCancel: () => void;
}

const SCREW_COORDS: { x: number; y: number; tr: string; en: string }[] = [
  { x: 24, y: 24, tr: 'Sol üst Pentalobe vida', en: 'Top-left Pentalobe screw' },
  { x: 176, y: 24, tr: 'Sağ üst Pentalobe vida', en: 'Top-right Pentalobe screw' },
  { x: 24, y: 120, tr: 'Sol orta Y-tipi vida', en: 'Mid-left tri-point screw' },
  { x: 176, y: 120, tr: 'Sağ orta Y-tipi vida', en: 'Mid-right tri-point screw' },
  { x: 24, y: 216, tr: 'Sol alt kasa vidası', en: 'Bottom-left chassis screw' },
  { x: 176, y: 216, tr: 'Sağ alt kasa vidası', en: 'Bottom-right chassis screw' },
];

const CORROSION_SPOTS = [
  { id: 0, x: 76, y: 78, tr: 'Güç entegresi oksidasyonu', en: 'PMIC oxidation spot' },
  { id: 1, x: 126, y: 108, tr: 'Şarj soketi hattı oksidasyonu', en: 'Charging bus oxidation' },
  { id: 2, x: 96, y: 156, tr: 'Anakart köprü oksidasyonu', en: 'Logic board bridge oxidation' },
];

export const MiniRepairModal: React.FC<MiniRepairModalProps> = ({
  phone,
  defectId,
  defectIds,
  cost,
  legacyPath,
  isExpressJob = false,
  onSuccess,
  onCancel,
}) => {
  const { lang, bi } = useLanguage();
  const activeDefectIds: DefectId[] =
    defectIds && defectIds.length > 0
      ? defectIds
      : defectId
      ? [defectId]
      : ['screen_crack'];
  const primaryDefectId = activeDefectIds[0];
  const def = getLocalizedDefect(primaryDefectId, lang);
  const multiCount = activeDefectIds.length;
  const combinedLabel =
    multiCount === 1
      ? def.name
      : bi(
          `${multiCount} Arıza Tek Oturumda (${activeDefectIds
            .map((d) => getLocalizedDefect(d, lang).shortLabel)
            .join(' + ')})`,
          `${multiCount} Faults in One Session (${activeDefectIds
            .map((d) => getLocalizedDefect(d, lang).shortLabel)
            .join(' + ')})`
        );
  const combinedShort =
    multiCount === 1
      ? def.shortLabel
      : bi(`${multiCount} Arızalı Modül`, `${multiCount} Faulty Modules`);
  const isLiquid = activeDefectIds.includes('liquid_damage');
  const hasBatteryDefect = activeDefectIds.some(
    (d) => d === 'battery_degraded' || d === 'battery_fake_chip'
  );
  const hasCameraDefect = activeDefectIds.includes('camera_fog');
  const isExApprentice = legacyPath === 'EX_APPRENTICE';
  const calMin = isExApprentice ? 28 : 34;
  const calMax = isExApprentice ? 72 : 66;

  const stepMeta = [
    { id: 1, label: bi('Isı & Conta', 'Heat Seal') },
    { id: 2, label: bi('6 Vida', '6 Screws') },
    { id: 3, label: bi('Flex & Söküm', 'Flex & Pull') },
    { id: 4, label: bi('Montaj / IPA', 'Mount / IPA') },
    { id: 5, label: bi('Kalibrasyon', 'Calibrate') },
  ] as const;

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [heatProgress, setHeatProgress] = useState(0);
  const [isHeating, setIsHeating] = useState(false);
  const [screwsRemoved, setScrewsRemoved] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const [batteryFlexDisconnected, setBatteryFlexDisconnected] = useState(false);
  const [partExtracted, setPartExtracted] = useState(false);
  const [corrosionCleaned, setCorrosionCleaned] = useState<boolean[]>([
    false,
    false,
    false,
  ]);
  const [oemMounted, setOemMounted] = useState(false);
  const [batteryFlexReconnected, setBatteryFlexReconnected] = useState(false);
  const [needlePos, setNeedlePos] = useState(15);
  const [calibrated, setCalibrated] = useState<'idle' | 'perfect' | 'good'>('idle');
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (step !== 1 || !isHeating) return;
    const stepInc = isExApprentice ? 11 : 7;
    const interval = window.setInterval(() => {
      soundFX.playHeatTick();
      setHeatProgress((prev) => {
        const next = Math.min(100, prev + stepInc);
        if (next >= 100) {
          setIsHeating(false);
          soundFX.playScanOk();
          window.setTimeout(() => setStep(2), 280);
        }
        return next;
      });
    }, 80);
    return () => window.clearInterval(interval);
  }, [step, isHeating, isExApprentice]);

  useEffect(() => {
    if (step !== 5 || calibrated !== 'idle') return;
    startTimeRef.current = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - startTimeRef.current) / 1000;
      const pos = 50 + Math.sin(elapsed * 3.25) * 45;
      setNeedlePos(pos);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [step, calibrated]);

  const handleRemoveScrew = (idx: number) => {
    if (screwsRemoved[idx]) return;
    soundFX.playScrewTurn();
    const next = [...screwsRemoved];
    next[idx] = true;
    setScrewsRemoved(next);
    if (next.every(Boolean)) {
      soundFX.playScanOk();
      window.setTimeout(() => setStep(3), 320);
    }
  };

  const handleDisconnectBatteryFlex = () => {
    if (batteryFlexDisconnected) return;
    soundFX.playConnectorSnap();
    setBatteryFlexDisconnected(true);
  };

  const handleExtractPart = () => {
    if (!batteryFlexDisconnected || partExtracted) return;
    soundFX.playLeverage();
    setPartExtracted(true);
    window.setTimeout(() => setStep(4), 420);
  };

  const handleCleanCorrosion = (idx: number) => {
    if (corrosionCleaned[idx]) return;
    soundFX.playScanOk();
    const next = [...corrosionCleaned];
    next[idx] = true;
    setCorrosionCleaned(next);
    if (next.every(Boolean)) {
      setOemMounted(true);
    }
  };

  const handleMountOemPart = () => {
    if (oemMounted) return;
    soundFX.playConnectorSnap();
    setOemMounted(true);
  };

  const handleReconnectBatteryFlex = () => {
    if (!oemMounted || batteryFlexReconnected) return;
    soundFX.playConnectorSnap();
    setBatteryFlexReconnected(true);
    window.setTimeout(() => setStep(5), 360);
  };

  const handleCalibrateLock = () => {
    if (calibrated !== 'idle') return;
    const isPerfect = needlePos >= calMin && needlePos <= calMax;
    setCalibrated(isPerfect ? 'perfect' : 'good');
    soundFX.playRepair();
    window.setTimeout(() => {
      onSuccess(isPerfect);
    }, 820);
  };

  const liveTemp = Math.round(24 + (heatProgress / 100) * 86);
  const removedScrewCount = screwsRemoved.filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/84 p-2">
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl max-h-[96dvh] flex flex-col overflow-hidden rounded-2xl border border-white/12 bg-[#141C27] p-3 shadow-2xl"
      >
        {/* Compact Top Lab Header */}
        <div className="shrink-0 flex items-center justify-between gap-2 mb-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-400">
              <Wrench className="w-3 h-3 shrink-0" />
              <span>
                {bi(`MİKRO TAMİR · ADIM ${step}/5`, `MICRO-REPAIR · STEP ${step}/5`)}
              </span>
              {isExApprentice && (
                <span className="text-emerald-300">
                  · {bi('Eski Çırak Hızı', 'Apprentice Speed')}
                </span>
              )}
            </div>
            <h2 className="font-display text-sm sm:text-base font-extrabold text-slate-50 truncate">
              {phone.brand} {phone.model} — {combinedLabel}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label={bi('Tamir masasından çık', 'Exit repair bench')}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-[#1D2735] text-slate-300 hover:text-slate-50 cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 5-Stage Progress Stepper */}
        <div className="shrink-0 grid grid-cols-5 gap-1.5 mb-2">
          {stepMeta.map((item) => {
            const done = step > item.id;
            const active = step === item.id;
            return (
              <div key={item.id} className="space-y-0.5">
                <div
                  className={`h-1 rounded-full transition-colors ${
                    done
                      ? 'bg-emerald-500'
                      : active
                      ? 'bg-amber-400'
                      : 'bg-white/10'
                  }`}
                />
                <div
                  className={`text-[9.5px] font-medium truncate ${
                    done
                      ? 'text-emerald-300'
                      : active
                      ? 'text-amber-300 font-semibold'
                      : 'text-slate-500'
                  }`}
                >
                  {item.id}. {item.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Interactive ESD Repair Bench (Zero-Scroll 12-col Landscape) */}
        <div
          className="flex-1 min-h-0 grid grid-cols-12 gap-3 rounded-xl border border-white/10 bg-[#0E151F] p-2.5 sm:p-3 overflow-hidden"
          style={{
            backgroundImage:
              'radial-gradient(rgba(148,163,184,0.11) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          {/* Left: Interactive Internal Smartphone Cutaway */}
          <div className="col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-[156px] h-[190px] lg:w-[184px] lg:h-[224px] flex items-start justify-center">
              <div className="relative w-[200px] h-[244px] origin-top scale-[0.78] lg:scale-[0.92] rounded-[26px] border-2 border-slate-600 bg-[#151E2C] shadow-[0_14px_30px_rgba(0,0,0,0.65)] overflow-visible shrink-0">
                {step === 1 && (
                  <div
                    className="pointer-events-none absolute -inset-1.5 rounded-[30px] border-2 transition-opacity duration-150"
                    style={{
                      borderColor: isHeating ? '#F97316' : '#F59E0B',
                      boxShadow: isHeating
                        ? '0 0 28px rgba(249, 115, 22, 0.6)'
                        : '0 0 12px rgba(245, 158, 11, 0.25)',
                      opacity: Math.max(0.25, heatProgress / 100),
                    }}
                  />
                )}

                <svg
                  viewBox="0 0 200 244"
                  className="h-full w-full rounded-[24px]"
                  aria-hidden="true"
                >
                  <rect
                    x="8"
                    y="8"
                    width="184"
                    height="228"
                    rx="20"
                    fill="#0B111A"
                    stroke="#334155"
                    strokeWidth="1.5"
                  />
                  <rect
                    x="18"
                    y="18"
                    width="64"
                    height="52"
                    rx="10"
                    fill="#17202E"
                    stroke={
                      hasCameraDefect && step >= 3 && !oemMounted
                        ? '#F43F5E'
                        : '#475569'
                    }
                    strokeWidth="1.4"
                  />
                  <circle cx="38" cy="36" r="10" fill="#0B1220" stroke="#64748B" strokeWidth="1.5" />
                  <circle cx="64" cy="52" r="9" fill="#0B1220" stroke="#64748B" strokeWidth="1.5" />
                  <path
                    d="M90 18 H178 Q182 18 182 22 V170 Q182 174 178 174 H136 V78 H90 Z"
                    fill="#11382C"
                    stroke="#10B981"
                    strokeOpacity="0.45"
                    strokeWidth="1.2"
                  />
                  <rect
                    x="144"
                    y="40"
                    width="28"
                    height="32"
                    rx="4"
                    fill="#1E293B"
                    stroke="#94A3B8"
                    strokeWidth="1"
                  />
                  <text
                    x="158"
                    y="59"
                    textAnchor="middle"
                    fill="#CBD5E1"
                    fontSize="7"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    SoC
                  </text>
                  <rect
                    x="18"
                    y="82"
                    width="108"
                    height="112"
                    rx="10"
                    fill={
                      partExtracted && !oemMounted && hasBatteryDefect
                        ? '#101722'
                        : '#1B2534'
                    }
                    stroke={
                      hasBatteryDefect && step >= 3 && !oemMounted
                        ? '#F43F5E'
                        : oemMounted
                        ? '#10B981'
                        : '#475569'
                    }
                    strokeDasharray={
                      partExtracted && !oemMounted && hasBatteryDefect
                        ? '4 4'
                        : undefined
                    }
                    strokeWidth="1.5"
                  />
                  <text
                    x="72"
                    y="134"
                    textAnchor="middle"
                    fill="#94A3B8"
                    fontSize="9"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="700"
                  >
                    Li-Ion 4420mAh
                  </text>
                  <text
                    x="72"
                    y="148"
                    textAnchor="middle"
                    fill={oemMounted ? '#34D399' : '#64748B'}
                    fontSize="7.5"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {oemMounted ? 'OEM 100%' : '3.85V · 17.0Wh'}
                  </text>
                  <rect
                    x="126"
                    y="124"
                    width="24"
                    height="12"
                    rx="3"
                    fill={
                      batteryFlexDisconnected && !batteryFlexReconnected
                        ? '#334155'
                        : '#F59E0B'
                    }
                  />
                  <rect
                    x="22"
                    y="202"
                    width="84"
                    height="24"
                    rx="6"
                    fill="#17202E"
                    stroke="#334155"
                    strokeWidth="1"
                  />
                  <rect
                    x="116"
                    y="202"
                    width="64"
                    height="24"
                    rx="6"
                    fill="#17202E"
                    stroke="#334155"
                    strokeWidth="1"
                  />
                </svg>

                {step === 2 &&
                  SCREW_COORDS.map((sc, idx) => {
                    const removed = screwsRemoved[idx];
                    return (
                      <motion.button
                        key={sc.en}
                        type="button"
                        disabled={removed}
                        onClick={() => handleRemoveScrew(idx)}
                        aria-label={bi(sc.tr, sc.en)}
                        style={{ left: sc.x - 16, top: sc.y - 16 }}
                        whileHover={!removed ? { scale: 1.18 } : undefined}
                        whileTap={!removed ? { scale: 0.85, rotate: -120 } : undefined}
                        animate={
                          removed
                            ? { scale: 0.3, opacity: 0.2, rotate: -220 }
                            : { scale: 1, opacity: 1, rotate: 0 }
                        }
                        className={`absolute h-8 w-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                          removed
                            ? 'border-emerald-500/40 bg-emerald-500/10 cursor-default'
                            : 'border-amber-400 bg-[#253143] shadow-[0_0_14px_rgba(245,158,11,0.5)] cursor-pointer'
                        }`}
                      >
                        {removed ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <div className="relative h-3 w-3">
                            <span className="absolute inset-x-0 top-1/2 -mt-[1px] h-[2px] bg-amber-300 rounded-full" />
                            <span className="absolute inset-y-0 left-1/2 -ml-[1px] w-[2px] bg-amber-300 rounded-full" />
                          </div>
                        )}
                      </motion.button>
                    );
                  })}

                {step === 3 && !batteryFlexDisconnected && (
                  <motion.button
                    type="button"
                    onClick={handleDisconnectBatteryFlex}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    style={{ left: 102, top: 112 }}
                    className="absolute flex items-center gap-1 rounded-lg border-2 border-amber-400 bg-amber-500 px-2 py-1 text-[10px] font-extrabold text-slate-950 shadow-[0_0_18px_rgba(245,158,11,0.7)] cursor-pointer whitespace-nowrap"
                  >
                    <Plug className="w-3 h-3" />
                    <span>{bi('Flex Ayır', 'Unplug Flex')}</span>
                  </motion.button>
                )}

                {step === 4 &&
                  isLiquid &&
                  CORROSION_SPOTS.map((spot) => {
                    const cleaned = corrosionCleaned[spot.id];
                    return (
                      <motion.button
                        key={spot.id}
                        type="button"
                        disabled={cleaned}
                        onClick={() => handleCleanCorrosion(spot.id)}
                        aria-label={bi(spot.tr, spot.en)}
                        style={{ left: spot.x - 16, top: spot.y - 16 }}
                        animate={
                          cleaned
                            ? { scale: 0.4, opacity: 0.15 }
                            : { scale: [1, 1.12, 1], opacity: 1 }
                        }
                        transition={
                          cleaned ? { duration: 0.2 } : { repeat: Infinity, duration: 1.3 }
                        }
                        className={`absolute h-8 w-8 rounded-full border-2 flex items-center justify-center ${
                          cleaned
                            ? 'border-emerald-400 bg-emerald-500/20 cursor-default'
                            : 'border-cyan-300 bg-cyan-400/30 shadow-[0_0_16px_rgba(34,211,238,0.65)] cursor-pointer'
                        }`}
                      >
                        {cleaned ? (
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                        ) : (
                          <Droplets className="w-4 h-4 text-cyan-200" />
                        )}
                      </motion.button>
                    );
                  })}
              </div>
            </div>

            {/* Magnetic Screw Organizer Tray */}
            <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-white/8 bg-[#141D2A] px-2.5 py-1 text-[10px] text-slate-400 tabular-nums">
              <span>{bi('Vida Tepsisi', 'Screw Tray')}:</span>
              <div className="flex items-center gap-1">
                {screwsRemoved.map((rem, i) => (
                  <span
                    key={i}
                    className={`h-2 w-2 rounded-full border ${
                      rem
                        ? 'border-amber-300 bg-amber-400'
                        : 'border-white/15 bg-white/5'
                    }`}
                  />
                ))}
              </div>
              <span className="font-mono text-slate-200">{removedScrewCount}/6</span>
            </div>
          </div>

          {/* Right: Active Step Tool Controls & Telemetry */}
          <div className="col-span-7 flex flex-col justify-between min-h-0">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="space-y-2.5"
                >
                  <div>
                    <div className="text-xs font-bold text-amber-400 mb-0.5">
                      {bi('Adım 1: Sıcak Hava İstasyonu', 'Step 1: Hot Air Station')}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {bi(
                        'Ekran contasını çatlatmadan yumuşatmak için ısı tabancasını 110°C’ye kadar basılı tut.',
                        'Hold the hot air gun until 110°C to soften the waterproof screen gasket cleanly.'
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#141D2A] p-2.5 tabular-nums">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-400">
                        {bi('İstasyon Sıcaklığı', 'Nozzle Temp')}
                      </span>
                      <span
                        className={`font-mono text-base font-extrabold ${
                          liveTemp >= 90 ? 'text-orange-400' : 'text-amber-300'
                        }`}
                      >
                        {liveTemp}°C / 110°C
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-100"
                        style={{ width: `${heatProgress}%` }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onPointerDown={() => setIsHeating(true)}
                    onPointerUp={() => setIsHeating(false)}
                    onPointerLeave={() => setIsHeating(false)}
                    onPointerCancel={() => setIsHeating(false)}
                    className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all cursor-pointer select-none whitespace-nowrap ${
                      isHeating
                        ? 'bg-orange-500 text-slate-950 scale-[0.98] shadow-[0_0_20px_rgba(249,115,22,0.5)]'
                        : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    }`}
                  >
                    <Flame className="w-4 h-4" />
                    <span>
                      {isHeating
                        ? bi(`Isıtılıyor... (%${heatProgress})`, `Heating... (${heatProgress}%)`)
                        : bi('Isı Tabancasını Basılı Tut', 'Hold Hot Air Gun')}
                    </span>
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="space-y-3"
                >
                  <div>
                    <div className="text-xs font-bold text-amber-400 mb-0.5">
                      {bi('Adım 2: 6 Mikro Vidayı Sök', 'Step 2: Remove 6 Micro-Screws')}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {bi(
                        'Sol taraftaki cihaz gövdesinde parlayan 6 vidaya tek tek dokunup manyetik tepsiye al.',
                        'Tap each glowing micro-screw on the chassis to move all 6 into the magnetic tray.'
                      )}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#141D2A] p-3 text-xs text-slate-300 space-y-1.5 tabular-nums">
                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        {bi('Sökülen Vida', 'Screws Removed')}
                      </span>
                      <span className="font-mono font-bold text-amber-400">
                        {removedScrewCount} / 6
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all duration-150"
                        style={{ width: `${(removedScrewCount / 6) * 100}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="space-y-2.5"
                >
                  <div>
                    <div className="text-xs font-bold text-amber-400 mb-0.5">
                      {bi('Adım 3: Flex Ayırma & Modül Sökümü', 'Step 3: Unplug Flex & Extract')}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {!batteryFlexDisconnected
                        ? bi(
                            'Önce cihaz üzerindeki parlak "Flex Ayır" soketine dokunup batarya elektriğini kes!',
                            'First tap the glowing "Unplug Flex" connector on the board to cut power safely!'
                          )
                        : bi(
                            `Elektrik kesildi! Şimdi arızalı "${combinedShort}" parçasını çıkar.`,
                            `Power cut! Now extract the faulty "${combinedShort}" component.`
                          )}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div
                      className={`flex items-center justify-between rounded-xl border px-3 py-2 text-[11px] ${
                        batteryFlexDisconnected
                          ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200'
                          : 'border-amber-500/35 bg-amber-500/10 text-amber-200'
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5 font-semibold">
                        <BatteryCharging className="w-3.5 h-3.5" />
                        <span>{bi('1. Batarya Flex Soketi', '1. Battery Flex Ribbon')}</span>
                      </span>
                      <span>
                        {batteryFlexDisconnected
                          ? bi('Ayrıldı', 'Disconnected')
                          : bi('Cihazdan Tıkla', 'Tap on Phone')}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={!batteryFlexDisconnected || partExtracted}
                      onClick={handleExtractPart}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-rose-500/60 bg-rose-500/15 px-4 py-2.5 text-xs font-bold text-rose-100 hover:bg-rose-500/25 disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <Wrench className="w-3.5 h-3.5 text-rose-400" />
                      <span>
                        {partExtracted
                          ? bi('Parçalar Çıkarıldı', 'Faulty Parts Removed')
                          : bi(`2. ${combinedShort} Sök`, `2. Extract ${combinedShort}`)}
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="space-y-2.5"
                >
                  <div>
                    <div className="text-xs font-bold text-amber-400 mb-0.5">
                      {isLiquid
                        ? bi('Adım 4: IPA Oksidasyon Temizliği', 'Step 4: IPA Corrosion Cleaning')
                        : bi('Adım 4: Orijinal OEM Montajı', 'Step 4: Mount OEM Replacement')}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {isLiquid && !oemMounted
                        ? bi(
                            'Anakart üzerindeki 3 mavi oksidasyon noktasına tıklayıp izopropil alkolle temizle.',
                            'Tap all 3 cyan corrosion spots on the motherboard to clean with 99% IPA.'
                          )
                        : !oemMounted
                        ? bi(
                            `Yeni orijinal ${combinedShort} parçalarını yuvasına oturt.`,
                            `Seat the brand-new OEM ${combinedShort} assembly into the chassis.`
                          )
                        : bi(
                            'Montaj tamam! Şimdi batarya flex kablosunu takıp gücü ver.',
                            'Assembly seated! Reconnect the battery flex ribbon to restore power.'
                          )}
                    </p>
                  </div>

                  {!isLiquid && !oemMounted && (
                    <button
                      type="button"
                      onClick={handleMountOemPart}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-emerald-400 transition-colors cursor-pointer"
                    >
                      <Cpu className="w-4 h-4" />
                      <span>
                        {bi(`Yeni Orijinal ${combinedShort} Tak`, `Mount OEM ${combinedShort}`)}
                      </span>
                    </button>
                  )}

                  {isLiquid && !oemMounted && (
                    <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-2.5 text-xs text-cyan-100 tabular-nums">
                      {bi('Temizlenen Oksidasyon', 'Cleaned Spots')}:{' '}
                      <strong className="font-mono">
                        {corrosionCleaned.filter(Boolean).length} / 3
                      </strong>
                    </div>
                  )}

                  {oemMounted && (
                    <button
                      type="button"
                      disabled={batteryFlexReconnected}
                      onClick={handleReconnectBatteryFlex}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer"
                    >
                      <Zap className="w-4 h-4" />
                      <span>
                        {batteryFlexReconnected
                          ? bi('Güç Bağlandı!', 'Power Connected!')
                          : bi('Batarya Flex Tak & Güç Ver', 'Reconnect Battery Flex')}
                      </span>
                    </button>
                  )}
                </motion.div>
              )}

              {step === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="space-y-2.5"
                >
                  <div>
                    <div className="text-xs font-bold text-amber-400 mb-0.5">
                      {bi('Adım 5: TrueTone & Kalibrasyon', 'Step 5: TrueTone & Calibration')}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {bi(
                        `İbre yeşil bölgedeyken kilitle ve ${
                          isExpressJob
                            ? 'Usta İşi (+1.000 ₺ Bahşiş)'
                            : 'Usta İşi (+%12 Değer)'
                        } kazan!`,
                        `Lock the needle inside the green zone for ${
                          isExpressJob
                            ? 'Master Bonus (+1,000 ₺ Tip)'
                            : 'Master-Crafted (+12% Value)'
                        }!`
                      )}
                    </p>
                  </div>

                  <div className="relative w-full h-9 rounded-xl bg-[#1A2434] border border-white/12 overflow-hidden">
                    <div
                      className="absolute inset-y-0 bg-emerald-500/30 border-x-2 border-emerald-400"
                      style={{ left: `${calMin}%`, width: `${calMax - calMin}%` }}
                    />
                    <div
                      className="absolute inset-y-1 w-2.5 -ml-1.25 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.9)]"
                      style={{ left: `${needlePos}%` }}
                    />
                  </div>

                  {calibrated === 'idle' ? (
                    <button
                      type="button"
                      onClick={handleCalibrateLock}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-amber-400 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>
                        {bi('Kalibre Et & Kasayı Presle', 'Calibrate & Seal Chassis')}
                      </span>
                    </button>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="rounded-xl border border-emerald-500/40 bg-emerald-500/12 p-2.5 text-center"
                    >
                      <div className="inline-flex items-center gap-1.5 font-display text-sm font-extrabold text-emerald-300">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>
                          {calibrated === 'perfect'
                            ? bi('MÜKEMMEL! USTA İŞİ (+%12)', 'PERFECT! MASTER-CRAFTED (+12%)')
                            : bi('ONARIM TAMAMLANDI!', 'REPAIR COMPLETE!')}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-2 pt-2 border-t border-white/8 flex items-center justify-between text-[10.5px] text-slate-400 tabular-nums">
              <span>
                {bi('Parça', 'Parts')}:{' '}
                <strong className="text-slate-100">{formatTRY(cost)}</strong>
              </span>
              <span className="text-amber-300/90">
                {bi('Yeşil bölge = Usta İşi (+%12)', 'Green zone = Master (+12%)')}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

