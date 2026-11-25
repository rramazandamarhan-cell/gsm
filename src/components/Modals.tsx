import React, { useEffect } from 'react';
import {
  AlertTriangle,
  Award,
  BarChart3,
  Coffee,
  Newspaper,
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Trophy,
  Wrench,
  X,
} from 'lucide-react';
import { VICTORY_CASH_GOAL, VICTORY_REPUTATION_GOAL } from '../game/catalog';
import {
  buildDayHistoryEntry,
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
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onTitle,
  onOpenCompliance,
  onOpenAnalytics,
}) => {
  const { lang, setLang, bi } = useLanguage();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/78 p-2.5">
      <div className="w-full max-w-md max-h-[94dvh] overflow-hidden rounded-2xl border border-white/10 bg-[#171F2A] p-4 shadow-2xl flex flex-col gap-3">
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

        <div className="grid grid-cols-2 gap-2">
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
  onNextDay: () => void;
}

export const DaySummaryModal: React.FC<DaySummaryModalProps> = ({
  stats,
  shop,
  onNextDay,
}) => {
  const { bi } = useLanguage();
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

        <button
          type="button"
          onClick={onNextDay}
          className="shrink-0 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs sm:text-sm font-extrabold text-slate-950 hover:bg-amber-400 transition-colors whitespace-nowrap cursor-pointer"
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
    </div>
  );
};

interface AnalyticsModalProps {
  shop: ShopState;
  onClose: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  shop,
  onClose,
}) => {
  const { bi } = useLanguage();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const liveTodayEntry = buildDayHistoryEntry(
    shop.todayStats,
    shop.dailyNews.headline,
    shop.reputation,
    shop.cash
  );
  const combinedHistory = [
    ...shop.history.filter((h) => h.day !== shop.day),
    liveTodayEntry,
  ];
  const rank = getShopRank(shop);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2">
      <div className="w-full max-w-4xl max-h-[95dvh] flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#171F2A] p-3 sm:p-4 shadow-2xl">
        <div className="shrink-0 flex items-center justify-between gap-2 mb-2.5">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10.5px] font-semibold text-amber-400">
              <BarChart3 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {bi('CANLI DÜKKAN İSTATİSTİKLERİ', 'LIVE SHOP ANALYTICS')} · {rank}
              </span>
            </div>
            <h2 className="font-display text-base sm:text-xl font-extrabold text-slate-50 leading-tight truncate">
              {bi(
                `Gün ${shop.day} Performans & Kasa Analizi`,
                `Day ${shop.day} Performance & Cashflow`
              )}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={bi('İstatistik panelini kapat', 'Close analytics modal')}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#202B3A] text-slate-300 hover:text-slate-50 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden mb-2.5">
          <DayAnalyticsChart history={combinedHistory} todayStats={shop.todayStats} />
        </div>

        <div className="shrink-0 grid grid-cols-4 gap-2 text-[11px] tabular-nums">
          <div className="rounded-xl border border-white/8 bg-[#121822] p-2">
            <div className="text-[10px] text-slate-400 truncate">
              {bi('Toplam Satış', 'Total Sold')}
            </div>
            <div className="font-mono text-sm sm:text-base font-bold text-emerald-400">
              {shop.totalPhonesSold} {bi('cihaz', 'phones')}
            </div>
          </div>
          <div className="rounded-xl border border-white/8 bg-[#121822] p-2">
            <div className="text-[10px] text-slate-400 truncate">
              {bi('Rekor Satış', 'Best Deal')}
            </div>
            <div className="font-mono text-sm sm:text-base font-bold text-amber-400">
              {shop.bestSingleDealProfit > 0
                ? `+${formatTRY(shop.bestSingleDealProfit)}`
                : '—'}
            </div>
          </div>
          <div className="rounded-xl border border-white/8 bg-[#121822] p-2">
            <div className="text-[10px] text-slate-400 truncate">
              {bi('Yakalanan Kusur', 'Defects')}
            </div>
            <div className="font-mono text-sm sm:text-base font-bold text-slate-100">
              {shop.totalDefectsExposed}
            </div>
          </div>
          <div className="rounded-xl border border-white/8 bg-[#121822] p-2">
            <div className="text-[10px] text-slate-400 truncate">
              {bi('Çay İkramı', 'Teas Served')}
            </div>
            <div className="font-mono text-sm sm:text-base font-bold text-slate-100">
              {shop.totalTeasServed}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface EndModalProps {
  mode: 'VICTORY' | 'GAME_OVER';
  state: ShopState;
  onRestart: () => void;
  onContinueEndless?: () => void;
  onTriggerPrestige?: () => void;
}

