import React, { useState } from 'react';
import { RotateCw } from 'lucide-react';
import { useLanguage } from '../game/i18n';
import { PhoneDevice, PhoneModelSpec } from '../game/types';

interface PhoneInspectSVGProps {
  device: PhoneDevice;
  /** If true, reveals all defects directly (used in Workshop where player already owns phone) */
  revealAll?: boolean;
  compact?: boolean;
  /** Responsive mode: fills its flex container height cleanly with zero overflow on both mobile landscape and desktop */
  fluid?: boolean;
  flashKey?: number;
  className?: string;
}

export const PhoneInspectSVG: React.FC<PhoneInspectSVGProps> = ({
  device,
  revealAll = false,
  compact = false,
  fluid = false,
  flashKey = 0,
  className = '',
}) => {
  const { bi } = useLanguage();
  const [side, setSide] = useState<'front' | 'back'>('front');

  const isScreenChecked = revealAll || device.inspected.screen;
  const isBatteryChecked = revealAll || device.inspected.battery;
  const isImeiChecked = revealAll || device.inspected.imei;
  const isHardwareChecked = revealAll || device.inspected.hardware;

  const hasCrack = isScreenChecked && device.defects.includes('screen_crack');
  const hasAftermarket = isScreenChecked && device.defects.includes('screen_aftermarket');
  const hasCosmetic = isScreenChecked && device.defects.includes('cosmetic_worn');
  const hasBatteryIssue =
    isBatteryChecked &&
    (device.defects.includes('battery_degraded') ||
      device.defects.includes('battery_fake_chip'));
  const hasFakeChip = isBatteryChecked && device.defects.includes('battery_fake_chip');
  const hasUnregisteredImei =
    isImeiChecked && device.defects.includes('imei_unregistered');
  const hasLiquid = isHardwareChecked && device.defects.includes('liquid_damage');
  const hasCameraFog = isHardwareChecked && device.defects.includes('camera_fog');

  const isMint = device.defects.length === 0;
  const isFold = device.cameraLayout === 'fold';

  const screenBg = hasAftermarket ? '#28364A' : '#0B1220';
  const displayedBattery = isBatteryChecked
    ? device.batteryHealth
    : device.reportedBatteryHealth;

  const renderCameraModule = () => {
    if (device.cameraLayout === 'ultra') {
      return (
        <g>
          {/* Iconic circular flagship camera island */}
          <circle
            cx={isFold ? 90 : 78}
            cy="64"
            r="34"
            fill="#0D1219"
            stroke={device.accentColor}
            strokeOpacity="0.65"
            strokeWidth="2.2"
          />
          <circle
            cx={isFold ? 90 : 78}
            cy="64"
            r="28"
            fill="#131B26"
            stroke="#334155"
            strokeWidth="1"
          />
          <circle cx={(isFold ? 90 : 78) - 12} cy="54" r="8.5" fill="#1E293B" stroke="#64748B" strokeWidth="1.4" />
          <circle cx={(isFold ? 90 : 78) - 12} cy="54" r="3.6" fill={hasCameraFog ? '#94A3B8' : '#0EA5E9'} fillOpacity={hasCameraFog ? 0.9 : 0.45} />
          <circle cx={(isFold ? 90 : 78) + 12} cy="54" r="8.5" fill="#1E293B" stroke="#64748B" strokeWidth="1.4" />
          <circle cx={(isFold ? 90 : 78) + 12} cy="54" r="3.6" fill={hasCameraFog ? '#94A3B8' : '#0F172A'} />
          <circle cx={(isFold ? 90 : 78) - 11} cy="76" r="7.5" fill="#1E293B" stroke="#64748B" strokeWidth="1.4" />
          <circle cx={(isFold ? 90 : 78) - 11} cy="76" r="3.2" fill={hasCameraFog ? '#94A3B8' : '#0F172A'} />
          {/* Periscope telephoto square lens */}
          <rect x={(isFold ? 90 : 78) + 5} y="69" width="14" height="14" rx="3.5" fill="#1E293B" stroke="#64748B" strokeWidth="1.3" />
          <circle cx={(isFold ? 90 : 78) + 12} cy="76" r="3.2" fill="#0F172A" />
          {/* Flash */}
          <circle cx={isFold ? 90 : 78} cy="38" r="3" fill="#FEF3C7" />
          {hasCameraFog && (
            <circle cx={isFold ? 90 : 78} cy="64" r="28" fill="#CBD5E1" fillOpacity="0.34" />
          )}
        </g>
      );
    }

    if (device.cameraLayout === 'fold') {
      return (
        <g>
          {/* Fold hinge seam on back */}
          <line x1="90" y1="14" x2="90" y2="266" stroke={device.accentColor} strokeOpacity="0.35" strokeWidth="2" />
          {/* Slim vertical pill triple camera */}
          <rect x="26" y="24" width="26" height="72" rx="13" fill="#0D1219" stroke={device.accentColor} strokeOpacity="0.55" strokeWidth="1.5" />
          {[38, 60, 82].map((cy) => (
            <g key={cy}>
              <circle cx="39" cy={cy} r="8" fill="#1E293B" stroke="#64748B" strokeWidth="1.4" />
              <circle cx="39" cy={cy} r="3.5" fill={hasCameraFog ? '#94A3B8' : '#0F172A'} />
            </g>
          ))}
          <circle cx="60" cy="40" r="3.5" fill="#FEF3C7" />
          {hasCameraFog && (
            <ellipse cx="39" cy="60" rx="16" ry="30" fill="#CBD5E1" fillOpacity="0.34" />
          )}
        </g>
      );
    }

    if (device.cameraLayout === 'dual') {
      return (
        <g>
          {/* Sleek Dual Vertical Pill Island */}
          <rect x="26" y="24" width="44" height="58" rx="14" fill="#0D1219" stroke={device.accentColor} strokeOpacity="0.5" strokeWidth="1.5" />
          <circle cx="40" cy="40" r="9.5" fill="#1E293B" stroke="#64748B" strokeWidth="1.6" />
          <circle cx="40" cy="40" r="4.2" fill={hasCameraFog ? '#94A3B8' : '#0F172A'} />
          <circle cx="40" cy="65" r="9.5" fill="#1E293B" stroke="#64748B" strokeWidth="1.6" />
          <circle cx="40" cy="65" r="4.2" fill={hasCameraFog ? '#94A3B8' : '#0F172A'} />
          <circle cx="59" cy="42" r="3.5" fill="#FEF3C7" />
          <circle cx="59" cy="60" r="2.2" fill="#475569" />
          {hasCameraFog && (
            <circle cx="42" cy="52" r="20" fill="#CBD5E1" fillOpacity="0.34" />
          )}
        </g>
      );
    }

    // Default: 'triple' Pro Triangle Island
    return (
      <g>
        <rect
          x="26"
          y="24"
          width="54"
          height="58"
          rx="14"
          fill="#0F141B"
          stroke={device.accentColor}
          strokeOpacity="0.55"
          strokeWidth="1.6"
        />
        <circle cx="40" cy="39" r="9.5" fill="#1E293B" stroke="#64748B" strokeWidth="1.6" />
        <circle cx="40" cy="39" r="4.2" fill={hasCameraFog ? '#94A3B8' : '#0F172A'} />
        <circle cx="40" cy="64" r="9.5" fill="#1E293B" stroke="#64748B" strokeWidth="1.6" />
        <circle cx="40" cy="64" r="4.2" fill={hasCameraFog ? '#94A3B8' : '#0F172A'} />
        <circle cx="64" cy="51.5" r="9.2" fill="#1E293B" stroke="#64748B" strokeWidth="1.6" />
        <circle cx="64" cy="51.5" r="4" fill={hasCameraFog ? '#94A3B8' : '#0F172A'} />
        <circle cx="64" cy="34" r="3.4" fill="#FEF3C7" />
        <circle cx="64" cy="69" r="3" fill="#334155" stroke="#475569" strokeWidth="0.9" />
        {hasCameraFog && (
          <circle cx="48" cy="52" r="24" fill="#CBD5E1" fillOpacity="0.34" />
        )}
      </g>
    );
  };

  return (
    <div
      key={flashKey}
      className={`relative flex flex-col items-center justify-center ${
        fluid ? 'h-full w-full min-h-0' : ''
      } ${flashKey > 0 ? 'animate-repair-flash' : ''} ${className}`}
    >
      {/* ESD Repair Mat Frame */}
      <div
        className={`relative flex items-center justify-center rounded-xl border border-white/10 bg-[#121B25] ${
          fluid
            ? 'h-full w-full min-h-0 p-2'
            : compact
            ? 'p-2.5'
            : 'px-6 py-4'
        }`}
        style={{
          backgroundImage:
            'radial-gradient(rgba(148,163,184,0.13) 1px, transparent 1px)',
          backgroundSize: '14px 14px',
        }}
      >
        <svg
          width={fluid ? undefined : compact ? 112 : isFold ? 170 : 148}
          height={fluid ? undefined : compact ? 202 : 264}
          viewBox={isFold ? '0 0 180 280' : '0 0 156 280'}
          fill="none"
          role="img"
          aria-label={`${device.brand} ${device.model} ${side === 'front' ? 'ön görünüm' : 'arka görünüm'}`}
          className={`${
            fluid ? 'h-full w-auto max-h-full max-w-full' : ''
          } drop-shadow-[0_14px_22px_rgba(0,0,0,0.65)] transition-transform duration-200`}
        >
          {/* Phone Outer Chassis */}
          <rect
            x="10"
            y="8"
            width={isFold ? 160 : 136}
            height="264"
            rx="24"
            fill={device.bodyColor}
            stroke={hasCosmetic ? '#F59E0B' : device.accentColor}
            strokeWidth="3.2"
          />

          {/* Side buttons */}
          <rect
            x={isFold ? 170 : 146}
            y="72"
            width="3.5"
            height="34"
            rx="1.5"
            fill={device.accentColor}
          />
          <rect x="6.5" y="64" width="3.5" height="22" rx="1.5" fill={device.accentColor} />
          <rect x="6.5" y="94" width="3.5" height="22" rx="1.5" fill={device.accentColor} />

          {/* SIM tray liquid indicator dot */}
          <g>
            <rect
              x="6.5"
              y="186"
              width="3.5"
              height="28"
              rx="1.5"
              fill={hasLiquid ? '#EF4444' : '#475569'}
            />
            {hasLiquid && (
              <circle cx="16" cy="200" r="5.5" fill="#EF4444" stroke="#11161D" strokeWidth="1.5" />
            )}
          </g>

          {side === 'front' ? (
            <>
              {/* Display Glass */}
              <rect
                x="18"
                y="16"
                width={isFold ? 144 : 120}
                height="248"
                rx="17"
                fill={screenBg}
              />

              {/* Subtle fold hinge seam if foldable */}
              {isFold && (
                <line
                  x1="90"
                  y1="16"
                  x2="90"
                  y2="264"
                  stroke="#FFFFFF"
                  strokeOpacity="0.14"
                  strokeWidth="1.5"
                />
              )}

              {/* Dynamic Island / Speaker Cutout */}
              <rect
                x={isFold ? 72 : 60}
                y="24"
                width="36"
                height="9"
                rx="4.5"
                fill="#05080F"
              />

              {/* Diagnostic Screen Readout inside phone */}
              <text
                x={isFold ? 90 : 78}
                y="62"
                textAnchor="middle"
                fill="#F1F5F9"
                fontFamily="'Bricolage Grotesque', sans-serif"
                fontWeight="700"
                fontSize="13.5"
              >
                {device.brand}
              </text>
              <text
                x={isFold ? 90 : 78}
                y="78"
                textAnchor="middle"
                fill="#94A3B8"
                fontFamily="'Plus Jakarta Sans', sans-serif"
                fontWeight="600"
                fontSize="10.5"
              >
                {device.model}
              </text>

              {/* Battery Diagnostic Widget on Phone Screen */}
              <g transform={`translate(${isFold ? 38 : 28}, 96)`}>
                <rect
                  x="0"
                  y="0"
                  width="100"
                  height="42"
                  rx="8"
                  fill="#151F2E"
                  stroke={hasBatteryIssue ? '#EF4444' : isBatteryChecked ? '#10B981' : '#334155'}
                  strokeWidth="1.3"
                />
                <text
                  x="9"
                  y="15"
                  fill="#94A3B8"
                  fontFamily="'Plus Jakarta Sans', sans-serif"
                  fontSize="8"
                >
                  {hasFakeChip
                    ? bi('GERÇEK PİL (ÇİPLİ!)', 'TRUE CELL (SPOOF!)')
                    : bi('PİL SAĞLIĞI', 'BATTERY HEALTH')}
                </text>
                <text
                  x="9"
                  y="33"
                  fill={hasBatteryIssue ? '#F87171' : isBatteryChecked ? '#34D399' : '#F8FAFC'}
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="700"
                  fontSize="14"
                >
                  %{displayedBattery}
                </text>
                <rect x="56" y="21" width="34" height="10" rx="2.5" fill="#0B1220" stroke="#475569" strokeWidth="1" />
                <rect
                  x="58"
                  y="23"
                  width={Math.max(4, Math.round((displayedBattery / 100) * 30))}
                  height="6"
                  rx="1.5"
                  fill={hasBatteryIssue ? '#EF4444' : '#10B981'}
                />
              </g>

              {/* IMEI Strip on Phone Screen */}
              <g transform={`translate(${isFold ? 38 : 28}, 148)`}>
                <rect
                  x="0"
                  y="0"
                  width="100"
                  height="38"
                  rx="8"
                  fill="#151F2E"
                  stroke={
                    hasUnregisteredImei
                      ? '#EF4444'
                      : isImeiChecked
                      ? '#10B981'
                      : '#334155'
                  }
                  strokeWidth="1.3"
                />
                <text
                  x="9"
                  y="14"
                  fill="#94A3B8"
                  fontFamily="'Plus Jakarta Sans', sans-serif"
                  fontSize="8"
                >
                  {bi('BTK / IMEI DURUMU', 'IMEI REGISTRY')}
                </text>
                <text
                  x="9"
                  y="30"
                  fill={
                    hasUnregisteredImei
                      ? '#F87171'
                      : isImeiChecked
                      ? '#34D399'
                      : '#CBD5E1'
                  }
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="700"
                  fontSize="10"
                >
                  {!isImeiChecked
                    ? bi('Sorgulanmadı', 'Not Scanned')
                    : hasUnregisteredImei
                    ? bi('YURT DIŞI!', 'UNREGISTERED!')
                    : bi('TR KAYITLI', 'VERIFIED OK')}
                </text>
              </g>

              {/* Hardware / Screen Status Strip */}
              <g transform={`translate(${isFold ? 38 : 28}, 196)`}>
                <rect
                  x="0"
                  y="0"
                  width="100"
                  height="38"
                  rx="8"
                  fill="#151F2E"
                  stroke={
                    hasLiquid || hasCameraFog || hasAftermarket || hasCrack
                      ? '#F59E0B'
                      : isScreenChecked && isHardwareChecked
                      ? '#10B981'
                      : '#334155'
                  }
                  strokeWidth="1.3"
                />
                <text
                  x="9"
                  y="14"
                  fill="#94A3B8"
                  fontFamily="'Plus Jakarta Sans', sans-serif"
                  fontSize="8"
                >
                  {bi('DONANIM / PANEL', 'HARDWARE / PANEL')}
                </text>
                <text
                  x="9"
                  y="30"
                  fill={
                    hasLiquid || hasCameraFog || hasAftermarket || hasCrack
                      ? '#FBBF24'
                      : isScreenChecked && isHardwareChecked
                      ? '#34D399'
                      : '#CBD5E1'
                  }
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="700"
                  fontSize="9.5"
                >
                  {hasLiquid
                    ? bi('SIVI TEMASI!', 'LIQUID DMG!')
                    : hasCameraFog
                    ? bi('SENSÖR HATA!', 'CAM FOG!')
                    : hasAftermarket
                    ? bi('YAN SANAYİ!', 'FAKE LCD!')
                    : hasCrack
                    ? bi('CAM ÇATLAK!', 'CRACKED!')
                    : isScreenChecked && isHardwareChecked
                    ? bi('SORUNSUZ', 'SPOTLESS')
                    : bi('Test Bekliyor', 'Pending')}
                </text>
              </g>

              {/* Cracked Glass Fracture Lines */}
              {hasCrack && (
                <g stroke="#E2E8F0" strokeOpacity="0.78" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M24 38 L58 84 L42 126 L88 158" />
                  <path d="M58 84 L106 72 L130 95" />
                  <path d="M58 84 L68 118" />
                  <path d="M42 126 L22 148" />
                </g>
              )}

              {/* Aftermarket washed-out tint */}
              {hasAftermarket && (
                <rect
                  x="18"
                  y="16"
                  width={isFold ? 144 : 120}
                  height="248"
                  rx="17"
                  fill="#93C5FD"
                  fillOpacity="0.12"
                />
              )}

              {/* Mint Shine Glint */}
              {isMint && (
                <path
                  d="M28 24 L62 24 L24 92 L24 44 Z"
                  fill="#FFFFFF"
                  fillOpacity="0.1"
                />
              )}

              {/* Home indicator */}
              <rect
                x={isFold ? 68 : 56}
                y="252"
                width="44"
                height="4"
                rx="2"
                fill="#FFFFFF"
                fillOpacity="0.34"
              />
            </>
          ) : (
            /* BACK VIEW */
            <>
              <rect
                x="16"
                y="14"
                width={isFold ? 148 : 124}
                height="252"
                rx="19"
                fill={device.bodyColor}
                stroke="#FFFFFF"
                strokeOpacity="0.1"
                strokeWidth="1"
              />

              {renderCameraModule()}

              {/* Back Brand Emblem */}
              <circle
                cx={isFold ? 90 : 78}
                cy="154"
                r="15"
                stroke={device.accentColor}
                strokeOpacity="0.45"
                strokeWidth="1.8"
              />
              <text
                x={isFold ? 90 : 78}
                y="158"
                textAnchor="middle"
                fill={device.accentColor}
                fillOpacity="0.85"
                fontFamily="'Bricolage Grotesque', sans-serif"
                fontWeight="700"
                fontSize="11.5"
              >
                {device.brand.slice(0, 2).toUpperCase()}
              </text>

              {/* Back cosmetic scuffs if worn */}
              {hasCosmetic && (
                <g stroke="#F59E0B" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M98 206 L124 224" />
                  <path d="M106 218 L128 232" />
                  <path d="M28 198 L44 216" />
                </g>
              )}

              {/* Storage engraving */}
              <text
                x={isFold ? 90 : 78}
                y="246"
                textAnchor="middle"
                fill="#94A3B8"
                fontFamily="'JetBrains Mono', monospace"
                fontSize="9.5"
              >
                {device.storage} · {device.imeiStatus === 'TR_REGISTERED' || !isImeiChecked ? 'CE' : 'GLOBAL'}
              </text>
            </>
          )}

          {/* Corner dents when cosmetic worn */}
          {hasCosmetic && (
            <>
              <circle cx="15" cy="264" r="5" fill="#F59E0B" fillOpacity="0.6" />
              <circle cx={isFold ? 165 : 141} cy="16" r="4.5" fill="#F59E0B" fillOpacity="0.6" />
            </>
          )}
        </svg>

        {!compact && (
          <button
            type="button"
            onClick={() => setSide((s) => (s === 'front' ? 'back' : 'front'))}
            className="absolute bottom-1 right-1 inline-flex items-center gap-0.5 rounded-md border border-white/15 bg-[#1B2534]/95 px-1.5 py-0.5 text-[9px] font-bold text-slate-100 hover:bg-[#27354A] transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-md"
            title={bi('Cihazı çevir', 'Flip phone')}
          >
            <RotateCw className="w-2.5 h-2.5 text-amber-400" />
            <span>
              {side === 'front'
                ? bi('Arka Yüz', 'Back')
                : bi('Ön Yüz', 'Front')}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Crisp Miniature Smartphone Visual Model (works with both PhoneDevice and PhoneModelSpec).
 * Displays authentic chassis color, camera island layout, screen/back silhouette, and optional defect indicator.
 */
interface PhoneModelThumbProps {
  device?: PhoneDevice;
  spec?: PhoneModelSpec;
  showBack?: boolean;
  silhouette?: boolean;
  className?: string;
}

export const PhoneModelThumb: React.FC<PhoneModelThumbProps> = ({
  device,
  spec,
  showBack = true,
  silhouette = false,
  className = 'w-10 h-16',
}) => {
  const brand = device?.brand ?? spec?.brand ?? 'GSM';
  const bodyColor = silhouette
    ? '#1E293B'
    : device?.bodyColor ?? spec?.bodyColor ?? '#1E293B';
  const accentColor = silhouette
    ? '#475569'
    : device?.accentColor ?? spec?.accentColor ?? '#F59E0B';
  const cameraLayout = device?.cameraLayout ?? spec?.cameraLayout ?? 'triple';
  const isFold = cameraLayout === 'fold';
  const isBrandNew = device?.isBrandNew ?? false;
  const hasCrack =
    !silhouette && Boolean(device?.defects.includes('screen_crack'));
  const hasDefects = !silhouette && (device?.defects.length ?? 0) > 0;

  return (
    <svg
      viewBox={isFold ? '0 0 72 104' : '0 0 60 104'}
      fill="none"
      className={`${className} drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)]`}
      aria-hidden="true"
    >
      {/* Outer Frame */}
      <rect
        x="4"
        y="4"
        width={isFold ? 64 : 52}
        height="96"
        rx="11"
        fill={bodyColor}
        stroke={hasDefects ? '#F59E0B' : accentColor}
        strokeWidth="2.2"
      />
      {/* Side power key */}
      <rect
        x={isFold ? 68 : 56}
        y="28"
        width="2"
        height="14"
        rx="1"
        fill={accentColor}
      />

      {showBack ? (
        <>
          {/* Subtle glass reflection */}
          <path
            d={isFold ? 'M10 10 L36 10 L10 42 Z' : 'M10 10 L30 10 L10 38 Z'}
            fill="#FFFFFF"
            fillOpacity="0.07"
          />

          {/* Camera Island */}
          {cameraLayout === 'ultra' ? (
            <g>
              <circle
                cx={isFold ? 36 : 30}
                cy="29"
                r="14"
                fill="#0A0F16"
                stroke={accentColor}
                strokeWidth="1.4"
              />
              <circle cx={(isFold ? 36 : 30) - 5} cy="25" r="3.4" fill="#334155" stroke="#94A3B8" strokeWidth="0.8" />
              <circle cx={(isFold ? 36 : 30) + 5} cy="25" r="3.4" fill="#334155" stroke="#94A3B8" strokeWidth="0.8" />
              <circle cx={(isFold ? 36 : 30) - 5} cy="34" r="3" fill="#334155" stroke="#94A3B8" strokeWidth="0.8" />
              <rect x={(isFold ? 36 : 30) + 2} y="31" width="6" height="6" rx="1.5" fill="#1E293B" stroke="#94A3B8" strokeWidth="0.8" />
            </g>
          ) : cameraLayout === 'fold' ? (
            <g>
              <line x1="36" y1="6" x2="36" y2="98" stroke={accentColor} strokeOpacity="0.45" strokeWidth="1.4" />
              <rect x="11" y="12" width="12" height="32" rx="6" fill="#0A0F16" stroke={accentColor} strokeWidth="1" />
              <circle cx="17" cy="18.5" r="3.2" fill="#334155" stroke="#94A3B8" strokeWidth="0.8" />
              <circle cx="17" cy="28" r="3.2" fill="#334155" stroke="#94A3B8" strokeWidth="0.8" />
              <circle cx="17" cy="37.5" r="3.2" fill="#334155" stroke="#94A3B8" strokeWidth="0.8" />
            </g>
          ) : cameraLayout === 'dual' ? (
            <g>
              <rect x="11" y="12" width="18" height="26" rx="6" fill="#0A0F16" stroke={accentColor} strokeOpacity="0.6" strokeWidth="1.1" />
              <circle cx="17" cy="19" r="3.8" fill="#334155" stroke="#94A3B8" strokeWidth="0.9" />
              <circle cx="17" cy="31" r="3.8" fill="#334155" stroke="#94A3B8" strokeWidth="0.9" />
              <circle cx="25" cy="21" r="1.6" fill="#FEF3C7" />
            </g>
          ) : (
            /* triple */
            <g>
              <rect x="11" y="12" width="23" height="25" rx="6" fill="#0A0F16" stroke={accentColor} strokeOpacity="0.65" strokeWidth="1.1" />
              <circle cx="17" cy="18.5" r="3.6" fill="#334155" stroke="#94A3B8" strokeWidth="0.9" />
              <circle cx="17" cy="30" r="3.6" fill="#334155" stroke="#94A3B8" strokeWidth="0.9" />
              <circle cx="27.5" cy="24.2" r="3.6" fill="#334155" stroke="#94A3B8" strokeWidth="0.9" />
              <circle cx="27.5" cy="16.5" r="1.5" fill="#FEF3C7" />
            </g>
          )}

          {/* Brand Emblem */}
          {silhouette ? (
            <text
              x={isFold ? 36 : 30}
              y="68"
              textAnchor="middle"
              fill="#64748B"
              fontFamily="'JetBrains Mono', monospace"
              fontWeight="800"
              fontSize="16"
            >
              ?
            </text>
          ) : (
            <>
              <circle
                cx={isFold ? 36 : 30}
                cy="62"
                r="7.5"
                stroke={accentColor}
                strokeOpacity="0.5"
                strokeWidth="1.2"
              />
              <text
                x={isFold ? 36 : 30}
                y="65"
                textAnchor="middle"
                fill={accentColor}
                fontFamily="'Bricolage Grotesque', sans-serif"
                fontWeight="800"
                fontSize="7"
              >
                {brand.slice(0, 2).toUpperCase()}
              </text>
            </>
          )}
        </>
      ) : (
        /* Front screen thumb */
        <>
          <rect
            x="8"
            y="8"
            width={isFold ? 56 : 44}
            height="88"
            rx="8"
            fill="#0B1220"
          />
          <rect
            x={isFold ? 28 : 22}
            y="12"
            width="16"
            height="3.5"
            rx="1.75"
            fill="#030712"
          />
          <path
            d="M11 14 L28 14 L11 46 Z"
            fill="#FFFFFF"
            fillOpacity="0.09"
          />
          {hasCrack && (
            <path
              d="M12 24 L28 48 L20 68 L42 80"
              stroke="#E2E8F0"
              strokeOpacity="0.75"
              strokeWidth="1.2"
            />
          )}
          {silhouette && (
            <text
              x={isFold ? 36 : 30}
              y="58"
              textAnchor="middle"
              fill="#64748B"
              fontFamily="'JetBrains Mono', monospace"
              fontWeight="800"
              fontSize="16"
            >
              ?
            </text>
          )}
        </>
      )}

      {/* Brand-new emerald corner sparkle dot */}
      {isBrandNew && !silhouette && (
        <circle cx={isFold ? 62 : 50} cy="12" r="4" fill="#10B981" stroke="#0F141B" strokeWidth="1.4" />
      )}
    </svg>
  );
};
