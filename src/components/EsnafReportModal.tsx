import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  ShieldCheck,
  Wrench,
  X,
} from 'lucide-react';
import {
  buildDevicePartBreakdown,
  buildWittyEsnafReportNote,
} from '../game/engine';
import { getLocalizedDefect, useLanguage } from '../game/i18n';
import { PartOriginGrade, PhoneDevice } from '../game/types';

interface EsnafReportModalProps {
  device: PhoneDevice;
  customerName: string;
  alreadyDisclosed: boolean;
  canDisclose: boolean;
  onDiscloseAndPresent: () => void;
  onClose: () => void;
}

const ORIGIN_META: Record<
  PartOriginGrade,
  { tr: string; en: string; textClass: string; bgClass: string }
> = {
  ORIGINAL_FACTORY: {
    tr: 'Orijinal (Fabrika)',
    en: 'Factory Original',
    textClass: 'text-emerald-300',
    bgClass: 'bg-emerald-500/12 border-emerald-400/30',
  },
  OEM_STOCK: {
    tr: 'OEM Stok Parça',
    en: 'OEM Stock Part',
    textClass: 'text-sky-300',
    bgClass: 'bg-sky-500/12 border-sky-400/30',
  },
  SERVICE_PART: {
    tr: 'Servis Parçası',
    en: 'Service Part',
    textClass: 'text-amber-300',
    bgClass: 'bg-amber-500/12 border-amber-400/30',
  },
  AFTERMARKET: {
    tr: 'Yan Sanayi / Riskli',
    en: 'Aftermarket / Alert',
    textClass: 'text-rose-300',
    bgClass: 'bg-rose-500/15 border-rose-400/35',
  },
};

