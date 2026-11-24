import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  FileText,
  MessageSquare,
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
import { ShopState } from '../game/types';

type ComplianceTab = 'SETTINGS' | 'ACHIEVEMENTS' | 'PRIVACY' | 'SUPPORT';

interface StoreComplianceModalProps {
  shop: ShopState;
  muted: boolean;
  onToggleMute: () => void;
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
  onToggleHaptics,
  onSetTextSpeed,
  onAcceptPrivacy,
  onImportSaveJson,
  onDeleteAllData,
  onRateApp,
  onSubmitFeedback,
  onClose,
}) => {
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
    a.download = `gsm-simulator-gun-${shop.day}.json`;
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
      setImportStatus('Pano erişimi engellendi; yedek metni aşağıdaki alana yerleştirildi.');
    }
  };

  const handleImportSubmit = () => {
    if (!importText.trim()) return;
    const ok = onImportSaveJson(importText.trim());
    setImportStatus(
      ok
        ? 'Kayıt yedeği başarıyla yüklendi!'
        : 'Geçersiz JSON yedeği. Lütfen dışa aktardığınız kayıt dosyasını yapıştırın.'
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
    { id: 'SETTINGS', label: 'Ayarlar', icon: <SlidersHorizontal className="w-3.5 h-3.5" /> },
    {
      id: 'ACHIEVEMENTS',
      label: `Başarımlar (${unlockedCount}/${STORE_ACHIEVEMENTS.length})`,
      icon: <Trophy className="w-3.5 h-3.5" />,
    },
    { id: 'PRIVACY', label: 'Gizlilik & Veri', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'SUPPORT', label: 'Mağaza & Destek', icon: <Star className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/80 p-2 sm:p-4 overflow-y-auto pasaj-scroll">
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-2xl my-auto rounded-2xl border border-white/12 bg-[#141C27] shadow-2xl overflow-hidden flex flex-col max-h-[94dvh]"
      >
        {/* Header */}
        <div className="px-3.5 sm:px-5 py-3 sm:py-4 border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
          <div>
            <div className="text-[10.5px] font-semibold text-amber-400">
              GOOGLE PLAY & APP STORE UYUMLULUK MERKEZİ
            </div>
            <h2 className="font-display text-base sm:text-xl font-extrabold text-slate-50">
              Ayarlar, Başarımlar & Gizlilik
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-white/10 bg-[#1E2836] text-slate-300 hover:text-slate-50 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-nav */}
        <div className="px-3.5 sm:px-5 py-2 border-b border-white/8 flex flex-wrap gap-1.5 bg-[#10161F] shrink-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                tab === t.id
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-300 hover:bg-white/[0.06] hover:text-slate-50'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto pasaj-scroll p-3.5 sm:p-5 space-y-3.5 sm:space-y-4">
          {tab === 'SETTINGS' && (
            <div className="space-y-3.5">
              <div className="rounded-xl border border-white/10 bg-[#182230] p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {muted ? (
                    <VolumeX className="w-5 h-5 text-slate-400" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-amber-400" />
                  )}
                  <div>
                    <div className="text-sm font-bold text-slate-100">Ses Efektleri & Kapı Zili</div>
                    <div className="text-xs text-slate-400">
                      Tezgah, tamir masası ve kasa seslerini aç/kapat.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onToggleMute}
                  className={`rounded-lg px-4 py-2 text-xs font-bold cursor-pointer ${
                    muted
                      ? 'border border-white/15 bg-[#10161F] text-slate-300'
                      : 'bg-emerald-500 text-slate-950'
                  }`}
                >
                  {muted ? 'Kapalı' : 'Açık'}
                </button>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#182230] p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-slate-100">Dokunsal Titreşim (Haptic Feedback)</div>
                  <div className="text-xs text-slate-400">
                    Mobil cihazlarda vida sökme, anlaşma ve bildirim titreşimi.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onToggleHaptics}
                  className={`rounded-lg px-4 py-2 text-xs font-bold cursor-pointer ${
                    shop.hapticsEnabled
                      ? 'bg-emerald-500 text-slate-950'
                      : 'border border-white/15 bg-[#10161F] text-slate-300'
                  }`}
                >
                  {shop.hapticsEnabled ? 'Açık' : 'Kapalı'}
                </button>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#182230] p-4 space-y-2.5">
                <div>
                  <div className="text-sm font-bold text-slate-100">Müşteri Diyalog Yazı Hızı</div>
                  <div className="text-xs text-slate-400">
                    Konuşma balonlarının ekrana yazılma hızını seç.
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'normal', label: 'Normal' },
                      { id: 'fast', label: 'Hızlı' },
                      { id: 'instant', label: 'Anında' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onSetTextSpeed(opt.id)}
                      className={`rounded-lg py-2 text-xs font-bold cursor-pointer transition-colors ${
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
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center justify-between tabular-nums">
                <div>
                  <div className="text-xs font-semibold text-amber-300">
                    Google Play Games / Game Center Profili
                  </div>
                  <div className="font-display text-lg font-extrabold text-slate-50">
                    {unlockedCount} / {STORE_ACHIEVEMENTS.length} Başarım Açıldı
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-amber-200">Başarım Puanı</div>
                  <div className="font-mono text-xl font-extrabold text-amber-400">
                    {totalPoints} / {maxPoints} P
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {STORE_ACHIEVEMENTS.map((ach) => {
                  const unlocked = ach.check(shop);
                  return (
                    <div
                      key={ach.id}
                      className={`rounded-xl border p-3.5 ${
                        unlocked
                          ? 'border-emerald-500/35 bg-emerald-500/10'
                          : 'border-white/8 bg-[#182230] opacity-75'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-display text-sm font-bold text-slate-100">
                          {ach.title}
                        </div>
                        <span
                          className={`font-mono text-[11px] font-bold ${
                            unlocked ? 'text-emerald-400' : 'text-slate-500'
                          }`}
                        >
                          +{ach.points}P
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{ach.description}</p>
                      <div className="mt-2 text-[11px] font-semibold">
                        {unlocked ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400">
                            <Check className="w-3.5 h-3.5" />
                            <span>Kazanıldı</span>
                          </span>
                        ) : (
                          <span className="text-slate-500">Devam Ediyor...</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'PRIVACY' && (
            <div className="space-y-4">
              {/* KVKK / GDPR Privacy Summary */}
              <div className="rounded-xl border border-white/10 bg-[#182230] p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-100">
                    <FileText className="w-4 h-4 text-sky-400" />
                    <span>Gizlilik Politikası (KVKK & GDPR)</span>
                  </span>
                  {shop.privacyAccepted ? (
                    <span className="text-xs font-bold text-emerald-400">Onaylandı</span>
                  ) : (
                    <button
                      type="button"
                      onClick={onAcceptPrivacy}
                      className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-bold text-slate-950 cursor-pointer"
                    >
                      Okudum, Onaylıyorum
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>GSM Simulator</strong> oyun ilerlemenizi yalnızca kendi cihazınızdaki yerel depolama alanında (localStorage) saklar. Kişisel kimlik, rehber, konum, reklam kimliği (IDFA/AAID) veya ödeme bilgisi toplamaz ve üçüncü taraflarla paylaşmaz.
                </p>

                {/* Google Play Data Safety & App Store Privacy Nutrition Label */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="rounded-lg border border-emerald-500/25 bg-[#101722] p-2">
                    <div className="text-[10px] text-slate-400">Toplanan Veri</div>
                    <div className="text-xs font-bold text-emerald-400">Yok (0)</div>
                  </div>
                  <div className="rounded-lg border border-emerald-500/25 bg-[#101722] p-2">
                    <div className="text-[10px] text-slate-400">3. Taraf Paylaşımı</div>
                    <div className="text-xs font-bold text-emerald-400">Yok</div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-[#101722] p-2">
                    <div className="text-[10px] text-slate-400">Depolama</div>
                    <div className="text-xs font-bold text-slate-100">Cihaz İçi</div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-[#101722] p-2">
                    <div className="text-[10px] text-slate-400">Derecelendirme</div>
                    <div className="text-xs font-bold text-amber-300">PEGI 3 / 4+</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                  <a
                    href="/privacy.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-sky-400 hover:text-sky-300 underline"
                  >
                    <span>Tam Gizlilik Politikası</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="/terms.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-sky-400 hover:text-sky-300 underline"
                  >
                    <span>Kullanım Koşulları & Parodi Beyanı</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Save Backup Export & Import */}
              <div className="rounded-xl border border-white/10 bg-[#182230] p-4 space-y-3">
                <div className="text-sm font-bold text-slate-100">
                  Cihazlar Arası Kayıt Yedeği (JSON)
                </div>
                <p className="text-xs text-slate-400">
                  Telefon değiştirirken veya APK güncellerken kariyerini kaybetmemek için yedeğini indirebilir veya mobil WebView için doğrudan panoya kopyalayabilirsin.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportSave}
                    className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-sky-400 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{exportCopied ? 'Yedek İndirildi!' : 'Dosya İndir (.json)'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopySaveToClipboard}
                    className="inline-flex items-center gap-2 rounded-lg border border-sky-400/40 bg-sky-500/12 px-3.5 py-2 text-xs font-bold text-sky-200 hover:bg-sky-500/20 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{clipboardCopied ? 'Panoya Kopyalandı!' : 'JSON Panoya Kopyala'}</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-white/8 space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Yedek JSON Yapıştır & Geri Yükle
                  </label>
                  <textarea
                    rows={3}
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder='{"day": 5, "cash": 24500, ...}'
                    className="w-full rounded-lg border border-white/12 bg-[#0F151E] p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      disabled={!importText.trim()}
                      onClick={handleImportSubmit}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/15 px-3.5 py-2 text-xs font-bold text-amber-200 hover:bg-amber-500/25 disabled:opacity-40 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Yedeği İçe Aktar</span>
                    </button>
                    {importStatus && (
                      <span className="text-xs text-amber-300">{importStatus}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Permanent Data Deletion (Mandatory for App Store & Play Store) */}
              <div className="rounded-xl border border-rose-500/35 bg-rose-500/8 p-4 space-y-2.5">
                <div className="text-sm font-bold text-rose-300 flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4" />
                  <span>Tüm Verileri Kalıcı Olarak Sil (Hesap & Kariyer Sıfırlama)</span>
                </div>
                <p className="text-xs text-rose-100/80">
                  Google Play ve App Store veri silme politikası gereği cihazdaki tüm kayıtlarınızı, başarımlarınızı ve tercihlerinizi geri döndürülemez biçimde silebilirsiniz.
                </p>
                {!confirmDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="rounded-lg border border-rose-500/50 bg-rose-500/15 px-4 py-2 text-xs font-bold text-rose-200 hover:bg-rose-500/25 cursor-pointer"
                  >
                    Tüm Oyun Verilerini Sil...
                  </button>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmDelete(false);
                        onDeleteAllData();
                      }}
                      className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-rose-500 cursor-pointer"
                    >
                      Evet, Kalıcı Olarak Sil ve Sıfırla
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="rounded-lg border border-white/15 bg-[#1B2533] px-3.5 py-2 text-xs font-semibold text-slate-200 cursor-pointer"
                    >
                      Vazgeç
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'SUPPORT' && (
            <div className="space-y-4">
              {/* Rate Us */}
              <div className="rounded-xl border border-amber-500/30 bg-[#182230] p-4 text-center space-y-2.5">
                <div className="font-display text-base font-bold text-slate-100">
                  GSM Simulator’ı Beğendin mi? Bizi Değerlendir!
                </div>
                <p className="text-xs text-slate-400">
                  Mağaza puanın yeni telefon modelleri ve güncellemeler geliştirmemize güç verir.
                </p>
                <div className="flex items-center justify-center gap-2 py-1">
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
                        aria-label={`${star} yıldız ver`}
                        className="p-1 cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            active
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                {shop.ratedApp && (
                  <div className="text-xs font-bold text-emerald-400">
                    Değerlendirmen için çok teşekkürler!
                  </div>
                )}
              </div>

              {/* Feedback Note Box */}
              <div className="rounded-xl border border-white/10 bg-[#182230] p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  <span>Geliştiriciye Öneri & Hata Bildirimi</span>
                </div>
                <textarea
                  rows={3}
                  value={feedbackDraft}
                  onChange={(e) => setFeedbackDraft(e.target.value)}
                  placeholder="Oyuna eklenmesini istediğin özellik veya fark ettiğin bir hata varsa not bırak..."
                  className="w-full rounded-lg border border-white/12 bg-[#0F151E] p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                />
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    disabled={!feedbackDraft.trim()}
                    onClick={handleSendFeedback}
                    className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-40 cursor-pointer"
                  >
                    Notu Kaydet & Gönder
                  </button>
                  {feedbackSent && (
                    <span className="text-xs font-bold text-emerald-400">
                      Geri bildirimin kaydedildi!
                    </span>
                  )}
                </div>
                {shop.feedbackNotes.length > 0 && (
                  <div className="pt-2 border-t border-white/8 space-y-1">
                    <div className="text-[11px] text-slate-400">
                      Kaydedilen Notların ({shop.feedbackNotes.length}):
                    </div>
                    {shop.feedbackNotes.slice(0, 3).map((n, i) => (
                      <div key={i} className="text-xs text-slate-300 bg-[#111720] rounded px-2.5 py-1.5">
                        {n}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Build Version & Legal Notice */}
              <div className="rounded-xl border border-white/8 bg-[#10161F] p-3.5 space-y-1.5 text-[11px] text-slate-400">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>Sürüm: <strong className="text-slate-200">v2.1.0-store</strong> (Android APK & iOS PWA Hazır)</span>
                  <span>© 2026 GSM Simulator</span>
                </div>
                <div className="text-slate-500">
                  Parodi marka adları (Samxung, aPhone, PocoPop, RedMix, FoldZ, LuminaCam, NovaFold) tamamen kurgusaldır; gerçek markalarla resmi bağı yoktur. Oyun içi para, kredi ve vergi yalnızca simülasyon amaçlıdır.
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
