import React, { useEffect, useRef, useState } from 'react';
import {
  Award,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Gavel,
  Gift,
  Landmark,
  Lock,
  Megaphone,
  Package,
  PlayCircle,
  Receipt,
  Search,
  ShieldAlert,
  Sparkles,
  Store,
  Tag,
  TrendingUp,
  Truck,
  Wrench,
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
  getWeekdayInfo,
  hasAuctionLicense,
  hasClassifiedsLicense,
  roundPrice,
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
  onKermesSellPhone: (phoneUid: string) => void;
  onBuyKermesDeal: (dealId: string) => void;
  onActivatePassive2xAd?: () => void;
  onGoToStaff: () => void;
  onBackToCounter: () => void;
}

type EmpireSubTab =
  | 'CLASSIFIEDS'
  | 'AUCTION'
  | 'KERMES'
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
  onKermesSellPhone,
  onBuyKermesDeal,
  onActivatePassive2xAd,
  onGoToStaff,
  onBackToCounter,
}) => {
  const { lang, bi } = useLanguage();
  const weekday = getWeekdayInfo(shop.day);
  const kermes = shop.sundayKermes ?? null;
  const kermesOpen = weekday.isSunday && Boolean(kermes);
  const [subTab, setSubTab] = useState<EmpireSubTab>(() =>
    getWeekdayInfo(shop.day).isSunday ? 'KERMES' : 'CLASSIFIEDS'
  );
  const [classifiedView, setClassifiedView] = useState<'LISTINGS' | 'SHIPPING'>('LISTINGS');
  const [selectedMuseumId, setSelectedMuseumId] = useState<MuseumItemId | null>(null);
  const [justBoughtMuseumId, setJustBoughtMuseumId] = useState<MuseumItemId | null>(null);
  const [wonMysteryLot, setWonMysteryLot] = useState<CustomsAuctionLot | null>(null);
  const [kermesPage, setKermesPage] = useState(0);

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

  const prevLotIdRef = useRef<string | null>(activeLot?.id ?? null);

  useEffect(() => {
    if (auctionLots.length > 0 && selectedLotIdx >= auctionLots.length) {
      setSelectedLotIdx(0);
    }
  }, [auctionLots.length, selectedLotIdx]);

  useEffect(() => {
    const currentId = activeLot?.id ?? null;
    if (currentId !== prevLotIdRef.current) {
      prevLotIdRef.current = currentId;
      setAuctionActive(false);
      setCurrentBid(activeLot?.startingBid ?? 8000);
      setHighestBidder(bi('Açılış Fiyatı', 'Opening Bid'));
      setAuctionRound(0);
      setAuctionLog([]);
    }
  }, [activeLot?.id, activeLot?.startingBid, bi]);

  const selectLot = (idx: number) => {
    if (auctionActive) return;
    setSelectedLotIdx(idx);
    const nextLot = auctionLots[idx];
    if (nextLot) {
      prevLotIdRef.current = nextLot.id;
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

  const lotReqCash = activeLot?.requiredCash ?? 0;
  const lotCashLocked = lotReqCash > 0 && shop.cash < lotReqCash;
  const bidSteps = getAuctionStepSizes(activeLot?.startingBid ?? 10000);

  const startAuction = () => {
    if (!activeLot || activeLot.resolved || lotCashLocked) return;
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

    // Harder rival aggression scaling with auction tier index & player wealth
    const rivalAggression = 0.75 + Math.min(0.2, selectedLotIdx * 0.04);
    const rivalMax = Math.round(lotValue * (rivalAggression + Math.random() * 0.12));
    const rival = AUCTION_RIVALS[Math.floor(Math.random() * AUCTION_RIVALS.length)];
    const counterStep = bidSteps[0];

    if (nextBid < rivalMax && auctionRound < 6) {
      const rivalBid =
        Math.round((nextBid + counterStep + Math.random() * counterStep * 1.35) / 250) * 250;
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
          `Rakipler çekildi! Tokmak vuruldu — ${formatTRY(nextBid)} bedelle koliyi ve gizemli kutuları kazandın!`,
          `Rivals fold! Sold to you for ${formatTRY(nextBid)} with mystery boxes!`
        ),
      ]);
      onResolveAuction(activeLot.id, true, nextBid);
      if (activeLot.mysteryRewards && activeLot.mysteryRewards.length > 0) {
        setWonMysteryLot({ ...activeLot, winningBid: nextBid, wonByPlayer: true, resolved: true });
      }
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
        className={`rounded-xl border p-1.5 [@media(min-height:560px)]:p-2.5 flex flex-col justify-between gap-1 [@media(min-height:560px)]:gap-2 min-h-0 overflow-hidden ${
          status === 'BOUGHT'
            ? 'border-emerald-400/25 bg-[#12201C]/75'
            : status === 'REJECTED'
            ? 'border-white/5 bg-[#11161F]/60 opacity-60'
            : 'border-white/10 bg-[#151D28]'
        }`}
      >
        {/* Header */}
        <div className="shrink-0 flex items-start justify-between gap-1.5">
          <div className="min-w-0">
            <div className="text-[11px] [@media(min-height:560px)]:text-xs font-extrabold text-slate-100 truncate">
              {item.device.brand} {item.device.model}{' '}
              <span className="text-[9.5px] font-mono text-slate-400">
                {item.device.storage}
              </span>
            </div>
            <div className="text-[9.5px] text-slate-400 truncate">
              {item.sellerName} · {item.district} ·{' '}
              <span className={`font-bold ${riskColor}`}>
                {item.riskTag === 'Kelepir Fırsat'
                  ? bi('Kelepir', 'Bargain')
                  : item.riskTag === 'Şüpheli İlan'
                  ? bi('Şüpheli', 'Risky')
                  : bi('Temiz', 'Clean')}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0 tabular-nums">
            <div className="font-mono text-[10.5px] [@media(min-height:560px)]:text-xs font-extrabold text-amber-300">
              {formatTRY(currentPrice)}
            </div>
            <div className="text-[9px] font-mono text-slate-400">
              {bi('Piyasa ~', 'Mkt ~')}
              {formatTRY(estMarket)}
            </div>
          </div>
        </div>

        {/* Rich Center Stage — Phone Thumb + Spec Dossier */}
        <div className="flex-1 min-h-0 rounded-lg border border-white/8 bg-[#0E141D] p-1.5 [@media(min-height:560px)]:p-2 flex items-center gap-2 overflow-hidden">
          <PhoneModelThumb
            device={item.device}
            showBack
            className="h-full max-h-12 [@media(min-height:540px)]:max-h-24 w-auto shrink-0"
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
                <p className="hidden [@media(min-height:540px)]:block text-[9.5px] italic text-slate-300 line-clamp-1 [@media(min-height:600px)]:line-clamp-2 leading-tight border-t border-white/6 pt-1">
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
                className="rounded-lg bg-amber-500/15 border border-amber-400/35 py-1 [@media(min-height:560px)]:py-1.5 text-[10px] font-bold text-amber-200 hover:bg-amber-500/25 disabled:opacity-35 cursor-pointer whitespace-nowrap"
              >
                {bi('Yerinde Bak (250 ₺)', 'Onsite (250 ₺)')}
              </button>
              <button
                type="button"
                disabled={shop.cash < 350}
                onClick={() => onOrderClassifiedCod(item.id)}
                className="rounded-lg bg-sky-500/15 border border-sky-400/35 py-1 [@media(min-height:560px)]:py-1.5 text-[10px] font-bold text-sky-200 hover:bg-sky-500/25 disabled:opacity-35 cursor-pointer whitespace-nowrap"
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
    <div className="relative h-full flex-1 min-h-0 flex flex-col overflow-hidden bg-[#0F141B] p-1.5 [@media(min-height:560px)]:p-2 gap-1.5">
      {/* COMPACT TOOLBAR — ALL 6 SUB-TABS ALWAYS VISIBLE */}
      <div className="shrink-0 flex flex-nowrap items-center justify-between gap-1 rounded-xl border border-white/10 bg-[#151D28] px-1.5 py-1 overflow-hidden">
        <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden">
          {(
            [
              ['CLASSIFIEDS', Search, bi('Sarı İlan', 'Classifieds')],
              [
                'AUCTION',
                Gavel,
                bi(`İhale (${openAuctionCount}/6)`, `Auction (${openAuctionCount}/6)`),
              ],
              [
                'KERMES',
                Tag,
                kermesOpen
                  ? bi('Kermes·AÇIK', 'Fair·OPEN')
                  : bi('Kermes', 'Fair'),
              ],
              ['BRANCHES', Building2, bi('Şube', 'Branches')],
              ['FINANCE', Landmark, bi('Banka', 'Bank')],
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
              className={`inline-flex items-center gap-1 rounded-lg px-1.5 sm:px-2 py-0.5 [@media(min-height:560px)]:py-1 text-[9.5px] sm:text-[10px] font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                subTab === id
                  ? id === 'KERMES' && kermesOpen
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-amber-500 text-slate-950'
                  : id === 'KERMES' && kermesOpen
                  ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/50 hover:bg-emerald-500/30'
                  : 'bg-[#0E141D] text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onBackToCounter}
          className="rounded-lg border border-white/10 bg-[#1B2432] px-1.5 sm:px-2 py-0.5 [@media(min-height:560px)]:py-1 text-[9.5px] sm:text-[10px] font-semibold text-slate-200 hover:bg-[#243042] whitespace-nowrap shrink-0 cursor-pointer"
        >
          ← {bi('Tezgah', 'Counter')}
        </button>
      </div>

      {/* SUB-TAB 1: CLASSIFIEDS & INTERCITY SHIPPING */}
      {subTab === 'CLASSIFIEDS' && (
        !classifiedsLicensed ? (
          <div className="h-full flex-1 min-h-0 rounded-2xl border border-amber-400/35 bg-[#151D28] flex flex-col items-center justify-center text-center p-2.5 [@media(min-height:560px)]:p-4 gap-1.5 [@media(min-height:560px)]:gap-2.5 overflow-hidden">
            <div className="w-8 h-8 [@media(min-height:560px)]:w-10 [@media(min-height:560px)]:h-10 rounded-xl border border-amber-400/40 bg-amber-500/15 flex items-center justify-center shrink-0">
              <Search className="w-4 h-4 [@media(min-height:560px)]:w-5 [@media(min-height:560px)]:h-5 text-amber-400" />
            </div>
            <div className="space-y-0.5 max-w-lg">
              <div className="text-[9px] font-mono font-bold text-amber-300 uppercase tracking-wider">
                {bi('YENİ İŞ KOLU · SARI İLAN & KARGO AĞI', 'NEW BUSINESS LINE · CLASSIFIEDS & CARGO')}
              </div>
              <h3 className="font-display text-xs [@media(min-height:560px)]:text-sm font-extrabold text-slate-50">
                {bi('Sarı İlan & Şehir Dışı Kargo Yetkisi', 'Classifieds & Intercity Cargo Permit')}
              </h3>
              <p className="text-[10px] [@media(min-height:560px)]:text-[11px] text-slate-300 leading-snug line-clamp-2 [@media(min-height:540px)]:line-clamp-none">
                {bi(
                  'Şehir içindeki kelepir 2. el ilanları yerinde ekspertiz veya kapıda kontrollü kargo ile kapat; temiz cihazlarını şehir dışındaki alıcılara ekstra kâr marjıyla gönder!',
                  'Hunt underpriced local listings with onsite inspection or COD cargo, and ship clean devices nationwide for extra profit margins!'
                )}
              </p>
            </div>
            <div className="hidden [@media(min-height:430px)]:grid grid-cols-3 gap-1.5 [@media(min-height:540px)]:gap-2 max-w-lg w-full text-[10px]">
              <div className="rounded-xl border border-white/8 bg-[#0E141D] p-1.5 [@media(min-height:540px)]:p-2">
                <div className="font-bold text-amber-300">{bi('Günlük 4 İlan', '4 Daily Listings')}</div>
                <div className="text-slate-400 text-[9.5px] mt-0.5 truncate">{bi('Kelepir & pazarlık', 'Bargains & haggling')}</div>
              </div>
              <div className="rounded-xl border border-white/8 bg-[#0E141D] p-1.5 [@media(min-height:540px)]:p-2">
                <div className="font-bold text-sky-300">{bi('Kapıda Kontrol', 'COD Inspection')}</div>
                <div className="text-slate-400 text-[9.5px] mt-0.5 truncate">{bi('Kusur çıkarsa fiyat kır', 'Slash price on defects')}</div>
              </div>
              <div className="rounded-xl border border-white/8 bg-[#0E141D] p-1.5 [@media(min-height:540px)]:p-2">
                <div className="font-bold text-emerald-300">{bi('Şehir Dışı Kargo', 'Intercity Orders')}</div>
                <div className="text-slate-400 text-[9.5px] mt-0.5 truncate">{bi('+%15 kârlı alıcılar', '+15% margin buyers')}</div>
              </div>
            </div>
            <button
              type="button"
              disabled={shop.cash < classifiedsSpec.cost}
              onClick={() => onBuyUpgrade('classifieds_license')}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-1.5 [@media(min-height:540px)]:px-5 [@media(min-height:540px)]:py-2.5 text-[11px] [@media(min-height:540px)]:text-xs font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-40 cursor-pointer tabular-nums"
            >
              <Search className="w-4 h-4" />
              {shop.cash < classifiedsSpec.cost
                ? bi(`Yetersiz Kasa (${formatTRY(classifiedsSpec.cost)} Gerekli)`, `Need ${formatTRY(classifiedsSpec.cost)}`)
                : bi(`Yetkiyi Satın Al (${formatTRY(classifiedsSpec.cost)})`, `Buy Permit (${formatTRY(classifiedsSpec.cost)})`)}
            </button>
          </div>
        ) : (
        <div className="h-full flex-1 min-h-0 flex flex-col gap-1.5 [@media(min-height:560px)]:gap-2 overflow-hidden">
          <div className="shrink-0 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setClassifiedView('LISTINGS')}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10.5px] font-bold cursor-pointer ${
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
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10.5px] font-bold cursor-pointer ${
                  classifiedView === 'SHIPPING'
                    ? 'bg-sky-500 text-slate-950'
                    : 'bg-[#151D28] text-slate-300 border border-white/10'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                {bi('Şehir Dışı Kargo', 'Shipping Orders')} ({shop.shippingOrders.length})
              </button>
            </div>
            <span className="text-[10px] text-slate-400 hidden md:inline truncate">
              {bi(
                'İlanı yerinde kontrol et veya kapıda kargo ile açıp kusur çıkarsa fiyat kır!',
                'Inspect onsite or order COD cargo and negotiate down if hidden defects appear!'
              )}
            </span>
          </div>

          {classifiedView === 'LISTINGS' ? (
            <div className="h-full flex-1 min-h-0 grid grid-cols-2 grid-rows-2 gap-1.5 [@media(min-height:560px)]:gap-2 overflow-hidden">
              {shop.onlineListings.slice(0, 4).map(renderListingCard)}
            </div>
          ) : (
            <div className="h-full flex-1 min-h-0 grid grid-cols-3 gap-1.5 [@media(min-height:560px)]:gap-2 overflow-hidden">
              {shop.shippingOrders.slice(0, 3).map((order) => {
                const eligible: PhoneDevice[] = (
                  order.requireClean ? cleanInventory : allInventory
                ).filter((d) => d.tier === order.requestedTier);

                return (
                  <div
                    key={order.id}
                    className={`rounded-xl border p-1.5 [@media(min-height:560px)]:p-3 flex flex-col justify-between gap-1.5 min-h-0 overflow-hidden ${
                      order.fulfilled
                        ? 'border-emerald-400/30 bg-[#12201C]/80'
                        : 'border-white/10 bg-[#151D28]'
                    }`}
                  >
                    <div className="min-h-0 space-y-1 overflow-hidden">
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="min-w-0">
                          <div className="text-[11px] [@media(min-height:560px)]:text-xs font-extrabold text-slate-100 truncate">
                            {order.buyerName} · {order.city}
                          </div>
                          <div className="text-[9.5px] text-sky-300 font-semibold truncate">
                            {order.requestedTier.toUpperCase()} ·{' '}
                            {order.requireClean
                              ? bi('Kusursuz', 'Clean Only')
                              : bi('Her Durum', 'Any')}
                          </div>
                        </div>
                        <span className="font-mono text-[11px] font-extrabold text-emerald-400 shrink-0">
                          +{Math.round((order.bonusMultiplier - 1) * 100)}%
                        </span>
                      </div>

                      <div className="rounded-lg border border-white/8 bg-[#0E141D] p-1.5 space-y-0.5 text-[10px]">
                        <div className="flex justify-between text-slate-400">
                          <span>{bi('Kargo', 'Ship Fee')}</span>
                          <span className="font-mono text-slate-200">{formatTRY(order.shippingFee)}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>{bi('Stok', 'Stock')}</span>
                          <span className="font-mono font-bold text-amber-300">
                            {eligible.length} {bi('cihaz', 'unit(s)')}
                          </span>
                        </div>
                      </div>

                      <p className="text-[9.5px] [@media(min-height:540px)]:text-[10.5px] italic text-slate-300 leading-tight line-clamp-2">
                        "{order.note}"
                      </p>
                    </div>

                    <div className="shrink-0">
                      {order.fulfilled ? (
                        <div className="rounded-lg bg-emerald-500/20 py-1 text-center text-[10.5px] font-bold text-emerald-300">
                          ✓ {bi('Kargolandı', 'Shipped')}
                        </div>
                      ) : eligible.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-white/10 py-1.5 text-center text-[10px] text-slate-400 truncate px-1">
                          {bi(
                            `Uygun ${order.requestedTier.toUpperCase()} cihaz yok`,
                            `No ${order.requestedTier.toUpperCase()} phone in stock`
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
                                className="w-full rounded-lg bg-sky-500 py-1 px-2 text-[10px] font-extrabold text-slate-950 hover:bg-sky-400 cursor-pointer truncate tabular-nums"
                              >
                                {bi('Gönder', 'Ship')}: {dev.brand} {dev.model} ({formatTRY(payout)})
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        )
      )}

      {/* SUB-TAB 2: 6-TIER DAILY CUSTOMS & LIQUIDATION AUCTION HALL (STRICT ZERO SCROLL) */}
      {subTab === 'AUCTION' && (
        !auctionLicensed ? (
          <div className="h-full flex-1 min-h-0 rounded-2xl border border-amber-400/35 bg-[#151D28] flex flex-col items-center justify-center text-center p-2.5 [@media(min-height:560px)]:p-4 gap-1.5 [@media(min-height:560px)]:gap-2.5 overflow-hidden">
            <div className="w-8 h-8 [@media(min-height:560px)]:w-10 [@media(min-height:560px)]:h-10 rounded-xl border border-amber-400/40 bg-amber-500/15 flex items-center justify-center shrink-0">
              <Gavel className="w-4 h-4 [@media(min-height:560px)]:w-5 [@media(min-height:560px)]:h-5 text-amber-400" />
            </div>
            <div className="space-y-0.5 max-w-lg">
              <div className="text-[9px] font-mono font-bold text-amber-300 uppercase tracking-wider">
                {bi('YENİ İŞ KOLU · RESMİ İHALE SALONU', 'NEW BUSINESS LINE · OFFICIAL AUCTION HALL')}
              </div>
              <h3 className="font-display text-xs [@media(min-height:560px)]:text-sm font-extrabold text-slate-50">
                {bi('Resmi Gümrük & İcra İhale Kartı', 'Official Customs & Liquidation Auction Pass')}
              </h3>
              <p className="text-[10px] [@media(min-height:560px)]:text-[11px] text-slate-300 leading-snug line-clamp-2 [@media(min-height:540px)]:line-clamp-none">
                {bi(
                  'Her gün 6 farklı kademede mühürlü koli ihalesine katıl! Rakip esnaflarla canlı pey yarıştır, toplu cihaz ve bonus aksesuarları ucuza kapat.',
                  'Enter 6 progressive sealed-crate auctions daily! Outbid rival merchants for bulk devices and bonus accessory crates.'
                )}
              </p>
            </div>
            <div className="hidden [@media(min-height:430px)]:grid grid-cols-3 gap-1.5 [@media(min-height:540px)]:gap-2 max-w-lg w-full text-[9.5px]">
              <div className="rounded-xl border border-white/8 bg-[#0E141D] p-1.5 [@media(min-height:540px)]:p-2">
                <div className="font-bold text-amber-300">{bi('6 Günlük Mezat', '6 Daily Lots')}</div>
                <div className="text-slate-400 mt-0.5 truncate">{bi('VIP kasalar', 'VIP tiers')}</div>
              </div>
              <div className="rounded-xl border border-white/8 bg-[#0E141D] p-1.5 [@media(min-height:540px)]:p-2">
                <div className="font-bold text-emerald-300">{bi('Toplu Cihaz', 'Bulk Phones')}</div>
                <div className="text-slate-400 mt-0.5 truncate">{bi('2–4 cihaz + koli', '2–4 phones + box')}</div>
              </div>
              <div className="rounded-xl border border-white/8 bg-[#0E141D] p-1.5 [@media(min-height:540px)]:p-2">
                <div className="font-bold text-rose-300">{bi('Canlı Rekabet', 'Live Sharks')}</div>
                <div className="text-slate-400 mt-0.5 truncate">{bi('Yüksek risk, dev marj', 'Huge margins')}</div>
              </div>
            </div>
            <button
              type="button"
              disabled={shop.cash < auctionSpec.cost}
              onClick={() => onBuyUpgrade('auction_license')}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-1.5 [@media(min-height:540px)]:px-5 [@media(min-height:540px)]:py-2.5 text-[11px] [@media(min-height:540px)]:text-xs font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-40 cursor-pointer tabular-nums"
            >
              <Gavel className="w-4 h-4" />
              {shop.cash < auctionSpec.cost
                ? bi(`Yetersiz Kasa (${formatTRY(auctionSpec.cost)} Gerekli)`, `Need ${formatTRY(auctionSpec.cost)}`)
                : bi(`İhale Kartını Satın Al (${formatTRY(auctionSpec.cost)})`, `Buy Auction Pass (${formatTRY(auctionSpec.cost)})`)}
            </button>
          </div>
        ) : activeLot && (
        <div className="h-full flex-1 min-h-0 flex flex-row gap-1.5 [@media(min-height:560px)]:gap-2 overflow-hidden">
          {/* Left: All 6 Dynamic Cash-Unlocked Auction Tiers — 6-Row Rail */}
          <div className="h-full w-[165px] sm:w-[190px] lg:w-[240px] shrink-0 grid grid-cols-1 grid-rows-6 gap-1 [@media(min-height:560px)]:gap-1.5 min-h-0 overflow-hidden">
            {auctionLots.slice(0, 6).map((lot, idx) => {
              const selected = idx === selectedLotIdx;
              const reqCash = lot.requiredCash ?? 0;
              const locked = reqCash > 0 && shop.cash < reqCash;
              const boxCount = lot.mysteryBoxCount ?? 1;
              return (
                <button
                  key={lot.id}
                  type="button"
                  disabled={auctionActive && !selected}
                  onClick={() => selectLot(idx)}
                  className={`min-h-0 rounded-xl border px-2 py-0.5 [@media(min-height:560px)]:px-2.5 [@media(min-height:560px)]:py-1.5 text-left transition-colors cursor-pointer disabled:opacity-40 flex flex-col justify-center overflow-hidden ${
                    selected
                      ? 'border-amber-400 bg-amber-500/12'
                      : locked
                      ? 'border-white/5 bg-[#121821]/85'
                      : 'border-white/10 bg-[#151D28] hover:bg-[#1B2533]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] [@media(min-height:560px)]:text-[11px] font-bold text-slate-100 truncate">
                      #{idx + 1} · {lot.sessionLabel ?? lot.lotTitle}
                    </span>
                    {lot.resolved ? (
                      <span
                        className={`text-[9px] font-extrabold shrink-0 ${
                          lot.wonByPlayer ? 'text-emerald-300' : 'text-slate-500'
                        }`}
                      >
                        {lot.wonByPlayer ? bi('Kazanıldı', 'Won') : bi('Kapandı', 'Closed')}
                      </span>
                    ) : locked ? (
                      <span className="inline-flex items-center gap-0.5 font-mono text-[9px] font-bold text-amber-300 shrink-0 tabular-nums">
                        <Lock className="w-2.5 h-2.5" />
                        {formatTRY(reqCash)}
                      </span>
                    ) : (
                      <span className="font-mono text-[9.5px] [@media(min-height:560px)]:text-[10.5px] font-extrabold text-amber-300 shrink-0 tabular-nums">
                        {formatTRY(lot.startingBid)}
                      </span>
                    )}
                  </div>
                  <div className="text-[8.5px] [@media(min-height:560px)]:text-[9.5px] text-slate-400 truncate tabular-nums flex items-center gap-1">
                    <span>
                      {lot.devices.length} {bi('cihaz', 'phones')}
                    </span>
                    <span className="text-fuchsia-300 font-semibold truncate">
                      · {boxCount} {bi('Kutu', 'Box')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Rich Auction Hall Stage */}
          <div className="md:h-full flex-1 min-w-0 rounded-xl border border-white/10 bg-[#151D28] p-2 [@media(min-height:560px)]:p-2.5 flex flex-col justify-between gap-1.5 [@media(min-height:560px)]:gap-2 md:overflow-hidden">
            {/* Stage Header */}
            <div className="shrink-0 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[9px] font-bold uppercase tracking-wider text-amber-400 truncate">
                  {activeLot.difficultyTag ?? bi('GÜMRÜK MEZATI', 'CUSTOMS AUCTION')} ·{' '}
                  {activeLot.riskTag ?? bi('Standart', 'Standard')}
                </div>
                <h3 className="text-[11px] [@media(min-height:560px)]:text-xs font-extrabold text-slate-100 truncate">
                  {activeLot.lotTitle}
                </h3>
                <div className="hidden [@media(min-height:480px)]:block text-[9.5px] text-slate-400 truncate">
                  {activeLot.manifestHint ?? activeLot.description}
                </div>
              </div>

              <div className="text-right shrink-0 tabular-nums">
                <div className="text-[9px] text-slate-400">
                  {bi('Güncel Pey', 'Current Bid')}
                </div>
                <div className="font-mono text-xs [@media(min-height:560px)]:text-sm font-extrabold text-amber-300 leading-tight">
                  {formatTRY(activeLot.resolved ? activeLot.winningBid : currentBid)}
                </div>
                <div className="text-[9.5px] text-emerald-400 font-mono font-bold">
                  {bi('Değer', 'Est.')}: {formatTRY(lotValue)}
                </div>
              </div>
            </div>

            {/* Sealed Crate Manifest + Mystery Boxes + Bonus Accessories */}
            <div className="shrink-0 grid grid-cols-1 sm:grid-cols-12 gap-1.5 [@media(min-height:560px)]:gap-2">
              <div className="sm:col-span-7 rounded-xl border border-white/8 bg-[#0E141D] p-1.5 [@media(min-height:560px)]:p-2 flex items-center justify-around gap-1 overflow-hidden">
                {activeLot.devices.map((d) => (
                  <div key={d.uid} className="flex flex-col items-center gap-0.5 min-w-0">
                    <div className="w-6 h-9 [@media(min-height:540px)]:w-8 [@media(min-height:540px)]:h-12 rounded-lg border border-white/15 bg-[#1B2432] flex flex-col items-center justify-center relative">
                      <div className="w-2.5 h-2.5 rounded bg-black/50 absolute top-0.5 left-0.5 flex items-center justify-center">
                        <span className="w-1 h-1 rounded-full bg-slate-500" />
                      </div>
                      <span className="text-[9px] font-extrabold text-amber-300/80 mt-1.5">?</span>
                    </div>
                    <span className="text-[8px] font-mono text-slate-300 uppercase truncate max-w-[48px]">
                      {activeLot.resolved && activeLot.wonByPlayer ? d.model : d.tier}
                    </span>
                  </div>
                ))}
                {/* Mystery Boxes visual inside the crate */}
                {Array.from({ length: activeLot.mysteryBoxCount ?? 1 }).map((_, mIdx) => (
                  <div key={`mb-${mIdx}`} className="flex flex-col items-center gap-0.5 min-w-0">
                    <div className="w-7 h-9 [@media(min-height:540px)]:w-9 [@media(min-height:540px)]:h-12 rounded-lg border border-fuchsia-400/50 bg-fuchsia-500/15 flex flex-col items-center justify-center relative">
                      <Gift className="w-3.5 h-3.5 text-fuchsia-300" />
                      <span className="text-[7.5px] font-mono font-extrabold text-amber-300">
                        ???
                      </span>
                    </div>
                    <span className="text-[8px] font-mono text-fuchsia-300 font-bold uppercase truncate max-w-[48px]">
                      {bi('KUTU', 'BOX')} #{mIdx + 1}
                    </span>
                  </div>
                ))}
              </div>

              <div className="sm:col-span-5 rounded-xl border border-white/8 bg-[#0E141D] p-1.5 [@media(min-height:560px)]:p-2 flex flex-col justify-between text-[9.5px] tabular-nums overflow-hidden">
                <div className="font-bold text-slate-200 flex items-center justify-between gap-1">
                  <span className="inline-flex items-center gap-1 truncate">
                    <Package className="w-3 h-3 text-amber-400 shrink-0" />
                    {bi('Koli + Kutu', 'Crate + Box')}
                  </span>
                  <span className="font-mono text-[9px] text-fuchsia-300 shrink-0">
                    ×{activeLot.mysteryBoxCount ?? 1}
                  </span>
                </div>
                <div className="text-slate-300 space-y-0.5 overflow-hidden">
                  {activeLot.bonusAccessories.slice(0, 2).map((ba) => {
                    const accLoc = getLocalizedAccessory(ba.id, lang);
                    return (
                      <div key={ba.id} className="flex justify-between text-[9px]">
                        <span className="truncate text-slate-400">{accLoc.name}</span>
                        <span className="font-mono font-bold text-amber-300 shrink-0">×{ba.quantity}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between border-t border-white/8 pt-0.5 text-[9.5px]">
                  <span className="text-slate-400 truncate">{bi('Olası Kâr', 'Upside')}</span>
                  <span
                    className={`font-mono font-extrabold shrink-0 ${
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
            <div className="flex-1 min-h-0 rounded-xl border border-white/8 bg-[#0E141D] p-1.5 [@media(min-height:560px)]:p-2.5 flex flex-col justify-between overflow-hidden">
              {auctionLog.length > 0 ? (
                <div className="space-y-1 overflow-hidden">
                  <div className="flex items-center justify-between text-[9.5px] text-slate-400 border-b border-white/6 pb-0.5">
                    <span className="font-bold text-amber-300">
                      {bi('CANLI PEY', 'LIVE BID')} · {bi('Tur', 'Rd')} {auctionRound}/6
                    </span>
                    <span className="truncate">
                      {bi('Önde', 'Leader')}: <strong className="text-slate-100">{highestBidder}</strong>
                    </span>
                  </div>
                  {auctionLog.slice(-3).map((line, i, arr) => (
                    <div
                      key={i}
                      className={`text-[10px] [@media(min-height:560px)]:text-[11px] leading-tight line-clamp-1 [@media(min-height:540px)]:line-clamp-2 ${
                        i === arr.length - 1
                          ? 'text-amber-200 font-semibold'
                          : 'text-slate-400'
                      }`}
                    >
                      • {line}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 min-h-0 flex flex-col justify-between gap-1 overflow-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                    {AUCTION_RIVALS.slice(0, 3).map((r) => (
                      <div
                        key={r.name}
                        className="rounded-lg border border-white/6 bg-[#141C27] p-1.5 text-[9.5px] overflow-hidden"
                      >
                        <div className="font-bold text-slate-100 truncate">{r.name}</div>
                        <div className="text-slate-400 truncate">{r.style}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-2 text-[9.5px] [@media(min-height:560px)]:text-[10.5px] text-slate-300 border-t border-white/6 pt-1">
                    <span className="inline-flex items-center gap-1 text-slate-300 truncate">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">
                        {bi(
                          'Gizemli kutulardan sürpriz telefon, nakit çek veya aksesuar çıkar!',
                          'Mystery boxes hide bonus phones, cash, or accessories!'
                        )}
                      </span>
                    </span>
                    <span className="font-mono text-[9.5px] text-amber-300 shrink-0 tabular-nums">
                      {lotReqCash > 0
                        ? bi(`Eşik: ${formatTRY(lotReqCash)}`, `Gate: ${formatTRY(lotReqCash)}`)
                        : bi('Açık Giriş', 'Open')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="shrink-0">
              {activeLot.resolved ? (
                <div className="rounded-lg bg-white/5 py-1.5 text-center text-[11px] font-bold text-slate-300 truncate px-2">
                  {activeLot.wonByPlayer
                    ? bi(
                        `Bu ihaleyi ${formatTRY(activeLot.winningBid)} ile kazandın!`,
                        `Won for ${formatTRY(activeLot.winningBid)}!`
                      )
                    : bi('Bu ihale kapandı; diğer seanslara geç.', 'Lot closed — try another session.')}
                </div>
              ) : lotCashLocked ? (
                <div className="rounded-lg border border-amber-400/25 bg-amber-500/10 py-1.5 px-2.5 flex items-center justify-between gap-2 text-[11px] tabular-nums">
                  <span className="inline-flex items-center gap-1.5 font-bold text-amber-200 truncate">
                    <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">
                      {bi(
                        `En az ${formatTRY(lotReqCash)} nakit birikmeli!`,
                        `Need at least ${formatTRY(lotReqCash)} cash!`
                      )}
                    </span>
                  </span>
                  <span className="font-mono text-[10px] text-slate-300 shrink-0">
                    {formatTRY(shop.cash)} / {formatTRY(lotReqCash)}
                  </span>
                </div>
              ) : !auctionActive ? (
                <button
                  type="button"
                  disabled={shop.cash < activeLot.startingBid}
                  onClick={startAuction}
                  className="w-full rounded-lg bg-amber-500 py-1.5 [@media(min-height:560px)]:py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-40 cursor-pointer tabular-nums"
                >
                  {shop.cash < activeLot.startingBid
                    ? bi(`Yetersiz Nakit (${formatTRY(activeLot.startingBid)} Gerekli)`, `Need ${formatTRY(activeLot.startingBid)}`)
                    : bi(
                        `İhaleye Katıl (${formatTRY(activeLot.startingBid)})`,
                        `Enter Auction (${formatTRY(activeLot.startingBid)})`
                      )}
                </button>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 tabular-nums">
                  {bidSteps.map((step, idx) => (
                    <button
                      key={step}
                      type="button"
                      disabled={shop.cash < currentBid + step}
                      onClick={() => placePlayerBid(step)}
                      className={`rounded-lg py-1.5 [@media(min-height:560px)]:py-2 text-[10.5px] font-extrabold cursor-pointer disabled:opacity-35 ${
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
                    className="rounded-lg bg-rose-500/20 border border-rose-400/35 py-1.5 [@media(min-height:560px)]:py-2 text-[10.5px] font-bold text-rose-200 hover:bg-rose-500/30 cursor-pointer"
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

      {/* SUB-TAB 3: BRANCHES & RIVAL (3x2 SYMMETRICAL GRID — STRICT ZERO SCROLL) */}
      {subTab === 'BRANCHES' && (
        <div className="h-full flex-1 min-h-0 flex flex-col gap-1.5 [@media(min-height:560px)]:gap-2 overflow-hidden">
          {/* Compact Rival Strip */}
          <div className="shrink-0 flex flex-wrap sm:flex-nowrap items-center justify-between gap-1.5 sm:gap-2 rounded-xl border border-white/10 bg-[#151D28] px-2.5 py-1 [@media(min-height:560px)]:px-3 [@media(min-height:560px)]:py-1.5 overflow-hidden">
            <div className="flex items-center gap-1.5 min-w-0">
              <Store className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="text-[11px] font-bold text-slate-100 truncate">
                {shop.rival.name}
              </span>
              <span className="text-[10px] text-slate-400 tabular-nums truncate">
                {shop.rival.boughtOut
                  ? bi('✓ Devralındı · %100 Hakim', '✓ Acquired · 100% Share')
                  : bi(`Rakip %${shop.rival.marketShare} · Sen %${100 - shop.rival.marketShare}`, `Rival ${shop.rival.marketShare}% · You ${100 - shop.rival.marketShare}%`)}
              </span>
              {!shop.rival.boughtOut && (
                <div className="w-20 h-1.5 rounded-full bg-emerald-500/30 overflow-hidden hidden md:block shrink-0">
                  <div
                    className="h-full bg-rose-500"
                    style={{ width: `${shop.rival.marketShare}%` }}
                  />
                </div>
              )}
            </div>

            {!shop.rival.boughtOut && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={shop.rival.promoUsedToday || shop.cash < 4500}
                  onClick={onRunRivalPromo}
                  className="inline-flex items-center gap-1 rounded-lg bg-amber-500/15 border border-amber-400/35 px-2 py-0.5 [@media(min-height:560px)]:py-1 text-[10px] font-bold text-amber-200 hover:bg-amber-500/25 disabled:opacity-35 cursor-pointer whitespace-nowrap"
                >
                  <Megaphone className="w-3 h-3" />
                  {bi('Reklam (4.500 ₺)', 'Promo (4.5k)')}
                </button>
                <button
                  type="button"
                  disabled={shop.cash < shop.rival.buyoutCost}
                  onClick={onBuyoutRival}
                  className="rounded-lg bg-rose-500/20 border border-rose-400/40 px-2 py-0.5 [@media(min-height:560px)]:py-1 text-[10px] font-bold text-rose-200 hover:bg-rose-500/30 disabled:opacity-35 cursor-pointer whitespace-nowrap tabular-nums"
                >
                  {bi('Devral', 'Buyout')} ({formatTRY(shop.rival.buyoutCost)})
                </button>
              </div>
            )}
          </div>

          {/* 5 Branches + 6th Empire Portfolio Card = Responsive Stack on Portrait, 3x2 Zero-Scroll Grid on Landscape/Desktop */}
          <div className="h-full flex-1 min-h-0 grid grid-cols-3 grid-rows-2 gap-1.5 [@media(min-height:560px)]:gap-2 overflow-hidden">
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
                  className={`rounded-xl border p-1.5 [@media(min-height:560px)]:p-2.5 flex flex-col justify-between gap-1 min-h-0 overflow-hidden ${
                    owned
                      ? 'border-emerald-400/30 bg-[#13221D]'
                      : 'border-white/10 bg-[#151D28]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 min-w-0">
                    <div className="min-w-0">
                      <div className="text-[11px] [@media(min-height:560px)]:text-xs font-extrabold text-slate-100 truncate">
                        {b.name}
                      </div>
                      <div className="text-[9px] text-amber-300/90 truncate">
                        {b.district} · +{b.prestigeBonus}P
                      </div>
                    </div>
                    <span className="font-mono text-[10px] [@media(min-height:560px)]:text-[11px] font-extrabold text-emerald-400 shrink-0 tabular-nums">
                      +{formatTRY(b.dailyNetIncome)}/{bi('g', 'd')}
                    </span>
                  </div>

                  <p className="hidden [@media(min-height:560px)]:block text-[9.5px] text-slate-300 line-clamp-2 leading-tight">
                    {b.description}
                  </p>

                  {/* Rich Financial Metrics Strip */}
                  <div className="rounded-lg border border-white/8 bg-[#0E141D] px-1.5 py-1 grid grid-cols-2 gap-x-1.5 gap-y-0.5 text-[9px] tabular-nums">
                    <div className="text-slate-400 truncate">
                      {bi('Amorti', 'ROI')}:{' '}
                      <strong className="font-mono text-slate-100">~{roiDays}{bi('g', 'd')}</strong>
                    </div>
                    <div className="text-slate-400 text-right truncate">
                      {bi('Çevrimdışı', 'Off')}:{' '}
                      <strong className="font-mono text-sky-300">+{formatTRY(b.offlineHourlyRate)}/s</strong>
                    </div>
                    <div className="text-slate-400 truncate">
                      {bi('Süre', 'Build')}:{' '}
                      <strong className="font-mono text-slate-200">{b.buildDays}{bi('g', 'd')}</strong>
                    </div>
                    <div className="text-slate-400 text-right truncate">
                      {bi('İtibar', 'Rep')}:{' '}
                      <strong className={meetsRep ? 'text-emerald-400' : 'text-amber-300'}>
                        {b.minReputation.toFixed(1)}★
                      </strong>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {owned ? (
                      <div className="w-full rounded-lg bg-emerald-500/15 py-1 text-center text-[9.5px] font-bold text-emerald-300 truncate">
                        ✓ {bi('Aktif Şube', 'Active Branch')}
                      </div>
                    ) : pending ? (
                      <div className="w-full rounded-lg bg-sky-500/15 py-1 text-center text-[9.5px] font-bold text-sky-300 truncate">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {bi(`İnşaatta (${pending.daysRemaining}g)`, `Building (${pending.daysRemaining}d)`)}
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={!canBuy}
                        onClick={() => onUnlockBranch(b.id)}
                        className="w-full rounded-lg bg-amber-500 py-1 [@media(min-height:560px)]:py-1.5 text-[10px] font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-35 cursor-pointer tabular-nums truncate px-1"
                      >
                        {!meetsRep
                          ? bi(`${b.minReputation.toFixed(1)}★ Gerekli`, `Need ${b.minReputation.toFixed(1)}★`)
                          : bi(`Aç · ${formatTRY(b.unlockCost)}`, `Open · ${formatTRY(b.unlockCost)}`)}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* 6th Card: Empire Passive Cashflow Summary */}
            <div className="rounded-xl border border-amber-400/25 bg-[#161D2A] p-1.5 [@media(min-height:560px)]:p-2.5 flex flex-col justify-between gap-1 min-h-0 overflow-hidden">
              <div className="flex items-center justify-between gap-1">
                <div className="text-[11px] [@media(min-height:560px)]:text-xs font-extrabold text-amber-300 flex items-center gap-1 truncate">
                  <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{bi('Şube Ağı', 'Branch Net')}</span>
                </div>
                <span className="font-mono text-[10px] font-bold text-slate-300 shrink-0">
                  {shop.branches.length}/{CITY_BRANCHES.length}
                </span>
              </div>

              <div className="rounded-lg border border-white/8 bg-[#0E141D] p-1.5 space-y-0.5 text-[9.5px] [@media(min-height:560px)]:text-[10.5px] tabular-nums">
                <div className="flex justify-between gap-1">
                  <span className="text-slate-400 truncate">{bi('Günlük Gelir', 'Daily Income')}</span>
                  <span className="font-mono font-extrabold text-emerald-400 shrink-0">
                    +{formatTRY(totalBranchDailyIncome)}
                  </span>
                </div>
                <div className="flex justify-between gap-1">
                  <span className="text-slate-400 truncate">{bi('Çevrimdışı', 'Offline')}</span>
                  <span className="font-mono font-bold text-sky-300 shrink-0">
                    +{formatTRY(totalBranchOfflineHourly)}/s
                  </span>
                </div>
                <div className="flex justify-between gap-1">
                  <span className="text-slate-400 truncate">{bi('Pazar Payı', 'Share')}</span>
                  <span className="font-mono font-bold text-amber-300 shrink-0">
                    %{shop.rival.boughtOut ? 100 : 100 - shop.rival.marketShare}
                  </span>
                </div>
              </div>

              {(() => {
                const passive2xActiveToday =
                  (shop.adState?.passiveIncome2xDay ?? 0) === shop.day;
                const totalDailyPassive =
                  totalBranchDailyIncome +
                  totalMuseumDaily +
                  (shop.rival.boughtOut ? 3500 : 0);
                return onActivatePassive2xAd ? (
                  passive2xActiveToday ? (
                    <div className="rounded-lg border border-emerald-400/40 bg-emerald-500/15 px-2 py-1 text-center text-[9.5px] font-extrabold text-emerald-300 flex items-center justify-center gap-1 truncate">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span className="truncate">
                        {bi(`Gün ${shop.day} 2x Aktif!`, `Day ${shop.day} 2x Active!`)}
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={totalDailyPassive <= 0}
                      onClick={onActivatePassive2xAd}
                      className="w-full inline-flex items-center justify-center gap-1 rounded-lg bg-amber-500 px-2 py-1 [@media(min-height:560px)]:py-1.5 text-[9.5px] font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-40 cursor-pointer tabular-nums truncate"
                    >
                      <PlayCircle className="w-3 h-3 shrink-0" />
                      <span className="truncate">
                        {totalDailyPassive > 0
                          ? bi(`Pasif 2x (+${formatTRY(totalDailyPassive)})`, `2x Passive (+${formatTRY(totalDailyPassive)})`)
                          : bi('Önce şube aç', 'Unlock branch')}
                      </span>
                    </button>
                  )
                ) : (
                  <p className="text-[9.5px] text-slate-400 leading-tight line-clamp-2">
                    {bi(
                      'Şubeler her gün sonu net nakit ve çevrimdışı gelir üretir.',
                      'Branches pay daily net cash and offline income.'
                    )}
                  </p>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: BANK LOANS & TAX */}
      {subTab === 'FINANCE' && (
        <div className="h-full flex-1 min-h-0 grid grid-cols-12 gap-1.5 [@media(min-height:560px)]:gap-2 overflow-hidden">
          {/* Left: Tax & Active Loans */}
          <div className="h-full col-span-5 flex flex-col gap-1.5 [@media(min-height:560px)]:gap-2 min-h-0 overflow-hidden">
            <div className="shrink-0 rounded-xl border border-white/10 bg-[#151D28] p-2 [@media(min-height:560px)]:p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] [@media(min-height:560px)]:text-xs font-extrabold text-slate-100 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  {bi('Vergi & Muhasebe', 'Tax & Accounting')}
                </span>
                <span className="font-mono text-[10.5px] font-bold text-amber-300">
                  {bi('KDV', 'VAT')}: %{taxPct}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-[#0E141D] border border-white/8 px-2 py-1.5 tabular-nums">
                <div>
                  <div className="text-[9.5px] text-slate-400">
                    {bi('Ödenecek Vergi', 'Weekly Tax')}
                  </div>
                  <div className="font-mono text-xs [@media(min-height:560px)]:text-sm font-extrabold text-emerald-400">
                    {formatTRY(shop.weeklyTaxDue)}
                  </div>
                </div>
                {shop.weeklyTaxDue > 0 ? (
                  <button
                    type="button"
                    disabled={shop.cash < shop.weeklyTaxDue}
                    onClick={onPayWeeklyTax}
                    className="rounded-lg bg-emerald-500 px-2.5 py-1 text-[10px] font-extrabold text-slate-950 hover:bg-emerald-400 disabled:opacity-35 cursor-pointer"
                  >
                    {bi('Öde', 'Pay Tax')}
                  </button>
                ) : (
                  <span className="text-[10.5px] font-bold text-emerald-400">
                    ✓ {bi('Borç Yok', 'Clear')}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={onGoToStaff}
                className="w-full rounded-lg bg-[#0E141D] border border-sky-400/25 px-2 py-1 text-[9.5px] text-sky-300 hover:bg-sky-500/10 flex items-center justify-between cursor-pointer text-left"
              >
                <span className="truncate">
                  {shop.staff.includes('accountant')
                    ? bi('Mali Müşavir Selma aktif — vergi/faiz optimize.', 'CPA Selma active — tax & APR optimized.')
                    : bi('Mali Müşavir Selma ile KDV’yi %6’ya düşür →', 'Hire CPA Selma to cut VAT to 6% →')}
                </span>
              </button>
            </div>

            <div className="h-full flex-1 min-h-0 rounded-xl border border-white/10 bg-[#151D28] p-2 [@media(min-height:560px)]:p-2.5 flex flex-col gap-1.5 overflow-hidden">
              <div className="shrink-0 text-[11px] [@media(min-height:560px)]:text-xs font-extrabold text-slate-100 flex items-center justify-between gap-1">
                <span>
                  {bi('Aktif Krediler', 'Active Loans')} ({shop.activeLoans.length}/2)
                </span>
                <div className="flex items-center gap-1">
                  {(shop.debtFreePrestigeBonus ?? 0) > 0 && (
                    <span className="rounded border border-emerald-400/40 bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[9px] font-extrabold text-emerald-300">
                      +{shop.debtFreePrestigeBonus}P
                    </span>
                  )}
                  <span className="font-mono text-[9.5px] text-slate-400">
                    {bi(`Dük. ${shop.shopTier}/6`, `T${shop.shopTier}/6`)}
                  </span>
                </div>
              </div>
              {shop.activeLoans.length === 0 ? (
                <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center gap-1 px-2 overflow-hidden">
                  <Landmark className="w-5 h-5 [@media(min-height:540px)]:w-7 [@media(min-height:540px)]:h-7 text-emerald-400/75 shrink-0" />
                  <div className="text-[11px] font-semibold text-slate-200">
                    {(shop.loansPaidOffCount ?? 0) > 0
                      ? bi(
                          `Borç Sıfır! (${shop.loansPaidOffCount} kapatıldı)`,
                          `Debt Free! (${shop.loansPaidOffCount} cleared)`
                        )
                      : bi('Aktif kredi borcun yok.', 'No active bank loans.')}
                  </div>
                  <p className="hidden [@media(min-height:480px)]:block text-[9.5px] text-slate-400 line-clamp-2">
                    {bi(
                      'Her kapatılan kredi kalıcı prestij bonusu (+4/+8) kazandırır.',
                      'Cleared loans grant permanent shop prestige (+4/+8).'
                    )}
                  </p>
                </div>
              ) : (
                <div className="h-full flex-1 min-h-0 grid grid-rows-2 gap-1.5 overflow-hidden">
                  {shop.activeLoans.slice(0, 2).map((ln) => (
                    <div
                      key={ln.id}
                      className="min-h-0 rounded-lg bg-[#0E141D] border border-white/8 p-1.5 [@media(min-height:560px)]:p-2.5 text-[10.5px] tabular-nums flex flex-col justify-center gap-1 overflow-hidden"
                    >
                      <div className="flex justify-between font-bold text-slate-100 gap-1">
                        <span className="truncate">{ln.name}</span>
                        <span className="font-mono text-rose-300 shrink-0">
                          {formatTRY(ln.remainingBalance)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[9.5px] text-slate-400 gap-1">
                        <span className="truncate">
                          {bi('Günlük', 'Daily')}: {formatTRY(ln.dailyPayment)} · {ln.daysLeft}{bi('g', 'd')}
                        </span>
                        <button
                          type="button"
                          disabled={shop.cash < ln.remainingBalance}
                          onClick={() => onRepayLoanEarly(ln.id)}
                          className="rounded bg-emerald-500/15 border border-emerald-400/35 px-2 py-0.5 text-[9px] font-bold text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-35 cursor-pointer shrink-0"
                        >
                          {bi('Kapat', 'Pay Off')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: 6 Bank Loan Offers */}
          <div className="h-full col-span-7 grid grid-cols-3 grid-rows-2 gap-1.5 [@media(min-height:560px)]:gap-2 min-h-0 overflow-hidden">
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
                  className={`rounded-xl border p-1.5 [@media(min-height:560px)]:p-2.5 flex flex-col justify-between gap-1 min-h-0 overflow-hidden ${
                    unlocked
                      ? 'border-white/10 bg-[#151D28]'
                      : 'border-white/5 bg-[#121821]/85'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-[10.5px] font-extrabold text-slate-100 leading-tight truncate">
                      {ln.name}
                    </div>
                    <div className="font-mono text-xs [@media(min-height:560px)]:text-sm font-extrabold text-emerald-400 tabular-nums">
                      {formatTRY(terms.effectivePrincipal)}
                    </div>
                  </div>

                  <p className="hidden [@media(min-height:580px)]:block text-[9.5px] text-slate-400 line-clamp-2 leading-tight">
                    {ln.description}
                  </p>

                  {/* Structured Financial Breakdown */}
                  <div className="rounded-lg border border-white/8 bg-[#0E141D] p-1 [@media(min-height:560px)]:p-1.5 space-y-0.5 text-[9px] tabular-nums">
                    <div className="flex justify-between gap-1">
                      <span className="text-slate-400 truncate">{bi('Faiz', 'APR')}</span>
                      <span className="font-mono text-amber-300 shrink-0">
                        %{Math.round(terms.effectiveRate * 100)} · {ln.termDays}{bi('g', 'd')}
                      </span>
                    </div>
                    <div className="flex justify-between gap-1">
                      <span className="text-slate-400 truncate">{bi('Toplam', 'Total')}</span>
                      <span className="font-mono text-slate-200 shrink-0">{formatTRY(terms.totalRepay)}</span>
                    </div>
                    <div className="flex justify-between gap-1">
                      <span className="text-slate-400 truncate">{bi('Taksit', 'Daily')}</span>
                      <span className="font-mono font-bold text-rose-300 shrink-0">
                        {formatTRY(terms.dailyPayment)}/{bi('g', 'd')}
                      </span>
                    </div>
                    <div className="hidden [@media(min-height:540px)]:flex justify-between text-[8.5px] text-slate-500">
                      <span>{bi('Faiz Maliyeti', 'Interest')}</span>
                      <span className="font-mono">+{formatTRY(interestCost)}</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {unlocked ? (
                      <button
                        type="button"
                        disabled={!canTake}
                        onClick={() => onTakeLoan(raw)}
                        className="w-full rounded-lg bg-amber-500 py-1 [@media(min-height:560px)]:py-1.5 text-[10px] font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-35 cursor-pointer"
                      >
                        {shop.activeLoans.length >= 2
                          ? bi('Limit (2/2)', 'Max 2')
                          : bi('Kredi Çek', 'Take Loan')}
                      </button>
                    ) : (
                      <div className="w-full rounded-lg bg-white/5 py-1 px-1 text-center text-[9.5px] font-bold text-amber-300/90 inline-flex items-center justify-center gap-1 truncate">
                        <Lock className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">
                          {bi(`${ln.minShopTier}. Dükkan`, `Tier ${ln.minShopTier}`)} ({tierInfo.name.split(' ')[0]})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: NOSTALGIA MUSEUM (5-COL STRICT ZERO SCROLL) */}
      {subTab === 'MUSEUM' && (
        <div className="h-full flex-1 min-h-0 flex flex-col gap-1.5 [@media(min-height:560px)]:gap-2 overflow-hidden">
          {/* Museum Collection Header Bar */}
          <div className="shrink-0 flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#151D28] px-2.5 py-1 [@media(min-height:560px)]:px-3 [@media(min-height:560px)]:py-1.5 text-[10.5px] tabular-nums">
            <div className="flex items-center gap-1.5 min-w-0">
              <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-extrabold text-slate-100 truncate">
                {bi('GSM Nostalji & Efsaneler Müzesi', 'GSM Nostalgia & Legends Museum')}
              </span>
              <span className="text-slate-400 whitespace-nowrap shrink-0">
                · {shop.museumItems.length}/5
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] shrink-0">
              <span className="text-amber-300 font-bold whitespace-nowrap">
                +{totalMuseumPrestige}P
              </span>
              <span className="text-emerald-400 font-bold whitespace-nowrap">
                +{formatTRY(totalMuseumDaily)}/{bi('g', 'd')}
              </span>
            </div>
          </div>

          {/* 5 Museum Cards — 5-Col Zero Scroll */}
          <div className="h-full flex-1 min-h-0 grid grid-cols-5 gap-1.5 [@media(min-height:560px)]:gap-2 overflow-hidden">
            {MUSEUM_ITEMS.map((raw) => {
              const item = getLocalizedMuseumItem(raw.id, lang);
              const owned = shop.museumItems.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setJustBoughtMuseumId(null);
                    setSelectedMuseumId(item.id);
                  }}
                  className={`rounded-xl border p-1.5 [@media(min-height:560px)]:p-2.5 flex flex-col justify-between gap-1 min-h-0 overflow-hidden cursor-pointer transition-colors ${
                    owned
                      ? 'border-amber-400/45 bg-[#1C1A14] hover:border-amber-300'
                      : 'border-white/10 bg-[#151D28] hover:border-amber-400/40'
                  }`}
                >
                  {/* Top Title & Era */}
                  <div className="shrink-0">
                    <div
                      className="text-[9px] font-mono font-bold truncate"
                      style={{ color: item.accentColor }}
                    >
                      {item.year} · {item.rarityLabel}
                    </div>
                    <div className="text-[10.5px] [@media(min-height:560px)]:text-[11px] font-extrabold text-slate-100 leading-tight truncate">
                      {item.name}
                    </div>
                  </div>

                  {/* Center Museum Pedestal Stage */}
                  <div className="shrink-0 rounded-xl border border-white/8 bg-[#0D131C] py-1 px-1.5 flex flex-col items-center justify-center gap-0.5">
                    <MuseumPhoneArt id={item.id} className="w-8 h-11 [@media(min-height:540px)]:w-12 [@media(min-height:540px)]:h-16" />
                    <div className="text-[8.5px] [@media(min-height:560px)]:text-[9.5px] font-mono text-emerald-400 font-bold tabular-nums truncate max-w-full">
                      +{formatTRY(item.dailyPassiveCash)}/{bi('g', 'd')} · +{item.prestigeBonus}P
                    </div>
                  </div>

                  {/* Compact "Hikaye" Box inside Card */}
                  <div className="flex-1 min-h-0 rounded-lg border border-amber-400/15 bg-[#0E141D] p-1.5 flex flex-col justify-between gap-0.5 overflow-hidden">
                    <div className="min-h-0 overflow-hidden">
                      <div className="hidden [@media(min-height:500px)]:inline-flex items-center gap-1 text-[8.5px] font-extrabold uppercase tracking-wider text-amber-400">
                        <BookOpen className="w-2.5 h-2.5" />
                        {bi('Hikaye', 'Story')}
                      </div>
                      <p className="text-[9px] [@media(min-height:560px)]:text-[9.5px] text-slate-300 leading-tight line-clamp-2 [@media(min-height:540px)]:line-clamp-3">
                        {item.story}
                      </p>
                    </div>
                    <span className="shrink-0 text-[9px] font-bold text-amber-300 truncate">
                      {bi('Detayı Gör →', 'Read →')}
                    </span>
                  </div>

                  {/* Buy / Displayed Footer */}
                  <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    {owned ? (
                      <button
                        type="button"
                        onClick={() => {
                          setJustBoughtMuseumId(null);
                          setSelectedMuseumId(item.id);
                        }}
                        className="w-full rounded-lg bg-amber-500/20 hover:bg-amber-500/30 py-1 text-center text-[9.5px] font-extrabold text-amber-300 inline-flex items-center justify-center gap-1 cursor-pointer truncate px-1"
                      >
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        <span className="truncate">{bi('Hikaye', 'Story')}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={shop.cash < item.cost}
                        onClick={() => {
                          onBuyMuseumItem(item.id);
                          setJustBoughtMuseumId(item.id);
                          setSelectedMuseumId(item.id);
                        }}
                        className="w-full rounded-lg bg-amber-500 py-1 [@media(min-height:560px)]:py-1.5 text-[10px] font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-35 cursor-pointer tabular-nums"
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

      {/* SUB-TAB 6: PAZAR GÜNÜ ESNAF KERMESİ (STRICT ZERO SCROLL + PAGINATED CLEARANCE) */}
      {subTab === 'KERMES' && (
        !kermesOpen || !kermes ? (
          <div className="h-full flex-1 min-h-0 rounded-2xl border border-amber-400/30 bg-[#151D28] flex flex-col items-center justify-center text-center p-2.5 [@media(min-height:560px)]:p-4 gap-1.5 [@media(min-height:560px)]:gap-2.5 overflow-hidden">
            <div className="w-8 h-8 [@media(min-height:560px)]:w-10 [@media(min-height:560px)]:h-10 rounded-xl border border-amber-400/40 bg-amber-500/15 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 [@media(min-height:560px)]:w-5 [@media(min-height:560px)]:h-5 text-amber-400" />
            </div>
            <div className="space-y-0.5 max-w-xl">
              <div className="text-[9px] font-mono font-bold text-amber-300 uppercase tracking-wider">
                {bi(
                  `BUGÜN ${weekday.nameTr.toUpperCase()} (GÜN ${shop.day}) · PAZAR GÜNÜ AÇILIR`,
                  `TODAY IS ${weekday.nameEn.toUpperCase()} (DAY ${shop.day}) · OPENS EVERY SUNDAY`
                )}
              </div>
              <h3 className="font-display text-xs [@media(min-height:560px)]:text-sm font-extrabold text-slate-50">
                {bi(
                  `Esnaf Kermesi’ne ${weekday.daysUntilSunday} Gün Kaldı (Gün ${weekday.nextSundayDay} · Pazar)`,
                  `Sunday Merchants Fair Opens in ${weekday.daysUntilSunday} Day(s) (Day ${weekday.nextSundayDay} · Sun)`
                )}
              </h3>
              <p className="text-[10px] [@media(min-height:560px)]:text-[11px] text-slate-300 leading-snug line-clamp-2 [@media(min-height:540px)]:line-clamp-none">
                {bi(
                  'Her Pazar günü pasaj meydanında kurulan Esnaf Kermesi’nde elinde bekleyen tüm telefonları beklemeden anında nakde çevirebilir, tamir parçalarını yarı fiyatına toplayabilirsin!',
                  'Every Sunday the Arcade Merchants Fair opens! Instantly liquidate sitting inventory for cash and snatch rare repair parts & bargain phones at up to 60% off!'
                )}
              </p>
            </div>

            <div className="hidden [@media(min-height:430px)]:grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl w-full text-left">
              <div className="rounded-xl border border-emerald-400/25 bg-[#0E141D] p-2 [@media(min-height:540px)]:p-3 space-y-0.5">
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-300">
                  <Store className="w-3.5 h-3.5 shrink-0" />
                  {bi('1. Hızlı Elden Çıkarma', '1. Instant Clearance')}
                </div>
                <p className="text-[10px] text-slate-400 leading-tight line-clamp-2">
                  {bi(
                    'Stokta kalan cihazları Pazar kalabalığına %92–%108 oranla beklemeden anında sat!',
                    'Sell slow or faulty devices instantly to the Sunday crowd at 92%–108% fair value!'
                  )}
                </p>
              </div>
              <div className="rounded-xl border border-amber-400/25 bg-[#0E141D] p-2 [@media(min-height:540px)]:p-3 space-y-0.5">
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-amber-300">
                  <Wrench className="w-3.5 h-3.5 shrink-0" />
                  {bi('2. Yarı Fiyatına Parça & Kelepir', '2. Half-Price Parts & Steals')}
                </div>
                <p className="text-[10px] text-slate-400 leading-tight line-clamp-2">
                  {bi(
                    'Her Pazar yenilenen 4 sandık: %50–%62 indirimli OLED, OEM pil ve sürpriz cihazlar!',
                    '4 freshly randomized crates every Sunday: 50%–62% off OLED, batteries & bargain phones!'
                  )}
                </p>
              </div>
            </div>

            <div className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0E141D] px-2.5 py-1 text-[10.5px] text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                {bi(
                  `Sonraki Kermes: Gün ${weekday.nextSundayDay} (Her 7. Gün Pazar)`,
                  `Next Fair: Day ${weekday.nextSundayDay} (Every 7th Day)`
                )}
              </span>
            </div>
          </div>
        ) : (() => {
          const kermesAvailable = shop.inventory.filter((p) => !p.assignedToStaff);
          const KERMES_PER_PAGE = 3;
          const totalKermesPages = Math.max(1, Math.ceil(kermesAvailable.length / KERMES_PER_PAGE));
          const safeKermesPage = Math.min(kermesPage, totalKermesPages - 1);
          const visibleKermesPhones = kermesAvailable.slice(
            safeKermesPage * KERMES_PER_PAGE,
            safeKermesPage * KERMES_PER_PAGE + KERMES_PER_PAGE
          );

          return (
          <div className="h-full flex-1 min-h-0 flex flex-col gap-1.5 [@media(min-height:560px)]:gap-2 overflow-hidden">
            {/* FESTIVE SUNDAY KERMES HEADER */}
            <div className="shrink-0 rounded-xl border border-emerald-400/40 bg-gradient-to-r from-emerald-950/80 via-[#151D28] to-amber-950/60 px-2.5 py-1 [@media(min-height:560px)]:px-3 [@media(min-height:560px)]:py-1.5 flex items-center justify-between gap-2 overflow-hidden">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[9px] font-mono font-extrabold text-emerald-300 uppercase tracking-wider truncate">
                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>
                    {bi(`PAZAR ÖZEL · GÜN ${shop.day}`, `SUNDAY SPECIAL · DAY ${shop.day}`)}
                  </span>
                  <span>·</span>
                  <span className="text-amber-300 truncate">
                    {lang === 'en' ? kermes.enCrowdBuzzLabel : kermes.crowdBuzzLabel}
                  </span>
                </div>
                <div className="font-display text-[11px] [@media(min-height:560px)]:text-xs font-extrabold text-slate-50 truncate">
                  {lang === 'en' ? kermes.enHeadline : kermes.headline}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 tabular-nums">
                <div className="rounded-lg border border-emerald-400/35 bg-[#0D1614] px-2 py-0.5 text-right">
                  <div className="text-[8.5px] text-slate-400 uppercase font-bold">
                    {bi('Alım Oranı', 'Rate')}
                  </div>
                  <div className="font-mono text-[10.5px] font-extrabold text-emerald-400">
                    %{Math.round(kermes.clearanceMultiplier * 100)}
                  </div>
                </div>
                <div className="rounded-lg border border-amber-400/35 bg-[#1B1710] px-2 py-0.5 text-right">
                  <div className="text-[8.5px] text-slate-400 uppercase font-bold">
                    {bi('Satılan', 'Sold')}
                  </div>
                  <div className="font-mono text-[10.5px] font-extrabold text-amber-300">
                    {kermes.clearanceSoldCount} {bi('Adet', 'U')}
                  </div>
                </div>
              </div>
            </div>

            {/* TWO-COLUMN KERMES WORKSPACE */}
            <div className="h-full flex-1 min-h-0 grid grid-cols-12 gap-1.5 [@media(min-height:560px)]:gap-2 overflow-hidden">
              {/* LEFT COLUMN (5 cols): INSTANT INVENTORY CLEARANCE STALL (3/PAGE PAGINATED) */}
              <div className="h-full col-span-5 min-h-0 rounded-xl border border-white/10 bg-[#151D28] p-1.5 [@media(min-height:560px)]:p-2 flex flex-col gap-1.5 overflow-hidden">
                <div className="shrink-0 flex items-center justify-between gap-1 border-b border-white/8 pb-1">
                  <div className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-300 min-w-0">
                    <Store className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{bi('Elden Çıkarma', 'Clearance')} ({kermesAvailable.length})</span>
                  </div>
                  {totalKermesPages > 1 && (
                    <div className="flex items-center gap-1 shrink-0 font-mono text-[9.5px]">
                      <button
                        type="button"
                        disabled={safeKermesPage === 0}
                        onClick={() => setKermesPage((p) => Math.max(0, p - 1))}
                        className="rounded border border-white/10 bg-[#0E141D] px-1 py-0.5 text-slate-200 disabled:opacity-30 cursor-pointer"
                        aria-label={bi('Önceki', 'Prev')}
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                      <span className="text-slate-300">
                        {safeKermesPage + 1}/{totalKermesPages}
                      </span>
                      <button
                        type="button"
                        disabled={safeKermesPage >= totalKermesPages - 1}
                        onClick={() => setKermesPage((p) => Math.min(totalKermesPages - 1, p + 1))}
                        className="rounded border border-white/10 bg-[#0E141D] px-1 py-0.5 text-slate-200 disabled:opacity-30 cursor-pointer"
                        aria-label={bi('Sonraki', 'Next')}
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {kermesAvailable.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-[11px] text-slate-400 px-2 gap-1 overflow-hidden">
                    <Package className="w-5 h-5 text-slate-500" />
                    <div>
                      {bi(
                        'Kermeste elden çıkaracak boşta cihazın kalmadı.',
                        'No available devices left in stock to liquidate.'
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex-1 min-h-0 grid grid-rows-3 gap-1 [@media(min-height:560px)]:gap-1.5 overflow-hidden">
                    {visibleKermesPhones.map((phone) => {
                      const fairVal = calculateMarketValue(
                        phone,
                        false,
                        shop.dailyNews,
                        shop.upgrades,
                        shop.day
                      );
                      const instantOffer = Math.max(
                        1000,
                        roundPrice(fairVal * kermes.clearanceMultiplier)
                      );
                      const netProfit =
                        instantOffer - (phone.purchasePrice + phone.repairSpend);

                      return (
                        <div
                          key={phone.uid}
                          className="min-h-0 rounded-lg border border-white/10 bg-[#0E141D] px-2 py-1 flex items-center justify-between gap-1.5 overflow-hidden"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <PhoneModelThumb device={phone} className="w-6 h-9 [@media(min-height:540px)]:w-7 [@media(min-height:540px)]:h-11 shrink-0" />
                            <div className="min-w-0">
                              <div className="text-[10.5px] font-extrabold text-slate-100 truncate">
                                {phone.brand} {phone.model}
                              </div>
                              <div className="text-[9px] text-slate-400 flex items-center gap-1 truncate">
                                <span>{phone.storage}</span>
                                <span>·</span>
                                <span
                                  className={
                                    phone.defects.length > 0
                                      ? 'text-rose-300 font-semibold'
                                      : 'text-emerald-300 font-semibold'
                                  }
                                >
                                  {phone.defects.length > 0
                                    ? bi(`${phone.defects.length} Kusur`, `${phone.defects.length} Def`)
                                    : bi('Temiz', 'Clean')}
                                </span>
                                {phone.isBrandNew && (
                                  <span className="text-sky-300 font-bold">
                                    {bi('Sıfır', 'New')}
                                  </span>
                                )}
                              </div>
                              <div
                                className={`text-[9px] font-mono font-bold tabular-nums ${
                                  netProfit >= 0 ? 'text-emerald-400' : 'text-amber-300'
                                }`}
                              >
                                {netProfit >= 0 ? '+' : ''}
                                {formatTRY(netProfit)} {bi('net', 'net')}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onKermesSellPhone(phone.uid)}
                            className="shrink-0 rounded-lg bg-emerald-500 px-2 py-1 text-[10px] font-extrabold text-slate-950 hover:bg-emerald-400 cursor-pointer tabular-nums whitespace-nowrap"
                          >
                            {bi('Sat', 'Sell')} · {formatTRY(instantOffer)}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN (7 cols): ULTRA-CHEAP RARE PARTS & SURPRISE BARGAINS */}
              <div className="h-full col-span-7 min-h-0 rounded-xl border border-amber-400/25 bg-[#151D28] p-1.5 [@media(min-height:560px)]:p-2 flex flex-col gap-1.5 overflow-hidden">
                <div className="shrink-0 flex items-center justify-between gap-2 border-b border-white/8 pb-1">
                  <div className="flex items-center gap-1 text-[10.5px] font-extrabold text-amber-300 min-w-0">
                    <Tag className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {bi(
                        'Pazar Nadir Parça & Kelepir Tezgâhı',
                        'Sunday Rare Parts & Bargain Booth'
                      )}
                    </span>
                  </div>
                  <span className="font-mono text-[9.5px] text-amber-200/80 shrink-0">
                    {kermes.deals.filter((d) => !d.bought).length}/{kermes.deals.length}{' '}
                    {bi('kaldı', 'left')}
                  </span>
                </div>

                <div className="h-full flex-1 min-h-0 grid grid-cols-2 grid-rows-2 gap-1.5 [@media(min-height:560px)]:gap-2 overflow-hidden">
                  {kermes.deals.map((deal) => {
                    const canAfford = shop.cash >= deal.kermesPrice;
                    return (
                      <div
                        key={deal.id}
                        className={`rounded-xl border p-1.5 [@media(min-height:560px)]:p-2.5 flex flex-col justify-between gap-1 min-h-0 overflow-hidden ${
                          deal.bought
                            ? 'border-emerald-400/30 bg-emerald-950/25 opacity-75'
                            : deal.kind === 'BARGAIN_PHONE'
                            ? 'border-fuchsia-400/40 bg-[#171225]'
                            : 'border-amber-400/25 bg-[#0E141D]'
                        }`}
                      >
                        <div className="space-y-0.5 min-w-0 overflow-hidden">
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`text-[9px] font-mono font-extrabold uppercase tracking-wider truncate ${
                                deal.kind === 'BARGAIN_PHONE'
                                  ? 'text-fuchsia-300'
                                  : deal.kind === 'ACCESSORY_BUNDLE'
                                  ? 'text-sky-300'
                                  : 'text-amber-300'
                              }`}
                            >
                              {deal.kind === 'SPARE_PART_BUNDLE'
                                ? bi('NADİR PARÇA', 'RARE PARTS')
                                : deal.kind === 'ACCESSORY_BUNDLE'
                                ? bi('TOPTAN KOLİ', 'BULK BOX')
                                : bi('KELEPİR CİHAZ', 'BARGAIN PHONE')}
                            </span>
                            <span className="rounded bg-rose-500/20 border border-rose-400/40 px-1 py-0.5 font-mono text-[9px] font-extrabold text-rose-300 shrink-0">
                              -%{deal.discountPercent}
                            </span>
                          </div>

                          <div className="text-[11px] [@media(min-height:560px)]:text-xs font-extrabold text-slate-50 truncate">
                            {lang === 'en' ? deal.enTitle : deal.title}
                          </div>
                          <p className="hidden [@media(min-height:520px)]:block text-[9.5px] text-slate-400 leading-tight line-clamp-2">
                            {lang === 'en' ? deal.enSubtitle : deal.subtitle}
                          </p>
                        </div>

                        <div className="shrink-0 flex items-end justify-between gap-1.5 pt-1 border-t border-white/8 tabular-nums">
                          <div className="min-w-0">
                            <div className="font-mono text-[9px] text-slate-500 line-through">
                              {formatTRY(deal.originalPrice)}
                            </div>
                            <div className="font-mono text-[11px] [@media(min-height:560px)]:text-xs font-extrabold text-emerald-400 leading-none">
                              {formatTRY(deal.kermesPrice)}
                            </div>
                          </div>

                          {deal.bought ? (
                            <span className="inline-flex items-center gap-0.5 rounded-lg bg-emerald-500/20 border border-emerald-400/40 px-2 py-1 text-[9.5px] font-extrabold text-emerald-300 shrink-0">
                              <CheckCircle2 className="w-3 h-3" />
                              {bi('Alındı', 'Claimed')}
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={!canAfford}
                              onClick={() => onBuyKermesDeal(deal.id)}
                              className="rounded-lg bg-amber-500 px-2.5 py-1 text-[10px] font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-35 cursor-pointer whitespace-nowrap shrink-0"
                            >
                              {bi('Kap', 'Grab')}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          );
        })()
      )}

      {/* MUSEUM ARCHIVE STORY MODAL (AUTO-OPENS ON PURCHASE OR CARD CLICK) */}
      {selectedMuseumSpec && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/78 p-4"
          onClick={() => {
            setSelectedMuseumId(null);
            setJustBoughtMuseumId(null);
          }}
        >
          <div
            className="w-full max-w-lg max-h-[92dvh] overflow-y-auto pasaj-scroll rounded-2xl border border-amber-400/40 bg-[#151D28] p-3.5 sm:p-4 shadow-2xl space-y-2.5 sm:space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            {justBoughtMuseumId === selectedMuseumSpec.id && (
              <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-extrabold text-emerald-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>
                  {bi(
                    'Müzene Eklendi! İşte Bu Efsanenin Gizemli Arka Plan Hikayesi:',
                    'Added to Your Museum! Here is the Legendary Backstory:'
                  )}
                </span>
              </div>
            )}
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
                  <h3 className="font-display text-xs [@media(min-height:560px)]:text-sm font-extrabold text-slate-50 mt-0.5">
                    {selectedMuseumSpec.name}
                  </h3>
                  <div className="text-[10.5px] text-emerald-400 font-mono font-bold mt-0.5 tabular-nums">
                    +{formatTRY(selectedMuseumSpec.dailyPassiveCash)}/{bi('gün', 'day')} · +
                    {selectedMuseumSpec.prestigeBonus} {bi('Prestij', 'Prestige')}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedMuseumId(null);
                  setJustBoughtMuseumId(null);
                }}
                className="w-8 h-8 rounded-lg border border-white/10 bg-[#0E141D] flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-xl border border-white/8 bg-[#0E141D] p-2.5 space-y-1.5">
              <div className="text-[9.5px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                {bi('CİHAZIN GEÇMİŞ HİKAYESİ', 'DEVICE BACKSTORY & ARCHIVE')}
              </div>
              <p className="text-[10.5px] [@media(min-height:560px)]:text-[11px] italic text-amber-100/95 leading-snug">
                “{selectedMuseumSpec.story}”
              </p>
              <p className="text-[10.5px] [@media(min-height:560px)]:text-[11px] text-slate-300 leading-snug border-t border-white/8 pt-1.5">
                {selectedMuseumSpec.fullHistory}
              </p>
              <div className="border-t border-white/8 pt-1.5 text-[10.5px] font-semibold text-emerald-300">
                {selectedMuseumSpec.collectorPerk}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedMuseumId(null);
                  setJustBoughtMuseumId(null);
                }}
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
                    setJustBoughtMuseumId(selectedMuseumSpec.id);
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

      {/* AUCTION MYSTERY BOX REVEAL MODAL */}
      {wonMysteryLot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setWonMysteryLot(null)}
        >
          <div
            className="w-full max-w-lg max-h-[92dvh] overflow-y-auto pasaj-scroll rounded-2xl border border-fuchsia-400/40 bg-[#151D28] p-3.5 sm:p-4 shadow-2xl space-y-2.5 sm:space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-500/20 border border-fuchsia-400/40 text-fuchsia-300">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-fuchsia-300">
                    {bi('İHALE GANİMETİ & GİZEMLİ KUTULAR AÇILDI', 'AUCTION LOOT & MYSTERY BOXES OPENED')}
                  </div>
                  <h3 className="font-display text-xs [@media(min-height:560px)]:text-sm font-extrabold text-slate-50">
                    {wonMysteryLot.lotTitle}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWonMysteryLot(null)}
                className="w-8 h-8 rounded-lg border border-white/10 bg-[#0E141D] flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              {(wonMysteryLot.mysteryRewards ?? []).map((mr) => (
                <div
                  key={mr.id}
                  className="rounded-xl border border-fuchsia-400/25 bg-[#0E141D] p-2.5 flex items-start justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono font-bold text-fuchsia-300">
                      {mr.boxLabel}
                    </div>
                    <div className="text-xs font-extrabold text-slate-100 mt-0.5">
                      {mr.rewardTitle}
                    </div>
                    <div className="text-[10.5px] text-slate-400 mt-0.5">{mr.rewardDetail}</div>
                  </div>
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setWonMysteryLot(null)}
              className="w-full rounded-xl bg-amber-500 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-400 cursor-pointer"
            >
              {bi('Harika! Ganimeti Al →', 'Awesome! Collect Loot →')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
