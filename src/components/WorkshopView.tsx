import React, { useEffect, useState } from 'react';
import {
  Award,
  Lock,
  PackagePlus,
  Palette,
  ShieldCheck,
  Store,
  Wrench,
  Zap,
} from 'lucide-react';
import { CUSTOM_MODS, CUSTOM_MOD_LIST, DEFECT_CATALOG } from '../game/catalog';
import {
  calculateMarketValue,
  formatTRY,
  getConditionInfo,
  getListingDemand,
  getRepairCost,
  getShowcaseCapacity,
  roundPrice,
} from '../game/engine';
import {
  CustomModId,
  DailyMarketEvent,
  DefectId,
  LegacyPathId,
  PhoneDevice,
  ShopTier,
  UpgradeId,
} from '../game/types';
import { PhoneInspectSVG } from './PhoneInspectSVG';

interface WorkshopViewProps {
  inventory: PhoneDevice[];
  cash: number;
  shopTier: ShopTier;
  shopLevel: number;
  legacyPath: LegacyPathId;
  upgrades: UpgradeId[];
  dailyNews: DailyMarketEvent;
  onQuickRepairDefect: (phoneUid: string, defectId: DefectId, external: boolean) => void;
  onStartMiniRepair: (phone: PhoneDevice, defectId: DefectId, cost: number) => void;
  onAddBoxKit: (phoneUid: string) => void;
  onApplyCustomMod: (phoneUid: string, modId: CustomModId) => void;
  onUpdateListing: (phoneUid: string, listed: boolean, askingPrice: number) => void;
  onBackToCounter: () => void;
  onGoToUpgrades: () => void;
}

export const BOX_KIT_COST = 600;

