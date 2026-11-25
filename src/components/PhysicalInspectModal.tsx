import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  BatteryCharging,
  Check,
  CheckCircle2,
  Cpu,
  Delete,
  Droplets,
  Flashlight,
  MessageSquareQuote,
  RotateCw,
  ScanLine,
  Search,
  ShieldAlert,
  Smartphone,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { DEFECT_CATALOG } from '../game/catalog';
import {
  getLocalizedCategoryLabel,
  getLocalizedDefect,
  useLanguage,
} from '../game/i18n';
import { soundFX } from '../game/sound';
import { DefectId, InspectionCategory, PhoneDevice } from '../game/types';

interface PhysicalInspectModalProps {
  device: PhoneDevice;
  initialCategory?: InspectionCategory;
  onInspectZone: (category: InspectionCategory) => void;
  onPhysicalCompleteBonus?: () => void;
  onClose: () => void;
}

const TOOL_TABS: {
  category: InspectionCategory;
  side: 'front' | 'back';
  trLabel: string;
  enLabel: string;
  icon: React.ReactNode;
}[] = [
  {
    category: 'screen',
    side: 'front',
    trLabel: 'Ekran',
    enLabel: 'Display',
    icon: <Smartphone className="w-3.5 h-3.5" />,
  },
  {
    category: 'battery',
    side: 'front',
    trLabel: 'Pil',
    enLabel: 'Battery',
    icon: <BatteryCharging className="w-3.5 h-3.5" />,
  },
  {
    category: 'imei',
    side: 'back',
    trLabel: 'IMEI',
    enLabel: 'IMEI',
    icon: <ScanLine className="w-3.5 h-3.5" />,
  },
  {
    category: 'hardware',
    side: 'back',
    trLabel: 'Sıvı & Kamera',
    enLabel: 'Liquid & Cam',
    icon: <Cpu className="w-3.5 h-3.5" />,
  },
];

const SCREEN_CHECK_POINTS = [
  { id: 0, xPct: 50, yPct: 26, tr: 'Üst Cam', en: 'Top Glass' },
  { id: 1, xPct: 50, yPct: 48, tr: 'OLED Renk', en: 'OLED Tint' },
  { id: 2, xPct: 50, yPct: 68, tr: 'Alt Dokunmatik', en: 'Touch Grid' },
];

