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
      tagline: 'Open with Dealership License · Sealed',
      description: 'Your first official dealer line. Factory-sealed entry devices with 24-month warranty.',
    },
    dist_samxung: {
      name: 'Samxung Official Regional Distributor',
      tagline: 'Shop Tier 2 & 3.4★ Rep',
      description: 'Order factory-sealed Galax A & S Ultra stock directly for high-margin retail.',
    },
    dist_aphone: {
      name: 'aPhone Authorized Dealer Channel',
      tagline: 'Shop Tier 3 & 3.9★ Rep',
      description: 'Direct distributor pricing on the city’s most sought-after sealed aPhone lineup.',
    },
    dist_luxury: {
      name: 'Global Luxury & Foldables Import',
      tagline: 'Shop Tier 4 & 4.3★ Rep',
      description: 'Exclusive supply channel for ultra-luxury foldables and flagship collector units.',
    },
  };
  return { ...base, ...(enMap[id] ?? {}) };
}

export function getLocalizedUpgrade(id: UpgradeId, lang: Language): ShopUpgrade {
  const base = SHOP_UPGRADES.find((u) => u.id === id) ?? SHOP_UPGRADES[0];
  if (lang === 'tr') return base;
  const enMap: Record<UpgradeId, { name: string; benefitText: string; summary: string }> = {
    repair_bench: {
      name: 'Pro ESD Repair Workbench',
      benefitText: 'Multi-defect in-shop repairs (+12% Master Craft) & Express Service jobs!',
      summary: 'Stop paying outsource fees — set up your own ESD repair desk and soldering station.',
    },
    tea_samovar: {
      name: 'Copper Tea Samovar',
      benefitText: 'Tea adds +38 patience and softens customer price stance by +4%.',
      summary: 'Brew fresh Turkish tea to win over even the toughest street hagglers.',
    },
    accessory_license: {
      name: 'Accessory Rack & Wholesale License',
      benefitText: 'Unlocks Accessory Wholesale, Retail Shelf & Phone Cross-Sell bundles!',
      summary: 'Officially open your screen protector, case, charger & earbuds rack for steady cashflow.',
    },
    pro_diagnostic: {
      name: 'Pro Diagnostic Station',
      benefitText: 'Unlocks "Scan All" shortcut & exact repair cost estimates.',
      summary: 'Desktop tester that scans screen, battery, IMEI & liquid sensors in one tap.',
    },
    display_cabinet: {
      name: 'Illuminated Glass Cabinet',
      benefitText: 'Permanently adds +2 showcase display slots.',
      summary: 'Install a locked glass display module beside the counter to list more phones.',
    },
    parts_wholesale: {
      name: 'Direct Parts Wholesale Line',
      benefitText: 'Permanent 30% discount on all workshop repair parts.',
      summary: 'Source original screens and batteries directly from parts wholesalers.',
    },
    neon_sign: {
      name: 'Social Media & Arcade Signage',
      benefitText: '+1 extra daily customer, more VIPs & stronger shelf sales.',
      summary: 'Turn your stall into the most talked-about tech & mobile spot in town.',
    },
    classifieds_license: {
      name: 'Classifieds & Intercity Cargo Permit',
      benefitText: 'Unlocks Yellow Classifieds hunting & high-margin Intercity Cargo orders!',
      summary: 'Access local bargain listings and verified nationwide COD cargo deals.',
    },
    cctv_security: {
      name: '4K Security & Fake IMEI Radar',
      benefitText: 'Cuts warranty claim risk by 40% & deters stubborn shady sellers.',
      summary: 'Smart entrance cameras & IMEI verification shield your shop from bad stock.',
    },
    auction_license: {
      name: 'Official Customs & Liquidation Auction Pass',
      benefitText: 'Unlocks the 6-tier Daily Auction Hall & sealed bulk device lots!',
      summary: 'Earn official bidding credentials for customs, telecom & VIP airport crates.',
    },
    brand_new_license: {
      name: 'Sealed Brand-New Dealership License',
      benefitText: 'Unlocks Factory-Sealed Brand Distributors & Flash Wholesale Deals!',
      summary: 'Move beyond 2nd-hand trading — become an authorized dealer for sealed retail phones.',
    },
    ultrasonic_cleaner: {
      name: 'Ultrasonic PCB Bath',
      benefitText: '-20% liquid/camera repair cost & +4% extra Master Craft value.',
      summary: 'High-frequency cleaning tank restores water-damaged boards cleanly.',
    },
    laser_backglass: {
      name: 'Laser Back-Glass Machine',
      benefitText: '-12% all repair costs & Master Hasan finishes 1 turn faster.',
      summary: 'Precision laser restores cracked rear glass & frames to factory finish.',
    },
    espresso_bar: {
      name: 'Customer Espresso & Lounge Bar',
      benefitText: 'Every customer arrives with +8 mood & +10 extra patience!',
      summary: 'Fresh espresso hospitality creates a relaxed showroom bargaining atmosphere.',
    },
    smart_pos_zero: {
      name: 'Smart POS (1% Commission Deal)',
      benefitText: 'Cuts credit card POS fee from 5% down to just 1%!',
      summary: 'Special merchant banking agreement slashes installment card fees.',
    },
    micro_soldering: {
      name: 'Microscope & BGA Soldering Station',
      benefitText: '+6% Master Craft resale value & 95% software data recovery rate!',
      summary: 'Chip-level micro-surgery workstation for premium flagship refurbishing.',
    },
    barcode_automation: {
      name: 'Barcode & Auto-Inventory POS',
      benefitText: '+35% end-of-day accessory shelf turnover & +10% cross-sell rate!',
      summary: 'Smart checkout & shelf analytics supercharge daily accessory volume.',
    },
    cloud_crm: {
      name: 'Cloud Customer Loyalty CRM',
      benefitText: 'Higher returning regular rate & +1 extra daily customer!',
      summary: 'Automated loyalty outreach brings satisfied buyers back to your counter.',
    },
    clean_room_lab: {
      name: 'ISO-5 Dust-Free Clean Room Lab',
      benefitText: '+35% Data Recovery & Express pay; all repairs auto-become Master Craft!',
      summary: 'Factory-grade dust-free lab trusted by customers across the entire city.',
    },
    vip_concierge: {
      name: 'VIP Desk & Concierge Consulting',
      benefitText: '+6% permanent buyer budgets & +2 daily VIP collector arrivals!',
      summary: 'Private flagship & foldable consulting lounge for high-net-worth buyers.',
    },
  };
  return { ...base, ...(enMap[id] ?? {}) };
}

