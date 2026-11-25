import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Award,
  BatteryCharging,
  Check,
  Cpu,
  Droplets,
  Flame,
  Layers,
  Plug,
  Smartphone,
  Sparkles,
  Wind,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { formatTRY } from '../game/engine';
import { getLocalizedDefect, useLanguage } from '../game/i18n';
import { soundFX } from '../game/sound';
import { DefectId, LegacyPathId, PhoneDevice, RepairQuality } from '../game/types';

interface MiniRepairModalProps {
  phone: PhoneDevice;
  defectId?: DefectId;
  defectIds?: DefectId[];
  cost: number;
  legacyPath?: LegacyPathId;
  shopLevel?: number;
  prestigeLevel?: number;
  hasCleanRoomLab?: boolean;
  isExpressJob?: boolean;
  onSuccess: (masterCrafted: boolean, quality?: RepairQuality) => void;
  onCancel: () => void;
}

type RepairMode = 'SCREEN' | 'LIQUID' | 'BATTERY' | 'OPTICAL';

const FOUR_SCREWS = [
  { x: 26, y: 26, tr: 'Sol üst vida', en: 'Top-left screw' },
  { x: 174, y: 26, tr: 'Sağ üst vida', en: 'Top-right screw' },
  { x: 26, y: 214, tr: 'Sol alt vida', en: 'Bottom-left screw' },
  { x: 174, y: 214, tr: 'Sağ alt vida', en: 'Bottom-right screw' },
];

const LIQUID_SPOTS = [
  { id: 0, x: 74, y: 68, tr: 'Güç entegresi oksidi', en: 'PMIC oxidation' },
  { id: 1, x: 144, y: 88, tr: 'SoC çevresi oksidi', en: 'SoC bridge corrosion' },
  { id: 2, x: 96, y: 148, tr: 'Batarya hattı oksidi', en: 'Battery rail corrosion' },
  { id: 3, x: 140, y: 196, tr: 'Şarj soketi oksidi', en: 'Charging port oxidation' },
];

const OPTICAL_SPOTS = [
  { id: 0, x: 46, y: 40, tr: 'Ana lens buğusu', en: 'Main lens fog' },
  { id: 1, x: 64, y: 58, tr: 'Geniş açı sensörü', en: 'Ultrawide sensor' },
  { id: 2, x: 100, y: 195, tr: 'Kasa contası', en: 'Frame gasket' },
];

