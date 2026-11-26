import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertOctagon, CheckCircle2, Search, Gavel, AlertTriangle, ChevronDown } from 'lucide-react';
import { getLocalizedCategoryLabel, getLocalizedDefect, useLanguage } from '../game/i18n';
import { InspectionOverlayData } from '../game/types';

interface InspectionOverlayProps {
  data: InspectionOverlayData | null;
  onComplete: () => void;
}

export const InspectionOverlay: React.FC<InspectionOverlayProps> = ({
  data,
  onComplete,
}) => {
  const { lang, bi } = useLanguage();
  const [phase, setPhase] = useState<'scanning' | 'result'>('scanning');
  const [userInteracted, setUserInteracted] = useState(false);
  const dismissTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!data) return;
    setPhase('scanning');
    setUserInteracted(false);

    const scanTimer = window.setTimeout(() => {
      setPhase('result');
    }, 420);

    const autoMs =
      data.foundDefects.length > 2
        ? 4600
        : data.foundDefects.length > 0
        ? 3000
        : 1500;

    dismissTimerRef.current = window.setTimeout(() => {
      onComplete();
    }, autoMs);

    return () => {
      window.clearTimeout(scanTimer);
      if (dismissTimerRef.current !== null) {
        window.clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
    };
  }, [data, onComplete]);

  const pauseAutoDismiss = () => {
    if (!userInteracted) {
      setUserInteracted(true);
    }
    if (dismissTimerRef.current !== null) {
      window.clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  };

  const hasDefect = (data?.foundDefects.length ?? 0) > 0;
  const localizedDefects = (data?.foundDefects ?? []).map((id) =>
    getLocalizedDefect(id, lang)
  );

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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-3 sm:p-4 cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0.84, opacity: 0, y: 12 }}
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
            onClick={(e) => {
              if (phase === 'result' && hasDefect) {
                e.stopPropagation();
                pauseAutoDismiss();
              }
            }}
            className={`relative w-full max-w-md max-h-[88dvh] flex flex-col rounded-2xl border p-4 sm:p-5 text-center shadow-2xl overflow-hidden cursor-default ${
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
                className={`pointer-events-none absolute left-1/2 top-12 -ml-12 h-24 w-24 rounded-full border-2 ${
                  hasDefect ? 'border-rose-400' : 'border-emerald-400'
                }`}
              />
            )}

            {/* Animated Magnifying Glass Centerpiece */}
            <div className="relative mx-auto mb-2.5 flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center">
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
                    x: [-12, 12, -8, 10, 0],
                    y: [-6, 6, 8, -5, 0],
                    rotate: [-10, 12, -6, 6, 0],
                  }}
                  transition={{ duration: 0.42, ease: 'easeInOut' }}
                  className="relative z-10 flex items-center justify-center"
                >
                  <Search className="w-9 h-9 sm:w-10 sm:h-10 text-amber-400 stroke-[2.2]" />
                </motion.div>
              ) : hasDefect ? (
                <motion.div
                  initial={{ scale: 0.4, rotate: -14 }}
                  animate={{ scale: 1.08, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 520, damping: 18 }}
                  className="relative z-10 flex items-center justify-center"
                >
                  <AlertOctagon className="w-10 h-10 sm:w-11 sm:h-11 text-rose-400 stroke-[2.2]" />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 480, damping: 20 }}
                  className="relative z-10 flex items-center justify-center"
                >
                  <CheckCircle2 className="w-10 h-10 sm:w-11 sm:h-11 text-emerald-400 stroke-[2.2]" />
                </motion.div>
              )}
            </div>

            {/* Category & Device Subtitle */}
            <div className="shrink-0 text-[11px] font-medium text-slate-400 mb-1 truncate">
              {data.deviceName} ·{' '}
              {lang === 'en'
                ? getLocalizedCategoryLabel(data.category, lang)
                : data.categoryLabel}
            </div>

            {phase === 'scanning' ? (
              <div className="shrink-0">
                <h3 className="font-display text-lg sm:text-xl font-bold text-amber-300">
                  {bi('Büyüteçle İnceleniyor...', 'Inspecting with Loupe...')}
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
            ) : hasDefect && localizedDefects.length > 0 ? (
              <div className="flex-1 min-h-0 flex flex-col">
                <motion.div
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 460, damping: 22 }}
                  className="shrink-0 inline-flex items-center justify-center gap-2 font-display text-xl sm:text-2xl font-extrabold tracking-wide text-rose-400 drop-shadow-[0_0_16px_rgba(244,63,94,0.75)] mb-2"
                >
                  <span>{bi('HATA TESPİT EDİLDİ!', 'DEFECT DETECTED!')}</span>
                  <span className="rounded-md border border-rose-400/50 bg-rose-500/20 px-1.5 py-0.5 font-mono text-xs text-rose-200">
                    {localizedDefects.length}
                  </span>
                </motion.div>

                {/* Scrollable Full Defect List — guarantees every discovered fault is readable */}
                <div
                  onScroll={pauseAutoDismiss}
                  onTouchStart={pauseAutoDismiss}
                  className="flex-1 min-h-0 max-h-[34dvh] sm:max-h-[220px] overflow-y-auto pasaj-scroll overscroll-contain space-y-1.5 pr-1 text-left mb-2.5"
                >
                  {localizedDefects.map((def, idx) => (
                    <div
                      key={def.id}
                      className="rounded-xl border border-rose-400/35 bg-black/30 px-3 py-2 space-y-0.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-slate-50 min-w-0">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span className="truncate">{def.name}</span>
                        </span>
                        <span className="font-mono text-[10px] font-bold text-rose-300/90 shrink-0">
                          #{idx + 1}
                        </span>
                      </div>
                      <p className="text-[11px] text-rose-100/80 leading-snug">
                        {def.description}
                      </p>
                    </div>
                  ))}
                </div>

                {localizedDefects.length > 2 && (
                  <div className="shrink-0 inline-flex items-center justify-center gap-1 text-[10px] font-semibold text-rose-200/75 mb-1.5">
                    <ChevronDown className="w-3 h-3 animate-bounce" />
                    <span>
                      {bi(
                        'Tüm kusurları görmek için listeyi kaydırabilirsin',
                        'Scroll the list to inspect all detected faults'
                      )}
                    </span>
                  </div>
                )}

                <div className="shrink-0 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-amber-300 mb-2.5">
                  <Gavel className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {bi(
                      'Pazarlık Kozu Açıldı — Fiyatı Kırabilirsin',
                      'Leverage Unlocked — Slash Their Asking Price'
                    )}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onComplete}
                  className="shrink-0 w-full rounded-xl bg-amber-500 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-400 active:scale-[0.98] transition-all cursor-pointer touch-manipulation"
                >
                  {bi('Tamam · Tezgaha Dön', 'Got It · Back to Counter')}
                </button>
              </div>
            ) : (
              <div className="shrink-0">
                <motion.div
                  initial={{ scale: 1.15, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-display text-2xl font-extrabold tracking-wide text-emerald-400 mb-1"
                >
                  {bi('TEST TEMİZ', 'TEST CLEAN')}
                </motion.div>
                <p className="text-xs text-emerald-100/80">
                  {bi(
                    'Bu bölümde herhangi bir gizli kusur veya yan sanayi parça bulunmadı.',
                    'No hidden faults or non-OEM replacement parts were found in this zone.'
                  )}
                </p>
                <div className="mt-3 text-[11px] text-slate-400/80">
                  {bi('Devam etmek için tıkla', 'Tap anywhere to continue')}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
