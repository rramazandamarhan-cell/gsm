import {
  AccessorySpec,
  BankLoanOffer,
  BranchSpec,
  BrandDistributor,
  CareerMilestone,
  CustomerArchetype,
  CustomerArchetypeId,
  CustomModId,
  CustomModSpec,
  DailyMarketEvent,
  DataRecoveryJob,
  DefectDefinition,
  DefectId,
  EncounterType,
  LegacyPathId,
  LegacyPathInfo,
  LevelPerk,
  MuseumItemSpec,
  NegotiationTone,
  OutfitId,
  OutfitSpec,
  PhoneModelSpec,
  RandomStoreEvent,
  ShopDecoration,
  ShopTier,
  ShopTierInfo,
  ShopUpgrade,
  StaffMember,
  StoreAchievementSpec,
  StoryChapter,
} from './types';

export const MUSEUM_BANNER_IMAGE =
  '/src/assets/images/museum_retro_showcase_1795476278430.jpg';
export const DECOR_BANNER_IMAGE =
  '/src/assets/images/decor_shop_ambiance_1795476278909.jpg';
export const OUTFITS_BANNER_IMAGE =
  '/src/assets/images/merchant_outfits_rack_1795476278731.jpg';
export const FLAGSHIP_INTERIOR_IMAGE =
  '/src/assets/images/shop_flagship_interior_1795476278004.jpg';

export const SHOP_TIERS: Record<ShopTier, ShopTierInfo> = {
  1: {
    tier: 1,
    name: 'Küçük Pasaj Standı',
    cost: 0,
    minReputation: 1.0,
    minLevel: 1,
    renovationDays: 0,
    backdropPath: '/src/assets/images/shop_counter_backdrop_1795453524289.jpg',
    showcaseSlots: 3,
    dailyCustomers: 12,
    baseRent: 1100,
    prestigeBonus: 10,
    description:
      '23 yaşında ilk kiraladığın 12 m² pasaj dükkanı. Düşük kira, sıcak esnaf atmosferi.',
    unlocksText: '3 Vitrin Rafı · Günde 12 Müşteri · Temel Aksesuar Standı',
  },
  2: {
    tier: 2,
    name: 'Köşe Teknoloji Dükkanı',
    cost: 85000,
    minReputation: 3.3,
    minLevel: 3,
    renovationDays: 2,
    backdropPath: '/src/assets/images/shop_tier2_corner_1795455392009.jpg',
    showcaseSlots: 5,
    dailyCustomers: 14,
    baseRent: 2600,
    prestigeBonus: 35,
    description:
      'Caddeye bakan geniş vitrinli köşe mağaza. Hem sıfır kutu hem 2. el hem aksesuar trafiği katlanır.',
    unlocksText: '5 Vitrin Rafı · Günde 14 Müşteri · 2 Gün Tadilat · +35 Prestij',
  },
  3: {
    tier: 3,
    name: 'Cadde GSM Merkezi',
    cost: 240000,
    minReputation: 3.9,
    minLevel: 5,
    renovationDays: 2,
    backdropPath: '/src/assets/images/shop_tier3_showroom_1795455391998.jpg',
    showcaseSlots: 8,
    dailyCustomers: 15,
    baseRent: 5200,
    prestigeBonus: 70,
    description:
      'İki katlı cadde mağazası ve cam bölmeli teknik servis istasyonu. Kurumsal müşterilerin gözdesi.',
    unlocksText: '8 Vitrin Rafı · Günde 15 Müşteri · 2 Gün Tadilat · +70 Prestij',
  },
  4: {
    tier: 4,
    name: 'Bölge GSM Showroom',
    cost: 650000,
    minReputation: 4.3,
    minLevel: 7,
    renovationDays: 3,
    backdropPath: FLAGSHIP_INTERIOR_IMAGE,
    showcaseSlots: 11,
    dailyCustomers: 17,
    baseRent: 9800,
    prestigeBonus: 120,
    description:
      'Ceviz ahşap ve pirinç detaylı dev bölge showroom’u. VIP koleksiyonerler ve toplu alıcılar akın eder.',
    unlocksText: '11 Vitrin Rafı · Günde 17 Müşteri · 3 Gün Tadilat · +120 Prestij',
  },
  5: {
    tier: 5,
    name: 'AVM Flagship Teknoloji',
    cost: 1600000,
    minReputation: 4.6,
    minLevel: 9,
    renovationDays: 3,
    backdropPath: FLAGSHIP_INTERIOR_IMAGE,
    showcaseSlots: 14,
    dailyCustomers: 18,
    baseRent: 17500,
    prestigeBonus: 185,
    description:
      'Şehrin en prestijli AVM girişindeki dev amiral gemisi mağazası. Sıfır kutu ve lüks satış rekorları!',
    unlocksText: '14 Vitrin Rafı · Günde 18 Müşteri · 3 Gün Tadilat · +185 Prestij',
  },
  6: {
    tier: 6,
    name: 'GSM Plaza Genel Merkezi',
    cost: 4000000,
    minReputation: 4.8,
    minLevel: 10,
    renovationDays: 4,
    backdropPath: FLAGSHIP_INTERIOR_IMAGE,
    showcaseSlots: 18,
    dailyCustomers: 20,
    baseRent: 32000,
    prestigeBonus: 280,
    description:
      'Kendi adınla açılan çok katlı GSM Plaza! Milyonluk krediler, dev vitrin ve Türkiye’nin en büyük servis merkezi.',
    unlocksText: '18 Vitrin Rafı · Günde 20 Müşteri · 4 Gün Tadilat · +280 Prestij',
  },
};

export const SHOP_BACKDROP_IMAGE = SHOP_TIERS[1].backdropPath;

export const VICTORY_CASH_GOAL = 4000000;
export const VICTORY_REPUTATION_GOAL = 4.8;
export const STARTING_CASH = 16500;

// 23-YEAR-OLD ORIGIN LEGACY PATHS
export const LEGACY_PATHS: Record<LegacyPathId, LegacyPathInfo> = {
  EX_APPRENTICE: {
    id: 'EX_APPRENTICE',
    name: 'Eski Çırak',
    title: 'Cemal Usta’nın Sağ Kolu',
    yearsSummary: '18–23 Yaş · 5 Yıl Tornavida & Anakart Tezgahı',
    tagline: 'Gözün kapalı ekran söker, arızalı cihazdan servet çıkarırsın.',
    passiveTitle: 'Usta Eli · -%20 Tamir & Hızlı Mikro-Onarım',
    passiveDetail:
      'Tüm küçük onarımlar %20 daha ucuz; Mikro Tamir Masasında ısıtma %45 daha hızlı ve kalibrasyon yeşil bölgesi %40 daha geniştir.',
    dialogueName: 'Teknik Usta İknası',
    dialoguePreview:
      'Tezgahta cihazın iç donanımını usta gözüyle anlatarak ruh halini +12 iyileştirir ve fiyatı %7 lehine çeker.',
    accentColor: 'amber',
  },
  BORN_MERCHANT: {
    id: 'BORN_MERCHANT',
    name: 'Doğuştan Tüccar',
    title: 'Pasajın Pazarlık Kurdu',
    yearsSummary: '18–23 Yaş · 5 Yıl Tahtakale Toptan & Vitrin Ticareti',
    tagline: 'Malı alırken kazanırsın; toptancıların telefon rehberindeki ilk isimsin.',
    passiveTitle: 'Toptancı Ağı · -%10 Aksesuar & -%6 Sıfır Bayi İskontosu',
    passiveDetail:
      'Toptancıdaki tüm aksesuarlar kalıcı %10 indirimli, sıfır kutu marka distribütörleri ekstra %6 daha ucuz gelir.',
    dialogueName: 'Toptancı Piyasa Resti',
    dialoguePreview:
      'Gerçek piyasa verisi ve peşin nakit gücüyle müşterinin gizli sınırını %8 esnetip net fiyat avantajı koparır.',
    accentColor: 'emerald',
  },
  SOCIAL_HUSTLER: {
    id: 'SOCIAL_HUSTLER',
    name: 'Mahalle Esnafı',
    title: 'Tatlı Dil & Müdavim Mıknatısı',
    yearsSummary: '18–23 Yaş · 5 Yıl Tezgah Önü & Semt Çevresi',
    tagline: 'Dükkana giren herkes dost çıkar; kılıfı da camı da gülerek alır.',
    passiveTitle: 'Sıcak Karşılama · +10 Ruh Hali & +%18 Çapraz Satış',
    passiveDetail:
      'Müşteriler +10 daha keyifli ruh haliyle başlar, telefon yanına aksesuar satma şansı +%18 artar ve ekstra itibar kazanırsın.',
    dialogueName: 'Gönül Alan Esnaf Paketi',
    dialoguePreview:
      'Samimi muhabbet ve satış sonrası güvenceyle Müşteri Ruh Halini +22, sabrı +18 tazeler ve fiyatı %6 yumuşatır.',
    accentColor: 'sky',
  },
};

export const LEGACY_PATH_LIST: LegacyPathInfo[] = [
  LEGACY_PATHS.EX_APPRENTICE,
  LEGACY_PATHS.BORN_MERCHANT,
  LEGACY_PATHS.SOCIAL_HUSTLER,
];

export const NEGOTIATION_TONES: Record<
  NegotiationTone,
  {
    id: NegotiationTone;
    label: string;
    shortHint: string;
    moodEffectText: string;
  }
> = {
  friendly: {
    id: 'friendly',
    label: 'Samimi',
    shortHint: 'Ruh halini ısıtır, sabrı korur',
    moodEffectText: 'Tatlı dil & esnaf sıcaklığı',
  },
  analytical: {
    id: 'analytical',
    label: 'Analitik',
    shortHint: 'Test & piyasa verisiyle ikna eder',
    moodEffectText: 'Gerçekçi teknik argüman',
  },
  firm: {
    id: 'firm',
    label: 'Sert',
    shortHint: 'Büyük fiyat oynatır ama ruh halini gerer',
    moodEffectText: 'Net & tavizsiz pazarlık',
  },
};

export const CUSTOMER_REVIEW_COMMENTS = {
  fiveStar: [
    '23 yaşında ama 40 yıllık esnaf gibi! Çayını içtik, tertemiz anlaştık.',
    'Ne dediyse o çıktı, ne şişirme fiyat ne gizli kusur. Pasajın en dürüst dükkanı!',
    'Hem telefonda güzellik yaptı hem yanında kılıf cam taktık, 10 numara hizmet.',
    'Pazarlıkta hiç germeden güler yüzle orta yolu bulduk, herkese tavsiye ederim.',
  ],
  fourStar: [
    'Pazarlık biraz çetin geçti ama sonunda ikimiz de memnun ayrıldık.',
    'Güvenilir dükkan, cihazı gözümün önünde test etti. Gönül rahatlığıyla alınır.',
    'Esnaf dediğin böyle olur, işini biliyor. Bir dahaki sefere yine uğrarım.',
  ],
  threeStar: [
    'Fiyatta pek esnemedi ama en azından cihazın hakkını veriyor.',
    'Biraz sıkı pazarlıkçı ama malı sağlam, işimiz görüldü.',
  ],
  lowStar: [
    'Pazarlık üslubu fazla sertti, anlaşamadan kalktım.',
    'Bekletip durdu, fiyat da hiç tatmin etmedi. Başka dükkana geçtim.',
  ],
};

export const PHONE_CATALOG: PhoneModelSpec[] = [
  {
    id: 'redmix_note_12',
    brand: 'RedMix',
    model: 'Note 12',
    storage: '128 GB',
    tier: 'entry',
    baseValue: 7500,
    bodyColor: '#334155',
    accentColor: '#64748B',
    cameraLayout: 'dual',
    releaseDay: 1,
  },
  {
    id: 'samxung_a34',
    brand: 'Samxung',
    model: 'Galax A34',
    storage: '128 GB',
    tier: 'entry',
    baseValue: 9500,
    bodyColor: '#2E4057',
    accentColor: '#7FA1C3',
    cameraLayout: 'triple',
    releaseDay: 1,
  },
  {
    id: 'pocopop_x5',
    brand: 'PocoPop',
    model: 'X5 Pro',
    storage: '256 GB',
    tier: 'entry',
    baseValue: 11000,
    bodyColor: '#3D3522',
    accentColor: '#D97706',
    cameraLayout: 'dual',
    releaseDay: 1,
  },
  {
    id: 'aphone_12',
    brand: 'aPhone',
    model: '12',
    storage: '128 GB',
    tier: 'mid',
    baseValue: 18500,
    bodyColor: '#1E293B',
    accentColor: '#94A3B8',
    cameraLayout: 'dual',
    releaseDay: 1,
  },
  {
    id: 'samxung_s23_fe',
    brand: 'Samxung',
    model: 'S23 FE',
    storage: '256 GB',
    tier: 'mid',
    baseValue: 17000,
    bodyColor: '#263830',
    accentColor: '#6EE7B7',
    cameraLayout: 'triple',
    releaseDay: 1,
  },
  {
    id: 'aphone_13',
    brand: 'aPhone',
    model: '13',
    storage: '128 GB',
    tier: 'mid',
    baseValue: 24500,
    bodyColor: '#3B2F2F',
    accentColor: '#D6B89C',
    cameraLayout: 'dual',
    releaseDay: 2,
  },
  {
    id: 'aphone_14_pro',
    brand: 'aPhone',
    model: '14 Pro',
    storage: '256 GB',
    tier: 'flagship',
    baseValue: 36500,
    bodyColor: '#2B2433',
    accentColor: '#A78BFA',
    cameraLayout: 'triple',
    releaseDay: 2,
  },
  {
    id: 'samxung_s24_ultra',
    brand: 'Samxung',
    model: 'S24 Ultra',
    storage: '512 GB',
    tier: 'flagship',
    baseValue: 45000,
    bodyColor: '#3A3834',
    accentColor: '#D6C7B2',
    cameraLayout: 'ultra',
    releaseDay: 4,
  },
  {
    id: 'aphone_15_pro',
    brand: 'aPhone',
    model: '15 Pro',
    storage: '256 GB',
    tier: 'flagship',
    baseValue: 50000,
    bodyColor: '#36393E',
    accentColor: '#CBD5E1',
    cameraLayout: 'triple',
    releaseDay: 4,
  },
  {
    id: 'foldz_5',
    brand: 'FoldZ',
    model: '5 Titanyum',
    storage: '512 GB',
    tier: 'luxury',
    baseValue: 58000,
    bodyColor: '#1E2530',
    accentColor: '#F59E0B',
    cameraLayout: 'fold',
    releaseDay: 6,
  },
  {
    id: 'leicacam_15',
    brand: 'LuminaCam',
    model: '15 Ultra',
    storage: '512 GB',
    tier: 'luxury',
    baseValue: 62000,
    bodyColor: '#232826',
    accentColor: '#E5C39C',
    cameraLayout: 'ultra',
    releaseDay: 6,
  },
  {
    id: 'aphone_16_pro_max',
    brand: 'aPhone',
    model: '16 Pro Max',
    storage: '1 TB',
    tier: 'luxury',
    baseValue: 74000,
    bodyColor: '#4A3B31',
    accentColor: '#E5C39C',
    cameraLayout: 'triple',
    releaseDay: 8,
  },
  {
    id: 'novafold_quantum',
    brand: 'NovaFold',
    model: 'Quantum X',
    storage: '1 TB',
    tier: 'luxury',
    baseValue: 82000,
    bodyColor: '#1D2233',
    accentColor: '#F59E0B',
    cameraLayout: 'fold',
    releaseDay: 8,
  },
];

