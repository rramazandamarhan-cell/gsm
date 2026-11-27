import React, { useEffect, useState } from 'react';
import { Lightbulb, X } from 'lucide-react';
import { useLanguage } from '../game/i18n';
import { soundFX } from '../game/sound';

export type GuidedTabId = 'WORKSHOP' | 'WHOLESALE' | 'EMPIRE' | 'MISSIONS' | 'UPGRADES';

const STORAGE_KEY = 'pasaj_gsm_seen_tab_tips_v1';

const TAB_TIPS: Record<
  GuidedTabId,
  { badgeTr: string; badgeEn: string; textTr: string; textEn: string }
> = {
  WORKSHOP: {
    badgeTr: 'Atölye İpucu',
    badgeEn: 'Workshop Tip',
    textTr:
      'Burada stoktaki kusurlu telefonları tamir edip değerini katlayabilir, satış fiyatını ayarlayıp vitrine çıkarabilirsin.',
    textEn:
      'Repair damaged phones in your stock to boost their value, set your markup, and list them for sale here.',
  },
  WHOLESALE: {
    badgeTr: 'Toptan İpucu',
    badgeEn: 'Supply Tip',
    textTr:
      'Toptancıdan kılıf, kırılmaz cam, yedek parça ve sıfır kapalı kutu cihaz sipariş ederek çapraz satış gelirini artırabilirsin.',
    textEn:
      'Order cases, screen protectors, spare parts, and sealed brand-new phones here to boost add-on profits.',
  },
  EMPIRE: {
    badgeTr: 'Piyasa İpucu',
    badgeEn: 'Market Tip',
    textTr:
      'Sarı ilanları yakala, şehir dışı kargo gönder, gümrük ihalelerine katıl; büyüdükçe yeni şube ve GSM Müzesi aç.',
    textEn:
      'Snipe classifieds, ship out-of-town orders, bid in customs auctions, and expand into city branches & a museum.',
  },
  MISSIONS: {
    badgeTr: 'Görev İpucu',
    badgeEn: 'Quests Tip',
    textTr:
      'Günlük görevleri, 12 bölümlü hikâye adımlarını ve kariyer hedeflerini tamamladıkça ödül nakit ve XP buradan toplanır.',
    textEn:
      'Collect bonus cash and XP here as you complete daily quests, 12 story chapters, and career milestones.',
  },
  UPGRADES: {
    badgeTr: 'Büyütme İpucu',
    badgeEn: 'Upgrade Tip',
    textTr:
      'Ekipman, lisans, dekor ve çırak/usta alarak dükkanını güçlendir; satın aldığın ekipmanlar dükkanda canlı görünür!',
    textEn:
      'Invest in equipment, licenses, decor, and staff here—upgraded gear appears live inside your shop!',
  },
};

function loadSeenTabs(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function resetSeenTabTips(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

interface TabFirstVisitTipProps {
  tab: GuidedTabId;
  resetSignal?: number;
}

export const TabFirstVisitTip: React.FC<TabFirstVisitTipProps> = ({
  tab,
  resetSignal = 0,
}) => {
  const { bi } = useLanguage();
  const [seenTabs, setSeenTabs] = useState<string[]>(() => loadSeenTabs());

  useEffect(() => {
    setSeenTabs(loadSeenTabs());
  }, [resetSignal]);

  if (seenTabs.includes(tab)) return null;

  const tip = TAB_TIPS[tab];

  const handleDismiss = () => {
    soundFX.playClick();
    const next = Array.from(new Set([...seenTabs, tab]));
    setSeenTabs(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <div className="shrink-0 border-b border-amber-400/30 bg-amber-500/12 safe-px py-0.5 flex items-center justify-between gap-1.5 text-[9.5px] text-amber-100 leading-tight">
      <div className="flex items-center gap-1 min-w-0">
        <Lightbulb className="w-3 h-3 text-amber-300 shrink-0" />
        <span className="shrink-0 rounded bg-amber-400/20 border border-amber-400/35 px-1 py-0 text-[8.5px] font-extrabold text-amber-200 whitespace-nowrap">
          {bi(tip.badgeTr, tip.badgeEn)}
        </span>
        <span className="truncate font-medium text-slate-100">
          {bi(tip.textTr, tip.textEn)}
        </span>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        className="shrink-0 inline-flex items-center gap-0.5 rounded border border-amber-400/40 bg-amber-500/20 px-1.5 py-0 text-[9px] font-extrabold text-amber-200 hover:bg-amber-500/30 cursor-pointer whitespace-nowrap touch-manipulation"
      >
        <span>{bi('Anladım', 'Got it')}</span>
        <X className="w-2.5 h-2.5" />
      </button>
    </div>
  );
};
