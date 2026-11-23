import React, { useEffect, useState } from 'react';
import {
  Award,
  Building2,
  Check,
  Gavel,
  Landmark,
  Megaphone,
  Package,
  Radio,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Store,
  Trophy,
  Wallet,
} from 'lucide-react';
import {
  AUCTION_RIVALS,
  BANK_LOANS,
  BRAND_DISTRIBUTORS,
  CITY_BRANCHES,
  MUSEUM_ITEMS,
} from '../game/catalog';
import {
  calculateMarketValue,
  formatTRY,
  getAccessorySpec,
  roundPrice,
} from '../game/engine';
import { soundFX } from '../game/sound';
import {
  BankLoanOffer,
  BranchId,
  CustomsAuctionLot,
  MuseumItemId,
  OnlineClassifiedListing,
  PhoneDevice,
  ShippingOrder,
  ShopState,
} from '../game/types';

type EmpireSubTab = 'CLASSIFIEDS' | 'AUCTION' | 'BRANCHES' | 'FINANCE' | 'MUSEUM';

interface EmpireViewProps {
  shop: ShopState;
  onBuyClassified: (listingId: string) => void;
  onFulfillShipping: (orderId: string, phoneUid: string) => void;
  onResolveAuction: (wonByPlayer: boolean, finalBid: number) => void;
  onUnlockBranch: (branchId: BranchId) => void;
  onRunRivalPromo: () => void;
  onBuyoutRival: () => void;
  onTakeLoan: (offer: BankLoanOffer) => void;
  onRepayLoanEarly: (loanId: string) => void;
  onPayWeeklyTax: () => void;
  onBuyMuseumItem: (itemId: MuseumItemId) => void;
  onBackToCounter: () => void;
}

const TIER_LABELS: Record<string, string> = {
  entry: 'Giriş Segmenti',
  mid: 'Orta Segment',
  flagship: 'Amiral Gemisi',
  luxury: 'Ultra Lüks',
};

