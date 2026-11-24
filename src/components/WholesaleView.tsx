import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Lock,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Sparkles,
  Truck,
  Zap,
} from 'lucide-react';
import {
  ACCESSORY_CATALOG,
  BRAND_DISTRIBUTORS,
  PHONE_CATALOG,
} from '../game/catalog';
import {
  calculateSaleTax,
  estimateBrandNewRetailValue,
  formatTRY,
  getAccessoryWholesaleCost,
  getDistributorWholesalePrice,
  getTotalAccessoryStock,
  isAccessoryUnlocked,
  isDistributorUnlocked,
} from '../game/engine';
import {
  getLocalizedAccessory,
  getLocalizedDistributor,
  useLanguage,
} from '../game/i18n';
import { AccessoryId, PhoneModelSpec, ShopState } from '../game/types';
import { PhoneModelThumb } from './PhoneInspectSVG';
import { AccessoryProductArt, PhoneBoxArt } from './VisualShowcaseArt';

interface WholesaleViewProps {
  shop: ShopState;
  onBuyAccessoryStock: (
    accessoryId: AccessoryId,
    quantity: number,
    expressDelivery: boolean
  ) => void;
  onUpdateAccessoryPrice: (accessoryId: AccessoryId, newPrice: number) => void;
  onOrderBrandNewPhone: (
    spec: PhoneModelSpec,
    wholesaleCost: number,
    expressDelivery: boolean
  ) => void;
  onBackToCounter: () => void;
}

type WholesaleSubTab = 'ACCESSORIES' | 'BRAND_NEW' | 'CARGO';

export const EXPRESS_ACCESSORY_FEE = 250;
export const EXPRESS_PHONE_FEE = 500;

