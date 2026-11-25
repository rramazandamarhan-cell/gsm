import React from 'react';
import {
  AccessoryId,
  DecorationId,
  MuseumItemId,
  OutfitId,
  PhoneModelSpec,
} from '../game/types';
import { getPrestigePlaqueStyle } from '../game/engine';

/** Bespoke Retro Phone SVG Illustrations for the Nostalgia Museum */
export const MuseumPhoneArt: React.FC<{
  id: MuseumItemId;
  className?: string;
}> = ({ id, className = 'w-20 h-24' }) => {
  switch (id) {
    case 'nokya_3310':
      return (
        <svg viewBox="0 0 88 112" className={className} fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="n3310Body" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>
          <rect x="16" y="6" width="56" height="100" rx="18" fill="url(#n3310Body)" stroke="#94A3B8" strokeWidth="2.2" />
          <rect x="22" y="13" width="44" height="86" rx="13" fill="#1E293B" stroke="#38BDF8" strokeOpacity="0.45" strokeWidth="1.2" />
          {/* Earpiece */}
          <rect x="36" y="18" width="16" height="3" rx="1.5" fill="#94A3B8" />
          {/* Monochrome Green LCD */}
          <rect x="27" y="26" width="34" height="23" rx="4" fill="#84CC16" stroke="#365314" strokeWidth="1.5" />
          <path d="M32 39 H42 V34 H48 V41 H55" stroke="#1A2E05" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="56" cy="33" r="1.5" fill="#1A2E05" />
          {/* Navi key */}
          <rect x="33" y="54" width="22" height="7" rx="3.5" fill="#CBD5E1" />
          {/* Classic 3x4 keypad */}
          {[0, 1, 2, 3].map((row) =>
            [0, 1, 2].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={27 + col * 12}
                y={65 + row * 7.5}
                width="9.5"
                height="5"
                rx="2.5"
                fill="#94A3B8"
              />
            ))
          )}
        </svg>
      );

    case 'eriksun_t28':
      return (
        <svg viewBox="0 0 88 112" className={className} fill="none" aria-hidden="true">
          {/* Stub antenna */}
          <rect x="57" y="4" width="6" height="19" rx="3" fill="#64748B" stroke="#CBD5E1" strokeWidth="1" />
          {/* Body */}
          <rect x="20" y="18" width="48" height="86" rx="9" fill="#312E81" stroke="#A78BFA" strokeWidth="2" />
          {/* Monochrome screen */}
          <rect x="26" y="28" width="36" height="19" rx="3" fill="#A3E635" stroke="#1E1B4B" strokeWidth="1.5" />
          <line x1="30" y1="36" x2="54" y2="36" stroke="#1E293B" strokeWidth="1.8" />
          <line x1="30" y1="41" x2="46" y2="41" stroke="#1E293B" strokeWidth="1.4" />
          {/* Active flip cover */}
          <path d="M21 68 H67 V97 Q67 103 61 103 H27 Q21 103 21 97 Z" fill="#4338CA" stroke="#C4B5FD" strokeWidth="1.5" />
          <line x1="25" y1="68" x2="63" y2="68" stroke="#F59E0B" strokeWidth="2" />
          {/* Mini keys visible above flip */}
          <circle cx="32" cy="57" r="3.5" fill="#CBD5E1" />
          <circle cx="44" cy="57" r="4" fill="#F59E0B" />
          <circle cx="56" cy="57" r="3.5" fill="#CBD5E1" />
          {/* Flip mic slots */}
          <line x1="37" y1="95" x2="51" y2="95" stroke="#E0E7FF" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );

    case 'motorazr_v3':
      return (
        <svg viewBox="0 0 88 112" className={className} fill="none" aria-hidden="true">
          {/* Upper clamshell open */}
          <rect x="20" y="6" width="48" height="44" rx="8" fill="#1F2937" stroke="#F472B6" strokeWidth="2" />
          <rect x="25" y="11" width="38" height="33" rx="4" fill="#0EA5E9" fillOpacity="0.28" stroke="#38BDF8" strokeWidth="1.2" />
          <circle cx="44" cy="27" r="7" stroke="#F472B6" strokeWidth="1.6" />
          {/* Metallic Hinge */}
          <rect x="18" y="49" width="52" height="7" rx="3.5" fill="#94A3B8" />
          {/* Razor Flat Electroluminescent Keypad */}
          <rect x="20" y="56" width="48" height="50" rx="8" fill="#111827" stroke="#F472B6" strokeWidth="1.8" />
          {/* D-Pad */}
          <circle cx="44" cy="67" r="6.5" stroke="#38BDF8" strokeWidth="1.6" />
          {/* Etched Glowing Blue Lines */}
          {[78, 86, 94].map((y) => (
            <g key={y}>
              <line x1="26" y1={y} x2="62" y2={y} stroke="#38BDF8" strokeOpacity="0.75" strokeWidth="1.3" />
            </g>
          ))}
          <line x1="38" y1="75" x2="38" y2="99" stroke="#38BDF8" strokeOpacity="0.55" strokeWidth="1.1" />
          <line x1="50" y1="75" x2="50" y2="99" stroke="#38BDF8" strokeOpacity="0.55" strokeWidth="1.1" />
        </svg>
      );

    case 'blakberi_bold':
      return (
        <svg viewBox="0 0 88 112" className={className} fill="none" aria-hidden="true">
          <rect x="12" y="8" width="64" height="96" rx="13" fill="#0F172A" stroke="#34D399" strokeWidth="2.2" />
          {/* Landscape CEO screen */}
          <rect x="18" y="16" width="52" height="32" rx="4" fill="#1E293B" stroke="#64748B" strokeWidth="1.2" />
          <rect x="22" y="21" width="20" height="4" rx="2" fill="#34D399" />
          <rect x="22" y="29" width="38" height="3" rx="1.5" fill="#94A3B8" />
          <rect x="22" y="36" width="28" height="3" rx="1.5" fill="#64748B" />
          {/* Trackball bar */}
          <line x1="16" y1="54" x2="72" y2="54" stroke="#94A3B8" strokeWidth="1.5" />
          <circle cx="44" cy="54" r="4.5" fill="#F8FAFC" stroke="#34D399" strokeWidth="1.4" />
          {/* Full QWERTY Keys */}
          {[0, 1, 2, 3].map((row) =>
            [0, 1, 2, 3, 4, 5].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={18 + col * 8.8}
                y={64 + row * 8}
                width="6.8"
                height="5.5"
                rx="1.5"
                fill="#334155"
                stroke="#64748B"
                strokeWidth="0.6"
              />
            ))
          )}
        </svg>
      );

    case 'aphone_2g':
      return (
        <svg viewBox="0 0 88 112" className={className} fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="ap2gBezel" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E2E8F0" />
              <stop offset="50%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>
          {/* Collector Chrome Frame */}
          <rect x="15" y="6" width="58" height="100" rx="12" fill="#0B111A" stroke="url(#ap2gBezel)" strokeWidth="3.2" />
          {/* Capacitive Screen with Classic Icon Grid */}
          <rect x="21" y="18" width="46" height="68" rx="3" fill="#0F172A" stroke="#334155" strokeWidth="1" />
          {[0, 1, 2].map((r) =>
            [0, 1, 2, 3].map((c) => (
              <rect
                key={`${r}-${c}`}
                x={25 + c * 10}
                y={24 + r * 11}
                width="7.5"
                height="7.5"
                rx="2"
                fill={(r + c) % 3 === 0 ? '#38BDF8' : (r + c) % 2 === 0 ? '#34D399' : '#F59E0B'}
                fillOpacity="0.88"
              />
            ))
          )}
          {/* Bottom Dock */}
          <rect x="23" y="75" width="42" height="9" rx="2" fill="#334155" />
          {/* Iconic Home Button */}
          <circle cx="44" cy="95" r="6" fill="#1E293B" stroke="#94A3B8" strokeWidth="1.2" />
          <rect x="41.5" y="92.5" width="5" height="5" rx="1" stroke="#CBD5E1" strokeWidth="1" />
        </svg>
      );
  }
};

