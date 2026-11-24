import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  Award,
  BatteryCharging,
  CheckCircle2,
  ChevronDown,
  MessageSquareQuote,
  PackageCheck,
  ScanLine,
  Search,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { DEFECT_CATALOG } from '../game/catalog';
import {
  calculateMarketValue,
  formatTRY,
  getConditionInfo,
} from '../game/engine';
import { getLocalizedConditionLabel, useLanguage } from '../game/i18n';
import { soundFX } from '../game/sound';
import {
  DailyMarketEvent,
  EncounterType,
  PhoneDevice,
  UpgradeId,
} from '../game/types';
import { PhoneInspectSVG } from './PhoneInspectSVG';

interface DeviceDeskCardProps {
  device: PhoneDevice;
  encounterType: EncounterType;
  dailyNews: DailyMarketEvent;
  upgrades?: UpgradeId[];
  expanded: boolean;
  onToggleExpand: () => void;
  onOpenPhysicalInspect?: () => void;
}

export const DeviceDeskCard: React.FC<DeviceDeskCardProps> = ({
  device,
  encounterType,
  dailyNews,
  upgrades,
  expanded,
  onToggleExpand,
  onOpenPhysicalInspect,
}) => {
  const { lang, bi } = useLanguage();
  const isSeller = encounterType === 'SELLER';
  const inspectedCount = Object.values(device.inspected).filter(Boolean).length;
  const estimatedValue = calculateMarketValue(device, isSeller, dailyNews, upgrades);
  const condition = getConditionInfo(device, isSeller);

  const showCondition = !isSeller || inspectedCount > 0;
  const conditionText = !showCondition
    ? bi('Ekspertiz Bekliyor', 'Needs Inspection')
    : device.isBrandNew
    ? bi('Sıfır · Kapalı Kutu (100/100)', 'Brand New · Sealed (100/100)')
    : `${getLocalizedConditionLabel(condition.label, lang)} (${condition.score}/100)`;

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

  // Detective seller claim verification status
  const claimCat = device.sellerClaimCategory;
  const showSellerClaim =
    (encounterType === 'SELLER' || encounterType === 'TRADE_IN') &&
    Boolean(device.sellerClaim) &&
    Boolean(claimCat);
  const claimChecked = Boolean(claimCat && device.inspected[claimCat]);
  const claimIsLie = Boolean(
    claimChecked &&
      claimCat &&
      device.defects.some((d) => DEFECT_CATALOG[d].category === claimCat)
  );

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
        className="w-full text-left px-2.5 py-2 lg:px-3.5 lg:py-3 flex items-center justify-between gap-2 lg:gap-3 hover:bg-white/[0.03] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2 lg:gap-3 min-w-0">
          {/* Miniature Device Silhouette Swatch */}
          <div
            className="h-9 w-6 lg:h-11 lg:w-8 rounded-lg border flex flex-col items-center justify-between p-0.5 lg:p-1 shrink-0"
            style={{
              backgroundColor: device.bodyColor,
              borderColor: device.isBrandNew ? '#34D399' : device.accentColor,
            }}
          >
            <span className="h-0.5 lg:h-1 w-2.5 lg:w-3 rounded-full bg-black/50" />
            <Smartphone className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-white/85" />
            <span className="h-0.5 w-2 lg:w-2.5 rounded-full bg-white/30" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="font-display text-xs sm:text-sm lg:text-base font-bold text-slate-50 truncate leading-tight">
                {device.brand} {device.model}
              </h3>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-1 text-[10px] lg:text-[11px] tabular-nums">
              <span className="text-slate-400">{device.storage}</span>
              <span aria-hidden="true" className="text-white/20">·</span>
              <span className={`font-semibold truncate ${conditionToneClass}`}>
                {conditionText}
              </span>
              {device.masterCrafted && (
                <>
                  <span aria-hidden="true" className="text-white/20">·</span>
                  <span className="font-semibold text-amber-400">
                    {bi('Usta İşi', 'Mastercrafted')}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 lg:gap-2.5 shrink-0 tabular-nums">
          {encounterType !== 'EXPRESS_REPAIR' && (
            <div className="text-right">
              <div className="text-[9px] lg:text-[10px] text-slate-500 leading-none">
                {isSeller
                  ? bi('Mevcut Değer', 'Current Val')
                  : bi('Piyasa', 'Market')}
              </div>
              <div className="font-mono text-xs lg:text-sm font-extrabold text-amber-400">
                {formatTRY(estimatedValue)}
              </div>
            </div>
          )}

          <div className="flex h-6 w-6 lg:h-7 lg:w-7 items-center justify-center rounded-lg border border-white/10 bg-[#1B2533] text-slate-300">
            <ChevronDown
              className={`w-3.5 h-3.5 lg:w-4 lg:h-4 transition-transform duration-200 ${
                expanded ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>
      </button>

      {/* Detective Verbal Claim Strip (SELLER / TRADE_IN) */}
      {showSellerClaim && (
        <div
          className={`px-2.5 py-1.5 lg:px-3.5 lg:py-2 border-t flex items-start justify-between gap-2 text-[10.5px] lg:text-[11px] leading-snug ${
            claimIsLie
              ? 'border-rose-500/35 bg-rose-500/12 text-rose-100'
              : claimChecked
              ? 'border-emerald-500/25 bg-emerald-500/8 text-emerald-100'
              : 'border-white/8 bg-[#151D29] text-slate-300'
          }`}
        >
          <div className="flex items-start gap-1.5 min-w-0">
            {claimIsLie ? (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
            ) : claimChecked ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <MessageSquareQuote className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <span className="italic">
              <strong className="not-italic text-slate-200">
                {bi('Satıcı Beyanı: ', 'Seller Claim: ')}
              </strong>
              “{device.sellerClaim}”
            </span>
          </div>
          {claimIsLie ? (
            <span className="shrink-0 rounded bg-rose-500 px-1.5 py-0.5 font-mono text-[9.5px] font-extrabold text-white tracking-tight">
              {bi('YALAN!', 'LIE!')}
            </span>
          ) : claimChecked ? (
            <span className="shrink-0 rounded bg-emerald-500/20 border border-emerald-400/35 px-1.5 py-0.5 text-[9.5px] font-bold text-emerald-300">
              {bi('Doğru', 'True')}
            </span>
          ) : (
            <span className="shrink-0 text-[9.5px] font-semibold text-amber-300">
              {bi('Test Et', 'Verify')}
            </span>
          )}
        </div>
      )}

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
            <div className="p-2.5 lg:p-3.5 space-y-2 lg:space-y-3">
              {/* Illustrated Interactive Device Preview */}
              <div className="lg:hidden">
                <PhoneInspectSVG device={device} revealAll={!isSeller} compact />
              </div>
              <div className="hidden lg:block">
                <PhoneInspectSVG device={device} revealAll={!isSeller} />
              </div>

              {/* Direct Trigger to Interactive Physical Loupe Workbench */}
              {onOpenPhysicalInspect && isSeller && inspectedCount < 4 && (
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    onOpenPhysicalInspect();
                  }}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-400/45 bg-amber-500/14 px-3 py-1.5 text-[11px] font-bold text-amber-200 hover:bg-amber-500/22 transition-colors cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {bi(
                      'Cihazı Çevir & Büyüteçle Fiziksel İncele',
                      'Flip Phone & Inspect with Optical Loupe'
                    )}
                  </span>
                </button>
              )}

              {/* Condition Bar */}
              <div>
                <div className="flex items-center justify-between text-[10px] lg:text-[11px] mb-1 tabular-nums">
                  <span className="text-slate-400">{bi('Kondisyon', 'Condition')}</span>
                  <span className={`font-mono font-semibold ${conditionToneClass}`}>
                    {showCondition
                      ? `${condition.score} / 100`
                      : bi('Test Edilmedi', 'Unchecked')}
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
              <div className="grid grid-cols-2 gap-1.5 lg:gap-2 text-[10px] lg:text-[11px] tabular-nums">
                <div className="rounded-lg border border-white/6 bg-[#17202D] px-2 py-1.5 lg:px-2.5 lg:py-2">
                  <div className="flex items-center gap-1 text-[9.5px] lg:text-[10px] text-slate-500 mb-0.5">
                    <ScanLine className="w-3 h-3 text-slate-400" />
                    <span>{bi('IMEI & Kayıt', 'IMEI Status')}</span>
                  </div>
                  <div className="font-mono font-semibold text-slate-200 truncate">
                    {!isSeller || device.inspected.imei
                      ? `${
                          device.imeiStatus === 'TR_REGISTERED'
                            ? bi('TR', 'OK')
                            : bi('Y.Dışı', 'UNREG')
                        } · ${device.imeiNumber.slice(0, 5)}···${device.imeiNumber.slice(-3)}`
                      : bi('Taranmadı', 'Not Scanned')}
                  </div>
                </div>

                <div className="rounded-lg border border-white/6 bg-[#17202D] px-2 py-1.5 lg:px-2.5 lg:py-2">
                  <div className="flex items-center gap-1 text-[9.5px] lg:text-[10px] text-slate-500 mb-0.5">
                    <BatteryCharging className="w-3 h-3 text-slate-400" />
                    <span>{bi('Pil & Devir', 'Battery & Cycles')}</span>
                  </div>
                  <div className="font-mono font-semibold text-slate-200 truncate">
                    {!isSeller || device.inspected.battery
                      ? `%${device.batteryHealth} · ${device.batteryCycles} ${bi('devir', 'cyc')}`
                      : `%${device.reportedBatteryHealth} (${bi('beyan', 'claimed')})`}
                  </div>
                </div>

                <div className="rounded-lg border border-white/6 bg-[#17202D] px-2 py-1.5 lg:px-2.5 lg:py-2">
                  <div className="flex items-center gap-1 text-[9.5px] lg:text-[10px] text-slate-500 mb-0.5">
                    <ShieldCheck className="w-3 h-3 text-slate-400" />
                    <span>{bi('Garanti', 'Warranty')}</span>
                  </div>
                  <div className="font-semibold text-slate-200 truncate">
                    {device.isBrandNew
                      ? bi('24 Ay Resmi TR', '24-Mo Official')
                      : !isSeller || device.inspected.imei || device.inspected.hardware
                      ? device.warrantyMonths > 0
                        ? `${device.warrantyMonths} ${bi('Ay TR', 'Mo Official')}`
                        : bi('Garantisiz', 'No Warranty')
                      : bi('Gizli', 'Hidden')}
                  </div>
                </div>

                <div className="rounded-lg border border-white/6 bg-[#17202D] px-2 py-1.5 lg:px-2.5 lg:py-2">
                  <div className="flex items-center gap-1 text-[9.5px] lg:text-[10px] text-slate-500 mb-0.5">
                    <PackageCheck className="w-3 h-3 text-slate-400" />
                    <span>{bi('Kutu & İçerik', 'Box & Charger')}</span>
                  </div>
                  <div className="font-semibold text-slate-200 truncate">
                    {device.isBrandNew
                      ? bi('Fabrika Jelatinli', 'Factory Sealed')
                      : device.hasBoxAndCharger
                      ? bi('Kutulu & Şarjlı', 'Box & Charger')
                      : bi('Sadece Cihaz', 'Device Only')}
                  </div>
                </div>
              </div>

              {/* Extra Financial Summary when Selling our Own Phone */}
              {encounterType === 'BUYER' && (
                <div className="space-y-1.5 border-t border-white/8 pt-2.5 text-xs tabular-nums">
                  {device.isBrandNew && (
                    <div className="flex items-center justify-between text-emerald-300">
                      <span className="font-semibold">
                        {bi('Distribütör Sıfır Kutu', 'Distributor Sealed Box')}
                      </span>
                      <span className="font-mono font-bold">
                        {bi('24 Ay TR Garantili', '24-Mo Warranty')}
                      </span>
                    </div>
                  )}
                  {device.masterCrafted && (
                    <div className="flex items-center justify-between text-amber-300">
                      <span className="inline-flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        <span>{bi('Usta İşi Sertifikası', 'Mastercrafted Seal')}</span>
                      </span>
                      <span className="font-semibold">
                        {bi('+%12 Değer', '+12% Value')}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{bi('Sana Maliyeti', 'Your Cost')}</span>
                    <span className="font-mono font-semibold text-slate-200">
                      {formatTRY(totalCostBasis)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">
                      {bi('Vitrin Etiket Fiyatın', 'Showcase Tag Price')}
                    </span>
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
