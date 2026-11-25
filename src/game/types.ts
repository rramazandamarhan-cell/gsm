export type GameScreen =
  | 'TITLE_MENU'
  | 'STORY_INTRO'
  | 'MORNING_NEWS'
  | 'PLAYING'
  | 'PAUSED'
  | 'DAY_SUMMARY'
  | 'VICTORY'
  | 'GAME_OVER';

export type ShopTab =
  | 'COUNTER'
  | 'WORKSHOP'
  | 'WHOLESALE'
  | 'EMPIRE'
  | 'MISSIONS'
  | 'UPGRADES';

export type ShopTier = 1 | 2 | 3 | 4 | 5 | 6;

export type PhoneTier = 'entry' | 'mid' | 'flagship' | 'luxury';

export type InspectionCategory = 'screen' | 'battery' | 'imei' | 'hardware';

export type DefectId =
  | 'screen_crack'
  | 'screen_aftermarket'
  | 'battery_degraded'
  | 'battery_fake_chip'
  | 'imei_unregistered'
  | 'liquid_damage'
  | 'camera_fog'
  | 'cosmetic_worn';

export interface DefectDefinition {
  id: DefectId;
  category: InspectionCategory;
  name: string;
  shortLabel: string;
  description: string;
  valuePenaltyRatio: number;
  repairCost: number;
  repairable: boolean;
  leverageLine: string;
  leverageDropRatio: number;
  /** Backside/internal defects can be repaired together in one teardown session */
  zone: 'front' | 'back';
}

export type CustomModId = 'transparent_back' | 'gold_titanium' | 'rgb_logo';

export interface CustomModSpec {
  id: CustomModId;
  name: string;
  cost: number;
  valueBoostRatio: number;
  description: string;
  badgeText: string;
}

export interface PhoneModelSpec {
  id: string;
  brand: string;
  model: string;
  storage: string;
  tier: PhoneTier;
  baseValue: number;
  bodyColor: string;
  accentColor: string;
  cameraLayout: 'dual' | 'triple' | 'ultra' | 'fold';
  releaseDay: number;
}

export interface PhoneDevice {
  uid: string;
  specId: string;
  brand: string;
  model: string;
  storage: string;
  tier: PhoneTier;
  bodyColor: string;
  accentColor: string;
  cameraLayout: 'dual' | 'triple' | 'ultra' | 'fold';
  baseValue: number;
  batteryHealth: number;
  reportedBatteryHealth: number;
  batteryCycles: number;
  imeiNumber: string;
  imeiStatus: 'TR_REGISTERED' | 'UNREGISTERED_OVERSEAS';
  warrantyMonths: number;
  defects: DefectId[];
  repairedDefects: DefectId[];
  inspected: Record<InspectionCategory, boolean>;
  purchasePrice: number;
  repairSpend: number;
  listedForSale: boolean;
  askingPrice: number;
  hasBoxAndCharger: boolean;
  masterCrafted?: boolean;
  isBrandNew?: boolean;
  customMod?: CustomModId;
  /** Multiple accessories bundled onto this showcase device for extra bundle value */
  bundledAccessories?: AccessoryId[];
  /** True while Hasan Usta is repairing this phone in the timed staff repair queue */
  assignedToStaff?: boolean;
  /** Subtle overlooked defect or micro-scam note revealed after purchasing */
  surpriseNote?: string;
  /** Seller's verbal claim about the phone (can be truthful or a catchable lie!) */
  sellerClaim?: string;
  /** Which inspection category verifies or exposes the seller's verbal claim */
  sellerClaimCategory?: InspectionCategory;
  /** In-game day this phone entered the shop inventory (used for stock aging depreciation) */
  dayAcquired?: number;
  /** Quality grade of the most recent repair performed on this phone */
  lastRepairQuality?: RepairQuality;
  /** Tracks whether each repaired defect used an OEM stocked part or an emergency service part */
  repairedPartOrigins?: Partial<Record<DefectId, 'OEM_STOCK' | 'SERVICE_PART'>>;
}

