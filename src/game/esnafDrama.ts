// Multi-Day Fate-Changing "Esnaf Draması" Story Quest System
// Dynamically evaluates live shop conditions at morning start (high debt, high prestige,
// rival conflict, cash empire, or staff crisis) and launches multi-day story arcs.

import {
  EsnafDramaChoiceSpec,
  EsnafDramaObjectiveKind,
  EsnafDramaState,
  EsnafDramaTriggerKind,
  ShopState,
} from './types';

export interface EsnafDramaTemplate {
  id: string;
  triggerKind: EsnafDramaTriggerKind;
  triggerBadgeTr: string;
  triggerBadgeEn: string;
  titleTr: string;
  titleEn: string;
  characterName: string;
  characterRoleTr: string;
  characterRoleEn: string;
  storyTr: string;
  storyEn: string;
  choices: EsnafDramaChoiceSpec[];
}

export const ESNAF_DRAMA_CATALOG: EsnafDramaTemplate[] = [
  {
    id: 'drama_debt_collector',
    triggerKind: 'HIGH_DEBT',
    triggerBadgeTr: 'BORÇ KISKACI · KRİZ',
    triggerBadgeEn: 'DEBT CRUNCH · CRISIS',
    titleTr: 'Alacaklı Müfettiş Kapıda!',
    titleEn: 'Creditor Inspector at the Door!',
    characterName: 'Tarık Bey',
    characterRoleTr: 'Banka & Pasaj Alacak Temsilcisi',
    characterRoleEn: 'Bank & Arcade Debt Officer',
    storyTr:
      'Kredi ve vergi defterin kırmızı alarm veriyor usta! Pasaj yönetimi 3 gün içinde dükkanın döndüğünü görmezse vitrine icra mührü vurulabilir. Ya onurlu bir satış/tamir seferberliğiyle borcunu erit, ya da acil yapılandırmaya git!',
    storyEn:
      'Your debt ledger is flashing red! Unless you prove your shop can turn strong business within 3 days, creditors may seal your showcase. Choose your fate!',
    choices: [
      {
        id: 'debt_resist_sales',
        labelTr: 'Onurlu Direniş · 3 Günde 3 Satış',
        labelEn: 'Stand Firm · Sell 3 Phones in 3 Days',
        descTr: 'Başarırsan toplam borcunun %45’i silinir + 8.500 ₺ destek ve +0.35★ itibar!',
        descEn: 'Success wipes 45% of loan debt + 8,500 ₺ relief & +0.35★ rep!',
        riskTagTr: '3 Günlük Kader Görevi',
        riskTagEn: '3-Day Fate Quest',
        tone: 'heroic',
        quest: {
          durationDays: 3,
          objectiveKind: 'SELL_PHONES',
          target: 3,
          objectiveLabelTr: '3 Telefon Satışı Kapat',
          objectiveLabelEn: 'Close 3 Phone Sales',
          successTitleTr: 'İcra Kalktı · Demir Esnaf Kazandı!',
          successTitleEn: 'Seizure Cancelled · Iron Merchant Wins!',
          successDescTr:
            'Tarık Bey tezgahındaki hareketliliği görünce şapka çıkardı. Banka borcunun %45’i yapılandırma indirimiyle silindi ve pasaj esnafı seni alkışladı!',
          successDescEn:
            'Impressed by your counter volume, the creditor forgave 45% of your loan balance and praised your resilience!',
          successCashDelta: 8500,
          successRepDelta: 0.35,
          successDebtCutRatio: 0.45,
          failTitleTr: 'Süre Doldu · Gecikme Cezası!',
          failTitleEn: 'Time Expired · Overdue Penalty!',
          failDescTr:
            'Hedef satışa ulaşılamadı. Alacaklılar gecikme ihtarı kesip dükkanın moralini sarstı.',
          failDescEn: 'You missed the sales target and took a late penalty fee.',
          failCashDelta: -3500,
          failRepDelta: -0.25,
        },
      },
      {
        id: 'debt_workshop_hustle',
        labelTr: 'Atölye Seferberliği · 3 Günde 2 Tamir',
        labelEn: 'Workshop Sprint · Repair 2 Devices',
        descTr: 'Başarırsan borcunun %35’i silinir + 6.500 ₺ nakit ve +0.25★ itibar.',
        descEn: 'Success cuts 35% of loan debt + 6,500 ₺ cash & +0.25★ rep.',
        riskTagTr: '3 Günlük Kader Görevi',
        riskTagEn: '3-Day Fate Quest',
        tone: 'pragmatic',
        quest: {
          durationDays: 3,
          objectiveKind: 'REPAIR_PHONES',
          target: 2,
          objectiveLabelTr: '2 Cihaz Tamir Et',
          objectiveLabelEn: 'Repair 2 Devices',
          successTitleTr: 'Usta Ellerin Dükkanı Kurtardı!',
          successTitleEn: 'Craftsmanship Saved the Shop!',
          successDescTr:
            'Atölyeden çıkan kusursuz tamirler alacaklıları ikna etti; borcun %35’i silindi ve kasana can suyu girdi.',
          successDescEn:
            'Your rapid workshop turnaround convinced creditors to cut 35% of your debt!',
          successCashDelta: 6500,
          successRepDelta: 0.25,
          successDebtCutRatio: 0.35,
          failTitleTr: 'Atölye Yetişmedi',
          failTitleEn: 'Workshop Missed Deadline',
          failDescTr: 'Tamirler zamanında bitmeyince gecikme faizi kesildi.',
          failDescEn: 'Repairs fell short of the deadline, incurring a late fee.',
          failCashDelta: -2500,
          failRepDelta: -0.2,
        },
      },
      {
        id: 'debt_instant_settle',
        labelTr: 'Acil Uzlaşma · Peşin Kapat',
        labelEn: 'Emergency Settlement · Pay Now',
        descTr: 'Anında -2.000 ₺ öde, borçların %20’sini bugün düşür (görev yok, -0.10★).',
        descEn: 'Pay -2,000 ₺ now to cut 20% of debt immediately (-0.10★).',
        riskTagTr: 'Anında Karar',
        riskTagEn: 'Instant Decision',
        tone: 'risky',
        immediateCashDelta: -2000,
        immediateRepDelta: -0.1,
        immediateDebtCutRatio: 0.2,
      },
    ],
  },
  {
    id: 'drama_tv_documentary',
    triggerKind: 'HIGH_PRESTIGE',
    triggerBadgeTr: 'YÜKSEK PRESTİJ · ŞÖHRET',
    triggerBadgeEn: 'HIGH PRESTIGE · SPOTLIGHT',
    titleTr: 'Belgesel Ekibi Dükkanında!',
    titleEn: 'Tech Documentary Crew Arrives!',
    characterName: 'Kerem Can',
    characterRoleTr: 'Teknoloji Yayıncısı & Belgesel Yönetmeni',
    characterRoleEn: 'Tech YouTuber & Documentary Host',
    storyTr:
      'Dükkanının namı ve yüksek prestijin tüm şehre yayıldı! "Pasajın Efsane Telefon Ustası" bölümü için 3 gün boyunca tezgahını çekmek istiyoruz. Şovu başarıyla tamamlarsan tüm pasaj sana akacak; çuvallarsan sosyal medyada olay olur!',
    storyEn:
      'Your shop prestige went viral! We want to film "Legend of the Tech Arcade" at your counter for 3 days. Ace the spotlight to crush rivals, or risk bad press!',
    choices: [
      {
        id: 'tv_live_sales',
        labelTr: 'Canlı Yayına Çık · 3 Günde 4 Satış',
        labelEn: 'Go Live · Close 4 Sales in 3 Days',
        descTr: 'Başarırsan +22.000 ₺ sponsorluk, +0.40★ ve rakibin pazar payı -%18 çöker!',
        descEn: 'Success pays +22,000 ₺ sponsorship, +0.40★ & -18% rival share!',
        riskTagTr: '3 Günlük Kader Görevi',
        riskTagEn: '3-Day Fate Quest',
        tone: 'heroic',
        quest: {
          durationDays: 3,
          objectiveKind: 'SELL_PHONES',
          target: 4,
          objectiveLabelTr: 'Kameralar Önünde 4 Satış Kapat',
          objectiveLabelEn: 'Close 4 Sales on Camera',
          successTitleTr: 'Belgesel Viral Oldu · Pasajın Kralısın!',
          successTitleEn: 'Documentary Went Viral!',
          successDescTr:
            'Bölüm 2 milyon izlendi! Sponsorluk çeki kasana yattı, müşteriler kapıda kuyruk oldu ve Kurnaz Kerim’in payı eridi!',
          successDescEn:
            'The episode hit 2M views! Sponsorship cash landed and rival market share collapsed!',
          successCashDelta: 22000,
          successRepDelta: 0.4,
          successRivalShareDelta: -18,
          failTitleTr: 'Yayın Sönük Kaldı',
          failTitleEn: 'Broadcast Fell Flat',
          failDescTr:
            'Kamera karşısında beklenen satış temposu tutmayınca bölüm kısa kesildi.',
          failDescEn: 'Slow counter pace forced the crew to cut the segment short.',
          failCashDelta: -2500,
          failRepDelta: -0.22,
          failRivalShareDelta: 5,
        },
      },
      {
        id: 'tv_repair_showcase',
        labelTr: 'Ustalık Şovu · 3 Günde 3 Tamir',
        labelEn: 'Repair Showcase · Fix 3 Devices',
        descTr: 'Başarırsan +18.000 ₺, +0.35★ itibar ve rakip payı -%12 düşer.',
        descEn: 'Success awards +18,000 ₺, +0.35★ rep & -12% rival share.',
        riskTagTr: '3 Günlük Kader Görevi',
        riskTagEn: '3-Day Fate Quest',
        tone: 'pragmatic',
        quest: {
          durationDays: 3,
          objectiveKind: 'REPAIR_PHONES',
          target: 3,
          objectiveLabelTr: 'Canlı Yayında 3 Cihaz Tamir Et',
          objectiveLabelEn: 'Repair 3 Devices on Camera',
          successTitleTr: 'Altın Havya Ödülü Senin!',
          successTitleEn: 'Golden Soldering Iron Award!',
          successDescTr:
            'Mikro lehim şovun izleyenleri büyüledi! +18.000 ₺ sponsorluk ve dev prestij kazandın.',
          successDescEn:
            'Your live micro-soldering wowed viewers for +18,000 ₺ and massive prestige!',
          successCashDelta: 18000,
          successRepDelta: 0.35,
          successRivalShareDelta: -12,
          failTitleTr: 'Atölye Çekimi İptal',
          failTitleEn: 'Workshop Shoot Cancelled',
          failDescTr: 'Yeterli tamir görüntüsü çıkmayınca yayın iptal oldu.',
          failDescEn: 'Not enough completed repairs to air the episode.',
          failCashDelta: -1500,
          failRepDelta: -0.15,
        },
      },
      {
        id: 'tv_decline_humble',
        labelTr: 'Mütevazı Kal · Kamerasız Devam',
        labelEn: 'Stay Humble · Decline Cameras',
        descTr: 'Risk alma: mahalle esnafının takdirini kazan (+2.500 ₺, +0.10★).',
        descEn: 'Play it safe and earn local respect (+2,500 ₺, +0.10★).',
        riskTagTr: 'Güvenli Seçim',
        riskTagEn: 'Safe Choice',
        tone: 'risky',
        immediateCashDelta: 2500,
        immediateRepDelta: 0.1,
      },
    ],
  },
  {
    id: 'drama_rival_smear',
    triggerKind: 'RIVAL_WAR',
    triggerBadgeTr: 'PASAJ REKABETİ · İFTİRA',
    triggerBadgeEn: 'RIVAL WAR · SMEAR CAMPAIGN',
    titleTr: 'Kurnaz Kerim’in Kirli Oyunu!',
    titleEn: 'Cunning Kerim’s Smear Campaign!',
    characterName: 'Muhtar Nuri Amca',
    characterRoleTr: 'Pasaj Esnaf Temsilcisi',
    characterRoleEn: 'Arcade Merchants Elder',
    storyTr:
      'Evlat koş! Rakibin Kurnaz Kerim yerel forumlara senin hakkında "yan sanayi parça takıyorlar" diye asılsız dedikodu salmış. 3 gün içinde esnaflığını gösterip bu iftirayı tersine çevirmezsen müşterilerin yarısı ona kayacak!',
    storyEn:
      'Your rival Cunning Kerim spread fake rumors online accusing your shop of shady parts! Win back the arcade within 3 days or lose market share!',
    choices: [
      {
        id: 'rival_tea_charm',
        labelTr: 'Gönül Alma Seferberliği · 4 Çay İkramı',
        labelEn: 'Hospitality Blitz · Serve 4 Teas',
        descTr: '3 günde 4 müşteriye çay ikram et → İftira geri teper! Kerim -%20 pay, +11.000 ₺, +0.35★.',
        descEn: 'Serve 4 teas in 3 days → Rumor backfires! Rival -20% share, +11,000 ₺, +0.35★.',
        riskTagTr: '3 Günlük Kader Görevi',
        riskTagEn: '3-Day Fate Quest',
        tone: 'heroic',
        quest: {
          durationDays: 3,
          objectiveKind: 'SERVE_TEAS',
          target: 4,
          objectiveLabelTr: '4 Müşteriye Çay İkram Et',
          objectiveLabelEn: 'Serve Tea to 4 Customers',
          successTitleTr: 'İftira Geri Tepti · Kerim Rezil Oldu!',
          successTitleEn: 'Rumor Backfired · Rival Humiliated!',
          successDescTr:
            'Sıcak çayın ve samimi esnaflığın pasajda olay oldu; herkes Kerim’in yalan söylediğini anladı!',
          successDescEn:
            'Your warm hospitality exposed Kerim’s lies across the entire arcade!',
          successCashDelta: 11000,
          successRepDelta: 0.35,
          successRivalShareDelta: -20,
          failTitleTr: 'Dedikodu Yayıldı',
          failTitleEn: 'Rumors Spread',
          failDescTr: 'Müşterilerin gönlünü zamanında alamadın; Kerim pazar payı kaptı.',
          failDescEn: 'Rumors lingered and Kerim captured extra market share.',
          failCashDelta: -2000,
          failRepDelta: -0.2,
          failRivalShareDelta: 10,
        },
      },
      {
        id: 'rival_sales_crush',
        labelTr: 'Satışla Yanıt Ver · 3 Günde 3 Satış',
        labelEn: 'Answer With Sales · Sell 3 Phones',
        descTr: 'Başarırsan +14.000 ₺, +0.30★ ve Kerim’in payı -%15 düşer.',
        descEn: 'Success awards +14,000 ₺, +0.30★ & -15% rival share.',
        riskTagTr: '3 Günlük Kader Görevi',
        riskTagEn: '3-Day Fate Quest',
        tone: 'pragmatic',
        quest: {
          durationDays: 3,
          objectiveKind: 'SELL_PHONES',
          target: 3,
          objectiveLabelTr: '3 Güvenilir Satış Kapat',
          objectiveLabelEn: 'Close 3 Trusted Sales',
          successTitleTr: 'Tezgahın Cevabı Yeter!',
          successTitleEn: 'Sales Spoke Louder Than Rumors!',
          successDescTr:
            'Memnun müşteriler forumda övgü yağdırdı; Kerim’in tezgahı sinek avlıyor!',
          successDescEn: 'Happy buyers flooded local forums with 5-star praise!',
          successCashDelta: 14000,
          successRepDelta: 0.3,
          successRivalShareDelta: -15,
          failTitleTr: 'Kerim Üstünlük Kurdu',
          failTitleEn: 'Rival Gained Ground',
          failDescTr: 'Satış hedefi tutmayınca rakip bu hafta öne geçti.',
          failDescEn: 'Missed sales target let Kerim gain ground this week.',
          failCashDelta: -1500,
          failRepDelta: -0.18,
          failRivalShareDelta: 8,
        },
      },
      {
        id: 'rival_legal_notice',
        labelTr: 'Avukat İhtarnamesi · Anında Tekzip',
        labelEn: 'Legal Notice · Instant Retraction',
        descTr: '-4.000 ₺ avukat masrafıyla dedikoduyu bugün sustur (Kerim -%8 pay, +0.15★).',
        descEn: 'Pay -4,000 ₺ for instant legal retraction (Rival -8%, +0.15★).',
        riskTagTr: 'Anında Karar',
        riskTagEn: 'Instant Decision',
        tone: 'risky',
        immediateCashDelta: -4000,
        immediateRepDelta: 0.15,
        immediateRivalShareDelta: -8,
      },
    ],
  },
  {
    id: 'drama_vip_legacy',
    triggerKind: 'CASH_EMPIRE',
    triggerBadgeTr: 'BÜYÜK SERMAYE · MİRAS',
    triggerBadgeEn: 'CASH EMPIRE · LEGACY',
    titleTr: 'Kurucu Usta’nın VIP Defteri',
    titleEn: 'Founder’s Secret VIP Ledger',
    characterName: 'Hacı Refik Usta',
    characterRoleTr: 'Emekli Pasaj Kurucusu',
    characterRoleEn: 'Retired Arcade Founder',
    storyTr:
      'Genç usta, kasandaki bereketi ve temiz ticaretini uzaktan izledim. 30 yıllık özel VIP müşteri ve toptancı çevremi sana devretmek istiyorum. Önümüzdeki 4 günde ustalığını kanıtla, pasajın yeni lideri sen ol!',
    storyEn:
      'I have watched your wealth and craftsmanship grow. Prove yourself over the next 4 days and I will hand over my 30-year VIP client ledger and founder fund!',
    choices: [
      {
        id: 'vip_profit_trial',
        labelTr: 'Büyük Kâr İmtihanı · 4 Günde +18.000 ₺ Kâr',
        labelEn: 'Profit Trial · Earn 18,000 ₺ in 4 Days',
        descTr: 'Başarırsan +30.000 ₺ VIP miras fonu ve +0.45★ dev itibar!',
        descEn: 'Success awards +30,000 ₺ VIP legacy fund & +0.45★ rep!',
        riskTagTr: '4 Günlük Kader Görevi',
        riskTagEn: '4-Day Fate Quest',
        tone: 'heroic',
        quest: {
          durationDays: 4,
          objectiveKind: 'EARN_PROFIT',
          target: 18000,
          objectiveLabelTr: '18.000 ₺ Kâr Elde Et',
          objectiveLabelEn: 'Earn 18,000 ₺ Profit',
          successTitleTr: 'Pasajın Yeni Lideri İlan Edildin!',
          successTitleEn: 'Crowned New Leader of the Arcade!',
          successDescTr:
            'Hacı Refik altın kaplama müşteri defterini sana emanet etti! +30.000 ₺ nakit ve +0.45★ itibar kazandın.',
          successDescEn:
            'Refik entrusted his golden VIP ledger to you along with +30,000 ₺ and +0.45★!',
          successCashDelta: 30000,
          successRepDelta: 0.45,
          successRivalShareDelta: -12,
          failTitleTr: 'İmtihan Yarım Kaldı',
          failTitleEn: 'Trial Incomplete',
          failDescTr: 'Hedef kâr yakalanamadı; Hacı Refik defteri başka bahara erteledi.',
          failDescEn: 'Profit goal missed; Refik postponed the handover.',
          failCashDelta: 0,
          failRepDelta: -0.1,
        },
      },
      {
        id: 'vip_repair_trial',
        labelTr: 'Zanaat İmtihanı · 3 Günde 3 Tamir',
        labelEn: 'Craft Trial · Repair 3 Devices',
        descTr: 'Başarırsan +20.000 ₺ ve +0.35★ itibar!',
        descEn: 'Success awards +20,000 ₺ & +0.35★ reputation!',
        riskTagTr: '3 Günlük Kader Görevi',
        riskTagEn: '3-Day Fate Quest',
        tone: 'pragmatic',
        quest: {
          durationDays: 3,
          objectiveKind: 'REPAIR_PHONES',
          target: 3,
          objectiveLabelTr: '3 Kusursuz Tamir Yap',
          objectiveLabelEn: 'Complete 3 Repairs',
          successTitleTr: 'Ustalık Beratı & VIP Fonu!',
          successTitleEn: 'Master Charter & VIP Fund!',
          successDescTr:
            'Hacı Refik atölye disiplinini ayakta alkışladı ve +20.000 ₺ ile seni ödüllendirdi.',
          successDescEn: 'Refik applauded your bench discipline and gifted +20,000 ₺!',
          successCashDelta: 20000,
          successRepDelta: 0.35,
          failTitleTr: 'Zanaat Testi Yetişmedi',
          failTitleEn: 'Craft Trial Missed',
          failDescTr: '3 tamire ulaşılamadı; fırsat başka güne kaldı.',
          failDescEn: 'Did not complete 3 repairs in time.',
          failCashDelta: 0,
          failRepDelta: -0.08,
        },
      },
      {
        id: 'vip_polite_pass',
        labelTr: 'Teşekkür Et · Kendi Yolundan Git',
        labelEn: 'Politely Decline · Stay Independent',
        descTr: 'Hacı Refik’in hayır duasını ve +4.000 ₺ jestini al (+0.10★).',
        descEn: 'Accept a friendly +4,000 ₺ gift & +0.10★ with zero pressure.',
        riskTagTr: 'Güvenli Seçim',
        riskTagEn: 'Safe Choice',
        tone: 'risky',
        immediateCashDelta: 4000,
        immediateRepDelta: 0.1,
      },
    ],
  },
  {
    id: 'drama_staff_poach',
    triggerKind: 'STAFF_CRISIS',
    triggerBadgeTr: 'EKİP KRİZİ · SADAKAT',
    triggerBadgeEn: 'STAFF CRISIS · LOYALTY',
    titleTr: 'AVM Zinciri Ekibine Göz Dikti!',
    titleEn: 'Mall Chain Tries to Poach Staff!',
    characterName: 'Selin Hanım',
    characterRoleTr: 'Büyük AVM Zinciri İK Direktörü',
    characterRoleEn: 'Mega-Mall Chain HR Director',
    storyTr:
      'Ekibindeki ustaların başarısı kulaklarına gitmiş! Dev bir AVM zinciri çalışanlarına yüksek maaş teklif ediyor. 3 gün içinde güçlü bir iş hacmi gösterip ekibini arkanda tutabilirsen sadakatleri tavan yapacak!',
    storyEn:
      'A giant mall chain is trying to poach your trained staff! Rally your team with strong performance over the next 3 days to cement their loyalty!',
    choices: [
      {
        id: 'staff_rally_sales',
        labelTr: 'Prim Dağıt & 3 Günde 3 Satış Yap',
        labelEn: 'Bonus Rally · Close 3 Sales in 3 Days',
        descTr: 'Bugün -2.000 ₺ moral primi ver; başarırsan +15.000 ₺ verimlilik patlaması & +0.30★!',
        descEn: 'Pay -2,000 ₺ morale bonus now; win +15,000 ₺ team surge & +0.30★!',
        riskTagTr: '3 Günlük Kader Görevi',
        riskTagEn: '3-Day Fate Quest',
        tone: 'heroic',
        immediateCashDelta: -2000,
        quest: {
          durationDays: 3,
          objectiveKind: 'SELL_PHONES',
          target: 3,
          objectiveLabelTr: 'Ekiple 3 Satış Kapat',
          objectiveLabelEn: 'Close 3 Team Sales',
          successTitleTr: 'Ekip Kenetlendi · Teklif Reddedildi!',
          successTitleEn: 'Team United · Poachers Rejected!',
          successDescTr:
            'Çalışanların "Biz bu tezgahın ailesiyiz!" diyerek AVM teklifini elinin tersiyle itti! +15.000 ₺ motivasyon cirosu!',
          successDescEn:
            'Your crew turned down the mall offer and sparked a +15,000 ₺ morale boom!',
          successCashDelta: 15000,
          successRepDelta: 0.3,
          failTitleTr: 'Ekip Morali Düştü',
          failTitleEn: 'Team Morale Dipped',
          failDescTr: 'Hedef tutmayınca ekip kısa süreli bir motivasyon kaybı yaşadı.',
          failDescEn: 'Missed target left team morale shaken for the week.',
          failCashDelta: -1500,
          failRepDelta: -0.18,
        },
      },
      {
        id: 'staff_bench_bond',
        labelTr: 'Omuz Omuza Tamir · 3 Günde 2 Tamir',
        labelEn: 'Shoulder-to-Shoulder · 2 Repairs',
        descTr: 'Ücretsiz karar; 3 günde 2 tamirle ekibi motive et (+12.000 ₺, +0.25★).',
        descEn: 'No upfront cost; finish 2 repairs in 3 days (+12,000 ₺, +0.25★).',
        riskTagTr: '3 Günlük Kader Görevi',
        riskTagEn: '3-Day Fate Quest',
        tone: 'pragmatic',
        quest: {
          durationDays: 3,
          objectiveKind: 'REPAIR_PHONES',
          target: 2,
          objectiveLabelTr: '2 Cihaz Tamir Et',
          objectiveLabelEn: 'Repair 2 Devices',
          successTitleTr: 'Usta-Çırak Bağı Sarsılmaz!',
          successTitleEn: 'Unbreakable Workshop Bond!',
          successDescTr:
            'Tezgahta omuz omuza çalışınca ekip AVM teklifini reddetti ve +12.000 ₺ ekstra gelir getirdi!',
          successDescEn: 'Hands-on leadership won their loyalty and +12,000 ₺!',
          successCashDelta: 12000,
          successRepDelta: 0.25,
          failTitleTr: 'Gergin Hafta',
          failTitleEn: 'Tense Week',
          failDescTr: 'Tamir hedefi kaçınca ekipte huzursuzluk oldu.',
          failDescEn: 'Missed repair target lowered morale slightly.',
          failCashDelta: -1000,
          failRepDelta: -0.12,
        },
      },
      {
        id: 'staff_no_action',
        labelTr: 'Serbest Bırak · Karışma',
        labelEn: 'Do Nothing · Let It Slide',
        descTr: 'Nakit harcama ama dükkan itibarı hafifçe düşer (-0.15★).',
        descEn: 'Spend nothing, but shop reputation slips slightly (-0.15★).',
        riskTagTr: 'Anında Karar',
        riskTagEn: 'Instant Decision',
        tone: 'risky',
        immediateRepDelta: -0.15,
      },
    ],
  },
];

