import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  Flame,
  Lock,
  Package,
  ShoppingBag,
  Sparkles,
  Tag,
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
  isDistributorUnlocked,
} from '../game/engine';
import {
  AccessoryId,
  AccessoryShelfGroup,
  PhoneModelSpec,
  ShopState,
} from '../game/types';
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

type WholesaleSubTab = 'BRAND_NEW' | 'ACCESSORIES';

const ACCESSORY_SHELVES: {
  group: AccessoryShelfGroup;
  title: string;
  subtitle: string;
}[] = [
  {
    group: 'audio',
    title: 'Kulaklık & Ses Reyonu',
    subtitle: 'Yüksek marjlı kablosuz kulaklık modelleri',
  },
  {
    group: 'power',
    title: 'Powerbank & Hızlı Şarj Reyonu',
    subtitle: 'Her gün sorulan GaN adaptörler ve taşınabilir güç',
  },
  {
    group: 'protection',
    title: 'Kılıf, Kırılmaz Cam & Araç Tutucu Reyonu',
    subtitle: 'En hızlı dönen kasa dostu koruma ürünleri',
  },
];

export const EXPRESS_ACCESSORY_FEE = 250;
export const EXPRESS_PHONE_FEE = 500;

export const WholesaleView: React.FC<WholesaleViewProps> = ({
  shop,
  onBuyAccessoryStock,
  onUpdateAccessoryPrice,
  onOrderBrandNewPhone,
  onBackToCounter,
}) => {
  const [subTab, setSubTab] = useState<WholesaleSubTab>(
    shop.flashWholesaleDeal && !shop.flashWholesaleDeal.expired
      ? 'BRAND_NEW'
      : 'ACCESSORIES'
  );
  const [expressDelivery, setExpressDelivery] = useState(false);

  const totalAccStock = getTotalAccessoryStock(shop.accessories);
  const flashDeal = shop.flashWholesaleDeal;
  const flashSoldOut = flashDeal
    ? flashDeal.expired || flashDeal.remainingStock <= 0
    : false;
  const flashPctLeft =
    flashDeal && flashDeal.initialStock > 0
      ? Math.round((flashDeal.remainingStock / flashDeal.initialStock) * 100)
      : 0;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto pasaj-scroll p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-0.5">
              <Building2 className="w-4 h-4" />
              <span>TAHTAKALE TOPTANCI & RESMİ MARKA DEPOSU</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-50">
              Model Bazlı Tedarik & Kargo Merkezi
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Standart kargo siparişleri ertesi sabah kapına iner; acil stok için Ekspres Kurye seçebilirsin!
            </p>
          </div>

          <div className="flex items-center gap-4 tabular-nums">
            <div className="text-right">
              <div className="text-[11px] text-slate-400">Reyon Stoğu</div>
              <div className="font-mono text-base font-bold text-slate-100">
                {totalAccStock} adet
              </div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-right">
              <div className="text-[11px] text-slate-400">Mevcut Kasa</div>
              <div className="font-mono text-base font-bold text-emerald-400">
                {formatTRY(shop.cash)}
              </div>
            </div>
            <button
              type="button"
              onClick={onBackToCounter}
              className="rounded-xl border border-white/12 bg-[#202B3A] px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-[#2A374A] transition-colors cursor-pointer whitespace-nowrap"
            >
              Tezgaha Dön
            </button>
          </div>
        </div>

        {/* LIVE FLASH WHOLESALE RIVAL RACE BANNER */}
        {flashDeal && (
          <div
            className={`mb-5 rounded-2xl border p-4 ${
              flashSoldOut
                ? 'border-rose-500/35 bg-rose-950/25'
                : 'border-amber-400/50 bg-gradient-to-r from-amber-500/15 via-[#1C2330] to-emerald-500/10'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-300 mb-0.5">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span>
                    {flashSoldOut
                      ? 'RAKİPLER TÜKETTİ — YETİŞEMEDİN!'
                      : `GAZETE FLAŞ TOPTAN KAMPANYASI · ${flashDeal.brand.toUpperCase()} -%${flashDeal.discountPct}`}
                  </span>
                </div>
                <div className="font-display text-base sm:text-lg font-bold text-slate-50">
                  {flashDeal.headline}
                </div>
                <p className="text-xs text-slate-300 mt-0.5">{flashDeal.subline}</p>
              </div>

              <div className="md:w-64 shrink-0 space-y-1.5 tabular-nums">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className={flashSoldOut ? 'text-rose-400' : 'text-emerald-400'}>
                    {flashSoldOut
                      ? 'Stok Bitti (0 Adet)'
                      : `Kalan Kota: ${flashDeal.remainingStock} / ${flashDeal.initialStock}`}
                  </span>
                  <span className="text-rose-300 text-[11px]">
                    Rakipler {flashDeal.rivalsSnatchedCount} kaptı!
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      flashSoldOut
                        ? 'bg-rose-500'
                        : flashPctLeft <= 35
                        ? 'bg-orange-400'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${flashPctLeft}%` }}
                  />
                </div>
                {!flashSoldOut && subTab !== 'BRAND_NEW' && (
                  <button
                    type="button"
                    onClick={() => setSubTab('BRAND_NEW')}
                    className="w-full rounded-lg bg-amber-500 py-1.5 text-xs font-extrabold text-slate-950 hover:bg-amber-400 cursor-pointer"
                  >
                    Hemen {flashDeal.brand} Deposuna Git →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* IN-TRANSIT CARGO TRACKER */}
        {shop.pendingWholesaleOrders.length > 0 && (
          <div className="mb-5 rounded-2xl border border-sky-500/30 bg-[#132030] p-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="inline-flex items-center gap-2 text-xs font-bold text-sky-300">
                <Truck className="w-4 h-4" />
                <span>
                  Yoldaki Toptancı Kargoların ({shop.pendingWholesaleOrders.length})
                </span>
              </span>
              <span className="text-[11px] text-slate-400">
                Yeni gün başlayınca otomatik stoğa iner
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {shop.pendingWholesaleOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="rounded-xl border border-white/10 bg-[#0F1722] px-3 py-2 flex items-center justify-between gap-2 text-xs tabular-nums"
                >
                  <div className="truncate font-semibold text-slate-100">
                    {ord.label}
                  </div>
                  <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-300 shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    {ord.daysRemaining} Gün
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sub-Tabs + Delivery Mode Switch */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSubTab('ACCESSORIES')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                subTab === 'ACCESSORIES'
                  ? 'bg-amber-500 text-slate-950'
                  : 'border border-white/10 bg-[#17202C] text-slate-300 hover:text-slate-50'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Kulaklık, Powerbank & Kılıf Rafları</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab('BRAND_NEW')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                subTab === 'BRAND_NEW'
                  ? 'bg-amber-500 text-slate-950'
                  : 'border border-white/10 bg-[#17202C] text-slate-300 hover:text-slate-50'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Sıfır Telefon Modelleri (Bayi)</span>
              {flashDeal && !flashSoldOut && (
                <span className="font-mono text-[10px] font-extrabold rounded px-1.5 py-0.5 bg-rose-500 text-white">
                  {flashDeal.brand} -%{flashDeal.discountPct} ({flashDeal.remainingStock})
                </span>
              )}
            </button>
          </div>

          {/* Standard Cargo vs Express Same-Day Delivery Toggle */}
          <div className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-[#131A24] p-1 text-xs">
            <button
              type="button"
              onClick={() => setExpressDelivery(false)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold cursor-pointer transition-colors ${
                !expressDelivery
                  ? 'bg-sky-500 text-slate-950'
                  : 'text-slate-300 hover:text-slate-50'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Standart Kargo (1 Gün · Ücretsiz)</span>
            </button>
            <button
              type="button"
              onClick={() => setExpressDelivery(true)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold cursor-pointer transition-colors ${
                expressDelivery
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-300 hover:text-slate-50'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>
                Ekspres Kurye (Anında · +
                {formatTRY(
                  subTab === 'ACCESSORIES'
                    ? EXPRESS_ACCESSORY_FEE
                    : EXPRESS_PHONE_FEE
                )}
                )
              </span>
            </button>
          </div>
        </div>

        {/* TAB 1: ACCESSORY PRODUCT SHELVES */}
        {subTab === 'ACCESSORIES' && (
          <div className="space-y-6">
            {shop.legacyPath === 'BORN_MERCHANT' && (
              <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-100">
                <strong>Doğuştan Tüccar Mirası Aktif:</strong> Tahtakale ağın sayesinde tüm aksesuar toptan alışların <strong>%10 daha ucuz</strong>!
              </div>
            )}

            {ACCESSORY_SHELVES.map((shelf) => {
              const items = ACCESSORY_CATALOG.filter(
                (item) => item.shelfGroup === shelf.group
              );
              return (
                <section key={shelf.group} className="space-y-3">
                  <div className="flex items-end justify-between border-b border-white/10 pb-2">
                    <div>
                      <h2 className="font-display text-lg font-bold text-slate-100">
                        {shelf.title}
                      </h2>
                      <p className="text-xs text-slate-400">{shelf.subtitle}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((spec) => {
                      const stock = shop.accessories[spec.id];
                      const wholesaleUnit = getAccessoryWholesaleCost(
                        spec.id,
                        shop.legacyPath
                      );
                      const unitProfit = stock.retailPrice - wholesaleUnit;
                      const priceRatio = stock.retailPrice / spec.recommendedPrice;
                      const speedLabel =
                        priceRatio <= 0.92
                          ? { text: 'Çok Hızlı Sürüm', cls: 'text-emerald-400' }
                          : priceRatio <= 1.08
                          ? { text: 'Dengeli Kâr', cls: 'text-amber-300' }
                          : { text: 'Yüksek Etiket (Yavaş)', cls: 'text-rose-400' };

                      const deliveryExtra = expressDelivery ? EXPRESS_ACCESSORY_FEE : 0;
                      const order1Cost = wholesaleUnit + deliveryExtra;
                      const order5Cost = wholesaleUnit * 5 + deliveryExtra;

                      return (
                        <article
                          key={spec.id}
                          className="rounded-2xl border border-white/10 bg-[#161F2B] p-4 flex flex-col justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-[#101722] shrink-0">
                                  <AccessoryProductArt
                                    id={spec.id}
                                    className="w-12 h-12"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[11px] text-slate-400">
                                    {spec.category}
                                  </div>
                                  <h3 className="font-display text-sm font-bold text-slate-50 leading-snug">
                                    {spec.name}
                                  </h3>
                                </div>
                              </div>

                              <div className="text-right tabular-nums shrink-0">
                                <div className="text-[10px] text-slate-500">Rafta</div>
                                <div
                                  className={`font-mono text-base font-extrabold ${
                                    stock.quantity > 0
                                      ? 'text-emerald-400'
                                      : 'text-rose-400'
                                  }`}
                                >
                                  {stock.quantity} ad.
                                </div>
                              </div>
                            </div>

                            <p className="text-xs text-slate-400 leading-relaxed mb-3">
                              {spec.description}
                            </p>

                            <div className="rounded-xl border border-white/8 bg-[#111720] p-3 space-y-2 tabular-nums">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400 inline-flex items-center gap-1">
                                  <Tag className="w-3 h-3" />
                                  <span>Raf Satış Fiyatın</span>
                                </span>
                                <span className="font-mono font-bold text-amber-400">
                                  {formatTRY(stock.retailPrice)}
                                </span>
                              </div>

                              <input
                                type="range"
                                min={spec.minPrice}
                                max={spec.maxPrice}
                                step={10}
                                value={stock.retailPrice}
                                onChange={(e) =>
                                  onUpdateAccessoryPrice(
                                    spec.id,
                                    Number(e.target.value)
                                  )
                                }
                                aria-label={`${spec.name} satış fiyatı`}
                                className="pasaj-slider w-full"
                              />

                              <div className="flex items-center justify-between text-[11px]">
                                <span className={`font-semibold ${speedLabel.cls}`}>
                                  {speedLabel.text}
                                </span>
                                <span className="font-mono text-emerald-400 font-semibold">
                                  +{formatTRY(unitProfit)} brüt / ad.
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5 pt-1 tabular-nums">
                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                              <span>
                                Toptan: {formatTRY(wholesaleUnit)}
                                {expressDelivery && (
                                  <span className="text-amber-300 ml-1">
                                    (+{formatTRY(EXPRESS_ACCESSORY_FEE)} kurye)
                                  </span>
                                )}
                              </span>
                              <span>Satılan: {stock.totalSold} ad.</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                disabled={shop.cash < order1Cost}
                                onClick={() =>
                                  onBuyAccessoryStock(spec.id, 1, expressDelivery)
                                }
                                className="rounded-xl border border-white/12 bg-[#1F2A39] py-2 text-xs font-semibold text-slate-100 hover:bg-[#29374B] disabled:opacity-40 cursor-pointer whitespace-nowrap"
                              >
                                +1 {expressDelivery ? 'Anında' : 'Sipariş'} ({formatTRY(order1Cost)})
                              </button>
                              <button
                                type="button"
                                disabled={shop.cash < order5Cost}
                                onClick={() =>
                                  onBuyAccessoryStock(spec.id, 5, expressDelivery)
                                }
                                className="rounded-xl bg-amber-500 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-40 cursor-pointer whitespace-nowrap"
                              >
                                +5 Koli ({formatTRY(order5Cost)})
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* TAB 2: OFFICIAL BRAND-NEW SEALED PHONE MODELS */}
        {subTab === 'BRAND_NEW' && (
          <div className="space-y-6">
            {shop.dailyWholesaleDiscountBrand && (
              <div className="rounded-xl border border-amber-400/35 bg-amber-500/10 px-4 py-3 text-xs text-amber-100 flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>Günün Bayi Kampanyası:</strong> Bugün{' '}
                    <strong className="text-amber-300">
                      {shop.dailyWholesaleDiscountBrand}
                    </strong>{' '}
                    markasında ek bayi iskontosu aktif!
                  </span>
                </span>
                <span className="font-mono text-amber-300 font-semibold tabular-nums">
                  Toplam Sıfır Satış: {shop.totalBrandNewSold} cihaz
                </span>
              </div>
            )}

            {BRAND_DISTRIBUTORS.map((dist) => {
              const unlocked = isDistributorUnlocked(
                dist.id,
                shop.level,
                shop.reputation
              );
              const models = PHONE_CATALOG.filter(
                (m) => dist.brands.includes(m.brand) && m.releaseDay <= shop.day
              );
              const upcomingCount = PHONE_CATALOG.filter(
                (m) => dist.brands.includes(m.brand) && m.releaseDay > shop.day
              ).length;

              return (
                <section
                  key={dist.id}
                  className={`rounded-2xl border p-5 ${
                    unlocked
                      ? 'border-white/12 bg-[#161F2B]'
                      : 'border-white/8 bg-[#121822] opacity-85'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold mb-0.5">
                        {unlocked ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Yetkili Bayilik Açık</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-400">
                            <Lock className="w-3.5 h-3.5" />
                            <span>
                              Kilitli · Sv. {dist.minLevel} ve{' '}
                              {dist.minReputation.toFixed(1)}★ İtibar Gerekir
                            </span>
                          </span>
                        )}
                        <span aria-hidden="true" className="text-white/25">
                          ·
                        </span>
                        <span className="text-slate-400">
                          {dist.brands.join(', ')}
                        </span>
                      </div>
                      <h2 className="font-display text-lg font-bold text-slate-50">
                        {dist.name}
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
                        {dist.description}
                      </p>
                    </div>

                    {upcomingCount > 0 && (
                      <span className="text-[11px] text-slate-400 whitespace-nowrap">
                        +{upcomingCount} yeni model gelecek lansmanlarda açılacak
                      </span>
                    )}
                  </div>

                  {unlocked ? (
                    models.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {models.map((spec) => {
                          const loyaltyUnits =
                            shop.distributorLoyalty?.[dist.id] ?? 0;
                          const isFlashMatch =
                            flashDeal &&
                            !flashSoldOut &&
                            flashDeal.brand === spec.brand;
                          const wholesaleCost = getDistributorWholesalePrice(
                            spec,
                            shop.level,
                            shop.dailyWholesaleDiscountBrand,
                            shop.legacyPath,
                            loyaltyUnits,
                            flashDeal
                          );
                          const totalOrderCost =
                            wholesaleCost +
                            (expressDelivery ? EXPRESS_PHONE_FEE : 0);
                          const retailEstimate = estimateBrandNewRetailValue(
                            spec,
                            shop.dailyNews
                          );
                          const { taxAmount: estSaleTax } = calculateSaleTax(
                            retailEstimate,
                            shop.staff,
                            shop.staffLevels
                          );
                          const estNetProfit =
                            retailEstimate - estSaleTax - totalOrderCost;
                          const canAfford = shop.cash >= totalOrderCost;

                          return (
                            <div
                              key={spec.id}
                              className={`rounded-xl border p-3 flex flex-col justify-between gap-2.5 ${
                                isFlashMatch
                                  ? 'border-amber-400/55 bg-[#18212E]'
                                  : 'border-white/10 bg-[#121822]'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <PhoneBoxArt
                                    spec={spec}
                                    className="w-11 h-13 shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <div className="font-display text-sm font-bold text-slate-100 truncate">
                                      {spec.brand} {spec.model}
                                    </div>
                                    <div className="text-[11px] text-emerald-400 font-medium">
                                      Kapalı Kutu · {spec.storage} · 24 Ay TR
                                    </div>
                                    {isFlashMatch && (
                                      <div className="text-[10px] font-extrabold text-amber-300 mt-0.5">
                                        FLAŞ -%{flashDeal.discountPct} · Kalan{' '}
                                        {flashDeal.remainingStock} adet!
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-1 text-xs tabular-nums border-t border-white/8 pt-2">
                                <div className="flex justify-between">
                                  <span className="text-slate-400">
                                    {expressDelivery ? 'Bayi + Ekspres Maliyet' : 'Bayi Alış Fiyatı'}
                                  </span>
                                  <span className="font-mono font-bold text-slate-100">
                                    {formatTRY(totalOrderCost)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Sıfır Piyasa Değeri</span>
                                  <span className="font-mono font-semibold text-amber-300">
                                    {formatTRY(retailEstimate)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Tahmini Net Kâr (Vergi Sonrası)</span>
                                  <span
                                    className={`font-mono font-bold ${
                                      estNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                    }`}
                                  >
                                    {estNetProfit >= 0 ? '+' : ''}
                                    {formatTRY(estNetProfit)}
                                  </span>
                                </div>
                              </div>

                              <button
                                type="button"
                                disabled={!canAfford}
                                onClick={() =>
                                  onOrderBrandNewPhone(
                                    spec,
                                    wholesaleCost,
                                    expressDelivery
                                  )
                                }
                                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-emerald-400 disabled:opacity-40 cursor-pointer whitespace-nowrap tabular-nums"
                              >
                                {expressDelivery ? (
                                  <Zap className="w-3.5 h-3.5" />
                                ) : (
                                  <Truck className="w-3.5 h-3.5" />
                                )}
                                <span>
                                  {expressDelivery
                                    ? `Ekspres Getir (${formatTRY(totalOrderCost)})`
                                    : `Sipariş Ver · 1 Gün (${formatTRY(totalOrderCost)})`}
                                </span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-white/8 bg-[#121822] px-4 py-3 text-xs text-slate-400">
                        Bu distribütörün modelleri ilerleyen günlerdeki lansmanlarla (Gün 6+) stoklara girecek.
                      </div>
                    )
                  ) : (
                    <div className="rounded-xl border border-white/8 bg-[#0F151E] px-4 py-3 text-xs text-slate-400 tabular-nums">
                      Mevcut Durumun:{' '}
                      <strong className="text-slate-200">Sv. {shop.level}</strong> /{' '}
                      {dist.minLevel} ·{' '}
                      <strong className="text-slate-200">
                        {shop.reputation.toFixed(1)}★
                      </strong>{' '}
                      / {dist.minReputation.toFixed(1)}★
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
