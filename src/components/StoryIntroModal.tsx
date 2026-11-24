import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BadgePercent,
  Check,
  HeartHandshake,
  KeyRound,
  Package,
  Store,
  Wrench,
} from 'lucide-react';
import { LEGACY_PATH_LIST, STARTING_CASH } from '../game/catalog';
import { formatTRY } from '../game/engine';
import { useLanguage } from '../game/i18n';
import { LegacyPathId } from '../game/types';

interface StoryIntroModalProps {
  onComplete: (legacyPath: LegacyPathId) => void;
}

const LEGACY_EN: Record<
  LegacyPathId,
  {
    name: string;
    title: string;
    tagline: string;
    passiveTitle: string;
    passiveDetail: string;
    dialogueName: string;
    dialoguePreview: string;
  }
> = {
  EX_APPRENTICE: {
    name: 'Master Apprentice',
    title: 'Hardware & Micro-Repair Ace',
    tagline: 'You spent five years mastering boards, glass swaps, and fault diagnostics.',
    passiveTitle: '-20% Repair Part Cost',
    passiveDetail: 'Every repair at your bench costs 20% less and nets higher resale margins.',
    dialogueName: 'Technician Talk',
    dialoguePreview: 'Impress tech-savvy buyers and expose hidden repair flaws instantly.',
  },
  BORN_MERCHANT: {
    name: 'Street Merchant',
    title: 'Wholesale & Haggle Shark',
    tagline: 'You learned how to buy low, flip fast, and read every customer’s poker face.',
    passiveTitle: '+8% Starting Negotiation Edge',
    passiveDetail: 'Sellers drop prices faster and buyers accept higher showcase markups.',
    dialogueName: 'Market Pitch',
    dialoguePreview: 'Drop sharp street-value comparisons that melt customer resistance.',
  },
  SOCIAL_HUSTLER: {
    name: 'Arcade Charmer',
    title: 'Trust & Regulars Magnet',
    tagline: 'Everyone in the arcade knows your warm tea, honest smile, and VIP service.',
    passiveTitle: '+15% Patience & Fast Reputation',
    passiveDetail: 'Customers stay calmer in tough deals and return as loyal regulars faster.',
    dialogueName: 'Warm Hospitality',
    dialoguePreview: 'Turn grumpy skeptics into cheerful regulars with effortless rapport.',
  },
};

function renderLegacyIcon(id: LegacyPathId) {
  switch (id) {
    case 'EX_APPRENTICE':
      return <Wrench className="w-4 h-4 text-amber-400" />;
    case 'BORN_MERCHANT':
      return <BadgePercent className="w-4 h-4 text-emerald-400" />;
    case 'SOCIAL_HUSTLER':
      return <HeartHandshake className="w-4 h-4 text-sky-400" />;
  }
}