// PHONE ACCESSORY RETAIL CATALOG
export const ACCESSORY_CATALOG: AccessorySpec[] = [
  {
    id: 'tempered_glass',
    name: '9H Hayalet Kırılmaz Cam',
    category: 'Ekran Koruma',
    shelfGroup: 'protection',
    minLevel: 2,
    wholesaleCost: 65,
    recommendedPrice: 250,
    minPrice: 120,
    maxPrice: 450,
    description: 'Telefon alan neredeyse herkes ister. En hızlı dönen, en yüksek yüzdeli esnaf ürünü.',
    demandWeight: 1.4,
  },
  {
    id: 'magsafe_case',
    name: 'MagKlik Silikon Kılıf',
    category: 'Kılıf & Koruma',
    shelfGroup: 'protection',
    minLevel: 2,
    wholesaleCost: 145,
    recommendedPrice: 450,
    minPrice: 220,
    maxPrice: 750,
    description: 'Kadife iç astarlı, mıknatıslı premium kılıf. Gençler ve fenomenler bayılır.',
    demandWeight: 1.25,
  },
  {
    id: 'car_mount',
    name: 'Manyetik Araç Tutucu',
    category: 'Araç Aksesuarı',
    shelfGroup: 'protection',
    minLevel: 3,
    wholesaleCost: 220,
    recommendedPrice: 600,
    minPrice: 320,
    maxPrice: 950,
    description: 'Hava ızgarasına takılan sağlam mıknatıslı tutucu. Sürücüler tezgaha uğrayıp alır.',
    demandWeight: 0.95,
  },
  {
    id: 'gan_charger',
    name: '30W GaN Hızlı Şarj Seti',
    category: 'Güç & Kablo',
    shelfGroup: 'power',
    minLevel: 4,
    wholesaleCost: 290,
    recommendedPrice: 780,
    minPrice: 420,
    maxPrice: 1250,
    description: 'Yeni kutulardan adaptör çıkmadığı için her gün sorulan hızlı şarj adaptörü + örgülü kablo.',
    demandWeight: 1.15,
  },
  {
    id: 'powerbank',
    name: '10.000 mAh Mini Powerbank',
    category: 'Taşınabilir Güç',
    shelfGroup: 'power',
    minLevel: 5,
    wholesaleCost: 480,
    recommendedPrice: 1180,
    minPrice: 650,
    maxPrice: 1800,
    description: 'PD hızlı şarj destekli cep boy powerbank. Seyahat ve üniversite dönemlerinde yok satar.',
    demandWeight: 0.85,
  },
  {
    id: 'tws_earbuds',
    name: 'ANC Bluetooth Kulaklık',
    category: 'Ses & Kulaklık',
    shelfGroup: 'audio',
    minLevel: 6,
    wholesaleCost: 640,
    recommendedPrice: 1600,
    minPrice: 880,
    maxPrice: 2450,
    description: 'Gürültü engelleme özellikli kablosuz kulaklık. Tek satışta yüksek nakit bırakır.',
    demandWeight: 0.78,
  },
];

// OFFICIAL BRAND-NEW SEALED PHONE DISTRIBUTORS
export const BRAND_DISTRIBUTORS: BrandDistributor[] = [
  {
    id: 'dist_budget',
    name: 'Anadolu GSM Toptan (RedMix & PocoPop)',
    brands: ['RedMix', 'PocoPop'],
    minLevel: 2,
    minReputation: 1.0,
    wholesaleRatio: 0.93,
    tagline: 'Sv. 2 ile Açılır · Sıfır Kapalı Kutu',
    description: 'Cemal Usta’nın referansıyla açılan ilk resmi toptancın. 24 ay TR garantili sıfır giriş seviyesi cihazlar.',
  },
  {
    id: 'dist_samxung',
    name: 'Samxung Türkiye Yetkili Distribütörü',
    brands: ['Samxung'],
    minLevel: 3,
    minReputation: 3.1,
    wholesaleRatio: 0.91,
    tagline: 'Sv. 3 & 3.1★ İtibar ile Açılır',
    description: 'Galax A ve S Ultra serilerini fabrikadan kapalı kutu çekip sıfır vitrininde yüksek kârla sat.',
  },
  {
    id: 'dist_aphone',
    name: 'aPhone Yetkili Bayilik Hattı',
    brands: ['aPhone'],
    minLevel: 4,
    minReputation: 3.5,
    wholesaleRatio: 0.9,
    tagline: 'Sv. 4 & 3.5★ İtibar ile Açılır',
    description: 'Şehrin en çok aranan kapalı kutu aPhone serilerine doğrudan distribütör fiyatından erişim.',
  },
  {
    id: 'dist_luxury',
    name: 'Global Lüks & Katlanabilir İthalat',
    brands: ['FoldZ', 'LuminaCam', 'NovaFold'],
    minLevel: 6,
    minReputation: 4.0,
    wholesaleRatio: 0.88,
    tagline: 'Sv. 6 & 4.0★ İtibar ile Açılır',
    description: 'VIP koleksiyonerlerin peşinde olduğu ultra lüks ve katlanabilir sıfır cihazların özel tedarik hattı.',
  },
];

// 23-YEAR-OLD PROTAGONIST STORY CHAPTERS
export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 'ch_1_first_shutter',
    chapterNumber: 1,
    title: 'Bölüm 1: İlk Kepenk (23 Yaş)',
    subtitle: '5 yıllık çıraklıktan kendi 12 m² pasaj dükkanına',
    narrative:
      'Liseden sonra Cemal Usta’nın yanında 5 yıl pişip biriktirdiğin sermayeyle kendi kepengini açtın. Önce 2. el telefonları incele, ucuza kapat, vitrine koy ve ilk sıcak satışlarını yap!',
    mentorNote:
      'Cemal Usta: "Evlat, önce 2. el al-satta elin ısınsın. Kusuru yakala, fiyatı kır, vitrinden ilk iki telefonunu satıp Sv. 2 olunca toptancıdan kılıf ve kırılmaz cam bağlarız!"',
    objectiveText: 'Vitrinden toplam 2 adet telefon satıp kasayı döndür',
    rewardCash: 2400,
    rewardXp: 130,
    metric: 'totalPhonesSold',
    target: 2,
  },
  {
    id: 'ch_2_own_bench',
    chapterNumber: 2,
    title: 'Bölüm 2: Kendi Tornavidan',
    subtitle: 'Dış tamirciye muhtaç kalmadan usta işçiliği',
    narrative:
      'Eski ustadan öğrendiğin anakart ve ekran bilgisini artık kendi kasana yazma vakti. Arızalı cihazları hayata döndürüp Sv. 2 ile açılan aksesuar reyonunu doldurmaya hazırlan!',
    mentorNote:
      'Cemal Usta: "Kırık ekranlı cihazdan herkes kaçar, gerçek usta oradaki kârı görür. Sıcak havayı dengeli tut, flexi koparma!"',
    objectiveText: 'Atölyede veya acil serviste toplam 2 telefon onarımı tamamla',
    rewardCash: 3500,
    rewardXp: 165,
    metric: 'totalPhonesRepaired',
    target: 2,
  },
  {
    id: 'ch_3_accessory_shelf',
    chapterNumber: 3,
    title: 'Bölüm 3: Aksesuar Reyonu',
    subtitle: 'Kırılmaz cam, kılıf ve şarj aletleriyle nakit akışı',
    narrative:
      'Seviye atladıkça toptancı kapıları açılıyor! Önce cam & kılıf, sonra araç tutucu, GaN şarj, powerbank ve kulaklıklarla reyonunu büyütüp çapraz satış yap.',
    mentorNote:
      'Cemal Usta: "Büyük parayı telefondan kazanırsın ama dükkanın kirasını her zaman kılıf, kırılmaz cam ve şarj aleti çıkarır. Reyonu boş bırakma!"',
    objectiveText: 'Toptancıdan getirdiğin toplam 5 adet telefon aksesuarı sat',
    rewardCash: 4800,
    rewardXp: 210,
    metric: 'totalAccessoriesSold',
    target: 5,
  },
  {
    id: 'ch_4_brand_dealer',
    chapterNumber: 4,
    title: 'Bölüm 4: Sıfır Kutu Bayiliği',
    subtitle: 'Sadece 2. el değil, resmi marka distribütörlüğü',
    narrative:
      'Artık pasajda sadece eski telefon alıp satan bir genç değilsin. Toptancı sekmesinden sıfır, 24 ay garantili kapalı kutu telefonlar çekip vitrinini üst lige taşı!',
    mentorNote:
      'Cemal Usta: "Kapalı kutu sıfır telefon vitrine güven verir. Yanına bir de kılıf ve hızlı şarj sattın mı, müşteri buradan bir daha şaşmaz!"',
    objectiveText: 'Distribütörden aldığın toplam 2 adet Sıfır Kapalı Kutu telefon sat',
    rewardCash: 7500,
    rewardXp: 280,
    metric: 'totalBrandNewSold',
    target: 2,
  },
  {
    id: 'ch_5_showroom_boss',
    chapterNumber: 5,
    title: 'Bölüm 5: GSM İmparatorluğu',
    subtitle: 'Şehrin zirvesindeki Showroom & Teknik Servis',
    narrative:
      '2. el ekspertiz, mikro cerrahi tamir, zengin aksesuar reyonu ve resmi marka bayiliği tek çatı altında! Dükkanını 3. Seviye üzerine taşıyarak adını sektöre altın harflerle yaz.',
    mentorNote:
      'Cemal Usta: "Artık benim sana öğreteceğim bir şey kalmadı. Şehrin yeni kralı sensin, kepengin hep bereketle açılsın!"',
    objectiveText: '3. Seviye "Cadde GSM Mağazası" veya üstü şubeye geç',
    rewardCash: 18000,
    rewardXp: 500,
    metric: 'shopTier',
    target: 3,
  },
];

export const DEFECT_CATALOG: Record<DefectId, DefectDefinition> = {
  screen_crack: {
    id: 'screen_crack',
    category: 'screen',
    name: 'Ön Cam Çatlağı',
    shortLabel: 'Çatlak Cam',
    description: 'Ekranda belirgin çatlak hattı ve dokunmatik hassasiyet kaybı var.',
    valuePenaltyRatio: 0.2,
    repairCost: 2200,
    repairable: true,
    leverageLine: 'Abi ön cam resmen harita gibi çatlamış, buna ekran takmadan kimse almaz!',
    leverageDropRatio: 0.14,
    zone: 'front',
  },
  screen_aftermarket: {
    id: 'screen_aftermarket',
    category: 'screen',
    name: 'Yan Sanayi TFT Ekran',
    shortLabel: 'Yan Sanayi Ekran',
    description: 'Orijinal OLED sökülüp ucuz yan sanayi panel takılmış, renkler soluk.',
    valuePenaltyRatio: 0.24,
    repairCost: 3200,
    repairable: true,
    leverageLine: 'Hocam Gerçek Ton yok, ekran yan sanayi TFT çıktı! Beni mi yiyorsun?',
    leverageDropRatio: 0.17,
    zone: 'front',
  },
  battery_degraded: {
    id: 'battery_degraded',
    category: 'battery',
    name: 'Bitik Pil (%67 Sağlık)',
    shortLabel: 'Bitik Pil',
    description: 'Pil devri dolmuş, yarım günü bile çıkarmadan kapanıyor.',
    valuePenaltyRatio: 0.14,
    repairCost: 1100,
    repairable: true,
    leverageLine: 'Pil sağlığı %67 kalmış, prizden çekince bayılır bu cihaz!',
    leverageDropRatio: 0.1,
    zone: 'back',
  },
  battery_fake_chip: {
    id: 'battery_fake_chip',
    category: 'battery',
    name: 'Pil %100 Sahte Çip',
    shortLabel: 'Sahte Pil Çipi',
    description: 'Ayarlarda %100 görünüyor ama cihaz testte 940 döngü ve %69 kapasite verdi!',
    valuePenaltyRatio: 0.18,
    repairCost: 1400,
    repairable: true,
    leverageLine: 'Ayarlarda %100 yazıyor ama testte çip takıldığı çıktı, gerçek pil %69!',
    leverageDropRatio: 0.15,
    zone: 'back',
  },
  imei_unregistered: {
    id: 'imei_unregistered',
    category: 'imei',
    name: 'Yurt Dışı Kayıtsız IMEI',
    shortLabel: 'Yurt Dışı Kayıtsız',
    description: 'BTK kaydı yok; 4 ay sonra şebeke kapanır. Pasaport kayıt harcı çok yüksek.',
    valuePenaltyRatio: 0.34,
    repairCost: 0,
    repairable: false,
    leverageLine: 'Kardeşim bu cihaz yurt dışı kayıtsız çıktı! Kayıt harcı telefon parası zaten!',
    leverageDropRatio: 0.24,
    zone: 'back',
  },
  liquid_damage: {
    id: 'liquid_damage',
    category: 'hardware',
    name: 'Sıvı Teması & Oksit',
    shortLabel: 'Sıvı Teması',
    description: 'SIM yuvasındaki sıvı indikatörü kıpkırmızı; anakart ultrasonik temizlik istiyor.',
    valuePenaltyRatio: 0.22,
    repairCost: 2400,
    repairable: true,
    leverageLine: 'SIM yuvası kıpkırmızı olmuş, bu cihaz suya düşmüş! Anakart temizliği şart.',
    leverageDropRatio: 0.16,
    zone: 'back',
  },
  camera_fog: {
    id: 'camera_fog',
    category: 'hardware',
    name: 'Kamera Buğusu & Yüz Sensörü',
    shortLabel: 'Kamera/Sensör Arızası',
    description: 'Ana kamera odaklanmıyor ve yüz tanıma sensörü hata veriyor.',
    valuePenaltyRatio: 0.19,
    repairCost: 2100,
    repairable: true,
    leverageLine: 'Kamera bulanık çekiyor, yüz tanıma da çalışmıyor. Fiyatı kırmamız lazım.',
    leverageDropRatio: 0.13,
    zone: 'back',
  },
  cosmetic_worn: {
    id: 'cosmetic_worn',
    category: 'screen',
    name: 'Kasa Darbeli & Kutusuz',
    shortLabel: 'Kasa Çizik / Kutusuz',
    description: 'Köşelerde derin düşme izleri var, kutu ve şarj kablosu eksik.',
    valuePenaltyRatio: 0.11,
    repairCost: 850,
    repairable: true,
    leverageLine: 'Kasa köşeleri ezik, kutu fatura da yok. Yenileme + kutu masrafı benden çıkar.',
    leverageDropRatio: 0.08,
    zone: 'back',
  },
};

