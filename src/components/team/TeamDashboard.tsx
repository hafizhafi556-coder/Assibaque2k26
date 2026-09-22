import React, { useState } from 'react';
import { 
  Users, 
  Trophy, 
  Calendar,
  ShieldAlert,
  Smartphone,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  User
} from 'lucide-react';
import { 
  useFest, 
  calculateTotalResultPoints, 
  getProgrammeCriteriaType, 
  formatParticipantDisplayName,
  isStudentEligibleForProgramme,
  normalizeCategory
} from '../../context/FestContext';
import { TeamId } from '../../types';
import { ResultPosterModal } from '../common/ResultPosterModal';

export const TeamDashboard: React.FC<{ initialTeamId?: TeamId }> = ({ initialTeamId = 'nayro' }) => {
  const { 
    teams, 
    students, 
    programmes, 
    results, 
    participants, 
    language, 
    currentUser, 
    festSettings, 
    categories, 
    assignParticipant,
    removeParticipant 
  } = useFest();
  
  const lockedTeam = currentUser?.role === 'team_manager' ? currentUser.teamId : null;
  const [selectedTeamId, setSelectedTeamId] = useState<TeamId>(lockedTeam || initialTeamId);
  const [studentSearch, setStudentSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'roster' | 'winners' | 'programmes'>('roster');

  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const [selectedPosterProgrammeId, setSelectedPosterProgrammeId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  const currentTeam = teams.find(t => t.id === selectedTeamId) || teams[0];

  const teamStudents = students.filter(s => s.team === selectedTeamId);
  const filteredStudents = teamStudents.filter(s => 
    s.student_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.chest_number.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.class.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const teamWinners = results.filter(r => r.team === selectedTeamId && r.status === 'published' && r.position !== null);
  const teamParticipants = participants.filter(p => p.team === selectedTeamId);

  const [filterType, setFilterType] = useState<'all' | 'stage' | 'non_stage'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredProgrammes = programmes.filter(p => {
    const matchesCat = filterCategory === 'all' || normalizeCategory(p.category) === normalizeCategory(filterCategory);
    let matchesType = true;
    if (filterType !== 'all') {
      const isStage = p.type === 'stage' || (p.venue || '').toLowerCase().includes('stage');
      matchesType = filterType === 'stage' ? isStage : !isStage;
    }
    return matchesCat && matchesType;
  });

  const handleRegister = (programmeId: string, studentId: string) => {
    const prg = programmes.find(p => p.id === programmeId);
    if (!prg) return;

    const teamParticipantsForPrg = participants.filter(p => p.programme_id === programmeId && p.team === selectedTeamId);
    const pCat = normalizeCategory(prg.category);
    const limit = pCat === 'sub_junior' ? 3 : 2;
    
    if (teamParticipantsForPrg.length >= limit) {
      showFeedback(`Registration limit reached for this event (${limit} participant(s) allowed per team).`, 'error');
      return;
    }
    
    const isAlreadyRegistered = participants.some(p => p.programme_id === programmeId && p.student_id === studentId);
    if (isAlreadyRegistered) {
      showFeedback("Student is already registered for this event.", 'error');
      return;
    }
    
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const result = assignParticipant({
      programme_id: programmeId,
      student_id: studentId,
      team: selectedTeamId,
      status: 'registered',
      participant_id: 'part-team-' + Date.now(),
      chest_number: student.chest_number
    });
    
    if (!result.success) {
      showFeedback(result.error || 'Failed to register', 'error');
    } else {
      showFeedback(`✅ Registered ${student.student_name} (#${student.chest_number}) for ${prg.programme_name}! Live updated.`, 'success');
    }
  };

  const handleRemove = (participantId: string, studentName: string, programmeName: string) => {
    removeParticipant(participantId);
    showFeedback(`🗑️ Removed ${studentName} from ${programmeName}. Synced live.`, 'success');
  };

  const handleOpenPoster = (programmeId: string) => {
    setSelectedPosterProgrammeId(programmeId);
    setIsPosterModalOpen(true);
  };

  const getTeamColorBanner = (teamId: TeamId) => {
    if (teamId === 'nayro') return 'bg-sky-50 border-sky-300 text-sky-950';
    if (teamId === 'zayro') return 'bg-amber-50 border-amber-300 text-amber-950';
    return 'bg-purple-50 border-purple-300 text-purple-950';
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
      {/* Team Selection Tabs */}
      {!lockedTeam && (
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 flex-wrap">
          {teams.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTeamId(t.id)}
              className={`px-4 sm:px-5 py-2.5 rounded-xl font-heading text-xs sm:text-sm font-bold tracking-wider transition-all flex items-center gap-2 cursor-pointer touch-target ${
                selectedTeamId === t.id
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <span>{t.logo}</span>
              <span>{t.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Team Manager Scope Notice */}
      {currentUser?.role === 'team_manager' && (
        <div className="mb-4 p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-xs flex items-center gap-2">
          <ShieldAlert size={16} className="text-sky-700 shrink-0" />
          <span>
            {language === 'ml'
              ? `നിങ്ങൾ ${currentTeam.name} ടീം മാനേജർ ആയി ലോഗിൻ ചെയ്തിരിക്കുന്നു.`
              : `Logged in as ${currentTeam.name} Team Manager.`}
          </span>
        </div>
      )}

      {/* Live Feedback Toast */}
      {feedback && (
        <div className={`mb-4 p-3.5 rounded-xl border flex items-center gap-2.5 text-xs sm:text-sm font-semibold transition-all shadow-xs ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
            : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-700 shrink-0" /> : <AlertCircle size={16} className="text-rose-700 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Team Hero Header */}
      <div className={`p-5 sm:p-7 rounded-2xl sm:rounded-3xl ${getTeamColorBanner(currentTeam.id)} border shadow-xs mb-6`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-3xl shadow-xs shrink-0">
              {currentTeam.logo}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white text-slate-900 border border-slate-200 shadow-xs">
                  Team Rank #{currentTeam.rank}
                </span>
                <span className="text-xs text-slate-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-wide mt-1">
                {currentTeam.name}
              </h1>
              <p className="text-xs text-slate-600 italic mt-0.5">
                "{language === 'ml' ? currentTeam.sloganMl : currentTeam.slogan}"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-right">
            <div className="p-3 sm:p-3.5 rounded-xl bg-white border border-slate-200 text-center min-w-[100px] shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Total Points</span>
              <strong className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                {currentTeam.totalPoints}
              </strong>
            </div>
          </div>
        </div>

        {/* Quick Medal Counts & Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-slate-200">
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
            <span className="text-[10px] text-slate-500 block mb-0.5 font-bold">Gold Trophies</span>
            <strong className="text-base font-bold text-amber-900">🥇 {currentTeam.goldCount}</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
            <span className="text-[10px] text-slate-500 block mb-0.5 font-bold">Silver Trophies</span>
            <strong className="text-base font-bold text-slate-800">🥈 {currentTeam.silverCount}</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
            <span className="text-[10px] text-slate-500 block mb-0.5 font-bold">Bronze Trophies</span>
            <strong className="text-base font-bold text-amber-800">🥉 {currentTeam.bronzeCount}</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center shadow-xs">
            <span className="text-[10px] text-slate-500 block mb-0.5 font-bold">Registrations</span>
            <strong className="text-base font-bold text-blue-900">📝 {teamParticipants.length} Entries</strong>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('roster')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 touch-target ${
            activeTab === 'roster'
              ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users size={14} />
          <span>Team Students ({teamStudents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('programmes')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 touch-target ${
            activeTab === 'programmes'
              ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calendar size={14} />
          <span>Events & Registration ({teamParticipants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('winners')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 touch-target ${
            activeTab === 'winners'
              ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Trophy size={14} />
          <span>Honours & Medals ({teamWinners.length})</span>
        </button>
      </div>

      {/* Tab 1: Student Roster */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900">
                {currentTeam.name} Registered Students
              </h3>
              <p className="text-xs text-slate-500">
                Shows all students in this team and their registered competitions.
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                placeholder="Search student or chest #..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredStudents.map(student => {
              const studentRegistrations = participants.filter(p => p.student_id === student.id);

              return (
                <div
                  key={student.id}
                  className="p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {student.photo_url ? (
                        <img src={student.photo_url} alt={student.student_name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={18} className="text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold text-amber-800">
                          #{student.chest_number}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold">
                          {student.class}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 truncate mt-0.5">{student.student_name}</h4>
                      <p className="text-[10px] text-slate-500">{student.division}</p>
                    </div>
                  </div>

                  {/* Registered events list */}
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Events Registered:</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {studentRegistrations.length} Events
                      </span>
                    </div>

                    {studentRegistrations.length > 0 && (
                      <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                        {studentRegistrations.map(part => {
                          const prg = programmes.find(p => p.id === part.programme_id);
                          return (
                            <span 
                              key={part.id}
                              className="px-2 py-0.5 rounded-lg text-[9px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              <span>{prg?.programme_name || 'Event'}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Programmes & Registration */}
      {activeTab === 'programmes' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar size={18} className="text-amber-600" />
                <span>{currentTeam.name} Programme Registrations</span>
              </h3>
              <p className="text-xs text-slate-500">
                Live synchronized with Admin Registration.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select 
                value={filterType} 
                onChange={e => setFilterType(e.target.value as any)} 
                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-800"
              >
                <option value="all">All Types</option>
                <option value="stage">Stage Events</option>
                <option value="non_stage">Non-Stage Events</option>
              </select>

              <select 
                value={filterCategory} 
                onChange={e => setFilterCategory(e.target.value)} 
                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-800"
              >
                <option value="all">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.code}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {filteredProgrammes.map(prg => {
              const registeredForThisPrg = participants.filter(p => p.programme_id === prg.id && p.team === selectedTeamId);
              const eligibleStudents = teamStudents.filter(s => isStudentEligibleForProgramme(s.class, prg.category));
              const limitPerTeam = normalizeCategory(prg.category) === 'sub_junior' ? 3 : 2;
              const isQuotaFull = registeredForThisPrg.length >= limitPerTeam;
              const isPublished = results.some(r => r.programme_id === prg.id && r.status === 'published');

              return (
                <div 
                  key={prg.id} 
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          {prg.programme_code}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {prg.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isPublished && (
                          <button
                            onClick={() => handleOpenPoster(prg.id)}
                            className="px-2 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Smartphone size={11} />
                            <span>Poster</span>
                          </button>
                        )}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isQuotaFull ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {registeredForThisPrg.length} / {limitPerTeam} Registered
                        </span>
                      </div>
                    </div>

                    <h4 className="font-bold text-sm sm:text-base text-slate-900">{prg.programme_name}</h4>

                    {/* Registered participants list */}
                    <div className="mt-3 space-y-1.5">
                      <span className="text-[11px] text-slate-500 font-semibold block">
                        Registered from {currentTeam.name}:
                      </span>

                      {registeredForThisPrg.length === 0 ? (
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-400 italic">
                          No student assigned yet from {currentTeam.name}.
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {registeredForThisPrg.map(part => {
                            const stu = students.find(s => s.id === part.student_id);
                            return (
                              <div 
                                key={part.id}
                                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-amber-800">#{part.chest_number}</span>
                                  <span className="font-semibold text-slate-800">{formatParticipantDisplayName(stu?.student_name, prg)}</span>
                                  <span className="text-[10px] text-slate-500">({stu?.class})</span>
                                </div>

                                <button
                                  onClick={() => handleRemove(part.id, stu?.student_name || 'Student', prg.programme_name)}
                                  className="p-1 text-rose-600 hover:text-rose-800 rounded transition cursor-pointer"
                                  title="Unregister Student"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Register eligible student action buttons */}
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1.5">
                      Assign {currentTeam.name} Student:
                    </span>

                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                      {eligibleStudents.length === 0 ? (
                        <span className="text-[10px] text-slate-400 italic">No eligible students for this category.</span>
                      ) : (
                        eligibleStudents.map(student => {
                          const isAlreadyReg = participants.some(p => p.programme_id === prg.id && p.student_id === student.id);

                          return (
                            <button
                              key={student.id}
                              disabled={isAlreadyReg || isQuotaFull}
                              onClick={() => handleRegister(prg.id, student.id)}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition flex items-center gap-1 cursor-pointer ${
                                isAlreadyReg
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-not-allowed'
                                  : isQuotaFull
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                                  : 'bg-white hover:bg-amber-100 text-slate-800 border border-slate-300'
                              }`}
                            >
                              <span className="font-mono font-bold">#{student.chest_number}</span>
                              <span>{student.student_name}</span>
                              {isAlreadyReg ? <CheckCircle2 size={10} /> : <Plus size={10} />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Winners & Medals */}
      {activeTab === 'winners' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Trophy size={18} className="text-amber-600" />
              <span>Honours, Medals & Result Posters</span>
            </h3>
          </div>

          {teamWinners.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-500 text-xs">
              No medals officially published yet for this team. Check back as results are published.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {teamWinners.map(winner => {
                const prg = programmes.find(p => p.id === winner.programme_id);
                const student = students.find(s => s.id === winner.student_id);
                const breakdown = calculateTotalResultPoints(prg, winner.position, winner.grade, festSettings.pointScheme);

                return (
                  <div
                    key={winner.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs font-bold text-amber-900">
                            {winner.position === 1 ? '🥇 1st Place (Gold)' : winner.position === 2 ? '🥈 2nd Place (Silver)' : '🥉 3rd Place (Bronze)'}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm sm:text-base text-slate-900">
                          {formatParticipantDisplayName(student?.student_name, prg) || `Chest #${winner.chest_number}`}
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5">{prg?.programme_name || 'Fest Event'}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-base font-bold text-emerald-700 font-mono">+{winner.points_awarded} PTS</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Pos: +{breakdown.positionPoints} | Gr: +{breakdown.gradePoints}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        Official Result
                      </span>

                      <button
                        onClick={() => handleOpenPoster(winner.programme_id)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer touch-target active:scale-95"
                      >
                        <Smartphone size={13} />
                        <span>WhatsApp Poster</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* WhatsApp Status Poster Generator Modal */}
      <ResultPosterModal
        isOpen={isPosterModalOpen}
        onClose={() => setIsPosterModalOpen(false)}
        initialProgrammeId={selectedPosterProgrammeId || undefined}
      />
    </div>
  );
};
