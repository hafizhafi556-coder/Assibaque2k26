import React from 'react';
import { RotateCcw, Shield, MapPin } from 'lucide-react';
import { useFest } from '../../context/FestContext';
import { getTranslation } from '../../i18n/translations';
import { FestLogoBadge, GoldDivider, IslamicStar } from './IslamicPattern';

export const Footer: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { language, festSettings, resetToDemoData } = useFest();

  const handleReset = () => {
    if (window.confirm(language === 'ml' 
      ? 'എല്ലാ ഡാറ്റയും ഡെമോ ക്രമീകരണങ്ങളിലേക്ക് പുനഃസ്ഥാപിക്കാൻ ഉറപ്പാണോ?' 
      : 'Are you sure you want to reset all data back to original demo state?')) {
      resetToDemoData();
    }
  };

  return (
    <footer className="no-print mt-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Identity */}
          <div className="md:col-span-2 space-y-3.5">
            <div className="flex items-center gap-3">
              <FestLogoBadge size="sm" customLogo={festSettings.festLogo} />
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                  {language === 'ml' ? festSettings.festNameMl : festSettings.festName}
                </h3>
                <p className="text-xs text-amber-800 dark:text-amber-400 font-semibold">
                  {language === 'ml' ? festSettings.institutionNameMl : festSettings.institutionName}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
              {language === 'ml'
                ? 'വിദ്യാർത്ഥികളുടെ സർഗ്ഗാത്മക പ്രതിഭകളെ പ്രോത്സാഹിപ്പിക്കുന്ന ഇന്റർ-ടീം കലാ-സാഹിത്യോത്സവം. നൈറോ, സൈറോ, ലൂസെറോ ടീമുകൾ മാറ്റുരയ്ക്കുന്നു.'
                : festSettings.festDescription}
            </p>

            <div className="flex flex-wrap gap-4 text-xs text-slate-700 dark:text-slate-300 pt-1">
              <div className="flex items-center gap-1.5 font-medium">
                <MapPin size={14} className="text-amber-600 dark:text-amber-400" />
                <span>Kasaragod, Kerala</span>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Nav */}
          <div>
            <h4 className="font-heading text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-3">
              {language === 'ml' ? 'പ്രധാന ലിങ്കുകൾ' : 'Fest Portals'}
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-amber-700 dark:hover:text-amber-400 transition">
                  {getTranslation(language, 'navHome')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('scoreboard')} className="hover:text-amber-700 dark:hover:text-amber-400 transition">
                  {getTranslation(language, 'navScoreboard')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('student_result')} className="hover:text-amber-700 dark:hover:text-amber-400 transition">
                  {getTranslation(language, 'navStudentResult')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('teams')} className="hover:text-amber-700 dark:hover:text-amber-400 transition">
                  {getTranslation(language, 'navTeams')} (Nayro, Zayro, Lucero)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('programmes')} className="hover:text-amber-700 dark:hover:text-amber-400 transition">
                  {getTranslation(language, 'navProgrammes')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: System & Testing Controls */}
          <div>
            <h4 className="font-heading text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-3">
              {language === 'ml' ? 'സിസ്റ്റം കൺട്രോൾ' : 'System Administration'}
            </h4>
            <div className="space-y-2.5 text-xs">
              <button
                onClick={() => onNavigate('admin')}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold flex items-center justify-between transition touch-target"
              >
                <span>Admin Dashboard</span>
                <Shield size={14} className="text-amber-600 dark:text-amber-400" />
              </button>

              <button
                onClick={handleReset}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-semibold flex items-center justify-between transition touch-target"
                title="Reset all data to default demo state"
              >
                <span>Reset Demo Data</span>
                <RotateCcw size={14} />
              </button>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                {language === 'ml' 
                  ? 'ഫെസ്റ്റ് പൂർണ്ണമായും ലൈവ് ഡാറ്റാബേസ് പോലെ പ്രവർത്തിക്കുന്നു.' 
                  : 'Real-time calculations and dynamic updates across all views.'}
              </p>
            </div>
          </div>
        </div>

        <GoldDivider className="my-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 font-medium">
            <IslamicStar size={12} className="text-amber-600 dark:text-amber-400" />
            <span>© {festSettings.festYear} {festSettings.institutionName}. All Rights Reserved.</span>
          </div>
          <div className="text-center sm:text-right text-slate-500 dark:text-slate-400">
            <span>Official Arts Fest Portal • Three Teams: NAYRO | ZAYRO | LUCERO</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
