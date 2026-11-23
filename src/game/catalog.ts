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
  PhoneModelSpec,
  ShopDecoration,
  ShopTier,
  ShopTierInfo,
  ShopUpgrade,
  StaffMember,
  StoryChapter,
} from './types';

export const SHOP_TIERS: Record<ShopTier, ShopTierInfo> = {
  1: {
    tier: 1,
    name: 'Küçük Pasaj Standı',
    cost: 0,
    minReputation: 1.0,
    backdropPath: '/src/assets/images/shop_counter_backdrop_1795453524289.jpg',
    showcaseSlots: 3,
    dailyCustomers: 5,
    baseRent: 1100,
    prestigeBonus: 10,
    description: '23 yaşında ilk kiraladığın 12 m² pasaj dükkanı. Düşük kira, sıcak esnaf atmosferi.',
    unlocksText: '3 Vitrin Rafı · Günde 5 Müşteri · Temel Aksesuar Standı',
  },
  2: {
    tier: 2,
    name: 'Köşe Teknoloji Dükkanı',
    cost: 38000,
    minReputation: 3.4,
    backdropPath: '/src/assets/images/shop_tier2_corner_1795455392009.jpg',
    showcaseSlots: 6,
    dailyCustomers: 6,
    baseRent: 2400,
    prestigeBonus: 35,
    description: 'Caddeye bakan geniş vitrinli köşe mağaza. Hem sıfır kutu hem 2. el hem aksesuar trafiği katlanır.',
    unlocksText: '6 Vitrin Rafı · Günde 6 Müşteri · Geniş Aksesuar Reyonu · +35 Prestij',
  },
  3: {
    tier: 3,
    name: 'GSM Showroom & Servis',
    cost: 95000,
    minReputation: 4.3,
    backdropPath: '/src/assets/images/shop_tier3_showroom_1795455391998.jpg',
    showcaseSlots: 9,
    dailyCustomers: 8,
    baseRent: 4400,
    prestigeBonus: 75,
    description: 'Şehrin zirvesindeki lüks teknoloji & teknik servis merkezi. VIP koleksiyonerlerin ve sıfır amiral gemisi alıcılarının adresi.',
    unlocksText: '9 Vitrin Rafı · Günde 8 Müşteri · Lüks Showroom Sahnesi · +75 Prestij',
  },
};

export const SHOP_BACKDROP_IMAGE = SHOP_TIERS[1].backdropPath;

