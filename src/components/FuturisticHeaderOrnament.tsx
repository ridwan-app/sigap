import React from 'react';

interface FuturisticHeaderOrnamentProps {
  className?: string;
}

export function FuturisticHeaderOrnament({ className = '' }: FuturisticHeaderOrnamentProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* 1. Latar Belakang Gradasi Hijau Zamrud Segar & Cerah (Khas SiPERLU) */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 15%, #4ac712 0%, #2e960a 45%, #186306 80%, #0c3803 100%)'
        }}
      />

      {/* 2. SVG Pita Futuristik Hijau Cerah & Siluet Lengkung Kubah Tengah yang Bersih */}
      <svg 
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice" 
        viewBox="0 0 400 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradasi emas lembut untuk aksen kubah */}
          <linearGradient id="islamicGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff8b3" />
            <stop offset="50%" stopColor="#ffda47" />
            <stop offset="100%" stopColor="#d49e13" />
          </linearGradient>

          {/* Gradasi pita gelombang futuristik hijau cerah */}
          <linearGradient id="waveLightGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e2ff5e" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#5cd415" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#125903" stopOpacity="0.05" />
          </linearGradient>

          {/* Gradasi pita neon melengkung halus */}
          <linearGradient id="neonRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
            <stop offset="40%" stopColor="#d5ff52" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#2cb509" stopOpacity="0" />
          </linearGradient>

          <filter id="islamicGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Pita Gelombang Hijau Futuristik Mengalir (Bersih & Elegan) */}
        <path 
          d="M-40 180 C 80 80, 240 220, 440 70 L440 240 L-40 240 Z" 
          fill="url(#waveLightGreen)" 
        />
        <path 
          d="M-30 60 C 130 190, 270 40, 440 160 L440 240 L-30 240 Z" 
          fill="url(#waveLightGreen)" 
          opacity="0.7"
        />
        {/* Garis Neon Tunggal Mengalir */}
        <path 
          d="M-20 70 C 120 190, 260 40, 430 160" 
          stroke="url(#neonRibbon)" 
          strokeWidth="2.5" 
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* ============================================================ */}
        {/* SENTUHAN ISLAMI TENGAH: LENGKUNG KUBAH / MIHRAB MEMBINGKAI LOGO */}
        {/* ============================================================ */}

        {/* Siluet Kubah / Mihrab Anggun Membingkai Area Logo */}
        <path 
          d="M 120 -10 C 120 60, 165 98, 200 114 C 235 98, 280 60, 280 -10" 
          stroke="url(#islamicGold)" 
          strokeWidth="2" 
          fill="none" 
          filter="url(#islamicGlow)"
        />
        <path 
          d="M 134 -10 C 134 50, 170 82, 200 96 C 230 82, 266 50, 266 -10" 
          stroke="#fff480" 
          strokeWidth="1.2" 
          strokeDasharray="4 3"
          fill="none" 
          opacity="0.75"
        />

        {/* Aksen Puncak Kubah: Bintang 8 Sudut (Khatam) Kecil & Rapi */}
        <g transform="translate(200, 114) scale(0.65)" filter="url(#islamicGlow)">
          <rect x="-11" y="-11" width="22" height="22" fill="rgba(255, 230, 80, 0.2)" stroke="url(#islamicGold)" strokeWidth="1.8" />
          <rect x="-11" y="-11" width="22" height="22" transform="rotate(45)" fill="rgba(255, 230, 80, 0.2)" stroke="url(#islamicGold)" strokeWidth="1.8" />
          <circle cx="0" cy="0" r="3.5" fill="#ffffff" />
        </g>
      </svg>

      {/* 3. Garis Emas Berkilau di Tepi Bawah Header */}
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-[#ffd700] via-50% via-[#fff8b3] to-transparent opacity-95 shadow-[0_0_10px_rgba(255,215,0,0.6)]" />
    </div>
  );
}
