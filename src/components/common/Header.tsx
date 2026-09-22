import React, { useState } from 'react';
import { 
  Trophy, 
  Search, 
  Users, 
  Calendar, 
  Bell, 
  ShieldCheck, 
  Award, 
  LogIn, 
  LogOut, 
  Menu, 
  X, 
  Globe, 
  Home,
  User as UserIcon,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { useFest } from '../../context/FestContext';
import { getTranslation } from '../../i18n/translations';
import { FestLogoBadge, IslamicStar } from './IslamicPattern';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onSelectTab, onOpenLogin }) => {
  const { language, toggleLanguage, theme, toggleTheme, currentUser, logout, festSettings } = useFest();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tabId: string) => {
    onSelectTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md shadow-xs transition-colors duration-200">
      {/* Top micro bar with Academy info and Language/Theme toggle */}
      <div className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-100 dark:bg-slate-900/90 px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs text-slate-700 dark:text-slate-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2 truncate mr-2">
            <IslamicStar size={13} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-semibold text-slate-900 dark:text-slate-100 tracking-wide truncate">
              {language === 'ml' ? festSettings.institutionNameMl : festSettings.institutionName}
            </span>
            <span className="hidden md:inline text-slate-400 dark:text-slate-600">•</span>
            <span className="hidden md:inline text-slate-600 dark:text-slate-400 italic truncate">
              {language === 'ml' ? festSettings.festThemeMl : festSettings.festTheme}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 font-semibold transition cursor-pointer shadow-xs active:scale-95 text-[11px] sm:text-xs"
              title={theme === 'dark' ? getTranslation(language, 'themeLight') : getTranslation(language, 'themeDark')}
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={13} className="text-amber-400 fill-amber-400" />
                  <span className="hidden xs:inline">{getTranslation(language, 'themeLight')}</span>
                </>
              ) : (
                <>
                  <Moon size={13} className="text-slate-700 fill-slate-700" />
                  <span className="hidden xs:inline">{getTranslation(language, 'themeDark')}</span>
                </>
              )}
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 font-semibold transition cursor-pointer shadow-xs active:scale-95 text-[11px] sm:text-xs"
              title="Switch Language / ഭാഷ മാറ്റുക"
            >
              <Globe size={13} className="text-amber-600 dark:text-amber-400" />
              <span>{getTranslation(language, 'switchLang')}</span>
            </button>

            {/* User status info */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700/80 text-amber-900 dark:text-amber-300 font-bold text-[10px] sm:text-xs uppercase">
                  {currentUser.role}
                </span>
                <span className="hidden lg:inline text-slate-800 dark:text-slate-200 font-medium">{currentUser.name}</span>
                <button
                  onClick={logout}
                  className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="hidden sm:flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-400 font-semibold transition cursor-pointer px-2 py-1 rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-800/60"
              >
                <LogIn size={13} className="text-amber-600 dark:text-amber-400" />
                <span>{getTranslation(language, 'navLogin')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main navigation navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo & Executive Fest Title */}
        <div 
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0 min-w-0"
        >
          <FestLogoBadge size="md" customLogo={festSettings.festLogo} className="border-amber-300 dark:border-amber-500/40 shadow-sm" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-fest-display text-base sm:text-xl md:text-2xl font-black tracking-wider text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition truncate">
                {language === 'ml' ? festSettings.festNameMl : festSettings.festName}
              </span>
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/80 shrink-0">
                {festSettings.festYear}
              </span>
            </div>
            <p className="font-fest-motto text-[11px] sm:text-xs text-amber-800 dark:text-amber-300/90 font-medium italic -mt-0.5 hidden xs:block tracking-wide truncate">
              {language === 'ml' ? festSettings.festThemeMl : `“${festSettings.festTheme}”`}
            </p>
          </div>
        </div>

        {/* Desktop Navigation links */}
        <nav className="hidden lg:flex items-center gap-1">
          <button
            onClick={() => handleNavClick('home')}
            className={`px-3 py-2 rounded-xl text-xs font-bold tracking-wide transition flex items-center gap-1.5 cursor-pointer touch-target ${
              currentTab === 'home'
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-600/50 shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Home size={15} />
            <span>{getTranslation(language, 'navHome')}</span>
          </button>

          <button
            onClick={() => handleNavClick('scoreboard')}
            className={`px-3 py-2 rounded-xl text-xs font-bold tracking-wide transition flex items-center gap-1.5 cursor-pointer touch-target ${
              currentTab === 'scoreboard'
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-600/50 shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Trophy size={15} className="text-amber-600 dark:text-amber-400" />
            <span>{getTranslation(language, 'navScoreboard')}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          <button
            onClick={() => handleNavClick('student_result')}
            className={`px-3 py-2 rounded-xl text-xs font-bold tracking-wide transition flex items-center gap-1.5 cursor-pointer touch-target ${
              currentTab === 'student_result'
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-600/50 shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Search size={15} />
            <span>{getTranslation(language, 'navStudentResult')}</span>
          </button>

          <button
            onClick={() => handleNavClick('teams')}
            className={`px-3 py-2 rounded-xl text-xs font-bold tracking-wide transition flex items-center gap-1.5 cursor-pointer touch-target ${
              currentTab === 'teams'
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-600/50 shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Users size={15} />
            <span>{getTranslation(language, 'navTeams')}</span>
          </button>

          <button
            onClick={() => handleNavClick('programmes')}
            className={`px-3 py-2 rounded-xl text-xs font-bold tracking-wide transition flex items-center gap-1.5 cursor-pointer touch-target ${
              currentTab === 'programmes'
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-600/50 shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Calendar size={15} />
            <span>{getTranslation(language, 'navProgrammes')}</span>
          </button>

          <button
            onClick={() => handleNavClick('announcements')}
            className={`px-3 py-2 rounded-xl text-xs font-bold tracking-wide transition flex items-center gap-1.5 cursor-pointer touch-target ${
              currentTab === 'announcements'
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-600/50 shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Bell size={15} />
            <span>{getTranslation(language, 'navAnnouncements')}</span>
          </button>

          {/* Conditional role portal tabs */}
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => handleNavClick('admin')}
              className={`ml-1.5 px-3 py-2 rounded-xl text-xs font-bold tracking-wide transition flex items-center gap-1.5 cursor-pointer touch-target ${
                currentTab === 'admin'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/80 hover:bg-amber-200 dark:hover:bg-amber-900/60'
              }`}
            >
              <ShieldCheck size={15} />
              <span>{getTranslation(language, 'navAdmin')}</span>
            </button>
          )}

          {currentUser?.role === 'judge' && (
            <button
              onClick={() => handleNavClick('judge')}
              className={`ml-1.5 px-3 py-2 rounded-xl text-xs font-bold tracking-wide transition flex items-center gap-1.5 cursor-pointer touch-target ${
                currentTab === 'judge'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-50 dark:bg-blue-950/80 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-700/80 hover:bg-blue-100 dark:hover:bg-blue-900/60'
              }`}
            >
              <Award size={15} />
              <span>{getTranslation(language, 'navJudgePortal')}</span>
            </button>
          )}

          {currentUser?.role === 'team_manager' && (
            <button
              onClick={() => handleNavClick('teams')}
              className="ml-1.5 px-3 py-2 rounded-xl text-xs font-bold tracking-wide bg-sky-100 dark:bg-sky-950/80 text-sky-900 dark:text-sky-300 border border-sky-300 dark:border-sky-700/80 hover:bg-sky-200 dark:hover:bg-sky-900/60 transition flex items-center gap-1.5 cursor-pointer touch-target"
            >
              <Users size={15} />
              <span>{currentUser.teamId?.toUpperCase()}</span>
            </button>
          )}

          {!currentUser && (
            <button
              onClick={onOpenLogin}
              className="ml-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wide bg-amber-500 hover:bg-amber-600 text-slate-950 transition shadow-xs flex items-center gap-1.5 cursor-pointer touch-target active:scale-95"
            >
              <LogIn size={14} />
              <span>{getTranslation(language, 'navLogin')}</span>
            </button>
          )}
        </nav>

        {/* Mobile / Tablet actions */}
        <div className="flex items-center gap-2 lg:hidden">
          {/* Quick theme toggle for mobile top header */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 transition touch-target cursor-pointer active:scale-95"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={17} className="text-amber-400 fill-amber-400" /> : <Moon size={17} className="text-slate-700 fill-slate-700" />}
          </button>

          {!currentUser ? (
            <button
              onClick={onOpenLogin}
              className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center gap-1 touch-target shadow-xs active:scale-95"
            >
              <LogIn size={14} />
              <span className="hidden xs:inline">{getTranslation(language, 'navLogin')}</span>
            </button>
          ) : (
            <button
              onClick={() => handleNavClick(currentUser.role === 'admin' ? 'admin' : currentUser.role === 'judge' ? 'judge' : 'teams')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1 touch-target"
            >
              <UserIcon size={14} className="text-amber-600 dark:text-amber-400" />
              <span className="text-[11px] uppercase">{currentUser.role}</span>
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 transition touch-target cursor-pointer active:scale-95"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 space-y-1.5 shadow-xl max-h-[80vh] overflow-y-auto transition-colors duration-200">
          <button
            onClick={() => handleNavClick('home')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition touch-target ${
              currentTab === 'home' ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-600/50' : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Home size={18} className="text-amber-600 dark:text-amber-400" />
              <span>{getTranslation(language, 'navHome')}</span>
            </div>
            <ChevronRight size={16} className="text-slate-400 dark:text-slate-600" />
          </button>

          <button
            onClick={() => handleNavClick('scoreboard')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition touch-target ${
              currentTab === 'scoreboard' ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-600/50' : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Trophy size={18} className="text-amber-600 dark:text-amber-400" />
              <span>{getTranslation(language, 'navScoreboard')}</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
              LIVE
            </span>
          </button>

          <button
            onClick={() => handleNavClick('student_result')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition touch-target ${
              currentTab === 'student_result' ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-600/50' : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Search size={18} className="text-amber-600 dark:text-amber-400" />
              <span>{getTranslation(language, 'navStudentResult')}</span>
            </div>
            <ChevronRight size={16} className="text-slate-400 dark:text-slate-600" />
          </button>

          <button
            onClick={() => handleNavClick('teams')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition touch-target ${
              currentTab === 'teams' ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-600/50' : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users size={18} className="text-amber-600 dark:text-amber-400" />
              <span>{getTranslation(language, 'navTeams')} (Nayro, Zayro, Lucero)</span>
            </div>
            <ChevronRight size={16} className="text-slate-400 dark:text-slate-600" />
          </button>

          <button
            onClick={() => handleNavClick('programmes')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition touch-target ${
              currentTab === 'programmes' ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-600/50' : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-amber-600 dark:text-amber-400" />
              <span>{getTranslation(language, 'navProgrammes')}</span>
            </div>
            <ChevronRight size={16} className="text-slate-400 dark:text-slate-600" />
          </button>

          <button
            onClick={() => handleNavClick('announcements')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition touch-target ${
              currentTab === 'announcements' ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-600/50' : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-amber-600 dark:text-amber-400" />
              <span>{getTranslation(language, 'navAnnouncements')}</span>
            </div>
            <ChevronRight size={16} className="text-slate-400 dark:text-slate-600" />
          </button>

          {/* Mobile Theme Toggle Section */}
          <div className="pt-2">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 touch-target"
            >
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-700 dark:text-slate-300" />}
                <span>{theme === 'dark' ? getTranslation(language, 'themeLight') : getTranslation(language, 'themeDark')}</span>
              </div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase">
                {theme}
              </span>
            </button>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <button
              onClick={() => handleNavClick('judge')}
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold text-blue-900 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 touch-target"
            >
              <div className="flex items-center gap-3">
                <Award size={18} className="text-blue-700 dark:text-blue-400" />
                <span>{getTranslation(language, 'navJudgePortal')}</span>
              </div>
              <ChevronRight size={16} className="text-blue-400" />
            </button>

            <button
              onClick={() => handleNavClick('admin')}
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 touch-target"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-amber-700 dark:text-amber-400" />
                <span>{getTranslation(language, 'navAdmin')}</span>
              </div>
              <ChevronRight size={16} className="text-amber-500" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
