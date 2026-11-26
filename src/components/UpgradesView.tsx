import React, { useState } from 'react';
import {
  Barcode,
  Building2,
  Calculator,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cloud,
  Coffee,
  Cpu,
  CreditCard,
  Crown,
  Eye,
  EyeOff,
  FlaskConical,
  Gavel,
  Lamp,
  LayoutGrid,
  Megaphone,
  Microscope,
  PackageCheck,
  Search,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Sparkles,
  Store,
  UserCheck,
  Users,
  Waves,
  Wrench,
  Zap,
} from 'lucide-react';
import {
  PLAYER_OUTFITS,
  SHOP_DECORATIONS,
  SHOP_STAFF,
  SHOP_TIERS,
  SHOP_UPGRADES,
  SHOWCASE_UPGRADE_MAX_LEVEL,
  STAFF_MAX_LEVEL,
  getShowcaseUpgradeCost,
  getStaffTrainingCost,
  getStaffTrainingDays,
} from '../game/catalog';
import {
  calculatePrestige,
  formatTRY,
  getPrestigePlaqueStyle,
  getShowcaseCapacity,
} from '../game/engine';
import {
  getLocalizedDecoration,
  getLocalizedOutfit,
  getLocalizedShopTier,
  getLocalizedStaff,
  getLocalizedUpgrade,
  useLanguage,
} from '../game/i18n';
import {
  BranchId,
  DecorationId,
  MuseumItemId,
  OutfitId,
  RadioStationId,
  ShopTier,
  StaffId,
  TimedProject,
  UpgradeId,
} from '../game/types';
import { DecorPreviewArt, OutfitAvatarArt } from './VisualShowcaseArt';

type GrowthSubTab = 'EQUIPMENT' | 'EXPANSION' | 'DECOR' | 'STAFF' | 'WARDROBE';

interface UpgradesViewProps {
  cash: number;
  reputation: number;
  level: number;
  shopTier: ShopTier;
  showcaseUpgradeLevel: number;
  ownedUpgrades: UpgradeId[];
  ownedDecorations: DecorationId[];
  activeDecorations: DecorationId[];
  hiredStaff: StaffId[];
  staffLevels: Record<StaffId, number>;
  branches: BranchId[];
  museumItems: MuseumItemId[];
  pendingProjects: TimedProject[];
  ownedOutfits: OutfitId[];
  equippedOutfit: OutfitId;
  prestigeLevel?: number;
  radioStation?: RadioStationId;
  onCycleRadio?: () => void;
  onBuyUpgrade: (upgradeId: UpgradeId) => void;
  onBuyShowcaseUpgrade: () => void;
  onUpgradeShopTier: (targetTier: ShopTier) => void;
  onBuyDecoration: (decorId: DecorationId) => void;
  onToggleDecoration: (decorId: DecorationId) => void;
  onHireStaff: (staffId: StaffId) => void;
  onTrainStaff: (staffId: StaffId) => void;
  onBuyOutfit: (outfitId: OutfitId) => void;
  onEquipOutfit: (outfitId: OutfitId) => void;
  onBackToCounter: () => void;
}

const UPGRADE_ICONS: Record<UpgradeId, React.ReactNode> = {
  repair_bench: <Wrench className="w-4 h-4 text-amber-400" />,
  tea_samovar: <Coffee className="w-4 h-4 text-amber-400" />,
  accessory_license: <ShoppingBag className="w-4 h-4 text-emerald-400" />,
  pro_diagnostic: <Cpu className="w-4 h-4 text-sky-400" />,
  display_cabinet: <LayoutGrid className="w-4 h-4 text-emerald-400" />,
  classifieds_license: <Search className="w-4 h-4 text-amber-400" />,
  parts_wholesale: <PackageCheck className="w-4 h-4 text-emerald-400" />,
  neon_sign: <Megaphone className="w-4 h-4 text-pink-400" />,
  cctv_security: <ShieldCheck className="w-4 h-4 text-sky-300" />,
  auction_license: <Gavel className="w-4 h-4 text-amber-400" />,
  brand_new_license: <Store className="w-4 h-4 text-amber-300" />,
  ultrasonic_cleaner: <Waves className="w-4 h-4 text-sky-400" />,
  laser_backglass: <Zap className="w-4 h-4 text-amber-300" />,
  espresso_bar: <Coffee className="w-4 h-4 text-orange-300" />,
  smart_pos_zero: <CreditCard className="w-4 h-4 text-emerald-300" />,
  micro_soldering: <Microscope className="w-4 h-4 text-indigo-300" />,
  barcode_automation: <Barcode className="w-4 h-4 text-cyan-300" />,
  cloud_crm: <Cloud className="w-4 h-4 text-sky-300" />,
  clean_room_lab: <FlaskConical className="w-4 h-4 text-teal-300" />,
  vip_concierge: <Crown className="w-4 h-4 text-amber-400" />,
};

