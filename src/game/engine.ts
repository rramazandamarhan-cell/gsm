import {
  ACCESSORY_BUYER_LINES,
  ACCESSORY_CATALOG,
  BRAND_DISTRIBUTORS,
  BUYER_OPENING_LINES,
  CAREER_MILESTONES,
  CITY_BRANCHES,
  CUSTOMER_ARCHETYPES,
  CUSTOMER_REVIEW_COMMENTS,
  CUSTOM_MODS,
  DATA_RECOVERY_CASES,
  DEAL_ACCEPTED_LINES,
  DEFECT_CATALOG,
  FLASH_WHOLESALE_NEWS_TEMPLATES,
  getOutfitSpec,
  LAUNCH_EVENTS_BY_DAY,
  LEGACY_PATHS,
  LEVERAGE_REACTIONS,
  MUSEUM_ITEMS,
  PHONE_CATALOG,
  RANDOM_NEWSPAPER_POOL,
  RANDOM_STORE_EVENTS,
  REGULAR_GREETING_NOTES,
  SELLER_CLAIM_LINES,
  SELLER_OPENING_LINES,
  SEVERE_LEVERAGE_REACTIONS,
  SHOP_DECORATIONS,
  SHOP_STAFF,
  SHOP_TIERS,
  SPARE_PARTS_CATALOG,
  STARTING_CASH,
  STORY_CHAPTERS,
  TEA_REACTIONS,
  TRADE_IN_OPENING_LINES,
  VICTORY_CASH_GOAL,
  VICTORY_REPUTATION_GOAL,
  WALKOUT_LINES,
} from './catalog';
import {
  AccessoryId,
  AccessoryOrderLine,
  AccessoryStockItem,
  ActiveLoan,
  AuctionMysteryReward,
  BranchId,
  CareerMilestone,
  CustomerArchetypeId,
  CustomerComplaintRecord,
  CustomerEncounter,
  CustomerFaultReport,
  CustomerMood,
  CustomerReview,
  CustomsAuctionLot,
  DailyMarketEvent,
  DailyQuest,
  DailyQuestKind,
  DayFinancials,
  DayHistoryEntry,
  DefectId,
  DevicePartReportRow,
  FlashWholesaleDeal,
  InspectionCategory,
  KermesDealItem,
  LegacyPathId,
  MuseumItemId,
  PlaystyleType,
  PrestigePerkId,
  NegotiationPace,
  NegotiationTone,
  NextCustomerEventEffect,
  OfflineEarningsSummary,
  OnlineClassifiedListing,
  OutfitId,
  PendingWholesaleOrder,
  PhoneDevice,
  PhoneModelSpec,
  PhoneTier,
  RadioStationId,
  RandomStoreEvent,
  RepairQuality,
  ShippingOrder,
  SparePartId,
  ShopState,
  ShopTab,
  ShopTier,
  StaffId,
  StaffRepairJob,
  StoryChapter,
  SundayKermesState,
  TimedProject,
  UpgradeId,
} from './types';
import { getCurrentLang } from './i18n';
import { createDefaultAdState, normalizeAdState } from './adService';

const bi = (tr: string, en: string): string =>
  getCurrentLang() === 'en' ? en : tr;

const STORAGE_KEY = 'gsm_simulator_save_v8';
const LEGACY_KEYS = [
  'gsm_simulator_save_v7',
  'gsm_simulator_save_v6',
  'gsm_simulator_save_v5',
  'gsm_simulator_save_v4',
  'gsm_simulator_save_v3',
  'gsm_simulator_save_v2',
  'pasaj_gsm_save_v1',
];

