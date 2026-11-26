// Production-Ready AdMob Monetization Bridge (Rewarded Video + Low-Frequency Interstitial)
// - Native Android/iOS: routes directly to @capacitor-community/admob when installed in native wrapper
// - Web/PWA preview: triggers the in-app AdOverlayModal simulator so players & QA can test full flows
// - Explicit Rewarded Ad confirmation flow before launching any rewarded video (both Native & Web)
// - Low-frequency Interstitial pacing: automatic at day end once every 5–7 game days & >= 4 min cooldown

import { soundFX } from './sound';
import { getRuntimePlatform } from './storeBridge';
import { AdMonetizationState } from './types';

export type RewardedAdPlacement =
  | 'CASH_2X_MULTIPLIER_REWARDED'
  | 'PASSIVE_INCOME_2X_REWARDED'
  | 'OFFLINE_2X_REWARDED'
  | 'DAILY_STREAK_2X_REWARDED'
  | 'DAY_BONUS_REWARDED';

export type AdPlacement = RewardedAdPlacement | 'END_OF_DAY_INTERSTITIAL';

export interface ActiveWebAdSession {
  id: string;
  mode: 'REWARDED_CONFIRM' | 'REWARDED' | 'INTERSTITIAL';
  placement: AdPlacement;
  durationSec: number;
  rewardLabelTr: string;
  rewardLabelEn: string;
  detailTr?: string;
  detailEn?: string;
  multiplierBadge?: string;
  resolve: (completed: boolean) => void;
}

interface CapacitorAdMobPlugin {
  initialize?: (opts?: {
    initializeForTesting?: boolean;
    testingDevices?: string[];
  }) => Promise<void>;
  requestConsentInfo?: () => Promise<{
    status?: 'REQUIRED' | 'OBTAINED' | 'NOT_REQUIRED' | 'UNKNOWN' | string;
    isConsentFormAvailable?: boolean;
  }>;
  showConsentForm?: () => Promise<void>;
  prepareRewardVideoAd?: (opts: { adId: string; isTesting?: boolean }) => Promise<void>;
  showRewardVideoAd?: () => Promise<{ type?: string; amount?: number }>;
  prepareInterstitial?: (opts: { adId: string; isTesting?: boolean }) => Promise<void>;
  showInterstitial?: () => Promise<void>;
}

const env =
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};

const TEST_PUBLISHER_PREFIX = 'ca-app-pub-3940256099942544';
const androidRewardedId =
  env.VITE_ADMOB_ANDROID_REWARDED || 'ca-app-pub-9402241323787415/6147015955';
const androidInterstitialId =
  env.VITE_ADMOB_ANDROID_INTERSTITIAL || 'ca-app-pub-9402241323787415/5265499923';
const iosRewardedId =
  env.VITE_ADMOB_IOS_REWARDED || 'ca-app-pub-3940256099942544/1712485313';
const iosInterstitialId =
  env.VITE_ADMOB_IOS_INTERSTITIAL || 'ca-app-pub-3940256099942544/4411468910';

const hasCustomProdUnit =
  !androidRewardedId.startsWith(TEST_PUBLISHER_PREFIX) ||
  !iosRewardedId.startsWith(TEST_PUBLISHER_PREFIX);

// Automatically switches to production ads once real AdMob Unit IDs are provided in .env,
// unless VITE_ADMOB_TESTING='true' is explicitly set for local QA.
export const ADMOB_CONFIG = {
  isTesting:
    env.VITE_ADMOB_TESTING === 'true'
      ? true
      : env.VITE_ADMOB_TESTING === 'false'
      ? false
      : !hasCustomProdUnit,
  android: {
    rewardedId: androidRewardedId,
    interstitialId: androidInterstitialId,
  },
  ios: {
    rewardedId: iosRewardedId,
    interstitialId: iosInterstitialId,
  },
} as const;

