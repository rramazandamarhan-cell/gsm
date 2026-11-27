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
  Phone,
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
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [lcdPulse, setLcdPulse] = useState<boolean>(false);
  const pressedKeyTimerRef = useRef<number | null>(null);
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

  useEffect(() => {
    return () => {
      if (pressedKeyTimerRef.current !== null) {
        window.clearTimeout(pressedKeyTimerRef.current);
      }
    };
  }, []);

  const flashKeypadKey = (keyId: string) => {
    setPressedKey(keyId);
    setLcdPulse(true);
    if (pressedKeyTimerRef.current !== null) {
      window.clearTimeout(pressedKeyTimerRef.current);
    }
    pressedKeyTimerRef.current = window.setTimeout(() => {
      setPressedKey(null);
      setLcdPulse(false);
    }, 170);
  };

  const handleImeiDigit = (digit: string) => {
    if (device.inspected.imei || imeiQuerying) return;
    flashKeypadKey(digit);
    soundFX.playKeypadTone(digit);
    setImeiError(false);
    setImeiInput((prev) => (prev.length < 15 ? prev + digit : prev));
  };

  const handleImeiBackspace = () => {
    if (imeiQuerying) return;
    flashKeypadKey('DEL');
    soundFX.playKeypadTone('*');
    setImeiError(false);
    setImeiInput((prev) => prev.slice(0, -1));
  };

  const handleSubmitImei = () => {
    if (device.inspected.imei || imeiQuerying) return;
    flashKeypadKey('CALL');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/84 p-1 sm:p-1.5 select-none">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-3xl h-[96dvh] max-h-[480px] flex flex-col overflow-hidden rounded-xl border border-amber-400/30 bg-[#121923] shadow-[0_24px_60px_rgba(0,0,0,0.85)]"
      >
        {/* Compact Single-Line Header */}
        <div className="shrink-0 px-2.5 py-1 border-b border-white/10 bg-[#0E141D] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-500/15 border border-amber-400/40 text-amber-400 shrink-0">
              <Search className="w-3 h-3" />
            </div>
            <div className="min-w-0">
              <div className="font-display text-[11px] sm:text-xs font-extrabold text-slate-50 truncate leading-tight">
                {bi('Elle Ekspertiz Masası', 'Hands-On Inspection Desk')} ·{' '}
                <span className="text-amber-400">
                  {device.brand} {device.model}
                </span>
              </div>
              <div className="hidden [@media(min-height:520px)]:block text-[9.5px] text-slate-400 truncate">
                {bi(
                  'Ekranı elle kontrol et, USB-C pil ölçümü yap, IMEI son 4 hanesini sorgula ve SIM sıvı bandına bak!',
                  'Test screen touch points, run USB-C battery load, query last 4 IMEI digits & inspect SIM liquid strip!'
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="font-mono text-[10.5px] font-bold text-amber-300 tabular-nums">
              {inspectedCount}/4
            </span>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                onClose();
              }}
              aria-label={bi('Kapat', 'Close')}
              className="flex h-6 w-6 items-center justify-center rounded-md border border-white/12 bg-[#1B2533] text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Strict Zero-Scroll 12-Col Workbench Body */}
        <div className="flex-1 min-h-0 overflow-hidden grid grid-cols-12 gap-1.5 p-1.5">
          {/* LEFT: Interactive Phone Surface + Live Visual Indicators */}
          <div className="col-span-5 min-h-0 flex flex-col items-center justify-between rounded-xl border border-white/10 bg-[#0D151E] p-1.5 relative overflow-hidden">
            <div className="w-full flex items-center justify-between gap-1 mb-1 z-10 shrink-0">
              <span className="text-[9px] sm:text-[9.5px] font-mono font-bold text-slate-300 truncate">
                {side === 'front'
                  ? bi('ÖN YÜZ · EKRAN & PİL', 'FRONT · DISPLAY & BATTERY')
                  : bi('ARKA YÜZ · SIVI & IMEI', 'BACK · LIQUID & IMEI')}
              </span>
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  const nextSide = side === 'front' ? 'back' : 'front';
                  setSide(nextSide);
                  setActiveTool(nextSide === 'front' ? 'screen' : 'imei');
                }}
                className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-[#1C2634] px-1.5 py-0.5 text-[9.5px] font-bold text-slate-200 hover:bg-[#263447] cursor-pointer whitespace-nowrap shrink-0"
              >
                <RotateCw className="w-2.5 h-2.5" />
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

          {/* RIGHT: 4 Tool Switcher + Active Hands-On Diagnostic Bench (Strict Zero Scroll) */}
          <div className="col-span-7 min-h-0 flex flex-col justify-between gap-1 [@media(min-height:500px)]:gap-1.5 overflow-hidden">
            {/* Top: Tool Tabs + Seller Claim */}
            <div className="shrink-0 space-y-1">
              <div className="grid grid-cols-4 gap-1">
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
                      className={`rounded-lg border px-1.5 py-1 text-[9.5px] sm:text-[10px] font-bold flex items-center justify-between gap-0.5 transition-all cursor-pointer min-w-0 ${
                        isActive
                          ? 'border-amber-400 bg-amber-500/18 text-amber-200'
                          : checked
                          ? hasDefect
                            ? 'border-rose-500/40 bg-rose-500/10 text-rose-200'
                            : 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200'
                          : 'border-white/10 bg-[#182332] text-slate-300 hover:border-white/25'
                      }`}
                    >
                      <span className="inline-flex items-center gap-1 truncate min-w-0">
                        {tab.icon}
                        <span className="truncate">
                          {lang === 'en' ? tab.enLabel : tab.trLabel}
                        </span>
                      </span>
                      {checked &&
                        (hasDefect ? (
                          <ShieldAlert className="w-3 h-3 text-rose-400 shrink-0" />
                        ) : (
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                        ))}
                    </button>
                  );
                })}
              </div>

              {device.sellerClaim && (
                <div
                  className={`rounded-md border px-2 py-0.5 text-[9.5px] flex items-center justify-between gap-1.5 ${
                    claimIsLie
                      ? 'border-rose-500/50 bg-rose-500/14 text-rose-100'
                      : claimChecked
                      ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-100'
                      : 'border-amber-500/25 bg-amber-500/8 text-amber-100'
                  }`}
                >
                  <div className="flex items-center gap-1 min-w-0">
                    {claimIsLie ? (
                      <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                    ) : claimChecked ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    ) : (
                      <MessageSquareQuote className="w-3 h-3 text-amber-400 shrink-0" />
                    )}
                    <div className="min-w-0 truncate italic">“{device.sellerClaim}”</div>
                  </div>
                  {claimIsLie && (
                    <span className="shrink-0 rounded bg-rose-500 px-1 py-0.2 font-mono text-[8.5px] font-extrabold text-white">
                      {bi('YALAN!', 'LIE!')}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Middle: Active Tool Interactive Area (Zero Clip, Zero Scroll) */}
            <div className="flex-1 min-h-0 rounded-xl border border-white/10 bg-[#151E2B] p-1.5 [@media(min-height:500px)]:p-2 flex flex-col justify-center overflow-hidden">
              {activeZoneChecked ? (
                <div className="space-y-1.5 text-center">
                  <div
                    className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                      activeZoneDefects.length > 0
                        ? 'border-rose-500/60 bg-rose-500/15 text-rose-400'
                        : 'border-emerald-500/60 bg-emerald-500/15 text-emerald-400'
                    }`}
                  >
                    {activeZoneDefects.length > 0 ? (
                      <ShieldAlert className="w-4 h-4" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </div>
                  <div className="font-display text-xs sm:text-sm font-extrabold text-slate-100 leading-tight">
                    {activeZoneDefects.length > 0
                      ? activeZoneDefects.map((d) => getLocalizedDefect(d, lang).name).join(' · ')
                      : `${getLocalizedCategoryLabel(activeTool, lang)} — ${bi(
                          'Tertemiz & Sorunsuz ✓',
                          'Clean & Verified ✓'
                        )}`}
                  </div>
                  {activeTool === 'imei' && (
                    <div
                      className={`rounded-lg border p-1.5 text-left font-mono text-[9.5px] space-y-0.5 tabular-nums ${
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
                      <div className="font-sans text-[9px] text-slate-300 border-t border-white/10 pt-0.5 truncate">
                        {showUnregistered
                          ? bi(
                              'BTK Kaydı Yok: 120 gün sonra şebekeye kapanır!',
                              'No BTK Record: Cellular signal locks after 120 days!'
                            )
                          : bi(
                              'Resmi Türkiye ithalat kayıtlı — şebeke sorunu yok.',
                              'Officially imported & registered — clean network status.'
                            )}
                      </div>
                    </div>
                  )}
                  {activeTool === 'battery' && (
                    <div className="font-mono text-[11px] text-slate-300 tabular-nums">
                      {bi('Gerçek Sağlık', 'True Health')}: %{device.batteryHealth} ·{' '}
                      {device.batteryCycles} {bi('Döngü', 'Cycles')}
                    </div>
                  )}
                  {!allChecked && (
                    <button
                      type="button"
                      onClick={() => {
                        const nextTab = TOOL_TABS.find((t) => !device.inspected[t.category]);
                        if (nextTab) handleSelectTool(nextTab.category);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1 text-[11px] font-extrabold text-slate-950 hover:bg-amber-400 cursor-pointer"
                    >
                      <span>{bi('Sıradaki Kontrole Geç →', 'Next Inspection Tool →')}</span>
                    </button>
                  )}
                </div>
              ) : activeTool === 'screen' ? (
                /* HANDS-ON 1: SCREEN TOUCH & PANEL CHECK */
                <div className="space-y-1.5 [@media(min-height:500px)]:space-y-2">
                  <div>
                    <div className="text-[11px] font-extrabold text-amber-400 leading-tight">
                      {bi('Ekran Camı & Dokunmatik Kontrolü', 'Display Glass & Touch Check')}
                    </div>
                    <p className="text-[10px] text-slate-300 leading-tight mt-0.5">
                      {bi(
                        'Soldaki ekranda veya aşağıdaki 3 bölgeye dokunarak cam ve dokunmatiği test et.',
                        'Tap all 3 zones on the display or below to verify glass & touch matrix.'
                      )}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {SCREEN_CHECK_POINTS.map((pt) => {
                      const done = screenPoints[pt.id];
                      return (
                        <button
                          key={pt.id}
                          type="button"
                          onClick={() => handleTapScreenPoint(pt.id)}
                          className={`rounded-lg border px-1.5 py-2 text-center transition-all cursor-pointer ${
                            done
                              ? 'border-emerald-500/45 bg-emerald-500/15 text-emerald-200'
                              : 'border-amber-400/45 bg-amber-500/12 text-amber-100 hover:bg-amber-500/20'
                          }`}
                        >
                          <div className="text-[10.5px] font-extrabold leading-tight">
                            {done ? '✓' : '●'} {lang === 'en' ? pt.en : pt.tr}
                          </div>
                          <div className="text-[9px] opacity-80 mt-0.5">
                            {done ? bi('Tamam', 'Checked') : bi('Dokun', 'Tap')}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : activeTool === 'battery' ? (
                /* HANDS-ON 2: USB-C AMPEREMETER LOAD TEST — COMPACT & ALWAYS 100% VISIBLE */
                <div className="space-y-1.5 [@media(min-height:500px)]:space-y-2">
                  <div>
                    <div className="text-[11px] font-extrabold text-amber-400 leading-tight">
                      {bi('USB-C Ampermetre & Pil Yük Testi', 'USB-C Amperemeter & Battery Load')}
                    </div>
                    <p className="text-[10px] text-slate-300 leading-tight mt-0.5">
                      {bi(
                        'Ekranda %' +
                          device.reportedBatteryHealth +
                          ' yazıyor ama BMS çipi kandırılmış olabilir! USB-C ölçeri basılı tut.',
                        'Screen reports ' +
                          device.reportedBatteryHealth +
                          '%, but BMS chips can be spoofed! Hold the USB-C load test.'
                      )}
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-[#0F1722] px-2 py-1.5 space-y-1 tabular-nums">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">
                        {bi('Ölçüm İlerlemesi', 'Load Diagnostic')}
                      </span>
                      <span className="font-mono font-bold text-amber-300">
                        {batteryLoadPct}% · {(3.82 + (batteryLoadPct / 100) * 0.35).toFixed(2)}V
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
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
                    className={`w-full inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-extrabold transition-all cursor-pointer select-none touch-manipulation ${
                      batteryTesting
                        ? 'bg-emerald-500 text-slate-950 scale-[0.98]'
                        : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {batteryTesting
                        ? bi(`Akım Ölçülüyor... (%${batteryLoadPct})`, `Measuring Load... (${batteryLoadPct}%)`)
                        : bi('USB-C Ölçeri Basılı Tut', 'Hold USB-C Load Test')}
                    </span>
                  </button>
                </div>
              ) : activeTool === 'imei' ? (
                /* HANDS-ON 3: BTK IMEI SORGU PANELI — ALL 12 KEYS ALWAYS VISIBLE ZERO CLIP */
                <div className="flex-1 h-full flex flex-col justify-between gap-1 min-h-0 overflow-hidden">
                  {imeiQuerying ? (
                    <div className="my-auto rounded-xl border border-sky-400/40 bg-sky-500/10 p-3 space-y-1.5 tabular-nums">
                      <div className="flex items-center justify-between text-[11px] font-bold text-sky-200">
                        <span>
                          {imeiQueryPct < 50
                            ? bi('BTK Sunucusuna Bağlanılıyor...', 'Connecting to BTK Server...')
                            : bi('GSMA & İthalat Kaydı Doğrulanıyor...', 'Verifying GSMA & Import Record...')}
                        </span>
                        <span className="font-mono text-amber-300">{imeiQueryPct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
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
                    <div className="flex-1 h-full min-h-0 grid grid-cols-12 gap-1.5 items-stretch overflow-hidden">
                      {/* Left: Chassis IMEI & Retro Phosphor LCD Screen */}
                      <div className="col-span-5 flex flex-col justify-center gap-1 min-w-0 min-h-0 overflow-hidden">
                        <div>
                          <div className="text-[11px] font-extrabold text-amber-400 leading-tight truncate">
                            {bi('BTK IMEI Terminali', 'BTK IMEI Terminal')}
                          </div>
                          <div className="text-[9px] text-slate-400 leading-tight mt-0.5 line-clamp-2">
                            {bi(
                              'Son 4 haneyi tuşlayıp Sorgula’ya bas:',
                              'Dial last 4 digits & press Query:'
                            )}
                          </div>
                        </div>

                        <div className="rounded-lg border border-amber-400/35 bg-[#0C121B] px-1.5 py-1 font-mono tabular-nums">
                          <div className="text-[7.5px] text-slate-400 leading-none">
                            {bi('KASA LAZER IMEI', 'CHASSIS IMEI')}
                          </div>
                          <div className="text-[10.5px] sm:text-[11px] font-extrabold text-slate-200 tracking-wide truncate mt-0.5">
                            {imeiPrefix}
                            <span className="text-amber-400 underline decoration-amber-400/60">
                              {imeiLast4}
                            </span>
                          </div>
                        </div>

                        {/* Retro Keypad Phone Green-Phosphor LCD Display */}
                        <div
                          className={`rounded-lg border-2 px-1.5 py-1 font-mono tabular-nums transition-all duration-150 ${
                            imeiError
                              ? 'border-rose-500 bg-rose-950/40 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.35)]'
                              : lcdPulse
                              ? 'border-amber-400/80 bg-[#0D231C] text-emerald-200 shadow-[0_0_14px_rgba(16,185,129,0.38)]'
                              : 'border-emerald-500/45 bg-[#0A1814] text-emerald-300'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[7.5px] opacity-80 leading-none mb-0.5">
                            <span className="inline-flex items-center gap-1">
                              <span
                                className={`inline-block w-1.5 h-1.5 rounded-full transition-colors ${
                                  lcdPulse ? 'bg-amber-300' : 'bg-emerald-400/70'
                                }`}
                              />
                              {pressedKey
                                ? `${bi('TUŞ', 'KEY')}: ${pressedKey}`
                                : bi('GİRİLEN KOD', 'DIALED')}
                            </span>
                            <span>{imeiInput.length}/4+</span>
                          </div>
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
                            placeholder={`_ _ _ _`}
                            className="w-full bg-transparent text-sm sm:text-base font-extrabold tracking-[0.2em] outline-none placeholder:text-emerald-300/35 placeholder:tracking-widest leading-tight"
                          />
                        </div>

                        {imeiError && (
                          <div className="text-[9px] font-bold text-rose-400 leading-tight truncate">
                            {bi(
                              `Hatalı! Son 4: ${imeiLast4}`,
                              `Mismatch! Last 4: ${imeiLast4}`
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right: Authentic Retro Tuşlu Telefon 3x4 Bezel Keypad — Strictly Fits All 4 Rows Zero Clip */}
                      <div className="col-span-7 h-full min-h-0 rounded-xl border-2 border-slate-500/35 bg-gradient-to-b from-[#172233] via-[#101824] to-[#0B111A] p-1 flex flex-col gap-0.5 shadow-[inset_0_1px_4px_rgba(255,255,255,0.08),0_8px_22px_rgba(0,0,0,0.5)] overflow-hidden">
                        {/* Classic Phone Earpiece & Keypad Brand Strip (Only when vertical room allows) */}
                        <div className="hidden [@media(min-height:460px)]:flex shrink-0 items-center justify-between px-1">
                          <div className="flex items-center gap-1">
                            <span className="h-1 w-1 rounded-full bg-slate-500/80" />
                            <span className="h-1 w-5 rounded-full bg-slate-600/80" />
                            <span className="h-1 w-1 rounded-full bg-slate-500/80" />
                          </div>
                          <span className="font-mono text-[7px] font-bold uppercase tracking-widest text-slate-400">
                            PASAJ-BTK T9
                          </span>
                        </div>

                        <div className="grid grid-cols-3 grid-rows-4 gap-1 flex-1 min-h-0">
                          {[
                            { k: '1', sub: '∞' },
                            { k: '2', sub: 'ABC' },
                            { k: '3', sub: 'DEF' },
                            { k: '4', sub: 'GHI' },
                            { k: '5', sub: 'JKL' },
                            { k: '6', sub: 'MNO' },
                            { k: '7', sub: 'PQRS' },
                            { k: '8', sub: 'TUV' },
                            { k: '9', sub: 'WXYZ' },
                          ].map((btn) => {
                            const isPressed = pressedKey === btn.k;
                            return (
                              <button
                                key={btn.k}
                                type="button"
                                onClick={() => handleImeiDigit(btn.k)}
                                className={`h-full min-h-0 rounded-md border border-b-[2px] flex flex-col items-center justify-center leading-none transition-all duration-100 cursor-pointer touch-manipulation select-none ${
                                  isPressed
                                    ? 'border-amber-300 border-b-amber-500 bg-gradient-to-b from-amber-400/35 to-amber-500/20 translate-y-[1px] scale-[0.96] shadow-[0_0_12px_rgba(251,191,36,0.55)]'
                                    : 'border-white/18 border-b-black/75 bg-gradient-to-b from-[#2B3B52] to-[#1A2536] hover:from-[#344864] hover:to-[#223147] active:translate-y-[1px] active:scale-[0.96] shadow-sm'
                                }`}
                              >
                                <span
                                  className={`font-mono text-xs sm:text-sm font-extrabold leading-none transition-colors ${
                                    isPressed ? 'text-amber-200' : 'text-slate-50'
                                  }`}
                                >
                                  {btn.k}
                                </span>
                                <span
                                  className={`hidden [@media(min-height:430px)]:block text-[6px] font-mono font-bold tracking-wider leading-none mt-0.5 ${
                                    isPressed ? 'text-amber-300' : 'text-slate-400'
                                  }`}
                                >
                                  {btn.sub}
                                </span>
                              </button>
                            );
                          })}

                          {/* Red Backspace Key */}
                          <button
                            type="button"
                            onClick={handleImeiBackspace}
                            aria-label={bi('Sil', 'Delete')}
                            className={`h-full min-h-0 rounded-md border border-b-[2px] flex flex-col items-center justify-center leading-none transition-all duration-100 cursor-pointer touch-manipulation select-none ${
                              pressedKey === 'DEL'
                                ? 'border-rose-300 border-b-rose-500 bg-rose-500/40 text-white translate-y-[1px] scale-[0.96]'
                                : 'border-rose-500/45 border-b-black/75 bg-gradient-to-b from-rose-500/28 to-rose-950/55 hover:from-rose-500/38 text-rose-200 active:translate-y-[1px] active:scale-[0.96]'
                            }`}
                          >
                            <Delete className="w-3 h-3" />
                            <span className="text-[7px] font-extrabold tracking-wide leading-none mt-0.5">
                              {bi('SİL', 'DEL')}
                            </span>
                          </button>

                          {/* 0 Key */}
                          <button
                            type="button"
                            onClick={() => handleImeiDigit('0')}
                            className={`h-full min-h-0 rounded-md border border-b-[2px] flex flex-col items-center justify-center leading-none transition-all duration-100 cursor-pointer touch-manipulation select-none ${
                              pressedKey === '0'
                                ? 'border-amber-300 border-b-amber-500 bg-gradient-to-b from-amber-400/35 to-amber-500/20 translate-y-[1px] scale-[0.96]'
                                : 'border-white/18 border-b-black/75 bg-gradient-to-b from-[#2B3B52] to-[#1A2536] hover:from-[#344864] hover:to-[#223147] active:translate-y-[1px] active:scale-[0.96] shadow-sm'
                            }`}
                          >
                            <span
                              className={`font-mono text-xs sm:text-sm font-extrabold leading-none ${
                                pressedKey === '0' ? 'text-amber-200' : 'text-slate-50'
                              }`}
                            >
                              0
                            </span>
                            <span
                              className={`hidden [@media(min-height:430px)]:block text-[6px] font-mono font-bold leading-none mt-0.5 ${
                                pressedKey === '0' ? 'text-amber-300' : 'text-slate-400'
                              }`}
                            >
                              +
                            </span>
                          </button>

                          {/* Green BTK Query Key */}
                          <button
                            type="button"
                            disabled={imeiInput.length < 4}
                            onClick={() => {
                              soundFX.playKeypadTone('#');
                              handleSubmitImei();
                            }}
                            aria-label={bi('Sorgula', 'Query')}
                            className={`h-full min-h-0 rounded-md border border-b-[2px] flex flex-col items-center justify-center leading-none transition-all duration-100 disabled:opacity-35 cursor-pointer touch-manipulation select-none ${
                              pressedKey === 'CALL'
                                ? 'border-emerald-200 border-b-emerald-400 bg-emerald-400/45 text-white translate-y-[1px] scale-[0.96]'
                                : 'border-emerald-400/55 border-b-black/75 bg-gradient-to-b from-emerald-500/35 to-emerald-950/60 hover:from-emerald-500/48 text-emerald-200 active:translate-y-[1px] active:scale-[0.96]'
                            }`}
                          >
                            <Search className="w-3 h-3" />
                            <span className="text-[7px] font-extrabold tracking-wide leading-none mt-0.5">
                              {bi('SORGULA', 'QUERY')}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* HANDS-ON 4: SIM TRAY LIQUID STRIP (LCI) & REAR CAMERA FLASHLIGHT */
                <div className="space-y-1.5 [@media(min-height:500px)]:space-y-2">
                  <div>
                    <div className="text-[11px] font-extrabold text-amber-400 leading-tight">
                      {bi('Sıvı Bandı (LCI) & Arka Kamera Kontrolü', 'Liquid Strip (LCI) & Rear Lens Check')}
                    </div>
                    <p className="text-[10px] text-slate-300 leading-tight mt-0.5">
                      {bi(
                        'SIM tepsisini çıkarıp sıvı bandına bak (Beyaz = Kuru, Kırmızı = Sıvı!) ve kamera merceğine fener tut.',
                        'Eject the SIM tray to check the LCI strip (White = Dry, Red = Liquid!) and shine light into the rear lens.'
                      )}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={handleEjectSim}
                      className={`rounded-lg border p-2 text-left transition-all cursor-pointer ${
                        simEjected
                          ? showLiquid
                            ? 'border-rose-500/50 bg-rose-500/15 text-rose-100'
                            : 'border-emerald-500/45 bg-emerald-500/15 text-emerald-100'
                          : 'border-amber-400/45 bg-amber-500/12 text-amber-100 hover:bg-amber-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-1 text-[11px] font-extrabold leading-tight">
                        <Droplets className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{bi('1. SIM Tepsisini Çıkar', '1. Eject SIM Tray')}</span>
                      </div>
                      <div className="text-[9.5px] mt-0.5 opacity-85 leading-tight">
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
                      className={`rounded-lg border p-2 text-left transition-all cursor-pointer ${
                        lensLit
                          ? showCameraFog
                            ? 'border-rose-500/50 bg-rose-500/15 text-rose-100'
                            : 'border-emerald-500/45 bg-emerald-500/15 text-emerald-100'
                          : 'border-sky-400/45 bg-sky-500/12 text-sky-100 hover:bg-sky-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-1 text-[11px] font-extrabold leading-tight">
                        <Flashlight className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{bi('2. Lense Fener Tut', '2. Shine Lens Light')}</span>
                      </div>
                      <div className="text-[9.5px] mt-0.5 opacity-85 leading-tight">
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

            {/* Bottom Summary & Compact Single-Row Revealed Defects Strip (Never Clips Keypad!) */}
            <div className="shrink-0 space-y-1 pt-1 border-t border-white/10">
              {revealedDefects.length > 0 && (
                <div className="rounded-md border border-rose-500/30 bg-rose-950/20 px-2 py-0.5 flex items-center gap-1.5 min-w-0">
                  <span className="shrink-0 text-[8.5px] font-extrabold uppercase tracking-wide text-rose-300 whitespace-nowrap">
                    {bi(`Kusur (${revealedDefects.length}):`, `Faults (${revealedDefects.length}):`)}
                  </span>
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar min-w-0">
                    {revealedDefects.map((d) => (
                      <span
                        key={d}
                        title={getLocalizedDefect(d, lang).name}
                        className="inline-flex items-center gap-1 rounded border border-rose-500/40 bg-rose-500/18 px-1.5 py-0.2 text-[8.5px] font-bold text-rose-100 whitespace-nowrap shrink-0"
                      >
                        <AlertTriangle className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                        {getLocalizedDefect(d, lang).shortLabel}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {allChecked && (
                <div className="rounded-md border border-emerald-500/35 bg-emerald-500/12 px-2 py-0.5 flex items-center justify-between gap-2 text-[10px]">
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-300 truncate">
                    <Sparkles className="w-3 h-3 shrink-0" />
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
                    <span className="font-mono text-[9.5px] font-extrabold text-amber-300 shrink-0">
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
                className={`w-full rounded-lg py-1.5 text-[11px] font-extrabold transition-colors cursor-pointer ${
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
