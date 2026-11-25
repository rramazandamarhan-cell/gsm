import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  FileCheck2,
  ShieldCheck,
  Stamp,
  X,
} from 'lucide-react';
import { formatTRY } from '../game/engine';
import { getLocalizedDefect, useLanguage } from '../game/i18n';
import { PartOriginGrade, SoldPhoneRecord } from '../game/types';

interface WarrantyCertificateModalProps {
  record: SoldPhoneRecord;
  shopName?: string;
  mode: 'HANDOVER' | 'INSPECT';
  onStampAndDeliver?: (recordId: string) => void;
  onClose: () => void;
}

const ORIGIN_SHORT: Record<PartOriginGrade, { tr: string; en: string; cls: string }> = {
  ORIGINAL_FACTORY: {
    tr: 'Orijinal',
    en: 'Original',
    cls: 'text-emerald-300',
  },
  OEM_STOCK: {
    tr: 'OEM Stok',
    en: 'OEM Stock',
    cls: 'text-sky-300',
  },
  SERVICE_PART: {
    tr: 'Servis Parçası',
    en: 'Service Part',
    cls: 'text-amber-300',
  },
  AFTERMARKET: {
    tr: 'Yan Sanayi',
    en: 'Aftermarket',
    cls: 'text-rose-300',
  },
};

