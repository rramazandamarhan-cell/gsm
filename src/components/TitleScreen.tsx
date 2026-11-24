import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Globe, Play, RotateCcw, ShieldCheck, Star } from 'lucide-react';
import { SHOP_TIERS } from '../game/catalog';
import { formatTRY } from '../game/engine';
import { getLocalizedShopTierName, useLanguage } from '../game/i18n';
import { soundFX } from '../game/sound';
import { STORE_RELEASE_META } from '../game/storeBridge';
import { ShopState } from '../game/types';
import { BrandLogo } from './BrandLogo';
import { OfflineIndicator } from './OfflineIndicator';

interface TitleScreenProps {
  savedState: ShopState | null;
  onStartNew: () => void;
  onContinue: () => void;
  onOpenCompliance: (
    tab?: 'SETTINGS' | 'PRIVACY',
    legalView?: 'privacy' | 'terms'
  ) => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  savedState,
  onStartNew,
  onContinue,
  onOpenCompliance,
}) => {
  const { lang, setLang, bi } = useLanguage();
  const [imgFailed, setImgFailed] = useState(false);
  const backdropUrl = savedState
    ? SHOP_TIERS[savedState.shopTier].backdropPath
    : SHOP_TIERS[1].backdropPath;

  return (
    <div className="relative h-dvh w-screen overflow-hidden bg-[#0F141B] flex flex-col justify-between select-none">
      {/* Full-bleed atmospheric shop interior backdrop */}
      {!imgFailed ? (
        <img
          src={backdropUrl}
          alt={bi(
            'GSM Simulator 2D İllüstrasyonlu Telefon Dükkanı',
            'GSM Simulator 2D Illustrated Phone Shop'
          )}
          referrerPolicy="no-referrer"
          draggable={false}
          onError={() => setImgFailed(true)}
          className="absolute inset-0 h-full w-full object-cover object-center scale-[1.02]"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 35%, #273242 0%, #141B24 55%, #0C1016 100%)',
          }}
        />
      )}

      {/* Cinematic warm vignette scrim for crisp foreground legibility */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 42%, rgba(12,17,24,0.44) 0%, rgba(10,14,20,0.82) 70%, rgba(8,12,18,0.94) 100%)',
        }}
      />

      {/* Top Bar: App Icon + Version Tag | TR/EN Switch + Settings & Privacy */}
      <header className="relative z-20 flex items-center justify-between safe-px pt-2 lg:pt-3.5 shrink-0 gap-2">
        <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-[#0E141D]/80 backdrop-blur-sm px-2 py-1 text-[11px] font-mono text-slate-200">
          <img
            src="/pwa-192x192.png"
            alt="GSM Simulator"
            className="w-4 h-4 rounded object-cover shrink-0"
          />
          <span>v{STORE_RELEASE_META.versionName}</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div
            role="group"
            aria-label={bi('Dil seçimi', 'Language selector')}
            className="inline-flex items-center rounded-lg border border-white/15 bg-[#101722]/85 backdrop-blur-sm p-0.5 text-[10.5px] font-bold"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400 ml-1.5 mr-1 shrink-0" />
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setLang('tr');
              }}
              className={`rounded-md px-2 py-0.5 transition-colors cursor-pointer ${
                lang === 'tr'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              TR
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setLang('en');
              }}
              className={`rounded-md px-2 py-0.5 transition-colors cursor-pointer ${
                lang === 'en'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          <button
            type="button"
            onClick={() => onOpenCompliance('SETTINGS')}
            className="inline-flex items-center gap-1.5 min-h-[34px] rounded-lg border border-white/15 bg-[#101722]/85 backdrop-blur-sm px-3 py-1 text-[11px] font-semibold text-slate-200 hover:bg-[#1C2736] hover:border-amber-400/40 transition-colors cursor-pointer whitespace-nowrap touch-manipulation"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>{bi('Ayarlar & Gizlilik', 'Settings & Privacy')}</span>
          </button>
        </div>
      </header>

      {/* Center Stage: Clean Centered Brand Logo + Hook + High-Impact CTAs */}
      <main className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center safe-px py-2 text-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center max-w-xl w-full"
        >
          <div className="mb-2.5 lg:mb-4 w-full flex justify-center">
            <BrandLogo size="hero" />
          </div>

          <p className="max-w-lg text-[11.5px] sm:text-xs lg:text-sm text-slate-200/95 leading-snug lg:leading-relaxed mb-3.5 lg:mb-5 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
            {bi(
              '23 yaşında kendi telefoncu dükkanını aç! Dedektif ekspertiz, mikro tamir tezgahı, ateşli pazarlık ve marka bayilikleriyle pasajdan dev GSM Showroom’una büyü.',
              'Open your own phone shop at age 23! Spot hidden defects with your optical loupe, run micro-repairs, haggle hard, and grow from a tiny arcade stall to a grand GSM Showroom.'
            )}
          </p>

          <div className="flex flex-row flex-wrap items-center justify-center gap-2.5 lg:gap-3.5">
            {savedState ? (
              <>
                <button
                  type="button"
                  onClick={onContinue}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 lg:px-8 lg:py-3.5 text-xs sm:text-sm lg:text-base font-extrabold text-slate-950 shadow-[0_10px_30px_rgba(245,158,11,0.45)] hover:bg-amber-400 active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Play className="w-4 h-4 lg:w-5 lg:h-5 fill-slate-950" />
                  <span>
                    {bi(
                      `Devam Et (Gün ${savedState.day})`,
                      `Continue (Day ${savedState.day})`
                    )}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={onStartNew}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/18 bg-[#121A26]/90 backdrop-blur-sm px-5 py-2.5 lg:px-6 lg:py-3.5 text-xs lg:text-sm font-semibold text-slate-200 hover:bg-[#1E2836] active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  <span>{bi('Yeni Kariyer', 'New Career')}</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onStartNew}
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-amber-500 px-8 py-2.5 lg:px-10 lg:py-3.5 text-sm lg:text-base font-extrabold text-slate-950 shadow-[0_10px_32px_rgba(245,158,11,0.48)] hover:bg-amber-400 active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Play className="w-4 h-4 lg:w-5 lg:h-5 fill-slate-950" />
                <span>{bi('Dükkanı Aç', 'Open Shop')}</span>
              </button>
            )}
          </div>

          {savedState && (
            <div className="mt-2.5 lg:mt-4 inline-flex flex-wrap items-center justify-center gap-2 rounded-xl border border-white/12 bg-[#0E1520]/85 backdrop-blur-sm px-3.5 py-1.5 text-[11px] lg:text-xs text-slate-200 tabular-nums">
              <span className="font-semibold text-amber-300">
                {getLocalizedShopTierName(savedState.shopTier, lang)}
              </span>
              <span aria-hidden="true" className="text-slate-600">
                ·
              </span>
              <span>
                {bi('Gün', 'Day')} {savedState.day}
              </span>
              <span aria-hidden="true" className="text-slate-600">
                ·
              </span>
              <span className="font-mono font-bold text-emerald-400">
                {formatTRY(savedState.cash)}
              </span>
              <span aria-hidden="true" className="text-slate-600">
                ·
              </span>
              <span className="inline-flex items-center gap-1 text-amber-300 font-mono">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {savedState.reputation.toFixed(1)}
              </span>
            </div>
          )}
        </motion.div>
      </main>

      {/* Clean Non-Overlapping Legal Footer (In-app modal triggers for Android/iOS WebView safety) */}
      <footer className="relative z-10 pb-1.5 lg:pb-3 safe-px safe-pb text-center shrink-0">
        <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-0.5 text-[10.5px] text-slate-300/85">
          <span>PEGI 3 / 4+</span>
          <span aria-hidden="true" className="text-slate-600">
            ·
          </span>
          <button
            type="button"
            onClick={() => onOpenCompliance('PRIVACY', 'privacy')}
            className="underline py-1 px-1 hover:text-amber-300 transition-colors cursor-pointer touch-manipulation"
          >
            {bi('Gizlilik Politikası', 'Privacy Policy')}
          </button>
          <span aria-hidden="true" className="text-slate-600">
            ·
          </span>
          <button
            type="button"
            onClick={() => onOpenCompliance('PRIVACY', 'terms')}
            className="underline py-1 px-1 hover:text-amber-300 transition-colors cursor-pointer touch-manipulation"
          >
            {bi('Kullanım Koşulları', 'Terms of Use')}
          </button>
          <span aria-hidden="true" className="text-slate-600">
            ·
          </span>
          <span>{bi('Parodi Marka İçerir', 'Parody Brands Only')}</span>
        </div>
      </footer>

      <OfflineIndicator />
    </div>
  );
};