export function getDramaTemplate(dramaId: string): EsnafDramaTemplate | undefined {
  return ESNAF_DRAMA_CATALOG.find((d) => d.id === dramaId);
}

/**
 * Evaluates live shop state at morning start and triggers a context-appropriate
 * multi-day "Esnaf Draması" story arc when eligible.
 */
export function maybeTriggerMorningDrama(
  state: ShopState,
  prestigeScore: number
): EsnafDramaState | null {
  if (state.activeDrama) return null;
  if (state.day < 3) return null;
  const lastDay = state.lastDramaDay ?? 0;
  if (lastDay > 0 && state.day - lastDay < 3) return null;

  const completed = new Set(state.completedDramaIds ?? []);
  const totalLoanDebt = (state.activeLoans ?? []).reduce(
    (sum, l) => sum + l.remainingBalance,
    0
  );
  const hasHighDebt =
    totalLoanDebt >= 18000 ||
    (state.weeklyTaxDue ?? 0) >= 3500 ||
    (state.day >= 4 && state.cash < 4000);
  const hasHighPrestige =
    state.reputation >= 4.2 || prestigeScore >= 35 || state.shopTier >= 3;
  const hasCashEmpire =
    state.cash >= 48000 ||
    (state.museumItems?.length ?? 0) >= 1 ||
    (state.prestigeLevel ?? 0) >= 1;
  const hasStaffCrisis = (state.staff?.length ?? 0) >= 1 && state.day >= 4;
  const hasRivalTension = !state.rival?.boughtOut && state.day >= 3;

  // Priority order based on most dramatic current shop condition
  const candidateOrder: { id: string; eligible: boolean }[] = [
    { id: 'drama_debt_collector', eligible: hasHighDebt },
    { id: 'drama_tv_documentary', eligible: hasHighPrestige },
    { id: 'drama_staff_poach', eligible: hasStaffCrisis },
    { id: 'drama_vip_legacy', eligible: hasCashEmpire },
    { id: 'drama_rival_smear', eligible: hasRivalTension },
  ];

  // Pick first eligible uncompleted drama; if all completed, allow re-triggering eligible arcs after 6 days
  let pickedId = candidateOrder.find((c) => c.eligible && !completed.has(c.id))?.id;
  if (!pickedId && (lastDay === 0 || state.day - lastDay >= 6)) {
    pickedId = candidateOrder.find((c) => c.eligible)?.id;
  }
  if (!pickedId) return null;

  const tpl = getDramaTemplate(pickedId);
  if (!tpl) return null;

  return {
    dramaId: tpl.id,
    triggerKind: tpl.triggerKind,
    triggerBadgeTr: tpl.triggerBadgeTr,
    triggerBadgeEn: tpl.triggerBadgeEn,
    titleTr: tpl.titleTr,
    titleEn: tpl.titleEn,
    characterName: tpl.characterName,
    characterRoleTr: tpl.characterRoleTr,
    characterRoleEn: tpl.characterRoleEn,
    storyTr: tpl.storyTr,
    storyEn: tpl.storyEn,
    startedDay: state.day,
    phase: 'CHOICE',
    progress: 0,
    target: 0,
    daysLeft: 0,
    durationDays: 0,
  };
}

