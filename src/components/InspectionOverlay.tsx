import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertOctagon, CheckCircle2, Search, Gavel } from 'lucide-react';
import { DEFECT_CATALOG } from '../game/catalog';
import { InspectionOverlayData } from '../game/types';

interface InspectionOverlayProps {
  data: InspectionOverlayData | null;
  onComplete: () => void;
}

export const InspectionOverlay: React.FC<InspectionOverlayProps> = ({
  data,
  onComplete,
}) => {
  const [phase, setPhase] = useState<'scanning' | 'result'>('scanning');

  useEffect(() => {
    if (!data) return;
    setPhase('scanning');

    const scanTimer = window.setTimeout(() => {
      setPhase('result');
    }, 420);

    const dismissTimer = window.setTimeout(() => {
      onComplete();
    }, data.foundDefects.length > 0 ? 2200 : 1450);

    return () => {
      window.clearTimeout(scanTimer);
      window.clearTimeout(dismissTimer);
    };
  }, [data, onComplete]);

  const hasDefect = (data?.foundDefects.length ?? 0) > 0;
  const primaryDefect =
    data && data.foundDefects.length > 0
      ? DEFECT_CATALOG[data.foundDefects[0]]
      : null;

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          key={data.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={onComplete}
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0.82, opacity: 0, y: 12 }}
            animate={
              phase === 'result' && hasDefect
                ? {
                    scale: 1,
                    opacity: 1,
                    y: 0,
                    x: [0, -7, 7, -5, 5, 0],
                  }
                : { scale: 1, opacity: 1, y: 0, x: 0 }
            }
            exit={{ scale: 0.9, opacity: 0, y: -10 }}
            transition={{
              type: 'spring',
              stiffness: 420,
              damping: 26,
              x: { duration: 0.32, ease: 'easeInOut' },
            }}
            className={`relative w-full max-w-sm rounded-2xl border p-6 text-center shadow-2xl overflow-hidden ${
              phase === 'scanning'
                ? 'border-amber-400/45 bg-[#151E2A]'
                : hasDefect
                ? 'border-rose-500/70 bg-[#23141B] shadow-[0_0_50px_rgba(239,68,68,0.35)]'
                : 'border-emerald-500/60 bg-[#12241F] shadow-[0_0_40px_rgba(16,185,129,0.28)]'
            }`}
          >
            {/* Glowing aura pulse ring on HATA or TEMİZ */}
            {phase === 'result' && (
              <motion.div
                initial={{ opacity: 0.65, scale: 0.7 }}
                animate={{ opacity: 0, scale: 1.55 }}
                transition={{ duration: 0.85, ease: 'easeOut', repeat: Infinity }}
                className={`pointer-events-none absolute left-1/2 top-16 -ml-14 h-28 w-28 rounded-full border-2 ${
                  hasDefect ? 'border-rose-400' : 'border-emerald-400'
                }`}
              />
            )}

            {/* Animated Magnifying Glass Centerpiece */}
            <div className="relative mx-auto mb-4 flex h-24 w-24 items-center justify-center">
              <div
                className={`absolute inset-0 rounded-full border-2 ${
                  phase === 'scanning'
                    ? 'border-amber-400/50 bg-amber-500/10'
                    : hasDefect
                    ? 'border-rose-500 bg-rose-500/18 shadow-[0_0_28px_rgba(244,63,94,0.55)]'
                    : 'border-emerald-400 bg-emerald-500/15 shadow-[0_0_24px_rgba(16,185,129,0.45)]'
                }`}
              />

              {phase === 'scanning' ? (
                <motion.div
                  animate={{
                    x: [-14, 14, -8, 10, 0],
                    y: [-8, 8, 10, -6, 0],
                    rotate: [-10, 12, -6, 6, 0],
                  }}
                  transition={{ duration: 0.42, ease: 'easeInOut' }}
                  className="relative z-10 flex items-center justify-center"
                >
                  <Search className="w-11 h-11 text-amber-400 stroke-[2.2]" />
                </motion.div>
              ) : hasDefect ? (
                <motion.div
                  initial={{ scale: 0.4, rotate: -14 }}
                  animate={{ scale: 1.08, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 520, damping: 18 }}
                  className="relative z-10 flex items-center justify-center"
                >
                  <AlertOctagon className="w-12 h-12 text-rose-400 stroke-[2.2]" />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 480, damping: 20 }}
                  className="relative z-10 flex items-center justify-center"
                >
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 stroke-[2.2]" />
                </motion.div>
              )}
            </div>

            {/* Category & Device Subtitle */}
            <div className="text-xs font-medium text-slate-400 mb-1">
              {data.deviceName} · {data.categoryLabel}
            </div>

            {phase === 'scanning' ? (
              <div>
                <h3 className="font-display text-xl font-bold text-amber-300">
                  Büyüteçle İnceleniyor...
                </h3>
                <div className="mt-3 h-1.5 w-44 mx-auto rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 0.4, ease: 'linear' }}
                    className="h-full w-1/2 rounded-full bg-amber-400"
                  />
                </div>
              </div>
            ) : hasDefect && primaryDefect ? (
              <div>
                <motion.div
                  initial={{ scale: 1.25, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 460, damping: 22 }}
                  className="inline-block font-display text-2xl font-extrabold tracking-wide text-rose-400 drop-shadow-[0_0_16px_rgba(244,63,94,0.75)] mb-1.5"
                >
                  HATA TESPİT EDİLDİ!
                </motion.div>
                <div className="text-base font-bold text-slate-50 mb-1">
                  {primaryDefect.name}
                  {data.foundDefects.length > 1
                    ? ` (+${data.foundDefects.length - 1} ek kusur)`
                    : ''}
                </div>
                <p className="text-xs text-rose-100/80 leading-relaxed mb-3">
                  {primaryDefect.description}
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <Gavel className="w-3.5 h-3.5" />
                  <span>Pazarlık Kozu Açıldı — Fiyatı Kırabilirsin</span>
                </div>
              </div>
            ) : (
              <div>
                <motion.div
                  initial={{ scale: 1.15, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-display text-2xl font-extrabold tracking-wide text-emerald-400 mb-1"
                >
                  TEST TEMİZ
                </motion.div>
                <p className="text-xs text-emerald-100/80">
                  Bu bölümde herhangi bir gizli kusur veya yan sanayi parça bulunmadı.
                </p>
              </div>
            )}

            <div className="mt-4 text-[11px] text-slate-400/80">
              Devam etmek için tıkla
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
