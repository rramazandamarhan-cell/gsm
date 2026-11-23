import React, { useState } from 'react';
import {
  Building2,
  Check,
  Coffee,
  Cpu,
  Eye,
  EyeOff,
  Lamp,
  LayoutGrid,
  Megaphone,
  PackageCheck,
  Sparkles,
  UserCheck,
  Users,
  Wrench,
} from 'lucide-react';
import {
  SHOP_DECORATIONS,
  SHOP_STAFF,
  SHOP_TIERS,
  SHOP_UPGRADES,
  STAFF_TRAINING_COSTS,
} from '../game/catalog';
import { calculatePrestige, formatTRY } from '../game/engine';
import {
  BranchId,
  DecorationId,
  MuseumItemId,
  ShopTier,
  StaffId,
  UpgradeId,
} from '../game/types';

type GrowthSubTab = 'EQUIPMENT' | 'EXPANSION' | 'DECOR' | 'STAFF';

interface UpgradesViewProps {
  cash: number;
  reputation: number;
  shopTier: ShopTier;
  ownedUpgrades: UpgradeId[];
  ownedDecorations: DecorationId[];
  activeDecorations: DecorationId[];
  hiredStaff: StaffId[];
  staffLevels: Record<StaffId, number>;
  branches: BranchId[];
  museumItems: MuseumItemId[];
  onBuyUpgrade: (upgradeId: UpgradeId) => void;
  onUpgradeShopTier: (targetTier: ShopTier) => void;
  onBuyDecoration: (decorId: DecorationId) => void;
  onToggleDecoration: (decorId: DecorationId) => void;
  onHireStaff: (staffId: StaffId) => void;
  onTrainStaff: (staffId: StaffId) => void;
}

const UPGRADE_ICONS: Record<UpgradeId, React.ReactNode> = {
  repair_bench: <Wrench className="w-5 h-5 text-amber-400" />,
  tea_samovar: <Coffee className="w-5 h-5 text-amber-400" />,
  pro_diagnostic: <Cpu className="w-5 h-5 text-amber-400" />,
  display_cabinet: <LayoutGrid className="w-5 h-5 text-amber-400" />,
  parts_wholesale: <PackageCheck className="w-5 h-5 text-amber-400" />,
  neon_sign: <Megaphone className="w-5 h-5 text-amber-400" />,
};

