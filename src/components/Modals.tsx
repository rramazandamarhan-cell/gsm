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
  getShopRank,
} from '../game/engine';
import { DayFinancials, ShopState } from '../game/types';
import { DayAnalyticsChart } from './DayAnalyticsChart';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onTitle: () => void;
  onOpenCompliance?: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onTitle,
  onOpenCompliance,
}) => (
  <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/75 p-3 sm:p-4 overflow-y-auto pasaj-scroll">
    <div className="w-full max-w-sm my-auto max-h-[92dvh] overflow-y-auto pasaj-scroll rounded-2xl border border-white/10 bg-[#171F2A] p-5 shadow-2xl">
      <h2 className="font-display text-2xl font-bold text-slate-50 mb-1">
        GSM Simulator Duraklatıldı
      </h2>
      <p className="text-sm text-slate-400 mb-6">
        İlerlemen otomatik kaydedildi. İstediğin zaman devam edebilirsin.
      </p>

      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={onResume}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400 transition-colors whitespace-nowrap cursor-pointer"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>Devam Et</span>
        </button>

        {onOpenCompliance && (
          <button
            type="button"
            onClick={onOpenCompliance}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-500/35 bg-sky-500/12 px-5 py-2.5 text-sm font-semibold text-sky-200 hover:bg-sky-500/20 transition-colors whitespace-nowrap cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>Ayarlar, Başarımlar & Mağaza Merkezi</span>
          </button>
        )}

        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#202B3A] px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-[#2A374A] transition-colors whitespace-nowrap cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-slate-400" />
          <span>Sıfırdan Başla</span>
        </button>

        <button
          type="button"
          onClick={onTitle}
          className="rounded-xl px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors whitespace-nowrap cursor-pointer"
        >
          Ana Menüye Dön
        </button>
      </div>
    </div>
  </div>
);

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
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/82 p-2.5 sm:p-4 overflow-y-auto pasaj-scroll">
      <div className="w-full max-w-4xl my-auto max-h-[92dvh] overflow-y-auto pasaj-scroll rounded-2xl border border-white/10 bg-[#171F2A] p-4 sm:p-6 shadow-2xl">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-0.5">
              <TrendingUp className="w-4 h-4" />
              <span>GÜN SONU İSTATİSTİK & KASA RAPORU</span>
              <span aria-hidden="true" className="text-white/25">·</span>
              <span className="text-slate-300">{rank}</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-50">
              Gün {stats.day} Kapanış Özeti
            </h2>
          </div>

          <div className="flex items-center gap-4 text-right tabular-nums">
            <div>
              <div className="text-[11px] text-slate-400">Günlük Net Nakit</div>
              <div
                className={`font-mono text-xl font-extrabold ${
                  netToday >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {netToday >= 0 ? '+' : ''}
                {formatTRY(netToday)}
              </div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <div className="text-[11px] text-slate-400">İtibar Değişimi</div>
              <div
                className={`font-mono text-base font-bold ${
                  stats.reputationDelta >= 0 ? 'text-amber-400' : 'text-rose-400'
                }`}
              >
                {stats.reputationDelta >= 0 ? '+' : ''}
                {stats.reputationDelta.toFixed(2)} ★
              </div>
            </div>
          </div>
        </div>

        {/* Interactive D3 Analytics Panel */}
        <div className="mb-4">
          <DayAnalyticsChart history={chartHistory} todayStats={stats} />
        </div>

        {/* Lower 2-Column Breakdown: Financial Ledger + Career Records */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-5">
          {/* Ledger */}
          <div className="md:col-span-7 rounded-xl border border-white/8 bg-[#121822] p-4">
            <div className="text-xs font-semibold text-slate-300 mb-2.5">
              Günlük Kasa Defteri
            </div>
            <div className="space-y-1.5 text-xs tabular-nums">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">
                  Satış Geliri ({stats.phonesSold} cihaz)
                </span>
                <span className="font-mono font-semibold text-emerald-400">
                  +{formatTRY(stats.salesRevenue)}
                </span>
              </div>
              {stats.accessoryRevenue > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">
                    Aksesuar Reyon Geliri ({stats.accessoriesSold} adet)
                  </span>
                  <span className="font-mono font-semibold text-emerald-400">
                    +{formatTRY(stats.accessoryRevenue)}
                  </span>
                </div>
              )}
              {stats.serviceRevenue > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Acil Tamir Servis Geliri</span>
                  <span className="font-mono font-semibold text-emerald-400">
                    +{formatTRY(stats.serviceRevenue)}
                  </span>
                </div>
              )}
              {(stats.branchIncome ?? 0) > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Şube, Müze & Pasaj Pasif Geliri</span>
                  <span className="font-mono font-semibold text-emerald-400">
                    +{formatTRY(stats.branchIncome)}
                  </span>
                </div>
              )}
              {stats.questRewards > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Görev, Hikaye & Seri Ödülleri</span>
                  <span className="font-mono font-semibold text-sky-300">
                    +{formatTRY(stats.questRewards)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-400">
                  2. El Cihaz Alımları ({stats.phonesBought} cihaz)
                </span>
                <span className="font-mono text-slate-200">
                  -{formatTRY(stats.buySpend)}
                </span>
              </div>
              {stats.wholesaleSpend > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Sıfır Kutu & Aksesuar Toptan Alım</span>
                  <span className="font-mono text-slate-200">
                    -{formatTRY(stats.wholesaleSpend)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Atölye & Parça Masrafı</span>
                <span className="font-mono text-slate-200">
                  -{formatTRY(stats.repairSpend)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Günlük Dükkan Kirası</span>
                <span className="font-mono text-rose-400">
                  -{formatTRY(stats.rentCost)}
                </span>
              </div>
              {stats.staffWages > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Ekip Maaşları</span>
                  <span className="font-mono text-rose-400">
                    -{formatTRY(stats.staffWages)}
                  </span>
                </div>
              )}
              {(stats.posCommission ?? 0) > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">POS Banka Komisyonu</span>
                  <span className="font-mono text-rose-400">
                    -{formatTRY(stats.posCommission)}
                  </span>
                </div>
              )}
              {(stats.loanPayments ?? 0) > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Banka Kredi Taksitleri</span>
                  <span className="font-mono text-rose-400">
                    -{formatTRY(stats.loanPayments)}
                  </span>
                </div>
              )}
              {(stats.taxPaid ?? 0) > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Haftalık Vergi & Elektrik Faturası</span>
                  <span className="font-mono text-rose-400">
                    -{formatTRY(stats.taxPaid)}
                  </span>
                </div>
              )}
              {(stats.salesTaxPaid ?? 0) > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Satış Vergisi (KDV / Gelir Kesintisi)</span>
                  <span className="font-mono text-rose-400">
                    -{formatTRY(stats.salesTaxPaid)}
                  </span>
                </div>
              )}
            </div>

            {stats.passiveAccessoryNote && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-sky-500/25 bg-sky-500/10 p-2.5 text-xs text-sky-200">
                <TrendingUp className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>{stats.passiveAccessoryNote}</span>
              </div>
            )}

            {stats.autoRepairedNote && (
              <div className="mt-2.5 flex items-start gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-2.5 text-xs text-emerald-200">
                <Wrench className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{stats.autoRepairedNote}</span>
              </div>
            )}
          </div>

          {/* Esnaf Career & Today Records */}
          <div className="md:col-span-5 rounded-xl border border-white/8 bg-[#121822] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold text-slate-300">
                  Esnaf Karnesi & Rekorlar
                </span>
                <Trophy className="w-4 h-4 text-amber-400" />
              </div>

              <div className="space-y-2 text-xs tabular-nums">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Güncel Kasa</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {formatTRY(shop.cash)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Dükkan İtibarı</span>
                  <span className="font-mono font-bold text-amber-400">
                    {shop.reputation.toFixed(1)} / 5.0 ★
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Rekor Tek Satış Kârı</span>
                  <span className="font-mono font-semibold text-slate-100">
                    {shop.bestSingleDealProfit > 0
                      ? `+${formatTRY(shop.bestSingleDealProfit)}`
                      : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-slate-400">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>Yakalanan Gizli Kusur</span>
                  </span>
                  <span className="font-mono font-semibold text-slate-100">
                    {shop.totalDefectsExposed}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-slate-400">
                    <Coffee className="w-3.5 h-3.5 text-amber-400" />
                    <span>İkram Edilen Çay</span>
                  </span>
                  <span className="font-mono font-semibold text-slate-100">
                    {shop.totalTeasServed} bardak
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/8 flex items-center justify-between text-[11px] text-slate-400 tabular-nums">
              <span>Bugün kaçan müşteri: {stats.dealsLost}</span>
              <span>Toplam satış: {shop.totalPhonesSold}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onNextDay}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-slate-950 hover:bg-amber-400 transition-colors whitespace-nowrap cursor-pointer"
        >
          <Newspaper className="w-4 h-4" />
          <span>Gün {stats.day + 1} Sabah Gazetesini Aç & Kepenk Kaldır</span>
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
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/80 p-2.5 sm:p-4 overflow-y-auto pasaj-scroll">
      <div className="w-full max-w-4xl my-auto max-h-[90dvh] overflow-y-auto pasaj-scroll rounded-2xl border border-white/10 bg-[#171F2A] p-4 sm:p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-0.5">
              <BarChart3 className="w-4 h-4" />
              <span>CANLI DÜKKAN İSTATİSTİKLERİ · {rank}</span>
            </div>
            <h2 className="font-display text-2xl font-extrabold text-slate-50">
              Gün {shop.day} Performans & Kasa Analizi
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="İstatistik panelini kapat"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#202B3A] text-slate-300 hover:text-slate-50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-4">
          <DayAnalyticsChart history={combinedHistory} todayStats={shop.todayStats} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs tabular-nums">
          <div className="rounded-xl border border-white/8 bg-[#121822] p-3">
            <div className="text-slate-400 mb-0.5">Toplam Satış</div>
            <div className="font-mono text-lg font-bold text-emerald-400">
              {shop.totalPhonesSold} cihaz
            </div>
          </div>
          <div className="rounded-xl border border-white/8 bg-[#121822] p-3">
            <div className="text-slate-400 mb-0.5">Rekor Tek Satış</div>
            <div className="font-mono text-lg font-bold text-amber-400">
              {shop.bestSingleDealProfit > 0
                ? `+${formatTRY(shop.bestSingleDealProfit)}`
                : '—'}
            </div>
          </div>
          <div className="rounded-xl border border-white/8 bg-[#121822] p-3">
            <div className="text-slate-400 mb-0.5">Yakalanan Kusur</div>
            <div className="font-mono text-lg font-bold text-slate-100">
              {shop.totalDefectsExposed}
            </div>
          </div>
          <div className="rounded-xl border border-white/8 bg-[#121822] p-3">
            <div className="text-slate-400 mb-0.5">İkram Edilen Çay</div>
            <div className="font-mono text-lg font-bold text-slate-100">
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
}

export const EndModal: React.FC<EndModalProps> = ({
  mode,
  state,
  onRestart,
  onContinueEndless,
}) => {
  const isVictory = mode === 'VICTORY';
  const rank = getShopRank(state);

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/82 p-3 sm:p-4 overflow-y-auto pasaj-scroll">
      <div className="w-full max-w-md my-auto max-h-[92dvh] overflow-y-auto pasaj-scroll rounded-2xl border border-white/10 bg-[#171F2A] p-5 sm:p-7 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#222E3E] border border-white/10">
          {isVictory ? (
            <Award className="w-7 h-7 text-amber-400" />
          ) : (
            <AlertTriangle className="w-7 h-7 text-rose-400" />
          )}
        </div>

        <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 mb-1">
          {rank}
        </div>
        <h2 className="font-display text-3xl font-extrabold text-slate-50 mb-2">
          {isVictory ? 'GSM İmparatoru Oldun!' : 'Kepenk İndirildi'}
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          {isVictory
            ? `GSM Showroom’unu açıp ${formatTRY(VICTORY_CASH_GOAL)} kasa ve ${VICTORY_REPUTATION_GOAL}+ itibar hedefine ulaşarak sektörün zirvesine çıktın!`
            : 'Günlük kira ve maaşları karşılayacak nakit ve stok kalmadı. Yeni bir stratejiyle tekrar dükkan açabilirsin.'}
        </p>

        <div className="grid grid-cols-3 gap-3 border-y border-white/10 py-4 mb-6 tabular-nums">
          <div>
            <div className="text-xs text-slate-400 mb-0.5">Toplam Gün</div>
            <div className="font-mono text-lg font-bold text-slate-100">{state.day}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-0.5">Satılan Cihaz</div>
            <div className="font-mono text-lg font-bold text-emerald-400">
              {state.totalPhonesSold}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-0.5">Son Kasa</div>
            <div className="font-mono text-lg font-bold text-amber-400">
              {formatTRY(state.cash)}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {isVictory && onContinueEndless && (
            <button
              type="button"
              onClick={onContinueEndless}
              className="w-full rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400 transition-colors whitespace-nowrap cursor-pointer"
            >
              Sonsuz Modda Devam Et
            </button>
          )}
          <button
            type="button"
            onClick={onRestart}
            className={`w-full rounded-xl px-6 py-3 text-sm font-bold transition-colors whitespace-nowrap cursor-pointer ${
              isVictory
                ? 'border border-white/15 bg-[#202B3A] text-slate-200 hover:bg-[#2A374A]'
                : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
            }`}
          >
            Tekrar Oyna
          </button>
        </div>
      </div>
    </div>
  );
};