export type AccessoryId =
  | 'tempered_glass'
  | 'magsafe_case'
  | 'gan_charger'
  | 'car_mount'
  | 'powerbank'
  | 'tws_earbuds';

export type AccessoryShelfGroup = 'protection' | 'power' | 'audio';

export interface AccessorySpec {
  id: AccessoryId;
  name: string;
  category: string;
  shelfGroup: AccessoryShelfGroup;
  minShopTier: ShopTier;
  minLevel?: number;
  wholesaleCost: number;
  recommendedPrice: number;
  minPrice: number;
  maxPrice: number;
  description: string;
  demandWeight: number;
}

export interface AccessoryStockItem {
  id: AccessoryId;
  quantity: number;
  retailPrice: number;
  totalSold: number;
}

export interface BrandDistributor {
  id: string;
  name: string;
  brands: string[];
  minShopTier: ShopTier;
  minLevel?: number;
  minReputation: number;
  wholesaleRatio: number;
  tagline: string;
  description: string;
}

export interface StoryChapter {
  id: string;
  chapterNumber: number;
  title: string;
  subtitle: string;
  narrative: string;
  mentorNote: string;
  objectiveText: string;
  rewardCash: number;
  rewardXp: number;
  metric:
    | 'totalPhonesSold'
    | 'totalAccessoriesSold'
    | 'totalPhonesRepaired'
    | 'totalBrandNewSold'
    | 'shopTier'
    | 'level';
  target: number;
}

export type CustomerArchetypeId = 'student' | 'uncle' | 'influencer' | 'hustler' | 'vip';

export interface CustomerArchetype {
  id: CustomerArchetypeId;
  title: string;
  names: string[];
  portraitPath: string;
  fallbackColor: string;
  startingPatience: number;
  teaBonusPatience: number;
  teaPriceSoften: number;
  bluffTolerance: number;
  markupTendency: number;
  preferredTiers: PhoneTier[];
  traitSummary: string;
}

export type EncounterType =
  | 'SELLER'
  | 'BUYER'
  | 'TRADE_IN'
  | 'WARRANTY_CLAIM'
  | 'DATA_RECOVERY'
  | 'EXPRESS_REPAIR'
  | 'BULK_AUCTION'
  | 'ACCESSORY_BUYER';

export type EncounterOutcome =
  | 'ACTIVE'
  | 'DEAL_CLOSED'
  | 'WALKED_OUT'
  | 'DISMISSED';

export interface DialogueMessage {
  id: string;
  speaker: 'customer' | 'player' | 'system';
  text: string;
  tone?: 'neutral' | 'positive' | 'warning' | 'danger';
}

export interface AccessoryOrderLine {
  id: AccessoryId;
  quantity: number;
  unitPrice: number;
}

export interface CrossSellAttachment {
  id: AccessoryId;
  name: string;
  retailPrice: number;
  profit: number;
}

export type LegacyPathId = 'EX_APPRENTICE' | 'BORN_MERCHANT' | 'SOCIAL_HUSTLER';

export interface LegacyPathInfo {
  id: LegacyPathId;
  name: string;
  title: string;
  yearsSummary: string;
  tagline: string;
  passiveTitle: string;
  passiveDetail: string;
  dialogueName: string;
  dialoguePreview: string;
  accentColor: 'amber' | 'emerald' | 'sky';
}

export type NegotiationTone = 'friendly' | 'analytical' | 'firm';

export type NegotiationPace = 'rushed' | 'steady' | 'slow';

export type CustomerMood =
  | 'excited'
  | 'happy'
  | 'calm'
  | 'thinking'
  | 'annoyed'
  | 'angry';

export interface CustomerReview {
  id: string;
  day: number;
  customerName: string;
  rating: number;
  comment: string;
  dealType: EncounterType;
}

export type RepairQuality = 'MASTER' | 'STANDARD' | 'ROUGH';

export type RadioStationId = 'OFF' | 'ARABESK' | 'POP90';