export const StoryIntroModal: React.FC<StoryIntroModalProps> = ({ onComplete }) => {
  const { lang, bi } = useLanguage();
  const [beatIndex, setBeatIndex] = useState(0);
  const [selectedLegacy, setSelectedLegacy] = useState<LegacyPathId>('EX_APPRENTICE');

  const storyBeats = [
    {
      step: '01',
      kicker: bi('23 YAŞ · 5 YIL ÇIRAKLIK', 'AGE 23 · 5 YEARS APPRENTICESHIP'),
      title: bi(
        'Liseden Sonra Pasajda Geçen Beş Yıl',
        'Five Years Behind the Arcade Counter'
      ),
      body: bi(
        'Liseden mezun olur olmaz pasajdaki Cemal Usta’nın telefoncu tezgahında çıraklığa başladın. Beş yıl boyunca kırık ekran söktün, batarya değiştirdin, toptancı kovaladın ve müşterinin gözünden pazarlığı okumayı öğrendin.',
        'Right after high school you apprenticed under Master Cemal in the tech arcade. For five years you swapped cracked displays, spotted fake batteries, chased wholesale lots, and learned to read every customer’s bluff.'
      ),
      quote: bi(
        'Cemal Usta: "Artık çırağım değilsin evlat. Beş yılda kendi tarzını oturttun. Şimdi kendi dükkanını açma vaktin geldi."',
        'Master Cemal: "You’re no apprentice anymore, kid. Five years forged your instincts. It’s time to raise your own shutter."'
      ),
      icon: <Wrench className="w-5 h-5 text-amber-400" />,
    },
    {
      step: '02',
      kicker: bi('İLK KEPENK · 12 M² PASAJ DÜKKANI', 'FIRST SHUTTER · 12 M² ARCADE STALL'),
      title: bi(
        `Cebinde ${formatTRY(STARTING_CASH)} Birikim ve Büyük Hayaller`,
        `${formatTRY(STARTING_CASH)} in Savings & Big Dreams`
      ),
      body: bi(
        `Yıllarca kenara attığın ${formatTRY(STARTING_CASH)} sermaye ve vitrindeki ilk 2. el telefonunla pasajın arka koridorunda kendi dükkanını tuttun. Seviye atladıkça aksesuar reyonunu, tamir atölyesini ve marka bayiliklerini tek tek açacaksın.`,
        `With ${formatTRY(STARTING_CASH)} saved up and your first pre-owned phone on display, you rented a small stall in the arcade. As you level up, you will unlock the accessory wall, wholesale distributors, and city branches step by step.`
      ),
      quote: bi(
        'İç sesin: "Sıfırdan başlıyorum! Önce 2. el telefonları inceleyip tamir ederek ustalaşacağım, sonra kılıf, kulaklık, powerbank ve sıfır kutu bayiliklerle pasajı fethedeceğim!"',
        'Your vow: "Starting from scratch! First I’ll master used phone appraisals and repairs, then unlock cases, earbuds, powerbanks, and official flagship dealerships!"'
      ),
      icon: <KeyRound className="w-5 h-5 text-emerald-400" />,
    },
    {
      step: '03',
      kicker: bi('MİRASINI SEÇ · KARİYER YOLUN', 'CHOOSE YOUR LEGACY · CAREER PATH'),
      title: bi(
        '23 Yaşındaki Geçmişin Dükkanına Nasıl Yön Versin?',
        'Which Skill Defined Your Five Years?'
      ),
      body: bi(
        'Seçtiğin Miras kalıcı yeteneklerini ve tezgahtaki özel pazarlık diyaloğunu belirler.',
        'Your Legacy grants a permanent passive perk and unlocks a signature negotiation pitch.'
      ),
      quote: '',
      icon: <Store className="w-5 h-5 text-sky-400" />,
    },
  ];

  const beat = storyBeats[beatIndex];
  const isLast = beatIndex === storyBeats.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#090D13]/95 p-2">
      <motion.div
        key={beat.step}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-4xl max-h-[96dvh] flex flex-col overflow-hidden rounded-2xl border border-white/12 bg-[#141C27] shadow-[0_28px_80px_rgba(0,0,0,0.75)]"
      >
        {/* Pinned Compact Header */}
        <div className="shrink-0 px-3.5 py-2 border-b border-white/8 flex items-center justify-between gap-3 bg-[#101721]">
          <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-amber-400">
            <span>{bi('KARİYER HİKAYESİ & MİRAS', 'CAREER STORY & LEGACY')}</span>
            <span aria-hidden="true" className="text-white/25">·</span>
            <span className="text-slate-400">{beat.step} / 03</span>
          </div>
          {!isLast && (
            <button
              type="button"
              onClick={() => setBeatIndex(2)}
              className="text-[11px] font-semibold text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
            >
              {bi('Miras Seçimine Geç →', 'Skip to Legacy →')}
            </button>
          )}
        </div>

        {/* Zero-Scroll Middle Content */}
        <div className="flex-1 min-h-0 overflow-hidden px-3.5 py-2.5 sm:px-5 sm:py-3 flex flex-col justify-center">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/12 bg-[#1B2635] shrink-0">
              {beat.icon}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-semibold text-amber-400 tracking-wide">
                {beat.kicker}
              </div>
              <h1 className="font-display text-base sm:text-lg font-extrabold text-slate-50 leading-tight truncate">
                {beat.title}
              </h1>
            </div>
          </div>

          <p className="text-[11.5px] sm:text-xs text-slate-200 leading-snug mb-2">
            {beat.body}
          </p>

          {!isLast ? (
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 px-3 py-2 text-xs text-amber-100 italic leading-snug">
              {beat.quote}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {LEGACY_PATH_LIST.map((path) => {
                const active = selectedLegacy === path.id;
                const copy = lang === 'en' ? LEGACY_EN[path.id] : path;
                const borderCls = active
                  ? path.accentColor === 'amber'
                    ? 'border-amber-400 bg-amber-500/12 shadow-[0_0_16px_rgba(245,158,11,0.18)]'
                    : path.accentColor === 'emerald'
                    ? 'border-emerald-400 bg-emerald-500/12 shadow-[0_0_16px_rgba(16,185,129,0.18)]'
                    : 'border-sky-400 bg-sky-500/12 shadow-[0_0_16px_rgba(56,189,248,0.18)]'
                  : 'border-white/10 bg-[#101720] hover:border-white/25';

                return (
                  <button
                    key={path.id}
                    type="button"
                    onClick={() => setSelectedLegacy(path.id)}
                    className={`text-left rounded-xl border-2 p-2 transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${borderCls}`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/12 bg-[#1A2433] shrink-0">
                          {renderLegacyIcon(path.id)}
                        </div>
                        {active && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-amber-400 px-1.5 py-0.5 text-[9px] font-extrabold text-slate-950">
                            <Check className="w-2.5 h-2.5" />
                            <span>{bi('SEÇİLDİ', 'SELECTED')}</span>
                          </span>
                        )}
                      </div>

                      <div className="font-display text-xs font-extrabold text-slate-50 leading-tight truncate">
                        {copy.name}
                      </div>
                      <div className="text-[10px] font-semibold text-amber-300/90 truncate">
                        {copy.title}
                      </div>
                      <p className="text-[10px] text-slate-300 leading-tight line-clamp-2 mt-0.5">
                        {copy.tagline}
                      </p>
                    </div>

                    <div className="space-y-1 border-t border-white/8 pt-1.5 text-[10px]">
                      <div className="font-bold text-emerald-300 leading-tight truncate">
                        {copy.passiveTitle}
                      </div>
                      <div className="rounded bg-white/[0.04] border border-white/8 px-1.5 py-1">
                        <div className="font-bold text-amber-300 leading-tight truncate">
                          {copy.dialogueName}
                        </div>
                        <div className="text-slate-400 leading-tight line-clamp-1">
                          {copy.dialoguePreview}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Pinned Footer */}
        <div className="shrink-0 px-4 py-2.5 sm:px-6 sm:py-3 border-t border-white/10 bg-[#101721] flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {storyBeats.map((b, i) => (
              <button
                key={b.step}
                type="button"
                onClick={() => setBeatIndex(i)}
                aria-label={bi(`Adım ${i + 1}`, `Step ${i + 1}`)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  i === beatIndex
                    ? 'w-7 bg-amber-400'
                    : i < beatIndex
                    ? 'w-2.5 bg-emerald-400/70'
                    : 'w-2.5 bg-white/15'
                }`}
              />
            ))}
          </div>

          {isLast ? (
            <button
              type="button"
              onClick={() => onComplete(selectedLegacy)}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2 lg:px-6 lg:py-2.5 text-xs sm:text-sm font-extrabold text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Package className="w-4 h-4" />
              <span>
                {bi('Kepengi Kaldır & 1. Güne Başla', 'Raise Shutter & Start Day 1')}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setBeatIndex((i) => i + 1)}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2 lg:px-6 lg:py-2.5 text-xs sm:text-sm font-extrabold text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>{bi('Devam Et', 'Continue')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
