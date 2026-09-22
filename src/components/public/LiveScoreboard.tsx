import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, RefreshCw, Award, Sparkles, Filter, CheckCircle2, Smartphone } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFest } from '../../context/FestContext';
import { getTranslation } from '../../i18n/translations';
import { IslamicStar } from '../common/IslamicPattern';
import { ResultPosterModal } from '../common/ResultPosterModal';

export const LiveScoreboard: React.FC<{ onSelectTeam?: (teamId: string) => void }> = ({ onSelectTeam }) => {
  const { teams, results, categories, language, festSettings, programmes, students } = useFest();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefreshCountdown, setAutoRefreshCountdown] = useState(15);
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const [selectedPosterProgrammeId, setSelectedPosterProgrammeId] = useState<string | null>(null);

  const publishedProgrammes = programmes.filter(p => results.some(r => r.programme_id === p.id && r.status === 'published'));

  const handleOpenPoster = (programmeId: string) => {
    setSelectedPosterProgrammeId(programmeId);
    setIsPosterModalOpen(true);
  };

  // Auto refresh timer simulation (15s)
  useEffect(() => {
    const timer = setInterval(() => {
      setAutoRefreshCountdown(prev => {
        if (prev <= 1) {
          setLastUpdated(new Date().toLocaleTimeString());
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#0284c7', '#8b5cf6', '#d97706'],
    });
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastUpdated(new Date().toLocaleTimeString());
      setIsRefreshing(false);
      setAutoRefreshCountdown(15);
      triggerConfetti();
    }, 400);
  };

  const displayTeams = teams.map(team => team);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return {
        badge: '🥇 1st',
        border: 'border-amber-400',
        cardBg: 'bg-amber-50/70',
        title: language === 'ml' ? 'ഒന്നാം സ്ഥാനം' : 'Current Leaders',
      };
    }
    if (rank === 2) {
      return {
        badge: '🥈 2nd',
        border: 'border-slate-300',
        cardBg: 'bg-white',
        title: language === 'ml' ? 'രണ്ടാം സ്ഥാനം' : 'Runners-up',
      };
    }
    return {
      badge: '🥉 3rd',
      border: 'border-amber-200',
      cardBg: 'bg-white',
      title: language === 'ml' ? 'മൂന്നാം സ്ഥാനം' : 'Third Place',
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold mb-2.5">
          <Sparkles size={14} className="text-amber-600" />
          <span>{language === 'ml' ? 'തത്സമയ പോയിന്റ് പട്ടിക' : 'Live Scorecard & Team Standings'}</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-wide mb-1.5">
          {getTranslation(language, 'liveStandings')}
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm">
          {language === 'ml' 
            ? 'ഔദ്യോഗികമായി പരിശോധിച്ചു പ്രസിദ്ധീകരിച്ച ഫലങ്ങളുടെ അടിസ്ഥാനത്തിൽ തത്സമയം കണക്കാക്കിയ പോയിന്റുകൾ.' 
            : 'Calculated dynamically and strictly from verified published results across all events.'}
        </p>
      </div>

      {/* Control Bar: Categories Filter & Auto Refresh indicator */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
        {/* Category filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <Filter size={15} className="text-amber-600 shrink-0 ml-1" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            {getTranslation(language, 'category')}:
          </span>
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer touch-target ${
              selectedCategory === 'ALL'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {getTranslation(language, 'all')}
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.code)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer touch-target ${
                selectedCategory === cat.code
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {language === 'ml' ? cat.nameMl : cat.name}
            </button>
          ))}
        </div>

        {/* Refresh button & status */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 text-xs text-slate-600 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
          <button
            onClick={() => setIsPosterModalOpen(true)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs transition cursor-pointer touch-target"
            title="Download WhatsApp Status Result Poster"
          >
            <Smartphone size={14} className="text-amber-700" />
            <span>{language === 'ml' ? 'പോസ്റ്റർ' : 'Result Posters'}</span>
          </button>
          
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{autoRefreshCountdown}s</span>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold transition cursor-pointer touch-target"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{getTranslation(language, 'refreshNow')}</span>
          </button>
        </div>
      </div>

      {/* Main 3 Teams Cards Layout (Nayro, Zayro, Lucero) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {displayTeams.map((team, idx) => {
          const rankInfo = getRankBadge(team.rank);
          const isLeader = team.rank === 1;

          return (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative rounded-2xl sm:rounded-3xl p-5 sm:p-6 border ${rankInfo.border} ${rankInfo.cardBg} shadow-xs flex flex-col justify-between overflow-hidden transition-all duration-200 hover:-translate-y-0.5`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    isLeader ? 'bg-amber-400 text-slate-950 shadow-xs' : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {rankInfo.badge} • {rankInfo.title}
                  </span>

                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shadow-xs">
                    {team.logo}
                  </div>
                </div>

                {/* Team Name and Slogan */}
                <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-wider mb-1 flex items-center gap-2">
                  <span>{team.name}</span>
                  {isLeader && <IslamicStar size={18} className="text-amber-600 animate-pulse" />}
                </h2>
                <p className="text-xs text-amber-800 italic font-medium mb-4">
                  "{language === 'ml' ? team.sloganMl : team.slogan}"
                </p>

                {/* Big Animated Points Block */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 mb-4 shadow-xs">
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">
                    {getTranslation(language, 'overallPoints')}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black font-heading text-slate-900 tracking-tight">
                      {team.totalPoints}
                    </span>
                    <span className="text-xs font-bold text-slate-500">PTS</span>
                  </div>
                </div>

                {/* Trophies breakdown: 1st, 2nd, 3rd positions */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {/* Gold (1st) */}
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-300 text-center">
                    <div className="text-sm mb-0.5">🥇</div>
                    <div className="text-base font-bold text-amber-950">{team.goldCount}</div>
                    <div className="text-[9px] text-amber-900 font-semibold">{getTranslation(language, 'goldTrophies')}</div>
                  </div>

                  {/* Silver (2nd) */}
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <div className="text-sm mb-0.5">🥈</div>
                    <div className="text-base font-bold text-slate-800">{team.silverCount}</div>
                    <div className="text-[9px] text-slate-600 font-semibold">{getTranslation(language, 'silverTrophies')}</div>
                  </div>

                  {/* Bronze (3rd) */}
                  <div className="p-2 rounded-xl bg-amber-50/50 border border-amber-200 text-center">
                    <div className="text-sm mb-0.5">🥉</div>
                    <div className="text-base font-bold text-amber-800">{team.bronzeCount}</div>
                    <div className="text-[9px] text-amber-800 font-semibold">{getTranslation(language, 'bronzeTrophies')}</div>
                  </div>
                </div>

                {/* Team meta stats */}
                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Students:</span>
                    <strong className="text-slate-900">{team.studentsCount} Registered</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Events:</span>
                    <strong className="text-emerald-700">{team.completedResultsCount} Published</strong>
                  </div>
                </div>
              </div>

              {/* View Team Portal button */}
              {onSelectTeam && (
                <button
                  onClick={() => onSelectTeam(team.id)}
                  className="mt-4 w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer touch-target shadow-xs"
                >
                  <Trophy size={14} className="text-amber-600" />
                  <span>{team.name} Team Portal</span>
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Point Rules Configuration Snapshot */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white text-xs text-slate-700 border border-slate-200 shadow-xs space-y-4 mb-8">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-slate-900 font-heading font-bold text-sm">
            <CheckCircle2 size={16} className="text-amber-600" />
            <span>{language === 'ml' ? 'പോയിന്റ് നിർണ്ണയ രീതി (3 ക്രൈറ്റീരിയ + പൈൻ ഗ്രേഡ്)' : 'Automatic Point Scheme (3-Tier Criteria & Pine Grade)'}</span>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-mono">
            Total Points = Position Points + Grade Points
          </span>
        </div>

        {/* 3 Criteria Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Individual */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-800 font-bold uppercase tracking-wider text-xs">👤 Individual</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">5, 3, 1</span>
            </div>
            <div className="flex justify-between text-slate-600 text-[11px]">
              <span>🥇 1st: <strong className="text-slate-900 font-mono">{festSettings.pointScheme?.individual?.first ?? 5} pts</strong></span>
              <span>🥈 2nd: <strong className="text-slate-900 font-mono">{festSettings.pointScheme?.individual?.second ?? 3} pts</strong></span>
              <span>🥉 3rd: <strong className="text-slate-900 font-mono">{festSettings.pointScheme?.individual?.third ?? 1} pt</strong></span>
            </div>
          </div>

          {/* Group */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-emerald-800 font-bold uppercase tracking-wider text-xs">👥 Group</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">10, 5, 3</span>
            </div>
            <div className="flex justify-between text-slate-600 text-[11px]">
              <span>🥇 1st: <strong className="text-slate-900 font-mono">{festSettings.pointScheme?.group?.first ?? 10} pts</strong></span>
              <span>🥈 2nd: <strong className="text-slate-900 font-mono">{festSettings.pointScheme?.group?.second ?? 5} pts</strong></span>
              <span>🥉 3rd: <strong className="text-slate-900 font-mono">{festSettings.pointScheme?.group?.third ?? 3} pts</strong></span>
            </div>
          </div>

          {/* General */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-800 font-bold uppercase tracking-wider text-xs">🌟 General</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-bold">15, 8, 5</span>
            </div>
            <div className="flex justify-between text-slate-600 text-[11px]">
              <span>🥇 1st: <strong className="text-slate-900 font-mono">{festSettings.pointScheme?.general?.first ?? 15} pts</strong></span>
              <span>🥈 2nd: <strong className="text-slate-900 font-mono">{festSettings.pointScheme?.general?.second ?? 8} pts</strong></span>
              <span>🥉 3rd: <strong className="text-slate-900 font-mono">{festSettings.pointScheme?.general?.third ?? 5} pts</strong></span>
            </div>
          </div>
        </div>

        {/* Grade Points (Pine Grade) */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-amber-600" />
            <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              {language === 'ml' ? 'പൈൻ ഗ്രേഡ് പോയിന്റുകൾ' : 'Pine Grade Points Scheme'}:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-amber-100 border border-amber-300 text-amber-900 font-bold">
              Grade A = <span className="font-mono">{festSettings.pointScheme?.grades?.A ?? 5} Pts</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-100 border border-blue-300 text-blue-900 font-bold">
              Grade B = <span className="font-mono">{festSettings.pointScheme?.grades?.B ?? 3} Pts</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-100 border border-rose-300 text-rose-900 font-bold">
              Grade C = <span className="font-mono">{festSettings.pointScheme?.grades?.C ?? 1} Pt</span>
            </span>
          </div>
        </div>
      </div>

      {/* Published Results Bulletins & Poster Gallery */}
      {publishedProgrammes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="text-amber-600" size={18} />
              <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900">
                {language === 'ml' ? 'ഫല പോസ്റ്ററുകൾ & ബുള്ളറ്റിനുകൾ' : 'Official WhatsApp Result Posters'}
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {publishedProgrammes.length} Events Published
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {publishedProgrammes.map(prg => {
              const topWinner = results.find(r => r.programme_id === prg.id && r.status === 'published' && r.position === 1);
              const topStudent = topWinner ? students.find(s => s.id === topWinner.student_id) : null;

              return (
                <div 
                  key={prg.id}
                  className="p-4 rounded-xl bg-white border border-slate-200 hover:border-amber-400 transition flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-100 text-amber-900">
                        {prg.programme_code}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {prg.category}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 truncate">{prg.programme_name}</h4>
                    {topWinner && (
                      <p className="text-[11px] text-amber-800 font-semibold truncate mt-0.5">
                        🥇 {topStudent?.student_name || `Chest #${topWinner.chest_number}`} ({topWinner.team.toUpperCase()})
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenPoster(prg.id)}
                    className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition flex items-center gap-1 shrink-0 shadow-xs cursor-pointer touch-target active:scale-95"
                  >
                    <Smartphone size={13} />
                    <span>Poster</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WhatsApp Status Result Poster Modal */}
      <ResultPosterModal
        isOpen={isPosterModalOpen}
        onClose={() => setIsPosterModalOpen(false)}
        initialProgrammeId={selectedPosterProgrammeId || undefined}
      />
    </div>
  );
};