export const VICTORY_CASH_GOAL = 250000;
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
    wholesaleCost: 145,
    recommendedPrice: 450,
    minPrice: 220,
    maxPrice: 750,
    description: 'Kadife iç astarlı, mıknatıslı premium kılıf. Gençler ve fenomenler bayılır.',
    demandWeight: 1.25,
  },
  {
    id: 'gan_charger',
    name: '30W GaN Hızlı Şarj Seti',
    category: 'Güç & Kablo',
    wholesaleCost: 290,
    recommendedPrice: 780,
    minPrice: 420,
    maxPrice: 1250,
    description: 'Yeni kutulardan adaptör çıkmadığı için her gün sorulan hızlı şarj adaptörü + örgülü kablo.',
    demandWeight: 1.15,
  },
  {
    id: 'car_mount',
    name: 'Manyetik Araç Telefon Tutucu',
    category: 'Araç Aksesuarı',
    wholesaleCost: 220,
    recommendedPrice: 600,
    minPrice: 320,
    maxPrice: 950,
    description: 'Hava ızgarasına takılan sağlam mıknatıslı tutucu. Sürücüler tezgaha uğrayıp alır.',
    demandWeight: 0.95,
  },
  {
    id: 'powerbank',
    name: '10.000 mAh Mini Powerbank',
    category: 'Taşınabilir Güç',
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
    minLevel: 1,
    minReputation: 1.0,
    wholesaleRatio: 0.93,
    tagline: 'İlk Günden Açık · Sıfır Kapalı Kutu',
    description: 'Cemal Usta’nın referansıyla açılan ilk resmi toptancın. 24 ay TR garantili sıfır giriş seviyesi cihazlar.',
  },
  {
    id: 'dist_samxung',
    name: 'Samxung Türkiye Yetkili Distribütörü',
    brands: ['Samxung'],
    minLevel: 2,
    minReputation: 3.2,
    wholesaleRatio: 0.91,
    tagline: 'Sv. 2 & 3.2★ İtibar ile Açılır',
    description: 'Galax A ve S Ultra serilerini fabrikadan kapalı kutu çekip sıfır vitrininde yüksek kârla sat.',
  },
  {
    id: 'dist_aphone',
    name: 'aPhone Yetkili Bayilik Hattı',
    brands: ['aPhone'],
    minLevel: 3,
    minReputation: 3.6,
    wholesaleRatio: 0.9,
    tagline: 'Sv. 3 & 3.6★ İtibar ile Açılır',
    description: 'Şehrin en çok aranan kapalı kutu aPhone serilerine doğrudan distribütör fiyatından erişim.',
  },
  {
    id: 'dist_luxury',
    name: 'Global Lüks & Katlanabilir İthalat',
    brands: ['FoldZ', 'LuminaCam', 'NovaFold'],
    minLevel: 5,
    minReputation: 4.0,
    wholesaleRatio: 0.88,
    tagline: 'Sv. 5 & 4.0★ İtibar ile Açılır',
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
      'Liseden sonra Cemal Usta’nın yanında 5 yıl pişip biriktirdiğin 16.500 ₺ ile kendi kepengini açtın. İlk iş: sıcak nakit döndürmek için raflardan aksesuar sat ve ilk telefon satışını bağla!',
    mentorNote:
      'Cemal Usta: "Evlat, büyük parayı telefondan kazanırsın ama dükkanın kirasını her zaman kılıf, kırılmaz cam ve şarj aleti çıkarır. Reyonu asla boş bırakma!"',
    objectiveText: 'Toplam 5 adet telefon aksesuarı sat (Tezgah, çapraz satış veya gün sonu)',
    rewardCash: 2200,
    rewardXp: 110,
    metric: 'totalAccessoriesSold',
    target: 5,
  },
  {
    id: 'ch_2_own_bench',
    chapterNumber: 2,
    title: 'Bölüm 2: Kendi Tornavidan',
    subtitle: 'Dış tamirciye muhtaç kalmadan usta işçiliği',
    narrative:
      'Eski ustadan öğrendiğin anakart ve ekran bilgisini artık kendi kasana yazma vakti. Kendi Tamir Tezgahını kurup arızalı cihazları hayata döndürerek gerçek kâr marjını yakala.',
    mentorNote:
      'Cemal Usta: "Kırık ekranlı cihazdan herkes kaçar, gerçek usta oradaki kârı görür. Sıcak havayı dengeli tut, flexi koparma!"',
    objectiveText: 'Atölyede veya acil serviste toplam 3 telefon onarımı tamamla',
    rewardCash: 3500,
    rewardXp: 160,
    metric: 'totalPhonesRepaired',
    target: 3,
  },
  {
    id: 'ch_3_brand_dealer',
    chapterNumber: 3,
    title: 'Bölüm 3: Sıfır Kutu Bayiliği',
    subtitle: 'Sadece 2. el değil, resmi marka distribütörlüğü',
    narrative:
      'Artık pasajda sadece eski telefon alıp satan bir genç değilsin. Toptancı sekmesinden sıfır, 24 ay garantili kapalı kutu telefonlar çekip vitrinini üst lige taşı!',
    mentorNote:
      'Cemal Usta: "Kapalı kutu sıfır telefon vitrine güven verir. Yanına bir de 30W hızlı şarj ve kılıf sattın mı, müşteri buradan bir daha şaşmaz!"',
    objectiveText: 'Distribütörden aldığın toplam 2 adet Sıfır Kapalı Kutu telefon sat',
    rewardCash: 5500,
    rewardXp: 230,
    metric: 'totalBrandNewSold',
    target: 2,
  },
  {
    id: 'ch_4_street_store',
    chapterNumber: 4,
    title: 'Bölüm 4: Pasajdan Caddeye',
    subtitle: 'Artık sen de kendi çırağını yetiştiren bir ustasın',
    narrative:
      '12 metrekarelik pasaj gözü artık müşterilerine dar geliyor! Caddeye bakan Köşe Teknoloji Dükkanına geçerek şehrin bilinen markası olma yolunda dev adımı at.',
    mentorNote:
      'Cemal Usta: "Beş yıl önce bana çay getiren çocuk bugün cadde mağazası açıyor... Seninle gurur duyuyorum evlat!"',
    objectiveText: '2. Seviye "Köşe Teknoloji Dükkanı" şubesini aç',
    rewardCash: 9000,
    rewardXp: 320,
    metric: 'shopTier',
    target: 2,
  },
  {
    id: 'ch_5_showroom_boss',
    chapterNumber: 5,
    title: 'Bölüm 5: GSM İmparatorluğu',
    subtitle: 'Şehrin zirvesindeki Showroom & Teknik Servis',
    narrative:
      '2. el ekspertiz, mikro cerrahi tamir, zengin aksesuar reyonu ve resmi marka bayiliği tek çatı altında! 3. Seviye GSM Showroom’unu açarak adını sektöre altın harflerle yaz.',
    mentorNote:
      'Cemal Usta: "Artık benim sana öğreteceğim bir şey kalmadı. Şehrin yeni kralı sensin, kepengin hep bereketle açılsın!"',
    objectiveText: '3. Seviye "GSM Showroom & Servis" merkezini aç',
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
  },
};

