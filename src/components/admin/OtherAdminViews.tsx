import React, { useState } from 'react';
import { 
  FolderTree, 
  UserCheck, 
  Award, 
  Bell, 
  History, 
  FileCheck, 
  Camera, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Printer, 
  Pin, 
  CheckCircle2, 
  Upload, 
  User 
} from 'lucide-react';
import { useFest, formatParticipantDisplayName } from '../../context/FestContext';
import { CertificateModal } from '../common/CertificateModal';
import { Certificate, Programme, Student } from '../../types';

// 1. Categories Management View
export const CategoriesView: React.FC = () => {
  const { categories, addCategory, deleteCategory } = useFest();
  const [name, setName] = useState('');
  const [nameMl, setNameMl] = useState('');
  const [code, setCode] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;
    addCategory({
      name,
      nameMl: nameMl || name,
      code: code.toUpperCase(),
      description: `${name} category competition`,
    });
    setName('');
    setNameMl('');
    setCode('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold font-heading text-white flex items-center gap-2">
        <FolderTree size={22} className="text-amber-400" />
        <span>Fest Categories</span>
      </h2>

      <form onSubmit={handleAdd} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[140px]">
          <label className="block text-[11px] text-slate-400 mb-1">Code</label>
          <input
            type="text"
            required
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="e.g. PRIMARY"
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-amber-300 font-bold"
          />
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="block text-[11px] text-slate-400 mb-1">Category Name (EN)</label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Primary School"
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200"
          />
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="block text-[11px] text-slate-400 mb-1">Category Name (ML)</label>
          <input
            type="text"
            value={nameMl}
            onChange={e => setNameMl(e.target.value)}
            placeholder="e.g. പ്രൈമറി"
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow"
        >
          Add Category
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(c => (
          <div key={c.id} className="p-4 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                {c.code}
              </span>
              <h4 className="font-bold text-sm text-white mt-1.5">{c.name}</h4>
              <p className="text-xs text-slate-400">{c.nameMl}</p>
            </div>
            <button
              onClick={() => deleteCategory(c.id)}
              className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="Delete Category"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// 2. Participants Roster Management View
export const ParticipantsView: React.FC = () => {
  const { participants, students, programmes, updateParticipantStatus } = useFest();
  const [search, setSearch] = useState('');

  const filtered = participants.filter(p => {
    const s = students.find(stu => stu.id === p.student_id);
    const prg = programmes.find(item => item.id === p.programme_id);
    return (
      p.chest_number.includes(search) ||
      s?.student_name.toLowerCase().includes(search.toLowerCase()) ||
      prg?.programme_name.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-white flex items-center gap-2">
            <UserCheck size={22} className="text-amber-400" />
            <span>Event Participants Roster</span>
          </h2>
          <p className="text-xs text-slate-400">
            {participants.length} event enrollments. Manage stage attendance (Present, Absent, Disqualified).
          </p>
        </div>
        <div className="w-full sm:w-64">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search participant..."
            className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300 bg-slate-900/40">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800">
            <tr>
              <th className="p-3">Chest #</th>
              <th className="p-3">Student Name</th>
              <th className="p-3">Team</th>
              <th className="p-3">Programme</th>
              <th className="p-3">Attendance & Stage Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filtered.map(p => {
              const student = students.find(s => s.id === p.student_id);
              const prg = programmes.find(item => item.id === p.programme_id);
              return (
                <tr key={p.id}>
                  <td className="p-3 font-mono font-bold text-amber-300">#{p.chest_number}</td>
                  <td className="p-3 font-semibold text-white">{formatParticipantDisplayName(student?.student_name, prg) || 'Registered Participant'}</td>
                  <td className="p-3 uppercase font-bold text-[11px]">{p.team}</td>
                  <td className="p-3">{prg?.programme_code} • {prg?.programme_name}</td>
                  <td className="p-3">
                    <select
                      value={p.status}
                      onChange={e => updateParticipantStatus(p.id, e.target.value as any)}
                      className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs text-slate-200 font-semibold"
                    >
                      <option value="registered">Registered</option>
                      <option value="present">Present (On Stage)</option>
                      <option value="completed">Completed</option>
                      <option value="absent">Absent</option>
                      <option value="disqualified">Disqualified</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 3. Judges Management View
export const JudgesView: React.FC = () => {
  const { judges, addJudge, deleteJudge, programmes } = useFest();
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [phone, setPhone] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    addJudge({
      name,
      specialization: specialization || 'General Arts',
      phone,
      username: `judge_${name.toLowerCase().replace(/\s+/g, '')}`,
      password: 'password123',
      assignedProgrammes: [],
    });
    setName('');
    setSpecialization('');
    setPhone('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold font-heading text-white flex items-center gap-2">
        <Award size={22} className="text-amber-400" />
        <span>Board of Adjudicators (Judges)</span>
      </h2>

      <form onSubmit={handleAdd} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-[11px] text-slate-400 mb-1">Judge Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Usthad Rashid Hudawi"
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200"
          />
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="block text-[11px] text-slate-400 mb-1">Specialization / Expertise</label>
          <input
            type="text"
            value={specialization}
            onChange={e => setSpecialization(e.target.value)}
            placeholder="e.g. Qira'at & Tajweed"
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200"
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-[11px] text-slate-400 mb-1">Phone</label>
          <input
            type="text"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+91..."
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold shadow"
        >
          Add Adjudicator
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {judges.map(j => {
          const assignedCount = programmes.filter(p => p.judge_id === j.id).length;
          return (
            <div key={j.id} className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 font-mono">@{j.username}</span>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete judge ${j.name}?`)) deleteJudge(j.id);
                  }}
                  className="p-1 text-slate-500 hover:text-rose-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <h4 className="font-bold text-base text-white">{j.name}</h4>
              <p className="text-xs text-slate-400">{j.specialization}</p>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-xs text-slate-400">
                <span>Assigned Events:</span>
                <strong className="text-amber-300">{assignedCount} Events</strong>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 4. Announcements View
export const AnnouncementsView: React.FC = () => {
  const { announcements, addAnnouncement, deleteAnnouncement, togglePinAnnouncement, language } = useFest();
  const [title, setTitle] = useState('');
  const [titleMl, setTitleMl] = useState('');
  const [content, setContent] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    addAnnouncement({
      title,
      title_ml: titleMl || title,
      content,
      content_ml: content,
      priority: 'high',
      is_pinned: false,
    });
    setTitle('');
    setTitleMl('');
    setContent('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold font-heading text-white flex items-center gap-2">
        <Bell size={22} className="text-amber-400" />
        <span>Fest Announcements & Bulletins</span>
      </h2>

      <form onSubmit={handleAdd} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title (English)"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
          />
          <input
            type="text"
            value={titleMl}
            onChange={e => setTitleMl(e.target.value)}
            placeholder="Title (Malayalam)"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
          />
        </div>
        <textarea
          required
          rows={2}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Announcement body text..."
          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
        />
        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold shadow"
        >
          Publish Announcement
        </button>
      </form>

      <div className="space-y-3">
        {announcements.map(a => (
          <div key={a.id} className="p-4 rounded-2xl glass-panel border border-slate-800 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {a.is_pinned && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                    <Pin size={10} /> PINNED
                  </span>
                )}
                <span className="text-[11px] text-slate-500">{a.created_at}</span>
              </div>
              <h4 className="font-bold text-sm text-white">{a.title}</h4>
              <p className="text-xs text-slate-300 mt-1">{a.content}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => togglePinAnnouncement(a.id)}
                className={`p-1.5 rounded-lg ${a.is_pinned ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                title="Pin announcement"
              >
                <Pin size={14} />
              </button>
              <button
                onClick={() => deleteAnnouncement(a.id)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 5. Certificates System View
export const CertificatesView: React.FC = () => {
  const { certificates, results, students, programmes, festSettings, generateCertificate } = useFest();
  const [activeCert, setActiveCert] = useState<Certificate | null>(null);

  // Eligible winners (published results with rank 1, 2, or 3)
  const eligibleWinners = results.filter(r => r.status === 'published' && r.position && r.position <= 3);

  const handleGenerate = (r: typeof eligibleWinners[0]) => {
    const prg = programmes.find(p => p.id === r.programme_id);
    const stu = students.find(s => s.id === r.student_id);
    const cert = generateCertificate({
      student_id: stu?.student_id || r.chest_number,
      student_name: stu?.student_name || `Chest #${r.chest_number}`,
      programme_id: r.programme_id,
      programme_name: prg?.programme_name || 'Fest Event',
      position: r.position as 1 | 2 | 3,
      grade: r.grade,
      team: r.team,
      fest_name: festSettings.festName,
      year: festSettings.festYear,
      institution_name: festSettings.institutionName,
    });
    setActiveCert(cert);
  };

  return (
    <div className="space-y-6">
      <CertificateModal certificate={activeCert} onClose={() => setActiveCert(null)} />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-white flex items-center gap-2">
            <FileCheck size={22} className="text-amber-400" />
            <span>Official Certificates Generation</span>
          </h2>
          <p className="text-xs text-slate-400">
            Generate, preview, and print high-resolution certificates for all 1st, 2nd, and 3rd place winners.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {eligibleWinners.map(w => {
          const prg = programmes.find(p => p.id === w.programme_id);
          const stu = students.find(s => s.id === w.student_id);
          return (
            <div key={w.id} className="p-4 rounded-2xl glass-panel border border-amber-500/30 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-amber-300">
                  {w.position === 1 ? '🥇 1st Place' : w.position === 2 ? '🥈 2nd Place' : '🥉 3rd Place'}
                </span>
                <h4 className="font-bold text-sm text-white mt-0.5">{stu?.student_name}</h4>
                <p className="text-xs text-slate-400">{prg?.programme_name} (Team {w.team.toUpperCase()})</p>
              </div>
              <button
                onClick={() => handleGenerate(w)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow flex items-center gap-1.5 shrink-0"
              >
                <Printer size={14} />
                <span>Certificate</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 6. Photo Management View
export const PhotoManagerView: React.FC = () => {
  const { students, updateStudent } = useFest();
  const [search, setSearch] = useState('');

  const filtered = students.filter(s => 
    s.student_name.toLowerCase().includes(search.toLowerCase()) || 
    s.chest_number.includes(search)
  );

  const handleUpload = (studentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const dataUrl = loadEvt.target?.result as string;
        updateStudent(studentId, { photo_url: dataUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = (studentId: string) => {
    updateStudent(studentId, { photo_url: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-white flex items-center gap-2">
            <Camera size={22} className="text-amber-400" />
            <span>Student Photo Management</span>
          </h2>
          <p className="text-xs text-slate-400">
            Preview, upload, replace, or remove individual student profile photos.
          </p>
        </div>
        <div className="w-full sm:w-64">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter by name, chest #..."
            className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filtered.map(s => (
          <div key={s.id} className="p-3 rounded-2xl glass-panel border border-slate-800 text-center flex flex-col items-center justify-between">
            <div className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-slate-700 overflow-hidden mb-2 relative flex items-center justify-center">
              {s.photo_url ? (
                <img src={s.photo_url} alt={s.student_name} className="w-full h-full object-cover" />
              ) : (
                <User size={30} className="text-slate-500" />
              )}
            </div>
            <div className="text-[11px] font-mono font-bold text-amber-300">#{s.chest_number}</div>
            <div className="text-xs font-bold text-white truncate max-w-[120px]">{s.student_name}</div>
            <div className="text-[10px] text-slate-400 uppercase">{s.team}</div>

            <div className="mt-2 flex items-center gap-1">
              <label className="cursor-pointer p-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[10px] font-bold">
                <Upload size={12} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleUpload(s.id, e)}
                  className="hidden"
                />
              </label>
              {s.photo_url && (
                <button
                  onClick={() => handleRemovePhoto(s.id)}
                  className="p-1.5 rounded-lg bg-rose-950/60 text-rose-300 hover:bg-rose-900 text-[10px]"
                  title="Remove Photo"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 7. Audit Logs View
export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useFest();

  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold font-heading text-white flex items-center gap-2">
        <History size={22} className="text-amber-400" />
        <span>System Audit Trail & Security Logs</span>
      </h2>
      <p className="text-xs text-slate-400">
        Immutable activity log tracking every action: results verified, scores published, unlocked, and settings updated.
      </p>

      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300 bg-slate-900/40">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800">
            <tr>
              <th className="p-3">Timestamp</th>
              <th className="p-3">Action</th>
              <th className="p-3">Performed By</th>
              <th className="p-3">Role</th>
              <th className="p-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {auditLogs.slice(0, 50).map(log => (
              <tr key={log.id}>
                <td className="p-3 font-mono text-slate-400">{log.timestamp}</td>
                <td className="p-3 font-bold text-amber-300 uppercase">{log.action.replace('_', ' ')}</td>
                <td className="p-3 font-semibold text-white">{log.user_name}</td>
                <td className="p-3 uppercase text-[10px] text-slate-400">{log.user_role}</td>
                <td className="p-3 text-slate-300 font-mono text-[11px]">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
