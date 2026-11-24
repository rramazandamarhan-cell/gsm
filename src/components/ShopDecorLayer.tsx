import React from 'react';
import { motion } from 'motion/react';
import { SHOP_TIERS } from '../game/catalog';
import { DecorationId, PhoneDevice, ShopTier, StoreEventVisualKind } from '../game/types';

interface ShopDecorLayerProps {
  shopTier: ShopTier;
  activeDecorations: DecorationId[];
  activeEventVisual?: StoreEventVisualKind | null;
  listedPhones?: PhoneDevice[];
}

const TIER_GLOW_BY_TIER: Record<ShopTier, string> = {
  1: 'rgba(245,158,11,0.12)',
  2: 'rgba(251,191,36,0.14)',
  3: 'rgba(56,189,248,0.14)',
  4: 'rgba(16,185,129,0.14)',
  5: 'rgba(167,139,250,0.15)',
  6: 'rgba(245,158,11,0.20)',
};

export const ShopDecorLayer: React.FC<ShopDecorLayerProps> = ({
  shopTier,
  activeDecorations,
  activeEventVisual = null,
  listedPhones = [],
}) => {
  const tierInfo = SHOP_TIERS[shopTier];
  const hasSign = activeDecorations.includes('vintage_sign');
  const hasEdison = activeDecorations.includes('edison_lights');
  const hasRetroShelf = activeDecorations.includes('retro_shelf');
  const hasLed = activeDecorations.includes('led_showcase');
  const hasTeaCorner = activeDecorations.includes('tea_corner');
  const hasVipLounge = activeDecorations.includes('vip_lounge');

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
      {/* Vivid Shop Interior Backdrop (Higher Clarity for Real Shop Feel) */}
      <img
        src={tierInfo.backdropPath}
        alt=""
        aria-hidden="true"
        referrerPolicy="no-referrer"
        className="absolute inset-0 h-full w-full object-cover opacity-[0.44] transition-all duration-500"
      />

      {/* Balanced Atmospheric Readability Scrim (keeps interior clear while cards stay crisp) */}
      <div
        className="absolute inset-0 transition-all duration-500"
        style={{
          background: `radial-gradient(circle at 50% 10%, ${TIER_GLOW_BY_TIER[shopTier]} 0%, rgba(12,17,24,0.68) 72%)`,
        }}
      />

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
          className="absolute top-0 inset-x-0 flex justify-around px-16"
        >
          {[22, 34, 24, 32].map((cordLen, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div
                className="w-[1.5px] bg-amber-200/40"
                style={{ height: `${cordLen}px` }}
              />
              <div className="relative h-5 w-4 rounded-b-full rounded-t-sm border border-amber-300/70 bg-amber-400/40 shadow-[0_0_32px_10px_rgba(245,158,11,0.3)]">
                <div className="mx-auto mt-1 h-2 w-1 rounded-full bg-amber-100/95" />
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* DECORATION: Nostalgic Enamel/Neon GSM Signboard (Top Center) */}
      {hasSign && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="hidden xl:flex absolute top-2 left-1/2 -translate-x-1/2 items-center gap-2 rounded-lg border border-amber-400/50 bg-[#1B1610]/88 px-4 py-1 shadow-[0_0_24px_rgba(245,158,11,0.32)]"
        >
          <span className="font-display text-[11px] font-extrabold tracking-[0.22em] text-amber-300">
            GSM SIMULATOR · {tierInfo.name.toUpperCase()} · 1998
          </span>
        </motion.div>
      )}

      {/* DECORATION: Retro 3310 Collection Shelf (Top Left Ambient Motif) */}
      {hasRetroShelf && (
        <motion.svg
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 0.6, x: 0 }}
          width="126"
          height="52"
          viewBox="0 0 126 52"
          fill="none"
          aria-hidden="true"
          className="hidden xl:block absolute top-2 left-6"
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

      {/* DECORATION: Turkish Tea & Esnaf Corner (Top Right Ambient Motif) */}
      {hasTeaCorner && (
        <motion.svg
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 0.65, x: 0 }}
          width="96"
          height="52"
          viewBox="0 0 96 52"
          fill="none"
          aria-hidden="true"
          className="hidden xl:block absolute top-2 right-6"
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
      {/* LIVE GLASS SHOWCASE SHELF: Mirrors player's actual listed showcase inventory */}
      {listedPhones.length > 0 && (
        <div
          aria-hidden="true"
          className="hidden lg:flex absolute bottom-1.5 left-1/2 -translate-x-1/2 items-end gap-2.5 rounded-t-xl border-x border-t border-white/10 bg-[#0D131C]/55 px-4 pt-2 pb-1.5 backdrop-blur-[2px] opacity-75"
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