export const EmpireView: React.FC<EmpireViewProps> = ({
  shop,
  onBuyClassified,
  onFulfillShipping,
  onResolveAuction,
  onUnlockBranch,
  onRunRivalPromo,
  onBuyoutRival,
  onTakeLoan,
  onRepayLoanEarly,
  onPayWeeklyTax,
  onBuyMuseumItem,
  onBackToCounter,
}) => {
  const [subTab, setSubTab] = useState<EmpireSubTab>('CLASSIFIEDS');
  const [selectedOrderPhone, setSelectedOrderPhone] = useState<Record<string, string>>({});

  // Live Interactive Auction State
  const lot: CustomsAuctionLot | null = shop.dailyAuctionLot;
  const [auctionStarted, setAuctionStarted] = useState(false);
  const [currentBid, setCurrentBid] = useState(lot?.startingBid ?? 5000);
  const [highestBidder, setHighestBidder] = useState<string>('Açılış Fiyatı');
  const [auctionRound, setAuctionRound] = useState(0);
  const [auctionLog, setAuctionLog] = useState<string[]>([]);
  const [auctionOver, setAuctionOver] = useState(Boolean(lot?.resolved));

  useEffect(() => {
    if (lot) {
      setCurrentBid(lot.resolved ? lot.winningBid : lot.startingBid);
      setAuctionOver(lot.resolved);
      setAuctionStarted(false);
      setAuctionRound(0);
      setHighestBidder(lot.resolved ? (lot.wonByPlayer ? 'Sen Kazandın' : 'Rakip Kazandı') : 'Açılış Fiyatı');
      setAuctionLog(
        lot.resolved
          ? [
              lot.wonByPlayer
                ? `İhaleyi ${formatTRY(lot.winningBid)} teklifle sen kazandın! Cihazlar Atölyeye aktarıldı.`
                : `Bugünkü ihale ${formatTRY(lot.winningBid)} ile başka esnafa gitti.`,
            ]
          : ['Gümrük müdürü çekici kaldırdı! İlk peyi süren palete ortak olur.']
      );
    }
  }, [lot?.id, lot?.resolved]);

  const estimatedLotValue = lot
    ? lot.devices.reduce(
        (sum, d) => sum + calculateMarketValue(d, false, shop.dailyNews),
        0
      ) + 1800
    : 0;

  const handlePlayerBid = (increment: number) => {
    if (!lot || auctionOver) return;
    const nextBid = auctionStarted ? currentBid + increment : lot.startingBid;
    if (shop.cash < nextBid) return;

    soundFX.playClick();
    setAuctionStarted(true);
    setCurrentBid(nextBid);
    setHighestBidder('Sen (GSM Simulator)');
    const nextRound = auctionRound + 1;
    setAuctionRound(nextRound);

    // NPC rivals evaluate whether to counter-bid based on true pallet value
    const maxNpcWillingness = roundPrice(estimatedLotValue * (0.76 + (nextRound % 2) * 0.08));
    const rivalStillInterested =
      nextBid < maxNpcWillingness && nextRound < 5 && Math.random() < 0.72;

    if (rivalStillInterested) {
      const rival = AUCTION_RIVALS[nextRound % AUCTION_RIVALS.length];
      const npcStep = increment >= 2500 ? 1500 : 1000;
      const npcBid = nextBid + npcStep;
      setAuctionLog((prev) => [
        `Sen ${formatTRY(nextBid)} pey sürdün!`,
        `${rival.name} el kaldırdı: "${formatTRY(npcBid)} veriyorum!"`,
        ...prev,
      ]);
      window.setTimeout(() => {
        soundFX.playCounterOffer();
        setCurrentBid(npcBid);
        setHighestBidder(rival.name);
      }, 320);
    } else {
      setAuctionOver(true);
      setAuctionLog((prev) => [
        `Sen ${formatTRY(nextBid)} pey sürdün!`,
        `Satıyorum... Satıyorum... SATILDI! Rakipler çekildi, palet senin!`,
        ...prev,
      ]);
      onResolveAuction(true, nextBid);
    }
  };

  const handleAuctionPass = () => {
    if (!lot || auctionOver) return;
    setAuctionOver(true);
    const rival = AUCTION_RIVALS[0];
    setHighestBidder(rival.name);
    setAuctionLog((prev) => [
      `İhaleden çekildin. Palet ${formatTRY(currentBid)} ile ${rival.name} adına kapandı.`,
      ...prev,
    ]);
    onResolveAuction(false, currentBid);
  };

  const playerShare = shop.rival.boughtOut ? 100 : Math.max(0, 100 - shop.rival.marketShare);
  const daysToNextTax = 7 - (shop.day % 7);

  const tabs: { id: EmpireSubTab; label: string; badge?: string; icon: React.ReactNode }[] = [
    {
      id: 'CLASSIFIEDS',
      label: 'Sarı İlan & Kargo',
      badge: `${shop.onlineListings.filter((l) => !l.bought).length}`,
      icon: <Search className="w-3.5 h-3.5" />,
    },
    {
      id: 'AUCTION',
      label: 'Açık Artırma',
      badge: lot && !lot.resolved ? 'Canlı' : undefined,
      icon: <Gavel className="w-3.5 h-3.5" />,
    },
    {
      id: 'BRANCHES',
      label: 'Şubeler & Rakip',
      badge: `${shop.branches.length}/3`,
      icon: <Building2 className="w-3.5 h-3.5" />,
    },
    {
      id: 'FINANCE',
      label: 'Banka & Vergi',
      badge: shop.weeklyTaxDue > 0 ? 'Fatura' : undefined,
      icon: <Landmark className="w-3.5 h-3.5" />,
    },
    {
      id: 'MUSEUM',
      label: 'Nostalji Müzesi',
      badge: `${shop.museumItems.length}/5`,
      icon: <Trophy className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="flex-1 min-h-0 overflow-y-auto pasaj-scroll p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header & Segmented Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-50">
              Piyasa, Açık Artırma ve GSM İmparatorluğu
            </h2>
            <p className="text-sm text-slate-400 mt-1 tabular-nums">
              Bölge Payın <strong className="text-emerald-400">%{playerShare}</strong> · Açık Şubeler{' '}
              <strong className="text-amber-300">{shop.branches.length}</strong> · Müze{' '}
              <strong className="text-sky-300">{shop.museumItems.length}/5</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-xl bg-[#131A24] p-1 border border-white/10">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setSubTab(t.id);
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  subTab === t.id
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-300 hover:text-slate-50'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
                {t.badge && (
                  <span
                    className={`font-mono text-[10px] font-extrabold rounded px-1 ${
                      subTab === t.id
                        ? 'bg-slate-950/20 text-slate-950'
                        : t.badge === 'Canlı' || t.badge === 'Fatura'
                        ? 'bg-rose-500/25 text-rose-300'
                        : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* SUB-TAB 1: ONLINE CLASSIFIEDS (SARI İLAN) & OUT-OF-TOWN SHIPPING */}
        {subTab === 'CLASSIFIEDS' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Online Second-Hand Listings */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-100">
                    SarıPasaj Günlük 2. El İlanları
                  </h3>
                  <p className="text-xs text-slate-400">
                    Her sabah yenilenir. Kelepir cihazları yakala, atölyede toparlayıp yüksek kârla sat!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onBackToCounter}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 cursor-pointer whitespace-nowrap"
                >
                  Tezgaha Dön →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {shop.onlineListings.map((listing: OnlineClassifiedListing) => {
                  const canAfford = shop.cash >= listing.askingPrice;
                  return (
                    <div
                      key={listing.id}
                      className={`rounded-2xl border p-4 flex flex-col justify-between ${
                        listing.bought
                          ? 'border-emerald-500/25 bg-[#121F1D] opacity-75'
                          : 'border-white/10 bg-[#161E29]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                          <span className="text-slate-400 truncate">
                            {listing.sellerName} · {listing.district}
                          </span>
                          <span
                            className={`font-semibold whitespace-nowrap ${
                              listing.riskTag === 'Kelepir Fırsat'
                                ? 'text-emerald-400'
                                : listing.riskTag === 'Şüpheli İlan'
                                ? 'text-rose-400'
                                : 'text-sky-300'
                            }`}
                          >
                            {listing.riskTag}
                          </span>
                        </div>
                        <h4 className="font-display text-base font-bold text-slate-50">
                          {listing.title}
                        </h4>
                        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                          “{listing.sellerNote}”
                        </p>
                        <div className="mt-2.5 text-[11px] text-slate-400 tabular-nums">
                          {listing.device.hasBoxAndCharger ? 'Kutu Mevcut' : 'Kutusuz'} · Pil Beyanı %
                          {listing.device.reportedBatteryHealth} · Detaylar teslimde görünür
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/8 flex items-center justify-between gap-2">
                        <span className="font-mono text-base font-extrabold text-amber-400 tabular-nums">
                          {formatTRY(listing.askingPrice)}
                        </span>
                        {listing.bought ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                            <Check className="w-3.5 h-3.5" />
                            <span>Atölyeye Alındı</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={!canAfford}
                            onClick={() => onBuyClassified(listing.id)}
                            className="rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-40 cursor-pointer whitespace-nowrap"
                          >
                            Hemen Al
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Out-of-Town Shipping Orders */}
            <div className="lg:col-span-5 space-y-3">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-100">
                  Şehir Dışı Kargo Siparişleri
                </h3>
                <p className="text-xs text-slate-400">
                  Stokundaki uygun telefonu kargola; pazarlık beklemeden piyasa üstü kâr + kargo primi kazan!
                </p>
              </div>

              <div className="space-y-3">
                {shop.shippingOrders.map((order: ShippingOrder) => {
                  const matchingPhones = shop.inventory.filter(
                    (p: PhoneDevice) =>
                      p.tier === order.requestedTier &&
                      (!order.requireClean || p.defects.length === 0)
                  );
                  const chosenUid =
                    selectedOrderPhone[order.id] ?? matchingPhones[0]?.uid ?? '';
                  const chosenPhone = matchingPhones.find((p) => p.uid === chosenUid);
                  const payout = chosenPhone
                    ? roundPrice(
                        calculateMarketValue(chosenPhone, false, shop.dailyNews) *
                          order.bonusMultiplier
                      ) + order.shippingFee
                    : 0;

                  return (
                    <div
                      key={order.id}
                      className={`rounded-2xl border p-4 ${
                        order.fulfilled
                          ? 'border-emerald-500/30 bg-[#132220]'
                          : 'border-white/10 bg-[#161E29]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-200">
                          {order.buyerName} · {order.city}
                        </span>
                        <span className="font-mono font-bold text-emerald-400">
                          {TIER_LABELS[order.requestedTier]}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mb-2.5">
                        {order.note}{' '}
                        <strong className="text-slate-200">
                          {order.requireClean ? '(Kusursuz Şart)' : '(Her Kondisyon)'}
                        </strong>
                      </p>

                      {order.fulfilled ? (
                        <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                          <Check className="w-4 h-4" />
                          <span>Kargo Yola Çıktı & Ödeme Kasaya Yattı</span>
                        </div>
                      ) : matchingPhones.length > 0 ? (
                        <div className="space-y-2">
                          <select
                            value={chosenUid}
                            onChange={(e) =>
                              setSelectedOrderPhone((prev) => ({
                                ...prev,
                                [order.id]: e.target.value,
                              }))
                            }
                            aria-label="Kargolanacak cihazı seç"
                            className="w-full rounded-lg border border-white/12 bg-[#0F141B] px-3 py-2 text-xs text-slate-100"
                          >
                            {matchingPhones.map((p) => (
                              <option key={p.uid} value={p.uid}>
                                {p.brand} {p.model} ({p.defects.length === 0 ? 'Kusursuz' : `${p.defects.length} kusur`})
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            disabled={!chosenPhone}
                            onClick={() =>
                              chosenPhone && onFulfillShipping(order.id, chosenPhone.uid)
                            }
                            className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 cursor-pointer tabular-nums"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Kargola & Tahsil Et ({formatTRY(payout)})</span>
                          </button>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500 italic">
                          Stokta uygun {TIER_LABELS[order.requestedTier]}{' '}
                          {order.requireClean ? 'kusursuz ' : ''}cihaz yok.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 2: LIVE CUSTOMS AUCTION ROOM */}
        {subTab === 'AUCTION' && lot && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 rounded-2xl border border-amber-500/30 bg-[#161E29] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <Radio className="w-4 h-4" />
                    <span>Gümrük & İcra Açık Artırma Odası</span>
                  </span>
                  <span className="text-xs text-slate-400 tabular-nums">
                    Gün {shop.day} Özel Paleti
                  </span>
                </div>

                <h3 className="font-display text-2xl font-bold text-slate-50">
                  {lot.lotTitle}
                </h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  {lot.description}
                </p>

                {/* Pallet Contents Preview */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {lot.devices.map((d) => (
                    <div
                      key={d.uid}
                      className="rounded-xl border border-white/10 bg-[#10161F] px-3.5 py-2.5 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-100">
                          {d.brand} {d.model}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {d.storage} · {auctionOver && lot.wonByPlayer ? `${d.defects.length} kusur` : 'Mühürlü Kutu'}
                        </div>
                      </div>
                      <Package className="w-4 h-4 text-amber-400 shrink-0" />
                    </div>
                  ))}
                  {lot.bonusAccessories.map((acc) => (
                    <div
                      key={acc.id}
                      className="rounded-xl border border-emerald-500/20 bg-[#11201D] px-3.5 py-2.5 flex items-center justify-between"
                    >
                      <div className="text-xs font-semibold text-emerald-200">
                        +{acc.quantity}x {getAccessorySpec(acc.id).name}
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400">Bonus</span>
                    </div>
                  ))}
                </div>

                {/* Live Bid Board */}
                <div className="mt-5 rounded-xl border border-white/10 bg-[#0F141B] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 tabular-nums">
                  <div>
                    <div className="text-xs text-slate-400">Güncel En Yüksek Pey</div>
                    <div className="font-mono text-3xl font-extrabold text-amber-400">
                      {formatTRY(currentBid)}
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <div className="text-xs text-slate-400">Önde Olan Esnaf</div>
                    <div className="text-sm font-bold text-slate-100">{highestBidder}</div>
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="mt-5">
                {auctionOver ? (
                  <div
                    className={`rounded-xl border p-3.5 text-center text-sm font-bold ${
                      lot.wonByPlayer
                        ? 'border-emerald-500/35 bg-emerald-500/12 text-emerald-300'
                        : 'border-white/10 bg-[#121822] text-slate-400'
                    }`}
                  >
                    {lot.wonByPlayer
                      ? `Tebrikler! Palet ${formatTRY(lot.winningBid)} ile senin oldu — Atölye & Toptancı stokuna eklendi!`
                      : 'Bugünkü açık artırma tamamlandı. Yarın yeni gümrük paleti gelecek!'}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      disabled={shop.cash < (auctionStarted ? currentBid + 1000 : lot.startingBid)}
                      onClick={() => handlePlayerBid(1000)}
                      className="rounded-xl bg-amber-500 px-4 py-3 text-xs font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-40 cursor-pointer tabular-nums"
                    >
                      {auctionStarted
                        ? `+1.000 ₺ Pey (${formatTRY(currentBid + 1000)})`
                        : `Açılış Peyi (${formatTRY(lot.startingBid)})`}
                    </button>
                    <button
                      type="button"
                      disabled={shop.cash < (auctionStarted ? currentBid + 2500 : lot.startingBid + 1500)}
                      onClick={() => handlePlayerBid(2500)}
                      className="rounded-xl bg-emerald-500 px-4 py-3 text-xs font-extrabold text-slate-950 hover:bg-emerald-400 disabled:opacity-40 cursor-pointer tabular-nums"
                    >
                      +2.500 ₺ Sert Pey
                    </button>
                    <button
                      type="button"
                      onClick={handleAuctionPass}
                      className="rounded-xl border border-white/15 bg-[#1D2735] px-4 py-3 text-xs font-bold text-slate-200 hover:bg-[#263447] cursor-pointer"
                    >
                      İhaleden Çekil
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Rival Bidders & Live Ticker */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-[#161E29] p-4">
                <h4 className="font-display text-base font-bold text-slate-100 mb-3">
                  Salondaki Rakip Esnaflar
                </h4>
                <div className="space-y-2.5">
                  {AUCTION_RIVALS.map((r) => (
                    <div
                      key={r.name}
                      className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${
                        highestBidder === r.name
                          ? 'border-amber-400/50 bg-amber-500/10'
                          : 'border-white/8 bg-[#111720]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold text-white"
                          style={{ backgroundColor: r.avatarColor }}
                        >
                          {r.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-100">{r.name}</div>
                          <div className="text-[11px] text-slate-400">{r.style}</div>
                        </div>
                      </div>
                      {highestBidder === r.name && (
                        <span className="text-[11px] font-bold text-amber-300">Önde</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#161E29] p-4">
                <h4 className="font-display text-sm font-bold text-slate-200 mb-2.5">
                  Canlı Mezat Akışı
                </h4>
                <div className="space-y-2 max-h-52 overflow-y-auto pasaj-scroll">
                  {auctionLog.map((line, i) => (
                    <div
                      key={i}
                      className={`text-xs rounded-lg px-3 py-2 ${
                        i === 0
                          ? 'bg-amber-500/12 text-amber-100 border border-amber-500/25'
                          : 'bg-[#10161F] text-slate-300'
                      }`}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 3: RIVAL MERCHANT & CITY BRANCHES */}
        {subTab === 'BRANCHES' && (
          <div className="space-y-6">
            {/* Rival Merchant Card (Kurnaz Kerim) */}
            <div className="rounded-2xl border border-rose-500/30 bg-[#181B26] p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold text-rose-300">
                    Pasaj Bölge Rekabeti · Rakip Esnaf
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-50 mt-0.5">
                    {shop.rival.boughtOut
                      ? `${shop.rival.shopName} Artık Senin Markan!`
                      : `Sen vs. ${shop.rival.name} (${shop.rival.shopName})`}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 italic">
                    {shop.rival.lastTaunt}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {!shop.rival.boughtOut && (
                    <>
                      <button
                        type="button"
                        disabled={shop.rival.promoUsedToday || shop.cash < 1500}
                        onClick={onRunRivalPromo}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 px-3.5 py-2.5 text-xs font-bold text-amber-200 hover:bg-amber-500/25 disabled:opacity-40 cursor-pointer whitespace-nowrap"
                      >
                        <Megaphone className="w-3.5 h-3.5" />
                        <span>
                          {shop.rival.promoUsedToday
                            ? 'Bugün Kampanya Yapıldı'
                            : 'Semt Kampanyası (1.500 ₺ · +%9 Pay)'}
                        </span>
                      </button>

                      <button
                        type="button"
                        disabled={playerShare < 65 || shop.cash < shop.rival.buyoutCost}
                        onClick={onBuyoutRival}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-emerald-400 disabled:opacity-40 cursor-pointer whitespace-nowrap tabular-nums"
                      >
                        <Store className="w-3.5 h-3.5" />
                        <span>
                          {playerShare < 65
                            ? `Devral (%65 Pay Gerekli)`
                            : `Dükkanını Devral (${formatTRY(shop.rival.buyoutCost)})`}
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Market Share Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5 tabular-nums">
                  <span className="text-emerald-400">Senin Semt Payın: %{playerShare}</span>
                  <span className="text-rose-400">
                    {shop.rival.boughtOut ? 'Devralındı (+3.500 ₺/gün)' : `${shop.rival.name}: %${shop.rival.marketShare}`}
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-rose-500/30 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-300"
                    style={{ width: `${playerShare}%` }}
                  />
                </div>
              </div>
            </div>

            {/* City Branches Grid */}
            <div>
              <h3 className="font-display text-lg font-bold text-slate-100 mb-3">
                Şehir Şube Ağı (Günlük Pasif Gelir & Gece Kazancı)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {CITY_BRANCHES.map((branch) => {
                  const owned = shop.branches.includes(branch.id);
                  const meetsReq =
                    shop.level >= branch.minLevel &&
                    shop.reputation >= branch.minReputation;
                  const canAfford = shop.cash >= branch.unlockCost;

                  return (
                    <div
                      key={branch.id}
                      className={`rounded-2xl border p-5 flex flex-col justify-between ${
                        owned
                          ? 'border-emerald-500/40 bg-[#132220]'
                          : 'border-white/10 bg-[#161E29]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-amber-300 font-semibold">{branch.district}</span>
                          <span className="font-mono text-emerald-400 font-bold tabular-nums">
                            +{formatTRY(branch.dailyNetIncome)}/gün
                          </span>
                        </div>
                        <h4 className="font-display text-lg font-bold text-slate-50">
                          {branch.name}
                        </h4>
                        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                          {branch.description}
                        </p>
                        <div className="mt-3 pt-3 border-t border-white/8 space-y-1 text-xs text-slate-400 tabular-nums">
                          <div>
                            Çevrimdışı Gelir:{' '}
                            <strong className="text-sky-300">
                              +{formatTRY(branch.offlineHourlyRate)} / saat
                            </strong>
                          </div>
                          <div>
                            Prestij: <strong className="text-amber-300">+{branch.prestigeBonus}</strong> · Şart: Sv.{' '}
                            {branch.minLevel} & {branch.minReputation.toFixed(1)}★
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        {owned ? (
                          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2.5 text-center text-xs font-bold text-emerald-300">
                            Aktif Şube · Gelir Otomatik Yatıyor
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={!meetsReq || !canAfford}
                            onClick={() => onUnlockBranch(branch.id)}
                            className="w-full rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-40 cursor-pointer tabular-nums"
                          >
                            {!meetsReq
                              ? `Sv. ${branch.minLevel} & ${branch.minReputation.toFixed(1)}★ Gerekli`
                              : `Şube Aç (${formatTRY(branch.unlockCost)})`}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 4: BANK LOANS, WEEKLY TAX & DISTRIBUTOR LOYALTY */}
        {subTab === 'FINANCE' && (
          <div className="space-y-6">
            {/* Weekly Tax & Active Loans Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Weekly Tax & Utilities */}
              <div className="rounded-2xl border border-white/10 bg-[#161E29] p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Haftalık Vergi & Elektrik Faturası</span>
                    </span>
                    <span className="text-xs text-slate-400 tabular-nums">
                      Sonraki Fatura: {daysToNextTax} gün sonra
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Her 7 günde bir dükkan elektriği, POS bakım ve esnaf vergisi kesilir. Zamanında ödersen{' '}
                    <strong className="text-emerald-400">+0.10★ Temiz Esnaf İtibarı</strong> kazanırsın.
                  </p>
                  <div className="mt-4 font-mono text-2xl font-extrabold tabular-nums">
                    {shop.weeklyTaxDue > 0 ? (
                      <span className="text-rose-400">Ödenecek: {formatTRY(shop.weeklyTaxDue)}</span>
                    ) : (
                      <span className="text-emerald-400">Vergi Borcu Yok · Temiz</span>
                    )}
                  </div>
                </div>
                {shop.weeklyTaxDue > 0 && (
                  <button
                    type="button"
                    disabled={shop.cash < shop.weeklyTaxDue}
                    onClick={onPayWeeklyTax}
                    className="mt-4 w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-emerald-400 disabled:opacity-40 cursor-pointer tabular-nums"
                  >
                    Faturayı Öde ({formatTRY(shop.weeklyTaxDue)}) · +0.10★
                  </button>
                )}
              </div>

              {/* Active Loans */}
              <div className="rounded-2xl border border-white/10 bg-[#161E29] p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-300">
                    <Wallet className="w-4 h-4" />
                    <span>Aktif Kredilerin ({shop.activeLoans.length}/2)</span>
                  </span>
                </div>
                {shop.activeLoans.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    Şu an aktif kredi borcun yok. Büyük açık artırmalar veya şube açılışı için aşağıdan esnaf kredisi çekebilirsin.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {shop.activeLoans.map((loan) => (
                      <div
                        key={loan.id}
                        className="rounded-xl border border-white/10 bg-[#10161F] p-3 flex items-center justify-between gap-3 tabular-nums"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-100">{loan.name}</div>
                          <div className="text-[11px] text-slate-400">
                            Kalan: <strong className="text-rose-300">{formatTRY(loan.remainingBalance)}</strong> · Günlük{' '}
                            {formatTRY(loan.dailyPayment)} ({loan.daysLeft} gün)
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={shop.cash < loan.remainingBalance}
                          onClick={() => onRepayLoanEarly(loan.id)}
                          className="rounded-lg border border-emerald-500/40 bg-emerald-500/12 px-3 py-1.5 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-40 cursor-pointer whitespace-nowrap"
                        >
                          Erken Kapat
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bank Loan Offers */}
            <div>
              <h3 className="font-display text-lg font-bold text-slate-100 mb-3">
                Esnaf Bankası Kredi Paketleri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {BANK_LOANS.map((offer) => {
                  const totalRepay = roundPrice(offer.principal * (1 + offer.interestRate));
                  const dailyPay = Math.ceil(totalRepay / offer.termDays);
                  const canTake = shop.activeLoans.length < 2;

                  return (
                    <div
                      key={offer.id}
                      className="rounded-2xl border border-white/10 bg-[#161E29] p-5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-sky-300 font-semibold">{offer.termDays} Gün Vade</span>
                          <span className="font-mono text-amber-300">
                            %{Math.round(offer.interestRate * 100)} Faiz
                          </span>
                        </div>
                        <h4 className="font-display text-lg font-bold text-slate-50">
                          {offer.name}
                        </h4>
                        <div className="font-mono text-2xl font-extrabold text-emerald-400 mt-1 tabular-nums">
                          +{formatTRY(offer.principal)}
                        </div>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                          {offer.description}
                        </p>
                        <div className="mt-3 pt-2.5 border-t border-white/8 text-[11px] text-slate-400 tabular-nums">
                          Toplam Geri Ödeme: <strong className="text-slate-200">{formatTRY(totalRepay)}</strong> · Günlük{' '}
                          <strong className="text-rose-300">{formatTRY(dailyPay)}</strong>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={!canTake}
                        onClick={() => onTakeLoan(offer)}
                        className="mt-4 w-full rounded-xl bg-sky-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-sky-400 disabled:opacity-40 cursor-pointer"
                      >
                        {canTake ? 'Krediyi Kasaya Aktar' : 'Maksimum 2 Aktif Kredi'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Distributor Loyalty Contracts */}
            <div className="rounded-2xl border border-white/10 bg-[#161E29] p-5">
              <h3 className="font-display text-base font-bold text-slate-100 mb-1">
                Distribütör Sadakat Sözleşmeleri (Resmi Yetkili Bayi İskontosu)
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Toptancıdan her 2 sıfır telefon çektiğinde ilgili distribütörde ekstra kalıcı %2 indirim kazanırsın (en fazla -%6)!
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {BRAND_DISTRIBUTORS.map((dist) => {
                  const units = shop.distributorLoyalty?.[dist.id] ?? 0;
                  const discountPct = Math.min(6, Math.floor(units / 2) * 2);
                  return (
                    <div
                      key={dist.id}
                      className="rounded-xl border border-white/10 bg-[#10161F] p-3.5 tabular-nums"
                    >
                      <div className="text-xs font-bold text-slate-100 truncate">{dist.name}</div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Çekilen Sıfır: <strong className="text-slate-200">{units} adet</strong>
                      </div>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-amber-400"
                          style={{ width: `${Math.min(100, (units / 6) * 100)}%` }}
                        />
                      </div>
                      <div className="mt-1.5 text-[11px] font-bold text-emerald-400">
                        {discountPct > 0
                          ? `Yetkili Bayi: -%${discountPct} Ek İskonto`
                          : 'İlk iskonto için 2 sıfır al'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 5: NOSTALGIA MUSEUM */}
        {subTab === 'MUSEUM' && (
          <div>
            <div className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/8 px-4 py-3 text-xs text-amber-100 leading-relaxed">
              Efsanevi nostaljik telefonları toplayıp dükkan müzende sergile! Her efsane parça{' '}
              <strong>kalıcı Prestij</strong>, <strong>günlük pasif nakit</strong> ve{' '}
              <strong>çevrimdışı gelir</strong> kazandırır.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MUSEUM_ITEMS.map((item) => {
                const owned = shop.museumItems.includes(item.id);
                const canAfford = shop.cash >= item.cost;

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-5 flex flex-col justify-between ${
                      owned
                        ? 'border-amber-400/45 bg-[#1B222D]'
                        : 'border-white/10 bg-[#161E29]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span
                          className="font-mono font-bold px-2 py-0.5 rounded bg-white/5"
                          style={{ color: item.accentColor }}
                        >
                          {item.year} Efsanesi
                        </span>
                        <span className="font-mono font-bold text-amber-300 tabular-nums">
                          +{item.prestigeBonus} Prestij
                        </span>
                      </div>
                      <h4 className="font-display text-lg font-bold text-slate-50 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 shrink-0" style={{ color: item.accentColor }} />
                        <span>{item.name}</span>
                      </h4>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                        {item.story}
                      </p>
                      <div className="mt-3 pt-2.5 border-t border-white/8 text-xs text-emerald-400 font-semibold tabular-nums">
                        Günlük Müze Trafiği: +{formatTRY(item.dailyPassiveCash)} / gün
                      </div>
                    </div>

                    <div className="mt-4">
                      {owned ? (
                        <div className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-500/35 bg-emerald-500/12 py-2.5 text-xs font-bold text-emerald-300">
                          <Award className="w-4 h-4" />
                          <span>Müze Vitrininde Sergileniyor</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={!canAfford}
                          onClick={() => onBuyMuseumItem(item.id)}
                          className="w-full rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-40 cursor-pointer tabular-nums"
                        >
                          Koleksiyona Kat ({formatTRY(item.cost)})
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
