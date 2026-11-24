import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Coffee,
  Flame,
  Newspaper,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Truck,
} from 'lucide-react';
import { formatTRY } from '../game/engine';
import {
  DailyMarketEvent,
  DailyQuest,
  FlashWholesaleDeal,
} from '../game/types';

interface MorningNewspaperModalProps {
  day: number;
  news: DailyMarketEvent;
  quests: DailyQuest[];
  shopRank: string;
  flashWholesaleDeal?: FlashWholesaleDeal | null;
  morningNotifications?: string[];
  isMidDayReview?: boolean;
  onClose: () => void;
}

export const MorningNewspaperModal: React.FC<MorningNewspaperModalProps> = ({
  day,
  news,
  quests,
  shopRank,
  flashWholesaleDeal = null,
  morningNotifications = [],
  isMidDayReview = false,
  onClose,
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const effectTone =
    news.kind === 'drop'
      ? 'border-rose-700/35 bg-rose-900/10 text-rose-950'
      : news.kind === 'launch'
      ? 'border-amber-700/45 bg-amber-500/20 text-amber-950'
      : 'border-emerald-800/35 bg-emerald-800/10 text-emerald-950';

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/75 backdrop-blur-[2px] p-2.5 sm:p-4 overflow-y-auto pasaj-scroll">
      <motion.article
        initial={{ opacity: 0, y: 18, scale: 0.95, rotate: -1 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        className="w-full max-w-[660px] my-auto max-h-[86dvh] flex flex-col overflow-hidden rounded-xl border-2 border-[#C8BCA6] bg-[#F4EFE4] text-[#171A1F] shadow-[0_24px_60px_rgba(0,0,0,0.68)]"
      >
        {/* Compact Newspaper Masthead */}
        <header className="px-4 py-2 border-b-2 border-[#171A1F] shrink-0">
          <div className="flex items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-wider text-[#555046] tabular-nums">
            <span>GÜN {day} · İSTANBUL</span>
            <div className="flex items-center gap-1.5">
              <Newspaper className="w-4 h-4 text-[#B45309] shrink-0" />
              <h1 className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-[#14171C]">
                PASAJ POSTASI
              </h1>
              <Coffee className="w-4 h-4 text-[#B45309] shrink-0" />
            </div>
            <span className="font-semibold text-[#171A1F] truncate max-w-[140px]">{shopRank}</span>
          </div>
        </header>

        {/* Compact 2-Column Landscape Front Page */}
        <div className="flex-1 min-h-0 overflow-y-auto pasaj-scroll p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-start">
            {/* LEFT COLUMN: Headline + Market Effect + Flash Deal / Deliveries */}
            <div className="sm:col-span-7 space-y-2.5">
              {morningNotifications.length > 0 && !isMidDayReview && (
                <div className="rounded-lg border border-emerald-800/35 bg-emerald-900/10 px-2.5 py-2 space-y-0.5">
                  <div className="inline-flex items-center gap-1 text-[10px] font-mono font-extrabold text-emerald-900">
                    <Truck className="w-3 h-3" />
                    <span>SABAH TESLİMATLARI</span>
                  </div>
                  {morningNotifications.map((note, idx) => (
                    <div key={idx} className="text-[11px] font-semibold text-[#182920] leading-snug">
                      • {note}
                    </div>
                  ))}
                </div>
              )}

              <div>
                <div className="inline-flex items-center gap-1 text-[10px] font-mono font-bold tracking-wider text-[#B45309] mb-0.5">
                  {news.kind === 'drop' ? (
                    <TrendingDown className="w-3 h-3 text-rose-700" />
                  ) : news.kind === 'launch' ? (
                    <Sparkles className="w-3 h-3 text-amber-700" />
                  ) : (
                    <TrendingUp className="w-3 h-3 text-emerald-700" />
                  )}
                  <span>{news.kicker}</span>
                </div>

                <h2 className="font-display text-base sm:text-lg font-extrabold leading-tight text-[#12151A]">
                  {news.headline}
                </h2>
                <p className="mt-0.5 text-xs font-semibold text-[#3C3831] leading-snug">
                  {news.subheadline}
                </p>
              </div>

              <p className="text-[11.5px] leading-snug text-[#252830]">
                {news.description}
              </p>

              <div className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-bold ${effectTone}`}>
                Piyasa Etkisi: {news.effectSummary}
              </div>

              {flashWholesaleDeal && (
                <div className="rounded-lg border border-rose-800/45 bg-rose-900/12 px-2.5 py-2">
                  <div className="flex items-center justify-between gap-2 text-[10px] font-mono font-extrabold text-rose-900">
                    <span className="inline-flex items-center gap-1">
                      <Flame className="w-3 h-3 text-rose-700" />
                      <span>{flashWholesaleDeal.brand.toUpperCase()} -%{flashWholesaleDeal.discountPct}</span>
                    </span>
                    <span>
                      {flashWholesaleDeal.expired || flashWholesaleDeal.remainingStock <= 0
                        ? 'TÜKENDİ'
                        : `${flashWholesaleDeal.remainingStock}/${flashWholesaleDeal.initialStock} ADET`}
                    </span>
                  </div>
                  <div className="text-[11.5px] font-extrabold text-[#171A1F] leading-snug mt-0.5">
                    {flashWholesaleDeal.headline}
                  </div>
                </div>
              )}

              <div className="border-t border-[#171A1F]/15 pt-2 flex items-start justify-between gap-2">
                <p className="text-[10.5px] italic leading-snug text-[#464138]">
                  “{news.gossipNote}”
                </p>
                {news.launchedModels && news.launchedModels.length > 0 && (
                  <span className="shrink-0 rounded bg-[#9A3412]/15 px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-[#9A3412]">
                    YENİ: {news.launchedModels[0]}
                  </span>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Compact Daily Quests + Action CTA */}
            <aside className="sm:col-span-5 sm:border-l sm:border-[#171A1F]/15 sm:pl-3.5 flex flex-col justify-between gap-2.5">
              <div>
                <div className="flex items-center gap-1 text-[10px] font-mono font-bold tracking-wider text-[#555046] mb-1.5">
                  <Target className="w-3 h-3 text-[#B45309]" />
                  <span>GÜNÜN GÖREVLERİ</span>
                </div>
                <div className="space-y-1.5">
                  {quests.map((q) => (
                    <div
                      key={q.id}
                      className={`rounded-lg border px-2.5 py-1.5 text-[11px] ${
                        q.claimed
                          ? 'border-emerald-700/40 bg-emerald-800/10 text-emerald-950'
                          : q.progress >= q.target
                          ? 'border-amber-700/50 bg-amber-500/20 text-[#171A1F]'
                          : 'border-[#171A1F]/18 bg-white/60 text-[#171A1F]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-bold truncate">{q.title}</span>
                        {q.claimed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                        ) : (
                          <span className="font-mono text-[10px] font-bold text-[#B45309] shrink-0 tabular-nums">
                            +{formatTRY(q.reward)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2 text-[10px] text-[#4C473E] mt-0.5 tabular-nums">
                        <span className="truncate">{q.description}</span>
                        <span className="font-mono font-semibold shrink-0">
                          {q.progress}/{q.target}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-lg bg-[#171A1F] px-4 py-2.5 text-xs font-extrabold text-[#F6F1E7] hover:bg-[#262B34] active:scale-[0.99] transition-all cursor-pointer whitespace-nowrap"
              >
                {isMidDayReview
                  ? 'Gazeteyi Katla & Dön'
                  : `Kepenkleri Aç · Gün ${day}`}
              </button>
            </aside>
          </div>
        </div>
      </motion.article>
    </div>
  );
};
