// Production-Ready AdMob Monetization Bridge (Rewarded Video + Low-Frequency Interstitial)
// - Native Android/iOS: routes directly to @capacitor-community/admob v7 native bridge
// - Web/PWA preview: triggers the in-app AdOverlayModal simulator so players & QA can test full flows
// - Explicit Rewarded Ad confirmation flow before launching any rewarded video (both Native & Web)
// - Low-frequency Interstitial pacing: automatic at day end once every 5–7 game days & >= 4 min cooldown

import { AdMob, AdmobConsentStatus } from '@capacitor-community/admob';
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

export interface AdStatusNotice {
  code: 'LOAD_FAILED' | 'OFFLINE' | 'BUSY';
  messageTr: string;
  messageEn: string;
}

const env =
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};

const TEST_PUBLISHER_PREFIX = 'ca-app-pub-3940256099942544';
const GOOGLE_ANDROID_TEST_REWARDED = 'ca-app-pub-3940256099942544/5224354917';
const GOOGLE_ANDROID_TEST_INTERSTITIAL = 'ca-app-pub-3940256099942544/1033173712';
const GOOGLE_IOS_TEST_REWARDED = 'ca-app-pub-3940256099942544/1712485313';
const GOOGLE_IOS_TEST_INTERSTITIAL = 'ca-app-pub-3940256099942544/4411468910';

const prodAndroidRewardedId =
  env.VITE_ADMOB_ANDROID_REWARDED || 'ca-app-pub-9402241323787415/6147015955';
const prodAndroidInterstitialId =
  env.VITE_ADMOB_ANDROID_INTERSTITIAL || 'ca-app-pub-9402241323787415/5265499923';
const prodIosRewardedId =
  env.VITE_ADMOB_IOS_REWARDED || GOOGLE_IOS_TEST_REWARDED;
const prodIosInterstitialId =
  env.VITE_ADMOB_IOS_INTERSTITIAL || GOOGLE_IOS_TEST_INTERSTITIAL;

const hasCustomProdUnit =
  !prodAndroidRewardedId.startsWith(TEST_PUBLISHER_PREFIX) ||
  !prodIosRewardedId.startsWith(TEST_PUBLISHER_PREFIX);

const isTestingMode =
  env.VITE_ADMOB_TESTING === 'true'
    ? true
    : env.VITE_ADMOB_TESTING === 'false'
    ? false
    : !hasCustomProdUnit;

