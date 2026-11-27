import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Award,
  BarChart3,
  CheckCircle2,
  Coffee,
  Crown,
  Flame,
  Gavel,
  Infinity as InfinityIcon,
  Landmark,
  Newspaper,
  Play,
  PlayCircle,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  Volume2,
  VolumeX,
  Wrench,
  X,
} from 'lucide-react';
import { showRewardedAd } from '../game/adService';
import {
  MUSEUM_ITEMS,
  SHOP_TIERS,
  VICTORY_CASH_GOAL,
  VICTORY_REPUTATION_GOAL,
} from '../game/catalog';
import {
  buildDayHistoryEntry,
  calculatePrestige,
  formatTRY,
  getPrestigePointsEarned,
  getShopRank,
} from '../game/engine';
import { useLanguage } from '../game/i18n';
import { DayFinancials, ShopState } from '../game/types';
import { BrandLogo } from './BrandLogo';
import { DayAnalyticsChart } from './DayAnalyticsChart';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onTitle: () => void;
  onOpenCompliance?: () => void;
  onOpenAnalytics?: () => void;
  onOpenNewspaper?: () => void;
  onOpenLegacy?: () => void;
  muted?: boolean;
  onToggleMute?: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onTitle,
  onOpenCompliance,
  onOpenAnalytics,
  onOpenNewspaper,
  onOpenLegacy,
  muted = false,
  onToggleMute,
}) => {
  const { lang, setLang, bi } = useLanguage();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/78 p-2.5">
      <div className="w-full max-w-md max-h-[94dvh] overflow-y-auto pasaj-scroll rounded-2xl border border-white/10 bg-[#171F2A] p-3.5 sm:p-4 shadow-2xl flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <BrandLogo size="compact" />
            <div className="min-w-0">
              <h2 className="font-display text-base sm:text-lg font-extrabold text-slate-50 leading-tight truncate">
                {bi('Oyun Duraklatıldı', 'Game Paused')}
              </h2>
              <p className="text-[11px] text-slate-400 truncate">
                {bi('İlerlemen otomatik kaydedildi.', 'Your progress is auto-saved.')}
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-0.5 rounded-lg border border-white/12 bg-[#0F151E] p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setLang('tr')}
              className={`rounded-md px-2 py-1 text-[10.5px] font-extrabold cursor-pointer ${
                lang === 'tr' ? 'bg-amber-500 text-slate-950' : 'text-slate-300'
              }`}
            >
              TR
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`rounded-md px-2 py-1 text-[10.5px] font-extrabold cursor-pointer ${
                lang === 'en' ? 'bg-amber-500 text-slate-950' : 'text-slate-300'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onResume}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-extrabold text-slate-950 hover:bg-amber-400 transition-colors whitespace-nowrap cursor-pointer"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>{bi('Devam Et', 'Resume')}</span>
        </button>

        {onOpenLegacy && (
          <button
            type="button"
            onClick={onOpenLegacy}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-amber-400/45 bg-amber-500/14 px-4 py-2 text-xs font-extrabold text-amber-200 hover:bg-amber-500/22 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Crown className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{bi('Pasaj Hatıraları (Kariyer Özeti)', 'Shop Legacy Album')}</span>
          </button>
        )}

        <div className="grid grid-cols-2 gap-2">
          {onOpenNewspaper && (
            <button
              type="button"
              onClick={onOpenNewspaper}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-400/35 bg-amber-500/12 px-3 py-2 text-xs font-bold text-amber-200 hover:bg-amber-500/20 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Newspaper className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>{bi('Pasaj Postası', 'Daily Gazette')}</span>
            </button>
          )}

          {onOpenAnalytics && (
            <button
              type="button"
              onClick={onOpenAnalytics}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/35 bg-emerald-500/12 px-3 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-500/20 transition-colors whitespace-nowrap cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{bi('İstatistikler', 'Analytics')}</span>
            </button>
          )}

          {onToggleMute && (
            <button
              type="button"
              onClick={onToggleMute}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-[#1B2432] px-3 py-2 text-xs font-bold text-slate-200 hover:bg-[#243042] transition-colors whitespace-nowrap cursor-pointer"
            >
              {muted ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              )}
              <span>
                {muted
                  ? bi('Ses: Kapalı', 'Sound: Off')
                  : bi('Ses: Açık', 'Sound: On')}
              </span>
            </button>
          )}

          {onOpenCompliance && (
            <button
              type="button"
              onClick={onOpenCompliance}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-sky-500/35 bg-sky-500/12 px-3 py-2 text-xs font-bold text-sky-200 hover:bg-sky-500/20 transition-colors whitespace-nowrap cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>{bi('Ayarlar & Gizlilik', 'Settings & Privacy')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onRestart}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-[#202B3A] px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-[#2A374A] transition-colors whitespace-nowrap cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{bi('Sıfırdan Başla', 'Restart Career')}</span>
          </button>

          <button
            type="button"
            onClick={onTitle}
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-[#131B26] px-3 py-2 text-xs font-semibold text-slate-300 hover:text-slate-100 transition-colors whitespace-nowrap cursor-pointer"
          >
            {bi('Ana Menü', 'Title Screen')}
          </button>
        </div>
      </div>
    </div>
  );
};

interface DaySummaryModalProps {
  stats: DayFinancials;
  shop: ShopState;
  onClaimAdBonus?: (bonusCash: number) => void;
  onNextDay: () => void;
}

export const DaySummaryModal: React.FC<DaySummaryModalProps> = ({
  stats,
  shop,
  onClaimAdBonus,
  onNextDay,
}) => {
  const { bi } = useLanguage();
  const [adBonusClaimed, setAdBonusClaimed] = useState(false);
  const [watchingAd, setWatchingAd] = useState(false);
  const totalRevenue =
    stats.salesRevenue +
    stats.accessoryRevenue +
    stats.serviceRevenue +
    (stats.branchIncome ?? 0) +
    stats.questRewards;
  const totalExpenses =
    stats.buySpend +
    stats.wholesaleSpend +
    stats.repairSpend +
    stats.rentCost +
    stats.staffWages +
    (stats.posCommission ?? 0) +
    (stats.loanPayments ?? 0) +
    (stats.taxPaid ?? 0) +
    (stats.salesTaxPaid ?? 0);
  const netToday = totalRevenue - totalExpenses;
  const rank = getShopRank(shop);

  const chartHistory =
    shop.history.length > 0
      ? shop.history
      : [
          buildDayHistoryEntry(
            stats,
            shop.dailyNews.headline,
            shop.reputation,
            shop.cash
          ),
        ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/82 p-2">
      <div className="w-full max-w-4xl max-h-[96dvh] flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#171F2A] p-3 shadow-2xl">
        {/* Compact Header */}
        <div className="shrink-0 flex items-center justify-between gap-2 pb-2 border-b border-white/8">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-400">
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {bi('GÜN SONU RAPORU', 'END-OF-DAY REPORT')} · {rank}
              </span>
            </div>
            <h2 className="font-display text-base sm:text-xl font-extrabold text-slate-50 leading-tight">
              {bi(`Gün ${stats.day} Kapanış Özeti`, `Day ${stats.day} Closing Summary`)}
            </h2>
          </div>

          <div className="flex items-center gap-3 text-right tabular-nums shrink-0">
            <div>
              <div className="text-[9.5px] text-slate-400">
                {bi('Günlük Net', 'Daily Net')}
              </div>
              <div
                className={`font-mono text-sm sm:text-base font-extrabold ${
                  netToday >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {netToday >= 0 ? '+' : ''}
                {formatTRY(netToday)}
              </div>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div>
              <div className="text-[9.5px] text-slate-400">
                {bi('İtibar', 'Reputation')}
              </div>
              <div
                className={`font-mono text-xs sm:text-sm font-bold ${
                  stats.reputationDelta >= 0 ? 'text-amber-400' : 'text-rose-400'
                }`}
              >
                {stats.reputationDelta >= 0 ? '+' : ''}
                {stats.reputationDelta.toFixed(2)} ★
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Compact Body (Zero-Scroll on Mobile Landscape) */}
        <div className="flex-1 min-h-0 grid grid-cols-12 gap-2 py-2 overflow-hidden">
          {/* Left: Ledger */}
          <div className="col-span-7 rounded-xl border border-white/8 bg-[#121822] p-2.5 flex flex-col justify-between overflow-hidden">
            <div>
              <div className="text-[10.5px] font-bold text-slate-300 mb-1.5">
                {bi('Günlük Kasa Defteri', 'Daily Cash Ledger')}
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10.5px] tabular-nums">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-slate-400 truncate">
                    {bi(`Satış (${stats.phonesSold})`, `Sales (${stats.phonesSold})`)}
                  </span>
                  <span className="font-mono font-semibold text-emerald-400 shrink-0">
                    +{formatTRY(stats.salesRevenue)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-slate-400 truncate">
                    {bi(`2. El Alım (${stats.phonesBought})`, `Used Buys (${stats.phonesBought})`)}
                  </span>
                  <span className="font-mono text-slate-200 shrink-0">
                    -{formatTRY(stats.buySpend)}
                  </span>
                </div>
                {stats.accessoryRevenue > 0 && (
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-slate-400 truncate">
                      {bi(`Aksesuar (${stats.accessoriesSold})`, `Accessories (${stats.accessoriesSold})`)}
                    </span>
                    <span className="font-mono font-semibold text-emerald-400 shrink-0">
                      +{formatTRY(stats.accessoryRevenue)}
                    </span>
                  </div>
                )}
                {stats.wholesaleSpend > 0 && (
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-slate-400 truncate">
                      {bi('Toptan Alım', 'Wholesale')}
                    </span>
                    <span className="font-mono text-slate-200 shrink-0">
                      -{formatTRY(stats.wholesaleSpend)}
                    </span>
                  </div>
                )}
                {stats.serviceRevenue > 0 && (
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-slate-400 truncate">
                      {bi('Acil Servis', 'Express Repair')}
                    </span>
                    <span className="font-mono font-semibold text-emerald-400 shrink-0">
                      +{formatTRY(stats.serviceRevenue)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-1">
                  <span className="text-slate-400 truncate">
                    {bi('Tamir & Parça', 'Repairs & Parts')}
                  </span>
                  <span className="font-mono text-slate-200 shrink-0">
                    -{formatTRY(stats.repairSpend)}
                  </span>
                </div>
                {(stats.branchIncome ?? 0) > 0 && (
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-slate-400 truncate">
                      {bi('Pasif Gelir', 'Passive Income')}
                    </span>
                    <span className="font-mono font-semibold text-emerald-400 shrink-0">
                      +{formatTRY(stats.branchIncome)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-1">
                  <span className="text-slate-400 truncate">
                    {bi('Günlük Kira', 'Daily Rent')}
                    {(shop.todayRentDiscountPct ?? 0) > 0 && (
                      <span className="ml-1 text-[9.5px] font-bold text-emerald-400">
                        (-%{Math.round((shop.todayRentDiscountPct ?? 0) * 100)})
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-rose-400 shrink-0">
                    -{formatTRY(stats.rentCost)}
                  </span>
                </div>
                {stats.questRewards > 0 && (
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-slate-400 truncate">
                      {bi('Görev Ödülü', 'Quest Bonus')}
                    </span>
                    <span className="font-mono font-semibold text-sky-300 shrink-0">
                      +{formatTRY(stats.questRewards)}
                    </span>
                  </div>
                )}
                {stats.staffWages > 0 && (
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-slate-400 truncate">
                      {bi('Ekip Maaşı', 'Staff Wages')}
                    </span>
                    <span className="font-mono text-rose-400 shrink-0">
                      -{formatTRY(stats.staffWages)}
                    </span>
                  </div>
                )}
                {(stats.posCommission ?? 0) > 0 && (
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-slate-400 truncate">
                      {bi('POS Komisyon', 'POS Fee')}
                    </span>
                    <span className="font-mono text-rose-400 shrink-0">
                      -{formatTRY(stats.posCommission)}
                    </span>
                  </div>
                )}
                {(stats.loanPayments ?? 0) > 0 && (
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-slate-400 truncate">
                      {bi('Kredi Taksiti', 'Loan Payment')}
                    </span>
                    <span className="font-mono text-rose-400 shrink-0">
                      -{formatTRY(stats.loanPayments)}
                    </span>
                  </div>
                )}
                {((stats.taxPaid ?? 0) + (stats.salesTaxPaid ?? 0)) > 0 && (
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-slate-400 truncate">
                      {bi('Vergi & KDV', 'Taxes & VAT')}
                    </span>
                    <span className="font-mono text-rose-400 shrink-0">
                      -{formatTRY((stats.taxPaid ?? 0) + (stats.salesTaxPaid ?? 0))}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1 mt-1.5">
              {stats.passiveAccessoryNote && (
                <div className="flex items-center gap-1.5 rounded-lg border border-sky-500/25 bg-sky-500/10 px-2 py-1 text-[10px] text-sky-200 truncate">
                  <TrendingUp className="w-3 h-3 text-sky-400 shrink-0" />
                  <span className="truncate">{stats.passiveAccessoryNote}</span>
                </div>
              )}
              {stats.autoRepairedNote && (
                <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-200 truncate">
                  <Wrench className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate">{stats.autoRepairedNote}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Career Records + Mini Chart on taller screens */}
          <div className="col-span-5 rounded-xl border border-white/8 bg-[#121822] p-2.5 flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10.5px] font-bold text-slate-300">
                  {bi('Esnaf Karnesi', 'Shop Scorecard')}
                </span>
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
              </div>

              <div className="space-y-1 text-[10.5px] tabular-nums">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{bi('Güncel Kasa', 'Cash Balance')}</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {formatTRY(shop.cash)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{bi('Dükkan İtibarı', 'Reputation')}</span>
                  <span className="font-mono font-bold text-amber-400">
                    {shop.reputation.toFixed(1)} / 5.0 ★
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{bi('Rekor Satış', 'Best Single Deal')}</span>
                  <span className="font-mono font-semibold text-slate-100">
                    {shop.bestSingleDealProfit > 0
                      ? `+${formatTRY(shop.bestSingleDealProfit)}`
                      : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-slate-400">
                    <ShieldAlert className="w-3 h-3 text-rose-400" />
                    <span>{bi('Gizli Kusur', 'Defects Caught')}</span>
                  </span>
                  <span className="font-mono font-semibold text-slate-100">
                    {shop.totalDefectsExposed}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-slate-400">
                    <Coffee className="w-3 h-3 text-amber-400" />
                    <span>{bi('Çay İkramı', 'Teas Served')}</span>
                  </span>
                  <span className="font-mono font-semibold text-slate-100">
                    {shop.totalTeasServed}
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden lg:block my-1.5">
              <DayAnalyticsChart history={chartHistory} todayStats={stats} />
            </div>

            <div className="pt-1.5 border-t border-white/8 flex items-center justify-between text-[10px] text-slate-400 tabular-nums">
              <span>{bi(`Kaçan: ${stats.dealsLost}`, `Lost: ${stats.dealsLost}`)}</span>
              <span>{bi(`Toplam Satış: ${shop.totalPhonesSold}`, `Total Sold: ${shop.totalPhonesSold}`)}</span>
            </div>
          </div>
        </div>

        {(() => {
          const passiveIncomeToday = stats.branchIncome ?? 0;
          const revenueBonus = Math.min(
            25000,
            Math.max(1500, Math.round((totalRevenue * 0.25) / 250) * 250)
          );
          const passiveMatchBonus =
            passiveIncomeToday > 0 ? Math.min(40000, passiveIncomeToday) : 0;
          const isPassiveDouble = passiveMatchBonus >= revenueBonus && passiveMatchBonus > 0;
          const adBonusCash = isPassiveDouble ? passiveMatchBonus : revenueBonus;
          const showAdBonusBtn = Boolean(onClaimAdBonus && (totalRevenue > 0 || passiveIncomeToday > 0));
          return (
            <div className="shrink-0 flex items-center gap-2">
              {showAdBonusBtn && (
                <button
                  type="button"
                  disabled={adBonusClaimed || watchingAd}
                  onClick={async () => {
                    if (!onClaimAdBonus || adBonusClaimed) return;
                    setWatchingAd(true);
                    const ok = await showRewardedAd({
                      placement: isPassiveDouble ? 'PASSIVE_INCOME_2X_REWARDED' : 'DAY_BONUS_REWARDED',
                      rewardLabelTr: isPassiveDouble
                        ? `Günlük Pasif Gelir 2x Bonusu (+${formatTRY(adBonusCash)})`
                        : `Gün Sonu Esnaf Primi (+${formatTRY(adBonusCash)})`,
                      rewardLabelEn: isPassiveDouble
                        ? `Daily Passive Income 2x Bonus (+${formatTRY(adBonusCash)})`
                        : `End-of-Day Merchant Bonus (+${formatTRY(adBonusCash)})`,
                      detailTr: isPassiveDouble
                        ? `Kısa bir ödüllü reklam izleyerek bugünkü pasif gelirini 2 katına çıkarıp +${formatTRY(adBonusCash)} ekstra nakit almak istiyor musun?`
                        : `Kısa bir ödüllü reklam izleyerek gün sonu cirosundan +${formatTRY(adBonusCash)} ek esnaf primi almak istiyor musun?`,
                      detailEn: isPassiveDouble
                        ? `Watch a short rewarded ad to double today's passive income with +${formatTRY(adBonusCash)} extra cash?`
                        : `Watch a short rewarded ad to claim +${formatTRY(adBonusCash)} extra end-of-day cash bonus?`,
                      multiplierBadge: isPassiveDouble ? '2x PASİF' : '+25% PRİM',
                    });
                    setWatchingAd(false);
                    if (ok) {
                      setAdBonusClaimed(true);
                      onClaimAdBonus(adBonusCash);
                    }
                  }}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs font-extrabold transition-colors whitespace-nowrap tabular-nums ${
                    adBonusClaimed
                      ? 'border border-emerald-400/40 bg-emerald-500/15 text-emerald-300 cursor-default'
                      : 'border border-emerald-400/50 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30 cursor-pointer'
                  }`}
                >
                  {adBonusClaimed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>+{formatTRY(adBonusCash)} {bi('Alındı', 'Claimed')}</span>
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-4 h-4 shrink-0" />
                      <span>
                        {watchingAd
                          ? bi('Reklam...', 'Loading...')
                          : isPassiveDouble
                          ? bi(`Pasif Gelir 2x · +${formatTRY(adBonusCash)}`, `2x Passive · +${formatTRY(adBonusCash)}`)
                          : bi(`Reklam İzle · +${formatTRY(adBonusCash)}`, `Watch Ad · +${formatTRY(adBonusCash)}`)}
                      </span>
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                disabled={watchingAd}
                onClick={onNextDay}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs sm:text-sm font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-50 transition-colors whitespace-nowrap cursor-pointer"
              >
                <Newspaper className="w-4 h-4" />
                <span>
                  {bi(
                    `Gün ${stats.day + 1} Sabah Gazetesini Aç & Kepenk Kaldır`,
                    `Open Day ${stats.day + 1} Morning Paper & Raise Shutter`
                  )}
                </span>
              </button>
            </div>
          );
        })()}
      </div>
    </div>
  );
};


interface EndModalProps {
  mode: 'VICTORY' | 'GAME_OVER' | 'LEGACY';
  state: ShopState;
  onRestart: () => void;
  onContinueEndless?: () => void;
  onTriggerPrestige?: () => void;
  onCloseLegacy?: () => void;
}

export const EndModal: React.FC<EndModalProps> = ({
  mode,
  state,
  onRestart,
  onContinueEndless,
  onTriggerPrestige,
  onCloseLegacy,
}) => {
  const { bi } = useLanguage();
  const isCelebration = mode === 'VICTORY' || mode === 'LEGACY';
  const isLegacyView = mode === 'LEGACY';
  const rank = getShopRank(state);
  const prestigeScore = calculatePrestige(state);
  const prestigePointsPreview = getPrestigePointsEarned(state);
  const prestigeEra = state.prestigeLevel ?? 0;
  const museumOwnedCount = state.museumItems.length;
  const museumTotalCount = MUSEUM_ITEMS.length;
  const museumPct =
    museumTotalCount > 0
      ? Math.round((museumOwnedCount / museumTotalCount) * 100)
      : 0;
  const shopTierName = SHOP_TIERS[state.shopTier]?.name ?? 'Pasaj Dükkanı';

  if (!isCelebration) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/82 p-2.5">
        <div className="w-full max-w-md max-h-[95dvh] overflow-hidden rounded-2xl border border-rose-500/30 bg-[#171F2A] p-4 sm:p-5 text-center shadow-2xl">
          <div className="mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/15 border border-rose-500/35">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
          </div>
          <div className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-rose-300 mb-0.5">
            {rank}
          </div>
          <h2 className="font-display text-2xl font-extrabold text-slate-50 mb-1.5">
            {bi('Kepenk İndirildi', 'Shutters Closed')}
          </h2>
          <p className="text-xs text-slate-300 leading-snug mb-3.5">
            {bi(
              'Günlük kira ve maaşları karşılayacak nakit ve stok kalmadı. Yeni bir stratejiyle tekrar dükkan açabilirsin.',
              'You ran out of cash and stock to cover rent and wages. Open a fresh shop with a sharper strategy!'
            )}
          </p>
          <div className="grid grid-cols-3 gap-2 border-y border-white/10 py-2.5 mb-3.5 tabular-nums">
            <div>
              <div className="text-[10.5px] text-slate-400">
                {bi('Toplam Gün', 'Total Days')}
              </div>
              <div className="font-mono text-base font-bold text-slate-100">{state.day}</div>
            </div>
            <div>
              <div className="text-[10.5px] text-slate-400">
                {bi('Satılan Cihaz', 'Phones Sold')}
              </div>
              <div className="font-mono text-base font-bold text-emerald-400">
                {state.totalPhonesSold}
              </div>
            </div>
            <div>
              <div className="text-[10.5px] text-slate-400">
                {bi('Toplam Kazanç', 'Total Profit')}
              </div>
              <div className="font-mono text-base font-bold text-amber-400">
                {formatTRY(state.totalProfitEarned)}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onRestart}
            className="w-full rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-extrabold text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer"
          >
            {bi('Yeni Dükkan Aç', 'Open Fresh Shop')}
          </button>
        </div>
      </div>
    );
  }

  // PASAJ HATIRALARI (SHOP LEGACY) — Celebrates the Shop's Legendary Era & Infinite Career!
  return (
    <div className="fixed inset-0 z-[74] flex items-center justify-center bg-black/84 backdrop-blur-sm p-2 sm:p-3">
      <div className="w-full max-w-2xl max-h-[94dvh] flex flex-col overflow-hidden rounded-2xl border border-amber-400/45 bg-gradient-to-b from-[#17202D] via-[#121924] to-[#0D131C] shadow-[0_30px_90px_rgba(0,0,0,0.88)]">
        {/* Golden Legacy Header */}
        <div className="shrink-0 relative border-b border-amber-400/20 bg-gradient-to-r from-amber-500/16 via-amber-400/8 to-emerald-500/12 px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-400/55 bg-amber-500/20 shadow-[0_0_24px_rgba(251,191,36,0.32)]">
              <Crown className="w-6 h-6 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="rounded bg-amber-500/20 border border-amber-400/40 px-1.5 py-0.5 font-mono text-[9.5px] font-extrabold uppercase tracking-wider text-amber-300">
                  {bi('PASAJ HATIRALARI · DÖNEM EFSANESİ', 'SHOP LEGACY · ERA CHRONICLE')}
                </span>
                <span className="rounded bg-emerald-500/15 border border-emerald-400/35 px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-emerald-300">
                  {bi(`Sv.${state.level} · Dönem P${prestigeEra}`, `Lv.${state.level} · Era P${prestigeEra}`)}
                </span>
              </div>
              <h2 className="font-display text-lg sm:text-xl font-extrabold text-slate-50 leading-tight truncate mt-0.5">
                {rank} — {shopTierName}
              </h2>
            </div>
          </div>

          {isLegacyView && onCloseLegacy && (
            <button
              type="button"
              onClick={onCloseLegacy}
              aria-label={bi('Kapat', 'Close')}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-[#1B2534] text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Scrollable Commemorative Legacy Showcase */}
        <div className="flex-1 min-h-0 overflow-y-auto pasaj-scroll p-3.5 sm:p-4 space-y-3">
          {/* Endless Era Celebration Banner */}
          <div className="rounded-xl border border-amber-400/25 bg-amber-500/8 px-3.5 py-2.5 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-200 leading-relaxed">
              {mode === 'VICTORY'
                ? bi(
                    `Tebrikler Usta! ${state.day}. günde ${formatTRY(VICTORY_CASH_GOAL)} kasa ve ${VICTORY_REPUTATION_GOAL}★ itibar barajını aşarak dükkanını Pasaj’ın efsanesi yaptın. Bu bir son değil — seviye sınırı olmadan sonsuza dek büyüyebilir veya Prestij ile yeni bir çağ başlatabilirsin!`,
                    `Legendary Milestone! By Day ${state.day} you surpassed ${formatTRY(VICTORY_CASH_GOAL)} cash and ${VICTORY_REPUTATION_GOAL}★ reputation. This isn’t the end — keep expanding infinitely or start a Prestige Era with permanent perks!`
                  )
                : bi(
                    `${state.day} gündür pasajda iz bırakıyorsun! GSM Simulator sonu olmayan, sürekli büyüyen bir esnaf kariyeridir — dilediğin kadar seviye atla, koleksiyonunu tamamla ve Prestij dönemleriyle efsaneni büyüt.`,
                    `You’ve been building your legacy for ${state.day} days! GSM Simulator is an endless merchant career — level up infinitely, complete your museum, and ascend through Prestige eras.`
                  )}
            </p>
          </div>

          {/* 4 Key Performance Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 tabular-nums">
            {/* 1. Toplam Kazanç */}
            <div className="rounded-xl border border-emerald-400/30 bg-[#101A22] p-2.5 space-y-1">
              <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{bi('Toplam Kazanç', 'Total Earnings')}</span>
              </div>
              <div className="font-mono text-sm sm:text-base font-black text-emerald-400 leading-tight truncate">
                {formatTRY(state.totalProfitEarned)}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {bi('Kasa:', 'Cash:')} {formatTRY(state.cash)}
              </div>
            </div>

            {/* 2. Toplam Satış */}
            <div className="rounded-xl border border-sky-400/30 bg-[#101824] p-2.5 space-y-1">
              <div className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-300">
                <Trophy className="w-3.5 h-3.5" />
                <span>{bi('Toplam Satış', 'Total Sales')}</span>
              </div>
              <div className="font-mono text-sm sm:text-base font-black text-slate-50 leading-tight">
                {state.totalPhonesSold}{' '}
                <span className="text-[10px] font-bold text-sky-300">
                  {bi('Cihaz', 'Phones')}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {state.totalPhonesRepaired} {bi('tamir', 'repairs')} · {state.totalAccessoriesSold}{' '}
                {bi('aksesuar', 'acc.')}
              </div>
            </div>

            {/* 3. Dükkan Prestiji */}
            <div className="rounded-xl border border-amber-400/35 bg-[#1A1812] p-2.5 space-y-1">
              <div className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{bi('Dükkan Prestiji', 'Shop Prestige')}</span>
              </div>
              <div className="font-mono text-sm sm:text-base font-black text-amber-300 leading-tight">
                {prestigeScore}{' '}
                <span className="text-[10px] font-bold text-amber-200/80">
                  {bi('Puan', 'Pts')}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {state.reputation.toFixed(1)}★ · {bi(`Kademe ${state.shopTier}/6`, `Tier ${state.shopTier}/6`)}
              </div>
            </div>

            {/* 4. En İyi Pazarlık Başarısı */}
            <div className="rounded-xl border border-rose-400/30 bg-[#1C141A] p-2.5 space-y-1">
              <div className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-300">
                <Gavel className="w-3.5 h-3.5" />
                <span>{bi('En İyi Pazarlık', 'Best Bargain')}</span>
              </div>
              <div className="font-mono text-sm sm:text-base font-black text-rose-300 leading-tight truncate">
                +{formatTRY(state.bestSingleDealProfit)}
              </div>
              <div className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                <Flame className="w-3 h-3 text-amber-400" />
                <span>
                  {bi(`En uzun seri: ${state.bestDealStreak}x`, `Best streak: ${state.bestDealStreak}x`)}
                </span>
              </div>
            </div>
          </div>

          {/* 5. Nostalji Müze Koleksiyon Durumu */}
          <div className="rounded-xl border border-white/10 bg-[#0E1520] p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-200">
                <Landmark className="w-4 h-4 text-amber-400" />
                <span>{bi('Nostalji Müze Koleksiyon Durumu', 'Nostalgia Museum Collection')}</span>
              </div>
              <span className="font-mono text-xs font-extrabold text-amber-300 tabular-nums">
                {museumOwnedCount} / {museumTotalCount} (%{museumPct})
              </span>
            </div>

            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-300 to-emerald-400 transition-all duration-300"
                style={{ width: `${museumPct}%` }}
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {MUSEUM_ITEMS.map((item) => {
                const owned = state.museumItems.includes(item.id);
                return (
                  <span
                    key={item.id}
                    className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                      owned
                        ? 'border-amber-400/45 bg-amber-500/15 text-amber-200'
                        : 'border-white/8 bg-white/4 text-slate-500'
                    }`}
                  >
                    {owned ? '★ ' : '○ '}
                    {item.name}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Mini Additional Highlights Row */}
          <div className="grid grid-cols-3 gap-2 text-center tabular-nums">
            <div className="rounded-lg border border-white/8 bg-[#121A26] py-1.5 px-2">
              <div className="text-[9.5px] text-slate-400">{bi('Geçen Süre', 'Days Active')}</div>
              <div className="font-mono text-xs font-extrabold text-slate-100">
                {state.day} {bi('Gün', 'Days')}
              </div>
            </div>
            <div className="rounded-lg border border-white/8 bg-[#121A26] py-1.5 px-2">
              <div className="text-[9.5px] text-slate-400">{bi('İkram Edilen Çay', 'Teas Served')}</div>
              <div className="font-mono text-xs font-extrabold text-amber-300">
                {state.totalTeasServed}
              </div>
            </div>
            <div className="rounded-lg border border-white/8 bg-[#121A26] py-1.5 px-2">
              <div className="text-[9.5px] text-slate-400">{bi('Şube Ağı', 'Branches')}</div>
              <div className="font-mono text-xs font-extrabold text-emerald-300">
                {state.branches.length} {bi('Şube', 'Active')}
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer — Endless Play First! */}
        <div className="shrink-0 border-t border-white/10 bg-[#0D131D] p-3 flex flex-wrap items-center gap-2">
          {isLegacyView && onCloseLegacy ? (
            <button
              type="button"
              onClick={onCloseLegacy}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer"
            >
              <InfinityIcon className="w-4 h-4" />
              <span>{bi('Dükkanına Dön & Büyümeye Devam Et', 'Return & Keep Growing')}</span>
            </button>
          ) : (
            <>
              {onContinueEndless && (
                <button
                  type="button"
                  onClick={onContinueEndless}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <InfinityIcon className="w-4 h-4" />
                  <span>{bi('Sonsuz Esnaflığa Devam Et →', 'Continue Endless Career →')}</span>
                </button>
              )}
              {onTriggerPrestige && prestigePointsPreview > 0 && (
                <button
                  type="button"
                  onClick={onTriggerPrestige}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-slate-950 hover:bg-emerald-400 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Award className="w-4 h-4" />
                  <span>
                    {bi(
                      `Yeni Prestij Dönemi (+${prestigePointsPreview} PP)`,
                      `Start Prestige Era (+${prestigePointsPreview} PP)`
                    )}
                  </span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
