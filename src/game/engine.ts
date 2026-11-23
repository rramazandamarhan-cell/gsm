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
  LAUNCH_EVENTS_BY_DAY,
  LEGACY_PATHS,
  LEVERAGE_REACTIONS,
  MUSEUM_ITEMS,
  PHONE_CATALOG,
  RANDOM_NEWSPAPER_POOL,
  REGULAR_GREETING_NOTES,
  SELLER_OPENING_LINES,
  SHOP_DECORATIONS,
  SHOP_STAFF,
  SHOP_TIERS,
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
  BranchId,
  CareerMilestone,
  CustomerArchetypeId,
  CustomerEncounter,
  CustomerMood,
  CustomerReview,
  CustomsAuctionLot,
  DailyMarketEvent,
  DailyQuest,
  DailyQuestKind,
  DayFinancials,
  DayHistoryEntry,
  DefectId,
  InspectionCategory,
  LegacyPathId,
  MuseumItemId,
  NegotiationPace,
  NegotiationTone,
  OfflineEarningsSummary,
  OnlineClassifiedListing,
  PhoneDevice,
  PhoneModelSpec,
  PhoneTier,
  ShippingOrder,
  ShopState,
  ShopTier,
  StaffId,
  StoryChapter,
  UpgradeId,
} from './types';

const STORAGE_KEY = 'gsm_simulator_save_v7';
const LEGACY_KEYS = [
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
  if (state.shopTier === 3 && state.cash >= 200000) return 'GSM İmparatoru';
  if (state.shopTier === 3 || state.level >= 8) return 'Showroom Patronu';
  if (state.shopTier === 2 || state.level >= 5) return 'Cadde Bayisi';
  if (state.totalPhonesSold >= 4 || state.level >= 3) return 'Usta Eksper';
  return 'Genç Esnaf (23)';
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

// Balanced long-term 10-level progression curve (not too fast, not too slow)
const LEVEL_XP_THRESHOLDS = [0, 180, 440, 820, 1320, 1980, 2800, 3800, 5000, 6500];

export function getLevelFromXp(xp: number): number {
  let lvl = 1;
  for (let i = 0; i < LEVEL_XP_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_XP_THRESHOLDS[i]) {
      lvl = i + 1;
    }
  }
  return lvl;
}

export function getLevelProgress(xp: number): {
  level: number;
  currentInLevel: number;
  neededForNext: number;
  percent: number;
} {
  const level = getLevelFromXp(xp);
  const currentThreshold = LEVEL_XP_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold =
    LEVEL_XP_THRESHOLDS[level] ?? currentThreshold + 1800;
  const span = Math.max(1, nextThreshold - currentThreshold);
  const currentInLevel = Math.max(0, xp - currentThreshold);
  return {
    level,
    currentInLevel,
    neededForNext: span,
    percent: Math.min(100, Math.round((currentInLevel / span) * 100)),
  };
}

export function getStreakBonusCash(streak: number, level: number): number {
  if (streak < 2) return 0;
  const base = Math.min(2400, (streak - 1) * 350);
  return level >= 8 ? Math.round(base * 1.5) : base;
}

export function createInitialAccessories(): Record<AccessoryId, AccessoryStockItem> {
  const map = {} as Record<AccessoryId, AccessoryStockItem>;
  for (const spec of ACCESSORY_CATALOG) {
    const starterQty =
      spec.id === 'tempered_glass'
        ? 4
        : spec.id === 'magsafe_case'
        ? 2
        : spec.id === 'gan_charger'
        ? 1
        : 0;
    map[spec.id] = {
      id: spec.id,
      quantity: starterQty,
      retailPrice: spec.recommendedPrice,
      totalSold: 0,
    };
  }
  return map;
}

export function getAccessorySpec(id: AccessoryId) {
  return ACCESSORY_CATALOG.find((a) => a.id === id) ?? ACCESSORY_CATALOG[0];
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
  level: number,
  reputation: number
): boolean {
  const dist = BRAND_DISTRIBUTORS.find((d) => d.id === distributorId);
  if (!dist) return false;
  return level >= dist.minLevel && reputation >= dist.minReputation;
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
  shortNote: string;
  tone: 'positive' | 'neutral' | 'warning' | 'danger';
} {
  switch (mood) {
    case 'excited':
      return {
        label: 'Çok Keyifli',
        shortNote: 'Fiyatta esnemeye ve ek ürün almaya çok açık',
        tone: 'positive',
      };
    case 'happy':
      return {
        label: 'Güler Yüzlü',
        shortNote: 'Sohbetten memnun, orta yolu bulmaya sıcak',
        tone: 'positive',
      };
    case 'calm':
      return {
        label: 'Sakin & Ölçülü',
        shortNote: 'Pazarlığı tartıyor, üslubun belirleyici olacak',
        tone: 'neutral',
      };
    case 'thinking':
      return {
        label: 'Tereddütlü',
        shortNote: 'Kararsız — doğru argüman veya samimi üslup lazım',
        tone: 'warning',
      };
    case 'annoyed':
      return {
        label: 'Gergin',
        shortNote: 'Sert veya yavaş pazarlık canını sıktı, dikkat!',
        tone: 'danger',
      };
    case 'angry':
      return {
        label: 'Öfkeli',
        shortNote: 'Anlaşmadan kalkmak üzere!',
        tone: 'danger',
      };
  }
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
  shopLevel: number,
  dailyDiscountBrand?: string,
  legacyPath?: LegacyPathId,
  loyaltyUnits = 0
): number {
  const dist = getDistributorForBrand(spec.brand);
  // Sealed brand-new retail is ~1.18x second-hand baseValue; wholesale is dist.wholesaleRatio * baseValue (~15-22% profit margin!)
  let mult = dist.wholesaleRatio;
  if (shopLevel >= 7) mult -= 0.04;
  if (shopLevel >= 10) mult -= 0.04;
  if (legacyPath === 'BORN_MERCHANT') {
    mult -= 0.06; // Doğuştan Tüccar permanent wholesale network discount
  }
  if (loyaltyUnits >= 2) {
    mult -= Math.min(0.06, Math.floor(loyaltyUnits / 2) * 0.02); // Authorized dealer loyalty discount
  }
  if (dailyDiscountBrand && dailyDiscountBrand === spec.brand) {
    mult -= 0.06; // Daily Distributor Flash Deal!
  }
  return roundPrice(spec.baseValue * Math.max(0.72, mult));
}

