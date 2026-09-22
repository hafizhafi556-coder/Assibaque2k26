import React, { useState } from 'react';
import { Settings, Save, CheckCircle, Upload, Shield, Award, Lock, Unlock, AlertTriangle } from 'lucide-react';
import { useFest } from '../../context/FestContext';

export const FestSettingsManager: React.FC = () => {
  const { festSettings, updateFestSettings } = useFest();

  const [form, setForm] = useState(festSettings);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateFestSettings(form);
    setSuccessMsg('Settings and Point Scheme successfully updated! Team scores recalculated.');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const dataUrl = loadEvt.target?.result as string;
        setForm(prev => ({ ...prev, festLogo: dataUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-heading text-white flex items-center gap-2">
          <Settings size={22} className="text-amber-400" />
          <span>Fest Settings & Points Scheme</span>
        </h2>
        <p className="text-xs text-slate-400">
          Configure branding, academic identity, dates, and live point calculation rules.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center gap-2 shadow">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand & Identity Card */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-amber-300 font-heading uppercase tracking-wider">
            Arts Fest & Institution Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Fest Name (English)</label>
              <input
                type="text"
                value={form.festName}
                onChange={e => setForm(prev => ({ ...prev, festName: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Fest Name (Malayalam)</label>
              <input
                type="text"
                value={form.festNameMl}
                onChange={e => setForm(prev => ({ ...prev, festNameMl: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Institution Name</label>
              <input
                type="text"
                value={form.institutionName}
                onChange={e => setForm(prev => ({ ...prev, institutionName: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Fest Edition / Year</label>
              <input
                type="text"
                value={form.festYear}
                onChange={e => setForm(prev => ({ ...prev, festYear: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Fest Theme / Motto (English)</label>
              <input
                type="text"
                value={form.festTheme}
                onChange={e => setForm(prev => ({ ...prev, festTheme: e.target.value }))}
                placeholder="Valor, Harmony & Purity in Faith"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-200 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Fest Theme / Motto (Malayalam)</label>
              <input
                type="text"
                value={form.festThemeMl}
                onChange={e => setForm(prev => ({ ...prev, festThemeMl: e.target.value }))}
                placeholder="കലർന്ന കാലത്ത് കലർപ്പില്ലാത്ത ഈമാൻ"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-200 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Fest Logo / Emblem</label>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-amber-400/40 overflow-hidden flex items-center justify-center text-xl">
                {form.festLogo ? (
                  <img src={form.festLogo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span>⚜️</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500/20 file:text-amber-300 hover:file:bg-amber-500/30"
              />
            </div>
          </div>
        </div>

        {/* Programme Registration Portal Lock System Control Panel */}
        <div className={`p-6 rounded-3xl border transition-all ${
          form.registration_locked
            ? 'bg-rose-950/40 border-rose-500/50 shadow-lg shadow-rose-950/50'
            : 'bg-emerald-950/30 border-emerald-500/40 shadow-sm'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-start gap-3">
              <div className={`p-3 rounded-2xl shrink-0 ${
                form.registration_locked
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {form.registration_locked ? <Lock size={24} /> : <Unlock size={24} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white font-heading">
                    Programme Registration Portal Lock System
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    form.registration_locked
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {form.registration_locked ? 'LOCKED / CLOSED' : 'OPEN FOR TEAMS'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Control whether Team Managers can register or unregister student candidates for programmes.
                </p>
              </div>
            </div>

            {/* Main Toggle Switch */}
            <div className="flex items-center gap-3 self-start sm:self-center">
              <span className="text-xs font-bold text-slate-300">
                {form.registration_locked ? 'Portal Locked' : 'Portal Open'}
              </span>
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, registration_locked: !prev.registration_locked }))}
                className={`relative inline-flex h-8 w-15 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  form.registration_locked ? 'bg-rose-600' : 'bg-emerald-600'
                }`}
                role="switch"
                aria-checked={form.registration_locked}
              >
                <span
                  className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out flex items-center justify-center text-xs font-bold ${
                    form.registration_locked ? 'translate-x-7 text-rose-600' : 'translate-x-0 text-emerald-600'
                  }`}
                >
                  {form.registration_locked ? <Lock size={13} /> : <Unlock size={13} />}
                </span>
              </button>
            </div>
          </div>

          {/* Details and Custom Lock Message Inputs */}
          <div className="mt-4 pt-2 space-y-4">
            {form.registration_locked ? (
              <div className="p-3.5 rounded-xl bg-rose-900/30 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2.5">
                <AlertTriangle size={17} className="text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold mb-0.5">Registration is strictly LOCKED for Team Managers</strong>
                  <span>Team managers attempting to register candidates will see the locked notice below. Admins can still assign participants from the Admin Participants Roster.</span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-900/20 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2.5">
                <CheckCircle size={17} className="text-emerald-400 shrink-0" />
                <span>Registration is currently <strong>ACTIVE</strong>. Team managers can enroll eligible students in Stage and Non-Stage events.</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Lock Notice Message (English)
                </label>
                <input
                  type="text"
                  value={form.registration_lock_message || ''}
                  onChange={e => setForm(prev => ({ ...prev, registration_lock_message: e.target.value }))}
                  placeholder="Programme Registration has been officially closed."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Lock Notice Message (Malayalam)
                </label>
                <input
                  type="text"
                  value={form.registration_lock_message_ml || ''}
                  onChange={e => setForm(prev => ({ ...prev, registration_lock_message_ml: e.target.value }))}
                  placeholder="പ്രോഗ്രാം രജിസ്ട്രേഷൻ അഡ്മിനിസ്ട്രേഷൻ ലോക്ക് ചെയ്തിരിക്കുന്നു."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-200 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Point Scheme Rules - 3 Criteria Types + Grade Points */}
        <div className="p-6 rounded-3xl glass-panel-gold border border-amber-500/30 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Award size={20} className="text-amber-400" />
              <h3 className="text-sm font-bold text-amber-300 font-heading uppercase tracking-wider">
                Automatic Point Calculation Scheme (3-Tier Criteria & Grade Points)
              </h3>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
              Auto Formula: Position Pts + Grade Pts
            </span>
          </div>
          
          <p className="text-xs text-slate-400">
            Points are automatically awarded according to programme criteria category (<strong className="text-amber-300">INDIVIDUAL</strong>, <strong className="text-emerald-300">GROUP</strong>, <strong className="text-purple-300">GENERAL</strong>) plus additional merit grade points (<strong className="text-amber-300">A, B, C</strong>).
          </p>

          {/* 3 CRITERIA TIERS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. INDIVIDUAL SCHEME */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/40 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                  👤 Individual
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold font-mono">
                  5, 3, 1
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-amber-400 mb-1 text-center">🥇 1st</label>
                  <input
                    type="number"
                    min="0"
                    value={form.pointScheme?.individual?.first ?? 5}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setForm(prev => ({
                        ...prev,
                        pointScheme: {
                          ...prev.pointScheme,
                          individual: {
                            first: val,
                            second: prev.pointScheme?.individual?.second ?? 3,
                            third: prev.pointScheme?.individual?.third ?? 1,
                          },
                          first: val
                        }
                      }));
                    }}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-amber-300 font-bold text-xs text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 mb-1 text-center">🥈 2nd</label>
                  <input
                    type="number"
                    min="0"
                    value={form.pointScheme?.individual?.second ?? 3}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setForm(prev => ({
                        ...prev,
                        pointScheme: {
                          ...prev.pointScheme,
                          individual: {
                            first: prev.pointScheme?.individual?.first ?? 5,
                            second: val,
                            third: prev.pointScheme?.individual?.third ?? 1,
                          },
                          second: val
                        }
                      }));
                    }}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-bold text-xs text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-amber-600 mb-1 text-center">🥉 3rd</label>
                  <input
                    type="number"
                    min="0"
                    value={form.pointScheme?.individual?.third ?? 1}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setForm(prev => ({
                        ...prev,
                        pointScheme: {
                          ...prev.pointScheme,
                          individual: {
                            first: prev.pointScheme?.individual?.first ?? 5,
                            second: prev.pointScheme?.individual?.second ?? 3,
                            third: val,
                          },
                          third: val
                        }
                      }));
                    }}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-amber-500 font-bold text-xs text-center"
                  />
                </div>
              </div>
            </div>

            {/* 2. GROUP SCHEME */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/40 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                  👥 Group
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold font-mono">
                  10, 5, 3
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-emerald-400 mb-1 text-center">🥇 1st</label>
                  <input
                    type="number"
                    min="0"
                    value={form.pointScheme?.group?.first ?? 10}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setForm(prev => ({
                        ...prev,
                        pointScheme: {
                          ...prev.pointScheme,
                          group: {
                            first: val,
                            second: prev.pointScheme?.group?.second ?? 5,
                            third: prev.pointScheme?.group?.third ?? 3,
                          }
                        }
                      }));
                    }}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-emerald-300 font-bold text-xs text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 mb-1 text-center">🥈 2nd</label>
                  <input
                    type="number"
                    min="0"
                    value={form.pointScheme?.group?.second ?? 5}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setForm(prev => ({
                        ...prev,
                        pointScheme: {
                          ...prev.pointScheme,
                          group: {
                            first: prev.pointScheme?.group?.first ?? 10,
                            second: val,
                            third: prev.pointScheme?.group?.third ?? 3,
                          }
                        }
                      }));
                    }}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-bold text-xs text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-amber-600 mb-1 text-center">🥉 3rd</label>
                  <input
                    type="number"
                    min="0"
                    value={form.pointScheme?.group?.third ?? 3}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setForm(prev => ({
                        ...prev,
                        pointScheme: {
                          ...prev.pointScheme,
                          group: {
                            first: prev.pointScheme?.group?.first ?? 10,
                            second: prev.pointScheme?.group?.second ?? 5,
                            third: val,
                          }
                        }
                      }));
                    }}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-amber-500 font-bold text-xs text-center"
                  />
                </div>
              </div>
            </div>

            {/* 3. GENERAL SCHEME */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/40 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-black uppercase text-purple-400 tracking-wider flex items-center gap-1.5">
                  🌟 General
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold font-mono">
                  15, 8, 5
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-purple-400 mb-1 text-center">🥇 1st</label>
                  <input
                    type="number"
                    min="0"
                    value={form.pointScheme?.general?.first ?? 15}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setForm(prev => ({
                        ...prev,
                        pointScheme: {
                          ...prev.pointScheme,
                          general: {
                            first: val,
                            second: prev.pointScheme?.general?.second ?? 8,
                            third: prev.pointScheme?.general?.third ?? 5,
                          }
                        }
                      }));
                    }}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-purple-300 font-bold text-xs text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 mb-1 text-center">🥈 2nd</label>
                  <input
                    type="number"
                    min="0"
                    value={form.pointScheme?.general?.second ?? 8}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setForm(prev => ({
                        ...prev,
                        pointScheme: {
                          ...prev.pointScheme,
                          general: {
                            first: prev.pointScheme?.general?.first ?? 15,
                            second: val,
                            third: prev.pointScheme?.general?.third ?? 5,
                          }
                        }
                      }));
                    }}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-bold text-xs text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-amber-600 mb-1 text-center">🥉 3rd</label>
                  <input
                    type="number"
                    min="0"
                    value={form.pointScheme?.general?.third ?? 5}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setForm(prev => ({
                        ...prev,
                        pointScheme: {
                          ...prev.pointScheme,
                          general: {
                            first: prev.pointScheme?.general?.first ?? 15,
                            second: prev.pointScheme?.general?.second ?? 8,
                            third: val,
                          }
                        }
                      }));
                    }}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-amber-500 font-bold text-xs text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* GRADE POINTS (PINE GRADE) */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-400/40 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <span className="text-xs font-black uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
                  🏅 Grade Points (Pine Grade)
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Added to team total for each participant receiving this grade.
                </p>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold font-mono">
                A = 5, B = 3, C = 1
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <label className="block text-xs font-black text-amber-400 mb-1">Grade A (A / A+)</label>
                <div className="flex items-center justify-center gap-1">
                  <input
                    type="number"
                    min="0"
                    value={form.pointScheme?.grades?.A ?? 5}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setForm(prev => ({
                        ...prev,
                        pointScheme: {
                          ...prev.pointScheme,
                          grades: {
                            A: val,
                            B: prev.pointScheme?.grades?.B ?? 3,
                            C: prev.pointScheme?.grades?.C ?? 1,
                          }
                        }
                      }));
                    }}
                    className="w-20 px-2 py-1.5 rounded-lg bg-slate-900 border border-amber-500/50 text-amber-300 font-bold text-sm text-center"
                  />
                  <span className="text-xs font-bold text-slate-400">pts</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <label className="block text-xs font-black text-sky-400 mb-1">Grade B (B / B+)</label>
                <div className="flex items-center justify-center gap-1">
                  <input
                    type="number"
                    min="0"
                    value={form.pointScheme?.grades?.B ?? 3}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setForm(prev => ({
                        ...prev,
                        pointScheme: {
                          ...prev.pointScheme,
                          grades: {
                            A: prev.pointScheme?.grades?.A ?? 5,
                            B: val,
                            C: prev.pointScheme?.grades?.C ?? 1,
                          }
                        }
                      }));
                    }}
                    className="w-20 px-2 py-1.5 rounded-lg bg-slate-900 border border-sky-500/50 text-sky-300 font-bold text-sm text-center"
                  />
                  <span className="text-xs font-bold text-slate-400">pts</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <label className="block text-xs font-black text-rose-400 mb-1">Grade C (C / C+)</label>
                <div className="flex items-center justify-center gap-1">
                  <input
                    type="number"
                    min="0"
                    value={form.pointScheme?.grades?.C ?? 1}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setForm(prev => ({
                        ...prev,
                        pointScheme: {
                          ...prev.pointScheme,
                          grades: {
                            A: prev.pointScheme?.grades?.A ?? 5,
                            B: prev.pointScheme?.grades?.B ?? 3,
                            C: val,
                          }
                        }
                      }));
                    }}
                    className="w-20 px-2 py-1.5 rounded-lg bg-slate-900 border border-rose-500/50 text-rose-300 font-bold text-sm text-center"
                  />
                  <span className="text-xs font-bold text-slate-400">pts</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Official Signatories for Certificates */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-amber-300 font-heading uppercase tracking-wider flex items-center gap-2">
              <Shield size={18} className="text-amber-400" />
              <span>Official Certificate Signatories</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Islamic Arts Fest Protocol</span>
          </div>
          <p className="text-xs text-slate-400">
            Strict signatory positions on certificates: Left: <strong>Fest Controller (IQBAL ASSHAFI)</strong>, Right: <strong>Vice Principal (RAFI ASH'ARY)</strong>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Controller */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-amber-400 uppercase">Left Signatory (Fest Controller)</div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Official Name</label>
                <input
                  type="text"
                  value={form.fest_controller_name || 'IQBAL ASSHAFI'}
                  onChange={e => setForm(prev => ({ ...prev, fest_controller_name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Official Designation</label>
                <input
                  type="text"
                  value={form.fest_controller_designation || 'Fest Controller'}
                  onChange={e => setForm(prev => ({ ...prev, fest_controller_designation: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                />
              </div>
            </div>

            {/* Vice Principal */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-amber-400 uppercase">Right Signatory (Vice Principal)</div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Official Name</label>
                <input
                  type="text"
                  value={form.vice_principal_name || "RAFI ASH'ARY"}
                  onChange={e => setForm(prev => ({ ...prev, vice_principal_name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Official Designation</label>
                <input
                  type="text"
                  value={form.vice_principal_designation || 'Vice Principal'}
                  onChange={e => setForm(prev => ({ ...prev, vice_principal_designation: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition cursor-pointer"
        >
          <Save size={16} />
          <span>Save Changes & Recalculate Scores</span>
        </button>
      </form>
    </div>
  );
};
