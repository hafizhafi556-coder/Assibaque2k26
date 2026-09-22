import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  UserCheck, 
  Calendar, 
  Plus, 
  Trash2, 
  Users, 
  CheckCircle2, 
  Sparkles,
  Layers,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useFest, formatParticipantDisplayName, isStudentEligibleForProgramme, normalizeCategory } from '../../context/FestContext';
import { TeamId } from '../../types';

export const RegistrationAdminView: React.FC = () => {
  const { students, programmes, participants, assignParticipant, removeParticipant, teams, categories } = useFest();
  const [selectedTeamId, setSelectedTeamId] = useState<TeamId>(teams[0]?.id || 'nayro');
  const [studentSearch, setStudentSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'stage' | 'non_stage'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const selectedTeam = teams.find(t => t.id === selectedTeamId) || teams[0];

  const filteredStudents = students.filter(s => 
    s.team === selectedTeamId &&
    (s.student_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.chest_number.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.class.toLowerCase().includes(studentSearch.toLowerCase()))
  );

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
    // Check if already registered
    const isAlreadyRegistered = participants.some(p => p.programme_id === programmeId && p.student_id === studentId);
    if (isAlreadyRegistered) {
      showFeedback("Student is already registered for this event.", 'error');
      return;
    }

    const teamParticipants = participants.filter(p => p.programme_id === programmeId && p.team === selectedTeamId);
    const student = students.find(s => s.id === studentId);
    const programme = programmes.find(p => p.id === programmeId);
    
    if (!student || !programme) return;

    // Quota limits
    const sCat = normalizeCategory(student.class);
    const limitPerTeam = sCat === 'sub_junior' ? 3 : 2;

    if (teamParticipants.length >= limitPerTeam) {
      showFeedback(`Registration limit reached for this event (${limitPerTeam} allowed per team).`, 'error');
      return;
    }

    // Check individual participation limits
    if (programme.type === 'individual') {
      const studentRegistrations = participants.filter(p => p.student_id === studentId);
      let count = 0;
      studentRegistrations.forEach(p => {
        const prog = programmes.find(prg => prg.id === p.programme_id);
        if (prog && prog.type === 'individual') {
          count++;
        }
      });

      const limits: Record<string, number> = {
        'sub_junior': 6,
        'junior': 8,
        'senior': 10,
        'hifz': 6,
      };
      
      const limit = limits[sCat] || 10;

      if (count >= limit) {
        showFeedback(`Registration limit reached for this student (${limit} allowed for ${student.class} category).`, 'error');
        return;
      }
    }

    const result = assignParticipant({
      programme_id: programmeId,
      student_id: studentId,
      team: selectedTeamId,
      status: 'registered',
      participant_id: 'part-adm-' + Date.now(),
      chest_number: student.chest_number
    });
    
    if (!result.success) {
      showFeedback(result.error || 'Registration failed', 'error');
    } else {
      showFeedback(`✅ Registered ${student.student_name} (#${student.chest_number}) for ${programme.programme_name}! Immediately synced with Team Dashboard.`, 'success');
    }
  };

  const handleRemove = (participantId: string, studentName: string, programmeName: string) => {
    removeParticipant(participantId);
    showFeedback(`🗑️ Removed ${studentName} from ${programmeName}. Synced live.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header & Live Sync Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-white flex items-center gap-2">
            <UserCheck size={24} className="text-amber-400" />
            <span>Programme Registration Central Portal</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Assign students to competitions. Changes made here immediately synchronize and update the Team Dashboard in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Live Synced with Team Dashboard</span>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs sm:text-sm font-semibold transition-all ${
          notification.type === 'success' 
            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200' 
            : 'bg-rose-950/80 border-rose-500 text-rose-200'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-400 shrink-0" /> : <AlertCircle size={18} className="text-rose-400 shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Team Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {teams.map(team => {
          const isSelected = selectedTeamId === team.id;
          const teamParts = participants.filter(p => p.team === team.id);
          const teamStus = students.filter(s => s.team === team.id);

          return (
            <button
              key={team.id}
              onClick={() => setSelectedTeamId(team.id)}
              className={`p-4 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                isSelected
                  ? 'bg-slate-900 border-amber-400 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{team.logo}</span>
                <div>
                  <h4 className="font-heading font-bold text-sm text-white">{team.name}</h4>
                  <p className="text-[11px] text-slate-400">{teamStus.length} Students</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-amber-300 block">
                  {teamParts.length}
                </span>
                <span className="text-[10px] text-slate-500 uppercase">Registrations</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={studentSearch}
            onChange={e => setStudentSearch(e.target.value)}
            placeholder={`Search ${selectedTeam.name} students by name, chest #...`}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
          />
        </div>

        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.code}>{c.name}</option>
          ))}
        </select>

        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value as any)}
          className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
        >
          <option value="all">All Event Types</option>
          <option value="stage">Stage Events</option>
          <option value="non_stage">Non-Stage Events</option>
        </select>
      </div>

      {/* Programmes and Registration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProgrammes.map(prg => {
          const registeredForThisPrg = participants.filter(p => p.programme_id === prg.id && p.team === selectedTeamId);
          
          // Filter students eligible for this programme
          const eligibleStudents = filteredStudents.filter(s => isStudentEligibleForProgramme(s.class, prg.category));
          const limitPerTeam = normalizeCategory(prg.category) === 'sub_junior' ? 3 : 2;
          const isQuotaFull = registeredForThisPrg.length >= limitPerTeam;

          return (
            <div 
              key={prg.id} 
              className="p-5 rounded-3xl glass-panel border border-slate-800/90 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                      {prg.programme_code}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                      {prg.category}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isQuotaFull 
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30' 
                      : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {registeredForThisPrg.length} / {limitPerTeam} {selectedTeam.name} Slots
                  </span>
                </div>

                <h3 className="font-bold text-base text-white">{prg.programme_name}</h3>
                {prg.programme_name_ml && (
                  <p className="text-xs text-slate-400 mt-0.5">{prg.programme_name_ml}</p>
                )}

                {/* Currently Registered Students from this Team */}
                <div className="mt-3 space-y-1.5">
                  <span className="text-[11px] text-slate-400 font-semibold block">
                    Registered from {selectedTeam.name}:
                  </span>
                  
                  {registeredForThisPrg.length === 0 ? (
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-500 italic">
                      No student registered yet from {selectedTeam.name}. Select from below to register.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {registeredForThisPrg.map(part => {
                        const stu = students.find(s => s.id === part.student_id);
                        return (
                          <div 
                            key={part.id}
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-amber-300">#{part.chest_number}</span>
                              <span className="font-semibold text-slate-200">{formatParticipantDisplayName(stu?.student_name, prg)}</span>
                              <span className="text-[10px] text-slate-400">({stu?.class})</span>
                            </div>
                            
                            <button
                              onClick={() => handleRemove(part.id, stu?.student_name || 'Student', prg.programme_name)}
                              className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded-lg transition cursor-pointer"
                              title="Remove Registration"
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

              {/* Quick Assign Eligible Students */}
              <div className="mt-4 pt-3 border-t border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-2">
                  Eligible {selectedTeam.name} Students ({eligibleStudents.length}):
                </span>

                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                  {eligibleStudents.length === 0 ? (
                    <span className="text-[10px] text-slate-500 italic">No eligible students match filter.</span>
                  ) : (
                    eligibleStudents.map(student => {
                      const isAlreadyReg = participants.some(p => p.programme_id === prg.id && p.student_id === student.id);

                      return (
                        <button
                          key={student.id}
                          disabled={isAlreadyReg || isQuotaFull}
                          onClick={() => handleRegister(prg.id, student.id)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition flex items-center gap-1 cursor-pointer ${
                            isAlreadyReg
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 cursor-not-allowed'
                              : isQuotaFull
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                              : 'bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 border border-slate-700'
                          }`}
                        >
                          <span className="font-mono font-bold">#{student.chest_number}</span>
                          <span>{student.student_name}</span>
                          {isAlreadyReg ? <CheckCircle2 size={11} /> : <Plus size={11} />}
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
  );
};