let idCounter = 1;
function makeId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter}_${Math.floor(Math.random() * 999)}`;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

function generateImeiNumber(trRegistered: boolean): string {
  const prefix = trRegistered ? '3589' : '8642';
  let rest = '';
  for (let i = 0; i < 11; i++) {
    rest += Math.floor(Math.random() * 10).toString();
  }
  return `${prefix}${rest}`;
}

export function roundPrice(amount: number): number {
  if (amount <= 1500) return Math.max(250, Math.round(amount / 50) * 50);
  if (amount <= 15000) return Math.round(amount / 250) * 250;
  return Math.round(amount / 500) * 500;
}

export function formatTRY(amount: number): string {
  return `${Math.round(amount).toLocaleString('tr-TR')} ₺`;
}

export function getShopRank(
  state: Pick<ShopState, 'cash' | 'shopTier' | 'reputation' | 'totalPhonesSold' | 'level'>
): string {
  if (state.shopTier >= 6) return bi('GSM Plaza İmparatoru', 'GSM Plaza Emperor');
  if (state.shopTier === 5) return bi('Flagship Patronu', 'Flagship Boss');
  if (state.shopTier === 4) return bi('Bölge Showroom Lideri', 'Regional Showroom Leader');
  if (state.shopTier === 3 || state.level >= 7) return bi('Cadde Merkezi Patronu', 'Main Street Hub Boss');
  if (state.shopTier === 2 || state.level >= 4) return bi('Köşe Mağaza Bayisi', 'Corner Store Dealer');
  if (state.totalPhonesSold >= 4 || state.level >= 3) return bi('Usta Eksper', 'Master Appraiser');
  return bi('Genç Esnaf (23)', 'Young Dealer (23)');
}

export function pickDailyNewspaper(
  day: number,
  previousEventId?: string
): DailyMarketEvent {
  if (LAUNCH_EVENTS_BY_DAY[day]) {
    return LAUNCH_EVENTS_BY_DAY[day];
  }
  const candidates = RANDOM_NEWSPAPER_POOL.filter((e) => e.id !== previousEventId);
  return pick(candidates.length > 0 ? candidates : RANDOM_NEWSPAPER_POOL);
}

export function pickDailyWholesaleDiscountBrand(day: number): string {
  const brands =
    day < 2
      ? ['RedMix', 'PocoPop']
      : day < 4
      ? ['RedMix', 'PocoPop', 'Samxung', 'aPhone']
      : ['RedMix', 'PocoPop', 'Samxung', 'aPhone', 'FoldZ'];
  return pick(brands);
}

export function generateFlashWholesaleDeal(
  day: number,
  level: number
): FlashWholesaleDeal | null {
  // 65% chance on day 1+ to spark wholesale excitement & rival stock race!
  if (day > 1 && Math.random() > 0.68) return null;
  const eligible = FLASH_WHOLESALE_NEWS_TEMPLATES.filter((t) => {
    if (t.brand === 'Samxung' && level < 2) return false;
    if (t.brand === 'aPhone' && level < 3) return false;
    if (t.brand === 'FoldZ' && level < 5) return false;
    return true;
  });
  const tpl = pick(eligible.length > 0 ? eligible : FLASH_WHOLESALE_NEWS_TEMPLATES.slice(0, 2));
  const initialStock =
    tpl.stockMin + Math.floor(Math.random() * (tpl.stockMax - tpl.stockMin + 1));
  return {
    id: makeId('flash'),
    brand: tpl.brand,
    discountPct: tpl.discountPct,
    initialStock,
    remainingStock: initialStock,
    rivalsSnatchedCount: 0,
    headline: tpl.headline,
    subline: tpl.subline,
    expired: false,
  };
}

export function tickRivalFlashSnatch(
  deal: FlashWholesaleDeal | null
): { updatedDeal: FlashWholesaleDeal | null; snatchedNow: number; justSoldOut: boolean } {
  if (!deal || deal.expired || deal.remainingStock <= 0) {
    return { updatedDeal: deal, snatchedNow: 0, justSoldOut: false };
  }
  // Rivals aggressively buy during the day (~55% chance per customer turn)
  if (Math.random() > 0.56) {
    return { updatedDeal: deal, snatchedNow: 0, justSoldOut: false };
  }
  const snatch = Math.min(deal.remainingStock, Math.random() < 0.35 ? 2 : 1);
  const nextRem = Math.max(0, deal.remainingStock - snatch);
  const justSoldOut = nextRem === 0;
  return {
    updatedDeal: {
      ...deal,
      remainingStock: nextRem,
      rivalsSnatchedCount: deal.rivalsSnatchedCount + snatch,
      expired: justSoldOut,
    },
    snatchedNow: snatch,
    justSoldOut,
  };
}

// Infinite, slow, sustainable Esnaf Rank curve (never gates shops/features — rewards long-term mastery)
export function getXpSpanForLevel(level: number): number {
  const safeLvl = Math.max(1, Math.floor(level));
  return Math.round(1250 * Math.pow(safeLvl, 1.55));
}

export function getXpThresholdForLevel(level: number): number {
  let total = 0;
  for (let l = 1; l < Math.max(1, Math.floor(level)); l++) {
    total += getXpSpanForLevel(l);
  }
  return total;
}

export function getLevelFromXp(xp: number): number {
  const safeXp = Math.max(0, Math.floor(xp));
  let lvl = 1;
  let cumulative = 0;
  while (lvl < 999) {
    const span = getXpSpanForLevel(lvl);
    if (safeXp < cumulative + span) break;
    cumulative += span;
    lvl += 1;
  }
  return lvl;
}

export function getLevelProgress(xp: number): {
  level: number;
  currentInLevel: number;
  neededForNext: number;
  percent: number;
} {
  const safeXp = Math.max(0, Math.floor(xp));
  const level = getLevelFromXp(safeXp);
  const currentThreshold = getXpThresholdForLevel(level);
  const span = Math.max(1, getXpSpanForLevel(level));
  const currentInLevel = Math.max(0, safeXp - currentThreshold);
  return {
    level,
    currentInLevel,
    neededForNext: span,
    percent: Math.min(100, Math.round((currentInLevel / span) * 100)),
  };
}

export function getLevelUpBonusCash(newLevel: number): number {
  return roundPrice(Math.min(150000, 1800 * Math.pow(Math.max(1, newLevel), 1.2)));
}

/** Express delivery / instant-bench fee added when choosing Quick Repair instead of hands-on Mini Repair */
export function getQuickRepairExpressFee(baseCost: number): number {
  if (baseCost <= 0) return 0;
  return roundPrice(Math.max(450, baseCost * 0.28));
}

export function getStreakBonusCash(streak: number, level: number): number {
  if (streak < 2) return 0;
  const base = Math.min(2600, (streak - 1) * 350);
  return level >= 5 ? Math.round(base * (1 + Math.min(0.6, (level - 4) * 0.08))) : base;
}

export function createInitialAccessories(): Record<AccessoryId, AccessoryStockItem> {
  const map = {} as Record<AccessoryId, AccessoryStockItem>;
  for (const spec of ACCESSORY_CATALOG) {
    map[spec.id] = {
      id: spec.id,
      quantity: 0,
      retailPrice: spec.recommendedPrice,
      totalSold: 0,
    };
  }
  return map;
}

export function getAccessorySpec(id: AccessoryId) {
  return ACCESSORY_CATALOG.find((a) => a.id === id) ?? ACCESSORY_CATALOG[0];
}

export function hasSparePartsLicense(upgrades?: UpgradeId[]): boolean {
  return Boolean(upgrades?.includes('spare_parts_license'));
}

export function hasAccessoryLicense(upgrades?: UpgradeId[]): boolean {
  return Boolean(upgrades?.includes('accessory_license'));
}

export function hasClassifiedsLicense(upgrades?: UpgradeId[]): boolean {
  return Boolean(upgrades?.includes('classifieds_license'));
}

export function hasAuctionLicense(upgrades?: UpgradeId[]): boolean {
  return Boolean(upgrades?.includes('auction_license'));
}

export function hasBrandNewLicense(upgrades?: UpgradeId[]): boolean {
  return Boolean(upgrades?.includes('brand_new_license'));
}

export function isAccessoryUnlocked(
  id: AccessoryId,
  shopTier: number,
  upgrades?: UpgradeId[]
): boolean {
  if (upgrades && !hasAccessoryLicense(upgrades)) return false;
  const spec = getAccessorySpec(id);
  return shopTier >= (spec.minShopTier ?? 1);
}

export function getTotalAccessoryStock(
  accessories: Record<AccessoryId, AccessoryStockItem>
): number {
  return Object.values(accessories).reduce((sum, item) => sum + item.quantity, 0);
}

export function getDistributorForBrand(brand: string) {
  return (
    BRAND_DISTRIBUTORS.find((d) => d.brands.includes(brand)) ?? BRAND_DISTRIBUTORS[0]
  );
}

export function isDistributorUnlocked(
  distributorId: string,
  shopTier: number,
  reputation: number,
  upgrades?: UpgradeId[]
): boolean {
  if (upgrades && !hasBrandNewLicense(upgrades)) return false;
  const dist = BRAND_DISTRIBUTORS.find((d) => d.id === distributorId);
  if (!dist) return false;
  return shopTier >= (dist.minShopTier ?? 1) && reputation >= dist.minReputation;
}

export function deriveMoodFromScore(score: number): CustomerMood {
  if (score >= 82) return 'excited';
  if (score >= 66) return 'happy';
  if (score >= 48) return 'calm';
  if (score >= 34) return 'thinking';
  if (score >= 18) return 'annoyed';
  return 'angry';
}

export function getMoodDisplay(mood: CustomerMood): {
  label: string;
  simpleLabel: string;
  emoji: string;
  shortNote: string;
  tone: 'positive' | 'neutral' | 'warning' | 'danger';
} {
  switch (mood) {
    case 'excited':
      return {
        label: bi('Çok Keyifli', 'Thrilled'),
        simpleLabel: bi('Mutlu', 'Happy'),
        emoji: '😄',
        shortNote: bi(
          'Fiyatta esnemeye ve ek ürün almaya çok açık',
          'Very open to flexible pricing and add-ons'
        ),
        tone: 'positive',
      };
    case 'happy':
      return {
        label: bi('Güler Yüzlü', 'Pleased'),
        simpleLabel: bi('Mutlu', 'Happy'),
        emoji: '😊',
        shortNote: bi(
          'Sohbetten memnun, orta yolu bulmaya sıcak',
          'Happy with the chat, warm to meeting halfway'
        ),
        tone: 'positive',
      };
    case 'calm':
      return {
        label: bi('Sakin & Ölçülü', 'Calm & Measured'),
        simpleLabel: bi('Kararsız', 'Undecided'),
        emoji: '🙂',
        shortNote: bi(
          'Pazarlığı tartıyor, teklifin belirleyici olacak',
          'Weighing the deal — your offer will decide'
        ),
        tone: 'neutral',
      };
    case 'thinking':
      return {
        label: bi('Tereddütlü', 'Hesitant'),
        simpleLabel: bi('Kararsız', 'Undecided'),
        emoji: '🤔',
        shortNote: bi(
          'Kararsız — sağlam bir koz veya çay ikramı işe yarar',
          'Undecided — leverage or a cup of tea will help'
        ),
        tone: 'warning',
      };
    case 'annoyed':
      return {
        label: bi('Gergin', 'Annoyed'),
        simpleLabel: bi('Sinirli', 'Angry'),
        emoji: '😠',
        shortNote: bi(
          'İnatçı veya yavaş pazarlık canını sıktı, dikkat!',
          'Stubborn or slow haggling annoyed them — be careful!'
        ),
        tone: 'danger',
      };
    case 'angry':
      return {
        label: bi('Öfkeli', 'Furious'),
        simpleLabel: bi('Sinirli', 'Angry'),
        emoji: '😡',
        shortNote: bi('Anlaşmadan kalkmak üzere!', 'About to walk out!'),
        tone: 'danger',
      };
  }
}

export interface NegotiationResistanceInfo {
  resistancePct: number;
  moodEmoji: string;
  moodSimpleLabel: string;
  moodLabel: string;
  moodTone: 'positive' | 'neutral' | 'warning' | 'danger';
  resistanceLabel: string;
  resistanceTone: 'positive' | 'neutral' | 'warning' | 'danger';
  minRounds: number;
  roundsDone: number;
}

/**
 * Computes a live visual customer resistance meter (0-100%) based on mood,
 * stubbornness, remaining negotiation rounds, used Koz leverage, selected tone,
 * and how aggressive the player's currently selected offer price is.
 */
export function getNegotiationResistance(
  encounter: CustomerEncounter,
  offerPrice: number,
  tone: NegotiationTone
): NegotiationResistanceInfo {
  const moodInfo = getMoodDisplay(encounter.mood);
  const baseRequired =
    encounter.requiredRounds ??
    (encounter.archetypeId === 'uncle' || encounter.archetypeId === 'hustler' ? 3 : 2);
  const leverageSoften = encounter.usedLeverageDefects.length > 0 ? 1 : 0;
  const moodRoundPenalty = encounter.moodScore < 42 ? 1 : 0;
  const minRounds = Math.max(
    2,
    Math.min(3, baseRequired + moodRoundPenalty - leverageSoften)
  );
  const roundsLeft = Math.max(0, minRounds - encounter.rounds);

  // Base resistance inversely linked to customer mood + stubbornness
  let resistance = Math.round((100 - encounter.moodScore) * 0.58);
  if (encounter.archetypeId === 'uncle' || encounter.archetypeId === 'hustler') {
    resistance += 10;
  }
  resistance += roundsLeft * 11;
  resistance -= encounter.usedLeverageDefects.length * 14;
  if (encounter.teaServed) resistance -= 8;

  // Live offer aggressiveness sensitivity
  if (encounter.type === 'SELLER') {
    const ratio = offerPrice / Math.max(1, encounter.customerPrice);
    if (offerPrice >= encounter.customerPrice) {
      resistance = Math.min(resistance, 12);
    } else if (ratio < 0.68) {
      resistance += 28;
    } else if (ratio < 0.82) {
      resistance += 15;
    } else if (ratio >= 0.94) {
      resistance -= 14;
    }
  } else {
    const span = Math.max(1, encounter.device.askingPrice - encounter.customerPrice);
    const firmness = (offerPrice - encounter.customerPrice) / span;
    if (offerPrice <= encounter.customerPrice) {
      resistance = Math.min(resistance, 12);
    } else if (firmness > 0.85) {
      resistance += 22;
    } else if (firmness > 0.5) {
      resistance += 10;
    } else {
      resistance -= 10;
    }
  }

  // Tone impact on perceived resistance
  if (tone === 'firm') resistance += 9;
  if (tone === 'friendly') resistance -= 5;
  if (tone === 'analytical' && encounter.usedLeverageDefects.length > 0) {
    resistance -= 6;
  }

  const resistancePct = Math.max(8, Math.min(100, Math.round(resistance)));

  const resistanceMeta: {
    resistanceLabel: string;
    resistanceTone: 'positive' | 'neutral' | 'warning' | 'danger';
  } =
    resistancePct <= 32
      ? {
          resistanceLabel: bi('Düşük Direnç · El Sıkışmaya Yakın', 'Low Resistance · Ready to Shake'),
          resistanceTone: 'positive',
        }
      : resistancePct <= 62
      ? {
          resistanceLabel: bi('Orta Direnç · Karşı Teklif Gelir', 'Medium Resistance · Counter-Offer'),
          resistanceTone: 'neutral',
        }
      : resistancePct <= 82
      ? {
          resistanceLabel: bi('Yüksek Direnç · Koz veya İkna Şart', 'High Resistance · Use Leverage'),
          resistanceTone: 'warning',
        }
      : {
          resistanceLabel: bi('Sert Duvar · Kızıp Kalkabilir!', 'Hard Wall · May Walk Out!'),
          resistanceTone: 'danger',
        };

  return {
    resistancePct,
    moodEmoji: moodInfo.emoji,
    moodSimpleLabel: moodInfo.simpleLabel,
    moodLabel: moodInfo.label,
    moodTone: moodInfo.tone,
    resistanceLabel: resistanceMeta.resistanceLabel,
    resistanceTone: resistanceMeta.resistanceTone,
    minRounds,
    roundsDone: encounter.rounds,
  };
}

export function getAccessoryWholesaleCost(
  id: AccessoryId,
  legacyPath?: LegacyPathId
): number {
  const spec = getAccessorySpec(id);
  if (legacyPath === 'BORN_MERCHANT') {
    return Math.max(30, Math.round((spec.wholesaleCost * 0.9) / 5) * 5);
  }
  return spec.wholesaleCost;
}

export function getDistributorWholesalePrice(
  spec: PhoneModelSpec,
  shopTier: number,
  dailyDiscountBrand?: string,
  legacyPath?: LegacyPathId,
  loyaltyUnits = 0,
  flashDeal?: FlashWholesaleDeal | null
): number {
  const dist = getDistributorForBrand(spec.brand);
  let mult = dist.wholesaleRatio;
  if (shopTier >= 4) mult -= 0.04;
  if (shopTier >= 6) mult -= 0.04;
  if (legacyPath === 'BORN_MERCHANT') {
    mult -= 0.06;
  }
  if (loyaltyUnits >= 2) {
    mult -= Math.min(0.06, Math.floor(loyaltyUnits / 2) * 0.02);
  }
  if (
    flashDeal &&
    !flashDeal.expired &&
    flashDeal.remainingStock > 0 &&
    flashDeal.brand === spec.brand
  ) {
    mult -= flashDeal.discountPct / 100;
  } else if (dailyDiscountBrand && dailyDiscountBrand === spec.brand) {
    mult -= 0.06;
  }
  return roundPrice(spec.baseValue * Math.max(0.62, mult));
}

export function estimateBrandNewRetailValue(
  spec: PhoneModelSpec,
  dailyNews?: DailyMarketEvent
): number {
  let val = spec.baseValue * 1.18;
  if (dailyNews) {
    if (dailyNews.valueMultiplier) {
      const matchesBrand = dailyNews.brandBoost && spec.brand === dailyNews.brandBoost;
      const matchesTier = dailyNews.tierBoost && spec.tier === dailyNews.tierBoost;
      if (matchesBrand || matchesTier) {
        val *= dailyNews.valueMultiplier;
      }
    }
    if (dailyNews.trImeiMultiplier) {
      val *= dailyNews.trImeiMultiplier;
    }
  }
  return roundPrice(Math.max(1500, val));
}

export function generateBrandNewPhone(
  spec: PhoneModelSpec,
  wholesaleCost: number,
  dailyNews?: DailyMarketEvent,
  upgrades: UpgradeId[] = []
): PhoneDevice {
  const phone: PhoneDevice = {
    uid: makeId('new_phone'),
    specId: spec.id,
    brand: spec.brand,
    model: spec.model,
    storage: spec.storage,
    tier: spec.tier,
    bodyColor: spec.bodyColor,
    accentColor: spec.accentColor,
    cameraLayout: spec.cameraLayout,
    baseValue: spec.baseValue,
    batteryHealth: 100,
    reportedBatteryHealth: 100,
    batteryCycles: 0,
    imeiNumber: generateImeiNumber(true),
    imeiStatus: 'TR_REGISTERED',
    warrantyMonths: 24,
    defects: [],
    repairedDefects: [],
    inspected: { screen: true, battery: true, imei: true, hardware: true },
    purchasePrice: wholesaleCost,
    repairSpend: 0,
    listedForSale: false,
    askingPrice: 0,
    hasBoxAndCharger: true,
    masterCrafted: false,
    isBrandNew: true,
  };
  const retailFair = calculateMarketValue(phone, false, dailyNews, upgrades);
  phone.askingPrice = roundPrice(retailFair * 1.08);
  return phone;
}

export function getStoryChapterCurrentValue(
  state: ShopState,
  chapter: StoryChapter
): number {
  switch (chapter.metric) {
    case 'totalPhonesSold':
      return state.totalPhonesSold;
    case 'totalAccessoriesSold':
      return state.totalAccessoriesSold;
    case 'totalPhonesRepaired':
      return state.totalPhonesRepaired;
    case 'totalBrandNewSold':
      return state.totalBrandNewSold;
    case 'totalDefectsExposed':
      return state.totalDefectsExposed;
    case 'totalProfitEarned':
      return Math.max(0, Math.round(state.totalProfitEarned + (state.lifetimeTotalProfit ?? 0)));
    case 'upgradesCount':
      return state.upgrades.length;
    case 'branchesCount':
      return state.branches.length;
    case 'museumCount':
      return state.museumItems.length;
    case 'rivalBoughtOut':
      return state.rival?.boughtOut ? 1 : 0;
    case 'prestigeLevel':
      return state.prestigeLevel ?? 0;
    case 'shopTier':
      return state.shopTier;
    case 'level':
      return state.level;
  }
}

export function getMilestoneCurrentValue(
  state: ShopState,
  milestone: CareerMilestone
): number {
  switch (milestone.metric) {
    case 'totalPhonesSold':
      return state.totalPhonesSold;
    case 'totalDefectsExposed':
      return state.totalDefectsExposed;
    case 'totalPhonesRepaired':
      return state.totalPhonesRepaired;
    case 'bestDealStreak':
      return state.bestDealStreak;
    case 'discoveredModels':
      return state.discoveredSpecIds.length;
    case 'shopTier':
      return state.shopTier;
    case 'totalProfitEarned':
      return Math.max(0, Math.round(state.totalProfitEarned + (state.lifetimeTotalProfit ?? 0)));
    case 'totalAccessoriesSold':
      return state.totalAccessoriesSold;
    case 'totalBrandNewSold':
      return state.totalBrandNewSold;
    case 'totalTeasServed':
      return state.totalTeasServed ?? 0;
    case 'upgradesCount':
      return state.upgrades.length;
    case 'branchesCount':
      return state.branches.length;
    case 'museumCount':
      return state.museumItems.length;
    case 'loansPaidOffCount':
      return state.loansPaidOffCount ?? 0;
    case 'day':
      return state.day;
    case 'prestigeLevel':
      return state.prestigeLevel ?? 0;
  }
}

export function countClaimableRewards(state: ShopState): number {
  const readyQuests = state.dailyQuests.filter(
    (q) => !q.claimed && q.progress >= q.target
  ).length;
  const readyMilestones = CAREER_MILESTONES.filter(
    (m) =>
      !state.claimedMilestoneIds.includes(m.id) &&
      getMilestoneCurrentValue(state, m) >= m.target
  ).length;
  const readyChapters = STORY_CHAPTERS.filter(
    (ch) =>
      !state.claimedChapterIds.includes(ch.id) &&
      getStoryChapterCurrentValue(state, ch) >= ch.target
  ).length;
  return readyQuests + readyMilestones + readyChapters;
}

export function detectPlayerPlaystyle(
  state: Pick<
    ShopState,
    'totalPhonesRepaired' | 'totalPhonesSold' | 'totalDefectsExposed' | 'totalAccessoriesSold'
  >
): PlaystyleType {
  const repaired = state.totalPhonesRepaired ?? 0;
  const sold = state.totalPhonesSold ?? 0;
  const exposed = state.totalDefectsExposed ?? 0;
  if (repaired >= 3 && repaired >= sold * 0.7) {
    return 'REPAIR_MASTER';
  }
  if (exposed >= 5 && exposed >= sold * 1.15 && exposed >= repaired * 1.4) {
    return 'DETECTIVE';
  }
  if (sold >= 4 && sold > repaired * 1.35) {
    return 'TRADER_SHARK';
  }
  return 'BALANCED';
}

export function getPlaystyleLabel(style: PlaystyleType): {
  title: string;
  diplomaTitle: string;
  tagline: string;
} {
  switch (style) {
    case 'REPAIR_MASTER':
      return {
        title: bi('Tamir Ustası', 'Repair Master'),
        diplomaTitle: bi('Mikro-Lehim & Atölye Profesörü', 'Micro-Soldering & Bench Professor'),
        tagline: bi(
          'Atölye ağırlıklı oynadığın için görevler tamir ve donanım teşhisine odaklanıyor.',
          'Since you focus on repairs, daily quests prioritize bench diagnostics & fixes.'
        ),
      };
    case 'TRADER_SHARK':
      return {
        title: bi('Al-Sat Kurdu', 'Trading Shark'),
        diplomaTitle: bi('Pasaj Kelepir & Vitrin Doçenti', 'Arcade Bargain & Sales Associate'),
        tagline: bi(
          'Sıcak al-sat odaklı oynadığın için görevler pazarlık, kelepir alım ve satış ağırlıklı.',
          'Since you focus on trading, daily quests prioritize bargains & high-volume sales.'
        ),
      };
    case 'DETECTIVE':
      return {
        title: bi('Dedektif Eksper', 'Inspection Detective'),
        diplomaTitle: bi('BTK & Gizli Kusur Başmüfettişi', 'Chief Hidden-Defect Inspector'),
        tagline: bi(
          'Kusur yakalamada keskin olduğun için görevler ekspertiz ve koz vurma odaklı.',
          'Your keen eye for defects unlocks higher-stakes inspection & leverage quests.'
        ),
      };
    default:
      return {
        title: bi('Dengeli Esnaf', 'All-Round Merchant'),
        diplomaTitle: bi('Pasaj Çok Yönlü Esnaf Diploması', 'Certified Arcade All-Rounder'),
        tagline: bi(
          'Hem tamir hem al-sat dengeli gittiğin için görevler karma ve çok yönlü geliyor.',
          'Balanced trading & repairs unlock a mixed pool of counter and workshop quests.'
        ),
      };
  }
}

export function generateDailyQuests(
  day: number,
  upgrades: UpgradeId[],
  level = 1,
  playstyle: PlaystyleType = 'BALANCED',
  prestigeLevel = 0
): DailyQuest[] {
  // Always 3 demanding daily quests scaled by player level, day, prestige, and playstyle
  const levelTier = Math.floor((Math.max(1, level) - 1) / 2);
  const tierBump = Math.min(5, levelTier + (day >= 15 ? 2 : day >= 6 ? 1 : 0) + prestigeLevel);
  const diffTag: 'Standart' | 'Zorlu' | 'Usta İşi' =
    tierBump >= 3 ? 'Usta İşi' : tierBump >= 1 ? 'Zorlu' : 'Standart';

  const inspectTarget = 3 + Math.min(5, tierBump + (playstyle === 'DETECTIVE' ? 1 : 0));
  const leverageTarget = 3 + Math.min(5, tierBump + (playstyle === 'DETECTIVE' ? 1 : 0));
  const sellTarget = 3 + Math.min(5, tierBump + (playstyle === 'TRADER_SHARK' ? 1 : 0));
  const teaTarget = 4 + Math.min(4, Math.floor(tierBump / 2) + (day >= 8 ? 1 : 0));
  const bargainTarget = 2 + Math.min(4, Math.ceil(tierBump / 2) + (playstyle === 'TRADER_SHARK' ? 1 : 0));
  const rewardScale =
    (1.35 + Math.min(4.0, (day - 1) * 0.1 + (level - 1) * 0.18)) *
    (1 + prestigeLevel * 0.35);

  type QuestCandidate = Omit<DailyQuest, 'id' | 'progress' | 'claimed'> & {
    weight: number;
  };

  const pool: QuestCandidate[] = [
    {
      kind: 'INSPECT_FULL',
      title: bi('Titiz Ekspertiz Mesaisi', 'Full Inspection Specialist'),
      description: bi(
        `Tezgaha konulan ${inspectTarget} telefonun tüm 4 donanım testini elle eksiksiz tamamla.`,
        `Complete all 4 hands-on hardware checks on ${inspectTarget} phones.`
      ),
      target: inspectTarget,
      reward: roundPrice(2400 * rewardScale),
      xpReward: 75 + tierBump * 22,
      difficultyTag: diffTag,
      playstyleFocus: 'DETECTIVE',
      weight: playstyle === 'DETECTIVE' ? 4 : playstyle === 'REPAIR_MASTER' ? 2.5 : 1.5,
    },
    {
      kind: 'USE_LEVERAGE',
      title: bi('Kartal Gözlü Pazarlıkçı', 'Eagle-Eyed Negotiator'),
      description: bi(
        `Ekspertizde yakaladığın ${leverageTarget} gizli kusuru satıcıya karşı koz olarak kullan.`,
        `Expose ${leverageTarget} hidden defects during inspection and use them as leverage.`
      ),
      target: leverageTarget,
      reward: roundPrice(2900 * rewardScale),
      xpReward: 90 + tierBump * 24,
      difficultyTag: diffTag,
      playstyleFocus: 'DETECTIVE',
      weight: playstyle === 'DETECTIVE' ? 4 : playstyle === 'TRADER_SHARK' ? 2.2 : 1.6,
    },
    {
      kind: 'SELL_PHONE',
      title: bi('Yoğun Vitrin Satışı', 'High-Volume Showcase Sales'),
      description: bi(
        `Bugün vitrininden en az ${sellTarget} cihazı alıcılarla el sıkışarak sat.`,
        `Close at least ${sellTarget} phone sales from your showcase today.`
      ),
      target: sellTarget,
      reward: roundPrice(3200 * rewardScale),
      xpReward: 95 + tierBump * 26,
      difficultyTag: diffTag,
      playstyleFocus: 'TRADER_SHARK',
      weight: playstyle === 'TRADER_SHARK' ? 4 : 2,
    },
    {
      kind: 'SERVE_TEA',
      title: bi('Pasaj Misafirperverliği', 'Arcade Hospitality'),
      description: bi(
        `${teaTarget} müşteriye ince belli bardakta çay ikram ederek pazarlığı yumuşat.`,
        `Serve Turkish tea to ${teaTarget} customers to soften negotiations.`
      ),
      target: teaTarget,
      reward: roundPrice(1900 * rewardScale),
      xpReward: 60 + tierBump * 16,
      difficultyTag: tierBump >= 2 ? 'Zorlu' : 'Standart',
      playstyleFocus: 'BALANCED',
      weight: playstyle === 'BALANCED' ? 2.2 : 1.1,
    },
    {
      kind: 'BUY_BARGAIN',
      title: bi('Sıkı Kelepir Avcısı', 'Hardcore Bargain Hunter'),
      description: bi(
        `${bargainTarget} cihazı gerçek piyasa değerinin altında kapatarak yüksek kâr marjı aç.`,
        `Buy ${bargainTarget} devices below their true market value.`
      ),
      target: bargainTarget,
      reward: roundPrice(3400 * rewardScale),
      xpReward: 105 + tierBump * 26,
      difficultyTag: diffTag,
      playstyleFocus: 'TRADER_SHARK',
      weight: playstyle === 'TRADER_SHARK' ? 4 : playstyle === 'DETECTIVE' ? 2.4 : 1.5,
    },
  ];

  if (upgrades.includes('accessory_license')) {
    const accTarget = 6 + Math.min(12, tierBump * 2);
    pool.push({
      kind: 'SELL_ACCESSORY',
      title: bi('Aksesuar Reyon Hareketi', 'Accessory Shelf Action'),
      description: bi(
        `Tezgahta, telefon yanında çapraz satışta veya gün sonunda toplam ${accTarget} aksesuar sat.`,
        `Sell ${accTarget} accessories via counter, cross-sell, or end-of-day shelf.`
      ),
      target: accTarget,
      reward: roundPrice(2950 * rewardScale),
      xpReward: 90 + tierBump * 22,
      difficultyTag: diffTag,
      playstyleFocus: 'TRADER_SHARK',
      weight: playstyle === 'TRADER_SHARK' ? 3 : 1.7,
    });
  }

  if (upgrades.includes('repair_bench') || day >= 2) {
    const repairTarget =
      3 + Math.min(5, Math.ceil(tierBump / 2) + (playstyle === 'REPAIR_MASTER' ? 1 : 0));
    pool.push({
      kind: 'REPAIR_PHONE',
      title: bi('Ağır Tamir Mesaisi', 'Heavy Micro-Repair Shift'),
      description: bi(
        `Atölye tezgahında veya acil serviste en az ${repairTarget} cihaz arızasını onar.`,
        `Repair at least ${repairTarget} device defects at the workshop or express service.`
      ),
      target: repairTarget,
      reward: roundPrice(3700 * rewardScale),
      xpReward: 115 + tierBump * 28,
      difficultyTag: diffTag,
      playstyleFocus: 'REPAIR_MASTER',
      weight: playstyle === 'REPAIR_MASTER' ? 5 : 2,
    });
  }

  if (upgrades.includes('brand_new_license')) {
    const bnTarget = 2 + (tierBump >= 3 ? 2 : tierBump >= 1 ? 1 : 0);
    pool.push({
      kind: 'SELL_BRAND_NEW',
      title: bi('Resmi Bayi Kotası', 'Authorized Dealer Quota'),
      description: bi(
        `Toptancıdan getirdiğin ${bnTarget} adet Sıfır Kapalı Kutu telefonu müşteriye sat.`,
        `Sell ${bnTarget} brand-new factory-sealed phones ordered from a distributor.`
      ),
      target: bnTarget,
      reward: roundPrice(4800 * rewardScale),
      xpReward: 135 + tierBump * 32,
      difficultyTag: 'Usta İşi',
      playstyleFocus: 'TRADER_SHARK',
      weight: playstyle === 'TRADER_SHARK' ? 3.2 : 1.8,
    });
  }

  // Weighted random pick of 3 distinct daily quests favoring the player's style
  const remaining = [...pool];
  const chosen: QuestCandidate[] = [];
  while (chosen.length < 3 && remaining.length > 0) {
    const totalW = remaining.reduce((s, q) => s + q.weight, 0);
    let r = Math.random() * totalW;
    let pickIdx = 0;
    for (let i = 0; i < remaining.length; i += 1) {
      r -= remaining[i].weight;
      if (r <= 0) {
        pickIdx = i;
        break;
      }
    }
    chosen.push(remaining.splice(pickIdx, 1)[0]);
  }

  return chosen.map(({ weight: _w, ...q }) => ({
    ...q,
    id: makeId('quest'),
    progress: 0,
    claimed: false,
  }));
}

export interface PrestigePerkSpec {
  id: PrestigePerkId;
  cost: number;
  trName: string;
  enName: string;
  trEffect: string;
  enEffect: string;
}

export const PRESTIGE_PERKS: PrestigePerkSpec[] = [
  {
    id: 'golden_pliers',
    cost: 2,
    trName: 'Altın Pense & Kalıcı Tezgah',
    enName: 'Golden Pliers & Permanent Bench',
    trEffect: 'Her yeni döneme Tamir Tezgahı açık başla + tüm parçalarda kalıcı %15 indirim.',
    enEffect: 'Start every cycle with Repair Bench unlocked + permanent 15% parts discount.',
  },
  {
    id: 'silver_tongue',
    cost: 3,
    trName: 'Pasaj Efsanesi İtibarı',
    enName: 'Arcade Legend Reputation',
    trEffect: 'Her yeni döneme +0.5★ yüksek itibar ve satışlarda kalıcı +%10 değer bonusuyla başla.',
    enEffect: 'Start every cycle with +0.5★ reputation and permanent +10% resale value bonus.',
  },
  {
    id: 'seed_capital',
    cost: 3,
    trName: 'Baba Sermayesi & Aksesuar İzni',
    enName: 'Seed Capital & Accessory Permit',
    trEffect: 'Her sıfırlamada +25.000 ₺ ekstra nakit ve Aksesuar Lisansı açık başla.',
    enEffect: 'Start every cycle with +25,000 ₺ bonus cash and Accessory License unlocked.',
  },
  {
    id: 'vip_network',
    cost: 4,
    trName: 'VIP Esnaf Ağı',
    enName: 'VIP Merchant Network',
    trEffect: 'Tüm işlemlerden kalıcı +%30 XP kazancı ve Sarı İlan Lisansı baştan açık.',
    enEffect: 'Permanent +30% XP gain on all deals and Classifieds License unlocked from Day 1.',
  },
];

export interface PrestigeRequirements {
  cashTarget: number;
  minShopTier: ShopTier;
  minLevel: number;
}

export function getPrestigeRequirements(prestigeLevel = 0): PrestigeRequirements {
  const p = Math.max(0, Math.floor(prestigeLevel));
  if (p === 0) {
    return { cashTarget: 650000, minShopTier: 3, minLevel: 6 };
  }
  if (p === 1) {
    return { cashTarget: 1500000, minShopTier: 4, minLevel: 10 };
  }
  if (p === 2) {
    return { cashTarget: 3250000, minShopTier: 5, minLevel: 14 };
  }
  return {
    cashTarget: Math.round((6000000 * Math.pow(1.65, p - 3)) / 50000) * 50000,
    minShopTier: 6,
    minLevel: 18 + (p - 3) * 4,
  };
}

export function getPrestigeCashTarget(prestigeLevel = 0): number {
  return getPrestigeRequirements(prestigeLevel).cashTarget;
}

export function isPrestigeEligible(state: ShopState): boolean {
  const req = getPrestigeRequirements(state.prestigeLevel ?? 0);
  return (
    state.cash >= req.cashTarget &&
    state.shopTier >= req.minShopTier &&
    state.level >= req.minLevel
  );
}

export function getPrestigePointsEarned(state: ShopState): number {
  if (!isPrestigeEligible(state)) return 0;
  const req = getPrestigeRequirements(state.prestigeLevel ?? 0);
  const excessCashBonus = Math.min(
    6,
    Math.floor((state.cash - req.cashTarget) / Math.max(250000, req.cashTarget * 0.45))
  );
  const tierBonus = Math.max(1, state.shopTier - 1);
  const levelBonus = Math.floor(state.level / 4);
  const empireBonus =
    Math.min(3, state.branches.length) + Math.floor(state.museumItems.length / 2);
  return Math.max(3, 2 + excessCashBonus + tierBonus + levelBonus + empireBonus);
}

export function getPrestigeIncomeMultiplier(state: Pick<ShopState, 'prestigeLevel' | 'prestigePerks'>): number {
  const pLvl = state.prestigeLevel ?? 0;
  const silverBonus = (state.prestigePerks ?? []).includes('silver_tongue') ? 0.1 : 0;
  return 1 + pLvl * 0.12 + silverBonus;
}

export function buildCustomerFaultReport(
  device: PhoneDevice,
  archetypeId: CustomerArchetypeId,
  isServiceOrder = false
): CustomerFaultReport | undefined {
  if (device.defects.length === 0) return undefined;

  const symptomMap: Record<DefectId, { headline: string; symptom: string }> = {
    screen_crack: {
      headline: bi('Ekran / Dokunmatik Şikayeti', 'Screen / Touch Issue'),
      symptom: bi(
        '“Ekran kenardan çatladı, bazen üst kısım donuyor ve dokunmatik geç algılıyor.”',
        '“The glass cracked near the edge — top touch sometimes freezes or lags.”'
      ),
    },
    screen_aftermarket: {
      headline: bi('Ekran Görüntü Notu', 'Display Quality Note'),
      symptom: bi(
        '“Geçen sene ekranı değişmişti, güneş altında biraz soluk duruyor sanki.”',
        '“Screen was replaced last year; colors look a bit washed out outdoors.”'
      ),
    },
    battery_degraded: {
      headline: bi('Pil / Şarj Şikayeti', 'Battery / Charging Issue'),
      symptom: bi(
        '“Şarjı öğlene kadar zor dayanıyor, %20’lere inince pat diye kapanıyor.”',
        '“Battery barely lasts half a day and randomly shuts off around 20%.”'
      ),
    },
    battery_fake_chip: {
      headline: bi('Pil Yüzdesi Şüphesi', 'Battery Reading Anomaly'),
      symptom: bi(
        '“Ayarlarda pil %100 gözüküyor ama nedense 2 saatte su gibi bitiyor.”',
        '“Settings shows 100% battery health, yet it drains in 2 hours somehow.”'
      ),
    },
    imei_unregistered: {
      headline: bi('Şebeke / Hat Uyarısı', 'Network / Signal Note'),
      symptom: bi(
        '“Yurt dışından geldi, arada bir şebeke çekmiyor gibi uyarı veriyor.”',
        '“Brought from abroad; occasionally drops cellular signal or warns about SIM.”'
      ),
    },
    liquid_damage: {
      headline: bi('Ses & Sıvı Teması Şüphesi', 'Audio & Liquid Exposure'),
      symptom: bi(
        '“Geçen hafta üstüne biraz su döküldü, hoparlörden ses cızırtılı/kısık geliyor.”',
        '“Got splashed with water last week — speaker sounds muffled and crackly.”'
      ),
    },
    camera_fog: {
      headline: bi('Kamera Odak Şikayeti', 'Camera Focus Issue'),
      symptom: bi(
        '“Arka kamerayı açınca görüntü buğulu çıkıyor, bir türlü netlemiyor.”',
        '“Rear camera shots come out foggy and refuse to focus properly.”'
      ),
    },
    cosmetic_worn: {
      headline: bi('Kasa Kozmetik Notu', 'Chassis Wear Note'),
      symptom: bi(
        '“Kılıfsız kullandım, kasa kenarlarında ufak darbeler ve çizikler var.”',
        '“Used without a case, so the frame edges have noticeable scuffs.”'
      ),
    },
  };

  const primaryDefect = device.defects[0];
  const entry = symptomMap[primaryDefect];

  if (isServiceOrder) {
    return {
      headline: entry.headline,
      symptomText: entry.symptom,
      honesty: 'HONEST',
      mentionedDefectId: primaryDefect,
    };
  }

  // Shady hustlers often hide defects or give vague excuses; regular customers disclose at least 1 symptom
  if (archetypeId === 'hustler' && Math.random() < 0.55) {
    return {
      headline: bi('Müşteri Beyanı (Şüpheli)', 'Seller Claim (Suspicious)'),
      symptomText: bi(
        '“Vallahi tertemiz cihaz usta, hiç tamir görmedi! Sadece arada biraz ısınıyor olabilir.”',
        '“Spotless phone boss, never opened! Maybe runs slightly warm now and then.”'
      ),
      honesty: 'HIDING',
    };
  }

  return {
    headline:
      device.defects.length > 1
        ? bi(`${entry.headline} (+Gizli Risk?)`, `${entry.headline} (+More?)`)
        : entry.headline,
    symptomText: entry.symptom,
    honesty: device.defects.length > 1 ? 'PARTIAL' : 'HONEST',
    mentionedDefectId: primaryDefect,
  };
}

export function advanceDailyQuests(
  quests: DailyQuest[],
  kind: DailyQuestKind,
  amount = 1
): { updatedQuests: DailyQuest[]; newlyReadyTitles: string[] } {
  const newlyReadyTitles: string[] = [];
  const updatedQuests = quests.map((q) => {
    if (q.kind !== kind || q.claimed) return q;
    const wasReady = q.progress >= q.target;
    const nextProgress = Math.min(q.target, q.progress + amount);
    const isNowReady = nextProgress >= q.target;
    if (!wasReady && isNowReady) {
      newlyReadyTitles.push(q.title);
    }
    return {
      ...q,
      progress: nextProgress,
    };
  });
  return { updatedQuests, newlyReadyTitles };
}

export function calculatePrestige(
  state: Pick<ShopState, 'shopTier' | 'activeDecorations'> & {
    branches?: BranchId[];
    museumItems?: MuseumItemId[];
    debtFreePrestigeBonus?: number;
  }
): number {
  const tierPrestige = SHOP_TIERS[state.shopTier].prestigeBonus;
  const decorPrestige = state.activeDecorations.reduce((sum, decId) => {
    const found = SHOP_DECORATIONS.find((d) => d.id === decId);
    return sum + (found ? found.prestige : 0);
  }, 0);
  const branchPrestige = (state.branches ?? []).reduce((sum, bId) => {
    const found = CITY_BRANCHES.find((b) => b.id === bId);
    return sum + (found ? found.prestigeBonus : 0);
  }, 0);
  const museumPrestige = (state.museumItems ?? []).reduce((sum, mId) => {
    const found = MUSEUM_ITEMS.find((m) => m.id === mId);
    return sum + (found ? found.prestigeBonus : 0);
  }, 0);
  const debtFreePrestige = Math.max(0, state.debtFreePrestigeBonus ?? 0);
  return (
    tierPrestige +
    decorPrestige +
    branchPrestige +
    museumPrestige +
    debtFreePrestige
  );
}

export function getShowcaseCapacity(
  shopTier: ShopTier,
  upgrades: UpgradeId[],
  showcaseUpgradeLevel = 0
): number {
  const base = SHOP_TIERS[shopTier].showcaseSlots;
  return base + (upgrades.includes('display_cabinet') ? 2 : 0) + showcaseUpgradeLevel * 2;
}

export function getEffectiveSalesTaxRate(
  staff: StaffId[],
  staffLevels?: Record<StaffId, number>
): number {
  // Base 12% per-sale tax (KDV + Gelir), lowered by Accountant Sv.1..10 down to 6%
  if (!staff.includes('accountant')) return 0.12;
  const accLvl = Math.max(1, Math.min(10, staffLevels?.accountant ?? 1));
  // Sv.1 -> 11%, Sv.10 -> 6%
  return Math.max(0.06, Number((0.115 - accLvl * 0.0055).toFixed(4)));
}

export function calculateSaleTax(
  grossAmount: number,
  staff: StaffId[],
  staffLevels?: Record<StaffId, number>
): { taxRate: number; taxAmount: number; netAmount: number } {
  const taxRate = getEffectiveSalesTaxRate(staff, staffLevels);
  const taxAmount = Math.max(0, Math.round(grossAmount * taxRate));
  return {
    taxRate,
    taxAmount,
    netAmount: Math.max(0, grossAmount - taxAmount),
  };
}

export function getLoanLimitMultiplier(
  staff: StaffId[],
  staffLevels?: Record<StaffId, number>
): number {
  if (!staff.includes('accountant')) return 1;
  const accLvl = staffLevels?.accountant ?? 1;
  if (accLvl >= 8) return 1.35;
  if (accLvl >= 5) return 1.15;
  return 1;
}

export function getEffectiveLoanTerms(
  principal: number,
  baseInterestRate: number,
  termDays: number,
  staff: StaffId[],
  staffLevels?: Record<StaffId, number>
): {
  effectivePrincipal: number;
  effectiveRate: number;
  totalRepay: number;
  dailyPayment: number;
  hasInterestDiscount: boolean;
  limitMultiplier: number;
} {
  const accLvl = staff.includes('accountant') ? staffLevels?.accountant ?? 1 : 0;
  const limitMultiplier = getLoanLimitMultiplier(staff, staffLevels);
  const effectivePrincipal = roundPrice(principal * limitMultiplier);
  const hasInterestDiscount = accLvl >= 5;
  const effectiveRate = hasInterestDiscount
    ? Number((baseInterestRate * 0.85).toFixed(4))
    : baseInterestRate;
  const totalRepay = roundPrice(effectivePrincipal * (1 + effectiveRate));
  const dailyPayment = Math.max(250, Math.ceil(totalRepay / termDays / 50) * 50);
  return {
    effectivePrincipal,
    effectiveRate,
    totalRepay,
    dailyPayment,
    hasInterestDiscount,
    limitMultiplier,
  };
}

export function getCrossSellBonusChance(
  upgrades: UpgradeId[],
  staff: StaffId[],
  staffLevels?: Record<StaffId, number>
): number {
  let bonus = 0;
  if (upgrades.includes('barcode_automation')) bonus += 0.1;
  if (staff.includes('sales_rep')) {
    const lvl = Math.max(1, Math.min(10, staffLevels?.sales_rep ?? 1));
    bonus += 0.09 + lvl * 0.01;
  }
  return bonus;
}

export function getMasterCraftBonusPercent(upgrades?: UpgradeId[]): number {
  let pct = 12;
  if (upgrades?.includes('ultrasonic_cleaner')) pct += 4;
  if (upgrades?.includes('micro_soldering')) pct += 6;
  return pct;
}

export function getMasterTechSpecs(
  level: number,
  upgrades: UpgradeId[]
): { turnsPerJob: number; maxParallelJobs: number; partCostFactor: number } {
  const clamped = Math.max(1, Math.min(10, level));
  const laserBonus = upgrades.includes('laser_backglass') ? 1 : 0;
  const baseTurns = clamped >= 8 ? 1 : clamped >= 5 ? 2 : clamped >= 2 ? 3 : 4;
  const turnsPerJob = Math.max(1, baseTurns - laserBonus);
  const maxParallelJobs = clamped >= 8 ? 4 : clamped >= 5 ? 3 : clamped >= 2 ? 2 : 1;
  const partCostFactor = Math.max(0.3, Number((0.68 - clamped * 0.038).toFixed(2)));
  return { turnsPerJob, maxParallelJobs, partCostFactor };
}

export function calculateMasterDelegateCost(
  rawCost: number,
  level: number,
  upgrades: UpgradeId[]
): number {
  const specs = getMasterTechSpecs(level, upgrades);
  return Math.max(100, Math.round((rawCost * specs.partCostFactor) / 50) * 50);
}

export function getDailyRent(day: number, shopTier: ShopTier): number {
  const tierBase = SHOP_TIERS[shopTier].baseRent;
  return tierBase + Math.min(day - 1, 15) * (140 * shopTier);
}

export function getDailyStaffWages(staff: StaffId[]): number {
  return staff.reduce((sum, id) => {
    const member = SHOP_STAFF.find((s) => s.id === id);
    return sum + (member ? member.dailyWage : 0);
  }, 0);
}

export function getRepairCost(
  defectId: DefectId,
  upgrades: UpgradeId[],
  dailyNews?: DailyMarketEvent,
  externalOutsource = false,
  shopLevel = 1,
  legacyPath?: LegacyPathId
): number {
  const base = DEFECT_CATALOG[defectId].repairCost;
  if (base === 0) return 0;
  if (externalOutsource) {
    const legacyFactor = legacyPath === 'EX_APPRENTICE' ? 0.85 : 1;
    return Math.round((base * 1.45 * legacyFactor) / 50) * 50;
  }
  let mult = upgrades.includes('parts_wholesale') ? 0.7 : 1;
  if (
    upgrades.includes('ultrasonic_cleaner') &&
    (defectId === 'liquid_damage' || defectId === 'camera_fog')
  ) {
    mult *= 0.8;
  }
  if (upgrades.includes('laser_backglass')) {
    mult *= 0.88;
  }
  if (shopLevel >= 3) {
    mult *= 0.9;
  }
  if (legacyPath === 'EX_APPRENTICE') {
    mult *= 0.8;
  }
  if (dailyNews?.repairDiscount) {
    mult *= 1 - dailyNews.repairDiscount;
  }
  return Math.max(150, Math.round((base * mult) / 50) * 50);
}

export function getMultiRepairCost(
  defectIds: DefectId[],
  upgrades: UpgradeId[],
  dailyNews?: DailyMarketEvent,
  externalOutsource = false,
  shopLevel = 1,
  legacyPath?: LegacyPathId,
  prestigePerks?: PrestigePerkId[]
): number {
  const raw = defectIds.reduce(
    (sum, id) =>
      sum + getRepairCost(id, upgrades, dailyNews, externalOutsource, shopLevel, legacyPath),
    0
  );
  // Single-session bundle efficiency: 10% cheaper when fixing 2+ defects at once!
  let total =
    defectIds.length >= 2 && !externalOutsource ? Math.round((raw * 0.9) / 50) * 50 : raw;
  if (!externalOutsource && (prestigePerks ?? []).includes('golden_pliers')) {
    total = Math.max(100, Math.round((total * 0.85) / 50) * 50);
  }
  return total;
}

export function getPrestigePlaqueStyle(prestigeLevel: number): {
  unlocked: boolean;
  tierName: string;
  enTierName: string;
  tierLabelTr: string;
  tierLabelEn: string;
  badgeCode: string;
  primaryColor: string;
  secondaryColor: string;
  accentHex: string;
  borderColor: string;
  bgGradient: string;
  glowRgba: string;
  borderClass: string;
  bgClass: string;
  glowClass: string;
  textClass: string;
} {
  if (prestigeLevel <= 0) {
    return {
      unlocked: false,
      tierName: 'Kilitli (Prestij 1 Gerekli)',
      enTierName: 'Locked (Prestige 1 Needed)',
      tierLabelTr: 'Kilitli (P1)',
      tierLabelEn: 'Locked (P1)',
      badgeCode: 'P0',
      primaryColor: '#94A3B8',
      secondaryColor: '#64748B',
      accentHex: '#94A3B8',
      borderColor: 'rgba(148,163,184,0.35)',
      bgGradient: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
      glowRgba: 'rgba(148,163,184,0.15)',
      borderClass: 'border-slate-500/40',
      bgClass: 'bg-slate-900/80',
      glowClass: 'shadow-none',
      textClass: 'text-slate-300',
    };
  }
  if (prestigeLevel === 1) {
    return {
      unlocked: true,
      tierName: 'Bronz Prestij Plaketi',
      enTierName: 'Bronze Prestige Plaque',
      tierLabelTr: 'Bronz · P1',
      tierLabelEn: 'Bronze · P1',
      badgeCode: 'BRONZ · P1',
      primaryColor: '#E8A87C',
      secondaryColor: '#CD7F32',
      accentHex: '#E09658',
      borderColor: 'rgba(205,127,50,0.72)',
      bgGradient: 'linear-gradient(135deg, #3B2314 0%, #1F120A 100%)',
      glowRgba: 'rgba(205,127,50,0.35)',
      borderClass: 'border-amber-700/80',
      bgClass: 'bg-gradient-to-br from-amber-950/90 via-stone-900/90 to-orange-950/90',
      glowClass: 'shadow-[0_0_16px_rgba(205,127,50,0.35)]',
      textClass: 'text-amber-300',
    };
  }
  if (prestigeLevel === 2) {
    return {
      unlocked: true,
      tierName: 'Gümüş Prestij Plaketi',
      enTierName: 'Silver Prestige Plaque',
      tierLabelTr: 'Gümüş · P2',
      tierLabelEn: 'Silver · P2',
      badgeCode: 'GÜMÜŞ · P2',
      primaryColor: '#F1F5F9',
      secondaryColor: '#94A3B8',
      accentHex: '#CBD5E1',
      borderColor: 'rgba(203,213,225,0.75)',
      bgGradient: 'linear-gradient(135deg, #334155 0%, #111827 100%)',
      glowRgba: 'rgba(203,213,225,0.35)',
      borderClass: 'border-slate-300/75',
      bgClass: 'bg-gradient-to-br from-slate-700/90 via-slate-800/95 to-slate-900/95',
      glowClass: 'shadow-[0_0_16px_rgba(203,213,225,0.35)]',
      textClass: 'text-slate-100',
    };
  }
  if (prestigeLevel === 3) {
    return {
      unlocked: true,
      tierName: 'Altın Prestij Plaketi',
      enTierName: 'Gold Prestige Plaque',
      tierLabelTr: 'Altın · P3',
      tierLabelEn: 'Gold · P3',
      badgeCode: 'ALTIN · P3',
      primaryColor: '#FDE68A',
      secondaryColor: '#F59E0B',
      accentHex: '#FBBF24',
      borderColor: 'rgba(245,158,11,0.82)',
      bgGradient: 'linear-gradient(135deg, #452B08 0%, #1C1306 100%)',
      glowRgba: 'rgba(245,158,11,0.42)',
      borderClass: 'border-amber-400/85',
      bgClass: 'bg-gradient-to-br from-amber-900/90 via-yellow-950/90 to-stone-950/95',
      glowClass: 'shadow-[0_0_20px_rgba(245,158,11,0.45)]',
      textClass: 'text-amber-200',
    };
  }
  return {
    unlocked: true,
    tierName: `Platin Prestij Plaketi (P${prestigeLevel})`,
    enTierName: `Platinum Prestige Plaque (P${prestigeLevel})`,
    tierLabelTr: `Platin · P${prestigeLevel}`,
    tierLabelEn: `Platinum · P${prestigeLevel}`,
    badgeCode: `PLATİN · P${prestigeLevel}`,
    primaryColor: '#E0F2FE',
    secondaryColor: '#38BDF8',
    accentHex: '#38BDF8',
    borderColor: 'rgba(56,189,248,0.85)',
    bgGradient: 'linear-gradient(135deg, #0F2B46 0%, #091326 60%, #1D1B4B 100%)',
    glowRgba: 'rgba(56,189,248,0.45)',
    borderClass: 'border-sky-300/85',
    bgClass: 'bg-gradient-to-br from-sky-950/95 via-indigo-950/95 to-slate-950/95',
    glowClass: 'shadow-[0_0_22px_rgba(56,189,248,0.5)]',
    textClass: 'text-sky-200',
  };
}

export function getSparePartForDefect(defectId: DefectId): SparePartId | null {
  if (!DEFECT_CATALOG[defectId]?.repairable) return null;
  if (defectId === 'screen_crack' || defectId === 'screen_aftermarket') return 'screen';
  if (defectId === 'battery_degraded' || defectId === 'battery_fake_chip') return 'battery';
  return 'board_kit';
}

export function getRequiredSpareParts(defectIds: DefectId[]): Record<SparePartId, number> {
  const req: Record<SparePartId, number> = { screen: 0, battery: 0, board_kit: 0 };
  for (const d of defectIds) {
    const part = getSparePartForDefect(d);
    if (part) req[part] += 1;
  }
  return req;
}

export function getRepairCostWithStock(
  defectIds: DefectId[],
  spareParts: Record<SparePartId, number> | undefined,
  upgrades: UpgradeId[],
  dailyNews?: DailyMarketEvent,
  externalOutsource = false,
  shopLevel = 1,
  legacyPath?: LegacyPathId,
  prestigePerks?: PrestigePerkId[]
): {
  cashCost: number;
  rawCost: number;
  baseCost: number;
  usedParts: Record<SparePartId, number>;
  usedStockCount: number;
  savedAmount: number;
  allCoveredByStock: boolean;
} {
  const rawCost = getMultiRepairCost(
    defectIds,
    upgrades,
    dailyNews,
    externalOutsource,
    shopLevel,
    legacyPath,
    prestigePerks
  );
  const usedParts: Record<SparePartId, number> = { screen: 0, battery: 0, board_kit: 0 };
  if (externalOutsource || !spareParts) {
    return {
      cashCost: rawCost,
      rawCost,
      baseCost: rawCost,
      usedParts,
      usedStockCount: 0,
      savedAmount: 0,
      allCoveredByStock: false,
    };
  }

  const avail: Record<SparePartId, number> = {
    screen: spareParts.screen ?? 0,
    battery: spareParts.battery ?? 0,
    board_kit: spareParts.board_kit ?? 0,
  };
  const uncoveredDefects: DefectId[] = [];
  for (const d of defectIds) {
    const part = getSparePartForDefect(d);
    if (part && avail[part] > 0) {
      avail[part] -= 1;
      usedParts[part] += 1;
    } else {
      uncoveredDefects.push(d);
    }
  }

  const cashCost =
    uncoveredDefects.length === 0
      ? 0
      : getMultiRepairCost(
          uncoveredDefects,
          upgrades,
          dailyNews,
          false,
          shopLevel,
          legacyPath,
          prestigePerks
        );
  const savedAmount = Math.max(0, rawCost - cashCost);
  const usedStockCount = usedParts.screen + usedParts.battery + usedParts.board_kit;
  return {
    cashCost,
    rawCost,
    baseCost: rawCost,
    usedParts,
    usedStockCount,
    savedAmount,
    allCoveredByStock: uncoveredDefects.length === 0 && defectIds.length > 0,
  };
}

export function applyBuyerDisclosureTactic(encounter: CustomerEncounter): {
  updatedEncounter: CustomerEncounter;
  reputationBonus: number;
} {
  if (encounter.buyerDisclosed || (encounter.type !== 'BUYER' && encounter.type !== 'TRADE_IN')) {
    return { updatedEncounter: encounter, reputationBonus: 0 };
  }
  const dev = encounter.device;
  const repairedNames = (dev.repairedDefects ?? [])
    .map((d) => DEFECT_CATALOG[d]?.shortLabel ?? d)
    .filter((v, i, arr) => arr.indexOf(v) === i);
  const isOverseas = dev.imeiStatus === 'UNREGISTERED_OVERSEAS';
  const hasRemainingDefects = dev.defects.length > 0;

  const partsSummary =
    repairedNames.length > 0 ? `değişen/onarılan: ${repairedNames.join(', ')}` : '';
  const imeiSummary = isOverseas ? 'cihaz yurtdışı (kayıtsız IMEI)' : '';
  const flawSummary = hasRemainingDefects ? 'mevcut kozmetik/donanım durumu açıkça gösterildi' : '';
  const details = [partsSummary, imeiSummary, flawSummary].filter(Boolean).join(' · ');

  // Honest disclosure builds trust & mood (+8) and shields against angry warranty comebacks!
  // Slight realistic price softening (-3% for repairs, -6% for overseas)
  const priceAdjustRatio = isOverseas ? 0.95 : repairedNames.length > 0 ? 0.975 : 0.99;
  const nextSecretLimit = Math.max(
    1000,
    roundPrice(encounter.secretLimit * priceAdjustRatio)
  );
  const nextCustomerPrice = Math.min(encounter.customerPrice, nextSecretLimit);
  const nextMoodScore = Math.min(100, encounter.moodScore + 10);
  const nextPatience = Math.min(encounter.maxPatience, encounter.patience + 10);

  return {
    reputationBonus: 0.08,
    updatedEncounter: {
      ...encounter,
      buyerDisclosed: true,
      customerPrice: nextCustomerPrice,
      secretLimit: nextSecretLimit,
      moodScore: nextMoodScore,
      mood: deriveMoodFromScore(nextMoodScore),
      patience: nextPatience,
      lastMoodReason: 'Şeffaf Esnaf Beyanı (+10 Güven)',
      messages: [
        ...encounter.messages,
        {
          id: makeId('msg'),
          speaker: 'player',
          text: `Kardeşim dürüst esnaflık gereği baştan söyleyeyim: ${
            details || 'cihazın tüm geçmişi şeffaf'
          }. Aklında hiçbir soru işareti kalmasın!`,
        },
        {
          id: makeId('msg'),
          speaker: 'customer',
          text: isOverseas
            ? 'Yurtdışı olduğunu baştan dürüstçe söylemen çok değerli usta! Fiyatı ufak güncelledim ama içim rahat alırım.'
            : 'Helal olsun abi, çoğu telefoncu değişen parçayı saklar! Dürüstlüğüne güvendim, gönül rahatlığıyla pazarlık yapalım.',
          tone: 'positive',
        },
      ],
    },
  };
}

export function generateCertificateNumber(day: number): string {
  const dayStr = String(Math.max(1, day)).padStart(2, '0');
  const randCode = String(1000 + Math.floor(Math.random() * 9000));
  return `GSM-G${dayStr}-${randCode}`;
}

export function buildDevicePartBreakdown(device: PhoneDevice): DevicePartReportRow[] {
  const defects = device.defects ?? [];
  const repaired = device.repairedDefects ?? [];
  const origins = device.repairedPartOrigins ?? {};

  // 1. Screen / Display
  let screenRow: DevicePartReportRow;
  if (defects.includes('screen_aftermarket')) {
    screenRow = {
      component: 'screen',
      label: 'Ekran & Dokunmatik',
      enLabel: 'Display & Touch',
      origin: 'AFTERMARKET',
      note: 'Yan sanayi LCD panel takılı (TrueTone kapalı)',
      enNote: 'Aftermarket LCD panel installed (No TrueTone)',
    };
  } else if (defects.includes('screen_crack')) {
    screenRow = {
      component: 'screen',
      label: 'Ekran & Dokunmatik',
      enLabel: 'Display & Touch',
      origin: 'ORIGINAL_FACTORY',
      note: 'Orijinal panel fakat ön cam çatlak / hasarlı',
      enNote: 'Original panel with cracked front glass',
    };
  } else if (repaired.includes('screen_crack') || repaired.includes('screen_aftermarket')) {
    const src = origins.screen_crack ?? origins.screen_aftermarket ?? 'SERVICE_PART';
    screenRow = {
      component: 'screen',
      label: 'Ekran & Dokunmatik',
      enLabel: 'Display & Touch',
      origin: src,
      note:
        src === 'OEM_STOCK'
          ? 'Atölye stoğundan 1. sınıf OEM OLED panel takıldı'
          : 'Toptancı servis ekranı ile yenilendi',
      enNote:
        src === 'OEM_STOCK'
          ? 'Replaced with Grade-A OEM OLED panel from stock'
          : 'Replaced with wholesale service display assembly',
    };
  } else {
    screenRow = {
      component: 'screen',
      label: 'Ekran & Dokunmatik',
      enLabel: 'Display & Touch',
      origin: 'ORIGINAL_FACTORY',
      note: device.isBrandNew
        ? 'Fabrika çıkışı kapalı kutu orijinal ekran'
        : 'Değişensiz fabrika çıkışı orijinal ekran',
      enNote: device.isBrandNew
        ? 'Factory-sealed original display'
        : 'Untouched factory original display',
    };
  }

  // 2. Battery
  let batteryRow: DevicePartReportRow;
  if (defects.includes('battery_fake_chip')) {
    batteryRow = {
      component: 'battery',
      label: 'Batarya & Pil BMS',
      enLabel: 'Battery & BMS',
      origin: 'AFTERMARKET',
      note: 'Yan sanayi / sahte çipli pil (sağlık yanıltıcı)',
      enNote: 'Aftermarket / spoofed-chip battery cell',
    };
  } else if (defects.includes('battery_degraded')) {
    batteryRow = {
      component: 'battery',
      label: 'Batarya & Pil BMS',
      enLabel: 'Battery & BMS',
      origin: 'ORIGINAL_FACTORY',
      note: `Orijinal pil ama ömrü düşmüş (%${device.batteryHealth})`,
      enNote: `Original battery, degraded health (${device.batteryHealth}%)`,
    };
  } else if (repaired.includes('battery_degraded') || repaired.includes('battery_fake_chip')) {
    const src = origins.battery_degraded ?? origins.battery_fake_chip ?? 'SERVICE_PART';
    batteryRow = {
      component: 'battery',
      label: 'Batarya & Pil BMS',
      enLabel: 'Battery & BMS',
      origin: src,
      note:
        src === 'OEM_STOCK'
          ? '0-devir OEM stok batarya takıldı (%100 sağlık)'
          : 'Servis tipi sıfır batarya takıldı (%100 sağlık)',
      enNote:
        src === 'OEM_STOCK'
          ? '0-cycle OEM stock battery installed (100% health)'
          : 'Fresh service-grade battery installed (100% health)',
    };
  } else {
    batteryRow = {
      component: 'battery',
      label: 'Batarya & Pil BMS',
      enLabel: 'Battery & BMS',
      origin: 'ORIGINAL_FACTORY',
      note: `Fabrika çıkışı orijinal pil (%${device.batteryHealth} sağlık)`,
      enNote: `Factory original battery (${device.batteryHealth}% health)`,
    };
  }

  // 3. Motherboard & Liquid Seal
  let boardRow: DevicePartReportRow;
  if (defects.includes('liquid_damage')) {
    boardRow = {
      component: 'board',
      label: 'Anakart & Sıvı Bandı',
      enLabel: 'Logic Board & Seal',
      origin: 'AFTERMARKET',
      note: 'Sıvı teması / oksit uyarısı mevcut!',
      enNote: 'Active liquid damage / corrosion alert!',
    };
  } else if (repaired.includes('liquid_damage')) {
    const src = origins.liquid_damage ?? 'SERVICE_PART';
    boardRow = {
      component: 'board',
      label: 'Anakart & Sıvı Bandı',
      enLabel: 'Logic Board & Seal',
      origin: src,
      note:
        src === 'OEM_STOCK'
          ? 'IPA banyosu & OEM conta setiyle temizlendi'
          : 'Ultrasonik sıvı temizliği & lehim bakımı yapıldı',
      enNote:
        src === 'OEM_STOCK'
          ? 'IPA bath & OEM waterproof seal kit applied'
          : 'Ultrasonic liquid cleaning & micro-solder serviced',
    };
  } else {
    boardRow = {
      component: 'board',
      label: 'Anakart & Sıvı Bandı',
      enLabel: 'Logic Board & Seal',
      origin: 'ORIGINAL_FACTORY',
      note: 'Anakart işlemsiz · sıvı bandı bembeyaz',
      enNote: 'Untouched logic board · liquid indicator clean',
    };
  }

  // 4. Camera & Chassis
  let camRow: DevicePartReportRow;
  if (defects.includes('camera_fog') || defects.includes('cosmetic_worn')) {
    camRow = {
      component: 'camera_chassis',
      label: 'Kamera & Kasa',
      enLabel: 'Camera & Chassis',
      origin: 'ORIGINAL_FACTORY',
      note: defects.includes('camera_fog')
        ? 'Orijinal lens ama hafif buğulanma / toz var'
        : 'Orijinal kasa, kozmetik kullanım izleri mevcut',
      enNote: defects.includes('camera_fog')
        ? 'Original lens with minor fogging / dust'
        : 'Original frame with visible cosmetic wear',
    };
  } else if (repaired.includes('camera_fog') || repaired.includes('cosmetic_worn')) {
    const src = origins.camera_fog ?? origins.cosmetic_worn ?? 'SERVICE_PART';
    camRow = {
      component: 'camera_chassis',
      label: 'Kamera & Kasa',
      enLabel: 'Camera & Chassis',
      origin: src,
      note:
        src === 'OEM_STOCK'
          ? 'OEM kasa / lens kitiyle sıfır gibi yenilendi'
          : 'Lens temizliği & kasa revizyonu tamamlandı',
      enNote:
        src === 'OEM_STOCK'
          ? 'Refurbished with OEM lens & frame kit'
          : 'Lens cleaned & frame refurbished in workshop',
    };
  } else {
    camRow = {
      component: 'camera_chassis',
      label: 'Kamera & Kasa',
      enLabel: 'Camera & Chassis',
      origin: 'ORIGINAL_FACTORY',
      note: 'Fabrika çıkışı orijinal lens & temiz kasa',
      enNote: 'Factory original optics & clean housing',
    };
  }

  return [screenRow, batteryRow, boardRow, camRow];
}

export function buildWittyEsnafReportNote(device: PhoneDevice): {
  tr: string;
  en: string;
  sealLabelTr: string;
  sealLabelEn: string;
  warrantyDays: number;
} {
  const isOverseas =
    device.imeiStatus === 'UNREGISTERED_OVERSEAS' ||
    device.defects.includes('imei_unregistered');
  const hasAftermarket =
    device.defects.includes('screen_aftermarket') ||
    device.defects.includes('battery_fake_chip');
  const repairedCount = (device.repairedDefects ?? []).length;
  const quality = device.lastRepairQuality;

  if (device.isBrandNew) {
    return {
      tr: 'Jelatini daha yeni kokuyor, tornavida yüzü görmedi! Pasajın en gönül rahatlığıyla satılan kutusu.',
      en: 'Fresh out of the box, never touched a screwdriver! Pure flagship peace of mind.',
      sealLabelTr: 'SIFIR KUTU · FABRİKA MÜHÜRLÜ',
      sealLabelEn: 'BRAND NEW · FACTORY SEALED',
      warrantyDays: 90,
    };
  }
  if (isOverseas && hasAftermarket) {
    return {
      tr: 'Kardeşim dürüst konuşalım: ekran biraz Çin Mahallesi esintisi taşıyor, IMEI desen pasaport sırası bekliyor — ama fiyatına göre fıstık gibi cihaz!',
      en: 'Honest shop talk: the screen is aftermarket and IMEI is unregistered overseas — priced fairly with zero surprises!',
      sealLabelTr: 'ŞEFFAF ESNAF NOTU · DİKKAT',
      sealLabelEn: 'TRANSPARENT NOTE · CAVEAT',
      warrantyDays: 7,
    };
  }
  if (isOverseas) {
    return {
      tr: 'Cihaz kasa olarak fişek gibi ama yurtdışı kayıtlı değil; 120 gün içinde BTK pasaport işini halletmeyi unutma, sonra "usta hat gitti" deme!',
      en: 'Clean hardware, unregistered overseas IMEI — remember the 120-day BTK registration window!',
      sealLabelTr: 'YURTDIŞI IMEI · AÇIK BEYAN',
      sealLabelEn: 'OVERSEAS IMEI · DISCLOSED',
      warrantyDays: 14,
    };
  }
  if (quality === 'ROUGH') {
    return {
      tr: 'Tamiri yetiştirdik, cihaz çalışıyor ama kalibrasyon azıcık aceleye geldi. Bir tık nazik kullan, ufak bir şey olursa kapımız açık!',
      en: 'Repaired and working, though calibration was a bit rushed. Handle gently — our counter door is always open!',
      sealLabelTr: 'KABA İŞÇİLİK · KISA GARANTİ',
      sealLabelEn: 'ROUGH CRAFT · SHORT WARRANTY',
      warrantyDays: 14,
    };
  }
  if (repairedCount > 0 && (quality === 'MASTER' || device.masterCrafted)) {
    return {
      tr: 'Usta elinden çıktı, TrueTone ve contası cillop gibi oturdu! Fabrikadaki mühendis görse "bunu biz mi yaptık?" diye alkışlar.',
      en: 'Master-crafted at our bench with spotless TrueTone & seals! Even the factory engineer would applaud.',
      sealLabelTr: 'USTA İŞİ · 90 GÜN PASAJ GÜVENCESİ',
      sealLabelEn: 'MASTER CRAFT · 90-DAY WARRANTY',
      warrantyDays: 90,
    };
  }
  if (repairedCount > 0) {
    return {
      tr: 'Gerekli parçaları tezgâhta özenle yeniledik, testten geçti. Sıvı teması ve duvara fırlatma hariç 30 gün pasaj güvencemiz altında!',
      en: 'Serviced and bench-tested cleanly. Covered by our 30-day shop warranty (wall-throws and tea spills excluded!).',
      sealLabelTr: 'SERVİS ONAYLI · 30 GÜN GARANTİ',
      sealLabelEn: 'BENCH CERTIFIED · 30-DAY WARRANTY',
      warrantyDays: 30,
    };
  }
  if (hasAftermarket) {
    return {
      tr: 'Biz açıp kurcalamadık ama önceki sahibi yan sanayi parça taktırmış; gözümüzden kaçmadı, sana da saklamadan söylüyoruz.',
      en: 'Untouched by us, though a prior owner fitted an aftermarket part — spotted on our bench and shared openly.',
      sealLabelTr: 'EKSPERTİZ ONAYLI · YAN SANAYİ NOTLU',
      sealLabelEn: 'INSPECTED · AFTERMARKET NOTED',
      warrantyDays: 14,
    };
  }
  return {
    tr: 'Tornavida değmemiş, içi dışı tertemiz, eski sahibi pamuklara sarıp kullanmış! Alana şimdiden hayırlı olsun.',
    en: 'Never opened, spotless factory internals — previous owner babied this phone! Ready for a happy new home.',
    sealLabelTr: 'ORİJİNAL · DEĞİŞENSİZ CİHAZ',
    sealLabelEn: 'ORIGINAL · UNTOUCHED DEVICE',
    warrantyDays: 60,
  };
}

export function getTabUnlockLevel(_tab: ShopTab): number {
  return 1;
}

export function getTabUnlockDay(_tab: ShopTab): number {
  return 1;
}

export function isTabUnlocked(_state: ShopState, _tab: ShopTab): boolean {
  // All tabs are open from Day 1; business verticals unlock via cash licenses & shop growth!
  return true;
}

export interface StockAgingInfo {
  ageDays: number;
  depreciationRatio: number;
  label: string | null;
  tone: 'none' | 'warning' | 'danger';
}

export function getStockAgingInfo(
  device: PhoneDevice,
  currentDay?: number
): StockAgingInfo {
  if (!currentDay || !device.dayAcquired || device.dayAcquired <= 0) {
    return { ageDays: 0, depreciationRatio: 0, label: null, tone: 'none' };
  }
  const ageDays = Math.max(0, currentDay - device.dayAcquired);
  const dUnit = bi('g', 'd');
  // Sealed brand-new boxes hold value longer before aging
  if (device.isBrandNew) {
    if (ageDays >= 12) {
      return {
        ageDays,
        depreciationRatio: 0.12,
        label: bi(`Eski Seri (${ageDays}${dUnit} · -%12)`, `Old Batch (${ageDays}${dUnit} · -12%)`),
        tone: 'danger',
      };
    }
    if (ageDays >= 7) {
      return {
        ageDays,
        depreciationRatio: 0.05,
        label: bi(`Bekleyen Stok (${ageDays}${dUnit} · -%5)`, `Aging Stock (${ageDays}${dUnit} · -5%)`),
        tone: 'warning',
      };
    }
    return { ageDays, depreciationRatio: 0, label: null, tone: 'none' };
  }

  if (ageDays >= 11) {
    return {
      ageDays,
      depreciationRatio: 0.2,
      label: bi(`Eski Stok (${ageDays}${dUnit} · -%20)`, `Old Stock (${ageDays}${dUnit} · -20%)`),
      tone: 'danger',
    };
  }
  if (ageDays >= 7) {
    return {
      ageDays,
      depreciationRatio: 0.12,
      label: bi(`Eski Stok (${ageDays}${dUnit} · -%12)`, `Old Stock (${ageDays}${dUnit} · -12%)`),
      tone: 'warning',
    };
  }
  if (ageDays >= 4) {
    return {
      ageDays,
      depreciationRatio: 0.05,
      label: bi(`Bekleyen Stok (${ageDays}${dUnit} · -%5)`, `Aging Stock (${ageDays}${dUnit} · -5%)`),
      tone: 'warning',
    };
  }
  return { ageDays, depreciationRatio: 0, label: null, tone: 'none' };
}

export function getScrapSaleValue(
  device: PhoneDevice,
  dailyNews?: DailyMarketEvent,
  upgrades?: UpgradeId[],
  currentDay?: number
): number {
  const currentMarket = calculateMarketValue(device, false, dailyNews, upgrades, currentDay);
  // Parts/wholesale liquidator buys immediately at 68% of current as-is value (minimum 900 TL)
  return roundPrice(Math.max(900, currentMarket * 0.68));
}

export function calculateMarketValue(
  device: PhoneDevice,
  onlyInspected = false,
  dailyNews?: DailyMarketEvent,
  upgrades?: UpgradeId[],
  currentDay?: number
): number {
  let penalty = 0;
  let visibleDefectCount = 0;
  for (const defectId of device.defects) {
    const def = DEFECT_CATALOG[defectId];
    if (!onlyInspected || device.inspected[def.category]) {
      penalty += def.valuePenaltyRatio;
      visibleDefectCount += 1;
    }
  }
  const cappedPenalty = Math.min(0.68, penalty);
  let val = device.baseValue * (1 - cappedPenalty);

  if (device.isBrandNew) {
    val *= 1.18;
  } else if (visibleDefectCount === 0 && device.hasBoxAndCharger) {
    val *= 1.08;
  } else if (visibleDefectCount === 0) {
    val *= 1.03;
  }

  if (device.masterCrafted) {
    let craftBoost = 1.12;
    if (upgrades?.includes('ultrasonic_cleaner')) craftBoost += 0.04;
    if (upgrades?.includes('micro_soldering')) craftBoost += 0.06;
    val *= craftBoost;
  }

  if (device.customMod && CUSTOM_MODS[device.customMod]) {
    val *= 1 + CUSTOM_MODS[device.customMod].valueBoostRatio;
  }

  // Bundled accessories add their combined value + 10% combo appeal (matches Workshop UI & Toast!)
  if (device.bundledAccessories && device.bundledAccessories.length > 0) {
    const bundleAdd = device.bundledAccessories.reduce((sum, accId) => {
      const spec = getAccessorySpec(accId);
      return sum + Math.round(spec.recommendedPrice * 1.1);
    }, 0);
    val += bundleAdd;
  }

  if (dailyNews) {
    if (dailyNews.valueMultiplier) {
      const matchesBrand = dailyNews.brandBoost && device.brand === dailyNews.brandBoost;
      const matchesTier = dailyNews.tierBoost && device.tier === dailyNews.tierBoost;
      if (matchesBrand || matchesTier) {
        val *= dailyNews.valueMultiplier;
      }
    }
    const imeiKnown = !onlyInspected || device.inspected.imei;
    if (imeiKnown) {
      if (device.imeiStatus === 'TR_REGISTERED' && dailyNews.trImeiMultiplier) {
        val *= dailyNews.trImeiMultiplier;
      }
      if (
        device.imeiStatus === 'UNREGISTERED_OVERSEAS' &&
        dailyNews.overseasImeiMultiplier
      ) {
        val *= dailyNews.overseasImeiMultiplier;
      }
    }
  }

  // Stock aging depreciation when sitting unsold for 4+ days
  if (currentDay) {
    const aging = getStockAgingInfo(device, currentDay);
    if (aging.depreciationRatio > 0) {
      val *= 1 - aging.depreciationRatio;
    }
  }

  return roundPrice(Math.max(1500, val));
}

export interface DeviceValuationBreakdown {
  /** Market value in current condition (only counting currently discovered defects when buying) */
  asIsValue: number;
  /** Market value after fixing all discovered REPAIRABLE defects (keeps unrepairable ones like imei_unregistered!) */
  postRepairValue: number;
  /** Estimated repair cost for discovered repairable defects */
  estimatedRepairCost: number;
  repairableDefects: DefectId[];
  unrepairableDefects: DefectId[];
  uninspectedCount: number;
  usesExternalOutsource: boolean;
  /** Projected net profit if bought at offerPrice, repaired, and resold at postRepairValue */
  projectedNetProfit: number;
}

export function calculateDeviceValuationBreakdown(
  device: PhoneDevice,
  offerPrice: number,
  upgrades: UpgradeId[],
  dailyNews?: DailyMarketEvent,
  shopLevel = 1,
  legacyPath?: LegacyPathId,
  onlyInspected = true
): DeviceValuationBreakdown {
  const visibleDefects = onlyInspected
    ? device.defects.filter((d) => device.inspected[DEFECT_CATALOG[d].category])
    : device.defects;
  const repairableDefects = visibleDefects.filter((d) => DEFECT_CATALOG[d].repairable);
  const unrepairableDefects = visibleDefects.filter((d) => !DEFECT_CATALOG[d].repairable);
  const uninspectedCount = Object.values(device.inspected).filter((v) => !v).length;

  const asIsValue = calculateMarketValue(device, onlyInspected, dailyNews, upgrades);

  const usesExternalOutsource = !upgrades.includes('repair_bench');
  const estimatedRepairCost =
    repairableDefects.length > 0
      ? getMultiRepairCost(
          repairableDefects,
          upgrades,
          dailyNews,
          usesExternalOutsource,
          shopLevel,
          legacyPath
        )
      : 0;

  // Simulate device with discovered repairable defects fixed (unrepairable defects stay!)
  const simulatedRepairedDevice: PhoneDevice = {
    ...device,
    defects: unrepairableDefects,
    inspected: onlyInspected
      ? device.inspected
      : { screen: true, battery: true, imei: true, hardware: true },
  };
  const postRepairValue = calculateMarketValue(
    simulatedRepairedDevice,
    onlyInspected,
    dailyNews,
    upgrades
  );

  const projectedNetProfit = postRepairValue - offerPrice - estimatedRepairCost;

  return {
    asIsValue,
    postRepairValue,
    estimatedRepairCost,
    repairableDefects,
    unrepairableDefects,
    uninspectedCount,
    usesExternalOutsource,
    projectedNetProfit,
  };
}

export interface PostPurchaseSurpriseResult {
  updatedDevice: PhoneDevice;
  surpriseAlert?: string;
  extraBenchCost: number;
}

/**
 * Balanced realistic risk on 2nd-hand purchases (SELLER / TRADE_IN):
 * 1) If player skipped inspection categories that hid real defects -> reveals what slipped past!
 * 2) Modest, fair chance of a subtle shop-floor micro-scam or overlooked issue (mitigated by Pro Diag / Eski Çırak).
 */
export function evaluatePostPurchaseSurprise(
  device: PhoneDevice,
  archetypeId: CustomerArchetypeId,
  upgrades: UpgradeId[],
  legacyPath: LegacyPathId,
  dailyNews?: DailyMarketEvent
): PostPurchaseSurpriseResult {
  if (device.isBrandNew) {
    return { updatedDevice: device, extraBenchCost: 0 };
  }

  // 1. Did player skip inspecting categories that actually contained defects?
  const missedDefects = device.defects.filter(
    (d) => !device.inspected[DEFECT_CATALOG[d].category]
  );
  if (missedDefects.length > 0) {
    const names = missedDefects.map((d) => DEFECT_CATALOG[d].shortLabel).join(', ');
    const alert = `Gözden kaçan kusur atölyede ortaya çıktı: ${names}! Testleri tamamlamadan aldığın için ek masraf/değer kaybı doğdu.`;
    return {
      updatedDevice: {
        ...device,
        surpriseNote: `Ekspertiz atlandı → Gizli kusur: ${names}`,
      },
      surpriseAlert: alert,
      extraBenchCost: 0,
    };
  }

  // 2. Skill-rewarding post-purchase risk:
  // Full 4/4 inspection drastically cuts surprise risk (~3-6%), whereas rushing with skipped tests raises exposure.
  const allInspected =
    device.inspected.screen &&
    device.inspected.battery &&
    device.inspected.imei &&
    device.inspected.hardware;

  const baseRisk =
    archetypeId === 'hustler'
      ? allInspected ? 0.06 : 0.28
      : archetypeId === 'uncle'
      ? allInspected ? 0.03 : 0.14
      : archetypeId === 'vip'
      ? 0.015
      : allInspected ? 0.025 : 0.12;
  const diagFactor = upgrades.includes('pro_diagnostic') ? 0.45 : 1.0;
  const legacyFactor = legacyPath === 'EX_APPRENTICE' ? 0.65 : 1.0;
  const finalRisk = baseRisk * diagFactor * legacyFactor;

  if (Math.random() >= finalRisk) {
    return { updatedDevice: device, extraBenchCost: 0 };
  }

  // Pick a realistic, non-catastrophic esnaf surprise
  const possibleTraps: ('FAKE_BOX' | 'FAKE_WARRANTY' | 'MINOR_FLAW' | 'BENCH_CLEAN')[] = [
    'BENCH_CLEAN',
  ];
  if (device.hasBoxAndCharger) possibleTraps.push('FAKE_BOX');
  if (device.warrantyMonths > 0) possibleTraps.push('FAKE_WARRANTY');
  if (!device.defects.includes('cosmetic_worn') && device.defects.length <= 2) {
    possibleTraps.push('MINOR_FLAW');
  }

  const chosen = pick(possibleTraps);

  if (chosen === 'FAKE_BOX') {
    const updated: PhoneDevice = {
      ...device,
      hasBoxAndCharger: false,
      surpriseNote: 'Satıcının verdiği kutu başka cihaza ait, şarj kablosu sahte çıktı (Kutusuz sayıldı).',
    };
    const newVal = calculateMarketValue(updated, false, dailyNews, upgrades);
    updated.askingPrice = roundPrice(newVal * 1.15);
    return {
      updatedDevice: updated,
      surpriseAlert:
        'Küçük Kutu Oyunu! Satıcının verdiği kutu başka seri numarasına ait, kablo da bozuk çıktı — cihaz kutusuz sayıldı.',
      extraBenchCost: 0,
    };
  }

  if (chosen === 'FAKE_WARRANTY') {
    const updated: PhoneDevice = {
      ...device,
      warrantyMonths: 0,
      surpriseNote: 'Fatura fotokopi çıktı, resmi TR garantisi geçersiz sayıldı.',
    };
    return {
      updatedDevice: updated,
      surpriseAlert:
        'Sahte Fatura Sürprizi! Satıcının gösterdiği garanti belgesi sorguda geçersiz çıktı (Garantisiz sayıldı).',
      extraBenchCost: 0,
    };
  }

  if (chosen === 'MINOR_FLAW') {
    const updated: PhoneDevice = {
      ...device,
      defects: [...device.defects, 'cosmetic_worn'],
      surpriseNote: 'Atölyede detaylı ışıkta kasa içi darbe / soket gevşekliği fark edildi.',
    };
    const newVal = calculateMarketValue(updated, false, dailyNews, upgrades);
    updated.askingPrice = roundPrice(newVal * 1.15);
    return {
      updatedDevice: updated,
      surpriseAlert:
        'Gözden Kaçan İnce Kusur! Tezgah ışığında belli olmuyordu ama atölyede kasa/soket gevşekliği çıktı (+tamir masrafı).',
      extraBenchCost: 0,
    };
  }

  // BENCH_CLEAN: small realistic cleanup / charging port contact fix (400-750 TL)
  const benchCost = pick([400, 500, 650, 750]);
  const updated: PhoneDevice = {
    ...device,
    repairSpend: device.repairSpend + benchCost,
    surpriseNote: `Atölyede gizli şarj soketi oksiti temizlendi (+${formatTRY(benchCost)} maliyet).`,
  };
  return {
    updatedDevice: updated,
    surpriseAlert: `Küçük Esnaf Sürprizi! Şarj soketi temassız çıktı; atölye temizliği maliyetine +${formatTRY(benchCost)} eklendi.`,
    extraBenchCost: benchCost,
  };
}

export interface ConditionInfo {
  label: string;
  score: number;
  tone: 'danger' | 'warning' | 'neutral' | 'positive';
}

export function getConditionInfo(
  device: PhoneDevice,
  onlyInspected = false
): ConditionInfo {
  const relevantDefects = onlyInspected
    ? device.defects.filter((d) => device.inspected[DEFECT_CATALOG[d].category])
    : device.defects;

  if (device.isBrandNew && relevantDefects.length === 0) {
    return { label: bi('Sıfır · Kapalı Kutu', 'Brand New · Sealed'), score: 100, tone: 'positive' };
  }
  const totalPenalty = relevantDefects.reduce(
    (sum, d) => sum + DEFECT_CATALOG[d].valuePenaltyRatio,
    0
  );
  const score = Math.max(15, Math.min(100, Math.round((1 - totalPenalty) * 100)));

  if (relevantDefects.length === 0 && device.hasBoxAndCharger) {
    return { label: bi('Sıfır Ayarında', 'Mint Condition'), score: 98, tone: 'positive' };
  }
  if (relevantDefects.length === 0) {
    return { label: bi('Temiz', 'Clean'), score: 90, tone: 'positive' };
  }
  if (score >= 76) {
    return { label: bi('İdare Eder', 'Fair'), score, tone: 'neutral' };
  }
  if (score >= 54) {
    return { label: bi('Hasarlı', 'Damaged'), score, tone: 'warning' };
  }
  return { label: bi('Hurda', 'Scrap'), score, tone: 'danger' };
}

export function getDiscoveredDefects(device: PhoneDevice): DefectId[] {
  return device.defects.filter((d) => device.inspected[DEFECT_CATALOG[d].category]);
}

export function getPatienceLabel(patience: number): {
  text: string;
  tone: 'positive' | 'warning' | 'danger';
} {
  if (patience >= 65) return { text: bi('Rahat', 'Relaxed'), tone: 'positive' };
  if (patience >= 35) return { text: bi('Tereddütlü', 'Hesitant'), tone: 'warning' };
  if (patience > 0) return { text: bi('Kalkmak Üzere', 'Losing Patience'), tone: 'danger' };
  return { text: bi('Masadan Kalktı', 'Walked Out'), tone: 'danger' };
}

export function getListingDemand(
  device: PhoneDevice,
  dailyNews?: DailyMarketEvent,
  upgrades?: UpgradeId[]
): {
  label: string;
  tone: 'positive' | 'warning' | 'danger';
  hint: string;
} {
  const fair = calculateMarketValue(device, false, dailyNews, upgrades);
  const ratio = device.askingPrice / fair;
  if (ratio <= 1.04) {
    return {
      label: bi('Hızlı Satış', 'Fast Sale'),
      tone: 'positive',
      hint: bi(
        'Müşteriler kapışır, etikete yakın fiyattan kolay el sıkışır.',
        'High demand — buyers shake hands near asking price.'
      ),
    };
  }
  if (ratio <= 1.2) {
    return {
      label: bi('İdeal Kâr', 'Sweet Spot'),
      tone: 'warning',
      hint: bi(
        'Tatlı bir esnaf kârı, dengeli indirim pazarlığı yapılır.',
        'Healthy retail margin with balanced haggling.'
      ),
    };
  }
  return {
    label: bi('Yüksek Etiket', 'High Tag'),
    tone: 'danger',
    hint: bi(
      'Alıcılar fiyatı pahalı bulup sert indirim isteyebilir.',
      'Buyers may find it steep and demand heavy discounts.'
    ),
  };
}

function pickPhoneSpecForDay(
  day: number,
  cash: number,
  shopTier: ShopTier,
  archetypeId: CustomerArchetypeId,
  hasNeonSign: boolean
): PhoneModelSpec {
  const arch = CUSTOMER_ARCHETYPES[archetypeId];
  const maxAffordable = Math.max(
    18000,
    cash * (hasNeonSign || shopTier >= 2 ? 1.85 : 1.5)
  );

  let candidates = PHONE_CATALOG.filter((p) => {
    if (p.releaseDay > day) return false;
    if (shopTier === 1 && p.tier === 'luxury' && day < 6) return false;
    return p.baseValue <= maxAffordable;
  });

  if (candidates.length === 0) {
    candidates = PHONE_CATALOG.filter((p) => p.releaseDay <= day);
  }

  const preferred = candidates.filter((p) => arch.preferredTiers.includes(p.tier));
  if (preferred.length > 0 && Math.random() < 0.7) {
    candidates = preferred;
  }

  return candidates.length > 0 ? pick(candidates) : PHONE_CATALOG[0];
}

export function generatePhoneDevice(
  spec: PhoneModelSpec,
  archetypeId: CustomerArchetypeId,
  day: number,
  minDefects = 0
): PhoneDevice {
  const defectPool: DefectId[] = [
    'screen_crack',
    'screen_aftermarket',
    'battery_degraded',
    'battery_fake_chip',
    'imei_unregistered',
    'liquid_damage',
    'camera_fog',
    'cosmetic_worn',
  ];

  let defectCount = 1;
  const roll = Math.random();
  if (archetypeId === 'hustler') {
    defectCount = roll < 0.5 ? 2 : roll < 0.85 ? 3 : 1;
  } else if (archetypeId === 'influencer' || archetypeId === 'vip') {
    defectCount = roll < 0.4 ? 0 : roll < 0.85 ? 1 : 2;
  } else if (day === 1) {
    defectCount = roll < 0.2 ? 0 : roll < 0.8 ? 1 : 2;
  } else {
    defectCount = roll < 0.16 ? 0 : roll < 0.68 ? 1 : 2;
  }
  defectCount = Math.max(minDefects, defectCount);

  const chosen: DefectId[] = [];
  const shuffled = [...defectPool].sort(() => Math.random() - 0.5);
  for (const d of shuffled) {
    if (chosen.length >= defectCount) break;
    if (d === 'screen_crack' && chosen.includes('screen_aftermarket')) continue;
    if (d === 'screen_aftermarket' && chosen.includes('screen_crack')) continue;
    if (d === 'battery_degraded' && chosen.includes('battery_fake_chip')) continue;
    if (d === 'battery_fake_chip' && chosen.includes('battery_degraded')) continue;
    if (d === 'imei_unregistered' && day === 1 && Math.random() < 0.65) continue;
    chosen.push(d);
  }

  let batteryHealth = 88 + Math.floor(Math.random() * 11);
  let reportedBatteryHealth = batteryHealth;
  let batteryCycles = 95 + Math.floor(Math.random() * 210);

  if (chosen.includes('battery_degraded')) {
    batteryHealth = 63 + Math.floor(Math.random() * 10);
    reportedBatteryHealth = batteryHealth;
    batteryCycles = 780 + Math.floor(Math.random() * 340);
  } else if (chosen.includes('battery_fake_chip')) {
    batteryHealth = 66 + Math.floor(Math.random() * 8);
    reportedBatteryHealth = 100;
    batteryCycles = 890 + Math.floor(Math.random() * 260);
  }

  const imeiStatus = chosen.includes('imei_unregistered')
    ? 'UNREGISTERED_OVERSEAS'
    : 'TR_REGISTERED';
  const warrantyMonths =
    imeiStatus === 'UNREGISTERED_OVERSEAS' || chosen.length >= 2
      ? 0
      : Math.random() < 0.5
      ? 4 + Math.floor(Math.random() * 16)
      : 0;

  // Generate seller's verbal claim (detective inspection hook!):
  // If defects exist, sneaky sellers often lie directly about one of the defective categories.
  let sellerClaim: string | undefined;
  let sellerClaimCategory: InspectionCategory | undefined;
  const allCategories: InspectionCategory[] = ['screen', 'battery', 'imei', 'hardware'];
  const defectiveCategories = Array.from(
    new Set(chosen.map((d) => DEFECT_CATALOG[d].category))
  );
  const cleanCategories = allCategories.filter((c) => !defectiveCategories.includes(c));

  const lieProbability =
    archetypeId === 'hustler'
      ? 0.88
      : archetypeId === 'uncle'
      ? 0.68
      : archetypeId === 'student'
      ? 0.55
      : 0.45;

  if (defectiveCategories.length > 0 && Math.random() < lieProbability) {
    sellerClaimCategory = pick(defectiveCategories);
    sellerClaim = pick(SELLER_CLAIM_LINES[sellerClaimCategory].lie);
  } else if (cleanCategories.length > 0) {
    sellerClaimCategory = pick(cleanCategories);
    sellerClaim = pick(SELLER_CLAIM_LINES[sellerClaimCategory].truth);
  }

  return {
    uid: makeId('phone'),
    specId: spec.id,
    brand: spec.brand,
    model: spec.model,
    storage: spec.storage,
    tier: spec.tier,
    bodyColor: spec.bodyColor,
    accentColor: spec.accentColor,
    cameraLayout: spec.cameraLayout,
    baseValue: spec.baseValue,
    batteryHealth,
    reportedBatteryHealth,
    batteryCycles,
    imeiNumber: generateImeiNumber(imeiStatus === 'TR_REGISTERED'),
    imeiStatus,
    warrantyMonths,
    defects: chosen,
    repairedDefects: [],
    inspected: {
      screen: false,
      battery: false,
      imei: false,
      hardware: false,
    },
    purchasePrice: 0,
    repairSpend: 0,
    listedForSale: false,
    askingPrice: 0,
    hasBoxAndCharger: !chosen.includes('cosmetic_worn') && Math.random() < 0.55,
    masterCrafted: false,
    isBrandNew: false,
    sellerClaim,
    sellerClaimCategory,
    dayAcquired: day,
  };
}

function getOutfitEncounterBonuses(
  outfitId: OutfitId | undefined,
  archetypeId: CustomerArchetypeId
): { moodBonus: number; patienceBonus: number; label: string } {
  const spec = getOutfitSpec(outfitId ?? 'casual_hoodie');
  const preferred = spec.preferredArchetypes.includes(archetypeId);
  return {
    moodBonus: spec.moodBonus + (preferred ? 5 : 0),
    patienceBonus: spec.patienceBonus,
    label: spec.name,
  };
}

export function createSellerEncounter(state: ShopState): CustomerEncounter {
  const hasNeon = state.upgrades.includes('neon_sign');
  const prestige = calculatePrestige(state);
  const archetypePool: CustomerArchetypeId[] =
    state.shopTier >= 2 || prestige >= 50
      ? ['student', 'uncle', 'influencer', 'hustler', 'vip']
      : ['student', 'uncle', 'influencer', 'hustler'];

  const archetypeId =
    (hasNeon || state.shopTier >= 3) && Math.random() < 0.38
      ? pick(['influencer', 'hustler', 'vip'] as CustomerArchetypeId[])
      : pick(archetypePool);

  const arch = CUSTOMER_ARCHETYPES[archetypeId];
  const spec = pickPhoneSpecForDay(
    state.day,
    state.cash,
    state.shopTier,
    archetypeId,
    hasNeon
  );
  const device = generatePhoneDevice(spec, archetypeId, state.day);

  let apprenticeNote: string | null = null;
  if (state.staff.includes('apprentice')) {
    const appLvl = state.staffLevels?.apprentice ?? 1;
    const autoCount = appLvl >= 8 ? 4 : appLvl >= 5 ? 3 : appLvl >= 2 ? 2 : 1;
    const categories = shuffleArray<InspectionCategory>(['screen', 'battery', 'imei', 'hardware']).slice(
      0,
      autoCount
    );
    const catNames: Record<InspectionCategory, string> = {
      screen: 'Ekran & Kasa',
      battery: 'Pil & Devir',
      imei: 'IMEI Sorgu',
      hardware: 'Sıvı & Sensör',
    };
    categories.forEach((c) => {
      device.inspected[c] = true;
    });
    apprenticeNote = `Çırak Emre (Sv.${appLvl}) ${categories.map((c) => catNames[c]).join(', ')} testini önceden tamamladı.`;
  }

  const realValue = calculateMarketValue(device, false, state.dailyNews, state.upgrades);
  const perceivedValue =
    realValue + (device.baseValue - realValue) * (archetypeId === 'hustler' ? 0.78 : 0.5);
  const initialAsk = roundPrice(
    perceivedValue * (1.03 + arch.markupTendency * (0.7 + Math.random() * 0.5))
  );

  // Tighter, fierier seller secret limit + ~18% realistic "bad deal / stubborn seller" chance!
  // Sharp players spot the loss risk in the valuation breakdown and walk away; careless buyers can lose money.
  const hasCctv = state.upgrades.includes('cctv_security');
  const hasEspresso = state.upgrades.includes('espresso_bar');
  const stubbornChance =
    (archetypeId === 'hustler' ? 0.24 : archetypeId === 'uncle' ? 0.2 : 0.12) *
    (hasCctv ? 0.65 : 1);
  const isStubbornOverpriced = Math.random() < stubbornChance;
  const minRatio = isStubbornOverpriced
    ? 0.93 + Math.random() * 0.13
    : archetypeId === 'student'
    ? 0.69 + Math.random() * 0.09
    : archetypeId === 'hustler'
    ? 0.74 + Math.random() * 0.11
    : 0.76 + Math.random() * 0.1;
  const secretLimit = roundPrice(
    Math.min(initialAsk * 0.91, Math.max(1200, realValue * minRatio))
  );

  const customerName = pick(arch.names);
  const outfitBonus = getOutfitEncounterBonuses(state.equippedOutfit, archetypeId);
  const messages: CustomerEncounter['messages'] = [
    {
      id: makeId('msg'),
      speaker: 'customer',
      text: pick(SELLER_OPENING_LINES[archetypeId]),
      tone: 'neutral',
    },
  ];
  if (apprenticeNote) {
    messages.push({
      id: makeId('msg'),
      speaker: 'system',
      text: apprenticeNote,
      tone: 'positive',
    });
  }

  const baseMood =
    archetypeId === 'uncle'
      ? 48
      : archetypeId === 'hustler'
      ? 52
      : archetypeId === 'student'
      ? 62
      : 56;
  const startingMoodScore = Math.min(
    96,
    baseMood +
      (state.legacyPath === 'SOCIAL_HUSTLER' ? 10 : 0) +
      (hasEspresso ? 8 : 0) +
      outfitBonus.moodBonus
  );
  const requiredRounds =
    archetypeId === 'uncle' || archetypeId === 'hustler' || isStubbornOverpriced ? 3 : 2;

  const faultReport = buildCustomerFaultReport(device, archetypeId, false);
  return {
    id: makeId('enc'),
    type: 'SELLER',
    archetypeId,
    customerName,
    customerTitle: arch.title,
    portraitPath: arch.portraitPath,
    device,
    customerFaultReport: faultReport,
    customerPrice: initialAsk,
    initialCustomerPrice: initialAsk,
    secretLimit,
    patience: Math.min(100, arch.startingPatience + outfitBonus.patienceBonus + (hasEspresso ? 10 : 0)),
    maxPatience: 100,
    moodScore: startingMoodScore,
    mood: deriveMoodFromScore(startingMoodScore),
    negotiationHeat: 14,
    requiredRounds,
    lastMoodReason: `${outfitBonus.label} (+${outfitBonus.moodBonus})`,
    usedLeverageDefects: [],
    teaServed: false,
    bluffUsed: false,
    honestPitchUsed: false,
    legacyDialogueUsed: false,
    finalWarningGiven: false,
    rounds: 0,
    outcome: 'ACTIVE',
    messages,
  };
}

export function createBuyerEncounter(
  state: ShopState,
  targetDevice: PhoneDevice
): CustomerEncounter {
  const hasNeon = state.upgrades.includes('neon_sign');
  const prestige = calculatePrestige(state);

  const tierVipBase =
    state.shopTier >= 5
      ? 0.52
      : state.shopTier === 4
      ? 0.44
      : state.shopTier === 3
      ? 0.35
      : state.shopTier === 2
      ? 0.2
      : 0.08;
  const hasVipConcierge = state.upgrades.includes('vip_concierge');
  const hasCloudCrm = state.upgrades.includes('cloud_crm');
  const hasEspresso = state.upgrades.includes('espresso_bar');
  const vipChance =
    tierVipBase +
    (prestige >= 60 ? 0.15 : 0) +
    (targetDevice.masterCrafted || targetDevice.isBrandNew ? 0.16 : 0) +
    (hasNeon ? 0.1 : 0) +
    (hasVipConcierge ? 0.2 : 0) +
    (state.level >= 5 ? 0.15 : 0);

  let archetypeId: CustomerArchetypeId;
  if (
    Math.random() < vipChance &&
    (targetDevice.tier === 'flagship' ||
      targetDevice.tier === 'luxury' ||
      targetDevice.masterCrafted ||
      targetDevice.isBrandNew)
  ) {
    archetypeId = 'vip';
  } else {
    const pool: CustomerArchetypeId[] =
      targetDevice.tier === 'flagship' || targetDevice.tier === 'luxury'
        ? ['influencer', 'hustler', 'uncle', 'vip']
        : ['student', 'uncle', 'influencer', 'hustler'];
    archetypeId = pick(pool);
  }

  const arch = CUSTOMER_ARCHETYPES[archetypeId];
  const customerName = pick(arch.names);

  const realValue = calculateMarketValue(targetDevice, false, state.dailyNews, state.upgrades);
  const reputationBoost = 1 + (state.reputation - 2.5) * 0.045;
  const prestigeBoost = 1 + Math.min(0.24, prestige * 0.001);
  const newsBudgetBoost = state.dailyNews.buyerBudgetMultiplier ?? 1;
  const levelPersuasionBoost =
    (state.level >= 2 ? 1.05 : 1) *
    (state.level >= 9 ? 1.06 : 1) *
    (hasVipConcierge ? 1.06 : 1);
  const salesRepLvl = state.staff.includes('sales_rep')
    ? state.staffLevels?.sales_rep ?? 1
    : 0;
  const salesRepBoost = salesRepLvl > 0 ? 1 + Math.min(0.22, 0.03 + salesRepLvl * 0.02) : 1;

  // Check if a happy past customer returns as a Regular (Müdavim)
  const happyPast = (state.soldHistory ?? []).filter((r) => r.wasHappy);
  const returningRecord =
    happyPast.length > 0 && Math.random() < (hasCloudCrm ? 0.55 : 0.34)
      ? pick(happyPast)
      : null;
  const isRegular = Boolean(returningRecord);
  const regularBoost = isRegular ? 1.1 : 1;

  const finalArchId = returningRecord ? returningRecord.archetypeId : archetypeId;
  const finalArch = CUSTOMER_ARCHETYPES[finalArchId];
  const finalName = returningRecord ? returningRecord.customerName : customerName;
  const outfitBonus = getOutfitEncounterBonuses(state.equippedOutfit, finalArchId);

  const vipBoost =
    finalArchId === 'vip'
      ? targetDevice.masterCrafted ||
        targetDevice.isBrandNew ||
        targetDevice.customMod ||
        targetDevice.defects.length === 0
        ? 1.18
        : 1.04
      : finalArchId === 'influencer' &&
        (targetDevice.defects.length === 0 || targetDevice.customMod)
      ? 1.12
      : 1;

  const stickerPrice =
    targetDevice.askingPrice > 0
      ? targetDevice.askingPrice
      : roundPrice(realValue * (targetDevice.isBrandNew ? 1.08 : 1.15));

  const prestigeIncomeMult = getPrestigeIncomeMultiplier(state);
  const rawWillingness = roundPrice(
    realValue *
      (targetDevice.isBrandNew ? 1.05 + Math.random() * 0.11 : 1.06 + Math.random() * 0.14) *
      reputationBoost *
      prestigeBoost *
      prestigeIncomeMult *
      newsBudgetBoost *
      levelPersuasionBoost *
      salesRepBoost *
      regularBoost *
      vipBoost
  );

  // Buyers open lower to trigger genuine heated back-and-forth haggling
  const haggleDiscount = targetDevice.isBrandNew
    ? 0.85 + Math.random() * 0.08
    : 0.72 + Math.random() * 0.12;
  const initialOffer = roundPrice(
    Math.min(
      stickerPrice,
      Math.max(1000, Math.min(rawWillingness * 0.88, stickerPrice * haggleDiscount))
    )
  );
  const cappedSecretLimit = Math.min(
    stickerPrice,
    Math.max(initialOffer + 500, rawWillingness)
  );

  const wantsInstallment = stickerPrice >= 14000 && Math.random() < 0.45;
  const installmentSuffix = wantsInstallment
    ? ' Kredi kartına taksit geçersen bütçemi biraz daha yukarı çekerim!'
    : '';

  const bundleNote =
    targetDevice.bundledAccessories && targetDevice.bundledAccessories.length > 0
      ? ` (${targetDevice.bundledAccessories.length} aksesuarlı kombin paket)`
      : '';

  const openingLine = returningRecord
    ? `Selam usta, beni tanıdın mı? Geçen senden aldığım ${returningRecord.deviceName} taş gibi çıktı! Şimdi bu ${targetDevice.brand} ${targetDevice.model}${bundleNote} için geldim, etiket ${formatTRY(stickerPrice)} ama müdavim indirimiyle ${formatTRY(initialOffer)} yapalım!${installmentSuffix}`
    : targetDevice.isBrandNew
    ? `Merhaba usta! Vitrindeki sıfır kapalı kutu ${targetDevice.brand} ${targetDevice.model}${bundleNote} dikkatimi çekti. Etiketi ${formatTRY(stickerPrice)} ama ${formatTRY(initialOffer)} yaparsan hemen alırım!${installmentSuffix}`
    : `${pick(BUYER_OPENING_LINES[finalArchId])} Etiketin ${formatTRY(stickerPrice)}, ben ${formatTRY(initialOffer)} verebilirim.${installmentSuffix}`;

  const baseBuyerMood =
    finalArchId === 'uncle'
      ? 50
      : finalArchId === 'vip'
      ? 58
      : targetDevice.isBrandNew
      ? 68
      : 60;
  const startingMoodScore = Math.min(
    98,
    baseBuyerMood +
      (state.legacyPath === 'SOCIAL_HUSTLER' ? 10 : 0) +
      (isRegular ? 14 : 0) +
      (hasEspresso ? 8 : 0) +
      outfitBonus.moodBonus
  );

  return {
    id: makeId('enc'),
    type: 'BUYER',
    archetypeId: finalArchId,
    customerName: finalName,
    customerTitle: isRegular
      ? `${finalArch.title} · Müdavim Müşteri`
      : targetDevice.isBrandNew
      ? `${finalArch.title} · Sıfır Cihaz Alıcısı`
      : finalArch.title,
    portraitPath: finalArch.portraitPath,
    device: { ...targetDevice, askingPrice: stickerPrice },
    isRegular,
    regularNote: isRegular ? pick(REGULAR_GREETING_NOTES) : undefined,
    wantsInstallment,
    posAccepted: false,
    customerPrice: initialOffer,
    initialCustomerPrice: initialOffer,
    secretLimit: cappedSecretLimit,
    patience: Math.min(100, finalArch.startingPatience + (isRegular ? 10 : 0) + outfitBonus.patienceBonus),
    maxPatience: 100,
    moodScore: startingMoodScore,
    mood: deriveMoodFromScore(startingMoodScore),
    negotiationHeat: 14,
    requiredRounds: finalArchId === 'uncle' || finalArchId === 'hustler' ? 3 : 2,
    lastMoodReason: `${outfitBonus.label} (+${outfitBonus.moodBonus})`,
    usedLeverageDefects: [],
    teaServed: false,
    bluffUsed: false,
    honestPitchUsed: false,
    legacyDialogueUsed: false,
    finalWarningGiven: false,
    rounds: 0,
    outcome: 'ACTIVE',
    crossSellAttachments: [],
    crossSellTriedIds: [],
    messages: [
      {
        id: makeId('msg'),
        speaker: 'customer',
        text: openingLine,
        tone: isRegular ? 'positive' : 'neutral',
      },
    ],
  };
}

export function createTradeInEncounter(
  state: ShopState,
  targetDevice: PhoneDevice
): CustomerEncounter {
  const archetypeId = pick([
    'student',
    'uncle',
    'influencer',
    'hustler',
    'vip',
  ] as CustomerArchetypeId[]);
  const arch = CUSTOMER_ARCHETYPES[archetypeId];
  const happyPast = (state.soldHistory ?? []).filter((r) => r.wasHappy);
  const returningRecord =
    happyPast.length > 0 && Math.random() < 0.25 ? pick(happyPast) : null;
  const finalArchId = returningRecord ? returningRecord.archetypeId : archetypeId;
  const finalArch = CUSTOMER_ARCHETYPES[finalArchId];
  const customerName = returningRecord ? returningRecord.customerName : pick(arch.names);
  const outfitBonus = getOutfitEncounterBonuses(state.equippedOutfit, finalArchId);

  // Pick a lower-value trade-in phone so the customer pays cash on top!
  const cheaperSpecs = PHONE_CATALOG.filter(
    (s) => s.releaseDay <= state.day && s.baseValue < targetDevice.baseValue * 0.85
  );
  const tradeSpec =
    cheaperSpecs.length > 0 ? pick(cheaperSpecs) : PHONE_CATALOG[0];

  // FIX: Pass minDefects = 0 (NOT apprenticeLvl!) and run proper Çırak Emre auto-inspection!
  const tradeInDevice = generatePhoneDevice(tradeSpec, finalArchId, state.day, 0);
  let apprenticeNote: string | null = null;
  if (state.staff.includes('apprentice')) {
    const appLvl = state.staffLevels?.apprentice ?? 1;
    const autoCount = appLvl >= 8 ? 4 : appLvl >= 5 ? 3 : appLvl >= 2 ? 2 : 1;
    const categories = shuffleArray<InspectionCategory>([
      'screen',
      'battery',
      'imei',
      'hardware',
    ]).slice(0, autoCount);
    const catNames: Record<InspectionCategory, string> = {
      screen: 'Ekran & Kasa',
      battery: 'Pil & Devir',
      imei: 'IMEI Sorgu',
      hardware: 'Sıvı & Sensör',
    };
    categories.forEach((c) => {
      tradeInDevice.inspected[c] = true;
    });
    apprenticeNote = `Çırak Emre (Sv.${appLvl}) takas cihazında ${categories.map((c) => catNames[c]).join(', ')} testini önceden tamamladı.`;
  }

  const stickerPrice =
    targetDevice.askingPrice > 0
      ? targetDevice.askingPrice
      : roundPrice(
          calculateMarketValue(targetDevice, false, state.dailyNews, state.upgrades) * 1.15
        );
  const tradeFairVal = calculateMarketValue(
    tradeInDevice,
    false,
    state.dailyNews,
    state.upgrades
  );
  const fairCashDiff = Math.max(1500, roundPrice(stickerPrice - tradeFairVal * 0.78));

  const initialCashOffer = roundPrice(
    Math.max(1000, fairCashDiff * (0.72 + Math.random() * 0.14))
  );
  const maxCashLimit = roundPrice(
    Math.min(stickerPrice - 500, Math.max(initialCashOffer + 750, fairCashDiff * 1.12))
  );
  const wantsInstallment = maxCashLimit >= 6000 && Math.random() < 0.35;

  const startingMoodScore = Math.min(
    94,
    60 +
      (state.legacyPath === 'SOCIAL_HUSTLER' ? 10 : 0) +
      (returningRecord ? 12 : 0) +
      outfitBonus.moodBonus
  );

  const messages: CustomerEncounter['messages'] = [
    {
      id: makeId('msg'),
      speaker: 'customer',
      text: `${pick(TRADE_IN_OPENING_LINES[finalArchId])} Elimdeki ${tradeInDevice.brand} ${tradeInDevice.model} cihazı verip üstüne ${formatTRY(initialCashOffer)} nakit fark ödeyeyim, vitrindeki ${targetDevice.brand} ${targetDevice.model} benim olsun!`,
      tone: 'neutral',
    },
  ];
  if (apprenticeNote) {
    messages.push({
      id: makeId('msg'),
      speaker: 'system',
      text: apprenticeNote,
      tone: 'positive',
    });
  }

  const tradeFaultReport = buildCustomerFaultReport(tradeInDevice, finalArchId, false);
  return {
    id: makeId('trade_enc'),
    type: 'TRADE_IN',
    archetypeId: finalArchId,
    customerName,
    customerTitle: `${finalArch.title} · Takas (Trade-In)`,
    portraitPath: finalArch.portraitPath,
    device: { ...targetDevice, askingPrice: stickerPrice },
    tradeInDevice,
    customerFaultReport: tradeFaultReport,
    isRegular: Boolean(returningRecord),
    regularNote: returningRecord ? pick(REGULAR_GREETING_NOTES) : undefined,
    wantsInstallment,
    posAccepted: false,
    customerPrice: initialCashOffer,
    initialCustomerPrice: initialCashOffer,
    secretLimit: maxCashLimit,
    patience: Math.min(100, finalArch.startingPatience + outfitBonus.patienceBonus),
    maxPatience: 100,
    moodScore: startingMoodScore,
    mood: deriveMoodFromScore(startingMoodScore),
    negotiationHeat: 14,
    requiredRounds: finalArchId === 'uncle' || finalArchId === 'hustler' ? 3 : 2,
    lastMoodReason: `${outfitBonus.label} (+${outfitBonus.moodBonus})`,
    usedLeverageDefects: [],
    teaServed: false,
    bluffUsed: false,
    honestPitchUsed: false,
    legacyDialogueUsed: false,
    finalWarningGiven: false,
    rounds: 0,
    outcome: 'ACTIVE',
    messages,
  };
}

export function createWarrantyClaimEncounter(
  state: ShopState
): CustomerEncounter | null {
  const candidates = (state.soldHistory ?? []).filter(
    (r) => !r.warrantyResolved && state.day - r.daySold >= 1
  );
  if (candidates.length === 0) return null;

  const hasCctv = state.upgrades.includes('cctv_security');

  // 1. Prioritize scheduled 3-5 day repair comebacks or undisclosed overseas complaints!
  const scheduledDue = candidates.filter(
    (r) => typeof r.comebackDay === 'number' && state.day >= r.comebackDay
  );
  const undisclosedRisk = candidates.filter(
    (r) =>
      state.day - r.daySold >= 3 &&
      !r.wasDisclosed &&
      (r.wasOverseas || r.hadDefects || (r.repairedDefects?.length ?? 0) > 0)
  );
  const faultyFirst = candidates.filter((r) => r.hadDefects);

  let record = scheduledDue[0] ?? null;
  if (!record && undisclosedRisk.length > 0 && Math.random() < (hasCctv ? 0.55 : 0.78)) {
    record = undisclosedRisk[0];
  }
  if (!record && faultyFirst.length > 0 && Math.random() < (hasCctv ? 0.5 : 0.8)) {
    record = faultyFirst[0];
  }
  if (!record && Math.random() < (hasCctv ? 0.12 : 0.24)) {
    record = pick(candidates);
  }
  if (!record) return null;

  const arch = CUSTOMER_ARCHETYPES[record.archetypeId];
  const dummyDevice = generateBrandNewPhone(PHONE_CATALOG[0], 0);
  const daysElapsed = Math.max(1, state.day - record.daySold);

  const faultMap: Record<
    DefectId,
    { detail: string; customerComplaint: string }
  > = {
    screen_crack: {
      detail: 'Değiştirilen ekranda dokunmatik üst bölgede donuyor ve kenardan ışık sızması başladı.',
      customerComplaint:
        'ekranı tamir edildi demiştin ama 5 güne kalmadan üst dokunmatik takılmaya başladı!',
    },
    screen_aftermarket: {
      detail: 'Takılan panelde TrueTone / dokunmatik kalibrasyonu kaydı, ekranda titreme var.',
      customerComplaint:
        'ekran yeni takıldı demiştin ama parlaklık titriyor ve dokunmatik bazen basmıyor!',
    },
    battery_degraded: {
      detail: 'Pil %35’te aniden kapanıyor ve şarj alırken arka kapak aşırı ısınıyor.',
      customerComplaint:
        'pili yeni taktım demiştin ama %35’te pat diye kapanıyor, şarjı yarım gün gitmiyor!',
    },
    battery_fake_chip: {
      detail: 'Batarya BMS devresi yanlış yüzde gösteriyor ve hızlı şarj kesiliyor.',
      customerComplaint:
        'pil tamiri yapılmıştı ama şarj yüzdesi kafasına göre zıplayıp kapanıyor!',
    },
    liquid_damage: {
      detail: 'Anakart şarj hattında oksit tekrar nüksetti, cihaz kendi kendine yeniden başlıyor.',
      customerComplaint:
        'sıvı teması tamamen temizlendi demiştin ama cihaz yine kendi kendine reset atıyor!',
    },
    camera_fog: {
      detail: 'Arka ana kamera tekrar odak kaçırıyor ve lens içinde hafif buğulanma oluştu.',
      customerComplaint:
        'kamera temizlendi demiştin ama fotoğraflar yine bulanık ve buğulu çıkıyor!',
    },
    cosmetic_worn: {
      detail: 'Kasa kenar contası gevşedi ve güç tuşu zor basıyor.',
      customerComplaint:
        'kasa bakımını yaptım demiştin ama kenar çıtası ayrıldı, tuş zor basıyor!',
    },
    imei_unregistered: {
      detail: 'BTK sisteminden 120 günlük yurtdışı kayıt uyarı SMS’i geldi!',
      customerComplaint:
        'bu telefon yurtdışı kayıtsız çıktı, BTK’dan kapanma mesajı geldi! Satarken hiç söylemedin!',
    },
  };

  let chosenDefectId: DefectId;
  let introReason: string;
  if (record.wasOverseas && !record.wasDisclosed) {
    chosenDefectId = 'imei_unregistered';
    introReason = `${daysElapsed} gün önce sattığın ${record.deviceName} yurtdışı kayıtsızmış — `;
  } else if (record.repairedDefects && record.repairedDefects.length > 0) {
    chosenDefectId = record.repairedDefects[0];
    const partLabel = DEFECT_CATALOG[chosenDefectId].shortLabel;
    introReason = `${daysElapsed} gün önce "${partLabel} tamir edildi, sorunsuz" deyip verdiğin ${record.deviceName} cihazında yine sıkıntı çıktı — `;
  } else {
    chosenDefectId = pick(['screen_crack', 'battery_degraded', 'camera_fog', 'liquid_damage'] as DefectId[]);
    introReason = `${daysElapsed} gün önce (${record.daySold}. gün) senden aldığım ${record.deviceName} cihazında ${
      record.hadDefects ? 'söylemediğin arıza büyüdü — ' : 'sorun çıktı — '
    }`;
  }

  const chosenFault = faultMap[chosenDefectId];
  const defectBaseRepair = DEFECT_CATALOG[chosenDefectId].repairCost || 1400;
  const repairCost = roundPrice(
    Math.max(700, Math.min(2800, Math.round((defectBaseRepair + record.salePrice * 0.05) * 0.52)))
  );
  const refundCost = roundPrice(Math.max(1200, Math.min(4200, record.salePrice * 0.16)));

  return {
    id: makeId('war_enc'),
    type: 'WARRANTY_CLAIM',
    archetypeId: record.archetypeId,
    customerName: record.customerName,
    customerTitle: `${arch.title} · Garanti & Tekrar Arıza`,
    portraitPath: arch.portraitPath,
    device: {
      ...dummyDevice,
      brand: '',
      model: record.deviceName,
      defects: [chosenDefectId],
      repairedDefects: record.repairedDefects ?? [],
      imeiStatus: record.wasOverseas ? 'UNREGISTERED_OVERSEAS' : 'TR_REGISTERED',
      inspected: { screen: true, battery: true, imei: true, hardware: true },
    },
    warrantyRecord: record,
    warrantyDefectId: chosenDefectId,
    warrantyFaultDetail: chosenFault.detail,
    warrantyRepairCost: repairCost,
    warrantyRefundCost: refundCost,
    customerPrice: repairCost,
    initialCustomerPrice: repairCost,
    secretLimit: repairCost,
    patience: 55,
    maxPatience: 100,
    moodScore: record.wasOverseas && !record.wasDisclosed ? 22 : 34,
    mood: 'annoyed',
    lastMoodReason: `Tekrar Arıza (${daysElapsed} gün sonra): ${DEFECT_CATALOG[chosenDefectId].shortLabel}`,
    usedLeverageDefects: [],
    teaServed: false,
    bluffUsed: false,
    honestPitchUsed: false,
    legacyDialogueUsed: false,
    rounds: 0,
    outcome: 'ACTIVE',
    messages: [
      {
        id: makeId('msg'),
        speaker: 'customer',
        text: `Usta merhaba! ${introReason}${chosenFault.customerComplaint} (${DEFECT_CATALOG[chosenDefectId].name}) Dükkanına güvenip geldim, bunu nasıl çözeceğiz?`,
        tone: 'warning',
      },
    ],
  };
}

export function createDataRecoveryEncounter(state: ShopState): CustomerEncounter {
  const archetypeId = pick(['student', 'uncle', 'influencer', 'vip'] as CustomerArchetypeId[]);
  const arch = CUSTOMER_ARCHETYPES[archetypeId];
  const baseJob = pick(DATA_RECOVERY_CASES);
  const hasCleanRoomLab = state.upgrades.includes('clean_room_lab');
  const hasMicroSoldering = state.upgrades.includes('micro_soldering');
  const payoutMult = hasCleanRoomLab ? 1.35 : 1;
  const job = {
    ...baseJob,
    cleanRoomPayout: roundPrice(baseJob.cleanRoomPayout * payoutMult),
    softwarePayout: roundPrice(baseJob.softwarePayout * payoutMult),
    softwareSuccessRate: hasMicroSoldering
      ? Math.max(baseJob.softwareSuccessRate, 0.95)
      : baseJob.softwareSuccessRate,
  };
  const spec = pickPhoneSpecForDay(state.day, state.cash, state.shopTier, archetypeId, false);
  const device = generatePhoneDevice(spec, archetypeId, state.day, 0);

  return {
    id: makeId('data_enc'),
    type: 'DATA_RECOVERY',
    archetypeId,
    customerName: pick(arch.names),
    customerTitle: `${arch.title} · Veri Kurtarma & Yazılım`,
    portraitPath: arch.portraitPath,
    device,
    dataRecoveryJob: job,
    customerPrice: job.cleanRoomPayout,
    initialCustomerPrice: job.cleanRoomPayout,
    secretLimit: job.cleanRoomPayout,
    patience: 90,
    maxPatience: 100,
    moodScore: 52,
    mood: 'thinking',
    usedLeverageDefects: [],
    teaServed: false,
    bluffUsed: false,
    honestPitchUsed: false,
    legacyDialogueUsed: false,
    rounds: 0,
    outcome: 'ACTIVE',
    messages: [
      {
        id: makeId('msg'),
        speaker: 'customer',
        text: `${job.story} (${device.brand} ${device.model})`,
        tone: 'warning',
      },
    ],
  };
}

export function createAccessoryBuyerEncounter(
  state: ShopState
): CustomerEncounter | null {
  if (!hasAccessoryLicense(state.upgrades)) return null;
  const available = Object.values(state.accessories).filter(
    (a) => a.quantity > 0 && isAccessoryUnlocked(a.id, state.shopTier, state.upgrades)
  );
  if (available.length === 0) return null;

  const archetypeId = pick([
    'student',
    'uncle',
    'influencer',
    'hustler',
    'vip',
  ] as CustomerArchetypeId[]);
  const arch = CUSTOMER_ARCHETYPES[archetypeId];

  // Pick 1 to 2 distinct stocked accessories for their basket
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  const count = Math.min(shuffled.length, Math.random() < 0.45 ? 2 : 1);
  const order: AccessoryOrderLine[] = shuffled.slice(0, count).map((item) => {
    const qty = Math.min(item.quantity, Math.random() < 0.25 ? 2 : 1);
    return {
      id: item.id,
      quantity: qty,
      unitPrice: item.retailPrice,
    };
  });

  const totalOrderPrice = order.reduce(
    (sum, line) => sum + line.quantity * line.unitPrice,
    0
  );
  const namesSummary = order
    .map((l) => `${l.quantity}x ${getAccessorySpec(l.id).name}`)
    .join(' ve ');

  // Dummy placeholder phone device for type safety
  const dummyDevice = generateBrandNewPhone(PHONE_CATALOG[0], 0);

  return {
    id: makeId('acc_enc'),
    type: 'ACCESSORY_BUYER',
    archetypeId,
    customerName: pick(arch.names),
    customerTitle: `${arch.title} · Aksesuar Müşterisi`,
    portraitPath: arch.portraitPath,
    device: dummyDevice,
    customerPrice: totalOrderPrice,
    initialCustomerPrice: totalOrderPrice,
    secretLimit: totalOrderPrice,
    patience: 100,
    maxPatience: 100,
    moodScore: 84,
    mood: 'excited',
    usedLeverageDefects: [],
    teaServed: false,
    bluffUsed: false,
    honestPitchUsed: false,
    legacyDialogueUsed: false,
    rounds: 0,
    outcome: 'ACTIVE',
    accessoryOrder: order,
    messages: [
      {
        id: makeId('msg'),
        speaker: 'customer',
        text: `${pick(ACCESSORY_BUYER_LINES[archetypeId])} (${namesSummary} — Toplam ${formatTRY(totalOrderPrice)})`,
        tone: 'neutral',
      },
    ],
  };
}

export function createExpressRepairEncounter(state: ShopState): CustomerEncounter {
  const archetypeId = pick(['student', 'uncle', 'influencer'] as CustomerArchetypeId[]);
  const arch = CUSTOMER_ARCHETYPES[archetypeId];
  const spec = pickPhoneSpecForDay(
    state.day,
    state.cash,
    state.shopTier,
    archetypeId,
    false
  );
  const repairableDefects: DefectId[] = [
    'screen_crack',
    'battery_degraded',
    'liquid_damage',
    'camera_fog',
  ];
  const defectId = pick(repairableDefects);
  const def = DEFECT_CATALOG[defectId];
  const device = generatePhoneDevice(spec, archetypeId, state.day, 0);
  device.defects = [defectId];
  device.inspected = { screen: true, battery: true, imei: true, hardware: true };

  const partCost = getRepairCost(
    defectId,
    state.upgrades,
    state.dailyNews,
    false,
    state.level,
    state.legacyPath
  );
  const cleanRoomMult = state.upgrades.includes('clean_room_lab') ? 1.35 : 1;
  const payout = roundPrice((partCost + 1800 + spec.baseValue * 0.06) * cleanRoomMult);

  const expressFaultReport = buildCustomerFaultReport(device, archetypeId, true);
  return {
    id: makeId('enc'),
    type: 'EXPRESS_REPAIR',
    archetypeId,
    customerName: pick(arch.names),
    customerTitle: `${arch.title} · Acil Servis`,
    portraitPath: arch.portraitPath,
    device,
    customerFaultReport: expressFaultReport,
    customerPrice: payout,
    initialCustomerPrice: payout,
    secretLimit: payout,
    patience: 90,
    maxPatience: 100,
    moodScore: 68,
    mood: 'happy',
    usedLeverageDefects: [],
    teaServed: false,
    bluffUsed: false,
    honestPitchUsed: false,
    legacyDialogueUsed: false,
    rounds: 0,
    outcome: 'ACTIVE',
    expressDefectId: defectId,
    expressPartCost: partCost,
    messages: [
      {
        id: makeId('msg'),
        speaker: 'customer',
        text: `Usta acil yardım! ${device.brand} ${device.model} cihazımda "${def.name}" sorunu var. ${expressFaultReport?.symptomText ?? ''} Hemen tamir edersen ${formatTRY(payout)} nakit öderim!`,
        tone: 'neutral',
      },
    ],
  };
}

export function createBulkAuctionEncounter(state: ShopState): CustomerEncounter {
  const arch = CUSTOMER_ARCHETYPES.hustler;
  const spec1 = pickPhoneSpecForDay(
    state.day,
    Math.max(14000, state.cash * 0.6),
    state.shopTier,
    'hustler',
    false
  );
  const spec2 = pickPhoneSpecForDay(
    state.day,
    Math.max(14000, state.cash * 0.6),
    state.shopTier,
    'student',
    false
  );
  const d1 = generatePhoneDevice(spec1, 'hustler', state.day);
  const d2 = generatePhoneDevice(spec2, 'student', state.day);
  const realTotal =
    calculateMarketValue(d1, false, state.dailyNews, state.upgrades) +
    calculateMarketValue(d2, false, state.dailyNews, state.upgrades);
  const bundlePrice = roundPrice(
    Math.max(4500, realTotal * (0.62 + Math.random() * 0.2))
  );

  return {
    id: makeId('enc'),
    type: 'BULK_AUCTION',
    archetypeId: 'hustler',
    customerName: pick(arch.names),
    customerTitle: 'Toptancı · Kapalı Kutu İhale',
    portraitPath: arch.portraitPath,
    device: d1,
    bundleDevices: [d1, d2],
    customerPrice: bundlePrice,
    initialCustomerPrice: bundlePrice,
    secretLimit: bundlePrice,
    patience: 100,
    maxPatience: 100,
    moodScore: 60,
    mood: 'calm',
    usedLeverageDefects: [],
    teaServed: false,
    bluffUsed: false,
    honestPitchUsed: false,
    legacyDialogueUsed: false,
    rounds: 0,
    outcome: 'ACTIVE',
    messages: [
      {
        id: makeId('msg'),
        speaker: 'customer',
        text: `Kardeşim icradan kapalı koli düştü! İçinde ${d1.brand} ${d1.model} ve ${d2.brand} ${d2.model} var ama test ettirmem. İkisini tek pakette ${formatTRY(bundlePrice)} ver götür!`,
        tone: 'warning',
      },
    ],
  };
}

export function generateDailyQueue(state: ShopState): CustomerEncounter[] {
  // Dynamic bustle: start calm at Tier 1 (6/day) and grow livelier as you expand shop, hire staff, and upgrade!
  const staffBustle =
    (state.staff.includes('apprentice') ? 1 : 0) +
    (state.staff.includes('sales_rep') ? 1 : 0);
  const upgradeBustle =
    (state.upgrades.includes('neon_sign') ? 1 : 0) +
    (state.upgrades.includes('cloud_crm') ? 1 : 0) +
    (state.upgrades.includes('vip_concierge') ? 2 : 0);
  const decorBustle = state.activeDecorations.length >= 3 ? 1 : 0;
  const queueSize = Math.min(
    26,
    SHOP_TIERS[state.shopTier].dailyCustomers + staffBustle + upgradeBustle + decorBustle
  );
  const isDay1Guided = state.day === 1;
  const listedPhones = state.inventory.filter((d) => d.listedForSale && !d.assignedToStaff);
  const usedBuyerPhoneIds = new Set<string>();
  const queue: CustomerEncounter[] = [];

  const hasRepairBench = state.upgrades.includes('repair_bench');
  const hasAccessoryStock = getTotalAccessoryStock(state.accessories) > 0;

  if (isDay1Guided) {
    // Calm Day 1 opening in a small 12m² stall: 6 focused 2nd-hand encounters
    const firstSeller = createSellerEncounter(state);
    if (listedPhones.length > 0) {
      usedBuyerPhoneIds.add(listedPhones[0].uid);
      queue.push(createBuyerEncounter(state, listedPhones[0]));
    }
    while (queue.length < queueSize - 1) {
      if (listedPhones.length > 0 && Math.random() < 0.38) {
        queue.push(createBuyerEncounter(state, pick(listedPhones)));
      } else {
        queue.push(createSellerEncounter(state));
      }
    }
    return [firstSeller, ...shuffleArray(queue)].slice(0, queueSize);
  }

  // 1. Optional Warranty Claim (1 max per day from Day 3+)
  if (state.day >= 3) {
    const warEnc = createWarrantyClaimEncounter(state);
    if (warEnc) queue.push(warEnc);
  }

  // 2. Accessory Buyers (2 to 4 per day when stock exists — steady retail cashflow!)
  if (hasAccessoryStock) {
    const accCount = Math.min(4, 2 + (state.shopTier >= 3 ? 1 : 0) + (Math.random() < 0.45 ? 1 : 0));
    for (let a = 0; a < accCount; a++) {
      const accEnc = createAccessoryBuyerEncounter(state);
      if (accEnc) queue.push(accEnc);
    }
  }

  // 3. Express Repairs & Data Recovery & Bulk Auctions (progressive from Day 2-3+)
  if (state.day >= 2 && (hasRepairBench || state.staff.includes('master_tech'))) {
    const repairCount = state.shopTier >= 3 ? 2 : 1;
    for (let r = 0; r < repairCount; r++) {
      queue.push(createExpressRepairEncounter(state));
    }
  }
  if (state.day >= 2 && Math.random() < 0.7) {
    queue.push(createDataRecoveryEncounter(state));
  }
  if (state.day >= 3 && state.cash >= 6500 && Math.random() < 0.65) {
    queue.push(createBulkAuctionEncounter(state));
  }

  // 4. Fill remaining slots with a rich MIX of Buyers, Trade-Ins, and Sellers
  let tradeInCount = 0;
  const maxTradeIns = state.shopTier >= 3 ? 2 : 1;

  while (queue.length < queueSize) {
    const availableListed = listedPhones.filter((p) => !usedBuyerPhoneIds.has(p.uid));
    const buyerChance =
      availableListed.length >= 3 ? 0.62 : availableListed.length > 0 ? 0.48 : 0;

    if (availableListed.length > 0 && Math.random() < buyerChance) {
      const target = pick(availableListed);
      usedBuyerPhoneIds.add(target.uid);
      if (state.day >= 2 && tradeInCount < maxTradeIns && target.baseValue >= 9000 && Math.random() < 0.35) {
        tradeInCount += 1;
        queue.push(createTradeInEncounter(state, target));
      } else {
        queue.push(createBuyerEncounter(state, target));
      }
    } else if (listedPhones.length > 0 && Math.random() < 0.28) {
      // Even if a listed phone already has a buyer earlier, another shopper may inquire later in the day
      const target = pick(listedPhones);
      queue.push(createBuyerEncounter(state, target));
    } else {
      queue.push(createSellerEncounter(state));
    }
  }

  // Truly shuffle all encounters so every day is varied & unpredictable!
  return shuffleArray(queue).slice(0, queueSize);
}

// === DAILY EMPIRE GENERATORS: ONLINE CLASSIFIEDS, SHIPPING ORDERS, 2-3 DAILY AUCTIONS ===

const CLASSIFIED_DISTRICTS = ['Kadıköy', 'Bakırköy', 'Şişli', 'Üsküdar', 'Beşiktaş', 'Bornova', 'Çankaya'];
const CLASSIFIED_SELLERS = ['Mert K.', 'Ayşe T.', 'Burak S.', 'Ömer D.', 'Gizem Y.', 'Hakan B.', 'Tuğçe A.'];
const SHIPPING_CITIES = ['İzmir', 'Ankara', 'Antalya', 'Bursa', 'Trabzon', 'Eskişehir', 'Adana'];

export function generateOnlineClassifieds(state: ShopState): OnlineClassifiedListing[] {
  const listings: OnlineClassifiedListing[] = [];
  const count = 4;
  for (let i = 0; i < count; i++) {
    const spec = pickPhoneSpecForDay(
      state.day,
      Math.max(18000, state.cash * 1.15),
      state.shopTier,
      i === 0 ? 'student' : i === 3 ? 'hustler' : 'influencer',
      false
    );
    const isBargain = i === 0 || Math.random() < 0.35;
    const isTrap = i === 3 && Math.random() < 0.55;
    const device = generatePhoneDevice(
      spec,
      isTrap ? 'hustler' : isBargain ? 'student' : 'influencer',
      state.day,
      0
    );
    if (isBargain && !isTrap && device.defects.length > 1) {
      device.defects = device.defects.slice(0, 1);
    }
    const fairVal = calculateMarketValue(device, false, state.dailyNews, state.upgrades);
    const askingPrice = roundPrice(
      Math.max(
        2000,
        isBargain
          ? fairVal * (0.82 + Math.random() * 0.08)
          : isTrap
          ? fairVal * (1.08 + Math.random() * 0.14)
          : fairVal * (0.92 + Math.random() * 0.1)
      )
    );
    const secretFloor = roundPrice(
      Math.max(1500, Math.min(askingPrice * 0.9, fairVal * (isTrap ? 0.8 : 0.74)))
    );
    const riskTag: OnlineClassifiedListing['riskTag'] = isBargain
      ? 'Kelepir Fırsat'
      : isTrap
      ? 'Şüpheli İlan'
      : 'Temiz İlan';

    listings.push({
      id: makeId('cls'),
      sellerName: pick(CLASSIFIED_SELLERS),
      district: pick(CLASSIFIED_DISTRICTS),
      title: `${device.brand} ${device.model} (${device.storage})`,
      sellerNote: isBargain
        ? 'Acil nakit ihtiyacından bırakıyorum; yerinde bakıp test edebilirsin!'
        : isTrap
        ? 'Kutusu yok, ufak tefek detayları olabilir ama çalışıyor.'
        : 'Kılıfla kullanıldı, gelip inceleyebilir veya kapıda kontrollü kargo isteyebilirsin.',
      askingPrice,
      currentPrice: askingPrice,
      secretFloor,
      device,
      riskTag,
      bought: false,
      status: 'AVAILABLE',
      haggleAttempts: 0,
    });
  }
  return listings;
}

export function evaluateClassifiedHaggle(
  listing: OnlineClassifiedListing,
  offerPrice: number
): {
  updatedListing: OnlineClassifiedListing;
  accepted: boolean;
  rejectedWalkout: boolean;
  message: string;
} {
  const attempts = (listing.haggleAttempts ?? 0) + 1;
  const current = listing.currentPrice ?? listing.askingPrice;
  const floor = listing.secretFloor ?? roundPrice(listing.askingPrice * 0.8);
  const defectsFound = listing.device.defects.length;

  // Exposing real defects lowers the seller's effective floor!
  const effectiveFloor = roundPrice(
    Math.max(1200, floor * (1 - Math.min(0.18, defectsFound * 0.06)))
  );

  if (offerPrice >= current) {
    return {
      updatedListing: {
        ...listing,
        currentPrice: offerPrice,
        haggleAttempts: attempts,
        lastSellerReply: 'Tamamdır, el sıkıştık! Cihaz senin.',
      },
      accepted: true,
      rejectedWalkout: false,
      message: 'Satıcı teklifini kabul etti!',
    };
  }

  if (offerPrice >= effectiveFloor && (attempts >= 2 || offerPrice >= current * 0.92)) {
    return {
      updatedListing: {
        ...listing,
        currentPrice: offerPrice,
        haggleAttempts: attempts,
        lastSellerReply: `Kusurları gördün haklısın, ${formatTRY(offerPrice)} olsun hayrını gör!`,
      },
      accepted: true,
      rejectedWalkout: false,
      message: `Pazarlık başarılı! ${formatTRY(offerPrice)} fiyata anlaştın!`,
    };
  }

  if (attempts >= 3 || offerPrice < effectiveFloor * 0.72) {
    return {
      updatedListing: {
        ...listing,
        status: 'REJECTED',
        haggleAttempts: attempts,
        lastSellerReply: 'Çok ölü fiyat verdin usta, satmaktan vazgeçtim!',
      },
      accepted: false,
      rejectedWalkout: true,
      message: 'Satıcı pazarlıktan çekildi, ilan kapandı.',
    };
  }

  const nextCounter = roundPrice(
    Math.max(effectiveFloor, current - Math.max(250, (current - Math.max(effectiveFloor, offerPrice)) * 0.5))
  );
  const reply =
    defectsFound > 0
      ? `Haklısın ${defectsFound} kusuru çıktı ama ${formatTRY(offerPrice)} az! En son ${formatTRY(nextCounter)} bırakırım.`
      : `Cihaz temiz usta, o kadar kıramam. Gel ortada ${formatTRY(nextCounter)} olsun.`;

  return {
    updatedListing: {
      ...listing,
      currentPrice: nextCounter,
      haggleAttempts: attempts,
      lastSellerReply: reply,
    },
    accepted: false,
    rejectedWalkout: false,
    message: reply,
  };
}

export function generateShippingOrders(state: ShopState): ShippingOrder[] {
  const tiers: PhoneTier[] =
    state.day < 2
      ? ['entry', 'mid']
      : state.day < 5
      ? ['entry', 'mid', 'flagship']
      : ['mid', 'flagship', 'luxury'];

  return [0, 1, 2].map((idx) => {
    const requestedTier = tiers[idx % tiers.length];
    const requireClean = idx !== 0;
    return {
      id: makeId('ship'),
      buyerName: pick(CLASSIFIED_SELLERS),
      city: pick(SHIPPING_CITIES),
      requestedTier,
      requireClean,
      bonusMultiplier: requireClean ? 1.2 : 1.13,
      shippingFee: 250,
      note: requireClean
        ? 'Kargoyla sorunsuz, kusursuz cihaz arıyorum. Piyasa üstü öderim!'
        : 'Şehir dışındayım, sağlam çalışan uygun bir cihaz kargolarsan hemen onaylarım.',
      fulfilled: false,
    };
  });
}

const AUCTION_TIER_PRESETS: Array<{
  sessionLabel: string;
  minShopTier: ShopTier;
  deviceCount: number;
  budgetFloor: number;
  startRatio: number;
  riskTag: string;
  manifestHint: string;
  archetype: CustomerArchetypeId;
  bonusAccessories: { id: AccessoryId; quantity: number }[];
}> = [
  {
    sessionLabel: 'Pasaj İcra Kolisi',
    minShopTier: 1,
    deviceCount: 2,
    budgetFloor: 14000,
    startRatio: 0.5,
    riskTag: 'Düşük Risk',
    manifestHint: 'Giriş & orta segment 2. el koli + 1 Gizemli Kutu',
    archetype: 'student',
    bonusAccessories: [
      { id: 'tempered_glass', quantity: 4 },
      { id: 'magsafe_case', quantity: 2 },
    ],
  },
  {
    sessionLabel: 'Semt İkinci El Sandığı',
    minShopTier: 1,
    deviceCount: 3,
    budgetFloor: 32000,
    startRatio: 0.54,
    riskTag: 'Orta Risk',
    manifestHint: 'Karma vitrin cihazları + 1 Gizemli Kutu · Kozmetik sürprizler',
    archetype: 'hustler',
    bonusAccessories: [
      { id: 'car_mount', quantity: 2 },
      { id: 'magsafe_case', quantity: 3 },
    ],
  },
  {
    sessionLabel: 'Gümrük Kapalı Paleti',
    minShopTier: 2,
    deviceCount: 3,
    budgetFloor: 72000,
    startRatio: 0.57,
    riskTag: 'Orta-Yüksek Risk',
    manifestHint: 'Gümrük mühürlü palet + 2 Gizemli Kutu · Yurt dışı & amiral karışımı',
    archetype: 'influencer',
    bonusAccessories: [
      { id: 'gan_charger', quantity: 3 },
      { id: 'powerbank', quantity: 2 },
    ],
  },
  {
    sessionLabel: 'Telekom Tasfiye Kasası',
    minShopTier: 3,
    deviceCount: 4,
    budgetFloor: 155000,
    startRatio: 0.6,
    riskTag: 'Yüksek Risk',
    manifestHint: 'Kurumsal filo iade kasası + 2 Gizemli Kutu · Sert rakip çekişmesi',
    archetype: 'vip',
    bonusAccessories: [
      { id: 'tws_earbuds', quantity: 2 },
      { id: 'gan_charger', quantity: 3 },
    ],
  },
  {
    sessionLabel: 'Havalimanı VIP Konteyneri',
    minShopTier: 4,
    deviceCount: 4,
    budgetFloor: 320000,
    startRatio: 0.63,
    riskTag: 'Yüksek Bahis',
    manifestHint: 'Üst segment amiral & VIP koli + 2-3 Gizemli Kutu · Büyük sermaye mezatı',
    archetype: 'vip',
    bonusAccessories: [
      { id: 'tws_earbuds', quantity: 3 },
      { id: 'powerbank', quantity: 3 },
    ],
  },
  {
    sessionLabel: 'İthalatçı Amiral Kasası',
    minShopTier: 5,
    deviceCount: 5,
    budgetFloor: 680000,
    startRatio: 0.66,
    riskTag: 'VIP Büyük İhale',
    manifestHint: 'Amiral gemisi & katlanabilir lüks seri + 3 Gizemli Kutu · İmparatorluk mezatı',
    archetype: 'vip',
    bonusAccessories: [
      { id: 'tws_earbuds', quantity: 4 },
      { id: 'gan_charger', quantity: 4 },
    ],
  },
];

// Base accumulated-cash thresholds for the 6 auction tiers (dynamically scaled by day & player wealth!)
const AUCTION_BASE_CASH_GATES = [0, 30000, 85000, 210000, 500000, 1200000];

function rollAuctionMysteryBoxes(
  count: number,
  state: ShopState,
  sessionIndex: number,
  wealthScale: number
): AuctionMysteryReward[] {
  const rewards: AuctionMysteryReward[] = [];
  const boxNames = [
    'Mühürlü Gümrük Kutusu',
    'Kayıtsız Depo Sandığı',
    'VIP Sürpriz Kolisi',
  ];

  for (let i = 0; i < count; i++) {
    const roll = Math.random();
    const boxLabel = `${boxNames[i % boxNames.length]} #${i + 1}`;
    if (roll < 0.42) {
      // Surprise Bonus Phone inside the Mystery Box!
      const tierCandidates = PHONE_CATALOG.filter((p) => {
        if (sessionIndex >= 4) return p.tier === 'flagship' || p.tier === 'luxury';
        if (sessionIndex >= 2) return p.tier === 'mid' || p.tier === 'flagship';
        return p.tier === 'entry' || p.tier === 'mid';
      });
      const spec = pick(tierCandidates.length > 0 ? tierCandidates : PHONE_CATALOG);
      const bonusPhone = generatePhoneDevice(spec, 'vip', state.day, 0);
      // Mystery box phones have a chance of being crisp or having 1 minor quirk
      if (Math.random() < 0.55) {
        bonusPhone.defects = [];
        bonusPhone.imeiStatus = 'TR_REGISTERED';
      }
      rewards.push({
        id: makeId('mbox'),
        boxLabel,
        rewardTitle: `Sürpriz Cihaz: ${bonusPhone.brand} ${bonusPhone.model}`,
        rewardDetail:
          bonusPhone.defects.length === 0
            ? 'Kutudan tertemiz, TR kayıtlı ekstra cihaz çıktı!'
            : 'Kutudan ekstra 2. el cihaz çıktı — atölyede incele!',
        extraDevice: bonusPhone,
      });
    } else if (roll < 0.74) {
      // Hidden Cash Envelope / Unclaimed Warranty Refund Voucher
      const cashBonus = roundPrice(
        (2500 + sessionIndex * 4500) * wealthScale * (0.85 + Math.random() * 0.45)
      );
      rewards.push({
        id: makeId('mbox'),
        boxLabel,
        rewardTitle: `Koli İçi Nakit İade & Çek: +${formatTRY(cashBonus)}`,
        rewardDetail: 'Gümrük ganimetinden toptan nakit iade çeki çıktı, doğrudan kasaya eklendi!',
        cashBonus,
      });
    } else {
      // High-margin Bulk Accessory Stash
      const accPool: AccessoryId[] =
        sessionIndex >= 3
          ? ['tws_earbuds', 'powerbank', 'gan_charger']
          : ['magsafe_case', 'tempered_glass', 'gan_charger', 'car_mount'];
      const accId = pick(accPool);
      const accSpec = getAccessorySpec(accId);
      const qty = 3 + Math.min(6, sessionIndex + Math.floor(Math.random() * 3));
      rewards.push({
        id: makeId('mbox'),
        boxLabel,
        rewardTitle: `Toptan Aksesuar Zulasından ${qty}x ${accSpec.name}`,
        rewardDetail: 'Kutunun dibinden sıfır paketli aksesuar stoğu çıktı, reyona eklendi!',
        bonusAccessory: { id: accId, quantity: qty },
      });
    }
  }
  return rewards;
}

