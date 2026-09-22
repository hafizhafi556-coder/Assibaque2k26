import React from 'react';
import { Bell, Pin, Calendar } from 'lucide-react';
import { useFest } from '../../context/FestContext';
import { getTranslation } from '../../i18n/translations';

export const AnnouncementsPublicView: React.FC = () => {
  const { announcements, language } = useFest();

  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return 0;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white tracking-wide mb-2">
          {getTranslation(language, 'navAnnouncements')}
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Official notifications, schedule changes, and notices from the Festival Committee.
        </p>
      </div>

      <div className="space-y-4">
        {sortedAnnouncements.map(a => (
          <div
            key={a.id}
            className={`p-5 rounded-3xl border transition ${
              a.is_pinned 
                ? 'bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border-amber-500/40 shadow-lg' 
                : 'glass-panel border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                {a.is_pinned && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                    <Pin size={11} /> PINNED BULLETIN
                  </span>
                )}
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-semibold">
                  {a.priority} Priority
                </span>
              </div>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar size={12} />
                <span>{a.created_at}</span>
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white mb-2">
              {language === 'ml' && a.title_ml ? a.title_ml : a.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {language === 'ml' && a.content_ml ? a.content_ml : a.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