const ALL_TIERS: ShopTier[] = [1, 2, 3, 4, 5, 6];
const EQUIP_PER_PAGE = 6;

export const UpgradesView: React.FC<UpgradesViewProps> = ({
  cash,
  reputation,
  level,
  shopTier,
  showcaseUpgradeLevel,
  ownedUpgrades,
  ownedDecorations,
  activeDecorations,
  hiredStaff,
  staffLevels,
  branches,
  museumItems,
  pendingProjects,
  ownedOutfits,
  equippedOutfit,
  prestigeLevel = 0,
  radioStation = 'OFF',
  onCycleRadio,
  onBuyUpgrade,
  onBuyShowcaseUpgrade,
  onUpgradeShopTier,
  onBuyDecoration,
  onToggleDecoration,
  onHireStaff,
  onTrainStaff,
  onBuyOutfit,
  onEquipOutfit,
  onBackToCounter,
}) => {
  const { lang, bi } = useLanguage();
  const [subTab, setSubTab] = useState<GrowthSubTab>('EQUIPMENT');
  const [equipPage, setEquipPage] = useState(0);

  const prestige = calculatePrestige({
    shopTier,
    activeDecorations,
    branches,
    museumItems,
  });
  const showcaseCap = getShowcaseCapacity(
    shopTier,
    ownedUpgrades,
    showcaseUpgradeLevel
  );
  const nextShowcaseCost = getShowcaseUpgradeCost(showcaseUpgradeLevel);
  const pendingShowcase = pendingProjects.find(
    (p) => p.kind === 'SHOWCASE_UPGRADE'
  );

  const totalEquipPages = Math.max(
    1,
    Math.ceil(SHOP_UPGRADES.length / EQUIP_PER_PAGE)
  );
  const safeEquipPage = Math.min(equipPage, totalEquipPages - 1);
  const visibleUpgrades = SHOP_UPGRADES.slice(
    safeEquipPage * EQUIP_PER_PAGE,
    safeEquipPage * EQUIP_PER_PAGE + EQUIP_PER_PAGE
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#0F141B] p-2 lg:p-3 gap-2">
      {/* SINGLE-ROW SUB-TAB BAR + PRESTIGE & PENDING CHIP */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-1.5 rounded-xl border border-white/10 bg-[#151D28] px-2.5 py-1.5">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {(
            [
              ['EQUIPMENT', Wrench, bi(`Ekipman & Lisans (${SHOP_UPGRADES.length})`, `Gear & Permits (${SHOP_UPGRADES.length})`)],
              ['EXPANSION', Building2, bi('Dükkanlar (6)', 'Shops (6)')],
              ['DECOR', Lamp, bi('Dekor', 'Decor')],
              ['STAFF', Users, bi('Ekip', 'Staff')],
              ['WARDROBE', Shirt, bi('Gardırop', 'Wardrobe')],
            ] as const
          ).map(([id, Icon, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setSubTab(id)}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                subTab === id
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-[#0E141D] text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] tabular-nums shrink-0">
          {pendingProjects.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md border border-sky-400/35 bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold text-sky-200 whitespace-nowrap">
              <Clock className="w-3 h-3" />
              {pendingProjects.length} {bi('Kurulum', 'Active')}
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[10.5px] font-bold text-amber-300 whitespace-nowrap">
            <Sparkles className="w-3 h-3" />
            {bi('Prestij', 'Prestige')}: {prestige}
          </span>
          <button
            type="button"
            onClick={onBackToCounter}
            className="rounded-lg border border-white/15 bg-[#1B2432] px-2.5 py-1 text-[11px] font-bold text-slate-100 hover:bg-[#253246] whitespace-nowrap cursor-pointer"
          >
            ← {bi('Tezgah', 'Counter')}
          </button>
        </div>
      </div>

      {/* TAB 1: EQUIPMENT + SHOWCASE RACK (3x2 PAGINATED, ZERO SCROLL) */}
      {subTab === 'EQUIPMENT' && (
        <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
          {/* Compact Inline Showcase Rack Bar */}
          <div className="shrink-0 flex items-center justify-between gap-2 rounded-xl border border-amber-400/25 bg-[#17202D] px-3 py-1.5 tabular-nums">
            <div className="flex items-center gap-2 min-w-0">
              <LayoutGrid className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-100">
                  {bi('Vitrin Rafı', 'Showcase Rack')}{' '}
                  <strong className="font-mono text-amber-300">
                    {showcaseUpgradeLevel}/{SHOWCASE_UPGRADE_MAX_LEVEL}
                  </strong>
                </span>
                <span className="ml-2 text-[10.5px] text-slate-400">
                  ({bi('Kapasite', 'Capacity')}:{' '}
                  <strong className="text-emerald-300 font-mono">
                    {showcaseCap}
                  </strong>
                  )
                </span>
              </div>
            </div>

            {showcaseUpgradeLevel >= SHOWCASE_UPGRADE_MAX_LEVEL ? (
              <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300">
                MAX ✓
              </span>
            ) : pendingShowcase ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-300">
                <Clock className="w-3 h-3" />
                {pendingShowcase.daysRemaining} {bi('gün', 'd')}
              </span>
            ) : (
              <button
                type="button"
                disabled={cash < nextShowcaseCost}
                onClick={onBuyShowcaseUpgrade}
                className="rounded-lg bg-amber-500 px-3 py-1 text-[10.5px] font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-35 cursor-pointer whitespace-nowrap"
              >
                +1 {bi('Raf', 'Slot')} · {formatTRY(nextShowcaseCost)}
              </button>
            )}
          </div>

          {/* 3x2 Equipment Grid — Pure Cash Unlocks */}
          <div className="flex-1 min-h-0 grid grid-cols-3 grid-rows-2 gap-2 overflow-hidden">
            {visibleUpgrades.map((up) => {
              const loc = getLocalizedUpgrade(up.id, lang);
              const owned = ownedUpgrades.includes(up.id);
              const pending = pendingProjects.find(
                (p) => p.kind === 'UPGRADE' && p.targetId === up.id
              );
              const canBuy = !owned && !pending && cash >= up.cost;
              const visibleInShop = [
                'barcode_automation',
                'pro_diagnostic',
                'cctv_security',
                'smart_pos_zero',
                'repair_bench',
                'micro_soldering',
                'clean_room_lab',
                'espresso_bar',
                'neon_sign',
                'cloud_crm',
                'accessory_license',
                'classifieds_license',
                'auction_license',
                'brand_new_license',
              ].includes(up.id);

              return (
                <div
                  key={up.id}
                  className={`rounded-xl border p-2 flex flex-col justify-between min-h-0 overflow-hidden ${
                    owned
                      ? 'border-emerald-500/35 bg-emerald-500/8'
                      : pending
                      ? 'border-sky-400/35 bg-sky-500/8'
                      : up.highlightTag === 'İş Kolu'
                      ? 'border-amber-400/30 bg-[#1A1E2B]'
                      : 'border-white/10 bg-[#151D28]'
                  }`}
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#0D131C] border border-white/8 flex items-center justify-center shrink-0">
                      {UPGRADE_ICONS[up.id]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold text-slate-100 truncate">
                        {loc.name}
                      </div>
                      <div className="text-[9.5px] font-semibold text-amber-300 truncate">
                        {loc.benefitText}
                      </div>
                    </div>
                  </div>

                  <p className="text-[9.5px] text-slate-400 line-clamp-2 leading-snug">
                    {loc.summary}
                  </p>

                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/8 tabular-nums">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[9.5px] text-slate-400 font-mono shrink-0">
                        {up.installDays > 0
                          ? `${up.installDays} ${bi('gün', 'd')}`
                          : bi('Anında', 'Instant')}
                      </span>
                      {visibleInShop && (
                        <span
                          className={`inline-flex items-center gap-0.5 text-[8.5px] font-bold truncate ${
                            owned ? 'text-cyan-300' : 'text-slate-400'
                          }`}
                        >
                          <Eye className="w-2.5 h-2.5 shrink-0" />
                          {owned
                            ? bi('Dükkanda Aktif', 'Live in Shop')
                            : bi('Dükkanda Görünür', 'Shown in Shop')}
                        </span>
                      )}
                    </div>

                    {owned ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-emerald-400 shrink-0">
                        <Check className="w-3 h-3" /> {bi('Kurulu', 'Owned')}
                      </span>
                    ) : pending ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-sky-300 shrink-0">
                        <Clock className="w-3 h-3" /> {pending.daysRemaining}{' '}
                        {bi('gün', 'd')}
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={!canBuy}
                        onClick={() => onBuyUpgrade(up.id)}
                        className="rounded-md bg-amber-500 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-35 cursor-pointer whitespace-nowrap shrink-0"
                      >
                        {formatTRY(up.cost)}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Footer */}
          <div className="shrink-0 flex items-center justify-center gap-2 text-[11px]">
            <button
              type="button"
              disabled={safeEquipPage === 0}
              onClick={() => setEquipPage((p) => Math.max(0, p - 1))}
              className="inline-flex items-center gap-0.5 rounded-md border border-white/10 bg-[#151D28] px-2.5 py-0.5 text-slate-200 disabled:opacity-35 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              {bi('Önceki', 'Prev')}
            </button>
            <span className="font-mono text-slate-400">
              {safeEquipPage + 1} / {totalEquipPages}
            </span>
            <button
              type="button"
              disabled={safeEquipPage >= totalEquipPages - 1}
              onClick={() =>
                setEquipPage((p) => Math.min(totalEquipPages - 1, p + 1))
              }
              className="inline-flex items-center gap-0.5 rounded-md border border-white/10 bg-[#151D28] px-2.5 py-0.5 text-slate-200 disabled:opacity-35 cursor-pointer"
            >
              {bi('Sonraki', 'Next')}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: 6 SHOP TIERS (3x2 ZERO SCROLL — CASH & REPUTATION ONLY) */}
      {subTab === 'EXPANSION' && (
        <div className="flex-1 min-h-0 grid grid-cols-3 grid-rows-2 gap-2 overflow-hidden">
          {ALL_TIERS.map((tier) => {
            const info = getLocalizedShopTier(tier, lang);
            const raw = SHOP_TIERS[tier];
            const isCurrent = shopTier === tier;
            const isPast = shopTier > tier;
            const isNext = tier === shopTier + 1;
            const pending = pendingProjects.find(
              (p) => p.kind === 'SHOP_TIER' && p.targetId === String(tier)
            );
            const meetsRep = reputation >= raw.minReputation;
            const canMove = isNext && !pending && meetsRep && cash >= raw.cost;

            return (
              <div
                key={tier}
                className={`rounded-xl border p-2.5 flex flex-col justify-between min-h-0 overflow-hidden ${
                  isCurrent
                    ? 'border-amber-400 bg-amber-500/10'
                    : isPast
                    ? 'border-emerald-500/25 bg-[#131B24]/70 opacity-75'
                    : 'border-white/10 bg-[#151D28]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-[10px] font-extrabold text-amber-300">
                      {bi(`DÜKKAN ${tier}`, `TIER ${tier}`)}
                    </span>
                    <span className="font-mono text-[9.5px] text-slate-400">
                      {bi('Kira', 'Rent')}: {formatTRY(raw.baseRent)}/{bi('g', 'd')}
                    </span>
                  </div>
                  <div className="text-xs font-extrabold text-slate-100 truncate mt-0.5">
                    {info.name}
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                    {info.unlocksText}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-white/8 tabular-nums">
                  <span className="text-[9.5px] font-mono text-slate-400 truncate">
                    {tier === 1
                      ? bi('Başlangıç', 'Starter')
                      : `${raw.minReputation.toFixed(1)}★ · ${raw.renovationDays}${bi('g', 'd')}`}
                  </span>

                  {isCurrent ? (
                    <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-extrabold text-amber-300">
                      {bi('Mevcut', 'Active')}
                    </span>
                  ) : isPast ? (
                    <span className="text-[10px] font-bold text-emerald-400">
                      ✓ {bi('Geçildi', 'Cleared')}
                    </span>
                  ) : pending ? (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-sky-300">
                      <Clock className="w-3 h-3" /> {pending.daysRemaining}
                      {bi('g', 'd')}
                    </span>
                  ) : isNext ? (
                    <button
                      type="button"
                      disabled={!canMove}
                      onClick={() => onUpgradeShopTier(tier)}
                      className="rounded-md bg-amber-500 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-35 cursor-pointer whitespace-nowrap"
                    >
                      {!meetsRep
                        ? `${raw.minReputation.toFixed(1)}★`
                        : formatTRY(raw.cost)}
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
                      {formatTRY(raw.cost)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: DECORATIONS (3x3 ZERO SCROLL — INCLUDES RADIO, TEA BOILER & PRESTIGE PLAQUE) */}
      {subTab === 'DECOR' && (
        <div className="flex-1 min-h-0 grid grid-cols-3 grid-rows-3 gap-1.5 overflow-hidden">
          {SHOP_DECORATIONS.map((dec) => {
            const loc = getLocalizedDecoration(dec.id, lang);
            const isPlaque = dec.id === 'prestige_plaque';
            const isRadio = dec.id === 'vintage_radio';
            const plaqueStyle = getPrestigePlaqueStyle(prestigeLevel);
            const owned = isPlaque
              ? prestigeLevel > 0
              : ownedDecorations.includes(dec.id);
            const active = owned && activeDecorations.includes(dec.id);
            const displayTitle =
              isPlaque && prestigeLevel > 0
                ? `${lang === 'en' ? plaqueStyle.tierLabelEn : plaqueStyle.tierLabelTr} ${bi('Plaket', 'Plaque')} (P${prestigeLevel})`
                : loc.name;

            return (
              <div
                key={dec.id}
                className={`rounded-xl border p-1.5 sm:p-2 flex flex-col justify-between min-h-0 overflow-hidden ${
                  isPlaque && prestigeLevel > 0
                    ? `${plaqueStyle.borderClass} ${plaqueStyle.bgClass}`
                    : active
                    ? 'border-amber-400/50 bg-amber-500/10'
                    : 'border-white/10 bg-[#151D28]'
                }`}
              >
                <div className="shrink-0 flex items-center justify-between gap-1">
                  <div className="text-[11px] font-extrabold text-slate-100 truncate">
                    {displayTitle}
                  </div>
                  <div className="text-[9.5px] font-mono font-bold text-amber-300 shrink-0">
                    +{dec.prestige}
                  </div>
                </div>

                <div className="flex-1 min-h-0 my-1 rounded-lg border border-white/8 bg-[#0D131C] p-1 flex items-center justify-center overflow-hidden">
                  <DecorPreviewArt
                    id={dec.id}
                    prestigeLevel={prestigeLevel}
                    className="w-full h-full max-h-20 object-contain"
                  />
                </div>

                <p className="shrink-0 text-[9px] text-slate-400 truncate mb-1">
                  {isPlaque
                    ? prestigeLevel > 0
                      ? bi(
                          `Prestij P${prestigeLevel} (${plaqueStyle.tierLabelTr}) — duvarda otomatik parlar.`,
                          `Prestige P${prestigeLevel} (${plaqueStyle.tierLabelEn}) — shines on your shop wall.`
                        )
                      : bi('1. Prestij sıfırlamasında otomatik açılır.', 'Auto-unlocks at Prestige 1.')
                    : loc.summary}
                </p>

                <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/8 tabular-nums">
                  {isRadio && owned && onCycleRadio ? (
                    <button
                      type="button"
                      onClick={onCycleRadio}
                      className={`rounded-md px-2 py-0.5 text-[9.5px] font-extrabold cursor-pointer truncate ${
                        radioStation === 'ARABESK'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                          : radioStation === 'POP90'
                          ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400/40'
                          : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      {radioStation === 'ARABESK'
                        ? 'FM 94.2 Arabesk'
                        : radioStation === 'POP90'
                        ? 'FM 98.8 90lar'
                        : bi('Radyo Kapalı', 'Radio Off')}
                    </button>
                  ) : (
                    <span className="text-[9px] font-mono text-slate-500 truncate">
                      {isPlaque
                        ? prestigeLevel > 0
                          ? `P${prestigeLevel}`
                          : bi('Kilitli', 'Locked')
                        : dec.cost === 0
                        ? bi('Başlangıç', 'Starter')
                        : formatTRY(dec.cost)}
                    </span>
                  )}

                  {isPlaque && prestigeLevel === 0 ? (
                    <span className="rounded-md bg-white/8 px-2 py-0.5 text-[9.5px] font-bold text-slate-400 whitespace-nowrap">
                      {bi('Prestij 1+', 'Prestige 1+')}
                    </span>
                  ) : owned ? (
                    <button
                      type="button"
                      onClick={() => onToggleDecoration(dec.id)}
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9.5px] font-bold cursor-pointer whitespace-nowrap ${
                        active
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/35'
                          : 'bg-white/10 text-slate-300 hover:text-white'
                      }`}
                    >
                      {active ? (
                        <>
                          <Eye className="w-3 h-3" /> {bi('Açık', 'On')}
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" /> {bi('Gizli', 'Off')}
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={cash < dec.cost}
                      onClick={() => onBuyDecoration(dec.id)}
                      className="rounded-md bg-amber-500 px-2.5 py-0.5 text-[9.5px] font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-35 cursor-pointer whitespace-nowrap"
                    >
                      {bi('Al', 'Buy')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 4: STAFF TEAM (2x2 ZERO SCROLL — PURE CASH HIRE + RANK TRAINING) */}
      {subTab === 'STAFF' && (
        <div className="flex-1 min-h-0 grid grid-cols-2 grid-rows-2 gap-2 overflow-hidden">
          {SHOP_STAFF.map((member) => {
            const loc = getLocalizedStaff(member.id, lang);
            const hired = hiredStaff.includes(member.id);
            const stLvl = staffLevels[member.id] ?? 1;
            const trainCost = getStaffTrainingCost(stLvl);
            const trainDays = getStaffTrainingDays(stLvl);
            const pendingTrain = pendingProjects.find(
              (p) => p.kind === 'STAFF_TRAIN' && p.targetId === member.id
            );

            return (
              <div
                key={member.id}
                className={`rounded-xl border p-2.5 flex flex-col justify-between min-h-0 overflow-hidden ${
                  hired
                    ? 'border-emerald-400/35 bg-[#16222C]'
                    : 'border-white/10 bg-[#151D28]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      {member.id === 'accountant' ? (
                        <Calculator className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                      <span className="text-xs font-extrabold text-slate-100 truncate">
                        {loc.name}
                      </span>
                    </div>
                    <div className="text-[10px] text-amber-300 font-semibold mt-0.5">
                      {loc.role} · {loc.benefitText}
                    </div>
                  </div>
                  {hired && (
                    <span className="font-mono text-[10px] font-extrabold rounded bg-emerald-500/20 px-1.5 py-0.5 text-emerald-300 shrink-0">
                      {bi('Kademe', 'Rank')} {stLvl}/{STAFF_MAX_LEVEL}
                    </span>
                  )}
                </div>

                <p className="text-[10px] text-slate-300 line-clamp-2 leading-snug">
                  {loc.summary}
                </p>

                <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-white/8 tabular-nums">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {bi('Günlük Maaş', 'Daily Wage')}: {formatTRY(member.dailyWage)}
                  </span>

                  {!hired ? (
                    <button
                      type="button"
                      disabled={cash < member.hireCost}
                      onClick={() => onHireStaff(member.id)}
                      className="rounded-lg bg-amber-500 px-3 py-1 text-[10.5px] font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-35 cursor-pointer whitespace-nowrap"
                    >
                      {bi('İşe Al', 'Hire')} · {formatTRY(member.hireCost)}
                    </button>
                  ) : stLvl >= STAFF_MAX_LEVEL ? (
                    <span className="text-[10.5px] font-extrabold text-emerald-400">
                      MAX {bi('USTALIK', 'MASTERY')} ✓
                    </span>
                  ) : pendingTrain ? (
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-sky-300">
                      <Clock className="w-3.5 h-3.5" />
                      {bi('Eğitimde', 'Training')} ({pendingTrain.daysRemaining}
                      {bi('g', 'd')})
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={cash < trainCost}
                      onClick={() => onTrainStaff(member.id)}
                      className="rounded-lg bg-sky-500 px-3 py-1 text-[10.5px] font-extrabold text-slate-950 hover:bg-sky-400 disabled:opacity-35 cursor-pointer whitespace-nowrap"
                    >
                      {bi('Eğit', 'Train')} ({trainDays}
                      {bi('g', 'd')}) · {formatTRY(trainCost)}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 5: BOSS WARDROBE (3x2 ZERO SCROLL — PURE CASH) */}
      {subTab === 'WARDROBE' && (
        <div className="flex-1 min-h-0 grid grid-cols-3 grid-rows-2 gap-2 overflow-hidden">
          {PLAYER_OUTFITS.map((outfit) => {
            const loc = getLocalizedOutfit(outfit.id, lang);
            const owned = ownedOutfits.includes(outfit.id);
            const equipped = equippedOutfit === outfit.id;

            return (
              <div
                key={outfit.id}
                className={`rounded-xl border p-2 flex flex-col justify-between min-h-0 overflow-hidden ${
                  equipped
                    ? 'border-amber-400 bg-amber-500/12'
                    : 'border-white/10 bg-[#151D28]'
                }`}
              >
                <div className="shrink-0 flex items-center justify-between gap-1">
                  <div className="text-xs font-extrabold text-slate-100 truncate">
                    {loc.name}
                  </div>
                  <span className="text-[9.5px] font-semibold text-emerald-300 truncate shrink-0">
                    {outfit.moodBonus > 0
                      ? `+${outfit.moodBonus} ${bi('Ruh', 'Mood')}`
                      : bi('Klasik', 'Classic')}
                  </span>
                </div>

                <div className="flex-1 min-h-0 my-1.5 rounded-lg border border-white/8 bg-[#0D131C] px-2.5 py-1.5 flex items-center justify-center gap-3 overflow-hidden">
                  <OutfitAvatarArt
                    id={outfit.id}
                    className="h-full max-h-20 w-auto shrink-0"
                  />
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="text-[10px] font-bold text-emerald-300 line-clamp-2 leading-snug">
                      {loc.bonusDescription}
                    </div>
                    <p className="text-[9.5px] text-slate-400 line-clamp-2 leading-snug">
                      {loc.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-1 border-t border-white/8 tabular-nums">
                  {equipped ? (
                    <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-extrabold text-amber-300">
                      {bi('Giyili ✓', 'Worn ✓')}
                    </span>
                  ) : owned ? (
                    <button
                      type="button"
                      onClick={() => onEquipOutfit(outfit.id)}
                      className="rounded-md bg-white/12 px-2.5 py-0.5 text-[10px] font-bold text-slate-100 hover:bg-white/20 cursor-pointer"
                    >
                      {bi('Giy', 'Equip')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={cash < outfit.cost}
                      onClick={() => onBuyOutfit(outfit.id)}
                      className="rounded-md bg-amber-500 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-35 cursor-pointer"
                    >
                      {formatTRY(outfit.cost)}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
