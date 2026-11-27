import React, { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Compass,
  Handshake,
  Search,
  Sparkles,
  Wrench,
  X,
} from 'lucide-react';
import { useLanguage } from '../game/i18n';
import { soundFX } from '../game/sound';

interface ShopTourOverlayProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface TourStepDef {
  id: string;
  targets: string[];
  placement: 'side' | 'below';
  icon: React.ReactNode;
  titleTr: string;
  titleEn: string;
  bodyTr: string;
  bodyEn: string;
  tipTr: string;
  tipEn: string;
}

interface RectBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PAD = 5;

function measureCombinedTargets(targets: string[]): RectBox | null {
  if (typeof document === 'undefined') return null;
  let minTop = Infinity;
  let minLeft = Infinity;
  let maxRight = -Infinity;
  let maxBottom = -Infinity;
  let found = 0;

  for (const key of targets) {
    const el = document.querySelector(`[data-tour="${key}"]`);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) continue;
    found += 1;
    minTop = Math.min(minTop, r.top);
    minLeft = Math.min(minLeft, r.left);
    maxRight = Math.max(maxRight, r.right);
    maxBottom = Math.max(maxBottom, r.bottom);
  }

  if (found === 0) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const top = Math.max(4, minTop - PAD);
  const left = Math.max(4, minLeft - PAD);
  const right = Math.min(vw - 4, maxRight + PAD);
  const bottom = Math.min(vh - 4, maxBottom + PAD);

  return {
    top,
    left,
    width: Math.max(24, right - left),
    height: Math.max(24, bottom - top),
  };
}