export const MiniRepairModal: React.FC<MiniRepairModalProps> = ({
  phone,
  defectId,
  defectIds,
  cost,
  legacyPath,
  shopLevel = 1,
  prestigeLevel = 0,
  hasCleanRoomLab = false,
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

  // Choose specialized repair flow based on defect type!
  const mode: RepairMode = activeDefectIds.includes('liquid_damage')
    ? 'LIQUID'
    : activeDefectIds.some((d) => d === 'screen_crack' || d === 'screen_aftermarket')
    ? 'SCREEN'
    : activeDefectIds.some((d) => d === 'battery_degraded' || d === 'battery_fake_chip')
    ? 'BATTERY'
    : 'OPTICAL';

  const multiCount = activeDefectIds.length;
  const combinedLabel =
    multiCount === 1
      ? def.name
      : `${multiCount} ${bi('Arıza', 'Faults')} (${activeDefectIds
          .map((d) => getLocalizedDefect(d, lang).shortLabel)
          .join(' + ')})`;

  const isExApprentice = legacyPath === 'EX_APPRENTICE';
  const tierDifficulty =
    phone.tier === 'luxury'
      ? 3
      : phone.tier === 'flagship'
      ? 2
      : phone.tier === 'mid'
      ? 1
      : 0;
  const difficultyScore =
    Math.max(0, shopLevel - 1) + prestigeLevel * 3 + tierDifficulty;
  // Tighter green sweet-spot as player levels up or repairs higher-tier phones!
  const baseGreenHalf = Math.max(4.5, 11 - difficultyScore * 0.65);
  const greenHalf =
    baseGreenHalf + (isExApprentice ? 2.2 : 0) + (hasCleanRoomLab ? 1.8 : 0);
  const amberHalf = Math.min(34, greenHalf + 11.5);
  const calMin = Math.max(12, 50 - greenHalf);
  const calMax = Math.min(88, 50 + greenHalf);
  const stdMin = Math.max(6, 50 - amberHalf);
  const stdMax = Math.min(94, 50 + amberHalf);
  const needleSpeed = Math.min(5.6, 3.15 + difficultyScore * 0.24);
  const difficultyLabel =
    difficultyScore >= 8
      ? bi('Usta Seviye', 'Master Diff')
      : difficultyScore >= 4
      ? bi('Zor Kalibrasyon', 'Hard Cal')
      : bi('Orta Kalibrasyon', 'Standard Cal');

  const modeBadge =
    mode === 'SCREEN'
      ? bi('EKRAN DEĞİŞİMİ', 'SCREEN REPLACEMENT')
      : mode === 'LIQUID'
      ? bi('SIVI TEMASI & IPA BAKIMI', 'LIQUID DAMAGE RECOVERY')
      : mode === 'BATTERY'
      ? bi('PİL DEĞİŞİMİ & BMS', 'BATTERY REPLACEMENT')
      : bi('OPTİK & KASA ONARIMI', 'OPTICAL & CHASSIS REPAIR');

  const stepLabels: [string, string, string, string] =
    mode === 'SCREEN'
      ? [
          bi('Camı Isıt', 'Heat Glass'),
          bi('4 Vida Sök', '4 Screws'),
          bi('Yeni OLED Tak', 'Fit OLED'),
          bi('Dokunmatik', 'Touch Cal'),
        ]
      : mode === 'LIQUID'
      ? [
          bi('Gücü Kes', 'Cut Power'),
          bi('IPA Oksit Sil', 'Scrub IPA'),
          bi('Board Kurut', 'Hot-Air Dry'),
          bi('Akım Testi', 'Short Test'),
        ]
      : mode === 'BATTERY'
      ? [
          bi('Flex Ayır', 'Unplug Flex'),
          bi('Bantları Çek', 'Pull Tabs'),
          bi('OEM Pil Tak', 'Fit Battery'),
          bi('Voltaj Testi', 'Voltage Cal'),
        ]
      : [
          bi('4 Vida Sök', '4 Screws'),
          bi('Lens Temizle', 'Clean Optics'),
          bi('Yeni Conta', 'Fit Gasket'),
          bi('Odak Testi', 'Focus Cal'),
        ];

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Shared interactive states tailored per mode
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [screwsRemoved, setScrewsRemoved] = useState<boolean[]>([false, false, false, false]);
  const [liquidCleaned, setLiquidCleaned] = useState<boolean[]>([false, false, false, false]);
  const [opticalCleaned, setOpticalCleaned] = useState<boolean[]>([false, false, false]);
  const [pullTabs, setPullTabs] = useState<[boolean, boolean]>([false, false]);
  const [oldPartRemoved, setOldPartRemoved] = useState(false);
  const [newPartSeated, setNewPartSeated] = useState(false);

  // Step 4 calibration needle
  const [needlePos, setNeedlePos] = useState(18);
  const [calibrated, setCalibrated] = useState<'idle' | 'master' | 'standard' | 'rough'>('idle');
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Hold-progress effect (Screen Step 1 heating OR Liquid Step 3 hot-air drying)
  const isHoldStep =
    (mode === 'SCREEN' && step === 1) || (mode === 'LIQUID' && step === 3);

  useEffect(() => {
    if (!isHoldStep || !isHolding) return;
    const inc = isExApprentice ? 12 : 8;
    const interval = window.setInterval(() => {
      soundFX.playHeatTick();
      setHoldProgress((prev) => Math.min(100, prev + inc));
    }, 80);
    return () => window.clearInterval(interval);
  }, [isHoldStep, isHolding, isExApprentice]);

  useEffect(() => {
    if (!isHoldStep || holdProgress < 100) return;
    setIsHolding(false);
    soundFX.playScanOk();
    const timer = window.setTimeout(() => {
      setHoldProgress(0);
      setStep((s) => (s < 4 ? ((s + 1) as 1 | 2 | 3 | 4) : s));
    }, 260);
    return () => window.clearTimeout(timer);
  }, [isHoldStep, holdProgress]);

  // Step 4 oscillating needle (scales with shopLevel, prestige & phone tier)
  useEffect(() => {
    if (step !== 4 || calibrated !== 'idle') return;
    startTimeRef.current = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - startTimeRef.current) / 1000;
      const pos = 50 + Math.sin(elapsed * needleSpeed) * 45;
      setNeedlePos(pos);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [step, calibrated, needleSpeed]);

  const handleRemoveScrew = (idx: number) => {
    if (screwsRemoved[idx]) return;
    soundFX.playScrewTurn();
    const next = [...screwsRemoved];
    next[idx] = true;
    setScrewsRemoved(next);
    if (next.every(Boolean)) {
      soundFX.playScanOk();
      window.setTimeout(() => setStep((s) => (s + 1) as 1 | 2 | 3 | 4), 260);
    }
  };

  const handleCleanLiquid = (idx: number) => {
    if (liquidCleaned[idx]) return;
    soundFX.playScanOk();
    const next = [...liquidCleaned];
    next[idx] = true;
    setLiquidCleaned(next);
    if (next.every(Boolean)) {
      window.setTimeout(() => setStep(3), 260);
    }
  };

  const handleCleanOptical = (idx: number) => {
    if (opticalCleaned[idx]) return;
    soundFX.playScanOk();
    const next = [...opticalCleaned];
    next[idx] = true;
    setOpticalCleaned(next);
    if (next.every(Boolean)) {
      window.setTimeout(() => setStep(3), 260);
    }
  };

  const handlePullTab = (tabIdx: 0 | 1) => {
    if (pullTabs[tabIdx]) return;
    soundFX.playLeverage();
    const next: [boolean, boolean] = [pullTabs[0], pullTabs[1]];
    next[tabIdx] = true;
    setPullTabs(next);
    if (next[0] && next[1]) {
      soundFX.playScanOk();
      window.setTimeout(() => setStep(3), 280);
    }
  };

  const handleCutPowerStep = () => {
    soundFX.playConnectorSnap();
    window.setTimeout(() => setStep(2), 240);
  };

  const handleLiftOldPart = () => {
    if (oldPartRemoved) return;
    soundFX.playLeverage();
    setOldPartRemoved(true);
  };

  const handleSeatNewPart = () => {
    if (newPartSeated) return;
    soundFX.playConnectorSnap();
    setNewPartSeated(true);
    window.setTimeout(() => setStep(4), 300);
  };

  const handleCalibrateLock = () => {
    if (calibrated !== 'idle') return;
    const isMaster = needlePos >= calMin && needlePos <= calMax;
    const isStandard = !isMaster && needlePos >= stdMin && needlePos <= stdMax;
    const quality: RepairQuality = isMaster
      ? 'MASTER'
      : isStandard
      ? 'STANDARD'
      : 'ROUGH';
    setCalibrated(isMaster ? 'master' : isStandard ? 'standard' : 'rough');
    if (quality === 'ROUGH') {
      soundFX.playScanDefect();
    } else {
      soundFX.playRepair();
    }
    window.setTimeout(() => {
      onSuccess(isMaster, quality);
    }, 820);
  };

  const liveTemp = Math.round(24 + (holdProgress / 100) * 82);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/84 p-2 select-none">
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-2xl max-h-[96dvh] flex flex-col overflow-hidden rounded-2xl border border-white/12 bg-[#141C27] p-3 shadow-2xl"
      >
        {/* Compact Header */}
        <div className="shrink-0 flex items-center justify-between gap-2 mb-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400">
              {mode === 'LIQUID' ? (
                <Droplets className="w-3 h-3 text-cyan-400 shrink-0" />
              ) : mode === 'BATTERY' ? (
                <BatteryCharging className="w-3 h-3 text-emerald-400 shrink-0" />
              ) : mode === 'SCREEN' ? (
                <Smartphone className="w-3 h-3 text-amber-400 shrink-0" />
              ) : (
                <Wrench className="w-3 h-3 shrink-0" />
              )}
              <span>
                {modeBadge} · {bi(`ADIM ${step}/4`, `STEP ${step}/4`)}
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

        {/* 4-Step Mode-Specific Progress Bar */}
        <div className="shrink-0 grid grid-cols-4 gap-1.5 mb-2">
          {stepLabels.map((lbl, idx) => {
            const id = idx + 1;
            const done = step > id;
            const active = step === id;
            return (
              <div key={lbl} className="space-y-0.5">
                <div
                  className={`h-1 rounded-full transition-colors ${
                    done
                      ? 'bg-emerald-500'
                      : active
                      ? mode === 'LIQUID'
                        ? 'bg-cyan-400'
                        : 'bg-amber-400'
                      : 'bg-white/10'
                  }`}
                />
                <div
                  className={`text-[9.5px] font-medium truncate ${
                    done
                      ? 'text-emerald-300'
                      : active
                      ? mode === 'LIQUID'
                        ? 'text-cyan-300 font-bold'
                        : 'text-amber-300 font-bold'
                      : 'text-slate-500'
                  }`}
                >
                  {id}. {lbl}
                </div>
              </div>
            );
          })}
        </div>

        {/* Main 12-Col Landscape ESD Bench */}
        <div
          className="flex-1 min-h-0 grid grid-cols-12 gap-3 rounded-xl border border-white/10 bg-[#0E151F] p-2.5 sm:p-3 overflow-hidden"
          style={{
            backgroundImage:
              'radial-gradient(rgba(148,163,184,0.11) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          {/* Left: Mode-Tailored Interactive Smartphone Cutaway */}
          <div className="col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-[156px] h-[190px] lg:w-[184px] lg:h-[224px] flex items-start justify-center">
              <div className="relative w-[200px] h-[244px] origin-top scale-[0.78] lg:scale-[0.92] rounded-[26px] border-2 border-slate-600 bg-[#151E2C] shadow-[0_14px_30px_rgba(0,0,0,0.65)] overflow-visible shrink-0">
                {/* Glow border while heating or hot-air drying */}
                {isHoldStep && (
                  <div
                    className="pointer-events-none absolute -inset-1.5 rounded-[30px] border-2 transition-opacity duration-150"
                    style={{
                      borderColor: mode === 'LIQUID' ? '#38BDF8' : '#F97316',
                      boxShadow: isHolding
                        ? mode === 'LIQUID'
                          ? '0 0 26px rgba(56,189,248,0.6)'
                          : '0 0 26px rgba(249,115,22,0.6)'
                        : '0 0 10px rgba(245,158,11,0.2)',
                      opacity: Math.max(0.3, holdProgress / 100),
                    }}
                  />
                )}

                <svg viewBox="0 0 200 244" className="h-full w-full rounded-[24px]" aria-hidden="true">
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

                  {mode === 'SCREEN' ? (
                    /* SCREEN MODE CUTAWAY: Front Display Assembly */
                    <>
                      <rect
                        x="16"
                        y="16"
                        width="168"
                        height="212"
                        rx="15"
                        fill={
                          newPartSeated
                            ? '#0E293B'
                            : oldPartRemoved
                            ? '#090F17'
                            : '#1B2432'
                        }
                        stroke={
                          newPartSeated
                            ? '#10B981'
                            : oldPartRemoved
                            ? '#F59E0B'
                            : '#F43F5E'
                        }
                        strokeDasharray={oldPartRemoved && !newPartSeated ? '5 4' : undefined}
                        strokeWidth="1.8"
                      />
                      {!oldPartRemoved && !newPartSeated && (
                        <g stroke="#F8FAFC" strokeOpacity="0.8" strokeWidth="1.8" strokeLinecap="round">
                          <path d="M28 42 L84 96 L56 150 L132 192" />
                          <path d="M84 96 L154 78 L174 114" />
                          <path d="M84 96 L112 142" />
                        </g>
                      )}
                      {oldPartRemoved && !newPartSeated && (
                        <text
                          x="100"
                          y="124"
                          textAnchor="middle"
                          fill="#F59E0B"
                          fontSize="10"
                          fontFamily="JetBrains Mono, monospace"
                          fontWeight="700"
                        >
                          OLED FLEX YUVASI
                        </text>
                      )}
                      {newPartSeated && (
                        <g>
                          <text
                            x="100"
                            y="114"
                            textAnchor="middle"
                            fill="#34D399"
                            fontSize="12"
                            fontFamily="JetBrains Mono, monospace"
                            fontWeight="700"
                          >
                            OEM OLED 120Hz
                          </text>
                          <text
                            x="100"
                            y="132"
                            textAnchor="middle"
                            fill="#94A3B8"
                            fontSize="8.5"
                            fontFamily="JetBrains Mono, monospace"
                          >
                            TRUE-TONE READY
                          </text>
                        </g>
                      )}
                    </>
                  ) : (
                    /* INTERNAL PCB + BATTERY + CAMERA CUTAWAY (LIQUID / BATTERY / OPTICAL) */
                    <>
                      {/* Camera Module */}
                      <rect
                        x="18"
                        y="18"
                        width="64"
                        height="52"
                        rx="10"
                        fill="#17202E"
                        stroke={mode === 'OPTICAL' && !newPartSeated ? '#F59E0B' : '#475569'}
                        strokeWidth="1.5"
                      />
                      <circle cx="38" cy="36" r="10" fill="#0B1220" stroke="#64748B" strokeWidth="1.5" />
                      <circle cx="64" cy="52" r="9" fill="#0B1220" stroke="#64748B" strokeWidth="1.5" />

                      {/* Logic Board */}
                      <path
                        d="M90 18 H178 Q182 18 182 22 V174 Q182 178 178 178 H134 V78 H90 Z"
                        fill={mode === 'LIQUID' && step < 3 ? '#113B3D' : '#11382C'}
                        stroke={mode === 'LIQUID' ? '#22D3EE' : '#10B981'}
                        strokeOpacity="0.6"
                        strokeWidth="1.4"
                      />
                      <rect x="144" y="40" width="28" height="32" rx="4" fill="#1E293B" stroke="#94A3B8" />
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

                      {/* Battery Cell */}
                      <rect
                        x="18"
                        y="82"
                        width="108"
                        height="112"
                        rx="10"
                        fill={
                          mode === 'BATTERY' && pullTabs[0] && pullTabs[1] && !newPartSeated
                            ? '#0D141F'
                            : '#1B2534'
                        }
                        stroke={
                          mode === 'BATTERY'
                            ? newPartSeated
                              ? '#10B981'
                              : '#F59E0B'
                            : '#475569'
                        }
                        strokeDasharray={
                          mode === 'BATTERY' && pullTabs[0] && pullTabs[1] && !newPartSeated
                            ? '4 4'
                            : undefined
                        }
                        strokeWidth="1.6"
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
                        {mode === 'BATTERY' && newPartSeated
                          ? 'OEM 100% PIL'
                          : mode === 'BATTERY' && pullTabs[0] && pullTabs[1]
                          ? 'BOŞ YUVA'
                          : 'Li-Ion 4420mAh'}
                      </text>
                      <text
                        x="72"
                        y="148"
                        textAnchor="middle"
                        fill={newPartSeated ? '#34D399' : '#64748B'}
                        fontSize="7.5"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        {newPartSeated ? '3.88V · 0 DEVİR' : '3.85V · 17.0Wh'}
                      </text>

                      {/* Battery Pull-Tab Visuals */}
                      {mode === 'BATTERY' && step === 2 && (
                        <>
                          <rect
                            x="36"
                            y="188"
                            width="18"
                            height="18"
                            rx="3"
                            fill={pullTabs[0] ? '#10B981' : '#F8FAFC'}
                            fillOpacity={pullTabs[0] ? 0.3 : 0.9}
                          />
                          <rect
                            x="88"
                            y="188"
                            width="18"
                            height="18"
                            rx="3"
                            fill={pullTabs[1] ? '#10B981' : '#F8FAFC'}
                            fillOpacity={pullTabs[1] ? 0.3 : 0.9}
                          />
                        </>
                      )}

                      {/* Flex Connector */}
                      <rect
                        x="126"
                        y="124"
                        width="24"
                        height="12"
                        rx="3"
                        fill={
                          (mode === 'BATTERY' || mode === 'LIQUID') && step >= 2 && !newPartSeated
                            ? '#334155'
                            : '#F59E0B'
                        }
                      />

                      {/* Bottom Charge Port & Speaker */}
                      <rect x="22" y="204" width="84" height="22" rx="6" fill="#17202E" stroke="#334155" />
                      <rect x="116" y="204" width="64" height="22" rx="6" fill="#17202E" stroke="#334155" />
                    </>
                  )}
                </svg>

                {/* Interactive Overlays on the Phone Body */}
                {/* 4 Screws Overlay (Screen Step 2 OR Optical Step 1) */}
                {((mode === 'SCREEN' && step === 2) || (mode === 'OPTICAL' && step === 1)) &&
                  FOUR_SCREWS.map((sc, idx) => {
                    const removed = screwsRemoved[idx];
                    return (
                      <motion.button
                        key={sc.en}
                        type="button"
                        disabled={removed}
                        onClick={() => handleRemoveScrew(idx)}
                        style={{ left: sc.x - 16, top: sc.y - 16 }}
                        whileTap={!removed ? { scale: 0.85, rotate: -110 } : undefined}
                        className={`absolute h-8 w-8 rounded-full border-2 flex items-center justify-center ${
                          removed
                            ? 'border-emerald-500/40 bg-emerald-500/15 opacity-40 cursor-default'
                            : 'border-amber-400 bg-[#253143] shadow-[0_0_14px_rgba(245,158,11,0.6)] cursor-pointer'
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

                {/* Power Flex Unplug Button (Liquid Step 1 OR Battery Step 1) */}
                {(mode === 'LIQUID' || mode === 'BATTERY') && step === 1 && (
                  <motion.button
                    type="button"
                    onClick={handleCutPowerStep}
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ repeat: Infinity, duration: 1.15 }}
                    style={{ left: 96, top: 112 }}
                    className="absolute flex items-center gap-1 rounded-lg border-2 border-amber-400 bg-amber-500 px-2.5 py-1.5 text-[10px] font-extrabold text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.7)] cursor-pointer whitespace-nowrap"
                  >
                    <Plug className="w-3 h-3" />
                    <span>{bi('Flex Ayır', 'Unplug Flex')}</span>
                  </motion.button>
                )}

                {/* Liquid IPA Corrosion Spots (Liquid Step 2) */}
                {mode === 'LIQUID' &&
                  step === 2 &&
                  LIQUID_SPOTS.map((spot) => {
                    const cleaned = liquidCleaned[spot.id];
                    return (
                      <motion.button
                        key={spot.id}
                        type="button"
                        disabled={cleaned}
                        onClick={() => handleCleanLiquid(spot.id)}
                        style={{ left: spot.x - 16, top: spot.y - 16 }}
                        animate={cleaned ? { scale: 0.45, opacity: 0.2 } : { scale: [1, 1.12, 1] }}
                        transition={cleaned ? { duration: 0.2 } : { repeat: Infinity, duration: 1.2 }}
                        className={`absolute h-8 w-8 rounded-full border-2 flex items-center justify-center ${
                          cleaned
                            ? 'border-emerald-400 bg-emerald-500/20 cursor-default'
                            : 'border-cyan-300 bg-cyan-400/35 shadow-[0_0_16px_rgba(34,211,238,0.7)] cursor-pointer'
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

                {/* Optical Clean Spots (Optical Step 2) */}
                {mode === 'OPTICAL' &&
                  step === 2 &&
                  OPTICAL_SPOTS.map((spot) => {
                    const cleaned = opticalCleaned[spot.id];
                    return (
                      <motion.button
                        key={spot.id}
                        type="button"
                        disabled={cleaned}
                        onClick={() => handleCleanOptical(spot.id)}
                        style={{ left: spot.x - 16, top: spot.y - 16 }}
                        className={`absolute h-8 w-8 rounded-full border-2 flex items-center justify-center ${
                          cleaned
                            ? 'border-emerald-400 bg-emerald-500/20 opacity-40 cursor-default'
                            : 'border-sky-300 bg-sky-400/30 shadow-[0_0_16px_rgba(56,189,248,0.65)] cursor-pointer'
                        }`}
                      >
                        {cleaned ? (
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-sky-200" />
                        )}
                      </motion.button>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Right: Mode-Specific Tactile Action Panel */}
          <div className="col-span-7 flex flex-col justify-between min-h-0">
            <AnimatePresence mode="wait">
              {/* === SCREEN REPLACEMENT FLOW === */}
              {mode === 'SCREEN' && step === 1 && (
                <motion.div
                  key="scr-1"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="space-y-2.5"
                >
                  <div>
                    <div className="text-xs font-bold text-amber-400 mb-0.5">
                      {bi('1. Ekran Yapıştırıcısını Isıt', '1. Heat Display Adhesive')}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {bi(
                        'Kırık camı çerçeveye zarar vermeden ayırmak için ısı tabancasını 105°C’ye kadar basılı tut.',
                        'Hold the hot air station to 105°C to soften the front glass adhesive cleanly.'
                      )}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#141D2A] p-2.5 tabular-nums">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">{bi('Ekran Kenar Isısı', 'Frame Temp')}</span>
                      <span className="font-mono font-extrabold text-orange-400">{liveTemp}°C / 106°C</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-100"
                        style={{ width: `${holdProgress}%` }}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onPointerDown={() => setIsHolding(true)}
                    onPointerUp={() => setIsHolding(false)}
                    onPointerLeave={() => setIsHolding(false)}
                    onPointerCancel={() => setIsHolding(false)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-amber-400 active:scale-[0.98] cursor-pointer"
                  >
                    <Flame className="w-4 h-4" />
                    <span>
                      {isHolding
                        ? bi(`Isıtılıyor... (%${holdProgress})`, `Heating... (${holdProgress}%)`)
                        : bi('Isı Tabancasını Basılı Tut', 'Hold Hot Air Gun')}
                    </span>
                  </button>
                </motion.div>
              )}

              {mode === 'SCREEN' && step === 2 && (
                <motion.div
                  key="scr-2"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="space-y-2.5"
                >
                  <div>
                    <div className="text-xs font-bold text-amber-400 mb-0.5">
                      {bi('2. Ekran Çerçevesi 4 Köşe Vidası', '2. Remove 4 Frame Corner Screws')}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {bi(
                        'Soldaki cihazın 4 köşesinde parlayan ekran tutucu vidalara tek tek dokun.',
                        'Tap all 4 glowing display bracket screws on the corners.'
                      )}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#141D2A] p-3 text-xs tabular-nums flex items-center justify-between">
                    <span className="text-slate-400">{bi('Sökülen Vida', 'Screws Removed')}</span>
                    <span className="font-mono font-bold text-amber-400">
                      {screwsRemoved.filter(Boolean).length} / 4
                    </span>
                  </div>
                </motion.div>
              )}

              {mode === 'SCREEN' && step === 3 && (
                <motion.div
                  key="scr-3"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="space-y-2.5"
                >
                  <div>
                    <div className="text-xs font-bold text-amber-400 mb-0.5">
                      {bi('3. Kırık Paneli Sök & Yeni OLED Tak', '3. Lift Broken Screen & Fit OEM OLED')}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {!oldPartRemoved
                        ? bi('Önce çatlak ekran panelini vakumla kaldır.', 'First lift the cracked panel away.')
                        : bi('Şimdi sıfır orijinal 120Hz OLED ekranı oturt!', 'Now snap the fresh OEM 120Hz OLED into place!')}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <button
                      type="button"
                      disabled={oldPartRemoved}
                      onClick={handleLiftOldPart}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/50 bg-rose-500/15 px-4 py-2 text-xs font-bold text-rose-100 hover:bg-rose-500/25 disabled:opacity-40 cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>
                        {oldPartRemoved
                          ? bi('Kırık Ekran Çıkarıldı ✓', 'Broken Panel Removed ✓')
                          : bi('1. Kırık Paneli Vakumla Kaldır', '1. Lift Broken Screen')}
                      </span>
                    </button>
                    <button
                      type="button"
                      disabled={!oldPartRemoved || newPartSeated}
                      onClick={handleSeatNewPart}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-emerald-400 disabled:opacity-35 cursor-pointer"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>{bi('2. Yeni Orijinal OLED Paneli Tak', '2. Snap New OEM OLED')}</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* === LIQUID DAMAGE FLOW === */}
              {mode === 'LIQUID' && step === 1 && (
                <motion.div
                  key="liq-1"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="space-y-2.5"
                >
                  <div>
                    <div className="text-xs font-bold text-cyan-300 mb-0.5">
                      {bi('1. Acil Kısa Devre Önlemi: Gücü Kes!', '1. Emergency Power Cut!')}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {bi(
                        'Sıvı temaslı anakartta ilk kural: derhal batarya flex soketini ayır ki anakart yanmasın!',
                        'First rule of liquid damage: immediately disconnect the battery flex before cleaning!'
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCutPowerStep}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-amber-400 cursor-pointer"
                  >
                    <Plug className="w-4 h-4" />
                    <span>{bi('Batarya Flex Soketini Hemen Ayır', 'Disconnect Battery Flex Now')}</span>
                  </button>
                </motion.div>
              )}

              {mode === 'LIQUID' && step === 2 && (
                <motion.div
                  key="liq-2"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="space-y-2.5"
                >
                  <div>
                    <div className="text-xs font-bold text-cyan-300 mb-0.5">
                      {bi('2. IPA Fırçasıyla Oksit Lekelerini Temizle', '2. Scrub PCB Corrosion with 99% IPA')}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {bi(
                        'Sol anakart üzerinde parlayan 4 mavi oksidasyon noktasına dokunup alkol fırçasıyla temizle.',
                        'Tap all 4 glowing cyan oxidation spots on the logic board to scrub them clean.'
                      )}
                    </p>
                  </div>
                  <div className="rounded-xl border border-cyan-500/35 bg-cyan-500/10 p-3 text-xs text-cyan-100 flex items-center justify-between tabular-nums">
                    <span>{bi('Temizlenen Oksit Noktası', 'Cleaned Corrosion Spots')}</span>
                    <strong className="font-mono text-sm">
                      {liquidCleaned.filter(Boolean).length} / 4
                    </strong>
                  </div>
                </motion.div>
              )}

              {mode === 'LIQUID' && step === 3 && (
                <motion.div
                  key="liq-3"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="space-y-2.5"
                >
                  <div>
                    <div className="text-xs font-bold text-cyan-300 mb-0.5">
                      {bi('3. Sıcak Hava ile Anakartı Kurut', '3. Hot-Air Dry Motherboard')}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {bi(
                        'Alkol ve nem kalıntısı tamamen buharlaşana kadar kurutma tabancasını basılı tut.',
                        'Hold the hot-air blower until motherboard moisture reaches 0%.'
                      )}
                    </p>
                  </div>
                  <div className="rounded-xl border border-cyan-500/25 bg-[#141D2A] p-2.5 tabular-nums">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">{bi('Kuruma Oranı', 'Dryness Level')}</span>
                      <span className="font-mono font-extrabold text-cyan-300">{holdProgress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-100"
                        style={{ width: `${holdProgress}%` }}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onPointerDown={() => setIsHolding(true)}
                    onPointerUp={() => setIsHolding(false)}
                    onPointerLeave={() => setIsHolding(false)}
                    onPointerCancel={() => setIsHolding(false)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-cyan-300 active:scale-[0.98] cursor-pointer"
                  >
                    <Wind className="w-4 h-4" />
                    <span>
                      {isHolding
                        ? bi(`Kurutuluyor... (%${holdProgress})`, `Drying... (${holdProgress}%)`)
                        : bi('Sıcak Hava Kurutucuyu Basılı Tut', 'Hold Hot-Air Dryer')}
                    </span>
                  </button>
                </motion.div>
              )}

              {/* === BATTERY REPLACEMENT FLOW === */}
              {mode === 'BATTERY' && step === 1 && (
                <motion.div
                  key="bat-1"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="space-y-2.5"
                >
                  <div>
                    <div className="text-xs font-bold text-emerald-400 mb-0.5">
                      {bi('1. Batarya Flex Soketini Sök', '1. Disconnect Battery Flex')}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {bi(
                        'Şişmiş veya sahte çipli bataryaya dokunmadan önce anakart güç bağlantısını güvenle ayır.',
                        'Safely disconnect the battery flex ribbon from the logic board first.'
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCutPowerStep}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-amber-400 cursor-pointer"
                  >
                    <Plug className="w-4 h-4" />
                    <span>{bi('Pil Flex Soketini Ayır', 'Unplug Battery Flex')}</span>
                  </button>
                </motion.div>
              )}

              {mode === 'BATTERY' && step === 2 && (
                <motion.div
                  key="bat-2"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="space-y-2.5"
                >
                  <div>
                    <div className="text-xs font-bold text-emerald-400 mb-0.5">
                      {bi('2. Yapışkan Çekme Bantlarını Çek (Pull-Tabs)', '2. Pull Adhesive Battery Tabs')}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {bi(
                        'Eski bataryayı delmeden çıkarmak için alttaki 2 beyaz yapışkan bandı sırayla çek!',
                        'Pull both adhesive pull-tabs beneath the cell to safely release the old battery!'
                      )}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={pullTabs[0]}
                      onClick={() => handlePullTab(0)}
                      className={`rounded-xl border px-3 py-2.5 text-xs font-extrabold transition-all cursor-pointer ${
                        pullTabs[0]
                          ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                          : 'border-amber-400/50 bg-amber-500/15 text-amber-100 hover:bg-amber-500/25'
                      }`}
                    >
                      {pullTabs[0] ? bi('Sol Bant Çekildi ✓', 'Left Tab Pulled ✓') : bi('← Sol Bandı Çek', '← Pull Left Tab')}
                    </button>
                    <button
                      type="button"
                      disabled={pullTabs[1]}
                      onClick={() => handlePullTab(1)}
                      className={`rounded-xl border px-3 py-2.5 text-xs font-extrabold transition-all cursor-pointer ${
                        pullTabs[1]
                          ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                          : 'border-amber-400/50 bg-amber-500/15 text-amber-100 hover:bg-amber-500/25'
                      }`}
                    >
                      {pullTabs[1] ? bi('Sağ Bant Çekildi ✓', 'Right Tab Pulled ✓') : bi('Sağ Bandı Çek →', 'Pull Right Tab →')}
                    </button>
                  </div>
                </motion.div>
              )}

              {mode === 'BATTERY' && step === 3 && (
                <motion.div
                  key="bat-3"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="space-y-2.5"
                >
                  <div>
                    <div className="text-xs font-bold text-emerald-400 mb-0.5">
                      {bi('3. Orijinal %100 Bataryayı Yerleştir', '3. Seat Brand-New OEM Cell')}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {bi(
                        'Eski batarya güvenle çıktı! Şimdi 0 devirli orijinal OEM pili oturt ve flex kablosunu tak.',
                        'Old battery is out! Seat the 0-cycle OEM cell and reconnect the flex cable.'
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={newPartSeated}
                    onClick={handleSeatNewPart}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-emerald-400 cursor-pointer"
                  >
                    <BatteryCharging className="w-4 h-4" />
                    <span>{bi('OEM Batarya Tak & Flex Bağla', 'Mount OEM Battery & Snap Flex')}</span>
                  </button>
                </motion.div>
              )}

              {/* === OPTICAL / COSMETIC FLOW === */}
              {mode === 'OPTICAL' && step === 1 && (
                <motion.div
                  key="opt-1"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="space-y-2.5"
                >
                  <div>
                    <div className="text-xs font-bold text-sky-300 mb-0.5">
                      {bi('1. Arka Kasa 4 Vidayı Sök', '1. Remove 4 Rear Screws')}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {bi(
                        'Lens ve kasa modülüne ulaşmak için parlayan 4 köşe vidasını sök.',
                        'Tap the 4 glowing corner screws to access the rear optical assembly.'
                      )}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#141D2A] p-3 text-xs tabular-nums flex justify-between">
                    <span className="text-slate-400">{bi('Sökülen Vida', 'Screws Removed')}</span>
                    <span className="font-mono font-bold text-sky-300">
                      {screwsRemoved.filter(Boolean).length} / 4
                    </span>
                  </div>
                </motion.div>
              )}

              {mode === 'OPTICAL' && step === 2 && (
                <motion.div
                  key="opt-2"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="space-y-2.5"
                >
                  <div>
                    <div className="text-xs font-bold text-sky-300 mb-0.5">
                      {bi('2. Optik Mercek & Conta Temizliği', '2. Clean Optical Lens & Frame')}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {bi(
                        'Soldaki cihazda parlayan 3 lens/conta noktasına dokunarak buğuyu ve izleri temizle.',
                        'Tap all 3 glowing lens & gasket spots on the phone to polish them spotless.'
                      )}
                    </p>
                  </div>
                  <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 text-xs text-sky-100 flex justify-between tabular-nums">
                    <span>{bi('Temizlenen Bölge', 'Cleaned Zones')}</span>
                    <strong className="font-mono">{opticalCleaned.filter(Boolean).length} / 3</strong>
                  </div>
                </motion.div>
              )}

              {mode === 'OPTICAL' && step === 3 && (
                <motion.div
                  key="opt-3"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="space-y-2.5"
                >
                  <div>
                    <div className="text-xs font-bold text-sky-300 mb-0.5">
                      {bi('3. Yeni Su Geçirmez Conta & Parça Montajı', '3. Fit New Seal & OEM Module')}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {bi(
                        'Temizlik tamam! Yeni orijinal conta ve lens/kasa parçasını yerine oturt.',
                        'Cleaning done! Seat the brand-new OEM seal and module cleanly.'
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={newPartSeated}
                    onClick={handleSeatNewPart}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-emerald-400 cursor-pointer"
                  >
                    <Cpu className="w-4 h-4" />
                    <span>{bi('Yeni Orijinal Parçayı Montajla', 'Mount New OEM Part')}</span>
                  </button>
                </motion.div>
              )}

              {/* === STEP 4: TAILORED FINAL CALIBRATION === */}
              {step === 4 && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="space-y-2.5"
                >
                  <div>
                    <div className="text-xs font-bold text-amber-400 mb-0.5">
                      {mode === 'SCREEN'
                        ? bi('4. TrueTone & Dokunmatik Kalibrasyonu', '4. TrueTone & Touch Calibration')
                        : mode === 'LIQUID'
                        ? bi('4. Kısa Devre & Güç Akım Testi', '4. Short-Circuit & Current Test')
                        : mode === 'BATTERY'
                        ? bi('4. BMS Voltaj & Pil Kalibrasyonu', '4. BMS Voltage Calibration')
                        : bi('4. Kamera Odak & Kasa Pres Testi', '4. Optical Focus & Seal Test')}
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

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[9.5px] font-mono">
                      <span className="text-slate-400">
                        {difficultyLabel} · {bi('Yeşil', 'Green')}: %{Math.round(calMax - calMin)}
                      </span>
                      <span className="text-rose-300/90">
                        {bi('Kırmızı = Geri Dönüş Riski', 'Red = Comeback Risk')}
                      </span>
                    </div>
                    <div className="relative w-full h-9 rounded-xl bg-rose-950/60 border border-white/12 overflow-hidden">
                      {/* Amber Standard Zone */}
                      <div
                        className="absolute inset-y-0 bg-amber-500/22 border-x border-amber-400/45"
                        style={{ left: `${stdMin}%`, width: `${stdMax - stdMin}%` }}
                      />
                      {/* Green Master-Crafted Sweet Spot */}
                      <div
                        className="absolute inset-y-0 bg-emerald-500/35 border-x-2 border-emerald-400"
                        style={{ left: `${calMin}%`, width: `${calMax - calMin}%` }}
                      />
                      <div
                        className="absolute inset-y-1 w-2.5 -ml-1.25 rounded-full bg-white shadow-[0_0_12px_rgba(245,158,11,0.95)]"
                        style={{ left: `${needlePos}%` }}
                      />
                    </div>
                  </div>

                  {calibrated === 'idle' ? (
                    <button
                      type="button"
                      onClick={handleCalibrateLock}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-amber-400 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <Zap className="w-4 h-4" />
                      <span>{bi('Kalibre Et & Onarımı Bitir', 'Calibrate & Complete Repair')}</span>
                    </button>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`rounded-xl border p-2.5 text-center ${
                        calibrated === 'master'
                          ? 'border-emerald-500/45 bg-emerald-500/14'
                          : calibrated === 'standard'
                          ? 'border-amber-400/40 bg-amber-500/12'
                          : 'border-rose-500/45 bg-rose-500/14'
                      }`}
                    >
                      <div
                        className={`inline-flex items-center gap-1.5 font-display text-sm font-extrabold ${
                          calibrated === 'master'
                            ? 'text-emerald-300'
                            : calibrated === 'standard'
                            ? 'text-amber-300'
                            : 'text-rose-300'
                        }`}
                      >
                        <Award className="w-4 h-4" />
                        <span>
                          {calibrated === 'master'
                            ? bi('MÜKEMMEL! USTA İŞİ (+%12)', 'PERFECT! MASTER-CRAFTED (+12%)')
                            : calibrated === 'standard'
                            ? bi('ONARIM TAMAMLANDI (STANDART)', 'REPAIR COMPLETE (STANDARD)')
                            : bi('KABA İŞÇİLİK! (3–5 GÜN İÇİNDE ARIZA RİSKİ)', 'ROUGH FINISH! (COMEBACK RISK IN 3–5 DAYS)')}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-2 pt-2 border-t border-white/8 flex items-center justify-between text-[10.5px] text-slate-400 tabular-nums">
              <span>
                {bi('Parça Maliyeti', 'Parts Cost')}:{' '}
                <strong className="text-slate-100">
                  {cost === 0 ? bi('0 ₺ (Stoktan!)', '0 ₺ (Stock!)') : formatTRY(cost)}
                </strong>
              </span>
              <span className="text-amber-300/90">
                {bi('Yeşil = Usta İşi · Sarı = Normal', 'Green = Master · Amber = Normal')}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