export function generateDailyAuctionLot(
  state: ShopState,
  sessionIndex = 0
): CustomsAuctionLot {
  const preset = AUCTION_TIER_PRESETS[sessionIndex % AUCTION_TIER_PRESETS.length];

  // Dynamic Wealth & Day Scaling Algorithm:
  // As player gets richer (accumulated cash + career profits) and advances in days,
  // auction device counts, values, cash unlock thresholds, and mystery boxes scale upward!
  const effectiveWealth = Math.max(
    state.cash,
    state.cash + Math.max(0, state.totalProfitEarned) * 0.25
  );
  const dayFactor = 1 + Math.min(1.6, Math.max(0, state.day - 1) * 0.055);
  const wealthFactor =
    1 + Math.min(2.2, Math.log10(1 + effectiveWealth / 40000) * 0.75);
  const combinedScale = Number((dayFactor * 0.45 + wealthFactor * 0.55).toFixed(2));

  // Scale cash unlock threshold dynamically with player progress (Lot 0 always 0 ₺!)
  const baseCashGate = AUCTION_BASE_CASH_GATES[sessionIndex] ?? 0;
  const requiredCash =
    baseCashGate === 0
      ? 0
      : roundPrice(baseCashGate * (1 + Math.min(1.15, (dayFactor - 1) * 0.45 + (wealthFactor - 1) * 0.35)));

  // Scale device count slightly higher as player gets wealthy (up to 5 phones!)
  const extraDeviceByWealth =
    effectiveWealth >= 450000 && sessionIndex >= 2
      ? 1
      : effectiveWealth >= 180000 && sessionIndex >= 4
      ? 1
      : 0;
  const deviceCount = Math.min(5, preset.deviceCount + extraDeviceByWealth);

  // Mystery Box count scales with lot tier AND accumulated wealth (1 → 3 boxes!)
  const baseBoxes = sessionIndex >= 4 ? 2 : sessionIndex >= 2 ? 2 : 1;
  const bonusBox = effectiveWealth >= 250000 && sessionIndex >= 3 ? 1 : 0;
  const mysteryBoxCount = Math.min(3, baseBoxes + bonusBox);

  const devices: PhoneDevice[] = [];
  let totalMarket = 0;

  for (let i = 0; i < deviceCount; i++) {
    const scaledBudget = Math.max(
      preset.budgetFloor * combinedScale,
      effectiveWealth * (0.45 + sessionIndex * 0.14)
    );
    const virtualTier = Math.min(
      6,
      Math.max(
        state.shopTier,
        preset.minShopTier,
        effectiveWealth >= 600000 ? 5 : effectiveWealth >= 200000 ? 4 : 1
      )
    ) as ShopTier;
    const spec = pickPhoneSpecForDay(
      Math.max(state.day + sessionIndex * 2, preset.minShopTier * 3),
      scaledBudget,
      virtualTier,
      preset.archetype,
      false
    );
    const dev = generatePhoneDevice(spec, 'hustler', state.day, 0);
    devices.push(dev);
    totalMarket += calculateMarketValue(dev, false, state.dailyNews, state.upgrades);
  }

  // Starting bid scales with total market + dynamic difficulty multiplier + mystery box premium
  const mysteryPremium = mysteryBoxCount * (2200 + sessionIndex * 1800) * Math.min(2, combinedScale);
  const dynamicRatio = Math.min(0.76, preset.startRatio + Math.min(0.08, (combinedScale - 1) * 0.04));
  const startingBid = roundPrice(Math.max(6500, totalMarket * dynamicRatio + mysteryPremium * 0.45));

  const mysteryRewards = rollAuctionMysteryBoxes(
    mysteryBoxCount,
    state,
    sessionIndex,
    combinedScale
  );

  const difficultyTag =
    sessionIndex >= 5
      ? 'Efsanevi Zorluk · Dev Sermaye'
      : sessionIndex >= 4
      ? 'Çok Zor · VIP Rekabet'
      : sessionIndex >= 3
      ? 'Zor · Kurumsal Mezadı'
      : sessionIndex >= 2
      ? 'Orta-Zor · Gümrük Rekabeti'
      : sessionIndex === 1
      ? 'Orta · Semt Mezadı'
      : 'Standart · Açık Giriş';

  return {
    id: makeId('auc_lot'),
    sessionLabel: preset.sessionLabel,
    lotTitle: `${preset.sessionLabel} #${100 + state.day * 9 + sessionIndex} (${deviceCount} Cihaz + ${mysteryBoxCount} Kutu)`,
    description: `Mühürlü koli! İçerisinde ${deviceCount} cihaz (${devices.map((d) => `${d.brand} ${d.model}`).join(', ')}), ${mysteryBoxCount} adet sürpriz Gizemli Kutu ve bonus aksesuar kolisi bulunuyor!`,
    startingBid,
    requiredCash,
    mysteryBoxCount,
    mysteryRewards,
    difficultyTag,
    minShopTier: preset.minShopTier,
    riskTag: preset.riskTag,
    manifestHint: `${preset.manifestHint} · Ölçek x${combinedScale.toFixed(1)}`,
    devices,
    bonusAccessories: preset.bonusAccessories,
    resolved: false,
    wonByPlayer: false,
    winningBid: startingBid,
  };
}