export const CUSTOMER_ARCHETYPES: Record<CustomerArchetypeId, CustomerArchetype> = {
  student: {
    id: 'student',
    title: 'Üniversite Öğrencisi',
    names: ['Cem', 'Efe', 'Mert', 'Arda', 'Kaan'],
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
    names: ['Hüseyin Dayı', 'Kemal Amca', 'Rıza Abi', 'Muzaffer Dayı'],
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
    names: ['Selin', 'İrem', 'Duru', 'Melis'],
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
    names: ['Serkan', 'Tarık', 'Gökhan', 'Volkan'],
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
    names: ['Demir Bey', 'Alper Bey', 'Levent Bey'],
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
    name: 'Kendi Tamir Tezgahın',
    cost: 5500,
    summary: 'Dış tamirciye komisyon ödemeyi bırak; dükkanına ESD tamir masası ve havya istasyonu kur.',
    benefitText: '5 Aşamalı Mikro Tamir Masası açılır (+%12 Usta İşi değeri), tek tık onarım ve acil tamir müşterileri!',
    highlightTag: 'Öncelikli',
  },
  {
    id: 'tea_samovar',
    name: 'Bakır Semaver Çay Ocağı',
    cost: 6000,
    summary: 'Taze tavşan kanı çay ile en inatçı müşterinin bile gönlünü fethet.',
    benefitText: 'Çay ikramı sabrı +38 artırır ve müşteri beklentisini ek %4 yumuşatır.',
  },
  {
    id: 'pro_diagnostic',
    name: 'Pro Ekspertiz İstasyonu',
    cost: 8500,
    summary: 'Tek tuşla ekran, pil, IMEI ve sıvı sensörlerini anında tarayan masaüstü cihaz.',
    benefitText: '"Tümünü Tara" kısayolu açılır ve net tamir masrafı tahmini görünür.',
  },
  {
    id: 'display_cabinet',
    name: 'Ekstra Cam Vitrin Modülü',
    cost: 10000,
    summary: 'Tezgah yanına özel kilitli sergileme dolabı ekleyerek stok kapasiteni genişlet.',
    benefitText: 'Mevcut dükkan seviyene ek +2 vitrin rafı kapasitesi sağlar.',
  },
  {
    id: 'parts_wholesale',
    name: 'Tahtakale Toptan Parça Hattı',
    cost: 12000,
    summary: 'Toptancıdan doğrudan orijinal ekran ve pil çekerek tamir maliyetlerini kır.',
    benefitText: 'Atölyedeki tüm tamir ve parça maliyetlerinde %30 kalıcı indirim.',
  },
  {
    id: 'neon_sign',
    name: 'Sosyal Medya & Pasaj İlanı',
    cost: 15000,
    summary: 'Dükkanını şehrin en çok konuşulan teknoloji ve aksesuar noktasına dönüştür.',
    benefitText: 'VIP koleksiyoner oranı ve pasif aksesuar satışı artar, itibar hızla yükselir.',
  },
];