export const CUSTOMER_ARCHETYPES: Record<CustomerArchetypeId, CustomerArchetype> = {
  student: {
    id: 'student',
    title: 'Üniversite Öğrencisi',
    names: ['Cem', 'Efe', 'Mert', 'Arda', 'Kaan', 'Berk', 'Emir', 'Batu', 'Yusuf', 'Kerem'],
    portraitPath: '/src/assets/images/customer_student_1795453524285.jpg',
    fallbackColor: '#365314',
    startingPatience: 85,
    teaBonusPatience: 22,
    teaPriceSoften: 0.05,
    bluffTolerance: 0.65,
    markupTendency: 0.12,
    preferredTiers: ['entry', 'mid'],
    traitSummary: 'Acil nakit arar, anlayışlıdır ama bütçesi kısıtlıdır.',
  },
  uncle: {
    id: 'uncle',
    title: 'Şüpheci Esnaf Dayı',
    names: ['Hüseyin Dayı', 'Kemal Amca', 'Rıza Abi', 'Muzaffer Dayı', 'İsmail Usta', 'Nurettin Abi', 'Süleyman Amca', 'Fikret Dayı'],
    portraitPath: '/src/assets/images/customer_uncle_1795453527637.jpg',
    fallbackColor: '#78350F',
    startingPatience: 72,
    teaBonusPatience: 32,
    teaPriceSoften: 0.08,
    bluffTolerance: 0.25,
    markupTendency: 0.26,
    preferredTiers: ['entry', 'mid', 'flagship'],
    traitSummary: 'Çay ikramına bayılır, ölücü teklife anında kızıp kalkar.',
  },
  influencer: {
    id: 'influencer',
    title: 'İçerik Üreticisi',
    names: ['Selin', 'İrem', 'Duru', 'Melis', 'Zeynep', 'Ece', 'Defne', 'Alara', 'Naz', 'Buse'],
    portraitPath: '/src/assets/images/customer_influencer_1795453527434.jpg',
    fallbackColor: '#4C1D95',
    startingPatience: 78,
    teaBonusPatience: 18,
    teaPriceSoften: 0.04,
    bluffTolerance: 0.5,
    markupTendency: 0.18,
    preferredTiers: ['mid', 'flagship', 'luxury'],
    traitSummary: 'Sıfır kutu ve amiral gemisine yüksek öder, kusurdan nefret eder.',
  },
  hustler: {
    id: 'hustler',
    title: 'Pasaj Tüccarı',
    names: ['Serkan', 'Tarık', 'Gökhan', 'Volkan', 'Sinan', 'Erhan', 'Okan', 'Koray', 'Cihan'],
    portraitPath: '/src/assets/images/customer_hustler_1795453527331.jpg',
    fallbackColor: '#1E3A5F',
    startingPatience: 80,
    teaBonusPatience: 15,
    teaPriceSoften: 0.04,
    bluffTolerance: 0.78,
    markupTendency: 0.3,
    preferredTiers: ['mid', 'flagship', 'luxury'],
    traitSummary: 'Gizli kusurlu cihaz getirir; açığını yakalarsan büyük kâr bırakır.',
  },
  vip: {
    id: 'vip',
    title: 'VIP Koleksiyoner',
    names: ['Demir Bey', 'Alper Bey', 'Levent Bey', 'Tamer Bey', 'Selçuk Bey', 'Hakan Bey', 'Kürşat Bey'],
    portraitPath: '/src/assets/images/customer_vip_1795455391560.jpg',
    fallbackColor: '#3F2E1A',
    startingPatience: 74,
    teaBonusPatience: 20,
    teaPriceSoften: 0.06,
    bluffTolerance: 0.3,
    markupTendency: 0.1,
    preferredTiers: ['flagship', 'luxury'],
    traitSummary: 'Sıfır kutu ve Usta İşi cihazlara piyasa üstü yüksek bütçe öder.',
  },
};

export const SHOP_UPGRADES: ShopUpgrade[] = [
  {
    id: 'repair_bench',
    name: 'Kendi ESD Tamir Tezgahın',
    cost: 6500,
    minLevel: 1,
    installDays: 1,
    category: 'workshop',
    summary: 'Dış tamirciye komisyon ödemeyi bırak; dükkanına ESD tamir masası ve havya istasyonu kur.',
    benefitText: 'Tek seferde çoklu arıza onarımı (+%12 Usta İşi) ve Acil Servis müşterileri açılır!',
    highlightTag: 'Öncelikli',
  },
  {
    id: 'tea_samovar',
    name: 'Bakır Semaver Çay Ocağı',
    cost: 7500,
    minLevel: 1,
    installDays: 1,
    category: 'sales',
    summary: 'Taze tavşan kanı çay ile en inatçı müşterinin bile gönlünü fethet.',
    benefitText: 'Çay ikramı sabrı +38 artırır ve müşteri beklentisini ek %4 yumuşatır.',
  },
  {
    id: 'accessory_license',
    name: 'Aksesuar Reyonu & Toptan Lisansı',
    cost: 18000,
    minLevel: 2,
    installDays: 0,
    category: 'sales',
    summary: 'Kırılmaz cam, kılıf, şarj seti ve kulaklık reyonunu resmen açarak her gün sıcak nakit döndür!',
    benefitText: 'Toptancı Aksesuar Siparişi, Reyon Satışı ve Telefon Yanı Çapraz Satış açılır!',
    highlightTag: 'İş Kolu',
  },
  {
    id: 'pro_diagnostic',
    name: 'Pro Ekspertiz İstasyonu',
    cost: 11500,
    minLevel: 2,
    installDays: 1,
    category: 'workshop',
    summary: 'Tek tuşla ekran, pil, IMEI ve sıvı sensörlerini anında tarayan masaüstü cihaz.',
    benefitText: '"Tümünü Tara" kısayolu açılır ve net tamir masrafı tahmini görünür.',
  },
  {
    id: 'display_cabinet',
    name: 'Kilitli Cam Vitrin Modülü',
    cost: 14000,
    minLevel: 2,
    installDays: 1,
    category: 'sales',
    summary: 'Tezgah yanına özel kilitli sergileme dolabı ekleyerek stok kapasiteni genişlet.',
    benefitText: 'Mevcut vitrin rafına kalıcı +2 sergileme yuvası ekler.',
  },
  {
    id: 'parts_wholesale',
    name: 'Tahtakale Toptan Parça Hattı',
    cost: 19500,
    minLevel: 3,
    installDays: 2,
    category: 'workshop',
    summary: 'Toptancıdan doğrudan orijinal ekran ve pil çekerek tamir maliyetlerini kır.',
    benefitText: 'Atölyedeki tüm tamir ve parça maliyetlerinde %30 kalıcı indirim.',
  },
  {
    id: 'neon_sign',
    name: 'Sosyal Medya & Pasaj Reklamı',
    cost: 24000,
    minLevel: 3,
    installDays: 1,
    category: 'sales',
    summary: 'Dükkanını şehrin en çok konuşulan teknoloji ve aksesuar noktasına dönüştür.',
    benefitText: 'VIP müşteri oranı ve pasif aksesuar satışı artar, itibar hızla yükselir.',
  },
  {
    id: 'cctv_security',
    name: '4K Güvenlik & Sahte IMEI Radarı',
    cost: 28000,
    minLevel: 3,
    installDays: 1,
    category: 'automation',
    summary: 'Girişte sahte cihazları ve hileli satıcıları caydıran akıllı kamera ve IMEI güvenlik sistemi.',
    benefitText: 'Garanti arıza riski %40 azalır, satıcıların gizli kusur saklama şansı düşer.',
  },
  {
    id: 'brand_new_license',
    name: 'Sıfır Kutu Resmi Bayilik Lisansı',
    cost: 65000,
    minLevel: 4,
    installDays: 1,
    category: 'sales',
    summary: '2. el ticaretin ötesine geç! Distribütörlerden faturalı sıfır kapalı kutu telefon getirme yetkisi al.',
    benefitText: 'Toptancıdaki Sıfır Kapalı Kutu Marka Distribütörleri ve Flaş İndirimler açılır!',
    highlightTag: 'İş Kolu',
  },
  {
    id: 'ultrasonic_cleaner',
    name: 'Ultrasonik Anakart Banyosu',
    cost: 36000,
    minLevel: 4,
    installDays: 2,
    category: 'workshop',
    summary: 'Sıvı temaslı ve oksitli anakartları yüksek frekanslı banyoda ilk günkü gibi temizler.',
    benefitText: 'Sıvı ve donanım arızalarında ek -%20 maliyet, Usta İşi değerine +%4 ek prim.',
  },
  {
    id: 'laser_backglass',
    name: 'Lazer Arka Cam & Kasa Makinesi',
    cost: 54000,
    minLevel: 5,
    installDays: 2,
    category: 'workshop',
    summary: 'Kırık arka cam ve darbeli kasaları lazerle dakikalar içinde fabrika çizgisinde yeniler.',
    benefitText: 'Tüm onarım maliyetlerinde ek -%12 indirim ve Hasan Usta tamir hızı +1 tur hızlanır.',
  },
  {
    id: 'espresso_bar',
    name: 'Müşteri Espresso & İkram Köşesi',
    cost: 52000,
    minLevel: 5,
    installDays: 1,
    category: 'sales',
    summary: 'Showroom müşterilerine özel taze kahve servisiyle pazarlık masasında yumuşak ortam kur.',
    benefitText: 'Her müşteri +8 başlangıç ruh hali ve +10 ekstra sabır ile tezgaha gelir!',
  },
  {
    id: 'smart_pos_zero',
    name: 'Akıllı POS & Sıfır Komisyon Anlaşması',
    cost: 72000,
    minLevel: 6,
    installDays: 2,
    category: 'automation',
    summary: 'Bankalarla özel esnaf POS anlaşması yaparak taksitli satış komisyonunu dibe çek.',
    benefitText: 'Kredi kartı POS komisyonu %5 yerine sadece %1 kesilir!',
  },
  {
    id: 'micro_soldering',
    name: 'Mikroskop & BGA Lehim İstasyonu',
    cost: 110000,
    minLevel: 6,
    installDays: 3,
    category: 'workshop',
    summary: 'Entegre ve işlemci düzeyinde mikro-cerrahi onarım istasyonu.',
    benefitText: 'Usta İşi onarılan cihazların piyasa değeri ekstra +%6 artar, veri kurtarma %95 tutar!',
  },
  {
    id: 'barcode_automation',
    name: 'Barkod & Otomatik Stok Yazılımı',
    cost: 135000,
    minLevel: 7,
    installDays: 2,
    category: 'automation',
    summary: 'Tüm aksesuar reyonunu ve vitrin fiyatlarını anlık takip eden akıllı kasa sistemi.',
    benefitText: 'Gün sonu pasif aksesuar satış hızı +%35 artar ve çapraz satış şansı +%10 yükselir!',
  },
  {
    id: 'cloud_crm',
    name: 'Bulut Müşteri Takip & Sadakat CRM',
    cost: 175000,
    minLevel: 8,
    installDays: 2,
    category: 'automation',
    summary: 'Eski müşterilere otomatik kampanya bildirimi gönderen kurumsal sadakat yazılımı.',
    benefitText: 'Müdavim müşteri dönüşü artar, her anlaşmadan +%15 ekstra XP kazanılır!',
  },
  {
    id: 'clean_room_lab',
    name: 'ISO-5 Temiz Oda Veri Laboratuvarı',
    cost: 240000,
    minLevel: 8,
    installDays: 3,
    category: 'workshop',
    summary: 'Şehirdeki diğer telefoncuların bile cihaz gönderdiği tozsuz profesyonel laboratuvar.',
    benefitText: 'Veri Kurtarma ve Acil Servis ödemeleri +%35 artar, tüm tamirler otomatik Usta İşi olur!',
  },
  {
    id: 'vip_concierge',
    name: 'VIP Masa & Özel Müşteri Danışmanlığı',
    cost: 360000,
    minLevel: 9,
    installDays: 2,
    category: 'sales',
    summary: 'Amiral gemisi ve katlanabilir cihaz alıcıları için özel kapalı görüşme masası.',
    benefitText: 'Tüm vitrin alıcı bütçeleri kalıcı +%6 artar ve VIP müşteri akışı katlanır!',
  },
];

export const SHOWCASE_UPGRADE_MAX_LEVEL = 10;
export function getShowcaseUpgradeCost(currentLevel: number): number {
  return Math.round((6500 * Math.pow(1.48, currentLevel)) / 500) * 500;
}

