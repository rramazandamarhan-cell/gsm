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
import { getLocalizedNews, getLocalizedQuest, useLanguage } from '../game/i18n';
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
  const { lang, bi } = useLanguage();
  const locNews = getLocalizedNews(news, lang);

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
    locNews.kind === 'drop'
      ? 'border-rose-700/35 bg-rose-900/10 text-rose-950'
      : locNews.kind === 'launch'
      ? 'border-amber-700/45 bg-amber-500/20 text-amber-950'
      : 'border-emerald-800/35 bg-emerald-800/10 text-emerald-950';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-[2px] p-2">
      <motion.article
        initial={{ opacity: 0, y: 14, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        className="w-full max-w-[660px] max-h-[94dvh] flex flex-col overflow-hidden rounded-xl border-2 border-[#C8BCA6] bg-[#F4EFE4] text-[#171A1F] shadow-[0_24px_60px_rgba(0,0,0,0.68)]"
      >
        {/* Compact Newspaper Masthead */}
        <header className="px-3 py-1.5 border-b-2 border-[#171A1F] shrink-0">
          <div className="flex items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-wider text-[#555046] tabular-nums">
            <span>{bi(`GÜN ${day} · İSTANBUL`, `DAY ${day} · ARCADE`)}</span>
            <div className="flex items-center gap-1.5">
              <Newspaper className="w-3.5 h-3.5 text-[#B45309] shrink-0" />
              <h1 className="font-display text-base sm:text-lg font-extrabold tracking-tight text-[#14171C]">
                {bi('PASAJ POSTASI', 'ARCADE GAZETTE')}
              </h1>
              <Coffee className="w-3.5 h-3.5 text-[#B45309] shrink-0" />
            </div>
            <span className="font-semibold text-[#171A1F] truncate max-w-[140px]">
              {shopRank}
            </span>
          </div>
        </header>

        {/* Zero-Scroll 2-Column Landscape Front Page */}
        <div className="flex-1 min-h-0 overflow-hidden p-2.5 sm:p-3">
          <div className="grid grid-cols-12 gap-3 h-full items-stretch">
            {/* LEFT COLUMN: Headline + Market Effect + Flash Deal / Deliveries */}
            <div className="col-span-7 flex flex-col justify-between gap-1.5 min-h-0">
              <div className="space-y-1.5">
                {morningNotifications.length > 0 && !isMidDayReview && (
                  <div className="rounded-lg border border-emerald-800/35 bg-emerald-900/10 px-2 py-1 space-y-0.5">
                    <div className="inline-flex items-center gap-1 text-[9.5px] font-mono font-extrabold text-emerald-900">
                      <Truck className="w-3 h-3" />
                      <span>{bi('SABAH TESLİMATLARI', 'MORNING DELIVERIES')}</span>
                    </div>
                    {morningNotifications.slice(0, 2).map((note, idx) => (
                      <div
                        key={idx}
                        className="text-[10px] font-semibold text-[#182920] leading-tight truncate"
                      >
                        • {note}
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <div className="inline-flex items-center gap-1 text-[9.5px] font-mono font-bold tracking-wider text-[#B45309]">
                    {locNews.kind === 'drop' ? (
                      <TrendingDown className="w-3 h-3 text-rose-700" />
                    ) : locNews.kind === 'launch' ? (
                      <Sparkles className="w-3 h-3 text-amber-700" />
                    ) : (
                      <TrendingUp className="w-3 h-3 text-emerald-700" />
                    )}
                    <span>{locNews.kicker}</span>
                  </div>

                  <h2 className="font-display text-sm sm:text-base font-extrabold leading-tight text-[#12151A]">
                    {locNews.headline}
                  </h2>
                  <p className="mt-0.5 text-[11px] font-semibold text-[#3C3831] leading-snug line-clamp-1">
                    {locNews.subheadline}
                  </p>
                </div>

                <p className="text-[10.5px] leading-snug text-[#252830] line-clamp-2">
                  {locNews.description}
                </p>

                <div className={`rounded-lg border px-2 py-1 text-[10.5px] font-bold ${effectTone}`}>
                  {bi('Piyasa Etkisi', 'Market Effect')}: {locNews.effectSummary}
                </div>

                {flashWholesaleDeal && (
                  <div className="rounded-lg border border-rose-800/45 bg-rose-900/12 px-2 py-1.5">
                    <div className="flex items-center justify-between gap-2 text-[9.5px] font-mono font-extrabold text-rose-900">
                      <span className="inline-flex items-center gap-1">
                        <Flame className="w-3 h-3 text-rose-700" />
                        <span>
                          {flashWholesaleDeal.brand.toUpperCase()} -%{flashWholesaleDeal.discountPct}
                        </span>
                      </span>
                      <span>
                        {flashWholesaleDeal.expired || flashWholesaleDeal.remainingStock <= 0
                          ? bi('TÜKENDİ', 'SOLD OUT')
                          : `${flashWholesaleDeal.remainingStock}/${flashWholesaleDeal.initialStock} ${bi('ADET', 'LEFT')}`}
                      </span>
                    </div>
                    <div className="text-[10.5px] font-extrabold text-[#171A1F] leading-tight truncate mt-0.5">
                      {bi(
                        flashWholesaleDeal.headline,
                        `${flashWholesaleDeal.brand} flash wholesale drop! Grab stock before rivals.`
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-[#171A1F]/15 pt-1.5 flex items-center justify-between gap-2">
                <p className="text-[10px] italic leading-tight text-[#464138] line-clamp-1">
                  “{locNews.gossipNote}”
                </p>
                {locNews.launchedModels && locNews.launchedModels.length > 0 && (
                  <span className="shrink-0 rounded bg-[#9A3412]/15 px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#9A3412]">
                    {bi('YENİ', 'NEW')}: {locNews.launchedModels[0]}
                  </span>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Compact Daily Quests + Action CTA */}
            <aside className="col-span-5 border-l border-[#171A1F]/15 pl-3 flex flex-col justify-between gap-2 min-h-0">
              <div>
                <div className="flex items-center gap-1 text-[9.5px] font-mono font-bold tracking-wider text-[#555046] mb-1">
                  <Target className="w-3 h-3 text-[#B45309]" />
                  <span>{bi('GÜNÜN GÖREVLERİ', 'DAILY QUESTS')}</span>
                </div>
                <div className="space-y-1">
                  {quests.slice(0, 3).map((q) => {
                    const lq = getLocalizedQuest(q, lang);
                    return (
                      <div
                        key={q.id}
                        className={`rounded-lg border px-2 py-1 text-[10.5px] ${
                          q.claimed
                            ? 'border-emerald-700/40 bg-emerald-800/10 text-emerald-950'
                            : q.progress >= q.target
                            ? 'border-amber-700/50 bg-amber-500/20 text-[#171A1F]'
                            : 'border-[#171A1F]/18 bg-white/60 text-[#171A1F]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold truncate">{lq.title}</span>
                          {q.claimed ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-800 shrink-0" />
                          ) : (
                            <span className="font-mono text-[9.5px] font-bold text-[#B45309] shrink-0 tabular-nums">
                              +{formatTRY(q.reward)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-1 text-[9.5px] text-[#4C473E] tabular-nums">
                          <span className="truncate">{lq.description}</span>
                          <span className="font-mono font-semibold shrink-0">
                            {q.progress}/{q.target}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-lg bg-[#171A1F] px-3 py-2 text-xs font-extrabold text-[#F6F1E7] hover:bg-[#262B34] active:scale-[0.99] transition-all cursor-pointer whitespace-nowrap"
              >
                {isMidDayReview
                  ? bi('Gazeteyi Katla & Dön', 'Fold Paper & Return')
                  : bi(`Kepenkleri Aç · Gün ${day}`, `Open Shutters · Day ${day}`)}
              </button>
            </aside>
          </div>
        </div>
      </motion.article>
    </div>
  );
};