export const UpgradesView: React.FC<UpgradesViewProps> = ({
  cash,
  reputation,
  shopTier,
  ownedUpgrades,
  ownedDecorations,
  activeDecorations,
  hiredStaff,
  staffLevels,
  branches,
  museumItems,
  onBuyUpgrade,
  onUpgradeShopTier,
  onBuyDecoration,
  onToggleDecoration,
  onHireStaff,
  onTrainStaff,
}) => {
  const [subTab, setSubTab] = useState<GrowthSubTab>('EQUIPMENT');
  const prestige = calculatePrestige({
    shopTier,
    activeDecorations,
    branches,
    museumItems,
  });

  const tabs: { id: GrowthSubTab; label: string; icon: React.ReactNode }[] = [
    { id: 'EQUIPMENT', label: 'Ekipman & Atölye', icon: <Wrench className="w-4 h-4" /> },
    { id: 'EXPANSION', label: 'Dükkan Büyüt', icon: <Building2 className="w-4 h-4" /> },
    { id: 'DECOR', label: 'Dekorasyon & Prestij', icon: <Lamp className="w-4 h-4" /> },
    { id: 'STAFF', label: 'Ekip (Çırak & Usta)', icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="flex-1 min-h-0 overflow-y-auto pasaj-scroll p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header & Sub-Tab Filter */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-50">
              Dükkan Büyütme, Dekorasyon ve Ekip
            </h2>
            <p className="text-sm text-slate-400 mt-1 tabular-nums">
              Mevcut Seviye: <strong className="text-slate-100">{SHOP_TIERS[shopTier].name}</strong> · Dükkan Prestiji:{' '}
              <strong className="text-amber-400">{prestige} Puan</strong>
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

        {/* SUB-TAB 1: EQUIPMENT */}
        {subTab === 'EQUIPMENT' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SHOP_UPGRADES.map((upg) => {
              const owned = ownedUpgrades.includes(upg.id);
              const canAfford = cash >= upg.cost;

              return (
                <div
                  key={upg.id}
                  className={`flex flex-col justify-between rounded-2xl border p-5 transition-colors ${
                    owned
                      ? 'border-emerald-500/35 bg-[#142220]'
                      : upg.id === 'repair_bench'
                      ? 'border-amber-500/45 bg-[#1B222D]'
                      : 'border-white/10 bg-[#161E29]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#1E2938] shrink-0">
                          {UPGRADE_ICONS[upg.id]}
                        </div>
                        <div>
                          <h3 className="font-display text-lg font-bold text-slate-50">
                            {upg.name}
                          </h3>
                          {upg.highlightTag && !owned && (
                            <div className="text-[11px] font-semibold text-amber-400">
                              {upg.highlightTag} · Atölye Kilidini Açar
                            </div>
                          )}
                        </div>
                      </div>

                      {owned ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 whitespace-nowrap shrink-0">
                          <Check className="w-4 h-4" />
                          <span>Kuruldu</span>
                        </span>
                      ) : (
                        <span className="font-mono text-base font-bold text-amber-400 tabular-nums whitespace-nowrap shrink-0">
                          {formatTRY(upg.cost)}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed mb-3">
                      {upg.summary}
                    </p>
                    <p className="text-xs text-slate-400 border-t border-white/8 pt-3 mb-4">
                      Etki: <span className="text-slate-200">{upg.benefitText}</span>
                    </p>
                  </div>

                  {!owned && (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => onBuyUpgrade(upg.id)}
                      className="w-full rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {canAfford
                        ? `Satın Al (${formatTRY(upg.cost)})`
                        : `Yetersiz Kasa (${formatTRY(upg.cost - cash)} eksik)`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* SUB-TAB 2: SHOP EXPANSION (TIERS 1 -> 2 -> 3) */}
        {subTab === 'EXPANSION' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {([1, 2, 3] as ShopTier[]).map((t) => {
              const info = SHOP_TIERS[t];
              const isCurrent = shopTier === t;
              const isUnlocked = shopTier >= t;
              const isNext = t === shopTier + 1;
              const meetsRep = reputation >= info.minReputation;
              const canAfford = cash >= info.cost;

              return (
                <div
                  key={t}
                  className={`flex flex-col justify-between rounded-2xl border overflow-hidden ${
                    isCurrent
                      ? 'border-amber-500/60 bg-[#1A2330]'
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
                      <div className="absolute inset-0 bg-gradient-to-t from-[#161E29] via-transparent to-black/30" />
                      <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-amber-300">
                          Seviye {t}
                        </span>
                        <span className="font-semibold text-slate-100">
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
                        <div className="text-slate-200 font-medium">{info.unlocksText}</div>
                        <div>Taban Kira: {formatTRY(info.baseRent)} / gün</div>
                        {t > 1 && (
                          <div>
                            Gerekli İtibar:{' '}
                            <span
                              className={
                                meetsRep ? 'text-emerald-400 font-semibold' : 'text-rose-400'
                              }
                            >
                              {info.minReputation.toFixed(1)} / 5.0
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
                    ) : (
                      <button
                        type="button"
                        disabled={!isNext || !meetsRep || !canAfford}
                        onClick={() => onUpgradeShopTier(t)}
                        className="w-full rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {!isNext
                          ? `Önce Seviye ${t - 1} Açılmalı`
                          : !meetsRep
                          ? `İtibar ${info.minReputation.toFixed(1)} Gerekli`
                          : !canAfford
                          ? `Yetersiz Kasa`
                          : `Dükkanı Taşı (${formatTRY(info.cost)})`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* SUB-TAB 3: LIVE DECORATIONS & PRESTIGE */}
        {subTab === 'DECOR' && (
          <div>
            <div className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/8 px-4 py-3 text-xs text-amber-100 leading-relaxed">
              Satın aldığın her dekorasyon doğrudan <strong>Tezgah sahnesinde canlı olarak görünür</strong> ve dükkan prestijini yükselterek alıcıların bütçesini +%14’e kadar artırır!
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SHOP_DECORATIONS.map((dec) => {
                const owned = ownedDecorations.includes(dec.id);
                const active = activeDecorations.includes(dec.id);
                const canAfford = cash >= dec.cost;

                return (
                  <div
                    key={dec.id}
                    className={`flex flex-col justify-between rounded-2xl border p-5 ${
                      owned
                        ? 'border-amber-400/35 bg-[#19222C]'
                        : 'border-white/10 bg-[#161E29]'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2.5">
                          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                          <h3 className="font-display text-lg font-bold text-slate-50">
                            {dec.name}
                          </h3>
                        </div>
                        <span className="font-mono text-sm font-bold text-amber-400 tabular-nums whitespace-nowrap shrink-0">
                          +{dec.prestige} Prestij
                        </span>
                      </div>

                      <p className="text-sm text-slate-300 leading-relaxed mb-2.5">
                        {dec.summary}
                      </p>
                      <p className="text-xs text-slate-400 border-t border-white/8 pt-2.5 mb-4">
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
                        className="w-full rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap tabular-nums"
                      >
                        {canAfford
                          ? `Satın Al & As (${formatTRY(dec.cost)})`
                          : `Yetersiz Kasa (${formatTRY(dec.cost - cash)} eksik)`}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUB-TAB 4: STAFF (APPRENTICE, MASTER TECH & SALES REP + LEVELING) */}
        {subTab === 'STAFF' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SHOP_STAFF.map((member) => {
              const hired = hiredStaff.includes(member.id);
              const staffLvl = staffLevels?.[member.id] ?? 1;
              const trainCost = STAFF_TRAINING_COSTS[staffLvl] ?? 0;
              const canAfford = cash >= member.hireCost;
              const canTrain = hired && staffLvl < 3 && cash >= trainCost;

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
                        <h3 className="font-display text-xl font-bold text-slate-50">
                          {member.name}
                        </h3>
                        <div className="text-xs font-medium text-amber-400">
                          {member.role}
                        </div>
                      </div>

                      {hired ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 whitespace-nowrap shrink-0 tabular-nums">
                          <UserCheck className="w-4 h-4" />
                          <span>Sv. {staffLvl}/3</span>
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

                    <p className="text-sm text-slate-300 leading-relaxed mb-3 mt-2">
                      {member.summary}
                    </p>
                    <div className="text-xs text-slate-400 border-t border-white/8 pt-3 mb-4 space-y-1.5">
                      <div>
                        <strong className="text-slate-200">Sv.1:</strong> {member.benefitText}
                      </div>
                      <div className={staffLvl >= 2 && hired ? 'text-emerald-300' : ''}>
                        <strong>Sv.2:</strong> {member.level2Bonus}
                      </div>
                      <div className={staffLvl >= 3 && hired ? 'text-amber-300' : ''}>
                        <strong>Sv.3:</strong> {member.level3Bonus}
                      </div>
                    </div>
                  </div>

                  {hired ? (
                    <div className="space-y-2">
                      {staffLvl < 3 ? (
                        <button
                          type="button"
                          disabled={!canTrain}
                          onClick={() => onTrainStaff(member.id)}
                          className="w-full rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-amber-400 disabled:opacity-40 cursor-pointer tabular-nums"
                        >
                          Eğit & Seviye {staffLvl + 1} Yap ({formatTRY(trainCost)})
                        </button>
                      ) : (
                        <div className="rounded-xl border border-amber-400/35 bg-amber-500/12 py-2.5 text-center text-xs font-bold text-amber-300">
                          Usta Seviyesi Maksimum (3/3)
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
      </div>
    </div>
  );
};