export const SHOP_DECORATIONS: ShopDecoration[] = [
  {
    id: 'vintage_sign',
    name: 'Nostaljik Emaye GSM Tabelası',
    cost: 5500,
    minLevel: 2,
    prestige: 15,
    summary: '90’lar pasaj ruhunu yaşatan sıcak kehribar parıltılı el yapımı tabela.',
    visualEffectText: 'Tezgah üst duvarında canlı ışıklı tabela olarak görünür (+15 Prestij).',
  },
  {
    id: 'tea_corner',
    name: 'Bakır Semaver & Esnaf Köşesi',
    cost: 9500,
    minLevel: 3,
    prestige: 20,
    summary: 'İnce belli bardaklar ve nazar boncuklu klasik pasaj esnafı dokunuşu.',
    visualEffectText: 'Tezgah sağ üst köşesinde sıcak esnaf dekoru gösterir (+20 Prestij).',
  },
  {
    id: 'edison_lights',
    name: 'Sıcak Edison Sarkıt Aydınlatmalar',
    cost: 15000,
    minLevel: 4,
    prestige: 25,
    summary: 'Cam fanuslu vintage ampullerle dükkanın ambiyansını ve vitrin parlaklığını yükselt.',
    visualEffectText: 'Tezgah sahnesine sıcak altın sarkıt ışık katmanı ekler (+25 Prestij).',
  },
  {
    id: 'retro_shelf',
    name: 'Efsane 3310 & Retro Telefon Rafı',
    cost: 24000,
    minLevel: 5,
    prestige: 32,
    summary: 'Kırılmaz 3310, kapaklı efsaneler ve ilk nesil telefonlardan oluşan koleksiyon köşesi.',
    visualEffectText: 'Tezgah sol üst köşesinde nostaljik koleksiyon rafı sergiler (+32 Prestij).',
  },
  {
    id: 'led_showcase',
    name: 'Mimari LED Vitrin Şeritleri',
    cost: 38000,
    minLevel: 6,
    prestige: 42,
    summary: 'Cihazları mücevher gibi öne çıkaran sıcak gün ışığı LED çerçeve aydınlatması.',
    visualEffectText: 'Tezgah çerçevesine zarif mimari ışık vurgusu ekler (+42 Prestij).',
  },
  {
    id: 'vip_lounge',
    name: 'Deri VIP Bekleme & Sergi Alanı',
    cost: 75000,
    minLevel: 8,
    prestige: 65,
    summary: 'Lüks deri koltuklar ve ışıklı cam kaidelerle flagship mağaza havası yarat.',
    visualEffectText: 'Tezgah sahnesine prestijli altın VIP çerçeve ve ışık ekler (+65 Prestij).',
  },
];

export const SHOP_STAFF: StaffMember[] = [
  {
    id: 'apprentice',
    name: 'Çırak Emre',
    role: 'Ön Ekspertiz & Reyon Uzmanı',
    hireCost: 14000,
    dailyWage: 750,
    minLevel: 2,
    maxLevel: 10,
    summary: 'Müşteri kapıdan girer girmez ön testi yapar, aksesuar reyonunu yönetip satışı hızlandırır.',
    benefitText: 'Sv.1: Her satıcıda 1 testi otomatik yapar, çay bonusu +10 artar.',
    level2Bonus: 'Sv.2–4: 2 testi otomatik tarar, reyon satışı seviye başına +%8 artar.',
    level3Bonus: 'Sv.5–7: 3 testi anında tarar, çevrimdışı reyon geliri katlanır.',
    highLevelBonus: 'Sv.8–10: Tüm 4 ekspertiz testini anında bitirir & dev reyon trafiği!',
  },
  {
    id: 'sales_rep',
    name: 'Danışman Zeynep',
    role: 'Vitrin Satış & Sosyal Medya Uzmanı',
    hireCost: 28000,
    dailyWage: 1200,
    minLevel: 4,
    maxLevel: 10,
    summary: 'İkna kabiliyeti yüksek, fenomenlerle arası iyi. Alıcı bütçelerini ve çapraz satışları büyütür.',
    benefitText: 'Sv.1: Alıcı bütçeleri +%5 artar, çapraz satış başarısı +%10 yükselir.',
    level2Bonus: 'Sv.2–4: Alıcı bütçesi +%10, rakibe karşı her gün pazar payı kazanır.',
    level3Bonus: 'Sv.5–7: Alıcı bütçesi +%16, VIP oranı ve çoklu aksesuar sepeti büyür.',
    highLevelBonus: 'Sv.8–10: Alıcı bütçesi +%22, her satışta ekstra itibar & maksimum sosyal erişim!',
  },
  {
    id: 'master_tech',
    name: 'Hasan Usta',
    role: 'Baş Anakart & Tamir Ustası',
    hireCost: 42000,
    dailyWage: 1650,
    minLevel: 5,
    maxLevel: 10,
    summary: 'Atölyeden veya Acil Servisten aktardığın cihazları süreli olarak tamir edip müşteriye teslim eder!',
    benefitText: 'Sv.1: Cihazları ustaya aktarabilirsin (4 müşteri turunda bitirir, -%35 parça maliyeti).',
    level2Bonus: 'Sv.2–4: Tamir süresi 3 tura düşer, aynı anda 2 cihaz işler, Usta İşi mührü basar.',
    level3Bonus: 'Sv.5–7: Tamir süresi 2 tura düşer, aynı anda 3 cihaz ve -%55 parça indirimi!',
    highLevelBonus: 'Sv.8–10: 1 turda yıldırım onarım, 4 paralel iş & -%70 parça maliyeti!',
  },
  {
    id: 'accountant',
    name: 'Mali Müşavir Selma Hanım',
    role: 'Vergi & Finans Danışmanı',
    hireCost: 68000,
    dailyWage: 2100,
    minLevel: 7,
    maxLevel: 10,
    summary: 'Satış vergilerini (KDV/Gelir) yasal gider optimizasyonuyla düşürür, haftalık maliye yükünü hafifletir.',
    benefitText: 'Sv.1: Satış başı vergi oranı %12’den %11’e, haftalık vergi -%15 iner.',
    level2Bonus: 'Sv.2–4: Satış vergisi %9–10’a iner, haftalık vergi -%30 azalır.',
    level3Bonus: 'Sv.5–7: Satış vergisi %7–8’e iner, banka kredi faizlerinde %15 avantaj sağlar.',
    highLevelBonus: 'Sv.8–10: Minimum %6 vergi dilimi, haftalık vergide -%55 yasal teşvik & kredi limiti bonusu!',
  },
];

export const STAFF_MAX_LEVEL = 10;

export function getStaffTrainingCost(currentLevel: number): number {
  return Math.round((6500 * Math.pow(1.42, Math.max(0, currentLevel - 1))) / 500) * 500;
}

export function getStaffTrainingDays(currentLevel: number): number {
  if (currentLevel <= 3) return 1;
  if (currentLevel <= 7) return 2;
  return 3;
}

// Legacy mapping kept for backwards compatibility if referenced
export const STAFF_TRAINING_COSTS: Record<number, number> = {
  1: getStaffTrainingCost(1),
  2: getStaffTrainingCost(2),
  3: getStaffTrainingCost(3),
  4: getStaffTrainingCost(4),
  5: getStaffTrainingCost(5),
  6: getStaffTrainingCost(6),
  7: getStaffTrainingCost(7),
  8: getStaffTrainingCost(8),
  9: getStaffTrainingCost(9),
};

// CUSTOM MODS kept only for legacy save compatibility (removed from Workshop UI in favor of Multi-Accessory Bundles)
export const CUSTOM_MODS: Record<CustomModId, CustomModSpec> = {
  transparent_back: {
    id: 'transparent_back',
    name: 'Şeffaf Arka Kapak',
    cost: 1100,
    valueBoostRatio: 0.16,
    description: 'Özel tasarım arka kapak.',
    badgeText: 'Şeffaf Mod',
  },
  rgb_logo: {
    id: 'rgb_logo',
    name: 'Işıklı Logo',
    cost: 1500,
    valueBoostRatio: 0.2,
    description: 'Özel tasarım ışıklı logo.',
    badgeText: 'Işıklı Custom',
  },
  gold_titanium: {
    id: 'gold_titanium',
    name: '24K Altın Kaplama',
    cost: 2600,
    valueBoostRatio: 0.27,
    description: 'Lüks kaplama.',
    badgeText: '24K VIP Mod',
  },
};

export const CUSTOM_MOD_LIST: CustomModSpec[] = [
  CUSTOM_MODS.transparent_back,
  CUSTOM_MODS.rgb_logo,
  CUSTOM_MODS.gold_titanium,
];

// CITY BRANCHES (5 TIMED EMPIRE BRANCHES)
export const CITY_BRANCHES: BranchSpec[] = [
  {
    id: 'street_kiosk',
    name: 'İstiklal Aksesuar Kiosku',
    district: 'Merkez Cadde',
    unlockCost: 26000,
    minLevel: 2,
    minReputation: 3.0,
    buildDays: 2,
    dailyNetIncome: 2600,
    offlineHourlyRate: 480,
    prestigeBonus: 20,
    description:
      'Yaya trafiğinin en yoğun olduğu caddede kırılmaz cam, MagKlik kılıf ve hızlı şarj satan ekspres kiosk.',
  },
  {
    id: 'mall_corner',
    name: 'Forum AVM GSM Noktası',
    district: 'Kuzey AVM',
    unlockCost: 65000,
    minLevel: 4,
    minReputation: 3.6,
    buildDays: 3,
    dailyNetIncome: 6200,
    offlineHourlyRate: 1150,
    prestigeBonus: 45,
    description:
      'Hafta sonları dolup taşan AVM standı. Sıfır kutu aPhone ve Samxung satışından yüksek günlük gelir.',
  },
  {
    id: 'service_hub',
    name: 'Bölge Mikro-Lehim & Servis Üssü',
    district: 'Teknoloji Vadisi',
    unlockCost: 130000,
    minLevel: 5,
    minReputation: 4.0,
    buildDays: 3,
    dailyNetIncome: 12500,
    offlineHourlyRate: 2300,
    prestigeBonus: 80,
    description:
      'Diğer telefoncuların bile anakart tamiri gönderdiği profesyonel teknik servis fabrikası!',
  },
  {
    id: 'airport_tech_booth',
    name: 'Havalimanı Duty-Free GSM Butiği',
    district: 'Uluslararası Terminal',
    unlockCost: 290000,
    minLevel: 7,
    minReputation: 4.4,
    buildDays: 4,
    dailyNetIncome: 27000,
    offlineHourlyRate: 4900,
    prestigeBonus: 135,
    description:
      'Yurt dışı yolcularına yüksek marjlı GaN adaptör, ANC kulaklık ve lüks cihaz satan VIP terminal noktası.',
  },
  {
    id: 'regional_warehouse',
    name: 'Marmara Toptan Dağıtım Deposu',
    district: 'Lojistik Merkezi',
    unlockCost: 620000,
    minLevel: 9,
    minReputation: 4.7,
    buildDays: 4,
    dailyNetIncome: 58000,
    offlineHourlyRate: 10500,
    prestigeBonus: 210,
    description:
      'Artık pasajdaki diğer telefoncular senden mal çekiyor! Kendi dağıtım ağınla dev pasif gelir imparatorluğu.',
  },
];

// NOSTALGIA MUSEUM LEGENDS (100% PARODY NAMES)
export const MUSEUM_ITEMS: MuseumItemSpec[] = [
  {
    id: 'nokya_3310',
    name: 'Nokya 3310 Tuğla Efsanesi',
    year: '2000',
    cost: 4500,
    prestigeBonus: 18,
    dailyPassiveCash: 380,
    story: 'Yere düşerse parkeyi kıran efsane! Vitrinde gören herkes fotoğraf çeker, esnaf muhabbeti başlar.',
    accentColor: '#38BDF8',
  },
  {
    id: 'eriksun_t28',
    name: 'Eriksun T28 Kapaklı Klasik',
    year: '1999',
    cost: 6800,
    prestigeBonus: 24,
    dailyPassiveCash: 560,
    story: 'Yaylı kapağının çıkardığı o meşhur "çıt" sesiyle 90’lar iş adamlarının rüyası.',
    accentColor: '#A78BFA',
  },
  {
    id: 'motorazr_v3',
    name: 'MotoRazr V3 Jilet İnce',
    year: '2004',
    cost: 9500,
    prestigeBonus: 32,
    dailyPassiveCash: 820,
    story: 'Alüminyum gövdeli, mavi ışıklı tuş takımlı ikonik kapaklı model.',
    accentColor: '#F472B6',
  },
  {
    id: 'blakberi_bold',
    name: 'BlakBeri Patron Q-Klavye',
    year: '2008',
    cost: 13500,
    prestigeBonus: 40,
    dailyPassiveCash: 1150,
    story: 'Fiziksel tuş takımı ve trackball topuyla dönemin CEO telefonu.',
    accentColor: '#34D399',
  },
  {
    id: 'aphone_2g',
    name: 'aPhone 2G İlk Nesil (Kapalı Kutu)',
    year: '2007',
    cost: 24000,
    prestigeBonus: 65,
    dailyPassiveCash: 2200,
    story: 'Dokunmatik çağı başlatan koleksiyonluk ilk nesil efsane. Şehrin tüm VIP’leri bunu görmeye gelir!',
    accentColor: '#F59E0B',
  },
];

