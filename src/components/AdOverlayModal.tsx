import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { ActiveWebAdSession } from '../game/adService';
import { useLanguage } from '../game/i18n';

interface AdOverlayModalProps {
  session: ActiveWebAdSession;
}

export const AdOverlayModal: React.FC<AdOverlayModalProps> = ({ session }) => {
  const { lang, bi } = useLanguage();
  const [secondsLeft, setSecondsLeft] = useState(session.durationSec);

  const isConfirm = session.mode === 'REWARDED_CONFIRM';
  const isRewarded = session.mode === 'REWARDED';

  useEffect(() => {
    if (isConfirm) return;
    setSecondsLeft(session.durationSec);
    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [session.id, session.durationSec, isConfirm]);

  const titleText = lang === 'en' ? session.rewardLabelEn : session.rewardLabelTr;
  const detailText = lang === 'en' ? session.detailEn : session.detailTr;

  // Step 1: Explicit Rewarded Ad Confirmation Screen
  if (isConfirm) {
    return (
      <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/82 backdrop-blur-sm p-2">
        <motion.div
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-[330px] rounded-xl border border-amber-400/45 bg-[#121A26] p-2.5 sm:p-3 shadow-2xl space-y-2"
        >
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5">
            <div className="inline-flex items-center gap-1">
              <span className="rounded bg-amber-500/20 border border-amber-400/40 px-1.5 py-0.5 font-mono text-[8.5px] font-extrabold text-amber-300 uppercase">
                {bi('ÖDÜLLÜ REKLAM ONAYI', 'REWARDED AD CONFIRMATION')}
              </span>
              {session.multiplierBadge && (
                <span className="rounded bg-emerald-500/20 border border-emerald-400/40 px-1.5 py-0.5 font-mono text-[8.5px] font-extrabold text-emerald-300">
                  {session.multiplierBadge}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => session.resolve(false)}
              aria-label={bi('Kapat', 'Close')}
              className="rounded-lg border border-white/10 bg-[#1B2432] p-1 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <div className="rounded-lg border border-emerald-400/25 bg-gradient-to-br from-[#192334] via-[#131B28] to-[#13241C] p-2.5 text-center space-y-1.5">
            <div className="mx-auto w-9 h-9 rounded-xl border border-amber-400/40 bg-amber-500/15 flex items-center justify-center">
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="font-display text-xs sm:text-[13px] font-extrabold text-slate-50 leading-snug">
              {titleText}
            </div>
            <p className="text-[10px] text-slate-300 leading-snug">
              {detailText ||
                bi(
                  'Kısa bir ödüllü video izleyerek bu bonusu hemen etkinleştirmek ister misin? Video tamamlandığında çarpan ve ödül anında dükkan kasana işlenir.',
                  'Watch a short rewarded video to activate this bonus right away? Once completed, your multiplier and cash reward apply immediately.'
                )}
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-[9.5px] text-slate-400 px-0.5">
            <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>
              {bi(
                'Tamamen isteğe bağlıdır. İzlemeyi yarıda bırakırsan ödül tanımlanmaz.',
                'Completely optional. Reward is granted only when the ad completes.'
              )}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => session.resolve(false)}
              className="rounded-lg border border-white/15 bg-[#1B2432] px-2.5 py-1.5 text-[10.5px] font-bold text-slate-300 hover:bg-[#253143] hover:text-white cursor-pointer"
            >
              {bi('Vazgeç', 'Cancel')}
            </button>
            <button
              type="button"
              onClick={() => session.resolve(true)}
              className="inline-flex items-center justify-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1.5 text-[10.5px] font-extrabold text-slate-950 hover:bg-amber-400 cursor-pointer"
            >
              <PlayCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{bi('Onayla & İzle', 'Confirm & Watch')}</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Step 2: Active Ad Playback Overlay (Web/PWA fallback or Interstitial)
  const completed = secondsLeft === 0;
  const progressPct = Math.round(
    ((session.durationSec - secondsLeft) / Math.max(1, session.durationSec)) * 100
  );

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/90 backdrop-blur-md p-2">
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-[330px] rounded-xl border border-amber-400/40 bg-[#121924] p-2.5 sm:p-3 shadow-2xl space-y-2"
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5">
          <div className="flex items-center gap-1">
            <span className="rounded bg-amber-500/20 border border-amber-400/40 px-1.5 py-0.5 font-mono text-[8.5px] font-extrabold text-amber-300 uppercase">
              {isRewarded
                ? bi('SPONSORLU ÖDÜL', 'REWARDED VIDEO')
                : bi('REKLAM ARASI', 'AD BREAK')}
            </span>
            {session.multiplierBadge && (
              <span className="rounded bg-emerald-500/20 border border-emerald-400/40 px-1.5 py-0.5 font-mono text-[8.5px] font-extrabold text-emerald-300">
                {session.multiplierBadge}
              </span>
            )}
          </div>

          {completed ? (
            <button
              type="button"
              onClick={() => session.resolve(true)}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-2 py-1 text-[10px] font-extrabold text-slate-950 hover:bg-emerald-400 cursor-pointer"
            >
              <CheckCircle2 className="w-3 h-3" />
              {isRewarded ? bi('Ödülü Al', 'Claim Reward') : bi('Devam Et', 'Continue')}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => session.resolve(!isRewarded)}
              className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-[#1B2432] px-2 py-0.5 text-[10px] font-bold text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="w-3 h-3" />
              {isRewarded ? bi('İptal', 'Skip (No Reward)') : `${secondsLeft}s`}
            </button>
          )}
        </div>

        {/* Visual Ad Card */}
        <div className="rounded-lg border border-white/10 bg-gradient-to-br from-[#1A2434] via-[#131A26] to-[#1D1710] p-2.5 text-center space-y-1.5">
          <div className="mx-auto w-9 h-9 rounded-xl border border-amber-400/40 bg-amber-500/15 flex items-center justify-center">
            {completed ? (
              <Sparkles className="w-4 h-4 text-emerald-400" />
            ) : (
              <PlayCircle className="w-4 h-4 text-amber-400 animate-pulse" />
            )}
          </div>
          <div className="font-display text-xs font-extrabold text-slate-50">
            {titleText}
          </div>
          <p className="text-[10px] text-slate-400 leading-snug">
            {completed
              ? isRewarded
                ? bi(
                    'Video tamamlandı! Çarpan ve ödülün dükkan hesabına aktarılmaya hazır.',
                    'Video completed! Your multiplier & reward are ready to claim.'
                  )
                : detailText ||
                  bi(
                    'Kısa reklam arası tamamlandı. Gün sonu raporuna geçebilirsin.',
                    'Short break finished. Tap Continue to view your end-of-day report.'
                  )
              : isRewarded
              ? bi(
                  `Ödüllü video oynatılıyor — ${secondsLeft} sn kaldı. Süre dolduğunda ödülün hemen tanımlanır.`,
                  `Playing rewarded video — ${secondsLeft}s remaining. Your reward unlocks as soon as it finishes.`
                )
              : bi(
                  `Kısa reklam arası — ${secondsLeft} sn sonra gün sonu raporuna devam edebilirsin.`,
                  `Short ad break — continue to your end-of-day summary in ${secondsLeft}s.`
                )}
          </p>

          {/* Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1.5">
            <div
              className={`h-full transition-all duration-700 ${
                completed ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-[9.5px] text-slate-400">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            {bi('Düşük frekans · 5-7 günde bir ara', 'Low frequency · 5-7 day pacing')}
          </span>
          <span className="font-mono text-amber-300 font-bold">
            {completed ? bi('Hazır ✓', 'Ready ✓') : `${secondsLeft}s`}
          </span>
        </div>
      </motion.div>
    </div>
  );
};