// Automatically uses production ads with real AdMob Unit IDs unless VITE_ADMOB_TESTING='true'
// is explicitly set (e.g., Debug Test APK builds use official Google Test Ads).
export const ADMOB_CONFIG = {
  isTesting: isTestingMode,
  android: {
    rewardedId: isTestingMode ? GOOGLE_ANDROID_TEST_REWARDED : prodAndroidRewardedId,
    interstitialId: isTestingMode
      ? GOOGLE_ANDROID_TEST_INTERSTITIAL
      : prodAndroidInterstitialId,
  },
  ios: {
    rewardedId: isTestingMode ? GOOGLE_IOS_TEST_REWARDED : prodIosRewardedId,
    interstitialId: isTestingMode
      ? GOOGLE_IOS_TEST_INTERSTITIAL
      : prodIosInterstitialId,
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
let adMobInitPromise: Promise<boolean> | null = null;
let nativeAdInFlight = false;
let rewardedPrepared = false;
let interstitialPrepared = false;
let lastInterstitialShownAt = 0;
let lastInterstitialDayRuntime = 0;
let webAdListener: ((session: ActiveWebAdSession | null) => void) | null = null;
let adStatusListener: ((notice: AdStatusNotice) => void) | null = null;

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

function isNativeAdPlatform(): boolean {
  const platform = getRuntimePlatform();
  return platform === 'android' || platform === 'ios';
}

function getRewardedAdUnitId(): string {
  const platform = getRuntimePlatform();
  return platform === 'ios'
    ? ADMOB_CONFIG.ios.rewardedId
    : ADMOB_CONFIG.android.rewardedId;
}

function getInterstitialAdUnitId(): string {
  const platform = getRuntimePlatform();
  return platform === 'ios'
    ? ADMOB_CONFIG.ios.interstitialId
    : ADMOB_CONFIG.android.interstitialId;
}

export function registerWebAdOverlayListener(
  cb: ((session: ActiveWebAdSession | null) => void) | null
): void {
  webAdListener = cb;
}

export function registerAdStatusListener(
  cb: ((notice: AdStatusNotice) => void) | null
): void {
  adStatusListener = cb;
}

async function preloadRewardedAd(): Promise<void> {
  if (!adMobInitialized || !isNativeAdPlatform() || rewardedPrepared) return;
  try {
    await AdMob.prepareRewardVideoAd({
      adId: getRewardedAdUnitId(),
      isTesting: ADMOB_CONFIG.isTesting,
    });
    rewardedPrepared = true;
  } catch {
    rewardedPrepared = false;
  }
}

async function preloadInterstitialAd(): Promise<void> {
  if (!adMobInitialized || !isNativeAdPlatform() || interstitialPrepared) return;
  try {
    await AdMob.prepareInterstitial({
      adId: getInterstitialAdUnitId(),
      isTesting: ADMOB_CONFIG.isTesting,
    });
    interstitialPrepared = true;
  } catch {
    interstitialPrepared = false;
  }
}

/**
 * Safely initializes AdMob & UMP/GDPR consent on native Android/iOS builds.
 * Retries automatically if an earlier attempt failed (e.g. launched offline).
 */
export async function initializeAdService(): Promise<boolean> {
  if (!isNativeAdPlatform()) return false;
  if (adMobInitialized) return true;
  if (adMobInitPromise) return adMobInitPromise;

  adMobInitPromise = (async () => {
    try {
      await AdMob.initialize({
        initializeForTesting: ADMOB_CONFIG.isTesting,
      });
      adMobInitialized = true;

      // Request UMP/GDPR consent in isolated try/catch so missing consent forms never break ads
      try {
        const consent = await AdMob.requestConsentInfo();
        if (
          consent?.isConsentFormAvailable &&
          consent.status === AdmobConsentStatus.REQUIRED
        ) {
          await AdMob.showConsentForm();
        }
      } catch {
        // Ignore if UMP consent message is not configured or unavailable
      }

      // Warm up ad inventory in the background
      void preloadRewardedAd();
      void preloadInterstitialAd();
      return true;
    } catch {
      adMobInitialized = false;
      return false;
    } finally {
      adMobInitPromise = null;
    }
  })();

  return adMobInitPromise;
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

  if (isNativeAdPlatform()) {
    webAdListener?.(null);
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      adStatusListener?.({
        code: 'OFFLINE',
        messageTr: 'Reklam için internet bağlantısı gerekiyor.',
        messageEn: 'Internet connection is required to load ads.',
      });
      return false;
    }
    if (nativeAdInFlight) {
      adStatusListener?.({
        code: 'BUSY',
        messageTr: 'Reklam yükleniyor, lütfen kısa süre bekle.',
        messageEn: 'An ad is already loading, please wait.',
      });
      return false;
    }

    const ready = await initializeAdService();
    if (!ready) {
      adStatusListener?.({
        code: 'LOAD_FAILED',
        messageTr: 'Reklam servisi başlatılamadı. Birazdan tekrar dene.',
        messageEn: 'Ad service could not initialize. Please try again shortly.',
      });
      return false;
    }

    nativeAdInFlight = true;
    const adId = getRewardedAdUnitId();
    soundFX.setAdSuspended(true);
    try {
      if (!rewardedPrepared) {
        await AdMob.prepareRewardVideoAd({
          adId,
          isTesting: ADMOB_CONFIG.isTesting,
        });
        rewardedPrepared = true;
      }
      rewardedPrepared = false;
      const reward = await AdMob.showRewardVideoAd();
      return Boolean(reward);
    } catch {
      rewardedPrepared = false;
      adStatusListener?.({
        code: 'LOAD_FAILED',
        messageTr: 'Şu an gösterilecek uygun reklam bulunamadı. Birazdan tekrar dene.',
        messageEn: 'No ad available right now. Please try again in a moment.',
      });
      return false;
    } finally {
      soundFX.setAdSuspended(false);
      nativeAdInFlight = false;
      void preloadRewardedAd();
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

  const nextScheduled = pickNextInterstitialDay(completedDay);

  if (isNativeAdPlatform()) {
    if (nativeAdInFlight || (typeof navigator !== 'undefined' && navigator.onLine === false)) {
      return {
        shown: false,
        lastInterstitialDay: currentLast,
        nextInterstitialDay: currentNext,
      };
    }

    const ready = await initializeAdService();
    if (!ready) {
      return {
        shown: false,
        lastInterstitialDay: currentLast,
        nextInterstitialDay: currentNext,
      };
    }

    nativeAdInFlight = true;
    const adId = getInterstitialAdUnitId();
    soundFX.setAdSuspended(true);
    try {
      if (!interstitialPrepared) {
        await AdMob.prepareInterstitial({
          adId,
          isTesting: ADMOB_CONFIG.isTesting,
        });
        interstitialPrepared = true;
      }
      interstitialPrepared = false;
      await AdMob.showInterstitial();
      lastInterstitialShownAt = Date.now();
      lastInterstitialDayRuntime = completedDay;
      return {
        shown: true,
        lastInterstitialDay: completedDay,
        nextInterstitialDay: nextScheduled,
      };
    } catch {
      interstitialPrepared = false;
      return {
        shown: false,
        lastInterstitialDay: currentLast,
        nextInterstitialDay: currentNext,
      };
    } finally {
      soundFX.setAdSuspended(false);
      nativeAdInFlight = false;
      void preloadInterstitialAd();
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
        lastInterstitialShownAt = Date.now();
        lastInterstitialDayRuntime = completedDay;
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