export const ShopTourOverlay: React.FC<ShopTourOverlayProps> = ({
  onComplete,
  onSkip,
}) => {
  const { bi } = useLanguage();
  const [stepIdx, setStepIdx] = useState(0);
  const [rect, setRect] = useState<RectBox | null>(null);
  const [viewport, setViewport] = useState(() => ({
    w: typeof window !== 'undefined' ? window.innerWidth : 960,
    h: typeof window !== 'undefined' ? window.innerHeight : 540,
  }));

  const steps: TourStepDef[] = useMemo(
    () => [
      {
        id: 'inspect',
        targets: ['tour-inspect'],
        placement: 'side',
        icon: <Search className="w-4 h-4 text-amber-300 shrink-0" />,
        titleTr: '1. Elle Ekspertiz & Kusur Avı',
        titleEn: '1. Hands-On Inspection',
        bodyTr:
          'Müşterinin getirdiği telefonu önce "Elle Ekspertiz" ile incele. Gizli ekran, pil, sıvı veya IMEI kusuru yakalarsan koz kazanıp fiyatı kırarsın.',
        bodyEn:
          'Inspect incoming phones with "Hands-On Bench" first. Exposing hidden screen, battery, liquid, or IMEI faults gives you leverage to slash the price.',
        tipTr: 'İpucu: Kusurları ortaya çıkarmadan yüksek teklif verme!',
        tipEn: 'Tip: Never pay top price before checking hidden defects!',
      },
      {
        id: 'negotiate',
        targets: ['tour-negotiate'],
        placement: 'side',
        icon: <Handshake className="w-4 h-4 text-emerald-300 shrink-0" />,
        titleTr: '2. Esnaf Pazarlığı & Çay İkramı',
        titleEn: '2. Haggling & Tea Hospitality',
        bodyTr:
          'İnatçı müşterileri çay ikramıyla yumuşat, pazarlık tonunu seç ve teklifini belirleyerek kârlı anlaşmayı kapat.',
        bodyEn:
          'Serve hot Turkish tea to calm tough customers, choose your negotiation tone, and adjust your offer to seal profitable deals.',
        tipTr: 'İpucu: Sabır barı bitmeden anlaşmaya çalış!',
        tipEn: 'Tip: Close the deal before customer patience runs out!',
      },
      {
        id: 'workshop',
        targets: ['tour-tab-workshop'],
        placement: 'below',
        icon: <Wrench className="w-4 h-4 text-sky-300 shrink-0" />,
        titleTr: '3. Atölye: Tamir Et & Vitrine Koy',
        titleEn: '3. Workshop: Repair & Showcase',
        bodyTr:
          'Aldığın kusurlu telefonları Atölye sekmesinde tamir et, kâr marjını belirleyip satış vitrinine çıkar.',
        bodyEn:
          'Fix damaged phones you bought in the Workshop tab, set your asking price, and list them on your showcase.',
        tipTr: 'İpucu: Tamir edilen telefonlar çok daha yüksek kârla satılır.',
        tipEn: 'Tip: Repaired phones sell for much higher profit margins.',
      },
      {
        id: 'market',
        targets: ['tour-tab-wholesale', 'tour-tab-empire'],
        placement: 'below',
        icon: <Building2 className="w-4 h-4 text-amber-300 shrink-0" />,
        titleTr: '4. Toptan & Piyasa İmparatorluğu',
        titleEn: '4. Supply & Market Empire',
        bodyTr:
          'Toptan sekmesinden aksesuar ve yedek parça çek; Piyasa sekmesinde sarı ilanları kovala, gümrük ihalelerine gir, şube ve müze aç.',
        bodyEn:
          'Stock accessories and spare parts in Supply; hunt classifieds, bid in customs auctions, and open branches & a museum in Market.',
        tipTr: 'İpucu: Pazar günleri Piyasa sekmesinde Esnaf Kermesi kurulur!',
        tipEn: 'Tip: Watch for the Sunday Arcade Fair in the Market tab!',
      },
      {
        id: 'growth',
        targets: ['tour-tab-missions', 'tour-tab-upgrades'],
        placement: 'below',
        icon: <Sparkles className="w-4 h-4 text-purple-300 shrink-0" />,
        titleTr: '5. Görevler & Dükkan Büyütme',
        titleEn: '5. Quests & Shop Upgrades',
        bodyTr:
          'Görevlerden ekstra nakit ve XP topla; Büyüt sekmesinden ekipman, dekor, çırak/usta ve daha büyük dükkan kademeleri aç!',
        bodyEn:
          'Claim bonus cash and XP from Quests; unlock equipment, decor, staff, and larger shop tiers in the Upgrade tab!',
        tipTr: 'Not: Bu turu istediğin zaman Duraklat menüsünden tekrar açabilirsin.',
        tipEn: 'Note: You can replay this tour anytime from the Pause menu.',
      },
    ],
    []
  );

  const currentStep = steps[stepIdx];

  useEffect(() => {
    const update = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
      setRect(measureCombinedTargets(currentStep.targets));
    };
    update();
    const raf = window.requestAnimationFrame(update);
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, [currentStep]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        soundFX.playClick();
        onSkip();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        soundFX.playClick();
        if (stepIdx < steps.length - 1) {
          setStepIdx((i) => i + 1);
        } else {
          onComplete();
        }
      } else if (e.key === 'ArrowLeft' && stepIdx > 0) {
        soundFX.playClick();
        setStepIdx((i) => i - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stepIdx, steps.length, onComplete, onSkip]);

  // Compute smart viewport-clamped tooltip card position
  const cardWidth = Math.min(285, viewport.w - 20);
  const approxCardHeight = 205;
  let cardLeft = Math.round((viewport.w - cardWidth) / 2);
  let cardTop = Math.max(12, Math.round((viewport.h - approxCardHeight) / 2));

  if (rect) {
    if (currentStep.placement === 'below') {
      const targetCenterX = rect.left + rect.width / 2;
      cardLeft = Math.max(
        12,
        Math.min(viewport.w - cardWidth - 12, Math.round(targetCenterX - cardWidth / 2))
      );
      cardTop = Math.min(
        viewport.h - approxCardHeight - 12,
        Math.max(12, Math.round(rect.top + rect.height + 12))
      );
    } else {
      // Side placement for tall counter columns (place left if room on left, else right)
      const spaceRight = viewport.w - (rect.left + rect.width);
      const spaceLeft = rect.left;
      if (spaceLeft >= cardWidth + 20) {
        cardLeft = Math.max(12, Math.round(rect.left - cardWidth - 14));
      } else if (spaceRight >= cardWidth + 20) {
        cardLeft = Math.min(
          viewport.w - cardWidth - 12,
          Math.round(rect.left + rect.width + 14)
        );
      } else {
        cardLeft = Math.round((viewport.w - cardWidth) / 2);
      }
      const targetCenterY = rect.top + rect.height / 2;
      cardTop = Math.max(
        52,
        Math.min(
          viewport.h - approxCardHeight - 12,
          Math.round(targetCenterY - approxCardHeight / 2)
        )
      );
    }
  }

  const isLast = stepIdx === steps.length - 1;

  return (
    <div
      className="fixed inset-0 z-[60] select-none"
      role="dialog"
      aria-modal="true"
      aria-label={bi('Dükkan Rehberi', 'Shop Tour')}
    >
      {/* Backdrop: either full dim (fallback) or spotlight cutout */}
      {rect ? (
        <div
          aria-hidden="true"
          className="fixed rounded-xl ring-2 ring-amber-400 pointer-events-none transition-all duration-200"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            boxShadow:
              '0 0 0 9999px rgba(7, 11, 17, 0.78), 0 0 26px rgba(251, 191, 36, 0.45)',
          }}
        />
      ) : (
        <div className="fixed inset-0 bg-[#070B11]/80" aria-hidden="true" />
      )}

      {/* Click-blocker layer behind the tooltip card */}
      <div className="fixed inset-0" aria-hidden="true" />

      {/* Floating Tour Card */}
      <div
        className="fixed z-10 max-h-[calc(100dvh-24px)] overflow-y-auto pasaj-scroll rounded-xl border border-amber-400/50 bg-[#151E2B] p-2.5 shadow-[0_18px_40px_rgba(0,0,0,0.85)] transition-all duration-200 flex flex-col gap-1.5"
        style={{
          width: cardWidth,
          left: cardLeft,
          top: cardTop,
        }}
      >
        {/* Top Row: Step Badge + Skip Button */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-amber-300">
            <Compass className="w-3 h-3 shrink-0" />
            <span>
              {bi('Ustanın Dükkan Turu', 'Master Shop Tour')} · {stepIdx + 1}/{steps.length}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              onSkip();
            }}
            className="inline-flex items-center gap-0.5 rounded-md border border-white/12 bg-[#1D2736] px-1.5 py-0.5 text-[9.5px] font-bold text-slate-300 hover:text-white hover:bg-[#273549] cursor-pointer touch-manipulation"
          >
            <span>{bi('Turu Geç', 'Skip')}</span>
            <X className="w-2.5 h-2.5" />
          </button>
        </div>

        {/* Title & Body */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 font-display text-xs font-extrabold text-slate-50 leading-snug">
            {currentStep.icon}
            <span>{bi(currentStep.titleTr, currentStep.titleEn)}</span>
          </div>
          <p className="text-[10px] text-slate-200 leading-snug">
            {bi(currentStep.bodyTr, currentStep.bodyEn)}
          </p>
          <p className="text-[9.5px] text-amber-200/85 font-medium leading-snug">
            {bi(currentStep.tipTr, currentStep.tipEn)}
          </p>
        </div>

        {/* Footer: Progress Dots + Back/Next Controls */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
          <div className="flex items-center gap-1">
            {steps.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                aria-label={`${idx + 1}/${steps.length}`}
                onClick={() => {
                  soundFX.playClick();
                  setStepIdx(idx);
                }}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === stepIdx
                    ? 'w-4 bg-amber-400'
                    : idx < stepIdx
                    ? 'w-1.5 bg-emerald-400/75'
                    : 'w-1.5 bg-white/20'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1">
            {stepIdx > 0 && (
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setStepIdx((i) => Math.max(0, i - 1));
                }}
                className="inline-flex items-center gap-0.5 rounded-lg border border-white/15 bg-[#1D2736] px-2 py-1 text-[10px] font-bold text-slate-200 hover:bg-[#273549] cursor-pointer touch-manipulation"
              >
                <ChevronLeft className="w-3 h-3" />
                <span>{bi('Geri', 'Back')}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                if (isLast) {
                  onComplete();
                } else {
                  setStepIdx((i) => i + 1);
                }
              }}
              className="inline-flex items-center gap-0.5 rounded-lg bg-amber-500 px-2.5 py-1 text-[10px] font-extrabold text-slate-950 hover:bg-amber-400 cursor-pointer touch-manipulation"
            >
              <span>{isLast ? bi('Başla!', 'Start!') : bi('İleri', 'Next')}</span>
              {!isLast && <ChevronRight className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
