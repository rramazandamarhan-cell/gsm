import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Crown,
  Flame,
  Gift,
  Lock,
  MessageSquare,
  PlayCircle,
  RotateCcw,
  ScrollText,
  Smartphone,
  Sparkles,
  Target,
  Trophy,
  X,
} from 'lucide-react';
import {
  CAREER_MILESTONES,
  DAILY_STREAK_REWARDS,
  PHONE_CATALOG,
  SHOP_TIERS,
  SHOP_UPGRADES,
  STORY_CHAPTERS,
} from '../game/catalog';
import {
  detectPlayerPlaystyle,
  formatTRY,
  getLevelProgress,
  getLevelUpBonusCash,
  getMilestoneCurrentValue,
  getPlaystyleLabel,
  getPrestigeIncomeMultiplier,
  getPrestigePointsEarned,
  getPrestigeRequirements,
  getShopRank,
  getStoryChapterCurrentValue,
  getStreakBonusCash,
  isPrestigeEligible,
  PRESTIGE_PERKS,
} from '../game/engine';
import {
  getLocalizedMilestone,
  getLocalizedQuest,
  getLocalizedShopTier,
  getLocalizedStoryChapter,
  getLocalizedUpgrade,
  useLanguage,
} from '../game/i18n';
import { DailyQuest, PrestigePerkId, ShopState, ShopTier, UpgradeId } from '../game/types';
import { PhoneModelThumb } from './PhoneInspectSVG';

interface MissionsViewProps {
  shop: ShopState;
  onClaimDailyQuest: (questId: string) => void;
  onClaimMilestone: (milestoneId: string) => void;
  onClaimStoryChapter: (chapterId: string) => void;
  onClaimDailyStreak: (doubled?: boolean) => void;
  dailyStreakClaiming?: boolean;
  onTriggerPrestige: () => void;
  onBuyPrestigePerk: (perkId: PrestigePerkId) => void;
  onBackToCounter: () => void;
}

type MissionsSubTab = 'STORY' | 'DAILY' | 'MILESTONES' | 'PRESTIGE' | 'ROADMAP' | 'COLLECTION';

const CHAPTERS_PER_PAGE = 4;
const MS_PER_PAGE = 6;
const MODELS_PER_PAGE = 8;
const CORE_LICENSE_IDS: UpgradeId[] = [
  'accessory_license',
  'classifieds_license',
  'auction_license',
  'brand_new_license',
];