export function generateDailyAuctionLots(state: ShopState): CustomsAuctionLot[] {
  return AUCTION_TIER_PRESETS.map((_, idx) => generateDailyAuctionLot(state, idx));
}

// === TIMED PROJECTS, WHOLESALE CARGO, STAFF REPAIR QUEUE, RANDOM STORE EVENTS ===

export function maybeTriggerRandomStoreEvent(
  state: ShopState
): RandomStoreEvent | null {
  if (state.activeStoreEvent || state.storeEventsTriggeredToday >= 2) return null;
  if (Math.random() > 0.48) return null;
  const eligible = RANDOM_STORE_EVENTS.filter((ev) => {
    const minOk = ev.minShopTier ? state.shopTier >= ev.minShopTier : true;
    const maxOk = ev.maxShopTier ? state.shopTier <= ev.maxShopTier : true;
    const notRepeat =
      state.nextCustomerEventEffect?.title !== ev.title &&
      state.nextCustomerEventEffect?.title !== `${ev.title} (Çözüldü)`;
    return minOk && maxOk && notRepeat;
  });
  const pool = eligible.length > 0 ? eligible : RANDOM_STORE_EVENTS;
  const tpl = pick(pool);
  return {
    ...tpl,
    id: makeId('evt'),
    resolved: false,
  };
}

