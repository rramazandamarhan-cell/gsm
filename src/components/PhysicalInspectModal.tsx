import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  BatteryCharging,
  Check,
  CheckCircle2,
  Cpu,
  MessageSquareQuote,
  RotateCw,
  ScanLine,
  Search,
  ShieldAlert,
  Smartphone,
  Sparkles,
  X,
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
  onInspectZone: (category: InspectionCategory) => void;
  onPhysicalCompleteBonus?: () => void;
  onClose: () => void;
}

interface HotspotConfig {
  category: InspectionCategory;
  side: 'front' | 'back';
  /** Percentage position inside SVG coordinate space */
  xPct: number;
  yPct: number;
  trTitle: string;
  enTitle: string;
  trHint: string;
  enHint: string;
  icon: React.ReactNode;
}

const HOTSPOTS: HotspotConfig[] = [
  {
    category: 'screen',
    side: 'front',
    xPct: 50,
    yPct: 33,
    trTitle: 'Ekran & Ön Cam',
    enTitle: 'Display & Front Glass',
    trHint: 'Çatlak, yan sanayi panel ve kasa izlerini büyüteçle tara',
    enHint: 'Scan for cracks, aftermarket LCD tint & frame scuffs',
    icon: <Smartphone className="w-3.5 h-3.5" />,
  },
  {
    category: 'battery',
    side: 'front',
    xPct: 50,
    yPct: 71,
    trTitle: 'Pil Hücresi & Şarj Portu',
    enTitle: 'Battery Cell & Charge Port',
    trHint: 'Gerçek pil sağlığını ve sahte BMS çipini ortaya çıkar',
    enHint: 'Check true battery wear & expose spoofed BMS chips',
    icon: <BatteryCharging className="w-3.5 h-3.5" />,
  },
  {
    category: 'hardware',
    side: 'back',
    xPct: 31,
    yPct: 24,
    trTitle: 'Kamera Merceği & Sıvı Sensörü',
    enTitle: 'Rear Camera & Liquid Sensor',
    trHint: 'Kamera içi buğu ve SIM yuvasındaki kırmızı sıvı bandını kontrol et',
    enHint: 'Inspect camera lens fog & SIM tray red moisture indicator',
    icon: <Cpu className="w-3.5 h-3.5" />,
  },
  {
    category: 'imei',
    side: 'back',
    xPct: 50,
    yPct: 82,
    trTitle: 'Kasa Lazer IMEI & Kayıt',
    enTitle: 'Chassis Laser IMEI Engraving',
    trHint: 'Arka kapaktaki seri / IMEI numarasını optik tarayıcıyla sorgula',
    enHint: 'Scan rear laser-etched IMEI for national registry status',
    icon: <ScanLine className="w-3.5 h-3.5" />,
  },
];

