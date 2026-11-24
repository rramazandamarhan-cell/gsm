import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowLeftRight,
  Award,
  BatteryCharging,
  Check,
  Coffee,
  Cpu,
  CreditCard,
  Database,
  DoorOpen,
  Flame,
  Gavel,
  Handshake,
  Newspaper,
  Package,
  Scale,
  ScanLine,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Target,
  UserCog,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import {
  ACCESSORY_CATALOG,
  DEFECT_CATALOG,
  LEGACY_PATHS,
} from '../game/catalog';
import {
  calculateDeviceValuationBreakdown,
  calculateMarketValue,
  formatTRY,
  getConditionInfo,
  getDiscoveredDefects,
  getMoodDisplay,
  getNegotiationResistance,
  getPatienceLabel,
  isAccessoryUnlocked,
  roundPrice,
} from '../game/engine';
import {
  getLocalizedAccessory,
  getLocalizedArchetype,
  getLocalizedCategoryLabel,
  getLocalizedDefect,
  getLocalizedNews,
  getLocalizedQuest,
  getLocalizedRoleText,
  getLocalizedTone,
  localizeDynamicLine,
  useLanguage,
} from '../game/i18n';
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
  NextCustomerEventEffect,
  OutfitId,
  PhoneDevice,
  RandomStoreEvent,
  ShopTier,
  StaffId,
  StaffRepairJob,
  UpgradeId,
} from '../game/types';
import { CustomerAvatar } from './CustomerAvatar';
import { PhoneInspectSVG, PhoneModelThumb } from './PhoneInspectSVG';
import { PhysicalInspectModal } from './PhysicalInspectModal';
import { ShopDecorLayer } from './ShopDecorLayer';
import { AccessoryProductArt } from './VisualShowcaseArt';

interface CounterViewProps {
  encounter: CustomerEncounter | null;
  day: number;
  cash: number;
  shopTier: ShopTier;
  shopLevel: number;
  legacyPath: LegacyPathId;
  dealStreak: number;
  upgrades: UpgradeId[];
  activeDecorations: DecorationId[];
  listedPhones: PhoneDevice[];
  showDay1Guide?: boolean;
  accessories: Record<AccessoryId, AccessoryStockItem>;
  dailyNews: DailyMarketEvent;
  dailyQuests: DailyQuest[];
  queue: CustomerEncounter[];
  queueIndex: number;
  queueTotal: number;
  activeStoreEvent: RandomStoreEvent | null;
  nextCustomerEventEffect: NextCustomerEventEffect | null;
  equippedOutfit: OutfitId;
  hiredStaff: StaffId[];
  staffLevels: Record<StaffId, number>;
  staffRepairQueue: StaffRepairJob[];
  textSpeed?: 'normal' | 'fast' | 'instant';
  onOpenNewspaper: () => void;
  onOpenMissions: () => void;
  onOpenWardrobe?: () => void;
  onDismissDay1Guide?: () => void;
  onUnlockAllTabsEarly?: () => void;
  onClaimDailyQuest: (questId: string) => void;
  onResolveStoreEventAction: () => void;
  onDismissStoreEvent: () => void;
  onPlaceOnDeskReaction: (line: string) => void;
  onInspect: (category: InspectionCategory, silentOverlay?: boolean) => void;
  onInspectAll: () => void;
  onPhysicalInspectBonus?: () => void;
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
  onDelegateExpressRepair: () => void;
  onAcceptBulkAuction: () => void;
  onResolveWarranty: (choice: 'REPAIR' | 'REFUND' | 'REJECT') => void;
  onResolveDataRecovery: (mode: 'SOFTWARE' | 'CLEAN_ROOM') => void;
  shakeTrigger: number;
}

const INSPECTION_ZONES: {
  id: InspectionCategory;
  icon: React.ReactNode;
}[] = [
  { id: 'screen', icon: <Smartphone className="w-3.5 h-3.5" /> },
  { id: 'battery', icon: <BatteryCharging className="w-3.5 h-3.5" /> },
  { id: 'imei', icon: <ScanLine className="w-3.5 h-3.5" /> },
  { id: 'hardware', icon: <Cpu className="w-3.5 h-3.5" /> },
];

const isEncounterOnDesk = (enc: CustomerEncounter | null): boolean => {
  if (!enc) return false;
  if (enc.outcome !== 'ACTIVE' || enc.rounds > 0) return true;
  if (enc.messages.some((m) => m.id.startsWith('desk_'))) return true;
  const target =
    enc.type === 'TRADE_IN' && enc.tradeInDevice ? enc.tradeInDevice : enc.device;
  return (
    target.inspected.screen ||
    target.inspected.battery ||
    target.inspected.imei ||
    target.inspected.hardware
  );
};