/** Bespoke Visual Preview Art for Shop Decorations & Prestige Cards */
export const DecorPreviewArt: React.FC<{
  id: DecorationId;
  className?: string;
  prestigeLevel?: number;
}> = ({ id, className = 'w-full h-28', prestigeLevel = 0 }) => {
  switch (id) {
    case 'vintage_radio':
      return (
        <svg viewBox="0 0 240 100" className={className} fill="none" aria-hidden="true">
          <rect width="240" height="100" rx="12" fill="#15110E" />
          {/* Wooden Retro Radio Cabinet */}
          <rect x="26" y="16" width="188" height="68" rx="12" fill="#5C2D12" stroke="#D97706" strokeWidth="2.4" />
          <rect x="33" y="22" width="174" height="56" rx="8" fill="#3B1D0C" stroke="#F59E0B" strokeOpacity="0.45" strokeWidth="1.2" />
          {/* Fabric Speaker Grille */}
          <rect x="42" y="30" width="76" height="40" rx="5" fill="#1E140D" stroke="#B45309" strokeWidth="1.2" />
          {[36, 44, 52, 60].map((y) => (
            <line key={y} x1="48" y1={y} x2="112" y2={y} stroke="#D97706" strokeOpacity="0.65" strokeWidth="2" strokeLinecap="round" />
          ))}
          {/* Illuminated FM Frequency Dial */}
          <rect x="126" y="30" width="72" height="19" rx="4" fill="#17221B" stroke="#FCD34D" strokeWidth="1.4" />
          <line x1="132" y1="40" x2="192" y2="40" stroke="#FDE68A" strokeOpacity="0.6" strokeWidth="1" strokeDasharray="3 2" />
          <line x1="158" y1="32" x2="158" y2="47" stroke="#EF4444" strokeWidth="2.2" strokeLinecap="round" />
          <text x="162" y="37" fill="#FDE68A" fontSize="6.5" fontWeight="700" fontFamily="JetBrains Mono, monospace">
            FM 94.2
          </text>
          {/* Brass Knobs */}
          <circle cx="144" cy="61" r="8" fill="#1F1610" stroke="#FBBF24" strokeWidth="1.8" />
          <circle cx="144" cy="61" r="2.5" fill="#FDE68A" />
          <circle cx="180" cy="61" r="8" fill="#1F1610" stroke="#FBBF24" strokeWidth="1.8" />
          <circle cx="180" cy="61" r="2.5" fill="#FDE68A" />
        </svg>
      );
    case 'tea_boiler':
      return (
        <svg viewBox="0 0 240 100" className={className} fill="none" aria-hidden="true">
          <rect width="240" height="100" rx="12" fill="#15100C" />
          {/* Warm Ember Glow Beneath Boiler */}
          <ellipse cx="110" cy="85" rx="46" ry="7" fill="#F59E0B" fillOpacity="0.28" />
          {/* Rising Steam Wisps */}
          <path d="M98 18 C94 12, 102 8, 98 3" stroke="#FDE68A" strokeOpacity="0.7" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M116 16 C120 11, 112 7, 116 2" stroke="#FEF3C7" strokeOpacity="0.55" strokeWidth="1.6" strokeLinecap="round" />
          {/* Upper Demlik Teapot */}
          <rect x="86" y="18" width="44" height="20" rx="8" fill="#B45309" stroke="#FBBF24" strokeWidth="1.8" />
          <rect x="98" y="12" width="20" height="6" rx="3" fill="#F59E0B" />
          <path d="M130 24 C138 22, 140 31, 130 33" stroke="#FCD34D" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          {/* Main Copper Boiler Tank */}
          <rect x="66" y="38" width="84" height="44" rx="8" fill="#7C2D12" stroke="#F59E0B" strokeWidth="2.2" />
          <rect x="74" y="44" width="68" height="32" rx="4" fill="#9A3412" stroke="#FDE68A" strokeOpacity="0.4" strokeWidth="1" />
          {/* Engraved Copper Plate & Pressure Dial */}
          <circle cx="96" cy="60" r="10" fill="#1C1917" stroke="#FBBF24" strokeWidth="1.6" />
          <line x1="96" y1="60" x2="102" y2="54" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="96" cy="60" r="2" fill="#FDE68A" />
          <text x="125" y="57" textAnchor="middle" fill="#FDE68A" fontSize="7.5" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif">
            PASAJ
          </text>
          <text x="125" y="67" textAnchor="middle" fill="#FBBF24" fontSize="6.5" fontWeight="700" fontFamily="JetBrains Mono, monospace">
            TAZE DEM
          </text>
          {/* Brass Spigot & Tulip Glass Catching Pour */}
          <path d="M150 58 L166 58 L166 65" stroke="#FBBF24" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="166" y1="66" x2="166" y2="73" stroke="#DC2626" strokeWidth="2" strokeDasharray="2 2" />
          <path d="M159 73 C159 77, 161 79, 160 84 L172 84 C171 79, 173 77, 173 73 Z" fill="#991B1B" stroke="#FDE68A" strokeWidth="1.3" />
          <line x1="154" y1="86" x2="178" y2="86" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'prestige_plaque': {
      const pStyle = getPrestigePlaqueStyle(prestigeLevel);
      return (
        <svg viewBox="0 0 240 100" className={className} fill="none" aria-hidden="true">
          <rect width="240" height="100" rx="12" fill="#0F141C" />
          {/* Dark Walnut Frame */}
          <rect x="30" y="10" width="180" height="80" rx="11" fill="#1C1410" stroke={pStyle.accentHex} strokeWidth="2.2" />
          {/* Metallic Plaque Plate */}
          <rect
            x="40"
            y="18"
            width="160"
            height="64"
            rx="7"
            fill={pStyle.accentHex}
            fillOpacity={prestigeLevel > 0 ? 0.16 : 0.06}
            stroke={pStyle.accentHex}
            strokeOpacity="0.7"
            strokeWidth="1.3"
          />
          {/* Corner Rivets */}
          {[
            [47, 25],
            [193, 25],
            [47, 75],
            [193, 75],
          ].map(([cx, cy], idx) => (
            <circle key={idx} cx={cx} cy={cy} r="2.2" fill={pStyle.accentHex} />
          ))}
          {/* Crest / Star */}
          <polygon
            points="120,25 123,33 132,33 125,38 127,46 120,41 113,46 115,38 108,33 117,33"
            fill={pStyle.accentHex}
          />
          <text
            x="120"
            y="60"
            textAnchor="middle"
            fill={pStyle.accentHex}
            fontSize="11"
            fontWeight="800"
            fontFamily="Plus Jakarta Sans, sans-serif"
            letterSpacing="1.4"
          >
            {prestigeLevel > 0 ? `${pStyle.tierLabelTr.toUpperCase()} PLAKET` : 'PRESTİJ PLAKETİ'}
          </text>
          <text
            x="120"
            y="73"
            textAnchor="middle"
            fill="#CBD5E1"
            fontSize="7.5"
            fontWeight="700"
            fontFamily="JetBrains Mono, monospace"
          >
            {prestigeLevel > 0 ? `DÖNEM P${prestigeLevel} · EFSANE ESNAF` : '1. PRESTİJDE AÇILIR'}
          </text>
        </svg>
      );
    }
    case 'vintage_sign':
      return (
        <svg viewBox="0 0 240 100" className={className} fill="none" aria-hidden="true">
          <rect width="240" height="100" rx="12" fill="#131922" />
          <rect x="22" y="20" width="196" height="60" rx="10" fill="#1F160E" stroke="#F59E0B" strokeWidth="2.4" />
          <rect x="28" y="26" width="184" height="48" rx="7" stroke="#FDE68A" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="4 3" />
          <text x="120" y="52" textAnchor="middle" fill="#FBBF24" fontSize="15" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif" letterSpacing="2">
            GSM USTA SERVİS
          </text>
          <text x="120" y="67" textAnchor="middle" fill="#FDE68A" fontSize="9" fontWeight="600" letterSpacing="3">
            EST. 1998 · PASAJ
          </text>
        </svg>
      );
    case 'edison_lights':
      return (
        <svg viewBox="0 0 240 100" className={className} fill="none" aria-hidden="true">
          <rect width="240" height="100" rx="12" fill="#131820" />
          {[45, 95, 145, 195].map((x, idx) => {
            const len = idx % 2 === 0 ? 28 : 42;
            return (
              <g key={x}>
                <line x1={x} y1="0" x2={x} y2={len} stroke="#94A3B8" strokeWidth="1.5" />
                <circle cx={x} cy={len + 15} r="22" fill="#F59E0B" fillOpacity="0.16" />
                <rect x={x - 6} y={len} width="12" height="7" rx="2" fill="#B45309" />
                <ellipse cx={x} cy={len + 16} rx="9" ry="12" fill="#F59E0B" fillOpacity="0.35" stroke="#FCD34D" strokeWidth="1.5" />
                <path d={`M${x - 3} ${len + 11} L${x} ${len + 19} L${x + 3} ${len + 11}`} stroke="#FEF3C7" strokeWidth="1.5" />
              </g>
            );
          })}
        </svg>
      );
    case 'retro_shelf':
      return (
        <svg viewBox="0 0 240 100" className={className} fill="none" aria-hidden="true">
          <rect width="240" height="100" rx="12" fill="#131922" />
          {/* Warm wood shelf */}
          <rect x="20" y="74" width="200" height="9" rx="3" fill="#92400E" stroke="#D97706" strokeWidth="1" />
          {/* 4 Retro Mini Phones */}
          <rect x="38" y="24" width="26" height="50" rx="6" fill="#334155" stroke="#94A3B8" strokeWidth="1.5" />
          <rect x="43" y="30" width="16" height="14" rx="2" fill="#84CC16" />
          <rect x="86" y="30" width="24" height="44" rx="5" fill="#312E81" stroke="#A78BFA" strokeWidth="1.5" />
          <line x1="86" y1="53" x2="110" y2="53" stroke="#F59E0B" strokeWidth="2" />
          <rect x="132" y="26" width="26" height="48" rx="5" fill="#1F2937" stroke="#F472B6" strokeWidth="1.5" />
          <rect x="137" y="31" width="16" height="17" rx="2" fill="#38BDF8" fillOpacity="0.45" />
          <rect x="178" y="22" width="26" height="52" rx="6" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.8" />
          <circle cx="191" cy="66" r="3" stroke="#CBD5E1" strokeWidth="1" />
        </svg>
      );
    case 'led_showcase':
      return (
        <svg viewBox="0 0 240 100" className={className} fill="none" aria-hidden="true">
          <rect width="240" height="100" rx="12" fill="#0E1520" />
          <rect x="16" y="14" width="208" height="72" rx="10" fill="#141F2E" stroke="#F59E0B" strokeWidth="2" />
          <rect x="22" y="20" width="196" height="60" rx="7" stroke="#38BDF8" strokeOpacity="0.45" strokeWidth="1.2" />
          {/* 3 Lit glass pedestals */}
          {[62, 120, 178].map((cx) => (
            <g key={cx}>
              <rect x={cx - 12} y="30" width="24" height="38" rx="4" fill="#1E293B" stroke="#E2E8F0" strokeWidth="1.2" />
              <ellipse cx={cx} cy="73" rx="18" ry="3.5" fill="#F59E0B" fillOpacity="0.55" />
            </g>
          ))}
        </svg>
      );
    case 'tea_corner':
      return (
        <svg viewBox="0 0 240 100" className={className} fill="none" aria-hidden="true">
          <rect width="240" height="100" rx="12" fill="#171411" />
          {/* Brass Samovar */}
          <rect x="46" y="34" width="44" height="48" rx="12" fill="#B45309" stroke="#F59E0B" strokeWidth="2" />
          <rect x="57" y="18" width="22" height="16" rx="4" fill="#D97706" stroke="#FCD34D" strokeWidth="1.4" />
          <line x1="90" y1="62" x2="104" y2="62" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
          {/* Two Tulip Tea Glasses */}
          {[126, 158].map((x) => (
            <g key={x}>
              <path d={`M${x} 46 C${x} 56 ${x + 3} 62 ${x - 2} 76 L${x + 20} 76 C${x + 15} 62 ${x + 18} 56 ${x + 18} 46 Z`} fill="#991B1B" stroke="#FDE68A" strokeWidth="1.6" />
              <line x1={x - 5} y1="79" x2={x + 23} y2="79" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          ))}
          {/* Nazar Bead */}
          <circle cx="204" cy="44" r="14" fill="#1D4ED8" stroke="#93C5FD" strokeWidth="1.8" />
          <circle cx="204" cy="44" r="7" fill="#F8FAFC" />
          <circle cx="204" cy="44" r="3.2" fill="#1E3A8A" />
        </svg>
      );
    case 'vip_lounge':
      return (
        <svg viewBox="0 0 240 100" className={className} fill="none" aria-hidden="true">
          <rect width="240" height="100" rx="12" fill="#141118" />
          {/* Luxury Gold Arch Backdrop */}
          <rect x="14" y="10" width="212" height="80" rx="10" fill="#1C1622" stroke="#F59E0B" strokeOpacity="0.65" strokeWidth="1.6" />
          {/* Leather VIP Sofa */}
          <rect x="34" y="42" width="96" height="28" rx="8" fill="#581C1C" stroke="#F59E0B" strokeWidth="1.4" />
          <rect x="28" y="52" width="14" height="24" rx="4" fill="#7F1D1D" stroke="#FBBF24" strokeWidth="1.2" />
          <rect x="122" y="52" width="14" height="24" rx="4" fill="#7F1D1D" stroke="#FBBF24" strokeWidth="1.2" />
          <rect x="38" y="64" width="88" height="12" rx="4" fill="#991B1B" />
          {/* Marble & Gold Flagship Pedestal */}
          <rect x="162" y="48" width="44" height="30" rx="5" fill="#1E293B" stroke="#FBBF24" strokeWidth="1.5" />
          <rect x="174" y="24" width="20" height="26" rx="4" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.4" />
          <text x="184" y="67" textAnchor="middle" fill="#FCD34D" fontSize="9" fontWeight="800" fontFamily="JetBrains Mono, monospace">
            VIP
          </text>
        </svg>
      );
  }
};

/** Product-Accurate Visual Illustrations for Wholesale Accessories */
export const AccessoryProductArt: React.FC<{
  id: AccessoryId;
  className?: string;
}> = ({ id, className = 'w-14 h-14' }) => {
  switch (id) {
    case 'tempered_glass':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
          <rect x="16" y="6" width="32" height="52" rx="7" fill="#0EA5E9" fillOpacity="0.16" stroke="#38BDF8" strokeWidth="2" />
          <path d="M21 18 L43 10 M21 30 L43 22" stroke="#BAE6FD" strokeWidth="1.8" strokeOpacity="0.65" strokeLinecap="round" />
          <rect x="27" y="10" width="10" height="2.5" rx="1.2" fill="#38BDF8" />
          <text x="32" y="45" textAnchor="middle" fill="#7DD3FC" fontSize="9" fontWeight="800" fontFamily="JetBrains Mono, monospace">
            9H
          </text>
        </svg>
      );
    case 'magsafe_case':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
          <rect x="16" y="6" width="32" height="52" rx="8" fill="#1E293B" stroke="#F59E0B" strokeWidth="2" />
          <rect x="20" y="10" width="12" height="12" rx="3.5" fill="#0F172A" stroke="#64748B" strokeWidth="1.2" />
          {/* MagKlik Ring */}
          <circle cx="32" cy="36" r="9.5" stroke="#FBBF24" strokeWidth="2.4" />
          <line x1="32" y1="48" x2="32" y2="53" stroke="#FBBF24" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
    case 'car_mount':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
          {/* Magnetic disc head */}
          <circle cx="32" cy="24" r="14" fill="#1E293B" stroke="#FB923C" strokeWidth="2.2" />
          <circle cx="32" cy="24" r="8" stroke="#FDBA74" strokeWidth="1.6" strokeDasharray="3 2" />
          {/* Arm & Suction Base */}
          <path d="M32 38 V49" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
          <path d="M18 53 Q32 47 46 53" stroke="#CBD5E1" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );
    case 'gan_charger':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
          {/* EU Prongs */}
          <line x1="25" y1="7" x2="25" y2="16" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
          <line x1="39" y1="7" x2="39" y2="16" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
          {/* GaN Compact Brick */}
          <rect x="16" y="16" width="32" height="34" rx="7" fill="#1E293B" stroke="#34D399" strokeWidth="2" />
          <text x="32" y="34" textAnchor="middle" fill="#6EE7B7" fontSize="9.5" fontWeight="800" fontFamily="JetBrains Mono, monospace">
            30W
          </text>
          {/* USB-C Port & Cable */}
          <rect x="27" y="42" width="10" height="3.5" rx="1.7" fill="#10B981" />
          <path d="M32 50 V58" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'powerbank':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
          <rect x="13" y="10" width="38" height="44" rx="8" fill="#1E293B" stroke="#A3E635" strokeWidth="2" />
          {/* LED Charge Bars */}
          <rect x="20" y="18" width="24" height="7" rx="2.5" fill="#0F172A" />
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={24 + i * 5.2} cy="21.5" r="1.6" fill="#A3E635" />
          ))}
          <text x="32" y="39" textAnchor="middle" fill="#D9F99D" fontSize="8.5" fontWeight="800" fontFamily="JetBrains Mono, monospace">
            10.000
          </text>
          <text x="32" y="48" textAnchor="middle" fill="#94A3B8" fontSize="6.5" fontFamily="JetBrains Mono, monospace">
            mAh PD
          </text>
        </svg>
      );
    case 'tws_earbuds':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
          {/* Open charging case */}
          <rect x="11" y="22" width="42" height="30" rx="11" fill="#1E293B" stroke="#818CF8" strokeWidth="2" />
          <path d="M13 24 Q32 10 51 24" fill="#312E81" stroke="#818CF8" strokeWidth="1.6" />
          {/* Two Earbud stems */}
          <circle cx="24" cy="28" r="5" fill="#E0E7FF" />
          <rect x="22" y="31" width="3.5" height="10" rx="1.7" fill="#C7D2FE" />
          <circle cx="40" cy="28" r="5" fill="#E0E7FF" />
          <rect x="38.5" y="31" width="3.5" height="10" rx="1.7" fill="#C7D2FE" />
          <circle cx="32" cy="43" r="2" fill="#34D399" />
        </svg>
      );
  }
};

