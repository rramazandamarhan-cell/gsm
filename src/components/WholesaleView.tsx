import React, { useState } from 'react';
import {
  BatteryCharging,
  Building2,
  Car,
  CheckCircle2,
  Headphones,
  Lock,
  Package,
  Shield,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Tag,
  Zap,
} from 'lucide-react';
import {
  ACCESSORY_CATALOG,
  BRAND_DISTRIBUTORS,
  PHONE_CATALOG,
} from '../game/catalog';
import {
  calculateMarketValue,
  formatTRY,
  generateBrandNewPhone,
  getAccessoryWholesaleCost,
  getDistributorWholesalePrice,
  getTotalAccessoryStock,
  isDistributorUnlocked,
} from '../game/engine';
import { AccessoryId, PhoneModelSpec, ShopState } from '../game/types';

interface WholesaleViewProps {
  shop: ShopState;
  onBuyAccessoryStock: (accessoryId: AccessoryId, quantity: number) => void;
  onUpdateAccessoryPrice: (accessoryId: AccessoryId, newPrice: number) => void;
  onOrderBrandNewPhone: (spec: PhoneModelSpec, wholesaleCost: number) => void;
  onBackToCounter: () => void;
}

type WholesaleSubTab = 'ACCESSORIES' | 'BRAND_NEW';

function renderAccessoryIcon(id: AccessoryId) {
  switch (id) {
    case 'tempered_glass':
      return <Shield className="w-5 h-5 text-sky-400" />;
    case 'magsafe_case':
      return <Smartphone className="w-5 h-5 text-amber-400" />;
    case 'gan_charger':
      return <Zap className="w-5 h-5 text-emerald-400" />;
    case 'car_mount':
      return <Car className="w-5 h-5 text-orange-400" />;
    case 'powerbank':
      return <BatteryCharging className="w-5 h-5 text-lime-400" />;
    case 'tws_earbuds':
      return <Headphones className="w-5 h-5 text-indigo-400" />;
  }
}

