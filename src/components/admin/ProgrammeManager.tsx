import React, { useState, useRef } from 'react';
import { 
  Calendar, 
  Upload, 
  Download, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  AlertCircle, 
  X, 
  MapPin, 
  Award, 
  Clock,
  Clipboard,
  FileText,
  Sparkles,
  Layers,
  HelpCircle,
  Check,
  Lock,
  Unlock
} from 'lucide-react';
import { useFest } from '../../context/FestContext';
import { Programme, EventCategory, EventType, JudgingCriterion } from '../../types';

export const ProgrammeManager: React.FC = () => {
  const { 
    programmes, 
    categories, 
    judges, 
    festSettings,
    updateFestSettings,
    addProgramme, 
    updateProgramme, 
    deleteProgramme, 
    deleteMultipleProgrammes, 
    deleteAllProgrammes, 
    bulkImportProgrammes 
  } = useFest();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingProgramme, setEditingProgramme] = useState<Programme | null>(null);

  // Selection & Deletion State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    mode: 'single' | 'selected' | 'all';
    programme?: Programme;
    count?: number;
  }>({ isOpen: false, mode: 'single' });

  // Single Form State
  const [formData, setFormData] = useState<Omit<Programme, 'id'>>({
    programme_code: '',
    programme_name: '',
    programme_name_ml: '',
    category: 'SENIOR',
    type: 'stage',
    section: 'individual',
    maximum_marks: 100,
    venue: 'Main Auditorium (Imam Shafi Hall)',
    scheduled_date: '2026-10-15',
    scheduled_time: '10:00 AM',
    status: 'scheduled',
    judge_id: judges[0]?.id || '',
    criteria: [
      { id: 'crit_1', name: 'Content & Accuracy', maxMarks: 30 },
      { id: 'crit_2', name: 'Presentation & Delivery', maxMarks: 30 },
      { id: 'crit_3', name: 'Language & Pronunciation', maxMarks: 20 },
      { id: 'crit_4', name: 'Stage Presence', maxMarks: 20 },
    ],
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Bulk State
  const [activeBulkTab, setActiveBulkTab] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState<string>('');
  const [duplicateAction, setDuplicateAction] = useState<'rename' | 'overwrite' | 'skip'>('rename');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [bulkValidationErrors, setBulkValidationErrors] = useState<string[]>([]);
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProgrammes = programmes.filter(p => {
    const matchesSearch = 
      p.programme_name.toLowerCase().includes(search.toLowerCase()) ||
      p.programme_code.toLowerCase().includes(search.toLowerCase()) ||
      p.venue.toLowerCase().includes(search.toLowerCase());
    
    // Updated filtering logic for Category and Stage/Non-Stage
    const matchesCat = filterCategory === 'all' || p.category === filterCategory;
    
    // Handle Stage/Non-Stage Filter
    let matchesType = true;
    if (filterType !== 'all') {
      if (filterType === 'stage') {
        matchesType = p.type === 'stage';
      } else if (filterType === 'non_stage') {
        matchesType = p.type === 'non_stage' || p.type === 'off_stage';
      }
    }
    
    return matchesSearch && matchesCat && matchesType;
  });


  const handleOpenAdd = () => {
    setEditingProgramme(null);
    setFormData({
      programme_code: `EVT-${Math.floor(100 + Math.random() * 900)}`,
      programme_name: '',
      programme_name_ml: '',
      category: 'SENIOR',
      type: 'stage',
      section: 'individual',
      maximum_marks: 100,
      venue: 'Main Auditorium',
      scheduled_date: '2026-10-15',
      scheduled_time: '11:00 AM',
      status: 'scheduled',
      judge_id: judges[0]?.id || '',
      criteria: [
        { id: 'crit_1', name: 'Content & Subject Command', maxMarks: 30 },
        { id: 'crit_2', name: 'Presentation & Fluency', maxMarks: 30 },
        { id: 'crit_3', name: 'Language & Grammar', maxMarks: 20 },
        { id: 'crit_4', name: 'Creativity & Impact', maxMarks: 20 },
      ],
    });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (p: Programme) => {
    setEditingProgramme(p);
    setFormData({
      programme_code: p.programme_code,
      programme_name: p.programme_name,
      programme_name_ml: p.programme_name_ml || '',
      category: p.category,
      type: p.type,
      section: p.section,
      maximum_marks: p.maximum_marks,
      venue: p.venue,
      scheduled_date: p.scheduled_date,
      scheduled_time: p.scheduled_time,
      status: p.status,
      judge_id: p.judge_id || '',
      criteria: p.criteria || [],
    });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleSaveProgramme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.programme_name.trim()) {
      setFormError('Programme name is required');
      return;
    }
    if (!formData.programme_code.trim()) {
      setFormError('Programme code is required');
      return;
    }

    if (editingProgramme) {
      updateProgramme(editingProgramme.id, formData);
      setIsAddModalOpen(false);
    } else {
      const result = addProgramme(formData);
      if (result.success) {
        setIsAddModalOpen(false);
      } else {
        setFormError(result.error || 'Failed to add programme');
      }
    }
  };

  // Sample CSV Data template for Programmes
  const SAMPLE_PROGRAMMES_CSV = `programme_code,programme_name,programme_name_ml,category,type,section,maximum_marks,venue,scheduled_date,scheduled_time
EVT-301,Qur'an Recitation (Hifz),ഹിഫ്സ് പാരായണം,HIFZ,stage,individual,100,Main Stage (Imam Shafi Hall),2026-10-15,09:00 AM
EVT-302,Daff Muttu (Senior),ദഫ് മുട്ട്,SENIOR,stage,group,100,Open Ground Stage,2026-10-15,02:30 PM
EVT-303,Arabic Essay Writing,അറബിക് ഉപന്യാസം,SENIOR,non_stage,individual,50,Exam Hall B,2026-10-15,10:00 AM
EVT-304,Malayalam Elocution,മലയാള പ്രസംഗം,JUNIOR,stage,individual,100,Mini Auditorium,2026-10-16,11:00 AM
EVT-305,English Debate,ഇംഗ്ലീഷ് സംവാദം,GENERAL,stage,group,100,Conference Hall,2026-10-16,03:00 PM
EVT-306,Calligraphy Contest,കാലിഗ്രാഫി മത്സരം,SUB_JUNIOR,non_stage,individual,50,Art Studio,2026-10-16,09:30 AM`;

  // Sample CSV generator for Programmes with UTF-8 BOM for Excel compatibility
  const handleDownloadSampleCsv = () => {
    const blob = new Blob(['\uFEFF' + SAMPLE_PROGRAMMES_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_programmes_import.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Load sample data directly into the parser/paste area for 1-click test
  const handleLoadSampleData = () => {
    setPastedText(SAMPLE_PROGRAMMES_CSV);
    robustParseProgrammes(SAMPLE_PROGRAMMES_CSV);
  };

  // Robust multi-format parser supporting CSV, TSV (Excel paste), Semicolon, and quoted fields
  const robustParseProgrammes = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      setParsedRows([]);
      setBulkValidationErrors(['No data detected. Please paste text or choose a file.']);
      return;
    }

    const rawLines = trimmed.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (rawLines.length === 0) {
      setParsedRows([]);
      setBulkValidationErrors(['The uploaded file or text is empty.']);
      return;
    }

    // Delimiter Auto-Detection: Tab (Excel paste) vs Semicolon vs Comma
    const firstLine = rawLines[0];
    let delimiter = ',';
    if (firstLine.includes('\t')) {
      delimiter = '\t';
    } else if (firstLine.includes(';') && !firstLine.includes(',')) {
      delimiter = ';';
    }

    // Split line properly respecting quotes
    const parseLine = (line: string, delim: string): string[] => {
      if (delim === '\t') {
        return line.split('\t').map(v => v.trim().replace(/^["']|["']$/g, ''));
      }
      const tokens: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delim && !inQuotes) {
          tokens.push(current.trim().replace(/^["']|["']$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      tokens.push(current.trim().replace(/^["']|["']$/g, ''));
      return tokens;
    };

    const firstRowTokens = parseLine(firstLine, delimiter).map(t => t.toLowerCase().replace(/[^a-z0-9]/g, ''));
    
    // Check if the first row is a header row
    const isHeaderRow = firstRowTokens.some(t => 
      ['code', 'programme', 'program', 'name', 'event', 'category', 'cat', 'venue', 'type', 'item', 'marks', 'section'].includes(t)
    );

    const headerMap: { [key: string]: number } = {};
    let startIndex = 0;

    if (isHeaderRow) {
      startIndex = 1;
      firstRowTokens.forEach((token, idx) => {
        if (/^(code|eventcode|programmecode|programcode|itemcode|slno|sl|no|id)$/.test(token)) {
          headerMap['code'] = idx;
        } else if (/^(name|programmename|programname|eventname|itemname|title|item)$/.test(token)) {
          headerMap['name'] = idx;
        } else if (/^(malayalam|nameml|programmenameml|malayalamname|mlname|ml)$/.test(token)) {
          headerMap['name_ml'] = idx;
        } else if (/^(category|cat|catcode|class|group)$/.test(token)) {
          headerMap['category'] = idx;
        } else if (/^(type|eventtype|stagetype|stage)$/.test(token)) {
          headerMap['type'] = idx;
        } else if (/^(section|groupindividual|individualgroup|format|participation)$/.test(token)) {
          headerMap['section'] = idx;
        } else if (/^(marks|maximummarks|maxmarks|score|points)$/.test(token)) {
          headerMap['marks'] = idx;
        } else if (/^(venue|location|place|auditorium|stagename)$/.test(token)) {
          headerMap['venue'] = idx;
        } else if (/^(date|scheduleddate|day)$/.test(token)) {
          headerMap['date'] = idx;
        } else if (/^(time|scheduledtime|timing)$/.test(token)) {
          headerMap['time'] = idx;
        }
      });
    } else {
      // Positional defaults if no headers detected:
      // Col 0: Code, Col 1: Name, Col 2: Name ML, Col 3: Category, Col 4: Type, Col 5: Section, Col 6: Marks, Col 7: Venue, Col 8: Date, Col 9: Time
      startIndex = 0;
      headerMap['code'] = 0;
      headerMap['name'] = 1;
      headerMap['name_ml'] = 2;
      headerMap['category'] = 3;
      headerMap['type'] = 4;
      headerMap['section'] = 5;
      headerMap['marks'] = 6;
      headerMap['venue'] = 7;
      headerMap['date'] = 8;
      headerMap['time'] = 9;
    }

    const existingCodeSet = new Set(programmes.map(p => p.programme_code.trim().toLowerCase()));
    const seenCodesInBatch = new Set<string>();
    const rows: any[] = [];
    const errors: string[] = [];
    let autoCodeCounter = 100 + programmes.length + 1;

    for (let i = startIndex; i < rawLines.length; i++) {
      const line = rawLines[i];
      if (!line) continue;
      const values = parseLine(line, delimiter);
      if (values.every(v => !v)) continue; // skip completely empty rows

      const rowNum = i + 1;
      let rawCode = headerMap['code'] !== undefined ? values[headerMap['code']] : '';
      let rawName = headerMap['name'] !== undefined ? values[headerMap['name']] : '';

      // If user pasted without headers and row only has 1 or 2 columns
      if (!rawName && values[0] && !isHeaderRow) {
        if (values.length === 1) {
          rawName = values[0];
        } else if (/^(evt|prg|\d+)/i.test(values[0])) {
          rawCode = values[0];
          rawName = values[1] || '';
        } else {
          rawName = values[0];
        }
      }

      if (!rawName) {
        errors.push(`Row ${rowNum}: Skipped because programme name was missing.`);
        continue;
      }

      // Auto-assign unique code if missing
      let autoAssignedCode = false;
      if (!rawCode) {
        rawCode = `EVT-${autoCodeCounter++}`;
        autoAssignedCode = true;
      }

      let code = rawCode.trim().toUpperCase();

      // Check if duplicate in batch
      if (seenCodesInBatch.has(code.toLowerCase())) {
        let suffix = 1;
        while (seenCodesInBatch.has(`${code}-${suffix}`.toLowerCase())) {
          suffix++;
        }
        code = `${code}-${suffix}`;
      }
      seenCodesInBatch.add(code.toLowerCase());

      const isExisting = existingCodeSet.has(code.toLowerCase());

      const nameMl = headerMap['name_ml'] !== undefined ? values[headerMap['name_ml']] : '';
      
      // Category Normalization
      let cat = headerMap['category'] !== undefined ? values[headerMap['category']]?.toUpperCase() : '';
      if (!cat) cat = 'GENERAL';
      if (cat.includes('SUB') || (cat.includes('JUNIOR') && cat.includes('SUB'))) {
        cat = 'SUB_JUNIOR';
      } else if (cat.includes('JUN')) {
        cat = 'JUNIOR';
      } else if (cat.includes('SEN')) {
        cat = 'SENIOR';
      } else if (cat.includes('HIF')) {
        cat = 'HIFZ';
      } else if (cat.includes('GEN')) {
        cat = 'GENERAL';
      } else {
        const matched = categories.find(c => c.code.toUpperCase() === cat || c.name.toUpperCase() === cat);
        cat = matched ? matched.code : 'GENERAL';
      }

      // Type Normalization (Stage vs Non-Stage)
      const rawType = (headerMap['type'] !== undefined ? values[headerMap['type']] : '')?.toLowerCase();
      let type: EventType = 'stage';
      if (rawType.includes('non') || rawType.includes('off') || rawType.includes('writ') || rawType.includes('exam')) {
        type = 'non_stage';
      } else {
        type = 'stage';
      }

      // Section Normalization (Individual vs Group)
      const rawSec = (headerMap['section'] !== undefined ? values[headerMap['section']] : '')?.toLowerCase();
      const section: 'individual' | 'group' = (rawSec.includes('group') || rawSec.includes('team') || rawSec.includes('grp')) ? 'group' : 'individual';

      const marks = headerMap['marks'] !== undefined ? Number(values[headerMap['marks']]) || 100 : 100;
      const venue = headerMap['venue'] !== undefined && values[headerMap['venue']] ? values[headerMap['venue']] : 'Main Auditorium';
      const scheduled_date = headerMap['date'] !== undefined && values[headerMap['date']] ? values[headerMap['date']] : '2026-10-15';
      const scheduled_time = headerMap['time'] !== undefined && values[headerMap['time']] ? values[headerMap['time']] : '10:00 AM';

      rows.push({
        rowNum,
        programme_code: code,
        programme_name: rawName,
        programme_name_ml: nameMl,
        category: cat,
        type,
        section,
        maximum_marks: marks,
        venue,
        scheduled_date,
        scheduled_time,
        isExisting,
        autoAssignedCode
      });
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
        setPastedText(text);
        robustParseProgrammes(text);
      };
      reader.readAsText(file);
      // Reset input value so selecting the same file again triggers onChange
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const text = loadEvt.target?.result as string;
        setPastedText(text);
        robustParseProgrammes(text);
      };
      reader.readAsText(file);
    }
  };

  const handleConfirmBulkImport = () => {
    if (parsedRows.length === 0) return;

    // Filter rows based on duplicateAction
    let rowsToImport = [...parsedRows];
    if (duplicateAction === 'skip') {
      rowsToImport = rowsToImport.filter(r => !r.isExisting);
    }

    if (rowsToImport.length === 0) {
      setBulkValidationErrors(['All events in this batch are duplicates and duplicate action is set to Skip.']);
      return;
    }

    const formatted: Omit<Programme, 'id'>[] = rowsToImport.map(r => ({
      programme_code: r.programme_code,
      programme_name: r.programme_name,
      programme_name_ml: r.programme_name_ml || '',
      category: (r.category?.toUpperCase() as EventCategory) || 'GENERAL',
      type: (r.type?.toLowerCase() as EventType) || 'stage',
      section: r.section?.toLowerCase() === 'group' ? 'group' : 'individual',
      maximum_marks: Number(r.maximum_marks) || 100,
      venue: r.venue || 'Main Auditorium',
      scheduled_date: r.scheduled_date || '2026-10-15',
      scheduled_time: r.scheduled_time || '10:00 AM',
      status: 'scheduled',
      judge_id: judges[0]?.id || '',
      criteria: [
        { id: 'crit_1', name: 'Presentation & Skill', maxMarks: 40 },
        { id: 'crit_2', name: 'Content & Expression', maxMarks: 30 },
        { id: 'crit_3', name: 'Overall Impression', maxMarks: 30 },
      ],
    }));

    const result = bulkImportProgrammes(formatted, {
      overwriteDuplicates: duplicateAction === 'overwrite',
      autoRenameDuplicates: duplicateAction === 'rename',
    });

    let msg = `Successfully imported ${result.successCount} events`;
    if (result.updatedCount && result.updatedCount > 0) {
      msg += ` (${result.updatedCount} updated)`;
    }
    setBulkSuccessMsg(msg + '!');

    setTimeout(() => {
      setIsBulkModalOpen(false);
      setBulkSuccessMsg(null);
      setParsedRows([]);
      setBulkValidationErrors([]);
      setPastedText('');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-white flex items-center gap-2">
            <Calendar size={22} className="text-amber-400" />
            <span>Arts Fest Programmes & Events</span>
          </h2>
          <p className="text-xs text-slate-400">
            {programmes.length} total events organized across Stage & Non-Stage categories.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {/* Quick Registration Portal Lock Toggle */}
          <button
            onClick={() => {
              const newLocked = !festSettings.registration_locked;
              updateFestSettings({
                ...festSettings,
                registration_locked: newLocked
              });
            }}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
              festSettings.registration_locked
                ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40'
                : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
            }`}
            title={festSettings.registration_locked ? 'Click to Unlock Portal for Teams' : 'Click to Lock Registration for Teams'}
          >
            {festSettings.registration_locked ? <Lock size={14} className="text-rose-400" /> : <Unlock size={14} className="text-emerald-400" />}
            <span>{festSettings.registration_locked ? 'Portal: Locked' : 'Portal: Open'}</span>
          </button>

          {programmes.length > 0 && (
            <button
              onClick={() => setDeleteModal({ isOpen: true, mode: 'all', count: programmes.length })}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-semibold transition cursor-pointer"
              title="Delete all programmes from fest"
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
            <span>Bulk Import Events</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 text-xs font-bold transition shadow cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Programme</span>
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
            <span>Programmes selected for batch deletion</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const allVisible = new Set(filteredProgrammes.map(p => p.id));
                setSelectedIds(allVisible);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-white text-xs font-medium transition"
            >
              Select All Visible ({filteredProgrammes.length})
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
            placeholder="Search programme name, code, venue..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-amber-400 ml-1" />
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Types</option>
            <option value="stage">Stage</option>
            <option value="non_stage">Non-Stage</option>
          </select>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Programmes Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
            <tr>
              <th className="p-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={filteredProgrammes.length > 0 && filteredProgrammes.every(p => selectedIds.has(p.id))}
                  onChange={(e) => {
                    if (e.target.checked) {
                      const newSet = new Set(selectedIds);
                      filteredProgrammes.forEach(p => newSet.add(p.id));
                      setSelectedIds(newSet);
                    } else {
                      const newSet = new Set(selectedIds);
                      filteredProgrammes.forEach(p => newSet.delete(p.id));
                      setSelectedIds(newSet);
                    }
                  }}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                />
              </th>
              <th className="px-4 py-3">Code & Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Type & Section</th>
              <th className="px-4 py-3">Venue & Schedule</th>
              <th className="px-4 py-3">Assigned Judge</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredProgrammes.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  No programmes found matching search criteria.
                </td>
              </tr>
            ) : (
              filteredProgrammes.map(p => {
                const assignedJudge = judges.find(j => j.id === p.judge_id);
                const isSelected = selectedIds.has(p.id);
                return (
                  <tr key={p.id} className={`transition ${isSelected ? 'bg-amber-500/10 hover:bg-amber-500/15' : 'hover:bg-slate-800/30'}`}>
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const newSet = new Set(selectedIds);
                          if (e.target.checked) newSet.add(p.id);
                          else newSet.delete(p.id);
                          setSelectedIds(newSet);
                        }}
                        className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-amber-300 font-bold block">{p.programme_code}</span>
                      <span className="font-bold text-white text-sm">{p.programme_name}</span>
                      {p.programme_name_ml && <span className="text-[11px] text-slate-400 block">{p.programme_name_ml}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-semibold text-[10px]">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="uppercase font-semibold text-slate-300">{p.type}</div>
                      <div className="text-[10px] text-slate-500 capitalize">{p.section}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-slate-300">
                        <MapPin size={12} className="text-amber-400" />
                        <span>{p.venue}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                        <Clock size={11} />
                        <span>{p.scheduled_date} • {p.scheduled_time}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {assignedJudge ? (
                        <span className="text-amber-200 font-semibold">{assignedJudge.name}</span>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        p.status === 'published' ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/30' :
                        p.status === 'ongoing' ? 'bg-amber-950 text-amber-300 border border-amber-600/30' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 transition"
                          title="Edit Programme"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, mode: 'single', programme: p })}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/80 text-slate-300 hover:text-rose-400 transition"
                          title="Delete Programme"
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

      {/* Add / Edit Programme Modal with Criteria Config */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-xl p-6 rounded-3xl glass-panel-gold border border-amber-500/40 text-slate-100 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-heading text-lg font-bold text-amber-200">
                {editingProgramme ? 'Edit Programme Details' : 'Create New Event'}
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

            <form onSubmit={handleSaveProgramme} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.programme_code}
                    onChange={e => setFormData(prev => ({ ...prev, programme_code: e.target.value }))}
                    placeholder="e.g. EVT-105"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value as EventCategory }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Programme Name (English) *</label>
                <input
                  type="text"
                  required
                  value={formData.programme_name}
                  onChange={e => setFormData(prev => ({ ...prev, programme_name: e.target.value }))}
                  placeholder="e.g. Qur'an Recitation with Tajweed"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Programme Name (Malayalam)</label>
                <input
                  type="text"
                  value={formData.programme_name_ml}
                  onChange={e => setFormData(prev => ({ ...prev, programme_name_ml: e.target.value }))}
                  placeholder="e.g. ഖുർആൻ പാരായണം"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as EventType }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="stage">Stage Event</option>
                    <option value="non_stage">Non-Stage Event</option>
                    <option value="off_stage">Off-Stage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Section</label>
                  <select
                    value={formData.section}
                    onChange={e => setFormData(prev => ({ ...prev, section: e.target.value as 'individual' | 'group' }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="individual">Individual</option>
                    <option value="group">Group</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Venue</label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={e => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Assign Adjudicator</label>
                  <select
                    value={formData.judge_id}
                    onChange={e => setFormData(prev => ({ ...prev, judge_id: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                  >
                    <option value="">-- Select Judge --</option>
                    {judges.map(j => (
                      <option key={j.id} value={j.id}>{j.name} ({j.specialization})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Judging Criteria Builder */}
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                  <span>Evaluation Criteria ({formData.criteria.length})</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        criteria: [
                          ...prev.criteria,
                          { id: `crit_${Date.now()}`, name: 'New Criterion', maxMarks: 20 }
                        ]
                      }));
                    }}
                    className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[11px]"
                  >
                    <Plus size={13} /> Add Criterion
                  </button>
                </div>

                {formData.criteria.map((crit, index) => (
                  <div key={crit.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={crit.name}
                      onChange={e => {
                        const updated = [...formData.criteria];
                        updated[index].name = e.target.value;
                        setFormData(prev => ({ ...prev, criteria: updated }));
                      }}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200"
                    />
                    <input
                      type="number"
                      value={crit.maxMarks}
                      onChange={e => {
                        const updated = [...formData.criteria];
                        updated[index].maxMarks = Number(e.target.value);
                        setFormData(prev => ({ ...prev, criteria: updated }));
                      }}
                      className="w-16 px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-center font-bold text-amber-300"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = formData.criteria.filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, criteria: updated }));
                      }}
                      className="p-1 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-bold shadow"
                >
                  {editingProgramme ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Events Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-4xl p-5 sm:p-7 rounded-3xl glass-panel-gold border border-amber-500/40 text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <Layers size={22} />
                </div>
                <div>
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-amber-200">
                    Bulk Programme & Event Import
                  </h3>
                  <p className="text-xs text-slate-400">
                    Import schedule from Excel, Google Sheets, or CSV with smart column mapping
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsBulkModalOpen(false);
                  setParsedRows([]);
                  setBulkValidationErrors([]);
                  setPastedText('');
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X size={20} />
              </button>
            </div>

            {bulkSuccessMsg && (
              <div className="mt-4 p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-2.5 shadow-lg animate-fadeIn">
                <CheckCircle size={18} className="text-emerald-400 shrink-0" />
                <span className="font-semibold">{bulkSuccessMsg}</span>
              </div>
            )}

            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {/* Top Mode Selector & Quick Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveBulkTab('upload')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                      activeBulkTab === 'upload'
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Upload size={14} />
                    <span>Upload File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveBulkTab('paste')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                      activeBulkTab === 'paste'
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Clipboard size={14} />
                    <span>Paste Table / Excel</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLoadSampleData}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-400/40 text-xs font-bold transition"
                    title="Load 6 sample programmes to test the bulk import immediately"
                  >
                    <Sparkles size={13} />
                    <span>Load Sample Data</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadSampleCsv}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition"
                    title="Download Excel-compatible template CSV"
                  >
                    <Download size={13} />
                    <span>Template CSV</span>
                  </button>
                </div>
              </div>

              {/* Tab 1: File Upload (CSV, TSV, TXT, Excel CSV) */}
              {activeBulkTab === 'upload' && (
                <div
                  onDragOver={e => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all ${
                    isDragging
                      ? 'border-amber-400 bg-amber-500/10'
                      : 'border-slate-700 hover:border-amber-400/60 bg-slate-950/60'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv,.tsv,.txt,.xlsx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="prgBulkFileInput"
                  />
                  <label htmlFor="prgBulkFileInput" className="cursor-pointer flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 shadow-inner">
                      <Upload size={28} />
                    </div>
                    <span className="text-sm font-bold text-slate-200 mb-1">
                      Choose or Drag & Drop File
                    </span>
                    <span className="text-xs text-slate-400 max-w-sm">
                      Supports CSV, TSV (Tab separated), Excel exported lists, or text files
                    </span>
                  </label>
                </div>
              )}

              {/* Tab 2: Direct Paste (Excel / Google Sheets / Text) */}
              {activeBulkTab === 'paste' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Paste columns directly from Excel or Google Sheets (Tab or comma separated):</span>
                    {pastedText && (
                      <button
                        type="button"
                        onClick={() => {
                          setPastedText('');
                          setParsedRows([]);
                          setBulkValidationErrors([]);
                        }}
                        className="text-rose-400 hover:underline text-[11px]"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={6}
                    value={pastedText}
                    onChange={e => {
                      setPastedText(e.target.value);
                      robustParseProgrammes(e.target.value);
                    }}
                    placeholder={`programme_code\tprogramme_name\tprogramme_name_ml\tcategory\ttype\tsection\tvenue\nEVT-301\tQur'an Recitation\tഹിഫ്സ് പാരായണം\tHIFZ\tstage\tindividual\tMain Stage\nEVT-302\tDaff Muttu\tദഫ് മുട്ട്\tSENIOR\tstage\tgroup\tOpen Ground Stage`}
                    className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => robustParseProgrammes(pastedText)}
                      disabled={!pastedText.trim()}
                      className="px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 disabled:opacity-40 transition"
                    >
                      Process Pasted Text
                    </button>
                  </div>
                </div>
              )}

              {/* Duplicate Handling Configuration */}
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-2">
                <span className="font-bold text-slate-300 block">Existing Event Code Strategy:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-amber-400/40">
                    <input
                      type="radio"
                      name="dupAction"
                      value="rename"
                      checked={duplicateAction === 'rename'}
                      onChange={() => setDuplicateAction('rename')}
                      className="accent-amber-400"
                    />
                    <span className="text-[11px] text-slate-200">
                      <strong>Auto-rename</strong> (e.g. EVT-101-1)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-amber-400/40">
                    <input
                      type="radio"
                      name="dupAction"
                      value="overwrite"
                      checked={duplicateAction === 'overwrite'}
                      onChange={() => setDuplicateAction('overwrite')}
                      className="accent-amber-400"
                    />
                    <span className="text-[11px] text-slate-200">
                      <strong>Overwrite / Update</strong> existing
                    </span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-amber-400/40">
                    <input
                      type="radio"
                      name="dupAction"
                      value="skip"
                      checked={duplicateAction === 'skip'}
                      onChange={() => setDuplicateAction('skip')}
                      className="accent-amber-400"
                    />
                    <span className="text-[11px] text-slate-200">
                      <strong>Skip</strong> duplicate events
                    </span>
                  </label>
                </div>
              </div>

              {/* Validation Warnings (Non-blocking) */}
              {bulkValidationErrors.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <AlertCircle size={15} />
                    <span>Import Notice ({bulkValidationErrors.length})</span>
                  </div>
                  {bulkValidationErrors.slice(0, 4).map((err, i) => (
                    <div key={i} className="text-[11px] text-amber-200/90 pl-5">
                      • {err}
                    </div>
                  ))}
                  {bulkValidationErrors.length > 4 && (
                    <div className="text-[11px] text-amber-400 pl-5 font-semibold">
                      + {bulkValidationErrors.length - 4} more notices
                    </div>
                  )}
                </div>
              )}

              {/* Parsed Preview Table */}
              {parsedRows.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <div className="flex items-center gap-2">
                      <span>Ready to Import:</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px]">
                        {duplicateAction === 'skip' ? parsedRows.filter(r => !r.isExisting).length : parsedRows.length} Events
                      </span>
                      {parsedRows.some(r => r.isExisting) && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px]">
                          {parsedRows.filter(r => r.isExisting).length} Existing Codes ({duplicateAction})
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setParsedRows([]);
                        setPastedText('');
                        setBulkValidationErrors([]);
                      }}
                      className="text-slate-400 hover:text-rose-400 text-[11px]"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="overflow-x-auto max-h-56 rounded-2xl border border-slate-800 text-[11px] bg-slate-900 shadow-inner">
                    <table className="w-full text-left">
                      <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800">
                        <tr>
                          <th className="p-2.5">Code</th>
                          <th className="p-2.5">Programme Name</th>
                          <th className="p-2.5">Category</th>
                          <th className="p-2.5">Type & Section</th>
                          <th className="p-2.5">Venue & Timing</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 text-slate-300">
                        {parsedRows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            <td className="p-2.5 font-mono font-bold text-amber-300 whitespace-nowrap">
                              {row.programme_code}
                              {row.isExisting && (
                                <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase">
                                  {duplicateAction}
                                </span>
                              )}
                              {row.autoAssignedCode && (
                                <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 uppercase">
                                  Auto
                                </span>
                              )}
                            </td>
                            <td className="p-2.5">
                              <span className="font-semibold text-white block">{row.programme_name}</span>
                              {row.programme_name_ml && (
                                <span className="text-[10px] text-amber-400/80 font-malayalam block">
                                  {row.programme_name_ml}
                                </span>
                              )}
                            </td>
                            <td className="p-2.5 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 font-bold border border-slate-700">
                                {row.category}
                              </span>
                            </td>
                            <td className="p-2.5 whitespace-nowrap">
                              <span className="capitalize text-slate-300">{row.type.replace('_', ' ')}</span>
                              <span className="text-slate-500 mx-1">•</span>
                              <span className="capitalize text-slate-400">{row.section}</span>
                            </td>
                            <td className="p-2.5 whitespace-nowrap text-slate-400">
                              <span className="text-slate-300 block">{row.venue}</span>
                              <span className="text-[10px] text-slate-500">
                                {row.scheduled_date} {row.scheduled_time}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-2">
              <span className="text-xs text-slate-400">
                {parsedRows.length > 0
                  ? `${parsedRows.length} programmes parsed & ready`
                  : 'Upload a file or paste table data to begin'}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsBulkModalOpen(false);
                    setParsedRows([]);
                    setBulkValidationErrors([]);
                    setPastedText('');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={parsedRows.length === 0}
                  onClick={handleConfirmBulkImport}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  <Check size={15} />
                  <span>
                    Confirm & Import {parsedRows.length > 0 ? `${duplicateAction === 'skip' ? parsedRows.filter(r => !r.isExisting).length : parsedRows.length} Events` : 'Programmes'}
                  </span>
                </button>
              </div>
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
              {deleteModal.mode === 'single' && 'Delete Programme / Event'}
              {deleteModal.mode === 'selected' && `Delete ${deleteModal.count} Selected Programmes`}
              {deleteModal.mode === 'all' && 'Clear All Programmes & Events'}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {deleteModal.mode === 'single' && (
                <>
                  Are you sure you want to permanently delete event{' '}
                  <strong className="text-white">{deleteModal.programme?.programme_name}</strong>{' '}
                  (<span className="text-amber-300 font-mono font-bold">{deleteModal.programme?.programme_code}</span>,{' '}
                  Category: <span className="uppercase text-amber-300 font-bold">{deleteModal.programme?.category}</span>)?
                  <br />
                  <span className="text-rose-400/90 text-[11px] block mt-1">
                    * This will remove participant allocations and judge evaluations for this event.
                  </span>
                </>
              )}
              {deleteModal.mode === 'selected' && (
                <>
                  Are you sure you want to permanently delete{' '}
                  <strong className="text-white">{deleteModal.count} selected programmes</strong>?
                  <br />
                  <span className="text-rose-400/90 text-[11px] block mt-1">
                    * Related participant calls and scores will be cleaned up safely.
                  </span>
                </>
              )}
              {deleteModal.mode === 'all' && (
                <>
                  <strong className="text-rose-400 block font-bold text-sm mb-1">
                    ⚠️ Permanent Action: Clear All Programmes
                  </strong>
                  Are you sure you want to delete <strong className="text-white">ALL {programmes.length} programmes</strong>?
                  This action will purge the schedule, stage calls, and all results.
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
                  if (deleteModal.mode === 'single' && deleteModal.programme) {
                    deleteProgramme(deleteModal.programme.id);
                    setSelectedIds(prev => {
                      const next = new Set(prev);
                      next.delete(deleteModal.programme!.id);
                      return next;
                    });
                  } else if (deleteModal.mode === 'selected') {
                    deleteMultipleProgrammes(Array.from(selectedIds));
                    setSelectedIds(new Set());
                  } else if (deleteModal.mode === 'all') {
                    deleteAllProgrammes();
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
