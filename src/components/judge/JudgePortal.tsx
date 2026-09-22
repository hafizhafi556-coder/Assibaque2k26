import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle, 
  Lock, 
  Unlock, 
  Save, 
  Send, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  User, 
  Info,
  Filter,
  Trash2,
  Sparkles,
  Sliders,
  Check,
  X
} from 'lucide-react';
import { useFest } from '../../context/FestContext';
import { Programme, Participant, JudgingCriterion, Result, TeamId } from '../../types';
import { getTranslation } from '../../i18n/translations';

export const JudgePortal: React.FC<{ onOpenLogin: () => void }> = ({ onOpenLogin }) => {
  const { 
    currentUser, 
    judges, 
    programmes, 
    participants, 
    students, 
    results, 
    saveResultDraft, 
    submitJudgeResult, 
    deleteResult,
    language,
    calculateAutoGradeAndPositions
  } = useFest();

  // If user is not logged in as judge or admin, prompt login
  const isAuthorized = currentUser?.role === 'judge' || currentUser?.role === 'admin';
  const currentJudgeId = currentUser?.judgeId || judges[0]?.id;
  const currentJudge = judges.find(j => j.id === currentJudgeId) || judges[0];

  // Assigned programmes for this judge
  const assignedProgrammes = programmes.filter(p => 
    p.judge_id === currentJudge?.id || currentJudge?.assignedProgrammes?.includes(p.id) || currentUser?.role === 'admin'
  );

  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string>(
    assignedProgrammes[0]?.id || programmes[0]?.id || ''
  );

  const activeProgramme = programmes.find(p => p.id === selectedProgrammeId);
  const programmeParticipants = participants.filter(p => p.programme_id === selectedProgrammeId);

  // Local state for editing marks for the active programme
  // Key: participantId -> { scores: Record<criterionId, number>, remarks: string }
  const [localScores, setLocalScores] = useState<Record<string, { scores: Record<string, number>; remarks: string }>>({});
  const [confirmModalParticipant, setConfirmModalParticipant] = useState<Participant | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="p-8 rounded-3xl bg-white border border-slate-200 text-slate-900 shadow-sm">
          <Award size={48} className="mx-auto text-amber-600 mb-4" />
          <h2 className="text-xl font-black font-heading mb-2">Adjudicator Access Required</h2>
          <p className="text-xs text-slate-600 mb-6 leading-relaxed">
            Please log in with your official Adjudicator credentials to evaluate assigned festival events.
          </p>
          <button
            onClick={onOpenLogin}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm shadow-xs transition cursor-pointer touch-target active:scale-95"
          >
            Adjudicator Login
          </button>
        </div>
      </div>
    );
  }

  const getExistingResult = (participantId: string): Result | undefined => {
    return results.find(r => r.programme_id === selectedProgrammeId && r.participant_id === participantId);
  };

  const getScoreValue = (participantId: string, criterionId: string, maxMarks: number): number => {
    if (localScores[participantId]?.scores?.[criterionId] !== undefined) {
      return localScores[participantId].scores[criterionId];
    }
    const existing = getExistingResult(participantId);
    if (existing?.scores?.[criterionId] !== undefined) {
      return existing.scores[criterionId];
    }
    return 0;
  };

  const handleScoreChange = (participantId: string, criterionId: string, value: number, maxMarks: number) => {
    const validVal = Math.min(Math.max(0, value), maxMarks);
    setLocalScores(prev => {
      const currentParticipantData = prev[participantId] || { scores: {}, remarks: '' };
      return {
        ...prev,
        [participantId]: {
          ...currentParticipantData,
          scores: {
            ...currentParticipantData.scores,
            [criterionId]: validVal,
          },
        },
      };
    });
  };

  const handleRemarksChange = (participantId: string, remarks: string) => {
    setLocalScores(prev => {
      const currentParticipantData = prev[participantId] || { scores: {}, remarks: '' };
      return {
        ...prev,
        [participantId]: {
          ...currentParticipantData,
          remarks,
        },
      };
    });
  };

  const calculateParticipantTotal = (participant: Participant, criteria: JudgingCriterion[]): number => {
    return criteria.reduce((sum, crit) => sum + getScoreValue(participant.id, crit.id, crit.maxMarks), 0);
  };

  const handleSaveDraft = (participant: Participant) => {
    const criteria = activeProgramme?.criteria || [];
    const scores: Record<string, number> = {};
    criteria.forEach(c => {
      scores[c.id] = getScoreValue(participant.id, c.id, c.maxMarks);
    });
    const remarks = localScores[participant.id]?.remarks || getExistingResult(participant.id)?.remarks || '';

    saveResultDraft({
      programme_id: selectedProgrammeId,
      participant_id: participant.id,
      student_id: participant.student_id,
      chest_number: participant.chest_number,
      team: participant.team,
      judge_id: currentJudge.id,
      scores,
      remarks,
    });

    setSuccessToast(`Draft saved for Chest #${participant.chest_number}`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleConfirmSubmit = () => {
    if (!confirmModalParticipant) return;
    const participant = confirmModalParticipant;
    const criteria = activeProgramme?.criteria || [];
    const scores: Record<string, number> = {};
    criteria.forEach(c => {
      scores[c.id] = getScoreValue(participant.id, c.id, c.maxMarks);
    });
    const remarks = localScores[participant.id]?.remarks || getExistingResult(participant.id)?.remarks || '';

    submitJudgeResult({
      programme_id: selectedProgrammeId,
      participant_id: participant.id,
      student_id: participant.student_id,
      chest_number: participant.chest_number,
      team: participant.team,
      judge_id: currentJudge.id,
      scores,
      remarks,
    });

    calculateAutoGradeAndPositions(selectedProgrammeId);

    setConfirmModalParticipant(null);
    setSuccessToast(`Final result submitted and locked for Chest #${participant.chest_number}`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-900 text-emerald-100 text-xs sm:text-sm font-bold shadow-2xl flex items-center gap-2 border border-emerald-700 animate-in fade-in">
          <CheckCircle size={18} className="text-emerald-300" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModalParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white border border-slate-200 text-slate-900 shadow-2xl space-y-4">
            <h3 className="text-lg font-black font-heading text-slate-900">
              {getTranslation(language, 'submitFinalResult')}?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {getTranslation(language, 'confirmSubmission')}
            </p>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div>Participant: <strong>Chest #{confirmModalParticipant.chest_number}</strong></div>
              <div>Team: <strong className="uppercase">{confirmModalParticipant.team}</strong></div>
              <div>Total Marks: <strong className="text-amber-800 font-mono text-sm">{calculateParticipantTotal(confirmModalParticipant, activeProgramme?.criteria || [])}</strong></div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmModalParticipant(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
              >
                {getTranslation(language, 'cancel')}
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition shadow-xs cursor-pointer"
              >
                Confirm & Lock Score
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-2">
            <Award size={14} className="text-amber-600" />
            <span>Adjudicator Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900">
            {getTranslation(language, 'judgeDashboard')}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Adjudicator: <strong className="text-slate-900">{currentJudge.name}</strong> • Specialization: {currentJudge.specialization}
          </p>
        </div>

        {/* Programme selector */}
        <div className="w-full sm:w-80">
          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
            {getTranslation(language, 'assignedEvents')}:
          </label>
          <select
            value={selectedProgrammeId}
            onChange={e => setSelectedProgrammeId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-400"
          >
            {assignedProgrammes.map(p => (
              <option key={p.id} value={p.id}>
                {p.programme_code}: {p.programme_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Programme Meta Banner */}
      {activeProgramme && (
        <div className="p-6 rounded-3xl bg-amber-50/40 border border-amber-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-white text-amber-900 border border-amber-200 shadow-2xs">
                {activeProgramme.category}
              </span>
              <span className="text-xs text-slate-500 font-mono font-bold">{activeProgramme.programme_code}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-heading text-slate-900">
              {activeProgramme.programme_name}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-2 font-medium">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-amber-600" />
                <span>{activeProgramme.venue}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-amber-600" />
                <span>{activeProgramme.scheduled_time}</span>
              </span>
              <span>Max Marks: <strong className="text-slate-900">{activeProgramme.maximum_marks}</strong></span>
            </div>
          </div>

          <div className="text-right text-xs text-slate-600">
            <div>Registered Participants: <strong className="text-slate-900 font-black">{programmeParticipants.length}</strong></div>
            <div className="text-[11px] text-slate-500 mt-0.5">Submitted marks lock automatically</div>
          </div>
        </div>
      )}

      {/* Participant Scoring Cards */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg font-black text-slate-900 flex items-center gap-2">
            <span>{getTranslation(language, 'evaluationSheet')}</span>
            <span className="text-xs font-semibold text-slate-500">({programmeParticipants.length} contestants)</span>
          </h3>
        </div>

        {programmeParticipants.length === 0 ? (
          <div className="p-10 rounded-3xl bg-white border border-slate-200 text-center text-slate-500 text-xs shadow-xs">
            No participants registered for this event yet.
          </div>
        ) : (
          <div className="space-y-4">
            {programmeParticipants.map(participant => {
              const student = students.find(s => s.id === participant.student_id);
              const existingResult = getExistingResult(participant.id);
              const isLocked = existingResult?.is_locked || false;
              const criteria = activeProgramme?.criteria || [];
              const totalMarks = calculateParticipantTotal(participant, criteria);

              return (
                <div
                  key={participant.id}
                  className={`p-6 rounded-3xl border transition-all duration-200 ${
                    isLocked 
                      ? 'bg-slate-50 border-slate-200 opacity-90' 
                      : 'bg-white border-slate-200 hover:border-amber-300 shadow-xs'
                  }`}
                >
                  {/* Participant Card Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center font-mono font-black text-amber-900 text-sm shadow-2xs overflow-hidden">
                        {student?.photo_url ? (
                          <img src={student.photo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          `#${participant.chest_number}`
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                            participant.team === 'nayro' ? 'bg-sky-50 text-sky-950 border-sky-300' :
                            participant.team === 'zayro' ? 'bg-amber-50 text-amber-950 border-amber-300' :
                            'bg-purple-50 text-purple-950 border-purple-300'
                          }`}>
                            {participant.team}
                          </span>
                          <span className="text-xs text-slate-500 font-semibold">{student?.class}</span>
                        </div>
                        <h4 className="font-bold text-base text-slate-900">{student?.student_name || `Participant ${participant.chest_number}`}</h4>
                      </div>
                    </div>

                    {/* Status & Total Marks Badge */}
                    <div className="flex items-center gap-4">
                      {isLocked ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
                          <Lock size={13} className="text-slate-500" />
                          <span>Submitted & Locked</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
                          <Unlock size={13} className="text-amber-600" />
                          <span>Open for Scoring</span>
                        </div>
                      )}

                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Total Score</div>
                        <div className="text-2xl font-black font-heading text-slate-900 font-mono">
                          {totalMarks} <span className="text-xs text-slate-400 font-normal">/ {activeProgramme?.maximum_marks}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Criteria Sliders / Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
                    {criteria.map(crit => {
                      const val = getScoreValue(participant.id, crit.id, crit.maxMarks);
                      return (
                        <div key={crit.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                          <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                            <span className="truncate pr-1">{crit.name}</span>
                            <span className="text-amber-800 font-mono text-[11px] shrink-0">Max: {crit.maxMarks}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max={crit.maxMarks}
                              value={val}
                              disabled={isLocked}
                              onChange={e => handleScoreChange(participant.id, crit.id, Number(e.target.value), crit.maxMarks)}
                              className="w-14 px-2 py-1.5 rounded-xl bg-white border border-slate-300 text-center font-black text-slate-900 text-sm focus:outline-none focus:border-amber-400 disabled:opacity-50"
                            />
                            <input
                              type="range"
                              min="0"
                              max={crit.maxMarks}
                              value={val}
                              disabled={isLocked}
                              onChange={e => handleScoreChange(participant.id, crit.id, Number(e.target.value), crit.maxMarks)}
                              className="w-full accent-amber-500 cursor-pointer disabled:opacity-50"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Remarks input */}
                  <div className="mb-5">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {getTranslation(language, 'remarks')}:
                    </label>
                    <input
                      type="text"
                      disabled={isLocked}
                      placeholder="e.g. Excellent voice cadence, pronunciation and command..."
                      value={localScores[participant.id]?.remarks ?? existingResult?.remarks ?? ''}
                      onChange={e => handleRemarksChange(participant.id, e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 disabled:opacity-50 font-medium"
                    />
                  </div>

                  {/* Action buttons (Save Draft vs Final Submit) */}
                  <div className="flex items-center justify-end gap-3 pt-1">
                    {!isLocked ? (
                      <>
                        <button
                          onClick={() => handleSaveDraft(participant)}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer touch-target"
                        >
                          <Save size={14} className="text-amber-600" />
                          <span>{getTranslation(language, 'saveDraft')}</span>
                        </button>
                        <button
                          onClick={() => setConfirmModalParticipant(participant)}
                          className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black transition shadow-xs flex items-center gap-1.5 cursor-pointer touch-target active:scale-95"
                        >
                          <Send size={14} />
                          <span>{getTranslation(language, 'submitFinalResult')}</span>
                        </button>
                        {currentUser?.role === 'admin' && existingResult && (
                          <button
                            onClick={() => {
                              if (window.confirm('Delete this result?')) {
                                deleteResult(existingResult.id);
                              }
                            }}
                            className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-rose-200"
                          >
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="text-xs text-slate-500 italic flex items-center gap-1.5 font-medium">
                        <Lock size={13} className="text-slate-400" />
                        <span>{getTranslation(language, 'lockedMessage')}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
