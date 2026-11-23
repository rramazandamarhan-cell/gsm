import React, { useState } from 'react';
import { Clock, Coins, Sparkles } from 'lucide-react';
import { formatTRY } from '../game/engine';
import { OfflineEarningsSummary } from '../game/types';

interface OfflineEarningsModalProps {
  summary: OfflineEarningsSummary;
  onClaim: (amount: number, doubled: boolean) => void;
}

export const OfflineEarningsModal: React.FC<OfflineEarningsModalProps> = ({
  summary,
  onClaim,
}) => {
  const [boosting, setBoosting] = useState(false);

  const hours = Math.floor(summary.minutesAway / 60);
  const mins = summary.minutesAway % 60;
  const timeText =
    hours > 0 ? `${hours} saat ${mins} dakika` : `${summary.minutesAway} dakika`;

  const handleBoostClaim = () => {
    setBoosting(true);
    window.setTimeout(() => {
      onClaim(summary.baseCash * 2, true);
    }, 650);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-amber-500/40 bg-[#151C26] p-6 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 mb-2">
          <Clock className="w-4 h-4" />
          <span>Hoş Geldin Usta · {timeText} Yoktun</span>
        </div>

        <h2 className="font-display text-2xl font-bold text-slate-50">
          Sen Yokken Dükkan Çalışmaya Devam Etti!
        </h2>
        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
          Ekibin, şubelerin ve gece aksesuar siparişlerinden kasana biriken pasif gelir hazır.
        </p>

        <div className="my-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
          <div className="text-xs text-emerald-200 font-medium">Biriken Gece Geliri</div>
          <div className="font-mono text-4xl font-extrabold text-emerald-400 mt-1 tabular-nums">
            +{formatTRY(summary.baseCash)}
          </div>
        </div>

        <div className="space-y-1.5 mb-5">
          {summary.sources.map((src, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 text-xs text-slate-300 bg-[#10161F] rounded-lg px-3 py-2 border border-white/6"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{src}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={boosting}
            onClick={() => onClaim(summary.baseCash, false)}
            className="rounded-xl border border-white/15 bg-[#1D2736] px-4 py-3 text-xs font-bold text-slate-200 hover:bg-[#273549] cursor-pointer tabular-nums"
          >
            Kasaya Al ({formatTRY(summary.baseCash)})
          </button>
          <button
            type="button"
            disabled={boosting}
            onClick={handleBoostClaim}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-4 py-3 text-xs font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-70 cursor-pointer tabular-nums"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {boosting
                ? 'Esnaf 2x Aktif...'
                : `2x Bereket Al (${formatTRY(summary.baseCash * 2)})`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