export function applyEventEffectToEncounter(
  encounter: CustomerEncounter,
  effect: NextCustomerEventEffect | null
): CustomerEncounter {
  if (!effect) return encounter;
  const nextMood = Math.max(8, Math.min(100, encounter.moodScore + effect.moodDelta));
  const nextPatience = Math.max(15, Math.min(100, encounter.patience + effect.patienceDelta));
  let nextLimit = encounter.secretLimit;
  let nextPrice = encounter.customerPrice;

  if (encounter.type === 'BUYER' || encounter.type === 'TRADE_IN') {
    const cap =
      encounter.type === 'TRADE_IN'
        ? Math.min(encounter.device.askingPrice - 500, Math.max(encounter.secretLimit, encounter.customerPrice))
        : encounter.device.askingPrice;
    nextLimit = Math.min(cap, roundPrice(encounter.secretLimit * effect.budgetMultiplier));
    nextPrice = Math.min(cap, roundPrice(encounter.customerPrice * effect.budgetMultiplier));
  } else if (encounter.type === 'SELLER' && effect.budgetMultiplier !== 1) {
    // Better mood softens seller ask slightly
    const inv = 2 - effect.budgetMultiplier;
    nextLimit = roundPrice(Math.max(1000, encounter.secretLimit * inv));
  }

  return {
    ...encounter,
    moodScore: nextMood,
    mood: deriveMoodFromScore(nextMood),
    patience: nextPatience,
    secretLimit: nextLimit,
    customerPrice: nextPrice,
    lastMoodReason: `Mağaza Olayı: ${effect.title} (${effect.moodDelta >= 0 ? '+' : ''}${effect.moodDelta})`,
    messages: [
      ...encounter.messages,
      {
        id: makeId('msg'),
        speaker: 'system',
        text: `Mağaza Atmosferi: ${effect.title} müşteriyi etkiledi (${effect.moodDelta >= 0 ? '+' : ''}${effect.moodDelta} Ruh Hali).`,
        tone: effect.moodDelta >= 0 ? 'positive' : 'warning',
      },
    ],
  };
}

export function advanceStaffRepairsOnTurn(state: ShopState): {
  updatedQueue: StaffRepairJob[];
  updatedInventory: PhoneDevice[];
  completedPayoutGross: number;
  completedTax: number;
  completedCount: number;
  completedExpressCount: number;
  xpEarned: number;
  notifications: string[];
} {
  if (!state.staffRepairQueue || state.staffRepairQueue.length === 0) {
    return {
      updatedQueue: [],
      updatedInventory: state.inventory,
      completedPayoutGross: 0,
      completedTax: 0,
      completedCount: 0,
      completedExpressCount: 0,
      xpEarned: 0,
      notifications: [],
    };
  }

  const nextQueue: StaffRepairJob[] = [];
  let nextInventory = [...state.inventory];
  let completedPayoutGross = 0;
  let completedTax = 0;
  let completedCount = 0;
  let completedExpressCount = 0;
  let xpEarned = 0;
  const notifications: string[] = [];

  for (const job of state.staffRepairQueue) {
    const rem = job.turnsRemaining - 1;
    if (rem > 0) {
      nextQueue.push({ ...job, turnsRemaining: rem });
      continue;
    }

    completedCount += 1;
    if (job.mode === 'INVENTORY' && job.phoneUid) {
      xpEarned += 35 + job.defectIds.length * 10;
      nextInventory = nextInventory.map((p) => {
        if (p.uid !== job.phoneUid) return p;
        const fixedBattery =
          job.defectIds.includes('battery_degraded') ||
          job.defectIds.includes('battery_fake_chip');
        const nextOrigins = { ...(p.repairedPartOrigins ?? {}) };
        for (const d of job.defectIds) {
          nextOrigins[d] = 'OEM_STOCK';
        }
        const nextPhone: PhoneDevice = {
          ...p,
          defects: p.defects.filter((d) => !job.defectIds.includes(d)),
          repairedDefects: [...p.repairedDefects, ...job.defectIds],
          repairedPartOrigins: nextOrigins,
          assignedToStaff: false,
          masterCrafted: true,
          lastRepairQuality: 'MASTER',
          batteryHealth: fixedBattery ? 100 : p.batteryHealth,
          reportedBatteryHealth: fixedBattery ? 100 : p.reportedBatteryHealth,
          batteryCycles: fixedBattery ? 1 : p.batteryCycles,
        };
        nextPhone.askingPrice = Math.max(
          nextPhone.askingPrice,
          roundPrice(
            calculateMarketValue(
              nextPhone,
              false,
              state.dailyNews,
              state.upgrades,
              state.day
            ) * 1.15
          )
        );
        return nextPhone;
      });
      notifications.push(`Hasan Usta ${job.deviceName} tamirini Usta İşi bitirdi ve atölyeye bıraktı!`);
    } else if (job.mode === 'EXPRESS_CUSTOMER') {
      completedExpressCount += 1;
      xpEarned += 45;
      const { taxAmount, netAmount } = calculateSaleTax(
        job.payout,
        state.staff,
        state.staffLevels
      );
      completedPayoutGross += job.payout;
      completedTax += taxAmount;
      notifications.push(
        `Hasan Usta ${job.customerName ?? 'müşterinin'} ${job.deviceName} tamirini teslim etti! (+${formatTRY(netAmount)} net, ${formatTRY(taxAmount)} vergi)`
      );
    }
  }

  return {
    updatedQueue: nextQueue,
    updatedInventory: nextInventory,
    completedPayoutGross,
    completedTax,
    completedCount,
    completedExpressCount,
    xpEarned,
    notifications,
  };
}

export function advanceDayTimers(
  state: ShopState,
  nextNews?: DailyMarketEvent
): {
  shopTier: ShopTier;
  showcaseUpgradeLevel: number;
  upgrades: UpgradeId[];
  branches: BranchId[];
  staffLevels: Record<StaffId, number>;
  pendingProjects: TimedProject[];
  pendingWholesaleOrders: PendingWholesaleOrder[];
  accessories: Record<AccessoryId, AccessoryStockItem>;
  inventory: PhoneDevice[];
  onlineListings: OnlineClassifiedListing[];
  arrivedSpecIds: string[];
  notifications: string[];
} {
  let shopTier = state.shopTier;
  let showcaseUpgradeLevel = state.showcaseUpgradeLevel ?? 0;
  const upgrades = [...state.upgrades];
  const branches = [...state.branches];
  const staffLevels = { ...state.staffLevels };
  const remainingProjects: TimedProject[] = [];
  const notifications: string[] = [];

  for (const proj of state.pendingProjects ?? []) {
    const rem = proj.daysRemaining - 1;
    if (rem > 0) {
      remainingProjects.push({ ...proj, daysRemaining: rem });
      continue;
    }
    if (proj.kind === 'SHOP_TIER') {
      const nextTier = Number(proj.targetId) as ShopTier;
      if (nextTier > shopTier) {
        shopTier = nextTier;
        notifications.push(`Tadilat bitti! Yeni dükkanın "${SHOP_TIERS[nextTier].name}" açıldı!`);
      }
    } else if (proj.kind === 'UPGRADE') {
      const uId = proj.targetId as UpgradeId;
      if (!upgrades.includes(uId)) {
        upgrades.push(uId);
        notifications.push(`Kurulum tamamlandı: ${proj.label} artık aktif!`);
      }
    } else if (proj.kind === 'BRANCH') {
      const bId = proj.targetId as BranchId;
      if (!branches.includes(bId)) {
        branches.push(bId);
        notifications.push(`İnşaat bitti! Yeni şuben "${proj.label}" günlük kazanç üretmeye başladı!`);
      }
    } else if (proj.kind === 'STAFF_TRAIN') {
      const sId = proj.targetId as StaffId;
      const nextLvl = Math.min(10, (staffLevels[sId] ?? 1) + 1);
      staffLevels[sId] = nextLvl;
      notifications.push(`Eğitim tamamlandı: ${proj.label} artık Sv.${nextLvl} oldu!`);
    } else if (proj.kind === 'SHOWCASE_UPGRADE') {
      showcaseUpgradeLevel += 1;
      notifications.push(
        `Vitrin genişletme bitti! Vitrin Rafı Sv.${showcaseUpgradeLevel} (+2 yuva eklendi).`
      );
    }
  }

  // Advance pending wholesale cargo orders
  const accessories = { ...state.accessories };
  const inventory = [...state.inventory];
  const remainingOrders: PendingWholesaleOrder[] = [];
  const arrivedSpecIds: string[] = [];
  const pricingNews = nextNews ?? state.dailyNews;

  for (const ord of state.pendingWholesaleOrders ?? []) {
    const rem = ord.daysRemaining - 1;
    if (rem > 0) {
      remainingOrders.push({ ...ord, daysRemaining: rem });
      continue;
    }
    if (ord.kind === 'ACCESSORY' && ord.accessoryId && ord.quantity) {
      const cur = accessories[ord.accessoryId];
      if (cur) {
        accessories[ord.accessoryId] = {
          ...cur,
          quantity: cur.quantity + ord.quantity,
        };
      }
      notifications.push(`Toptan kargo ulaştı: ${ord.label} raflara dizildi!`);
    } else if (ord.kind === 'PHONE' && ord.specId) {
      const spec = PHONE_CATALOG.find((p) => p.id === ord.specId);
      if (spec) {
        const phone = generateBrandNewPhone(spec, ord.wholesaleCost, pricingNews);
        inventory.push(phone);
        arrivedSpecIds.push(spec.id);
        notifications.push(`Distribütör kargosu geldi: Sıfır ${spec.brand} ${spec.model} stoğa girdi!`);
      }
    }
  }

  // Keep any COD classifieds in transit & mark them ARRIVED_COD for inspection!
  const arrivedCodListings: OnlineClassifiedListing[] = (state.onlineListings ?? [])
    .filter((l) => l.status === 'SHIPPING_IN_TRANSIT')
    .map((l) => {
      notifications.push(
        `Kapıda Kontrollü Kargo geldi: ${l.title} — Piyasa sekmesinden kutuyu açıp test et!`
      );
      return {
        ...l,
        status: 'ARRIVED_COD' as const,
        deliveryDaysLeft: 0,
        device: {
          ...l.device,
          inspected: { screen: true, battery: true, imei: true, hardware: true },
        },
      };
    });

  return {
    shopTier,
    showcaseUpgradeLevel,
    upgrades,
    branches,
    staffLevels,
    pendingProjects: remainingProjects,
    pendingWholesaleOrders: remainingOrders,
    accessories,
    inventory,
    onlineListings: arrivedCodListings,
    arrivedSpecIds,
    notifications,
  };
}

