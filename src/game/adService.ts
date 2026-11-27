// Production-Ready AdMob Monetization Bridge (Banner + Rewarded Video + Low-Frequency Interstitial)
// - Native Android/iOS: routes directly to @capacitor-community/admob v7 native bridge
// - Web/PWA preview: triggers the in-app AdOverlayModal simulator so players & QA can test full flows
// - Safe Test vs. Production separation: defaults to Google official test IDs until production is explicitly enabled
// - Event-driven native lifecycle (Loaded, FailedToLoad, Showed, FailedToShow, Dismissed, Rewarded, SizeChanged)
//   so early-dismissed Rewarded ads never hang, Interstitial audio stays muted until dismissed,
//   and Banner ads never leave empty layout space on failure.

import {
  AdMob,
  AdmobConsentStatus,
  BannerAdPluginEvents,
  BannerAdPosition,
  BannerAdSize,
  InterstitialAdPluginEvents,
  RewardAdPluginEvents,
} from '@capacitor-community/admob';
import { soundFX } from './sound';
import { getRuntimePlatform } from './storeBridge';
import { AdMonetizationState } from './types';

export type AdMobEnvironmentMode = 'test' | 'production';

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

export interface AdDiagnosticsSnapshot {
  mode: AdMobEnvironmentMode;
  platform: string;
  initialized: boolean;
  appId: string;
  unitIds: {
    banner: string;
    interstitial: string;
    rewarded: string;
  };
  testingDevices: string[];
  banner: {
    mounted: boolean;
    visible: boolean;
    height: number;
    lastEvent: string;
    lastError: string | null;
  };
  interstitial: {
    prepared: boolean;
    loading: boolean;
    lastEvent: string;
    lastError: string | null;
  };
  rewarded: {
    prepared: boolean;
    loading: boolean;
    lastEvent: string;
    lastError: string | null;
  };
  inFlight: boolean;
}

const env =
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};

// Official Google AdMob Test IDs & Preserved Real Production IDs
// NEVER delete the real production IDs; switch mode via VITE_ADMOB_MODE ('test' | 'production')
export const ADMOB_ID_CATALOG = {
  test: {
    android: {
      appId: 'ca-app-pub-3940256099942544~3347511713',
      bannerId: 'ca-app-pub-3940256099942544/6300978111',
      interstitialId: 'ca-app-pub-3940256099942544/1033173712',
      rewardedId: 'ca-app-pub-3940256099942544/5224354917',
    },
    ios: {
      appId: 'ca-app-pub-3940256099942544~1458002511',
      bannerId: 'ca-app-pub-3940256099942544/2934735716',
      interstitialId: 'ca-app-pub-3940256099942544/4411468910',
      rewardedId: 'ca-app-pub-3940256099942544/1712485313',
    },
  },
  production: {
    android: {
      appId: env.VITE_ADMOB_ANDROID_APP_ID || 'ca-app-pub-9402241323787415~3281325258',
      bannerId: env.VITE_ADMOB_ANDROID_BANNER || '',
      interstitialId:
        env.VITE_ADMOB_ANDROID_INTERSTITIAL || 'ca-app-pub-9402241323787415/5265499923',
      rewardedId:
        env.VITE_ADMOB_ANDROID_REWARDED || 'ca-app-pub-9402241323787415/6147015955',
    },
    ios: {
      appId: env.VITE_ADMOB_IOS_APP_ID || '',
      bannerId: env.VITE_ADMOB_IOS_BANNER || '',
      interstitialId: env.VITE_ADMOB_IOS_INTERSTITIAL || '',
      rewardedId: env.VITE_ADMOB_IOS_REWARDED || '',
    },
  },
} as const;

// Safe default: stays in 'test' mode until 'production' is explicitly requested via env.
const DEFAULT_ADMOB_MODE: AdMobEnvironmentMode = 'test';

function resolveAdMobMode(): AdMobEnvironmentMode {
  const explicitMode = env.VITE_ADMOB_MODE?.trim().toLowerCase();
  if (explicitMode === 'production' || explicitMode === 'prod') return 'production';
  if (explicitMode === 'test' || explicitMode === 'testing') return 'test';

  if (env.VITE_ADMOB_TESTING === 'false') return 'production';
  if (env.VITE_ADMOB_TESTING === 'true') return 'test';

  return DEFAULT_ADMOB_MODE;
}

