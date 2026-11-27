import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowLeftRight,
  Award,
  Building2,
  Check,
  ClipboardCheck,
  CloudRain,
  Coffee,
  Coins,
  CreditCard,
  Database,
  DoorOpen,
  FileCheck2,
  Flame,
  FolderOpen,
  Gavel,
  Handshake,
  Music,
  Newspaper,
  Package,
  Radio,
  Scale,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Target,
  UserCog,
  Video,
  WifiOff,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import {
  ACCESSORY_CATALOG,
  DEFECT_CATALOG,
  LEGACY_PATHS,
  RADIO_STATIONS_META,
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
  getQuickRepairExpressFee,
  hasAccessoryLicense,
  isAccessoryUnlocked,
  roundPrice,
} from '../game/engine';
import {
  getLocalizedAccessory,
  getLocalizedArchetype,
  getLocalizedDefect,
  getLocalizedNews,
  getLocalizedQuest,
  getLocalizedRoleText,
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
  RadioStationId,
  RandomStoreEvent,
  ShopTier,
  SoldPhoneRecord,
  StaffId,
  StaffRepairJob,
  UpgradeId,
} from '../game/types';
import { CustomerAvatar } from './CustomerAvatar';
import { EsnafReportModal } from './EsnafReportModal';
import { PhoneInspectSVG, PhoneModelThumb } from './PhoneInspectSVG';
import { PhysicalInspectModal } from './PhysicalInspectModal';
import { ShopDecorLayer, WaitingCustomerPreview } from './ShopDecorLayer';
import { SoftwareRecoveryModal } from './SoftwareRecoveryModal';
import { AccessoryProductArt } from './VisualShowcaseArt';
import { CUSTOMER_ARCHETYPES } from '../game/catalog';

interface CounterViewProps {
  encounter: CustomerEncounter | null;
  day: number;
  cash: number;
  shopTier: ShopTier;
  shopLevel: number;
  prestigeLevel?: number;
  radioStation?: RadioStationId;
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
  todayRentDiscountPct?: number;
  equippedOutfit: OutfitId;
  hiredStaff: StaffId[];
  staffLevels: Record<StaffId, number>;
  staffRepairQueue: StaffRepairJob[];
  textSpeed?: 'normal' | 'fast' | 'instant';
  onCycleRadio?: () => void;
  onTeaBoilerFresh?: () => void;
  onDiscloseBuyer?: () => void;
  complaintCount?: number;
  openComplaintCount?: number;
  onOpenComplaintArchive?: () => void;
  onOpenWarrantyCertificate?: (record: SoldPhoneRecord) => void;
  onOpenCertificateById?: (recordId: string) => void;
  onOpenNewspaper: () => void;
  onOpenMissions: () => void;
  onOpenWardrobe?: () => void;
  onDismissDay1Guide?: () => void;
  onUnlockAllTabsEarly?: () => void;
  onClaimDailyQuest: (questId: string) => void;
  onResolveStoreEventAction: (choice?: 'PRIMARY' | 'ALT') => void;
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
  onResolveDataRecovery: (mode: 'SOFTWARE' | 'CLEAN_ROOM', forcedSuccess?: boolean) => void;
  shakeTrigger: number;
}

const INSPECTION_ORDER: InspectionCategory[] = [
  'screen',
  'battery',
  'imei',
  'hardware',
];

const ESNAF_PROVERBS_BY_TONE: Record<
  NegotiationTone,
  { tr: string[]; en: string[] }
> = {
  friendly: {
    tr: [
      'Pazarlık sünnettir, gönüller bir olsun!',
      'Çaylar bizden, kâr Allah’tan!',
      'Gülen yüz pasajın yarısını satar!',
      'Müşteri velinimetimizdir, yeter ki kasa boş kalmasın!',
      'Komşuda pişer, bize de düşer!',
      'Tatlı dil pasajda kilit açar!',
    ],
    en: [
      'A fair haggle warms the heart!',
      'Tea is on the house, profit is in fate!',
      'A warm smile sells half the arcade!',
      'Sweet words unlock every deal!',
    ],
  },
  analytical: {
    tr: [
      'Hesabını bilmeyen kasap, ne satır bırakır ne masat!',
      'Rakam konuşunca pazarlık susar!',
      'Ucuz etin yahnisi yavan, yan sanayi ekranı soluk olur!',
      'Esnafın terazisi milim şaşmaz!',
      'İyi mal kendini satar, temiz IMEI baş tacıdır!',
      'Ekranı sağlam olanın piyasası sağlam olur!',
    ],
    en: [
      'When numbers speak, haggling listens!',
      'A true appraiser’s scale never misses a lira!',
      'Clean IMEI and original OLED speak for themselves!',
      'Cheap parts cost twice in the long run!',
    ],
  },
  firm: {
    tr: [
      'Gelen gideni aratır, bu fiyatı bir daha bulamazsın!',
      'Kurt esnaf malını ölü fiyata bırakmaz!',
      'Tezgâhta şaka olmaz, rakam son sözdür!',
      'Beleş peynir ancak fare kapanında olur!',
      'Son fiyatım budur; üstü zarar, altı ayıp!',
      'Pasajda herkes satıcı ama malın kıymetini bilen az!',
    ],
    en: [
      'Walk out and you’ll miss this price!',
      'A seasoned merchant never sells at a loss!',
      'Free cheese only exists in a mousetrap!',
      'Final figure — no jokes at this counter!',
    ],
  },
};

const TEA_PROVERBS = {
  tr: [
    'Bir fincan çayın kırk yıl hatırı, pazarlıkta %5 indirimi vardır!',
    'İnce bellide çay geldi mi buzlar erir!',
    'Çay taze, muhabbet koyu, fiyat tatlı!',
  ],
  en: [
    'A fresh tulip glass of tea melts any hard bargain!',
    'Hot tea poured — counter mood warmed!',
  ],
};

const SHOP_SPIRIT_META: Record<
  NegotiationTone,
  {
    btnTr: string;
    btnEn: string;
    spiritTr: string;
    spiritEn: string;
    activeCls: string;
    bubbleCls: string;
    textCls: string;
  }
> = {
  friendly: {
    btnTr: 'Dostane',
    btnEn: 'Friendly',
    spiritTr: 'Sıcak Pasaj Ruhu',
    spiritEn: 'Warm Hospitality',
    activeCls: 'border-emerald-400/60 bg-emerald-500/20 text-emerald-200',
    bubbleCls: 'border-emerald-400/50 bg-[#12241E]/95 text-emerald-100',
    textCls: 'text-emerald-300',
  },
  analytical: {
    btnTr: 'Profesyonel',
    btnEn: 'Professional',
    spiritTr: 'Bilirkişi Ruhu',
    spiritEn: 'Pro Appraiser',
    activeCls: 'border-sky-400/60 bg-sky-500/20 text-sky-200',
    bubbleCls: 'border-sky-400/50 bg-[#111E2D]/95 text-sky-100',
    textCls: 'text-sky-300',
  },
  firm: {
    btnTr: 'Sert',
    btnEn: 'Firm',
    spiritTr: 'Kurt Esnaf Ruhu',
    spiritEn: 'Hardball Boss',
    activeCls: 'border-rose-400/60 bg-rose-500/20 text-rose-200',
    bubbleCls: 'border-rose-400/50 bg-[#28131A]/95 text-rose-100',
    textCls: 'text-rose-300',
  },
};