function applyDramaEffects(
  state: ShopState,
  opts: {
    cashDelta?: number;
    repDelta?: number;
    debtCutRatio?: number;
    rivalShareDelta?: number;
  }
): { nextState: ShopState; summaryTr: string; summaryEn: string } {
  const partsTr: string[] = [];
  const partsEn: string[] = [];

  let nextCash = state.cash;
  if (opts.cashDelta && opts.cashDelta !== 0) {
    nextCash = Math.max(0, nextCash + opts.cashDelta);
    const sign = opts.cashDelta > 0 ? '+' : '-';
    const absStr = Math.abs(opts.cashDelta).toLocaleString('tr-TR');
    partsTr.push(`${sign}${absStr} ₺`);
    partsEn.push(`${sign}${absStr} ₺`);
  }

  let nextRep = state.reputation;
  if (opts.repDelta && opts.repDelta !== 0) {
    nextRep = Math.max(1, Math.min(5, nextRep + opts.repDelta));
    const sign = opts.repDelta > 0 ? '+' : '';
    partsTr.push(`${sign}${opts.repDelta.toFixed(2)}★`);
    partsEn.push(`${sign}${opts.repDelta.toFixed(2)}★`);
  }

  let nextLoans = state.activeLoans ?? [];
  let nextTax = state.weeklyTaxDue ?? 0;
  if (opts.debtCutRatio && opts.debtCutRatio > 0) {
    const ratio = opts.debtCutRatio;
    const prevDebt =
      nextLoans.reduce((s, l) => s + l.remainingBalance, 0) + nextTax;
    nextLoans = nextLoans
      .map((l) => ({
        ...l,
        remainingBalance: Math.round(l.remainingBalance * (1 - ratio)),
      }))
      .filter((l) => l.remainingBalance > 0);
    nextTax = Math.round(nextTax * (1 - ratio));
    const cutPct = Math.round(ratio * 100);
    if (prevDebt > 0) {
      partsTr.push(`Borç -%${cutPct}`);
      partsEn.push(`Debt -${cutPct}%`);
    }
  }

  let nextRival = state.rival;
  if (opts.rivalShareDelta && opts.rivalShareDelta !== 0 && !state.rival.boughtOut) {
    const nextShare = Math.max(
      5,
      Math.min(85, state.rival.marketShare + opts.rivalShareDelta)
    );
    nextRival = { ...state.rival, marketShare: nextShare };
    const sign = opts.rivalShareDelta > 0 ? '+' : '';
    partsTr.push(`Rakip Payı ${sign}%${opts.rivalShareDelta}`);
    partsEn.push(`Rival Share ${sign}${opts.rivalShareDelta}%`);
  }

  const nextState: ShopState = {
    ...state,
    cash: nextCash,
    reputation: nextRep,
    activeLoans: nextLoans,
    weeklyTaxDue: nextTax,
    rival: nextRival,
    totalProfitEarned:
      opts.cashDelta && opts.cashDelta > 0
        ? state.totalProfitEarned + opts.cashDelta
        : state.totalProfitEarned,
  };

  return {
    nextState,
    summaryTr: partsTr.join(' · ') || 'Karar uygulandı',
    summaryEn: partsEn.join(' · ') || 'Decision applied',
  };
}

