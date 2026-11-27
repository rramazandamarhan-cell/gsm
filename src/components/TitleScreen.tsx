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
  bannerBottomInset?: number;
  onStartNew: () => void;
  onContinue: () => void;
  onOpenCompliance: (
    tab?: 'SETTINGS' | 'PRIVACY',
    legalView?: 'privacy' | 'terms'
  ) => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  savedState,
  bannerBottomInset = 0,
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
      <header className="relative z-20 flex-shrink-0 flex items-center justify-between safe-px pt-1.5 [@media(min-height:600px)]:pt-2.5 gap-2">
        <div className="h-[20px] [@media(min-height:600px)]:h-[24px] inline-flex items-center gap-1 rounded border border-white/12 bg-[#0E141D]/80 backdrop-blur-sm px-1.5 text-[9px] [@media(min-height:600px)]:text-[10px] leading-none font-mono text-slate-200 flex-shrink-0">
          <img
            src="/pwa-192x192.png"
            alt="GSM Simulator"
            className="w-2.5 h-2.5 [@media(min-height:600px)]:w-3 [@media(min-height:600px)]:h-3 rounded-[2px] object-cover flex-shrink-0"
          />
          <span>v{STORE_RELEASE_META.versionName}</span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div
            role="group"
            aria-label={bi('Dil seçimi', 'Language selector')}
            className="h-[20px] [@media(min-height:600px)]:h-[24px] inline-flex items-center rounded border border-white/15 bg-[#101722]/85 backdrop-blur-sm p-[2px] text-[9px] [@media(min-height:600px)]:text-[10px] leading-none font-bold flex-shrink-0"
          >
            <Globe className="w-2.5 h-2.5 [@media(min-height:600px)]:w-3 [@media(min-height:600px)]:h-3 text-amber-400 ml-1 mr-0.5 flex-shrink-0" />
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setLang('tr');
              }}
              className={`h-full inline-flex items-center justify-center rounded-[3px] px-1.5 transition-colors cursor-pointer touch-manipulation ${
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
              className={`h-full inline-flex items-center justify-center rounded-[3px] px-1.5 transition-colors cursor-pointer touch-manipulation ${
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
            className="h-[20px] [@media(min-height:600px)]:h-[24px] inline-flex items-center gap-1 rounded border border-white/15 bg-[#101722]/85 backdrop-blur-sm px-1.5 [@media(min-height:600px)]:px-2 text-[9px] [@media(min-height:600px)]:text-[10px] leading-none font-semibold text-slate-200 hover:bg-[#1C2736] hover:border-amber-400/40 transition-colors cursor-pointer whitespace-nowrap touch-manipulation flex-shrink-0"
          >
            <ShieldCheck className="w-2.5 h-2.5 [@media(min-height:600px)]:w-3 [@media(min-height:600px)]:h-3 text-sky-400 flex-shrink-0" />
            <span>{bi('Ayarlar & Gizlilik', 'Settings & Privacy')}</span>
          </button>
        </div>
      </header>

      {/* Center Stage: Clean Centered Brand Logo + Hook + High-Impact CTAs */}
      <main className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center safe-px py-1.5 text-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center max-w-md w-full"
        >
          <div className="mb-1.5 [@media(min-height:660px)]:mb-2.5 w-full flex justify-center">
            <BrandLogo size="hero" />
          </div>

          <p className="max-w-md text-[10.5px] [@media(min-height:520px)]:text-[11px] [@media(min-height:660px)]:text-[12px] text-slate-200/95 leading-snug mb-2.5 [@media(min-height:660px)]:mb-3.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            {bi(
              '23 yaşında kendi telefoncu dükkanını aç! Dedektif ekspertiz, mikro tamir tezgahı, ateşli pazarlık ve marka bayilikleriyle pasajdan dev GSM Showroom’una büyü.',
              'Open your own phone shop at age 23! Spot hidden defects with your optical loupe, run micro-repairs, haggle hard, and grow from a tiny arcade stall to a grand GSM Showroom.'
            )}
          </p>

          <div className="flex flex-row flex-wrap items-center justify-center gap-2 [@media(min-height:660px)]:gap-2.5">
            {savedState ? (
              <>
                <button
                  type="button"
                  onClick={onContinue}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-4 py-1.5 [@media(min-height:660px)]:px-5 [@media(min-height:660px)]:py-2 text-[11px] [@media(min-height:660px)]:text-xs font-extrabold text-slate-950 shadow-[0_6px_20px_rgba(245,158,11,0.4)] hover:bg-amber-400 active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
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
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/18 bg-[#121A26]/90 backdrop-blur-sm px-3.5 py-1.5 [@media(min-height:660px)]:px-4 [@media(min-height:660px)]:py-2 text-[11px] [@media(min-height:660px)]:text-xs font-semibold text-slate-200 hover:bg-[#1E2836] active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>{bi('Yeni Kariyer', 'New Career')}</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onStartNew}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-5 py-1.5 [@media(min-height:660px)]:px-6 [@media(min-height:660px)]:py-2 text-[11.5px] [@media(min-height:660px)]:text-xs font-extrabold text-slate-950 shadow-[0_6px_20px_rgba(245,158,11,0.42)] hover:bg-amber-400 active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>{bi('Dükkanı Aç', 'Open Shop')}</span>
              </button>
            )}
          </div>

          {savedState && (
            <div className="mt-2 [@media(min-height:660px)]:mt-2.5 inline-flex flex-wrap items-center justify-center gap-1.5 rounded-lg border border-white/12 bg-[#0E1520]/85 backdrop-blur-sm px-2.5 py-1 text-[10px] [@media(min-height:660px)]:text-[10.5px] text-slate-200 tabular-nums">
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
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                {savedState.reputation.toFixed(1)}
              </span>
            </div>
          )}
        </motion.div>
      </main>

      {/* Clean Non-Overlapping Legal Footer (In-app modal triggers for Android/iOS WebView safety) */}
      <footer
        className="relative z-10 pb-1 [@media(min-height:660px)]:pb-2 safe-px safe-pb text-center shrink-0 transition-[margin] duration-150"
        style={bannerBottomInset > 0 ? { marginBottom: `${bannerBottomInset}px` } : undefined}
      >
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[9.5px] [@media(min-height:660px)]:text-[10px] text-slate-300/85">
          <span>PEGI 3 / 4+</span>
          <span aria-hidden="true" className="text-slate-600">
            ·
          </span>
          <button
            type="button"
            onClick={() => onOpenCompliance('PRIVACY', 'privacy')}
            className="underline py-0.5 px-1 hover:text-amber-300 transition-colors cursor-pointer touch-manipulation"
          >
            {bi('Gizlilik Politikası', 'Privacy Policy')}
          </button>
          <span aria-hidden="true" className="text-slate-600">
            ·
          </span>
          <button
            type="button"
            onClick={() => onOpenCompliance('PRIVACY', 'terms')}
            className="underline py-0.5 px-1 hover:text-amber-300 transition-colors cursor-pointer touch-manipulation"
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
