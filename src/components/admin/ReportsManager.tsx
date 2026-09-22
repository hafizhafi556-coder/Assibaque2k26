import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Users, 
  Trophy, 
  Calendar, 
  Award, 
  BarChart3, 
  Filter,
  Sparkles
} from 'lucide-react';
import { useFest, formatParticipantDisplayName } from '../../context/FestContext';
import { FestPosterModal } from '../common/FestPosterModal';
import { ProgrammeJudgesSheet } from './ProgrammeJudgesSheet';

type ReportType = 'student' | 'team' | 'programme' | 'result' | 'points' | 'judge_sheet';

export const ReportsManager: React.FC = () => {
  const { students, teams, programmes, results, categories, festSettings } = useFest();
  const [activeReport, setActiveReport] = useState<ReportType>('team');
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const exportCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(c => `"${c}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    if (activeReport === 'team') {
      const headers = ['Team ID', 'Team Name', 'Total Points', 'Rank', 'Gold Count', 'Silver Count', 'Bronze Count', 'Students Count'];
      const rows = teams.map(t => [
        t.id,
        t.name,
        t.totalPoints,
        t.rank,
        t.goldCount,
        t.silverCount,
        t.bronzeCount,
        t.studentsCount,
      ]);
      exportCSV(`team_report_${festSettings.festYear}`, headers, rows);
    } else if (activeReport === 'student') {
      const headers = ['Chest No', 'Student ID', 'Student Name', 'Team', 'Class', 'Division', 'Status'];
      const rows = students.map(s => [
        s.chest_number,
        s.student_id,
        s.student_name,
        s.team,
        s.class,
        s.division,
        s.status,
      ]);
      exportCSV(`students_roster_${festSettings.festYear}`, headers, rows);
    } else if (activeReport === 'programme') {
      const headers = ['Code', 'Programme Name', 'Category', 'Type', 'Section', 'Venue', 'Max Marks', 'Status'];
      const rows = programmes.map(p => [
        p.programme_code,
        p.programme_name,
        p.category,
        p.type,
        p.section || 'individual',
        p.venue,
        p.maximum_marks,
        p.status,
      ]);
      exportCSV(`programmes_schedule_${festSettings.festYear}`, headers, rows);
    } else if (activeReport === 'result') {
      const headers = ['Programme Code', 'Event Name', 'Chest No', 'Student Name', 'Team', 'Marks', 'Grade', 'Position', 'Points Awarded', 'Status'];
      const rows = results.map(r => {
        const prg = programmes.find(p => p.id === r.programme_id);
        const stu = students.find(s => s.id === r.student_id);
        return [
          prg?.programme_code || '',
          prg?.programme_name || '',
          r.chest_number,
          stu?.student_name || '',
          r.team,
          r.total_marks,
          r.grade || '',
          r.position || 'Participant',
          r.points_awarded || 0,
          r.status,
        ];
      });
      exportCSV(`results_master_${festSettings.festYear}`, headers, rows);
    } else if (activeReport === 'points') {
      const headers = ['Team', 'Rank', 'Total Points', 'First Prizes', 'Second Prizes', 'Third Prizes'];
      const rows = teams.map(t => [
        t.name,
        t.rank,
        t.totalPoints,
        t.goldCount,
        t.silverCount,
        t.bronzeCount,
      ]);
      exportCSV(`points_scoreboard_${festSettings.festYear}`, headers, rows);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-white flex items-center gap-2">
            <FileText size={22} className="text-amber-400" />
            <span>Reports & Data Exports</span>
          </h2>
          <p className="text-xs text-slate-400">
            Export comprehensive statistical sheets for committee records, press releases, and archival.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPosterModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-xs font-bold transition shadow cursor-pointer"
            title="Generate print-ready posters with official watermark"
          >
            <Sparkles size={15} />
            <span>Fest Posters</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/30 text-xs font-bold transition shadow cursor-pointer"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow cursor-pointer"
          >
            <Printer size={15} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="no-print flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveReport('team')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeReport === 'team' ? 'bg-amber-500 text-slate-950 font-extrabold' : 'bg-slate-900 text-slate-300'
          }`}
        >
          <Trophy size={14} /> Team Standings Report
        </button>
        <button
          onClick={() => setActiveReport('result')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeReport === 'result' ? 'bg-amber-500 text-slate-950 font-extrabold' : 'bg-slate-900 text-slate-300'
          }`}
        >
          <Award size={14} /> Results & Medals Master
        </button>
        <button
          onClick={() => setActiveReport('student')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeReport === 'student' ? 'bg-amber-500 text-slate-950 font-extrabold' : 'bg-slate-900 text-slate-300'
          }`}
        >
          <Users size={14} /> Student Registry
        </button>
        <button
          onClick={() => setActiveReport('programme')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeReport === 'programme' ? 'bg-amber-500 text-slate-950 font-extrabold' : 'bg-slate-900 text-slate-300'
          }`}
        >
          <Calendar size={14} /> Programme Master Schedule
        </button>
        <button
          onClick={() => setActiveReport('judge_sheet')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeReport === 'judge_sheet' ? 'bg-amber-500 text-slate-950 font-extrabold' : 'bg-slate-900 text-slate-300'
          }`}
        >
          <FileText size={14} /> Programme Judges Sheet
        </button>
      </div>

      {/* If Judge Sheet is selected, render its dedicated interface directly */}
      {activeReport === 'judge_sheet' ? (
        <ProgrammeJudgesSheet />
      ) : (
        /* Printable Report Surface for Standard Reports */
        <div className="printable-card p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-200 relative overflow-hidden">
          {/* Official Logo Watermark Background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none z-0">
            <img
              src={festSettings.festLogo}
              alt=""
              className="w-[450px] max-w-[80%] max-h-[70%] object-contain opacity-[0.05] filter grayscale contrast-125 print:opacity-[0.08]"
            />
          </div>

          <div className="relative z-10">
            <div className="border-b border-slate-700 pb-4 mb-6 text-center">
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-amber-200 uppercase">
              {festSettings.institutionName}
            </h1>
            <p className="text-xs text-amber-400 font-medium">
              {festSettings.festName} – {festSettings.festYear} Official Report
            </p>
            <span className="text-[11px] text-slate-400 block mt-1">
              Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </span>
          </div>

          {/* Content based on Active Report */}
          {activeReport === 'team' && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-white">Three-Team Championship Tally</h3>
              <table className="w-full text-left text-xs border border-slate-800">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Rank</th>
                    <th className="p-2.5">Team</th>
                    <th className="p-2.5 text-center">1st (Gold)</th>
                    <th className="p-2.5 text-center">2nd (Silver)</th>
                    <th className="p-2.5 text-center">3rd (Bronze)</th>
                    <th className="p-2.5 text-center">Students</th>
                    <th className="p-2.5 text-right">Total Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {teams.map(t => (
                    <tr key={t.id}>
                      <td className="p-2.5 font-bold text-amber-400">#{t.rank}</td>
                      <td className="p-2.5 font-bold text-white uppercase">{t.name}</td>
                      <td className="p-2.5 text-center">{t.goldCount}</td>
                      <td className="p-2.5 text-center">{t.silverCount}</td>
                      <td className="p-2.5 text-center">{t.bronzeCount}</td>
                      <td className="p-2.5 text-center">{t.studentsCount}</td>
                      <td className="p-2.5 text-right font-black text-amber-300 font-mono text-sm">{t.totalPoints} PTS</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeReport === 'result' && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-white">All Published & Submitted Results</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-800">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Code</th>
                      <th className="p-2.5">Event</th>
                      <th className="p-2.5">Chest #</th>
                      <th className="p-2.5">Student</th>
                      <th className="p-2.5">Team</th>
                      <th className="p-2.5 text-center">Marks</th>
                      <th className="p-2.5 text-center">Position</th>
                      <th className="p-2.5 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {results.map(r => {
                      const prg = programmes.find(p => p.id === r.programme_id);
                      const stu = students.find(s => s.id === r.student_id);
                      return (
                        <tr key={r.id}>
                          <td className="p-2.5 font-mono text-amber-300">{prg?.programme_code}</td>
                          <td className="p-2.5">{prg?.programme_name}</td>
                          <td className="p-2.5 font-mono">#{r.chest_number}</td>
                          <td className="p-2.5 font-semibold text-white">{formatParticipantDisplayName(stu?.student_name, prg) || `Chest #${r.chest_number}`}</td>
                          <td className="p-2.5 uppercase">{r.team}</td>
                          <td className="p-2.5 text-center font-mono">{r.total_marks}</td>
                          <td className="p-2.5 text-center font-bold">
                            {r.position === 1 ? '1st' : r.position === 2 ? '2nd' : r.position === 3 ? '3rd' : '-'}
                          </td>
                          <td className="p-2.5 text-right font-bold text-sky-400">+{r.points_awarded || 0}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeReport === 'student' && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-white">Full Student Registry ({students.length} Records)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-800">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Chest #</th>
                      <th className="p-2.5">Student ID</th>
                      <th className="p-2.5">Student Name</th>
                      <th className="p-2.5">Team</th>
                      <th className="p-2.5">Class</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {students.slice(0, 50).map(s => (
                      <tr key={s.id}>
                        <td className="p-2.5 font-mono text-amber-300 font-bold">#{s.chest_number}</td>
                        <td className="p-2.5 font-mono">{s.student_id}</td>
                        <td className="p-2.5 font-semibold text-white">{s.student_name}</td>
                        <td className="p-2.5 uppercase">{s.team}</td>
                        <td className="p-2.5">{s.class} ({s.division})</td>
                        <td className="p-2.5">{s.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeReport === 'programme' && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-white">Master Programme Schedule ({programmes.length} Events)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-800">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Code</th>
                      <th className="p-2.5">Event Name</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5">Venue</th>
                      <th className="p-2.5">Date & Time</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {programmes.map(p => (
                      <tr key={p.id}>
                        <td className="p-2.5 font-mono text-amber-300 font-bold">{p.programme_code}</td>
                        <td className="p-2.5 font-semibold text-white">{p.programme_name}</td>
                        <td className="p-2.5">{p.category}</td>
                        <td className="p-2.5">{p.venue}</td>
                        <td className="p-2.5">{p.scheduled_date} {p.scheduled_time}</td>
                        <td className="p-2.5 capitalize">{p.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          </div>
        </div>
      )}

      {/* Fest Poster Generator Modal with Logo Watermark */}
      <FestPosterModal
        isOpen={isPosterModalOpen}
        onClose={() => setIsPosterModalOpen(false)}
      />
    </div>
  );
};