export type SparePartId = 'screen' | 'battery' | 'board_kit';

export type PartOriginGrade =
  | 'ORIGINAL_FACTORY'
  | 'OEM_STOCK'
  | 'SERVICE_PART'
  | 'AFTERMARKET';

export interface DevicePartReportRow {
  component: 'screen' | 'battery' | 'board' | 'camera_chassis';
  label: string;
  enLabel: string;
  origin: PartOriginGrade;
  note: string;
  enNote: string;
}

export interface CustomerComplaintRecord {
  id: string;
  soldRecordId: string;
  certificateNo: string;
  dayReported: number;
  daySold: number;
  customerName: string;
  deviceName: string;
  defectId: DefectId;
  faultHeadline: string;
  faultDetail: string;
  customerQuote: string;
  repairQualityAtSale?: RepairQuality;
  wasDisclosed?: boolean;
  wasOverseas?: boolean;
  resolution: 'OPEN' | 'FREE_REPAIR' | 'PARTIAL_REFUND' | 'REJECTED';
  costPaid: number;
  reputationDelta: number;
}

export interface SoldPhoneRecord {
  id: string;
  daySold: number;
  customerName: string;
  archetypeId: CustomerArchetypeId;
  deviceName: string;
  salePrice: number;
  hadDefects: boolean;
  wasHappy: boolean;
  warrantyResolved?: boolean;
  /** Defects that were repaired before selling / during express repair */
  repairedDefects?: DefectId[];
  /** Craftsmanship grade of the repair */
  repairQuality?: RepairQuality;
  /** True if sold device was unregistered overseas IMEI */
  wasOverseas?: boolean;
  /** True if player honestly disclosed repairs & overseas status to buyer */
  wasDisclosed?: boolean;
  /** Scheduled in-game day when customer may return complaining about repair/hidden issue (3-5 days later) */
  comebackDay?: number;
  /** True if this record came from an Express Repair walk-in job */
  isExpressRepair?: boolean;
  /** Official Pasaj GSM Warranty Certificate details */
  certificateNo?: string;
  imeiNumber?: string;
  warrantyDays?: number;
  partBreakdown?: DevicePartReportRow[];
  craftsmanNote?: string;
  warrantyPresented?: boolean;
}

export type PlaystyleType =
  | 'REPAIR_MASTER'
  | 'TRADER_SHARK'
  | 'DETECTIVE'
  | 'BALANCED';

export type PrestigePerkId =
  | 'golden_pliers'
  | 'silver_tongue'
  | 'seed_capital'
  | 'vip_network';

export interface CustomerFaultReport {
  headline: string;
  symptomText: string;
  honesty: 'HONEST' | 'PARTIAL' | 'HIDING';
  mentionedDefectId?: DefectId;
}

export interface DataRecoveryJob {
  title: string;
  story: string;
  softwareCost: number;
  softwarePayout: number;
  softwareSuccessRate: number;
  cleanRoomCost: number;
  cleanRoomPayout: number;
}

