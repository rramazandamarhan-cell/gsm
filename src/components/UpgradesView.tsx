import React, { useState } from 'react';
import {
  Barcode,
  Building2,
  Calculator,
  Check,
  Clock,
  Coffee,
  Cpu,
  CreditCard,
  Eye,
  EyeOff,
  FlaskConical,
  Lamp,
  LayoutGrid,
  Megaphone,
  Microscope,
  PackageCheck,
  Shirt,
  Sparkles,
  UserCheck,
  Users,
  Waves,
  Wrench,
  Zap,
} from 'lucide-react';
import {
  DECOR_BANNER_IMAGE,
  OUTFITS_BANNER_IMAGE,
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
  getShowcaseCapacity,
} from '../game/engine';
import {
  BranchId,
  DecorationId,
  MuseumItemId,
  OutfitId,
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
  onBuyUpgrade: (upgradeId: UpgradeId) => void;
  onBuyShowcaseUpgrade: () => void;
  onUpgradeShopTier: (targetTier: ShopTier) => void;
  onBuyDecoration: (decorId: DecorationId) => void;
  onToggleDecoration: (decorId: DecorationId) => void;
  onHireStaff: (staffId: StaffId) => void;
  onTrainStaff: (staffId: StaffId) => void;
  onBuyOutfit: (outfitId: OutfitId) => void;
  onEquipOutfit: (outfitId: OutfitId) => void;
}

