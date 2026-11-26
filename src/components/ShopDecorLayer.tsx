import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { SHOP_TIERS } from '../game/catalog';
import { getPrestigePlaqueStyle } from '../game/engine';
import {
  CustomerArchetypeId,
  DecorationId,
  NegotiationTone,
  PhoneDevice,
  RadioStationId,
  ShopTier,
  StoreEventVisualKind,
  UpgradeId,
} from '../game/types';

export interface WaitingCustomerPreview {
  id: string;
  name: string;
  archetypeId: CustomerArchetypeId;
  portraitPath: string;
  fallbackColor: string;
}

interface ShopDecorLayerProps {
  shopTier: ShopTier;
  activeDecorations: DecorationId[];
  upgrades?: UpgradeId[];
  totalAccessoryStock?: number;
  activeEventVisual?: StoreEventVisualKind | null;
  listedPhones?: PhoneDevice[];
  prestigeLevel?: number;
  radioStation?: RadioStationId;
  waitingCustomers?: WaitingCustomerPreview[];
  teaServedOnCounter?: boolean;
  teaBoilerFreshActive?: boolean;
  shopSpirit?: NegotiationTone;
}

const TIER_GLOW_BY_TIER: Record<ShopTier, string> = {
  1: 'rgba(245,158,11,0.12)',
  2: 'rgba(251,191,36,0.14)',
  3: 'rgba(56,189,248,0.14)',
  4: 'rgba(16,185,129,0.14)',
  5: 'rgba(167,139,250,0.15)',
  6: 'rgba(245,158,11,0.20)',
};

const SteamingTeaGlassSVG: React.FC<{ size?: 'sm' | 'md'; delay?: number }> = ({
  size = 'md',
  delay = 0,
}) => {
  const w = size === 'sm' ? 22 : 28;
  const h = size === 'sm' ? 28 : 34;
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 32 40"
      fill="none"
      aria-hidden="true"
      className="shrink-0 overflow-visible"
    >
      {/* Rising Animated Steam Wisps */}
      <motion.path
        d="M12 11 C10 8, 14 5, 12 2"
        stroke="#FDE68A"
        strokeWidth="1.3"
        strokeLinecap="round"
        animate={{ opacity: [0.15, 0.75, 0.15], y: [2, -3, -6] }}
        transition={{ repeat: Infinity, duration: 2.3, delay }}
      />
      <motion.path
        d="M19 11 C21 8, 17 5, 19 2"
        stroke="#FEF3C7"
        strokeWidth="1.2"
        strokeLinecap="round"
        animate={{ opacity: [0.1, 0.65, 0.1], y: [2, -4, -7] }}
        transition={{ repeat: Infinity, duration: 2.6, delay: delay + 0.55 }}
      />
      {/* Tiny Teaspoon Handle */}
      <line
        x1="21"
        y1="14"
        x2="26"
        y2="9"
        stroke="#CBD5E1"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* Classic Tulip Glass (İnce Belli) */}
      <path
        d="M9 14 C9 19, 11.5 22, 10 29 C9.6 31.2, 11 33, 16 33 C21 33, 22.4 31.2, 22 29 C20.5 22, 23 19, 23 14 Z"
        fill="#7F1D1D"
        fillOpacity="0.88"
        stroke="#FDE68A"
        strokeWidth="1.3"
      />
      {/* Tea Surface Highlight */}
      <ellipse cx="16" cy="17.5" rx="5.2" ry="1.3" fill="#DC2626" fillOpacity="0.7" />
      <path
        d="M12 18 C12 21, 13 24, 12.2 28"
        stroke="#FFFFFF"
        strokeOpacity="0.35"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      {/* Porcelain Saucer */}
      <ellipse cx="16" cy="34.5" rx="11.5" ry="2.4" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
      <ellipse cx="16" cy="34.2" rx="6" ry="1.1" fill="#DC2626" fillOpacity="0.55" />
    </svg>
  );
};