export const WorkshopView: React.FC<WorkshopViewProps> = ({
  inventory,
  cash,
  shopTier,
  shopLevel,
  legacyPath,
  upgrades,
  dailyNews,
  onQuickRepairDefect,
  onStartMiniRepair,
  onAddBoxKit,
  onApplyCustomMod,
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
  const showcaseCap = getShowcaseCapacity(shopTier, upgrades);
  const hasOwnBench = upgrades.includes('repair_bench');
  const hasWholesale = upgrades.includes('parts_wholesale');

  if (inventory.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <Wrench className="w-10 h-10 text-slate-500 mb-3" />
        <h2 className="font-display text-2xl font-bold text-slate-100 mb-2">
          Atölye ve Vitrin Şu An Boş
        </h2>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          Tezgaha dönüp satıcılardan kelepir telefonlar satın al; burada tamir edip vitrine çıkardığında alıcılar sıraya girecek.
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
    ? calculateMarketValue(selectedPhone, false, dailyNews)
    : 0;
  const condition = selectedPhone ? getConditionInfo(selectedPhone) : null;
  const currentAsk =
    selectedPhone && selectedPhone.askingPrice > 0
      ? selectedPhone.askingPrice
      : roundPrice(fairValue * 1.15);

  const demand = selectedPhone
    ? getListingDemand({ ...selectedPhone, askingPrice: currentAsk }, dailyNews)
    : null;
  const totalCost = selectedPhone
    ? selectedPhone.purchasePrice + selectedPhone.repairSpend
    : 0;
  const projectedProfit = currentAsk - totalCost;
  const canListMore = selectedPhone?.listedForSale || listedCount < showcaseCap;
  const boxKitPrice = hasWholesale ? 420 : BOX_KIT_COST;

  const handleQuickRepair = (defectId: DefectId) => {
    if (!selectedPhone) return;
    setFlashKey((k) => k + 1);
    onQuickRepairDefect(selectedPhone.uid, defectId, !hasOwnBench);
  };

  const handleBoxClick = () => {
    if (!selectedPhone) return;
    setFlashKey((k) => k + 1);
    onAddBoxKit(selectedPhone.uid);
  };

  return (
    <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 overflow-y-auto lg:overflow-hidden">
      {/* LEFT: INVENTORY & SHOWCASE LIST */}
      <aside className="lg:col-span-4 flex flex-col min-h-0 rounded-2xl border border-white/10 bg-[#161E29] overflow-hidden">
        <div className="px-4 py-3.5 border-b border-white/8 flex items-center justify-between shrink-0">
          <h2 className="font-display text-base font-bold text-slate-100">
            Stok & Vitrin ({inventory.length})
          </h2>
          <span className="text-xs text-slate-400 tabular-nums">
            Vitrin <strong className="text-amber-400">{listedCount}/{showcaseCap}</strong>
          </span>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto pasaj-scroll divide-y divide-white/6">
          {inventory.map((phone) => {
            const cond = getConditionInfo(phone);
            const active = phone.uid === selectedUid;
            const market = calculateMarketValue(phone, false, dailyNews);
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
                      <span className="text-emerald-400 text-xs font-bold"> · Sıfır Kutu</span>
                    )}
                    {phone.masterCrafted && (
                      <span className="text-amber-400 text-xs font-bold"> · Usta İşi</span>
                    )}
                    {phone.customMod && (
                      <span className="text-sky-300 text-xs font-bold">
                        {' '}
                        · {CUSTOM_MODS[phone.customMod].badgeText}
                      </span>
                    )}
                  </span>
                  <span
                    className={`text-xs font-semibold whitespace-nowrap shrink-0 ${
                      phone.listedForSale ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    {phone.listedForSale ? 'Vitrinde' : 'Atölyede'}
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

      {/* RIGHT: REPAIR BENCH & LISTING CONTROLS */}
      {selectedPhone && condition && demand && (
        <section className="lg:col-span-8 flex flex-col min-h-0 rounded-2xl border border-white/10 bg-[#161E29] p-5 overflow-y-auto pasaj-scroll">
          {/* Locked Repair Bench Banner */}
          {!hasOwnBench && (
            <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3">
              <div className="flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div className="text-xs text-amber-100 leading-relaxed">
                  <strong>Kendi Tamir Tezgahın Kilitli:</strong> Şu an dış tamirciye +%45 fazla ödüyorsun ve 5 Aşamalı Mikro Tamir (+%12 Usta İşi) kapalı.
                </div>
              </div>
              <button
                type="button"
                onClick={onGoToUpgrades}
                className="rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Tezgahı Aç (5.500 ₺)
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
                      <span>Usta İşi Bonusu</span>
                    </span>
                    <span className="font-semibold">+%12 Değer</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Alış Fiyatı</span>
                  <span className="font-mono text-slate-200">
                    {formatTRY(selectedPhone.purchasePrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tamir Harcaması</span>
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
              </div>
            </div>

            {/* Repair Actions & Showcase Pricing */}
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

              {/* Repair Section */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold text-slate-300">
                    {hasOwnBench ? 'Kendi Tamir Tezgahın (Açık)' : 'Dış Tamirci Servisi'}
                  </span>
                  {(legacyPath === 'EX_APPRENTICE' ||
                    (hasOwnBench && (hasWholesale || dailyNews.repairDiscount))) && (
                    <span className="text-xs text-emerald-400">
                      {legacyPath === 'EX_APPRENTICE'
                        ? 'Eski Çırak -%20 Tamir Avantajı Aktif'
                        : 'Parça İndirimi Aktif'}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {selectedPhone.defects.length === 0 ? (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/8 px-3.5 py-3 text-xs text-emerald-200">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Cihazın donanım kusuru kalmadı, vitrinde yüksek fiyata hazır!</span>
                    </div>
                  ) : (
                    selectedPhone.defects.map((defectId) => {
                      const def = DEFECT_CATALOG[defectId];
                      const cost = getRepairCost(
                        defectId,
                        upgrades,
                        dailyNews,
                        !hasOwnBench,
                        shopLevel,
                        legacyPath
                      );
                      const canAfford = cash >= cost;
                      const valueGain = roundPrice(
                        selectedPhone.baseValue * def.valuePenaltyRatio
                      );
                      return (
                        <div
                          key={defectId}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#1B2533] px-3.5 py-3"
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-slate-100">
                              {def.name}
                            </div>
                            <div className="text-xs text-slate-400 tabular-nums">
                              {def.repairable
                                ? `Onarım sonrası +${formatTRY(valueGain)} değer artışı`
                                : 'BTK kaydı atölyede yapılamaz.'}
                            </div>
                          </div>

                          {def.repairable ? (
                            hasOwnBench ? (
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  disabled={!canAfford}
                                  onClick={() =>
                                    onStartMiniRepair(selectedPhone, defectId, cost)
                                  }
                                  className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-40 cursor-pointer whitespace-nowrap tabular-nums"
                                  title="5 aşamalı mikro tamir masasıyla +%12 Usta İşi değeri kazan"
                                >
                                  <Wrench className="w-3.5 h-3.5" />
                                  <span>Tamir Masası ({formatTRY(cost)})</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={!canAfford}
                                  onClick={() => handleQuickRepair(defectId)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-white/12 bg-[#233042] px-2.5 py-2 text-xs font-semibold text-slate-200 hover:bg-[#2C3C52] disabled:opacity-40 cursor-pointer whitespace-nowrap"
                                  title="Tek tıkla standart hızlı tamir"
                                >
                                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Hızlı</span>
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                disabled={!canAfford}
                                onClick={() => handleQuickRepair(defectId)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#243144] px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-[#2E3F57] disabled:opacity-40 cursor-pointer whitespace-nowrap shrink-0 tabular-nums"
                              >
                                <Wrench className="w-3.5 h-3.5 text-slate-400" />
                                <span>Dış Servis ({formatTRY(cost)})</span>
                              </button>
                            )
                          ) : (
                            <span className="text-xs font-medium text-rose-400 whitespace-nowrap shrink-0">
                              Kalıcı Kusur
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}

                  {!selectedPhone.hasBoxAndCharger && (
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#1B2533] px-3.5 py-2.5">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-100">
                          Kutu + Orijinal Şarj Seti Tamamla
                        </div>
                        <div className="text-xs text-slate-400">
                          Cihaz kusursuzsa değerini “Sıfır Ayarında” seviyesine çıkarır.
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={cash < boxKitPrice}
                        onClick={handleBoxClick}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/12 px-3 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/20 disabled:opacity-40 cursor-pointer whitespace-nowrap shrink-0 tabular-nums"
                      >
                        <PackagePlus className="w-3.5 h-3.5" />
                        <span>Ekle ({formatTRY(boxKitPrice)})</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Custom Phone Modding Studio */}
              {!selectedPhone.isBrandNew && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-300">
                      <Palette className="w-3.5 h-3.5" />
                      <span>Kişiselleştirme & Custom Mod Atölyesi</span>
                    </span>
                    {selectedPhone.customMod && (
                      <span className="text-xs font-bold text-emerald-400">
                        Aktif: {CUSTOM_MODS[selectedPhone.customMod].badgeText} (+%
                        {Math.round(CUSTOM_MODS[selectedPhone.customMod].valueBoostRatio * 100)} Değer)
                      </span>
                    )}
                  </div>

                  {selectedPhone.customMod ? (
                    <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-3.5 py-2.5 text-xs text-sky-100">
                      Bu cihaza <strong>{CUSTOM_MODS[selectedPhone.customMod].name}</strong> uygulandı! VIP ve içerik üreticisi alıcılar vitrinde ekstra yüksek bütçeyle gelir.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {CUSTOM_MOD_LIST.map((mod) => {
                        const canAffordMod = cash >= mod.cost;
                        return (
                          <button
                            key={mod.id}
                            type="button"
                            disabled={!canAffordMod}
                            onClick={() => {
                              setFlashKey((k) => k + 1);
                              onApplyCustomMod(selectedPhone.uid, mod.id);
                            }}
                            className="text-left rounded-xl border border-white/10 bg-[#1B2533] hover:border-sky-400/50 hover:bg-[#212F42] p-2.5 transition-colors disabled:opacity-40 cursor-pointer"
                          >
                            <div className="flex items-center justify-between text-xs font-bold text-slate-100">
                              <span className="truncate">{mod.badgeText}</span>
                              <span className="text-emerald-400 font-mono">
                                +%{Math.round(mod.valueBoostRatio * 100)}
                              </span>
                            </div>
                            <div className="text-[10.5px] text-slate-400 mt-1 line-clamp-2">
                              {mod.description}
                            </div>
                            <div className="mt-2 font-mono text-xs font-bold text-amber-300 tabular-nums">
                              Uygula ({formatTRY(mod.cost)})
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

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
                    Beklenen Kâr: {projectedProfit >= 0 ? '+' : ''}
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
                  disabled={!canListMore}
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
                    {selectedPhone.listedForSale
                      ? 'Vitrinden Çek (Atölyeye Al)'
                      : !canListMore
                      ? `Vitrin Dolu (${listedCount}/${showcaseCap}) — Dükkanı Büyüt`
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
