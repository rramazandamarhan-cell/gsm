import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Check,
  Copy,
  Download,
  FileText,
  Globe,
  MessageSquare,
  Radio,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Trash2,
  Trophy,
  Upload,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { STORE_ACHIEVEMENTS } from '../game/catalog';
import { getLocalizedAchievement, useLanguage } from '../game/i18n';
import {
  getPlatformDisplayLabel,
  STORE_RELEASE_META,
} from '../game/storeBridge';
import { ShopState } from '../game/types';

type ComplianceTab = 'SETTINGS' | 'ACHIEVEMENTS' | 'PRIVACY' | 'SUPPORT';

interface StoreComplianceModalProps {
  shop: ShopState;
  muted: boolean;
  onToggleMute: () => void;
  onToggleAmbientSound: () => void;
  onToggleHaptics: () => void;
  onSetTextSpeed: (speed: 'normal' | 'fast' | 'instant') => void;
  onAcceptPrivacy: () => void;
  onImportSaveJson: (rawJson: string) => boolean;
  onDeleteAllData: () => void;
  onRateApp: (stars: number) => void;
  onSubmitFeedback: (note: string) => void;
  onClose: () => void;
}

export const StoreComplianceModal: React.FC<StoreComplianceModalProps> = ({
  shop,
  muted,
  onToggleMute,
  onToggleAmbientSound,
  onToggleHaptics,
  onSetTextSpeed,
  onAcceptPrivacy,
  onImportSaveJson,
  onDeleteAllData,
  onRateApp,
  onSubmitFeedback,
  onClose,
}) => {
  const { lang, setLang, bi } = useLanguage();
  const [tab, setTab] = useState<ComplianceTab>('SETTINGS');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [exportCopied, setExportCopied] = useState(false);
  const [clipboardCopied, setClipboardCopied] = useState(false);
  const [ratingHover, setRatingHover] = useState(0);
  const [selectedStars, setSelectedStars] = useState(shop.ratedApp ? 5 : 0);
  const [feedbackDraft, setFeedbackDraft] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [legalView, setLegalView] = useState<'privacy' | 'terms'>('privacy');

  const unlockedCount = STORE_ACHIEVEMENTS.filter((a) => a.check(shop)).length;
  const totalPoints = STORE_ACHIEVEMENTS.reduce(
    (sum, a) => sum + (a.check(shop) ? a.points : 0),
    0
  );
  const maxPoints = STORE_ACHIEVEMENTS.reduce((sum, a) => sum + a.points, 0);

  const handleExportSave = () => {
    const payload = JSON.stringify(shop, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gsm-simulator-day-${shop.day}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportCopied(true);
    window.setTimeout(() => setExportCopied(false), 2400);
  };

  const handleCopySaveToClipboard = async () => {
    const payload = JSON.stringify(shop);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(payload);
      } else {
        const temp = document.createElement('textarea');
        temp.value = payload;
        temp.style.position = 'fixed';
        temp.style.opacity = '0';
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }
      setClipboardCopied(true);
      window.setTimeout(() => setClipboardCopied(false), 2400);
    } catch {
      setImportText(payload);
      setImportStatus(
        bi(
          'Pano engellendi; yedek metni aşağıdaki alana yerleştirildi.',
          'Clipboard blocked; backup JSON placed in the text field below.'
        )
      );
    }
  };

  const handleImportSubmit = () => {
    if (!importText.trim()) return;
    const ok = onImportSaveJson(importText.trim());
    setImportStatus(
      ok
        ? bi('Kayıt yedeği başarıyla yüklendi!', 'Save backup restored successfully!')
        : bi(
            'Geçersiz JSON yedeği. Lütfen dışa aktardığın kaydı yapıştır.',
            'Invalid JSON backup. Please paste an exported save file.'
          )
    );
    if (ok) {
      setImportText('');
    }
  };

  const handleSendFeedback = () => {
    if (!feedbackDraft.trim()) return;
    onSubmitFeedback(feedbackDraft.trim());
    setFeedbackDraft('');
    setFeedbackSent(true);
    window.setTimeout(() => setFeedbackSent(false), 2600);
  };

  const tabs: { id: ComplianceTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'SETTINGS',
      label: bi('Ayarlar', 'Settings'),
      icon: <SlidersHorizontal className="w-3.5 h-3.5" />,
    },
    {
      id: 'ACHIEVEMENTS',
      label: `${bi('Başarımlar', 'Achievements')} (${unlockedCount}/${STORE_ACHIEVEMENTS.length})`,
      icon: <Trophy className="w-3.5 h-3.5" />,
    },
    {
      id: 'PRIVACY',
      label: bi('Gizlilik & Veri', 'Privacy & Data'),
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
    },
    {
      id: 'SUPPORT',
      label: bi('Mağaza & Destek', 'Store & Support'),
      icon: <Star className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-3xl max-h-[96dvh] rounded-2xl border border-white/12 bg-[#141C27] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Compact Header + Tabs in 2 tight rows */}
        <div className="px-3.5 py-2 border-b border-white/10 flex items-center justify-between gap-2 shrink-0 bg-[#10161F]">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src="/pwa-192x192.png"
              alt="GSM Simulator"
              className="w-6 h-6 rounded-md object-cover border border-amber-400/30 shrink-0"
            />
            <h2 className="font-display text-sm sm:text-base font-extrabold text-slate-50 truncate">
              {bi('Ayarlar, Dil & Mağaza Merkezi', 'Settings, Language & Store Hub')}
            </h2>
            <span className="hidden sm:inline text-[10px] font-mono text-amber-400">
              v{STORE_RELEASE_META.versionName}
            </span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  tab === t.id
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-300 hover:bg-white/[0.06] hover:text-slate-50'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={onClose}
              aria-label={bi('Kapat', 'Close')}
              className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-[#1E2836] text-slate-300 hover:text-slate-50 cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Zero-Scroll Landscape Body */}
        <div className="flex-1 min-h-0 overflow-hidden p-3">
          {tab === 'SETTINGS' && (
            <div className="grid grid-cols-2 gap-2 h-full content-start">
              {/* Language Switcher */}
              <div className="rounded-xl border border-amber-400/35 bg-[#182230] p-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Globe className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-100 truncate">
                      {bi('Oyun Dili / Language', 'Game Language')}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {bi('TR / EN anında geçiş', 'Instant TR / EN switch')}
                    </div>
                  </div>
                </div>
                <div className="inline-flex items-center gap-0.5 rounded-lg border border-white/12 bg-[#10161F] p-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setLang('tr')}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-bold cursor-pointer ${
                      lang === 'tr' ? 'bg-amber-500 text-slate-950' : 'text-slate-300'
                    }`}
                  >
                    TR
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang('en')}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-bold cursor-pointer ${
                      lang === 'en' ? 'bg-amber-500 text-slate-950' : 'text-slate-300'
                    }`}
                  >
                    EN
                  </button>
                </div>
              </div>

              {/* Sound FX */}
              <div className="rounded-xl border border-white/10 bg-[#182230] p-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {muted ? (
                    <VolumeX className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-100 truncate">
                      {bi('Ses Efektleri & Kapı Zili', 'Sound FX & Chime')}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {bi('Kasa, tamir ve tezgah sesleri', 'Register, bench & counter FX')}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onToggleMute}
                  className={`rounded-lg px-3 py-1 text-[11px] font-bold cursor-pointer shrink-0 ${
                    muted
                      ? 'border border-white/15 bg-[#10161F] text-slate-300'
                      : 'bg-emerald-500 text-slate-950'
                  }`}
                >
                  {muted ? bi('Kapalı', 'Off') : bi('Açık', 'On')}
                </button>
              </div>

              {/* Ambience */}
              <div className="rounded-xl border border-white/10 bg-[#182230] p-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Radio
                    className={`w-4 h-4 shrink-0 ${
                      shop.ambientSoundEnabled && !muted ? 'text-amber-400' : 'text-slate-500'
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-100 truncate">
                      {bi('Dükkan Ambiyansı', 'Shop Ambience')}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {bi('Hafif arka plan pasaj sesi', 'Soft arcade background hum')}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={muted}
                  onClick={onToggleAmbientSound}
                  className={`rounded-lg px-3 py-1 text-[11px] font-bold cursor-pointer disabled:opacity-40 shrink-0 ${
                    shop.ambientSoundEnabled && !muted
                      ? 'bg-emerald-500 text-slate-950'
                      : 'border border-white/15 bg-[#10161F] text-slate-300'
                  }`}
                >
                  {shop.ambientSoundEnabled && !muted
                    ? bi('Açık', 'On')
                    : bi('Kapalı', 'Off')}
                </button>
              </div>

              {/* Haptics */}
              <div className="rounded-xl border border-white/10 bg-[#182230] p-2.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-100 truncate">
                    {bi('Dokunsal Titreşim', 'Haptic Feedback')}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {bi('Vida, tarama & anlaşma titreşimi', 'Screw, loupe & deal vibration')}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onToggleHaptics}
                  className={`rounded-lg px-3 py-1 text-[11px] font-bold cursor-pointer shrink-0 ${
                    shop.hapticsEnabled
                      ? 'bg-emerald-500 text-slate-950'
                      : 'border border-white/15 bg-[#10161F] text-slate-300'
                  }`}
                >
                  {shop.hapticsEnabled ? bi('Açık', 'On') : bi('Kapalı', 'Off')}
                </button>
              </div>

              {/* Text Speed (full width) */}
              <div className="col-span-2 rounded-xl border border-white/10 bg-[#182230] p-2.5 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-100">
                    {bi('Müşteri Diyalog Yazı Hızı', 'Dialogue Typing Speed')}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {bi('Konuşma balonlarının ekrana yazılma hızı.', 'Speed of customer speech bubbles.')}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1.5 w-56 shrink-0">
                  {(
                    [
                      { id: 'normal', label: bi('Normal', 'Normal') },
                      { id: 'fast', label: bi('Hızlı', 'Fast') },
                      { id: 'instant', label: bi('Anında', 'Instant') },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onSetTextSpeed(opt.id)}
                      className={`rounded-lg py-1.5 text-[11px] font-bold cursor-pointer transition-colors ${
                        shop.textSpeed === opt.id
                          ? 'bg-amber-500 text-slate-950'
                          : 'border border-white/12 bg-[#111822] text-slate-300 hover:bg-[#1E2938]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'ACHIEVEMENTS' && (
            <div className="flex flex-col gap-2 h-full">
              <div className="shrink-0 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 flex items-center justify-between tabular-nums">
                <div className="text-xs font-extrabold text-slate-50">
                  {bi(
                    `Play Games / Game Center · ${unlockedCount}/${STORE_ACHIEVEMENTS.length} Başarım`,
                    `Play Games / Game Center · ${unlockedCount}/${STORE_ACHIEVEMENTS.length} Unlocked`
                  )}
                </div>
                <div className="font-mono text-sm font-extrabold text-amber-400">
                  {totalPoints} / {maxPoints} P
                </div>
              </div>

              <div className="flex-1 min-h-0 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STORE_ACHIEVEMENTS.map((ach) => {
                  const unlocked = ach.check(shop);
                  const locAch = getLocalizedAchievement(ach, lang);
                  return (
                    <div
                      key={ach.id}
                      className={`rounded-xl border p-2 flex flex-col justify-between ${
                        unlocked
                          ? 'border-emerald-500/35 bg-emerald-500/10'
                          : 'border-white/8 bg-[#182230] opacity-80'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <div className="font-display text-[11px] font-bold text-slate-100 leading-tight line-clamp-1">
                            {locAch.title}
                          </div>
                          <span
                            className={`font-mono text-[10px] font-bold shrink-0 ${
                              unlocked ? 'text-emerald-400' : 'text-slate-500'
                            }`}
                          >
                            +{ach.points}P
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-tight">
                          {locAch.description}
                        </p>
                      </div>
                      <div className="mt-1 text-[10px] font-semibold">
                        {unlocked ? (
                          <span className="inline-flex items-center gap-0.5 text-emerald-400">
                            <Check className="w-3 h-3" />
                            <span>{bi('Kazanıldı', 'Unlocked')}</span>
                          </span>
                        ) : (
                          <span className="text-slate-500">
                            {bi('Devam Ediyor', 'In Progress')}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'PRIVACY' && (
            <div className="grid grid-cols-12 gap-2.5 h-full">
              {/* Left: Policy & Deletion */}
              <div className="col-span-6 flex flex-col justify-between gap-2">
                <div className="rounded-xl border border-white/10 bg-[#182230] p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-100">
                      <FileText className="w-3.5 h-3.5 text-sky-400" />
                      <span>{bi('KVKK & GDPR Gizlilik', 'Privacy Policy (GDPR)')}</span>
                    </span>
                    {shop.privacyAccepted ? (
                      <span className="text-[10.5px] font-bold text-emerald-400">
                        {bi('Onaylandı', 'Accepted')}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={onAcceptPrivacy}
                        className="rounded-lg bg-emerald-500 px-2.5 py-0.5 text-[10.5px] font-bold text-slate-950 cursor-pointer"
                      >
                        {bi('Onayla', 'Accept')}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setLegalView('privacy')}
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold cursor-pointer transition-colors ${
                        legalView === 'privacy'
                          ? 'bg-sky-500 text-slate-950'
                          : 'border border-white/10 bg-[#101722] text-slate-300'
                      }`}
                    >
                      {bi('Gizlilik Özeti', 'Privacy Summary')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLegalView('terms')}
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold cursor-pointer transition-colors ${
                        legalView === 'terms'
                          ? 'bg-sky-500 text-slate-950'
                          : 'border border-white/10 bg-[#101722] text-slate-300'
                      }`}
                    >
                      {bi('Kullanım Koşulları', 'Terms of Use')}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-snug">
                    {legalView === 'privacy'
                      ? bi(
                          'GSM Simulator verilerinizi yalnızca cihaz içi localStorage alanında saklar. Kişisel veri, konum, mikrofon veya reklam kimliği toplamaz ve üçüncü taraflarla paylaşmaz.',
                          'GSM Simulator stores progress strictly on-device via localStorage. Zero personal data, location, microphone, or ad tracking is collected or shared.'
                        )
                      : bi(
                          'Bu oyun tamamen kurgusal bir ticaret simülasyonudur. Gerçek para ile kumar/bahis içermez. Marka ve cihaz isimleri parodi niteliğindedir.',
                          'This game is a purely fictional trading simulation with no real-money gambling. All brand and device names are parody creations.'
                        )}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    <div className="rounded border border-emerald-500/25 bg-[#101722] px-2 py-1">
                      <span className="text-slate-400">{bi('Veri:', 'Data:')}</span>{' '}
                      <strong className="text-emerald-400">{bi('Yok (0)', 'None (0)')}</strong>
                    </div>
                    <div className="rounded border border-white/10 bg-[#101722] px-2 py-1">
                      <span className="text-slate-400">{bi('Yaş:', 'Rating:')}</span>{' '}
                      <strong className="text-amber-300">PEGI 3 / 4+</strong>
                    </div>
                  </div>
                </div>

                {/* Delete Data */}
                <div className="rounded-xl border border-rose-500/35 bg-rose-500/8 p-2.5 space-y-1.5">
                  <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{bi('Tüm Verileri Kalıcı Sil', 'Delete All Local Data')}</span>
                  </div>
                  {!confirmDelete ? (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="rounded-lg border border-rose-500/50 bg-rose-500/15 px-3 py-1.5 text-[11px] font-bold text-rose-200 hover:bg-rose-500/25 cursor-pointer"
                    >
                      {bi('Kariyeri & Verileri Sıfırla...', 'Reset Career & Erase Data...')}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmDelete(false);
                          onDeleteAllData();
                        }}
                        className="rounded-lg bg-rose-600 px-3 py-1.5 text-[11px] font-extrabold text-white hover:bg-rose-500 cursor-pointer"
                      >
                        {bi('Evet, Kalıcı Sil', 'Yes, Delete Permanently')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="rounded-lg border border-white/15 bg-[#1B2533] px-3 py-1.5 text-[11px] font-semibold text-slate-200 cursor-pointer"
                      >
                        {bi('Vazgeç', 'Cancel')}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Save Backup JSON */}
              <div className="col-span-6 rounded-xl border border-white/10 bg-[#182230] p-2.5 flex flex-col justify-between gap-2">
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-100">
                    {bi('Kayıt Yedeği (JSON Export / Import)', 'Save Backup (JSON Export / Import)')}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleExportSave}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-sky-500 px-2.5 py-1.5 text-[11px] font-bold text-slate-950 hover:bg-sky-400 cursor-pointer whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>
                        {exportCopied ? bi('İndirildi!', 'Saved!') : bi('.json İndir', 'Download .json')}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopySaveToClipboard}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-sky-400/40 bg-sky-500/12 px-2.5 py-1.5 text-[11px] font-bold text-sky-200 hover:bg-sky-500/20 cursor-pointer whitespace-nowrap"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>
                        {clipboardCopied ? bi('Kopyalandı!', 'Copied!') : bi('Panoya Kopyala', 'Copy JSON')}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <textarea
                    rows={2}
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder='{"day": 5, "cash": 24500, ...}'
                    className="w-full rounded-lg border border-white/12 bg-[#0F151E] p-2 text-[10.5px] font-mono text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      disabled={!importText.trim()}
                      onClick={handleImportSubmit}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 text-[11px] font-bold text-amber-200 hover:bg-amber-500/25 disabled:opacity-40 cursor-pointer whitespace-nowrap"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{bi('Yedeği Yükle', 'Import Backup')}</span>
                    </button>
                    {importStatus && (
                      <span className="text-[10px] text-amber-300 truncate">{importStatus}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'SUPPORT' && (
            <div className="grid grid-cols-12 gap-2.5 h-full">
              {/* Left: Rate Us + Build Meta */}
              <div className="col-span-6 flex flex-col justify-between gap-2">
                <div className="rounded-xl border border-amber-500/30 bg-[#182230] p-3 text-center space-y-1.5">
                  <div className="font-display text-sm font-bold text-slate-100">
                    {bi('GSM Simulator’ı Değerlendir!', 'Rate GSM Simulator!')}
                  </div>
                  <div className="flex items-center justify-center gap-1.5 py-0.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = star <= (ratingHover || selectedStars);
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setRatingHover(star)}
                          onMouseLeave={() => setRatingHover(0)}
                          onClick={() => {
                            setSelectedStars(star);
                            onRateApp(star);
                          }}
                          aria-label={bi(`${star} yıldız ver`, `Rate ${star} stars`)}
                          className="p-0.5 cursor-pointer transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              active ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  {shop.ratedApp && (
                    <div className="text-[11px] font-bold text-emerald-400">
                      {bi('Değerlendirmen için teşekkürler!', 'Thank you for rating!')}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-white/8 bg-[#10161F] p-2.5 space-y-1 text-[10px] text-slate-400">
                  <div className="flex items-center justify-between gap-2">
                    <span>
                      {bi('Sürüm', 'Version')}:{' '}
                      <strong className="text-slate-200">
                        v{STORE_RELEASE_META.versionName}
                      </strong>
                    </span>
                    <span className="text-emerald-400 font-semibold">
                      {getPlatformDisplayLabel()}
                    </span>
                  </div>
                  <div className="font-mono text-[9.5px] text-slate-500">
                    {STORE_RELEASE_META.appId} · © 2026 GSM Simulator
                  </div>
                  <div className="text-slate-500 leading-tight">
                    {bi(
                      'Parodi markalar (Samxung, aPhone, PocoPop, RedMix, FoldZ, LuminaCam, NovaFold) tamamen kurgusaldır.',
                      'Parody brands (Samxung, aPhone, PocoPop, RedMix, FoldZ, LuminaCam, NovaFold) are purely fictional.'
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Feedback Box */}
              <div className="col-span-6 rounded-xl border border-white/10 bg-[#182230] p-3 flex flex-col justify-between gap-2">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-100">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                    <span>{bi('Öneri & Hata Bildirimi', 'Feedback & Bug Report')}</span>
                  </div>
                  <textarea
                    rows={4}
                    value={feedbackDraft}
                    onChange={(e) => setFeedbackDraft(e.target.value)}
                    placeholder={bi(
                      'Oyuna eklenmesini istediğin özellik veya hata notu bırak...',
                      'Share a feature request or bug report...'
                    )}
                    className="w-full rounded-lg border border-white/12 bg-[#0F151E] p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    disabled={!feedbackDraft.trim()}
                    onClick={handleSendFeedback}
                    className="rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-40 cursor-pointer"
                  >
                    {bi('Notu Gönder', 'Send Feedback')}
                  </button>
                  {feedbackSent && (
                    <span className="text-[11px] font-bold text-emerald-400">
                      {bi('Kaydedildi!', 'Saved!')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

