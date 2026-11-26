import React, { useState } from 'react';
import { Clock, Coins, PlayCircle } from 'lucide-react';
import { showRewardedAd } from '../game/adService';
import { formatTRY } from '../game/engine';
import { useLanguage } from '../game/i18n';
import { OfflineEarningsSummary } from '../game/types';

interface OfflineEarningsModalProps {
  summary: OfflineEarningsSummary;
  onClaim: (amount: number, doubled: boolean) => void;
}

export const OfflineEarningsModal: React.FC<OfflineEarningsModalProps> = ({
  summary,
  onClaim,
}) => {
  const { bi } = useLanguage();
  const [watchingAd, setWatchingAd] = useState(false);
  const [adNotice, setAdNotice] = useState<string | null>(null);

  const hours = Math.floor(summary.minutesAway / 60);
  const mins = summary.minutesAway % 60;
  const timeText =
    hours > 0
      ? bi(`${hours} saat ${mins} dk`, `${hours}h ${mins}m`)
      : bi(`${summary.minutesAway} dk`, `${summary.minutesAway}m`);

  const handleRewardedDoubleClaim = async () => {
    setWatchingAd(true);
    setAdNotice(null);
    const completed = await showRewardedAd({
      placement: 'OFFLINE_2X_REWARDED',
      rewardLabelTr: `Çevrimdışı Pasif Gelir 2x (+${formatTRY(summary.baseCash * 2)})`,
      rewardLabelEn: `Offline Passive Income 2x (+${formatTRY(summary.baseCash * 2)})`,
      detailTr: `Kısa bir ödüllü reklam izleyerek biriken ${formatTRY(summary.baseCash)} pasif gelirini 2 katına (+${formatTRY(summary.baseCash * 2)}) çıkarmak istiyor musun?`,
      detailEn: `Watch a short rewarded ad to double your ${formatTRY(summary.baseCash)} offline passive earnings to +${formatTRY(summary.baseCash * 2)}?`,
      multiplierBadge: '2x PASİF',
    });
    setWatchingAd(false);
    if (completed) {
      onClaim(summary.baseCash * 2, true);
    } else {
      setAdNotice(
        bi(
          'Reklam izlenmedi veya iptal edildi — dilersen tekrar onaylayabilir ya da normal tutarı alabilirsin.',
          'Ad was cancelled or skipped — watch again for 2x or claim your base amount.'
        )
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-2">
      <div className="w-full max-w-md max-h-[94dvh] flex flex-col overflow-hidden rounded-2xl border border-amber-500/40 bg-[#151C26] p-3.5 sm:p-4 shadow-2xl">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 mb-1">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>
            {bi(`Hoş Geldin Usta · ${timeText} Yoktun`, `Welcome Back · Away ${timeText}`)}
          </span>
        </div>

        <h2 className="font-display text-lg sm:text-xl font-bold text-slate-50 leading-tight">
          {bi('Sen Yokken Dükkan Çalıştı!', 'Your Shop Kept Earning!')}
        </h2>
        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
          {bi(
            'Ekibin, şubelerin ve pasif satışlarından biriken kasa geliri hazır.',
            'Passive income from your staff, branches, and off-hours sales is ready.'
          )}
        </p>

        <div className="my-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-center">
          <div className="text-[10.5px] text-emerald-200 font-medium">
            {bi('Biriken Gece Geliri', 'Offline Cash Accumulated')}
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-0.5 tabular-nums">
            +{formatTRY(summary.baseCash)}
          </div>
        </div>

        <div className="space-y-1 mb-2.5">
          {summary.sources.slice(0, 3).map((src, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 text-[11px] text-slate-300 bg-[#10161F] rounded-lg px-2.5 py-1.5 border border-white/6 truncate"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{src}</span>
            </div>
          ))}
        </div>

        {adNotice && (
          <div className="mb-2 rounded-lg border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-[10px] text-amber-200 text-center">
            {adNotice}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={watchingAd}
            onClick={() => onClaim(summary.baseCash, false)}
            className="rounded-xl border border-white/15 bg-[#1D2736] px-3 py-2 text-xs font-bold text-slate-200 hover:bg-[#273549] cursor-pointer tabular-nums whitespace-nowrap"
          >
            {bi('Kasaya Al', 'Claim')} ({formatTRY(summary.baseCash)})
          </button>
          <button
            type="button"
            disabled={watchingAd}
            onClick={() => void handleRewardedDoubleClaim()}
            className="inline-flex items-center justify-center gap-1 rounded-xl bg-amber-500 px-3 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-70 cursor-pointer tabular-nums whitespace-nowrap"
          >
            <PlayCircle className="w-3.5 h-3.5 shrink-0" />
            <span>
              {watchingAd
                ? bi('Reklam Açılıyor...', 'Loading Ad...')
                : `${bi('Reklam İzle · 2x', 'Watch Ad · 2x')} (${formatTRY(summary.baseCash * 2)})`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
