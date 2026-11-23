import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Flame,
  Gift,
  Lock,
  MessageSquare,
  Smartphone,
  Sparkles,
  Star,
  Target,
  Trophy,
} from 'lucide-react';
import {
  CAREER_MILESTONES,
  DAILY_STREAK_REWARDS,
  LEGACY_PATHS,
  LEVEL_PERKS,
  PHONE_CATALOG,
  STORY_CHAPTERS,
} from '../game/catalog';
import {
  formatTRY,
  getLevelProgress,
  getMilestoneCurrentValue,
  getShopRank,
  getStoryChapterCurrentValue,
  getStreakBonusCash,
} from '../game/engine';
import { ShopState } from '../game/types';

interface MissionsViewProps {
  shop: ShopState;
  onClaimDailyQuest: (questId: string) => void;
  onClaimMilestone: (milestoneId: string) => void;
  onClaimStoryChapter: (chapterId: string) => void;
  onClaimDailyStreak: () => void;
  onBackToCounter: () => void;
}

type MissionsSubTab = 'STORY' | 'DAILY' | 'MILESTONES' | 'COLLECTION';

export const MissionsView: React.FC<MissionsViewProps> = ({
  shop,
  onClaimDailyQuest,
  onClaimMilestone,
  onClaimStoryChapter,
  onClaimDailyStreak,
  onBackToCounter,
}) => {
  const readyStoryCount = STORY_CHAPTERS.filter(
    (ch) =>
      !shop.claimedChapterIds.includes(ch.id) &&
      getStoryChapterCurrentValue(shop, ch) >= ch.target
  ).length;
  const readyDailyCount = shop.dailyQuests.filter(
    (q) => !q.claimed && q.progress >= q.target
  ).length;
  const readyMilestoneCount = CAREER_MILESTONES.filter(
    (m) =>
      !shop.claimedMilestoneIds.includes(m.id) &&
      getMilestoneCurrentValue(shop, m) >= m.target
  ).length;

  const [subTab, setSubTab] = useState<MissionsSubTab>(
    readyDailyCount > 0 ? 'DAILY' : 'STORY'
  );
  const lvlInfo = getLevelProgress(shop.xp);
  const rank = getShopRank(shop);
  const currentStreakBonus = getStreakBonusCash(shop.dealStreak, shop.level);
  const legacyInfo = LEGACY_PATHS[shop.legacyPath];

  return (
    <div className="flex-1 min-h-0 overflow-y-auto pasaj-scroll p-6">
      <div className="max-w-6xl mx-auto">
        {/* Top Career & Level Progression Banner */}
        <div className="rounded-2xl border border-white/10 bg-[#161F2B] p-5 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-amber-400">
                <Award className="w-4 h-4" />
                <span>MİRAS: {legacyInfo.name.toUpperCase()} ({legacyInfo.title})</span>
                <span aria-hidden="true" className="text-white/25">·</span>
                <span className="text-slate-300">{rank}</span>
              </div>
              <h1 className="font-display text-2xl font-extrabold text-slate-50 mt-0.5 tabular-nums">
                Seviye {lvlInfo.level} Esnaf
              </h1>
              <p className="text-xs text-emerald-300/90 mt-1">
                {legacyInfo.passiveTitle} · Özel Diyalog: {legacyInfo.dialogueName}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-5 tabular-nums">
              <div className="text-right">
                <div className="text-[11px] text-slate-400">Aktif Anlaşma Serisi</div>
                <div className="inline-flex items-center gap-1.5 font-mono text-lg font-extrabold text-amber-400">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span>{shop.dealStreak} Seri</span>
                  {currentStreakBonus > 0 && (
                    <span className="text-xs font-semibold text-emerald-400">
                      (+{formatTRY(currentStreakBonus)}/anlaşma)
                    </span>
                  )}
                </div>
              </div>

              <div className="h-9 w-px bg-white/10 hidden sm:block" />

              <div className="text-right">
                <div className="text-[11px] text-slate-400">Model Koleksiyonu</div>
                <div className="font-mono text-lg font-extrabold text-slate-100">
                  {shop.discoveredSpecIds.length} / {PHONE_CATALOG.length}
                </div>
              </div>

              <button
                type="button"
                onClick={onBackToCounter}
                className="rounded-xl border border-white/12 bg-[#202B3A] px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-[#2A374A] transition-colors cursor-pointer whitespace-nowrap"
              >
                Tezgaha Dön
              </button>
            </div>
          </div>

          {/* Balanced Long-Term XP Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5 tabular-nums">
              <span className="text-slate-300 font-medium">
                {lvlInfo.level >= 10
                  ? 'Zirve Seviye (10/10) — GSM Duayeni'
                  : `Sonraki Seviye İlerlemesi (Sv. ${lvlInfo.level + 1})`}
              </span>
              <span className="font-mono text-amber-300 font-semibold">
                {lvlInfo.currentInLevel} / {lvlInfo.neededForNext} XP (%{lvlInfo.percent})
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${lvlInfo.percent}%` }}
              />
            </div>
          </div>

          {/* 7-Day Daily Login Streak Reward Bar */}
          <div className="mb-4 rounded-xl border border-amber-500/25 bg-[#121924] p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Gift className="w-4 h-4" />
                <span>Günlük Giriş Serisi ({shop.loginStreak}/7 Gün)</span>
              </div>
              {!shop.dailyStreakClaimed ? (
                <button
                  type="button"
                  onClick={onClaimDailyStreak}
                  className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-extrabold text-slate-950 hover:bg-emerald-400 cursor-pointer tabular-nums"
                >
                  Bugünün Ödülünü Al (+
                  {formatTRY(
                    DAILY_STREAK_REWARDS[Math.min(6, Math.max(0, shop.loginStreak - 1))].cash
                  )}
                  )
                </button>
              ) : (
                <span className="text-[11px] font-semibold text-emerald-400">
                  Bugünkü giriş ödülü kasaya eklendi
                </span>
              )}
            </div>
            <div className="grid grid-cols-7 gap-1.5 tabular-nums">
              {DAILY_STREAK_REWARDS.map((r) => {
                const isPast = r.day < shop.loginStreak;
                const isToday = r.day === shop.loginStreak;
                return (
                  <div
                    key={r.day}
                    className={`rounded-lg border px-1.5 py-2 text-center ${
                      isToday
                        ? 'border-amber-400 bg-amber-500/15 text-amber-200'
                        : isPast
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                        : 'border-white/8 bg-[#0E141D] text-slate-500'
                    }`}
                  >
                    <div className="text-[10px] font-bold">G{r.day}</div>
                    <div className="font-mono text-[10.5px] font-extrabold mt-0.5">
                      {(r.cash / 1000).toFixed(1)}K
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 10-Level Perks Grid (2 rows of 5 on desktop) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {LEVEL_PERKS.map((perk) => {
              const unlocked = shop.level >= perk.level;
              const isNext = perk.level === shop.level + 1;
              return (
                <div
                  key={perk.level}
                  className={`rounded-xl border p-2.5 text-xs ${
                    unlocked
                      ? 'border-emerald-500/35 bg-emerald-500/8 text-slate-100'
                      : isNext
                      ? 'border-amber-400/35 bg-amber-500/8 text-slate-200'
                      : 'border-white/8 bg-[#121822] text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[11px] font-bold text-amber-400">
                      Sv. {perk.level}
                    </span>
                    {unlocked ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Lock className="w-3 h-3 text-slate-500" />
                    )}
                  </div>
                  <div className="font-semibold leading-snug text-[11.5px] mb-0.5">
                    {perk.title}
                  </div>
                  <div className="text-[10.5px] text-slate-400 leading-snug">
                    {perk.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <button
            type="button"
            onClick={() => setSubTab('STORY')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              subTab === 'STORY'
                ? 'bg-amber-500 text-slate-950'
                : 'border border-white/10 bg-[#17202C] text-slate-300 hover:text-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>
              Hikaye Bölümleri ({shop.claimedChapterIds.length}/{STORY_CHAPTERS.length})
            </span>
            {readyStoryCount > 0 && (
              <span className="font-mono font-extrabold text-emerald-950 bg-emerald-400 rounded px-1.5 py-0.5 text-[10px]">
                +{readyStoryCount} Hazır
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSubTab('DAILY')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              subTab === 'DAILY'
                ? 'bg-amber-500 text-slate-950'
                : 'border border-white/10 bg-[#17202C] text-slate-300 hover:text-slate-50'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>
              Günlük Görevler ({shop.dailyQuests.filter((q) => q.claimed).length}/
              {shop.dailyQuests.length})
            </span>
            {readyDailyCount > 0 && (
              <span className="font-mono font-extrabold text-emerald-950 bg-emerald-400 rounded px-1.5 py-0.5 text-[10px]">
                +{readyDailyCount} Hazır
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSubTab('MILESTONES')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              subTab === 'MILESTONES'
                ? 'bg-amber-500 text-slate-950'
                : 'border border-white/10 bg-[#17202C] text-slate-300 hover:text-slate-50'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>
              Kariyer Hedefleri ({shop.claimedMilestoneIds.length}/
              {CAREER_MILESTONES.length})
            </span>
            {readyMilestoneCount > 0 && (
              <span className="font-mono font-extrabold text-emerald-950 bg-emerald-400 rounded px-1.5 py-0.5 text-[10px]">
                +{readyMilestoneCount} Hazır
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSubTab('COLLECTION')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              subTab === 'COLLECTION'
                ? 'bg-amber-500 text-slate-950'
                : 'border border-white/10 bg-[#17202C] text-slate-300 hover:text-slate-50'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>
              Cihaz Koleksiyonu ({shop.discoveredSpecIds.length}/{PHONE_CATALOG.length})
            </span>
          </button>
        </div>

        {/* TAB 0: 5-CHAPTER CAREER STORY (23-YEAR-OLD APPRENTICE TO EMPIRE) */}
        {subTab === 'STORY' && (
          <div className="space-y-4">
            {STORY_CHAPTERS.map((ch) => {
              const currentVal = getStoryChapterCurrentValue(shop, ch);
              const clamped = Math.min(ch.target, currentVal);
              const pct = Math.min(100, Math.round((clamped / ch.target) * 100));
              const claimed = shop.claimedChapterIds.includes(ch.id);
              const ready = !claimed && currentVal >= ch.target;

              return (
                <article
                  key={ch.id}
                  className={`rounded-2xl border p-5 ${
                    ready
                      ? 'border-emerald-400/55 bg-emerald-500/8'
                      : claimed
                      ? 'border-white/8 bg-[#131A24] opacity-80'
                      : 'border-white/10 bg-[#161F2B]'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="text-xs font-mono font-bold text-amber-400 mb-0.5">
                        0{ch.chapterNumber}. HİKAYE BÖLÜMÜ · {ch.subtitle}
                      </div>
                      <h2 className="font-display text-xl font-extrabold text-slate-50">
                        {ch.title}
                      </h2>
                    </div>
                    <div className="font-mono text-xs font-bold text-emerald-400 tabular-nums shrink-0">
                      +{formatTRY(ch.rewardCash)} · +{ch.rewardXp} XP
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-3">
                    {ch.narrative}
                  </p>

                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/6 px-3.5 py-2.5 text-xs text-amber-100 italic mb-4">
                    {ch.mentorNote}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs mb-1.5 tabular-nums">
                        <span className="text-slate-300 font-medium">
                          Hedef: {ch.objectiveText}
                        </span>
                        <span className="font-mono font-bold text-amber-300 ml-3 shrink-0">
                          {clamped} / {ch.target}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            claimed || ready ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="shrink-0">
                      {claimed ? (
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Bölüm Tamamlandı</span>
                        </span>
                      ) : ready ? (
                        <button
                          type="button"
                          onClick={() => onClaimStoryChapter(ch.id)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-emerald-400 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <Gift className="w-4 h-4" />
                          <span>Bölüm Ödülünü Al (+{formatTRY(ch.rewardCash)})</span>
                        </button>
                      ) : (
                        <span className="text-xs font-mono text-slate-400 tabular-nums">
                          %{pct} Tamamlandı
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}

            {/* LIVE CUSTOMER REVIEWS FEED */}
            <div className="rounded-2xl border border-white/10 bg-[#161F2B] p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  <h3 className="font-display text-base font-bold text-slate-50">
                    Müşteri Değerlendirmeleri & Semt Yorumları
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-amber-400 tabular-nums">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{shop.reputation.toFixed(1)} / 5.0</span>
                </span>
              </div>

              {shop.reviews.length === 0 ? (
                <p className="text-xs text-slate-400">
                  Henüz yorum bırakılmadı. Tezgahta müşterilerin ruh halini yüksek tutup el sıkıştıkça 5 yıldızlı yorumlar burada birikir!
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {shop.reviews.slice(0, 6).map((rev) => (
                    <div
                      key={rev.id}
                      className="rounded-xl border border-white/8 bg-[#101720] p-3.5 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-100">
                          {rev.customerName}
                          <span className="text-slate-500 font-normal ml-1.5">
                            · Gün {rev.day}
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-amber-400 font-mono font-bold">
                          {'★'.repeat(rev.rating)}
                          <span className="text-slate-600">{'★'.repeat(5 - rev.rating)}</span>
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">“{rev.comment}”</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 1: DAILY QUESTS */}
        {subTab === 'DAILY' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {shop.dailyQuests.map((q) => {
              const pct = Math.min(100, Math.round((q.progress / q.target) * 100));
              const isReady = !q.claimed && q.progress >= q.target;

              return (
                <article
                  key={q.id}
                  className={`rounded-2xl border p-5 flex flex-col justify-between transition-colors ${
                    isReady
                      ? 'border-emerald-400/55 bg-emerald-500/8'
                      : q.claimed
                      ? 'border-white/8 bg-[#131A24] opacity-75'
                      : 'border-white/10 bg-[#161F2B]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2 tabular-nums">
                      <span className="font-semibold text-amber-400">
                        Gün {shop.day} Görevi
                      </span>
                      <span className="font-mono font-bold text-slate-200">
                        {q.progress} / {q.target}
                      </span>
                    </div>

                    <h3 className="font-display text-lg font-bold text-slate-50 mb-1.5">
                      {q.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      {q.description}
                    </p>

                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden mb-4">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          q.claimed || isReady ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-3 tabular-nums">
                      <span className="text-slate-400">Ödül Paketi</span>
                      <span className="font-mono font-bold text-emerald-400">
                        +{formatTRY(q.reward)} · +{q.xpReward} XP
                      </span>
                    </div>

                    {q.claimed ? (
                      <div className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 py-2.5 text-xs font-semibold text-emerald-300">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Ödül Kasaya Alındı</span>
                      </div>
                    ) : isReady ? (
                      <button
                        type="button"
                        onClick={() => onClaimDailyQuest(q.id)}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-extrabold text-slate-950 hover:bg-emerald-400 transition-colors cursor-pointer"
                      >
                        <Gift className="w-4 h-4" />
                        <span>Ödülü Topla (+{formatTRY(q.reward)})</span>
                      </button>
                    ) : (
                      <div className="w-full text-center rounded-xl border border-white/8 bg-[#121822] py-2.5 text-xs text-slate-400">
                        Devam Ediyor (%{pct})
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* TAB 2: CAREER MILESTONES */}
        {subTab === 'MILESTONES' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CAREER_MILESTONES.map((ms) => {
              const val = getMilestoneCurrentValue(shop, ms);
              const clamped = Math.min(ms.target, val);
              const pct = Math.min(100, Math.round((clamped / ms.target) * 100));
              const claimed = shop.claimedMilestoneIds.includes(ms.id);
              const ready = !claimed && val >= ms.target;

              return (
                <article
                  key={ms.id}
                  className={`rounded-2xl border p-5 flex flex-col justify-between ${
                    ready
                      ? 'border-amber-400/60 bg-amber-500/10'
                      : claimed
                      ? 'border-white/8 bg-[#131A24] opacity-75'
                      : 'border-white/10 bg-[#161F2B]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <h3 className="font-display text-lg font-bold text-slate-50">
                        {ms.title}
                      </h3>
                      <span className="font-mono text-xs font-bold text-amber-300 whitespace-nowrap shrink-0 tabular-nums">
                        +{formatTRY(ms.rewardCash)} · +{ms.rewardXp} XP
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mb-3.5">
                      {ms.description}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5 tabular-nums">
                      <span className="text-slate-400">Kariyer İlerlemesi</span>
                      <span className="font-mono font-semibold text-slate-100">
                        {ms.metric === 'totalProfitEarned'
                          ? `${formatTRY(clamped)} / ${formatTRY(ms.target)}`
                          : `${clamped} / ${ms.target}`}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden mb-3.5">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          claimed || ready ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {claimed ? (
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Kilometre Taşı Tamamlandı</span>
                      </div>
                    ) : ready ? (
                      <button
                        type="button"
                        onClick={() => onClaimMilestone(ms.id)}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Kariyer Ödülünü Al (+{formatTRY(ms.rewardCash)})</span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500">
                        Hedefe ulaşmak için dükkanı büyütmeye devam et
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* TAB 3: PHONE COLLECTION ENCYCLOPEDIA */}
        {subTab === 'COLLECTION' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PHONE_CATALOG.map((spec) => {
              const discovered = shop.discoveredSpecIds.includes(spec.id);
              const unlockedByDay = shop.day >= spec.releaseDay;
              return (
                <article
                  key={spec.id}
                  className={`rounded-2xl border p-4 flex items-center justify-between gap-3 ${
                    discovered
                      ? 'border-white/12 bg-[#161F2B]'
                      : 'border-white/6 bg-[#111721] opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="h-12 w-9 rounded-lg border flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: discovered ? spec.bodyColor : '#1A222E',
                        borderColor: discovered
                          ? spec.accentColor
                          : 'rgba(255,255,255,0.1)',
                      }}
                    >
                      {discovered ? (
                        <Smartphone className="w-4 h-4 text-white/80" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-display text-sm font-bold text-slate-100 truncate">
                        {discovered
                          ? `${spec.brand} ${spec.model}`
                          : unlockedByDay
                          ? `${spec.brand} ???`
                          : 'Kilitli Lansman Modeli'}
                      </div>
                      <div className="text-[11px] text-slate-400 tabular-nums">
                        {discovered
                          ? `${spec.storage} · Piyasa ${formatTRY(spec.baseValue)}`
                          : unlockedByDay
                          ? 'Piyasada aktif · Tezgaha gelmesi bekleniyor'
                          : `Gün ${spec.releaseDay} Lansmanı ile açılır`}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right text-[11px] font-semibold">
                    {discovered ? (
                      <span className="text-emerald-400">Keşfedildi</span>
                    ) : (
                      <span className="text-slate-500">Gün {spec.releaseDay}</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