export const SHOP_DECORATIONS: ShopDecoration[] = [
  {
    id: 'vintage_sign',
    name: 'Nostaljik Emaye GSM Tabelası',
    cost: 3500,
    prestige: 15,
    summary: '90’lar pasaj ruhunu yaşatan sıcak kehribar parıltılı el yapımı tabela.',
    visualEffectText: 'Tezgah üst duvarında canlı ışıklı tabela olarak görünür (+15 Prestij).',
  },
  {
    id: 'edison_lights',
    name: 'Sıcak Edison Sarkıt Aydınlatmalar',
    cost: 4800,
    prestige: 20,
    summary: 'Cam fanuslu vintage ampullerle dükkanın ambiyansını ve vitrin parlaklığını yükselt.',
    visualEffectText: 'Tezgah sahnesine sıcak altın sarkıt ışık katmanı ekler (+20 Prestij).',
  },
  {
    id: 'retro_shelf',
    name: 'Efsane 3310 & Retro Telefon Rafı',
    cost: 6500,
    prestige: 25,
    summary: 'Kırılmaz 3310, kapaklı efsaneler ve ilk nesil telefonlardan oluşan koleksiyon köşesi.',
    visualEffectText: 'Tezgah sol üst köşesinde nostaljik koleksiyon rafı sergiler (+25 Prestij).',
  },
  {
    id: 'led_showcase',
    name: 'Mimari LED Vitrin Şeritleri',
    cost: 8000,
    prestige: 30,
    summary: 'Cihazları mücevher gibi öne çıkaran sıcak gün ışığı LED çerçeve aydınlatması.',
    visualEffectText: 'Tezgah çerçevesine zarif mimari ışık vurgusu ekler (+30 Prestij).',
  },
  {
    id: 'tea_corner',
    name: 'Bakır Semaver & Esnaf Köşesi',
    cost: 4200,
    prestige: 18,
    summary: 'İnce belli bardaklar ve nazar boncuklu klasik pasaj esnafı dokunuşu.',
    visualEffectText: 'Tezgah sağ üst köşesinde sıcak esnaf dekoru gösterir (+18 Prestij).',
  },
];

export const SHOP_STAFF: StaffMember[] = [
  {
    id: 'apprentice',
    name: 'Çırak Emre',
    role: 'Ön Ekspertiz & Reyon Çırağı',
    hireCost: 9000,
    dailyWage: 650,
    summary: 'Müşteri kapıdan girer girmez ilk testi yapar, aksesuar reyonunu düzeltip satışı hızlandırır.',
    benefitText: 'Her yeni satıcıda 1 testi otomatik yapar, çay bonusu +10 artar ve çevrimdışı gelir üretir.',
    level2Bonus: 'Satıcıda 2 testi otomatik tarar & pasif aksesuar satışı +%25 artar.',
    level3Bonus: 'Tüm ön ekspertizi hızlandırır & çevrimdışı gelir 2 katına çıkar.',
  },
  {
    id: 'master_tech',
    name: 'Hasan Usta',
    role: 'Kıdemli Anakart & Tamir Ustası',
    hireCost: 18000,
    dailyWage: 1300,
    summary: 'Yılların pasaj ustası. Mesai bitiminde bekleyen arızalı cihazları elden geçirir.',
    benefitText: 'Her gün sonunda atölyedeki 1 tamir bekleyen kusuru %50 parça fiyatıyla otomatik onarır.',
    level2Bonus: 'Gün sonunda 2 kusura kadar otomatik onarım & Usta İşi mührü!',
    level3Bonus: 'Otomatik onarımlarda parça masrafı %75 düşer & mikro-lehim bonusu.',
  },
  {
    id: 'sales_rep',
    name: 'Danışman Zeynep',
    role: 'Vitrin Satış & Sosyal Medya Uzmanı',
    hireCost: 14500,
    dailyWage: 950,
    summary: 'İkna kabiliyeti yüksek, fenomenlerle arası iyi. Müşteri trafiğini ve aksesuar sepetini büyütür.',
    benefitText: 'Alıcı bütçelerini +%6 artırır, çapraz satış başarısını +%12 yükseltir ve gece geliri kazandırır.',
    level2Bonus: 'Alıcı bütçesi +%10, rakip esnafa karşı günlük +%3 pazar payı!',
    level3Bonus: 'VIP müşteri oranı patlar & her satışta ekstra itibar kazandırır.',
  },
];

export const STAFF_TRAINING_COSTS: Record<number, number> = {
  1: 8500, // Level 1 -> 2
  2: 18500, // Level 2 -> 3
};