export const CounterView: React.FC<CounterViewProps> = ({
  encounter,
  day,
  cash,
  shopTier,
  shopLevel,
  legacyPath,
  dealStreak,
  upgrades,
  activeDecorations,
  listedPhones,
  accessories,
  dailyNews,
  dailyQuests,
  queue,
  queueIndex,
  queueTotal,
  activeStoreEvent,
  hiredStaff,
  onOpenNewspaper,
  onOpenMissions,
  onClaimDailyQuest,
  onResolveStoreEventAction,
  onDismissStoreEvent,
  onPlaceOnDeskReaction,
  onInspect,
  onInspectAll,
  onPhysicalInspectBonus,
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
  onDelegateExpressRepair,
  onAcceptBulkAuction,
  onResolveWarranty,
  onResolveDataRecovery,
  shakeTrigger,
}) => {
  const { lang, bi } = useLanguage();
  const [stage, setStage] = useState<'ARRIVED' | 'ON_DESK'>(() =>
    isEncounterOnDesk(encounter) ? 'ON_DESK' : 'ARRIVED'
  );
  const [offerPrice, setOfferPrice] = useState(0);
  const [tone, setTone] = useState<NegotiationTone>('friendly');
  const [portraitFailed, setPortraitFailed] = useState(false);
  const [showLoupeModal, setShowLoupeModal] = useState(false);
  const turnStartRef = useRef<number>(Date.now());
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const activeEventVisual = activeStoreEvent?.visualKind ?? null;
  const locNews = getLocalizedNews(dailyNews, lang);

  useEffect(() => {
    if (!encounter) return;
    const alreadyOnDesk = isEncounterOnDesk(encounter);
    setStage(alreadyOnDesk ? 'ON_DESK' : 'ARRIVED');
    setPortraitFailed(false);
    setShowLoupeModal(false);
    setTone('friendly');
    turnStartRef.current = Date.now();
    if (!alreadyOnDesk) {
      soundFX.playDoorBell();
    }

    if (encounter.type === 'SELLER') {
      setOfferPrice(roundPrice(encounter.customerPrice * 0.85));
    } else if (encounter.type === 'BUYER') {
      setOfferPrice(
        roundPrice(
          (encounter.customerPrice + encounter.device.askingPrice) / 2
        )
      );
    } else if (encounter.type === 'TRADE_IN') {
      setOfferPrice(roundPrice(encounter.customerPrice * 1.15));
    } else {
      setOfferPrice(encounter.customerPrice);
    }
  }, [encounter?.id]);

  useEffect(() => {
    if (!encounter) return;
    if (encounter.type === 'SELLER' && offerPrice > encounter.customerPrice) {
      setOfferPrice(encounter.customerPrice);
    }
    if (
      (encounter.type === 'BUYER' || encounter.type === 'TRADE_IN') &&
      offerPrice < encounter.customerPrice
    ) {
      setOfferPrice(encounter.customerPrice);
    }
  }, [encounter?.customerPrice]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [encounter?.messages.length, stage]);

  const sliderBounds = useMemo(() => {
    if (!encounter) return { min: 500, max: 10000, step: 250 };
    if (encounter.type === 'SELLER') {
      const min = roundPrice(Math.max(500, encounter.customerPrice * 0.45));
      const max = Math.max(min + 250, encounter.customerPrice);
      return { min, max, step: max > 20000 ? 500 : 250 };
    }
    if (encounter.type === 'TRADE_IN') {
      const min = encounter.customerPrice;
      const max = roundPrice(Math.max(min + 1000, encounter.customerPrice * 1.8));
      return { min, max, step: 250 };
    }
    const min = encounter.customerPrice;
    const max = Math.max(min + 250, encounter.device.askingPrice);
    return { min, max, step: max > 20000 ? 500 : 250 };
  }, [encounter]);

  // Level-gated cross-sell options — 0 accessories at Level 1
  const stockedCrossSellOptions = useMemo(
    () =>
      ACCESSORY_CATALOG.filter(
        (spec) =>
          isAccessoryUnlocked(spec.id, shopLevel) &&
          (accessories[spec.id]?.quantity ?? 0) > 0
      ),
    [accessories, shopLevel]
  );

  const readyQuest = dailyQuests.find((q) => !q.claimed && q.progress >= q.target);
  const activeQuestRaw =
    readyQuest ?? dailyQuests.find((q) => !q.claimed) ?? dailyQuests[0];
  const activeQuest = activeQuestRaw
    ? getLocalizedQuest(activeQuestRaw, lang)
    : null;

  if (!encounter) {
    return (
      <div className="relative flex-1 min-h-0 flex flex-col items-center justify-center p-4 text-center overflow-hidden">
        <ShopDecorLayer
          shopTier={shopTier}
          activeDecorations={activeDecorations}
          activeEventVisual={activeEventVisual}
          listedPhones={listedPhones}
        />
        <div className="relative z-10 rounded-2xl border border-white/12 bg-[#141C27]/95 p-5 max-w-md shadow-2xl">
          <h2 className="font-display text-lg font-extrabold text-slate-100">
            {bi('Bugünkü Müşteriler Tamamlandı', 'All Customers Served Today')}
          </h2>
          <p className="text-xs text-slate-300 mt-1.5 mb-4">
            {bi(
              'Kepenkleri indirmeden önce atölyeye uğrayıp cihazlarını tamir edip vitrine koyabilirsin.',
              'Before closing shutters, visit your workshop to repair and list phones on your showcase.'
            )}
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={onGoToWorkshop}
              className="rounded-xl border border-white/15 bg-[#1D2634] px-4 py-2 text-xs font-bold text-slate-200 hover:bg-[#273345] cursor-pointer whitespace-nowrap"
            >
              {bi('Atölyeye Göz At', 'Visit Workshop')}
            </button>
            <button
              type="button"
              onClick={onNextCustomer}
              className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-400 cursor-pointer whitespace-nowrap"
            >
              {bi('Günü Bitir & Rapor', 'End Day & Report')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const archetype = getLocalizedArchetype(encounter.archetypeId, lang);
  const patienceInfo = getPatienceLabel(encounter.patience);
  const moodInfo = getMoodDisplay(encounter.mood);
  const inspectedTarget =
    encounter.type === 'TRADE_IN' && encounter.tradeInDevice
      ? encounter.tradeInDevice
      : encounter.device;
  const discoveredDefects = getDiscoveredDefects(inspectedTarget);
  const condition = getConditionInfo(
    inspectedTarget,
    encounter.type === 'SELLER' || encounter.type === 'TRADE_IN'
  );
  const isNegotiable =
    encounter.type === 'SELLER' ||
    encounter.type === 'BUYER' ||
    encounter.type === 'TRADE_IN';

  const valuation = calculateDeviceValuationBreakdown(
    inspectedTarget,
    offerPrice,
    upgrades,
    dailyNews,
    shopLevel,
    legacyPath,
    true
  );
  const sellerAsIsVal = calculateMarketValue(
    inspectedTarget,
    true,
    dailyNews,
    upgrades,
    day
  );
  const resistance = isNegotiable
    ? getNegotiationResistance(encounter, offerPrice, tone)
    : null;

  const roleText = getLocalizedRoleText(encounter.type, lang, {
    isBrandNew: encounter.device.isBrandNew,
    isVip: encounter.archetypeId === 'vip',
  });

  const all4Inspected =
    inspectedTarget.inspected.screen &&
    inspectedTarget.inspected.battery &&
    inspectedTarget.inspected.imei &&
    inspectedTarget.inspected.hardware;

  const hasRepairBench = upgrades.includes('repair_bench');
  const hasSamovar = upgrades.includes('tea_samovar');
  const hasMasterTech = hiredStaff.includes('master_tech');
  const hasSmartPos = upgrades.includes('smart_pos_zero');
  const legacyInfo = LEGACY_PATHS[legacyPath];
  const teaCost = hasSamovar ? 0 : 120;

  const handlePlaceOnDesk = () => {
    soundFX.playClick();
    setStage('ON_DESK');
    turnStartRef.current = Date.now();
    onPlaceOnDeskReaction(
      bi(
        'Buyur bakalım, cihazı tezgaha aldım. Hemen inceleyelim.',
        'Alright, placed it on the counter — let’s inspect it!'
      )
    );
  };

  const handleOfferClick = () => {
    if (encounter.type === 'SELLER' && offerPrice > cash) return;
    const elapsedSec = (Date.now() - turnStartRef.current) / 1000;
    turnStartRef.current = Date.now();
    onSubmitOffer(offerPrice, tone, elapsedSec);
  };

  const adjustOffer = (delta: number) => {
    setOfferPrice((prev) =>
      Math.max(sliderBounds.min, Math.min(sliderBounds.max, prev + delta))
    );
  };

  const recentMessages = encounter.messages.slice(-6);

  const queueCode = (t: CustomerEncounter['type']) => {
    if (t === 'SELLER') return 'S';
    if (t === 'BUYER') return lang === 'en' ? 'B' : 'A';
    if (t === 'TRADE_IN') return 'T';
    if (t === 'EXPRESS_REPAIR') return 'R';
    if (t === 'ACCESSORY_BUYER') return 'K';
    return '★';
  };

  const moodMarkerLeft = Math.max(4, Math.min(96, Math.round(encounter.moodScore)));

  return (
    <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden bg-[#0F141B]">
      <ShopDecorLayer
        shopTier={shopTier}
        activeDecorations={activeDecorations}
        activeEventVisual={activeEventVisual}
        listedPhones={listedPhones}
      />

      {/* SLIM SINGLE-LINE TOP BAR: NEWS + QUEUE + ACTIVE QUEST */}
      <div className="relative z-10 shrink-0 flex items-center justify-between gap-2 border-b border-white/10 bg-[#131A24]/95 px-2.5 py-1 text-[10.5px]">
        <button
          type="button"
          onClick={onOpenNewspaper}
          className="inline-flex items-center gap-1.5 text-amber-200 hover:text-amber-100 min-w-0 cursor-pointer"
        >
          <Newspaper className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate font-semibold">{locNews.headline}</span>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          {dealStreak >= 2 && (
            <span className="inline-flex items-center gap-0.5 font-mono text-[10px] font-extrabold text-amber-300">
              <Flame className="w-3 h-3 text-amber-400" />
              {dealStreak}x
            </span>
          )}

          {/* Mini Queue Chips */}
          <div className="hidden sm:flex items-center gap-0.5">
            {queue.slice(0, 8).map((q, idx) => (
              <span
                key={q.id}
                className={`w-4 h-4 rounded text-[9px] font-mono font-extrabold flex items-center justify-center ${
                  idx < queueIndex
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : idx === queueIndex
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-white/8 text-slate-400'
                }`}
              >
                {queueCode(q.type)}
              </span>
            ))}
          </div>

          {activeQuest &&
            (readyQuest ? (
              <button
                type="button"
                onClick={() => onClaimDailyQuest(readyQuest.id)}
                className="inline-flex items-center gap-1 rounded-md bg-emerald-500 px-2 py-0.5 text-[10px] font-extrabold text-slate-950 hover:bg-emerald-400 cursor-pointer whitespace-nowrap"
              >
                <Target className="w-3 h-3" />
                {bi('Ödül Al', 'Claim')} +{formatTRY(readyQuest.reward)}
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenMissions}
                className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-[#1B2432] px-2 py-0.5 text-[10px] font-semibold text-slate-200 hover:bg-[#243042] cursor-pointer whitespace-nowrap"
              >
                <Target className="w-3 h-3 text-amber-400" />
                <span className="max-w-[120px] truncate">{activeQuest.title}</span>
                <span className="font-mono text-amber-300">
                  {activeQuest.progress}/{activeQuest.target}
                </span>
              </button>
            ))}
        </div>
      </div>

      {/* COMPACT LIVE STORE EVENT STRIP */}
      {activeStoreEvent && !activeStoreEvent.resolved && (
        <div className="relative z-20 shrink-0 flex items-center justify-between gap-2 border-b border-amber-400/35 bg-amber-500/15 px-3 py-1 text-[10.5px]">
          <div className="flex items-center gap-1.5 min-w-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <strong className="text-amber-200 shrink-0">
              {activeStoreEvent.title}:
            </strong>
            <span className="text-slate-100 truncate">
              {activeStoreEvent.description}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onResolveStoreEventAction}
              className="rounded-md bg-amber-500 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-950 hover:bg-amber-400 cursor-pointer whitespace-nowrap"
            >
              {activeStoreEvent.actionLabel}
            </button>
            <button
              type="button"
              onClick={onDismissStoreEvent}
              className="p-0.5 text-slate-300 hover:text-white cursor-pointer"
              aria-label={bi('Kapat', 'Close')}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* MAIN PLAYFIELD — ZERO VERTICAL SCROLL */}
      <AnimatePresence mode="wait">
        {stage === 'ARRIVED' ? (
          <motion.div
            key={`arrived_${encounter.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="relative z-10 flex-1 min-h-0 flex items-center justify-center p-2.5 overflow-hidden"
          >
            <div className="w-full max-w-3xl rounded-2xl border border-white/12 bg-[#141C27]/95 shadow-2xl overflow-hidden flex flex-col">
              <div className="border-b border-white/8 bg-[#101720] px-3 py-1.5 flex items-center justify-between text-[11px]">
                <span className="inline-flex items-center gap-1.5 text-amber-300 font-bold truncate">
                  <DoorOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  {bi(
                    'Kapı zili çaldı · Müşteri tezgaha geldi',
                    'Doorbell chimed · Customer approached counter'
                  )}
                </span>
                <span className="font-mono text-slate-400 tabular-nums shrink-0">
                  #{queueIndex + 1} / {queueTotal}
                </span>
              </div>

              <div className="p-3.5 flex items-center gap-4">
                <CustomerAvatar
                  name={encounter.customerName}
                  title={archetype.title}
                  portraitPath={encounter.portraitPath}
                  fallbackColor={archetype.fallbackColor}
                  mood={encounter.mood}
                  moodScore={encounter.moodScore}
                  isVip={encounter.archetypeId === 'vip'}
                  isAccessoryBuyer={encounter.type === 'ACCESSORY_BUYER'}
                  size="sm"
                  portraitFailed={portraitFailed}
                  onPortraitError={() => setPortraitFailed(true)}
                />

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-1.5 text-[10.5px]">
                    <span className="font-bold text-emerald-300">{roleText}</span>
                    <span className="text-white/25">·</span>
                    <span className="text-slate-400">{archetype.title}</span>
                    {encounter.isRegular && (
                      <span className="rounded bg-amber-500/20 px-1.5 py-0.2 font-bold text-amber-300">
                        {bi('Müdavim ★', 'Regular ★')}
                      </span>
                    )}
                  </div>

                  <h2 className="font-display text-base sm:text-lg font-extrabold text-slate-50 leading-tight">
                    {bi(
                      `${encounter.customerName} içeri girdi`,
                      `${encounter.customerName} walked in`
                    )}
                  </h2>

                  <div className="rounded-xl border border-amber-400/20 bg-[#1C2634] px-3 py-2 text-xs text-slate-100 leading-snug line-clamp-2">
                    “{localizeDynamicLine(encounter.messages[0]?.text ?? '', lang)}”
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-400 tabular-nums">
                    <span>
                      {bi('Konu', 'Item')}:{' '}
                      <strong className="text-slate-100">
                        {encounter.type === 'BULK_AUCTION'
                          ? bi('2’li Kapalı Toptancı Kolisi', '2-Unit Sealed Mystery Box')
                          : encounter.type === 'ACCESSORY_BUYER'
                          ? bi(
                              `${encounter.accessoryOrder?.length ?? 1} Çeşit Aksesuar`,
                              `${encounter.accessoryOrder?.length ?? 1} Accessory Item(s)`
                            )
                          : encounter.type === 'TRADE_IN' && encounter.tradeInDevice
                          ? `${encounter.tradeInDevice.model} ⇄ ${encounter.device.model}`
                          : `${encounter.device.brand} ${encounter.device.model} (${encounter.device.storage})`}
                      </strong>
                    </span>
                    <span>
                      {bi('İlk Fiyat', 'Opening')}:{' '}
                      <strong className="font-mono text-amber-400">
                        {formatTRY(encounter.customerPrice)}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Visual Preview of Incoming Phone / Accessory */}
                <div className="hidden sm:flex shrink-0 rounded-xl border border-white/10 bg-[#0E141D] p-2.5 items-center justify-center gap-1.5">
                  {encounter.type === 'ACCESSORY_BUYER' &&
                  encounter.accessoryOrder &&
                  encounter.accessoryOrder[0] ? (
                    <AccessoryProductArt
                      id={encounter.accessoryOrder[0].id}
                      className="w-16 h-16"
                    />
                  ) : encounter.type === 'BULK_AUCTION' &&
                    encounter.bundleDevices ? (
                    <div className="flex items-center -space-x-2">
                      {encounter.bundleDevices.slice(0, 2).map((d) => (
                        <PhoneModelThumb
                          key={d.uid}
                          device={d}
                          showBack
                          silhouette
                          className="w-11 h-16"
                        />
                      ))}
                    </div>
                  ) : encounter.type === 'TRADE_IN' && encounter.tradeInDevice ? (
                    <div className="flex items-center gap-1">
                      <PhoneModelThumb
                        device={encounter.tradeInDevice}
                        showBack
                        className="w-10 h-16"
                      />
                      <ArrowLeftRight className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <PhoneModelThumb
                        device={encounter.device}
                        showBack
                        className="w-10 h-16"
                      />
                    </div>
                  ) : (
                    <PhoneModelThumb
                      device={encounter.device}
                      showBack
                      className="w-14 h-24"
                    />
                  )}
                </div>
              </div>

              <div className="border-t border-white/10 bg-[#1B1713]/92 px-3.5 py-2 flex items-center justify-between gap-2">
                <span className="text-[11px] text-amber-200/85 truncate">
                  {bi(
                    'Cihazı tezgaha alıp incele ve pazarlığa başla.',
                    'Place the device on the counter to inspect and negotiate.'
                  )}
                </span>
                <button
                  type="button"
                  onClick={handlePlaceOnDesk}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-5 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-400 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  {bi('Tezgaha Al', 'Place on Counter')}
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* 3-COLUMN ZERO-SCROLL WORKBENCH */
          <motion.div
            key={`desk_${encounter.id}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16 }}
            className="relative z-10 flex-1 min-h-0 grid grid-cols-12 gap-2 p-2 overflow-hidden"
          >
            {/* COLUMN 1: CUSTOMER, MOOD/PATIENCE & CHAT (4 cols) */}
            <section className="col-span-4 flex flex-col min-h-0 h-full rounded-xl border border-white/10 bg-[#161E29]/95 p-2.5 gap-2 overflow-hidden">
              {/* Avatar + Name + Patience */}
              <div className="shrink-0 flex items-center gap-2.5 border-b border-white/8 pb-2">
                <CustomerAvatar
                  name={encounter.customerName}
                  title={archetype.title}
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
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-extrabold text-slate-50 truncate">
                      {encounter.customerName}
                    </span>
                    <span className="text-[10px] font-bold text-amber-300 shrink-0">
                      {roleText}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {archetype.title}
                  </div>
                  {/* Patience Mini Bar */}
                  <div className="mt-1 space-y-0.5">
                    <div className="flex justify-between text-[9.5px] tabular-nums">
                      <span className="text-slate-400">
                        {bi('Sabır', 'Patience')}
                      </span>
                      <span
                        className={`font-bold ${
                          patienceInfo.tone === 'positive'
                            ? 'text-emerald-300'
                            : patienceInfo.tone === 'warning'
                            ? 'text-amber-300'
                            : 'text-rose-300'
                        }`}
                      >
                        {patienceInfo.text} %{Math.round(encounter.patience)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          patienceInfo.tone === 'positive'
                            ? 'bg-emerald-400'
                            : patienceInfo.tone === 'warning'
                            ? 'bg-amber-400'
                            : 'bg-rose-500'
                        }`}
                        style={{
                          width: `${Math.max(0, Math.min(100, encounter.patience))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mood Visual Meter with Gradient Track */}
              <div className="shrink-0 rounded-lg border border-white/8 bg-[#0E141D] px-2.5 py-1.5 space-y-1">
                <div className="flex items-center justify-between gap-1.5 text-[10.5px]">
                  <span className="inline-flex items-center gap-1.5 font-bold text-slate-100">
                    <span className="text-sm leading-none">{moodInfo.emoji}</span>
                    <span>{moodInfo.simpleLabel}</span>
                    <span className="text-slate-400 font-normal hidden lg:inline">
                      · {moodInfo.label}
                    </span>
                  </span>
                  <span className="font-mono text-[10px] text-amber-300 font-bold tabular-nums">
                    {Math.round(encounter.moodScore)}/100
                  </span>
                </div>
                <div className="relative h-1.5 rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white border-2 border-[#0E141D] shadow"
                    style={{ left: `${moodMarkerLeft}%` }}
                  />
                </div>
              </div>

              {/* Chat Log (anchored cleanly top-down, scrollable inside card if needed) */}
              <div
                ref={chatScrollRef}
                className="flex-1 min-h-0 flex flex-col justify-start gap-1.5 overflow-y-auto pasaj-scroll pr-0.5"
              >
                {recentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-lg px-2.5 py-1.5 text-[11px] leading-snug ${
                      msg.speaker === 'player'
                        ? 'ml-4 bg-amber-500/14 border border-amber-400/25 text-amber-100'
                        : msg.tone === 'positive'
                        ? 'mr-2 bg-emerald-500/12 border border-emerald-400/25 text-emerald-100'
                        : msg.tone === 'danger'
                        ? 'mr-2 bg-rose-500/12 border border-rose-400/25 text-rose-100'
                        : 'mr-2 bg-[#1D2736] border border-white/8 text-slate-100'
                    }`}
                  >
                    {localizeDynamicLine(msg.text, lang)}
                  </div>
                ))}
              </div>

              {/* Archetype Trait Tip */}
              <div className="shrink-0 rounded-lg bg-[#0E141D] border border-white/6 px-2.5 py-1.5 text-[10px] text-slate-300 truncate">
                <strong className="text-amber-300">{bi('İpucu', 'Tip')}:</strong>{' '}
                {archetype.traitSummary}
              </div>
            </section>

            {/* COLUMN 2: INTERACTIVE PHONE MODEL VISUAL & INSPECTION MAT (4 cols) */}
            <section className="col-span-4 flex flex-col min-h-0 h-full rounded-xl border border-white/10 bg-[#161E29]/95 p-2.5 gap-2 overflow-hidden">
              {encounter.type === 'ACCESSORY_BUYER' && encounter.accessoryOrder ? (
                <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
                  <div className="shrink-0 flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-300">
                      <ShoppingBag className="w-4 h-4" />
                      {bi('Aksesuar Sepeti', 'Accessory Basket')}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {encounter.accessoryOrder.length} {bi('ürün', 'items')}
                    </span>
                  </div>
                  <div className="flex-1 min-h-0 grid grid-cols-1 gap-1.5 overflow-y-auto pasaj-scroll">
                    {encounter.accessoryOrder.map((line) => (
                      <div
                        key={line.id}
                        className="rounded-xl border border-white/10 bg-[#0E141D] px-3 py-2 flex items-center gap-3 tabular-nums"
                      >
                        <div className="w-12 h-12 rounded-lg bg-[#151F2C] border border-white/8 p-1.5 flex items-center justify-center shrink-0">
                          <AccessoryProductArt id={line.id} className="w-9 h-9" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-100 truncate">
                            {getLocalizedAccessory(line.id, lang).name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {line.quantity} × {formatTRY(line.unitPrice)}
                          </div>
                        </div>
                        <span className="font-mono text-xs text-amber-300 font-extrabold shrink-0">
                          {formatTRY(line.quantity * line.unitPrice)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="shrink-0 rounded-lg bg-[#0E141D] border border-white/6 px-2.5 py-1.5 text-[10px] text-slate-400 text-center">
                    {bi(
                      'Müşteri reyon etiketinden nakit almaya hazır.',
                      'Customer is ready to pay full shelf tag price.'
                    )}
                  </div>
                </div>
              ) : encounter.type === 'BULK_AUCTION' && encounter.bundleDevices ? (
                <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
                  <div className="shrink-0 inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-300">
                    <Package className="w-4 h-4" />
                    {bi('2’li Kapalı Toptancı Kolisi', '2-Unit Sealed Mystery Box')}
                  </div>
                  <div className="flex-1 min-h-0 grid grid-cols-2 gap-2 overflow-hidden">
                    {encounter.bundleDevices.map((d, idx) => (
                      <div
                        key={d.uid}
                        className="rounded-xl border border-amber-400/20 bg-[#0E141D] p-2.5 flex flex-col items-center justify-between text-center min-h-0"
                      >
                        <span className="font-mono text-[10px] font-bold text-amber-300">
                          #{idx + 1} · {bi('Kapalı', 'Sealed')}
                        </span>
                        <div className="flex-1 min-h-0 flex items-center justify-center py-1">
                          <PhoneModelThumb
                            device={d}
                            showBack
                            className="h-full max-h-28 w-auto"
                          />
                        </div>
                        <div className="w-full">
                          <div className="text-[11px] font-extrabold text-slate-100 truncate">
                            {d.brand} {d.model}
                          </div>
                          <div className="text-[9.5px] text-slate-400">
                            {d.storage}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="shrink-0 rounded-lg bg-[#0E141D] border border-white/6 px-2.5 py-1.5 text-[10px] text-slate-400 text-center">
                    {bi(
                      'Koli açılmadan alınır — içeride temiz cihaz da çıkabilir arızalı da!',
                      'Sold sight unseen — may contain clean gems or fixable defects!'
                    )}
                  </div>
                </div>
              ) : encounter.type === 'WARRANTY_CLAIM' && encounter.warrantyRecord ? (
                <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
                  <div className="shrink-0 flex items-center justify-between gap-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-rose-300">
                      <ShieldAlert className="w-4 h-4" />
                      {bi('Garanti & İade Talebi', 'Warranty Claim')}
                    </span>
                    <span className="font-mono text-xs font-extrabold text-amber-300">
                      {formatTRY(encounter.warrantyRecord.salePrice)}
                    </span>
                  </div>
                  <div className="flex-1 min-h-0">
                    <PhoneInspectSVG device={encounter.device} revealAll fluid />
                  </div>
                  <div className="shrink-0 rounded-lg border border-rose-400/25 bg-rose-500/10 px-2.5 py-1.5 text-[10px] text-slate-200 text-center">
                    {bi(
                      'Ücretsiz onarım itibar kazandırır; reddetmek puan düşürür.',
                      'Free repair boosts reputation; rejecting harms shop rating.'
                    )}
                  </div>
                </div>
              ) : encounter.type === 'DATA_RECOVERY' && encounter.dataRecoveryJob ? (
                <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
                  <div className="shrink-0 flex items-center justify-between gap-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-sky-300 truncate">
                      <Database className="w-4 h-4 shrink-0" />
                      <span className="truncate">{encounter.dataRecoveryJob.title}</span>
                    </span>
                    <span className="font-mono text-xs font-extrabold text-emerald-400 shrink-0">
                      +{formatTRY(encounter.customerPrice)}
                    </span>
                  </div>
                  <div className="flex-1 min-h-0">
                    <PhoneInspectSVG device={encounter.device} revealAll fluid />
                  </div>
                  <div className="shrink-0 rounded-lg border border-sky-400/25 bg-sky-500/10 px-2.5 py-1.5 text-[10px] text-slate-200 text-center">
                    {bi(
                      'Yazılım kurtarma ücretsiz ama risklidir; laboratuvar garantilidir.',
                      'Software recovery is free but risky; lab recovery guarantees success.'
                    )}
                  </div>
                </div>
              ) : (
                /* STANDARD DEVICE INSPECTION & LIVE PHONE MODEL VISUAL */
                <>
                  {/* Compact Device Tech Header */}
                  <div className="shrink-0 rounded-lg border border-white/10 bg-[#0E141D] px-2.5 py-1.5 space-y-1 tabular-nums">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-slate-50 truncate">
                          {inspectedTarget.brand} {inspectedTarget.model}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {inspectedTarget.storage} · {condition.label} ({condition.score})
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[9px] text-slate-400">
                          {bi('Tahmini Değer', 'Est. Value')}
                        </div>
                        <div className="font-mono text-xs font-extrabold text-amber-300">
                          {formatTRY(sellerAsIsVal)}
                        </div>
                      </div>
                    </div>

                    {encounter.type === 'TRADE_IN' && encounter.tradeInDevice && (
                      <div className="flex items-center gap-1 rounded bg-sky-500/15 border border-sky-400/25 px-1.5 py-0.5 text-[9.5px] font-bold text-sky-200 truncate">
                        <ArrowLeftRight className="w-3 h-3 shrink-0" />
                        {bi('İstediği', 'Wants')}: {encounter.device.brand}{' '}
                        {encounter.device.model}
                      </div>
                    )}
                  </div>

                  {/* LIVE INTERACTIVE SMARTPHONE VISUAL MODEL (FRONT / BACK + DEFECTS) */}
                  <div className="relative flex-1 min-h-[116px] overflow-hidden">
                    <PhoneInspectSVG
                      device={inspectedTarget}
                      revealAll={
                        encounter.type === 'BUYER' ||
                        encounter.type === 'EXPRESS_REPAIR'
                      }
                      fluid
                    />

                    {/* Floating Optical Loupe & Quick Scan Buttons right on the ESD Mat */}
                    {(encounter.type === 'SELLER' ||
                      (encounter.type === 'TRADE_IN' && encounter.tradeInDevice)) && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            soundFX.playClick();
                            setShowLoupeModal(true);
                          }}
                          className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-lg border border-amber-400/55 bg-[#1B160E]/92 px-2 py-1 text-[10px] font-extrabold text-amber-200 hover:bg-amber-500/25 cursor-pointer whitespace-nowrap shadow-md"
                          title={bi('Büyüteçle Fiziksel İncele', 'Optical Loupe Inspect')}
                        >
                          <Search className="w-3 h-3 text-amber-400" />
                          {bi('Büyüteç', 'Loupe')}
                        </button>
                        {!all4Inspected && (
                          <button
                            type="button"
                            onClick={onInspectAll}
                            className="absolute top-2 right-2 rounded-lg border border-white/15 bg-[#1B2534]/95 px-2 py-1 text-[10px] font-bold text-slate-200 hover:bg-[#27354A] cursor-pointer whitespace-nowrap shadow-md"
                          >
                            {bi('Hızlı Tara', 'Scan All')}
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {/* SELLER / TRADE-IN: 2x2 INSPECTION CONTROLS + LEVERAGE BAR */}
                  {(encounter.type === 'SELLER' ||
                    (encounter.type === 'TRADE_IN' && encounter.tradeInDevice)) && (
                    <div className="shrink-0 space-y-1.5">
                      <div className="grid grid-cols-2 gap-1.5">
                        {INSPECTION_ZONES.map((z) => {
                          const done = inspectedTarget.inspected[z.id];
                          const foundDefect = inspectedTarget.defects.find(
                            (d) => DEFECT_CATALOG[d].category === z.id
                          );
                          return (
                            <button
                              key={z.id}
                              type="button"
                              disabled={done}
                              onClick={() => onInspect(z.id)}
                              className={`rounded-lg border px-2 py-1 flex items-center justify-between gap-1 text-[10px] font-bold transition-colors ${
                                !done
                                  ? 'border-white/12 bg-[#1B2534] text-slate-100 hover:border-amber-400/50 cursor-pointer'
                                  : foundDefect
                                  ? 'border-rose-500/45 bg-rose-500/12 text-rose-200'
                                  : 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300'
                              }`}
                            >
                              <span className="inline-flex items-center gap-1 truncate">
                                {z.icon}
                                <span className="truncate">
                                  {getLocalizedCategoryLabel(z.id, lang)}
                                </span>
                              </span>
                              {done ? (
                                foundDefect ? (
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                )
                              ) : (
                                <span className="text-[9px] text-amber-300 shrink-0">
                                  {bi('Test', 'Scan')}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {discoveredDefects.length > 0 ? (
                        <div className="space-y-1">
                          {discoveredDefects.slice(0, 2).map((d) => {
                            const locDef = getLocalizedDefect(d, lang);
                            const used = encounter.usedLeverageDefects.includes(d);
                            return (
                              <div
                                key={d}
                                className="rounded-lg border border-rose-400/35 bg-rose-500/10 px-2 py-1 flex items-center justify-between gap-1.5"
                              >
                                <span className="text-[10px] font-bold text-rose-200 truncate">
                                  ⚠ {locDef.shortLabel}
                                </span>
                                <button
                                  type="button"
                                  disabled={used || encounter.outcome !== 'ACTIVE'}
                                  onClick={() => onUseLeverage(d)}
                                  className="rounded bg-rose-500 px-2 py-0.5 text-[9.5px] font-extrabold text-white hover:bg-rose-400 disabled:opacity-40 cursor-pointer whitespace-nowrap shrink-0"
                                >
                                  {used
                                    ? bi('Kullanıldı ✓', 'Used ✓')
                                    : bi('Koz Vur!', 'Use Leverage')}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="rounded-lg border border-white/6 bg-[#0E141D] px-2 py-1 text-[10px] text-slate-400 text-center truncate">
                          {all4Inspected
                            ? bi(
                                '✓ 4 test tamamlandı — gizli kusur tespit edilmedi.',
                                '✓ All 4 checks clean — no hidden defects found.'
                              )
                            : bi(
                                'Gizli kusurları bulup fiyat kırmak için test et!',
                                'Scan the device to expose hidden defects for leverage!'
                              )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* BUYER: COMPACT CROSS-SELL ACCESSORY BAR */}
                  {encounter.type === 'BUYER' && encounter.outcome === 'ACTIVE' && (
                    <div className="shrink-0 rounded-lg border border-white/8 bg-[#0E141D] p-2 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-sky-300">
                        <span className="inline-flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3" />
                          {bi('Yanına Aksesuar Öner', 'Cross-Sell Add-Ons')}
                        </span>
                        <span className="font-mono text-[9.5px] text-slate-400">
                          {encounter.crossSellAttachments?.length ?? 0}{' '}
                          {bi('eklendi', 'added')}
                        </span>
                      </div>
                      {stockedCrossSellOptions.length === 0 ? (
                        <div className="text-center text-[10px] text-slate-400 py-0.5">
                          {shopLevel < 2
                            ? bi(
                                'Aksesuar satışları Seviye 2 ile açılır.',
                                'Accessory cross-selling unlocks at Level 2.'
                              )
                            : bi(
                                'Reyonda stok yok — Toptancıdan aksesuar al.',
                                'Out of stock — order accessories from Wholesale.'
                              )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-1">
                          {stockedCrossSellOptions.slice(0, 4).map((spec) => {
                            const loc = getLocalizedAccessory(spec.id, lang);
                            const tried = encounter.crossSellTriedIds?.includes(
                              spec.id
                            );
                            const accepted =
                              encounter.crossSellAttachments?.some(
                                (a) => a.id === spec.id
                              );
                            return (
                              <button
                                key={spec.id}
                                type="button"
                                disabled={tried}
                                onClick={() => onPitchCrossSell(spec.id)}
                                className={`rounded-md border px-1.5 py-1 flex items-center gap-1.5 text-left text-[9.5px] font-bold transition-colors ${
                                  accepted
                                    ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-200'
                                    : tried
                                    ? 'border-white/5 bg-white/5 text-slate-500'
                                    : 'border-white/10 bg-[#17202D] text-slate-100 hover:border-amber-400/50 cursor-pointer'
                                }`}
                              >
                                <AccessoryProductArt
                                  id={spec.id}
                                  className="w-5 h-5 shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="truncate leading-tight">
                                    {loc.name}
                                  </div>
                                  <div className="font-mono text-[9px] text-amber-300 leading-tight">
                                    +
                                    {formatTRY(
                                      accessories[spec.id]?.retailPrice ??
                                        spec.recommendedPrice
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* EXPRESS REPAIR INFO STRIP */}
                  {encounter.type === 'EXPRESS_REPAIR' && encounter.expressDefectId && (
                    <div className="shrink-0 rounded-lg border border-amber-400/30 bg-amber-500/10 px-2.5 py-1.5 flex items-center justify-between gap-2 text-[10.5px]">
                      <span className="font-bold text-amber-200 truncate">
                        {bi('Arıza', 'Fault')}:{' '}
                        {getLocalizedDefect(encounter.expressDefectId, lang).shortLabel}
                      </span>
                      <span className="font-mono font-extrabold text-emerald-300 shrink-0">
                        +{formatTRY(encounter.customerPrice)}
                      </span>
                    </div>
                  )}
                </>
              )}
            </section>

            {/* COLUMN 3: STRUCTURED NEGOTIATION / RESOLUTION DECK (4 cols) */}
            <section className="col-span-4 flex flex-col min-h-0 h-full rounded-xl border border-white/10 bg-[#161E29]/95 p-2.5 gap-2 overflow-hidden">
              {encounter.outcome !== 'ACTIVE' ? (
                /* DEAL / WALKED OUT / DISMISSED OUTCOME CARD */
                <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center gap-2.5 p-2">
                  <div
                    className={`animate-stamp-pop rounded-xl border-2 px-4 py-1.5 font-display text-base font-extrabold tracking-wide ${
                      encounter.outcome === 'DEAL_CLOSED'
                        ? 'border-emerald-400 bg-emerald-500/15 text-emerald-300'
                        : 'border-rose-400 bg-rose-500/15 text-rose-300'
                    }`}
                  >
                    {encounter.outcome === 'DEAL_CLOSED'
                      ? bi('EL SIKIŞILDI', 'DEAL CLOSED')
                      : encounter.outcome === 'WALKED_OUT'
                      ? bi('MASADAN KALKTI', 'WALKED OUT')
                      : bi('GEÇİLDİ', 'PASSED')}
                  </div>

                  {encounter.outcome === 'DEAL_CLOSED' && (
                    <div className="font-mono text-xl font-extrabold text-slate-50 tabular-nums">
                      {formatTRY(encounter.finalPrice ?? encounter.customerPrice)}
                    </div>
                  )}

                  <p className="text-[11px] text-slate-300 max-w-xs">
                    {encounter.outcome === 'DEAL_CLOSED'
                      ? encounter.type === 'SELLER' ||
                        encounter.type === 'TRADE_IN' ||
                        encounter.type === 'BULK_AUCTION'
                        ? bi(
                            'Cihaz atölyene eklendi. Tamir edip vitrine koyabilirsin.',
                            'Device added to workshop. Repair and list it on your showcase!'
                          )
                        : bi(
                            'Satış kasaya işlendi ve XP kazandın!',
                            'Sale booked to your register and XP awarded!'
                          )
                      : bi(
                          'Bu müşteriyle anlaşma olmadı. Sıradaki müşteri seni bekliyor.',
                          'No deal this time. Next customer is waiting.'
                        )}
                  </p>

                  <div className="w-full flex items-center gap-1.5 mt-1">
                    {(encounter.type === 'SELLER' ||
                      encounter.type === 'TRADE_IN' ||
                      encounter.type === 'BULK_AUCTION') &&
                      encounter.outcome === 'DEAL_CLOSED' && (
                        <button
                          type="button"
                          onClick={onGoToWorkshop}
                          className="flex-1 rounded-xl border border-white/15 bg-[#1D2634] py-2 text-xs font-bold text-slate-100 hover:bg-[#273345] cursor-pointer whitespace-nowrap"
                        >
                          {bi('Atölye', 'Workshop')}
                        </button>
                      )}
                    <button
                      type="button"
                      onClick={onNextCustomer}
                      className="flex-1 rounded-xl bg-amber-500 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-400 cursor-pointer whitespace-nowrap"
                    >
                      {bi('Sıradaki Müşteri →', 'Next Customer →')}
                    </button>
                  </div>
                </div>
              ) : isNegotiable ? (
                /* ACTIVE NEGOTIATION DECK — TIGHT, BALANCED, ZERO VOID */
                <>
                  {/* Block 1: Customer Ask + Resistance Meter */}
                  <div className="shrink-0 rounded-xl border border-white/10 bg-[#0E141D] px-2.5 py-2 space-y-1.5 tabular-nums">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10.5px] font-medium text-slate-400">
                        {encounter.type === 'SELLER'
                          ? bi('Satıcı İstediği', 'Seller Asks')
                          : encounter.type === 'TRADE_IN'
                          ? bi('Önerdiği Fark', 'Cash Diff')
                          : bi('Alıcı Teklifi', 'Buyer Offers')}
                      </span>
                      <span className="font-mono text-base font-extrabold text-amber-300">
                        {formatTRY(encounter.customerPrice)}
                      </span>
                    </div>

                    {resistance && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-300 truncate">
                            {resistance.resistanceLabel}
                          </span>
                          <span className="font-mono font-bold text-amber-300 shrink-0">
                            %{resistance.resistancePct}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              resistance.resistanceTone === 'positive'
                                ? 'bg-emerald-400'
                                : resistance.resistanceTone === 'neutral'
                                ? 'bg-amber-400'
                                : resistance.resistanceTone === 'warning'
                                ? 'bg-orange-400'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${resistance.resistancePct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Middle Balanced Stack (Tone/Tactics + Slider + Valuation) */}
                  <div className="flex-1 min-h-0 flex flex-col justify-center gap-2 overflow-hidden">
                    {/* Block 2: Tone Selector + Tactics */}
                    <div className="rounded-xl border border-white/8 bg-[#0E141D] p-2 space-y-1.5">
                      <div className="grid grid-cols-3 gap-1">
                        {(['friendly', 'analytical', 'firm'] as NegotiationTone[]).map(
                          (t) => {
                            const locT = getLocalizedTone(t, lang);
                            return (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setTone(t)}
                                className={`rounded-md py-1 text-[10.5px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                                  tone === t
                                    ? 'bg-amber-500 text-slate-950'
                                    : 'bg-[#17202D] border border-white/8 text-slate-300 hover:text-white'
                                }`}
                              >
                                {locT.label}
                              </button>
                            );
                          }
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-1">
                        <button
                          type="button"
                          disabled={encounter.teaServed || cash < teaCost}
                          onClick={onServeTea}
                          className="inline-flex items-center justify-center gap-1 rounded-md border border-amber-400/30 bg-amber-500/12 py-1 text-[9.5px] font-bold text-amber-200 hover:bg-amber-500/22 disabled:opacity-35 cursor-pointer whitespace-nowrap"
                        >
                          <Coffee className="w-3 h-3" />
                          {encounter.teaServed
                            ? bi('Çay ✓', 'Tea ✓')
                            : teaCost === 0
                            ? bi('Çay (0₺)', 'Tea (Free)')
                            : bi(`Çay (${teaCost}₺)`, `Tea (${teaCost}₺)`)}
                        </button>

                        <button
                          type="button"
                          disabled={
                            encounter.bluffUsed || encounter.honestPitchUsed
                          }
                          onClick={onBluffOrPitch}
                          className="inline-flex items-center justify-center gap-1 rounded-md border border-sky-400/30 bg-sky-500/12 py-1 text-[9.5px] font-bold text-sky-200 hover:bg-sky-500/22 disabled:opacity-35 cursor-pointer whitespace-nowrap"
                        >
                          <Scale className="w-3 h-3" />
                          {encounter.type === 'SELLER'
                            ? bi('Blöf Yap', 'Bluff')
                            : bi('Övgü Yap', 'Pitch')}
                        </button>

                        {encounter.type === 'BUYER' && hasSmartPos ? (
                          <button
                            type="button"
                            onClick={onAcceptPosInstallment}
                            className="inline-flex items-center justify-center gap-1 rounded-md border border-emerald-400/35 bg-emerald-500/15 py-1 text-[9.5px] font-bold text-emerald-200 hover:bg-emerald-500/25 cursor-pointer whitespace-nowrap"
                          >
                            <CreditCard className="w-3 h-3" />
                            {bi('0% POS', '0% POS')}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={encounter.legacyDialogueUsed}
                            onClick={onUseLegacyDialogue}
                            className="inline-flex items-center justify-center gap-1 rounded-md border border-purple-400/30 bg-purple-500/12 py-1 text-[9.5px] font-bold text-purple-200 hover:bg-purple-500/22 disabled:opacity-35 cursor-pointer whitespace-nowrap"
                            title={legacyInfo.title}
                          >
                            <Award className="w-3 h-3" />
                            {bi('Esnaf Sözü', 'Perk Line')}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Block 3: Slider + Quick Adjust */}
                    <div className="rounded-xl border border-white/8 bg-[#0E141D] p-2 space-y-1.5 tabular-nums">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-400">
                          {bi('Senin Teklifin', 'Your Offer')}
                        </span>
                        <span className="font-mono text-sm font-extrabold text-slate-50">
                          {formatTRY(offerPrice)}
                        </span>
                      </div>
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
                        className="pasaj-slider w-full"
                      />
                      <div className="grid grid-cols-4 gap-1 font-mono text-[10px]">
                        {[-1000, -250, 250, 1000].map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => adjustOffer(d)}
                            className="rounded bg-[#17202D] border border-white/10 py-1 font-bold text-slate-200 hover:bg-[#223044] cursor-pointer"
                          >
                            {d > 0 ? `+${d}` : d}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Block 4: Valuation & Profit Strip */}
                    <div className="rounded-xl border border-white/8 bg-[#0E141D] px-2.5 py-1.5 text-[10px] space-y-1 tabular-nums">
                      {encounter.type === 'SELLER' ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-400">
                              {bi('Kusurlu / Tamir Sonrası', 'As-Is / Repaired')}
                            </span>
                            <span className="font-mono text-slate-200">
                              {formatTRY(valuation.asIsValue)} /{' '}
                              <strong className="text-amber-300">
                                {formatTRY(valuation.postRepairValue)}
                              </strong>
                            </span>
                          </div>
                          {(() => {
                            const netAfterRepair =
                              valuation.postRepairValue -
                              valuation.estimatedRepairCost -
                              offerPrice;
                            return (
                              <div className="flex justify-between border-t border-white/6 pt-1">
                                <span className="text-slate-400">
                                  {bi('Tahmini Net Kâr', 'Est. Net Profit')}
                                </span>
                                <span
                                  className={`font-mono font-extrabold ${
                                    netAfterRepair >= 0
                                      ? 'text-emerald-400'
                                      : 'text-rose-400'
                                  }`}
                                >
                                  {netAfterRepair >= 0 ? '+' : ''}
                                  {formatTRY(netAfterRepair)}
                                  {netAfterRepair < 0
                                    ? bi(' · ZARAR!', ' · LOSS!')
                                    : ''}
                                </span>
                              </div>
                            );
                          })()}
                        </>
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-slate-400">
                            {bi('Etiket / Maliyet', 'Tag / Cost')}
                          </span>
                          <span className="font-mono text-slate-200">
                            {formatTRY(encounter.device.askingPrice)} /{' '}
                            <strong className="text-emerald-300">
                              {formatTRY(
                                encounter.device.purchasePrice +
                                  encounter.device.repairSpend
                              )}
                            </strong>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Block 5: Primary CTA + Accept / Pass */}
                  <div className="shrink-0 space-y-1.5 tabular-nums">
                    <button
                      type="button"
                      disabled={encounter.type === 'SELLER' && offerPrice > cash}
                      onClick={handleOfferClick}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-35 cursor-pointer whitespace-nowrap"
                    >
                      <Handshake className="w-4 h-4" />
                      {bi('Teklif Ver', 'Send Offer')} ({formatTRY(offerPrice)})
                    </button>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        disabled={
                          encounter.type === 'SELLER' &&
                          encounter.customerPrice > cash
                        }
                        onClick={onAcceptCurrentPrice}
                        className="rounded-lg border border-emerald-400/35 bg-emerald-500/15 py-1.5 text-[10.5px] font-bold text-emerald-200 hover:bg-emerald-500/25 disabled:opacity-35 cursor-pointer whitespace-nowrap truncate px-1"
                      >
                        ✓ {bi('Kabul', 'Accept')} ({formatTRY(encounter.customerPrice)})
                      </button>
                      <button
                        type="button"
                        onClick={onDismiss}
                        className="rounded-lg border border-white/12 bg-[#1D2634] py-1.5 text-[10.5px] font-bold text-slate-300 hover:text-white cursor-pointer whitespace-nowrap"
                      >
                        {bi('Kalsın', 'Pass')}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* SPECIAL ENCOUNTER ACTION DECKS */
                <div className="flex-1 flex flex-col justify-center gap-3">
                  {encounter.type === 'ACCESSORY_BUYER' && (
                    <>
                      <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-center">
                        <div className="text-[10.5px] text-emerald-200">
                          {bi('Sepet Toplamı', 'Basket Total')}
                        </div>
                        <div className="font-mono text-xl font-extrabold text-emerald-300">
                          {formatTRY(encounter.customerPrice)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={onCompleteAccessoryOrder}
                        className="w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-emerald-400 cursor-pointer"
                      >
                        ✓ {bi('Kasadan Geç & Sat', 'Ring Up & Sell')}
                      </button>
                    </>
                  )}

                  {encounter.type === 'EXPRESS_REPAIR' && (
                    <>
                      <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-center tabular-nums">
                        <div className="text-[10.5px] text-amber-200">
                          {bi('Acil Servis Ücreti', 'Express Payout')}
                        </div>
                        <div className="font-mono text-xl font-extrabold text-emerald-300">
                          +{formatTRY(encounter.customerPrice)}
                        </div>
                        <div className="text-[10px] text-slate-300 mt-0.5">
                          {bi('Parça Maliyeti', 'Part Cost')}:{' '}
                          {formatTRY(encounter.expressPartCost ?? 0)}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {hasRepairBench && (
                          <button
                            type="button"
                            disabled={cash < (encounter.expressPartCost ?? 0)}
                            onClick={onExpressRepairMini}
                            className="w-full inline-flex items-center justify-center gap-1 rounded-xl bg-amber-500 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-35 cursor-pointer"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            {bi('Kendin Onar (Mini Oyun)', 'Fix Yourself (Mini-Game)')}
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={cash < (encounter.expressPartCost ?? 0)}
                          onClick={onExpressRepairQuick}
                          className="w-full inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-500 py-2 text-xs font-extrabold text-slate-950 hover:bg-emerald-400 disabled:opacity-35 cursor-pointer"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          {bi('Hızlı Onar & Teslim Et', 'Quick Repair & Deliver')}
                        </button>
                        {hasMasterTech && (
                          <button
                            type="button"
                            disabled={cash < (encounter.expressPartCost ?? 0)}
                            onClick={onDelegateExpressRepair}
                            className="w-full inline-flex items-center justify-center gap-1 rounded-xl border border-sky-400/35 bg-sky-500/15 py-1.5 text-[11px] font-bold text-sky-200 cursor-pointer"
                          >
                            <UserCog className="w-3.5 h-3.5" />
                            {bi('Hasan Ustaya Devret', 'Delegate to Master Hasan')}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={onDismiss}
                          className="w-full rounded-lg border border-white/10 bg-[#1D2634] py-1.5 text-[11px] font-bold text-slate-300 cursor-pointer"
                        >
                          {bi('Reddet', 'Decline')}
                        </button>
                      </div>
                    </>
                  )}

                  {encounter.type === 'BULK_AUCTION' && (
                    <>
                      <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-center">
                        <div className="text-[10.5px] text-amber-200">
                          {bi('Koli Fiyatı', 'Lot Price')}
                        </div>
                        <div className="font-mono text-xl font-extrabold text-amber-300">
                          {formatTRY(encounter.customerPrice)}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <button
                          type="button"
                          disabled={cash < encounter.customerPrice}
                          onClick={onAcceptBulkAuction}
                          className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-35 cursor-pointer"
                        >
                          <Gavel className="w-4 h-4" />
                          {bi('Koliyi Satın Al', 'Buy Mystery Lot')}
                        </button>
                        <button
                          type="button"
                          onClick={onDismiss}
                          className="w-full rounded-lg border border-white/10 bg-[#1D2634] py-1.5 text-[11px] font-bold text-slate-300 cursor-pointer"
                        >
                          {bi('Risk Alma · Geç', 'Skip Lot')}
                        </button>
                      </div>
                    </>
                  )}

                  {encounter.type === 'WARRANTY_CLAIM' && (
                    <div className="space-y-2">
                      <button
                        type="button"
                        disabled={cash < encounter.customerPrice}
                        onClick={() => onResolveWarranty('REPAIR')}
                        className="w-full rounded-xl bg-emerald-500 py-2 text-xs font-extrabold text-slate-950 hover:bg-emerald-400 disabled:opacity-35 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
                        {bi('Ücretsiz Onar', 'Free Repair')} ({formatTRY(encounter.customerPrice)})
                      </button>
                      <button
                        type="button"
                        disabled={cash < (encounter.warrantyRecord?.salePrice ?? 0)}
                        onClick={() => onResolveWarranty('REFUND')}
                        className="w-full rounded-xl border border-amber-400/35 bg-amber-500/15 py-2 text-xs font-bold text-amber-200 disabled:opacity-35 cursor-pointer"
                      >
                        {bi('Tam İade Yap', 'Full Refund')}
                      </button>
                      <button
                        type="button"
                        onClick={() => onResolveWarranty('REJECT')}
                        className="w-full rounded-xl border border-rose-500/35 bg-rose-500/15 py-1.5 text-xs font-bold text-rose-200 cursor-pointer"
                      >
                        {bi('Reddet (-İtibar)', 'Reject (-Rep)')}
                      </button>
                    </div>
                  )}

                  {encounter.type === 'DATA_RECOVERY' && encounter.dataRecoveryJob && (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => onResolveDataRecovery('SOFTWARE')}
                        className="w-full rounded-xl bg-sky-500 py-2 text-xs font-extrabold text-slate-950 hover:bg-sky-400 cursor-pointer"
                      >
                        {bi('Yazılımla Kurtar (Ücretsiz)', 'Software Recovery (Free)')}
                      </button>
                      <button
                        type="button"
                        disabled={cash < encounter.dataRecoveryJob.cleanRoomCost}
                        onClick={() => onResolveDataRecovery('CLEAN_ROOM')}
                        className="w-full rounded-xl bg-emerald-500 py-2 text-xs font-extrabold text-slate-950 hover:bg-emerald-400 disabled:opacity-35 cursor-pointer"
                      >
                        {bi('Temiz Oda Lab', 'Clean Room Lab')} ({formatTRY(encounter.dataRecoveryJob.cleanRoomCost)})
                      </button>
                      <button
                        type="button"
                        onClick={onDismiss}
                        className="w-full rounded-lg border border-white/10 bg-[#1D2634] py-1.5 text-[11px] font-bold text-slate-300 cursor-pointer"
                      >
                        {bi('İade Et · Geç', 'Decline')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PHYSICAL OPTICAL LOUPE INSPECTION WORKBENCH MODAL */}
      {showLoupeModal &&
        (encounter.type === 'SELLER' ||
          (encounter.type === 'TRADE_IN' && Boolean(encounter.tradeInDevice))) && (
          <PhysicalInspectModal
            device={inspectedTarget}
            onInspectZone={(cat) => onInspect(cat, true)}
            onPhysicalCompleteBonus={onPhysicalInspectBonus}
            onClose={() => setShowLoupeModal(false)}
          />
        )}
    </div>
  );
};