export const EsnafReportModal: React.FC<EsnafReportModalProps> = ({
  device,
  customerName,
  alreadyDisclosed,
  canDisclose,
  onDiscloseAndPresent,
  onClose,
}) => {
  const { lang, bi } = useLanguage();
  const rows = buildDevicePartBreakdown(device);
  const witty = buildWittyEsnafReportNote(device);
  const isOverseas =
    device.imeiStatus === 'UNREGISTERED_OVERSEAS' ||
    device.defects.includes('imei_unregistered');
  const repairedList = device.repairedDefects ?? [];

  const qualityText =
    device.lastRepairQuality === 'MASTER' || device.masterCrafted
      ? bi('Usta İşi (TrueTone & Conta Tam)', 'Master Craft (TrueTone & Seals OK)')
      : device.lastRepairQuality === 'ROUGH'
      ? bi('Kaba İşçilik (Dikkat: Geri Dönüş Riski)', 'Rough Craft (Comeback Risk)')
      : repairedList.length > 0
      ? bi('Standart Atölye Servisi', 'Standard Bench Service')
      : bi('İşlemsiz / Fabrika Montajı', 'Untouched / Factory Assembly');

  const qualityTone =
    device.lastRepairQuality === 'MASTER' || device.masterCrafted
      ? 'text-emerald-300'
      : device.lastRepairQuality === 'ROUGH'
      ? 'text-rose-300'
      : 'text-amber-200';

  return (
    <div
      className="fixed inset-0 z-[75] flex items-center justify-center bg-black/75 p-2.5 sm:p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={bi('Esnaf Onarım Raporu', 'Merchant Repair Report')}
    >
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border border-amber-400/30 bg-[#131A24] text-slate-100 shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="shrink-0 flex items-center justify-between gap-3 border-b border-white/10 bg-[#18212E] px-4 py-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg border border-amber-400/35 bg-amber-500/15 flex items-center justify-center shrink-0">
              <ClipboardCheck className="w-4 h-4 text-amber-300" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-sm font-extrabold text-amber-200 truncate">
                {bi('Esnaf Onarım & Orijinallik Raporu', 'Merchant Repair & Origin Report')}
              </h2>
              <div className="text-[10.5px] text-slate-400 truncate tabular-nums">
                {device.brand} {device.model} · {device.storage} · {bi('Alıcı', 'Buyer')}: {customerName}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={bi('Kapat', 'Close')}
            className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-slate-300 hover:bg-white/10 hover:text-white cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-4 space-y-3 tabular-nums">
          {/* Top Key Summary: IMEI + Craftsmanship + Warranty */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="rounded-xl border border-white/10 bg-[#0E141D] px-3 py-2">
              <div className="text-[10px] font-semibold text-slate-400">
                {bi('IMEI & BTK Durumu', 'IMEI & Registration')}
              </div>
              <div
                className={`mt-0.5 text-xs font-extrabold ${
                  isOverseas ? 'text-rose-300' : 'text-emerald-300'
                }`}
              >
                {isOverseas
                  ? bi('Yurtdışı Kayıtsız (120 Gün)', 'Overseas Unregistered')
                  : bi('TR Kayıtlı · Temiz IMEI', 'TR Registered · Clean')}
              </div>
              <div className="mt-0.5 font-mono text-[10px] text-slate-400 truncate">
                {device.imeiNumber}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0E141D] px-3 py-2">
              <div className="text-[10px] font-semibold text-slate-400">
                {bi('İşçilik & Kalibrasyon', 'Craftsmanship & Calibration')}
              </div>
              <div className={`mt-0.5 text-xs font-extrabold ${qualityTone}`}>
                {qualityText}
              </div>
              <div className="mt-0.5 text-[10px] text-slate-400 truncate">
                {repairedList.length > 0
                  ? `${repairedList.length} ${bi('işlem yapıldı', 'repairs logged')}`
                  : bi('Atölye işlemi yok', 'No bench work')}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0E141D] px-3 py-2">
              <div className="text-[10px] font-semibold text-slate-400">
                {bi('Teslim Garanti Kapsamı', 'Delivery Warranty')}
              </div>
              <div className="mt-0.5 text-xs font-extrabold text-amber-300">
                {witty.warrantyDays} {bi('Gün Pasaj Garantisi', 'Days Shop Warranty')}
              </div>
              <div className="mt-0.5 text-[10px] text-slate-400 truncate">
                {lang === 'en' ? witty.sealLabelEn : witty.sealLabelTr}
              </div>
            </div>
          </div>

          {/* 4-Component Origin Breakdown Table */}
          <div className="rounded-xl border border-white/10 bg-[#0E141D] overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/8 bg-white/[0.02] px-3 py-1.5 text-[10.5px] font-bold text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                {bi('Parça Orijinallik & Değişim Karnesi', 'Part Origin & Replacement Ledger')}
              </span>
              <span className="text-[10px] font-normal text-slate-400">
                {bi('Orijinal / OEM / Yan Sanayi', 'Original / OEM / Aftermarket')}
              </span>
            </div>

            <div className="divide-y divide-white/8">
              {rows.map((row) => {
                const meta = ORIGIN_META[row.origin];
                return (
                  <div
                    key={row.component}
                    className="flex items-center justify-between gap-3 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-100">
                        {lang === 'en' ? row.enLabel : row.label}
                      </div>
                      <div className="text-[10.5px] text-slate-400 leading-snug">
                        {lang === 'en' ? row.enNote : row.note}
                      </div>
                    </div>
                    <div
                      className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-extrabold whitespace-nowrap ${meta.bgClass} ${meta.textClass}`}
                    >
                      {lang === 'en' ? meta.en : meta.tr}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Repaired Defects List (if any) */}
          {repairedList.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-[10.5px] text-slate-300 px-1">
              <span className="font-bold text-amber-300">
                {bi('Atölyede Onarılanlar:', 'Bench Repairs Completed:')}
              </span>
              <span>
                {repairedList
                  .map((d) => getLocalizedDefect(d, lang).name)
                  .join(' · ')}
              </span>
            </div>
          )}

          {/* Witty Esnaf Note */}
          <div className="rounded-xl border border-amber-400/25 bg-amber-500/[0.08] px-3.5 py-2.5">
            <div className="text-[10px] font-extrabold tracking-wide text-amber-300">
              {bi('Yeminli Pasaj Esnafı Yorumu', 'Honest Shopkeeper Note')}
            </div>
            <p className="mt-1 text-xs text-slate-100 leading-relaxed italic">
              “{lang === 'en' ? witty.en : witty.tr}”
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-[#18212E] px-4 py-2.5">
          <div className="flex items-center gap-1.5 text-[10.5px] text-slate-300">
            {alreadyDisclosed ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-emerald-300 font-semibold">
                  {bi(
                    'Bu rapor müşteriye dürüstçe beyan edildi (+İtibar · Şikayet Kalkanı).',
                    'Report disclosed honestly to buyer (+Rep · Complaint Shield).'
                  )}
                </span>
              </>
            ) : canDisclose ? (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {bi(
                    'Raporu paylaşmak güveni artırır ve 3–5 gün sonraki şikayet riskini düşürür.',
                    'Sharing this report boosts trust and lowers 3–5 day comeback risk.'
                  )}
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {bi(
                    'Cihaz değişensiz ve TR kayıtlı — ek beyan gerekmiyor.',
                    'Device is untouched & TR registered — no extra disclosure needed.'
                  )}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {canDisclose && !alreadyDisclosed && (
              <button
                type="button"
                onClick={() => {
                  onDiscloseAndPresent();
                  onClose();
                }}
                className="min-h-[36px] inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-3.5 py-1.5 text-xs font-extrabold text-slate-950 hover:bg-sky-400 cursor-pointer whitespace-nowrap touch-manipulation"
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                {bi('Raporu Sun & Dürüst Beyan Et', 'Present Report & Disclose')}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="min-h-[36px] rounded-lg border border-white/15 bg-[#232F40] px-3.5 py-1.5 text-xs font-bold text-slate-100 hover:bg-[#2C3B50] cursor-pointer whitespace-nowrap touch-manipulation"
            >
              {bi('Kapat', 'Close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