// BANK & MERCHANT LOAN OFFERS (SCALING UP TO MULTI-MILLION TL AT TIER 6!)
export const BANK_LOANS: BankLoanOffer[] = [
  {
    id: 'loan_starter',
    name: 'Esnaf Kefalet Hızlı Nakit',
    principal: 15000,
    interestRate: 0.14,
    termDays: 6,
    minShopTier: 1,
    minLevel: 1,
    description: 'Acil kelepir fırsatları veya tamir tezgahını kaçırmamak için düşük faizli kısa destek.',
  },
  {
    id: 'loan_wholesale',
    name: 'Toptan Stok & İhale Kredisi',
    principal: 45000,
    interestRate: 0.17,
    termDays: 8,
    minShopTier: 2,
    minLevel: 2,
    description: 'Köşe dükkana geçince açılır. Gümrük ihaleleri ve sıfır kutu çekmek için güçlü sermaye.',
  },
  {
    id: 'loan_cadde',
    name: 'Cadde Mağazası Ticari Paket',
    principal: 120000,
    interestRate: 0.19,
    termDays: 10,
    minShopTier: 3,
    minLevel: 4,
    description: 'Cadde GSM Merkezi yatırımcıları için yüksek limitli şube ve ekipman finansmanı.',
  },
  {
    id: 'loan_showroom',
    name: 'Bölge Showroom Yatırım Kredisi',
    principal: 350000,
    interestRate: 0.2,
    termDays: 12,
    minShopTier: 4,
    minLevel: 6,
    description: 'Büyük showroom ve havalimanı şubesi finansmanı için kurumsal ticari kredi.',
  },
  {
    id: 'loan_flagship',
    name: 'AVM Flagship Milyoner Paketi',
    principal: 1000000,
    interestRate: 0.21,
    termDays: 15,
    minShopTier: 5,
    minLevel: 8,
    description: '1 Milyon ₺ dev kurumsal finansman! Toptan dağıtım deposu ve büyük filolar için.',
  },
  {
    id: 'loan_plaza_holding',
    name: 'GSM Plaza Holding Kredisi (2.5M ₺)',
    principal: 2500000,
    interestRate: 0.22,
    termDays: 18,
    minShopTier: 6,
    minLevel: 9,
    description: 'Son seviye GSM Plaza patronlarına özel 2.5 Milyon ₺ imparatorluk sendikasyon kredisi!',
  },
];

// PLAYER MERCHANT OUTFITS (WARDROBE CUSTOMIZATION)
export const PLAYER_OUTFITS: OutfitSpec[] = [
  {
    id: 'casual_hoodie',
    name: 'Günlük Kapüşonlu Sweatshirt',
    subtitle: '23 Yaş Genç Girişimci Tarzı',
    cost: 0,
    minLevel: 1,
    moodBonus: 3,
    patienceBonus: 4,
    preferredArchetypes: ['student', 'influencer'],
    bonusDescription: 'Öğrenci & Fenomen müşterilerde başlangıç ruh hali +7, diğerlerinde +3.',
    accentColor: '#64748B',
  },
  {
    id: 'traditional_vest',
    name: 'Geleneksel Esnaf Yeleği',
    subtitle: 'Klasik Pasaj Güvenilirliği',
    cost: 5500,
    minLevel: 2,
    moodBonus: 5,
    patienceBonus: 8,
    preferredArchetypes: ['uncle', 'hustler'],
    bonusDescription: 'Esnaf Dayı & Pasaj Tüccarı güveni patlar (+11 ruh hali, +8 sabır).',
    accentColor: '#92400E',
  },
  {
    id: 'tech_esd_coat',
    name: 'Profesyonel Teknik Usta Önlüğü',
    subtitle: 'Mikro-Cerrahi Servis İmajı',
    cost: 14000,
    minLevel: 4,
    moodBonus: 6,
    patienceBonus: 6,
    preferredArchetypes: ['hustler', 'student', 'uncle'],
    bonusDescription: 'Ekspertiz ve tamir güveni verir: tüm müşteriler +6 ruh hali, kusur kozunda sabır kaybı azalır.',
    accentColor: '#0284C7',
  },
  {
    id: 'formal_shirt',
    name: 'Ütülü Resmi Beyaz Gömlek',
    subtitle: 'Kurumsal Cadde Esnafı',
    cost: 28000,
    minLevel: 6,
    moodBonus: 8,
    patienceBonus: 8,
    preferredArchetypes: ['influencer', 'vip'],
    bonusDescription: 'Tüm müşterilerde +8 ruh hali & +8 sabır; Fenomen ve VIP’lerde +13 güven!',
    accentColor: '#E2E8F0',
  },
  {
    id: 'italian_blazer',
    name: 'Lacivert İtalyan Blazer Ceket',
    subtitle: 'Showroom Direktörü Şıklığı',
    cost: 75000,
    minLevel: 8,
    moodBonus: 11,
    patienceBonus: 10,
    preferredArchetypes: ['vip', 'influencer'],
    bonusDescription: 'VIP & Fenomenlerde +16 başlangıç ruh hali, tüm müşterilerde +11 ruh hali & +10 sabır!',
    accentColor: '#1E3A8A',
  },
  {
    id: 'boss_suit',
    name: 'Özel Dikim GSM Patron Takımı',
    subtitle: 'Plaza & Holding Prestiji',
    cost: 195000,
    minLevel: 9,
    moodBonus: 15,
    patienceBonus: 14,
    preferredArchetypes: ['vip', 'influencer', 'uncle', 'hustler', 'student'],
    bonusDescription: 'Tüm müşteri tiplerinde dev +15 başlangıç ruh hali, +14 sabır ve ekstra pazarlık otoritesi!',
    accentColor: '#D97706',
  },
];

export function getOutfitSpec(id: OutfitId): OutfitSpec {
  return PLAYER_OUTFITS.find((o) => o.id === id) ?? PLAYER_OUTFITS[0];
}

// MID-DAY RANDOM STORE EVENTS
export const RANDOM_STORE_EVENTS: Omit<RandomStoreEvent, 'id' | 'resolved'>[] = [
  {
    title: 'Kapı Önünde Sokak Müzisyeni!',
    description:
      'Yerel bir sokak müzisyeni tam vitrin önünde yüksek sesle darbuka ve bağlama çalıyor. İçeride konuşmak zorlaştı!',
    effectSummary: 'Sonraki müşteri: -12 Ruh Hali, -10 Sabır (veya 250 ₺ bahşişle sakinleştir)',
    visualKind: 'music',
    moodDelta: -12,
    patienceDelta: -10,
    budgetMultiplier: 0.97,
    actionLabel: '250 ₺ Bahşiş Ver & Sakin Parça İste',
    actionCost: 250,
    actionResultText: 'Müzisyen yumuşak bir akustik melodiye geçti! Dükkanın havası şahane oldu.',
    actionMoodDelta: 12,
    actionPatienceDelta: 10,
    actionBudgetMultiplier: 1.04,
  },
  {
    title: 'Ani Elektrik Dalgalanması!',
    description:
      'Pasaj trafosundaki voltaj dalgalanması vitrin spotlarını ve tavan ışıklarını kırpıştırmaya başladı.',
    effectSummary: 'Sonraki müşteri: -10 Ruh Hali, -8 Sabır (veya 350 ₺ UPS sigorta reseti)',
    visualKind: 'power_surge',
    moodDelta: -10,
    patienceDelta: -8,
    budgetMultiplier: 0.96,
    actionLabel: '350 ₺ Voltaj Regülatörünü Devreye Al',
    actionCost: 350,
    actionResultText: 'Regülatör anında devreye girdi, vitrin ışıkları pırıl pırıl sabitlendi!',
    actionMoodDelta: 8,
    actionPatienceDelta: 8,
    actionBudgetMultiplier: 1.03,
  },
  {
    title: 'Taze Demlenmiş Çay & Sıcak Simit Kokusu',
    description:
      'Komşu fırından taze susamlı simit geldi, senin çay ocağından da mis gibi dem kokusu pasaja yayıldı!',
    effectSummary: 'Sonraki müşteri: +14 Ruh Hali, +12 Sabır ve +%4 daha sıcak bütçe!',
    visualKind: 'tea_aroma',
    moodDelta: 14,
    patienceDelta: 12,
    budgetMultiplier: 1.04,
  },
  {
    title: 'Aniden Bastıran Sağanak Yağmur',
    description:
      'Dışarıda bardaktan boşanırcasına yağmur başladı! Islanarak içeri sığınan müşteri biraz gergin ama acelesi yok.',
    effectSummary: 'Sonraki müşteri: -6 Ruh Hali ama +14 Sabır (yağmur dinene kadar konuşur)',
    visualKind: 'rain',
    moodDelta: -6,
    patienceDelta: 14,
    budgetMultiplier: 1.0,
    actionLabel: '150 ₺ Havlu & Sıcak İkram Sun',
    actionCost: 150,
    actionResultText: 'Müşteri sırılsıklam gelmişti, bu jest karşısında mest oldu!',
    actionMoodDelta: 16,
    actionPatienceDelta: 16,
    actionBudgetMultiplier: 1.05,
  },
  {
    title: 'Semt Fenomeni Vitrinden Canlı Yayın Açtı!',
    description:
      'Genç bir teknoloji yayıncısı vitrinindeki telefonları gösterip "Pasajın en sağlam ustası burada!" diye yayın yaptı.',
    effectSummary: 'Sonraki müşteri: +16 Ruh Hali, +10 Sabır ve +%7 alım/satım enerjisi!',
    visualKind: 'livestream',
    moodDelta: 16,
    patienceDelta: 10,
    budgetMultiplier: 1.07,
  },
  {
    title: 'Pasaj Yönetimi Ani Düzen Denetimi',
    description:
      'Pasaj müdürü koridorlarda dolaşıyor, çevre dükkanlarda hafif bir tedirginlik havası var.',
    effectSummary: 'Sonraki müşteri: -8 Ruh Hali (veya 200 ₺ vitrin hızlı parlatma yap)',
    visualKind: 'inspection',
    moodDelta: -8,
    patienceDelta: -5,
    budgetMultiplier: 0.98,
    actionLabel: '200 ₺ Tezgahı Parlat & Evrakları Diz',
    actionCost: 200,
    actionResultText: 'Müdür tam not verdi, içerideki müşteri dükkanın profesyonelliğine hayran kaldı!',
    actionMoodDelta: 10,
    actionPatienceDelta: 8,
    actionBudgetMultiplier: 1.04,
  },
];

// FLASH WHOLESALE NEWSPAPER BRAND DEAL TEMPLATES (RIVAL STOCK RACE!)
export const FLASH_WHOLESALE_NEWS_TEMPLATES: {
  brand: string;
  discountPct: number;
  stockMin: number;
  stockMax: number;
  headline: string;
  subline: string;
}[] = [
  {
    brand: 'Samxung',
    discountPct: 18,
    stockMin: 4,
    stockMax: 7,
    headline: 'FLAŞ TOPTAN İNDİRİM: Samxung Depoda %18 Seri Sonu!',
    subline: 'Kurnaz Kerim ve pasaj esnafı depoya koştu — rakipler tüketmeden ne kadar kapabilirsen kâr!',
  },
  {
    brand: 'RedMix',
    discountPct: 20,
    stockMin: 5,
    stockMax: 8,
    headline: 'DEPO KAMPANYASI: RedMix Kapalı Kutularda %20 Fırsat!',
    subline: 'Sınırlı konteyner kotası açıldı! Gün içinde rakipler stokları saniyeler içinde eritiyor.',
  },
  {
    brand: 'PocoPop',
    discountPct: 19,
    stockMin: 4,
    stockMax: 7,
    headline: 'TOPTANCIDA İZDİHAM: PocoPop Serisi %19 İndirimde!',
    subline: 'Sabah yetişen ucuza kapar; öğlene kalan boş raf görür!',
  },
  {
    brand: 'aPhone',
    discountPct: 15,
    stockMin: 3,
    stockMax: 5,
    headline: 'KUR FIRSATI: aPhone Yetkili Depoda %15 Anlık İskonto!',
    subline: 'Çok az stok var! Rakip esnaflar telefon açıp ayırtmaya başladı bile!',
  },
  {
    brand: 'FoldZ',
    discountPct: 17,
    stockMin: 2,
    stockMax: 4,
    headline: 'VIP DEPO İNDİRİMİ: FoldZ Lüks Kutular %17 Ucuzladı!',
    subline: 'Showroom patronları kapışıyor — geç kalırsan tek kutu bile bulamazsın!',
  },
];

// GOOGLE PLAY GAMES / APPLE GAME CENTER ACHIEVEMENTS
export const STORE_ACHIEVEMENTS: StoreAchievementSpec[] = [
  {
    id: 'ach_first_deal',
    title: 'İlk Kepenk & Siftah',
    description: 'İlk telefon satışını tamamla.',
    points: 15,
    check: (s) => s.totalPhonesSold >= 1,
  },
  {
    id: 'ach_eagle_eye',
    title: 'Kartal Gözlü Eksper',
    description: 'Ekspertizde toplam 10 gizli kusur yakala.',
    points: 25,
    check: (s) => s.totalDefectsExposed >= 10,
  },
  {
    id: 'ach_repair_master',
    title: 'Mikro-Cerrahi Ustası',
    description: 'Toplam 10 telefon onarımı tamamla.',
    points: 30,
    check: (s) => s.totalPhonesRepaired >= 10,
  },
  {
    id: 'ach_accessory_baron',
    title: 'Reyon Baronu',
    description: 'Toplam 40 adet aksesuar sat.',
    points: 30,
    check: (s) => s.totalAccessoriesSold >= 40,
  },
  {
    id: 'ach_auction_shark',
    title: 'Gümrük İhale Kurdu',
    description: 'Toplam 3 açık artırma kazan.',
    points: 35,
    check: (s) => s.totalAuctionsWon >= 3,
  },
  {
    id: 'ach_fashion_boss',
    title: 'Tarz Sahibi Esnaf',
    description: 'Gardıroptan en az 3 farklı kıyafet aç.',
    points: 25,
    check: (s) => (s.ownedOutfits?.length ?? 1) >= 3,
  },
  {
    id: 'ach_empire_branches',
    title: 'Şehir Çapında Ağ',
    description: 'En az 3 farklı şehir şubesi aç.',
    points: 50,
    check: (s) => (s.branches?.length ?? 0) >= 3,
  },
  {
    id: 'ach_plaza_king',
    title: 'GSM Plaza İmparatoru',
    description: '6. Seviye GSM Plaza Genel Merkezine ulaş.',
    points: 100,
    check: (s) => s.shopTier >= 6,
  },
];

// EARNINGS & CASH THRESHOLD BADGES (Trigger top-of-screen celebratory badge popups)
export interface EarningsBadgeSpec {
  id: string;
  threshold: number;
  title: string;
  subtitle: string;
}

