import React, { useEffect, useState } from 'react';
import {
  Award,
  Check,
  Clock,
  Layers,
  Lock,
  PackagePlus,
  ShieldCheck,
  ShoppingBag,
  Store,
  UserCog,
  Wrench,
  Zap,
} from 'lucide-react';
import {
  ACCESSORY_CATALOG,
  DEFECT_CATALOG,
  SHOWCASE_UPGRADE_MAX_LEVEL,
} from '../game/catalog';
import {
  calculateMarketValue,
  calculateMasterDelegateCost,
  formatTRY,
  getConditionInfo,
  getListingDemand,
  getMasterTechSpecs,
  getMultiRepairCost,
  getRepairCost,
  getShowcaseCapacity,
  roundPrice,
} from '../game/engine';
import {
  AccessoryId,
  AccessoryStockItem,
  DailyMarketEvent,
  DefectId,
  LegacyPathId,
  PhoneDevice,
  ShopTier,
  StaffId,
  StaffRepairJob,
  UpgradeId,
} from '../game/types';
import { PhoneInspectSVG } from './PhoneInspectSVG';
import { AccessoryProductArt } from './VisualShowcaseArt';

interface WorkshopViewProps {
  inventory: PhoneDevice[];
  accessories: Record<AccessoryId, AccessoryStockItem>;
  cash: number;
  shopTier: ShopTier;
  showcaseUpgradeLevel: number;
  shopLevel: number;
  legacyPath: LegacyPathId;
  upgrades: UpgradeId[];
  hiredStaff: StaffId[];
  staffLevels: Record<StaffId, number>;
  staffRepairQueue: StaffRepairJob[];
  dailyNews: DailyMarketEvent;
  onQuickRepairDefects: (phoneUid: string, defectIds: DefectId[], external: boolean) => void;
  onStartMiniRepair: (phone: PhoneDevice, defectIds: DefectId[], cost: number) => void;
  onDelegateRepairToMaster: (phoneUid: string, defectIds: DefectId[]) => void;
  onAddBoxKit: (phoneUid: string) => void;
  onAttachAccessoryBundle: (phoneUid: string, accessoryId: AccessoryId) => void;
  onUpdateListing: (phoneUid: string, listed: boolean, askingPrice: number) => void;
  onBackToCounter: () => void;
  onGoToUpgrades: () => void;
}

export const BOX_KIT_COST = 600;

