import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Filter, 
  Download, 
  Share2, 
  Eye, 
  RefreshCw, 
  Layers, 
  Smartphone, 
  CheckCircle2, 
  Calendar,
  Trophy,
  ExternalLink,
  Archive,
  Image as ImageIcon
} from 'lucide-react';
import { useFest } from '../../context/FestContext';
import { ResultPosterModal } from '../common/ResultPosterModal';
import { TeamId } from '../../types';

export const ResultPostersGalleryView: React.FC = () => {
  const { 
    programmes, 
    results, 
    students, 
    teams, 
    festSettings, 
    posters, 
    regenerateResultPoster 
  } = useFest();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [activeProgrammeId, setActiveProgrammeId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'4:5' | '9:16' | '1:1'>('4:5');

  const categories = Array.from(new Set(programmes.map(p => p.category))).filter(Boolean);

  // Programmes with results or published
  const programmesWithResults = programmes.filter(prg => {
    const prgResults = results.filter(r => r.programme_id === prg.id);
    const hasResults = prgResults.length > 0;
    const isPublished = prgResults.some(r => r.status === 'published');

    const matchesSearch = 
      prg.programme_name.toLowerCase().includes(search.toLowerCase()) ||
      prg.programme_code.toLowerCase().includes(search.toLowerCase());

    const matchesCat = filterCategory === 'all' || prg.category === filterCategory;
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'published' && isPublished) || 
      (filterStatus === 'draft' && !isPublished && hasResults);

    return matchesSearch && matchesCat && matchesStatus && hasResults;
  });

  const handleOpenPoster = (pId: string) => {
    setActiveProgrammeId(pId);
    setIsModalOpen(true);
  };

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
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <Sparkles size={20} />
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-heading text-slate-900">
              Result Posters Management
            </h2>
          </div>
          <p className="text-xs text-slate-600">
            Generate, preview, and download high-definition official result posters (1080×1350 4:5, 9:16 WhatsApp Status, 1:1 Square) for published festival events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setAspectRatio('4:5')}
              className={`px-3 py-1.5 rounded-xl transition ${
                aspectRatio === '4:5' ? 'bg-amber-400 text-slate-950 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              4:5 Post
            </button>
            <button
              onClick={() => setAspectRatio('9:16')}
              className={`px-3 py-1.5 rounded-xl transition ${
                aspectRatio === '9:16' ? 'bg-amber-400 text-slate-950 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              9:16 Story
            </button>
            <button
              onClick={() => setAspectRatio('1:1')}
              className={`px-3 py-1.5 rounded-xl transition ${
                aspectRatio === '1:1' ? 'bg-amber-400 text-slate-950 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1:1 Square
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search event code or title..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 font-medium"
          />
        </div>

        <div>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-semibold focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-semibold focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Statuses ({programmesWithResults.length})</option>
            <option value="published">Published Only</option>
            <option value="draft">Pending Verification Only</option>
          </select>
        </div>
      </div>

      {/* Posters Gallery Grid */}
      {programmesWithResults.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-xs">
          <ImageIcon size={44} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800 font-heading">No Event Results Ready for Poster Generation</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Posters are generated automatically when judges evaluate participants or results are published in the Results section.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {programmesWithResults.map(prg => {
            const prgResults = results
              .filter(r => r.programme_id === prg.id)
              .sort((a, b) => (a.position || 99) - (b.position || 99));
            const isPublished = prgResults.some(r => r.status === 'published');
            const winner1 = prgResults.find(r => r.position === 1);
            const winner2 = prgResults.find(r => r.position === 2);
            const winner3 = prgResults.find(r => r.position === 3);
            const student1 = winner1 ? students.find(s => s.id === winner1.student_id) : null;

            return (
              <div 
                key={prg.id}
                className="rounded-3xl bg-white border border-slate-200 hover:border-amber-300 shadow-xs hover:shadow-md transition duration-200 overflow-hidden flex flex-col justify-between group"
              >
                {/* Poster Card Top Mockup Frame */}
                <div className="p-5 bg-gradient-to-b from-amber-50/50 to-white border-b border-slate-100 relative">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-amber-900 font-mono text-[10px] font-black shadow-xs">
                      {prg.programme_code}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isPublished ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}>
                      {isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <h3 className="font-heading font-black text-base text-slate-900 group-hover:text-amber-700 transition line-clamp-1">
                    {prg.programme_name}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-semibold mb-3">
                    {prg.category} • {prg.venue}
                  </p>

                  {/* 1st Place Highlight Preview Box */}
                  {winner1 && (
                    <div className="p-3 rounded-2xl bg-white border border-amber-200 flex items-center gap-3 shadow-xs">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-amber-100 border border-amber-300 shrink-0 flex items-center justify-center font-black text-amber-900 text-xs">
                        {student1?.photo_url ? (
                          <img src={student1.photo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          '🥇 1st'
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest block">
                          First Prize Winner
                        </span>
                        <h4 className="font-bold text-xs text-slate-900 truncate">
                          {student1?.student_name || `Chest #${winner1.chest_number}`}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-500 font-bold">
                          {winner1.team.toUpperCase()} • Grade {winner1.grade || 'A'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-500 font-semibold">
                    {prgResults.length} Evaluated
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenPoster(prg.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs transition shadow-xs cursor-pointer touch-target active:scale-95"
                    >
                      <Eye size={13} />
                      <span>Preview & Export</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Open Poster Modal */}
      {isModalOpen && activeProgrammeId && (
        <ResultPosterModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialProgrammeId={activeProgrammeId}
        />
      )}
    </div>
  );
};
