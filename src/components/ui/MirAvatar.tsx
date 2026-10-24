import React from 'react';

interface MirAvatarProps {
  size?: number;
  className?: string;
}

export function MirAvatar({ size = 48, className = '' }: MirAvatarProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="MIR Robot Avatar"
    >
      <defs>
        <linearGradient id="mirAvatarBg" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e0f2fe" />
          <stop offset="1" stopColor="#bae6fd" />
        </linearGradient>
        <linearGradient id="mirEyeGlow" x1="0" y1="0" x2="0" y2="10" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" />
          <stop offset="1" stopColor="#0284c7" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background Circle */}
      <circle cx="40" cy="40" r="39" fill="url(#mirAvatarBg)" />
      <circle cx="40" cy="40" r="38.5" stroke="#93c5fd" strokeWidth="1" strokeOpacity="0.6" />

      {/* Headband */}
      <path
        d="M20 37 C20 20 60 20 60 37"
        stroke="#2563eb"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Antenna */}
      <line x1="40" y1="21" x2="40" y2="13" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="40" cy="11" r="3.5" fill="#2563eb" />
      <circle cx="39" cy="10" r="1.2" fill="#bfdbfe" />

      {/* Head base (white glossy robot) */}
      <rect x="20" y="24" width="40" height="34" rx="14" fill="#ffffff" />
      <rect x="20" y="24" width="40" height="34" rx="14" stroke="#e2e8f0" strokeWidth="1" />

      {/* Dark Visor / Screen */}
      <rect x="24" y="29" width="32" height="22" rx="9" fill="#0f172a" />

      {/* Glowing Cyan Eyes */}
      <rect x="28" y="35" width="8" height="9" rx="4" fill="url(#mirEyeGlow)" filter="url(#glow)" />
      <rect x="44" y="35" width="8" height="9" rx="4" fill="url(#mirEyeGlow)" filter="url(#glow)" />
      <circle cx="30" cy="37" r="1.5" fill="#ffffff" />
      <circle cx="46" cy="37" r="1.5" fill="#ffffff" />

      {/* Subtle smiling line on visor */}
      <path
        d="M36 46 Q40 48 44 46"
        stroke="#38bdf8"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />

      {/* Blue Headphones */}
      {/* Left ear */}
      <rect x="15" y="32" width="6" height="18" rx="3" fill="#2563eb" />
      <rect x="17" y="35" width="2.5" height="12" rx="1.2" fill="#60a5fa" />
      {/* Right ear */}
      <rect x="59" y="32" width="6" height="18" rx="3" fill="#2563eb" />
      <rect x="60.5" y="35" width="2.5" height="12" rx="1.2" fill="#60a5fa" />
    </svg>
  );
}

export function MirAvatarSmall({ size = 32, className = '' }: MirAvatarProps) {
  return <MirAvatar size={size} className={className} />;
}
