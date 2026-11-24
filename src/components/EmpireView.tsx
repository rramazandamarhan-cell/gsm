import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  Building2,
  CheckCircle2,
  Clock,
  Gavel,
  Landmark,
  Lock,
  Megaphone,
  Package,
  Receipt,
  Search,
  ShieldAlert,
  Sparkles,
  Store,
  TrendingUp,
  Truck,
  X,
} from 'lucide-react';
import {
  ACCESSORY_CATALOG,
  AUCTION_RIVALS,
  BANK_LOANS,
  CITY_BRANCHES,
  DEFECT_CATALOG,
  MUSEUM_ITEMS,
  SHOP_TIERS,
  SHOP_UPGRADES,
} from '../game/catalog';
import {
  calculateMarketValue,
  formatTRY,
  getEffectiveLoanTerms,
  getEffectiveSalesTaxRate,
  hasAuctionLicense,
  hasClassifiedsLicense,
} from '../game/engine';
import {
  getLocalizedAccessory,
  getLocalizedBranch,
  getLocalizedLoan,
  getLocalizedMuseumItem,
  getLocalizedShopTier,
  useLanguage,
} from '../game/i18n';
import {
  BankLoanOffer,
  BranchId,
  CustomsAuctionLot,
  MuseumItemId,
  OnlineClassifiedListing,
  PhoneDevice,
  ShopState,
  ShopTier,
  UpgradeId,
} from '../game/types';
import { PhoneModelThumb } from './PhoneInspectSVG';
import { MuseumPhoneArt } from './VisualShowcaseArt';

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
  onResolveAuction: (lotId: string, won: boolean, finalBid: number) => void;
  onUnlockBranch: (branchId: BranchId) => void;
  onRunRivalPromo: () => void;
  onBuyoutRival: () => void;
  onTakeLoan: (offer: BankLoanOffer) => void;
  onRepayLoanEarly: (loanId: string) => void;
  onPayWeeklyTax: () => void;
  onBuyMuseumItem: (itemId: MuseumItemId) => void;
  onBuyUpgrade: (upgradeId: UpgradeId) => void;
  onGoToStaff: () => void;
  onBackToCounter: () => void;
}

type EmpireSubTab =
  | 'CLASSIFIEDS'
  | 'AUCTION'
  | 'BRANCHES'
  | 'FINANCE'
  | 'MUSEUM';

