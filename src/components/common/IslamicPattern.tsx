import React from 'react';

export const IslamicStar: React.FC<{ className?: string; size?: number }> = ({ className = 'text-amber-500', size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M12 0l3.09 3.09L19.5 2.5l-.59 4.41L23.32 10l-3.32 3.09.59 4.41-4.41-.59L12 24l-3.09-3.09-4.41.59.59-4.41L0 14l3.32-3.09-.59-4.41 4.41.59L12 0z" />
  </svg>
);

export const IslamicCrescent: React.FC<{ className?: string; size?: number }> = ({ className = 'text-amber-500', size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c2.88 0 5.48-1.22 7.33-3.17-5.59-.2-10.08-4.78-10.08-10.42 0-3.13 1.4-5.94 3.63-7.85C12.58 2.2 12.3 2 12 2z"/>
    <polygon points="18.5,4 19.5,7 22.5,7 20,9 21,12 18.5,10 16,12 17,9 14.5,7 17.5,7" />
  </svg>
);

export const GoldDivider: React.FC<{ className?: string; title?: string }> = ({ className = '', title }) => (
  <div className={`flex items-center justify-center gap-3 my-6 ${className}`}>
    <div className="h-[1px] w-12 sm:w-24 bg-gradient-to-r from-transparent via-amber-400/60 to-amber-500"></div>
    <div className="flex items-center gap-1.5 text-amber-600">
      <div className="w-1.5 h-1.5 rotate-45 bg-amber-500"></div>
      {title ? (
        <span className="text-xs font-heading uppercase tracking-widest text-amber-800 font-bold px-2">
          {title}
        </span>
      ) : (
        <IslamicStar size={14} className="text-amber-500" />
      )}
      <div className="w-1.5 h-1.5 rotate-45 bg-amber-500"></div>
    </div>
    <div className="h-[1px] w-12 sm:w-24 bg-gradient-to-l from-transparent via-amber-400/60 to-amber-500"></div>
  </div>
);

export const FestLogoBadge: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl'; customLogo?: string; className?: string }> = ({ size = 'md', customLogo = '/thanimiyyath-logo.svg', className = '' }) => {
  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-14 h-14 text-sm',
    lg: 'w-20 h-20 text-base',
    xl: 'w-28 h-28 sm:w-36 sm:h-36 text-lg',
  };

  const logoSrc = customLogo || '/thanimiyyath-logo.svg';

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-amber-300 dark:border-amber-500/40 p-1.5 bg-white dark:bg-slate-900 shadow-md shadow-amber-500/10 group hover:border-amber-400 dark:hover:border-amber-400 transition shrink-0 ${sizeClasses[size]} ${className}`}>
      <img 
        src={logoSrc} 
        alt="തനിമിയ്യത്ത് Fest Logo" 
        className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-300 group-hover:scale-105" 
      />
    </div>
  );
};

export const ThanimiyyathEmblem: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' | 'hero' }> = ({ className = '', size = 'hero' }) => {
  const sizeClasses = {
    sm: 'w-24 h-30',
    md: 'w-40 h-50',
    lg: 'w-56 h-70',
    hero: 'w-64 h-80 sm:w-80 sm:h-[400px]',
  };

  return (
    <div className={`relative flex items-center justify-center p-3 rounded-3xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-500/40 shadow-xl ${sizeClasses[size]} ${className}`}>
      <div className="absolute inset-0 bg-radial from-amber-400/5 dark:from-amber-400/10 via-transparent to-transparent rounded-3xl pointer-events-none" />
      <img
        src="/thanimiyyath-logo.svg"
        alt="തനിമിയ്യത്ത് - ASSIBAQUE '26"
        className="w-full h-full object-contain filter drop-shadow-sm"
      />
    </div>
  );
};

export const IslamicGeometricCanvas: React.FC = () => (
  <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden">
    {/* Subtle soft ambient aura */}
    <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-blue-100/40 dark:bg-blue-900/15 blur-[130px] pointer-events-none" />
    <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-100/40 dark:bg-amber-900/15 blur-[140px] pointer-events-none" />
    
    {/* Geometric Lattice Dots Grid */}
    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[radial-gradient(#d97706_1px,transparent_1px)] dark:bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:32px_32px]" />
  </div>
);
