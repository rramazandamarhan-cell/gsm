import { useCallback, useEffect, useState } from 'react';
import {
  BarChart3,
  Building2,
  Newspaper,
  Package,
  Pause,
  RotateCw,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Target,
  Users,
  Volume2,
  VolumeX,
  Wrench,
  X,
} from 'lucide-react';
import { AchievementBadgeToast } from './components/AchievementBadgeToast';
import { BrandLogo } from './components/BrandLogo';
import { ComplaintArchiveModal } from './components/ComplaintArchiveModal';
import { CounterView } from './components/CounterView';
import {
  CLASSIFIED_COD_FEE,
  CLASSIFIED_ONSITE_FEE,
  EmpireView,
} from './components/EmpireView';
import { InspectionOverlay } from './components/InspectionOverlay';
import { MiniRepairModal } from './components/MiniRepairModal';
import { MissionsView } from './components/MissionsView';
import {
  AnalyticsModal,
  DaySummaryModal,
  EndModal,
  PauseModal,
} from './components/Modals';
import { MorningNewspaperModal } from './components/MorningNewspaperModal';
import { OfflineEarningsModal } from './components/OfflineEarningsModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SplashScreen } from './components/SplashScreen';
import {
  ComplianceTab,
  StoreComplianceModal,
} from './components/StoreComplianceModal';
import { StoryIntroModal } from './components/StoryIntroModal';
import { TitleScreen } from './components/TitleScreen';
import { UpgradesView } from './components/UpgradesView';
import { WarrantyCertificateModal } from './components/WarrantyCertificateModal';
import {
  EXPRESS_ACCESSORY_FEE,
  EXPRESS_PHONE_FEE,
  WholesaleView,
} from './components/WholesaleView';
import { BOX_KIT_COST, WorkshopView } from './components/WorkshopView';
import {
  BRAND_DISTRIBUTORS,
  CAREER_MILESTONES,
  CITY_BRANCHES,
  DAILY_STREAK_REWARDS,
  DEAL_ACCEPTED_LINES,
  DEFECT_CATALOG,
  EARNINGS_BADGE_TIERS,
  LEGACY_PATHS,
  MUSEUM_ITEMS,
  PLAYER_OUTFITS,
  RADIO_STATIONS_META,
  SHOP_DECORATIONS,
  SHOP_STAFF,
  SHOP_TIERS,
  SHOP_UPGRADES,
  SHOWCASE_UPGRADE_MAX_LEVEL,
  SPARE_PARTS_CATALOG,
  STAFF_MAX_LEVEL,
  STORE_ACHIEVEMENTS,
  STORY_CHAPTERS,
  VICTORY_CASH_GOAL,
  getShowcaseUpgradeCost,
  getStaffTrainingCost,
  getStaffTrainingDays,
} from './game/catalog';
import {
  advanceDailyQuests,
  advanceDayTimers,
  advanceStaffRepairsOnTurn,
  applyBluffOrPitchTactic,
  applyBuyerDisclosureTactic,
  applyDefectLeverage,
  applyEventEffectToEncounter,
  applyLegacyDialogueTactic,
  applyMasterTechEndOfDay,
  applyPosInstallmentTactic,
  applyTeaTactic,
  buildDayHistoryEntry,
  buildDevicePartBreakdown,
  buildWittyEsnafReportNote,
  calculateMarketValue,
  calculateMasterDelegateCost,
  calculatePrestige,
  calculateSaleTax,
  checkVictoryCondition,
  clearSavedShopState,
  computeOfflineEarnings,
  countClaimableRewards,
  createAccessoryBuyerEncounter,
  createBuyerEncounter,
  createEmptyDayStats,
  createInitialShopState,
  createSellerEncounter,
  createTradeInEncounter,
  detectPlayerPlaystyle,
  evaluateClassifiedHaggle,
  evaluateCrossSellPitch,
  evaluatePlayerOffer,
  evaluatePostPurchaseSurprise,
  executePrestigeReset,
  formatTRY,
  generateBrandNewPhone,
  generateCertificateNumber,
  generateCustomerReview,
  generateDailyAuctionLots,
  generateDailyQueue,
  generateDailyQuests,
  generateFlashWholesaleDeal,
  generateOnlineClassifieds,
  generateShippingOrders,
  generateSundayKermes,
  getAccessorySpec,
  getAccessoryWholesaleCost,
  getCrossSellBonusChance,
  getDailyRent,
  getDailyStaffWages,
  getEffectiveLoanTerms,
  getLevelFromXp,
  getLevelUpBonusCash,
  getMasterCraftBonusPercent,
  getMasterTechSpecs,
  getMilestoneCurrentValue,
  getMultiRepairCost,
  getPrestigePointsEarned,
  getQuickRepairExpressFee,
  getRepairCostWithStock,
  getScrapSaleValue,
  getShopRank,
  getSparePartForDefect,
  getStoryChapterCurrentValue,
  getStreakBonusCash,
  getWeekdayInfo,
  hasAccessoryLicense,
  hasBrandNewLicense,
  inspectPhoneCategory,
  isAccessoryUnlocked,
  loadShopState,
  maybeTriggerRandomStoreEvent,
  pickDailyNewspaper,
  pickDailyWholesaleDiscountBrand,
  PRESTIGE_PERKS,
  processEmpireEndOfDay,
  roundPrice,
  saveShopState,
  simulateEndOfDayAccessorySales,
  tickRivalFlashSnatch,
} from './game/engine';
import { soundFX } from './game/sound';
import { requestNativeStoreReview, triggerHaptic } from './game/storeBridge';
import {
  AccessoryId,
  AchievementBadgeNotification,
  BankLoanOffer,
  BranchId,
  CustomerComplaintRecord,
  DailyQuestKind,
  DecorationId,
  DefectId,
  FloatingFeedback,
  GameScreen,
  InspectionCategory,
  InspectionOverlayData,
  LegacyPathId,
  MuseumItemId,
  NegotiationTone,
  OfflineEarningsSummary,
  OutfitId,
  PendingWholesaleOrder,
  PhoneDevice,
  PhoneModelSpec,
  PrestigePerkId,
  RadioStationId,
  RepairQuality,
  ShopState,
  ShopTab,
  ShopTier,
  SoldPhoneRecord,
  SparePartId,
  StaffId,
  StaffRepairJob,
  TimedProject,
  UpgradeId,
} from './game/types';

import { getLocalizedAccessory, useLanguage } from './game/i18n';

interface ActiveMiniRepairJob {
  mode: 'INVENTORY' | 'EXPRESS';
  phone: PhoneDevice;
  defectIds: DefectId[];
  cost: number;
}

const CATEGORY_LABELS: Record<InspectionCategory, string> = {
  screen: 'Ekran & Kasa Ekspertizi',
  battery: 'Pil & Devir Ekspertizi',
  imei: 'IMEI & BTK Sorgusu',
  hardware: 'Sıvı & Sensör Analizi',
};