/**
 * Applies the player's decision on a morning Esnaf Draması.
 */
export function applyDramaChoice(
  state: ShopState,
  choiceId: string
): ShopState {
  const drama = state.activeDrama;
  if (!drama || drama.phase !== 'CHOICE') return state;
  const tpl = getDramaTemplate(drama.dramaId);
  const choice = tpl?.choices.find((c) => c.id === choiceId);
  if (!tpl || !choice) return state;

  const { nextState, summaryTr, summaryEn } = applyDramaEffects(state, {
    cashDelta: choice.immediateCashDelta,
    repDelta: choice.immediateRepDelta,
    debtCutRatio: choice.immediateDebtCutRatio,
    rivalShareDelta: choice.immediateRivalShareDelta,
  });

  // If this choice has a multi-day quest, activate it!
  if (choice.quest) {
    return {
      ...nextState,
      lastDramaDay: state.day,
      activeDrama: {
        ...drama,
        phase: 'ACTIVE_QUEST',
        chosenChoiceId: choice.id,
        chosenLabelTr: choice.labelTr,
        chosenLabelEn: choice.labelEn,
        objectiveKind: choice.quest.objectiveKind,
        objectiveLabelTr: choice.quest.objectiveLabelTr,
        objectiveLabelEn: choice.quest.objectiveLabelEn,
        progress: 0,
        target: choice.quest.target,
        daysLeft: choice.quest.durationDays,
        durationDays: choice.quest.durationDays,
      },
    };
  }

  // Otherwise resolve immediately as a one-shot turning point
  const prevDone = state.completedDramaIds ?? [];
  return {
    ...nextState,
    lastDramaDay: state.day,
    completedDramaIds: prevDone.includes(drama.dramaId)
      ? prevDone
      : [...prevDone, drama.dramaId],
    activeDrama: {
      ...drama,
      phase: 'RESOLVED_SUCCESS',
      chosenChoiceId: choice.id,
      chosenLabelTr: choice.labelTr,
      chosenLabelEn: choice.labelEn,
      outcomeTitleTr: choice.labelTr,
      outcomeTitleEn: choice.labelEn,
      outcomeDescTr: choice.descTr,
      outcomeDescEn: choice.descEn,
      outcomeSummaryTr: summaryTr,
      outcomeSummaryEn: summaryEn,
    },
  };
}

