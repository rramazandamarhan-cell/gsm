import { useCallback, useEffect, useState } from 'react';
import {
  BarChart3,
  Building2,
  Newspaper,
  Package,
  Pause,
  Sparkles,
  Star,
  Store,
  Target,
  Users,
  Volume2,
  VolumeX,
  Wrench,
} from 'lucide-react';
import { BrandLogo } from './components/BrandLogo';
import { CounterView } from './components/CounterView';
import { EmpireView } from './components/EmpireView';
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
import { PWAInstallButton } from './components/PWAInstallButton';
import { StoryIntroModal } from './components/StoryIntroModal';
import { TitleScreen } from './components/TitleScreen';
import { UpgradesView } from './components/UpgradesView';
import { WholesaleView } from './components/WholesaleView';
import { BOX_KIT_COST, WorkshopView } from './components/WorkshopView';
import {
  BRAND_DISTRIBUTORS,
  CAREER_MILESTONES,
  CITY_BRANCHES,
  CUSTOM_MODS,
  DAILY_STREAK_REWARDS,
  DEAL_ACCEPTED_LINES,
  DEFECT_CATALOG,
  LEGACY_PATHS,
  MUSEUM_ITEMS,
  SHOP_DECORATIONS,
  SHOP_STAFF,
  SHOP_TIERS,
  SHOP_UPGRADES,
  STAFF_TRAINING_COSTS,
  STORY_CHAPTERS,
  VICTORY_CASH_GOAL,
} from './game/catalog';
import {
  advanceDailyQuests,
  applyBluffOrPitchTactic,
  applyDefectLeverage,
  applyLegacyDialogueTactic,
  applyMasterTechEndOfDay,
  applyPosInstallmentTactic,
  applyTeaTactic,
  buildDayHistoryEntry,
  calculateMarketValue,
  calculatePrestige,
  checkVictoryCondition,
  clearSavedShopState,
  computeOfflineEarnings,
  countClaimableRewards,
  createEmptyDayStats,
  createInitialShopState,
  evaluateCrossSellPitch,
  evaluatePlayerOffer,
  formatTRY,
  generateBrandNewPhone,
  generateCustomerReview,
  generateDailyAuctionLot,
  generateDailyQueue,
  generateDailyQuests,
  generateOnlineClassifieds,
  generateShippingOrders,
  getAccessorySpec,
  getAccessoryWholesaleCost,
  getDailyRent,
  getDailyStaffWages,
  getLevelFromXp,
  getMilestoneCurrentValue,
  getRepairCost,
  getShopRank,
  getStoryChapterCurrentValue,
  getStreakBonusCash,
  inspectPhoneCategory,
  loadShopState,
  pickDailyNewspaper,
  pickDailyWholesaleDiscountBrand,
  processEmpireEndOfDay,
  roundPrice,
  saveShopState,
  simulateEndOfDayAccessorySales,
} from './game/engine';
import { soundFX } from './game/sound';
import {
  AccessoryId,
  BankLoanOffer,
  BranchId,
  CustomModId,
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
  PhoneDevice,
  PhoneModelSpec,
  ShopState,
  ShopTab,
  ShopTier,
  SoldPhoneRecord,
  StaffId,
  UpgradeId,
} from './game/types';

interface ActiveMiniRepairJob {
  mode: 'INVENTORY' | 'EXPRESS';
  phone: PhoneDevice;
  defectId: DefectId;
  cost: number;
}

const CATEGORY_LABELS: Record<InspectionCategory, string> = {
  screen: 'Ekran & Kasa Ekspertizi',
  battery: 'Pil & Devir Ekspertizi',
  imei: 'IMEI & BTK Sorgusu',
  hardware: 'Sıvı & Sensör Analizi',
};

