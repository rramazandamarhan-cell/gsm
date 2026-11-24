import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  ACCESSORY_CATALOG,
  BANK_LOANS,
  BRAND_DISTRIBUTORS,
  CAREER_MILESTONES,
  CITY_BRANCHES,
  CUSTOMER_ARCHETYPES,
  DEFECT_CATALOG,
  EARNINGS_BADGE_TIERS,
  EarningsBadgeSpec,
  LEVEL_PERKS,
  MUSEUM_ITEMS,
  NEGOTIATION_TONES,
  PLAYER_OUTFITS,
  SHOP_DECORATIONS,
  SHOP_STAFF,
  SHOP_TIERS,
  SHOP_UPGRADES,
  STORE_ACHIEVEMENTS,
  STORY_CHAPTERS,
} from './catalog';
import {
  AccessoryId,
  AccessorySpec,
  BankLoanOffer,
  BranchId,
  BranchSpec,
  BrandDistributor,
  CareerMilestone,
  CustomerArchetypeId,
  CustomerMood,
  DailyMarketEvent,
  DailyQuest,
  DailyQuestKind,
  DecorationId,
  DefectId,
  EncounterType,
  InspectionCategory,
  LevelPerk,
  MuseumItemId,
  MuseumItemSpec,
  NegotiationTone,
  OutfitId,
  OutfitSpec,
  ShopDecoration,
  ShopTier,
  ShopTierInfo,
  ShopUpgrade,
  StaffId,
  StaffMember,
  StoreAchievementSpec,
  StoryChapter,
  UpgradeId,
} from './types';

export type Language = 'tr' | 'en';

const LANG_STORAGE_KEY = 'gsm_sim_lang_v1';

let activeLangSingleton: Language = 'tr';

function loadInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'tr';
  try {
    const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'tr' || saved === 'en') {
      activeLangSingleton = saved;
      return saved;
    }
  } catch {
    // ignore storage errors
  }
  return 'tr';
}

export function getCurrentLang(): Language {
  return activeLangSingleton;
}

interface LanguageContextValue {
  lang: Language;
  setLang: (next: Language) => void;
  /** Inline bilingual selector: bi('Türkçe metin', 'English text') */
  bi: (tr: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'tr',
  setLang: () => {},
  bi: (tr) => tr,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [lang, setLangState] = useState<Language>(() => loadInitialLanguage());

  const setLang = useCallback((next: Language) => {
    activeLangSingleton = next;
    setLangState(next);
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      // ignore storage errors
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = next;
    }
  }, []);