export const WholesaleView: React.FC<WholesaleViewProps> = ({
  shop,
  onBuyAccessoryStock,
  onUpdateAccessoryPrice,
  onOrderBrandNewPhone,
  onBackToCounter,
}) => {
  const [subTab, setSubTab] = useState<WholesaleSubTab>('ACCESSORIES');
  const totalAccStock = getTotalAccessoryStock(shop.accessories);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto pasaj-scroll p-6">
      <div className="max-w-6xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-0.5">
              <Building2 className="w-4 h-4" />
              <span>TAHTAKALE TOPTANCI & RESMİ MARKA BAYİLİĞİ</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-50">
              Aksesuar Reyonu & Sıfır Kutu Tedarik
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Kılıf, kırılmaz cam, hızlı şarj ve araç tutucu ile sıcak nakit akışı sağla; seviyen arttıkça markalardan sıfır kapalı kutu telefon çek.
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

        {/* Sub-Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
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
            <span>Aksesuar Reyonu (Kılıf, Şarj, Tutucu)</span>
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
            <span>Sıfır Kutu Marka Distribütörleri</span>
            {shop.dailyWholesaleDiscountBrand && (
              <span className="font-mono text-[10px] font-extrabold rounded px-1.5 py-0.5 bg-emerald-400 text-slate-950">
                {shop.dailyWholesaleDiscountBrand} -%6
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: ACCESSORY RETAIL SHELF */}
        {subTab === 'ACCESSORIES' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/8 px-4 py-3 text-xs text-emerald-100 leading-relaxed flex flex-wrap items-center justify-between gap-2">
              <span>
                <strong>Nasıl Satılır?</strong> Stoğundaki aksesuarlar hem <strong>tezgaha gelen aksesuar müşterilerine</strong>, hem <strong>telefon alan müşterilere çapraz satışla</strong>, hem de <strong>gün boyunca pasif reyon trafiğiyle</strong> otomatik satılır!
              </span>
              <span className="font-mono font-bold text-emerald-300 tabular-nums whitespace-nowrap">
                Toplam Aksesuar Satışı: {shop.totalAccessoriesSold} adet
              </span>
            </div>

            {shop.legacyPath === 'BORN_MERCHANT' && (
              <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-100">
                <strong>Doğuştan Tüccar Mirası Aktif:</strong> Tahtakale ağın sayesinde tüm aksesuar toptan alışların <strong>%10 daha ucuz</strong>!
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ACCESSORY_CATALOG.map((spec) => {
                const stock = shop.accessories[spec.id];
                const wholesaleUnit = getAccessoryWholesaleCost(spec.id, shop.legacyPath);
                const unitProfit = stock.retailPrice - wholesaleUnit;
                const priceRatio = stock.retailPrice / spec.recommendedPrice;
                const speedLabel =
                  priceRatio <= 0.92
                    ? { text: 'Çok Hızlı Sürüm', cls: 'text-emerald-400' }
                    : priceRatio <= 1.08
                    ? { text: 'Dengeli Kâr', cls: 'text-amber-300' }
                    : { text: 'Yüksek Etiket (Yavaş)', cls: 'text-rose-400' };

                const pack5Cost = wholesaleUnit * 5;

                return (
                  <article
                    key={spec.id}
                    className="rounded-2xl border border-white/10 bg-[#161F2B] p-4 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#1E2938] shrink-0">
                            {renderAccessoryIcon(spec.id)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[11px] text-slate-400">
                              {spec.category}
                            </div>
                            <h3 className="font-display text-sm font-bold text-slate-50 truncate">
                              {spec.name}
                            </h3>
                          </div>
                        </div>

                        <div className="text-right tabular-nums shrink-0">
                          <div className="text-[10px] text-slate-500">Rafta</div>
                          <div
                            className={`font-mono text-base font-extrabold ${
                              stock.quantity > 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {stock.quantity} ad.
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed mb-3">
                        {spec.description}
                      </p>

                      {/* Retail Price Tuner */}
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
                            onUpdateAccessoryPrice(spec.id, Number(e.target.value))
                          }
                          aria-label={`${spec.name} satış fiyatı`}
                          className="pasaj-slider w-full"
                        />

                        <div className="flex items-center justify-between text-[11px]">
                          <span className={`font-semibold ${speedLabel.cls}`}>
                            {speedLabel.text}
                          </span>
                          <span className="font-mono text-emerald-400 font-semibold">
                            +{formatTRY(unitProfit)} net / adet
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order Buttons */}
                    <div className="space-y-1.5 pt-1 tabular-nums">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>
                          Toptan Geliş: {formatTRY(wholesaleUnit)}
                          {shop.legacyPath === 'BORN_MERCHANT' && (
                            <span className="text-emerald-400 ml-1">(-%10)</span>
                          )}
                        </span>
                        <span>Satılan: {stock.totalSold} ad.</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={shop.cash < wholesaleUnit}
                          onClick={() => onBuyAccessoryStock(spec.id, 1)}
                          className="rounded-xl border border-white/12 bg-[#1F2A39] py-2 text-xs font-semibold text-slate-100 hover:bg-[#29374B] disabled:opacity-40 cursor-pointer whitespace-nowrap"
                        >
                          +1 Al ({formatTRY(wholesaleUnit)})
                        </button>
                        <button
                          type="button"
                          disabled={shop.cash < pack5Cost}
                          onClick={() => onBuyAccessoryStock(spec.id, 5)}
                          className="rounded-xl bg-amber-500 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-40 cursor-pointer whitespace-nowrap"
                        >
                          +5 Koli ({formatTRY(pack5Cost)})
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: OFFICIAL BRAND-NEW SEALED PHONE DISTRIBUTORS */}
        {subTab === 'BRAND_NEW' && (
          <div className="space-y-6">
            {shop.dailyWholesaleDiscountBrand && (
              <div className="rounded-xl border border-amber-400/35 bg-amber-500/10 px-4 py-3 text-xs text-amber-100 flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>Günün Bayi Kampanyası:</strong> Bugün tüm{' '}
                    <strong className="text-amber-300">
                      {shop.dailyWholesaleDiscountBrand}
                    </strong>{' '}
                    sıfır kapalı kutu siparişlerinde ek <strong>%6 distribütör iskontosu</strong> aktif!
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
                              Kilitli · Sv. {dist.minLevel} ve {dist.minReputation.toFixed(1)}★ İtibar Gerekir
                            </span>
                          </span>
                        )}
                        <span aria-hidden="true" className="text-white/25">·</span>
                        <span className="text-slate-400">{dist.brands.join(', ')}</span>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {models.map((spec) => {
                          const loyaltyUnits = shop.distributorLoyalty?.[dist.id] ?? 0;
                          const wholesaleCost = getDistributorWholesalePrice(
                            spec,
                            shop.level,
                            shop.dailyWholesaleDiscountBrand,
                            shop.legacyPath,
                            loyaltyUnits
                          );
                          const sampleNew = generateBrandNewPhone(
                            spec,
                            wholesaleCost,
                            shop.dailyNews
                          );
                          const retailEstimate = calculateMarketValue(
                            sampleNew,
                            false,
                            shop.dailyNews
                          );
                          const estProfit = retailEstimate - wholesaleCost;
                          const hasCampaign =
                            shop.dailyWholesaleDiscountBrand === spec.brand;
                          const canAfford = shop.cash >= wholesaleCost;

                          return (
                            <div
                              key={spec.id}
                              className="rounded-xl border border-white/10 bg-[#121822] p-3.5 flex flex-col justify-between gap-3"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div
                                    className="h-11 w-8 rounded-lg border flex items-center justify-center shrink-0"
                                    style={{
                                      backgroundColor: spec.bodyColor,
                                      borderColor: '#34D399',
                                    }}
                                  >
                                    <Smartphone className="w-4 h-4 text-white/90" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-display text-sm font-bold text-slate-100 truncate">
                                      {spec.brand} {spec.model}
                                    </div>
                                    <div className="text-[11px] text-emerald-400 font-medium">
                                      Sıfır Kutu · {spec.storage} · 24 Ay TR
                                    </div>
                                  </div>
                                </div>
                                {hasCampaign && (
                                  <span className="font-mono text-[10px] font-bold text-amber-300 shrink-0">
                                    -%6
                                  </span>
                                )}
                              </div>

                              <div className="space-y-1 text-xs tabular-nums border-t border-white/8 pt-2.5">
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Bayi Alış Fiyatı</span>
                                  <span className="font-mono font-bold text-slate-100">
                                    {formatTRY(wholesaleCost)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Sıfır Piyasa Değeri</span>
                                  <span className="font-mono font-semibold text-amber-300">
                                    {formatTRY(retailEstimate)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Tahmini Kâr</span>
                                  <span className="font-mono font-bold text-emerald-400">
                                    +{formatTRY(estProfit)}
                                  </span>
                                </div>
                              </div>

                              <button
                                type="button"
                                disabled={!canAfford}
                                onClick={() => onOrderBrandNewPhone(spec, wholesaleCost)}
                                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-emerald-400 disabled:opacity-40 cursor-pointer whitespace-nowrap tabular-nums"
                              >
                                <Package className="w-3.5 h-3.5" />
                                <span>Sıfır Kutu Sipariş Et ({formatTRY(wholesaleCost)})</span>
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
                      Mevcut Durumun: <strong className="text-slate-200">Sv. {shop.level}</strong> / {dist.minLevel} ·{' '}
                      <strong className="text-slate-200">{shop.reputation.toFixed(1)}★</strong> / {dist.minReputation.toFixed(1)}★
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