// Low-Frequency, Player-Friendly Ad Pacing Rules
export const AD_PACING_RULES = {
  /** Minimum in-game days between end-of-day interstitial ads (5 days; zero ads Days 1-4) */
  interstitialMinDays: 5,
  /** Maximum in-game days between end-of-day interstitial ads (7 days) */
  interstitialMaxDays: 7,
  /** Minimum 4 minutes real-world cooldown between interstitials */
  interstitialMinCooldownMs: 4 * 60 * 1000,
  /** Number of consecutive sales/services covered by a 2x Cash Rewarded Ad boost */
  cashMultiplierDealsGrant: 3,
} as const;

let adMobInitialized = false;
let nativeAdInFlight = false;
let lastInterstitialShownAt = 0;
let lastInterstitialDayRuntime = 0;
let webAdListener: ((session: ActiveWebAdSession | null) => void) | null = null;

/**
 * Picks the next low-frequency interstitial target day, 5 to 7 in-game days after `fromDay`.
 */
export function pickNextInterstitialDay(fromDay: number): number {
  const span =
    AD_PACING_RULES.interstitialMaxDays - AD_PACING_RULES.interstitialMinDays + 1;
  const offset = AD_PACING_RULES.interstitialMinDays + Math.floor(Math.random() * span);
  return Math.max(AD_PACING_RULES.interstitialMinDays, fromDay + offset);
}

/**
 * Creates a clean default AdMonetizationState persisted inside ShopState.
 */
export function createDefaultAdState(currentDay = 0): AdMonetizationState {
  return {
    cashMultiplier: 1,
    cashMultiplierDealsLeft: 0,
    passiveIncome2xDay: 0,
    nextInterstitialDay: pickNextInterstitialDay(currentDay),
    lastInterstitialDay: 0,
    totalRewardedAdsWatched: 0,
    totalInterstitialsShown: 0,
  };
}

/**
 * Normalizes/hydrates optional adState from older saved games without losing progress.
 */
export function normalizeAdState(
  raw: Partial<AdMonetizationState> | undefined,
  currentDay: number
): AdMonetizationState {
  const fallbackNext = pickNextInterstitialDay(Math.max(0, currentDay));
  const rawDealsLeft = Math.max(0, Math.floor(raw?.cashMultiplierDealsLeft ?? 0));
  const multiplier: 1 | 2 = raw?.cashMultiplier === 2 && rawDealsLeft > 0 ? 2 : 1;
  return {
    cashMultiplier: multiplier,
    cashMultiplierDealsLeft: multiplier === 2 ? rawDealsLeft : 0,
    passiveIncome2xDay: raw?.passiveIncome2xDay ?? 0,
    nextInterstitialDay:
      typeof raw?.nextInterstitialDay === 'number' &&
      raw.nextInterstitialDay >= AD_PACING_RULES.interstitialMinDays
        ? raw.nextInterstitialDay
        : fallbackNext,
    lastInterstitialDay: raw?.lastInterstitialDay ?? 0,
    totalRewardedAdsWatched: raw?.totalRewardedAdsWatched ?? 0,
    totalInterstitialsShown: raw?.totalInterstitialsShown ?? 0,
  };
}

function getNativeAdMob(): CapacitorAdMobPlugin | null {
  if (typeof window === 'undefined') return null;
  const cap = (
    window as unknown as {
      Capacitor?: { Plugins?: { AdMob?: CapacitorAdMobPlugin } };
    }
  ).Capacitor;
  return cap?.Plugins?.AdMob ?? null;
}

export function registerWebAdOverlayListener(
  cb: ((session: ActiveWebAdSession | null) => void) | null
): void {
  webAdListener = cb;
}

/**
 * Safely initializes AdMob & UMP/GDPR consent on native Android/iOS builds.
 */
export async function initializeAdService(): Promise<void> {
  if (adMobInitialized) return;
  const admob = getNativeAdMob();
  if (!admob) {
    adMobInitialized = true;
    return;
  }
  try {
    await admob.initialize?.({
      initializeForTesting: ADMOB_CONFIG.isTesting,
    });
    const consent = await admob.requestConsentInfo?.();
    if (
      consent?.isConsentFormAvailable &&
      (!consent.status || consent.status === 'REQUIRED')
    ) {
      await admob.showConsentForm?.();
    }
  } catch {
    // Never block gameplay if offline or consent unavailable
  } finally {
    adMobInitialized = true;
  }
}