export interface CustomerEncounter {
  id: string;
  type: EncounterType;
  archetypeId: CustomerArchetypeId;
  customerName: string;
  customerTitle: string;
  portraitPath: string;
  device: PhoneDevice;
  /** For TRADE_IN: the old phone the customer brings to swap in */
  tradeInDevice?: PhoneDevice;
  /** Returning regular customer flag */
  isRegular?: boolean;
  regularNote?: string;
  /** Whether a buyer/trade-in wants Credit Card Installment (POS) */
  wantsInstallment?: boolean;
  posAccepted?: boolean;
  /** For WARRANTY_CLAIM: reference to prior sold phone & specific reported defect */
  warrantyRecord?: SoldPhoneRecord;
  warrantyDefectId?: DefectId;
  warrantyFaultDetail?: string;
  warrantyRepairCost?: number;
  warrantyRefundCost?: number;
  /** Customer's verbal/written fault report describing where the issue is */
  customerFaultReport?: CustomerFaultReport;
  /** For DATA_RECOVERY */
  dataRecoveryJob?: DataRecoveryJob;
  customerPrice: number;
  initialCustomerPrice: number;
  /** Most recent offer sent by the player (caps tactics so tea/dialogue never exceeds player ask) */
  lastPlayerOffer?: number;
  secretLimit: number;
  patience: number;
  maxPatience: number;
  moodScore: number;
  mood: CustomerMood;
  /** Heated bargaining intensity (0 to 100) */
  negotiationHeat?: number;
  negotiationPace?: NegotiationPace;
  lastToneUsed?: NegotiationTone;
  lastMoodReason?: string;
  usedLeverageDefects: DefectId[];
  teaServed: boolean;
  bluffUsed: boolean;
  honestPitchUsed: boolean;
  legacyDialogueUsed: boolean;
  finalWarningGiven?: boolean;
  rounds: number;
  outcome: EncounterOutcome;
  finalPrice?: number;
  profitDelta?: number;
  streakBonus?: number;
  messages: DialogueMessage[];
  bundleDevices?: PhoneDevice[];
  expressDefectId?: DefectId;
  expressDefectIds?: DefectId[];
  expressPartCost?: number;
  accessoryOrder?: AccessoryOrderLine[];
  crossSellAttempted?: boolean;
  crossSellAttached?: CrossSellAttachment;
  /** Support pitching & selling multiple accessories on a single phone sale */
  crossSellAttachments?: CrossSellAttachment[];
  crossSellTriedIds?: AccessoryId[];
  /** Minimum negotiation rounds required before customer folds easily */
  requiredRounds?: number;
  /** Alert shown after closing a 2nd-hand purchase if an overlooked flaw or subtle trap appeared */
  postBuySurpriseAlert?: string;
  /** True if player honestly disclosed repaired parts / overseas IMEI to the buyer */
  buyerDisclosed?: boolean;
  /** ID of the SoldPhoneRecord / Garanti Belgesi issued when this deal closed */
  deliveredCertificateId?: string;
}

export type UpgradeId =
  | 'repair_bench'
  | 'tea_samovar'
  | 'accessory_license'
  | 'pro_diagnostic'
  | 'display_cabinet'
  | 'classifieds_license'
  | 'parts_wholesale'
  | 'neon_sign'
  | 'cctv_security'
  | 'auction_license'
  | 'brand_new_license'
  | 'ultrasonic_cleaner'
  | 'laser_backglass'
  | 'espresso_bar'
  | 'smart_pos_zero'
  | 'micro_soldering'
  | 'barcode_automation'
  | 'cloud_crm'
  | 'clean_room_lab'
  | 'vip_concierge';

export interface ShopUpgrade {
  id: UpgradeId;
  name: string;
  cost: number;
  minShopTier?: ShopTier;
  minLevel?: number;
  installDays: number;
  category: 'workshop' | 'sales' | 'automation';
  summary: string;
  benefitText: string;
  highlightTag?: string;
}

export type DecorationId =
  | 'vintage_radio'
  | 'tea_boiler'
  | 'prestige_plaque'
  | 'vintage_sign'
  | 'edison_lights'
  | 'retro_shelf'
  | 'led_showcase'
  | 'tea_corner'
  | 'vip_lounge';

export interface ShopDecoration {
  id: DecorationId;
  name: string;
  cost: number;
  minShopTier?: ShopTier;
  minLevel?: number;
  prestige: number;
  summary: string;
  visualEffectText: string;
}

export type StaffId = 'apprentice' | 'master_tech' | 'sales_rep' | 'accountant';

export interface StaffMember {
  id: StaffId;
  name: string;
  role: string;
  hireCost: number;
  dailyWage: number;
  minShopTier?: ShopTier;
  minLevel?: number;
  maxLevel: number;
  summary: string;
  benefitText: string;
  level2Bonus: string;
  level3Bonus: string;
  highLevelBonus: string;
}

