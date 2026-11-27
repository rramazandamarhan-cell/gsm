import React, { useEffect, useMemo, useState } from 'react';
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Award,
  BarChart3,
  Check,
  Flame,
  Lock,
  ShoppingBag,
  TrendingUp,
  Trophy,
  X,
} from 'lucide-react';
import { STORE_ACHIEVEMENTS } from '../game/catalog';
import {
  buildDayHistoryEntry,
  formatTRY,
  getShopRank,
  getWeekdayInfo,
} from '../game/engine';
import { getLocalizedAchievement, useLanguage } from '../game/i18n';
import { ShopState } from '../game/types';

interface AnalyticsModalProps {
  shop: ShopState;
  onClose: () => void;
}

type AnalyticsTab = 'WEEKLY' | 'ACHIEVEMENTS';
type WeeklyChartMetric = 'REVENUE_PROFIT' | 'UNITS_CASH';

interface WeeklyChartDatum {
  day: number;
  label: string;
  headline: string;
  revenue: number;
  expenses: number;
  netProfit: number;
  phonesSold: number;
  cashEnd: number;
  reputation: number;
}

function formatCompactTRY(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M₺`;
  if (abs >= 1_000) return `${sign}${Math.round(abs / 1_000)}K₺`;
  return `${sign}${Math.round(abs)}₺`;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  shop,
  onClose,
}) => {
  const { lang, bi } = useLanguage();
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('WEEKLY');
  const [chartMetric, setChartMetric] = useState<WeeklyChartMetric>('REVENUE_PROFIT');

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

  const rank = getShopRank(shop);

  // Combine past closed days with live current day and take last 7 days for weekly trend
  const weeklyData: WeeklyChartDatum[] = useMemo(() => {
    const liveTodayEntry = buildDayHistoryEntry(
      shop.todayStats,
      shop.dailyNews.headline,
      shop.reputation,
      shop.cash
    );
    const combined = [
      ...shop.history.filter((h) => h.day !== shop.day),
      liveTodayEntry,
    ].sort((a, b) => a.day - b.day);

    const last7 = combined.slice(-7);
    return last7.map((entry) => {
      const wd = getWeekdayInfo(entry.day);
      return {
        day: entry.day,
        label: `G${entry.day} ${lang === 'en' ? wd.shortEn : wd.shortTr}`,
        headline: entry.headline,
        revenue: Math.round(entry.revenue),
        expenses: Math.round(entry.expenses),
        netProfit: Math.round(entry.netCashFlow),
        phonesSold: entry.phonesSold,
        cashEnd: Math.round(entry.cashEnd),
        reputation: Number(entry.reputationEnd.toFixed(2)),
      };
    });
  }, [shop, lang]);

  const weeklyTotals = useMemo(() => {
    const revenue = weeklyData.reduce((acc, d) => acc + d.revenue, 0);
    const netProfit = weeklyData.reduce((acc, d) => acc + d.netProfit, 0);
    const phonesSold = weeklyData.reduce((acc, d) => acc + d.phonesSold, 0);
    const avgDailyNet =
      weeklyData.length > 0 ? Math.round(netProfit / weeklyData.length) : 0;
    return { revenue, netProfit, phonesSold, avgDailyNet };
  }, [weeklyData]);

  // Today's revenue channel breakdown for Donut Chart
  const revenueMixData = useMemo(() => {
    const raw = [
      {
        name: bi('Telefon Satışı', 'Phone Sales'),
        value: Math.max(0, Math.round(shop.todayStats.salesRevenue)),
        color: '#10B981',
      },
      {
        name: bi('Aksesuar', 'Accessories'),
        value: Math.max(0, Math.round(shop.todayStats.accessoryRevenue)),
        color: '#38BDF8',
      },
      {
        name: bi('Teknik Servis', 'Repair Service'),
        value: Math.max(0, Math.round(shop.todayStats.serviceRevenue)),
        color: '#F59E0B',
      },
      {
        name: bi('Şube & Pasif', 'Branches & Passive'),
        value: Math.max(
          0,
          Math.round(
            (shop.todayStats.branchIncome ?? 0) + (shop.todayStats.questRewards ?? 0)
          )
        ),
        color: '#A78BFA',
      },
    ];
    return raw.filter((item) => item.value > 0);
  }, [shop.todayStats, bi]);

  // Store achievements progress & points
  const achievementStats = useMemo(() => {
    const items = STORE_ACHIEVEMENTS.map((ach) => ({
      ach,
      unlocked: ach.check(shop),
      loc: getLocalizedAchievement(ach, lang),
    }));
    const unlockedCount = items.filter((i) => i.unlocked).length;
    const totalCount = items.length;
    const earnedPoints = items.reduce(
      (sum, i) => sum + (i.unlocked ? i.ach.points : 0),
      0
    );
    const maxPoints = items.reduce((sum, i) => sum + i.ach.points, 0);
    const pct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
    return { items, unlockedCount, totalCount, earnedPoints, maxPoints, pct };
  }, [shop, lang]);

  const achievementPieData = useMemo(
    () => [
      {
        name: bi('Kazanıldı', 'Unlocked'),
        value: achievementStats.unlockedCount,
        color: '#10B981',
      },
      {
        name: bi('Kilitli', 'Locked'),
        value: Math.max(0, achievementStats.totalCount - achievementStats.unlockedCount),
        color: '#253143',
      },
    ],
    [achievementStats, bi]
  );

  // Career sales & mastery channels bar chart
  const salesChannelsData = useMemo(() => {
    const usedPhones = Math.max(0, shop.totalPhonesSold - shop.totalBrandNewSold);
    return [
      {
        name: bi('2. El Cihaz', 'Used Phones'),
        count: usedPhones,
        color: '#10B981',
      },
      {
        name: bi('Sıfır Cihaz', 'Brand New'),
        count: shop.totalBrandNewSold,
        color: '#38BDF8',
      },
      {
        name: bi('Aksesuar', 'Accessories'),
        count: shop.totalAccessoriesSold,
        color: '#A78BFA',
      },
      {
        name: bi('Tamir', 'Repaired'),
        count: shop.totalPhonesRepaired,
        color: '#F59E0B',
      },
      {
        name: bi('Kusur Avı', 'Defects'),
        count: shop.totalDefectsExposed,
        color: '#FB7185',
      },
    ];
  }, [shop, bi]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/82 p-2">
      <div className="w-full max-w-3xl max-h-[86dvh] flex flex-col overflow-hidden rounded-xl border border-white/12 bg-[#141C27] shadow-2xl">
        {/* Header + Tabs */}
        <div className="shrink-0 flex flex-wrap items-center justify-between gap-1.5 border-b border-white/10 bg-[#10161F] px-3 py-1.5">
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-400">
              <BarChart3 className="w-3 h-3 shrink-0" />
              <span className="truncate">
                {bi('CANLI SATIŞ & BAŞARIM ANALİTİĞİ', 'LIVE SALES & ACHIEVEMENT ANALYTICS')} · {rank}
              </span>
            </div>
            <h2 className="font-display text-xs sm:text-sm font-extrabold text-slate-50 leading-tight truncate">
              {bi(
                `Gün ${shop.day} Haftalık Satış, Kâr Trendi & Başarımlar`,
                `Day ${shop.day} Weekly Sales, Profit Trend & Achievements`
              )}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="inline-flex items-center gap-0.5 rounded-lg border border-white/10 bg-[#182230] p-0.5">
              <button
                type="button"
                onClick={() => setActiveTab('WEEKLY')}
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'WEEKLY'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3 h-3" />
                <span>{bi('Haftalık Trend', 'Weekly Trend')}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ACHIEVEMENTS')}
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'ACHIEVEMENTS'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Trophy className="w-3 h-3" />
                <span>
                  {bi('Başarımlar', 'Achievements')} ({achievementStats.unlockedCount}/
                  {achievementStats.totalCount})
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label={bi('İstatistik panelini kapat', 'Close analytics modal')}
              className="flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-[#202B3A] text-slate-300 hover:text-slate-50 cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-2">
          {/* Top KPI Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 tabular-nums">
            <div className="rounded-lg border border-emerald-500/25 bg-[#101822] px-2.5 py-1.5">
              <div className="text-[9px] text-slate-400 flex items-center justify-between">
                <span>{bi('Toplam Kariyer Kârı', 'Total Career Profit')}</span>
                <TrendingUp className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="font-mono text-xs sm:text-[13px] font-extrabold text-emerald-400 mt-0.5">
                {formatTRY(shop.totalProfitEarned)}
              </div>
              <div className="text-[9.5px] text-slate-400">
                {bi('7g Ort:', '7d Avg:')}{' '}
                <span className="font-mono text-slate-200">
                  {weeklyTotals.avgDailyNet >= 0 ? '+' : ''}
                  {formatTRY(weeklyTotals.avgDailyNet)}
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-sky-500/25 bg-[#101822] px-2.5 py-1.5">
              <div className="text-[9px] text-slate-400 flex items-center justify-between">
                <span>{bi('Toplam Satış Hacmi', 'Total Sales Volume')}</span>
                <ShoppingBag className="w-3 h-3 text-sky-400" />
              </div>
              <div className="font-mono text-xs sm:text-[13px] font-extrabold text-sky-300 mt-0.5">
                {shop.totalPhonesSold} {bi('cihaz', 'phones')}
              </div>
              <div className="text-[9px] text-slate-400">
                +{shop.totalAccessoriesSold} {bi('aksesuar', 'accessories')} ·{' '}
                {shop.totalBrandNewSold} {bi('sıfır', 'new')}
              </div>
            </div>

            <div className="rounded-lg border border-amber-500/25 bg-[#101822] px-2.5 py-1.5">
              <div className="text-[9px] text-slate-400 flex items-center justify-between">
                <span>{bi('Rekor Satış & Seri', 'Best Deal & Streak')}</span>
                <Flame className="w-3 h-3 text-amber-400" />
              </div>
              <div className="font-mono text-xs sm:text-[13px] font-extrabold text-amber-400 mt-0.5">
                {shop.bestSingleDealProfit > 0
                  ? `+${formatTRY(shop.bestSingleDealProfit)}`
                  : '—'}
              </div>
              <div className="text-[9px] text-slate-400">
                {bi('En İyi Seri:', 'Best Streak:')}{' '}
                <span className="font-mono text-amber-200">{shop.bestDealStreak}x</span>
              </div>
            </div>

            <div className="rounded-lg border border-purple-500/25 bg-[#101822] px-2.5 py-1.5">
              <div className="text-[9px] text-slate-400 flex items-center justify-between">
                <span>{bi('Mağaza Başarımları', 'Store Achievements')}</span>
                <Award className="w-3 h-3 text-purple-400" />
              </div>
              <div className="font-mono text-xs sm:text-[13px] font-extrabold text-purple-300 mt-0.5">
                {achievementStats.unlockedCount} / {achievementStats.totalCount}{' '}
                <span className="text-[10.5px] text-emerald-400">(%{achievementStats.pct})</span>
              </div>
              <div className="text-[9px] text-slate-400">
                {achievementStats.earnedPoints} / {achievementStats.maxPoints} P
              </div>
            </div>
          </div>

          {activeTab === 'WEEKLY' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
              {/* Main Recharts Weekly Sales & Profit Trend Chart */}
              <div className="lg:col-span-8 rounded-xl border border-white/10 bg-[#101822] p-3 flex flex-col">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div>
                    <div className="text-xs font-extrabold text-slate-100">
                      {bi(
                        'Haftalık Satış & Net Kâr Trendi (Son 7 Gün)',
                        'Weekly Sales & Net Profit Trend (Last 7 Days)'
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {bi(
                        `7 Günlük Ciro: ${formatTRY(weeklyTotals.revenue)} · Net Kâr: ${weeklyTotals.netProfit >= 0 ? '+' : ''}${formatTRY(weeklyTotals.netProfit)} · ${weeklyTotals.phonesSold} cihaz`,
                        `7d Revenue: ${formatTRY(weeklyTotals.revenue)} · Net Profit: ${weeklyTotals.netProfit >= 0 ? '+' : ''}${formatTRY(weeklyTotals.netProfit)} · ${weeklyTotals.phonesSold} phones`
                      )}
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-[#182230] p-0.5">
                    <button
                      type="button"
                      onClick={() => setChartMetric('REVENUE_PROFIT')}
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold cursor-pointer ${
                        chartMetric === 'REVENUE_PROFIT'
                          ? 'bg-emerald-500 text-slate-950'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {bi('Ciro & Kâr (₺)', 'Rev & Profit')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartMetric('UNITS_CASH')}
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold cursor-pointer ${
                        chartMetric === 'UNITS_CASH'
                          ? 'bg-sky-500 text-slate-950'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {bi('Adet & Kasa', 'Units & Cash')}
                    </button>
                  </div>
                </div>

                <div className="w-full h-[170px] sm:h-[185px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartMetric === 'REVENUE_PROFIT' ? (
                      <ComposedChart
                        data={weeklyData}
                        margin={{ top: 10, right: 12, left: 0, bottom: 2 }}
                      >
                        <defs>
                          <linearGradient id="netProfitGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.38} />
                            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.07)"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="label"
                          tick={{ fill: '#94A3B8', fontSize: 10 }}
                          axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
                          tickLine={false}
                        />
                        <YAxis
                          tickFormatter={formatCompactTRY}
                          tick={{ fill: '#94A3B8', fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                          width={54}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload || payload.length === 0) return null;
                            const d = payload[0].payload as WeeklyChartDatum;
                            return (
                              <div className="rounded-xl border border-amber-400/35 bg-[#0C121B]/95 px-3 py-2 text-[11px] shadow-xl">
                                <div className="font-bold text-amber-300 mb-0.5">
                                  {bi(`Gün ${d.day}`, `Day ${d.day}`)} · {d.phonesSold}{' '}
                                  {bi('satış', 'sold')}
                                </div>
                                <div className="text-[10px] text-slate-400 mb-1.5 max-w-[200px] truncate">
                                  {d.headline}
                                </div>
                                <div className="space-y-0.5 font-mono">
                                  <div className="flex items-center justify-between gap-4 text-emerald-400">
                                    <span>{bi('Satış Cirosu:', 'Revenue:')}</span>
                                    <strong>{formatTRY(d.revenue)}</strong>
                                  </div>
                                  <div className="flex items-center justify-between gap-4 text-rose-400">
                                    <span>{bi('Giderler:', 'Expenses:')}</span>
                                    <strong>-{formatTRY(d.expenses)}</strong>
                                  </div>
                                  <div className="flex items-center justify-between gap-4 text-amber-300 border-t border-white/10 pt-0.5">
                                    <span>{bi('Net Kâr:', 'Net Profit:')}</span>
                                    <strong>
                                      {d.netProfit >= 0 ? '+' : ''}
                                      {formatTRY(d.netProfit)}
                                    </strong>
                                  </div>
                                </div>
                              </div>
                            );
                          }}
                        />
                        <Bar
                          dataKey="revenue"
                          name={bi('Ciro', 'Revenue')}
                          fill="#10B981"
                          fillOpacity={0.82}
                          radius={[4, 4, 0, 0]}
                          maxBarSize={26}
                        />
                        <Bar
                          dataKey="expenses"
                          name={bi('Gider', 'Expenses')}
                          fill="#F43F5E"
                          fillOpacity={0.62}
                          radius={[4, 4, 0, 0]}
                          maxBarSize={26}
                        />
                        <Area
                          type="monotone"
                          dataKey="netProfit"
                          name={bi('Net Kâr', 'Net Profit')}
                          stroke="#F59E0B"
                          strokeWidth={2.5}
                          fill="url(#netProfitGrad)"
                          dot={{ r: 3.5, fill: '#F59E0B', stroke: '#0F141B', strokeWidth: 1.5 }}
                          activeDot={{ r: 5.5, fill: '#FBBF24', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                        />
                      </ComposedChart>
                    ) : (
                      <ComposedChart
                        data={weeklyData}
                        margin={{ top: 10, right: 12, left: 0, bottom: 2 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.07)"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="label"
                          tick={{ fill: '#94A3B8', fontSize: 10 }}
                          axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
                          tickLine={false}
                        />
                        <YAxis
                          yAxisId="left"
                          allowDecimals={false}
                          tick={{ fill: '#38BDF8', fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                          width={32}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          tickFormatter={formatCompactTRY}
                          tick={{ fill: '#10B981', fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                          width={54}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload || payload.length === 0) return null;
                            const d = payload[0].payload as WeeklyChartDatum;
                            return (
                              <div className="rounded-xl border border-sky-400/35 bg-[#0C121B]/95 px-3 py-2 text-[11px] shadow-xl font-mono">
                                <div className="font-bold text-sky-300 mb-1">
                                  {bi(`Gün ${d.day}`, `Day ${d.day}`)}
                                </div>
                                <div className="flex justify-between gap-4 text-sky-300">
                                  <span>{bi('Satılan Cihaz:', 'Phones Sold:')}</span>
                                  <strong>{d.phonesSold}</strong>
                                </div>
                                <div className="flex justify-between gap-4 text-emerald-400">
                                  <span>{bi('Gün Sonu Kasa:', 'Cash End:')}</span>
                                  <strong>{formatTRY(d.cashEnd)}</strong>
                                </div>
                                <div className="flex justify-between gap-4 text-amber-300">
                                  <span>{bi('İtibar:', 'Reputation:')}</span>
                                  <strong>{d.reputation.toFixed(1)}★</strong>
                                </div>
                              </div>
                            );
                          }}
                        />
                        <Bar
                          yAxisId="left"
                          dataKey="phonesSold"
                          name={bi('Satılan Cihaz', 'Phones Sold')}
                          fill="#38BDF8"
                          fillOpacity={0.85}
                          radius={[4, 4, 0, 0]}
                          maxBarSize={28}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="cashEnd"
                          name={bi('Kasa Büyümesi', 'Cash Balance')}
                          stroke="#10B981"
                          strokeWidth={2.5}
                          dot={{ r: 3.5, fill: '#10B981', stroke: '#0F141B', strokeWidth: 1.5 }}
                        />
                      </ComposedChart>
                    )}
                  </ResponsiveContainer>
                </div>

                {/* Compact Legend */}
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[10px] text-slate-300">
                  {chartMetric === 'REVENUE_PROFIT' ? (
                    <>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                        {bi('Günlük Ciro', 'Daily Revenue')}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/80" />
                        {bi('Giderler', 'Expenses')}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-3 h-0.5 bg-amber-400" />
                        {bi('Net Kâr Trendi', 'Net Profit Trend')}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-sky-400" />
                        {bi('Satılan Cihaz Adedi', 'Phones Sold')}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-3 h-0.5 bg-emerald-400" />
                        {bi('Gün Sonu Kasa (₺)', 'Cash Balance')}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Right Column: Today's Revenue Mix PieChart */}
              <div className="lg:col-span-4 rounded-xl border border-white/10 bg-[#101822] p-3 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-extrabold text-slate-100">
                    {bi('Bugünkü Gelir Dağılımı', "Today's Revenue Mix")}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {bi('Satış, aksesuar, tamir ve şube payı', 'Phones, accessories, repairs & branches')}
                  </div>
                </div>

                {revenueMixData.length > 0 ? (
                  <div className="w-full h-[135px] my-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={revenueMixData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={34}
                          outerRadius={56}
                          paddingAngle={3}
                          stroke="none"
                        >
                          {revenueMixData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(val: unknown) => formatTRY(Number(val ?? 0))}
                          contentStyle={{
                            backgroundColor: '#0C121B',
                            border: '1px solid rgba(255,255,255,0.14)',
                            borderRadius: '10px',
                            fontSize: '11px',
                            color: '#F8FAFC',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center py-8 text-center text-[11px] text-slate-400">
                    {bi(
                      'Bugün ilk satışını veya tamirini yaptığında gelir grafiği canlı dolacak.',
                      'Revenue chart updates live as soon as you close your first deal today.'
                    )}
                  </div>
                )}

                <div className="space-y-1 text-[10.5px] tabular-nums">
                  {revenueMixData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between gap-2 rounded-lg bg-[#16202D] px-2 py-1"
                    >
                      <span className="inline-flex items-center gap-1.5 text-slate-200 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="truncate">{item.name}</span>
                      </span>
                      <span className="font-mono font-bold text-slate-100 shrink-0">
                        {formatTRY(item.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ACHIEVEMENTS & SALES CHANNELS TAB */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
              {/* Left: Achievement Completion Donut + Career Sales Channels Bar Chart */}
              <div className="lg:col-span-5 space-y-2.5">
                <div className="rounded-xl border border-white/10 bg-[#101822] p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs font-extrabold text-slate-100">
                      {bi('Başarım Tamamlama Oranı', 'Achievement Completion')}
                    </div>
                    <span className="font-mono text-xs font-extrabold text-amber-400">
                      {achievementStats.earnedPoints} / {achievementStats.maxPoints} P
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative w-[112px] h-[112px] shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={achievementPieData}
                            dataKey="value"
                            cx="50%"
                            cy="50%"
                            innerRadius={34}
                            outerRadius={50}
                            startAngle={90}
                            endAngle={-270}
                            stroke="none"
                          >
                            {achievementPieData.map((entry) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-mono text-sm font-extrabold text-emerald-400">
                          %{achievementStats.pct}
                        </span>
                        <span className="text-[9px] text-slate-400">
                          {achievementStats.unlockedCount}/{achievementStats.totalCount}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-[11px] flex-1">
                      <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1.5 flex items-center justify-between">
                        <span className="text-emerald-200 font-semibold">
                          {bi('Açılan Başarım', 'Unlocked')}
                        </span>
                        <strong className="font-mono text-emerald-300">
                          {achievementStats.unlockedCount}
                        </strong>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-[#182230] px-2.5 py-1.5 flex items-center justify-between">
                        <span className="text-slate-300 font-semibold">
                          {bi('Kalan Hedef', 'Remaining')}
                        </span>
                        <strong className="font-mono text-slate-200">
                          {achievementStats.totalCount - achievementStats.unlockedCount}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Career Sales Channels Horizontal Recharts BarChart */}
                <div className="rounded-xl border border-white/10 bg-[#101822] p-3">
                  <div className="text-xs font-extrabold text-slate-100 mb-1.5">
                    {bi('Toplam Satış & Esnaf Performans Kanalları', 'Career Sales & Craft Channels')}
                  </div>
                  <div className="w-full h-[120px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={salesChannelsData}
                        layout="vertical"
                        margin={{ top: 2, right: 16, left: 4, bottom: 2 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.06)"
                          horizontal={false}
                        />
                        <XAxis
                          type="number"
                          allowDecimals={false}
                          tick={{ fill: '#94A3B8', fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fill: '#CBD5E1', fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                          width={74}
                        />
                        <Tooltip
                          cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                          contentStyle={{
                            backgroundColor: '#0C121B',
                            border: '1px solid rgba(255,255,255,0.14)',
                            borderRadius: '10px',
                            fontSize: '11px',
                            color: '#F8FAFC',
                          }}
                        />
                        <Bar dataKey="count" name={bi('Adet', 'Count')} radius={[0, 4, 4, 0]} maxBarSize={16}>
                          {salesChannelsData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Right: Store Achievements List Grid */}
              <div className="lg:col-span-7 rounded-xl border border-white/10 bg-[#101822] p-3 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-extrabold text-slate-100">
                    {bi('Mağaza Başarım Rozetleri', 'Store Achievement Badges')}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {bi('Google Play Games / Game Center Uyumlu', 'Play Games / Game Center Ready')}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
                  {achievementStats.items.map(({ ach, unlocked, loc }) => (
                    <div
                      key={ach.id}
                      className={`rounded-xl border p-2.5 flex flex-col justify-between transition-colors ${
                        unlocked
                          ? 'border-emerald-500/40 bg-emerald-500/10'
                          : 'border-white/8 bg-[#17202D] opacity-85'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-display text-xs font-bold text-slate-100 leading-tight">
                          {loc.title}
                        </div>
                        <span
                          className={`font-mono text-[10px] font-extrabold shrink-0 ${
                            unlocked ? 'text-emerald-400' : 'text-slate-500'
                          }`}
                        >
                          +{ach.points}P
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 mt-1 leading-snug">
                        {loc.description}
                      </p>
                      <div className="mt-1.5 text-[10px] font-bold">
                        {unlocked ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400">
                            <Check className="w-3 h-3" />
                            <span>{bi('Kazanıldı', 'Unlocked')}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-500">
                            <Lock className="w-3 h-3" />
                            <span>{bi('Devam Ediyor', 'In Progress')}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