/**
 * Shows an explicit in-game confirmation dialog before launching a Rewarded Ad.
 * Ensures transparent opt-in across both Native AdMob and Web/PWA builds.
 */
function confirmRewardedAdOptIn(opts: {
  placement: RewardedAdPlacement;
  rewardLabelTr: string;
  rewardLabelEn: string;
  detailTr?: string;
  detailEn?: string;
  multiplierBadge?: string;
}): Promise<boolean> {
  if (!webAdListener) return Promise.resolve(true);
  return new Promise<boolean>((resolve) => {
    webAdListener?.({
      id: `ad_confirm_${Date.now()}`,
      mode: 'REWARDED_CONFIRM',
      placement: opts.placement,
      durationSec: 5,
      rewardLabelTr: opts.rewardLabelTr,
      rewardLabelEn: opts.rewardLabelEn,
      detailTr: opts.detailTr,
      detailEn: opts.detailEn,
      multiplierBadge: opts.multiplierBadge,
      resolve: (confirmed) => {
        if (!confirmed) {
          webAdListener?.(null);
        }
        resolve(confirmed);
      },
    });
  });
}

/**
 * Checks whether an end-of-day interstitial ad is eligible under low-frequency 5–7 day pacing.
 */
export function shouldShowEndOfDayInterstitial(
  completedDay: number,
  adState?: Partial<AdMonetizationState>,
  adsRemoved = false
): boolean {
  if (adsRemoved) return false;
  if (completedDay < AD_PACING_RULES.interstitialMinDays) return false;

  const lastDay = Math.max(
    lastInterstitialDayRuntime,
    adState?.lastInterstitialDay ?? 0
  );
  if (completedDay === lastDay) return false;

  const scheduledDay =
    typeof adState?.nextInterstitialDay === 'number' &&
    adState.nextInterstitialDay >= AD_PACING_RULES.interstitialMinDays
      ? adState.nextInterstitialDay
      : AD_PACING_RULES.interstitialMinDays;

  if (completedDay < scheduledDay) return false;
  if (lastDay > 0 && completedDay - lastDay < AD_PACING_RULES.interstitialMinDays) {
    return false;
  }

  const now = Date.now();
  if (
    lastInterstitialShownAt > 0 &&
    now - lastInterstitialShownAt < AD_PACING_RULES.interstitialMinCooldownMs
  ) {
    return false;
  }
  return true;
}

/**
 * Displays a Rewarded Video Ad with an explicit player confirmation step first.
 * Resolves true ONLY if the player confirmed AND completed watching the ad.
 */
export async function showRewardedAd(opts: {
  placement: RewardedAdPlacement;
  rewardLabelTr: string;
  rewardLabelEn: string;
  detailTr?: string;
  detailEn?: string;
  multiplierBadge?: string;
  skipConfirmation?: boolean;
}): Promise<boolean> {
  if (!opts.skipConfirmation) {
    const confirmed = await confirmRewardedAdOptIn(opts);
    if (!confirmed) return false;
  }

  await initializeAdService();
  const platform = getRuntimePlatform();
  const admob = getNativeAdMob();

  if (admob && (platform === 'android' || platform === 'ios')) {
    if (nativeAdInFlight) return false;
    nativeAdInFlight = true;
    webAdListener?.(null);
    const adId =
      platform === 'ios'
        ? ADMOB_CONFIG.ios.rewardedId
        : ADMOB_CONFIG.android.rewardedId;
    soundFX.setAdSuspended(true);
    try {
      await admob.prepareRewardVideoAd?.({
        adId,
        isTesting: ADMOB_CONFIG.isTesting,
      });
      const reward = await admob.showRewardVideoAd?.();
      return Boolean(reward);
    } catch {
      return false;
    } finally {
      soundFX.setAdSuspended(false);
      nativeAdInFlight = false;
    }
  }

  // Web / PWA interactive rewarded ad preview overlay (5s countdown)
  if (!webAdListener) return true;
  return new Promise<boolean>((resolve) => {
    webAdListener?.({
      id: `ad_${Date.now()}`,
      mode: 'REWARDED',
      placement: opts.placement,
      durationSec: 5,
      rewardLabelTr: opts.rewardLabelTr,
      rewardLabelEn: opts.rewardLabelEn,
      detailTr: opts.detailTr,
      detailEn: opts.detailEn,
      multiplierBadge: opts.multiplierBadge,
      resolve: (completed) => {
        webAdListener?.(null);
        resolve(completed);
      },
    });
  });
}

