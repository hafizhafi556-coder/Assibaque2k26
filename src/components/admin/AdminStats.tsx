import React from 'react';
import { 
  Users, 
  Calendar, 
  UserCheck, 
  CheckCircle2, 
  Clock, 
  Award,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Trophy
} from 'lucide-react';
import { useFest } from '../../context/FestContext';

export const AdminStats: React.FC = () => {
  const { students, programmes, participants, results, judges, teams, festSettings } = useFest();

  const publishedResults = results.filter(r => r.status === 'published').length;
  const verifiedResults = results.filter(r => r.status === 'verified').length;
  const pendingResults = results.filter(r => r.status === 'draft' || r.status === 'submitted').length;

  const totalPointsAwarded = teams.reduce((acc, t) => acc + (t.totalPoints || 0), 0);
  const maxTeamPoints = Math.max(...teams.map(t => t.totalPoints || 0), 1);

  const nayro = teams.find(t => t.id === 'nayro');
  const zayro = teams.find(t => t.id === 'zayro');
  const lucero = teams.find(t => t.id === 'lucero');

  const sortedTeams = [...teams].sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div className="space-y-5 mb-6">
      {/* Welcome & Overview Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-white via-slate-50 to-amber-50/40 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles size={14} />
            <span>Festival Command Center</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-heading text-slate-900">
            {festSettings.festName} {festSettings.festYear} Overview
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-xl">
            Live operations overview across student registrations, judging progress, score verification, and championship standings.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
            <Trophy size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 block">
              Championship Leader
            </span>
            <span className="font-heading font-black text-sm text-slate-900 block">
              TEAM {sortedTeams[0]?.name} ({sortedTeams[0]?.totalPoints} PTS)
            </span>
          </div>
        </div>
      </div>

      {/* 6 Key Executive Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Students */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-amber-300 transition group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Students</span>
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-amber-100 group-hover:text-amber-800 transition">
              <Users size={14} />
            </span>
          </div>
          <div className="text-2xl font-black font-heading text-slate-900">{students.length}</div>
          <span className="text-[10px] text-slate-500 font-semibold">Active Contestants</span>
        </div>

        {/* Total Programmes */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-amber-300 transition group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Events</span>
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-amber-100 group-hover:text-amber-800 transition">
              <Calendar size={14} />
            </span>
          </div>
          <div className="text-2xl font-black font-heading text-slate-900">{programmes.length}</div>
          <span className="text-[10px] text-slate-500 font-semibold">Stage & Non-Stage</span>
        </div>

        {/* Participant Entries */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-amber-300 transition group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Entries</span>
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-amber-100 group-hover:text-amber-800 transition">
              <UserCheck size={14} />
            </span>
          </div>
          <div className="text-2xl font-black font-heading text-slate-900">{participants.length}</div>
          <span className="text-[10px] text-slate-500 font-semibold">Roster Assignments</span>
        </div>

        {/* Published Results */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 transition group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Published</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100 transition">
              <CheckCircle2 size={14} />
            </span>
          </div>
          <div className="text-2xl font-black font-heading text-emerald-700">{publishedResults}</div>
          <span className="text-[10px] text-slate-500 font-semibold">Live on Scoreboard</span>
        </div>

        {/* Pending Verification */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-amber-300 transition group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Pending</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700 group-hover:bg-amber-100 transition">
              <Clock size={14} />
            </span>
          </div>
          <div className="text-2xl font-black font-heading text-amber-800">{pendingResults}</div>
          <span className="text-[10px] text-slate-500 font-semibold">In Judge Review</span>
        </div>

        {/* Judges Roster */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-amber-300 transition group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Judges</span>
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-amber-100 group-hover:text-amber-800 transition">
              <Award size={14} />
            </span>
          </div>
          <div className="text-2xl font-black font-heading text-slate-900">{judges.length}</div>
          <span className="text-[10px] text-slate-500 font-semibold">Assigned Evaluators</span>
        </div>
      </div>

      {/* Team Standings Visual Progress Bars (SaaS Style) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-black text-base text-slate-900">
              Live Team Points & Championship Race
            </h3>
            <p className="text-xs text-slate-500">
              Real-time point accumulation across Nayro, Zayro, and Lucero.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
            Total Points: {totalPointsAwarded} PTS
          </span>
        </div>

        <div className="space-y-3 pt-1">
          {sortedTeams.map((team, idx) => {
            const percentage = Math.round((team.totalPoints / maxTeamPoints) * 100);
            const isLeader = idx === 0;

            const colorConfig = team.id === 'nayro'
              ? { bar: 'bg-sky-500', bg: 'bg-sky-50', text: 'text-sky-900', border: 'border-sky-200' }
              : team.id === 'zayro'
              ? { bar: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-950', border: 'border-amber-200' }
              : { bar: 'bg-purple-500', bg: 'bg-purple-50', text: 'text-purple-900', border: 'border-purple-200' };

            return (
              <div 
                key={team.id}
                className={`p-3.5 rounded-2xl border ${colorConfig.bg} ${colorConfig.border} flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs`}
              >
                <div className="flex items-center gap-3 sm:w-1/3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                    isLeader ? 'bg-amber-400 text-slate-950 shadow-xs' : 'bg-white text-slate-800 border border-slate-200'
                  }`}>
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="font-heading font-black text-sm uppercase text-slate-900">
                      TEAM {team.name}
                    </h4>
                    <span className="text-[10px] text-slate-600 font-semibold block">
                      🥇 {team.goldCount} | 🥈 {team.silverCount} | 🥉 {team.bronzeCount}
                    </span>
                  </div>
                </div>

                <div className="flex-1 max-w-md mx-auto w-full px-2">
                  <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${colorConfig.bar}`}
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    />
                  </div>
                </div>

                <div className="text-right sm:w-1/4">
                  <div className="text-lg font-black font-mono text-slate-900">
                    {team.totalPoints} <span className="text-xs text-slate-500">PTS</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800">
                    {isLeader ? '🏆 Championship Leader' : 'Challenger'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
