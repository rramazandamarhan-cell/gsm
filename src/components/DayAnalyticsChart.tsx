import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { formatTRY } from '../game/engine';
import { DayFinancials, DayHistoryEntry } from '../game/types';

interface DayAnalyticsChartProps {
  history: DayHistoryEntry[];
  todayStats: DayFinancials;
}

type ChartMode = 'FINANCE' | 'REPUTATION';

interface TooltipState {
  x: number;
  y: number;
  entry: DayHistoryEntry;
}

export const DayAnalyticsChart: React.FC<DayAnalyticsChartProps> = ({
  history,
  todayStats,
}) => {
  const [mode, setMode] = useState<ChartMode>('FINANCE');
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const mainSvgRef = useRef<SVGSVGElement | null>(null);
  const donutSvgRef = useRef<SVGSVGElement | null>(null);

  // Build D3 Main Multi-Day Trend / Bar Chart
  useEffect(() => {
    const svgEl = mainSvgRef.current;
    if (!svgEl || history.length === 0) return;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const width = 500;
    const height = 215;
    const margin = { top: 18, right: 20, bottom: 30, left: 56 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Show last 8 days for clean readable spacing
    const data = history.slice(-8);
    const xBand = d3
      .scaleBand<string>()
      .domain(data.map((d) => `G${d.day}`))
      .range([0, innerW])
      .padding(0.28);

    if (mode === 'FINANCE') {
      const maxVal = Math.max(
        5000,
        d3.max(data, (d) => Math.max(d.revenue, d.expenses, Math.abs(d.netCashFlow))) ?? 10000
      );
      const minVal = Math.min(0, d3.min(data, (d) => d.netCashFlow) ?? 0);

      const yScale = d3
        .scaleLinear()
        .domain([minVal * 1.15, maxVal * 1.12])
        .nice()
        .range([innerH, 0]);

      // Horizontal subtle gridlines
      g.append('g')
        .attr('class', 'grid')
        .call(
          d3
            .axisLeft(yScale)
            .ticks(4)
            .tickSize(-innerW)
            .tickFormat(() => '')
        )
        .call((sel) => sel.select('.domain').remove())
        .call((sel) =>
          sel.selectAll('line').attr('stroke', 'rgba(255,255,255,0.07)')
        );

      // Zero baseline
      const zeroY = yScale(0);
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerW)
        .attr('y1', zeroY)
        .attr('y2', zeroY)
        .attr('stroke', 'rgba(255,255,255,0.22)')
        .attr('stroke-width', 1);

      // Grouped bars: Revenue (emerald) & Expenses (slate-rose)
      const subWidth = Math.max(8, Math.min(20, xBand.bandwidth() / 2 - 2));

      data.forEach((d) => {
        const bx = xBand(`G${d.day}`) ?? 0;
        const centerOffset = (xBand.bandwidth() - subWidth * 2 - 3) / 2;

        // Revenue Bar
        g.append('rect')
          .attr('x', bx + centerOffset)
          .attr('y', yScale(d.revenue))
          .attr('width', subWidth)
          .attr('height', Math.max(2, zeroY - yScale(d.revenue)))
          .attr('rx', 3)
          .attr('fill', '#10B981')
          .attr('fill-opacity', 0.85);

        // Expenses Bar
        g.append('rect')
          .attr('x', bx + centerOffset + subWidth + 3)
          .attr('y', yScale(d.expenses))
          .attr('width', subWidth)
          .attr('height', Math.max(2, zeroY - yScale(d.expenses)))
          .attr('rx', 3)
          .attr('fill', '#F43F5E')
          .attr('fill-opacity', 0.72);
      });

      // Net Cash Flow Line (Amber)
      const netLine = d3
        .line<DayHistoryEntry>()
        .x((d) => (xBand(`G${d.day}`) ?? 0) + xBand.bandwidth() / 2)
        .y((d) => yScale(d.netCashFlow))
        .curve(d3.curveMonotoneX);

      if (data.length > 1) {
        g.append('path')
          .datum(data)
          .attr('fill', 'none')
          .attr('stroke', '#F59E0B')
          .attr('stroke-width', 2.4)
          .attr('d', netLine);
      }

      // Interactive Nodes
      g.selectAll('circle.net-node')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'net-node')
        .attr('cx', (d) => (xBand(`G${d.day}`) ?? 0) + xBand.bandwidth() / 2)
        .attr('cy', (d) => yScale(d.netCashFlow))
        .attr('r', 4.5)
        .attr('fill', '#F59E0B')
        .attr('stroke', '#131A24')
        .attr('stroke-width', 2);

      // Y Axis
      g.append('g')
        .call(
          d3
            .axisLeft(yScale)
            .ticks(4)
            .tickFormat((v) => {
              const num = Number(v);
              if (Math.abs(num) >= 1000) return `${(num / 1000).toFixed(0)}k`;
              return `${num}`;
            })
        )
        .call((sel) => sel.select('.domain').remove())
        .call((sel) => sel.selectAll('line').remove())
        .call((sel) =>
          sel
            .selectAll('text')
            .attr('fill', '#94A3B8')
            .attr('font-size', '10px')
            .attr('font-family', 'JetBrains Mono, monospace')
        );
    } else {
      // REPUTATION (1..5) Area Curve + Daily Sales Bars
      const yRep = d3.scaleLinear().domain([1, 5]).range([innerH, 0]);
      const maxSales = Math.max(3, d3.max(data, (d) => d.phonesSold) ?? 3);
      const ySales = d3.scaleLinear().domain([0, maxSales * 1.4]).range([innerH, 0]);

      // Horizontal Gridlines for Reputation
      g.append('g')
        .call(
          d3
            .axisLeft(yRep)
            .tickValues([1, 2, 3, 4, 5])
            .tickSize(-innerW)
            .tickFormat(() => '')
        )
        .call((sel) => sel.select('.domain').remove())
        .call((sel) =>
          sel.selectAll('line').attr('stroke', 'rgba(255,255,255,0.07)')
        );

      // Gradient for Reputation Area
      const defs = svg.append('defs');
      const grad = defs
        .append('linearGradient')
        .attr('id', 'repAreaGrad')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');
      grad.append('stop').attr('offset', '0%').attr('stop-color', '#F59E0B').attr('stop-opacity', 0.34);
      grad.append('stop').attr('offset', '100%').attr('stop-color', '#F59E0B').attr('stop-opacity', 0.02);

      // Sales Volume Bars (Background subtle emerald bars)
      const barW = Math.min(22, xBand.bandwidth() * 0.52);
      g.selectAll('rect.sales-bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', (d) => (xBand(`G${d.day}`) ?? 0) + (xBand.bandwidth() - barW) / 2)
        .attr('y', (d) => ySales(d.phonesSold))
        .attr('width', barW)
        .attr('height', (d) => Math.max(2, innerH - ySales(d.phonesSold)))
        .attr('rx', 4)
        .attr('fill', '#10B981')
        .attr('fill-opacity', 0.32);

      // Reputation Area + Line
      if (data.length > 1) {
        const area = d3
          .area<DayHistoryEntry>()
          .x((d) => (xBand(`G${d.day}`) ?? 0) + xBand.bandwidth() / 2)
          .y0(innerH)
          .y1((d) => yRep(d.reputationEnd))
          .curve(d3.curveMonotoneX);

        g.append('path').datum(data).attr('fill', 'url(#repAreaGrad)').attr('d', area);

        const repLine = d3
          .line<DayHistoryEntry>()
          .x((d) => (xBand(`G${d.day}`) ?? 0) + xBand.bandwidth() / 2)
          .y((d) => yRep(d.reputationEnd))
          .curve(d3.curveMonotoneX);

        g.append('path')
          .datum(data)
          .attr('fill', 'none')
          .attr('stroke', '#F59E0B')
          .attr('stroke-width', 2.5)
          .attr('d', repLine);
      }

      g.selectAll('circle.rep-node')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', (d) => (xBand(`G${d.day}`) ?? 0) + xBand.bandwidth() / 2)
        .attr('cy', (d) => yRep(d.reputationEnd))
        .attr('r', 5)
        .attr('fill', '#F59E0B')
        .attr('stroke', '#131A24')
        .attr('stroke-width', 2);

      // Left Axis (Reputation ★)
      g.append('g')
        .call(
          d3
            .axisLeft(yRep)
            .tickValues([1, 2, 3, 4, 5])
            .tickFormat((v) => `${v}.0 ★`)
        )
        .call((sel) => sel.select('.domain').remove())
        .call((sel) => sel.selectAll('line').remove())
        .call((sel) =>
          sel
            .selectAll('text')
            .attr('fill', '#FBBF24')
            .attr('font-size', '10px')
            .attr('font-family', 'JetBrains Mono, monospace')
        );
    }

    // Shared X Axis
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(xBand))
      .call((sel) => sel.select('.domain').attr('stroke', 'rgba(255,255,255,0.12)'))
      .call((sel) => sel.selectAll('line').remove())
      .call((sel) =>
        sel
          .selectAll('text')
          .attr('fill', '#CBD5E1')
          .attr('font-size', '10.5px')
          .attr('font-family', 'JetBrains Mono, monospace')
      );

    // Transparent Hover Hit Columns for crisp interactive tooltip
    g.selectAll('rect.hover-hit')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d) => xBand(`G${d.day}`) ?? 0)
      .attr('y', 0)
      .attr('width', xBand.bandwidth())
      .attr('height', innerH)
      .attr('fill', 'transparent')
      .style('cursor', 'pointer')
      .on('mouseenter', function (_event, d) {
        const cx = (xBand(`G${d.day}`) ?? 0) + xBand.bandwidth() / 2 + margin.left;
        setTooltip({ x: cx, y: 12, entry: d });
      })
      .on('mouseleave', () => setTooltip(null));
  }, [history, mode]);

  // Build D3 Today's Financial Breakdown Donut Chart
  useEffect(() => {
    const svgEl = donutSvgRef.current;
    if (!svgEl) return;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const size = 132;
    const radius = size / 2;
    const g = svg.append('g').attr('transform', `translate(${radius},${radius})`);

    const slices = [
      { label: 'Satış', value: todayStats.salesRevenue, color: '#10B981' },
      {
        label: 'Servis & Görev',
        value: todayStats.serviceRevenue + todayStats.questRewards,
        color: '#38BDF8',
      },
      { label: 'Alım', value: todayStats.buySpend, color: '#F59E0B' },
      { label: 'Tamir', value: todayStats.repairSpend, color: '#A78BFA' },
      {
        label: 'Kira & Maaş',
        value: todayStats.rentCost + todayStats.staffWages,
        color: '#F43F5E',
      },
    ].filter((s) => s.value > 0);

    const safeSlices =
      slices.length > 0
        ? slices
        : [{ label: 'Kira', value: 1, color: '#334155' }];

    const pie = d3
      .pie<{ label: string; value: number; color: string }>()
      .value((d) => d.value)
      .padAngle(0.04)
      .sort(null);

    const arc = d3
      .arc<d3.PieArcDatum<{ label: string; value: number; color: string }>>()
      .innerRadius(radius - 20)
      .outerRadius(radius - 4)
      .cornerRadius(4);

    g.selectAll('path')
      .data(pie(safeSlices))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d) => d.data.color);

    const totalTurnover =
      todayStats.salesRevenue +
      todayStats.serviceRevenue +
      todayStats.questRewards;

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', -4)
      .attr('fill', '#94A3B8')
      .attr('font-size', '9px')
      .attr('font-family', 'Plus Jakarta Sans, sans-serif')
      .text('GÜN GELİRİ');

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 14)
      .attr('fill', '#F8FAFC')
      .attr('font-size', '12px')
      .attr('font-weight', '700')
      .attr('font-family', 'JetBrains Mono, monospace')
      .text(totalTurnover >= 1000 ? `${(totalTurnover / 1000).toFixed(1)}k ₺` : `${totalTurnover} ₺`);
  }, [todayStats]);

  return (
    <div className="rounded-xl border border-white/10 bg-[#111722] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="font-display text-sm font-bold text-slate-100">
            D3 Performans & İtibar Analizi
          </h3>
          <div className="text-[11px] text-slate-400">
            {mode === 'FINANCE'
              ? 'Yeşil: Gelir · Kırmızı: Gider · Kehribar Çizgi: Net Kâr'
              : 'Kehribar Eğri: Dükkan İtibarı (★) · Yeşil Sütun: Satış Adedi'}
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-[#1A2331] p-0.5 border border-white/8">
          <button
            type="button"
            onClick={() => setMode('FINANCE')}
            className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              mode === 'FINANCE'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-300 hover:text-slate-50'
            }`}
          >
            Kazanç & Nakit
          </button>
          <button
            type="button"
            onClick={() => setMode('REPUTATION')}
            className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              mode === 'REPUTATION'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-300 hover:text-slate-50'
            }`}
          >
            İtibar & Satış
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Main D3 Trend SVG */}
        <div className="md:col-span-8 relative">
          <svg
            ref={mainSvgRef}
            viewBox="0 0 500 215"
            className="w-full h-auto overflow-visible"
            role="img"
            aria-label="Gün sonu finansal ve itibar analiz grafiği"
          />

          {/* Interactive Hover Tooltip */}
          {tooltip && (
            <div
              className="pointer-events-none absolute z-20 rounded-lg border border-white/15 bg-[#0D131C]/95 px-3 py-2 text-[11px] shadow-xl tabular-nums"
              style={{
                left: `${Math.min(72, Math.max(8, (tooltip.x / 500) * 100))}%`,
                top: `${tooltip.y}px`,
                transform: 'translateX(-50%)',
              }}
            >
              <div className="font-bold text-amber-400 mb-0.5">
                Gün {tooltip.entry.day}
              </div>
              <div className="text-emerald-300">
                Gelir: +{formatTRY(tooltip.entry.revenue)}
              </div>
              <div className="text-rose-300">
                Gider: -{formatTRY(tooltip.entry.expenses)}
              </div>
              <div className="text-slate-100 font-semibold">
                Net: {tooltip.entry.netCashFlow >= 0 ? '+' : ''}
                {formatTRY(tooltip.entry.netCashFlow)}
              </div>
              <div className="text-slate-300 mt-0.5">
                Satış: {tooltip.entry.phonesSold} · İtibar: {tooltip.entry.reputationEnd.toFixed(1)} ★
              </div>
            </div>
          )}
        </div>

        {/* Side D3 Donut Breakdown */}
        <div className="md:col-span-4 flex flex-col items-center border-t md:border-t-0 md:border-l border-white/8 pt-3 md:pt-0 md:pl-3">
          <svg
            ref={donutSvgRef}
            width="132"
            height="132"
            viewBox="0 0 132 132"
            role="img"
            aria-label="Günlük nakit dağılımı"
          />
          <div className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1 text-[10.5px] text-slate-300">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Satış
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-sky-400" />
              Servis/Görev
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Alım
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              Kira/Maaş
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