export default function App() {
  const { lang, setLang, bi } = useLanguage();
  const [showSplash, setShowSplash] = useState(true);
  const [screen, setScreen] = useState<GameScreen>('TITLE_MENU');
  const [savedSnapshot, setSavedSnapshot] = useState<ShopState | null>(() =>
    loadShopState()
  );
  const [shop, setShop] = useState<ShopState>(() => createInitialShopState());
  const [activeTab, setActiveTab] = useState<ShopTab>('COUNTER');
  const [muted, setMuted] = useState(false);
  const [feedbacks, setFeedbacks] = useState<FloatingFeedback[]>([]);
  const [shakeTrigger, setShakeTrigger] = useState(0);

  // Framer Motion Inspection Magnifier + HATA Overlay state
  const [inspectionOverlay, setInspectionOverlay] =
    useState<InspectionOverlayData | null>(null);

  // Interactive Multi-Defect Mini-Repair Modal state
  const [miniRepairJob, setMiniRepairJob] = useState<ActiveMiniRepairJob | null>(
    null
  );

  // Mid-day overlays for re-reading Morning Newspaper, live D3 Analytics, Store Compliance & Offline Idle Earnings
  const [showNewspaperReview, setShowNewspaperReview] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [showComplaintArchive, setShowComplaintArchive] = useState(false);
  const [activeWarrantyModal, setActiveWarrantyModal] = useState<{
    record: SoldPhoneRecord;
    mode: 'HANDOVER' | 'INSPECT';
  } | null>(null);
  const [complianceInitialTab, setComplianceInitialTab] =
    useState<ComplianceTab>('SETTINGS');
  const [complianceInitialLegal, setComplianceInitialLegal] = useState<
    'privacy' | 'terms'
  >('privacy');
  const openComplianceModal = useCallback(
    (tab: ComplianceTab = 'SETTINGS', legal: 'privacy' | 'terms' = 'privacy') => {
      setComplianceInitialTab(tab);
      setComplianceInitialLegal(legal);
      setShowComplianceModal(true);
    },
    []
  );
  const [offlineSummary, setOfflineSummary] =
    useState<OfflineEarningsSummary | null>(null);
  const [isPortraitMobile, setIsPortraitMobile] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.innerWidth < 640 && window.innerHeight > window.innerWidth
      : false
  );
  const [portraitHintDismissed, setPortraitHintDismissed] = useState(false);

  const attemptLandscapeLock = useCallback(async (withFullscreen = false) => {
    try {
      if (withFullscreen && document.documentElement.requestFullscreen && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen().catch(() => {});
      }
      const orientation = window.screen.orientation as unknown as {
        lock?: (mode: string) => Promise<void>;
      };
      if (orientation?.lock) {
        await orientation.lock('landscape').catch(() => {});
      }
    } catch {
      // Some mobile browsers require native APK/PWA context to lock orientation
    }
  }, []);

  useEffect(() => {
    const checkOrientation = () => {
      const portrait = window.innerWidth < 640 && window.innerHeight > window.innerWidth;
      setIsPortraitMobile(portrait);
      if (!portrait) setPortraitHintDismissed(false);
    };
    checkOrientation();
    void attemptLandscapeLock(false);

    const onFirstGesture = () => {
      void attemptLandscapeLock(false);
    };
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    window.addEventListener('pointerdown', onFirstGesture, { once: true });
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
      window.removeEventListener('pointerdown', onFirstGesture);
    };
  }, [attemptLandscapeLock]);

  const [badgeQueue, setBadgeQueue] = useState<AchievementBadgeNotification[]>([]);

  const pushBadgeNotification = useCallback(
    (badge: Omit<AchievementBadgeNotification, 'id'>) => {
      const id = `badge_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      setBadgeQueue((prev) => [...prev.slice(-4), { ...badge, id }]);
      soundFX.playQuestClaim();
    },
    []
  );

  const dismissCurrentBadge = useCallback(() => {
    setBadgeQueue((prev) => prev.slice(1));
  }, []);

  // Automatically unlock & announce Store Achievements and Earnings Threshold Badges
  useEffect(() => {
    if (screen !== 'PLAYING' && screen !== 'DAY_SUMMARY') return;

    // Silent migration for pre-badge saves so old careers don't spam historical popups
    if (
      shop.unlockedAchievementIds === undefined ||
      shop.unlockedEarningsBadges === undefined
    ) {
      const alreadyAch = STORE_ACHIEVEMENTS.filter((a) => a.check(shop)).map((a) => a.id);
      const peakMetric = Math.max(shop.cash, shop.totalProfitEarned);
      const alreadyEarn = EARNINGS_BADGE_TIERS.filter(
        (t) => peakMetric >= t.threshold
      ).map((t) => t.id);
      setShop((prev) => ({
        ...prev,
        unlockedAchievementIds: prev.unlockedAchievementIds ?? alreadyAch,
        unlockedEarningsBadges: prev.unlockedEarningsBadges ?? alreadyEarn,
      }));
      return;
    }

    const newAchievements = STORE_ACHIEVEMENTS.filter(
      (a) => !shop.unlockedAchievementIds!.includes(a.id) && a.check(shop)
    );
    const peakMetric = Math.max(shop.cash, shop.totalProfitEarned);
    const newEarnings = EARNINGS_BADGE_TIERS.filter(
      (t) => !shop.unlockedEarningsBadges!.includes(t.id) && peakMetric >= t.threshold
    );

    if (newAchievements.length === 0 && newEarnings.length === 0) return;

    setShop((prev) => ({
      ...prev,
      unlockedAchievementIds: [
        ...(prev.unlockedAchievementIds ?? []),
        ...newAchievements.map((a) => a.id),
      ],
      unlockedEarningsBadges: [
        ...(prev.unlockedEarningsBadges ?? []),
        ...newEarnings.map((t) => t.id),
      ],
    }));

    for (const tier of newEarnings) {
      pushBadgeNotification({
        kicker: 'KAZANÇ EŞİĞİ ROZETİ',
        title: tier.title,
        subtitle: tier.subtitle,
        accent: 'gold',
        icon: 'coins',
      });
    }
    for (const ach of newAchievements) {
      pushBadgeNotification({
        kicker: `BAŞARIM ROZETİ · +${ach.points}P`,
        title: ach.title,
        subtitle: ach.description,
        accent: 'sky',
        icon: 'trophy',
      });
    }
  }, [shop, screen, pushBadgeNotification]);

  const pushFeedback = useCallback(
    (text: string, tone: FloatingFeedback['tone'] = 'amber') => {
      const id = `fb_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      setFeedbacks((prev) => [...prev.slice(-3), { id, text, tone }]);
      window.setTimeout(() => {
        setFeedbacks((prev) => prev.filter((item) => item.id !== id));
      }, 1550);
    },
    []
  );

  const applyXpGain = useCallback(
    (state: ShopState, xpDelta: number): ShopState => {
      if (xpDelta <= 0) return state;
      const pacedDelta = Math.max(4, Math.round(xpDelta * 0.55));
      const crmBoosted = state.upgrades.includes('cloud_crm')
        ? Math.round(pacedDelta * 1.15)
        : pacedDelta;
      const prestigeXpBoosted = (state.prestigePerks ?? []).includes('vip_network')
        ? Math.round(crmBoosted * 1.3)
        : crmBoosted;
      const nextXp = state.xp + prestigeXpBoosted;
      const nextLevel = getLevelFromXp(nextXp);
      if (nextLevel > state.level) {
        let bonusCash = 0;
        for (let lv = state.level + 1; lv <= nextLevel; lv += 1) {
          bonusCash += getLevelUpBonusCash(lv);
        }
        window.setTimeout(() => {
          soundFX.playDayComplete();
          pushFeedback(
            `SEVİYE ATLADIN! Sv.${nextLevel} (+${formatTRY(bonusCash)} Bonus)`,
            'positive'
          );
          pushBadgeNotification({
            kicker: `ESNAF SEVİYE ${nextLevel}`,
            title: `+${formatTRY(bonusCash)} Seviye Bonusu!`,
            subtitle: 'Pasajdaki ustalığın ve kasa itibarın yükseldi!',
            accent: 'gold',
            icon: 'trophy',
          });
        }, 260);
        return {
          ...state,
          xp: nextXp,
          level: nextLevel,
          cash: state.cash + bonusCash,
          todayStats: {
            ...state.todayStats,
            questRewards: state.todayStats.questRewards + bonusCash,
          },
        };
      }
      return {
        ...state,
        xp: nextXp,
        level: nextLevel,
      };
    },
    [pushBadgeNotification, pushFeedback]
  );

  const applyQuestProgress = useCallback(
    (state: ShopState, kind: DailyQuestKind, amount = 1): ShopState => {
      const res = advanceDailyQuests(state.dailyQuests, kind, amount);
      if (res.newlyReadyTitles.length > 0) {
        window.setTimeout(() => {
          soundFX.playScanOk();
          pushFeedback(
            `Görev Hazır: ${res.newlyReadyTitles[0]} — Ödülünü Topla!`,
            'positive'
          );
        }, 180);
      }
      return {
        ...state,
        dailyQuests: res.updatedQuests,
      };
    },
    [pushFeedback]
  );

  const discoverSpec = (specIds: string[], newId: string): string[] =>
    specIds.includes(newId) ? specIds : [...specIds, newId];

  useEffect(() => {
    if (
      screen === 'PLAYING' ||
      screen === 'MORNING_NEWS' ||
      screen === 'DAY_SUMMARY' ||
      screen === 'PAUSED'
    ) {
      saveShopState(shop);
      setSavedSnapshot(shop);
    }
  }, [shop, screen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (miniRepairJob) {
        if (e.key === 'Escape') setMiniRepairJob(null);
        return;
      }
      if (
        showNewspaperReview ||
        showAnalyticsModal ||
        screen === 'MORNING_NEWS' ||
        screen === 'STORY_INTRO'
      ) {
        return;
      }
      if (inspectionOverlay) {
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
          e.preventDefault();
          setInspectionOverlay(null);
        }
        return;
      }

      if (screen === 'TITLE_MENU') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (savedSnapshot) {
            soundFX.playClick();
            const idle = computeOfflineEarnings(savedSnapshot);
            setShop(savedSnapshot);
            setActiveTab('COUNTER');
            setScreen('PLAYING');
            if (idle) setOfflineSummary(idle);
          } else {
            soundFX.playCashRegister();
            const fresh = createInitialShopState();
            setShop(fresh);
            setActiveTab('COUNTER');
            setScreen('STORY_INTRO');
          }
        }
        return;
      }

      const targetEl = e.target as HTMLElement | null;
      const isTypingTarget =
        targetEl instanceof HTMLInputElement ||
        targetEl instanceof HTMLTextAreaElement ||
        targetEl instanceof HTMLSelectElement ||
        Boolean(targetEl?.isContentEditable);

      if (e.key === 'Escape') {
        if (activeWarrantyModal) {
          soundFX.playClick();
          setActiveWarrantyModal(null);
        } else if (showComplaintArchive) {
          soundFX.playClick();
          setShowComplaintArchive(false);
        } else if (showComplianceModal) {
          soundFX.playClick();
          setShowComplianceModal(false);
        } else if (showAnalyticsModal) {
          soundFX.playClick();
          setShowAnalyticsModal(false);
        } else if (showNewspaperReview) {
          soundFX.playClick();
          setShowNewspaperReview(false);
        } else if (screen === 'PLAYING') {
          soundFX.playClick();
          setScreen('PAUSED');
        } else if (screen === 'PAUSED') {
          soundFX.playClick();
          setScreen('PLAYING');
        }
        return;
      }

      if (
        isTypingTarget ||
        activeWarrantyModal ||
        showComplaintArchive ||
        showComplianceModal ||
        showAnalyticsModal ||
        showNewspaperReview ||
        miniRepairJob
      ) {
        return;
      }

      if (screen === 'PLAYING') {
        if (e.key === '1') {
          soundFX.playClick();
          setActiveTab('COUNTER');
        } else if (e.key === '2') {
          soundFX.playClick();
          setActiveTab('WORKSHOP');
        } else if (e.key === '3') {
          soundFX.playClick();
          setActiveTab('WHOLESALE');
        } else if (e.key === '4') {
          soundFX.playClick();
          setActiveTab('EMPIRE');
        } else if (e.key === '5') {
          soundFX.playClick();
          setActiveTab('MISSIONS');
        } else if (e.key === '6') {
          soundFX.playClick();
          setActiveTab('UPGRADES');
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    screen,
    savedSnapshot,
    miniRepairJob,
    inspectionOverlay,
    showNewspaperReview,
    showAnalyticsModal,
    showComplianceModal,
  ]);

  const handleStartNew = () => {
    soundFX.playCashRegister();
    clearSavedShopState();
    const fresh = createInitialShopState();
    setShop(fresh);
    setSavedSnapshot(fresh);
    setActiveTab('COUNTER');
    setShowNewspaperReview(false);
    setShowAnalyticsModal(false);
    setOfflineSummary(null);
    setScreen('STORY_INTRO');
  };

  const handleContinue = () => {
    if (!savedSnapshot) {
      handleStartNew();
      return;
    }
    soundFX.playClick();
    const idle = computeOfflineEarnings(savedSnapshot);
    setShop(savedSnapshot);
    setActiveTab('COUNTER');
    setScreen('PLAYING');
    if (idle) {
      setOfflineSummary(idle);
    }
  };

  const handleClaimOfflineEarnings = (amount: number, doubled: boolean) => {
    soundFX.playCashRegister();
    pushFeedback(
      doubled
        ? `+${formatTRY(amount)} · 2x Gece Bereketi Kasada!`
        : `+${formatTRY(amount)} · Gece Geliri Kasada!`,
      'positive'
    );
    setShop((prev) => ({
      ...prev,
      cash: prev.cash + amount,
      lastSavedAt: Date.now(),
      todayStats: {
        ...prev.todayStats,
        branchIncome: (prev.todayStats.branchIncome ?? 0) + amount,
      },
    }));
    setOfflineSummary(null);
  };

  const handleToggleMute = () => {
    setMuted(soundFX.toggleMute());
  };

  useEffect(() => {
    soundFX.setAmbientEnabled(Boolean(shop.ambientSoundEnabled));
  }, [shop.ambientSoundEnabled]);

  // Sync Vintage Radio Web Audio engine with shop station & active screen
  useEffect(() => {
    const canPlay =
      (screen === 'PLAYING' || screen === 'MORNING_NEWS' || screen === 'DAY_SUMMARY') &&
      shop.activeDecorations.includes('vintage_radio');
    soundFX.setRadioStation(canPlay ? (shop.radioStation ?? 'OFF') : 'OFF');
  }, [shop.radioStation, shop.activeDecorations, screen]);

  const handleCycleRadio = () => {
    const order: RadioStationId[] = ['OFF', 'ARABESK', 'POP90'];
    const current = shop.radioStation ?? 'OFF';
    const next = order[(order.indexOf(current) + 1) % order.length];
    soundFX.playRadioStaticBurst();
    soundFX.setRadioStation(next);
    const meta = RADIO_STATIONS_META[next];
    if (next === 'OFF') {
      pushFeedback(bi('Eski Pasaj Radyosu kapatıldı.', 'Vintage Radio turned off.'), 'amber');
    } else {
      const sampleTrack = meta.tracks[Math.floor(Math.random() * meta.tracks.length)];
      pushFeedback(`📻 ${meta.freq} ${meta.labelTr} · ${sampleTrack}`, 'positive');
    }
    setShop((prev) => ({ ...prev, radioStation: next }));
  };

  const handleBuySparePart = (partId: SparePartId, qty: 1 | 5) => {
    const spec = SPARE_PARTS_CATALOG.find((p) => p.id === partId);
    if (!spec) return;
    const totalCost = qty === 5 ? spec.pack5Cost : spec.unitCost;
    if (shop.cash < totalCost) return;
    soundFX.playCashRegister();
    pushFeedback(
      `-${formatTRY(totalCost)} · +${qty} ${lang === 'en' ? spec.nameEn : spec.nameTr}`,
      'positive'
    );
    setShop((prev) => ({
      ...prev,
      cash: prev.cash - totalCost,
      spareParts: {
        screen: prev.spareParts?.screen ?? 0,
        battery: prev.spareParts?.battery ?? 0,
        board_kit: prev.spareParts?.board_kit ?? 0,
        [partId]: (prev.spareParts?.[partId] ?? 0) + qty,
      },
      todayStats: {
        ...prev.todayStats,
        wholesaleSpend: prev.todayStats.wholesaleSpend + totalCost,
      },
    }));
  };

  const handleDiscloseBuyer = () => {
    if (
      !currentEncounter ||
      currentEncounter.outcome !== 'ACTIVE' ||
      currentEncounter.buyerDisclosed ||
      (currentEncounter.type !== 'BUYER' && currentEncounter.type !== 'TRADE_IN')
    ) {
      return;
    }
    const { updatedEncounter, reputationBonus: reputationDelta } =
      applyBuyerDisclosureTactic(currentEncounter);
    soundFX.playScanOk();
    pushFeedback(
      bi(
        'Dürüst Beyan Verildi (+0.08★ İtibar · Şikayet Kalkanı!)',
        'Honest Disclosure (+0.08★ Rep · Return Shield!)'
      ),
      'positive'
    );
    setShop((prev) => {
      const nextQueue = [...prev.dailyQueue];
      nextQueue[prev.currentQueueIndex] = updatedEncounter;
      return {
        ...prev,
        reputation: Math.max(1, Math.min(5, prev.reputation + reputationDelta)),
        dailyQueue: nextQueue,
        todayStats: {
          ...prev.todayStats,
          reputationDelta: prev.todayStats.reputationDelta + reputationDelta,
        },
      };
    });
  };

  const currentEncounter =
    shop.currentQueueIndex < shop.dailyQueue.length
      ? shop.dailyQueue[shop.currentQueueIndex]
      : null;

  const updateCurrentEncounter = (
    updater: (
      enc: NonNullable<typeof currentEncounter>
    ) => NonNullable<typeof currentEncounter>
  ) => {
    setShop((prev) => {
      const enc = prev.dailyQueue[prev.currentQueueIndex];
      if (!enc) return prev;
      const nextQueue = [...prev.dailyQueue];
      nextQueue[prev.currentQueueIndex] = updater(enc);
      return { ...prev, dailyQueue: nextQueue };
    });
  };

  const handleInspect = (
    category: InspectionCategory,
    silentOverlay = false
  ) => {
    if (!currentEncounter || currentEncounter.outcome !== 'ACTIVE') return;
    const isTradeIn =
      currentEncounter.type === 'TRADE_IN' &&
      Boolean(currentEncounter.tradeInDevice);
    const targetDevice = isTradeIn
      ? currentEncounter.tradeInDevice!
      : currentEncounter.device;

    const wasAllChecked =
      targetDevice.inspected.screen &&
      targetDevice.inspected.battery &&
      targetDevice.inspected.imei &&
      targetDevice.inspected.hardware;

    const { updatedDevice, foundDefects } = inspectPhoneCategory(
      targetDevice,
      category
    );

    const isNowAllChecked =
      updatedDevice.inspected.screen &&
      updatedDevice.inspected.battery &&
      updatedDevice.inspected.imei &&
      updatedDevice.inspected.hardware;

    if (!silentOverlay) {
      // Trigger Framer Motion Magnifying Glass & HATA visual overlay!
      setInspectionOverlay({
        id: `insp_${Date.now()}`,
        category,
        categoryLabel: CATEGORY_LABELS[category],
        deviceName: `${targetDevice.brand} ${targetDevice.model}`,
        foundDefects,
      });

      window.setTimeout(() => {
        if (foundDefects.length > 0) {
          soundFX.playScanDefect();
          setShakeTrigger((n) => n + 1);
        } else {
          soundFX.playScanOk();
        }
      }, 360);
    } else if (foundDefects.length > 0) {
      setShakeTrigger((n) => n + 1);
    }

    setShop((prev) => {
      const enc = prev.dailyQueue[prev.currentQueueIndex];
      if (!enc) return prev;
      const nextQueue = [...prev.dailyQueue];
      nextQueue[prev.currentQueueIndex] = isTradeIn
        ? { ...enc, tradeInDevice: updatedDevice }
        : { ...enc, device: updatedDevice };
      let nextState: ShopState = {
        ...prev,
        dailyQueue: nextQueue,
        discoveredSpecIds: discoverSpec(prev.discoveredSpecIds, updatedDevice.specId),
      };
      if (!wasAllChecked && isNowAllChecked) {
        nextState = applyQuestProgress(nextState, 'INSPECT_FULL', 1);
        nextState = applyXpGain(nextState, 15);
      }
      return nextState;
    });
  };

  const handlePhysicalInspectBonus = () => {
    soundFX.playQuestClaim();
    pushFeedback(
      bi(
        'Dedektif Gözü · Fiziksel Büyüteç Ekspertizi Tamamlandı!',
        'Detective Eye · Physical Loupe Inspection Complete!'
      ),
      'amber'
    );
    setShop((prev) => applyXpGain(prev, 25));
  };

  const handleInspectAll = () => {
    if (!currentEncounter || currentEncounter.outcome !== 'ACTIVE') return;
    const isTradeIn =
      currentEncounter.type === 'TRADE_IN' &&
      Boolean(currentEncounter.tradeInDevice);
    const targetDevice = isTradeIn
      ? currentEncounter.tradeInDevice!
      : currentEncounter.device;

    const wasAllChecked =
      targetDevice.inspected.screen &&
      targetDevice.inspected.battery &&
      targetDevice.inspected.imei &&
      targetDevice.inspected.hardware;

    const updatedDevice = {
      ...targetDevice,
      inspected: { screen: true, battery: true, imei: true, hardware: true },
    };

    setInspectionOverlay({
      id: `insp_all_${Date.now()}`,
      category: 'hardware',
      categoryLabel: 'Pro Tam Ekspertiz Taraması',
      deviceName: `${updatedDevice.brand} ${updatedDevice.model}`,
      foundDefects: updatedDevice.defects,
    });

    window.setTimeout(() => {
      if (updatedDevice.defects.length > 0) {
        soundFX.playScanDefect();
        setShakeTrigger((n) => n + 1);
      } else {
        soundFX.playScanOk();
      }
    }, 360);

    setShop((prev) => {
      const enc = prev.dailyQueue[prev.currentQueueIndex];
      if (!enc) return prev;
      const nextQueue = [...prev.dailyQueue];
      nextQueue[prev.currentQueueIndex] = isTradeIn
        ? { ...enc, tradeInDevice: updatedDevice }
        : { ...enc, device: updatedDevice };
      let nextState: ShopState = {
        ...prev,
        dailyQueue: nextQueue,
        discoveredSpecIds: discoverSpec(prev.discoveredSpecIds, updatedDevice.specId),
      };
      if (!wasAllChecked) {
        nextState = applyQuestProgress(nextState, 'INSPECT_FULL', 1);
        nextState = applyXpGain(nextState, 15);
      }
      return nextState;
    });
  };

  const handleUseLeverage = (defectId: DefectId) => {
    if (!currentEncounter || currentEncounter.outcome !== 'ACTIVE') return;
    const prevPrice = currentEncounter.customerPrice;
    const targetDev =
      currentEncounter.type === 'TRADE_IN' && currentEncounter.tradeInDevice
        ? currentEncounter.tradeInDevice
        : currentEncounter.device;
    const def = DEFECT_CATALOG[defectId];
    const caughtLying =
      Boolean(targetDev.sellerClaim) &&
      targetDev.sellerClaimCategory === def.category;

    const updatedEnc = applyDefectLeverage(
      currentEncounter,
      defectId,
      shop.equippedOutfit
    );
    const delta = Math.abs(updatedEnc.customerPrice - prevPrice);

    if (caughtLying) {
      soundFX.playLieCaught();
      triggerHaptic(shop.hapticsEnabled, 'success');
      pushFeedback(
        currentEncounter.type === 'TRADE_IN'
          ? `YALAN YAKALANDI! Fark +${formatTRY(delta)} · 0 Sabır Kaybı!`
          : `YALAN YAKALANDI! Fiyat -${formatTRY(delta)} Kırıldı (0 Sabır Kaybı)!`,
        'positive'
      );
    } else {
      soundFX.playLeverage();
      triggerHaptic(shop.hapticsEnabled, 'medium');
      pushFeedback(
        currentEncounter.type === 'TRADE_IN'
          ? `Takas Kozu Vuruldu! Nakit Fark +${formatTRY(delta)} Arttı!`
          : `Koz Masaya Kondu! Fiyat -${formatTRY(delta)} Kırıldı!`,
        'amber'
      );
    }
    setShakeTrigger((n) => n + 1);
    setShop((prev) => {
      const nextQueue = [...prev.dailyQueue];
      nextQueue[prev.currentQueueIndex] = updatedEnc;
      const updated: ShopState = {
        ...prev,
        dailyQueue: nextQueue,
        totalDefectsExposed: prev.totalDefectsExposed + 1,
      };
      return applyQuestProgress(updated, 'USE_LEVERAGE', 1);
    });
  };

  const handleServeTea = () => {
    if (!currentEncounter || currentEncounter.outcome !== 'ACTIVE') return;
    soundFX.playTea();
    pushFeedback('Çay İkram Edildi · Sabır Arttı', 'positive');
    setShop((prev) => {
      const enc = prev.dailyQueue[prev.currentQueueIndex];
      if (!enc) return prev;
      const nextQueue = [...prev.dailyQueue];
      nextQueue[prev.currentQueueIndex] = applyTeaTactic(
        enc,
        prev.upgrades,
        prev.staff
      );
      const updated: ShopState = {
        ...prev,
        dailyQueue: nextQueue,
        totalTeasServed: prev.totalTeasServed + 1,
      };
      return applyQuestProgress(updated, 'SERVE_TEA', 1);
    });
  };

  const handleTeaBoilerFreshMotivation = () => {
    setShop((prev) => {
      const enc = prev.dailyQueue[prev.currentQueueIndex];
      if (!enc || enc.outcome !== 'ACTIVE') return prev;
      const nextQueue = [...prev.dailyQueue];
      const boostedMood = Math.min(100, enc.moodScore + 4);
      const boostedPatience = Math.min(100, enc.patience + 5);
      nextQueue[prev.currentQueueIndex] = {
        ...enc,
        moodScore: boostedMood,
        patience: boostedPatience,
        mood:
          boostedMood >= 82
            ? 'excited'
            : boostedMood >= 62
            ? 'happy'
            : boostedMood >= 40
            ? 'calm'
            : enc.mood,
      };
      return {
        ...prev,
        dailyQueue: nextQueue,
      };
    });
  };

  const handleBluffOrPitch = () => {
    if (!currentEncounter || currentEncounter.outcome !== 'ACTIVE') return;
    const { updatedEncounter, reputationDelta } =
      applyBluffOrPitchTactic(currentEncounter);
    if (updatedEncounter.outcome === 'WALKED_OUT') {
      soundFX.playAngryLeave();
      setShakeTrigger((n) => n + 1);
      pushFeedback('Blöf Tutmadı · Müşteri Kalktı!', 'negative');
    } else if (updatedEncounter.mood === 'annoyed') {
      soundFX.playScanDefect();
      setShakeTrigger((n) => n + 1);
      pushFeedback('Hamle Geri Tepti', 'negative');
    } else {
      soundFX.playLeverage();
      pushFeedback(
        currentEncounter.type === 'SELLER'
          ? 'Blöf Tuttu! Fiyat Kırıldı'
          : 'Güven Verildi! Teklif Arttı',
        'positive'
      );
    }

    setShop((prev) => {
      const nextQueue = [...prev.dailyQueue];
      nextQueue[prev.currentQueueIndex] = updatedEncounter;
      const nextRep = Math.max(1, Math.min(5, prev.reputation + reputationDelta));
      const nextReviews =
        updatedEncounter.outcome === 'WALKED_OUT'
          ? [
              generateCustomerReview(prev.day, updatedEncounter, prev.legacyPath),
              ...prev.reviews,
            ].slice(0, 12)
          : prev.reviews;
      return {
        ...prev,
        reputation: nextRep,
        dealStreak:
          updatedEncounter.outcome === 'WALKED_OUT' ? 0 : prev.dealStreak,
        dailyQueue: nextQueue,
        reviews: nextReviews,
        todayStats: {
          ...prev.todayStats,
          reputationDelta: prev.todayStats.reputationDelta + reputationDelta,
          dealsLost:
            prev.todayStats.dealsLost +
            (updatedEncounter.outcome === 'WALKED_OUT' ? 1 : 0),
        },
      };
    });
  };

  const handleUseLegacyDialogue = () => {
    if (
      !currentEncounter ||
      currentEncounter.outcome !== 'ACTIVE' ||
      currentEncounter.legacyDialogueUsed
    ) {
      return;
    }
    const { updatedEncounter, reputationDelta } = applyLegacyDialogueTactic(
      currentEncounter,
      shop.legacyPath
    );
    const legacyInfo = LEGACY_PATHS[shop.legacyPath];
    soundFX.playScanOk();
    pushFeedback(`${legacyInfo.dialogueName} Etkili Oldu!`, 'positive');

    setShop((prev) => {
      const nextQueue = [...prev.dailyQueue];
      nextQueue[prev.currentQueueIndex] = updatedEncounter;
      const nextRep = Math.max(1, Math.min(5, prev.reputation + reputationDelta));
      return {
        ...prev,
        reputation: nextRep,
        dailyQueue: nextQueue,
        todayStats: {
          ...prev.todayStats,
          reputationDelta: prev.todayStats.reputationDelta + reputationDelta,
        },
      };
    });
  };

  const handleAcceptPosInstallment = () => {
    if (
      !currentEncounter ||
      currentEncounter.outcome !== 'ACTIVE' ||
      !currentEncounter.wantsInstallment ||
      currentEncounter.posAccepted
    ) {
      return;
    }
    soundFX.playScanOk();
    pushFeedback('POS Taksit Kabul Edildi · Teklif Yükseldi!', 'positive');
    updateCurrentEncounter((enc) => applyPosInstallmentTactic(enc));
  };

  const handleResolveWarranty = (choice: 'REPAIR' | 'REFUND' | 'REJECT') => {
    if (
      !currentEncounter ||
      currentEncounter.type !== 'WARRANTY_CLAIM' ||
      currentEncounter.outcome !== 'ACTIVE'
    ) {
      return;
    }
    const repairCost = currentEncounter.warrantyRepairCost ?? 1000;
    const refundCost = currentEncounter.warrantyRefundCost ?? 1500;
    const recordId = currentEncounter.warrantyRecord?.id;

    if (choice === 'REPAIR' && shop.cash < repairCost) return;
    if (choice === 'REFUND' && shop.cash < refundCost) return;

    const cost = choice === 'REPAIR' ? repairCost : choice === 'REFUND' ? refundCost : 0;
    const repDelta = choice === 'REPAIR' ? 0.25 : choice === 'REFUND' ? 0.08 : -0.35;
    const playerMsg =
      choice === 'REPAIR'
        ? 'Malımızın arkasındayız kardeşim! Parçasını ücretsiz değiştirip hemen test edip veriyorum.'
        : choice === 'REFUND'
        ? 'Mağdur olmanı istemem, tamir masrafına karşılık kısmi nakit iadesi yapıyorum.'
        : 'Baktım cihaz darbe almış, bu kullanıcı hatası. Garanti kapsamına girmez!';
    const customerMsg =
      choice === 'REPAIR'
        ? 'Helal olsun usta, esnaf dediğin böyle olur! Bundan sonra tüm eş dostu sana yönlendireceğim!'
        : choice === 'REFUND'
        ? 'Eyvallah abi, en azından yarı yolda bırakmadın. Teşekkür ederim.'
        : 'Yazıklar olsun! Pasajdaki herkese ve internete bu rezaleti yazacağım!';

    if (choice === 'REJECT') {
      soundFX.playAngryLeave();
      setShakeTrigger((n) => n + 1);
      pushFeedback('Garanti Reddedildi (-0.35★ İtibar)', 'negative');
    } else {
      soundFX.playRepair();
      pushFeedback(
        choice === 'REPAIR'
          ? `Ücretsiz Onarım Yapıldı (+0.25★ İtibar)`
          : `Kısmi İade Yapıldı (+0.08★ İtibar)`,
        'positive'
      );
    }

    setShop((prev) => {
      const nextQueue = [...prev.dailyQueue];
      nextQueue[prev.currentQueueIndex] = {
        ...currentEncounter,
        outcome: choice === 'REJECT' ? 'WALKED_OUT' : 'DEAL_CLOSED',
        finalPrice: cost,
        moodScore: choice === 'REPAIR' ? 92 : choice === 'REFUND' ? 68 : 4,
        mood: choice === 'REPAIR' ? 'excited' : choice === 'REFUND' ? 'happy' : 'angry',
        messages: [
          ...currentEncounter.messages,
          { id: `wp_${Date.now()}`, speaker: 'player', text: playerMsg },
          {
            id: `wc_${Date.now()}`,
            speaker: 'customer',
            text: customerMsg,
            tone: choice === 'REJECT' ? 'danger' : 'positive',
          },
        ],
      };

      const nextSoldHistory = (prev.soldHistory ?? []).map((r) =>
        r.id === recordId
          ? { ...r, warrantyResolved: true, wasHappy: choice !== 'REJECT' }
          : r
      );

      const warrantyRec = currentEncounter.warrantyRecord;
      const complaintDefect = currentEncounter.warrantyDefectId ?? 'screen_crack';
      const newComplaintEntry: CustomerComplaintRecord = {
        id: `cmp_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        soldRecordId: recordId ?? `unk_${Date.now()}`,
        certificateNo:
          warrantyRec?.certificateNo ??
          `GSM-G${String(warrantyRec?.daySold ?? prev.day).padStart(2, '0')}`,
        dayReported: prev.day,
        daySold: warrantyRec?.daySold ?? prev.day,
        customerName: currentEncounter.customerName,
        deviceName: warrantyRec?.deviceName ?? currentEncounter.device.model,
        defectId: complaintDefect,
        faultHeadline: DEFECT_CATALOG[complaintDefect]?.name ?? 'Donanım Arızası',
        faultDetail:
          currentEncounter.warrantyFaultDetail ??
          'Müşteri tekrar arıza bildirimiyle tezgaha geldi.',
        customerQuote:
          currentEncounter.messages[0]?.text ??
          'Usta tamir edildi demiştin ama yine arıza verdi!',
        repairQualityAtSale: warrantyRec?.repairQuality,
        wasDisclosed: warrantyRec?.wasDisclosed,
        wasOverseas: warrantyRec?.wasOverseas,
        resolution:
          choice === 'REPAIR'
            ? 'FREE_REPAIR'
            : choice === 'REFUND'
            ? 'PARTIAL_REFUND'
            : 'REJECTED',
        costPaid: cost,
        reputationDelta: repDelta,
      };

      let nextState: ShopState = {
        ...prev,
        cash: prev.cash - cost,
        reputation: Math.max(1, Math.min(5, prev.reputation + repDelta)),
        soldHistory: nextSoldHistory,
        complaintHistory: [newComplaintEntry, ...(prev.complaintHistory ?? [])].slice(
          0,
          40
        ),
        dailyQueue: nextQueue,
        totalPhonesRepaired:
          prev.totalPhonesRepaired + (choice === 'REPAIR' ? 1 : 0),
        todayStats: {
          ...prev.todayStats,
          repairSpend: prev.todayStats.repairSpend + cost,
          reputationDelta: prev.todayStats.reputationDelta + repDelta,
          dealsLost: prev.todayStats.dealsLost + (choice === 'REJECT' ? 1 : 0),
        },
      };
      if (choice !== 'REJECT') {
        nextState = applyXpGain(nextState, choice === 'REPAIR' ? 40 : 20);
      }
      return nextState;
    });
  };

  const handleStampWarrantyCertificate = (recordId: string) => {
    soundFX.playScanOk();
    pushFeedback(
      bi(
        'Garanti Belgesi Mühürlendi & Sunuldu (+0.03★ Güven)',
        'Warranty Certificate Stamped & Handed Over (+0.03★ Trust)'
      ),
      'positive'
    );
    setShop((prev) => ({
      ...prev,
      reputation: Math.min(5, prev.reputation + 0.03),
      soldHistory: (prev.soldHistory ?? []).map((r) =>
        r.id === recordId ? { ...r, warrantyPresented: true } : r
      ),
      todayStats: {
        ...prev.todayStats,
        reputationDelta: prev.todayStats.reputationDelta + 0.03,
      },
    }));
  };

  const handleResolveDataRecovery = (
    mode: 'SOFTWARE' | 'CLEAN_ROOM',
    forcedSuccess?: boolean
  ) => {
    if (
      !currentEncounter ||
      currentEncounter.type !== 'DATA_RECOVERY' ||
      !currentEncounter.dataRecoveryJob ||
      currentEncounter.outcome !== 'ACTIVE'
    ) {
      return;
    }
    const job = currentEncounter.dataRecoveryJob;
    // Both software tool license and clean room lab have real operating fees
    const cost =
      mode === 'CLEAN_ROOM' ? job.cleanRoomCost : job.softwareCost || 850;
    if (shop.cash < cost) {
      soundFX.playScanDefect();
      pushFeedback(
        bi(
          mode === 'CLEAN_ROOM'
            ? `Temiz Oda için ${formatTRY(cost)} gerekli!`
            : `Kurtarma yazılımı için ${formatTRY(cost)} gerekli!`,
          mode === 'CLEAN_ROOM'
            ? `Need ${formatTRY(cost)} for Clean Room Lab!`
            : `Need ${formatTRY(cost)} for Software Recovery tool!`
        ),
        'negative'
      );
      return;
    }

    const succeeded =
      mode === 'CLEAN_ROOM'
        ? true
        : typeof forcedSuccess === 'boolean'
        ? forcedSuccess
        : Math.random() < job.softwareSuccessRate;
    const grossPayout = succeeded
      ? mode === 'CLEAN_ROOM'
        ? job.cleanRoomPayout
        : job.softwarePayout
      : 0;
    const { taxAmount: saleTax, netAmount: netPayout } = succeeded
      ? calculateSaleTax(grossPayout, shop.staff, shop.staffLevels)
      : { taxAmount: 0, netAmount: 0 };
    const netProfit = netPayout - cost;
    const repDelta = succeeded ? (mode === 'CLEAN_ROOM' ? 0.18 : 0.1) : -0.08;

    if (succeeded) {
      soundFX.playCashRegister();
      pushFeedback(
        `+${formatTRY(netProfit)} · Veriler Kurtarıldı (-${formatTRY(cost)} işlem, -${formatTRY(saleTax)} vergi)!`,
        'positive'
      );
    } else {
      soundFX.playScanDefect();
      setShakeTrigger((n) => n + 1);
      pushFeedback(
        bi(
          `Yazılım Yetmedi (-${formatTRY(cost)} Lisans Maliyeti)`,
          `Software Failed (-${formatTRY(cost)} Tool Fee)`
        ),
        'negative'
      );
    }

    setShop((prev) => {
      const nextQueue = [...prev.dailyQueue];
      nextQueue[prev.currentQueueIndex] = {
        ...currentEncounter,
        outcome: succeeded ? 'DEAL_CLOSED' : 'WALKED_OUT',
        finalPrice: grossPayout,
        profitDelta: netProfit,
        moodScore: succeeded ? 94 : 18,
        mood: succeeded ? 'excited' : 'annoyed',
        messages: [
          ...currentEncounter.messages,
          {
            id: `drp_${Date.now()}`,
            speaker: 'player',
            text:
              mode === 'CLEAN_ROOM'
                ? 'Cihazı temiz oda mikro-okuma istasyonuna alıyorum, %100 garantili kurtaracağım.'
                : 'Özel kurtarma yazılımıyla bellek bloklarını tarıyorum, bakalım kurtarabilecek miyiz.',
          },
          {
            id: `drc_${Date.now()}`,
            speaker: 'customer',
            text: succeeded
              ? `Hayatımı kurtardın usta! Bütün dosyalar tek parça geri geldi, ${formatTRY(grossPayout)} helali hoş olsun!`
              : 'Ah be usta yazılım yetmedi, veriler gelmedi... Neyse uğraştığın için sağ ol ama üzgünüm.',
            tone: succeeded ? 'positive' : 'danger',
          },
        ],
      };

      const nextStreak = succeeded ? prev.dealStreak + 1 : 0;
      let nextState: ShopState = {
        ...prev,
        cash: prev.cash - cost + netPayout,
        reputation: Math.max(1, Math.min(5, prev.reputation + repDelta)),
        dealStreak: nextStreak,
        bestDealStreak: Math.max(prev.bestDealStreak, nextStreak),
        dailyQueue: nextQueue,
        totalProfitEarned: prev.totalProfitEarned + Math.max(0, netProfit),
        bestSingleDealProfit: Math.max(prev.bestSingleDealProfit, netProfit),
        todayStats: {
          ...prev.todayStats,
          repairSpend: prev.todayStats.repairSpend + cost,
          serviceRevenue: prev.todayStats.serviceRevenue + grossPayout,
          salesTaxPaid: (prev.todayStats.salesTaxPaid ?? 0) + saleTax,
          reputationDelta: prev.todayStats.reputationDelta + repDelta,
          dealsLost: prev.todayStats.dealsLost + (succeeded ? 0 : 1),
        },
      };
      if (succeeded) {
        nextState = applyXpGain(nextState, mode === 'CLEAN_ROOM' ? 48 : 34);
      }
      return nextState;
    });
  };

  const finalizeDeal = (
    updatedEncounter: NonNullable<typeof currentEncounter>,
    finalPrice: number,
    reputationDelta: number
  ) => {
    soundFX.playCashRegister();
    const hasNeon = shop.upgrades.includes('neon_sign');
    const repBonus =
      reputationDelta > 0 && hasNeon ? reputationDelta * 1.45 : reputationDelta;

    // Evaluate post-purchase realistic surprises (overlooked uninspected flaws / subtle shop traps) ONCE outside setShop!
    const sellerSurprise =
      updatedEncounter.type === 'SELLER'
        ? evaluatePostPurchaseSurprise(
            updatedEncounter.device,
            updatedEncounter.archetypeId,
            shop.upgrades,
            shop.legacyPath,
            shop.dailyNews
          )
        : null;
    const tradeInSurprise =
      updatedEncounter.type === 'TRADE_IN' && updatedEncounter.tradeInDevice
        ? evaluatePostPurchaseSurprise(
            updatedEncounter.tradeInDevice,
            updatedEncounter.archetypeId,
            shop.upgrades,
            shop.legacyPath,
            shop.dailyNews
          )
        : null;

    setShop((prev) => {
      const nextQueue = [...prev.dailyQueue];
      const nextRep = Math.max(1, Math.min(5, prev.reputation + repBonus));
      const nextStreak = prev.dealStreak + 1;
      const streakBonus = getStreakBonusCash(nextStreak, prev.level);
      const nextBestStreak = Math.max(prev.bestDealStreak, nextStreak);
      const nextDiscovered = discoverSpec(
        prev.discoveredSpecIds,
        updatedEncounter.device.specId
      );
      const newReview = generateCustomerReview(
        prev.day,
        updatedEncounter,
        prev.legacyPath
      );
      const nextReviews = [newReview, ...prev.reviews].slice(0, 12);

      if (updatedEncounter.type === 'SELLER') {
        const postSurprisePhone = sellerSurprise
          ? sellerSurprise.updatedDevice
          : updatedEncounter.device;
        const fairVal = calculateMarketValue(
          postSurprisePhone,
          false,
          prev.dailyNews,
          prev.upgrades
        );
        const boughtPhone: PhoneDevice = {
          ...postSurprisePhone,
          purchasePrice: finalPrice,
          dayAcquired: prev.day,
          inspected: { screen: true, battery: true, imei: true, hardware: true },
          listedForSale: false,
          askingPrice: roundPrice(fairVal * 1.15),
        };
        const extraBenchCost = sellerSurprise?.extraBenchCost ?? 0;
        const cashDeductExtra = Math.min(
          Math.max(0, prev.cash - finalPrice + streakBonus),
          extraBenchCost
        );
        nextQueue[prev.currentQueueIndex] = {
          ...updatedEncounter,
          streakBonus,
          postBuySurpriseAlert: sellerSurprise?.surpriseAlert,
        };

        let nextState: ShopState = {
          ...prev,
          cash: prev.cash - finalPrice + streakBonus - cashDeductExtra,
          reputation: nextRep,
          dealStreak: nextStreak,
          bestDealStreak: nextBestStreak,
          discoveredSpecIds: nextDiscovered,
          inventory: [boughtPhone, ...prev.inventory],
          dailyQueue: nextQueue,
          reviews: nextReviews,
          todayStats: {
            ...prev.todayStats,
            phonesBought: prev.todayStats.phonesBought + 1,
            buySpend: prev.todayStats.buySpend + finalPrice,
            repairSpend: prev.todayStats.repairSpend + cashDeductExtra,
            questRewards: prev.todayStats.questRewards + streakBonus,
            reputationDelta: prev.todayStats.reputationDelta + repBonus,
          },
        };
        nextState = applyXpGain(nextState, finalPrice < fairVal ? 35 : 22);
        return finalPrice < fairVal
          ? applyQuestProgress(nextState, 'BUY_BARGAIN', 1)
          : nextState;
      } else {
        const costBasis =
          updatedEncounter.device.purchasePrice +
          updatedEncounter.device.repairSpend;
        const crossSellList =
          updatedEncounter.crossSellAttachments &&
          updatedEncounter.crossSellAttachments.length > 0
            ? updatedEncounter.crossSellAttachments
            : updatedEncounter.crossSellAttached
            ? [updatedEncounter.crossSellAttached]
            : [];
        const crossSellRev = crossSellList.reduce((s, a) => s + a.retailPrice, 0);
        const crossSellProfit = crossSellList.reduce((s, a) => s + a.profit, 0);
        const posRate = prev.upgrades.includes('smart_pos_zero') ? 0.01 : 0.05;
        const posCommission = updatedEncounter.posAccepted
          ? Math.round(finalPrice * posRate)
          : 0;
        const { taxAmount: saleTax } = calculateSaleTax(
          finalPrice + crossSellRev,
          prev.staff,
          prev.staffLevels
        );
        const isTradeIn =
          updatedEncounter.type === 'TRADE_IN' &&
          Boolean(updatedEncounter.tradeInDevice);

        let tradeInPhone: PhoneDevice | null = null;
        let tradeInBookValue = 0;
        const tradeBenchCost = tradeInSurprise?.extraBenchCost ?? 0;
        if (isTradeIn && updatedEncounter.tradeInDevice) {
          const postTradeDev = tradeInSurprise
            ? tradeInSurprise.updatedDevice
            : updatedEncounter.tradeInDevice;
          const tradeInEstimatedVal = calculateMarketValue(
            postTradeDev,
            false,
            prev.dailyNews,
            prev.upgrades
          );
          // Book value of trade-in phone is 85% of current as-is value;
          // setting purchasePrice = tradeInBookValue prevents double-counting profit when resold later!
          tradeInBookValue = Math.max(500, roundPrice(tradeInEstimatedVal * 0.85));
          tradeInPhone = {
            ...postTradeDev,
            purchasePrice: tradeInBookValue,
            dayAcquired: prev.day,
            inspected: { screen: true, battery: true, imei: true, hardware: true },
            listedForSale: false,
            askingPrice: roundPrice(tradeInEstimatedVal * 1.15),
          };
        }

        const profit =
          finalPrice -
          posCommission -
          saleTax -
          tradeBenchCost +
          (tradeInPhone ? tradeInBookValue : 0) -
          costBasis +
          crossSellProfit;
        const encWithProfit = {
          ...updatedEncounter,
          profitDelta: profit,
          streakBonus,
          postBuySurpriseAlert: tradeInSurprise?.surpriseAlert,
        };
        nextQueue[prev.currentQueueIndex] = encWithProfit;

        const remainingInv = prev.inventory.filter(
          (p) => p.uid !== updatedEncounter.device.uid
        );
        const nextInv = tradeInPhone
          ? [tradeInPhone, ...remainingInv]
          : remainingInv;
        const nextStateForQueue: ShopState = { ...prev, inventory: nextInv };
        // Instead of shrinking the daily queue when another buyer wanted the same phone,
        // replace that slot with a fresh buyer (for another listed phone), accessory buyer, or seller!
        const cleanedQueue = nextQueue.map((q, idx) => {
          if (
            idx <= prev.currentQueueIndex ||
            !(
              (q.type === 'BUYER' || q.type === 'TRADE_IN') &&
              q.device.uid === updatedEncounter.device.uid
            )
          ) {
            return q;
          }
          const otherListed = nextInv.filter((p) => p.listedForSale && !p.assignedToStaff);
          if (otherListed.length > 0) {
            const pickAlt = otherListed[Math.floor(Math.random() * otherListed.length)];
            return q.type === 'TRADE_IN'
              ? createTradeInEncounter(nextStateForQueue, pickAlt)
              : createBuyerEncounter(nextStateForQueue, pickAlt);
          }
          const accFallback = createAccessoryBuyerEncounter(nextStateForQueue);
          return accFallback ?? createSellerEncounter(nextStateForQueue);
        });

        const nextAccessories = { ...prev.accessories };
        for (const cs of crossSellList) {
          const cur = nextAccessories[cs.id];
          if (cur && cur.quantity > 0) {
            nextAccessories[cs.id] = {
              ...cur,
              quantity: cur.quantity - 1,
              totalSold: cur.totalSold + 1,
            };
          }
        }

        const isBrandNewSale = Boolean(updatedEncounter.device.isBrandNew);
        const salesRepHighRepBonus =
          prev.staff.includes('sales_rep') && (prev.staffLevels?.sales_rep ?? 1) >= 8
            ? 0.04
            : 0;
        const finalRepWithStaff = Math.max(1, Math.min(5, nextRep + salesRepHighRepBonus));
        const soldRepairedDefects = updatedEncounter.device.repairedDefects ?? [];
        const soldQuality = updatedEncounter.device.lastRepairQuality;
        const soldOverseas = updatedEncounter.device.defects.includes('imei_unregistered');
        const soldDisclosed = Boolean(updatedEncounter.buyerDisclosed);
        const soldOtherDefects = updatedEncounter.device.defects.some(
          (d) => d !== 'imei_unregistered'
        );
        // Schedule realistic 3-5 day customer comeback for rough/standard repairs or undisclosed overseas/defects!
        let scheduledComebackDay: number | undefined;
        const delayDays = 3 + Math.floor(Math.random() * 3); // 3, 4, or 5 days later
        if (soldQuality === 'ROUGH' && Math.random() < 0.7) {
          scheduledComebackDay = prev.day + delayDays;
        } else if (soldOverseas && !soldDisclosed && Math.random() < 0.58) {
          scheduledComebackDay = prev.day + delayDays;
        } else if (soldOtherDefects && !soldDisclosed && Math.random() < 0.45) {
          scheduledComebackDay = prev.day + delayDays;
        } else if (
          soldRepairedDefects.length > 0 &&
          soldQuality !== 'MASTER' &&
          Math.random() < (soldDisclosed ? 0.14 : 0.34)
        ) {
          scheduledComebackDay = prev.day + delayDays;
        }

        const wittyMeta = buildWittyEsnafReportNote(updatedEncounter.device);
        const soldRecord: SoldPhoneRecord = {
          id: `sold_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
          daySold: prev.day,
          customerName: updatedEncounter.customerName,
          archetypeId: updatedEncounter.archetypeId,
          deviceName: `${updatedEncounter.device.brand} ${updatedEncounter.device.model}`,
          salePrice: isTradeIn ? updatedEncounter.device.askingPrice : finalPrice,
          hadDefects: updatedEncounter.device.defects.length > 0,
          wasHappy: updatedEncounter.moodScore >= 58,
          warrantyResolved: false,
          repairedDefects: soldRepairedDefects,
          repairQuality: soldQuality,
          wasOverseas: soldOverseas,
          wasDisclosed: soldDisclosed,
          comebackDay: scheduledComebackDay,
          certificateNo: generateCertificateNumber(prev.day),
          imeiNumber: updatedEncounter.device.imeiNumber,
          warrantyDays: wittyMeta.warrantyDays,
          partBreakdown: buildDevicePartBreakdown(updatedEncounter.device),
          craftsmanNote: wittyMeta.tr,
          warrantyPresented: false,
        };

        const cleanedQueueWithCert = cleanedQueue.map((q, idx) =>
          idx === prev.currentQueueIndex
            ? { ...q, deliveredCertificateId: soldRecord.id }
            : q
        );

        if (soldRepairedDefects.length > 0) {
          window.setTimeout(() => {
            setActiveWarrantyModal({ record: soldRecord, mode: 'HANDOVER' });
          }, 180);
        }

        const finalDiscovered = tradeInPhone
          ? discoverSpec(nextDiscovered, tradeInPhone.specId)
          : nextDiscovered;

        let nextState: ShopState = {
          ...prev,
          cash:
            prev.cash +
            finalPrice -
            posCommission -
            saleTax -
            tradeBenchCost +
            crossSellRev +
            streakBonus,
          reputation: finalRepWithStaff,
          dealStreak: nextStreak,
          bestDealStreak: nextBestStreak,
          discoveredSpecIds: finalDiscovered,
          accessories: nextAccessories,
          inventory: nextInv,
          soldHistory: [soldRecord, ...(prev.soldHistory ?? [])].slice(0, 35),
          dailyQueue: cleanedQueueWithCert,
          reviews: nextReviews,
          totalProfitEarned: prev.totalProfitEarned + profit,
          totalPhonesSold: prev.totalPhonesSold + 1,
          totalBrandNewSold: prev.totalBrandNewSold + (isBrandNewSale ? 1 : 0),
          totalAccessoriesSold: prev.totalAccessoriesSold + crossSellList.length,
          totalTradeInsDone: (prev.totalTradeInsDone ?? 0) + (isTradeIn ? 1 : 0),
          bestSingleDealProfit: Math.max(prev.bestSingleDealProfit, profit),
          todayStats: {
            ...prev.todayStats,
            phonesSold: prev.todayStats.phonesSold + 1,
            phonesBought: prev.todayStats.phonesBought + (tradeInPhone ? 1 : 0),
            accessoriesSold: prev.todayStats.accessoriesSold + crossSellList.length,
            salesRevenue: prev.todayStats.salesRevenue + finalPrice,
            accessoryRevenue: prev.todayStats.accessoryRevenue + crossSellRev,
            repairSpend: prev.todayStats.repairSpend + tradeBenchCost,
            posCommission: (prev.todayStats.posCommission ?? 0) + posCommission,
            salesTaxPaid: (prev.todayStats.salesTaxPaid ?? 0) + saleTax,
            questRewards: prev.todayStats.questRewards + streakBonus,
            reputationDelta: prev.todayStats.reputationDelta + repBonus,
          },
        };
        nextState = applyXpGain(
          nextState,
          (profit > 0 ? 42 : 22) +
            (isBrandNewSale ? 15 : 0) +
            (isTradeIn ? 18 : 0) +
            crossSellList.length * 10
        );
        nextState = applyQuestProgress(nextState, 'SELL_PHONE', 1);
        if (isBrandNewSale) {
          nextState = applyQuestProgress(nextState, 'SELL_BRAND_NEW', 1);
        }
        if (crossSellList.length > 0) {
          nextState = applyQuestProgress(
            nextState,
            'SELL_ACCESSORY',
            crossSellList.length
          );
        }

        if (checkVictoryCondition(nextState)) {
          window.setTimeout(() => {
            soundFX.playDayComplete();
            setScreen('VICTORY');
          }, 450);
        }

        return nextState;
      }
    });

    if (updatedEncounter.type === 'SELLER') {
      const savedAmount = Math.max(0, updatedEncounter.initialCustomerPrice - finalPrice);
      if (savedAmount >= 3000) {
        pushBadgeNotification({
          kicker: 'PAZARLIK KURDU ROZETİ',
          title: `${formatTRY(savedAmount)} Fiyat Kırdın!`,
          subtitle: `${updatedEncounter.device.brand} ${updatedEncounter.device.model} alışında usta pazarlık!`,
          accent: 'amber',
          icon: 'gavel',
        });
      }
      if (sellerSurprise?.surpriseAlert) {
        soundFX.playScanDefect();
        pushFeedback(`Dikkat! Atölye kontrolünde sürpriz çıktı!`, 'negative');
      } else {
        pushFeedback(`-${formatTRY(finalPrice)} · Cihaz Alındı`, 'amber');
      }
    } else if (updatedEncounter.type === 'TRADE_IN') {
      if (tradeInSurprise?.surpriseAlert) {
        soundFX.playScanDefect();
        pushFeedback(`Takas Tamam · Ama Takas Cihazında Sürpriz Çıktı!`, 'negative');
      } else {
        pushFeedback(`+${formatTRY(finalPrice)} Fark + Takas Cihazı Alındı!`, 'positive');
      }
    } else {
      const csCount =
        updatedEncounter.crossSellAttachments?.length ??
        (updatedEncounter.crossSellAttached ? 1 : 0);
      const extra = csCount > 0 ? ` (+${csCount} Aksesuar)` : '';
      pushFeedback(`+${formatTRY(finalPrice)} · Satış Tamam${extra}!`, 'positive');

      // High-profit single phone sale celebratory badge popup
      const costBasis =
        updatedEncounter.device.purchasePrice + updatedEncounter.device.repairSpend;
      const csList =
        updatedEncounter.crossSellAttachments &&
        updatedEncounter.crossSellAttachments.length > 0
          ? updatedEncounter.crossSellAttachments
          : updatedEncounter.crossSellAttached
          ? [updatedEncounter.crossSellAttached]
          : [];
      const csRev = csList.reduce((s, a) => s + a.retailPrice, 0);
      const csProf = csList.reduce((s, a) => s + a.profit, 0);
      const posRate = shop.upgrades.includes('smart_pos_zero') ? 0.01 : 0.05;
      const posCut = updatedEncounter.posAccepted ? Math.round(finalPrice * posRate) : 0;
      const { taxAmount } = calculateSaleTax(
        finalPrice + csRev,
        shop.staff,
        shop.staffLevels
      );
      const netSaleProfit = finalPrice - posCut - taxAmount - costBasis + csProf;
      if (netSaleProfit >= 4000) {
        pushBadgeNotification({
          kicker: netSaleProfit >= 7500 ? 'EFSANE VURGUN ROZETİ' : 'YÜKSEK KÂR ROZETİ',
          title: `+${formatTRY(netSaleProfit)} Net Kâr!`,
          subtitle: `${updatedEncounter.device.brand} ${updatedEncounter.device.model} satışında müthiş marj!`,
          accent: netSaleProfit >= 7500 ? 'gold' : 'emerald',
          icon: 'coins',
        });
      }
    }

    const nextDealStreak = shop.dealStreak + 1;
    if (nextDealStreak >= 5 && nextDealStreak % 5 === 0) {
      pushBadgeNotification({
        kicker: 'ATEŞLİ SERİ ROZETİ',
        title: `${nextDealStreak}x Kesintisiz Anlaşma!`,
        subtitle: 'Tezgahta durdurulamaz bir pazarlık rüzgarı estirdin!',
        accent: 'amber',
        icon: 'flame',
      });
    }
  };

  const handleSubmitOffer = (
    offerPrice: number,
    tone: NegotiationTone = 'friendly',
    elapsedSec = 5,
    instantAcceptRequested = false
  ) => {
    if (!currentEncounter || currentEncounter.outcome !== 'ACTIVE') return;
    if (currentEncounter.type === 'SELLER' && offerPrice > shop.cash) return;

    const result = evaluatePlayerOffer(currentEncounter, offerPrice, {
      tone,
      elapsedSec,
      legacyPath: shop.legacyPath,
      instantAcceptRequested,
      dailyNews: shop.dailyNews,
      upgrades: shop.upgrades,
    });

    if (result.accepted) {
      finalizeDeal(
        result.updatedEncounter,
        result.finalPrice,
        result.reputationDelta
      );
      return;
    }

    if (result.walkedOut) {
      soundFX.playAngryLeave();
      setShakeTrigger((n) => n + 1);
      pushFeedback('Müşteri Kızıp Dükkanı Terk Etti', 'negative');
    } else {
      soundFX.playCounterOffer();
      if (
        result.updatedEncounter.mood === 'annoyed' ||
        result.updatedEncounter.mood === 'angry'
      ) {
        setShakeTrigger((n) => n + 1);
      }
    }

    setShop((prev) => {
      const nextQueue = [...prev.dailyQueue];
      nextQueue[prev.currentQueueIndex] = result.updatedEncounter;
      const nextRep = Math.max(
        1,
        Math.min(5, prev.reputation + result.reputationDelta)
      );
      const nextReviews = result.walkedOut
        ? [
            generateCustomerReview(prev.day, result.updatedEncounter, prev.legacyPath),
            ...prev.reviews,
          ].slice(0, 12)
        : prev.reviews;
      return {
        ...prev,
        reputation: nextRep,
        dealStreak: result.walkedOut ? 0 : prev.dealStreak,
        dailyQueue: nextQueue,
        reviews: nextReviews,
        todayStats: {
          ...prev.todayStats,
          reputationDelta: prev.todayStats.reputationDelta + result.reputationDelta,
          dealsLost: prev.todayStats.dealsLost + (result.walkedOut ? 1 : 0),
        },
      };
    });
  };

  const handleAcceptCurrentPrice = () => {
    if (!currentEncounter || currentEncounter.outcome !== 'ACTIVE') return;
    handleSubmitOffer(currentEncounter.customerPrice, 'friendly', 4, true);
  };

  const completeExpressRepair = (
    bonusTip: number,
    extraExpressFee = 0,
    quality: RepairQuality = 'STANDARD'
  ) => {
    if (!currentEncounter || currentEncounter.type !== 'EXPRESS_REPAIR') return;
    const expDefects = currentEncounter.expressDefectId
      ? [currentEncounter.expressDefectId]
      : [];
    const stockCalc = getRepairCostWithStock(
      expDefects,
      shop.spareParts,
      shop.upgrades,
      shop.dailyNews,
      false,
      shop.level,
      shop.legacyPath,
      shop.prestigePerks
    );
    const effectiveBasePartCost =
      stockCalc.usedStockCount > 0
        ? stockCalc.cashCost
        : currentEncounter.expressPartCost ?? 0;
    const partCost = effectiveBasePartCost + extraExpressFee;
    const totalPayout = currentEncounter.customerPrice + bonusTip;
    const { taxAmount: saleTax, netAmount: netPayout } = calculateSaleTax(
      totalPayout,
      shop.staff,
      shop.staffLevels
    );
    const netProfit = netPayout - partCost;

    soundFX.playCashRegister();
    pushFeedback(
      quality === 'ROUGH'
        ? `+${formatTRY(netProfit)} · Onarım Tamam (Dikkat: Kaba İşçilik — Geri Dönüş Riski!)`
        : stockCalc.usedStockCount > 0
        ? `+${formatTRY(netProfit)} · Stok Parçasıyla Servis Tamam!`
        : extraExpressFee > 0
        ? `+${formatTRY(netProfit)} · Hızlı Onarım Tamam (-${formatTRY(extraExpressFee)} erken teslimat)!`
        : `+${formatTRY(netProfit)} · Acil Servis Tamam (-${formatTRY(saleTax)} vergi)!`,
      quality === 'ROUGH' ? 'amber' : 'positive'
    );

    setShop((prev) => {
      const nextQueue = [...prev.dailyQueue];
      nextQueue[prev.currentQueueIndex] = {
        ...currentEncounter,
        outcome: 'DEAL_CLOSED',
        finalPrice: totalPayout,
        profitDelta: netProfit,
        mood: quality === 'ROUGH' ? 'calm' : 'happy',
        messages: [
          ...currentEncounter.messages,
          {
            id: `exp_${Date.now()}`,
            speaker: 'customer',
            text:
              bonusTip > 0
                ? `${DEAL_ACCEPTED_LINES.EXPRESS_REPAIR[0]} Usta işçiliğin için +${formatTRY(bonusTip)} bahşiş de benden!`
                : DEAL_ACCEPTED_LINES.EXPRESS_REPAIR[0],
            tone: 'positive',
          },
        ],
      };

      const nextParts = {
        screen: Math.max(0, (prev.spareParts?.screen ?? 0) - (stockCalc.usedParts.screen ?? 0)),
        battery: Math.max(0, (prev.spareParts?.battery ?? 0) - (stockCalc.usedParts.battery ?? 0)),
        board_kit: Math.max(0, (prev.spareParts?.board_kit ?? 0) - (stockCalc.usedParts.board_kit ?? 0)),
      };

      // Schedule realistic 3-5 day customer repair comeback if express repair wasn't MASTER quality!
      let comebackDay: number | undefined;
      if (quality === 'ROUGH' && Math.random() < 0.72) {
        comebackDay = prev.day + 3 + Math.floor(Math.random() * 3);
      } else if (quality === 'STANDARD' && Math.random() < 0.28) {
        comebackDay = prev.day + 4 + Math.floor(Math.random() * 2);
      }

      const expOrigins: Partial<Record<DefectId, 'OEM_STOCK' | 'SERVICE_PART'>> = {};
      for (const d of expDefects) {
        const neededPart = getSparePartForDefect(d);
        expOrigins[d] =
          neededPart && (stockCalc.usedParts[neededPart] ?? 0) > 0
            ? 'OEM_STOCK'
            : 'SERVICE_PART';
      }
      const repairedExpDevice: PhoneDevice = {
        ...currentEncounter.device,
        defects: currentEncounter.device.defects.filter((d) => !expDefects.includes(d)),
        repairedDefects: [...(currentEncounter.device.repairedDefects ?? []), ...expDefects],
        repairedPartOrigins: {
          ...(currentEncounter.device.repairedPartOrigins ?? {}),
          ...expOrigins,
        },
        lastRepairQuality: quality,
        masterCrafted: quality === 'MASTER',
      };
      const expWitty = buildWittyEsnafReportNote(repairedExpDevice);

      const expressRecord: SoldPhoneRecord = {
        id: `exp_rec_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        daySold: prev.day,
        customerName: currentEncounter.customerName,
        archetypeId: currentEncounter.archetypeId,
        deviceName: `${currentEncounter.device.brand} ${currentEncounter.device.model}`,
        salePrice: totalPayout,
        hadDefects: false,
        wasHappy: quality !== 'ROUGH',
        warrantyResolved: false,
        repairedDefects: expDefects,
        repairQuality: quality,
        wasOverseas: currentEncounter.device.imeiStatus === 'UNREGISTERED_OVERSEAS',
        comebackDay,
        isExpressRepair: true,
        certificateNo: generateCertificateNumber(prev.day),
        imeiNumber: currentEncounter.device.imeiNumber,
        warrantyDays: expWitty.warrantyDays,
        partBreakdown: buildDevicePartBreakdown(repairedExpDevice),
        craftsmanNote: expWitty.tr,
        warrantyPresented: false,
      };

      nextQueue[prev.currentQueueIndex] = {
        ...nextQueue[prev.currentQueueIndex],
        deliveredCertificateId: expressRecord.id,
      };

      window.setTimeout(() => {
        setActiveWarrantyModal({ record: expressRecord, mode: 'HANDOVER' });
      }, 180);

      const repGain = bonusTip > 0 ? 0.22 : quality === 'ROUGH' ? 0.04 : 0.12;
      const nextStreak = prev.dealStreak + 1;
      let nextState: ShopState = {
        ...prev,
        cash: prev.cash - partCost + netPayout,
        reputation: Math.min(5, prev.reputation + repGain),
        dealStreak: nextStreak,
        bestDealStreak: Math.max(prev.bestDealStreak, nextStreak),
        discoveredSpecIds: discoverSpec(
          prev.discoveredSpecIds,
          currentEncounter.device.specId
        ),
        spareParts: nextParts,
        soldHistory: [expressRecord, ...(prev.soldHistory ?? [])].slice(0, 35),
        dailyQueue: nextQueue,
        totalPhonesRepaired: prev.totalPhonesRepaired + 1,
        totalProfitEarned: prev.totalProfitEarned + netProfit,
        bestSingleDealProfit: Math.max(prev.bestSingleDealProfit, netProfit),
        todayStats: {
          ...prev.todayStats,
          repairSpend: prev.todayStats.repairSpend + partCost,
          serviceRevenue: prev.todayStats.serviceRevenue + totalPayout,
          salesTaxPaid: (prev.todayStats.salesTaxPaid ?? 0) + saleTax,
          reputationDelta: prev.todayStats.reputationDelta + repGain,
        },
      };
      nextState = applyXpGain(nextState, bonusTip >= 1000 ? 55 : 30);
      nextState = applyQuestProgress(nextState, 'REPAIR_PHONE', 1);

      if (checkVictoryCondition(nextState)) {
        window.setTimeout(() => {
          soundFX.playDayComplete();
          setScreen('VICTORY');
        }, 450);
      }
      return nextState;
    });
  };

  const handleExpressRepairQuick = () => {
    if (!currentEncounter || currentEncounter.type !== 'EXPRESS_REPAIR') return;
    const basePartCost = currentEncounter.expressPartCost ?? 0;
    const expressFee = getQuickRepairExpressFee(basePartCost);
    if (shop.cash < basePartCost + expressFee) return;
    completeExpressRepair(0, expressFee, 'STANDARD');
  };

  const handleExpressRepairMini = () => {
    if (
      !currentEncounter ||
      currentEncounter.type !== 'EXPRESS_REPAIR' ||
      !currentEncounter.expressDefectId
    ) {
      return;
    }
    const partCost = currentEncounter.expressPartCost ?? 0;
    if (shop.cash < partCost) return;
    setMiniRepairJob({
      mode: 'EXPRESS',
      phone: currentEncounter.device,
      defectIds: [currentEncounter.expressDefectId],
      cost: partCost,
    });
  };

  const handleDelegateExpressRepair = () => {
    if (
      !currentEncounter ||
      currentEncounter.type !== 'EXPRESS_REPAIR' ||
      !currentEncounter.expressDefectId ||
      currentEncounter.outcome !== 'ACTIVE' ||
      !shop.staff.includes('master_tech')
    ) {
      return;
    }
    const masterSpecs = getMasterTechSpecs(
      shop.staffLevels?.master_tech ?? 1,
      shop.upgrades
    );
    if ((shop.staffRepairQueue?.length ?? 0) >= masterSpecs.maxParallelJobs) return;
    const partCost = currentEncounter.expressPartCost ?? 0;
    if (shop.cash < partCost) return;

    const job: StaffRepairJob = {
      id: `srep_${Date.now()}`,
      mode: 'EXPRESS_CUSTOMER',
      customerName: currentEncounter.customerName,
      deviceName: `${currentEncounter.device.brand} ${currentEncounter.device.model}`,
      defectIds: [currentEncounter.expressDefectId],
      turnsRemaining: masterSpecs.turnsPerJob,
      totalTurns: masterSpecs.turnsPerJob,
      payout: currentEncounter.customerPrice,
    };

    soundFX.playRepair();
    pushFeedback(
      `Hasan Usta’ya Aktarıldı (${masterSpecs.turnsPerJob} turda otomatik teslim)!`,
      'positive'
    );

    const { taxAmount: estTax } = calculateSaleTax(
      currentEncounter.customerPrice,
      shop.staff,
      shop.staffLevels
    );
    const estNetProfit = currentEncounter.customerPrice - estTax - partCost;

    setShop((prev) => {
      const nextQueue = [...prev.dailyQueue];
      const nextStreak = prev.dealStreak + 1;
      nextQueue[prev.currentQueueIndex] = {
        ...currentEncounter,
        outcome: 'DEAL_CLOSED',
        finalPrice: currentEncounter.customerPrice,
        profitDelta: estNetProfit,
        mood: 'happy',
        messages: [
          ...currentEncounter.messages,
          {
            id: `del_${Date.now()}`,
            speaker: 'player',
            text: `Cihazı hemen Baş Ustam Hasan’a teslim ediyorum, ${masterSpecs.turnsPerJob} tur içinde bitirip sana ulaştıracak!`,
          },
          {
            id: `delc_${Date.now()}`,
            speaker: 'customer',
            text: 'Süper usta, Hasan Usta’nın eline güveniyorum. Bitince ödemeyi hemen geçerim!',
            tone: 'positive',
          },
        ],
      };
      return {
        ...prev,
        cash: prev.cash - partCost,
        dealStreak: nextStreak,
        bestDealStreak: Math.max(prev.bestDealStreak, nextStreak),
        dailyQueue: nextQueue,
        staffRepairQueue: [...(prev.staffRepairQueue ?? []), job],
        todayStats: {
          ...prev.todayStats,
          repairSpend: prev.todayStats.repairSpend + partCost,
        },
      };
    });
  };

  const handleAcceptBulkAuction = () => {
    if (
      !currentEncounter ||
      currentEncounter.type !== 'BULK_AUCTION' ||
      !currentEncounter.bundleDevices
    ) {
      return;
    }
    const price = currentEncounter.customerPrice;
    if (shop.cash < price) return;
    soundFX.playCashRegister();
    pushFeedback(`-${formatTRY(price)} · 2 Gizemli Cihaz Alındı!`, 'amber');

    const perPhoneCost = Math.round(price / 2);
    const revealedPhones: PhoneDevice[] = currentEncounter.bundleDevices.map((d) => ({
      ...d,
      purchasePrice: perPhoneCost,
      inspected: { screen: true, battery: true, imei: true, hardware: true },
      listedForSale: false,
      askingPrice: roundPrice(
        calculateMarketValue(d, false, shop.dailyNews, shop.upgrades) * 1.15
      ),
    }));

    setShop((prev) => {
      const nextQueue = [...prev.dailyQueue];
      nextQueue[prev.currentQueueIndex] = {
        ...currentEncounter,
        outcome: 'DEAL_CLOSED',
        finalPrice: price,
        mood: 'happy',
        messages: [
          ...currentEncounter.messages,
          {
            id: `auc_${Date.now()}`,
            speaker: 'customer',
            text: DEAL_ACCEPTED_LINES.BULK_AUCTION[0],
            tone: 'positive',
          },
        ],
      };

      let nextDiscovered = prev.discoveredSpecIds;
      for (const p of revealedPhones) {
        nextDiscovered = discoverSpec(nextDiscovered, p.specId);
      }
      const nextStreak = prev.dealStreak + 1;
      const nextState: ShopState = {
        ...prev,
        cash: prev.cash - price,
        dealStreak: nextStreak,
        bestDealStreak: Math.max(prev.bestDealStreak, nextStreak),
        discoveredSpecIds: nextDiscovered,
        inventory: [...revealedPhones, ...prev.inventory],
        dailyQueue: nextQueue,
        todayStats: {
          ...prev.todayStats,
          phonesBought: prev.todayStats.phonesBought + revealedPhones.length,
          buySpend: prev.todayStats.buySpend + price,
        },
      };
      return applyXpGain(nextState, 40);
    });
  };

  const handleDismiss = () => {
    if (!currentEncounter || currentEncounter.outcome !== 'ACTIVE') return;
    soundFX.playClick();
    updateCurrentEncounter((enc) => ({
      ...enc,
      outcome: 'DISMISSED',
      mood: 'calm',
      messages: [
        ...enc.messages,
        {
          id: `dismiss_${Date.now()}`,
          speaker: 'player',
          text: 'Bugün anlaşamadık, başka zaman yine beklerim. Hayırlı günler!',
        },
      ],
    }));
  };

  const handlePlaceOnDeskReaction = (line: string) => {
    updateCurrentEncounter((enc) => {
      if (enc.messages.some((m) => m.id.startsWith('desk_'))) {
        return enc;
      }
      return {
        ...enc,
        messages: [
          ...enc.messages,
          {
            id: `desk_${Date.now()}`,
            speaker: 'player',
            text: line,
            tone: 'neutral',
          },
        ],
      };
    });
  };

  const handlePitchCrossSell = (accessoryId: AccessoryId) => {
    if (
      !currentEncounter ||
      currentEncounter.type !== 'BUYER' ||
      currentEncounter.outcome !== 'ACTIVE' ||
      (currentEncounter.crossSellTriedIds ?? []).includes(accessoryId)
    ) {
      return;
    }
    const stock = shop.accessories[accessoryId];
    if (!stock || stock.quantity <= 0) return;

    const crossSellBonus = getCrossSellBonusChance(
      shop.upgrades,
      shop.staff,
      shop.staffLevels
    );
    const result = evaluateCrossSellPitch(
      currentEncounter,
      accessoryId,
      stock,
      shop.level,
      shop.legacyPath,
      crossSellBonus
    );

    if (result.accepted) {
      soundFX.playScanOk();
      pushFeedback(`Aksesuar Sepete Eklendi (+${formatTRY(result.retailPrice)})!`, 'positive');
    } else {
      soundFX.playClick();
      pushFeedback('Bu Aksesuarı İstemedi · Başka Ürün Öner!', 'amber');
    }

    updateCurrentEncounter(() => result.updatedEncounter);
  };

  const handleCompleteAccessoryOrder = () => {
    if (
      !currentEncounter ||
      currentEncounter.type !== 'ACCESSORY_BUYER' ||
      !currentEncounter.accessoryOrder ||
      currentEncounter.outcome !== 'ACTIVE'
    ) {
      return;
    }

    const order = currentEncounter.accessoryOrder;
    let totalRev = 0;
    let totalProfit = 0;
    let totalUnits = 0;

    for (const line of order) {
      const stock = shop.accessories[line.id];
      const unitWholesale = getAccessoryWholesaleCost(line.id, shop.legacyPath);
      const sellQty = Math.min(line.quantity, stock?.quantity ?? 0);
      if (sellQty > 0) {
        totalUnits += sellQty;
        totalRev += sellQty * line.unitPrice;
        totalProfit += sellQty * (line.unitPrice - unitWholesale);
      }
    }

    if (totalUnits === 0) {
      pushFeedback('Reyonda stok tükendi!', 'negative');
      handleDismiss();
      return;
    }

    const { taxAmount: saleTax, netAmount: netRev } = calculateSaleTax(
      totalRev,
      shop.staff,
      shop.staffLevels
    );
    const netProfit = totalProfit - saleTax;

    soundFX.playCashRegister();
    pushFeedback(
      `+${formatTRY(netRev)} · ${totalUnits} Aksesuar Satıldı (-${formatTRY(saleTax)} vergi)!`,
      'positive'
    );

    setShop((prev) => {
      const nextAccessories = { ...prev.accessories };
      for (const line of order) {
        const cur = nextAccessories[line.id];
        if (!cur) continue;
        const sellQty = Math.min(line.quantity, cur.quantity);
        nextAccessories[line.id] = {
          ...cur,
          quantity: cur.quantity - sellQty,
          totalSold: cur.totalSold + sellQty,
        };
      }

      const nextQueue = [...prev.dailyQueue];
      nextQueue[prev.currentQueueIndex] = {
        ...currentEncounter,
        outcome: 'DEAL_CLOSED',
        finalPrice: totalRev,
        profitDelta: netProfit,
        mood: 'happy',
        messages: [
          ...currentEncounter.messages,
          {
            id: `acc_done_${Date.now()}`,
            speaker: 'customer',
            text: DEAL_ACCEPTED_LINES.ACCESSORY_BUYER[0],
            tone: 'positive',
          },
        ],
      };

      const repGain = 0.06;
      const nextStreak = prev.dealStreak + 1;
      let nextState: ShopState = {
        ...prev,
        cash: prev.cash + netRev,
        reputation: Math.min(5, prev.reputation + repGain),
        dealStreak: nextStreak,
        bestDealStreak: Math.max(prev.bestDealStreak, nextStreak),
        accessories: nextAccessories,
        dailyQueue: nextQueue,
        totalAccessoriesSold: prev.totalAccessoriesSold + totalUnits,
        totalProfitEarned: prev.totalProfitEarned + netProfit,
        todayStats: {
          ...prev.todayStats,
          accessoriesSold: prev.todayStats.accessoriesSold + totalUnits,
          accessoryRevenue: prev.todayStats.accessoryRevenue + totalRev,
          salesTaxPaid: (prev.todayStats.salesTaxPaid ?? 0) + saleTax,
          reputationDelta: prev.todayStats.reputationDelta + repGain,
        },
      };
      nextState = applyXpGain(nextState, 18 + totalUnits * 6);
      return applyQuestProgress(nextState, 'SELL_ACCESSORY', totalUnits);
    });
  };

  const handleBuyAccessoryStock = (
    accessoryId: AccessoryId,
    quantity: number,
    expressDelivery: boolean
  ) => {
    const spec = getAccessorySpec(accessoryId);
    const locSpec = getLocalizedAccessory(accessoryId, lang);
    if (!hasAccessoryLicense(shop.upgrades)) {
      soundFX.playScanDefect();
      pushFeedback(
        bi(
          'Önce Aksesuar Reyonu Lisansı satın almalısın!',
          'Purchase the Accessory Counter License first!'
        ),
        'amber'
      );
      return;
    }
    if (!isAccessoryUnlocked(accessoryId, shop.shopTier, shop.upgrades)) {
      soundFX.playScanDefect();
      pushFeedback(
        bi(
          `${locSpec.name} ${spec.minShopTier}. Dükkan kademesinde açılır!`,
          `${locSpec.name} unlocks at Shop Tier ${spec.minShopTier}!`
        ),
        'amber'
      );
      return;
    }
    const unitCost = getAccessoryWholesaleCost(accessoryId, shop.legacyPath);
    const shippingFee = expressDelivery ? EXPRESS_ACCESSORY_FEE : 0;
    const totalCost = unitCost * quantity + shippingFee;
    if (shop.cash < totalCost) return;
    soundFX.playCashRegister();

    if (expressDelivery) {
      pushFeedback(
        bi(
          `-${formatTRY(totalCost)} · +${quantity} ${locSpec.name} (Hemen Geldi!)`,
          `-${formatTRY(totalCost)} · +${quantity} ${locSpec.name} (Delivered!)`
        ),
        'amber'
      );
      setShop((prev) => ({
        ...prev,
        cash: prev.cash - totalCost,
        accessories: {
          ...prev.accessories,
          [accessoryId]: {
            ...prev.accessories[accessoryId],
            quantity: prev.accessories[accessoryId].quantity + quantity,
          },
        },
        todayStats: {
          ...prev.todayStats,
          wholesaleSpend: prev.todayStats.wholesaleSpend + totalCost,
        },
      }));
    } else {
      pushFeedback(
        bi(
          `-${formatTRY(totalCost)} · ${quantity}x ${locSpec.name} Kargoya Verildi (1 Gün)`,
          `-${formatTRY(totalCost)} · ${quantity}x ${locSpec.name} Ordered (1 Day)`
        ),
        'amber'
      );
      const order: PendingWholesaleOrder = {
        id: `wh_acc_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        kind: 'ACCESSORY',
        label: `${quantity}x ${locSpec.name}`,
        daysRemaining: 1,
        totalDays: 1,
        accessoryId,
        quantity,
        wholesaleCost: totalCost,
      };
      setShop((prev) => ({
        ...prev,
        cash: prev.cash - totalCost,
        pendingWholesaleOrders: [...(prev.pendingWholesaleOrders ?? []), order],
        todayStats: {
          ...prev.todayStats,
          wholesaleSpend: prev.todayStats.wholesaleSpend + totalCost,
        },
      }));
    }
  };

  const handleUpdateAccessoryPrice = (accessoryId: AccessoryId, newPrice: number) => {
    setShop((prev) => ({
      ...prev,
      accessories: {
        ...prev.accessories,
        [accessoryId]: {
          ...prev.accessories[accessoryId],
          retailPrice: newPrice,
        },
      },
    }));
  };

  const handleOrderBrandNewPhone = (
    spec: PhoneModelSpec,
    wholesaleCost: number,
    expressDelivery: boolean
  ) => {
    if (!hasBrandNewLicense(shop.upgrades)) {
      soundFX.playScanDefect();
      pushFeedback(
        bi(
          'Önce Sıfır Telefon Bayilik Lisansı almalısın!',
          'Purchase the Sealed Phone Dealership License first!'
        ),
        'amber'
      );
      return;
    }
    const shippingFee = expressDelivery ? EXPRESS_PHONE_FEE : 0;
    const totalCost = wholesaleCost + shippingFee;
    if (shop.cash < totalCost) return;
    soundFX.playCashRegister();

    const matchingDist = BRAND_DISTRIBUTORS.find((d) =>
      d.brands.includes(spec.brand)
    );

    setShop((prev) => {
      const nextLoyalty = { ...(prev.distributorLoyalty ?? {}) };
      if (matchingDist) {
        nextLoyalty[matchingDist.id] = (nextLoyalty[matchingDist.id] ?? 0) + 1;
      }

      // If buying from an active Flash Wholesale Deal, decrement remaining stock!
      let nextFlash = prev.flashWholesaleDeal;
      if (
        nextFlash &&
        !nextFlash.expired &&
        nextFlash.brand === spec.brand &&
        nextFlash.remainingStock > 0
      ) {
        const rem = nextFlash.remainingStock - 1;
        nextFlash = {
          ...nextFlash,
          remainingStock: rem,
          expired: rem <= 0,
        };
      }

      if (expressDelivery) {
        const newPhone = generateBrandNewPhone(spec, wholesaleCost, prev.dailyNews);
        const nextState: ShopState = {
          ...prev,
          cash: prev.cash - totalCost,
          inventory: [newPhone, ...prev.inventory],
          distributorLoyalty: nextLoyalty,
          flashWholesaleDeal: nextFlash,
          discoveredSpecIds: discoverSpec(prev.discoveredSpecIds, spec.id),
          todayStats: {
            ...prev.todayStats,
            wholesaleSpend: prev.todayStats.wholesaleSpend + totalCost,
          },
        };
        return applyXpGain(nextState, 18);
      } else {
        const cargoOrder: PendingWholesaleOrder = {
          id: `wh_ph_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
          kind: 'PHONE',
          label: `Sıfır ${spec.brand} ${spec.model}`,
          daysRemaining: 1,
          totalDays: 1,
          specId: spec.id,
          wholesaleCost,
        };
        const nextState: ShopState = {
          ...prev,
          cash: prev.cash - totalCost,
          pendingWholesaleOrders: [...(prev.pendingWholesaleOrders ?? []), cargoOrder],
          distributorLoyalty: nextLoyalty,
          flashWholesaleDeal: nextFlash,
          discoveredSpecIds: discoverSpec(prev.discoveredSpecIds, spec.id),
          todayStats: {
            ...prev.todayStats,
            wholesaleSpend: prev.todayStats.wholesaleSpend + totalCost,
          },
        };
        return applyXpGain(nextState, 18);
      }
    });

    pushFeedback(
      expressDelivery
        ? `-${formatTRY(totalCost)} · Sıfır ${spec.brand} ${spec.model} Hemen Geldi!`
        : `-${formatTRY(totalCost)} · Sıfır ${spec.brand} ${spec.model} Kargoya Verildi (1 Gün)!`,
      'positive'
    );
  };

  const handleClaimStoryChapter = (chapterId: string) => {
    const ch = STORY_CHAPTERS.find((c) => c.id === chapterId);
    if (
      !ch ||
      shop.claimedChapterIds.includes(chapterId) ||
      getStoryChapterCurrentValue(shop, ch) < ch.target
    ) {
      return;
    }
    soundFX.playQuestClaim();
    pushFeedback(
      `Hikaye Bölümü Tamam! +${formatTRY(ch.rewardCash)}`,
      'positive'
    );
    setShop((prev) => {
      const updated: ShopState = {
        ...prev,
        cash: prev.cash + ch.rewardCash,
        claimedChapterIds: [...prev.claimedChapterIds, chapterId],
        todayStats: {
          ...prev.todayStats,
          questRewards: prev.todayStats.questRewards + ch.rewardCash,
        },
      };
      return applyXpGain(updated, ch.rewardXp);
    });
  };

  const handleNextCustomer = () => {
    soundFX.playClick();
    if (shop.currentQueueIndex + 1 < shop.dailyQueue.length) {
      // Compute turn ticks ONCE (prevents double-random desync between toast and state!)
      const staffTick = advanceStaffRepairsOnTurn(shop);
      const rivalTick = tickRivalFlashSnatch(shop.flashWholesaleDeal);

      if (staffTick.notifications.length > 0) {
        pushFeedback(staffTick.notifications[0], 'positive');
      }
      if (rivalTick.justSoldOut && shop.flashWholesaleDeal) {
        pushFeedback(
          `Rakipler ${shop.flashWholesaleDeal.brand} indirim stoğunu tüketti!`,
          'negative'
        );
      }

      setShop((prev) => {
        const nextIdx = prev.currentQueueIndex + 1;
        const nextQueue = [...prev.dailyQueue];

        // Guard against ghost/unlisted/staff-assigned phone buyers in the queue!
        const incoming = nextQueue[nextIdx];
        if (incoming && (incoming.type === 'BUYER' || incoming.type === 'TRADE_IN')) {
          const liveDevice = staffTick.updatedInventory.find(
            (p) => p.uid === incoming.device.uid && p.listedForSale && !p.assignedToStaff
          );
          if (liveDevice) {
            // Sync live askingPrice if player updated it in Workshop
            if (liveDevice.askingPrice !== incoming.device.askingPrice) {
              nextQueue[nextIdx] =
                incoming.type === 'TRADE_IN'
                  ? createTradeInEncounter(
                      { ...prev, inventory: staffTick.updatedInventory },
                      liveDevice
                    )
                  : createBuyerEncounter(
                      { ...prev, inventory: staffTick.updatedInventory },
                      liveDevice
                    );
            }
          } else {
            const fallbackListed = staffTick.updatedInventory.find(
              (p) => p.listedForSale && !p.assignedToStaff
            );
            nextQueue[nextIdx] = fallbackListed
              ? incoming.type === 'TRADE_IN'
                ? createTradeInEncounter(
                    { ...prev, inventory: staffTick.updatedInventory },
                    fallbackListed
                  )
                : createBuyerEncounter(
                    { ...prev, inventory: staffTick.updatedInventory },
                    fallbackListed
                  )
              : createSellerEncounter({ ...prev, inventory: staffTick.updatedInventory });
          }
        }

        // Apply any queued store-event modifier to the incoming customer
        if (prev.nextCustomerEventEffect && nextQueue[nextIdx]) {
          nextQueue[nextIdx] = applyEventEffectToEncounter(
            nextQueue[nextIdx],
            prev.nextCustomerEventEffect
          );
        }

        // Possibly trigger a fresh mid-day Random Store Event for the following customer
        const newEvent = maybeTriggerRandomStoreEvent(prev);
        const queuedEffect = newEvent
          ? {
              title: newEvent.title,
              moodDelta: newEvent.moodDelta,
              patienceDelta: newEvent.patienceDelta,
              budgetMultiplier: newEvent.budgetMultiplier,
              visualKind: newEvent.visualKind,
            }
          : null;

        const netStaffPayout =
          staffTick.completedPayoutGross - staffTick.completedTax;

        let nextState: ShopState = {
          ...prev,
          cash: prev.cash + netStaffPayout,
          inventory: staffTick.updatedInventory,
          staffRepairQueue: staffTick.updatedQueue,
          flashWholesaleDeal: rivalTick.updatedDeal,
          dailyQueue: nextQueue,
          currentQueueIndex: nextIdx,
          activeStoreEvent: newEvent ?? null,
          nextCustomerEventEffect: queuedEffect,
          storeEventsTriggeredToday:
            (prev.storeEventsTriggeredToday ?? 0) + (newEvent ? 1 : 0),
          totalPhonesRepaired: prev.totalPhonesRepaired + staffTick.completedCount,
          totalProfitEarned: prev.totalProfitEarned + netStaffPayout,
          todayStats: {
            ...prev.todayStats,
            serviceRevenue:
              prev.todayStats.serviceRevenue + staffTick.completedPayoutGross,
            salesTaxPaid:
              (prev.todayStats.salesTaxPaid ?? 0) + staffTick.completedTax,
          },
        };
        if (staffTick.xpEarned > 0) {
          nextState = applyXpGain(nextState, staffTick.xpEarned);
        }
        if (staffTick.completedCount > 0) {
          nextState = applyQuestProgress(nextState, 'REPAIR_PHONE', staffTick.completedCount);
        }
        return nextState;
      });
    } else {
      // Also advance Hasan Usta's queue on the final customer turn of the day!
      const finalStaffTick = advanceStaffRepairsOnTurn(shop);
      for (const note of finalStaffTick.notifications) {
        pushFeedback(note, 'positive');
      }
      const netFinalStaffPayout =
        finalStaffTick.completedPayoutGross - finalStaffTick.completedTax;
      const stateAfterFinalStaff: ShopState = {
        ...shop,
        cash: shop.cash + netFinalStaffPayout,
        inventory: finalStaffTick.updatedInventory,
        staffRepairQueue: finalStaffTick.updatedQueue,
      };

      const rent = getDailyRent(stateAfterFinalStaff.day, stateAfterFinalStaff.shopTier);
      const wages = getDailyStaffWages(stateAfterFinalStaff.staff);
      const techWork = applyMasterTechEndOfDay(stateAfterFinalStaff);
      const passiveAcc = simulateEndOfDayAccessorySales(stateAfterFinalStaff);
      const { taxAmount: passiveAccTax } = calculateSaleTax(
        passiveAcc.revenue,
        stateAfterFinalStaff.staff,
        stateAfterFinalStaff.staffLevels
      );
      const empireEod = processEmpireEndOfDay(stateAfterFinalStaff);
      const nextCash =
        stateAfterFinalStaff.cash +
        passiveAcc.revenue -
        passiveAccTax +
        empireEod.branchIncome -
        rent -
        wages -
        techWork.cost -
        empireEod.loanPayments;
      soundFX.playDayComplete();

      if (empireEod.overdueTaxNotice) {
        pushFeedback('Maliye Gecikme Cezası Uygulandı (-0.15★)!', 'negative');
      }

      const remainingAccessoryUnits = Object.values(passiveAcc.updatedAccessories).reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      const hasPendingOrders = (shop.pendingWholesaleOrders?.length ?? 0) > 0;

      setShop((prev) => {
        const nextRepAfterTax = Math.max(
          1,
          Math.min(5, prev.reputation + empireEod.overdueTaxRepDelta)
        );
        const finalStats = {
          ...prev.todayStats,
          rentCost: rent,
          staffWages: wages,
          serviceRevenue:
            prev.todayStats.serviceRevenue + finalStaffTick.completedPayoutGross,
          repairSpend: prev.todayStats.repairSpend + techWork.cost,
          accessoriesSold: prev.todayStats.accessoriesSold + passiveAcc.unitsSold,
          accessoryRevenue: prev.todayStats.accessoryRevenue + passiveAcc.revenue,
          salesTaxPaid:
            (prev.todayStats.salesTaxPaid ?? 0) +
            finalStaffTick.completedTax +
            passiveAccTax,
          branchIncome: (prev.todayStats.branchIncome ?? 0) + empireEod.branchIncome,
          loanPayments: (prev.todayStats.loanPayments ?? 0) + empireEod.loanPayments,
          reputationDelta:
            prev.todayStats.reputationDelta + empireEod.overdueTaxRepDelta,
          autoRepairedNote: techWork.note,
          passiveAccessoryNote: passiveAcc.note,
        };
        const historyEntry = buildDayHistoryEntry(
          finalStats,
          prev.dailyNews.headline,
          nextRepAfterTax,
          nextCash
        );
        const filteredHistory = prev.history.filter(
          (entry) => entry.day !== prev.day
        );
        let nextState: ShopState = {
          ...prev,
          cash: nextCash,
          reputation: nextRepAfterTax,
          inventory: techWork.updatedInventory,
          staffRepairQueue: finalStaffTick.updatedQueue,
          accessories: passiveAcc.updatedAccessories,
          activeLoans: empireEod.updatedLoans,
          weeklyTaxDue: empireEod.newWeeklyTaxDue,
          rival: empireEod.updatedRival,
          morningNotifications: empireEod.overdueTaxNotice
            ? [empireEod.overdueTaxNotice, ...(prev.morningNotifications ?? [])]
            : prev.morningNotifications,
          totalPhonesRepaired:
            prev.totalPhonesRepaired + finalStaffTick.completedCount + techWork.fixedCount,
          totalAccessoriesSold:
            prev.totalAccessoriesSold + passiveAcc.unitsSold,
          totalProfitEarned:
            prev.totalProfitEarned +
            netFinalStaffPayout +
            (passiveAcc.profit - passiveAccTax) +
            empireEod.branchIncome,
          todayStats: finalStats,
          history: [...filteredHistory, historyEntry],
        };
        if (finalStaffTick.xpEarned > 0) {
          nextState = applyXpGain(nextState, finalStaffTick.xpEarned);
        }
        if (finalStaffTick.completedCount > 0) {
          nextState = applyQuestProgress(
            nextState,
            'REPAIR_PHONE',
            finalStaffTick.completedCount
          );
        }
        if (passiveAcc.unitsSold > 0) {
          nextState = applyXpGain(nextState, passiveAcc.unitsSold * 4);
          nextState = applyQuestProgress(
            nextState,
            'SELL_ACCESSORY',
            passiveAcc.unitsSold
          );
        }
        return nextState;
      });

      if (
        nextCash < 0 &&
        techWork.updatedInventory.length === 0 &&
        remainingAccessoryUnits === 0 &&
        !hasPendingOrders
      ) {
        setScreen('GAME_OVER');
      } else {
        setScreen('DAY_SUMMARY');
      }
    }
  };

  const handleStartNextDay = () => {
    soundFX.playClick();
    setShop((prev) => {
      const nextDay = prev.day + 1;
      const nextNews = pickDailyNewspaper(nextDay, prev.dailyNews.id);
      const timers = advanceDayTimers(prev, nextNews);
      let nextDiscovered = prev.discoveredSpecIds;
      for (const specId of timers.arrivedSpecIds) {
        nextDiscovered = discoverSpec(nextDiscovered, specId);
      }
      const carriedTaxAlerts = (prev.morningNotifications ?? []).filter((n) =>
        n.startsWith('Maliye Gecikme İhbarı')
      );
      const nextBase: ShopState = {
        ...prev,
        day: nextDay,
        shopTier: timers.shopTier,
        showcaseUpgradeLevel: timers.showcaseUpgradeLevel,
        upgrades: timers.upgrades,
        branches: timers.branches,
        staffLevels: timers.staffLevels,
        pendingProjects: timers.pendingProjects,
        pendingWholesaleOrders: timers.pendingWholesaleOrders,
        accessories: timers.accessories,
        inventory: timers.inventory,
        discoveredSpecIds: nextDiscovered,
        morningNotifications: [...carriedTaxAlerts, ...timers.notifications],
        dailyNews: nextNews,
        dailyWholesaleDiscountBrand: pickDailyWholesaleDiscountBrand(nextDay),
        flashWholesaleDeal: generateFlashWholesaleDeal(nextDay, prev.level),
        activeStoreEvent: null,
        nextCustomerEventEffect: null,
        storeEventsTriggeredToday: 0,
        dailyQuests: generateDailyQuests(
          nextDay,
          timers.upgrades,
          prev.level,
          detectPlayerPlaystyle(prev),
          prev.prestigeLevel ?? 0
        ),
        currentQueueIndex: 0,
        todayStats: createEmptyDayStats(nextDay, timers.shopTier, prev.staff),
      };
      nextBase.dailyQueue = generateDailyQueue(nextBase);
      nextBase.onlineListings = [
        ...timers.onlineListings,
        ...generateOnlineClassifieds(nextBase),
      ];
      nextBase.shippingOrders = generateShippingOrders(nextBase);
      const lots = generateDailyAuctionLots(nextBase);
      nextBase.dailyAuctionLots = lots;
      nextBase.dailyAuctionLot = lots[0] ?? null;

      if (getWeekdayInfo(nextDay).isSunday) {
        nextBase.sundayKermes = generateSundayKermes(nextBase);
        nextBase.morningNotifications = [
          'Bugün PAZAR! Piyasa sekmesinde Esnaf Kermesi açıldı — stoktaki cihazları hızlıca elden çıkar veya yarı fiyatına nadir parça topla!',
          ...nextBase.morningNotifications,
        ];
      } else {
        nextBase.sundayKermes = null;
      }

      return nextBase;
    });
    setActiveTab('COUNTER');
    setScreen('MORNING_NEWS');
  };

  const handleKermesSellPhone = (phoneUid: string) => {
    if (!getWeekdayInfo(shop.day).isSunday || !shop.sundayKermes) return;
    const phone = shop.inventory.find((p) => p.uid === phoneUid && !p.assignedToStaff);
    if (!phone) return;
    const fairVal = calculateMarketValue(
      phone,
      false,
      shop.dailyNews,
      shop.upgrades,
      shop.day
    );
    const salePrice = Math.max(
      1000,
      roundPrice(fairVal * shop.sundayKermes.clearanceMultiplier)
    );
    const netProfit = salePrice - (phone.purchasePrice + phone.repairSpend);

    soundFX.playCashRegister();
    triggerHaptic(shop.hapticsEnabled, 'success');
    pushFeedback(
      `Kermeste Elden Çıkarıldı: +${formatTRY(salePrice)} (${netProfit >= 0 ? '+' : ''}${formatTRY(netProfit)})`,
      'positive'
    );

    setShop((prev) => {
      if (!prev.sundayKermes) return prev;
      let nextState: ShopState = {
        ...prev,
        cash: prev.cash + salePrice,
        inventory: prev.inventory.filter((p) => p.uid !== phoneUid),
        totalPhonesSold: prev.totalPhonesSold + 1,
        totalProfitEarned: prev.totalProfitEarned + Math.max(0, netProfit),
        bestSingleDealProfit: Math.max(prev.bestSingleDealProfit, netProfit),
        sundayKermes: {
          ...prev.sundayKermes,
          clearanceSoldCount: prev.sundayKermes.clearanceSoldCount + 1,
        },
        todayStats: {
          ...prev.todayStats,
          phonesSold: prev.todayStats.phonesSold + 1,
          salesRevenue: prev.todayStats.salesRevenue + salePrice,
        },
      };
      nextState = applyXpGain(nextState, 25);
      return applyQuestProgress(nextState, 'SELL_PHONE', 1);
    });
  };

  const handleBuyKermesDeal = (dealId: string) => {
    if (!getWeekdayInfo(shop.day).isSunday || !shop.sundayKermes) return;
    const deal = shop.sundayKermes.deals.find((d) => d.id === dealId && !d.bought);
    if (!deal || shop.cash < deal.kermesPrice) return;

    soundFX.playCashRegister();
    triggerHaptic(shop.hapticsEnabled, 'success');
    pushFeedback(
      `Kermes Fırsatı Kapıldı! ${deal.title} (-${formatTRY(deal.kermesPrice)})`,
      'positive'
    );

    setShop((prev) => {
      if (!prev.sundayKermes) return prev;
      const target = prev.sundayKermes.deals.find((d) => d.id === dealId && !d.bought);
      if (!target || prev.cash < target.kermesPrice) return prev;

      let nextSpareParts = {
        screen: prev.spareParts?.screen ?? 0,
        battery: prev.spareParts?.battery ?? 0,
        board_kit: prev.spareParts?.board_kit ?? 0,
      };
      let nextAccessories = { ...prev.accessories };
      let nextInventory = prev.inventory;
      let nextDiscovered = prev.discoveredSpecIds;

      if (target.kind === 'SPARE_PART_BUNDLE' && target.partId && target.partQty) {
        nextSpareParts = {
          ...nextSpareParts,
          [target.partId]: nextSpareParts[target.partId] + target.partQty,
        };
      } else if (
        target.kind === 'ACCESSORY_BUNDLE' &&
        target.accessoryId &&
        target.accessoryQty
      ) {
        const curAcc = nextAccessories[target.accessoryId];
        if (curAcc) {
          nextAccessories = {
            ...nextAccessories,
            [target.accessoryId]: {
              ...curAcc,
              quantity: curAcc.quantity + target.accessoryQty,
            },
          };
        }
      } else if (target.kind === 'BARGAIN_PHONE' && target.phone) {
        const acquiredPhone = {
          ...target.phone,
          dayAcquired: prev.day,
          purchasePrice: target.kermesPrice,
        };
        nextInventory = [acquiredPhone, ...prev.inventory];
        nextDiscovered = discoverSpec(nextDiscovered, acquiredPhone.specId);
      }

      const nextDeals = prev.sundayKermes.deals.map((d) =>
        d.id === dealId ? { ...d, bought: true } : d
      );

      let nextState: ShopState = {
        ...prev,
        cash: prev.cash - target.kermesPrice,
        spareParts: nextSpareParts,
        accessories: nextAccessories,
        inventory: nextInventory,
        discoveredSpecIds: nextDiscovered,
        sundayKermes: {
          ...prev.sundayKermes,
          deals: nextDeals,
        },
        todayStats: {
          ...prev.todayStats,
          wholesaleSpend: prev.todayStats.wholesaleSpend + target.kermesPrice,
        },
      };
      nextState = applyXpGain(nextState, 20);
      return nextState;
    });
  };

  const applyInventoryRepair = (
    phoneUid: string,
    defectIds: DefectId[],
    cost: number,
    masterCrafted: boolean,
    quality: RepairQuality = masterCrafted ? 'MASTER' : 'STANDARD',
    usedParts?: Partial<Record<SparePartId, number>>
  ) => {
    if (defectIds.length === 0) return;
    const effectiveMaster = masterCrafted;
    const craftPct = getMasterCraftBonusPercent(shop.upgrades);
    soundFX.playRepair();
    pushFeedback(
      effectiveMaster
        ? `${cost === 0 ? 'Stoktan' : `-${formatTRY(cost)}`} · ${defectIds.length} Arıza Usta İşi (+%${craftPct} Değer)!`
        : quality === 'ROUGH'
        ? `${cost === 0 ? 'Stoktan' : `-${formatTRY(cost)}`} · Onarıldı (Kaba İşçilik · Geri Dönüş Riski!)`
        : `${cost === 0 ? 'Stoktan' : `-${formatTRY(cost)}`} · ${defectIds.length} Arıza Onarıldı`,
      quality === 'ROUGH' ? 'amber' : 'positive'
    );

    setShop((prev) => {
      const fixedBattery =
        defectIds.includes('battery_degraded') ||
        defectIds.includes('battery_fake_chip');
      const nextInv = prev.inventory.map((phone) => {
        if (phone.uid !== phoneUid) return phone;
        const nextDefects = phone.defects.filter((d) => !defectIds.includes(d));
        const nextOrigins = { ...(phone.repairedPartOrigins ?? {}) };
        const usedQuota: Record<SparePartId, number> = {
          screen: usedParts?.screen ?? 0,
          battery: usedParts?.battery ?? 0,
          board_kit: usedParts?.board_kit ?? 0,
        };
        for (const d of defectIds) {
          const partType = getSparePartForDefect(d);
          if (partType && usedQuota[partType] > 0) {
            usedQuota[partType] -= 1;
            nextOrigins[d] = 'OEM_STOCK';
          } else {
            nextOrigins[d] = 'SERVICE_PART';
          }
        }
        const updatedPhone: PhoneDevice = {
          ...phone,
          defects: nextDefects,
          repairedDefects: [...phone.repairedDefects, ...defectIds],
          repairedPartOrigins: nextOrigins,
          repairSpend: phone.repairSpend + cost,
          masterCrafted: phone.masterCrafted || effectiveMaster,
          lastRepairQuality: quality,
          batteryHealth: fixedBattery ? 100 : phone.batteryHealth,
          reportedBatteryHealth: fixedBattery ? 100 : phone.reportedBatteryHealth,
          batteryCycles: fixedBattery ? 1 : phone.batteryCycles,
        };
        const newFair = calculateMarketValue(
          updatedPhone,
          false,
          prev.dailyNews,
          prev.upgrades,
          prev.day
        );
        return {
          ...updatedPhone,
          askingPrice: Math.max(updatedPhone.askingPrice, roundPrice(newFair * 1.15)),
        };
      });

      const nextSpareParts = usedParts
        ? {
            screen: Math.max(0, (prev.spareParts?.screen ?? 0) - (usedParts.screen ?? 0)),
            battery: Math.max(0, (prev.spareParts?.battery ?? 0) - (usedParts.battery ?? 0)),
            board_kit: Math.max(0, (prev.spareParts?.board_kit ?? 0) - (usedParts.board_kit ?? 0)),
          }
        : prev.spareParts;

      let nextState: ShopState = {
        ...prev,
        cash: prev.cash - cost,
        inventory: nextInv,
        spareParts: nextSpareParts,
        totalPhonesRepaired: prev.totalPhonesRepaired + 1,
        todayStats: {
          ...prev.todayStats,
          repairSpend: prev.todayStats.repairSpend + cost,
        },
      };
      nextState = applyXpGain(
        nextState,
        (effectiveMaster ? 55 : 25) + (defectIds.length - 1) * 15
      );
      return applyQuestProgress(nextState, 'REPAIR_PHONE', 1);
    });
  };

  const handleQuickRepairDefects = (
    phoneUid: string,
    defectIds: DefectId[],
    external: boolean
  ) => {
    const stockCalc = external
      ? {
          cashCost: getMultiRepairCost(
            defectIds,
            shop.upgrades,
            shop.dailyNews,
            true,
            shop.level,
            shop.legacyPath,
            shop.prestigePerks
          ),
          baseCost: 0,
          usedParts: {} as Partial<Record<SparePartId, number>>,
          usedStockCount: 0,
        }
      : getRepairCostWithStock(
          defectIds,
          shop.spareParts,
          shop.upgrades,
          shop.dailyNews,
          false,
          shop.level,
          shop.legacyPath,
          shop.prestigePerks
        );
    const expressFee = external
      ? 0
      : getQuickRepairExpressFee(
          stockCalc.cashCost > 0 ? stockCalc.cashCost : stockCalc.baseCost
        );
    const totalCost = stockCalc.cashCost + expressFee;
    if (shop.cash < totalCost) return;
    applyInventoryRepair(
      phoneUid,
      defectIds,
      totalCost,
      false,
      'STANDARD',
      stockCalc.usedParts
    );
  };

  const handleStartMiniRepair = (
    phone: PhoneDevice,
    defectIds: DefectId[],
    cost: number
  ) => {
    if (shop.cash < cost || defectIds.length === 0) return;
    soundFX.playClick();
    setMiniRepairJob({ mode: 'INVENTORY', phone, defectIds, cost });
  };

  const handleDelegateRepairToMaster = (
    phoneUid: string,
    defectIds: DefectId[]
  ) => {
    if (!shop.staff.includes('master_tech') || defectIds.length === 0) return;
    const phone = shop.inventory.find((p) => p.uid === phoneUid);
    if (!phone || phone.assignedToStaff) return;
    const masterLevel = shop.staffLevels?.master_tech ?? 1;
    const masterSpecs = getMasterTechSpecs(masterLevel, shop.upgrades);
    if ((shop.staffRepairQueue?.length ?? 0) >= masterSpecs.maxParallelJobs) return;
    const rawCost = getMultiRepairCost(
      defectIds,
      shop.upgrades,
      shop.dailyNews,
      false,
      shop.level,
      shop.legacyPath
    );
    const partCost = calculateMasterDelegateCost(rawCost, masterLevel, shop.upgrades);
    if (shop.cash < partCost) return;

    const job: StaffRepairJob = {
      id: `srep_${Date.now()}`,
      mode: 'INVENTORY',
      phoneUid: phone.uid,
      deviceName: `${phone.brand} ${phone.model}`,
      defectIds,
      turnsRemaining: masterSpecs.turnsPerJob,
      totalTurns: masterSpecs.turnsPerJob,
      payout: 0,
    };

    soundFX.playRepair();
    pushFeedback(
      `Hasan Usta’ya Verildi (-${formatTRY(partCost)} · ${masterSpecs.turnsPerJob} Tur)`,
      'positive'
    );

    setShop((prev) => ({
      ...prev,
      cash: prev.cash - partCost,
      inventory: prev.inventory.map((p) =>
        p.uid === phoneUid
          ? { ...p, assignedToStaff: true, listedForSale: false, repairSpend: p.repairSpend + partCost }
          : p
      ),
      staffRepairQueue: [...(prev.staffRepairQueue ?? []), job],
      todayStats: {
        ...prev.todayStats,
        repairSpend: prev.todayStats.repairSpend + partCost,
      },
    }));
  };

  const handleMiniRepairSuccess = (
    masterCrafted: boolean,
    quality?: RepairQuality
  ) => {
    if (!miniRepairJob) return;
    const job = miniRepairJob;
    const resolvedQuality: RepairQuality =
      quality ?? (masterCrafted ? 'MASTER' : 'STANDARD');
    setMiniRepairJob(null);

    if (job.mode === 'INVENTORY') {
      const stockCalc = getRepairCostWithStock(
        job.defectIds,
        shop.spareParts,
        shop.upgrades,
        shop.dailyNews,
        false,
        shop.level,
        shop.legacyPath,
        shop.prestigePerks
      );
      applyInventoryRepair(
        job.phone.uid,
        job.defectIds,
        stockCalc.cashCost,
        resolvedQuality === 'MASTER',
        resolvedQuality,
        stockCalc.usedParts
      );
    } else {
      const tip =
        resolvedQuality === 'MASTER'
          ? 1000
          : resolvedQuality === 'STANDARD'
          ? 350
          : 0;
      completeExpressRepair(tip, 0, resolvedQuality);
    }
  };

  const handleTriggerPrestige = () => {
    const earned = getPrestigePointsEarned(shop);
    if (earned <= 0) return;
    soundFX.playDayComplete();
    const nextState = executePrestigeReset(shop);
    setShop(nextState);
    setActiveTab('COUNTER');
    setScreen('MORNING_NEWS');
    pushFeedback(
      `PRESTİJ DÖNEMİ #${nextState.prestigeLevel}! +${earned} Prestij Puanı Kazanıldı!`,
      'positive'
    );
    pushBadgeNotification({
      kicker: `PRESTİJ DÖNEMİ #${nextState.prestigeLevel}`,
      title: `+${earned} Prestij Puanı!`,
      subtitle: 'Müze, seviye ve kalıcı avantajlarınla yeni döneme geçtin!',
      accent: 'gold',
      icon: 'trophy',
    });
  };

  const handleBuyPrestigePerk = (perkId: PrestigePerkId) => {
    const perk = PRESTIGE_PERKS.find((p) => p.id === perkId);
    if (!perk) return;
    const owned = shop.prestigePerks ?? [];
    if (owned.includes(perkId)) return;
    if ((shop.prestigePoints ?? 0) < perk.cost) return;

    soundFX.playDayComplete();
    pushFeedback(`Kalıcı Prestij Avantajı Açıldı: ${perk.trName}!`, 'positive');
    setShop((prev) => {
      const nextUpgrades = [...prev.upgrades];
      if (perkId === 'golden_pliers' && !nextUpgrades.includes('repair_bench')) {
        nextUpgrades.push('repair_bench');
      }
      if (perkId === 'seed_capital' && !nextUpgrades.includes('accessory_license')) {
        nextUpgrades.push('accessory_license');
      }
      if (perkId === 'vip_network' && !nextUpgrades.includes('classifieds_license')) {
        nextUpgrades.push('classifieds_license');
      }
      return {
        ...prev,
        prestigePoints: (prev.prestigePoints ?? 0) - perk.cost,
        prestigePerks: [...(prev.prestigePerks ?? []), perkId],
        upgrades: nextUpgrades,
      };
    });
  };

  const handleClaimDailyQuest = (questId: string) => {
    const quest = shop.dailyQuests.find((q) => q.id === questId);
    if (!quest || quest.claimed || quest.progress < quest.target) return;
    soundFX.playQuestClaim();
    pushFeedback(
      `+${formatTRY(quest.reward)} Görev Ödülü!`,
      'positive'
    );
    setShop((prev) => {
      const nextQuests = prev.dailyQuests.map((q) =>
        q.id === questId ? { ...q, claimed: true } : q
      );
      const updated: ShopState = {
        ...prev,
        cash: prev.cash + quest.reward,
        dailyQuests: nextQuests,
        todayStats: {
          ...prev.todayStats,
          questRewards: prev.todayStats.questRewards + quest.reward,
        },
      };
      return applyXpGain(updated, quest.xpReward);
    });
  };

  const handleClaimMilestone = (milestoneId: string) => {
    const ms = CAREER_MILESTONES.find((m) => m.id === milestoneId);
    if (
      !ms ||
      shop.claimedMilestoneIds.includes(milestoneId) ||
      getMilestoneCurrentValue(shop, ms) < ms.target
    ) {
      return;
    }
    soundFX.playQuestClaim();
    pushFeedback(
      `Kariyer Ödülü: +${formatTRY(ms.rewardCash)}!`,
      'positive'
    );
    setShop((prev) => {
      const updated: ShopState = {
        ...prev,
        cash: prev.cash + ms.rewardCash,
        claimedMilestoneIds: [...prev.claimedMilestoneIds, milestoneId],
        todayStats: {
          ...prev.todayStats,
          questRewards: prev.todayStats.questRewards + ms.rewardCash,
        },
      };
      return applyXpGain(updated, ms.rewardXp);
    });
  };

  const handleAddBoxKit = (phoneUid: string) => {
    const cost = shop.upgrades.includes('parts_wholesale') ? 420 : BOX_KIT_COST;
    if (shop.cash < cost) return;
    soundFX.playRepair();
    pushFeedback(`-${formatTRY(cost)} · Kutu & Şarj Seti Eklendi`, 'positive');

    setShop((prev) => ({
      ...prev,
      cash: prev.cash - cost,
      inventory: prev.inventory.map((phone) => {
        if (phone.uid !== phoneUid) return phone;
        const updated = {
          ...phone,
          hasBoxAndCharger: true,
          repairSpend: phone.repairSpend + cost,
        };
        return {
          ...updated,
          askingPrice: roundPrice(
            calculateMarketValue(updated, false, prev.dailyNews, prev.upgrades) * 1.15
          ),
        };
      }),
      todayStats: {
        ...prev.todayStats,
        repairSpend: prev.todayStats.repairSpend + cost,
      },
    }));
  };

  const handleUpdateListing = (
    phoneUid: string,
    listed: boolean,
    askingPrice: number
  ) => {
    setShop((prev) => {
      const targetBefore = prev.inventory.find((p) => p.uid === phoneUid);
      if (targetBefore && targetBefore.listedForSale !== listed) {
        soundFX.playClick();
      }
      return {
        ...prev,
        inventory: prev.inventory.map((p) =>
          p.uid === phoneUid ? { ...p, listedForSale: listed, askingPrice } : p
        ),
      };
    });
  };

  const handleScrapSellPhone = (phoneUid: string) => {
    const target = shop.inventory.find((p) => p.uid === phoneUid);
    if (!target || target.assignedToStaff) return;
    const payout = getScrapSaleValue(target, shop.dailyNews, shop.upgrades, shop.day);
    const totalCost = target.purchasePrice + target.repairSpend;
    const netDelta = payout - totalCost;
    soundFX.playCashRegister();
    triggerHaptic(shop.hapticsEnabled, 'medium');
    pushFeedback(
      `Parçacıya Satıldı: +${formatTRY(payout)} (${netDelta >= 0 ? '+' : ''}${formatTRY(netDelta)})`,
      netDelta >= 0 ? 'positive' : 'amber'
    );
    setShop((prev) => ({
      ...prev,
      cash: prev.cash + payout,
      inventory: prev.inventory.filter((p) => p.uid !== phoneUid),
      todayStats: {
        ...prev.todayStats,
        salesRevenue: prev.todayStats.salesRevenue + payout,
      },
    }));
  };

  const handleBuyUpgrade = (upgradeId: UpgradeId) => {
    const upg = SHOP_UPGRADES.find((u) => u.id === upgradeId);
    if (
      !upg ||
      shop.upgrades.includes(upgradeId) ||
      shop.cash < upg.cost ||
      (shop.pendingProjects ?? []).some(
        (p) => p.kind === 'UPGRADE' && p.targetId === upgradeId
      )
    ) {
      return;
    }
    soundFX.playCashRegister();
    const installDays = upg.installDays ?? 0;
    if (installDays > 0) {
      pushFeedback(
        `${upg.name} Sipariş Edildi · Kurulum ${installDays} Gün Sürecek`,
        'positive'
      );
      const proj: TimedProject = {
        id: `proj_upg_${Date.now()}`,
        kind: 'UPGRADE',
        targetId: upgradeId,
        label: upg.name,
        daysRemaining: installDays,
        totalDays: installDays,
      };
      setShop((prev) => ({
        ...prev,
        cash: prev.cash - upg.cost,
        pendingProjects: [...(prev.pendingProjects ?? []), proj],
      }));
    } else {
      pushFeedback(`${upg.name} Kuruldu!`, 'positive');
      setShop((prev) => ({
        ...prev,
        cash: prev.cash - upg.cost,
        upgrades: [...prev.upgrades, upgradeId],
      }));
    }
  };

  const handleBuyShowcaseUpgrade = () => {
    const curLvl = shop.showcaseUpgradeLevel ?? 0;
    if (curLvl >= SHOWCASE_UPGRADE_MAX_LEVEL) return;
    if ((shop.pendingProjects ?? []).some((p) => p.kind === 'SHOWCASE_UPGRADE')) {
      return;
    }
    const cost = getShowcaseUpgradeCost(curLvl);
    if (shop.cash < cost) return;
    soundFX.playCashRegister();
    pushFeedback(
      `Vitrin Rafı Sv.${curLvl + 1} Montajı Başladı (1 Gün · +2 Yuva)!`,
      'positive'
    );
    const proj: TimedProject = {
      id: `proj_show_${Date.now()}`,
      kind: 'SHOWCASE_UPGRADE',
      targetId: String(curLvl + 1),
      label: `Vitrin Rafı Sv.${curLvl + 1} (+2 Yuva)`,
      daysRemaining: 1,
      totalDays: 1,
    };
    setShop((prev) => ({
      ...prev,
      cash: prev.cash - cost,
      pendingProjects: [...(prev.pendingProjects ?? []), proj],
    }));
  };

  const handleUpgradeShopTier = (targetTier: ShopTier) => {
    const info = SHOP_TIERS[targetTier];
    if (
      targetTier !== shop.shopTier + 1 ||
      shop.cash < info.cost ||
      shop.reputation < info.minReputation ||
      (shop.pendingProjects ?? []).some((p) => p.kind === 'SHOP_TIER')
    ) {
      return;
    }
    const renDays = info.renovationDays ?? 0;
    soundFX.playDayComplete();
    if (renDays > 0) {
      pushFeedback(
        `${info.name} Tadilatı Başladı (${renDays} Gün Sonra Açılacak)!`,
        'positive'
      );
      const proj: TimedProject = {
        id: `proj_tier_${Date.now()}`,
        kind: 'SHOP_TIER',
        targetId: String(targetTier),
        label: info.name,
        daysRemaining: renDays,
        totalDays: renDays,
      };
      setShop((prev) => ({
        ...prev,
        cash: prev.cash - info.cost,
        pendingProjects: [...(prev.pendingProjects ?? []), proj],
      }));
    } else {
      pushFeedback(`Yeni Dükkan Açıldı: ${info.name}!`, 'positive');
      setShop((prev) => {
        const nextState: ShopState = {
          ...prev,
          cash: prev.cash - info.cost,
          shopTier: targetTier,
        };
        if (checkVictoryCondition(nextState)) {
          window.setTimeout(() => setScreen('VICTORY'), 500);
        }
        return nextState;
      });
    }
  };

  const handleBuyDecoration = (decorId: DecorationId) => {
    const dec = SHOP_DECORATIONS.find((d) => d.id === decorId);
    if (
      !dec ||
      shop.decorations.includes(decorId) ||
      shop.cash < dec.cost
    ) {
      return;
    }
    soundFX.playCashRegister();
    pushFeedback(`${dec.name} Asıldı (+${dec.prestige} Prestij)`, 'positive');

    setShop((prev) => ({
      ...prev,
      cash: prev.cash - dec.cost,
      decorations: [...prev.decorations, decorId],
      activeDecorations: [...prev.activeDecorations, decorId],
    }));
  };

  const handleToggleDecoration = (decorId: DecorationId) => {
    soundFX.playClick();
    setShop((prev) => {
      const isActive = prev.activeDecorations.includes(decorId);
      return {
        ...prev,
        activeDecorations: isActive
          ? prev.activeDecorations.filter((id) => id !== decorId)
          : [...prev.activeDecorations, decorId],
      };
    });
  };

  const handleHireStaff = (staffId: StaffId) => {
    const member = SHOP_STAFF.find((s) => s.id === staffId);
    if (
      !member ||
      shop.staff.includes(staffId) ||
      shop.cash < member.hireCost
    ) {
      return;
    }
    soundFX.playCashRegister();
    pushFeedback(`${member.name} Ekibe Katıldı!`, 'positive');

    setShop((prev) => ({
      ...prev,
      cash: prev.cash - member.hireCost,
      staff: [...prev.staff, staffId],
      staffLevels: {
        ...prev.staffLevels,
        [staffId]: prev.staffLevels?.[staffId] ?? 1,
      },
    }));
  };

  const handleTrainStaff = (staffId: StaffId) => {
    if (!shop.staff.includes(staffId)) return;
    const currentLvl = shop.staffLevels?.[staffId] ?? 1;
    if (currentLvl >= STAFF_MAX_LEVEL) return;
    if (
      (shop.pendingProjects ?? []).some(
        (p) => p.kind === 'STAFF_TRAIN' && p.targetId === staffId
      )
    ) {
      return;
    }
    const cost = getStaffTrainingCost(currentLvl);
    const days = getStaffTrainingDays(currentLvl);
    if (shop.cash < cost) return;
    const member = SHOP_STAFF.find((s) => s.id === staffId);
    soundFX.playLevelUp();
    pushFeedback(
      `${member?.name ?? 'Ekip'} Eğitime Başladı (${days} Gün → Sv.${currentLvl + 1})!`,
      'positive'
    );
    const proj: TimedProject = {
      id: `proj_stf_${Date.now()}`,
      kind: 'STAFF_TRAIN',
      targetId: staffId,
      label: member?.name ?? staffId,
      daysRemaining: days,
      totalDays: days,
    };
    setShop((prev) => ({
      ...prev,
      cash: prev.cash - cost,
      pendingProjects: [...(prev.pendingProjects ?? []), proj],
    }));
  };

  const handleAttachAccessoryBundle = (
    phoneUid: string,
    accessoryId: AccessoryId
  ) => {
    const stock = shop.accessories[accessoryId];
    if (!stock || stock.quantity <= 0) return;
    const target = shop.inventory.find((p) => p.uid === phoneUid);
    if (!target || (target.bundledAccessories ?? []).includes(accessoryId)) return;
    const spec = getAccessorySpec(accessoryId);

    const bundleValueAdd = Math.round(spec.recommendedPrice * 1.1);
    soundFX.playRepair();
    pushFeedback(
      `${spec.name} Kutu Paketine Eklendi (+${formatTRY(bundleValueAdd)} Değer)!`,
      'positive'
    );
    setShop((prev) => {
      const nextAccessories = {
        ...prev.accessories,
        [accessoryId]: {
          ...prev.accessories[accessoryId],
          quantity: prev.accessories[accessoryId].quantity - 1,
        },
      };
      const nextInv = prev.inventory.map((phone) => {
        if (phone.uid !== phoneUid) return phone;
        const nextBundles = [...(phone.bundledAccessories ?? []), accessoryId];
        const updated: PhoneDevice = {
          ...phone,
          bundledAccessories: nextBundles,
        };
        const fairVal = calculateMarketValue(
          updated,
          false,
          prev.dailyNews,
          prev.upgrades
        );
        return {
          ...updated,
          askingPrice: Math.max(
            phone.askingPrice + stock.retailPrice,
            roundPrice(fairVal * 1.15)
          ),
        };
      });
      return {
        ...prev,
        accessories: nextAccessories,
        inventory: nextInv,
      };
    });
  };

  const handleDetachAccessoryBundle = (
    phoneUid: string,
    accessoryId: AccessoryId
  ) => {
    const target = shop.inventory.find((p) => p.uid === phoneUid);
    if (!target || !(target.bundledAccessories ?? []).includes(accessoryId)) return;
    const spec = getAccessorySpec(accessoryId);
    const stock = shop.accessories[accessoryId];

    soundFX.playClick();
    pushFeedback(
      `${spec.name} Paketten Çıkarıldı (+1 Stoğa İade)`,
      'amber'
    );
    setShop((prev) => {
      const nextAccessories = {
        ...prev.accessories,
        [accessoryId]: {
          ...prev.accessories[accessoryId],
          quantity: (prev.accessories[accessoryId]?.quantity ?? 0) + 1,
        },
      };
      const nextInv = prev.inventory.map((phone) => {
        if (phone.uid !== phoneUid) return phone;
        const nextBundles = (phone.bundledAccessories ?? []).filter(
          (id) => id !== accessoryId
        );
        const updated: PhoneDevice = {
          ...phone,
          bundledAccessories: nextBundles,
        };
        const fairVal = calculateMarketValue(
          updated,
          false,
          prev.dailyNews,
          prev.upgrades
        );
        const reducedAsk = Math.max(
          roundPrice(fairVal * 0.9),
          phone.askingPrice - (stock?.retailPrice ?? spec.recommendedPrice)
        );
        return {
          ...updated,
          askingPrice: roundPrice(Math.min(reducedAsk, fairVal * 1.2)),
        };
      });
      return {
        ...prev,
        accessories: nextAccessories,
        inventory: nextInv,
      };
    });
  };

  const handleBuyOutfit = (outfitId: OutfitId) => {
    const outfit = PLAYER_OUTFITS.find((o) => o.id === outfitId);
    if (
      !outfit ||
      (shop.ownedOutfits ?? []).includes(outfitId) ||
      shop.cash < outfit.cost
    ) {
      return;
    }
    soundFX.playCashRegister();
    pushFeedback(`${outfit.name} Satın Alındı & Giyildi!`, 'positive');
    setShop((prev) => ({
      ...prev,
      cash: prev.cash - outfit.cost,
      ownedOutfits: [...(prev.ownedOutfits ?? ['casual_hoodie']), outfitId],
      equippedOutfit: outfitId,
    }));
  };

  const handleEquipOutfit = (outfitId: OutfitId) => {
    if (!(shop.ownedOutfits ?? ['casual_hoodie']).includes(outfitId)) return;
    const outfit = PLAYER_OUTFITS.find((o) => o.id === outfitId);
    soundFX.playClick();
    pushFeedback(`Kıyafet Değiştirildi: ${outfit?.name ?? outfitId}`, 'amber');
    setShop((prev) => ({
      ...prev,
      equippedOutfit: outfitId,
    }));
  };

  const handleResolveStoreEventAction = () => {
    const ev = shop.activeStoreEvent;
    if (!ev || ev.resolved || !ev.actionLabel) return;
    const cost = ev.actionCost ?? 0;
    if (shop.cash < cost) return;
    soundFX.playScanOk();
    pushFeedback(
      `${ev.title} Çözüldü (${cost > 0 ? `-${formatTRY(cost)}` : 'Ücretsiz'})!`,
      'positive'
    );
    setShop((prev) => ({
      ...prev,
      cash: prev.cash - cost,
      activeStoreEvent: prev.activeStoreEvent
        ? { ...prev.activeStoreEvent, resolved: true }
        : null,
      nextCustomerEventEffect: {
        title: `${ev.title} (Çözüldü)`,
        moodDelta: ev.actionMoodDelta ?? Math.max(4, ev.moodDelta + 8),
        patienceDelta: ev.actionPatienceDelta ?? 8,
        budgetMultiplier: ev.actionBudgetMultiplier ?? 1.03,
        visualKind: ev.visualKind,
      },
    }));
  };

  const handleDismissStoreEvent = () => {
    soundFX.playClick();
    setShop((prev) => ({ ...prev, activeStoreEvent: null }));
  };

  const handleClaimDailyStreak = () => {
    if (shop.dailyStreakClaimed) return;
    const idx = Math.min(DAILY_STREAK_REWARDS.length - 1, Math.max(0, (shop.loginStreak ?? 1) - 1));
    const reward = DAILY_STREAK_REWARDS[idx];
    soundFX.playQuestClaim();
    pushFeedback(
      `Günlük Giriş Serisi #${reward.day}: +${formatTRY(reward.cash)}!`,
      'positive'
    );
    setShop((prev) => {
      const nextState: ShopState = {
        ...prev,
        cash: prev.cash + reward.cash,
        dailyStreakClaimed: true,
        todayStats: {
          ...prev.todayStats,
          questRewards: prev.todayStats.questRewards + reward.cash,
        },
      };
      return applyXpGain(nextState, reward.xp);
    });
  };

  // === PİYASA & İMPARATORLUK (EMPIRE) HANDLERS ===

  const handleInspectClassifiedOnsite = (listingId: string) => {
    const listing = shop.onlineListings.find((l) => l.id === listingId);
    if (
      !listing ||
      (listing.status && listing.status !== 'AVAILABLE') ||
      shop.cash < CLASSIFIED_ONSITE_FEE
    ) {
      return;
    }
    soundFX.playScanOk();
    pushFeedback(
      `-${formatTRY(CLASSIFIED_ONSITE_FEE)} · Yerinde Kontrol Yapıldı (${listing.device.defects.length} Kusur)`,
      'amber'
    );
    setShop((prev) => ({
      ...prev,
      cash: prev.cash - CLASSIFIED_ONSITE_FEE,
      onlineListings: prev.onlineListings.map((l) =>
        l.id === listingId
          ? {
              ...l,
              status: 'INSPECTED_ONSITE' as const,
              device: {
                ...l.device,
                inspected: { screen: true, battery: true, imei: true, hardware: true },
              },
            }
          : l
      ),
    }));
  };

  const handleOrderClassifiedCod = (listingId: string) => {
    const listing = shop.onlineListings.find((l) => l.id === listingId);
    if (
      !listing ||
      (listing.status && listing.status !== 'AVAILABLE') ||
      shop.cash < CLASSIFIED_COD_FEE
    ) {
      return;
    }
    soundFX.playClick();
    pushFeedback(
      `-${formatTRY(CLASSIFIED_COD_FEE)} · Kapıda Kontrollü Kargo İstendi (Yarın Gelir)`,
      'amber'
    );
    setShop((prev) => ({
      ...prev,
      cash: prev.cash - CLASSIFIED_COD_FEE,
      onlineListings: prev.onlineListings.map((l) =>
        l.id === listingId
          ? {
              ...l,
              status: 'SHIPPING_IN_TRANSIT' as const,
              deliveryDaysLeft: 1,
            }
          : l
      ),
    }));
  };

  const handleHaggleClassified = (listingId: string, offerPrice: number) => {
    const listing = shop.onlineListings.find((l) => l.id === listingId);
    if (!listing || listing.bought) return;
    const res = evaluateClassifiedHaggle(listing, offerPrice);
    if (res.accepted) {
      soundFX.playScanOk();
      pushFeedback(res.message, 'positive');
    } else if (res.rejectedWalkout) {
      soundFX.playScanDefect();
      pushFeedback(res.message, 'negative');
    } else {
      soundFX.playCounterOffer();
      pushFeedback('Satıcı Karşı Fiyat Verdi!', 'amber');
    }
    setShop((prev) => ({
      ...prev,
      onlineListings: prev.onlineListings.map((l) =>
        l.id === listingId ? res.updatedListing : l
      ),
    }));
  };

  const handleRejectClassified = (listingId: string) => {
    soundFX.playClick();
    pushFeedback('İlandan Vazgeçildi', 'amber');
    setShop((prev) => ({
      ...prev,
      onlineListings: prev.onlineListings.map((l) =>
        l.id === listingId ? { ...l, status: 'REJECTED' as const } : l
      ),
    }));
  };

  const handleBuyClassified = (listingId: string) => {
    const listing = shop.onlineListings.find((l) => l.id === listingId);
    const price = listing ? listing.currentPrice ?? listing.askingPrice : 0;
    if (!listing || listing.bought || shop.cash < price) return;
    soundFX.playCashRegister();
    pushFeedback(`-${formatTRY(price)} · İlan Cihazı Atölyeye Alındı!`, 'amber');
    const fairVal = calculateMarketValue(
      listing.device,
      false,
      shop.dailyNews,
      shop.upgrades
    );
    const boughtPhone: PhoneDevice = {
      ...listing.device,
      purchasePrice: price,
      inspected: { screen: true, battery: true, imei: true, hardware: true },
      listedForSale: false,
      askingPrice: roundPrice(fairVal * 1.15),
    };
    setShop((prev) => {
      const nextState: ShopState = {
        ...prev,
        cash: prev.cash - price,
        inventory: [boughtPhone, ...prev.inventory],
        discoveredSpecIds: discoverSpec(prev.discoveredSpecIds, boughtPhone.specId),
        onlineListings: prev.onlineListings.map((l) =>
          l.id === listingId
            ? { ...l, bought: true, status: 'BOUGHT' as const }
            : l
        ),
        todayStats: {
          ...prev.todayStats,
          phonesBought: prev.todayStats.phonesBought + 1,
          buySpend: prev.todayStats.buySpend + price,
        },
      };
      return applyXpGain(nextState, 24);
    });
  };

  const handleFulfillShipping = (orderId: string, phoneUid: string) => {
    const order = shop.shippingOrders.find((o) => o.id === orderId);
    const phone = shop.inventory.find((p) => p.uid === phoneUid);
    if (!order || order.fulfilled || !phone) return;
    if (order.requireClean && phone.defects.length > 0) return;

    const gross =
      roundPrice(
        calculateMarketValue(phone, false, shop.dailyNews, shop.upgrades) *
          order.bonusMultiplier
      ) + order.shippingFee;
    const { taxAmount: saleTax, netAmount: netPayout } = calculateSaleTax(
      gross,
      shop.staff,
      shop.staffLevels
    );
    const profit = netPayout - (phone.purchasePrice + phone.repairSpend);

    soundFX.playCashRegister();
    pushFeedback(
      `+${formatTRY(netPayout)} · ${order.city} Kargo Satışı (-${formatTRY(saleTax)} vergi)!`,
      'positive'
    );

    setShop((prev) => {
      let nextState: ShopState = {
        ...prev,
        cash: prev.cash + netPayout,
        reputation: Math.min(5, prev.reputation + 0.1),
        inventory: prev.inventory.filter((p) => p.uid !== phoneUid),
        shippingOrders: prev.shippingOrders.map((o) =>
          o.id === orderId ? { ...o, fulfilled: true } : o
        ),
        totalPhonesSold: prev.totalPhonesSold + 1,
        totalProfitEarned: prev.totalProfitEarned + profit,
        bestSingleDealProfit: Math.max(prev.bestSingleDealProfit, profit),
        todayStats: {
          ...prev.todayStats,
          phonesSold: prev.todayStats.phonesSold + 1,
          salesRevenue: prev.todayStats.salesRevenue + gross,
          salesTaxPaid: (prev.todayStats.salesTaxPaid ?? 0) + saleTax,
          reputationDelta: prev.todayStats.reputationDelta + 0.1,
        },
      };
      nextState = applyXpGain(nextState, 42);
      nextState = applyQuestProgress(nextState, 'SELL_PHONE', 1);
      if (checkVictoryCondition(nextState)) {
        window.setTimeout(() => {
          soundFX.playDayComplete();
          setScreen('VICTORY');
        }, 450);
      }
      return nextState;
    });
  };

  const handleResolveAuction = (
    lotId: string,
    wonByPlayer: boolean,
    finalBid: number
  ) => {
    const lots =
      shop.dailyAuctionLots && shop.dailyAuctionLots.length > 0
        ? shop.dailyAuctionLots
        : shop.dailyAuctionLot
        ? [shop.dailyAuctionLot]
        : [];
    const lot = lots.find((l) => l.id === lotId);
    if (!lot || lot.resolved) return;

    if (!wonByPlayer) {
      soundFX.playClick();
      pushFeedback('Açık Artırma Seansı Rakibe Kaldı', 'amber');
      setShop((prev) => {
        const updatedLots = (prev.dailyAuctionLots ?? []).map((l) =>
          l.id === lotId
            ? { ...l, resolved: true, wonByPlayer: false, winningBid: finalBid }
            : l
        );
        return {
          ...prev,
          dailyAuctionLots: updatedLots,
          dailyAuctionLot: updatedLots[0] ?? prev.dailyAuctionLot,
        };
      });
      return;
    }

    if (shop.cash < finalBid) return;
    soundFX.playDayComplete();

    const perPhoneCost = Math.round(finalBid / Math.max(1, lot.devices.length));
    const wonDevices: PhoneDevice[] = lot.devices.map((d) => ({
      ...d,
      purchasePrice: perPhoneCost,
      inspected: { screen: true, battery: true, imei: true, hardware: true },
      listedForSale: false,
      askingPrice: roundPrice(
        calculateMarketValue(d, false, shop.dailyNews, shop.upgrades) * 1.15
      ),
    }));

    // Unpack Mystery Box rewards included in the won lot
    const mysteryRewards = lot.mysteryRewards ?? [];
    const mysteryPhones: PhoneDevice[] = [];
    let mysteryCashBonus = 0;
    const mysteryAccs: { id: AccessoryId; quantity: number }[] = [];
    for (const rew of mysteryRewards) {
      if (rew.extraDevice) {
        mysteryPhones.push({
          ...rew.extraDevice,
          purchasePrice: 0,
          inspected: { screen: true, battery: true, imei: true, hardware: true },
          listedForSale: false,
          askingPrice: roundPrice(
            calculateMarketValue(rew.extraDevice, false, shop.dailyNews, shop.upgrades) * 1.15
          ),
        });
      }
      if (rew.cashBonus && rew.cashBonus > 0) {
        mysteryCashBonus += rew.cashBonus;
      }
      if (rew.bonusAccessory) {
        mysteryAccs.push(rew.bonusAccessory);
      }
    }

    const totalAddedPhones = wonDevices.length + mysteryPhones.length;
    pushFeedback(
      mysteryRewards.length > 0
        ? `İHALE SENİN! ${totalAddedPhones} Cihaz + ${mysteryRewards.length} Gizemli Kutu Açıldı!`
        : `İHALE SENİN! ${wonDevices.length} Cihaz + Aksesuar Atölyede!`,
      'positive'
    );

    setShop((prev) => {
      const nextAccessories = { ...prev.accessories };
      for (const acc of [...lot.bonusAccessories, ...mysteryAccs]) {
        const cur = nextAccessories[acc.id];
        if (cur) {
          nextAccessories[acc.id] = {
            ...cur,
            quantity: cur.quantity + acc.quantity,
          };
        }
      }
      const allWonPhones = [...mysteryPhones, ...wonDevices];
      let nextDisc = prev.discoveredSpecIds;
      for (const p of allWonPhones) {
        nextDisc = discoverSpec(nextDisc, p.specId);
      }
      const updatedLots = (prev.dailyAuctionLots ?? []).map((l) =>
        l.id === lotId
          ? { ...l, resolved: true, wonByPlayer: true, winningBid: finalBid }
          : l
      );
      const nextState: ShopState = {
        ...prev,
        cash: prev.cash - finalBid + mysteryCashBonus,
        inventory: [...allWonPhones, ...prev.inventory],
        accessories: nextAccessories,
        discoveredSpecIds: nextDisc,
        totalAuctionsWon: (prev.totalAuctionsWon ?? 0) + 1,
        dailyAuctionLots: updatedLots,
        dailyAuctionLot: updatedLots[0] ?? prev.dailyAuctionLot,
        todayStats: {
          ...prev.todayStats,
          phonesBought: prev.todayStats.phonesBought + allWonPhones.length,
          buySpend: prev.todayStats.buySpend + finalBid,
          questRewards: prev.todayStats.questRewards + mysteryCashBonus,
        },
      };
      return applyXpGain(nextState, 75);
    });
  };

  const handleUnlockBranch = (branchId: BranchId) => {
    const spec = CITY_BRANCHES.find((b) => b.id === branchId);
    if (
      !spec ||
      shop.branches.includes(branchId) ||
      shop.cash < spec.unlockCost ||
      shop.reputation < spec.minReputation ||
      (shop.pendingProjects ?? []).some(
        (p) => p.kind === 'BRANCH' && p.targetId === branchId
      )
    ) {
      return;
    }
    soundFX.playDayComplete();
    const buildDays = spec.buildDays ?? 2;
    pushFeedback(
      `${spec.name} İnşaatı Başladı (${buildDays} Gün Sonra Açılacak)!`,
      'positive'
    );
    const proj: TimedProject = {
      id: `proj_br_${Date.now()}`,
      kind: 'BRANCH',
      targetId: branchId,
      label: spec.name,
      daysRemaining: buildDays,
      totalDays: buildDays,
    };
    setShop((prev) => {
      const nextState: ShopState = {
        ...prev,
        cash: prev.cash - spec.unlockCost,
        pendingProjects: [...(prev.pendingProjects ?? []), proj],
      };
      return applyXpGain(nextState, 80);
    });
  };

  const handleRunRivalPromo = () => {
    const promoCost = 4500;
    if (shop.rival.boughtOut || shop.rival.promoUsedToday || shop.cash < promoCost) {
      return;
    }
    soundFX.playCashRegister();
    pushFeedback('Pasaj Kampanyası Başladı · Rakip Pazar Payı Düştü!', 'positive');
    setShop((prev) => ({
      ...prev,
      cash: prev.cash - promoCost,
      reputation: Math.min(5, prev.reputation + 0.08),
      rival: {
        ...prev.rival,
        marketShare: Math.max(5, prev.rival.marketShare - 9),
        promoUsedToday: true,
        lastTaunt:
          'Kurnaz Kerim: "Afiş mi astın tüm pasaja?! Müşterilerim hep senin kapına yığıldı!"',
      },
      todayStats: {
        ...prev.todayStats,
        reputationDelta: prev.todayStats.reputationDelta + 0.08,
      },
    }));
  };

  const handleBuyoutRival = () => {
    if (shop.rival.boughtOut || shop.cash < shop.rival.buyoutCost) return;
    soundFX.playDayComplete();
    pushFeedback('Kurnaz Kerim’in Dükkanını Devraldın (+3.500 ₺/gün)!', 'positive');
    setShop((prev) => {
      const nextState: ShopState = {
        ...prev,
        cash: prev.cash - prev.rival.buyoutCost,
        reputation: Math.min(5, prev.reputation + 0.35),
        rival: {
          ...prev.rival,
          marketShare: 0,
          boughtOut: true,
          lastTaunt:
            'Kurnaz Kerim: "Pes ediyorum genç usta, pasaj artık tamamen senin! Anahtarlar hayırlı olsun."',
        },
        todayStats: {
          ...prev.todayStats,
          reputationDelta: prev.todayStats.reputationDelta + 0.35,
        },
      };
      return applyXpGain(nextState, 120);
    });
  };

  const handleTakeLoan = (offer: BankLoanOffer) => {
    if (
      (shop.activeLoans?.length ?? 0) >= 2 ||
      shop.shopTier < offer.minShopTier
    ) {
      return;
    }
    const terms = getEffectiveLoanTerms(
      offer.principal,
      offer.interestRate,
      offer.termDays,
      shop.staff,
      shop.staffLevels
    );
    soundFX.playCashRegister();
    pushFeedback(
      `+${formatTRY(terms.effectivePrincipal)} · ${offer.name} Hesabına Yattı!`,
      'amber'
    );
    const newLoan = {
      id: `loan_${Date.now()}`,
      name: offer.name,
      remainingBalance: terms.totalRepay,
      dailyPayment: terms.dailyPayment,
      daysLeft: offer.termDays,
    };
    setShop((prev) => ({
      ...prev,
      cash: prev.cash + terms.effectivePrincipal,
      activeLoans: [...(prev.activeLoans ?? []), newLoan],
    }));
  };

  const handleRepayLoanEarly = (loanId: string) => {
    const loan = (shop.activeLoans ?? []).find((l) => l.id === loanId);
    if (!loan || shop.cash < loan.remainingBalance) return;
    soundFX.playScanOk();
    pushFeedback(`Kredi Kapatıldı (-${formatTRY(loan.remainingBalance)})`, 'positive');
    setShop((prev) => ({
      ...prev,
      cash: prev.cash - loan.remainingBalance,
      activeLoans: prev.activeLoans.filter((l) => l.id !== loanId),
      todayStats: {
        ...prev.todayStats,
        loanPayments: (prev.todayStats.loanPayments ?? 0) + loan.remainingBalance,
      },
    }));
  };

  const handlePayWeeklyTax = () => {
    if (shop.weeklyTaxDue <= 0 || shop.cash < shop.weeklyTaxDue) return;
    soundFX.playScanOk();
    pushFeedback(
      `Vergi & Faturalar Ödendi (-${formatTRY(shop.weeklyTaxDue)} · +0.10★)`,
      'positive'
    );
    setShop((prev) => ({
      ...prev,
      cash: prev.cash - prev.weeklyTaxDue,
      reputation: Math.min(5, prev.reputation + 0.1),
      weeklyTaxDue: 0,
      todayStats: {
        ...prev.todayStats,
        taxPaid: (prev.todayStats.taxPaid ?? 0) + prev.weeklyTaxDue,
        reputationDelta: prev.todayStats.reputationDelta + 0.1,
      },
    }));
  };

  const handleBuyMuseumItem = (itemId: MuseumItemId) => {
    const item = MUSEUM_ITEMS.find((m) => m.id === itemId);
    if (!item || shop.museumItems.includes(itemId) || shop.cash < item.cost) return;
    soundFX.playLevelUp();
    pushFeedback(`${item.name} Nostalji Müzesi’ne Eklendi (+${item.prestigeBonus} Prestij)!`, 'positive');
    setShop((prev) => {
      const nextState: ShopState = {
        ...prev,
        cash: prev.cash - item.cost,
        museumItems: [...prev.museumItems, itemId],
      };
      return applyXpGain(nextState, 50);
    });
  };

  // === GOOGLE PLAY / APP STORE COMPLIANCE & SETTINGS HANDLERS ===
  const handleToggleAmbientSound = () => {
    soundFX.playClick();
    setShop((prev) => {
      const next = !prev.ambientSoundEnabled;
      soundFX.setAmbientEnabled(next);
      return { ...prev, ambientSoundEnabled: next };
    });
  };

  const handleDismissDay1Guide = () => {
    soundFX.playClick();
    setShop((prev) => ({ ...prev, tutorialDismissed: true }));
  };

  const handleUnlockAllTabsEarly = () => {
    soundFX.playLevelUp();
    pushFeedback('Tüm Dükkan Sekmeleri Açıldı!', 'positive');
    setShop((prev) => ({
      ...prev,
      allTabsUnlockedEarly: true,
      tutorialDismissed: true,
    }));
  };

  const handleToggleHaptics = () => {
    soundFX.playClick();
    setShop((prev) => ({ ...prev, hapticsEnabled: !prev.hapticsEnabled }));
  };

  const handleSetTextSpeed = (speed: 'normal' | 'fast' | 'instant') => {
    soundFX.playClick();
    setShop((prev) => ({ ...prev, textSpeed: speed }));
  };

  const handleAcceptPrivacy = () => {
    soundFX.playScanOk();
    pushFeedback('KVKK & Gizlilik Tercihi Kaydedildi', 'positive');
    setShop((prev) => ({ ...prev, privacyAccepted: true }));
  };

  const handleImportSaveJson = (rawJson: string): boolean => {
    try {
      const parsed = JSON.parse(rawJson) as Partial<ShopState>;
      if (!parsed || typeof parsed.cash !== 'number' || typeof parsed.day !== 'number') {
        return false;
      }
      saveShopState(parsed as ShopState);
      const migrated = loadShopState();
      if (!migrated) return false;
      setShop(migrated);
      setSavedSnapshot(migrated);
      soundFX.playLevelUp();
      pushFeedback('Kayıt Başarıyla Geri Yüklendi!', 'positive');
      return true;
    } catch {
      return false;
    }
  };

  const handleDeleteAllData = () => {
    clearSavedShopState();
    const fresh = createInitialShopState();
    setShop(fresh);
    setSavedSnapshot(null);
    setShowComplianceModal(false);
    setScreen('TITLE_MENU');
    pushFeedback('Tüm Kayıtlar Kalıcı Olarak Silindi', 'amber');
  };

  const handleRateApp = (stars: number) => {
    soundFX.playLevelUp();
    void requestNativeStoreReview();
    pushFeedback(`${stars}★ Değerlendirmen İçin Teşekkürler!`, 'positive');
    setShop((prev) => ({ ...prev, ratedApp: true }));
  };

  const handleSubmitFeedback = (note: string) => {
    soundFX.playScanOk();
    pushFeedback('Geri Bildirimin Kaydedildi!', 'positive');
    setShop((prev) => ({
      ...prev,
      feedbackNotes: [note, ...(prev.feedbackNotes ?? [])].slice(0, 15),
    }));
  };

  if (screen === 'TITLE_MENU') {
    return (
      <>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
        <TitleScreen
          savedState={savedSnapshot}
          onStartNew={handleStartNew}
          onContinue={handleContinue}
          onOpenCompliance={(tab = 'SETTINGS', legal = 'privacy') => {
            soundFX.playClick();
            openComplianceModal(tab, legal);
          }}
        />
        {showComplianceModal && (
          <StoreComplianceModal
            shop={savedSnapshot ?? shop}
            muted={muted}
            initialTab={complianceInitialTab}
            initialLegalView={complianceInitialLegal}
            onToggleMute={handleToggleMute}
            onToggleAmbientSound={handleToggleAmbientSound}
            onToggleHaptics={handleToggleHaptics}
            onSetTextSpeed={handleSetTextSpeed}
            onAcceptPrivacy={handleAcceptPrivacy}
            onImportSaveJson={handleImportSaveJson}
            onDeleteAllData={handleDeleteAllData}
            onRateApp={handleRateApp}
            onSubmitFeedback={handleSubmitFeedback}
            onClose={() => {
              soundFX.playClick();
              setShowComplianceModal(false);
            }}
          />
        )}
      </>
    );
  }

  const listedCount = shop.inventory.filter((p) => p.listedForSale).length;
  const prestige = calculatePrestige(shop);
  const claimableCount = countClaimableRewards(shop);
  const victoryProgress = Math.min(
    100,
    Math.round((shop.cash / VICTORY_CASH_GOAL) * 100)
  );

  return (
    <div className="h-dvh w-screen overflow-hidden flex flex-col bg-[#0F141B] text-slate-100 select-none">
      {/* ERGONOMIC FIXED-PX GAME HUD HEADER: Reliable touch targets on Android/iOS landscape */}
      <header className="relative z-30 shrink-0 border-b border-white/10 bg-[#131A24] safe-px pt-[max(4px,env(safe-area-inset-top))] pb-[4px] min-h-[44px] flex flex-wrap sm:flex-nowrap items-center justify-between gap-[6px] lg:gap-2">
        <div className="flex items-center gap-[6px] lg:gap-2.5 min-w-0 w-full sm:w-auto sm:flex-1 order-2 sm:order-1">
          <div className="hidden md:flex items-center shrink-0">
            <BrandLogo size="compact" />
          </div>

          <nav
            aria-label="Dükkan bölümleri"
            className="grid grid-cols-6 sm:flex sm:items-center gap-[3px] lg:gap-1 rounded-lg bg-[#0D1219] p-[3px] border border-white/10 w-full sm:w-auto sm:max-w-full overflow-x-auto no-scrollbar"
          >
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setActiveTab('COUNTER');
              }}
              className={`inline-flex items-center justify-center gap-1 min-h-[34px] rounded-md px-[8px] lg:px-2.5 py-[4px] text-[11px] lg:text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer touch-manipulation ${
                activeTab === 'COUNTER'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-300 hover:text-slate-50 active:bg-white/10'
              }`}
            >
              <Users className="w-[14px] h-[14px] shrink-0" />
              <span className="truncate">{bi('Tezgah', 'Counter')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setActiveTab('WORKSHOP');
              }}
              className={`inline-flex items-center justify-center gap-1 min-h-[34px] rounded-md px-[8px] lg:px-2.5 py-[4px] text-[11px] lg:text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer touch-manipulation ${
                activeTab === 'WORKSHOP'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-300 hover:text-slate-50 active:bg-white/10'
              }`}
            >
              <Wrench className="w-[14px] h-[14px] shrink-0" />
              <span className="truncate">
                {bi('Atölye', 'Workshop')}
                {shop.inventory.length > 0 ? ` (${shop.inventory.length})` : ''}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setActiveTab('WHOLESALE');
              }}
              title={bi('Toptancı, Aksesuar & Sıfır Bayilik', 'Wholesale, Accessories & Flagship Supply')}
              className={`inline-flex items-center justify-center gap-1 min-h-[34px] rounded-md px-[8px] lg:px-2.5 py-[4px] text-[11px] lg:text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer touch-manipulation ${
                activeTab === 'WHOLESALE'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-300 hover:text-slate-50 active:bg-white/10'
              }`}
            >
              <Package className="w-[14px] h-[14px] shrink-0" />
              <span className="truncate">{bi('Toptan', 'Supply')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setActiveTab('EMPIRE');
              }}
              title={bi('Sarı İlan, İhale, Şube, Banka & Müze', 'Classifieds, Auctions, Branches, Bank & Museum')}
              className={`inline-flex items-center justify-center gap-1 min-h-[34px] rounded-md px-[8px] lg:px-2.5 py-[4px] text-[11px] lg:text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer touch-manipulation ${
                activeTab === 'EMPIRE'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-300 hover:text-slate-50 active:bg-white/10'
              }`}
            >
              <Building2 className="w-[14px] h-[14px] shrink-0" />
              <span className="truncate">{bi('Piyasa', 'Market')}</span>
              {getWeekdayInfo(shop.day).isSunday && (
                <span className="font-mono text-[9.5px] font-extrabold rounded px-1 bg-emerald-400 text-slate-950">
                  {bi('Kermes', 'Fair')}
                </span>
              )}
              {shop.weeklyTaxDue > 0 && (
                <span className="font-mono text-[10px] font-extrabold rounded px-1 bg-rose-500 text-white">
                  !
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setActiveTab('MISSIONS');
              }}
              className={`inline-flex items-center justify-center gap-1 min-h-[34px] rounded-md px-[8px] lg:px-2.5 py-[4px] text-[11px] lg:text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer touch-manipulation ${
                activeTab === 'MISSIONS'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-300 hover:text-slate-50 active:bg-white/10'
              }`}
            >
              <Target className="w-[14px] h-[14px] shrink-0" />
              <span className="truncate">{bi('Görev', 'Quests')}</span>
              {(claimableCount > 0 || !shop.dailyStreakClaimed) && (
                <span className="font-mono text-[10px] font-extrabold rounded px-1 bg-emerald-400 text-slate-950">
                  +{claimableCount + (shop.dailyStreakClaimed ? 0 : 1)}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setActiveTab('UPGRADES');
              }}
              title={bi('Ekipman, Dükkan, Dekor, Ekip & Gardırop', 'Equipment, Shops, Decor, Staff & Wardrobe')}
              className={`inline-flex items-center justify-center gap-1 min-h-[34px] rounded-md px-[8px] lg:px-2.5 py-[4px] text-[11px] lg:text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer touch-manipulation ${
                activeTab === 'UPGRADES'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-300 hover:text-slate-50 active:bg-white/10'
              }`}
            >
              <Sparkles className="w-[14px] h-[14px] shrink-0" />
              <span className="truncate">{bi('Büyüt', 'Upgrade')}</span>
            </button>
          </nav>
        </div>

        {/* Compact Tabular HUD Readouts — Day, Infinite Level & Shop Tier */}
        <div className="flex items-center justify-between sm:justify-end gap-[6px] sm:gap-2 lg:gap-3 tabular-nums shrink-0 w-full sm:w-auto order-1 sm:order-2">
          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              setActiveTab('UPGRADES');
            }}
            title={bi(
              `Gün ${shop.day} · Sv.${shop.level} · Dükkan Kademesi ${shop.shopTier}/6`,
              `Day ${shop.day} · Lv.${shop.level} · Shop Tier ${shop.shopTier}/6`
            )}
            className="inline-flex items-center gap-1.5 min-h-[32px] rounded-md border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 hover:bg-amber-500/20 transition-colors cursor-pointer shrink-0 touch-manipulation"
          >
            <span
              className={`font-mono text-[11px] font-extrabold whitespace-nowrap ${
                getWeekdayInfo(shop.day).isSunday ? 'text-emerald-300' : 'text-amber-300'
              }`}
            >
              {bi(
                `Gün ${shop.day} · ${getWeekdayInfo(shop.day).shortTr}`,
                `Day ${shop.day} · ${getWeekdayInfo(shop.day).shortEn}`
              )}
            </span>
            <span aria-hidden="true" className="text-amber-300/40">·</span>
            <span className="font-mono text-[10.5px] font-extrabold text-emerald-300 whitespace-nowrap">
              {bi(`Sv.${shop.level}`, `Lv.${shop.level}`)}
            </span>
            {(shop.prestigeLevel ?? 0) > 0 && (
              <>
                <span aria-hidden="true" className="text-amber-300/40">·</span>
                <span className="font-mono text-[10.5px] font-extrabold text-purple-300 whitespace-nowrap">
                  P{shop.prestigeLevel}
                </span>
              </>
            )}
            <span aria-hidden="true" className="hidden md:inline text-amber-300/40">·</span>
            <span className="hidden md:inline font-mono text-[10.5px] font-bold text-slate-200 whitespace-nowrap">
              {bi(`Dük.${shop.shopTier}/6`, `T${shop.shopTier}/6`)}
            </span>
          </button>

              <div className="hidden xl:flex items-center gap-2 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Store className="w-3.5 h-3.5 text-slate-400" />
                  <strong className="text-slate-100 font-mono">{listedCount}</strong>
                </span>
                <span aria-hidden="true" className="text-white/20">·</span>
                <span>
                  {bi('Prestij', 'Prestige')}{' '}
                  <strong className="text-amber-300 font-mono">{prestige}</strong>
                </span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="inline-flex items-center gap-0.5 text-[11px] lg:text-xs font-semibold text-amber-400">
                  <Star className="w-[13px] h-[13px] fill-amber-400" />
                  <span className="font-mono">{shop.reputation.toFixed(1)}</span>
                </div>

                <div className="text-right">
                  <div className="font-mono text-[13px] sm:text-sm lg:text-base font-extrabold text-emerald-400 leading-none">
                    {formatTRY(shop.cash)}
                  </div>
                  {!shop.endlessMode && (
                    <div className="hidden xl:block text-[9.5px] text-slate-400 leading-tight mt-0.5">
                      {bi('Showroom Hedef', 'Showroom Goal')} %{victoryProgress}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-[4px]">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setLang(lang === 'tr' ? 'en' : 'tr');
                  }}
                  aria-label={bi('Dili İngilizce yap', 'Switch language to Turkish')}
                  title={bi('Dil: Türkçe (EN için tıkla)', 'Language: English (tap for TR)')}
                  className="hidden lg:flex h-[32px] px-2 items-center justify-center rounded-lg border border-amber-400/30 bg-[#1B2432] font-mono text-[10.5px] font-extrabold text-amber-300 hover:bg-[#243042] transition-colors cursor-pointer touch-manipulation"
                >
                  {lang.toUpperCase()}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setShowNewspaperReview(true);
                  }}
                  aria-label={bi('Pasaj Postası gazetesini oku', 'Read Arcade Gazette')}
                  title={bi('Pasaj Postası & Günlük Görevler', 'Daily Gazette & Quests')}
                  className="flex h-[32px] w-[32px] items-center justify-center rounded-lg border border-white/10 bg-[#1B2432] text-amber-300 hover:text-amber-200 hover:bg-[#243042] transition-colors cursor-pointer touch-manipulation"
                >
                  <Newspaper className="w-[15px] h-[15px]" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setShowAnalyticsModal(true);
                  }}
                  aria-label={bi('Dükkan istatistik panelini aç', 'Open shop analytics')}
                  title={bi('Dükkan İstatistikleri', 'Shop Analytics')}
                  className="hidden lg:flex h-[32px] w-[32px] items-center justify-center rounded-lg border border-white/10 bg-[#1B2432] text-emerald-300 hover:text-emerald-200 hover:bg-[#243042] transition-colors cursor-pointer touch-manipulation"
                >
                  <BarChart3 className="w-[15px] h-[15px]" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    openComplianceModal('SETTINGS');
                  }}
                  aria-label={bi('Ayarlar, Başarımlar ve Gizlilik', 'Settings, Achievements & Privacy')}
                  title={bi('Ayarlar & Başarımlar', 'Settings & Achievements')}
                  className="flex h-[32px] w-[32px] items-center justify-center rounded-lg border border-white/10 bg-[#1B2432] text-sky-300 hover:text-sky-200 hover:bg-[#243042] transition-colors cursor-pointer touch-manipulation"
                >
                  <ShieldCheck className="w-[15px] h-[15px]" />
                </button>
                <button
                  type="button"
                  onClick={handleToggleMute}
                  aria-label={muted ? bi('Sesi aç', 'Unmute') : bi('Sesi kapat', 'Mute')}
                  className="flex h-[32px] w-[32px] items-center justify-center rounded-lg border border-white/10 bg-[#1B2432] text-slate-300 hover:text-slate-50 hover:bg-[#243042] transition-colors cursor-pointer touch-manipulation"
                >
                  {muted ? (
                    <VolumeX className="w-[15px] h-[15px]" />
                  ) : (
                    <Volume2 className="w-[15px] h-[15px]" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setScreen('PAUSED');
                  }}
                  aria-label={bi('Oyunu duraklat', 'Pause game')}
                  className="flex h-[32px] w-[32px] items-center justify-center rounded-lg border border-white/10 bg-[#1B2432] text-slate-300 hover:text-slate-50 hover:bg-[#243042] transition-colors cursor-pointer touch-manipulation"
                >
                  <Pause className="w-[15px] h-[15px]" />
                </button>
              </div>
            </div>
      </header>

      {/* Non-blocking Portrait Orientation Helper Banner (Mobile Browser Fallback) */}
      {isPortraitMobile && !portraitHintDismissed && (
        <div className="shrink-0 bg-amber-500/15 border-b border-amber-400/35 px-2.5 py-1.5 flex items-center justify-between gap-2 text-[11px] text-amber-100">
          <div className="flex items-center gap-1.5 min-w-0">
            <RotateCw className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate font-medium">
              {bi(
                'En iyi tezgah deneyimi için telefonu yatay çevir',
                'Rotate your phone to landscape for the best counter view'
              )}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                void attemptLandscapeLock(true);
              }}
              className="rounded-md bg-amber-500 px-2 py-0.5 text-[10.5px] font-extrabold text-slate-950 cursor-pointer whitespace-nowrap"
            >
              {bi('Yatay Mod', 'Landscape')}
            </button>
            <button
              type="button"
              onClick={() => setPortraitHintDismissed(true)}
              aria-label={bi('Uyarıyı kapat', 'Dismiss hint')}
              className="p-0.5 text-amber-200/80 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE SHOP PLAYFIELD */}
      <main className="relative flex-1 min-h-0 flex flex-col">
        {activeTab === 'COUNTER' && (
          <CounterView
            encounter={currentEncounter}
            day={shop.day}
            cash={shop.cash}
            shopTier={shop.shopTier}
            shopLevel={shop.level}
            prestigeLevel={shop.prestigeLevel ?? 0}
            radioStation={shop.radioStation ?? 'OFF'}
            legacyPath={shop.legacyPath}
            dealStreak={shop.dealStreak}
            upgrades={shop.upgrades}
            activeDecorations={shop.activeDecorations}
            listedPhones={shop.inventory.filter((p) => p.listedForSale)}
            showDay1Guide={!shop.tutorialDismissed && shop.day === 1}
            accessories={shop.accessories}
            dailyNews={shop.dailyNews}
            dailyQuests={shop.dailyQuests}
            queue={shop.dailyQueue}
            queueIndex={shop.currentQueueIndex}
            queueTotal={shop.dailyQueue.length}
            activeStoreEvent={shop.activeStoreEvent}
            nextCustomerEventEffect={shop.nextCustomerEventEffect}
            equippedOutfit={shop.equippedOutfit}
            hiredStaff={shop.staff}
            staffLevels={shop.staffLevels}
            staffRepairQueue={shop.staffRepairQueue ?? []}
            textSpeed={shop.textSpeed}
            onCycleRadio={handleCycleRadio}
            onTeaBoilerFresh={handleTeaBoilerFreshMotivation}
            onDiscloseBuyer={handleDiscloseBuyer}
            complaintCount={(shop.complaintHistory ?? []).length}
            openComplaintCount={
              currentEncounter?.type === 'WARRANTY_CLAIM' &&
              currentEncounter.outcome === 'ACTIVE'
                ? 1
                : 0
            }
            onOpenComplaintArchive={() => setShowComplaintArchive(true)}
            onOpenWarrantyCertificate={(rec) =>
              setActiveWarrantyModal({ record: rec, mode: 'INSPECT' })
            }
            onOpenCertificateById={(recId) => {
              const found = (shop.soldHistory ?? []).find((r) => r.id === recId);
              if (found) {
                setActiveWarrantyModal({
                  record: found,
                  mode: found.warrantyPresented ? 'INSPECT' : 'HANDOVER',
                });
              }
            }}
            onOpenNewspaper={() => {
              soundFX.playClick();
              setShowNewspaperReview(true);
            }}
            onOpenMissions={() => {
              soundFX.playClick();
              setActiveTab('MISSIONS');
            }}
            onOpenWardrobe={() => {
              soundFX.playClick();
              setActiveTab('UPGRADES');
            }}
            onDismissDay1Guide={handleDismissDay1Guide}
            onUnlockAllTabsEarly={handleUnlockAllTabsEarly}
            onClaimDailyQuest={handleClaimDailyQuest}
            onResolveStoreEventAction={handleResolveStoreEventAction}
            onDismissStoreEvent={handleDismissStoreEvent}
            onPlaceOnDeskReaction={handlePlaceOnDeskReaction}
            onInspect={handleInspect}
            onInspectAll={handleInspectAll}
            onPhysicalInspectBonus={handlePhysicalInspectBonus}
            onUseLeverage={handleUseLeverage}
            onServeTea={handleServeTea}
            onBluffOrPitch={handleBluffOrPitch}
            onUseLegacyDialogue={handleUseLegacyDialogue}
            onAcceptPosInstallment={handleAcceptPosInstallment}
            onPitchCrossSell={handlePitchCrossSell}
            onCompleteAccessoryOrder={handleCompleteAccessoryOrder}
            onSubmitOffer={handleSubmitOffer}
            onAcceptCurrentPrice={handleAcceptCurrentPrice}
            onDismiss={handleDismiss}
            onNextCustomer={handleNextCustomer}
            onGoToWorkshop={() => {
              soundFX.playClick();
              setActiveTab('WORKSHOP');
            }}
            onExpressRepairQuick={handleExpressRepairQuick}
            onExpressRepairMini={handleExpressRepairMini}
            onDelegateExpressRepair={handleDelegateExpressRepair}
            onAcceptBulkAuction={handleAcceptBulkAuction}
            onResolveWarranty={handleResolveWarranty}
            onResolveDataRecovery={handleResolveDataRecovery}
            shakeTrigger={shakeTrigger}
          />
        )}

        {activeTab === 'WORKSHOP' && (
          <WorkshopView
            inventory={shop.inventory}
            accessories={shop.accessories}
            cash={shop.cash}
            currentDay={shop.day}
            shopTier={shop.shopTier}
            showcaseUpgradeLevel={shop.showcaseUpgradeLevel ?? 0}
            shopLevel={shop.level}
            legacyPath={shop.legacyPath}
            upgrades={shop.upgrades}
            hiredStaff={shop.staff}
            staffLevels={shop.staffLevels}
            staffRepairQueue={shop.staffRepairQueue ?? []}
            dailyNews={shop.dailyNews}
            spareParts={shop.spareParts}
            prestigePerks={shop.prestigePerks}
            onBuySparePart={handleBuySparePart}
            onQuickRepairDefects={handleQuickRepairDefects}
            onStartMiniRepair={handleStartMiniRepair}
            onDelegateRepairToMaster={handleDelegateRepairToMaster}
            onAddBoxKit={handleAddBoxKit}
            onAttachAccessoryBundle={handleAttachAccessoryBundle}
            onDetachAccessoryBundle={handleDetachAccessoryBundle}
            onUpdateListing={handleUpdateListing}
            onScrapSellPhone={handleScrapSellPhone}
            complaintCount={(shop.complaintHistory ?? []).length}
            onOpenComplaintArchive={() => {
              soundFX.playClick();
              setShowComplaintArchive(true);
            }}
            onBackToCounter={() => {
              soundFX.playClick();
              setActiveTab('COUNTER');
            }}
            onGoToUpgrades={() => {
              soundFX.playClick();
              setActiveTab('UPGRADES');
            }}
          />
        )}

        {activeTab === 'WHOLESALE' && (
          <WholesaleView
            shop={shop}
            onBuyAccessoryStock={handleBuyAccessoryStock}
            onUpdateAccessoryPrice={handleUpdateAccessoryPrice}
            onOrderBrandNewPhone={handleOrderBrandNewPhone}
            onBuySparePart={handleBuySparePart}
            onBuyUpgrade={handleBuyUpgrade}
            onBackToCounter={() => {
              soundFX.playClick();
              setActiveTab('COUNTER');
            }}
          />
        )}

        {activeTab === 'EMPIRE' && (
          <EmpireView
            shop={shop}
            onInspectClassifiedOnsite={handleInspectClassifiedOnsite}
            onOrderClassifiedCod={handleOrderClassifiedCod}
            onHaggleClassified={handleHaggleClassified}
            onBuyClassified={handleBuyClassified}
            onRejectClassified={handleRejectClassified}
            onFulfillShipping={handleFulfillShipping}
            onResolveAuction={handleResolveAuction}
            onUnlockBranch={handleUnlockBranch}
            onRunRivalPromo={handleRunRivalPromo}
            onBuyoutRival={handleBuyoutRival}
            onTakeLoan={handleTakeLoan}
            onRepayLoanEarly={handleRepayLoanEarly}
            onPayWeeklyTax={handlePayWeeklyTax}
            onBuyMuseumItem={handleBuyMuseumItem}
            onBuyUpgrade={handleBuyUpgrade}
            onKermesSellPhone={handleKermesSellPhone}
            onBuyKermesDeal={handleBuyKermesDeal}
            onGoToStaff={() => {
              soundFX.playClick();
              setActiveTab('UPGRADES');
            }}
            onBackToCounter={() => {
              soundFX.playClick();
              setActiveTab('COUNTER');
            }}
          />
        )}

        {activeTab === 'MISSIONS' && (
          <MissionsView
            shop={shop}
            onClaimDailyQuest={handleClaimDailyQuest}
            onClaimMilestone={handleClaimMilestone}
            onClaimStoryChapter={handleClaimStoryChapter}
            onClaimDailyStreak={handleClaimDailyStreak}
            onTriggerPrestige={handleTriggerPrestige}
            onBuyPrestigePerk={handleBuyPrestigePerk}
            onBackToCounter={() => {
              soundFX.playClick();
              setActiveTab('COUNTER');
            }}
          />
        )}

        {activeTab === 'UPGRADES' && (
          <UpgradesView
            cash={shop.cash}
            reputation={shop.reputation}
            level={shop.level}
            shopTier={shop.shopTier}
            showcaseUpgradeLevel={shop.showcaseUpgradeLevel ?? 0}
            ownedUpgrades={shop.upgrades}
            ownedDecorations={shop.decorations}
            activeDecorations={shop.activeDecorations}
            hiredStaff={shop.staff}
            staffLevels={shop.staffLevels}
            branches={shop.branches}
            museumItems={shop.museumItems}
            pendingProjects={shop.pendingProjects ?? []}
            ownedOutfits={shop.ownedOutfits ?? ['casual_hoodie']}
            equippedOutfit={shop.equippedOutfit ?? 'casual_hoodie'}
            prestigeLevel={shop.prestigeLevel ?? 0}
            radioStation={shop.radioStation ?? 'OFF'}
            onCycleRadio={handleCycleRadio}
            onBuyUpgrade={handleBuyUpgrade}
            onBuyShowcaseUpgrade={handleBuyShowcaseUpgrade}
            onUpgradeShopTier={handleUpgradeShopTier}
            onBuyDecoration={handleBuyDecoration}
            onToggleDecoration={handleToggleDecoration}
            onHireStaff={handleHireStaff}
            onTrainStaff={handleTrainStaff}
            onBuyOutfit={handleBuyOutfit}
            onEquipOutfit={handleEquipOutfit}
            onBackToCounter={() => {
              soundFX.playClick();
              setActiveTab('COUNTER');
            }}
          />
        )}

        {/* Non-blocking Floating Feedback Delta Toasts */}
        <div className="pointer-events-none fixed top-16 right-5 z-40 flex flex-col items-end gap-2">
          {feedbacks.map((fb) => (
            <div
              key={fb.id}
              className={`animate-float-delta rounded-lg border px-3.5 py-1.5 text-xs font-bold shadow-lg tabular-nums ${
                fb.tone === 'positive'
                  ? 'border-emerald-500/40 bg-[#102620]/95 text-emerald-300'
                  : fb.tone === 'negative'
                  ? 'border-rose-500/40 bg-[#2A151A]/95 text-rose-300'
                  : 'border-amber-500/40 bg-[#272013]/95 text-amber-300'
              }`}
            >
              {fb.text}
            </div>
          ))}
        </div>
      </main>

      {/* FRAMER MOTION MAGNIFIER & HATA INSPECTION OVERLAY */}
      <InspectionOverlay
        data={inspectionOverlay}
        onComplete={() => setInspectionOverlay(null)}
      />

      {/* INTERACTIVE SINGLE-SESSION MULTI-DEFECT MINI-REPAIR MODAL */}
      {miniRepairJob && (
        <MiniRepairModal
          phone={miniRepairJob.phone}
          defectIds={miniRepairJob.defectIds}
          cost={miniRepairJob.cost}
          isExpressJob={miniRepairJob.mode === 'EXPRESS'}
          legacyPath={shop.legacyPath}
          shopLevel={shop.level}
          prestigeLevel={shop.prestigeLevel ?? 0}
          hasCleanRoomLab={shop.upgrades.includes('clean_room_lab')}
          onSuccess={handleMiniRepairSuccess}
          onCancel={() => setMiniRepairJob(null)}
        />
      )}

      {/* 23-YEAR-OLD ORIGIN STORY INTRO MODAL */}
      {screen === 'STORY_INTRO' && (
        <StoryIntroModal
          onComplete={(chosenLegacy: LegacyPathId) => {
            soundFX.playClick();
            setShop((prev) => {
              const updatedBase: ShopState = {
                ...prev,
                legacyPath: chosenLegacy,
                storyIntroSeen: true,
              };
              return {
                ...updatedBase,
                dailyQueue: generateDailyQueue(updatedBase),
              };
            });
            setScreen('MORNING_NEWS');
          }}
        />
      )}

      {/* MORNING NEWSPAPER (PASAJ POSTASI) */}
      {(screen === 'MORNING_NEWS' || showNewspaperReview) && (
        <MorningNewspaperModal
          day={shop.day}
          news={shop.dailyNews}
          quests={shop.dailyQuests}
          shopRank={getShopRank(shop)}
          flashWholesaleDeal={shop.flashWholesaleDeal}
          morningNotifications={shop.morningNotifications}
          isMidDayReview={showNewspaperReview && screen !== 'MORNING_NEWS'}
          onClose={() => {
            soundFX.playClick();
            if (screen === 'MORNING_NEWS') {
              setScreen('PLAYING');
            }
            setShowNewspaperReview(false);
          }}
        />
      )}

      {/* LIVE D3 ANALYTICS MODAL */}
      {showAnalyticsModal && (
        <AnalyticsModal
          shop={shop}
          onClose={() => {
            soundFX.playClick();
            setShowAnalyticsModal(false);
          }}
        />
      )}

      {/* GOOGLE PLAY & APP STORE COMPLIANCE, SETTINGS & ACHIEVEMENTS MODAL */}
      {showComplianceModal && (
        <StoreComplianceModal
          shop={shop}
          muted={muted}
          initialTab={complianceInitialTab}
          initialLegalView={complianceInitialLegal}
          onToggleMute={handleToggleMute}
          onToggleAmbientSound={handleToggleAmbientSound}
          onToggleHaptics={handleToggleHaptics}
          onSetTextSpeed={handleSetTextSpeed}
          onAcceptPrivacy={handleAcceptPrivacy}
          onImportSaveJson={handleImportSaveJson}
          onDeleteAllData={handleDeleteAllData}
          onRateApp={handleRateApp}
          onSubmitFeedback={handleSubmitFeedback}
          onClose={() => {
            soundFX.playClick();
            setShowComplianceModal(false);
          }}
        />
      )}

      {/* GAME SHELL MODALS */}
      {screen === 'PAUSED' && (
        <PauseModal
          onResume={() => {
            soundFX.playClick();
            setScreen('PLAYING');
          }}
          onOpenAnalytics={() => {
            soundFX.playClick();
            setScreen('PLAYING');
            setShowAnalyticsModal(true);
          }}
          onOpenCompliance={() => {
            soundFX.playClick();
            setScreen('PLAYING');
            openComplianceModal('SETTINGS');
          }}
          onRestart={handleStartNew}
          onTitle={() => {
            soundFX.playClick();
            setScreen('TITLE_MENU');
          }}
        />
      )}

      {screen === 'DAY_SUMMARY' && (
        <DaySummaryModal
          stats={shop.todayStats}
          shop={shop}
          onNextDay={handleStartNextDay}
        />
      )}

      {/* OFFLINE IDLE EARNINGS WELCOME BACK MODAL */}
      {offlineSummary && screen === 'PLAYING' && (
        <OfflineEarningsModal
          summary={offlineSummary}
          onClaim={handleClaimOfflineEarnings}
        />
      )}

      {(screen === 'VICTORY' || screen === 'GAME_OVER') && (
        <EndModal
          mode={screen}
          state={shop}
          onRestart={handleStartNew}
          onTriggerPrestige={
            screen === 'VICTORY' ? handleTriggerPrestige : undefined
          }
          onContinueEndless={
            screen === 'VICTORY'
              ? () => {
                  soundFX.playClick();
                  setShop((prev) => ({ ...prev, endlessMode: true }));
                  setScreen('PLAYING');
                }
              : undefined
          }
        />
      )}
      {/* CUSTOMER COMPLAINT FILE & WARRANTY ARCHIVE PANEL */}
      {showComplaintArchive && screen === 'PLAYING' && (
        <ComplaintArchiveModal
          complaintHistory={shop.complaintHistory ?? []}
          soldHistory={shop.soldHistory ?? []}
          activeWarrantyEncounter={
            currentEncounter?.type === 'WARRANTY_CLAIM' ? currentEncounter : null
          }
          currentDay={shop.day}
          onInspectCertificate={(rec) => {
            soundFX.playClick();
            setActiveWarrantyModal({ record: rec, mode: 'INSPECT' });
          }}
          onClose={() => setShowComplaintArchive(false)}
        />
      )}

      {/* OFFICIAL PASAJ GSM WARRANTY CERTIFICATE MODAL */}
      {activeWarrantyModal && screen === 'PLAYING' && (
        <WarrantyCertificateModal
          record={activeWarrantyModal.record}
          shopName={SHOP_TIERS[shop.shopTier]?.name.toUpperCase() ?? 'PASAJ GSM TEKNİK SERVİS'}
          mode={activeWarrantyModal.mode}
          onStampAndDeliver={handleStampWarrantyCertificate}
          onClose={() => setActiveWarrantyModal(null)}
        />
      )}

      <AchievementBadgeToast
        badge={badgeQueue[0] ?? null}
        onDismiss={dismissCurrentBadge}
      />
      <OfflineIndicator />
    </div>
  );
}
