import React from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  Search, 
  Users, 
  Calendar, 
  Bell, 
  Sparkles, 
  ArrowRight, 
  Pin,
  Clock,
  MapPin
} from 'lucide-react';
import { useFest } from '../../context/FestContext';
import { getTranslation } from '../../i18n/translations';
import { FestLogoBadge, IslamicStar } from '../common/IslamicPattern';

interface HomeViewProps {
  onNavigate: (tab: string, extraId?: string) => void;
  onOpenLogin: () => void;
  onOpenPoster?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onOpenLogin, onOpenPoster }) => {
  const { festSettings, teams, announcements, programmes, language } = useFest();

  const pinnedAnnouncements = announcements.filter(a => a.is_pinned);
  const regularAnnouncements = announcements.filter(a => !a.is_pinned);
  const upcomingProgrammes = programmes.slice(0, 4);

  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-6 sm:pt-12 pb-8 sm:pb-12 px-3 sm:px-6">
        {/* Soft Ambient Light Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] max-w-full h-[350px] bg-gradient-to-b from-amber-200/30 via-blue-100/20 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center">
          {/* Top subtle emblem pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-white border border-amber-300 text-amber-900 text-xs font-bold tracking-wide mb-4 shadow-xs"
          >
            <IslamicStar size={13} className="text-amber-600 animate-pulse" />
            <span className="font-outfit uppercase tracking-wider text-[10px] sm:text-xs font-extrabold">
              {language === 'ml' ? festSettings.institutionNameMl : festSettings.institutionName}
            </span>
            <IslamicStar size={13} className="text-amber-600 animate-pulse" />
          </motion.div>

          {/* Official Fest Logo with Gold Border */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="flex justify-center mb-5"
          >
            <div className="relative group cursor-pointer" onClick={() => onOpenPoster && onOpenPoster()}>
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-300/40 via-yellow-200/30 to-amber-400/40 rounded-3xl blur-md group-hover:blur-lg transition duration-500" />
              <FestLogoBadge size="xl" customLogo={festSettings.festLogo} className="relative border-2 border-amber-400 shadow-lg shadow-amber-500/10" />
            </div>
          </motion.div>

          {/* Executive & Grand Fest Title */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-3"
          >
            <h1 className="font-fest-display text-3xl xs:text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-wider leading-[1.1]">
              <span className="text-slate-900 drop-shadow-xs">
                {language === 'ml' ? festSettings.festNameMl : festSettings.festName}
              </span>
            </h1>
            <div className="flex items-center justify-center gap-2 sm:gap-3 mt-1 sm:mt-2">
              <span className="h-[2px] w-6 sm:w-16 bg-gradient-to-r from-transparent to-amber-500" />
              <span className="font-heading font-black text-amber-700 text-xl sm:text-3xl md:text-4xl tracking-widest">
                {festSettings.festYear}
              </span>
              <span className="h-[2px] w-8 sm:w-16 bg-gradient-to-l from-transparent to-amber-500" />
            </div>
          </motion.div>

          {/* Executive Slogan & Motto Container */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-7 max-w-3xl mx-auto px-2"
          >
            <div className="relative inline-block px-4 sm:px-8 py-3 rounded-2xl bg-white border border-amber-300 shadow-sm">
              <p className="font-fest-motto text-sm sm:text-xl md:text-2xl text-slate-900 font-bold tracking-wide leading-relaxed">
                &ldquo;{language === 'ml' ? festSettings.festThemeMl : festSettings.festTheme}&rdquo;
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-1.5 text-[10px] sm:text-xs text-amber-800 font-outfit uppercase tracking-widest font-bold">
                <span>ASSIBAQUE &apos;26</span>
                <span className="text-slate-300">•</span>
                <span className="text-amber-900">NAYRO</span>
                <span className="text-slate-300">|</span>
                <span className="text-amber-900">ZAYRO</span>
                <span className="text-slate-300">|</span>
                <span className="text-amber-900">LUCERO</span>
              </div>
            </div>
          </motion.div>

          {/* Primary Quick Action CTA buttons (App-Style) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-xl mx-auto"
          >
            <button
              onClick={() => onNavigate('scoreboard')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm sm:text-base shadow-md transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5 active:scale-95 touch-target"
            >
              <Trophy size={19} className="text-slate-950" />
              <span>{getTranslation(language, 'viewLiveScoreboard')}</span>
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-slate-950 text-amber-300 uppercase tracking-wider">
                LIVE
              </span>
            </button>

            <button
              onClick={() => onNavigate('student_result')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-bold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer shadow-xs transform hover:-translate-y-0.5 active:scale-95 touch-target"
            >
              <Search size={18} className="text-amber-600" />
              <span>{getTranslation(language, 'checkResultBtn')}</span>
            </button>

            {onOpenPoster && (
              <button
                onClick={onOpenPoster}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs transform hover:-translate-y-0.5 active:scale-95 touch-target"
                title="Generate and download official WhatsApp Status Posters"
              >
                <Sparkles size={18} className="text-amber-700" />
                <span>Result Posters</span>
              </button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Live 3-Team Podium Showcase (Nayro, Zayro, Lucero) */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="font-heading text-xl sm:text-3xl font-extrabold text-slate-900 tracking-wide">
            {getTranslation(language, 'teamStandings')}
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            {language === 'ml' 
              ? 'നൈറോ, സൈറോ, ലൂസെറോ ടീമുകളുടെ ഔദ്യോഗിക ലൈവ് പോയിന്റുകൾ'
              : 'Official live point standings across NAYRO, ZAYRO, and LUCERO'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {teams.map((team, idx) => {
            const isLeader = team.rank === 1;
            return (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => onNavigate('teams', team.id)}
                className={`cursor-pointer rounded-2xl sm:rounded-3xl p-5 sm:p-6 border transition-all duration-200 hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between ${
                  isLeader
                    ? 'bg-amber-50/60 border-amber-400 shadow-md'
                    : 'bg-white border-slate-200 hover:border-amber-300 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase ${
                      isLeader ? 'bg-amber-400 text-slate-950 shadow-xs' : 'bg-slate-100 text-slate-700'
                    }`}>
                      RANK #{team.rank} {isLeader && '• LEADER'}
                    </span>
                    <span className="text-2xl sm:text-3xl">{team.logo}</span>
                  </div>

                  <h3 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 tracking-wide">
                    {team.name}
                  </h3>
                  <p className="text-xs text-amber-800 font-medium italic mt-0.5">
                    "{language === 'ml' ? team.sloganMl : team.slogan}"
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">
                      Total Points
                    </span>
                    <div className="text-2xl sm:text-4xl font-black font-heading text-slate-900">
                      {team.totalPoints} <span className="text-xs font-semibold text-slate-500">PTS</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-amber-700">
                    <span>Explore</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Announcements & Upcoming Programmes Grid */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Announcements Card */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={20} className="text-amber-600" />
                <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900">
                  {getTranslation(language, 'navAnnouncements')}
                </h3>
              </div>
              <button
                onClick={() => onNavigate('announcements')}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer touch-target"
              >
                <span>View All</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="space-y-2.5">
              {[...pinnedAnnouncements, ...regularAnnouncements].slice(0, 3).map(a => (
                <div
                  key={a.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-300 transition"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-bold text-amber-800 flex items-center gap-1">
                      {a.is_pinned && <Pin size={11} className="text-amber-600" />}
                      {(a.priority || 'general').toUpperCase()}
                    </span>
                    <span>{a.created_at}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{a.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{a.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Scheduled Events Highlights */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-amber-600" />
                <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900">
                  {getTranslation(language, 'upcomingEvents')}
                </h3>
              </div>
              <button
                onClick={() => onNavigate('programmes')}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer touch-target"
              >
                <span>Full Schedule</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="space-y-2.5">
              {upcomingProgrammes.map(p => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 hover:border-amber-300 transition"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                        {p.programme_code}
                      </span>
                      <span className="text-xs text-slate-500">{p.category}</span>
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{p.programme_name}</h4>
                    <div className="flex items-center gap-3 text-[11px] text-slate-600 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin size={11} className="text-amber-600" />
                        <span className="truncate">{p.venue}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        <span>{p.scheduled_time}</span>
                      </span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                    p.status === 'ongoing' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
