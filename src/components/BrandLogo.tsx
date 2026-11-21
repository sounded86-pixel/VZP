import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number;
  variant?: 'icon' | 'text-light' | 'text-dark' | 'badge';
}

export default function BrandLogo({ className = '', size = 32, variant = 'icon' }: BrandLogoProps) {
  // Brand Colors defined in the brand sheet
  const primaryGreen = "#287530";
  const secondaryGreen = "#6FD000";

  // Standalone Handshake Brandmark SVG
  const renderBrandmark = (iconSize: number) => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block transition-transform duration-300 hover:scale-110 active:scale-95"
    >
      {/* Background soft glow / halo for depth */}
      <circle cx="50" cy="55" r="40" fill="url(#brandGlow)" opacity="0.15" />

      <defs>
        <radialGradient id="brandGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={secondaryGreen} />
          <stop offset="100%" stopColor={primaryGreen} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Left Head */}
      <circle cx="32" cy="20" r="8.5" fill={primaryGreen} />
      
      {/* Right Head */}
      <circle cx="68" cy="20" r="8.5" fill={secondaryGreen} />
      
      {/* Left Body & Arm (Thick curved shape forming the left side of crescent) */}
      <path
        d="M 32 33 
           C 18 36, 10 52, 10 68 
           C 10 85, 28 93, 50 93
           C 50 93, 50 82, 50 82
           C 34 82, 22 76, 22 68
           C 22 58, 27 47, 38 45"
        fill={primaryGreen}
      />
      
      {/* Right Body & Arm (Thick curved shape forming the right side of crescent) */}
      <path
        d="M 68 33 
           C 82 36, 90 52, 90 68 
           C 90 85, 72 93, 50 93
           C 50 93, 50 82, 50 82
           C 66 82, 78 76, 78 68
           C 78 58, 73 47, 62 45"
        fill={secondaryGreen}
      />

      {/* Connection Handshake Detail in the Center */}
      {/* Left Hand extending */}
      <path
        d="M 38 45 C 43 44, 46 44, 49 48 L 54 53"
        stroke={primaryGreen}
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Right Hand extending */}
      <path
        d="M 62 45 C 57 44, 54 44, 51 48 L 46 53"
        stroke={secondaryGreen}
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Interlocking fingers highlighted with clean white highlights */}
      <g stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" opacity="0.95">
        <line x1="47" y1="48.5" x2="53" y2="48.5" />
        <line x1="46" y1="51.5" x2="54" y2="51.5" />
        <line x1="47.5" y1="54.5" x2="52.5" y2="54.5" />
      </g>
    </svg>
  );

  // Icon only
  if (variant === 'icon') {
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
        {renderBrandmark(size)}
      </div>
    );
  }

  // Full brand version for light background
  if (variant === 'text-light') {
    return (
      <div className={`flex items-center gap-3 select-none ${className}`}>
        <div className="flex items-center justify-center bg-[#EBF7ED] p-2 rounded-2xl shadow-sm border border-emerald-100/60 transition-all hover:bg-[#E2F3E5]">
          {renderBrandmark(size)}
        </div>
        <div className="flex flex-col">
          <span 
            className="text-base sm:text-lg font-black tracking-tight text-[#0F172A] uppercase leading-none" 
            style={{ fontFamily: '"Nexa Bold", "Inter", sans-serif' }}
          >
            Взаимопомощь
          </span>
          <span className="text-[10px] text-[#287530] font-extrabold uppercase tracking-wider mt-1">
            ПОРТАЛ ДОБРОСОСЕДСТВА
          </span>
        </div>
      </div>
    );
  }

  // Full brand version for dark background (Header navigation)
  if (variant === 'text-dark') {
    return (
      <div className={`flex items-center gap-2.5 select-none ${className}`}>
        <div className="flex items-center justify-center bg-white p-1.5 rounded-xl shadow-md transition-all hover:scale-105">
          {renderBrandmark(size)}
        </div>
        <div className="flex flex-col">
          <span 
            className="text-sm sm:text-base font-black tracking-tight text-white uppercase leading-none" 
            style={{ fontFamily: '"Nexa Bold", "Inter", sans-serif' }}
          >
            Взаимопомощь
          </span>
          <span className="text-[8px] text-[#6FD000] font-black uppercase tracking-widest mt-1">
            ЕДИНЫЙ РАЙОН
          </span>
        </div>
      </div>
    );
  }

  // Badge variant (Horizontal dark bg badge version, as seen in Section 1 and 3 of brand sheet)
  return (
    <div className={`inline-flex items-center gap-3.5 px-4 py-2.5 bg-[#1B4D22] border border-[#287530]/40 rounded-2xl shadow-lg ${className}`}>
      <div className="flex items-center justify-center bg-white p-1.5 rounded-xl shadow-sm">
        {renderBrandmark(24)}
      </div>
      <div className="flex flex-col">
        <span 
          className="text-sm font-black tracking-tight text-white uppercase leading-none"
          style={{ fontFamily: '"Nexa Bold", "Inter", sans-serif' }}
        >
          Взаимопомощь
        </span>
        <span className="text-[8px] text-[#6FD000] font-bold uppercase tracking-wider mt-0.5">
          ОТ СЕРДЦА К СЕРДЦУ
        </span>
      </div>
    </div>
  );
}