export function computeOfflineEarnings(state: ShopState): OfflineEarningsSummary | null {
  if (!state.lastSavedAt) return null;
  const elapsedMs = Date.now() - state.lastSavedAt;
  const minutesAway = Math.floor(elapsedMs / 60000);
  if (minutesAway < 2) return null;

  const cappedMinutes = Math.min(720, minutesAway); // Max 12 hours idle bank
  const hours = cappedMinutes / 60;
  let hourlyTotal = 0;
  const sources: string[] = [];

  if (state.staff.includes('apprentice')) {
    const lvl = state.staffLevels?.apprentice ?? 1;
    const rate = 260 * lvl;
    hourlyTotal += rate;
    sources.push(`Çırak Emre (Sv.${lvl}) reyon satışı`);
  }
  if (state.staff.includes('sales_rep')) {
    const lvl = state.staffLevels?.sales_rep ?? 1;
    const rate = 380 * lvl;
    hourlyTotal += rate;
    sources.push(`Danışman Zeynep (Sv.${lvl}) sosyal medya siparişi`);
  }
  if (state.staff.includes('master_tech')) {
    const lvl = state.staffLevels?.master_tech ?? 1;
    const rate = 320 * lvl;
    hourlyTotal += rate;
    sources.push(`Hasan Usta (Sv.${lvl}) gece servisi`);
  }
  for (const branchId of state.branches ?? []) {
    const b = CITY_BRANCHES.find((x) => x.id === branchId);
    if (b) {
      hourlyTotal += b.offlineHourlyRate;
      sources.push(b.name);
    }
  }
  for (const mId of state.museumItems ?? []) {
    const m = MUSEUM_ITEMS.find((x) => x.id === mId);
    if (m) {
      hourlyTotal += Math.round(m.dailyPassiveCash / 4);
    }
  }
  if ((state.museumItems ?? []).length > 0) {
    sources.push(`Nostalji Müzesi (${state.museumItems.length} parça)`);
  }

  // Even without staff, a small baseline online/passive accessory trickles in so players always feel welcomed back
  if (hourlyTotal === 0) {
    hourlyTotal = 180;
    sources.push('Gece internet ilanlarından aksesuar siparişi');
  }

  const baseCash = Math.max(150, Math.round((hourlyTotal * hours) / 50) * 50);
  return {
    minutesAway: cappedMinutes,
    baseCash,
    sources,
  };
}

export function processEmpireEndOfDay(state: ShopState): {
  branchIncome: number;
  passive2xApplied: boolean;
  loanPayments: number;
  updatedLoans: ActiveLoan[];
  paidOffLoans: ActiveLoan[];
  allLoansCleared: boolean;
  newWeeklyTaxDue: number;
  overdueTaxRepDelta: number;
  overdueTaxNotice: string | null;
  updatedRival: ShopState['rival'];
} {
  let branchIncome = 0;
  for (const bId of state.branches ?? []) {
    const spec = CITY_BRANCHES.find((b) => b.id === bId);
    if (spec) branchIncome += spec.dailyNetIncome;
  }
  for (const mId of state.museumItems ?? []) {
    const m = MUSEUM_ITEMS.find((x) => x.id === mId);
    if (m) branchIncome += m.dailyPassiveCash;
  }
  if (state.rival?.boughtOut) {
    branchIncome += 3500; // Kurnaz Kerim's former corner shop net income!
  }
  const passive2xApplied =
    branchIncome > 0 && (state.adState?.passiveIncome2xDay ?? 0) === state.day;
  if (passive2xApplied) {
    branchIncome = Math.round(branchIncome * 2);
  }

  let loanPayments = 0;
  const updatedLoans: ActiveLoan[] = [];
  const paidOffLoans: ActiveLoan[] = [];
  for (const loan of state.activeLoans ?? []) {
    const pay = Math.min(loan.remainingBalance, loan.dailyPayment);
    loanPayments += pay;
    const rem = loan.remainingBalance - pay;
    const daysLeft = Math.max(0, loan.daysLeft - 1);
    if (rem > 0 && daysLeft > 0) {
      updatedLoans.push({ ...loan, remainingBalance: rem, daysLeft });
    } else {
      paidOffLoans.push(loan);
    }
  }

  const nextDay = state.day + 1;
  const prevTaxDue = state.weeklyTaxDue ?? 0;
  let overdueTaxFee = 0;
  let overdueTaxRepDelta = 0;
  let overdueTaxNotice: string | null = null;
  if (nextDay % 7 === 0 && prevTaxDue > 0) {
    overdueTaxFee = Math.max(250, Math.round((prevTaxDue * 0.1) / 50) * 50);
    overdueTaxRepDelta = -0.15;
    overdueTaxNotice = `Maliye Gecikme İhbarı: Ödenmemiş ${formatTRY(prevTaxDue)} vergi borcuna +${formatTRY(overdueTaxFee)} gecikme faizi eklendi (-0.15★).`;
  }

  const rawTaxAdd =
    nextDay % 7 === 0
      ? 1800 + state.shopTier * 1400 + (state.branches?.length ?? 0) * 1600
      : 0;
  // Mali Müşavir Selma Hanım reduces weekly tax burden by 15%..55%
  const accLvl = state.staff.includes('accountant') ? state.staffLevels?.accountant ?? 1 : 0;
  const accTaxMult = accLvl > 0 ? Math.max(0.45, 0.9 - accLvl * 0.045) : 1;
  const taxAdd = Math.round((rawTaxAdd * accTaxMult) / 50) * 50;
  const newWeeklyTaxDue = prevTaxDue + overdueTaxFee + taxAdd;

  const salesRepLvl = state.staff.includes('sales_rep')
    ? state.staffLevels?.sales_rep ?? 1
    : 0;
  const rivalShareDrift = state.rival.boughtOut
    ? 0
    : salesRepLvl >= 2
    ? -Math.min(6, 2 + Math.floor(salesRepLvl / 2))
    : state.todayStats.phonesSold >= 2
    ? -2
    : 2;
  const nextRivalShare = state.rival.boughtOut
    ? 0
    : Math.max(5, Math.min(85, state.rival.marketShare + rivalShareDrift));

  const rivalTaunts = [
    'Kurnaz Kerim: "Benim vitrinde bugün kılıf bedava, bakalım müşteri kime gidecek!"',
    'Kurnaz Kerim: "Genç esnaf iyi gidiyorsun ama pasajın tapusu hâlâ bende!"',
    'Kurnaz Kerim: "Müşterilerin yarısı senin dükkanı soruyor, işlerim düştü!"',
  ];

  return {
    branchIncome,
    passive2xApplied,
    loanPayments,
    updatedLoans,
    paidOffLoans,
    allLoansCleared:
      paidOffLoans.length > 0 && updatedLoans.length === 0,
    newWeeklyTaxDue,
    overdueTaxRepDelta,
    overdueTaxNotice,
    updatedRival: {
      ...state.rival,
      marketShare: nextRivalShare,
      promoUsedToday: false,
      lastTaunt:
        state.rival.boughtOut
          ? 'Kurnaz Kerim’in eski dükkanı artık senin markan altında günlük +3.500 ₺ kazandırıyor!'
          : nextRivalShare <= 25
          ? rivalTaunts[2]
          : pick(rivalTaunts.slice(0, 2)),
    },
  };
}

export function simulateEndOfDayAccessorySales(state: ShopState): {
  updatedAccessories: Record<AccessoryId, AccessoryStockItem>;
  unitsSold: number;
  revenue: number;
  profit: number;
  note?: string;
} {
  const updated: Record<AccessoryId, AccessoryStockItem> = { ...state.accessories };
  let unitsSold = 0;
  let revenue = 0;
  let profit = 0;

  const appLvl = state.staff.includes('apprentice') ? state.staffLevels?.apprentice ?? 1 : 0;
  const tierFactor = 1 + (state.shopTier - 1) * 0.42;
  const trafficMultiplier =
    tierFactor *
    (state.upgrades.includes('neon_sign') ? 1.25 : 1.0) *
    (state.upgrades.includes('barcode_automation') ? 1.35 : 1.0) *
    (appLvl > 0 ? 1 + 0.12 + appLvl * 0.08 : 1.0);

  for (const spec of ACCESSORY_CATALOG) {
    if (!isAccessoryUnlocked(spec.id, state.shopTier, state.upgrades)) continue;
    const stock = updated[spec.id];
    if (!stock || stock.quantity <= 0) continue;

    const priceRatio = stock.retailPrice / spec.recommendedPrice;
    const priceFactor =
      priceRatio <= 0.9
        ? 1.35
        : priceRatio <= 1.08
        ? 1.0
        : priceRatio <= 1.25
        ? 0.6
        : 0.25;

    const expectedSales =
      spec.demandWeight * priceFactor * trafficMultiplier * (0.45 + Math.random() * 0.85);
    const sold = Math.min(stock.quantity, Math.floor(expectedSales));

    if (sold > 0) {
      updated[spec.id] = {
        ...stock,
        quantity: stock.quantity - sold,
        totalSold: stock.totalSold + sold,
      };
      unitsSold += sold;
      revenue += sold * stock.retailPrice;
      profit += sold * (stock.retailPrice - spec.wholesaleCost);
    }
  }

  return {
    updatedAccessories: updated,
    unitsSold,
    revenue,
    profit,
    note:
      unitsSold > 0
        ? bi(
            `Gün boyunca reyon vitrininden ${unitsSold} aksesuar satıldı (+${formatTRY(revenue)}).`,
            `${unitsSold} accessories sold from the display shelf today (+${formatTRY(revenue)}).`
          )
        : undefined,
  };
}

export function createEmptyDayStats(
  day: number,
  shopTier: ShopTier,
  staff: StaffId[]
): DayFinancials {
  return {
    day,
    phonesBought: 0,
    phonesSold: 0,
    accessoriesSold: 0,
    buySpend: 0,
    wholesaleSpend: 0,
    repairSpend: 0,
    salesRevenue: 0,
    accessoryRevenue: 0,
    serviceRevenue: 0,
    branchIncome: 0,
    questRewards: 0,
    rentCost: getDailyRent(day, shopTier),
    staffWages: getDailyStaffWages(staff),
    posCommission: 0,
    loanPayments: 0,
    taxPaid: 0,
    salesTaxPaid: 0,
    reputationDelta: 0,
    dealsLost: 0,
  };
}

export function buildDayHistoryEntry(
  stats: DayFinancials,
  headline: string,
  reputationEnd: number,
  cashEnd: number
): DayHistoryEntry {
  const revenue =
    stats.salesRevenue +
    stats.accessoryRevenue +
    stats.serviceRevenue +
    (stats.branchIncome ?? 0) +
    stats.questRewards;
  const expenses =
    stats.buySpend +
    stats.wholesaleSpend +
    stats.repairSpend +
    stats.rentCost +
    stats.staffWages +
    (stats.posCommission ?? 0) +
    (stats.loanPayments ?? 0) +
    (stats.taxPaid ?? 0) +
    (stats.salesTaxPaid ?? 0);
  return {
    day: stats.day,
    headline,
    revenue,
    expenses,
    netCashFlow: revenue - expenses,
    phonesSold: stats.phonesSold,
    phonesBought: stats.phonesBought,
    reputationEnd: Number(reputationEnd.toFixed(2)),
    reputationDelta: Number(stats.reputationDelta.toFixed(2)),
    cashEnd,
  };
}

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface WeekdayInfo {
  index: number; // 0 = Mon .. 6 = Sun
  nameTr: string;
  shortTr: string;
  nameEn: string;
  shortEn: string;
  isSunday: boolean;
  daysUntilSunday: number;
  nextSundayDay: number;
}

const WEEKDAYS_META = [
  { nameTr: 'Pazartesi', shortTr: 'Pzt', nameEn: 'Monday', shortEn: 'Mon' },
  { nameTr: 'Salı', shortTr: 'Sal', nameEn: 'Tuesday', shortEn: 'Tue' },
  { nameTr: 'Çarşamba', shortTr: 'Çar', nameEn: 'Wednesday', shortEn: 'Wed' },
  { nameTr: 'Perşembe', shortTr: 'Per', nameEn: 'Thursday', shortEn: 'Thu' },
  { nameTr: 'Cuma', shortTr: 'Cum', nameEn: 'Friday', shortEn: 'Fri' },
  { nameTr: 'Cumartesi', shortTr: 'Cmt', nameEn: 'Saturday', shortEn: 'Sat' },
  { nameTr: 'Pazar', shortTr: 'Paz', nameEn: 'Sunday', shortEn: 'Sun' },
] as const;

export function getWeekdayInfo(day: number): WeekdayInfo {
  const safeDay = Math.max(1, Math.floor(day));
  const index = (safeDay - 1) % 7;
  const isSunday = index === 6;
  const daysUntilSunday = isSunday ? 0 : 6 - index;
  const meta = WEEKDAYS_META[index];
  return {
    index,
    ...meta,
    isSunday,
    daysUntilSunday,
    nextSundayDay: safeDay + daysUntilSunday,
  };
}

export function generateSundayKermes(state: ShopState): SundayKermesState {
  const themes = [
    {
      headline: 'Büyük Pazar Pasaj Kermesi — Bit Pazarı & Usta Tezgâhı!',
      enHeadline: 'Grand Sunday Arcade Fair — Clearance & Rare Parts Bazaar!',
      buzz: 'Kalabalık Tavan · Hızlı Nakit Akışı',
      enBuzz: 'Packed Crowd · Instant Cash Liquidity',
    },
    {
      headline: 'Pazar Esnaf Şenliği — Toptan Parça & Seri Tasfiye!',
      enHeadline: 'Sunday Merchants Festival — Deep-Discount Parts & Clearance!',
      buzz: 'Koleksiyoncular & Tamirciler Akın Etti',
      enBuzz: 'Collectors & Techs Flooding the Stalls',
    },
    {
      headline: 'Geleneksel Pazar GSM Kermesi — Kasa Boşaltma Günü!',
      enHeadline: 'Traditional Sunday GSM Bazaar — Quick Stock Liquidation!',
      buzz: 'Pazarlık Kısa · Nakit Elden Anında',
      enBuzz: 'Zero Haggling · Instant Cash Payouts',
    },
  ];
  const theme = themes[Math.floor(Math.random() * themes.length)];
  const clearanceMultiplier = Number((0.92 + Math.random() * 0.16).toFixed(2)); // 0.92..1.08

  const deals: KermesDealItem[] = [];

  // 1-3: Ultra-cheap rare spare part bundles (48% - 62% off!)
  for (const part of SPARE_PARTS_CATALOG) {
    const qty = part.id === 'battery' ? 3 + Math.floor(Math.random() * 3) : 2 + Math.floor(Math.random() * 3);
    const originalPrice = part.unitCost * qty;
    const discountRatio = 0.48 + Math.random() * 0.14; // 48%..62% off
    const kermesPrice = Math.max(
      350,
      Math.round((originalPrice * (1 - discountRatio)) / 50) * 50
    );
    const discountPercent = Math.round((1 - kermesPrice / originalPrice) * 100);
    deals.push({
      id: `kermes_part_${part.id}_${state.day}_${Math.random().toString(36).slice(2, 5)}`,
      kind: 'SPARE_PART_BUNDLE',
      title: `${qty}x ${part.shortTr} Kermes Sandığı`,
      enTitle: `${qty}x ${part.shortEn} Fair Crate`,
      subtitle: `Pazar esnafı tasfiye stoğu — atölye deposuna anında eklenir.`,
      enSubtitle: `Sunday surplus crate — added straight to your workshop stock.`,
      originalPrice,
      kermesPrice,
      discountPercent,
      partId: part.id,
      partQty: qty,
      bought: false,
    });
  }

  // 4: Surprise 4th slot — either a deeply discounted Bargain Phone OR Rare Accessory Crate
  const spawnPhoneDeal = Math.random() < 0.65;
  if (spawnPhoneDeal) {
    const maxTierOrder =
      state.cash >= 140000 || state.shopTier >= 3
        ? ['entry', 'mid', 'flagship']
        : state.cash >= 45000 || state.shopTier >= 2
        ? ['entry', 'mid']
        : ['entry'];
    const pool = PHONE_CATALOG.filter((p) => maxTierOrder.includes(p.tier));
    const chosenSpec = pool[Math.floor(Math.random() * pool.length)] ?? PHONE_CATALOG[0];
    const phone = generatePhoneDevice(chosenSpec, 'hustler', state.day);
    phone.inspected = { screen: true, battery: true, imei: true, hardware: true };
    const fairVal = calculateMarketValue(phone, false, state.dailyNews, state.upgrades, state.day);
    const discountRatio = 0.36 + Math.random() * 0.14; // 36%..50% off fair value!
    const kermesPrice = Math.max(
      1250,
      roundPrice(fairVal * (1 - discountRatio))
    );
    const discountPercent = Math.max(
      25,
      Math.round((1 - kermesPrice / Math.max(1, fairVal)) * 100)
    );
    phone.purchasePrice = kermesPrice;
    deals.push({
      id: `kermes_phone_${state.day}_${Math.random().toString(36).slice(2, 5)}`,
      kind: 'BARGAIN_PHONE',
      title: `Kelepir ${phone.brand} ${phone.model}`,
      enTitle: `Bargain ${phone.brand} ${phone.model}`,
      subtitle:
        phone.defects.length > 0
          ? `${phone.storage} · ${phone.defects.length} kusurlu ama tamirle dev kâr bırakır!`
          : `${phone.storage} · Tertemiz Pazar kelepiri, hemen vitrine koy!`,
      enSubtitle:
        phone.defects.length > 0
          ? `${phone.storage} · ${phone.defects.length} defect(s) — huge repair flip margin!`
          : `${phone.storage} · Clean Sunday steal, list immediately!`,
      originalPrice: fairVal,
      kermesPrice,
      discountPercent,
      phone,
      bought: false,
    });
  } else {
    const acc =
      ACCESSORY_CATALOG[Math.floor(Math.random() * ACCESSORY_CATALOG.length)] ??
      ACCESSORY_CATALOG[0];
    const qty = 6 + Math.floor(Math.random() * 5);
    const originalPrice = acc.wholesaleCost * qty;
    const kermesPrice = Math.max(
      400,
      Math.round((originalPrice * 0.45) / 50) * 50
    );
    const discountPercent = Math.round((1 - kermesPrice / originalPrice) * 100);
    deals.push({
      id: `kermes_acc_${acc.id}_${state.day}_${Math.random().toString(36).slice(2, 5)}`,
      kind: 'ACCESSORY_BUNDLE',
      title: `${qty}x ${acc.name} Koli`,
      enTitle: `${qty}x ${acc.name} Box`,
      subtitle: `Pazar kermesi seri sonu toptan koli — reyon kârını katla!`,
      enSubtitle: `Sunday closeout wholesale box — massive rack profit margin!`,
      originalPrice,
      kermesPrice,
      discountPercent,
      accessoryId: acc.id,
      accessoryQty: qty,
      bought: false,
    });
  }

  return {
    day: state.day,
    headline: theme.headline,
    enHeadline: theme.enHeadline,
    crowdBuzzLabel: theme.buzz,
    enCrowdBuzzLabel: theme.enBuzz,
    clearanceMultiplier,
    clearanceSoldCount: 0,
    deals,
  };
}

export function createInitialShopState(): ShopState {
  const starterSpec = PHONE_CATALOG[1];
  const starterPhone: PhoneDevice = {
    uid: makeId('phone'),
    specId: starterSpec.id,
    brand: starterSpec.brand,
    model: starterSpec.model,
    storage: starterSpec.storage,
    tier: starterSpec.tier,
    bodyColor: starterSpec.bodyColor,
    accentColor: starterSpec.accentColor,
    cameraLayout: starterSpec.cameraLayout,
    baseValue: starterSpec.baseValue,
    batteryHealth: 93,
    reportedBatteryHealth: 93,
    batteryCycles: 124,
    imeiNumber: generateImeiNumber(true),
    imeiStatus: 'TR_REGISTERED',
    warrantyMonths: 14,
    defects: [],
    repairedDefects: [],
    inspected: { screen: true, battery: true, imei: true, hardware: true },
    purchasePrice: 7000,
    repairSpend: 0,
    listedForSale: true,
    askingPrice: 10500,
    hasBoxAndCharger: true,
    masterCrafted: false,
    isBrandNew: false,
    dayAcquired: 1,
  };

  const day1News = pickDailyNewspaper(1);

  const baseState: ShopState = {
    day: 1,
    cash: STARTING_CASH,
    reputation: 3.0,
    xp: 0,
    level: 1,
    legacyPath: 'EX_APPRENTICE',
    dealStreak: 0,
    bestDealStreak: 0,
    shopTier: 1,
    showcaseUpgradeLevel: 0,
    inventory: [starterPhone],
    accessories: createInitialAccessories(),
    upgrades: [],
    decorations: ['vintage_radio', 'tea_boiler'],
    activeDecorations: ['vintage_radio', 'tea_boiler'],
    staff: [],
    staffLevels: { apprentice: 1, master_tech: 1, sales_rep: 1, accountant: 1 },
    branches: [],
    museumItems: [],
    activeLoans: [],
    distributorLoyalty: {},
    rival: {
      name: 'Kurnaz Kerim',
      shopName: 'Kerim GSM Köşe',
      marketShare: 62,
      buyoutCost: 250000,
      boughtOut: false,
      lastTaunt: 'Kurnaz Kerim: "Hoş geldin genç esnaf! 23 yaşında bu pasajda tutunmak kolay değil, görelim bakalım!"',
      promoUsedToday: false,
    },
    soldHistory: [],
    onlineListings: [],
    shippingOrders: [],
    dailyAuctionLot: null,
    dailyAuctionLots: [],
    pendingProjects: [],
    pendingWholesaleOrders: [],
    staffRepairQueue: [],
    morningNotifications: [],
    flashWholesaleDeal: generateFlashWholesaleDeal(1, 1),
    ownedOutfits: ['casual_hoodie'],
    equippedOutfit: 'casual_hoodie',
    activeStoreEvent: null,
    nextCustomerEventEffect: null,
    storeEventsTriggeredToday: 0,
    todayRentDiscountPct: 0,
    privacyAccepted: true,
    hapticsEnabled: true,
    textSpeed: 'fast',
    ratedApp: false,
    feedbackNotes: [],
    weeklyTaxDue: 0,
    loginStreak: 1,
    lastLoginDateStr: getTodayDateString(),
    dailyStreakClaimed: false,
    lastSavedAt: Date.now(),
    dailyNews: day1News,
    dailyWholesaleDiscountBrand: pickDailyWholesaleDiscountBrand(1),
    dailyQuests: generateDailyQuests(1, [], 1),
    claimedMilestoneIds: [],
    claimedChapterIds: [],
    discoveredSpecIds: [starterSpec.id],
    dailyQueue: [],
    currentQueueIndex: 0,
    todayStats: createEmptyDayStats(1, 1, []),
    history: [],
    reviews: [],
    totalProfitEarned: 0,
    totalPhonesSold: 0,
    totalBrandNewSold: 0,
    totalAccessoriesSold: 0,
    totalPhonesRepaired: 0,
    totalDefectsExposed: 0,
    totalTeasServed: 0,
    totalTradeInsDone: 0,
    totalAuctionsWon: 0,
    bestSingleDealProfit: 0,
    unlockedAchievementIds: [],
    unlockedEarningsBadges: [],
    tutorialDismissed: false,
    allTabsUnlockedEarly: false,
    ambientSoundEnabled: false,
    storyIntroSeen: false,
    endlessMode: false,
    prestigeLevel: 0,
    prestigePoints: 0,
    prestigePerks: [],
    lifetimeTotalProfit: 0,
    radioStation: 'OFF',
    spareParts: { screen: 1, battery: 1, board_kit: 1 },
    complaintHistory: [],
    sundayKermes: null,
    adState: createDefaultAdState(0),
    activeDrama: null,
    completedDramaIds: [],
    lastDramaDay: 0,
    loansPaidOffCount: 0,
    debtFreePrestigeBonus: 0,
  };

  baseState.dailyQueue = generateDailyQueue(baseState);
  baseState.onlineListings = generateOnlineClassifieds(baseState);
  baseState.shippingOrders = generateShippingOrders(baseState);
  baseState.dailyAuctionLots = generateDailyAuctionLots(baseState);
  baseState.dailyAuctionLot = baseState.dailyAuctionLots[0] ?? null;
  return baseState;
}

export function executePrestigeReset(state: ShopState): ShopState {
  const earnedPoints = getPrestigePointsEarned(state);
  const nextPrestigeLevel = (state.prestigeLevel ?? 0) + 1;
  const perks = state.prestigePerks ?? [];
  const nextPoints = (state.prestigePoints ?? 0) + earnedPoints;

  const fresh = createInitialShopState();
  const keptUpgrades: UpgradeId[] = [];
  if (perks.includes('golden_pliers')) keptUpgrades.push('repair_bench');
  if (perks.includes('seed_capital')) keptUpgrades.push('accessory_license');
  if (perks.includes('vip_network')) keptUpgrades.push('classifieds_license');

  const startingCashBonus =
    (perks.includes('seed_capital') ? 25000 : 0) + nextPrestigeLevel * 6000;
  const startingRepBonus =
    (perks.includes('silver_tongue') ? 0.5 : 0) + Math.min(0.6, nextPrestigeLevel * 0.15);

  const playstyle = detectPlayerPlaystyle(state);

  const resetState: ShopState = {
    ...fresh,
    cash: fresh.cash + startingCashBonus,
    reputation: Math.min(4.8, Number((fresh.reputation + startingRepBonus).toFixed(2))),
    xp: state.xp,
    level: state.level,
    legacyPath: state.legacyPath,
    decorations: ['vintage_radio', 'tea_boiler', 'prestige_plaque'],
    activeDecorations: ['vintage_radio', 'tea_boiler', 'prestige_plaque'],
    upgrades: keptUpgrades,
    museumItems: [...state.museumItems],
    ownedOutfits: [...state.ownedOutfits],
    equippedOutfit: state.equippedOutfit,
    loansPaidOffCount: state.loansPaidOffCount ?? 0,
    debtFreePrestigeBonus: state.debtFreePrestigeBonus ?? 0,
    discoveredSpecIds: [...state.discoveredSpecIds],
    claimedMilestoneIds: [...state.claimedMilestoneIds],
    unlockedAchievementIds: state.unlockedAchievementIds
      ? [...state.unlockedAchievementIds]
      : [],
    unlockedEarningsBadges: state.unlockedEarningsBadges
      ? [...state.unlockedEarningsBadges]
      : [],
    storyIntroSeen: true,
    tutorialDismissed: true,
    endlessMode: true,
    privacyAccepted: state.privacyAccepted,
    hapticsEnabled: state.hapticsEnabled,
    textSpeed: state.textSpeed,
    ratedApp: state.ratedApp,
    ambientSoundEnabled: state.ambientSoundEnabled,
    radioStation: state.radioStation ?? 'OFF',
    spareParts: { screen: 2, battery: 2, board_kit: 2 },
    prestigeLevel: nextPrestigeLevel,
    prestigePoints: nextPoints,
    prestigePerks: [...perks],
    lifetimeTotalProfit: (state.lifetimeTotalProfit ?? 0) + state.totalProfitEarned,
    dailyQuests: generateDailyQuests(1, keptUpgrades, state.level, playstyle, nextPrestigeLevel),
    morningNotifications: [
      bi(
        `Prestij ${nextPrestigeLevel}. Dönem Başladı! +${earnedPoints} Prestij Puanı kazandın; duvarına ${getPrestigePlaqueStyle(nextPrestigeLevel).tierName} asıldı!`,
        `Prestige Cycle ${nextPrestigeLevel} Started! Earned +${earnedPoints} PP; ${getPrestigePlaqueStyle(nextPrestigeLevel).enTierName} mounted on your shop wall!`
      ),
    ],
  };

  resetState.dailyQueue = generateDailyQueue(resetState);
  resetState.onlineListings = generateOnlineClassifieds(resetState);
  resetState.shippingOrders = generateShippingOrders(resetState);
  resetState.dailyAuctionLots = generateDailyAuctionLots(resetState);
  resetState.dailyAuctionLot = resetState.dailyAuctionLots[0] ?? null;
  return resetState;
}

export interface OfferEvaluationResult {
  updatedEncounter: CustomerEncounter;
  accepted: boolean;
  walkedOut: boolean;
  finalPrice: number;
  reputationDelta: number;
}

export interface OfferEvaluationOptions {
  tone?: NegotiationTone;
  elapsedSec?: number;
  legacyPath?: LegacyPathId;
  instantAcceptRequested?: boolean;
  dailyNews?: DailyMarketEvent;
  upgrades?: UpgradeId[];
}

