import React from 'react';

// League of Legends 2025 Logo (Current Official Design)
export const LeagueOfLegendsLogo = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg 
    viewBox="0 0 200 80" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Background with subtle gradient */}
    <defs>
      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F0E6D2" />
        <stop offset="50%" stopColor="#C8AA6E" />
        <stop offset="100%" stopColor="#C89B3C" />
      </linearGradient>
    </defs>
    
    {/* LEAGUE OF text */}
    <text 
      x="100" 
      y="25" 
      fontSize="16" 
      fill="url(#goldGradient)" 
      textAnchor="middle" 
      fontFamily="Arial, sans-serif" 
      fontWeight="bold"
      letterSpacing="2px"
    >
      LEAGUE OF
    </text>
    
    {/* LEGENDS text - larger and more prominent */}
    <text 
      x="100" 
      y="50" 
      fontSize="20" 
      fill="url(#goldGradient)" 
      textAnchor="middle" 
      fontFamily="Arial, sans-serif" 
      fontWeight="bold"
      letterSpacing="2px"
    >
      LEGENDS
    </text>
    
    {/* Decorative elements inspired by the game's aesthetic */}
    <circle cx="20" cy="40" r="3" fill="#C89B3C" opacity="0.8"/>
    <circle cx="180" cy="40" r="3" fill="#C89B3C" opacity="0.8"/>
    
    {/* Subtle underline */}
    <rect x="30" y="60" width="140" height="2" fill="#C89B3C" opacity="0.6" rx="1"/>
  </svg>
);

// Street Fighter 6 Logo (Current Hexagonal Design)
export const StreetFighter6Logo = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg 
    viewBox="0 0 120 120" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Hexagonal SF6 logo that reads as both "6" and "VI" */}
    <polygon 
      points="60,10 90,30 90,70 60,90 30,70 30,30" 
      fill="none" 
      stroke="#FF6B00" 
      strokeWidth="4"
    />
    
    {/* Inner design that forms "6" */}
    <path 
      d="M 45 25 L 75 25 L 75 45 L 55 45 L 55 65 L 75 65 L 75 85 L 45 85 Z" 
      fill="#FF6B00"
    />
    
    {/* Street Fighter text */}
    <text x="60" y="105" fontSize="8" fill="#FF6B00" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold">
      STREET FIGHTER
    </text>
  </svg>
);

// EA Sports FC 25 Logo (Current 2025 Edition)
export const EAFCLogo = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg 
    viewBox="0 0 120 120" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* EA Sports FC shield design */}
    <path 
      d="M 60 10 L 90 25 L 90 75 L 60 90 L 30 75 L 30 25 Z" 
      fill="#001E3C" 
      stroke="#FFD700" 
      strokeWidth="2"
    />
    
    {/* FC text */}
    <text x="60" y="45" fontSize="16" fill="#FFD700" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold">
      FC
    </text>
    
    {/* 25 number */}
    <text x="60" y="65" fontSize="14" fill="#FFD700" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold">
      25
    </text>
    
    {/* EA Sports text */}
    <text x="60" y="105" fontSize="6" fill="#001E3C" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold">
      EA SPORTS
    </text>
  </svg>
);

// Gaming category icons with proper game logos
export const GameCategoryIcons = {
  moba: LeagueOfLegendsLogo,
  fighting: StreetFighter6Logo,
  sport: EAFCLogo
};