export const MissionsView: React.FC<MissionsViewProps> = ({
  shop,
  onClaimDailyQuest,
  onClaimMilestone,
  onClaimStoryChapter,
  onClaimDailyStreak,
  dailyStreakClaiming = false,
  onTriggerPrestige,
  onBuyPrestigePerk,
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
  const [storyPage, setStoryPage] = useState<number>(() => {
    const firstIdx = STORY_CHAPTERS.findIndex(
      (c) => !shop.claimedChapterIds.includes(c.id)
    );
    return firstIdx >= 0 ? Math.floor(firstIdx / CHAPTERS_PER_PAGE) : 0;
  });
  const [msPage, setMsPage] = useState(0);
  const [colPage, setColPage] = useState(0);
  const [diplomaQuest, setDiplomaQuest] = useState<DailyQuest | null>(null);
  const [confirmPrestige, setConfirmPrestige] = useState(false);

  const rank = getShopRank(shop);
  const lvlProg = getLevelProgress(shop.xp);
  const nextLevelBonus = getLevelUpBonusCash(lvlProg.level + 1);
  const playstyle = detectPlayerPlaystyle(shop);
  const playstyleInfo = getPlaystyleLabel(playstyle);
  const prestigeLevel = shop.prestigeLevel ?? 0;
  const prestigePoints = shop.prestigePoints ?? 0;
  const prestigePerks = shop.prestigePerks ?? [];
  const prestigeReq = getPrestigeRequirements(prestigeLevel);
  const prestigeTarget = prestigeReq.cashTarget;
  const prestigeEarnedPreview = getPrestigePointsEarned(shop);
  const prestigeReady = isPrestigeEligible(shop);
  const prestigeMultPct = Math.round((getPrestigeIncomeMultiplier(shop) - 1) * 100);
  const streakBonus = getStreakBonusCash(shop.dealStreak, shop.shopTier);
  const todayStreakReward =
    DAILY_STREAK_REWARDS[
      Math.min(DAILY_STREAK_REWARDS.length - 1, Math.max(0, shop.loginStreak - 1))
    ];

  const getWittyDiplomaQuote = (q: DailyQuest | null): string => {
    if (!q) {
      return bi(
        'Pasajda ince belli çay eşliğinde pazarlık yapma, göz ucuyla yan sanayi ekranı tanıma ve müşteriyi gülümseterek gönderme üstün başarısından dolayı takdim edilmiştir.',
        'Awarded for exceptional bargaining over Turkish tea, spotting aftermarket screens at a glance, and sending every customer away smiling.'
      );
    }
    switch (q.kind) {
      case 'REPAIR_PHONE':
        return bi(
          'Havya elinde, tornavida cebinde; ölü anakartı hayata döndürme ve sıfır vida artırma üstün başarısından dolayı bu diploma takdim edilmiştir!',
          'Soldering iron in hand, zero leftover screws — awarded for resurrecting dead boards with master craftsman precision!'
        );
      case 'INSPECT_FULL':
      case 'USE_LEVERAGE':
        return bi(
          '“Tertemiz abi, hiç açılmadı” diyen satıcının gözünün içine baka baka sıvı bandını ve yurt dışı IMEI’yi şıp diye yakalama başarısından dolayı verilmiştir!',
          'Awarded for staring straight at a “mint condition” hustler and catching their red LCI strip and unregistered IMEI red-handed!'
        );
      case 'SELL_PHONE':
      case 'BUY_BARGAIN':
        return bi(
          'Kelepiri kokusundan tanıma, vitrini sıcak tutma ve kasa defterini hep artıda kapatma ustalığından dolayı Pasaj Esnaf Odası onayıyla verilmiştir!',
          'Certified by the Arcade Merchants Guild for sniffing out bargains from a mile away and keeping the showcase hot!'
        );
      case 'SERVE_TEA':
        return bi(
          'En inatçı müşteriyi bile taze demlenmiş iki ince belli çayla pamuk gibi yumuşatma sanatındaki üstün diplomasisi nedeniyle takdim edilmiştir!',
          'Presented for supreme tea diplomacy — melting even the toughest hagglers with two cups of freshly brewed Turkish tea!'
        );
      default:
        return bi(
          'Pasaj ticaret ahlakı, keskin esnaf sezgisi ve günün görevini alnının akıyla tamamlama başarısından dolayı bu onur belgesi verilmiştir!',
          'Awarded for sharp merchant instincts, arcade craftsmanship, and completing today’s mission with flying colors!'
        );
    }
  };

  const activeChapterRaw =
    STORY_CHAPTERS.find((c) => c.id === selectedChapterId) ?? STORY_CHAPTERS[0];
  const activeChapter = getLocalizedStoryChapter(activeChapterRaw, lang);
  const activeChVal = getStoryChapterCurrentValue(shop, activeChapterRaw);
  const activeChClaimed = shop.claimedChapterIds.includes(activeChapterRaw.id);
  const activeChReady = !activeChClaimed && activeChVal >= activeChapterRaw.target;

  const totalStoryPages = Math.max(
    1,
    Math.ceil(STORY_CHAPTERS.length / CHAPTERS_PER_PAGE)
  );
  const safeStoryPage = Math.min(storyPage, totalStoryPages - 1);
  const visibleChapters = STORY_CHAPTERS.slice(
    safeStoryPage * CHAPTERS_PER_PAGE,
    safeStoryPage * CHAPTERS_PER_PAGE + CHAPTERS_PER_PAGE
  );

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
    <div className="h-full flex-1 min-h-0 flex flex-col overflow-hidden bg-[#0F141B] p-1.5 [@media(min-height:560px)]:p-2 gap-1.5">
      {/* COMPACT LEVEL + XP + STREAK + SUB-TAB HEADER */}
      <div className="shrink-0 flex flex-wrap sm:flex-nowrap items-center justify-between gap-1.5 rounded-xl border border-white/10 bg-[#151D28] px-2 py-1">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar min-w-0 w-full sm:w-auto">
          {(
            [
              ['STORY', BookOpen, bi('Hikâye', 'Story'), readyStoryCount],
              ['DAILY', Target, bi('Günlük', 'Daily'), readyDailyCount],
              ['MILESTONES', Trophy, bi('Kariyer', 'Career'), readyMilestoneCount],
              ['PRESTIGE', Crown, bi('Prestij', 'Prestige'), prestigeReady ? 1 : 0],
              ['ROADMAP', Sparkles, bi('Yol Haritası', 'Roadmap'), 0],
              ['COLLECTION', Smartphone, bi('Katalog', 'Catalog'), 0],
            ] as const
          ).map(([id, Icon, label, badge]) => (
            <button
              key={id}
              type="button"
              onClick={() => setSubTab(id)}
              className={`inline-flex items-center gap-1 rounded-lg px-1.5 sm:px-2 py-0.5 [@media(min-height:560px)]:py-1 text-[10px] [@media(min-height:560px)]:text-[10.5px] font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                subTab === id
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-[#0E141D] text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              <Icon className="w-3 h-3" />
              {label}
              {badge > 0 && (
                <span className="rounded bg-emerald-400 px-1 font-mono text-[9px] font-extrabold text-slate-950">
                  +{badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Inline Rank, Infinite Level XP Bar & Daily Streak Claim */}
        <div className="flex items-center gap-1.5 tabular-nums shrink-0">
          <div
            className="flex items-center gap-1 rounded-lg border border-amber-400/25 bg-[#0E141D] px-2 py-0.5 text-[9.5px] [@media(min-height:560px)]:text-[10px]"
            title={bi(
              `Sv. ${lvlProg.level + 1} bonusu: +${formatTRY(nextLevelBonus)} (${lvlProg.currentInLevel}/${lvlProg.neededForNext} XP)`,
              `Lv. ${lvlProg.level + 1} bonus: +${formatTRY(nextLevelBonus)} (${lvlProg.currentInLevel}/${lvlProg.neededForNext} XP)`
            )}
          >
            <Award className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="font-mono font-extrabold text-amber-300 whitespace-nowrap">
              {bi(`Sv.${lvlProg.level}`, `Lv.${lvlProg.level}`)}
            </span>
            <span className="hidden md:inline font-bold text-slate-200 truncate max-w-[100px]">
              {rank}
            </span>
            <div className="hidden sm:flex items-center gap-1">
              <div className="w-10 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all"
                  style={{ width: `${lvlProg.percent}%` }}
                />
              </div>
              <span className="font-mono text-[8.5px] text-slate-400">
                {lvlProg.percent}%
              </span>
            </div>
          </div>

          {!shop.dailyStreakClaimed && todayStreakReward && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={dailyStreakClaiming}
                onClick={() => onClaimDailyStreak(false)}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-2 py-0.5 [@media(min-height:560px)]:py-1 text-[9.5px] [@media(min-height:560px)]:text-[10px] font-extrabold text-slate-950 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
              >
                <Gift className="w-3 h-3" />
                {bi('Günlük', 'Daily')} +{formatTRY(todayStreakReward.cash)}
              </button>
              <button
                type="button"
                disabled={dailyStreakClaiming}
                onClick={() => onClaimDailyStreak(true)}
                title={bi(
                  'Ödüllü reklam izleyerek günlük ödülü 2x al',
                  'Watch a rewarded ad to claim 2x daily bonus'
                )}
                className="inline-flex items-center gap-1 rounded-lg border border-amber-400/50 bg-amber-500/20 px-2 py-0.5 [@media(min-height:560px)]:py-1 text-[9.5px] [@media(min-height:560px)]:text-[10px] font-extrabold text-amber-200 hover:bg-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
              >
                <PlayCircle className="w-3 h-3 text-amber-300" />
                {dailyStreakClaiming
                  ? bi('Reklam...', 'Loading...')
                  : `${bi('2x İzle', '2x Ad')} (+${formatTRY(todayStreakReward.cash * 2)})`}
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onBackToCounter}
            className="rounded-lg border border-white/10 bg-[#1B2432] px-2 py-0.5 [@media(min-height:560px)]:py-1 text-[10px] [@media(min-height:560px)]:text-[10.5px] font-semibold text-slate-200 hover:bg-[#243042] whitespace-nowrap cursor-pointer"
          >
            ← {bi('Tezgah', 'Counter')}
          </button>
        </div>
      </div>

      {/* TAB 1: 12-CHAPTER STORY ARC (STRICT ZERO SCROLL) */}
      {subTab === 'STORY' && (
        <div className="h-full flex-1 min-h-0 grid grid-cols-12 gap-1.5 [@media(min-height:560px)]:gap-2 overflow-hidden">
          {/* Paginated Chapter List (4 per page) */}
          <div className="h-full col-span-5 lg:col-span-4 flex flex-col gap-1 [@media(min-height:560px)]:gap-1.5 min-h-0 overflow-hidden">
            <div className="shrink-0 flex items-center justify-between gap-1 px-1 text-[10px] font-mono text-slate-400">
              <span className="truncate">
                {bi('Hikâye', 'Story')}:{' '}
                <strong className="text-amber-300">
                  {shop.claimedChapterIds.length}/{STORY_CHAPTERS.length}
                </strong>
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={safeStoryPage === 0}
                  onClick={() => setStoryPage((p) => Math.max(0, p - 1))}
                  className="rounded border border-white/10 bg-[#151D28] px-1 py-0.5 text-slate-200 disabled:opacity-30 cursor-pointer"
                  aria-label={bi('Önceki Sayfa', 'Prev Page')}
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <span className="text-[9.5px] text-slate-300">
                  {safeStoryPage + 1}/{totalStoryPages}
                </span>
                <button
                  type="button"
                  disabled={safeStoryPage >= totalStoryPages - 1}
                  onClick={() =>
                    setStoryPage((p) => Math.min(totalStoryPages - 1, p + 1))
                  }
                  className="rounded border border-white/10 bg-[#151D28] px-1 py-0.5 text-slate-200 disabled:opacity-30 cursor-pointer"
                  aria-label={bi('Sonraki Sayfa', 'Next Page')}
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="h-full flex-1 min-h-0 grid grid-rows-4 gap-1 [@media(min-height:560px)]:gap-1.5 overflow-hidden">
              {visibleChapters.map((ch) => {
                const loc = getLocalizedStoryChapter(ch, lang);
                const val = getStoryChapterCurrentValue(shop, ch);
                const claimed = shop.claimedChapterIds.includes(ch.id);
                const ready = !claimed && val >= ch.target;
                const selected = ch.id === activeChapterRaw.id;
                const pct = Math.min(100, Math.round((val / ch.target) * 100));
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setSelectedChapterId(ch.id)}
                    className={`w-full min-h-0 rounded-xl border px-2 py-1 [@media(min-height:560px)]:px-2.5 [@media(min-height:560px)]:py-1.5 text-left flex items-center justify-between gap-1.5 transition-colors cursor-pointer overflow-hidden ${
                      selected
                        ? 'border-amber-400 bg-amber-500/15'
                        : claimed
                        ? 'border-emerald-500/25 bg-emerald-500/6 hover:bg-emerald-500/10'
                        : 'border-white/10 bg-[#151D28] hover:bg-[#1B2432]'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-[10.5px] [@media(min-height:560px)]:text-[11px] font-bold text-slate-100 truncate">
                        {loc.title}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <div className="h-1 flex-1 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full ${claimed || ready ? 'bg-emerald-400' : 'bg-amber-400'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[8.5px] font-mono text-slate-400 shrink-0 tabular-nums">
                          {ch.metric === 'totalProfitEarned'
                            ? `%${pct}`
                            : `${Math.min(val, ch.target)}/${ch.target}`}
                        </span>
                      </div>
                    </div>
                    {claimed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : ready ? (
                      <span className="rounded bg-emerald-400 px-1.5 py-0.5 text-[9px] font-extrabold text-slate-950 shrink-0">
                        {bi('AL', 'CLAIM')}
                      </span>
                    ) : (
                      <span className="font-mono text-[9px] font-bold text-emerald-300 shrink-0 tabular-nums">
                        +{formatTRY(ch.rewardCash)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Chapter Detail */}
          <div className="h-full col-span-7 lg:col-span-8 rounded-xl border border-white/10 bg-[#151D28] p-2 [@media(min-height:560px)]:p-2.5 flex flex-col justify-between gap-1.5 min-h-0 overflow-hidden">
            <div className="min-h-0 flex-1 flex flex-col gap-1.5 [@media(min-height:560px)]:gap-2 overflow-hidden">
              <div className="shrink-0 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[9px] font-mono font-bold text-amber-300 uppercase">
                    {bi(`Bölüm ${activeChapterRaw.chapterNumber}/${STORY_CHAPTERS.length}`, `Ch. ${activeChapterRaw.chapterNumber}/${STORY_CHAPTERS.length}`)} · {rank} · {bi('GÜN', 'DAY')} {shop.day}
                  </span>
                  <h3 className="font-display text-xs [@media(min-height:560px)]:text-sm font-extrabold text-slate-50 truncate">
                    {activeChapter.title}
                  </h3>
                  <p className="text-[9.5px] [@media(min-height:560px)]:text-[10.5px] text-slate-400 truncate">
                    {activeChapter.subtitle}
                  </p>
                </div>
                <div className="text-right font-mono tabular-nums shrink-0">
                  <div className="text-[11px] [@media(min-height:560px)]:text-xs font-extrabold text-emerald-400">
                    +{formatTRY(activeChapter.rewardCash)}
                  </div>
                  {activeChapter.rewardXp > 0 && (
                    <div className="text-[9px] font-bold text-amber-300">
                      +{activeChapter.rewardXp} XP
                    </div>
                  )}
                </div>
              </div>

              <p className="text-[10px] [@media(min-height:560px)]:text-[11px] text-slate-200 leading-snug line-clamp-2 [@media(min-height:540px)]:line-clamp-none">
                {activeChapter.narrative}
              </p>

              <div className="rounded-lg border border-amber-400/25 bg-amber-500/8 p-1.5 [@media(min-height:560px)]:p-2 text-[9.5px] [@media(min-height:560px)]:text-[10.5px] text-amber-100 flex items-start gap-1.5 overflow-hidden">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span className="italic line-clamp-2 [@media(min-height:540px)]:line-clamp-none">
                  {activeChapter.mentorNote}
                </span>
              </div>
            </div>

            <div className="shrink-0 space-y-1 [@media(min-height:560px)]:space-y-1.5 pt-1.5 border-t border-white/8 tabular-nums">
              <div className="flex items-center justify-between gap-2 text-[10px] [@media(min-height:560px)]:text-[11px]">
                <span className="font-semibold text-slate-200 truncate">
                  {activeChapter.objectiveText}
                </span>
                <span className="font-mono font-bold text-amber-300 shrink-0">
                  {activeChapterRaw.metric === 'totalProfitEarned'
                    ? `${formatTRY(Math.min(activeChVal, activeChapterRaw.target))} / ${formatTRY(activeChapterRaw.target)}`
                    : `${Math.min(activeChVal, activeChapterRaw.target)} / ${activeChapterRaw.target}`}
                </span>
              </div>
              <div className="h-1.5 [@media(min-height:560px)]:h-2 rounded-full bg-white/10 overflow-hidden">
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
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {bi('Bölüm Tamamlandı', 'Chapter Completed')}
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={!activeChReady}
                    onClick={() => onClaimStoryChapter(activeChapterRaw.id)}
                    className="rounded-lg bg-emerald-500 px-3.5 py-1 [@media(min-height:560px)]:py-1.5 text-[11px] font-extrabold text-slate-950 hover:bg-emerald-400 disabled:opacity-35 cursor-pointer"
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

      {/* TAB 2: DYNAMIC PLAYSTYLE DAILY QUESTS + ESNAF DIPLOMA + STREAK (ZERO SCROLL) */}
      {subTab === 'DAILY' && (
        <div className="h-full flex-1 min-h-0 flex flex-col gap-1.5 [@media(min-height:560px)]:gap-2 overflow-hidden">
          {/* Playstyle Adaptation Bar */}
          <div className="shrink-0 rounded-xl border border-white/10 bg-[#151D28] px-2.5 py-1 flex items-center justify-between gap-2 text-[10px]">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-extrabold text-amber-300 whitespace-nowrap">
                {bi('Oyun Tarzın:', 'Playstyle:')} {playstyleInfo.title}
              </span>
              <span aria-hidden="true" className="text-white/20">·</span>
              <span className="text-slate-300 truncate">{playstyleInfo.tagline}</span>
            </div>
            <button
              type="button"
              onClick={() =>
                setDiplomaQuest(
                  shop.dailyQuests.find((q) => q.claimed) ??
                    shop.dailyQuests[0] ??
                    null
                )
              }
              className="inline-flex items-center gap-1 rounded-lg border border-amber-400/35 bg-amber-500/12 px-2 py-0.5 text-[9.5px] font-extrabold text-amber-200 hover:bg-amber-500/22 cursor-pointer whitespace-nowrap shrink-0"
            >
              <ScrollText className="w-3 h-3" />
              {bi('Esnaf Diploması', 'Merchant Diploma')}
            </button>
          </div>

          <div className="h-full flex-1 min-h-0 grid grid-cols-3 gap-1.5 [@media(min-height:560px)]:gap-2 overflow-hidden">
            {shop.dailyQuests.slice(0, 3).map((q) => {
              const loc = getLocalizedQuest(q, lang);
              const ready = !q.claimed && q.progress >= q.target;
              const pct = Math.min(100, Math.round((q.progress / q.target) * 100));
              const diffText = q.difficultyTag ?? 'Standart';
              return (
                <div
                  key={q.id}
                  className={`rounded-xl border p-1.5 [@media(min-height:560px)]:p-2.5 flex flex-col justify-between min-h-0 overflow-hidden ${
                    q.claimed
                      ? 'border-emerald-500/25 bg-emerald-500/6 opacity-80'
                      : ready
                      ? 'border-emerald-400/60 bg-emerald-500/12'
                      : 'border-white/10 bg-[#151D28]'
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] [@media(min-height:560px)]:text-[11px] font-extrabold text-slate-100 truncate">
                        {loc.title}
                      </span>
                      <span className="font-mono text-[9.5px] font-bold text-emerald-400 shrink-0 tabular-nums">
                        +{formatTRY(q.reward)}
                      </span>
                    </div>
                    <div className="text-[9px] text-amber-300/90 font-semibold mt-0.5 truncate">
                      {diffText} · +{q.xpReward} XP
                    </div>
                    <p className="text-[10px] text-slate-300 mt-1 leading-tight line-clamp-2 [@media(min-height:540px)]:line-clamp-3">
                      {loc.description}
                    </p>
                  </div>

                  <div className="shrink-0 space-y-1 [@media(min-height:560px)]:space-y-1.5 tabular-nums">
                    <div className="flex justify-between text-[10px]">
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
                      <button
                        type="button"
                        onClick={() => setDiplomaQuest(q)}
                        className="w-full rounded-lg border border-emerald-400/35 bg-emerald-500/12 py-1 text-[10px] font-extrabold text-emerald-300 hover:bg-emerald-500/20 cursor-pointer truncate"
                      >
                        ✓ {bi('Alındı · Diploma', 'Claimed · Diploma')}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={!ready}
                        onClick={() => {
                          onClaimDailyQuest(q.id);
                          setDiplomaQuest(q);
                        }}
                        className="w-full rounded-lg bg-emerald-500 py-1 [@media(min-height:560px)]:py-1.5 text-[10px] [@media(min-height:560px)]:text-[11px] font-extrabold text-slate-950 hover:bg-emerald-400 disabled:opacity-35 cursor-pointer truncate"
                      >
                        {ready
                          ? `${bi('Ödülü Al', 'Claim')} · +${formatTRY(q.reward)}`
                          : `${bi('Ödül', 'Reward')}: +${formatTRY(q.reward)}`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Compact 7-Day Login Streak Strip */}
          <div className="shrink-0 rounded-xl border border-white/10 bg-[#151D28] px-2.5 py-1 [@media(min-height:560px)]:px-3 [@media(min-height:560px)]:py-1.5 flex items-center justify-between gap-2 tabular-nums">
            <div className="flex items-center gap-1.5 text-[10.5px] min-w-0">
              <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-bold text-slate-100 whitespace-nowrap">
                {bi(`Giriş Serisi: ${shop.loginStreak}. Gün`, `Login Streak: Day ${shop.loginStreak}`)}
              </span>
              {streakBonus > 0 && (
                <span className="text-[10px] text-emerald-300 hidden sm:inline truncate">
                  · {bi('Seri Bonusu', 'Streak Bonus')}: +{formatTRY(streakBonus)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {DAILY_STREAK_REWARDS.map((r) => {
                const active = r.day === shop.loginStreak;
                const past = r.day < shop.loginStreak;
                return (
                  <span
                    key={r.day}
                    className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-bold ${
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

      {/* TAB 3: CAREER MILESTONES (3x2 PAGINATED, STRICT ZERO SCROLL) */}
      {subTab === 'MILESTONES' && (
        <div className="h-full flex-1 min-h-0 flex flex-col gap-1.5 [@media(min-height:560px)]:gap-2 overflow-hidden">
          <div className="h-full flex-1 min-h-0 grid grid-cols-3 grid-rows-2 gap-1.5 [@media(min-height:560px)]:gap-2 overflow-hidden">
            {visibleMilestones.map((m) => {
              const loc = getLocalizedMilestone(m, lang);
              const val = getMilestoneCurrentValue(shop, m);
              const claimed = shop.claimedMilestoneIds.includes(m.id);
              const ready = !claimed && val >= m.target;
              const pct = Math.min(100, Math.round((val / m.target) * 100));
              return (
                <div
                  key={m.id}
                  className={`rounded-xl border p-1.5 [@media(min-height:560px)]:p-2 flex flex-col justify-between min-h-0 overflow-hidden ${
                    claimed
                      ? 'border-emerald-500/25 bg-emerald-500/6 opacity-75'
                      : ready
                      ? 'border-amber-400 bg-amber-500/12'
                      : 'border-white/10 bg-[#151D28]'
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10.5px] font-extrabold text-slate-100 truncate">
                        {loc.title}
                      </span>
                      <span className="font-mono text-[9.5px] font-bold text-emerald-400 shrink-0 tabular-nums">
                        +{formatTRY(m.rewardCash)}
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-400 line-clamp-1 [@media(min-height:540px)]:line-clamp-2 mt-0.5 leading-tight">
                      {loc.description}
                    </p>
                  </div>

                  <div className="shrink-0 space-y-1 tabular-nums">
                    <div className="flex justify-between text-[9px] font-mono">
                      <span className="text-slate-400 truncate">
                        {m.metric === 'totalProfitEarned'
                          ? `${formatTRY(Math.min(val, m.target))} / ${formatTRY(m.target)}`
                          : `${Math.min(val, m.target)} / ${m.target}`}
                      </span>
                      <span className="text-amber-300 shrink-0">
                        +{m.rewardXp}XP · {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-amber-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {claimed ? (
                      <div className="text-center text-[9.5px] font-bold text-emerald-400">
                        ✓ {bi('Tamamlandı', 'Completed')}
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={!ready}
                        onClick={() => onClaimMilestone(m.id)}
                        className="w-full rounded-md bg-amber-500 py-0.5 text-[9.5px] font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-35 cursor-pointer"
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

          <div className="shrink-0 flex items-center justify-between gap-2 text-[10.5px] px-1">
            <span className="font-mono text-[10px] text-slate-400">
              {bi('Tamamlanan', 'Completed')}:{' '}
              <strong className="text-emerald-300">
                {shop.claimedMilestoneIds.length} / {CAREER_MILESTONES.length}
              </strong>
            </span>
            <div className="flex items-center gap-2">
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
            <span className="hidden sm:inline font-mono text-[10px] text-amber-300/90">
              {totalMsPages} {bi('Sayfa', 'Pages')}
            </span>
          </div>
        </div>
      )}

      {/* TAB 4: CAPITAL & BUSINESS ROADMAP (STRICT ZERO SCROLL) */}
      {subTab === 'ROADMAP' && (
        <div className="h-full flex-1 min-h-0 flex flex-col gap-1.5 [@media(min-height:560px)]:gap-2 overflow-hidden">
          <div className="shrink-0 grid grid-cols-4 gap-1.5 [@media(min-height:560px)]:gap-2">
            {CORE_LICENSE_IDS.map((id) => {
              const raw = SHOP_UPGRADES.find((u) => u.id === id)!;
              const loc = getLocalizedUpgrade(id, lang);
              const owned = shop.upgrades.includes(id);
              return (
                <div
                  key={id}
                  className={`rounded-xl border p-1.5 [@media(min-height:560px)]:p-2 flex flex-col justify-between gap-0.5 overflow-hidden ${
                    owned
                      ? 'border-emerald-400/40 bg-emerald-500/10'
                      : 'border-amber-400/25 bg-[#151D28]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-extrabold text-slate-100 truncate">
                      {loc.name}
                    </span>
                    {owned ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    ) : (
                      <Lock className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                    )}
                  </div>
                  <p className="hidden [@media(min-height:520px)]:block text-[9px] text-slate-400 line-clamp-1 leading-tight">
                    {loc.benefitText}
                  </p>
                  <div className="font-mono text-[9.5px] font-extrabold text-amber-300 tabular-nums truncate">
                    {owned ? bi('✓ Aktif', '✓ Active') : formatTRY(raw.cost)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="h-full flex-1 min-h-0 grid grid-cols-3 grid-rows-2 gap-1.5 [@media(min-height:560px)]:gap-2 overflow-hidden">
            {([1, 2, 3, 4, 5, 6] as ShopTier[]).map((t) => {
              const raw = SHOP_TIERS[t];
              const loc = getLocalizedShopTier(t, lang);
              const reached = shop.shopTier >= t;
              const isCurrent = shop.shopTier === t;
              return (
                <div
                  key={t}
                  className={`rounded-xl border p-1.5 [@media(min-height:560px)]:p-2.5 flex flex-col justify-between min-h-0 overflow-hidden ${
                    isCurrent
                      ? 'border-amber-400 bg-amber-500/12'
                      : reached
                      ? 'border-emerald-500/35 bg-emerald-500/8'
                      : 'border-white/8 bg-[#131A24]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-[10px] font-extrabold text-amber-300 truncate">
                      {bi(`${t}. DÜKKAN`, `T${t}`)} · {loc.name}
                    </span>
                    {reached ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    ) : (
                      <span className="font-mono text-[9.5px] font-bold text-slate-300 tabular-nums shrink-0">
                        {formatTRY(raw.cost)}
                      </span>
                    )}
                  </div>
                  <div className="text-[9px] [@media(min-height:540px)]:text-[9.5px] text-slate-300 leading-tight line-clamp-1 [@media(min-height:520px)]:line-clamp-2">
                    {loc.unlocksText}
                  </div>
                  <div className="text-[9px] font-mono text-slate-400 tabular-nums truncate">
                    {t === 1
                      ? bi('Başlangıç · 6 Müşteri/g', 'Starter · 6 Cust/d')
                      : `${raw.minReputation.toFixed(1)}★ · ${raw.dailyCustomers} ${bi('Müş/g', 'C/d')} · ${raw.showcaseSlots} ${bi('Raf', 'Slots')}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: PHONE MODEL COLLECTION (4x2 PAGINATED, STRICT ZERO SCROLL) */}
      {subTab === 'COLLECTION' && (
        <div className="h-full flex-1 min-h-0 flex flex-col gap-1.5 [@media(min-height:560px)]:gap-2 overflow-hidden">
          <div className="h-full flex-1 min-h-0 grid grid-cols-4 grid-rows-2 gap-1.5 [@media(min-height:560px)]:gap-2 overflow-hidden">
            {visibleModels.map((spec) => {
              const discovered = shop.discoveredSpecIds.includes(spec.id);
              return (
                <div
                  key={spec.id}
                  className={`rounded-xl border p-1.5 [@media(min-height:560px)]:p-2 flex flex-col justify-between min-h-0 overflow-hidden ${
                    discovered
                      ? 'border-amber-400/35 bg-[#151D28]'
                      : 'border-white/8 bg-[#111720] opacity-60'
                  }`}
                >
                  <div className="shrink-0 flex items-center justify-between gap-1">
                    <span className="text-[10px] [@media(min-height:560px)]:text-[11px] font-extrabold text-slate-100 truncate">
                      {discovered ? `${spec.brand} ${spec.model}` : '???'}
                    </span>
                    <span className="font-mono text-[9px] text-slate-400 shrink-0">
                      {spec.storage}
                    </span>
                  </div>

                  <div className="flex-1 min-h-0 my-0.5 [@media(min-height:540px)]:my-1 rounded-lg border border-white/6 bg-[#0D131C] p-1 flex items-center justify-center overflow-hidden">
                    <PhoneModelThumb
                      spec={spec}
                      showBack
                      silhouette={!discovered}
                      className="h-full max-h-10 [@media(min-height:540px)]:max-h-20 w-auto"
                    />
                  </div>

                  <div className="shrink-0 flex items-center justify-between text-[9.5px] tabular-nums">
                    <span className="text-slate-400 uppercase font-mono truncate">
                      {spec.tier}
                    </span>
                    <span className="font-mono font-bold text-amber-300 shrink-0">
                      {discovered ? formatTRY(spec.baseValue) : '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="shrink-0 flex items-center justify-center gap-2 text-[10.5px]">
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
      {/* TAB 6: INFINITE PRESTIGE & PERMANENT PERKS */}
      {subTab === 'PRESTIGE' && (
        <div className="h-full flex-1 min-h-0 grid grid-cols-12 gap-1.5 [@media(min-height:560px)]:gap-2 overflow-hidden">
          {/* Left: Prestige Cycle Status & Reset Trigger */}
          <div className="h-full col-span-5 rounded-xl border border-amber-400/30 bg-[#151D28] p-2 [@media(min-height:560px)]:p-2.5 flex flex-col justify-between gap-1.5 min-h-0 overflow-hidden tabular-nums">
            <div className="min-h-0 space-y-1.5 overflow-hidden">
              <div className="flex items-center justify-between gap-1">
                <span className="inline-flex items-center gap-1 font-display text-[11px] [@media(min-height:560px)]:text-xs font-extrabold text-amber-300 truncate">
                  <Crown className="w-3.5 h-3.5 shrink-0" />
                  {bi(`Prestij #${prestigeLevel}`, `Prestige #${prestigeLevel}`)}
                </span>
                <span className="font-mono text-[10.5px] font-extrabold text-emerald-300 shrink-0">
                  {prestigePoints} PP
                </span>
              </div>
              <p className="hidden [@media(min-height:540px)]:block text-[10px] text-slate-300 leading-snug line-clamp-2">
                {bi(
                  'Hedef nakde ulaştığında dükkanı yeni bir döneme sıfırla; Prestij Puanı (PP) kazan, kalıcı avantajlar aç!',
                  'Reach the cash target to reset into a new Prestige cycle; earn PP and unlock permanent upgrades!'
                )}
              </p>

              {/* Structured 3-Gate Prestige Requirements (Cash + Shop Tier + Level) */}
              <div className="rounded-lg border border-white/10 bg-[#0E141D] p-1.5 [@media(min-height:560px)]:p-2 space-y-1">
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 truncate">
                  {bi(`Prestij #${prestigeLevel + 1} Şartları`, `Prestige #${prestigeLevel + 1} Goals`)}
                </div>

                {/* Gate 1: Cash */}
                <div>
                  <div className="flex justify-between text-[9.5px] gap-1">
                    <span className={`truncate ${shop.cash >= prestigeTarget ? 'text-emerald-300 font-semibold' : 'text-slate-300'}`}>
                      {shop.cash >= prestigeTarget ? '✓ ' : '• '}
                      {bi('Kasa', 'Cash')}
                    </span>
                    <span className="font-mono font-bold text-amber-300 shrink-0">
                      {formatTRY(shop.cash)} / {formatTRY(prestigeTarget)}
                    </span>
                  </div>
                  <div className="mt-0.5 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        shop.cash >= prestigeTarget ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.round((shop.cash / prestigeTarget) * 100))}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Gate 2 & 3: Shop Tier + Level */}
                <div className="grid grid-cols-2 gap-1 text-[9.5px]">
                  <div
                    className={`rounded-md border px-1.5 py-0.5 flex items-center justify-between ${
                      shop.shopTier >= prestigeReq.minShopTier
                        ? 'border-emerald-400/40 bg-emerald-500/12 text-emerald-300'
                        : 'border-white/10 bg-[#141C27] text-slate-300'
                    }`}
                  >
                    <span className="truncate">{bi('Dükkan', 'Shop')}</span>
                    <strong className="font-mono shrink-0">
                      {shop.shopTier}/{prestigeReq.minShopTier}
                    </strong>
                  </div>
                  <div
                    className={`rounded-md border px-1.5 py-0.5 flex items-center justify-between ${
                      shop.level >= prestigeReq.minLevel
                        ? 'border-emerald-400/40 bg-emerald-500/12 text-emerald-300'
                        : 'border-white/10 bg-[#141C27] text-slate-300'
                    }`}
                  >
                    <span className="truncate">{bi('Seviye', 'Lvl')}</span>
                    <strong className="font-mono shrink-0">
                      {shop.level}/{prestigeReq.minLevel}
                    </strong>
                  </div>
                </div>

                <div className="flex justify-between text-[9px] text-slate-400 pt-0.5 border-t border-white/8">
                  <span>
                    {bi('Gelir', 'Bonus')}:{' '}
                    <strong className="text-emerald-300">+%{prestigeMultPct}</strong>
                  </span>
                  <span>
                    {bi('Ödül', 'Earn')}:{' '}
                    <strong className="text-amber-300">
                      {prestigeReady ? `+${prestigeEarnedPreview} PP` : bi('Bekleniyor', 'Pending')}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="hidden [@media(min-height:480px)]:block text-[9.5px] text-slate-300 space-y-0.5 leading-tight">
                <div className="truncate">
                  <strong className="text-emerald-300">{bi('Korunan:', 'Kept:')}</strong>{' '}
                  {bi('Sv., Müze, Gardırop, Katalog, Prestij.', 'Lv., Museum, Wardrobe, Catalog, Perks.')}
                </div>
                <div className="truncate">
                  <strong className="text-rose-300">{bi('Sıfırlanan:', 'Reset:')}</strong>{' '}
                  {bi('Gün 1, Dükkan 1, Stok, Nakit.', 'Day 1, Shop 1, Stock, Cash.')}
                </div>
              </div>
            </div>

            <div className="shrink-0">
              {!confirmPrestige ? (
                <button
                  type="button"
                  disabled={!prestigeReady}
                  onClick={() => setConfirmPrestige(true)}
                  className="w-full inline-flex items-center justify-center gap-1 rounded-xl bg-amber-500 py-1.5 text-[10px] [@media(min-height:560px)]:text-[11px] font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-35 cursor-pointer truncate px-2"
                >
                  <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    {prestigeReady
                      ? bi(`Prestij Yap (+${prestigeEarnedPreview} PP)`, `Prestige (+${prestigeEarnedPreview} PP)`)
                      : bi(`3 Şartı Tamamla (${formatTRY(prestigeTarget)})`, `Meet All 3 Goals (${formatTRY(prestigeTarget)})`)}
                  </span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setConfirmPrestige(false)}
                    className="rounded-xl border border-white/12 bg-[#1D2634] py-1.5 text-[10.5px] font-bold text-slate-200 cursor-pointer"
                  >
                    {bi('Vazgeç', 'Cancel')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmPrestige(false);
                      onTriggerPrestige();
                    }}
                    className="rounded-xl bg-emerald-500 py-1.5 text-[10.5px] font-extrabold text-slate-950 hover:bg-emerald-400 cursor-pointer"
                  >
                    {bi(`Onayla (+${prestigeEarnedPreview} PP)`, `Confirm (+${prestigeEarnedPreview} PP)`)}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: 2x2 Permanent Prestige Perks */}
          <div className="h-full col-span-7 grid grid-cols-2 grid-rows-2 gap-1.5 [@media(min-height:560px)]:gap-2 min-h-0 overflow-hidden">
            {PRESTIGE_PERKS.map((perk) => {
              const owned = prestigePerks.includes(perk.id);
              const canAfford = prestigePoints >= perk.cost;
              return (
                <div
                  key={perk.id}
                  className={`rounded-xl border p-1.5 [@media(min-height:560px)]:p-2.5 flex flex-col justify-between min-h-0 overflow-hidden ${
                    owned
                      ? 'border-emerald-400/45 bg-emerald-500/10'
                      : 'border-white/10 bg-[#151D28]'
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] [@media(min-height:560px)]:text-xs font-extrabold text-slate-100 truncate">
                        {lang === 'en' ? perk.enName : perk.trName}
                      </span>
                      <span className="font-mono text-[10px] font-extrabold text-amber-300 shrink-0 tabular-nums">
                        {owned ? '✓' : `${perk.cost} PP`}
                      </span>
                    </div>
                    <p className="text-[9.5px] [@media(min-height:560px)]:text-[10px] text-slate-300 mt-0.5 leading-tight line-clamp-2 [@media(min-height:540px)]:line-clamp-3">
                      {lang === 'en' ? perk.enEffect : perk.trEffect}
                    </p>
                  </div>
                  {owned ? (
                    <div className="shrink-0 text-center text-[10px] font-extrabold text-emerald-300 py-0.5">
                      ✓ {bi('Kalıcı Aktif', 'Permanently Active')}
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => onBuyPrestigePerk(perk.id)}
                      className="shrink-0 w-full rounded-lg bg-amber-500 py-1 [@media(min-height:560px)]:py-1.5 text-[10px] font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-35 cursor-pointer"
                    >
                      {canAfford
                        ? bi(`Kalıcı Aç (${perk.cost} PP)`, `Unlock (${perk.cost} PP)`)
                        : bi(`${perk.cost} PP Gerekli`, `Need ${perk.cost} PP`)}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WITTY "ESNAF DIPLOMASI" ACHIEVEMENT CARD MODAL */}
      {diplomaQuest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3"
          onClick={() => setDiplomaQuest(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[92dvh] overflow-y-auto pasaj-scroll rounded-2xl border-2 border-amber-400/70 bg-gradient-to-b from-[#1D1810] via-[#151B26] to-[#111720] p-3.5 sm:p-4 shadow-2xl space-y-2.5 sm:space-y-3 text-center relative"
          >
            <button
              type="button"
              onClick={() => setDiplomaQuest(null)}
              aria-label={bi('Kapat', 'Close')}
              className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-0.5">
              <div className="font-mono text-[9.5px] font-extrabold uppercase tracking-[0.18em] text-amber-400">
                {bi('PASAJ ESNAF ODASI RESMİ BELGESİ', 'ARCADE MERCHANTS GUILD CERTIFICATE')}
              </div>
              <h3 className="font-display text-sm [@media(min-height:560px)]:text-base font-extrabold text-amber-200">
                {bi('ESNAF DİPLOMASI', 'MERCHANT DIPLOMA')}
              </h3>
              <div className="text-[10.5px] font-bold text-emerald-300">
                {playstyleInfo.diplomaTitle} · {bi(`Sv.${lvlProg.level}`, `Lv.${lvlProg.level}`)} · {rank}
              </div>
            </div>

            <div className="rounded-xl border border-amber-400/30 bg-[#0D131C]/90 px-3.5 py-2.5 space-y-1">
              <div className="text-[11px] font-extrabold text-slate-100">
                {getLocalizedQuest(diplomaQuest, lang).title}
              </div>
              <p className="text-[10.5px] [@media(min-height:560px)]:text-[11px] italic text-amber-100/95 leading-snug">
                “{getWittyDiplomaQuote(diplomaQuest)}”
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-[#0E141D] px-3 py-1.5 text-[11px] font-mono tabular-nums">
              <span className="text-slate-400">
                {bi('Mühür:', 'Seal:')} <strong className="text-amber-300">PASAJ GSM #{shop.day}</strong>
              </span>
              <span className="text-emerald-300 font-extrabold">
                +{formatTRY(diplomaQuest.reward)} · +{diplomaQuest.xpReward} XP
              </span>
            </div>

            <button
              type="button"
              onClick={() => setDiplomaQuest(null)}
              className="w-full rounded-xl bg-amber-500 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-400 cursor-pointer"
            >
              {bi('Diplomayı Duvara As (Kapat)', 'Frame on Shop Wall (Close)')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
