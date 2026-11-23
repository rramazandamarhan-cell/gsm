import React from 'react';

interface BrandLogoProps {
  size?: 'hero' | 'compact';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'hero' }) => {
  if (size === 'compact') {
    return (
      <div className="flex items-center gap-2.5 select-none whitespace-nowrap shrink-0">
        <svg
          width="28"
          height="28"
          viewBox="0 0 36 36"
          fill="none"
          aria-hidden="true"
          className="shrink-0"
        >
          <rect
            x="3"
            y="3"
            width="30"
            height="30"
            rx="7"
            fill="#1A222D"
            stroke="#F59E0B"
            strokeWidth="2"
          />
          <rect x="11" y="8" width="14" height="20" rx="2.5" stroke="#F8FAFC" strokeWidth="1.8" />
          <line x1="15.5" y1="24.5" x2="20.5" y2="24.5" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M15 13.5C16.5 12 19.5 12 21 13.5" stroke="#F59E0B" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M16.8 16C17.5 15.3 18.5 15.3 19.2 16" stroke="#10B981" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <span className="font-display text-lg font-extrabold tracking-tight text-slate-50">
          GSM <span className="text-amber-400">Simulator</span>
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center select-none">
      <svg
        width="400"
        height="114"
        viewBox="0 0 400 114"
        fill="none"
        role="img"
        aria-label="GSM Simulator — Telefon Al-Sat, Ekspertiz ve Tamir"
        className="w-full max-w-[400px] h-auto drop-shadow-[0_12px_30px_rgba(0,0,0,0.68)]"
      >
        <rect
          x="6"
          y="6"
          width="388"
          height="102"
          rx="14"
          fill="#121821"
          fillOpacity="0.93"
          stroke="#F59E0B"
          strokeWidth="2.5"
        />
        <rect
          x="13"
          y="13"
          width="374"
          height="88"
          rx="9"
          stroke="#F59E0B"
          strokeOpacity="0.28"
          strokeWidth="1"
        />

        {/* Custom geometric phone & signal emblem */}
        <g transform="translate(24, 26)">
          <rect
            x="0"
            y="0"
            width="52"
            height="62"
            rx="10"
            fill="#1D2633"
            stroke="#F59E0B"
            strokeWidth="2"
          />
          <rect
            x="13"
            y="10"
            width="26"
            height="42"
            rx="4"
            fill="#0F141B"
            stroke="#F8FAFC"
            strokeWidth="2"
          />
          <path
            d="M19.5 23C22.8 19.8 29.2 19.8 32.5 23"
            stroke="#F59E0B"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M22.2 27.5C24.2 25.5 27.8 25.5 29.8 27.5"
            stroke="#10B981"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="26" cy="33" r="2.2" fill="#F8FAFC" />
          <line
            x1="21"
            y1="45"
            x2="31"
            y2="45"
            stroke="#F59E0B"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* Bold Shop Wordmark */}
        <text
          x="94"
          y="60"
          fill="#F59E0B"
          fontFamily="'Bricolage Grotesque', sans-serif"
          fontWeight="800"
          fontSize="36"
          letterSpacing="-0.5"
        >
          GSM
        </text>
        <text
          x="184"
          y="60"
          fill="#F8FAFC"
          fontFamily="'Bricolage Grotesque', sans-serif"
          fontWeight="800"
          fontSize="36"
          letterSpacing="-0.8"
        >
          Simulator
        </text>

        <line
          x1="94"
          y1="72"
          x2="366"
          y2="72"
          stroke="#FFFFFF"
          strokeOpacity="0.14"
          strokeWidth="1"
        />
        <text
          x="94"
          y="90"
          fill="#CBD5E1"
          fontFamily="'Plus Jakarta Sans', sans-serif"
          fontWeight="600"
          fontSize="12"
          letterSpacing="1.6"
        >
          EKSPERTİZ · TAMİR · PAZARLIK · SHOWROOM
        </text>
      </svg>
    </div>
  );
};
