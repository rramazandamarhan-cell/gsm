import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Award,
  Building2,
  Calculator,
  Check,
  Clock,
  Gavel,
  Landmark,
  Lock,
  Megaphone,
  Minus,
  Package,
  Plus,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Store,
  Truck,
  Wallet,
} from 'lucide-react';
import {
  AUCTION_RIVALS,
  BANK_LOANS,
  CITY_BRANCHES,
  MUSEUM_ITEMS,
} from '../game/catalog';
import {
  calculateDeviceValuationBreakdown,
  calculateMarketValue,
  formatTRY,
  getEffectiveLoanTerms,
  getEffectiveSalesTaxRate,
  roundPrice,
} from '../game/engine';
import {
  getLocalizedBranch,
  getLocalizedDefect,
  getLocalizedLoan,
  getLocalizedMuseumItem,
  useLanguage,
} from '../game/i18n';
import { soundFX } from '../game/sound';
import {
  BankLoanOffer,
  BranchId,
  CustomsAuctionLot,
  MuseumItemId,
  PhoneDevice,
  ShippingOrder,
  ShopState,
} from '../game/types';
import { PhoneModelThumb } from './PhoneInspectSVG';
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
  const { lang, bi } = useLanguage();
  const [subTab, setSubTab] = useState<EmpireSubTab>(
    shop.weeklyTaxDue > 0 ? 'FINANCE' : 'CLASSIFIEDS'
  );
  const [classifiedMode, setClassifiedMode] = useState<'LISTINGS' | 'SHIPPING'>(
    'LISTINGS'
  );
  const [haggleDrafts, setHaggleDrafts] = useState<Record<string, number>>({});

  // Live Customs Auction local state
  const auctionLots: CustomsAuctionLot[] =
    shop.dailyAuctionLots && shop.dailyAuctionLots.length > 0
      ? shop.dailyAuctionLots
      : shop.dailyAuctionLot
      ? [shop.dailyAuctionLot]
      : [];
  const [selectedLotId, setSelectedLotId] = useState<string>(
    auctionLots[0]?.id ?? ''
  );
  const activeLot =
    auctionLots.find((l) => l.id === selectedLotId) ?? auctionLots[0] ?? null;

  const [auctionRunning, setAuctionRunning] = useState(false);
  const [currentBid, setCurrentBid] = useState(0);
  const [highestBidder, setHighestBidder] = useState<string>('');
  const [bidLog, setBidLog] = useState<string[]>([]);
  const [rivalMaxBid, setRivalMaxBid] = useState(0);

  const getLotEstValue = (lot: CustomsAuctionLot) =>
    lot.devices.reduce((sum, d) => sum + d.baseValue, 0);

  useEffect(() => {
    if (!activeLot) return;
    setAuctionRunning(false);
    setCurrentBid(activeLot.startingBid);
    setHighestBidder(bi('Açılış Fiyatı', 'Opening Bid'));
    setBidLog([]);
    setRivalMaxBid(
      roundPrice(getLotEstValue(activeLot) * (0.64 + Math.random() * 0.24))
    );
  }, [activeLot?.id]);

  const handleStartAuction = () => {
    if (!activeLot || activeLot.resolved) return;
    soundFX.playClick();
    setAuctionRunning(true);
    setCurrentBid(activeLot.startingBid);
    setHighestBidder(bi('Açılış', 'Opening'));
    setBidLog([
      bi(
        `İhale başladı! Açılış: ${formatTRY(activeLot.startingBid)}`,
        `Auction live! Opening bid: ${formatTRY(activeLot.startingBid)}`
      ),
    ]);
  };

  const handlePlayerBid = (increment: number) => {
    if (!activeLot || !auctionRunning || activeLot.resolved) return;
    const nextBid = currentBid + increment;
    if (shop.cash < nextBid) return;
    soundFX.playCashRegister();

    if (nextBid >= rivalMaxBid || Math.random() < 0.22) {
      // Player wins!
      setCurrentBid(nextBid);
      setHighestBidder(bi('Sen', 'You'));
      setAuctionRunning(false);
      onResolveAuction(activeLot.id, true, nextBid);
      return;
    }

    const rival =
      AUCTION_RIVALS[Math.floor(Math.random() * AUCTION_RIVALS.length)];
    const rivalBump = roundPrice(Math.min(rivalMaxBid, nextBid + increment));
    setCurrentBid(rivalBump);
    setHighestBidder(rival.name);
    setBidLog((prev) =>
      [
        bi(
          `Sen ${formatTRY(nextBid)} verdin → ${rival.name} ${formatTRY(rivalBump)} yaptı!`,
          `You bid ${formatTRY(nextBid)} → ${rival.name} raised to ${formatTRY(rivalBump)}!`
        ),
        ...prev,
      ].slice(0, 3)
    );
  };

  const handleWithdrawAuction = () => {
    if (!activeLot || activeLot.resolved) return;
    soundFX.playClick();
    setAuctionRunning(false);
    onResolveAuction(activeLot.id, false, currentBid);
  };

  const effectiveTaxPct = Math.round(
    getEffectiveSalesTaxRate(shop.staff, shop.staffLevels) * 100
  );
  const hasAccountant = shop.staff.includes('accountant');
  const activeListings = (shop.onlineListings ?? []).filter(
    (l) => l.status !== 'BOUGHT' && l.status !== 'REJECTED'
  );
  const activeOrders = (shop.shippingOrders ?? []).filter((o) => !o.fulfilled);

  const matchPhonesForOrder = (order: ShippingOrder): PhoneDevice[] =>
    shop.inventory.filter(
      (p) =>
        !p.assignedToStaff &&
        p.tier === order.requestedTier &&
        (!order.requireClean || p.defects.length === 0)
    );

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#0F141B] p-2 lg:p-3 gap-2">
      {/* SINGLE-ROW SUB-TAB TOOLBAR */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-1.5 rounded-xl border border-white/10 bg-[#151D28] px-2.5 py-1.5">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {(
            [
              ['CLASSIFIEDS', Search, bi('Sarı İlan & Kargo', 'Listings & Cargo')],
              ['AUCTION', Gavel, bi('İhale', 'Auctions')],
              ['BRANCHES', Building2, bi('Şube & Rakip', 'Branches & Rival')],
              ['FINANCE', Landmark, bi('Banka & Vergi', 'Bank & Tax')],
              ['MUSEUM', Award, bi('Müze', 'Museum')],
            ] as const
          ).map(([id, Icon, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setSubTab(id)}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                subTab === id
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-[#0E141D] text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {id === 'FINANCE' && shop.weeklyTaxDue > 0 && (
                <span className="rounded bg-rose-500 px-1 font-mono text-[9px] text-white">
                  !
                </span>
              )}
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

      {/* TAB 1: CLASSIFIEDS (2x2) & SHIPPING ORDERS (3-COL) — ZERO SCROLL */}
      {subTab === 'CLASSIFIEDS' && (
        <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
          <div className="shrink-0 flex items-center justify-between gap-2">
            <div className="inline-flex rounded-lg border border-white/10 bg-[#151D28] p-0.5">
              <button
                type="button"
                onClick={() => setClassifiedMode('LISTINGS')}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10.5px] font-bold cursor-pointer ${
                  classifiedMode === 'LISTINGS'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Search className="w-3 h-3" />
                {bi('Sarı İlan Fırsatları', 'Classified Deals')} ({activeListings.length})
              </button>
              <button
                type="button"
                onClick={() => setClassifiedMode('SHIPPING')}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10.5px] font-bold cursor-pointer ${
                  classifiedMode === 'SHIPPING'
                    ? 'bg-sky-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Truck className="w-3 h-3" />
                {bi('Şehir Dışı Kargo', 'Shipping Orders')} ({activeOrders.length})
              </button>
            </div>

            <span className="text-[10px] text-slate-400 hidden sm:inline">
              {bi(
                'İlanı yerinde kontrol et veya kapıda kargo ile açıp kusur çıkarsa pazarlık yap!',
                'Inspect onsite or order COD to expose defects & haggle before paying!'
              )}
            </span>
          </div>

          {classifiedMode === 'LISTINGS' ? (
            activeListings.length === 0 ? (
              <div className="flex-1 rounded-xl border border-dashed border-white/10 bg-[#151D28] flex items-center justify-center text-xs text-slate-400">
                {bi(
                  'Bugünün sarı ilanları tükendi — yarın sabah yenileri düşecek.',
                  'Today’s classified deals are cleared — fresh listings arrive tomorrow.'
                )}
              </div>
            ) : (
              <div className="flex-1 min-h-0 grid grid-cols-2 grid-rows-2 gap-2 overflow-hidden">
                {activeListings.slice(0, 4).map((l) => {
                  const inspected =
                    l.status === 'INSPECTED_ONSITE' ||
                    l.status === 'ARRIVED_COD';
                  const inTransit = l.status === 'SHIPPING_IN_TRANSIT';
                  const bd = calculateDeviceValuationBreakdown(
                    l.device,
                    l.askingPrice,
                    shop.upgrades,
                    shop.dailyNews,
                    shop.level,
                    shop.legacyPath,
                    false
                  );
                  const draft =
                    haggleDrafts[l.id] ??
                    roundPrice(Math.max(1000, l.askingPrice * 0.85));

                  return (
                    <div
                      key={l.id}
                      className="rounded-xl border border-white/10 bg-[#151D28] p-2.5 flex flex-col justify-between gap-2 min-h-0 overflow-hidden"
                    >
                      <div className="flex-1 min-h-0 flex items-center gap-2.5 overflow-hidden">
                        {/* Visual Phone Model Preview */}
                        <div className="h-full max-h-24 aspect-[3/4] rounded-lg border border-white/8 bg-[#0D131C] p-1.5 flex items-center justify-center shrink-0">
                          <PhoneModelThumb
                            device={l.device}
                            showBack
                            className="h-full w-auto"
                          />
                        </div>

                        <div className="min-w-0 flex-1 flex flex-col justify-between h-full gap-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-xs font-extrabold text-slate-100 truncate">
                                {l.device.brand} {l.device.model}{' '}
                                <span className="text-[10px] font-normal text-slate-400">
                                  {l.device.storage}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {l.sellerName} · {l.district}
                              </div>
                            </div>
                            <div className="text-right font-mono tabular-nums shrink-0">
                              <div className="text-xs font-extrabold text-amber-300">
                                {formatTRY(l.askingPrice)}
                              </div>
                              {inspected && (
                                <div className="text-[9.5px] text-emerald-300">
                                  {bi('Değer', 'Val')}: {formatTRY(bd.asIsValue)}
                                </div>
                              )}
                            </div>
                          </div>

                          {inspected ? (
                            <div className="flex flex-wrap items-center gap-1 text-[9.5px]">
                              {l.device.defects.length === 0 ? (
                                <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-bold text-emerald-300">
                                  ✓ {bi('Tertemiz Çıktı', 'Verified Clean')}
                                </span>
                              ) : (
                                l.device.defects.map((d) => (
                                  <span
                                    key={d}
                                    className="rounded bg-rose-500/15 px-1.5 py-0.5 font-bold text-rose-300"
                                  >
                                    {getLocalizedDefect(d, lang).shortLabel}
                                  </span>
                                ))
                              )}
                              {l.lastSellerReply && (
                                <span className="text-amber-200 truncate">
                                  · {l.lastSellerReply}
                                </span>
                              )}
                            </div>
                          ) : inTransit ? (
                            <div className="inline-flex items-center gap-1 text-[10.5px] font-bold text-sky-300">
                              <Clock className="w-3.5 h-3.5" />
                              {bi(
                                `Kargo yolda (${l.deliveryDaysLeft ?? 1} gün kaldı)`,
                                `COD arriving in ${l.deliveryDaysLeft ?? 1} day(s)`
                              )}
                            </div>
                          ) : (
                            <p className="text-[10px] text-slate-300 line-clamp-2 italic">
                              “{l.sellerNote}”
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Footer */}
                      {inTransit ? (
                        <div className="text-[10px] text-slate-400">
                          {bi(
                            'Yarın kapıda kontrol edip satın alabilir veya iade edebilirsin.',
                            'Inspect on delivery tomorrow before deciding to buy or reject.'
                          )}
                        </div>
                      ) : inspected ? (
                        <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-white/8 tabular-nums">
                          {(l.haggleAttempts ?? 0) < 2 && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setHaggleDrafts((p) => ({
                                    ...p,
                                    [l.id]: Math.max(500, draft - 250),
                                  }))
                                }
                                className="w-5 h-5 rounded bg-white/10 flex items-center justify-center text-slate-200 cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onHaggleClassified(l.id, draft)}
                                className="rounded-md bg-sky-500/20 border border-sky-400/35 px-2 py-0.5 text-[10px] font-bold text-sky-200 hover:bg-sky-500/30 cursor-pointer whitespace-nowrap"
                              >
                                {bi('Teklif', 'Offer')} {formatTRY(draft)}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setHaggleDrafts((p) => ({
                                    ...p,
                                    [l.id]: draft + 250,
                                  }))
                                }
                                className="w-5 h-5 rounded bg-white/10 flex items-center justify-center text-slate-200 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                          <div className="flex items-center gap-1 ml-auto">
                            <button
                              type="button"
                              onClick={() => onRejectClassified(l.id)}
                              className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-200 cursor-pointer"
                            >
                              {bi('Vazgeç', 'Pass')}
                            </button>
                            <button
                              type="button"
                              disabled={shop.cash < l.askingPrice}
                              onClick={() => onBuyClassified(l.id)}
                              className="rounded-md bg-emerald-500 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-950 hover:bg-emerald-400 disabled:opacity-35 cursor-pointer whitespace-nowrap"
                            >
                              {bi('Al', 'Buy')}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-white/8 tabular-nums">
                          <button
                            type="button"
                            disabled={shop.cash < CLASSIFIED_ONSITE_FEE}
                            onClick={() => onInspectClassifiedOnsite(l.id)}
                            className="rounded-md bg-amber-500/15 border border-amber-400/35 py-1 text-[10px] font-bold text-amber-200 hover:bg-amber-500/25 disabled:opacity-35 cursor-pointer whitespace-nowrap"
                          >
                            {bi('Yerinde Bak', 'Inspect Onsite')} ({formatTRY(CLASSIFIED_ONSITE_FEE)})
                          </button>
                          <button
                            type="button"
                            disabled={shop.cash < CLASSIFIED_COD_FEE}
                            onClick={() => onOrderClassifiedCod(l.id)}
                            className="rounded-md bg-sky-500/15 border border-sky-400/35 py-1 text-[10px] font-bold text-sky-200 hover:bg-sky-500/25 disabled:opacity-35 cursor-pointer whitespace-nowrap"
                          >
                            {bi('Kapıda Kargo', 'Order COD')} ({formatTRY(CLASSIFIED_COD_FEE)})
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ) : activeOrders.length === 0 ? (
            <div className="flex-1 rounded-xl border border-dashed border-white/10 bg-[#151D28] flex items-center justify-center text-xs text-slate-400">
              {bi('Bekleyen kargo siparişi yok.', 'No open shipping orders right now.')}
            </div>
          ) : (
            <div className="flex-1 min-h-0 grid grid-cols-3 gap-2 overflow-hidden">
              {activeOrders.slice(0, 3).map((ord) => {
                const matches = matchPhonesForOrder(ord);
                return (
                  <div
                    key={ord.id}
                    className="rounded-xl border border-white/10 bg-[#151D28] p-2.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-extrabold text-slate-100 truncate">
                          {ord.buyerName} ({ord.city})
                        </span>
                        <span className="font-mono text-xs font-extrabold text-emerald-400">
                          {matches.length > 0
                            ? formatTRY(
                                roundPrice(
                                  calculateMarketValue(
                                    matches[0],
                                    false,
                                    shop.dailyNews,
                                    shop.upgrades,
                                    shop.day
                                  ) *
                                    ord.bonusMultiplier -
                                    ord.shippingFee
                                )
                              )
                            : `+${Math.round((ord.bonusMultiplier - 1) * 100)}%`}
                        </span>
                      </div>
                      <div className="text-[10.5px] text-amber-300 font-semibold mt-0.5">
                        {bi('İstek', 'Wants')}: {ord.requestedTier.toUpperCase()}{' '}
                        {ord.requireClean
                          ? bi('· Kusursuz', '· Clean Only')
                          : ''}
                      </div>
                    </div>

                    <div className="flex-1 min-h-0 my-2 rounded-lg border border-white/8 bg-[#0D131C] p-2 flex items-center justify-center">
                      {matches.length > 0 ? (
                        <div className="flex items-center gap-2.5">
                          <PhoneModelThumb
                            device={matches[0]}
                            showBack
                            className="h-16 w-auto"
                          />
                          <div className="text-left min-w-0">
                            <div className="text-[11px] font-bold text-slate-100 truncate">
                              {matches[0].brand} {matches[0].model}
                            </div>
                            <div className="text-[10px] text-emerald-300 font-mono">
                              {bi('Stokta Hazır', 'Ready in Stock')}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-[10.5px] text-slate-400">
                          {bi('Stokta uygun cihaz yok', 'No matching stock')}
                        </div>
                      )}
                    </div>

                    {matches.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => onFulfillShipping(ord.id, matches[0].uid)}
                        className="shrink-0 inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-500 py-1.5 text-[11px] font-extrabold text-slate-950 hover:bg-emerald-400 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {bi('Kargola', 'Ship')}: {matches[0].model}
                      </button>
                    ) : (
                      <div className="shrink-0 rounded-lg bg-[#0E141D] border border-white/8 py-1.5 text-center text-[10px] text-slate-400">
                        {bi('Atölyede Hazırla', 'Prepare in Workshop')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LIVE CUSTOMS AUCTION (2-COLUMN ZERO SCROLL) */}
      {subTab === 'AUCTION' && (
        <div className="flex-1 min-h-0 grid grid-cols-12 gap-2 overflow-hidden">
          <div className="col-span-5 flex flex-col gap-1.5 min-h-0 overflow-hidden">
            {auctionLots.map((lot, idx) => {
              const sel = activeLot?.id === lot.id;
              return (
                <button
                  key={lot.id}
                  type="button"
                  onClick={() => setSelectedLotId(lot.id)}
                  className={`rounded-xl border p-2 text-left transition-colors cursor-pointer ${
                    sel
                      ? 'border-amber-400 bg-amber-500/15'
                      : 'border-white/10 bg-[#151D28] hover:bg-[#1C2634]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-extrabold text-slate-100 truncate">
                      #{idx + 1} · {lot.lotTitle}
                    </span>
                    {lot.resolved ? (
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9.5px] font-bold ${
                          lot.wonByPlayer
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {lot.wonByPlayer
                          ? bi('Kazanıldı', 'Won')
                          : bi('Kapandı', 'Closed')}
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] font-bold text-amber-300">
                        {formatTRY(lot.startingBid)}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 tabular-nums">
                    {lot.devices.length} {bi('cihaz', 'phones')} ·{' '}
                    {bi('Tahmini', 'Est.')} {formatTRY(getLotEstValue(lot))}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="col-span-7 rounded-xl border border-white/10 bg-[#151D28] p-3 flex flex-col justify-between min-h-0 overflow-hidden">
            {!activeLot ? (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
                {bi('Bugün aktif gümrük ihalesi yok.', 'No active customs auctions today.')}
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-mono font-bold text-amber-300 uppercase">
                      {bi('GÜMRÜK KAPALI KOLİ MEZATI', 'CUSTOMS SEALED CRATE AUCTION')}
                    </div>
                    <h3 className="font-display text-base font-extrabold text-slate-50">
                      {activeLot.lotTitle}
                    </h3>
                    <div className="text-[11px] text-slate-400">
                      {activeLot.devices.length} {bi('kapalı cihaz', 'sealed phones')} ·{' '}
                      {bi('Tahmini Değer', 'Est. Value')}:{' '}
                      <strong className="font-mono text-emerald-300">
                        {formatTRY(getLotEstValue(activeLot))}
                      </strong>
                    </div>
                  </div>
                  <div className="text-right tabular-nums">
                    <div className="text-[10px] text-slate-400">
                      {bi('Güncel Pey', 'Current Bid')}
                    </div>
                    <div className="font-mono text-lg font-extrabold text-amber-300">
                      {formatTRY(
                        activeLot.resolved
                          ? activeLot.winningBid ?? currentBid
                          : currentBid
                      )}
                    </div>
                    <div className="text-[10px] text-slate-300">
                      {highestBidder}
                    </div>
                  </div>
                </div>

                {/* Crate Phone Visual Preview Strip */}
                <div className="shrink-0 my-1.5 rounded-lg border border-white/8 bg-[#0D131C] px-2.5 py-2 flex items-center justify-center gap-3">
                  {activeLot.devices.map((d) => (
                    <div
                      key={d.uid}
                      className="flex flex-col items-center gap-0.5"
                    >
                      <PhoneModelThumb
                        device={d}
                        showBack
                        silhouette={!activeLot.resolved}
                        className="w-9 h-14"
                      />
                      <span className="text-[9px] font-mono text-slate-400 max-w-[74px] truncate">
                        {activeLot.resolved ? d.model : d.tier.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex-1 min-h-0 mb-2 rounded-lg border border-white/8 bg-[#0E141D] p-2 space-y-1 overflow-hidden">
                  {activeLot.resolved ? (
                    <div className="h-full flex items-center justify-center text-xs font-bold text-emerald-300">
                      {activeLot.wonByPlayer
                        ? bi(
                            'Bu koliyi kazandın! Tüm cihazlar atölye stoğuna eklendi.',
                            'You won this crate! All phones were added to your workshop.'
                          )
                        : bi(
                            'Bu ihale başka bir esnafta kaldı.',
                            'Another dealer won this auction.'
                          )}
                    </div>
                  ) : bidLog.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400 text-center">
                      {bi(
                        'İhaleyi başlatıp rakiplerin üstüne pey sürerek toplu cihaz kolisini ucuza kapat!',
                        'Start bidding against rival dealers to win the entire sealed crate cheap!'
                      )}
                    </div>
                  ) : (
                    bidLog.map((line, i) => (
                      <div
                        key={i}
                        className="text-[11px] text-slate-200 border-b border-white/5 pb-1 last:border-0"
                      >
                        {line}
                      </div>
                    ))
                  )}
                </div>

                {!activeLot.resolved && (
                  <div className="flex items-center gap-1.5 tabular-nums">
                    {!auctionRunning ? (
                      <button
                        type="button"
                        onClick={handleStartAuction}
                        className="w-full rounded-lg bg-amber-500 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-400 cursor-pointer"
                      >
                        {bi('İhaleye Katıl', 'Join Auction')} ({formatTRY(activeLot.startingBid)})
                      </button>
                    ) : (
                      <>
                        {[1000, 2500, 5000].map((inc) => (
                          <button
                            key={inc}
                            type="button"
                            disabled={shop.cash < currentBid + inc}
                            onClick={() => handlePlayerBid(inc)}
                            className="flex-1 rounded-lg bg-amber-500 py-1.5 text-[11px] font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-35 cursor-pointer whitespace-nowrap"
                          >
                            +{formatTRY(inc)}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={handleWithdrawAuction}
                          className="rounded-lg border border-rose-500/35 bg-rose-500/15 px-3 py-1.5 text-[11px] font-bold text-rose-200 hover:bg-rose-500/25 cursor-pointer"
                        >
                          {bi('Çekil', 'Fold')}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: BRANCHES & RIVAL WAR (ZERO SCROLL) */}
      {subTab === 'BRANCHES' && (
        <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
          {/* Compact Rival Control Bar */}
          <div className="shrink-0 rounded-xl border border-white/10 bg-[#151D28] px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 tabular-nums">
            <div className="flex items-center gap-2 min-w-0">
              <Store className="w-4 h-4 text-rose-400 shrink-0" />
              <div className="text-[11px]">
                <strong className="text-slate-100">{shop.rival.name}</strong>{' '}
                <span className="text-slate-400">
                  {shop.rival.boughtOut
                    ? bi('· Satın Alındı ✓', '· Acquired ✓')
                    : bi(
                        `· Pazar Payı %${shop.rival.marketShare}`,
                        `· Market Share ${shop.rival.marketShare}%`
                      )}
                </span>
              </div>
              {!shop.rival.boughtOut && (
                <div className="w-20 h-2 rounded-full bg-emerald-500/30 overflow-hidden">
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
                  disabled={shop.rival.promoUsedToday || shop.cash < 3000}
                  onClick={onRunRivalPromo}
                  className="inline-flex items-center gap-1 rounded-lg border border-amber-400/35 bg-amber-500/15 px-2.5 py-1 text-[10.5px] font-bold text-amber-200 hover:bg-amber-500/25 disabled:opacity-35 cursor-pointer whitespace-nowrap"
                >
                  <Megaphone className="w-3 h-3" />
                  {bi('Kampanya (3.000 ₺)', 'Ad Blitz (3,000 ₺)')}
                </button>
                <button
                  type="button"
                  disabled={shop.cash < 85000 || shop.rival.marketShare > 25}
                  onClick={onBuyoutRival}
                  className="rounded-lg bg-rose-500 px-2.5 py-1 text-[10.5px] font-extrabold text-white hover:bg-rose-400 disabled:opacity-35 cursor-pointer whitespace-nowrap"
                >
                  {bi('Rakibi Satın Al (85K ₺)', 'Buyout Rival (85K ₺)')}
                </button>
              </div>
            )}
          </div>

          {/* 5 City Branches Grid (3x2) */}
          <div className="flex-1 min-h-0 grid grid-cols-3 grid-rows-2 gap-2 overflow-hidden">
            {CITY_BRANCHES.map((b) => {
              const loc = getLocalizedBranch(b.id, lang);
              const owned = shop.branches.includes(b.id);
              const pending = (shop.pendingProjects ?? []).find(
                (p) => p.kind === 'BRANCH' && p.targetId === b.id
              );
              const canOpen =
                !owned &&
                !pending &&
                shop.reputation >= b.minReputation &&
                shop.cash >= b.unlockCost;

              return (
                <div
                  key={b.id}
                  className={`rounded-xl border p-2 flex flex-col justify-between min-h-0 overflow-hidden ${
                    owned
                      ? 'border-emerald-400/45 bg-emerald-500/10'
                      : 'border-white/10 bg-[#151D28]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-extrabold text-slate-100 truncate">
                        {loc.name}
                      </span>
                      <span className="font-mono text-[10px] font-bold text-emerald-400 shrink-0">
                        +{formatTRY(b.dailyNetIncome)}/{bi('g', 'd')}
                      </span>
                    </div>
                    <div className="text-[9.5px] text-amber-300">
                      {loc.district} · +{b.prestigeBonus}{' '}
                      {bi('Prestij', 'Prestige')}
                    </div>
                    <p className="text-[9.5px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                      {loc.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/8 tabular-nums">
                    <span className="text-[9.5px] text-slate-400">
                      {b.minReputation.toFixed(1)}★ · {b.buildDays}
                      {bi('g', 'd')}
                    </span>
                    {owned ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-emerald-400">
                        <Check className="w-3 h-3" /> {bi('Açık', 'Active')}
                      </span>
                    ) : pending ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-sky-300">
                        <Clock className="w-3 h-3" /> {pending.daysRemaining}
                        {bi('g', 'd')}
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={!canOpen}
                        onClick={() => onUnlockBranch(b.id)}
                        className="rounded-md bg-amber-500 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-35 cursor-pointer whitespace-nowrap"
                      >
                        {formatTRY(b.unlockCost)}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: BANK LOANS (3x2) & TAX OFFICE — 2-COLUMN ZERO SCROLL */}
      {subTab === 'FINANCE' && (
        <div className="flex-1 min-h-0 grid grid-cols-12 gap-2 overflow-hidden">
          {/* Left: Tax Office + Active Loans */}
          <div className="col-span-5 flex flex-col gap-2 min-h-0 overflow-hidden">
            <div className="shrink-0 rounded-xl border border-white/10 bg-[#151D28] p-2.5 space-y-1.5 tabular-nums">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-100">
                  <Calculator className="w-4 h-4 text-emerald-400" />
                  {bi('Vergi & Muhasebe', 'Tax & Accounting')}
                </div>
                <span className="font-mono text-[10.5px] font-bold text-amber-300">
                  {bi('KDV', 'Tax')}: %{effectiveTaxPct}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-[#0E141D] border border-white/8 px-2.5 py-1.5">
                <div>
                  <div className="text-[10px] text-slate-400">
                    {bi('Ödenecek Vergi Borcu', 'Pending Tax Balance')}
                  </div>
                  <div
                    className={`font-mono text-sm font-extrabold ${
                      shop.weeklyTaxDue > 0
                        ? 'text-rose-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {formatTRY(shop.weeklyTaxDue)}
                  </div>
                </div>
                {shop.weeklyTaxDue > 0 ? (
                  <button
                    type="button"
                    disabled={shop.cash < shop.weeklyTaxDue}
                    onClick={onPayWeeklyTax}
                    className="rounded-lg bg-rose-500 px-3 py-1.5 text-[11px] font-extrabold text-white hover:bg-rose-400 disabled:opacity-35 cursor-pointer"
                  >
                    {bi('Vergiyi Öde', 'Pay Tax')}
                  </button>
                ) : (
                  <span className="text-[10.5px] font-bold text-emerald-400">
                    ✓ {bi('Borç Yok', 'Clear')}
                  </span>
                )}
              </div>

              {!hasAccountant && onGoToStaff && (
                <button
                  type="button"
                  onClick={onGoToStaff}
                  className="w-full rounded-lg border border-sky-400/30 bg-sky-500/10 py-1 text-[10px] font-bold text-sky-200 hover:bg-sky-500/20 cursor-pointer"
                >
                  {bi(
                    'Mali Müşavir tutarak vergi oranını düşür →',
                    'Hire CPA Accountant to cut sales tax →'
                  )}
                </button>
              )}
            </div>

            {/* Active Loans List */}
            <div className="flex-1 min-h-0 rounded-xl border border-white/10 bg-[#151D28] p-2.5 flex flex-col overflow-hidden">
              <div className="shrink-0 flex items-center justify-between text-xs font-extrabold text-slate-100 mb-1.5">
                <span className="inline-flex items-center gap-1">
                  <Wallet className="w-4 h-4 text-amber-400" />
                  {bi('Aktif Krediler', 'Active Loans')} ({shop.activeLoans.length})
                </span>
              </div>

              {shop.activeLoans.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-[11px] text-slate-400 text-center">
                  {bi(
                    'Şu an aktif kredi borcun yok.',
                    'You currently have zero active loans.'
                  )}
                </div>
              ) : (
                <div className="space-y-1.5 overflow-hidden">
                  {shop.activeLoans.slice(0, 3).map((loan) => (
                    <div
                      key={loan.id}
                      className="rounded-lg bg-[#0E141D] border border-white/8 p-2 flex items-center justify-between gap-2 tabular-nums"
                    >
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-slate-100 truncate">
                          {loan.name}
                        </div>
                        <div className="text-[9.5px] text-slate-400 font-mono">
                          {bi('Kalan', 'Left')}: {formatTRY(loan.remainingBalance)} ·{' '}
                          {loan.daysLeft}
                          {bi('g', 'd')}
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={shop.cash < loan.remainingBalance}
                        onClick={() => onRepayLoanEarly(loan.id)}
                        className="rounded-md bg-emerald-500/20 border border-emerald-400/35 px-2 py-1 text-[10px] font-bold text-emerald-200 hover:bg-emerald-500/30 disabled:opacity-35 cursor-pointer whitespace-nowrap"
                      >
                        {bi('Kapat', 'Pay Off')}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: 6 Bank Loans in 3x2 Grid */}
          <div className="col-span-7 grid grid-cols-3 grid-rows-2 gap-2 min-h-0 overflow-hidden">
            {BANK_LOANS.map((offer) => {
              const loc = getLocalizedLoan(offer.id, lang);
              const terms = getEffectiveLoanTerms(
                offer.principal,
                offer.interestRate,
                offer.termDays,
                shop.staff,
                shop.staffLevels
              );
              const locked =
                shop.level < (offer.minLevel ?? 1) ||
                shop.shopTier < (offer.minShopTier ?? 1);
              return (
                <div
                  key={offer.id}
                  className={`rounded-xl border p-2 flex flex-col justify-between min-h-0 overflow-hidden ${
                    locked
                      ? 'border-white/5 bg-[#121821]/80 opacity-65'
                      : 'border-white/10 bg-[#151D28]'
                  }`}
                >
                  <div>
                    <div className="text-[10.5px] font-extrabold text-slate-100 truncate">
                      {loc.name}
                    </div>
                    <div className="font-mono text-xs font-extrabold text-emerald-400 mt-0.5">
                      {formatTRY(terms.effectivePrincipal)}
                    </div>
                    <div className="text-[9.5px] text-slate-400 font-mono mt-0.5">
                      {offer.termDays} {bi('gün', 'd')} ·{' '}
                      {formatTRY(terms.dailyPayment)}/{bi('g', 'd')}
                    </div>
                  </div>

                  {locked ? (
                    <div className="inline-flex items-center justify-center gap-1 rounded-md bg-white/5 py-1 text-[9.5px] font-bold text-amber-300">
                      <Lock className="w-3 h-3" />
                      {bi(
                        `Sv.${offer.minLevel ?? 1} · Dük.${offer.minShopTier ?? 1}`,
                        `Lv.${offer.minLevel ?? 1} · T${offer.minShopTier ?? 1}`
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={shop.activeLoans.length >= 2}
                      onClick={() => onTakeLoan(offer)}
                      className="w-full rounded-lg bg-amber-500 py-1 text-[10.5px] font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-35 cursor-pointer"
                    >
                      {bi('Kredi Çek', 'Borrow')}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: RETRO NOSTALGIA MUSEUM (5-CARD GALLERY, ZERO SCROLL) */}
      {subTab === 'MUSEUM' && (
        <div className="flex-1 min-h-0 grid grid-cols-5 gap-2 overflow-hidden">
          {MUSEUM_ITEMS.map((item) => {
            const loc = getLocalizedMuseumItem(item.id, lang);
            const owned = shop.museumItems.includes(item.id);
            return (
              <div
                key={item.id}
                className={`rounded-xl border p-2.5 flex flex-col justify-between min-h-0 overflow-hidden ${
                  owned
                    ? 'border-amber-400/50 bg-amber-500/10'
                    : 'border-white/10 bg-[#151D28]'
                }`}
              >
                <div className="flex-1 min-h-0 flex flex-col items-center text-center gap-1.5 overflow-hidden">
                  <div className="flex-1 min-h-0 w-full rounded-lg border border-white/10 bg-[#0D131C] p-2 flex items-center justify-center">
                    <MuseumPhoneArt
                      id={item.id}
                      className="h-full max-h-28 w-auto"
                    />
                  </div>
                  <div className="shrink-0">
                    <span className="font-mono text-[9.5px] text-amber-300 font-bold">
                      {item.year} · +{item.prestigeBonus}{' '}
                      {bi('Prestij', 'Prestige')}
                    </span>
                    <div className="text-[11px] font-extrabold text-slate-100 leading-tight mt-0.5 line-clamp-1">
                      {loc.name}
                    </div>
                    <p className="text-[9.5px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                      {loc.story}
                    </p>
                  </div>
                </div>

                {owned ? (
                  <div className="rounded-lg bg-emerald-500/20 py-1 text-center text-[10.5px] font-extrabold text-emerald-300">
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    {bi('Sergileniyor', 'Displayed')}
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
            );
          })}
        </div>
      )}
    </div>
  );
};
