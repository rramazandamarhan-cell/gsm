import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FileCheck2,
  FolderOpen,
  ShieldAlert,
  X,
} from 'lucide-react';
import { formatTRY } from '../game/engine';
import { getLocalizedDefect, useLanguage } from '../game/i18n';
import {
  CustomerComplaintRecord,
  CustomerEncounter,
  SoldPhoneRecord,
} from '../game/types';

interface ComplaintArchiveModalProps {
  complaintHistory: CustomerComplaintRecord[];
  soldHistory: SoldPhoneRecord[];
  activeWarrantyEncounter?: CustomerEncounter | null;
  currentDay: number;
  onInspectCertificate: (record: SoldPhoneRecord) => void;
  onClose: () => void;
}

export const ComplaintArchiveModal: React.FC<ComplaintArchiveModalProps> = ({
  complaintHistory,
  soldHistory,
  activeWarrantyEncounter,
  currentDay,
  onInspectCertificate,
  onClose,
}) => {
  const { lang, bi } = useLanguage();
  const [tab, setTab] = useState<'COMPLAINTS' | 'CERTIFICATES'>('COMPLAINTS');

  // Synthesize an OPEN live entry if there's an active unresolved WARRANTY_CLAIM at the counter
  const liveOpenEntry: CustomerComplaintRecord | null =
    activeWarrantyEncounter &&
    activeWarrantyEncounter.type === 'WARRANTY_CLAIM' &&
    activeWarrantyEncounter.outcome === 'ACTIVE' &&
    activeWarrantyEncounter.warrantyRecord
      ? {
          id: `live_${activeWarrantyEncounter.id}`,
          soldRecordId: activeWarrantyEncounter.warrantyRecord.id,
          certificateNo:
            activeWarrantyEncounter.warrantyRecord.certificateNo ??
            `GSM-G${String(activeWarrantyEncounter.warrantyRecord.daySold).padStart(2, '0')}`,
          dayReported: currentDay,
          daySold: activeWarrantyEncounter.warrantyRecord.daySold,
          customerName: activeWarrantyEncounter.customerName,
          deviceName: activeWarrantyEncounter.warrantyRecord.deviceName,
          defectId: activeWarrantyEncounter.warrantyDefectId ?? 'screen_crack',
          faultHeadline: activeWarrantyEncounter.warrantyDefectId
            ? getLocalizedDefect(activeWarrantyEncounter.warrantyDefectId, lang).name
            : bi('Tekrar Arıza Bildirimi', 'Recurring Fault'),
          faultDetail:
            activeWarrantyEncounter.warrantyFaultDetail ??
            bi('Müşteri tezgahta ücretsiz servis bekliyor.', 'Customer waiting at counter.'),
          customerQuote:
            activeWarrantyEncounter.messages[0]?.text ??
            bi('Usta tamir edildi demiştin ama yine arıza verdi!', 'It broke again!'),
          repairQualityAtSale: activeWarrantyEncounter.warrantyRecord.repairQuality,
          wasDisclosed: activeWarrantyEncounter.warrantyRecord.wasDisclosed,
          wasOverseas: activeWarrantyEncounter.warrantyRecord.wasOverseas,
          resolution: 'OPEN',
          costPaid: 0,
          reputationDelta: 0,
        }
      : null;

  const allComplaints = liveOpenEntry
    ? [liveOpenEntry, ...complaintHistory]
    : complaintHistory;

  const openCount = allComplaints.filter((c) => c.resolution === 'OPEN').length;
  const resolvedGoodCount = allComplaints.filter(
    (c) => c.resolution === 'FREE_REPAIR' || c.resolution === 'PARTIAL_REFUND'
  ).length;
  const rejectedCount = allComplaints.filter((c) => c.resolution === 'REJECTED').length;

  const resolutionLabel = (res: CustomerComplaintRecord['resolution']) => {
    if (res === 'OPEN') {
      return {
        text: bi('Açık Dosya (Tezgahta)', 'Open (At Counter)'),
        cls: 'text-amber-300 border-amber-400/40 bg-amber-500/15',
      };
    }
    if (res === 'FREE_REPAIR') {
      return {
        text: bi('Ücretsiz Onarıldı', 'Free Repair Done'),
        cls: 'text-emerald-300 border-emerald-400/35 bg-emerald-500/12',
      };
    }
    if (res === 'PARTIAL_REFUND') {
      return {
        text: bi('Kısmi İade Yapıldı', 'Partial Refund'),
        cls: 'text-sky-300 border-sky-400/35 bg-sky-500/12',
      };
    }
    return {
      text: bi('Reddedildi', 'Rejected'),
      cls: 'text-rose-300 border-rose-400/35 bg-rose-500/12',
    };
  };

  return (
    <div
      className="fixed inset-0 z-[72] flex items-center justify-center bg-black/75 p-2 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={bi('Müşteri Şikayet Dosyası ve Garanti Arşivi', 'Customer Complaint File & Warranty Archive')}
    >
      <div className="w-full max-w-xl h-[86dvh] sm:h-[82dvh] sm:max-h-[460px] flex flex-col rounded-xl border border-white/15 bg-[#121822] text-slate-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between gap-2 border-b border-white/10 bg-[#17202C] px-3 py-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-md border border-rose-400/35 bg-rose-500/15 flex items-center justify-center shrink-0">
              <FolderOpen className="w-3.5 h-3.5 text-rose-300" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-xs font-extrabold text-slate-50 truncate">
                {bi('Müşteri Şikayet Dosyası & Garanti Arşivi', 'Customer Complaint File & Warranties')}
              </h2>
              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[9.5px] text-slate-400 tabular-nums">
                <span>
                  {bi('Toplam Şikayet:', 'Complaints:')} <strong className="text-slate-200">{allComplaints.length}</strong>
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {bi('Çözülen:', 'Resolved:')} <strong className="text-emerald-300">{resolvedGoodCount}</strong>
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {bi('Reddedilen:', 'Rejected:')} <strong className="text-rose-300">{rejectedCount}</strong>
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {bi('Garanti Belgesi:', 'Certificates:')} <strong className="text-amber-300">{soldHistory.length}</strong>
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={bi('Kapat', 'Close')}
            className="w-6 h-6 rounded-md border border-white/10 bg-white/5 flex items-center justify-center text-slate-300 hover:bg-white/10 hover:text-white cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Segmented Tabs */}
        <div className="shrink-0 flex items-center justify-between gap-2 border-b border-white/8 bg-[#141C27] px-3 py-1.5 overflow-x-auto no-scrollbar">
          <div className="inline-flex items-center gap-1 rounded-lg bg-[#0C1118] p-0.5 border border-white/8 shrink-0">
            <button
              type="button"
              onClick={() => setTab('COMPLAINTS')}
              className={`px-2.5 py-0.5 rounded-md text-[10.5px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                tab === 'COMPLAINTS'
                  ? 'bg-rose-500/20 text-rose-200 border border-rose-400/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {bi('Arıza Bildirim Dosyası', 'Fault Reports')} ({allComplaints.length})
              {openCount > 0 && (
                <span className="ml-1 text-[9.5px] font-extrabold text-amber-300">
                  · {openCount} {bi('Açık', 'Open')}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setTab('CERTIFICATES')}
              className={`px-2.5 py-0.5 rounded-md text-[10.5px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                tab === 'CERTIFICATES'
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {bi('Verilen Garanti Belgeleri', 'Issued Warranties')} ({soldHistory.length})
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-2 tabular-nums">
          {tab === 'COMPLAINTS' ? (
            allComplaints.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/60 mb-1.5" />
                <div className="text-xs font-bold text-slate-200">
                  {bi('Henüz Müşteri Şikayeti Yok!', 'No Customer Complaints Yet!')}
                </div>
                <p className="mt-1 text-[10.5px] text-slate-400 max-w-sm">
                  {bi(
                    'Tamir sonrası kaba işçilikten veya beyan edilmeyen kusurlardan dönen müşterilerin tüm arıza bildirimleri burada arşivlenir.',
                    'All post-repair or undisclosed fault comebacks from customers are archived here.'
                  )}
                </p>
              </div>
            ) : (
              allComplaints.map((item) => {
                const badge = resolutionLabel(item.resolution);
                const daysLater = Math.max(1, item.dayReported - item.daySold);
                const linkedRecord = soldHistory.find((r) => r.id === item.soldRecordId);

                return (
                  <div
                    key={item.id}
                    className="rounded-lg border border-white/10 bg-[#0E141D] p-2 space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 text-[11px] font-extrabold text-slate-100">
                          <ShieldAlert className="w-3 h-3 text-rose-400 shrink-0" />
                          <span className="truncate">{item.customerName}</span>
                          <span className="text-slate-500">·</span>
                          <span className="text-amber-200 truncate">{item.deviceName}</span>
                        </div>
                        <div className="text-[9.5px] text-slate-400 mt-0.5">
                          {bi(`Belge #${item.certificateNo}`, `Cert #${item.certificateNo}`)} ·{' '}
                          {bi(`Gün ${item.dayReported}`, `Day ${item.dayReported}`)} (
                          {bi(`${daysLater} gün sonra döndü`, `returned after ${daysLater}d`)})
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`rounded border px-1.5 py-0.5 text-[9px] font-extrabold whitespace-nowrap ${badge.cls}`}
                        >
                          {badge.text}
                        </span>
                        {linkedRecord && (
                          <button
                            type="button"
                            onClick={() => onInspectCertificate(linkedRecord)}
                            className="rounded border border-amber-400/35 bg-amber-500/12 px-1.5 py-0.5 text-[9px] font-bold text-amber-200 hover:bg-amber-500/22 cursor-pointer whitespace-nowrap"
                          >
                            {bi('Garanti Belgesi', 'Certificate')}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="rounded-md border border-white/8 bg-[#151D29] px-2 py-1.5 space-y-0.5">
                      <div className="flex items-center justify-between gap-2 text-[10px]">
                        <span className="font-bold text-rose-300">
                          {bi('Bildirilen Arıza:', 'Reported Fault:')} {item.faultHeadline}
                        </span>
                        {item.repairQualityAtSale && (
                          <span className="text-[9.5px] text-slate-400">
                            {bi('Satıştaki İşçilik:', 'Craft:')}{' '}
                            <strong
                              className={
                                item.repairQualityAtSale === 'ROUGH'
                                  ? 'text-rose-300'
                                  : item.repairQualityAtSale === 'MASTER'
                                  ? 'text-emerald-300'
                                  : 'text-amber-200'
                              }
                            >
                              {item.repairQualityAtSale === 'MASTER'
                                ? bi('Usta İşi', 'Master')
                                : item.repairQualityAtSale === 'ROUGH'
                                ? bi('Kaba İşçilik', 'Rough')
                                : bi('Standart', 'Standard')}
                            </strong>
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-300 leading-snug">
                        {item.faultDetail}
                      </p>
                      <p className="text-[9.5px] text-slate-400 italic">
                        “{item.customerQuote}”
                      </p>
                    </div>

                    {item.resolution !== 'OPEN' && (
                      <div className="flex items-center justify-between text-[9.5px] text-slate-400">
                        <span>
                          {item.wasDisclosed
                            ? bi('Satışta dürüst beyan yapılmıştı', 'Disclosed at sale')
                            : bi('Satışta ek beyan yapılmamıştı', 'Not disclosed at sale')}
                        </span>
                        <div className="flex items-center gap-1.5 font-mono">
                          {item.costPaid > 0 && (
                            <span className="text-rose-300">-{formatTRY(item.costPaid)}</span>
                          )}
                          <span
                            className={
                              item.reputationDelta >= 0 ? 'text-emerald-300' : 'text-rose-400'
                            }
                          >
                            {item.reputationDelta >= 0 ? '+' : ''}
                            {item.reputationDelta.toFixed(2)}★
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )
          ) : soldHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-6">
              <FileCheck2 className="w-8 h-8 text-slate-600 mb-1.5" />
              <div className="text-xs font-bold text-slate-200">
                {bi('Henüz Garanti Belgesi Kesilmedi', 'No Warranty Certificates Issued Yet')}
              </div>
              <p className="mt-1 text-[10.5px] text-slate-400 max-w-sm">
                {bi(
                  'Tamir ettiğin veya sattığın her cihaz için otomatik Garanti Belgesi oluşturulur ve burada saklanır.',
                  'Every device you repair or sell receives a Warranty Certificate archived right here.'
                )}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {soldHistory.map((rec) => {
                const certNo =
                  rec.certificateNo ??
                  `GSM-G${String(rec.daySold).padStart(2, '0')}`;
                const repairedCount = rec.repairedDefects?.length ?? 0;
                const hasComplaint = allComplaints.some(
                  (c) => c.soldRecordId === rec.id
                );

                return (
                  <div
                    key={rec.id}
                    className="rounded-lg border border-white/10 bg-[#0E141D] p-2 flex flex-col justify-between gap-1.5"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[9.5px] font-bold text-amber-300">
                          #{certNo}
                        </span>
                        <span className="text-[9.5px] text-slate-400">
                          {bi(`Gün ${rec.daySold}`, `Day ${rec.daySold}`)} ·{' '}
                          {rec.warrantyDays ?? 30}g {bi('Garanti', 'War.')}
                        </span>
                      </div>
                      <div className="text-[11px] font-extrabold text-slate-100 truncate">
                        {rec.deviceName}
                      </div>
                      <div className="text-[9.5px] text-slate-400 truncate">
                        {rec.customerName} · {formatTRY(rec.salePrice)} ·{' '}
                        {rec.isExpressRepair
                          ? bi('Acil Tamir', 'Express Repair')
                          : bi('Satış', 'Sale')}
                      </div>

                      <div className="flex flex-wrap items-center gap-1 text-[9.5px] pt-0.5">
                        <span
                          className={
                            rec.repairQuality === 'MASTER'
                              ? 'text-emerald-300 font-bold'
                              : rec.repairQuality === 'ROUGH'
                              ? 'text-rose-300 font-bold'
                              : 'text-slate-300'
                          }
                        >
                          {rec.repairQuality === 'MASTER'
                            ? bi('Usta İşi', 'Master')
                            : rec.repairQuality === 'ROUGH'
                            ? bi('Kaba İşçilik', 'Rough')
                            : repairedCount > 0
                            ? bi(`${repairedCount} Parça Onarıldı`, `${repairedCount} Repaired`)
                            : bi('Orijinal', 'Original')}
                        </span>
                        <span className="text-slate-600">·</span>
                        {hasComplaint ? (
                          <span className="inline-flex items-center gap-0.5 text-rose-300 font-bold">
                            <AlertCircle className="w-3 h-3" />
                            {rec.warrantyResolved
                              ? bi('Şikayet Çözüldü', 'Claim Resolved')
                              : bi('Şikayet Açık', 'Claim Open')}
                          </span>
                        ) : rec.warrantyPresented ? (
                          <span className="text-emerald-300 font-semibold">
                            {bi('Mühürlü Teslim', 'Stamped')}
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            {bi('Kayıtlı', 'Logged')}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onInspectCertificate(rec)}
                      className="w-full min-h-[26px] rounded-md border border-amber-400/35 bg-amber-500/12 px-2 py-1 text-[10px] font-extrabold text-amber-200 hover:bg-amber-500/22 cursor-pointer flex items-center justify-center gap-1 touch-manipulation"
                    >
                      <FileCheck2 className="w-3 h-3 shrink-0" />
                      {bi('Garanti Belgesini Aç', 'Open Warranty Certificate')}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