/** Sealed Brand-New Smartphone Retail Box Art for Wholesale Distributors */
export const PhoneBoxArt: React.FC<{
  spec: PhoneModelSpec;
  className?: string;
}> = ({ spec, className = 'w-14 h-16' }) => {
  return (
    <svg viewBox="0 0 64 76" className={className} fill="none" aria-hidden="true">
      {/* Sealed Retail Box */}
      <rect x="6" y="4" width="52" height="68" rx="8" fill="#111827" stroke="#34D399" strokeWidth="1.8" />
      {/* Phone silhouette printed on box */}
      <rect
        x="16"
        y="12"
        width="32"
        height="48"
        rx="6"
        fill={spec.bodyColor}
        stroke={spec.accentColor}
        strokeWidth="1.5"
      />
      {/* Camera Island matching cameraLayout */}
      {spec.cameraLayout === 'dual' && (
        <g>
          <rect x="20" y="16" width="12" height="16" rx="3" fill="#090D14" />
          <circle cx="26" cy="20.5" r="2.6" fill="#334155" stroke="#94A3B8" strokeWidth="0.9" />
          <circle cx="26" cy="27.5" r="2.6" fill="#334155" stroke="#94A3B8" strokeWidth="0.9" />
        </g>
      )}
      {spec.cameraLayout === 'triple' && (
        <g>
          <rect x="19" y="16" width="15" height="16" rx="3.5" fill="#090D14" />
          <circle cx="23.5" cy="20.5" r="2.4" fill="#334155" stroke="#94A3B8" strokeWidth="0.9" />
          <circle cx="23.5" cy="27.5" r="2.4" fill="#334155" stroke="#94A3B8" strokeWidth="0.9" />
          <circle cx="30" cy="24" r="2.4" fill="#334155" stroke="#94A3B8" strokeWidth="0.9" />
        </g>
      )}
      {spec.cameraLayout === 'ultra' && (
        <g>
          <circle cx="32" cy="25" r="9.5" fill="#090D14" stroke={spec.accentColor} strokeWidth="1.2" />
          <circle cx="29" cy="22.5" r="2.3" fill="#38BDF8" fillOpacity="0.6" />
          <circle cx="35.5" cy="22.5" r="2.1" fill="#94A3B8" />
          <circle cx="32" cy="29" r="2.5" fill="#CBD5E1" />
        </g>
      )}
      {spec.cameraLayout === 'fold' && (
        <g>
          <line x1="32" y1="13" x2="32" y2="59" stroke={spec.accentColor} strokeWidth="1.6" strokeDasharray="3 2" />
          <circle cx="24" cy="22" r="2.5" fill="#090D14" stroke="#94A3B8" strokeWidth="0.9" />
          <circle cx="24" cy="29" r="2.5" fill="#090D14" stroke="#94A3B8" strokeWidth="0.9" />
        </g>
      )}
      {/* Sealed Ribbon */}
      <rect x="12" y="62" width="40" height="7" rx="2" fill="#065F46" />
      <text x="32" y="67.5" textAnchor="middle" fill="#A7F3D0" fontSize="5.5" fontWeight="800" fontFamily="JetBrains Mono, monospace">
        SIFIR KUTU
      </text>
    </svg>
  );
};

