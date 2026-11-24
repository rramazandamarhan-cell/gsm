import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Award, Coins, Flame, Gavel, Trophy, X } from 'lucide-react';
import { AchievementBadgeNotification } from '../game/types';

interface AchievementBadgeToastProps {
  badge: AchievementBadgeNotification | null;
  onDismiss: () => void;
}

export const AchievementBadgeToast: React.FC<AchievementBadgeToastProps> = ({
  badge,
  onDismiss,
}) => {
  useEffect(() => {
    if (!badge) return;
    const timer = window.setTimeout(onDismiss, 4200);
    return () => window.clearTimeout(timer);
  }, [badge, onDismiss]);

  const iconNode = (() => {
    if (!badge) return null;
    switch (badge.icon) {
      case 'coins':
        return <Coins className="w-5 h-5" />;
      case 'flame':
        return <Flame className="w-5 h-5" />;
      case 'gavel':
        return <Gavel className="w-5 h-5" />;
      default:
        return <Trophy className="w-5 h-5" />;
    }
  })();

  const theme = (() => {
    if (!badge) {
      return {
        border: 'border-amber-400/55',
        bg: 'bg-[#1A1610]/96',
        emblemBg: 'bg-amber-500/20 border-amber-400/50 text-amber-300',
        kicker: 'text-amber-300',
        bar: 'bg-amber-400',
      };
    }
    switch (badge.accent) {
      case 'emerald':
        return {
          border: 'border-emerald-400/55',
          bg: 'bg-[#0F1E1A]/96',
          emblemBg: 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300',
          kicker: 'text-emerald-300',
          bar: 'bg-emerald-400',
        };
      case 'sky':
        return {
          border: 'border-sky-400/55',
          bg: 'bg-[#101B27]/96',
          emblemBg: 'bg-sky-500/20 border-sky-400/50 text-sky-300',
          kicker: 'text-sky-300',
          bar: 'bg-sky-400',
        };
      case 'amber':
        return {
          border: 'border-orange-400/55',
          bg: 'bg-[#211711]/96',
          emblemBg: 'bg-orange-500/20 border-orange-400/50 text-orange-300',
          kicker: 'text-orange-300',
          bar: 'bg-orange-400',
        };
      default:
        return {
          border: 'border-amber-400/60',
          bg: 'bg-[#1B1710]/96',
          emblemBg: 'bg-amber-500/20 border-amber-400/55 text-amber-300',
          kicker: 'text-amber-300',
          bar: 'bg-amber-400',
        };
    }
  })();

  return (
    <div
      className="pointer-events-none fixed top-2 sm:top-3 left-1/2 -translate-x-1/2 z-[60] w-[92vw] max-w-md px-1"
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        {badge && (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, y: -26, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 360, damping: 26 }}
            className={`pointer-events-auto relative overflow-hidden rounded-xl border ${theme.border} ${theme.bg} shadow-[0_14px_38px_rgba(0,0,0,0.65)] backdrop-blur-md`}
          >
            <div className="flex items-center gap-3 px-3.5 py-2.5">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${theme.emblemBg}`}
              >
                {iconNode ?? <Award className="w-5 h-5" />}
              </div>

              <div className="min-w-0 flex-1">
                <div className={`text-[10px] font-extrabold tracking-wider uppercase ${theme.kicker}`}>
                  {badge.kicker}
                </div>
                <div className="font-display text-sm font-extrabold text-slate-50 truncate leading-tight mt-0.5">
                  {badge.title}
                </div>
                <div className="text-[11px] text-slate-300 truncate mt-0.5">
                  {badge.subtitle}
                </div>
              </div>

              <button
                type="button"
                onClick={onDismiss}
                aria-label="Rozet bildirimini kapat"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-slate-100 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Smooth 4.2s auto-dismiss progress bar */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 4.2, ease: 'linear' }}
              style={{ transformOrigin: 'left' }}
              className={`h-0.5 w-full ${theme.bar}`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