interface ProverbBubble {
  id: string;
  text: string;
  tone: NegotiationTone;
  spiritLabel: string;
}

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
  prestigeLevel = 0,
  radioStation = 'OFF',
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
  todayRentDiscountPct = 0,
  hiredStaff,
  onCycleRadio,
  onTeaBoilerFresh,
  onDiscloseBuyer,
  complaintCount = 0,
  openComplaintCount = 0,
  onOpenComplaintArchive,
  onOpenWarrantyCertificate,
  onOpenCertificateById,
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
  const [portraitFailed, setPortraitFailed] = useState(false);
  const [showLoupeModal, setShowLoupeModal] = useState(false);
  const [loupeInitialCategory, setLoupeInitialCategory] = useState<
    InspectionCategory | undefined
  >(undefined);
  const [showSoftwareRecoveryModal, setShowSoftwareRecoveryModal] = useState(false);
  const [showEsnafReportModal, setShowEsnafReportModal] = useState(false);
  const selectedTone: NegotiationTone = 'friendly';
  const [proverbBubbles, setProverbBubbles] = useState<ProverbBubble[]>([]);
  const [teaBoilerFreshActive, setTeaBoilerFreshActive] = useState(false);
  const [teaBoilerCooldownSec, setTeaBoilerCooldownSec] = useState(0);
  const turnStartRef = useRef<number>(Date.now());
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const teaBurstTimeoutRef = useRef<number | null>(null);
  const hasTeaBoilerActive = activeDecorations.includes('tea_boiler');

  const triggerEsnafProverb = (
    tone: NegotiationTone,
    customPool?: { tr: string[]; en: string[] }
  ) => {
    const pool = customPool
      ? lang === 'en'
        ? customPool.en
        : customPool.tr
      : lang === 'en'
      ? ESNAF_PROVERBS_BY_TONE[tone].en
      : ESNAF_PROVERBS_BY_TONE[tone].tr;
    const text = pool[Math.floor(Math.random() * pool.length)];
    const meta = SHOP_SPIRIT_META[tone];
    const id = `prv_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    const bubble: ProverbBubble = {
      id,
      text,
      tone,
      spiritLabel: lang === 'en' ? meta.spiritEn : meta.spiritTr,
    };
    setProverbBubbles((prev) => [...prev.slice(-1), bubble]);
    window.setTimeout(() => {
      setProverbBubbles((prev) => prev.filter((b) => b.id !== id));
    }, 3600);
  };

  const triggerTeaBoilerFreshBrew = () => {
    if (!hasTeaBoilerActive) return;
    setTeaBoilerFreshActive(true);
    setTeaBoilerCooldownSec(18);
    soundFX.playTea();
    triggerEsnafProverb('friendly', {
      tr: [
        'Taze çay doldu! Tavşan kanı dem kokusu pasajı sardı (+4 Moral · +5 Sabır)',
        'Çay kazanı fokurdadı — taze dem hazır! Esnafın morali tavan (+4 Moral · +5 Sabır)',
        'Taze çay doldu! İnce belliler şıngırdadı, muhabbet ısındı (+4 Moral · +5 Sabır)',
      ],
      en: [
        'Fresh tea brewed! Warm aroma lifts the whole arcade (+4 Mood · +5 Patience)',
        'The copper boiler is steaming — fresh tea ready! (+4 Mood · +5 Patience)',
      ],
    });
    onTeaBoilerFresh?.();
    if (teaBurstTimeoutRef.current) {
      window.clearTimeout(teaBurstTimeoutRef.current);
    }
    teaBurstTimeoutRef.current = window.setTimeout(() => {
      setTeaBoilerFreshActive(false);
    }, 3800);
  };

  // Periodic automatic "Taze çay doldu!" brew cycle every 34s while Tea Boiler is active
  useEffect(() => {
    if (!hasTeaBoilerActive) return;
    const intervalId = window.setInterval(() => {
      triggerTeaBoilerFreshBrew();
    }, 34000);
    return () => {
      window.clearInterval(intervalId);
      if (teaBurstTimeoutRef.current) {
        window.clearTimeout(teaBurstTimeoutRef.current);
      }
    };
  }, [hasTeaBoilerActive, lang]);

  // Countdown tick for manual "Demle" button cooldown
  useEffect(() => {
    if (teaBoilerCooldownSec <= 0) return;
    const tick = window.setInterval(() => {
      setTeaBoilerCooldownSec((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(tick);
  }, [teaBoilerCooldownSec > 0]);

  const waitingCustomers: WaitingCustomerPreview[] = useMemo(() => {
    return queue.slice(queueIndex + 1, queueIndex + 3).map((q) => ({
      id: q.id,
      name: q.customerName,
      archetypeId: q.archetypeId,
      portraitPath: q.portraitPath,
      fallbackColor: CUSTOMER_ARCHETYPES[q.archetypeId]?.fallbackColor ?? '#475569',
    }));
  }, [queue, queueIndex]);

  const openHandsOnInspect = (category?: InspectionCategory) => {
    soundFX.playClick();
    setLoupeInitialCategory(category);
    setShowLoupeModal(true);
  };

  const activeEventVisual = activeStoreEvent?.visualKind ?? null;
  const locNews = getLocalizedNews(dailyNews, lang);

  useEffect(() => {
    if (!encounter) return;
    const alreadyOnDesk = isEncounterOnDesk(encounter);
    setStage(alreadyOnDesk ? 'ON_DESK' : 'ARRIVED');
    setPortraitFailed(false);
    setShowLoupeModal(false);
    setLoupeInitialCategory(undefined);
    setShowSoftwareRecoveryModal(false);
    setShowEsnafReportModal(false);
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
    const rafId = window.requestAnimationFrame(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [encounter?.id, encounter?.messages.length, stage]);

  const sliderBounds = useMemo(() => {
    if (!encounter) return { min: 500, max: 10000, step: 250 };
    if (encounter.type === 'SELLER') {
      const min = roundPrice(Math.max(500, encounter.customerPrice * 0.45));
      const max = Math.max(min + 250, encounter.customerPrice);
      return { min, max, step: max > 20000 ? 500 : 250 };
    }
    if (encounter.type === 'TRADE_IN') {
      const min = encounter.customerPrice;
      const maxCap = Math.max(
        min + 500,
        roundPrice(encounter.device.askingPrice - 500)
      );
      const max = Math.min(
        maxCap,
        roundPrice(Math.max(min + 1000, encounter.secretLimit * 1.35))
      );
      return { min, max: Math.max(min + 250, max), step: 250 };
    }
    const min = encounter.customerPrice;
    const max = Math.max(min + 250, encounter.device.askingPrice);
    return { min, max, step: max > 20000 ? 500 : 250 };
  }, [encounter]);

  // License & shop-tier-gated cross-sell options — requires accessory_license
  const stockedCrossSellOptions = useMemo(
    () =>
      ACCESSORY_CATALOG.filter(
        (spec) =>
          isAccessoryUnlocked(spec.id, shopTier, upgrades) &&
          (accessories[spec.id]?.quantity ?? 0) > 0
      ),
    [accessories, shopTier, upgrades]
  );

  const readyQuest = dailyQuests.find((q) => !q.claimed && q.progress >= q.target);
  const activeQuestRaw =
    readyQuest ?? dailyQuests.find((q) => !q.claimed) ?? dailyQuests[0];
  const activeQuest = activeQuestRaw
    ? getLocalizedQuest(activeQuestRaw, lang)
    : null;

  const totalAccessoryStock = useMemo(
    () =>
      Object.values(accessories).reduce(
        (sum, entry) => sum + (entry?.quantity ?? 0),
        0
      ),
    [accessories]
  );

  if (!encounter) {
    return (
      <div className="relative flex-1 h-full min-h-0 flex flex-col items-center justify-center p-4 text-center overflow-hidden">
        <ShopDecorLayer
          shopTier={shopTier}
          activeDecorations={activeDecorations}
          upgrades={upgrades}
          totalAccessoryStock={totalAccessoryStock}
          activeEventVisual={activeEventVisual}
          listedPhones={listedPhones}
          prestigeLevel={prestigeLevel}
          radioStation={radioStation}
          waitingCustomers={[]}
          teaServedOnCounter={false}
          teaBoilerFreshActive={teaBoilerFreshActive}
          shopSpirit={selectedTone}
        />
        <div className="relative z-10 rounded-2xl border border-white/12 bg-[#141C27]/95 p-4 max-w-md shadow-2xl">
          <h2 className="font-display text-sm [@media(min-height:560px)]:text-base font-extrabold text-slate-100">
            {bi('Bugünkü Müşteriler Tamamlandı', 'All Customers Served Today')}
          </h2>
          <p className="text-[10.5px] [@media(min-height:560px)]:text-[11px] text-slate-300 mt-1 mb-3">
            {bi(
              'Kepenkleri indirmeden önce atölyeye uğrayıp cihazlarını tamir edip vitrine koyabilirsin.',
              'Before closing shutters, visit your workshop to repair and list phones on your showcase.'
            )}
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={onGoToWorkshop}
              className="rounded-lg border border-white/15 bg-[#1D2634] px-3.5 py-1.5 text-[10.5px] [@media(min-height:560px)]:text-[11px] font-bold text-slate-200 hover:bg-[#273345] cursor-pointer whitespace-nowrap"
            >
              {bi('Atölyeye Göz At', 'Visit Workshop')}
            </button>
            <button
              type="button"
              onClick={onNextCustomer}
              className="rounded-lg bg-amber-500 px-4 py-1.5 text-[10.5px] [@media(min-height:560px)]:text-[11px] font-extrabold text-slate-950 hover:bg-amber-400 cursor-pointer whitespace-nowrap"
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
    ? getNegotiationResistance(encounter, offerPrice, selectedTone)
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
    triggerEsnafProverb(selectedTone);
    onSubmitOffer(offerPrice, selectedTone, elapsedSec);
  };

  const adjustOffer = (delta: number) => {
    setOfferPrice((prev) =>
      Math.max(sliderBounds.min, Math.min(sliderBounds.max, prev + delta))
    );
  };


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
    <div className="relative flex-1 h-full min-h-0 flex flex-col overflow-hidden bg-[#0F141B]">
      <ShopDecorLayer
        shopTier={shopTier}
        activeDecorations={activeDecorations}
        upgrades={upgrades}
        totalAccessoryStock={totalAccessoryStock}
        activeEventVisual={activeEventVisual}
        listedPhones={listedPhones}
        prestigeLevel={prestigeLevel}
        radioStation={radioStation}
        waitingCustomers={waitingCustomers}
        teaServedOnCounter={encounter.teaServed}
        teaBoilerFreshActive={teaBoilerFreshActive}
        shopSpirit={selectedTone}
      />

      {/* FLOATING ESNAF VECİZELERİ SPEECH BUBBLES (NON-BLOCKING, COMPACT) */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed top-10 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-1 w-full max-w-[260px] sm:max-w-xs px-2"
      >
        <AnimatePresence>
          {proverbBubbles.map((bubble) => {
            const meta = SHOP_SPIRIT_META[bubble.tone];
            return (
              <motion.div
                key={bubble.id}
                initial={{ opacity: 0, y: 10, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.94 }}
                transition={{ duration: 0.2 }}
                className={`relative rounded-xl border px-2.5 py-1 shadow-xl backdrop-blur-md text-center ${meta.bubbleCls}`}
              >
                <div className={`text-[8px] font-extrabold tracking-wide uppercase ${meta.textCls}`}>
                  {bubble.spiritLabel}
                </div>
                <div className="text-[10px] font-bold leading-tight mt-0.5 italic">
                  “{bubble.text}”
                </div>
                {/* Small Speech Bubble Tail */}
                <div
                  className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-r border-b ${meta.bubbleCls}`}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* SLIM SINGLE-LINE TOP BAR: NEWS + RADIO + QUEUE + ACTIVE QUEST */}
      <div className="relative z-10 shrink-0 flex flex-wrap sm:flex-nowrap items-center justify-between gap-1.5 sm:gap-2 border-b border-white/10 bg-[#131A24]/95 px-2 py-0.5 [@media(min-height:560px)]:py-1 text-[9.5px] [@media(min-height:560px)]:text-[10px]">
        <button
          type="button"
          onClick={onOpenNewspaper}
          className="inline-flex items-center gap-1 text-amber-200 hover:text-amber-100 min-w-0 flex-1 sm:flex-initial cursor-pointer"
        >
          <Newspaper className="w-3 h-3 text-amber-400 shrink-0" />
          <span className="truncate font-semibold">{locNews.headline}</span>
        </button>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0 max-w-full overflow-x-auto no-scrollbar">
          {/* Interactive Eski Pasaj Radyosu Switcher */}
          {onCycleRadio && activeDecorations.includes('vintage_radio') && (() => {
            const stMeta = RADIO_STATIONS_META[radioStation];
            const trackIdx = (day + queueIndex) % Math.max(1, stMeta.tracks.length);
            const trackTitle = stMeta.tracks[trackIdx];
            return (
              <button
                type="button"
                onClick={onCycleRadio}
                title={
                  trackTitle
                    ? `${stMeta.freq} · ${trackTitle}`
                    : bi('Eski Pasaj Radyosunu Aç (Arabesk / 90lar Pop)', 'Turn on Vintage Radio (Arabesk / 90s Pop)')
                }
                className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[9.5px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  radioStation === 'ARABESK'
                    ? 'border-amber-400/50 bg-amber-500/18 text-amber-200 hover:bg-amber-500/25'
                    : radioStation === 'POP90'
                    ? 'border-fuchsia-400/50 bg-fuchsia-500/18 text-fuchsia-200 hover:bg-fuchsia-500/25'
                    : 'border-white/12 bg-[#1B2432] text-slate-300 hover:text-white'
                }`}
              >
                <Radio className={`w-3 h-3 shrink-0 ${radioStation !== 'OFF' ? 'animate-pulse' : ''}`} />
                <span className="hidden md:inline max-w-[140px] truncate">
                  {radioStation === 'OFF'
                    ? bi('Eski Radyo', 'Old Radio')
                    : `${stMeta.freq} · ${trackTitle}`}
                </span>
                <span className="md:hidden">
                  {radioStation === 'ARABESK'
                    ? '94.2'
                    : radioStation === 'POP90'
                    ? '98.8'
                    : bi('Radyo', 'Radio')}
                </span>
              </button>
            );
          })()}

          {/* Interactive Çay Kazanı Fresh Brew Trigger */}
          {hasTeaBoilerActive && (
            <button
              type="button"
              disabled={teaBoilerCooldownSec > 0}
              onClick={triggerTeaBoilerFreshBrew}
              title={bi(
                'Bakır Çay Kazanı: Periyodik olarak taze çay dolar ve +4 Moral / +5 Sabır verir. Hazırken tıklayıp hemen taze dem çek!',
                'Copper Tea Boiler: Periodically brews fresh tea (+4 Mood / +5 Patience). Tap when ready to pour immediately!'
              )}
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[9.5px] font-bold transition-colors whitespace-nowrap ${
                teaBoilerFreshActive
                  ? 'border-amber-300/75 bg-amber-500/25 text-amber-100'
                  : teaBoilerCooldownSec > 0
                  ? 'border-white/10 bg-[#171F2B] text-slate-400 cursor-default'
                  : 'border-amber-400/45 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25 cursor-pointer'
              }`}
            >
              <Coffee className={`w-3 h-3 shrink-0 ${teaBoilerFreshActive ? 'animate-bounce text-amber-300' : 'text-amber-400'}`} />
              <span className="hidden lg:inline">
                {teaBoilerFreshActive
                  ? bi('Taze Çay Doldu!', 'Fresh Brew!')
                  : teaBoilerCooldownSec > 0
                  ? bi(`Dem (${teaBoilerCooldownSec}s)`, `Brew (${teaBoilerCooldownSec}s)`)
                  : bi('Taze Dem Çek', 'Pour Fresh Tea')}
              </span>
              <span className="lg:hidden font-mono">
                {teaBoilerCooldownSec > 0 ? `${teaBoilerCooldownSec}s` : bi('Dem', 'Tea')}
              </span>
            </button>
          )}

          {onOpenComplaintArchive && (
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                onOpenComplaintArchive();
              }}
              title={bi('Müşteri Şikayet Dosyası & Garanti Belgeleri', 'Customer Complaint File & Warranties')}
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[9.5px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                openComplaintCount > 0
                  ? 'border-rose-400/55 bg-rose-500/20 text-rose-200 hover:bg-rose-500/30'
                  : 'border-white/12 bg-[#1B2432] text-slate-300 hover:text-white'
              }`}
            >
              <FolderOpen className="w-3 h-3 shrink-0" />
              <span className="hidden lg:inline">
                {bi('Şikayet Dosyası', 'Complaints')}
              </span>
              <span className="lg:hidden">
                {bi('Dosya', 'File')}
              </span>
              {(complaintCount > 0 || openComplaintCount > 0) && (
                <span className="font-mono text-[9px] font-extrabold text-amber-300">
                  {openComplaintCount > 0 ? `${openComplaintCount}!` : complaintCount}
                </span>
              )}
            </button>
          )}

          {dealStreak >= 2 && (
            <span className="inline-flex items-center gap-0.5 font-mono text-[10px] font-extrabold text-amber-300">
              <Flame className="w-3 h-3 text-amber-400" />
              {dealStreak}x
            </span>
          )}

          {todayRentDiscountPct > 0 && (
            <span
              title={bi(
                `Pasaj yönetimi bugünkü kirada %${Math.round(todayRentDiscountPct * 100)} indirim uyguladı!`,
                `Arcade management applied a ${Math.round(todayRentDiscountPct * 100)}% discount on today's rent!`
              )}
              className="inline-flex items-center gap-1 rounded-md border border-emerald-400/40 bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[9.5px] font-extrabold text-emerald-300 whitespace-nowrap"
            >
              <Building2 className="w-2.5 h-2.5" />
              {bi('Kira', 'Rent')} -%{Math.round(todayRentDiscountPct * 100)}
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

      {/* LIVE PASAJ MINI-EVENT INTERACTIVE BANNER */}
      {activeStoreEvent && !activeStoreEvent.resolved && (() => {
        const primaryCost = activeStoreEvent.actionCost ?? 0;
        const altCost = activeStoreEvent.altActionCost ?? 0;
        const canAffordPrimary = cash >= primaryCost;
        const canAffordAlt = cash >= altCost;
        const EventIcon =
          activeStoreEvent.visualKind === 'coin_jam'
            ? Coins
            : activeStoreEvent.visualKind === 'rent_meeting'
            ? Building2
            : activeStoreEvent.visualKind === 'wifi_outage'
            ? WifiOff
            : activeStoreEvent.visualKind === 'tea_war' ||
              activeStoreEvent.visualKind === 'tea_aroma'
            ? Coffee
            : activeStoreEvent.visualKind === 'parcel_mixup'
            ? Package
            : activeStoreEvent.visualKind === 'music'
            ? Music
            : activeStoreEvent.visualKind === 'power_surge'
            ? Zap
            : activeStoreEvent.visualKind === 'rain'
            ? CloudRain
            : activeStoreEvent.visualKind === 'livestream'
            ? Video
            : activeStoreEvent.visualKind === 'inspection'
            ? ShieldAlert
            : Sparkles;

        return (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-20 shrink-0 flex flex-wrap items-center justify-between gap-2 border-b border-amber-400/45 bg-gradient-to-r from-[#261E11]/95 via-[#1C1822]/95 to-[#141D2A]/95 px-3 py-1.5 text-[10.5px] shadow-md"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-400/40 bg-amber-500/20 text-amber-300 shrink-0">
                <EventIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="rounded bg-amber-500/25 px-1.5 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-wide text-amber-300">
                    {activeStoreEvent.badgeLabel ?? bi('PASAJ OLAYI', 'ARCADE EVENT')}
                  </span>
                  <strong className="text-amber-100 font-bold truncate">
                    {activeStoreEvent.title}
                  </strong>
                </div>
                <div className="text-slate-200/90 text-[10px] leading-snug line-clamp-1">
                  {activeStoreEvent.description}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
              {activeStoreEvent.actionLabel && (
                <button
                  type="button"
                  disabled={!canAffordPrimary}
                  onClick={() => onResolveStoreEventAction('PRIMARY')}
                  title={activeStoreEvent.effectSummary}
                  className="rounded-lg bg-amber-500 px-2.5 py-1 text-[10px] font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap transition-colors"
                >
                  {activeStoreEvent.actionLabel}
                </button>
              )}
              {activeStoreEvent.altActionLabel && (
                <button
                  type="button"
                  disabled={!canAffordAlt}
                  onClick={() => onResolveStoreEventAction('ALT')}
                  title={activeStoreEvent.effectSummary}
                  className="rounded-lg border border-sky-400/45 bg-sky-500/18 px-2.5 py-1 text-[10px] font-extrabold text-sky-100 hover:bg-sky-500/28 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap transition-colors"
                >
                  {activeStoreEvent.altActionLabel}
                </button>
              )}
              <button
                type="button"
                onClick={onDismissStoreEvent}
                className="flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
                aria-label={bi('Olayı geç', 'Dismiss event')}
                title={bi('Görmezden gel', 'Ignore')}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        );
      })()}

      {/* MAIN PLAYFIELD — ZERO VERTICAL SCROLL */}
      <AnimatePresence mode="wait">
        {stage === 'ARRIVED' ? (
          <motion.div
            key={`arrived_${encounter.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="relative z-10 flex-1 h-full min-h-0 flex items-center justify-center px-2.5 pt-1.5 pb-14 sm:pb-16 overflow-hidden"
          >
            <div className="w-full max-w-[440px] sm:max-w-[480px] max-h-full rounded-xl border border-white/12 bg-[#141C27]/95 shadow-2xl overflow-hidden flex flex-col">
              <div className="shrink-0 border-b border-white/8 bg-[#101720] px-2.5 py-1 flex items-center justify-between text-responsive-sm">
                <span className="inline-flex items-center gap-1.5 text-amber-300 font-bold truncate">
                  <DoorOpen className="w-3 h-3 text-amber-400 shrink-0" />
                  {bi(
                    'Kapı zili çaldı · Müşteri tezgaha geldi',
                    'Doorbell chimed · Customer approached counter'
                  )}
                </span>
                <span className="font-mono text-slate-400 tabular-nums shrink-0">
                  #{queueIndex + 1} / {queueTotal}
                </span>
              </div>

              <div className="flex-1 min-h-0 overflow-hidden p-2 [@media(min-height:560px)]:p-2.5 flex flex-row items-center gap-2 sm:gap-2.5">
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

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5 text-responsive-sm">
                    <span className="font-bold text-emerald-300">{roleText}</span>
                    <span className="text-white/25">·</span>
                    <span className="text-slate-400">{archetype.title}</span>
                    {encounter.isRegular && (
                      <span className="rounded bg-amber-500/20 px-1.5 py-0.2 font-bold text-amber-300">
                        {bi('Müdavim ★', 'Regular ★')}
                      </span>
                    )}
                  </div>

                  <h2 className="font-display text-responsive-title font-extrabold text-slate-50 leading-tight">
                    {bi(
                      `${encounter.customerName} içeri girdi`,
                      `${encounter.customerName} walked in`
                    )}
                  </h2>

                  <div className="rounded-lg border border-amber-400/20 bg-[#1C2634] px-2 py-1 text-responsive text-slate-100 leading-snug break-words">
                    “{localizeDynamicLine(encounter.messages[0]?.text ?? '', lang)}”
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-responsive-sm text-slate-400 tabular-nums">
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
                <div className="hidden sm:flex shrink-0 rounded-xl border border-white/10 bg-[#0E141D] p-1.5 items-center justify-center gap-1">
                  {encounter.type === 'ACCESSORY_BUYER' &&
                  encounter.accessoryOrder &&
                  encounter.accessoryOrder[0] ? (
                    <AccessoryProductArt
                      id={encounter.accessoryOrder[0].id}
                      className="w-10 h-10"
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
                          className="w-8 h-12"
                        />
                      ))}
                    </div>
                  ) : encounter.type === 'TRADE_IN' && encounter.tradeInDevice ? (
                    <div className="flex items-center gap-1">
                      <PhoneModelThumb
                        device={encounter.tradeInDevice}
                        showBack
                        className="w-8 h-12"
                      />
                      <ArrowLeftRight className="w-3 h-3 text-sky-400 shrink-0" />
                      <PhoneModelThumb
                        device={encounter.device}
                        showBack
                        className="w-8 h-12"
                      />
                    </div>
                  ) : (
                    <PhoneModelThumb
                      device={encounter.device}
                      showBack
                      className="w-9 h-16"
                    />
                  )}
                </div>
              </div>

              <div className="shrink-0 border-t border-white/10 bg-[#1B1713]/92 px-2.5 py-1 flex items-center justify-between gap-2">
                <span className="text-responsive-sm text-amber-200/85 truncate">
                  {bi(
                    'Cihazı tezgaha alıp incele ve pazarlığa başla.',
                    'Place the device on the counter to inspect and negotiate.'
                  )}
                </span>
                <button
                  type="button"
                  onClick={handlePlaceOnDesk}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1 text-responsive font-extrabold text-slate-950 hover:bg-amber-400 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5" />
                  {bi('Tezgaha Al', 'Place on Counter')}
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* 3-COLUMN WORKBENCH (STACKS CLEANLY ON PORTRAIT PHONES, ZERO-SCROLL ON LANDSCAPE/TABLET) */
          <motion.div
            key={`desk_${encounter.id}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16 }}
            className="relative z-10 flex-1 h-full min-h-0 grid grid-cols-12 gap-1.5 [@media(min-height:560px)]:gap-2 p-1.5 [@media(min-height:560px)]:p-2 overflow-hidden"
          >
            {/* COLUMN 1: CUSTOMER, MOOD/PATIENCE & CHAT (4 cols) */}
            <section className="col-span-4 flex flex-col min-h-0 h-full rounded-xl border border-white/10 bg-[#151D28] p-1.5 [@media(min-height:560px)]:p-2 gap-1 [@media(min-height:560px)]:gap-1.5 overflow-hidden">
              {/* Avatar + Name + Patience */}
              <div className="shrink-0 flex items-center gap-2 border-b border-white/8 pb-1 [@media(min-height:560px)]:pb-1.5">
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
                    <span className="text-responsive font-extrabold text-slate-50 truncate">
                      {encounter.customerName}
                    </span>
                    <span className="text-responsive-sm font-bold text-amber-300 shrink-0">
                      {roleText}
                    </span>
                  </div>
                  <div className="text-responsive-sm text-slate-400 truncate">
                    {archetype.title}
                  </div>
                  {/* Patience Mini Bar */}
                  <div className="mt-0.5 [@media(min-height:560px)]:mt-1 space-y-0.5">
                    <div className="flex justify-between text-responsive-sm tabular-nums">
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
              <div className="shrink-0 rounded-lg border border-white/8 bg-[#0E141D] px-2 py-0.5 [@media(min-height:560px)]:px-2.5 [@media(min-height:560px)]:py-1 space-y-0.5">
                <div className="flex items-center justify-between gap-1.5 text-responsive-sm">
                  <span className="inline-flex items-center gap-1 font-bold text-slate-100 truncate">
                    <span className="text-xs leading-none">{moodInfo.emoji}</span>
                    <span>{moodInfo.simpleLabel}</span>
                    <span className="text-slate-400 font-normal hidden lg:inline">
                      · {moodInfo.label}
                    </span>
                  </span>
                  <span className="font-mono text-responsive-sm text-amber-300 font-bold tabular-nums shrink-0">
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

              {/* Chat Log — Contained Internal Scroll, Full Message Text Without Clipping */}
              <div
                ref={chatScrollRef}
                className="flex-1 min-h-0 overflow-y-auto pasaj-scroll overscroll-contain touch-pan-y pr-0.5"
              >
                <div className="min-h-full flex flex-col justify-end gap-1">
                  {encounter.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`shrink-0 rounded-lg px-2 py-1 [@media(min-height:560px)]:px-2.5 [@media(min-height:560px)]:py-1.5 text-responsive leading-snug break-words whitespace-pre-wrap ${
                        msg.speaker === 'player'
                          ? 'ml-3 bg-amber-500/14 border border-amber-400/25 text-amber-100'
                          : msg.tone === 'positive'
                          ? 'mr-1.5 bg-emerald-500/12 border border-emerald-400/25 text-emerald-100'
                          : msg.tone === 'danger'
                          ? 'mr-1.5 bg-rose-500/12 border border-rose-400/25 text-rose-100'
                          : 'mr-1.5 bg-[#1D2736] border border-white/8 text-slate-100'
                      }`}
                    >
                      {localizeDynamicLine(msg.text, lang)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Archetype Trait Tip */}
              <div className="shrink-0 rounded-lg bg-[#0E141D] border border-white/6 px-2 py-0.5 [@media(min-height:560px)]:px-2.5 [@media(min-height:560px)]:py-1 text-responsive-sm text-slate-300 truncate">
                <strong className="text-amber-300">{bi('İpucu', 'Tip')}:</strong>{' '}
                {archetype.traitSummary}
              </div>
            </section>

            {/* COLUMN 2: INTERACTIVE PHONE MODEL VISUAL & INSPECTION MAT (4 cols) */}
            <section
              data-tour="tour-inspect"
              className="col-span-4 flex flex-col min-h-0 h-full rounded-xl border border-white/10 bg-[#151D28] p-1.5 sm:p-2 gap-1 overflow-hidden"
            >
              {encounter.type === 'ACCESSORY_BUYER' && encounter.accessoryOrder ? (
                <div className="flex-1 h-full min-h-0 flex flex-col gap-1.5 overflow-hidden">
                  <div className="shrink-0 flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 text-responsive font-extrabold text-emerald-300">
                      <ShoppingBag className="w-4 h-4" />
                      {bi('Aksesuar Sepeti', 'Accessory Basket')}
                    </div>
                    <span className="text-responsive-sm text-slate-400">
                      {encounter.accessoryOrder.length} {bi('ürün', 'items')}
                    </span>
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden flex flex-col gap-1">
                    {encounter.accessoryOrder.map((line) => (
                      <div
                        key={line.id}
                        className="shrink-0 rounded-xl border border-white/10 bg-[#0E141D] px-2.5 py-1.5 flex items-center gap-2.5 tabular-nums"
                      >
                        <div className="w-10 h-10 rounded-lg bg-[#151F2C] border border-white/8 p-1 flex items-center justify-center shrink-0">
                          <AccessoryProductArt id={line.id} className="w-full h-full" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-responsive font-bold text-slate-100 truncate">
                            {getLocalizedAccessory(line.id, lang).name}
                          </div>
                          <div className="text-responsive-sm text-slate-400">
                            {line.quantity} × {formatTRY(line.unitPrice)}
                          </div>
                        </div>
                        <span className="font-mono text-responsive text-amber-300 font-extrabold shrink-0">
                          {formatTRY(line.quantity * line.unitPrice)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="shrink-0 rounded-lg bg-[#0E141D] border border-white/6 px-2.5 py-1.5 text-responsive-sm text-slate-400 text-center">
                    {bi(
                      'Müşteri reyon etiketinden nakit almaya hazır.',
                      'Customer is ready to pay full shelf tag price.'
                    )}
                  </div>
                </div>
              ) : encounter.type === 'BULK_AUCTION' && encounter.bundleDevices ? (
                <div className="flex-1 h-full min-h-0 flex flex-col gap-1.5 overflow-hidden">
                  <div className="shrink-0 inline-flex items-center gap-1.5 text-responsive font-extrabold text-amber-300">
                    <Package className="w-4 h-4" />
                    {bi('2’li Kapalı Toptancı Kolisi', '2-Unit Sealed Mystery Box')}
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden grid grid-cols-2 gap-1.5">
                    {encounter.bundleDevices.map((d, idx) => (
                      <div
                        key={d.uid}
                        className="rounded-xl border border-amber-400/20 bg-[#0E141D] p-1.5 flex flex-col items-center justify-between text-center min-h-0 overflow-hidden"
                      >
                        <span className="font-mono text-responsive-sm font-bold text-amber-300">
                          #{idx + 1} · {bi('Kapalı', 'Sealed')}
                        </span>
                        <div className="flex-1 min-h-0 flex items-center justify-center py-1">
                          <PhoneModelThumb
                            device={d}
                            showBack
                            className="h-full max-h-24 w-auto"
                          />
                        </div>
                        <div className="w-full">
                          <div className="text-responsive font-extrabold text-slate-100 truncate">
                            {d.brand} {d.model}
                          </div>
                          <div className="text-responsive-sm text-slate-400">
                            {d.storage}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="shrink-0 rounded-lg bg-[#0E141D] border border-white/6 px-2.5 py-1.5 text-responsive-sm text-slate-400 text-center">
                    {bi(
                      'Koli açılmadan alınır — içeride temiz cihaz da çıkabilir arızalı da!',
                      'Sold sight unseen — may contain clean gems or fixable defects!'
                    )}
                  </div>
                </div>
              ) : encounter.type === 'WARRANTY_CLAIM' && encounter.warrantyRecord ? (
                <div className="flex-1 h-full min-h-0 flex flex-col gap-1.5 overflow-hidden">
                  <div className="shrink-0 flex items-center justify-between gap-1">
                    <span className="inline-flex items-center gap-1.5 text-responsive font-extrabold text-rose-300">
                      <ShieldAlert className="w-4 h-4" />
                      {bi('Garanti & İade Talebi', 'Warranty Claim')}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {onOpenWarrantyCertificate && (
                        <button
                          type="button"
                          onClick={() => {
                            soundFX.playClick();
                            onOpenWarrantyCertificate(encounter.warrantyRecord!);
                          }}
                          className="inline-flex items-center gap-1 rounded-md border border-amber-400/40 bg-amber-500/15 px-2 py-0.5 text-responsive-sm font-extrabold text-amber-200 hover:bg-amber-500/25 cursor-pointer whitespace-nowrap"
                        >
                          <FileCheck2 className="w-3 h-3" />
                          {bi('Garanti Belgesi', 'Certificate')}
                        </button>
                      )}
                      <span className="font-mono text-responsive font-extrabold text-amber-300 tabular-nums">
                        {formatTRY(encounter.warrantyRecord.salePrice)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden flex flex-col gap-1">
                    <div className="shrink-0 rounded-lg border border-rose-400/40 bg-rose-500/12 px-2 py-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-1 text-responsive-sm">
                        <span className="font-bold uppercase tracking-wide text-rose-300">
                          {bi('Bildirilen Arıza', 'Reported Fault')}
                        </span>
                        <span className="font-extrabold text-rose-100 truncate">
                          {encounter.warrantyDefectId
                            ? getLocalizedDefect(encounter.warrantyDefectId, lang).name
                            : bi('Donanım Arızası', 'Hardware Fault')}
                        </span>
                      </div>
                      {encounter.warrantyFaultDetail && (
                        <p className="text-responsive-sm text-slate-200 leading-tight line-clamp-1">
                          {encounter.warrantyFaultDetail}
                        </p>
                      )}
                    </div>
                    <div className="flex-1 min-h-0 overflow-hidden">
                      <PhoneInspectSVG device={encounter.device} revealAll fluid />
                    </div>
                  </div>
                  <div className="shrink-0 rounded-lg border border-white/10 bg-[#0E141D] px-2.5 py-1 text-responsive-sm text-slate-300 text-center">
                    {bi(
                      'Ücretsiz onarım itibar kazandırır; reddetmek puan düşürür.',
                      'Free repair boosts reputation; rejecting harms shop rating.'
                    )}
                  </div>
                </div>
              ) : encounter.type === 'DATA_RECOVERY' && encounter.dataRecoveryJob ? (
                <div className="flex-1 h-full min-h-0 flex flex-col gap-1.5 overflow-hidden">
                  <div className="shrink-0 flex items-center justify-between gap-1">
                    <span className="inline-flex items-center gap-1.5 text-responsive font-extrabold text-sky-300 truncate">
                      <Database className="w-4 h-4 shrink-0" />
                      <span className="truncate">{encounter.dataRecoveryJob.title}</span>
                    </span>
                    <span className="font-mono text-responsive font-extrabold text-emerald-400 shrink-0 tabular-nums">
                      +{formatTRY(encounter.customerPrice)}
                    </span>
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                    <div className="flex-1 min-h-0 overflow-hidden">
                      <PhoneInspectSVG device={encounter.device} revealAll fluid />
                    </div>
                  </div>
                  <div className="shrink-0 rounded-lg border border-sky-400/25 bg-sky-500/10 px-2.5 py-1.5 text-responsive-sm text-slate-200 text-center">
                    {bi(
                      'Yazılım lisansı daha ekonomiktir ama risk taşır; Temiz Oda %100 garantilidir.',
                      'Software tool is cheaper but risky; Clean Room Lab guarantees 100% recovery.'
                    )}
                  </div>
                </div>
              ) : (
                /* STANDARD DEVICE INSPECTION & LIVE PHONE MODEL VISUAL */
                <>
                  {/* Compact Device Tech Header (Pinned Top) */}
                  <div className="shrink-0 rounded-lg border border-white/10 bg-[#0E141D] px-2 py-1 space-y-0.5 tabular-nums">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="min-w-0">
                        <div className="text-responsive font-extrabold text-slate-50 truncate leading-tight">
                          {inspectedTarget.brand} {inspectedTarget.model}
                        </div>
                        <div className="text-responsive-sm text-slate-400 truncate leading-tight">
                          {inspectedTarget.storage} · {condition.label} ({condition.score})
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[8.5px] text-slate-400 leading-tight">
                          {bi('Tahmini Değer', 'Est. Value')}
                        </div>
                        <div className="font-mono text-responsive font-extrabold text-amber-300 leading-tight">
                          {formatTRY(sellerAsIsVal)}
                        </div>
                      </div>
                    </div>

                    {encounter.type === 'TRADE_IN' && encounter.tradeInDevice && (
                      <div className="flex items-center gap-1 rounded bg-sky-500/15 border border-sky-400/25 px-1.5 py-0.5 text-responsive-sm font-bold text-sky-200 truncate">
                        <ArrowLeftRight className="w-2.5 h-2.5 shrink-0" />
                        {bi('İstediği', 'Wants')}: {encounter.device.brand}{' '}
                        {encounter.device.model}
                      </div>
                    )}

                    {/* Customer Fault Report ("Arıza Bildirim") Note */}
                    {encounter.customerFaultReport && (
                      <div
                        className={`rounded-md border px-1.5 py-0.5 text-responsive-sm leading-tight ${
                          encounter.customerFaultReport.honesty === 'HIDING'
                            ? 'border-amber-400/35 bg-amber-500/10 text-amber-100'
                            : 'border-rose-400/35 bg-rose-500/10 text-rose-100'
                        }`}
                      >
                        <div className="flex items-center gap-1 font-extrabold truncate">
                          <AlertTriangle className="w-2.5 h-2.5 shrink-0 text-amber-300" />
                          <span className="truncate">
                            {bi('Bildirim:', 'Report:')} {encounter.customerFaultReport.headline}
                          </span>
                        </div>
                        <p className="text-[8.5px] text-slate-200/90 line-clamp-1 italic">
                          {encounter.customerFaultReport.symptomText}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* ADAPTIVE ZERO-SCROLL MAIN CARD BODY: PHONE VISUAL + DEFECTS / HISTORY / CROSS-SELL */}
                  <div className="flex-1 min-h-0 overflow-hidden flex flex-col gap-1">
                    {/* LIVE INTERACTIVE SMARTPHONE VISUAL MODEL */}
                    <div className="relative flex-1 min-h-0 overflow-hidden">
                      <PhoneInspectSVG
                        device={inspectedTarget}
                        revealAll={
                          encounter.type === 'BUYER' ||
                          encounter.type === 'EXPRESS_REPAIR'
                        }
                        fluid
                      />
                    </div>

                    {/* SELLER / TRADE-IN: DISCOVERED DEFECTS LEVERAGE GRID */}
                    {(encounter.type === 'SELLER' ||
                      (encounter.type === 'TRADE_IN' && encounter.tradeInDevice)) &&
                      discoveredDefects.length > 0 && (
                        <div className="shrink-0 grid grid-cols-2 gap-1">
                          {discoveredDefects.map((d) => {
                            const locDef = getLocalizedDefect(d, lang);
                            const used = encounter.usedLeverageDefects.includes(d);
                            return (
                              <div
                                key={d}
                                className="rounded-lg border border-rose-400/40 bg-rose-500/14 px-1.5 py-1 flex items-center justify-between gap-1 min-w-0"
                              >
                                <span
                                  className="text-responsive-sm font-bold text-rose-100 truncate min-w-0"
                                  title={locDef.name}
                                >
                                  ⚠ {locDef.shortLabel}
                                </span>
                                <button
                                  type="button"
                                  disabled={used || encounter.outcome !== 'ACTIVE'}
                                  onClick={() => onUseLeverage(d)}
                                  className="rounded bg-rose-500 px-1.5 py-0.5 text-[8.5px] sm:text-[9px] font-extrabold text-white hover:bg-rose-400 active:scale-95 disabled:opacity-40 cursor-pointer whitespace-nowrap shrink-0 touch-manipulation"
                                >
                                  {used
                                    ? bi('OK ✓', 'Used ✓')
                                    : bi('Koz Vur', 'Leverage')}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                    {/* BUYER / TRADE-IN: TRANSPARENT DEVICE HISTORY & HONEST DISCLOSURE */}
                    {(encounter.type === 'BUYER' || encounter.type === 'TRADE_IN') && (() => {
                      const outDevice = encounter.device;
                      const repairedList = outDevice.repairedDefects ?? [];
                      const isOverseas = outDevice.defects.includes('imei_unregistered');
                      const otherDefects = outDevice.defects.filter(
                        (d) => d !== 'imei_unregistered'
                      );
                      const needsDisclosure =
                        repairedList.length > 0 || isOverseas || otherDefects.length > 0;

                      return (
                        <div className="shrink-0 rounded-lg border border-white/10 bg-[#0E141D] px-2 py-1.5 space-y-1 text-responsive-sm">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-slate-200 truncate">
                              {bi('Cihaz Geçmişi', 'Device History')}
                            </span>
                            <span
                              className={`rounded px-1 py-0.2 font-mono text-[8px] font-extrabold shrink-0 whitespace-nowrap ${
                                isOverseas
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-400/35'
                                  : 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
                              }`}
                            >
                              {isOverseas
                                ? bi('YURTDIŞI', 'OVERSEAS')
                                : bi('TR KAYITLI', 'TR IMEI')}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1">
                            {repairedList.length > 0 ? (
                              <span className="rounded bg-amber-500/15 border border-amber-400/30 px-1.5 py-0.2 text-amber-200 font-semibold truncate max-w-full">
                                {bi('Değişen:', 'Replaced:')}{' '}
                                {repairedList
                                  .map((d) => getLocalizedDefect(d, lang).shortLabel)
                                  .join(', ')}
                              </span>
                            ) : (
                              <span className="rounded bg-emerald-500/12 px-1.5 py-0.2 text-emerald-300 font-semibold">
                                {bi('Tamirsiz / Orijinal', 'Untouched / Original')}
                              </span>
                            )}
                            {outDevice.lastRepairQuality === 'ROUGH' && (
                              <span className="rounded bg-rose-500/20 px-1.5 py-0.2 text-rose-300 font-bold">
                                {bi('⚠ Kaba İşçilik', '⚠ Rough Repair')}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 pt-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                soundFX.playClick();
                                setShowEsnafReportModal(true);
                              }}
                              className="flex-1 rounded-md border border-amber-400/45 bg-amber-500/15 px-2 py-1 text-responsive-sm font-extrabold text-amber-200 hover:bg-amber-500/25 cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap"
                            >
                              <ClipboardCheck className="w-3 h-3 shrink-0" />
                              {bi('Esnaf Onarım Raporu', 'Merchant Report')}
                            </button>

                            {needsDisclosure && encounter.outcome === 'ACTIVE' && onDiscloseBuyer && (
                              encounter.buyerDisclosed ? (
                                <div className="flex items-center gap-1 text-emerald-300 font-bold shrink-0 px-1">
                                  <ShieldCheck className="w-3 h-3 shrink-0" />
                                  <span className="text-responsive-sm whitespace-nowrap">
                                    {bi('Beyan ✓', 'Disclosed ✓')}
                                  </span>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={onDiscloseBuyer}
                                  className="flex-1 rounded-md border border-sky-400/45 bg-sky-500/15 px-2 py-1 text-responsive-sm font-extrabold text-sky-200 hover:bg-sky-500/25 cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap"
                                >
                                  <ShieldCheck className="w-3 h-3 shrink-0" />
                                  {bi('Dürüst Beyan Et', 'Disclose')}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* BUYER: COMPACT CROSS-SELL ACCESSORY BAR */}
                    {encounter.type === 'BUYER' && encounter.outcome === 'ACTIVE' && (
                      <div className="shrink-0 rounded-lg border border-white/8 bg-[#0E141D] p-2 space-y-1.5">
                        <div className="flex items-center justify-between text-responsive-sm font-bold text-sky-300">
                          <span className="inline-flex items-center gap-1">
                            <ShoppingBag className="w-3 h-3" />
                            {bi('Yanına Aksesuar Öner', 'Cross-Sell Add-Ons')}
                          </span>
                          <span className="font-mono text-responsive-sm text-slate-400">
                            {encounter.crossSellAttachments?.length ?? 0}{' '}
                            {bi('eklendi', 'added')}
                          </span>
                        </div>
                        {stockedCrossSellOptions.length === 0 ? (
                          <div className="text-center text-responsive-sm text-slate-400 py-0.5">
                            {!hasAccessoryLicense(upgrades)
                              ? bi(
                                  'Aksesuar satışı için Toptan sekmesinden Aksesuar Lisansı al.',
                                  'Purchase the Accessory License in Supply to cross-sell.'
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
                                  className={`rounded-md border px-1.5 py-1 flex items-center gap-1.5 text-left text-responsive-sm font-bold transition-colors ${
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
                      <div className="shrink-0 rounded-lg border border-amber-400/30 bg-amber-500/10 px-2.5 py-1.5 flex items-center justify-between gap-2 text-responsive">
                        <span className="font-bold text-amber-200 truncate">
                          {bi('Arıza', 'Fault')}:{' '}
                          {getLocalizedDefect(encounter.expressDefectId, lang).shortLabel}
                        </span>
                        <span className="font-mono font-extrabold text-emerald-300 shrink-0">
                          +{formatTRY(encounter.customerPrice)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* PINNED BOTTOM CTA: ELLE EKSPERTİZ (SELLER / TRADE-IN) */}
                  {(encounter.type === 'SELLER' ||
                    (encounter.type === 'TRADE_IN' && encounter.tradeInDevice)) && (() => {
                    const inspectedCount = INSPECTION_ORDER.filter(
                      (cat) => inspectedTarget.inspected[cat]
                    ).length;
                    const firstPending = INSPECTION_ORDER.find(
                      (cat) => !inspectedTarget.inspected[cat]
                    );
                    return (
                      <div className="shrink-0">
                        <button
                          type="button"
                          onClick={() => openHandsOnInspect(firstPending)}
                          className={`w-full h-[28px] [@media(min-height:560px)]:h-[32px] rounded-xl border px-2 flex items-center justify-between gap-1.5 text-[10px] sm:text-[10.5px] font-extrabold transition-colors cursor-pointer touch-manipulation ${
                            all4Inspected
                              ? 'border-emerald-400/40 bg-emerald-500/12 text-emerald-200 hover:bg-emerald-500/20'
                              : 'border-amber-400/60 bg-amber-500/18 text-amber-200 hover:bg-amber-500/28 shadow-sm'
                          }`}
                        >
                          <span className="inline-flex items-center gap-1 min-w-0">
                            {all4Inspected ? (
                              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                            ) : (
                              <Search className="w-3 h-3 text-amber-400 shrink-0" />
                            )}
                            <span className="truncate">
                              {all4Inspected
                                ? bi('Ekspertiz Tamam', 'Inspected')
                                : bi('Elle Ekspertiz', 'Hands-On Inspect')}
                            </span>
                          </span>
                          <span className="inline-flex items-center gap-1 shrink-0">
                            <span className="inline-flex items-center gap-0.5">
                              {INSPECTION_ORDER.map((cat) => {
                                const done = inspectedTarget.inspected[cat];
                                const hasFault = inspectedTarget.defects.some(
                                  (d) => DEFECT_CATALOG[d].category === cat
                                );
                                return (
                                  <span
                                    key={cat}
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      !done
                                        ? 'bg-white/20'
                                        : hasFault
                                        ? 'bg-rose-400'
                                        : 'bg-emerald-400'
                                    }`}
                                  />
                                );
                              })}
                            </span>
                            <span className="font-mono text-[9.5px] opacity-90">
                              {inspectedCount}/4
                            </span>
                          </span>
                        </button>
                      </div>
                    );
                  })()}
                </>
              )}
            </section>

            {/* COLUMN 3: STRUCTURED NEGOTIATION / RESOLUTION DECK (4 cols) */}
            <section
              data-tour="tour-negotiate"
              className="col-span-4 flex flex-col min-h-0 h-full rounded-xl border border-white/10 bg-[#151D28] p-1.5 [@media(min-height:560px)]:p-2 gap-1 [@media(min-height:560px)]:gap-1.5 overflow-hidden"
            >
              {encounter.outcome !== 'ACTIVE' ? (
                /* DEAL / WALKED OUT / DISMISSED OUTCOME CARD */
                <div className="flex-1 h-full min-h-0 flex flex-col overflow-hidden">
                  <div className="flex-1 min-h-0 overflow-hidden flex flex-col items-center justify-center text-center gap-1.5 p-1.5">
                    <div
                      className={`animate-stamp-pop rounded-xl border-2 px-3 py-1 font-display text-responsive-title font-extrabold tracking-wide ${
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
                      <div className="font-mono text-responsive-title font-extrabold text-slate-50 tabular-nums">
                        {formatTRY(encounter.finalPrice ?? encounter.customerPrice)}
                      </div>
                    )}

                    <p className="text-responsive text-slate-300 max-w-xs">
                      {encounter.outcome === 'DEAL_CLOSED'
                        ? encounter.type === 'SELLER' ||
                          encounter.type === 'TRADE_IN' ||
                          encounter.type === 'BULK_AUCTION'
                          ? bi(
                              'Cihaz atölyene eklendi. Tamir edip vitrine koyabilirsin.',
                              'Device added to workshop. Repair and list it on your showcase!'
                            )
                          : bi(
                              'Satış kasaya işlendi!',
                              'Sale booked to your register!'
                            )
                        : bi(
                            'Bu müşteriyle anlaşma olmadı. Sıradaki müşteri seni bekliyor.',
                            'No deal this time. Next customer is waiting.'
                          )}
                    </p>
                  </div>

                  <div className="shrink-0 w-full flex flex-col gap-1.5 pt-1">
                    {((encounter.outcome === 'DEAL_CLOSED' &&
                      Boolean(encounter.deliveredCertificateId) &&
                      Boolean(onOpenCertificateById)) ||
                      ((encounter.type === 'SELLER' ||
                        encounter.type === 'TRADE_IN' ||
                        encounter.type === 'BULK_AUCTION') &&
                        encounter.outcome === 'DEAL_CLOSED')) && (
                      <div className="flex items-center gap-1.5 w-full">
                        {encounter.outcome === 'DEAL_CLOSED' &&
                          encounter.deliveredCertificateId &&
                          onOpenCertificateById && (
                            <button
                              type="button"
                              onClick={() => {
                                soundFX.playClick();
                                onOpenCertificateById(encounter.deliveredCertificateId!);
                              }}
                              className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-amber-400/45 bg-amber-500/15 py-1.5 px-1.5 text-[10px] font-extrabold text-amber-200 hover:bg-amber-500/25 cursor-pointer whitespace-nowrap min-w-0"
                            >
                              <FileCheck2 className="w-3 h-3 shrink-0" />
                              <span className="truncate">{bi('Garanti Belgesi', 'Warranty')}</span>
                            </button>
                          )}
                        {(encounter.type === 'SELLER' ||
                          encounter.type === 'TRADE_IN' ||
                          encounter.type === 'BULK_AUCTION') &&
                          encounter.outcome === 'DEAL_CLOSED' && (
                            <button
                              type="button"
                              onClick={onGoToWorkshop}
                              className="flex-1 rounded-lg border border-white/15 bg-[#1D2634] py-1.5 px-1.5 text-[10px] font-bold text-slate-100 hover:bg-[#273345] cursor-pointer whitespace-nowrap min-w-0"
                            >
                              {bi('Atölye', 'Workshop')}
                            </button>
                          )}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={onNextCustomer}
                      className="w-full rounded-lg bg-amber-500 py-2 px-2 text-responsive font-extrabold text-slate-950 hover:bg-amber-400 cursor-pointer whitespace-nowrap"
                    >
                      {bi('Sıradaki Müşteri →', 'Next Customer →')}
                    </button>
                  </div>
                </div>
              ) : isNegotiable ? (
                /* ACTIVE NEGOTIATION DECK — PINNED HEADER & FOOTER, SCROLLABLE CARD BODY */
                <>
                  {/* Block 1 (Pinned Top): Customer Ask + Resistance Meter */}
                  <div className="shrink-0 rounded-xl border border-white/10 bg-[#0E141D] px-2 py-1 space-y-0.5 tabular-nums">
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <span className="text-responsive-sm font-semibold text-slate-300 truncate">
                        {encounter.type === 'SELLER'
                          ? bi('Satıcı İstediği', 'Seller Asks')
                          : encounter.type === 'TRADE_IN'
                          ? bi('Önerdiği Fark', 'Cash Diff')
                          : bi('Alıcı Teklifi', 'Buyer Offers')}
                      </span>
                      <span className="font-mono text-responsive font-extrabold text-amber-300 whitespace-nowrap shrink-0">
                        {formatTRY(encounter.customerPrice)}
                      </span>
                    </div>

                    {resistance && (
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between gap-2 text-responsive-sm leading-tight">
                          <span className="text-slate-300 truncate">
                            {resistance.resistanceLabel}
                          </span>
                          <span className="font-mono font-bold text-amber-300 shrink-0">
                            %{resistance.resistancePct}
                          </span>
                        </div>
                        <div className="h-1 rounded-full bg-white/10 overflow-hidden">
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

                  {/* Zero-Scroll Negotiation Controls Area */}
                  <div className="flex-1 min-h-0 overflow-hidden flex flex-col justify-between gap-1 [@media(min-height:560px)]:gap-1.5">
                    {/* Block 2: Esnaf Tactics Row */}
                    <div className="shrink-0 grid grid-cols-3 gap-1">
                      <button
                        type="button"
                        disabled={encounter.teaServed || cash < teaCost}
                        onClick={() => {
                          triggerEsnafProverb('friendly', TEA_PROVERBS);
                          onServeTea();
                        }}
                        className="h-[26px] [@media(min-height:560px)]:h-[32px] inline-flex items-center justify-center gap-1 rounded-lg border border-amber-400/35 bg-amber-500/14 px-1 text-responsive-sm font-extrabold text-amber-200 hover:bg-amber-500/24 disabled:opacity-35 cursor-pointer whitespace-nowrap truncate touch-manipulation"
                      >
                        <Coffee className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                          {encounter.teaServed
                            ? bi('Çay ✓', 'Tea ✓')
                            : teaCost === 0
                            ? bi('Çay 0₺', 'Tea 0₺')
                            : bi(`Çay ${teaCost}₺`, `Tea ${teaCost}₺`)}
                        </span>
                      </button>

                      <button
                        type="button"
                        disabled={
                          encounter.bluffUsed || encounter.honestPitchUsed
                        }
                        onClick={() => {
                          triggerEsnafProverb(
                            encounter.type === 'SELLER' ? 'firm' : 'friendly'
                          );
                          onBluffOrPitch();
                        }}
                        className="h-[26px] [@media(min-height:560px)]:h-[32px] inline-flex items-center justify-center gap-1 rounded-lg border border-sky-400/35 bg-sky-500/14 px-1 text-responsive-sm font-extrabold text-sky-200 hover:bg-sky-500/24 disabled:opacity-35 cursor-pointer whitespace-nowrap truncate touch-manipulation"
                      >
                        <Scale className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                          {encounter.type === 'SELLER'
                            ? bi('Blöf Yap', 'Bluff')
                            : bi('Övgü Yap', 'Pitch')}
                        </span>
                      </button>

                      {encounter.type === 'BUYER' && hasSmartPos ? (
                        <button
                          type="button"
                          onClick={onAcceptPosInstallment}
                          className="h-[26px] [@media(min-height:560px)]:h-[32px] inline-flex items-center justify-center gap-1 rounded-lg border border-emerald-400/35 bg-emerald-500/15 px-1 text-responsive-sm font-extrabold text-emerald-200 hover:bg-emerald-500/25 cursor-pointer whitespace-nowrap truncate touch-manipulation"
                        >
                          <CreditCard className="w-3 h-3 shrink-0" />
                          <span className="truncate">{bi('0% POS', '0% POS')}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={encounter.legacyDialogueUsed}
                          onClick={() => {
                            triggerEsnafProverb(selectedTone);
                            onUseLegacyDialogue();
                          }}
                          className="h-[26px] [@media(min-height:560px)]:h-[32px] inline-flex items-center justify-center gap-1 rounded-lg border border-purple-400/35 bg-purple-500/14 px-1 text-responsive-sm font-extrabold text-purple-200 hover:bg-purple-500/24 disabled:opacity-35 cursor-pointer whitespace-nowrap truncate touch-manipulation"
                          title={legacyInfo.title}
                        >
                          <Award className="w-3 h-3 shrink-0" />
                          <span className="truncate">{bi('Esnaf Sözü', 'Perk Line')}</span>
                        </button>
                      )}
                    </div>

                    {/* Block 3: Slider + Ergonomic Quick Adjust Buttons */}
                    <div className="shrink-0 rounded-xl border border-white/8 bg-[#0E141D] px-2 py-1 [@media(min-height:560px)]:py-1.5 tabular-nums">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-responsive-sm font-semibold text-slate-400 truncate">
                          {bi('Senin Teklifin', 'Your Offer')}
                        </span>
                        <span className="font-mono text-responsive font-extrabold text-slate-50 whitespace-nowrap shrink-0">
                          {formatTRY(offerPrice)}
                        </span>
                      </div>
                      <div className="mb-1 pb-1 [@media(min-height:560px)]:mb-1.5 [@media(min-height:560px)]:pb-1.5 border-b border-white/8">
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
                          className="pasaj-slider w-full touch-pan-x"
                        />
                      </div>
                      <div className="grid grid-cols-4 gap-1 font-mono text-responsive-sm">
                        {[-1000, -250, 250, 1000].map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => adjustOffer(d)}
                            className={`h-[26px] [@media(min-height:560px)]:h-[32px] rounded-lg border font-extrabold transition-all active:scale-95 cursor-pointer touch-manipulation ${
                              d < 0
                                ? 'bg-[#17202D] border-white/12 text-slate-100 hover:bg-[#223044] active:bg-rose-500/20'
                                : 'bg-[#17202D] border-white/12 text-slate-100 hover:bg-[#223044] active:bg-emerald-500/20'
                            }`}
                          >
                            {d > 0 ? `+${d}` : d}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Block 4: Valuation & Profit Strip */}
                    <div className="shrink-0 rounded-xl border border-white/8 bg-[#0E141D] px-2 py-1 text-responsive-sm leading-tight space-y-0.5 tabular-nums">
                      {encounter.type === 'SELLER' ? (
                        <>
                          <div className="flex items-center justify-between gap-1.5 min-w-0">
                            <span className="text-slate-400 truncate">
                              {bi('Haliyle / Tamirli', 'As-Is / Fixed')}
                            </span>
                            <span className="font-mono text-slate-200 whitespace-nowrap shrink-0">
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
                              <div className="flex items-center justify-between gap-1.5 min-w-0 border-t border-white/6 pt-0.5">
                                <span className="text-slate-300 font-semibold truncate">
                                  {bi('Tahmini Net Kâr', 'Est. Net Profit')}
                                </span>
                                <span
                                  className={`font-mono font-extrabold whitespace-nowrap shrink-0 ${
                                    netAfterRepair >= 0
                                      ? 'text-emerald-400'
                                      : 'text-rose-400'
                                  }`}
                                >
                                  {netAfterRepair >= 0 ? '+' : ''}
                                  {formatTRY(netAfterRepair)}
                                  {netAfterRepair < 0
                                    ? bi(' · ZARAR', ' · LOSS')
                                    : ''}
                                </span>
                              </div>
                            );
                          })()}
                        </>
                      ) : encounter.type === 'TRADE_IN' && encounter.tradeInDevice ? (
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between gap-1.5 min-w-0">
                            <span className="text-slate-400 truncate">
                              {bi('Verilen / Takas', 'Yours / Trade-In')}
                            </span>
                            <span className="font-mono text-slate-200 whitespace-nowrap shrink-0">
                              {formatTRY(encounter.device.askingPrice)} /{' '}
                              <strong className="text-sky-300">
                                ~{formatTRY(valuation.asIsValue)}
                              </strong>
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-1.5 min-w-0 border-t border-white/6 pt-0.5">
                            <span className="text-slate-300 font-semibold truncate">
                              {bi('Nakit + Takas', 'Cash + Trade')}
                            </span>
                            <span className="font-mono font-extrabold text-emerald-300 whitespace-nowrap shrink-0">
                              +{formatTRY(offerPrice)} ({formatTRY(offerPrice + Math.round(valuation.asIsValue * 0.85))})
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-1.5 min-w-0">
                          <span className="text-slate-400 truncate">
                            {bi('Etiket / Maliyet', 'Tag / Cost')}
                          </span>
                          <span className="font-mono text-slate-200 whitespace-nowrap shrink-0">
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

                  {/* Block 5 (Pinned Bottom Footer): Primary CTA + Accept / Pass */}
                  <div className="shrink-0 space-y-1.5 tabular-nums">
                    <button
                      type="button"
                      disabled={encounter.type === 'SELLER' && offerPrice > cash}
                      onClick={handleOfferClick}
                      className="w-full h-[34px] [@media(min-height:560px)]:h-[38px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 text-responsive font-extrabold text-slate-950 hover:bg-amber-400 active:scale-[0.99] transition-transform disabled:opacity-35 cursor-pointer whitespace-nowrap touch-manipulation"
                    >
                      <Handshake className="w-3.5 h-3.5 [@media(min-height:560px)]:w-4 [@media(min-height:560px)]:h-4" />
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
                        className="h-[30px] [@media(min-height:560px)]:h-[34px] rounded-lg border border-emerald-400/35 bg-emerald-500/15 text-responsive font-bold text-emerald-200 hover:bg-emerald-500/25 active:scale-[0.98] transition-transform disabled:opacity-35 cursor-pointer whitespace-nowrap truncate px-1.5 touch-manipulation"
                      >
                        ✓ {bi('Kabul', 'Accept')} ({formatTRY(encounter.customerPrice)})
                      </button>
                      <button
                        type="button"
                        onClick={onDismiss}
                        className="h-[30px] [@media(min-height:560px)]:h-[34px] rounded-lg border border-white/12 bg-[#1D2634] text-responsive font-bold text-slate-300 hover:text-white active:scale-[0.98] transition-transform cursor-pointer whitespace-nowrap touch-manipulation"
                      >
                        {bi('Kalsın', 'Pass')}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* SPECIAL ENCOUNTER ACTION DECKS (Zero-Scroll Compact Fit) */
                <div className="flex-1 min-h-0 overflow-hidden flex flex-col justify-center gap-1.5">
                  {encounter.type === 'ACCESSORY_BUYER' && (
                    <>
                      <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-2.5 text-center">
                        <div className="text-responsive-sm text-emerald-200">
                          {bi('Sepet Toplamı', 'Basket Total')}
                        </div>
                        <div className="font-mono text-responsive-title font-extrabold text-emerald-300">
                          {formatTRY(encounter.customerPrice)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={onCompleteAccessoryOrder}
                        className="w-full rounded-xl bg-emerald-500 py-2 text-responsive font-extrabold text-slate-950 hover:bg-emerald-400 cursor-pointer"
                      >
                        ✓ {bi('Kasadan Geç & Sat', 'Ring Up & Sell')}
                      </button>
                    </>
                  )}

                  {encounter.type === 'EXPRESS_REPAIR' && (() => {
                    const partCost = encounter.expressPartCost ?? 0;
                    const expressFee = getQuickRepairExpressFee(partCost);
                    const quickTotal = partCost + expressFee;
                    return (
                      <>
                        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-2.5 text-center tabular-nums">
                          <div className="text-responsive-sm text-amber-200">
                            {bi('Acil Servis Ücreti', 'Express Payout')}
                          </div>
                          <div className="font-mono text-responsive-title font-extrabold text-emerald-300">
                            +{formatTRY(encounter.customerPrice)}
                          </div>
                          <div className="text-responsive-sm text-slate-300 mt-0.5">
                            {bi('Parça Maliyeti', 'Part Cost')}: {formatTRY(partCost)}
                          </div>
                        </div>
                        <div className="space-y-1.5 tabular-nums">
                          {hasRepairBench && (
                            <button
                              type="button"
                              disabled={cash < partCost}
                              onClick={onExpressRepairMini}
                              className="w-full rounded-xl bg-amber-500 py-1.5 px-2 text-center text-slate-950 hover:bg-amber-400 disabled:opacity-35 cursor-pointer"
                            >
                              <div className="inline-flex items-center justify-center gap-1 text-responsive font-extrabold">
                                <Zap className="w-3.5 h-3.5" />
                                {bi('Kendin Onar (Mini Tamir)', 'Fix Yourself (Mini Repair)')} · {formatTRY(partCost)}
                              </div>
                              <div className="text-responsive-sm font-bold text-slate-900/80">
                                {bi('Sadece parça + bahşiş şansı', 'Parts only + tip bonus')}
                              </div>
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={cash < quickTotal}
                            onClick={onExpressRepairQuick}
                            className="w-full rounded-xl bg-emerald-500 py-1.5 px-2 text-center text-slate-950 hover:bg-emerald-400 disabled:opacity-35 cursor-pointer"
                          >
                            <div className="inline-flex items-center justify-center gap-1 text-responsive font-extrabold">
                              <Wrench className="w-3.5 h-3.5" />
                              {bi('Hızlı Onar', 'Quick Repair')} · {formatTRY(quickTotal)}
                            </div>
                            <div className="text-responsive-sm font-bold text-slate-900/80">
                              +{formatTRY(expressFee)} {bi('Erken Teslimat Ücreti', 'Express Delivery Fee')}
                            </div>
                          </button>
                          {hasMasterTech && (
                            <button
                              type="button"
                              disabled={cash < partCost}
                              onClick={onDelegateExpressRepair}
                              className="w-full inline-flex items-center justify-center gap-1 rounded-xl border border-sky-400/35 bg-sky-500/15 py-1.5 text-responsive font-bold text-sky-200 cursor-pointer"
                            >
                              <UserCog className="w-3.5 h-3.5" />
                              {bi('Hasan Ustaya Devret', 'Delegate to Master Hasan')} ({formatTRY(partCost)})
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={onDismiss}
                            className="w-full rounded-lg border border-white/10 bg-[#1D2634] py-1.5 text-responsive font-bold text-slate-300 cursor-pointer"
                          >
                            {bi('Reddet', 'Decline')}
                          </button>
                        </div>
                      </>
                    );
                  })()}

                  {encounter.type === 'BULK_AUCTION' && (
                    <>
                      <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-2.5 text-center">
                        <div className="text-responsive-sm text-amber-200">
                          {bi('Koli Fiyatı', 'Lot Price')}
                        </div>
                        <div className="font-mono text-responsive-title font-extrabold text-amber-300">
                          {formatTRY(encounter.customerPrice)}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <button
                          type="button"
                          disabled={cash < encounter.customerPrice}
                          onClick={onAcceptBulkAuction}
                          className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-2 text-responsive font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-35 cursor-pointer"
                        >
                          <Gavel className="w-3.5 h-3.5" />
                          {bi('Koliyi Satın Al', 'Buy Mystery Lot')}
                        </button>
                        <button
                          type="button"
                          onClick={onDismiss}
                          className="w-full rounded-lg border border-white/10 bg-[#1D2634] py-1.5 text-responsive font-bold text-slate-300 cursor-pointer"
                        >
                          {bi('Risk Alma · Geç', 'Skip Lot')}
                        </button>
                      </div>
                    </>
                  )}

                  {encounter.type === 'WARRANTY_CLAIM' && (() => {
                    const repairCost =
                      encounter.warrantyRepairCost ?? encounter.customerPrice;
                    const refundCost = encounter.warrantyRefundCost ?? 1500;
                    return (
                      <div className="space-y-2 tabular-nums">
                        <button
                          type="button"
                          disabled={cash < repairCost}
                          onClick={() => onResolveWarranty('REPAIR')}
                          className="w-full rounded-xl bg-emerald-500 py-2 text-responsive font-extrabold text-slate-950 hover:bg-emerald-400 disabled:opacity-35 cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
                          {bi('Ücretsiz Onar', 'Free Repair')} ({formatTRY(repairCost)})
                        </button>
                        <button
                          type="button"
                          disabled={cash < refundCost}
                          onClick={() => onResolveWarranty('REFUND')}
                          className="w-full rounded-xl border border-amber-400/35 bg-amber-500/15 py-2 text-responsive font-bold text-amber-200 hover:bg-amber-500/25 disabled:opacity-35 cursor-pointer"
                        >
                          {bi('Kısmi Nakit İade', 'Partial Cash Refund')} ({formatTRY(refundCost)})
                        </button>
                        <button
                          type="button"
                          onClick={() => onResolveWarranty('REJECT')}
                          className="w-full rounded-xl border border-rose-500/35 bg-rose-500/15 py-1.5 text-responsive font-bold text-rose-200 hover:bg-rose-500/25 cursor-pointer"
                        >
                          {bi('Reddet (-İtibar)', 'Reject (-Rep)')}
                        </button>
                      </div>
                    );
                  })()}

                  {encounter.type === 'DATA_RECOVERY' && encounter.dataRecoveryJob && (() => {
                    const swCost = encounter.dataRecoveryJob.softwareCost || 850;
                    const swPct = Math.round(
                      encounter.dataRecoveryJob.softwareSuccessRate * 100
                    );
                    return (
                      <div className="space-y-2 tabular-nums">
                        <button
                          type="button"
                          disabled={cash < swCost}
                          onClick={() => {
                            soundFX.playClick();
                            setShowSoftwareRecoveryModal(true);
                          }}
                          className="w-full min-h-[34px] rounded-xl bg-sky-500 py-2 px-3 text-responsive font-extrabold text-slate-950 hover:bg-sky-400 active:scale-[0.98] disabled:opacity-35 transition-all cursor-pointer touch-manipulation"
                        >
                          {bi(
                            `Yazılımla Kurtar — İşlemi Başlat (${formatTRY(swCost)} · %${swPct})`,
                            `Software Recovery — Start Tool (${formatTRY(swCost)} · ${swPct}%)`
                          )}
                        </button>
                        <button
                          type="button"
                          disabled={cash < encounter.dataRecoveryJob.cleanRoomCost}
                          onClick={() => onResolveDataRecovery('CLEAN_ROOM')}
                          className="w-full min-h-[34px] rounded-xl bg-emerald-500 py-2 px-3 text-responsive font-extrabold text-slate-950 hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-35 transition-all cursor-pointer touch-manipulation"
                        >
                          {bi(
                            `Temiz Oda Lab (%100 · ${formatTRY(encounter.dataRecoveryJob.cleanRoomCost)})`,
                            `Clean Room Lab (100% · ${formatTRY(encounter.dataRecoveryJob.cleanRoomCost)})`
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={onDismiss}
                          className="w-full min-h-[32px] rounded-lg border border-white/10 bg-[#1D2634] py-1.5 text-responsive font-bold text-slate-300 hover:bg-[#253244] cursor-pointer touch-manipulation"
                        >
                          {bi('İade Et · Geç', 'Decline')}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PHYSICAL HANDS-ON INSPECTION WORKBENCH MODAL */}
      {showLoupeModal &&
        (encounter.type === 'SELLER' ||
          (encounter.type === 'TRADE_IN' && Boolean(encounter.tradeInDevice))) && (
          <PhysicalInspectModal
            device={inspectedTarget}
            initialCategory={loupeInitialCategory}
            onInspectZone={(cat) => onInspect(cat, true)}
            onPhysicalCompleteBonus={onPhysicalInspectBonus}
            onClose={() => {
              setShowLoupeModal(false);
              setLoupeInitialCategory(undefined);
            }}
          />
        )}

      {/* INTERACTIVE SOFTWARE DATA RECOVERY MODAL */}
      {showSoftwareRecoveryModal &&
        encounter.type === 'DATA_RECOVERY' &&
        encounter.dataRecoveryJob && (
          <SoftwareRecoveryModal
            device={encounter.device}
            job={encounter.dataRecoveryJob}
            softwareCost={encounter.dataRecoveryJob.softwareCost || 850}
            onCancel={() => setShowSoftwareRecoveryModal(false)}
            onComplete={(succeeded) => {
              setShowSoftwareRecoveryModal(false);
              onResolveDataRecovery('SOFTWARE', succeeded);
            }}
          />
        )}
      {/* ESNAF ONARIM & ORİJİNALLİK RAPORU DIALOG (BUYER / TRADE-IN) */}
      {showEsnafReportModal &&
        encounter &&
        (encounter.type === 'BUYER' || encounter.type === 'TRADE_IN') && (
          <EsnafReportModal
            device={encounter.device}
            customerName={encounter.customerName}
            alreadyDisclosed={Boolean(encounter.buyerDisclosed)}
            canDisclose={
              encounter.outcome === 'ACTIVE' &&
              Boolean(onDiscloseBuyer) &&
              ((encounter.device.repairedDefects?.length ?? 0) > 0 ||
                encounter.device.defects.length > 0 ||
                encounter.device.imeiStatus === 'UNREGISTERED_OVERSEAS')
            }
            onDiscloseAndPresent={() => {
              if (onDiscloseBuyer) onDiscloseBuyer();
            }}
            onClose={() => setShowEsnafReportModal(false)}
          />
        )}
    </div>
  );
};