// CUSTOM PHONE MODDING CATALOG (WORKSHOP)
export const CUSTOM_MODS: Record<CustomModId, CustomModSpec> = {
  transparent_back: {
    id: 'transparent_back',
    name: 'Şeffaf Arka Kapak (X-Ray Mod)',
    cost: 1100,
    valueBoostRatio: 0.16,
    description: 'İç donanımı gösteren özel safir şeffaf kapak; gençler ve teknoloji meraklıları bayılır.',
    badgeText: 'Şeffaf Mod',
  },
  rgb_logo: {
    id: 'rgb_logo',
    name: 'Işıklı Logo & Neon Çerçeve',
    cost: 1500,
    valueBoostRatio: 0.2,
    description: 'Bildirim gelince parlayan özel tasarım arka logo ve mat çerçeve kaplaması.',
    badgeText: 'Işıklı Custom',
  },
  gold_titanium: {
    id: 'gold_titanium',
    name: '24K Altın & Titanyum Kaplama',
    cost: 2600,
    valueBoostRatio: 0.27,
    description: 'VIP koleksiyonerlerin gözdesi lüks altın-titanyum el işçiliği özel kasa.',
    badgeText: '24K VIP Mod',
  },
};

export const CUSTOM_MOD_LIST: CustomModSpec[] = [
  CUSTOM_MODS.transparent_back,
  CUSTOM_MODS.rgb_logo,
  CUSTOM_MODS.gold_titanium,
];

// CITY BRANCHES (EMPIRE PASSIVE INCOME + OFFLINE IDLE)
export const CITY_BRANCHES: BranchSpec[] = [
  {
    id: 'street_kiosk',
    name: 'İstiklal Aksesuar Kiosku',
    district: 'Merkez Cadde',
    unlockCost: 26000,
    minLevel: 2,
    minReputation: 3.0,
    dailyNetIncome: 2400,
    offlineHourlyRate: 450,
    prestigeBonus: 20,
    description: 'Yaya trafiğinin en yoğun olduğu caddede kırılmaz cam, MagKlik kılıf ve hızlı şarj satan ekspres kiosk.',
  },
  {
    id: 'mall_corner',
    name: 'Forum AVM GSM Noktası',
    district: 'Kuzey AVM',
    unlockCost: 62000,
    minLevel: 4,
    minReputation: 3.7,
    dailyNetIncome: 5800,
    offlineHourlyRate: 1100,
    prestigeBonus: 45,
    description: 'Hafta sonları dolup taşan AVM standı. Sıfır kutu aPhone ve Samxung satışından yüksek günlük gelir.',
  },
  {
    id: 'service_hub',
    name: 'Bölge Mikro-Lehim & Servis Üssü',
    district: 'Teknoloji Vadisi',
    unlockCost: 115000,
    minLevel: 6,
    minReputation: 4.2,
    dailyNetIncome: 11500,
    offlineHourlyRate: 2200,
    prestigeBonus: 80,
    description: 'Diğer telefoncuların bile anakart tamiri gönderdiği profesyonel teknik servis fabrikası!',
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
    dailyPassiveCash: 350,
    story: 'Yere düşerse parkeyi kıran efsane! Vitrinde gören herkes fotoğraf çeker, esnaf muhabbeti başlar.',
    accentColor: '#38BDF8',
  },
  {
    id: 'eriksun_t28',
    name: 'Eriksun T28 Kapaklı Klasik',
    year: '1999',
    cost: 6800,
    prestigeBonus: 24,
    dailyPassiveCash: 520,
    story: 'Yaylı kapağının çıkardığı o meşhur "çıt" sesiyle 90’lar iş adamlarının rüyası.',
    accentColor: '#A78BFA',
  },
  {
    id: 'motorazr_v3',
    name: 'MotoRazr V3 Jilet İnce',
    year: '2004',
    cost: 9500,
    prestigeBonus: 32,
    dailyPassiveCash: 780,
    story: 'Alüminyum gövdeli, mavi ışıklı tuş takımlı ikonik kapaklı model.',
    accentColor: '#F472B6',
  },
  {
    id: 'blakberi_bold',
    name: 'BlakBeri Patron Q-Klavye',
    year: '2008',
    cost: 13500,
    prestigeBonus: 40,
    dailyPassiveCash: 1100,
    story: 'Fiziksel tuş takımı ve trackball topuyla dönemin CEO telefonu.',
    accentColor: '#34D399',
  },
  {
    id: 'aphone_2g',
    name: 'aPhone 2G İlk Nesil (Kapalı Kutu)',
    year: '2007',
    cost: 24000,
    prestigeBonus: 65,
    dailyPassiveCash: 2100,
    story: 'Dokunmatik çağı başlatan koleksiyonluk ilk nesil efsane. Şehrin tüm VIP’leri bunu görmeye gelir!',
    accentColor: '#F59E0B',
  },
];