export const EndModal: React.FC<EndModalProps> = ({
  mode,
  state,
  onRestart,
  onContinueEndless,
  onTriggerPrestige,
}) => {
  const { bi } = useLanguage();
  const isVictory = mode === 'VICTORY';
  const rank = getShopRank(state);
  const prestigePointsPreview = getPrestigePointsEarned(state);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/82 p-2.5">
      <div className="w-full max-w-md max-h-[95dvh] overflow-hidden rounded-2xl border border-white/10 bg-[#171F2A] p-4 sm:p-5 text-center shadow-2xl">
        <div className="mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#222E3E] border border-white/10">
          {isVictory ? (
            <Award className="w-6 h-6 text-amber-400" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-rose-400" />
          )}
        </div>

        <div className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-amber-400 mb-0.5">
          {rank}
        </div>
        <h2 className="font-display text-2xl font-extrabold text-slate-50 mb-1.5">
          {isVictory
            ? bi('GSM İmparatoru Oldun!', 'You Built a GSM Empire!')
            : bi('Kepenk İndirildi', 'Shutters Closed')}
        </h2>
        <p className="text-xs text-slate-300 leading-snug mb-3.5">
          {isVictory
            ? bi(
                `GSM Showroom’unu açıp ${formatTRY(VICTORY_CASH_GOAL)} kasa ve ${VICTORY_REPUTATION_GOAL}+ itibar hedefine ulaşarak sektörün zirvesine çıktın!`,
                `You opened your Grand GSM Showroom and reached ${formatTRY(VICTORY_CASH_GOAL)} cash with ${VICTORY_REPUTATION_GOAL}+ reputation!`
              )
            : bi(
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
              {bi('Son Kasa', 'Final Cash')}
            </div>
            <div className="font-mono text-base font-bold text-amber-400">
              {formatTRY(state.cash)}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isVictory && onTriggerPrestige && prestigePointsPreview > 0 && (
            <button
              type="button"
              onClick={onTriggerPrestige}
              className="w-full rounded-xl bg-emerald-500 px-4 py-2 text-xs sm:text-sm font-extrabold text-slate-950 hover:bg-emerald-400 transition-colors whitespace-nowrap cursor-pointer"
            >
              {bi(
                `Prestij Sıfırlaması Yap (+${prestigePointsPreview} PP · Kalıcı Avantajlar)`,
                `Prestige Reset (+${prestigePointsPreview} PP · Permanent Perks)`
              )}
            </button>
          )}
          {isVictory && onContinueEndless && (
            <button
              type="button"
              onClick={onContinueEndless}
              className="flex-1 rounded-xl bg-amber-500 px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 hover:bg-amber-400 transition-colors whitespace-nowrap cursor-pointer"
            >
              {bi('Sonsuz Mod', 'Endless Mode')}
            </button>
          )}
          <button
            type="button"
            onClick={onRestart}
            className={`flex-1 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-colors whitespace-nowrap cursor-pointer ${
              isVictory
                ? 'border border-white/15 bg-[#202B3A] text-slate-200 hover:bg-[#2A374A]'
                : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
            }`}
          >
            {bi('Tekrar Oyna', 'Play Again')}
          </button>
        </div>
      </div>
    </div>
  );
};