export const PhysicalInspectModal: React.FC<PhysicalInspectModalProps> = ({
  device,
  onInspectZone,
  onPhysicalCompleteBonus,
  onClose,
}) => {
  const { lang, bi } = useLanguage();
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [loupePos, setLoupePos] = useState<{ x: number; y: number; active: boolean }>({
    x: 50,
    y: 44,
    active: false,
  });
  const [scanningCat, setScanningCat] = useState<InspectionCategory | null>(null);
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

  const inspectedCount = Object.values(device.inspected).filter(Boolean).length;
  const allChecked = inspectedCount === 4;

  const frontRemaining = HOTSPOTS.filter(
    (h) => h.side === 'front' && !device.inspected[h.category]
  ).length;
  const backRemaining = HOTSPOTS.filter(
    (h) => h.side === 'back' && !device.inspected[h.category]
  ).length;

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

  // Move loupe lens with mouse or touch drag inside the ESD inspection mat
  const updateLoupeFromClient = useCallback((clientX: number, clientY: number) => {
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(8, Math.min(92, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(8, Math.min(92, ((clientY - rect.top) / rect.height) * 100));
    setLoupePos({ x, y, active: true });
  }, []);

  const handleTriggerZone = (hotspot: HotspotConfig) => {
    if (scanningCat) return;
    if (hotspot.side !== side) {
      soundFX.playClick();
      setSide(hotspot.side);
      setLoupePos({ x: hotspot.xPct, y: hotspot.yPct, active: true });
      return;
    }

    setLoupePos({ x: hotspot.xPct, y: hotspot.yPct, active: true });

    if (device.inspected[hotspot.category]) {
      soundFX.playClick();
      return;
    }

    setScanningCat(hotspot.category);
    soundFX.playClick();

    window.setTimeout(() => {
      const found = device.defects.filter(
        (d) => DEFECT_CATALOG[d].category === hotspot.category
      );
      const caughtLie = Boolean(
        device.sellerClaim &&
          device.sellerClaimCategory === hotspot.category &&
          found.length > 0
      );

      onInspectZone(hotspot.category);
      setScanningCat(null);
      setLastScanResult({
        category: hotspot.category,
        defects: found,
        caughtLie,
      });

      if (caughtLie) {
        soundFX.playLieCaught();
      } else if (found.length > 0) {
        soundFX.playScanDefect();
      } else {
        soundFX.playScanOk();
      }
    }, 240);
  };

  // Determine which hotspot the loupe is currently hovering near (for live optical X-ray peek!)
  const activeHoverHotspot = useMemo(() => {
    if (!loupePos.active) return null;
    const sideSpots = HOTSPOTS.filter((h) => h.side === side);
    let closest: HotspotConfig | null = null;
    let bestDist = 24;
    for (const h of sideSpots) {
      const dist = Math.hypot(h.xPct - loupePos.x, h.yPct - loupePos.y);
      if (dist < bestDist) {
        bestDist = dist;
        closest = h;
      }
    }
    return closest;
  }, [loupePos, side]);

  // Optical loupe reveal flags (visible either when checked OR faintly glimpsed under the magnifying glass!)
  const loupeNear = (cat: InspectionCategory) =>
    loupePos.active && activeHoverHotspot?.category === cat;

  const isFold = device.cameraLayout === 'fold';
  const showCrack =
    device.defects.includes('screen_crack') &&
    (device.inspected.screen || loupeNear('screen'));
  const showAftermarket =
    device.defects.includes('screen_aftermarket') &&
    (device.inspected.screen || loupeNear('screen'));
  const showCosmetic =
    device.defects.includes('cosmetic_worn') &&
    (device.inspected.screen || loupeNear('screen'));
  const showBatteryBad =
    (device.defects.includes('battery_degraded') ||
      device.defects.includes('battery_fake_chip')) &&
    (device.inspected.battery || loupeNear('battery'));
  const showFakeChip =
    device.defects.includes('battery_fake_chip') &&
    (device.inspected.battery || loupeNear('battery'));
  const showCameraFog =
    device.defects.includes('camera_fog') &&
    (device.inspected.hardware || loupeNear('hardware'));
  const showLiquid =
    device.defects.includes('liquid_damage') &&
    (device.inspected.hardware || loupeNear('hardware'));
  const showUnregistered =
    device.defects.includes('imei_unregistered') &&
    (device.inspected.imei || loupeNear('imei'));

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

  const sideHotspots = HOTSPOTS.filter((h) => h.side === side);
  const otherSideRemaining = side === 'front' ? backRemaining : frontRemaining;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/82 p-2 sm:p-4 select-none">
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl max-h-[93dvh] flex flex-col overflow-hidden rounded-2xl border border-amber-400/30 bg-[#121923] shadow-[0_28px_80px_rgba(0,0,0,0.85)]"
      >
        {/* Pinned Compact Header */}
        <div className="shrink-0 px-3.5 sm:px-5 py-2.5 border-b border-white/10 bg-[#0E141D] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 border border-amber-400/40 text-amber-400 shrink-0">
              <Search className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-display text-sm sm:text-base font-extrabold text-slate-50 truncate leading-tight">
                {bi('Fiziksel Büyüteç Ekspertizi', 'Physical Loupe Inspection')} ·{' '}
                <span className="text-amber-400">
                  {device.brand} {device.model}
                </span>
              </div>
              <div className="text-[10.5px] text-slate-400 truncate">
                {bi(
                  'Büyüteci cihaz üzerinde gezdir, arka yüzü çevir ve parlayan bölgelere dokunarak gizli kusurları yakala!',
                  'Glide the loupe over the phone, flip to the back, and tap glowing zones to expose hidden defects!'
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-flex font-mono text-xs font-bold text-slate-300 tabular-nums">
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

        {/* 2-Column Landscape Workbench Body (Zero-Scroll on Mobile Landscape) */}
        <div className="flex-1 min-h-0 overflow-hidden grid grid-cols-12 gap-2.5 p-2.5 sm:p-3">
          {/* LEFT: Interactive ESD Mat + Flip Phone + Optical Loupe Lens */}
          <div className="col-span-6 flex flex-col items-center justify-between rounded-xl border border-white/10 bg-[#0D151E] p-2 sm:p-3 relative overflow-hidden min-h-0">
            {/* Side indicator & Flip CTA */}
            <div className="w-full flex items-center justify-between gap-2 mb-1.5 z-10 shrink-0">
              <span className="text-[10.5px] font-mono font-bold text-slate-300 truncate">
                {side === 'front'
                  ? bi('ÖN YÜZ · EKRAN & PİL', 'FRONT · DISPLAY & BATTERY')
                  : bi('ARKA YÜZ · KAMERA, SIVI & IMEI', 'BACK · CAMERA, LCI & IMEI')}
              </span>
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setSide((s) => (s === 'front' ? 'back' : 'front'));
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  otherSideRemaining > 0
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.4)]'
                    : 'border border-white/15 bg-[#1C2634] text-slate-200 hover:bg-[#263447]'
                }`}
              >
                <RotateCw className="w-3 h-3" />
                <span>
                  {side === 'front'
                    ? bi('Arka Yüz', 'Flip Back')
                    : bi('Ön Yüz', 'Flip Front')}
                </span>
                {otherSideRemaining > 0 && (
                  <span className="rounded bg-slate-950/25 px-1 font-mono text-[9.5px] font-extrabold">
                    {otherSideRemaining}
                  </span>
                )}
              </button>
            </div>

            {/* Interactive Phone Surface + Touch/Mouse Magnifying Loupe */}
            <div
              ref={stageRef}
              onPointerMove={(e) => updateLoupeFromClient(e.clientX, e.clientY)}
              onPointerDown={(e) => updateLoupeFromClient(e.clientX, e.clientY)}
              onPointerLeave={() =>
                setLoupePos((prev) => ({ ...prev, active: false }))
              }
              className="relative flex-1 min-h-0 w-full flex items-center justify-center rounded-xl border border-white/8 bg-[#121D27] overflow-hidden touch-none cursor-crosshair p-1.5"
              style={{
                backgroundImage:
                  'radial-gradient(rgba(148,163,184,0.14) 1px, transparent 1px)',
                backgroundSize: '14px 14px',
              }}
            >
              {/* Animated Flip Phone Container — Scales Fluidly to Landscape Phone Height */}
              <motion.div
                key={side}
                initial={{ rotateY: side === 'back' ? -75 : 75, opacity: 0.45, scale: 0.94 }}
                animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                className={`relative flex items-center justify-center h-full max-h-[256px] ${
                  isFold ? 'aspect-[180/280]' : 'aspect-[156/280]'
                }`}
              >
                <svg
                  viewBox={isFold ? '0 0 180 280' : '0 0 156 280'}
                  fill="none"
                  className="w-full h-full drop-shadow-[0_18px_28px_rgba(0,0,0,0.7)] pointer-events-none"
                >
                  {/* Chassis */}
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
                  {/* Side buttons */}
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
                      {/* Screen Glass */}
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
                      {/* Aftermarket pixel grid clue under loupe */}
                      {showAftermarket && (
                        <g opacity={device.inspected.screen ? 0.5 : 0.35}>
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
                            y="124"
                            textAnchor="middle"
                            fill="#93C5FD"
                            fontFamily="'JetBrains Mono', monospace"
                            fontWeight="700"
                            fontSize="9"
                          >
                            TFT / NON-OEM
                          </text>
                        </g>
                      )}
                      {/* Brand Header */}
                      <text
                        x={isFold ? 90 : 78}
                        y="64"
                        textAnchor="middle"
                        fill="#E2E8F0"
                        fontFamily="'Bricolage Grotesque', sans-serif"
                        fontWeight="700"
                        fontSize="13"
                      >
                        {device.brand}
                      </text>
                      <text
                        x={isFold ? 90 : 78}
                        y="80"
                        textAnchor="middle"
                        fill="#94A3B8"
                        fontFamily="'Plus Jakarta Sans', sans-serif"
                        fontSize="10"
                      >
                        {device.model}
                      </text>

                      {/* Cracked glass lines (visible on check or loupe hover) */}
                      {showCrack && (
                        <g
                          stroke="#F8FAFC"
                          strokeOpacity={device.inspected.screen ? 0.85 : 0.55}
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        >
                          <path d="M24 38 L58 84 L42 126 L92 152" />
                          <path d="M58 84 L108 70 L132 95" />
                          <path d="M58 84 L68 118" />
                          <path d="M42 126 L22 148" />
                        </g>
                      )}

                      {/* Battery Telemetry Box on Lower Screen */}
                      <g transform={`translate(${isFold ? 36 : 26}, 166)`}>
                        <rect
                          x="0"
                          y="0"
                          width="104"
                          height="56"
                          rx="9"
                          fill="#131E2D"
                          stroke={
                            showBatteryBad
                              ? '#EF4444'
                              : device.inspected.battery
                              ? '#10B981'
                              : '#334155'
                          }
                          strokeWidth="1.4"
                        />
                        <text
                          x="10"
                          y="17"
                          fill="#94A3B8"
                          fontFamily="'Plus Jakarta Sans', sans-serif"
                          fontSize="8"
                        >
                          {showFakeChip
                            ? bi('SAHTE BMS ÇİPİ!', 'SPOOFED BMS CHIP!')
                            : bi('PİL & ŞARJ DEVİR', 'BATTERY & CYCLES')}
                        </text>
                        <text
                          x="10"
                          y="37"
                          fill={
                            showBatteryBad
                              ? '#F87171'
                              : device.inspected.battery
                              ? '#34D399'
                              : '#F8FAFC'
                          }
                          fontFamily="'JetBrains Mono', monospace"
                          fontWeight="700"
                          fontSize="15"
                        >
                          %
                          {device.inspected.battery || loupeNear('battery')
                            ? device.batteryHealth
                            : device.reportedBatteryHealth}
                        </text>
                        <text
                          x="10"
                          y="49"
                          fill="#64748B"
                          fontFamily="'JetBrains Mono', monospace"
                          fontSize="7.5"
                        >
                          {device.inspected.battery
                            ? `${device.batteryCycles} ${bi('devir', 'cycles')}`
                            : bi('Büyüteçle tara...', 'Scan with loupe...')}
                        </text>
                      </g>

                      {/* Cosmetic dents on corners */}
                      {showCosmetic && (
                        <>
                          <circle cx="15" cy="264" r="5.5" fill="#F59E0B" fillOpacity="0.7" />
                          <circle
                            cx={isFold ? 165 : 141}
                            cy="16"
                            r="5"
                            fill="#F59E0B"
                            fillOpacity="0.7"
                          />
                        </>
                      )}
                    </>
                  ) : (
                    /* BACK VIEW: Rear Camera Module + SIM Moisture Strip + Laser IMEI */
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
                          x="6.5"
                          y="64"
                          width="4"
                          height="34"
                          rx="1.5"
                          fill={showLiquid ? '#EF4444' : '#475569'}
                        />
                        <circle
                          cx="18"
                          cy="81"
                          r="4.5"
                          fill={
                            showLiquid
                              ? '#EF4444'
                              : device.inspected.hardware
                              ? '#E2E8F0'
                              : '#334155'
                          }
                          stroke="#0F141B"
                          strokeWidth="1.5"
                        />
                        {showLiquid && (
                          <text
                            x="27"
                            y="84"
                            fill="#FCA5A5"
                            fontFamily="'JetBrains Mono', monospace"
                            fontWeight="700"
                            fontSize="7.5"
                          >
                            LCI RED!
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
                        stroke={showCameraFog ? '#F59E0B' : device.accentColor}
                        strokeOpacity="0.65"
                        strokeWidth="1.6"
                      />
                      <circle cx="39" cy="40" r="10" fill="#1E293B" stroke="#64748B" strokeWidth="1.6" />
                      <circle cx="39" cy="40" r="4.5" fill={showCameraFog ? '#CBD5E1' : '#090F1A'} />
                      <circle cx="39" cy="67" r="10" fill="#1E293B" stroke="#64748B" strokeWidth="1.6" />
                      <circle cx="39" cy="67" r="4.5" fill={showCameraFog ? '#CBD5E1' : '#090F1A'} />
                      <circle cx="65" cy="54" r="9.5" fill="#1E293B" stroke="#64748B" strokeWidth="1.6" />
                      <circle cx="65" cy="54" r="4.2" fill={showCameraFog ? '#CBD5E1' : '#090F1A'} />
                      <circle cx="66" cy="34" r="3.5" fill="#FEF3C7" />

                      {/* Visible Condensation Fog Droplets inside Rear Camera */}
                      {showCameraFog && (
                        <g>
                          <circle cx="50" cy="54" r="24" fill="#E2E8F0" fillOpacity="0.34" />
                          <circle cx="43" cy="44" r="2.2" fill="#FFFFFF" fillOpacity="0.7" />
                          <circle cx="57" cy="59" r="1.8" fill="#FFFFFF" fillOpacity="0.65" />
                          <circle cx="38" cy="64" r="2" fill="#FFFFFF" fillOpacity="0.6" />
                        </g>
                      )}

                      {/* Brand Medallion */}
                      <circle
                        cx={isFold ? 90 : 78}
                        cy="144"
                        r="16"
                        stroke={device.accentColor}
                        strokeOpacity="0.4"
                        strokeWidth="1.8"
                      />
                      <text
                        x={isFold ? 90 : 78}
                        y="148"
                        textAnchor="middle"
                        fill={device.accentColor}
                        fillOpacity="0.8"
                        fontFamily="'Bricolage Grotesque', sans-serif"
                        fontWeight="700"
                        fontSize="12"
                      >
                        {device.brand.slice(0, 2).toUpperCase()}
                      </text>

                      {/* Lower Rear Laser-Etched IMEI Plaque */}
                      <g transform={`translate(${isFold ? 28 : 22}, 206)`}>
                        <rect
                          x="0"
                          y="0"
                          width={isFold ? 124 : 112}
                          height="44"
                          rx="8"
                          fill="#0E1520"
                          fillOpacity="0.88"
                          stroke={
                            showUnregistered
                              ? '#EF4444'
                              : device.inspected.imei
                              ? '#10B981'
                              : '#334155'
                          }
                          strokeWidth="1.3"
                        />
                        <text
                          x={isFold ? 62 : 56}
                          y="15"
                          textAnchor="middle"
                          fill="#94A3B8"
                          fontFamily="'JetBrains Mono', monospace"
                          fontSize="7.5"
                        >
                          IMEI · {device.storage}
                        </text>
                        <text
                          x={isFold ? 62 : 56}
                          y="28"
                          textAnchor="middle"
                          fill="#E2E8F0"
                          fontFamily="'JetBrains Mono', monospace"
                          fontWeight="700"
                          fontSize="8.5"
                        >
                          {device.inspected.imei
                            ? device.imeiNumber
                            : `${device.imeiNumber.slice(0, 6)}••••••`}
                        </text>
                        <text
                          x={isFold ? 62 : 56}
                          y="39"
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
                          fontSize="7.5"
                        >
                          {showUnregistered
                            ? bi('YURT DIŞI · KAYITSIZ!', 'UNREGISTERED IMEI!')
                            : device.inspected.imei
                            ? bi('RESMİ KAYITLI ✓', 'VERIFIED REGISTRY ✓')
                            : bi('DOKUN & TARA', 'TAP TO SCAN')}
                        </text>
                      </g>
                    </>
                  )}
                </svg>

                {/* Interactive Tappable Physical Hotspots on Current Side */}
                {sideHotspots.map((spot) => {
                  const checked = device.inspected[spot.category];
                  const hasDefect =
                    checked &&
                    device.defects.some(
                      (d) => DEFECT_CATALOG[d].category === spot.category
                    );
                  const isScanning = scanningCat === spot.category;

                  return (
                    <button
                      key={spot.category}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTriggerZone(spot);
                      }}
                      style={{
                        left: `${spot.xPct}%`,
                        top: `${spot.yPct}%`,
                      }}
                      aria-label={lang === 'en' ? spot.enTitle : spot.trTitle}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all cursor-pointer z-20 ${
                        isScanning
                          ? 'scale-115 border-amber-300 bg-amber-400/35 text-white shadow-[0_0_24px_rgba(251,191,36,0.85)]'
                          : !checked
                          ? 'border-amber-400 bg-amber-500/22 text-amber-200 hover:scale-110 shadow-[0_0_20px_rgba(245,158,11,0.55)]'
                          : hasDefect
                          ? 'border-rose-500 bg-rose-500/25 text-rose-200 shadow-[0_0_16px_rgba(244,63,94,0.6)]'
                          : 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {!checked && !isScanning && (
                        <span className="pointer-events-none absolute inset-0 rounded-full border-2 border-amber-400/75 animate-ping" />
                      )}
                      {checked ? (
                        hasDefect ? (
                          <ShieldAlert className="w-5 h-5" />
                        ) : (
                          <Check className="w-5 h-5" />
                        )
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </button>
                  );
                })}
              </motion.div>

              {/* Floating Optical Magnifying Loupe Lens following pointer/touch */}
              {loupePos.active && (
                <div
                  style={{
                    left: `${loupePos.x}%`,
                    top: `${loupePos.y}%`,
                  }}
                  className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 h-20 w-20 rounded-full border-2 transition-colors duration-150 z-30 flex items-center justify-center ${
                    activeHoverHotspot && !device.inspected[activeHoverHotspot.category]
                      ? 'border-amber-300 bg-amber-400/12 shadow-[0_0_24px_rgba(251,191,36,0.45)]'
                      : 'border-sky-300/70 bg-sky-300/6 shadow-[0_0_18px_rgba(56,189,248,0.25)]'
                  }`}
                >
                  <div className="absolute inset-1.5 rounded-full border border-dashed border-white/25" />
                  <div className="h-3 w-px bg-white/35 absolute" />
                  <div className="w-3 h-px bg-white/35 absolute" />
                  <span className="absolute -bottom-4 rounded bg-[#0C121A]/90 border border-white/15 px-1.5 py-0.5 font-mono text-[9px] font-bold text-amber-300 whitespace-nowrap">
                    2.5× OPTIC
                  </span>
                </div>
              )}
            </div>

            {/* Live Loupe Scan Toast Bar */}
            <div className="w-full mt-1.5 min-h-[28px] shrink-0 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {lastScanResult ? (
                  <motion.div
                    key={`${lastScanResult.category}-${lastScanResult.defects.length}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`w-full rounded-lg border px-2 py-1 text-[11px] font-semibold flex items-center justify-between gap-2 ${
                      lastScanResult.defects.length > 0
                        ? 'border-rose-500/45 bg-rose-500/14 text-rose-200'
                        : 'border-emerald-500/35 bg-emerald-500/12 text-emerald-200'
                    }`}
                  >
                    <span className="truncate">
                      {lastScanResult.defects.length > 0
                        ? `${bi('Kusur', 'Defect')}: ${lastScanResult.defects
                            .map((d) => getLocalizedDefect(d, lang).name)
                            .join(', ')}`
                        : `${getLocalizedCategoryLabel(
                            lastScanResult.category,
                            lang
                          )}: ${bi('Tertemiz!', 'Spotless!')}`}
                    </span>
                    {lastScanResult.caughtLie && (
                      <span className="shrink-0 rounded bg-rose-500 px-1.5 py-0.5 font-mono text-[9.5px] font-extrabold text-white">
                        {bi('YALAN!', 'LIE!')}
                      </span>
                    )}
                  </motion.div>
                ) : (
                  <div className="text-[10.5px] text-slate-400 text-center truncate">
                    {side === 'front'
                      ? bi(
                          'Ön yüzdeki büyüteç noktalarına dokun, sonra telefonu çevir!',
                          'Tap the loupe hotspots on the front, then flip!'
                        )
                      : bi(
                          'Arka kamera, SIM sıvı bandı ve IMEI’yi tara!',
                          'Inspect rear camera, SIM liquid strip & laser IMEI!'
                        )}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT: Detective Checklist, Seller Claim Verifier & Discovered Defects */}
          <div className="col-span-6 min-h-0 flex flex-col justify-between gap-1.5 overflow-hidden">
            <div className="space-y-1.5 min-h-0 overflow-hidden">
              {/* Seller Claim Verification Box */}
              {device.sellerClaim && (
                <div
                  className={`rounded-lg border px-2.5 py-1.5 text-[11px] flex items-center justify-between gap-2 ${
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

              {/* 4 Physical Checkpoints (Click jumps to correct side & scans) */}
              <div className="space-y-1">
                {HOTSPOTS.map((spot) => {
                  const checked = device.inspected[spot.category];
                  const zoneDefects = device.defects.filter(
                    (d) => DEFECT_CATALOG[d].category === spot.category
                  );
                  const hasDefect = checked && zoneDefects.length > 0;
                  const onOtherSide = spot.side !== side;

                  return (
                    <button
                      key={spot.category}
                      type="button"
                      onClick={() => handleTriggerZone(spot)}
                      className={`w-full text-left rounded-lg border px-2.5 py-1.5 transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                        !checked
                          ? 'border-white/12 bg-[#182332] hover:border-amber-400/50 hover:bg-[#1E2C3E]'
                          : hasDefect
                          ? 'border-rose-500/40 bg-rose-500/10'
                          : 'border-emerald-500/35 bg-emerald-500/10'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-md shrink-0 ${
                            !checked
                              ? 'bg-amber-500/15 text-amber-300'
                              : hasDefect
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {spot.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] font-bold text-slate-100 truncate">
                              {lang === 'en' ? spot.enTitle : spot.trTitle}
                            </span>
                            <span className="text-[9px] font-mono text-slate-400 shrink-0">
                              ·{' '}
                              {spot.side === 'front'
                                ? bi('Ön', 'Front')
                                : bi('Arka', 'Back')}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate leading-tight">
                            {checked
                              ? hasDefect
                                ? zoneDefects
                                    .map((d) => getLocalizedDefect(d, lang).name)
                                    .join(' · ')
                                : bi('Sorun bulunmadı', 'No issues detected')
                              : lang === 'en'
                              ? spot.enHint
                              : spot.trHint}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        {checked ? (
                          hasDefect ? (
                            <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-rose-400">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>{bi('Kusur', 'Fault')}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-400">
                              <Check className="w-3.5 h-3.5" />
                              <span>{bi('Temiz', 'Clean')}</span>
                            </span>
                          )
                        ) : onOtherSide ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-300">
                            <RotateCw className="w-3 h-3" />
                            <span>{bi('Çevir', 'Flip')}</span>
                          </span>
                        ) : (
                          <span className="text-[10.5px] font-bold text-amber-400">
                            {bi('Tara →', 'Scan →')}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Summary & Return CTA */}
            <div className="shrink-0 space-y-1.5 pt-1.5 border-t border-white/10">
              {allChecked && (
                <div className="rounded-lg border border-emerald-500/35 bg-emerald-500/12 px-2.5 py-1 flex items-center justify-between gap-2 text-[11px]">
                  <span className="inline-flex items-center gap-1.5 font-bold text-emerald-300 truncate">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {revealedDefects.length > 0
                        ? bi(
                            `Tamamlandı! ${revealedDefects.length} pazarlık kozu açıldı.`,
                            `Complete! ${revealedDefects.length} leverage clue(s) unlocked.`
                          )
                        : bi(
                            'Tamamlandı! Cihaz 4/4 tertemiz çıktı.',
                            'Complete! Device passed 4/4 spotless.'
                          )}
                    </span>
                  </span>
                  {bonusAwarded && (
                    <span className="font-mono text-[10.5px] font-extrabold text-amber-300 shrink-0">
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
