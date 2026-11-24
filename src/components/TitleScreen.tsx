import React, { useState } from 'react';
import { Play, RotateCcw, ShieldCheck } from 'lucide-react';
import { SHOP_TIERS } from '../game/catalog';
import { formatTRY } from '../game/engine';
import { ShopState } from '../game/types';
import { BrandLogo } from './BrandLogo';
import { OfflineIndicator } from './OfflineIndicator';
import { PWAInstallButton } from './PWAInstallButton';

interface TitleScreenProps {
  savedState: ShopState | null;
  onStartNew: () => void;
  onContinue: () => void;
  onOpenCompliance: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  savedState,
  onStartNew,
  onContinue,
  onOpenCompliance,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const backdropUrl = savedState
    ? SHOP_TIERS[savedState.shopTier].backdropPath
    : SHOP_TIERS[1].backdropPath;

  return (
    <div className="relative h-dvh w-screen overflow-hidden bg-[#0F141B] flex flex-col justify-between">
      {!imgFailed ? (
        <img
          src={backdropUrl}
          alt="GSM Simulator 2D İllüstrasyonlu Telefon Dükkanı"
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="absolute inset-0 h-full w-full object-cover object-center scale-[1.01]"
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

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(11,16,23,0.82) 0%, rgba(11,16,23,0.48) 44%, rgba(11,16,23,0.88) 100%)',
        }}
      />

      {/* Top-right Store Compliance & Privacy access (Mandatory before gameplay for App Store / Play Store) */}
      <div className="relative z-20 flex items-center justify-end safe-px pt-2.5 lg:pt-4 shrink-0">
        <button
          type="button"
          onClick={onOpenCompliance}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#121923]/85 px-3 py-1.5 text-[11px] lg:text-xs font-semibold text-slate-200 hover:bg-[#1C2736] transition-colors cursor-pointer whitespace-nowrap"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
          <span>Gizlilik, Ayarlar & Veri</span>
        </button>
      </div>

      <main className="relative z-10 flex-1 min-h-0 overflow-y-auto pasaj-scroll flex flex-col items-center safe-px py-2 lg:py-4 text-center">
        <div className="my-auto flex flex-col items-center">
          <div className="mb-2.5 lg:mb-5 scale-90 lg:scale-100">
            <BrandLogo size="hero" />
          </div>

          <p className="max-w-lg text-xs sm:text-sm lg:text-lg text-slate-200/95 leading-snug lg:leading-relaxed mb-4 lg:mb-7">
            23 yaşında, 5 yıllık çıraklıktan sonra kendi dükkanını aç! 2. el ekspertiz, 5 aşamalı mikro tamir,
            aksesuar reyonu ve sıfır kutu marka bayiliğiyle küçük pasajdan dev GSM Showroom’una büyü.
          </p>

          <div className="flex flex-row flex-wrap items-center justify-center gap-2.5 lg:gap-3.5">
            {savedState ? (
              <>
                <button
                  type="button"
                  onClick={onContinue}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 lg:px-8 lg:py-3.5 text-sm lg:text-base font-bold text-slate-950 shadow-[0_8px_28px_rgba(245,158,11,0.35)] hover:bg-amber-400 active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Play className="w-4 h-4 lg:w-5 lg:h-5 fill-slate-950" />
                  <span>Dükkanı Aç (Gün {savedState.day})</span>
                </button>

                <button
                  type="button"
                  onClick={onStartNew}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-[#151C26]/90 px-5 py-2.5 lg:px-6 lg:py-3.5 text-xs lg:text-sm font-semibold text-slate-200 hover:bg-[#1E2836] active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  <span>Yeni Kariyer</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onStartNew}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-7 py-3 lg:px-9 lg:py-4 text-sm lg:text-base font-bold text-slate-950 shadow-[0_8px_28px_rgba(245,158,11,0.38)] hover:bg-amber-400 active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Play className="w-4 h-4 lg:w-5 lg:h-5 fill-slate-950" />
                <span>Dükkanı Aç</span>
              </button>
            )}
          </div>

          <div className="mt-2.5 lg:mt-4">
            <PWAInstallButton variant="hero" />
          </div>

          {savedState && (
            <div className="mt-2.5 lg:mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] lg:text-sm text-slate-300 tabular-nums">
              <span>{SHOP_TIERS[savedState.shopTier].name}</span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span>Sv. {savedState.level}</span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span>Kasa {formatTRY(savedState.cash)}</span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span>İtibar {savedState.reputation.toFixed(1)} / 5.0</span>
            </div>
          )}
        </div>
      </main>

      <footer className="relative z-10 pb-2 lg:pb-4 safe-px text-center shrink-0 space-y-1">
        <div className="flex flex-wrap items-center justify-center gap-3 text-[10.5px] text-slate-300/85">
          <span>PEGI 3 / 4+</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <a
            href="/privacy.html"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-amber-300 transition-colors"
          >
            Gizlilik Politikası
          </a>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <a
            href="/terms.html"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-amber-300 transition-colors"
          >
            Kullanım Koşulları
          </a>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Parodi Marka İçerir</span>
        </div>
        <p className="hidden sm:block text-[10.5px] text-slate-400/75 tracking-wide">
          Tıkla İncele · Enter Teklif Ver · Space Sonraki Müşteri · 1-6 Sekmeler · Esc Duraklat
        </p>
      </footer>

      <OfflineIndicator />
    </div>
  );
};
