import React from 'react';

// League of Legends 2025 Logo (Current Design since 2019)
export const LeagueOfLegendsLogo = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg 
    viewBox="0 0 120 120" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Modern minimalist League logo - rectangular stacked format */}
    <rect x="10" y="20" width="100" height="20" fill="#C89B3C" rx="2"/>
    <text x="60" y="35" fontSize="12" fill="#0A1428" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold">
      LEAGUE OF
    </text>
    
    <rect x="10" y="45" width="100" height="20" fill="#C89B3C" rx="2"/>
    <text x="60" y="60" fontSize="12" fill="#0A1428" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold">
      LEGENDS
    </text>
    
    {/* Accent elements */}
    <circle cx="60" cy="80" r="15" fill="none" stroke="#C89B3C" strokeWidth="2"/>
    <polygon points="60,70 65,80 60,90 55,80" fill="#C89B3C"/>
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