// BANK & MERCHANT LOAN OFFERS
export const BANK_LOANS: BankLoanOffer[] = [
  {
    id: 'loan_starter',
    name: 'Esnaf Kefalet Hızlı Nakit',
    principal: 15000,
    interestRate: 0.14,
    termDays: 6,
    description: 'Acil kelepir fırsatları veya tamir tezgahını kaçırmamak için düşük faizli kısa destek.',
  },
  {
    id: 'loan_wholesale',
    name: 'Toptan Stok & İhale Kredisi',
    principal: 38000,
    interestRate: 0.18,
    termDays: 8,
    description: 'Gümrük açık artırmalarına ve sıfır kutu distribütör siparişlerine güçlü sermaye.',
  },
  {
    id: 'loan_empire',
    name: 'Şube Yatırım Paketi',
    principal: 80000,
    interestRate: 0.22,
    termDays: 10,
    description: 'Yeni şube veya Showroom açılışını erkene çekmek isteyen cesur girişimciler için.',
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
    softwareCost: 450,
    softwarePayout: 2600,
    softwareSuccessRate: 0.68,
    cleanRoomCost: 1200,
    cleanRoomPayout: 4400,
  },
  {
    title: 'Çöken Yazılım & Kilitli İş Rehberi',
    story: 'Güncelleme yaparken yarıda kapandı, logoda takılı kaldı! Tüm müşteri rehberim içinde kaldı usta.',
    softwareCost: 350,
    softwarePayout: 2200,
    softwareSuccessRate: 0.78,
    cleanRoomCost: 950,
    cleanRoomPayout: 3600,
  },
  {
    title: 'Kripto Cüzdan & Eski Yedek Kurtarma',
    story: 'Ekranı paramparça ama anakart canlı gibi... İçinden önemli notlarımı kurtarırsan çok cömert öderim!',
    softwareCost: 600,
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
    'Ah be abi, fark etmezsin sanmıştım... Haklısın, masrafı düşüp tekrar konuşalım.',
    'Valla benim haberim yoktu usta, demek ondan ucuza almışım. Tamam fiyatı indiriyorum.',
  ],
  uncle: [
    'Hadi canım, cihazın kurdu olmuşsun sen! İyi madem, gördüğün kusurun hakkını düşeyim.',
    'Gözünden de hiçbir şey kaçmıyor evladım... Tamam, o masrafı fiyattan kıralım.',
  ],
  influencer: [
    'Gerçekten mi? Hiç fark etmemiştim, aşırı mahcup oldum! Tamam fiyatı revize edeyim.',
    'Of ya, servis bunu bana söylememişti... Haklısın, o zaman biraz daha aşağı çekeyim.',
  ],
  hustler: [
    'Haha usta sen bu işin piri olmuşsun! Tamam yakaladın beni, fiyatı kırıyorum.',
    'Helal olsun kardeşim, profesyonel adamsın. Kusuru gördün, hakkın olanı düşüyorum.',
  ],
  vip: [
    'Çok titiz bir ekspertiz, tebrik ederim. Tespitinize saygı duyuyorum, fiyatı düşelim.',
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
    title: 'İlk Kepenk (23 Yaş)',
    description: 'Pasajda kendi dükkanını açtın. RedMix & PocoPop sıfır toptancısı ve aksesuar reyonu açık.',
  },
  {
    level: 2,
    title: 'Samxung Bayiliği + %5 Alıcı Bütçesi',
    description: 'Samxung sıfır distribütörü açılır (3.2★ ile) ve vitrin alıcıları +%5 daha cömert olur.',
  },
  {
    level: 3,
    title: 'aPhone Bayiliği + %10 Parça İndirimi',
    description: 'aPhone sıfır distribütörü açılır (3.6★ ile) ve tamir parçalarında kalıcı %10 indirim.',
  },
  {
    level: 4,
    title: 'Aksesuar Cazibesi (+%25 Reyon Satışı)',
    description: 'Çapraz satış başarı oranı artar, gün sonu pasif aksesuar satışların %25 hızlanır.',
  },
  {
    level: 5,
    title: 'Lüks Distribütör + VIP Mıknatısı',
    description: 'Lüks katlanabilir distribütör açılır (4.0★ ile) ve VIP müşteri şansı +%15 artar.',
  },
  {
    level: 6,
    title: 'Yoğun Trafik (+1 Günlük Müşteri)',
    description: 'Kapı hiç boş kalmıyor! Her gün fazladan +1 müşteri dükkanından içeri girer.',
  },
  {
    level: 7,
    title: 'Toptancı İskontosu (-%4 Sıfır Maliyet)',
    description: 'Tüm sıfır kapalı kutu marka distribütörlerinden %4 ek bayi iskontosu kazanırsın.',
  },
  {
    level: 8,
    title: 'Kâr Serisi Ustası (x1.5 Seri Bonusu)',
    description: 'Arka arkaya başarılı anlaşmalarda kazandığın seri bonusu %50 daha yüksek ödenir.',
  },
  {
    level: 9,
    title: 'Esnaf Efsanesi (+%6 Satış Primi)',
    description: 'Şehirdeki ünün sayesinde tüm telefon alıcıları bütçesini ek +%6 yukarı çeker.',
  },
  {
    level: 10,
    title: 'GSM Duayeni (Zirve Ustalık)',
    description: 'Tüm distribütörlerde ek -%4 indirim ve günlük +1 ekstra müşteri ile tam imparatorluk!',
  },
];

