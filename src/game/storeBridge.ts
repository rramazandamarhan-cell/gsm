// Native Google Play / Apple App Store / Web PWA runtime bridge.
// Safely routes Haptics, StatusBar, ScreenOrientation, SplashScreen, Platform detection,
// and Store Review hooks without crashing in plain browser/PWA mode.

export type RuntimePlatform = 'android' | 'ios' | 'web';

interface CapacitorGlobal {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
  Plugins?: {
    Haptics?: {
      impact?: (opts: { style: 'LIGHT' | 'MEDIUM' | 'HEAVY' }) => Promise<void>;
      notification?: (opts: { type: 'SUCCESS' | 'WARNING' | 'ERROR' }) => Promise<void>;
    };
    InAppReview?: {
      requestReview?: () => Promise<void>;
    };
    StatusBar?: {
      hide?: () => Promise<void>;
      setStyle?: (opts: { style: 'DARK' | 'LIGHT' }) => Promise<void>;
      setBackgroundColor?: (opts: { color: string }) => Promise<void>;
    };
    SplashScreen?: {
      hide?: (opts?: { fadeOutDuration?: number }) => Promise<void>;
    };
    ScreenOrientation?: {
      lock?: (opts: { orientation: 'landscape' | 'landscape-primary' }) => Promise<void>;
    };
  };
}

const PUBLIC_SITE_ORIGIN = (
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env
    ?.VITE_PUBLIC_SITE_URL || 'https://graceful-llama-0f0053.netlify.app'
).replace(/\/+$/, '');

export const STORE_RELEASE_META = {
  appId: 'com.esnafgsm.simulator',
  versionName: '1.0.0',
  channelLabel: 'Play Store AAB & App Store Hazır',
  developerName: 'EsOra Mobile Studio',
  developerEmail: 'esoramobilestudio@gmail.com',
  privacyUrl: `${PUBLIC_SITE_ORIGIN}/privacy.html`,
  termsUrl: `${PUBLIC_SITE_ORIGIN}/terms.html`,
  supportEmail: 'esorastudiodestek@gmail.com',
} as const;

export function getCapacitor(): CapacitorGlobal | null {
  if (typeof window === 'undefined') return null;
  const cap = (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor;
  return cap ?? null;
}

export function getRuntimePlatform(): RuntimePlatform {
  const cap = getCapacitor();
  if (cap?.isNativePlatform?.()) {
    const p = cap.getPlatform?.();
    if (p === 'android') return 'android';
    if (p === 'ios') return 'ios';
  }
  return 'web';
}

export function getPlatformDisplayLabel(): string {
  const platform = getRuntimePlatform();
  if (platform === 'android') return 'Android Native (Google Play)';
  if (platform === 'ios') return 'iOS Native (App Store)';
  return 'Web / PWA Sürümü';
}

/**
 * Configures native mobile chrome on app launch (landscape lock, dark immersive status bar,
 * and smooth splash screen hide) so Apple App Store Guideline 4.2 native UX checks pass.
 */
export async function initNativeAppChrome(): Promise<void> {
  const plugins = getCapacitor()?.Plugins;
  if (!plugins) return;

  try {
    await plugins.ScreenOrientation?.lock?.({ orientation: 'landscape' });
  } catch {
    // Some tablets/split-screen modes ignore orientation lock
  }
  try {
    await plugins.StatusBar?.setStyle?.({ style: 'DARK' });
    await plugins.StatusBar?.setBackgroundColor?.({ color: '#0F141B' });
    await plugins.StatusBar?.hide?.();
  } catch {
    // Safe fallback
  }
  try {
    await plugins.SplashScreen?.hide?.({ fadeOutDuration: 280 });
  } catch {
    // Safe fallback
  }
}

export function triggerHaptic(
  enabled: boolean,
  style: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light'
): void {
  if (!enabled || typeof window === 'undefined') return;

  const haptics = getCapacitor()?.Plugins?.Haptics;
  if (haptics) {
    if (style === 'success' || style === 'warning' || style === 'error') {
      haptics
        .notification?.({
          type: style.toUpperCase() as 'SUCCESS' | 'WARNING' | 'ERROR',
        })
        .catch(() => {});
      return;
    }
    haptics
      .impact?.({ style: style.toUpperCase() as 'LIGHT' | 'MEDIUM' | 'HEAVY' })
      .catch(() => {});
    return;
  }

  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    const patternMap: Record<typeof style, number | number[]> = {
      light: 12,
      medium: 24,
      heavy: 40,
      success: [16, 45, 22],
      warning: [22, 35, 22],
      error: [35, 30, 50],
    };
    try {
      navigator.vibrate(patternMap[style]);
    } catch {
      // Ignore unsupported mobile browsers
    }
  }
}

export async function requestNativeStoreReview(): Promise<boolean> {
  const reviewPlugin = getCapacitor()?.Plugins?.InAppReview;
  if (reviewPlugin?.requestReview) {
    try {
      await reviewPlugin.requestReview();
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
