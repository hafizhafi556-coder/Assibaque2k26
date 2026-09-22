import React, { useState, useRef } from 'react';
import { 
  Users, 
  Upload, 
  Download, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  AlertCircle, 
  Camera, 
  X, 
  FileText,
  UserCheck
} from 'lucide-react';
import { useFest } from '../../context/FestContext';
import { Student, TeamId } from '../../types';

export const StudentManager: React.FC = () => {
  const { 
    students, 
    addStudent, 
    updateStudent, 
    deleteStudent, 
    deleteMultipleStudents, 
    deleteAllStudents, 
    bulkImportStudents 
  } = useFest();

  const [search, setSearch] = useState('');
  const [filterTeam, setFilterTeam] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Selection & Deletion State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    mode: 'single' | 'selected' | 'all';
    student?: Student;
    count?: number;
  }>({ isOpen: false, mode: 'single' });

  // Single Student Form State
  const [formData, setFormData] = useState<Omit<Student, 'id'>>({
    student_id: '',
    admission_number: '',
    chest_number: '',
    student_name: '',
    gender: 'male',
    class: 'Senior',
    division: 'Class 10',
    team: 'nayro',
    phone: '',
    photo_url: '',
    status: 'active',
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Bulk Import State
  const [csvContent, setCsvContent] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [bulkValidationErrors, setBulkValidationErrors] = useState<string[]>([]);
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Photo upload preview ref
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleBulkPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const studentId = file.name.split('.')[0];
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const dataUrl = loadEvt.target?.result as string;
        const student = students.find(s => s.student_id.trim() === studentId.trim());
        if (student) {
          updateStudent(student.id, { ...student, photo_url: dataUrl });
        }
      };
      reader.readAsDataURL(file);
    });
    alert('Photo upload initiated for identified students');
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = 
      s.student_name.toLowerCase().includes(search.toLowerCase()) ||
      s.chest_number.toLowerCase().includes(search.toLowerCase()) ||
      s.student_id.toLowerCase().includes(search.toLowerCase()) ||
      s.admission_number.toLowerCase().includes(search.toLowerCase());
    const matchesTeam = filterTeam === 'all' || s.team === filterTeam;
    return matchesSearch && matchesTeam;
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      student_id: `ISIA-${Date.now().toString().slice(-4)}`,
      admission_number: `ADM-${Math.floor(1000 + Math.random() * 9000)}`,
      chest_number: '',
      student_name: '',
      gender: 'male',
      class: 'Senior',
      division: 'Class 10',
      team: 'nayro',
      phone: '',
      photo_url: '',
      status: 'active',
    });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      student_id: student.student_id,
      admission_number: student.admission_number,
      chest_number: student.chest_number,
      student_name: student.student_name,
      gender: student.gender,
      class: student.class,
      division: student.division,
      team: student.team,
      phone: student.phone,
      photo_url: student.photo_url || '',
      status: student.status,
    });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.student_name.trim()) {
      setFormError('Student name is required');
      return;
    }
    if (!formData.chest_number.trim()) {
      setFormError('Chest number is required');
      return;
    }

    if (editingStudent) {
      updateStudent(editingStudent.id, formData);
      setIsAddModalOpen(false);
    } else {
      const result = addStudent(formData);
      if (result.success) {
        setIsAddModalOpen(false);
      } else {
        setFormError(result.error || 'Failed to add student');
      }
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const dataUrl = loadEvt.target?.result as string;
        setFormData(prev => ({ ...prev, photo_url: dataUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Sample CSV generator for Students
  const handleDownloadSampleCsv = () => {
    const headers = [
      'student_id',
      'admission_number',
      'chest_number',
      'student_name',
      'gender',
      'class',
      'division',
      'team',
      'phone',
      'photo_url',
      'status'
    ];
    const sampleRows = [
      'ISIA-2026-050,ADM-5050,201,Anas Mansoor,male,Senior,Plus Two A,nayro,+91 98470 50001,,active',
      'ISIA-2026-051,ADM-5051,202,Mubashir Ali,male,Hifz,Division 1,zayro,+91 98470 50002,,active',
      'ISIA-2026-052,ADM-5052,203,Salman Faris,male,Junior,Class 8,lucero,+91 98470 50003,,active',
    ];
    const csvData = [headers.join(','), ...sampleRows].join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_students_import.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse and validate uploaded CSV
  const parseCSV = (text: string) => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) {
      setBulkValidationErrors(['CSV file must contain a header row and at least one student data row.']);
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const validTeams: TeamId[] = ['nayro', 'zayro', 'lucero'];
    const rows: any[] = [];
    const errors: string[] = [];

    const existingChestSet = new Set(students.map(s => s.chest_number.trim().toLowerCase()));
    const existingIdSet = new Set(students.map(s => s.student_id.trim().toLowerCase()));
    const currentFileChests = new Set<string>();
    const currentFileIds = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle simple CSV splitting
      const values = line.split(',').map(v => v.trim());
      const rowObj: any = {};
      headers.forEach((h, idx) => {
        rowObj[h] = values[idx] || '';
      });

      const chest = rowObj.chest_number;
      const sId = rowObj.student_id;
      const team = rowObj.team?.toLowerCase() as TeamId;

      // Validations
      if (!chest) errors.push(`Row ${i}: Missing chest number`);
      if (!sId) errors.push(`Row ${i}: Missing student ID`);
      if (!rowObj.student_name) errors.push(`Row ${i}: Missing student name`);

      if (!validTeams.includes(team)) {
        errors.push(`Row ${i}: Invalid team "${rowObj.team}". Must be NAYRO, ZAYRO, or LUCERO.`);
      }

      if (chest && (existingChestSet.has(chest.toLowerCase()) || currentFileChests.has(chest.toLowerCase()))) {
        errors.push(`Row ${i}: Duplicate Chest Number "${chest}". Must be globally unique.`);
      } else if (chest) {
        currentFileChests.add(chest.toLowerCase());
      }

      if (sId && (existingIdSet.has(sId.toLowerCase()) || currentFileIds.has(sId.toLowerCase()))) {
        errors.push(`Row ${i}: Duplicate Student ID "${sId}". Must be unique.`);
      } else if (sId) {
        currentFileIds.add(sId.toLowerCase());
      }

      rows.push(rowObj);
    }

    setParsedRows(rows);
    setBulkValidationErrors(errors);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const text = loadEvt.target?.result as string;
        setCsvContent(text);
        parseCSV(text);
      };
      reader.readAsText(file);
    }
  };

  const handleConfirmBulkImport = () => {
    if (parsedRows.length === 0) return;
    const formattedStudents: Omit<Student, 'id'>[] = parsedRows.map(r => ({
      student_id: r.student_id,
      admission_number: r.admission_number || `ADM-${Math.floor(1000 + Math.random() * 9000)}`,
      chest_number: r.chest_number,
      student_name: r.student_name,
      gender: r.gender?.toLowerCase() === 'female' ? 'female' : 'male',
      class: r.class || 'General',
      division: r.division || 'A',
      team: (r.team?.toLowerCase() as TeamId) || 'nayro',
      phone: r.phone || '',
      photo_url: r.photo_url || '',
      status: r.status === 'inactive' ? 'inactive' : 'active',
    }));

    const result = bulkImportStudents(formattedStudents);
    setBulkSuccessMsg(`Successfully imported ${result.successCount} valid student records.`);
    setTimeout(() => {
      setIsBulkModalOpen(false);
      setBulkSuccessMsg(null);
      setParsedRows([]);
      setBulkValidationErrors([]);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-white flex items-center gap-2">
            <Users size={22} className="text-amber-400" />
            <span>Student Management & Roster</span>
          </h2>
          <p className="text-xs text-slate-400">
            Total {students.length} students enrolled across Nayro, Zayro, and Lucero.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {students.length > 0 && (
            <button
              onClick={() => setDeleteModal({ isOpen: true, mode: 'all', count: students.length })}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-semibold transition cursor-pointer"
              title="Delete all students from roster"
            >
              <Trash2 size={14} />
              <span>Clear All</span>
            </button>
          )}

          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/30 text-xs font-bold transition cursor-pointer"
          >
            <Upload size={15} />
            <span>Bulk Import (CSV)</span>
          </button>

          <input 
            type="file" 
            multiple 
            ref={photoInputRef} 
            className="hidden" 
            onChange={handleBulkPhotoUpload} 
          />
          <button 
            onClick={() => photoInputRef.current?.click()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-900/50 hover:bg-blue-800 text-blue-200 border border-blue-400/30 text-xs font-bold transition cursor-pointer"
          >
            <Camera size={15} />
            <span>Bulk Photos</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 text-xs font-bold transition shadow cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Bulk Selection Action Bar */}
      {selectedIds.size > 0 && (
        <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2 text-rose-200 text-xs font-semibold">
            <span className="w-6 h-6 rounded-full bg-rose-500/30 flex items-center justify-center font-bold text-[11px] text-rose-300">
              {selectedIds.size}
            </span>
            <span>Students selected for batch operation</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const allVisible = new Set(filteredStudents.map(s => s.id));
                setSelectedIds(allVisible);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-white text-xs font-medium transition"
            >
              Select All Visible ({filteredStudents.length})
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-white text-xs font-medium transition"
            >
              Clear Selection
            </button>
            <button
              onClick={() => setDeleteModal({ isOpen: true, mode: 'selected', count: selectedIds.size })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow"
            >
              <Trash2 size={13} />
              <span>Delete Selected ({selectedIds.size})</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, chest number, student ID..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-amber-400 ml-1" />
          <select
            value={filterTeam}
            onChange={e => setFilterTeam(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Teams (Nayro, Zayro, Lucero)</option>
            <option value="nayro">NAYRO</option>
            <option value="zayro">ZAYRO</option>
            <option value="lucero">LUCERO</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
            <tr>
              <th className="p-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={filteredStudents.length > 0 && filteredStudents.every(s => selectedIds.has(s.id))}
                  onChange={(e) => {
                    if (e.target.checked) {
                      const newSet = new Set(selectedIds);
                      filteredStudents.forEach(s => newSet.add(s.id));
                      setSelectedIds(newSet);
                    } else {
                      const newSet = new Set(selectedIds);
                      filteredStudents.forEach(s => newSet.delete(s.id));
                      setSelectedIds(newSet);
                    }
                  }}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                />
              </th>
              <th className="px-4 py-3">Photo & Name</th>
              <th className="px-4 py-3">Chest #</th>
              <th className="px-4 py-3">Student ID</th>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3">Class & Div</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  No students matched the search criteria.
                </td>
              </tr>
            ) : (
              filteredStudents.map(student => {
                const isSelected = selectedIds.has(student.id);
                return (
                  <tr key={student.id} className={`transition ${isSelected ? 'bg-amber-500/10 hover:bg-amber-500/15' : 'hover:bg-slate-800/30'}`}>
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const newSet = new Set(selectedIds);
                          if (e.target.checked) newSet.add(student.id);
                          else newSet.delete(student.id);
                          setSelectedIds(newSet);
                        }}
                        className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                          {student.photo_url ? (
                            <img src={student.photo_url} alt={student.student_name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-slate-400">{student.student_name.slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-white block">{student.student_name}</span>
                          <span className="text-[10px] text-slate-500">{student.gender} • {student.phone || 'No phone'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-amber-300">
                      #{student.chest_number}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">
                      {student.student_id}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        student.team === 'nayro' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' :
                        student.team === 'zayro' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      }`}>
                        {student.team}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>{student.class}</div>
                      <div className="text-[10px] text-slate-500">{student.division}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        student.status === 'active' ? 'bg-emerald-950/60 text-emerald-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(student)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 transition"
                          title="Edit Student"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, mode: 'single', student })}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/80 text-slate-300 hover:text-rose-400 transition"
                          title="Delete Student"
                        >
                          <Trash2 size={14} />
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

      {/* Add / Edit Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg p-6 rounded-3xl glass-panel-gold border border-amber-500/40 text-slate-100 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-heading text-lg font-bold text-amber-200">
                {editingStudent ? 'Edit Student Details' : 'Register New Student'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-950/70 border border-rose-600 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveStudent} className="space-y-4">
              {/* Photo Upload & Preview */}
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="relative w-16 h-16 rounded-xl bg-slate-800 border border-amber-400/30 overflow-hidden flex items-center justify-center shrink-0">
                  {formData.photo_url ? (
                    <img src={formData.photo_url} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={20} className="text-slate-500" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Student Photo</label>
                  <input
                    type="file"
                    ref={photoInputRef}
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handlePhotoUpload}
                    className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500/20 file:text-amber-300 hover:file:bg-amber-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Chest Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.chest_number}
                    onChange={e => setFormData(prev => ({ ...prev, chest_number: e.target.value }))}
                    placeholder="e.g. 115"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Student ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.student_id}
                    onChange={e => setFormData(prev => ({ ...prev, student_id: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Student Name *</label>
                <input
                  type="text"
                  required
                  value={formData.student_name}
                  onChange={e => setFormData(prev => ({ ...prev, student_name: e.target.value }))}
                  placeholder="e.g. Salmanul Farisi"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Team *</label>
                  <select
                    value={formData.team}
                    onChange={e => setFormData(prev => ({ ...prev, team: e.target.value as TeamId }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                  >
                    <option value="nayro">NAYRO (🛡️)</option>
                    <option value="zayro">ZAYRO (👑)</option>
                    <option value="lucero">LUCERO (⚡)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Class</label>
                  <input
                    type="text"
                    value={formData.class}
                    onChange={e => setFormData(prev => ({ ...prev, class: e.target.value }))}
                    placeholder="e.g. Senior, Hifz, Junior"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Division</label>
                  <input
                    type="text"
                    value={formData.division}
                    onChange={e => setFormData(prev => ({ ...prev, division: e.target.value }))}
                    placeholder="e.g. Plus Two A"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Admission No</label>
                  <input
                    type="text"
                    value={formData.admission_number}
                    onChange={e => setFormData(prev => ({ ...prev, admission_number: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-bold shadow"
                >
                  {editingStudent ? 'Save Changes' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import CSV Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-2xl p-6 rounded-3xl glass-panel-gold border border-amber-500/40 text-slate-100 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Upload size={18} className="text-amber-400" />
                <h3 className="font-heading text-lg font-bold text-amber-200">
                  Bulk Student Import (CSV / XLSX)
                </h3>
              </div>
              <button onClick={() => setIsBulkModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {bulkSuccessMsg && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle size={16} />
                <span>{bulkSuccessMsg}</span>
              </div>
            )}

            {/* Instruction & Sample Download */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-200 block mb-0.5">Import Schema Requirements</span>
                <p className="text-[11px] text-slate-400">
                  Required columns: <code>student_id, admission_number, chest_number, student_name, team, class, division</code>
                </p>
              </div>
              <button
                onClick={handleDownloadSampleCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-xs font-bold shrink-0 transition"
              >
                <Download size={14} />
                <span>Download Sample CSV</span>
              </button>
            </div>

            {/* File Upload Area */}
            <div className="border-2 border-dashed border-slate-700 hover:border-amber-400/60 rounded-2xl p-6 text-center bg-slate-950/60 mb-4 transition">
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csvFileInput"
              />
              <label htmlFor="csvFileInput" className="cursor-pointer flex flex-col items-center justify-center">
                <Upload size={32} className="text-amber-400 mb-2" />
                <span className="text-xs font-bold text-slate-200 mb-1">Click to select or drag & drop CSV file</span>
                <span className="text-[11px] text-slate-500">Supports standard UTF-8 CSV exports</span>
              </label>
            </div>

            {/* Validation Errors Box (Strict Validation) */}
            {bulkValidationErrors.length > 0 && (
              <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-600/50 text-rose-200 mb-4">
                <div className="flex items-center gap-2 font-bold text-xs mb-2">
                  <AlertCircle size={16} className="text-rose-400" />
                  <span>Validation Issues Detected ({bulkValidationErrors.length} issues)</span>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1 text-[11px] font-mono text-rose-300">
                  {bulkValidationErrors.map((err, i) => (
                    <div key={i}>• {err}</div>
                  ))}
                </div>
                <p className="text-[10px] text-rose-400/80 mt-2 italic">
                  * Invalid data will NOT be silently imported. Please fix duplicate chest numbers, missing IDs, or invalid team names.
                </p>
              </div>
            )}

            {/* Preview Table */}
            {parsedRows.length > 0 && (
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-bold">Preview Records ({parsedRows.length} rows detected)</span>
                  {bulkValidationErrors.length === 0 ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle size={13} />
                      <span>All rows valid</span>
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold">Please correct errors</span>
                  )}
                </div>

                <div className="overflow-x-auto max-h-48 rounded-xl border border-slate-800 text-[11px]">
                  <table className="w-full text-left bg-slate-900">
                    <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800">
                      <tr>
                        <th className="p-2">Chest #</th>
                        <th className="p-2">Student ID</th>
                        <th className="p-2">Name</th>
                        <th className="p-2">Team</th>
                        <th className="p-2">Class</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {parsedRows.slice(0, 8).map((row, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-mono text-amber-300 font-bold">#{row.chest_number}</td>
                          <td className="p-2 font-mono">{row.student_id}</td>
                          <td className="p-2 font-semibold text-white">{row.student_name}</td>
                          <td className="p-2 uppercase">{row.team}</td>
                          <td className="p-2">{row.class}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Confirm Import Button */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                disabled={parsedRows.length === 0 || bulkValidationErrors.length > 0}
                onClick={handleConfirmBulkImport}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 text-white text-xs font-bold shadow disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Confirm & Import Valid Records
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation In-App Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-rose-500/40 text-slate-100 shadow-2xl relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>

            <h3 className="font-heading text-lg font-bold text-white mb-2">
              {deleteModal.mode === 'single' && 'Delete Student Record'}
              {deleteModal.mode === 'selected' && `Delete ${deleteModal.count} Selected Students`}
              {deleteModal.mode === 'all' && 'Clear All Student Data'}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {deleteModal.mode === 'single' && (
                <>
                  Are you sure you want to permanently delete student{' '}
                  <strong className="text-white">{deleteModal.student?.student_name}</strong>{' '}
                  (Chest <span className="text-amber-300 font-mono font-bold">#{deleteModal.student?.chest_number}</span>,{' '}
                  Team <span className="uppercase text-amber-300 font-bold">{deleteModal.student?.team}</span>)?
                  <br />
                  <span className="text-rose-400/90 text-[11px] block mt-1">
                    * This will remove all their registrations, participation records, and associated results.
                  </span>
                </>
              )}
              {deleteModal.mode === 'selected' && (
                <>
                  Are you sure you want to permanently delete{' '}
                  <strong className="text-white">{deleteModal.count} selected students</strong>?
                  <br />
                  <span className="text-rose-400/90 text-[11px] block mt-1">
                    * Their programme entries and results will also be safely detached from the scoreboard.
                  </span>
                </>
              )}
              {deleteModal.mode === 'all' && (
                <>
                  <strong className="text-rose-400 block font-bold text-sm mb-1">
                    ⚠️ Permanent Action: Clear Entire Student Roster
                  </strong>
                  Are you sure you want to delete <strong className="text-white">ALL {students.length} students</strong>?
                  This action cannot be undone and will purge all student profiles, registrations, and results.
                </>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, mode: 'single' })}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteModal.mode === 'single' && deleteModal.student) {
                    deleteStudent(deleteModal.student.id);
                    setSelectedIds(prev => {
                      const next = new Set(prev);
                      next.delete(deleteModal.student!.id);
                      return next;
                    });
                  } else if (deleteModal.mode === 'selected') {
                    deleteMultipleStudents(Array.from(selectedIds));
                    setSelectedIds(new Set());
                  } else if (deleteModal.mode === 'all') {
                    deleteAllStudents();
                    setSelectedIds(new Set());
                  }
                  setDeleteModal({ isOpen: false, mode: 'single' });
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-900/30 flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
