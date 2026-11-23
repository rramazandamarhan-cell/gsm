import React from 'react';
import { CustomerMood } from '../game/types';

interface CustomerAvatarProps {
  name: string;
  title: string;
  portraitPath: string;
  fallbackColor: string;
  mood: CustomerMood;
  moodScore: number;
  isVip?: boolean;
  isAccessoryBuyer?: boolean;
  size?: 'sm' | 'lg';
  portraitFailed: boolean;
  onPortraitError: () => void;
  shakeKey?: number;
}

export const CustomerAvatar: React.FC<CustomerAvatarProps> = ({
  name,
  title,
  portraitPath,
  fallbackColor,
  mood,
  moodScore,
  isVip = false,
  isAccessoryBuyer = false,
  size = 'sm',
  portraitFailed,
  onPortraitError,
  shakeKey = 0,
}) => {
  const isLg = size === 'lg';

  const frameStyle = (() => {
    switch (mood) {
      case 'excited':
        return 'border-emerald-400 shadow-[0_0_22px_rgba(16,185,129,0.42)]';
      case 'happy':
        return 'border-emerald-400/80 shadow-[0_0_16px_rgba(16,185,129,0.28)]';
      case 'calm':
        return isVip
          ? 'border-amber-400/80 shadow-[0_0_14px_rgba(245,158,11,0.24)]'
          : isAccessoryBuyer
          ? 'border-emerald-400/70'
          : 'border-white/20';
      case 'thinking':
        return 'border-amber-400/75 shadow-[0_0_14px_rgba(245,158,11,0.22)]';
      case 'annoyed':
        return 'border-orange-500/85 shadow-[0_0_18px_rgba(249,115,22,0.34)]';
      case 'angry':
        return 'border-rose-500 shadow-[0_0_24px_rgba(244,63,94,0.52)]';
    }
  })();

  // Subtle CSS filter & transform transitions on the portrait for real emotional presence
  const portraitMotionStyle: React.CSSProperties = (() => {
    switch (mood) {
      case 'excited':
        return {
          filter: 'brightness(1.09) saturate(1.18) contrast(1.03)',
          transform: 'scale(1.05) translateY(-1px)',
        };
      case 'happy':
        return {
          filter: 'brightness(1.05) saturate(1.1)',
          transform: 'scale(1.02)',
        };
      case 'calm':
        return {
          filter: 'brightness(1) saturate(1)',
          transform: 'scale(1)',
        };
      case 'thinking':
        return {
          filter: 'brightness(0.96) saturate(0.88) contrast(1.04)',
          transform: 'scale(1.01) rotate(-1.2deg)',
        };
      case 'annoyed':
        return {
          filter: 'brightness(0.94) saturate(1.12) sepia(0.14) contrast(1.08)',
          transform: 'scale(1.03) rotate(1.4deg)',
        };
      case 'angry':
        return {
          filter: 'brightness(0.9) saturate(1.3) sepia(0.24) hue-rotate(-14deg) contrast(1.15)',
          transform: 'scale(1.07) rotate(-2deg)',
        };
    }
  })();

  // Dynamic SVG facial feature parameters smoothly transitioned by CSS
  const faceConfig = (() => {
    switch (mood) {
      case 'excited':
        return {
          bg: '#064E3B',
          ring: '#34D399',
          skin: '#FDE68A',
          leftBrow: 'translateY(-2px) rotate(-10deg)',
          rightBrow: 'translateY(-2px) rotate(10deg)',
          eyeScaleY: 0.72,
          mouthPath: 'M 10 21 Q 16 28 22 21',
          mouthFill: '#991B1B',
          blushOpacity: 0.65,
        };
      case 'happy':
        return {
          bg: '#065F46',
          ring: '#10B981',
          skin: '#FDE68A',
          leftBrow: 'translateY(-1px) rotate(-5deg)',
          rightBrow: 'translateY(-1px) rotate(5deg)',
          eyeScaleY: 1,
          mouthPath: 'M 11 21 Q 16 26 21 21',
          mouthFill: 'none',
          blushOpacity: 0.42,
        };
      case 'calm':
        return {
          bg: '#1E293B',
          ring: '#94A3B8',
          skin: '#FDE68A',
          leftBrow: 'translateY(0px) rotate(0deg)',
          rightBrow: 'translateY(0px) rotate(0deg)',
          eyeScaleY: 1,
          mouthPath: 'M 12 22 Q 16 23.2 20 22',
          mouthFill: 'none',
          blushOpacity: 0,
        };
      case 'thinking':
        return {
          bg: '#451A03',
          ring: '#F59E0B',
          skin: '#FDE68A',
          leftBrow: 'translateY(-2px) rotate(-8deg)',
          rightBrow: 'translateY(1px) rotate(10deg)',
          eyeScaleY: 0.85,
          mouthPath: 'M 12 23 Q 16 21.5 20 23.5',
          mouthFill: 'none',
          blushOpacity: 0,
        };
      case 'annoyed':
        return {
          bg: '#431407',
          ring: '#F97316',
          skin: '#FDBA74',
          leftBrow: 'translateY(1.5px) rotate(15deg)',
          rightBrow: 'translateY(1.5px) rotate(-15deg)',
          eyeScaleY: 0.72,
          mouthPath: 'M 11 24 Q 16 21 21 24',
          mouthFill: 'none',
          blushOpacity: 0.2,
        };
      case 'angry':
        return {
          bg: '#4C0519',
          ring: '#F43F5E',
          skin: '#FCA5A5',
          leftBrow: 'translateY(2.5px) rotate(24deg)',
          rightBrow: 'translateY(2.5px) rotate(-24deg)',
          eyeScaleY: 0.62,
          mouthPath: 'M 10 25 Q 16 19.5 22 25',
          mouthFill: '#7F1D1D',
          blushOpacity: 0.55,
        };
    }
  })();

  const ambientOverlayBg = (() => {
    switch (mood) {
      case 'excited':
        return 'radial-gradient(circle at 50% 10%, rgba(52,211,153,0.28), transparent 68%)';
      case 'happy':
        return 'radial-gradient(circle at 50% 10%, rgba(16,185,129,0.18), transparent 65%)';
      case 'thinking':
        return 'radial-gradient(circle at 80% 15%, rgba(245,158,11,0.18), transparent 60%)';
      case 'annoyed':
        return 'radial-gradient(circle at 50% 20%, rgba(249,115,22,0.24), transparent 72%)';
      case 'angry':
        return 'radial-gradient(circle at 50% 20%, rgba(244,63,94,0.36), transparent 74%)';
      default:
        return 'none';
    }
  })();

  return (
    <div
      key={shakeKey}
      className={`relative shrink-0 ${shakeKey > 0 ? 'animate-subtle-shake' : ''}`}
    >
      {/* Main Illustrated Portrait with Smooth CSS Mood Transitions */}
      <div
        className={`relative overflow-hidden border-2 transition-all duration-300 ease-out ${
          isLg ? 'h-32 w-32 sm:h-36 sm:w-36 rounded-2xl' : 'h-20 w-20 rounded-xl'
        } ${frameStyle}`}
        style={{ backgroundColor: fallbackColor }}
      >
        {!portraitFailed ? (
          <img
            src={portraitPath}
            alt={`${name} — ${title}`}
            referrerPolicy="no-referrer"
            onError={onPortraitError}
            style={portraitMotionStyle}
            className="h-full w-full object-cover object-top transition-all duration-300 ease-out"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center font-display text-3xl font-bold text-white/90">
            {name.slice(0, 1)}
          </div>
        )}

        {/* Mood Lighting Tint Layer */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{ background: ambientOverlayBg }}
        />

        {/* Contextual Comic Expression Cue Layer (Top-Left) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1 left-1 flex items-center gap-0.5 transition-all duration-300"
        >
          {(mood === 'excited' || mood === 'happy') && (
            <svg viewBox="0 0 24 24" className="w-4 h-4 drop-shadow">
              <path
                d="M12 2 L14.2 8.8 L21 11 L14.2 13.2 L12 20 L9.8 13.2 L3 11 L9.8 8.8 Z"
                fill={mood === 'excited' ? '#34D399' : '#FBBF24'}
              />
            </svg>
          )}
          {mood === 'thinking' && (
            <div className="flex items-center gap-0.5 rounded-full bg-slate-950/75 px-1.5 py-0.5 border border-amber-400/40">
              <span className="h-1 w-1 rounded-full bg-amber-300 animate-pulse" />
              <span className="h-1 w-1 rounded-full bg-amber-300 animate-pulse" />
              <span className="h-1 w-1 rounded-full bg-amber-300 animate-pulse" />
            </div>
          )}
          {mood === 'annoyed' && (
            <svg viewBox="0 0 20 24" className="w-3.5 h-4 drop-shadow">
              <path
                d="M10 2 C10 2 4 10 4 14.5 C4 18 6.7 21 10 21 C13.3 21 16 18 16 14.5 C16 10 10 2 10 2 Z"
                fill="#38BDF8"
                stroke="#0F172A"
                strokeWidth="1.5"
              />
            </svg>
          )}
          {mood === 'angry' && (
            <svg viewBox="0 0 24 24" className="w-4 h-4 drop-shadow">
              <path
                d="M5 10 Q9 10 9 5 M19 10 Q15 10 15 5 M5 14 Q9 14 9 19 M19 14 Q15 14 15 19"
                fill="none"
                stroke="#FB7185"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>
      </div>

      {/* State-Based Dynamic Facial Expression SVG Overlay (Bottom-Right Corner) */}
      <div
        title={`Müşteri Ruh Hali: %${moodScore}`}
        className={`absolute -bottom-1.5 -right-1.5 rounded-full border-2 shadow-lg transition-all duration-300 ease-out flex items-center justify-center ${
          isLg ? 'h-9 w-9' : 'h-7 w-7'
        }`}
        style={{
          backgroundColor: faceConfig.bg,
          borderColor: faceConfig.ring,
        }}
      >
        <svg viewBox="0 0 32 32" className="h-full w-full p-0.5" aria-hidden="true">
          {/* Face Disc */}
          <circle
            cx="16"
            cy="16"
            r="12"
            fill={faceConfig.skin}
            className="transition-colors duration-300"
          />
          {/* Cheek Blush */}
          <circle
            cx="9.5"
            cy="19"
            r="2.2"
            fill="#F43F5E"
            style={{ opacity: faceConfig.blushOpacity, transition: 'opacity 300ms ease' }}
          />
          <circle
            cx="22.5"
            cy="19"
            r="2.2"
            fill="#F43F5E"
            style={{ opacity: faceConfig.blushOpacity, transition: 'opacity 300ms ease' }}
          />
          {/* Eyebrows with CSS Transform Transitions */}
          <line
            x1="8.5"
            y1="11"
            x2="13.5"
            y2="11"
            stroke="#1E293B"
            strokeWidth="1.9"
            strokeLinecap="round"
            style={{
              transformOrigin: '11px 11px',
              transform: faceConfig.leftBrow,
              transition: 'transform 280ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
          <line
            x1="18.5"
            y1="11"
            x2="23.5"
            y2="11"
            stroke="#1E293B"
            strokeWidth="1.9"
            strokeLinecap="round"
            style={{
              transformOrigin: '21px 11px',
              transform: faceConfig.rightBrow,
              transition: 'transform 280ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
          {/* Eyes */}
          <ellipse
            cx="11.5"
            cy="15.2"
            rx="1.6"
            ry={1.9 * faceConfig.eyeScaleY}
            fill="#0F172A"
            style={{ transition: 'all 250ms ease' }}
          />
          <ellipse
            cx="20.5"
            cy="15.2"
            rx="1.6"
            ry={1.9 * faceConfig.eyeScaleY}
            fill="#0F172A"
            style={{ transition: 'all 250ms ease' }}
          />
          {/* Dynamic Mouth Curve */}
          <path
            d={faceConfig.mouthPath}
            fill={faceConfig.mouthFill}
            stroke="#1E293B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transition: 'all 280ms ease' }}
          />
        </svg>
      </div>
    </div>
  );
};
