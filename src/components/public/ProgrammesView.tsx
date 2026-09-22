import React, { useState } from 'react';
import { Search, MapPin, Clock, Smartphone, Sparkles } from 'lucide-react';
import { useFest, normalizeCategory } from '../../context/FestContext';
import { getTranslation } from '../../i18n/translations';
import { ResultPosterModal } from '../common/ResultPosterModal';

export const ProgrammesView: React.FC = () => {
  const { programmes, categories, language, participants, results } = useFest();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');

  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const [posterProgrammeId, setPosterProgrammeId] = useState<string | null>(null);

  const filtered = programmes.filter(p => {
    const matchesSearch = 
      p.programme_name.toLowerCase().includes(search.toLowerCase()) ||
      p.programme_code.toLowerCase().includes(search.toLowerCase()) ||
      p.venue.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === 'ALL' || normalizeCategory(p.category) === normalizeCategory(selectedCat);
    let matchesType = true;
    if (selectedType !== 'ALL') {
      const isStage = p.type === 'stage' || (p.venue || '').toLowerCase().includes('stage');
      matchesType = selectedType === 'stage' ? isStage : !isStage;
    }
    return matchesSearch && matchesCat && matchesType;
  });

  const handleOpenPoster = (programmeId: string) => {
    setPosterProgrammeId(programmeId);
    setIsPosterModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold mb-2.5">
          <Sparkles size={14} className="text-amber-600" />
          <span>{language === 'ml' ? 'മത്സര ക്രമവിവരങ്ങൾ' : 'Official Event Fixtures & Schedule'}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-wide mb-1.5">
          {getTranslation(language, 'programmeSchedule')}
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm">
          Browse all stage and non-stage competitions, categories, venues, and timings. Posters available for all completed events.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search event name, code, or venue..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCat}
            onChange={e => setSelectedCat(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800"
          >
            <option value="ALL">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.code}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800"
          >
            <option value="ALL">All Types</option>
            <option value="stage">Stage Events</option>
            <option value="non_stage">Non-Stage Events</option>
          </select>
        </div>
      </div>

      {/* Grid of Programmes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filtered.map(p => {
          const participantCount = participants.filter(part => part.programme_id === p.id).length;
          const hasPublishedResult = results.some(r => r.programme_id === p.id && r.status === 'published');

          return (
            <div
              key={p.id}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-amber-400 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    {p.programme_code}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    p.status === 'published' || hasPublishedResult ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                    p.status === 'ongoing' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {hasPublishedResult ? 'Result Published' : p.status}
                  </span>
                </div>

                <h3 className="font-bold text-sm sm:text-base text-slate-900">{p.programme_name}</h3>
                {p.programme_name_ml && (
                  <p className="text-xs text-slate-500 mt-0.5">{p.programme_name_ml}</p>
                )}

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-amber-600 shrink-0" />
                    <span>{p.venue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={13} className="text-amber-600 shrink-0" />
                    <span>{p.scheduled_date} • {p.scheduled_time}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="capitalize">{p.type} • {p.section}</span>
                
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{participantCount} Participants</span>
                  {hasPublishedResult && (
                    <button
                      onClick={() => handleOpenPoster(p.id)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-[11px] font-bold transition flex items-center gap-1 shadow-xs cursor-pointer touch-target active:scale-95"
                      title="View & Download WhatsApp Status Poster"
                    >
                      <Smartphone size={12} />
                      <span>Poster</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* WhatsApp Status Poster Generator Modal */}
      <ResultPosterModal
        isOpen={isPosterModalOpen}
        onClose={() => setIsPosterModalOpen(false)}
        initialProgrammeId={posterProgrammeId || undefined}
      />
    </div>
  );
};
