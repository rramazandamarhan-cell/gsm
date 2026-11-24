import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Gift,
  Lock,
  MessageSquare,
  Smartphone,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react';
import {
  CAREER_MILESTONES,
  DAILY_STREAK_REWARDS,
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
import {
  getLocalizedLevelPerk,
  getLocalizedMilestone,
  getLocalizedQuest,
  getLocalizedStoryChapter,
  useLanguage,
} from '../game/i18n';
import { ShopState } from '../game/types';
import { PhoneModelThumb } from './PhoneInspectSVG';

interface MissionsViewProps {
  shop: ShopState;
  onClaimDailyQuest: (questId: string) => void;
  onClaimMilestone: (milestoneId: string) => void;
  onClaimStoryChapter: (chapterId: string) => void;
  onClaimDailyStreak: () => void;
  onBackToCounter: () => void;
}

type MissionsSubTab = 'STORY' | 'DAILY' | 'MILESTONES' | 'LEVELS' | 'COLLECTION';

const MS_PER_PAGE = 6;
const MODELS_PER_PAGE = 8;

export const MissionsView: React.FC<MissionsViewProps> = ({
  shop,
  onClaimDailyQuest,
  onClaimMilestone,
  onClaimStoryChapter,
  onClaimDailyStreak,
  onBackToCounter,
}) => {
  const { lang, bi } = useLanguage();
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
      shop.level >= (m.minLevel ?? 1) &&
      !shop.claimedMilestoneIds.includes(m.id) &&
      getMilestoneCurrentValue(shop, m) >= m.target
  ).length;

  const [subTab, setSubTab] = useState<MissionsSubTab>(
    readyDailyCount > 0 ? 'DAILY' : 'STORY'
  );
  const [selectedChapterId, setSelectedChapterId] = useState<string>(() => {
    const firstUnclaimed = STORY_CHAPTERS.find(
      (c) => !shop.claimedChapterIds.includes(c.id)
    );
    return (firstUnclaimed ?? STORY_CHAPTERS[0]).id;
  });
  const [msPage, setMsPage] = useState(0);
  const [colPage, setColPage] = useState(0);

  const lvlInfo = getLevelProgress(shop.xp);
  const rank = getShopRank(shop);
  const streakBonus = getStreakBonusCash(shop.dealStreak, shop.level);
  const todayStreakReward =
    DAILY_STREAK_REWARDS[
      Math.min(DAILY_STREAK_REWARDS.length - 1, Math.max(0, shop.loginStreak - 1))
    ];

  const activeChapterRaw =
    STORY_CHAPTERS.find((c) => c.id === selectedChapterId) ?? STORY_CHAPTERS[0];
  const activeChapter = getLocalizedStoryChapter(activeChapterRaw, lang);
  const activeChVal = getStoryChapterCurrentValue(shop, activeChapterRaw);
  const activeChClaimed = shop.claimedChapterIds.includes(activeChapterRaw.id);
  const activeChReady = !activeChClaimed && activeChVal >= activeChapterRaw.target;

  const totalMsPages = Math.max(
    1,
    Math.ceil(CAREER_MILESTONES.length / MS_PER_PAGE)
  );
  const safeMsPage = Math.min(msPage, totalMsPages - 1);
  const visibleMilestones = CAREER_MILESTONES.slice(
    safeMsPage * MS_PER_PAGE,
    safeMsPage * MS_PER_PAGE + MS_PER_PAGE
  );

  const totalColPages = Math.max(
    1,
    Math.ceil(PHONE_CATALOG.length / MODELS_PER_PAGE)
  );
  const safeColPage = Math.min(colPage, totalColPages - 1);
  const visibleModels = PHONE_CATALOG.slice(
    safeColPage * MODELS_PER_PAGE,
    safeColPage * MODELS_PER_PAGE + MODELS_PER_PAGE
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#0F141B] p-2 lg:p-3 gap-2">
      {/* COMPACT LEVEL + XP + STREAK + SUB-TAB HEADER */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-1.5 rounded-xl border border-white/10 bg-[#151D28] px-2.5 py-1.5">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {(
            [
              ['STORY', BookOpen, bi('Hikâye', 'Story'), readyStoryCount],
              ['DAILY', Target, bi('Günlük', 'Daily'), readyDailyCount],
              ['MILESTONES', Trophy, bi('Kariyer', 'Career'), readyMilestoneCount],
              ['LEVELS', Sparkles, bi('Seviyeler', 'Levels'), 0],
              ['COLLECTION', Smartphone, bi('Katalog', 'Catalog'), 0],
            ] as const
          ).map(([id, Icon, label, badge]) => (
            <button
              key={id}
              type="button"
              onClick={() => setSubTab(id)}
              className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                subTab === id
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-[#0E141D] text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {badge > 0 && (
                <span className="rounded bg-emerald-400 px-1 font-mono text-[9.5px] font-extrabold text-slate-950">
                  +{badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Inline Level Progress + Daily Streak Claim */}
        <div className="flex items-center gap-2 tabular-nums shrink-0">
          <div className="flex items-center gap-1.5 rounded-lg border border-amber-400/25 bg-[#0E141D] px-2 py-0.5 text-[10.5px]">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono font-extrabold text-amber-300">
              {bi('Sv.', 'Lv.')}
              {shop.level}
            </span>
            <div className="w-12 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-amber-400"
                style={{ width: `${lvlInfo.percent}%` }}
              />
            </div>
            <span className="hidden md:inline font-mono text-[9.5px] text-slate-400">
              {lvlInfo.currentInLevel}/{lvlInfo.neededForNext} XP
            </span>
          </div>

          {!shop.dailyStreakClaimed && todayStreakReward && (
            <button
              type="button"
              onClick={onClaimDailyStreak}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1 text-[10.5px] font-extrabold text-slate-950 hover:bg-emerald-400 cursor-pointer whitespace-nowrap"
            >
              <Gift className="w-3.5 h-3.5" />
              {bi('Günlük Ödül', 'Daily Bonus')} +{formatTRY(todayStreakReward.cash)}
            </button>
          )}

          <button
            type="button"
            onClick={onBackToCounter}
            className="rounded-lg border border-white/10 bg-[#1B2432] px-2.5 py-1 text-[11px] font-semibold text-slate-200 hover:bg-[#243042] whitespace-nowrap cursor-pointer"
          >
            ← {bi('Tezgah', 'Counter')}
          </button>
        </div>
      </div>

      {/* TAB 1: STORY CHAPTERS (2-COLUMN ZERO SCROLL) */}
      {subTab === 'STORY' && (
        <div className="flex-1 min-h-0 grid grid-cols-12 gap-2 overflow-hidden">
          {/* Chapter List */}
          <div className="col-span-4 flex flex-col gap-1.5 min-h-0 overflow-hidden">
            {STORY_CHAPTERS.map((ch) => {
              const loc = getLocalizedStoryChapter(ch, lang);
              const val = getStoryChapterCurrentValue(shop, ch);
              const claimed = shop.claimedChapterIds.includes(ch.id);
              const ready = !claimed && val >= ch.target;
              const selected = ch.id === activeChapterRaw.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setSelectedChapterId(ch.id)}
                  className={`flex-1 rounded-xl border px-2.5 py-1.5 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer min-h-0 ${
                    selected
                      ? 'border-amber-400 bg-amber-500/15'
                      : 'border-white/10 bg-[#151D28] hover:bg-[#1B2432]'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-slate-100 truncate">
                      {loc.title}
                    </div>
                    <div className="text-[9.5px] text-slate-400 truncate">
                      {Math.min(val, ch.target)} / {ch.target}
                    </div>
                  </div>
                  {claimed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : ready ? (
                    <span className="rounded bg-emerald-400 px-1.5 py-0.5 text-[9.5px] font-extrabold text-slate-950 shrink-0">
                      {bi('AL', 'CLAIM')}
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] text-amber-300 shrink-0">
                      +{ch.rewardXp}XP
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Chapter Detail */}
          <div className="col-span-8 rounded-xl border border-white/10 bg-[#151D28] p-3 flex flex-col justify-between min-h-0 overflow-hidden">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono font-bold text-amber-300 uppercase">
                    {rank} · {bi('GÜN', 'DAY')} {shop.day}
                  </span>
                  <h3 className="font-display text-base font-extrabold text-slate-50">
                    {activeChapter.title}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {activeChapter.subtitle}
                  </p>
                </div>
                <div className="text-right font-mono tabular-nums shrink-0">
                  <div className="text-xs font-extrabold text-emerald-400">
                    +{formatTRY(activeChapter.rewardCash)}
                  </div>
                  <div className="text-[10.5px] font-bold text-amber-300">
                    +{activeChapter.rewardXp} XP
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">
                {activeChapter.narrative}
              </p>

              <div className="rounded-lg border border-amber-400/25 bg-amber-500/8 p-2 text-[11px] text-amber-100 flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="italic">{activeChapter.mentorNote}</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-white/8 tabular-nums">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">
                  {activeChapter.objectiveText}
                </span>
                <span className="font-mono font-bold text-amber-300">
                  {Math.min(activeChVal, activeChapterRaw.target)} /{' '}
                  {activeChapterRaw.target}
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((activeChVal / activeChapterRaw.target) * 100)
                    )}%`,
                  }}
                />
              </div>
              <div className="flex justify-end">
                {activeChClaimed ? (
                  <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    {bi('Bölüm Tamamlandı', 'Chapter Completed')}
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={!activeChReady}
                    onClick={() => onClaimStoryChapter(activeChapterRaw.id)}
                    className="rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-extrabold text-slate-950 hover:bg-emerald-400 disabled:opacity-35 cursor-pointer"
                  >
                    {activeChReady
                      ? bi('Ödülü Topla', 'Claim Reward')
                      : bi('Hedef Devam Ediyor', 'In Progress')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DAILY QUESTS + STREAK BAR (ZERO SCROLL) */}
      {subTab === 'DAILY' && (
        <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
          <div className="flex-1 min-h-0 grid grid-cols-3 gap-2 overflow-hidden">
            {shop.dailyQuests.slice(0, 3).map((q) => {
              const loc = getLocalizedQuest(q, lang);
              const ready = !q.claimed && q.progress >= q.target;
              const pct = Math.min(100, Math.round((q.progress / q.target) * 100));
              return (
                <div
                  key={q.id}
                  className={`rounded-xl border p-2.5 flex flex-col justify-between min-h-0 ${
                    q.claimed
                      ? 'border-emerald-500/25 bg-emerald-500/6 opacity-75'
                      : ready
                      ? 'border-emerald-400/60 bg-emerald-500/12'
                      : 'border-white/10 bg-[#151D28]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-extrabold text-slate-100">
                        {loc.title}
                      </span>
                      <span className="font-mono text-[10px] font-bold text-amber-300 shrink-0">
                        +{q.xpReward} XP
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-300 mt-1 leading-snug">
                      {loc.description}
                    </p>
                  </div>

                  <div className="space-y-1.5 tabular-nums">
                    <div className="flex justify-between text-[10.5px]">
                      <span className="text-slate-400">
                        {bi('İlerleme', 'Progress')}
                      </span>
                      <span className="font-mono font-bold text-slate-100">
                        {Math.min(q.progress, q.target)} / {q.target}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-amber-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {q.claimed ? (
                      <div className="text-center text-[11px] font-extrabold text-emerald-400 py-1">
                        ✓ {bi('Alındı', 'Claimed')}
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={!ready}
                        onClick={() => onClaimDailyQuest(q.id)}
                        className="w-full rounded-lg bg-emerald-500 py-1.5 text-[11px] font-extrabold text-slate-950 hover:bg-emerald-400 disabled:opacity-35 cursor-pointer"
                      >
                        {ready
                          ? `${bi('Al', 'Claim')} · +${formatTRY(q.reward)}`
                          : `${bi('Ödül', 'Reward')}: +${formatTRY(q.reward)}`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Compact 7-Day Login Streak Strip */}
          <div className="shrink-0 rounded-xl border border-white/10 bg-[#151D28] px-3 py-1.5 flex items-center justify-between gap-2 tabular-nums">
            <div className="flex items-center gap-1.5 text-[11px]">
              <Flame className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-bold text-slate-100 whitespace-nowrap">
                {bi(`Giriş Serisi: ${shop.loginStreak}. Gün`, `Login Streak: Day ${shop.loginStreak}`)}
              </span>
              {streakBonus > 0 && (
                <span className="text-[10px] text-emerald-300 hidden sm:inline">
                  · {bi('Anlaşma Serisi Bonusu', 'Deal Streak Bonus')}: +{formatTRY(streakBonus)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {DAILY_STREAK_REWARDS.map((r) => {
                const active = r.day === shop.loginStreak;
                const past = r.day < shop.loginStreak;
                return (
                  <span
                    key={r.day}
                    className={`rounded px-1.5 py-0.5 font-mono text-[9.5px] font-bold ${
                      active
                        ? 'bg-amber-500 text-slate-950'
                        : past
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-white/8 text-slate-400'
                    }`}
                  >
                    {bi('G', 'D')}
                    {r.day}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CAREER MILESTONES (3x2 PAGINATED, ZERO SCROLL) */}
      {subTab === 'MILESTONES' && (
        <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
          <div className="flex-1 min-h-0 grid grid-cols-3 grid-rows-2 gap-2 overflow-hidden">
            {visibleMilestones.map((m) => {
              const loc = getLocalizedMilestone(m, lang);
              const reqLevel = m.minLevel ?? 1;
              const levelLocked = shop.level < reqLevel;
              const val = getMilestoneCurrentValue(shop, m);
              const claimed = shop.claimedMilestoneIds.includes(m.id);
              const ready = !levelLocked && !claimed && val >= m.target;
              const pct = Math.min(100, Math.round((val / m.target) * 100));
              return (
                <div
                  key={m.id}
                  className={`rounded-xl border p-2 flex flex-col justify-between min-h-0 overflow-hidden ${
                    claimed
                      ? 'border-emerald-500/25 bg-emerald-500/6 opacity-75'
                      : ready
                      ? 'border-amber-400 bg-amber-500/12'
                      : levelLocked
                      ? 'border-white/8 bg-[#111722] opacity-75'
                      : 'border-white/10 bg-[#151D28]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-extrabold text-slate-100 truncate">
                        {loc.title}
                      </span>
                      <span className="font-mono text-[9.5px] text-amber-300 shrink-0">
                        {levelLocked
                          ? bi(`Sv.${reqLevel}`, `L${reqLevel}`)
                          : `+${m.rewardXp}XP`}
                      </span>
                    </div>
                    <p className="text-[9.5px] text-slate-400 line-clamp-2 mt-0.5">
                      {loc.description}
                    </p>
                  </div>

                  <div className="space-y-1 tabular-nums">
                    <div className="flex justify-between text-[9.5px] font-mono">
                      <span className="text-slate-400">
                        {Math.min(val, m.target)}/{m.target}
                      </span>
                      <span className="text-emerald-300">
                        +{formatTRY(m.rewardCash)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-amber-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {claimed ? (
                      <div className="text-center text-[10px] font-bold text-emerald-400">
                        ✓ {bi('Tamamlandı', 'Completed')}
                      </div>
                    ) : levelLocked ? (
                      <div className="inline-flex w-full items-center justify-center gap-1 rounded-md border border-white/10 bg-[#0D131C] py-0.5 text-[9.5px] font-bold text-amber-300">
                        <Lock className="w-2.5 h-2.5" />
                        {bi(`Seviye ${reqLevel} ile Açılır`, `Unlocks at Lv.${reqLevel}`)}
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={!ready}
                        onClick={() => onClaimMilestone(m.id)}
                        className="w-full rounded-md bg-amber-500 py-0.5 text-[10px] font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-35 cursor-pointer"
                      >
                        {ready
                          ? bi('Ödülü Al', 'Claim')
                          : bi('Devam Ediyor', 'In Progress')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="shrink-0 flex items-center justify-center gap-2 text-[11px]">
            <button
              type="button"
              disabled={safeMsPage === 0}
              onClick={() => setMsPage((p) => Math.max(0, p - 1))}
              className="inline-flex items-center gap-0.5 rounded-md border border-white/10 bg-[#151D28] px-2.5 py-0.5 text-slate-200 disabled:opacity-35 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> {bi('Önceki', 'Prev')}
            </button>
            <span className="font-mono text-slate-400">
              {safeMsPage + 1} / {totalMsPages}
            </span>
            <button
              type="button"
              disabled={safeMsPage >= totalMsPages - 1}
              onClick={() => setMsPage((p) => Math.min(totalMsPages - 1, p + 1))}
              className="inline-flex items-center gap-0.5 rounded-md border border-white/10 bg-[#151D28] px-2.5 py-0.5 text-slate-200 disabled:opacity-35 cursor-pointer"
            >
              {bi('Sonraki', 'Next')} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: 10-LEVEL PROGRESSION ROADMAP (5x2 ZERO SCROLL) */}
      {subTab === 'LEVELS' && (
        <div className="flex-1 min-h-0 grid grid-cols-5 grid-rows-2 gap-2 overflow-hidden">
          {LEVEL_PERKS.map((perk) => {
            const loc = getLocalizedLevelPerk(perk.level, lang);
            const reached = shop.level >= perk.level;
            const isCurrent = shop.level === perk.level;
            return (
              <div
                key={perk.level}
                className={`rounded-xl border p-2 flex flex-col justify-between min-h-0 overflow-hidden ${
                  isCurrent
                    ? 'border-amber-400 bg-amber-500/15'
                    : reached
                    ? 'border-emerald-500/35 bg-emerald-500/8'
                    : 'border-white/8 bg-[#131A24]/80 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-[10.5px] font-extrabold text-amber-300">
                    {bi(`Sv.${perk.level}`, `Lv.${perk.level}`)}
                  </span>
                  {reached ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Lock className="w-3 h-3 text-slate-500 shrink-0" />
                  )}
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-100 leading-tight line-clamp-2">
                    {loc.title}
                  </div>
                  <p className="text-[9px] text-slate-400 leading-snug line-clamp-3 mt-0.5">
                    {loc.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 5: PHONE MODEL COLLECTION (4x2 PAGINATED, ZERO SCROLL) */}
      {subTab === 'COLLECTION' && (
        <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
          <div className="flex-1 min-h-0 grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden">
            {visibleModels.map((spec) => {
              const discovered = shop.discoveredSpecIds.includes(spec.id);
              return (
                <div
                  key={spec.id}
                  className={`rounded-xl border p-2 flex flex-col justify-between min-h-0 ${
                    discovered
                      ? 'border-amber-400/35 bg-[#151D28]'
                      : 'border-white/8 bg-[#111720] opacity-60'
                  }`}
                >
                  <div className="shrink-0 flex items-center justify-between gap-1">
                    <span className="text-[11px] font-extrabold text-slate-100 truncate">
                      {discovered ? `${spec.brand} ${spec.model}` : '???'}
                    </span>
                    <span className="font-mono text-[9.5px] text-slate-400 shrink-0">
                      {spec.storage}
                    </span>
                  </div>

                  <div className="flex-1 min-h-0 my-1 rounded-lg border border-white/6 bg-[#0D131C] p-1.5 flex items-center justify-center overflow-hidden">
                    <PhoneModelThumb
                      spec={spec}
                      showBack
                      silhouette={!discovered}
                      className="h-full max-h-20 w-auto"
                    />
                  </div>

                  <div className="shrink-0 flex items-center justify-between text-[10px] tabular-nums">
                    <span className="text-slate-400 uppercase font-mono">
                      {spec.tier}
                    </span>
                    <span className="font-mono font-bold text-amber-300">
                      {discovered ? formatTRY(spec.baseValue) : '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="shrink-0 flex items-center justify-center gap-2 text-[11px]">
            <button
              type="button"
              disabled={safeColPage === 0}
              onClick={() => setColPage((p) => Math.max(0, p - 1))}
              className="inline-flex items-center gap-0.5 rounded-md border border-white/10 bg-[#151D28] px-2.5 py-0.5 text-slate-200 disabled:opacity-35 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> {bi('Önceki', 'Prev')}
            </button>
            <span className="font-mono text-slate-400">
              {safeColPage + 1} / {totalColPages} · {shop.discoveredSpecIds.length}/
              {PHONE_CATALOG.length}
            </span>
            <button
              type="button"
              disabled={safeColPage >= totalColPages - 1}
              onClick={() =>
                setColPage((p) => Math.min(totalColPages - 1, p + 1))
              }
              className="inline-flex items-center gap-0.5 rounded-md border border-white/10 bg-[#151D28] px-2.5 py-0.5 text-slate-200 disabled:opacity-35 cursor-pointer"
            >
              {bi('Sonraki', 'Next')} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
