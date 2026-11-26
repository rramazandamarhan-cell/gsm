import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Award, BadgeCheck, Landmark, Sparkles } from 'lucide-react';
import { formatTRY } from '../game/engine';
import { useLanguage } from '../game/i18n';

export interface DebtClearedCelebrationData {
  id: number;
  loanName: string;
  amountCleared: number;
  prestigeBonusAdded: number;
  totalDebtFreePrestige: number;
  allLoansZero: boolean;
}

interface DebtClearedOverlayProps {
  data: DebtClearedCelebrationData | null;
  onDismiss: () => void;
}

const SPARKLE_PARTICLES = [
  { id: 0, x: -118, y: -74, delay: 0.04, color: 'text-emerald-300' },
  { id: 1, x: 112, y: -80, delay: 0.1, color: 'text-amber-300' },
  { id: 2, x: -132, y: 18, delay: 0.16, color: 'text-amber-400' },
  { id: 3, x: 126, y: 26, delay: 0.08, color: 'text-emerald-400' },
  { id: 4, x: -78, y: 92, delay: 0.18, color: 'text-emerald-300' },
  { id: 5, x: 84, y: 88, delay: 0.12, color: 'text-amber-300' },
  { id: 6, x: 0, y: -102, delay: 0.06, color: 'text-amber-200' },
  { id: 7, x: -48, y: -96, delay: 0.14, color: 'text-emerald-200' },
];

export const DebtClearedOverlay: React.FC<DebtClearedOverlayProps> = ({
  data,
  onDismiss,
}) => {
  const { bi } = useLanguage();

  useEffect(() => {
    if (!data) return;
    const timer = window.setTimeout(() => {
      onDismiss();
    }, 3800);
    return () => window.clearTimeout(timer);
  }, [data, onDismiss]);

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          key={data.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onDismiss}
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[76] flex items-center justify-center bg-black/68 backdrop-blur-sm p-4 cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -12 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            className="relative w-full max-w-sm rounded-2xl border-2 border-emerald-400/70 bg-gradient-to-b from-[#112620] via-[#101C22] to-[#0D141C] p-5 text-center shadow-[0_0_65px_rgba(16,185,129,0.42)] overflow-visible"
          >
            {/* Bursting celebratory sparkles */}
            {SPARKLE_PARTICLES.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
                animate={{
                  opacity: [0, 1, 0],
                  x: p.x,
                  y: p.y,
                  scale: [0.5, 1.15, 0.7],
                  rotate: [0, 35, 70],
                }}
                transition={{
                  duration: 1.25,
                  delay: p.delay,
                  ease: 'easeOut',
                }}
                className={`pointer-events-none absolute left-1/2 top-1/2 -ml-2 -mt-2 ${p.color}`}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
            ))}

            {/* Glowing expanding shockwave ring */}
            <motion.div
              initial={{ opacity: 0.75, scale: 0.65 }}
              animate={{ opacity: 0, scale: 1.75 }}
              transition={{ duration: 0.95, ease: 'easeOut' }}
              className="pointer-events-none absolute left-1/2 top-14 -ml-12 h-24 w-24 rounded-full border-2 border-emerald-400"
            />

            {/* Bank Seal Emblem */}
            <div className="relative mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-emerald-400/75 bg-emerald-500/20 shadow-[0_0_32px_rgba(16,185,129,0.5)]">
              <Landmark className="w-8 h-8 text-emerald-300" />
              <motion.div
                initial={{ scale: 0, rotate: -25 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.12, type: 'spring', stiffness: 520, damping: 18 }}
                className="absolute -right-2 -bottom-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-slate-950 shadow-lg"
              >
                <BadgeCheck className="w-4 h-4 stroke-[2.5]" />
              </motion.div>
            </div>

            {/* Slamming Official Paid-Off Stamp */}
            <motion.div
              initial={{ scale: 1.65, opacity: 0, rotate: -14 }}
              animate={{ scale: 1, opacity: 1, rotate: -3 }}
              transition={{ type: 'spring', stiffness: 480, damping: 20, delay: 0.05 }}
              className="inline-block rounded-lg border-2 border-emerald-400 bg-emerald-500/18 px-3.5 py-1 font-display text-lg sm:text-xl font-black tracking-wider text-emerald-300 shadow-[0_0_24px_rgba(16,185,129,0.4)] mb-2"
            >
              {data.allLoansZero
                ? bi('MALİ BORÇ BİTTİ!', 'DEBT FREE!')
                : bi('KREDİ KAPATILDI!', 'LOAN PAID OFF!')}
            </motion.div>

            <div className="text-xs font-extrabold text-slate-100">
              {data.loanName}
            </div>
            <div className="mt-1 font-mono text-xs font-bold text-emerald-300 tabular-nums">
              {bi('Kalan Borç: 0 ₺', 'Remaining Balance: 0 ₺')} ·{' '}
              <span className="text-slate-300">
                {bi(`${formatTRY(data.amountCleared)} ödendi`, `${formatTRY(data.amountCleared)} cleared`)}
              </span>
            </div>

            {/* Permanent Prestige Bonus Pill */}
            <motion.div
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-3 rounded-xl border border-amber-400/50 bg-amber-500/15 px-3 py-2 flex items-center justify-between gap-2 text-left"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Award className="w-5 h-5 text-amber-300 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[11px] font-extrabold text-amber-200 leading-tight">
                    {bi(
                      `+${data.prestigeBonusAdded} Kalıcı Dükkan Prestiji!`,
                      `+${data.prestigeBonusAdded} Permanent Shop Prestige!`
                    )}
                  </div>
                  <div className="text-[10px] text-amber-100/80 truncate">
                    {data.allLoansZero
                      ? bi(
                          'Borçsuz esnaf itibarı kalıcı olarak işlendi',
                          'Debt-free merchant standing permanently locked in'
                        )
                      : bi(
                          'Kredi sicilin güçlendi · Toplam borç bonusu arttı',
                          'Credit standing upgraded permanently'
                        )}
                  </div>
                </div>
              </div>
              <span className="font-mono text-xs font-black text-amber-300 shrink-0">
                +{data.totalDebtFreePrestige}
              </span>
            </motion.div>

            <div className="mt-3 text-[10.5px] text-slate-400">
              {bi('Devam etmek için dokun', 'Tap anywhere to continue')}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