export default function App() {
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

  // Interactive 3-Step Mini-Repair Modal state
  const [miniRepairJob, setMiniRepairJob] = useState<ActiveMiniRepairJob | null>(
    null
  );

  // Mid-day overlays for re-reading Morning Newspaper, live D3 Analytics & Offline Idle Earnings
  const [showNewspaperReview, setShowNewspaperReview] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [offlineSummary, setOfflineSummary] =
    useState<OfflineEarningsSummary | null>(null);

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
      const nextXp = state.xp + xpDelta;
      const nextLevel = getLevelFromXp(nextXp);
      if (nextLevel > state.level) {
        window.setTimeout(() => {
          soundFX.playLevelUp();
          pushFeedback(`SEVİYE ATLADIN! Esnaf Sv. ${nextLevel}`, 'positive');
        }, 220);
      }
      return {
        ...state,
        xp: nextXp,
        level: nextLevel,
      };
    },
    [pushFeedback]
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

      if (e.key === 'Escape') {
        if (screen === 'PLAYING') {
          soundFX.playClick();
          setScreen('PAUSED');
        } else if (screen === 'PAUSED') {
          soundFX.playClick();
          setScreen('PLAYING');
        }
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

  const handleInspect = (category: InspectionCategory) => {
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
    soundFX.playLeverage();
    setShakeTrigger((n) => n + 1);
    pushFeedback('Koz Masaya Kondu! Fiyat Düştü', 'amber');
    setShop((prev) => {
      const enc = prev.dailyQueue[prev.currentQueueIndex];
      if (!enc) return prev;
      const nextQueue = [...prev.dailyQueue];
      nextQueue[prev.currentQueueIndex] = applyDefectLeverage(enc, defectId);
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

      let nextState: ShopState = {
        ...prev,
        cash: prev.cash - cost,
        reputation: Math.max(1, Math.min(5, prev.reputation + repDelta)),
        soldHistory: nextSoldHistory,
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

  const handleResolveDataRecovery = (mode: 'SOFTWARE' | 'CLEAN_ROOM') => {
    if (
      !currentEncounter ||
      currentEncounter.type !== 'DATA_RECOVERY' ||
      !currentEncounter.dataRecoveryJob ||
      currentEncounter.outcome !== 'ACTIVE'
    ) {
      return;
    }
    const job = currentEncounter.dataRecoveryJob;
    const cost = mode === 'CLEAN_ROOM' ? job.cleanRoomCost : job.softwareCost;
    if (shop.cash < cost) return;

    const succeeded =
      mode === 'CLEAN_ROOM' ? true : Math.random() < job.softwareSuccessRate;
    const payout = succeeded
      ? mode === 'CLEAN_ROOM'
        ? job.cleanRoomPayout
        : job.softwarePayout
      : 0;
    const netProfit = payout - cost;
    const repDelta = succeeded ? (mode === 'CLEAN_ROOM' ? 0.18 : 0.1) : -0.08;

    if (succeeded) {
      soundFX.playCashRegister();
      pushFeedback(`+${formatTRY(netProfit)} · Veriler Kurtarıldı!`, 'positive');
    } else {
      soundFX.playScanDefect();
      setShakeTrigger((n) => n + 1);
      pushFeedback(`Yazılım Yetmedi (-${formatTRY(cost)} Maliyet)`, 'negative');
    }

    setShop((prev) => {
      const nextQueue = [...prev.dailyQueue];
      nextQueue[prev.currentQueueIndex] = {
        ...currentEncounter,
        outcome: succeeded ? 'DEAL_CLOSED' : 'WALKED_OUT',
        finalPrice: payout,
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
              ? `Hayatımı kurtardın usta! Bütün dosyalar tek parça geri geldi, ${formatTRY(payout)} helali hoş olsun!`
              : 'Ah be usta yazılım yetmedi, veriler gelmedi... Neyse uğraştığın için sağ ol ama üzgünüm.',
            tone: succeeded ? 'positive' : 'danger',
          },
        ],
      };

      const nextStreak = succeeded ? prev.dealStreak + 1 : 0;
      let nextState: ShopState = {
        ...prev,
        cash: prev.cash - cost + payout,
        reputation: Math.max(1, Math.min(5, prev.reputation + repDelta)),
        dealStreak: nextStreak,
        bestDealStreak: Math.max(prev.bestDealStreak, nextStreak),
        dailyQueue: nextQueue,
        totalProfitEarned: prev.totalProfitEarned + Math.max(0, netProfit),
        bestSingleDealProfit: Math.max(prev.bestSingleDealProfit, netProfit),
        todayStats: {
          ...prev.todayStats,
          repairSpend: prev.todayStats.repairSpend + cost,
          serviceRevenue: prev.todayStats.serviceRevenue + payout,
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
        const fairVal = calculateMarketValue(
          updatedEncounter.device,
          false,
          prev.dailyNews
        );
        const boughtPhone = {
          ...updatedEncounter.device,
          purchasePrice: finalPrice,
          inspected: { screen: true, battery: true, imei: true, hardware: true },
          listedForSale: false,
          askingPrice: roundPrice(fairVal * 1.15),
        };
        nextQueue[prev.currentQueueIndex] = {
          ...updatedEncounter,
          streakBonus,
        };

        let nextState: ShopState = {
          ...prev,
          cash: prev.cash - finalPrice + streakBonus,
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
        const crossSell = updatedEncounter.crossSellAttached;
        const crossSellRev = crossSell ? crossSell.retailPrice : 0;
        const crossSellProfit = crossSell ? crossSell.profit : 0;
        const posCommission = updatedEncounter.posAccepted
          ? Math.round(finalPrice * 0.05)
          : 0;
        const isTradeIn =
          updatedEncounter.type === 'TRADE_IN' &&
          Boolean(updatedEncounter.tradeInDevice);

        let tradeInPhone: PhoneDevice | null = null;
        let tradeInEstimatedVal = 0;
        if (isTradeIn && updatedEncounter.tradeInDevice) {
          tradeInEstimatedVal = calculateMarketValue(
            updatedEncounter.tradeInDevice,
            false,
            prev.dailyNews
          );
          tradeInPhone = {
            ...updatedEncounter.tradeInDevice,
            purchasePrice: Math.max(
              500,
              roundPrice(updatedEncounter.device.askingPrice - finalPrice)
            ),
            inspected: { screen: true, battery: true, imei: true, hardware: true },
            listedForSale: false,
            askingPrice: roundPrice(tradeInEstimatedVal * 1.15),
          };
        }

        const profit =
          finalPrice -
          posCommission +
          (tradeInPhone ? tradeInEstimatedVal : 0) -
          costBasis +
          crossSellProfit;
        const encWithProfit = {
          ...updatedEncounter,
          profitDelta: profit,
          streakBonus,
        };
        nextQueue[prev.currentQueueIndex] = encWithProfit;

        const cleanedQueue = nextQueue.filter(
          (q, idx) =>
            idx <= prev.currentQueueIndex ||
            !(
              (q.type === 'BUYER' || q.type === 'TRADE_IN') &&
              q.device.uid === updatedEncounter.device.uid
            )
        );

        let nextAccessories = prev.accessories;
        if (crossSell && prev.accessories[crossSell.id]?.quantity > 0) {
          nextAccessories = {
            ...prev.accessories,
            [crossSell.id]: {
              ...prev.accessories[crossSell.id],
              quantity: prev.accessories[crossSell.id].quantity - 1,
              totalSold: prev.accessories[crossSell.id].totalSold + 1,
            },
          };
        }

        const isBrandNewSale = Boolean(updatedEncounter.device.isBrandNew);
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
        };

        const remainingInv = prev.inventory.filter(
          (p) => p.uid !== updatedEncounter.device.uid
        );
        const nextInv = tradeInPhone
          ? [tradeInPhone, ...remainingInv]
          : remainingInv;
        const finalDiscovered = tradeInPhone
          ? discoverSpec(nextDiscovered, tradeInPhone.specId)
          : nextDiscovered;

        let nextState: ShopState = {
          ...prev,
          cash: prev.cash + finalPrice - posCommission + crossSellRev + streakBonus,
          reputation: nextRep,
          dealStreak: nextStreak,
          bestDealStreak: nextBestStreak,
          discoveredSpecIds: finalDiscovered,
          accessories: nextAccessories,
          inventory: nextInv,
          soldHistory: [soldRecord, ...(prev.soldHistory ?? [])].slice(0, 25),
          dailyQueue: cleanedQueue,
          reviews: nextReviews,
          totalProfitEarned: prev.totalProfitEarned + profit,
          totalPhonesSold: prev.totalPhonesSold + 1,
          totalBrandNewSold: prev.totalBrandNewSold + (isBrandNewSale ? 1 : 0),
          totalAccessoriesSold: prev.totalAccessoriesSold + (crossSell ? 1 : 0),
          totalTradeInsDone: (prev.totalTradeInsDone ?? 0) + (isTradeIn ? 1 : 0),
          bestSingleDealProfit: Math.max(prev.bestSingleDealProfit, profit),
          todayStats: {
            ...prev.todayStats,
            phonesSold: prev.todayStats.phonesSold + 1,
            phonesBought: prev.todayStats.phonesBought + (tradeInPhone ? 1 : 0),
            accessoriesSold: prev.todayStats.accessoriesSold + (crossSell ? 1 : 0),
            salesRevenue: prev.todayStats.salesRevenue + finalPrice,
            accessoryRevenue: prev.todayStats.accessoryRevenue + crossSellRev,
            posCommission: (prev.todayStats.posCommission ?? 0) + posCommission,
            questRewards: prev.todayStats.questRewards + streakBonus,
            reputationDelta: prev.todayStats.reputationDelta + repBonus,
          },
        };
        nextState = applyXpGain(
          nextState,
          (profit > 0 ? 42 : 22) +
            (isBrandNewSale ? 15 : 0) +
            (isTradeIn ? 18 : 0) +
            (crossSell ? 10 : 0)
        );
        nextState = applyQuestProgress(nextState, 'SELL_PHONE', 1);
        if (isBrandNewSale) {
          nextState = applyQuestProgress(nextState, 'SELL_BRAND_NEW', 1);
        }
        if (crossSell) {
          nextState = applyQuestProgress(nextState, 'SELL_ACCESSORY', 1);
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
      pushFeedback(`-${formatTRY(finalPrice)} · Cihaz Alındı`, 'amber');
    } else if (updatedEncounter.type === 'TRADE_IN') {
      pushFeedback(`+${formatTRY(finalPrice)} Fark + Takas Cihazı Alındı!`, 'positive');
    } else {
      const extra = updatedEncounter.crossSellAttached
        ? ` + ${updatedEncounter.crossSellAttached.name}`
        : '';
      pushFeedback(`+${formatTRY(finalPrice)} · Satış Tamam${extra}!`, 'positive');
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

  const completeExpressRepair = (bonusTip: number) => {
    if (!currentEncounter || currentEncounter.type !== 'EXPRESS_REPAIR') return;
    const partCost = currentEncounter.expressPartCost ?? 0;
    const totalPayout = currentEncounter.customerPrice + bonusTip;
    const netProfit = totalPayout - partCost;

    soundFX.playCashRegister();
    pushFeedback(`+${formatTRY(netProfit)} · Acil Servis Tamam!`, 'positive');

    setShop((prev) => {
      const nextQueue = [...prev.dailyQueue];
      nextQueue[prev.currentQueueIndex] = {
        ...currentEncounter,
        outcome: 'DEAL_CLOSED',
        finalPrice: totalPayout,
        profitDelta: netProfit,
        mood: 'happy',
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

      const repGain = bonusTip > 0 ? 0.22 : 0.12;
      const nextStreak = prev.dealStreak + 1;
      let nextState: ShopState = {
        ...prev,
        cash: prev.cash - partCost + totalPayout,
        reputation: Math.min(5, prev.reputation + repGain),
        dealStreak: nextStreak,
        bestDealStreak: Math.max(prev.bestDealStreak, nextStreak),
        discoveredSpecIds: discoverSpec(
          prev.discoveredSpecIds,
          currentEncounter.device.specId
        ),
        dailyQueue: nextQueue,
        totalPhonesRepaired: prev.totalPhonesRepaired + 1,
        totalProfitEarned: prev.totalProfitEarned + netProfit,
        bestSingleDealProfit: Math.max(prev.bestSingleDealProfit, netProfit),
        todayStats: {
          ...prev.todayStats,
          repairSpend: prev.todayStats.repairSpend + partCost,
          serviceRevenue: prev.todayStats.serviceRevenue + totalPayout,
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
    const partCost = currentEncounter.expressPartCost ?? 0;
    if (shop.cash < partCost) return;
    completeExpressRepair(0);
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
      defectId: currentEncounter.expressDefectId,
      cost: partCost,
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
      askingPrice: roundPrice(calculateMarketValue(d, false, shop.dailyNews) * 1.15),
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
    updateCurrentEncounter((enc) => ({
      ...enc,
      messages: [
        ...enc.messages,
        {
          id: `desk_${Date.now()}`,
          speaker: 'customer',
          text: line,
          tone: 'neutral',
        },
      ],
    }));
  };

  const handlePitchCrossSell = (accessoryId: AccessoryId) => {
    if (
      !currentEncounter ||
      currentEncounter.type !== 'BUYER' ||
      currentEncounter.outcome !== 'ACTIVE' ||
      currentEncounter.crossSellAttempted
    ) {
      return;
    }
    const stock = shop.accessories[accessoryId];
    if (!stock || stock.quantity <= 0) return;

    const result = evaluateCrossSellPitch(
      currentEncounter,
      accessoryId,
      stock,
      shop.level,
      shop.legacyPath
    );

    if (result.accepted) {
      soundFX.playScanOk();
      pushFeedback(`Çapraz Satış Eklendi (+${formatTRY(result.retailPrice)})!`, 'positive');
    } else {
      soundFX.playClick();
      pushFeedback('Müşteri Sadece Telefonu İstedi', 'amber');
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

    soundFX.playCashRegister();
    pushFeedback(`+${formatTRY(totalRev)} · ${totalUnits} Aksesuar Satıldı!`, 'positive');

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
        profitDelta: totalProfit,
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
        cash: prev.cash + totalRev,
        reputation: Math.min(5, prev.reputation + repGain),
        dealStreak: nextStreak,
        bestDealStreak: Math.max(prev.bestDealStreak, nextStreak),
        accessories: nextAccessories,
        dailyQueue: nextQueue,
        totalAccessoriesSold: prev.totalAccessoriesSold + totalUnits,
        totalProfitEarned: prev.totalProfitEarned + totalProfit,
        todayStats: {
          ...prev.todayStats,
          accessoriesSold: prev.todayStats.accessoriesSold + totalUnits,
          accessoryRevenue: prev.todayStats.accessoryRevenue + totalRev,
          reputationDelta: prev.todayStats.reputationDelta + repGain,
        },
      };
      nextState = applyXpGain(nextState, 18 + totalUnits * 6);
      return applyQuestProgress(nextState, 'SELL_ACCESSORY', totalUnits);
    });
  };

  const handleBuyAccessoryStock = (accessoryId: AccessoryId, quantity: number) => {
    const spec = getAccessorySpec(accessoryId);
    const unitCost = getAccessoryWholesaleCost(accessoryId, shop.legacyPath);
    const totalCost = unitCost * quantity;
    if (shop.cash < totalCost) return;
    soundFX.playCashRegister();
    pushFeedback(`-${formatTRY(totalCost)} · +${quantity} ${spec.name}`, 'amber');

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
    wholesaleCost: number
  ) => {
    if (shop.cash < wholesaleCost) return;
    soundFX.playCashRegister();
    pushFeedback(
      `-${formatTRY(wholesaleCost)} · Sıfır Kutu ${spec.brand} ${spec.model} Geldi!`,
      'positive'
    );

    const newPhone = generateBrandNewPhone(spec, wholesaleCost, shop.dailyNews);
    const matchingDist = BRAND_DISTRIBUTORS.find((d) =>
      d.brands.includes(spec.brand)
    );
    setShop((prev) => {
      const nextLoyalty = { ...(prev.distributorLoyalty ?? {}) };
      if (matchingDist) {
        nextLoyalty[matchingDist.id] = (nextLoyalty[matchingDist.id] ?? 0) + 1;
      }
      const nextState: ShopState = {
        ...prev,
        cash: prev.cash - wholesaleCost,
        inventory: [newPhone, ...prev.inventory],
        distributorLoyalty: nextLoyalty,
        discoveredSpecIds: discoverSpec(prev.discoveredSpecIds, spec.id),
        todayStats: {
          ...prev.todayStats,
          wholesaleSpend: prev.todayStats.wholesaleSpend + wholesaleCost,
        },
      };
      return applyXpGain(nextState, 18);
    });
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
      `Hikaye Bölümü Tamam! +${formatTRY(ch.rewardCash)} · +${ch.rewardXp} XP`,
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
      setShop((prev) => ({
        ...prev,
        currentQueueIndex: prev.currentQueueIndex + 1,
      }));
    } else {
      const rent = getDailyRent(shop.day, shop.shopTier);
      const wages = getDailyStaffWages(shop.staff);
      const techWork = applyMasterTechEndOfDay(shop);
      const passiveAcc = simulateEndOfDayAccessorySales(shop);
      const empireEod = processEmpireEndOfDay(shop);
      const nextCash =
        shop.cash +
        passiveAcc.revenue +
        empireEod.branchIncome -
        rent -
        wages -
        techWork.cost -
        empireEod.loanPayments;
      soundFX.playDayComplete();

      setShop((prev) => {
        const finalStats = {
          ...prev.todayStats,
          rentCost: rent,
          staffWages: wages,
          repairSpend: prev.todayStats.repairSpend + techWork.cost,
          accessoriesSold: prev.todayStats.accessoriesSold + passiveAcc.unitsSold,
          accessoryRevenue: prev.todayStats.accessoryRevenue + passiveAcc.revenue,
          branchIncome: (prev.todayStats.branchIncome ?? 0) + empireEod.branchIncome,
          loanPayments: (prev.todayStats.loanPayments ?? 0) + empireEod.loanPayments,
          autoRepairedNote: techWork.note,
          passiveAccessoryNote: passiveAcc.note,
        };
        const historyEntry = buildDayHistoryEntry(
          finalStats,
          prev.dailyNews.headline,
          prev.reputation,
          nextCash
        );
        const filteredHistory = prev.history.filter(
          (entry) => entry.day !== prev.day
        );
        let nextState: ShopState = {
          ...prev,
          cash: nextCash,
          inventory: techWork.updatedInventory,
          accessories: passiveAcc.updatedAccessories,
          activeLoans: empireEod.updatedLoans,
          weeklyTaxDue: empireEod.newWeeklyTaxDue,
          rival: empireEod.updatedRival,
          totalPhonesRepaired: prev.totalPhonesRepaired + techWork.fixedCount,
          totalAccessoriesSold:
            prev.totalAccessoriesSold + passiveAcc.unitsSold,
          totalProfitEarned:
            prev.totalProfitEarned + passiveAcc.profit + empireEod.branchIncome,
          todayStats: finalStats,
          history: [...filteredHistory, historyEntry],
        };
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

      if (nextCash < 0 && shop.inventory.length === 0) {
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
      const nextBase: ShopState = {
        ...prev,
        day: nextDay,
        dailyNews: nextNews,
        dailyWholesaleDiscountBrand: pickDailyWholesaleDiscountBrand(nextDay),
        dailyQuests: generateDailyQuests(nextDay, prev.upgrades),
        currentQueueIndex: 0,
        todayStats: createEmptyDayStats(nextDay, prev.shopTier, prev.staff),
      };
      nextBase.dailyQueue = generateDailyQueue(nextBase);
      nextBase.onlineListings = generateOnlineClassifieds(nextBase);
      nextBase.shippingOrders = generateShippingOrders(nextBase);
      nextBase.dailyAuctionLot = generateDailyAuctionLot(nextBase);
      return nextBase;
    });
    setActiveTab('COUNTER');
    setScreen('MORNING_NEWS');
  };

  const applyInventoryRepair = (
    phoneUid: string,
    defectId: DefectId,
    cost: number,
    masterCrafted: boolean
  ) => {
    soundFX.playRepair();
    pushFeedback(
      masterCrafted
        ? `-${formatTRY(cost)} · Usta İşi (+%8 Değer)!`
        : `-${formatTRY(cost)} · ${DEFECT_CATALOG[defectId].shortLabel} Onarıldı`,
      'positive'
    );

    setShop((prev) => {
      const nextInv = prev.inventory.map((phone) => {
        if (phone.uid !== phoneUid) return phone;
        const nextDefects = phone.defects.filter((d) => d !== defectId);
        const updatedPhone: PhoneDevice = {
          ...phone,
          defects: nextDefects,
          repairedDefects: [...phone.repairedDefects, defectId],
          repairSpend: phone.repairSpend + cost,
          masterCrafted: phone.masterCrafted || masterCrafted,
          batteryHealth:
            defectId === 'battery_degraded' || defectId === 'battery_fake_chip'
              ? 100
              : phone.batteryHealth,
          reportedBatteryHealth:
            defectId === 'battery_degraded' || defectId === 'battery_fake_chip'
              ? 100
              : phone.reportedBatteryHealth,
        };
        const newFair = calculateMarketValue(updatedPhone, false, prev.dailyNews);
        return {
          ...updatedPhone,
          askingPrice: Math.max(updatedPhone.askingPrice, roundPrice(newFair * 1.15)),
        };
      });

      let nextState: ShopState = {
        ...prev,
        cash: prev.cash - cost,
        inventory: nextInv,
        totalPhonesRepaired: prev.totalPhonesRepaired + 1,
        todayStats: {
          ...prev.todayStats,
          repairSpend: prev.todayStats.repairSpend + cost,
        },
      };
      nextState = applyXpGain(nextState, masterCrafted ? 55 : 25);
      return applyQuestProgress(nextState, 'REPAIR_PHONE', 1);
    });
  };

  const handleQuickRepairDefect = (
    phoneUid: string,
    defectId: DefectId,
    external: boolean
  ) => {
    const cost = getRepairCost(
      defectId,
      shop.upgrades,
      shop.dailyNews,
      external,
      shop.level,
      shop.legacyPath
    );
    if (shop.cash < cost) return;
    applyInventoryRepair(phoneUid, defectId, cost, false);
  };

  const handleStartMiniRepair = (
    phone: PhoneDevice,
    defectId: DefectId,
    cost: number
  ) => {
    if (shop.cash < cost) return;
    soundFX.playClick();
    setMiniRepairJob({ mode: 'INVENTORY', phone, defectId, cost });
  };

  const handleMiniRepairSuccess = (masterCrafted: boolean) => {
    if (!miniRepairJob) return;
    const job = miniRepairJob;
    setMiniRepairJob(null);

    if (job.mode === 'INVENTORY') {
      applyInventoryRepair(job.phone.uid, job.defectId, job.cost, masterCrafted);
    } else {
      completeExpressRepair(masterCrafted ? 1000 : 350);
    }
  };

  const handleClaimDailyQuest = (questId: string) => {
    const quest = shop.dailyQuests.find((q) => q.id === questId);
    if (!quest || quest.claimed || quest.progress < quest.target) return;
    soundFX.playQuestClaim();
    pushFeedback(
      `+${formatTRY(quest.reward)} · +${quest.xpReward} XP Görev Ödülü!`,
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
      `Kariyer Ödülü: +${formatTRY(ms.rewardCash)} · +${ms.rewardXp} XP!`,
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
            calculateMarketValue(updated, false, prev.dailyNews) * 1.15
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

  const handleBuyUpgrade = (upgradeId: UpgradeId) => {
    const upg = SHOP_UPGRADES.find((u) => u.id === upgradeId);
    if (!upg || shop.upgrades.includes(upgradeId) || shop.cash < upg.cost) return;
    soundFX.playCashRegister();
    pushFeedback(`${upg.name} Kuruldu!`, 'positive');

    setShop((prev) => ({
      ...prev,
      cash: prev.cash - upg.cost,
      upgrades: [...prev.upgrades, upgradeId],
    }));
  };

  const handleUpgradeShopTier = (targetTier: ShopTier) => {
    const info = SHOP_TIERS[targetTier];
    if (
      targetTier !== shop.shopTier + 1 ||
      shop.cash < info.cost ||
      shop.reputation < info.minReputation
    ) {
      return;
    }
    soundFX.playDayComplete();
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
  };

  const handleBuyDecoration = (decorId: DecorationId) => {
    const dec = SHOP_DECORATIONS.find((d) => d.id === decorId);
    if (!dec || shop.decorations.includes(decorId) || shop.cash < dec.cost) return;
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
    if (!member || shop.staff.includes(staffId) || shop.cash < member.hireCost) return;
    soundFX.playCashRegister();
    pushFeedback(`${member.name} Ekibe Katıldı!`, 'positive');

    setShop((prev) => ({
      ...prev,
      cash: prev.cash - member.hireCost,
      staff: [...prev.staff, staffId],
    }));
  };

  const handleTrainStaff = (staffId: StaffId) => {
    if (!shop.staff.includes(staffId)) return;
    const currentLvl = shop.staffLevels?.[staffId] ?? 1;
    if (currentLvl >= 3) return;
    const cost = STAFF_TRAINING_COSTS[currentLvl + 1] ?? 12000;
    if (shop.cash < cost) return;
    const member = SHOP_STAFF.find((s) => s.id === staffId);
    soundFX.playLevelUp();
    pushFeedback(
      `${member?.name ?? 'Ekip'} Sv.${currentLvl + 1} Oldu!`,
      'positive'
    );
    setShop((prev) => ({
      ...prev,
      cash: prev.cash - cost,
      staffLevels: {
        ...prev.staffLevels,
        [staffId]: currentLvl + 1,
      },
    }));
  };

  const handleApplyCustomMod = (phoneUid: string, modId: CustomModId) => {
    const spec = CUSTOM_MODS[modId];
    if (!spec || shop.cash < spec.cost) return;
    const target = shop.inventory.find((p) => p.uid === phoneUid);
    if (!target || target.isBrandNew || target.customMod) return;
    soundFX.playRepair();
    pushFeedback(`${spec.name} Uygulandı (+%${Math.round(spec.valueBoostRatio * 100)} Değer)!`, 'positive');
    setShop((prev) => {
      const nextInv = prev.inventory.map((phone) => {
        if (phone.uid !== phoneUid) return phone;
        const updated: PhoneDevice = {
          ...phone,
          customMod: modId,
          repairSpend: phone.repairSpend + spec.cost,
        };
        const fairVal = calculateMarketValue(updated, false, prev.dailyNews);
        return {
          ...updated,
          askingPrice: Math.max(updated.askingPrice, roundPrice(fairVal * 1.15)),
        };
      });
      const nextState: ShopState = {
        ...prev,
        cash: prev.cash - spec.cost,
        inventory: nextInv,
        todayStats: {
          ...prev.todayStats,
          repairSpend: prev.todayStats.repairSpend + spec.cost,
        },
      };
      return applyXpGain(nextState, 35);
    });
  };

  const handleClaimDailyStreak = () => {
    if (shop.dailyStreakClaimed) return;
    const idx = Math.min(DAILY_STREAK_REWARDS.length - 1, Math.max(0, (shop.loginStreak ?? 1) - 1));
    const reward = DAILY_STREAK_REWARDS[idx];
    soundFX.playQuestClaim();
    pushFeedback(
      `Günlük Giriş Serisi #${reward.day}: +${formatTRY(reward.cash)} · +${reward.xp} XP!`,
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

  const handleBuyClassified = (listingId: string) => {
    const listing = shop.onlineListings.find((l) => l.id === listingId);
    if (!listing || listing.bought || shop.cash < listing.askingPrice) return;
    soundFX.playCashRegister();
    pushFeedback(`-${formatTRY(listing.askingPrice)} · İlan Kargosu Atölyede!`, 'amber');
    const fairVal = calculateMarketValue(listing.device, false, shop.dailyNews);
    const boughtPhone: PhoneDevice = {
      ...listing.device,
      purchasePrice: listing.askingPrice,
      inspected: { screen: true, battery: true, imei: true, hardware: true },
      listedForSale: false,
      askingPrice: roundPrice(fairVal * 1.15),
    };
    setShop((prev) => {
      const nextState: ShopState = {
        ...prev,
        cash: prev.cash - listing.askingPrice,
        inventory: [boughtPhone, ...prev.inventory],
        discoveredSpecIds: discoverSpec(prev.discoveredSpecIds, boughtPhone.specId),
        onlineListings: prev.onlineListings.map((l) =>
          l.id === listingId ? { ...l, bought: true } : l
        ),
        todayStats: {
          ...prev.todayStats,
          phonesBought: prev.todayStats.phonesBought + 1,
          buySpend: prev.todayStats.buySpend + listing.askingPrice,
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

    const gross = roundPrice(
      calculateMarketValue(phone, false, shop.dailyNews) * order.bonusMultiplier
    );
    const netPayout = gross - order.shippingFee;
    const profit = netPayout - (phone.purchasePrice + phone.repairSpend);

    soundFX.playCashRegister();
    pushFeedback(`+${formatTRY(netPayout)} · ${order.city} Kargo Satışı Tamam!`, 'positive');

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
          salesRevenue: prev.todayStats.salesRevenue + netPayout,
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

  const handleResolveAuction = (wonByPlayer: boolean, finalBid: number) => {
    const lot = shop.dailyAuctionLot;
    if (!lot || lot.resolved) return;

    if (!wonByPlayer) {
      soundFX.playClick();
      pushFeedback('Açık Artırma Rakibe Kaldı', 'amber');
      setShop((prev) => ({
        ...prev,
        dailyAuctionLot: prev.dailyAuctionLot
          ? {
              ...prev.dailyAuctionLot,
              resolved: true,
              wonByPlayer: false,
              winningBid: finalBid,
            }
          : null,
      }));
      return;
    }

    if (shop.cash < finalBid) return;
    soundFX.playDayComplete();
    pushFeedback(`İHALE SENİN! ${lot.devices.length} Cihaz + Aksesuar Atölyede!`, 'positive');

    const perPhoneCost = Math.round(finalBid / Math.max(1, lot.devices.length));
    const wonDevices: PhoneDevice[] = lot.devices.map((d) => ({
      ...d,
      purchasePrice: perPhoneCost,
      inspected: { screen: true, battery: true, imei: true, hardware: true },
      listedForSale: false,
      askingPrice: roundPrice(calculateMarketValue(d, false, shop.dailyNews) * 1.15),
    }));

    setShop((prev) => {
      const nextAccessories = { ...prev.accessories };
      for (const acc of lot.bonusAccessories) {
        const cur = nextAccessories[acc.id];
        if (cur) {
          nextAccessories[acc.id] = {
            ...cur,
            quantity: cur.quantity + acc.quantity,
          };
        }
      }
      let nextDisc = prev.discoveredSpecIds;
      for (const p of wonDevices) {
        nextDisc = discoverSpec(nextDisc, p.specId);
      }
      const nextState: ShopState = {
        ...prev,
        cash: prev.cash - finalBid,
        inventory: [...wonDevices, ...prev.inventory],
        accessories: nextAccessories,
        discoveredSpecIds: nextDisc,
        totalAuctionsWon: (prev.totalAuctionsWon ?? 0) + 1,
        dailyAuctionLot: prev.dailyAuctionLot
          ? {
              ...prev.dailyAuctionLot,
              resolved: true,
              wonByPlayer: true,
              winningBid: finalBid,
            }
          : null,
        todayStats: {
          ...prev.todayStats,
          phonesBought: prev.todayStats.phonesBought + wonDevices.length,
          buySpend: prev.todayStats.buySpend + finalBid,
        },
      };
      return applyXpGain(nextState, 65);
    });
  };

  const handleUnlockBranch = (branchId: BranchId) => {
    const spec = CITY_BRANCHES.find((b) => b.id === branchId);
    if (
      !spec ||
      shop.branches.includes(branchId) ||
      shop.cash < spec.unlockCost ||
      shop.level < spec.minLevel ||
      shop.reputation < spec.minReputation
    ) {
      return;
    }
    soundFX.playDayComplete();
    pushFeedback(`Yeni Şube Açıldı: ${spec.name}!`, 'positive');
    setShop((prev) => {
      const nextState: ShopState = {
        ...prev,
        cash: prev.cash - spec.unlockCost,
        branches: [...prev.branches, branchId],
      };
      return applyXpGain(nextState, 80);
    });
  };

  const handleRunRivalPromo = () => {
    const promoCost = 1800;
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
        marketShare: Math.max(5, prev.rival.marketShare - 12),
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
    if ((shop.activeLoans?.length ?? 0) >= 2) return;
    const totalRepay = Math.round(offer.principal * (1 + offer.interestRate));
    soundFX.playCashRegister();
    pushFeedback(`+${formatTRY(offer.principal)} · ${offer.name} Hesabına Yattı!`, 'amber');
    const newLoan = {
      id: `loan_${Date.now()}`,
      name: offer.name,
      remainingBalance: totalRepay,
      dailyPayment: Math.ceil(totalRepay / offer.termDays),
      daysLeft: offer.termDays,
    };
    setShop((prev) => ({
      ...prev,
      cash: prev.cash + offer.principal,
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
    pushFeedback(`Vergi & Faturalar Ödendi (-${formatTRY(shop.weeklyTaxDue)})`, 'positive');
    setShop((prev) => ({
      ...prev,
      cash: prev.cash - prev.weeklyTaxDue,
      reputation: Math.min(5, prev.reputation + 0.05),
      weeklyTaxDue: 0,
      todayStats: {
        ...prev.todayStats,
        taxPaid: (prev.todayStats.taxPaid ?? 0) + prev.weeklyTaxDue,
        reputationDelta: prev.todayStats.reputationDelta + 0.05,
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

  if (screen === 'TITLE_MENU') {
    return (
      <TitleScreen
        savedState={savedSnapshot}
        onStartNew={handleStartNew}
        onContinue={handleContinue}
      />
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
      {/* LOW-OCCLUSION GAME HUD HEADER (Responsive for Mobile & Desktop) */}
      <header className="min-h-14 shrink-0 border-b border-white/10 bg-[#131A24] px-3 sm:px-4 py-1.5 sm:py-0 flex flex-wrap lg:flex-nowrap items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1 lg:flex-initial">
          <div className="hidden sm:block shrink-0">
            <BrandLogo size="compact" />
          </div>

          <nav
            aria-label="Dükkan bölümleri"
            className="flex items-center gap-1 rounded-xl bg-[#0D1219] p-1 border border-white/8 overflow-x-auto max-w-full"
          >
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setActiveTab('COUNTER');
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'COUNTER'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-300 hover:text-slate-50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Tezgah</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setActiveTab('WORKSHOP');
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'WORKSHOP'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-300 hover:text-slate-50'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Atölye ({shop.inventory.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setActiveTab('WHOLESALE');
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'WHOLESALE'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-300 hover:text-slate-50'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Toptancı</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setActiveTab('EMPIRE');
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'EMPIRE'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-300 hover:text-slate-50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Piyasa</span>
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
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'MISSIONS'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-300 hover:text-slate-50'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Görevler</span>
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
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'UPGRADES'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-300 hover:text-slate-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Büyütme</span>
            </button>
          </nav>
        </div>

        {/* Unboxed Tabular HUD Readouts */}
        <div className="flex items-center gap-3.5 sm:gap-5 tabular-nums shrink-0">
          <div className="hidden xl:flex items-center gap-3 text-xs text-slate-400">
            <span>
              Gün <strong className="text-slate-100 font-mono">{shop.day}</strong>
            </span>
            <span aria-hidden="true" className="text-white/20">·</span>
            <span>
              Sv. <strong className="text-amber-300 font-mono">{shop.level}</strong>
            </span>
            <span aria-hidden="true" className="text-white/20">·</span>
            <span className="inline-flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-slate-400" />
              <strong className="text-slate-100 font-mono">{listedCount}</strong> vitrin
            </span>
            <span aria-hidden="true" className="text-white/20">·</span>
            <span>
              Prestij <strong className="text-amber-300 font-mono">{prestige}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="font-mono">{shop.reputation.toFixed(1)}</span>
            </div>

            <div className="text-right">
              <div className="font-mono text-sm sm:text-base font-extrabold text-emerald-400 leading-none">
                {formatTRY(shop.cash)}
              </div>
              {!shop.endlessMode && (
                <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                  Showroom Hedef %{victoryProgress}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <PWAInstallButton variant="compact" />
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setShowNewspaperReview(true);
              }}
              aria-label="Pasaj Postası gazetesini oku"
              title="Pasaj Postası & Günlük Görevler"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#1B2432] text-amber-300 hover:text-amber-200 hover:bg-[#243042] transition-colors cursor-pointer"
            >
              <Newspaper className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setShowAnalyticsModal(true);
              }}
              aria-label="D3 İstatistik panelini aç"
              title="Dükkan İstatistikleri (D3)"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#1B2432] text-emerald-300 hover:text-emerald-200 hover:bg-[#243042] transition-colors cursor-pointer"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleToggleMute}
              aria-label={muted ? 'Sesi aç' : 'Sesi kapat'}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#1B2432] text-slate-300 hover:text-slate-50 hover:bg-[#243042] transition-colors cursor-pointer"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setScreen('PAUSED');
              }}
              aria-label="Oyunu duraklat"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#1B2432] text-slate-300 hover:text-slate-50 hover:bg-[#243042] transition-colors cursor-pointer"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ACTIVE SHOP PLAYFIELD */}
      <main className="relative flex-1 min-h-0 flex flex-col">
        {activeTab === 'COUNTER' && (
          <CounterView
            encounter={currentEncounter}
            cash={shop.cash}
            shopTier={shop.shopTier}
            shopLevel={shop.level}
            legacyPath={shop.legacyPath}
            dealStreak={shop.dealStreak}
            upgrades={shop.upgrades}
            activeDecorations={shop.activeDecorations}
            accessories={shop.accessories}
            dailyNews={shop.dailyNews}
            dailyQuests={shop.dailyQuests}
            queue={shop.dailyQueue}
            queueIndex={shop.currentQueueIndex}
            queueTotal={shop.dailyQueue.length}
            onOpenNewspaper={() => {
              soundFX.playClick();
              setShowNewspaperReview(true);
            }}
            onOpenMissions={() => {
              soundFX.playClick();
              setActiveTab('MISSIONS');
            }}
            onClaimDailyQuest={handleClaimDailyQuest}
            onPlaceOnDeskReaction={handlePlaceOnDeskReaction}
            onInspect={handleInspect}
            onInspectAll={handleInspectAll}
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
            onAcceptBulkAuction={handleAcceptBulkAuction}
            onResolveWarranty={handleResolveWarranty}
            onResolveDataRecovery={handleResolveDataRecovery}
            shakeTrigger={shakeTrigger}
          />
        )}

        {activeTab === 'WORKSHOP' && (
          <WorkshopView
            inventory={shop.inventory}
            cash={shop.cash}
            shopTier={shop.shopTier}
            shopLevel={shop.level}
            legacyPath={shop.legacyPath}
            upgrades={shop.upgrades}
            dailyNews={shop.dailyNews}
            onQuickRepairDefect={handleQuickRepairDefect}
            onStartMiniRepair={handleStartMiniRepair}
            onAddBoxKit={handleAddBoxKit}
            onApplyCustomMod={handleApplyCustomMod}
            onUpdateListing={handleUpdateListing}
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
            onBackToCounter={() => {
              soundFX.playClick();
              setActiveTab('COUNTER');
            }}
          />
        )}

        {activeTab === 'EMPIRE' && (
          <EmpireView
            shop={shop}
            onBuyClassified={handleBuyClassified}
            onFulfillShipping={handleFulfillShipping}
            onResolveAuction={handleResolveAuction}
            onUnlockBranch={handleUnlockBranch}
            onRunRivalPromo={handleRunRivalPromo}
            onBuyoutRival={handleBuyoutRival}
            onTakeLoan={handleTakeLoan}
            onRepayLoanEarly={handleRepayLoanEarly}
            onPayWeeklyTax={handlePayWeeklyTax}
            onBuyMuseumItem={handleBuyMuseumItem}
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
            shopTier={shop.shopTier}
            ownedUpgrades={shop.upgrades}
            ownedDecorations={shop.decorations}
            activeDecorations={shop.activeDecorations}
            hiredStaff={shop.staff}
            staffLevels={shop.staffLevels}
            branches={shop.branches}
            museumItems={shop.museumItems}
            onBuyUpgrade={handleBuyUpgrade}
            onUpgradeShopTier={handleUpgradeShopTier}
            onBuyDecoration={handleBuyDecoration}
            onToggleDecoration={handleToggleDecoration}
            onHireStaff={handleHireStaff}
            onTrainStaff={handleTrainStaff}
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

      {/* INTERACTIVE 3-STEP MINI-REPAIR MODAL */}
      {miniRepairJob && (
        <MiniRepairModal
          phone={miniRepairJob.phone}
          defectId={miniRepairJob.defectId}
          cost={miniRepairJob.cost}
          isExpressJob={miniRepairJob.mode === 'EXPRESS'}
          legacyPath={shop.legacyPath}
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

      {/* GAME SHELL MODALS */}
      {screen === 'PAUSED' && (
        <PauseModal
          onResume={() => {
            soundFX.playClick();
            setScreen('PLAYING');
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
      <OfflineIndicator />
    </div>
  );
}