export interface ShopTierInfo {
  tier: ShopTier;
  name: string;
  cost: number;
  minReputation: number;
  minLevel?: number;
  renovationDays: number;
  backdropPath: string;
  showcaseSlots: number;
  dailyCustomers: number;
  baseRent: number;
  prestigeBonus: number;
  description: string;
  unlocksText: string;
}

export interface DailyMarketEvent {
  id: string;
  kicker: string;
  headline: string;
  subheadline: string;
  description: string;
  gossipNote: string;
  effectSummary: string;
  kind: 'launch' | 'boom' | 'drop' | 'discount' | 'calm';
  brandBoost?: string;
  tierBoost?: PhoneTier;
  valueMultiplier?: number;
  buyerBudgetMultiplier?: number;
  trImeiMultiplier?: number;
  overseasImeiMultiplier?: number;
  repairDiscount?: number;
  launchedModels?: string[];
}

export interface FlashWholesaleDeal {
  id: string;
  brand: string;
  discountPct: number;
  initialStock: number;
  remainingStock: number;
  rivalsSnatchedCount: number;
  headline: string;
  subline: string;
  expired: boolean;
}

export type OutfitId =
  | 'casual_hoodie'
  | 'traditional_vest'
  | 'formal_shirt'
  | 'tech_esd_coat'
  | 'italian_blazer'
  | 'boss_suit';

export interface OutfitSpec {
  id: OutfitId;
  name: string;
  subtitle: string;
  cost: number;
  minShopTier?: ShopTier;
  minLevel?: number;
  moodBonus: number;
  patienceBonus: number;
  preferredArchetypes: CustomerArchetypeId[];
  bonusDescription: string;
  accentColor: string;
}

export type StoreEventVisualKind =
  | 'music'
  | 'power_surge'
  | 'rain'
  | 'tea_aroma'
  | 'livestream'
  | 'inspection';

export interface RandomStoreEvent {
  id: string;
  title: string;
  description: string;
  effectSummary: string;
  visualKind: StoreEventVisualKind;
  moodDelta: number;
  patienceDelta: number;
  budgetMultiplier: number;
  actionLabel?: string;
  actionCost?: number;
  actionResultText?: string;
  actionMoodDelta?: number;
  actionPatienceDelta?: number;
  actionBudgetMultiplier?: number;
  resolved?: boolean;
}

export interface NextCustomerEventEffect {
  title: string;
  visualKind: StoreEventVisualKind;
  moodDelta: number;
  patienceDelta: number;
  budgetMultiplier: number;
}

export type TimedProjectKind =
  | 'SHOP_TIER'
  | 'UPGRADE'
  | 'BRANCH'
  | 'STAFF_TRAIN'
  | 'SHOWCASE_UPGRADE';

export interface TimedProject {
  id: string;
  kind: TimedProjectKind;
  targetId: string;
  label: string;
  daysRemaining: number;
  totalDays: number;
}

export interface PendingWholesaleOrder {
  id: string;
  kind: 'ACCESSORY' | 'PHONE';
  label: string;
  accessoryId?: AccessoryId;
  quantity?: number;
  specId?: string;
  wholesaleCost: number;
  daysRemaining: number;
  totalDays: number;
}

export interface StaffRepairJob {
  id: string;
  mode: 'INVENTORY' | 'EXPRESS_CUSTOMER';
  phoneUid?: string;
  customerName?: string;
  deviceName: string;
  defectIds: DefectId[];
  payout: number;
  turnsRemaining: number;
  totalTurns: number;
}

export type DailyQuestKind =
  | 'USE_LEVERAGE'
  | 'SELL_PHONE'
  | 'REPAIR_PHONE'
  | 'SERVE_TEA'
  | 'BUY_BARGAIN'
  | 'INSPECT_FULL'
  | 'SELL_ACCESSORY'
  | 'SELL_BRAND_NEW';

export interface DailyQuest {
  id: string;
  kind: DailyQuestKind;
  title: string;
  description: string;
  target: number;
  progress: number;
  reward: number;
  xpReward: number;
  claimed: boolean;
  /** Dynamic difficulty & playstyle tags */
  difficultyTag?: 'Standart' | 'Zorlu' | 'Usta İşi';
  playstyleFocus?: PlaystyleType;
}

