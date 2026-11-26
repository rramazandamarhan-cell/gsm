import React from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  Flame,
  Scale,
  Sparkles,
  X,
} from 'lucide-react';
import { getDramaTemplate } from '../game/esnafDrama';
import { formatTRY } from '../game/engine';
import { useLanguage } from '../game/i18n';
import { soundFX } from '../game/sound';
import { EsnafDramaState } from '../game/types';

interface EsnafDramaModalProps {
  drama: EsnafDramaState;
  cash: number;
  onSelectChoice: (choiceId: string) => void;
  onDismissResolved: () => void;
  onCloseInspect: () => void;
}

export const EsnafDramaModal: React.FC<EsnafDramaModalProps> = ({
  drama,
  cash,
  onSelectChoice,
  onDismissResolved,
  onCloseInspect,
}) => {
  const { lang, bi } = useLanguage();
  const template = getDramaTemplate(drama.dramaId);

  const isChoice = drama.phase === 'CHOICE';
  const isActive = drama.phase === 'ACTIVE_QUEST';
  const isSuccess = drama.phase === 'RESOLVED_SUCCESS';
  const isFail = drama.phase === 'RESOLVED_FAIL';

  const triggerColor =
    drama.triggerKind === 'HIGH_DEBT' || drama.triggerKind === 'RIVAL_WAR'
      ? 'border-rose-400/45 bg-rose-500/15 text-rose-200'
      : drama.triggerKind === 'HIGH_PRESTIGE' || drama.triggerKind === 'CASH_EMPIRE'
      ? 'border-amber-400/50 bg-amber-500/15 text-amber-200'
      : 'border-sky-400/45 bg-sky-500/15 text-sky-200';

  const pct =
    drama.target > 0
      ? Math.min(100, Math.round((drama.progress / drama.target) * 100))
      : 0;

  return (
    <div className="fixed inset-0 z-[72] flex items-center justify-center bg-black/82 backdrop-blur-sm p-2 sm:p-3">
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-2xl max-h-[94dvh] flex flex-col overflow-hidden rounded-2xl border border-amber-400/40 bg-[#121924] shadow-[0_28px_80px_rgba(0,0,0,0.85)]"
      >
        {/* Header */}
        <div className="shrink-0 px-4 py-2.5 border-b border-white/10 bg-[#0D131D] flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`rounded border px-1.5 py-0.5 font-mono text-[9.5px] font-extrabold uppercase ${triggerColor}`}
              >
                {lang === 'en' ? drama.triggerBadgeEn : drama.triggerBadgeTr}
              </span>
              <span className="font-mono text-[10px] font-bold text-slate-400">
                {bi('ESNAF DRAMASI · KADER GÖREVİ', 'MERCHANT DRAMA · FATE ARC')}
              </span>
            </div>
            <h2 className="font-display text-base sm:text-lg font-extrabold text-slate-50 leading-tight mt-0.5 truncate">
              {lang === 'en' ? drama.titleEn : drama.titleTr}
            </h2>
          </div>

          {isActive && (
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                onCloseInspect();
              }}
              aria-label={bi('Kapat', 'Close')}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/12 bg-[#1A2432] text-slate-300 hover:text-white cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3">
          {/* Character & Narrative Box */}
          <div className="rounded-xl border border-white/10 bg-[#17202D] p-3 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg border border-amber-400/40 bg-amber-500/15 flex items-center justify-center shrink-0">
                  {isFail ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  ) : isSuccess ? (
                    <Award className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Flame className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-amber-300 truncate">
                    {drama.characterName}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {lang === 'en' ? drama.characterRoleEn : drama.characterRoleTr}
                  </div>
                </div>
              </div>
              <span className="font-mono text-[10px] text-slate-400 shrink-0">
                {bi(`Gün ${drama.startedDay}`, `Day ${drama.startedDay}`)}
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              “{lang === 'en' ? drama.storyEn : drama.storyTr}”
            </p>
          </div>

          {/* PHASE 1: FATEFUL CHOICES */}
          {isChoice && template && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-amber-300">
                <Scale className="w-3.5 h-3.5" />
                <span>
                  {bi(
                    'Dükkanının Kaderini Seç (Kararın günlerce etki edecek!):',
                    'Choose Your Shop’s Fate (Multi-day consequences!):'
                  )}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {template.choices.map((ch) => {
                  const upfrontCost =
                    ch.immediateCashDelta && ch.immediateCashDelta < 0
                      ? Math.abs(ch.immediateCashDelta)
                      : 0;
                  const canAfford = upfrontCost === 0 || cash >= upfrontCost;
                  const toneBorder =
                    ch.tone === 'heroic'
                      ? 'border-amber-400/45 bg-amber-500/10 hover:bg-amber-500/18'
                      : ch.tone === 'pragmatic'
                      ? 'border-emerald-400/35 bg-emerald-500/10 hover:bg-emerald-500/18'
                      : 'border-white/15 bg-[#192332] hover:bg-[#223044]';
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      disabled={!canAfford}
                      onClick={() => onSelectChoice(ch.id)}
                      className={`w-full rounded-xl border p-2.5 text-left transition-all cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${toneBorder}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display text-xs sm:text-sm font-extrabold text-slate-50">
                          {lang === 'en' ? ch.labelEn : ch.labelTr}
                        </span>
                        <span className="rounded bg-black/35 border border-white/10 px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-amber-300 shrink-0">
                          {lang === 'en' ? ch.riskTagEn : ch.riskTagTr}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                        {lang === 'en' ? ch.descEn : ch.descTr}
                      </p>
                      {!canAfford && (
                        <div className="text-[10px] font-bold text-rose-400 mt-1">
                          {bi(
                            `Yetersiz kasa (Gerekli: ${formatTRY(upfrontCost)})`,
                            `Not enough cash (Need: ${formatTRY(upfrontCost)})`
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* PHASE 2: ACTIVE MULTI-DAY QUEST TRACKER */}
          {isActive && (
            <div className="rounded-xl border border-amber-400/35 bg-amber-500/10 p-3 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-extrabold text-amber-200">
                  {lang === 'en' ? drama.objectiveLabelEn : drama.objectiveLabelTr}
                </div>
                <span className="inline-flex items-center gap-1 rounded-md bg-black/30 px-2 py-0.5 font-mono text-[11px] font-extrabold text-amber-300">
                  <Clock className="w-3 h-3" />
                  {bi(`${drama.daysLeft} gün kaldı`, `${drama.daysLeft}d left`)}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-mono text-xs font-bold tabular-nums">
                  <span className="text-slate-300">
                    {drama.objectiveKind === 'EARN_PROFIT'
                      ? `${formatTRY(drama.progress)} / ${formatTRY(drama.target)}`
                      : `${drama.progress} / ${drama.target}`}
                  </span>
                  <span className="text-emerald-300">%{pct}</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-900/90 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onCloseInspect();
                }}
                className="w-full rounded-xl bg-amber-500 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-400 cursor-pointer"
              >
                {bi('Tezgaha Dön & Göreve Devam Et', 'Return to Counter')}
              </button>
            </div>
          )}

          {/* PHASE 3: RESOLVED FINALE (SUCCESS OR FAIL) */}
          {(isSuccess || isFail) && (
            <div
              className={`rounded-xl border p-3.5 space-y-2.5 text-center ${
                isSuccess
                  ? 'border-emerald-400/45 bg-emerald-500/12'
                  : 'border-rose-400/45 bg-rose-500/12'
              }`}
            >
              <div className="mx-auto w-11 h-11 rounded-2xl border border-white/15 bg-black/25 flex items-center justify-center">
                {isSuccess ? (
                  <Sparkles className="w-6 h-6 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-rose-400" />
                )}
              </div>
              <div className="font-display text-base font-extrabold text-slate-50">
                {lang === 'en' ? drama.outcomeTitleEn : drama.outcomeTitleTr}
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {lang === 'en' ? drama.outcomeDescEn : drama.outcomeDescTr}
              </p>
              {(drama.outcomeSummaryTr || drama.outcomeSummaryEn) && (
                <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-black/30 px-3 py-1 font-mono text-xs font-extrabold text-amber-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    {lang === 'en' ? drama.outcomeSummaryEn : drama.outcomeSummaryTr}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onDismissResolved();
                }}
                className="w-full rounded-xl bg-amber-500 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-amber-400 cursor-pointer"
              >
                {bi('Dükkanına Dön & Devam Et →', 'Continue Managing Shop →')}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