export const WarrantyCertificateModal: React.FC<WarrantyCertificateModalProps> = ({
  record,
  shopName = 'PASAJ GSM TEKNİK SERVİS',
  mode,
  onStampAndDeliver,
  onClose,
}) => {
  const { lang, bi } = useLanguage();
  const [justStamped, setJustStamped] = useState(false);

  const isPresented = Boolean(record.warrantyPresented) || justStamped;
  const certNo = record.certificateNo ?? `GSM-G${String(record.daySold).padStart(2, '0')}-0101`;
  const warrantyDays =
    record.warrantyDays ??
    (record.repairQuality === 'MASTER'
      ? 90
      : record.repairQuality === 'ROUGH'
      ? 14
      : 30);

  const qualityLabel =
    record.repairQuality === 'MASTER'
      ? bi('Usta İşi Kalibrasyon', 'Master Craft Calibration')
      : record.repairQuality === 'ROUGH'
      ? bi('Kaba İşçilik (Sınırlı)', 'Rough Craft (Limited)')
      : (record.repairedDefects?.length ?? 0) > 0
      ? bi('Standart Atölye Onarımı', 'Standard Bench Repair')
      : bi('Orijinal Ekspertiz Onaylı', 'Original Bench Inspected');

  const qualityBadgeCls =
    record.repairQuality === 'MASTER'
      ? 'text-emerald-300 border-emerald-400/40 bg-emerald-500/12'
      : record.repairQuality === 'ROUGH'
      ? 'text-rose-300 border-rose-400/40 bg-rose-500/12'
      : 'text-amber-200 border-amber-400/40 bg-amber-500/12';

  const handleDeliver = () => {
    setJustStamped(true);
    if (onStampAndDeliver) {
      onStampAndDeliver(record.id);
    }
    window.setTimeout(() => {
      onClose();
    }, 520);
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-2.5 sm:p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={bi('Pasaj GSM Garanti Belgesi', 'Pasaj GSM Warranty Certificate')}
    >
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl border border-amber-400/40 bg-[#121822] text-slate-100 shadow-2xl overflow-hidden">
        {/* Official Certificate Top Strip */}
        <div className="shrink-0 flex items-center justify-between gap-3 border-b border-amber-400/25 bg-gradient-to-r from-[#1D2432] via-[#22242E] to-[#1A212D] px-4 py-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg border border-amber-400/45 bg-amber-500/15 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-4 h-4 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold tracking-wider text-amber-300 truncate">
                {shopName}
              </div>
              <h2 className="font-display text-sm font-extrabold text-slate-50 truncate">
                {bi('Resmi Esnaf Garanti Belgesi', 'Official Shop Warranty Certificate')}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="font-mono text-[10.5px] font-bold text-amber-200 tabular-nums">
              #{certNo}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label={bi('Kapat', 'Close')}
              className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-slate-300 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Certificate Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-4 space-y-3 tabular-nums">
          {/* Customer & Device Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="rounded-lg border border-white/10 bg-[#0D131B] px-2.5 py-1.5">
              <div className="text-[9.5px] text-slate-400">{bi('Müşteri', 'Customer')}</div>
              <div className="font-bold text-slate-100 truncate">{record.customerName}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-[#0D131B] px-2.5 py-1.5">
              <div className="text-[9.5px] text-slate-400">{bi('Cihaz', 'Device')}</div>
              <div className="font-bold text-slate-100 truncate">{record.deviceName}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-[#0D131B] px-2.5 py-1.5">
              <div className="text-[9.5px] text-slate-400">
                {bi('İşlem / Teslim', 'Service / Day')}
              </div>
              <div className="font-mono font-bold text-amber-300">
                {bi(`Gün ${record.daySold}`, `Day ${record.daySold}`)} · {formatTRY(record.salePrice)}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-[#0D131B] px-2.5 py-1.5">
              <div className="text-[9.5px] text-slate-400">{bi('Garanti Süresi', 'Coverage')}</div>
              <div className="font-extrabold text-emerald-300">
                {warrantyDays} {bi('Gün', 'Days')}
              </div>
            </div>
          </div>

          {/* IMEI + Craftsmanship Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#0D131B] px-3 py-2 text-[11px]">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-slate-400">{bi('IMEI:', 'IMEI:')}</span>
              <span className="font-mono font-semibold text-slate-200 truncate">
                {record.imeiNumber ?? bi('Kayıtlı Seri', 'Logged Serial')}
              </span>
              <span className="text-slate-500">·</span>
              <span
                className={`font-bold ${
                  record.wasOverseas ? 'text-rose-300' : 'text-emerald-300'
                }`}
              >
                {record.wasOverseas
                  ? bi('Yurtdışı Kayıtsız', 'Overseas Unreg')
                  : bi('TR Kayıtlı', 'TR Registered')}
              </span>
            </div>
            <span
              className={`rounded-md border px-2 py-0.5 text-[10px] font-extrabold whitespace-nowrap ${qualityBadgeCls}`}
            >
              {qualityLabel}
            </span>
          </div>

          {/* Parts Breakdown & Performed Work */}
          <div className="rounded-xl border border-white/10 bg-[#0D131B] overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/8 px-3 py-1.5 text-[10.5px] font-bold text-slate-300">
              <span>{bi('Parça Durumu & Yapılan İşlemler', 'Part Status & Service Log')}</span>
              <span className="text-[10px] text-slate-400 font-normal">
                {record.isExpressRepair
                  ? bi('Acil Servis Teslimi', 'Express Repair')
                  : bi('Satış & Ekspertiz', 'Retail Sale')}
              </span>
            </div>

            {record.partBreakdown && record.partBreakdown.length > 0 ? (
              <div className="divide-y divide-white/8">
                {record.partBreakdown.map((row) => {
                  const o = ORIGIN_SHORT[row.origin];
                  return (
                    <div
                      key={row.component}
                      className="flex items-center justify-between gap-2 px-3 py-1.5 text-[11px]"
                    >
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-100">
                          {lang === 'en' ? row.enLabel : row.label}
                        </span>
                        <span className="text-slate-500 mx-1.5">·</span>
                        <span className="text-slate-400 text-[10.5px]">
                          {lang === 'en' ? row.enNote : row.note}
                        </span>
                      </div>
                      <span className={`font-extrabold text-[10px] shrink-0 ${o.cls}`}>
                        {lang === 'en' ? o.en : o.tr}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-3 py-2 text-[11px] text-slate-300">
                {(record.repairedDefects?.length ?? 0) > 0
                  ? `${bi('Onarılan parçalar:', 'Repaired parts:')} ${record.repairedDefects!
                      .map((d) => getLocalizedDefect(d, lang).name)
                      .join(', ')}`
                  : bi(
                      'Fabrika çıkışı orijinal donanım kontrol edildi ve teslim edildi.',
                      'Factory original hardware inspected and delivered.'
                    )}
              </div>
            )}
          </div>

          {/* Esnaf Guarantee Stamp & Witty Terms */}
          <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-400/25 bg-amber-500/[0.07] px-3 py-2">
            <div className="min-w-0 space-y-0.5">
              <div className="text-[10px] font-extrabold text-amber-300">
                {bi('Pasaj Güvence Şartı', 'Shop Guarantee Note')}
              </div>
              <p className="text-[10.5px] text-slate-200 leading-snug">
                {record.craftsmanNote ??
                  bi(
                    'Sıvı teması, duvara fırlatma ve kuzenin şifre kilitlemesi hariç parça & işçilik güvencemiz altındadır!',
                    'Covered for bench parts & labor (tea spills and wall-throws excluded!).'
                  )}
              </p>
            </div>

            <div
              className={`shrink-0 rounded-xl border-2 px-2.5 py-1.5 text-center transition-transform duration-200 ${
                isPresented
                  ? 'border-emerald-400/80 bg-emerald-500/15 text-emerald-300 -rotate-3 scale-105'
                  : 'border-amber-400/40 bg-amber-500/10 text-amber-200'
              }`}
            >
              <div className="flex items-center justify-center gap-1 text-[9.5px] font-extrabold tracking-wider">
                {isPresented ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <Award className="w-3.5 h-3.5" />
                )}
                {isPresented
                  ? bi('TESLİM EDİLDİ', 'DELIVERED')
                  : bi('ONAY BEKLİYOR', 'READY')}
              </div>
              <div className="font-mono text-[9px] opacity-80">
                {bi(`GÜN ${record.daySold}`, `DAY ${record.daySold}`)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="shrink-0 flex items-center justify-between gap-2 border-t border-white/10 bg-[#18212E] px-4 py-2.5">
          <div className="text-[10.5px] text-slate-400 truncate">
            {record.wasDisclosed
              ? bi('✓ Dürüst beyan belgeli · Şikayet Kalkanı aktif', '✓ Disclosed on record · Shield active')
              : bi('Belge Şikayet & Garanti Arşivine kaydedildi.', 'Logged in Complaint & Warranty Archive.')}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {mode === 'HANDOVER' && !isPresented && onStampAndDeliver ? (
              <button
                type="button"
                onClick={handleDeliver}
                className="min-h-[36px] inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-extrabold text-slate-950 hover:bg-emerald-400 cursor-pointer whitespace-nowrap touch-manipulation"
              >
                <Stamp className="w-4 h-4 shrink-0" />
                {bi('Mühürle & Müşteriye Sun (+0.03★)', 'Stamp & Hand Over (+0.03★)')}
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="min-h-[36px] inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-extrabold text-slate-950 hover:bg-amber-400 cursor-pointer whitespace-nowrap touch-manipulation"
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                {bi('Tamam', 'Done')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