export const EARNINGS_BADGE_TIERS: EarningsBadgeSpec[] = [
  {
    id: 'earn_10k',
    threshold: 10000,
    title: 'Pasajın Çırağı · 10.000 ₺',
    subtitle: 'İlk 10.000 ₺ kazanç barajını aştın!',
  },
  {
    id: 'earn_25k',
    threshold: 25000,
    title: 'Tezgah Ustası · 25.000 ₺',
    subtitle: '25.000 ₺ eşiğini devirdin, pasaj seni konuşuyor.',
  },
  {
    id: 'earn_50k',
    threshold: 50000,
    title: 'Altın Kepenk · 50.000 ₺',
    subtitle: '50.000 ₺ kazançla mahallenin gözde telefoncususun!',
  },
  {
    id: 'earn_100k',
    threshold: 100000,
    title: 'Yüz Binlik Esnaf · 100.000 ₺',
    subtitle: '100.000 ₺ barajını geçtin — artık büyük oynuyorsun!',
  },
  {
    id: 'earn_250k',
    threshold: 250000,
    title: 'Pasaj Ağası · 250.000 ₺',
    subtitle: 'Çeyrek milyonluk ciro gücüne ulaştın!',
  },
  {
    id: 'earn_500k',
    threshold: 500000,
    title: 'GSM Patronu · 500.000 ₺',
    subtitle: 'Yarım milyon TL barajını kırdın!',
  },
  {
    id: 'earn_1m',
    threshold: 1000000,
    title: 'Milyoner Showroom · 1.000.000 ₺',
    subtitle: 'Efsanevi 1 Milyon ₺ kazanç barajına ulaştın!',
  },
];

// AUCTION RIVAL MERCHANTS
export const AUCTION_RIVALS = [
  { name: 'Kurnaz Kerim', style: 'Köşe Rakibin · İnatçı', avatarColor: '#EF4444' },
  { name: 'Tahtakale Yılmaz', style: 'Toptancı · Sabırlı', avatarColor: '#F59E0B' },
  { name: 'Showroom Nazlı', style: 'Lüks Avcısı · Agresif', avatarColor: '#8B5CF6' },
];

// DATA RECOVERY & SOFTWARE CASES
export const DATA_RECOVERY_CASES: DataRecoveryJob[] = [
  {
    title: 'Düğün Fotoğrafları & Suya Düşen Cihaz',
    story: 'Abi telefon denize düştü açılmıyor, içindeki 4.000 düğün fotoğrafı gitmesin ne istersen veririm!',
    softwareCost: 0,
    softwarePayout: 2600,
    softwareSuccessRate: 0.68,
    cleanRoomCost: 1200,
    cleanRoomPayout: 4400,
  },
  {
    title: 'Çöken Yazılım & Kilitli İş Rehberi',
    story: 'Güncelleme yaparken yarıda kapandı, logoda takılı kaldı! Tüm müşteri rehberim içinde kaldı usta.',
    softwareCost: 0,
    softwarePayout: 2200,
    softwareSuccessRate: 0.78,
    cleanRoomCost: 950,
    cleanRoomPayout: 3600,
  },
  {
    title: 'Kripto Cüzdan & Eski Yedek Kurtarma',
    story: 'Ekranı paramparça ama anakart canlı gibi... İçinden önemli notlarımı kurtarırsan çok cömert öderim!',
    softwareCost: 0,
    softwarePayout: 3400,
    softwareSuccessRate: 0.62,
    cleanRoomCost: 1650,
    cleanRoomPayout: 5800,
  },
];

// DAILY LOGIN STREAK REWARDS (7-DAY CYCLE)
export const DAILY_STREAK_REWARDS = [
  { day: 1, cash: 1200, xp: 40, label: 'Siftah Harçlığı' },
  { day: 2, cash: 1800, xp: 55, label: 'Çay & Tost Masrafı' },
  { day: 3, cash: 2600, xp: 75, label: 'Toptan İskonto Çeki' },
  { day: 4, cash: 3500, xp: 95, label: 'Aksesuar Bonusu' },
  { day: 5, cash: 4800, xp: 120, label: 'Esnaf Destek Primi' },
  { day: 6, cash: 6500, xp: 150, label: 'Hafta Sonu Bereketi' },
  { day: 7, cash: 10000, xp: 240, label: '7. Gün Büyük Kasa!' },
];

export const TRADE_IN_OPENING_LINES: Record<CustomerArchetypeId, string[]> = {
  student: [
    'Abi selam! Elimdeki eski telefonu verip üstüne nakit tamamlasam, vitrindeki bu cihazı takasla alabilir miyim?',
    'Usta, üst modele geçmek istiyorum! Eski cihazımı sayıp aradaki farkı nakit ödesem anlaşır mıyız?',
  ],
  uncle: [
    'Selamünaleyküm evladım. Bendeki eski makineyi sana bırakayım, vitrindeki şu temiz telefonu üstüne fark verip alayım.',
    'Hayırlı işler usta. İki taraf da kazansın: eski telefonumu al, üzerine şu kadar fark vereyim takas edelim.',
  ],
  influencer: [
    'Selam! Kamerası daha iyi olan şu vitrin cihazına geçmek istiyorum. Eski telefonumu takasa verip farkını ödesem?',
    'Merhaba, eskisini satmakla uğraşmak istemiyorum. Takas yapıp üstünü tamamlasak harika olur!',
  ],
  hustler: [
    'Kardeşim gel esnaf usulü kafa kafaya yakın takas yapalım! Eski cihazı bırakayım, üstüne tatlı bir fark vereyim.',
    'Ustam nakit bağlamayayım dedim, elimdeki cihazı verip vitrindekini alayım, farkını konuşalım!',
  ],
  vip: [
    'Merhaba, önceki cihazımı bırakıp vitrininizdeki bu üst modele geçmek istiyorum. Adil bir takas farkı konuşalım.',
  ],
};

export const REGULAR_GREETING_NOTES = [
  'Müdavim Müşteri · Geçen alışverişinden çok memnun kaldı!',
  'Sadık Semt Dostu · Arkadaşlarına da seni önerdi!',
  'Tekrar Gelen Müşteri · Bütçesi +%12 daha cömert!',
];

// SPECIAL LAUNCH NEWSPAPER EDITIONS
export const LAUNCH_EVENTS_BY_DAY: Record<number, DailyMarketEvent> = {
  2: {
    id: 'launch_day2',
    kicker: 'ÖZEL LANSMAN BASKISI',
    headline: 'aPhone 14 Pro Pasaja İndi: Eski Kasalar Titriyor!',
    subheadline: 'Yeni seri vitrinlerde yerini alırken aPhone meraklıları takas kuyruğuna girdi.',
    description: 'Bugünden itibaren aPhone 13 ve aPhone 14 Pro modelleri hem 2. elde hem bayilerde görülmeye başladı.',
    gossipNote: 'Çaycı Ali: "Az önce biri aPhone 12’yi verip 14 Pro soruyordu, abi pil 99 ama yan sanayi çıkmış!"',
    effectSummary: 'Yeni Modeller Açıldı: aPhone 13 & 14 Pro · aPhone Serisi +%8 Değerli',
    kind: 'launch',
    brandBoost: 'aPhone',
    valueMultiplier: 1.08,
    launchedModels: ['aPhone 13', 'aPhone 14 Pro'],
  },
  4: {
    id: 'launch_day4',
    kicker: 'TEKNOLOJİ DEPREMİ',
    headline: 'S24 Ultra ve aPhone 15 Pro Çıktı, Eski Modeller Ucuzladı!',
    subheadline: 'Amiral gemisi yarışı kızıştı: Üst seriye talep patlarken eski orta segment fiyat kırdı.',
    description: 'Yeni nesil amiral gemileri piyasaya giriş yaptı. Bugün amiral gemileri +%14 primli!',
    gossipNote: 'Pasaj Kulis: "S24 Ultra’nın kalemini koklayanlar kulübü yine tezgah önünde toplandı."',
    effectSummary: 'Yeni Modeller: S24 Ultra & aPhone 15 Pro · Amiral Gemileri +%14',
    kind: 'launch',
    tierBoost: 'flagship',
    valueMultiplier: 1.14,
    launchedModels: ['Samxung S24 Ultra', 'aPhone 15 Pro'],
  },
  6: {
    id: 'launch_day6',
    kicker: 'LÜKS SEGMENT LANSMANI',
    headline: 'Katlanabilir Çılgınlığı: FoldZ 5 ve LuminaCam 15 Ultra!',
    subheadline: 'İkiye katlanan ekranlar ve dev kamera lensleri koleksiyonerlerin başını döndürdü.',
    description: 'Lüks segment cihazlar pasajda! VIP müşteriler sıfır kutu ve temiz katlanabilir modeller için kesenin ağzını açıyor.',
    gossipNote: 'Yan Dükkan Necmi: "Abi ekran ortadan katlanıyor diye fiyat da ikiye katlanmış!"',
    effectSummary: 'Yeni Modeller: FoldZ 5 & LuminaCam 15 Ultra · Lüks Seri +%15',
    kind: 'launch',
    tierBoost: 'luxury',
    valueMultiplier: 1.15,
    launchedModels: ['FoldZ 5 Titanyum', 'LuminaCam 15 Ultra'],
  },
  8: {
    id: 'launch_day8',
    kicker: 'YILIN MANŞETİ · DEV LANSMAN',
    headline: 'aPhone 16 Pro Max 1TB Çıktı: Pasajda Kuyruk Sokağa Taştı!',
    subheadline: 'Ultra lüks cihazlar rekor fiyatlara ulaştı, aksesuar reyonları kılıf yetiştiremiyor.',
    description: 'aPhone 16 Pro Max 1TB ve NovaFold Quantum X artık piyasada! Lüks segment +%18 prim yaptı.',
    gossipNote: 'Pasaj Güvenliği: "Kapıda kamp sandalyesi açan iki koleksiyoner tespit edildi."',
    effectSummary: 'Yeni Modeller: aPhone 16 Pro Max & NovaFold Quantum · Lüks +%18',
    kind: 'launch',
    tierBoost: 'luxury',
    valueMultiplier: 1.18,
    launchedModels: ['aPhone 16 Pro Max', 'NovaFold Quantum X'],
  },
};

export const RANDOM_NEWSPAPER_POOL: DailyMarketEvent[] = [
  {
    id: 'news_iphone16_drop',
    kicker: 'SON DAKİKA · PİYASA ŞOKU',
    headline: '“aPhone 16 Çıktı, Eski Modeller Ucuzladı!”',
    subheadline: 'Yeni kasa söylentisi ikinci el piyasasını vurdu: Orta segmentte kelepir avı başladı.',
    description: 'Eski model sahipleri telefonlarını panikle satmaya koşuyor. Bugün orta segment cihazların piyasa değeri %14 geriledi!',
    gossipNote: 'Esnaf Fısıltısı: "Dün 20 bin isteyen çocuk bugün 15 bine razı, çayı demle bekle!"',
    effectSummary: 'Orta Segment Piyasası -%14 (Ucuza Toplama Günü!)',
    kind: 'drop',
    tierBoost: 'mid',
    valueMultiplier: 0.86,
  },
  {
    id: 'news_imei_tax',
    kicker: 'RESMİ GAZETE · GECE YARISI',
    headline: 'IMEI Kayıt Harcına Dev Zam: TR Faturalılar Altın Oldu!',
    subheadline: 'Pasaport kayıt ücreti telefon fiyatını geçince yurt dışı cihazlara soğuk duş.',
    description: 'Bugün TR kayıtlı ve sıfır kutu cihazlar +%14 değer kazanırken, yurt dışı kayıtsız telefonların değeri -%16 düştü.',
    gossipNote: 'Pasaj Kulis: "Yurt dışı telefon getiren Serkan’ın rengi bembeyaz oldu."',
    effectSummary: 'TR Kayıtlı +%14 · Yurt Dışı Kayıtsız -%16',
    kind: 'boom',
    trImeiMultiplier: 1.14,
    overseasImeiMultiplier: 0.84,
  },
  {
    id: 'news_tahtakale_container',
    kicker: 'TİCARET BÜLTENİ',
    headline: 'Tahtakale’de Konteyner Açıldı: Yedek Parçada %30 İndirim!',
    subheadline: 'Orijinal OLED ekranlar ve A+ bataryalar toptancı raflarına döküldü.',
    description: 'Bugün atölyende yapacağın tüm ekran, pil ve sıvı temizliği tamirleri ekstra %30 indirimli!',
    gossipNote: 'Toptancı Mahmut: "Gel vatandaş, pil alana tornavida duası bedava!"',
    effectSummary: 'Atölye Parça & Tamir Maliyetleri -%30 İndirimli',
    kind: 'discount',
    repairDiscount: 0.3,
  },
  {
    id: 'news_payday_boom',
    kicker: 'EKONOMİ · BEREKET GÜNÜ',
    headline: 'Maaş ve Primler Yattı: Pasajda Cüzdanlar Şişkin!',
    subheadline: 'Vitrin ve aksesuar reyonu önünde kuyruk var — bugün müşteriler çok daha cömert.',
    description: 'Ayın en bereketli günü! Alıcıların tüm bütçeleri bugün +%12 yükseldi.',
    gossipNote: 'Çaycı Ali: "Bugün herkes nakit sayıyor, bozuk para yetiştiremiyoruz!"',
    effectSummary: 'Tüm Alıcı Bütçeleri +%12 Arttı',
    kind: 'boom',
    buyerBudgetMultiplier: 1.12,
  },
  {
    id: 'news_university_opening',
    kicker: 'ŞEHİR GÜNDEMİ',
    headline: 'Üniversiteler Açıldı: “Sadece PDF Okurum” Akını!',
    subheadline: 'Öğrenciler bütçe dostu telefon, powerbank ve kırılmaz cam peşinde.',
    description: 'Kampüs dönüşü pasaja hareket getirdi. Giriş segmenti cihazlar bugün +%15 değer kazandı.',
    gossipNote: 'Öğrenci Cem: "Abi kamerası tahtayı çeksin yeter, bir de kırılmaz cam!"',
    effectSummary: 'Giriş Segmenti Değerleri +%15 · Alıcı Bütçesi +%5',
    kind: 'boom',
    tierBoost: 'entry',
    valueMultiplier: 1.15,
    buyerBudgetMultiplier: 1.05,
  },
  {
    id: 'news_influencer_camera',
    kicker: 'SOSYAL MEDYA TRENDİ',
    headline: '“Gece Modu” Akımı Viral Oldu: aPhone Fiyatları Zıpladı!',
    subheadline: 'Fenomenlerin karşılaştırma videosu sonrası herkes aPhone ve MagKlik kılıf soruyor.',
    description: 'Bugün tüm aPhone modellerinin piyasa değeri +%13 arttı.',
    gossipNote: 'İrem (Fenomen): "Işık kötüyse story atamıyorum, Pro model şart!"',
    effectSummary: 'Tüm aPhone Modelleri +%13 Değerli',
    kind: 'boom',
    brandBoost: 'aPhone',
    valueMultiplier: 1.13,
  },
  {
    id: 'news_samxung_rally',
    kicker: 'MARKA RALLİSİ',
    headline: 'Samxung’a Yapay Zeka Güncellemesi Geldi: Talep Patladı!',
    subheadline: '“Canlı çeviri” özelliği esnafın da hoşuna gitti, Samxung’lar yok satıyor.',
    description: 'Samxung modelleri bugün +%14 primli! Hem sıfır kutuda hem ikinci elde talep patladı.',
    gossipNote: 'Hüseyin Dayı: "Bu telefon İngilizceyi anında Türkçeye çeviriyormuş, bana bundan sar!"',
    effectSummary: 'Tüm Samxung Modelleri +%14 Değerli',
    kind: 'boom',
    brandBoost: 'Samxung',
    valueMultiplier: 1.14,
  },
  {
    id: 'news_heatwave_batteries',
    kicker: 'HAVA DURUMU · SERVİS ALARMI',
    headline: 'Sıcak Hava Dalgası: Bitik Piller Şişti, Parça Bolluğu!',
    subheadline: '40 derece sıcakta telefonlar bayıldı; tamir malzemeleri %20 uygun.',
    description: 'Pil değişim sezonunun zirvesindeyiz. Bugün tamir maliyetleri %20 düşük ve alıcılar sağlam pile ekstra ödüyor.',
    gossipNote: 'Hasan Usta: "Güneşte arabada unutulan telefonları buzdolabına koymayın kardeşim!"',
    effectSummary: 'Tamir Maliyetleri -%20 · Alıcı Bütçesi +%6',
    kind: 'discount',
    repairDiscount: 0.2,
    buyerBudgetMultiplier: 1.06,
  },
];