  useEffect(() => {
    activeLangSingleton = lang;
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const bi = useCallback(
    (tr: string, en: string) => (lang === 'en' ? en : tr),
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, bi }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  return useContext(LanguageContext);
}

/* ============================================================================
   DOMAIN-SPECIFIC BILINGUAL HELPERS (TR / EN)
============================================================================ */

const DEFECT_EN: Record<
  DefectId,
  { name: string; shortLabel: string; description: string }
> = {
  screen_crack: {
    name: 'Cracked Front Glass',
    shortLabel: 'Cracked Glass',
    description:
      'Spider-web hairline fractures across the front display glass. Requires glass/panel replacement.',
  },
  screen_aftermarket: {
    name: 'Aftermarket LCD Panel',
    shortLabel: 'Fake Screen',
    description:
      'Washed-out colors and thick bezel — replaced with a non-OEM TFT panel instead of original OLED.',
  },
  battery_degraded: {
    name: 'Degraded Battery Cell',
    shortLabel: 'Weak Battery',
    description:
      'Severe cell wear and high cycle count. Phone drains rapidly and throttles under load.',
  },
  battery_fake_chip: {
    name: 'Spoofed Battery Chip (BMS)',
    shortLabel: 'Spoofed BMS',
    description:
      'Settings fakes 98% health using a reprogrammed flex chip, but diagnostic scan exposes true degraded cell!',
  },
  imei_unregistered: {
    name: 'Unregistered Overseas IMEI',
    shortLabel: 'Unregistered IMEI',
    description:
      'Not registered on national carrier registry. Cannot be repaired in-shop — permanent resale penalty.',
  },
  liquid_damage: {
    name: 'Liquid Damage (Red LCI Sensor)',
    shortLabel: 'Liquid Damage',
    description:
      'The SIM-tray moisture strip has turned bright red and board traces show early oxidation.',
  },
  camera_fog: {
    name: 'Foggy Rear Camera Lens',
    shortLabel: 'Camera Fog',
    description:
      'Condensation haze trapped inside the rear camera housing causes blurry photos and autofocus drift.',
  },
  cosmetic_worn: {
    name: 'Scuffed Chassis & Corner Dents',
    shortLabel: 'Worn Frame',
    description:
      'Visible drop dents on frame corners and micro-scratches on the rear glass.',
  },
};

export function getLocalizedDefect(defectId: DefectId, lang: Language) {
  const base = DEFECT_CATALOG[defectId];
  if (lang === 'en') {
    const en = DEFECT_EN[defectId];
    return {
      ...base,
      name: en.name,
      shortLabel: en.shortLabel,
      description: en.description,
    };
  }
  return base;
}

export function getLocalizedCategoryLabel(
  category: InspectionCategory,
  lang: Language
): string {
  if (lang === 'en') {
    switch (category) {
      case 'screen':
        return 'Display & Glass';
      case 'battery':
        return 'Battery & Cycles';
      case 'imei':
        return 'IMEI Registry';
      case 'hardware':
        return 'Camera & Liquid';
    }
  }
  switch (category) {
    case 'screen':
      return 'Ekran & Kasa';
    case 'battery':
      return 'Pil & Devir';
    case 'imei':
      return 'IMEI Sorgu';
    case 'hardware':
      return 'Sıvı & Sensör';
  }
}

export function getLocalizedShopTierName(tier: ShopTier, lang: Language): string {
  if (lang === 'en') {
    const map: Record<ShopTier, string> = {
      1: 'Arcade Stall (12 m²)',
      2: 'Arcade Corner Shop',
      3: 'High-Street GSM Store',
      4: 'Tech Center & Service Lab',
      5: 'Mall Flagship Concept',
      6: 'Grand GSM Plaza',
    };
    return map[tier];
  }
  return SHOP_TIERS[tier]?.name ?? `Dükkan ${tier}`;
}

export function getLocalizedShopTier(tier: ShopTier, lang: Language): ShopTierInfo {
  const base = SHOP_TIERS[tier];
  if (lang === 'tr') return base;
  const enMap: Record<ShopTier, { name: string; subtitle: string; perkSummary: string }> = {
    1: {
      name: 'Arcade Stall (12 m²)',
      subtitle: 'Humble starter booth inside the electronics arcade',
      perkSummary: 'Base 2nd-hand trade & basic counter',
    },
    2: {
      name: 'Arcade Corner Shop (28 m²)',
      subtitle: 'Double-window corner spot with brighter showcase',
      perkSummary: '+20% walk-in traffic · Wider showcase capacity',
    },
    3: {
      name: 'High-Street GSM Store (55 m²)',
      subtitle: 'Street-front glass storefront with steady footfall',
      perkSummary: '+35% traffic · Higher buyer budgets & faster turnover',
    },
    4: {
      name: 'Tech Center & Repair Lab (95 m²)',
      subtitle: 'Dedicated micro-soldering lab & multi-brand display',
      perkSummary: 'VIP & Flagship footfall · Elevated prestige bonus',
    },
    5: {
      name: 'Mall Flagship Concept (160 m²)',
      subtitle: 'Luxury shopping mall tech boutique with VIP lounge',
      perkSummary: 'Massive daily traffic · High-ticket VIP clients',
    },
    6: {
      name: 'Grand GSM Plaza (320 m²)',
      subtitle: 'The city’s premier mobile & repair headquarters',
      perkSummary: 'Ultimate prestige · Million-tier credit & empire peak',
    },
  };
  return { ...base, ...enMap[tier] };
}

export function getLocalizedAccessory(id: AccessoryId, lang: Language): AccessorySpec {
  const base = ACCESSORY_CATALOG.find((a) => a.id === id) ?? ACCESSORY_CATALOG[0];
  if (lang === 'tr') return base;
  const enMap: Record<AccessoryId, { name: string; category: string; description: string }> = {
    tempered_glass: {
      name: '9H Privacy Tempered Glass',
      category: 'Screen Protection',
      description: 'Almost every phone buyer asks for one. Fast-moving high-margin staple.',
    },
    magsafe_case: {
      name: 'MagKlik Silicone Case',
      category: 'Cases & Armor',
      description: 'Microfiber-lined magnetic silicone case. Huge hit with students & creators.',
    },
    car_mount: {
      name: 'Magnetic Vent Car Mount',
      category: 'Car Accessories',
      description: 'Heavy-duty air-vent magnetic phone mount. Popular walk-in pickup for drivers.',
    },
    gan_charger: {
      name: '30W GaN Fast Charger Kit',
      category: 'Power & Cables',
      description: 'New phones ship without bricks — compact 30W GaN adapter + braided cable.',
    },
    powerbank: {
      name: '10,000 mAh Mini Powerbank',
      category: 'Portable Power',
      description: 'Pocket-sized PD fast-charge powerbank. Flies off the shelf during rush days.',
    },
    tws_earbuds: {
      name: 'ANC Bluetooth Earbuds',
      category: 'Audio & Earbuds',
      description: 'Active noise-cancelling wireless earbuds delivering big single-unit profit.',
    },
  };
  return { ...base, ...enMap[id] };
}

export function getLocalizedDistributor(id: string, lang: Language): BrandDistributor {
  const base = BRAND_DISTRIBUTORS.find((d) => d.id === id) ?? BRAND_DISTRIBUTORS[0];
  if (lang === 'tr') return base;
  const enMap: Record<string, { name: string; tagline: string; description: string }> = {
    dist_budget: {
      name: 'Anatolia GSM Wholesale (RedMix & PocoPop)',
      tagline: 'Unlocks at Lv. 2 · Factory Sealed',
      description: 'Your first official dealer line. Factory-sealed entry devices with 24-month warranty.',
    },
    dist_samxung: {
      name: 'Samxung Official Regional Distributor',
      tagline: 'Unlocks at Lv. 3 & 3.1★ Rep',
      description: 'Order factory-sealed Galax A & S Ultra stock directly for high-margin retail.',
    },
    dist_aphone: {
      name: 'aPhone Authorized Dealer Channel',
      tagline: 'Unlocks at Lv. 4 & 3.5★ Rep',
      description: 'Direct distributor pricing on the city’s most sought-after sealed aPhone lineup.',
    },
    dist_luxury: {
      name: 'Global Luxury & Foldables Import',
      tagline: 'Unlocks at Lv. 6 & 4.0★ Rep',
      description: 'Exclusive supply channel for ultra-luxury foldables and flagship collector units.',
    },
  };
  return { ...base, ...(enMap[id] ?? {}) };
}

export function getLocalizedUpgrade(id: UpgradeId, lang: Language): ShopUpgrade {
  const base = SHOP_UPGRADES.find((u) => u.id === id) ?? SHOP_UPGRADES[0];
  if (lang === 'tr') return base;
  const enMap: Record<UpgradeId, { name: string; effectLabel: string; description: string }> = {
    repair_bench: {
      name: 'Pro Repair Workbench',
      effectLabel: 'In-Shop Multi-Repair',
      description: 'Fix cracked screens, batteries & cameras yourself instead of outsourcing.',
    },
    tea_samovar: {
      name: 'Copper Tea Samovar',
      effectLabel: 'Free Tea · +Extra Calm',
      description: 'Brew endless fresh tea for free — softens tough buyers & sellers faster.',
    },
    pro_diagnostic: {
      name: 'Pro Diagnostic Scanner',
      effectLabel: 'Auto-Expose 1 Defect',
      description: 'Automatically reveals one hidden defect when a seller puts a phone on the desk.',
    },
    display_cabinet: {
      name: 'Illuminated Glass Cabinet',
      effectLabel: '+2 Showcase Slots · +Prestige',
      description: 'LED-lit glass display attracts richer buyers and expands shelf capacity.',
    },
    parts_wholesale: {
      name: 'Direct Parts Wholesale Contract',
      effectLabel: '-20% Repair Part Cost',
      description: 'Bulk screen and battery supplier contract cuts all repair part costs by 20%.',
    },
    neon_sign: {
      name: 'Neon Street Signage',
      effectLabel: '+25% Shelf Sales · +VIPs',
      description: 'High-visibility storefront neon pulls in wealthier walk-ins and flagship sellers.',
    },
    ultrasonic_cleaner: {
      name: 'Ultrasonic Liquid Bath',
      effectLabel: '-25% Liquid Repair Cost',
      description: 'Industrial PCB cleaning tank restores water-damaged boards cleanly and cheaply.',
    },
    laser_backglass: {
      name: 'Laser Back-Glass Machine',
      effectLabel: '+8% Restored Phone Value',
      description: 'Precision laser refinishes worn frames and rear glass to showroom grade.',
    },
    smart_pos_zero: {
      name: '0% Installment Smart POS',
      effectLabel: '+12% Buyer Closing Boost',
      description: 'Zero-fee installment plans convince hesitant buyers to accept higher prices.',
    },
    micro_soldering: {
      name: 'Micro-Soldering Station',
      effectLabel: '+10% Master Craft Bonus',
      description: 'Microscope & hot-air rework boosts resale value of every phone you repair.',
    },
    barcode_automation: {
      name: 'Barcode POS & Inventory',
      effectLabel: '+35% Passive Shelf Sales',
      description: 'Fast checkout & shelf analytics supercharge daily accessory turnover.',
    },
    clean_room_lab: {
      name: 'Dust-Free Clean Room Lab',
      effectLabel: '+15% Craft Value · Top Prestige',
      description: 'Factory-grade dust-free repair chamber makes your refurbished units iconic.',
    },
  };
  return { ...base, ...(enMap[id] ?? {}) };
}

export function getLocalizedDecoration(id: DecorationId, lang: Language): ShopDecoration {
  const base = SHOP_DECORATIONS.find((d) => d.id === id) ?? SHOP_DECORATIONS[0];
  if (lang === 'tr') return base;
  const enMap: Record<DecorationId, { name: string; description: string }> = {
    vintage_sign: {
      name: 'Vintage Brass GSM Sign',
      description: 'Classic craftsman signboard that builds instant neighborhood trust.',
    },
    edison_lights: {
      name: 'Warm Edison Pendant Lights',
      description: 'Amber architectural lighting that makes showcase phones gleam.',
    },
    retro_shelf: {
      name: 'Retro Tech Collector Shelf',
      description: 'Display iconic GSM relics and conversation pieces behind the counter.',
    },
    led_showcase: {
      name: 'Edge-Lit LED Display Island',
      description: 'Boutique-style illuminated island for flagship phones & bundles.',
    },
    tea_corner: {
      name: 'Hospitality Tea Lounge',
      description: 'Cozy seating corner that calms stressed customers before haggling.',
    },
  };
  return { ...base, ...(enMap[id] ?? {}) };
}

export function getLocalizedStaff(id: StaffId, lang: Language): StaffMember {
  const base = SHOP_STAFF.find((s) => s.id === id) ?? SHOP_STAFF[0];
  if (lang === 'tr') return base;
  const enMap: Record<StaffId, { name: string; role: string; effectLabel: string; description: string }> = {
    apprentice: {
      name: 'Can (Shop Apprentice)',
      role: 'Counter & Shelf Assistant',
      effectLabel: '+Passive Accessory Sales',
      description: 'Keeps the accessory rack stocked and boosts daily passive shelf sales as he trains.',
    },
    master_tech: {
      name: 'Master Hasan',
      role: 'Senior Micro-Repair Tech',
      effectLabel: 'Timed Repair Delegation',
      description: 'Delegate multi-defect workshop repairs to Master Hasan — faster & cheaper per level.',
    },
    sales_rep: {
      name: 'Selin (Sales Advisor)',
      role: 'Showcase & Cross-Sell Pro',
      effectLabel: '+Cross-Sell & Buyer Budget',
      description: 'Boosts cross-sell accessory conversion and convinces showroom buyers to pay more.',
    },
    accountant: {
      name: 'Kamil (CPA Accountant)',
      role: 'Tax & Finance Advisor',
      effectLabel: 'Lower Sales Tax Rate',
      description: 'Legally optimizes VAT & business deductions, cutting your sales tax burden per level.',
    },
  };
  return { ...base, ...(enMap[id] ?? {}) };
}

export function getLocalizedBranch(id: BranchId, lang: Language): BranchSpec {
  const base = CITY_BRANCHES.find((b) => b.id === id) ?? CITY_BRANCHES[0];
  if (lang === 'tr') return base;
  const enMap: Record<BranchId, { name: string; district: string; description: string }> = {
    street_kiosk: {
      name: 'Subway Exit GSM Kiosk',
      district: 'Downtown Transit',
      description: 'High-footfall commuter booth bringing reliable daily accessory & repair cash.',
    },
    mall_corner: {
      name: 'Shopping Mall Tech Island',
      district: 'Central Mall',
      description: 'Bright mall atrium island selling high-margin sealed phones and cases daily.',
    },
    service_hub: {
      name: 'Express Repair Center',
      district: 'Tech District',
      description: 'Dedicated walk-in screen & battery service hub with strong daily profit.',
    },
    airport_tech_booth: {
      name: 'Airport Travel Tech Lounge',
      district: 'International Terminal',
      description: 'Premium powerbanks, chargers & flagship phones for high-spending travelers.',
    },
    regional_warehouse: {
      name: 'Regional Distribution Hub',
      district: 'Logistics Park',
      description: 'Massive B2B & retail fulfillment center dominating citywide market share.',
    },
  };
  return { ...base, ...(enMap[id] ?? {}) };
}

export function getLocalizedMuseumItem(id: MuseumItemId, lang: Language): MuseumItemSpec {
  const base = MUSEUM_ITEMS.find((m) => m.id === id) ?? MUSEUM_ITEMS[0];
  if (lang === 'tr') return base;
  const enMap: Record<MuseumItemId, { name: string; description: string }> = {
    nokya_3310: {
      name: 'Nokya 3310 (Indestructible)',
      description: 'The legendary brick phone. Survives concrete drops and still runs Snake.',
    },
    eriksun_t28: {
      name: 'ErikSun T28 Flip',
      description: 'Iconic spring-loaded active flip classic from the golden GSM era.',
    },
    motorazr_v3: {
      name: 'MotoRazr V3 Ultra-Slim',
      description: 'Laser-etched anodized aluminum flip icon that defined 2000s luxury.',
    },
    blakberi_bold: {
      name: 'BlakBeri Bold 9900',
      description: 'Tactile QWERTY executive legend with trackpad precision.',
    },
    aphone_2g: {
      name: 'aPhone 2G First Edition',
      description: 'Mint-box collector masterpiece that sparked the smartphone revolution.',
    },
  };
  return { ...base, ...(enMap[id] ?? {}) };
}

export function getLocalizedLoan(id: string, lang: Language): BankLoanOffer {
  const base = BANK_LOANS.find((l) => l.id === id) ?? BANK_LOANS[0];
  if (lang === 'tr') return base;
  const enMap: Record<string, { name: string; description: string }> = {
    loan_starter: {
      name: 'Tradesman Micro Cash',
      description: 'Quick starter capital to snap up bargain 2nd-hand deals.',
    },
    loan_wholesale: {
      name: 'Wholesale Restock Line',
      description: 'Fill your showcase with sealed phones and high-turnover accessories.',
    },
    loan_cadde: {
      name: 'High-Street Expansion Credit',
      description: 'Finance storefront upgrades, equipment, or your first city branch.',
    },
    loan_showroom: {
      name: 'Showroom Investment Loan',
      description: 'Major working capital for luxury stock and multi-branch growth.',
    },
    loan_flagship: {
      name: 'Flagship Capital Package',
      description: 'Executive credit line built for mall boutiques and big auctions.',
    },
    loan_plaza_holding: {
      name: 'GSM Plaza Million Credit',
      description: 'Million-tier commercial credit reserved for city-dominating GSM empires.',
    },
  };
  return { ...base, ...(enMap[id] ?? {}) };
}

export function getLocalizedOutfit(id: OutfitId, lang: Language): OutfitSpec {
  const base = PLAYER_OUTFITS.find((o) => o.id === id) ?? PLAYER_OUTFITS[0];
  if (lang === 'tr') return base;
  const enMap: Record<OutfitId, { name: string; styleTag: string; perkLabel: string; description: string }> = {
    casual_hoodie: {
      name: 'Arcade Street Hoodie',
      styleTag: 'Casual Starter',
      perkLabel: 'Friendly Vibes',
      description: 'Comfortable everyday look from your apprentice days.',
    },
    traditional_vest: {
      name: 'Master Craftsman Vest',
      styleTag: 'Classic Tradesman',
      perkLabel: '+10% Tea Calming Effect',
      description: 'Earn instant warmth and respect from neighborhood uncles and regulars.',
    },
    tech_esd_coat: {
      name: 'Anti-Static Tech Lab Coat',
      styleTag: 'Master Engineer',
      perkLabel: '+6% Repair Value Bonus',
      description: 'Projects clinical diagnostic authority when quoting repair work.',
    },
    formal_shirt: {
      name: 'Crisp Showroom Shirt',
      styleTag: 'Boutique Dealer',
      perkLabel: '+4% Buyer Trust',
      description: 'Sharp storefront polish that reassures brand-new phone buyers.',
    },
    italian_blazer: {
      name: 'Tailored Italian Blazer',
      styleTag: 'Executive Chic',
      perkLabel: '+6% VIP & Flagship Pull',
      description: 'Command presence when closing luxury and foldable phone deals.',
    },
    boss_suit: {
      name: 'GSM Emperor Three-Piece Suit',
      styleTag: 'Plaza Mogul',
      perkLabel: '+8% Prestige & Deal Sway',
      description: 'The unmistakable silhouette of the city’s top mobile empire boss.',
    },
  };
  return { ...base, ...(enMap[id] ?? {}) };
}

export function getLocalizedLevelPerk(level: number, lang: Language): LevelPerk {
  const base = LEVEL_PERKS.find((p) => p.level === level) ?? LEVEL_PERKS[0];
  if (lang === 'tr') return base;
  const enMap: Record<number, { title: string; description: string }> = {
    1: {
      title: 'First Shutter · 2nd-Hand Trade',
      description: 'Start from scratch trading & inspecting 2nd-hand phones in your 12 m² stall.',
    },
    2: {
      title: 'Wholesale & Upgrades + Glass & Case',
      description: 'Unlocks Wholesale & Upgrades tabs, Tempered Glass, MagKlik Case & RedMix/PocoPop sealed stock!',
    },
    3: {
      title: 'Samxung Dealer + Car Mount + -10% Parts',
      description: 'Unlocks Magnetic Car Mount, Samxung sealed distributor (3.1★) & permanent 10% repair part discount.',
    },
    4: {
      title: 'Empire Market + 30W GaN + aPhone',
      description: 'Unlocks Empire tab (Classifieds, Auctions, Branches, Bank, Museum), 30W GaN Charger & aPhone dealer (3.5★)!',
    },
    5: {
      title: '10,000 mAh Powerbank + VIP Magnet',
      description: 'Unlocks Mini Powerbank stock, +20% faster shelf sales & +15% higher VIP arrival rate.',
    },
    6: {
      title: 'ANC Bluetooth Earbuds + Luxury Import',
      description: 'Unlocks ANC Earbuds, Luxury Foldables distributor (4.0★) & +1 extra daily customer!',
    },
    7: {
      title: 'Distributor Discount (-4% Sealed Cost)',
      description: 'Permanent extra 4% wholesale discount across all official sealed phone distributors.',
    },
    8: {
      title: 'Profit Streak Master (x1.5 Streak Cash)',
      description: 'Consecutive successful deal streak bonuses pay 50% more cash.',
    },
    9: {
      title: 'City Legend (+6% Buyer Budget)',
      description: 'Your citywide reputation convinces all showcase buyers to stretch budgets by +6%.',
    },
    10: {
      title: 'GSM Grandmaster (Empire Peak)',
      description: 'Additional -4% distributor discount and +1 extra daily customer for maximum mastery!',
    },
  };
  return { ...base, ...(enMap[level] ?? {}) };
}

export function getLocalizedStoryChapter(ch: StoryChapter, lang: Language): StoryChapter {
  if (lang === 'tr') return ch;
  const enMap: Record<
    string,
    { title: string; subtitle: string; narrative: string; mentorNote: string; objectiveText: string }
  > = {
    ch_1_first_shutter: {
      title: 'Chapter 1: First Shutter (Age 23)',
      subtitle: 'From 5 years as an apprentice to your own 12 m² stall',
      narrative:
        'After 5 years learning under Master Cemal, you opened your own arcade shutter. First step: inspect 2nd-hand phones, haggle hard, and close your first showcase sales!',
      mentorNote:
        'Master Cemal: "Kid, warm up your instincts on 2nd-hand phones first. Spot defects, cut the price, sell 2 phones to hit Lv. 2 — then we’ll unlock wholesale cases & glass!"',
      objectiveText: 'Sell a total of 2 phones from your showcase',
    },
    ch_2_own_bench: {
      title: 'Chapter 2: Your Own Screwdriver',
      subtitle: 'Stop outsourcing repairs and keep the craft margin',
      narrative:
        'Time to turn the board & screen skills you learned into real cash. Restore faulty phones in your workshop or express counter for big resale jumps.',
      mentorNote:
        'Master Cemal: "Everyone runs from cracked screens — a real technician sees the margin hiding inside. Steady heat, don’t tear the flex!"',
      objectiveText: 'Complete 2 phone repairs at your workshop or express counter',
    },
    ch_3_accessory_shelf: {
      title: 'Chapter 3: The Accessory Rack',
      subtitle: 'Tempered glass, cases & chargers keep cash flowing',
      narrative:
        'As you level up, wholesale doors swing open! Stock glass & cases at Lv. 2, then unlock car mounts, GaN chargers, powerbanks & earbuds for lucrative cross-sales.',
      mentorNote:
        'Master Cemal: "Phones bring the glory, kid, but cases and screen protectors always pay the rent. Never let the rack run dry!"',
      objectiveText: 'Sell a total of 5 phone accessories',
    },
    ch_4_brand_dealer: {
      title: 'Chapter 4: Sealed-Box Dealership',
      subtitle: 'Step beyond 2nd-hand into official factory-sealed stock',
      narrative:
        'You’re no longer just flipping used devices. Order brand-new 24-month warranty sealed phones from distributors and elevate your showcase.',
      mentorNote:
        'Master Cemal: "Factory-sealed boxes build instant credibility. Bundle a case and fast charger alongside one and they’ll be customers for life!"',
      objectiveText: 'Sell 2 factory-sealed Brand-New phones from distributors',
    },
    ch_5_showroom_boss: {
      title: 'Chapter 5: GSM Empire',
      subtitle: 'High-Street Showroom & Technical Service Leader',
      narrative:
        'Appraisal, micro-soldering, a stacked accessory rack, and official brand distribution under one roof! Upgrade to a Tier 3 High-Street Store or higher.',
      mentorNote:
        'Master Cemal: "There’s nothing left I can teach you. You’re the new king of the arcade — may your shutter always open to abundance!"',
      objectiveText: 'Upgrade your shop to Tier 3 "High-Street GSM Store" or higher',
    },
  };
  return { ...ch, ...(enMap[ch.id] ?? {}) };
}

export function getLocalizedMilestone(m: CareerMilestone, lang: Language): CareerMilestone {
  if (lang === 'tr') return m;
  const enMap: Record<string, { title: string; description: string }> = {
    ms_first_sale: {
      title: 'First Sale, First Cash',
      description: 'Sell your first phone from the showcase and ring the register.',
    },
    ms_acc_king: {
      title: 'Accessory Rack Master',
      description: 'Sell a total of 15 cases, screen protectors, chargers, or audio gear.',
    },
    ms_defect_hunter: {
      title: 'Eagle-Eyed Appraiser',
      description: 'Expose 5 hidden defects during inspection and use them as leverage.',
    },
    ms_micro_surgeon: {
      title: 'Micro-Soldering Surgeon',
      description: 'Repair a total of 6 phone defects across workshop or express jobs.',
    },
    ms_brand_new_dealer: {
      title: 'Authorized Sealed Dealer',
      description: 'Sell 4 factory-sealed brand-new distributor phones.',
    },
    ms_hot_streak: {
      title: 'Unstoppable Streak',
      description: 'Reach a 5x consecutive successful deal streak.',
    },
    ms_collector_6: {
      title: 'Model Catalog Explorer',
      description: 'Discover and handle 6 different phone models in your career.',
    },
    ms_profit_40k: {
      title: '40,000 ₺ Profit Milestone',
      description: 'Earn 40,000 ₺ in cumulative net trading profit.',
    },
    ms_tier3_showroom: {
      title: 'High-Street Boss',
      description: 'Expand your business to a Tier 3 storefront or beyond.',
    },
  };
  return { ...m, ...(enMap[m.id] ?? {}) };
}

export function getLocalizedAchievement(a: StoreAchievementSpec, lang: Language): StoreAchievementSpec {
  if (lang === 'tr') return a;
  const enMap: Record<string, { title: string; description: string }> = {
    ach_first_deal: { title: 'First Handshake', description: 'Close your first phone deal.' },
    ach_eagle_eye: { title: 'Eagle Eye', description: 'Expose 10 hidden device defects.' },
    ach_repair_master: { title: 'Master Technician', description: 'Complete 10 phone repairs.' },
    ach_accessory_baron: { title: 'Accessory Baron', description: 'Sell 30 accessories.' },
    ach_auction_shark: { title: 'Auction Shark', description: 'Win 3 customs auctions.' },
    ach_fashion_boss: { title: 'Style Icon', description: 'Collect 3 boss outfits.' },
    ach_empire_branches: { title: 'City Chain', description: 'Open 3 city branches.' },
    ach_plaza_king: { title: 'GSM Plaza King', description: 'Reach Tier 6 Grand GSM Plaza.' },
  };
  return { ...a, ...(enMap[a.id] ?? {}) };
}

export function getLocalizedEarningsBadge(b: EarningsBadgeSpec, lang: Language): EarningsBadgeSpec {
  if (lang === 'tr') return b;
  const enMap: Record<string, { title: string; subtitle: string }> = {
    earn_10k: { title: '10K Tradesman', subtitle: '10,000 ₺ Total Profit' },
    earn_25k: { title: '25K Dealer', subtitle: '25,000 ₺ Total Profit' },
    earn_50k: { title: '50K Store Boss', subtitle: '50,000 ₺ Total Profit' },
    earn_100k: { title: '100K Tech Tycoon', subtitle: '100,000 ₺ Total Profit' },
    earn_250k: { title: '250K Market Shark', subtitle: '250,000 ₺ Total Profit' },
    earn_500k: { title: 'Half-Millionaire', subtitle: '500,000 ₺ Total Profit' },
    earn_1m: { title: 'GSM Millionaire', subtitle: '1,000,000 ₺ Total Profit' },
  };
  return { ...b, ...(enMap[b.id] ?? {}) };
}

export function getLocalizedQuest(q: DailyQuest, lang: Language): DailyQuest {
  if (lang === 'tr') return q;
  const enMap: Record<DailyQuestKind, { title: string; description: string }> = {
    INSPECT_FULL: {
      title: 'Full Inspection Specialist',
      description: `Complete all 4 hardware tests on ${q.target} counter phones.`,
    },
    USE_LEVERAGE: {
      title: 'Eagle-Eyed Negotiator',
      description: `Expose ${q.target} hidden defects and use them as leverage.`,
    },
    SELL_PHONE: {
      title: 'Hot Showcase Sale',
      description: `Sell at least ${q.target} phone(s) from your showcase today.`,
    },
    SELL_ACCESSORY: {
      title: 'Accessory Shelf Action',
      description: `Sell ${q.target} accessories via counter, bundle, or shelf.`,
    },
    SERVE_TEA: {
      title: 'Arcade Hospitality',
      description: `Serve tea to ${q.target} customers to soften negotiations.`,
    },
    BUY_BARGAIN: {
      title: 'Bargain Hunter',
      description: `Buy ${q.target} device(s) below real market value.`,
    },
    REPAIR_PHONE: {
      title: 'Micro Repair Shift',
      description: `Repair at least ${q.target} faulty device(s) today.`,
    },
    SELL_BRAND_NEW: {
      title: 'Sealed Box Sale',
      description: `Sell ${q.target} factory-sealed distributor phone(s).`,
    },
  };
  return { ...q, ...(enMap[q.kind] ?? {}) };
}

export function getLocalizedTone(tone: NegotiationTone, lang: Language) {
  const base = NEGOTIATION_TONES[tone];
  if (lang === 'tr') return base;
  const enMap: Record<NegotiationTone, { label: string; shortDesc: string }> = {
    friendly: { label: 'Friendly', shortDesc: 'Keeps mood high, softens resistance' },
    analytical: { label: 'Analytical', shortDesc: 'Best with exposed defect leverage' },
    firm: { label: 'Firm', shortDesc: 'Pushes harder price, risks patience' },
  };
  return { ...base, ...enMap[tone] };
}

export function getLocalizedArchetype(id: CustomerArchetypeId, lang: Language) {
  const base = CUSTOMER_ARCHETYPES[id];
  if (lang === 'tr') return base;
  const enMap: Record<CustomerArchetypeId, { title: string; traitSummary: string }> = {
    student: {
      title: 'College Student',
      traitSummary: 'Loves budget & mid-range deals, friendly tone works great.',
    },
    uncle: {
      title: 'Skeptical Arcade Uncle',
      traitSummary: 'Loves Turkish tea, gets angry fast at lowball offers.',
    },
    influencer: {
      title: 'Tech Creator',
      traitSummary: 'Pays top cash for clean flagships & sealed boxes, hates flaws.',
    },
    hustler: {
      title: 'Street Flipper',
      traitSummary: 'Tough haggler who hides defects — inspect carefully & use leverage!',
    },
    vip: {
      title: 'VIP Collector',
      traitSummary: 'Deep pockets for mint flagships & foldables, impatient with delays.',
    },
  };
  return { ...base, ...enMap[id] };
}

export function getLocalizedNews(news: DailyMarketEvent, lang: Language): DailyMarketEvent {
  if (lang === 'tr') return news;
  const enMap: Record<
    string,
    {
      kicker: string;
      headline: string;
      subheadline: string;
      description: string;
      effectSummary: string;
      gossipNote: string;
    }
  > = {
    launch_day2: {
      kicker: 'BREAKING LAUNCH',
      headline: 'aPhone Viral Camera Trend Sparks Rush!',
      subheadline: 'Creators across the city hunt clean aPhones today.',
      description: 'Creators are hunting clean aPhones across the city — showcase values jump today.',
      effectSummary: 'aPhone Market +14%',
      gossipNote: 'Arcade Rumor: Clean aPhone 13 & 14 Pro units are selling within minutes!',
    },
    launch_day4: {
      kicker: 'REGULATION ALERT',
      headline: 'IMEI Registration Tax Hike Announced!',
      subheadline: 'Strict carrier checks hit unregistered overseas imports.',
      description: 'Unregistered overseas phones lose resale appeal while TR-registered units shine.',
      effectSummary: 'Clean IMEI Demand Up',
      gossipNote: 'Tip: Double-check IMEI status with your loupe before buying!',
    },
    launch_day6: {
      kicker: 'PARTS FLASH DROP',
      headline: 'Parts Container Arrives at Port!',
      subheadline: 'Fresh OLED panels & battery cells flood the arcade.',
      description: 'Fresh OLED screens and battery cells flood wholesale — repair costs plunge today.',
      effectSummary: 'Repair Parts -25%',
      gossipNote: 'Workshop Tip: Great day to buy cracked phones cheap and restore them!',
    },
    launch_day8: {
      kicker: 'LUXURY EXPO',
      headline: 'Luxury Foldables Expo Hits Town!',
      subheadline: 'VIP collectors tour local showrooms for rare flagships.',
      description: 'VIP collectors are touring showrooms hunting ultra-premium and foldable flagships.',
      effectSummary: 'Luxury & Flagships +15%',
      gossipNote: 'VIP Alert: Keep mint high-tier models on your showcase today.',
    },
    news_iphone16_drop: {
      kicker: 'MARKET RUMOR',
      headline: 'New Flagship Rumors Shake aPhone Prices!',
      subheadline: 'Early upgraders rush to trade in older models.',
      description: 'Sellers are eager to upgrade early — bargain supply rises across the arcade.',
      effectSummary: 'aPhone Sellers Flexible',
      gossipNote: 'Rumor: Great day to pick up trade-in aPhones below fair value.',
    },
    news_imei_tax: {
      kicker: 'CARRIER AUDIT',
      headline: 'Strict Carrier Registry Audit Today!',
      subheadline: 'Buyers refuse unverified overseas IMEI numbers.',
      description: 'Buyers demand verified IMEI phones and walk away from unregistered devices.',
      effectSummary: 'Unregistered IMEI Penalty',
      gossipNote: 'Always run IMEI check before shaking hands!',
    },
    news_tahtakale_container: {
      kicker: 'WHOLESALE ALERT',
      headline: 'Wholesale Parts Flash Shipment!',
      subheadline: '24-hour parts discount across the arcade.',
      description: 'Local wholesalers slashed screen & battery prices for 24 hours.',
      effectSummary: 'Repair Parts -25%',
      gossipNote: 'Stock up on damaged phones and repair them for huge margins!',
    },
    news_payday_boom: {
      kicker: 'ARCADE BOOM',
      headline: 'Payday & Bonuses Hit: Wallets Are Full!',
      subheadline: 'Foot traffic and upgrade budgets surge across the arcade.',
      description: 'Walk-in buyers are ready to upgrade and spend more across all showcases.',
      effectSummary: 'All Phone Values +10%',
      gossipNote: 'Great day to list your best showcase inventory at sweet-spot prices!',
    },
    news_university_opening: {
      kicker: 'BACK TO CAMPUS',
      headline: 'Campus Semester Starts: Budget Phone Rush!',
      subheadline: 'Students hunt clean RedMix & PocoPop handsets.',
      description: 'Students are looking for affordable RedMix, PocoPop & clean mid-range phones.',
      effectSummary: 'Budget & Mid-Range +12%',
      gossipNote: 'Tip: Students love friendly haggling and tempered glass bundles.',
    },
    news_influencer_camera: {
      kicker: 'VIRAL TREND',
      headline: 'Night-Mode Trend Goes Viral: aPhone Surge!',
      subheadline: 'Pro camera phones fly off shelves at premium prices.',
      description: 'Demand for clean camera flagships and aPhones climbs sharply today.',
      effectSummary: 'aPhone Market +14%',
      gossipNote: 'Check rear cameras carefully for condensation haze!',
    },
    news_samxung_rally: {
      kicker: 'BRAND RALLY',
      headline: 'Samxung Ultra Zoom Rally in the Arcade!',
      subheadline: 'Samxung buyers pay top lira for clean displays.',
      description: 'Samxung devices are trending hard with buyers offering top lira.',
      effectSummary: 'Samxung Market +14%',
      gossipNote: 'If you have a Samxung in workshop, polish and list it today!',
    },
    news_heatwave_batteries: {
      kicker: 'SEASONAL SURGE',
      headline: 'Summer Heatwave Drains Phone Batteries!',
      subheadline: 'Battery health inspections matter more than ever.',
      description: 'Battery replacements are booming while weak-cell phones sell cheaper.',
      effectSummary: 'Battery Checks Crucial',
      gossipNote: 'Scan battery cycles — spoofed BMS chips are everywhere today!',
    },
  };
  return { ...news, ...(enMap[news.id] ?? {}) };
}

export function getLocalizedConditionLabel(
  trLabel: string,
  lang: Language
): string {
  if (lang === 'tr') return trLabel;
  switch (trLabel) {
    case 'Sıfır · Kapalı Kutu':
      return 'Brand New · Sealed';
    case 'Sıfır Ayarında':
      return 'Mint Condition';
    case 'Temiz':
      return 'Clean';
    case 'İdare Eder':
      return 'Fair';
    case 'Hasarlı':
    case 'Sorunlu':
      return 'Damaged';
    case 'Hurda':
    case 'Ağır Kusurlu':
      return 'Scrap';
    default:
      return trLabel;
  }
}

export function getLocalizedMoodLabel(mood: CustomerMood, lang: Language): string {
  if (lang === 'en') {
    switch (mood) {
      case 'excited':
        return 'Thrilled';
      case 'happy':
        return 'Happy';
      case 'calm':
        return 'Calm';
      case 'thinking':
        return 'Thinking';
      case 'annoyed':
        return 'Annoyed';
      case 'angry':
        return 'Furious';
    }
  }
  switch (mood) {
    case 'excited':
      return 'Çok Keyifli';
    case 'happy':
      return 'Güler Yüzlü';
    case 'calm':
      return 'Sakin';
    case 'thinking':
      return 'Düşünceli';
    case 'annoyed':
      return 'Gergin';
    case 'angry':
      return 'Sinirli';
  }
}

export function getLocalizedRoleText(
  type: EncounterType,
  lang: Language,
  opts?: { isBrandNew?: boolean; isVip?: boolean }
): string {
  if (lang === 'en') {
    switch (type) {
      case 'SELLER':
        return 'Selling Device';
      case 'BUYER':
        if (opts?.isBrandNew) return 'Sealed-Box Buyer';
        if (opts?.isVip) return 'VIP Buyer';
        return 'Showcase Buyer';
      case 'TRADE_IN':
        return 'Trade-In Deal';
      case 'WARRANTY_CLAIM':
        return 'Warranty Claim';
      case 'DATA_RECOVERY':
        return 'Data Recovery';
      case 'EXPRESS_REPAIR':
        return 'Express Repair';
      case 'BULK_AUCTION':
        return 'Mystery Lot';
      case 'ACCESSORY_BUYER':
        return 'Accessory Buyer';
    }
  }
  switch (type) {
    case 'SELLER':
      return 'Cihaz Satıyor';
    case 'BUYER':
      if (opts?.isBrandNew) return 'Sıfır Kutu Alıcısı';
      if (opts?.isVip) return 'VIP Alıcı';
      return 'Vitrin Alıcısı';
    case 'TRADE_IN':
      return 'Takas (Trade-In)';
    case 'WARRANTY_CLAIM':
      return 'Garanti & İade';
    case 'DATA_RECOVERY':
      return 'Veri Kurtarma';
    case 'EXPRESS_REPAIR':
      return 'Acil Servis';
    case 'BULK_AUCTION':
      return 'Toplu Mezat';
    case 'ACCESSORY_BUYER':
      return 'Aksesuar Alıcısı';
  }
}

/**
 * Translates common Turkish dynamic encounter/chat phrases on the fly when EN is active
 * so even saved Turkish encounters immediately read naturally in English!
 */
export function localizeDynamicLine(text: string, lang: Language): string {
  if (lang === 'tr' || !text) return text;
  // Already English if no Turkish diacritics and no common Turkish words
  if (!/[çğıöşüÇĞİÖŞÜ]/.test(text) && !/\b(abi|kardeş|telefon|fiyat|teklif|tamam|olmaz|kabul|çay|vitrin|kutu|garanti|ekran|pil)\b/i.test(text)) {
    return text;
  }

  // Extract any price/numbers to preserve accuracy in localized fallbacks
  const priceMatch = text.match(/[\d.,]+\s*₺/g);
  const priceStr = priceMatch ? priceMatch[priceMatch.length - 1] : '';

  if (/el sıkıştık|hayırlı olsun|tamamdır.*anlaştık|anlaştık!/i.test(text)) {
    return priceStr
      ? `Deal! Let's shake on ${priceStr}. Pleasure doing business!`
      : `Deal! Let's shake hands — pleasure doing business!`;
  }
  if (/çay|ikram|ince belli|soluklan/i.test(text)) {
    return priceStr
      ? `Thanks for the tea! Really appreciate the hospitality — I can move to ${priceStr} for you.`
      : `Thanks for the fresh tea! Really warms the conversation — let's talk numbers.`;
  }
  if (/kusur|çatlak|yan sanayi|sıvı|sensör|buğu|imei|pil|devir|koz/i.test(text) && /indir|düş|fiyat|haklı/i.test(text)) {
    return priceStr
      ? `Alright, fair point on that defect... I can drop my price to ${priceStr}.`
      : `Okay, you caught that defect fairly — let's adjust the price.`;
  }
  if (/kalkıyorum|satmıyorum|başka dükkan|vakit kaybet/i.test(text)) {
    return `Forget it, this isn't working out. I'll try another shop down the street!`;
  }
  if (/son fiyat|en fazla|en son|ortasını bul|bu kadar/i.test(text) && priceStr) {
    return `Meet me halfway here — the best I can do right now is ${priceStr}.`;
  }
  if (/satmak istiyorum|nakit lazım|elimde.*var|kaç verirsin/i.test(text)) {
    return priceStr
      ? `Hey boss, looking to sell this phone for quick cash. Asking ${priceStr} — want to inspect it?`
      : `Hey boss, looking to sell this phone today. Go ahead and check it out!`;
  }
  if (/vitrinde gördüm|almak istiyorum|etiket|pazarlık payı|hoşuma gitti/i.test(text)) {
    return priceStr
      ? `I spotted this phone in your showcase! Would you take ${priceStr} for it?`
      : `I spotted this phone in your showcase — any room to negotiate on the tag?`;
  }
  if (/takas|üste.*ver/i.test(text)) {
    return priceStr
      ? `I want to trade in my old phone toward your showcase model — how about ${priceStr} cash difference?`
      : `Looking to do a trade-in for your showcase device!`;
  }
  if (/aksesuar|kılıf|şarj|cam|kulaklık|powerbank/i.test(text)) {
    return priceStr
      ? `Hi! I picked out these accessories from your rack — ready to ring up ${priceStr}?`
      : `Hi! I'd like to grab these accessories from your display shelf.`;
  }
  if (/garanti|iade|ekran.*sorun|bozuldu/i.test(text)) {
    return `Hey, I bought this phone here recently and it started acting up — can you help under warranty?`;
  }
  if (/veri|fotoğraf|kurtar|açılmıyor/i.test(text)) {
    return priceStr
      ? `My phone won't boot and all my precious files are inside! Paying ${priceStr} if you recover them!`
      : `My phone won't turn on and my files are trapped inside — can you recover my data?`;
  }
  if (/acil|tamir|hemen.*lazım/i.test(text)) {
    return priceStr
      ? `Urgent repair needed! Can you fix this right now? I'm paying ${priceStr}.`
      : `Urgent repair needed — can you fix this on the spot?`;
  }
  if (/mezat|kutu.*lot|kapalı koli|toplu/i.test(text)) {
    return priceStr
      ? `Got a sealed mystery lot of used phones here — take the whole box for ${priceStr}!`
      : `Got a sealed mystery box of phones for auction — interested?`;
  }
  if (/teklifim|veriyorum|çıktım|indim/i.test(text) && priceStr) {
    return `Here is my offer: ${priceStr}. What do you say?`;
  }
  return priceStr
    ? `Let's talk numbers — I'm looking at ${priceStr} on this deal.`
    : `Let's work out a fair deal on this device.`;
}
