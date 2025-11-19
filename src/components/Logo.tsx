
import React from 'react';

interface LogoProps {
    className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={className}>
      <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
          <linearGradient id="royalBlueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#312e81" />
          </linearGradient>
          <linearGradient id="peacockBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#172554" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
          <linearGradient id="featherTeal" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#0f766e" />
          </linearGradient>
          <radialGradient id="flameGrad" cx="50%" cy="80%" r="80%">
             <stop offset="0%" stopColor="#fef08a" />
             <stop offset="40%" stopColor="#facc15" />
             <stop offset="100%" stopColor="#ea580c" />
          </radialGradient>
        </defs>

        {/* --- OUTER FRAME --- */}
        {/* Main Dark Blue Circle */}
        <circle cx="256" cy="256" r="250" fill="#312e81" />
        
        {/* Gold Decorative Borders */}
        <circle cx="256" cy="256" r="230" fill="none" stroke="url(#goldGrad)" strokeWidth="3" />
        <circle cx="256" cy="256" r="210" fill="#fdf4e3" /> {/* Cream Center Background */}
        
        {/* Decorative Vine Pattern in the border (Simplified as dots/circles) */}
        <g transform="translate(256,256)">
           {[...Array(24)].map((_, i) => (
              <circle key={i} cx="0" cy="-220" r="4" fill="#B45309" transform={`rotate(${i * 15})`} opacity="0.6" />
           ))}
        </g>

        {/* --- PEACOCK FEATHERS FAN --- */}
        <g transform="translate(256, 260)">
           {[...Array(13)].map((_, i) => {
              // Fan from approx -110 to +110 degrees
              const angle = -100 + (i * (200/12)); 
              return (
                <g key={i} transform={`rotate(${angle})`}>
                   {/* Feather Stem */}
                   <path d="M0 0 L0 -180" stroke="#0f766e" strokeWidth="1.5" />
                   {/* Feather Eye Shape */}
                   <path 
                    d="M0 -120 Q15 -150 0 -180 Q-15 -150 0 -120" 
                    fill="url(#featherTeal)" 
                    stroke="#fff" strokeWidth="0.5"
                   />
                   {/* The Eye Details */}
                   <ellipse cx="0" cy="-150" rx="8" ry="12" fill="#1e3a8a" stroke="url(#goldGrad)" strokeWidth="1"/>
                   <circle cx="0" cy="-150" r="4" fill="#06b6d4" />
                   <circle cx="0" cy="-150" r="2" fill="#1e1b4b" />
                </g>
              )
           })}
        </g>

        {/* --- PEACOCK BODY & HAND MUDRA COMPOSITE --- */}
        <g transform="translate(256, 256) scale(0.9)">
            {/* Tail Draping Down */}
            <path 
                d="M-60 80 Q-30 140 0 150 Q30 140 60 80 L0 60 Z" 
                fill="#0f766e" stroke="#fbbf24" strokeWidth="1"
            />
            
            {/* The Neck and Head */}
            <path 
                d="M-20 80 
                   C-50 60 -60 0 -30 -40 
                   C-10 -70 10 -70 30 -50
                   C40 -40 40 -20 30 0" 
                fill="url(#peacockBodyGrad)" 
                stroke="#fff" strokeWidth="1"
            />
            
            {/* Head Details */}
            <path d="M-10 -60 L-20 -80 M-5 -65 L0 -85 M5 -65 L20 -80" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
            <circle cx="-5" cy="-75" r="2" fill="#06b6d4" />
            <circle cx="10" cy="-75" r="2" fill="#06b6d4" />
            <circle cx="15" cy="-45" r="2.5" fill="#fff" /> {/* Eye */}
            <path d="M30 -50 L45 -45 L35 -35" fill="#fbbf24" /> {/* Beak */}

            {/* --- THE HAND MUDRA (Chin Mudra) integrated into body --- */}
            {/* Positioned to look like the wing/centerpiece */}
            <g transform="translate(5, 20)">
                {/* Arm/Wrist */}
                <path d="M40 20 L10 50" stroke="#d97706" strokeWidth="14" strokeLinecap="round" />
                <circle cx="38" cy="22" r="9" fill="#d97706" /> {/* Bangle area */}
                
                {/* The Hand Shape (Gold) */}
                <path 
                    d="M0 0 
                       C-10 -20 -10 -40 0 -50 
                       L10 -45 
                       C5 -35 5 -20 15 -10 
                       L0 0 Z" 
                    fill="#fbbf24" stroke="#92400e" strokeWidth="1"
                />
                {/* Fingers extended (Mayura/Pataka style) */}
                <path d="M0 -50 L-5 -80 L5 -80 L10 -45" fill="#fbbf24" stroke="#92400e" strokeWidth="1"/>
                <path d="M5 -80 L10 -100 L20 -90 L10 -45" fill="#fbbf24" stroke="#92400e" strokeWidth="1"/>
                <path d="M20 -90 L30 -80 L15 -10" fill="#fbbf24" stroke="#92400e" strokeWidth="1"/>
                
                {/* Thumb and Index joining (Chin Mudra ring) */}
                <circle cx="12" cy="-15" r="8" fill="none" stroke="#92400e" strokeWidth="1.5" />
            </g>
        </g>

        {/* --- DIYA (LAMP) --- */}
        <g transform="translate(256, 430)">
           {/* Lamp Base */}
           <path 
            d="M-35 0 
               Q-35 25 0 35 
               Q35 25 35 0 
               L25 -5 Q0 10 -25 -5 Z" 
            fill="#78350f" stroke="url(#goldGrad)" strokeWidth="2" 
           />
           {/* Flame */}
           <path d="M0 -10 Q-10 -35 0 -55 Q10 -35 0 -10" fill="url(#flameGrad)">
             <animate attributeName="d" values="M0 -10 Q-10 -35 0 -55 Q10 -35 0 -10; M0 -10 Q-12 -38 0 -60 Q12 -38 0 -10; M0 -10 Q-10 -35 0 -55 Q10 -35 0 -10" dur="1.5s" repeatCount="indefinite" />
           </path>
           {/* Glow */}
           <circle cx="0" cy="-30" r="15" fill="url(#flameGrad)" opacity="0.4">
             <animate attributeName="opacity" values="0.4;0.6;0.4" dur="1.5s" repeatCount="indefinite" />
           </circle>
        </g>
        
        {/* --- Bottom Decorative Swirls --- */}
        <path d="M200 430 Q180 430 170 410" fill="none" stroke="#d97706" strokeWidth="2" />
        <path d="M312 430 Q332 430 342 410" fill="none" stroke="#d97706" strokeWidth="2" />

      </svg>
    </div>
  );
};
