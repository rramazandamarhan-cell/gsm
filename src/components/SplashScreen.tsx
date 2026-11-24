import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../game/i18n';
import { STORE_RELEASE_META } from '../game/storeBridge';

interface SplashScreenProps {
  onComplete: () => void;
}

const SPLASH_IMAGE_URL = '/assets/aistudio/uygulamagiris1_cb701331.jpg';
const SPLASH_DURATION_MS = 2300;

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const { bi } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const start = performance.now();
    let rafId = 0;
    let finishTimer = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, Math.round((elapsed / SPLASH_DURATION_MS) * 100));
      setProgress(pct);
      if (elapsed < SPLASH_DURATION_MS) {
        rafId = requestAnimationFrame(tick);
      } else {
        setExiting(true);
        finishTimer = window.setTimeout(onComplete, 320);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(finishTimer);
    };
  }, [onComplete]);

  const handleSkip = () => {
    if (exiting) return;
    setProgress(100);
    setExiting(true);
    window.setTimeout(onComplete, 180);
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onClick={handleSkip}
      role="status"
      aria-label={bi('GSM Simulator Yükleniyor', 'Loading GSM Simulator')}
      className="fixed inset-0 z-[100] h-dvh w-screen overflow-hidden bg-[#090D13] select-none cursor-pointer"
    >
      {/* Full-bleed widescreen 16:9 splash artwork */}
      <motion.img
        src={SPLASH_IMAGE_URL}
        alt="GSM Simulator Splash Screen"
        draggable={false}
        initial={{ scale: 1.04 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.3, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      {/* Subtle bottom vignette strictly behind the sleek loading bar */}
      <div
        className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(8,12,18,0) 0%, rgba(8,12,18,0.72) 55%, rgba(8,12,18,0.92) 100%)',
        }}
      />

      {/* Compact AAA Mobile Loading Bar at the bottom */}
      <div className="absolute inset-x-0 bottom-0 safe-px pb-3 sm:pb-5 flex flex-col items-center gap-1.5 pointer-events-none">
        <div className="w-full max-w-xs sm:max-w-sm">
          <div className="flex items-center justify-between text-[10.5px] font-mono font-bold text-slate-200/90 mb-1 tabular-nums">
            <span className="tracking-wide uppercase text-amber-300 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
              {progress < 40
                ? bi('Atölye hazırlanıyor...', 'Preparing workshop...')
                : progress < 80
                ? bi('Tezgah ve vitrin açılıyor...', 'Opening counter & showcase...')
                : bi('Kepenkler kalkıyor...', 'Raising shutters...')}
            </span>
            <span className="text-slate-100 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
              %{progress}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/15 overflow-hidden border border-white/10 backdrop-blur-xs">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-300 to-sky-400 transition-[width] duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <span className="text-[9.5px] font-mono text-slate-300/75">
          v{STORE_RELEASE_META.versionName} · {bi('Geçmek için dokun', 'Tap to continue')}
        </span>
      </div>
    </motion.div>
  );
};
