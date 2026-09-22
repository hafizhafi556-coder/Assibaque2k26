import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, UserCheck, X, AlertCircle } from 'lucide-react';
import { useFest } from '../../context/FestContext';
import { DEMO_USERS } from '../../data/initialData';
import { UserRole } from '../../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessRoleRedirect?: (role: UserRole) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccessRoleRedirect }) => {
  const { language, loginAs } = useFest();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUsername = username.trim().toLowerCase();
    const matchedUser = DEMO_USERS.find(u => u.username.toLowerCase() === cleanUsername);

    if (matchedUser) {
      loginAs(matchedUser);
      onClose();
      if (onSuccessRoleRedirect) {
        onSuccessRoleRedirect(matchedUser.role);
      }
    } else {
      setError(language === 'ml' 
        ? 'ലോഗിൻ വിവരങ്ങൾ തെറ്റാണ്.' 
        : 'Invalid username or password.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl glass-panel-gold p-6 sm:p-8 text-slate-100 shadow-2xl"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800/60 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-blue-900/40 border border-amber-400/30 text-amber-400">
              <Lock size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-amber-200">
                {language === 'ml' ? 'പോർട്ടൽ ലോഗിൻ' : 'Portal Authentication'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                {language === 'ml' 
                  ? 'അഡ്മിൻ, വിധികർത്താവ്, ടീം മാനേജർ പ്രവേശനം' 
                  : 'Access for Admin, Judges & Team Managers'}
              </p>
            </div>
          </div>

          {/* Error notice */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-600/40 text-rose-200 text-xs sm:text-sm flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Manual Form */}
          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                {language === 'ml' ? 'ഉപയോക്തൃ നാമം (Username)' : 'Username'}
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. admin, nayro_mgr, judge1"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                {language === 'ml' ? 'പാസ്‌വേഡ് (Password)' : 'Password'}
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <UserCheck size={18} />
              <span>{language === 'ml' ? 'പ്രവേശിക്കുക' : 'Sign In'}</span>
            </button>
          </form>

          <p className="mt-5 pt-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
            {language === 'ml' 
              ? 'വിദ്യാർത്ഥികൾക്ക് ലോഗിൻ ആവശ്യമില്ല. ഫലം പരിശോധിക്കാൻ "ഫലം അറിയാം" പേജ് ഉപയോഗിക്കുക.' 
              : 'Students do not need to login. Public search works by Chest No / Admission No.'}
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
