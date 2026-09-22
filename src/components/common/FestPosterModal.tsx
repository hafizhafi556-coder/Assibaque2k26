import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Sparkles, 
  Trophy, 
  Calendar, 
  Award, 
  MapPin, 
  Users, 
  Medal,
  Download
} from 'lucide-react';
import { useFest } from '../../context/FestContext';
import { IslamicStar } from './IslamicPattern';
import { TeamId } from '../../types';

interface FestPosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'theme' | 'result' | 'championship';
  initialProgrammeId?: string;
}

export const FestPosterModal: React.FC<FestPosterModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'theme',
  initialProgrammeId
}) => {
  const { festSettings, teams, programmes, results, students } = useFest();

  const [posterType, setPosterType] = useState<'theme' | 'result' | 'championship'>(initialMode);
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string>(
    initialProgrammeId || (programmes.find(p => p.status === 'published')?.id || programmes[0]?.id || '')
  );

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const selectedProgramme = programmes.find(p => p.id === selectedProgrammeId);
  const programmeResults = results
    .filter(r => r.programme_id === selectedProgrammeId && (r.position === 1 || r.position === 2 || r.position === 3))
    .sort((a, b) => (a.position || 99) - (b.position || 99));

  const sortedTeams = [...teams].sort((a, b) => a.rank - b.rank);

  const getTeamColor = (teamId: TeamId | string) => {
    switch (teamId.toLowerCase()) {
      case 'nayro':
        return 'text-sky-950 bg-sky-50 border-sky-300';
      case 'zayro':
        return 'text-amber-950 bg-amber-50 border-amber-300';
      case 'lucero':
        return 'text-purple-950 bg-purple-50 border-purple-300';
      default:
        return 'text-slate-900 bg-slate-50 border-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white animate-fadeIn">
      <div className="w-full max-w-4xl bg-white border border-amber-300 rounded-3xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:bg-white print:rounded-none my-auto print-modal">
        
        {/* Modal Top Control Bar (Hidden on Print) */}
        <div className="no-print p-4 sm:px-6 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="text-amber-600" size={18} />
            <h3 className="font-heading text-sm sm:text-base font-bold text-slate-900">
              Official Fest Poster Generator
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Type selector */}
            <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-xs text-xs font-semibold">
              <button
                onClick={() => setPosterType('theme')}
                className={`px-3 py-1 rounded-lg transition ${
                  posterType === 'theme' ? 'bg-amber-400 text-slate-950 font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Fest Poster
              </button>
              <button
                onClick={() => setPosterType('result')}
                className={`px-3 py-1 rounded-lg transition ${
                  posterType === 'result' ? 'bg-amber-400 text-slate-950 font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Result Winner
              </button>
              <button
                onClick={() => setPosterType('championship')}
                className={`px-3 py-1 rounded-lg transition ${
                  posterType === 'championship' ? 'bg-amber-400 text-slate-950 font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Championship
              </button>
            </div>

            {posterType === 'result' && (
              <select
                value={selectedProgrammeId}
                onChange={e => setSelectedProgrammeId(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 font-bold focus:outline-none focus:border-amber-400 max-w-[160px] sm:max-w-xs truncate"
              >
                {programmes.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.programme_code} - {p.programme_name}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition shadow-xs cursor-pointer touch-target active:scale-95"
            >
              <Printer size={14} />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Poster Canvas */}
        <div className="p-4 sm:p-8 max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible flex justify-center bg-slate-100">
          <div 
            id="festPosterPrintArea"
            className="printable-card relative w-full max-w-2xl bg-white border-4 border-amber-400 p-5 sm:p-8 rounded-3xl shadow-xl text-slate-950 overflow-hidden text-center select-none"
          >
            {/* Corner Decorative Islamic Brackets */}
            <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
            <div className="absolute top-3 right-3 w-10 h-10 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-10 h-10 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-10 h-10 border-b-2 border-r-2 border-amber-400 pointer-events-none" />

            {/* Inner Gold Inset Frame */}
            <div className="absolute inset-2 border border-dashed border-amber-400/40 rounded-2xl pointer-events-none" />

            {/* CRITICAL WATERMARK LEVEL LOGO BACKGROUND */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden select-none">
              <img
                src={festSettings.festLogo}
                alt=""
                className="w-[480px] max-w-[85%] max-h-[85%] object-contain opacity-[0.08] filter grayscale contrast-125 print:opacity-[0.10] print:block"
              />
            </div>

            {/* Poster Content (Relative Z-10 on top of watermark) */}
            <div className="relative z-10 space-y-5">
              
              {/* Institution Header */}
              <div className="pt-2">
                <div className="flex items-center justify-center gap-2 text-amber-800 text-xs font-bold tracking-widest uppercase mb-1">
                  <IslamicStar size={13} />
                  <span>{festSettings.institutionNameMl || 'ഇമാം ശാഫി ഇസ്ലാമിക് അക്കാദമി'}</span>
                  <IslamicStar size={13} />
                </div>
                <h2 className="font-heading text-xl sm:text-2xl font-black text-slate-950 tracking-wider">
                  {festSettings.institutionName || 'IMAM SHAFI ISLAMIC ACADEMY'}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-600 uppercase tracking-widest font-semibold">
                  തനിമിയ്യത്ത് സാഹിത്യ സമാജം • Department of Cultural Affairs
                </p>
              </div>

              {/* Official Festival Emblem Badge */}
              <div className="flex justify-center my-1">
                <div className="relative p-1.5 rounded-2xl bg-white border-2 border-amber-400 shadow-md">
                  <img
                    src={festSettings.festLogo}
                    alt="Fest Logo"
                    className="w-16 h-20 sm:w-20 sm:h-24 object-contain filter drop-shadow-xs"
                  />
                </div>
              </div>

              {/* Poster Specific Body */}
              {posterType === 'theme' && (
                <>
                  {/* Grand Fest Title */}
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-widest text-amber-800 font-extrabold">
                      Grand Annual Arts Festival
                    </span>
                    <h1 className="font-heading text-3xl sm:text-5xl font-black text-slate-950 tracking-wider leading-tight">
                      {festSettings.festName} {festSettings.festYear}
                    </h1>
                    <p className="font-serif text-lg sm:text-xl text-amber-900 font-bold italic mt-1">
                      &ldquo;{festSettings.festTheme}&rdquo;
                    </p>
                  </div>

                  {/* Competing Teams Trio */}
                  <div className="py-2">
                    <div className="text-[11px] uppercase tracking-widest text-slate-600 font-bold mb-3">
                      Battle of Champions • Competing Teams
                    </div>
                    <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
                      {sortedTeams.map(t => (
                        <div 
                          key={t.id} 
                          className={`p-3 rounded-2xl border text-center shadow-xs ${getTeamColor(t.id)}`}
                        >
                          <div className="w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs bg-white mb-1.5 border border-current shadow-xs">
                            {t.name.slice(0, 1)}
                          </div>
                          <h4 className="font-heading font-black text-sm uppercase tracking-wide">
                            {t.name}
                          </h4>
                          <span className="text-[10px] font-semibold opacity-80 block mt-0.5">
                            {t.studentsCount} Contestants
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Highlights and Stage Info */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto pt-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
                      <Calendar size={15} className="text-amber-600 mx-auto mb-1" />
                      <span className="font-black text-slate-900 block">October 15-17</span>
                      <span className="text-[10px] text-slate-500 font-semibold">2026 Edition</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
                      <MapPin size={15} className="text-amber-600 mx-auto mb-1" />
                      <span className="font-black text-slate-900 block">Main Auditorium</span>
                      <span className="text-[10px] text-slate-500 font-semibold">Imam Shafi Hall</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
                      <Trophy size={15} className="text-amber-600 mx-auto mb-1" />
                      <span className="font-black text-slate-900 block">{programmes.length}+ Events</span>
                      <span className="text-[10px] text-slate-500 font-semibold">Stage & Non-Stage</span>
                    </div>
                  </div>
                </>
              )}

              {posterType === 'result' && (
                <>
                  <div className="space-y-1">
                    <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 font-black text-xs uppercase tracking-wider">
                      Official Result Bulletin
                    </div>
                    <h1 className="font-heading text-2xl sm:text-3xl font-black text-slate-950">
                      {selectedProgramme?.programme_name}
                    </h1>
                    <p className="text-xs text-amber-800 font-mono font-bold">
                      Code: {selectedProgramme?.programme_code} • Category: {selectedProgramme?.category} ({selectedProgramme?.type.toUpperCase()})
                    </p>
                  </div>

                  {/* Top 3 Winners Card */}
                  <div className="py-2 space-y-2.5 max-w-lg mx-auto">
                    {programmeResults.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-xs">
                        Results for this programme are being compiled by the judges.
                      </div>
                    ) : (
                      programmeResults.map((r) => {
                        const student = students.find(s => s.id === r.student_id);
                        return (
                          <div
                            key={r.id}
                            className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-left ${
                              r.position === 1
                                ? 'bg-amber-50 border-amber-400 shadow-md'
                                : r.position === 2
                                ? 'bg-slate-50 border-slate-300'
                                : 'bg-amber-50/50 border-amber-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-heading font-black text-base shadow-xs ${
                                r.position === 1 ? 'bg-amber-400 text-slate-950' :
                                r.position === 2 ? 'bg-slate-200 text-slate-900' :
                                'bg-amber-200 text-amber-950'
                              }`}>
                                {r.position === 1 ? '1st' : r.position === 2 ? '2nd' : '3rd'}
                              </div>

                              <div>
                                <span className="font-black text-slate-950 text-sm block">
                                  {student?.student_name || 'Participant'}
                                </span>
                                <span className="text-[11px] text-slate-600 font-mono font-semibold">
                                  Chest #{r.chest_number} • Class {student?.class || '-'}
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border block mb-1 ${getTeamColor(r.team)}`}>
                                {r.team}
                              </span>
                              {r.grade && (
                                <span className="text-xs font-black text-amber-900">
                                  Grade {r.grade}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}

              {posterType === 'championship' && (
                <>
                  <div className="space-y-1">
                    <div className="inline-block px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-950 font-black text-xs uppercase tracking-wider">
                      Championship Standings
                    </div>
                    <h1 className="font-heading text-2xl sm:text-4xl font-black text-slate-950">
                      Leaderboard Bulletin
                    </h1>
                    <p className="text-xs text-slate-600 font-medium">
                      Live score tabulation across Individual, Group & General points
                    </p>
                  </div>

                  {/* Teams Ranked Standings */}
                  <div className="py-2 space-y-2.5 max-w-md mx-auto">
                    {sortedTeams.map((t, idx) => (
                      <div
                        key={t.id}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-left ${
                          idx === 0
                            ? 'bg-amber-50 border-amber-400 shadow-md'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-heading font-black text-sm ${
                            idx === 0 ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-800'
                          }`}>
                            #{idx + 1}
                          </div>
                          <div>
                            <h4 className="font-heading font-black text-sm uppercase text-slate-950">
                              TEAM {t.name}
                            </h4>
                            <span className="text-[10px] text-slate-600 font-semibold">
                              🥇 {t.goldCount} 🥈 {t.silverCount} 🥉 {t.bronzeCount}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-black text-lg text-amber-900 font-mono">
                            {t.totalPoints} <span className="text-xs text-amber-700">PTS</span>
                          </div>
                          <span className="text-[10px] text-slate-600 font-semibold">
                            {idx === 0 ? '🏆 Championship Leader' : 'Challenger'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Committee Signatures & Official Stamp */}
              <div className="pt-4 border-t border-amber-300 flex items-end justify-between text-xs text-slate-600 px-2 sm:px-6">
                <div className="text-center">
                  <div className="font-serif text-amber-900 font-bold italic text-sm mb-1">
                    Sayyid Munavvarali S.
                  </div>
                  <div className="w-28 sm:w-32 border-t border-slate-300 mx-auto pt-1 text-[10px] uppercase font-semibold text-slate-600">
                    General Convener
                  </div>
                </div>

                {/* Central Verified Emblem */}
                <div className="w-12 h-12 rounded-full border border-amber-400 bg-amber-50 flex flex-col items-center justify-center text-[8px] font-bold text-amber-900 uppercase tracking-tighter shadow-xs">
                  <span>OFFICIAL</span>
                  <IslamicStar size={10} className="my-0.5 text-amber-600" />
                  <span>SEAL</span>
                </div>

                <div className="text-center">
                  <div className="font-serif text-amber-900 font-bold italic text-sm mb-1">
                    Dr. Hamza Baqavi
                  </div>
                  <div className="w-28 sm:w-32 border-t border-slate-300 mx-auto pt-1 text-[10px] uppercase font-semibold text-slate-600">
                    Program Director
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
