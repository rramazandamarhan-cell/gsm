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
import { LegacyPathId } from '../game/types';

interface StoryIntroModalProps {
  onComplete: (legacyPath: LegacyPathId) => void;
}

const STORY_BEATS = [
  {
    step: '01',
    kicker: '23 YAŞ · 5 YIL ÇIRAKLIK',
    title: 'Liseden Sonra Pasajda Geçen Beş Yıl',
    body: 'Liseden mezun olur olmaz pasajdaki Cemal Usta’nın telefoncu tezgahında çıraklığa başladın. Beş yıl boyunca kırık ekran söktün, batarya değiştirdin, toptancı kovaladın ve müşterinin gözünden pazarlığı okumayı öğrendin.',
    quote:
      'Cemal Usta: "Artık çırağım değilsin evlat. Beş yılda kendi tarzını oturttun. Şimdi kendi dükkanını açma vaktin geldi."',
    icon: <Wrench className="w-6 h-6 text-amber-400" />,
  },
  {
    step: '02',
    kicker: 'İLK KEPENK · 12 M² PASAJ DÜKKANI',
    title: 'Cebinde 16.500 ₺ Birikim ve Büyük Hayaller',
    body: `Yıllarca kenara attığın ${formatTRY(STARTING_CASH)} sermaye, vitrindeki ilk telefonun ve birkaç kutu kırılmaz cam & kılıf ile pasajın arka koridorunda kendi dükkanını tuttun. Bugün kepengi ilk kez kendi adına kaldırıyorsun.`,
    quote:
      'İç sesin: "Sadece 2. el telefon çevirip kalmayacağım. Aksesuar reyonunu dolduracağım, tamir atölyesi kuracağım, sıfır kutu marka bayilikleri alacağım!"',
    icon: <KeyRound className="w-6 h-6 text-emerald-400" />,
  },
  {
    step: '03',
    kicker: 'MİRASINI SEÇ · KARİYER YOLUN',
    title: '23 Yaşındaki Geçmişin Dükkanına Nasıl Yön Versin?',
    body: 'Geçtiğimiz 5 yılda pasajda en çok hangi yönünü parlatmıştın? Seçtiğin Miras hem kalıcı pasif yeteneklerini hem de tezgahtaki özel pazarlık diyaloglarını belirler.',
    quote:
      'Unutma: Müşteriler artık ilk teklifte hemen el sıkışmaz. Pazarlık hızın, üslubun ve Miras diyaloğun her anlaşmayı şekillendirecek!',
    icon: <Store className="w-6 h-6 text-sky-400" />,
  },
];

function renderLegacyIcon(id: LegacyPathId) {
  switch (id) {
    case 'EX_APPRENTICE':
      return <Wrench className="w-5 h-5 text-amber-400" />;
    case 'BORN_MERCHANT':
      return <BadgePercent className="w-5 h-5 text-emerald-400" />;
    case 'SOCIAL_HUSTLER':
      return <HeartHandshake className="w-5 h-5 text-sky-400" />;
  }
}

export const StoryIntroModal: React.FC<StoryIntroModalProps> = ({ onComplete }) => {
  const [beatIndex, setBeatIndex] = useState(0);
  const [selectedLegacy, setSelectedLegacy] = useState<LegacyPathId>('EX_APPRENTICE');
  const beat = STORY_BEATS[beatIndex];
  const isLast = beatIndex === STORY_BEATS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-[#090D13]/95 p-2.5 sm:p-4 overflow-y-auto pasaj-scroll">
      <motion.div
        key={beat.step}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
        className="w-full max-w-3xl my-auto max-h-[92dvh] overflow-y-auto pasaj-scroll rounded-2xl border border-white/12 bg-[#141C27] shadow-[0_32px_90px_rgba(0,0,0,0.75)]"
      >
        {/* Top Progress Header */}
        <div className="px-6 pt-5 pb-4 border-b border-white/8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
            <span>KARİYER HİKAYESİ & MİRAS</span>
            <span aria-hidden="true" className="text-white/25">·</span>
            <span className="text-slate-400">{beat.step} / 03</span>
          </div>
          {!isLast && (
            <button
              type="button"
              onClick={() => setBeatIndex(2)}
              className="text-xs font-medium text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
            >
              Miras Seçimine Geç →
            </button>
          )}
        </div>

        {/* Story Beat Body */}
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-3.5 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/12 bg-[#1B2635] shrink-0">
              {beat.icon}
            </div>
            <div>
              <div className="text-xs font-semibold text-amber-400 tracking-wide">
                {beat.kicker}
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-50 leading-tight">
                {beat.title}
              </h1>
            </div>
          </div>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed mb-4">
            {beat.body}
          </p>

          {!isLast ? (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3.5 text-sm text-amber-100 italic leading-relaxed mb-6">
              {beat.quote}
            </div>
          ) : (
            /* LEGACY SELECTION CARDS */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              {LEGACY_PATH_LIST.map((path) => {
                const active = selectedLegacy === path.id;
                const borderCls = active
                  ? path.accentColor === 'amber'
                    ? 'border-amber-400 bg-amber-500/12 shadow-[0_0_24px_rgba(245,158,11,0.2)]'
                    : path.accentColor === 'emerald'
                    ? 'border-emerald-400 bg-emerald-500/12 shadow-[0_0_24px_rgba(16,185,129,0.2)]'
                    : 'border-sky-400 bg-sky-500/12 shadow-[0_0_24px_rgba(56,189,248,0.2)]'
                  : 'border-white/10 bg-[#101720] hover:border-white/25';

                return (
                  <button
                    key={path.id}
                    type="button"
                    onClick={() => setSelectedLegacy(path.id)}
                    className={`text-left rounded-xl border-2 p-4 transition-all cursor-pointer flex flex-col justify-between gap-3 ${borderCls}`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 bg-[#1A2433]">
                          {renderLegacyIcon(path.id)}
                        </div>
                        {active && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-400 px-2 py-0.5 text-[10px] font-extrabold text-slate-950">
                            <Check className="w-3 h-3" />
                            <span>SEÇİLDİ</span>
                          </span>
                        )}
                      </div>

                      <div className="font-display text-base font-extrabold text-slate-50">
                        {path.name}
                      </div>
                      <div className="text-[11px] font-semibold text-amber-300/90 mb-1.5">
                        {path.title}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-3">
                        {path.tagline}
                      </p>
                    </div>

                    <div className="space-y-2 border-t border-white/8 pt-2.5 text-[11px]">
                      <div>
                        <div className="font-bold text-emerald-300">
                          {path.passiveTitle}
                        </div>
                        <div className="text-slate-400 leading-snug mt-0.5">
                          {path.passiveDetail}
                        </div>
                      </div>
                      <div className="rounded-lg bg-white/[0.04] border border-white/8 p-2">
                        <div className="font-bold text-amber-300">
                          Özel Diyalog: {path.dialogueName}
                        </div>
                        <div className="text-slate-400 leading-snug mt-0.5">
                          {path.dialoguePreview}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between gap-4 pt-3 border-t border-white/8">
            <div className="flex items-center gap-1.5">
              {STORY_BEATS.map((b, i) => (
                <button
                  key={b.step}
                  type="button"
                  onClick={() => setBeatIndex(i)}
                  aria-label={`Adım ${i + 1}`}
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
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-extrabold text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Package className="w-4 h-4" />
                <span>Kepengi Kaldır & 1. Güne Başla</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setBeatIndex((i) => i + 1)}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-extrabold text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>Devam Et</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
