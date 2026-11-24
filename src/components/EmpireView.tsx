import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Award,
  Building2,
  Calculator,
  Check,
  Clock,
  Gavel,
  Handshake,
  Landmark,
  Lock,
  Megaphone,
  Package,
  Radio,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Store,
  Trophy,
  Truck,
  Wallet,
  XCircle,
} from 'lucide-react';
import MUSEUM_BANNER_IMAGE from '../assets/images/museum_retro_showcase_1795476278430.jpg';
import {
  AUCTION_RIVALS,
  BANK_LOANS,
  BRAND_DISTRIBUTORS,
  CITY_BRANCHES,
  DEFECT_CATALOG,
  MUSEUM_ITEMS,
  SHOP_TIERS,
} from '../game/catalog';
import {
  calculateDeviceValuationBreakdown,
  calculateMarketValue,
  formatTRY,
  getAccessorySpec,
  getEffectiveLoanTerms,
  getEffectiveSalesTaxRate,
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
import { MuseumPhoneArt } from './VisualShowcaseArt';

type EmpireSubTab = 'CLASSIFIEDS' | 'AUCTION' | 'BRANCHES' | 'FINANCE' | 'MUSEUM';

export const CLASSIFIED_ONSITE_FEE = 250;
export const CLASSIFIED_COD_FEE = 350;

interface EmpireViewProps {
  shop: ShopState;
  onInspectClassifiedOnsite: (listingId: string) => void;
  onOrderClassifiedCod: (listingId: string) => void;
  onHaggleClassified: (listingId: string, offerPrice: number) => void;
  onBuyClassified: (listingId: string) => void;
  onRejectClassified: (listingId: string) => void;
  onFulfillShipping: (orderId: string, phoneUid: string) => void;
  onResolveAuction: (lotId: string, wonByPlayer: boolean, finalBid: number) => void;
  onUnlockBranch: (branchId: BranchId) => void;
  onRunRivalPromo: () => void;
  onBuyoutRival: () => void;
  onTakeLoan: (offer: BankLoanOffer) => void;
  onRepayLoanEarly: (loanId: string) => void;
  onPayWeeklyTax: () => void;
  onBuyMuseumItem: (itemId: MuseumItemId) => void;
  onGoToStaff?: () => void;
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
  onInspectClassifiedOnsite,
  onOrderClassifiedCod,
  onHaggleClassified,
  onBuyClassified,
  onRejectClassified,
  onFulfillShipping,
  onResolveAuction,
  onUnlockBranch,
  onRunRivalPromo,
  onBuyoutRival,
  onTakeLoan,
  onRepayLoanEarly,
  onPayWeeklyTax,
  onBuyMuseumItem,
  onGoToStaff,
  onBackToCounter,
}) => {
  const [subTab, setSubTab] = useState<EmpireSubTab>('CLASSIFIEDS');
  const [selectedOrderPhone, setSelectedOrderPhone] = useState<Record<string, string>>({});
  const [haggleOffers, setHaggleOffers] = useState<Record<string, number>>({});

  // Multi-Lot Daily Auctions (2-3 sessions per day)
  const lots: CustomsAuctionLot[] =
    shop.dailyAuctionLots && shop.dailyAuctionLots.length > 0
      ? shop.dailyAuctionLots
      : shop.dailyAuctionLot
      ? [shop.dailyAuctionLot]
      : [];
  const [selectedLotId, setSelectedLotId] = useState<string>(lots[0]?.id ?? '');

  useEffect(() => {
    if (lots.length > 0 && !lots.some((l) => l.id === selectedLotId)) {
      const firstOpen = lots.find((l) => !l.resolved) ?? lots[0];
      setSelectedLotId(firstOpen.id);
    }
  }, [lots, selectedLotId]);

  const lot: CustomsAuctionLot | null =
    lots.find((l) => l.id === selectedLotId) ?? lots[0] ?? null;

  const [auctionStarted, setAuctionStarted] = useState(false);
  const [currentBid, setCurrentBid] = useState(lot?.startingBid ?? 5000);
  const [highestBidder, setHighestBidder] = useState<string>('Açılış Fiyatı');
  const [auctionRound, setAuctionRound] = useState(0);
  const [auctionLog, setAuctionLog] = useState<string[]>([]);
  const [auctionOver, setAuctionOver] = useState(Boolean(lot?.resolved));
  const [isRivalThinking, setIsRivalThinking] = useState(false);

  // Sync Sarı İlan haggle offer down whenever a seller counter-offer lowers currentPrice
  useEffect(() => {
    setHaggleOffers((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const listing of shop.onlineListings) {
        const curPrice = listing.currentPrice ?? listing.askingPrice;
        if (next[listing.id] !== undefined && next[listing.id] >= curPrice) {
          next[listing.id] = roundPrice(Math.max(1000, curPrice - 500));
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [shop.onlineListings]);

  useEffect(() => {
    if (lot) {
      setCurrentBid(lot.resolved ? lot.winningBid : lot.startingBid);
      setAuctionOver(lot.resolved);
      setAuctionStarted(false);
      setAuctionRound(0);
      setIsRivalThinking(false);
      setHighestBidder(
        lot.resolved ? (lot.wonByPlayer ? 'Sen Kazandın' : 'Rakip Kazandı') : 'Açılış Fiyatı'
      );
      setAuctionLog(
        lot.resolved
          ? [
              lot.wonByPlayer
                ? `İhaleyi ${formatTRY(lot.winningBid)} teklifle sen kazandın! Cihazlar Atölyeye aktarıldı.`
                : `Bu seans ${formatTRY(lot.winningBid)} ile başka esnafa gitti.`,
            ]
          : ['Gümrük müdürü çekici kaldırdı! İlk peyi süren palete ortak olur.']
      );
    }
  }, [lot?.id, lot?.resolved]);

  const estimatedLotValue = lot
    ? lot.devices.reduce(
        (sum, d) => sum + calculateMarketValue(d, false, shop.dailyNews, shop.upgrades),
        0
      ) + 1800
    : 0;

  const handlePlayerBid = (increment: number) => {
    if (!lot || auctionOver || isRivalThinking) return;
    const nextBid = auctionStarted
      ? currentBid + increment
      : increment >= 2500
      ? lot.startingBid + 1500
      : lot.startingBid;
    if (shop.cash < nextBid) return;

    soundFX.playClick();
    setAuctionStarted(true);
    setCurrentBid(nextBid);
    setHighestBidder('Sen (GSM Simulator)');
    const nextRound = auctionRound + 1;
    setAuctionRound(nextRound);

    const maxNpcWillingness = roundPrice(
      estimatedLotValue * (0.76 + (nextRound % 2) * 0.08)
    );
    const rivalStillInterested =
      nextBid < maxNpcWillingness && nextRound < 5 && Math.random() < 0.72;

    if (rivalStillInterested) {
      const rival = AUCTION_RIVALS[nextRound % AUCTION_RIVALS.length];
      const npcStep = increment >= 2500 ? 1500 : 1000;
      const npcBid = nextBid + npcStep;
      setIsRivalThinking(true);
      setAuctionLog((prev) => [
        `Sen ${formatTRY(nextBid)} pey sürdün!`,
        `${rival.name} el kaldırdı: "${formatTRY(npcBid)} veriyorum!"`,
        ...prev,
      ]);
      window.setTimeout(() => {
        soundFX.playCounterOffer();
        setCurrentBid(npcBid);
        setHighestBidder(rival.name);
        setIsRivalThinking(false);
      }, 320);
    } else {
      setAuctionOver(true);
      setAuctionLog((prev) => [
        `Sen ${formatTRY(nextBid)} pey sürdün!`,
        `Satıyorum... Satıyorum... SATILDI! Rakipler çekildi, palet senin!`,
        ...prev,
      ]);
      onResolveAuction(lot.id, true, nextBid);
    }
  };

  const handleAuctionPass = () => {
    if (!lot || auctionOver || isRivalThinking) return;
    setAuctionOver(true);
    const rival = AUCTION_RIVALS[0];
    setHighestBidder(rival.name);
    setAuctionLog((prev) => [
      `İhaleden çekildin. Palet ${formatTRY(currentBid)} ile ${rival.name} adına kapandı.`,
      ...prev,
    ]);
    onResolveAuction(lot.id, false, currentBid);
  };

  const playerShare = shop.rival.boughtOut ? 100 : Math.max(0, 100 - shop.rival.marketShare);
  const daysToNextTax = 7 - (shop.day % 7);
  const openAuctionCount = lots.filter((l) => !l.resolved).length;
  const activeClassifiedsCount = shop.onlineListings.filter(
    (l) => !l.bought && l.status !== 'REJECTED'
  ).length;
  const hasAccountant = shop.staff.includes('accountant');
  const accountantLevel = shop.staffLevels?.accountant ?? 1;
  const salesTaxRate = getEffectiveSalesTaxRate(shop.staff, shop.staffLevels);
  const accountantLoanDiscount = hasAccountant && accountantLevel >= 5;

  const tabs: { id: EmpireSubTab; label: string; badge?: string; icon: React.ReactNode }[] = [
    {
      id: 'CLASSIFIEDS',
      label: 'Sarı İlan & Kargo',
      badge: `${activeClassifiedsCount}`,
      icon: <Search className="w-3.5 h-3.5" />,
    },
    {
      id: 'AUCTION',
      label: 'Açık Artırma',
      badge: openAuctionCount > 0 ? `${openAuctionCount} Canlı` : undefined,
      icon: <Gavel className="w-3.5 h-3.5" />,
    },
    {
      id: 'BRANCHES',
      label: 'Şubeler & Rakip',
      badge: `${shop.branches.length}/${CITY_BRANCHES.length}`,
      icon: <Building2 className="w-3.5 h-3.5" />,
    },
    {
      id: 'FINANCE',
      label: 'Banka & Vergi',
      badge: shop.weeklyTaxDue > 0 ? 'Fatura' : `%${Math.round(salesTaxRate * 100)}`,
      icon: <Landmark className="w-3.5 h-3.5" />,
    },
    {
      id: 'MUSEUM',
      label: 'Nostalji Müzesi',
      badge: `${shop.museumItems.length}/${MUSEUM_ITEMS.length}`,
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
              <strong className="text-amber-300">
                {shop.branches.length}/{CITY_BRANCHES.length}
              </strong>{' '}
              · Satış Vergisi{' '}
              <strong className="text-sky-300">%{Math.round(salesTaxRate * 100)}</strong>
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
                        : t.badge.includes('Canlı') || t.badge === 'Fatura'
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

        {/* SUB-TAB 1: ONLINE CLASSIFIEDS (INSPECT + COD + HAGGLE) & SHIPPING */}
        {subTab === 'CLASSIFIEDS' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Online Second-Hand Listings */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-100">
                    SarıPasaj 2. El İlanları (Kontrol Et & Pazarlık Yap)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Körlemesine alma! İster semte gidip yerinde incele, ister kapıda kontrollü kargo ile getirt; kusur çıkarsa satıcıyla sıkı pazarlık et.
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
                  const status = listing.status ?? (listing.bought ? 'BOUGHT' : 'AVAILABLE');
                  const currentPrice = listing.currentPrice ?? listing.askingPrice;
                  const isInspected =
                    status === 'INSPECTED_ONSITE' || status === 'ARRIVED_COD';
                  const defaultOffer = roundPrice(Math.max(1000, currentPrice * 0.86));
                  const offerVal = Math.min(
                    Math.max(1000, currentPrice - 250),
                    haggleOffers[listing.id] ?? defaultOffer
                  );
                  const listingValuation = calculateDeviceValuationBreakdown(
                    listing.device,
                    currentPrice,
                    shop.upgrades,
                    shop.dailyNews,
                    shop.level,
                    shop.legacyPath,
                    false
                  );

                  return (
                    <div
                      key={listing.id}
                      className={`rounded-2xl border p-4 flex flex-col justify-between ${
                        status === 'BOUGHT'
                          ? 'border-emerald-500/30 bg-[#121F1D] opacity-80'
                          : status === 'REJECTED'
                          ? 'border-rose-500/20 bg-[#1B151A] opacity-65'
                          : isInspected
                          ? 'border-amber-400/40 bg-[#18212E]'
                          : status === 'SHIPPING_IN_TRANSIT'
                          ? 'border-sky-500/35 bg-[#131F2D]'
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
                              status === 'ARRIVED_COD'
                                ? 'text-sky-300'
                                : status === 'INSPECTED_ONSITE'
                                ? 'text-amber-300'
                                : listing.riskTag === 'Kelepir Fırsat'
                                ? 'text-emerald-400'
                                : listing.riskTag === 'Şüpheli İlan'
                                ? 'text-rose-400'
                                : 'text-sky-300'
                            }`}
                          >
                            {status === 'ARRIVED_COD'
                              ? 'Kargo Geldi · Test Et'
                              : status === 'INSPECTED_ONSITE'
                              ? 'Yerinde Kontrol Edildi'
                              : listing.riskTag}
                          </span>
                        </div>

                        <h4 className="font-display text-base font-bold text-slate-50">
                          {listing.title}
                        </h4>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          “{listing.sellerNote}”
                        </p>

                        {/* Pre-inspection summary vs Post-inspection full expert report */}
                        {!isInspected ? (
                          <div className="mt-2.5 text-[11px] text-slate-400 tabular-nums">
                            {listing.device.hasBoxAndCharger ? 'Kutu Mevcut' : 'Kutusuz'} · Beyan Pil %
                            {listing.device.reportedBatteryHealth} · Gerçek kusurlar kontrolde çıkar
                          </div>
                        ) : (
                          <div className="mt-3 rounded-xl border border-white/10 bg-[#0F151E] p-2.5 space-y-1.5 text-[11px] tabular-nums">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Gerçek Pil · Mevcut Piyasa</span>
                              <span className="font-mono font-bold text-slate-200">
                                %{listing.device.batteryHealth} · {formatTRY(listingValuation.asIsValue)}
                              </span>
                            </div>
                            {listingValuation.estimatedRepairCost > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400">
                                  Tamir Sonrası (-{formatTRY(listingValuation.estimatedRepairCost)})
                                </span>
                                <span className="font-mono font-bold text-amber-300">
                                  {formatTRY(listingValuation.postRepairValue)}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center justify-between pt-1 border-t border-white/8">
                              <span className="text-slate-400">Tahmini Net Kâr (İlan Fiyatından)</span>
                              <span
                                className={`font-mono font-extrabold ${
                                  listingValuation.projectedNetProfit >= 0
                                    ? 'text-emerald-400'
                                    : 'text-rose-400'
                                }`}
                              >
                                {listingValuation.projectedNetProfit >= 0 ? '+' : ''}
                                {formatTRY(listingValuation.projectedNetProfit)}
                              </span>
                            </div>
                            {listing.device.defects.length === 0 ? (
                              <div className="text-emerald-400 font-semibold">
                                ✓ Ekspertiz Temiz: Gizli kusur bulunmadı!
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <div className="text-rose-300 font-semibold flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>
                                    {listing.device.defects.length} Gizli Kusur Tespit Edildi:
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {listing.device.defects.map((dId) => (
                                    <span
                                      key={dId}
                                      className="rounded bg-rose-500/15 border border-rose-500/30 px-1.5 py-0.5 text-[10px] font-semibold text-rose-200"
                                    >
                                      {DEFECT_CATALOG[dId].name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {listing.lastSellerReply && (
                              <div className="pt-1 border-t border-white/8 text-amber-200 italic">
                                Satıcı: “{listing.lastSellerReply}”
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-4 pt-3 border-t border-white/8 space-y-2.5">
                        <div className="flex items-center justify-between gap-2 tabular-nums">
                          <div>
                            <div className="text-[10px] text-slate-400">
                              {currentPrice < listing.askingPrice ? 'Pazarlık Sonrası' : 'İlan Fiyatı'}
                            </div>
                            <span className="font-mono text-base font-extrabold text-amber-400">
                              {formatTRY(currentPrice)}
                            </span>
                            {currentPrice < listing.askingPrice && (
                              <span className="ml-1.5 font-mono text-[11px] text-slate-500 line-through">
                                {formatTRY(listing.askingPrice)}
                              </span>
                            )}
                          </div>

                          {status === 'BOUGHT' && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                              <Check className="w-3.5 h-3.5" />
                              <span>Atölyeye Alındı</span>
                            </span>
                          )}
                          {status === 'REJECTED' && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>İlan Kapandı</span>
                            </span>
                          )}
                          {status === 'SHIPPING_IN_TRANSIT' && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-sky-500/15 border border-sky-400/30 px-2.5 py-1 text-[11px] font-bold text-sky-200">
                              <Truck className="w-3.5 h-3.5" />
                              <span>Kargoda ({listing.deliveryDaysLeft ?? 1} Gün)</span>
                            </span>
                          )}
                        </div>

                        {status === 'AVAILABLE' && (
                          <div className="grid grid-cols-1 gap-1.5">
                            <button
                              type="button"
                              disabled={shop.cash < CLASSIFIED_ONSITE_FEE}
                              onClick={() => onInspectClassifiedOnsite(listing.id)}
                              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-40 cursor-pointer tabular-nums"
                            >
                              <Search className="w-3.5 h-3.5" />
                              <span>Yerinde Kontrol Et ({formatTRY(CLASSIFIED_ONSITE_FEE)})</span>
                            </button>
                            <button
                              type="button"
                              disabled={shop.cash < CLASSIFIED_COD_FEE}
                              onClick={() => onOrderClassifiedCod(listing.id)}
                              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-sky-500/35 bg-sky-500/12 px-3 py-2 text-xs font-bold text-sky-200 hover:bg-sky-500/20 disabled:opacity-40 cursor-pointer tabular-nums"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Kapıda Kontrol Kargo ({formatTRY(CLASSIFIED_COD_FEE)} · 1 Gün)</span>
                            </button>
                          </div>
                        )}

                        {isInspected && (
                          <div className="space-y-2">
                            {/* Haggle Controls */}
                            <div className="rounded-lg border border-white/10 bg-[#10161F] p-2 space-y-1.5">
                              <div className="flex items-center justify-between text-[11px] tabular-nums">
                                <span className="text-slate-400">
                                  Teklifin ({listing.haggleAttempts ?? 0}/3 tur)
                                </span>
                                <span className="font-mono font-bold text-amber-300">
                                  {formatTRY(offerVal)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setHaggleOffers((prev) => ({
                                      ...prev,
                                      [listing.id]: Math.max(1000, offerVal - 1000),
                                    }))
                                  }
                                  className="flex-1 rounded bg-[#1B2534] py-1 text-[10px] font-bold text-slate-200 hover:bg-[#253347] cursor-pointer"
                                >
                                  -1.000
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setHaggleOffers((prev) => ({
                                      ...prev,
                                      [listing.id]: Math.max(1000, offerVal - 500),
                                    }))
                                  }
                                  className="flex-1 rounded bg-[#1B2534] py-1 text-[10px] font-bold text-slate-200 hover:bg-[#253347] cursor-pointer"
                                >
                                  -500
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setHaggleOffers((prev) => ({
                                      ...prev,
                                      [listing.id]: Math.min(currentPrice, offerVal + 500),
                                    }))
                                  }
                                  className="flex-1 rounded bg-[#1B2534] py-1 text-[10px] font-bold text-slate-200 hover:bg-[#253347] cursor-pointer"
                                >
                                  +500
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onHaggleClassified(listing.id, offerVal)}
                                  className="inline-flex items-center gap-1 rounded bg-amber-500/20 border border-amber-400/40 px-2.5 py-1 text-[10px] font-extrabold text-amber-200 hover:bg-amber-500/30 cursor-pointer whitespace-nowrap"
                                >
                                  <Handshake className="w-3 h-3" />
                                  <span>Pazarlık</span>
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-1.5">
                              <button
                                type="button"
                                disabled={shop.cash < currentPrice}
                                onClick={() => onBuyClassified(listing.id)}
                                className="col-span-2 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-extrabold text-slate-950 hover:bg-emerald-400 disabled:opacity-40 cursor-pointer tabular-nums"
                              >
                                Al ({formatTRY(currentPrice)})
                              </button>
                              <button
                                type="button"
                                onClick={() => onRejectClassified(listing.id)}
                                className="rounded-lg border border-white/12 bg-[#1D2735] px-2 py-2 text-xs font-semibold text-slate-300 hover:bg-[#263447] cursor-pointer"
                              >
                                Vazgeç
                              </button>
                            </div>
                          </div>
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
                  Stokundaki uygun telefonu kargola; pazarlık beklemeden piyasa üstü kâr + kargo primi kazan! (Satış vergisi: %{Math.round(salesTaxRate * 100)})
                </p>
              </div>

              <div className="space-y-3">
                {shop.shippingOrders.map((order: ShippingOrder) => {
                  const matchingPhones = shop.inventory.filter(
                    (p: PhoneDevice) =>
                      p.tier === order.requestedTier &&
                      !p.assignedToStaff &&
                      (!order.requireClean || p.defects.length === 0)
                  );
                  const chosenUid =
                    selectedOrderPhone[order.id] ?? matchingPhones[0]?.uid ?? '';
                  const chosenPhone = matchingPhones.find((p) => p.uid === chosenUid);
                  const grossPayout = chosenPhone
                    ? roundPrice(
                        calculateMarketValue(
                          chosenPhone,
                          false,
                          shop.dailyNews,
                          shop.upgrades
                        ) * order.bonusMultiplier
                      ) + order.shippingFee
                    : 0;
                  const netPayout = Math.round(grossPayout * (1 - salesTaxRate));

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
                          <span>Kargo Yola Çıktı & Net Ödeme Kasaya Yattı</span>
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
                                {p.brand} {p.model} (
                                {p.defects.length === 0 ? 'Kusursuz' : `${p.defects.length} kusur`})
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
                            <span>
                              Kargola & Tahsil Et (Net ~{formatTRY(netPayout)})
                            </span>
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

        {/* SUB-TAB 2: MULTI-SESSION DAILY CUSTOMS AUCTIONS (2-3 PER DAY) */}
        {subTab === 'AUCTION' && lot && (
          <div className="space-y-4">
            {/* Daily Session Selector */}
            <div className="flex flex-wrap items-center gap-2">
              {lots.map((item, idx) => {
                const isSelected = item.id === lot.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setSelectedLotId(item.id);
                    }}
                    className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                        : item.resolved
                        ? 'border-white/8 bg-[#121822] text-slate-400'
                        : 'border-white/12 bg-[#161E29] text-slate-200 hover:border-amber-400/40'
                    }`}
                  >
                    <Gavel className="w-3.5 h-3.5" />
                    <span>
                      {idx + 1}. {item.sessionLabel ?? `Seans #${idx + 1}`}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-mono ${
                        item.resolved
                          ? item.wonByPlayer
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-white/10 text-slate-400'
                          : 'bg-rose-500/25 text-rose-200'
                      }`}
                    >
                      {item.resolved ? (item.wonByPlayer ? 'Kazandın' : 'Kapandı') : 'Canlı'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-7 rounded-2xl border border-amber-500/30 bg-[#161E29] p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400">
                      <Radio className="w-4 h-4" />
                      <span>{lot.sessionLabel ?? 'Gümrük & İcra Açık Artırma Odası'}</span>
                    </span>
                    <span className="text-xs text-slate-400 tabular-nums">
                      Gün {shop.day} · {lots.length} Seans
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
                            {d.storage} ·{' '}
                            {auctionOver && lot.wonByPlayer
                              ? `${d.defects.length} kusur`
                              : 'Mühürlü Kutu'}
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
                        : 'Bu açık artırma seansı kapandı. Yukarıdan günün diğer seanslarına geçebilirsin!'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        disabled={
                          isRivalThinking ||
                          shop.cash < (auctionStarted ? currentBid + 1000 : lot.startingBid)
                        }
                        onClick={() => handlePlayerBid(1000)}
                        className="rounded-xl bg-amber-500 px-4 py-3 text-xs font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-40 cursor-pointer tabular-nums"
                      >
                        {isRivalThinking
                          ? 'Rakipler Düşünüyor...'
                          : auctionStarted
                          ? `+1.000 ₺ Pey (${formatTRY(currentBid + 1000)})`
                          : `Açılış Peyi (${formatTRY(lot.startingBid)})`}
                      </button>
                      <button
                        type="button"
                        disabled={
                          isRivalThinking ||
                          shop.cash < (auctionStarted ? currentBid + 2500 : lot.startingBid + 1500)
                        }
                        onClick={() => handlePlayerBid(2500)}
                        className="rounded-xl bg-emerald-500 px-4 py-3 text-xs font-extrabold text-slate-950 hover:bg-emerald-400 disabled:opacity-40 cursor-pointer tabular-nums"
                      >
                        {auctionStarted
                          ? `+2.500 ₺ Sert Pey (${formatTRY(currentBid + 2500)})`
                          : `Sert Açılış (${formatTRY(lot.startingBid + 1500)})`}
                      </button>
                      <button
                        type="button"
                        disabled={isRivalThinking}
                        onClick={handleAuctionPass}
                        className="rounded-xl border border-white/15 bg-[#1D2735] px-4 py-3 text-xs font-bold text-slate-200 hover:bg-[#263447] disabled:opacity-40 cursor-pointer"
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
          </div>
        )}

        {/* SUB-TAB 3: RIVAL MERCHANT & 5 TIMED CITY BRANCHES */}
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
                  <p className="text-xs text-slate-300 mt-1 italic">{shop.rival.lastTaunt}</p>
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

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5 tabular-nums">
                  <span className="text-emerald-400">Senin Semt Payın: %{playerShare}</span>
                  <span className="text-rose-400">
                    {shop.rival.boughtOut
                      ? 'Devralındı (+3.500 ₺/gün)'
                      : `${shop.rival.name}: %${shop.rival.marketShare}`}
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

            {/* 5 City Branches Grid (Timed Construction!) */}
            <div>
              <h3 className="font-display text-lg font-bold text-slate-100 mb-3">
                Şehir Şube Ağı ({shop.branches.length}/{CITY_BRANCHES.length} · İnşaat Süreli)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CITY_BRANCHES.map((branch) => {
                  const owned = shop.branches.includes(branch.id);
                  const pendingBuild = (shop.pendingProjects ?? []).find(
                    (p) => p.kind === 'BRANCH' && p.targetId === branch.id
                  );
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
                          : pendingBuild
                          ? 'border-sky-400/45 bg-[#131F2D]'
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
                            İnşaat Süresi:{' '}
                            <strong className="text-amber-300">{branch.buildDays} Gün</strong> ·
                            Prestij <strong className="text-emerald-300">+{branch.prestigeBonus}</strong>
                          </div>
                          <div>
                            Şart: Sv. {branch.minLevel} & {branch.minReputation.toFixed(1)}★
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        {owned ? (
                          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2.5 text-center text-xs font-bold text-emerald-300">
                            Aktif Şube · Gelir Otomatik Yatıyor
                          </div>
                        ) : pendingBuild ? (
                          <div className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-sky-400/40 bg-sky-500/15 py-2.5 text-xs font-bold text-sky-200">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              Şube İnşaatı Sürüyor ({pendingBuild.daysRemaining} Gün Kaldı)
                            </span>
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
                              : `İnşaat Başlat (${formatTRY(branch.unlockCost)} · ${branch.buildDays} Gün)`}
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

        {/* SUB-TAB 4: BANK LOANS (UP TO 2.5M), PER-SALE TAX & ACCOUNTANT */}
        {subTab === 'FINANCE' && (
          <div className="space-y-6">
            {/* Sales Tax & Accountant Status Banner */}
            <div className="rounded-2xl border border-sky-500/30 bg-[#14202D] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-300 shrink-0">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                    Satış Vergisi (KDV / Gelir Kesintisi) & Mali Müşavirlik
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-50 mt-0.5 tabular-nums">
                    Güncel Satış Vergisi Oranın:{' '}
                    <span className="text-amber-300">%{Math.round(salesTaxRate * 100)}</span>
                    {hasAccountant && (
                      <span className="ml-2 text-xs font-semibold text-emerald-400">
                        (Mali Müşavir Selma Hanım · Sv.{accountantLevel})
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Her telefon, aksesuar, kargo ve tamir tahsilatında satış vergisi otomatik kesilir.{' '}
                    {hasAccountant
                      ? accountantLoanDiscount
                        ? 'Selma Hanım Sv.5+ olduğu için haftalık vergide %30, banka kredilerinde -%15 faiz indirimi uygulanıyor!'
                        : 'Selma Hanım’ı Ekip sekmesinden Sv.10’a kadar eğiterek satış vergisini %6’ya düşür ve Sv.5’te kredi faiz indirimi aç!'
                      : 'Mali Müşavir Selma Hanım’ı işe alarak satış vergisini %12’den %6’ya kadar düşürebilir ve haftalık faturadan tasarruf edebilirsin!'}
                  </p>
                </div>
              </div>
              {onGoToStaff && (
                <button
                  type="button"
                  onClick={onGoToStaff}
                  className="rounded-xl bg-sky-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-sky-400 cursor-pointer whitespace-nowrap shrink-0"
                >
                  {hasAccountant ? 'Muhasebeciyi Eğit →' : 'Muhasebeci Tut →'}
                </button>
              )}
            </div>

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
                    Her 7 günde bir dükkan elektriği, POS bakım ve sabit esnaf stopajı kesilir. Zamanında ödersen{' '}
                    <strong className="text-emerald-400">+0.10★ Temiz Esnaf İtibarı</strong> kazanırsın; ödenmeden bir sonraki haftaya sarkan borca{' '}
                    <strong className="text-rose-300">%10 gecikme faizi ve -0.15★ ceza</strong> işlenir.
                  </p>
                  <div className="mt-4 font-mono text-2xl font-extrabold tabular-nums">
                    {shop.weeklyTaxDue > 0 ? (
                      <span className="text-rose-400">Ödenecek: {formatTRY(shop.weeklyTaxDue)}</span>
                    ) : (
                      <span className="text-emerald-400">Fatura Borcu Yok · Temiz</span>
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
                    Şu an aktif kredi borcun yok. Dükkan seviyen büyüdükçe 2.500.000 ₺’ye kadar (Selma Hanım Sv.8+ ile +%35 limit) kurumsal kredi paketleri açılır.
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
                            Kalan:{' '}
                            <strong className="text-rose-300">
                              {formatTRY(loan.remainingBalance)}
                            </strong>{' '}
                            · Günlük {formatTRY(loan.dailyPayment)} ({loan.daysLeft} gün)
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

            {/* 6 Tier-Scaled Bank Loan Offers (Up to 2.5M+ TL) */}
            <div>
              <h3 className="font-display text-lg font-bold text-slate-100 mb-3">
                Esnaf Bankası Kredi Paketleri (Dükkan Kademesine Göre Milyonluk Limitler)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {BANK_LOANS.map((offer) => {
                  const terms = getEffectiveLoanTerms(
                    offer.principal,
                    offer.interestRate,
                    offer.termDays,
                    shop.staff,
                    shop.staffLevels
                  );
                  const unlocked =
                    shop.shopTier >= offer.minShopTier && shop.level >= offer.minLevel;
                  const canTake = unlocked && shop.activeLoans.length < 2;
                  const reqTierName = SHOP_TIERS[offer.minShopTier]?.name ?? `Kademe ${offer.minShopTier}`;

                  return (
                    <div
                      key={offer.id}
                      className={`rounded-2xl border p-4 flex flex-col justify-between ${
                        unlocked
                          ? 'border-white/10 bg-[#161E29]'
                          : 'border-white/6 bg-[#111720] opacity-70'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-sky-300 font-semibold">{offer.termDays} Gün Vade</span>
                          <span className="font-mono text-amber-300">
                            %{Math.round(terms.effectiveRate * 100)} Faiz
                            {terms.hasInterestDiscount ? ' (İnd.)' : ''}
                          </span>
                        </div>
                        <h4 className="font-display text-base font-bold text-slate-50">
                          {offer.name}
                        </h4>
                        <div className="font-mono text-xl font-extrabold text-emerald-400 mt-1 tabular-nums flex items-baseline gap-1.5">
                          <span>+{formatTRY(terms.effectivePrincipal)}</span>
                          {terms.limitMultiplier > 1 && (
                            <span className="text-[10.5px] text-sky-300 font-semibold">
                              (+%{Math.round((terms.limitMultiplier - 1) * 100)} Limit)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                          {offer.description}
                        </p>
                        <div className="mt-2.5 pt-2 border-t border-white/8 text-[11px] text-slate-400 space-y-0.5 tabular-nums">
                          <div>
                            Toplam Geri Ödeme:{' '}
                            <strong className="text-slate-200">{formatTRY(terms.totalRepay)}</strong> ·
                            Günlük <strong className="text-rose-300">{formatTRY(terms.dailyPayment)}</strong>
                          </div>
                          {!unlocked && (
                            <div className="text-amber-300 font-semibold flex items-center gap-1 pt-0.5">
                              <Lock className="w-3 h-3" />
                              <span>
                                Şart: {reqTierName} & Sv.{offer.minLevel}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={!canTake}
                        onClick={() => onTakeLoan(offer)}
                        className="mt-4 w-full rounded-xl bg-sky-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-sky-400 disabled:opacity-40 cursor-pointer"
                      >
                        {!unlocked
                          ? `Kilitli (${reqTierName})`
                          : shop.activeLoans.length >= 2
                          ? 'Maksimum 2 Aktif Kredi'
                          : 'Krediyi Kasaya Aktar'}
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

        {/* SUB-TAB 5: VISUAL NOSTALGIA MUSEUM */}
        {subTab === 'MUSEUM' && (
          <div className="space-y-5">
            {/* Museum Hero Showcase Banner */}
            <div className="relative rounded-2xl overflow-hidden border border-amber-400/30 min-h-[168px] flex items-end">
              <img
                src={MUSEUM_BANNER_IMAGE}
                alt="Nostalji Telefon Müzesi"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#0D131C] via-[#0D131C]/75 to-[#0D131C]/25"
              />
              <div className="relative z-10 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3 w-full">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-amber-300 mb-1">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>GSM TARİHİ KOLEKSİYON VİTRİNİ</span>
                  </div>
                  <h3 className="font-display text-2xl font-extrabold text-slate-50">
                    Nostalji Müzesi ({shop.museumItems.length}/{MUSEUM_ITEMS.length} Efsane)
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                    Efsanevi tuşlu ve kapaklı telefonları ışıklı müze vitrininde sergile! Her koleksiyon parçası kalıcı Prestij, günlük ziyaretçi geliri ve çevrimdışı kazanç sağlar.
                  </p>
                </div>
                <div className="rounded-xl border border-amber-400/30 bg-[#121924]/90 px-4 py-2.5 text-right tabular-nums shrink-0">
                  <div className="text-[10px] text-slate-400">Müze Günlük Trafik</div>
                  <div className="font-mono text-lg font-extrabold text-emerald-400">
                    +
                    {formatTRY(
                      MUSEUM_ITEMS.filter((m) => shop.museumItems.includes(m.id)).reduce(
                        (sum, m) => sum + m.dailyPassiveCash,
                        0
                      )
                    )}
                    /gün
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MUSEUM_ITEMS.map((item) => {
                const owned = shop.museumItems.includes(item.id);
                const canAfford = shop.cash >= item.cost;

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                      owned
                        ? 'border-amber-400/45 bg-[#1B222D] shadow-[0_0_24px_rgba(245,158,11,0.12)]'
                        : 'border-white/10 bg-[#161E29]'
                    }`}
                  >
                    <div>
                      {/* Visual Framed Retro Phone Pedestal */}
                      <div
                        className={`relative rounded-xl border p-4 mb-4 flex items-center justify-center overflow-hidden ${
                          owned
                            ? 'border-amber-400/35 bg-gradient-to-b from-[#232B39] to-[#111720]'
                            : 'border-white/8 bg-gradient-to-b from-[#17202C] to-[#0E131B]'
                        }`}
                      >
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 opacity-25"
                          style={{
                            background: `radial-gradient(circle at 50% 35%, ${item.accentColor}, transparent 68%)`,
                          }}
                        />
                        <div className="relative z-10 w-24 h-28 flex items-center justify-center">
                          <MuseumPhoneArt id={item.id} />
                        </div>
                        <span
                          className="absolute top-2.5 left-2.5 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#0E141D]/85 border border-white/10"
                          style={{ color: item.accentColor }}
                        >
                          {item.year}
                        </span>
                        <span className="absolute top-2.5 right-2.5 font-mono text-[10px] font-bold text-amber-300 bg-[#0E141D]/85 border border-amber-400/25 rounded px-2 py-0.5 tabular-nums">
                          +{item.prestigeBonus} Prestij
                        </span>
                      </div>

                      <h4 className="font-display text-lg font-bold text-slate-50 flex items-center gap-2">
                        <Sparkles
                          className="w-4 h-4 shrink-0"
                          style={{ color: item.accentColor }}
                        />
                        <span>{item.name}</span>
                      </h4>
                      <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
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
