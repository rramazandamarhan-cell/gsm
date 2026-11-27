import React from 'react';
import { useLanguage } from '../game/i18n';

interface BrandLogoProps {
  size?: 'hero' | 'compact' | 'modal';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'hero',
  className = '',
}) => {
  const { bi } = useLanguage();
  const altText = bi(
    'GSM Simulator — Telefon Al-Sat, Ekspertiz ve Tamir',
    'GSM Simulator — Phone Trading, Inspection & Repair'
  );

  if (size === 'compact') {
    return (
      <div
        className={`flex items-center select-none whitespace-nowrap shrink-0 ${className}`}
      >
        <img
          src="/brand-logo.png"
          alt={altText}
          draggable={false}
          className="h-[22px] [@media(min-height:560px)]:h-[26px] w-auto object-contain drop-shadow-[0_2px_8px_rgba(245,158,11,0.28)]"
        />
      </div>
    );
  }

  if (size === 'modal') {
    return (
      <div className={`flex items-center justify-center select-none ${className}`}>
        <img
          src="/brand-logo.png"
          alt={altText}
          draggable={false}
          className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.65)]"
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <img
        src="/brand-logo.png"
        alt={altText}
        draggable={false}
        className="w-full max-w-[170px] [@media(min-height:480px)]:max-w-[200px] [@media(min-height:660px)]:max-w-[240px] h-auto object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.85)]"
      />
    </div>
  );
};