export interface CareerMilestone {
  id: string;
  title: string;
  description: string;
  minLevel?: number;
  rewardCash: number;
  rewardXp: number;
  target: number;
  metric:
    | 'totalPhonesSold'
    | 'totalDefectsExposed'
    | 'totalPhonesRepaired'
    | 'bestDealStreak'
    | 'discoveredModels'
    | 'shopTier'
    | 'totalProfitEarned'
    | 'totalAccessoriesSold'
    | 'totalBrandNewSold';
}

export interface LevelPerk {
  level: number;
  title: string;
  description: string;
}

export interface InspectionOverlayData {
  id: string;
  category: InspectionCategory;
  categoryLabel: string;
  deviceName: string;
  foundDefects: DefectId[];
}

// === EMPIRE, ONLINE CLASSIFIEDS, AUCTION, BRANCHES, BANK, MUSEUM ===

export type ClassifiedListingStatus =
  | 'AVAILABLE'
  | 'INSPECTED_ONSITE'
  | 'SHIPPING_IN_TRANSIT'
  | 'ARRIVED_COD'
  | 'BOUGHT'
  | 'REJECTED';

export interface OnlineClassifiedListing {
  id: string;
  sellerName: string;
  district: string;
  title: string;
  sellerNote: string;
  askingPrice: number;
  currentPrice?: number;
  secretFloor?: number;
  device: PhoneDevice;
  riskTag: 'Temiz İlan' | 'Kelepir Fırsat' | 'Şüpheli İlan';
  bought: boolean;
  status?: ClassifiedListingStatus;
  deliveryDaysLeft?: number;
  haggleAttempts?: number;
  lastSellerReply?: string;
}

export interface ShippingOrder {
  id: string;
  buyerName: string;
  city: string;
  requestedTier: PhoneTier;
  requireClean: boolean;
  bonusMultiplier: number;
  shippingFee: number;
  note: string;
  fulfilled: boolean;
}

export interface AuctionMysteryReward {
  id: string;
  boxLabel: string;
  rewardTitle: string;
  rewardDetail: string;
  cashBonus?: number;
  extraDevice?: PhoneDevice;
  bonusAccessory?: { id: AccessoryId; quantity: number };
}

export interface CustomsAuctionLot {
  id: string;
  sessionLabel?: string;
  lotTitle: string;
  description: string;
  startingBid: number;
  /** Cash / accumulated wealth threshold required to enter this auction lot */
  requiredCash?: number;
  /** Number of sealed mystery boxes included inside this auction lot */
  mysteryBoxCount?: number;
  /** Rolled rewards revealed when the player wins the auction */
  mysteryRewards?: AuctionMysteryReward[];
  /** Dynamic scaling difficulty tag (e.g. "Zor · VIP Mezadı") */
  difficultyTag?: string;
  minShopTier?: ShopTier;
  riskTag?: string;
  manifestHint?: string;
  devices: PhoneDevice[];
  bonusAccessories: { id: AccessoryId; quantity: number }[];
  resolved: boolean;
  wonByPlayer: boolean;
  winningBid: number;
}

export type BranchId =
  | 'street_kiosk'
  | 'mall_corner'
  | 'service_hub'
  | 'airport_tech_booth'
  | 'regional_warehouse';

export interface BranchSpec {
  id: BranchId;
  name: string;
  district: string;
  unlockCost: number;
  minShopTier?: ShopTier;
  minLevel?: number;
  minReputation: number;
  buildDays: number;
  dailyNetIncome: number;
  offlineHourlyRate: number;
  prestigeBonus: number;
  description: string;
}

export interface BankLoanOffer {
  id: string;
  name: string;
  principal: number;
  interestRate: number;
  termDays: number;
  minShopTier: ShopTier;
  minLevel?: number;
  description: string;
}