export interface EndOfDayInterstitialResult {
  shown: boolean;
  lastInterstitialDay: number;
  nextInterstitialDay: number;
}

/**
 * Displays a low-frequency Interstitial Ad automatically at the end of every 5–7 game days.
 * Returns updated schedule metadata so App.tsx can persist it inside ShopState.adState.
 */
export async function maybeShowEndOfDayInterstitial(
  completedDay: number,
  adState?: Partial<AdMonetizationState>,
  adsRemoved = false
): Promise<EndOfDayInterstitialResult> {
  const currentLast = adState?.lastInterstitialDay ?? 0;
  const currentNext =
    adState?.nextInterstitialDay ?? pickNextInterstitialDay(Math.max(0, completedDay));

  if (!shouldShowEndOfDayInterstitial(completedDay, adState, adsRemoved)) {
    return {
      shown: false,
      lastInterstitialDay: currentLast,
      nextInterstitialDay: currentNext,
    };
  }

  await initializeAdService();
  const nextScheduled = pickNextInterstitialDay(completedDay);
  lastInterstitialShownAt = Date.now();
  lastInterstitialDayRuntime = completedDay;

  const platform = getRuntimePlatform();
  const admob = getNativeAdMob();

  if (admob && (platform === 'android' || platform === 'ios')) {
    if (nativeAdInFlight) {
      return {
        shown: false,
        lastInterstitialDay: currentLast,
        nextInterstitialDay: currentNext,
      };
    }
    nativeAdInFlight = true;
    const adId =
      platform === 'ios'
        ? ADMOB_CONFIG.ios.interstitialId
        : ADMOB_CONFIG.android.interstitialId;
    soundFX.setAdSuspended(true);
    try {
      await admob.prepareInterstitial?.({
        adId,
        isTesting: ADMOB_CONFIG.isTesting,
      });
      await admob.showInterstitial?.();
      return {
        shown: true,
        lastInterstitialDay: completedDay,
        nextInterstitialDay: nextScheduled,
      };
    } catch {
      return {
        shown: false,
        lastInterstitialDay: currentLast,
        nextInterstitialDay: currentNext,
      };
    } finally {
      soundFX.setAdSuspended(false);
      nativeAdInFlight = false;
    }
  }

  // Web / PWA fallback brief skippable break (3s) when native AdMob SDK is not present
  if (!webAdListener) {
    return {
      shown: false,
      lastInterstitialDay: currentLast,
      nextInterstitialDay: currentNext,
    };
  }
  return new Promise<EndOfDayInterstitialResult>((resolve) => {
    webAdListener?.({
      id: `ad_${Date.now()}`,
      mode: 'INTERSTITIAL',
      placement: 'END_OF_DAY_INTERSTITIAL',
      durationSec: 3,
      rewardLabelTr: `Gün ${completedDay} Sonu Kısa Reklam Arası`,
      rewardLabelEn: `Day ${completedDay} End Short Break`,
      detailTr: `Teşekkürler! Bir sonraki reklam arası en erken Gün ${nextScheduled} bitiminde gösterilir.`,
      detailEn: `Thanks for playing! Next ad break won't appear before Day ${nextScheduled} ends.`,
      resolve: () => {
        webAdListener?.(null);
        resolve({
          shown: true,
          lastInterstitialDay: completedDay,
          nextInterstitialDay: nextScheduled,
        });
      },
    });
  });
}