export function evaluatePlayerOffer(
  encounter: CustomerEncounter,
  playerOffer: number,
  options: OfferEvaluationOptions = {}
): OfferEvaluationResult {
  const arch = CUSTOMER_ARCHETYPES[encounter.archetypeId];
  const nextRounds = encounter.rounds + 1;
  const tone: NegotiationTone = options.tone ?? 'friendly';
  const elapsedSec = options.elapsedSec ?? 5;
  const legacyPath = options.legacyPath;

  // Compute negotiation pace & tone mood impact
  const pace: NegotiationPace =
    elapsedSec < 2.2 ? 'rushed' : elapsedSec > 16 ? 'slow' : 'steady';

  const inspectedCount = Object.values(
    encounter.type === 'TRADE_IN' && encounter.tradeInDevice
      ? encounter.tradeInDevice.inspected
      : encounter.device.inspected
  ).filter(Boolean).length;

  const fairMarketVal = calculateMarketValue(
    encounter.device,
    false,
    options.dailyNews,
    options.upgrades
  );

  // Determine how many counter-offer rounds this customer insists on before folding:
  // Stubborn/low-mood customers resist for 3 rounds; relaxed/high-mood or Koz-softened customers resist for at least 2 rounds.
  const baseRequired =
    encounter.requiredRounds ??
    (encounter.archetypeId === 'uncle' || encounter.archetypeId === 'hustler' ? 3 : 2);
  const leverageSoften = encounter.usedLeverageDefects.length > 0 ? 1 : 0;
  const moodRoundPenalty = encounter.moodScore < 42 ? 1 : 0;
  const minRoundsToClose = Math.max(
    2,
    Math.min(3, baseRequired + moodRoundPenalty - leverageSoften)
  );

  let moodDelta = 0;
  let pacePatiencePenalty = 0;
  const reasonParts: string[] = [];

  if (pace === 'steady') {
    moodDelta += 4;
    reasonParts.push('Kararlı Tempo (+4)');
  } else if (pace === 'slow') {
    moodDelta -= 8;
    pacePatiencePenalty += 6;
    reasonParts.push('Bekletme (-8)');
  } else {
    const feelsAggressive =
      encounter.type === 'SELLER'
        ? playerOffer < encounter.customerPrice * 0.86
        : playerOffer > encounter.customerPrice * 1.05;
    if (feelsAggressive) {
      moodDelta -= 8;
      pacePatiencePenalty += 5;
      reasonParts.push('Aceleci Kırma (-8)');
    } else {
      moodDelta += 2;
      reasonParts.push('Seri Esnaf (+2)');
    }
  }

  if (tone === 'friendly') {
    moodDelta += legacyPath === 'SOCIAL_HUSTLER' ? 8 : 6;
    reasonParts.push(
      legacyPath === 'SOCIAL_HUSTLER' ? 'Esnaf İletişimi (+8)' : 'Esnaf İletişimi (+6)'
    );
  } else if (tone === 'analytical') {
    const allInspected = inspectedCount >= 4;
    const hasEvidence =
      inspectedCount >= 2 ||
      encounter.device.isBrandNew ||
      (encounter.type === 'BUYER' && encounter.device.defects.length === 0) ||
      (allInspected && encounter.device.defects.length === 0);
    const bonus = hasEvidence ? 5 : 1;
    moodDelta += bonus;
    reasonParts.push(hasEvidence ? 'Analitik Veri (+5)' : 'Analitik (+1)');
  } else {
    const firmPenalty =
      encounter.archetypeId === 'uncle' || encounter.archetypeId === 'vip' ? -12 : -8;
    moodDelta += firmPenalty;
    reasonParts.push(`Sert Üslup (${firmPenalty})`);
  }

  const clampMood = (val: number) => Math.max(0, Math.min(100, Math.round(val)));

  if (encounter.type === 'SELLER') {
    // Only direct acceptance of seller's exact asking price closes immediately on any round
    if (options.instantAcceptRequested || playerOffer >= encounter.customerPrice) {
      const nextMoodScore = clampMood(encounter.moodScore + 18);
      const msg = pick(DEAL_ACCEPTED_LINES.SELLER);
      return {
        updatedEncounter: {
          ...encounter,
          rounds: nextRounds,
          outcome: 'DEAL_CLOSED',
          finalPrice: playerOffer,
          moodScore: nextMoodScore,
          mood: deriveMoodFromScore(nextMoodScore),
          negotiationPace: pace,
          lastToneUsed: tone,
          lastMoodReason: 'İstediği Fiyata El Sıkışıldı (+18)',
          messages: [
            ...encounter.messages,
            {
              id: makeId('msg'),
              speaker: 'player',
              text: `${formatTRY(playerOffer)} nakit veriyorum, hayırlı olsun!`,
            },
            { id: makeId('msg'), speaker: 'customer', text: msg, tone: 'positive' },
          ],
        },
        accepted: true,
        walkedOut: false,
        finalPrice: playerOffer,
        reputationDelta: legacyPath === 'SOCIAL_HUSTLER' ? 0.14 : 0.1,
      };
    }

    // Distance to BOTH seller's secret limit AND true market value
    const underLimitRatio = Math.max(
      0,
      (encounter.secretLimit - playerOffer) / Math.max(1, encounter.secretLimit)
    );
    const marketOfferRatio = playerOffer / Math.max(1, fairMarketVal);
    const isMarketLowball = marketOfferRatio < 0.68;

    const offerMoodShift =
      isMarketLowball
        ? -16
        : underLimitRatio > 0.2
        ? -13
        : underLimitRatio > 0.08
        ? -7
        : playerOffer >= encounter.secretLimit
        ? 4
        : -3;

    if (isMarketLowball) {
      reasonParts.push('Piyasa Altı Ölü Teklif (-16)');
    }

    const nextMoodScore = clampMood(encounter.moodScore + moodDelta + offerMoodShift);
    const nextMood = deriveMoodFromScore(nextMoodScore);
    const moodReason = reasonParts.join(' · ');

    // Mood-driven resistance: grumpy seller stiffens their floor (+6%); happy seller softens slightly (-4%)
    const moodFlex =
      nextMoodScore >= 78
        ? 0.96
        : nextMoodScore >= 60
        ? 0.99
        : nextMoodScore <= 30
        ? 1.06
        : 1.02;
    const effectiveLimit = roundPrice(encounter.secretLimit * moodFlex);

    const playerLine =
      tone === 'friendly'
        ? `Kardeşim cihaz güzel ama gel şu işi ${formatTRY(playerOffer)} nakit bağlayalım, ikimizin de yüzü gülsün.`
        : tone === 'analytical'
        ? `Ekspertiz ve güncel piyasa ortalaması ortada: bu cihaza nakit ${formatTRY(playerOffer)} yazabiliyorum.`
        : `Net konuşayım, kasadan çıkacak rakam ${formatTRY(playerOffer)}. İşine geliyorsa hemen sayayım.`;

    const nextHeat = Math.min(
      100,
      (encounter.negotiationHeat ?? 15) +
        (tone === 'firm' ? 22 : tone === 'analytical' ? 15 : 12) +
        (isMarketLowball ? 20 : underLimitRatio > 0.12 ? 14 : 8)
    );

    // RESISTANT MULTI-ROUND SELLER CLOSING RULE:
    // Must reach minRoundsToClose (2-3 rounds) unless paying >= 97% of seller's current ask AND above effectiveLimit.
    const almostAsking = playerOffer >= encounter.customerPrice * 0.97 && nextRounds >= 2;
    const metRoundRequirement = nextRounds >= minRoundsToClose;
    const canCloseThisRound =
      playerOffer >= effectiveLimit &&
      (almostAsking ||
        (metRoundRequirement &&
          (nextMoodScore >= 36 || playerOffer >= effectiveLimit * 1.03)));

    if (canCloseThisRound) {
      const closedMood = clampMood(nextMoodScore + 14);
      const msg = pick(DEAL_ACCEPTED_LINES.SELLER);
      return {
        updatedEncounter: {
          ...encounter,
          rounds: nextRounds,
          negotiationHeat: nextHeat,
          outcome: 'DEAL_CLOSED',
          finalPrice: playerOffer,
          moodScore: closedMood,
          mood: deriveMoodFromScore(closedMood),
          negotiationPace: pace,
          lastToneUsed: tone,
          lastMoodReason: `${moodReason} · ${nextRounds}. Turda El Sıkışıldı!`,
          messages: [
            ...encounter.messages,
            { id: makeId('msg'), speaker: 'player', text: playerLine },
            { id: makeId('msg'), speaker: 'customer', text: msg, tone: 'positive' },
          ],
        },
        accepted: true,
        walkedOut: false,
        finalPrice: playerOffer,
        reputationDelta: legacyPath === 'SOCIAL_HUSTLER' ? 0.12 : 0.08,
      };
    }

    const tonePatienceMult =
      tone === 'friendly' ? 0.78 : tone === 'analytical' ? 0.88 : 1.24;
    const moodPatienceMult = nextMoodScore <= 32 ? 1.25 : nextMoodScore >= 72 ? 0.82 : 1.0;
    const rawLoss =
      (9 +
        underLimitRatio * (46 + (1 - arch.bluffTolerance) * 26) +
        (isMarketLowball ? 10 : 0)) *
        tonePatienceMult *
        moodPatienceMult +
      pacePatiencePenalty;
    const patienceLoss = Math.max(
      5,
      Math.round(playerOffer >= effectiveLimit ? rawLoss * 0.36 : rawLoss)
    );
    const nextPatience = Math.max(0, encounter.patience - patienceLoss);

    if (nextPatience <= 0 || nextMoodScore <= 4) {
      return {
        updatedEncounter: {
          ...encounter,
          rounds: nextRounds,
          negotiationHeat: 100,
          patience: 0,
          moodScore: 0,
          mood: 'angry',
          negotiationPace: pace,
          lastToneUsed: tone,
          lastMoodReason: `${moodReason} · Sabrı Taştı`,
          outcome: 'WALKED_OUT',
          messages: [
            ...encounter.messages,
            { id: makeId('msg'), speaker: 'player', text: playerLine },
            {
              id: makeId('msg'),
              speaker: 'customer',
              text: pick(WALKOUT_LINES[encounter.archetypeId]),
              tone: 'danger',
            },
          ],
        },
        accepted: false,
        walkedOut: true,
        finalPrice: 0,
        reputationDelta: -0.09,
      };
    }

    // Gritty, mood-dependent concession step: angry/stubborn sellers barely budge; Koz-softened or happy sellers step down faster
    const moodConcessionMult =
      nextMoodScore >= 75 ? 1.18 : nextMoodScore <= 34 ? 0.55 : 0.92;
    const leverageConcessionBoost = encounter.usedLeverageDefects.length > 0 ? 1.15 : 1.0;
    const concessionFactor =
      (tone === 'analytical' ? 0.36 : tone === 'firm' ? 0.34 : 0.31) *
      moodConcessionMult *
      leverageConcessionBoost;

    // Keep seller's counter above player's offer during required sparring rounds so real back-and-forth happens!
    const sparringBuffer = nextRounds < minRoundsToClose ? 500 : 250;
    const targetFloor = Math.max(effectiveLimit, playerOffer + sparringBuffer);
    const rawDrop = (encounter.customerPrice - targetFloor) * concessionFactor;
    const minDrop = nextMoodScore <= 30 ? 0 : 250;
    const dropStep = Math.max(minDrop, rawDrop);
    const nextAsk = roundPrice(
      Math.max(
        Math.min(encounter.customerPrice, Math.max(effectiveLimit, playerOffer + 250)),
        encounter.customerPrice - dropStep
      )
    );

    const isAtFinalFloor = nextAsk <= effectiveLimit * 1.03 && nextRounds >= 2;
    let reaction: string;
    if (isMarketLowball) {
      reaction = `Usta piyasa değerinin çok altında ölü fiyat çektin! Bu telefonun ederi belli, ${formatTRY(nextAsk)} aşağısına hayatta bırakmam!`;
    } else if (playerOffer >= effectiveLimit && nextRounds < minRoundsToClose) {
      reaction =
        nextRounds === 1
          ? `İlk turdan hemen tamam diyecek halim yok usta, pazarlık sünnettir! Gel ${formatTRY(nextAsk)} yapalım da gönlüm razı olsun.`
          : `Güzel yaklaştın ama beni biraz daha terletmeden bırakmam! Bak ${formatTRY(nextAsk)} diyorum, bir adım daha çık el sıkışalım!`;
    } else if (nextMoodScore <= 32) {
      reaction = `Üslubun ve teklifin hiç hoşuma gitmedi usta... Moralim bozuldu, en fazla ${formatTRY(nextAsk)} inerim, yoksa kalkıyorum!`;
    } else if (pace === 'slow') {
      reaction = `Abi biraz hızlanalım vaktim dar... Son ${formatTRY(nextAsk)} diyorum, ne diyorsun?`;
    } else if (isAtFinalFloor) {
      reaction = `Kırmızı çizgim ${formatTRY(nextAsk)} usta! Tek kuruş inmem, ya nakiti çıkar ya cihazı cebime koyayım!`;
    } else if (underLimitRatio > 0.18) {
      reaction = `Aman usta cihazı resmen bedavaya istedin! ${formatTRY(nextAsk)} aşağısı kurtarmaz, biraz gerçekçi gel!`;
    } else {
      reaction = `Yok abi öyle kolay değil, pazarlık daha yeni ısındı! Ben ${formatTRY(nextAsk)} yapayım, sen de biraz yukarı çık!`;
    }

    return {
      updatedEncounter: {
        ...encounter,
        rounds: nextRounds,
        negotiationHeat: nextHeat,
        patience: nextPatience,
        customerPrice: nextAsk,
        lastPlayerOffer: playerOffer,
        moodScore: nextMoodScore,
        mood: nextMood,
        negotiationPace: pace,
        lastToneUsed: tone,
        lastMoodReason: moodReason,
        finalWarningGiven: encounter.finalWarningGiven || isAtFinalFloor,
        messages: [
          ...encounter.messages,
          { id: makeId('msg'), speaker: 'player', text: playerLine },
          {
            id: makeId('msg'),
            speaker: 'customer',
            text: reaction,
            tone:
              isMarketLowball || isAtFinalFloor || nextMoodScore <= 32
                ? 'warning'
                : playerOffer >= effectiveLimit
                ? 'positive'
                : 'neutral',
          },
        ],
      },
      accepted: false,
      walkedOut: false,
      finalPrice: 0,
      reputationDelta: 0,
    };
  } else {
    // BUYER / TRADE-IN: Player NEVER raises above their own showcase askingPrice!
    const clampedOffer = Math.min(encounter.device.askingPrice, playerOffer);
    const isHoldingSticker = clampedOffer >= encounter.device.askingPrice;

    // Direct acceptance of buyer's exact current offer closes immediately
    if (options.instantAcceptRequested || clampedOffer <= encounter.customerPrice) {
      const nextMoodScore = clampMood(encounter.moodScore + 20);
      const msg = pick(DEAL_ACCEPTED_LINES.BUYER);
      return {
        updatedEncounter: {
          ...encounter,
          rounds: nextRounds,
          outcome: 'DEAL_CLOSED',
          finalPrice: clampedOffer,
          moodScore: nextMoodScore,
          mood: deriveMoodFromScore(nextMoodScore),
          negotiationPace: pace,
          lastToneUsed: tone,
          lastMoodReason: 'Alıcının Teklifi Kabul Edildi (+20)',
          messages: [
            ...encounter.messages,
            {
              id: makeId('msg'),
              speaker: 'player',
              text: `Seni kırmayayım, ${formatTRY(clampedOffer)} hayırlı uğurlu olsun!`,
            },
            { id: makeId('msg'), speaker: 'customer', text: msg, tone: 'positive' },
          ],
        },
        accepted: true,
        walkedOut: false,
        finalPrice: clampedOffer,
        reputationDelta: legacyPath === 'SOCIAL_HUSTLER' ? 0.18 : 0.14,
      };
    }

    const overLimitRatio = Math.max(
      0,
      (clampedOffer - encounter.secretLimit) / Math.max(1, encounter.secretLimit)
    );
    const discountFromSticker = encounter.device.askingPrice - clampedOffer;
    const isStingyDrop =
      encounter.type === 'BUYER' &&
      discountFromSticker > 0 &&
      discountFromSticker <= 400 &&
      encounter.device.askingPrice >= 6000;
    const overMarketRatio =
      encounter.type === 'BUYER'
        ? clampedOffer / Math.max(1, fairMarketVal)
        : 1.0;
    const isOverpricedVsMarket = encounter.type === 'BUYER' && overMarketRatio > 1.24;

    const offerMoodShift =
      isStingyDrop
        ? -10
        : isOverpricedVsMarket
        ? -14
        : clampedOffer <= encounter.secretLimit
        ? 4
        : isHoldingSticker && overLimitRatio > 0.08
        ? -13
        : overLimitRatio > 0.14
        ? -14
        : -6;

    if (isOverpricedVsMarket) {
      reasonParts.push('Piyasa Üstü Etiket (-14)');
    }

    const nextMoodScore = clampMood(encounter.moodScore + moodDelta + offerMoodShift);
    const nextMood = deriveMoodFromScore(nextMoodScore);
    const moodReason = isStingyDrop
      ? `${reasonParts.join(' · ')} · Sembolik İndirim (-10)`
      : reasonParts.join(' · ');

    // Mood-based stretch: happy buyer stretches +4%; annoyed buyer shrinks -5%
    const moodStretch =
      nextMoodScore >= 78
        ? 1.04
        : nextMoodScore >= 60
        ? 1.01
        : nextMoodScore <= 32
        ? 0.95
        : 0.99;
    const effectiveLimit = Math.min(
      encounter.device.askingPrice,
      roundPrice(encounter.secretLimit * moodStretch)
    );

    const nextHeat = Math.min(
      100,
      (encounter.negotiationHeat ?? 15) +
        (isStingyDrop || isOverpricedVsMarket ? 24 : tone === 'firm' ? 22 : 14) +
        (overLimitRatio > 0.1 ? 15 : 8)
    );

    const playerLine =
      tone === 'friendly'
        ? isHoldingSticker
          ? `Canım kardeşim etiketim ${formatTRY(clampedOffer)} zaten en dip fiyat, çay benden ama gel bu fiyata bağlayalım.`
          : `Seni kırmadım, güzel bir esnaf indirimiyle ${formatTRY(clampedOffer)} yapıyorum!`
        : tone === 'analytical'
        ? isHoldingSticker
          ? `Bu kondisyonda ve garantide piyasa fiyatı ortada; etiketimiz ${formatTRY(clampedOffer)} kuruşuna kadar hakkı.`
          : `Piyasa emsallerine göre baktım, en mantıklı indirimle ${formatTRY(clampedOffer)} çıkarabiliyorum.`
        : isHoldingSticker
        ? `Etiket fiyatım ${formatTRY(clampedOffer)} net ve sabit. Cihazın temizliğini görüyorsun.`
        : `Son indirimim ${formatTRY(clampedOffer)}, bunun altına inmem mümkün değil.`;

    // RESISTANT MULTI-ROUND BUYER / TRADE-IN CLOSING RULE:
    // Never folds on Round 1 (unless player accepts buyer's exact price). Requires 2-3 rounds!
    const isVeryCloseToBuyerBid =
      clampedOffer <= encounter.customerPrice * 1.02 && nextRounds >= 2;
    const metRoundRequirement = nextRounds >= minRoundsToClose;
    const canCloseThisRound =
      clampedOffer <= effectiveLimit &&
      !isStingyDrop &&
      (isVeryCloseToBuyerBid ||
        (metRoundRequirement &&
          (nextMoodScore >= 36 || clampedOffer <= effectiveLimit * 0.97)));

    if (canCloseThisRound) {
      const closedMood = clampMood(nextMoodScore + 14);
      const msg = pick(DEAL_ACCEPTED_LINES.BUYER);
      return {
        updatedEncounter: {
          ...encounter,
          rounds: nextRounds,
          negotiationHeat: nextHeat,
          outcome: 'DEAL_CLOSED',
          finalPrice: clampedOffer,
          moodScore: closedMood,
          mood: deriveMoodFromScore(closedMood),
          negotiationPace: pace,
          lastToneUsed: tone,
          lastMoodReason: `${moodReason} · ${nextRounds}. Turda Satış Bağlandı!`,
          messages: [
            ...encounter.messages,
            { id: makeId('msg'), speaker: 'player', text: playerLine },
            { id: makeId('msg'), speaker: 'customer', text: msg, tone: 'positive' },
          ],
        },
        accepted: true,
        walkedOut: false,
        finalPrice: clampedOffer,
        reputationDelta: legacyPath === 'SOCIAL_HUSTLER' ? 0.16 : 0.12,
      };
    }

    const tonePatienceMult =
      tone === 'friendly' ? 0.78 : tone === 'analytical' ? 0.88 : 1.24;
    const moodPatienceMult = nextMoodScore <= 32 ? 1.25 : nextMoodScore >= 72 ? 0.82 : 1.0;
    const rawLoss =
      (10 +
        overLimitRatio * (48 + (1 - arch.bluffTolerance) * 24) +
        (isStingyDrop ? 9 : 0) +
        (isOverpricedVsMarket ? 8 : 0)) *
        tonePatienceMult *
        moodPatienceMult +
      pacePatiencePenalty;
    const patienceLoss = Math.max(
      5,
      Math.round(clampedOffer <= effectiveLimit && !isStingyDrop ? rawLoss * 0.38 : rawLoss)
    );
    const nextPatience = Math.max(0, encounter.patience - patienceLoss);

    if (nextPatience <= 0 || nextMoodScore <= 4) {
      return {
        updatedEncounter: {
          ...encounter,
          rounds: nextRounds,
          negotiationHeat: 100,
          patience: 0,
          moodScore: 0,
          mood: 'angry',
          negotiationPace: pace,
          lastToneUsed: tone,
          lastMoodReason: `${moodReason} · Vazgeçti`,
          outcome: 'WALKED_OUT',
          messages: [
            ...encounter.messages,
            { id: makeId('msg'), speaker: 'player', text: playerLine },
            {
              id: makeId('msg'),
              speaker: 'customer',
              text: pick(WALKOUT_LINES[encounter.archetypeId]),
              tone: 'danger',
            },
          ],
        },
        accepted: false,
        walkedOut: true,
        finalPrice: 0,
        reputationDelta: -0.07,
      };
    }

    const moodConcessionMult =
      nextMoodScore >= 75 ? 1.18 : nextMoodScore <= 34 ? 0.55 : 0.92;
    const concessionFactor =
      (isStingyDrop
        ? 0.18
        : tone === 'analytical'
        ? 0.38
        : tone === 'firm'
        ? 0.36
        : 0.33) * moodConcessionMult;
    const sparringBuffer = nextRounds < minRoundsToClose ? 500 : 250;
    const targetCeiling = Math.min(effectiveLimit, clampedOffer - sparringBuffer);
    const bumpStep = Math.max(
      isStingyDrop || nextMoodScore <= 30 ? 0 : 250,
      (targetCeiling - encounter.customerPrice) * concessionFactor
    );
    const nextOffer = roundPrice(
      Math.min(
        effectiveLimit,
        Math.max(encounter.customerPrice, encounter.customerPrice + bumpStep)
      )
    );

    const isAtFinalCeiling = nextOffer >= effectiveLimit * 0.97 && nextRounds >= 2;
    let reaction: string;
    if (isStingyDrop) {
      reaction = `Usta ${formatTRY(discountFromSticker)} indirip buna pazarlık mı diyorsun?! Ciddi bir esnaf indirimi yap yoksa ben ${formatTRY(nextOffer)} üstüne çıkmam!`;
    } else if (isOverpricedVsMarket) {
      reaction = `Usta bu modelin piyasa fiyatı internette ortada, etiketin çok yüksek! Ben en fazla ${formatTRY(nextOffer)} çıkarabilirim.`;
    } else if (clampedOffer <= effectiveLimit && nextRounds < minRoundsToClose) {
      reaction =
        nextRounds === 1
          ? `Güzel yaklaştın usta ama ilk turdan pes etmek yok! Ben ${formatTRY(nextOffer)} çıkarayım, hadi biraz daha kır!`
          : `Az kaldı usta, pazarlık iyice kızıştı! Bütçemi zorlayıp ${formatTRY(nextOffer)} yaptım, bir adım daha in el sıkışalım!`;
    } else if (nextMoodScore <= 32) {
      reaction = `Pek sıcak yaklaşmıyorsun usta... Moralim kaçtı, en fazla ${formatTRY(nextOffer)} veririm, kabul etmezsen çıkarım!`;
    } else if (pace === 'slow') {
      reaction = `Usta biraz seri olalım işim var... Ben ${formatTRY(nextOffer)} verebilirim, oluyor mu?`;
    } else if (isAtFinalCeiling) {
      reaction = `Cebimdeki son kuruş ${formatTRY(nextOffer)} usta! Bundan bir lira yukarı çıkamam, el sıkışalım mı?`;
    } else if (overLimitRatio > 0.14) {
      reaction = `Hiç esnemiyorsun usta, yan dükkan daha ucuz! En fazla ${formatTRY(nextOffer)} çıkarabilirim.`;
    } else {
      reaction = `O rakam hala yüksek abi! Ben ${formatTRY(nextOffer)} veriyorum, biraz daha fedakarlık yap!`;
    }

    return {
      updatedEncounter: {
        ...encounter,
        rounds: nextRounds,
        negotiationHeat: nextHeat,
        patience: nextPatience,
        customerPrice: nextOffer,
        lastPlayerOffer: clampedOffer,
        moodScore: nextMoodScore,
        mood: nextMood,
        negotiationPace: pace,
        lastToneUsed: tone,
        lastMoodReason: moodReason,
        finalWarningGiven: encounter.finalWarningGiven || isAtFinalCeiling,
        messages: [
          ...encounter.messages,
          { id: makeId('msg'), speaker: 'player', text: playerLine },
          {
            id: makeId('msg'),
            speaker: 'customer',
            text: reaction,
            tone:
              isStingyDrop || isOverpricedVsMarket || isAtFinalCeiling || nextMoodScore <= 32
                ? 'warning'
                : clampedOffer <= effectiveLimit
                ? 'positive'
                : 'neutral',
          },
        ],
      },
      accepted: false,
      walkedOut: false,
      finalPrice: 0,
      reputationDelta: 0,
    };
  }
}

/** Compute safe upper cap for BUYER/TRADE_IN tactic raises so tactics NEVER exceed player's last offer or Trade-In fair ceiling */
function getBuyerOrTradeCap(encounter: CustomerEncounter): number {
  const baseCap =
    encounter.type === 'TRADE_IN'
      ? Math.min(
          Math.max(encounter.customerPrice, encounter.device.askingPrice - 500),
          Math.max(encounter.customerPrice, roundPrice(encounter.secretLimit * 1.12))
        )
      : encounter.device.askingPrice;
  if (typeof encounter.lastPlayerOffer === 'number' && encounter.lastPlayerOffer > 0) {
    return Math.min(baseCap, encounter.lastPlayerOffer);
  }
  return baseCap;
}

/** Compute safe lower floor for SELLER tactic drops so seller never drops below player's last offer */
function getSellerTacticFloor(encounter: CustomerEncounter): number {
  if (typeof encounter.lastPlayerOffer === 'number' && encounter.lastPlayerOffer > 0) {
    return Math.max(1000, encounter.lastPlayerOffer);
  }
  return 1000;
}

export function applyTeaTactic(
  encounter: CustomerEncounter,
  upgrades: UpgradeId[],
  staff: StaffId[]
): CustomerEncounter {
  if (encounter.teaServed || encounter.outcome !== 'ACTIVE') return encounter;
  const arch = CUSTOMER_ARCHETYPES[encounter.archetypeId];
  const hasSamovar = upgrades.includes('tea_samovar');
  const hasApprentice = staff.includes('apprentice');
  const patienceGain =
    arch.teaBonusPatience + (hasSamovar ? 16 : 0) + (hasApprentice ? 10 : 0);
  const soften = arch.teaPriceSoften + (hasSamovar ? 0.04 : 0);
  const moodBoost = hasSamovar ? 22 : 15;
  const nextMoodScore = Math.min(100, encounter.moodScore + moodBoost);

  let nextPrice = encounter.customerPrice;
  let nextLimit = encounter.secretLimit;

  if (encounter.type === 'SELLER') {
    const floor = getSellerTacticFloor(encounter);
    nextPrice = Math.min(
      encounter.customerPrice,
      Math.max(floor, roundPrice(encounter.customerPrice * (1 - soften)))
    );
    nextLimit = roundPrice(
      Math.max(900, Math.min(nextPrice, encounter.secretLimit * (1 - soften * 0.7)))
    );
  } else {
    const cap = getBuyerOrTradeCap(encounter);
    nextPrice = Math.max(
      encounter.customerPrice,
      Math.min(cap, roundPrice(encounter.customerPrice * (1 + soften)))
    );
    const limitCap =
      encounter.type === 'TRADE_IN'
        ? Math.max(cap, encounter.device.askingPrice - 500)
        : encounter.device.askingPrice;
    nextLimit = Math.min(
      limitCap,
      Math.max(nextPrice, roundPrice(encounter.secretLimit * (1 + soften * 0.85)))
    );
  }

  return {
    ...encounter,
    teaServed: true,
    patience: Math.min(encounter.maxPatience, encounter.patience + patienceGain),
    customerPrice: nextPrice,
    secretLimit: nextLimit,
    moodScore: nextMoodScore,
    mood: deriveMoodFromScore(nextMoodScore),
    lastMoodReason: hasSamovar ? `Semaver Çayı (+${moodBoost})` : `Çay İkramı (+${moodBoost})`,
    messages: [
      ...encounter.messages,
      {
        id: makeId('msg'),
        speaker: 'player',
        text: hasSamovar
          ? 'Semaverden taze tavşan kanı çay getirdim, buyur bir yudum al!'
          : 'Bi çayımı içmeden bırakmam, buyur soluklan konuşalım.',
      },
      {
        id: makeId('msg'),
        speaker: 'customer',
        text: `${pick(TEA_REACTIONS[encounter.archetypeId])} (${formatTRY(nextPrice)})`,
        tone: 'positive',
      },
    ],
  };
}

export function applyLegacyDialogueTactic(
  encounter: CustomerEncounter,
  legacyPath: LegacyPathId
): { updatedEncounter: CustomerEncounter; reputationDelta: number } {
  if (encounter.legacyDialogueUsed || encounter.outcome !== 'ACTIVE') {
    return { updatedEncounter: encounter, reputationDelta: 0 };
  }

  const info = LEGACY_PATHS[legacyPath];
  let nextPrice = encounter.customerPrice;
  let nextLimit = encounter.secretLimit;
  let nextMoodScore = encounter.moodScore;
  let nextPatience = encounter.patience;
  let playerText = '';
  let customerText = '';
  let repDelta = 0.04;
  const buyerCap = getBuyerOrTradeCap(encounter);
  const sellerFloor = getSellerTacticFloor(encounter);

  if (legacyPath === 'EX_APPRENTICE') {
    nextMoodScore = Math.min(100, encounter.moodScore + 12);
    nextPatience = Math.min(100, encounter.patience + 8);
    if (encounter.type === 'SELLER') {
      nextPrice = Math.min(
        encounter.customerPrice,
        Math.max(sellerFloor, roundPrice(encounter.customerPrice * 0.93))
      );
      nextLimit = roundPrice(Math.max(900, encounter.secretLimit * 0.94));
      playerText =
        'Beş yıl Cemal Usta’nın yanında anakart söktüm kardeşim; bu kasanın iç kondisyonunu ve ileride çıkacak masrafı ezbere biliyorum. Hakkı olan rakama inelim.';
      customerText = `Vay be, gerçekten işin mutfağından geliyorsun usta! Bilgiye saygım var, fiyatı ${formatTRY(nextPrice)} çekiyorum.`;
    } else {
      nextPrice = Math.max(
        encounter.customerPrice,
        Math.min(buyerCap, roundPrice(encounter.customerPrice * 1.07))
      );
      nextLimit = Math.min(
        encounter.device.askingPrice,
        Math.max(nextPrice, roundPrice(encounter.secretLimit * 1.07))
      );
      playerText =
        'Beş yıllık atölye tecrübemle bu cihazın her vidasını, batarya döngüsünü ve entegresini kontrol ettim. Arızasız, arkasında durduğum makine bu!';
      customerText = `İşte gerçek teknik usta farkı! Bu kadar emin konuşunca içim rahatladı, ${formatTRY(nextPrice)} çıkarabilirim.`;
    }
  } else if (legacyPath === 'BORN_MERCHANT') {
    nextMoodScore = Math.min(100, encounter.moodScore + 4);
    if (encounter.type === 'SELLER') {
      nextPrice = Math.min(
        encounter.customerPrice,
        Math.max(sellerFloor, roundPrice(encounter.customerPrice * 0.91))
      );
      nextLimit = roundPrice(Math.max(900, encounter.secretLimit * 0.92));
      playerText =
        'Tahtakale’de sabah toptan listesine baktım, bu serinin nakit dönüş hızı belli. Bekletmeden peşin sayıyorum, ticaret dönsün!';
      customerText = `Piyasayı benden iyi biliyorsun be kardeşim! Peşin nakit hatırına ${formatTRY(nextPrice)} olsun bakalım.`;
    } else {
      nextPrice = Math.max(
        encounter.customerPrice,
        Math.min(buyerCap, roundPrice(encounter.customerPrice * 1.08))
      );
      nextLimit = Math.min(
        encounter.device.askingPrice,
        Math.max(nextPrice, roundPrice(encounter.secretLimit * 1.08))
      );
      playerText =
        'Pasajın tüm vitrinlerini gezsen bu temizlikte bu fiyata bulamazsın. Toptan ağım sayesinde maliyeti düşük tuttum, kaçırırsan yarına kalmaz!';
      customerText = `Haklısın, demin iki dükkana daha sordum daha pahalıydı... Tamam ${formatTRY(nextPrice)} verebilirim!`;
    }
  } else {
    // SOCIAL_HUSTLER
    nextMoodScore = Math.min(100, encounter.moodScore + 22);
    nextPatience = Math.min(100, encounter.patience + 18);
    repDelta = 0.08;
    if (encounter.type === 'SELLER') {
      nextPrice = Math.min(
        encounter.customerPrice,
        Math.max(sellerFloor, roundPrice(encounter.customerPrice * 0.94))
      );
      nextLimit = roundPrice(Math.max(900, encounter.secretLimit * 0.95));
      playerText =
        'Burası senin de dükkanın sayılır, tek seferlik alışveriş yapmıyoruz! Bir dahaki gelişinde de kapımız açık, gel tatlıya bağlayalım.';
      customerText = `Allah razı olsun ne güzel esnafsın! Gönlüm açıldı vallahi, senin için ${formatTRY(nextPrice)} yapıyorum.`;
    } else {
      nextPrice = Math.max(
        encounter.customerPrice,
        Math.min(buyerCap, roundPrice(encounter.customerPrice * 1.06))
      );
      nextLimit = Math.min(
        encounter.device.askingPrice,
        Math.max(nextPrice, roundPrice(encounter.secretLimit * 1.07))
      );
      playerText =
        'Benden telefon alan herkes mahalle dostumdur; kurulumunu, veri aktarımını ben yaparım, en ufak sorunda kapım sonuna kadar açık!';
      customerText = `İşte aradığım esnaf samimiyeti! Bu güven için ${formatTRY(nextPrice)} gönül rahatlığıyla veririm!`;
    }
  }

  return {
    updatedEncounter: {
      ...encounter,
      legacyDialogueUsed: true,
      customerPrice: nextPrice,
      secretLimit: nextLimit,
      patience: nextPatience,
      moodScore: nextMoodScore,
      mood: deriveMoodFromScore(nextMoodScore),
      lastMoodReason: `${info.name}: ${info.dialogueName}`,
      messages: [
        ...encounter.messages,
        { id: makeId('msg'), speaker: 'player', text: playerText },
        { id: makeId('msg'), speaker: 'customer', text: customerText, tone: 'positive' },
      ],
    },
    reputationDelta: repDelta,
  };
}

export function applyPosInstallmentTactic(
  encounter: CustomerEncounter
): CustomerEncounter {
  if (
    !encounter.wantsInstallment ||
    encounter.posAccepted ||
    encounter.outcome !== 'ACTIVE'
  ) {
    return encounter;
  }
  const cap = getBuyerOrTradeCap(encounter);
  const nextPrice = Math.max(
    encounter.customerPrice,
    Math.min(cap, roundPrice(encounter.customerPrice * 1.07))
  );
  const nextLimit = Math.min(
    encounter.device.askingPrice,
    Math.max(nextPrice, roundPrice(encounter.secretLimit * 1.08))
  );
  const nextMoodScore = Math.min(100, encounter.moodScore + 14);
  return {
    ...encounter,
    posAccepted: true,
    customerPrice: nextPrice,
    secretLimit: nextLimit,
    patience: Math.min(100, encounter.patience + 12),
    moodScore: nextMoodScore,
    mood: deriveMoodFromScore(nextMoodScore),
    lastMoodReason: 'POS Taksit Kabul Edildi (+14)',
    messages: [
      ...encounter.messages,
      {
        id: makeId('msg'),
        speaker: 'player',
        text: 'Tamam kardeşim, seni yormayalım! POS cihazından kredi kartına taksit geçiyorum.',
      },
      {
        id: makeId('msg'),
        speaker: 'customer',
        text: `Süpersin usta! Taksit olunca elim rahatladı, teklifimi ${formatTRY(nextPrice)} seviyesine çıkarıyorum!`,
        tone: 'positive',
      },
    ],
  };
}