export const WorkshopView: React.FC<WorkshopViewProps> = ({
  inventory,
  accessories,
  cash,
  shopTier,
  showcaseUpgradeLevel,
  shopLevel,
  legacyPath,
  upgrades,
  hiredStaff,
  staffLevels,
  staffRepairQueue,
  dailyNews,
  onQuickRepairDefects,
  onStartMiniRepair,
  onDelegateRepairToMaster,
  onAddBoxKit,
  onAttachAccessoryBundle,
  onUpdateListing,
  onBackToCounter,
  onGoToUpgrades,
}) => {
  const [selectedUid, setSelectedUid] = useState<string | null>(
    inventory[0]?.uid ?? null
  );
  const [flashKey, setFlashKey] = useState(0);

  useEffect(() => {
    if (inventory.length === 0) {
      setSelectedUid(null);
      return;
    }
    if (!selectedUid || !inventory.some((p) => p.uid === selectedUid)) {
      setSelectedUid(inventory[0].uid);
    }
  }, [inventory, selectedUid]);

  const selectedPhone = inventory.find((p) => p.uid === selectedUid) ?? null;
  const listedCount = inventory.filter((p) => p.listedForSale).length;
  const showcaseCap = getShowcaseCapacity(shopTier, upgrades, showcaseUpgradeLevel);
  const hasOwnBench = upgrades.includes('repair_bench');
  const hasWholesale = upgrades.includes('parts_wholesale');
  const hasMasterTech = hiredStaff.includes('master_tech');
  const masterLevel = staffLevels?.master_tech ?? 1;
  const masterSpecs = getMasterTechSpecs(masterLevel, upgrades);
  const canDelegateSlot =
    hasMasterTech && staffRepairQueue.length < masterSpecs.maxParallelJobs;

  if (inventory.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <Wrench className="w-10 h-10 text-slate-500 mb-3" />
        <h2 className="font-display text-2xl font-bold text-slate-100 mb-2">
          Atölye ve Vitrin Şu An Boş
        </h2>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          Tezgaha dönüp satıcılardan kelepir telefonlar satın al; burada tüm arızaları tek seferde onarıp aksesuar kombiniyle vitrine çıkardığında alıcılar sıraya girecek.
        </p>
        <button
          type="button"
          onClick={onBackToCounter}
          className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer whitespace-nowrap"
        >
          Tezgaha Dön
        </button>
      </div>
    );
  }

  const fairValue = selectedPhone
    ? calculateMarketValue(selectedPhone, false, dailyNews, upgrades)
    : 0;
  const condition = selectedPhone ? getConditionInfo(selectedPhone) : null;
  const currentAsk =
    selectedPhone && selectedPhone.askingPrice > 0
      ? selectedPhone.askingPrice
      : roundPrice(fairValue * 1.15);

  const demand = selectedPhone
    ? getListingDemand({ ...selectedPhone, askingPrice: currentAsk }, dailyNews, upgrades)
    : null;
  const totalCost = selectedPhone
    ? selectedPhone.purchasePrice + selectedPhone.repairSpend
    : 0;
  const projectedProfit = currentAsk - totalCost;
  const canListMore = selectedPhone?.listedForSale || listedCount < showcaseCap;
  const boxKitPrice = hasWholesale ? 420 : BOX_KIT_COST;

  const repairableDefects = selectedPhone
    ? selectedPhone.defects.filter((d) => DEFECT_CATALOG[d].repairable)
    : [];
  const backZoneDefects = repairableDefects.filter(
    (d) => DEFECT_CATALOG[d].zone === 'back'
  );
  const allRepairCost =
    repairableDefects.length > 0
      ? getMultiRepairCost(
          repairableDefects,
          upgrades,
          dailyNews,
          !hasOwnBench,
          shopLevel,
          legacyPath
        )
      : 0;
  const backZoneCost =
    backZoneDefects.length > 1
      ? getMultiRepairCost(
          backZoneDefects,
          upgrades,
          dailyNews,
          !hasOwnBench,
          shopLevel,
          legacyPath
        )
      : 0;
  const masterDelegateCost =
    repairableDefects.length > 0
      ? calculateMasterDelegateCost(allRepairCost, masterLevel, upgrades)
      : 0;

  const handleQuickMulti = (ids: DefectId[]) => {
    if (!selectedPhone || ids.length === 0) return;
    setFlashKey((k) => k + 1);
    onQuickRepairDefects(selectedPhone.uid, ids, !hasOwnBench);
  };

  const handleBoxClick = () => {
    if (!selectedPhone) return;
    setFlashKey((k) => k + 1);
    onAddBoxKit(selectedPhone.uid);
  };

  return (
    <div className="flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-12 gap-2.5 lg:gap-4 safe-px py-2 lg:p-4 overflow-y-auto sm:overflow-hidden pasaj-scroll">
      {/* LEFT: INVENTORY, SHOWCASE & HASAN USTA QUEUE */}
      <aside className="sm:col-span-4 flex flex-col sm:min-h-0 sm:h-full rounded-xl lg:rounded-2xl border border-white/10 bg-[#161E29] sm:overflow-hidden">
        <div className="px-3 py-2 lg:px-4 lg:py-3 border-b border-white/8 flex items-center justify-between gap-2 shrink-0">
          <div>
            <h2 className="font-display text-base font-bold text-slate-100">
              Stok & Vitrin ({inventory.length})
            </h2>
            <div className="text-[11px] text-slate-400 tabular-nums">
              Vitrin Rafı:{' '}
              <strong className="text-amber-400">
                {listedCount}/{showcaseCap}
              </strong>{' '}
              (Raf Sv.{showcaseUpgradeLevel}/{SHOWCASE_UPGRADE_MAX_LEVEL})
            </div>
          </div>
          <button
            type="button"
            onClick={onGoToUpgrades}
            className="rounded-lg border border-amber-500/35 bg-amber-500/12 px-2.5 py-1.5 text-[11px] font-bold text-amber-300 hover:bg-amber-500/20 cursor-pointer whitespace-nowrap"
          >
            Raf Yükselt +
          </button>
        </div>

        {/* Hasan Usta Active Repair Queue */}
        {hasMasterTech && (
          <div className="px-3.5 py-2.5 border-b border-white/8 bg-[#121B26] shrink-0">
            <div className="flex items-center justify-between text-[11px] font-bold text-sky-300 mb-1.5">
              <span className="inline-flex items-center gap-1.5">
                <UserCog className="w-3.5 h-3.5" />
                <span>Hasan Usta (Sv.{masterLevel}) Tezgahı</span>
              </span>
              <span className="font-mono text-slate-400">
                {staffRepairQueue.length}/{masterSpecs.maxParallelJobs} iş
              </span>
            </div>
            {staffRepairQueue.length === 0 ? (
              <div className="text-[11px] text-slate-400">
                Usta boşta! Arızalı cihazları sağdan ustaya aktarabilirsin ({masterSpecs.turnsPerJob} turda bitirir).
              </div>
            ) : (
              <div className="space-y-1.5">
                {staffRepairQueue.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-lg border border-sky-500/25 bg-sky-500/10 px-2.5 py-1.5 flex items-center justify-between text-[11px]"
                  >
                    <div className="truncate text-sky-100 font-medium">
                      {job.mode === 'EXPRESS_CUSTOMER' ? 'Acil: ' : ''}
                      {job.deviceName}
                    </div>
                    <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-300 shrink-0 ml-2">
                      <Clock className="w-3 h-3" />
                      {job.turnsRemaining} tur
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-y-auto pasaj-scroll divide-y divide-white/6">
          {inventory.map((phone) => {
            const cond = getConditionInfo(phone);
            const active = phone.uid === selectedUid;
            const market = calculateMarketValue(phone, false, dailyNews, upgrades);
            const bundleCount = phone.bundledAccessories?.length ?? 0;

            return (
              <button
                key={phone.uid}
                type="button"
                onClick={() => setSelectedUid(phone.uid)}
                className={`w-full text-left px-4 py-3.5 transition-colors cursor-pointer ${
                  active ? 'bg-amber-500/12' : 'hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm text-slate-100 truncate">
                    {phone.brand} {phone.model}
                    {phone.isBrandNew && (
                      <span className="text-emerald-400 text-xs font-bold"> · Sıfır</span>
                    )}
                    {phone.masterCrafted && (
                      <span className="text-amber-400 text-xs font-bold"> · Usta İşi</span>
                    )}
                    {bundleCount > 0 && (
                      <span className="text-sky-300 text-xs font-bold">
                        {' '}
                        · +{bundleCount} Aksesuar
                      </span>
                    )}
                  </span>
                  <span
                    className={`text-xs font-semibold whitespace-nowrap shrink-0 ${
                      phone.assignedToStaff
                        ? 'text-sky-400'
                        : phone.listedForSale
                        ? 'text-emerald-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {phone.assignedToStaff
                      ? 'Ustada'
                      : phone.listedForSale
                      ? 'Vitrinde'
                      : 'Atölyede'}
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between text-xs text-slate-400 tabular-nums">
                  <span>
                    {cond.label} · {phone.isBrandNew ? '24 Ay TR' : `${phone.defects.length} kusur`}
                  </span>
                  <span className="font-mono text-slate-200">
                    {phone.listedForSale
                      ? formatTRY(phone.askingPrice)
                      : `Değer ${formatTRY(market)}`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* RIGHT: MULTI-DEFECT REPAIR BENCH, MULTI-ACCESSORY BUNDLES & LISTING */}
      {selectedPhone && condition && demand && (
        <section className="sm:col-span-8 flex flex-col sm:min-h-0 sm:h-full rounded-xl lg:rounded-2xl border border-white/10 bg-[#161E29] p-3 lg:p-5 sm:overflow-y-auto pasaj-scroll">
          {!hasOwnBench && (
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3">
              <div className="flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div className="text-xs text-amber-100 leading-relaxed">
                  <strong>Kendi ESD Tamir Tezgahın Kilitli:</strong> Dış servis +%45 pahalı çalışır. Kendi tezgahını kurduğunda tek seferde tüm arızaları onarıp +%12 Usta İşi primi kazanırsın!
                </div>
              </div>
              <button
                type="button"
                onClick={onGoToUpgrades}
                className="rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Tezgahı Kur (5.500 ₺)
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Phone Visual + Cost Summary */}
            <div className="md:col-span-5 flex flex-col items-center">
              <PhoneInspectSVG
                device={selectedPhone}
                revealAll
                flashKey={flashKey}
              />

              <div className="w-full mt-4 space-y-2 border-t border-white/8 pt-3 text-xs tabular-nums">
                <div className="flex justify-between">
                  <span className="text-slate-400">Kondisyon</span>
                  <span
                    className={`font-semibold ${
                      condition.tone === 'positive'
                        ? 'text-emerald-400'
                        : condition.tone === 'warning'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {condition.label} ({condition.score}/100)
                  </span>
                </div>
                {selectedPhone.masterCrafted && (
                  <div className="flex justify-between text-amber-300">
                    <span className="inline-flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      <span>Usta İşi Mührü</span>
                    </span>
                    <span className="font-semibold">+%12 Değer</span>
                  </div>
                )}
                {(selectedPhone.bundledAccessories?.length ?? 0) > 0 && (
                  <div className="flex justify-between text-sky-300">
                    <span className="inline-flex items-center gap-1">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Aksesuar Paketi</span>
                    </span>
                    <span className="font-semibold">
                      {selectedPhone.bundledAccessories?.length} parça dahil
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Alış Fiyatı</span>
                  <span className="font-mono text-slate-200">
                    {formatTRY(selectedPhone.purchasePrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tamir & Paket Masrafı</span>
                  <span className="font-mono text-slate-200">
                    {formatTRY(selectedPhone.repairSpend)}
                  </span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-white/8">
                  <span className="text-slate-300 font-medium">Güncel Piyasa Değeri</span>
                  <span className="font-mono font-bold text-amber-400">
                    {formatTRY(fairValue)}
                  </span>
                </div>
                {selectedPhone.surpriseNote && (
                  <div className="mt-2 rounded-lg border border-rose-500/35 bg-rose-500/10 px-2.5 py-2 text-[11px] text-rose-200 leading-snug">
                    <strong className="text-rose-300">Atölye Notu: </strong>
                    {selectedPhone.surpriseNote}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Single-Session Multi-Repair + Multi-Accessory Bundle + Showcase */}
            <div className="md:col-span-7 flex flex-col gap-5">
              <div>
                <h3 className="font-display text-2xl font-bold text-slate-50">
                  {selectedPhone.brand} {selectedPhone.model}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedPhone.storage} ·{' '}
                  {selectedPhone.imeiStatus === 'TR_REGISTERED'
                    ? 'TR Kayıtlı IMEI'
                    : 'Yurt Dışı Kayıtsız'}{' '}
                  · {selectedPhone.hasBoxAndCharger ? 'Kutu & Şarj Mevcut' : 'Kutusuz'}
                </p>
              </div>

              {/* STAFF ASSIGNED LOCK NOTICE */}
              {selectedPhone.assignedToStaff ? (
                <div className="rounded-xl border border-sky-500/35 bg-sky-500/12 p-4 text-xs text-sky-100 space-y-1">
                  <div className="font-bold text-sky-300 flex items-center gap-1.5">
                    <UserCog className="w-4 h-4" />
                    <span>Hasan Usta Şu An Bu Cihazı Tamir Ediyor!</span>
                  </div>
                  <p>
                    Tezgahta müşterilerle ilgilenmeye devam et; süre dolunca tüm arızalar giderilmiş ve Usta İşi mühürlü şekilde hazır olacak.
                  </p>
                </div>
              ) : (
                /* REPAIR BENCH SECTION */
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-semibold text-slate-300">
                      {hasOwnBench
                        ? 'Tek Oturumda Çoklu Tamir Masası'
                        : 'Dış Tamirci Servisi'}
                    </span>
                    {(legacyPath === 'EX_APPRENTICE' ||
                      (hasOwnBench && (hasWholesale || dailyNews.repairDiscount))) && (
                      <span className="text-xs text-emerald-400">
                        {legacyPath === 'EX_APPRENTICE'
                          ? 'Eski Çırak -%20 Aktif'
                          : 'Parça İndirimi Aktif'}
                      </span>
                    )}
                  </div>

                  {selectedPhone.defects.length === 0 ? (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/8 px-3.5 py-3 text-xs text-emerald-200">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Cihazın donanım kusuru kalmadı, vitrinde yüksek fiyata hazır!</span>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {/* ONE-SESSION ALL DEFECTS ACTION BAR */}
                      {repairableDefects.length >= 1 && (
                        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 space-y-2.5">
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="inline-flex items-center gap-1.5 font-bold text-amber-200">
                              <Layers className="w-4 h-4 text-amber-400" />
                              <span>
                                {repairableDefects.length > 1
                                  ? `Tüm ${repairableDefects.length} Arızayı Tek Seferde Onar (-%10 Paket İşçilik)`
                                  : `Tek Oturumda Tamir: ${DEFECT_CATALOG[repairableDefects[0]].shortLabel}`}
                              </span>
                            </span>
                            <span className="font-mono font-extrabold text-amber-300 tabular-nums">
                              {formatTRY(allRepairCost)}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {hasOwnBench ? (
                              <>
                                <button
                                  type="button"
                                  disabled={cash < allRepairCost}
                                  onClick={() =>
                                    onStartMiniRepair(
                                      selectedPhone,
                                      repairableDefects,
                                      allRepairCost
                                    )
                                  }
                                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-40 cursor-pointer whitespace-nowrap"
                                >
                                  <Wrench className="w-3.5 h-3.5" />
                                  <span>
                                    Tamir Masasına Otur ({repairableDefects.length} Arıza)
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  disabled={cash < allRepairCost}
                                  onClick={() => handleQuickMulti(repairableDefects)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-[#1F2B3B] px-3 py-2 text-xs font-bold text-slate-200 hover:bg-[#29384D] disabled:opacity-40 cursor-pointer whitespace-nowrap"
                                >
                                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Hızlı Bitir</span>
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                disabled={cash < allRepairCost}
                                onClick={() => handleQuickMulti(repairableDefects)}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-40 cursor-pointer"
                              >
                                <Wrench className="w-3.5 h-3.5" />
                                <span>Dış Servise Ver ({formatTRY(allRepairCost)})</span>
                              </button>
                            )}
                          </div>

                          {/* Back-side grouped repair option when phone has both front & multiple back defects */}
                          {backZoneDefects.length >= 2 &&
                            backZoneDefects.length < repairableDefects.length &&
                            hasOwnBench && (
                              <button
                                type="button"
                                disabled={cash < backZoneCost}
                                onClick={() =>
                                  onStartMiniRepair(
                                    selectedPhone,
                                    backZoneDefects,
                                    backZoneCost
                                  )
                                }
                                className="w-full rounded-lg border border-sky-400/35 bg-sky-500/12 px-3 py-1.5 text-[11px] font-bold text-sky-200 hover:bg-sky-500/20 disabled:opacity-40 cursor-pointer tabular-nums"
                              >
                                Sadece Arka Taraf Arızalarını Birlikte Onar ({backZoneDefects.length} Parça ·{' '}
                                {formatTRY(backZoneCost)})
                              </button>
                            )}

                          {/* Delegate to Hasan Usta (Timed Repair) */}
                          {hasMasterTech && (
                            <button
                              type="button"
                              disabled={!canDelegateSlot || cash < masterDelegateCost}
                              onClick={() =>
                                onDelegateRepairToMaster(
                                  selectedPhone.uid,
                                  repairableDefects
                                )
                              }
                              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-400/40 bg-emerald-500/15 px-3 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-500/25 disabled:opacity-40 cursor-pointer tabular-nums"
                            >
                              <UserCog className="w-3.5 h-3.5" />
                              <span>
                                {canDelegateSlot
                                  ? `Hasan Usta’ya Aktar (${formatTRY(masterDelegateCost)} · ${masterSpecs.turnsPerJob} Turda Biter)`
                                  : `Hasan Usta Dolu (${staffRepairQueue.length}/${masterSpecs.maxParallelJobs})`}
                              </span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Individual Defect List */}
                      {selectedPhone.defects.map((defectId) => {
                        const def = DEFECT_CATALOG[defectId];
                        const cost = getRepairCost(
                          defectId,
                          upgrades,
                          dailyNews,
                          !hasOwnBench,
                          shopLevel,
                          legacyPath
                        );
                        const valueGain = roundPrice(
                          selectedPhone.baseValue * def.valuePenaltyRatio
                        );
                        return (
                          <div
                            key={defectId}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-white/10 bg-[#1B2533] px-3.5 py-2.5"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-100">
                                  {def.name}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  ({def.zone === 'front' ? 'Ön Ekran' : 'Arka / İç'})
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 tabular-nums">
                                {def.repairable
                                  ? `Onarım sonrası +${formatTRY(valueGain)} değer artışı`
                                  : 'BTK kaydı atölyede yapılamaz.'}
                              </div>
                            </div>

                            {def.repairable ? (
                              <div className="flex items-center gap-1.5 shrink-0">
                                {hasOwnBench && (
                                  <button
                                    type="button"
                                    disabled={cash < cost}
                                    onClick={() =>
                                      onStartMiniRepair(selectedPhone, [defectId], cost)
                                    }
                                    className="rounded-lg border border-amber-500/40 bg-amber-500/15 px-2.5 py-1.5 text-[11px] font-bold text-amber-300 hover:bg-amber-500/25 disabled:opacity-40 cursor-pointer tabular-nums"
                                  >
                                    Tek Onar ({formatTRY(cost)})
                                  </button>
                                )}
                                {!hasOwnBench && (
                                  <button
                                    type="button"
                                    disabled={cash < cost}
                                    onClick={() => handleQuickMulti([defectId])}
                                    className="rounded-lg border border-white/15 bg-[#243144] px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 hover:bg-[#2E3F57] disabled:opacity-40 cursor-pointer tabular-nums"
                                  >
                                    Dış Servis ({formatTRY(cost)})
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs font-medium text-rose-400 whitespace-nowrap shrink-0">
                                Kalıcı Kusur
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {!selectedPhone.hasBoxAndCharger && (
                    <div className="mt-2.5 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#1B2533] px-3.5 py-2.5">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-100">
                          Kutu + Orijinal Şarj Seti Tamamla
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Cihaz kusursuzsa değerini “Sıfır Ayarında” seviyesine çıkarır.
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={cash < boxKitPrice}
                        onClick={handleBoxClick}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/12 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 disabled:opacity-40 cursor-pointer whitespace-nowrap shrink-0 tabular-nums"
                      >
                        <PackagePlus className="w-3.5 h-3.5" />
                        <span>Ekle ({formatTRY(boxKitPrice)})</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* MULTI-ACCESSORY SHOWCASE BUNDLE (Replaces Custom Modding!) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-300">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Vitrin Aksesuar Kombini (Birden Fazla Ürün Tak & Sat)</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Takılı: {(selectedPhone.bundledAccessories ?? []).length}/{ACCESSORY_CATALOG.length}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-2.5">
                  Reyon stoğundaki kırılmaz cam, kılıf, şarj seti, powerbank veya kulaklıkları tek tek değil <strong>hepsini birden</strong> bu cihaza kombine edip vitrin değerini yükseltebilirsin!
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ACCESSORY_CATALOG.map((acc) => {
                    const attached = (selectedPhone.bundledAccessories ?? []).includes(
                      acc.id
                    );
                    const stockQty = accessories[acc.id]?.quantity ?? 0;
                    const valueBoost = Math.round(acc.recommendedPrice * 1.1);

                    return (
                      <button
                        key={acc.id}
                        type="button"
                        disabled={attached || stockQty <= 0 || selectedPhone.assignedToStaff}
                        onClick={() => {
                          setFlashKey((k) => k + 1);
                          onAttachAccessoryBundle(selectedPhone.uid, acc.id);
                        }}
                        className={`text-left rounded-xl border p-2.5 transition-colors flex items-center gap-2 ${
                          attached
                            ? 'border-emerald-500/40 bg-emerald-500/12 cursor-default'
                            : stockQty > 0
                            ? 'border-white/10 bg-[#1B2533] hover:border-sky-400/50 hover:bg-[#223044] cursor-pointer'
                            : 'border-white/6 bg-[#131922] opacity-45 cursor-not-allowed'
                        }`}
                      >
                        <AccessoryProductArt id={acc.id} className="w-9 h-9 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-bold text-slate-100 truncate">
                            {acc.name.split(' ').slice(0, 2).join(' ')}
                          </div>
                          {attached ? (
                            <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                              <Check className="w-3 h-3" />
                              <span>Pakete Eklendi</span>
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-400 tabular-nums">
                              +{formatTRY(valueBoost)} · Stok {stockQty}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Showcase Pricing & Publish */}
              <div className="rounded-xl border border-white/10 bg-[#121822] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300">
                    Vitrin Etiket Fiyatı
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      demand.tone === 'positive'
                        ? 'text-emerald-400'
                        : demand.tone === 'warning'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {demand.label}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mb-3 tabular-nums">
                  <span className="font-mono text-2xl font-extrabold text-slate-50">
                    {formatTRY(currentAsk)}
                  </span>
                  <span
                    className={`text-xs font-mono font-semibold ${
                      projectedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    Brüt Kâr: {projectedProfit >= 0 ? '+' : ''}
                    {formatTRY(projectedProfit)}
                  </span>
                </div>

                <input
                  type="range"
                  min={roundPrice(Math.max(1000, fairValue * 0.75))}
                  max={roundPrice(fairValue * 1.45)}
                  step={fairValue > 20000 ? 500 : 250}
                  value={currentAsk}
                  onChange={(e) =>
                    onUpdateListing(
                      selectedPhone.uid,
                      selectedPhone.listedForSale,
                      Number(e.target.value)
                    )
                  }
                  aria-label="Vitrin etiket fiyatı"
                  className="pasaj-slider w-full mb-3"
                />

                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: 'Hızlı Satış', mult: 1.0 },
                    { label: 'İdeal Kâr', mult: 1.15 },
                    { label: 'Lüks Etiket', mult: 1.3 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() =>
                        onUpdateListing(
                          selectedPhone.uid,
                          selectedPhone.listedForSale,
                          roundPrice(fairValue * preset.mult)
                        )
                      }
                      className="rounded-lg border border-white/10 bg-[#1B2533] py-1.5 text-xs font-medium text-slate-200 hover:bg-[#253345] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <p className="text-xs text-slate-400 mb-3.5">{demand.hint}</p>

                <button
                  type="button"
                  disabled={!canListMore || selectedPhone.assignedToStaff}
                  onClick={() =>
                    onUpdateListing(
                      selectedPhone.uid,
                      !selectedPhone.listedForSale,
                      currentAsk
                    )
                  }
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-colors whitespace-nowrap cursor-pointer ${
                    selectedPhone.listedForSale
                      ? 'border border-white/15 bg-[#1E2836] text-slate-200 hover:bg-[#273548]'
                      : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>
                    {selectedPhone.assignedToStaff
                      ? 'Hasan Usta Onarımı Bitirince Vitrine Koyabilirsin'
                      : selectedPhone.listedForSale
                      ? 'Vitrinden Çek (Atölyeye Al)'
                      : !canListMore
                      ? `Vitrin Dolu (${listedCount}/${showcaseCap}) — Raf Yükselt`
                      : 'Vitrine Koy & Satışa Aç'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
