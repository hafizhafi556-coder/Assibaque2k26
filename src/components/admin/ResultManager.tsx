import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Lock, 
  Unlock, 
  Send, 
  Eye, 
  EyeOff, 
  Trash2, 
  Edit3, 
  Search, 
  Filter, 
  Award,
  AlertCircle,
  FileCheck,
  Smartphone,
  Sparkles,
  Layers,
  Check,
  X
} from 'lucide-react';
import { useFest, calculateTotalResultPoints, getProgrammeCriteriaType, formatParticipantDisplayName } from '../../context/FestContext';
import { Result, TeamId } from '../../types';
import { ResultPosterModal } from '../common/ResultPosterModal';

export const ResultManager: React.FC = () => {
  const { 
    results, 
    programmes, 
    students, 
    festSettings,
    verifyResult, 
    publishResult, 
    unpublishResult, 
    unlockResult, 
    deleteResult, 
    updateResultMarks 
  } = useFest();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterProgramme, setFilterProgramme] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterTeam, setFilterTeam] = useState('all');
  const [activeTabStatus, setActiveTabStatus] = useState<'all' | 'published' | 'verified' | 'pending'>('all');

  const [editingResult, setEditingResult] = useState<Result | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Result | null>(null);
  const [posterProgrammeId, setPosterProgrammeId] = useState<string | null>(null);
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const [newTotalMarks, setNewTotalMarks] = useState<number>(0);
  const [newGrade, setNewGrade] = useState<string>('A');
  const [newPosition, setNewPosition] = useState<number | null>(null);

  const rawCategories = Array.from(new Set(programmes.map(p => p.category))).filter(Boolean);

  const filteredResults = results.filter(r => {
    const student = students.find(s => s.id === r.student_id);
    const prg = programmes.find(p => p.id === r.programme_id);
    const matchesSearch = 
      r.chest_number.toLowerCase().includes(search.toLowerCase()) ||
      student?.student_name.toLowerCase().includes(search.toLowerCase()) ||
      prg?.programme_name.toLowerCase().includes(search.toLowerCase());
    
    // Category filter
    let matchesCat = true;
    if (filterCategory !== 'all' && prg) {
      const pCat = prg.category.toUpperCase().replace(/\s+/g, '_');
      const sCat = filterCategory.toUpperCase().replace(/\s+/g, '_');
      matchesCat = pCat === sCat || prg.category === filterCategory;
    }

    const matchesPrg = filterProgramme === 'all' || r.programme_id === filterProgramme;
    
    // Type filter
    let matchesType = true;
    if (filterType !== 'all') {
      const prgType = (prg?.type || '').toLowerCase();
      const venueStr = (prg?.venue || '').toLowerCase();
      const isStage = prgType === 'stage' || venueStr.includes('stage') || venueStr.includes('auditorium');
      if (filterType === 'stage') {
        matchesType = isStage;
      } else if (filterType === 'non_stage') {
        matchesType = !isStage;
      }
    }

    const matchesTeam = filterTeam === 'all' || r.team === filterTeam;

    let matchesStatus = true;
    if (activeTabStatus === 'published') {
      matchesStatus = r.status === 'published';
    } else if (activeTabStatus === 'verified') {
      matchesStatus = r.status === 'verified';
    } else if (activeTabStatus === 'pending') {
      matchesStatus = r.status === 'draft' || r.status === 'submitted';
    }

    return matchesSearch && matchesCat && matchesPrg && matchesTeam && matchesStatus && matchesType;
  });

  const handleOpenEditMarks = (res: Result) => {
    setEditingResult(res);
    setNewTotalMarks(res.total_marks);
    setNewGrade(res.grade || 'A');
    setNewPosition(res.position);
  };

  const handleSaveMarks = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResult) return;
    updateResultMarks(editingResult.id, newTotalMarks, newGrade, newPosition as 1 | 2 | 3 | null);
    setEditingResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <CheckCircle2 size={20} />
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-heading text-slate-900">
              Results Verification & Publishing
            </h2>
          </div>
          <p className="text-xs text-slate-600">
            Audit judge scores, verify positions and grades, and publish results to the live scoreboard.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setPosterProgrammeId(filterProgramme !== 'all' ? filterProgramme : null);
              setIsPosterModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black transition shadow-xs cursor-pointer touch-target active:scale-95"
          >
            <Smartphone size={15} />
            <span>Official Result Posters</span>
          </button>
        </div>
      </div>

      {/* Status Segmented Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <button
          onClick={() => setActiveTabStatus('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTabStatus === 'all'
              ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          All Results ({results.length})
        </button>
        <button
          onClick={() => setActiveTabStatus('published')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTabStatus === 'published'
              ? 'bg-emerald-600 text-white font-black shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Published Live ({results.filter(r => r.status === 'published').length})
        </button>
        <button
          onClick={() => setActiveTabStatus('verified')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTabStatus === 'verified'
              ? 'bg-sky-600 text-white font-black shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Verified ({results.filter(r => r.status === 'verified').length})
        </button>
        <button
          onClick={() => setActiveTabStatus('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTabStatus === 'pending'
              ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Pending Review ({results.filter(r => r.status === 'draft' || r.status === 'submitted').length})
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search student, chest #..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:border-amber-400"
          />
        </div>

        <div>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-semibold focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Categories</option>
            {rawCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filterProgramme}
            onChange={e => setFilterProgramme(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-semibold focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Programmes</option>
            {programmes
              .filter(p => {
                if (filterCategory === 'all') return true;
                const pCat = p.category.toUpperCase().replace(/\s+/g, '_');
                const sCat = filterCategory.toUpperCase().replace(/\s+/g, '_');
                return pCat === sCat || p.category === filterCategory;
              })
              .map(p => (
                <option key={p.id} value={p.id}>{p.programme_code}: {p.programme_name}</option>
              ))}
          </select>
        </div>

        <div>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-semibold focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Types</option>
            <option value="stage">Stage</option>
            <option value="non_stage">Non-Stage</option>
          </select>
        </div>

        <div>
          <select
            value={filterTeam}
            onChange={e => setFilterTeam(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-semibold focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Teams</option>
            <option value="nayro">NAYRO</option>
            <option value="zayro">ZAYRO</option>
            <option value="lucero">LUCERO</option>
          </select>
        </div>
      </div>

      {/* Results Table (SaaS Modern High Contrast) */}
      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs text-slate-800">
          <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] font-black border-b border-slate-200">
            <tr>
              <th className="px-4 py-3.5">Event & Participant</th>
              <th className="px-4 py-3.5">Team</th>
              <th className="px-4 py-3.5 text-center">Marks</th>
              <th className="px-4 py-3.5 text-center">Grade</th>
              <th className="px-4 py-3.5 text-center">Position</th>
              <th className="px-4 py-3.5 text-center">Team Pts</th>
              <th className="px-4 py-3.5">Status & Lock</th>
              <th className="px-4 py-3.5 text-right">Workflow Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredResults.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-10 text-center text-slate-500 font-medium">
                  No result records match your selected criteria.
                </td>
              </tr>
            ) : (
              filteredResults.map(res => {
                const prg = programmes.find(p => p.id === res.programme_id);
                const student = students.find(s => s.id === res.student_id);

                return (
                  <tr key={res.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-amber-800 font-black text-[11px]">
                          {prg?.programme_code} • {prg?.programme_name}
                        </span>
                        {(() => {
                          const cType = getProgrammeCriteriaType(prg);
                          return (
                            <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase font-mono ${
                              cType === 'general' ? 'bg-purple-100 text-purple-900 border border-purple-200' :
                              cType === 'group' ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' :
                              'bg-amber-100 text-amber-900 border border-amber-200'
                            }`}>
                              {cType}
                            </span>
                          );
                        })()}
                      </div>
                      <div className="font-bold text-slate-900 text-xs">
                        {formatParticipantDisplayName(student?.student_name, prg) || `Chest #${res.chest_number}`}
                        <span className="text-[10px] text-slate-500 font-mono font-medium ml-1.5">(Chest #{res.chest_number})</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${
                        res.team === 'nayro' ? 'bg-sky-50 text-sky-950 border-sky-300' :
                        res.team === 'zayro' ? 'bg-amber-50 text-amber-950 border-amber-300' :
                        'bg-purple-50 text-purple-950 border-purple-300'
                      }`}>
                        {res.team}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-center font-black text-slate-900 font-mono text-sm">
                      {res.total_marks}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 font-black text-slate-800 border border-slate-200">
                        {res.grade || '-'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      {res.position === 1 ? (
                        <span className="font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">🥇 1st Place</span>
                      ) : res.position === 2 ? (
                        <span className="font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">🥈 2nd Place</span>
                      ) : res.position === 3 ? (
                        <span className="font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300">🥉 3rd Place</span>
                      ) : (
                        <span className="text-slate-400 text-[10px] font-medium">Participant</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <div className="font-black text-amber-800 font-mono text-sm">
                        +{res.points_awarded || 0}
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono">
                        {(() => {
                          const breakdown = calculateTotalResultPoints(prg, res.position, res.grade, festSettings.pointScheme);
                          return `Pos: ${breakdown.positionPoints} + Gr: ${breakdown.gradePoints}`;
                        })()}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          res.status === 'published' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                          res.status === 'verified' ? 'bg-sky-50 text-sky-800 border-sky-300' :
                          'bg-amber-50 text-amber-800 border-amber-300'
                        }`}>
                          {res.status}
                        </span>
                        {res.is_locked ? (
                          <span title="Locked" className="text-rose-600"><Lock size={13} /></span>
                        ) : (
                          <span title="Unlocked" className="text-amber-600"><Unlock size={13} /></span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* WhatsApp Status Poster Button */}
                        <button
                          onClick={() => {
                            setPosterProgrammeId(res.programme_id);
                            setIsPosterModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                          title="View & Download Official Result Poster"
                        >
                          <Smartphone size={12} className="text-amber-700" />
                          <span>Poster</span>
                        </button>

                        {/* Publish / Unpublish */}
                        {res.status === 'published' ? (
                          <button
                            onClick={() => unpublishResult(res.id)}
                            className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
                            title="Unpublish result from live scoreboard"
                          >
                            <EyeOff size={12} />
                            <span>Unpublish</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => publishResult(res.id)}
                            className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer transition"
                            title="Publish result to live scoreboard"
                          >
                            <Eye size={12} />
                            <span>Publish</span>
                          </button>
                        )}

                        {/* Unlock / Lock Judge Result */}
                        {res.is_locked ? (
                          <button
                            onClick={() => unlockResult(res.id)}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-amber-700 border border-slate-200 cursor-pointer"
                            title="Unlock for Judge re-evaluation"
                          >
                            <Unlock size={13} />
                          </button>
                        ) : null}

                        {/* Edit Marks */}
                        <button
                          onClick={() => handleOpenEditMarks(res)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200 cursor-pointer transition"
                          title="Directly edit marks / position"
                        >
                          <Edit3 size={13} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteTarget(res)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 cursor-pointer transition"
                          title="Delete result"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Result Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white border border-rose-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-base font-black font-heading text-slate-900">Delete Result Record?</h3>
                <p className="text-xs text-rose-700 font-semibold">ഈ റിസൾട്ട് റെക്കോർഡ് ഡിലീറ്റ് ചെയ്യണോ?</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              Are you sure you want to permanently delete the result record for{' '}
              <span className="font-bold text-slate-900">Chest #{deleteTarget.chest_number}</span>?{' '}
              This will remove this score from the student and their team standings.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteResult(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs cursor-pointer shadow-xs transition flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                <span>Yes, Delete Result</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Marks Modal */}
      {editingResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white border border-slate-200 text-slate-900 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading text-lg font-black text-slate-900">
                Edit Marks & Position
              </h3>
              <button
                onClick={() => setEditingResult(null)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveMarks} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Total Marks</label>
                <input
                  type="number"
                  value={newTotalMarks}
                  onChange={e => setNewTotalMarks(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Grade (A / B / C)</label>
                  <input
                    type="text"
                    value={newGrade}
                    onChange={e => setNewGrade(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Position (1, 2, 3)</label>
                  <select
                    value={newPosition || ''}
                    onChange={e => setNewPosition(e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-400"
                  >
                    <option value="">None (Participant)</option>
                    <option value="1">1st Place (Gold)</option>
                    <option value="2">2nd Place (Silver)</option>
                    <option value="3">3rd Place (Bronze)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Point Preview */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-1.5">
                {(() => {
                  const prg = programmes.find(p => p.id === editingResult.programme_id);
                  const breakdown = calculateTotalResultPoints(prg, newPosition as 1 | 2 | 3 | null, newGrade, festSettings.pointScheme);
                  return (
                    <>
                      <div className="flex justify-between items-center text-slate-700">
                        <span>Event Scheme:</span>
                        <span className="uppercase font-black font-mono text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                          {breakdown.criteriaType} ({breakdown.criteriaType === 'general' ? '15, 8, 5' : breakdown.criteriaType === 'group' ? '10, 5, 3' : '5, 3, 1'})
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Position Award:</span>
                        <strong className="text-amber-800 font-mono">+{breakdown.positionPoints} pts</strong>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Grade Award ({newGrade || '-'}):</span>
                        <strong className="text-emerald-700 font-mono">+{breakdown.gradePoints} pts</strong>
                      </div>
                      <div className="flex justify-between items-center font-black border-t border-amber-200 pt-2 text-slate-900">
                        <span className="text-xs">Total Awarded Team Pts:</span>
                        <span className="text-amber-800 font-mono text-base">+{breakdown.totalPoints} pts</span>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingResult(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black shadow-xs cursor-pointer"
                >
                  Save & Update Points
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Result Poster Modal */}
      <ResultPosterModal
        isOpen={isPosterModalOpen}
        onClose={() => {
          setIsPosterModalOpen(false);
          setPosterProgrammeId(null);
        }}
        programmeId={posterProgrammeId || undefined}
      />
    </div>
  );
};