export interface ActiveLoan {
  id: string;
  name: string;
  remainingBalance: number;
  dailyPayment: number;
  daysLeft: number;
}

export type MuseumItemId =
  | 'nokya_3310'
  | 'motorazr_v3'
  | 'eriksun_t28'
  | 'aphone_2g'
  | 'blakberi_bold';

export interface MuseumItemSpec {
  id: MuseumItemId;
  name: string;
  year: string;
  eraTag: string;
  rarityLabel: string;
  cost: number;
  prestigeBonus: number;
  dailyPassiveCash: number;
  story: string;
  fullHistory: string;
  collectorPerk: string;
  accentColor: string;
}

export interface RivalMerchantState {
  name: string;
  shopName: string;
  marketShare: number; // 0 to 100 (Player share = 100 - marketShare)
  buyoutCost: number;
  boughtOut: boolean;
  lastTaunt: string;
  promoUsedToday: boolean;
}

export interface OfflineEarningsSummary {
  minutesAway: number;
  baseCash: number;
  sources: string[];
}

export type KermesDealKind =
  | 'SPARE_PART_BUNDLE'
  | 'ACCESSORY_BUNDLE'
  | 'BARGAIN_PHONE';

export interface KermesDealItem {
  id: string;
  kind: KermesDealKind;
  title: string;
  enTitle: string;
  subtitle: string;
  enSubtitle: string;
  originalPrice: number;
  kermesPrice: number;
  discountPercent: number;
  partId?: SparePartId;
  partQty?: number;
  accessoryId?: AccessoryId;
  accessoryQty?: number;
  phone?: PhoneDevice;
  bought: boolean;
}

export interface SundayKermesState {
  day: number;
  headline: string;
  enHeadline: string;
  crowdBuzzLabel: string;
  enCrowdBuzzLabel: string;
  clearanceMultiplier: number;
  clearanceSoldCount: number;
  deals: KermesDealItem[];
}

export interface DayFinancials {
  day: number;
  phonesBought: number;
  phonesSold: number;
  accessoriesSold: number;
  buySpend: number;
  wholesaleSpend: number;
  repairSpend: number;
  salesRevenue: number;
  accessoryRevenue: number;
  serviceRevenue: number;
  branchIncome: number;
  questRewards: number;
  rentCost: number;
  staffWages: number;
  posCommission: number;
  loanPayments: number;
  taxPaid: number;
  /** Per-sale KDV & income tax deducted across phone/accessory/service sales */
  salesTaxPaid: number;
  reputationDelta: number;
  dealsLost: number;
  autoRepairedNote?: string;
  passiveAccessoryNote?: string;
}

export interface DayHistoryEntry {
  day: number;
  headline: string;
  revenue: number;
  expenses: number;
  netCashFlow: number;
  phonesSold: number;
  phonesBought: number;
  reputationEnd: number;
  reputationDelta: number;
  cashEnd: number;
}

export interface StoreAchievementSpec {
  id: string;
  title: string;
  description: string;
  points: number;
  check: (state: ShopState) => boolean;
}

