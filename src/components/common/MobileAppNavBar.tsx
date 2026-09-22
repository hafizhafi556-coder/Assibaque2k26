import React, { useState } from 'react';
import { 
  Home, 
  Trophy, 
  Search, 
  Users, 
  Grid, 
  Calendar, 
  Bell, 
  Award, 
  ShieldCheck, 
  Scale, 
  Globe, 
  X, 
  Smartphone,
  ChevronRight,
  LogOut,
  LogIn,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFest } from '../../context/FestContext';
import { getTranslation } from '../../i18n/translations';
import { FestLogoBadge } from './IslamicPattern';

interface MobileAppNavBarProps {
  currentTab: string;
  onSelectTab: (tab: string, extraId?: string) => void;
  onOpenLogin: () => void;
  onOpenPoster?: () => void;
}

export const MobileAppNavBar: React.FC<MobileAppNavBarProps> = ({
  currentTab,
  onSelectTab,
  onOpenLogin,
  onOpenPoster
}) => {
  const { language, toggleLanguage, theme, toggleTheme, currentUser, logout, festSettings, announcements } = useFest();
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);

  const pinnedAnnouncementsCount = announcements.filter(a => a.is_pinned).length;

  const handleTabClick = (tabId: string) => {
    if (tabId === 'more') {
      setIsMoreSheetOpen(true);
      return;
    }
    onSelectTab(tabId);
    setIsMoreSheetOpen(false);
  };

  const navItems = [
    {
      id: 'home',
      label: language === 'ml' ? 'ഹോം' : 'Home',
      icon: Home,
    },
    {
      id: 'scoreboard',
      label: language === 'ml' ? 'സ്കോർ' : 'Score',
      icon: Trophy,
      badge: 'LIVE',
    },
    {
      id: 'student_result',
      label: language === 'ml' ? 'റിസൾട്ട്' : 'Results',
      icon: Search,
    },
    {
      id: 'teams',
      label: language === 'ml' ? 'ടീം' : 'Teams',
      icon: Users,
    },
    {
      id: 'more',
      label: language === 'ml' ? 'കൂടുതൽ' : 'Menu',
      icon: Grid,
      isMore: true,
    }
  ];

  return (
    <>
      {/* Mobile Bottom Floating App Bar */}
      <nav 
        id="mobile-bottom-nav" 
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-slate-800 px-2 py-1 shadow-[0_-4px_20px_rgba(0,0,0,0.12)] pb-[max(0.375rem,env(safe-area-inset-bottom))] transition-colors duration-200"
      >
        <div className="grid grid-cols-5 gap-1 items-center max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = currentTab === item.id && !isMoreSheetOpen;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                id={`mobile-tab-${item.id}`}
                onClick={() => handleTabClick(item.id)}
                className={`relative flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-2xl transition-all duration-200 cursor-pointer active:scale-90 select-none ${
                  isActive
                    ? 'text-amber-800 dark:text-amber-300 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
                }`}
              >
                {/* Active Indicator Background Pill */}
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveTabPill"
                    className="absolute inset-0 bg-amber-100/90 dark:bg-amber-950/60 rounded-2xl border border-amber-300 dark:border-amber-600/60"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}

                {/* Icon Container with Badge */}
                <div className="relative z-10 flex items-center justify-center mb-0.5">
                  <Icon 
                    size={20} 
                    className={`transition-transform duration-200 ${
                      isActive 
                        ? 'text-amber-700 dark:text-amber-400 scale-110' 
                        : 'text-slate-600 dark:text-slate-400'
                    }`} 
                  />
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-3 px-1 py-0.2 rounded-full text-[8px] font-black tracking-tighter bg-emerald-600 text-white uppercase shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span className={`relative z-10 text-[10px] tracking-tight leading-none ${
                  isActive ? 'text-amber-900 dark:text-amber-300 font-bold' : 'text-slate-600 dark:text-slate-400'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Native App-Style "More / Actions" Bottom Sheet */}
      <AnimatePresence>
        {isMoreSheetOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreSheetOpen(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            {/* Bottom Sheet Container */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 border-t-2 border-amber-400 rounded-t-3xl shadow-2xl p-5 pb-10 text-slate-900 dark:text-slate-100 transition-colors duration-200"
            >
              {/* Drag Handle Pill */}
              <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-4" />

              {/* Sheet Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2.5">
                  <FestLogoBadge size="sm" customLogo={festSettings.festLogo} />
                  <div>
                    <h3 className="font-heading text-sm font-extrabold text-slate-900 dark:text-white">
                      {language === 'ml' ? festSettings.festNameMl : festSettings.festName} {festSettings.festYear}
                    </h3>
                    <p className="text-[10px] text-amber-800 dark:text-amber-400 font-medium">
                      {language === 'ml' ? festSettings.institutionNameMl : festSettings.institutionName}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsMoreSheetOpen(false)}
                  className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition touch-target"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Quick Settings: Theme & Language */}
              <div className="grid grid-cols-2 gap-2.5 mb-4">
                {/* Theme Toggle Button */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
                  <div className="flex items-center gap-2">
                    {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-slate-600 dark:text-slate-400" />}
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                      {theme === 'dark' ? getTranslation(language, 'themeDark') : getTranslation(language, 'themeLight')}
                    </span>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 text-xs font-bold transition shadow-xs touch-target"
                  >
                    {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
                  </button>
                </div>

                {/* Language Switcher */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-amber-600 dark:text-amber-400" />
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                      {language === 'ml' ? 'ഭാഷ' : 'Language'}
                    </span>
                  </div>
                  <button
                    onClick={toggleLanguage}
                    className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 text-xs font-bold transition shadow-xs touch-target"
                  >
                    {getTranslation(language, 'switchLang')}
                  </button>
                </div>
              </div>

              {/* Fest Public Modules Section */}
              <div className="mb-4">
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400 mb-2 px-1">
                  {language === 'ml' ? 'ഫെസ്റ്റ് വിഭാഗങ്ങൾ' : 'Fest Portals & Schedule'}
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => handleTabClick('programmes')}
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left transition touch-target"
                  >
                    <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {getTranslation(language, 'navProgrammes')}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Schedule & Stages</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleTabClick('announcements')}
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left transition relative touch-target"
                  >
                    <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      <Bell size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {getTranslation(language, 'navAnnouncements')}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Live Bulletins</p>
                    </div>
                    {pinnedAnnouncementsCount > 0 && (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    )}
                  </button>

                  {onOpenPoster && (
                    <button
                      onClick={() => {
                        setIsMoreSheetOpen(false);
                        onOpenPoster();
                      }}
                      className="col-span-2 flex items-center justify-between p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/60 text-left transition touch-target"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                          <Smartphone size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-amber-900 dark:text-amber-300 leading-tight">
                            Result & Fest Posters
                          </p>
                          <p className="text-[10px] text-amber-800 dark:text-amber-400">HD 4:5 vertical posters with winner photos</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-amber-700 dark:text-amber-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* Administrative & Judge Access */}
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400 mb-2 px-1">
                  {language === 'ml' ? 'അഡ്മിൻ & ജഡ്ജ് പോർട്ടൽ' : 'Official Administration'}
                </p>

                <div className="space-y-2">
                  <button
                    onClick={() => handleTabClick('judge')}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left transition touch-target"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        <Scale size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Judge Score Entry</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Criteria-based evaluation portal</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 dark:text-slate-600" />
                  </button>

                  <button
                    onClick={() => handleTabClick('admin')}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 hover:bg-amber-50 dark:hover:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 text-left transition touch-target"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                        <ShieldCheck size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-amber-950 dark:text-amber-200">Admin Control Dashboard</p>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400">Master programmes, scores, students & settings</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-amber-700 dark:text-amber-400" />
                  </button>

                  {/* Auth Button */}
                  {currentUser ? (
                    <button
                      onClick={() => {
                        logout();
                        setIsMoreSheetOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold transition mt-3 touch-target"
                    >
                      <LogOut size={15} />
                      <span>Sign Out ({currentUser.name})</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsMoreSheetOpen(false);
                        onOpenLogin();
                      }}
                      className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold shadow-sm transition mt-3 touch-target active:scale-95"
                    >
                      <LogIn size={15} />
                      <span>{getTranslation(language, 'navLogin')}</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
