import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowDownToLine,
  ArrowLeftRight,
  Award,
  BatteryCharging,
  Check,
  Clock,
  Coffee,
  Cpu,
  CreditCard,
  Database,
  DoorOpen,
  Flame,
  Gavel,
  Gift,
  Handshake,
  HeartHandshake,
  Newspaper,
  Package,
  RefreshCcw,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Target,
  UserX,
  Wrench,
  Zap,
} from 'lucide-react';
import {
  ACCESSORY_CATALOG,
  CUSTOMER_ARCHETYPES,
  DEFECT_CATALOG,
  DESK_PLACEMENT_LINES,
  LEGACY_PATHS,
  NEGOTIATION_TONES,
} from '../game/catalog';
import {
  calculateMarketValue,
  formatTRY,
  getAccessorySpec,
  getDiscoveredDefects,
  getMoodDisplay,
  getPatienceLabel,
  getRepairCost,
  getStreakBonusCash,
  roundPrice,
} from '../game/engine';
import { soundFX } from '../game/sound';
import {
  AccessoryId,
  AccessoryStockItem,
  CustomerEncounter,
  DailyMarketEvent,
  DailyQuest,
  DecorationId,
  DefectId,
  InspectionCategory,
  LegacyPathId,
  NegotiationTone,
  ShopTier,
  UpgradeId,
} from '../game/types';
import { CustomerAvatar } from './CustomerAvatar';
import { DeviceDeskCard } from './DeviceDeskCard';
import { ShopDecorLayer } from './ShopDecorLayer';

// Smooth Typewriter Effect for Dynamic Witty Shop Dialogues
const TypewriterText: React.FC<{
  text: string;
  animate: boolean;
  speedMs?: number;
}> = ({ text, animate, speedMs = 17 }) => {
  const [visibleCount, setVisibleCount] = useState(animate ? 0 : text.length);

  useEffect(() => {
    if (!animate) {
      setVisibleCount(text.length);
      return;
    }
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setVisibleCount(text.length);
      return;
    }

    setVisibleCount(0);
    let idx = 0;
    const timer = window.setInterval(() => {
      idx += 2;
      if (idx >= text.length) {
        setVisibleCount(text.length);
        window.clearInterval(timer);
      } else {
        setVisibleCount(idx);
      }
    }, speedMs);

    return () => window.clearInterval(timer);
  }, [text, animate, speedMs]);

  const isTyping = visibleCount < text.length;

  return (
    <span
      onClick={() => {
        if (isTyping) setVisibleCount(text.length);
      }}
      className={isTyping ? 'cursor-pointer' : undefined}
    >
      {text.slice(0, visibleCount)}
      {isTyping && (
        <span
          aria-hidden="true"
          className="inline-block w-1.5 h-3.5 ml-0.5 align-middle bg-amber-400/90"
        />
      )}
    </span>
  );
};

interface CounterViewProps {
  encounter: CustomerEncounter | null;
  cash: number;
  shopTier: ShopTier;
  shopLevel: number;
  legacyPath: LegacyPathId;
  dealStreak: number;
  upgrades: UpgradeId[];
  activeDecorations: DecorationId[];
  accessories: Record<AccessoryId, AccessoryStockItem>;
  dailyNews: DailyMarketEvent;
  dailyQuests: DailyQuest[];
  queue: CustomerEncounter[];
  queueIndex: number;
  queueTotal: number;
  onOpenNewspaper: () => void;
  onOpenMissions: () => void;
  onClaimDailyQuest: (questId: string) => void;
  onPlaceOnDeskReaction: (line: string) => void;
  onInspect: (category: InspectionCategory) => void;
  onInspectAll: () => void;
  onUseLeverage: (defectId: DefectId) => void;
  onServeTea: () => void;
  onBluffOrPitch: () => void;
  onUseLegacyDialogue: () => void;
  onAcceptPosInstallment: () => void;
  onPitchCrossSell: (accessoryId: AccessoryId) => void;
  onCompleteAccessoryOrder: () => void;
  onSubmitOffer: (
    offerPrice: number,
    tone: NegotiationTone,
    elapsedSec: number
  ) => void;
  onAcceptCurrentPrice: () => void;
  onDismiss: () => void;
  onNextCustomer: () => void;
  onGoToWorkshop: () => void;
  onExpressRepairQuick: () => void;
  onExpressRepairMini: () => void;
  onAcceptBulkAuction: () => void;
  onResolveWarranty: (choice: 'REPAIR' | 'REFUND' | 'REJECT') => void;
  onResolveDataRecovery: (mode: 'SOFTWARE' | 'CLEAN_ROOM') => void;
  shakeTrigger: number;
}