/**
 * Advances progress on an active multi-day Esnaf Draması quest.
 * Automatically resolves with the fate reward the moment target is reached.
 */
export function advanceDramaProgress(
  state: ShopState,
  kind: EsnafDramaObjectiveKind,
  delta: number
): ShopState {
  const drama = state.activeDrama;
  if (!drama || drama.phase !== 'ACTIVE_QUEST' || drama.objectiveKind !== kind || delta <= 0) {
    return state;
  }

  const nextProgress = Math.min(drama.target, drama.progress + delta);
  if (nextProgress < drama.target) {
    return {
      ...state,
      activeDrama: {
        ...drama,
        progress: nextProgress,
      },
    };
  }

  // Completed! Apply fate-changing success reward!
  const tpl = getDramaTemplate(drama.dramaId);
  const choice = tpl?.choices.find((c) => c.id === drama.chosenChoiceId);
  const q = choice?.quest;
  if (!q) {
    return {
      ...state,
      activeDrama: { ...drama, progress: nextProgress, phase: 'RESOLVED_SUCCESS' },
    };
  }

  const { nextState, summaryTr, summaryEn } = applyDramaEffects(state, {
    cashDelta: q.successCashDelta,
    repDelta: q.successRepDelta,
    debtCutRatio: q.successDebtCutRatio,
    rivalShareDelta: q.successRivalShareDelta,
  });

  const prevDone = state.completedDramaIds ?? [];
  return {
    ...nextState,
    lastDramaDay: state.day,
    completedDramaIds: prevDone.includes(drama.dramaId)
      ? prevDone
      : [...prevDone, drama.dramaId],
    activeDrama: {
      ...drama,
      progress: drama.target,
      phase: 'RESOLVED_SUCCESS',
      outcomeTitleTr: q.successTitleTr,
      outcomeTitleEn: q.successTitleEn,
      outcomeDescTr: q.successDescTr,
      outcomeDescEn: q.successDescEn,
      outcomeSummaryTr: summaryTr,
      outcomeSummaryEn: summaryEn,
    },
  };
}