export const SELLER_OPENING_LINES: Record<CustomerArchetypeId, string[]> = {
  student: [
    'Abi selam, kira günü geldi acil nakit lazım. Cihaz tertemiz, sadece ders PDF’i okudum.',
    'Usta kolay gelsin, üst modele geçeceğim. Kılıfsız bir gün bile kullanmadım valla.',
    'Abi merhaba, bunu nakite çevirmem lazım. Öğrenciyiz, hakkını verirsen hemen bırakayım.',
  ],
  uncle: [
    'Selamünaleyküm evladım. Bu telefonu bana yeğenim aldı, ben tuşlu seviyorum. Çil çil cihaz.',
    'Kolay gelsin usta. Öyle ölü fiyat çekeceksen hiç açmayalım, malımın değerini bilirim.',
    'Hayırlı işler yeğenim. Sadece torunlarla görüntülü konuştum, sıfır ayarında makine.',
  ],
  influencer: [
    'Selam! Yeni seriye geçtim, bu boşa çıktı. Kamerası efsane, story çekmekten başka bir şey yapmadım.',
    'Merhaba, estetik olarak aşırı temiz kullandım. Değerinde alıyorsan hemen anlaşalım.',
    'Selamlar, elimde çok şık bir cihaz var. Sadece çekimlerde kullandım, hızlıca elden çıkarıyorum.',
  ],
  hustler: [
    'Kardeşim benim, sana ekmek yiyeceğin kelepir mal getirdim! Yalnız hızlı karar ver, yan dükkan bekliyor.',
    'Ustam selam, bu cihaz doktor hanımdan çıkma, nokta hatasız! Piyasası ateş pahası.',
    'Abi piyasada bu temizlikte zor bulursun, al-satçı dostuyuz diye ilk sana getirdim.',
  ],
  vip: [
    'Merhaba, koleksiyonumdan bir cihazı yenisiyle değiştirdim. Değerini bilen bir işletmeye bırakmak isterim.',
    'İyi günler, dükkanınızın prestijini duydum. Elimdeki üst segment cihaz için makul bir teklif bekliyorum.',
  ],
};

export const BUYER_OPENING_LINES: Record<CustomerArchetypeId, string[]> = {
  student: [
    'Abi selam, vitrindeki bu cihaz çok hoşuma gitti! Öğrenci indirimi yaparsan bugün alayım.',
    'Usta merhaba, burs yattı ama bütçem biraz dar. Etiketten bana bi güzellik yapar mısın?',
    'Kolay gelsin abi, şu modelde nakit indirimin nedir? Yanına kılıf cam da bakarız!',
  ],
  uncle: [
    'Evladım şu vitrindeki telefona baktım. Etiket biraz tuzlu olmuş, gel pazarlıkla orta yolu bulalım.',
    'Selamünaleyküm, bana sağlam, başımı ağrıtmayacak bir cihaz lazım. Ama sünnettir, pazarlık yaparım.',
    'Hayırlı işler usta. Peşin sayarım, kart komisyonu yok. Etiketten biraz kır bakalım.',
  ],
  influencer: [
    'Selam! Vitrindeki bu modele bayıldım. Kamerası ve kozmetiği sorunsuzsa hemen almak istiyorum.',
    'Merhaba, acil telefon lazım. Etiket fiyatına yakınım ama minik bir indirim çok tatlı olur.',
    'Selamlar! Bu rengi çok arıyordum, kutulu ve garantiliyse hemen anlaşabiliriz.',
  ],
  hustler: [
    'Kardeşim vitrinin maşallahı var. Şu cihazı alıcıya bağlayacağım, bana etiket üstünden esnaf indirimi yap.',
    'Ustam nakit cebimde, etiketten biraz esnersen hemen sayıp çıkayım.',
    'Abi vitrin şık ama gel şu rakamı tatlıya bağlayalım, ikimiz de kazanalım.',
  ],
  vip: [
    'Dükkanınızın atmosferi gerçekten çok şık! Vitrindeki bu cihaz temiz ve güvenilirse hemen alabilirim.',
    'Merhaba, özellikle sıfır kutu veya Usta İşi bir cihaz arıyorum. Güven verirseniz etikete çok yaklaşırım.',
  ],
};

export const ACCESSORY_BUYER_LINES: Record<CustomerArchetypeId, string[]> = {
  student: [
    'Abi selam, kampüse geçiyorum! Reyonda gözüme kestirdiğim aksesuarları hemen sarar mısın?',
    'Usta kolay gelsin, kablo yine koptu! Şunları hemen alıp çıkayım, derse yetişeceğim.',
  ],
  uncle: [
    'Selamünaleyküm yeğenim. Uzun yola çıkacağım, şu aksesuarlardan lazım. Sağlam mal olsun ha!',
    'Kolay gelsin evlat, bizim çocuk gönderdi. Reyondan şunları alayım, hayırlı işler.',
  ],
  influencer: [
    'Selam! Çekime yetişmem lazım, reyondaki bu parçalar aşırı iyi görünüyor. Hemen alıyorum!',
    'Merhaba! Telefonun yanına şu aksesuarları kombinlemek istiyorum, paketler misin?',
  ],
  hustler: [
    'Kardeşim reyonu fena dizmişsin! Şunları hemen nakit geçeyim, bereketli olsun.',
    'Ustam hızlısından şu aksesuarları ver bakalım, yan tarafta kargom bekliyor.',
  ],
  vip: [
    'Merhaba, aksesuar reyonunuz çok derli toplu. Şu ürünleri hemen paketleyebilir misiniz?',
  ],
};

export const DESK_PLACEMENT_LINES: Record<EncounterType, string[]> = {
  SELLER: [
    'Buyur usta, telefonu masaya bıraktım. İstediğin teste sok, gözünle gör!',
    'Al bakalım masaya koydum, şimdiden söyleyeyim tertemiz cihaz.',
    'Masaya bıraktım abi, uzman sensin bir incele bakalım.',
  ],
  BUYER: [
    'Vay, masada yakından daha da şık duruyormuş! Gel fiyatta anlaşalım usta.',
    'İşte aradığım cihaz! Etiketini gördüm, benim teklifim masada.',
    'Eline sağlık çok temiz görünüyor. Şu fiyatta biraz esner misin?',
  ],
  TRADE_IN: [
    'İki telefonu da yan yana koyduk usta! Eskimi incele, aradaki nakit farkında anlaşalım.',
    'Benim eski cihazı tezgaha bıraktım; üstüne farkı konuşup hemen takaslayalım!',
  ],
  WARRANTY_CLAIM: [
    'Bak usta, geçen senden aldığım cihazda bu arıza çıktı. Esnaflığına güvenip geldim, çözüm bekliyorum!',
  ],
  DATA_RECOVERY: [
    'Telefon masada usta! İçindeki veriler benim için her şeyden önemli, kurtarabilir miyiz?',
  ],
  EXPRESS_REPAIR: [
    'Tezgaha bıraktım usta, gözün gibi bak! Bekliyorum burada.',
  ],
  BULK_AUCTION: [
    'Koliyi masaya koydum kardeşim! Bantlı, kapalı kutu — cesaretin varsa alırsın.',
  ],
  ACCESSORY_BUYER: [
    'Harika, seçtiklerimi tezgaha koydum. Nakit ödüyorum, hemen geçebiliriz!',
  ],
};

export const TEA_REACTIONS: Record<CustomerArchetypeId, string[]> = {
  student: [
    'Eyvallah abi, sınav haftası ilaç gibi geldi valla! Hadi seni kırmayayım biraz esneyeyim.',
    'Sağ olasın usta, çayın da demliymiş! Gel şu işi ortak noktada bağlayalım.',
  ],
  uncle: [
    'Hah şöyle be evladım, esnaflık budur! Tavşan kanı çayın hatırına fiyatta biraz kırayım.',
    'Eline sağlık yeğenim, böyle ağırlayan dükkan kaldı mı? Senin için biraz daha esnerim.',
  ],
  influencer: [
    'Ay çok naziksiniz, teşekkürler! Ortamınız bayağı samimiymiş, fiyatta biraz daha yaklaşabilirim.',
    'Çok ince düşüncelisiniz, çay harika! Hadi makul bir rakamda buluşalım.',
  ],
  hustler: [
    'Eyvallah kardeşim, çayını içtik artık ayıp olmasın. Senin hatırına biraz oynarım.',
    'Kral adamsın usta, çayın hatırına şu marjı biraz gevşeteyim bakalım.',
  ],
  vip: [
    'Harika misafirperverlik, gerçekten çok zarif. Memnuniyetle bütçemi biraz daha esneteyim.',
    'Teşekkür ederim, böylesi bir ilgiyi görünce insan güvenle alışveriş yapıyor.',
  ],
};

export const LEVERAGE_REACTIONS: Record<CustomerArchetypeId, string[]> = {
  student: [
    'Ah be abi, fark etmezsin sanmıştım... Yüzüm kızardı valla, masrafı düşüp ciddi kırayım.',
    'Valla benim haberim yoktu usta, demek ondan ucuza almışım. Tamam fiyatı sert aşağı çekiyorum!',
  ],
  uncle: [
    'Hadi canım, cihazın kurdu olmuşsun sen! İyi madem, gördüğün kusurun hakkını fazlasıyla düşeyim.',
    'Gözünden de hiçbir şey kaçmıyor evladım... Lafın üstüne laf olmaz, fiyattan sağlam kırıyorum!',
  ],
  influencer: [
    'Gerçekten mi? Hiç fark etmemiştim, aşırı mahcup oldum! Tamam fiyatı bayağı revize edeyim.',
    'Of ya, servis bunu bana söylememişti... Çok haklısın, ciddi indirim yapayım bari.',
  ],
  hustler: [
    'Haha usta sen bu işin piri olmuşsun! Faka bastık, tamam yakaladın beni — fiyatı sert kırıyorum!',
    'Helal olsun kardeşim, kurnazlık sökmedi! Kusuru yüzüme vurdun, hakkın olanı düşüyorum.',
  ],
  vip: [
    'Çok titiz ve profesyonel bir ekspertiz, tebrik ederim. Tespitinize saygı duyuyorum, fiyatı ciddi oranda düşelim.',
  ],
};

export const SEVERE_LEVERAGE_REACTIONS: Record<CustomerArchetypeId, string[]> = {
  student: [
    'Eyvah! Gerçekten mi usta?! Aldığım kişi beni fena kandırmış o zaman... Ne diyorsan haklısın, fiyatı dibe çekiyorum!',
    'Abi şok oldum şu an, yemin ederim bilmiyordum! Bu kusurla kimse almaz, büyük indirim yapıyorum.',
  ],
  uncle: [
    'Vay anasını, bunu nasıl yakaladın evladım?! Elim kolum bağlandı, madem öyle fiyatı ciddi kırmak zorundayım!',
    'Eyvah, bize de bunu yutturmuşlar! Senin gibi ustaya yalan yürümez, mecburen sağlam iniyorum!',
  ],
  influencer: [
    'İnanamıyorum! Cihazı alırken bana sıfır gibi anlatmışlardı, yerin dibine girdim! Lütfen yeni fiyatı değerlendir, bayağı indim.',
  ],
  hustler: [
    'Hoppa! Usta sen röntgen cihazı mısın mübarek?! Tamam pes ettim, oyunun kuralı bu — fiyatı fena kırıyorum!',
    'Vay arkadaş, pasajda bunu ilk kez sen yakaladın! Kırmızı kart yedik, masrafını fazlasıyla düşüyorum!',
  ],
  vip: [
    'Bu düzeyde bir kusur gerçekten kabul edilemez, ekspertiziniz için teşekkürler. Fiyatı radikal şekilde aşağı çekiyorum.',
  ],
};

