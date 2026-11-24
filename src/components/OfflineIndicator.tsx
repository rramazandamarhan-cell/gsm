import React from 'react';
import { WifiOff } from 'lucide-react';
import { useLanguage } from '../game/i18n';
import { useOnlineStatus } from '../hooks/usePWAInstall';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { bi } = useLanguage();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-2.5 left-2.5 z-50 flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-[#1A222E]/95 px-3 py-1.5 text-[11px] font-semibold text-amber-200 shadow-xl">
      <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      <span>
        {bi(
          'Çevrimdışı Mod — İlerlemen cihazına kaydediliyor',
          'Offline Mode — Progress saved locally on device'
        )}
      </span>
    </div>
  );
};