/** Bespoke Wardrobe Outfit Art for Player Customization */
export const OutfitAvatarArt: React.FC<{
  id: OutfitId;
  className?: string;
}> = ({ id, className = 'w-16 h-16' }) => {
  switch (id) {
    case 'casual_hoodie':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
          <path d="M16 18 L24 12 H40 L48 18 L54 34 L46 37 L44 54 H20 L18 37 L10 34 Z" fill="#334155" stroke="#94A3B8" strokeWidth="2" />
          <path d="M24 12 Q32 22 40 12" stroke="#CBD5E1" strokeWidth="2" />
          <line x1="29" y1="18" x2="29" y2="30" stroke="#E2E8F0" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="35" y1="18" x2="35" y2="30" stroke="#E2E8F0" strokeWidth="1.6" strokeLinecap="round" />
          <rect x="24" y="40" width="16" height="9" rx="3" fill="#1E293B" stroke="#64748B" strokeWidth="1.2" />
        </svg>
      );
    case 'traditional_vest':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
          {/* White undershirt */}
          <path d="M18 16 H46 L52 34 L44 37 V54 H20 V37 L12 34 Z" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
          {/* Warm Brown Esnaf Vest */}
          <path d="M20 14 L32 28 L44 14 L46 54 H18 Z" fill="#78350F" stroke="#F59E0B" strokeWidth="2" />
          <line x1="32" y1="28" x2="32" y2="54" stroke="#FBBF24" strokeWidth="1.6" />
          <circle cx="35" cy="36" r="1.6" fill="#FDE68A" />
          <circle cx="35" cy="43" r="1.6" fill="#FDE68A" />
          <circle cx="35" cy="50" r="1.6" fill="#FDE68A" />
        </svg>
      );
    case 'tech_esd_coat':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
          <path d="M16 16 L24 12 H40 L48 16 L54 36 L46 39 L45 55 H19 L18 39 L10 36 Z" fill="#0369A1" stroke="#38BDF8" strokeWidth="2" />
          <path d="M25 12 L32 24 L39 12" fill="#0F172A" stroke="#7DD3FC" strokeWidth="1.5" />
          <rect x="35" y="27" width="8" height="6" rx="1.5" fill="#0C4A6E" stroke="#7DD3FC" strokeWidth="1" />
          <line x1="32" y1="24" x2="32" y2="55" stroke="#BAE6FD" strokeWidth="1.4" />
        </svg>
      );
    case 'formal_shirt':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
          <path d="M16 17 L24 12 H40 L48 17 L54 35 L46 38 L44 54 H20 L18 38 L10 35 Z" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2" />
          <path d="M24 12 L32 21 L40 12" stroke="#64748B" strokeWidth="1.8" />
          {/* Crisp Tie */}
          <path d="M30 20 H34 L35 45 L32 49 L29 45 Z" fill="#0F172A" stroke="#38BDF8" strokeWidth="1" />
        </svg>
      );
    case 'italian_blazer':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
          <path d="M14 17 L24 12 H40 L50 17 L55 37 L47 40 L45 55 H19 L17 40 L9 37 Z" fill="#1E3A8A" stroke="#60A5FA" strokeWidth="2" />
          <path d="M24 12 L32 32 L40 12 Z" fill="#F8FAFC" />
          <path d="M24 12 L29 30 M40 12 L35 30" stroke="#93C5FD" strokeWidth="2" />
          {/* Pocket Square */}
          <path d="M38 28 L44 26 L44 30 H38 Z" fill="#F59E0B" />
        </svg>
      );
    case 'boss_suit':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
          <path d="M14 16 L24 11 H40 L50 16 L55 38 L47 41 L45 55 H19 L17 41 L9 38 Z" fill="#111827" stroke="#F59E0B" strokeWidth="2.2" />
          <path d="M24 11 L32 33 L40 11 Z" fill="#F8FAFC" />
          {/* Gold Silk Tie */}
          <path d="M30 16 H34 L35 33 L32 37 L29 33 Z" fill="#F59E0B" />
          {/* Gold Lapel Pin */}
          <circle cx="39" cy="24" r="2.2" fill="#FBBF24" />
          <circle cx="32" cy="43" r="1.8" fill="#F59E0B" />
        </svg>
      );
  }
};
