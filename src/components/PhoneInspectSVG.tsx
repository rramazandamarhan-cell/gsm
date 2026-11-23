import React, { useState } from 'react';
import { RotateCw } from 'lucide-react';
import { PhoneDevice } from '../game/types';

interface PhoneInspectSVGProps {
  device: PhoneDevice;
  /** If true, reveals all defects directly (used in Workshop where player already owns phone) */
  revealAll?: boolean;
  compact?: boolean;
  flashKey?: number;
}

export const PhoneInspectSVG: React.FC<PhoneInspectSVGProps> = ({
  device,
  revealAll = false,
  compact = false,
  flashKey = 0,
}) => {
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

  return (
    <div
      key={flashKey}
      className={`relative flex flex-col items-center justify-center ${
        flashKey > 0 ? 'animate-repair-flash' : ''
      }`}
    >
      {/* ESD Repair Mat Frame */}
      <div
        className={`relative flex items-center justify-center rounded-xl border border-white/10 bg-[#141D26] ${
          compact ? 'p-3' : 'px-6 py-4'
        }`}
        style={{
          backgroundImage:
            'radial-gradient(rgba(148,163,184,0.12) 1px, transparent 1px)',
          backgroundSize: '14px 14px',
        }}
      >
        <svg
          width={compact ? 116 : isFold ? 170 : 148}
          height={compact ? 210 : 264}
          viewBox={isFold ? '0 0 180 280' : '0 0 156 280'}
          fill="none"
          role="img"
          aria-label={`${device.brand} ${device.model} ${side === 'front' ? 'ön görünüm' : 'arka görünüm'}`}
          className="drop-shadow-[0_16px_24px_rgba(0,0,0,0.6)] transition-transform duration-200"
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
            strokeWidth="3"
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

          {/* SIM tray liquid indicator dot (revealed on hardware check!) */}
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
              <circle cx="16" cy="200" r="5" fill="#EF4444" stroke="#11161D" strokeWidth="1.5" />
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
                fill="#E2E8F0"
                fontFamily="'Bricolage Grotesque', sans-serif"
                fontWeight="700"
                fontSize="13"
              >
                {device.brand}
              </text>
              <text
                x={isFold ? 90 : 78}
                y="78"
                textAnchor="middle"
                fill="#94A3B8"
                fontFamily="'Plus Jakarta Sans', sans-serif"
                fontWeight="500"
                fontSize="10.5"
              >
                {device.model}
              </text>

              {/* Battery Diagnostic Widget on Phone Screen */}
              <g transform={`translate(${isFold ? 38 : 28}, 98)`}>
                <rect
                  x="0"
                  y="0"
                  width="100"
                  height="42"
                  rx="8"
                  fill="#151F2E"
                  stroke={hasBatteryIssue ? '#EF4444' : isBatteryChecked ? '#10B981' : '#334155'}
                  strokeWidth="1.2"
                />
                <text
                  x="10"
                  y="16"
                  fill="#94A3B8"
                  fontFamily="'Plus Jakarta Sans', sans-serif"
                  fontSize="8.5"
                >
                  {hasFakeChip ? 'GERÇEK PİL (ÇİPLİ!)' : 'PİL SAĞLIĞI'}
                </text>
                <text
                  x="10"
                  y="33"
                  fill={hasBatteryIssue ? '#F87171' : isBatteryChecked ? '#34D399' : '#F8FAFC'}
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="700"
                  fontSize="14"
                >
                  %{displayedBattery}
                </text>
                {/* Mini battery bar */}
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
              <g transform={`translate(${isFold ? 38 : 28}, 150)`}>
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
                  strokeWidth="1.2"
                />
                <text
                  x="10"
                  y="15"
                  fill="#94A3B8"
                  fontFamily="'Plus Jakarta Sans', sans-serif"
                  fontSize="8.5"
                >
                  BTK / IMEI DURUMU
                </text>
                <text
                  x="10"
                  y="30"
                  fill={
                    hasUnregisteredImei
                      ? '#F87171'
                      : isImeiChecked
                      ? '#34D399'
                      : '#CBD5E1'
                  }
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="600"
                  fontSize="10"
                >
                  {!isImeiChecked
                    ? 'Sorgulanmadı'
                    : hasUnregisteredImei
                    ? 'YURT DIŞI!'
                    : 'TR KAYITLI'}
                </text>
              </g>

              {/* Hardware / Screen Status Strip */}
              <g transform={`translate(${isFold ? 38 : 28}, 198)`}>
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
                  strokeWidth="1.2"
                />
                <text
                  x="10"
                  y="15"
                  fill="#94A3B8"
                  fontFamily="'Plus Jakarta Sans', sans-serif"
                  fontSize="8.5"
                >
                  DONANIM / PANEL
                </text>
                <text
                  x="10"
                  y="30"
                  fill={
                    hasLiquid || hasCameraFog || hasAftermarket || hasCrack
                      ? '#FBBF24'
                      : isScreenChecked && isHardwareChecked
                      ? '#34D399'
                      : '#CBD5E1'
                  }
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="600"
                  fontSize="9.5"
                >
                  {hasLiquid
                    ? 'SIVI TEMASI!'
                    : hasCameraFog
                    ? 'SENSÖR HATA!'
                    : hasAftermarket
                    ? 'YAN SANAYİ!'
                    : hasCrack
                    ? 'CAM ÇATLAK!'
                    : isScreenChecked && isHardwareChecked
                    ? 'SORUNSUZ'
                    : 'Test Bekliyor'}
                </text>
              </g>

              {/* Cracked Glass Fracture Lines */}
              {hasCrack && (
                <g stroke="#E2E8F0" strokeOpacity="0.72" strokeWidth="1.4" strokeLinecap="round">
                  <path d="M24 38 L58 84 L42 126 L88 158" />
                  <path d="M58 84 L106 72 L130 95" />
                  <path d="M58 84 L68 118" />
                  <path d="M42 126 L22 148" />
                </g>
              )}

              {/* Aftermarket washed-out diagonal tint */}
              {hasAftermarket && (
                <rect
                  x="18"
                  y="16"
                  width={isFold ? 144 : 120}
                  height="248"
                  rx="17"
                  fill="#93C5FD"
                  fillOpacity="0.1"
                />
              )}

              {/* Mint Shine Glint */}
              {isMint && (
                <path
                  d="M28 24 L62 24 L24 92 L24 44 Z"
                  fill="#FFFFFF"
                  fillOpacity="0.09"
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
                fillOpacity="0.32"
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
                strokeOpacity="0.08"
                strokeWidth="1"
              />
              {/* Camera Module */}
              <rect
                x="26"
                y="24"
                width={device.cameraLayout === 'ultra' ? 54 : 52}
                height={device.cameraLayout === 'dual' ? 54 : 58}
                rx="13"
                fill="#0F141B"
                stroke={device.accentColor}
                strokeOpacity="0.45"
                strokeWidth="1.5"
              />
              <circle cx="40" cy="39" r="9.5" fill="#1E293B" stroke="#64748B" strokeWidth="1.6" />
              <circle cx="40" cy="39" r="4" fill={hasCameraFog ? '#94A3B8' : '#0F172A'} />
              <circle cx="40" cy="63" r="9.5" fill="#1E293B" stroke="#64748B" strokeWidth="1.6" />
              <circle cx="40" cy="63" r="4" fill={hasCameraFog ? '#94A3B8' : '#0F172A'} />
              {(device.cameraLayout === 'triple' ||
                device.cameraLayout === 'ultra' ||
                device.cameraLayout === 'fold') && (
                <>
                  <circle cx="63" cy="51" r="9" fill="#1E293B" stroke="#64748B" strokeWidth="1.6" />
                  <circle cx="63" cy="51" r="3.8" fill={hasCameraFog ? '#94A3B8' : '#0F172A'} />
                </>
              )}
              {/* Flash */}
              <circle cx="64" cy="33" r="3.5" fill="#FEF3C7" />

              {/* Camera fog overlay */}
              {hasCameraFog && (
                <circle cx="46" cy="51" r="22" fill="#CBD5E1" fillOpacity="0.32" />
              )}

              {/* Back Brand Emblem */}
              <circle
                cx={isFold ? 90 : 78}
                cy="146"
                r="14"
                stroke={device.accentColor}
                strokeOpacity="0.35"
                strokeWidth="1.8"
              />
              <text
                x={isFold ? 90 : 78}
                y="150"
                textAnchor="middle"
                fill={device.accentColor}
                fillOpacity="0.7"
                fontFamily="'Bricolage Grotesque', sans-serif"
                fontWeight="700"
                fontSize="11"
              >
                {device.brand.slice(0, 2).toUpperCase()}
              </text>

              {/* Back cosmetic scuffs if worn */}
              {hasCosmetic && (
                <g stroke="#F59E0B" strokeOpacity="0.65" strokeWidth="1.4" strokeLinecap="round">
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

          {/* Corner dents on front/back when cosmetic worn */}
          {hasCosmetic && (
            <>
              <circle cx="15" cy="264" r="5" fill="#F59E0B" fillOpacity="0.55" />
              <circle cx={isFold ? 165 : 141} cy="16" r="4.5" fill="#F59E0B" fillOpacity="0.55" />
            </>
          )}
        </svg>

        {!compact && (
          <button
            type="button"
            onClick={() => setSide((s) => (s === 'front' ? 'back' : 'front'))}
            className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#1C2531]/90 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-[#273445] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Cihazı çevir"
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-400" />
            <span>{side === 'front' ? 'Arka Yüz' : 'Ön Yüz'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
