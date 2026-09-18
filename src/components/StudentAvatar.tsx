interface StudentAvatarProps {
  type?: 'boy' | 'girl' | 'teacher';
  className?: string;
}

export function StudentAvatar({ type = 'boy', className = 'w-full h-full' }: StudentAvatarProps) {
  if (type === 'girl') {
    return (
      <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="60" fill="#0f172a" />
        {/* Subtle Cyber Grid in Avatar */}
        <path d="M0 60H120M60 0V120" stroke="#06b6d4" strokeWidth="0.5" strokeOpacity="0.2" />
        {/* Hair Back */}
        <path d="M25 65C25 35 40 20 60 20C80 20 95 35 95 65C95 85 85 95 85 95L35 95C35 95 25 85 25 65Z" fill="#1e1b4b" />
        {/* Neck */}
        <rect x="52" y="75" width="16" height="18" rx="4" fill="#FCD34D" />
        {/* Cyber Suit */}
        <path d="M30 120C30 94 42 88 60 88C78 88 90 94 90 120H30Z" fill="#0284c7" />
        <path d="M52 88L60 98L68 88H52Z" fill="#38bdf8" />
        {/* Head */}
        <circle cx="60" cy="55" r="26" fill="#FDE68A" />
        {/* Hair Front */}
        <path d="M34 50C34 32 46 25 60 25C74 25 86 32 86 50C86 50 78 38 60 38C42 38 34 50 34 50Z" fill="#312e81" />
        {/* Eyes */}
        <circle cx="50" cy="54" r="3" fill="#0f172a" />
        <circle cx="70" cy="54" r="3" fill="#0f172a" />
        <circle cx="51" cy="53" r="1" fill="#FFFFFF" />
        <circle cx="71" cy="53" r="1" fill="#FFFFFF" />
        {/* Smart Cyber Visor/Glint */}
        <path d="M42 49L78 49" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.8" strokeLinecap="round" />
        {/* Smile */}
        <path d="M54 63C56 66 64 66 66 63" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" />
        {/* Cheeks */}
        <circle cx="45" cy="58" r="3" fill="#F87171" fillOpacity="0.5" />
        <circle cx="75" cy="58" r="3" fill="#F87171" fillOpacity="0.5" />
      </svg>
    );
  }

  // Boy Avatar with Modern Academy / Cyber Touch
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background circle inside avatar */}
      <circle cx="60" cy="60" r="60" fill="#090d16" />
      {/* Circuit lines */}
      <path d="M15 60H35M85 60H105M60 15V30" stroke="#10b981" strokeWidth="0.75" strokeOpacity="0.3" />
      {/* Neck */}
      <rect x="52" y="74" width="16" height="18" rx="4" fill="#FBBF24" />
      {/* High-tech Uniform Shirt */}
      <path d="M28 120C28 95 42 88 60 88C78 88 92 95 92 120H28Z" fill="#0f766e" />
      {/* Collar accent */}
      <path d="M48 88L60 98L72 88" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
      {/* Head */}
      <circle cx="60" cy="54" r="27" fill="#FDE68A" />
      {/* Ears */}
      <circle cx="33" cy="55" r="6" fill="#FDE68A" />
      <circle cx="87" cy="55" r="6" fill="#FDE68A" />
      {/* Hair */}
      <path 
        d="M33 46C33 30 44 23 60 23C76 23 87 30 87 46C87 46 83 34 74 33C65 32 60 36 52 33C44 30 36 40 33 46Z" 
        fill="#1e293b" 
      />
      {/* Sideburns */}
      <path d="M33 46V56L37 50V46H33Z" fill="#1e293b" />
      <path d="M87 46V56L83 50V46H87Z" fill="#1e293b" />
      {/* Eyebrows */}
      <path d="M46 45C49 44 54 45 54 45" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
      <path d="M66 45C66 45 71 44 74 45" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
      {/* Eyes */}
      <circle cx="49" cy="53" r="3.5" fill="#0f172a" />
      <circle cx="71" cy="53" r="3.5" fill="#0f172a" />
      <circle cx="50" cy="52" r="1.2" fill="#FFFFFF" />
      <circle cx="72" cy="52" r="1.2" fill="#FFFFFF" />
      {/* Smile */}
      <path d="M53 62C56 67 64 67 67 62" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" />
      {/* Nose */}
      <path d="M60 55V58" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
      {/* Cyber Ear HUD Accent */}
      <circle cx="87" cy="55" r="2" fill="#10b981" />
    </svg>
  );
}