export function getLocalizedDecoration(id: DecorationId, lang: Language): ShopDecoration {
  const base = SHOP_DECORATIONS.find((d) => d.id === id) ?? SHOP_DECORATIONS[0];
  if (lang === 'tr') return base;
  const enMap: Record<DecorationId, { name: string; summary: string; visualEffectText: string }> = {
    vintage_radio: {
      name: 'Vintage Arcade Radio (FM 94.2 / 98.8)',
      summary: 'Classic wooden shop radio. Switch between nostalgic Arabesk & 90s Pop tracks!',
      visualEffectText: 'Plays retro ambient radio audio and enriches your counter (+8 Prestige).',
    },
    tea_boiler: {
      name: 'Animated Copper Tea Boiler',
      summary: 'Simmering arcade copper tea boiler that periodically triggers a "Fresh tea brewed!" boost for shop morale!',
      visualEffectText: 'Steams live on the counter and grants periodic +4 Mood / +5 Patience boosts (+12 Prestige).',
    },
    prestige_plaque: {
      name: 'Prestige Era Wall Plaque',
      summary: 'Unlocks automatically with Prestige and evolves Bronze → Silver → Gold → Platinum!',
      visualEffectText: 'Hangs a metallic Prestige Plaque on your shop wall (+40 Prestige).',
    },
    vintage_sign: {
      name: 'Vintage Enamel GSM Sign',
      summary: 'Classic craftsman signboard that builds instant neighborhood trust.',
      visualEffectText: 'Displays glowing vintage signage above your counter (+15 Prestige).',
    },
    tea_corner: {
      name: 'Copper Samovar & Tea Corner',
      summary: 'Tulip tea glasses and evil-eye charm for classic arcade warmth.',
      visualEffectText: 'Adds a cozy tradesman corner motif to your shop scene (+20 Prestige).',
    },
    edison_lights: {
      name: 'Warm Edison Pendant Lights',
      summary: 'Amber architectural lighting that makes showcase phones gleam.',
      visualEffectText: 'Adds warm golden hanging lights across the ceiling (+25 Prestige).',
    },
    retro_shelf: {
      name: 'Retro 3310 Collector Shelf',
      summary: 'Display iconic GSM relics and conversation pieces behind the counter.',
      visualEffectText: 'Showcases a nostalgic retro phone shelf in the top-left (+32 Prestige).',
    },
    led_showcase: {
      name: 'Architectural LED Strip Frame',
      summary: 'Boutique-style illuminated trim for flagship phones & bundles.',
      visualEffectText: 'Frames your counter scene with architectural golden LED glow (+42 Prestige).',
    },
    vip_lounge: {
      name: 'Leather VIP Lounge & Pedestals',
      summary: 'Executive leather seating and lit glass pedestals for flagship appeal.',
      visualEffectText: 'Adds luxury gold VIP lounge accents to your showroom (+65 Prestige).',
    },
  };
  return { ...base, ...(enMap[id] ?? {}) };
}