export function generateBrandNewPhone(
  spec: PhoneModelSpec,
  wholesaleCost: number,
  dailyNews?: DailyMarketEvent
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
  const retailFair = calculateMarketValue(phone, false, dailyNews);
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
      return Math.max(0, Math.round(state.totalProfitEarned));
    case 'totalAccessoriesSold':
      return state.totalAccessoriesSold;
    case 'totalBrandNewSold':
      return state.totalBrandNewSold;
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

export function generateDailyQuests(
  day: number,
  upgrades: UpgradeId[]
): DailyQuest[] {
  const pool: Omit<DailyQuest, 'id' | 'progress' | 'claimed'>[] = [
    {
      kind: 'INSPECT_FULL',
      title: 'Detaylı Ekspertiz Uzmanı',
      description: 'Tezgaha konulan 2 telefonun tüm 4 donanım testini eksiksiz tamamla.',
      target: 2,
      reward: 1200 + day * 180,
      xpReward: 40,
    },
    {
      kind: 'USE_LEVERAGE',
      title: 'Kartal Gözlü Pazarlıkçı',
      description: 'Ekspertizde yakaladığın 2 gizli kusuru satıcıya karşı koz olarak kullan.',
      target: 2,
      reward: 1450 + day * 200,
      xpReward: 50,
    },
    {
      kind: 'SELL_PHONE',
      title: 'Sıcak Vitrin Satışı',
      description: 'Bugün vitrininden en az 1 cihazı alıcıyla el sıkışarak sat.',
      target: 1,
      reward: 1350 + day * 200,
      xpReward: 45,
    },
    {
      kind: 'SELL_ACCESSORY',
      title: 'Aksesuar Reyon Hareketi',
      description: 'Tezgahta, telefon yanında çapraz satışta veya gün sonunda toplam 3 aksesuar sat.',
      target: 3,
      reward: 1100 + day * 160,
      xpReward: 42,
    },
    {
      kind: 'SERVE_TEA',
      title: 'Pasaj Misafirperverliği',
      description: '2 müşteriye ince belli bardakta çay ikram ederek pazarlığı yumuşat.',
      target: 2,
      reward: 1000 + day * 140,
      xpReward: 35,
    },
    {
      kind: 'BUY_BARGAIN',
      title: 'Kelepir Avcısı',
      description: '1 cihazı gerçek piyasa değerinin altında kapatarak kâr marjı aç.',
      target: 1,
      reward: 1600 + day * 200,
      xpReward: 55,
    },
  ];

  if (upgrades.includes('repair_bench') || day >= 2) {
    pool.push({
      kind: 'REPAIR_PHONE',
      title: 'Mikro Tamir Mesaisi',
      description: 'Atölye tezgahında veya acil serviste en az 1 cihaz arızasını onar.',
      target: 1,
      reward: 1800 + day * 220,
      xpReward: 60,
    });
  }

  if (day >= 2) {
    pool.push({
      kind: 'SELL_BRAND_NEW',
      title: 'Sıfır Kutu Satışı',
      description: 'Toptancıdan getirdiğin 1 adet Sıfır Kapalı Kutu telefonu müşteriye sat.',
      target: 1,
      reward: 2100 + day * 250,
      xpReward: 70,
    });
  }

  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 3);
  return shuffled.map((q) => ({
    ...q,
    id: makeId('quest'),
    progress: 0,
    claimed: false,
  }));
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
  return tierPrestige + decorPrestige + branchPrestige + museumPrestige;
}

export function getShowcaseCapacity(shopTier: ShopTier, upgrades: UpgradeId[]): number {
  const base = SHOP_TIERS[shopTier].showcaseSlots;
  return base + (upgrades.includes('display_cabinet') ? 2 : 0);
}

export function getDailyRent(day: number, shopTier: ShopTier): number {
  const tierBase = SHOP_TIERS[shopTier].baseRent;
  return tierBase + Math.min(day - 1, 10) * 140;
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
  if (shopLevel >= 3) {
    mult *= 0.9;
  }
  if (legacyPath === 'EX_APPRENTICE') {
    mult *= 0.8; // Eski Çırak permanent -20% repair mastery discount
  }
  if (dailyNews?.repairDiscount) {
    mult *= 1 - dailyNews.repairDiscount;
  }
  return Math.max(200, Math.round((base * mult) / 50) * 50);
}