const UPGRADE_ICONS: Record<UpgradeId, React.ReactNode> = {
  repair_bench: <Wrench className="w-5 h-5 text-amber-400" />,
  tea_samovar: <Coffee className="w-5 h-5 text-amber-400" />,
  pro_diagnostic: <Cpu className="w-5 h-5 text-amber-400" />,
  display_cabinet: <LayoutGrid className="w-5 h-5 text-amber-400" />,
  parts_wholesale: <PackageCheck className="w-5 h-5 text-amber-400" />,
  neon_sign: <Megaphone className="w-5 h-5 text-amber-400" />,
  ultrasonic_cleaner: <Waves className="w-5 h-5 text-sky-400" />,
  laser_backglass: <Zap className="w-5 h-5 text-rose-400" />,
  micro_soldering: <Microscope className="w-5 h-5 text-emerald-400" />,
  clean_room_lab: <FlaskConical className="w-5 h-5 text-indigo-400" />,
  smart_pos_zero: <CreditCard className="w-5 h-5 text-emerald-400" />,
  barcode_automation: <Barcode className="w-5 h-5 text-amber-400" />,
};

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
  onBuyUpgrade,
  onBuyShowcaseUpgrade,
  onUpgradeShopTier,
  onBuyDecoration,
  onToggleDecoration,
  onHireStaff,
  onTrainStaff,
  onBuyOutfit,
  onEquipOutfit,
}) => {
  const [subTab, setSubTab] = useState<GrowthSubTab>('EQUIPMENT');
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
  const showcaseUpgradeInProgress = pendingProjects.some(
    (p) => p.kind === 'SHOWCASE_UPGRADE'
  );

  const tabs: { id: GrowthSubTab; label: string; icon: React.ReactNode }[] = [
    { id: 'EQUIPMENT', label: 'Ekipman & Vitrin', icon: <Wrench className="w-4 h-4" /> },
    { id: 'EXPANSION', label: '6 Dükkan Seviyesi', icon: <Building2 className="w-4 h-4" /> },
    { id: 'DECOR', label: 'Dekorasyon', icon: <Lamp className="w-4 h-4" /> },
    { id: 'STAFF', label: 'Ekip (Sv.10)', icon: <Users className="w-4 h-4" /> },
    { id: 'WARDROBE', label: 'Gardırop', icon: <Shirt className="w-4 h-4" /> },
  ];

  return (
    <div className="flex-1 min-h-0 overflow-y-auto pasaj-scroll p-3 sm:p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header & Sub-Tab Filter */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-2.5 sm:gap-4 mb-3.5 sm:mb-5">
          <div>
            <h2 className="font-display text-lg sm:text-2xl font-bold text-slate-50">
              Dükkan Büyütme, Ekipman, Ekip & Gardırop
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5 tabular-nums">
              Dükkan: <strong className="text-slate-100">{SHOP_TIERS[shopTier].name}</strong> (Tier {shopTier}/6) · Prestij:{' '}
              <strong className="text-amber-400">{prestige} P</strong> · Vitrin:{' '}
              <strong className="text-emerald-400">{showcaseCap} Raf</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-xl bg-[#131A24] p-1 border border-white/10">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSubTab(t.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  subTab === t.id
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-300 hover:text-slate-50'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* LIVE TIMED PROJECTS TRACKER */}
        {pendingProjects.length > 0 && (
          <div className="mb-5 rounded-2xl border border-amber-500/35 bg-[#1B212D] p-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="inline-flex items-center gap-2 text-xs font-bold text-amber-300">
                <Clock className="w-4 h-4" />
                <span>
                  Devam Eden Tadilat, Kurulum & Eğitimler ({pendingProjects.length})
                </span>
              </span>
              <span className="text-[11px] text-slate-400">
                Her yeni sabah 1 gün ilerler
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {pendingProjects.map((proj) => {
                const donePct = Math.round(
                  ((proj.totalDays - proj.daysRemaining) /
                    Math.max(1, proj.totalDays)) *
                    100
                );
                return (
                  <div
                    key={proj.id}
                    className="rounded-xl border border-white/10 bg-[#111722] p-3 space-y-1.5 tabular-nums"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-slate-100 truncate">
                        {proj.label}
                      </span>
                      <span className="font-mono font-bold text-amber-400 shrink-0">
                        {proj.daysRemaining} Gün Kaldı
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-amber-400"
                        style={{ width: `${Math.max(18, donePct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUB-TAB 1: EQUIPMENT + REPEATABLE SHOWCASE CAPACITY UPGRADE */}
        {subTab === 'EQUIPMENT' && (
          <div className="space-y-5">
            {/* Repeatable Vitrin Shelf Upgrade Card */}
            <div className="rounded-2xl border border-sky-500/35 bg-gradient-to-r from-[#142334] to-[#161E29] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-300 mb-1">
                  <LayoutGrid className="w-4 h-4" />
                  <span>TEKRARLANABİLİR VİTRİN RAF YÜKSELTMESİ</span>
                </div>
                <h3 className="font-display text-xl font-bold text-slate-50">
                  Vitrin Kapasitesini Genişlet (Sv. {showcaseUpgradeLevel} /{' '}
                  {SHOWCASE_UPGRADE_MAX_LEVEL})
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  Her yükseltme dükkanına <strong>+2 adet kalıcı vitrin sergileme yuvası</strong> ekler (Kurulum: 1 Gün). Şu anki toplam kapasiten: <strong className="text-emerald-400">{showcaseCap} telefon</strong>.
                </p>
              </div>
              <div className="shrink-0">
                {showcaseUpgradeLevel >= SHOWCASE_UPGRADE_MAX_LEVEL ? (
                  <div className="rounded-xl border border-emerald-500/35 bg-emerald-500/12 px-4 py-2.5 text-xs font-bold text-emerald-300">
                    Maksimum Raf Seviyesi!
                  </div>
                ) : showcaseUpgradeInProgress ? (
                  <div className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/12 px-4 py-2.5 text-xs font-bold text-amber-300">
                    <Clock className="w-4 h-4" />
                    <span>Raf Montajı Devam Ediyor...</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={cash < nextShowcaseCost}
                    onClick={onBuyShowcaseUpgrade}
                    className="rounded-xl bg-sky-500 px-5 py-3 text-xs font-extrabold text-slate-950 hover:bg-sky-400 disabled:opacity-40 cursor-pointer whitespace-nowrap tabular-nums"
                  >
                    +2 Vitrin Yuvası Kur ({formatTRY(nextShowcaseCost)} · 1 Gün)
                  </button>
                )}
              </div>
            </div>

            {/* 12 Level-Gated Timed Workshop & Automation Upgrades */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {SHOP_UPGRADES.map((upg) => {
                const owned = ownedUpgrades.includes(upg.id);
                const inProgress = pendingProjects.find(
                  (p) => p.kind === 'UPGRADE' && p.targetId === upg.id
                );
                const meetsLevel = level >= upg.minLevel;
                const canAfford = cash >= upg.cost;

                return (
                  <div
                    key={upg.id}
                    className={`flex flex-col justify-between rounded-2xl border p-4 transition-colors ${
                      owned
                        ? 'border-emerald-500/35 bg-[#142220]'
                        : inProgress
                        ? 'border-amber-500/45 bg-[#20232E]'
                        : upg.id === 'repair_bench'
                        ? 'border-amber-500/45 bg-[#1B222D]'
                        : 'border-white/10 bg-[#161E29]'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2.5 mb-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#1E2938] shrink-0">
                            {UPGRADE_ICONS[upg.id]}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-display text-base font-bold text-slate-50 leading-snug">
                              {upg.name}
                            </h3>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                              <span
                                className={
                                  meetsLevel ? 'text-emerald-400' : 'text-rose-400'
                                }
                              >
                                Sv.{upg.minLevel}+
                              </span>
                              <span>·</span>
                              <span className="text-amber-300">
                                {upg.installDays} Gün Kurulum
                              </span>
                            </div>
                          </div>
                        </div>

                        {owned ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 shrink-0">
                            <Check className="w-4 h-4" />
                            <span>Aktif</span>
                          </span>
                        ) : (
                          <span className="font-mono text-sm font-bold text-amber-400 tabular-nums shrink-0">
                            {formatTRY(upg.cost)}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed mb-2.5">
                        {upg.summary}
                      </p>
                      <p className="text-[11px] text-slate-400 border-t border-white/8 pt-2.5 mb-3.5">
                        Etki: <span className="text-slate-200">{upg.benefitText}</span>
                      </p>
                    </div>

                    {!owned &&
                      (inProgress ? (
                        <div className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/12 py-2.5 text-xs font-bold text-amber-300">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Kuruluyor ({inProgress.daysRemaining} Gün Kaldı)</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={!meetsLevel || !canAfford}
                          onClick={() => onBuyUpgrade(upg.id)}
                          className="w-full rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap tabular-nums"
                        >
                          {!meetsLevel
                            ? `Seviye ${upg.minLevel} Gerekli`
                            : canAfford
                            ? `Kurulumu Başlat (${formatTRY(upg.cost)} · ${upg.installDays} Gün)`
                            : `Yetersiz Kasa (${formatTRY(upg.cost - cash)} eksik)`}
                        </button>
                      ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUB-TAB 2: 6 SHOP TIERS (TIMED RENOVATION) */}
        {subTab === 'EXPANSION' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {([1, 2, 3, 4, 5, 6] as ShopTier[]).map((t) => {
              const info = SHOP_TIERS[t];
              const isCurrent = shopTier === t;
              const isUnlocked = shopTier >= t;
              const isNext = t === shopTier + 1;
              const inProgress = pendingProjects.find(
                (p) => p.kind === 'SHOP_TIER' && p.targetId === String(t)
              );
              const anyShopRenovation = pendingProjects.some(
                (p) => p.kind === 'SHOP_TIER'
              );
              const meetsRep = reputation >= info.minReputation;
              const meetsLvl = level >= info.minLevel;
              const canAfford = cash >= info.cost;

              return (
                <div
                  key={t}
                  className={`flex flex-col justify-between rounded-2xl border overflow-hidden ${
                    isCurrent
                      ? 'border-amber-500/60 bg-[#1A2330]'
                      : inProgress
                      ? 'border-sky-400/50 bg-[#172334]'
                      : isUnlocked
                      ? 'border-emerald-500/30 bg-[#142020]'
                      : 'border-white/10 bg-[#161E29]'
                  }`}
                >
                  <div>
                    <div className="relative h-36 w-full bg-[#0F141B] overflow-hidden">
                      <img
                        src={info.backdropPath}
                        alt={info.name}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#161E29] via-transparent to-black/35" />
                      <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-amber-300">
                          Seviye {t} / 6
                        </span>
                        <span className="font-semibold text-slate-100 tabular-nums">
                          {isCurrent
                            ? 'Aktif Dükkan'
                            : isUnlocked
                            ? 'Geçildi'
                            : formatTRY(info.cost)}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-display text-lg font-bold text-slate-50 mb-1">
                        {info.name}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed mb-3">
                        {info.description}
                      </p>
                      <div className="text-xs text-slate-400 border-t border-white/8 pt-2.5 space-y-1 tabular-nums">
                        <div className="text-slate-200 font-medium">
                          {info.unlocksText}
                        </div>
                        <div>
                          Taban Kira: {formatTRY(info.baseRent)}/gün · Tadilat:{' '}
                          <strong className="text-amber-300">
                            {info.renovationDays} Gün
                          </strong>
                        </div>
                        {t > 1 && (
                          <div>
                            Şart:{' '}
                            <span
                              className={
                                meetsLvl ? 'text-emerald-400' : 'text-rose-400'
                              }
                            >
                              Sv.{info.minLevel}
                            </span>{' '}
                            &{' '}
                            <span
                              className={
                                meetsRep ? 'text-emerald-400' : 'text-rose-400'
                              }
                            >
                              {info.minReputation.toFixed(1)}★
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    {isUnlocked ? (
                      <div className="w-full text-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2.5 text-xs font-bold text-emerald-300">
                        {isCurrent ? 'Şu An Bu Dükkandasın' : 'Açıldı'}
                      </div>
                    ) : inProgress ? (
                      <div className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-sky-400/40 bg-sky-500/15 py-2.5 text-xs font-bold text-sky-200">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Tadilat Sürüyor ({inProgress.daysRemaining} Gün Kaldı)</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={
                          !isNext ||
                          anyShopRenovation ||
                          !meetsRep ||
                          !meetsLvl ||
                          !canAfford
                        }
                        onClick={() => onUpgradeShopTier(t)}
                        className="w-full rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap tabular-nums"
                      >
                        {!isNext
                          ? `Önce Seviye ${t - 1} Açılmalı`
                          : !meetsLvl
                          ? `Seviye ${info.minLevel} Gerekli`
                          : !meetsRep
                          ? `İtibar ${info.minReputation.toFixed(1)}★ Gerekli`
                          : !canAfford
                          ? `Yetersiz Kasa`
                          : `Tadilatı Başlat (${formatTRY(info.cost)} · ${info.renovationDays} Gün)`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* SUB-TAB 3: VISUAL DECORATIONS & PRESTIGE */}
        {subTab === 'DECOR' && (
          <div className="space-y-4">
            {/* Hero Banner */}
            <div className="relative rounded-2xl border border-amber-500/30 overflow-hidden h-28 sm:h-36 flex items-end p-3.5 sm:p-5">
              <img
                src={DECOR_BANNER_IMAGE}
                alt="Dükkan Dekorasyon"
                referrerPolicy="no-referrer"
                className="absolute inset-0 h-full w-full object-cover opacity-55"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F141B] via-[#0F141B]/60 to-transparent" />
              <div className="relative z-10">
                <div className="text-xs font-bold text-amber-400">
                  GÖRSEL DÜKKAN ATMOSFERİ & PRESTİJ
                </div>
                <p className="text-xs sm:text-sm text-slate-200 max-w-2xl mt-0.5">
                  Her dekorasyon parçası hem burada görsel vitrinini süsler hem doğrudan <strong>Tezgah sahnesinde canlı görünür</strong>, alıcı bütçelerini +%14’e kadar büyütür!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {SHOP_DECORATIONS.map((dec) => {
                const owned = ownedDecorations.includes(dec.id);
                const active = activeDecorations.includes(dec.id);
                const canAfford = cash >= dec.cost;

                return (
                  <div
                    key={dec.id}
                    className={`flex flex-col justify-between rounded-2xl border p-4 ${
                      owned
                        ? 'border-amber-400/35 bg-[#19222C]'
                        : 'border-white/10 bg-[#161E29]'
                    }`}
                  >
                    <div>
                      <div className="mb-3 rounded-xl overflow-hidden border border-white/10">
                        <DecorPreviewArt id={dec.id} className="w-full h-28" />
                      </div>

                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="font-display text-base font-bold text-slate-50">
                          {dec.name}
                        </h3>
                        <span className="font-mono text-xs font-bold text-amber-400 tabular-nums shrink-0">
                          +{dec.prestige} P
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed mb-2">
                        {dec.summary}
                      </p>
                      <p className="text-[11px] text-slate-400 border-t border-white/8 pt-2 mb-3.5">
                        Sahne Etkisi: <span className="text-slate-200">{dec.visualEffectText}</span>
                      </p>
                    </div>

                    {owned ? (
                      <button
                        type="button"
                        onClick={() => onToggleDecoration(dec.id)}
                        className={`w-full inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                          active
                            ? 'border-emerald-500/40 bg-emerald-500/12 text-emerald-200 hover:bg-emerald-500/20'
                            : 'border-white/15 bg-[#1F2A38] text-slate-300 hover:bg-[#273548]'
                        }`}
                      >
                        {active ? (
                          <>
                            <Eye className="w-4 h-4" />
                            <span>Dükkanda Sergileniyor (Gizle)</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4" />
                            <span>Depoda (Dükkana As)</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={!canAfford}
                        onClick={() => onBuyDecoration(dec.id)}
                        className="w-full rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap tabular-nums"
                      >
                        {canAfford
                          ? `Satın Al & As (${formatTRY(dec.cost)})`
                          : `Yetersiz Kasa`}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUB-TAB 4: STAFF UP TO LEVEL 10 + ACCOUNTANT + TIMED TRAINING */}
        {subTab === 'STAFF' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {SHOP_STAFF.map((member) => {
              const hired = hiredStaff.includes(member.id);
              const staffLvl = staffLevels?.[member.id] ?? 1;
              const trainCost = getStaffTrainingCost(staffLvl);
              const trainDays = getStaffTrainingDays(staffLvl);
              const trainingProj = pendingProjects.find(
                (p) => p.kind === 'STAFF_TRAIN' && p.targetId === member.id
              );
              const canAfford = cash >= member.hireCost;
              const canTrain =
                hired &&
                !trainingProj &&
                staffLvl < STAFF_MAX_LEVEL &&
                cash >= trainCost;

              return (
                <div
                  key={member.id}
                  className={`flex flex-col justify-between rounded-2xl border p-5 ${
                    hired
                      ? 'border-emerald-500/35 bg-[#142220]'
                      : 'border-white/10 bg-[#161E29]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          {member.id === 'accountant' && (
                            <Calculator className="w-4 h-4 text-emerald-400" />
                          )}
                          <h3 className="font-display text-lg font-bold text-slate-50">
                            {member.name}
                          </h3>
                        </div>
                        <div className="text-xs font-medium text-amber-400">
                          {member.role}
                        </div>
                      </div>

                      {hired ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 whitespace-nowrap shrink-0 tabular-nums">
                          <UserCheck className="w-4 h-4" />
                          <span>Sv. {staffLvl}/{STAFF_MAX_LEVEL}</span>
                        </span>
                      ) : (
                        <div className="text-right tabular-nums shrink-0">
                          <div className="font-mono text-base font-bold text-amber-400">
                            {formatTRY(member.hireCost)}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Günlük {formatTRY(member.dailyWage)} maaş
                          </div>
                        </div>
                      )}
                    </div>

                    {hired && (
                      <div className="mb-3">
                        <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-400 to-amber-400 transition-all"
                            style={{
                              width: `${(staffLvl / STAFF_MAX_LEVEL) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      {member.summary}
                    </p>
                    <div className="text-[11px] text-slate-400 border-t border-white/8 pt-2.5 mb-4 space-y-1">
                      <div className={hired ? 'text-slate-200' : ''}>
                        <strong>Sv.1:</strong> {member.benefitText}
                      </div>
                      <div className={hired && staffLvl >= 2 ? 'text-emerald-300' : ''}>
                        <strong>Sv.2–4:</strong> {member.level2Bonus}
                      </div>
                      <div className={hired && staffLvl >= 5 ? 'text-sky-300' : ''}>
                        <strong>Sv.5–7:</strong> {member.level3Bonus}
                      </div>
                      <div className={hired && staffLvl >= 8 ? 'text-amber-300' : ''}>
                        <strong>Sv.8–10:</strong> {member.highLevelBonus}
                      </div>
                    </div>
                  </div>

                  {hired ? (
                    <div className="space-y-2">
                      {trainingProj ? (
                        <div className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/12 py-2.5 text-xs font-bold text-amber-300">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            Eğitimde → Sv.{staffLvl + 1} ({trainingProj.daysRemaining} Gün Kaldı)
                          </span>
                        </div>
                      ) : staffLvl < STAFF_MAX_LEVEL ? (
                        <button
                          type="button"
                          disabled={!canTrain}
                          onClick={() => onTrainStaff(member.id)}
                          className="w-full rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-40 cursor-pointer tabular-nums"
                        >
                          Eğitime Gönder → Sv.{staffLvl + 1} ({formatTRY(trainCost)} ·{' '}
                          {trainDays} Gün)
                        </button>
                      ) : (
                        <div className="rounded-xl border border-amber-400/35 bg-amber-500/12 py-2.5 text-center text-xs font-bold text-amber-300">
                          Maksimum Ustalık Seviyesi (10/10)
                        </div>
                      )}
                      <div className="text-center text-[11px] text-slate-400 tabular-nums">
                        Günlük Maaş {formatTRY(member.dailyWage)}
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => onHireStaff(member.id)}
                      className="w-full rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap tabular-nums"
                    >
                      {canAfford
                        ? `İşe Al (${formatTRY(member.hireCost)})`
                        : `Yetersiz Kasa (${formatTRY(member.hireCost - cash)} eksik)`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* SUB-TAB 5: PLAYER OUTFITS & WARDROBE CUSTOMIZATION */}
        {subTab === 'WARDROBE' && (
          <div className="space-y-4">
            <div className="relative rounded-2xl border border-amber-500/30 overflow-hidden h-28 sm:h-36 flex items-end p-3.5 sm:p-5">
              <img
                src={OUTFITS_BANNER_IMAGE}
                alt="Esnaf Gardırobu"
                referrerPolicy="no-referrer"
                className="absolute inset-0 h-full w-full object-cover opacity-55"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F141B] via-[#0F141B]/60 to-transparent" />
              <div className="relative z-10">
                <div className="text-xs font-bold text-amber-400">
                  ESNAF GARDIROBU & GÖRÜNÜM ÖZELLEŞTİRME
                </div>
                <p className="text-xs sm:text-sm text-slate-200 max-w-2xl mt-0.5">
                  Tezgahta giydiğin kıyafet müşterilerin ilk izlenimini ve güvenini doğrudan etkiler! Yelekle Dayıların, İtalyan Blazer ile VIP’lerin gönlünü kazan.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {PLAYER_OUTFITS.map((outfit) => {
                const owned = ownedOutfits.includes(outfit.id);
                const equipped = equippedOutfit === outfit.id;
                const meetsLevel = level >= outfit.minLevel;
                const canAfford = cash >= outfit.cost;

                return (
                  <div
                    key={outfit.id}
                    className={`flex flex-col justify-between rounded-2xl border p-4 ${
                      equipped
                        ? 'border-emerald-400/60 bg-[#142522]'
                        : owned
                        ? 'border-amber-400/35 bg-[#19222D]'
                        : 'border-white/10 bg-[#161E29]'
                    }`}
                  >
                    <div>
                      <div className="flex items-start gap-3 mb-3">
                        <div className="h-16 w-16 rounded-xl border border-white/10 bg-[#10161F] flex items-center justify-center shrink-0">
                          <OutfitAvatarArt id={outfit.id} className="w-14 h-14" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] font-semibold text-amber-300">
                            {outfit.subtitle}
                          </div>
                          <h3 className="font-display text-base font-bold text-slate-50 leading-snug">
                            {outfit.name}
                          </h3>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            +{outfit.moodBonus} Ruh Hali · +{outfit.patienceBonus} Sabır
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed mb-3.5 border-t border-white/8 pt-2.5">
                        {outfit.bonusDescription}
                      </p>
                    </div>

                    {equipped ? (
                      <div className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-400/40 bg-emerald-500/15 py-2.5 text-xs font-extrabold text-emerald-300">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Şu An Üzerinde (Aktif)</span>
                      </div>
                    ) : owned ? (
                      <button
                        type="button"
                        onClick={() => onEquipOutfit(outfit.id)}
                        className="w-full rounded-xl border border-amber-400/45 bg-amber-500/15 py-2.5 text-xs font-bold text-amber-200 hover:bg-amber-500/25 cursor-pointer"
                      >
                        Bu Kıyafeti Giy
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={!meetsLevel || !canAfford}
                        onClick={() => onBuyOutfit(outfit.id)}
                        className="w-full rounded-xl bg-amber-500 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-40 cursor-pointer tabular-nums"
                      >
                        {!meetsLevel
                          ? `Seviye ${outfit.minLevel} Gerekli`
                          : canAfford
                          ? `Satın Al & Giy (${formatTRY(outfit.cost)})`
                          : `Yetersiz Kasa (${formatTRY(outfit.cost)})`}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