export function getLocalizedStaff(id: StaffId, lang: Language): StaffMember {
  const base = SHOP_STAFF.find((s) => s.id === id) ?? SHOP_STAFF[0];
  if (lang === 'tr') return base;
  const enMap: Record<StaffId, { name: string; role: string; benefitText: string; summary: string }> = {
    apprentice: {
      name: 'Emre (Shop Apprentice)',
      role: 'Pre-Inspection & Rack Assistant',
      benefitText: 'Auto-scans seller tests & boosts accessory rack sales as he levels up.',
      summary: 'Pre-inspects incoming seller phones and keeps your accessory shelf moving.',
    },
    sales_rep: {
      name: 'Zeynep (Sales Advisor)',
      role: 'Showcase & Social Media Pro',
      benefitText: '+5% to +22% buyer budgets & +10% cross-sell conversion.',
      summary: 'Boosts cross-sell accessory conversion and convinces showroom buyers to pay more.',
    },
    master_tech: {
      name: 'Master Hasan',
      role: 'Senior Motherboard & Repair Tech',
      benefitText: 'Delegate multi-defect repairs — faster & up to -70% part cost.',
      summary: 'Handles workshop & express repairs in parallel while you close deals at the counter.',
    },
    accountant: {
      name: 'Selma (CPA Accountant)',
      role: 'Tax & Finance Advisor',
      benefitText: 'Cuts sales tax from 12% down to 6% & lowers weekly tax.',
      summary: 'Legally optimizes VAT & business deductions, cutting your tax burden per level.',
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
  const enMap: Record<
    MuseumItemId,
    {
      name: string;
      eraTag: string;
      rarityLabel: string;
      story: string;
      fullHistory: string;
      collectorPerk: string;
    }
  > = {
    nokya_3310: {
      name: 'Nokya 3310 (Indestructible)',
      eraTag: '2000 · Golden GSM Era',
      rarityLabel: 'Classic Relic',
      story: 'Dropped four stories into wet concrete, cracked the slab, not a scratch on the shell — still sitting at 48% battery since 2003.',
      fullHistory:
        'Rescued from a retired technician’s iron safe complete with its original thick-pin charger. Legend says it tumbled four stories onto a construction slab, cracked the concrete, snapped right back together, and resumed a Snake high score. Two bars of charge remain — veterans swear it hides a mini nuclear cell.',
      collectorPerk: 'Sparks counter nostalgia · +20 Prestige · +1,200 ₺/day showcase draw',
    },
    eriksun_t28: {
      name: 'ErikSun T28 Active Flip',
      eraTag: '1999 · Spring-Flip Revolution',
      rarityLabel: 'Rare Archive',
      story: 'Iconic side-button spring flip whose crisp "snap" turned every café head in 1999. Its previous owner built thumb muscles just flipping it.',
      fullHistory:
        'Weighing just 83 grams with a magnesium frame, the T28 was a pocket marvel in 1999. Found in a mysterious watchmaker’s drawer, its call log still holds only two missed calls: "Mr. X" and "Under the Bridge at 12:00". The spring flip still clicks like day one.',
      collectorPerk: 'Attracts vintage collectors · +30 Prestige · +2,600 ₺/day showcase income',
    },
    motorazr_v3: {
      name: 'MotoRazr V3 Razor-Thin',
      eraTag: '2004 · Anodized Aluminum Icon',
      rarityLabel: 'Design Legend',
      story: 'Nothing beats slamming a flip phone shut mid-argument. Its sapphire laser-etched keypad lights up the whole shop after dark!',
      fullHistory:
        'At 13.9 mm thin in 2004, critics couldn’t believe a real phone could look like precision jewelry. Acquired from a former film producer’s estate, it still hides draft SMS lines from an unreleased 2005 action thriller. Under glass, its glowing blue keypad steals the show.',
      collectorPerk: 'Design & influencer magnet · +45 Prestige · +4,800 ₺/day gallery draw',
    },
    blakberi_bold: {
      name: 'BlakBeri Bold Q-Keyboard',
      eraTag: '2008 · Executive & Trading Era',
      rarityLabel: 'VIP Archive Piece',
      story: 'That blinking red LED spiked blood pressure across every office tower in 2008. Rumor says its former CEO typed BBM messages in his sleep.',
      fullHistory:
        'Symbol of million-dollar deals in 2008, complete with sculpted QWERTY keys and stitched leatherette back. Sourced from a retired bank director’s vault; its trackball glides so smoothly locals joke it still checks stock quotes at midnight.',
      collectorPerk: 'Executive VIP trust · +65 Prestige · +8,500 ₺/day prestige bonus',
    },
    aphone_2g: {
      name: 'aPhone 2G First Edition (Sealed)',
      eraTag: '2007 · Touch Revolution',
      rarityLabel: 'Mythic · 1/1 Factory Sealed',
      story: 'In 2007 a collector swore "this box will buy an apartment one day" and locked it away unopened — he was right, and now it crowns your vitrine!',
      fullHistory:
        'From the historic June 29, 2007 first-500 production run, this 8 GB original still wears its unbroken factory cellophane wrap. Placing this legendary sealed centerpiece under glass elevates your store into the city’s most talked-about GSM landmark.',
      collectorPerk: 'Citywide museum landmark · +110 Prestige · +16,500 ₺/day',
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
  const enMap: Record<OutfitId, { name: string; subtitle: string; bonusDescription: string }> = {
    casual_hoodie: {
      name: 'Arcade Street Hoodie',
      subtitle: 'Age-23 Young Founder Look',
      bonusDescription: '+7 starting mood with Students & Influencers, +3 with everyone else.',
    },
    traditional_vest: {
      name: 'Master Craftsman Vest',
      subtitle: 'Classic Arcade Trust',
      bonusDescription: '+11 mood & +8 patience with neighborhood Uncles and Hustlers.',
    },
    tech_esd_coat: {
      name: 'Anti-Static Tech Lab Coat',
      subtitle: 'Micro-Surgery Service Aura',
      bonusDescription: '+6 mood & +6 patience across all customers; softer defect haggling.',
    },
    formal_shirt: {
      name: 'Crisp Showroom Shirt',
      subtitle: 'High-Street Boutique Style',
      bonusDescription: '+8 mood & +8 patience for all; +13 trust with VIPs & Influencers!',
    },
    italian_blazer: {
      name: 'Tailored Italian Blazer',
      subtitle: 'Showroom Director Elegance',
      bonusDescription: '+16 starting mood with VIPs & Influencers; +11 mood & +10 patience overall.',
    },
    boss_suit: {
      name: 'GSM Emperor Three-Piece Suit',
      subtitle: 'Plaza & Holding Prestige',
      bonusDescription: '+15 mood, +14 patience & executive authority with every customer type!',
    },
  };
  return { ...base, ...(enMap[id] ?? {}) };
}

export function getLocalizedLevelPerk(level: number, lang: Language): LevelPerk {
  const base = LEVEL_PERKS.find((p) => p.level === level) ?? LEVEL_PERKS[0];
  if (lang === 'tr') return base;
  const enMap: Record<number, { title: string; description: string }> = {
    1: {
      title: 'First Shutter · 2nd-Hand Trade Only',
      description: 'Start from scratch inspecting, repairing & trading 2nd-hand phones in your 12 m² stall.',
    },
    2: {
      title: 'Upgrades, Accessory License & First Staff',
      description: 'Unlocks Upgrades & Supply tabs! Buy the 18,000 ₺ Accessory License, hire Emre & add decor.',
    },
    3: {
      title: 'Corner Store (Tier 2) + Car Mount + -10% Parts',
      description: 'Unlocks Corner Tech Shop (85,000 ₺), Car Mount, 4K Security Radar & 10% repair part discount.',
    },
    4: {
      title: 'Sealed Dealership License + Market & Bank',
      description: 'Unlocks Market tab (Classifieds, Auctions, Bank, Branches), 65,000 ₺ Sealed License & Zeynep!',
    },
    5: {
      title: 'High-Street Hub + Master Hasan + Espresso',
      description: 'Unlocks High-Street GSM Hub (240,000 ₺), Master Hasan, Powerbank, Laser Machine & Espresso Bar!',
    },
    6: {
      title: 'ANC Earbuds + Luxury Import + 1% POS',
      description: 'Unlocks ANC Earbuds, Luxury Foldables dealer (4.0★), Smart POS & +1 extra daily customer!',
    },
    7: {
      title: 'Regional Showroom + CPA + -4% Wholesale',
      description: 'Unlocks Regional Showroom (650,000 ₺), CPA Selma, Barcode POS & extra 4% dealer discount.',
    },
    8: {
      title: 'Streak Master (x1.5) + Clean Room & CRM',
      description: 'Deal streak bonuses pay +50%! Unlocks Clean Room Lab, Cloud CRM & VIP Leather Lounge decor.',
    },
    9: {
      title: 'Mall Flagship + VIP Concierge + City Legend',
      description: 'Unlocks Mall Flagship (1.6M ₺), VIP Desk, Boss Suit & +6% permanent buyer budget boost!',
    },
    10: {
      title: 'GSM Plaza Empire (Grandmaster Peak)',
      description: 'Unlocks GSM Plaza HQ (4.0M ₺), extra -4% distributor discount & +1 extra daily customer!',
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
        'After 5 years learning under Master Cemal, you opened your own arcade shutter. First step: inspect 2nd-hand phones, haggle hard, and grow your starting capital!',
      mentorNote:
        'Master Cemal: "Kid, warm up your instincts on 2nd-hand phones first. Spot defects, cut the price, build up your register — once you save 45,000 ₺ we’ll open the accessory rack!"',
      objectiveText: 'Sell a total of 3 phones from your showcase',
    },
    ch_2_own_bench: {
      title: 'Chapter 2: Your Own Screwdriver',
      subtitle: 'Stop outsourcing repairs and keep the craft margin',
      narrative:
        'Time to turn the board & screen skills you learned into real cash. Restore faulty phones in your workshop or express counter for big resale jumps.',
      mentorNote:
        'Master Cemal: "Everyone runs from cracked screens — a real technician sees the margin hiding inside. Steady heat, don’t tear the flex!"',
      objectiveText: 'Complete 3 phone repairs at your workshop or express counter',
    },
    ch_3_accessory_shelf: {
      title: 'Chapter 3: The Accessory Rack',
      subtitle: 'Tempered glass, cases & chargers keep cash flowing',
      narrative:
        'Buy the 45,000 ₺ Accessory License to swing open wholesale doors! Expand your store tier to unlock car mounts, GaN chargers, powerbanks & ANC earbuds.',
      mentorNote:
        'Master Cemal: "Phones bring the glory, kid, but cases and screen protectors always pay the rent. Never let the rack run dry!"',
      objectiveText: 'Sell a total of 8 phone accessories',
    },
    ch_4_brand_dealer: {
      title: 'Chapter 4: Sealed-Box Dealership',
      subtitle: 'Step beyond 2nd-hand into official factory-sealed stock',
      narrative:
        'Purchase the 220,000 ₺ Official Dealership License to stock 24-month warranty sealed phones directly from distributors and elevate your showcase.',
      mentorNote:
        'Master Cemal: "Factory-sealed boxes build instant credibility. Bundle a case and fast charger alongside one and they’ll be customers for life!"',
      objectiveText: 'Sell 3 factory-sealed Brand-New phones from distributors',
    },
    ch_5_showroom_boss: {
      title: 'Chapter 5: GSM Empire',
      subtitle: 'High-Street Showroom & Technical Service Leader',
      narrative:
        'Appraisal, micro-soldering, customs auctions, city branches, and official brand distribution under one roof! Upgrade to Shop Tier 3 "High-Street GSM Store".',
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
      description: 'Sell your first 2nd-hand phone from the showcase and ring the register.',
    },
    ms_defect_hunter: {
      title: 'Eagle-Eyed Appraiser',
      description: 'Expose 5 hidden defects during inspection and use them as leverage.',
    },
    ms_micro_surgeon: {
      title: 'Micro-Soldering Surgeon',
      description: 'Repair a total of 4 phone defects across workshop or express jobs.',
    },
    ms_hot_streak: {
      title: 'Unstoppable Streak (5x)',
      description: 'Reach a 5x consecutive successful deal streak without losing a customer.',
    },
    ms_sales_10: {
      title: 'Trusted Arcade Name (10 Sales)',
      description: 'Close a total of 10 smartphone sales across your career.',
    },
    ms_acc_king: {
      title: 'Accessory Rack Master (20 Sold)',
      description: 'After unlocking your Accessory License, sell a total of 20 accessories.',
    },
    ms_collector_8: {
      title: 'Model Catalog Explorer (8 Models)',
      description: 'Discover and handle 8 different phone models in your career.',
    },
    ms_profit_60k: {
      title: 'Golden Counter (60,000 ₺ Profit)',
      description: 'Earn 60,000 ₺ in cumulative net trading profit.',
    },
    ms_defect_20: {
      title: 'Detective Legend (20 Defects)',
      description: 'Expose 20 hidden defects to bust shady seller bluffs.',
    },
    ms_brand_new_dealer: {
      title: 'Authorized Sealed Dealer (4 Units)',
      description: 'Sell 4 factory-sealed brand-new phones with your Dealership License.',
    },
    ms_repair_15: {
      title: 'Head Technical Service (15 Repairs)',
      description: 'Bring 15 faulty smartphones back to life in your workshop or express desk.',
    },
    ms_tier3_showroom: {
      title: 'High-Street Hub Boss',
      description: 'Expand your business to the Tier 3 "High-Street GSM Hub".',
    },
    ms_sales_30: {
      title: 'Citywide Trader (30 Sales)',
      description: 'Sell 30 phones to become the busiest mobile counter in town.',
    },
    ms_acc_80: {
      title: 'Accessory Powerhouse (80 Sold)',
      description: 'Sell a cumulative total of 80 cases, protectors, chargers & earbuds.',
    },
    ms_profit_350k: {
      title: 'Regional Capital (350,000 ₺ Profit)',
      description: 'Reach 350,000 ₺ in cumulative net trading profit.',
    },
    ms_brand_new_15: {
      title: 'Official Distributor Leader (15 Sealed)',
      description: 'Close 15 factory-sealed brand-new smartphone sales.',
    },
    ms_profit_1m: {
      title: 'Millionaire Dealer (1.2M ₺ Profit)',
      description: 'Cross 1,200,000 ₺ in cumulative net career profit!',
    },
    ms_tier5_flagship: {
      title: 'Mall Flagship & Plaza Vision',
      description: 'Open your Tier 5 Mall Flagship store to enter the big leagues!',
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