export const WALKOUT_LINES: Record<CustomerArchetypeId, string[]> = {
  student: [
    'Abi o paraya telefon değil kılıf bile alınmaz, kusura bakma başka yere bakayım.',
    'Yok usta o kadar da değil, teşekkürler iyi günler.',
  ],
  uncle: [
    'Evladım sen benimle dalga mı geçiyorsun? Çayını içtik ama bu fiyat olmaz, hayırlı işler!',
    'Pasajda dükkan mı bitti? Ben gider yandakine bakarım, kalsın!',
  ],
  influencer: [
    'Kusura bakma ama bu fiyat gerçekten çok uçuk, vakit kaybetmeyeyim. İyi günler!',
    'Anlaşamayacağız belli ki, başka butiklere bakacağım. Görüşürüz!',
  ],
  hustler: [
    'O rakama bu işi yaparsam akşam eve ekmek götüremem kardeşim, başka zamana artık!',
    'Çok sıkısın usta, bugün ticaret çıkmaz bize. Kolay gelsin!',
  ],
  vip: [
    'Maalesef bu şartlarda anlaşamıyoruz. Vaktiniz için teşekkürler, iyi çalışmalar.',
  ],
};

export const DEAL_ACCEPTED_LINES: Record<EncounterType, string[]> = {
  SELLER: [
    'Tamamdır usta, el sıkıştık! Hayrını gör, bereketli olsun.',
    'Anlaştık abi! Nakiti say, cihaz senin olsun.',
    'İyi esnafsın, helali hoş olsun. Güle güle sat!',
  ],
  BUYER: [
    'Süper oldu, içime çok sindi! Arkadaşlara da senin dükkanı önereceğim.',
    'Hayırlı olsun usta, el sıkıştık! Bir dahaki telefonda yine buradayım.',
    'Tam aradığım fiyata bağladık, bol kazançlar abi!',
  ],
  TRADE_IN: [
    'Harika bir takas oldu usta! Yeni cihazımla çok mutluyum, eskisi de sana bereket getirsin!',
    'İşte adil esnaf! İkimiz de kazandık, hayırlı işler!',
  ],
  WARRANTY_CLAIM: [
    'İşte arkasında duran gerçek esnaf! Bundan sonra tüm aile buradan alışveriş yapacak.',
  ],
  DATA_RECOVERY: [
    'Bütün anılarım geri geldi, Allah senden razı olsun usta! Helali hoş olsun!',
  ],
  EXPRESS_REPAIR: [
    'Eline koluna sağlık usta, saat gibi çalışıyor! Çevreme hep seni tavsiye edeceğim.',
  ],
  BULK_AUCTION: [
    'Kapalı kutu ihale senin oldu kardeşim, bakalım içinden hangi cevherler çıkacak!',
  ],
  ACCESSORY_BUYER: [
    'Eyvallah usta, çok işime yaradı! Bol kazançlar, görüşürüz.',
    'Süper hızlı oldu, ürünler çok kaliteli. Hayırlı işler!',
  ],
};

// 10-LEVEL LONG-TERM BALANCED PROGRESSION PERKS
export const LEVEL_PERKS: LevelPerk[] = [
  {
    level: 1,
    title: 'İlk Kepenk · Sadece 2. El Al-Sat',
    description: 'Pasajda sadece 2. el telefon ekspertizi, pazarlık ve temel tamir ile sermaye biriktirirsin.',
  },
  {
    level: 2,
    title: 'Büyütme, Aksesuar Lisansı & İlk Çırak',
    description: 'Büyüt ve Toptan sekmeleri açılır! 18.000 ₺ ile Aksesuar Lisansı alabilir, Çırak Emre ve ilk dekoru açabilirsin.',
  },
  {
    level: 3,
    title: 'Köşe Mağaza (Sv.2) + Araç Tutucu + -%10 Parça',
    description: 'Köşe Teknoloji Dükkanı (85.000 ₺), Manyetik Araç Tutucu, Güvenlik Radarı ve %10 parça indirimi açılır.',
  },
  {
    level: 4,
    title: 'Sıfır Kutu Bayilik Lisansı + Piyasa & Banka',
    description: 'Piyasa sekmesi (Sarı İlan, İhale, Banka, Şube) açılır! 65.000 ₺ ile Sıfır Telefon Bayilik Lisansı ve Danışman Zeynep açılır.',
  },
  {
    level: 5,
    title: 'Cadde GSM Merkezi + Hasan Usta + Espresso',
    description: 'Cadde GSM Merkezi (240.000 ₺), Hasan Usta, Mini Powerbank, Lazer Makinesi ve Espresso Köşesi açılır!',
  },
  {
    level: 6,
    title: 'ANC Kulaklık + Lüks İthalat + 0% POS',
    description: 'ANC Bluetooth Kulaklık, Lüks Katlanabilir Distribütör (4.0★), Akıllı POS ve günlük +1 ekstra müşteri açılır!',
  },
  {
    level: 7,
    title: 'Bölge Showroom + Mali Müşavir + -%4 Bayi',
    description: 'Bölge Showroom (650.000 ₺), Mali Müşavir Selma Hanım, Barkod Otomasyonu ve -%4 bayi iskontosu açılır.',
  },
  {
    level: 8,
    title: 'Kâr Serisi Ustası (x1.5) + Temiz Oda & CRM',
    description: 'Anlaşma seri bonusu %50 artar! Temiz Oda Veri Lab, Bulut CRM ve VIP Deri Lounge dekoru açılır.',
  },
  {
    level: 9,
    title: 'AVM Flagship + VIP Masa + Esnaf Efsanesi',
    description: 'AVM Flagship (1.600.000 ₺), VIP Danışmanlık Masası, Patron Takımı ve tüm alıcılarda +%6 bütçe primi açılır.',
  },
  {
    level: 10,
    title: 'GSM Plaza İmparatorluğu (Zirve)',
    description: 'GSM Plaza Genel Merkezi (4.000.000 ₺), ekstra -%4 distribütör indirimi ve günlük +1 ekstra müşteri!',
  },
];

export const CAREER_MILESTONES: CareerMilestone[] = [
  {
    id: 'ms_first_sale',
    title: 'İlk Siftah, İlk Bereket',
    description: 'Vitrinden ilk 2. el telefonunu satıp kasaya sıcak para koy.',
    minLevel: 1,
    rewardCash: 1800,
    rewardXp: 90,
    target: 1,
    metric: 'totalPhonesSold',
  },
  {
    id: 'ms_defect_hunter',
    title: 'Kartal Gözlü Eksper',
    description: 'Ekspertizde toplam 5 gizli kusuru yakalayıp pazarlık kozu olarak kullan.',
    minLevel: 1,
    rewardCash: 3000,
    rewardXp: 130,
    target: 5,
    metric: 'totalDefectsExposed',
  },
  {
    id: 'ms_micro_surgeon',
    title: 'Mikro Cerrah',
    description: 'Atölyede veya acil serviste toplam 4 telefon onarımı tamamla.',
    minLevel: 1,
    rewardCash: 4200,
    rewardXp: 160,
    target: 4,
    metric: 'totalPhonesRepaired',
  },
  {
    id: 'ms_hot_streak',
    title: 'Seri Esnaf (5’li Seri)',
    description: 'Müşteri kaçırmadan arka arkaya 5 anlaşma bağlayarak seriyi yakala.',
    minLevel: 1,
    rewardCash: 4800,
    rewardXp: 170,
    target: 5,
    metric: 'bestDealStreak',
  },
  {
    id: 'ms_sales_10',
    title: 'Pasajın Güvenilir Adı (10 Satış)',
    description: 'Kariyerin boyunca toplam 10 telefon satışı gerçekleştir.',
    minLevel: 2,
    rewardCash: 8500,
    rewardXp: 240,
    target: 10,
    metric: 'totalPhonesSold',
  },
  {
    id: 'ms_acc_king',
    title: 'Aksesuar Reyonu Ustası (20 Adet)',
    description: 'Aksesuar lisansını açtıktan sonra toplam 20 aksesuar sat.',
    minLevel: 2,
    rewardCash: 6500,
    rewardXp: 200,
    target: 20,
    metric: 'totalAccessoriesSold',
  },
  {
    id: 'ms_collector_8',
    title: 'Model Koleksiyoneri (8 Model)',
    description: '8 farklı telefon modelini al, onar veya satarak katalogda aç.',
    minLevel: 2,
    rewardCash: 7500,
    rewardXp: 220,
    target: 8,
    metric: 'discoveredModels',
  },
  {
    id: 'ms_profit_60k',
    title: 'Altın Tezgah (60.000 ₺ Kâr)',
    description: 'Satış, aksesuar ve servislerden toplam 60.000 ₺ net kâr elde et.',
    minLevel: 3,
    rewardCash: 12000,
    rewardXp: 300,
    target: 60000,
    metric: 'totalProfitEarned',
  },
  {
    id: 'ms_defect_20',
    title: 'Dedektif Efsanesi (20 Kusur)',
    description: 'Toplam 20 gizli kusur tespit ederek satıcıların blöfünü boz.',
    minLevel: 3,
    rewardCash: 14000,
    rewardXp: 320,
    target: 20,
    metric: 'totalDefectsExposed',
  },
  {
    id: 'ms_brand_new_dealer',
    title: 'Sıfır Kutu Bayisi (4 Cihaz)',
    description: 'Sıfır Bayilik Lisansı ile 4 adet sıfır kapalı kutu telefonu müşterilere sat.',
    minLevel: 4,
    rewardCash: 18000,
    rewardXp: 380,
    target: 4,
    metric: 'totalBrandNewSold',
  },
  {
    id: 'ms_repair_15',
    title: 'Baş Teknik Servis (15 Onarım)',
    description: 'Atölyede veya acil serviste toplam 15 cihazı hayata döndür.',
    minLevel: 4,
    rewardCash: 19500,
    rewardXp: 390,
    target: 15,
    metric: 'totalPhonesRepaired',
  },
  {
    id: 'ms_tier3_showroom',
    title: 'Cadde GSM Merkezi Patronu',
    description: 'Dükkanını 3. Seviye "Cadde GSM Merkezi" seviyesine taşı.',
    minLevel: 5,
    rewardCash: 35000,
    rewardXp: 520,
    target: 3,
    metric: 'shopTier',
  },
  {
    id: 'ms_sales_30',
    title: 'Şehir Çapında Tüccar (30 Satış)',
    description: 'Toplam 30 telefon satarak şehrin en hareketli tezgahı ol.',
    minLevel: 5,
    rewardCash: 32000,
    rewardXp: 500,
    target: 30,
    metric: 'totalPhonesSold',
  },
  {
    id: 'ms_acc_80',
    title: 'Aksesuar Devi (80 Adet)',
    description: 'Kılıf, cam, şarj seti ve kulaklıklardan toplam 80 adet sat.',
    minLevel: 6,
    rewardCash: 28000,
    rewardXp: 460,
    target: 80,
    metric: 'totalAccessoriesSold',
  },
  {
    id: 'ms_profit_350k',
    title: 'Bölge Sermayesi (350.000 ₺ Kâr)',
    description: 'Kümülatif 350.000 ₺ net ticaret kârına ulaş.',
    minLevel: 6,
    rewardCash: 55000,
    rewardXp: 680,
    target: 350000,
    metric: 'totalProfitEarned',
  },
  {
    id: 'ms_brand_new_15',
    title: 'Resmi Distribütör Lideri (15 Sıfır)',
    description: 'Toplam 15 adet sıfır kapalı kutu cihaz satışı kapat.',
    minLevel: 7,
    rewardCash: 65000,
    rewardXp: 760,
    target: 15,
    metric: 'totalBrandNewSold',
  },
  {
    id: 'ms_profit_1m',
    title: 'Milyoner Esnaf (1.200.000 ₺ Kâr)',
    description: 'Kariyer toplamında 1.200.000 ₺ net kâr barajını aş!',
    minLevel: 8,
    rewardCash: 140000,
    rewardXp: 1100,
    target: 1200000,
    metric: 'totalProfitEarned',
  },
  {
    id: 'ms_tier5_flagship',
    title: 'AVM Flagship & Plaza Vizyonu',
    description: '5. Seviye AVM Flagship mağazasını açarak devler ligine çık!',
    minLevel: 9,
    rewardCash: 280000,
    rewardXp: 1500,
    target: 5,
    metric: 'shopTier',
  },
];

// === DETECTIVE INSPECTION: SELLER VERBAL CLAIMS (TRUTH VS CATCHABLE LIES) ===
export const SELLER_CLAIM_LINES: Record<
  'screen' | 'battery' | 'imei' | 'hardware',
  { lie: string[]; truth: string[] }
> = {
  screen: {
    lie: [
      'Ekranı %100 fabrika çıkışlı orijinal, tek çizik bile yok usta!',
      'Hep koruyucu camla kullandım, ekrana ne darbe geldi ne tornavida değdi.',
      'TrueTone dahil her şeyi orijinal ekran, ışıkta baksan sıfır sanırsın.',
    ],
    truth: [
      'Ekranı tertemiz, ilk günden beri kaliteli camla korudum.',
      'Ön panel tamamen orijinal, renkler cam gibi duruyor.',
    ],
  },
  battery: {
    lie: [
      'Pil canavar gibi, iki gün çıkarıyor; cihaz hiç açılmadı!',
      'Batarya %95 üstü gidiyor usta, akşam eve %50 şarjla dönüyorum.',
      'Şarjı taş gibi, pil değişimi veya yazılım müdahalesi kesinlikle yok!',
    ],
    truth: [
      'Bataryasını hep orijinal adaptörle şarj ettim, sağlığı gayet iyi.',
      'Pil performansı yerli yerinde, gün sonunu rahat çıkarıyor.',
    ],
  },
  imei: {
    lie: [
      'TR faturalı kayıtlı cihaz usta, e-Devlet sorgusu pırıl pırıl çıkar!',
      'Yurt içi resmi distribütör ürünü, IMEI kaydı ömür boyu sorunsuz.',
      'Pasaport derdi yok, Türkiye çıkışlı faturalı cihaz getirdim sana.',
    ],
    truth: [
      'Türkiye kayıtlı cihaz, hattını taktığın gibi kullanırsın.',
      'IMEI numarası resmi TR kayıtlı, için rahat olsun.',
    ],
  },
  hardware: {
    lie: [
      'İçi hiç açılmadı, suya toza yaklaşmadı, kameralar ilk günkü gibi!',
      'Kasa tertemiz, vida izi yok, ne sıvı teması ne kamera buğusu var.',
      'Masadan düşmedi bile usta, kozmetik ve donanım on üzerinden on!',
    ],
    truth: [
      'Kılıfsız tek gün kullanmadım, kasa ve kameralar tertemiz duruyor.',
      'Sıvı teması veya darbe görmedi, donanımı saat gibi çalışıyor.',
    ],
  },
};

