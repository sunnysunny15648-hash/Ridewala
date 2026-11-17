import React from 'react';

export default function Logo({ size = 'md', showTagline = false }) {
  const sizes = {
    sm: { text: 'text-lg', icon: 24, tagline: 'text-xs' },
    md: { text: 'text-2xl', icon: 32, tagline: 'text-xs' },
    lg: { text: 'text-4xl', icon: 48, tagline: 'text-sm' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2">
        {/* Bike icon */}
        <svg width={s.icon} height={s.icon} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="34" r="8" stroke="#111111" strokeWidth="3" fill="#FFC928"/>
          <circle cx="36" cy="34" r="8" stroke="#111111" strokeWidth="3" fill="#FFC928"/>
          <circle cx="12" cy="34" r="3" fill="#111111"/>
          <circle cx="36" cy="34" r="3" fill="#111111"/>
          {/* Body */}
          <path d="M12 34 L20 18 L30 18 L36 34" stroke="#111111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M20 18 L24 10 L32 10" stroke="#111111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M24 10 L28 18" stroke="#111111" strokeWidth="3" strokeLinecap="round"/>
          {/* Rider */}
          <circle cx="27" cy="12" r="3" fill="#111111"/>
          <path d="M24 15 Q26 20 30 18" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          {/* Handlebars */}
          <path d="M30 18 L34 16 M30 18 L34 20" stroke="#111111" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
        <span className={`font-extrabold ${s.text} text-secondary tracking-tight`}>
          RIDE<span className="text-primary">WALA</span>
        </span>
      </div>
      {showTagline && (
        <p className={`${s.tagline} text-gray-500 font-medium mt-0.5 tracking-wide`}>
          Your Ride. Your Way.
        </p>
      )}
    </div>
  );
}