export const WholesaleView: React.FC<WholesaleViewProps> = ({
  shop,
  onBuyAccessoryStock,
  onUpdateAccessoryPrice,
  onOrderBrandNewPhone,
  onBackToCounter,
}) => {
  const { lang, bi } = useLanguage();
  const flashDeal = shop.flashWholesaleDeal;
  const flashActive = Boolean(
    flashDeal && !flashDeal.expired && flashDeal.remainingStock > 0
  );
  const [subTab, setSubTab] = useState<WholesaleSubTab>(
    flashActive ? 'BRAND_NEW' : 'ACCESSORIES'
  );
  const [expressDelivery, setExpressDelivery] = useState(false);
  const [selectedDistId, setSelectedDistId] = useState<string>(
    BRAND_DISTRIBUTORS[0].id
  );
  const [modelPage, setModelPage] = useState(0);

  const totalAccStock = getTotalAccessoryStock(shop.accessories);
  const pendingOrders = shop.pendingWholesaleOrders ?? [];

  const activeDist =
    BRAND_DISTRIBUTORS.find((d) => d.id === selectedDistId) ??
    BRAND_DISTRIBUTORS[0];
  const activeDistLoc = getLocalizedDistributor(activeDist.id, lang);
  const distUnlocked = isDistributorUnlocked(
    activeDist.id,
    shop.level,
    shop.reputation
  );
  const distModels = PHONE_CATALOG.filter((p) =>
    activeDist.brands.includes(p.brand)
  );
  const MODELS_PER_PAGE = 4;
  const totalModelPages = Math.max(
    1,
    Math.ceil(distModels.length / MODELS_PER_PAGE)
  );
  const safeModelPage = Math.min(modelPage, totalModelPages - 1);
  const visibleModels = distModels.slice(
    safeModelPage * MODELS_PER_PAGE,
    safeModelPage * MODELS_PER_PAGE + MODELS_PER_PAGE
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#0F141B] p-2 lg:p-3 gap-2">
      {/* COMPACT SINGLE-ROW TOOLBAR */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-1.5 rounded-xl border border-white/10 bg-[#151D28] px-2.5 py-1.5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSubTab('ACCESSORIES')}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'ACCESSORIES'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-[#0E141D] text-slate-300 hover:text-white border border-white/10'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {bi('Aksesuarlar', 'Accessories')}
            <span className="font-mono text-[10px] opacity-80">
              ({totalAccStock})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('BRAND_NEW')}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'BRAND_NEW'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-[#0E141D] text-slate-300 hover:text-white border border-white/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {bi('Sıfır Telefon', 'Sealed Phones')}
            {flashActive && (
              <span className="rounded bg-rose-500 px-1 py-0.2 text-[9px] font-extrabold text-white">
                {bi('FLAŞ', 'FLASH')}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSubTab('CARGO')}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'CARGO'
                ? 'bg-sky-500 text-slate-950'
                : 'bg-[#0E141D] text-slate-300 hover:text-white border border-white/10'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            {bi('Yoldaki Kargo', 'In Transit')}
            {pendingOrders.length > 0 && (
              <span className="font-mono rounded bg-sky-400/20 px-1 text-[10px] text-sky-300">
                {pendingOrders.length}
              </span>
            )}
          </button>
        </div>

        {/* Cargo vs Express Switch + Back */}
        <div className="flex items-center gap-1.5">
          <div className="inline-flex rounded-lg border border-white/10 bg-[#0E141D] p-0.5">
            <button
              type="button"
              onClick={() => setExpressDelivery(false)}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold transition-colors whitespace-nowrap cursor-pointer ${
                !expressDelivery
                  ? 'bg-sky-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              <Clock className="w-3 h-3" />
              {bi('Kargo (Ücretsiz)', 'Standard (Free)')}
            </button>
            <button
              type="button"
              onClick={() => setExpressDelivery(true)}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold transition-colors whitespace-nowrap cursor-pointer ${
                expressDelivery
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              <Zap className="w-3 h-3" />
              {bi('Ekspres', 'Express')}
            </button>
          </div>

          <button
            type="button"
            onClick={onBackToCounter}
            className="rounded-lg border border-white/10 bg-[#1B2432] px-2.5 py-1 text-[11px] font-semibold text-slate-200 hover:bg-[#243042] whitespace-nowrap cursor-pointer"
          >
            ← {bi('Tezgah', 'Counter')}
          </button>
        </div>
      </div>

      {/* TAB 1: ALL 6 ACCESSORIES WITH HERO PRODUCT SHOWCASE (3x2 ZERO SCROLL) */}
      {subTab === 'ACCESSORIES' && (
        <div className="flex-1 min-h-0 grid grid-cols-3 grid-rows-2 gap-2 overflow-hidden">
          {ACCESSORY_CATALOG.map((spec) => {
            const loc = getLocalizedAccessory(spec.id, lang);
            const stock = shop.accessories[spec.id];
            const unlocked = isAccessoryUnlocked(spec.id, shop.level);
            const unitCost = getAccessoryWholesaleCost(spec.id, shop.legacyPath);
            const fee = expressDelivery ? EXPRESS_ACCESSORY_FEE : 0;
            const cost3 = unitCost * 3 + fee;
            const cost6 = unitCost * 6 + fee;
            const currentTag = stock?.retailPrice ?? spec.recommendedPrice;
            const unitMargin = currentTag - unitCost;

            return (
              <div
                key={spec.id}
                className={`relative rounded-xl border p-2.5 flex flex-col gap-2 min-h-0 overflow-hidden ${
                  unlocked
                    ? 'border-white/10 bg-[#151D28]'
                    : 'border-white/5 bg-[#121821]/85'
                }`}
              >
                {/* Top Header: Title + Category + Stock/Level */}
                <div className="shrink-0 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold text-slate-100 truncate">
                      {loc.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {loc.category}
                    </div>
                  </div>
                  {unlocked ? (
                    <span className="font-mono text-[10px] font-extrabold rounded px-1.5 py-0.5 bg-emerald-500/15 text-emerald-300 shrink-0 tabular-nums">
                      {bi('Stok', 'Qty')}: {stock?.quantity ?? 0}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 font-mono text-[10px] font-extrabold rounded px-1.5 py-0.5 bg-amber-500/15 text-amber-300 shrink-0">
                      <Lock className="w-2.5 h-2.5" />
                      {bi(`Sv.${spec.minLevel}`, `Lv.${spec.minLevel}`)}
                    </span>
                  )}
                </div>

                {/* Center Product Art Showcase Stage — fills the middle cleanly! */}
                <div className="flex-1 min-h-0 rounded-xl border border-white/8 bg-[#0D131C] px-3 py-1.5 flex items-center justify-center gap-3 overflow-hidden">
                  <AccessoryProductArt
                    id={spec.id}
                    className={`h-full max-h-16 lg:max-h-20 w-auto shrink-0 drop-shadow-[0_6px_14px_rgba(0,0,0,0.55)] ${
                      !unlocked ? 'opacity-45' : ''
                    }`}
                  />

                  {unlocked ? (
                    <div className="min-w-0 space-y-1 text-[10.5px] tabular-nums">
                      <div className="text-slate-400">
                        {bi('Toptan Alış', 'Wholesale')}:{' '}
                        <strong className="font-mono text-slate-100">
                          {formatTRY(unitCost)}
                        </strong>
                      </div>
                      <div className="text-slate-400">
                        {bi('Birim Kâr', 'Unit Profit')}:{' '}
                        <strong className="font-mono text-emerald-400">
                          +{formatTRY(unitMargin)}
                        </strong>
                      </div>
                      <div className="text-[9.5px] text-slate-500">
                        {bi('Önerilen', 'MSRP')}: {formatTRY(spec.recommendedPrice)}
                      </div>
                    </div>
                  ) : (
                    <div className="min-w-0 text-left space-y-0.5">
                      <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-200">
                        <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        {bi(
                          `Seviye ${spec.minLevel} ile Açılır`,
                          `Unlocks at Level ${spec.minLevel}`
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {bi(
                          `Şu an Sv. ${shop.level} · Al-sat ile XP kazan`,
                          `Currently Lv. ${shop.level} · Earn XP trading`
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Controls */}
                {unlocked ? (
                  <div className="shrink-0 space-y-1.5 tabular-nums">
                    <div className="flex items-center justify-between gap-1 rounded-lg bg-[#0E141D] border border-white/8 px-2 py-1">
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {bi('Reyon Etiketi', 'Shelf Tag')}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateAccessoryPrice(
                              spec.id,
                              Math.max(spec.minPrice, currentTag - 25)
                            )
                          }
                          className="w-5 h-5 rounded bg-white/8 hover:bg-white/15 flex items-center justify-center text-slate-200 cursor-pointer"
                          aria-label={bi('Fiyatı düşür', 'Lower price')}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-[11px] font-extrabold text-amber-300 min-w-[54px] text-center">
                          {formatTRY(currentTag)}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateAccessoryPrice(
                              spec.id,
                              Math.min(spec.maxPrice, currentTag + 25)
                            )
                          }
                          className="w-5 h-5 rounded bg-white/8 hover:bg-white/15 flex items-center justify-center text-slate-200 cursor-pointer"
                          aria-label={bi('Fiyatı artır', 'Raise price')}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        disabled={shop.cash < cost3}
                        onClick={() =>
                          onBuyAccessoryStock(spec.id, 3, expressDelivery)
                        }
                        className="rounded-lg bg-amber-500/15 border border-amber-400/35 py-1 text-[10.5px] font-bold text-amber-200 hover:bg-amber-500/25 disabled:opacity-35 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        +3 ({formatTRY(cost3)})
                      </button>
                      <button
                        type="button"
                        disabled={shop.cash < cost6}
                        onClick={() =>
                          onBuyAccessoryStock(spec.id, 6, expressDelivery)
                        }
                        className="rounded-lg bg-amber-500 py-1 text-[10.5px] font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-35 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        +6 ({formatTRY(cost6)})
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="shrink-0 rounded-lg bg-white/5 border border-white/6 py-1.5 text-center text-[10px] font-semibold text-slate-400">
                    {bi(
                      `Kilitli Ürün · Alış ${formatTRY(unitCost)}`,
                      `Locked Item · Wholesale ${formatTRY(unitCost)}`
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: FACTORY-SEALED BRAND DISTRIBUTORS WITH LARGE BOX + PHONE MODEL VISUALS */}
      {subTab === 'BRAND_NEW' && (
        <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
          {flashActive && flashDeal && (
            <div className="shrink-0 flex items-center justify-between gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 px-2.5 py-1 text-[11px]">
              <div className="flex items-center gap-1.5 min-w-0">
                <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="font-bold text-rose-200 truncate">
                  {bi(
                    `FLAŞ İNDİRİM: ${flashDeal.brand} -%${flashDeal.discountPct}`,
                    `FLASH SALE: ${flashDeal.brand} -${flashDeal.discountPct}%`
                  )}
                </span>
                <span className="font-mono text-[10px] text-amber-300 shrink-0">
                  ({bi('Kalan', 'Left')}: {flashDeal.remainingStock})
                </span>
              </div>
              <span className="text-[10px] text-rose-200/80 whitespace-nowrap shrink-0">
                {bi('Rakipler kapmadan al!', 'Snatch before rivals!')}
              </span>
            </div>
          )}

          {/* Distributor Selector Tabs */}
          <div className="shrink-0 grid grid-cols-4 gap-1.5">
            {BRAND_DISTRIBUTORS.map((d) => {
              const loc = getLocalizedDistributor(d.id, lang);
              const unlocked = isDistributorUnlocked(
                d.id,
                shop.level,
                shop.reputation
              );
              const selected = d.id === activeDist.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    setSelectedDistId(d.id);
                    setModelPage(0);
                  }}
                  className={`rounded-lg border px-2 py-1.5 text-left transition-colors cursor-pointer min-w-0 ${
                    selected
                      ? 'border-amber-400 bg-amber-500/15 text-amber-200'
                      : 'border-white/10 bg-[#151D28] text-slate-300 hover:bg-[#1B2533]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10.5px] font-bold truncate">
                      {d.brands.join(' & ')}
                    </span>
                    {!unlocked && (
                      <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                    )}
                  </div>
                  <div className="text-[9.5px] text-slate-400 truncate mt-0.5">
                    {unlocked
                      ? bi('Bayilik Açık', 'Authorized')
                      : loc.tagline}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Distributor Models Grid */}
          {!distUnlocked ? (
            <div className="flex-1 min-h-0 rounded-xl border border-dashed border-amber-400/25 bg-[#151D28] flex flex-col items-center justify-center text-center p-4">
              <Lock className="w-8 h-8 text-amber-400 mb-2" />
              <div className="text-sm font-bold text-slate-100">
                {activeDistLoc.name}
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                {activeDistLoc.description}
              </p>
              <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-1 font-mono text-xs font-bold text-amber-300">
                {bi(
                  `Gereken: Seviye ${activeDist.minLevel} · ${activeDist.minReputation.toFixed(1)}★ İtibar`,
                  `Requires: Level ${activeDist.minLevel} · ${activeDist.minReputation.toFixed(1)}★ Rep`
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col gap-1.5 overflow-hidden">
              <div className="flex-1 min-h-0 grid grid-cols-2 sm:grid-cols-4 gap-2 overflow-hidden">
                {visibleModels.map((spec) => {
                  const baseWholesale = getDistributorWholesalePrice(
                    spec,
                    shop.level,
                    shop.dailyWholesaleDiscountBrand,
                    shop.legacyPath
                  );
                  const isFlashBrand =
                    flashActive && flashDeal?.brand === spec.brand;
                  const finalWholesale = isFlashBrand
                    ? Math.round(
                        (baseWholesale *
                          (1 - (flashDeal?.discountPct ?? 0) / 100)) /
                          50
                      ) * 50
                    : baseWholesale;
                  const deliveryFee = expressDelivery ? EXPRESS_PHONE_FEE : 0;
                  const totalPay = finalWholesale + deliveryFee;
                  const estRetail = estimateBrandNewRetailValue(
                    spec,
                    shop.dailyNews
                  );
                  const estTax = calculateSaleTax(
                    estRetail,
                    shop.staff,
                    shop.staffLevels
                  );
                  const estProfit = estRetail - estTax.taxAmount - totalPay;

                  return (
                    <div
                      key={spec.id}
                      className={`rounded-xl border p-2.5 flex flex-col gap-2 min-h-0 overflow-hidden ${
                        isFlashBrand
                          ? 'border-rose-400/50 bg-[#1B1722]'
                          : 'border-white/10 bg-[#151D28]'
                      }`}
                    >
                      {/* Model Title Header */}
                      <div className="shrink-0 flex items-start justify-between gap-1">
                        <div className="min-w-0">
                          <div className="text-xs font-extrabold text-slate-100 truncate">
                            {spec.brand} {spec.model}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {spec.storage} · {bi('Sıfır Kutu', 'Sealed Box')}
                          </div>
                        </div>
                        {isFlashBrand && (
                          <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-extrabold text-rose-300 shrink-0">
                            -%{flashDeal?.discountPct}
                          </span>
                        )}
                      </div>

                      {/* HERO DUAL VISUAL STAGE: SEALED BOX + ACTUAL PHONE MODEL */}
                      <div className="flex-1 min-h-0 rounded-xl border border-white/8 bg-[#0D131C] p-2 flex items-center justify-center gap-3 overflow-hidden">
                        <PhoneBoxArt
                          spec={spec}
                          className="h-full max-h-28 w-auto"
                        />
                        <PhoneModelThumb
                          spec={spec}
                          showBack
                          className="h-full max-h-28 w-auto"
                        />
                      </div>

                      {/* Pricing Breakdown */}
                      <div className="shrink-0 space-y-0.5 rounded-lg bg-[#0E141D] border border-white/8 p-1.5 text-[10px] tabular-nums">
                        <div className="flex justify-between">
                          <span className="text-slate-400">
                            {bi('Bayi Alış', 'Wholesale')}
                          </span>
                          <span className="font-mono font-bold text-slate-100">
                            {formatTRY(totalPay)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">
                            {bi('Vitrin Satış', 'Est. Retail')}
                          </span>
                          <span className="font-mono text-amber-300">
                            {formatTRY(estRetail)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-white/8 pt-0.5">
                          <span className="text-slate-400">
                            {bi('Tahmini Net', 'Est. Net')}
                          </span>
                          <span
                            className={`font-mono font-extrabold ${
                              estProfit >= 0
                                ? 'text-emerald-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {estProfit >= 0 ? '+' : ''}
                            {formatTRY(estProfit)}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={shop.cash < totalPay}
                        onClick={() =>
                          onOrderBrandNewPhone(
                            spec,
                            finalWholesale,
                            expressDelivery
                          )
                        }
                        className="shrink-0 w-full rounded-lg bg-amber-500 py-1.5 text-[11px] font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-35 transition-colors cursor-pointer whitespace-nowrap tabular-nums"
                      >
                        {expressDelivery
                          ? bi(`Hemen Al · ${formatTRY(totalPay)}`, `Buy Now · ${formatTRY(totalPay)}`)
                          : bi(`Sipariş Ver · ${formatTRY(totalPay)}`, `Order · ${formatTRY(totalPay)}`)}
                      </button>
                    </div>
                  );
                })}
              </div>

              {totalModelPages > 1 && (
                <div className="shrink-0 flex items-center justify-center gap-2 text-[11px]">
                  <button
                    type="button"
                    disabled={safeModelPage === 0}
                    onClick={() => setModelPage((p) => Math.max(0, p - 1))}
                    className="inline-flex items-center gap-0.5 rounded-md border border-white/10 bg-[#151D28] px-2 py-0.5 text-slate-200 disabled:opacity-35 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    {bi('Önceki', 'Prev')}
                  </button>
                  <span className="font-mono text-slate-400">
                    {safeModelPage + 1} / {totalModelPages}
                  </span>
                  <button
                    type="button"
                    disabled={safeModelPage >= totalModelPages - 1}
                    onClick={() =>
                      setModelPage((p) => Math.min(totalModelPages - 1, p + 1))
                    }
                    className="inline-flex items-center gap-0.5 rounded-md border border-white/10 bg-[#151D28] px-2 py-0.5 text-slate-200 disabled:opacity-35 cursor-pointer"
                  >
                    {bi('Sonraki', 'Next')}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: IN-TRANSIT CARGO ORDERS */}
      {subTab === 'CARGO' && (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {pendingOrders.length === 0 ? (
            <div className="flex-1 rounded-xl border border-dashed border-white/10 bg-[#151D28] flex flex-col items-center justify-center text-center p-4">
              <Package className="w-8 h-8 text-slate-500 mb-2" />
              <div className="text-xs font-bold text-slate-200">
                {bi('Yolda bekleyen toptancı kargon yok', 'No wholesale shipments in transit')}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {bi(
                  'Standart kargo ile verilen siparişler ertesi sabah dükkanına teslim edilir.',
                  'Standard wholesale orders arrive at your shop the next morning.'
                )}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {pendingOrders.slice(0, 6).map((ord) => (
                <div
                  key={ord.id}
                  className="rounded-xl border border-sky-400/25 bg-[#151D28] p-2.5 flex flex-col justify-between gap-1.5"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-100 truncate">
                      {ord.label}
                    </span>
                    <span className="font-mono text-[10px] font-bold rounded bg-sky-500/20 px-1.5 py-0.5 text-sky-300 whitespace-nowrap">
                      {ord.daysRemaining} {bi('gün', 'd')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10.5px] text-slate-400 tabular-nums">
                    <span>
                      {ord.kind === 'ACCESSORY'
                        ? bi('Aksesuar Kolisi', 'Accessory Box')
                        : bi('Sıfır Telefon', 'Sealed Phone')}
                    </span>
                    <span className="font-mono text-amber-300">
                      {formatTRY(ord.wholesaleCost)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
