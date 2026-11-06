import React from 'react';

interface NexoraLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const NexoraLogo: React.FC<NexoraLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* 3D Titanium Prism Monogram Icon */}
      <div className={`${iconDimensions[size]} relative flex-shrink-0 group`}>
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_4px_16px_rgba(109,155,203,0.35)] transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            <linearGradient id="logoPrism" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#EDF4FC" />
              <stop offset="35%" stop-color="#B5D7F5" />
              <stop offset="70%" stop-color="#6D9BCB" />
              <stop offset="100%" stop-color="#1B2A3D" />
            </linearGradient>
            <linearGradient id="logoGlow" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#6D9BCB" stop-opacity="0.9" />
              <stop offset="100%" stop-color="#B5D7F5" stop-opacity="0.4" />
            </linearGradient>
            <radialGradient id="logoCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#B5D7F5" />
              <stop offset="60%" stop-color="#6D9BCB" />
              <stop offset="100%" stop-color="#131F30" stop-opacity="0" />
            </radialGradient>
          </defs>

          {/* Rounded Base */}
          <rect width="120" height="120" rx="32" fill="#0C1421" stroke="#293B51" strokeWidth="2.5" />
          <circle cx="60" cy="60" r="42" fill="url(#logoCore)" opacity="0.3" />

          {/* Interlocking Pillars & Beams forming 'N' & Heap Structure */}
          <path d="M34 32 L46 25 L46 88 L34 95 Z" fill="url(#logoPrism)" />
          <path d="M46 25 L86 88 L74 95 L34 32 Z" fill="url(#logoGlow)" />
          <path d="M74 32 L86 25 L86 88 L74 95 Z" fill="url(#logoPrism)" />

          {/* Root Heap Element */}
          <circle cx="60" cy="48" r="7" fill="#EDF4FC" stroke="#B5D7F5" strokeWidth="2.5" />
          <circle cx="60" cy="48" r="3.5" fill="#6D9BCB" />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className={`font-black tracking-wider text-titanium-text bg-gradient-to-r from-titanium-text via-titanium-electric to-titanium-accent bg-clip-text text-transparent ${textSizes[size]}`}
            >
              NEXORA
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-titanium-surface text-titanium-electric border border-titanium-border">
              2.0
            </span>
          </div>
          <span className="text-[10px] tracking-wide text-titanium-text-muted font-medium">
            Own Your Time.
          </span>
        </div>
      )}
    </div>
  );
};