export function calculateMarketValue(
  device: PhoneDevice,
  onlyInspected = false,
  dailyNews?: DailyMarketEvent
): number {
  let penalty = 0;
  for (const defectId of device.defects) {
    const def = DEFECT_CATALOG[defectId];
    if (!onlyInspected || device.inspected[def.category]) {
      penalty += def.valuePenaltyRatio;
    }
  }
  const cappedPenalty = Math.min(0.68, penalty);
  let val = device.baseValue * (1 - cappedPenalty);

  if (device.isBrandNew) {
    // Factory-sealed 24-month TR official warranty retail value
    val *= 1.18;
  } else if (device.defects.length === 0 && device.hasBoxAndCharger) {
    val *= 1.08;
  } else if (device.defects.length === 0) {
    val *= 1.03;
  }

  if (device.masterCrafted) {
    val *= 1.12;
  }

  if (device.customMod && CUSTOM_MODS[device.customMod]) {
    val *= 1 + CUSTOM_MODS[device.customMod].valueBoostRatio;
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

  return roundPrice(Math.max(1500, val));
}

export interface ConditionInfo {
  label: 'Hurda' | 'Hasarlı' | 'İdare Eder' | 'Temiz' | 'Sıfır Ayarında' | 'Sıfır · Kapalı Kutu';
  score: number;
  tone: 'danger' | 'warning' | 'neutral' | 'positive';
}

export function getConditionInfo(device: PhoneDevice): ConditionInfo {
  if (device.isBrandNew && device.defects.length === 0) {
    return { label: 'Sıfır · Kapalı Kutu', score: 100, tone: 'positive' };
  }
  const totalPenalty = device.defects.reduce(
    (sum, d) => sum + DEFECT_CATALOG[d].valuePenaltyRatio,
    0
  );
  const score = Math.max(15, Math.min(100, Math.round((1 - totalPenalty) * 100)));

  if (device.defects.length === 0 && device.hasBoxAndCharger) {
    return { label: 'Sıfır Ayarında', score: 98, tone: 'positive' };
  }
  if (device.defects.length === 0) {
    return { label: 'Temiz', score: 90, tone: 'positive' };
  }
  if (score >= 76) {
    return { label: 'İdare Eder', score, tone: 'neutral' };
  }
  if (score >= 54) {
    return { label: 'Hasarlı', score, tone: 'warning' };
  }
  return { label: 'Hurda', score, tone: 'danger' };
}

export function getDiscoveredDefects(device: PhoneDevice): DefectId[] {
  return device.defects.filter((d) => device.inspected[DEFECT_CATALOG[d].category]);
}

export function getPatienceLabel(patience: number): {
  text: string;
  tone: 'positive' | 'warning' | 'danger';
} {
  if (patience >= 65) return { text: 'Rahat', tone: 'positive' };
  if (patience >= 35) return { text: 'Tereddütlü', tone: 'warning' };
  if (patience > 0) return { text: 'Kalkmak Üzere', tone: 'danger' };
  return { text: 'Masadan Kalktı', tone: 'danger' };
}

export function getListingDemand(
  device: PhoneDevice,
  dailyNews?: DailyMarketEvent
): {
  label: string;
  tone: 'positive' | 'warning' | 'danger';
  hint: string;
} {
  const fair = calculateMarketValue(device, false, dailyNews);
  const ratio = device.askingPrice / fair;
  if (ratio <= 1.04) {
    return {
      label: 'Hızlı Satış',
      tone: 'positive',
      hint: 'Müşteriler kapışır, etikete yakın fiyattan kolay el sıkışır.',
    };
  }
  if (ratio <= 1.2) {
    return {
      label: 'İdeal Kâr',
      tone: 'warning',
      hint: 'Tatlı bir esnaf kârı, dengeli indirim pazarlığı yapılır.',
    };
  }
  return {
    label: 'Yüksek Etiket',
    tone: 'danger',
    hint: 'Alıcılar fiyatı pahalı bulup sert indirim isteyebilir.',
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
    (hasNeon || state.shopTier === 3) && Math.random() < 0.35
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
    const categories: InspectionCategory[] = ['screen', 'battery', 'imei', 'hardware'];
    const autoCat = pick(categories);
    device.inspected[autoCat] = true;
    const catNames: Record<InspectionCategory, string> = {
      screen: 'Ekran & Kasa',
      battery: 'Pil & Devir',
      imei: 'IMEI Sorgu',
      hardware: 'Sıvı & Sensör',
    };
    apprenticeNote = `Çırak Emre hızlıca ${catNames[autoCat]} testini önceden yaptı.`;
  }

  const realValue = calculateMarketValue(device, false, state.dailyNews);
  const perceivedValue =
    realValue + (device.baseValue - realValue) * (archetypeId === 'hustler' ? 0.72 : 0.45);
  const initialAsk = roundPrice(
    perceivedValue * (0.98 + arch.markupTendency * (0.65 + Math.random() * 0.5))
  );

  const minRatio = archetypeId === 'student' ? 0.62 : archetypeId === 'hustler' ? 0.66 : 0.7;
  const secretLimit = roundPrice(
    Math.min(initialAsk * 0.85, Math.max(1200, realValue * (minRatio + Math.random() * 0.12)))
  );

  const customerName = pick(arch.names);
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
      ? 52
      : archetypeId === 'hustler'
      ? 56
      : archetypeId === 'student'
      ? 66
      : 60;
  const startingMoodScore = Math.min(
    90,
    baseMood + (state.legacyPath === 'SOCIAL_HUSTLER' ? 10 : 0)
  );

  return {
    id: makeId('enc'),
    type: 'SELLER',
    archetypeId,
    customerName,
    customerTitle: arch.title,
    portraitPath: arch.portraitPath,
    device,
    customerPrice: initialAsk,
    initialCustomerPrice: initialAsk,
    secretLimit,
    patience: arch.startingPatience,
    maxPatience: 100,
    moodScore: startingMoodScore,
    mood: deriveMoodFromScore(startingMoodScore),
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

  const vipChance =
    (state.shopTier === 3 ? 0.35 : state.shopTier === 2 ? 0.2 : 0.08) +
    (prestige >= 60 ? 0.15 : 0) +
    (targetDevice.masterCrafted || targetDevice.isBrandNew ? 0.16 : 0) +
    (hasNeon ? 0.1 : 0) +
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

  const realValue = calculateMarketValue(targetDevice, false, state.dailyNews);
  const reputationBoost = 1 + (state.reputation - 2.5) * 0.045;
  const prestigeBoost = 1 + Math.min(0.18, prestige * 0.0012);
  const newsBudgetBoost = state.dailyNews.buyerBudgetMultiplier ?? 1;
  const levelPersuasionBoost =
    (state.level >= 2 ? 1.05 : 1) * (state.level >= 9 ? 1.06 : 1);
  const salesRepLvl = state.staff.includes('sales_rep')
    ? state.staffLevels?.sales_rep ?? 1
    : 0;
  const salesRepBoost =
    salesRepLvl >= 3 ? 1.13 : salesRepLvl === 2 ? 1.1 : salesRepLvl === 1 ? 1.06 : 1;

  // Check if a happy past customer returns as a Regular (Müdavim)
  const happyPast = (state.soldHistory ?? []).filter((r) => r.wasHappy);
  const returningRecord =
    happyPast.length > 0 && Math.random() < 0.34 ? pick(happyPast) : null;
  const isRegular = Boolean(returningRecord);
  const regularBoost = isRegular ? 1.1 : 1;

  const finalArchId = returningRecord ? returningRecord.archetypeId : archetypeId;
  const finalArch = CUSTOMER_ARCHETYPES[finalArchId];
  const finalName = returningRecord ? returningRecord.customerName : customerName;

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

  // Buyer's max willingness to pay (secretLimit) can reach up to stickerPrice (never forces raising above sticker!)
  const rawWillingness = roundPrice(
    realValue *
      (targetDevice.isBrandNew ? 1.06 + Math.random() * 0.12 : 1.1 + Math.random() * 0.15) *
      reputationBoost *
      prestigeBoost *
      newsBudgetBoost *
      levelPersuasionBoost *
      salesRepBoost *
      regularBoost *
      vipBoost
  );

  // Realistic initial haggle offer: always below stickerPrice (unless already cheap)
  const haggleDiscount = targetDevice.isBrandNew
    ? 0.89 + Math.random() * 0.08
    : 0.78 + Math.random() * 0.12;
  const initialOffer = roundPrice(
    Math.min(
      stickerPrice,
      Math.max(1000, Math.min(rawWillingness * 0.92, stickerPrice * haggleDiscount))
    )
  );
  const cappedSecretLimit = Math.min(
    stickerPrice,
    Math.max(initialOffer, rawWillingness)
  );

  const wantsInstallment = stickerPrice >= 14000 && Math.random() < 0.45;
  const installmentSuffix = wantsInstallment
    ? ' Kredi kartına taksit geçersen bütçemi biraz daha yukarı çekerim!'
    : '';

  const openingLine = returningRecord
    ? `Selam usta, beni tanıdın mı? Geçen senden aldığım ${returningRecord.deviceName} taş gibi çıktı! Şimdi bu ${targetDevice.brand} ${targetDevice.model} için geldim, etiket ${formatTRY(stickerPrice)} ama müdavim indirimiyle ${formatTRY(initialOffer)} yapalım!${installmentSuffix}`
    : targetDevice.isBrandNew
    ? `Merhaba usta! Vitrindeki sıfır kapalı kutu ${targetDevice.brand} ${targetDevice.model} dikkatimi çekti. Etiketi ${formatTRY(stickerPrice)} ama ${formatTRY(initialOffer)} yaparsan hemen alırım!${installmentSuffix}`
    : `${pick(BUYER_OPENING_LINES[finalArchId])} Etiketin ${formatTRY(stickerPrice)}, ben ${formatTRY(initialOffer)} verebilirim.${installmentSuffix}`;

  const baseBuyerMood =
    finalArchId === 'uncle'
      ? 54
      : finalArchId === 'vip'
      ? 62
      : targetDevice.isBrandNew
      ? 72
      : 64;
  const startingMoodScore = Math.min(
    96,
    baseBuyerMood +
      (state.legacyPath === 'SOCIAL_HUSTLER' ? 10 : 0) +
      (isRegular ? 14 : 0)
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
    patience: finalArch.startingPatience + (isRegular ? 10 : 0),
    maxPatience: 100,
    moodScore: startingMoodScore,
    mood: deriveMoodFromScore(startingMoodScore),
    usedLeverageDefects: [],
    teaServed: false,
    bluffUsed: false,
    honestPitchUsed: false,
    legacyDialogueUsed: false,
    finalWarningGiven: false,
    rounds: 0,
    outcome: 'ACTIVE',
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

  // Pick a lower-value trade-in phone so the customer pays cash on top!
  const cheaperSpecs = PHONE_CATALOG.filter(
    (s) => s.releaseDay <= state.day && s.baseValue < targetDevice.baseValue * 0.85
  );
  const tradeSpec =
    cheaperSpecs.length > 0 ? pick(cheaperSpecs) : PHONE_CATALOG[0];
  const apprenticeLvl = state.staff.includes('apprentice')
    ? state.staffLevels?.apprentice ?? 1
    : 0;
  const tradeInDevice = generatePhoneDevice(
    tradeSpec,
    finalArchId,
    state.day,
    apprenticeLvl
  );

  const stickerPrice =
    targetDevice.askingPrice > 0
      ? targetDevice.askingPrice
      : roundPrice(calculateMarketValue(targetDevice, false, state.dailyNews) * 1.15);
  const tradeFairVal = calculateMarketValue(tradeInDevice, false, state.dailyNews);
  const fairCashDiff = Math.max(1500, roundPrice(stickerPrice - tradeFairVal * 0.78));

  const initialCashOffer = roundPrice(Math.max(1000, fairCashDiff * (0.72 + Math.random() * 0.14)));
  const maxCashLimit = roundPrice(
    Math.min(stickerPrice - 500, Math.max(initialCashOffer + 750, fairCashDiff * 1.12))
  );
  const wantsInstallment = maxCashLimit >= 6000 && Math.random() < 0.35;

  const startingMoodScore = Math.min(
    94,
    62 + (state.legacyPath === 'SOCIAL_HUSTLER' ? 10 : 0) + (returningRecord ? 12 : 0)
  );

  return {
    id: makeId('trade_enc'),
    type: 'TRADE_IN',
    archetypeId: finalArchId,
    customerName,
    customerTitle: `${finalArch.title} · Takas (Trade-In)`,
    portraitPath: finalArch.portraitPath,
    device: { ...targetDevice, askingPrice: stickerPrice },
    tradeInDevice,
    isRegular: Boolean(returningRecord),
    regularNote: returningRecord ? pick(REGULAR_GREETING_NOTES) : undefined,
    wantsInstallment,
    posAccepted: false,
    customerPrice: initialCashOffer,
    initialCustomerPrice: initialCashOffer,
    secretLimit: maxCashLimit,
    patience: finalArch.startingPatience,
    maxPatience: 100,
    moodScore: startingMoodScore,
    mood: deriveMoodFromScore(startingMoodScore),
    usedLeverageDefects: [],
    teaServed: false,
    bluffUsed: false,
    honestPitchUsed: false,
    legacyDialogueUsed: false,
    finalWarningGiven: false,
    rounds: 0,
    outcome: 'ACTIVE',
    messages: [
      {
        id: makeId('msg'),
        speaker: 'customer',
        text: `${pick(TRADE_IN_OPENING_LINES[finalArchId])} Elimdeki ${tradeInDevice.brand} ${tradeInDevice.model} cihazı verip üstüne ${formatTRY(initialCashOffer)} nakit fark ödeyeyim, vitrindeki ${targetDevice.brand} ${targetDevice.model} benim olsun!`,
        tone: 'neutral',
      },
    ],
  };
}

export function createWarrantyClaimEncounter(
  state: ShopState
): CustomerEncounter | null {
  const candidates = (state.soldHistory ?? []).filter(
    (r) => !r.warrantyResolved && state.day - r.daySold >= 1
  );
  if (candidates.length === 0) return null;

  const faultyFirst = candidates.filter((r) => r.hadDefects);
  const record =
    faultyFirst.length > 0
      ? faultyFirst[0]
      : Math.random() < 0.35
      ? pick(candidates)
      : null;
  if (!record) return null;

  const arch = CUSTOMER_ARCHETYPES[record.archetypeId];
  const dummyDevice = generateBrandNewPhone(PHONE_CATALOG[0], 0);
  const repairCost = roundPrice(Math.max(850, Math.min(2600, record.salePrice * 0.1)));
  const refundCost = roundPrice(Math.max(1200, Math.min(3500, record.salePrice * 0.14)));

  return {
    id: makeId('war_enc'),
    type: 'WARRANTY_CLAIM',
    archetypeId: record.archetypeId,
    customerName: record.customerName,
    customerTitle: `${arch.title} · Garanti & İade Talebi`,
    portraitPath: arch.portraitPath,
    device: { ...dummyDevice, brand: '', model: record.deviceName },
    warrantyRecord: record,
    warrantyRepairCost: repairCost,
    warrantyRefundCost: refundCost,
    customerPrice: repairCost,
    initialCustomerPrice: repairCost,
    secretLimit: repairCost,
    patience: 55,
    maxPatience: 100,
    moodScore: 34,
    mood: 'annoyed',
    lastMoodReason: 'Cihazda Arıza Çıktı (-25)',
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
        text: `Usta merhaba! ${record.daySold}. gün senden aldığım ${record.deviceName} cihazında ${record.hadDefects ? 'söylemediğin gizli arıza büyüdü, ekran ve şarj tekliyor!' : 'dün birden şarj soketi ve dokunmatik gitmeye başladı!'} Dükkanına güvenip aldım, nasıl çözeceğiz?`,
        tone: 'warning',
      },
    ],
  };
}

export function createDataRecoveryEncounter(state: ShopState): CustomerEncounter {
  const archetypeId = pick(['student', 'uncle', 'influencer', 'vip'] as CustomerArchetypeId[]);
  const arch = CUSTOMER_ARCHETYPES[archetypeId];
  const job = pick(DATA_RECOVERY_CASES);
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
  const available = Object.values(state.accessories).filter((a) => a.quantity > 0);
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
  const payout = roundPrice(partCost + 1800 + spec.baseValue * 0.06);

  return {
    id: makeId('enc'),
    type: 'EXPRESS_REPAIR',
    archetypeId,
    customerName: pick(arch.names),
    customerTitle: `${arch.title} · Acil Servis`,
    portraitPath: arch.portraitPath,
    device,
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
        text: `Usta acil yardım! ${device.brand} ${device.model} cihazımda "${def.name}" sorunu var. Hemen tamir edersen ${formatTRY(payout)} nakit öderim!`,
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
    calculateMarketValue(d1, false, state.dailyNews) +
    calculateMarketValue(d2, false, state.dailyNews);
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
  const extraByLevel = (state.level >= 6 ? 1 : 0) + (state.level >= 10 ? 1 : 0);
  const queueSize = SHOP_TIERS[state.shopTier].dailyCustomers + extraByLevel;
  const listedPhones = state.inventory.filter((d) => d.listedForSale);
  const usedBuyerPhoneIds = new Set<string>();
  const queue: CustomerEncounter[] = [];

  const hasRepairBench = state.upgrades.includes('repair_bench');
  const hasAccessoryStock = getTotalAccessoryStock(state.accessories) > 0;
  const specialSlot = state.day >= 2 ? Math.min(queueSize - 1, 2) : -1;
  const accessorySlot = hasAccessoryStock ? Math.min(queueSize - 1, 3) : -1;
  let warrantyInjected = false;
  let tradeInInjected = false;

  for (let i = 0; i < queueSize; i++) {
    // Inject a realistic Warranty Claim if a previous buyer had an issue
    if (i === 1 && !warrantyInjected && state.day >= 2) {
      const warEnc = createWarrantyClaimEncounter(state);
      if (warEnc) {
        warrantyInjected = true;
        queue.push(warEnc);
        continue;
      }
    }

    if (i === accessorySlot && hasAccessoryStock) {
      const accEnc = createAccessoryBuyerEncounter(state);
      if (accEnc) {
        queue.push(accEnc);
        continue;
      }
    }

    if (i === specialSlot) {
      const roll = Math.random();
      if (hasRepairBench && roll < 0.4) {
        queue.push(createExpressRepairEncounter(state));
        continue;
      } else if (roll < 0.72) {
        queue.push(createDataRecoveryEncounter(state));
        continue;
      } else if (state.cash >= 7000) {
        queue.push(createBulkAuctionEncounter(state));
        continue;
      }
    }

    const availableListed = listedPhones.filter((p) => !usedBuyerPhoneIds.has(p.uid));
    const shouldBeBuyer =
      availableListed.length > 0 &&
      (i % 2 === 1 || (availableListed.length >= 2 && Math.random() < 0.6));

    if (shouldBeBuyer) {
      const target = pick(availableListed);
      usedBuyerPhoneIds.add(target.uid);
      // 38% chance a buyer wants a Trade-In (Takas) if not yet injected today!
      if (!tradeInInjected && target.baseValue >= 9500 && Math.random() < 0.38) {
        tradeInInjected = true;
        queue.push(createTradeInEncounter(state, target));
      } else {
        queue.push(createBuyerEncounter(state, target));
      }
    } else {
      queue.push(createSellerEncounter(state));
    }
  }

  return queue;
}

// === DAILY EMPIRE GENERATORS: ONLINE CLASSIFIEDS, SHIPPING ORDERS, CUSTOMS AUCTION ===

const CLASSIFIED_DISTRICTS = ['Kadıköy', 'Bakırköy', 'Şişli', 'Üsküdar', 'Beşiktaş', 'Bornova', 'Çankaya'];
const CLASSIFIED_SELLERS = ['Mert K.', 'Ayşe T.', 'Burak S.', 'Ömer D.', 'Gizem Y.', 'Hakan B.', 'Tuğçe A.'];
const SHIPPING_CITIES = ['İzmir', 'Ankara', 'Antalya', 'Bursa', 'Trabzon', 'Eskişehir', 'Adana'];

export function generateOnlineClassifieds(state: ShopState): OnlineClassifiedListing[] {
  const listings: OnlineClassifiedListing[] = [];
  const count = 4;
  for (let i = 0; i < count; i++) {
    const spec = pickPhoneSpecForDay(
      state.day,
      Math.max(18000, state.cash * 1.1),
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
    const fairVal = calculateMarketValue(device, false, state.dailyNews);
    const askingPrice = roundPrice(
      Math.max(
        2000,
        isBargain
          ? fairVal * (0.76 + Math.random() * 0.1)
          : isTrap
          ? fairVal * (1.06 + Math.random() * 0.12)
          : fairVal * (0.88 + Math.random() * 0.1)
      )
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
        ? 'Acil nakit ihtiyacından piyasa altına bırakıyorum, ilk gelen alır!'
        : isTrap
        ? 'Kutusu yok, ufak tefek detayları olabilir ama çalışıyor.'
        : 'Kılıfla kullanıldı, elden veya kargoyla hemen teslim.',
      askingPrice,
      device,
      riskTag,
      bought: false,
    });
  }
  return listings;
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

export function generateDailyAuctionLot(state: ShopState): CustomsAuctionLot {
  const deviceCount = state.shopTier >= 2 ? 3 : 2;
  const devices: PhoneDevice[] = [];
  let totalMarket = 0;

  for (let i = 0; i < deviceCount; i++) {
    const spec = pickPhoneSpecForDay(
      state.day,
      Math.max(16000, state.cash * 0.9),
      state.shopTier,
      i === 0 ? 'vip' : 'hustler',
      false
    );
    const dev = generatePhoneDevice(spec, 'hustler', state.day, 0);
    devices.push(dev);
    totalMarket += calculateMarketValue(dev, false, state.dailyNews);
  }

  const bonusAccessories: { id: AccessoryId; quantity: number }[] = [
    { id: 'tempered_glass', quantity: 4 },
    { id: 'magsafe_case', quantity: 2 },
  ];

  const startingBid = roundPrice(Math.max(4000, totalMarket * 0.52));

  return {
    id: makeId('auc_lot'),
    lotTitle: `Gümrük Palet #${100 + state.day * 7} (${deviceCount} Cihaz + Aksesuar Kolisi)`,
    description: `Mühürlü gümrük ve icra kolisi! İçerisinde ${devices.map((d) => `${d.brand} ${d.model}`).join(', ')} ve 6 parça aksesuar bulunuyor. Kusurları koli açılınca belli olur!`,
    startingBid,
    devices,
    bonusAccessories,
    resolved: false,
    wonByPlayer: false,
    winningBid: startingBid,
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
  loanPayments: number;
  updatedLoans: ActiveLoan[];
  newWeeklyTaxDue: number;
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

  let loanPayments = 0;
  const updatedLoans: ActiveLoan[] = [];
  for (const loan of state.activeLoans ?? []) {
    const pay = Math.min(loan.remainingBalance, loan.dailyPayment);
    loanPayments += pay;
    const rem = loan.remainingBalance - pay;
    const daysLeft = Math.max(0, loan.daysLeft - 1);
    if (rem > 0 && daysLeft > 0) {
      updatedLoans.push({ ...loan, remainingBalance: rem, daysLeft });
    }
  }

  const nextDay = state.day + 1;
  const taxAdd =
    nextDay % 7 === 0
      ? 1800 + state.shopTier * 1200 + (state.branches?.length ?? 0) * 1400
      : 0;
  const newWeeklyTaxDue = (state.weeklyTaxDue ?? 0) + taxAdd;

  const salesRepLvl = state.staff.includes('sales_rep')
    ? state.staffLevels?.sales_rep ?? 1
    : 0;
  const rivalShareDrift = state.rival.boughtOut
    ? 0
    : salesRepLvl >= 2
    ? -3
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
    loanPayments,
    updatedLoans,
    newWeeklyTaxDue,
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

  const trafficMultiplier =
    (state.shopTier === 3 ? 2.0 : state.shopTier === 2 ? 1.45 : 1.0) *
    (state.upgrades.includes('neon_sign') ? 1.25 : 1.0) *
    (state.staff.includes('apprentice') ? 1.2 : 1.0) *
    (state.level >= 4 ? 1.25 : 1.0);

  for (const spec of ACCESSORY_CATALOG) {
    const stock = updated[spec.id];
    if (!stock || stock.quantity <= 0) continue;

    // Price sensitivity: cheaper than recommended sells faster; overpriced slows down
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
        ? `Gün boyunca reyon vitrininden ${unitsSold} aksesuar satıldı (+${formatTRY(revenue)}).`
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
    (stats.taxPaid ?? 0);
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
    inventory: [starterPhone],
    accessories: createInitialAccessories(),
    upgrades: [],
    decorations: [],
    activeDecorations: [],
    staff: [],
    staffLevels: { apprentice: 1, master_tech: 1, sales_rep: 1 },
    branches: [],
    museumItems: [],
    activeLoans: [],
    distributorLoyalty: {},
    rival: {
      name: 'Kurnaz Kerim',
      shopName: 'Kerim GSM Köşe',
      marketShare: 62,
      buyoutCost: 48000,
      boughtOut: false,
      lastTaunt: 'Kurnaz Kerim: "Hoş geldin genç esnaf! 23 yaşında bu pasajda tutunmak kolay değil, görelim bakalım!"',
      promoUsedToday: false,
    },
    soldHistory: [],
    onlineListings: [],
    shippingOrders: [],
    dailyAuctionLot: null,
    weeklyTaxDue: 0,
    loginStreak: 1,
    lastLoginDateStr: getTodayDateString(),
    dailyStreakClaimed: false,
    lastSavedAt: Date.now(),
    dailyNews: day1News,
    dailyWholesaleDiscountBrand: pickDailyWholesaleDiscountBrand(1),
    dailyQuests: generateDailyQuests(1, []),
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
    storyIntroSeen: false,
    endlessMode: false,
  };

  baseState.dailyQueue = generateDailyQueue(baseState);
  baseState.onlineListings = generateOnlineClassifieds(baseState);
  baseState.shippingOrders = generateShippingOrders(baseState);
  baseState.dailyAuctionLot = generateDailyAuctionLot(baseState);
  return baseState;
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

  const inspectedCount = Object.values(encounter.device.inspected).filter(Boolean).length;

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
    // Rushed pace: aggressive offers feel rude, generous offers feel snappy
    const feelsAggressive =
      encounter.type === 'SELLER'
        ? playerOffer < encounter.customerPrice * 0.85
        : playerOffer > encounter.customerPrice * 1.06;
    if (feelsAggressive) {
      moodDelta -= 7;
      pacePatiencePenalty += 4;
      reasonParts.push('Aceleci Kırma (-7)');
    } else {
      moodDelta += 3;
      reasonParts.push('Hızlı Esnaf (+3)');
    }
  }

  if (tone === 'friendly') {
    moodDelta += legacyPath === 'SOCIAL_HUSTLER' ? 8 : 6;
    reasonParts.push(
      legacyPath === 'SOCIAL_HUSTLER' ? 'Samimi Üslup (+8)' : 'Samimi Üslup (+6)'
    );
  } else if (tone === 'analytical') {
    const hasEvidence =
      inspectedCount >= 2 || encounter.device.isBrandNew || encounter.device.defects.length === 0;
    const bonus = hasEvidence ? 5 : 1;
    moodDelta += bonus;
    reasonParts.push(hasEvidence ? 'Analitik Veri (+5)' : 'Analitik (+1)');
  } else {
    // Firm tone: drops mood more on Uncle & VIP
    const firmPenalty =
      encounter.archetypeId === 'uncle' || encounter.archetypeId === 'vip' ? -11 : -7;
    moodDelta += firmPenalty;
    reasonParts.push(`Sert Üslup (${firmPenalty})`);
  }

  const clampMood = (val: number) => Math.max(0, Math.min(100, Math.round(val)));

  if (encounter.type === 'SELLER') {
    // Direct acceptance of seller's exact asking price always succeeds immediately
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

    const underLimitRatio = Math.max(
      0,
      (encounter.secretLimit - playerOffer) / Math.max(1, encounter.secretLimit)
    );
    const offerMoodShift =
      playerOffer >= encounter.secretLimit
        ? 6
        : underLimitRatio > 0.22
        ? -14
        : underLimitRatio > 0.1
        ? -6
        : -2;

    const nextMoodScore = clampMood(encounter.moodScore + moodDelta + offerMoodShift);
    const nextMood = deriveMoodFromScore(nextMoodScore);
    const moodReason = reasonParts.join(' · ');

    // Effective limit flexes slightly with high mood or analytical/firm leverage
    const moodFlex = nextMoodScore >= 75 ? 0.97 : nextMoodScore <= 28 ? 1.04 : 1.0;
    const effectiveLimit = roundPrice(encounter.secretLimit * moodFlex);

    const playerLine =
      tone === 'friendly'
        ? `Kardeşim cihaz güzel ama gel şu işi ${formatTRY(playerOffer)} nakit bağlayalım, ikimizin de yüzü gülsün.`
        : tone === 'analytical'
        ? `Test verileri ve güncel piyasa ortalaması ortada: bu cihaza nakit ${formatTRY(playerOffer)} yazabiliyorum.`
        : `Net konuşayım, kasadan çıkacak rakam ${formatTRY(playerOffer)}. İşine geliyorsa hemen sayayım.`;

    // REALISTIC MULTI-ROUND RULE:
    // On Round 1, even if offer >= effectiveLimit, sellers counter-offer closer instead of caving instantly!
    const isNearlyAsking = playerOffer >= encounter.customerPrice * 0.96;
    const canCloseThisRound =
      playerOffer >= effectiveLimit &&
      (isNearlyAsking ||
        nextRounds >= 3 ||
        (nextRounds >= 2 && (nextMoodScore >= 52 || playerOffer >= encounter.customerPrice * 0.91)));

    if (canCloseThisRound) {
      const closedMood = clampMood(nextMoodScore + 14);
      const msg = pick(DEAL_ACCEPTED_LINES.SELLER);
      return {
        updatedEncounter: {
          ...encounter,
          rounds: nextRounds,
          outcome: 'DEAL_CLOSED',
          finalPrice: playerOffer,
          moodScore: closedMood,
          mood: deriveMoodFromScore(closedMood),
          negotiationPace: pace,
          lastToneUsed: tone,
          lastMoodReason: `${moodReason} · El Sıkışıldı!`,
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

    // Patience drain modulated by tone, pace, and fairness
    const tonePatienceMult =
      tone === 'friendly' ? 0.78 : tone === 'analytical' ? 0.9 : 1.24;
    const rawLoss =
      (11 + underLimitRatio * (46 + (1 - arch.bluffTolerance) * 26)) * tonePatienceMult +
      pacePatiencePenalty;
    const patienceLoss = Math.max(
      6,
      Math.round(playerOffer >= effectiveLimit ? rawLoss * 0.45 : rawLoss)
    );
    const nextPatience = Math.max(0, encounter.patience - patienceLoss);

    if (nextPatience <= 0 || nextMoodScore <= 5) {
      return {
        updatedEncounter: {
          ...encounter,
          rounds: nextRounds,
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

    // Calculate realistic counter-offer concession based on mood & tone
    const concessionFactor =
      (tone === 'firm' ? 0.56 : tone === 'analytical' ? 0.52 : 0.44) *
      (nextMoodScore >= 68 ? 1.15 : nextMoodScore <= 30 ? 0.72 : 1.0);
    const targetFloor = Math.max(effectiveLimit, playerOffer + 250);
    const dropStep = Math.max(
      250,
      (encounter.customerPrice - targetFloor) * concessionFactor
    );
    const nextAsk = roundPrice(
      Math.max(effectiveLimit, Math.min(encounter.customerPrice - 250, encounter.customerPrice - dropStep))
    );

    const isAtFinalFloor = nextAsk <= effectiveLimit * 1.03 && nextRounds >= 2;
    let reaction: string;
    if (playerOffer >= effectiveLimit && nextRounds === 1) {
      reaction = `İlk teklifin fena değil usta ama hemen el sıkışmayalım! Gel ortada ${formatTRY(nextAsk)} olsun, ikimiz de mutlu olalım.`;
    } else if (pace === 'slow') {
      reaction = `Abi biraz hızlanalım vaktim dar... Son ${formatTRY(nextAsk)} diyorum, ne diyorsun?`;
    } else if (pace === 'rushed' && underLimitRatio > 0.16) {
      reaction = `Dur be usta nefes almadan fiyat kırdın! En fazla ${formatTRY(nextAsk)} seviyesine inerim.`;
    } else if (isAtFinalFloor) {
      reaction = `Bak usta son sözüm ${formatTRY(nextAsk)}! Bir kuruş daha inmem, ya el sıkışalım ya helalleşelim.`;
    } else if (underLimitRatio > 0.22) {
      reaction = `Aman usta öldürdün cihazı! ${formatTRY(nextAsk)} aşağısı beni hiç kurtarmaz.`;
    } else {
      reaction = `Biraz daha yukarı çık be abi, ${formatTRY(nextAsk)} yapalım orta yolu bulalım.`;
    }

    return {
      updatedEncounter: {
        ...encounter,
        rounds: nextRounds,
        patience: nextPatience,
        customerPrice: nextAsk,
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
              isAtFinalFloor || underLimitRatio > 0.22
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
    // BUYER: Player NEVER raises above their own showcase askingPrice!
    const clampedOffer = Math.min(encounter.device.askingPrice, playerOffer);
    const isHoldingSticker = clampedOffer >= encounter.device.askingPrice;

    // Accepting buyer's exact offer closes immediately
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
    const offerMoodShift =
      clampedOffer <= encounter.secretLimit
        ? 6
        : isHoldingSticker && overLimitRatio > 0.1
        ? -11
        : overLimitRatio > 0.15
        ? -12
        : -4;

    const nextMoodScore = clampMood(encounter.moodScore + moodDelta + offerMoodShift);
    const nextMood = deriveMoodFromScore(nextMoodScore);
    const moodReason = reasonParts.join(' · ');

    // Mood stretches buyer's hidden max slightly (up to stickerPrice)
    const moodStretch = nextMoodScore >= 75 ? 1.03 : nextMoodScore <= 28 ? 0.96 : 1.0;
    const effectiveLimit = Math.min(
      encounter.device.askingPrice,
      roundPrice(encounter.secretLimit * moodStretch)
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

    // REALISTIC MULTI-ROUND RULE FOR BUYER:
    // On Round 1, unless player offered nearly buyer's initial bid, buyer always counters once first!
    const isNearlyBuyerBid = clampedOffer <= encounter.customerPrice * 1.03;
    const canCloseThisRound =
      clampedOffer <= effectiveLimit &&
      (isNearlyBuyerBid ||
        nextRounds >= 3 ||
        (nextRounds >= 2 && (nextMoodScore >= 52 || clampedOffer <= encounter.customerPrice * 1.08)));

    if (canCloseThisRound) {
      const closedMood = clampMood(nextMoodScore + 14);
      const msg = pick(DEAL_ACCEPTED_LINES.BUYER);
      return {
        updatedEncounter: {
          ...encounter,
          rounds: nextRounds,
          outcome: 'DEAL_CLOSED',
          finalPrice: clampedOffer,
          moodScore: closedMood,
          mood: deriveMoodFromScore(closedMood),
          negotiationPace: pace,
          lastToneUsed: tone,
          lastMoodReason: `${moodReason} · Satış Bağlandı!`,
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
      tone === 'friendly' ? 0.78 : tone === 'analytical' ? 0.9 : 1.24;
    const rawLoss =
      (11 + overLimitRatio * (48 + (1 - arch.bluffTolerance) * 24)) * tonePatienceMult +
      pacePatiencePenalty;
    const patienceLoss = Math.max(
      6,
      Math.round(clampedOffer <= effectiveLimit ? rawLoss * 0.45 : rawLoss)
    );
    const nextPatience = Math.max(0, encounter.patience - patienceLoss);

    if (nextPatience <= 0 || nextMoodScore <= 5) {
      return {
        updatedEncounter: {
          ...encounter,
          rounds: nextRounds,
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

    const concessionFactor =
      (tone === 'firm' ? 0.56 : tone === 'analytical' ? 0.54 : 0.46) *
      (nextMoodScore >= 68 ? 1.16 : nextMoodScore <= 30 ? 0.72 : 1.0);
    const targetCeiling = Math.min(effectiveLimit, clampedOffer - 250);
    const bumpStep = Math.max(
      250,
      (targetCeiling - encounter.customerPrice) * concessionFactor
    );
    const nextOffer = roundPrice(
      Math.min(
        effectiveLimit,
        Math.max(encounter.customerPrice + 250, encounter.customerPrice + bumpStep)
      )
    );

    const isAtFinalCeiling = nextOffer >= effectiveLimit * 0.97 && nextRounds >= 2;
    let reaction: string;
    if (clampedOffer <= effectiveLimit && nextRounds === 1) {
      reaction = `Fiyat güzel yaklaştı ama pazarlık sünnettir usta! Ben ${formatTRY(nextOffer)} çıkarayım, hemen paketle.`;
    } else if (pace === 'slow') {
      reaction = `Usta biraz seri olalım işim var... Ben ${formatTRY(nextOffer)} verebilirim, oluyor mu?`;
    } else if (isAtFinalCeiling) {
      reaction = `Cebimdeki son kuruş ${formatTRY(nextOffer)} usta! Bundan bir lira yukarı çıkamam, el sıkışalım mı?`;
    } else if (overLimitRatio > 0.16) {
      reaction = `Usta hiç esnemedin ki! Bütçemi zorlayıp ${formatTRY(nextOffer)} yapabiliyorum.`;
    } else {
      reaction = `Hadi biraz daha in be abi... Ben ${formatTRY(nextOffer)} çıkarayım, hemen sar paketi!`;
    }

    return {
      updatedEncounter: {
        ...encounter,
        rounds: nextRounds,
        patience: nextPatience,
        customerPrice: nextOffer,
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
              isAtFinalCeiling || overLimitRatio > 0.16
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
    nextPrice = roundPrice(Math.max(1000, encounter.customerPrice * (1 - soften)));
    nextLimit = roundPrice(
      Math.max(900, encounter.secretLimit * (1 - soften * 0.7))
    );
  } else {
    const cap = encounter.device.askingPrice;
    nextPrice = Math.min(cap, roundPrice(encounter.customerPrice * (1 + soften)));
    nextLimit = Math.min(
      cap,
      roundPrice(encounter.secretLimit * (1 + soften * 0.85))
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

  if (legacyPath === 'EX_APPRENTICE') {
    nextMoodScore = Math.min(100, encounter.moodScore + 12);
    nextPatience = Math.min(100, encounter.patience + 8);
    if (encounter.type === 'SELLER') {
      nextPrice = roundPrice(Math.max(1000, encounter.customerPrice * 0.93));
      nextLimit = roundPrice(Math.max(900, encounter.secretLimit * 0.94));
      playerText =
        'Beş yıl Cemal Usta’nın yanında anakart söktüm kardeşim; bu kasanın iç kondisyonunu ve ileride çıkacak masrafı ezbere biliyorum. Hakkı olan rakama inelim.';
      customerText = `Vay be, gerçekten işin mutfağından geliyorsun usta! Bilgiye saygım var, fiyatı ${formatTRY(nextPrice)} çekiyorum.`;
    } else {
      const cap = encounter.device.askingPrice;
      nextPrice = Math.min(cap, roundPrice(encounter.customerPrice * 1.07));
      nextLimit = Math.min(cap, roundPrice(encounter.secretLimit * 1.07));
      playerText =
        'Beş yıllık atölye tecrübemle bu cihazın her vidasını, batarya döngüsünü ve entegresini kontrol ettim. Arızasız, arkasında durduğum makine bu!';
      customerText = `İşte gerçek teknik usta farkı! Bu kadar emin konuşunca içim rahatladı, ${formatTRY(nextPrice)} çıkarabilirim.`;
    }
  } else if (legacyPath === 'BORN_MERCHANT') {
    nextMoodScore = Math.min(100, encounter.moodScore + 4);
    if (encounter.type === 'SELLER') {
      nextPrice = roundPrice(Math.max(1000, encounter.customerPrice * 0.91));
      nextLimit = roundPrice(Math.max(900, encounter.secretLimit * 0.92));
      playerText =
        'Tahtakale’de sabah toptan listesine baktım, bu serinin nakit dönüş hızı belli. Bekletmeden peşin sayıyorum, ticaret dönsün!';
      customerText = `Piyasayı benden iyi biliyorsun be kardeşim! Peşin nakit hatırına ${formatTRY(nextPrice)} olsun bakalım.`;
    } else {
      const cap = encounter.device.askingPrice;
      nextPrice = Math.min(cap, roundPrice(encounter.customerPrice * 1.08));
      nextLimit = Math.min(cap, roundPrice(encounter.secretLimit * 1.08));
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
      nextPrice = roundPrice(Math.max(1000, encounter.customerPrice * 0.94));
      nextLimit = roundPrice(Math.max(900, encounter.secretLimit * 0.95));
      playerText =
        'Burası senin de dükkanın sayılır, tek seferlik alışveriş yapmıyoruz! Bir dahaki gelişinde de kapımız açık, gel tatlıya bağlayalım.';
      customerText = `Allah razı olsun ne güzel esnafsın! Gönlüm açıldı vallahi, senin için ${formatTRY(nextPrice)} yapıyorum.`;
    } else {
      const cap = encounter.device.askingPrice;
      nextPrice = Math.min(cap, roundPrice(encounter.customerPrice * 1.06));
      nextLimit = Math.min(cap, roundPrice(encounter.secretLimit * 1.07));
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
  const cap = encounter.device.askingPrice;
  const nextPrice = Math.min(cap, roundPrice(encounter.customerPrice * 1.07));
  const nextLimit = Math.min(cap, roundPrice(encounter.secretLimit * 1.08));
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
  defectId: DefectId
): CustomerEncounter {
  if (
    (encounter.type !== 'SELLER' && encounter.type !== 'TRADE_IN') ||
    encounter.outcome !== 'ACTIVE' ||
    encounter.usedLeverageDefects.includes(defectId)
  ) {
    return encounter;
  }

  const def = DEFECT_CATALOG[defectId];
  const nextMoodScore = Math.max(20, encounter.moodScore - 6);

  if (encounter.type === 'TRADE_IN') {
    // Exposing a defect on their trade-in phone RAISES the cash difference they must pay you!
    const cap = encounter.device.askingPrice;
    const nextCashOffer = Math.min(
      cap,
      roundPrice(encounter.customerPrice * (1 + def.leverageDropRatio * 0.9))
    );
    const nextLimit = Math.min(
      cap,
      roundPrice(Math.max(nextCashOffer, encounter.secretLimit * (1 + def.leverageDropRatio * 0.75)))
    );
    return {
      ...encounter,
      customerPrice: nextCashOffer,
      secretLimit: nextLimit,
      usedLeverageDefects: [...encounter.usedLeverageDefects, defectId],
      patience: Math.max(10, encounter.patience - 5),
      moodScore: nextMoodScore,
      mood: deriveMoodFromScore(nextMoodScore),
      lastMoodReason: `Takas Kusuru İspatı: ${def.shortLabel} (-6)`,
      messages: [
        ...encounter.messages,
        { id: makeId('msg'), speaker: 'player', text: `Takasa getirdiğin cihazda sorun var: ${def.leverageLine}` },
        {
          id: makeId('msg'),
          speaker: 'customer',
          text: `${pick(LEVERAGE_REACTIONS[encounter.archetypeId])} Üstüne vereceğim nakit farkı ${formatTRY(nextCashOffer)} yapıyorum.`,
          tone: 'positive',
        },
      ],
    };
  }

  const nextAsk = roundPrice(
    Math.max(1000, encounter.customerPrice * (1 - def.leverageDropRatio))
  );
  const nextLimit = roundPrice(
    Math.max(
      900,
      Math.min(
        nextAsk * 0.9,
        encounter.secretLimit * (1 - def.leverageDropRatio * 0.55)
      )
    )
  );

  return {
    ...encounter,
    customerPrice: nextAsk,
    secretLimit: nextLimit,
    usedLeverageDefects: [...encounter.usedLeverageDefects, defectId],
    patience: Math.max(10, encounter.patience - 6),
    moodScore: nextMoodScore,
    mood: deriveMoodFromScore(nextMoodScore),
    lastMoodReason: `Kusur İspatı: ${def.shortLabel} (-6)`,
    messages: [
      ...encounter.messages,
      { id: makeId('msg'), speaker: 'player', text: def.leverageLine },
      {
        id: makeId('msg'),
        speaker: 'customer',
        text: `${pick(LEVERAGE_REACTIONS[encounter.archetypeId])} Yeni fiyatım ${formatTRY(nextAsk)}.`,
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
      const cap = encounter.device.askingPrice;
      const nextOffer = Math.min(cap, roundPrice(encounter.customerPrice * bonusMult));
      const nextLimit = Math.min(cap, roundPrice(encounter.secretLimit * bonusMult));
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
  legacyPath?: LegacyPathId
): {
  updatedEncounter: CustomerEncounter;
  accepted: boolean;
  retailPrice: number;
  profit: number;
} {
  const spec = getAccessorySpec(accessoryId);
  const wholesaleCost = getAccessoryWholesaleCost(accessoryId, legacyPath);
  const priceRatio = stock.retailPrice / spec.recommendedPrice;
  const baseChance =
    priceRatio <= 1.0 ? 0.78 : priceRatio <= 1.18 ? 0.6 : 0.36;
  const levelBonus = shopLevel >= 4 ? 0.08 : 0;
  const teaBonus = encounter.teaServed ? 0.08 : 0;
  const moodBonus = encounter.moodScore >= 70 ? 0.1 : encounter.moodScore <= 35 ? -0.15 : 0;
  const legacyBonus = legacyPath === 'SOCIAL_HUSTLER' ? 0.18 : 0;
  const accepted =
    Math.random() <
    Math.max(0.15, Math.min(0.96, baseChance + levelBonus + teaBonus + moodBonus + legacyBonus));

  if (accepted) {
    const profit = stock.retailPrice - wholesaleCost;
    const nextMoodScore = Math.min(100, encounter.moodScore + 6);
    return {
      accepted: true,
      retailPrice: stock.retailPrice,
      profit,
      updatedEncounter: {
        ...encounter,
        crossSellAttempted: true,
        crossSellAttached: {
          id: accessoryId,
          name: spec.name,
          retailPrice: stock.retailPrice,
          profit,
        },
        moodScore: nextMoodScore,
        mood: deriveMoodFromScore(nextMoodScore),
        lastMoodReason: 'Aksesuar Kombini Beğenildi (+6)',
        messages: [
          ...encounter.messages,
          {
            id: makeId('msg'),
            speaker: 'player',
            text: `Telefonun yanına hemen bir ${spec.name} (${formatTRY(stock.retailPrice)}) de ekleyelim mi, cihazı korusun?`,
          },
          {
            id: makeId('msg'),
            speaker: 'customer',
            text: `Çok mantıklı abi, yeni cihaza şart! Onu da hesaba ekle, alıyorum!`,
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
          text: 'Yok usta sağ olasın, evde var zaten. Biz sadece telefonu bağlayalım.',
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
  const maxRepairs = techLevel >= 2 ? 2 : 1;
  const costFactor = techLevel >= 3 ? 0.25 : 0.5;
  let runningCash = state.cash;
  let totalCost = 0;
  let fixedCount = 0;
  const notes: string[] = [];
  const nextInv = [...state.inventory];

  for (let i = 0; i < nextInv.length && fixedCount < maxRepairs; i++) {
    const phone = nextInv[i];
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
            costFactor) /
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
          roundPrice(calculateMarketValue(updatedPhone, false, state.dailyNews) * 1.15)
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
    state.shopTier === 3
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
    const shopTier = (parsed.shopTier ?? 1) as ShopTier;
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
    const migratedQuests: DailyQuest[] =
      Array.isArray(parsed.dailyQuests) &&
      parsed.dailyQuests.length > 0 &&
      'description' in parsed.dailyQuests[0]
        ? parsed.dailyQuests
        : generateDailyQuests(day, upgrades);

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
      level: getLevelFromXp(xp),
      legacyPath: parsed.legacyPath ?? 'EX_APPRENTICE',
      dealStreak: parsed.dealStreak ?? 0,
      bestDealStreak: parsed.bestDealStreak ?? 0,
      shopTier,
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
      onlineListings: Array.isArray(parsed.onlineListings) ? parsed.onlineListings : [],
      shippingOrders: Array.isArray(parsed.shippingOrders) ? parsed.shippingOrders : [],
      dailyAuctionLot: parsed.dailyAuctionLot ?? null,
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
            legacyDialogueUsed: enc.legacyDialogueUsed ?? false,
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
      storyIntroSeen: parsed.storyIntroSeen ?? true,
      endlessMode: parsed.endlessMode ?? false,
    };

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
    if (!migrated.dailyAuctionLot) {
      migrated.dailyAuctionLot = generateDailyAuctionLot(migrated);
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