/**
 * Ticks down remaining days on an active multi-day Esnaf Draması at morning transition.
 * If time expires before completion, resolves as RESOLVED_FAIL with consequences.
 */
export function tickDramaOnNewDay(state: ShopState): ShopState {
  const drama = state.activeDrama;
  if (!drama || drama.phase !== 'ACTIVE_QUEST') return state;

  const nextDaysLeft = drama.daysLeft - 1;
  if (nextDaysLeft > 0) {
    return {
      ...state,
      activeDrama: {
        ...drama,
        daysLeft: nextDaysLeft,
      },
    };
  }

  // Expired without completing target -> apply consequence
  const tpl = getDramaTemplate(drama.dramaId);
  const choice = tpl?.choices.find((c) => c.id === drama.chosenChoiceId);
  const q = choice?.quest;
  if (!q) {
    return {
      ...state,
      activeDrama: { ...drama, daysLeft: 0, phase: 'RESOLVED_FAIL' },
    };
  }

  const { nextState, summaryTr, summaryEn } = applyDramaEffects(state, {
    cashDelta: q.failCashDelta,
    repDelta: q.failRepDelta,
    rivalShareDelta: q.failRivalShareDelta,
  });

  const prevDone = state.completedDramaIds ?? [];
  return {
    ...nextState,
    lastDramaDay: state.day,
    completedDramaIds: prevDone.includes(drama.dramaId)
      ? prevDone
      : [...prevDone, drama.dramaId],
    activeDrama: {
      ...drama,
      daysLeft: 0,
      phase: 'RESOLVED_FAIL',
      outcomeTitleTr: q.failTitleTr,
      outcomeTitleEn: q.failTitleEn,
      outcomeDescTr: q.failDescTr,
      outcomeDescEn: q.failDescEn,
      outcomeSummaryTr: summaryTr,
      outcomeSummaryEn: summaryEn,
    },
  };
}