function parseTestingDevices(): string[] {
  const raw = env.VITE_ADMOB_TEST_DEVICES;
  if (!raw) return [];
  return raw
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

const activeMode: AdMobEnvironmentMode = resolveAdMobMode();
const isTestingMode = activeMode === 'test';
const activeIds = ADMOB_ID_CATALOG[activeMode];
const configuredTestingDevices = parseTestingDevices();

export const ADMOB_CONFIG = {
  mode: activeMode,
  isTesting: isTestingMode,
  testingDevices: configuredTestingDevices,
  android: {
    appId: activeIds.android.appId,
    bannerId: activeIds.android.bannerId,
    interstitialId: activeIds.android.interstitialId,
    rewardedId: activeIds.android.rewardedId,
  },
  ios: {
    appId: activeIds.ios.appId,
    bannerId: activeIds.ios.bannerId,
    interstitialId: activeIds.ios.interstitialId,
    rewardedId: activeIds.ios.rewardedId,
  },
} as const;

// Low-Frequency, Player-Friendly Ad Pacing Rules (preserved 100% for production)
export const AD_PACING_RULES = {
  /** Minimum in-game days between end-of-day interstitial ads (5 days; zero ads Days 1-4) */
  interstitialMinDays: 5,
  /** Maximum in-game days between end-of-day interstitial ads (7 days) */
  interstitialMaxDays: 7,
  /** Minimum 4 minutes real-world cooldown between interstitials */
  interstitialMinCooldownMs: 4 * 60 * 1000,
  /** In test mode only, shorter cooldown so QA can verify interstitials cleanly */
  testInterstitialCooldownMs: 45 * 1000,
  /** Number of consecutive sales/services covered by a 2x Cash Rewarded Ad boost */
  cashMultiplierDealsGrant: 3,
} as const;

const RETRY_DELAYS_MS = [3000, 8000, 20000];
const INITIAL_PRELOAD_SETTLE_MS = 350;
const PREPARE_TIMEOUT_MS = 18000;
const FULLSCREEN_SAFETY_TIMEOUT_MS = 120000;

let adMobInitialized = false;
let adMobInitPromise: Promise<boolean> | null = null;
let listenersAttached = false;
let onlineListenerAttached = false;
let nativeAdInFlight = false;

let rewardedPrepared = false;
let rewardedLoadPromise: Promise<boolean> | null = null;
let rewardedRetryCount = 0;
let rewardedRetryTimer: ReturnType<typeof setTimeout> | null = null;
let rewardedLastEvent = 'idle';
let rewardedLastError: string | null = null;

let interstitialPrepared = false;
let interstitialLoadPromise: Promise<boolean> | null = null;
let interstitialRetryCount = 0;
let interstitialRetryTimer: ReturnType<typeof setTimeout> | null = null;
let interstitialLastEvent = 'idle';
let interstitialLastError: string | null = null;

let bannerMounted = false;
let bannerVisible = false;
let bannerWanted = false;
let bannerLoading = false;
let bannerHeightPx = 0;
let bannerRetryCount = 0;
let bannerRetryTimer: ReturnType<typeof setTimeout> | null = null;
let bannerLastEvent = 'idle';
let bannerLastError: string | null = null;

let lastInterstitialShownAt = 0;
let lastInterstitialDayRuntime = 0;

let webAdListener: ((session: ActiveWebAdSession | null) => void) | null = null;
let adStatusListener: ((notice: AdStatusNotice) => void) | null = null;
const bannerHeightSubscribers = new Set<(height: number) => void>();

// Active native fullscreen ad completion hooks driven by SDK events
let activeRewardedFlow: {
  earned: boolean;
  finish: (earned: boolean) => void;
} | null = null;

let activeInterstitialFlow: {
  finish: (shown: boolean) => void;
} | null = null;

function logAdInfo(event: string, detail?: Record<string, unknown>): void {
  try {
    if (detail) {
      console.info(`[AdMob:${ADMOB_CONFIG.mode}] ${event}`, detail);
    } else {
      console.info(`[AdMob:${ADMOB_CONFIG.mode}] ${event}`);
    }
  } catch {
    // Ignore console restrictions
  }
}

function logAdWarn(event: string, detail?: unknown): void {
  try {
    console.warn(`[AdMob:${ADMOB_CONFIG.mode}] ${event}`, detail ?? '');
  } catch {
    // Ignore console restrictions
  }
}

function formatErrorDetail(err: unknown): string {
  if (!err) return 'unknown_error';
  if (typeof err === 'string') return err;
  if (typeof err === 'object') {
    const obj = err as { code?: number | string; message?: string };
    if (obj.code !== undefined && obj.message) {
      return `code=${obj.code} ${obj.message}`;
    }
    if (obj.message) return obj.message;
    try {
      return JSON.stringify(obj);
    } catch {
      return 'object_error';
    }
  }
  return String(err);
}

/** Validates that an Ad Unit ID uses the "/" format (and is not an App ID with "~"). */
export function isValidAdUnitId(id: string | undefined | null): id is string {
  if (!id || typeof id !== 'string') return false;
  const trimmed = id.trim();
  return /^ca-app-pub-\d{10,20}\/\d{8,14}$/.test(trimmed);
}

/** Validates that an AdMob App ID uses the "~" format. */
export function isValidAppId(id: string | undefined | null): id is string {
  if (!id || typeof id !== 'string') return false;
  const trimmed = id.trim();
  return /^ca-app-pub-\d{10,20}~\d{8,14}$/.test(trimmed);
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label}_timeout_${ms}ms`)), ms);
    promise.then(
      (val) => {
        clearTimeout(timer);
        resolve(val);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

function notifyBannerHeight(height: number): void {
  const safeHeight = Number.isFinite(height) && height > 0 ? Math.round(height) : 0;
  if (bannerHeightPx === safeHeight) return;
  bannerHeightPx = safeHeight;
  for (const cb of bannerHeightSubscribers) {
    try {
      cb(bannerHeightPx);
    } catch {
      // Isolate listener errors
    }
  }
}

export function subscribeBannerHeight(cb: (height: number) => void): () => void {
  bannerHeightSubscribers.add(cb);
  cb(bannerHeightPx);
  return () => {
    bannerHeightSubscribers.delete(cb);
  };
}

export function getAdDiagnosticsSnapshot(): AdDiagnosticsSnapshot {
  const platform = getRuntimePlatform();
  const cfg = platform === 'ios' ? ADMOB_CONFIG.ios : ADMOB_CONFIG.android;
  return {
    mode: ADMOB_CONFIG.mode,
    platform,
    initialized: adMobInitialized,
    appId: cfg.appId,
    unitIds: {
      banner: cfg.bannerId,
      interstitial: cfg.interstitialId,
      rewarded: cfg.rewardedId,
    },
    testingDevices: [...ADMOB_CONFIG.testingDevices],
    banner: {
      mounted: bannerMounted,
      visible: bannerVisible,
      height: bannerHeightPx,
      lastEvent: bannerLastEvent,
      lastError: bannerLastError,
    },
    interstitial: {
      prepared: interstitialPrepared,
      loading: interstitialLoadPromise !== null,
      lastEvent: interstitialLastEvent,
      lastError: interstitialLastError,
    },
    rewarded: {
      prepared: rewardedPrepared,
      loading: rewardedLoadPromise !== null,
      lastEvent: rewardedLastEvent,
      lastError: rewardedLastError,
    },
    inFlight: nativeAdInFlight,
  };
}

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

function isDeviceOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine !== false;
}

function getBannerAdUnitId(): string {
  const platform = getRuntimePlatform();
  return platform === 'ios' ? ADMOB_CONFIG.ios.bannerId : ADMOB_CONFIG.android.bannerId;
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

/**
 * Registers all native @capacitor-community/admob lifecycle listeners once.
 * Drives state transitions for Banner, Interstitial, and Rewarded ads so promises
 * never hang when ads are closed early or fail to load/show.
 */
async function attachNativeAdListeners(): Promise<void> {
  if (listenersAttached || !isNativeAdPlatform()) return;
  listenersAttached = true;

  try {
    // --- BANNER EVENTS ---
    await AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
      bannerLastEvent = 'loaded';
      bannerLastError = null;
      bannerRetryCount = 0;
      bannerLoading = false;
      bannerMounted = true;
      bannerVisible = bannerWanted;
      logAdInfo('banner:onAdLoaded');
      if (!bannerWanted) {
        void hideBannerAd();
      }
    });

    await AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (error) => {
      bannerLastEvent = 'failed_to_load';
      bannerLastError = formatErrorDetail(error);
      bannerLoading = false;
      bannerMounted = false;
      bannerVisible = false;
      notifyBannerHeight(0);
      logAdWarn('banner:onAdFailedToLoad', error);
      scheduleBannerRetry();
    });

    await AdMob.addListener(BannerAdPluginEvents.SizeChanged, (info) => {
      const h = typeof info?.height === 'number' ? info.height : 0;
      bannerLastEvent = `size_changed:${h}`;
      notifyBannerHeight(bannerWanted ? h : 0);
      logAdInfo('banner:onSizeChanged', { width: info?.width, height: h });
    });

    await AdMob.addListener(BannerAdPluginEvents.Opened, () => {
      bannerLastEvent = 'opened';
      logAdInfo('banner:onAdOpened');
    });

    await AdMob.addListener(BannerAdPluginEvents.Closed, () => {
      bannerLastEvent = 'closed';
      logAdInfo('banner:onAdClosed');
    });

    await AdMob.addListener(BannerAdPluginEvents.AdImpression, () => {
      bannerLastEvent = 'impression';
      logAdInfo('banner:onAdImpression');
    });

    // --- INTERSTITIAL EVENTS ---
    await AdMob.addListener(InterstitialAdPluginEvents.Loaded, (info) => {
      interstitialPrepared = true;
      interstitialRetryCount = 0;
      interstitialLastEvent = 'loaded';
      interstitialLastError = null;
      logAdInfo('interstitial:onAdLoaded', { adUnitId: info?.adUnitId });
    });

    await AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, (error) => {
      interstitialPrepared = false;
      interstitialLastEvent = 'failed_to_load';
      interstitialLastError = formatErrorDetail(error);
      logAdWarn('interstitial:onAdFailedToLoad', error);
    });

    await AdMob.addListener(InterstitialAdPluginEvents.Showed, () => {
      interstitialPrepared = false;
      interstitialLastEvent = 'showed';
      logAdInfo('interstitial:onAdShowed');
    });

    await AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, (error) => {
      interstitialPrepared = false;
      interstitialLastEvent = 'failed_to_show';
      interstitialLastError = formatErrorDetail(error);
      logAdWarn('interstitial:onAdFailedToShow', error);
      if (activeInterstitialFlow) {
        const flow = activeInterstitialFlow;
        activeInterstitialFlow = null;
        flow.finish(false);
      }
    });

    await AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
      interstitialPrepared = false;
      interstitialLastEvent = 'dismissed';
      logAdInfo('interstitial:onAdDismissed');
      if (activeInterstitialFlow) {
        const flow = activeInterstitialFlow;
        activeInterstitialFlow = null;
        flow.finish(true);
      }
    });

    // --- REWARDED VIDEO EVENTS ---
    await AdMob.addListener(RewardAdPluginEvents.Loaded, (info) => {
      rewardedPrepared = true;
      rewardedRetryCount = 0;
      rewardedLastEvent = 'loaded';
      rewardedLastError = null;
      logAdInfo('rewarded:onAdLoaded', { adUnitId: info?.adUnitId });
    });

    await AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (error) => {
      rewardedPrepared = false;
      rewardedLastEvent = 'failed_to_load';
      rewardedLastError = formatErrorDetail(error);
      logAdWarn('rewarded:onAdFailedToLoad', error);
    });

    await AdMob.addListener(RewardAdPluginEvents.Showed, () => {
      rewardedPrepared = false;
      rewardedLastEvent = 'showed';
      logAdInfo('rewarded:onAdShowed');
    });

    await AdMob.addListener(RewardAdPluginEvents.FailedToShow, (error) => {
      rewardedPrepared = false;
      rewardedLastEvent = 'failed_to_show';
      rewardedLastError = formatErrorDetail(error);
      logAdWarn('rewarded:onAdFailedToShow', error);
      if (activeRewardedFlow) {
        const flow = activeRewardedFlow;
        activeRewardedFlow = null;
        flow.finish(false);
      }
    });

    await AdMob.addListener(RewardAdPluginEvents.Rewarded, (rewardItem) => {
      rewardedLastEvent = 'rewarded';
      logAdInfo('rewarded:onUserEarnedReward', {
        type: rewardItem?.type,
        amount: rewardItem?.amount,
      });
      if (activeRewardedFlow) {
        activeRewardedFlow.earned = true;
      }
    });

    await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
      rewardedPrepared = false;
      rewardedLastEvent = 'dismissed';
      logAdInfo('rewarded:onAdDismissed');
      if (activeRewardedFlow) {
        const flow = activeRewardedFlow;
        activeRewardedFlow = null;
        flow.finish(flow.earned);
      }
    });
  } catch (err) {
    listenersAttached = false;
    logAdWarn('listeners:attach_failed', err);
  }
}

function attachOnlineRecoveryListener(): void {
  if (onlineListenerAttached || typeof window === 'undefined') return;
  onlineListenerAttached = true;

  window.addEventListener('online', () => {
    if (!isNativeAdPlatform()) return;
    logAdInfo('network:online_recovered');
    rewardedRetryCount = 0;
    interstitialRetryCount = 0;
    bannerRetryCount = 0;
    void initializeAdService().then((ready) => {
      if (!ready) return;
      if (!rewardedPrepared) void preloadRewardedAd();
      if (!interstitialPrepared) void preloadInterstitialAd();
      if (bannerWanted && !bannerMounted) void showBannerAd();
    });
  });
}

function scheduleRewardedRetry(): void {
  if (rewardedRetryTimer || rewardedRetryCount >= RETRY_DELAYS_MS.length) return;
  const delay = RETRY_DELAYS_MS[rewardedRetryCount];
  rewardedRetryCount += 1;
  rewardedRetryTimer = setTimeout(() => {
    rewardedRetryTimer = null;
    if (adMobInitialized && isDeviceOnline() && !rewardedPrepared) {
      void preloadRewardedAd();
    }
  }, delay);
}

function scheduleInterstitialRetry(): void {
  if (interstitialRetryTimer || interstitialRetryCount >= RETRY_DELAYS_MS.length) return;
  const delay = RETRY_DELAYS_MS[interstitialRetryCount];
  interstitialRetryCount += 1;
  interstitialRetryTimer = setTimeout(() => {
    interstitialRetryTimer = null;
    if (adMobInitialized && isDeviceOnline() && !interstitialPrepared) {
      void preloadInterstitialAd();
    }
  }, delay);
}

function scheduleBannerRetry(): void {
  if (!bannerWanted || bannerRetryTimer || bannerRetryCount >= RETRY_DELAYS_MS.length) {
    return;
  }
  const delay = RETRY_DELAYS_MS[bannerRetryCount];
  bannerRetryCount += 1;
  bannerRetryTimer = setTimeout(() => {
    bannerRetryTimer = null;
    if (bannerWanted && adMobInitialized && isDeviceOnline() && !bannerMounted) {
      void showBannerAd();
    }
  }, delay);
}

export async function preloadRewardedAd(): Promise<boolean> {
  if (!adMobInitialized || !isNativeAdPlatform() || !isDeviceOnline()) return false;
  if (rewardedPrepared) return true;
  if (rewardedLoadPromise) return rewardedLoadPromise;

  const adId = getRewardedAdUnitId();
  if (!isValidAdUnitId(adId)) {
    rewardedLastEvent = 'invalid_unit_id';
    rewardedLastError = `Invalid rewarded adUnitId: "${adId}"`;
    logAdWarn('rewarded:invalid_unit_id', adId);
    return false;
  }

  rewardedLastEvent = 'loading';
  rewardedLoadPromise = (async () => {
    try {
      logAdInfo('rewarded:prepare_request', { adId, isTesting: ADMOB_CONFIG.isTesting });
      await withTimeout(
        AdMob.prepareRewardVideoAd({
          adId,
          isTesting: ADMOB_CONFIG.isTesting,
          immersiveMode: true,
        }),
        PREPARE_TIMEOUT_MS,
        'prepareRewardVideoAd'
      );
      rewardedPrepared = true;
      rewardedRetryCount = 0;
      rewardedLastError = null;
      return true;
    } catch (err) {
      rewardedPrepared = false;
      rewardedLastEvent = 'failed_to_load';
      rewardedLastError = formatErrorDetail(err);
      logAdWarn('rewarded:prepare_failed', err);
      scheduleRewardedRetry();
      return false;
    } finally {
      rewardedLoadPromise = null;
    }
  })();

  return rewardedLoadPromise;
}

export async function preloadInterstitialAd(): Promise<boolean> {
  if (!adMobInitialized || !isNativeAdPlatform() || !isDeviceOnline()) return false;
  if (interstitialPrepared) return true;
  if (interstitialLoadPromise) return interstitialLoadPromise;

  const adId = getInterstitialAdUnitId();
  if (!isValidAdUnitId(adId)) {
    interstitialLastEvent = 'invalid_unit_id';
    interstitialLastError = `Invalid interstitial adUnitId: "${adId}"`;
    logAdWarn('interstitial:invalid_unit_id', adId);
    return false;
  }

  interstitialLastEvent = 'loading';
  interstitialLoadPromise = (async () => {
    try {
      logAdInfo('interstitial:prepare_request', { adId, isTesting: ADMOB_CONFIG.isTesting });
      await withTimeout(
        AdMob.prepareInterstitial({
          adId,
          isTesting: ADMOB_CONFIG.isTesting,
          immersiveMode: true,
        }),
        PREPARE_TIMEOUT_MS,
        'prepareInterstitial'
      );
      interstitialPrepared = true;
      interstitialRetryCount = 0;
      interstitialLastError = null;
      return true;
    } catch (err) {
      interstitialPrepared = false;
      interstitialLastEvent = 'failed_to_load';
      interstitialLastError = formatErrorDetail(err);
      logAdWarn('interstitial:prepare_failed', err);
      scheduleInterstitialRetry();
      return false;
    } finally {
      interstitialLoadPromise = null;
    }
  })();

  return interstitialLoadPromise;
}

/**
 * Displays a native Banner Ad safely without leaving empty space when ads fail to load.
 * Prevents the @capacitor-community/admob BannerExecutor double-showBanner() promise hang
 * by tracking mounted state and calling resumeBanner() when already created.
 */
export async function showBannerAd(
  position: BannerAdPosition = BannerAdPosition.BOTTOM_CENTER
): Promise<boolean> {
  bannerWanted = true;
  if (!isNativeAdPlatform() || !isDeviceOnline()) return false;

  const ready = await initializeAdService();
  if (!ready || !bannerWanted) return false;

  const adId = getBannerAdUnitId();
  if (!isValidAdUnitId(adId)) {
    bannerLastEvent = 'skipped_no_unit_id';
    notifyBannerHeight(0);
    return false;
  }

  if (bannerMounted) {
    if (bannerVisible) return true;
    try {
      await AdMob.resumeBanner();
      bannerVisible = true;
      bannerLastEvent = 'resumed';
      logAdInfo('banner:resumed');
      return true;
    } catch (err) {
      logAdWarn('banner:resume_failed', err);
      bannerMounted = false;
      bannerVisible = false;
      notifyBannerHeight(0);
    }
  }

  if (bannerLoading) return false;
  bannerLoading = true;
  bannerLastEvent = 'loading';

  try {
    logAdInfo('banner:show_request', { adId, isTesting: ADMOB_CONFIG.isTesting, position });
    await AdMob.showBanner({
      adId,
      adSize: BannerAdSize.BANNER,
      position,
      margin: 0,
      isTesting: ADMOB_CONFIG.isTesting,
    });
    bannerMounted = true;
    bannerVisible = true;
    return true;
  } catch (err) {
    bannerLoading = false;
    bannerMounted = false;
    bannerVisible = false;
    bannerLastEvent = 'failed_to_load';
    bannerLastError = formatErrorDetail(err);
    notifyBannerHeight(0);
    logAdWarn('banner:show_failed', err);
    scheduleBannerRetry();
    return false;
  }
}

export async function hideBannerAd(): Promise<void> {
  bannerWanted = false;
  if (bannerRetryTimer) {
    clearTimeout(bannerRetryTimer);
    bannerRetryTimer = null;
  }
  notifyBannerHeight(0);
  if (!isNativeAdPlatform() || !bannerMounted || !bannerVisible) {
    bannerVisible = false;
    return;
  }
  try {
    await AdMob.hideBanner();
    bannerVisible = false;
    bannerLastEvent = 'hidden';
    logAdInfo('banner:hidden');
  } catch (err) {
    bannerVisible = false;
    logAdWarn('banner:hide_failed', err);
  }
}

export async function removeBannerAd(): Promise<void> {
  bannerWanted = false;
  if (bannerRetryTimer) {
    clearTimeout(bannerRetryTimer);
    bannerRetryTimer = null;
  }
  notifyBannerHeight(0);
  if (!isNativeAdPlatform() || !bannerMounted) {
    bannerMounted = false;
    bannerVisible = false;
    return;
  }
  try {
    await AdMob.removeBanner();
  } catch (err) {
    logAdWarn('banner:remove_failed', err);
  } finally {
    bannerMounted = false;
    bannerVisible = false;
    bannerLoading = false;
    bannerLastEvent = 'removed';
  }
}

/**
 * Safely initializes AdMob SDK, native event listeners, and preloads ad inventory.
 * - Non-blocking UMP consent (only runs in production mode so test App ID never stalls).
 * - Automatic retry on subsequent calls if initial launch was offline.
 */
export async function initializeAdService(): Promise<boolean> {
  attachOnlineRecoveryListener();
  if (!isNativeAdPlatform()) return false;
  if (adMobInitialized) return true;
  if (adMobInitPromise) return adMobInitPromise;

  adMobInitPromise = (async () => {
    try {
      await attachNativeAdListeners();

      const hasTestDevices = ADMOB_CONFIG.testingDevices.length > 0;
      logAdInfo('sdk:initialize_start', {
        mode: ADMOB_CONFIG.mode,
        isTesting: ADMOB_CONFIG.isTesting,
        testingDevicesCount: ADMOB_CONFIG.testingDevices.length,
        androidAppId: ADMOB_CONFIG.android.appId,
      });

      await AdMob.initialize({
        initializeForTesting: ADMOB_CONFIG.isTesting || hasTestDevices,
        testingDevices: ADMOB_CONFIG.testingDevices,
      });

      adMobInitialized = true;
      logAdInfo('sdk:initialize_ok');

      // Run UMP/GDPR consent in the background ONLY in production mode so test mode
      // with Google's official test App ID never blocks ad loading.
      if (!ADMOB_CONFIG.isTesting) {
        void (async () => {
          try {
            const consent = await AdMob.requestConsentInfo();
            if (
              consent?.isConsentFormAvailable &&
              consent.status === AdmobConsentStatus.REQUIRED
            ) {
              await AdMob.showConsentForm();
            }
          } catch (consentErr) {
            logAdWarn('ump:consent_skipped', consentErr);
          }
        })();
      }

      // Give Android's async MobileAds.initialize a brief settle beat before preloading
      setTimeout(() => {
        if (!adMobInitialized || !isDeviceOnline()) return;
        void preloadRewardedAd();
        void preloadInterstitialAd();
        if (bannerWanted && !bannerMounted) {
          void showBannerAd();
        }
      }, INITIAL_PRELOAD_SETTLE_MS);

      return true;
    } catch (err) {
      adMobInitialized = false;
      logAdWarn('sdk:initialize_failed', err);
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
 * Checks whether an end-of-day interstitial ad is eligible.
 * - Production: low-frequency 5–7 day pacing & >= 4 min cooldown.
 * - Test mode: eligible from Day 1 (with 45s cooldown) so QA can verify interstitial ads immediately.
 */
export function shouldShowEndOfDayInterstitial(
  completedDay: number,
  adState?: Partial<AdMonetizationState>,
  adsRemoved = false
): boolean {
  if (adsRemoved) return false;
  if (completedDay < 1) return false;

  const lastDay = Math.max(
    lastInterstitialDayRuntime,
    adState?.lastInterstitialDay ?? 0
  );
  if (completedDay === lastDay) return false;

  const now = Date.now();

  if (ADMOB_CONFIG.isTesting) {
    if (
      lastInterstitialShownAt > 0 &&
      now - lastInterstitialShownAt < AD_PACING_RULES.testInterstitialCooldownMs
    ) {
      return false;
    }
    return true;
  }

  if (completedDay < AD_PACING_RULES.interstitialMinDays) return false;

  const scheduledDay =
    typeof adState?.nextInterstitialDay === 'number' &&
    adState.nextInterstitialDay >= AD_PACING_RULES.interstitialMinDays
      ? adState.nextInterstitialDay
      : AD_PACING_RULES.interstitialMinDays;

  if (completedDay < scheduledDay) return false;
  if (lastDay > 0 && completedDay - lastDay < AD_PACING_RULES.interstitialMinDays) {
    return false;
  }

  if (
    lastInterstitialShownAt > 0 &&
    now - lastInterstitialShownAt < AD_PACING_RULES.interstitialMinCooldownMs
  ) {
    return false;
  }
  return true;
}

/**
 * Runs the native Rewarded Video presentation and settles reliably via SDK lifecycle events
 * (`Rewarded`, `Dismissed`, `FailedToShow`) so early-dismissed videos NEVER hang the promise.
 */
async function presentNativeRewardedAd(): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    let settled = false;
    let earnedReward = false;
    let postRewardFallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const finalize = (result: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(safetyTimer);
      if (postRewardFallbackTimer) clearTimeout(postRewardFallbackTimer);
      if (activeRewardedFlow?.finish === finalize) {
        activeRewardedFlow = null;
      }
      resolve(result);
    };

    const safetyTimer = setTimeout(() => {
      logAdWarn('rewarded:show_safety_timeout');
      finalize(earnedReward);
    }, FULLSCREEN_SAFETY_TIMEOUT_MS);

    activeRewardedFlow = {
      get earned() {
        return earnedReward;
      },
      set earned(val: boolean) {
        earnedReward = val;
      },
      finish: finalize,
    };

    AdMob.showRewardVideoAd()
      .then((rewardItem) => {
        // Native plugin resolves showRewardVideoAd() inside OnUserEarnedRewardListener.
        // Mark reward earned and wait briefly for Dismissed so audio stays suspended until closed.
        if (rewardItem) {
          earnedReward = true;
        }
        if (!settled && earnedReward) {
          postRewardFallbackTimer = setTimeout(() => {
            finalize(true);
          }, 4000);
        }
      })
      .catch((err) => {
        rewardedLastEvent = 'failed_to_show';
        rewardedLastError = formatErrorDetail(err);
        logAdWarn('rewarded:show_rejected', err);
        finalize(false);
      });
  });
}

/**
 * Runs the native Interstitial presentation and waits for `Dismissed` / `FailedToShow`
 * instead of unmuting immediately on `showInterstitial()` resolve.
 */
async function presentNativeInterstitialAd(): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    let settled = false;

    const finalize = (shown: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(safetyTimer);
      if (activeInterstitialFlow?.finish === finalize) {
        activeInterstitialFlow = null;
      }
      resolve(shown);
    };

    const safetyTimer = setTimeout(() => {
      logAdWarn('interstitial:show_safety_timeout');
      finalize(true);
    }, FULLSCREEN_SAFETY_TIMEOUT_MS);

    activeInterstitialFlow = {
      finish: finalize,
    };

    AdMob.showInterstitial().catch((err) => {
      interstitialLastEvent = 'failed_to_show';
      interstitialLastError = formatErrorDetail(err);
      logAdWarn('interstitial:show_rejected', err);
      finalize(false);
    });
  });
}

/**
 * Displays a Rewarded Video Ad with an explicit player confirmation step first.
 * Resolves true ONLY if the player confirmed AND completed watching the ad.
 * Never crashes, hangs, or displays intrusive error popups when ads fail to load.
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

    if (!isDeviceOnline()) {
      logAdWarn('rewarded:skipped_offline');
      adStatusListener?.({
        code: 'OFFLINE',
        messageTr: 'Reklam için internet bağlantısı gerekiyor.',
        messageEn: 'Internet connection is required to load ads.',
      });
      return false;
    }

    if (nativeAdInFlight) {
      logAdWarn('rewarded:skipped_busy');
      return false;
    }

    const ready = await initializeAdService();
    if (!ready) {
      return false;
    }

    nativeAdInFlight = true;
    soundFX.setAdSuspended(true);
    try {
      const prepared = rewardedPrepared ? true : await preloadRewardedAd();
      if (!prepared) {
        return false;
      }
      rewardedPrepared = false;
      return await presentNativeRewardedAd();
    } catch (err) {
      rewardedPrepared = false;
      logAdWarn('rewarded:unexpected_error', err);
      return false;
    } finally {
      soundFX.setAdSuspended(false);
      nativeAdInFlight = false;
      // Preload next rewarded ad cleanly after fullscreen dismissal
      setTimeout(() => {
        void preloadRewardedAd();
      }, 600);
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
 * Displays an Interstitial Ad at day end under configured pacing rules.
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
    if (nativeAdInFlight || !isDeviceOnline()) {
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
    soundFX.setAdSuspended(true);
    try {
      const prepared = interstitialPrepared ? true : await preloadInterstitialAd();
      if (!prepared) {
        return {
          shown: false,
          lastInterstitialDay: currentLast,
          nextInterstitialDay: currentNext,
        };
      }
      interstitialPrepared = false;
      const shown = await presentNativeInterstitialAd();
      if (!shown) {
        return {
          shown: false,
          lastInterstitialDay: currentLast,
          nextInterstitialDay: currentNext,
        };
      }
      lastInterstitialShownAt = Date.now();
      lastInterstitialDayRuntime = completedDay;
      return {
        shown: true,
        lastInterstitialDay: completedDay,
        nextInterstitialDay: nextScheduled,
      };
    } catch (err) {
      interstitialPrepared = false;
      logAdWarn('interstitial:unexpected_error', err);
      return {
        shown: false,
        lastInterstitialDay: currentLast,
        nextInterstitialDay: currentNext,
      };
    } finally {
      soundFX.setAdSuspended(false);
      nativeAdInFlight = false;
      setTimeout(() => {
        void preloadInterstitialAd();
      }, 600);
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
