import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'hero' | 'compact';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'compact',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      {variant === 'hero' ? (
        <button
          type="button"
          onClick={handleClick}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/35 bg-emerald-500/15 px-5 py-3 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/25 active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4 text-emerald-300" />
          <span>
            {isInstallable
              ? 'Telefona Uygulama Olarak Kur'
              : 'Telefona Kur / Mobil Rehber'}
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          title="GSM Simulator'ı telefona tam ekran uygulama olarak kur"
          className="inline-flex items-center gap-1.5 h-9 rounded-lg border border-emerald-500/35 bg-emerald-500/15 px-2.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/25 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-emerald-300" />
          <span className="hidden sm:inline">Telefona Kur</span>
        </button>
      )}

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 text-left">
          <div className="w-full max-w-md rounded-2xl border border-white/12 bg-[#161E29] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-400/30">
                  <Smartphone className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-50">
                    GSM Simulator’ı Telefona Kur
                  </h3>
                  <p className="text-xs text-slate-400">
                    Tam ekran, çevrimdışı destekli & ana ekran ikonlu
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="Kapat"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#1F2A38] text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              {isIOS ? (
                <div className="rounded-xl border border-white/10 bg-[#101720] p-3.5">
                  <div className="font-bold text-amber-300 mb-1">
                    iPhone / iPad (Safari)
                  </div>
                  <p>
                    1. Alt menüdeki <strong>Paylaş</strong> simgesine dokun.
                    <br />
                    2. Aşağı kaydırıp <strong>Ana Ekrana Ekle</strong> seçeneğini seç.
                    <br />
                    3. Sağ üstten <strong>Ekle</strong> de; oyun tam ekran uygulama olarak açılır!
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/8 p-3.5">
                  <div className="font-bold text-emerald-300 mb-1">
                    Android (Chrome ile Anında WebAPK Kurulumu)
                  </div>
                  <p>
                    1. Paylaşım bağlantısını telefonunda <strong>Chrome</strong> tarayıcısında aç.
                    <br />
                    2. Sağ üstteki <strong>⋮ (Üç Nokta)</strong> menüsüne dokun.
                    <br />
                    3. <strong>“Uygulamayı yükle”</strong> veya{' '}
                    <strong>“Ana ekrana ekle”</strong> seçeneğine tıkla.
                    <br />
                    Android oyunu gerçek bir uygulama (WebAPK) gibi telefonuna kurar; internetsiz bile oynayabilirsin!
                  </p>
                </div>
              )}

              <div className="rounded-xl border border-white/10 bg-[#101720] p-3.5">
                <div className="font-bold text-sky-300 mb-1">
                  Doğrudan Çevrimdışı .APK Dosyası İndir (Otomatik)
                </div>
                <p>
                  Projeyi <strong>Save to GitHub</strong> ile GitHub hesabına aktardığında{' '}
                  <strong>Actions → Build Android APK</strong> otomatik çalışır ve 2 dakikada
                  internetsiz çalışan <strong>GSM-Simulator-Android.apk</strong> dosyasını hazırlar.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer"
            >
              Anladım
            </button>
          </div>
        </div>
      )}
    </>
  );
};