export function applyDefectLeverage(
  encounter: CustomerEncounter,
  defectId: DefectId,
  equippedOutfit?: OutfitId
): CustomerEncounter {
  if (
    (encounter.type !== 'SELLER' && encounter.type !== 'TRADE_IN') ||
    encounter.outcome !== 'ACTIVE' ||
    encounter.usedLeverageDefects.includes(defectId)
  ) {
    return encounter;
  }

  const def = DEFECT_CATALOG[defectId];
  const targetDevice =
    encounter.type === 'TRADE_IN' && encounter.tradeInDevice
      ? encounter.tradeInDevice
      : encounter.device;
  // Detective lie-catch bonus: defect directly contradicts seller's verbal claim!
  const caughtLying =
    Boolean(targetDevice.sellerClaim) &&
    targetDevice.sellerClaimCategory === def.category;

  const isSevereCatch =
    caughtLying ||
    defectId === 'imei_unregistered' ||
    defectId === 'battery_fake_chip' ||
    defectId === 'liquid_damage' ||
    defectId === 'screen_aftermarket';

  const moodHit = caughtLying ? 12 : isSevereCatch ? 11 : 7;
  const rawPatienceHit = caughtLying ? 0 : isSevereCatch ? 8 : 5;
  const patienceHit =
    caughtLying
      ? 0
      : equippedOutfit === 'tech_esd_coat'
      ? Math.max(2, Math.round(rawPatienceHit * 0.5))
      : rawPatienceHit;
  const nextMoodScore = Math.max(18, encounter.moodScore - moodHit);
  const nextHeat = Math.min(100, (encounter.negotiationHeat ?? 15) + (caughtLying ? 30 : isSevereCatch ? 24 : 15));
  const reactionText = caughtLying
    ? 'Eyvah... tamam usta yakaladın, lafımı geri alıyorum! Bu cihazda senin dediğin çıktı.'
    : pick(
        (isSevereCatch ? SEVERE_LEVERAGE_REACTIONS : LEVERAGE_REACTIONS)[encounter.archetypeId]
      );

  // Strong Koz breaks stubbornness — softens requiredRounds down to minimum 1 if caught lying, else 2
  const softenedRequiredRounds = Math.max(
    caughtLying ? 1 : 2,
    (encounter.requiredRounds ?? 2) - 1
  );

  if (encounter.type === 'TRADE_IN') {
    const cap = Math.max(encounter.customerPrice, encounter.device.askingPrice - 500);
    const tradeBoostMult = caughtLying ? 1.75 : isSevereCatch ? 1.4 : 1.22;
    const minJump = caughtLying ? 1500 : isSevereCatch ? 1000 : 500;
    const rawNextCash = Math.max(
      encounter.customerPrice + minJump,
      encounter.customerPrice * (1 + def.leverageDropRatio * tradeBoostMult)
    );
    const nextCashOffer = Math.min(cap, roundPrice(rawNextCash));
    const nextLimit = Math.min(
      encounter.device.askingPrice,
      roundPrice(
        Math.max(
          nextCashOffer + 500,
          encounter.secretLimit * (1 + def.leverageDropRatio * (caughtLying ? 1.25 : isSevereCatch ? 1.05 : 0.85))
        )
      )
    );
    const gainedDiff = Math.max(0, nextCashOffer - encounter.customerPrice);

    return {
      ...encounter,
      customerPrice: nextCashOffer,
      secretLimit: nextLimit,
      negotiationHeat: nextHeat,
      requiredRounds: softenedRequiredRounds,
      usedLeverageDefects: [...encounter.usedLeverageDefects, defectId],
      patience: Math.max(12, encounter.patience - patienceHit),
      moodScore: nextMoodScore,
      mood: deriveMoodFromScore(nextMoodScore),
      lastMoodReason: caughtLying
        ? `YALAN YAKALANDI: ${def.shortLabel} (+${formatTRY(gainedDiff)} · 0 Sabır Kaybı!)`
        : `Güçlü Takas Kozu: ${def.shortLabel} (+${formatTRY(gainedDiff)} fark)`,
      messages: [
        ...encounter.messages,
        {
          id: makeId('msg'),
          speaker: 'player',
          text: caughtLying
            ? `Az önce "${targetDevice.sellerClaim}" demiştin ama testte ${def.shortLabel} çıktı! ${def.leverageLine}`
            : `Takasa getirdiğin cihazda ciddi sorun yakaladım: ${def.leverageLine}`,
        },
        {
          id: makeId('msg'),
          speaker: 'customer',
          text: `${reactionText} Üstüne vereceğim nakit farkı ${formatTRY(nextCashOffer)} (+${formatTRY(gainedDiff)}) yapıyorum!`,
          tone: 'positive',
        },
      ],
    };
  }

  // SELLER: Dramatic Koz price drop + extra-heavy penalty when catching a verbal lie!
  const dropMult = caughtLying ? 1.8 : isSevereCatch ? 1.42 : 1.25;
  const minDrop = caughtLying ? 1500 : isSevereCatch ? 1000 : 500;
  const rawNextAsk = Math.min(
    encounter.customerPrice - minDrop,
    encounter.customerPrice * (1 - def.leverageDropRatio * dropMult)
  );
  const nextAsk = roundPrice(Math.max(1000, rawNextAsk));
  const limitDropRatio = Math.min(
    0.55,
    def.leverageDropRatio * (caughtLying ? 1.28 : isSevereCatch ? 1.0 : 0.82)
  );
  const nextLimit = roundPrice(
    Math.max(
      900,
      Math.min(nextAsk * 0.88, encounter.secretLimit * (1 - limitDropRatio))
    )
  );
  const droppedAmount = Math.max(0, encounter.customerPrice - nextAsk);

  return {
    ...encounter,
    customerPrice: nextAsk,
    secretLimit: nextLimit,
    negotiationHeat: nextHeat,
    requiredRounds: softenedRequiredRounds,
    usedLeverageDefects: [...encounter.usedLeverageDefects, defectId],
    patience: Math.max(12, encounter.patience - patienceHit),
    moodScore: nextMoodScore,
    mood: deriveMoodFromScore(nextMoodScore),
    lastMoodReason: caughtLying
      ? `YALAN YAKALANDI: ${def.shortLabel} (-${formatTRY(droppedAmount)} · 0 Sabır Kaybı!)`
      : `${isSevereCatch ? 'Ağır Koz' : 'Kusur Kozu'}: ${def.shortLabel} (-${formatTRY(droppedAmount)})`,
    messages: [
      ...encounter.messages,
      {
        id: makeId('msg'),
        speaker: 'player',
        text: caughtLying
          ? `Hani "${targetDevice.sellerClaim}" demiştin? Testte ${def.shortLabel} çıktı! ${def.leverageLine}`
          : def.leverageLine,
      },
      {
        id: makeId('msg'),
        speaker: 'customer',
        text: `${reactionText} Yeni fiyatım ${formatTRY(nextAsk)} (-${formatTRY(droppedAmount)})!`,
        tone: 'positive',
      },
    ],
  };
}

export function applyBluffOrPitchTactic(
  encounter: CustomerEncounter
): { updatedEncounter: CustomerEncounter; reputationDelta: number } {
  if (encounter.bluffUsed || encounter.outcome !== 'ACTIVE') {
    return { updatedEncounter: encounter, reputationDelta: 0 };
  }

  const arch = CUSTOMER_ARCHETYPES[encounter.archetypeId];

  if (encounter.type === 'SELLER') {
    const success = Math.random() < arch.bluffTolerance + 0.15;
    if (success) {
      const nextAsk = roundPrice(Math.max(1000, encounter.customerPrice * 0.89));
      const nextLimit = roundPrice(Math.max(900, encounter.secretLimit * 0.92));
      const nextMoodScore = Math.max(22, encounter.moodScore - 8);
      return {
        updatedEncounter: {
          ...encounter,
          bluffUsed: true,
          customerPrice: nextAsk,
          secretLimit: nextLimit,
          patience: Math.max(12, encounter.patience - 14),
          moodScore: nextMoodScore,
          mood: deriveMoodFromScore(nextMoodScore),
          lastMoodReason: 'Piyasa Blöfü Tuttu (-8)',
          messages: [
            ...encounter.messages,
            {
              id: makeId('msg'),
              speaker: 'player',
              text: 'Bak elimde bu modelden iki tane daha var, piyasası düştü. Hızlı nakit istiyorsan in.',
            },
            {
              id: makeId('msg'),
              speaker: 'customer',
              text: `Vay arkadaş piyasa ne ara düştü? Tamam madem, ${formatTRY(nextAsk)} olsun bari.`,
              tone: 'positive',
            },
          ],
        },
        reputationDelta: 0,
      };
    } else {
      const nextPatience = Math.max(0, encounter.patience - 28);
      const nextMoodScore = Math.max(0, encounter.moodScore - 26);
      return {
        updatedEncounter: {
          ...encounter,
          bluffUsed: true,
          patience: nextPatience,
          moodScore: nextMoodScore,
          outcome: nextPatience <= 0 ? 'WALKED_OUT' : 'ACTIVE',
          mood: nextPatience <= 0 ? 'angry' : deriveMoodFromScore(nextMoodScore),
          lastMoodReason: 'Blöf Yakalandı (-26)',
          messages: [
            ...encounter.messages,
            {
              id: makeId('msg'),
              speaker: 'player',
              text: 'Bu model artık elde kalıyor, piyasası yarıya indi haberin olsun.',
            },
            {
              id: makeId('msg'),
              speaker: 'customer',
              text:
                nextPatience <= 0
                  ? pick(WALKOUT_LINES[encounter.archetypeId])
                  : 'Beni acemi mi sandın usta? İnternette fiyatları görüyoruz, o blöf yemez!',
              tone: 'danger',
            },
          ],
        },
        reputationDelta: -0.05,
      };
    }
  } else {
    const isClean = encounter.device.defects.length === 0;
    if (isClean) {
      const bonusMult =
        encounter.device.isBrandNew || encounter.device.masterCrafted ? 1.13 : 1.09;
      const cap = getBuyerOrTradeCap(encounter);
      const nextOffer = Math.max(
        encounter.customerPrice,
        Math.min(cap, roundPrice(encounter.customerPrice * bonusMult))
      );
      const nextLimit = Math.min(
        encounter.device.askingPrice,
        Math.max(nextOffer, roundPrice(encounter.secretLimit * bonusMult))
      );
      const nextMoodScore = Math.min(100, encounter.moodScore + 16);
      return {
        updatedEncounter: {
          ...encounter,
          bluffUsed: true,
          honestPitchUsed: true,
          customerPrice: nextOffer,
          secretLimit: nextLimit,
          patience: Math.min(100, encounter.patience + 12),
          moodScore: nextMoodScore,
          mood: deriveMoodFromScore(nextMoodScore),
          lastMoodReason: 'Garanti Güvencesi (+16)',
          messages: [
            ...encounter.messages,
            {
              id: makeId('msg'),
              speaker: 'player',
              text: encounter.device.isBrandNew
                ? 'Fabrika jelatini üstünde, 24 ay resmi TR distribütör garantili sıfır kutu! Faturasını kesip veriyorum.'
                : encounter.device.masterCrafted
                ? 'Kendi atölyemde Usta İşi yeniledim, tüm testleri %100 geçti. Dükkan garantisi veriyorum!'
                : 'Tüm testlerini kendim yaptım: orijinal ekran, sağlam pil, TR kayıtlı. Dükkan garantisi veriyorum!',
            },
            {
              id: makeId('msg'),
              speaker: 'customer',
              text: `İşte güven veren esnaf! Garantisi varsa ${formatTRY(nextOffer)} çıkarım, gönül rahatlığıyla alırım.`,
              tone: 'positive',
            },
          ],
        },
        reputationDelta: 0.12,
      };
    } else {
      const nextPatience = Math.max(10, encounter.patience - 22);
      const nextMoodScore = Math.max(8, encounter.moodScore - 24);
      return {
        updatedEncounter: {
          ...encounter,
          bluffUsed: true,
          patience: nextPatience,
          moodScore: nextMoodScore,
          mood: deriveMoodFromScore(nextMoodScore),
          lastMoodReason: 'Eksik Bilgi Güveni Sarstı (-24)',
          messages: [
            ...encounter.messages,
            {
              id: makeId('msg'),
              speaker: 'player',
              text: 'Abi nokta hatasız, sıfırından farksız cihaz bu!',
            },
            {
              id: makeId('msg'),
              speaker: 'customer',
              text: 'Emin misin usta? Cihazda kusurlar belli oluyor, dürüst olmanı beklerdim.',
              tone: 'warning',
            },
          ],
        },
        reputationDelta: -0.15,
      };
    }
  }
}

export function generateCustomerReview(
  day: number,
  encounter: CustomerEncounter,
  legacyPath?: LegacyPathId
): CustomerReview {
  if (encounter.outcome === 'WALKED_OUT') {
    return {
      id: makeId('rev'),
      day,
      customerName: encounter.customerName,
      rating: encounter.moodScore <= 10 ? 1 : 2,
      comment: pick(CUSTOMER_REVIEW_COMMENTS.lowStar),
      dealType: encounter.type,
    };
  }
  const effectiveScore =
    encounter.moodScore +
    (encounter.teaServed ? 8 : 0) +
    (legacyPath === 'SOCIAL_HUSTLER' ? 6 : 0);

  if (effectiveScore >= 76) {
    return {
      id: makeId('rev'),
      day,
      customerName: encounter.customerName,
      rating: 5,
      comment: pick(CUSTOMER_REVIEW_COMMENTS.fiveStar),
      dealType: encounter.type,
    };
  }
  if (effectiveScore >= 54) {
    return {
      id: makeId('rev'),
      day,
      customerName: encounter.customerName,
      rating: 4,
      comment: pick(CUSTOMER_REVIEW_COMMENTS.fourStar),
      dealType: encounter.type,
    };
  }
  return {
    id: makeId('rev'),
    day,
    customerName: encounter.customerName,
    rating: 3,
    comment: pick(CUSTOMER_REVIEW_COMMENTS.threeStar),
    dealType: encounter.type,
  };
}

export function evaluateCrossSellPitch(
  encounter: CustomerEncounter,
  accessoryId: AccessoryId,
  stock: AccessoryStockItem,
  shopLevel: number,
  legacyPath?: LegacyPathId,
  extraChanceBonus = 0
): {
  updatedEncounter: CustomerEncounter;
  accepted: boolean;
  retailPrice: number;
  profit: number;
} {
  const spec = getAccessorySpec(accessoryId);
  const wholesaleCost = getAccessoryWholesaleCost(accessoryId, legacyPath);
  const existingAttachments = encounter.crossSellAttachments ?? [];
  const triedIds = encounter.crossSellTriedIds ?? [];
  const priceRatio = stock.retailPrice / spec.recommendedPrice;
  const baseChance =
    priceRatio <= 1.0 ? 0.78 : priceRatio <= 1.18 ? 0.6 : 0.36;
  // Slightly harder for each additional accessory stacked on the same buyer
  const stackPenalty = existingAttachments.length * 0.11;
  const levelBonus = shopLevel >= 4 ? 0.08 : 0;
  const teaBonus = encounter.teaServed ? 0.08 : 0;
  const moodBonus = encounter.moodScore >= 70 ? 0.1 : encounter.moodScore <= 35 ? -0.15 : 0;
  const legacyBonus = legacyPath === 'SOCIAL_HUSTLER' ? 0.18 : 0;
  const accepted =
    Math.random() <
    Math.max(
      0.14,
      Math.min(
        0.96,
        baseChance + levelBonus + extraChanceBonus + teaBonus + moodBonus + legacyBonus - stackPenalty
      )
    );

  const nextTried = triedIds.includes(accessoryId) ? triedIds : [...triedIds, accessoryId];

  if (accepted) {
    const profit = stock.retailPrice - wholesaleCost;
    const nextMoodScore = Math.min(100, encounter.moodScore + 5);
    const newItem = {
      id: accessoryId,
      name: spec.name,
      retailPrice: stock.retailPrice,
      profit,
    };
    const nextAttachments = [...existingAttachments, newItem];
    return {
      accepted: true,
      retailPrice: stock.retailPrice,
      profit,
      updatedEncounter: {
        ...encounter,
        crossSellAttempted: true,
        crossSellAttached: newItem,
        crossSellAttachments: nextAttachments,
        crossSellTriedIds: nextTried,
        moodScore: nextMoodScore,
        mood: deriveMoodFromScore(nextMoodScore),
        lastMoodReason: `Aksesuar Sepeti (${nextAttachments.length} ürün) (+5)`,
        messages: [
          ...encounter.messages,
          {
            id: makeId('msg'),
            speaker: 'player',
            text: `Telefonun yanına hemen bir ${spec.name} (${formatTRY(stock.retailPrice)}) de ekleyelim mi?`,
          },
          {
            id: makeId('msg'),
            speaker: 'customer',
            text:
              nextAttachments.length > 1
                ? `Harika kombin oldu usta, bunu da poşete ekle alıyorum!`
                : `Çok mantıklı abi, yeni cihaza şart! Onu da hesaba ekle, alıyorum!`,
            tone: 'positive',
          },
        ],
      },
    };
  }

  return {
    accepted: false,
    retailPrice: 0,
    profit: 0,
    updatedEncounter: {
      ...encounter,
      crossSellAttempted: true,
      crossSellTriedIds: nextTried,
      messages: [
        ...encounter.messages,
        {
          id: makeId('msg'),
          speaker: 'player',
          text: `Yanına ${spec.name} (${formatTRY(stock.retailPrice)}) de ekleyelim mi?`,
        },
        {
          id: makeId('msg'),
          speaker: 'customer',
          text: 'Yok usta o kalsın, başka bir ürün varsa ona bakabilirim.',
          tone: 'neutral',
        },
      ],
    },
  };
}

export function inspectPhoneCategory(
  device: PhoneDevice,
  category: InspectionCategory
): { updatedDevice: PhoneDevice; foundDefects: DefectId[] } {
  const updatedDevice: PhoneDevice = {
    ...device,
    inspected: {
      ...device.inspected,
      [category]: true,
    },
  };
  const foundDefects = device.defects.filter(
    (d) => DEFECT_CATALOG[d].category === category
  );
  return { updatedDevice, foundDefects };
}

export function applyMasterTechEndOfDay(state: ShopState): {
  updatedInventory: PhoneDevice[];
  cost: number;
  fixedCount: number;
  note?: string;
} {
  if (!state.staff.includes('master_tech')) {
    return { updatedInventory: state.inventory, cost: 0, fixedCount: 0 };
  }
  const techLevel = state.staffLevels?.master_tech ?? 1;
  const specs = getMasterTechSpecs(techLevel, state.upgrades);
  const maxRepairs = Math.min(4, 1 + Math.floor(techLevel / 3));
  let runningCash = state.cash;
  let totalCost = 0;
  let fixedCount = 0;
  const notes: string[] = [];
  const nextInv = [...state.inventory];

  for (let i = 0; i < nextInv.length && fixedCount < maxRepairs; i++) {
    const phone = nextInv[i];
    if (phone.assignedToStaff) continue;
    const fixable = phone.defects.find((d) => DEFECT_CATALOG[d].repairable);
    if (fixable) {
      const discountedCost =
        Math.round(
          (getRepairCost(
            fixable,
            state.upgrades,
            state.dailyNews,
            false,
            state.level,
            state.legacyPath
          ) *
            specs.partCostFactor) /
            50
        ) * 50;
      if (runningCash >= discountedCost) {
        runningCash -= discountedCost;
        totalCost += discountedCost;
        fixedCount += 1;
        const updatedPhone: PhoneDevice = {
          ...phone,
          defects: phone.defects.filter((d) => d !== fixable),
          repairedDefects: [...phone.repairedDefects, fixable],
          repairSpend: phone.repairSpend + discountedCost,
          masterCrafted: true,
          batteryHealth:
            fixable === 'battery_degraded' || fixable === 'battery_fake_chip'
              ? 100
              : phone.batteryHealth,
          reportedBatteryHealth:
            fixable === 'battery_degraded' || fixable === 'battery_fake_chip'
              ? 100
              : phone.reportedBatteryHealth,
          batteryCycles:
            fixable === 'battery_degraded' || fixable === 'battery_fake_chip'
              ? 1
              : phone.batteryCycles,
        };
        updatedPhone.askingPrice = Math.max(
          updatedPhone.askingPrice,
          roundPrice(calculateMarketValue(updatedPhone, false, state.dailyNews, state.upgrades) * 1.15)
        );
        nextInv[i] = updatedPhone;
        notes.push(`${phone.brand} ${phone.model} (${DEFECT_CATALOG[fixable].shortLabel})`);
      }
    }
  }
  return {
    updatedInventory: nextInv,
    cost: totalCost,
    fixedCount,
    note:
      notes.length > 0
        ? `Hasan Usta (Sv.${techLevel}) gece mesaisinde ${notes.join(' + ')} onarımlarını Usta İşi tamamladı!`
        : undefined,
  };
}

export function checkVictoryCondition(state: ShopState): boolean {
  if (state.endlessMode) return false;
  return (
    state.cash >= VICTORY_CASH_GOAL &&
    state.reputation >= VICTORY_REPUTATION_GOAL &&
    state.shopTier >= 6
  );
}

export function saveShopState(state: ShopState): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...state, lastSavedAt: Date.now() })
    );
  } catch {
    // Ignore storage quota issues
  }
}

export function loadShopState(): ShopState | null {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      for (const key of LEGACY_KEYS) {
        const legacy = localStorage.getItem(key);
        if (legacy) {
          raw = legacy;
          break;
        }
      }
    }
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ShopState>;
    if (!parsed || typeof parsed.cash !== 'number' || !Array.isArray(parsed.inventory)) {
      return null;
    }

    const day = parsed.day ?? 1;
    const shopTier = Math.max(1, Math.min(6, parsed.shopTier ?? 1)) as ShopTier;
    const staff = parsed.staff ?? [];
    const upgrades = parsed.upgrades ?? [];

    const migratedInventory = parsed.inventory.map((p) => ({
      ...p,
      brand: p.brand === 'LeicaCam' ? 'LuminaCam' : p.brand,
      model: p.model === 'Galaxy A34' ? 'Galax A34' : p.model,
      batteryCycles: p.batteryCycles ?? 180,
      imeiNumber:
        p.imeiNumber ?? generateImeiNumber(p.imeiStatus === 'TR_REGISTERED'),
      warrantyMonths: p.warrantyMonths ?? 0,
      isBrandNew: p.isBrandNew ?? false,
      bundledAccessories: Array.isArray(p.bundledAccessories) ? p.bundledAccessories : [],
      assignedToStaff: p.assignedToStaff ?? false,
    }));

    const defaultAcc = createInitialAccessories();
    const migratedAccessories: Record<AccessoryId, AccessoryStockItem> = {
      ...defaultAcc,
      ...(parsed.accessories ?? {}),
    };

    const news =
      parsed.dailyNews && 'gossipNote' in parsed.dailyNews
        ? parsed.dailyNews
        : pickDailyNewspaper(day);

    const xp = parsed.xp ?? 0;
    const level = getLevelFromXp(xp);
    const migratedQuests: DailyQuest[] =
      Array.isArray(parsed.dailyQuests) &&
      parsed.dailyQuests.length > 0 &&
      'description' in parsed.dailyQuests[0]
        ? parsed.dailyQuests
        : generateDailyQuests(day, upgrades, level);

    const todayStr = getTodayDateString();
    const prevDateStr = parsed.lastLoginDateStr ?? todayStr;
    let nextLoginStreak = parsed.loginStreak ?? 1;
    let streakClaimed = parsed.dailyStreakClaimed ?? false;
    if (prevDateStr !== todayStr) {
      const prevTime = new Date(prevDateStr).getTime();
      const todayTime = new Date(todayStr).getTime();
      const diffDays = Math.round((todayTime - prevTime) / 86400000);
      nextLoginStreak = diffDays === 1 ? Math.min(7, nextLoginStreak + 1) : 1;
      streakClaimed = false;
    }

    const migrated: ShopState = {
      day,
      cash: parsed.cash,
      reputation: parsed.reputation ?? 3.0,
      xp,
      level,
      legacyPath: parsed.legacyPath ?? 'EX_APPRENTICE',
      dealStreak: parsed.dealStreak ?? 0,
      bestDealStreak: parsed.bestDealStreak ?? 0,
      shopTier,
      showcaseUpgradeLevel: parsed.showcaseUpgradeLevel ?? 0,
      inventory: migratedInventory,
      accessories: migratedAccessories,
      upgrades,
      decorations: parsed.decorations ?? [],
      activeDecorations: parsed.activeDecorations ?? [],
      staff,
      staffLevels: {
        apprentice: 1,
        master_tech: 1,
        sales_rep: 1,
        accountant: 1,
        ...(parsed.staffLevels ?? {}),
      },
      branches: Array.isArray(parsed.branches) ? parsed.branches : [],
      museumItems: Array.isArray(parsed.museumItems) ? parsed.museumItems : [],
      activeLoans: Array.isArray(parsed.activeLoans) ? parsed.activeLoans : [],
      distributorLoyalty: parsed.distributorLoyalty ?? {},
      rival: parsed.rival ?? {
        name: 'Kurnaz Kerim',
        shopName: 'Kerim GSM Köşe',
        marketShare: 62,
        buyoutCost: 48000,
        boughtOut: false,
        lastTaunt: 'Kurnaz Kerim: "Pasajın asıl ustası kimmiş görelim!"',
        promoUsedToday: false,
      },
      soldHistory: Array.isArray(parsed.soldHistory) ? parsed.soldHistory : [],
      onlineListings: Array.isArray(parsed.onlineListings)
        ? parsed.onlineListings.map((l) => ({
            ...l,
            status: l.status ?? (l.bought ? 'BOUGHT' : 'AVAILABLE'),
            currentPrice: l.currentPrice ?? l.askingPrice,
          }))
        : [],
      shippingOrders: Array.isArray(parsed.shippingOrders) ? parsed.shippingOrders : [],
      dailyAuctionLot: parsed.dailyAuctionLot ?? null,
      dailyAuctionLots: Array.isArray(parsed.dailyAuctionLots) ? parsed.dailyAuctionLots : [],
      pendingProjects: Array.isArray(parsed.pendingProjects) ? parsed.pendingProjects : [],
      pendingWholesaleOrders: Array.isArray(parsed.pendingWholesaleOrders)
        ? parsed.pendingWholesaleOrders
        : [],
      staffRepairQueue: Array.isArray(parsed.staffRepairQueue) ? parsed.staffRepairQueue : [],
      morningNotifications: Array.isArray(parsed.morningNotifications)
        ? parsed.morningNotifications
        : [],
      flashWholesaleDeal:
        parsed.flashWholesaleDeal !== undefined
          ? parsed.flashWholesaleDeal
          : generateFlashWholesaleDeal(day, level),
      ownedOutfits:
        Array.isArray(parsed.ownedOutfits) && parsed.ownedOutfits.length > 0
          ? parsed.ownedOutfits
          : ['casual_hoodie'],
      equippedOutfit: parsed.equippedOutfit ?? 'casual_hoodie',
      activeStoreEvent: parsed.activeStoreEvent ?? null,
      nextCustomerEventEffect: parsed.nextCustomerEventEffect ?? null,
      storeEventsTriggeredToday: parsed.storeEventsTriggeredToday ?? 0,
      todayRentDiscountPct: parsed.todayRentDiscountPct ?? 0,
      privacyAccepted: parsed.privacyAccepted ?? true,
      hapticsEnabled: parsed.hapticsEnabled ?? true,
      textSpeed: parsed.textSpeed ?? 'fast',
      ratedApp: parsed.ratedApp ?? false,
      feedbackNotes: Array.isArray(parsed.feedbackNotes) ? parsed.feedbackNotes : [],
      weeklyTaxDue: parsed.weeklyTaxDue ?? 0,
      loginStreak: nextLoginStreak,
      lastLoginDateStr: todayStr,
      dailyStreakClaimed: streakClaimed,
      lastSavedAt: parsed.lastSavedAt ?? Date.now(),
      dailyNews: news,
      dailyWholesaleDiscountBrand:
        parsed.dailyWholesaleDiscountBrand ?? pickDailyWholesaleDiscountBrand(day),
      dailyQuests: migratedQuests,
      claimedMilestoneIds: Array.isArray(parsed.claimedMilestoneIds)
        ? parsed.claimedMilestoneIds
        : [],
      claimedChapterIds: Array.isArray(parsed.claimedChapterIds)
        ? parsed.claimedChapterIds
        : [],
      discoveredSpecIds: Array.isArray(parsed.discoveredSpecIds)
        ? parsed.discoveredSpecIds
        : migratedInventory.map((p) => p.specId),
      dailyQueue: Array.isArray(parsed.dailyQueue)
        ? parsed.dailyQueue.map((enc) => ({
            ...enc,
            moodScore: enc.moodScore ?? 60,
            negotiationHeat: enc.negotiationHeat ?? 15,
            legacyDialogueUsed: enc.legacyDialogueUsed ?? false,
            crossSellAttachments: Array.isArray(enc.crossSellAttachments)
              ? enc.crossSellAttachments
              : enc.crossSellAttached
              ? [enc.crossSellAttached]
              : [],
            crossSellTriedIds: Array.isArray(enc.crossSellTriedIds)
              ? enc.crossSellTriedIds
              : [],
            device: {
              ...enc.device,
              brand: enc.device.brand === 'LeicaCam' ? 'LuminaCam' : enc.device.brand,
              model: enc.device.model === 'Galaxy A34' ? 'Galax A34' : enc.device.model,
              batteryCycles: enc.device.batteryCycles ?? 210,
              imeiNumber:
                enc.device.imeiNumber ??
                generateImeiNumber(enc.device.imeiStatus === 'TR_REGISTERED'),
              warrantyMonths: enc.device.warrantyMonths ?? 0,
              isBrandNew: enc.device.isBrandNew ?? false,
            },
          }))
        : [],
      currentQueueIndex: parsed.currentQueueIndex ?? 0,
      todayStats: {
        ...createEmptyDayStats(day, shopTier, staff),
        ...(parsed.todayStats ?? {}),
        salesTaxPaid: parsed.todayStats?.salesTaxPaid ?? 0,
      },
      history: Array.isArray(parsed.history) ? parsed.history : [],
      reviews: Array.isArray(parsed.reviews) ? parsed.reviews : [],
      totalProfitEarned: parsed.totalProfitEarned ?? 0,
      totalPhonesSold: parsed.totalPhonesSold ?? 0,
      totalBrandNewSold: parsed.totalBrandNewSold ?? 0,
      totalAccessoriesSold: parsed.totalAccessoriesSold ?? 0,
      totalPhonesRepaired: parsed.totalPhonesRepaired ?? 0,
      totalDefectsExposed: parsed.totalDefectsExposed ?? 0,
      totalTeasServed: parsed.totalTeasServed ?? 0,
      totalTradeInsDone: parsed.totalTradeInsDone ?? 0,
      totalAuctionsWon: parsed.totalAuctionsWon ?? 0,
      bestSingleDealProfit: parsed.bestSingleDealProfit ?? 0,
      unlockedAchievementIds: Array.isArray(parsed.unlockedAchievementIds)
        ? parsed.unlockedAchievementIds
        : undefined,
      unlockedEarningsBadges: Array.isArray(parsed.unlockedEarningsBadges)
        ? parsed.unlockedEarningsBadges
        : undefined,
      tutorialDismissed: parsed.tutorialDismissed ?? day > 1,
      allTabsUnlockedEarly: parsed.allTabsUnlockedEarly ?? day >= 4,
      ambientSoundEnabled: parsed.ambientSoundEnabled ?? false,
      storyIntroSeen: parsed.storyIntroSeen ?? true,
      endlessMode: parsed.endlessMode ?? false,
      prestigeLevel: parsed.prestigeLevel ?? 0,
      prestigePoints: parsed.prestigePoints ?? 0,
      prestigePerks: Array.isArray(parsed.prestigePerks) ? parsed.prestigePerks : [],
      lifetimeTotalProfit: parsed.lifetimeTotalProfit ?? parsed.totalProfitEarned ?? 0,
      radioStation: parsed.radioStation ?? 'OFF',
      spareParts: {
        screen: parsed.spareParts?.screen ?? 1,
        battery: parsed.spareParts?.battery ?? 1,
        board_kit: parsed.spareParts?.board_kit ?? 1,
      },
      complaintHistory: Array.isArray(parsed.complaintHistory)
        ? parsed.complaintHistory
        : [],
      sundayKermes: parsed.sundayKermes ?? null,
      adState: normalizeAdState(parsed.adState, day),
      activeDrama: parsed.activeDrama ?? null,
      completedDramaIds: Array.isArray(parsed.completedDramaIds)
        ? parsed.completedDramaIds
        : [],
      lastDramaDay: parsed.lastDramaDay ?? 0,
      loansPaidOffCount: parsed.loansPaidOffCount ?? 0,
      debtFreePrestigeBonus: parsed.debtFreePrestigeBonus ?? 0,
    };

    // Ensure starter Vintage Radio, Copper Tea Boiler & Prestige Plaque (if P1+) are owned
    if (!migrated.decorations.includes('vintage_radio')) {
      migrated.decorations = ['vintage_radio', ...migrated.decorations];
      if (!migrated.activeDecorations.includes('vintage_radio')) {
        migrated.activeDecorations = ['vintage_radio', ...migrated.activeDecorations];
      }
    }
    if (!migrated.decorations.includes('tea_boiler')) {
      migrated.decorations = ['tea_boiler', ...migrated.decorations];
      if (!migrated.activeDecorations.includes('tea_boiler')) {
        migrated.activeDecorations = ['tea_boiler', ...migrated.activeDecorations];
      }
    }
    if ((migrated.prestigeLevel ?? 0) >= 1) {
      if (!migrated.decorations.includes('prestige_plaque')) {
        migrated.decorations = ['prestige_plaque', ...migrated.decorations];
      }
      if (!migrated.activeDecorations.includes('prestige_plaque')) {
        migrated.activeDecorations = ['prestige_plaque', ...migrated.activeDecorations];
      }
    }
    if (getWeekdayInfo(migrated.day).isSunday) {
      if (!migrated.sundayKermes || migrated.sundayKermes.day !== migrated.day) {
        migrated.sundayKermes = generateSundayKermes(migrated);
      }
    } else {
      migrated.sundayKermes = null;
    }

    if (migrated.dailyQueue.length === 0) {
      migrated.dailyQueue = generateDailyQueue(migrated);
      migrated.currentQueueIndex = 0;
    }
    if (migrated.onlineListings.length === 0) {
      migrated.onlineListings = generateOnlineClassifieds(migrated);
    }
    if (migrated.shippingOrders.length === 0) {
      migrated.shippingOrders = generateShippingOrders(migrated);
    }
    if (migrated.dailyAuctionLots.length < 6) {
      migrated.dailyAuctionLots = generateDailyAuctionLots(migrated);
      migrated.dailyAuctionLot = migrated.dailyAuctionLots[0] ?? null;
    }
    if (migrated.rival && migrated.rival.buyoutCost < 250000) {
      migrated.rival = { ...migrated.rival, buyoutCost: 250000 };
    }
    return migrated;
  } catch {
    return null;
  }
}

export function clearSavedShopState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    for (const key of LEGACY_KEYS) {
      localStorage.removeItem(key);
    }
  } catch {
    // Ignore
  }
}