export const CAREER_MILESTONES: CareerMilestone[] = [
  {
    id: 'ms_first_sale',
    title: 'İlk Siftah, İlk Bereket',
    description: 'Vitrinden ilk telefonunu satıp kasaya sıcak para koy.',
    rewardCash: 1500,
    rewardXp: 70,
    target: 1,
    metric: 'totalPhonesSold',
  },
  {
    id: 'ms_acc_king',
    title: 'Aksesuar Reyonu Ustası',
    description: 'Kılıf, kırılmaz cam, şarj aleti ve tutuculardan toplam 15 adet sat.',
    rewardCash: 2800,
    rewardXp: 110,
    target: 15,
    metric: 'totalAccessoriesSold',
  },
  {
    id: 'ms_defect_hunter',
    title: 'Kartal Gözlü Eksper',
    description: 'Ekspertizde toplam 5 gizli kusuru yakalayıp pazarlık kozu olarak masaya vur.',
    rewardCash: 2600,
    rewardXp: 110,
    target: 5,
    metric: 'totalDefectsExposed',
  },
  {
    id: 'ms_micro_surgeon',
    title: 'Mikro Cerrah',
    description: 'Atölyede veya acil serviste toplam 4 telefon onarımı tamamla.',
    rewardCash: 3500,
    rewardXp: 135,
    target: 4,
    metric: 'totalPhonesRepaired',
  },
  {
    id: 'ms_brand_new_dealer',
    title: 'Sıfır Kutu Bayisi',
    description: 'Distribütörden getirdiğin 3 adet sıfır kapalı kutu telefonu müşterilere sat.',
    rewardCash: 5000,
    rewardXp: 175,
    target: 3,
    metric: 'totalBrandNewSold',
  },
  {
    id: 'ms_hot_streak',
    title: 'Seri Esnaf (4’lü Anlaşma Serisi)',
    description: 'Müşteri kaçırmadan arka arkaya 4 anlaşma bağlayarak seriyi yakala.',
    rewardCash: 4000,
    rewardXp: 150,
    target: 4,
    metric: 'bestDealStreak',
  },
  {
    id: 'ms_collector_6',
    title: 'Model Koleksiyoneri',
    description: '6 farklı telefon modelini al, onar veya satarak koleksiyonda aç.',
    rewardCash: 4800,
    rewardXp: 165,
    target: 6,
    metric: 'discoveredModels',
  },
  {
    id: 'ms_profit_40k',
    title: 'Altın Tezgah (40.000 ₺ Kâr)',
    description: 'Satış, aksesuar ve servislerden toplam 40.000 ₺ net kâr elde et.',
    rewardCash: 9000,
    rewardXp: 260,
    target: 40000,
    metric: 'totalProfitEarned',
  },
  {
    id: 'ms_tier3_showroom',
    title: 'GSM Showroom Patronu',
    description: 'Şehrin zirvesi 3. Seviye GSM Showroom & Servis merkezini aç.',
    rewardCash: 16000,
    rewardXp: 400,
    target: 3,
    metric: 'shopTier',
  },
];