export const CounterView: React.FC<CounterViewProps> = ({
  encounter,
  cash,
  shopTier,
  shopLevel,
  legacyPath,
  dealStreak,
  upgrades,
  activeDecorations,
  accessories,
  dailyNews,
  dailyQuests,
  queue,
  queueIndex,
  queueTotal,
  onOpenNewspaper,
  onOpenMissions,
  onClaimDailyQuest,
  onPlaceOnDeskReaction,
  onInspect,
  onInspectAll,
  onUseLeverage,
  onServeTea,
  onBluffOrPitch,
  onUseLegacyDialogue,
  onAcceptPosInstallment,
  onPitchCrossSell,
  onCompleteAccessoryOrder,
  onSubmitOffer,
  onAcceptCurrentPrice,
  onDismiss,
  onNextCustomer,
  onGoToWorkshop,
  onExpressRepairQuick,
  onExpressRepairMini,
  onAcceptBulkAuction,
  onResolveWarranty,
  onResolveDataRecovery,
  shakeTrigger,
}) => {
  const [portraitFailed, setPortraitFailed] = useState(false);
  const [offerPrice, setOfferPrice] = useState<number>(0);
  const [deskStage, setDeskStage] = useState<'ARRIVING' | 'ON_DESK'>('ARRIVING');
  const [deviceCardExpanded, setDeviceCardExpanded] = useState<boolean>(true);
  const [selectedTone, setSelectedTone] = useState<NegotiationTone>('friendly');
  const [liveTurnSec, setLiveTurnSec] = useState<number>(0);
  const turnStartRef = useRef<number>(Date.now());
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const lastEncounterIdRef = useRef<string | null>(null);

  const hasProDiag = upgrades.includes('pro_diagnostic');
  const hasSamovar = upgrades.includes('tea_samovar');
  const legacyInfo = LEGACY_PATHS[legacyPath];

  useEffect(() => {
    setPortraitFailed(false);
    if (!encounter) return;

    const isBrandNewEncounter = lastEncounterIdRef.current !== encounter.id;
    lastEncounterIdRef.current = encounter.id;

    if (isBrandNewEncounter) {
      setDeviceCardExpanded(true);
      setSelectedTone(
        legacyPath === 'EX_APPRENTICE'
          ? 'analytical'
          : legacyPath === 'BORN_MERCHANT'
          ? 'firm'
          : 'friendly'
      );
      turnStartRef.current = Date.now();
      setLiveTurnSec(0);
      if (encounter.outcome === 'ACTIVE' && encounter.rounds === 0) {
        setDeskStage('ARRIVING');
        soundFX.playDoorBell();
      } else {
        setDeskStage('ON_DESK');
      }
    }

    if (encounter.type === 'SELLER') {
      const suggested = roundPrice(Math.max(1000, encounter.customerPrice * 0.82));
      setOfferPrice(Math.min(suggested, Math.max(1000, cash)));
    } else if (encounter.type === 'BUYER') {
      // Realistic: Start at our own showcase sticker price (never higher!)
      const sticker = Math.max(encounter.customerPrice, encounter.device.askingPrice);
      setOfferPrice(sticker);
    } else if (encounter.type === 'TRADE_IN') {
      const targetAsk = roundPrice(
        Math.min(
          encounter.device.askingPrice,
          Math.max(encounter.customerPrice + 750, encounter.initialCustomerPrice * 1.28)
        )
      );
      setOfferPrice(Math.max(encounter.customerPrice, targetAsk));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encounter?.id]);

  // Reset turn speed timer on every round / customer reply when active on desk
  useEffect(() => {
    turnStartRef.current = Date.now();
    setLiveTurnSec(0);
  }, [encounter?.id, encounter?.rounds, deskStage]);

  useEffect(() => {
    if (
      !encounter ||
      encounter.outcome !== 'ACTIVE' ||
      deskStage !== 'ON_DESK' ||
      (encounter.type !== 'SELLER' &&
        encounter.type !== 'BUYER' &&
        encounter.type !== 'TRADE_IN')
    ) {
      return;
    }
    const timer = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - turnStartRef.current) / 1000);
      setLiveTurnSec(elapsed);
    }, 500);
    return () => window.clearInterval(timer);
  }, [encounter?.id, encounter?.outcome, encounter?.type, deskStage]);

  useEffect(() => {
    if (!encounter || encounter.outcome !== 'ACTIVE') return;
    if (encounter.type === 'SELLER' && offerPrice > encounter.customerPrice) {
      setOfferPrice(encounter.customerPrice);
    }
    if (encounter.type === 'BUYER' || encounter.type === 'TRADE_IN') {
      const sticker = Math.max(encounter.customerPrice, encounter.device.askingPrice);
      if (offerPrice < encounter.customerPrice) {
        setOfferPrice(encounter.customerPrice);
      } else if (offerPrice > sticker) {
        setOfferPrice(sticker);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encounter?.customerPrice, encounter?.device.askingPrice]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [encounter?.messages.length, deskStage]);

  const handlePlaceOnDesk = () => {
    if (!encounter) return;
    soundFX.playDeskThud();
    turnStartRef.current = Date.now();
    setLiveTurnSec(0);
    setDeskStage('ON_DESK');
    const lines = DESK_PLACEMENT_LINES[encounter.type];
    if (lines && lines.length > 0 && encounter.messages.length <= 2) {
      const line = lines[Math.floor(Math.random() * lines.length)];
      onPlaceOnDeskReaction(line);
    }
  };

  const triggerOfferSubmit = () => {
    if (!encounter || encounter.outcome !== 'ACTIVE') return;
    if (encounter.type === 'SELLER' && offerPrice > cash) return;
    const elapsedSec = (Date.now() - turnStartRef.current) / 1000;
    onSubmitOffer(offerPrice, selectedTone, elapsedSec);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!encounter) return;
      if (e.target instanceof HTMLInputElement && e.target.type !== 'range') return;

      if (deskStage === 'ARRIVING' && encounter.outcome === 'ACTIVE') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handlePlaceOnDesk();
        }
        return;
      }

      if (
        e.key === 'Enter' &&
        encounter.outcome === 'ACTIVE' &&
        (encounter.type === 'SELLER' ||
          encounter.type === 'BUYER' ||
          encounter.type === 'TRADE_IN')
      ) {
        e.preventDefault();
        triggerOfferSubmit();
      } else if (e.key === ' ' && encounter.outcome !== 'ACTIVE') {
        e.preventDefault();
        onNextCustomer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encounter, deskStage, offerPrice, cash, selectedTone, onSubmitOffer, onNextCustomer]);

  const sliderBounds = useMemo(() => {
    if (!encounter) return { min: 1000, max: 20000, step: 250 };
    if (encounter.type === 'SELLER') {
      const min = roundPrice(Math.max(750, encounter.initialCustomerPrice * 0.4));
      const max = Math.max(min + 500, encounter.customerPrice);
      const step = max > 20000 ? 500 : 250;
      return { min, max, step };
    } else {
      // BUYER & TRADE_IN: Bounded between [Customer's Current Offer, Our Showcase Ceiling]
      const min = encounter.customerPrice;
      const max = Math.max(min, encounter.device.askingPrice);
      const step = max > 20000 ? 500 : 250;
      return { min, max, step };
    }
  }, [encounter]);

  const readyQuest = dailyQuests.find((q) => !q.claimed && q.progress >= q.target);
  const activeQuest =
    readyQuest ?? dailyQuests.find((q) => !q.claimed) ?? dailyQuests[0];

  const stockedCrossSellOptions = useMemo(
    () =>
      ACCESSORY_CATALOG.filter((spec) => (accessories[spec.id]?.quantity ?? 0) > 0).slice(
        0,
        3
      ),
    [accessories]
  );

  if (!encounter) {
    return (
      <div className="relative flex-1 flex flex-col items-center justify-center p-8 text-center">
        <ShopDecorLayer shopTier={shopTier} activeDecorations={activeDecorations} />
        <div className="relative z-10">
          <h2 className="font-display text-2xl font-bold text-slate-100 mb-2">
            Bugünkü Müşteriler Tamamlandı
          </h2>
          <p className="text-sm text-slate-300 max-w-md mb-6">
            Kepenkleri indirmeden önce Atölye veya Toptancı sekmesine uğrayıp telefonlarını hazırlayabilir, aksesuar reyonunu doldurabilirsin.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onGoToWorkshop}
              className="rounded-xl border border-white/15 bg-[#1D2634] px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-[#273345] transition-colors cursor-pointer whitespace-nowrap"
            >
              Atölyeye Göz At
            </button>
            <button
              type="button"
              onClick={onNextCustomer}
              className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer whitespace-nowrap"
            >
              Günü Bitir & Kasa Raporu
            </button>
          </div>
        </div>
      </div>
    );
  }

  const archetype = CUSTOMER_ARCHETYPES[encounter.archetypeId];
  const patienceInfo = getPatienceLabel(encounter.patience);
  const inspectedTarget =
    encounter.type === 'TRADE_IN' && encounter.tradeInDevice
      ? encounter.tradeInDevice
      : encounter.device;
  const discoveredDefects = getDiscoveredDefects(inspectedTarget);
  const allChecked =
    inspectedTarget.inspected.screen &&
    inspectedTarget.inspected.battery &&
    inspectedTarget.inspected.imei &&
    inspectedTarget.inspected.hardware;

  const isNegotiable =
    encounter.type === 'SELLER' ||
    encounter.type === 'BUYER' ||
    encounter.type === 'TRADE_IN';

  const estimatedMarketValue = calculateMarketValue(
    inspectedTarget,
    encounter.type === 'SELLER' || encounter.type === 'TRADE_IN',
    dailyNews
  );
  const totalCostBasis =
    encounter.device.purchasePrice + encounter.device.repairSpend;
  const projectedBuyerProfit =
    encounter.type === 'TRADE_IN' && encounter.tradeInDevice
      ? offerPrice + estimatedMarketValue - totalCostBasis
      : offerPrice - totalCostBasis;
  const canAffordOffer = encounter.type !== 'SELLER' || offerPrice <= cash;
  const canAffordInstant =
    encounter.type !== 'SELLER' || encounter.customerPrice <= cash;
  const isLastCustomer = queueIndex >= queueTotal - 1;
  const nextStreakBonus = getStreakBonusCash(dealStreak + 1, shopLevel);
  const buyerDiscountFromSticker =
    encounter.type === 'BUYER'
      ? Math.max(0, encounter.device.askingPrice - offerPrice)
      : 0;

  const offerTension = (() => {
    if (encounter.type === 'SELLER') {
      const ratio = offerPrice / Math.max(1, encounter.customerPrice);
      if (ratio < 0.65) {
        return {
          label: 'Aşırı Sert · Kızıp Kalkabilir!',
          tone: 'danger' as const,
          fill: 92,
        };
      }
      if (ratio < 0.8) {
        return {
          label: 'Sert Pazarlık · Sabır Harcar',
          tone: 'warning' as const,
          fill: 68,
        };
      }
      if (ratio < 0.94) {
        return {
          label: 'Tatlı Nokta · Kârlı & Dengeli',
          tone: 'positive' as const,
          fill: 42,
        };
      }
      return {
        label: 'Cömert Teklif · Hızlı El Sıkışma',
        tone: 'safe' as const,
        fill: 18,
      };
    } else {
      // BUYER: Comparing our counter-price against buyer's current offer & sticker
      const span = Math.max(1, encounter.device.askingPrice - encounter.customerPrice);
      const firmness = (offerPrice - encounter.customerPrice) / span;
      if (offerPrice <= encounter.customerPrice) {
        return {
          label: 'Anında Satış · Garanti El Sıkışma',
          tone: 'safe' as const,
          fill: 16,
        };
      }
      if (firmness <= 0.45) {
        return {
          label: 'Tatlı İndirim · Yüksek Anlaşma Şansı',
          tone: 'positive' as const,
          fill: 38,
        };
      }
      if (firmness <= 0.85) {
        return {
          label: 'Dengeli İndirim · Pazarlık Devam Eder',
          tone: 'warning' as const,
          fill: 66,
        };
      }
      return {
        label: 'Etikette Sabit · Alıcı Sabır Harcar',
        tone: 'danger' as const,
        fill: 88,
      };
    }
  })();

  const testButtons: {
    key: InspectionCategory;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { key: 'screen', label: 'Ekran & Kasa', icon: <Smartphone className="w-4 h-4" /> },
    { key: 'battery', label: 'Pil & Devir', icon: <BatteryCharging className="w-4 h-4" /> },
    { key: 'imei', label: 'IMEI Sorgu', icon: <ScanLine className="w-4 h-4" /> },
    { key: 'hardware', label: 'Sıvı & Sensör', icon: <Cpu className="w-4 h-4" /> },
  ];

  const adjustOffer = (delta: number) => {
    setOfferPrice((prev) => {
      const next = Math.max(sliderBounds.min, Math.min(sliderBounds.max, prev + delta));
      return roundPrice(next);
    });
  };

  const roleText =
    encounter.type === 'SELLER'
      ? 'Cihaz Satıyor'
      : encounter.type === 'BUYER'
      ? encounter.device.isBrandNew
        ? 'Sıfır Kutu Alıcısı'
        : encounter.archetypeId === 'vip'
        ? 'VIP Alıcı'
        : 'Vitrin Alıcısı'
      : encounter.type === 'TRADE_IN'
      ? 'Takas (Trade-In)'
      : encounter.type === 'WARRANTY_CLAIM'
      ? 'Garanti & İade'
      : encounter.type === 'DATA_RECOVERY'
      ? 'Veri Kurtarma'
      : encounter.type === 'EXPRESS_REPAIR'
      ? 'Acil Tamir'
      : encounter.type === 'ACCESSORY_BUYER'
      ? 'Aksesuar Alıcısı'
      : 'Kapalı Kutu İhale';

  const placeButtonLabel =
    encounter.type === 'SELLER'
      ? 'Telefonu Masaya Al & İncele (Enter)'
      : encounter.type === 'BUYER'
      ? 'Vitrinden Cihazı Masaya Çıkar (Enter)'
      : encounter.type === 'TRADE_IN'
      ? 'Takas Cihazını Masaya Al & İncele (Enter)'
      : encounter.type === 'WARRANTY_CLAIM'
      ? 'Garanti Dosyasını & Cihazı İncele (Enter)'
      : encounter.type === 'DATA_RECOVERY'
      ? 'Cihazı Veri Masasına Bağla (Enter)'
      : encounter.type === 'EXPRESS_REPAIR'
      ? 'Arızalı Cihazı Tezgaha Al (Enter)'
      : encounter.type === 'ACCESSORY_BUYER'
      ? 'Aksesuar Sepetini Tezgaha Al (Enter)'
      : 'Kapalı Koliyi Masaya Koy (Enter)';

  const lastMessageId = encounter.messages[encounter.messages.length - 1]?.id;

  return (
    <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
      <ShopDecorLayer shopTier={shopTier} activeDecorations={activeDecorations} />

      {/* Top Info Strip: Newspaper + Live Detailed Quest + Queue Preview */}
      <div className="relative z-10 shrink-0 px-4 pt-2.5 space-y-2">
        <div
          className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-3.5 py-2 text-xs ${
            dailyNews.kind === 'launch'
              ? 'border-amber-400/35 bg-amber-500/10 text-amber-100'
              : dailyNews.kind === 'drop'
              ? 'border-rose-400/30 bg-rose-500/10 text-rose-100'
              : dailyNews.kind === 'discount'
              ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
              : 'border-white/8 bg-[#131B26]/88 text-slate-300'
          }`}
        >
          <button
            type="button"
            onClick={onOpenNewspaper}
            className="flex items-center gap-2 min-w-0 text-left hover:opacity-90 transition-opacity cursor-pointer"
            title="Pasaj Postası gazetesini aç"
          >
            <Newspaper
              className={`w-3.5 h-3.5 shrink-0 ${
                dailyNews.kind === 'launch'
                  ? 'text-amber-400'
                  : dailyNews.kind === 'drop'
                  ? 'text-rose-400'
                  : dailyNews.kind === 'discount'
                  ? 'text-emerald-400'
                  : 'text-amber-300'
              }`}
            />
            <span className="font-semibold truncate">{dailyNews.headline}</span>
            <span aria-hidden="true" className="hidden xl:inline text-white/25">·</span>
            <span className="hidden xl:inline text-slate-300/85 truncate max-w-md">
              {dailyNews.effectSummary}
            </span>
          </button>

          <div className="flex items-center gap-3.5 shrink-0 ml-auto">
            {dealStreak >= 2 && (
              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-orange-300 tabular-nums">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>{dealStreak}x Seri</span>
              </span>
            )}

            <div className="flex items-center gap-1.5" aria-label="Günün müşteri sırası">
              {queue.map((qItem, idx) => {
                const isCurrent = idx === queueIndex;
                const roleLetter =
                  qItem.type === 'SELLER'
                    ? 'S'
                    : qItem.type === 'BUYER'
                    ? 'A'
                    : qItem.type === 'TRADE_IN'
                    ? 'K'
                    : qItem.type === 'WARRANTY_CLAIM'
                    ? 'G'
                    : qItem.type === 'DATA_RECOVERY'
                    ? 'V'
                    : qItem.type === 'EXPRESS_REPAIR'
                    ? 'T'
                    : qItem.type === 'ACCESSORY_BUYER'
                    ? 'R'
                    : 'İ';
                const statusClass =
                  qItem.outcome === 'DEAL_CLOSED'
                    ? 'bg-emerald-500/25 border-emerald-400/60 text-emerald-200'
                    : qItem.outcome === 'WALKED_OUT'
                    ? 'bg-rose-500/25 border-rose-400/60 text-rose-200'
                    : qItem.outcome === 'DISMISSED'
                    ? 'bg-white/5 border-white/15 text-slate-500'
                    : isCurrent
                    ? 'bg-amber-500 border-amber-300 text-slate-950 font-bold'
                    : 'bg-[#1A2433] border-white/12 text-slate-400';
                return (
                  <span
                    key={qItem.id}
                    title={`#${idx + 1} ${qItem.customerName}`}
                    className={`flex h-5 w-5 items-center justify-center rounded-md border font-mono text-[10px] transition-colors ${statusClass}`}
                  >
                    {roleLetter}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Actionable Quest Bar */}
        {activeQuest && (
          <div
            className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-3.5 py-2 text-xs transition-colors ${
              readyQuest
                ? 'border-emerald-400/45 bg-emerald-500/12 text-emerald-100'
                : 'border-white/8 bg-[#121923]/88 text-slate-300'
            }`}
          >
            <button
              type="button"
              onClick={onOpenMissions}
              className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer hover:opacity-90"
            >
              <Target
                className={`w-4 h-4 shrink-0 ${
                  readyQuest ? 'text-emerald-400' : 'text-amber-400'
                }`}
              />
              <div className="min-w-0 flex flex-wrap items-center gap-x-2">
                <span className="font-bold text-slate-100 whitespace-nowrap">
                  {activeQuest.title}
                </span>
                <span aria-hidden="true" className="hidden md:inline text-white/25">·</span>
                <span className="hidden md:inline text-slate-400 truncate max-w-lg">
                  {activeQuest.description}
                </span>
              </div>
            </button>

            <div className="flex items-center gap-3 shrink-0 ml-auto tabular-nums">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      readyQuest ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((activeQuest.progress / activeQuest.target) * 100)
                      )}%`,
                    }}
                  />
                </div>
                <span className="font-mono text-[11px] font-semibold text-slate-200">
                  {activeQuest.progress}/{activeQuest.target}
                </span>
              </div>

              {readyQuest ? (
                <button
                  type="button"
                  onClick={() => onClaimDailyQuest(readyQuest.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1 text-[11px] font-extrabold text-slate-950 hover:bg-emerald-400 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>Ödülü Topla (+{formatTRY(readyQuest.reward)})</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenMissions}
                  className="text-[11px] font-semibold text-amber-300 hover:text-amber-200 cursor-pointer whitespace-nowrap"
                >
                  Görev & Hikaye →
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MAIN COUNTER PLAYFIELD: SHOP ENTRANCE -> PHYSICAL ON-DESK WORKBENCH */}
      <AnimatePresence mode="wait">
        {deskStage === 'ARRIVING' && encounter.outcome === 'ACTIVE' ? (
          <motion.div
            key={`arriving_${encounter.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.24 }}
            className="relative z-10 flex-1 min-h-0 flex flex-col items-center justify-center p-6 overflow-y-auto"
          >
            <div className="w-full max-w-3xl rounded-2xl border border-white/12 bg-[#141C27]/94 shadow-[0_24px_60px_rgba(0,0,0,0.65)] overflow-hidden">
              {/* Entrance Ambience Header */}
              <div className="border-b border-white/8 bg-[#101720] px-6 py-2.5 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-2 text-amber-300 font-semibold">
                  <DoorOpen className="w-4 h-4 text-amber-400" />
                  <span>Kapı zili çaldı · Müşteri tezgahın önüne geldi</span>
                </span>
                <span className="font-mono text-slate-400 tabular-nums">
                  #{queueIndex + 1} / {queueTotal}
                </span>
              </div>

              {/* Customer Entrance + Live Typing Speech Bubble */}
              <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
                <motion.div
                  initial={{ x: -44, opacity: 0, scale: 0.94 }}
                  animate={{ x: 0, opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                >
                  <CustomerAvatar
                    name={encounter.customerName}
                    title={encounter.customerTitle}
                    portraitPath={encounter.portraitPath}
                    fallbackColor={archetype.fallbackColor}
                    mood={encounter.mood}
                    moodScore={encounter.moodScore}
                    isVip={encounter.archetypeId === 'vip'}
                    isAccessoryBuyer={encounter.type === 'ACCESSORY_BUYER'}
                    size="lg"
                    portraitFailed={portraitFailed}
                    onPortraitError={() => setPortraitFailed(true)}
                  />
                </motion.div>

                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs mb-1">
                    <span className="font-semibold text-emerald-300">{roleText}</span>
                    <span aria-hidden="true" className="text-white/25">·</span>
                    <span className="text-slate-400">{encounter.customerTitle}</span>
                    {encounter.isRegular && (
                      <>
                        <span aria-hidden="true" className="text-white/25">·</span>
                        <span className="font-bold text-amber-300">Müdavim Müşteri ★</span>
                      </>
                    )}
                  </div>

                  <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-50 mb-3">
                    {encounter.customerName} içeri girdi
                  </h2>

                  {/* Witty Typing Speech Bubble */}
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.14 }}
                    className="rounded-xl border border-amber-400/20 bg-[#1C2634] px-4 py-3 text-sm text-slate-100 leading-relaxed mb-3.5"
                  >
                    “
                    <TypewriterText
                      text={encounter.messages[0]?.text ?? ''}
                      animate
                      speedMs={16}
                    />
                    ”
                  </motion.div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-400 tabular-nums">
                    <span>
                      Konu:{' '}
                      <strong className="text-slate-100">
                        {encounter.type === 'BULK_AUCTION'
                          ? '2’li Kapalı Toptancı Kolisi'
                          : encounter.type === 'ACCESSORY_BUYER'
                          ? `${encounter.accessoryOrder?.length ?? 1} Çeşit Aksesuar Sepeti`
                          : encounter.type === 'TRADE_IN' && encounter.tradeInDevice
                          ? `${encounter.tradeInDevice.brand} ${encounter.tradeInDevice.model} ⇄ ${encounter.device.brand} ${encounter.device.model}`
                          : encounter.type === 'WARRANTY_CLAIM'
                          ? `Garanti Talebi · ${encounter.warrantyRecord?.deviceName ?? encounter.device.model}`
                          : encounter.type === 'DATA_RECOVERY'
                          ? `${encounter.dataRecoveryJob?.title ?? 'Veri Kurtarma'} (${encounter.device.brand} ${encounter.device.model})`
                          : `${encounter.device.brand} ${encounter.device.model} (${encounter.device.storage})`}
                      </strong>
                    </span>
                    <span aria-hidden="true" className="text-white/20">·</span>
                    <span>
                      {encounter.type === 'BUYER'
                        ? 'Alıcı Teklifi:'
                        : encounter.type === 'TRADE_IN'
                        ? 'Nakit Fark Teklifi:'
                        : encounter.type === 'WARRANTY_CLAIM'
                        ? 'Onarım Maliyeti:'
                        : encounter.type === 'DATA_RECOVERY'
                        ? 'Maks. Servis Ödemesi:'
                        : 'İlk Fiyat:'}{' '}
                      <strong className="font-mono text-amber-400">
                        {formatTRY(encounter.customerPrice)}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* ESD Counter Placement Bar */}
              <div className="border-t border-white/10 bg-[#1B1713]/90 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-amber-200/80">
                  {encounter.type === 'ACCESSORY_BUYER'
                    ? 'Müşteri reyondan seçtiği ürünleri uzatıyor. Tezgaha alıp kasadan geçir.'
                    : 'Cihazı ESD tezgah matına bırak; genişleyebilir teknik kartı açıp pazarlığa başla.'}
                </div>
                <button
                  type="button"
                  onClick={handlePlaceOnDesk}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-extrabold text-slate-950 hover:bg-amber-400 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap shadow-[0_8px_24px_rgba(245,158,11,0.3)]"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  <span>{placeButtonLabel}</span>
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* 3-COLUMN PHYSICAL ON-DESK WORKBENCH */
          <motion.div
            key={`ondesk_${encounter.id}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 pt-3 overflow-y-auto lg:overflow-hidden"
          >
            {/* COLUMN 1: CUSTOMER PORTRAIT, DYNAMIC MOOD GAUGE & WITTY TYPING DIALOGUE (4 cols) */}
            <section className="lg:col-span-4 flex flex-col min-h-0 rounded-2xl border border-white/10 bg-[#161E29]/92 overflow-hidden">
              <div className="p-4 border-b border-white/8 shrink-0 space-y-3">
                <div className="flex items-center gap-3.5">
                  <CustomerAvatar
                    name={encounter.customerName}
                    title={encounter.customerTitle}
                    portraitPath={encounter.portraitPath}
                    fallbackColor={archetype.fallbackColor}
                    mood={encounter.mood}
                    moodScore={encounter.moodScore}
                    isVip={encounter.archetypeId === 'vip'}
                    isAccessoryBuyer={encounter.type === 'ACCESSORY_BUYER'}
                    size="sm"
                    portraitFailed={portraitFailed}
                    onPortraitError={() => setPortraitFailed(true)}
                    shakeKey={shakeTrigger}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="font-display text-lg font-bold text-slate-50 truncate">
                        {encounter.customerName}
                      </h2>
                      <span
                        className={`text-xs font-semibold whitespace-nowrap shrink-0 ${
                          encounter.type === 'SELLER'
                            ? 'text-amber-400'
                            : encounter.type === 'BUYER' ||
                              encounter.type === 'ACCESSORY_BUYER'
                            ? 'text-emerald-400'
                            : 'text-sky-300'
                        }`}
                      >
                        {roleText}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 mt-0.5 truncate">
                      {encounter.customerTitle}
                      {encounter.isRegular && (
                        <span className="ml-1.5 font-semibold text-amber-300">
                          · Müdavim ★
                        </span>
                      )}
                    </div>
                    {encounter.isRegular && encounter.regularNote && (
                      <div className="text-[11px] text-amber-200/80 mt-0.5 truncate">
                        {encounter.regularNote}
                      </div>
                    )}

                    {isNegotiable && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-[11px] mb-1 tabular-nums">
                          <span className="text-slate-400">Sabır</span>
                          <span
                            className={`font-semibold ${
                              patienceInfo.tone === 'positive'
                                ? 'text-emerald-400'
                                : patienceInfo.tone === 'warning'
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {patienceInfo.text} · %{encounter.patience}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              patienceInfo.tone === 'positive'
                                ? 'bg-emerald-500'
                                : patienceInfo.tone === 'warning'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${encounter.patience}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* DYNAMIC VISUAL CUSTOMER MOOD GAUGE (Speed & Tone Responsive) */}
                {isNegotiable && (() => {
                  const moodInfo = getMoodDisplay(encounter.mood);
                  const paceStatus =
                    liveTurnSec < 2
                      ? { text: 'Hızlı', cls: 'text-sky-300' }
                      : liveTurnSec <= 15
                      ? { text: 'Kararlı', cls: 'text-emerald-400' }
                      : { text: 'Bekletiyor!', cls: 'text-rose-400' };
                  return (
                    <div className="rounded-xl border border-white/8 bg-[#101720] px-3 py-2.5 space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-[11px] tabular-nums">
                        <span className="font-semibold text-slate-300">
                          Müşteri Ruh Hali
                        </span>
                        <span
                          className={`font-bold transition-colors duration-300 ${
                            moodInfo.tone === 'positive'
                              ? 'text-emerald-400'
                              : moodInfo.tone === 'neutral'
                              ? 'text-sky-300'
                              : moodInfo.tone === 'warning'
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {moodInfo.label} ({encounter.moodScore}/100)
                        </span>
                      </div>

                      {/* Continuous Spectrum Mood Meter with Live Animated Marker */}
                      <div className="relative h-2 w-full rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 overflow-visible">
                        <div
                          className="absolute top-1/2 -translate-y-1/2 -ml-1.5 h-3.5 w-3.5 rounded-full border-2 border-[#101720] bg-white shadow-[0_0_10px_rgba(255,255,255,0.85)] transition-all duration-300 ease-out"
                          style={{
                            left: `${Math.max(3, Math.min(97, encounter.moodScore))}%`,
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-2 text-[10.5px] text-slate-400">
                        <span className="truncate">
                          {encounter.lastMoodReason ?? moodInfo.shortNote}
                        </span>
                        {encounter.outcome === 'ACTIVE' && (
                          <span
                            className={`inline-flex items-center gap-1 font-mono font-semibold shrink-0 tabular-nums ${paceStatus.cls}`}
                            title="Müzakere hızın müşteri ruh halini doğrudan etkiler"
                          >
                            <Clock className="w-3 h-3" />
                            <span>
                              {paceStatus.text} ({liveTurnSec}s)
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Dynamic Witty Dialogue Thread with Typewriter on Latest Customer Bubble */}
              <div className="flex-1 min-h-0 overflow-y-auto pasaj-scroll p-4 space-y-2.5">
                {encounter.messages.map((msg) => {
                  const shouldType =
                    msg.speaker === 'customer' && msg.id === lastMessageId;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.16 }}
                      className={`flex ${
                        msg.speaker === 'player'
                          ? 'justify-end'
                          : msg.speaker === 'system'
                          ? 'justify-center'
                          : 'justify-start'
                      }`}
                    >
                      <div
                        className={`rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                          msg.speaker === 'system'
                            ? 'w-full text-center text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-200'
                            : msg.speaker === 'player'
                            ? 'max-w-[90%] bg-amber-500/15 border border-amber-500/25 text-amber-50'
                            : msg.tone === 'danger'
                            ? 'max-w-[90%] bg-rose-500/15 border border-rose-500/30 text-rose-100'
                            : msg.tone === 'positive'
                            ? 'max-w-[90%] bg-emerald-500/12 border border-emerald-500/25 text-emerald-50'
                            : msg.tone === 'warning'
                            ? 'max-w-[90%] bg-amber-500/10 border border-amber-500/25 text-amber-100'
                            : 'max-w-[90%] bg-[#202B39] border border-white/8 text-slate-100'
                        }`}
                      >
                        <TypewriterText
                          text={msg.text}
                          animate={shouldType}
                          speedMs={15}
                        />
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              <div className="px-4 py-2.5 border-t border-white/8 bg-[#121923] text-xs text-slate-400 shrink-0">
                İpucu: {archetype.traitSummary}
              </div>
            </section>

            {/* COLUMN 2: PHYSICAL ESD DESK MAT & EXPANDABLE DEVICE CARD (4 cols) */}
            <section className="lg:col-span-4 flex flex-col min-h-0 rounded-2xl border border-white/10 bg-[#161E29]/92 p-4 overflow-y-auto pasaj-scroll">
              {encounter.type === 'ACCESSORY_BUYER' && encounter.accessoryOrder ? (
                <div className="flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
                      <ShoppingBag className="w-4 h-4" />
                      <span>AKSESUAR REYONU · TEZGAH SATIŞI</span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-slate-50 mb-1">
                      Müşterinin Seçtiği Ürünler
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">
                      Reyonundan seçilen ürünler tezgaha bırakıldı. Etiket fiyatından peşin satış yapıp hemen nakit kazan!
                    </p>

                    <div className="space-y-2.5">
                      {encounter.accessoryOrder.map((line) => {
                        const spec = getAccessorySpec(line.id);
                        const lineTotal = line.quantity * line.unitPrice;
                        const lineProfit =
                          line.quantity * (line.unitPrice - spec.wholesaleCost);
                        return (
                          <div
                            key={line.id}
                            className="rounded-xl border border-white/10 bg-[#121822] p-3.5 flex items-center justify-between gap-3 tabular-nums"
                          >
                            <div className="min-w-0">
                              <div className="text-[11px] text-slate-400">
                                {spec.category}
                              </div>
                              <div className="font-display text-sm font-bold text-slate-100 truncate">
                                {line.quantity}x {spec.name}
                              </div>
                              <div className="text-[11px] text-emerald-400 font-mono">
                                Net kâr: +{formatTRY(lineProfit)}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-[10px] text-slate-500">
                                Birim {formatTRY(line.unitPrice)}
                              </div>
                              <div className="font-mono text-base font-extrabold text-amber-400">
                                {formatTRY(lineTotal)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-emerald-500/25 bg-emerald-500/8 p-3 text-xs text-emerald-200">
                    Cemal Usta’nın dediği gibi: dükkanın kirasını her gün aksesuar reyonu çıkarır!
                  </div>
                </div>
              ) : encounter.type === 'BULK_AUCTION' && encounter.bundleDevices ? (
                <div className="flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
                      <Package className="w-4 h-4" />
                      <span>ÖZEL SÜRPRİZ OLAY · KAPALI KUTU İHALE</span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-slate-50 mb-1">
                      2’li Gizemli Toptancı Kolisi
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">
                      Cihazların kusurları koli açılmadan görünmez. Risk alırsan piyasanın çok altında kapatabilirsin!
                    </p>

                    <div className="space-y-3">
                      {encounter.bundleDevices.map((d, idx) => (
                        <div
                          key={d.uid}
                          className="rounded-xl border border-white/10 bg-[#121822] p-3.5 flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="text-xs text-amber-400 font-semibold">
                              Kutu #{idx + 1}
                            </div>
                            <div className="font-display text-base font-bold text-slate-100">
                              {d.brand} {d.model}
                            </div>
                            <div className="text-xs text-slate-400">
                              {d.storage} ·{' '}
                              {encounter.outcome === 'DEAL_CLOSED'
                                ? `${d.defects.length} kusur tespit edildi`
                                : 'Durum Gizli (Koli Kapalı)'}
                            </div>
                          </div>
                          <div className="text-right tabular-nums">
                            <div className="text-[11px] text-slate-400">
                              {encounter.outcome === 'DEAL_CLOSED'
                                ? 'Gerçek Değer'
                                : 'Temiz Piyasa'}
                            </div>
                            <div className="font-mono text-sm font-bold text-slate-100">
                              {encounter.outcome === 'DEAL_CLOSED'
                                ? formatTRY(calculateMarketValue(d, false, dailyNews))
                                : formatTRY(d.baseValue)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/8 p-3 text-xs text-amber-200 tabular-nums">
                    Temiz hallerinin toplam piyasa değeri:{' '}
                    <strong>
                      {formatTRY(
                        encounter.bundleDevices.reduce((s, d) => s + d.baseValue, 0)
                      )}
                    </strong>
                  </div>
                </div>
              ) : encounter.type === 'WARRANTY_CLAIM' && encounter.warrantyRecord ? (
                <div className="flex flex-col flex-1 justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold mb-1">
                      <ShieldAlert className="w-4 h-4" />
                      <span>GARANTİ & İADE MASASI · DÜKKAN İTİBARI SINAVI</span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-slate-50 mb-1">
                      {encounter.warrantyRecord.deviceName}
                    </h3>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                      Müşteri daha önce senden aldığı cihazla geri döndü. Vereceğin karar pasajdaki itibarını ve sadık müşteri oranını doğrudan etkiler.
                    </p>

                    <div className="rounded-xl border border-white/10 bg-[#121822] p-4 space-y-2.5 text-xs tabular-nums">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Satış Günü</span>
                        <span className="font-mono font-semibold text-slate-200">
                          Gün {encounter.warrantyRecord.daySold}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Satış Bedeli</span>
                        <span className="font-mono font-semibold text-amber-300">
                          {formatTRY(encounter.warrantyRecord.salePrice)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Cihaz Geçmişi</span>
                        <span
                          className={`font-semibold ${
                            encounter.warrantyRecord.hadDefects
                              ? 'text-rose-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {encounter.warrantyRecord.hadDefects
                            ? 'Kusurlu satılmıştı (Riskli)'
                            : 'Temiz satılmıştı (Sonradan arıza)'}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-white/8 flex items-center justify-between">
                        <span className="text-slate-400">Ücretsiz Onarım Maliyeti</span>
                        <span className="font-mono font-bold text-emerald-300">
                          {formatTRY(encounter.warrantyRepairCost ?? 1000)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Kısmi İade Bedeli</span>
                        <span className="font-mono font-bold text-amber-300">
                          {formatTRY(encounter.warrantyRefundCost ?? 1500)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 p-3 text-xs text-amber-200 leading-relaxed">
                    Esnaf Kuralı: Malının arkasında duran telefoncuya pasajda her zaman yüksek itibar ve müdavim yağar!
                  </div>
                </div>
              ) : encounter.type === 'DATA_RECOVERY' && encounter.dataRecoveryJob ? (
                <div className="flex flex-col flex-1 justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold mb-1">
                      <Database className="w-4 h-4" />
                      <span>VERİ KURTARMA & YAZILIM SERVİSİ</span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-slate-50 mb-1">
                      {encounter.dataRecoveryJob.title}
                    </h3>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                      {encounter.device.brand} {encounter.device.model} ({encounter.device.storage}) cihazındaki kritik dosyalar kurtarılmayı bekliyor.
                    </p>

                    <div className="space-y-2.5 text-xs tabular-nums">
                      <div className="rounded-xl border border-sky-500/30 bg-[#121C26] p-3.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sky-300">
                            1. Yazılım Kurtarma (Hızlı & Ucuz)
                          </span>
                          <span className="font-mono text-amber-300 font-bold">
                            %{Math.round(encounter.dataRecoveryJob.softwareSuccessRate * 100)} Başarı
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Maliyet: {formatTRY(encounter.dataRecoveryJob.softwareCost)}</span>
                          <span className="text-emerald-400 font-mono font-semibold">
                            Ödeme: +{formatTRY(encounter.dataRecoveryJob.softwarePayout)}
                          </span>
                        </div>
                      </div>

                      <div className="rounded-xl border border-emerald-500/30 bg-[#11211E] p-3.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-emerald-300">
                            2. Temiz Oda Mikro-Kurtarma
                          </span>
                          <span className="font-mono text-emerald-400 font-bold">
                            %100 Garanti
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Maliyet: {formatTRY(encounter.dataRecoveryJob.cleanRoomCost)}</span>
                          <span className="text-emerald-400 font-mono font-semibold">
                            Ödeme: +{formatTRY(encounter.dataRecoveryJob.cleanRoomPayout)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-sky-500/25 bg-sky-500/8 p-3 text-xs text-sky-200 leading-relaxed">
                    Temiz Oda çözümü asla veri kaybetmez, yüksek net servis kârı ve ekstra itibar kazandırır!
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 flex-1">
                  {/* TRADE-IN COMPARISON BANNER */}
                  {encounter.type === 'TRADE_IN' && encounter.tradeInDevice && (
                    <div className="rounded-xl border border-sky-400/30 bg-sky-500/10 px-3.5 py-2.5 text-xs tabular-nums">
                      <div className="flex items-center gap-1.5 font-bold text-sky-300 mb-1">
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                        <span>TAKAS (TRADE-IN) İŞLEMİ</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-slate-200">
                        <span className="truncate">
                          Vitrinin: <strong>{encounter.device.brand} {encounter.device.model}</strong>
                        </span>
                        <span className="font-mono font-bold text-amber-300 shrink-0">
                          Etiket {formatTRY(encounter.device.askingPrice)}
                        </span>
                      </div>
                      <div className="text-[11px] text-sky-200/85 mt-1">
                        Aşağıda müşterinin getirdiği takas cihazını ekspertiz et; kusur yakalarsan vereceği nakit fark artar!
                      </div>
                    </div>
                  )}

                  {/* EXPANDABLE PROFESSIONAL DEVICE CARD ON DESK */}
                  <DeviceDeskCard
                    device={inspectedTarget}
                    encounterType={encounter.type === 'TRADE_IN' ? 'SELLER' : encounter.type}
                    dailyNews={dailyNews}
                    expanded={deviceCardExpanded}
                    onToggleExpand={() => setDeviceCardExpanded((v) => !v)}
                  />

                  {(encounter.type === 'SELLER' ||
                    (encounter.type === 'TRADE_IN' && encounter.tradeInDevice)) && (
                    <div className="flex flex-col gap-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-300">
                          {encounter.type === 'TRADE_IN'
                            ? 'Takas Cihazı Ekspertizi (Kusur Bul → Farkı Artır)'
                            : 'Ekspertiz Testleri (Büyüteçle Tara)'}
                        </span>
                        {hasProDiag && !allChecked && encounter.outcome === 'ACTIVE' && (
                          <button
                            type="button"
                            onClick={onInspectAll}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 cursor-pointer whitespace-nowrap"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>Tümünü Tara</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {testButtons.map((tb) => {
                          const checked = inspectedTarget.inspected[tb.key];
                          const categoryHasDefect =
                            checked &&
                            inspectedTarget.defects.some(
                              (d) => DEFECT_CATALOG[d].category === tb.key
                            );
                          return (
                            <button
                              key={tb.key}
                              type="button"
                              disabled={checked || encounter.outcome !== 'ACTIVE'}
                              onClick={() => onInspect(tb.key)}
                              className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all duration-150 whitespace-nowrap ${
                                !checked
                                  ? 'border-white/12 bg-[#1E2937] text-slate-100 hover:border-amber-400/50 hover:bg-[#253345] cursor-pointer'
                                  : categoryHasDefect
                                  ? 'border-rose-500/40 bg-rose-500/10 text-rose-200 cursor-default'
                                  : 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200 cursor-default'
                              }`}
                            >
                              <span className="inline-flex items-center gap-1.5">
                                {tb.icon}
                                <span>{tb.label}</span>
                              </span>
                              {checked ? (
                                categoryHasDefect ? (
                                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                )
                              ) : (
                                <span className="text-[11px] text-amber-400">Tara</span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-1 space-y-2">
                        {discoveredDefects.length > 0 ? (
                          discoveredDefects.map((defectId) => {
                            const def = DEFECT_CATALOG[defectId];
                            const used = encounter.usedLeverageDefects.includes(defectId);
                            const estRepair = getRepairCost(
                              defectId,
                              upgrades,
                              dailyNews,
                              false,
                              shopLevel,
                              legacyPath
                            );
                            return (
                              <div
                                key={defectId}
                                className="flex items-center justify-between gap-2 rounded-xl border border-rose-500/25 bg-[#1B212C] px-3 py-2"
                              >
                                <div className="min-w-0">
                                  <div className="text-xs font-semibold text-rose-200 truncate">
                                    {def.name}
                                  </div>
                                  <div className="text-[11px] text-slate-400 tabular-nums">
                                    {def.repairable
                                      ? hasProDiag
                                        ? `Parça: ${formatTRY(estRepair)}`
                                        : 'Atölyede tamir edilebilir'
                                      : 'Tamir edilemez (Kalıcı değer kaybı)'}
                                  </div>
                                </div>

                                {encounter.outcome === 'ACTIVE' && (
                                  <button
                                    type="button"
                                    disabled={used}
                                    onClick={() => onUseLeverage(defectId)}
                                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                                      used
                                        ? 'bg-white/5 text-slate-500 cursor-default'
                                        : 'bg-amber-500 text-slate-950 hover:bg-amber-400 cursor-pointer'
                                    }`}
                                  >
                                    <Gavel className="w-3.5 h-3.5" />
                                    <span>{used ? 'Kullanıldı' : 'Koz Kullan'}</span>
                                  </button>
                                )}
                              </div>
                            );
                          })
                        ) : allChecked ? (
                          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/8 px-3 py-2.5 text-xs text-emerald-200">
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Tüm testler temiz! Cihaz kusursuz çıktı.</span>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400">
                            {encounter.type === 'TRADE_IN'
                              ? 'Takas cihazını tarayıp gizli kusurları yakalarsan müşteriden daha fazla nakit fark alırsın.'
                              : 'Testleri çalıştırarak büyüteçle gizli kusurları yakala ve pazarlıkta fiyat kır.'}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CROSS-SELL ACCESSORY UPSELL PANEL FOR PHONE BUYERS */}
                  {encounter.type === 'BUYER' && encounter.outcome === 'ACTIVE' && (
                    <div className="rounded-xl border border-emerald-500/25 bg-[#121B22] p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-300">
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Yanında Aksesuar Öner (Ek Kâr!)</span>
                        </span>
                        {encounter.crossSellAttached && (
                          <span className="font-mono text-[11px] font-bold text-emerald-400 tabular-nums">
                            +{formatTRY(encounter.crossSellAttached.retailPrice)} eklendi!
                          </span>
                        )}
                      </div>

                      {encounter.crossSellAttached ? (
                        <div className="text-xs text-emerald-200">
                          Müşteri telefonun yanına{' '}
                          <strong>{encounter.crossSellAttached.name}</strong> de ekledi (Net +
                          {formatTRY(encounter.crossSellAttached.profit)} ekstra kâr)!
                        </div>
                      ) : encounter.crossSellAttempted ? (
                        <div className="text-xs text-slate-400">
                          Müşteri bu sefer sadece telefonu almak istedi.
                        </div>
                      ) : stockedCrossSellOptions.length > 0 ? (
                        <div className="grid grid-cols-1 gap-1.5">
                          {stockedCrossSellOptions.map((spec) => {
                            const st = accessories[spec.id];
                            return (
                              <button
                                key={spec.id}
                                type="button"
                                onClick={() => onPitchCrossSell(spec.id)}
                                className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-[#182430] px-2.5 py-2 text-left text-xs hover:border-emerald-400/50 hover:bg-[#1E2E3D] transition-colors cursor-pointer tabular-nums"
                              >
                                <span className="text-slate-100 font-medium truncate">
                                  {spec.name}{' '}
                                  <span className="text-slate-400">({st.quantity} ad.)</span>
                                </span>
                                <span className="font-mono font-bold text-emerald-400 shrink-0">
                                  +{formatTRY(st.retailPrice)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400">
                          Aksesuar stoğun boş. Toptancı sekmesinden kılıf & kırılmaz cam alarak her telefon satışından ek kâr elde et!
                        </div>
                      )}
                    </div>
                  )}

                  {encounter.type === 'EXPRESS_REPAIR' && encounter.expressDefectId && (
                    <div className="space-y-2 border-t border-white/8 pt-3 text-xs tabular-nums">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Arıza Kaydı</span>
                        <span className="font-semibold text-rose-300">
                          {DEFECT_CATALOG[encounter.expressDefectId].name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Parça Maliyeti</span>
                        <span className="font-mono text-slate-200">
                          {formatTRY(encounter.expressPartCost ?? 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Müşteri Ödemesi</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {formatTRY(encounter.customerPrice)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* COLUMN 3: NEGOTIATION OR SPECIAL EVENT ACTION PANEL (4 cols) */}
            <section className="lg:col-span-4 flex flex-col justify-between min-h-0 rounded-2xl border border-white/10 bg-[#161E29]/92 p-5 overflow-y-auto pasaj-scroll">
              <div>
                <div className="flex items-baseline justify-between border-b border-white/8 pb-4 mb-4 tabular-nums">
                  <div>
                    <div className="text-xs text-slate-400">
                      {encounter.type === 'SELLER'
                        ? 'Satıcının İstediği Fiyat'
                        : encounter.type === 'BUYER'
                        ? 'Alıcının Mevcut Teklifi'
                        : encounter.type === 'TRADE_IN'
                        ? 'Üstüne Ödeyeceği Nakit Fark'
                        : encounter.type === 'WARRANTY_CLAIM'
                        ? 'Ücretsiz Onarım Maliyeti'
                        : encounter.type === 'DATA_RECOVERY'
                        ? 'Temiz Oda Servis Ödemesi'
                        : encounter.type === 'EXPRESS_REPAIR'
                        ? 'Acil Servis Ücreti'
                        : encounter.type === 'ACCESSORY_BUYER'
                        ? 'Aksesuar Sepeti Tutarı'
                        : 'Kapalı Koli İhale Bedeli'}
                    </div>
                    <motion.div
                      key={encounter.customerPrice}
                      initial={{ scale: 1.07 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.16 }}
                      className="font-mono text-3xl font-extrabold text-slate-50 mt-1"
                    >
                      {formatTRY(encounter.customerPrice)}
                    </motion.div>
                  </div>
                  {encounter.type === 'BUYER' || encounter.type === 'TRADE_IN' ? (
                    <div className="text-right">
                      <div className="text-[11px] text-slate-500">Senin Etiketin</div>
                      <div className="font-mono text-xs font-bold text-amber-400">
                        {formatTRY(encounter.device.askingPrice)}
                      </div>
                    </div>
                  ) : encounter.customerPrice !== encounter.initialCustomerPrice ? (
                    <div className="text-right">
                      <div className="text-[11px] text-slate-500">İlk Fiyat</div>
                      <div className="font-mono text-xs text-slate-400 line-through">
                        {formatTRY(encounter.initialCustomerPrice)}
                      </div>
                    </div>
                  ) : null}
                </div>

                {encounter.outcome === 'ACTIVE' ? (
                  <>
                    {isNegotiable && (
                      <>
                        <div className="mb-3.5 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-300">
                              Esnaf & Miras Hamleleri
                            </span>
                            <div className="flex items-center gap-2 tabular-nums">
                              {encounter.finalWarningGiven && (
                                <span className="font-mono text-[10.5px] font-bold text-rose-400">
                                  SON SÖZ!
                                </span>
                              )}
                              {encounter.rounds > 0 && (
                                <span className="font-mono text-[11px] text-slate-400">
                                  Tur {encounter.rounds + 1}
                                </span>
                              )}
                              {nextStreakBonus > 0 && (
                                <span className="font-mono text-[11px] text-orange-300">
                                  +{formatTRY(nextStreakBonus)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              disabled={encounter.teaServed}
                              onClick={onServeTea}
                              className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-150 whitespace-nowrap ${
                                encounter.teaServed
                                  ? 'border-white/8 bg-white/5 text-slate-500 cursor-default'
                                  : 'border-amber-500/30 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20 cursor-pointer'
                              }`}
                            >
                              <Coffee className="w-3.5 h-3.5 shrink-0" />
                              <span>
                                {encounter.teaServed
                                  ? 'Çay İçildi'
                                  : hasSamovar
                                  ? 'Semaver Çayı'
                                  : 'Çay İkram Et'}
                              </span>
                            </button>

                            <button
                              type="button"
                              disabled={encounter.bluffUsed}
                              onClick={onBluffOrPitch}
                              className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-150 whitespace-nowrap ${
                                encounter.bluffUsed
                                  ? 'border-white/8 bg-white/5 text-slate-500 cursor-default'
                                  : 'border-white/15 bg-[#1F2A38] text-slate-100 hover:bg-[#283648] cursor-pointer'
                              }`}
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>
                                {encounter.bluffUsed
                                  ? 'Kullanıldı'
                                  : encounter.type === 'SELLER'
                                  ? 'Piyasa Blöfü'
                                  : 'Garanti Sun'}
                              </span>
                            </button>
                          </div>

                          {/* 23-YEAR LEGACY EXCLUSIVE DIALOGUE ACTION */}
                          <button
                            type="button"
                            disabled={encounter.legacyDialogueUsed}
                            onClick={onUseLegacyDialogue}
                            className={`w-full flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-150 ${
                              encounter.legacyDialogueUsed
                                ? 'border-white/8 bg-white/5 text-slate-500 cursor-default'
                                : legacyInfo.accentColor === 'amber'
                                ? 'border-amber-400/40 bg-amber-500/12 text-amber-100 hover:bg-amber-500/20 cursor-pointer'
                                : legacyInfo.accentColor === 'emerald'
                                ? 'border-emerald-400/40 bg-emerald-500/12 text-emerald-100 hover:bg-emerald-500/20 cursor-pointer'
                                : 'border-sky-400/40 bg-sky-500/12 text-sky-100 hover:bg-sky-500/20 cursor-pointer'
                            }`}
                          >
                            <span className="inline-flex items-center gap-1.5 min-w-0 truncate">
                              <Award className="w-3.5 h-3.5 shrink-0 text-amber-300" />
                              <span className="truncate">
                                {encounter.legacyDialogueUsed
                                  ? `${legacyInfo.name} Diyaloğu Kullanıldı`
                                  : `${legacyInfo.name}: ${legacyInfo.dialogueName}`}
                              </span>
                            </span>
                            {!encounter.legacyDialogueUsed && (
                              <span className="font-mono text-[10px] font-bold text-amber-300 shrink-0">
                                MİRAS
                              </span>
                            )}
                          </button>

                          {/* POS CREDIT CARD INSTALLMENT BUTTON FOR BUYER / TRADE-IN */}
                          {(encounter.type === 'BUYER' || encounter.type === 'TRADE_IN') &&
                            encounter.wantsInstallment && (
                              <button
                                type="button"
                                disabled={encounter.posAccepted}
                                onClick={onAcceptPosInstallment}
                                className={`w-full flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-150 ${
                                  encounter.posAccepted
                                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 cursor-default'
                                    : 'border-sky-400/45 bg-sky-500/12 text-sky-100 hover:bg-sky-500/20 cursor-pointer'
                                }`}
                              >
                                <span className="inline-flex items-center gap-1.5 min-w-0 truncate">
                                  <CreditCard className="w-3.5 h-3.5 shrink-0 text-sky-300" />
                                  <span className="truncate">
                                    {encounter.posAccepted
                                      ? 'POS Taksit Onaylı (%5 Komisyon)'
                                      : 'POS Taksit Kabul Et (+%7 Teklif)'}
                                  </span>
                                </span>
                                <span className="font-mono text-[10px] font-bold text-sky-300 shrink-0">
                                  {encounter.posAccepted ? 'AKTİF' : '-%5 KOM.'}
                                </span>
                              </button>
                            )}
                        </div>

                        {/* NEGOTIATION TONE (ÜSLUP) SELECTOR */}
                        <div className="mb-3.5">
                          <div className="flex items-center justify-between text-[11px] mb-1.5">
                            <span className="font-semibold text-slate-300">
                              Müzakere Üslubun
                            </span>
                            <span className="text-slate-400">
                              {NEGOTIATION_TONES[selectedTone].shortHint}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            {(['friendly', 'analytical', 'firm'] as NegotiationTone[]).map(
                              (toneKey) => {
                                const t = NEGOTIATION_TONES[toneKey];
                                const active = selectedTone === toneKey;
                                return (
                                  <button
                                    key={toneKey}
                                    type="button"
                                    onClick={() => {
                                      soundFX.playClick();
                                      setSelectedTone(toneKey);
                                    }}
                                    className={`rounded-lg border py-1.5 px-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                                      active
                                        ? toneKey === 'friendly'
                                          ? 'border-emerald-400/60 bg-emerald-500/18 text-emerald-200'
                                          : toneKey === 'analytical'
                                          ? 'border-sky-400/60 bg-sky-500/18 text-sky-200'
                                          : 'border-rose-400/60 bg-rose-500/18 text-rose-200'
                                        : 'border-white/10 bg-[#121822] text-slate-400 hover:text-slate-200'
                                    }`}
                                  >
                                    {t.label}
                                  </button>
                                );
                              }
                            )}
                          </div>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-[#121822] p-4 mb-4">
                          <div className="flex items-baseline justify-between mb-2.5 tabular-nums">
                            <span className="text-xs font-medium text-slate-400">
                              {encounter.type === 'SELLER'
                                ? 'Senin Alış Teklifin'
                                : encounter.type === 'TRADE_IN'
                                ? 'İstediğin Nakit Fark'
                                : buyerDiscountFromSticker > 0
                                ? `İndirimli Satış Fiyatın (-${formatTRY(buyerDiscountFromSticker)})`
                                : 'Etiket Fiyatında Sabitsin'}
                            </span>
                            <span className="font-mono text-2xl font-bold text-amber-400">
                              {formatTRY(offerPrice)}
                            </span>
                          </div>

                          {sliderBounds.max > sliderBounds.min ? (
                            <input
                              type="range"
                              min={sliderBounds.min}
                              max={sliderBounds.max}
                              step={sliderBounds.step}
                              value={Math.min(
                                sliderBounds.max,
                                Math.max(sliderBounds.min, offerPrice)
                              )}
                              onChange={(e) => setOfferPrice(Number(e.target.value))}
                              aria-label="Teklif fiyatı"
                              className="pasaj-slider w-full mb-3"
                            />
                          ) : (
                            <div className="text-xs text-emerald-300 mb-3">
                              Alıcı zaten senin etiket fiyatını ({formatTRY(encounter.customerPrice)}) kabul ediyor!
                            </div>
                          )}

                          {/* Esnaf Tension & Opportunity Meter */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="text-slate-500">Esnaf His İbresi</span>
                              <span
                                className={`font-semibold ${
                                  offerTension.tone === 'danger'
                                    ? 'text-rose-400'
                                    : offerTension.tone === 'warning'
                                    ? 'text-amber-400'
                                    : offerTension.tone === 'positive'
                                    ? 'text-emerald-400'
                                    : 'text-sky-300'
                                }`}
                              >
                                {offerTension.label}
                              </span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-white/8 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-150 ${
                                  offerTension.tone === 'danger'
                                    ? 'bg-rose-500'
                                    : offerTension.tone === 'warning'
                                    ? 'bg-amber-400'
                                    : offerTension.tone === 'positive'
                                    ? 'bg-emerald-400'
                                    : 'bg-sky-400'
                                }`}
                                style={{ width: `${offerTension.fill}%` }}
                              />
                            </div>
                          </div>

                          {encounter.type === 'SELLER' ? (
                            <div className="grid grid-cols-4 gap-1.5 tabular-nums">
                              {[-1000, -250, 250, 1000].map((delta) => (
                                <button
                                  key={delta}
                                  type="button"
                                  onClick={() => adjustOffer(delta)}
                                  className="rounded-lg border border-white/10 bg-[#1B2432] py-1.5 text-xs font-mono font-semibold text-slate-200 hover:bg-[#253244] transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  {delta > 0 ? `+${delta}` : delta}
                                </button>
                              ))}
                            </div>
                          ) : (
                            /* BUYER Quick Discount Controls — Only downwards from Sticker Price! */
                            <div className="grid grid-cols-4 gap-1.5 tabular-nums">
                              <button
                                type="button"
                                onClick={() => adjustOffer(-1000)}
                                className="rounded-lg border border-white/10 bg-[#1B2432] py-1.5 text-xs font-mono font-semibold text-slate-200 hover:bg-[#253244] transition-colors cursor-pointer whitespace-nowrap"
                              >
                                -1000
                              </button>
                              <button
                                type="button"
                                onClick={() => adjustOffer(-500)}
                                className="rounded-lg border border-white/10 bg-[#1B2432] py-1.5 text-xs font-mono font-semibold text-slate-200 hover:bg-[#253244] transition-colors cursor-pointer whitespace-nowrap"
                              >
                                -500
                              </button>
                              <button
                                type="button"
                                onClick={() => adjustOffer(-250)}
                                className="rounded-lg border border-white/10 bg-[#1B2432] py-1.5 text-xs font-mono font-semibold text-slate-200 hover:bg-[#253244] transition-colors cursor-pointer whitespace-nowrap"
                              >
                                -250
                              </button>
                              <button
                                type="button"
                                onClick={() => setOfferPrice(sliderBounds.max)}
                                className="rounded-lg border border-amber-500/30 bg-amber-500/10 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors cursor-pointer whitespace-nowrap"
                              >
                                Etiket
                              </button>
                            </div>
                          )}

                          <div className="mt-3 pt-2.5 border-t border-white/8 flex items-center justify-between text-xs tabular-nums">
                            {encounter.type === 'SELLER' ? (
                              <>
                                <span className="text-slate-400">Tahmini Piyasa Farkı</span>
                                <span
                                  className={`font-mono font-semibold ${
                                    estimatedMarketValue - offerPrice >= 0
                                      ? 'text-emerald-400'
                                      : 'text-rose-400'
                                  }`}
                                >
                                  {estimatedMarketValue - offerPrice >= 0 ? '+' : ''}
                                  {formatTRY(estimatedMarketValue - offerPrice)}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="text-slate-400">
                                  {encounter.type === 'TRADE_IN'
                                    ? 'Takas + Fark Tahmini Kâr'
                                    : 'Bu Fiyatta Net Kâr'}
                                  {encounter.crossSellAttached ? ' (+Aksesuar)' : ''}
                                  {encounter.posAccepted ? ' (-%5 POS)' : ''}
                                </span>
                                {(() => {
                                  const posCut = encounter.posAccepted
                                    ? Math.round(offerPrice * 0.05)
                                    : 0;
                                  const netVal =
                                    projectedBuyerProfit +
                                    (encounter.crossSellAttached?.profit ?? 0) -
                                    posCut;
                                  return (
                                    <span
                                      className={`font-mono font-semibold ${
                                        netVal >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                      }`}
                                    >
                                      {netVal >= 0 ? '+' : ''}
                                      {formatTRY(netVal)}
                                    </span>
                                  );
                                })()}
                              </>
                            )}
                          </div>
                        </div>

                        {!canAffordOffer && (
                          <p className="text-xs text-rose-400 mb-3 tabular-nums">
                            Kasa yetersiz (Mevcut: {formatTRY(cash)}). Teklifi düşür veya stok sat.
                          </p>
                        )}
                      </>
                    )}

                    {encounter.type === 'ACCESSORY_BUYER' && encounter.accessoryOrder && (
                      <div className="rounded-xl border border-white/10 bg-[#121822] p-4 space-y-2.5 text-xs text-slate-300 tabular-nums">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Sepet Toplamı</span>
                          <span className="font-mono font-bold text-slate-100">
                            {formatTRY(encounter.customerPrice)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Tahmini Net Kâr</span>
                          <span className="font-mono font-bold text-emerald-400">
                            +
                            {formatTRY(
                              encounter.accessoryOrder.reduce(
                                (sum, l) =>
                                  sum +
                                  l.quantity *
                                    (l.unitPrice - getAccessorySpec(l.id).wholesaleCost),
                                0
                              )
                            )}
                          </span>
                        </div>
                        <p className="text-slate-400 leading-relaxed">
                          Pazarlıksız peşin reyon satışı! Hemen kasadan geçirip hem nakit hem itibar kazan.
                        </p>
                      </div>
                    )}

                    {encounter.type === 'EXPRESS_REPAIR' && (
                      <div className="rounded-xl border border-white/10 bg-[#121822] p-4 space-y-2.5 text-xs text-slate-300 tabular-nums">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Tahmini Net İşçilik Kârı</span>
                          <span className="font-mono font-bold text-emerald-400">
                            +{formatTRY(encounter.customerPrice - (encounter.expressPartCost ?? 0))}
                          </span>
                        </div>
                        <p className="text-slate-400 leading-relaxed">
                          5 aşamalı mikro cerrahi tamir masasında kendin özenle yaparsan{' '}
                          <strong className="text-amber-300">+1.000 ₺ Usta İşi bahşişi</strong>{' '}
                          ve +55 XP kazanırsın!
                        </p>
                      </div>
                    )}

                    {encounter.type === 'BULK_AUCTION' && (
                      <div className="rounded-xl border border-white/10 bg-[#121822] p-4 space-y-2 text-xs text-slate-300 leading-relaxed">
                        <p>
                          İki cihazı test etmeden tek seferde satın alırsın. Kusurlu da çıkabilirler, temiz büyük kâr da bırakabilirler!
                        </p>
                        {cash < encounter.customerPrice && (
                          <p className="text-rose-400 tabular-nums">
                            Kasa yetersiz (Mevcut: {formatTRY(cash)}).
                          </p>
                        )}
                      </div>
                    )}
                    {encounter.type === 'WARRANTY_CLAIM' && (
                      <div className="rounded-xl border border-rose-500/25 bg-[#121822] p-4 space-y-2 text-xs text-slate-300 leading-relaxed">
                        <p>
                          Ücretsiz onarım yaparsan müşterinin gönlünü kazanır ve{' '}
                          <strong className="text-emerald-400">+0.25★ itibar</strong> alırsın. Reddedersen pasajda adın çıkar!
                        </p>
                      </div>
                    )}

                    {encounter.type === 'DATA_RECOVERY' && encounter.dataRecoveryJob && (
                      <div className="rounded-xl border border-sky-500/25 bg-[#121822] p-4 space-y-2 text-xs text-slate-300 leading-relaxed tabular-nums">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Temiz Oda Net Kâr</span>
                          <span className="font-mono font-bold text-emerald-400">
                            +
                            {formatTRY(
                              encounter.dataRecoveryJob.cleanRoomPayout -
                                encounter.dataRecoveryJob.cleanRoomCost
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Yazılım Kurtarma Net Kâr</span>
                          <span className="font-mono font-bold text-amber-300">
                            +
                            {formatTRY(
                              encounter.dataRecoveryJob.softwarePayout -
                                encounter.dataRecoveryJob.softwareCost
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <motion.div
                    initial={{ scale: 0.92, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 360, damping: 24 }}
                    className="my-4 rounded-2xl border border-white/10 bg-[#121923] p-5 text-center"
                  >
                    <div
                      className={`inline-block rounded-lg border-2 px-4 py-1.5 font-display text-lg font-extrabold tracking-wide mb-3 animate-stamp-pop ${
                        encounter.outcome === 'DEAL_CLOSED'
                          ? 'border-emerald-400 text-emerald-400'
                          : 'border-rose-400 text-rose-400'
                      }`}
                    >
                      {encounter.outcome === 'DEAL_CLOSED'
                        ? encounter.type === 'EXPRESS_REPAIR'
                          ? 'ONARIM TESLİM EDİLDİ'
                          : encounter.type === 'BULK_AUCTION'
                          ? 'İHALE ALINDI'
                          : encounter.type === 'ACCESSORY_BUYER'
                          ? 'AKSESUAR SATILDI'
                          : encounter.type === 'TRADE_IN'
                          ? 'TAKAS TAMAMLANDI'
                          : encounter.type === 'WARRANTY_CLAIM'
                          ? 'GARANTİ ÇÖZÜLDÜ'
                          : encounter.type === 'DATA_RECOVERY'
                          ? 'VERİLER KURTARILDI'
                          : 'EL SIKIŞILDI'
                        : encounter.outcome === 'WALKED_OUT'
                        ? 'MÜŞTERİ KIZIP KALKTI'
                        : 'ANLAŞMA OLMADI'}
                    </div>

                    {encounter.outcome === 'DEAL_CLOSED' &&
                      encounter.finalPrice !== undefined && (
                        <div className="space-y-1.5 tabular-nums">
                          <div className="font-mono text-2xl font-extrabold text-slate-50">
                            {formatTRY(encounter.finalPrice)}
                          </div>
                          {encounter.type === 'SELLER' &&
                            encounter.initialCustomerPrice > encounter.finalPrice && (
                              <div className="font-mono text-xs font-bold text-emerald-400">
                                Pazarlıkla{' '}
                                {formatTRY(
                                  encounter.initialCustomerPrice - encounter.finalPrice
                                )}{' '}
                                fiyat kırdın!
                              </div>
                            )}
                          {encounter.crossSellAttached && (
                            <div className="font-mono text-xs font-bold text-emerald-400">
                              + {encounter.crossSellAttached.name} (
                              {formatTRY(encounter.crossSellAttached.retailPrice)}) eklendi!
                            </div>
                          )}
                          {encounter.streakBonus && encounter.streakBonus > 0 && (
                            <div className="inline-flex items-center gap-1 font-mono text-xs font-bold text-orange-300">
                              <Flame className="w-3.5 h-3.5 text-orange-400" />
                              <span>
                                Seri Bonusu: +{formatTRY(encounter.streakBonus)}
                              </span>
                            </div>
                          )}
                          <p className="text-xs text-slate-400">
                            {encounter.type === 'SELLER'
                              ? 'Cihaz atölyene eklendi. Tamir edip vitrine koyabilirsin.'
                              : encounter.type === 'TRADE_IN'
                              ? 'Vitrin cihazı satıldı, takas cihazı atölyene eklendi ve nakit fark kasaya işlendi!'
                              : encounter.type === 'WARRANTY_CLAIM'
                              ? 'Garanti dosyası kapatıldı ve müşteri kaydı güncellendi.'
                              : encounter.type === 'DATA_RECOVERY'
                              ? `Veri kurtarma tamamlandı! Net kâr: +${formatTRY(encounter.profitDelta ?? 0)}`
                              : encounter.type === 'BULK_AUCTION'
                              ? '2 gizemli cihaz atölyene taşındı! Hemen inceleyip hazırlayabilirsin.'
                              : encounter.type === 'ACCESSORY_BUYER'
                              ? `Aksesuar satışı kasaya işlendi! Net kâr: +${formatTRY(encounter.profitDelta ?? 0)}`
                              : encounter.type === 'EXPRESS_REPAIR'
                              ? `Acil servis tamamlandı! Net kazanç: +${formatTRY(encounter.profitDelta ?? 0)}`
                              : `Satış tamamlandı! Net kâr: ${
                                  (encounter.profitDelta ?? 0) >= 0 ? '+' : ''
                                }${formatTRY(encounter.profitDelta ?? 0)}`}
                          </p>
                        </div>
                      )}
                  </motion.div>
                )}
              </div>

              {/* Action Footer */}
              <div className="space-y-2.5 pt-2 shrink-0">
                {encounter.outcome === 'ACTIVE' ? (
                  encounter.type === 'WARRANTY_CLAIM' ? (
                    <div className="space-y-2">
                      <button
                        type="button"
                        disabled={cash < (encounter.warrantyRepairCost ?? 1000)}
                        onClick={() => onResolveWarranty('REPAIR')}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-xs font-extrabold text-slate-950 hover:bg-emerald-400 disabled:opacity-40 cursor-pointer whitespace-nowrap tabular-nums"
                      >
                        <HeartHandshake className="w-4 h-4" />
                        <span>
                          Ücretsiz Onar & Gönül Al (-{formatTRY(encounter.warrantyRepairCost ?? 1000)} · +0.25★)
                        </span>
                      </button>
                      <button
                        type="button"
                        disabled={cash < (encounter.warrantyRefundCost ?? 1500)}
                        onClick={() => onResolveWarranty('REFUND')}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/12 px-4 py-2.5 text-xs font-bold text-amber-200 hover:bg-amber-500/20 disabled:opacity-40 cursor-pointer whitespace-nowrap tabular-nums"
                      >
                        <RefreshCcw className="w-3.5 h-3.5" />
                        <span>
                          Kısmi İade Yap (-{formatTRY(encounter.warrantyRefundCost ?? 1500)} · +0.08★)
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onResolveWarranty('REJECT')}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/35 bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 cursor-pointer whitespace-nowrap"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Kullanıcı Hatası De & Reddet (-0.35★)</span>
                      </button>
                    </div>
                  ) : encounter.type === 'DATA_RECOVERY' && encounter.dataRecoveryJob ? (
                    <div className="space-y-2">
                      <button
                        type="button"
                        disabled={cash < encounter.dataRecoveryJob.cleanRoomCost}
                        onClick={() => onResolveDataRecovery('CLEAN_ROOM')}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-xs font-extrabold text-slate-950 hover:bg-emerald-400 disabled:opacity-40 cursor-pointer whitespace-nowrap tabular-nums"
                      >
                        <Database className="w-4 h-4" />
                        <span>
                          Temiz Oda (%100 · {formatTRY(encounter.dataRecoveryJob.cleanRoomCost)} → +{formatTRY(encounter.dataRecoveryJob.cleanRoomPayout)})
                        </span>
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={cash < encounter.dataRecoveryJob.softwareCost}
                          onClick={() => onResolveDataRecovery('SOFTWARE')}
                          className="rounded-xl border border-sky-500/40 bg-sky-500/12 px-3 py-2.5 text-xs font-bold text-sky-200 hover:bg-sky-500/20 disabled:opacity-40 cursor-pointer whitespace-nowrap tabular-nums"
                        >
                          Yazılım (%{Math.round(encounter.dataRecoveryJob.softwareSuccessRate * 100)})
                        </button>
                        <button
                          type="button"
                          onClick={onDismiss}
                          className="rounded-xl border border-white/10 bg-[#1D2735] px-3 py-2.5 text-xs font-semibold text-slate-300 hover:bg-[#263345] cursor-pointer whitespace-nowrap"
                        >
                          Pas Geç
                        </button>
                      </div>
                    </div>
                  ) : encounter.type === 'ACCESSORY_BUYER' ? (
                    <>
                      <button
                        type="button"
                        onClick={onCompleteAccessoryOrder}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3.5 text-sm font-extrabold text-slate-950 hover:bg-emerald-400 cursor-pointer whitespace-nowrap tabular-nums"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Paketle & Satışı Onayla (+{formatTRY(encounter.customerPrice)})</span>
                      </button>
                      <button
                        type="button"
                        onClick={onDismiss}
                        className="w-full rounded-xl border border-white/10 bg-[#1D2735] px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-[#263345] cursor-pointer whitespace-nowrap"
                      >
                        Şimdilik Pas Geç
                      </button>
                    </>
                  ) : encounter.type === 'EXPRESS_REPAIR' ? (
                    <>
                      <button
                        type="button"
                        disabled={cash < (encounter.expressPartCost ?? 0)}
                        onClick={onExpressRepairMini}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3.5 text-sm font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-40 cursor-pointer whitespace-nowrap"
                      >
                        <Wrench className="w-4 h-4" />
                        <span>Kendin Onar (Tamir Masası +1.000 ₺ Bahşiş)</span>
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={cash < (encounter.expressPartCost ?? 0)}
                          onClick={onExpressRepairQuick}
                          className="rounded-xl border border-emerald-500/35 bg-emerald-500/12 px-3 py-2.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-40 cursor-pointer whitespace-nowrap"
                        >
                          Hızlı Onar
                        </button>
                        <button
                          type="button"
                          onClick={onDismiss}
                          className="rounded-xl border border-white/10 bg-[#1D2735] px-3 py-2.5 text-xs font-semibold text-slate-300 hover:bg-[#263345] cursor-pointer whitespace-nowrap"
                        >
                          Vaktim Yok
                        </button>
                      </div>
                    </>
                  ) : encounter.type === 'BULK_AUCTION' ? (
                    <>
                      <button
                        type="button"
                        disabled={cash < encounter.customerPrice}
                        onClick={onAcceptBulkAuction}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3.5 text-sm font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-40 cursor-pointer whitespace-nowrap tabular-nums"
                      >
                        <Package className="w-4 h-4" />
                        <span>Koliyi Satın Al ({formatTRY(encounter.customerPrice)})</span>
                      </button>
                      <button
                        type="button"
                        onClick={onDismiss}
                        className="w-full rounded-xl border border-white/10 bg-[#1D2735] px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-[#263345] cursor-pointer whitespace-nowrap"
                      >
                        Riske Girmeyeyim, Pas Geç
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={!canAffordOffer}
                        onClick={triggerOfferSubmit}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3.5 text-sm font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99] transition-all duration-150 whitespace-nowrap cursor-pointer tabular-nums"
                      >
                        <Handshake className="w-4 h-4" />
                        <span>
                          {encounter.type === 'BUYER'
                            ? offerPrice >= encounter.device.askingPrice
                              ? `Etikette Sabit Kal (${formatTRY(offerPrice)})`
                              : `İndirimli Teklif Sun (${formatTRY(offerPrice)})`
                            : encounter.type === 'TRADE_IN'
                            ? `Nakit Fark İste (${formatTRY(offerPrice)})`
                            : `Teklif Ver · ${NEGOTIATION_TONES[selectedTone].label} (${formatTRY(offerPrice)})`}
                        </span>
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={!canAffordInstant}
                          onClick={onAcceptCurrentPrice}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/35 bg-emerald-500/12 px-3 py-2.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap cursor-pointer tabular-nums"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>
                            {encounter.type === 'BUYER'
                              ? `Teklifini Kabul Et (${formatTRY(encounter.customerPrice)})`
                              : encounter.type === 'TRADE_IN'
                              ? `Takası Onayla (+${formatTRY(encounter.customerPrice)})`
                              : `Kabul Et (${formatTRY(encounter.customerPrice)})`}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={onDismiss}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-[#1D2735] px-3 py-2.5 text-xs font-semibold text-slate-300 hover:bg-[#263345] hover:text-slate-100 transition-colors whitespace-nowrap cursor-pointer"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Kalsın, Sağ Ol</span>
                        </button>
                      </div>
                    </>
                  )
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={onNextCustomer}
                      className="w-full rounded-xl bg-amber-500 px-5 py-3.5 text-sm font-bold text-slate-950 hover:bg-amber-400 active:scale-[0.99] transition-all duration-150 whitespace-nowrap cursor-pointer"
                    >
                      {isLastCustomer
                        ? 'Günü Bitir & Raporu Gör (Space)'
                        : 'Sonraki Müşteri (Space)'}
                    </button>
                    {encounter.outcome === 'DEAL_CLOSED' &&
                      (encounter.type === 'SELLER' ||
                        encounter.type === 'TRADE_IN' ||
                        encounter.type === 'BULK_AUCTION') && (
                        <button
                          type="button"
                          onClick={onGoToWorkshop}
                          className="w-full rounded-xl border border-white/12 bg-[#1D2735] px-5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-[#263345] transition-colors whitespace-nowrap cursor-pointer"
                        >
                          Atölyeye Git & Cihazları Hazırla
                        </button>
                      )}
                  </div>
                )}
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