export interface ShopState {
  day: number;
  cash: number;
  reputation: number;
  xp: number;
  level: number;
  legacyPath: LegacyPathId;
  dealStreak: number;
  bestDealStreak: number;
  shopTier: ShopTier;
  /** Repeatable showcase shelf expansion level (0..10), each adds +2 showcase slots */
  showcaseUpgradeLevel: number;
  inventory: PhoneDevice[];
  accessories: Record<AccessoryId, AccessoryStockItem>;
  upgrades: UpgradeId[];
  decorations: DecorationId[];
  activeDecorations: DecorationId[];
  staff: StaffId[];
  staffLevels: Record<StaffId, number>;
  branches: BranchId[];
  museumItems: MuseumItemId[];
  activeLoans: ActiveLoan[];
  distributorLoyalty: Record<string, number>;
  rival: RivalMerchantState;
  soldHistory: SoldPhoneRecord[];
  onlineListings: OnlineClassifiedListing[];
  shippingOrders: ShippingOrder[];
  /** Legacy single lot kept optional for backward compatibility */
  dailyAuctionLot: CustomsAuctionLot | null;
  /** 2-3 daily auctions per day */
  dailyAuctionLots: CustomsAuctionLot[];
  /** Ongoing multi-day renovations, equipment installs, branch builds, staff trainings */
  pendingProjects: TimedProject[];
  /** Wholesale orders currently in cargo transit */
  pendingWholesaleOrders: PendingWholesaleOrder[];
  /** Active repairs delegated to Hasan Usta */
  staffRepairQueue: StaffRepairJob[];
  /** Morning completed projects / cargo / staff notes shown in newspaper */
  morningNotifications: string[];
  /** Newspaper flash wholesale brand discount with live rival stock race */
  flashWholesaleDeal: FlashWholesaleDeal | null;
  /** Player merchant wardrobe outfits */
  ownedOutfits: OutfitId[];
  equippedOutfit: OutfitId;
  /** Mid-day random store event currently displaying on Counter */
  activeStoreEvent: RandomStoreEvent | null;
  /** Event modifier affecting the next incoming customer */
  nextCustomerEventEffect: NextCustomerEventEffect | null;
  storeEventsTriggeredToday: number;
  /** Google Play / App Store compliance & user preferences */
  privacyAccepted: boolean;
  hapticsEnabled: boolean;
  textSpeed: 'normal' | 'fast' | 'instant';
  ratedApp: boolean;
  feedbackNotes: string[];
  weeklyTaxDue: number;
  loginStreak: number;
  lastLoginDateStr: string;
  dailyStreakClaimed: boolean;
  lastSavedAt: number;
  dailyNews: DailyMarketEvent;
  dailyWholesaleDiscountBrand?: string;
  dailyQuests: DailyQuest[];
  claimedMilestoneIds: string[];
  claimedChapterIds: string[];
  discoveredSpecIds: string[];
  dailyQueue: CustomerEncounter[];
  currentQueueIndex: number;
  todayStats: DayFinancials;
  history: DayHistoryEntry[];
  reviews: CustomerReview[];
  totalProfitEarned: number;
  totalPhonesSold: number;
  totalBrandNewSold: number;
  totalAccessoriesSold: number;
  totalPhonesRepaired: number;
  totalDefectsExposed: number;
  totalTeasServed: number;
  totalTradeInsDone: number;
  totalAuctionsWon: number;
  bestSingleDealProfit: number;
  unlockedAchievementIds?: string[];
  unlockedEarningsBadges?: string[];
  /** Onboarding & progressive unlock flags */
  tutorialDismissed?: boolean;
  allTabsUnlockedEarly?: boolean;
  /** Optional subtle warm shop background ambience audio */
  ambientSoundEnabled?: boolean;
  storyIntroSeen: boolean;
  endlessMode: boolean;
  /** Infinite Prestige / New Game+ progression */
  prestigeLevel?: number;
  prestigePoints?: number;
  prestigePerks?: PrestigePerkId[];
  lifetimeTotalProfit?: number;
  /** Vintage shop radio station ('OFF' | 'ARABESK' | 'POP90') */
  radioStation?: RadioStationId;
  /** Workshop spare parts stock (Screen, Battery, Board/IPA Kit) */
  spareParts?: Record<SparePartId, number>;
  /** Full archive of post-repair / post-sale customer fault reports & warranty complaints */
  complaintHistory?: CustomerComplaintRecord[];
  /** Sunday-only random Esnaf Kermesi event in Piyasa (active every 7th day) */
  sundayKermes?: SundayKermesState | null;
}

export interface FloatingFeedback {
  id: string;
  text: string;
  tone: 'positive' | 'negative' | 'amber';
}

export interface AchievementBadgeNotification {
  id: string;
  kicker: string;
  title: string;
  subtitle: string;
  accent: 'gold' | 'emerald' | 'amber' | 'sky';
  icon: 'trophy' | 'coins' | 'flame' | 'gavel';
}
