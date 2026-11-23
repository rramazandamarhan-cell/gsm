import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Coffee, Newspaper, Sparkles, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { formatTRY } from '../game/engine';
import { DailyMarketEvent, DailyQuest } from '../game/types';

interface MorningNewspaperModalProps {
  day: number;
  news: DailyMarketEvent;
  quests: DailyQuest[];
  shopRank: string;
  isMidDayReview?: boolean;
  onClose: () => void;
}

export const MorningNewspaperModal: React.FC<MorningNewspaperModalProps> = ({
  day,
  news,
  quests,
  shopRank,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/78 p-4 overflow-y-auto">
      <motion.article
        initial={{ opacity: 0, y: 26, scale: 0.94, rotate: -1.8 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 360, damping: 26 }}
        className="w-full max-w-2xl rounded-xl border-2 border-[#C8BCA6] bg-[#F4EFE4] text-[#171A1F] shadow-[0_28px_70px_rgba(0,0,0,0.65)] overflow-hidden"
      >
        {/* Newspaper Masthead */}
        <header className="px-6 pt-5 pb-3 border-b-2 border-[#171A1F]">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#555046] border-b border-[#171A1F]/20 pb-2 mb-2.5 tabular-nums">
            <span>GÜN {day} BASKISI · İSTANBUL</span>
            <span className="font-semibold text-[#171A1F]">{shopRank}</span>
            <span>FİYATI: 1 İNCE BELLİ ÇAY</span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Newspaper className="w-6 h-6 text-[#B45309] shrink-0" />
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#14171C]">
              PASAJ POSTASI
            </h1>
            <Coffee className="w-6 h-6 text-[#B45309] shrink-0" />
          </div>
          <p className="text-center text-[11px] font-medium tracking-[0.2em] text-[#555046] mt-1">
            GÜNLÜK TEKNOLOJİ, PİYASA VE ESNAF GAZETESİ
          </p>
        </header>

        {/* Main Front Page Body */}
        <div className="p-6">
          {/* Kicker & Giant Headline */}
          <div className="mb-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold tracking-wider text-[#B45309] mb-1">
              {news.kind === 'drop' ? (
                <TrendingDown className="w-3.5 h-3.5 text-rose-700" />
              ) : news.kind === 'launch' ? (
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              ) : (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
              )}
              <span>{news.kicker}</span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-extrabold leading-[1.15] text-[#12151A]">
              {news.headline}
            </h2>
            <p className="mt-1.5 text-sm sm:text-base font-semibold text-[#3C3831]">
              {news.subheadline}
            </p>
          </div>

          {/* 2-Column Editorial Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 border-y border-[#171A1F]/18 py-4 mb-5">
            <div className="md:col-span-7 space-y-3">
              <p className="text-sm leading-relaxed text-[#252830]">
                {news.description}
              </p>

              {/* Explicit Mechanical Market Impact Box */}
              <div className={`rounded-lg border px-3.5 py-2.5 text-xs font-bold ${effectTone}`}>
                Piyasa Etkisi: {news.effectSummary}
              </div>
            </div>

            {/* Pasajdan Kulisler Side Column */}
            <aside className="md:col-span-5 md:border-l md:border-[#171A1F]/15 md:pl-4 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-mono font-bold tracking-wider text-[#6A5F4D] mb-1.5">
                  PASAJDAN KULİSLER
                </div>
                <p className="text-xs italic leading-relaxed text-[#36322B]">
                  {news.gossipNote}
                </p>
              </div>

              {news.launchedModels && news.launchedModels.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-[#171A1F]/15 text-xs">
                  <div className="font-mono text-[10px] font-bold text-[#9A3412] mb-0.5">
                    YENİ AÇILAN MODELLER
                  </div>
                  <div className="font-bold text-[#14171C]">
                    {news.launchedModels.join(' · ')}
                  </div>
                </div>
              )}
            </aside>
          </div>

          {/* Daily Esnaf Quests Strip */}
          <div className="mb-5">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold tracking-wider text-[#555046] mb-2">
              <Target className="w-3.5 h-3.5 text-[#B45309]" />
              <span>GÜNÜN ESNAF GÖREVLERİ (NAKİT + XP ÖDÜLÜ)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {quests.map((q) => (
                <div
                  key={q.id}
                  className={`flex flex-col justify-between gap-2 rounded-lg border px-3 py-2.5 text-xs ${
                    q.claimed
                      ? 'border-emerald-700/40 bg-emerald-800/10 text-emerald-950'
                      : q.progress >= q.target
                      ? 'border-amber-700/50 bg-amber-500/20 text-[#171A1F]'
                      : 'border-[#171A1F]/18 bg-white/55 text-[#171A1F]'
                  }`}
                >
                  <div>
                    <div className="font-bold leading-snug">{q.title}</div>
                    <div className="text-[11px] text-[#4C473E] leading-snug mt-0.5">
                      {q.description}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1.5 border-t border-[#171A1F]/10 font-mono text-[11px] tabular-nums">
                    <span className="text-[#575248]">
                      {q.progress}/{q.target}
                    </span>
                    {q.claimed ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Alındı
                      </span>
                    ) : (
                      <span className="font-bold text-[#B45309]">
                        +{formatTRY(q.reward)} · +{q.xpReward} XP
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action CTA */}
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-[#171A1F] px-6 py-3.5 text-sm font-bold text-[#F6F1E7] hover:bg-[#262B34] active:scale-[0.99] transition-all cursor-pointer whitespace-nowrap"
          >
            {isMidDayReview
              ? 'Gazeteyi Katla & Tezgaha Dön'
              : `Kepenkleri Aç — Gün ${day} Başlasın (Enter)`}
          </button>
        </div>
      </motion.article>
    </div>
  );
};
