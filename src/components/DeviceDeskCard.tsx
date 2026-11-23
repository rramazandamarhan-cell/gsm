import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Award,
  BatteryCharging,
  ChevronDown,
  PackageCheck,
  ScanLine,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import {
  calculateMarketValue,
  formatTRY,
  getConditionInfo,
} from '../game/engine';
import { soundFX } from '../game/sound';
import { DailyMarketEvent, EncounterType, PhoneDevice } from '../game/types';
import { PhoneInspectSVG } from './PhoneInspectSVG';

interface DeviceDeskCardProps {
  device: PhoneDevice;
  encounterType: EncounterType;
  dailyNews: DailyMarketEvent;
  expanded: boolean;
  onToggleExpand: () => void;
}

export const DeviceDeskCard: React.FC<DeviceDeskCardProps> = ({
  device,
  encounterType,
  dailyNews,
  expanded,
  onToggleExpand,
}) => {
  const isSeller = encounterType === 'SELLER';
  const inspectedCount = Object.values(device.inspected).filter(Boolean).length;
  const estimatedValue = calculateMarketValue(device, isSeller, dailyNews);
  const condition = getConditionInfo(device);

  const showCondition = !isSeller || inspectedCount > 0;
  const conditionText = !showCondition
    ? 'Ekspertiz Bekliyor'
    : device.isBrandNew
    ? 'Sıfır · Kapalı Kutu (100/100)'
    : `${condition.label} (${condition.score}/100)`;

  const conditionToneClass = !showCondition
    ? 'text-slate-400'
    : condition.tone === 'positive'
    ? 'text-emerald-400'
    : condition.tone === 'warning'
    ? 'text-amber-400'
    : condition.tone === 'danger'
    ? 'text-rose-400'
    : 'text-slate-200';

  const totalCostBasis = device.purchasePrice + device.repairSpend;

  const handleToggle = () => {
    soundFX.playClick();
    onToggleExpand();
  };

  return (
    <motion.div
      initial={{ y: -22, scale: 1.03, opacity: 0.25 }}
      animate={{ y: 0, scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 360, damping: 26 }}
      className="rounded-xl border border-white/12 bg-[#121822] overflow-hidden shrink-0"
    >
      {/* Clickable Summary Header — Model, Condition, Market Value + Expand Affordance */}
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={expanded}
        className="w-full text-left px-3.5 py-3 flex items-center justify-between gap-3 hover:bg-white/[0.03] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Miniature Device Silhouette Swatch */}
          <div
            className="h-11 w-8 rounded-lg border flex flex-col items-center justify-between p-1 shrink-0"
            style={{
              backgroundColor: device.bodyColor,
              borderColor: device.isBrandNew ? '#34D399' : device.accentColor,
            }}
          >
            <span className="h-1 w-3 rounded-full bg-black/50" />
            <Smartphone className="w-3.5 h-3.5 text-white/85" />
            <span className="h-0.5 w-2.5 rounded-full bg-white/30" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="font-display text-base font-bold text-slate-50 truncate leading-tight">
                {device.brand} {device.model}
              </h3>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[11px] tabular-nums">
              <span className="text-slate-400">{device.storage}</span>
              <span aria-hidden="true" className="text-white/20">·</span>
              <span className={`font-semibold ${conditionToneClass}`}>
                {conditionText}
              </span>
              {device.masterCrafted && (
                <>
                  <span aria-hidden="true" className="text-white/20">·</span>
                  <span className="font-semibold text-amber-400">Usta İşi</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 tabular-nums">
          {encounterType !== 'EXPRESS_REPAIR' && (
            <div className="text-right">
              <div className="text-[10px] text-slate-500">
                {isSeller ? 'Tahmini Piyasa' : 'Piyasa Değeri'}
              </div>
              <div className="font-mono text-sm font-extrabold text-amber-400">
                {formatTRY(estimatedValue)}
              </div>
            </div>
          )}

          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-[#1B2533] text-slate-300">
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                expanded ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>
      </button>

      {/* Expandable Professional Hardware Dossier */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="desk-card-body"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-white/8"
          >
            <div className="p-3.5 space-y-3">
              {/* Illustrated Interactive Device Preview */}
              <PhoneInspectSVG device={device} revealAll={!isSeller} />

              {/* Condition Bar */}
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1 tabular-nums">
                  <span className="text-slate-400">Cihaz Kondisyon Skoru</span>
                  <span className={`font-mono font-semibold ${conditionToneClass}`}>
                    {showCondition ? `${condition.score} / 100` : 'Test Edilmedi'}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/8 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      !showCondition
                        ? 'bg-slate-600'
                        : condition.tone === 'positive'
                        ? 'bg-emerald-400'
                        : condition.tone === 'warning'
                        ? 'bg-amber-400'
                        : condition.tone === 'danger'
                        ? 'bg-rose-500'
                        : 'bg-slate-300'
                    }`}
                    style={{ width: `${showCondition ? condition.score : 12}%` }}
                  />
                </div>
              </div>

              {/* 4-Cell Technical Dossier */}
              <div className="grid grid-cols-2 gap-2 text-[11px] tabular-nums">
                <div className="rounded-lg border border-white/6 bg-[#17202D] px-2.5 py-2">
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-0.5">
                    <ScanLine className="w-3 h-3 text-slate-400" />
                    <span>IMEI & Kayıt</span>
                  </div>
                  <div className="font-mono font-semibold text-slate-200 truncate">
                    {!isSeller || device.inspected.imei
                      ? `${device.imeiStatus === 'TR_REGISTERED' ? 'TR' : 'Y.Dışı'} · ${device.imeiNumber.slice(0, 5)}···${device.imeiNumber.slice(-3)}`
                      : 'Taranmadı'}
                  </div>
                </div>

                <div className="rounded-lg border border-white/6 bg-[#17202D] px-2.5 py-2">
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-0.5">
                    <BatteryCharging className="w-3 h-3 text-slate-400" />
                    <span>Pil & Devir</span>
                  </div>
                  <div className="font-mono font-semibold text-slate-200 truncate">
                    {!isSeller || device.inspected.battery
                      ? `%${device.batteryHealth} · ${device.batteryCycles} devir`
                      : `%${device.reportedBatteryHealth} (beyan)`}
                  </div>
                </div>

                <div className="rounded-lg border border-white/6 bg-[#17202D] px-2.5 py-2">
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-0.5">
                    <ShieldCheck className="w-3 h-3 text-slate-400" />
                    <span>Garanti</span>
                  </div>
                  <div className="font-semibold text-slate-200 truncate">
                    {device.isBrandNew
                      ? '24 Ay Resmi TR'
                      : !isSeller || device.inspected.imei || device.inspected.hardware
                      ? device.warrantyMonths > 0
                        ? `${device.warrantyMonths} Ay TR`
                        : 'Garantisiz'
                      : 'Gizli'}
                  </div>
                </div>

                <div className="rounded-lg border border-white/6 bg-[#17202D] px-2.5 py-2">
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-0.5">
                    <PackageCheck className="w-3 h-3 text-slate-400" />
                    <span>Kutu & İçerik</span>
                  </div>
                  <div className="font-semibold text-slate-200 truncate">
                    {device.isBrandNew
                      ? 'Fabrika Jelatinli'
                      : device.hasBoxAndCharger
                      ? 'Kutulu & Şarjlı'
                      : 'Sadece Cihaz'}
                  </div>
                </div>
              </div>

              {/* Extra Financial Summary when Selling our Own Phone */}
              {encounterType === 'BUYER' && (
                <div className="space-y-1.5 border-t border-white/8 pt-2.5 text-xs tabular-nums">
                  {device.isBrandNew && (
                    <div className="flex items-center justify-between text-emerald-300">
                      <span className="font-semibold">Distribütör Sıfır Kutu</span>
                      <span className="font-mono font-bold">24 Ay TR Garantili</span>
                    </div>
                  )}
                  {device.masterCrafted && (
                    <div className="flex items-center justify-between text-amber-300">
                      <span className="inline-flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        <span>Usta İşi Sertifikası</span>
                      </span>
                      <span className="font-semibold">+%12 Değer</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Sana Maliyeti</span>
                    <span className="font-mono font-semibold text-slate-200">
                      {formatTRY(totalCostBasis)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Vitrin Etiket Fiyatın</span>
                    <span className="font-mono font-bold text-amber-400">
                      {formatTRY(device.askingPrice)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
