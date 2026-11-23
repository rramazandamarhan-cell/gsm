import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/usePWAInstall';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl border border-amber-400/40 bg-[#1A222E]/95 px-3.5 py-2 text-xs font-semibold text-amber-200 shadow-xl">
      <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      <span>Çevrimdışı Mod — İlerlemen cihazına kaydediliyor</span>
    </div>
  );
};
