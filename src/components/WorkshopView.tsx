import React, { useEffect, useState } from 'react';
import {
  Banknote,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  FolderOpen,
  Layers,
  Lock,
  PackagePlus,
  ShoppingBag,
  Store,
  UserCog,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import {
  ACCESSORY_CATALOG,
  DEFECT_CATALOG,
  SHOWCASE_UPGRADE_MAX_LEVEL,
  SPARE_PARTS_CATALOG,
} from '../game/catalog';
import {
  calculateMarketValue,
  calculateMasterDelegateCost,
  formatTRY,
  getConditionInfo,
  getListingDemand,
  getMasterTechSpecs,
  getMultiRepairCost,
  getQuickRepairExpressFee,
  getRepairCostWithStock,
  getRequiredSpareParts,
  getScrapSaleValue,
  getShowcaseCapacity,
  getStockAgingInfo,
  hasAccessoryLicense,
  isAccessoryUnlocked,
  roundPrice,
} from '../game/engine';
import {
  getLocalizedAccessory,
  getLocalizedDefect,
  useLanguage,
} from '../game/i18n';
import {
  AccessoryId,
  AccessoryStockItem,
  DailyMarketEvent,
  DefectId,
  LegacyPathId,
  PhoneDevice,
  PrestigePerkId,
  ShopTier,
  SparePartId,
  StaffId,
  StaffRepairJob,
  UpgradeId,
} from '../game/types';
import { PhoneInspectSVG, PhoneModelThumb } from './PhoneInspectSVG';
import { AccessoryProductArt } from './VisualShowcaseArt';

interface WorkshopViewProps {
  inventory: PhoneDevice[];
  accessories: Record<AccessoryId, AccessoryStockItem>;
  cash: number;
  currentDay: number;
  shopTier: ShopTier;
  showcaseUpgradeLevel: number;
  shopLevel: number;
  legacyPath: LegacyPathId;
  upgrades: UpgradeId[];
  hiredStaff: StaffId[];
  staffLevels: Record<StaffId, number>;
  staffRepairQueue: StaffRepairJob[];
  dailyNews: DailyMarketEvent;
  spareParts?: Record<SparePartId, number>;
  prestigePerks?: PrestigePerkId[];
  onBuySparePart?: (partId: SparePartId, qty: 1 | 5) => void;
  onQuickRepairDefects: (
    phoneUid: string,
    defectIds: DefectId[],
    external: boolean
  ) => void;
  onStartMiniRepair: (
    phone: PhoneDevice,
    defectIds: DefectId[],
    cost: number
  ) => void;
  onDelegateRepairToMaster: (phoneUid: string, defectIds: DefectId[]) => void;
  onAddBoxKit: (phoneUid: string) => void;
  onAttachAccessoryBundle: (phoneUid: string, accessoryId: AccessoryId) => void;
  onDetachAccessoryBundle: (phoneUid: string, accessoryId: AccessoryId) => void;
  onUpdateListing: (
    phoneUid: string,
    listed: boolean,
    askingPrice: number
  ) => void;
  onScrapSellPhone: (phoneUid: string) => void;
  complaintCount?: number;
  onOpenComplaintArchive?: () => void;
  onBackToCounter: () => void;
  onGoToUpgrades: () => void;
}

export const BOX_KIT_COST = 600;
const ITEMS_PER_PAGE = 5;

export const WorkshopView: React.FC<WorkshopViewProps> = ({
  inventory,
  accessories,
  cash,
  currentDay,
  shopTier,
  showcaseUpgradeLevel,
  shopLevel,
  legacyPath,
  upgrades,
  hiredStaff,
  staffLevels,
  staffRepairQueue,
  dailyNews,
  spareParts,
  prestigePerks,
  onBuySparePart,
  onQuickRepairDefects,
  onStartMiniRepair,
  onDelegateRepairToMaster,
  onAddBoxKit,
  onAttachAccessoryBundle,
  onDetachAccessoryBundle,
  onUpdateListing,
  onScrapSellPhone,
  complaintCount = 0,
  onOpenComplaintArchive,
  onBackToCounter,
  onGoToUpgrades,
}) => {
  const { lang, bi } = useLanguage();
  const [selectedUid, setSelectedUid] = useState<string | null>(
    inventory[0]?.uid ?? null
  );
  const [listPage, setListPage] = useState(0);
  const [priceDraft, setPriceDraft] = useState<number>(0);

  const selected =
    inventory.find((p) => p.uid === selectedUid) ?? inventory[0] ?? null;

  useEffect(() => {
    if (!selected) return;
    if (selected.uid !== selectedUid) {
      setSelectedUid(selected.uid);
    }
    const fair = calculateMarketValue(
      selected,
      false,
      dailyNews,
      upgrades,
      currentDay
    );
    setPriceDraft(
      selected.askingPrice > 0
        ? selected.askingPrice
        : roundPrice(fair * 1.12)
    );
  }, [selected?.uid, selected?.askingPrice, selected?.defects.length]);

  const listedCount = inventory.filter((p) => p.listedForSale).length;
  const maxShowcase = getShowcaseCapacity(shopTier, upgrades, showcaseUpgradeLevel);
  const totalPages = Math.max(1, Math.ceil(inventory.length / ITEMS_PER_PAGE));
  const safePage = Math.min(listPage, totalPages - 1);
  const pageItems = inventory.slice(
    safePage * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );

  const hasRepairBench = upgrades.includes('repair_bench');
  const hasMasterTech = hiredStaff.includes('master_tech');
  const masterLevel = staffLevels?.master_tech ?? 1;
  const masterSpecs = getMasterTechSpecs(masterLevel, upgrades);

  if (!selected) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-6 text-center bg-[#0F141B]">
        <Wrench className="w-10 h-10 text-slate-600 mb-2" />
        <h2 className="font-display text-base font-bold text-slate-100">
          {bi('Atölye & Vitrin Boş', 'Workshop & Showcase Empty')}
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          {bi(
            'Tezgahta müşterilerden 2. el telefon satın al; burada tamir edip aksesuar kombiniyle vitrine koy.',
            'Buy 2nd-hand phones from customers at the counter, repair them here, and list them on your showcase.'
          )}
        </p>
        <div className="mt-3 flex items-center gap-2">
          {onOpenComplaintArchive && (
            <button
              type="button"
              onClick={onOpenComplaintArchive}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-400/35 bg-rose-500/15 px-3.5 py-2 text-xs font-bold text-rose-200 hover:bg-rose-500/25 cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              {bi('Şikayet & Garanti Dosyası', 'Complaints & Warranties')}
              {complaintCount > 0 ? ` (${complaintCount})` : ''}
            </button>
          )}
          <button
            type="button"
            onClick={onBackToCounter}
            className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-400 cursor-pointer"
          >
            ← {bi('Tezgaha Dön', 'Back to Counter')}
          </button>
        </div>
      </div>
    );
  }

  const fairValue = calculateMarketValue(
    selected,
    false,
    dailyNews,
    upgrades,
    currentDay
  );
  const condition = getConditionInfo(selected, false);
  const aging = getStockAgingInfo(selected, currentDay);
  const repairableDefects = selected.defects.filter(
    (d) => DEFECT_CATALOG[d].repairable
  );
  const requiredParts = getRequiredSpareParts(repairableDefects);
  const stockCalc = getRepairCostWithStock(
    repairableDefects,
    spareParts,
    upgrades,
    dailyNews,
    false,
    shopLevel,
    legacyPath,
    prestigePerks
  );
  const inHouseCost = stockCalc.cashCost;
  const outsourceCost = getMultiRepairCost(
    repairableDefects,
    upgrades,
    dailyNews,
    true,
    shopLevel,
    legacyPath,
    prestigePerks
  );
  const masterCost = calculateMasterDelegateCost(
    stockCalc.cashCost > 0 ? stockCalc.cashCost : stockCalc.baseCost,
    masterLevel,
    upgrades
  );
  const staffJob = staffRepairQueue.find((j) => j.phoneUid === selected.uid);

  const minAsk = roundPrice(Math.max(1000, fairValue * 0.8));
  const maxAsk = roundPrice(Math.max(minAsk + 1000, fairValue * 1.45));
  const draftDevice = { ...selected, askingPrice: priceDraft };
  const demand = getListingDemand(draftDevice, dailyNews, upgrades);
  const totalInvested = selected.purchasePrice + selected.repairSpend;
  const estProfit = priceDraft - totalInvested;
  const scrapValue = getScrapSaleValue(
    selected,
    dailyNews,
    upgrades,
    currentDay
  );
  const bundledList = selected.bundledAccessories ?? [];

  const canListMore = selected.listedForSale || listedCount < maxShowcase;

  return (
    <div className="flex-1 min-h-0 grid grid-cols-12 gap-2 p-2 lg:p-2.5 overflow-hidden bg-[#0F141B]">
      {/* LEFT INVENTORY PANEL WITH VISUAL PHONE THUMBNAILS */}
      <aside className="col-span-4 lg:col-span-3 flex flex-col min-h-0 rounded-xl border border-white/10 bg-[#151D28] p-2 overflow-hidden">
        <div className="shrink-0 flex items-center justify-between gap-1 pb-1.5 border-b border-white/8">
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-slate-100 truncate">
              {bi('Stok & Vitrin', 'Stock & Shelf')} ({inventory.length})
            </div>
            <div className="text-[9.5px] font-mono text-slate-400">
              {bi('Vitrin', 'Shelf')}:{' '}
              <strong className="text-amber-300">
                {listedCount}/{maxShowcase}
              </strong>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {onOpenComplaintArchive && (
              <button
                type="button"
                onClick={onOpenComplaintArchive}
                title={bi('Müşteri Şikayet Dosyası & Garanti Arşivi', 'Customer Complaint File & Warranties')}
                className="inline-flex items-center gap-1 rounded-md border border-rose-400/35 bg-rose-500/15 px-1.5 py-1 text-[10px] font-bold text-rose-200 hover:bg-rose-500/25 whitespace-nowrap cursor-pointer"
              >
                <FolderOpen className="w-3 h-3 shrink-0" />
                <span>{bi('Dosya', 'File')}</span>
                {complaintCount > 0 && (
                  <span className="font-mono text-amber-300">{complaintCount}</span>
                )}
              </button>
            )}
            {showcaseUpgradeLevel < SHOWCASE_UPGRADE_MAX_LEVEL && (
              <button
                type="button"
                onClick={onGoToUpgrades}
                className="rounded-md border border-amber-400/35 bg-amber-500/15 px-1.5 py-1 text-[10px] font-bold text-amber-300 hover:bg-amber-500/25 whitespace-nowrap cursor-pointer"
              >
                {bi('Raf +', 'Rack +')}
              </button>
            )}
            <button
              type="button"
              onClick={onBackToCounter}
              className="rounded-md border border-white/15 bg-[#1E2836] px-2 py-1 text-[10px] font-bold text-slate-100 hover:bg-[#28364A] whitespace-nowrap cursor-pointer"
            >
              ← {bi('Tezgah', 'Counter')}
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col gap-1.5 py-1.5 overflow-hidden">
          {pageItems.map((phone) => {
            const isSel = phone.uid === selected.uid;
            const cond = getConditionInfo(phone, false);
            const val = calculateMarketValue(
              phone,
              false,
              dailyNews,
              upgrades,
              currentDay
            );
            return (
              <button
                key={phone.uid}
                type="button"
                onClick={() => setSelectedUid(phone.uid)}
                className={`w-full rounded-lg border px-2 py-1.5 flex items-center gap-2 text-left transition-colors cursor-pointer ${
                  isSel
                    ? 'border-amber-400 bg-amber-500/15'
                    : 'border-white/8 bg-[#0E141D] hover:bg-[#182231]'
                }`}
              >
                <PhoneModelThumb
                  device={phone}
                  showBack
                  className="w-7 h-11 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-bold text-slate-100 truncate">
                      {phone.brand} {phone.model}
                    </span>
                    <span
                      className={`rounded px-1 py-0.2 text-[9px] font-bold shrink-0 ${
                        phone.assignedToStaff
                          ? 'bg-sky-500/20 text-sky-300'
                          : phone.listedForSale
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-700/70 text-slate-300'
                      }`}
                    >
                      {phone.assignedToStaff
                        ? bi('Ustada', 'Tech')
                        : phone.listedForSale
                        ? bi('Vitrinde', 'Listed')
                        : bi('Atölye', 'Bench')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[9.5px] text-slate-400 mt-0.5 tabular-nums">
                    <span className="truncate">
                      {cond.label} · {phone.defects.length}{' '}
                      {bi('kusur', 'flaw')}
                    </span>
                    <span className="font-mono font-bold text-amber-300 shrink-0">
                      {formatTRY(val)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Pagination Controls */}
        <div className="shrink-0 flex items-center justify-between pt-1 border-t border-white/8 text-[10px]">
          <button
            type="button"
            disabled={safePage === 0}
            onClick={() => setListPage((p) => Math.max(0, p - 1))}
            className="inline-flex items-center gap-0.5 rounded bg-white/8 px-1.5 py-0.5 text-slate-200 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <span className="font-mono text-slate-400">
            {safePage + 1} / {totalPages}
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages - 1}
            onClick={() => setListPage((p) => Math.min(totalPages - 1, p + 1))}
            className="inline-flex items-center gap-0.5 rounded bg-white/8 px-1.5 py-0.5 text-slate-200 disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </aside>

      {/* RIGHT WORKBENCH — 2 BALANCED ZERO-VOID COLUMNS */}
      <section className="col-span-8 lg:col-span-9 grid grid-cols-12 gap-2 min-h-0 overflow-hidden">
        {/* CENTER-LEFT: PROMINENT LIVE PHONE MODEL + TIGHT REPAIR BENCH */}
        <div className="col-span-6 flex flex-col gap-2 min-h-0 overflow-hidden">
          {/* HERO DEVICE SHOWCASE STAGE (GROWS TO FILL HEIGHT — ZERO VOID) */}
          <div className="flex-1 min-h-0 rounded-xl border border-white/10 bg-[#151D28] p-2.5 grid grid-cols-12 gap-2.5 overflow-hidden">
            {/* Full-Height Interactive Phone Model (Front / Back Flip) */}
            <div className="col-span-6 min-h-0 h-full">
              <PhoneInspectSVG device={selected} revealAll fluid />
            </div>

            {/* Live Device Tech Specs beside the phone */}
            <div className="col-span-6 min-h-0 flex flex-col justify-between gap-1.5 overflow-hidden tabular-nums">
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-[9.5px] font-bold text-amber-300 uppercase">
                    {selected.brand}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {selected.storage}
                  </span>
                </div>
                <h3 className="font-display text-sm font-extrabold text-slate-50 leading-tight truncate">
                  {selected.model}
                </h3>

                <div className="flex flex-wrap items-center gap-1 mt-1 text-[9.5px]">
                  <span
                    className={`rounded px-1.5 py-0.5 font-bold ${
                      condition.tone === 'positive'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : condition.tone === 'warning'
                        ? 'bg-amber-500/15 text-amber-300'
                        : condition.tone === 'danger'
                        ? 'bg-rose-500/15 text-rose-300'
                        : 'bg-white/10 text-slate-200'
                    }`}
                  >
                    {condition.label} ({condition.score})
                  </span>
                  {aging.label && (
                    <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-bold text-amber-300">
                      {aging.label}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1 text-[10.5px]">
                <div className="rounded-lg bg-[#0E141D] border border-white/6 px-2 py-1 flex items-center justify-between">
                  <span className="text-slate-400">{bi('Maliyet', 'Cost')}</span>
                  <span className="font-mono font-bold text-slate-100">
                    {formatTRY(totalInvested)}
                  </span>
                </div>
                <div className="rounded-lg bg-[#0E141D] border border-white/6 px-2 py-1 flex items-center justify-between">
                  <span className="text-slate-400">{bi('Piyasa', 'Market')}</span>
                  <span className="font-mono font-extrabold text-amber-300">
                    {formatTRY(fairValue)}
                  </span>
                </div>
                <div className="rounded-lg bg-[#0E141D] border border-white/6 px-2 py-1 flex items-center justify-between">
                  <span className="text-slate-400">{bi('Pil', 'Battery')}</span>
                  <span
                    className={`font-mono font-bold ${
                      selected.batteryHealth < 80
                        ? 'text-rose-400'
                        : 'text-emerald-300'
                    }`}
                  >
                    %{selected.batteryHealth}
                  </span>
                </div>
              </div>

              {/* Quick Defect Status */}
              <div className="flex flex-wrap gap-1">
                {selected.defects.length === 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 border border-emerald-400/25 px-2 py-0.5 text-[9.5px] font-bold text-emerald-300">
                    <Check className="w-3 h-3" />
                    {bi('Kusursuz Cihaz', 'Spotless Device')}
                  </span>
                ) : (
                  selected.defects.map((d) => (
                    <span
                      key={d}
                      className="rounded-md border border-rose-400/30 bg-rose-500/12 px-1.5 py-0.5 text-[9.5px] font-bold text-rose-200"
                    >
                      {getLocalizedDefect(d, lang).shortLabel}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* TIGHT SINGLE-SESSION REPAIR BENCH & UTILITY ACTIONS */}
          <div className="shrink-0 rounded-xl border border-white/10 bg-[#151D28] p-2 space-y-1.5">
            <div className="flex items-center justify-between gap-1">
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-100">
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                {bi('Tek Seferde Tamir Masası', 'Single-Session Repair')}
              </div>
              <span className="font-mono text-[10px] text-slate-400">
                {stockCalc.usedStockCount > 0 ? (
                  <span className="text-emerald-300 font-bold">
                    {bi(`Stoktan ${stockCalc.usedStockCount} parça ✓`, `${stockCalc.usedStockCount} from stock ✓`)}
                  </span>
                ) : (
                  `${repairableDefects.length} ${bi('onarılabilir', 'fixable')}`
                )}
              </span>
            </div>

            {/* Compact Spare Parts Stock Strip (Screen / Battery / Kit) */}
            {spareParts && (
              <div className="grid grid-cols-3 gap-1 tabular-nums">
                {SPARE_PARTS_CATALOG.map((part) => {
                  const qty = spareParts[part.id] ?? 0;
                  const needed = requiredParts[part.id] ?? 0;
                  return (
                    <div
                      key={part.id}
                      className={`rounded-md border px-1.5 py-0.5 flex items-center justify-between gap-1 text-[9px] ${
                        needed > 0 && qty === 0
                          ? 'border-amber-400/50 bg-amber-500/12 text-amber-200'
                          : needed > 0 && qty > 0
                          ? 'border-emerald-400/45 bg-emerald-500/12 text-emerald-200'
                          : 'border-white/8 bg-[#0E141D] text-slate-300'
                      }`}
                    >
                      <span className="truncate font-semibold">
                        {lang === 'en' ? part.shortEn : part.shortTr}{' '}
                        <strong className="font-mono">×{qty}</strong>
                      </span>
                      {onBuySparePart && (
                        <button
                          type="button"
                          disabled={cash < part.unitCost}
                          onClick={() => onBuySparePart(part.id, 1)}
                          title={`${lang === 'en' ? part.nameEn : part.nameTr} (+1 · ${formatTRY(part.unitCost)})`}
                          className="rounded bg-amber-500/20 border border-amber-400/40 px-1 py-0.2 font-mono text-[8.5px] font-extrabold text-amber-200 hover:bg-amber-500 hover:text-slate-950 disabled:opacity-30 cursor-pointer shrink-0"
                        >
                          +1
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {staffJob ? (
              <div className="flex items-center justify-center gap-2 rounded-lg border border-sky-400/30 bg-sky-500/10 px-2.5 py-1.5 text-[10.5px] text-sky-200 font-semibold">
                <Clock className="w-4 h-4 text-sky-300 shrink-0" />
                <span>
                  {bi(
                    `Hasan Usta Onarıyor · ${staffJob.turnsRemaining} tur kaldı`,
                    `Master Hasan Repairing · ${staffJob.turnsRemaining} turns left`
                  )}
                </span>
              </div>
            ) : repairableDefects.length === 0 ? (
              <div className="flex items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/8 px-2.5 py-1.5 text-[10.5px] text-emerald-300 font-semibold text-center">
                <Check className="w-3.5 h-3.5 mr-1 shrink-0" />
                {selected.defects.includes('imei_unregistered')
                  ? bi(
                      'Donanım temiz (IMEI kayıtsız — tamir edilemez)',
                      'Hardware clean (Unregistered IMEI — permanent)'
                    )
                  : bi(
                      'Cihaz kusursuz! Vitrine koymaya hazır.',
                      'Device spotless! Ready for showcase.'
                    )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5 tabular-nums">
                {hasRepairBench ? (
                  (() => {
                    const expressFee = getQuickRepairExpressFee(
                      stockCalc.cashCost > 0 ? stockCalc.cashCost : stockCalc.baseCost
                    );
                    const quickTotalCost = inHouseCost + expressFee;
                    return (
                      <>
                        <button
                          type="button"
                          disabled={cash < inHouseCost}
                          onClick={() =>
                            onStartMiniRepair(
                              selected,
                              repairableDefects,
                              inHouseCost
                            )
                          }
                          className="inline-flex flex-col items-center justify-center rounded-lg bg-amber-500 py-1 px-1.5 text-[10px] font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-35 cursor-pointer whitespace-nowrap leading-tight"
                        >
                          <span className="inline-flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {bi('Mini Tamir', 'Mini Fix')} (
                            {inHouseCost === 0 ? bi('Stoktan', 'Stock') : formatTRY(inHouseCost)})
                          </span>
                          <span className="text-[8.5px] font-bold opacity-80">
                            {stockCalc.usedStockCount > 0
                              ? bi('Stok Parçası Kullanır · Usta İşi', 'Uses Stock Part · Master Chance')
                              : bi('Sadece Parça · Usta İşi Şansı', 'Parts Only · Master Bonus')}
                          </span>
                        </button>
                        <button
                          type="button"
                          disabled={cash < quickTotalCost}
                          onClick={() =>
                            onQuickRepairDefects(
                              selected.uid,
                              repairableDefects,
                              false
                            )
                          }
                          className="inline-flex flex-col items-center justify-center rounded-lg border border-white/15 bg-[#1D2736] py-1 px-1.5 text-[10px] font-bold text-slate-100 hover:bg-[#273447] disabled:opacity-35 cursor-pointer whitespace-nowrap leading-tight"
                        >
                          <span>
                            {bi('Hızlı Onar', 'Quick Fix')} ({formatTRY(quickTotalCost)})
                          </span>
                          <span className="text-[8.5px] text-amber-300 font-semibold">
                            +{formatTRY(expressFee)} {bi('Erken Teslimat', 'Express Fee')}
                          </span>
                        </button>
                      </>
                    );
                  })()
                ) : (
                  <button
                    type="button"
                    disabled={cash < outsourceCost}
                    onClick={() =>
                      onQuickRepairDefects(
                        selected.uid,
                        repairableDefects,
                        true
                      )
                    }
                    className="col-span-2 inline-flex items-center justify-center gap-1 rounded-lg bg-amber-500 py-1.5 text-[10.5px] font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-35 cursor-pointer whitespace-nowrap"
                  >
                    <Wrench className="w-3 h-3" />
                    {bi(
                      `Dış Servise Gönder (${formatTRY(outsourceCost)})`,
                      `Outsource Repair (${formatTRY(outsourceCost)})`
                    )}
                  </button>
                )}

                {hasMasterTech && (
                  <button
                    type="button"
                    disabled={cash < masterCost}
                    onClick={() =>
                      onDelegateRepairToMaster(
                        selected.uid,
                        repairableDefects
                      )
                    }
                    className="col-span-2 inline-flex items-center justify-center gap-1 rounded-lg border border-sky-400/35 bg-sky-500/15 py-1 text-[10px] font-bold text-sky-200 hover:bg-sky-500/25 disabled:opacity-35 cursor-pointer whitespace-nowrap"
                  >
                    <UserCog className="w-3 h-3" />
                    {bi(
                      `Hasan Usta (${masterSpecs.turnsPerJob} tur · ${formatTRY(masterCost)})`,
                      `Master Hasan (${masterSpecs.turnsPerJob} turns · ${formatTRY(masterCost)})`
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Bottom Utility Row: Box Kit & Scrap */}
            <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-white/8 tabular-nums">
              <button
                type="button"
                disabled={
                  selected.hasBoxAndCharger ||
                  selected.isBrandNew ||
                  cash < BOX_KIT_COST ||
                  Boolean(staffJob)
                }
                onClick={() => onAddBoxKit(selected.uid)}
                className="inline-flex items-center justify-center gap-1 rounded-lg border border-white/10 bg-[#0E141D] py-1 text-[10px] font-bold text-slate-200 hover:bg-[#192332] disabled:opacity-35 cursor-pointer whitespace-nowrap"
              >
                <PackagePlus className="w-3 h-3 text-emerald-400" />
                {selected.hasBoxAndCharger
                  ? bi('Kutu Tam ✓', 'Box Ready ✓')
                  : bi(`Kutu + Şarj (${formatTRY(BOX_KIT_COST)})`, `Add Box (${formatTRY(BOX_KIT_COST)})`)}
              </button>

              <button
                type="button"
                disabled={Boolean(staffJob)}
                onClick={() => onScrapSellPhone(selected.uid)}
                className="inline-flex items-center justify-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 py-1 text-[10px] font-bold text-rose-200 hover:bg-rose-500/20 disabled:opacity-35 cursor-pointer whitespace-nowrap"
              >
                <Banknote className="w-3 h-3" />
                {bi(`Parçaya Sat (${formatTRY(scrapValue)})`, `Scrap (${formatTRY(scrapValue)})`)}
              </button>
            </div>
          </div>
        </div>

        {/* CENTER-RIGHT: RICH 3x2 ACCESSORY VISUAL TILES + SHOWCASE PRICING */}
        <div className="col-span-6 flex flex-col gap-2 min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 rounded-xl border border-white/10 bg-[#151D28] p-2 flex flex-col overflow-hidden">
            <div className="shrink-0 flex items-center justify-between gap-1 mb-1.5">
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-100 truncate">
                <ShoppingBag className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate">
                  {bi('Vitrin Aksesuar Kombini', 'Showcase Accessory Bundle')}
                </span>
              </div>
              <span className="font-mono text-[10px] text-amber-300 shrink-0">
                {bundledList.length}/6
              </span>
            </div>

            {!hasAccessoryLicense(upgrades) ? (
              <div className="flex-1 min-h-0 rounded-xl border border-dashed border-amber-400/30 bg-[#0E141D] flex flex-col items-center justify-center text-center p-3 gap-1.5">
                <Lock className="w-6 h-6 text-amber-400" />
                <div className="text-[11px] font-extrabold text-slate-100">
                  {bi('Aksesuar Reyonu Lisansı Gerekli', 'Accessory Rack License Required')}
                </div>
                <p className="text-[10px] text-slate-400 max-w-xs leading-snug">
                  {bi(
                    'Telefon yanına kılıf, kırılmaz cam ve şarj kombini takmak için Büyüt veya Toptan sekmesinden Aksesuar Lisansını (45.000 ₺) aç.',
                    'Unlock the Accessory License (45,000 ₺) in Upgrades or Supply to bundle cases, glass & chargers.'
                  )}
                </p>
                <button
                  type="button"
                  onClick={onGoToUpgrades}
                  className="mt-0.5 rounded-lg bg-amber-500 px-3 py-1 text-[10.5px] font-extrabold text-slate-950 hover:bg-amber-400 cursor-pointer"
                >
                  {bi('Büyüt Sekmesine Git', 'Go to Upgrades')}
                </button>
              </div>
            ) : (
            <div className="flex-1 min-h-0 grid grid-cols-3 grid-rows-2 gap-1.5 overflow-hidden">
              {ACCESSORY_CATALOG.map((acc) => {
                const loc = getLocalizedAccessory(acc.id, lang);
                const stock = accessories[acc.id]?.quantity ?? 0;
                const unlocked = isAccessoryUnlocked(acc.id, shopTier, upgrades);
                const attached = bundledList.includes(acc.id);
                const bonusVal = Math.round(acc.recommendedPrice * 1.1);
                const canAttach =
                  unlocked && !attached && stock > 0 && !staffJob;
                const canDetach = attached && !staffJob;

                return (
                  <button
                    key={acc.id}
                    type="button"
                    disabled={!canAttach && !canDetach}
                    onClick={() =>
                      attached
                        ? onDetachAccessoryBundle(selected.uid, acc.id)
                        : onAttachAccessoryBundle(selected.uid, acc.id)
                    }
                    className={`relative rounded-xl border p-1.5 flex flex-col justify-between text-center transition-colors min-h-0 overflow-hidden ${
                      attached
                        ? 'border-emerald-400/55 bg-emerald-500/15 hover:border-rose-400/70 hover:bg-rose-500/15 cursor-pointer group'
                        : !unlocked
                        ? 'border-white/6 bg-[#0D121A]/85 opacity-70 cursor-not-allowed'
                        : stock > 0
                        ? 'border-white/10 bg-[#0E141D] hover:border-amber-400/55 cursor-pointer'
                        : 'border-white/6 bg-[#0E141D]/65 opacity-55 cursor-not-allowed'
                    }`}
                  >
                    {/* Top-right Stock / Lock / Attached (Click to Detach!) Status */}
                    <div className="shrink-0 flex items-center justify-end">
                      {attached ? (
                        <span className="inline-flex items-center gap-0.5 rounded bg-emerald-500/25 group-hover:bg-rose-500/30 px-1 py-0.2 text-[8.5px] font-extrabold text-emerald-300 group-hover:text-rose-200 transition-colors">
                          <Check className="w-2.5 h-2.5 group-hover:hidden" />
                          <X className="w-2.5 h-2.5 hidden group-hover:block" />
                          <span className="group-hover:hidden">{bi('Takılı', 'On')}</span>
                          <span className="hidden group-hover:inline">{bi('Çıkar', 'Remove')}</span>
                        </span>
                      ) : !unlocked ? (
                        <span className="inline-flex items-center gap-0.5 font-mono text-[9px] font-bold text-amber-300">
                          <Lock className="w-2.5 h-2.5" />
                          {bi(`Dük.${acc.minShopTier}`, `T${acc.minShopTier}`)}
                        </span>
                      ) : (
                        <span
                          className={`font-mono text-[9px] font-bold ${
                            stock > 0 ? 'text-emerald-300' : 'text-slate-500'
                          }`}
                        >
                          ×{stock}
                        </span>
                      )}
                    </div>

                    {/* Large Centered Product Illustration */}
                    <div className="flex-1 min-h-0 flex items-center justify-center py-0.5">
                      <AccessoryProductArt
                        id={acc.id}
                        className={`h-full max-h-14 lg:max-h-16 w-auto drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)] ${
                          !unlocked ? 'opacity-50' : ''
                        }`}
                      />
                    </div>

                    {/* Product Name & Value Boost */}
                    <div className="shrink-0 w-full">
                      <div className="text-[9.5px] font-bold text-slate-100 truncate leading-tight">
                        {loc.name}
                      </div>
                      <div className="font-mono text-[9px] font-bold text-emerald-400 leading-tight">
                        +{formatTRY(bonusVal)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            )}
          </div>

          {/* Showcase Listing & Price Slider */}
          <div className="shrink-0 rounded-xl border border-white/10 bg-[#151D28] p-2 space-y-1.5 tabular-nums">
            <div className="flex items-center justify-between gap-1">
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-100">
                <Store className="w-3.5 h-3.5 text-emerald-400" />
                {bi('Vitrin Etiketi', 'Showcase Tag')}
              </div>
              <span
                className={`rounded px-1.5 py-0.5 text-[9.5px] font-bold ${
                  demand.tone === 'positive'
                    ? 'bg-emerald-500/15 text-emerald-300'
                    : demand.tone === 'warning'
                    ? 'bg-amber-500/15 text-amber-300'
                    : 'bg-rose-500/15 text-rose-300'
                }`}
              >
                {demand.label}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <input
                type="range"
                min={minAsk}
                max={maxAsk}
                step={250}
                value={Math.min(maxAsk, Math.max(minAsk, priceDraft))}
                onChange={(e) => setPriceDraft(Number(e.target.value))}
                className="pasaj-slider flex-1"
              />
              <span className="font-mono text-sm font-extrabold text-amber-300 shrink-0">
                {formatTRY(priceDraft)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1 text-[10px]">
              <button
                type="button"
                onClick={() => setPriceDraft(roundPrice(fairValue * 1.02))}
                className="rounded bg-[#0E141D] border border-white/8 py-0.5 font-semibold text-emerald-300 hover:bg-[#192332] cursor-pointer"
              >
                {bi('Hızlı', 'Fast')}
              </button>
              <button
                type="button"
                onClick={() => setPriceDraft(roundPrice(fairValue * 1.14))}
                className="rounded bg-[#0E141D] border border-white/8 py-0.5 font-semibold text-amber-300 hover:bg-[#192332] cursor-pointer"
              >
                {bi('İdeal', 'Sweet')}
              </button>
              <button
                type="button"
                onClick={() => setPriceDraft(roundPrice(fairValue * 1.28))}
                className="rounded bg-[#0E141D] border border-white/8 py-0.5 font-semibold text-rose-300 hover:bg-[#192332] cursor-pointer"
              >
                {bi('Yüksek', 'High')}
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 pt-0.5">
              <div className="text-[10px] text-slate-400">
                {bi('Tahmini Kâr', 'Est. Profit')}:{' '}
                <strong
                  className={`font-mono ${
                    estProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {estProfit >= 0 ? '+' : ''}
                  {formatTRY(estProfit)}
                </strong>
              </div>

              <div className="flex items-center gap-1.5">
                {selected.listedForSale && (
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateListing(selected.uid, false, priceDraft)
                    }
                    className="rounded-lg border border-white/15 bg-[#1B2432] px-2 py-1 text-[10.5px] font-bold text-slate-300 hover:text-white cursor-pointer whitespace-nowrap"
                  >
                    {bi('Çek', 'Unlist')}
                  </button>
                )}
                <button
                  type="button"
                  disabled={Boolean(staffJob) || !canListMore}
                  onClick={() =>
                    onUpdateListing(selected.uid, true, priceDraft)
                  }
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1 text-[11px] font-extrabold text-slate-950 hover:bg-emerald-400 disabled:opacity-35 cursor-pointer whitespace-nowrap"
                >
                  <Layers className="w-3.5 h-3.5" />
                  {selected.listedForSale
                    ? bi('Etiketi Güncelle', 'Update Tag')
                    : canListMore
                    ? bi('Vitrine Koy', 'List on Shelf')
                    : bi('Vitrin Dolu', 'Shelf Full')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