export const PhysicalInspectModal: React.FC<PhysicalInspectModalProps> = ({
  device,
  initialCategory,
  onInspectZone,
  onPhysicalCompleteBonus,
  onClose,
}) => {
  const { lang, bi } = useLanguage();

  const defaultCat: InspectionCategory = useMemo(() => {
    if (initialCategory) return initialCategory;
    const firstUnchecked = TOOL_TABS.find((t) => !device.inspected[t.category]);
    return firstUnchecked ? firstUnchecked.category : 'screen';
  }, [initialCategory, device.inspected]);

  const [activeTool, setActiveTool] = useState<InspectionCategory>(defaultCat);
  const [side, setSide] = useState<'front' | 'back'>(
    defaultCat === 'imei' || defaultCat === 'hardware' ? 'back' : 'front'
  );
  const [loupePos, setLoupePos] = useState<{ x: number; y: number; active: boolean }>({
    x: 50,
    y: 44,
    active: false,
  });

  // Hands-on micro-states for each of the 4 realistic tools
  const [screenPoints, setScreenPoints] = useState<boolean[]>([false, false, false]);
  const [batteryLoadPct, setBatteryLoadPct] = useState<number>(0);
  const [batteryTesting, setBatteryTesting] = useState<boolean>(false);
  const [imeiInput, setImeiInput] = useState<string>('');
  const [imeiError, setImeiError] = useState<boolean>(false);
  const [imeiQuerying, setImeiQuerying] = useState<boolean>(false);
  const [imeiQueryPct, setImeiQueryPct] = useState<number>(0);
  const [simEjected, setSimEjected] = useState<boolean>(false);
  const [lensLit, setLensLit] = useState<boolean>(false);

  const [lastScanResult, setLastScanResult] = useState<{
    category: InspectionCategory;
    defects: DefectId[];
    caughtLie: boolean;
  } | null>(null);
  const [bonusAwarded, setBonusAwarded] = useState(false);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const startedUncheckedCount = useRef(
    Object.values(device.inspected).filter((v) => !v).length
  );

  // Clean 15-digit IMEI string & last 4 target digits for BTK terminal verification
  const cleanImei = useMemo(() => {
    const digits = (device.imeiNumber || '').replace(/\D/g, '');
    if (digits.length >= 4) return digits;
    return '354891024837219';
  }, [device.imeiNumber]);
  const imeiPrefix = cleanImei.slice(0, -4);
  const imeiLast4 = cleanImei.slice(-4);

  const inspectedCount = Object.values(device.inspected).filter(Boolean).length;
  const allChecked = inspectedCount === 4;

  // Complete a zone and fire sound + feedback
  const completeCategory = useCallback(
    (category: InspectionCategory) => {
      if (device.inspected[category]) return;
      const found = device.defects.filter(
        (d) => DEFECT_CATALOG[d].category === category
      );
      const caughtLie = Boolean(
        device.sellerClaim &&
          device.sellerClaimCategory === category &&
          found.length > 0
      );

      onInspectZone(category);
      setLastScanResult({ category, defects: found, caughtLie });

      if (caughtLie) {
        soundFX.playLieCaught();
      } else if (found.length > 0) {
        soundFX.playScanDefect();
      } else {
        soundFX.playScanOk();
      }
    },
    [device, onInspectZone]
  );

  useEffect(() => {
    if (
      allChecked &&
      !bonusAwarded &&
      startedUncheckedCount.current > 0 &&
      onPhysicalCompleteBonus
    ) {
      setBonusAwarded(true);
      onPhysicalCompleteBonus();
    }
  }, [allChecked, bonusAwarded, onPhysicalCompleteBonus]);

  // Battery amperemeter load test progression (pure state updater)
  useEffect(() => {
    if (!batteryTesting || device.inspected.battery) return;
    const interval = window.setInterval(() => {
      soundFX.playHeatTick();
      setBatteryLoadPct((prev) => Math.min(100, prev + 14));
    }, 95);
    return () => window.clearInterval(interval);
  }, [batteryTesting, device.inspected.battery]);

  // Complete battery inspection cleanly outside the setState updater
  useEffect(() => {
    if (batteryLoadPct >= 100 && !device.inspected.battery) {
      setBatteryTesting(false);
      completeCategory('battery');
    }
  }, [batteryLoadPct, device.inspected.battery, completeCategory]);

  const handleSelectTool = (cat: InspectionCategory) => {
    soundFX.playClick();
    setActiveTool(cat);
    const targetSide = cat === 'imei' || cat === 'hardware' ? 'back' : 'front';
    setSide(targetSide);
  };

  const handleTapScreenPoint = (idx: number) => {
    if (device.inspected.screen || screenPoints[idx]) return;
    soundFX.playClick();
    const next = [...screenPoints];
    next[idx] = true;
    setScreenPoints(next);
    if (next.every(Boolean)) {
      completeCategory('screen');
    }
  };

  // BTK database query simulation timer (pure state updater)
  useEffect(() => {
    if (!imeiQuerying || device.inspected.imei) return;
    const interval = window.setInterval(() => {
      soundFX.playHeatTick();
      setImeiQueryPct((prev) => Math.min(100, prev + 25));
    }, 140);
    return () => window.clearInterval(interval);
  }, [imeiQuerying, device.inspected.imei]);

  useEffect(() => {
    if (imeiQuerying && imeiQueryPct >= 100 && !device.inspected.imei) {
      setImeiQuerying(false);
      completeCategory('imei');
    }
  }, [imeiQuerying, imeiQueryPct, device.inspected.imei, completeCategory]);

  const handleImeiDigit = (digit: string) => {
    if (device.inspected.imei || imeiQuerying) return;
    soundFX.playClick();
    setImeiError(false);
    setImeiInput((prev) => (prev.length < 15 ? prev + digit : prev));
  };

  const handleImeiBackspace = () => {
    if (imeiQuerying) return;
    soundFX.playClick();
    setImeiError(false);
    setImeiInput((prev) => prev.slice(0, -1));
  };

  const handleSubmitImei = () => {
    if (device.inspected.imei || imeiQuerying) return;
    const cleaned = imeiInput.replace(/\D/g, '');
    if (cleaned === imeiLast4 || cleaned === cleanImei) {
      setImeiError(false);
      setImeiQueryPct(15);
      setImeiQuerying(true);
    } else {
      soundFX.playScanDefect();
      setImeiError(true);
    }
  };

  const handleEjectSim = () => {
    if (simEjected) return;
    soundFX.playConnectorSnap();
    setSimEjected(true);
    if (lensLit) {
      completeCategory('hardware');
    }
  };

  const handleShineLens = () => {
    if (lensLit) return;
    soundFX.playClick();
    setLensLit(true);
    if (simEjected) {
      completeCategory('hardware');
    }
  };

  const updateLoupeFromClient = useCallback((clientX: number, clientY: number) => {
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(8, Math.min(92, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(8, Math.min(92, ((clientY - rect.top) / rect.height) * 100));
    setLoupePos({ x, y, active: true });
  }, []);

  const isFold = device.cameraLayout === 'fold';
  const showCrack = device.defects.includes('screen_crack') && device.inspected.screen;
  const showAftermarket =
    device.defects.includes('screen_aftermarket') && device.inspected.screen;
  const showCosmetic = device.defects.includes('cosmetic_worn') && device.inspected.screen;
  const showBatteryBad =
    (device.defects.includes('battery_degraded') ||
      device.defects.includes('battery_fake_chip')) &&
    device.inspected.battery;
  const showFakeChip =
    device.defects.includes('battery_fake_chip') && device.inspected.battery;
  const showCameraFog =
    device.defects.includes('camera_fog') && (device.inspected.hardware || lensLit);
  const showLiquid =
    device.defects.includes('liquid_damage') && (device.inspected.hardware || simEjected);
  const showUnregistered =
    device.defects.includes('imei_unregistered') && device.inspected.imei;

  const revealedDefects = device.defects.filter(
    (d) => device.inspected[DEFECT_CATALOG[d].category]
  );

  const claimCat = device.sellerClaimCategory;
  const claimChecked = Boolean(claimCat && device.inspected[claimCat]);
  const claimIsLie = Boolean(
    claimChecked &&
      claimCat &&
      device.defects.some((d) => DEFECT_CATALOG[d].category === claimCat)
  );

  const activeZoneDefects = device.defects.filter(
    (d) => DEFECT_CATALOG[d].category === activeTool
  );
  const activeZoneChecked = device.inspected[activeTool];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/84 p-2 sm:p-3 select-none">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl max-h-[94dvh] flex flex-col overflow-hidden rounded-2xl border border-amber-400/30 bg-[#121923] shadow-[0_28px_80px_rgba(0,0,0,0.85)]"
      >
        {/* Compact Header */}
        <div className="shrink-0 px-3.5 py-2 border-b border-white/10 bg-[#0E141D] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 border border-amber-400/40 text-amber-400 shrink-0">
              <Search className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-display text-sm font-extrabold text-slate-50 truncate leading-tight">
                {bi('Elle Ekspertiz Masası', 'Hands-On Inspection Desk')} ·{' '}
                <span className="text-amber-400">
                  {device.brand} {device.model}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {bi(
                  'Ekranı elle kontrol et, USB-C pil ölçümü yap, IMEI son 4 hanesini sorgula ve SIM sıvı bandına bak!',
                  'Test screen touch points, run USB-C battery load, query last 4 IMEI digits & inspect SIM liquid strip!'
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="font-mono text-xs font-bold text-amber-300 tabular-nums">
              {inspectedCount}/4
            </span>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                onClose();
              }}
              aria-label={bi('Kapat', 'Close')}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/12 bg-[#1B2533] text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 12-Col Landscape Workbench Body (Zero Scroll) */}
        <div className="flex-1 min-h-0 overflow-hidden grid grid-cols-12 gap-2.5 p-2.5">
          {/* LEFT: Interactive Phone Surface + Live Visual Indicators */}
          <div className="col-span-5 flex flex-col items-center justify-between rounded-xl border border-white/10 bg-[#0D151E] p-2 relative overflow-hidden min-h-0">
            <div className="w-full flex items-center justify-between gap-2 mb-1 z-10 shrink-0">
              <span className="text-[10px] font-mono font-bold text-slate-300 truncate">
                {side === 'front'
                  ? bi('ÖN YÜZ · EKRAN & PİL', 'FRONT · DISPLAY & BATTERY')
                  : bi('ARKA YÜZ · SIVI BANDI & IMEI', 'BACK · LIQUID STRIP & IMEI')}
              </span>
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  const nextSide = side === 'front' ? 'back' : 'front';
                  setSide(nextSide);
                  setActiveTool(nextSide === 'front' ? 'screen' : 'imei');
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-[#1C2634] px-2 py-1 text-[10.5px] font-bold text-slate-200 hover:bg-[#263447] cursor-pointer whitespace-nowrap shrink-0"
              >
                <RotateCw className="w-3 h-3" />
                <span>{side === 'front' ? bi('Arka Yüz', 'Back') : bi('Ön Yüz', 'Front')}</span>
              </button>
            </div>

            <div
              ref={stageRef}
              onPointerMove={(e) => updateLoupeFromClient(e.clientX, e.clientY)}
              onPointerDown={(e) => updateLoupeFromClient(e.clientX, e.clientY)}
              onPointerLeave={() => setLoupePos((prev) => ({ ...prev, active: false }))}
              className="relative flex-1 min-h-0 w-full flex items-center justify-center rounded-xl border border-white/8 bg-[#121D27] overflow-hidden touch-none p-1.5"
              style={{
                backgroundImage:
                  'radial-gradient(rgba(148,163,184,0.14) 1px, transparent 1px)',
                backgroundSize: '14px 14px',
              }}
            >
              <motion.div
                key={side}
                initial={{ rotateY: side === 'back' ? -70 : 70, opacity: 0.45, scale: 0.94 }}
                animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className={`relative flex items-center justify-center h-full max-h-[250px] ${
                  isFold ? 'aspect-[180/280]' : 'aspect-[156/280]'
                }`}
              >
                <svg
                  viewBox={isFold ? '0 0 180 280' : '0 0 156 280'}
                  fill="none"
                  className="w-full h-full drop-shadow-[0_16px_26px_rgba(0,0,0,0.7)] pointer-events-none"
                >
                  <rect
                    x="10"
                    y="8"
                    width={isFold ? 160 : 136}
                    height="264"
                    rx="24"
                    fill={device.bodyColor}
                    stroke={showCosmetic ? '#F59E0B' : device.accentColor}
                    strokeWidth="3"
                  />
                  <rect
                    x={isFold ? 170 : 146}
                    y="72"
                    width="3.5"
                    height="34"
                    rx="1.5"
                    fill={device.accentColor}
                  />
                  <rect x="6.5" y="64" width="3.5" height="22" rx="1.5" fill={device.accentColor} />
                  <rect x="6.5" y="94" width="3.5" height="22" rx="1.5" fill={device.accentColor} />

                  {side === 'front' ? (
                    <>
                      <rect
                        x="18"
                        y="16"
                        width={isFold ? 144 : 120}
                        height="248"
                        rx="17"
                        fill={showAftermarket ? '#29394F' : '#0B1220'}
                      />
                      <rect
                        x={isFold ? 72 : 60}
                        y="24"
                        width="36"
                        height="9"
                        rx="4.5"
                        fill="#05080F"
                      />
                      {showAftermarket && (
                        <g opacity="0.6">
                          <rect
                            x="18"
                            y="16"
                            width={isFold ? 144 : 120}
                            height="248"
                            rx="17"
                            fill="#60A5FA"
                            fillOpacity="0.14"
                          />
                          <text
                            x={isFold ? 90 : 78}
                            y="130"
                            textAnchor="middle"
                            fill="#93C5FD"
                            fontFamily="'JetBrains Mono', monospace"
                            fontWeight="700"
                            fontSize="9"
                          >
                            TFT / YAN SANAYİ
                          </text>
                        </g>
                      )}
                      <text
                        x={isFold ? 90 : 78}
                        y="56"
                        textAnchor="middle"
                        fill="#E2E8F0"
                        fontFamily="'Bricolage Grotesque', sans-serif"
                        fontWeight="700"
                        fontSize="12"
                      >
                        {device.brand}
                      </text>
                      <text
                        x={isFold ? 90 : 78}
                        y="70"
                        textAnchor="middle"
                        fill="#94A3B8"
                        fontFamily="'Plus Jakarta Sans', sans-serif"
                        fontSize="9.5"
                      >
                        {device.model}
                      </text>

                      {showCrack && (
                        <g
                          stroke="#F8FAFC"
                          strokeOpacity="0.88"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        >
                          <path d="M24 38 L58 84 L42 126 L92 152" />
                          <path d="M58 84 L108 70 L132 95" />
                          <path d="M58 84 L68 118" />
                        </g>
                      )}

                      {/* Lower Battery Live Readout */}
                      <g transform={`translate(${isFold ? 36 : 26}, 178)`}>
                        <rect
                          x="0"
                          y="0"
                          width="104"
                          height="54"
                          rx="9"
                          fill="#131E2D"
                          stroke={
                            showBatteryBad
                              ? '#EF4444'
                              : device.inspected.battery
                              ? '#10B981'
                              : batteryTesting
                              ? '#F59E0B'
                              : '#334155'
                          }
                          strokeWidth="1.5"
                        />
                        <text
                          x="10"
                          y="16"
                          fill="#94A3B8"
                          fontFamily="'Plus Jakarta Sans', sans-serif"
                          fontSize="7.5"
                        >
                          {showFakeChip
                            ? bi('SAHTE BMS ÇİPİ!', 'SPOOFED BMS!')
                            : bi('USB-C PİL TESTİ', 'USB-C BATTERY')}
                        </text>
                        <text
                          x="10"
                          y="35"
                          fill={
                            showBatteryBad
                              ? '#F87171'
                              : device.inspected.battery
                              ? '#34D399'
                              : '#F8FAFC'
                          }
                          fontFamily="'JetBrains Mono', monospace"
                          fontWeight="700"
                          fontSize="14"
                        >
                          %{device.inspected.battery ? device.batteryHealth : device.reportedBatteryHealth}
                        </text>
                        <text
                          x="10"
                          y="47"
                          fill="#64748B"
                          fontFamily="'JetBrains Mono', monospace"
                          fontSize="7.5"
                        >
                          {device.inspected.battery
                            ? `${device.batteryCycles} ${bi('devir', 'cycles')}`
                            : batteryTesting
                            ? `${bi('Ölçülüyor', 'Testing')} %${batteryLoadPct}`
                            : bi('Kablo takılmadı', 'Not plugged in')}
                        </text>
                      </g>

                      {/* USB-C Amperemeter Plug Visual at Bottom */}
                      {(batteryTesting || device.inspected.battery) && (
                        <g>
                          <rect
                            x={isFold ? 80 : 68}
                            y="266"
                            width="20"
                            height="12"
                            rx="3"
                            fill="#F59E0B"
                          />
                          <rect
                            x={isFold ? 87 : 75}
                            y="276"
                            width="6"
                            height="12"
                            fill="#94A3B8"
                          />
                        </g>
                      )}
                    </>
                  ) : (
                    /* BACK VIEW: SIM Ejected Liquid Strip + Rear Camera + Full Laser IMEI */
                    <>
                      <rect
                        x="16"
                        y="14"
                        width={isFold ? 148 : 124}
                        height="252"
                        rx="19"
                        fill={device.bodyColor}
                        stroke="#FFFFFF"
                        strokeOpacity="0.1"
                        strokeWidth="1"
                      />

                      {/* SIM Tray & Liquid Contact Indicator (LCI) Strip */}
                      <g>
                        <rect
                          x={simEjected || device.inspected.hardware ? '0' : '6.5'}
                          y="108"
                          width={simEjected || device.inspected.hardware ? '16' : '4'}
                          height="34"
                          rx="2"
                          fill={showLiquid ? '#EF4444' : simEjected || device.inspected.hardware ? '#94A3B8' : '#475569'}
                        />
                        <circle
                          cx="24"
                          cy="125"
                          r="6"
                          fill={
                            showLiquid
                              ? '#EF4444'
                              : simEjected || device.inspected.hardware
                              ? '#F8FAFC'
                              : '#334155'
                          }
                          stroke="#0F141B"
                          strokeWidth="1.5"
                        />
                        {(simEjected || device.inspected.hardware) && (
                          <text
                            x="34"
                            y="128"
                            fill={showLiquid ? '#FCA5A5' : '#A7F3D0'}
                            fontFamily="'JetBrains Mono', monospace"
                            fontWeight="700"
                            fontSize="7.5"
                          >
                            {showLiquid ? 'LCI KIRMIZI!' : 'LCI BEYAZ ✓'}
                          </text>
                        )}
                      </g>

                      {/* Camera Module */}
                      <rect
                        x="24"
                        y="24"
                        width="58"
                        height="62"
                        rx="14"
                        fill="#0C1118"
                        stroke={showCameraFog ? '#F59E0B' : lensLit ? '#38BDF8' : device.accentColor}
                        strokeOpacity="0.8"
                        strokeWidth="1.8"
                      />
                      <circle cx="39" cy="40" r="10" fill="#1E293B" stroke="#64748B" strokeWidth="1.6" />
                      <circle cx="39" cy="40" r="4.5" fill={showCameraFog ? '#CBD5E1' : '#090F1A'} />
                      <circle cx="39" cy="67" r="10" fill="#1E293B" stroke="#64748B" strokeWidth="1.6" />
                      <circle cx="39" cy="67" r="4.5" fill={showCameraFog ? '#CBD5E1' : '#090F1A'} />
                      <circle cx="65" cy="54" r="9.5" fill="#1E293B" stroke="#64748B" strokeWidth="1.6" />
                      <circle cx="65" cy="54" r="4.2" fill={showCameraFog ? '#CBD5E1' : '#090F1A'} />
                      <circle cx="66" cy="34" r="3.5" fill="#FEF3C7" />

                      {showCameraFog && (
                        <g>
                          <circle cx="50" cy="54" r="24" fill="#E2E8F0" fillOpacity="0.38" />
                          <circle cx="43" cy="44" r="2.2" fill="#FFFFFF" fillOpacity="0.8" />
                          <circle cx="57" cy="59" r="1.8" fill="#FFFFFF" fillOpacity="0.7" />
                        </g>
                      )}

                      {/* Laser-Etched IMEI Plaque (Always shows full number so player can read & type last 4 digits!) */}
                      <g transform={`translate(${isFold ? 24 : 20}, 200)`}>
                        <rect
                          x="0"
                          y="0"
                          width={isFold ? 132 : 116}
                          height="50"
                          rx="8"
                          fill="#0E1520"
                          fillOpacity="0.95"
                          stroke={
                            showUnregistered
                              ? '#EF4444'
                              : device.inspected.imei
                              ? '#10B981'
                              : '#F59E0B'
                          }
                          strokeWidth="1.5"
                        />
                        <text
                          x={isFold ? 66 : 58}
                          y="14"
                          textAnchor="middle"
                          fill="#94A3B8"
                          fontFamily="'JetBrains Mono', monospace"
                          fontSize="7"
                        >
                          LAZER IMEI · {device.storage}
                        </text>
                        <text
                          x={isFold ? 66 : 58}
                          y="29"
                          textAnchor="middle"
                          fill="#F8FAFC"
                          fontFamily="'JetBrains Mono', monospace"
                          fontWeight="700"
                          fontSize="8.2"
                        >
                          {imeiPrefix}
                          <tspan fill="#FBBF24">{imeiLast4}</tspan>
                        </text>
                        <text
                          x={isFold ? 66 : 58}
                          y="42"
                          textAnchor="middle"
                          fill={
                            showUnregistered
                              ? '#F87171'
                              : device.inspected.imei
                              ? '#34D399'
                              : '#F59E0B'
                          }
                          fontFamily="'JetBrains Mono', monospace"
                          fontWeight="700"
                          fontSize="7"
                        >
                          {showUnregistered
                            ? bi('YURT DIŞI · KAYITSIZ!', 'UNREGISTERED!')
                            : device.inspected.imei
                            ? bi('TR KAYITLI ✓', 'TR VERIFIED ✓')
                            : bi(`SON 4 HANE: ${imeiLast4}`, `LAST 4: ${imeiLast4}`)}
                        </text>
                      </g>
                    </>
                  )}
                </svg>

                {/* Direct Touch-Check Dots on Phone Screen when Display Tool is Active */}
                {side === 'front' && activeTool === 'screen' && !device.inspected.screen && (
                  <>
                    {SCREEN_CHECK_POINTS.map((pt) => {
                      const done = screenPoints[pt.id];
                      return (
                        <button
                          key={pt.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTapScreenPoint(pt.id);
                          }}
                          style={{ left: `${pt.xPct}%`, top: `${pt.yPct}%` }}
                          className={`absolute -translate-x-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all cursor-pointer z-20 ${
                            done
                              ? 'border-emerald-400 bg-emerald-500/30 text-emerald-200 scale-90'
                              : 'border-amber-400 bg-amber-500/25 text-amber-200 hover:scale-110 shadow-[0_0_16px_rgba(245,158,11,0.65)]'
                          }`}
                        >
                          {done ? <Check className="w-4 h-4" /> : <Search className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </>
                )}
              </motion.div>

              {loupePos.active && (
                <div
                  style={{ left: `${loupePos.x}%`, top: `${loupePos.y}%` }}
                  className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full border-2 border-sky-300/60 bg-sky-300/5 z-30"
                />
              )}
            </div>

            {/* Live Scan Result Strip */}
            <div className="w-full mt-1.5 min-h-[26px] shrink-0 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {lastScanResult ? (
                  <motion.div
                    key={`${lastScanResult.category}-${lastScanResult.defects.length}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`w-full rounded-lg border px-2 py-1 text-[10.5px] font-semibold flex items-center justify-between gap-2 ${
                      lastScanResult.defects.length > 0
                        ? 'border-rose-500/45 bg-rose-500/14 text-rose-200'
                        : 'border-emerald-500/35 bg-emerald-500/12 text-emerald-200'
                    }`}
                  >
                    <span className="truncate">
                      {lastScanResult.defects.length > 0
                        ? `${bi('Kusur', 'Fault')}: ${lastScanResult.defects
                            .map((d) => getLocalizedDefect(d, lang).name)
                            .join(', ')}`
                        : `${getLocalizedCategoryLabel(lastScanResult.category, lang)}: ${bi(
                            'Tertemiz ✓',
                            'Clean ✓'
                          )}`}
                    </span>
                    {lastScanResult.caughtLie && (
                      <span className="shrink-0 rounded bg-rose-500 px-1.5 py-0.5 font-mono text-[9px] font-extrabold text-white">
                        {bi('YALAN!', 'LIE!')}
                      </span>
                    )}
                  </motion.div>
                ) : (
                  <div className="text-[10px] text-slate-400 truncate">
                    {bi(
                      'Sağdaki ekspertiz araçlarını kullanarak cihazı bizzat test et.',
                      'Use the hands-on bench tools on the right to inspect the phone.'
                    )}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT: 4 Tool Switcher + Active Hands-On Diagnostic Bench */}
          <div className="col-span-7 min-h-0 flex flex-col justify-between gap-2 overflow-hidden">
            {/* Top: Tool Tabs + Seller Claim */}
            <div className="shrink-0 space-y-1.5">
              <div className="grid grid-cols-4 gap-1.5">
                {TOOL_TABS.map((tab) => {
                  const checked = device.inspected[tab.category];
                  const hasDefect =
                    checked &&
                    device.defects.some((d) => DEFECT_CATALOG[d].category === tab.category);
                  const isActive = activeTool === tab.category;
                  return (
                    <button
                      key={tab.category}
                      type="button"
                      onClick={() => handleSelectTool(tab.category)}
                      className={`rounded-lg border px-2 py-1.5 text-[10.5px] font-bold flex items-center justify-between gap-1 transition-all cursor-pointer ${
                        isActive
                          ? 'border-amber-400 bg-amber-500/18 text-amber-200'
                          : checked
                          ? hasDefect
                            ? 'border-rose-500/40 bg-rose-500/10 text-rose-200'
                            : 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200'
                          : 'border-white/10 bg-[#182332] text-slate-300 hover:border-white/25'
                      }`}
                    >
                      <span className="inline-flex items-center gap-1 truncate">
                        {tab.icon}
                        <span className="truncate">
                          {lang === 'en' ? tab.enLabel : tab.trLabel}
                        </span>
                      </span>
                      {checked &&
                        (hasDefect ? (
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ))}
                    </button>
                  );
                })}
              </div>

              {device.sellerClaim && (
                <div
                  className={`rounded-lg border px-2.5 py-1 text-[10.5px] flex items-center justify-between gap-2 ${
                    claimIsLie
                      ? 'border-rose-500/50 bg-rose-500/14 text-rose-100'
                      : claimChecked
                      ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-100'
                      : 'border-amber-500/25 bg-amber-500/8 text-amber-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    {claimIsLie ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    ) : claimChecked ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <MessageSquareQuote className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                    <div className="min-w-0 truncate italic">“{device.sellerClaim}”</div>
                  </div>
                  {claimIsLie && (
                    <span className="shrink-0 rounded bg-rose-500 px-1.5 py-0.5 font-mono text-[9px] font-extrabold text-white">
                      {bi('YALAN!', 'LIE!')}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Middle: Active Tool Interactive Area */}
            <div className="flex-1 min-h-0 rounded-xl border border-white/10 bg-[#151E2B] p-3 flex flex-col justify-center overflow-hidden">
              {activeZoneChecked ? (
                <div className="space-y-2 text-center">
                  <div
                    className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      activeZoneDefects.length > 0
                        ? 'border-rose-500/60 bg-rose-500/15 text-rose-400'
                        : 'border-emerald-500/60 bg-emerald-500/15 text-emerald-400'
                    }`}
                  >
                    {activeZoneDefects.length > 0 ? (
                      <ShieldAlert className="w-5 h-5" />
                    ) : (
                      <Check className="w-5 h-5" />
                    )}
                  </div>
                  <div className="font-display text-sm font-extrabold text-slate-100">
                    {activeZoneDefects.length > 0
                      ? activeZoneDefects.map((d) => getLocalizedDefect(d, lang).name).join(' · ')
                      : `${getLocalizedCategoryLabel(activeTool, lang)} — ${bi(
                          'Tertemiz & Sorunsuz ✓',
                          'Clean & Verified ✓'
                        )}`}
                  </div>
                  {activeTool === 'imei' && (
                    <div
                      className={`rounded-xl border p-2.5 text-left font-mono text-[10.5px] space-y-1 tabular-nums ${
                        showUnregistered
                          ? 'border-rose-500/45 bg-rose-500/10'
                          : 'border-emerald-500/40 bg-emerald-500/10'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-400">BTK IMEI:</span>
                        <span className="font-extrabold text-slate-100">{cleanImei}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-400">{bi('Durum', 'Status')}:</span>
                        <span
                          className={
                            showUnregistered
                              ? 'text-rose-300 font-extrabold'
                              : 'text-emerald-300 font-extrabold'
                          }
                        >
                          {showUnregistered
                            ? bi('YURT DIŞI / KAYITSIZ ⚠', 'UNREGISTERED OVERSEAS ⚠')
                            : bi('TR RESMİ KAYITLI ✓', 'TR OFFICIALLY REGISTERED ✓')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-400">{bi('Kasa Eşleşmesi', 'Chassis Match')}:</span>
                        <span className="text-slate-200 font-sans font-bold truncate">
                          {device.brand} {device.model} ✓
                        </span>
                      </div>
                      <div className="font-sans text-[10px] text-slate-300 border-t border-white/10 pt-1">
                        {showUnregistered
                          ? bi(
                              'BTK Kaydı Yok: 120 gün içinde şebekeye kapanır — pasaport kaydı gerekir!',
                              'No BTK Record: Cellular signal locks after 120 days unless registered!'
                            )
                          : bi(
                              'İthalat yoluyla kaydedilen resmi Türkiye cihazı — şebeke sorunu yok.',
                              'Officially imported & registered device — clean network status.'
                            )}
                      </div>
                    </div>
                  )}
                  {activeTool === 'battery' && (
                    <div className="font-mono text-xs text-slate-300 tabular-nums">
                      {bi('Gerçek Sağlık', 'True Health')}: %{device.batteryHealth} ·{' '}
                      {device.batteryCycles} {bi('Döngü', 'Cycles')}
                    </div>
                  )}
                  {/* Quick jump to next unchecked tool */}
                  {!allChecked && (
                    <button
                      type="button"
                      onClick={() => {
                        const nextTab = TOOL_TABS.find((t) => !device.inspected[t.category]);
                        if (nextTab) handleSelectTool(nextTab.category);
                      }}
                      className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-extrabold text-slate-950 hover:bg-amber-400 cursor-pointer"
                    >
                      <span>{bi('Sıradaki Kontrole Geç →', 'Next Inspection Tool →')}</span>
                    </button>
                  )}
                </div>
              ) : activeTool === 'screen' ? (
                /* HANDS-ON 1: SCREEN TOUCH & PANEL CHECK */
                <div className="space-y-2.5">
                  <div>
                    <div className="text-xs font-extrabold text-amber-400">
                      {bi('Ekran Camı & Dokunmatik Kontrolü', 'Display Glass & Touch Check')}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {bi(
                        'Soldaki ekranda veya aşağıdaki 3 bölgede parlayan noktalara dokunarak cam, OLED rengi ve dokunmatik hassasiyetini test et.',
                        'Tap all 3 zones on the phone display or below to verify glass, OLED tint & touch matrix.'
                      )}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {SCREEN_CHECK_POINTS.map((pt) => {
                      const done = screenPoints[pt.id];
                      return (
                        <button
                          key={pt.id}
                          type="button"
                          onClick={() => handleTapScreenPoint(pt.id)}
                          className={`rounded-xl border px-2 py-2.5 text-center transition-all cursor-pointer ${
                            done
                              ? 'border-emerald-500/45 bg-emerald-500/15 text-emerald-200'
                              : 'border-amber-400/45 bg-amber-500/12 text-amber-100 hover:bg-amber-500/20'
                          }`}
                        >
                          <div className="text-[11px] font-extrabold">
                            {done ? '✓' : '●'} {lang === 'en' ? pt.en : pt.tr}
                          </div>
                          <div className="text-[9.5px] opacity-80 mt-0.5">
                            {done ? bi('Kontrol Edildi', 'Checked') : bi('Dokun', 'Tap')}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : activeTool === 'battery' ? (
                /* HANDS-ON 2: USB-C AMPEREMETER LOAD TEST */
                <div className="space-y-2.5">
                  <div>
                    <div className="text-xs font-extrabold text-amber-400">
                      {bi('USB-C Ampermetre & Pil Yük Testi', 'USB-C Amperemeter & Battery Load')}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {bi(
                        'Ekranda %' +
                          device.reportedBatteryHealth +
                          ' yazıyor ama BMS çipi kandırılmış olabilir! USB-C ölçeri bağlayıp basılı tut.',
                        'Screen reports ' +
                          device.reportedBatteryHealth +
                          '%, but BMS chips can be spoofed! Hold the USB-C load test.'
                      )}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#0F1722] p-2.5 space-y-1.5 tabular-nums">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">
                        {bi('Ölçüm İlerlemesi', 'Load Diagnostic')}
                      </span>
                      <span className="font-mono font-bold text-amber-300">
                        {batteryLoadPct}% · {(3.82 + (batteryLoadPct / 100) * 0.35).toFixed(2)}V
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-100"
                        style={{ width: `${batteryLoadPct}%` }}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onPointerDown={() => setBatteryTesting(true)}
                    onPointerUp={() => setBatteryTesting(false)}
                    onPointerLeave={() => setBatteryTesting(false)}
                    onPointerCancel={() => setBatteryTesting(false)}
                    className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all cursor-pointer select-none ${
                      batteryTesting
                        ? 'bg-emerald-500 text-slate-950 scale-[0.98]'
                        : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    <span>
                      {batteryTesting
                        ? bi(`Akım Ölçülüyor... (%${batteryLoadPct})`, `Measuring Load... (${batteryLoadPct}%)`)
                        : bi('USB-C Ölçeri Basılı Tut', 'Hold USB-C Load Test')}
                    </span>
                  </button>
                </div>
              ) : activeTool === 'imei' ? (
                /* HANDS-ON 3: BTK IMEI SORGU PANELI & VERITABANI SIMULASYONU */
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-extrabold text-amber-400">
                        {bi('BTK IMEI Sorgu Paneli', 'BTK IMEI Database Query')}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {bi(
                          'Kasa IMEI’sinin son 4 hanesini (veya tamamını) yazıp BTK veritabanında sorgula:',
                          'Type the last 4 digits (or full IMEI) from the chassis to query BTK database:'
                        )}
                      </div>
                    </div>
                    <div className="rounded-lg border border-amber-400/35 bg-[#0C121B] px-2 py-1 text-right font-mono tabular-nums shrink-0">
                      <div className="text-[8.5px] text-slate-400">
                        {bi('KASA / SIM IMEI', 'CHASSIS IMEI')}
                      </div>
                      <div className="text-[11px] font-bold text-slate-200">
                        {imeiPrefix}
                        <span className="text-amber-400">{imeiLast4}</span>
                      </div>
                    </div>
                  </div>

                  {imeiQuerying ? (
                    <div className="rounded-xl border border-sky-400/40 bg-sky-500/10 p-3 space-y-2 tabular-nums">
                      <div className="flex items-center justify-between text-xs font-bold text-sky-200">
                        <span>
                          {imeiQueryPct < 50
                            ? bi('BTK Sunucusuna Bağlanılıyor...', 'Connecting to BTK Server...')
                            : bi('GSMA & İthalat Kaydı Doğrulanıyor...', 'Verifying GSMA & Import Record...')}
                        </span>
                        <span className="font-mono text-amber-300">{imeiQueryPct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-sky-400 transition-all duration-150"
                          style={{ width: `${imeiQueryPct}%` }}
                        />
                      </div>
                      <div className="font-mono text-[10px] text-slate-300">
                        IMEI: {cleanImei} · {device.brand} {device.model}
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Manual Input + Compare + Query */}
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={15}
                          value={imeiInput}
                          onChange={(e) => {
                            setImeiError(false);
                            setImeiInput(e.target.value.replace(/\D/g, '').slice(0, 15));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && imeiInput.length >= 4) {
                              handleSubmitImei();
                            }
                          }}
                          placeholder={bi(`Son 4 hane (${imeiLast4}) veya 15 hane...`, `Last 4 (${imeiLast4}) or 15 digits...`)}
                          className={`flex-1 min-w-0 rounded-lg border px-2.5 py-1.5 font-mono text-xs font-extrabold tracking-wider tabular-nums outline-none ${
                            imeiError
                              ? 'border-rose-500 bg-rose-500/15 text-rose-200 placeholder:text-rose-300/60'
                              : 'border-sky-400/35 bg-[#0A111A] text-sky-200 placeholder:text-slate-500 focus:border-amber-400'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            soundFX.playClick();
                            setImeiError(false);
                            setImeiInput(cleanImei);
                          }}
                          className="rounded-lg border border-white/12 bg-[#1A2535] px-2 py-1.5 text-[10px] font-bold text-slate-200 hover:bg-[#243348] cursor-pointer whitespace-nowrap"
                          title={bi('Cihaz kasasındaki IMEI’yi al', 'Copy IMEI from chassis')}
                        >
                          {bi('Eşleştir', 'Match')}
                        </button>
                        <button
                          type="button"
                          disabled={imeiInput.length < 4}
                          onClick={handleSubmitImei}
                          className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-extrabold text-slate-950 hover:bg-emerald-400 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                        >
                          {bi('BTK Sorgula', 'Query BTK')}
                        </button>
                      </div>

                      {imeiError && (
                        <div className="text-[10px] font-bold text-rose-400">
                          {bi(
                            `IMEI uyuşmuyor! Kasa üzerindeki son 4 hane (${imeiLast4}) veya tam 15 haneyi gir.`,
                            `IMEI mismatch! Enter the chassis last 4 digits (${imeiLast4}) or full 15 digits.`
                          )}
                        </div>
                      )}

                      {/* Compact Mobile-Friendly Numpad */}
                      <div className="grid grid-cols-6 gap-1">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => handleImeiDigit(d)}
                            className="rounded-lg border border-white/10 bg-[#1D2838] hover:bg-[#273549] active:scale-95 py-1 font-mono text-xs font-bold text-slate-100 cursor-pointer"
                          >
                            {d}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={handleImeiBackspace}
                          aria-label={bi('Sil', 'Delete')}
                          className="col-span-2 rounded-lg border border-rose-500/30 bg-rose-500/12 hover:bg-rose-500/20 py-1 text-[11px] font-bold text-rose-200 inline-flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Delete className="w-3.5 h-3.5" />
                          <span>{bi('Sil', 'Del')}</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* HANDS-ON 4: SIM TRAY LIQUID STRIP (LCI) & REAR CAMERA FLASHLIGHT */
                <div className="space-y-2.5">
                  <div>
                    <div className="text-xs font-extrabold text-amber-400">
                      {bi('Sıvı Bandı (LCI) & Arka Kamera Kontrolü', 'Liquid Strip (LCI) & Rear Lens Check')}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {bi(
                        'SIM tepsisini çıkarıp içindeki sıvı bandının rengine bak (Beyaz = Kuru, Kırmızı = Sıvı Teması!) ve kamera merceğine fener tut.',
                        'Eject the SIM tray to check the LCI moisture strip (White = Dry, Red = Liquid!) and shine light into the rear lens.'
                      )}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleEjectSim}
                      className={`rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                        simEjected
                          ? showLiquid
                            ? 'border-rose-500/50 bg-rose-500/15 text-rose-100'
                            : 'border-emerald-500/45 bg-emerald-500/15 text-emerald-100'
                          : 'border-amber-400/45 bg-amber-500/12 text-amber-100 hover:bg-amber-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-extrabold">
                        <Droplets className="w-3.5 h-3.5" />
                        <span>{bi('1. SIM Tepsisini Çıkar', '1. Eject SIM Tray')}</span>
                      </div>
                      <div className="text-[10px] mt-1 opacity-85">
                        {simEjected
                          ? showLiquid
                            ? bi('LCI Bandı KIRMIZI — Sıvı var!', 'LCI Strip RED — Liquid damage!')
                            : bi('LCI Bandı BEYAZ — Kuru ✓', 'LCI Strip WHITE — Dry ✓')
                          : bi('Sıvı bandını görmek için dokun', 'Tap to inspect moisture strip')}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={handleShineLens}
                      className={`rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                        lensLit
                          ? showCameraFog
                            ? 'border-rose-500/50 bg-rose-500/15 text-rose-100'
                            : 'border-emerald-500/45 bg-emerald-500/15 text-emerald-100'
                          : 'border-sky-400/45 bg-sky-500/12 text-sky-100 hover:bg-sky-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-extrabold">
                        <Flashlight className="w-3.5 h-3.5" />
                        <span>{bi('2. Lense Fener Tut', '2. Shine Lens Light')}</span>
                      </div>
                      <div className="text-[10px] mt-1 opacity-85">
                        {lensLit
                          ? showCameraFog
                            ? bi('Mercekte BUĞU / Nem var!', 'Lens FOG / Moisture detected!')
                            : bi('Mercek cam gibi berrak ✓', 'Rear optics crystal clear ✓')
                          : bi('Kamera buğusunu kontrol et', 'Check rear lens condensation')}
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Summary & Close CTA */}
            <div className="shrink-0 space-y-1.5 pt-1 border-t border-white/10">
              {allChecked && (
                <div className="rounded-lg border border-emerald-500/35 bg-emerald-500/12 px-2.5 py-1 flex items-center justify-between gap-2 text-[11px]">
                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-300 truncate">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {revealedDefects.length > 0
                        ? bi(
                            `4/4 Ekspertiz Tamam! ${revealedDefects.length} kusur tespit edildi.`,
                            `4/4 Inspection Complete! ${revealedDefects.length} defect(s) exposed.`
                          )
                        : bi(
                            '4/4 Ekspertiz Tamam! Cihaz tertemiz çıktı.',
                            '4/4 Inspection Complete! Device is spotless.'
                          )}
                    </span>
                  </span>
                  {bonusAwarded && (
                    <span className="font-mono text-[10px] font-extrabold text-amber-300 shrink-0">
                      {bi('✓ Dedektif', '✓ Detective')}
                    </span>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onClose();
                }}
                className={`w-full rounded-xl py-2 text-xs font-extrabold transition-colors cursor-pointer ${
                  allChecked
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    : 'border border-white/15 bg-[#1B2533] text-slate-100 hover:bg-[#243244]'
                }`}
              >
                {allChecked
                  ? bi('Pazarlığa Dön →', 'Back to Negotiation →')
                  : bi(
                      `Tezgaha Dön (${inspectedCount}/4 İncelendi)`,
                      `Return to Counter (${inspectedCount}/4 Checked)`
                    )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