const getAuctionStepSizes = (startBid: number): [number, number, number] => {
  if (startBid >= 160000) return [5000, 15000, 35000];
  if (startBid >= 65000) return [2500, 7500, 18000];
  if (startBid >= 25000) return [1000, 3500, 8000];
  return [500, 1500, 4000];
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
  onBuyUpgrade,
  onGoToStaff,
  onBackToCounter,
}) => {
  const { lang, bi } = useLanguage();
  const [subTab, setSubTab] = useState<EmpireSubTab>('CLASSIFIEDS');
  const [classifiedView, setClassifiedView] = useState<'LISTINGS' | 'SHIPPING'>('LISTINGS');
  const [selectedMuseumId, setSelectedMuseumId] = useState<MuseumItemId | null>(null);

  const classifiedsLicensed = hasClassifiedsLicense(shop.upgrades);
  const auctionLicensed = hasAuctionLicense(shop.upgrades);
  const classifiedsSpec = SHOP_UPGRADES.find((u) => u.id === 'classifieds_license')!;
  const auctionSpec = SHOP_UPGRADES.find((u) => u.id === 'auction_license')!;

  const auctionLots: CustomsAuctionLot[] =
    shop.dailyAuctionLots && shop.dailyAuctionLots.length > 0
      ? shop.dailyAuctionLots
      : shop.dailyAuctionLot
      ? [shop.dailyAuctionLot]
      : [];
  const [selectedLotIdx, setSelectedLotIdx] = useState<number>(0);
  const activeLot: CustomsAuctionLot | null =
    auctionLots[selectedLotIdx] ?? auctionLots[0] ?? null;

  const [auctionActive, setAuctionActive] = useState(false);
  const [currentBid, setCurrentBid] = useState<number>(activeLot?.startingBid ?? 8000);
  const [highestBidder, setHighestBidder] = useState<string>(bi('Açılış Fiyatı', 'Opening Bid'));
  const [auctionRound, setAuctionRound] = useState<number>(0);
  const [auctionLog, setAuctionLog] = useState<string[]>([]);
  const [haggleInputs, setHaggleInputs] = useState<Record<string, number>>({});

  const pendingProjects = shop.pendingProjects ?? [];
  const taxPct = Math.round(getEffectiveSalesTaxRate(shop.staff, shop.staffLevels) * 100);

  const selectLot = (idx: number) => {
    if (auctionActive) return;
    setSelectedLotIdx(idx);
    const nextLot = auctionLots[idx];
    if (nextLot) {
      setCurrentBid(nextLot.startingBid);
      setHighestBidder(bi('Açılış Fiyatı', 'Opening Bid'));
      setAuctionRound(0);
      setAuctionLog([]);
    }
  };

  const lotValue = activeLot
    ? activeLot.devices.reduce(
        (s, d) => s + calculateMarketValue(d, false, shop.dailyNews, shop.upgrades),
        0
      ) +
      activeLot.bonusAccessories.reduce((s, a) => {
        const spec = ACCESSORY_CATALOG.find((x) => x.id === a.id);
        return s + (spec ? spec.recommendedPrice * a.quantity : 0);
      }, 0)
    : 0;

  const lotTierReq = (activeLot?.minShopTier ?? 1) as ShopTier;
  const lotTierLocked = shop.shopTier < lotTierReq;
  const bidSteps = getAuctionStepSizes(activeLot?.startingBid ?? 10000);

  const startAuction = () => {
    if (!activeLot || activeLot.resolved || lotTierLocked) return;
    setAuctionActive(true);
    setCurrentBid(activeLot.startingBid);
    setHighestBidder(bi('Açılış', 'Opening'));
    setAuctionRound(1);
    setAuctionLog([
      bi(
        `Mezat memuru tokmağı vurdu: "${activeLot.lotTitle}" ${formatTRY(activeLot.startingBid)} ile açıldı!`,
        `Auctioneer opens "${activeLot.lotTitle}" at ${formatTRY(activeLot.startingBid)}!`
      ),
    ]);
  };

  const placePlayerBid = (increment: number) => {
    if (!activeLot || !auctionActive) return;
    const nextBid = auctionRound === 1 && highestBidder === bi('Açılış', 'Opening')
      ? Math.max(activeLot.startingBid, currentBid)
      : currentBid + increment;
    if (shop.cash < nextBid) return;

    const newLog = [
      ...auctionLog,
      bi(
        `Sen el kaldırdın: ${formatTRY(nextBid)}!`,
        `You raised your paddle: ${formatTRY(nextBid)}!`
      ),
    ];

    // Harder rival aggression on higher-tier auctions
    const rivalAggression = 0.72 + Math.min(0.16, (lotTierReq - 1) * 0.035);
    const rivalMax = Math.round(lotValue * (rivalAggression + Math.random() * 0.1));
    const rival = AUCTION_RIVALS[Math.floor(Math.random() * AUCTION_RIVALS.length)];
    const counterStep = bidSteps[0];

    if (nextBid < rivalMax && auctionRound < 6) {
      const rivalBid =
        Math.round((nextBid + counterStep + Math.random() * counterStep * 1.3) / 250) * 250;
      setCurrentBid(rivalBid);
      setHighestBidder(rival.name);
      setAuctionRound((r) => r + 1);
      setAuctionLog([
        ...newLog,
        bi(
          `${rival.name} (${rival.style}): "${formatTRY(rivalBid)} veriyorum, bu koli benim!"`,
          `${rival.name}: "Bidding ${formatTRY(rivalBid)} — this crate is mine!"`
        ),
      ]);
    } else {
      setCurrentBid(nextBid);
      setHighestBidder(bi('Sen', 'You'));
      setAuctionActive(false);
      setAuctionLog([
        ...newLog,
        bi(
          `Rakipler çekildi! Tokmak vuruldu — ${formatTRY(nextBid)} bedelle koliyi kazandın!`,
          `Rivals fold! Sold to you for ${formatTRY(nextBid)}!`
        ),
      ]);
      onResolveAuction(activeLot.id, true, nextBid);
    }
  };

  const passAuction = () => {
    if (!activeLot) return;
    setAuctionActive(false);
    onResolveAuction(activeLot.id, false, currentBid);
  };

  const cleanInventory = shop.inventory.filter(
    (d) => d.defects.length === 0 && !d.assignedToStaff
  );
  const allInventory = shop.inventory.filter((d) => !d.assignedToStaff);

  const openAuctionCount = auctionLots.filter((l) => !l.resolved).length;
  const totalBranchDailyIncome = shop.branches.reduce((sum, bid) => {
    const spec = CITY_BRANCHES.find((b) => b.id === bid);
    return sum + (spec?.dailyNetIncome ?? 0);
  }, 0);
  const totalBranchOfflineHourly = shop.branches.reduce((sum, bid) => {
    const spec = CITY_BRANCHES.find((b) => b.id === bid);
    return sum + (spec?.offlineHourlyRate ?? 0);
  }, 0);
  const totalMuseumDaily = shop.museumItems.reduce((sum, mid) => {
    const spec = MUSEUM_ITEMS.find((m) => m.id === mid);
    return sum + (spec?.dailyPassiveCash ?? 0);
  }, 0);
  const totalMuseumPrestige = shop.museumItems.reduce((sum, mid) => {
    const spec = MUSEUM_ITEMS.find((m) => m.id === mid);
    return sum + (spec?.prestigeBonus ?? 0);
  }, 0);

  const renderListingCard = (item: OnlineClassifiedListing) => {
    const status = item.status ?? (item.bought ? 'BOUGHT' : 'AVAILABLE');
    const currentPrice = item.currentPrice ?? item.askingPrice;
    const estMarket = calculateMarketValue(item.device, false, shop.dailyNews, shop.upgrades);
    const estMargin = estMarket - currentPrice;
    const step = currentPrice >= 20000 ? 1000 : 500;
    const defaultOffer = Math.max(1000, Math.round((currentPrice * 0.86) / 250) * 250);
    const haggleOffer = haggleInputs[item.id] ?? defaultOffer;
    const defects = item.device.defects;
    const riskColor =
      item.riskTag === 'Kelepir Fırsat'
        ? 'text-emerald-300'
        : item.riskTag === 'Şüpheli İlan'
        ? 'text-rose-300'
        : 'text-sky-300';

    return (
      <div
        key={item.id}
        className={`rounded-xl border p-2.5 flex flex-col justify-between gap-2 min-h-0 overflow-hidden ${
          status === 'BOUGHT'
            ? 'border-emerald-400/25 bg-[#12201C]/75'
            : status === 'REJECTED'
            ? 'border-white/5 bg-[#11161F]/60 opacity-60'
            : 'border-white/10 bg-[#151D28]'
        }`}
      >
        {/* Header */}
        <div className="shrink-0 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-xs font-extrabold text-slate-100 truncate">
              {item.device.brand} {item.device.model}{' '}
              <span className="text-[10px] font-mono text-slate-400">
                {item.device.storage}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {item.sellerName} · {item.district} ·{' '}
              <span className={`font-bold ${riskColor}`}>
                {item.riskTag === 'Kelepir Fırsat'
                  ? bi('Kelepir Fırsat', 'Bargain')
                  : item.riskTag === 'Şüpheli İlan'
                  ? bi('Şüpheli İlan', 'Risky Listing')
                  : bi('Temiz İlan', 'Clean Listing')}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0 tabular-nums">
            <div className="font-mono text-xs sm:text-sm font-extrabold text-amber-300">
              {formatTRY(currentPrice)}
            </div>
            <div className="text-[9.5px] font-mono text-slate-400">
              {bi('Piyasa ~', 'Mkt ~')}
              {formatTRY(estMarket)}
            </div>
          </div>
        </div>

        {/* Rich Center Stage — Phone Thumb + Spec Dossier (NO EMPTY VOID!) */}
        <div className="flex-1 min-h-0 rounded-lg border border-white/8 bg-[#0E141D] p-2 flex items-center gap-2.5 overflow-hidden">
          <PhoneModelThumb
            device={item.device}
            showBack
            className="h-full max-h-24 w-auto shrink-0"
          />

          <div className="flex-1 min-w-0 flex flex-col justify-between h-full gap-1">
            {status === 'INSPECTED_ONSITE' || status === 'ARRIVED_COD' ? (
              <div className="space-y-1 text-[10px]">
                <div className="font-bold text-slate-200">
                  {defects.length === 0
                    ? bi('✓ Ekspertiz Temiz: Hiç kusur yok!', '✓ Inspection Clean: Zero defects!')
                    : bi(
                        `⚠ ${defects.length} Gizli Kusur Yakalandı:`,
                        `⚠ ${defects.length} Hidden Defect(s) Found:`
                      )}
                </div>
                {defects.length > 0 && (
                  <div className="text-[10px] text-rose-300 truncate">
                    {defects.map((d) => DEFECT_CATALOG[d].shortLabel).join(' · ')}
                  </div>
                )}
                {item.lastSellerReply && (
                  <div className="text-[10px] italic text-amber-200/90 line-clamp-2">
                    "{item.lastSellerReply}"
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] tabular-nums">
                  <div className="text-slate-400 truncate">
                    {bi('Pil İddiası', 'Battery')}:{' '}
                    <strong className="font-mono text-slate-100">
                      %{item.device.reportedBatteryHealth}
                    </strong>
                  </div>
                  <div className="text-slate-400 truncate">
                    {bi('Kutu', 'Box')}:{' '}
                    <strong className="text-slate-100">
                      {item.device.hasBoxAndCharger ? bi('Var', 'Yes') : bi('Yok', 'No')}
                    </strong>
                  </div>
                  <div className="text-slate-400 truncate">
                    IMEI:{' '}
                    <strong
                      className={
                        item.device.imeiStatus === 'TR_REGISTERED'
                          ? 'text-emerald-300'
                          : 'text-amber-300'
                      }
                    >
                      {item.device.imeiStatus === 'TR_REGISTERED'
                        ? bi('TR Kayıtlı', 'Registered')
                        : bi('Yurt Dışı', 'Foreign')}
                    </strong>
                  </div>
                  <div className="text-slate-400 truncate">
                    {bi('Tahmini Marj', 'Est. Margin')}:{' '}
                    <strong
                      className={`font-mono ${
                        estMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {estMargin >= 0 ? '+' : ''}
                      {formatTRY(estMargin)}
                    </strong>
                  </div>
                </div>
                <p className="text-[10px] italic text-slate-300 line-clamp-2 leading-snug border-t border-white/6 pt-1">
                  "{item.sellerNote}"
                </p>
              </>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="shrink-0">
          {status === 'BOUGHT' ? (
            <div className="rounded-lg bg-emerald-500/15 py-1 text-center text-[10.5px] font-bold text-emerald-300">
              ✓ {bi('Envanterine Eklendi', 'Added to Inventory')}
            </div>
          ) : status === 'REJECTED' ? (
            <div className="rounded-lg bg-white/5 py-1 text-center text-[10.5px] font-semibold text-slate-400">
              {bi('İlan Kapandı', 'Listing Closed')}
            </div>
          ) : status === 'SHIPPING_IN_TRANSIT' ? (
            <div className="rounded-lg bg-sky-500/15 py-1 text-center text-[10.5px] font-bold text-sky-300">
              {bi(
                `Kargoda · ${item.deliveryDaysLeft ?? 1} gün sonra kapında`,
                `In Transit · Arrives in ${item.deliveryDaysLeft ?? 1}d`
              )}
            </div>
          ) : status === 'AVAILABLE' ? (
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                disabled={shop.cash < 250}
                onClick={() => onInspectClassifiedOnsite(item.id)}
                className="rounded-lg bg-amber-500/15 border border-amber-400/35 py-1.5 text-[10.5px] font-bold text-amber-200 hover:bg-amber-500/25 disabled:opacity-35 cursor-pointer whitespace-nowrap"
              >
                {bi('Yerinde Bak (250 ₺)', 'Inspect Onsite (250 ₺)')}
              </button>
              <button
                type="button"
                disabled={shop.cash < 350}
                onClick={() => onOrderClassifiedCod(item.id)}
                className="rounded-lg bg-sky-500/15 border border-sky-400/35 py-1.5 text-[10.5px] font-bold text-sky-200 hover:bg-sky-500/25 disabled:opacity-35 cursor-pointer whitespace-nowrap"
              >
                {bi('Kapıda Kargo (350 ₺)', 'COD Cargo (350 ₺)')}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  setHaggleInputs((p) => ({
                    ...p,
                    [item.id]: Math.max(1000, haggleOffer - step),
                  }))
                }
                className="w-6 h-7 rounded-md bg-white/10 text-xs font-bold text-slate-200 cursor-pointer shrink-0"
              >
                -
              </button>
              <button
                type="button"
                disabled={shop.cash < haggleOffer}
                onClick={() => onHaggleClassified(item.id, haggleOffer)}
                className="flex-1 rounded-md bg-amber-500 py-1.5 text-[10px] font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-35 cursor-pointer whitespace-nowrap tabular-nums"
              >
                {bi('Teklif', 'Offer')} {formatTRY(haggleOffer)}
              </button>
              <button
                type="button"
                onClick={() =>
                  setHaggleInputs((p) => ({
                    ...p,
                    [item.id]: Math.min(currentPrice, haggleOffer + step),
                  }))
                }
                className="w-6 h-7 rounded-md bg-white/10 text-xs font-bold text-slate-200 cursor-pointer shrink-0"
              >
                +
              </button>
              <button
                type="button"
                disabled={shop.cash < currentPrice}
                onClick={() => onBuyClassified(item.id)}
                className="rounded-md bg-emerald-500 px-2 py-1.5 text-[10px] font-extrabold text-slate-950 hover:bg-emerald-400 disabled:opacity-35 cursor-pointer whitespace-nowrap"
              >
                {bi('Al', 'Buy')}
              </button>
              <button
                type="button"
                onClick={() => onRejectClassified(item.id)}
                className="rounded-md bg-rose-500/20 px-2 py-1.5 text-[10px] font-bold text-rose-300 hover:bg-rose-500/30 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const selectedMuseumSpec = selectedMuseumId
    ? getLocalizedMuseumItem(selectedMuseumId, lang)
    : null;

  return (
    <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden bg-[#0F141B] p-2 lg:p-3 gap-2">
      {/* COMPACT TOOLBAR */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-1.5 rounded-xl border border-white/10 bg-[#151D28] px-2.5 py-1.5">
        <div className="flex items-center gap-1 flex-wrap">
          {(
            [
              ['CLASSIFIEDS', Search, bi('Sarı İlan & Kargo', 'Classifieds')],
              [
                'AUCTION',
                Gavel,
                bi(`İhale (${openAuctionCount}/6)`, `Auction (${openAuctionCount}/6)`),
              ],
              ['BRANCHES', Building2, bi('Şube & Rakip', 'Branches')],
              ['FINANCE', Landmark, bi('Banka & Vergi', 'Bank & Tax')],
              [
                'MUSEUM',
                Award,
                bi(`Müze (${shop.museumItems.length}/5)`, `Museum (${shop.museumItems.length}/5)`),
              ],
            ] as const
          ).map(([id, Icon, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setSubTab(id)}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors whitespace-nowrap cursor-pointer ${
                subTab === id
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-[#0E141D] text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onBackToCounter}
          className="rounded-lg border border-white/10 bg-[#1B2432] px-2.5 py-1 text-[11px] font-semibold text-slate-200 hover:bg-[#243042] whitespace-nowrap cursor-pointer"
        >
          ← {bi('Tezgah', 'Counter')}
        </button>
      </div>

      {/* SUB-TAB 1: CLASSIFIEDS & INTERCITY SHIPPING */}
      {subTab === 'CLASSIFIEDS' && (
        !classifiedsLicensed ? (
          <div className="flex-1 min-h-0 rounded-2xl border border-amber-400/35 bg-[#151D28] flex flex-col items-center justify-center text-center p-5 gap-3">
            <div className="w-12 h-12 rounded-2xl border border-amber-400/40 bg-amber-500/15 flex items-center justify-center">
              <Search className="w-6 h-6 text-amber-400" />
            </div>
            <div className="space-y-1 max-w-lg">
              <div className="text-[10.5px] font-mono font-bold text-amber-300 uppercase tracking-wider">
                {bi('YENİ İŞ KOLU · SARI İLAN & KARGO AĞI', 'NEW BUSINESS LINE · CLASSIFIEDS & CARGO')}
              </div>
              <h3 className="font-display text-base sm:text-lg font-extrabold text-slate-50">
                {bi('Sarı İlan & Şehir Dışı Kargo Yetkisi', 'Classifieds & Intercity Cargo Permit')}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {bi(
                  'Şehir içindeki kelepir 2. el ilanları yerinde ekspertiz veya kapıda kontrollü kargo ile kapat; temiz cihazlarını şehir dışındaki alıcılara ekstra kâr marjıyla gönder!',
                  'Hunt underpriced local listings with onsite inspection or COD cargo, and ship clean devices nationwide for extra profit margins!'
                )}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 max-w-lg w-full text-[10.5px]">
              <div className="rounded-xl border border-white/8 bg-[#0E141D] p-2">
                <div className="font-bold text-amber-300">{bi('Günlük 4 İlan', '4 Daily Listings')}</div>
                <div className="text-slate-400 text-[10px] mt-0.5">{bi('Kelepir & pazarlık şansı', 'Bargains & haggling')}</div>
              </div>
              <div className="rounded-xl border border-white/8 bg-[#0E141D] p-2">
                <div className="font-bold text-sky-300">{bi('Kapıda Kontrol', 'COD Inspection')}</div>
                <div className="text-slate-400 text-[10px] mt-0.5">{bi('Kusur çıkarsa fiyat kır', 'Slash price on defects')}</div>
              </div>
              <div className="rounded-xl border border-white/8 bg-[#0E141D] p-2">
                <div className="font-bold text-emerald-300">{bi('Şehir Dışı Kargo', 'Intercity Orders')}</div>
                <div className="text-slate-400 text-[10px] mt-0.5">{bi('+%15 kârlı toplu alıcılar', '+15% margin buyers')}</div>
              </div>
            </div>
            <button
              type="button"
              disabled={shop.cash < classifiedsSpec.cost}
              onClick={() => onBuyUpgrade('classifieds_license')}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-40 cursor-pointer tabular-nums"
            >
              <Search className="w-4 h-4" />
              {shop.cash < classifiedsSpec.cost
                ? bi(`Yetersiz Kasa (${formatTRY(classifiedsSpec.cost)} Gerekli)`, `Need ${formatTRY(classifiedsSpec.cost)}`)
                : bi(`Yetkiyi Satın Al (${formatTRY(classifiedsSpec.cost)})`, `Buy Permit (${formatTRY(classifiedsSpec.cost)})`)}
            </button>
          </div>
        ) : (
        <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
          <div className="shrink-0 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setClassifiedView('LISTINGS')}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold cursor-pointer ${
                  classifiedView === 'LISTINGS'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-[#151D28] text-slate-300 border border-white/10'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                {bi('Sarı İlan Fırsatları', 'Classified Deals')} ({shop.onlineListings.length})
              </button>
              <button
                type="button"
                onClick={() => setClassifiedView('SHIPPING')}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold cursor-pointer ${
                  classifiedView === 'SHIPPING'
                    ? 'bg-sky-500 text-slate-950'
                    : 'bg-[#151D28] text-slate-300 border border-white/10'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                {bi('Şehir Dışı Kargo', 'Shipping Orders')} ({shop.shippingOrders.length})
              </button>
            </div>
            <span className="text-[10.5px] text-slate-400 hidden sm:inline">
              {bi(
                'İlanı yerinde kontrol et veya kapıda kargo ile açıp kusur çıkarsa fiyat kır!',
                'Inspect onsite or order COD cargo and negotiate down if hidden defects appear!'
              )}
            </span>
          </div>

          {classifiedView === 'LISTINGS' ? (
            <div className="flex-1 min-h-0 grid grid-cols-2 grid-rows-2 gap-2 overflow-hidden">
              {shop.onlineListings.slice(0, 4).map(renderListingCard)}
            </div>
          ) : (
            <div className="flex-1 min-h-0 grid grid-cols-3 gap-2 overflow-hidden">
              {shop.shippingOrders.slice(0, 3).map((order) => {
                const eligible: PhoneDevice[] = (
                  order.requireClean ? cleanInventory : allInventory
                ).filter((d) => d.tier === order.requestedTier);

                return (
                  <div
                    key={order.id}
                    className={`rounded-xl border p-3 flex flex-col justify-between gap-2 overflow-hidden ${
                      order.fulfilled
                        ? 'border-emerald-400/30 bg-[#12201C]/80'
                        : 'border-white/10 bg-[#151D28]'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-extrabold text-slate-100 truncate">
                            {order.buyerName} · {order.city}
                          </div>
                          <div className="text-[10px] text-sky-300 font-semibold">
                            {order.requestedTier.toUpperCase()} ·{' '}
                            {order.requireClean
                              ? bi('Sadece Kusursuz', 'Clean Only')
                              : bi('Her Durum', 'Any Condition')}
                          </div>
                        </div>
                        <span className="font-mono text-xs font-extrabold text-emerald-400 shrink-0">
                          +{Math.round((order.bonusMultiplier - 1) * 100)}%
                        </span>
                      </div>

                      <div className="rounded-lg border border-white/8 bg-[#0E141D] p-2 space-y-1 text-[10.5px]">
                        <div className="flex justify-between text-slate-400">
                          <span>{bi('Kargo Ücreti', 'Shipping Fee')}</span>
                          <span className="font-mono text-slate-200">{formatTRY(order.shippingFee)}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>{bi('Uygun Stoğun', 'Matching Stock')}</span>
                          <span className="font-mono font-bold text-amber-300">
                            {eligible.length} {bi('cihaz', 'unit(s)')}
                          </span>
                        </div>
                      </div>

                      <p className="text-[10.5px] italic text-slate-300 leading-snug">
                        "{order.note}"
                      </p>
                    </div>

                    {order.fulfilled ? (
                      <div className="rounded-lg bg-emerald-500/20 py-1.5 text-center text-[11px] font-bold text-emerald-300">
                        ✓ {bi('Kargolandı', 'Shipped')}
                      </div>
                    ) : eligible.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-white/10 py-2 text-center text-[10.5px] text-slate-400">
                        {bi(
                          `Stokta uygun ${order.requestedTier.toUpperCase()} cihaz yok`,
                          `No matching ${order.requestedTier.toUpperCase()} phone in stock`
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {eligible.slice(0, 2).map((dev) => {
                          const payout = Math.round(
                            calculateMarketValue(dev, false, shop.dailyNews, shop.upgrades) *
                              order.bonusMultiplier -
                              order.shippingFee
                          );
                          return (
                            <button
                              key={dev.uid}
                              type="button"
                              onClick={() => onFulfillShipping(order.id, dev.uid)}
                              className="w-full rounded-lg bg-sky-500 py-1.5 px-2 text-[10.5px] font-extrabold text-slate-950 hover:bg-sky-400 cursor-pointer truncate tabular-nums"
                            >
                              {bi('Gönder', 'Ship')}: {dev.brand} {dev.model} ({formatTRY(payout)})
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        )
      )}

      {/* SUB-TAB 2: 6-TIER DAILY CUSTOMS & LIQUIDATION AUCTION HALL */}
      {subTab === 'AUCTION' && (
        !auctionLicensed ? (
          <div className="flex-1 min-h-0 rounded-2xl border border-amber-400/35 bg-[#151D28] flex flex-col items-center justify-center text-center p-5 gap-3">
            <div className="w-12 h-12 rounded-2xl border border-amber-400/40 bg-amber-500/15 flex items-center justify-center">
              <Gavel className="w-6 h-6 text-amber-400" />
            </div>
            <div className="space-y-1 max-w-lg">
              <div className="text-[10.5px] font-mono font-bold text-amber-300 uppercase tracking-wider">
                {bi('YENİ İŞ KOLU · RESMİ İHALE SALONU', 'NEW BUSINESS LINE · OFFICIAL AUCTION HALL')}
              </div>
              <h3 className="font-display text-base sm:text-lg font-extrabold text-slate-50">
                {bi('Resmi Gümrük & İcra İhale Kartı', 'Official Customs & Liquidation Auction Pass')}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {bi(
                  'Her gün 6 farklı kademede mühürlü koli ihalesine katıl! Pasaj icra kolisinden Havalimanı VIP konteynerine kadar rakip esnaflarla canlı pey yarıştır, toplu cihaz ve bonus aksesuarları ucuza kapat.',
                  'Enter 6 progressive sealed-crate auctions daily — from arcade liquidation boxes to VIP airport containers! Outbid rival merchants for bulk devices and bonus accessory crates.'
                )}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 max-w-lg w-full text-[10px]">
              <div className="rounded-xl border border-white/8 bg-[#0E141D] p-2">
                <div className="font-bold text-amber-300">{bi('6 Günlük Mezat', '6 Daily Lots')}</div>
                <div className="text-slate-400 mt-0.5">{bi('Dükkan büyüdükçe VIP kasalar', 'VIP tiers unlock with shops')}</div>
              </div>
              <div className="rounded-xl border border-white/8 bg-[#0E141D] p-2">
                <div className="font-bold text-emerald-300">{bi('Toplu Cihaz & Aksesuar', 'Bulk Phones + Gear')}</div>
                <div className="text-slate-400 mt-0.5">{bi('2–4 cihaz + bonus koli', '2–4 phones + bonus box')}</div>
              </div>
              <div className="rounded-xl border border-white/8 bg-[#0E141D] p-2">
                <div className="font-bold text-rose-300">{bi('Canlı Rakip Rekabeti', 'Live Rival Sharks')}</div>
                <div className="text-slate-400 mt-0.5">{bi('Yüksek risk, dev marj', 'High stakes, huge margins')}</div>
              </div>
            </div>
            <button
              type="button"
              disabled={shop.cash < auctionSpec.cost}
              onClick={() => onBuyUpgrade('auction_license')}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-40 cursor-pointer tabular-nums"
            >
              <Gavel className="w-4 h-4" />
              {shop.cash < auctionSpec.cost
                ? bi(`Yetersiz Kasa (${formatTRY(auctionSpec.cost)} Gerekli)`, `Need ${formatTRY(auctionSpec.cost)}`)
                : bi(`İhale Kartını Satın Al (${formatTRY(auctionSpec.cost)})`, `Buy Auction Pass (${formatTRY(auctionSpec.cost)})`)}
            </button>
          </div>
        ) : activeLot && (
        <div className="flex-1 min-h-0 flex gap-2 overflow-hidden">
          {/* Left: All 6 Daily Auction Tiers */}
          <div className="w-[240px] lg:w-[290px] shrink-0 grid grid-rows-6 gap-1.5 min-h-0 overflow-hidden">
            {auctionLots.slice(0, 6).map((lot, idx) => {
              const selected = idx === selectedLotIdx;
              const reqTier = (lot.minShopTier ?? 1) as ShopTier;
              const locked = shop.shopTier < reqTier;
              return (
                <button
                  key={lot.id}
                  type="button"
                  disabled={auctionActive && !selected}
                  onClick={() => selectLot(idx)}
                  className={`rounded-xl border px-2.5 py-1.5 text-left transition-colors cursor-pointer disabled:opacity-40 flex flex-col justify-center ${
                    selected
                      ? 'border-amber-400 bg-amber-500/12'
                      : locked
                      ? 'border-white/5 bg-[#121821]/85'
                      : 'border-white/10 bg-[#151D28] hover:bg-[#1B2533]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-bold text-slate-100 truncate">
                      #{idx + 1} · {lot.sessionLabel ?? lot.lotTitle}
                    </span>
                    {lot.resolved ? (
                      <span
                        className={`text-[9.5px] font-extrabold shrink-0 ${
                          lot.wonByPlayer ? 'text-emerald-300' : 'text-slate-500'
                        }`}
                      >
                        {lot.wonByPlayer ? bi('Kazanıldı', 'Won') : bi('Kapandı', 'Closed')}
                      </span>
                    ) : locked ? (
                      <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold text-amber-300 shrink-0">
                        <Lock className="w-2.5 h-2.5" />
                        {bi(`Dükkan ${reqTier}`, `Tier ${reqTier}`)}
                      </span>
                    ) : (
                      <span className="font-mono text-[10.5px] font-extrabold text-amber-300 shrink-0 tabular-nums">
                        {formatTRY(lot.startingBid)}
                      </span>
                    )}
                  </div>
                  <div className="text-[9.5px] text-slate-400 truncate mt-0.5 tabular-nums">
                    {lot.devices.length} {bi('cihaz', 'phones')} · {lot.riskTag ?? bi('Standart', 'Standard')}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Rich Auction Hall Stage (ZERO DEAD SPACE!) */}
          <div className="flex-1 min-w-0 rounded-xl border border-white/10 bg-[#151D28] p-3 flex flex-col justify-between gap-2 overflow-hidden">
            {/* Stage Header */}
            <div className="shrink-0 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  {bi('GÜMRÜK & TASFİYE MEZATI', 'CUSTOMS & LIQUIDATION AUCTION')} ·{' '}
                  {activeLot.riskTag ?? bi('Standart', 'Standard')}
                </div>
                <h3 className="text-sm font-extrabold text-slate-100 truncate">
                  {activeLot.lotTitle}
                </h3>
                <div className="text-[10.5px] text-slate-400 truncate mt-0.5">
                  {activeLot.manifestHint ?? activeLot.description}
                </div>
              </div>

              <div className="text-right shrink-0 tabular-nums">
                <div className="text-[10px] text-slate-400">
                  {bi('Güncel Pey', 'Current Bid')}
                </div>
                <div className="font-mono text-base sm:text-lg font-extrabold text-amber-300">
                  {formatTRY(activeLot.resolved ? activeLot.winningBid : currentBid)}
                </div>
                <div className="text-[10px] text-emerald-400 font-mono font-bold">
                  {bi('Tahmini Değer', 'Est. Value')}: {formatTRY(lotValue)}
                </div>
              </div>
            </div>

            {/* Sealed Crate Manifest + Bonus Accessories + Profit Spread */}
            <div className="shrink-0 grid grid-cols-12 gap-2">
              <div className="col-span-7 rounded-xl border border-white/8 bg-[#0E141D] p-2 flex items-center justify-around gap-1.5">
                {activeLot.devices.map((d) => (
                  <div key={d.uid} className="flex flex-col items-center gap-0.5 min-w-0">
                    <div className="w-9 h-14 rounded-lg border border-white/15 bg-[#1B2432] flex flex-col items-center justify-center relative">
                      <div className="w-3.5 h-3.5 rounded bg-black/50 absolute top-1 left-1 flex items-center justify-center">
                        <span className="w-1 h-1 rounded-full bg-slate-500" />
                      </div>
                      <span className="text-[10px] font-extrabold text-amber-300/80 mt-2">?</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-300 uppercase truncate max-w-[66px]">
                      {activeLot.resolved && activeLot.wonByPlayer ? d.model : d.tier}
                    </span>
                  </div>
                ))}
              </div>

              <div className="col-span-5 rounded-xl border border-white/8 bg-[#0E141D] p-2 flex flex-col justify-between text-[10px] tabular-nums">
                <div className="font-bold text-slate-200 flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  {bi('Koli Manifestosu & Bonus', 'Crate Manifest & Bonus')}
                </div>
                <div className="text-slate-300 space-y-0.5">
                  {activeLot.bonusAccessories.map((ba) => {
                    const accLoc = getLocalizedAccessory(ba.id, lang);
                    return (
                      <div key={ba.id} className="flex justify-between text-[9.5px]">
                        <span className="truncate text-slate-400">{accLoc.name}</span>
                        <span className="font-mono font-bold text-amber-300">×{ba.quantity}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between border-t border-white/8 pt-1 text-[10px]">
                  <span className="text-slate-400">{bi('Olası Kâr Marjı', 'Est. Upside')}</span>
                  <span
                    className={`font-mono font-extrabold ${
                      lotValue - currentBid >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {lotValue - currentBid >= 0 ? '+' : ''}
                    {formatTRY(lotValue - currentBid)}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Bidding Arena OR Pre-Start Intelligence Panel */}
            <div className="flex-1 min-h-0 rounded-xl border border-white/8 bg-[#0E141D] p-2.5 flex flex-col justify-between overflow-hidden">
              {auctionLog.length > 0 ? (
                <div className="space-y-1.5 overflow-hidden">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-white/6 pb-1">
                    <span className="font-bold text-amber-300">
                      {bi('CANLI PEY AKIŞI', 'LIVE BIDDING FEED')} · {bi('Tur', 'Round')} {auctionRound}/6
                    </span>
                    <span>
                      {bi('Önde Olan', 'Leader')}: <strong className="text-slate-100">{highestBidder}</strong>
                    </span>
                  </div>
                  {auctionLog.slice(-4).map((line, i) => (
                    <div
                      key={i}
                      className={`text-[11px] leading-snug ${
                        i === auctionLog.slice(-4).length - 1
                          ? 'text-amber-200 font-semibold'
                          : 'text-slate-400'
                      }`}
                    >
                      • {line}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-between gap-2">
                  <div className="grid grid-cols-3 gap-2">
                    {AUCTION_RIVALS.slice(0, 3).map((r) => (
                      <div
                        key={r.name}
                        className="rounded-lg border border-white/6 bg-[#141C27] p-2 text-[10px]"
                      >
                        <div className="font-bold text-slate-100 truncate">{r.name}</div>
                        <div className="text-slate-400 truncate mt-0.5">{r.style}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-2 text-[10.5px] text-slate-300 border-t border-white/6 pt-1.5">
                    <span className="inline-flex items-center gap-1.5 text-slate-300">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      {bi(
                        'Mühürlü kolide gizli ekran/pil kusurları çıkabilir — tavan peyi aşma!',
                        'Sealed crates may hide screen/battery flaws — watch your ceiling!'
                      )}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 shrink-0">
                      {bi(`Gereken: Dükkan ${lotTierReq}`, `Requires: Tier ${lotTierReq}`)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="shrink-0">
              {activeLot.resolved ? (
                <div className="rounded-lg bg-white/5 py-2 text-center text-xs font-bold text-slate-300">
                  {activeLot.wonByPlayer
                    ? bi(
                        `Bu ihaleyi ${formatTRY(activeLot.winningBid)} ile kazandın — cihazlar atölyene eklendi!`,
                        `Won for ${formatTRY(activeLot.winningBid)} — devices added to workshop!`
                      )
                    : bi('Bu ihale kapandı; diğer seanslara göz atabilirsin.', 'Lot closed — try another session.')}
                </div>
              ) : lotTierLocked ? (
                <div className="rounded-lg border border-amber-400/25 bg-amber-500/10 py-2 px-3 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 font-bold text-amber-200">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    {bi(
                      `Bu VIP ihaleye girmek için ${lotTierReq}. Dükkan (${getLocalizedShopTier(lotTierReq, lang).name}) gerekli!`,
                      `Requires Shop Tier ${lotTierReq} (${getLocalizedShopTier(lotTierReq, lang).name}) to bid!`
                    )}
                  </span>
                  <span className="font-mono text-[10.5px] text-slate-300">
                    {bi('Büyüt → Dükkanlar', 'Grow → Shops')}
                  </span>
                </div>
              ) : !auctionActive ? (
                <button
                  type="button"
                  disabled={shop.cash < activeLot.startingBid}
                  onClick={startAuction}
                  className="w-full rounded-lg bg-amber-500 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-40 cursor-pointer tabular-nums"
                >
                  {shop.cash < activeLot.startingBid
                    ? bi(`Yetersiz Nakit (${formatTRY(activeLot.startingBid)} Gerekli)`, `Need ${formatTRY(activeLot.startingBid)}`)
                    : bi(
                        `İhaleye Katıl (${formatTRY(activeLot.startingBid)})`,
                        `Enter Auction (${formatTRY(activeLot.startingBid)})`
                      )}
                </button>
              ) : (
                <div className="grid grid-cols-4 gap-1.5 tabular-nums">
                  {bidSteps.map((step, idx) => (
                    <button
                      key={step}
                      type="button"
                      disabled={shop.cash < currentBid + step}
                      onClick={() => placePlayerBid(step)}
                      className={`rounded-lg py-2 text-[11px] font-extrabold cursor-pointer disabled:opacity-35 ${
                        idx === 2
                          ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                          : 'bg-amber-500/20 border border-amber-400/40 text-amber-200 hover:bg-amber-500/30'
                      }`}
                    >
                      +{formatTRY(step)}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={passAuction}
                    className="rounded-lg bg-rose-500/20 border border-rose-400/35 py-2 text-[11px] font-bold text-rose-200 hover:bg-rose-500/30 cursor-pointer"
                  >
                    {bi('Çekil', 'Fold')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        )
      )}

      {/* SUB-TAB 3: BRANCHES & RIVAL (3x2 SYMMETRICAL GRID — ZERO VOID!) */}
      {subTab === 'BRANCHES' && (
        <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
          {/* Compact Rival Strip */}
          <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#151D28] px-3 py-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <Store className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="text-xs font-bold text-slate-100 truncate">
                {shop.rival.name}
              </span>
              <span className="text-[11px] text-slate-400 tabular-nums">
                {shop.rival.boughtOut
                  ? bi('✓ Rakip devralındı · Pazarın %100 hakimi sensin!', '✓ Rival acquired · 100% market share!')
                  : bi(`Rakip Payı %${shop.rival.marketShare} · Senin Payın %${100 - shop.rival.marketShare}`, `Rival ${shop.rival.marketShare}% · Yours ${100 - shop.rival.marketShare}%`)}
              </span>
              {!shop.rival.boughtOut && (
                <div className="w-24 h-2 rounded-full bg-emerald-500/30 overflow-hidden hidden sm:block">
                  <div
                    className="h-full bg-rose-500"
                    style={{ width: `${shop.rival.marketShare}%` }}
                  />
                </div>
              )}
            </div>

            {!shop.rival.boughtOut && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={shop.rival.promoUsedToday || shop.cash < 4500}
                  onClick={onRunRivalPromo}
                  className="inline-flex items-center gap-1 rounded-lg bg-amber-500/15 border border-amber-400/35 px-2.5 py-1 text-[10.5px] font-bold text-amber-200 hover:bg-amber-500/25 disabled:opacity-35 cursor-pointer whitespace-nowrap"
                >
                  <Megaphone className="w-3 h-3" />
                  {bi('Reklam Kampanyası (4.500 ₺)', 'Promo Blitz (4,500 ₺)')}
                </button>
                <button
                  type="button"
                  disabled={shop.cash < shop.rival.buyoutCost}
                  onClick={onBuyoutRival}
                  className="rounded-lg bg-rose-500/20 border border-rose-400/40 px-2.5 py-1 text-[10.5px] font-bold text-rose-200 hover:bg-rose-500/30 disabled:opacity-35 cursor-pointer whitespace-nowrap tabular-nums"
                >
                  {bi('Rakibi Satın Al', 'Buyout Rival')} ({formatTRY(shop.rival.buyoutCost)})
                </button>
              </div>
            )}
          </div>

          {/* 5 Branches + 6th Empire Portfolio Card = Perfect 3x2 Grid */}
          <div className="flex-1 min-h-0 grid grid-cols-3 grid-rows-2 gap-2 overflow-hidden">
            {CITY_BRANCHES.map((raw) => {
              const b = getLocalizedBranch(raw.id, lang);
              const owned = shop.branches.includes(b.id);
              const pending = pendingProjects.find(
                (p) => p.kind === 'BRANCH' && p.targetId === b.id
              );
              const meetsRep = shop.reputation >= b.minReputation;
              const canBuy = !owned && !pending && meetsRep && shop.cash >= b.unlockCost;
              const roiDays = Math.ceil(b.unlockCost / Math.max(1, b.dailyNetIncome));

              return (
                <div
                  key={b.id}
                  className={`rounded-xl border p-2.5 flex flex-col justify-between gap-1.5 min-h-0 overflow-hidden ${
                    owned
                      ? 'border-emerald-400/30 bg-[#13221D]'
                      : 'border-white/10 bg-[#151D28]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-slate-100 truncate">
                        {b.name}
                      </div>
                      <div className="text-[10px] text-amber-300/90 truncate">
                        {b.district} · +{b.prestigeBonus} {bi('Prestij', 'Prestige')}
                      </div>
                    </div>
                    <span className="font-mono text-[11px] font-extrabold text-emerald-400 shrink-0 tabular-nums">
                      +{formatTRY(b.dailyNetIncome)}/{bi('g', 'd')}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-300 line-clamp-2 leading-snug">
                    {b.description}
                  </p>

                  {/* Rich Financial Metrics Strip */}
                  <div className="rounded-lg border border-white/8 bg-[#0E141D] px-2 py-1.5 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9.5px] tabular-nums">
                    <div className="text-slate-400">
                      {bi('Amorti', 'Payback')}:{' '}
                      <strong className="font-mono text-slate-100">~{roiDays} {bi('gün', 'd')}</strong>
                    </div>
                    <div className="text-slate-400 text-right">
                      {bi('Çevrimdışı', 'Offline')}:{' '}
                      <strong className="font-mono text-sky-300">+{formatTRY(b.offlineHourlyRate)}/s</strong>
                    </div>
                    <div className="text-slate-400">
                      {bi('Kurulum', 'Build')}:{' '}
                      <strong className="font-mono text-slate-200">{b.buildDays} {bi('gün', 'd')}</strong>
                    </div>
                    <div className="text-slate-400 text-right">
                      {bi('Gereken', 'Min Rep')}:{' '}
                      <strong className={meetsRep ? 'text-emerald-400' : 'text-amber-300'}>
                        {b.minReputation.toFixed(1)}★
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    {owned ? (
                      <div className="w-full rounded-lg bg-emerald-500/15 py-1 text-center text-[10.5px] font-bold text-emerald-300">
                        ✓ {bi('Aktif Şube · Gelir Akıyor', 'Active Branch · Earning')}
                      </div>
                    ) : pending ? (
                      <div className="w-full rounded-lg bg-sky-500/15 py-1 text-center text-[10.5px] font-bold text-sky-300">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {bi(`İnşaatta (${pending.daysRemaining}g kaldı)`, `Building (${pending.daysRemaining}d left)`)}
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={!canBuy}
                        onClick={() => onUnlockBranch(b.id)}
                        className="w-full rounded-lg bg-amber-500 py-1.5 text-[10.5px] font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-35 cursor-pointer tabular-nums"
                      >
                        {!meetsRep
                          ? bi(`${b.minReputation.toFixed(1)}★ İtibar Gerekli`, `Requires ${b.minReputation.toFixed(1)}★ Rep`)
                          : bi(`Şube Aç · ${formatTRY(b.unlockCost)}`, `Open Branch · ${formatTRY(b.unlockCost)}`)}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* 6th Card: Empire Passive Cashflow Summary */}
            <div className="rounded-xl border border-amber-400/25 bg-[#161D2A] p-2.5 flex flex-col justify-between gap-1.5 min-h-0 overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  {bi('Şube Ağı Özeti', 'Branch Network Summary')}
                </div>
                <span className="font-mono text-[10.5px] font-bold text-slate-300">
                  {shop.branches.length} / {CITY_BRANCHES.length}
                </span>
              </div>

              <div className="rounded-lg border border-white/8 bg-[#0E141D] p-2 space-y-1.5 text-[10.5px] tabular-nums">
                <div className="flex justify-between">
                  <span className="text-slate-400">{bi('Günlük Şube Geliri', 'Daily Branch Income')}</span>
                  <span className="font-mono font-extrabold text-emerald-400">
                    +{formatTRY(totalBranchDailyIncome)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{bi('Saatlik Çevrimdışı', 'Offline Hourly')}</span>
                  <span className="font-mono font-bold text-sky-300">
                    +{formatTRY(totalBranchOfflineHourly)}/s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{bi('Pazar Hakimiyetin', 'Your Market Share')}</span>
                  <span className="font-mono font-bold text-amber-300">
                    %{shop.rival.boughtOut ? 100 : 100 - shop.rival.marketShare}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 leading-snug">
                {bi(
                  'Şubeler her gün sonu net nakit getirir ve oyun kapalıyken bile kasana çevrimdışı gelir yazar.',
                  'Branches pay net daily cash and keep generating offline income even while you are away.'
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: BANK LOANS & TAX (ZERO DEAD SPACE, NO Sv.X!) */}
      {subTab === 'FINANCE' && (
        <div className="flex-1 min-h-0 grid grid-cols-12 gap-2 overflow-hidden">
          {/* Left: Tax & Active Loans */}
          <div className="col-span-5 flex flex-col gap-2 min-h-0 overflow-hidden">
            <div className="shrink-0 rounded-xl border border-white/10 bg-[#151D28] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-100 flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  {bi('Vergi & Muhasebe', 'Tax & Accounting')}
                </span>
                <span className="font-mono text-[11px] font-bold text-amber-300">
                  {bi('KDV', 'VAT')}: %{taxPct}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-[#0E141D] border border-white/8 px-2.5 py-2 tabular-nums">
                <div>
                  <div className="text-[10px] text-slate-400">
                    {bi('Ödenecek Vergi Borcu', 'Weekly Tax Due')}
                  </div>
                  <div className="font-mono text-sm font-extrabold text-emerald-400">
                    {formatTRY(shop.weeklyTaxDue)}
                  </div>
                </div>
                {shop.weeklyTaxDue > 0 ? (
                  <button
                    type="button"
                    disabled={shop.cash < shop.weeklyTaxDue}
                    onClick={onPayWeeklyTax}
                    className="rounded-lg bg-emerald-500 px-3 py-1.5 text-[11px] font-extrabold text-slate-950 hover:bg-emerald-400 disabled:opacity-35 cursor-pointer"
                  >
                    {bi('Vergiyi Öde', 'Pay Tax')}
                  </button>
                ) : (
                  <span className="text-[11px] font-bold text-emerald-400">
                    ✓ {bi('Borç Yok', 'All Clear')}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={onGoToStaff}
                className="w-full rounded-lg bg-[#0E141D] border border-sky-400/25 px-2.5 py-1.5 text-[10px] text-sky-300 hover:bg-sky-500/10 flex items-center justify-between cursor-pointer text-left"
              >
                <span className="truncate">
                  {shop.staff.includes('accountant')
                    ? bi('Mali Müşavir Selma aktif — vergi ve kredi faizi optimize edildi.', 'CPA Selma active — taxes & loan rates optimized.')
                    : bi('Mali Müşavir Selma’yı tutarak KDV’yi %6’ya düşür →', 'Hire CPA Selma to cut VAT down to 6% →')}
                </span>
              </button>
            </div>

            <div className="flex-1 min-h-0 rounded-xl border border-white/10 bg-[#151D28] p-3 flex flex-col gap-2 overflow-hidden">
              <div className="text-xs font-extrabold text-slate-100 flex items-center justify-between">
                <span>
                  {bi('Aktif Krediler', 'Active Loans')} ({shop.activeLoans.length}/2)
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  {bi(`Dükkan Kademesi: ${shop.shopTier}/6`, `Shop Tier: ${shop.shopTier}/6`)}
                </span>
              </div>
              {shop.activeLoans.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-1 px-4">
                  <Landmark className="w-7 h-7 text-slate-600" />
                  <div className="text-xs font-semibold text-slate-400">
                    {bi('Şu an aktif kredi borcun yok.', 'No active bank loans.')}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {bi(
                      'Aynı anda en fazla 2 ticari kredi kullanabilirsin. Taksitler her gün sonu otomatik tahsil edilir.',
                      'Hold up to 2 commercial loans at once. Daily installments are deducted at end of day.'
                    )}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {shop.activeLoans.map((ln) => (
                    <div
                      key={ln.id}
                      className="rounded-lg bg-[#0E141D] border border-white/8 p-2.5 text-[11px] tabular-nums space-y-1.5"
                    >
                      <div className="flex justify-between font-bold text-slate-100">
                        <span className="truncate">{ln.name}</span>
                        <span className="font-mono text-rose-300">
                          {formatTRY(ln.remainingBalance)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>
                          {bi('Günlük', 'Daily')}: {formatTRY(ln.dailyPayment)} · {ln.daysLeft}{bi('g', 'd')}
                        </span>
                        <button
                          type="button"
                          disabled={shop.cash < ln.remainingBalance}
                          onClick={() => onRepayLoanEarly(ln.id)}
                          className="rounded bg-emerald-500/15 border border-emerald-400/35 px-2 py-0.5 text-[9.5px] font-bold text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-35 cursor-pointer"
                        >
                          {bi('Erken Kapat', 'Pay Off')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: 6 Bank Loan Offers with Rich Financial Details */}
          <div className="col-span-7 grid grid-cols-3 grid-rows-2 gap-2 min-h-0 overflow-hidden">
            {BANK_LOANS.map((raw) => {
              const ln = getLocalizedLoan(raw.id, lang);
              const unlocked = shop.shopTier >= ln.minShopTier;
              const terms = getEffectiveLoanTerms(
                ln.principal,
                ln.interestRate,
                ln.termDays,
                shop.staff,
                shop.staffLevels
              );
              const interestCost = terms.totalRepay - terms.effectivePrincipal;
              const canTake = unlocked && shop.activeLoans.length < 2;
              const tierInfo = SHOP_TIERS[ln.minShopTier];

              return (
                <div
                  key={ln.id}
                  className={`rounded-xl border p-2.5 flex flex-col justify-between gap-1.5 min-h-0 overflow-hidden ${
                    unlocked
                      ? 'border-white/10 bg-[#151D28]'
                      : 'border-white/5 bg-[#121821]/85'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-[11px] font-extrabold text-slate-100 leading-tight truncate">
                      {ln.name}
                    </div>
                    <div className="font-mono text-sm font-extrabold text-emerald-400 tabular-nums">
                      {formatTRY(terms.effectivePrincipal)}
                    </div>
                  </div>

                  <p className="text-[9.5px] text-slate-400 line-clamp-2 leading-snug">
                    {ln.description}
                  </p>

                  {/* Structured Financial Breakdown */}
                  <div className="rounded-lg border border-white/8 bg-[#0E141D] p-1.5 space-y-0.5 text-[9.5px] tabular-nums">
                    <div className="flex justify-between">
                      <span className="text-slate-400">{bi('Faiz / Vade', 'APR / Term')}</span>
                      <span className="font-mono text-amber-300">
                        %{Math.round(terms.effectiveRate * 100)} · {ln.termDays}{bi('g', 'd')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{bi('Toplam Ödeme', 'Total Repay')}</span>
                      <span className="font-mono text-slate-200">{formatTRY(terms.totalRepay)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{bi('Günlük Taksit', 'Daily Pay')}</span>
                      <span className="font-mono font-bold text-rose-300">
                        {formatTRY(terms.dailyPayment)}/{bi('g', 'd')}
                      </span>
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500">
                      <span>{bi('Faiz Maliyeti', 'Interest')}</span>
                      <span className="font-mono">+{formatTRY(interestCost)}</span>
                    </div>
                  </div>

                  {unlocked ? (
                    <button
                      type="button"
                      disabled={!canTake}
                      onClick={() => onTakeLoan(raw)}
                      className="w-full rounded-lg bg-amber-500 py-1.5 text-[10.5px] font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-35 cursor-pointer"
                    >
                      {shop.activeLoans.length >= 2
                        ? bi('Limit Dolu (2/2)', 'Max 2 Loans')
                        : bi('Kredi Çek', 'Take Loan')}
                    </button>
                  ) : (
                    <div className="w-full rounded-lg bg-white/5 py-1.5 px-1.5 text-center text-[10px] font-bold text-amber-300/90 inline-flex items-center justify-center gap-1 truncate">
                      <Lock className="w-3 h-3 shrink-0" />
                      {bi(`${ln.minShopTier}. Dükkan`, `Shop Tier ${ln.minShopTier}`)} ({tierInfo.name.split(' ')[0]})
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: NOSTALGIA MUSEUM WITH DEEP STORIES & ARCHIVE PLAQUE MODAL */}
      {subTab === 'MUSEUM' && (
        <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
          {/* Museum Collection Header Bar */}
          <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#151D28] px-3 py-1.5 text-[11px] tabular-nums">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-extrabold text-slate-100">
                {bi('GSM Nostalji & Efsaneler Müzesi', 'GSM Nostalgia & Legends Museum')}
              </span>
              <span className="text-slate-400">
                · {shop.museumItems.length}/5 {bi('Sergileniyor', 'Displayed')}
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[10.5px]">
              <span className="text-amber-300 font-bold">
                +{totalMuseumPrestige} {bi('Prestij', 'Prestige')}
              </span>
              <span className="text-emerald-400 font-bold">
                +{formatTRY(totalMuseumDaily)}/{bi('gün', 'day')}
              </span>
            </div>
          </div>

          {/* 5 Museum Cards — Rich Story Excerpt + Pedestal Art + Read Chronicle Button */}
          <div className="flex-1 min-h-0 grid grid-cols-5 gap-2 overflow-hidden">
            {MUSEUM_ITEMS.map((raw) => {
              const item = getLocalizedMuseumItem(raw.id, lang);
              const owned = shop.museumItems.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`rounded-xl border p-2.5 flex flex-col justify-between gap-2 min-h-0 overflow-hidden ${
                    owned
                      ? 'border-amber-400/45 bg-[#1C1A14]'
                      : 'border-white/10 bg-[#151D28]'
                  }`}
                >
                  {/* Top Title & Era */}
                  <div className="shrink-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-1 text-[9.5px]">
                      <span
                        className="font-mono font-bold truncate"
                        style={{ color: item.accentColor }}
                      >
                        {item.year} · {item.rarityLabel}
                      </span>
                    </div>
                    <div className="text-[11px] font-extrabold text-slate-100 leading-tight line-clamp-2">
                      {item.name}
                    </div>
                  </div>

                  {/* Center Museum Pedestal Stage */}
                  <div className="shrink-0 rounded-xl border border-white/8 bg-[#0D131C] py-2 px-2 flex flex-col items-center justify-center gap-1">
                    <MuseumPhoneArt id={item.id} className="w-12 h-16 lg:w-14 lg:h-20" />
                    <div className="text-[9.5px] font-mono text-emerald-400 font-bold tabular-nums">
                      +{formatTRY(item.dailyPassiveCash)}/{bi('g', 'd')} · +{item.prestigeBonus}P
                    </div>
                  </div>

                  {/* Rich Nostalgic Story Preview (Fills Space Meaningfully!) */}
                  <div className="flex-1 min-h-0 rounded-lg border border-white/6 bg-[#0E141D] p-2 flex flex-col justify-between gap-1 overflow-hidden">
                    <p className="text-[10px] text-slate-300 leading-snug line-clamp-4">
                      {item.story}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedMuseumId(item.id)}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 hover:text-amber-200 cursor-pointer self-start"
                    >
                      <BookOpen className="w-3 h-3" />
                      {bi('Tam Hikayeyi Oku →', 'Read Full Story →')}
                    </button>
                  </div>

                  {/* Buy / Displayed Footer */}
                  <div className="shrink-0">
                    {owned ? (
                      <div className="w-full rounded-lg bg-amber-500/20 py-1.5 text-center text-[10px] font-extrabold text-amber-300 inline-flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {bi('Vitrinde Sergileniyor', 'On Display')}
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={shop.cash < item.cost}
                        onClick={() => onBuyMuseumItem(item.id)}
                        className="w-full rounded-lg bg-amber-500 py-1.5 text-[10.5px] font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-35 cursor-pointer tabular-nums"
                      >
                        {formatTRY(item.cost)}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MUSEUM ARCHIVE CHRONICLE MODAL */}
      {selectedMuseumSpec && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setSelectedMuseumId(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-amber-400/35 bg-[#151D28] p-4 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-white/10 bg-[#0D131C] p-2.5">
                  <MuseumPhoneArt id={selectedMuseumSpec.id} className="w-14 h-20" />
                </div>
                <div>
                  <div
                    className="text-[10.5px] font-mono font-bold uppercase tracking-wider"
                    style={{ color: selectedMuseumSpec.accentColor }}
                  >
                    {selectedMuseumSpec.eraTag} · {selectedMuseumSpec.rarityLabel}
                  </div>
                  <h3 className="font-display text-base font-extrabold text-slate-50 mt-0.5">
                    {selectedMuseumSpec.name}
                  </h3>
                  <div className="text-[11px] text-emerald-400 font-mono font-bold mt-0.5 tabular-nums">
                    +{formatTRY(selectedMuseumSpec.dailyPassiveCash)}/{bi('gün', 'day')} · +
                    {selectedMuseumSpec.prestigeBonus} {bi('Prestij', 'Prestige')}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMuseumId(null)}
                className="w-8 h-8 rounded-lg border border-white/10 bg-[#0E141D] flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-xl border border-white/8 bg-[#0E141D] p-3 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {bi('KOLEKSİYONER ARŞİV HİKAYESİ', 'COLLECTOR ARCHIVE CHRONICLE')}
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {selectedMuseumSpec.fullHistory}
              </p>
              <div className="border-t border-white/8 pt-2 text-[11px] font-semibold text-amber-300">
                {selectedMuseumSpec.collectorPerk}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedMuseumId(null)}
                className="rounded-lg border border-white/10 bg-[#1B2432] px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-[#243042] cursor-pointer"
              >
                {bi('Kapat', 'Close')}
              </button>
              {!shop.museumItems.includes(selectedMuseumSpec.id) && (
                <button
                  type="button"
                  disabled={shop.cash < selectedMuseumSpec.cost}
                  onClick={() => {
                    onBuyMuseumItem(selectedMuseumSpec.id);
                    setSelectedMuseumId(null);
                  }}
                  className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-40 cursor-pointer tabular-nums"
                >
                  {bi('Koleksiyona Kat', 'Acquire Relic')} · {formatTRY(selectedMuseumSpec.cost)}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
