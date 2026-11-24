// Native Google Play / Apple App Store / Web PWA runtime bridge.
// Safely routes Haptics, Platform detection, and Store Review hooks without crashing in plain browser mode.

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
  };
}

export const STORE_RELEASE_META = {
  appId: 'com.esnafgsm.simulator',
  versionName: '2.2.0',
  channelLabel: 'Play Store AAB & App Store Hazır',
  privacyUrl: '/privacy.html',
  termsUrl: '/terms.html',
} as const;

function getCapacitor(): CapacitorGlobal | null {
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

export function triggerHaptic(
  enabled: boolean,
  style: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light'
): void {
  if (!enabled || typeof window === 'undefined') return;

  const haptics = getCapacitor()?.Plugins?.Haptics;
  if (haptics) {
    if (style === 'success' || style === 'warning' || style === 'error') {
      haptics.notification?.({ type: style.toUpperCase() as 'SUCCESS' | 'WARNING' | 'ERROR' }).catch(() => {});
      return;
    }
    haptics.impact?.({ style: style.toUpperCase() as 'LIGHT' | 'MEDIUM' | 'HEAVY' }).catch(() => {});
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