export const ShopDecorLayer: React.FC<ShopDecorLayerProps> = ({
  shopTier,
  activeDecorations,
  upgrades = [],
  totalAccessoryStock = 0,
  activeEventVisual = null,
  listedPhones = [],
  prestigeLevel = 0,
  radioStation = 'OFF',
  waitingCustomers = [],
  teaServedOnCounter = false,
  teaBoilerFreshActive = false,
  shopSpirit = 'friendly',
}) => {
  const tierInfo = SHOP_TIERS[shopTier];
  const hasSign = activeDecorations.includes('vintage_sign');
  const hasEdison = activeDecorations.includes('edison_lights');
  const hasRetroShelf = activeDecorations.includes('retro_shelf');
  const hasLed = activeDecorations.includes('led_showcase');
  const hasTeaCorner = activeDecorations.includes('tea_corner');
  const hasTeaBoiler = activeDecorations.includes('tea_boiler');
  const hasVipLounge = activeDecorations.includes('vip_lounge');
  const hasRadio = activeDecorations.includes('vintage_radio');
  const hasPrestigePlaque =
    prestigeLevel > 0 && activeDecorations.includes('prestige_plaque');
  const plaqueStyle = getPrestigePlaqueStyle(prestigeLevel);
  const radioPlaying = hasRadio && radioStation !== 'OFF';
  const isPlushLounge = hasVipLounge || shopTier >= 4;

  // Visible Purchased Equipment & Business Licenses
  const hasCctv = upgrades.includes('cctv_security');
  const hasNeonPromo = upgrades.includes('neon_sign');
  const hasBarcodeAuto = upgrades.includes('barcode_automation');
  const hasProDiag = upgrades.includes('pro_diagnostic');
  const hasSmartPos = upgrades.includes('smart_pos_zero');
  const hasRepairBench = upgrades.includes('repair_bench');
  const hasMicroSolder = upgrades.includes('micro_soldering');
  const hasCleanRoom = upgrades.includes('clean_room_lab');
  const hasEspressoBar = upgrades.includes('espresso_bar');
  const hasCloudCrm = upgrades.includes('cloud_crm');
  const ownedPermits: { id: UpgradeId; label: string; color: string }[] = [
    { id: 'accessory_license', label: 'AKSESUAR', color: '#34D399' },
    { id: 'classifieds_license', label: 'SARI İLAN', color: '#FBBF24' },
    { id: 'auction_license', label: 'İHALE', color: '#F97316' },
    { id: 'brand_new_license', label: 'RESMİ BAYİ', color: '#38BDF8' },
  ].filter((p) => upgrades.includes(p.id as UpgradeId)) as {
    id: UpgradeId;
    label: string;
    color: string;
  }[];

  const spiritAmbientClass =
    shopSpirit === 'friendly'
      ? 'from-amber-500/12 via-transparent to-orange-500/8'
      : shopSpirit === 'analytical'
      ? 'from-sky-500/10 via-transparent to-cyan-400/8'
      : 'from-rose-600/14 via-transparent to-amber-700/10';

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
      {/* Vivid Shop Interior Backdrop */}
      <img
        src={tierInfo.backdropPath}
        alt=""
        aria-hidden="true"
        referrerPolicy="no-referrer"
        className="absolute inset-0 h-full w-full object-cover opacity-[0.44] transition-all duration-500"
      />

      {/* Balanced Atmospheric Readability Scrim */}
      <div
        className="absolute inset-0 transition-all duration-500"
        style={{
          background: `radial-gradient(circle at 50% 10%, ${TIER_GLOW_BY_TIER[shopTier]} 0%, rgba(12,17,24,0.68) 72%)`,
        }}
      />

      {/* SHOP SPIRIT ATMOSPHERIC TINT (Friendly / Professional / Firm) */}
      <div
        className={`absolute inset-0 bg-gradient-to-br transition-colors duration-500 ${spiritAmbientClass}`}
      />

      {/* RADIO AMBIENT WARM GLOW WHEN PLAYING */}
      {radioPlaying && (
        <motion.div
          animate={{ opacity: [0.06, 0.14, 0.06] }}
          transition={{ repeat: Infinity, duration: 2.2 }}
          className={`absolute inset-0 ${
            radioStation === 'ARABESK'
              ? 'bg-gradient-to-tr from-amber-600/20 via-transparent to-orange-500/10'
              : 'bg-gradient-to-tr from-fuchsia-500/16 via-transparent to-sky-400/14'
          }`}
        />
      )}

      {/* MID-DAY RANDOM STORE EVENT ATMOSPHERIC FX */}
      {activeEventVisual === 'power_surge' && (
        <motion.div
          animate={{ opacity: [0.05, 0.35, 0.08, 0.42, 0.06] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
          className="absolute inset-0 bg-amber-950/60"
        />
      )}
      {activeEventVisual === 'rain' && (
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'repeating-linear-gradient(115deg, rgba(125,211,252,0.4) 0px, rgba(125,211,252,0.4) 1px, transparent 1px, transparent 18px)',
          }}
        />
      )}
      {activeEventVisual === 'music' && (
        <motion.div
          animate={{ opacity: [0.1, 0.24, 0.1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="absolute inset-0 bg-gradient-to-t from-orange-500/18 via-transparent to-transparent"
        />
      )}
      {activeEventVisual === 'livestream' && (
        <motion.div
          animate={{ opacity: [0.12, 0.25, 0.12] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="absolute inset-0 bg-gradient-to-tr from-rose-500/12 via-transparent to-sky-400/16"
        />
      )}
      {activeEventVisual === 'tea_aroma' && (
        <div className="absolute inset-0 bg-gradient-to-t from-amber-500/14 via-transparent to-emerald-400/8" />
      )}
      {activeEventVisual === 'coin_jam' && (
        <motion.div
          animate={{ opacity: [0.06, 0.18, 0.06] }}
          transition={{ repeat: Infinity, duration: 1.1 }}
          className="absolute inset-0 bg-gradient-to-t from-amber-500/16 via-transparent to-rose-500/10"
        />
      )}
      {activeEventVisual === 'rent_meeting' && (
        <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/12 via-transparent to-amber-400/14" />
      )}
      {activeEventVisual === 'wifi_outage' && (
        <motion.div
          animate={{ opacity: [0.05, 0.2, 0.05] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute inset-0 bg-gradient-to-b from-cyan-500/14 via-transparent to-transparent"
        />
      )}
      {activeEventVisual === 'tea_war' && (
        <div className="absolute inset-0 bg-gradient-to-t from-orange-500/16 via-transparent to-amber-300/10" />
      )}
      {activeEventVisual === 'parcel_mixup' && (
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/12 via-transparent to-amber-400/12" />
      )}

      {/* DECORATION: Architectural LED Showcase Frame */}
      {hasLed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-2 rounded-2xl border border-amber-400/35 shadow-[inset_0_0_45px_rgba(245,158,11,0.16)]"
        />
      )}

      {/* DECORATION: Luxury VIP Lounge Ambient Halo */}
      {hasVipLounge && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(245,158,11,0.16),transparent_55%)]"
        />
      )}

      {/* DECORATION: Warm Edison Pendant Lights across ceiling */}
      {hasEdison && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute top-0 inset-x-0 flex justify-around px-10 sm:px-16"
        >
          {[18, 28, 20, 26].map((cordLen, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div
                className="w-[1.5px] bg-amber-200/40"
                style={{ height: `${cordLen}px` }}
              />
              <div className="relative h-4 w-3.5 sm:h-5 sm:w-4 rounded-b-full rounded-t-sm border border-amber-300/70 bg-amber-400/40 shadow-[0_0_28px_8px_rgba(245,158,11,0.28)]">
                <div className="mx-auto mt-1 h-1.5 w-1 rounded-full bg-amber-100/95" />
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* DECORATION: Nostalgic Enamel/Neon GSM Signboard */}
      {hasSign && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 0.85, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="flex absolute top-8 left-1/2 -translate-x-1/2 items-center gap-2 rounded-lg border border-amber-400/50 bg-[#1B1610]/85 px-3 py-0.5 shadow-[0_0_20px_rgba(245,158,11,0.28)]"
        >
          <span className="font-display text-[9px] sm:text-[10.5px] font-extrabold tracking-[0.2em] text-amber-300 whitespace-nowrap">
            GSM SIMULATOR · {tierInfo.name.toUpperCase()} · 1998
          </span>
        </motion.div>
      )}

      {/* DECORATION: Prestige Metallic Wall Plaque */}
      {hasPrestigePlaque && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.92 }}
          animate={{ opacity: 0.92, y: 0, scale: 1 }}
          transition={{ duration: 0.35 }}
          className={`flex absolute top-8 right-3 sm:right-5 items-center gap-1.5 rounded-lg border-2 px-2.5 py-1 backdrop-blur-[2px] ${plaqueStyle.borderClass} ${plaqueStyle.bgClass} ${plaqueStyle.glowClass}`}
        >
          <span
            className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: plaqueStyle.accentHex }}
          />
          <div className="leading-tight">
            <div
              className={`font-display text-[8.5px] sm:text-[9.5px] font-extrabold tracking-wider uppercase ${plaqueStyle.textClass}`}
            >
              {plaqueStyle.tierLabelTr} PLAKET · P{prestigeLevel}
            </div>
            <div className="font-mono text-[7.5px] text-slate-300/90">
              EFSANE ESNAF ONUR BELGESİ
            </div>
          </div>
        </motion.div>
      )}

      {/* DECORATION: Retro 3310 Collection Shelf (Top Left Wall) */}
      {hasRetroShelf && (
        <motion.svg
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 0.58, x: 0 }}
          width="108"
          height="44"
          viewBox="0 0 126 52"
          fill="none"
          aria-hidden="true"
          className="block absolute top-8 left-3 sm:left-5"
        >
          <rect x="4" y="42" width="118" height="5" rx="2" fill="#92400E" />
          <rect x="14" y="10" width="18" height="32" rx="4" fill="#334155" stroke="#94A3B8" strokeWidth="1.2" />
          <rect x="17" y="14" width="12" height="10" rx="1.5" fill="#84CC16" fillOpacity="0.7" />
          <rect x="46" y="14" width="16" height="28" rx="3" fill="#475569" stroke="#CBD5E1" strokeWidth="1.2" />
          <line x1="46" y1="27" x2="62" y2="27" stroke="#F59E0B" strokeWidth="1.5" />
          <rect x="76" y="12" width="18" height="30" rx="3.5" fill="#1E293B" stroke="#F59E0B" strokeWidth="1.2" />
          <rect x="79" y="15" width="12" height="14" rx="1" fill="#38BDF8" fillOpacity="0.45" />
          <line x1="112" y1="4" x2="112" y2="14" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
          <rect x="104" y="14" width="14" height="28" rx="3" fill="#273244" stroke="#94A3B8" strokeWidth="1.2" />
        </motion.svg>
      )}

      {/* DECORATION: Turkish Tea & Esnaf Corner */}
      {hasTeaCorner && (
        <motion.svg
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 0.62, x: 0 }}
          width="84"
          height="46"
          viewBox="0 0 96 52"
          fill="none"
          aria-hidden="true"
          className={`hidden md:block absolute ${hasPrestigePlaque ? 'top-20' : 'top-9'} right-4`}
        >
          <rect x="14" y="14" width="24" height="28" rx="6" fill="#B45309" stroke="#F59E0B" strokeWidth="1.4" />
          <rect x="20" y="6" width="12" height="8" rx="2" fill="#D97706" />
          <line x1="38" y1="30" x2="46" y2="30" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
          <path d="M56 22 C56 28 58 31 55 39 L67 39 C64 31 66 28 66 22 Z" fill="#991B1B" stroke="#FDE68A" strokeWidth="1.3" />
          <line x1="51" y1="41" x2="71" y2="41" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
          <circle cx="84" cy="24" r="7" fill="#1D4ED8" stroke="#93C5FD" strokeWidth="1.2" />
          <circle cx="84" cy="24" r="3.5" fill="#F8FAFC" />
          <circle cx="84" cy="24" r="1.6" fill="#1E3A8A" />
        </motion.svg>
      )}

      {/* EQUIPMENT: 4K Security CCTV Camera (Top-Left Ceiling Mount) */}
      {hasCctv && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 0.9, y: 0 }}
          className={`flex absolute ${hasRetroShelf ? 'top-20' : 'top-8'} left-3 sm:left-5 items-center gap-1.5 rounded-lg border border-sky-400/35 bg-[#0F1724]/85 px-2 py-1 shadow-lg`}
        >
          <svg width="24" height="16" viewBox="0 0 28 18" fill="none" aria-hidden="true">
            <rect x="2" y="4" width="17" height="10" rx="2.5" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.2" />
            <path d="M19 6 L26 3.5 L26 14.5 L19 12 Z" fill="#0F172A" stroke="#7DD3FC" strokeWidth="1.1" />
            <circle cx="9" cy="9" r="2.2" fill="#0284C7" />
          </svg>
          <div className="flex items-center gap-1">
            <motion.span
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="h-1.5 w-1.5 rounded-full bg-rose-500"
            />
            <span className="font-mono text-[8px] font-extrabold tracking-wider text-sky-300">
              4K CCTV
            </span>
          </div>
        </motion.div>
      )}

      {/* EQUIPMENT: Neon Promo Signboard Glow */}
      {hasNeonPromo && (
        <motion.div
          animate={{ opacity: [0.68, 0.95, 0.68] }}
          transition={{ repeat: Infinity, duration: 2.8 }}
          className={`hidden sm:flex absolute ${hasSign ? 'top-16' : 'top-8'} left-1/2 -translate-x-1/2 items-center gap-1.5 rounded-full border border-fuchsia-400/50 bg-[#1B1026]/80 px-3 py-0.5 shadow-[0_0_18px_rgba(232,121,249,0.35)]`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#67E8F9]" />
          <span className="font-mono text-[8.5px] font-extrabold tracking-[0.18em] text-fuchsia-200 uppercase">
            VIP SERVİS · HIZLI ALIM · 7/24
          </span>
        </motion.div>
      )}

      {/* LICENSES: Framed Official Permits Wall Strip (Top-Right Wall) */}
      {ownedPermits.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 0.88, x: 0 }}
          className={`hidden md:flex absolute ${
            hasPrestigePlaque ? 'top-20' : 'top-9'
          } ${hasTeaCorner ? 'right-28' : 'right-4'} items-center gap-1.5`}
        >
          {ownedPermits.map((permit) => (
            <div
              key={permit.id}
              className="rounded-md border border-amber-300/40 bg-[#141A24]/88 px-1.5 py-1 shadow-md flex flex-col items-center min-w-[46px]"
            >
              <span
                className="h-1.5 w-5 rounded-full mb-0.5"
                style={{ backgroundColor: permit.color }}
              />
              <span className="font-mono text-[7px] font-extrabold tracking-tight text-slate-200 whitespace-nowrap">
                {permit.label}
              </span>
              <span className="font-mono text-[6px] text-emerald-400 uppercase">
                ONAYLI
              </span>
            </div>
          ))}
        </motion.div>
      )}

      {/* BOTTOM-LEFT COUNTER CORNER: Eski Pasaj Radyosu + Çay Kazanı + Installed Tech Equipment */}
      <div className="flex absolute bottom-2 left-2.5 sm:left-3.5 items-end gap-2">
        {hasRadio && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: radioPlaying ? 0.92 : 0.58, y: 0 }}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/35 bg-[#2A170D]/85 px-2 py-1 shadow-lg"
          >
            <svg width="28" height="20" viewBox="0 0 42 28" fill="none" aria-hidden="true">
              <rect x="2" y="3" width="38" height="22" rx="4" fill="#5C2D12" stroke="#F59E0B" strokeWidth="1.5" />
              <rect x="6" y="7" width="15" height="14" rx="2" fill="#1C120B" />
              <line x1="8" y1="10" x2="19" y2="10" stroke="#D97706" strokeWidth="1.2" />
              <line x1="8" y1="14" x2="19" y2="14" stroke="#D97706" strokeWidth="1.2" />
              <line x1="8" y1="18" x2="19" y2="18" stroke="#D97706" strokeWidth="1.2" />
              <rect x="24" y="7" width="12" height="6" rx="1.5" fill={radioPlaying ? '#14532D' : '#1E293B'} stroke="#FCD34D" strokeWidth="0.9" />
              <circle cx="27" cy="18" r="2.4" fill="#FBBF24" />
              <circle cx="34" cy="18" r="2.4" fill="#FBBF24" />
            </svg>
            {radioPlaying && (
              <div className="flex items-end gap-[2px] h-3">
                {[0.6, 1, 0.7].map((delay, i) => (
                  <motion.span
                    key={i}
                    animate={{ height: ['25%', '100%', '40%'] }}
                    transition={{ repeat: Infinity, duration: 0.75 + i * 0.15, delay: delay * 0.2 }}
                    className={`w-[2.5px] rounded-full ${
                      radioStation === 'ARABESK' ? 'bg-amber-400' : 'bg-fuchsia-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ANIMATED PASAJ COPPER TEA BOILER (ÇAY KAZANI) */}
        {hasTeaBoiler && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 0.96, y: 0 }}
            className={`relative flex items-end gap-1 rounded-lg border px-2 py-1 shadow-lg transition-colors duration-300 ${
              teaBoilerFreshActive
                ? 'border-amber-300/80 bg-[#2E190A]/92 shadow-[0_0_22px_rgba(251,191,36,0.45)]'
                : 'border-amber-500/35 bg-[#22150C]/85'
            }`}
          >
            {/* Golden Fresh-Brew Tag Burst Above Boiler */}
            <AnimatePresence>
              {teaBoilerFreshActive && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.85 }}
                  animate={{ opacity: 1, y: -4, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                  className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-amber-300/70 bg-amber-500/95 px-1.5 py-0.5 text-[8.5px] font-extrabold text-slate-950 shadow-lg"
                >
                  Taze çay doldu!
                </motion.div>
              )}
            </AnimatePresence>

            <svg
              width="44"
              height="38"
              viewBox="0 0 56 48"
              fill="none"
              aria-hidden="true"
              className="shrink-0 overflow-visible"
            >
              {/* Continuous Rising Boiler Steam */}
              <motion.path
                d="M19 10 C16 6, 22 3, 19 -1"
                stroke="#FDE68A"
                strokeWidth={teaBoilerFreshActive ? '1.9' : '1.3'}
                strokeLinecap="round"
                animate={{
                  opacity: teaBoilerFreshActive ? [0.35, 1, 0.35] : [0.15, 0.7, 0.15],
                  y: [2, -5, -10],
                }}
                transition={{ repeat: Infinity, duration: teaBoilerFreshActive ? 1.2 : 2.3 }}
              />
              <motion.path
                d="M27 9 C30 5, 24 2, 27 -2"
                stroke="#FEF3C7"
                strokeWidth={teaBoilerFreshActive ? '1.8' : '1.2'}
                strokeLinecap="round"
                animate={{
                  opacity: teaBoilerFreshActive ? [0.3, 0.95, 0.3] : [0.12, 0.6, 0.12],
                  y: [2, -6, -11],
                }}
                transition={{ repeat: Infinity, duration: teaBoilerFreshActive ? 1.35 : 2.6, delay: 0.35 }}
              />
              {/* Upper Copper Demlik Teapot */}
              <rect x="13" y="10" width="20" height="10" rx="4" fill="#B45309" stroke="#FBBF24" strokeWidth="1.3" />
              <rect x="19" y="7" width="8" height="3" rx="1.5" fill="#F59E0B" />
              <path d="M33 13 C37 12, 38 17, 33 18" stroke="#FCD34D" strokeWidth="1.4" fill="none" />
              {/* Main Copper Boiler Body */}
              <rect x="6" y="20" width="34" height="22" rx="4.5" fill="#7C2D12" stroke="#F59E0B" strokeWidth="1.5" />
              <rect x="9" y="23" width="28" height="16" rx="2.5" fill="#9A3412" stroke="#FDE68A" strokeOpacity="0.35" strokeWidth="0.8" />
              {/* Pressure Gauge */}
              <circle cx="17" cy="31" r="4.5" fill="#1C1917" stroke="#FBBF24" strokeWidth="1.1" />
              <motion.line
                x1="17"
                y1="31"
                x2="20"
                y2="28.5"
                stroke="#EF4444"
                strokeWidth="1.2"
                strokeLinecap="round"
                animate={{ rotate: teaBoilerFreshActive ? [0, 26, -6, 18] : [0, 8, 0] }}
                style={{ transformOrigin: '17px 31px' }}
                transition={{ repeat: Infinity, duration: teaBoilerFreshActive ? 0.9 : 3.2 }}
              />
              {/* Simmering Heat Indicator LED */}
              <motion.circle
                cx="30"
                cy="31"
                r="2.4"
                fill={teaBoilerFreshActive ? '#34D399' : '#F97316'}
                animate={{ opacity: [0.45, 1, 0.45] }}
                transition={{ repeat: Infinity, duration: 1.4 }}
              />
              {/* Glowing Ember Burner Under Tank */}
              <motion.rect
                x="10"
                y="43"
                width="26"
                height="2.6"
                rx="1.3"
                fill="#F97316"
                animate={{ opacity: [0.4, 0.95, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.6 }}
              />
              {/* Brass Spigot + Animated Pour Stream When Fresh */}
              <path d="M40 31 L48 31 L48 35" stroke="#FBBF24" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              {teaBoilerFreshActive && (
                <motion.line
                  x1="48"
                  y1="36"
                  x2="48"
                  y2="44"
                  stroke="#EF4444"
                  strokeWidth="2"
                  strokeDasharray="2.5 2"
                  animate={{ strokeDashoffset: [0, -9] }}
                  transition={{ repeat: Infinity, duration: 0.45, ease: 'linear' }}
                />
              )}
              {/* Waiting Mini Glass Under Spigot */}
              <path d="M45 38 L51 38 L50.3 45 L45.7 45 Z" fill="#991B1B" stroke="#FDE68A" strokeWidth="0.9" />
            </svg>
          </motion.div>
        )}

        {/* Steaming Turkish Tulip Tea Glass beside the Radio */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.9, y: 0 }}
          className="flex items-end gap-1 rounded-lg border border-amber-400/25 bg-[#191512]/80 px-2 py-1 shadow-md"
        >
          <SteamingTeaGlassSVG size="sm" delay={0} />
          {teaServedOnCounter && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <SteamingTeaGlassSVG size="sm" delay={0.7} />
            </motion.div>
          )}
        </motion.div>

        {/* EQUIPMENT: Barcode & Auto-Stock Laser Terminal (Barkod & Otomatik Stok) */}
        {hasBarcodeAuto && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 0.94, y: 0 }}
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-cyan-400/45 bg-[#0D1A24]/90 px-2 py-1 shadow-[0_0_16px_rgba(34,211,238,0.2)]"
          >
            <svg width="26" height="24" viewBox="0 0 30 28" fill="none" aria-hidden="true">
              <rect x="2" y="3" width="26" height="18" rx="3" fill="#0F172A" stroke="#22D3EE" strokeWidth="1.3" />
              <line x1="6" y1="8" x2="6" y2="16" stroke="#CBD5E1" strokeWidth="1.4" />
              <line x1="9.5" y1="8" x2="9.5" y2="16" stroke="#CBD5E1" strokeWidth="0.9" />
              <line x1="12.5" y1="8" x2="12.5" y2="16" stroke="#CBD5E1" strokeWidth="1.8" />
              <line x1="16.5" y1="8" x2="16.5" y2="16" stroke="#CBD5E1" strokeWidth="1" />
              <line x1="19.5" y1="8" x2="19.5" y2="16" stroke="#CBD5E1" strokeWidth="1.5" />
              <line x1="23" y1="8" x2="23" y2="16" stroke="#CBD5E1" strokeWidth="1" />
              {/* Sweeping Red Laser Scan Line */}
              <motion.line
                x1="4"
                x2="26"
                y1="12"
                y2="12"
                stroke="#F43F5E"
                strokeWidth="1.6"
                animate={{ y1: [7, 17, 7], y2: [7, 17, 7], opacity: [0.6, 1, 0.6] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              />
              <rect x="9" y="22" width="12" height="3" rx="1" fill="#334155" />
            </svg>
            <div className="leading-tight font-mono">
              <div className="flex items-center gap-1 text-[8px] font-extrabold text-cyan-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                BARKOD OTO
              </div>
              <div className="text-[7.5px] text-slate-300 tabular-nums">
                STOK:{totalAccessoryStock} · +%35
              </div>
            </div>
          </motion.div>
        )}

        {/* EQUIPMENT: Pro Diagnostic Waveform Monitor / Smart POS / ESD Lab Status */}
        {(hasProDiag || hasSmartPos || hasRepairBench || hasMicroSolder || hasCleanRoom || hasCloudCrm) && (
          <div className="hidden lg:flex items-center gap-1.5">
            {hasProDiag && (
              <div className="flex items-center gap-1 rounded-lg border border-sky-400/35 bg-[#0E1826]/88 px-2 py-1">
                <svg width="20" height="16" viewBox="0 0 24 18" fill="none" aria-hidden="true">
                  <rect x="1" y="2" width="22" height="14" rx="2" fill="#0B1220" stroke="#38BDF8" strokeWidth="1.2" />
                  <motion.path
                    d="M3 10 L7 10 L9 5 L12 13 L15 7 L17 10 L21 10"
                    stroke="#34D399"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    animate={{ opacity: [0.55, 1, 0.55] }}
                    transition={{ repeat: Infinity, duration: 1.4 }}
                  />
                </svg>
                <span className="font-mono text-[7.5px] font-extrabold text-sky-300">
                  PRO TARA
                </span>
              </div>
            )}

            {hasSmartPos && (
              <div className="flex items-center gap-1 rounded-lg border border-emerald-400/35 bg-[#0E1D1A]/88 px-2 py-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
                <span className="font-mono text-[7.5px] font-extrabold text-emerald-300">
                  NFC POS %1
                </span>
              </div>
            )}

            {(hasCleanRoom || hasMicroSolder || hasRepairBench) && (
              <div className="flex items-center gap-1 rounded-lg border border-amber-400/30 bg-[#1B1712]/88 px-2 py-1">
                <span
                  className={`h-2 w-2 rounded-full ${
                    hasCleanRoom
                      ? 'bg-teal-300'
                      : hasMicroSolder
                      ? 'bg-indigo-400'
                      : 'bg-amber-400'
                  }`}
                />
                <span className="font-mono text-[7.5px] font-extrabold text-amber-200">
                  {hasCleanRoom ? 'ISO-5 LAB' : hasMicroSolder ? 'BGA MİKRO' : 'ESD TEZGAH'}
                </span>
              </div>
            )}

            {hasCloudCrm && (
              <div className="flex items-center gap-1 rounded-lg border border-indigo-400/35 bg-[#12162A]/88 px-2 py-1">
                <span className="font-mono text-[7.5px] font-extrabold text-indigo-300">
                  CRM BULUT
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* BOTTOM-RIGHT WAITING LOUNGE: Espresso Bar (if owned) + Customer Armchairs & Waiting Customers */}
      <div className="flex absolute bottom-2 right-2.5 sm:right-4 items-end gap-2">
        {hasEspressoBar && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 0.92, y: 0 }}
            className="hidden md:flex flex-col items-center rounded-lg border border-orange-400/35 bg-[#201610]/88 px-2 py-1 shadow-lg"
          >
            <svg width="24" height="22" viewBox="0 0 28 24" fill="none" aria-hidden="true">
              <rect x="4" y="3" width="20" height="7" rx="2" fill="#78350F" stroke="#FB923C" strokeWidth="1.2" />
              <rect x="6" y="10" width="16" height="9" fill="#1C1917" stroke="#94A3B8" strokeWidth="1" />
              <rect x="11" y="13" width="6" height="5" rx="1" fill="#F8FAFC" />
              <rect x="3" y="19" width="22" height="3" rx="1" fill="#92400E" />
            </svg>
            <span className="font-mono text-[7px] font-extrabold text-orange-300 mt-0.5">
              ESPRESSO
            </span>
          </motion.div>
        )}
        <div
          className={`flex items-end gap-2 rounded-xl border px-2.5 pt-2 pb-1.5 backdrop-blur-[2px] shadow-xl ${
            isPlushLounge
              ? 'border-amber-400/40 bg-[#22170E]/82'
              : 'border-white/12 bg-[#141B24]/82'
          }`}
        >
          {/* Two Waiting Lounge Seats with Animated Seated Customers */}
          <div className="flex items-end gap-2">
            {[0, 1].map((seatIdx) => {
              const guest = waitingCustomers[seatIdx];
              return (
                <div
                  key={seatIdx}
                  className="relative flex flex-col items-center w-[54px] sm:w-[62px]"
                >
                  {/* Seated Animated Customer (when someone is waiting in queue) */}
                  <AnimatePresence mode="popLayout">
                    {guest && (
                      <motion.div
                        key={guest.id}
                        initial={{ opacity: 0, y: 8, scale: 0.85 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -12, scale: 0.85 }}
                        transition={{ duration: 0.28 }}
                        className="relative z-10 flex flex-col items-center -mb-2.5"
                      >
                        <span className="mb-0.5 max-w-[60px] truncate text-[8px] font-semibold text-amber-200/90">
                          {guest.name.split(' ')[0]}
                        </span>
                        {/* Gentle breathing + occasional tea-sipping bob */}
                        <motion.div
                          animate={{ y: [0, -1.8, 0] }}
                          transition={{
                            repeat: Infinity,
                            duration: 2.6 + seatIdx * 0.5,
                            ease: 'easeInOut',
                          }}
                          className="relative"
                        >
                          <div
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-amber-300/60 overflow-hidden shadow-md flex items-center justify-center text-[10px] font-bold text-white"
                            style={{ backgroundColor: guest.fallbackColor }}
                          >
                            <img
                              src={guest.portraitPath}
                              alt={guest.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {/* Animated Tiny Tea Cup Lifting While Waiting */}
                          <motion.div
                            animate={{
                              y: [1, -3, 1, 1],
                              rotate: [0, -16, 0, 0],
                            }}
                            transition={{
                              repeat: Infinity,
                              duration: 4.2 + seatIdx * 1.1,
                              times: [0, 0.22, 0.45, 1],
                              ease: 'easeInOut',
                            }}
                            className="absolute -right-1.5 bottom-0 w-2.5 h-3 rounded-b-sm border border-amber-200/80 bg-rose-800/90 shadow"
                          />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Handcrafted Customer Armchair SVG */}
                  <svg
                    width="54"
                    height="28"
                    viewBox="0 0 60 32"
                    fill="none"
                    aria-hidden="true"
                  >
                    {/* Chair Backrest */}
                    <rect
                      x="8"
                      y="4"
                      width="44"
                      height="15"
                      rx="5"
                      fill={isPlushLounge ? '#78350F' : '#334155'}
                      stroke={isPlushLounge ? '#F59E0B' : '#64748B'}
                      strokeWidth="1.4"
                    />
                    {/* Left & Right Armrests */}
                    <rect
                      x="3"
                      y="12"
                      width="8"
                      height="13"
                      rx="3"
                      fill={isPlushLounge ? '#92400E' : '#475569'}
                      stroke={isPlushLounge ? '#FBBF24' : '#94A3B8'}
                      strokeWidth="1.2"
                    />
                    <rect
                      x="49"
                      y="12"
                      width="8"
                      height="13"
                      rx="3"
                      fill={isPlushLounge ? '#92400E' : '#475569'}
                      stroke={isPlushLounge ? '#FBBF24' : '#94A3B8'}
                      strokeWidth="1.2"
                    />
                    {/* Seat Cushion */}
                    <rect
                      x="9"
                      y="17"
                      width="42"
                      height="8"
                      rx="3"
                      fill={isPlushLounge ? '#B45309' : '#1E293B'}
                      stroke={isPlushLounge ? '#FCD34D' : '#64748B'}
                      strokeWidth="1.2"
                    />
                    {/* Wooden Chair Legs */}
                    <line x1="12" y1="25" x2="10" y2="30" stroke="#92400E" strokeWidth="2.2" strokeLinecap="round" />
                    <line x1="48" y1="25" x2="50" y2="30" stroke="#92400E" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>
                </div>
              );
            })}
          </div>

          {/* Mini Wooden Side Table (Sehpa) with Steaming Tea Glass */}
          <div className="flex flex-col items-center">
            <div className="-mb-1">
              <SteamingTeaGlassSVG size="sm" delay={0.35} />
            </div>
            <svg width="26" height="14" viewBox="0 0 28 16" fill="none" aria-hidden="true">
              <rect x="2" y="2" width="24" height="4" rx="1.5" fill="#92400E" stroke="#F59E0B" strokeWidth="1" />
              <line x1="6" y1="6" x2="5" y2="14" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
              <line x1="22" y1="6" x2="23" y2="14" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* LIVE GLASS SHOWCASE SHELF: Mirrors player's actual listed showcase inventory */}
      {listedPhones.length > 0 && (
        <div
          aria-hidden="true"
          className="hidden xl:flex absolute bottom-1.5 left-1/2 -translate-x-1/2 items-end gap-2.5 rounded-t-xl border-x border-t border-white/10 bg-[#0D131C]/55 px-4 pt-2 pb-1.5 backdrop-blur-[2px] opacity-75"
        >
          <span className="text-[9px] font-semibold tracking-wider text-amber-300/75 uppercase mr-1 self-center">
            Vitrin ({listedPhones.length})
          </span>
          {listedPhones.slice(0, 7).map((phone) => (
            <div key={phone.uid} className="flex flex-col items-center gap-0.5">
              <div
                className="h-7 w-4 rounded-[3px] border flex flex-col items-center justify-between p-[2px] shadow-sm"
                style={{
                  backgroundColor: phone.bodyColor,
                  borderColor: phone.isBrandNew ? '#34D399' : phone.accentColor,
                }}
              >
                <span className="h-[2px] w-1.5 rounded-full bg-black/60" />
                <span
                  className="h-1.5 w-1.5 rounded-full opacity-75"
                  style={{ backgroundColor: phone.accentColor }}
                />
              </div>
              <span className="h-[2px] w-5 rounded-full bg-amber-400/35" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
